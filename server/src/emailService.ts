import { BriefingReport, EmailConfig } from "./types.js";

const cleanProductionText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n\s*[-*+]\s+/g, '\n• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .trim();
};

const generateEmailHtml = (data: BriefingReport) => {
  let html = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px; border-left: 5px solid #2563eb;">
      <h3 style="margin: 0 0 10px; color: #1e3a8a; font-size: 16px; font-weight: 800;">🧭 宏观决策综述</h3>
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 14px;">${cleanProductionText(data.executiveSummary)}</p>
      <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; font-size: 13px; color: #475569; border: 1px solid #e2e8f0;">
        <strong style="color: #2563eb;">🎯 行动导向建议：</strong>${cleanProductionText(data.mobileSummary)}
      </div>
    </div>
  `;

  data.sections.forEach(section => {
    if (!section.items.length) return;
    html += `
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 12px;">【 ${section.categoryLabel} 】</div>
        ${section.items.slice(0, 3).map(item => `
          <div style="margin-bottom: 15px; padding-left: 8px;">
            <a href="${item.url}" style="text-decoration: none; color: #0f172a; font-weight: 700; font-size: 14px; display: block; margin-bottom: 4px;">${cleanProductionText(item.title)}</a>
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${cleanProductionText(item.summary)}</p>
          </div>
        `).join('')}
      </div>
    `;
  });

  return html;
};

export const sendEmail = async (report: BriefingReport, config: EmailConfig): Promise<void> => {
  if (!config.emailJsServiceId || !config.emailJsTemplateId || !config.emailJsPublicKey || !config.emailRecipient) {
    throw new Error("邮件配置不完整，请检查环境变量");
  }

  const reportTitle = `BrieflyAI [${report.date}] 决策研判简报`;

  try {
    console.log(`[${new Date().toISOString()}] 开始发送邮件到 ${config.emailRecipient}...`);
    
    // 使用 EmailJS REST API 发送邮件
    const emailJsUrl = `https://api.emailjs.com/api/v1.0/email/send`;
    
    const response = await fetch(emailJsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: config.emailJsServiceId,
        template_id: config.emailJsTemplateId,
        user_id: config.emailJsPublicKey,
        template_params: {
          to_email: config.emailRecipient,
          subject: reportTitle,
          date: report.date,
          message_html: generateEmailHtml(report)
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API 错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] ✅ 邮件发送成功:`, result);
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❌ 邮件发送失败:`, error);
    throw new Error(`邮件发送失败: ${error.message || '未知错误'}`);
  }
};
