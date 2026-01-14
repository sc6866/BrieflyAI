# BrieflyAI 服务器端定时邮件服务

这是 BrieflyAI 的服务器端定时邮件发送服务，可以在后台自动生成简报并发送邮件。

## 功能特性

- ✅ 基于 Cron 的定时任务调度
- ✅ 自动生成 AI 简报
- ✅ 通过 EmailJS 发送精美 HTML 邮件
- ✅ Docker 容器化部署
- ✅ 支持环境变量配置

## 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# Gemini API Key（必需）
API_KEY=你的_GEMINI_API_KEY

# EmailJS 配置（必需）
EMAIL_RECIPIENT=收件人邮箱@example.com
EMAILJS_SERVICE_ID=你的_EmailJS_Service_ID
EMAILJS_TEMPLATE_ID=你的_EmailJS_Template_ID
EMAILJS_PUBLIC_KEY=你的_EmailJS_Public_Key

# 定时时间（可选，默认 09:00，格式：HH:mm）
SCHEDULE_TIME=09:00
```

## 本地开发

```bash
cd server
npm install
npm run dev
```

## Docker 部署

使用 docker-compose 一键部署（包含前端和后端）：

```bash
docker-compose up -d --build
```

查看日志：

```bash
docker logs briefly-ai-scheduler -f
```

## EmailJS Template 变量

在 EmailJS 模板中使用以下变量：

- `{{to_email}}` - 收件人邮箱
- `{{subject}}` - 邮件主题
- `{{date}}` - 简报日期
- `{{message_html}}` - HTML 格式的简报内容
