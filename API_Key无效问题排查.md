# 🔍 API Key 无效问题排查

## 错误信息

```
API key not valid. Please pass a valid API key.
```

## ✅ 已确认

- ✅ API Key 已正确读取（构建日志显示：长度 39，前缀 AIzaSyBRRa...）
- ✅ API Key 格式正确（39 字符，符合 Gemini API Key 格式）
- ✅ API Key 已正确注入到前端代码

## 🔍 可能的原因

### 1. API Key 无效或已过期

**检查方法**：
1. 访问 https://aistudio.google.com/app/apikey
2. 确认 API Key 状态是否为 "Active"
3. 如果已过期或被撤销，创建新的 API Key

### 2. API Key 权限不足

**Gemini API 需要开启的功能**：
- ✅ **Google Search** 功能（必需）
  - 访问 https://aistudio.google.com/
  - 进入 API Key 设置
  - 确认已开启 "Google Search" 功能

### 3. API Key 配额已用完

**检查方法**：
1. 访问 https://aistudio.google.com/
2. 查看 API 使用情况
3. 确认是否有剩余配额

### 4. API Key 区域限制

某些 API Key 可能有区域限制，确保：
- 网络可以访问 `generativelanguage.googleapis.com`
- 没有 VPN 或代理导致的问题

## 🛠️ 解决步骤

### 步骤 1：验证 API Key

在浏览器中直接测试 API Key：

```bash
# 使用 curl 测试（如果有的话）
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=你的_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### 步骤 2：检查 API Key 权限

1. **访问** https://aistudio.google.com/
2. **进入 API Key 管理页面**
3. **确认已开启以下功能**：
   - ✅ Gemini API
   - ✅ Google Search（必需！）

### 步骤 3：创建新的 API Key

如果当前 API Key 有问题：

1. **删除旧的 API Key**（可选）
2. **创建新的 API Key**
3. **更新 `.env` 文件**：
   ```env
   API_KEY=你的新_API_KEY
   ```
4. **重新构建**：
   ```powershell
   docker-compose build brieflyai
   docker-compose up -d brieflyai
   ```

### 步骤 4：检查网络连接

确保可以访问 Gemini API：
- 打开浏览器访问：https://generativelanguage.googleapis.com
- 如果无法访问，可能需要配置代理或 VPN

## 📝 当前配置

你的 API Key：
- 长度：39 字符 ✅
- 前缀：AIzaSy... ✅
- 格式：正确 ✅

## 💡 建议

1. **先检查 API Key 是否有效**：
   - 访问 https://aistudio.google.com/app/apikey
   - 确认 API Key 状态

2. **确认已开启 Google Search**：
   - 这是必需的，否则会返回 400 错误

3. **如果问题持续**：
   - 创建新的 API Key
   - 更新 `.env` 文件
   - 重新构建服务

## 🔗 相关链接

- [Gemini API 文档](https://ai.google.dev/docs)
- [API Key 管理](https://aistudio.google.com/app/apikey)
- [Google Search 功能说明](https://ai.google.dev/docs/gemini_api_overview#google_search)
