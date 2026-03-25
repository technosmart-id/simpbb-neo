-- Migration: Casbin-First Authorization Architecture
-- This migration creates the member_roles junction table and removes the
-- permissions column from org_roles, making Casbin the single source of truth.

-- Step 1: Create member_roles junction table
CREATE TABLE `member_roles` (
	`id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`role_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(36) NOT NULL,
	CONSTRAINT `member_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_roles_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `member_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action,
	CONSTRAINT `unique_member_role` UNIQUE(`member_id`,`role_id`,`role_type`)
);
--> statement-breakpoint
CREATE INDEX `member_roles_member_id_idx` ON `member_roles` (`member_id`);
--> statement-breakpoint
CREATE INDEX `member_roles_role_id_idx` ON `member_roles` (`role_id`);

-- Step 2: Migrate existing member roles to junction table
-- For system roles (no customRoleId), use the role field
INSERT INTO `member_roles` (`id`, `member_id`, `role_id`, `role_type`, `created_at`, `created_by`)
SELECT
	UUID(),
	m.id,
	COALESCE(m.customRoleId, m.role),
	IF(m.customRoleId IS NULL, 'system', 'custom'),
	m.created_at,
	m.user_id
FROM `member` m
WHERE NOT EXISTS (
	SELECT 1 FROM `member_roles` mr
	WHERE mr.member_id = m.id AND mr.role_id = COALESCE(m.customRoleId, m.role)
);

-- Step 3: Remove permissions column from org_roles
-- Casbin is now the single source of truth for permissions
ALTER TABLE `org_roles` DROP COLUMN `permissions`;

-- Note: We keep member.role and member.customRoleId columns for backward compatibility
-- They can be phased out in a future migration once the new system is verified
