import { evaluateDecisionQuality } from '../../utils/decisionQualityAssessment';
import { PlayerDecision, NarrativeContext, DecisionImportance } from '../../types/narrative.types';

describe('Decision Quality Assessment', () => {
  // Test decision with all required fields
  const goodDecision: PlayerDecision = {
    id: 'test-decision-1',
    prompt: 'You encounter a group of bandits on the trail. What do you do?',
    timestamp: Date.now(),
    options: [
      {
        id: 'option1',
        text: 'Draw your weapon and confront them directly',
        impact: 'This could lead to a violent confrontation but might earn you respect.'
      },
      {
        id: 'option2',
        text: 'Try to talk your way out of the situation',
        impact: 'You might avoid violence but could be seen as weak.'
      },
      {
        id: 'option3',
        text: 'Hide and wait for them to pass',
        impact: 'You\'ll avoid conflict but might miss an opportunity.'
      }
    ],
    importance: 'significant' as DecisionImportance,
    context: 'The bandits are blocking the road to town.',
    characters: ['Bandit Leader'],
    aiGenerated: true
  };

  // Test decision with missing fields
  const incompleteDecision: PlayerDecision = {
    id: 'test-decision-2',
    prompt: 'What now?',
    timestamp: Date.now(),
    options: [
      {
        id: 'option1',
        text: 'Go left',
        impact: ''
      },
      {
        id: 'option2',
        text: 'Go right',
        impact: ''
      }
    ],
    importance: 'minor' as DecisionImportance,
    context: '',
    characters: [],
    aiGenerated: true
  };

  // Test decision with similar options
  const similarOptionsDecision: PlayerDecision = {
    id: 'test-decision-3',
    prompt: 'How do you want to approach the town?',
    timestamp: Date.now(),
    options: [
      {
        id: 'option1',
        text: 'Walk into town from the main road',
        impact: 'Everyone will see your arrival.'
      },
      {
        id: 'option2',
        text: 'Enter the town using the main entrance',
        impact: 'Your arrival will be noticed by most people.'
      },
      {
        id: 'option3',
        text: 'Take the side path into town',
        impact: 'Fewer people will notice your arrival.'
      }
    ],
    importance: 'moderate' as DecisionImportance,
    context: '',
    characters: [],
    aiGenerated: true
  };

  // Sample narrative context
  const testContext: NarrativeContext = {
    characterFocus: ['Sheriff Williams', 'Bandit Leader'],
    themes: ['justice', 'revenge', 'survival'],
    worldContext: 'The town is under threat from bandits',
    importantEvents: [
      'The sheriff was wounded in a gunfight with bandits',
      'The bandit leader has threatened to burn down the town',
      'You agreed to help defend the town'
    ],
    storyPoints: { /* Intentionally empty */ },
    narrativeArcs: { /* Intentionally empty */ },
    narrativeBranches: { /* Intentionally empty */ },
    decisionHistory: []
  };

  test('should give high score to good decisions', () => {
    const evaluation = evaluateDecisionQuality(goodDecision, testContext);
    
    expect(evaluation.score).toBeGreaterThanOrEqual(0.8);
    expect(evaluation.acceptable).toBe(true);
    expect(evaluation.suggestions.length).toBeLessThanOrEqual(1);
  });

  test('should identify incomplete decisions', () => {
    const evaluation = evaluateDecisionQuality(incompleteDecision);
    
    expect(evaluation.score).toBeLessThan(0.7);
    expect(evaluation.acceptable).toBe(false);
    expect(evaluation.suggestions.length).toBeGreaterThan(0);
    expect(evaluation.suggestions).toContainEqual(expect.stringContaining('prompt'));
  });

  test('should detect similar options', () => {
    const evaluation = evaluateDecisionQuality(similarOptionsDecision);
    
    expect(evaluation.score).toBeLessThan(0.9);
    expect(evaluation.suggestions).toContainEqual(expect.stringContaining('similar'));
  });

  test('should check narrative relevance', () => {
    // Create a decision unrelated to the current narrative
    const unrelevantDecision: PlayerDecision = {
      id: 'test-decision-4',
      prompt: 'You find a valuable gold nugget. What do you do with it?',
      timestamp: Date.now(),
      options: [
        {
          id: 'option1',
          text: 'Keep it to yourself',
          impact: 'You\'ll be richer but might feel guilty.'
        },
        {
          id: 'option2',
          text: 'Share your discovery with the town',
          impact: 'You\'ll gain reputation but lose some wealth.'
        },
        {
          id: 'option3',
          text: 'Sell it to a traveler discretely',
          impact: 'You\'ll get money without causing a gold rush.'
        }
      ],
      importance: 'significant' as DecisionImportance,
      context: 'The gold nugget is quite valuable.',
      characters: ['Traveler'],
      aiGenerated: true
    };
    
    const evaluation = evaluateDecisionQuality(unrelevantDecision, testContext);
    
    expect(evaluation.score).toBeLessThan(0.8);
    expect(evaluation.suggestions).toContainEqual(expect.stringContaining('character focus'));
  });

  test('should work without narrative context', () => {
    const evaluation = evaluateDecisionQuality(goodDecision);
    
    expect(evaluation.score).toBeGreaterThan(0);
    expect(typeof evaluation.acceptable).toBe('boolean');
  });
});