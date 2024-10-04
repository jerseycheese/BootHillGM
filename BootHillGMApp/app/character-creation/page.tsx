'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getCharacterCreationStep, getAttributeDescription, validateAttributeValue } from '../utils/aiService';

// TODO: Add a button to generate a complete character for quicker testing
// TODO: Add a button to generate a value for the current field in each step
// TODO: Remove all non-layout CSS rules while working out MVP functionality

// Define the structure of a character based on Boot Hill RPG rules
interface Character {
  name: string;
  attributes: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    bravery: number;
    experience: number;
  };
  skills: {
    shooting: number;
    riding: number;
    brawling: number;
  };
}

// Initial character state with default values
const initialCharacter: Character = {
  name: '',
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

export default function CharacterCreation() {
  const router = useRouter();
  const { dispatch } = useGame();
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [attributeDescription, setAttributeDescription] = useState('');
  const [error, setError] = useState('');

  // Memoize steps to prevent unnecessary re-renders
  const steps = useMemo(() => [
    { key: 'name', type: 'string' },
    ...Object.keys(character.attributes).map(attr => ({ key: attr, type: 'number' })),
    ...Object.keys(character.skills).map(skill => ({ key: skill, type: 'number' })),
    { key: 'summary', type: 'review' }
  ], [character.attributes, character.skills]);

  // Fetch AI-generated prompts for each character creation step
  const getNextAIPrompt = useCallback(async () => {
    try {
      if (steps[currentStep].key === 'summary') {
        setAiPrompt("Review your character details below. If you're satisfied, click 'Finish' to create your character.");
      } else {
        const prompt = await getCharacterCreationStep(currentStep, steps[currentStep].key);
        setAiPrompt(prompt);
        if (steps[currentStep].type === 'number') {
          const description = await getAttributeDescription(steps[currentStep].key);
          setAttributeDescription(description);
        } else {
          setAttributeDescription('');
        }
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
    if (isLoading) {
      getNextAIPrompt();
    }
  }, [currentStep, isLoading, getNextAIPrompt]);

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
    dispatch({ type: 'SET_CHARACTER', payload: character });
    router.push('/game-session');
  };

  // Render input field or character summary based on current step
  const renderInput = () => {
    const { type } = steps[currentStep];
    if (type === 'review') {
      return (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Character Summary</h2>
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
    return (
      <div>
        <label htmlFor="userResponse" className="block mb-2">Your Response:</label>
        <input
          type={type}
          id="userResponse"
          value={userResponse}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        {attributeDescription && (
          <p className="mt-2 text-sm text-gray-600">{attributeDescription}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Render the character creation form
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Character</h1>
      <div className="mb-4">
        <p className="font-bold">Step {currentStep + 1}: {steps[currentStep].key}</p>
        {isLoading ? <p>Loading...</p> : <p>{aiPrompt}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderInput()}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
          {currentStep < steps.length - 1 ? 'Next Step' : 'Finish Character Creation'}
        </button>
      </form>
    </div>
  );
}