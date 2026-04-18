import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { podPilotStores } from "../data/mock";
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Activity, 
  Filter, 
  Plus, 
  ChevronRight, 
  Hash, 
  Globe,
  Map as MapIcon,
  Locate,
  Loader2,
  MapPin,
  Navigation,
  Search,
  ArrowRight
} from "lucide-react";
import { LoadingState } from "./LoadingState";
import { getMapsGrounding } from "../services/gemini";
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

export function PODPilot() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapResults, setMapResults] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleMapSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await getMapsGrounding(searchQuery);
      setMapResults(result);
    } catch (error) {
      console.error("Map search failed", error);
    } finally {
      setIsSearching(false);
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
            <div className="w-8 h-[1px] bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-mono font-bold">Division: PODPilot Scaling</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tighter text-white font-display">
            POD <span className="text-white/30 italic font-serif">Pilot</span>
          </h2>
          <p className="text-white/40 mt-2 font-mono text-xs max-w-md leading-relaxed">
            Manager: <span className="text-white/60">PP_MGR</span> | Status: <span className="text-emerald-500">SCALING</span>
            <br />Autonomous print-on-demand store management and optimization engine.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-mono">
              Active Nodes
            </p>
            <p className="text-3xl font-bold text-white font-mono tracking-tighter">4</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-mono">
              Total Designs
            </p>
            <p className="text-3xl font-bold text-emerald-400 font-mono tracking-tighter">1,005</p>
          </div>
        </div>
      </motion.div>

      {/* Logistics Analysis Section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-1 glass-panel rounded-3xl p-8 border border-white/10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">Neural Logistics Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Query Location / Route</label>
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find distribution centers in Austin..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-white/10 focus:border-emerald-500/50 outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleMapSearch()}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>

            <button 
              onClick={handleMapSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
              Analyze Logistics
            </button>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="space-y-2">
              {["Austin Hubs", "West Coast Traffic", "Port Congestion"].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-mono text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  {tag}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel rounded-3xl border border-white/10 overflow-hidden relative min-h-[400px] bg-white/[0.01]">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                <LoadingState type="inline" message="Scanning global logistics nodes..." />
              </motion.div>
            ) : mapResults ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col"
              >
                <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Neural Map Output</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Grounding: Google Maps</span>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/70 leading-relaxed">{mapResults.text}</p>
                  </div>
                  
                  {mapResults.groundingChunks && mapResults.groundingChunks.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Verified Locations</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mapResults.groundingChunks.map((chunk: any, idx: number) => (
                          <a 
                            key={idx}
                            href={chunk.maps?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <MapPin size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{chunk.maps?.title || "Location Node"}</p>
                              <p className="text-[9px] font-mono text-white/30 truncate">Open in Maps</p>
                            </div>
                            <Navigation size={12} className="text-white/20 group-hover:text-emerald-400 transition-all" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/10"
              >
                <MapIcon size={64} strokeWidth={1} />
                <p className="text-xs font-mono uppercase tracking-widest">Awaiting Logistics Query</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="New Designs (Week)"
          value="124"
          trend="+15%"
          icon={Activity}
          index={0}
        />
        <MetricCard
          title="Listing Optimization"
          value="92%"
          trend="+2%"
          icon={TrendingUp}
          index={1}
        />
        <MetricCard
          title="Store Revenue Growth"
          value="24%"
          trend="+4%"
          icon={ShoppingBag}
          index={2}
        />
        <MetricCard
          title="Avg Design-to-Listing"
          value="1.2h"
          trend="-0.3h"
          icon={Users}
          index={3}
        />
      </div>

      {/* Main Table Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-white tracking-tight">Store Network</h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20">
              <Plus className="w-3.5 h-3.5" />
              New Store
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Store Hash
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Name
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Platform
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Niche
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                  Status
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono text-right">
                  Designs
                </th>
                <th className="p-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {podPilotStores.map((store) => (
                <tr
                  key={store.id}
                  className="hover:bg-white/[0.03] transition-all group cursor-pointer"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-white/20" />
                      <span className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">
                        {store.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-white tracking-tight">
                      {store.name}
                    </p>
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                        store.platform === "Etsy"
                          ? "bg-[#F1641E]/10 text-[#F1641E] border-[#F1641E]/20"
                          : "bg-[#95BF47]/10 text-[#95BF47] border-[#95BF47]/20"
                      }`}
                    >
                      {store.platform}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs text-white/60 font-medium">{store.niche}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${store.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
                      <span className={`text-xs font-bold uppercase tracking-tighter ${
                        store.status === "Active" ? "text-emerald-400" : "text-blue-400"
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-sm font-mono font-bold text-white/60">
                      {store.activeDesigns}
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-sm font-mono font-bold text-white">
                      ${store.revenue.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Showing {podPilotStores.length} active neural stores</p>
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
    </motion.div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  index
}: {
  title: string;
  value: string;
  trend: string;
  icon: any;
  index: number;
}) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
    >
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-bold">{title}</span>
        <div className="p-2 rounded-xl bg-white/5 text-white/40 border border-white/10">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <p className="text-4xl font-bold tracking-tighter font-mono text-white">
          {value}
        </p>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-bold font-mono ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend}
          </span>
          <span className="text-[8px] text-white/20 font-mono uppercase tracking-tighter">vs prev period</span>
        </div>
      </div>
      
      {/* Decorative progress bar */}
      <div className="mt-6 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
          className="h-full bg-emerald-500"
        />
      </div>
    </motion.div>
  );
}
