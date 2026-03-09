import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Layout, Palette, Type, AlertTriangle, Check, Copy } from "lucide-react";
import { awsLambda } from "@/integrations/aws/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface BlogResult {
  readability: { fleschScore: number; gradeLevel: string; readTime: string; assessment: string };
  seoScore: { overall: number; keywordDensity: string; headingStructure: string; metaDescription: string; suggestions: string[] };
  structureAnalysis: {
    introHook: { score: number; feedback: string }; paragraphFlow: { score: number; feedback: string };
    conclusionStrength: { score: number; feedback: string }; improvements: string[];
  };
  toneConsistency: { score: number; dominantTone: string; shifts: Array<{ location: string; from: string; to: string; suggestion: string }> };
  headlineAnalysis: { current: string; score: number; alternatives: Array<{ headline: string; predictedCTR: number }> };
  contentGaps: Array<{ topic: string; reason: string; suggestedContent: string }>;
  weakParagraphs: Array<{ original: string; reason: string; improved: string }>;
  overallScore: number;
}

export default function BlogAnalyzer() {
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("general");
  const [goal, setGoal] = useState("educate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlogResult | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) { toast({ title: "Please enter your blog content", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await awsLambda.functions.invoke("analyze-blog", { body: { content, audience, goal } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data.analysis);
      toast({ title: "Blog analyzed! ✨" });
    } catch (err: any) { toast({ title: "Analysis failed", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const applyFix = (original: string, replacement: string) => { setContent(content.replace(original, replacement)); toast({ title: "Fix applied! ✅" }); };
  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied! 📋" }); };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Blog Analyzer
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">Analyze blog posts for readability, SEO & engagement</p>
      </div>

      <GlassCard gradient="teal">
        <div className="space-y-5">
          <Textarea placeholder="Paste your blog post here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px] bg-background/30 border-border/30 resize-y backdrop-blur-sm" />
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Target Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-background/30 border-border/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="developers">Developers</SelectItem>
                  <SelectItem value="marketers">Marketers</SelectItem>
                  <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Goal</label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-background/30 border-border/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="educate">Educate</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="inspire">Inspire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="btn-premium text-primary-foreground px-8 rounded-xl font-semibold">
              {loading ? "Analyzing..." : "Analyze Blog"} <BookOpen className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <GlassCard className="flex flex-col items-center py-10">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Blog Score</p>
              <ScoreRing score={result.overallScore} size={200} label="out of 100" />
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard gradient="teal" delay={0.1}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><BookOpen className="w-4 h-4 text-secondary" /></span>
                  Readability
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Flesch Score</span><span className="font-semibold">{result.readability.fleschScore}/100</span></div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${result.readability.fleschScore}%` }} transition={{ duration: 1 }} />
                  </div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Grade Level</span><span className="font-semibold">{result.readability.gradeLevel}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Read Time</span><span className="font-semibold">{result.readability.readTime}</span></div>
                  <Badge variant="outline" className="text-xs">{result.readability.assessment}</Badge>
                </div>
              </GlassCard>

              <GlassCard gradient="purple" delay={0.15}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Search className="w-4 h-4 text-emerald-400" /></span>
                  SEO Score
                  <Badge variant="outline" className="ml-auto text-xs">{result.seoScore.overall}/100</Badge>
                </h3>
                <div className="space-y-3">
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${result.seoScore.overall}%` }} transition={{ duration: 1 }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Keywords: {result.seoScore.keywordDensity}</p>
                  <p className="text-xs text-muted-foreground">Headings: {result.seoScore.headingStructure}</p>
                  <div className="bg-background/30 rounded-xl p-3 border border-border/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Meta Description</p>
                    <p className="text-xs">{result.seoScore.metaDescription}</p>
                    <Button variant="ghost" size="sm" className="mt-1 h-6 text-[10px]" onClick={() => copyText(result.seoScore.metaDescription)}>
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Structure Analysis */}
            <GlassCard delay={0.2}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Layout className="w-4 h-4 text-blue-400" /></span>
                Structure Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Intro Hook", data: result.structureAnalysis.introHook },
                  { label: "Paragraph Flow", data: result.structureAnalysis.paragraphFlow },
                  { label: "Conclusion", data: result.structureAnalysis.conclusionStrength },
                ].map((item, i) => (
                  <motion.div key={item.label} className="stat-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{item.label}</p>
                    <p className="text-3xl font-heading font-bold gradient-text">{item.data.score}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{item.data.feedback}</p>
                  </motion.div>
                ))}
              </div>
              {result.structureAnalysis.improvements?.length > 0 && (
                <ul className="space-y-1">
                  {result.structureAnalysis.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">→</span> {imp}</li>
                  ))}
                </ul>
              )}
            </GlassCard>

            {/* Tone + Headline side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard gradient="pink" delay={0.25}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Palette className="w-4 h-4 text-accent" /></span>
                  Tone Consistency
                  <Badge variant="outline" className="ml-auto text-xs">{result.toneConsistency.score}/100</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Dominant: <span className="text-foreground font-medium">{result.toneConsistency.dominantTone}</span></p>
                {result.toneConsistency.shifts?.length > 0 && (
                  <div className="space-y-2">
                    {result.toneConsistency.shifts.map((shift, i) => (
                      <div key={i} className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3">
                        <p className="text-xs"><span className="text-yellow-400">{shift.location}:</span> {shift.from} → {shift.to}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{shift.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard delay={0.3}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Type className="w-4 h-4 text-primary" /></span>
                  Headline Analyzer
                  <Badge variant="outline" className="ml-auto text-xs">{result.headlineAnalysis.score}/100</Badge>
                </h3>
                <p className="text-xs mb-3">Current: <span className="italic text-muted-foreground">"{result.headlineAnalysis.current}"</span></p>
                <div className="space-y-2">
                  {result.headlineAnalysis.alternatives?.map((alt, i) => (
                    <div key={i} className="bg-background/30 rounded-xl p-3 flex items-center justify-between gap-3 border border-border/20">
                      <div className="flex-1">
                        <p className="text-xs">{alt.headline}</p>
                        <p className="text-[10px] text-muted-foreground">CTR: <span className="text-emerald-400 font-semibold">{alt.predictedCTR}%</span></p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(alt.headline)}><Copy className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Content Gaps */}
            {result.contentGaps?.length > 0 && (
              <GlassCard delay={0.35}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><AlertTriangle className="w-4 h-4 text-orange-400" /></span>
                  Content Gaps
                </h3>
                <div className="space-y-3">
                  {result.contentGaps.map((gap, i) => (
                    <div key={i} className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-4">
                      <p className="text-sm font-heading font-semibold">{gap.topic}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{gap.reason}</p>
                      <div className="bg-background/30 rounded-xl p-3 mt-2 flex justify-between items-start gap-3 border border-border/20">
                        <p className="text-xs">{gap.suggestedContent}</p>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(gap.suggestedContent)}><Copy className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Weak Paragraphs */}
            {result.weakParagraphs?.length > 0 && (
              <GlassCard gradient="teal" delay={0.4}>
                <h3 className="section-title mb-5">
                  <span className="icon-box"><Check className="w-4 h-4 text-emerald-400" /></span>
                  One-Click Improve
                </h3>
                <div className="space-y-4">
                  {result.weakParagraphs.map((wp, i) => (
                    <div key={i} className="bg-background/30 rounded-xl p-4 border border-border/20">
                      <p className="text-xs line-through text-muted-foreground mb-1">{wp.original.substring(0, 200)}...</p>
                      <p className="text-[10px] text-red-400 mb-3">{wp.reason}</p>
                      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex justify-between items-start gap-3">
                        <p className="text-xs text-emerald-300">{wp.improved}</p>
                        <Button size="sm" className="btn-premium text-primary-foreground rounded-lg text-xs h-7" onClick={() => applyFix(wp.original, wp.improved)}>Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
