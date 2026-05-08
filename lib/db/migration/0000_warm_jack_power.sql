CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(255),
	`team_id` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`inviter_id` varchar(36) NOT NULL,
	CONSTRAINT `invitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(255) NOT NULL DEFAULT 'member',
	`created_at` timestamp(3) NOT NULL,
	CONSTRAINT `member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_access_token` (
	`id` varchar(36) NOT NULL,
	`access_token` varchar(255),
	`refresh_token` varchar(255),
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`client_id` varchar(36),
	`user_id` varchar(36),
	`scopes` text,
	`created_at` timestamp(3),
	`updated_at` timestamp(3),
	CONSTRAINT `oauth_access_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_access_token_access_token_unique` UNIQUE(`access_token`),
	CONSTRAINT `oauth_access_token_refresh_token_unique` UNIQUE(`refresh_token`)
);
--> statement-breakpoint
CREATE TABLE `oauth_application` (
	`id` varchar(36) NOT NULL,
	`name` text,
	`icon` text,
	`metadata` text,
	`client_id` varchar(255),
	`client_secret` text,
	`redirect_urls` text,
	`type` text,
	`disabled` boolean DEFAULT false,
	`user_id` varchar(36),
	`created_at` timestamp(3),
	`updated_at` timestamp(3),
	CONSTRAINT `oauth_application_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_application_client_id_unique` UNIQUE(`client_id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_consent` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`user_id` varchar(36),
	`scopes` text,
	`created_at` timestamp(3),
	`updated_at` timestamp(3),
	`consent_given` boolean,
	CONSTRAINT `oauth_consent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo` text,
	`created_at` timestamp(3) NOT NULL,
	`metadata` text,
	CONSTRAINT `organization_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `organization_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	`active_organization_id` text,
	`active_team_id` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL,
	`updated_at` timestamp(3),
	CONSTRAINT `team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_member` (
	`id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp(3),
	CONSTRAINT `team_member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` varchar(36) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `two_factor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`two_factor_enabled` boolean DEFAULT false,
	`username` varchar(255),
	`display_username` text,
	`phone_number` varchar(255),
	`phone_number_verified` boolean,
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`is_anonymous` boolean DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`),
	CONSTRAINT `user_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `casbin_rule` (
	`id` varchar(36) NOT NULL,
	`ptype` varchar(255) NOT NULL,
	`v0` varchar(255),
	`v1` varchar(255),
	`v2` varchar(255),
	`v3` varchar(255),
	`v4` varchar(255),
	`v5` text,
	CONSTRAINT `casbin_rule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'info',
	`link` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
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
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_ownership` (
	`id` varchar(36) NOT NULL,
	`resource_type` varchar(100) NOT NULL,
	`resource_id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resource_ownership_id` PRIMARY KEY(`id`),
	CONSTRAINT `resource_ownership_unique_idx` UNIQUE(`resource_type`,`resource_id`,`owner_id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_client_id_oauth_application_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_application`(`client_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_application` ADD CONSTRAINT `oauth_application_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_consent` ADD CONSTRAINT `oauth_consent_client_id_oauth_application_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_application`(`client_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_consent` ADD CONSTRAINT `oauth_consent_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team` ADD CONSTRAINT `team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_ownership` ADD CONSTRAINT `resource_ownership_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessToken_clientId_idx` ON `oauth_access_token` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessToken_userId_idx` ON `oauth_access_token` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthApplication_userId_idx` ON `oauth_application` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthConsent_clientId_idx` ON `oauth_consent` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthConsent_userId_idx` ON `oauth_consent` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `team_organizationId_idx` ON `team` (`organization_id`);--> statement-breakpoint
CREATE INDEX `teamMember_teamId_idx` ON `team_member` (`team_id`);--> statement-breakpoint
CREATE INDEX `teamMember_userId_idx` ON `team_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `twoFactor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `twoFactor_userId_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `books_organization_id_idx` ON `books` (`organization_id`);--> statement-breakpoint
CREATE INDEX `books_created_by_id_idx` ON `books` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notification_preferences_userId_idx` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_resource_idx` ON `resource_ownership` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_owner_idx` ON `resource_ownership` (`owner_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_org_idx` ON `resource_ownership` (`organization_id`);