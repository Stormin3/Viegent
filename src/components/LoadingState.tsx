import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Cpu, Activity, Shield } from 'lucide-react';

interface LoadingProps {
  message?: string;
  type?: 'full' | 'inline' | 'skeleton';
}

export function LoadingState({ message = 'Initializing Neural Link...', type = 'full' }: LoadingProps) {
  if (type === 'skeleton') {
    return (
      <div className="w-full h-full animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded-lg w-1/3" />
        <div className="h-32 bg-white/5 rounded-2xl w-full" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className="flex items-center gap-3 font-mono text-xs text-neon-emerald">
        <div className="relative w-4 h-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-neon-emerald/20 border-t-neon-emerald rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-1 bg-neon-emerald rounded-full"
          />
        </div>
        <span className="uppercase tracking-widest animate-pulse">{message}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-void z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
      <div className="relative flex flex-col items-center">
        {/* Central Core */}
        <div className="relative w-32 h-32 mb-12">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 border border-neon-emerald/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-dashed border-neon-cyan/30 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center neon-glow-emerald"
            >
              <Terminal size={32} className="text-neon-emerald" />
            </motion.div>
          </div>

          {/* Orbiting Nodes */}
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
              style={{ rotate: angle }}
            >
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon-emerald rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" 
              />
            </motion.div>
          ))}
        </div>

        {/* Text Telemetry */}
        <div className="text-center space-y-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-display font-bold tracking-tighter text-white"
          >
            {message}
          </motion.h2>
          
          <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-neon-emerald" />
              <span>Auth Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-neon-cyan" />
              <span>Neural Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-neon-amber" />
              <span>Uplink Active</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mt-8 mx-auto">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-neon-emerald to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Decorative Corner Telemetry */}
      <div className="absolute bottom-12 left-12 font-mono text-[10px] text-white/10 space-y-1">
        <p>SYS_LOAD: 0.42ms</p>
        <p>NET_LATENCY: 12ms</p>
        <p>ENCRYPTION: AES-256</p>
      </div>
      <div className="absolute bottom-12 right-12 font-mono text-[10px] text-white/10 text-right space-y-1">
        <p>STRMFRNT_OS_v2.4.0</p>
        <p>NODE_ID: SF-9921-X</p>
        <p>STATUS: INITIALIZING</p>
      </div>
    </div>
  );
}
