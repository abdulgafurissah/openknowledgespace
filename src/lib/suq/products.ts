import { db } from '@/db';
import {
  suqCategories,
  suqProducts,
  suqProductVariants,
  suqProductImages,
  suqReviews,
} from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export interface SuqProductWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  productType: string;
  bookDetails: any | null;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[] | null;
  createdAt: Date;
  images: {
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    orderIndex: number;
  }[];
  variants: {
    id: string;
    sku: string;
    podSku: string | null;
    title: string;
    size: string | null;
    color: string | null;
    dimensions: string | null;
    costPrice: string;
    retailPrice: string;
    compareAtPrice: string | null;
    weightGrams: number | null;
    stockStatus: string;
    isActive: boolean;
  }[];
  primaryImage: string;
  startingPrice: string;
  compareAtPrice: string | null;
}

export async function getCategories() {
  try {
    const categories = await db
      .select()
      .from(suqCategories)
      .where(and(eq(suqCategories.isActive, true), sql`${suqCategories.parentId} IS NULL`))
      .orderBy(suqCategories.orderIndex);

    // Get subcategories for each
    const allSubcategories = await db
      .select()
      .from(suqCategories)
      .where(and(eq(suqCategories.isActive, true), sql`${suqCategories.parentId} IS NOT NULL`))
      .orderBy(suqCategories.orderIndex);

    return categories.map(cat => ({
      ...cat,
      subcategories: allSubcategories.filter(sub => sub.parentId === cat.id),
    }));
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const [category] = await db
      .select()
      .from(suqCategories)
      .where(and(eq(suqCategories.slug, slug), eq(suqCategories.isActive, true)));

    if (!category) return null;

    const subcategories = await db
      .select()
      .from(suqCategories)
      .where(and(eq(suqCategories.parentId, category.id), eq(suqCategories.isActive, true)))
      .orderBy(suqCategories.orderIndex);

    return {
      ...category,
      subcategories,
    };
  } catch (err) {
    console.error('Error fetching category by slug:', err);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<SuqProductWithDetails[]> {
  try {
    const products = await db
      .select()
      .from(suqProducts)
      .where(and(eq(suqProducts.isPublished, true), eq(suqProducts.isFeatured, true)))
      .orderBy(desc(suqProducts.createdAt));

    return enrichProducts(products);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return [];
  }
}

export async function getRecentProducts(limit: number = 8): Promise<SuqProductWithDetails[]> {
  try {
    const products = await db
      .select()
      .from(suqProducts)
      .where(eq(suqProducts.isPublished, true))
      .orderBy(desc(suqProducts.createdAt))
      .limit(limit);

    return enrichProducts(products);
  } catch (err) {
    console.error('Error fetching recent products:', err);
    return [];
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<SuqProductWithDetails[]> {
  try {
    const [cat] = await db
      .select()
      .from(suqCategories)
      .where(eq(suqCategories.slug, categorySlug));

    if (!cat) return [];

    // Also include subcategory IDs if this is a parent category
    const subcats = await db
      .select()
      .from(suqCategories)
      .where(eq(suqCategories.parentId, cat.id));

    const categoryIds = [cat.id, ...subcats.map(s => s.id)];

    const products = await db
      .select()
      .from(suqProducts)
      .where(and(eq(suqProducts.isPublished, true), inArray(suqProducts.categoryId, categoryIds)))
      .orderBy(desc(suqProducts.createdAt));

    return enrichProducts(products);
  } catch (err) {
    console.error('Error fetching products by category:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<SuqProductWithDetails | null> {
  try {
    const [product] = await db
      .select()
      .from(suqProducts)
      .where(and(eq(suqProducts.slug, slug), eq(suqProducts.isPublished, true)));

    if (!product) return null;

    const [enriched] = await enrichProducts([product]);
    return enriched ?? null;
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return null;
  }
}

async function enrichProducts(products: (typeof suqProducts.$inferSelect)[]): Promise<SuqProductWithDetails[]> {
  if (products.length === 0) return [];

  const productIds = products.map(p => p.id);

  // Fetch images
  const images = await db
    .select()
    .from(suqProductImages)
    .where(inArray(suqProductImages.productId, productIds))
    .orderBy(suqProductImages.orderIndex);

  // Fetch variants
  const variants = await db
    .select()
    .from(suqProductVariants)
    .where(and(inArray(suqProductVariants.productId, productIds), eq(suqProductVariants.isActive, true)));

  // Fetch categories
  const categoryIds = products.map(p => p.categoryId).filter(Boolean) as string[];
  const categories = categoryIds.length > 0
    ? await db.select().from(suqCategories).where(inArray(suqCategories.id, categoryIds))
    : [];

  const catMap = new Map(categories.map(c => [c.id, c]));

  return products.map(p => {
    const prodImages = images.filter(img => img.productId === p.id);
    const prodVariants = variants.filter(v => v.productId === p.id);
    const cat = p.categoryId ? catMap.get(p.categoryId) : undefined;

    const primaryImg = prodImages.find(i => i.isPrimary)?.url ||
      prodImages[0]?.url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

    const prices = prodVariants.map(v => parseFloat(v.retailPrice));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const comparePrice = prodVariants.find(v => v.compareAtPrice)?.compareAtPrice || null;

    return {
      ...p,
      categoryName: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
      tags: (p.tags as string[]) || [],
      images: prodImages,
      variants: prodVariants,
      primaryImage: primaryImg,
      startingPrice: minPrice.toFixed(2),
      compareAtPrice: comparePrice,
    };
  });
}
