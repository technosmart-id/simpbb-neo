"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { QRCodeSVG } from "qrcode.react";
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
import { Loader2Icon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";

interface SetupTwoFactorProps {
	onEnabledChange?: (enabled: boolean) => void;
}

type SetupStep = "idle" | "password" | "scan";

export function SetupTwoFactor({ onEnabledChange }: SetupTwoFactorProps) {
	const [step, setStep] = useState<SetupStep>("idle");
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verificationCode, setVerificationCode] = useState("");

	const handleStartSetup = () => {
		setStep("password");
	};

	const handlePasswordConfirm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error("Please enter your password");
			return;
		}

		setLoading(true);
		try {
			const enableRes = await authClient.twoFactor.enable({
				password,
			});

			if (enableRes.error) {
				toast.error(enableRes.error.message || "Failed to enable 2FA. Check your password.");
				setLoading(false);
				return;
			}

			const totpRes = await authClient.twoFactor.getTotpUri({
				password,
			});

			if (totpRes.error) {
				toast.error(totpRes.error.message || "Failed to generate QR code");
				setLoading(false);
				return;
			}

			if (totpRes.data) {
				setQrCode(totpRes.data.totpURI);
				if (enableRes.data?.backupCodes) {
					setBackupCodes(enableRes.data.backupCodes);
				}
				setStep("scan");
			}
		} catch (err) {
			toast.error("Failed to generate 2FA setup");
			console.error(err);
		}
		setLoading(false);
	};

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await authClient.twoFactor.verifyTotp({
				code: verificationCode,
			});

			if (res.error) {
				toast.error(res.error.message || "Invalid code");
			} else {
				toast.success("Two-factor authentication enabled!");
				onEnabledChange?.(true);
				setStep("idle");
				setPassword("");
				setQrCode("");
				setBackupCodes([]);
				setVerificationCode("");
			}
		} catch (err) {
			toast.error("Failed to verify code");
			console.error(err);
		}
		setLoading(false);
	};

	const handleCopyBackupCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		toast.success("Backup codes copied to clipboard");
	};

	const handleCancel = () => {
		setStep("idle");
		setPassword("");
		setQrCode("");
		setBackupCodes([]);
		setVerificationCode("");
	};

	// Idle state
	if (step === "idle") {
		return (
			<FieldGroup>
				<Field>
					<FieldDescription className="text-sm">
						Two-factor authentication adds an extra layer of security to your
						account. You&apos;ll need to enter a code from your authenticator
						app when you sign in.
					</FieldDescription>
				</Field>
				<Field>
					<Button onClick={handleStartSetup} className="w-full">
						<ShieldCheck className="mr-2 h-4 w-4" />
						Set up authenticator app
					</Button>
				</Field>
			</FieldGroup>
		);
	}

	// Password confirmation state
	if (step === "password") {
		return (
			<FieldGroup>
				<Field>
					<FieldDescription className="text-sm">
						Enter your password to enable two-factor authentication.
					</FieldDescription>
				</Field>
				<form onSubmit={handlePasswordConfirm} className="space-y-2">
					<Field>
						<FieldLabel htmlFor="setup-password">Password</FieldLabel>
						<PasswordInput
							id="setup-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							autoFocus
						/>
					</Field>
					<Field>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
							Continue
						</Button>
					</Field>
					<Field>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
					</Field>
				</form>
			</FieldGroup>
		);
	}

	// Scan/verify state
	return (
		<FieldGroup>
			<Field>
				<FieldDescription className="text-sm">
					Scan the QR code with your authenticator app (Google Authenticator,
					Authy, etc.), then enter the 6-digit code it shows.
				</FieldDescription>
			</Field>

			<Field className="flex justify-center">
				<div className="border rounded-lg p-4 bg-white">
					{qrCode && <QRCodeSVG value={qrCode} size={200} />}
				</div>
			</Field>

			<form onSubmit={handleVerify}>
				<Field>
					<FieldLabel htmlFor="code">Verification Code</FieldLabel>
					<Input
						id="code"
						type="text"
						inputMode="numeric"
						placeholder="123456"
						value={verificationCode}
						onChange={(e) => setVerificationCode(e.target.value)}
						maxLength={6}
						pattern="[0-9]{6}"
						required
						className="text-center text-lg tracking-widest"
						autoFocus
					/>
				</Field>
				<Field className="flex gap-2">
					<Button type="submit" disabled={loading || !verificationCode} className="flex-1">
						{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
						Verify & Enable
					</Button>
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
				</Field>
			</form>

			{backupCodes.length > 0 && (
				<Alert>
					<AlertTitle className="text-sm">Backup Codes Generated</AlertTitle>
					<AlertDescription className="text-sm">
						<p className="mb-2">Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
						<div className="grid grid-cols-2 gap-1 font-mono text-xs bg-muted p-2 rounded my-2">
							{backupCodes.slice(0, 4).map((code) => (
								<span key={code}>{code}</span>
							))}
						</div>
						{backupCodes.length > 4 && (
							<p className="text-xs text-muted-foreground">+ {backupCodes.length - 4} more codes</p>
						)}
						<Button
							type="button"
							variant="outline"
							className="mt-2"
							onClick={handleCopyBackupCodes}
						>
							Copy all codes
						</Button>
					</AlertDescription>
				</Alert>
			)}
		</FieldGroup>
	);
}
