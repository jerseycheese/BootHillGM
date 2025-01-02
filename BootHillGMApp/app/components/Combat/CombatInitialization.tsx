import { DefaultWeapons } from '../../data/defaultWeapons';
import { CombatParticipant } from '../../types/combat';

export function initializeCombatWeapons(participants: CombatParticipant[]): CombatParticipant[] {
  return participants.map(participant => {
    // Assign default weapon to NPCs without weapons
    if (participant.isNPC && !participant.weapon) {
      return {
        ...participant,
        weapon: {
          ...DefaultWeapons.coltRevolver,
          ammunition: DefaultWeapons.coltRevolver.modifiers.ammunition,
          maxAmmunition: DefaultWeapons.coltRevolver.modifiers.maxAmmunition
        }
      };
    }
    return participant;
  });
}

export function validateWeaponDisplay(participant: CombatParticipant): boolean {
  if (!participant.weapon) {
    console.warn(`Participant ${participant.name} has no weapon assigned`);
    return false;
  }
  
  // Validate weapon properties
  if (!participant.weapon.modifiers) {
    console.warn(`Participant ${participant.name} has invalid weapon configuration`);
    return false;
  }
  
  return true;
}

export function handleCombatInitialization(participants: CombatParticipant[]): CombatParticipant[] {
  const initializedParticipants = initializeCombatWeapons(participants);
  
  // Validate weapon display for all participants
  const validParticipants = initializedParticipants.filter(validateWeaponDisplay);
  
  if (validParticipants.length !== initializedParticipants.length) {
    console.warn('Some participants had invalid weapon configurations');
  }
  
  return validParticipants;
}
