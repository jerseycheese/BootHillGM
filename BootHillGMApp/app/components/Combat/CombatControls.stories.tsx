import React, { ReactElement } from 'react';
import { CombatControls } from './CombatControls';

/**
 * Styled wrapper component for CombatControls stories
 */
const CombatControlsWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white max-w-md mx-auto">
    <h2 className="text-xl font-bold mb-4">
      Combat Controls
    </h2>
    {children}
  </div>
);

// Type for story rendering function
type StoryRenderFn = () => ReactElement;

/**
 * CombatControls component metadata
 */
const meta = {
  title: 'Combat/CombatControls',
  component: CombatControls,
  parameters: {
    // Required for Next.js App Router compatibility
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  // Define controls for the component props
  argTypes: {
    currentTurn: {
      control: 'radio',
      options: ['player', 'opponent'],
      description: 'Current turn in combat sequence'
    },
    isProcessing: {
      control: 'boolean',
      description: 'Whether a combat action is processing'
    },
    onAttack: {
      action: 'attacked',
      description: 'Handler for attack button click'
    },
  },
  // Add a component-specific decorator
  decorators: [
    // Add explicit type to the Story parameter
    (Story: StoryRenderFn) => (
      <CombatControlsWrapper>
        <Story />
      </CombatControlsWrapper>
    )
  ]
};

export default meta;

/**
 * Default state - Player's turn
 */
export const Default = {
  args: {
    currentTurn: 'player',
    isProcessing: false,
    onAttack: () => console.log('Attack button clicked'),
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
    docs: {
      source: {
        type: 'code',
      },
    },
  },
};

/**
 * When it's the opponent's turn
 */
export const OpponentTurn = {
  args: {
    currentTurn: 'opponent',
    isProcessing: false,
    onAttack: () => console.log('Attack button clicked'),
  },
};

/**
 * When a combat action is processing
 */
export const Processing = {
  args: {
    currentTurn: 'player',
    isProcessing: true,
    onAttack: () => console.log('Attack button clicked'),
  },
};

/**
 * For testing styling when both processing and opponent's turn
 */
export const OpponentProcessing = {
  args: {
    currentTurn: 'opponent',
    isProcessing: true,
    onAttack: () => console.log('Attack button clicked'),
  },
};