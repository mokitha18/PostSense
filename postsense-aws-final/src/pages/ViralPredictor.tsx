import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Zap, Copy, Clock, ThumbsUp, ThumbsDown, Hash, Sparkles, Target, MessageCircle, Share2, Eye } from "lucide-react";
import { awsLambda } from "@/integrations/aws/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ViralPrediction {
  viralScore: number;
  verdict: string;
  triggers: { emotion: number; relatability: number; curiosity: number; controversy: number; uniqueness: number; shareability: number; timing: number };
  strengths: string[];
  weaknesses: string[];
  trendAlignment: { score: number; matchedTrends: string[]; suggestion: string };
  platformTips: string[];
  engagementForecast: { likes: string; comments: string; shares: string; reach: string };
  improvedVersion: string;
  hashtagSuggestions: string[];
  bestPostingTime: string;
}

export default function ViralPredictor() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralPrediction | null>(null);

  const handlePredict = async () => {
    if (!content.trim()) { toast({ title: "Please enter your content", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await awsLambda.functions.invoke("viral-predict", { body: { content, platform } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data.prediction);
      toast({ title: "Viral prediction ready! 🔥" });
    } catch (err: any) { toast({ title: "Prediction failed", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copyText = (text: string, label: string) => { navigator.clipboard.writeText(text); toast({ title: `${label} copied! 📋` }); };

  const getVerdictColor = (v: string) => {
    if (v.includes("Will Go Viral")) return "text-emerald-400";
    if (v.includes("Has Potential")) return "text-yellow-400";
    if (v.includes("Needs Work")) return "text-orange-400";
    return "text-red-400";
  };

  const triggerLabels: { key: keyof ViralPrediction["triggers"]; label: string; gradient: string }[] = [
    { key: "emotion", label: "Emotion", gradient: "from-pink-500 to-rose-400" },
    { key: "relatability", label: "Relatability", gradient: "from-blue-500 to-cyan-400" },
    { key: "curiosity", label: "Curiosity", gradient: "from-purple-500 to-violet-400" },
    { key: "controversy", label: "Controversy", gradient: "from-red-500 to-orange-400" },
    { key: "uniqueness", label: "Uniqueness", gradient: "from-emerald-500 to-teal-400" },
    { key: "shareability", label: "Shareability", gradient: "from-cyan-500 to-blue-400" },
    { key: "timing", label: "Timing", gradient: "from-amber-500 to-yellow-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Viral Predictor
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">Predict viral potential before you hit publish</p>
      </div>

      <GlassCard gradient="pink">
        <div className="space-y-5">
          <Textarea placeholder="Paste your content here to predict viral potential..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[140px] bg-background/30 border-border/30 resize-y backdrop-blur-sm" />
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-background/30 border-border/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePredict} disabled={loading} className="btn-premium text-primary-foreground px-8 rounded-xl font-semibold">
              {loading ? "Predicting..." : "Predict Virality"} <TrendingUp className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Score + Forecast + Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <GlassCard className="flex flex-col items-center justify-center py-8">
                <ScoreRing score={result.viralScore} size={140} />
                <p className={`mt-4 font-heading font-bold text-lg ${getVerdictColor(result.verdict)}`}>{result.verdict}</p>
              </GlassCard>

              <GlassCard delay={0.1}>
                <h3 className="section-title mb-4">
                  <span className="icon-box"><Target className="w-4 h-4 text-primary" /></span>
                  Engagement Forecast
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: <ThumbsUp className="w-3.5 h-3.5" />, label: "Likes", value: result.engagementForecast.likes },
                    { icon: <MessageCircle className="w-3.5 h-3.5" />, label: "Comments", value: result.engagementForecast.comments },
                    { icon: <Share2 className="w-3.5 h-3.5" />, label: "Shares", value: result.engagementForecast.shares },
                    { icon: <Eye className="w-3.5 h-3.5" />, label: "Reach", value: result.engagementForecast.reach },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">{item.icon} {item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Best time: {result.bestPostingTime}
                </p>
              </GlassCard>

              <GlassCard gradient="purple" delay={0.15}>
                <h3 className="section-title mb-4">
                  <span className="icon-box"><Zap className="w-4 h-4 text-yellow-400" /></span>
                  Trend Alignment
                </h3>
                <div className="text-3xl font-heading font-bold gradient-text mb-3">{result.trendAlignment.score}%</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {result.trendAlignment.matchedTrends?.map((trend, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">{trend}</Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{result.trendAlignment.suggestion}</p>
              </GlassCard>
            </div>

            {/* Viral Triggers */}
            <GlassCard delay={0.2}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Sparkles className="w-4 h-4 text-primary" /></span>
                Viral Triggers
              </h3>
              <div className="space-y-3">
                {triggerLabels.map(({ key, label, gradient }) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{label}</span>
                      <span className="font-bold">{result.triggers[key]}%</span>
                    </div>
                    <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.triggers[key]}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <GlassCard className="border border-emerald-500/15" delay={0.25}>
                <h3 className="section-title mb-4">
                  <span className="icon-box"><ThumbsUp className="w-4 h-4 text-emerald-400" /></span>
                  <span className="text-emerald-400">Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-xs flex gap-2"><span className="text-emerald-400 shrink-0">✓</span> {s}</li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard className="border border-red-500/15" delay={0.3}>
                <h3 className="section-title mb-4">
                  <span className="icon-box"><ThumbsDown className="w-4 h-4 text-red-400" /></span>
                  <span className="text-red-400">Weaknesses</span>
                </h3>
                <ul className="space-y-2">
                  {result.weaknesses?.map((w, i) => (
                    <li key={i} className="text-xs flex gap-2"><span className="text-red-400 shrink-0">✗</span> {w}</li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Platform Tips */}
            <GlassCard delay={0.35}>
              <h3 className="section-title mb-4">Platform Tips for <span className="capitalize gradient-text">{platform}</span></h3>
              <div className="space-y-2">
                {result.platformTips?.map((tip, i) => (
                  <div key={i} className="bg-primary/5 rounded-xl p-3 text-xs flex gap-2 border border-primary/10">
                    <span className="text-primary shrink-0">💡</span> {tip}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Improved Version */}
            <GlassCard className="border border-primary/15" gradient="purple" delay={0.4}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">
                  <span className="icon-box"><Sparkles className="w-4 h-4 text-primary" /></span>
                  Viral-Optimized Version
                </h3>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(result.improvedVersion, "Optimized version")}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.improvedVersion}</p>
              </div>
            </GlassCard>

            {/* Hashtags */}
            {result.hashtagSuggestions?.length > 0 && (
              <GlassCard delay={0.45}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title">
                    <span className="icon-box"><Hash className="w-4 h-4 text-primary" /></span>
                    Suggested Hashtags
                  </h3>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(result.hashtagSuggestions.map(h => `#${h.replace('#', '')}`).join(" "), "Hashtags")}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtagSuggestions.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5 px-3 py-1">
                      #{tag.replace('#', '')}
                    </Badge>
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
