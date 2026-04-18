import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Search, 
  MapPin, 
  Zap, 
  Brain, 
  Volume2, 
  Terminal as TerminalIcon,
  X,
  Loader2,
  Globe,
  Navigation
} from "lucide-react";
import Markdown from "react-markdown";
import { neuralChat, searchIntel, getMapsGrounding, analyzeImage, generateSpeech } from "../services/gemini";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "search" | "maps";
  metadata?: any;
}

export function NeuralTerminal() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Neural Terminal initialized. System status: Optimal. How can I assist your operations today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "search" | "maps">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !isLoading) return;

    const userMsg: Message = { role: "user", content: input, type: mode === "chat" ? "text" : mode };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      if (mode === "search") {
        const result = await searchIntel(input);
        response = { content: result.text, metadata: result.sources };
      } else if (mode === "maps") {
        const result = await getMapsGrounding(input);
        response = { content: result.text, metadata: result.groundingChunks };
      } else {
        const result = await neuralChat(input, messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })));
        response = { content: result };
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.content, 
        type: mode === "chat" ? "text" : mode,
        metadata: response.metadata
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Neural link interrupted. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      const userMsg: Message = { role: "user", content: "Analyzing image...", type: "image" };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const analysis = await analyzeImage(base64, file.type, "Analyze this image in the context of StrmFrnt Labs operations.");
        setMessages(prev => [...prev, { role: "assistant", content: analysis }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Image analysis failed." }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const playTTS = async (text: string) => {
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error("TTS failed", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-void/50 backdrop-blur-xl relative overflow-hidden">
      {/* Terminal Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-emerald/10 rounded-lg text-neon-emerald">
            <TerminalIcon size={18} />
          </div>
          <h2 className="text-sm font-display font-bold uppercase tracking-widest">Neural Terminal</h2>
          <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Link Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMode("chat")}
            className={cn(
              "p-2 rounded-lg transition-all",
              mode === "chat" ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
            )}
            title="Neural Chat"
          >
            <Brain size={18} />
          </button>
          <button 
            onClick={() => setMode("search")}
            className={cn(
              "p-2 rounded-lg transition-all",
              mode === "search" ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
            )}
            title="Search Grounding"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={() => setMode("maps")}
            className={cn(
              "p-2 rounded-lg transition-all",
              mode === "maps" ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
            )}
            title="Maps Grounding"
          >
            <MapPin size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-6 max-w-4xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10",
                msg.role === "assistant" ? "bg-neon-emerald/10 text-neon-emerald" : "bg-white/5 text-white/40"
              )}>
                {msg.role === "assistant" ? <Brain size={20} /> : <Zap size={20} />}
              </div>

              <div className={cn(
                "flex flex-col gap-2",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-6 rounded-3xl text-sm leading-relaxed relative group",
                  msg.role === "assistant" 
                    ? "bg-white/[0.03] border border-white/5 text-white/80" 
                    : "bg-neon-emerald/10 border border-neon-emerald/20 text-white"
                )}>
                  {msg.role === "assistant" && (
                    <button 
                      onClick={() => playTTS(msg.content)}
                      className="absolute -right-12 top-0 p-2 text-white/20 hover:text-neon-emerald transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>

                  {msg.metadata && msg.metadata.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Grounded Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.metadata.map((source: any, idx: number) => (
                          <a 
                            key={idx}
                            href={source.web?.uri || source.maps?.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] text-white/40 transition-all flex items-center gap-2"
                          >
                            {source.web ? <Globe size={10} /> : <Navigation size={10} />}
                            {source.web?.title || source.maps?.title || "Source"}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  {msg.role === "assistant" ? "Neural OS" : "Operator"}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-6 mr-auto"
          >
            <div className="w-10 h-10 rounded-2xl bg-neon-emerald/10 text-neon-emerald flex items-center justify-center border border-white/10">
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-neon-emerald rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-neon-emerald rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-neon-emerald rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto relative">
          <div className="glass-panel rounded-2xl border border-white/10 p-2 flex items-center gap-2 focus-within:border-neon-emerald/50 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                mode === "chat" ? "Ask the Neural OS..." :
                mode === "search" ? "Search global intelligence..." :
                "Find location-based data..."
              }
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-sm font-display py-2"
            />

            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "p-3 rounded-xl transition-all",
                isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "text-white/20 hover:text-white hover:bg-white/5"
              )}
            >
              <Mic size={20} />
            </button>

            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-neon-emerald text-black rounded-xl hover:bg-neon-emerald/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <span className="w-1 h-1 bg-neon-emerald rounded-full" />
                Mode: {mode}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <span className="w-1 h-1 bg-neon-emerald rounded-full" />
                Model: {mode === "chat" ? "Gemini 3.1 Pro" : "Gemini 3 Flash"}
              </div>
            </div>
            <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
              Neural Link v2.4.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
