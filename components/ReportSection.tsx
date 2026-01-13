
import React from 'react';
import { NewsItem } from '../types';

interface ReportSectionProps {
  title: string;
  items: NewsItem[];
  icon: React.ReactNode;
  onSave: (item: NewsItem) => void;
  savedIds: Set<string>;
  onConsult: (item: NewsItem) => void;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, items, icon, onSave, savedIds, onConsult }) => {
  if (items.length === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
          {icon}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex-grow h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
      </div>
      
      <div className="grid gap-6">
        {items.map((item) => (
          <div key={item.id} className="intel-card p-6 rounded-[1.5rem] hover:shadow-md group transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--accent)]/10 px-2 py-1 rounded-lg">{item.source}</span>
              <div className="text-[10px] font-mono font-bold opacity-30">IMPACT_{item.impactScore}</div>
            </div>
            
            <h3 className="text-lg font-bold mb-3 leading-snug group-hover:text-[var(--accent)] transition-colors">
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
            </h3>
            
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              {item.summary}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <button 
                onClick={() => onConsult(item)}
                className="text-[11px] font-bold uppercase tracking-tight text-amber-600 hover:text-amber-500 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                分析解读
              </button>
              
              <div className="flex gap-4">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg opacity-30 hover:opacity-100 hover:bg-[var(--accent)]/10 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportSection;
