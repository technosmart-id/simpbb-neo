CREATE TABLE `org_roles` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`is_default_role` boolean NOT NULL DEFAULT false,
	`permissions` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(36) NOT NULL,
	CONSTRAINT `org_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `org_roles_org_slug_idx` UNIQUE(`organization_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `member` ADD `custom_role_id` varchar(36);--> statement-breakpoint
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `org_roles_org_idx` ON `org_roles` (`organization_id`);--> statement-breakpoint
CREATE INDEX `org_roles_created_by_idx` ON `org_roles` (`created_by`);--> statement-breakpoint
CREATE INDEX `member_custom_role_id_idx` ON `member` (`custom_role_id`);