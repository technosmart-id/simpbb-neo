CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`published_at` timestamp,
	`organization_id` varchar(36),
	`created_by_id` varchar(36),
	`cover_image` varchar(512),
	`attachment_file` varchar(512),
	`gallery_images` json,
	`additional_documents` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `books_organization_id_idx` ON `books` (`organization_id`);--> statement-breakpoint
CREATE INDEX `books_created_by_id_idx` ON `books` (`created_by_id`);