import { pgTable, text, timestamp, boolean, uuid, integer, numeric } from 'drizzle-orm/pg-core';
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

