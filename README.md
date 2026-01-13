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
- **AI Engine**: Google Gemini 3.0 Pro & Flash (含 Thinking Mode 思考模型)。
- **Push Engine**: EmailJS + Media Webhooks。
- **Containerization**: Docker + Nginx (生产级静态托管)。

---

## 📦 快速部署 (Deployment)

### 1. 环境变量准备
在项目根目录创建 `.env` 文件：
```env
API_KEY=你的_GEMINI_API_KEY
```

### 2. 使用 Docker 一键拉起
我们预设了默认端口 **`9527`**，以避免常见的端口冲突：
```bash
docker-compose up -d --build
```

部署完成后，通过浏览器访问：`http://localhost:9527`

---

## ⚙️ 自动化配置说明

在应用的“自动化决策配置”面板中，你可以：
1. **自定义情报源**：输入你关注的垂直领域域名，AI 将深度监听这些站点的信号。
2. **设定推送时间**：精确到分钟的每日推送计划。
3. **配置分发通道**：填入 Bark Key 或 EmailJS 凭据，即可打通情报的“最后一公里”。

---

## 📜 许可证 (License)

本项目基于 [MIT License](LICENSE) 协议开源。

---

> **BrieflyAI** - 在噪音爆炸的时代，为你构筑专业的情报防火墙。
