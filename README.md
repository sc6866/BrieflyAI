# 🧭 BrieflyAI - 全球情报决策终端 (Pro Edition)

> **降噪、穿透、获益。** 这是一个为专业信息采集者与决策者设计的生产级 AI 情报汇总应用。

[![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker&logoColor=white)](./docker-compose.yml)
[![AI-Powered](https://img.shields.io/badge/Engine-Gemini_3.0_Pro-orange?logo=google-gemini)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

BrieflyAI 不仅仅是一个新闻聚合器，它是一个基于 **Google Gemini 3.0** 构建的自动化情报流水线。它能每天扫描全球海量资讯，通过 AI 智能降噪算法，过滤掉 99% 的垃圾信息，只为你留下最核心的商业逻辑与趋势信号。

---

## 🚀 核心功能 (Core Features)

- **🔍 全球情报深度扫描**：覆盖 AI 趋势、舆情分析、Github 热门、自媒体选题、实用工具、信息差盈利等 6 大核心维度。
- **🌪️ 智能降噪与降维**：利用 Gemini 3.0 Flash 毫秒级提取海量网页核心摘要，剔除娱乐花边，直击商业本质。
- **🔥 流量雷达 (Trend Pulse)**：实时穿透 Douyin/TikTok 热榜，拆解爆款背后的变现逻辑与流量密码。
- **📬 自动化分发矩阵**：
    - **Email 推送**：生成生产级 HTML 精美邮件报告。
    - **移动端通知**：支持 Bark (iOS)、Webhook (飞书/钉钉/企业微信) 实时触达。
    - **定时任务**：内置 Cron 逻辑，每天准时在你的手机上“晨报”情报。
- **📄 文档自动化**：支持一键导出生产级 Word/Google Docs 格式的决策研判报告。
- **🎙️ 语音简报**：内置 Gemini TTS 引擎，支持将情报汇总转化为高质量的人声播报（Kore 语音）。

---

## 🛠️ 技术架构 (Tech Stack)

- **Frontend**: React 19 + Tailwind CSS (极致响应式暗色 UI)。
- **Backend**: Node.js + TypeScript (定时任务调度服务)。
- **AI Engine**: Google Gemini 3.0 Pro & Flash (含 Thinking Mode 思考模型)。
- **Push Engine**: EmailJS + Media Webhooks。
- **Scheduler**: node-cron (Cron 定时任务)。
- **Containerization**: Docker + Nginx (生产级静态托管)。

---

## 📦 快速部署 (Deployment)

### 1. 环境变量准备
在项目根目录创建 `.env` 文件：
```env
# Gemini API Key（必需）
API_KEY=你的_GEMINI_API_KEY

# 服务器端定时邮件配置（可选，如需定时邮件功能）
EMAIL_RECIPIENT=收件人邮箱@example.com
EMAILJS_SERVICE_ID=你的_EmailJS_Service_ID
EMAILJS_TEMPLATE_ID=你的_EmailJS_Template_ID
EMAILJS_PUBLIC_KEY=你的_EmailJS_Public_Key
SCHEDULE_TIME=09:00  # 定时时间，格式：HH:mm，默认 09:00
```

### 2. 使用 Docker 一键拉起

#### 如果遇到 Docker Hub 连接问题（网络问题）

**方案 A：使用国内镜像源版本（推荐，最简单）**
```bash
docker-compose -f docker-compose.cn.yml up -d --build
```

**方案 B：配置 Docker 镜像加速器**
1. 打开 Docker Desktop → Settings → Docker Engine
2. 添加镜像加速器配置（参考 `docker-daemon.json.example`）
3. 重启 Docker Desktop
4. 然后运行：
```bash
docker-compose up -d --build
```

#### 正常情况（网络正常）
我们预设了默认端口 **`9527`**，以避免常见的端口冲突：
```bash
docker-compose up -d --build
```

部署完成后：
- **前端应用**：通过浏览器访问 `http://localhost:9527`
- **定时邮件服务**：自动在后台运行，每天定时发送邮件

### 3. 查看服务状态
```bash
# 查看所有服务状态
docker-compose ps

# 查看定时邮件服务日志
docker logs briefly-ai-scheduler -f

# 查看前端服务日志
docker logs briefly-ai-pro -f
```

---

## ⚙️ 自动化配置说明

### 前端配置（浏览器端）
在应用的"自动化决策配置"面板中，你可以：
1. **自定义情报源**：输入你关注的垂直领域域名，AI 将深度监听这些站点的信号。
2. **设定推送时间**：精确到分钟的每日推送计划（需要保持浏览器标签页打开）。
3. **配置分发通道**：
   - **EmailJS 邮件推送**：
     1. 访问 [EmailJS](https://www.emailjs.com/) 注册账号
     2. 创建 Email Service（支持 Gmail、Outlook 等）
     3. 创建 Email Template，模板变量包括：`{{to_email}}`、`{{subject}}`、`{{date}}`、`{{message_html}}`
     4. 在设置面板填入：
        - **Service ID**：你的 Email Service ID
        - **Template ID**：你的 Email Template ID
        - **Public Key**：你的 EmailJS Public Key（在 Account > API Keys 中获取）
        - **Email Recipient**：收件人邮箱地址
   - **Bark 推送**：填入 Bark Key 即可接收 iOS 推送通知
   - **Webhook**：支持飞书、钉钉、企业微信等自定义 Webhook URL

### 服务器端定时邮件（推荐）⭐
**无需保持浏览器打开，真正的后台自动发送！**

1. **配置 EmailJS**（同上）
2. **在 `.env` 文件中配置**：
   ```env
   EMAIL_RECIPIENT=收件人邮箱@example.com
   EMAILJS_SERVICE_ID=你的_EmailJS_Service_ID
   EMAILJS_TEMPLATE_ID=你的_EmailJS_Template_ID
   EMAILJS_PUBLIC_KEY=你的_EmailJS_Public_Key
   SCHEDULE_TIME=09:00  # 每天 9:00 发送，可自定义
   ```
3. **重启服务**：
   ```bash
   docker-compose restart briefly-ai-scheduler
   ```

服务器端定时邮件服务会在后台持续运行，每天自动生成简报并发送邮件，无需人工干预。

---

## 📜 许可证 (License)

本项目基于 [MIT License](LICENSE) 协议开源。

---

> **BrieflyAI** - 在噪音爆炸的时代，为你构筑专业的情报防火墙。
