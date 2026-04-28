import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
    variantId: string;
    productId: string;
    productName: string;
    brand: string;
    imageUrl: string | null;
    volume: number;
    price: number;
    discountPercent: number;
    stock: number;
    quantity: number;
};

type CartStore = {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            addItem: (newItem) => {
                const items = get().items;
                const existing = items.find((i) => i.variantId === newItem.variantId);

                if (existing) {
                    const nextQty = existing.quantity + 1;
                    if (nextQty > existing.stock) return; // Không vượt quá stock
                    set({
                        items: items.map((i) =>
                            i.variantId === newItem.variantId
                                ? { ...i, quantity: nextQty }
                                : i
                        ),
                    });
                } else {
                    if (newItem.stock === 0) return; // Block hết hàng
                    set({ items: [...items, { ...newItem, quantity: 1 }] });
                }

                set({ isOpen: true }); // Tự động mở cart sau khi thêm
            },

            removeItem: (variantId) => {
                set({ items: get().items.filter((i) => i.variantId !== variantId) });
            },

            updateQuantity: (variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(variantId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.variantId === variantId
                            ? { ...i, quantity: Math.min(quantity, i.stock) }
                            : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () =>
                get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () =>
                get().items.reduce((sum, i) => {
                    const finalPrice =
                        i.discountPercent > 0
                            ? i.price * (1 - i.discountPercent / 100)
                            : i.price;
                    return sum + finalPrice * i.quantity;
                }, 0),
        }),
        {
            name: 'aura-cart',
            partialize: (state) => ({ items: state.items }), // Chỉ persist items, không persist isOpen
        }
    )
);