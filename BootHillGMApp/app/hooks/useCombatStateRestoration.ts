import { useEffect } from 'react';
import { GameSessionProps } from '../components/GameArea/types';
import { Character } from '../types/character';
import { CombatState, ensureCombatState, NPC } from '../types/combat/types';

type GameSessionWithoutState = Omit<GameSessionProps, 'state'>;

interface CombatInitiator extends GameSessionWithoutState {
  initiateCombat: (
    opponent: Character,
    combatState?: Partial<CombatState>
  ) => void;
  onEquipWeapon: (itemId: string) => void;
  handlePlayerHealthChange: (characterType: 'player' | 'opponent', newStrength: number) => void;
}

/**
 * Hook to handle combat state restoration after page refreshes or navigation.
 * Ensures combat can resume exactly where it left off by:
 * - Restoring opponent data with proper type conversion
 * - Maintaining exact strength values and turn state
 * - Preserving combat log history and wounds
 */
export function useCombatStateRestoration(
    state: GameSessionProps['state'],
    gameSession: CombatInitiator | null
) {
    useEffect(() => {
        if (!state || !gameSession) return;

        const shouldRestoreCombat = state.isCombatActive &&
            state.opponent &&
            state.combatState &&
            !gameSession.isCombatActive;

        if (shouldRestoreCombat) {
            const restoredOpponent: Character = {
                isNPC: true,
                isPlayer: false,
                id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
                name: state.opponent?.name ?? '',
                inventory: state.opponent?.inventory ?? [],
                attributes: {
                    speed: state.opponent?.attributes?.speed ?? 5,
                    gunAccuracy: state.opponent?.attributes?.gunAccuracy ?? 5,
                    throwingAccuracy: state.opponent?.attributes?.throwingAccuracy ?? 5,
                    strength: state.opponent?.attributes?.strength ?? 5,
                    baseStrength: state.opponent?.attributes?.baseStrength ?? 5,
                    bravery: state.opponent?.attributes?.bravery ?? 5,
                    experience: state.opponent?.attributes?.experience ?? 5
                },
                weapon: state.opponent?.weapon ? {
                    id: state.opponent.weapon.id,
                    name: state.opponent.weapon.name,
                    modifiers: {
                        accuracy: state.opponent.weapon.modifiers.accuracy,
                        range: state.opponent.weapon.modifiers.range,
                        reliability: state.opponent.weapon.modifiers.reliability,
                        damage: state.opponent.weapon.modifiers.damage,
                        speed: state.opponent.weapon.modifiers.speed,
                        ammunition: state.opponent.weapon.ammunition,
                        maxAmmunition: state.opponent.weapon.maxAmmunition
                    },
                } : undefined,
                wounds: state.opponent?.wounds ?? [],
                isUnconscious: state.opponent?.isUnconscious ?? false
            } as NPC;
            const ensuredCombatState = ensureCombatState({
                isActive: state.combatState?.isActive ?? false,
                combatType: state.combatState?.combatType ?? null,
                winner: (state.combatState?.winner === 'player' || state.combatState?.winner === 'opponent') ? state.combatState.winner : null,
                participants: state.combatState?.participants ?? [],
                rounds: state.combatState?.rounds ?? 0,
                combatLog: state.combatState?.combatLog ?? [],
                brawling: state.combatState?.brawling,
                weapon: state.combatState?.weapon,
                summary: state.combatState?.summary,
            });
            gameSession.initiateCombat(restoredOpponent, ensuredCombatState);
        }
    }, [
        gameSession,
        state,
        state?.isCombatActive,
        state?.opponent?.name,
        state?.combatState?.currentTurn,
        gameSession?.isCombatActive
    ]);
}
