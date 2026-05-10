"use client"; // Đưa toàn bộ logic tương tác vào đây

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Hero from "@/app/components/home/Hero";
import ChatWidget from "@/app/components/chat/ChatWidget";

// Giữ lại hàm helper API của anh
const fetchWithRetry = async (url: string, options: RequestInit, retries = 5, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return await res.json();
            if (i === retries - 1) return Promise.reject(new Error(`HTTP error! status: ${res.status}`));
        } catch (e) {
            if (i === retries - 1) throw e;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
    }
};

export default function ChatContainer() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Chào bạn! Mình có thể giúp gì cho bạn hôm nay? 😊' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const list = data.map((p: {
                        name: string;
                        description: string;
                        variants: { volume: number; price: number }[]
                    }) =>
                        `- ${p.name}: ${p.description ?? ''} | Giá từ ${p.variants[0]?.price.toLocaleString('vi-VN')}₫`
                ).join('\n');
                setProducts(list);
            });
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
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const payload = {
                contents: newMessages.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                systemInstruction: {
                    parts: [{
                        text: `Bạn là nhân viên tư vấn nước hoa tại AURA Signature. Trả lời ngắn gọn, tự nhiên như nhắn tin thật — tối đa 2-3 câu mỗi lần. Không dùng markdown, không gạch đầu dòng, không hoa mỹ thái quá.
                        Danh sách sản phẩm hiện có:
                        ${products}
                        
                        Quy tắc:
                        - Hỏi 1 câu thôi, không hỏi nhiều cùng lúc
                        - Gợi ý đúng sản phẩm trong danh sách, kèm giá
                        - Nếu khách hỏi ngoài chủ đề nước hoa, nhẹ nhàng đưa về chủ đề chính
                        - Xưng "mình", gọi khách là "bạn"`
                    }]
                }
            };

            const data = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hệ thống bận...";
            setMessages(prev => [...prev, { role: 'model', text: replyText }]);
        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Lỗi kết nối..." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Hero nằm ở đây để nhận prop onOpenChat */}
            <Hero onOpenChat={() => setIsChatOpen(true)} />

            {/* ChatWidget nằm ở đây để dùng chung state */}
            <ChatWidget
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                messages={messages}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
            />
        </>
    );
}