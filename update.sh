#!/bin/bash
# BrieflyAI 服务器更新脚本

set -e  # 遇到错误立即退出

echo "🔄 开始更新 BrieflyAI..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 停止服务
echo "⏹️  停止服务..."
docker-compose down

# 拉取最新代码
echo "📥 拉取最新代码..."
git fetch origin
git pull origin main

# 检查是否有更新
if [ $? -eq 0 ]; then
    echo "✅ 代码已更新"
else
    echo "⚠️  代码可能已是最新，继续构建..."
fi

# 重新构建（不使用缓存）
echo "🔨 重新构建镜像（不使用缓存）..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
sleep 5

# 查看状态
echo ""
echo "📊 服务状态："
docker-compose ps

echo ""
echo "📋 查看日志（Ctrl+C 退出）："
echo "   docker-compose logs -f"
echo ""
echo "✅ 更新完成！"
echo "🌐 访问地址：http://你的服务器IP:9527"
echo ""
echo "💡 提示：如果功能还是旧的，请："
echo "   1. 强制刷新浏览器（Ctrl+F5）"
echo "   2. 清除浏览器缓存"
echo "   3. 检查 docker-compose ps 确认容器已重启"
