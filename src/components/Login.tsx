import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Terminal, LogIn, AlertCircle, Shield, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { LoadingState } from './LoadingState';

export function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-emerald/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="glass-panel rounded-[2rem] p-12 overflow-hidden relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-12 relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mb-8 neon-glow-emerald"
            >
              <Terminal size={40} className="text-neon-emerald" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h1 className="text-5xl font-display font-bold tracking-tighter mb-4 text-gradient">
                STRMFRNT <span className="text-neon-emerald">LABS</span>
              </h1>
              <div className="flex items-center justify-center gap-4 text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1"><Zap size={12} /> Agentic</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1"><Globe size={12} /> Global</span>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
          >
            {isLoading ? (
              <LoadingState type="inline" message="Authenticating..." />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-lg">Initialize System Access</span>
                <LogIn size={20} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </>
            )}
          </motion.button>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-onyx bg-white/10 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-onyx bg-neon-emerald flex items-center justify-center text-[10px] font-bold text-black">
                +2k
              </div>
            </div>
            <p className="text-white/30 text-xs font-mono">
              TRUSTED BY 2,400+ AGENTS WORLDWIDE
            </p>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-[0.5em]"
        >
          Proprietary Technology of StrmFrnt Labs © 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
