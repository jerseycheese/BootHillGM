import React, { useState } from 'react';
import {
  WeaponCombatState,
  WeaponCombatAction,
  calculateWeaponModifier,
  rollForMalfunction,
  parseWeaponDamage,
} from '../../types/combat';
import { calculateRangeModifier } from '../../utils/bootHillCombat';
import { WeaponDisplay } from './WeaponDisplay';
import { Character } from '../../types/character';

/**
 * Props for WeaponCombatControls component
 * 
 * @property isProcessing - Indicates if a combat action is currently being processed
 * @property currentState - The current state of weapon combat
 * @property onAction - Callback function triggered when a combat action is performed
 * @property canAim - Indicates if the aim action is currently available
 * @property canFire - Indicates if the fire action is currently available
 * @property canReload - Indicates if the reload action is currently available
 */
interface WeaponCombatControlsProps {
  isProcessing: boolean;
  currentState: WeaponCombatState;
  onAction: (action: WeaponCombatAction) => void;
  canAim: boolean;
  canFire: boolean;
  canReload: boolean;
  opponent: Character; // Add opponent prop
}

/**
 * WeaponCombatControls Component
 * 
 * Provides UI controls for weapon-based combat actions including:
 * - Aiming
 * - Firing
 * - Reloading
 * - Moving to adjust range
 * 
 * Displays current weapon status for both player and opponent,
 * and handles all weapon combat interactions.
 */
export const WeaponCombatControls: React.FC<WeaponCombatControlsProps> = ({
  isProcessing,
  currentState,
  onAction,
  canAim,
  canFire,
  canReload,
  opponent,
}) => {
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [targetRange, setTargetRange] = useState(currentState.currentRange);

  const handleFire = async () => {
    if (!canFire || !currentState.playerWeapon) return;

    const modifier = calculateWeaponModifier(
      currentState.playerWeapon,
      currentState.currentRange,
      currentState.lastAction === 'aim'
    );

    const malfunction = rollForMalfunction(currentState.playerWeapon);

    if (malfunction) {
      onAction({ type: 'malfunction' });
      return;
    }

    onAction({
      type: 'fire',
      modifier,
      damage: parseWeaponDamage(currentState.playerWeapon.modifiers.damage),
    });
  };

  const handleMove = async () => {
    const rangeModifier = currentState.playerWeapon
      ? calculateWeaponModifier(currentState.playerWeapon, targetRange, false)
      : 0;

    onAction({
      type: 'move',
      targetRange,
      modifier: rangeModifier,
    });
    setShowMoveOptions(false);
  };

  const handleAim = () => {
    onAction({ type: 'aim' });
  }

  const handleReload = () => {
    onAction({ type: 'reload' });
  }

  return (
    <div className="weapon-combat-controls space-y-4" data-testid="weapon-combat-controls">
      <div className="current-weapons p-2 bg-gray-100 rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Your Weapon</h4>
            {currentState.playerWeapon ? (
              <WeaponDisplay participant={{
                id: 'player',
                name: 'Player',
                isNPC: false,
                isPlayer: true,
                weapon: currentState.playerWeapon,
                attributes: {
                  strength: 0,
                  speed: 0,
                  gunAccuracy: 0,
                  throwingAccuracy: 0,
                  baseStrength: 0,
                  bravery: 0,
                  experience: 0
                },
                wounds: [],
                isUnconscious: false,
                inventory: []
              }} />
            ) : (
              <p className="text-red-600">No weapon equipped</p>
            )}
          </div>
          <div>
            <h4 className="font-medium">Opponent&#39;s Weapon</h4>
            {currentState.opponentWeapon && opponent ? (
              <WeaponDisplay participant={{
                id: 'opponent',
                name: 'Opponent',
                isNPC: true,
                isPlayer: false,
                weapon: currentState.opponentWeapon,
                wounds: [],
                isUnconscious: false,
                strength: opponent.attributes.strength,
                initialStrength: opponent.attributes.strength
              }} />
            ) : (
              <p className="text-red-600">No weapon equipped</p>
            )}
          </div>
        </div>
      </div>

      <div className="range-indicator text-center p-2 space-y-1">
        <div>Range: {currentState.currentRange} yards</div>
        {currentState.playerWeapon && (
          <div className="text-sm">
            <span className={`${calculateRangeModifier(currentState.playerWeapon, currentState.currentRange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Range Modifier: {calculateRangeModifier(currentState.playerWeapon, currentState.currentRange) > 0 ? '+' : ''}
              {calculateRangeModifier(currentState.playerWeapon, currentState.currentRange)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAim}
          disabled={isProcessing || !canAim}
          className={`wireframe-button ${(!canAim || isProcessing) ? 'opacity-50' : ''}`}
        >
          Aim
        </button>
        <button
          onClick={handleFire}
          disabled={
            isProcessing || !canFire || currentState.lastAction === 'malfunction'
          }
          className={`wireframe-button ${
            (!canFire || isProcessing || currentState.lastAction === 'malfunction') ? 'opacity-50' : ''
          }`}
        >
          Fire
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleReload}
          disabled={isProcessing || !canReload}
          className={`wireframe-button ${(!canReload || isProcessing) ? 'opacity-50' : ''}`}
        >
          Reload
        </button>
        <button
          onClick={() => setShowMoveOptions(!showMoveOptions)}
          disabled={isProcessing}
          className={`wireframe-button ${isProcessing ? 'opacity-50' : ''}`}
        >
          Move
        </button>
      </div>

      {showMoveOptions && (
        <div className="move-options p-2 bg-gray-100 rounded">
          <input
            type="range"
            min={1}
            max={50}
            value={targetRange}
            onChange={(e) => setTargetRange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <span>New range: {targetRange} yards</span>
            <button
              onClick={handleMove}
              className="wireframe-button"
              disabled={targetRange === currentState.currentRange}
            >
              Confirm Move
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
