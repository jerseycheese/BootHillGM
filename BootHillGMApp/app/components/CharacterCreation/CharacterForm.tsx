import React, { useState, useCallback } from 'react';
import { Character } from '../../types/character';

interface AttributeField {
  key: keyof Character['attributes'] | 'name';
  title: string;
  description: string;
  min?: number;
  max?: number;
}

interface CharacterFormProps {
  character: Character;
  isGeneratingField: boolean;
  error?: string;
  onFieldChange: (field: keyof Character['attributes'] | 'name', value: string | number) => void;
  onGenerateField: (field: keyof Character['attributes'] | 'name') => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  generateCharacter: () => Promise<void>;
  isGeneratingCharacter: boolean;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  isGeneratingField,
  error,
  onFieldChange,
  onGenerateField,
  onSubmit,
  generateCharacter,
  isGeneratingCharacter
}) => {
  const [generatingField, setGeneratingField] = useState<keyof Character['attributes'] | 'name' | null>(null);

  const attributeFields: AttributeField[] = Object.keys(character.attributes).map(key => {
    const typedKey = key as keyof Character['attributes'];
    let title = '';
    let description = '';
    switch (typedKey) {
      case 'speed':
        title = 'Speed';
        description = 'Your character\'s movement and reaction capability';
        break;
      case 'gunAccuracy':
        title = 'Gun Accuracy';
        description = 'Your character\'s accuracy with firearms';
        break;
      case 'throwingAccuracy':
        title = 'Throwing Accuracy';
        description = 'Your character\'s accuracy with thrown weapons';
        break;
      case 'strength':
        title = 'Strength';
        description = 'Your character\'s current strength (affected by wounds)';
        break;
      case 'baseStrength':
        title = 'Base Strength';
        description = 'Your character\'s maximum strength';
        break;
      case 'bravery':
        title = 'Bravery';
        description = 'Your character\'s courage under fire';
        break;
      case 'experience':
        title = 'Experience';
        description = 'Your character\'s combat experience';
        break;
    }
    return {
      key: typedKey,
      title,
      description,
      min: character.minAttributes[typedKey],
      max: character.maxAttributes[typedKey],
    };
  });

  const fields: AttributeField[] = [
    { key: 'name', title: 'Name', description: 'Your character\'s full name' },
    ...attributeFields
  ];


  const handleGenerateField = useCallback(async (field: keyof Character['attributes'] | 'name') => {
    setGeneratingField(field);
    await onGenerateField(field);
    setGeneratingField(null);
  }, [onGenerateField]);

  // Create a wrapper function for the Review Summary button
  const handleReviewSummary = useCallback(() => {
    onSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, [onSubmit]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <button
          type="button"
          onClick={generateCharacter}
          className={`wireframe-button ${isGeneratingCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isGeneratingCharacter}
          data-testid="generate-character-button"
        >
          Generate Random Character
        </button>
        <button
          type="button"
          onClick={handleReviewSummary}
          className="wireframe-button"
          disabled={isGeneratingField}
          data-testid="view-summary-button"
        >
          Review Character Summary
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-6" data-testid="character-form" id="character-form">
        <div className="grid grid-cols-1 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor={field.key} className="block font-medium">
                  {field.title}
                  {field.min !== undefined && field.max !== undefined && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({field.min}-{field.max})
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => handleGenerateField(field.key)}
                  className="wireframe-button text-sm"
                  disabled={isGeneratingField || generatingField === field.key}
                  data-testid={`generate-${field.key}-button`}
                >
                  {generatingField === field.key ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <input
                type={field.min !== undefined ? 'number' : 'text'}
                id={field.key}
                name={field.key}
                value={field.key === 'name' ?
                  character.name :
                  character.attributes[field.key as keyof Character['attributes']] ?? ''
                }
                onChange={(e) => onFieldChange(field.key, e.target.value)}
                min={field.min}
                max={field.max}
                className="wireframe-input w-full"
                required
                data-testid={`${field.key}-input`}
              />
              <p className="text-sm text-gray-600">{field.description}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600 mt-2" role="alert" data-testid="error-message">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};
