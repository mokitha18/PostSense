import { 
  FileText, 
  Video, 
  BookOpen, 
  Repeat, 
  TrendingUp, 
  History, 
  FileBarChart,
} from "lucide-react";
import postsenseLogo from "@/assets/postsense-logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const analyzerItems = [
  { title: "Post Analyzer", url: "/", icon: FileText },
  { title: "Script Analyzer", url: "/script", icon: Video },
  { title: "Blog Analyzer", url: "/blog", icon: BookOpen },
];

const toolItems = [
  { title: "Repurpose Engine", url: "/repurpose", icon: Repeat },
  { title: "Viral Predictor", url: "/viral", icon: TrendingUp },
];

const dataItems = [
  { title: "History", url: "/history", icon: History },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderNavItems = (items: typeof analyzerItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink 
            to={item.url} 
            end 
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
              isActive(item.url) 
                ? 'bg-gradient-to-r from-primary/15 to-accent/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
            activeClassName=""
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isActive(item.url) 
                ? 'bg-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.2)]' 
                : 'bg-muted/30 group-hover:bg-muted/50'
            }`}>
              <item.icon className="h-4 w-4" />
            </div>
            {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar pt-5">
        {/* Logo */}
        <div className={`px-4 mb-8 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.3)]">
              <img src={postsenseLogo} alt="PostSense" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary opacity-20 blur-lg" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground tracking-tight">PostSense</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">AI Content Suite</p>
            </div>
          )}
        </div>

        {/* Analyzers */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 px-4 mb-1 font-semibold">
            {!collapsed && "Analyzers"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(analyzerItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 px-4 mb-1 font-semibold">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(toolItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Data */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 px-4 mb-1 font-semibold">
            {!collapsed && "Data"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(dataItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
