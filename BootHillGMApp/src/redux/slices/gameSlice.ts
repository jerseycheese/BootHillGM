import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for our game state
interface GameState {
  gameStatus: 'idle' | 'creating' | 'playing' | 'paused';
  character: Character | null;
  currentLocation: string | null;
  inventory: string[];
  quests: Quest[];
}

// Initial state for our game
const initialState: GameState = {
  gameStatus: 'idle',
  character: null,
  currentLocation: null,
  inventory: [],
  quests: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Action to start the game
    startGame: (state) => {
      state.gameStatus = 'creating';
    },
    // Action to create a character and start playing
    createCharacter: (state, action: PayloadAction<Character>) => {
      state.character = action.payload;
      state.gameStatus = 'playing';
    },
    // Action to update the player's current location
    updateLocation: (state, action: PayloadAction<string>) => {
      state.currentLocation = action.payload;
    },
    // Action to add an item to the inventory
    addInventoryItem: (state, action: PayloadAction<string>) => {
      state.inventory.push(action.payload);
    },
    // Action to add a new quest
    addQuest: (state, action: PayloadAction<Quest>) => {
      state.quests.push(action.payload);
    },
    // Action to mark a quest as completed
    completeQuest: (state, action: PayloadAction<string>) => {
      const quest = state.quests.find(q => q.id === action.payload);
      if (quest) {
        quest.isCompleted = true;
      }
    },
  },
});

// Export actions for use in components
export const { 
  startGame, 
  createCharacter, 
  updateLocation, 
  addInventoryItem, 
  addQuest, 
  completeQuest 
} = gameSlice.actions;

export default gameSlice.reducer;