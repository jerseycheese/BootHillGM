'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getCharacterCreationStep, validateAttributeValue, generateFieldValue, generateCompleteCharacter, generateCharacterSummary } from '../utils/aiService';
import { useCampaignState } from '../components/CampaignStateManager';
import { Character } from '../types/character';

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

export default function GameSession() {
  const router = useRouter();
  useGame(); // Keep the hook call without destructuring
  const { state, saveGame } = useCampaignState();
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [characterSummary, setCharacterSummary] = useState('');

  // Define the structure of each step in the character creation process
  const steps = useMemo(() => [
    { key: 'name' as const, type: 'string' },
    ...Object.keys(character.attributes).map(attr => ({ key: attr as keyof Character['attributes'], type: 'number' as const })),
    ...Object.keys(character.skills).map(skill => ({ key: skill as keyof Character['skills'], type: 'number' as const })),
    { key: 'summary' as const, type: 'review' as const }
  ] as const, [character.attributes, character.skills]);

  // Fetch AI-generated prompts for each character creation step
  const getNextAIPrompt = useCallback(async () => {
    try {
      if (currentStep < steps.length - 1) {
        const prompt = await getCharacterCreationStep(currentStep, steps[currentStep].key);
        setAiPrompt(prompt);
      }
    } catch (error) {
      console.error('Error getting AI prompt:', error);
      setAiPrompt('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, steps]);

  // Fetch new AI prompt when step changes
  useEffect(() => {
    if (isLoading && currentStep < steps.length - 1) {
      getNextAIPrompt();
    }
  }, [currentStep, isLoading, getNextAIPrompt, steps.length]);

  // Generate and display a summary of the character at the final step
  const generateSummary = useCallback(async () => {
    try {
      const summary = await generateCharacterSummary(character);
      setCharacterSummary(summary);
      setAiPrompt("Review your character summary below. If you're satisfied, click 'Finish' to create your character.");
    } catch (error) {
      console.error('Error generating character summary:', error);
      setCharacterSummary("An error occurred while generating the character summary. Please try again.");
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
        setCurrentStep(prev => prev + 1);
        setUserResponse('');
        setIsLoading(true);
      }
    } else {
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
    } catch (error) {
      console.error('Error generating character:', error);
      // Display a user-friendly error message
      setError(`Failed to generate character. Please try again. (Error: ${error instanceof Error ? error.message : 'Unknown error'})`);
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

  // Finalize character creation and navigate to game session
  const finishCharacterCreation = () => {
    const updatedState = { ...state, character };
    saveGame(updatedState);
    localStorage.setItem('lastCreatedCharacter', JSON.stringify(character));
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
    } catch (error) {
      console.error('Error generating field value:', error);
      setError(`Failed to generate value. Please try again. (Error: ${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render input field or character summary based on current step
  const renderInput = () => {
    const { type } = steps[currentStep];
    if (type === 'review') {
      // Display character summary and details at the final step
      return (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Character Summary</h2>
          <p>{characterSummary}</p>
          <p><strong>Name:</strong> {character.name}</p>
          <h3 className="text-lg font-bold">Attributes</h3>
          {Object.entries(character.attributes).map(([attr, value]) => (
            <p key={attr}><strong>{attr}:</strong> {value}</p>
          ))}
          <h3 className="text-lg font-bold">Skills</h3>
          {Object.entries(character.skills).map(([skill, value]) => (
            <p key={skill}><strong>{skill}:</strong> {value}</p>
          ))}
        </div>
      );
    }
    // Render input field for character attributes and skills
    return (
      <div>
        <label htmlFor="userResponse" className="block mb-2">Your Response:</label>
        <div className="flex space-x-2">
          <input
            type={type}
            id="userResponse"
            value={userResponse}
            onChange={handleInputChange}
            className="wireframe-input"
            required
          />
          <button
            type="button"
            onClick={generateFieldValueForStep}
            className="wireframe-button mb-2"
            disabled={isLoading}
          >
            Generate
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Render the character creation form
  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Create Your Character</h1>
      <div className="wireframe-section">
        <p className="wireframe-text mb-4">Step {currentStep + 1}: {steps[currentStep].key}</p>
        {isLoading ? <p>Loading...</p> : <p className="wireframe-text">{aiPrompt}</p>}
      </div>
      <button
        type="button"
        onClick={generateCharacter}
        className="wireframe-button mb-4"
        disabled={isLoading}
      >
        Generate Random Character
      </button>
      <form onSubmit={handleSubmit} className="wireframe-section">
        {renderInput()}
        <button type="submit" className="wireframe-button" disabled={isLoading}>
          {currentStep < steps.length - 1 ? 'Next Step' : 'Finish Character Creation'}
        </button>
      </form>
    </div>
  );
}
