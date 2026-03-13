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
import { Loader2Icon, Phone } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PhoneForm({ mode = "login" }: { mode?: "login" | "verify" | "register" }) {
	const [step, setStep] = useState<"send" | "verify">("send");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState("");

	// Send SMS OTP
	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const res = await authClient.phoneNumber.sendOtp({
			phoneNumber,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to send OTP");
		} else {
			toast.success("OTP sent to your phone!");
			setStep("verify");
		}
		setLoading(false);
	};

	// Verify OTP
	const handleVerifyOtp = async () => {
		setLoading(true);

		const res = await authClient.phoneNumber.verify({
			phoneNumber,
			otp,
		});

		if (res.error) {
			toast.error(res.error.message || "Invalid OTP");
		} else {
			toast.success("Phone verified successfully!");
			// For registration, we might need to complete the signup
			if (mode === "register") {
				// Proceed with registration
			}
		}
		setLoading(false);
	};

	// Phone number login
	const handlePhoneLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const res = await authClient.signIn.phoneNumber({
			phoneNumber,
			password,
		});

		if (res.error) {
			toast.error(res.error.message || "Failed to login");
		} else {
			toast.success("Logged in successfully!");
			window.location.href = "/dashboard";
		}
		setLoading(false);
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Phone className="h-5 w-5" />
					Phone Authentication
				</CardTitle>
				<CardDescription>
					{mode === "register"
						? "Verify your phone number"
						: "Sign in with your phone number"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{mode === "register" ? (
					// Registration/Verification mode
					step === "send" ? (
						<form onSubmit={handleSendOtp}>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
									<Input
										id="phoneNumber"
										type="tel"
										placeholder="+1234567890"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										required
										pattern="\\+[1-9]\\d{1,14}"
									/>
									<FieldDescription>
										Include country code (e.g., +1 for US)
									</FieldDescription>
								</Field>
								<Field>
									<Button type="submit" disabled={loading} className="w-full">
										{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
										Send Verification Code
									</Button>
								</Field>
							</FieldGroup>
						</form>
					) : (
						<FieldGroup>
							<Alert>
								<AlertDescription>
									We sent a code to <strong>{phoneNumber}</strong>
								</AlertDescription>
							</Alert>
							<Field>
								<FieldLabel>Enter Code</FieldLabel>
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={otp}
										onChange={setOtp}
										render={({ slots }) => (
											<InputOTPGroup>
												{slots.map((slot, index) => (
													<InputOTPSlot
														key={index}
														index={index}
														{...slot}
														className="w-10 h-12 text-lg"
													/>
												))}
											</InputOTPGroup>
										)}
									/>
								</div>
							</Field>
							<Field>
								<Button
									onClick={handleVerifyOtp}
									disabled={loading || otp.length !== 6}
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
									onClick={() => {
										setStep("send");
										setOtp("");
									}}
								>
									Change phone number
								</Button>
							</Field>
						</FieldGroup>
					)
				) : (
					// Login mode
					step === "send" ? (
						<form onSubmit={handlePhoneLogin}>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
									<Input
										id="phoneNumber"
										type="tel"
										placeholder="+1234567890"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</Field>
								<Field>
									<Button type="submit" disabled={loading} className="w-full">
										{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
										Sign In
									</Button>
								</Field>
							</FieldGroup>
						</form>
					) : (
						<FieldGroup>
							<Alert>
								<AlertDescription>
									We sent a code to <strong>{phoneNumber}</strong>
								</AlertDescription>
							</Alert>
							<Field>
								<FieldLabel>Enter Code</FieldLabel>
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={otp}
										onChange={setOtp}
										render={({ slots }) => (
											<InputOTPGroup>
												{slots.map((slot, index) => (
													<InputOTPSlot
														key={index}
														index={index}
														{...slot}
														className="w-10 h-12 text-lg"
													/>
												))}
											</InputOTPGroup>
										)}
									/>
								</div>
							</Field>
							<Field>
								<Button
									onClick={handleVerifyOtp}
									disabled={loading || otp.length !== 6}
									className="w-full"
								>
									{loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
									Verify
								</Button>
							</Field>
						</FieldGroup>
					)
				)}
			</CardContent>
		</Card>
	);
}
