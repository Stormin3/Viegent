import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  metrics,
  revenueData,
  brandForgeOrders,
  podPilotStores,
} from "../data/mock";
import { DollarSign, Activity, AlertCircle, Cpu, ArrowUpRight, Zap } from "lucide-react";
import { LoadingState } from "./LoadingState";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-mono font-bold">System Status: Optimal</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tighter text-white font-display">
            EXECUTIVE <span className="text-white/30 italic font-serif">Overview</span>
          </h2>
          <p className="text-white/40 mt-2 font-mono text-xs max-w-md leading-relaxed">
            Real-time neural telemetry from distributed agent networks. 
            All autonomous systems reporting nominal performance parameters.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono mb-1">Network Latency</span>
            <span className="text-xl font-mono text-white">12<span className="text-xs text-white/40 ml-1">ms</span></span>
          </div>
          <div className="h-12 w-[1px] bg-white/10" />
          <div className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono">Live Feed</span>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total MRR"
          value={`$${metrics.mrr.toLocaleString()}`}
          trend="+12.5%"
          icon={DollarSign}
          index={0}
        />
        <MetricCard
          title="Active Orders"
          value={metrics.activeOrders.toString()}
          trend="+5"
          icon={Activity}
          index={1}
        />
        <MetricCard
          title="Agent Uptime"
          value={`${metrics.agentUptime}%`}
          trend="Stable"
          icon={Cpu}
          index={2}
        />
        <MetricCard
          title="Escalations"
          value={metrics.escalations.toString()}
          trend="-2"
          icon={AlertCircle}
          alert={metrics.escalations > 0}
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-32 h-32 text-emerald-500" />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Financial Trajectory</h3>
              <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-widest">Revenue Growth (Trailing 6 Months)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-[10px] uppercase font-mono text-white/60">BrandForge</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-mono text-white/60">PODPilot</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBrandForge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPodPilot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#ffffff10"
                  tick={{ fill: "#ffffff40", fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff10" 
                  tick={{ fill: "#ffffff40", fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: 'JetBrains Mono'
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="brandForge"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBrandForge)"
                  name="BrandForge"
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="podPilot"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPodPilot)"
                  name="PODPilot"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sidebar Lists */}
        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Orders</h3>
              <ArrowUpRight className="w-4 h-4 text-white/30" />
            </div>
            <div className="space-y-6">
              {brandForgeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="group flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                      {order.customer}
                    </p>
                    <p className="text-[10px] text-white/30 font-mono mt-1 uppercase tracking-widest">
                      ID: {order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">
                      ${order.amount}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Top Stores</h3>
              <Activity className="w-4 h-4 text-white/30" />
            </div>
            <div className="space-y-6">
              {podPilotStores.slice(0, 3).map((store) => (
                <div
                  key={store.id}
                  className="group flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {store.name}
                    </p>
                    <p className="text-[10px] text-white/30 font-mono mt-1 uppercase tracking-widest">
                      {store.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">
                      ${store.revenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">
                      {store.activeDesigns} DESIGNS
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  alert,
  index
}: {
  title: string;
  value: string;
  trend: string;
  icon: any;
  alert?: boolean;
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
        <div
          className={`p-2 rounded-xl ${alert ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <p
          className={`text-4xl font-bold tracking-tighter font-mono ${alert ? "text-red-500" : "text-white"}`}
        >
          {value}
        </p>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-bold font-mono ${trend.startsWith('+') ? 'text-emerald-500' : trend === 'Stable' ? 'text-white/40' : 'text-red-500'}`}>
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
          className={`h-full ${alert ? 'bg-red-500' : 'bg-emerald-500'}`}
        />
      </div>
    </motion.div>
  );
}
