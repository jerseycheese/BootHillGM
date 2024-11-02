import { render, screen, fireEvent, act } from '@testing-library/react';
import CharacterCreation from '../../character-creation/page';
import '@testing-library/jest-dom';

// Mock Next router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock game engine hook
jest.mock('../../utils/gameEngine', () => ({
  useGame: jest.fn(),
}));

// Mock campaign state manager
const mockCleanupState = jest.fn();
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: () => ({
    saveGame: jest.fn(),
    cleanupState: mockCleanupState,
  }),
}));

// Mock AI service functions
jest.mock('../../utils/aiService', () => {
  const generateCharacterSummary = jest.fn().mockResolvedValue('Character summary');
  return {
    getCharacterCreationStep: jest.fn().mockResolvedValue('Mock AI prompt'),
    validateAttributeValue: jest.fn().mockReturnValue(true),
    generateFieldValue: jest.fn().mockResolvedValue('10'),
    generateCompleteCharacter: jest.fn().mockResolvedValue({
      name: 'Test Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    }),
    generateCharacterSummary,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: false
});

// Mock console methods
const originalLog = console.log;
const originalError = console.error;

describe('Character Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  test('loads saved progress and allows input', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({
      character: {
        name: 'Saved Character',
        health: 100,
        attributes: {
          speed: 8,
          gunAccuracy: 7,
          throwingAccuracy: 6,
          strength: 9,
          bravery: 8,
          experience: 5
        },
        skills: {
          shooting: 45,
          riding: 40,
          brawling: 35
        }
      },
      currentStep: 0,
      lastUpdated: Date.now()
    }));

    await act(async () => {
      render(<CharacterCreation />);
    });

    const input = screen.getByLabelText(/your response/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test Input' } });
    });

    expect(input).toHaveValue('Test Input');
  });

  test('auto-saves progress after field update', async () => {
    await act(async () => {
      render(<CharacterCreation />);
    });

    const input = screen.getByLabelText(/your response/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Character' } });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
    expect(savedData).toHaveProperty('character');
    expect(savedData).toHaveProperty('currentStep');
    expect(savedData).toHaveProperty('lastUpdated');
  });

  test('clears saved progress on completion', async () => {
    // Mock initial state at the Brawling step
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      character: {
        name: 'Test Character',
        health: 100,
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          bravery: 10,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        }
      },
      currentStep: 9,
      lastUpdated: Date.now()
    }));

    await act(async () => {
      render(<CharacterCreation />);
    });

    // First, fill in the brawling value
    const input = screen.getByLabelText(/your response/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '50' } });
    });

    // Submit the form to move to the next step
    const form = screen.getByTestId('character-form');
    await act(async () => {
      fireEvent.submit(form);
      // Wait for summary to load
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Now at summary step, submit the form again to finish
    const finalForm = screen.getByTestId('character-form');
    await act(async () => {
      fireEvent.submit(finalForm);
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify cleanup
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('character-creation-progress');
    expect(mockCleanupState).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/game-session');
  });

  test('handles localStorage errors gracefully', async () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('Storage full');
    });

    await act(async () => {
      render(<CharacterCreation />);
    });

    const input = screen.getByLabelText(/your response/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test Character' } });
    });

    expect(console.error).toHaveBeenCalled();
  });

  test('generates random character and updates form', async () => {
    await act(async () => {
      render(<CharacterCreation />);
    });

    const generateButton = screen.getByRole('button', { name: /generate random character/i });
    
    await act(async () => {
      fireEvent.click(generateButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Check for the character name in the summary
    expect(screen.getByText('Test Character')).toBeInTheDocument();
  });

  test('restores to initial state if saved data is corrupted', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('invalid json');

    await act(async () => {
      render(<CharacterCreation />);
    });

    const input = screen.getByLabelText(/your response/i);
    expect(input).toHaveValue(null);
  });
});
