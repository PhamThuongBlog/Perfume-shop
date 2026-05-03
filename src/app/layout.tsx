import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import CartDrawer from "@/app/components/cart/CartDrawer";
import AuthProvider from "@/app/components/auth/AuthProvider";

export const metadata: Metadata = {
    title: "Aura Signature",
    description: "Showroom Nước Hoa Sang Xịn Mịn",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
        <body className="antialiased bg-[#FDFBF7]">
        <AuthProvider>
            <Header />
            <CartDrawer />
            {children}
            <Footer />
        </AuthProvider>
        </body>
        </html>
    );
}