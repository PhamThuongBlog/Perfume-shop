"use client";
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot } from 'lucide-react';

// Bê nguyên hàm fetchWithRetry sang đây
const fetchWithRetry = async (url: string, options: RequestInit, retries = 5, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return await res.json();
            if (i === retries - 1) return Promise.reject(new Error(`HTTP error! status: ${res.status}`));
            console.warn(`Attempt ${i + 1} failed. Retrying...`);
        } catch (e) {
            if (i === retries - 1) throw e;
            console.warn(`Attempt ${i + 1} encountered a network error. Retrying...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
    }
};

// Định nghĩa Props để nhận lệnh từ page.tsx
interface ChatWidgetProps {
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    messages: { role: string; text: string }[]; // Thêm dòng này
    inputMessage: string;                        // Thêm dòng này
    setInputMessage: (value: string) => void;    // Thêm dòng này
    handleSendMessage: (e?: React.FormEvent) => Promise<void>; // Thêm dòng này
    isTyping: boolean;                           // Thêm dòng này
    messagesEndRef: React.RefObject<HTMLDivElement | null>; // Thêm dòng này
}

export default function ChatWidget({ isChatOpen, setIsChatOpen }: ChatWidgetProps) {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Xin chào! Tôi là chuyên gia mùi hương của Aura. Tôi có thể giúp bạn tìm kiếm hương nước hoa hoàn hảo nào cho ngày hôm nay?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { role: 'user', text: inputMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputMessage('');
        setIsTyping(true);

        try {
            const apiKey = "AIzaSyBu3eUVCiqMQgf0jeqlbtW-aRS143kb5p4"; // API Key
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: newMessages.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                systemInstruction: {
                    parts: [{
                        text: `Bạn là một chuyên gia tư vấn nước hoa cao cấp, tinh tế và lịch sự tại cửa hàng 'Aura by Mochi'. 
                        Cửa hàng hiện có các sản phẩm sau: 
                        1. Midnight Rose (Hồng nhung, Trầm hương - 2.500.000đ)
                        2. Ocean Breeze (Hương biển, Cam Bergamot - 1.800.000đ)
                        3. Vanilla Sky (Vani, Hổ phách - 2.200.000đ)
                        4. Mystic Wood (Gỗ tuyết tùng, Tiêu đen - 2.800.000đ)
                        Hãy hỏi sở thích của khách hàng, lắng nghe và đưa ra gợi ý chân thành. Giữ giọng điệu thanh lịch, lãng mạn.`
                    }]
                }
            };

            const data = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, hệ thống đang quá tải.";
            setMessages(prev => [...prev, { role: 'model', text: replyText }]);

        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Đã có lỗi kết nối xảy ra. Bạn thông cảm đợi lát rồi thử lại nhé 🌿" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isChatOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-rose-900/10 border border-stone-100 flex flex-col mb-4 overflow-hidden transform transition-all origin-bottom-right">
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
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

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

                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Miêu tả sở thích của bạn..."
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
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isChatOpen ? 'bg-stone-200 text-stone-800 scale-90' : 'bg-stone-900 text-white hover:bg-rose-500 hover:scale-105 shadow-rose-900/20'}`}
            >
                {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}