import Link from 'next/link';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
            <div className="text-center">
                <p className="text-6xl mb-6">🎉</p>
                <h1 className="text-2xl font-bold text-stone-900 mb-2">Đặt hàng thành công!</h1>
                <p className="text-stone-500 mb-8">Cảm ơn bạn đã tin tưởng AURA. Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể.</p>
                <Link
                    href="/"
                    className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        </div>
    );
}