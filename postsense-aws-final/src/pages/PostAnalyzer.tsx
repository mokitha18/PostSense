import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkeletonCard, SkeletonScore } from "@/components/ui/SkeletonCard";
import { useToast } from "@/hooks/use-toast";
import { awsLambda } from "@/integrations/aws/client";
import { 
  Sparkles, AlertTriangle, Users, ThermometerSun, Target, Edit3, 
  Skull, TrendingUp, FileDown, Check, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

const platforms = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube Community" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "inspirational", label: "Inspirational" },
];

interface AnalysisResult {
  overallScore: number;
  emotions: {
    primary: { name: string; emoji: string; confidence: number };
    secondary: { name: string; score: number }[];
    reasoning: string;
  };
  misinterpretationRisk: {
    score: number;
    flaggedPhrases: { phrase: string; risk: number; reason: string; suggestion: string }[];
  };
  audiencePersonas: { name: string; dropOffRisk: number; thought: string; suggestion: string }[];
  attentionHeatmap: { word: string; strength: string }[];
  toneAlignment: {
    intended: string;
    perceived: string;
    matchPercentage: number;
    adjustments: { current: string; suggested: string; reason: string }[];
  };
  microEdits: { original: string; improved: string; reason: string }[];
  cringeDetector: {
    score: number;
    flaggedPhrases: { phrase: string; replacement: string; reason: string }[];
  };
  engagementPrediction: {
    likes: number;
    comments: number;
    shares: number;
    bestTimeToPost: string;
  };
}

const SectionIcon = ({ icon: Icon, color = "primary" }: { icon: any; color?: string }) => (
  <div className={`icon-box bg-${color}/10 border-${color}/20`}>
    <Icon className="w-4 h-4" />
  </div>
);

export default function PostAnalyzer() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState(false);
  const { toast } = useToast();

  const analyzePost = async () => {
    if (!content.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await awsLambda.functions.invoke("analyze-post", {
        body: { content, platform, tone },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data.analysis);
      toast({ title: "Analysis complete! ✨" });
    } catch (error) {
      toast({ title: "Analysis failed", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFix = (original: string, replacement: string) => {
    setContent(content.replace(original, replacement));
    toast({ title: "Fix applied!", description: `"${original}" → "${replacement}"` });
  };

  const getHeatmapColor = (strength: string) => {
    switch (strength) {
      case "strong": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_hsl(142_76%_36%/0.1)]";
      case "moderate": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      case "weak": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "dropoff": return "bg-red-500/15 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <motion.h1 
          className="text-4xl font-heading font-bold gradient-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Post Analyzer
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">
          AI-powered deep analysis for your social media content
        </p>
      </div>

      {/* Input Section */}
      <GlassCard gradient="purple">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-48 bg-background/30 border-border/30 backdrop-blur-sm">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-48 bg-background/30 border-border/30 backdrop-blur-sm">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Paste your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-background/30 border-border/30 text-foreground resize-none backdrop-blur-sm"
          />

          <Button 
            onClick={analyzePost} 
            disabled={isLoading || !content.trim()}
            className="btn-premium text-primary-foreground px-8 py-2.5 rounded-xl font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Analyzing..." : "Analyze Post"}
          </Button>
        </div>
      </GlassCard>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex justify-center"><SkeletonScore /></div>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Overall Score */}
          <GlassCard className="flex flex-col items-center py-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Overall Score</p>
            <ScoreRing score={result.overallScore} size={200} label="out of 100" />
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Simulator */}
            <GlassCard gradient="pink" delay={0.1}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><ThermometerSun className="w-4 h-4 text-accent" /></span>
                Emotion Simulator
              </h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-6xl animate-float">{result.emotions.primary.emoji}</div>
                <div>
                  <p className="font-heading font-bold text-lg">{result.emotions.primary.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-primary rounded-full" style={{ width: `${result.emotions.primary.confidence}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{result.emotions.primary.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 mb-4">
                {result.emotions.secondary?.map((e, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs w-20 text-muted-foreground">{e.name}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary/80 to-accent/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${e.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{e.score}%</span>
                  </div>
                ))}
              </div>
              <Collapsible open={expandedReasoning} onOpenChange={setExpandedReasoning}>
                <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {expandedReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  AI Reasoning
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-xs text-muted-foreground bg-background/30 p-3 rounded-xl">
                  {result.emotions.reasoning}
                </CollapsibleContent>
              </Collapsible>
            </GlassCard>

            {/* Misinterpretation Risk */}
            <GlassCard delay={0.15}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><AlertTriangle className="w-4 h-4 text-orange-400" /></span>
                Misinterpretation Risk
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                  result.misinterpretationRisk.score > 50 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {result.misinterpretationRisk.score}%
                </span>
              </h3>
              <div className="space-y-3">
                {result.misinterpretationRisk.flaggedPhrases?.slice(0, 3).map((item, i) => (
                  <div key={i} className="bg-background/30 p-4 rounded-xl border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-medium text-sm">"{item.phrase}"</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{item.risk}% risk</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{item.reason}</p>
                    <Button size="sm" variant="outline" className="text-xs rounded-lg h-7" onClick={() => applyFix(item.phrase, item.suggestion)}>
                      <Sparkles className="w-3 h-3 mr-1" /> Auto-Fix
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Audience Personas */}
            <GlassCard className="lg:col-span-2" gradient="teal" delay={0.2}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Users className="w-4 h-4 text-secondary" /></span>
                Audience Personas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.audiencePersonas?.map((persona, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-background/30 p-4 rounded-xl border border-border/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-semibold text-sm">{persona.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        persona.dropOffRisk > 50 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {persona.dropOffRisk}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mb-3">"{persona.thought}"</p>
                    <Button size="sm" variant="outline" className="w-full text-xs rounded-lg h-7" onClick={() => toast({ title: "Rewriting for " + persona.name, description: persona.suggestion })}>
                      Apply Fix
                    </Button>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Attention Heatmap */}
            <GlassCard delay={0.25}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Target className="w-4 h-4 text-accent" /></span>
                Attention Heatmap
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.attentionHeatmap?.map((item, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${getHeatmapColor(item.strength)}`}>
                    {item.word}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/30" /> Strong</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500/30" /> Moderate</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500/30" /> Weak</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/30" /> Drop-off</span>
              </div>
            </GlassCard>

            {/* Tone Alignment */}
            <GlassCard delay={0.3}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Target className="w-4 h-4 text-primary" /></span>
                Tone Alignment
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">Intended: <span className="text-foreground font-medium">{result.toneAlignment.intended}</span></p>
                  <p className="text-xs text-muted-foreground">Perceived: <span className="text-foreground font-medium">{result.toneAlignment.perceived}</span></p>
                </div>
                <ScoreRing score={result.toneAlignment.matchPercentage} size={70} strokeWidth={6} />
              </div>
              <div className="space-y-2">
                {result.toneAlignment.adjustments?.slice(0, 3).map((adj, i) => (
                  <div key={i} className="bg-background/30 p-3 rounded-xl flex items-center justify-between border border-border/20">
                    <span className="text-xs">"{adj.current}" → "{adj.suggested}"</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => applyFix(adj.current, adj.suggested)}>Apply</Button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Micro-Edits */}
            <GlassCard delay={0.35}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Edit3 className="w-4 h-4 text-secondary" /></span>
                Micro-Edits
              </h3>
              <div className="space-y-3">
                {result.microEdits?.slice(0, 4).map((edit, i) => (
                  <div key={i} className="bg-background/30 p-4 rounded-xl border border-border/20">
                    <p className="text-xs mb-3">
                      <span className="line-through text-red-400/80">{edit.original}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="text-emerald-400">{edit.improved}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => applyFix(edit.original, edit.improved)}>
                        <Check className="w-3 h-3 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Cringe Detector */}
            <GlassCard delay={0.4}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><Skull className="w-4 h-4 text-accent" /></span>
                Cringe Detector
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                  result.cringeDetector.score > 30 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {result.cringeDetector.score}%
                </span>
              </h3>
              <div className="space-y-2">
                {result.cringeDetector.flaggedPhrases?.slice(0, 3).map((item, i) => (
                  <div key={i} className="bg-background/30 p-3 rounded-xl flex items-center justify-between border border-border/20">
                    <span className="text-xs text-red-400">"{item.phrase}"</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => applyFix(item.phrase, item.replacement)}>Replace</Button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Engagement Predictor */}
            <GlassCard delay={0.45}>
              <h3 className="section-title mb-5">
                <span className="icon-box"><TrendingUp className="w-4 h-4 text-emerald-400" /></span>
                Engagement Predictor
              </h3>
              <div className="space-y-3">
                {[
                  { label: "❤️ Likes", value: result.engagementPrediction.likes, color: "from-red-500 to-pink-500" },
                  { label: "💬 Comments", value: result.engagementPrediction.comments, color: "from-blue-500 to-cyan-500" },
                  { label: "🔄 Shares", value: result.engagementPrediction.shares, color: "from-emerald-500 to-teal-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-background/30 rounded-xl border border-border/20">
                  <p className="text-xs text-muted-foreground">🕐 Best time to post:</p>
                  <p className="text-sm font-heading font-semibold mt-0.5">{result.engagementPrediction.bestTimeToPost}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Generate Report */}
          <Button className="w-full btn-premium text-primary-foreground py-3 rounded-xl font-semibold">
            <FileDown className="w-4 h-4 mr-2" />
            Generate & Download Report (PDF)
          </Button>
        </motion.div>
      )}
    </div>
  );
}
