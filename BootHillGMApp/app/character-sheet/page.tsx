'use client';

import { useEffect } from 'react';
import { useGame } from '../utils/gameEngine';
import { useCampaignState } from '../components/CampaignStateManager';
import { debugStorage } from '../utils/debugHelpers';
import { Wound } from '../types/wound';

export default function CharacterSheet() {
  const { state, dispatch } = useGame();
  const { loadGame, saveGame } = useCampaignState();
  const { character } = state;

  useEffect(() => {
    // Debug current state
    console.log('Current game state:', state);
    console.log('Character data:', character);
    debugStorage();

    // Try to load game if character is not present
    if (!character) {
      // First try to load from campaign state
      const loadedState = loadGame();
      console.log('Loaded campaign state:', loadedState);

      // If no campaign state, check for last created character
      if (!loadedState?.character && typeof window !== 'undefined') {
        const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
        if (lastCharacterJSON) {
          try {
            const lastCharacter = JSON.parse(lastCharacterJSON);
            console.log('Found last created character:', lastCharacter);

            // Create a new game state with this character
            const newState = {
              ...state,
              character: lastCharacter,
              savedTimestamp: Date.now()
            };

            // Save and update the state
            saveGame(newState);
            dispatch({ type: 'SET_STATE', payload: newState });
          } catch (error) {
            console.error('Error loading last created character:', error);
          }
        }
      }
    }
  }, [character, loadGame, saveGame, dispatch, state]);

  if (!character) {
    return (
      <div className="wireframe-container">
        <div>No character found. Please create a character first.</div>
        <div className="text-sm text-gray-500 mt-4">
          Debug info: Check browser console for state information
        </div>
      </div>
    );
  }

  const renderWound = (wound: Wound) => (
    <li key={`${wound.location}-${wound.severity}`} className="wireframe-text">
      {wound.location.charAt(0).toUpperCase() + wound.location.slice(1)}: {wound.severity} ({wound.strengthReduction})
    </li>
  );


  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Character Sheet</h1>
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Name: {character.name}</h2>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Attributes</h3>
        <ul className="wireframe-list">
          {Object.entries(character.attributes).map(([key, value]) => (
            <li key={key} className="wireframe-text">
              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Skills</h3>
        <ul className="wireframe-list">
          {Object.entries(character.skills).map(([key, value]) => (
            <li key={key} className="wireframe-text">
              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
            </li>
          ))}
        </ul>
      </div>
      {character.wounds && character.wounds.length > 0 && (
        <div className="wireframe-section">
          <h3 className="wireframe-subtitle">Wounds</h3>
          <ul className="wireframe-list">
            {character.wounds.map(renderWound)}
          </ul>
        </div>
      )}
    </div>
  );
}
