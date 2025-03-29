/**
 * Decision Generation Constants
 * 
 * This file defines constants used throughout the decision generation process,
 * including relationship descriptors, context limits, and configuration values.
 * Centralizing these constants ensures consistency across the decision service.
 */

/**
 * Relationship descriptor constants for consistent terminology
 * 
 * These constants provide standardized descriptors for character relationships
 * to ensure consistent language is used when describing relationships in
 * decisions and narrative context.
 */
export const RELATIONSHIP_DESCRIPTORS = {
  /** For relationships with very high positive impact (>50) */
  VERY_FRIENDLY: 'very friendly',
  
  /** For relationships with high positive impact (>20) */
  FRIENDLY: 'friendly',
  
  /** For relationships with mild positive impact (>10) */
  SLIGHTLY_FRIENDLY: 'slightly friendly',
  
  /** For relationships with minimal impact (between -10 and 10) */
  NEUTRAL: 'neutral',
  
  /** For relationships with mild negative impact (<-10) */
  SLIGHTLY_UNFRIENDLY: 'slightly unfriendly',
  
  /** For relationships with high negative impact (<-20) */
  UNFRIENDLY: 'unfriendly',
  
  /** For relationships with very high negative impact (<-50) */
  VERY_UNFRIENDLY: 'very unfriendly'
};

/**
 * Context extraction configuration limits
 * 
 * These constants define the limits for how much context information to
 * include when building decision prompts. Properly limiting context ensures
 * that prompts remain focused and relevant while still providing sufficient
 * information for quality decision generation.
 */
export const CONTEXT_LIMITS = {
  /** Maximum number of narrative history entries to include in context */
  MAX_HISTORY_ENTRIES: 8,
  
  /** Maximum number of previous decisions to include in context */
  MAX_DECISION_HISTORY: 3,
  
  /** Maximum number of important events to include in context */
  MAX_IMPORTANT_EVENTS: 3
};