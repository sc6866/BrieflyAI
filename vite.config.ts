import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 优先从环境变量读取（Docker 构建时），其次从 .env 文件读取（本地开发时）
    const env = loadEnv(mode, '.', '');
    let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY || '';
    
    // 清理 API Key：去除空白字符、引号、换行符等，确保只包含 ASCII 字符
    if (apiKey) {
      apiKey = apiKey.trim()
        .replace(/^["']|["']$/g, '') // 去除首尾引号
        .replace(/\r?\n/g, '') // 去除换行符
        .replace(/\s+/g, ''); // 去除所有空白字符
      
      // 验证只包含 ASCII 字符
      if (!/^[\x00-\x7F]*$/.test(apiKey)) {
        console.warn("⚠️ API Key 包含非 ASCII 字符，已自动清理");
        apiKey = apiKey.replace(/[^\x00-\x7F]/g, '');
      }
      
      // 调试信息：显示 API Key 的前10个字符（用于验证是否正确读取）
      if (apiKey.length > 0) {
        console.log(`✅ API Key 已读取，长度: ${apiKey.length}, 前缀: ${apiKey.substring(0, 10)}...`);
      } else {
        console.warn("⚠️ API Key 为空，请检查环境变量配置");
      }
    } else {
      console.warn("⚠️ 未找到 API Key，请检查环境变量或 .env 文件");
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 注入到 process.env（Node.js 环境）
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        // 注入到 import.meta.env（Vite 环境）
        'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
