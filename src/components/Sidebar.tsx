import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  Bot,
  Settings,
  LogOut,
  Cpu,
  Zap,
  Menu,
  X,
  Terminal as TerminalIcon
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "brandforge", label: "BrandForge", icon: Briefcase },
    { id: "podpilot", label: "PODPilot", icon: ShoppingBag },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "terminal", label: "Neural Terminal", icon: TerminalIcon },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter font-display">
            STRMFRNT<span className="text-emerald-500">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] font-bold">
            Neural OS v2.4.0
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2 mt-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-mono font-bold px-4 mb-4">Core Modules</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-white/10 text-white shadow-xl shadow-black/20"
                  : "text-white/40 hover:bg-white/[0.03] hover:text-white",
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full"
                />
              )}
              <div className="flex items-center space-x-4 relative z-10">
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-emerald-400" : "text-white/20 group-hover:text-white/60"
                )} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {isActive && (
                <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold text-white/30 hover:bg-white/[0.03] hover:text-white group">
          <Settings className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
          <span>Settings</span>
        </button>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold text-white/30 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut className="w-5 h-5 text-white/10 group-hover:text-red-400/40 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
      
      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-[60] w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white shadow-2xl"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-black/40 backdrop-blur-3xl border-r border-white/10 h-screen flex-col text-white relative z-50 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-void border-r border-white/10 z-[60] flex flex-col text-white lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
