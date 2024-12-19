import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIConfig, AIResponse, PromptOptions } from './types';
import { parseAIResponse } from './responseParser';
import { buildGamePrompt } from './promptBuilder';
import { retryWithExponentialBackoff } from '../../utils/retry';

export class AIService {
  private model: GoogleGenerativeAI;
  private config: AIConfig;
  private lastAction?: string;

  constructor(apiKey: string, config?: Partial<AIConfig>) {
    this.model = new GoogleGenerativeAI(apiKey);
    this.config = {
      modelName: "gemini-2.0-flash-exp",
      maxRetries: 3,
      temperature: 0.7,
      ...config
    };
  }

  async getResponse(
    action: string, 
    context: string, 
    options?: PromptOptions
  ): Promise<AIResponse> {
    try {
      this.lastAction = action;
      const prompt = buildGamePrompt(action, context, options?.inventory || []);
      const genModel = this.model.getGenerativeModel({ 
        model: this.config.modelName,
        generationConfig: {
          temperature: this.config.temperature
        }
      });

      const result = await retryWithExponentialBackoff(
        async () => genModel.generateContent(prompt),
        this.config.maxRetries
      );
      
      const response = await result.response;
      const text = response.text();
      
      return parseAIResponse(text);
    } catch (error) {
      console.error('AIService error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Unexpected AI response error'
      );
    }
  }

  async generateNarrativeSummary(
    action: string,
    context: string
  ): Promise<string> {
    try {
      const prompt = `
        Create a very brief (1 sentence) journal-style summary of this player action:
        Action: ${action}
        Context: ${context}
        Respond with ONLY the summary sentence.
      `;

      const result = await this.getResponse(prompt, '', {});
      return result.narrative.trim();
    } catch (error) {
      console.error('Error generating narrative summary:', error);
      return `${context} ${action}.`;
    }
  }

  async retryLastAction(): Promise<AIResponse | null> {
    if (!this.lastAction) {
      return null;
    }
    return this.getResponse(this.lastAction, '', {});
  }
}
