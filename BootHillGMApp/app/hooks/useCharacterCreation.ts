'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { validateAttributeValue, generateFieldValue, generateCompleteCharacter, generateCharacterSummary } from '../utils/aiService';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from '../types/character';
import { initialGameState } from '../types/campaign';

// Storage key for character creation progress
const STORAGE_KEY = 'character-creation-progress';

const initialCharacter: Character = {
  name: '',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
  },
  skills: {
    shooting: 0,
    riding: 0,
    brawling: 0,
  },
  wounds: [],
  isUnconscious: false
};

// Add new interface for step descriptions
interface StepDescription {
  title: string;
  description: string;
  min?: number;
  max?: number;
}

export const STEP_DESCRIPTIONS: Record<string, StepDescription> = {
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
  baseStrength: {
    title: "Base Strength",
    description: "Maximum physical power. This value represents your character's peak condition.",
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

export type StepType = 'string' | 'number' | 'review';

export interface Step {
  key: keyof Character['attributes'] | keyof Character['skills'] | 'name' | 'summary';
  type: StepType;
}


/**
 * Custom hook managing the Boot Hill character creation process.
 * Handles:
 * - Step-by-step character attribute input
 * - AI-assisted value generation
 * - Progress saving and restoration
 * - Character validation
 * - Final character summary
 */
export function useCharacterCreation() {
  const router = useRouter();
  useGame();
  const { saveGame, cleanupState } = useCampaignState();

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
  const [isGeneratingField, setIsGeneratingField] = useState(false);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [error, setError] = useState('');
  const [characterSummary, setCharacterSummary] = useState('');

  const steps = useMemo(() => [
    { key: 'name', type: 'string' as const },
    ...Object.keys(character.attributes).map(attr => ({ key: attr as keyof Character['attributes'], type: 'number' as const })),
    ...Object.keys(character.skills).map(skill => ({ key: skill as keyof Character['skills'], type: 'number' as const })),
    { key: 'summary', type: 'review' as const }
  ] satisfies Step[], [character.attributes, character.skills]);

  /**
   * Saves creation progress after each change.
   * Stores character data and current step in localStorage.
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

  /**
   * Generates step-specific prompts based on attributes.
   * Includes validation ranges for numeric inputs.
   */
  const getStepPrompt = useCallback((currentStep: number) => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return '';
    }

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
  }, [steps]);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      setAiPrompt(getStepPrompt(currentStep));
    }
  }, [currentStep, steps.length, getStepPrompt]);

  const generateSummary = useCallback(async () => {
    setIsGeneratingCharacter(true);
    try {
      const summary = await generateCharacterSummary(character);
      setCharacterSummary(summary);
    } catch {
      setCharacterSummary("An error occurred generating your character's background.");
    } finally {
      setIsGeneratingCharacter(false);
      setAiPrompt(STEP_DESCRIPTIONS.summary.description);
    }
  }, [character]);

  useEffect(() => {
    if (currentStep === steps.length - 1 && !characterSummary) {
      generateSummary();
    }
  }, [currentStep, steps.length, characterSummary, generateSummary]);

  useEffect(() => {
    if (character.name) {
      setCurrentStep(steps.length - 1);
    }
  }, [character, steps.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserResponse(e.target.value);
    setError('');
  };

  const validateInput = () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return false;
    }
    
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

  const updateCharacter = async () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return;
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      if (validateInput()) {
        setIsProcessingStep(true);
        try {
          await updateCharacter();
          setCurrentStep((prev: number) => prev + 1);
          setUserResponse('');
        } finally {
          setIsProcessingStep(false);
        }
      }
    } else {
      cleanupState();
      finishCharacterCreation();
    }
  };

  const generateCharacter = async () => {
    setIsGeneratingCharacter(true);
    setError('');
    try {
      const generatedCharacter = await generateCompleteCharacter();
      setCharacter(generatedCharacter);
    } catch {
      setError('Failed to generate character. Please try again.');
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  const generateFieldValueForStep = async () => {
    setIsGeneratingField(true);
    setError('');
    try {
      if (currentStep < 0 || currentStep >= steps.length) {
        throw new Error('Invalid step');
      }
      
      const { key } = steps[currentStep];
      if (key !== 'summary') {
        const generatedValue = await generateFieldValue(key);
        setUserResponse(generatedValue.toString());
      } else {
        setUserResponse("Character creation complete. Review your character.");
      }
    } catch {
      setError('Failed to generate value. Please try again.');
    } finally {
      setIsGeneratingField(false);
    }
  };

  const finishCharacterCreation = () => {
    const newCharacterData = JSON.stringify(character);
    localStorage.setItem('lastCreatedCharacter', newCharacterData);
    localStorage.removeItem(STORAGE_KEY);

    const initialState = {
      ...initialGameState,
      character,
      savedTimestamp: Date.now(),
      isClient: true
    };

    saveGame(initialState);
    router.push('/game-session');
  };

  const getCurrentStepInfo = () => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return { title: "Loading...", step: 0 };
    }
    const stepKey = steps[currentStep].key;
    const stepInfo = STEP_DESCRIPTIONS[stepKey];
    return {
      title: stepInfo?.title || stepKey,
      step: currentStep + 1
    };
  };

  return {
    character,
    currentStep,
    steps,
    isGeneratingCharacter,
    isGeneratingField,
    isProcessingStep,
    aiPrompt,
    characterSummary,
    userResponse,
    error,
    handleSubmit,
    handleInputChange,
    generateCharacter,
    generateFieldValueForStep,
    getCurrentStepInfo,
  };
}
