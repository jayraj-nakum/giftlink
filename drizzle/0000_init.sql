CREATE TABLE `gifts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`template` text NOT NULL,
	`data` text NOT NULL,
	`to_name` text NOT NULL,
	`from_name` text NOT NULL,
	`owner_token_hash` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	`expires_at` integer,
	`views` integer DEFAULT 0 NOT NULL,
	`first_opened_at` integer,
	`last_opened_at` integer,
	`completed_at` integer,
	`answered_yes_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gifts_slug_unique` ON `gifts` (`slug`);--> statement-breakpoint
CREATE INDEX `gifts_status_idx` ON `gifts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `gifts_expiry_idx` ON `gifts` (`expires_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`gift_id` text NOT NULL,
	`provider` text NOT NULL,
	`order_id` text NOT NULL,
	`payment_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` integer NOT NULL,
	`paid_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_order_id_unique` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_gift_idx` ON `payments` (`gift_id`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`key` text PRIMARY KEY NOT NULL,
	`gift_id` text,
	`bytes` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `uploads_gift_idx` ON `uploads` (`gift_id`);--> statement-breakpoint
CREATE INDEX `uploads_created_idx` ON `uploads` (`created_at`);