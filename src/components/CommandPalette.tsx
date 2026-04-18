import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Command, Bot, LayoutDashboard, Briefcase, ShoppingBag, Terminal, Zap } from "lucide-react";
import { cn } from "../lib/utils";

interface CommandPaletteProps {
  onNavigate: (view: any) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: "Dashboard", label: "Go to Dashboard", icon: LayoutDashboard, category: "Navigation" },
    { id: "BrandForge", label: "Go to BrandForge", icon: Briefcase, category: "Navigation" },
    { id: "PODPilot", label: "Go to PODPilot", icon: ShoppingBag, category: "Navigation" },
    { id: "Agents", label: "Go to Agent Network", icon: Bot, category: "Navigation" },
    { id: "Terminal", label: "Open Neural Terminal", icon: Terminal, category: "System" },
    { id: "Status", label: "Check System Status", icon: Zap, category: "System" },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const executeCommand = (cmd: typeof commands[0]) => {
    if (cmd.category === "Navigation") {
      onNavigate(cmd.id);
    }
    setIsOpen(false);
    setSearch("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-void/90">
              <div className="flex items-center px-6 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-white/20 mr-4" />
                <input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-lg font-display"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                />
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Command size={10} />
                  <span>K</span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                {filteredCommands.length > 0 ? (
                  <div className="space-y-6">
                    {["Navigation", "System"].map(category => {
                      const catCmds = filteredCommands.filter(c => c.category === category);
                      if (catCmds.length === 0) return null;
                      return (
                        <div key={category}>
                          <h3 className="px-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-3">
                            {category}
                          </h3>
                          <div className="space-y-1">
                            {catCmds.map((cmd) => (
                              <button
                                key={cmd.id}
                                onClick={() => executeCommand(cmd)}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all group text-left"
                              >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-neon-emerald/10 group-hover:text-neon-emerald transition-all">
                                  <cmd.icon size={18} />
                                </div>
                                <span className="font-medium">{cmd.label}</span>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Zap size={14} className="text-neon-emerald" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-white/20 font-display italic">No neural matches found...</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                </div>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
