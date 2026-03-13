"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
	UserIcon,
	Bell,
	Building2,
} from "lucide-react"

const settingsNav = [
	{
		title: "Account",
		href: "/settings",
		icon: UserIcon,
	},
	{
		title: "Notifications",
		href: "/settings/notifications",
		icon: Bell,
	},
	{
		title: "Organizations",
		href: "/settings/organizations",
		icon: Building2,
	},
]

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	return (
		<div className="flex-1 flex flex-col md:flex-row gap-6">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-48 flex-shrink-0">
				<nav className="sticky top-20 space-y-1">
					{settingsNav.map((item) => {
						const isActive = pathname === item.href
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
