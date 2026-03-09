import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Repeat, Copy, Clock, Instagram, Linkedin, Twitter, Youtube, Facebook, Check } from "lucide-react";
import { awsLambda } from "@/integrations/aws/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface RepurposedContent {
  instagram: { caption: string; hashtags: string[]; bestTime: string; hook: string };
  linkedin: { post: string; bestTime: string; hook: string };
  twitter: { thread: string[]; bestTime: string };
  youtube: { shortScript: string; title: string; description: string; bestTime: string };
  facebook: { post: string; bestTime: string; engagementQuestion: string };
}

export default function RepurposeEngine() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RepurposedContent | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleRepurpose = async () => {
    if (!content.trim()) { toast({ title: "Please enter your content", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await awsLambda.functions.invoke("repurpose-content", { body: { content, originalPlatform: platform } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data.repurposed);
      toast({ title: "Content repurposed! 🚀" });
    } catch (err: any) { toast({ title: "Repurposing failed", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copyText = (text: string, label: string) => { navigator.clipboard.writeText(text); toast({ title: `${label} copied! 📋` }); };
  const copyAll = () => {
    if (!result) return;
    const all = `--- INSTAGRAM ---\n${result.instagram.caption}\n\nHashtags: ${result.instagram.hashtags.join(" ")}\n\n--- LINKEDIN ---\n${result.linkedin.post}\n\n--- TWITTER THREAD ---\n${result.twitter.thread.map((t, i) => `${i + 1}/ ${t}`).join("\n\n")}\n\n--- YOUTUBE SHORT ---\n${result.youtube.shortScript}\n\n--- FACEBOOK ---\n${result.facebook.post}`;
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    toast({ title: "All content copied! 📋" });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const platformCards = result ? [
    {
      key: "instagram", icon: <Instagram className="w-5 h-5" />, color: "text-pink-400",
      borderColor: "border-pink-500/15", bgGradient: "from-pink-500/10 to-rose-500/5",
      title: "Instagram", content: result.instagram.caption,
      extra: (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1">
            {result.instagram.hashtags?.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] text-pink-300 border-pink-500/20 bg-pink-500/5">#{tag.replace('#', '')}</Badge>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {result.instagram.bestTime}</p>
        </div>
      ),
    },
    {
      key: "linkedin", icon: <Linkedin className="w-5 h-5" />, color: "text-blue-400",
      borderColor: "border-blue-500/15", bgGradient: "from-blue-500/10 to-cyan-500/5",
      title: "LinkedIn", content: result.linkedin.post,
      extra: <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2"><Clock className="w-3 h-3" /> {result.linkedin.bestTime}</p>,
    },
    {
      key: "twitter", icon: <Twitter className="w-5 h-5" />, color: "text-sky-400",
      borderColor: "border-sky-500/15", bgGradient: "from-sky-500/10 to-blue-500/5",
      title: "Twitter/X Thread", content: null,
      extra: (
        <div className="space-y-2 mt-2">
          {result.twitter.thread?.map((tweet, i) => (
            <div key={i} className="bg-background/30 rounded-xl p-3 flex justify-between items-start gap-2 border border-border/10">
              <p className="text-xs"><span className="text-sky-400 font-bold">{i + 1}/</span> {tweet}</p>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => copyText(tweet, `Tweet ${i + 1}`)}><Copy className="w-3 h-3" /></Button>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {result.twitter.bestTime}</p>
        </div>
      ),
    },
    {
      key: "youtube", icon: <Youtube className="w-5 h-5" />, color: "text-red-400",
      borderColor: "border-red-500/15", bgGradient: "from-red-500/10 to-orange-500/5",
      title: "YouTube Short", content: result.youtube.shortScript,
      extra: (
        <div className="mt-2 space-y-1">
          <p className="text-[10px] text-muted-foreground">Title: <span className="text-foreground font-medium">{result.youtube.title}</span></p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {result.youtube.bestTime}</p>
        </div>
      ),
    },
    {
      key: "facebook", icon: <Facebook className="w-5 h-5" />, color: "text-blue-500",
      borderColor: "border-blue-600/15", bgGradient: "from-blue-600/10 to-indigo-500/5",
      title: "Facebook", content: result.facebook.post,
      extra: (
        <div className="mt-2">
          <p className="text-[10px] text-muted-foreground">Engagement Q: <span className="text-foreground italic">{result.facebook.engagementQuestion}</span></p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {result.facebook.bestTime}</p>
        </div>
      ),
    },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <motion.h1 className="text-4xl font-heading font-bold gradient-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Repurpose Engine
        </motion.h1>
        <p className="text-muted-foreground mt-3 text-sm">Transform one piece of content into 5 platform-optimized versions</p>
      </div>

      <GlassCard gradient="purple">
        <div className="space-y-5">
          <Textarea placeholder="Paste your original content here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[160px] bg-background/30 border-border/30 resize-y backdrop-blur-sm" />
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Original Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-background/30 border-border/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRepurpose} disabled={loading} className="btn-premium text-primary-foreground px-8 rounded-xl font-semibold">
              {loading ? "Repurposing..." : "Repurpose Content"} <Repeat className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex justify-end">
              <Button onClick={copyAll} variant="outline" className="gap-2 rounded-xl text-xs">
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? "Copied!" : "Copy All Content"}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {platformCards.map((card, idx) => (
                <motion.div key={card.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                  <GlassCard className={`border ${card.borderColor} h-full`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${card.bgGradient}`}>
                          <span className={card.color}>{card.icon}</span>
                        </div>
                        <h3 className="font-heading font-semibold text-sm">{card.title}</h3>
                      </div>
                      {card.content && (
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(card.content!, card.title)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    {card.content && (
                      <div className={`bg-gradient-to-br ${card.bgGradient} rounded-xl p-4 border border-border/10`}>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{card.content}</p>
                      </div>
                    )}
                    {card.extra}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
