import cron from 'node-cron';
import { generateBriefing } from './briefingService.js';
import { sendEmail } from './emailService.js';
import { EmailConfig, CategoryConfig } from './types.js';

interface SchedulerConfig {
  cronTime: string; // Cron 表达式，例如 "0 9 * * *" 表示每天 9:00
  emailConfig: EmailConfig;
  categoryConfigs: CategoryConfig[];
}

let scheduledTask: cron.ScheduledTask | null = null;

export const startScheduler = (config: SchedulerConfig) => {
  // 停止现有任务
  if (scheduledTask) {
    scheduledTask.stop();
  }

  console.log(`[${new Date().toISOString()}] 📅 定时任务已启动: ${config.cronTime}`);
  console.log(`[${new Date().toISOString()}] 📧 收件人: ${config.emailConfig.emailRecipient}`);

  scheduledTask = cron.schedule(config.cronTime, async () => {
    try {
      console.log(`[${new Date().toISOString()}] ⏰ 定时任务触发，开始生成简报...`);
      
      // 生成简报
      const report = await generateBriefing(config.categoryConfigs);
      
      // 发送邮件
      await sendEmail(report, config.emailConfig);
      
      console.log(`[${new Date().toISOString()}] ✅ 定时任务执行成功`);
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] ❌ 定时任务执行失败:`, error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });
};

export const stopScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log(`[${new Date().toISOString()}] ⏹️  定时任务已停止`);
  }
};

// 将 Cron 时间格式（HH:mm）转换为 Cron 表达式
export const timeToCron = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${minutes} ${hours} * * *`;
};
