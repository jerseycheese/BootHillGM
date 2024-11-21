import React, { useState } from 'react';
import { WeaponStats, WeaponCombatAction, WeaponCombatState } from '../../types/combat';

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

  const handleMove = () => {
    onAction({
      type: 'move',
      targetRange
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

      <div className="range-indicator text-center p-2">
        Range: {currentState.currentRange} yards
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
          onClick={() => onAction({ type: 'fire' })}
          disabled={isProcessing || !canFire}
          className={`wireframe-button ${(!canFire || isProcessing) ? 'opacity-50' : ''}`}
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

const WeaponDisplay: React.FC<{ weapon: { name: string; stats: WeaponStats } }> = ({ weapon }) => (
  <div className="text-sm">
    <p className="font-medium">{weapon.name}</p>
    <p>Damage: {weapon.stats.damage}</p>
    <p>Range: {weapon.stats.range}y</p>
    <p>Speed: {weapon.stats.speed > 0 ? '+' : ''}{weapon.stats.speed}</p>
  </div>
);
