
import React from 'react';
import { TrendingItem } from '../types';

interface TrendingListProps {
  items: TrendingItem[];
}

const TrendingList: React.FC<TrendingListProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return <div className="py-20 text-center opacity-30 text-xs font-medium uppercase tracking-widest">正在捕捉全球流量脉冲...</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="intel-card p-6 rounded-2xl flex gap-6 group hover:border-[var(--accent)] transition-all">
          <div className="flex-shrink-0 w-12 h-12 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl flex items-center justify-center text-sm font-black opacity-20 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all">
            {item.rank || idx + 1}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                item.platform.toLowerCase().includes('douyin') ? 'bg-black text-white' : 'bg-[#25F4EE] text-black'
              }`}>
                {item.platform}
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
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.topic}</a>
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
  );
};

export default TrendingList;
