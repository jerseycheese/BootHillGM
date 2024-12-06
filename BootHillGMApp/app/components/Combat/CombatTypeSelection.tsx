import React from 'react';
import { Character } from '../../types/character';
import { CombatType } from '../../types/combat';
import { useCampaignState } from '../CampaignStateManager';
import { getOpponentWeapon } from '../../utils/weaponUtils';
import { cleanCharacterName } from '../../utils/textCleaningUtils';

interface CombatTypeSelectionProps {
  playerCharacter: Character;
  opponent: Character;
  onSelectType: (type: CombatType) => void;
}

/**
 * Displays combat type selection UI with available weapons for both player and opponent.
 * Shows brawling and weapon combat options based on availability.
 */
export const CombatTypeSelection: React.FC<CombatTypeSelectionProps> = ({
  opponent,
  onSelectType
}) => {
  const { state } = useCampaignState();
  // Brawling is always available as a combat option
  const canUseBrawling = true;
  // Check if either combatant has weapons available
  const hasWeaponInInventory = state.inventory?.some(item => item.category === 'weapon');
  const opponentHasWeapon = Boolean(opponent.weapon);
  const canUseWeapons = hasWeaponInInventory || opponentHasWeapon;

  return (
    <div className="combat-type-selection wireframe-section space-y-4">
      <h3 className="text-lg font-bold">Choose Combat Type</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {canUseBrawling && (
          <button
            onClick={() => onSelectType('brawling')}
            className="wireframe-button p-4"
          >
            Brawling
            <span className="block text-sm mt-1">
              Engage in hand-to-hand combat
            </span>
          </button>
        )}
        
        <button
          onClick={() => onSelectType('weapon')}
          className="wireframe-button p-4"
          disabled={!canUseWeapons}
          aria-disabled={!canUseWeapons}
        >
          Weapon Combat
          <span className="block text-sm mt-1">
            {canUseWeapons 
              ? 'Fight using available weapons'
              : 'No weapons available for combat'}
          </span>
        </button>
      </div>

      {/* Display available weapons if any */}
      {canUseWeapons && (
        <div className="mt-4 text-sm">
          <p>Available Weapons:</p>
          <ul className="list-disc pl-5">
            {state.inventory
              .filter(item => item.category === 'weapon')
              .map(weapon => (
                <li key={weapon.id}>You: {weapon.name}</li>
              ))
            }
            <li>{cleanCharacterName(opponent.name)}: {getOpponentWeapon(opponent).name}</li>
          </ul>
        </div>
      )}
    </div>
  );
};
