"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2Icon, Check, X } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Check if passwords match and password is valid
	const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
	const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
	const isPasswordValid = password.length >= 8;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const username = formData.get("username") as string;
		const phoneNumber = formData.get("phoneNumber") as string;

		if (!password || password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		await authClient.signUp.email(
			{
				email,
				password,
				name,
				username: username || undefined,
				phoneNumber: phoneNumber || undefined,
				callbackURL: "/dashboard",
			},
			{
				onRequest: () => setLoading(true),
				onResponse: () => setLoading(false),
				onError: (ctx) => {
					toast.error(ctx.error.message || "Failed to register");
				},
				onSuccess: () => {
					toast.success("Account created successfully! Please verify your email.");
					router.push("/verify-email");
				},
			}
		);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Full Name</FieldLabel>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="John Doe"
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="username">
									Username <span className="text-muted-foreground">(optional)</span>
								</FieldLabel>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="johndoe"
									minLength={3}
									maxLength={20}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="phoneNumber">
									Phone Number <span className="text-muted-foreground">(optional)</span>
								</FieldLabel>
								<Input
									id="phoneNumber"
									name="phoneNumber"
									type="tel"
									placeholder="+1234567890"
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<PasswordInput
									id="password"
									name="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									showStrength
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="confirmPassword" className="flex items-center gap-2">
									Confirm Password
									{passwordsMatch && (
										<Check className="h-4 w-4 text-green-600" />
									)}
									{passwordMismatch && (
										<X className="h-4 w-4 text-destructive" />
									)}
								</FieldLabel>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={8}
									className={cn(
										passwordMismatch && "border-destructive focus-visible:ring-destructive",
										passwordsMatch && "border-green-600 focus-visible:ring-green-600"
									)}
									autoComplete="new-password"
								/>
								{passwordMismatch && (
									<FieldDescription className="text-destructive">
										Passwords do not match
									</FieldDescription>
								)}
							</Field>
							<Field>
								<Button
									type="submit"
									className="w-full"
									disabled={loading || !isPasswordValid || !passwordsMatch}
								>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Create account
								</Button>
								<FieldDescription className="text-center">
									Already have an account?{" "}
									<Link href="/sign-in" className="underline underline-offset-4">
										Login
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center text-xs">
				By clicking continue, you agree to our{" "}
				<a href="#" className="underline underline-offset-4 whitespace-nowrap">
					Terms of Service
				</a>{" "}
				and{" "}
				<a href="#" className="underline underline-offset-4 whitespace-nowrap">
					Privacy Policy
				</a>
				.
			</FieldDescription>
		</div>
	);
}
