import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import {
  suqProducts,
  suqProductVariants,
  suqProductImages,
  suqProductDesigns,
  suqCategories,
} from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await db
      .select()
      .from(suqProducts)
      .orderBy(desc(suqProducts.createdAt));

    if (products.length === 0) return NextResponse.json([]);

    const productIds = products.map(p => p.id);

    const [variants, images, designs, categories] = await Promise.all([
      db.select().from(suqProductVariants).where(inArray(suqProductVariants.productId, productIds)),
      db.select().from(suqProductImages).where(inArray(suqProductImages.productId, productIds)),
      db.select().from(suqProductDesigns).where(inArray(suqProductDesigns.productId, productIds)),
      db.select().from(suqCategories),
    ]);

    const catMap = new Map(categories.map(c => [c.id, c.name]));

    const enriched = products.map(p => ({
      ...p,
      categoryName: p.categoryId ? catMap.get(p.categoryId) : 'Uncategorized',
      variants: variants.filter(v => v.productId === p.id),
      images: images.filter(img => img.productId === p.id),
      designs: designs.filter(d => d.productId === p.id),
    }));

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error('[Admin Products GET Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      categoryId,
      productType = 'physical_pod',
      bookDetails,
      isPublished = true,
      isFeatured = false,
      tags = [],
      images = [],
      variants = [],
      artworkUrl,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    // 1. Insert product
    const [product] = await db
      .insert(suqProducts)
      .values({
        title,
        slug,
        description,
        categoryId: categoryId || null,
        productType,
        bookDetails: bookDetails || null,
        isPublished,
        isFeatured,
        tags,
      })
      .returning();

    // 2. Insert images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.insert(suqProductImages).values({
          productId: product.id,
          url: images[i],
          orderIndex: i,
          isPrimary: i === 0,
        });
      }
    }

    // 3. Insert variants
    if (variants.length > 0) {
      for (const v of variants) {
        const [insertedVar] = await db
          .insert(suqProductVariants)
          .values({
            productId: product.id,
            sku: v.sku || `OS-${product.slug.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            podProvider: 'prodigi',
            podSku: v.podSku || null,
            title: v.title || 'Standard',
            size: v.size || null,
            color: v.color || null,
            dimensions: v.dimensions || null,
            costPrice: String(v.costPrice || '0'),
            retailPrice: String(v.retailPrice || '100'),
            compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : null,
            weightGrams: parseInt(v.weightGrams, 10) || 0,
            stockStatus: 'in_stock',
            isActive: true,
          })
          .returning();

        // 4. Attach design artwork if provided
        if (artworkUrl) {
          await db.insert(suqProductDesigns).values({
            productId: product.id,
            variantId: insertedVar.id,
            designName: `${product.title} Print File`,
            artworkUrl,
            printArea: 'default',
            format: artworkUrl.endsWith('.pdf') ? 'pdf' : 'png',
          });
        }
      }
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error('[Admin Product POST Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
