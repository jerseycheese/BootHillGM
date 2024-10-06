// app/game-session/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [currentLocation, setCurrentLocation] = useState('');
  const narrativeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGameSession = async () => {
      setIsLoading(true);
      // Request an initial narrative and location from the AI
      const { narrative: initialNarrative, location } = await getAIResponse(
        `You are a Game Master for a Western-themed RPG. The player's character is named ${state.character?.name}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a description of their current location and some potential options for action. 
        Make it clear that these are just suggestions and the player can choose to do anything they want. 
        After your narrative, on a new line, write "LOCATION:" followed by a brief (2-5 words) description of the current location.`
      );
      setNarrative(initialNarrative);
      setCurrentLocation(location || 'Unknown');
      setIsLoading(false);
    };
  
    // Initialize the game session if a character exists, otherwise redirect to character creation
    if (!state.character) {
      router.push('/character-creation');
    } else {
      initializeGameSession();
    }
  }, [state.character, router]);

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    const { narrative: aiResponse, location } = await getAIResponse(
      `The player says: "${userInput}". Respond as the Game Master, describing the results of the player's action and advancing the story. 
      Remember that the game is open-ended and can handle any action the player chooses. 
      If the action involves using an item, pretend to update their inventory accordingly. 
      If combat occurs, describe it narratively without using a separate combat system. 
      If the location has changed, on a new line, write "LOCATION:" followed by a brief (2-5 words) description of the new location. 
      If the location hasn't changed, don't include a LOCATION line.`
    );
    
    setNarrative(prev => `${prev}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}`);
    if (location) setCurrentLocation(location);
    setUserInput('');
    setIsLoading(false);
  };

  const renderCharacterStatus = () => (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <p>Name: {state.character?.name}</p>
      <p>Location: {currentLocation}</p>
      <h3>Inventory (Placeholder):</h3>
      <ul>
        <li>Placeholder Item 1</li>
        <li>Placeholder Item 2</li>
      </ul>
      <p className="text-sm italic">Note: Inventory system is not yet implemented.</p>
    </div>
  );

  if (!state.character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      {renderCharacterStatus()}
      <div className="wireframe-section h-64 overflow-y-auto" ref={narrativeRef}>
        <pre className="wireframe-text whitespace-pre-wrap">{narrative}</pre>
      </div>
      <form onSubmit={handleUserInput} className="wireframe-section">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="wireframe-input"
          placeholder="What would you like to do? (The game is open-ended!)"
          disabled={isLoading}
        />
        <button type="submit" className="wireframe-button" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Take Action'}
        </button>
      </form>
    </div>
  );
}