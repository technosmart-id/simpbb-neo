"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import Link from "next/link";

export function MagicLinkForm() {
	return (
		<Card>
			<CardHeader className="text-center">
				<KeyRound className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
				<CardTitle>Check Your Email</CardTitle>
				<CardDescription>
					We sent a magic link to your email. Click the link to sign in.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-center text-sm text-muted-foreground">
					Link expires in 24 hours.{" "}
					<Link href="/sign-in" className="underline underline-offset-4">
						Back to login
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
