import { Character } from '../types/character';
import { WeaponCombatState, WEAPON_STATS } from '../types/combat';
import { InventoryItem } from '../types/item.types';
import { getOpponentWeapon } from './weaponUtils';

export const initializeWeaponCombatState = (
  playerCharacter: Character,
  opponent: Character,
  initialState?: WeaponCombatState
): WeaponCombatState => {
  if (initialState) return initialState;

  // Find first available weapon in inventory
  // First check if inventory is an array (old format) or an object with items property (new format)
  const availableWeapon = (() => {
    // Check if inventory property exists
    if (!playerCharacter.inventory) {
      return null;
    }

    // Check if inventory is in new format
    if (typeof playerCharacter.inventory === 'object' && 'items' in playerCharacter.inventory && Array.isArray(playerCharacter.inventory.items)) {
      return playerCharacter.inventory.items.find((item: InventoryItem) => 
        item.category === 'weapon' && item.quantity > 0
      );
    }
    
    // Check if inventory is an array (old format)
    if (Array.isArray(playerCharacter.inventory)) {
      return playerCharacter.inventory.find((item: InventoryItem) => 
        item.category === 'weapon' && item.quantity > 0
      );
    }
    
    // Default fallback
    return null;
  })() || {
    id: 'default-colt',
    name: 'Colt Revolver',
    quantity: 1,
    category: 'weapon' as const,
    description: 'Standard issue Colt revolver'
  };

  // Create weapon object
  const playerWeapon = {
    id: availableWeapon.id,
    name: availableWeapon.name,
    modifiers: WEAPON_STATS[availableWeapon.name] || WEAPON_STATS['Colt Revolver'],
    ammunition: 6,
    maxAmmunition: 6
  };

  // Create opponent weapon
  const opponentWeapon = getOpponentWeapon(opponent);

  return {
    round: 1,
    playerWeapon,
    opponentWeapon,
    currentRange: 15,
    playerCharacterId: playerCharacter.id, // Use character references
    opponentCharacterId: opponent.id,       // Use character references
    roundLog: [],
    lastAction: undefined,
    // No more strength values here
    // playerStrength: playerCharacter.attributes.strength,
    // playerBaseStrength: playerCharacter.attributes.strength,
    // opponentStrength: opponent.attributes.strength,
    // opponentBaseStrength: opponent.attributes.strength,
  };
};
