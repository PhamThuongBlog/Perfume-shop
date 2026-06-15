import React from 'react';
import Collection from "@/app/components/home/Collection";
import CategorySection from "@/app/components/home/CategorySection";
import ChatContainer from "@/app/components/chat/ChatContainer";
import SocialBanner from "@/app/components/home/SocialBanner";

export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-rose-200">

            {/* Hero + Chat */}
            <ChatContainer />

            <SocialBanner />

            {/* === DANH MUC SAN PHAM === */}
            <div className="border-t border-stone-100">
                <CategorySection
                    title="Nuoc hoa Nu"
                    subtitle="Tinh te, quyen ru danh rieng phai dep"
                    gender="Nu"
                    href="/shop?gender=Nu"
                    icon="🌸"
                />
            </div>

            <div className="border-t border-stone-100">
                <CategorySection
                    title="Nuoc hoa Nam"
                    subtitle="Manh me, nam tinh va lich lam"
                    gender="Nam"
                    href="/shop?gender=Nam"
                    icon="💪"
                />
            </div>

            <div className="border-t border-stone-100">
                <CategorySection
                    title="Nuoc hoa Unisex"
                    subtitle="Huong thom danh cho moi gioi tinh"
                    gender="Unisex"
                    href="/shop?gender=Unisex"
                    icon="✨"
                />
            </div>

            {/* === GIFT SETS + COLLECTIONS === */}
            <Collection />

        </div>
    );
}
