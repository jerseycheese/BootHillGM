/**
 * Handles player input during game sessions.
 * Manages input validation, loading states, and submission.
 * Disables input and shows feedback during processing.
 */
import React, { useState } from 'react';

interface InputManagerProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const InputManager: React.FC<InputManagerProps> = ({ onSubmit, isLoading }) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSubmit(userInput);
      setUserInput('');
    }
  };

  return (
    <div className="wireframe-section">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="wireframe-input px-3 py-2"
          placeholder="What would you like to do?"
          disabled={isLoading}
          aria-label="Action input"
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
