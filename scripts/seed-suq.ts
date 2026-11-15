import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log('🌱 Seeding Open Suq categories and sample catalogue...');

  // 1. Categories
  const mainCategories = [
    {
      name: 'Books & Publications',
      slug: 'books-publications',
      description: 'Islamic children\'s books, history, journals, workbooks, and inspiring educational publications.',
      icon: '📖',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 1,
      subcategories: [
        { name: 'Islamic Children\'s Books', slug: 'islamic-childrens-books' },
        { name: 'Stories of the Prophets', slug: 'stories-of-the-prophets' },
        { name: 'Islamic History', slug: 'islamic-history' },
        { name: 'Activity & Workbooks', slug: 'activity-workbooks' },
        { name: 'Journals & Notebooks', slug: 'journals-notebooks' },
      ],
    },
    {
      name: 'Clothing & Apparel',
      slug: 'clothing-apparel',
      description: 'Premium organic cotton t-shirts, hoodies, and sweatshirts featuring bespoke Arabic typography and African-inspired designs.',
      icon: '👕',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 2,
      subcategories: [
        { name: 'T-Shirts', slug: 't-shirts' },
        { name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts' },
        { name: 'Arabic Calligraphy Apparel', slug: 'calligraphy-apparel' },
        { name: 'African-Inspired Apparel', slug: 'african-inspired-apparel' },
      ],
    },
    {
      name: 'Wall Art & Decor',
      slug: 'wall-art-decor',
      description: 'Museum-quality canvas prints and framed posters celebrating minimalist Islamic calligraphy and cultural artwork.',
      icon: '🖼️',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 3,
      subcategories: [
        { name: 'Canvas Prints', slug: 'canvas-prints' },
        { name: 'Framed Posters', slug: 'framed-posters' },
        { name: 'Minimalist Calligraphy', slug: 'minimalist-calligraphy' },
        { name: 'Educational Wall Art', slug: 'educational-wall-art' },
      ],
    },
    {
      name: 'Accessories & Merchandise',
      slug: 'accessories-merchandise',
      description: 'Durable ceramic mugs, cotton tote bags, enamel pins, and lifestyle accessories designed with meaning.',
      icon: '👜',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 4,
      subcategories: [
        { name: 'Ceramic Mugs', slug: 'ceramic-mugs' },
        { name: 'Tote Bags', slug: 'tote-bags' },
        { name: 'Phone Cases', slug: 'phone-cases' },
        { name: 'Stickers & Stationery Pins', slug: 'stickers-pins' },
      ],
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Thoughtfully printed cushions, decorative throws, and warm lifestyle accents for conscious homes.',
      icon: '🏡',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 5,
      subcategories: [
        { name: 'Printed Cushions', slug: 'printed-cushions' },
        { name: 'Living Decor', slug: 'living-decor' },
      ],
    },
    {
      name: 'Stationery & Educational Materials',
      slug: 'stationery-educational-materials',
      description: 'Islamic study planners, Arabic alphabet flashcards, habit trackers, and learning aids for students and educators.',
      icon: '📚',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1000&q=80',
      orderIndex: 6,
      subcategories: [
        { name: 'Planners & Calendars', slug: 'planners-calendars' },
        { name: 'Flashcards & Study Cards', slug: 'flashcards-study-cards' },
      ],
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of mainCategories) {
    const existing = await db
      .select()
      .from(schema.suqCategories)
      .where(eq(schema.suqCategories.slug, cat.slug));

    let catId: string;
    if (existing.length > 0) {
      catId = existing[0].id;
      categoryMap.set(cat.slug, catId);
    } else {
      const [inserted] = await db
        .insert(schema.suqCategories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          image: cat.image,
          orderIndex: cat.orderIndex,
          isActive: true,
        })
        .returning();
      catId = inserted.id;
      categoryMap.set(cat.slug, catId);
    }

    // Insert subcategories
    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      const subExisting = await db
        .select()
        .from(schema.suqCategories)
        .where(eq(schema.suqCategories.slug, sub.slug));

      if (subExisting.length === 0) {
        const [insertedSub] = await db
          .insert(schema.suqCategories)
          .values({
            name: sub.name,
            slug: sub.slug,
            parentId: catId,
            orderIndex: i + 1,
            isActive: true,
          })
          .returning();
        categoryMap.set(sub.slug, insertedSub.id);
      } else {
        categoryMap.set(sub.slug, subExisting[0].id);
      }
    }
  }

  console.log(`✅ Saved ${categoryMap.size} categories and subcategories.`);

  // 2. Initial Sample Products
  const sampleProducts = [
    {
      title: 'Stories of the Prophets for Young Minds',
      slug: 'stories-of-the-prophets-young-minds',
      categorySlug: 'books-publications',
      productType: 'physical_pod' as const,
      isFeatured: true,
      description: 'An elegantly written and illustrated collection of the lives and timeless lessons of the Prophets of Islam, tailored for young Muslim readers and families. Printed on premium archival heavyweight paper with a soft velvet matte cover.',
      bookDetails: {
        author: 'Open Knowledge Space Editorial Team',
        isbn: '978-9988-1-2345-6',
        pages: 148,
        binding: 'Hardcover Case Laminate',
        language: 'English with Arabic Calligraphy',
        dimensions: '8.5 x 11 in (216 x 279 mm)',
        ageGroup: '7-14 years',
        samplePages: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
        ]
      },
      tags: ['books', 'prophets', 'children', 'bestseller', 'education'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80', isPrimary: false },
      ],
      variants: [
        {
          title: 'Hardcover Collector Edition',
          sku: 'OS-BK-SOTP-HC',
          podSku: 'GLOBAL-BOK-HC-8.5X11',
          size: '8.5 x 11 in',
          dimensions: '8.5 x 11 inches',
          costPrice: '160.00', // GHS
          retailPrice: '280.00',
          compareAtPrice: '320.00',
          weightGrams: 620,
        },
        {
          title: 'Paperback Edition',
          sku: 'OS-BK-SOTP-PB',
          podSku: 'GLOBAL-BOK-PB-8.5X11',
          size: '8.5 x 11 in',
          dimensions: '8.5 x 11 inches',
          costPrice: '95.00',
          retailPrice: '185.00',
          compareAtPrice: '220.00',
          weightGrams: 420,
        },
      ],
    },
    {
      title: 'Sabr & Shukr (Patience & Gratitude) Organic T-Shirt',
      slug: 'sabr-and-shukr-organic-tshirt',
      categorySlug: 'clothing-apparel',
      productType: 'physical_pod' as const,
      isFeatured: true,
      description: 'Crafted from 100% combed organic ring-spun cotton (180 gsm). Features bespoke Arabic calligraphy of "Sabr & Shukr" on the left chest and minimalist typography along the spine. Ethically made and printed with water-based eco-friendly inks.',
      tags: ['clothing', 'tshirt', 'calligraphy', 'sabr', 'organic'],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80', isPrimary: false },
      ],
      variants: [
        { title: 'Jet Black / M', sku: 'OS-TSH-SS-BLK-M', podSku: 'GLOBAL-TSH-M-BLK', size: 'M', color: 'Jet Black', costPrice: '110.00', retailPrice: '220.00', weightGrams: 200 },
        { title: 'Jet Black / L', sku: 'OS-TSH-SS-BLK-L', podSku: 'GLOBAL-TSH-L-BLK', size: 'L', color: 'Jet Black', costPrice: '110.00', retailPrice: '220.00', weightGrams: 220 },
        { title: 'Jet Black / XL', sku: 'OS-TSH-SS-BLK-XL', podSku: 'GLOBAL-TSH-XL-BLK', size: 'XL', color: 'Jet Black', costPrice: '110.00', retailPrice: '220.00', weightGrams: 240 },
        { title: 'Ivory Sand / M', sku: 'OS-TSH-SS-IVO-M', podSku: 'GLOBAL-TSH-M-NAT', size: 'M', color: 'Ivory Sand', costPrice: '110.00', retailPrice: '220.00', weightGrams: 200 },
        { title: 'Ivory Sand / L', sku: 'OS-TSH-SS-IVO-L', podSku: 'GLOBAL-TSH-L-NAT', size: 'L', color: 'Ivory Sand', costPrice: '110.00', retailPrice: '220.00', weightGrams: 220 },
      ],
    },
    {
      title: 'Ayat al-Kursi Minimalist Gold & Charcoal Framed Canvas',
      slug: 'ayat-al-kursi-framed-canvas',
      categorySlug: 'wall-art-decor',
      productType: 'physical_pod' as const,
      isFeatured: true,
      description: 'A striking fine-art reproduction of Ayat al-Kursi in modern Thuluth script with metallic gold foil textures on deep charcoal canvas. Mounted in a sustainably sourced solid wood floating frame.',
      tags: ['wall-art', 'calligraphy', 'quran', 'framed-canvas', 'living-room'],
      images: [
        { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80', isPrimary: false },
      ],
      variants: [
        { title: '16 x 24 in / Black Floating Frame', sku: 'OS-WA-AAK-16X24-BLK', podSku: 'GLOBAL-CAN-16X24-BLK', size: '16x24 in', dimensions: '40 x 60 cm', costPrice: '320.00', retailPrice: '580.00', compareAtPrice: '680.00', weightGrams: 1400 },
        { title: '24 x 36 in / Black Floating Frame', sku: 'OS-WA-AAK-24X36-BLK', podSku: 'GLOBAL-CAN-24X36-BLK', size: '24x36 in', dimensions: '60 x 90 cm', costPrice: '480.00', retailPrice: '890.00', compareAtPrice: '1050.00', weightGrams: 2200 },
      ],
    },
    {
      title: 'Bismillah Morning Ceramic Coffee & Tea Mug (15oz)',
      slug: 'bismillah-morning-ceramic-mug-15oz',
      categorySlug: 'accessories-merchandise',
      productType: 'physical_pod' as const,
      isFeatured: false,
      description: 'Start every morning with intention. High-grade glossy ceramic mug with double-sided gold-toned Bismillah calligraphy. Dishwasher and microwave safe.',
      tags: ['mug', 'accessories', 'kitchen', 'gift', 'bismillah'],
      images: [
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
      ],
      variants: [
        { title: '15 oz / Gloss White & Amber', sku: 'OS-MG-BSM-15OZ', podSku: 'GLOBAL-MUG-15OZ-WHT', size: '15 oz', costPrice: '55.00', retailPrice: '120.00', weightGrams: 450 },
      ],
    },
    {
      title: 'Daily Barakah Islamic Productivity Planner',
      slug: 'daily-barakah-productivity-planner',
      categorySlug: 'stationery-educational-materials',
      productType: 'physical_pod' as const,
      isFeatured: true,
      description: 'A 90-day undated spiral-bound planner harmonising Salah times, daily Quran goals, habit tracking, and high-impact task prioritisation. Built for students, professionals, and parents.',
      bookDetails: {
        author: 'Open Knowledge Space Productivity Lab',
        isbn: '978-9988-1-9876-5',
        pages: 210,
        binding: 'Gold Wire-O Spiral Bound',
        language: 'English & Arabic',
        dimensions: '7 x 9.5 in',
      },
      tags: ['stationery', 'planner', 'productivity', 'habits', 'ramadan'],
      images: [
        { url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
      ],
      variants: [
        { title: 'Standard Spiral Edition', sku: 'OS-PL-DB-SPIRAL', podSku: 'GLOBAL-NOT-SPIRAL-A5', size: 'A5 (7x9.5 in)', costPrice: '75.00', retailPrice: '160.00', compareAtPrice: '190.00', weightGrams: 380 },
      ],
    },
  ];

  for (const prod of sampleProducts) {
    const existing = await db
      .select()
      .from(schema.suqProducts)
      .where(eq(schema.suqProducts.slug, prod.slug));

    if (existing.length > 0) {
      console.log(`Product "${prod.title}" already exists, skipping.`);
      continue;
    }

    const categoryId = categoryMap.get(prod.categorySlug);

    const [insertedProd] = await db
      .insert(schema.suqProducts)
      .values({
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        categoryId: categoryId ?? null,
        productType: prod.productType,
        bookDetails: (prod as any).bookDetails ?? null,
        isPublished: true,
        isFeatured: prod.isFeatured,
        tags: prod.tags,
      })
      .returning();

    // Insert images
    for (let i = 0; i < prod.images.length; i++) {
      await db.insert(schema.suqProductImages).values({
        productId: insertedProd.id,
        url: prod.images[i].url,
        orderIndex: i,
        isPrimary: prod.images[i].isPrimary,
      });
    }

    // Insert variants
    for (const v of prod.variants) {
      await db.insert(schema.suqProductVariants).values({
        productId: insertedProd.id,
        sku: v.sku,
        podProvider: 'prodigi',
        podSku: v.podSku,
        title: v.title,
        size: (v as any).size ?? null,
        color: (v as any).color ?? null,
        dimensions: (v as any).dimensions ?? null,
        costPrice: v.costPrice,
        retailPrice: v.retailPrice,
        compareAtPrice: (v as any).compareAtPrice ?? null,
        weightGrams: v.weightGrams,
        stockStatus: 'in_stock',
        isActive: true,
      });
    }

    console.log(`✅ Seeded product: ${prod.title}`);
  }

  // 3. Pricing Rule
  const existingRules = await db.select().from(schema.suqPricingRules);
  if (existingRules.length === 0) {
    await db.insert(schema.suqPricingRules).values({
      name: 'Default 45% POD Margin',
      ruleType: 'percentage_markup',
      value: '45.00',
      isActive: true,
    });
    console.log('✅ Created default pricing rule.');
  }

  console.log('🎉 Open Suq initial seed successfully completed!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
