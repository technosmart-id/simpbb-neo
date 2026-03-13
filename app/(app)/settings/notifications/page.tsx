import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BellIcon } from "lucide-react";

export default function NotificationsSettingsPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BellIcon className="h-5 w-5" />
						Notification Settings
					</CardTitle>
					<CardDescription>
						Configure how and when you receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Notification settings coming soon...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
