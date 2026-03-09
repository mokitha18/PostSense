import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import PostAnalyzer from "./pages/PostAnalyzer";
import ScriptAnalyzer from "./pages/ScriptAnalyzer";
import BlogAnalyzer from "./pages/BlogAnalyzer";
import RepurposeEngine from "./pages/RepurposeEngine";
import ViralPredictor from "./pages/ViralPredictor";
import History from "./pages/History";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<PostAnalyzer />} />
            <Route path="/script" element={<ScriptAnalyzer />} />
            <Route path="/blog" element={<BlogAnalyzer />} />
            <Route path="/repurpose" element={<RepurposeEngine />} />
            <Route path="/viral" element={<ViralPredictor />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
