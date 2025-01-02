'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateCharacterSummary, generateCompleteCharacter } from '../services/ai/characterService';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from '../types/character';
import { initialGameState } from '../types/campaign';
import { getStartingInventory } from '../utils/startingInventory';

// Storage key for character creation progress
const STORAGE_KEY = 'character-creation-progress';

const initialCharacter: Character = {
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  inventory: [],
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
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
  summary: {
    title: "Character Summary",
    description: "Review your character before finalizing."
  }
};

export type StepType = 'string' | 'number' | 'review';

export interface Step {
  key: keyof Character['attributes'] | 'name' | 'summary';
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

  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState(false);
  const [error, setError] = useState('');
  const [characterSummary, setCharacterSummary] = useState('');

  const validateField = useCallback((field: string, value: string | number) => {
    if (field === 'name') return value.toString().trim() !== '';
    
    const numValue = Number(value);
    const fieldInfo = STEP_DESCRIPTIONS[field];
    if (!fieldInfo?.min || !fieldInfo?.max) return true;
    
    return !isNaN(numValue) && numValue >= fieldInfo.min && numValue <= fieldInfo.max;
  }, []);

  const handleFieldChange = useCallback((field: keyof Character['attributes'] | 'name', value: string | number) => {
    setError('');
    
    if (!validateField(field, value)) {
      setError(`Invalid value for ${field}. Please enter a value within the allowed range.`);
      return;
    }

    setCharacter(prev => {
      if (field === 'name') {
        return { ...prev, name: value.toString() };
      }
      
      if (field in prev.attributes) {
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            [field]: Number(value)
          }
        };
      }
      
      return {
        ...prev
      };
    });
  }, [validateField]);

  const generateFieldValue = useCallback(async (field: keyof Character['attributes'] | 'name') => {
    setIsGeneratingField(true);
    setError('');
    
    try {
      const value = field === 'name' 
        ? 'Generated Name' // Placeholder for name generation
        : generateRandomValue(field);
      handleFieldChange(field, value);
    } catch {
      setError(`Failed to generate value for ${field}`);
    } finally {
      setIsGeneratingField(false);
    }
  }, [handleFieldChange]);

  const generateFullCharacter = useCallback(async () => {
    setIsGeneratingField(true);
    setError('');
    
    try {
      const generatedCharacter = await generateCompleteCharacter();
      setCharacter(generatedCharacter);
    } catch {
      setError('Failed to generate character');
    } finally {
      setIsGeneratingField(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!showSummary) {
        // Validate all fields before showing summary
        const invalidField = Object.entries(STEP_DESCRIPTIONS)
          .find(([key]) => {
            if (key === 'summary') return false;
            const value = key === 'name' ? character.name : 
            character.attributes[key as keyof Character['attributes']];
            return !validateField(key, value);
          });

        if (invalidField) {
          setError(`Invalid value for ${invalidField[0]}`);
          return;
        }

        setIsGeneratingField(true);

        const summary = await generateCharacterSummary(character);
        setCharacterSummary(summary);
        setShowSummary(true);
      } else {
        // Complete character creation
        cleanupState();
        const startingInventory = getStartingInventory();
        const gameState = {
          ...initialGameState,
          character,
          inventory: startingInventory,
          isClient: true,
        };
        saveGame(gameState);
        router.push('/game-session');
      }
    } catch {
      setError('Failed to process character data');
    } finally {
      setIsGeneratingField(false); // Reset loading state
    }
  }, [character, showSummary, cleanupState, saveGame, router, validateField]);

  useEffect(() => {
    if (character.name) {
      const dataToSave = {
        character,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [character]);

  return {
    character,
    showSummary,
    setShowSummary,
    isGeneratingField,
    characterSummary,
    error,
    handleSubmit,
    handleFieldChange,
    generateFieldValue,
    generateFullCharacter,
  };
}

export type ValidField = keyof Character['attributes'];

export function generateRandomValue(field: ValidField): number {
  // Get field constraints from step descriptions
  const fieldInfo = STEP_DESCRIPTIONS[field];
  if (!fieldInfo?.min || !fieldInfo?.max) return 0;
  
  // Generate random value within defined range
  return Math.floor(Math.random() * (fieldInfo.max - fieldInfo.min + 1)) + fieldInfo.min;
}
