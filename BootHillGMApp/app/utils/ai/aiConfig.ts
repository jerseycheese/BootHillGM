import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuration for the AI model, including safety settings set to BLOCK_NONE
const AI_CONFIG = {
  modelName: "gemini-2.0-flash-lite",
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

// Function to get the AI model with configured safety and generation settings
export function getAIModel() {
  const apiKey = typeof window === 'undefined' ? process.env.GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || '');
  return genAI.getGenerativeModel({ model: AI_CONFIG.modelName });
}