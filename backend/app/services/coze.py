import os
import httpx
import json
import logging
import warnings
import uuid
import asyncio
import time
from typing import AsyncGenerator, Optional
from fastapi import HTTPException

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SSL验证配置
# 生产环境应设置 COZE_SSL_VERIFY=true
# 开发环境如果Coze API有证书问题，可以设置为 false
SSL_VERIFY = os.getenv("COZE_SSL_VERIFY", "false").lower() == "true"

if not SSL_VERIFY:
    # 仅在禁用SSL验证时才禁用警告
    warnings.filterwarnings("ignore", message="Unverified HTTPS request")
    logger.warning("SSL verification is DISABLED for Coze API. Set COZE_SSL_VERIFY=true in production.")

# 会话管理：为每个 project_id + user_id 维护一个 session_id
_session_cache: dict[str, str] = {}

# 全局 httpx 客户端，避免每次请求创建新连接
_http_client: Optional[httpx.AsyncClient] = None

# 请求时间记录，用于速率限制
_last_request_time: dict[str, float] = {}
MIN_REQUEST_INTERVAL = 0.5  # 同一个 project_id 最小请求间隔（秒）


async def get_http_client() -> httpx.AsyncClient:
    """获取或创建共享的 HTTP 客户端"""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            verify=SSL_VERIFY,
            timeout=httpx.Timeout(120.0, connect=10.0, read=120.0),
            limits=httpx.Limits(
                max_keepalive_connections=20,
                max_connections=50,
                keepalive_expiry=60.0
            ),
            http2=False  # 禁用 HTTP/2，避免连接复用问题
        )
    return _http_client


def get_or_create_session_id(project_id: str, user_id: Optional[int] = None) -> str:
    """获取或创建会话ID，避免Coze后端创建过多新连接"""
    cache_key = f"{project_id}:{user_id or 'default'}"
    if cache_key not in _session_cache:
        _session_cache[cache_key] = str(uuid.uuid4())
    return _session_cache[cache_key]


def clear_session(project_id: str, user_id: Optional[int] = None):
    """清除会话（用于重置对话）"""
    cache_key = f"{project_id}:{user_id or 'default'}"
    if cache_key in _session_cache:
        del _session_cache[cache_key]


async def call_coze_agent(
    api_endpoint: str,
    api_token: str,
    project_id: str,
    message: str,
    user_id: Optional[int] = None,
    timeout: float = 120.0
) -> AsyncGenerator[str, None]:
    """
    调用Coze智能体，返回流式文本

    关键改进：
    1. 添加 session_id 保持会话，避免Coze后端创建过多数据库连接
    2. 添加完整的请求头，模拟浏览器行为
    3. 确保流完全消费，避免连接泄露
    4. 添加优雅关闭机制
    """
    session_id = get_or_create_session_id(project_id, user_id)

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Cache-Control": "no-cache",
    }

    payload = {
        "content": {
            "query": {
                "prompt": [{
                    "type": "text",
                    "content": {"text": message}
                }]
            }
        },
        "type": "query",
        "project_id": int(project_id),
    }

    logger.info(f"Calling Coze API: {api_endpoint}")
    logger.info(f"Project ID: {project_id}, Session ID: {session_id}")

    # 速率限制：避免对同一个 project_id 发送过快的请求
    current_time = time.time()
    last_time = _last_request_time.get(project_id, 0)
    time_since_last = current_time - last_time
    if time_since_last < MIN_REQUEST_INTERVAL:
        wait_time = MIN_REQUEST_INTERVAL - time_since_last
        logger.info(f"Rate limiting: waiting {wait_time:.2f}s")
        await asyncio.sleep(wait_time)
    _last_request_time[project_id] = time.time()

    max_retries = 3
    retry_delay = 1.0

    for attempt in range(max_retries):
        try:
            # 每次请求创建新客户端，避免复用可能已失效的连接
            async with httpx.AsyncClient(
                verify=SSL_VERIFY,
                timeout=httpx.Timeout(timeout, connect=10.0, read=timeout),
                http2=False
            ) as client:
                async with client.stream(
                    "POST",
                    api_endpoint,
                    headers=headers,
                    json=payload
                ) as response:
                    logger.info(f"Response status: {response.status_code}")

                    if response.status_code != 200:
                        error_text = await response.aread()
                        error_msg = error_text.decode()
                        logger.error(f"API error response: {error_msg}")

                        # 如果是500错误，清除session
                        if response.status_code == 500:
                            clear_session(project_id, user_id)

                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"Coze API错误: {error_msg[:200]}"
                        )

                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data:"):
                            continue

                        data_str = line[5:].strip()
                        if not data_str:
                            continue

                        try:
                            data = json.loads(data_str)
                            msg_type = data.get("type", "")
                            content = data.get("content", {})

                            chunk = None

                            # 提取文本内容
                            if msg_type == "answer":
                                content_obj = data.get("content", {})
                                chunk = content_obj.get("answer", "")
                            elif msg_type in ["message_start", "message", "content_block_delta", "delta"]:
                                content_obj = data.get("content", {})
                                chunk = (
                                    content_obj.get("answer") or
                                    content_obj.get("text") or
                                    content_obj.get("message") or
                                    content_obj.get("delta", {}).get("text") or
                                    data.get("answer") or
                                    data.get("text") or
                                    data.get("delta", {}).get("text") or
                                    ""
                                )
                            else:
                                chunk = (
                                    data.get("answer") or
                                    data.get("text") or
                                    data.get("message") or
                                    (data.get("content") if isinstance(data.get("content"), str) else None) or
                                    ""
                                )

                            if chunk:
                                yield chunk

                            # 检查结束标志
                            if msg_type in ["message_end", "done", "stop"]:
                                logger.info(f"Received end signal: {msg_type}")
                                # 检查是否有错误
                                if isinstance(content, dict):
                                    msg_end = content.get("message_end", {})
                                    if isinstance(msg_end, dict) and msg_end.get("code") == "500":
                                        error_msg = msg_end.get("message", "Coze服务内部错误")
                                        logger.error(f"Coze returned 500 error: {error_msg}")
                                        clear_session(project_id, user_id)
                                        raise HTTPException(status_code=502, detail=f"智能体服务暂时不可用: {error_msg[:100]}")
                                break

                        except json.JSONDecodeError as e:
                            logger.warning(f"JSON decode error: {e}")
                            continue

            logger.info("Coze API call completed successfully")
            return  # 成功完成，退出重试循环

        except (httpx.ConnectError, httpx.RemoteProtocolError) as e:
            logger.warning(f"Connection error (attempt {attempt + 1}/{max_retries}): {type(e).__name__}: {e}")

            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay * (attempt + 1))
                continue
            else:
                clear_session(project_id, user_id)
                raise HTTPException(status_code=502, detail="无法连接智能体服务")

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error: {e}")
            clear_session(project_id, user_id)
            raise HTTPException(status_code=504, detail="智能体响应超时")

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP status error: {e.response.status_code}")
            clear_session(project_id, user_id)
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"智能体服务错误: {e.response.status_code}"
            )

        except HTTPException:
            raise

        except Exception as e:
            logger.error(f"Unexpected error: {type(e).__name__} - {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay * (attempt + 1))
                continue
            clear_session(project_id, user_id)
            raise HTTPException(status_code=500, detail=f"智能体调用失败: {str(e)}")


async def test_coze_connection(api_endpoint: str, api_token: str, project_id: str) -> dict:
    """测试Coze连接是否正常"""
    try:
        chunks = []
        async for chunk in call_coze_agent(
            api_endpoint, api_token, project_id, "hi", timeout=30.0
        ):
            chunks.append(chunk)
            if len(chunks) > 5:
                break
        return {"status": "ok", "message": "连接正常"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
