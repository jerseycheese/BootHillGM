import React from 'react';
import { Character } from '../../types/character';
import { CombatType } from '../../types/combat';
import { useInventoryItems } from '../../hooks/stateSelectors';

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
  playerCharacter,
  opponent,
  onSelectType
}) => {
  // Use the inventory selector hook for weapons check
  const inventoryItems = useInventoryItems();
  
  // Brawling is always available as a combat option
  const canUseBrawling = true;
  
  // Check if either combatant has weapons available
  const hasWeaponInInventory = inventoryItems.some(item => item.category === 'weapon');
  
  // Check if weapons are directly on the character
  const playerHasWeapon = Boolean(playerCharacter.weapon);
  const opponentHasWeapon = Boolean(opponent.weapon);
  
  const canUseWeapons = hasWeaponInInventory || playerHasWeapon || opponentHasWeapon;
  
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
    </div>
  );
};
