import React, { useState } from 'react';
import { WeaponCombatState, WeaponCombatAction, calculateWeaponModifier, rollForMalfunction, parseWeaponDamage, Weapon } from '../../types/combat';
import { calculateRangeModifier } from '../../utils/bootHillCombat';

interface WeaponCombatControlsProps {
  isProcessing: boolean;
  currentState: WeaponCombatState;
  onAction: (action: WeaponCombatAction) => void;
  canAim: boolean;
  canFire: boolean;
  canReload: boolean;
}

export const WeaponCombatControls: React.FC<WeaponCombatControlsProps> = ({
  isProcessing,
  currentState,
  onAction,
  canAim,
  canFire,
  canReload
}) => {
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [targetRange, setTargetRange] = useState(currentState.currentRange);

  const handleFire = () => {
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
      damage: parseWeaponDamage(currentState.playerWeapon.modifiers.damage)
    });
  };

  const handleMove = () => {
    const rangeModifier = currentState.playerWeapon ? 
      calculateWeaponModifier(currentState.playerWeapon, targetRange, false) :
      0;

    onAction({
      type: 'move',
      targetRange,
      modifier: rangeModifier
    });
    setShowMoveOptions(false);
  };

  return (
    <div className="weapon-combat-controls space-y-4">
      <div className="current-weapons p-2 bg-gray-100 rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Your Weapon</h4>
            {currentState.playerWeapon ? (
              <WeaponDisplay weapon={currentState.playerWeapon} />
            ) : (
              <p className="text-red-600">No weapon equipped</p>
            )}
          </div>
          <div>
            <h4 className="font-medium">Opponent&#39;s Weapon</h4>
            {currentState.opponentWeapon ? (
              <WeaponDisplay weapon={currentState.opponentWeapon} />
            ) : (
              <p className="text-gray-600">No visible weapon</p>
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
          onClick={() => onAction({ type: 'aim' })}
          disabled={isProcessing || !canAim}
          className={`wireframe-button ${(!canAim || isProcessing) ? 'opacity-50' : ''}`}
        >
          Aim
        </button>
        <button
          onClick={handleFire}
          disabled={isProcessing || !canFire || currentState.lastAction === 'malfunction'}
          className={`wireframe-button ${(!canFire || isProcessing || currentState.lastAction === 'malfunction') ? 'opacity-50' : ''}`}
        >
          Fire
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAction({ type: 'reload' })}
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

const WeaponDisplay: React.FC<{ weapon: Weapon }> = ({ weapon }) => (
  <div className="text-sm">
    <p className="font-medium">{weapon.name}</p>
    {weapon.modifiers ? (
      <>
        <p>Damage: {weapon.modifiers.damage}</p>
        <p>Range: {weapon.modifiers.range}y</p>
        <p>Accuracy: {weapon.modifiers.accuracy > 0 ? `+${weapon.modifiers.accuracy}` : weapon.modifiers.accuracy}</p>
        <p>Reliability: {weapon.modifiers.reliability}%</p>
        {weapon.ammunition !== undefined && (
          <p>Ammo: {weapon.ammunition}/{weapon.maxAmmunition}</p>
        )}
      </>
    ) : (
      <p>Basic weapon</p>
    )}
  </div>
);
