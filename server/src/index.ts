import 'dotenv/config';
import { startScheduler, timeToCron } from './scheduler.js';
import { EmailConfig, CategoryConfig } from './types.js';

// 从环境变量读取配置
const getEmailConfig = (): EmailConfig => {
  const config: EmailConfig = {
    emailRecipient: process.env.EMAIL_RECIPIENT || '',
    emailJsServiceId: process.env.EMAILJS_SERVICE_ID || '',
    emailJsTemplateId: process.env.EMAILJS_TEMPLATE_ID || '',
    emailJsPublicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  };

  // 验证配置
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`⚠️  警告: 以下邮件配置缺失: ${missing.join(', ')}`);
  }

  return config;
};

const getCategoryConfigs = (): CategoryConfig[] => {
  // 默认分类配置，可以从环境变量或配置文件读取
  return [
    { id: 'ai_trends', label: 'AI趋势', urls: ['openai.com', 'anthropic.com', 'deepseek.com', 'jiqizhixin.com'] },
    { id: 'sentiment', label: '舆情分析', urls: ['weibo.com', 'zhihu.com', 'x.com', 'google.com/news'] },
    { id: 'github_hot', label: 'Github热门应用', urls: ['github.com/trending', 'producthunt.com'] },
    { id: 'media_topics', label: '自媒体选题', urls: ['newrank.cn', 'trending.topics', 'douyin.com'] },
    { id: 'util_tools', label: '实用工具', urls: ['appsumo.com', 'futurepedia.io', 'chrome.google.com/webstore'] },
    { id: 'info_gap', label: '信息差盈利', urls: ['reddit.com/r/sidehustle', 'juliang.com', 'tiktok.com'] }
  ];
};

const main = () => {
  console.log('🚀 BrieflyAI 服务器端定时邮件服务启动中...');
  console.log(`[${new Date().toISOString()}] 环境检查:`);
  console.log(`  - API_KEY: ${process.env.API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  
  const emailConfig = getEmailConfig();
  const categoryConfigs = getCategoryConfigs();
  
  // 从环境变量读取定时时间，默认为 09:00
  const scheduleTime = process.env.SCHEDULE_TIME || '09:00';
  const cronExpression = timeToCron(scheduleTime);
  
  console.log(`  - 定时时间: ${scheduleTime} (Cron: ${cronExpression})`);
  console.log(`  - 收件人: ${emailConfig.emailRecipient || '未配置'}`);
  
  // 启动定时任务
  if (emailConfig.emailRecipient && emailConfig.emailJsServiceId && 
      emailConfig.emailJsTemplateId && emailConfig.emailJsPublicKey) {
    startScheduler({
      cronTime: cronExpression,
      emailConfig,
      categoryConfigs
    });
    console.log('✅ 定时邮件服务已启动，等待执行时间...');
  } else {
    console.error('❌ 邮件配置不完整，定时任务未启动');
    console.error('请设置以下环境变量:');
    console.error('  - EMAIL_RECIPIENT');
    console.error('  - EMAILJS_SERVICE_ID');
    console.error('  - EMAILJS_TEMPLATE_ID');
    console.error('  - EMAILJS_PUBLIC_KEY');
    process.exit(1);
  }
  
  // 优雅退出
  process.on('SIGTERM', () => {
    console.log('\n收到 SIGTERM 信号，正在关闭服务...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('\n收到 SIGINT 信号，正在关闭服务...');
    process.exit(0);
  });
};

main();
