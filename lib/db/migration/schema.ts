import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, primaryKey, varchar, text, unique, serial, timestamp, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	id: varchar({ length: 36 }).notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
},
(table) => [
	index("account_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "account_id"}),
]);

export const books = mysqlTable("books", {
	id: serial().notNull(),
	title: varchar({ length: 255 }).notNull(),
	author: varchar({ length: 255 }).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "books_id"}),
	unique("id").on(table.id),
]);

export const invitation = mysqlTable("invitation", {
	id: varchar({ length: 36 }).notNull(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organization.id, { onDelete: "cascade" } ),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }),
	teamId: varchar("team_id", { length: 255 }),
	status: varchar({ length: 255 }).default('pending').notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	inviterId: varchar("inviter_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	index("invitation_organizationId_idx").on(table.organizationId),
	index("invitation_email_idx").on(table.email),
	primaryKey({ columns: [table.id], name: "invitation_id"}),
]);

export const member = mysqlTable("member", {
	id: varchar({ length: 36 }).notNull(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organization.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	role: varchar({ length: 255 }).default('member').notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).notNull(),
},
(table) => [
	index("member_organizationId_idx").on(table.organizationId),
	index("member_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "member_id"}),
]);

export const notifications = mysqlTable("notifications", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).default('info').notNull(),
	link: text(),
	isRead: tinyint("is_read").default(0).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("notifications_userId_idx").on(table.userId),
	index("notifications_createdAt_idx").on(table.createdAt),
	primaryKey({ columns: [table.id], name: "notifications_id"}),
]);

export const oauthAccessToken = mysqlTable("oauth_access_token", {
	id: varchar({ length: 36 }).notNull(),
	accessToken: varchar("access_token", { length: 255 }),
	refreshToken: varchar("refresh_token", { length: 255 }),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3, mode: 'string' }),
	clientId: varchar("client_id", { length: 36 }).references(() => oauthApplication.clientId, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "cascade" } ),
	scopes: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }),
},
(table) => [
	index("oauthAccessToken_clientId_idx").on(table.clientId),
	index("oauthAccessToken_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "oauth_access_token_id"}),
	unique("oauth_access_token_access_token_unique").on(table.accessToken),
	unique("oauth_access_token_refresh_token_unique").on(table.refreshToken),
]);

export const oauthApplication = mysqlTable("oauth_application", {
	id: varchar({ length: 36 }).notNull(),
	name: text(),
	icon: text(),
	metadata: text(),
	clientId: varchar("client_id", { length: 255 }),
	clientSecret: text("client_secret"),
	redirectUrls: text("redirect_urls"),
	type: text(),
	disabled: tinyint().default(0),
	userId: varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }),
},
(table) => [
	index("oauthApplication_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "oauth_application_id"}),
	unique("oauth_application_client_id_unique").on(table.clientId),
]);

export const oauthConsent = mysqlTable("oauth_consent", {
	id: varchar({ length: 36 }).notNull(),
	clientId: varchar("client_id", { length: 36 }).references(() => oauthApplication.clientId, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "cascade" } ),
	scopes: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }),
	consentGiven: tinyint("consent_given"),
},
(table) => [
	index("oauthConsent_clientId_idx").on(table.clientId),
	index("oauthConsent_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "oauth_consent_id"}),
]);

export const organization = mysqlTable("organization", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	logo: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).notNull(),
	metadata: text(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "organization_id"}),
	unique("organization_slug_unique").on(table.slug),
	unique("organization_slug_uidx").on(table.slug),
]);

export const session = mysqlTable("session", {
	id: varchar({ length: 36 }).notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id),
	impersonatedBy: text("impersonated_by"),
	activeOrganizationId: text("active_organization_id"),
	activeTeamId: text("active_team_id"),
},
(table) => [
	index("session_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "session_id"}),
	unique("session_token_unique").on(table.token),
]);

export const team = mysqlTable("team", {
	id: varchar({ length: 36 }).notNull(),
	name: text().notNull(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organization.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }),
},
(table) => [
	index("team_organizationId_idx").on(table.organizationId),
	primaryKey({ columns: [table.id], name: "team_id"}),
]);

export const teamMember = mysqlTable("team_member", {
	id: varchar({ length: 36 }).notNull(),
	teamId: varchar("team_id", { length: 36 }).notNull().references(() => team.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }),
},
(table) => [
	index("teamMember_teamId_idx").on(table.teamId),
	index("teamMember_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "team_member_id"}),
]);

export const twoFactor = mysqlTable("two_factor", {
	id: varchar({ length: 36 }).notNull(),
	secret: varchar({ length: 255 }).notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	index("twoFactor_secret_idx").on(table.secret),
	index("twoFactor_userId_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "two_factor_id"}),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: tinyint("email_verified").default(0).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	twoFactorEnabled: tinyint("two_factor_enabled").default(0),
	username: varchar({ length: 255 }),
	displayUsername: text("display_username"),
	phoneNumber: varchar("phone_number", { length: 255 }),
	phoneNumberVerified: tinyint("phone_number_verified"),
	role: text(),
	banned: tinyint().default(0),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { fsp: 3, mode: 'string' }),
	isAnonymous: tinyint("is_anonymous").default(0),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
	unique("user_email_unique").on(table.email),
	unique("user_username_unique").on(table.username),
	unique("user_phone_number_unique").on(table.phoneNumber),
]);

export const verification = mysqlTable("verification", {
	id: varchar({ length: 36 }).notNull(),
	identifier: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("verification_identifier_idx").on(table.identifier),
	primaryKey({ columns: [table.id], name: "verification_id"}),
]);
