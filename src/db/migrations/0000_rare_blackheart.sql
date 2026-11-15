CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"thumbnail_drive_id" text,
	"instructor_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp with time zone,
	"banner_url" text,
	"banner_drive_id" text,
	"google_form_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"organizer_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"video_url" text,
	"gumlet_asset_id" text,
	"drive_file_id" text,
	"drive_file_name" text,
	"drive_file_url" text,
	"order_index" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_type" text NOT NULL,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"drive_file_id" text,
	"download_url" text,
	"file_mime_type" text,
	"file_size" text,
	"thumbnail_url" text,
	"thumbnail_drive_id" text,
	"seller_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order_index" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"recipient_name" text NOT NULL,
	"phone" text,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state_or_region" text,
	"postal_code" text,
	"country_code" text DEFAULT 'GH' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"target_entity" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" text NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_carts_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "suq_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"icon" text,
	"image" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "suq_customer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone" text,
	"default_currency" text DEFAULT 'GHS' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_customer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "suq_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_order_value" numeric(12, 2) DEFAULT '0',
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "suq_discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "suq_fulfilment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fulfilment_order_id" uuid NOT NULL,
	"event_name" text NOT NULL,
	"description" text,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_fulfilment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text DEFAULT 'PRODIGI' NOT NULL,
	"external_order_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"tracking_number" text,
	"tracking_url" text,
	"carrier" text,
	"shipping_method" text DEFAULT 'Standard' NOT NULL,
	"cost" numeric(12, 2),
	"raw_payload" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_newsletter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'suq_storefront' NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_newsletter_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "suq_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_id" uuid,
	"title_snapshot" text NOT NULL,
	"sku_snapshot" text NOT NULL,
	"variant_title_snapshot" text,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"production_cost_snapshot" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_cost_snapshot" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"artwork_url" text,
	"attributes" jsonb
);
--> statement-breakpoint
CREATE TABLE "suq_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"user_id" uuid,
	"guest_email" text,
	"guest_name" text,
	"guest_phone" text,
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"shipping_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"fulfilment_status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "suq_payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"event_type" text NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text DEFAULT 'PAYSTACK' NOT NULL,
	"reference" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"authorization_code" text,
	"channel" text,
	"paid_at" timestamp with time zone,
	"raw_response" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_payments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "suq_pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"rule_type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"category_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_product_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"design_name" text NOT NULL,
	"artwork_url" text NOT NULL,
	"print_area" text DEFAULT 'default' NOT NULL,
	"resolution_dpi" integer,
	"format" text DEFAULT 'png',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suq_product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"pod_provider" text DEFAULT 'prodigi' NOT NULL,
	"pod_sku" text,
	"title" text NOT NULL,
	"size" text,
	"color" text,
	"dimensions" text,
	"cost_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"retail_price" numeric(12, 2) NOT NULL,
	"compare_at_price" numeric(12, 2),
	"weight_grams" integer DEFAULT 0,
	"stock_status" text DEFAULT 'in_stock' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "suq_product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "suq_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category_id" uuid,
	"product_type" text DEFAULT 'physical_pod' NOT NULL,
	"book_details" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suq_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "suq_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid,
	"reviewer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'STUDENT' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_item_id_marketplace_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."marketplace_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_addresses" ADD CONSTRAINT "suq_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_admin_audit_logs" ADD CONSTRAINT "suq_admin_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_cart_items" ADD CONSTRAINT "suq_cart_items_cart_id_suq_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."suq_carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_cart_items" ADD CONSTRAINT "suq_cart_items_variant_id_suq_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."suq_product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_carts" ADD CONSTRAINT "suq_carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_customer_profiles" ADD CONSTRAINT "suq_customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_fulfilment_events" ADD CONSTRAINT "suq_fulfilment_events_fulfilment_order_id_suq_fulfilment_orders_id_fk" FOREIGN KEY ("fulfilment_order_id") REFERENCES "public"."suq_fulfilment_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_fulfilment_orders" ADD CONSTRAINT "suq_fulfilment_orders_order_id_suq_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."suq_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_order_items" ADD CONSTRAINT "suq_order_items_order_id_suq_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."suq_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_order_items" ADD CONSTRAINT "suq_order_items_variant_id_suq_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."suq_product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_order_items" ADD CONSTRAINT "suq_order_items_product_id_suq_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."suq_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_orders" ADD CONSTRAINT "suq_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_payments" ADD CONSTRAINT "suq_payments_order_id_suq_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."suq_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_pricing_rules" ADD CONSTRAINT "suq_pricing_rules_category_id_suq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."suq_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_product_designs" ADD CONSTRAINT "suq_product_designs_product_id_suq_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."suq_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_product_designs" ADD CONSTRAINT "suq_product_designs_variant_id_suq_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."suq_product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_product_images" ADD CONSTRAINT "suq_product_images_product_id_suq_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."suq_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_product_variants" ADD CONSTRAINT "suq_product_variants_product_id_suq_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."suq_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_products" ADD CONSTRAINT "suq_products_category_id_suq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."suq_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_reviews" ADD CONSTRAINT "suq_reviews_product_id_suq_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."suq_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suq_reviews" ADD CONSTRAINT "suq_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;