import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dashboard } from "./components/Dashboard";
import { BrandForge } from "./components/BrandForge";
import { PODPilot } from "./components/PODPilot";
import { Agents } from "./components/Agents";
import { NeuralTerminal } from "./components/NeuralTerminal";
import { Sidebar } from "./components/Sidebar";
import { CommandPalette } from "./components/CommandPalette";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";

type View = "Dashboard" | "BrandForge" | "PODPilot" | "Agents" | "Terminal";

function DashboardApp() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<View>("Dashboard");

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-void text-white font-sans flex overflow-hidden selection:bg-neon-emerald/30">
      <CommandPalette onNavigate={(view) => setCurrentView(view as View)} />
      
      <Sidebar 
        currentView={currentView.toLowerCase()} 
        setCurrentView={(view) => setCurrentView(view.charAt(0).toUpperCase() + view.slice(1) as View)} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-neon-emerald/[0.02] blur-[150px] rounded-full pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {currentView === "Dashboard" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Dashboard />
              </div>
            )}

            {currentView === "BrandForge" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <BrandForge />
              </div>
            )}

            {currentView === "PODPilot" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <PODPilot />
              </div>
            )}

            {currentView === "Agents" && (
              <div className="flex-1 overflow-hidden">
                <Agents />
              </div>
            )}

            {currentView === "Terminal" && (
              <div className="flex-1 overflow-hidden">
                <NeuralTerminal />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
