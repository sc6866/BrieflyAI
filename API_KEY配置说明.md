# 🔑 API Key 配置说明

## ⚠️ 重要提示

**API Key 必须只包含 ASCII 字符**（字母、数字和基本符号），不能包含：
- ❌ 中文字符
- ❌ 特殊 Unicode 字符
- ❌ 换行符
- ❌ 多余的空格
- ❌ 引号（除非是字符串的一部分）

## ✅ 正确的 API Key 格式

```
AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

- 只包含字母（A-Z, a-z）、数字（0-9）和基本符号（如 `-`, `_`）
- 没有空格
- 没有换行符
- 没有引号

## 🔍 如何检查你的 API Key

### 方法 1：查看 .env 文件

打开 `.env` 文件，检查 `API_KEY` 行：

```env
# ✅ 正确
API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567

# ❌ 错误示例
API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"  # 包含引号
API_KEY=AIzaSy 你的密钥 1234567  # 包含中文
API_KEY=AIzaSy\n1234567  # 包含换行符
```

### 方法 2：使用代码验证

代码已自动清理 API Key，但最好确保源文件正确。

## 🛠️ 修复方法

### 如果 API Key 包含非 ASCII 字符

1. **打开 `.env` 文件**
2. **找到 `API_KEY=` 行**
3. **确保值只包含 ASCII 字符**：
   - 去除所有引号
   - 去除所有空格
   - 去除所有换行符
   - 去除所有中文或特殊字符

4. **保存文件**
5. **重新构建**：
   ```powershell
   docker-compose build brieflyai
   docker-compose up -d brieflyai
   ```

## 📝 示例：清理 API Key

### 错误的 API Key
```env
API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"
API_KEY=AIzaSy 你的密钥 1234567
API_KEY=AIzaSy
1234567
```

### 正确的 API Key
```env
API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

## 🔄 自动清理功能

代码已添加自动清理功能：
- ✅ 自动去除首尾空白字符
- ✅ 自动去除引号
- ✅ 自动去除换行符
- ✅ 自动去除非 ASCII 字符

**但建议在源文件中就保持正确的格式**，避免潜在问题。

## 💡 获取新的 API Key

如果 API Key 有问题，可以：

1. 访问 https://aistudio.google.com/app/apikey
2. 创建新的 API Key
3. 复制时确保只复制密钥本身，不要包含引号或空格
4. 更新 `.env` 文件

## ✅ 验证配置

构建时会显示警告（如果检测到非 ASCII 字符）：
```
⚠️ API Key 包含非 ASCII 字符，已自动清理
```

如果看到这个警告，说明 API Key 需要清理。
