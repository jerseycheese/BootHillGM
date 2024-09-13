import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { startGame } from '../store/gameSlice';

const GameScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isGameStarted = useSelector((state: RootState) => state.game.isGameStarted);

  return (
    <View>
      <Text>Game Screen</Text>
      <Text>Game Started: {isGameStarted ? 'Yes' : 'No'}</Text>
      <Button title="Start Game" onPress={() => dispatch(startGame())} />
    </View>
  );
};

export default GameScreen;