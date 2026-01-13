
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, BriefingReport } from '../types';
import { createAssistantChat } from '../services/geminiService';

interface AssistantChatProps {
  report: BriefingReport;
  onClose: () => void;
  initialMessage?: string;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ report, onClose, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSession = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = createAssistantChat(report);
    if (initialMessage) {
      handleSend(`请针对此条情报提供深度变现逻辑分析：${initialMessage}`);
    }
  }, [report, initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textToUse?: string) => {
    const text = textToUse || input;
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', parts: text }]);
    if (!textToUse) setInput('');
    setIsTyping(true);

    try {
      // 核心修复：SDK 调用必须是对象形式 { message: string }
      const response = await chatSession.current.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'model', parts: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', parts: '分析链路异常，请尝试重新发起。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-[var(--bg-color)] shadow-2xl z-[120] flex flex-col border-l border-[var(--border)]">
      <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold">高级幕僚 · 深度决策</h3>
          <p className="text-[10px] opacity-40 uppercase tracking-widest font-mono">Strategy Unit v2.0</p>
        </div>
        <button onClick={onClose} className="p-2 opacity-50 hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--input-bg)] border border-[var(--border)]'
            }`}>
              <div className="whitespace-pre-wrap">{msg.parts}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 p-3 bg-[var(--input-bg)] rounded-xl w-fit">
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input 
            className="flex-grow bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs outline-none focus:border-[var(--accent)]"
            placeholder="询问更深层的变现逻辑..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={() => handleSend()} disabled={isTyping} className="bg-[var(--accent)] text-white p-3 rounded-xl shadow-lg disabled:opacity-50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
