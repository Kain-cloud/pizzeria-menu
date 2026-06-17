import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { chatWithMenu, isGeminiConfigured } from '../lib/gemini';
import { useMenuStore } from '../store/useMenuStore';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ChatBot() {
  const { t } = useTranslation();
  const { items, categories } = useMenuStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  if (!isGeminiConfigured()) return null;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', text: t('chat.greeting') }]);
    }
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatWithMenu(
        newMessages.filter(m => m.role !== 'system'),
        { items, categories }
      );
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: t('chat.error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t('chat.title')}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-600 active:scale-95 transition-all cursor-pointer"
        >
          <ChatIcon />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[340px] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-warm-200 flex flex-col overflow-hidden chat-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-warm-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-warm-800">{t('chat.title')}</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="text-warm-400 hover:text-warm-800 transition-colors cursor-pointer bg-transparent border-none p-1">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[200px] max-h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-warm-100 text-warm-800 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-warm-100 text-warm-400 px-4 py-2 rounded-2xl rounded-bl-md text-[13px] flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-warm-200 p-3 flex gap-2 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-3 py-2 rounded-lg border border-warm-200 text-[13px] text-warm-800 bg-warm-50 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-warm-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 hover:bg-brand-600 disabled:opacity-40 transition-all cursor-pointer border-none"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
