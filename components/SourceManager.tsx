
import React, { useState } from 'react';
import { CategoryConfig } from '../types';

interface SourceManagerProps {
  configs: CategoryConfig[];
  setConfigs: (configs: CategoryConfig[]) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ configs, setConfigs }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempUrls, setTempUrls] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (c: CategoryConfig) => {
    setEditingId(c.id);
    setTempLabel(c.label);
    setTempUrls(c.urls.join(', '));
  };

  const saveEdit = (id: string) => {
    const urlArray = tempUrls.split(/[,，\n]/).map(u => u.trim()).filter(u => u);
    setConfigs(configs.map(c => c.id === id ? { ...c, label: tempLabel, urls: urlArray } : c));
    setEditingId(null);
  };

  const addSource = () => {
    if (!tempLabel.trim()) return;
    const urlArray = tempUrls.split(/[,，\n]/).map(u => u.trim()).filter(u => u);
    const newSource: CategoryConfig = {
      id: `src-${Date.now()}`,
      label: tempLabel,
      urls: urlArray
    };
    setConfigs([...configs, newSource]);
    setIsAdding(false);
    setTempLabel('');
    setTempUrls('');
  };

  const removeSource = (id: string) => {
    if (confirm('确定移除该情报源？信号将从此断开。')) {
      setConfigs(configs.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {configs.map(config => (
        <div key={config.id} className="p-4 rounded-xl intel-card">
          {editingId === config.id ? (
            <div className="space-y-3">
              <input 
                className="w-full bg-transparent border-b border-[var(--accent)] text-sm font-bold py-1 outline-none"
                value={tempLabel}
                onChange={e => setTempLabel(e.target.value)}
                placeholder="板块名称"
              />
              <textarea 
                className="w-full bg-black/5 border border-[var(--border)] rounded p-2 text-[10px] font-mono outline-none"
                value={tempUrls}
                onChange={e => setTempUrls(e.target.value)}
                placeholder="域名 (逗号分隔)"
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit(config.id)} className="px-3 py-1 bg-[var(--accent)] text-black text-[10px] font-bold rounded">确认</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-white/5 text-[10px] rounded">取消</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">{config.label}</h4>
                <p className="text-[10px] opacity-40 truncate max-w-[200px]">{config.urls.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(config)} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => removeSource(config.id)} className="p-2 opacity-30 hover:opacity-100 hover:text-red-500 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border border-dashed border-[var(--border)] rounded-xl text-[10px] font-mono opacity-50 hover:opacity-100 hover:border-[var(--accent)] transition-all"
        >
          + 新增情报监听源
        </button>
      ) : (
        <div className="p-4 rounded-xl intel-card border-dashed border-[var(--accent)] animate-in zoom-in-95">
          <input 
            className="w-full bg-transparent border-b border-[var(--accent)] text-sm font-bold py-1 outline-none mb-3"
            value={tempLabel}
            onChange={e => setTempLabel(e.target.value)}
            placeholder="新板块代号"
            autoFocus
          />
          <textarea 
            className="w-full bg-black/5 border border-[var(--border)] rounded p-2 text-[10px] font-mono outline-none mb-3"
            value={tempUrls}
            onChange={e => setTempUrls(e.target.value)}
            placeholder="监控域名 (例如: techcrunch.com, 36kr.com)"
          />
          <div className="flex gap-2">
            <button onClick={addSource} className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-lg">部署</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white/5 text-xs rounded-lg">取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceManager;
