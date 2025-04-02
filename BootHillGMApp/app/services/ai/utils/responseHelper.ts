import { GenerateContentResult, GenerativeModel } from '@google/generative-ai';
import { retryWithExponentialBackoff } from '../../../utils/retry';

/**
 * Creates a promise that rejects after the specified timeout
 * 
 * @param ms Timeout in milliseconds
 * @returns A promise that rejects after the specified timeout
 */
export function timeoutPromise(ms: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`[AI Service] Operation timed out after ${ms}ms`)), ms);
  });
}

/**
 * Race between a fetch operation and a timeout
 * 
 * @param model The AI model to use
 * @param prompt The prompt to send to the model
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that resolves to the model response or rejects with a timeout error
 */
export async function fetchWithTimeout(
  model: GenerativeModel,
  prompt: string, 
  timeoutMs: number
): Promise<GenerateContentResult> {
  return Promise.race([
    retryWithExponentialBackoff<GenerateContentResult>(() => model.generateContent(prompt)),
    timeoutPromise(timeoutMs)
  ]);
}

/**
 * Clean AI response text by removing markdown code block delimiters
 * 
 * @param text The raw text from the AI response
 * @returns Cleaned text ready for JSON parsing
 */
export function cleanResponseText(text: string): string {
  // Remove any markdown code block delimiters (```json, ```) more robustly
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^\s*```(?:json)?\s*\n?([\s\S]*?)\n?\s*```\s*$/gim, '$1');
  return cleaned.trim(); // Remove any extra whitespace
}
