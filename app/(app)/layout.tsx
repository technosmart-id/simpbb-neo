"use client"

import { AppSidebar } from "@/components/layouts/app-sidebar"
import { DynamicBreadcrumbs } from "@/components/layouts/dynamic-breadcrumbs"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/layouts/notification-bell"
import { Separator } from "@/components/ui/separator"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<div className="flex-1">
							<DynamicBreadcrumbs />
						</div>
					</div>
					<div className="ml-auto flex items-center gap-2">
						<ModeToggle />
						<NotificationBell />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
