
import React from 'react';
import { TrendingItem } from '../types';

interface TrendingListProps {
  items: TrendingItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TrendingList: React.FC<TrendingListProps> = ({ items, onRefresh, isRefreshing = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="opacity-30 text-xs font-medium uppercase tracking-widest">正在捕捉全球流量脉冲...</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="mt-4 px-6 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? '刷新中...' : '刷新热点'}
          </button>
        )}
      </div>
    );
  }

  // 按平台分组
  const douyinItems = items.filter(item => item.platform.toLowerCase().includes('douyin') || item.platform === '抖音');
  const tiktokItems = items.filter(item => item.platform.toLowerCase().includes('tiktok') || item.platform === 'TikTok');

  return (
    <div className="space-y-8">
      {/* 刷新按钮 */}
      {onRefresh && (
        <div className="flex justify-end">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新热点
              </>
            )}
          </button>
        </div>
      )}

      {/* 抖音热点 */}
      {douyinItems.length > 0 && (
    <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-black rounded-full"></div>
            <h4 className="text-sm font-black uppercase tracking-widest">抖音实时热点</h4>
            <span className="text-[10px] font-mono opacity-40">({douyinItems.length} 条)</span>
          </div>
          {douyinItems.map((item, idx) => (
            <div key={`douyin-${idx}`} className="intel-card p-6 rounded-2xl flex gap-6 group hover:border-[var(--accent)] transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-black border border-[var(--border)] rounded-xl flex items-center justify-center text-sm font-black text-white opacity-80 group-hover:opacity-100 transition-all">
            {item.rank || idx + 1}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter bg-black text-white">
                    抖音
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                    item.type === 'PRODUCT' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/5'
                  }`}>
                    {item.type === 'PRODUCT' ? '热卖单品' : '话题爆点'}
                  </span>
                  <span className="text-[10px] font-mono font-bold opacity-40 ml-auto">HEAT: {item.heat}</span>
                </div>
                
                <h3 className="text-base font-bold mb-3 group-hover:text-[var(--accent)] transition-colors leading-tight">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.topic}</a>
                  ) : item.topic}
                </h3>
                
                <div className="bg-[var(--input-bg)]/50 p-4 rounded-xl border border-[var(--border)]/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1.5 flex items-center gap-2">
                    <span className="w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse"></span>
                    商业逻辑分析
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                    {item.analysis}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TikTok热点 */}
      {tiktokItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#25F4EE] rounded-full"></div>
            <h4 className="text-sm font-black uppercase tracking-widest">TikTok 实时热点</h4>
            <span className="text-[10px] font-mono opacity-40">({tiktokItems.length} 条)</span>
          </div>
          {tiktokItems.map((item, idx) => (
            <div key={`tiktok-${idx}`} className="intel-card p-6 rounded-2xl flex gap-6 group hover:border-[var(--accent)] transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-[#25F4EE] border border-[var(--border)] rounded-xl flex items-center justify-center text-sm font-black text-black opacity-80 group-hover:opacity-100 transition-all">
                {item.rank || idx + 1}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter bg-[#25F4EE] text-black">
                    TikTok
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                item.type === 'PRODUCT' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/5'
              }`}>
                {item.type === 'PRODUCT' ? '热卖单品' : '话题爆点'}
              </span>
              <span className="text-[10px] font-mono font-bold opacity-40 ml-auto">HEAT: {item.heat}</span>
            </div>
            
            <h3 className="text-base font-bold mb-3 group-hover:text-[var(--accent)] transition-colors leading-tight">
              {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.topic}</a>
              ) : item.topic}
            </h3>
            
            <div className="bg-[var(--input-bg)]/50 p-4 rounded-xl border border-[var(--border)]/50">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1.5 flex items-center gap-2">
                <span className="w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse"></span>
                商业逻辑分析
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                {item.analysis}
              </p>
            </div>
          </div>
        </div>
      ))}
        </div>
      )}

      {/* 如果没有数据 */}
      {douyinItems.length === 0 && tiktokItems.length === 0 && (
        <div className="py-20 text-center opacity-30 text-xs font-medium uppercase tracking-widest">
          暂无热点数据，点击刷新按钮获取最新热点
        </div>
      )}
    </div>
  );
};

export default TrendingList;
