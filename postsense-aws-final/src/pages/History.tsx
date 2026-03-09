import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { History as HistoryIcon, Trash2, Eye, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Analysis {
  id: string; module: string; platform: string; content: string; result: any; created_at: string;
}

export default function History() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const { toast } = useToast();

  const fetchAnalyses = async () => {
    setLoading(true);
    if (filterModule !== "all") query = query.eq("module", filterModule);
    if (filterPlatform !== "all") query = query.eq("platform", filterPlatform);
    const { data, error } = await query;
    if (error) toast({ title: "Error loading history", variant: "destructive" });
    else setAnalyses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnalyses(); }, [filterModule, filterPlatform]);

  const deleteAnalysis = async (id: string) => {
    if (error) toast({ title: "Error deleting", variant: "destructive" });
    else { toast({ title: "Deleted successfully" }); fetchAnalyses(); }
  };

  const getModuleColor = (m: string) => {
    const map: Record<string, string> = {
      post: "from-primary/20 to-accent/10 text-primary border-primary/20",
      script: "from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/20",
      blog: "from-secondary/20 to-teal-500/10 text-secondary border-secondary/20",
      repurpose: "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20",
      viral: "from-accent/20 to-pink-500/10 text-accent border-accent/20",
    };
    return map[m] || "from-muted to-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Analysis History
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">View all your past analyses</p>
      </div>

      <GlassCard>
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-40 bg-background/30 border-border/30 text-xs"><SelectValue placeholder="All Modules" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="script">Script</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="repurpose">Repurpose</SelectItem>
              <SelectItem value="viral">Viral</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40 bg-background/30 border-border/30 text-xs"><SelectValue placeholder="All Platforms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm">No analyses yet. Start analyzing content!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis, i) => (
              <motion.div 
                key={analysis.id} 
                className="bg-background/30 p-4 rounded-xl flex items-center justify-between gap-4 border border-border/20 hover:border-border/40 transition-all"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 text-[10px] rounded-full capitalize font-semibold bg-gradient-to-r border ${getModuleColor(analysis.module)}`}>
                      {analysis.module}
                    </span>
                    <span className="px-2 py-0.5 bg-muted/30 text-muted-foreground text-[10px] rounded-full capitalize">{analysis.platform}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(analysis.created_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <p className="text-xs truncate text-muted-foreground">{analysis.content.slice(0, 100)}...</p>
                  {analysis.result?.overallScore && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" /> Score: <span className="font-semibold text-foreground">{analysis.result.overallScore}/100</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteAnalysis(analysis.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
