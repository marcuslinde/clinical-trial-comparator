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
} from "@/components/ui/sidebar";
import { Search, Info, FlaskConical } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<Sidebar>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Novo Intelligence</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild isActive>
											<a href="#">
												<Search className="mr-2 h-4 w-4" />
												<span>Trial Search</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<a href="#">
												<FlaskConical className="mr-2 h-4 w-4" />
												<span>My Analyses</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<a href="#">
												<Info className="mr-2 h-4 w-4" />
												<span>About</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
				<main className="flex-1 p-6 bg-slate-50 overflow-auto">{children}</main>
			</div>
		</SidebarProvider>
	);
}
