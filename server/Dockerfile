############################################################
# 构建阶段
# ⚠️ 重要：必须先配置 Docker 镜像加速器才能拉取镜像
# 配置方法：Docker Desktop -> Settings -> Docker Engine -> 添加 registry-mirrors
############################################################
FROM node:22-alpine AS builder

WORKDIR /app

# 配置 npm 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package 文件
COPY package.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

############################################################
# 运行阶段
# ⚠️ 重要：必须先配置 Docker 镜像加速器才能拉取镜像
# 配置方法：Docker Desktop -> Settings -> Docker Engine -> 添加 registry-mirrors
############################################################
FROM node:22-alpine

WORKDIR /app

# 配置 npm 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package 文件
COPY package.json ./

# 只安装生产依赖（使用 --omit=dev 代替已废弃的 --only=production）
RUN npm install --omit=dev

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 健康检查
HEALTHCHECK --interval=60s --timeout=10s --retries=3 \
  CMD node -e "console.log('OK')" || exit 1

CMD ["node", "dist/index.js"]
