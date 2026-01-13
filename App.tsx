import React, { useState, useEffect, useRef } from 'react';
import { BriefingReport, ReportStatus, CategoryConfig, UserPreferences, NewsItem } from './types';
import { generateBriefing } from './services/geminiService';
import ReportSection from './components/ReportSection';
import AssistantChat from './components/AssistantChat';
import SourceManager from './components/SourceManager';
import TrendingList from './components/TrendingList';
import emailjs from 'https://esm.sh/@emailjs/browser';

const DEFAULT_CONFIGS: CategoryConfig[] = [
  { id: 'ai_trends', label: 'AI趋势', urls: ['openai.com', 'anthropic.com', 'deepseek.com', 'jiqizhixin.com'] },
  { id: 'sentiment', label: '舆情分析', urls: ['weibo.com', 'zhihu.com', 'x.com', 'google.com/news'] },
  { id: 'github_hot', label: 'Github热门应用', urls: ['github.com/trending', 'producthunt.com'] },
  { id: 'media_topics', label: '自媒体选题', urls: ['newrank.cn', 'trending.topics', 'douyin.com'] },
  { id: 'util_tools', label: '实用工具', urls: ['appsumo.com', 'futurepedia.io', 'chrome.google.com/webstore'] },
  { id: 'info_gap', label: '信息差盈利', urls: ['reddit.com/r/sidehustle', 'juliang.com', 'tiktok.com'] }
];

const App: React.FC = () => {
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.IDLE);
  const [report, setReport] = useState<BriefingReport | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [configs, setConfigs] = useState<CategoryConfig[]>(DEFAULT_CONFIGS);
  
  // Standardizing environment variable access via import.meta.env.VITE_
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    // @ts-ignore
    const env = import.meta.env || {};
    return { 
      webhookUrl: env.VITE_WEBHOOK_URL || '', 
      barkKey: env.VITE_BARK_KEY || '',
      serverChanKey: env.VITE_SERVERCHAN_KEY || '',
      pushDeerKey: env.VITE_PUSHDEER_KEY || '',
      emailRecipient: env.VITE_EMAIL_RECIPIENT || '',
      emailJsServiceId: env.VITE_EMAILJS_SERVICE_ID || '',
      emailJsTemplateId: env.VITE_EMAILJS_TEMPLATE_ID || '',
      emailJsPublicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
      autoVoiceEnabled: false,
      pushTime: '09:00',
      isAutoPushEnabled: false
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [activeConsult, setActiveConsult] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'brief' | 'signals'>('brief');
  const lastPushedDateRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') || 'dark';
      setTheme(savedTheme as any);
      document.documentElement.className = savedTheme;
      const savedConfigs = localStorage.getItem('b_configs_v3');
      if (savedConfigs) setConfigs(JSON.parse(savedConfigs));
      const savedPrefs = localStorage.getItem('b_prefs');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPrefs(prev => ({ ...prev, ...parsed }));
      }
      const cached = localStorage.getItem('b_report');
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - (data.cacheTimestamp || 0) < 1000 * 60 * 60 * 6) {
          setReport(data);
          setStatus(ReportStatus.COMPLETED);
        }
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!prefs.isAutoPushEnabled) return;
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toDateString();
      if (currentTimeStr === prefs.pushTime && lastPushedDateRef.current !== todayStr) {
        handleSync(true);
        lastPushedDateRef.current = todayStr;
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [prefs.isAutoPushEnabled, prefs.pushTime]);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('b_configs_v3', JSON.stringify(configs));
    localStorage.setItem('b_prefs', JSON.stringify(prefs));
    if (report) localStorage.setItem('b_report', JSON.stringify(report));
  }, [theme, configs, prefs, report]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

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

  const handleSync = async (silent = false) => {
    setStatus(ReportStatus.FETCHING);
    try {
      const data = await generateBriefing(configs);
      setReport(data);
      setStatus(ReportStatus.COMPLETED);
      
      const reportTitle = `BrieflyAI [${data.date}] 决策研判简报`;
      const mobileBody = `【${reportTitle}】\n综述：${data.executiveSummary.replace(/[#*`]/g, '')}\n建议：${data.mobileSummary.replace(/[#*`]/g, '')}`;
      
      const safePush = (url: string, opts?: any) => fetch(url, opts).catch(() => {});
      if (prefs.webhookUrl) safePush(prefs.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ msg_type: "text", content: { text: mobileBody } }) });
      if (prefs.barkKey) safePush(`https://api.day.app/${prefs.barkKey}/${encodeURIComponent(reportTitle)}/${encodeURIComponent(mobileBody)}?group=BrieflyAI`);

      if (prefs.emailJsServiceId && prefs.emailJsTemplateId && prefs.emailJsPublicKey && prefs.emailRecipient) {
        emailjs.send(
          prefs.emailJsServiceId,
          prefs.emailJsTemplateId,
          {
            to_email: prefs.emailRecipient,
            subject: reportTitle,
            date: data.date,
            message_html: generateEmailHtml(data)
          },
          prefs.emailJsPublicKey
        );
      }

    } catch (err: any) {
      setStatus(ReportStatus.ERROR);
      if (!silent) console.error("Sync Error:", err);
    }
  };

  const handleExport = async () => {
    if (!report) return;
    try {
      const docContent = `<html><body style="font-family:serif; padding: 40px;">${generateEmailHtml(report)}</body></html>`;
      const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BrieflyAI_Decision_Report_${report.date}.doc`;
      link.click();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen pb-20 transition-all duration-700 ease-in-out">
      <header className="fixed top-0 inset-x-0 z-[100] bg-[var(--nav-bg)] backdrop-blur-2xl border-b border-[var(--border)] px-4 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-2xl shadow-[var(--accent)]/40 text-lg">B</div>
          <div>
            <span className="text-xl font-black tracking-tight block">Briefly<span className="text-[var(--accent)]">AI</span></span>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 leading-none">Global Intel v3.1 PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {report && (
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl hover:bg-[var(--accent)]/20 text-xs font-black transition-all border border-[var(--accent)]/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="hidden sm:inline">导出研判报告</span>
            </button>
          )}
          <button onClick={toggleTheme} className="p-2.5 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)] hover:scale-105 active:scale-95 transition-all">
            {theme === 'dark' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2.5 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)] hover:scale-105 active:scale-95 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
          <button onClick={() => handleSync()} disabled={status === ReportStatus.FETCHING} className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-2xl text-sm font-black shadow-2xl shadow-[var(--accent)]/40 active:scale-[0.96] disabled:opacity-40 transition-all">
            {status === ReportStatus.FETCHING ? '同步中...' : '同步实时情报'}
          </button>
        </div>
      </header>

      <main className="pt-28 px-4 md:px-10 max-w-4xl mx-auto">
        {status === ReportStatus.ERROR && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-center mb-10">
            <p className="text-red-500 font-bold mb-4">同步过程发生异常，请检查网络或配置。</p>
            <button onClick={() => handleSync()} className="text-xs font-black uppercase tracking-widest bg-red-500 text-white px-6 py-2 rounded-xl">重新尝试</button>
          </div>
        )}
        {report ? (
          <div className={`space-y-16 animate-in slide-in-from-bottom-6 ${status === ReportStatus.FETCHING ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
             <section className="intel-card p-8 md:p-14 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--accent)]/20 transition-all duration-1000"></div>
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                  <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em]">Decision Support Intelligence</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight tracking-tight">{report.executiveSummary.replace(/[#*`]/g, '')}</h2>
                <div className="p-6 bg-[var(--input-bg)]/80 rounded-[2rem] border border-[var(--border)] text-sm md:text-base font-bold italic text-[var(--text-secondary)] leading-relaxed">
                  “ {report.mobileSummary.replace(/[#*`]/g, '')} ”
                </div>
             </section>

             <div className="sticky top-[88px] z-50 bg-[var(--bg-color)]/80 backdrop-blur-xl py-4 flex gap-10 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('brief')} className={`pb-2 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'brief' ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-secondary)] border-transparent opacity-40 hover:opacity-100'}`}>情报内参集</button>
                <button onClick={() => setActiveTab('signals')} className={`pb-2 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'signals' ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--text-secondary)] border-transparent opacity-40 hover:opacity-100'}`}>全球趋势脉冲</button>
             </div>

             <div className="min-h-[500px]">
                {activeTab === 'brief' ? (
                  <div className="space-y-20 py-6">
                    {report.sections.map((s, idx) => (
                      <ReportSection key={idx} title={s.categoryLabel} items={s.items} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} onSave={() => {}} savedIds={new Set()} onConsult={(i: NewsItem) => { setActiveConsult(i.title); setShowAssistant(true); }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-12 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 py-6 bg-[var(--input-bg)]/40 rounded-[2.5rem] border border-[var(--border)]">
                       <div>
                         <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Live Trend Spectrum</h3>
                         <p className="text-sm font-bold opacity-60">抖音 / TikTok 实时热度与商业逻辑拆解</p>
                       </div>
                    </div>
                    <TrendingList items={report.trending} />
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 animate-in fade-in">
             <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center text-[var(--accent)] mx-auto animate-bounce">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <div className="space-y-3">
               <h2 className="text-2xl font-black opacity-80 uppercase tracking-widest">情报终端已就绪</h2>
               <p className="text-[var(--text-secondary)] font-bold">点击右上角“同步实时情报”开始扫描全网高价值信号</p>
             </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-[var(--card-bg)] w-full max-w-xl rounded-[3rem] p-10 border border-[var(--border)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] no-scrollbar space-y-10" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tight">自动化决策配置</h3>
                <button onClick={() => setShowSettings(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl opacity-50 hover:opacity-100 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
             
             <div className="space-y-8">
                <div className="p-6 bg-[var(--input-bg)] rounded-[2rem] border border-[var(--border)] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[var(--accent)] tracking-[0.2em]">每日定时同步任务</span>
                    <input type="time" className="bg-transparent border-none text-2xl font-black outline-none focus:ring-0 block" value={prefs.pushTime} onChange={e => setPrefs({...prefs, pushTime: e.target.value})} />
                  </div>
                  <button onClick={() => setPrefs({...prefs, isAutoPushEnabled: !prefs.isAutoPushEnabled})} className={`w-16 h-8 rounded-full relative transition-all duration-500 shadow-inner ${prefs.isAutoPushEnabled ? 'bg-[var(--accent)]' : 'bg-gray-400 dark:bg-gray-700'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-md ${prefs.isAutoPushEnabled ? 'left-9' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">决策情报分发通道 (Email)</h4>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase opacity-30 ml-2">Service ID</label>
                        <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl px-5 py-3 text-xs font-bold focus:border-[var(--accent)] transition-all outline-none" value={prefs.emailJsServiceId} onChange={e => setPrefs({...prefs, emailJsServiceId: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase opacity-30 ml-2">Template ID</label>
                        <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl px-5 py-3 text-xs font-bold focus:border-[var(--accent)] transition-all outline-none" value={prefs.emailJsTemplateId} onChange={e => setPrefs({...prefs, emailJsTemplateId: e.target.value})} />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold uppercase opacity-30 ml-2">Email Recipient (收件人)</label>
                        <input type="email" className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl px-5 py-3 text-xs font-bold focus:border-[var(--accent)] transition-all outline-none" placeholder="example@decision.com" value={prefs.emailRecipient} onChange={e => setPrefs({...prefs, emailRecipient: e.target.value})} />
                      </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6">情报源深度监听管理</h4>
                   <SourceManager configs={configs} setConfigs={setConfigs} />
                </div>
             </div>
          </div>
        </div>
      )}

      {showAssistant && report && <AssistantChat report={report} onClose={() => setShowAssistant(false)} initialMessage={activeConsult} key={activeConsult} />}
    </div>
  );
};

export default App;