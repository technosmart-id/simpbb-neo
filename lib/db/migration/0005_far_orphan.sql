-- Migration: Organization Auto Join
-- This was extracted from a redundant reconciliation migration.
ALTER TABLE `organization` ADD `auto_join` boolean DEFAULT true NOT NULL;