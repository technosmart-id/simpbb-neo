"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
	Building2,
	Shield,
} from "lucide-react"

const settingsNav = [
	{
		title: "Organizations",
		href: "/settings/organizations",
		icon: Building2,
	},
	{
		title: "Roles & Permissions",
		href: "/settings/roles",
		icon: Shield,
	},
]

// Routes that should NOT show the org sidebar
const userScopedRoutes = ["/settings", "/settings/billing"]

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	// Don't show org sidebar for user-scoped settings
	const isUserScoped = userScopedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))

	if (isUserScoped) {
		return <div className="flex-1">{children}</div>
	}

	return (
		<div className="flex-1 flex flex-col md:flex-row gap-6">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-48 flex-shrink-0">
				<nav className="sticky top-20 space-y-1">
					<div className="px-3 py-2 text-xs font-medium text-muted-foreground">
						Organization Settings
					</div>
					{settingsNav.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
						const Icon = item.icon
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								)}
							>
								<Icon className="h-4 w-4" />
								{item.title}
							</Link>
						)
					})}
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 min-w-0">
				{children}
			</main>
		</div>
	)
}
