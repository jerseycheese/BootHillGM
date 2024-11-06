'use client';

import React from 'react';
import { LoadingScreen } from '../GameArea/LoadingScreen';

interface CharacterCreationFormProps {
  step: {
    title: string;
    step: number;
  };
  aiPrompt: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isProcessing: boolean;
  userResponse: string;
  error?: string;
  isGeneratingField: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateField: () => Promise<void>;
}

/**
 * Form component for character creation steps.
 * Displays current step information, handles input,
 * and provides field generation capability.
 */
export function CharacterCreationForm({
  step,
  aiPrompt,
  onSubmit,
  isProcessing,
  userResponse,
  error,
  isGeneratingField,
  onInputChange,
  onGenerateField
}: CharacterCreationFormProps) {
  return (
    <>
      <div className="wireframe-section relative">
        <p className="wireframe-text mb-4">Step {step.step}: {step.title}</p>
        <p className="wireframe-text">{aiPrompt}</p>
      </div>
      <form onSubmit={onSubmit} className="wireframe-section" data-testid="character-creation-form">
        <div>
          <label htmlFor="userResponse" className="block mb-2">Your Response:</label>
          <div className="relative flex space-x-2">
            <input
              type="text"
              id="userResponse"
              value={userResponse}
              onChange={onInputChange}
              className="wireframe-input flex-1"
              required
            />
            <button
              type="button"
              onClick={onGenerateField}
              className="wireframe-button"
              disabled={isGeneratingField}
            >
              {isGeneratingField ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <LoadingScreen 
                message="Processing..."
                size="small"
                fullscreen={false}
              />
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="wireframe-button" disabled={isProcessing}>
            Next Step
          </button>
        </div>
      </form>
    </>
  );
}
