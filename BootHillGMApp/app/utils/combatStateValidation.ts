import { CombatState } from '../types/combat';
import { ValidationResult, ValidationError } from '../types/combat';

type PartialNullableCombatState = {
  [K in keyof CombatState]: K extends 'winner' ? 'player' | 'opponent' | null : CombatState[K];
};

export function validateCombatEndState(state: CombatState): ValidationResult {
  const errors: ValidationError[] = [];
  const allowedProperties = ['isActive', 'combatType', 'winner', 'participants', 'rounds', 'combatLog'];
  const cleanedState = {} as PartialNullableCombatState;

  // Validate required properties
  if (!state.combatType) {
    errors.push({
      code: 'MISSING_PROPERTY',
      message: 'Missing required property: combatType',
      property: 'combatType',
    });
  }

  if (state.combatType !== 'brawling' && state.combatType !== 'weapon' && state.combatType !== null) {
    errors.push({
      code: 'INVALID_VALUE',
      message: 'Invalid value for combatType',
      property: 'combatType',
      expected: 'brawling | weapon | null',
      actual: state.combatType as string
    });
  }

  if (state.combatType === 'brawling' && !state.brawling) {
    errors.push({
      code: 'MISSING_PROPERTY',
      message: 'Missing required property: brawling state for brawling combat',
      property: 'brawling'
    });
  }

  if (state.combatType === 'weapon' && !state.weapon) {
    errors.push({
      code: 'MISSING_PROPERTY',
      message: 'Missing required property: weapon state for weapon combat',
      property: 'weapon'
    });
  }

  if (state.brawling) {
    if (!state.brawling.playerCharacterId) {
      errors.push({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: playerCharacterId in brawling state',
        property: 'brawling.playerCharacterId'
      });
    }
    if (!state.brawling.opponentCharacterId) {
      errors.push({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: opponentCharacterId in brawling state',
        property: 'brawling.opponentCharacterId'
      });
    }
  }

  if (state.weapon) {
    if (!state.weapon.playerCharacterId) {
      errors.push({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: playerCharacterId in weapon state',
        property: 'weapon.playerCharacterId'
      });
    }
    if (!state.weapon.opponentCharacterId) {
      errors.push({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: opponentCharacterId in weapon state',
        property: 'weapon.opponentCharacterId'
      });
    }
  }

  if (!state.participants) {
    errors.push({
      code: 'MISSING_PROPERTY',
      message: 'Missing required property: participants',
      property: 'participants'
    });
  }

  if (typeof state.rounds !== 'number' || state.rounds < 0) {
    errors.push({
      code: 'INVALID_VALUE',
      message: 'Invalid value for rounds',
      property: 'rounds',
      expected: 'number >= 0',
      actual: state.rounds
    });
  }

  if (!Array.isArray(state.combatLog)) {
    errors.push({
      code: 'INVALID_VALUE',
      message: 'Invalid value for combatLog',
      property: 'combatLog',
      expected: 'array',
      actual: typeof state.combatLog
    });
  }

  // Clean up properties
  for (const key in state) {
    if (allowedProperties.includes(key)) {
      (cleanedState as Record<string, unknown>)[key] = state[key as keyof CombatState];
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedState: errors.length === 0 ? cleanedState as CombatState : undefined,
  };
}