import React from 'react';

// Define interfaces for character data structure
interface CharacterAttributes {
  speed: number;
  gunAccuracy: number;
  throwingAccuracy: number;
  strength: number;
  baseStrength: number;
  bravery: number;
  experience: number;
}

interface Wound {
  location: string;
  severity: string;
  strengthReduction: number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  // Add other properties as needed
}

// Define an interface for character data
interface CharacterData {
  id: string;
  name: string;
  isNPC: boolean;
  isPlayer: boolean;
  inventory: InventoryItem[];
  minAttributes: CharacterAttributes;
  maxAttributes: CharacterAttributes;
  attributes: CharacterAttributes;
  wounds: Wound[];
  isUnconscious: boolean;
}

// Create a simple stub for the CharacterSheetContent component
const CharacterSheetStub = ({ character }: { character?: CharacterData }) => {
  const displayCharacter = character || mockCharacter;
  
  return (
    <div className="wireframe-container bhgm-character-sheet-content">
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Name: {displayCharacter.name}</h2>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Attributes</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="wireframe-stat">
            <span>Speed:</span> <span>{displayCharacter.attributes.speed}</span>
          </div>
          <div className="wireframe-stat">
            <span>Gun Accuracy:</span> <span>{displayCharacter.attributes.gunAccuracy}</span>
          </div>
          <div className="wireframe-stat">
            <span>Throwing Accuracy:</span> <span>{displayCharacter.attributes.throwingAccuracy}</span>
          </div>
          <div className="wireframe-stat">
            <span>Strength:</span> <span>{displayCharacter.attributes.strength}</span>
          </div>
          <div className="wireframe-stat">
            <span>Base Strength:</span> <span>{displayCharacter.attributes.baseStrength}</span>
          </div>
          <div className="wireframe-stat">
            <span>Bravery:</span> <span>{displayCharacter.attributes.bravery}</span>
          </div>
          <div className="wireframe-stat">
            <span>Experience:</span> <span>{displayCharacter.attributes.experience}</span>
          </div>
        </div>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Derived Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="wireframe-stat">
            <span>Hit Points:</span> <span>{displayCharacter.attributes.baseStrength}</span>
          </div>
        </div>
      </div>
      {displayCharacter.wounds && displayCharacter.wounds.length > 0 && (
        <div className="wireframe-section">
          <h3 className="wireframe-subtitle">Wounds</h3>
          <ul className="wireframe-list">
            {displayCharacter.wounds.map((wound, index) => (
              <li key={index} className="wireframe-text">
                {wound.location.charAt(0).toUpperCase() + wound.location.slice(1)}:{' '}
                {wound.severity} ({wound.strengthReduction})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Mock character data - this is our placeholder content
const mockCharacter: CharacterData = {
  id: 'mock-character-1',
  name: 'Sheriff Johnson',
  isNPC: false,
  isPlayer: true,
  inventory: [],
  minAttributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 1,
    baseStrength: 8,
    bravery: 1,
    experience: 0
  },
  maxAttributes: {
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 20,
    baseStrength: 20,
    bravery: 10,
    experience: 11
  },
  attributes: {
    speed: 10,
    gunAccuracy: 12,
    throwingAccuracy: 8,
    strength: 14,
    baseStrength: 14,
    bravery: 10,
    experience: 5
  },
  wounds: [],
  isUnconscious: false
};

// Mock character with wounds
const mockCharacterWithWounds: CharacterData = {
  ...mockCharacter,
  wounds: [
    { location: 'arm', severity: 'light', strengthReduction: 1 },
    { location: 'leg', severity: 'moderate', strengthReduction: 2 }
  ]
};

// Create metadata object for Storybook
const meta = {
  title: 'Character/CharacterSheet',
  component: CharacterSheetStub,
  parameters: {
    // Required for Next.js App Router compatibility
    nextjs: {
      appDirectory: true,
    },
    // Use fullscreen layout
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    character: {
      control: 'object',
      description: 'Character data'
    }
  }
};

export default meta;

// Default state with a character
export const Default = {
  args: {
    character: mockCharacter
  }
};

// Character with wounds
export const WithWounds = {
  args: {
    character: mockCharacterWithWounds
  }
};

// Loading state (no character)
export const Loading = {
  args: {
    character: null
  }
};

// Experienced character
export const ExperiencedCharacter = {
  args: {
    character: {
      ...mockCharacter,
      name: 'Wild Bill',
      attributes: {
        ...mockCharacter.attributes,
        gunAccuracy: 18,
        experience: 15,
        strength: 16
      }
    }
  }
};