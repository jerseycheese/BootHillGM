/**
 * Lore Debug Utilities
 * 
 * This file contains utilities for inspecting and debugging the lore system.
 */

import { LoreStore, LoreFact, LoreCategory } from '../types/narrative/lore.types';

/**
 * Options for lore store inspection
 */
interface InspectLoreOptions {
  factId?: string;          // Inspect a specific fact
  category?: LoreCategory;  // Filter by category
  tag?: string;             // Filter by tag
  sortBy?: 'importance' | 'confidence' | 'recency'; // Sort criteria
  includeInvalid?: boolean; // Include invalidated facts
}

/**
 * Result of lore store inspection
 */
interface InspectLoreResult {
  facts?: LoreFact[];             // Selected facts
  fact?: LoreFact;                // Single fact (if factId was provided)
  versions?: LoreFact[];          // Version history (if factId was provided)
  relatedFacts?: LoreFact[];      // Related facts (if factId was provided)
  count?: number;                 // Count of facts
  tags?: string[];                // Tags in the selected facts
}

/**
 * Inspect the lore store for debugging
 * 
 * @param loreStore - The lore store to inspect
 * @param options - Options for filtering and sorting
 * @returns Inspection result
 */
export function inspectLoreStore(
  loreStore: LoreStore,
  options: InspectLoreOptions = {}
): InspectLoreResult {
  // Default to not including invalid facts
  const includeInvalid = options.includeInvalid || false;

  // If inspecting a specific fact
  if (options.factId) {
    const fact = loreStore.facts[options.factId];
    if (!fact) {
      return { fact: undefined, versions: [], relatedFacts: [] };
    }

    // Get version history
    const versions = loreStore.factVersions[options.factId] || [];
    
    // Get related facts
    const relatedFacts = fact.relatedFactIds
      .map(id => loreStore.facts[id])
      .filter(Boolean);
    
    return {
      fact,
      versions,
      relatedFacts
    };
  }

  // Collect facts
  let facts: LoreFact[] = [];

  // Filter by category
  if (options.category) {
    const factIds = loreStore.categorizedFacts[options.category] || [];
    facts = factIds
      .map(id => loreStore.facts[id])
      .filter(fact => fact && (includeInvalid || fact.isValid));
  } 
  // Filter by tag
  else if (options.tag) {
    const factIds = loreStore.factsByTag[options.tag] || [];
    facts = factIds
      .map(id => loreStore.facts[id])
      .filter(fact => fact && (includeInvalid || fact.isValid));
  }
  // All facts
  else {
    facts = Object.values(loreStore.facts)
      .filter(fact => includeInvalid || fact.isValid);
  }

  // Sort the facts
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'importance':
        facts.sort((a, b) => b.importance - a.importance);
        break;
      case 'confidence':
        facts.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'recency':
        facts.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
    }
  } else {
    // Default sort by importance
    facts.sort((a, b) => b.importance - a.importance);
  }

  // Collect tags
  const tagSet = new Set<string>();
  facts.forEach(fact => {
    fact.tags.forEach(tag => tagSet.add(tag));
  });

  return {
    facts,
    count: facts.length,
    tags: Array.from(tagSet)
  };
}

/**
 * Statistics about the lore store
 */
interface LoreStats {
  totalFacts: number;
  validFacts: number;
  invalidFacts: number;
  categoryCounts: Record<LoreCategory, number>;
  topTags: Array<{ tag: string; count: number }>;
  averageConfidence: number;
  averageImportance: number;
  totalRelations: number;
  lastUpdated: string;
}

/**
 * Get statistics about the lore store
 * 
 * @param loreStore - The lore store to analyze
 * @returns Statistics about the lore store
 */
export function getLoreStats(loreStore: LoreStore): LoreStats {
  const facts = Object.values(loreStore.facts);

  // Count valid and invalid facts
  const validFacts = facts.filter(fact => fact.isValid).length;
  const invalidFacts = facts.length - validFacts;

  // Count facts by category
  const categoryCounts = {
    character: 0,
    location: 0,
    history: 0,
    item: 0,
    concept: 0
  };

  facts.forEach(fact => {
    categoryCounts[fact.category]++;
  });

  // Count tags
  const tagCounts: Record<string, number> = {};
  facts.forEach(fact => {
    fact.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Get top tags (limited to 10)
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate average confidence and importance
  const averageConfidence = facts.length > 0
    ? facts.reduce((sum, fact) => sum + fact.confidence, 0) / facts.length
    : 0;

  const averageImportance = facts.length > 0
    ? facts.reduce((sum, fact) => sum + fact.importance, 0) / facts.length
    : 0;

  // Count total relations
  const totalRelations = facts.reduce((sum, fact) => sum + fact.relatedFactIds.length, 0);

  return {
    totalFacts: facts.length,
    validFacts,
    invalidFacts,
    categoryCounts,
    topTags,
    averageConfidence,
    averageImportance,
    totalRelations,
    lastUpdated: new Date(loreStore.latestUpdate).toISOString()
  };
}

/**
 * Information about a contradiction between facts
 */
interface Contradiction {
  facts: LoreFact[];
  reason: string;
  conflictScore: number;
}

/**
 * Options for contradiction detection
 */
interface ContradictionOptions {
  tags?: string[];
  categories?: LoreCategory[];
  minConfidence?: number;
}

/**
 * Helper function to extract years from a string
 */
function extractYears(text: string): number[] {
  const yearRegex = /\b\d{4}\b/g;
  const matches = text.match(yearRegex);
  return matches ? matches.map(m => parseInt(m, 10)) : [];
}

/**
 * Find contradictions between facts
 * 
 * @param loreStore - The lore store to analyze
 * @param options - Options for filtering
 * @returns Array of detected contradictions
 */
export function findContradictions(
  loreStore: LoreStore,
  options: ContradictionOptions = {}
): Contradiction[] {
  // Get valid facts
  const facts = Object.values(loreStore.facts).filter(fact => fact.isValid);
  
  // Filter by options
  const filteredFacts = facts.filter(fact => {
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      if (!fact.tags.some(tag => options.tags!.includes(tag))) {
        return false;
      }
    }
    
    // Filter by category
    if (options.categories && options.categories.length > 0) {
      if (!options.categories.includes(fact.category)) {
        return false;
      }
    }
    
    // Filter by minimum confidence
    if (options.minConfidence !== undefined) {
      if (fact.confidence < options.minConfidence) {
        return false;
      }
    }
    
    return true;
  });
  
  // Simple contradiction detection based on related facts with same tags
  const contradictions: Contradiction[] = [];
  
  // Check for facts with the same tags but different content
  // This is a simplified approach - more sophisticated NLP would be out of scope
  for (let i = 0; i < filteredFacts.length; i++) {
    const factA = filteredFacts[i];
    
    for (let j = i + 1; j < filteredFacts.length; j++) {
      const factB = filteredFacts[j];
      
      // Check if facts have same tags (at least 2 in common)
      const commonTags = factA.tags.filter(tag => factB.tags.includes(tag));
      
      if (commonTags.length >= 2) {
        // Simple text-based contradiction detection
        // This would be replaced with more sophisticated NLP in a real implementation
        // but is sufficient for the simplified scope
        
        // Check for conflicting age statements
        if (
          factA.content.includes('years old') && 
          factB.content.includes('years old') &&
          factA.content !== factB.content
        ) {
          contradictions.push({
            facts: [factA, factB],
            reason: `Conflicting age information for ${commonTags.join(', ')}`,
            conflictScore: (factA.confidence + factB.confidence) / 2
          });
        }
        
        // Check for conflicting dates
        const yearsA = extractYears(factA.content); // Now defined before call
        const yearsB = extractYears(factB.content); // Now defined before call
        
        if (yearsA.length > 0 && yearsB.length > 0 && 
            yearsA.some(year => !yearsB.includes(year))) {
          contradictions.push({
            facts: [factA, factB],
            reason: `Conflicting dates for ${commonTags.join(', ')}`,
            conflictScore: (factA.confidence + factB.confidence) / 2
          });
        }
      }
    }
  }
  
  return contradictions;
}


/**
 * Generate a mermaid chart visualization of lore relationships
 * 
 * @param loreStore - The lore store to visualize
 * @param options - Visualization options
 * @returns A mermaid chart string
 */
export function visualizeLoreRelations(
  loreStore: LoreStore,
  options: {
    highlightContradictions?: boolean;
    categories?: LoreCategory[];
  } = {}
): string {
  // Get valid facts
  const facts = Object.values(loreStore.facts).filter(fact => fact.isValid);
  
  // Filter by categories if specified
  const filteredFacts = options.categories
    ? facts.filter(fact => options.categories!.includes(fact.category))
    : facts;
  
  // Find contradictions if highlighting is enabled
  const contradictions = options.highlightContradictions
    ? findContradictions(loreStore)
    : [];
  
  // Set of fact IDs with contradictions
  const contradictionFactIds = new Set<string>();
  contradictions.forEach(contradiction => {
    contradiction.facts.forEach(fact => {
      contradictionFactIds.add(fact.id);
    });
  });
  
  // Start mermaid graph
  let mermaidChart = 'graph TD\n';
  
  // Add nodes
  filteredFacts.forEach(fact => {
    const label = fact.content.length > 30
      ? `${fact.content.substring(0, 27)}...`
      : fact.content;
    
    mermaidChart += `    ${fact.id}["${label}"]\n`;
  });
  
  // Add edges (relations)
  filteredFacts.forEach(fact => {
    fact.relatedFactIds.forEach(relatedId => {
      // Only include relations to facts that are in the filtered set
      if (filteredFacts.some(f => f.id === relatedId)) {
        mermaidChart += `    ${fact.id} -- ${fact.category} --> ${relatedId}\n`;
      }
    });
  });
  
  // Add styling for contradictions
  if (options.highlightContradictions) {
    contradictionFactIds.forEach(factId => {
      mermaidChart += `    style ${factId} fill:#f99,stroke:#f66\n`;
    });
  }
  
  // Add category styling
  mermaidChart += `    classDef character fill:#e6f7ff,stroke:#1890ff\n`;
  mermaidChart += `    classDef location fill:#f6ffed,stroke:#52c41a\n`;
  mermaidChart += `    classDef history fill:#fff7e6,stroke:#fa8c16\n`;
  mermaidChart += `    classDef item fill:#f9f0ff,stroke:#722ed1\n`;
  mermaidChart += `    classDef concept fill:#fff1f0,stroke:#f5222d\n`;
  
  // Apply category classes
  filteredFacts.forEach(fact => {
    mermaidChart += `    class ${fact.id} ${fact.category}\n`;
  });
  
  return mermaidChart;
}
