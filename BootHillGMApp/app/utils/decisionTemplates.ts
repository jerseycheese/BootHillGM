import {
  DecisionImportance,
} from '../types/narrative.types';
import { LocationType } from '../services/locationService';

/**
 * Represents a template for a contextual decision
 */
export interface DecisionTemplate {
  id: string;
  prompt: string;
  importance: DecisionImportance;
  locationType: LocationType | 'any';
  themeRequirements?: string[];
  characterRequirements?: string[];
  options: Array<{
    id: string;
    text: string;
    impact: string;
    tags?: string[];
  }>;
  contextDescription: string;
}

/**
 * Town-based decision templates
 */
export const townDecisionTemplates: DecisionTemplate[] = [
  {
    id: 'town-sheriff-dispute',
    prompt: 'The sheriff asks for your opinion on a local dispute. How do you respond?',
    importance: 'moderate',
    locationType: { type: 'town', name: 'Generic Town' },
    characterRequirements: ['Sheriff'],
    options: [
      {
        id: 'side-with-landowner',
        text: 'Side with the wealthy landowner who claims rights to the disputed property',
        impact: 'The landowner will be grateful, but the locals may resent your favoritism toward the rich.',
        tags: ['wealth', 'property', 'favoritism']
      },
      {
        id: 'side-with-settlers',
        text: 'Support the settlers who have been working the land for years',
        impact: 'The common folk will appreciate your support, but you may make a powerful enemy.',
        tags: ['common-folk', 'justice', 'enemies']
      },
      {
        id: 'suggest-compromise',
        text: 'Suggest a compromise that gives partial rights to both parties',
        impact: 'Neither side will be completely satisfied, but your reputation for fairness may increase.',
        tags: ['diplomacy', 'compromise', 'reputation']
      }
    ],
    contextDescription: 'A property dispute has been brewing in town, and tensions are high between a wealthy landowner and settlers.'
  },
  {
    id: 'town-saloon-fight',
    prompt: 'A fight breaks out in the saloon. What do you do?',
    importance: 'moderate',
    locationType: { type: 'town', name: 'Generic Town' },
    options: [
      {
        id: 'intervene-peacefully',
        text: 'Try to calm everyone down with words',
        impact: 'You might prevent violence without making enemies, but you risk being seen as weak.',
        tags: ['diplomacy', 'peace', 'reputation']
      },
      {
        id: 'take-sides',
        text: 'Join the side that seems to be in the right',
        impact: "You will make both friends and enemies, and the fight will likely escalate.",
        tags: ['violence', 'justice', 'conflict']
      },
      {
        id: 'call-sheriff',
        text: 'Fetch the sheriff to handle the situation',
        impact: "The law will be upheld, but you might be seen as someone who won't handle their own problems.",
        tags: ['law', 'authority', 'delegation']
      },
      {
        id: 'watch-and-bet',
        text: 'Stay out of it and place a bet on who will win',
        impact: 'You might make some money and avoid danger, but your reputation for moral character could suffer.',
        tags: ['gambling', 'self-interest', 'reputation']
      }
    ],
    contextDescription: 'The saloon is rowdy tonight, and a disagreement at the card table has turned violent.'
  }
];

/**
 * Wilderness-based decision templates
 */
export const wildernessDecisionTemplates: DecisionTemplate[] = [
  {
    id: 'wilderness-injured-traveler',
    prompt: 'You come across an injured traveler on the trail. How do you respond?',
    importance: 'significant',
    locationType: { type: 'wilderness', description: 'Generic Wilderness' },
    options: [
      {
        id: 'help-traveler',
        text: 'Stop and offer medical assistance',
        impact: "You might save a life, but you'll be delayed and could be vulnerable while helping.",
        tags: ['compassion', 'medicine', 'delay']
      },
      {
        id: 'suspect-trap',
        text: 'Approach cautiously, suspecting a possible ambush',
        impact: 'Your caution may protect you from a trap, but might leave someone in genuine need without help.',
        tags: ['caution', 'suspicion', 'self-preservation']
      },
      {
        id: 'pass-by',
        text: 'Continue on your way, avoiding involvement',
        impact: "You'll reach your destination on time and avoid potential danger, but your conscience may be troubled.",
        tags: ['self-interest', 'caution', 'abandonment']
      }
    ],
    contextDescription: 'The trail is dangerous, and not everyone who appears to need help is honest about their intentions.'
  }
];

/**
 * Ranch-based decision templates
 */
export const ranchDecisionTemplates: DecisionTemplate[] = [
  {
    id: 'ranch-cattle-rustlers',
    prompt: "You spot potential cattle rustlers near the fence line. What's your approach?",
    importance: 'critical',
    locationType: { type: 'landmark', name: 'Generic Ranch' },
    options: [
      {
        id: 'confront-directly',
        text: 'Confront them with weapon drawn',
        impact: 'You may scare them off or start a firefight, but your decisive action will be noted.',
        tags: ['confrontation', 'courage', 'violence']
      },
      {
        id: 'observe-first',
        text: 'Observe from hiding to confirm their intentions',
        impact: "You'll gather more information, but they might steal cattle while you watch.",
        tags: ['caution', 'observation', 'strategy']
      },
      {
        id: 'get-reinforcements',
        text: 'Ride back to the ranch house for help',
        impact: "You'll have more firepower when you return, but the rustlers might be gone—with your cattle.",
        tags: ['cooperation', 'delay', 'reinforcement']
      }
    ],
    contextDescription: 'Cattle rustling has been a growing problem in the region, and ranch owners are taking losses.'
  }
];

/**
 * All decision templates combined for easy access
 */
export const allDecisionTemplates: DecisionTemplate[] = [
  ...townDecisionTemplates,
  ...wildernessDecisionTemplates,
  ...ranchDecisionTemplates
];

/**
 * Returns all decision templates for a given location type
 */
export const getTemplatesForLocation = (locationType: LocationType): DecisionTemplate[] => {
  return allDecisionTemplates.filter(template =>
    (typeof template.locationType === 'object' && template.locationType.type === locationType.type) || template.locationType === 'any'
  );
};

/**
 * Returns a random template from the available templates for a location
 */
export const getRandomTemplateForLocation = (locationType: LocationType): DecisionTemplate | null => {
  const templates = getTemplatesForLocation(locationType);
  if (templates.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};