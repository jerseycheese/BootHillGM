/**
 * Item Extraction Utilities
 * 
 * Utilities for extracting and validating item data from AI responses.
 * Handles both simple string item names and complex item objects.
 * 
 * @module utils/session/itemExtractUtils
 */
import { ItemCategory } from '../../types/item.types';

/**
 * Type for complex item objects that might be in the AI response
 * AI may return items either as simple strings or as objects with
 * additional properties like category, durability, or effects.
 */
export interface AIItemResponse {
  name: string;
  category?: ItemCategory;
  [key: string]: unknown;
}

/**
 * Extracts a proper string item name from various possible structures
 * Handles both string items and complex AIItemResponse objects
 * 
 * @param item - The item data from AI response, either a string or object
 * @returns A string representing the item name
 */
export function extractItemName(item: string | AIItemResponse): string {
  if (typeof item === 'string') {
    return item;
  }
  
  if (typeof item === 'object' && item !== null) {
    return item.name;
  }
  
  return 'Unknown Item';
}

/**
 * Extracts a valid category from various possible item structures
 * Provides a default category of 'general' when none is specified
 * 
 * @param item - The item data from AI response, either a string or object
 * @returns A valid ItemCategory string
 */
export function extractItemCategory(item: string | AIItemResponse): ItemCategory {
  if (typeof item === 'string') {
    return 'general';
  }
  
  if (typeof item === 'object' && item !== null && 
      typeof item.category === 'string' && 
      ['general', 'weapon', 'consumable', 'medical'].includes(item.category)) {
    return item.category as ItemCategory;
  }
  
  return 'general';
}