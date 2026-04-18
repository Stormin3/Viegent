import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { agents, Agent, Division } from "../data/agents";
import { agents as mockAgents } from "../data/mock";
import { 
  Bot, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Network, 
  Terminal, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Users, 
  CheckCircle2, 
  XCircle,
  Star,
  MessageSquare,
  Send,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  History,
  Loader2,
  Sparkles
} from "lucide-react";
import { LoadingState } from "./LoadingState";
import { cn } from "../lib/utils";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { runFeedbackAnalysis } from "../services/insights";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

const getRecentTasks = (agentId: string) => {
  const baseTasks = [
    { id: `TSK-${Math.floor(Math.random() * 10000)}`, status: 'Completed', time: '10 mins ago', desc: `Processed standard workflow request` },
    { id: `TSK-${Math.floor(Math.random() * 10000)}`, status: 'Completed', time: '1 hour ago', desc: `Executed automated sequence` },
    { id: `TSK-${Math.floor(Math.random() * 10000)}`, status: 'In Progress', time: 'Just now', desc: `Analyzing new input data` },
  ];
  
  if (agentId.includes('DESIGN')) {
    baseTasks[0].desc = 'Generated 3 logo concepts for Acme Corp';
    baseTasks[1].desc = 'Refined vector assets for Zenith Tech';
    baseTasks[2].desc = 'Rendering high-res outputs for Quantum AI';
  } else if (agentId.includes('MGR')) {
    baseTasks[0].desc = 'Approved daily production queue';
    baseTasks[1].desc = 'Re-allocated resources for high-priority order';
    baseTasks[2].desc = 'Reviewing weekly P&L metrics';
  } else if (agentId === 'QA_AGENT') {
    baseTasks[0].desc = 'Approved design assets for ORD-BF-1042';
    baseTasks[1].status = 'Failed';
    baseTasks[1].desc = 'Rejected concepts for ORD-BF-1043 (Low contrast)';
    baseTasks[2].desc = 'Reviewing brand guidelines for ORD-BF-1045';
  } else if (agentId === 'CEO_AGENT') {
    baseTasks[0].desc = 'Issued weekly division objectives';
    baseTasks[1].desc = 'Approved BrandForge budget increase';
    baseTasks[2].desc = 'Analyzing Q1 revenue projections';
  }
  
  return baseTasks;
};

type TimeRange = "Daily" | "Weekly" | "Monthly";

const getChartData = (agentId: string, range: TimeRange = "Daily") => {
  // Deterministic random based on agentId and range
  const seed = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + range.length;
  const data = [];
  
  let labels: string[] = [];
  let steps = 10;
  
  if (range === "Daily") {
    labels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    steps = 10;
  } else if (range === "Weekly") {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    steps = 7;
  } else {
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    steps = 4;
  }
  
  let currentTasks = 10 + (seed % 50);
  const multiplier = range === "Daily" ? 1 : range === "Weekly" ? 5 : 20;

  for (let i = 0; i < steps; i++) {
    const change = (Math.floor(Math.sin((seed + i) * 0.5) * 10) + 8) * multiplier;
    currentTasks = Math.max(5 * multiplier, currentTasks + change);
    data.push({
      time: labels[i],
      tasks: currentTasks
    });
  }
  return data;
};

export function Agents() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<Division | "All">("All");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<"Telemetry" | "Configuration" | "Feedback">("Telemetry");
  const [timeRange, setTimeRange] = useState<TimeRange>("Daily");
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState<string | null>(null);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);

  const handleQuickAction = async (action: string) => {
    if (action === 'Run Feedback Analysis') {
      setIsSubmitting(true);
      try {
        const result = await runFeedbackAnalysis();
        setQuickActionMessage(`Analysis Complete: ${Array.isArray(result) ? result.length : 'Success'}`);
      } catch (error) {
        console.error("Analysis failed", error);
        setQuickActionMessage("Analysis Failed");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setQuickActionMessage(`Action triggered: ${action}`);
    }
    setTimeout(() => setQuickActionMessage(null), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitFeedback = async () => {
    if (!selectedAgent || !auth.currentUser || rating === 0) return;

    setIsSubmitting(true);
    const path = 'feedback';
    try {
      await addDoc(collection(db, path), {
        uid: auth.currentUser.uid,
        agentId: selectedAgent.id,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      setFeedbackSuccess(true);
      setRating(0);
      setComment("");
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents =
    selectedDivision === "All"
      ? agents
      : agents.filter((a) => a.division === selectedDivision);

  const divisions: (Division | "All")[] = [
    "All",
    "Executive",
    "BrandForge",
    "PODPilot",
    "Shared Services",
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <LoadingState type="inline" message="Scanning Neural Fleet..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="h-20 border-b border-white/5 flex items-center px-10 glass-panel z-10 shrink-0">
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                selectedDivision === div
                  ? "bg-white text-black shadow-lg"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
            >
              {div}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Network Status</span>
            <span className="text-sm font-bold text-neon-emerald">Active: {filteredAgents.length} Nodes</span>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto p-10 custom-scrollbar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "group relative glass-card rounded-3xl p-8 cursor-pointer hover:bg-white/[0.05] transition-all flex flex-col h-full",
                  (agent.id === "QA_AGENT" || agent.id === "BF_QA_LEAD") && "border-neon-emerald/30 bg-neon-emerald/[0.02]",
                )}
              >
                {(agent.id === "QA_AGENT" || agent.id === "BF_QA_LEAD") && (
                  <div className="absolute -top-3 -right-3 bg-neon-emerald text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg neon-glow-emerald">
                    Priority
                  </div>
                )}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-neon-emerald group-hover:scale-110 transition-transform duration-500">
                    {(agent.id === "QA_AGENT" || agent.id === "BF_QA_LEAD") ? (
                      <ShieldCheck size={24} />
                    ) : (
                      <Cpu size={24} />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                      {agent.llmConfig.model}
                    </div>
                    {(() => {
                      const status = mockAgents.find(a => a.id === agent.id)?.status || 'Idle';
                      return (
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border",
                          status === 'Active' 
                            ? "bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20 shadow-[0_0_10px_rgba(16,255,145,0.1)]" 
                            : "bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                        )}>
                          {status}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <h3 className="text-xl font-display font-bold mb-2 group-hover:text-neon-emerald transition-colors">{agent.name}</h3>
                <p className="text-xs font-mono text-neon-emerald/60 uppercase tracking-widest mb-6">
                  {agent.title}
                </p>

                <p className="text-sm text-white/40 line-clamp-3 mb-8 flex-1 leading-relaxed">
                  {agent.purpose}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Manager</span>
                    <span className="text-xs font-bold text-white/60">
                      {agent.reportsTo}
                    </span>
                  </div>
                  <div className="w-8 h-8 glass-card rounded-full flex items-center justify-center text-white/20 group-hover:text-neon-emerald group-hover:bg-neon-emerald/10 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-void border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">{selectedAgent.name}</h2>
                  <p className="text-neon-emerald text-xs font-mono uppercase tracking-widest mt-1">{selectedAgent.title}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center px-8 border-b border-white/5 bg-white/[0.02]">
                {(["Telemetry", "Configuration", "Feedback"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative",
                      activeTab === tab ? "text-neon-emerald" : "text-white/40 hover:text-white"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-emerald shadow-[0_0_10px_rgba(16,255,145,0.5)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === "Telemetry" && (
                    <motion.div
                      key="telemetry"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                            Recent Telemetry
                          </h3>
                          <div className="text-[10px] font-mono text-neon-emerald uppercase tracking-widest">
                            {mockAgents.find(a => a.id === selectedAgent.id)?.tasksCompleted?.toLocaleString() || 0} Total Cycles
                          </div>
                        </div>

                        {(selectedAgent.id === "QA_AGENT" || selectedAgent.id === "BF_QA_LEAD") && (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="glass-card p-4 rounded-2xl border border-neon-emerald/30 bg-neon-emerald/[0.02] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-neon-emerald/10 blur-2xl rounded-full" />
                              <div className="text-[10px] text-neon-emerald/80 mb-1 uppercase font-mono tracking-widest">Deliverables Reviewed</div>
                              <div className="font-display text-2xl font-bold text-neon-emerald">
                                {mockAgents.find(a => a.id === selectedAgent.id)?.tasksCompleted?.toLocaleString() || 0}
                              </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border border-neon-emerald/30 bg-neon-emerald/[0.02] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-neon-emerald/10 blur-2xl rounded-full" />
                              <div className="text-[10px] text-neon-emerald/80 mb-1 uppercase font-mono tracking-widest">Approval Rate</div>
                              <div className="font-display text-2xl font-bold text-neon-emerald">
                                {selectedAgent.id === "BF_QA_LEAD" ? "98.5%" : "94.2%"}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                              Performance Velocity
                            </h4>
                            <div className="flex items-center gap-1 glass-card p-1 rounded-lg border border-white/5">
                              {(["Daily", "Weekly", "Monthly"] as TimeRange[]).map((range) => (
                                <button
                                  key={range}
                                  onClick={() => setTimeRange(range)}
                                  className={cn(
                                    "px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md transition-all",
                                    timeRange === range 
                                      ? "bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20" 
                                      : "text-white/20 hover:text-white/40"
                                  )}
                                >
                                  {range}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="glass-card p-6 rounded-2xl border border-white/5 h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getChartData(selectedAgent.id, timeRange)}>
                                <defs>
                                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10FF91" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10FF91" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                  dataKey="time" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'monospace' }}
                                  dy={10}
                                />
                                <YAxis 
                                  hide 
                                  domain={['auto', 'auto']}
                                />
                                <Tooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="glass-card p-3 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
                                          <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">{label}</div>
                                          <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neon-emerald shadow-[0_0_8px_rgba(16,255,145,0.5)]" />
                                            <div className="text-xs font-bold text-white font-mono">
                                              {payload[0].value?.toLocaleString()} <span className="text-[10px] font-normal text-white/40 ml-1">Tasks</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                  cursor={{ stroke: 'rgba(16,255,145,0.2)', strokeWidth: 2 }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="tasks" 
                                  stroke="#10FF91" 
                                  fillOpacity={1} 
                                  fill="url(#colorTasks)" 
                                  strokeWidth={2}
                                  animationDuration={1000}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {(selectedAgent.id === "QA_AGENT" || selectedAgent.id === "BF_QA_LEAD") && (
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Quick Actions</h4>
                              <AnimatePresence>
                                {quickActionMessage && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[10px] font-mono text-neon-emerald uppercase tracking-widest"
                                  >
                                    {quickActionMessage}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                              <button 
                                onClick={() => handleQuickAction('Review Brand Guidelines')}
                                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/5 hover:border-neon-emerald/30 hover:bg-neon-emerald/5 transition-all whitespace-nowrap group"
                              >
                                <motion.div
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <BookOpen size={14} className="text-white/40 group-hover:text-neon-emerald transition-colors" />
                                </motion.div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Review Brand Guidelines</span>
                              </button>
                              <button 
                                onClick={() => handleQuickAction('Check Order Details')}
                                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/5 hover:border-neon-emerald/30 hover:bg-neon-emerald/5 transition-all whitespace-nowrap group"
                              >
                                <ClipboardList size={14} className="text-white/40 group-hover:text-neon-emerald transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Check Order Details</span>
                              </button>
                              <button 
                                onClick={() => handleQuickAction('Escalate Issue')}
                                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/5 hover:border-red-400/30 hover:bg-red-400/5 transition-all whitespace-nowrap group"
                              >
                                <AlertTriangle size={14} className="text-white/40 group-hover:text-red-400 transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Escalate Issue</span>
                              </button>
                              <button 
                                onClick={() => setShowEscalationDialog(true)}
                                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all whitespace-nowrap group"
                              >
                                <AlertTriangle size={14} className="text-white/40 group-hover:text-red-500 transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Escalate to Manager</span>
                              </button>
                              <button 
                                onClick={() => handleQuickAction('View QA History')}
                                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/5 hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all whitespace-nowrap group"
                              >
                                <History size={14} className="text-white/40 group-hover:text-neon-cyan transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">View QA History</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedAgent.id === "BF_INSIGHTS_ANALYST" && (
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Insight Operations</h4>
                              <AnimatePresence>
                                {quickActionMessage && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[10px] font-mono text-neon-emerald uppercase tracking-widest"
                                  >
                                    {quickActionMessage}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleQuickAction('Run Feedback Analysis')}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-neon-emerald hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-neon-emerald/20 disabled:opacity-50"
                              >
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                Run Feedback Analysis
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                          {getRecentTasks(selectedAgent.id).map((task, i) => (
                            <div key={task.id} className={cn(
                              "p-5 flex items-start gap-4 transition-colors hover:bg-white/[0.02]",
                              i !== 0 && "border-t border-white/5"
                            )}>
                              <div className="mt-1">
                                {task.status === 'Completed' ? (
                                  <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative flex items-center justify-center w-7 h-7 rounded-full bg-neon-emerald/10 border border-neon-emerald/20 shadow-[0_0_10px_rgba(16,255,145,0.1)]"
                                  >
                                    <CheckCircle2 size={14} className="text-neon-emerald" />
                                  </motion.div>
                                ) : task.status === 'In Progress' ? (
                                  <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    >
                                      <Loader2 size={14} className="text-neon-cyan" />
                                    </motion.div>
                                  </div>
                                ) : (
                                  <motion.div 
                                    initial={{ x: 0 }}
                                    animate={{ x: [-2, 2, -2, 2, 0] }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className="relative flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                  >
                                    <AlertTriangle size={14} className="text-red-400" />
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-mono text-white/20">{task.id}</span>
                                  <span className="text-[10px] text-white/20 font-mono">{task.time}</span>
                                </div>
                                <p className="text-sm text-white/60 truncate">{task.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === "Configuration" && (
                    <motion.div
                      key="config"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      <section>
                        <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4">
                          Operational Purpose
                        </h3>
                        <p className="text-white/60 leading-relaxed text-sm">
                          {selectedAgent.purpose}
                        </p>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4">
                          Neural Configuration
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="glass-card p-4 rounded-2xl border border-white/5">
                            <div className="text-[10px] text-white/20 mb-1 uppercase font-mono">Model</div>
                            <div className="font-mono text-xs font-bold text-white">
                              {selectedAgent.llmConfig.model}
                            </div>
                          </div>
                          <div className="glass-card p-4 rounded-2xl border border-white/5">
                            <div className="text-[10px] text-white/20 mb-1 uppercase font-mono">
                              Entropy
                            </div>
                            <div className="font-mono text-xs font-bold text-white">
                              {selectedAgent.llmConfig.temperature}
                            </div>
                          </div>
                          <div className="glass-card p-4 rounded-2xl border border-white/5">
                            <div className="text-[10px] text-white/20 mb-1 uppercase font-mono">
                              Context
                            </div>
                            <div className="font-mono text-xs font-bold text-white">
                              {selectedAgent.llmConfig.maxTokens}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4">
                          Hierarchy
                        </h3>
                        <div className="flex items-center gap-4 glass-card p-4 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                            <Users size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {selectedAgent.reportsTo}
                            </div>
                            <div className="text-[10px] text-white/20 uppercase font-mono">
                              Direct Reporting Line
                            </div>
                          </div>
                        </div>
                      </section>

                      {selectedAgent.systemPrompt && (
                        <section>
                          <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4">
                            Neural Directives
                          </h3>
                          <div className="glass-card p-6 rounded-2xl border border-white/5 overflow-x-auto">
                            <pre className="text-xs font-mono text-white/40 whitespace-pre-wrap leading-relaxed">
                              {selectedAgent.systemPrompt}
                            </pre>
                          </div>
                        </section>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "Feedback" && (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <section>
                        <div className="flex items-center gap-2 mb-6">
                          <MessageSquare className="w-4 h-4 text-neon-emerald" />
                          <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                            Performance Feedback
                          </h3>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/[0.01] relative overflow-hidden">
                          {feedbackSuccess ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center justify-center py-4 text-center"
                            >
                              <div className="w-12 h-12 rounded-full bg-neon-emerald/20 flex items-center justify-center text-neon-emerald mb-4">
                                <CheckCircle2 size={24} />
                              </div>
                              <p className="text-sm font-bold text-white">Feedback Logged</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-mono">Neural weights updated</p>
                            </motion.div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Efficiency Rating</label>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setRating(star)}
                                      className="transition-all hover:scale-110"
                                    >
                                      <Star 
                                        size={24} 
                                        className={cn(
                                          "transition-colors",
                                          star <= rating ? "text-neon-emerald fill-neon-emerald shadow-neon-emerald" : "text-white/10"
                                        )} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Performance Notes</label>
                                <textarea 
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Provide operational feedback..."
                                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:border-neon-emerald/50 outline-none transition-all resize-none"
                                />
                              </div>

                              <button 
                                onClick={handleSubmitFeedback}
                                disabled={isSubmitting || rating === 0}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neon-emerald hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-neon-emerald/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Send size={14} />
                                    Submit Feedback
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Escalation Dialog */}
      <AnimatePresence>
        {showEscalationDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEscalationDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-3xl p-8 border border-red-500/30 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Confirm Escalation</h3>
                <p className="text-white/60 text-sm mb-8">
                  Are you sure you want to escalate this issue to the manager? This action will bypass standard QA workflows and notify upper management immediately.
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowEscalationDialog(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowEscalationDialog(false);
                      handleQuickAction('Issue Escalated to Manager');
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-all text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
