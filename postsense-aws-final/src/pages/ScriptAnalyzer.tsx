import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, Zap, TrendingDown, MessageSquare, Timer, Lightbulb, RefreshCw, Check, Copy } from "lucide-react";
import { awsLambda } from "@/integrations/aws/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
  hookStrength: { score: number; firstThirtySeconds: string; analysis: string; improvedHook: string };
  retentionArc: {
    intro: { energy: number; label: string }; middle: { energy: number; label: string };
    climax: { energy: number; label: string }; outro: { energy: number; label: string };
    overallFlow: string;
  };
  dropOffPoints: Array<{ paragraph: string; position: string; reason: string; improvement: string }>;
  ctaAnalysis: { detected: string; score: number; position: string; improvedCTA: string };
  pacingAnalysis: { estimatedWPM: number; assessment: string; sections: Array<{ section: string; pacing: string; suggestion: string }> };
  smartSuggestions: Array<{ type: string; original: string; improved: string; reason: string }>;
  overallScore: number;
  rewrittenScript: string;
}

export default function ScriptAnalyzer() {
  const [script, setScript] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [videoLength, setVideoLength] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!script.trim()) { toast({ title: "Please enter your script", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await awsLambda.functions.invoke("analyze-script", { body: { script, platform, videoLength: parseInt(videoLength) } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data.analysis);
      toast({ title: "Script analyzed! ✨" });
    } catch (err: any) { toast({ title: "Analysis failed", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const applyFix = (original: string, replacement: string) => { setScript(script.replace(original, replacement)); toast({ title: "Fix applied! ✅" }); };
  const applyRewrite = () => { if (result?.rewrittenScript) { setScript(result.rewrittenScript); toast({ title: "Full script rewritten! 🎬" }); } };

  const getEnergyColor = (e: number) => e >= 70 ? "from-emerald-500 to-teal-400" : e >= 40 ? "from-yellow-500 to-amber-400" : "from-red-500 to-orange-400";
  const getPacingColor = (p: string) => p === "good" ? "text-emerald-400" : p === "fast" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Script Analyzer
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">Deep analysis for YouTube, Reels & Podcast scripts</p>
      </div>

      <GlassCard gradient="purple">
        <div className="space-y-5">
          <Textarea placeholder="Paste your full video script here..." value={script} onChange={(e) => setScript(e.target.value)} className="min-h-[200px] bg-background/30 border-border/30 resize-y backdrop-blur-sm" />
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-background/30 border-border/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube Video</SelectItem>
                  <SelectItem value="reels">Instagram Reels</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="shorts">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[120px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Length (min)</label>
              <Input type="number" value={videoLength} onChange={(e) => setVideoLength(e.target.value)} className="bg-background/30 border-border/30" min="1" max="120" />
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="btn-premium text-primary-foreground px-8 rounded-xl font-semibold">
              {loading ? "Analyzing..." : "Analyze Script"} <Video className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <GlassCard className="flex flex-col items-center py-10">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Script Score</p>
              <ScoreRing score={result.overallScore} size={200} label="out of 100" />
            </GlassCard>

            {/* Hook Strength */}
            <GlassCard gradient="pink" delay={0.1}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Zap className="w-4 h-4 text-yellow-400" /></span>
                Hook Strength
                <Badge variant="outline" className="ml-auto text-xs">{result.hookStrength.score}/100</Badge>
              </h3>
              <p className="text-muted-foreground text-xs mb-3">{result.hookStrength.analysis}</p>
              <div className="bg-background/30 rounded-xl p-4 mb-3 border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First 30 seconds</p>
                <p className="text-sm italic text-muted-foreground">"{result.hookStrength.firstThirtySeconds}"</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] text-primary uppercase tracking-wider mb-1 font-semibold">Improved Hook</p>
                  <p className="text-sm">{result.hookStrength.improvedHook}</p>
                </div>
                <Button size="sm" className="btn-premium text-primary-foreground rounded-lg text-xs h-8" onClick={() => applyFix(result.hookStrength.firstThirtySeconds, result.hookStrength.improvedHook)}>Apply</Button>
              </div>
            </GlassCard>

            {/* Retention Arc */}
            <GlassCard gradient="teal" delay={0.15}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><TrendingDown className="w-4 h-4 text-secondary" /></span>
                Retention Arc
              </h3>
              <div className="flex gap-3 mb-4">
                {(["intro", "middle", "climax", "outro"] as const).map((section, i) => (
                  <div key={section} className="flex-1 text-center">
                    <div className="h-28 bg-background/20 rounded-xl flex items-end overflow-hidden border border-border/10">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${result.retentionArc[section].energy}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                        className={`w-full bg-gradient-to-t ${getEnergyColor(result.retentionArc[section].energy)} rounded-t-lg`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 capitalize font-medium">{section}</p>
                    <p className="text-sm font-heading font-bold">{result.retentionArc[section].energy}%</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{result.retentionArc[section].label}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{result.retentionArc.overallFlow}</p>
            </GlassCard>

            {/* Drop-off Points */}
            {result.dropOffPoints?.length > 0 && (
              <GlassCard delay={0.2}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><TrendingDown className="w-4 h-4 text-red-400" /></span>
                  Drop-off Points
                </h3>
                <div className="space-y-4">
                  {result.dropOffPoints.map((point, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                      <Badge variant="outline" className="text-red-400 border-red-400/30 text-xs mb-2">{point.position}</Badge>
                      <p className="text-xs italic text-muted-foreground mb-2 line-through">"{point.paragraph.substring(0, 150)}..."</p>
                      <p className="text-xs text-red-400/80 mb-3">{point.reason}</p>
                      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex justify-between items-start gap-3">
                        <p className="text-xs">{point.improvement}</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => applyFix(point.paragraph, point.improvement)}>Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* CTA + Pacing side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard delay={0.25}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><MessageSquare className="w-4 h-4 text-primary" /></span>
                  CTA Analysis
                  <Badge variant="outline" className="ml-auto text-xs">{result.ctaAnalysis.score}/100</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mb-1">Detected: <span className="text-foreground">{result.ctaAnalysis.detected}</span></p>
                <p className="text-[10px] text-muted-foreground mb-3">Position: {result.ctaAnalysis.position}</p>
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex justify-between items-start gap-3">
                  <div>
                    <p className="text-[10px] text-primary uppercase tracking-wider mb-1 font-semibold">Improved CTA</p>
                    <p className="text-xs">{result.ctaAnalysis.improvedCTA}</p>
                  </div>
                  <Button size="sm" className="btn-premium text-primary-foreground rounded-lg text-xs h-7" onClick={() => applyFix(result.ctaAnalysis.detected, result.ctaAnalysis.improvedCTA)}>Apply</Button>
                </div>
              </GlassCard>

              <GlassCard delay={0.3}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Timer className="w-4 h-4 text-blue-400" /></span>
                  Pacing Analysis
                  <Badge variant="outline" className="ml-auto text-xs">{result.pacingAnalysis.estimatedWPM} WPM</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Overall: <span className={`font-semibold ${result.pacingAnalysis.assessment === "good" ? "text-emerald-400" : "text-yellow-400"}`}>{result.pacingAnalysis.assessment}</span></p>
                <div className="space-y-2">
                  {result.pacingAnalysis.sections?.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-background/30 rounded-xl p-3 border border-border/10">
                      <span className="text-xs font-medium w-20">{s.section}</span>
                      <span className={`text-xs font-semibold w-12 ${getPacingColor(s.pacing)}`}>{s.pacing}</span>
                      <span className="text-[10px] text-muted-foreground flex-1">{s.suggestion}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Smart Suggestions */}
            {result.smartSuggestions?.length > 0 && (
              <GlassCard gradient="purple" delay={0.35}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Lightbulb className="w-4 h-4 text-yellow-400" /></span>
                  Smart Suggestions
                </h3>
                <div className="space-y-3">
                  {result.smartSuggestions.map((s, i) => (
                    <div key={i} className="bg-background/30 rounded-xl p-4 border border-border/20">
                      <Badge variant="outline" className="mb-2 capitalize text-[10px]">{s.type}</Badge>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-xs line-through text-muted-foreground">{s.original}</p>
                          <p className="text-xs text-emerald-400">{s.improved}</p>
                          <p className="text-[10px] text-muted-foreground">{s.reason}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => applyFix(s.original, s.improved)}>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Rewrite */}
            {result.rewrittenScript && (
              <GlassCard delay={0.4}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title">
                    <span className="icon-box"><RefreshCw className="w-4 h-4 text-primary" /></span>
                    Rewritten Script
                  </h3>
                  <Button onClick={applyRewrite} className="btn-premium text-primary-foreground rounded-xl text-xs px-6">
                    Apply Full Rewrite <RefreshCw className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="bg-background/30 rounded-xl p-5 max-h-[400px] overflow-y-auto border border-border/20">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.rewrittenScript}</p>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { navigator.clipboard.writeText(result.rewrittenScript); toast({ title: "Copied! 📋" }); }}>
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
