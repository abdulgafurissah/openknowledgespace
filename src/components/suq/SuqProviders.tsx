'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

export default function SuqProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
