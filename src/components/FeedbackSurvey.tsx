import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, X, MessageSquare, CheckCircle2 } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "../lib/utils";

interface FeedbackSurveyProps {
  orderId: string;
  customerEmail: string;
  onClose: () => void;
}

export function FeedbackSurvey({ orderId, customerEmail, onClose }: FeedbackSurveyProps) {
  const [logoRating, setLogoRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logoRating === 0 || overallRating === 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "brand_feedback"), {
        orderId,
        customerEmail,
        logoRating,
        overallSatisfaction: overallRating,
        comments,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0A0A0B] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Brand Experience Survey</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Order: {orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">Feedback Received</h4>
                <p className="text-white/40 text-sm max-w-[280px]">
                  Your insights have been queued for neural analysis to optimize our design engine.
                </p>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">
                    How would you rate the logo design?
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setLogoRating(star)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all duration-300",
                          logoRating >= star
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "bg-white/5 border-white/10 text-white/20 hover:border-white/20"
                        )}
                      >
                        <Star
                          size={24}
                          fill={logoRating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">
                    Overall satisfaction with the Brand Pack?
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all duration-300",
                          overallRating >= star
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "bg-white/5 border-white/10 text-white/20 hover:border-white/20"
                        )}
                      >
                        <Star
                          size={24}
                          fill={overallRating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    Any specific feedback or themes?
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us what you loved or what could be improved..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || logoRating === 0 || overallRating === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Send size={18} />
                    </motion.div>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
