# 📧 Email 配置说明

## ⚠️ 重要：前端配置 vs 服务器端配置

BrieflyAI 有两套独立的邮件配置系统：

### 1. 前端配置（浏览器内）

- **位置**：浏览器 localStorage
- **用途**：在浏览器内手动点击"同步实时情报"时发送邮件
- **限制**：需要浏览器标签页保持打开
- **配置位置**：应用设置面板 → "决策情报分发通道 (Email)"

### 2. 服务器端配置（后台自动）

- **位置**：服务器项目的 `.env` 文件
- **用途**：服务器端定时邮件服务自动发送（无需浏览器打开）
- **优势**：关闭浏览器后仍可自动发送
- **配置位置**：服务器项目根目录的 `.env` 文件

## 🔄 如何同步配置

### 方法 1：使用"导出到 .env"功能（推荐）

1. 在应用设置面板中配置好 EmailJS 信息
2. 点击"导出到 .env"按钮
3. 配置会自动复制到剪贴板
4. 在服务器上，将内容粘贴到 `.env` 文件中
5. 重启定时邮件服务：
   ```bash
   docker-compose restart briefly-ai-scheduler
   ```

### 方法 2：手动配置 .env 文件

在服务器项目根目录创建或编辑 `.env` 文件：

```env
# Gemini API Key
API_KEY=你的_GEMINI_API_KEY

# EmailJS 配置（用于服务器端定时邮件）
EMAIL_RECIPIENT=你的邮箱@example.com
EMAILJS_SERVICE_ID=你的_Service_ID
EMAILJS_TEMPLATE_ID=你的_Template_ID
EMAILJS_PUBLIC_KEY=你的_Public_Key

# 定时时间（格式：HH:mm，默认 09:00）
SCHEDULE_TIME=09:00
```

## ✅ 验证配置

### 检查前端配置

1. 打开浏览器开发者工具（F12）
2. 在 Console 中输入：
   ```javascript
   JSON.parse(localStorage.getItem('b_prefs'))
   ```
3. 检查 `emailRecipient`、`emailJsServiceId` 等字段是否正确

### 检查服务器端配置

1. 查看定时邮件服务日志：
   ```bash
   docker logs briefly-ai-scheduler
   ```
2. 应该看到：
   ```
   ✅ 定时邮件服务已启动，等待执行时间...
   - 收件人: 你的邮箱@example.com
   ```
3. 如果看到 `❌ 邮件配置不完整`，说明 `.env` 文件配置有误

## 🐛 常见问题

### 问题 1：前端配置了，但关闭浏览器后无法自动发送

**原因**：前端配置只对浏览器内有效，服务器端需要单独配置 `.env` 文件。

**解决方案**：
1. 使用"导出到 .env"功能将配置同步到服务器
2. 或手动编辑服务器的 `.env` 文件
3. 重启服务：`docker-compose restart briefly-ai-scheduler`

### 问题 2：服务器端配置了，但定时邮件没有发送

**检查步骤**：
1. 查看服务日志：
   ```bash
   docker logs briefly-ai-scheduler --tail 100
   ```
2. 检查服务是否运行：
   ```bash
   docker-compose ps
   ```
3. 检查 `.env` 文件是否正确：
   ```bash
   cat .env
   ```
4. 检查定时时间是否已到（服务器端使用服务器时区）

### 问题 3：配置已更新，但服务仍使用旧配置

**解决方案**：
1. 重启服务：
   ```bash
   docker-compose restart briefly-ai-scheduler
   ```
2. 如果还不行，强制重建：
   ```bash
   docker-compose up -d --force-recreate briefly-ai-scheduler
   ```

## 📝 配置示例

### 完整的 .env 文件示例

```env
# Gemini API Key
API_KEY=AIzaSyBRRawyGGaNnZMEVOtx1uXLDM91R1E8E54

# EmailJS 配置
EMAIL_RECIPIENT=lsc6866@gmail.com
EMAILJS_SERVICE_ID=service_h4yma5p
EMAILJS_TEMPLATE_ID=template_x8j3j4o
EMAILJS_PUBLIC_KEY=dMV9aIkb6_59-Jrc-

# 定时时间（每天 07:00 发送）
SCHEDULE_TIME=07:00
```

## 🎯 最佳实践

1. **首次配置**：
   - 先在应用设置面板配置好 EmailJS 信息
   - 测试前端手动发送是否正常
   - 然后使用"导出到 .env"功能同步到服务器

2. **更新配置**：
   - 修改前端配置后，记得同步到服务器的 `.env` 文件
   - 修改 `.env` 后，记得重启服务

3. **验证配置**：
   - 定期检查服务日志，确保定时任务正常运行
   - 检查邮件是否按时收到

## 💡 提示

- 前端配置和服务器端配置可以不同（例如不同的收件人）
- 服务器端定时邮件使用服务器时区，注意时区差异
- 如果服务器在中国，建议使用 `Asia/Shanghai` 时区
