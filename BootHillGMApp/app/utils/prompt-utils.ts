/**
 * Utilities for formatting AI prompts
 */

import { DecisionPrompt, DecisionResponse } from '../types/ai-service.types';
import { MAX_OPTIONS_PER_DECISION } from '../constants/decision-service.constants';

/**
 * Format the decision prompt for the specific AI provider
 * @param prompt Decision prompt object
 * @returns Formatted prompt string or object based on API requirements
 */
export function formatPromptForAPI(prompt: DecisionPrompt): Record<string, unknown> {
  return {
    messages: [
      {
        role: "system",
        content: `You are the game master for a western-themed RPG called Boot Hill. Your job is to generate contextually 
                 appropriate decision points for the player based on the narrative context. Each decision should:
                 1. Feel natural within the western setting
                 2. Have 3-4 distinct and meaningful options
                 3. Connect to the character's traits and history
                 4. Consider the current narrative context
                 
                 Respond in JSON format with the following structure:
                 {
                   "decisionId": "unique-id",
                   "prompt": "The decision prompt text to show the player",
                   "options": [
                     {
                       "id": "option-1",
                       "text": "Option text to display",
                       "confidence": 0.8,
                       "traits": ["brave", "quick"],
                       "potentialOutcomes": ["Might lead to a gunfight", "Could earn respect"],
                       "impact": "Brief description of impact"
                     }
                   ],
                   "relevanceScore": 0.9,
                   "metadata": {
                     "narrativeImpact": "Description of narrative impact",
                     "themeAlignment": "How well it fits the western theme",
                     "pacing": "slow|medium|fast",
                     "importance": "critical|significant|moderate|minor"
                   }
                 }`
      },
      {
        role: "user",
        content: `Generate a contextually appropriate decision point based on the following information:
                  
                  NARRATIVE CONTEXT:
                  ${prompt.narrativeContext}
                  
                  CHARACTER INFORMATION:
                  Traits: ${prompt.characterInfo.traits.join(', ')}
                  History: ${prompt.characterInfo.history}
                  
                  GAME STATE:
                  Location: ${prompt.gameState.location}
                  Current Scene: ${prompt.gameState.currentScene}
                  Recent Events: ${prompt.gameState.recentEvents.join('; ')}
                  
                  PREVIOUS DECISIONS:
                  ${prompt.previousDecisions.map(d => 
                    `Prompt: ${d.prompt}\nChoice: ${d.choice}\nOutcome: ${d.outcome}`
                  ).join('\n\n')}
                  
                  Remember to maintain the western theme and appropriate tone.`
      }
    ]
  };
}

/**
 * Process the AI service response into a structured decision
 * @param response Raw API response
 * @returns Structured decision response
 */
export function processResponse(response: Record<string, unknown>): DecisionResponse {
  let parsedResponse: Record<string, unknown>;
  
  try {
    // If the API returns content field with JSON string
    if (response.choices && Array.isArray(response.choices) && response.choices[0] && 
        typeof response.choices[0] === 'object' && response.choices[0] !== null) {
      const choiceObj = response.choices[0] as Record<string, unknown>;
      if (choiceObj.message && typeof choiceObj.message === 'object' && choiceObj.message !== null) {
        const messageObj = choiceObj.message as Record<string, unknown>;
        if (typeof messageObj.content === 'string') {
          parsedResponse = JSON.parse(messageObj.content);
        } else {
          throw new Error('Message content is not a string');
        }
      } else {
        throw new Error('Choice does not contain a message object');
      }
    } 
    // If the API directly returns a structured JSON object
    else if (response.decision && typeof response.decision === 'object' && response.decision !== null) {
      parsedResponse = response.decision as Record<string, unknown>;
    }
    // Fallback for unknown formats
    else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Unexpected API response format');
  }
  
  // Validate and standardize the response
  return {
    decisionId: typeof parsedResponse.decisionId === 'string' ? parsedResponse.decisionId : `decision-${Date.now()}`,
    prompt: typeof parsedResponse.prompt === 'string' ? parsedResponse.prompt : 'What do you want to do?',
    options: (Array.isArray(parsedResponse.options) ? parsedResponse.options : []).map((option: unknown) => {
      const opt = option as Record<string, unknown>;
      return {
        id: typeof opt.id === 'string' ? opt.id : `option-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: typeof opt.text === 'string' ? opt.text : 'Undefined option',
        confidence: typeof opt.confidence === 'number' ? opt.confidence : 0.5,
        traits: Array.isArray(opt.traits) ? opt.traits.map(t => String(t)) : [],
        potentialOutcomes: Array.isArray(opt.potentialOutcomes) ? opt.potentialOutcomes.map(o => String(o)) : [],
        impact: typeof opt.impact === 'string' ? opt.impact : 'Unknown impact'
      };
    }),
    relevanceScore: typeof parsedResponse.relevanceScore === 'number' ? parsedResponse.relevanceScore : 0.5,
    metadata: {
      narrativeImpact:
        typeof (parsedResponse.metadata as Record<string, unknown>)
          ?.narrativeImpact === 'string'
          ? (parsedResponse.metadata as Record<string, unknown>)
              .narrativeImpact as string
          : '',
      themeAlignment:
        typeof (parsedResponse.metadata as Record<string, unknown>)
          ?.themeAlignment === 'string'
          ? (parsedResponse.metadata as Record<string, unknown>)
              .themeAlignment as string
          : '',
      pacing:
        (parsedResponse.metadata as Record<string, unknown>)?.pacing as
          | 'slow'
          | 'medium'
          | 'fast',
      importance:
        (parsedResponse.metadata as Record<string, unknown>)?.importance as
          | 'critical'
          | 'significant'
          | 'moderate'
          | 'minor',
    },
  };
}

/**
 * Validate and enhance the generated decision
 * @param decision Generated decision response
 * @param maxOptions Maximum number of options to include
 * @returns Validated and enhanced decision
 */
export function validateDecision(
  decision: DecisionResponse, 
  maxOptions: number = MAX_OPTIONS_PER_DECISION
): DecisionResponse {
  // Validate that we have at least 2 options
  if (!decision.options || decision.options.length < 2) {
    // Add some fallback options
    decision.options = decision.options || [];
    
    if (decision.options.length === 0) {
      decision.options.push({
        id: `fallback-1-${Date.now()}`,
        text: 'Continue forward cautiously',
        confidence: 0.7,
        traits: ['cautious'],
        potentialOutcomes: ['Might avoid danger'],
        impact: 'Slow but safe approach'
      });
    }
    
    if (decision.options.length === 1) {
      decision.options.push({
        id: `fallback-2-${Date.now()}`,
        text: 'Take decisive action',
        confidence: 0.7,
        traits: ['brave'],
        potentialOutcomes: ['Could lead to confrontation'],
        impact: 'Bold but potentially risky'
      });
    }
  }
  
  // Limit number of options based on config
  if (decision.options.length > maxOptions) {
    // Sort by confidence and take the top options
    decision.options = decision.options
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxOptions);
  }
  
  return decision;
}
