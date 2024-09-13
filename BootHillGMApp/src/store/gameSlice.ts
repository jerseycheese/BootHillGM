import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  isGameStarted: boolean;
  // Add more state properties as needed
}

const initialState: GameState = {
  isGameStarted: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isGameStarted = true;
    },
    // Add more reducers as needed
  },
});

export const { startGame } = gameSlice.actions;
export default gameSlice.reducer;