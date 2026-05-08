CREATE TABLE `member_roles` (
	`id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`role_type` varchar(20) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`created_by` varchar(36) NOT NULL,
	PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE INDEX `member_roles_member_id_idx` ON `member_roles` (`member_id`);
--> statement-breakpoint
CREATE INDEX `member_roles_role_id_idx` ON `member_roles` (`role_id`);
--> statement-breakpoint
INSERT INTO `member_roles` (`id`, `member_id`, `role_id`, `role_type`, `created_at`, `created_by`)
SELECT UUID(), m.id, COALESCE(m.custom_role_id, m.role), CASE WHEN m.custom_role_id IS NULL THEN 'system' ELSE 'custom' END, m.created_at, m.user_id
FROM `member` m
WHERE NOT EXISTS (
	SELECT 1 FROM `member_roles` mr
	WHERE mr.member_id = m.id AND mr.role_id = COALESCE(m.custom_role_id, m.role)
);
--> statement-breakpoint
ALTER TABLE `org_roles` DROP COLUMN `permissions`;
