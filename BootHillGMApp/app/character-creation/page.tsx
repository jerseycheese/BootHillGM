'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { validateAttributeValue, generateFieldValue, generateCompleteCharacter, generateCharacterSummary } from '../utils/aiService';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from '../types/character';
import { initialGameState } from '../types/campaign';
import { LoadingScreen } from '../components/GameArea/LoadingScreen';

// Storage key for character creation progress
const STORAGE_KEY = 'character-creation-progress';

// Initial character state with default values
const initialCharacter: Character = {
  name: '',
  health: 0,
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    bravery: 0,
    experience: 0,
  },
  skills: {
    shooting: 0,
    riding: 0,
    brawling: 0,
  },
};

// Add new interface for step descriptions
interface StepDescription {
  title: string;
  description: string;
  min?: number;
  max?: number;
}

/**
 * Static descriptions for each character creation step
 * Includes field descriptions, valid ranges, and context for each attribute/skill
 */
const STEP_DESCRIPTIONS: Record<string, StepDescription> = {
  name: {
    title: "Character Name",
    description: "Choose a name for your character that fits the Old West setting."
  },
  speed: {
    title: "Speed",
    description: "Determines your character's quickness in combat and reactions. Affects who shoots first.",
    min: 1,
    max: 20
  },
  gunAccuracy: {
    title: "Gun Accuracy",
    description: "Your character's skill with firearms. Critical for combat and survival.",
    min: 1,
    max: 20
  },
  throwingAccuracy: {
    title: "Throwing Accuracy",
    description: "Skill with thrown weapons and general coordination.",
    min: 1,
    max: 20
  },
  strength: {
    title: "Strength",
    description: "Physical power affecting melee damage and carrying capacity.",
    min: 8,
    max: 20
  },
  bravery: {
    title: "Bravery",
    description: "Courage under fire. Affects combat bonuses and reactions.",
    min: 1,
    max: 20
  },
  experience: {
    title: "Experience",
    description: "Previous combat encounters and gunfights. Provides combat bonuses.",
    min: 0,
    max: 11
  },
  shooting: {
    title: "Shooting",
    description: "Overall firearms proficiency. Higher values improve hit chances.",
    min: 1,
    max: 100
  },
  riding: {
    title: "Riding",
    description: "Horsemanship and mounted combat ability.",
    min: 1,
    max: 100
  },
  brawling: {
    title: "Brawling",
    description: "Hand-to-hand combat skill. Important for close encounters.",
    min: 1,
    max: 100
  },
  summary: {
    title: "Character Summary",
    description: "Review your character before finalizing."
  }
};

/**
 * Character creation page implementing a step-by-step process with:
 * - Static descriptions for each attribute and skill
 * - AI-generated character background only in final summary
 * - Automated progress saving
 * - Loading states for async operations (name generation, background)
 */
export default function GameSession() {
  const router = useRouter();
  useGame();
  const { saveGame, cleanupState } = useCampaignState();

  /**
   * Initialize character state from localStorage if available.
   * Falls back to initial character template if no saved progress exists
   * or if saved data is invalid.
   */
  const [character, setCharacter] = useState<Character>(() => {
    if (typeof window === 'undefined') return initialCharacter;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.character || initialCharacter;
      } catch {
        return initialCharacter;
      }
    }
    return initialCharacter;
  });

  // Restore initial step state handling
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.currentStep || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [characterSummary, setCharacterSummary] = useState('');

  // Update the renderInput function to clear input value on corrupted data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          JSON.parse(saved);
        } catch {
          setUserResponse('');
        }
      }
    }
  }, []);


  /**
   * Automatically saves character creation progress to localStorage
   * after any changes to character data or current step.
   * Handles storage errors gracefully with user feedback.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        character,
        currentStep,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save character creation progress:', error);
      setError('Failed to save progress');
    }
  }, [character, currentStep]);

  // Define the structure of each step in the character creation process
  type StepType = 'string' | 'number' | 'review';

  interface Step {
    key: keyof Character['attributes'] | keyof Character['skills'] | 'name' | 'summary';
    type: StepType;
  }

  const steps = useMemo(() => [
    { key: 'name', type: 'string' as const },
    ...Object.keys(character.attributes).map(attr => ({ key: attr as keyof Character['attributes'], type: 'number' as const })),
    ...Object.keys(character.skills).map(skill => ({ key: skill as keyof Character['skills'], type: 'number' as const })),
    { key: 'summary', type: 'review' as const }
  ] satisfies Step[], [character.attributes, character.skills]);

  // Fetch AI-generated prompts for each character creation step
  const getStepPrompt = (currentStep: number) => {
    const { key } = steps[currentStep];
    const stepInfo = STEP_DESCRIPTIONS[key];


    if (!stepInfo) {
      return '';
    }

    let prompt = `${stepInfo.title}\n${stepInfo.description}`;

    if (stepInfo.min !== undefined && stepInfo.max !== undefined) {
      prompt += `\n\nEnter a value between ${stepInfo.min} and ${stepInfo.max}.`;
    }
    return prompt;
  };


  // Fetch new AI prompt when step changes
  useEffect(() => {
    if (currentStep < steps.length - 1) {
      setAiPrompt(getStepPrompt(currentStep));
      setIsLoading(false); // Remove loading state for static content
    }
  }, [currentStep, steps.length, getStepPrompt]); // Add getStepPrompt to the dependency array

  // Generate and display a summary of the character at the final step
  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      // Only use AI for the character description/background
      const summary = await generateCharacterSummary(character);
      setCharacterSummary(summary);
    } catch {
      setCharacterSummary("An error occurred generating your character's background.");
    } finally {
      setIsLoading(false);
      // Set the static prompt immediately
      setAiPrompt(STEP_DESCRIPTIONS.summary.description);
    }
  }, [character]);

  // Trigger summary generation when reaching the final step
  useEffect(() => {
    if (currentStep === steps.length - 1 && !characterSummary) {
      generateSummary();
    }
  }, [currentStep, steps.length, characterSummary, generateSummary]);

  // Handle user input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserResponse(e.target.value);
    setError('');
  };

  // Process form submission for each step
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      if (validateInput()) {
        updateCharacter();
        setCurrentStep((prev: number) => prev + 1);
        setUserResponse('');
        setIsLoading(true);
      }
    } else {
      cleanupState();
      finishCharacterCreation();
    }
  };

  // Validate user input based on current step
  const validateInput = () => {
    const { key, type } = steps[currentStep];
    if (type === 'number') {
      const value = parseInt(userResponse);
      if (isNaN(value) || !validateAttributeValue(key, value)) {
        setError(`Invalid value for ${key}. Please enter a valid number within the specified range.`);
        return false;
      }
    } else if (type === 'string' && key === 'name' && userResponse.trim() === '') {
      setError('Please enter a name for your character.');
      return false;
    }
    return true;
  };

  const generateCharacter = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Attempt to generate a complete character using the AI
      const generatedCharacter = await generateCompleteCharacter();
      setCharacter(generatedCharacter);
      // Move to the summary step to display the generated character
      setCurrentStep(steps.length - 1);
    } catch {
      setError('Failed to generate character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update character state based on current step and user response
  const updateCharacter = () => {
    const { key, type } = steps[currentStep];
    const value = type === 'number' ? parseInt(userResponse) : userResponse;

    setCharacter(prev => {
      if (key === 'name') {
        return { ...prev, name: value as string };
      } else if (key in prev.attributes) {
        return { ...prev, attributes: { ...prev.attributes, [key]: value } };
      } else {
        return { ...prev, skills: { ...prev.skills, [key]: value } };
      }
    });
  };

  /**
   * Completes the character creation process by:
   * 1. Saving the final character
   * 2. Cleaning up temporary progress data
   * 3. Initializing game state
   * 4. Navigating to game session
   */
  const finishCharacterCreation = () => {
    const newCharacterData = JSON.stringify(character);
    localStorage.setItem('lastCreatedCharacter', newCharacterData);
    localStorage.removeItem(STORAGE_KEY); // Add this line back

    // Create clean initial state with new character
    const initialState = {
      ...initialGameState,
      character,
      savedTimestamp: Date.now(),
      isClient: true
    };

    saveGame(initialState);
    router.push('/game-session');
  };

  // Generate a value for the current field using AI or random generation
  const generateFieldValueForStep = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { key } = steps[currentStep];
      if (key !== 'summary') {
        // Use AI service to generate a value for the current field
        const generatedValue = await generateFieldValue(key);
        setUserResponse(generatedValue.toString());
      } else {
        // Set a default message for the summary step
        setUserResponse("Character creation complete. Review your character.");
      }
    } catch {
      setError('Failed to generate value. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
 * Renders the appropriate input interface based on current step:
 * - Text input with name generation for character name
 * - Number input with value generation for attributes/skills
 * - Summary view with AI-generated background for final step
 */
  const renderInput = () => {
    const step = steps[currentStep];

    if (step.type === 'review') {
      // Display character summary and details at the final step
      return (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Character Summary</h2>
          {isLoading ? (
            <LoadingScreen 
              message="Generating character background..." 
              size="small"
              fullscreen={false}
            />
          ) : (
            <>
              {/* AI-generated character background */}
              <p className="mb-4">{characterSummary}</p>
              
              {/* Static character details */}
              <div className="space-y-4">
                <p><strong>Name:</strong> {character.name}</p>
                
                <div>
                  <h3 className="text-lg font-bold">Attributes</h3>
                  {Object.entries(character.attributes).map(([attr, value]) => (
                    <p key={attr}>
                      <strong>{STEP_DESCRIPTIONS[attr].title}:</strong> {value}
                    </p>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold">Skills</h3>
                  {Object.entries(character.skills).map(([skill, value]) => (
                    <p key={skill}>
                      <strong>{STEP_DESCRIPTIONS[skill].title}:</strong> {value}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div>
        <label htmlFor="userResponse" className="block mb-2">Your Response:</label>
        <div className="relative flex space-x-2">
          <input
            type={step.type}
            id="userResponse"
            value={userResponse}
            onChange={handleInputChange}
            className="wireframe-input flex-1"
            required
          />
          <button
            type="button"
            onClick={generateFieldValueForStep}
            className="wireframe-button"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <LoadingScreen 
              message={step.type === 'string' ? "Generating name..." : "Generating value..."}
              size="small"
              fullscreen={false}
            />
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  };


  // Render the character creation form
  return (
    <div className="wireframe-container">
      {currentStep < steps.length - 1 && ( // Only show random character button before summary step
        <button
          type="button"
          onClick={generateCharacter}
          className={`wireframe-button mb-4 float-right ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          Generate Random Character
        </button>
      )}
      <h1 className="wireframe-title">Create Your Character</h1>
      <div className="wireframe-section relative">
        <p className="wireframe-text mb-4">Step {currentStep + 1}: {STEP_DESCRIPTIONS[steps[currentStep].key].title}</p>
        <p className="wireframe-text">{aiPrompt}</p>
      </div>
      <form onSubmit={handleSubmit} className="wireframe-section" data-testid="character-form">
        {renderInput()}
        <div className="flex justify-end mt-4">
          <button type="submit" className="wireframe-button" disabled={isLoading && currentStep === steps.length - 1}>
            {currentStep < steps.length - 1 ? 'Next Step' : 'Finish Character Creation'}
          </button>
        </div>
      </form>
    </div>
  );
}
