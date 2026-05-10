"use client";
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot } from 'lucide-react';

interface ChatWidgetProps {
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatWidget({ isChatOpen, setIsChatOpen }: ChatWidgetProps) {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Chào bạn! Bạn đang tìm nước hoa cho dịp nào vậy? 😊' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const list = data.map((p: {
                    name: string;
                    brand: string;
                    description: string;
                    variants: { volume: number; price: number; discountPercent: number }[]
                }) => {
                    const v = p.variants[0];
                    const price = v ? (v.discountPercent > 0
                        ? v.price * (1 - v.discountPercent / 100)
                        : v.price) : 0;
                    return `- ${p.name} (${p.brand}): ${p.description ?? ''} | ${v?.volume}ml - ${price.toLocaleString('vi-VN')}₫`;
                }).join('\n');
                setProducts(list);
            })
            .catch(() => setProducts(''));
    }, []);

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { role: 'user', text: inputMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputMessage('');
        setIsTyping(true);

        try {
            const apiKey = "AIzaSyBu3eUVCiqMQgf0jeqlbtW-aRS143kb5p4";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: newMessages.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                systemInstruction: {
                    parts: [{
                        text: `Bạn là nhân viên tư vấn nước hoa tại AURA Signature. Trả lời ngắn gọn, tự nhiên như nhắn tin — tối đa 2 câu. Không dùng markdown, không gạch đầu dòng, không hoa mỹ. Không tự giới thiệu dài dòng.

Sản phẩm hiện có:
${products || 'Đang tải...'}

Quy tắc:
- Mỗi lần chỉ hỏi 1 câu
- Chỉ gợi ý sản phẩm có trong danh sách trên, kèm giá
- Xưng "mình", gọi khách là "bạn"
- Nếu hỏi ngoài chủ đề nước hoa, nhẹ nhàng đưa về chủ đề chính`
                    }]
                }
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hệ thống đang bận, bạn thử lại nhé!";
            setMessages(prev => [...prev, { role: 'model', text: replyText }]);
        } catch {
            setMessages(prev => [...prev, { role: 'model', text: "Lỗi kết nối, bạn thử lại sau nhé 🌿" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isChatOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-rose-900/10 border border-stone-100 flex flex-col mb-4 overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-[#FDFBF7] p-4 border-b border-stone-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center relative">
                                <Sparkles className="w-5 h-5 text-rose-500" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-800 text-sm">Aura AI Advisor</h3>
                                <p className="text-xs text-rose-500 font-medium">Đang trực tuyến</p>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                                        <Bot className="w-4 h-4 text-rose-600" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-stone-900 text-white rounded-tr-sm' : 'bg-white border border-stone-100 text-stone-700 shadow-sm rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                                    <Bot className="w-4 h-4 text-rose-600" />
                                </div>
                                <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhắn tin với Aura AI..."
                                className="w-full bg-stone-100 text-sm text-stone-800 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="absolute right-2 p-2 bg-stone-900 text-white rounded-full hover:bg-rose-500 disabled:bg-stone-300 disabled:text-stone-500 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isChatOpen ? 'bg-stone-200 text-stone-800 scale-90' : 'bg-stone-900 text-white hover:bg-rose-500 hover:scale-105'}`}
            >
                {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}