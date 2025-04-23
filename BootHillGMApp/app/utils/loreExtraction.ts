/**
 * Lore Extraction Utilities
 * 
 * This file contains utilities for extracting lore from AI responses.
 */

import { LoreExtractionResult, LoreCategory, isValidLoreCategory } from '../types/narrative/lore.types';
import { AIResponse } from '../types/ai.types';

/**
 * Extracts lore data from an AI response.
 * 
 * @param response - The AI response to extract lore from
 * @param _existingLore - The current lore store for reference (unused but kept for API consistency)
 * @returns A promise that resolves to an extraction result
 */
export async function extractLoreFromAIResponse(
  response: AIResponse
): Promise<LoreExtractionResult> {
  // Default empty result
  const emptyResult: LoreExtractionResult = {
    newFacts: []
  };

  try {
    // If the response doesn't have a lore field, return empty result
    if (!response.lore) {
      return emptyResult;
    }

    // If lore is not an object with the expected shape, return empty result
    if (typeof response.lore !== 'object' || !response.lore.newFacts) {
      console.warn('Invalid lore data structure in AI response:', response.lore);
      return emptyResult;
    }

    // Process the lore data
    const extractedLore = response.lore;
    
    // Process new facts and ensure they have all required properties
    const processedNewFacts = extractedLore.newFacts.map((fact: {
      content: string;
      category?: string;
      importance?: number;
      confidence?: number;
      relatedFactIds?: string[];
      tags?: string[];
    }) => {
      // Validate and default category if needed
      let category = fact.category;
      if (!isValidLoreCategory(category)) {
        category = 'concept' as LoreCategory; // Default to concept for invalid categories
      }

      return {
        content: fact.content,
        category: category as LoreCategory, // Explicitly cast to LoreCategory
        importance: fact.importance || 5,
        confidence: fact.confidence || 5,
        relatedFactIds: fact.relatedFactIds || [],
        tags: fact.tags || []
      };
    });

    // Process updated facts if they exist
    const processedUpdatedFacts = extractedLore.updatedFacts?.map((fact: {
      id: string;
      content: string;
      importance?: number;
      confidence?: number;
    }) => {
      return {
        id: fact.id,
        content: fact.content,
        importance: fact.importance,
        confidence: fact.confidence
      };
    });

    return {
      newFacts: processedNewFacts,
      updatedFacts: processedUpdatedFacts
    };
  } catch (error) {
    console.error('Error extracting lore from AI response:', error);
    return emptyResult;
  }
}

/**
 * Updates the AI response generation prompt to include lore extraction.
 * This function should be called when constructing the prompt for AI.
 * 
 * @returns A string containing the lore extraction prompt extension
 */
export function buildLoreExtractionPrompt(): string {
  return `
  Additionally, extract lore information from your response in the "lore" field with this structure:
  
  "lore": {
    "newFacts": [
      {
        "category": "character|location|history|item|concept",
        "content": "Factual statement about the world",
        "importance": 1-10 (how important this fact is to the world/story),
        "confidence": 1-10 (how confident you are that this is true),
        "tags": ["tag1", "tag2"] (keywords for this fact)
      }
    ],
    "updatedFacts": [
      {
        "id": "fact-id",
        "content": "Updated factual statement",
        "importance": 1-10,
        "confidence": 1-10
      }
    ]
  }
  
  Guidelines for lore extraction:
  - Extract 1-3 key facts from your narrative response
  - Focus on objective, factual information about the world
  - Prioritize facts that may be relevant in future narrative
  - For character facts, focus on their role, relationships, and background
  - For location facts, focus on purpose, history, and notable features
  - For history facts, focus on significant events that shaped the world
  - For item facts, focus on properties, history, and cultural significance
  - For concept facts, focus on customs, laws, or abstract ideas
  - Set importance based on how central the fact is to the world/story
  - Set confidence based on how definitively the fact is established
  `;
}
