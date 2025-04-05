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

/**
 * Action types supported by the context action generator.
 * Each type represents a different category of player action.
 */
type ActionType = 'main' | 'side' | 'basic' | 'optional' | 'combat' | 'interaction' | 'chaotic' | 'danger';

/**
 * Creates a context-appropriate action for the fallback response
 * based on action type and context type.
 * 
 * @param actionType The type of action to create
 * @param contextType The type of context (initializing, looking, etc.)
 * @param locationName The name of the location (defaults to Boothill)
 * @returns A suggested action object
 */
export function createContextAction(
  actionType: ActionType,
  contextType: ResponseContextType,
  locationName: string = DEFAULT_LOCATION_NAME
): SuggestedAction {
  // Use a unique ID to prevent collisions
  const actionId = `fallback-${contextType}-${actionType}-${Date.now()}`;
  
  // Create appropriate actions based on context and type
  switch(contextType) {
    case ResponseContextType.INITIALIZING:
      return createInitializingAction(actionId, actionType, locationName);
    
    case ResponseContextType.LOOKING:
      return createLookingAction(actionId, actionType);
      
    case ResponseContextType.MOVEMENT:
      return createMovementAction(actionId, actionType);
      
    case ResponseContextType.TALKING:
      return createTalkingAction(actionId, actionType);
      
    case ResponseContextType.INVENTORY:
      return createInventoryAction(actionId, actionType);
      
    default: // Generic context
      return createGenericAction(actionId, actionType);
  }
}

/**
 * Creates a suggested action for initializing context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @param locationName Name of the current location
 * @returns Suggested action object
 */
function createInitializingAction(actionId: string, actionType: ActionType, locationName: string): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: `Explore ${locationName}`, 
        description: "Get to know the town", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Visit the saloon", 
        description: "Find information and refreshment", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Take in your surroundings", 
        description: "Get familiar with the area", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Check your weapons", 
        description: "Make sure you're prepared", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Speak with a local", 
        description: "Learn about the town", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Make your presence known", 
        description: "Enter town in a memorable way", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Survey for trouble", 
        description: "Look for potential threats", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Get settled in town", 
        description: "Begin your adventure", 
        type: actionType 
      };
  }
}

/**
 * Creates a suggested action for looking context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @returns Suggested action object
 */
function createLookingAction(actionId: string, actionType: ActionType): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: "Focus on what you see", 
        description: "Study the details", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Check nearby buildings", 
        description: "See what's around", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Note your surroundings", 
        description: "Take in the details", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Look for armed individuals", 
        description: "Identify potential threats", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Ask about what you see", 
        description: "Get information from locals", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Draw attention to yourself", 
        description: "Make people notice you", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Watch for suspicious activity", 
        description: "Stay alert for trouble", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Observe carefully", 
        description: "Take in the details", 
        type: actionType 
      };
  }
}

/**
 * Creates a suggested action for movement context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @returns Suggested action object
 */
function createMovementAction(actionId: string, actionType: ActionType): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: "Continue your journey", 
        description: "Follow the path ahead", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Explore off the path", 
        description: "See what's beyond the trail", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Check your bearings", 
        description: "Make sure you know where you are", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Stay combat ready", 
        description: "Keep your weapon accessible", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Look for traveling companions", 
        description: "Find others on the road", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Take an unmarked trail", 
        description: "Choose the risky path", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Move carefully and quietly", 
        description: "Avoid attracting attention", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Keep moving forward", 
        description: "Continue on your way", 
        type: actionType 
      };
  }
}

/**
 * Creates a suggested action for talking context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @returns Suggested action object
 */
function createTalkingAction(actionId: string, actionType: ActionType): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: "Ask important questions", 
        description: "Get to the information you need", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Inquire about local gossip", 
        description: "Learn what people are talking about", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Listen carefully", 
        description: "Pay attention to what's being said", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Ask about troublemakers", 
        description: "Gather information on potential threats", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Share your own story", 
        description: "Tell others about yourself", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Say something provocative", 
        description: "Stir up the conversation", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Be careful what you reveal", 
        description: "Watch what information you share", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Continue the conversation", 
        description: "Keep talking to learn more", 
        type: actionType 
      };
  }
}

/**
 * Creates a suggested action for inventory context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @returns Suggested action object
 */
function createInventoryAction(actionId: string, actionType: ActionType): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: "Assess your equipment", 
        description: "Consider what you have for your journey", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Look for useful items", 
        description: "Find what might help you", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Organize your belongings", 
        description: "Arrange items for easy access", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Check weapon condition", 
        description: "Make sure your gun is ready", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Show an item to someone", 
        description: "Get information about your belongings", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Discard something unnecessary", 
        description: "Get rid of extra weight", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Hide your valuables", 
        description: "Keep important items secure", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Count your resources", 
        description: "Take stock of what you have", 
        type: actionType 
      };
  }
}

/**
 * Creates a suggested action for generic context
 * 
 * @param actionId Unique identifier for the action
 * @param actionType Type of action to create
 * @returns Suggested action object
 */
function createGenericAction(actionId: string, actionType: ActionType): SuggestedAction {
  switch(actionType) {
    case 'main':
      return { 
        id: actionId, 
        title: "Focus on your objective", 
        description: "Remember why you're here", 
        type: actionType 
      };
    case 'side':
      return { 
        id: actionId, 
        title: "Look for interesting details", 
        description: "Find something worth investigating", 
        type: actionType 
      };
    case 'basic':
      return { 
        id: actionId, 
        title: "Take a moment to think", 
        description: "Consider your next move", 
        type: actionType 
      };
    case 'combat':
      return { 
        id: actionId, 
        title: "Prepare for trouble", 
        description: "Stay ready for action", 
        type: actionType 
      };
    case 'interaction':
      return { 
        id: actionId, 
        title: "Find someone to talk to", 
        description: "Look for information from others", 
        type: actionType 
      };
    case 'chaotic':
      return { 
        id: actionId, 
        title: "Do something unexpected", 
        description: "Surprise everyone around you", 
        type: actionType 
      };
    case 'danger':
      return { 
        id: actionId, 
        title: "Stay vigilant", 
        description: "Watch for signs of trouble", 
        type: actionType 
      };
    default:
      return { 
        id: actionId, 
        title: "Consider your options", 
        description: "Think about what to do next", 
        type: actionType 
      };
  }
}
