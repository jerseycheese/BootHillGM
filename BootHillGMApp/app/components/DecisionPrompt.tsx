'use client';

import React from 'react';
import { useDecision } from '../context/DecisionContext';
import { cn } from '../utils/cn'; // Assuming you have a cn utility

/**
 * Props for the DecisionPrompt component
 */
interface DecisionPromptProps {
  className?: string;
}

/**
 * Component for displaying decision prompts to the player
 */
export const DecisionPrompt: React.FC<DecisionPromptProps> = ({ className }) => {
  const { currentDecision, isLoading, selectOption } = useDecision();
  
  // If no decision and not loading, don't render anything
  if (!currentDecision && !isLoading) {
    return null;
  }
  
  return (
    <div className={cn("decision-prompt bg-amber-50 border-2 border-amber-800 rounded-lg p-4 my-4 max-w-2xl mx-auto", className)}>
      {isLoading ? (
        <div className="decision-prompt__loading animate-pulse">
          <div className="h-4 bg-amber-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-amber-200 rounded w-1/2"></div>
          <div className="mt-4 flex flex-col space-y-2">
            <div className="h-8 bg-amber-200 rounded w-full"></div>
            <div className="h-8 bg-amber-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
          <h3 className="decision-prompt__title text-lg font-western text-amber-900 mb-3">
            Decision
          </h3>
          
          <p className="decision-prompt__text text-amber-950 mb-4">
            {currentDecision?.prompt}
          </p>
          
          <div className="decision-prompt__options grid gap-2">
            {currentDecision?.options.map((option) => (
              <button
                key={option.id}
                onClick={() => selectOption(option.id)}
                className="text-left p-3 bg-amber-100 hover:bg-amber-200 
                           border border-amber-800 rounded 
                           transition-colors duration-200 
                           font-western text-amber-950"
              >
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DecisionPrompt;
