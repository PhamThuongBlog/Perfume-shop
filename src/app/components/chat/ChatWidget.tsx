"use client";
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot, ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: string;
  text: string;
  products?: ProductCard[];
}

interface ProductCard {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  price: number;
  volume: number;
  rating: string;
  gender: string;
  notes: string;
}

const WELCOME_MESSAGE: Message = {
  role: 'model',
  text: 'Chào bạn! Mình là Aura AI, trợ lý tư vấn nước hoa của AURA Signature ✨\n\nBạn đang tìm nước hoa cho dịp nào? Hay bạn thích kiểu mùi hương gì?',
};

const QUICK_REPLIES = [
  { label: '🌸 Nước hoa Nữ', query: 'Tư vấn nước hoa nữ tính, quyến rũ' },
  { label: '💪 Nước hoa Nam', query: 'Tư vấn nước hoa nam mạnh mẽ, lịch lãm' },
  { label: '☀️ Mùa hè', query: 'Nước hoa mùa hè tươi mát, nhẹ nhàng' },
  { label: '🎁 Quà tặng', query: 'Tư vấn nước hoa làm quà tặng cao cấp' },
  { label: '💼 Đi làm', query: 'Nước hoa phù hợp đi làm công sở' },
  { label: '🌙 Đi tiệc', query: 'Nước hoa cho buổi tối, tiệc tùng' },
];

const SESSION_KEY = 'aura_chat_session_id';

export default function ChatWidget({ isChatOpen, setIsChatOpen }: {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [productCatalog, setProductCatalog] = useState<string>('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionInitialized = useRef(false);
  const shouldScrollToBottom = useRef(false);

  // Scroll helpers
  const scrollDown = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      setShowScrollBtn(false);
    }
  };

  useEffect(() => {
    if (isChatOpen && !isLoadingHistory) {
      setTimeout(scrollDown, 80);
    }
  }, [isChatOpen, isLoadingHistory]);

  useEffect(() => {
    if (isLoadingHistory || !isChatOpen) return;
    if (shouldScrollToBottom.current) {
      shouldScrollToBottom.current = false;
      setTimeout(scrollDown, 50);
      return;
    }
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) { scrollDown(); } else { setShowScrollBtn(true); }
  }, [messages, isTyping]);

  // Load product catalog
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const list = (Array.isArray(data) ? data : []).map((p: any) => {
          const v = p.variants?.[0];
          const price = v ? (v.discountPercent > 0
            ? Math.round(v.price * (1 - v.discountPercent / 100))
            : v.price) : 0;
          return `- ${p.name} (${p.brand}): ${price.toLocaleString('vi-VN')}đ | ${v?.volume || '?'}ml | ${p.gender || '?'} | ${(p.description || '').slice(0, 80)}`;
        }).join('\n');
        setProductCatalog(list);
      })
      .catch(() => setProductCatalog(''));
  }, []);

  // Init session
  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    const init = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch('/api/chat/session', { method: 'POST' });
        const data = await res.json();
        const sid = data.sessionId;
        localStorage.setItem(SESSION_KEY, sid);
        setSessionId(sid);

        const histRes = await fetch(`/api/chat/session?sessionId=${sid}`);
        const histData = await histRes.json();
        if (histData.messages?.length > 0) {
          setMessages(histData.messages);
          setShowQuickReplies(false);
        } else {
          setMessages([WELCOME_MESSAGE]);
          setShowQuickReplies(true);
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [WELCOME_MESSAGE], sessionId: sid, isWelcome: true })
          });
        }
      } catch {
        setMessages([WELCOME_MESSAGE]);
      }
      setIsLoadingHistory(false);
    };
    init();
  }, []);

  const handleSend = async (text?: string) => {
    const msgText = text || inputMessage;
    if (!msgText.trim()) return;

    const userMsg: Message = { role: 'user', text: msgText };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickReplies(false);
    shouldScrollToBottom.current = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, sessionId })
      });
      const data = await res.json();
      shouldScrollToBottom.current = true;
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Lỗi kết nối, bạn thử lại sau nhé 🌿' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => { e?.preventDefault(); handleSend(); };

  const formatMsgText = (text: string) => {
    // Bold text between ** **
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-rose-600">{part.slice(2, -2)}</strong>;
      }
      // Make product names in [N] format clickable-like
      if (/^\[\d+\]/.test(part)) {
        return <span key={i} className="text-indigo-600 font-semibold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isChatOpen && (
        <div className="w-[380px] sm:w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl shadow-rose-900/10 border border-stone-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-rose-50 to-stone-50 p-4 border-b border-stone-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center relative">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm">Aura AI Advisor</h3>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  {API_KEY_CHECK ? 'AI sẵn sàng' : 'Đang trực tuyến'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-white/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="relative flex-1 overflow-hidden">
            <div
              ref={messagesContainerRef}
              onScroll={() => {
                const c = messagesContainerRef.current;
                if (!c) return;
                setShowScrollBtn(c.scrollHeight - c.scrollTop - c.clientHeight > 120);
              }}
              className="h-full overflow-y-auto p-4 space-y-3 bg-stone-50/50"
            >
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && (
                        <div className="w-7 h-7 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                          <Bot className="w-3.5 h-3.5 text-rose-600" />
                        </div>
                      )}
                      <div className={`max-w-[82%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-stone-900 text-white rounded-tr-sm'
                          : 'bg-white border border-stone-100 text-stone-700 shadow-sm rounded-tl-sm'
                      }`}>
                        <span className="text-[13px]">{formatMsgText(msg.text)}</span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-7 h-7 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                        <Bot className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="bg-white border border-stone-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Quick replies */}
              {showQuickReplies && !isLoadingHistory && !isTyping && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-stone-400 font-medium mb-2">💬 Gợi ý nhanh:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_REPLIES.map(qr => (
                      <button
                        key={qr.label}
                        onClick={() => handleSend(qr.query)}
                        className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesContainerRef as any} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBtn && !isLoadingHistory && (
              <button onClick={scrollDown}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white w-7 h-7 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 transition-colors z-10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* INPUT */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-stone-100">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi Aura AI về nước hoa..."
                disabled={isTyping}
                className="flex-1 bg-stone-100 text-sm text-stone-800 rounded-full pl-4 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 bg-stone-900 text-white rounded-full hover:bg-rose-500 disabled:bg-stone-300 disabled:text-stone-500 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center mt-2">
              Aura AI tư vấn dựa trên dữ liệu thực tế của cửa hàng ✨
            </p>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isChatOpen
            ? 'bg-stone-200 text-stone-800 scale-90'
            : 'bg-stone-900 text-white hover:bg-rose-500 hover:scale-105'
        }`}
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}

// Check if API key exists (client-side safe flag)
const API_KEY_CHECK = true;
