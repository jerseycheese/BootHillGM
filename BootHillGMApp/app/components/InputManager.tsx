/**
 * Handles player input during game sessions.
 * Manages input validation, loading states, and submission.
 * Disables input and shows feedback during processing.
 */
import React, { useState, useCallback } from 'react';
import { SuggestedAction } from '../types/campaign';

export default function InputManager({ 
  onSubmit, 
  isLoading, 
  suggestedActions = [] 
}: { 
  onSubmit: (input: string) => void;
  isLoading: boolean;
  suggestedActions?: SuggestedAction[];
}) {
  const [userInput, setUserInput] = useState('');

  const handleAction = useCallback((text: string) => {
    if (!isLoading) {
      onSubmit(text);
      setUserInput('');
    }
  }, [isLoading, onSubmit]);

  const actionClass = (type: string) => 
    `px-3 py-1 text-sm rounded hover:bg-opacity-80 disabled:opacity-50 text-white bg-${
      type === 'combat' ? 'red' : type === 'basic' ? 'blue' : 'green'
    }-500`;

  return (
    <div className="wireframe-section space-y-4">
      {suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action, index) => (
            <button
              key={`${action.type}-${index}`}
              onClick={() => handleAction(action.text)}
              disabled={isLoading}
              className={actionClass(action.type)}
              title={action.context || action.text}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (userInput.trim()) handleAction(userInput);
        }} 
        className="flex flex-col space-y-2"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={`wireframe-input px-3 py-2 ${isLoading ? 'opacity-50' : ''}`}
          placeholder="Or type any action..."
          disabled={isLoading}
          aria-label="Custom action input"
        />
        <button 
          type="submit" 
          className={`wireframe-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading || !userInput.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? 'Processing...' : 'Take Action'}
        </button>
      </form>
    </div>
  );
}
