CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'info',
	`link` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`in_app_enabled` boolean NOT NULL DEFAULT true,
	`toasts_enabled` boolean NOT NULL DEFAULT true,
	`success_enabled` boolean NOT NULL DEFAULT true,
	`warning_enabled` boolean NOT NULL DEFAULT true,
	`error_enabled` boolean NOT NULL DEFAULT true,
	`info_enabled` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `books` ADD `cover_image` varchar(512);--> statement-breakpoint
ALTER TABLE `books` ADD `attachment_file` varchar(512);--> statement-breakpoint
ALTER TABLE `books` ADD `gallery_images` json;--> statement-breakpoint
ALTER TABLE `books` ADD `additional_documents` json;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notification_preferences_userId_idx` ON `notification_preferences` (`user_id`);