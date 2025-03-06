'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateCharacterSummary, generateCompleteCharacter } from '../services/ai/characterService';
import { generateName } from '../services/ai/nameGenerator';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from "../types/character";
import { initialGameState } from "../types/campaign";
import { getStartingInventory } from "../utils/startingInventory";

// Storage key for character creation progress
const STORAGE_KEY = "character-creation-progress";

export const initialCharacter: Character = {
  isNPC: false,
  isPlayer: true,
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: "",
  inventory: [],
  attributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 8,
    baseStrength: 8,
    bravery: 1,
    experience: 0,
  },
  minAttributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 8,
    baseStrength: 8,
    bravery: 1,
    experience: 0,
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 11,
  },
  wounds: [],
  isUnconscious: false,
};

/**
 * Custom hook managing the Boot Hill character creation process.
 * Handles:
 * - AI-assisted value generation
 * - Progress saving and restoration
 * - Final character summary
 */
export function useCharacterCreation() {
  const router = useRouter();
  const { state: campaignState, saveGame, cleanupState } = useCampaignState();

  // Initialize character from campaign state or fallback to initialCharacter
  const [character, setCharacter] = useState<Character>(() => {
    if (typeof window === 'undefined') return initialCharacter;
    const saved = localStorage.getItem(STORAGE_KEY);

    // Prioritize character from campaign state if available and valid
    if (campaignState?.character) {
      return {
        ...initialCharacter,
        ...campaignState.character,
      };
    }

    if (saved) {
      try {
        const data = JSON.parse(saved);
        return {
          ...initialCharacter,
          ...data.character,
        };
      } catch {
        return initialCharacter;
      }
    }
    return initialCharacter;
});

  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState(false);
  const [error, setError] = useState("");
  const [characterSummary, setCharacterSummary] = useState("");

  const handleFieldChange = useCallback(
  (
    field: keyof Character["attributes"] | "name",
    value: string | number
  ) => {
    setCharacter((prev) => {
      if (field === "name") {
        return { ...prev, name: value.toString() };
      }

      // Perform validation for attribute fields
      if (field in prev.attributes) {
        const numValue = Number(value);
        if (
          isNaN(numValue) ||
          numValue < prev.minAttributes[field] ||
          numValue > prev.maxAttributes[field]
        ) {
          // If value is invalid, do not update the state
          console.warn(`Invalid value for ${field}: ${value}`);
          return prev;
        }

        const updatedAttributes = {
          ...prev.attributes,
          [field]: numValue,
        };

        // Special handling for strength to also update baseStrength
        if (field === "strength") {
          updatedAttributes.baseStrength = numValue;
        }

        return {
          ...prev,
          attributes: updatedAttributes,
        };
      }

      return prev;
    });
  },
  [setCharacter]
);

  const generateFieldValue = useCallback(
    async (field: keyof Character["attributes"] | "name") => {
      setIsGeneratingField(true);
      setError("");

      try {
        const value =
          field === "name"
            ? await generateName()
            : generateRandomValue(field as keyof Character["attributes"]);
        handleFieldChange(field, value);
      } catch (error) {
        console.error(`Failed to generate value for ${field}:`, error);
        setError(`Failed to generate value for ${field}`);
      } finally {
        setIsGeneratingField(false);
      }
    },
    [handleFieldChange]
  );

  const generateFullCharacter = useCallback(async () => {
    setIsGeneratingField(true);
    setError("");

    try {
      const generatedCharacter = await generateCompleteCharacter();

      setCharacter(generatedCharacter);
    } catch (error) {
      console.error("Failed to generate character:", error);
      setError("Failed to generate character");
    } finally {
      setIsGeneratingField(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        if (!showSummary) {
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
            currentPlayer: character.id,
            npcs: [],
            location: null, // No initial location
          };
          saveGame(gameState);
          router.push("/game-session");
        }
      } catch {
        setError("Failed to process character data");
      } finally {
        setIsGeneratingField(false); // Reset loading state
      }
    },
    [character, showSummary, cleanupState, saveGame, router]
  );

  useEffect(() => {
    if (character.name) {
      const dataToSave = {
        character,
        lastUpdated: Date.now(),
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

export function generateRandomValue(field: keyof Character["attributes"]): number {
    switch (field) {
        case "speed":
            return 1;
        case "gunAccuracy":
            return 1;
        case "throwingAccuracy":
            return 1;
        case "strength":
        case "baseStrength":
            return 8;
        case "bravery":
            return 1;
        case "experience":
            return 0;
        default:
            return 0;
    }
}
