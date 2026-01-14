# ⚠️ 部署前必读：Docker 镜像加速器配置

## 问题说明

由于网络限制，直接访问 Docker Hub 可能会失败。**必须先配置 Docker 镜像加速器**才能成功构建。

## 快速配置（3 分钟）

### Windows Docker Desktop

1. **打开 Docker Desktop**
2. **点击右上角设置图标 ⚙️**（或右键系统托盘图标 → Settings）
3. **进入 "Docker Engine" 标签页**
4. **在 JSON 配置中添加以下内容**：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

5. **点击 "Apply & Restart"** 按钮
6. **等待 Docker Desktop 重启完成**（约 30 秒）

### 使用 PowerShell 脚本（推荐）

运行项目根目录下的配置助手：

```powershell
.\setup-docker-mirror.ps1
```

脚本会自动：
- 检查 Docker 状态
- 显示配置步骤
- 测试镜像拉取

## 验证配置

配置完成后，运行以下命令验证：

```powershell
# 查看镜像加速器配置
docker info | Select-String "Registry Mirrors"

# 测试拉取镜像
docker pull node:22-alpine
```

如果 `docker pull` 成功，说明配置正确。

## 然后构建项目

```powershell
# 确保已创建 .env 文件（至少包含 API_KEY）
docker-compose up -d --build
```

## 如果仍然失败

1. **检查网络**：确保可以访问互联网
2. **尝试其他镜像源**：在配置中只保留一个镜像源测试
3. **使用代理/VPN**：在 Docker Desktop 设置中配置代理
4. **检查防火墙**：确保防火墙未阻止 Docker

## 常见问题

### Q: 配置后仍然无法拉取镜像？
A: 尝试只保留一个镜像源，或使用 VPN/代理。

### Q: Docker Desktop 设置在哪里？
A: 右键系统托盘（任务栏右下角）的 Docker 图标 → Settings。

### Q: 配置后需要重启吗？
A: 是的，点击 "Apply & Restart" 后会自动重启。

## 下一步

配置完成后，继续阅读主 README.md 进行部署。
