import { CombatParticipant } from '../../types/combat';

interface WeaponDisplayProps {
  participant?: CombatParticipant;
  isPlayer?: boolean;
}

/**
 * WeaponDisplay Component
 * 
 * Renders a weapon's status with key attributes
 */
export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({ participant, isPlayer }) => {
  if (!participant) {
    return (
      <div className="text-sm text-gray-500">
        <p>No participant data</p>
      </div>
    );
  }

  const weapon = participant.weapon;
  
  if (!weapon) {
    return (
      <div className="text-sm text-gray-500">
        <p>No weapon equipped</p>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">{weapon.name}</p>
        {isPlayer && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {participant.isNPC ? 'NPC' : 'Player'}
          </span>
        )}
      </div>
      
      {weapon.modifiers && (
        <div className="mt-2 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Damage</p>
              <p>{weapon.modifiers.damage}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Range</p>
              <p>{weapon.modifiers.range}y</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Accuracy</p>
              <p>{weapon.modifiers.accuracy > 0 ? `+${weapon.modifiers.accuracy}` : weapon.modifiers.accuracy}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Speed</p>
              <p>{weapon.modifiers.speed}</p>
            </div>
          </div>
          
          {'ammunition' in weapon && 'maxAmmunition' in weapon && (
            <div>
              <p className="text-xs text-gray-500">Ammunition</p>
              <p>{weapon.ammunition}/{weapon.maxAmmunition}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
