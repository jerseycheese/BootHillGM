// This file extends the global namespace for TypeScript to recognize your test globals

export {};

declare global {
  function getAIResponse(
    prompt: string, 
    journalContext: string, 
    inventory: unknown[], 
    storyProgressionContext?: string, 
    narrativeContext?: unknown
  ): Promise<{
    narrative: string;
    location?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
}
