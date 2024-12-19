import { render, screen, act, RenderResult, RenderOptions } from '@testing-library/react';
import React, { ReactElement, createContext } from 'react';
import CharacterCreationPage from '../../character-creation/page';
import { GameState } from '../../types/gameState';
import { GameEngineAction } from '../../types/gameActions';
import { initialState } from '../../types/initialState';

// Create mock context
const MockCampaignStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
} | undefined>(undefined);

// Mock CampaignStateProvider
const MockCampaignStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockState = { ...initialState, isClient: true };
  const mockDispatch = jest.fn();
  const mockSaveGame = jest.fn();
  const mockLoadGame = jest.fn(() => null);
  const mockCleanupState = jest.fn();

  return (
    <MockCampaignStateContext.Provider 
      value={{
        state: mockState,
        dispatch: mockDispatch,
        saveGame: mockSaveGame,
        loadGame: mockLoadGame,
        cleanupState: mockCleanupState
      }}
    >
      {children}
    </MockCampaignStateContext.Provider>
  );
};

// Custom render function that wraps components in providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockCampaignStateProvider>
      {children}
    </MockCampaignStateProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

const renderComponent = (): RenderResult => {
  return customRender(React.createElement(CharacterCreationPage));
};

interface RenderCharacterCreationResult extends RenderResult {
  generateButton: HTMLElement;
}

export const renderCharacterCreation = async (): Promise<RenderCharacterCreationResult> => {
  let component: RenderResult;
  
  await act(async () => {
    component = renderComponent();
  });

  // Wait for loading screen to disappear and form to appear
  const generateButton = await screen.findByTestId('generate-character-button');
  
  return { 
    generateButton, 
    ...component! 
  };
};

export { customRender, renderComponent };
