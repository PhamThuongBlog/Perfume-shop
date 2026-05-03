import React from 'react';
import Collection from "@/app/components/home/Collection";
import ChatContainer from "@/app/components/chat/ChatContainer"; // File anh em mình chuẩn bị tạo ở dưới

export default function Home() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-rose-200">

            {/* Khối Client tương tác: Bao gồm Hero (có nút mở chat) và Widget Chatbot */}
            <ChatContainer />

            {/* ĐIỂM CHÍ MẠNG: Collection giờ đây đã có thể chạy Prisma thoải mái vì page.tsx đã là Server Component! */}
            <Collection />

        </div>
    );
}