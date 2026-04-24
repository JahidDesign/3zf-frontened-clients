import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// ===== CART STORE =====
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: { url: string }[];
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  add: (product: any) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const existing = get().items.find(i => i._id === product._id);
        if (existing) {
          if (existing.quantity >= (product.stock || 99)) {
            toast.error('Stock limit reached');
            return;
          }
          set({ items: get().items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...get().items, { ...product, quantity: 1 }] });
        }
        toast.success('Added to cart!');
      },
      remove: (id) => set({ items: get().items.filter(i => i._id !== id) }),
      updateQty: (id, qty) => {
        if (qty < 1) { set({ items: get().items.filter(i => i._id !== id) }); return; }
        set({ items: get().items.map(i => i._id === id ? { ...i, quantity: qty } : i) });
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: '3zf-cart' }
  )
);

// ===== UI STORE (modals, sidebar) =====
interface UIState {
  sidebarOpen: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  setSidebar: (v: boolean) => void;
  setCart: (v: boolean) => void;
  setSearch: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  searchOpen: false,
  setSidebar: (v) => set({ sidebarOpen: v }),
  setCart: (v) => set({ cartOpen: v }),
  setSearch: (v) => set({ searchOpen: v }),
}));
