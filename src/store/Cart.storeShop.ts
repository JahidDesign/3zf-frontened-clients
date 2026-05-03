import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// CartItem — superset of both old interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  _id:            string;
  name:           string;
  price:          number;
  discountPrice?: number;
  images:         { url: string; publicId?: string }[];
  category?:      string;
  stock:          number;
  quantity:       number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart Store
// ─────────────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];

  /** Add one unit of a product (or increment if already in cart) */
  add: (product: Omit<CartItem, 'quantity'>) => void;

  /** Remove a product entirely */
  remove: (id: string) => void;

  /**
   * Set exact quantity.
   * Alias: updateQty — kept for backward-compat with old CartDrawer calls.
   * Passing qty ≤ 0 removes the item.
   */
  update:    (id: string, quantity: number) => void;
  updateQty: (id: string, quantity: number) => void;

  /** Empty the cart */
  clear: () => void;

  /** Sum of (discountPrice || price) × quantity */
  total: () => number;

  /** Sum of all quantities */
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {

      const setQty = (id: string, quantity: number) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter(i => i._id !== id)
            : state.items.map(i => i._id === id ? { ...i, quantity } : i),
        }));

      return {
        items: [],

        add: (product) => {
          const existing = get().items.find(i => i._id === product._id);
          if (existing) {
            if (existing.quantity >= (product.stock ?? 99)) {
              toast.error('স্টক সীমা পৌঁছে গেছে');
              return;
            }
            set({
              items: get().items.map(i =>
                i._id === product._id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
          } else {
            set({ items: [...get().items, { ...product, quantity: 1 }] });
          }
          toast.success('কার্টে যোগ হয়েছে!');
        },

        remove: (id) =>
          set((state) => ({ items: state.items.filter(i => i._id !== id) })),

        update:    setQty,
        updateQty: setQty,   // ← backward-compat alias

        clear: () => set({ items: [] }),

        total: () =>
          get().items.reduce(
            (s, i) => s + (i.discountPrice ?? i.price) * i.quantity,
            0
          ),

        count: () =>
          get().items.reduce((s, i) => s + i.quantity, 0),
      };
    },
    { name: '3zf-cart' }   // single localStorage key
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// UI Store  (modals, sidebar, cart drawer)
// ─────────────────────────────────────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  cartOpen:    boolean;
  searchOpen:  boolean;
  setSidebar:  (v: boolean) => void;
  setCart:     (v: boolean) => void;
  setSearch:   (v: boolean) => void;
  toggleCart:  () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  cartOpen:    false,
  searchOpen:  false,
  setSidebar:  (v) => set({ sidebarOpen: v }),
  setCart:     (v) => set({ cartOpen: v }),
  setSearch:   (v) => set({ searchOpen: v }),
  toggleCart:  () => set({ cartOpen: !get().cartOpen }),
}));