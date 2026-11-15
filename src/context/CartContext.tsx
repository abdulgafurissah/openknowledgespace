'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string; // unique item key: `${variantId}`
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  slug: string;
  price: string; // price in GHS string
  image: string;
  quantity: number;
  sku: string;
  podSku?: string;
  weightGrams?: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  currency: string;
  setCurrency: (c: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'id'>, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'opensuq_cart_v1';
const CURRENCY_STORAGE_KEY = 'opensuq_currency_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrencyState] = useState('GHS');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCurr = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (storedCurr) {
        setCurrencyState(storedCurr);
      }
    } catch {
      // Ignore localStorage read errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {}
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const addItem = (item: Omit<CartItem, 'id'>, qty: number = 1) => {
    setItems(prev => {
      const key = item.variantId;
      const existingIndex = prev.findIndex(i => i.variantId === item.variantId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [...prev, { ...item, id: key, quantity: qty }];
    });
    setIsOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(i => {
          if (i.variantId === variantId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price || '0') * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        currency,
        setCurrency,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
