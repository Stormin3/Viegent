import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { brandForgeOrders } from "../data/mock";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  Plus, 
  ChevronRight, 
  Hash,
  Sparkles,
  Image as ImageIcon,
  Download,
  Loader2,
  Wand2,
  MessageSquare
} from "lucide-react";
import { LoadingState } from "./LoadingState";
import { FeedbackSurvey } from "./FeedbackSurvey";
import { generateImagePro } from "../services/gemini";
import { cn } from "../lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function BrandForge() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [showSurvey, setShowSurvey] = useState<{ id: string; email: string } | null>(null);
  const [activeRules, setActiveRules] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "agent_configs", "BF_DESIGN_AGENT"), (doc) => {
      if (doc.exists()) {
        setActiveRules(doc.data().dynamicRules || []);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateImagePro(prompt, imageSize);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingState type="skeleton" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-[1px] bg-blue-500" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-mono font-bold">Division: BrandForge Operations</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tighter text-white font-display">
            BRAND <span className="text-white/30 italic font-serif">Forge</span>
          </h2>
          <p className="text-white/40 mt-2 font-mono text-xs max-w-md leading-relaxed">
            Manager: <span className="text-white/60">BF_MGR</span> | Status: <span className="text-emerald-500">OPTIMAL</span>
            <br />High-throughput brand asset generation and delivery pipeline.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-mono">
              Queue Density
            </p>
            <p className="text-3xl font-bold text-white font-mono tracking-tighter">12</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-mono">
              Avg Delivery
            </p>
            <p className="text-3xl font-bold text-blue-400 font-mono tracking-tighter">36<span className="text-xs ml-1">h</span></p>
          </div>
        </div>
      </motion.div>

      {/* Creative Studio Section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">Neural Creative Studio</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Visual Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the brand asset to forge..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/50 outline-none transition-all resize-none"
              />
            </div>

            {activeRules.length > 0 && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Active Neural Optimizations</span>
                </div>
                <ul className="space-y-1">
                  {activeRules.map((rule, i) => (
                    <li key={i} className="text-[10px] text-white/40 font-mono leading-relaxed">• {rule}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {["1K", "2K", "4K"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setImageSize(size as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all",
                      imageSize === size 
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                        : "bg-white/5 border-white/10 text-white/20 hover:text-white/40"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Forge Asset
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden relative min-h-[400px] flex items-center justify-center bg-white/[0.01]">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <LoadingState type="inline" message="Forging neural pixels..." />
              </motion.div>
            ) : generatedImage ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative group"
              >
                <img 
                  src={generatedImage} 
                  alt="Generated Asset" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                    <Download size={20} />
                  </button>
                  <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                    <Plus size={20} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-white/10"
              >
                <ImageIcon size={64} strokeWidth={1} />
                <p className="text-xs font-mono uppercase tracking-widest">Awaiting Neural Input</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Table Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-white tracking-tight">Active Operations</h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">
              <Plus className="w-3.5 h-3.5" />
              Initiate Order
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Order Hash
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Entity
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Tier
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Status
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Assigned Agent
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono text-right">
                  Valuation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {brandForgeOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/[0.03] transition-all group cursor-pointer"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-white/20" />
                      <span className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">
                        {order.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-white tracking-tight">
                      {order.customer}
                    </p>
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                        order.package === "Enterprise"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : order.package === "Professional"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {order.package}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-2.5">
                      {order.status === "Delivered" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : order.status === "Review" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-tighter ${
                        order.status === "Delivered" ? "text-emerald-400" : 
                        order.status === "Review" ? "text-amber-400" : "text-blue-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                      <span className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        {order.agent}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {order.status === "Delivered" && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSurvey({ id: order.id, email: `${order.customer.toLowerCase().replace(/\s+/g, '')}@example.com` });
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-all"
                        >
                          <MessageSquare size={12} />
                          Feedback
                        </button>
                      )}
                      <p className="text-sm font-mono font-bold text-white">
                        ${order.amount}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Showing {brandForgeOrders.length} active neural tasks</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSurvey && (
          <FeedbackSurvey
            orderId={showSurvey.id}
            customerEmail={showSurvey.email}
            onClose={() => setShowSurvey(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
