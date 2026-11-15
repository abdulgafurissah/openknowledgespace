import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductDetailsClient from './ProductDetailsClient';
import ProductCard from '@/components/suq/ProductCard';
import { getProductBySlug, getProductsByCategory } from '@/lib/suq/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found — Open Suq' };
  }

  return {
    title: `${product.title} — Open Suq`,
    description: product.description || `Buy ${product.title} on Open Suq.`,
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      images: [{ url: product.primaryImage }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const related = product.categorySlug
    ? (await getProductsByCategory(product.categorySlug)).filter(p => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
      <Navbar />

      <main>
        <ProductDetailsClient product={product} />

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="almaghrib-tag" style={{ marginBottom: '0.5rem' }}>Recommendations</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>
                You May Also Like
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2rem',
              }}
            >
              {related.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
