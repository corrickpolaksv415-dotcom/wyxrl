import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Define local interface for window extension to avoid global namespace conflicts
interface CustomWindow extends Window {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}

// Helper to ensure we have a key for premium models
export const ensureApiKey = async (): Promise<boolean> => {
  // Cast window to CustomWindow to access aistudio methods safely
  const win = window as unknown as CustomWindow;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      return true; // Assume success after modal, actual check happens on next call usually
    }
    return hasKey;
  }
  // Fallback for dev environments without the special window object
  return !!process.env.API_KEY;
};

// Chat Bot Service
export const createChatSession = async (systemInstruction?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat: Chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction || "You are a helpful assistant on a novel reading website called InkFlow. You help users find books, summarize stories, and chat about literature.",
    },
  });
  return chat;
};

// Image Generation Service
export const generateCoverImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
    // Re-instantiate to ensure we grab the latest key if selected via UI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4", // Classic book cover ratio
                    imageSize: size
                }
            }
        });

        // Parse response for image data
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Image generation failed:", error);
        throw error;
    }
};