/**
 * Decision Response Processor
 * 
 * This module handles processing and parsing of raw AI-generated decision
 * responses, converting them into structured PlayerDecision objects.
 */

import { v4 as uuidv4 } from 'uuid';
import { LocationType } from '../../services/locationService';
import { PlayerDecision } from '../../types/narrative.types';
import { RawDecisionResponse, ContextualDecisionServiceConfig } from './contextualDecision.types';

/**
 * Process a raw AI response to extract the decision data
 * 
 * @param responseText Raw text response from AI
 * @returns Parsed decision response or null if parsing fails
 */
export function processResponse(responseText: string): RawDecisionResponse | null {
  try {
    // Extract JSON from response (in case there's additional text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText);
      return null;
    }
    
    // Parse the JSON
    const jsonString = jsonMatch[0];
    const response = JSON.parse(jsonString) as RawDecisionResponse;
    
    // Validate required fields
    if (!response.prompt || !response.options || response.options.length === 0) {
      console.error('Invalid decision response format:', response);
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('Error processing decision response:', error);
    console.debug('Raw response:', responseText);
    return null;
  }
}

/**
 * Convert a raw decision response to a structured PlayerDecision
 * 
 * @param response Processed AI response object
 * @param config Service configuration
 * @param location Optional location context
 * @returns Structured PlayerDecision object
 */
export function toPlayerDecision(
  response: RawDecisionResponse,
  config: ContextualDecisionServiceConfig,
  location?: LocationType
): PlayerDecision {
  // Generate a unique ID for the decision
  const decisionId = `decision-${uuidv4()}`;
  
  // Limit the number of options based on config
  const limitedOptions = response.options
    ? response.options.slice(0, config.maxOptionsPerDecision)
    : [];
  
  // Format options with missing fields
  const formattedOptions = limitedOptions.map((option, index) => ({
    id: `option-${index}-${uuidv4()}`,
    text: option.text || `Option ${index + 1}`,
    impact: option.impact || 'Impact unknown',
    tags: option.tags || []
  }));
  
  // Default to at least two options if none are provided
  if (formattedOptions.length === 0) {
    formattedOptions.push({
      id: `option-0-${uuidv4()}`,
      text: 'Proceed carefully',
      impact: 'A cautious approach to the situation.',
      tags: ['default', 'cautious']
    });
    
    formattedOptions.push({
      id: `option-1-${uuidv4()}`,
      text: 'Take decisive action',
      impact: 'A bold approach that might have significant consequences.',
      tags: ['default', 'bold']
    });
  }
  
  // Build the full PlayerDecision object
  return {
    id: decisionId,
    prompt: response.prompt || 'What will you do?',
    timestamp: Date.now(),
    location,
    options: formattedOptions,
    context: response.context || 'A decision point has been reached.',
    importance: response.importance || 'moderate',
    characters: [], // No character data available from AI response
    aiGenerated: true
  };
}