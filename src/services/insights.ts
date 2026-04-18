import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getAI } from "./gemini";

export interface FeedbackAnalysis {
  themes: string[];
  sentiment_score: number;
  optimization_recommendations: {
    target: string;
    rule_update: string;
    reason: string;
  }[];
}

export async function runFeedbackAnalysis() {
  const feedbackRef = collection(db, "brand_feedback");
  const q = query(feedbackRef, where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return { message: "No pending feedback to analyze." };
  }

  const feedbacks = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  const feedbackText = feedbacks.map(f => 
    `Order: ${f.orderId}\nLogo Rating: ${f.logoRating}/5\nOverall: ${f.overallSatisfaction}/5\nComments: ${f.comments}`
  ).join("\n\n---\n\n");

  const prompt = `
    You are BF_INSIGHTS_ANALYST. Analyze the following customer feedback for BrandForge brand packs.
    
    FEEDBACK DATA:
    ${feedbackText}
    
    TASK:
    1. Extract common themes and preferences.
    2. Quantify sentiment.
    3. Provide specific prompt engineering optimization recommendations for BF_DESIGN_AGENT.
    
    OUTPUT FORMAT (JSON):
    {
      "themes": ["Theme 1", "Theme 2"],
      "sentiment_score": 1-10,
      "optimization_recommendations": [
        {
          "target": "BF_DESIGN_AGENT",
          "rule_update": "Specific instruction to add to prompt",
          "reason": "Why this is needed based on feedback"
        }
      ]
    }
  `;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json"
    }
  });

  const analysis: FeedbackAnalysis = JSON.parse(response.text);

  // Update feedback documents
  for (const feedback of feedbacks) {
    await updateDoc(doc(db, "brand_feedback", feedback.id), {
      status: "analyzed",
      analysis: analysis,
      analyzedAt: serverTimestamp()
    });
  }

  // Update BF_DESIGN_AGENT config
  const configRef = doc(db, "agent_configs", "BF_DESIGN_AGENT");
  const newRules = analysis.optimization_recommendations
    .filter(rec => rec.target === "BF_DESIGN_AGENT")
    .map(rec => rec.rule_update);

  if (newRules.length > 0) {
    await setDoc(configRef, {
      agentId: "BF_DESIGN_AGENT",
      dynamicRules: newRules,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  }

  return analysis;
}
