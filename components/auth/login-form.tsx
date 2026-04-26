"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth/client";
import { useORPC } from "@/lib/orpc/react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2Icon, KeyRound, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// reCAPTCHA v3 site key from env
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

type IdentifierType = "email" | "username" | "phone" | "unknown";
type SignInMode = "password" | "magic-link" | "email-otp";

// Better Auth callback context types
interface AuthCallbackContext {
	error?: { message: string };
}

interface AuthCallbackOptions {
	onRequest?: () => void;
	onResponse?: () => void;
	onError?: (ctx: AuthCallbackContext) => void;
	onSuccess?: () => void;
}

/**
 * Detect what type of identifier the user entered.
 * Phone: starts with + and has 10-15 digits
 * Email: contains @ and domain with .
 * Username: alphanumeric with optional @ prefix, 3-20 chars
 */
function detectIdentifierType(value: string): IdentifierType {
	const trimmed = value.trim();

	// Phone: starts with + and has 10-15 digits
	if (/^\+\d{10,15}$/.test(trimmed)) return "phone";

	// Email: contains @ and domain with .
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";

	// Username: starts with @ or is alphanumeric/underscore, 3-20 chars
	if (/^@?[a-zA-Z0-9_]{3,20}$/.test(trimmed)) return "username";

	return "unknown";
}

/**
 * Validate that a callback URL is relative to prevent open redirects
 */
function isValidCallbackURL(url: string | null): string {
	if (!url) return "/dashboard";
	if (url.startsWith("/") && !url.startsWith("//")) return url;
	return "/dashboard";
}

function LoginFormContent({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const orpc = useORPC();
	const searchParams = useSearchParams();
	const callbackURL = isValidCallbackURL(searchParams.get("callbackURL"));
	const [loading, setLoading] = useState(false);
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [signInMode, setSignInMode] = useState<SignInMode>("password");
	const [emailForPasswordless, setEmailForPasswordless] = useState("");
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);

	// Demo Akun: fill admin credentials
	const fillDemoAdmin = () => {
		setIdentifier("admin");
		setPassword("admin123456");
		setSignInMode("password");
	};

	// Reset DB: trigger via oRPC
	const resetDb = useMutation(orpc.system.resetDb.mutationOptions({
		onSuccess: () => {
			toast.success("Database reset and seeded successfully!");
			setLoading(false);
		},
		onError: (err: any) => {
			toast.error(`Reset failed: ${err.message}`);
			setLoading(false);
		},
	}));

	const handleResetDb = async () => {
		if (!confirm("Are you sure? This will drop all tables, migrate, and re-seed the database.")) return;
		setLoading(true);
		resetDb.mutate({});
	};

	// Execute reCAPTCHA v3 and get token
	const executeRecaptcha = async (): Promise<string | null> => {
		if (typeof window === "undefined" || !window.grecaptcha?.execute) {
			console.error("grecaptcha not ready");
			return null;
		}
		try {
			const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "login" });
			console.log("Token:", token?.slice(0, 30) + "...");
			return token;
		} catch (err) {
			console.error("Captcha error:", err);
			return null;
		}
	};

	// Load reCAPTCHA v3 script
	useEffect(() => {
		if (typeof window !== "undefined" && !window.grecaptcha) {
			const script = document.createElement("script");
			script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
	}, []);

	const detectedType = detectIdentifierType(identifier);
	const isIdentifierValid = detectedType !== "unknown" || identifier.length === 0;
	const canUsePasswordless = detectedType === "email";
	const isPasswordlessMode = signInMode !== "password";

	// Unified sign-in handler
	const handleSignIn = async () => {
		const trimmedIdentifier = identifier.trim();
		if (!trimmedIdentifier) {
			toast.error("Please enter your email, username, or phone number");
			return;
		}

		setLoading(true);

		// Execute reCAPTCHA v3
		const token = await executeRecaptcha();

		// Strip @ from username if present
		let finalIdentifier = trimmedIdentifier;
		if (detectedType === "username" && trimmedIdentifier.startsWith("@")) {
			finalIdentifier = trimmedIdentifier.slice(1);
		}

		if (signInMode === "magic-link") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await ((authClient.signIn as any).magicLink as any)({
				email: emailForPasswordless,
				callbackURL: callbackURL,
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});
			setLoading(false);
			if (result?.error) {
				toast.error(result.error.message || "Failed to send magic link");
			} else {
				toast.success("Magic link sent! Check your email.");
				setIdentifier("");
				setEmailForPasswordless("");
				setSignInMode("password");
			}
			return;
		}

		if (signInMode === "email-otp") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await ((authClient.signIn as any).emailOtp as any)({
				email: emailForPasswordless,
				callbackURL: callbackURL,
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});
			setLoading(false);
			if (result?.error) {
				toast.error(result.error.message || "Failed to send OTP");
			} else {
				toast.success("OTP sent! Check your email.");
				setIdentifier("");
				setEmailForPasswordless("");
				setSignInMode("password");
			}
			return;
		}

		// Password-based sign in
		if (detectedType === "email") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await (authClient.signIn.email as any)({
				email: finalIdentifier,
				password,
				callbackURL: callbackURL,
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});
			setLoading(false);
			if (result?.error) {
				toast.error(result.error.message || "Failed to sign in");
			} else {
				toast.success("Signed in successfully!");
				router.push(callbackURL);
			}
			return;
		}

		if (detectedType === "username") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await (authClient.signIn.username as any)({
				username: finalIdentifier,
				password,
				callbackURL: callbackURL,
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});
			setLoading(false);
			if (result?.error) {
				toast.error(result.error.message || "Failed to sign in");
			} else {
				toast.success("Signed in successfully!");
				router.push(callbackURL);
			}
			return;
		}

		if (detectedType === "phone") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await ((authClient.signIn as any).phoneNumber as any)({
				phoneNumber: finalIdentifier,
				password,
				callbackURL: callbackURL,
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});
			setLoading(false);
			if (result?.error) {
				toast.error(result.error.message || "Failed to sign in");
			} else {
				toast.success("Signed in successfully!");
				router.push(callbackURL);
			}
			return;
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!identifier) {
			toast.error("Please enter your email, username, or phone number");
			return;
		}

		if (signInMode !== "password") {
			await handleSignIn();
			return;
		}

		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		await handleSignIn();
	};

	// Switch to passwordless mode
	const switchToPasswordless = (mode: Extract<SignInMode, "magic-link" | "email-otp">) => {
		setEmailForPasswordless(identifier);
		setSignInMode(mode);
		setPassword("");
	};

	// Switch back to password mode
	const switchToPassword = () => {
		setSignInMode("password");
		setEmailForPasswordless("");
	};

	// Reset mode when identifier changes
	const handleIdentifierChange = (value: string) => {
		setIdentifier(value);
		if (isPasswordlessMode && value !== emailForPasswordless) {
			setSignInMode("password");
			setEmailForPasswordless("");
		}
	};

	// Google OAuth handler
	const handleGoogleLogin = () => {
		authClient.signIn.social({
			provider: "google",
			callbackURL: callbackURL,
		});
	};

	// Get the label for the identifier input
	const getIdentifierLabel = () => {
		if (!identifier) return "Email, username, or phone";
		const type = detectIdentifierType(identifier);
		switch (type) {
			case "email":
				return "Email";
			case "phone":
				return "Phone number";
			case "username":
				return "Username";
			default:
				return "Email, username, or phone";
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							{/* Google OAuth */}
							<Field>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleGoogleLogin}
									disabled={loading}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="h-5 w-5 mr-2"
									>
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Continue with Google
								</Button>
							</Field>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

							{/* Unified Identifier Field */}
							<Field>
								<FieldLabel htmlFor="identifier">{getIdentifierLabel()}</FieldLabel>
								<Input
									id="identifier"
									name="identifier"
									type="text"
									autoComplete="username webauthn"
									value={identifier}
									onChange={(e) => handleIdentifierChange(e.target.value)}
									required
									disabled={loading || isPasswordlessMode}
									className={
										!isIdentifierValid && identifier.length > 0
											? "border-destructive focus-visible:ring-destructive"
											: ""
									}
								/>
								{!isIdentifierValid && identifier.length > 0 && (
									<FieldDescription className="text-destructive">
										Enter a valid email (@), username (@), or phone number (+)
									</FieldDescription>
								)}
							</Field>

							{/* Password Field - shown for password mode only */}
							{!isPasswordlessMode && (
								<Field>
									<div className="flex items-center justify-between">
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Link
											href="/forgot-password"
											className="text-sm text-muted-foreground hover:underline underline-offset-4"
											tabIndex={loading ? -1 : 0}
										>
											Forgot password?
										</Link>
									</div>
									<PasswordInput
										id="password"
										name="password"
										autoComplete="current-password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={loading}
									/>
								</Field>
							)}

							{/* Passwordless Mode - Back Link */}
							{isPasswordlessMode && (
								<Field>
									<button
										type="button"
										className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
										onClick={switchToPassword}
									>
										<ArrowLeft className="h-4 w-4" />
										Back to password sign in
									</button>
								</Field>
							)}

							{/* Demo & Reset Buttons */}
							<div className="grid grid-cols-2 gap-2">
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={fillDemoAdmin}
									disabled={loading}
								>
									<Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
									Demo Akun
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full text-destructive hover:bg-destructive/10"
									onClick={handleResetDb}
									disabled={loading}
								>
									<Loader2Icon className={cn("h-4 w-4 mr-2", resetDb.isPending && "animate-spin")} />
									Reset DB
								</Button>
							</div>

							{/* Sign In Button */}
							<Field>
								<Button
									type="submit"
									className="w-full"
									disabled={loading || !isIdentifierValid || (!isPasswordlessMode && !password)}
								>
									{loading && !resetDb.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									{isPasswordlessMode ? "Send" : "Sign in"}
								</Button>
							</Field>

							{/* Passwordless Options - shown when email is detected */}
							{!isPasswordlessMode && canUsePasswordless && identifier && (
								<Field>
									<FieldSeparator />
									<FieldDescription className="text-sm text-center mb-2">
										Or sign in without a password
									</FieldDescription>
									<div className="grid grid-cols-2 gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => switchToPasswordless("magic-link")}
											disabled={loading}
										>
											<KeyRound className="h-4 w-4 mr-1.5" />
											Magic Link
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => switchToPasswordless("email-otp")}
											disabled={loading}
										>
											<Sparkles className="h-4 w-4 mr-1.5" />
											Email OTP
										</Button>
									</div>
								</Field>
							)}
						</FieldGroup>
					</form>

					<Field className="mt-2">
						<FieldDescription className="text-center">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="underline underline-offset-4">
								Sign up
							</Link>
						</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}

export function LoginForm(props: React.ComponentProps<"div">) {
	return (
		<Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2Icon className="animate-spin" /></div>}>
			<LoginFormContent {...props} />
		</Suspense>
	);
}
