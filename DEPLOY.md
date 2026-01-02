# Luna AI Platform 部署指南

## 一、购买服务器

### 腾讯云轻量应用服务器（推荐）
- 地址：https://cloud.tencent.com/product/lighthouse
- 配置：2核2G，50GB SSD，5M带宽
- 价格：约 50-70元/月（首年优惠更便宜）
- 系统：选择 **Ubuntu 22.04**

### 阿里云轻量应用服务器
- 地址：https://www.aliyun.com/product/swas
- 配置：2核2G，50GB SSD，5M带宽
- 价格：约 50-70元/月
- 系统：选择 **Ubuntu 22.04**

---

## 二、服务器初始化

### 1. 连接服务器
```bash
# 使用SSH连接（替换为你的服务器IP）
ssh root@你的服务器IP
```

### 2. 安装必要软件
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 Nginx
apt install -y nginx

# 安装 Git
apt install -y git

# 安装 Supervisor（进程管理）
apt install -y supervisor
```

---

## 三、部署后端

### 1. 克隆代码
```bash
cd /opt
git clone https://github.com/survivor2829/luna-ai-platform.git
cd luna-ai-platform
```

### 2. 配置后端环境
```bash
cd backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建环境变量文件
cp .env.example .env
nano .env
```

### 3. 编辑 .env 文件
```bash
# 生成安全的JWT密钥
JWT_SECRET_KEY=你的安全密钥（用 openssl rand -hex 32 生成）

# 设置管理员密码
ADMIN_DEFAULT_PASSWORD=你的强密码

# 数据库（默认SQLite即可）
DATABASE_URL=sqlite:///./luna_ai.db

# SSL验证（如果Coze有问题就设为false）
COZE_SSL_VERIFY=false
```

### 4. 测试后端
```bash
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# 访问 http://你的IP:8000/health 测试
# Ctrl+C 停止
```

### 5. 配置 Supervisor 管理后端进程
```bash
nano /etc/supervisor/conf.d/luna-backend.conf
```

写入以下内容：
```ini
[program:luna-backend]
directory=/opt/luna-ai-platform/backend
command=/opt/luna-ai-platform/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/luna-backend.err.log
stdout_logfile=/var/log/luna-backend.out.log
environment=PATH="/opt/luna-ai-platform/backend/venv/bin"
```

启动服务：
```bash
supervisorctl reread
supervisorctl update
supervisorctl start luna-backend
supervisorctl status
```

---

## 四、部署前端

### 1. 修改前端API地址
```bash
cd /opt/luna-ai-platform/frontend

# 编辑 API 配置
nano src/services/api.js
```

将第一行改为：
```javascript
const API_BASE = "/api"  // 改为相对路径，由Nginx代理
```

### 2. 构建前端
```bash
npm install
npm run build
```

### 3. 复制构建文件到Nginx目录
```bash
cp -r dist/* /var/www/html/
```

---

## 五、配置 Nginx

### 1. 编辑 Nginx 配置
```bash
nano /etc/nginx/sites-available/default
```

替换为以下内容：
```nginx
server {
    listen 80;
    server_name _;  # 替换为你的域名，没有域名就用 _

    # 前端静态文件
    root /var/www/html;
    index index.html;

    # 前端路由（SPA支持）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # SSE支持（聊天流式响应）
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```

### 2. 测试并重启 Nginx
```bash
nginx -t
systemctl restart nginx
```

---

## 六、开放防火墙端口

### 腾讯云/阿里云控制台
1. 进入服务器控制台
2. 找到「安全组」或「防火墙」
3. 添加规则：允许 **80端口**（HTTP）
4. 如果要HTTPS，还需开放 **443端口**

---

## 七、访问测试

在浏览器访问：
```
http://你的服务器IP
```

应该能看到 Luna AI 首页！

---

## 八、可选：配置域名和HTTPS

### 1. 购买域名
- 腾讯云：https://dnspod.cloud.tencent.com/
- 阿里云：https://wanwang.aliyun.com/domain

### 2. 域名解析
添加 A 记录，指向你的服务器IP

### 3. 申请免费SSL证书（HTTPS）
```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
certbot --nginx -d 你的域名.com
```

---

## 常用命令

```bash
# 查看后端日志
tail -f /var/log/luna-backend.out.log

# 重启后端
supervisorctl restart luna-backend

# 重启Nginx
systemctl restart nginx

# 更新代码
cd /opt/luna-ai-platform
git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install && npm run build && cp -r dist/* /var/www/html/
supervisorctl restart luna-backend
```

---

## 遇到问题？

1. **访问不了？** 检查防火墙/安全组是否开放80端口
2. **API报错？** 查看 `/var/log/luna-backend.err.log`
3. **页面空白？** 检查 Nginx 配置和前端构建

