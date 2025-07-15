"use client";

import {
	LayoutDashboard,
	CalendarClock,
	Users,
	MapPin,
	Settings,
	LogOut,
	TruckIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarSeparator,
} from "@/components/ui/sidebar";

interface AdminNavigationProps {
	children: React.ReactNode;
	userEmail?: string;
	userName?: string;
}

const AdminNavigation = ({ children, userEmail, userName }: AdminNavigationProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/login" });
	};

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full overflow-hidden">
				<Sidebar>
					<SidebarHeader className="border-b border-border/50 pb-2">
						<div className="flex items-center px-2 py-3">
							<TruckIcon className="mr-2 size-6 text-primary" />
							<h1 className="text-xl font-bold text-primary">Onelimo</h1>
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Main</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton
											isActive={pathname === "/admin"}
											onClick={() => router.push("/admin")}
										>
											<LayoutDashboard className="size-4" />
											<span>Dashboard</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											isActive={pathname === "/admin/booking-tracker"}
											onClick={() => router.push("/admin/booking-tracker")}
										>
											<CalendarClock className="size-4" />
											<span>Bookings</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											isActive={pathname === "/admin/service-providers"}
											onClick={() => router.push("/admin/service-providers")}
										>
											<Users className="size-4" />
											<span>Service Providers</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											isActive={pathname === "/admin/locations"}
											onClick={() => router.push("/admin/locations")}
										>
											<MapPin className="size-4" />
											<span>Locations</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<SidebarSeparator />
						<SidebarGroup>
							<SidebarGroupLabel>Settings</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton
											isActive={pathname === "/admin/settings"}
											onClick={() => router.push("/admin/settings")}
										>
											<Settings className="size-4" />
											<span>Settings</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter className="border-t border-border/50 pt-2">
						<div className="flex flex-col gap-2 p-2">
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<p className="text-sm font-medium">{userName || "Admin"}</p>
									<p className="text-xs text-muted-foreground">
										{userEmail || "No email provided"}
									</p>
								</div>
								<Button variant="ghost" size="icon" onClick={handleLogout}>
									<LogOut className="size-4" />
								</Button>
							</div>
						</div>
					</SidebarFooter>
				</Sidebar>
				<div className="flex flex-1 flex-col overflow-hidden">
					<main className="w-full flex-1 overflow-auto p-8">
						<div className="container mx-auto max-w-screen-2xl">{children}</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
};

export default AdminNavigation;
