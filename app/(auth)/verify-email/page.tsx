"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2Icon, MailCheck, MailX } from "lucide-react";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

function VerifyEmailPageContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");

	const verifyEmail = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token: token || "",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setStatus("error");
				setMessage(data.message || "Verification failed");
			} else {
				setStatus("success");
				setMessage("Email verified successfully!");
			}
		} catch {
			setStatus("error");
			setMessage("Verification failed");
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			verifyEmail();
		} else {
			setStatus("error");
			setMessage("Invalid verification link");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link href="/" className="flex items-center gap-2 self-center font-medium">
					<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<GalleryVerticalEndIcon className="size-4" />
					</div>
					Acme Inc.
				</Link>

				<Card>
					<CardHeader className="text-center">
						{status === "loading" && (
							<>
								<Loader2Icon className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
								<CardTitle>Verifying...</CardTitle>
							</>
						)}
						{status === "success" && (
							<>
								<MailCheck className="h-12 w-12 mx-auto text-green-500" />
								<CardTitle>Email Verified</CardTitle>
							</>
						)}
						{status === "error" && (
							<>
								<MailX className="h-12 w-12 mx-auto text-destructive" />
								<CardTitle>Verification Failed</CardTitle>
							</>
						)}
						<CardDescription>{message}</CardDescription>
					</CardHeader>
					<CardContent>
						{status !== "loading" && (
							<Button asChild className="w-full">
								<Link href="/sign-in">Continue to Sign In</Link>
							</Button>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div className="flex min-h-svh items-center justify-center">Loading...</div>}>
			<VerifyEmailPageContent />
		</Suspense>
	);
}
