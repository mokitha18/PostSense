import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
      </div>
      <div />
    </header>
  );
}
