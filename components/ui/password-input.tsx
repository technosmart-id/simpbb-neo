"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	/**
	 * Show password strength indicator
	 * @default false
	 */
	showStrength?: boolean;
	/**
	 * Minimum password length for strength calculation
	 * @default 8
	 */
	minLength?: number;
}

/**
 * Calculate password strength (0-4)
 * 0: Too short
 * 1: Weak
 * 2: Fair
 * 3: Good
 * 4: Strong
 */
function calculatePasswordStrength(password: string, minLength: number = 8): {
	score: number;
	label: string;
	barColor: string;  // bg class for the filled bars
	textColor: string; // text class for the label
} {
	if (password.length === 0) {
		return { score: 0, label: "", barColor: "", textColor: "" };
	}

	if (password.length < minLength) {
		return { score: 1, label: "Too short", barColor: "bg-destructive", textColor: "text-destructive" };
	}

	let score = 0;
	// Length check
	if (password.length >= minLength) score++;
	if (password.length >= 12) score++;

	// Variety checks
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	// Normalize to 0-4 scale
	const normalizedScore = Math.min(4, Math.max(1, score));

	switch (normalizedScore) {
		case 1:
			return { score: 1, label: "Weak", barColor: "bg-red-500", textColor: "text-red-500" };
		case 2:
			return { score: 2, label: "Fair", barColor: "bg-orange-500", textColor: "text-orange-500" };
		case 3:
			return { score: 3, label: "Good", barColor: "bg-yellow-500", textColor: "text-yellow-500" };
		case 4:
			return { score: 4, label: "Strong", barColor: "bg-green-600", textColor: "text-green-600" };
		default:
			return { score: 1, label: "Weak", barColor: "bg-red-500", textColor: "text-red-500" };
	}
}

/**
 * Password strength bar component
 */
function PasswordStrengthBar({ strength }: { strength: ReturnType<typeof calculatePasswordStrength> }) {
	if (!strength.label) return null;

	const bars = Array.from({ length: 4 });

	return (
		<div className="space-y-1.5">
			<div className="flex gap-1.5">
				{bars.map((_, i) => (
					<div
						key={i}
						className={cn(
							"h-1.5 flex-1 rounded-full transition-all duration-300",
							i < strength.score ? strength.barColor : "bg-muted"
						)}
					/>
				))}
			</div>
			<p className={cn("text-xs", strength.textColor)}>{strength.label}</p>
		</div>
	);
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, showStrength = false, minLength = 8, value, defaultValue, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const isControlled = value !== undefined;
		const inputValue = isControlled ? value : defaultValue;
		const strength = React.useMemo(
			() => calculatePasswordStrength((inputValue as string | undefined) ?? "", minLength),
			[inputValue, minLength]
		);

		return (
			<div className="space-y-1.5">
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						ref={ref}
						className={cn("pr-10", className)}
						value={isControlled ? value : undefined}
						defaultValue={!isControlled ? defaultValue : undefined}
						{...props}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-bl-none rounded-tl-none"
						onClick={() => setShowPassword((prev) => !prev)}
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground" />
						)}
						<span className="sr-only">
							{showPassword ? "Hide password" : "Show password"}
						</span>
					</Button>
				</div>
				{showStrength && <PasswordStrengthBar strength={strength} />}
			</div>
		);
	}
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
