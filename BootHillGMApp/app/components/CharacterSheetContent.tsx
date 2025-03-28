'use client';

import { useEffect } from 'react';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useGame } from '../hooks/useGame';
import { useCampaignState } from '../components/CampaignStateManager';
import { Wound } from '../types/wound';
import { Character } from '../types/character';
import StatDisplay from '../components/StatDisplay';
import DerivedStatDisplay from '../components/DerivedStatDisplay';
import useCharacterStats from '../hooks/useCharacterStats';

/**
 * CharacterSheet component displays the character's attributes, derived stats, and wounds.
 * It loads character data from the game state and local storage if available.
 */
export default function CharacterSheetContent() {
  const { isClient, isInitializing } = useGameInitialization();
  const { state, dispatch } = useGame();
  const { loadGame, saveGame } = useCampaignState();
  const { character, derivedStats, setCharacter } = useCharacterStats();

  useEffect(() => {
    // Only run on client and when character is not present
    if (isClient && !character) {
      // First try to load from campaign state
      const loadedState = loadGame();

      // If no campaign state, check for last created character
      if (!loadedState?.character && typeof window !== 'undefined') {
        const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
        if (lastCharacterJSON) {
          try {
            const lastCharacter = JSON.parse(lastCharacterJSON);

            // Create a new game state with this character
            const newState = {
              ...state,
              character: lastCharacter,
              savedTimestamp: Date.now(),
            };

            // Save and update the state
            saveGame(newState);
            dispatch({ type: 'SET_STATE', payload: newState });
            setCharacter(lastCharacter);
          } catch (error) {
            console.error("Error parsing character from local storage:", error);
          }
        }
      } else if (loadedState?.character) {
        setCharacter(loadedState.character as unknown as Character);
      }
    }
  }, [isClient, character, loadGame, saveGame, dispatch, state, setCharacter]);

  if (!isClient || isInitializing || !character) {
    return (
      <div className="wireframe-container">
        <div>Loading...</div>
      </div>
    );
  }

  const renderWound = (wound: Wound) => (
    <li key={`${wound.location}-${wound.severity}`} className="wireframe-text">
      {wound.location.charAt(0).toUpperCase() + wound.location.slice(1)}:{' '}
      {wound.severity} ({wound.strengthReduction})
    </li>
  );

  return (
    <div id="bhgmCharacterSheetContent" data-testid="character-sheet-content" className="wireframe-container bhgm-character-sheet-content">
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Name: {character.name}</h2>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Attributes</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay label="Speed" value={character.attributes.speed} />
          <StatDisplay
            label="Gun Accuracy"
            value={character.attributes.gunAccuracy}
          />
          <StatDisplay
            label="Throwing Accuracy"
            value={character.attributes.throwingAccuracy}
          />
          <StatDisplay label="Strength" value={character.attributes.strength} />
          <StatDisplay
            label="Base Strength"
            value={character.attributes.baseStrength}
          />
          <StatDisplay label="Bravery" value={character.attributes.bravery} />
          <StatDisplay
            label="Experience"
            value={character.attributes.experience}
          />
        </div>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Derived Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <DerivedStatDisplay
            label="Hit Points"
            value={derivedStats.hitPoints}
            description="Calculated from Base Strength"
          />
        </div>
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
