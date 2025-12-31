import httpx
import json
import logging
import warnings
from typing import AsyncGenerator
from fastapi import HTTPException

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 禁用SSL警告（临时解决方案）
warnings.filterwarnings("ignore", message="Unverified HTTPS request")


async def call_coze_agent(
    api_endpoint: str,
    api_token: str,
    project_id: str,
    message: str
) -> AsyncGenerator[str, None]:
    """
    调用Coze智能体，返回流式文本

    Args:
        api_endpoint: Coze API端点
        api_token: API认证令牌
        project_id: 项目ID
        message: 用户消息

    Yields:
        str: 流式响应的文本片段
    """
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
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
        "project_id": int(project_id)
    }

    logger.info(f"Calling Coze API: {api_endpoint}")
    logger.info(f"Project ID: {project_id}")
    logger.debug(f"Payload: {json.dumps(payload, ensure_ascii=False)}")

    try:
        # 使用 verify=False 跳过SSL验证（临时解决方案）
        async with httpx.AsyncClient(verify=False, timeout=60.0) as client:
            async with client.stream(
                "POST",
                api_endpoint,
                headers=headers,
                json=payload
            ) as response:
                logger.info(f"Response status: {response.status_code}")

                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"API error response: {error_text.decode()}")
                    response.raise_for_status()

                async for line in response.aiter_lines():
                    # 打印每一行原始数据
                    logger.info(f"Raw SSE line: {line[:200] if len(line) > 200 else line}")

                    if line.startswith("data:"):
                        # 处理 "data: " 或 "data:" 两种格式
                        data_str = line[5:].strip()
                        logger.info(f"Data string: {data_str[:200] if len(data_str) > 200 else data_str}")

                        if not data_str:
                            continue

                        try:
                            data = json.loads(data_str)
                            msg_type = data.get("type", "")

                            # 打印完整的data对象以便调试
                            logger.info(f"=== SSE Event ===")
                            logger.info(f"Type: {msg_type}")
                            logger.info(f"Keys: {list(data.keys())}")
                            logger.info(f"Full data: {json.dumps(data, ensure_ascii=False)[:500]}")

                            chunk = None

                            # 方式1: type="answer"
                            if msg_type == "answer":
                                content_obj = data.get("content", {})
                                chunk = content_obj.get("answer", "")
                                if chunk:
                                    logger.info(f"[answer] Found: '{chunk[:100]}'")

                            # 方式2: type="message_start" 或 "message"
                            elif msg_type in ["message_start", "message", "content_block_delta", "delta"]:
                                content_obj = data.get("content", {})
                                # 尝试多个可能的字段
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
                                if chunk:
                                    logger.info(f"[{msg_type}] Found: '{chunk[:100]}'")

                            # 方式3: 直接在根级别查找文本
                            elif not chunk:
                                chunk = (
                                    data.get("answer") or
                                    data.get("text") or
                                    data.get("message") or
                                    data.get("content") if isinstance(data.get("content"), str) else None or
                                    ""
                                )
                                if chunk:
                                    logger.info(f"[root] Found: '{chunk[:100]}'")

                            # 输出找到的内容
                            if chunk:
                                yield chunk

                            # 结束标志
                            if msg_type in ["message_end", "done", "stop"]:
                                logger.info(f"Received end signal: {msg_type}")
                                break

                        except json.JSONDecodeError as e:
                            logger.warning(f"JSON decode error: {e}, line: {line}")
                            continue

        logger.info("Coze API call completed successfully")

    except httpx.ConnectError as e:
        logger.error(f"Connection error: {e}")
        raise HTTPException(
            status_code=502,
            detail="无法连接智能体服务"
        )
    except httpx.TimeoutException as e:
        logger.error(f"Timeout error: {e}")
        raise HTTPException(
            status_code=504,
            detail="智能体响应超时"
        )
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP status error: {e.response.status_code} - {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"智能体服务错误: {e.response.status_code}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__} - {e}")
        raise HTTPException(
            status_code=500,
            detail=f"智能体调用失败: {str(e)}"
        )
