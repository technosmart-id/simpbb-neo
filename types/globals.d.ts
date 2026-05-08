// Global type declarations

declare global {
	interface Window {
		grecaptcha?: {
			reset: () => void;
			getResponse: () => string;
			render: (container: string | HTMLElement, options: {
				sitekey: string;
				theme?: "light" | "dark";
				size?: "compact" | "normal" | "invisible";
				callback?: (token: string) => void;
				"expired-callback"?: () => void;
				"error-callback"?: () => void;
			}) => string;
			// v3 execute method
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

export {};
