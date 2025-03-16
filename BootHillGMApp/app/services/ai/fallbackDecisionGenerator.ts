/**
 * Fallback Decision Generator
 * 
 * Generates fallback decisions when AI generation fails or produces low-quality results.
 * Provides a safety net to ensure players always have choices.
 */

import { v4 as uuidv4 } from 'uuid';
import { NarrativeState, PlayerDecision } from '../../types/narrative.types';
import { Character } from '../../types/character';

/**
 * Generate a fallback decision when AI generation fails
 * 
 * @param narrativeState Current narrative state
 * @param _character Player character
 * @returns A simple default decision
 */
export function generateFallbackDecision(
  narrativeState: NarrativeState,
  _character: Character
): PlayerDecision {
  // Character param kept for future implementation
  
  return {
    id: `fallback-${uuidv4()}`,
    prompt: 'What would you like to do?',
    timestamp: Date.now(),
    location: narrativeState.currentStoryPoint?.locationChange,
    options: [
      {
        id: `option1-${uuidv4()}`,
        text: 'Proceed cautiously',
        impact: 'Taking a careful approach may reveal more information.',
        tags: ['cautious']
      },
      {
        id: `option2-${uuidv4()}`,
        text: 'Take immediate action',
        impact: 'Bold moves can yield faster results but may be riskier.',
        tags: ['brave']
      },
      {
        id: `option3-${uuidv4()}`,
        text: 'Look for another approach',
        impact: 'There might be a less obvious but advantageous solution.',
        tags: ['resourceful']
      }
    ],
    context: 'Based on the current situation',
    importance: 'moderate',
    characters: [],
    aiGenerated: true
  };
}

/**
 * Generate a themed fallback decision
 * 
 * @param narrativeState Current narrative state 
 * @param theme Theme to apply to the fallback decision
 * @returns Themed fallback decision
 */
export function generateThemedFallbackDecision(
  narrativeState: NarrativeState,
  theme: 'combat' | 'exploration' | 'social' = 'exploration'
): PlayerDecision {
  // Base decision structure
  const decision: PlayerDecision = {
    id: `fallback-${uuidv4()}`,
    prompt: 'What would you like to do?',
    timestamp: Date.now(),
    location: narrativeState.currentStoryPoint?.locationChange,
    options: [],
    context: 'Based on the current situation',
    importance: 'moderate',
    characters: [],
    aiGenerated: true
  };
  
  // Apply theme-specific content
  switch (theme) {
    case 'combat':
      decision.prompt = 'How do you want to approach this confrontation?';
      decision.options = [
        {
          id: uuidv4(),
          text: 'Take a defensive stance',
          impact: 'You\'ll be better protected but may miss offensive opportunities.',
          tags: ['defensive', 'cautious']
        },
        {
          id: uuidv4(),
          text: 'Look for a tactical advantage',
          impact: 'Finding the right position could give you an edge.',
          tags: ['tactical', 'smart']
        },
        {
          id: uuidv4(),
          text: 'Prepare to strike decisively',
          impact: 'An aggressive approach could end this quickly but leaves you exposed.',
          tags: ['aggressive', 'brave']
        }
      ];
      break;
      
    case 'social':
      decision.prompt = 'How do you want to handle this conversation?';
      decision.options = [
        {
          id: uuidv4(),
          text: 'Be diplomatic and measured',
          impact: 'A careful approach may build trust but could appear weak to some.',
          tags: ['diplomatic', 'cautious']
        },
        {
          id: uuidv4(),
          text: 'Be direct and to the point',
          impact: 'Honesty can be refreshing but might offend more sensitive individuals.',
          tags: ['direct', 'honest']
        },
        {
          id: uuidv4(),
          text: 'Use charm and persuasion',
          impact: 'A silver tongue might get you what you want, but people may question your sincerity.',
          tags: ['charming', 'persuasive']
        }
      ];
      break;
      
    case 'exploration':
    default:
      decision.prompt = 'How do you want to explore this area?';
      decision.options = [
        {
          id: uuidv4(),
          text: 'Take your time and be thorough',
          impact: 'You might find hidden details but it will take longer.',
          tags: ['thorough', 'cautious']
        },
        {
          id: uuidv4(),
          text: 'Focus on what stands out',
          impact: 'You\'ll cover more ground but might miss subtle details.',
          tags: ['efficient', 'practical']
        },
        {
          id: uuidv4(),
          text: 'Look for an unusual approach',
          impact: 'Thinking outside the box might reveal unique opportunities.',
          tags: ['creative', 'resourceful']
        }
      ];
      break;
  }
  
  return decision;
}