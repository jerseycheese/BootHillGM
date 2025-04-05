/**
 * Action Templates
 * 
 * Contains predefined action templates for different game contexts.
 * 
 * @module services/ai/fallback
 */

import { ResponseContextType } from './constants';
import { ActionTemplateSet, ContextActionTemplates } from './contextActionTypes';

/**
 * String variable placeholders used in templates
 */
export const TEMPLATE_VARS = {
  LOCATION_NAME: '${locationName}'
};

/**
 * Templates for initializing context actions
 */
export const initializingTemplates: ActionTemplateSet = {
  main: {
    title: `Explore ${TEMPLATE_VARS.LOCATION_NAME}`,
    description: 'Get to know the town'
  },
  side: {
    title: 'Visit the saloon',
    description: 'Find information and refreshment'
  },
  basic: {
    title: 'Take in your surroundings',
    description: 'Get familiar with the area'
  },
  optional: {
    title: 'Get settled in town',
    description: 'Begin your adventure'
  },
  combat: {
    title: 'Check your weapons',
    description: 'Make sure you\'re prepared'
  },
  interaction: {
    title: 'Speak with a local',
    description: 'Learn about the town'
  },
  chaotic: {
    title: 'Make your presence known',
    description: 'Enter town in a memorable way'
  },
  danger: {
    title: 'Survey for trouble',
    description: 'Look for potential threats'
  }
};

/**
 * Templates for looking context actions
 */
export const lookingTemplates: ActionTemplateSet = {
  main: {
    title: 'Focus on what you see',
    description: 'Study the details'
  },
  side: {
    title: 'Check nearby buildings',
    description: 'See what\'s around'
  },
  basic: {
    title: 'Note your surroundings',
    description: 'Take in the details'
  },
  optional: {
    title: 'Observe carefully',
    description: 'Take in the details'
  },
  combat: {
    title: 'Look for armed individuals',
    description: 'Identify potential threats'
  },
  interaction: {
    title: 'Ask about what you see',
    description: 'Get information from locals'
  },
  chaotic: {
    title: 'Draw attention to yourself',
    description: 'Make people notice you'
  },
  danger: {
    title: 'Watch for suspicious activity',
    description: 'Stay alert for trouble'
  }
};

/**
 * Templates for movement context actions
 */
export const movementTemplates: ActionTemplateSet = {
  main: {
    title: 'Continue your journey',
    description: 'Follow the path ahead'
  },
  side: {
    title: 'Explore off the path',
    description: 'See what\'s beyond the trail'
  },
  basic: {
    title: 'Check your bearings',
    description: 'Make sure you know where you are'
  },
  optional: {
    title: 'Keep moving forward',
    description: 'Continue on your way'
  },
  combat: {
    title: 'Stay combat ready',
    description: 'Keep your weapon accessible'
  },
  interaction: {
    title: 'Look for traveling companions',
    description: 'Find others on the road'
  },
  chaotic: {
    title: 'Take an unmarked trail',
    description: 'Choose the risky path'
  },
  danger: {
    title: 'Move carefully and quietly',
    description: 'Avoid attracting attention'
  }
};

/**
 * Templates for talking context actions
 */
export const talkingTemplates: ActionTemplateSet = {
  main: {
    title: 'Ask important questions',
    description: 'Get to the information you need'
  },
  side: {
    title: 'Inquire about local gossip',
    description: 'Learn what people are talking about'
  },
  basic: {
    title: 'Listen carefully',
    description: 'Pay attention to what\'s being said'
  },
  optional: {
    title: 'Continue the conversation',
    description: 'Keep talking to learn more'
  },
  combat: {
    title: 'Ask about troublemakers',
    description: 'Gather information on potential threats'
  },
  interaction: {
    title: 'Share your own story',
    description: 'Tell others about yourself'
  },
  chaotic: {
    title: 'Say something provocative',
    description: 'Stir up the conversation'
  },
  danger: {
    title: 'Be careful what you reveal',
    description: 'Watch what information you share'
  }
};

/**
 * Templates for inventory context actions
 */
export const inventoryTemplates: ActionTemplateSet = {
  main: {
    title: 'Assess your equipment',
    description: 'Consider what you have for your journey'
  },
  side: {
    title: 'Look for useful items',
    description: 'Find what might help you'
  },
  basic: {
    title: 'Organize your belongings',
    description: 'Arrange items for easy access'
  },
  optional: {
    title: 'Count your resources',
    description: 'Take stock of what you have'
  },
  combat: {
    title: 'Check weapon condition',
    description: 'Make sure your gun is ready'
  },
  interaction: {
    title: 'Show an item to someone',
    description: 'Get information about your belongings'
  },
  chaotic: {
    title: 'Discard something unnecessary',
    description: 'Get rid of extra weight'
  },
  danger: {
    title: 'Hide your valuables',
    description: 'Keep important items secure'
  }
};

/**
 * Templates for generic context actions
 */
export const genericTemplates: ActionTemplateSet = {
  main: {
    title: 'Focus on your objective',
    description: 'Remember why you\'re here'
  },
  side: {
    title: 'Look for interesting details',
    description: 'Find something worth investigating'
  },
  basic: {
    title: 'Take a moment to think',
    description: 'Consider your next move'
  },
  optional: {
    title: 'Consider your options',
    description: 'Think about what to do next'
  },
  combat: {
    title: 'Prepare for trouble',
    description: 'Stay ready for action'
  },
  interaction: {
    title: 'Find someone to talk to',
    description: 'Look for information from others'
  },
  chaotic: {
    title: 'Do something unexpected',
    description: 'Surprise everyone around you'
  },
  danger: {
    title: 'Stay vigilant',
    description: 'Watch for signs of trouble'
  }
};

/**
 * Map of all action templates indexed by context type
 */
export const contextActionTemplates: ContextActionTemplates = {
  [ResponseContextType.INITIALIZING]: initializingTemplates,
  [ResponseContextType.LOOKING]: lookingTemplates,
  [ResponseContextType.MOVEMENT]: movementTemplates,
  [ResponseContextType.TALKING]: talkingTemplates,
  [ResponseContextType.INVENTORY]: inventoryTemplates,
  [ResponseContextType.GENERIC]: genericTemplates
};

/**
 * Utility function to process template strings
 * Replaces template variables with provided values
 * 
 * @param template The template string containing variables
 * @param variables Map of variable names to replacement values
 * @returns The processed string with variables replaced
 */
export function processTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.entries(variables).forEach(([placeholder, value]) => {
    result = result.replace(placeholder, value);
  });
  return result;
}
