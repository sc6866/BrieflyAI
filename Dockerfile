############################################################
# 构建阶段：使用 Node 构建 Vite 前端应用
# ⚠️ 重要：必须先配置 Docker 镜像加速器才能拉取镜像
# 配置方法：Docker Desktop -> Settings -> Docker Engine -> 添加 registry-mirrors
############################################################
FROM node:22-alpine AS builder

# 配置 npm 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 仅复制依赖声明文件，加快 Docker 层缓存命中
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 安装依赖（根据你本地用的包管理器自动适配）
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# 复制剩余代码
COPY . .

# 通过构建参数/环境变量注入 GEMINI_API_KEY
#   推荐在构建时使用：
#   docker build --build-arg GEMINI_API_KEY=$API_KEY -t briefly-ai-pro .
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# 构建生产静态资源
RUN npm run build

############################################################
# 运行阶段：使用 Nginx 提供静态文件服务
# ⚠️ 重要：必须先配置 Docker 镜像加速器才能拉取镜像
# 配置方法：Docker Desktop -> Settings -> Docker Engine -> 添加 registry-mirrors
############################################################
FROM nginx:1.27-alpine

# 覆盖默认配置
COPY nginx.conf /etc/nginx/nginx.conf

# 将构建产物拷贝到 Nginx 默认站点目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# 健康检查（可选）
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

