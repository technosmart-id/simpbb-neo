"use client";

import { useORPC } from "@/lib/orpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BellIcon, 
  MessageSquareIcon, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Loader2Icon,
  EyeIcon,
  EyeOffIcon
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function NotificationsSettingsPage() {
  const orpc = useORPC();
  const { data: prefs, isLoading, refetch } = useQuery(orpc.notifications.getPreferences.queryOptions());

  const updateMutation = useMutation(orpc.notifications.updatePreferences.mutationOptions({
    onSuccess: () => {
      toast.success("Preferences updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update preferences");
    }
  }));

  const handleToggle = (key: "inAppEnabled" | "toastsEnabled" | "successEnabled" | "infoEnabled" | "warningEnabled" | "errorEnabled", value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
        <p className="text-muted-foreground">
          Configure how and when you want to be alerted.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-primary" />
            General Delivery
          </CardTitle>
          <CardDescription>
            Tweak the global behavior of your notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="inAppEnabled" className="text-base">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show the red unread badge and collect alerts in your notification bell.
              </p>
            </div>
            <Switch
              id="inAppEnabled"
              checked={prefs.inAppEnabled}
              onCheckedChange={(v) => handleToggle("inAppEnabled", v)}
              disabled={updateMutation.isPending}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="toastsEnabled" className="text-base">Real-time Toasts</Label>
              <p className="text-sm text-muted-foreground">
                Pop up a small message at the bottom of the screen when something happens.
              </p>
            </div>
            <Switch
              id="toastsEnabled"
              checked={prefs.toastsEnabled}
              onCheckedChange={(v) => handleToggle("toastsEnabled", v)}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-primary" />
            Type Filtering
          </CardTitle>
          <CardDescription>
            Select which types of events should trigger a notification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="successEnabled" className="text-sm font-medium">Success Alerts</Label>
                <p className="text-xs text-muted-foreground">Confirmation of successful actions and tasks.</p>
              </div>
            </div>
            <Switch
              id="successEnabled"
              checked={prefs.successEnabled}
              onCheckedChange={(v) => handleToggle("successEnabled", v)}
              disabled={updateMutation.isPending || !prefs.inAppEnabled}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="infoEnabled" className="text-sm font-medium">Information</Label>
                <p className="text-xs text-muted-foreground">General updates and status reports.</p>
              </div>
            </div>
            <Switch
              id="infoEnabled"
              checked={prefs.infoEnabled}
              onCheckedChange={(v) => handleToggle("infoEnabled", v)}
              disabled={updateMutation.isPending || !prefs.inAppEnabled}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="warningEnabled" className="text-sm font-medium">Warnings</Label>
                <p className="text-xs text-muted-foreground">Be alerted about potential issues before they break.</p>
              </div>
            </div>
            <Switch
              id="warningEnabled"
              checked={prefs.warningEnabled}
              onCheckedChange={(v) => handleToggle("warningEnabled", v)}
              disabled={updateMutation.isPending || !prefs.inAppEnabled}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="errorEnabled" className="text-sm font-medium">Error Alerts</Label>
                <p className="text-xs text-muted-foreground">Critical failures that need your immediate attention.</p>
              </div>
            </div>
            <Switch
              id="errorEnabled"
              checked={prefs.errorEnabled}
              onCheckedChange={(v) => handleToggle("errorEnabled", v)}
              disabled={updateMutation.isPending || !prefs.inAppEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
