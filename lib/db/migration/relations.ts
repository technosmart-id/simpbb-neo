import { relations } from "drizzle-orm/relations";
import { user, account, invitation, organization, member, notifications, oauthApplication, oauthAccessToken, oauthConsent, session, team, teamMember, twoFactor } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	invitations: many(invitation),
	members: many(member),
	notifications: many(notifications),
	oauthAccessTokens: many(oauthAccessToken),
	oauthApplications: many(oauthApplication),
	oauthConsents: many(oauthConsent),
	sessions: many(session),
	teamMembers: many(teamMember),
	twoFactors: many(twoFactor),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	invitations: many(invitation),
	members: many(member),
	teams: many(team),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id]
	}),
}));

export const oauthAccessTokenRelations = relations(oauthAccessToken, ({one}) => ({
	oauthApplication: one(oauthApplication, {
		fields: [oauthAccessToken.clientId],
		references: [oauthApplication.clientId]
	}),
	user: one(user, {
		fields: [oauthAccessToken.userId],
		references: [user.id]
	}),
}));

export const oauthApplicationRelations = relations(oauthApplication, ({one, many}) => ({
	oauthAccessTokens: many(oauthAccessToken),
	user: one(user, {
		fields: [oauthApplication.userId],
		references: [user.id]
	}),
	oauthConsents: many(oauthConsent),
}));

export const oauthConsentRelations = relations(oauthConsent, ({one}) => ({
	oauthApplication: one(oauthApplication, {
		fields: [oauthConsent.clientId],
		references: [oauthApplication.clientId]
	}),
	user: one(user, {
		fields: [oauthConsent.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const teamRelations = relations(team, ({one, many}) => ({
	organization: one(organization, {
		fields: [team.organizationId],
		references: [organization.id]
	}),
	teamMembers: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({one}) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id]
	}),
}));

export const twoFactorRelations = relations(twoFactor, ({one}) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id]
	}),
}));