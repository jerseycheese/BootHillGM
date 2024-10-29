/**
 * Handles player input during game sessions.
 * Manages input validation, loading states, and submission.
 * Disables input and shows feedback during processing.
 */
import React, { useState, useCallback } from 'react';
import { SuggestedAction } from '../types/campaign';

interface InputManagerProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  suggestedActions?: SuggestedAction[];
}

const InputManager: React.FC<InputManagerProps> = ({ 
  onSubmit, 
  isLoading, 
  suggestedActions = [] // Provide default empty array
}) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSubmit(userInput);
      setUserInput('');
    }
  }, [userInput, isLoading, onSubmit]);

  const handleSuggestedAction = useCallback((action: SuggestedAction) => {
    if (!isLoading) {
      onSubmit(action.text);
    }
  }, [isLoading, onSubmit]);

  return (
    <div className="wireframe-section space-y-4">
      {suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action, index) => (
            <button
              key={`${action.type}-${index}`}
              onClick={() => handleSuggestedAction(action)}
              disabled={isLoading}
              className={`px-3 py-1 text-sm rounded hover:bg-opacity-80 disabled:opacity-50 ${
                action.type === 'basic' ? 'bg-blue-500 text-white' :
                action.type === 'combat' ? 'bg-red-500 text-white' :
                'bg-green-500 text-white'
              }`}
              title={action.context || action.text}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="wireframe-input px-3 py-2"
          placeholder="Or type any action..."
          disabled={isLoading}
          aria-label="Custom action input"
        />
        <button 
          type="submit" 
          className="wireframe-button"
          disabled={isLoading || !userInput.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? 'Processing...' : 'Take Action'}
        </button>
      </form>
    </div>
  );
};

export default InputManager;
