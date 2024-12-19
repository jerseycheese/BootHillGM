// Mock gameEngine
const mockGameEngine = {
  useGame: () => ({
    state: {
      currentPlayer: '',
      npcs: [],
      location: '',
      inventory: [],
      quests: [],
      character: null,
      narrative: '',
      gameProgress: 0,
      journal: [],
      isCombatActive: false,
      opponent: null,
      suggestedActions: [],
    },
    dispatch: jest.fn(),
  }),
};

export default mockGameEngine;
