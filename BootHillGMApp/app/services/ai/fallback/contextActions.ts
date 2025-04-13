/**
 * Context Action Generator
 * 
 * Creates suggested actions appropriate for different game contexts.
 * This component generates action suggestions based on context type and action categories.
 * 
 * @module services/ai/fallback
 */

import { SuggestedAction } from '../../../types/campaign';
import { ResponseContextType, DEFAULT_LOCATION_NAME } from './constants';
import { ActionType } from './contextActionTypes';
import { contextActionTemplates, TEMPLATE_VARS, processTemplate } from './actionTemplates';

/**
 * Creates a context-appropriate action for the fallback response
 * based on action type and context type.
 * 
 * @param actionType The type of action to create
 * @param contextType The type of context (initializing, looking, etc.)
 * @param locationName The name of the location (defaults to Boot Hill)
 * @returns A suggested action object
 */
export function createContextAction(
  actionType: ActionType,
  contextType: ResponseContextType,
  locationName: string = DEFAULT_LOCATION_NAME
): SuggestedAction {
  // Validate inputs
  const validContextType = Object.values(ResponseContextType).includes(contextType as ResponseContextType)
    ? contextType
    : ResponseContextType.GENERIC;
  
  // Use a unique ID to prevent collisions
  const actionId = `fallback-${validContextType}-${actionType}-${Date.now()}`;
  
  // Get the appropriate templates based on context type
  const templates = contextActionTemplates[validContextType] || contextActionTemplates[ResponseContextType.GENERIC];
  
  // Get the specific template for this action type or use a default one
  const template = templates[actionType] || templates.basic;
  
  // Process template variables
  const variables = {
    [TEMPLATE_VARS.LOCATION_NAME]: locationName
  };
  
  const title = processTemplate(template.title, variables);
  
  // Create and return the suggested action
  return {
    id: actionId,
    title,
    description: template.description,
    type: actionType
  };
}
