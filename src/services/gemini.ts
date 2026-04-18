import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

// Lazy initialization to avoid crashing if key is missing
let aiInstance: GoogleGenAI | null = null;

export function getAI() {
  if (!aiInstance) {
    if (!API_KEY) {
      console.warn("GEMINI_API_KEY is missing. AI features may be limited.");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
}

/**
 * Check if the user has selected an API key for Pro/Veo models.
 */
export async function checkProApiKey() {
  if (typeof window !== "undefined" && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    return true;
  }
  return false;
}

/**
 * Neural Chat with Thinking Mode
 */
export async function neuralChat(message: string, history: any[] = []) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are the StrmFrnt Neural OS. You are professional, authoritative, and efficient. Use 'Thinking Mode' for complex reasoning.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    },
    history
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

/**
 * Fast Neural Response (Low Latency)
 */
export async function fastResponse(prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
  });
  return response.text;
}

/**
 * Search Grounded Intel
 */
export async function searchIntel(query: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

/**
 * Maps Grounded Intel
 */
export async function getMapsGrounding(query: string, location?: { latitude: number, longitude: number }) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: location ? {
        retrievalConfig: { latLng: location }
      } : undefined
    }
  });
  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

/**
 * Image Generation (Nano Banana Pro)
 */
export async function generateImagePro(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  await checkProApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

/**
 * Image Analysis (Multimodal)
 */
export async function analyzeImage(base64Data: string, mimeType: string, prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text;
}

/**
 * Neural Speech (TTS)
 */
export async function generateSpeech(text: string, voice: string = "Kore") {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/mp3;base64,${base64Audio}`;
  }
  return null;
}

/**
 * Audio Transcription
 */
export async function transcribeAudio(base64Data: string, mimeType: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [{ inlineData: { data: base64Data, mimeType } }]
    }
  });
  return response.text;
}
