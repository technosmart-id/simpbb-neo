"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2Icon } from "lucide-react";

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void;
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
			render: (container: string | HTMLElement, options: {
				sitekey: string;
				theme?: "light" | "dark";
				size?: "normal" | "compact" | "invisible";
				callback?: (token: string) => void;
				"expired-callback"?: () => void;
				"error-callback"?: () => void;
			}) => string;
			reset: (widgetId?: string) => void;
		};
	}
}

interface ReCaptchaProps {
	siteKey?: string;
	theme?: "light" | "dark";
	size?: "normal" | "compact" | "invisible";
	onChange?: (token: string) => void;
	onError?: () => void;
	onExpire?: () => void;
	action?: string;
}

/**
 * reCAPTCHA v2 Component
 *
 * Loads the Google reCAPTCHA script and renders the widget
 */
export function ReCaptcha({
	siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
	theme = "light",
	size = "normal",
	onChange,
	onError,
	onExpire,
	action = "submit",
}: ReCaptchaProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	useEffect(() => {
		// Skip if no site key
		if (!siteKey) {
			console.warn("[ReCaptcha] No site key provided");
			return;
		}

		// Load reCAPTCHA script
		const loadScript = () => {
			if (document.getElementById("recaptcha-script")) {
				// Script already loaded
				renderWidget();
				return;
			}

			const script = document.createElement("script");
			script.id = "recaptcha-script";
			script.src = `https://www.google.com/recaptcha/api.js`;
			script.async = true;
			script.defer = true;
			script.onload = renderWidget;
			script.onerror = () => {
				console.error("[ReCaptcha] Failed to load script");
				setError(true);
				setLoading(false);
				onError?.();
			};
			document.head.appendChild(script);
		};

		const renderWidget = () => {
			if (!window.grecaptcha || !containerRef.current) return;

			window.grecaptcha.ready(() => {
				if (!containerRef.current) return;

				const widgetId = window.grecaptcha!.render(containerRef.current, {
					sitekey: siteKey,
					theme,
					size,
					callback: (token: string) => {
						onChange?.(token);
					},
					"expired-callback": () => {
						onExpire?.();
					},
					"error-callback": () => {
						setError(true);
						onError?.();
					},
				});

				widgetIdRef.current = widgetId;
				setLoading(false);
			});
		};

		loadScript();

		// Cleanup on unmount
		return () => {
			if (widgetIdRef.current && window.grecaptcha) {
				window.grecaptcha.reset(widgetIdRef.current);
			}
		};
	}, [siteKey, theme, size, onChange, onError, onExpire]);

	if (!siteKey) {
		return (
			<div className="text-sm text-muted-foreground">
				reCAPTCHA not configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center p-4 border rounded-lg bg-muted">
				<Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 border rounded-lg bg-destructive/10 text-destructive text-sm">
				Failed to load reCAPTCHA. Please refresh the page.
			</div>
		);
	}

	return <div ref={containerRef} />;
}

/**
 * Invisible reCAPTCHA Component
 * Executes reCAPTCHA verification without showing the widget
 */
export function InvisibleReCaptcha({
	siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
	onChange,
	onError,
	action = "submit",
}: {
	siteKey?: string;
	onChange?: (token: string) => void;
	onError?: () => void;
	action?: string;
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!siteKey) return;

		const loadScript = () => {
			if (document.getElementById("recaptcha-script")) return;

			const script = document.createElement("script");
			script.id = "recaptcha-script";
			script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		};

		loadScript();
	}, [siteKey]);

	const execute = async (): Promise<string | null> => {
		if (!window.grecaptcha || !siteKey) {
			onError?.();
			return null;
		}

		setLoading(true);
		setError(false);

		try {
			const token = await window.grecaptcha.execute(siteKey, { action });
			onChange?.(token);
			return token;
		} catch (err) {
			console.error("[ReCaptcha] Execution failed:", err);
			setError(true);
			onError?.();
			return null;
		} finally {
			setLoading(false);
		}
	};

	return {
		execute,
		loading,
		error,
		Component: () => (
			<div
				className="g-recaptcha"
				data-sitekey={siteKey}
				data-size="invisible"
				style={{ display: "none" }}
			/>
		),
	};
}

/**
 * useReCaptcha Hook
 * Provides a convenient way to use invisible reCAPTCHA
 */
export function useReCaptcha(action: string = "submit") {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const execute = async (): Promise<string | null> => {
		const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

		if (!siteKey || !window.grecaptcha) {
			console.warn("[ReCaptcha] Not available");
			setError(true);
			return null;
		}

		setLoading(true);
		setError(false);

		try {
			const result = await window.grecaptcha.execute(siteKey, { action });
			setToken(result);
			return result;
		} catch (err) {
			console.error("[ReCaptcha] Execution failed:", err);
			setError(true);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setToken(null);
		setError(false);
	};

	return {
		token,
		loading,
		error,
		execute,
		reset,
	};
}

/**
 * Server-side reCAPTCHA verification utility
 */
export async function verifyReCaptcha(token: string): Promise<boolean> {
	const secretKey = process.env.RECAPTCHA_SECRET_KEY;

	if (!secretKey) {
		console.warn("[ReCaptcha] No secret key configured");
		// Allow in development if no secret key
		return process.env.NODE_ENV === "development";
	}

	try {
		const response = await fetch(
			`https://www.google.com/recaptcha/api/siteverify`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					secret: secretKey,
					response: token,
				}),
			}
		);

		const data = await response.json();

		if (!data.success) {
			console.error("[ReCaptcha] Verification failed:", data["error-codes"]);
			return false;
		}

		return true;
	} catch (error) {
		console.error("[ReCaptcha] Verification error:", error);
		return false;
	}
}
