'use client';

import React, { useState } from 'react';

interface UserInputHandlerProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const UserInputHandler: React.FC<UserInputHandlerProps> = ({ onSubmit, isLoading }) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSubmit(userInput);
      setUserInput('');
    }
  };

  return (
    <form id="bhgmUserInputHandler" data-testid="user-input-handler" onSubmit={handleSubmit} className="wireframe-section bhgm-user-input-handler">
      <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
        className="wireframe-input" placeholder="What would you like to do?" disabled={isLoading} />
      <button type="submit" className="wireframe-button" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Take Action'}
      </button>
    </form>
  );
};

export default UserInputHandler;
