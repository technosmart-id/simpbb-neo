import { createAuthClient } from "better-auth/react";
import {
	twoFactorClient,
	usernameClient,
	phoneNumberClient,
	emailOTPClient,
	adminClient,
	organizationClient,
	magicLinkClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
	plugins: [
		twoFactorClient(),
		usernameClient(),
		phoneNumberClient(),
		emailOTPClient(),
		adminClient(),
		organizationClient(),
		magicLinkClient(),
	],
});
