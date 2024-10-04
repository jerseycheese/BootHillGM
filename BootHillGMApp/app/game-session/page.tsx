'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getAIResponse } from '../utils/aiService';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state } = useGame();
  const [narrative, setNarrative] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect to character creation if no character exists
    if (!state.character) {
      router.push('/character-creation');
    } else {
      // Initialize the game session with an AI-generated narrative
      (async () => {
        setIsLoading(true);
        const initialNarrative = await getAIResponse(`You are a Game Master for a Western-themed RPG. The player's character is named ${state.character?.name}. Provide a brief introduction to the game world and the character's current situation.`);
        setNarrative(initialNarrative);
        setIsLoading(false);
      })();
    }
  }, [state.character, router]);

  // Handle user input and generate AI response
  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    const aiResponse = await getAIResponse(`The player says: "${userInput}". Respond as the Game Master, describing the results of the player's action and advancing the story.`);
    setNarrative(prev => `${prev}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}`);
    setUserInput('');
    setIsLoading(false);
  };

  if (!state.character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Character: {state.character.name}</h2>
        {/* Add more character info here */}
      </div>
      {/* Narrative display area */}
      <div className="wireframe-section h-64 overflow-y-auto">
        <pre className="wireframe-text whitespace-pre-wrap">{narrative}</pre>
      </div>
      {/* User input form */}
      <form onSubmit={handleUserInput} className="wireframe-section">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="wireframe-input"
          placeholder="Enter your action..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="wireframe-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}