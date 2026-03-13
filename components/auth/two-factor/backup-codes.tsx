"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldGroup,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2Icon, RefreshCw, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

type State = "none" | "enterPassword" | "showCodes";

export function BackupCodes() {
	const [state, setState] = useState<State>("none");
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [showCodes, setShowCodes] = useState(false);

	const handleStartGenerate = () => {
		setState("enterPassword");
	};

	const handlePasswordConfirm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		setLoading(true);
		try {
			const res = await authClient.twoFactor.generateBackupCodes({
				password,
			});

			if (res.error) {
				toast.error(res.error.message || "Failed to generate backup codes. Check your password.");
			} else if (res.data) {
				setBackupCodes(res.data.backupCodes || []);
				setShowCodes(true);
				setState("showCodes");
				toast.success("New backup codes generated");
			}
		} catch (err) {
			toast.error("Failed to generate backup codes");
			console.error(err);
		}
		setLoading(false);
	};

	const handleCopyCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		toast.success("Backup codes copied to clipboard");
	};

	const handleCancel = () => {
		setState("none");
		setPassword("");
	};

	// No codes generated yet
	if (state === "none") {
		return (
			<FieldGroup>
				<Field>
					<FieldDescription className="text-sm">
						You haven&apos;t generated backup codes yet. Generate them now so
						you can access your account if you lose your authenticator device.
					</FieldDescription>
				</Field>
				<Field>
					<Button onClick={handleStartGenerate} variant="outline" className="w-full">
						<Lock className="mr-2 h-4 w-4" />
						Generate Backup Codes
					</Button>
				</Field>
			</FieldGroup>
		);
	}

	// Enter password
	if (state === "enterPassword") {
		return (
			<FieldGroup>
				<Field>
					<FieldDescription className="text-sm">
						For your security, please confirm your password to generate new backup codes.
					</FieldDescription>
				</Field>
				<form onSubmit={handlePasswordConfirm}>
					<Field>
						<FieldLabel htmlFor="backup-password">Password</FieldLabel>
						<PasswordInput
							id="backup-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							autoFocus
						/>
					</Field>
					<Field className="flex gap-2">
						<Button type="submit" disabled={loading} className="flex-1">
							{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
							Generate
						</Button>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
					</Field>
				</form>
			</FieldGroup>
		);
	}

	// Show generated codes
	return (
		<FieldGroup>
			<Alert>
				<AlertTitle className="text-sm flex items-center gap-2">
					<Lock className="h-4 w-4" />
					Important
				</AlertTitle>
				<AlertDescription className="text-sm">
					Store these codes in a safe place. Each code can only be used once.
				</AlertDescription>
			</Alert>

			<div className="bg-muted p-3 rounded-lg space-y-1">
				{backupCodes.map((code) => (
					<div
						key={code}
						className="font-mono text-sm flex justify-between items-center"
					>
						{showCodes ? (
							<code>{code}</code>
						) : (
							<code>{code.replace(/./g, "•")}</code>
						)}
					</div>
				))}
			</div>

			<Field className="flex gap-2">
				<Button onClick={handleCopyCodes} variant="outline" className="flex-1">
					Copy
				</Button>
				<Button onClick={() => setShowCodes(!showCodes)} variant="outline">
					{showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</Button>
				<Button onClick={handleStartGenerate} variant="outline">
					<RefreshCw className="h-4 w-4" />
				</Button>
			</Field>
		</FieldGroup>
	);
}
