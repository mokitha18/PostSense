import { GlassCard } from "@/components/ui/GlassCard";
import { FileBarChart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Reports
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">View and download your generated reports</p>
      </div>
      
      <GlassCard className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 border border-primary/10">
          <FileBarChart className="w-10 h-10 text-primary/40" />
        </div>
        <h3 className="font-heading font-bold text-lg mb-2">No Reports Yet</h3>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Generate reports from your analyses to see them here.
        </p>
      </GlassCard>
    </div>
  );
}
