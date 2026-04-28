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
            const apiKey = "AIzaSyBu3eUVCiqMQgf0jeqlbtW-aRS143kb5p4";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const payload = {
                contents: newMessages.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                systemInstruction: {
                    parts: [{
                        text: `Bạn là chuyên gia tư vấn tại Aura...` // Giữ nguyên instruction của anh
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