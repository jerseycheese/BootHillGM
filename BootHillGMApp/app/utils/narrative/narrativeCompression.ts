/**
 * Narrative Compression Utility
 * 
 * Handles compression of narrative text to optimize token usage
 * while preserving essential information.
 */

// Define the missing types locally since they don't exist in the imported module
export type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

export interface NarrativeSummary {
  section: string;
  summary: string;
  originalTokens: number;
  summaryTokens: number;
  compressionRatio: number;
}

/**
 * Estimates token count based on text length
 * This is a simplified version - in production, consider using a tokenizer like tiktoken
 * 
 * @param text Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  const WORDS_PER_TOKEN = 0.75; // Approximate ratio
  const words = text.split(/\s+/).length;
  return Math.ceil(words / WORDS_PER_TOKEN);
}

/**
 * Applies low-level compression techniques
 * 
 * @param text Original text
 * @returns Lightly compressed text
 */
function applyLowCompression(text: string): string {
  return text
    // Remove filler phrases
    .replace(/\bI think\b|\bperhaps\b|\bmaybe\b|\bin my opinion\b/gi, '')
    .replace(/\bvery\b|\breally\b|\bextremely\b|\bquite\b/gi, '')
    // Simplify punctuation
    .replace(/\s+,\s+/g, ', ')
    .replace(/\s+\.\s+/g, '. ')
    .replace(/\s+\?\s+/g, '? ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Applies medium-level compression techniques
 * 
 * @param text Original text
 * @returns More aggressively compressed text
 */
function applyMediumCompression(text: string): string {
  // Start with low compression
  const compressed = applyLowCompression(text);
  
  // Replace verbose phrases with shorter equivalents
  const replacements: [RegExp, string][] = [
    [/\bin order to\b/gi, 'to'],
    [/\bat this point in time\b/gi, 'now'],
    [/\btake into consideration\b/gi, 'consider'],
    [/\bon the grounds that\b/gi, 'because'],
    [/\bin the event that\b/gi, 'if'],
    [/\bin spite of the fact that\b/gi, 'although'],
    [/\bat the present time\b/gi, 'now'],
    [/\bdue to the fact that\b/gi, 'because'],
    [/\bfor the purpose of\b/gi, 'for'],
    [/\bin the vicinity of\b/gi, 'near'],
    [/\bwith regard to\b/gi, 'about']
  ];
  
  // Apply all replacements
  let result = compressed;
  replacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  
  // Remove descriptive adjectives
  result = result
    .replace(/\b(beautiful|gorgeous|amazing|wonderful|fantastic|lovely|magnificent)\b/gi, '')
    .replace(/\b(slowly|quickly|suddenly|carefully|quietly|loudly)\b/gi, '')
    // Normalize whitespace again
    .replace(/\s+/g, ' ')
    .trim();
  
  return result;
}

/**
 * Extracts key verbs from a sentence
 * 
 * @param sentence The sentence to analyze
 * @returns Array of important verbs
 */
function extractKeyVerbs(sentence: string): string[] {
  // List of common impactful verbs in narratives
  const keyVerbPatterns = [
    /\b(killed|shot|attacked|fought|defeated|destroyed|conquered)\b/i,
    /\b(discovered|found|revealed|uncovered|learned|realized)\b/i,
    /\b(escaped|fled|ran|hid|evaded|avoided)\b/i,
    /\b(said|told|asked|replied|shouted|whispered|demanded)\b/i,
    /\b(took|grabbed|stole|acquired|obtained|received)\b/i,
    /\b(gave|offered|provided|delivered|handed)\b/i,
    /\b(went|traveled|rode|walked|entered|left|arrived)\b/i,
    /\b(decided|chose|picked|selected|determined)\b/i
  ];
  
  const verbs: string[] = [];
  
  // Extract verbs matching our patterns
  keyVerbPatterns.forEach(pattern => {
    const match = sentence.match(pattern);
    if (match) {
      verbs.push(match[0]);
    }
  });
  
  return verbs;
}

/**
 * Extracts important objects from a sentence
 * 
 * @param sentence The sentence to analyze
 * @returns Array of important objects
 */
function extractImportantObjects(sentence: string): string[] {
  // List of common important objects in Western narratives
  const keyObjectPatterns = [
    /\b(gun|rifle|revolver|pistol|firearm|weapon|knife|blade)\b/i,
    /\b(gold|money|cash|dollars|coin|treasure|loot)\b/i,
    /\b(horse|steed|mare|stallion|pony|mount)\b/i,
    /\b(sheriff|deputy|marshal|lawman|badge|star)\b/i,
    /\b(bandit|outlaw|criminal|gunslinger|desperado)\b/i,
    /\b(saloon|bank|jail|prison|cell|town|ranch|farm)\b/i,
    /\b(map|letter|document|note|message|telegram)\b/i,
    /\b(whiskey|bourbon|drink|bottle|shot|glass)\b/i
  ];
  
  const objects: string[] = [];
  
  // Extract objects matching our patterns
  keyObjectPatterns.forEach(pattern => {
    const match = sentence.match(pattern);
    if (match) {
      objects.push(match[0]);
    }
  });
  
  return objects;
}

/**
 * Applies high-level compression techniques
 * 
 * @param text Original text
 * @returns Highly compressed text focused on essential information
 */
function applyHighCompression(text: string): string {
  // Start with medium compression
  const compressed = applyMediumCompression(text);
  
  // Process sentence by sentence for high compression
  const sentences = compressed.split(/(?<=[.!?])\s+/);
  
  return sentences.map(sentence => {
    // Keep short sentences as is
    if (sentence.split(/\s+/).length <= 8) {
      return sentence;
    }
    
    // Extract only the most important elements
    
    // Identify named entities (usually capitalized)
    const entities = (sentence.match(/\b[A-Z][a-z]+\b/g) || []);
    
    // Extract key actions (verbs)
    const verbs = extractKeyVerbs(sentence); // Now defined before call
    
    // Extract important objects
    const objects = extractImportantObjects(sentence); // Now defined before call
    
    // Combine the essential elements
    const keyElements = [...entities, ...verbs, ...objects];
    
    // If we have enough key elements, use them to reconstruct the sentence
    // Otherwise, keep the original but remove articles and some prepositions
    if (keyElements.length >= 4) {
      return keyElements.join(' ');
    } else {
      return sentence
        .replace(/\b(a|an|the)\b/gi, '')
        .replace(/\b(of|for|with|by|at|from|to|in|on|under|over)\b/gi, '');
    }
  }).join('. ');
}

/**
 * Extracts complete sentences from potentially partial text
 * 
 * @param text Text that may be cut mid-sentence
 * @returns Text adjusted to complete sentences
 */
function extractCompleteSentences(text: string): string {
  // If empty text, return empty string
  if (!text.trim()) {
    return '';
  }
  
  // If text ends with sentence-ending punctuation, return as-is
  if (/[.!?]$/.test(text.trim())) {
    return text;
  }
  
  // Find the last sentence boundary
  const lastSentenceBoundary = text.lastIndexOf('.');
  if (lastSentenceBoundary === -1) {
    // No sentence boundary found, return as-is
    return text;
  }
  
  // Return text up to and including the last sentence boundary
  return text.substring(0, lastSentenceBoundary + 1);
}

/**
 * Extracts named entities from text
 * 
 * @param text Source text
 * @returns Array of entity names
 */
function extractEntities(text: string): string[] {
  // Simple regex for detecting capitalized names
  const entityMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  // Filter out common non-entity capitalized words
  const nonEntityWords = ['I', 'The', 'A', 'An', 'This', 'That', 'These', 'Those'];
  const entities = entityMatches.filter(entity => !nonEntityWords.includes(entity));
  
  // Deduplicate
  return [...new Set(entities)];
}

/**
 * Scores a sentence for event significance
 * 
 * @param sentence The sentence to score
 * @returns Significance score (higher = more significant)
 */
function scoreSentenceEventSignificance(sentence: string): number {
  let score = 0;
  
  // Action verbs indicate events
  if (/\b(killed|shot|attacked|fought|discovered|found|escaped|fled|took|stole)\b/i.test(sentence)) {
    score += 3;
  }
  
  // Speech acts can indicate important dialogue
  if (/\b(said|told|asked|replied|shouted|demanded|ordered|promised)\b/i.test(sentence)) {
    score += 2;
  }
  
  // Emotional content often indicates significant events
  if (/\b(angry|scared|terrified|happy|excited|worried|concerned|relieved)\b/i.test(sentence)) {
    score += 2;
  }
  
  // Sentences containing named entities are often more significant
  const entityCount = (sentence.match(/\b[A-Z][a-z]+\b/g) || []).length;
  score += Math.min(entityCount, 3);
  
  // Longer sentences often contain more information
  const wordCount = sentence.split(/\s+/).length;
  score += Math.min(wordCount / 5, 2);
  
  return score;
}

/**
 * Extracts key events from text
 * 
 * @param text Source text
 * @returns Array of key event descriptions
 */
function extractKeyEvents(text: string): string[] {
  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Score sentences for event significance
  const scoredSentences = sentences.map(sentence => ({
    sentence,
    score: scoreSentenceEventSignificance(sentence) // Now defined before call
  }));
  
  // Take the top 3 most significant event sentences
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.sentence);
}

/**
 * Compresses a narrative text to reduce token count while preserving meaning
 * 
 * @param text The original narrative text
 * @param level Compression level to apply
 * @returns Compressed text with reduced token count
 */
export function compressNarrativeText(text: string, level: CompressionLevel = 'medium'): string {
  switch (level) {
    case 'none':
      // No compression
      return text;
    case 'low':
      // Light compression - remove redundancies and filler words
      return applyLowCompression(text); // Now defined before call
    case 'medium':
      // Medium compression - more aggressive, focus on key information
      return applyMediumCompression(text); // Now defined before call
    case 'high':
      // High compression - extract only essential elements
      return applyHighCompression(text); // Now defined before call
    default:
      return text;
  }
}

/**
 * Divides a long narrative into sections and creates summaries
 * 
 * @param text Long narrative text
 * @param sectionCount Number of sections to divide into
 * @returns Array of section summaries
 */
export function createNarrativeSummaries(text: string, sectionCount: number = 3): NarrativeSummary[] {
  // Divide text into roughly equal sections
  const textLength = text.length;
  const sectionLength = Math.floor(textLength / sectionCount);
  
  const summaries: NarrativeSummary[] = [];
  
  for (let i = 0; i < sectionCount; i++) {
    const start = i * sectionLength;
    // For the last section, include any remaining text
    const end = (i === sectionCount - 1) ? textLength : (i + 1) * sectionLength;
    
    // Find sentence boundaries to avoid cutting mid-sentence
    const sectionText = extractCompleteSentences(text.substring(start, end)); // Now defined before call
    const originalTokens = estimateTokenCount(sectionText); // Now defined before call
    
    // Apply high compression to create summary
    const summary = applyHighCompression(sectionText); // Now defined before call
    const summaryTokens = estimateTokenCount(summary); // Now defined before call
    
    summaries.push({
      section: sectionText,
      summary,
      originalTokens,
      summaryTokens,
      compressionRatio: originalTokens > 0 ? 1 - (summaryTokens / originalTokens) : 0
    });
  }
  
  return summaries;
}

/**
 * Creates a very concise summary of a narrative text
 * 
 * @param text Original text
 * @param maxLength Maximum length for the summary
 * @returns Concise summary
 */
export function createConciseSummary(text: string, maxLength: number = 100): string {
  
  // Extract key entities and events
  const entities = extractEntities(text); // Now defined before call
  const keyEvents = extractKeyEvents(text); // Now defined before call
  
  // Combine key elements
  let summary = `${entities.join(', ')}. ${keyEvents.join('. ')}`;
  
  // Truncate if needed
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}
