import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout — Open Suq',
  description: 'Complete your Open Suq order securely with Paystack and Prodigi international fulfilment.',
};

export default function CheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
      <Navbar />
      <main>
        <CheckoutClient />
      </main>
    </div>
  );
}
