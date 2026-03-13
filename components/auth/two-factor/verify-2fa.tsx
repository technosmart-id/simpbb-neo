"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2Icon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerifyTwoFactorProps {
	onSuccess?: () => void;
}

export function VerifyTwoFactor({ onSuccess }: VerifyTwoFactorProps) {
	const [loading, setLoading] = useState(false);
	const [code, setCode] = useState("");
	const [useBackupCode, setUseBackupCode] = useState(false);
	const [backupCode, setBackupCode] = useState("");

	// Verify TOTP code
	const handleVerifyTotp = async () => {
		setLoading(true);

		const res = await authClient.twoFactor.verifyTotp({
			code,
		});

		if (res.error) {
			toast.error(res.error.message || "Invalid code");
		} else {
			toast.success("Verified successfully!");
			onSuccess?.();
		}
		setLoading(false);
	};

	// Verify backup code
	const handleVerifyBackupCode = async () => {
		setLoading(true);

		const res = await authClient.twoFactor.verifyBackupCode({
			code: backupCode,
		});

		if (res.error) {
			toast.error(res.error.message || "Invalid backup code");
		} else {
			toast.success("Verified successfully!");
			onSuccess?.();
		}
		setLoading(false);
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldCheck className="h-5 w-5" />
					Two-Factor Authentication
				</CardTitle>
				<CardDescription>
					Enter the code from your authenticator app
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					{!useBackupCode ? (
						<>
							<Field>
								<FieldLabel>Authentication Code</FieldLabel>
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={code}
										onChange={setCode}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</div>
								<FieldDescription>
									Enter the 6-digit code from your authenticator app.
								</FieldDescription>
							</Field>
							<Field>
								<Button
									onClick={handleVerifyTotp}
									disabled={loading || code.length !== 6}
									className="w-full"
								>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Verify
								</Button>
							</Field>
							<Field>
								<Button
									type="button"
									variant="link"
									className="w-full text-sm"
									onClick={() => setUseBackupCode(true)}
								>
									Lost your device? Use a backup code
								</Button>
							</Field>
						</>
					) : (
						<>
							<Alert>
								<AlertDescription>
									Enter one of your 10-character backup codes. Each code can only
									be used once.
								</AlertDescription>
							</Alert>
							<Field>
								<FieldLabel>Backup Code</FieldLabel>
								<Input
									type="text"
									placeholder="xxxxxxxxxx"
									value={backupCode}
									onChange={(e) => setBackupCode(e.target.value)}
									maxLength={10}
									className="font-mono"
									required
								/>
							</Field>
							<Field>
								<Button
									onClick={handleVerifyBackupCode}
									disabled={loading || backupCode.length !== 10}
									className="w-full"
								>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Verify Backup Code
								</Button>
							</Field>
							<Field>
								<Button
									type="button"
									variant="link"
									className="w-full text-sm"
									onClick={() => setUseBackupCode(false)}
								>
									Back to TOTP code
								</Button>
							</Field>
						</>
					)}
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
