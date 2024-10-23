import { GoogleGenerativeAI } from "@google/generative-ai";

export const AI_CONFIG = {
  modelName: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 1.0,
    topK: 40,
    maxOutputTokens: 2048
  },
  safetySettings: [
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ]
};

export function getAIModel() {
  const apiKey = typeof window === 'undefined' ? 
    process.env.GEMINI_API_KEY : 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || '');
  return genAI.getGenerativeModel({ model: AI_CONFIG.modelName });
}
