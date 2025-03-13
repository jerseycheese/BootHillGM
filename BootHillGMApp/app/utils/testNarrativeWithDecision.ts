/**
 * Test utility for narrative decision flow 
 * 
 * This file provides a simple way to test the narrative decision flow 
 * without requiring the AI service to be running.
 */

import { DecisionImportance, PlayerDecision } from "../types/narrative.types";

/**
 * Creates a test narrative that contains decision trigger words
 * This can be used to test the auto-detection of decision points
 * 
 * @returns A narrative string with decision trigger words
 */
export const createTestNarrativeWithTrigger = (): string => {
  return `
The dusty streets of Boot Hill are quiet as you make your way toward the sheriff's office. 
You've heard rumors of strange happenings at the old mine, and you're determined to find out more.

As you approach the sheriff's office, you notice a group of men gathered outside the saloon across the street. 
They seem to be arguing about something. One of them, a tall man in a black hat, gestures angrily.

What will you do? Will you approach the sheriff's office as planned, or investigate the commotion at the saloon?
The choice is yours, and it may affect how events unfold in Boot Hill.
  `;
};

/**
 * Creates a test decision object for manual testing
 * 
 * @param importance The importance level of the decision
 * @returns A PlayerDecision object ready to be presented
 */
export const createTestDecision = (importance: DecisionImportance = 'moderate'): PlayerDecision => {
  return {
    id: `test-decision-${Date.now()}`,
    prompt: 'What will you do?',
    timestamp: Date.now(),
    options: [
      { 
        id: 'option1', 
        text: 'Continue to the sheriff\'s office as planned',
        impact: 'You might get the information you need about the mine, but miss what\'s happening at the saloon.'
      },
      { 
        id: 'option2', 
        text: 'Approach the arguing men and try to find out what\'s happening',
        impact: 'You could learn about the situation firsthand, but might get involved in their conflict.'
      },
      { 
        id: 'option3', 
        text: 'Observe from a distance before deciding',
        impact: 'You\'ll gather more information before acting, but might miss an opportunity to get directly involved.'
      }
    ],
    context: 'The men outside the saloon continue their heated discussion as you consider your options.',
    importance: importance,
    characters: ['Sheriff', 'Saloon Patrons'],
    aiGenerated: false
  };
};

/**
 * A longer narrative that contains multiple potential decision points
 * Use this to test more complex narrative flows
 * 
 * @returns A longer narrative string with multiple decision triggers
 */
export const createComplexTestNarrative = (): string => {
  return `
You arrive in Boot Hill just as the sun begins to set, casting long shadows across the dusty main street.
After securing your horse at the livery stable, you make your way to the Dusty Trail Inn to get a room for the night.

The innkeeper, a weathered woman named Martha, eyes you suspiciously as you approach the counter.
"Don't get many strangers these days," she says, sliding the guest book toward you. "Not since the trouble started at the mine."

You could ask her about the mine trouble, or just sign the book and keep to yourself.
The choice is yours, but information might be valuable in a town like this.

After settling into your room, you decide to head to the saloon for a drink and to pick up any gossip.
The Eagle's Nest Saloon is busy tonight, with miners and cowboys alike drowning their sorrows.

At the bar, you overhear two miners discussing something in hushed tones.
"Third disappearance this month," one says. "Company says it's accidents, but I don't believe it."

What do you do next? Do you join their conversation, or find someone else to talk to?

As the night wears on, a commotion erupts outside. The sound of shouting draws patrons to the windows.
A man on horseback is racing down the main street, pursued by three riders.

You must decide quickly whether to stay inside where it's safe, or venture out to see what's happening.
Your decision could put you in danger, or give you a crucial lead on the mysteries of Boot Hill.
  `;
};
