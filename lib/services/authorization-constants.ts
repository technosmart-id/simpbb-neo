/**
 * Authorization Constants
 *
 * Shared constants and types for authorization.
 * This file can be imported by both client and server components.
 *
 * Simplified to Owner + User structure with custom roles.
 */

/**
 * Organization-scoped roles (simplified)
 * Owner is the only system-defined role that cannot be deleted/renamed.
 * All other roles are custom roles defined per organization in the org_roles table.
 */
export const ORG_ROLES = {
	OWNER: "owner",
	USER: "user", // Default member role, can be customized per org
} as const;

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];

/**
 * Global roles (for users without organizations)
 * These use empty string "" as the domain in Casbin
 */
export const GLOBAL_ROLES = {
	GLOBAL_ADMIN: "global_admin",
	GLOBAL_MODERATOR: "global_moderator",
	GLOBAL_USER: "global_user",
} as const;

export type GlobalRole = typeof GLOBAL_ROLES[keyof typeof GLOBAL_ROLES];

/**
 * All available resources
 */
export const RESOURCES = {
	BOOKS: "books",
	FILES: "files",
	BACKUPS: "backups",
	MEMBERS: "members",
	ROLES: "roles",
	SETTINGS: "settings",
} as const;

export type Resource = typeof RESOURCES[keyof typeof RESOURCES];

/**
 * All available actions
 */
export const ACTIONS = {
	CREATE: "create",
	READ: "read",
	UPDATE: "update",
	DELETE: "delete",
	ALL: "*",
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

/**
 * Role descriptions for UI display
 */
export const GLOBAL_ROLE_INFO = {
	[GLOBAL_ROLES.GLOBAL_ADMIN]: {
		label: "Global Admin",
		description: "Full system access across all organizations",
		color: "default" as const,
	},
	[GLOBAL_ROLES.GLOBAL_MODERATOR]: {
		label: "Global Moderator",
		description: "System-wide monitoring and moderation",
		color: "secondary" as const,
	},
	[GLOBAL_ROLES.GLOBAL_USER]: {
		label: "Global User",
		description: "Can manage own resources",
		color: "outline" as const,
	},
} as const;

export type GlobalRoleInfo = typeof GLOBAL_ROLE_INFO[GlobalRole];

/**
 * Organization role descriptions for UI display (simplified)
 */
export const ORG_ROLE_INFO = {
	[ORG_ROLES.OWNER]: {
		label: "Owner",
		description: "Full access, can manage roles and members",
		color: "default" as const,
	},
	[ORG_ROLES.USER]: {
		label: "User",
		description: "Default member role with configurable permissions",
		color: "outline" as const,
	},
} as const;

export type OrgRoleInfo = typeof ORG_ROLE_INFO[OrgRole];

/**
 * Permission resources configuration
 * Each resource has a label, description, and available actions
 */
export const PERMISSION_RESOURCES = {
	[RESOURCES.BOOKS]: {
		label: "Books",
		description: "Manage book resources",
		icon: "Book",
		actions: ["create", "read", "update", "delete"],
	},
	[RESOURCES.FILES]: {
		label: "Files",
		description: "Manage file uploads and downloads",
		icon: "File",
		actions: ["create", "read", "update", "delete"],
	},
	[RESOURCES.BACKUPS]: {
		label: "Backups",
		description: "Manage backup creation and restoration",
		icon: "Database",
		actions: ["create", "read", "update", "delete"],
	},
	[RESOURCES.MEMBERS]: {
		label: "Members",
		description: "Manage organization members",
		icon: "Users",
		actions: ["read", "update", "delete"], // No create - that's invitations
	},
	[RESOURCES.ROLES]: {
		label: "Roles",
		description: "Manage custom roles and permissions",
		icon: "Shield",
		actions: ["create", "read", "update", "delete"],
	},
	[RESOURCES.SETTINGS]: {
		label: "Settings",
		description: "Manage organization settings",
		icon: "Settings",
		actions: ["read", "update"],
	},
} as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[Resource];

/**
 * Default permissions for the "User" role in new organizations
 */
export const DEFAULT_USER_PERMISSIONS: Record<string, Record<string, boolean>> = {
	[RESOURCES.BOOKS]: { create: true, read: true, update: true, delete: false },
	[RESOURCES.FILES]: { create: true, read: true, update: true, delete: false },
	[RESOURCES.BACKUPS]: { create: false, read: true, update: false, delete: false },
	[RESOURCES.MEMBERS]: { create: false, read: true, update: false, delete: false },
	[RESOURCES.ROLES]: { create: false, read: true, update: false, delete: false },
	[RESOURCES.SETTINGS]: { create: false, read: true, update: false, delete: false },
};

/**
 * All permissions for owners (full access)
 */
export const OWNER_PERMISSIONS: Record<string, Record<string, boolean>> = {
	[RESOURCES.BOOKS]: { create: true, read: true, update: true, delete: true },
	[RESOURCES.FILES]: { create: true, read: true, update: true, delete: true },
	[RESOURCES.BACKUPS]: { create: true, read: true, update: true, delete: true },
	[RESOURCES.MEMBERS]: { create: true, read: true, update: true, delete: true },
	[RESOURCES.ROLES]: { create: true, read: true, update: true, delete: true },
	[RESOURCES.SETTINGS]: { create: false, read: true, update: true, delete: false },
};

/**
 * Legacy role mapping for backward compatibility
 * Maps old roles to new User role
 */
export const LEGACY_ROLE_MAPPING: Record<string, string> = {
	admin: ORG_ROLES.USER,
	member: ORG_ROLES.USER,
	viewer: ORG_ROLES.USER,
};
