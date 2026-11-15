import { pgTable, text, timestamp, boolean, uuid, integer, numeric, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] }).default('STUDENT').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  // Google Drive file ID for the thumbnail image
  thumbnailDriveId: text('thumbnail_drive_id'),
  instructorId: uuid('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  // Legacy YouTube video URL / ID
  videoUrl: text('video_url'),
  // Gumlet video asset ID for hosted video streaming
  gumletAssetId: text('gumlet_asset_id'),
  // Google Drive file ID for lesson attachment (PDF, notes, etc.)
  driveFileId: text('drive_file_id'),
  driveFileName: text('drive_file_name'),
  driveFileUrl: text('drive_file_url'),
  orderIndex: integer('order_index').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userProgress = pgTable('user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Marketplace ──────────────────────────────────────────────────────────────

export const marketplaceItems = pgTable('marketplace_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  // 'ebook' | 'apk' | 'document' | 'other' | 'merch' | 'garment'
  fileType: text('file_type', { enum: ['ebook', 'apk', 'document', 'other', 'merch', 'garment'] }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).default('0').notNull(),
  isFree: boolean('is_free').default(true).notNull(),
  // Google Drive storage
  driveFileId: text('drive_file_id'),
  downloadUrl: text('download_url'),
  fileMimeType: text('file_mime_type'),
  fileSize: text('file_size'),
  // Thumbnail stored on Drive
  thumbnailUrl: text('thumbnail_url'),
  thumbnailDriveId: text('thumbnail_drive_id'),
  // Author
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => marketplaceItems.id, { onDelete: 'cascade' }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0').notNull(),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date', { withTimezone: true }),
  
  // Banner image stored on Google Drive
  bannerUrl: text('banner_url'),
  bannerDriveId: text('banner_drive_id'),
  
  // Google form embed URL (src in the iframe)
  googleFormUrl: text('google_form_url'),
  
  isPublished: boolean('is_published').default(false).notNull(),
  organizerId: uuid('organizer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  userProgress: many(userProgress),
  marketplaceItems: many(marketplaceItems),
  purchases: many(purchases),
  events: many(events),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const marketplaceItemsRelations = relations(marketplaceItems, ({ one, many }) => ({
  seller: one(users, {
    fields: [marketplaceItems.sellerId],
    references: [users.id],
  }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  item: one(marketplaceItems, {
    fields: [purchases.itemId],
    references: [marketplaceItems.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// OPEN SUQ: INTERNATIONAL POD MARKETPLACE ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

export const suqCategories = pgTable('suq_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  icon: text('icon'),
  image: text('image'),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqProducts = pgTable('suq_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => suqCategories.id, { onDelete: 'set null' }),
  productType: text('product_type', { enum: ['physical_pod', 'digital'] }).default('physical_pod').notNull(),
  // Book specific properties (ISBN, author, pages, binding, language, dimensions, samplePages)
  bookDetails: jsonb('book_details'),
  isPublished: boolean('is_published').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  tags: jsonb('tags'), // Array of string tags e.g. ["kids", "ramadan", "calligraphy"]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqProductImages = pgTable('suq_product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => suqProducts.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  orderIndex: integer('order_index').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
});

export const suqProductVariants = pgTable('suq_product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => suqProducts.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull().unique(),
  podProvider: text('pod_provider').default('prodigi').notNull(),
  podSku: text('pod_sku'), // Prodigi SKU e.g. "GLOBAL-TSH-M-BLK" or "GLOBAL-FAP-8X10"
  title: text('title').notNull(), // e.g. "M / Charcoal", "Hardcover / 120 pages", "16x20 Framed"
  size: text('size'),
  color: text('color'),
  dimensions: text('dimensions'),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0').notNull(),
  retailPrice: numeric('retail_price', { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 12, scale: 2 }),
  weightGrams: integer('weight_grams').default(0),
  stockStatus: text('stock_status').default('in_stock').notNull(), // 'in_stock', 'made_to_order', 'out_of_stock'
  isActive: boolean('is_active').default(true).notNull(),
});

export const suqProductDesigns = pgTable('suq_product_designs', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => suqProducts.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => suqProductVariants.id, { onDelete: 'cascade' }),
  designName: text('design_name').notNull(),
  artworkUrl: text('artwork_url').notNull(), // High-res asset URL (Vercel Blob)
  printArea: text('print_area').default('default').notNull(), // e.g. 'front', 'back', 'wrap'
  resolutionDpi: integer('resolution_dpi'),
  format: text('format').default('png'), // 'pdf', 'png', 'jpeg'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqPricingRules = pgTable('suq_pricing_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ruleType: text('rule_type', { enum: ['fixed_markup', 'percentage_markup'] }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id').references(() => suqCategories.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqCustomerProfiles = pgTable('suq_customer_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  phone: text('phone'),
  defaultCurrency: text('default_currency').default('GHS').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqAddresses = pgTable('suq_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  recipientName: text('recipient_name').notNull(),
  phone: text('phone'),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  stateOrRegion: text('state_or_region'),
  postalCode: text('postal_code'),
  countryCode: text('country_code').default('GH').notNull(), // ISO 2-letter e.g. GH, GB, US
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqCarts = pgTable('suq_carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqCartItems = pgTable('suq_cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => suqCarts.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => suqProductVariants.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqOrders = pgTable('suq_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(), // e.g. "OS-2026-0001"
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  guestEmail: text('guest_email'),
  guestName: text('guest_name'),
  guestPhone: text('guest_phone'),
  shippingAddress: jsonb('shipping_address').notNull(),
  billingAddress: jsonb('billing_address'),
  currency: text('currency').default('GHS').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).default('0').notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending').notNull(),
  fulfilmentStatus: text('fulfilment_status', {
    enum: ['pending', 'submitted', 'in_production', 'shipped', 'delivered', 'failed', 'cancelled']
  }).default('pending').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqOrderItems = pgTable('suq_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => suqOrders.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => suqProductVariants.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => suqProducts.id, { onDelete: 'set null' }),
  titleSnapshot: text('title_snapshot').notNull(),
  skuSnapshot: text('sku_snapshot').notNull(),
  variantTitleSnapshot: text('variant_title_snapshot'),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  productionCostSnapshot: numeric('production_cost_snapshot', { precision: 12, scale: 2 }).default('0').notNull(),
  shippingCostSnapshot: numeric('shipping_cost_snapshot', { precision: 12, scale: 2 }).default('0').notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  artworkUrl: text('artwork_url'),
  attributes: jsonb('attributes'),
});

export const suqPayments = pgTable('suq_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => suqOrders.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').default('PAYSTACK').notNull(),
  reference: text('reference').notNull().unique(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('GHS').notNull(),
  status: text('status', { enum: ['pending', 'success', 'failed'] }).default('pending').notNull(),
  authorizationCode: text('authorization_code'),
  channel: text('channel'), // 'card', 'mobile_money', etc.
  paidAt: timestamp('paid_at', { withTimezone: true }),
  rawResponse: jsonb('raw_response'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqPaymentEvents = pgTable('suq_payment_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: text('reference').notNull(),
  eventType: text('event_type').notNull(), // e.g. "charge.success"
  rawPayload: jsonb('raw_payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqFulfilmentOrders = pgTable('suq_fulfilment_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => suqOrders.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').default('PRODIGI').notNull(),
  externalOrderId: text('external_order_id'), // Prodigi order ID e.g. "ord_12345"
  status: text('status', {
    enum: ['draft', 'submitted', 'in_production', 'shipped', 'cancelled', 'failed']
  }).default('draft').notNull(),
  trackingNumber: text('tracking_number'),
  trackingUrl: text('tracking_url'),
  carrier: text('carrier'),
  shippingMethod: text('shipping_method').default('Standard').notNull(),
  cost: numeric('cost', { precision: 12, scale: 2 }),
  rawPayload: jsonb('raw_payload'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqFulfilmentEvents = pgTable('suq_fulfilment_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  fulfilmentOrderId: uuid('fulfilment_order_id').references(() => suqFulfilmentOrders.id, { onDelete: 'cascade' }).notNull(),
  eventName: text('event_name').notNull(),
  description: text('description'),
  rawPayload: jsonb('raw_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqDiscounts = pgTable('suq_discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  minOrderValue: numeric('min_order_value', { precision: 12, scale: 2 }).default('0'),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
});

export const suqReviews = pgTable('suq_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => suqProducts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  reviewText: text('review_text'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqNewsletter = pgTable('suq_newsletter', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source').default('suq_storefront').notNull(),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const suqAdminAuditLogs = pgTable('suq_admin_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  targetEntity: text('target_entity').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations for Open Suq ──────────────────────────────────────────────────

export const suqCategoriesRelations = relations(suqCategories, ({ one, many }) => ({
  parent: one(suqCategories, {
    fields: [suqCategories.parentId],
    references: [suqCategories.id],
    relationName: 'categoryHierarchy',
  }),
  subcategories: many(suqCategories, {
    relationName: 'categoryHierarchy',
  }),
  products: many(suqProducts),
}));

export const suqProductsRelations = relations(suqProducts, ({ one, many }) => ({
  category: one(suqCategories, {
    fields: [suqProducts.categoryId],
    references: [suqCategories.id],
  }),
  images: many(suqProductImages),
  variants: many(suqProductVariants),
  designs: many(suqProductDesigns),
  reviews: many(suqReviews),
}));

export const suqProductImagesRelations = relations(suqProductImages, ({ one }) => ({
  product: one(suqProducts, {
    fields: [suqProductImages.productId],
    references: [suqProducts.id],
  }),
}));

export const suqProductVariantsRelations = relations(suqProductVariants, ({ one, many }) => ({
  product: one(suqProducts, {
    fields: [suqProductVariants.productId],
    references: [suqProducts.id],
  }),
  designs: many(suqProductDesigns),
  cartItems: many(suqCartItems),
  orderItems: many(suqOrderItems),
}));

export const suqProductDesignsRelations = relations(suqProductDesigns, ({ one }) => ({
  product: one(suqProducts, {
    fields: [suqProductDesigns.productId],
    references: [suqProducts.id],
  }),
  variant: one(suqProductVariants, {
    fields: [suqProductDesigns.variantId],
    references: [suqProductVariants.id],
  }),
}));

export const suqCartsRelations = relations(suqCarts, ({ one, many }) => ({
  user: one(users, {
    fields: [suqCarts.userId],
    references: [users.id],
  }),
  items: many(suqCartItems),
}));

export const suqCartItemsRelations = relations(suqCartItems, ({ one }) => ({
  cart: one(suqCarts, {
    fields: [suqCartItems.cartId],
    references: [suqCarts.id],
  }),
  variant: one(suqProductVariants, {
    fields: [suqCartItems.variantId],
    references: [suqProductVariants.id],
  }),
}));

export const suqOrdersRelations = relations(suqOrders, ({ one, many }) => ({
  user: one(users, {
    fields: [suqOrders.userId],
    references: [users.id],
  }),
  items: many(suqOrderItems),
  payments: many(suqPayments),
  fulfilmentOrders: many(suqFulfilmentOrders),
}));

export const suqOrderItemsRelations = relations(suqOrderItems, ({ one }) => ({
  order: one(suqOrders, {
    fields: [suqOrderItems.orderId],
    references: [suqOrders.id],
  }),
  variant: one(suqProductVariants, {
    fields: [suqOrderItems.variantId],
    references: [suqProductVariants.id],
  }),
  product: one(suqProducts, {
    fields: [suqOrderItems.productId],
    references: [suqProducts.id],
  }),
}));

export const suqPaymentsRelations = relations(suqPayments, ({ one }) => ({
  order: one(suqOrders, {
    fields: [suqPayments.orderId],
    references: [suqOrders.id],
  }),
}));

export const suqFulfilmentOrdersRelations = relations(suqFulfilmentOrders, ({ one, many }) => ({
  order: one(suqOrders, {
    fields: [suqFulfilmentOrders.orderId],
    references: [suqOrders.id],
  }),
  events: many(suqFulfilmentEvents),
}));

export const suqFulfilmentEventsRelations = relations(suqFulfilmentEvents, ({ one }) => ({
  fulfilmentOrder: one(suqFulfilmentOrders, {
    fields: [suqFulfilmentEvents.fulfilmentOrderId],
    references: [suqFulfilmentOrders.id],
  }),
}));

export const suqReviewsRelations = relations(suqReviews, ({ one }) => ({
  product: one(suqProducts, {
    fields: [suqReviews.productId],
    references: [suqProducts.id],
  }),
  user: one(users, {
    fields: [suqReviews.userId],
    references: [users.id],
  }),
}));


