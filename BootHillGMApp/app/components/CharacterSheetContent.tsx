'use client';

import { useGameInitialization } from '../hooks/useGameInitialization';
import { Wound } from '../types/wound';
import StatDisplay from '../components/StatDisplay';
import DerivedStatDisplay from '../components/DerivedStatDisplay';
import useCharacterStats from '../hooks/useCharacterStats';

/**
 * CharacterSheet component displays the character's attributes, derived stats, and wounds.
 * It loads character data from the game state and local storage if available.
 */
export default function CharacterSheetContent() {
  const { isClient, isInitializing } = useGameInitialization();
  // Use the correct state hook
  const { character, derivedStats } = useCharacterStats();

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
