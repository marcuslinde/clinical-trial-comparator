import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Search, FlaskConical, Bookmark } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-slate-50">
				<Sidebar className="border-r border-slate-200">
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-2">
								Novo Intelligence
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild isActive tooltip="Search">
											<a href="/" className="font-medium">
												<Search className="mr-2 h-4 w-4" />
												<span>Trial Search</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>

									{/* Placeholder for future "Saved Trials" */}
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Saved">
											<a
												href="#"
												className="text-slate-600 hover:text-slate-900"
											>
												<Bookmark className="mr-2 h-4 w-4" />
												<span>Saved Trials</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>

									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Analysis">
											<a
												href="#"
												className="text-slate-600 hover:text-slate-900"
											>
												<FlaskConical className="mr-2 h-4 w-4" />
												<span>My Analyses</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarRail />
				</Sidebar>

				<main className="flex-1 h-screen overflow-auto">{children}</main>
			</div>
		</SidebarProvider>
	);
}
