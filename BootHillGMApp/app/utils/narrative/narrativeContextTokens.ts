/**
 * Narrative Context Token Allocator
 * 
 * Handles token allocation and budget management for narrative context elements
 * to optimize token usage across different context sections.
 */

import { 
  ScoredContextElement,
  ContextBlockType,
  NarrativeContentBlock
} from '../../types/narrative/context.types';
import { 
  contextTypeMapping,
  blockSectionTitles,
  TokenAllocation, 
  BlockGroups
} from './narrativeContextTypes';
import { estimateTokenCount } from './narrativeCompression';

/**
 * Allocates tokens to content elements based on priorities and token allocation
 * 
 * @param elements - Prioritized list of context elements
 * @param maxTokens - Maximum tokens to allocate
 * @param allocation - Token allocation percentages across sections
 * @returns Array of content blocks that fit within token budget
 */
export function allocateTokensToElements(
  elements: ScoredContextElement[],
  maxTokens: number,
  allocation?: TokenAllocation
): NarrativeContentBlock[] {
  if (!elements || elements.length === 0 || maxTokens <= 0) {
    return [];
  }
  
  // Default allocation if not provided
  const effectiveAllocation = allocation || {
    narrativeHistory: 40,
    decisionHistory: 30,
    worldState: 15,
    relationships: 10,
    storyContext: 5
  };
  
  // Calculate token allocations for each block type
  const tokenAllocations: Record<ContextBlockType, number> = {
    'narrative_history': Math.floor((effectiveAllocation.narrativeHistory || 40) * maxTokens / 100),
    'decision': Math.floor((effectiveAllocation.decisionHistory || 30) * maxTokens / 100),
    'world_state': Math.floor((effectiveAllocation.worldState || 15) * maxTokens / 100),
    'character': Math.floor((effectiveAllocation.relationships || 10) * maxTokens / 100),
    'location': Math.floor((effectiveAllocation.worldState || 15) * maxTokens / 100) / 3, // Share with world state
    'story_progression': Math.floor((effectiveAllocation.storyContext || 5) * maxTokens / 100),
    'instruction': Math.floor(maxTokens * 0.05) // Reserve 5% for instructions
  };
  
  // Group elements by block type
  const blockGroups: BlockGroups = groupElementsByBlockType(elements);
  
  // Create content blocks respecting token allocations
  const contentBlocks: NarrativeContentBlock[] = [];
  
  // Process each block type
  Object.entries(blockGroups).forEach(([blockTypeStr, groupElements]) => {
    const blockType = blockTypeStr as ContextBlockType;
    const tokenBudget = tokenAllocations[blockType] || 0;
    
    if (tokenBudget <= 0 || !groupElements.length) {
      return;
    }
    
    // Sort elements by relevance
    const sortedElements = [...groupElements].sort((a, b) => b.relevance - a.relevance);
    
    // Fill until token budget is exhausted
    let remainingTokens = tokenBudget;
    let blockContent = '';
    const blockPriority = getBlockPriority(blockType);
    
    sortedElements.forEach(element => {
      if (element.tokens <= remainingTokens) {
        // Add element if it fits in the budget
        blockContent += (blockContent ? '\n\n' : '') + element.content;
        remainingTokens -= element.tokens;
      }
    });
    
    if (blockContent) {
      contentBlocks.push({
        type: blockType,
        content: blockContent,
        tokens: tokenBudget - remainingTokens,
        priority: blockPriority,
        metadata: { elements: groupElements.length }
      });
    }
  });
  
  // Sort blocks by priority
  return contentBlocks.sort((a, b) => a.priority - b.priority);
}

/**
 * Group elements by block type
 * 
 * @param elements - Array of context elements to group
 * @returns Grouped elements by block type
 */
function groupElementsByBlockType(elements: ScoredContextElement[]): BlockGroups {
  const blockGroups: BlockGroups = {};
  
  elements.forEach(element => {
    const blockType = contextTypeMapping[element.type];
    if (!blockGroups[blockType]) {
      blockGroups[blockType] = [];
    }
    blockGroups[blockType].push(element);
  });
  
  return blockGroups;
}

/**
 * Get priority value for different block types (lower = higher priority)
 * 
 * @param blockType - Type of content block
 * @returns Priority value (lower values are higher priority)
 */
export function getBlockPriority(blockType: ContextBlockType): number {
  switch (blockType) {
    case 'story_progression': return 1;
    case 'world_state': return 2;
    case 'narrative_history': return 3;
    case 'decision': return 4;
    case 'character': return 5;
    case 'location': return 6;
    case 'instruction': return 0; // Instructions always first
    default: return 10;
  }
}

/**
 * Builds structured context from content blocks
 * 
 * @param blocks - Array of content blocks
 * @param maxTokens - Optional maximum token limit
 * @returns Formatted context string
 */
export function buildStructuredContext(
  blocks: NarrativeContentBlock[],
  maxTokens?: number
): string {
  if (!blocks || blocks.length === 0) {
    return '';
  }
  
  // Sort blocks by priority if not already done
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  // Format each block with appropriate section headers
  const sectionParts: string[] = [];
  let tokenCount = 0;
  
  sortedBlocks.forEach(block => {
    // Skip if exceeding token limit
    if (maxTokens && tokenCount >= maxTokens) {
      return;
    }
    
    const section = formatBlockAsSection(block);
    const sectionTokens = estimateTokenCount(section);
    
    // Check if adding this section would exceed token limit
    if (maxTokens && tokenCount + sectionTokens > maxTokens) {
      // Skip this section if it doesn't fit completely
      return;
    }
    
    sectionParts.push(section);
    tokenCount += sectionTokens;
  });
  
  // Add an instruction section at the end
  sectionParts.push(`
## Guidance
Use the above context to maintain narrative coherence in your responses. Reference relevant past decisions and events appropriately. Maintain consistent characterization and world state.
  `.trim());
  
  return sectionParts.join('\n\n');
}

/**
 * Format a content block as a section with appropriate header
 * 
 * @param block - Content block to format
 * @returns Formatted section text with header
 */
function formatBlockAsSection(block: NarrativeContentBlock): string {
  const title = blockSectionTitles[block.type] || 'Context';
  return `## ${title}\n${block.content}`;
}