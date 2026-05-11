"use client";

import React, { useState } from 'react';
import Hero from "@/app/components/home/Hero";
import ChatWidget from "@/app/components/chat/ChatWidget";

export default function ChatContainer() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <Hero onOpenChat={() => setIsChatOpen(true)} />
            <ChatWidget
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
            />
        </>
    );
}