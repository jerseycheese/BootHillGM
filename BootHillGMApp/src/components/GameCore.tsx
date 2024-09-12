import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/rootReducer';
import { startGame, createCharacter, updateLocation, addInventoryItem, addQuest } from '../redux/slices/gameSlice';

const GameCore: React.FC = () => {
  // Use useSelector to access the game state from Redux
  const gameState = useSelector((state: RootState) => state.game);
  // Use useDispatch to get the dispatch function for triggering actions
  const dispatch = useDispatch();

  // Handler functions for various game actions
  const handleStartGame = () => {
    dispatch(startGame());
  };

  const handleCreateCharacter = () => {
    dispatch(createCharacter({ name: 'John Doe' }));
  };

  const handleUpdateLocation = () => {
    dispatch(updateLocation('Saloon'));
  };

  const handleAddItem = () => {
    dispatch(addInventoryItem('Revolver'));
  };

  const handleAddQuest = () => {
    dispatch(addQuest({
      id: '1',
      title: 'Catch the Bandit',
      description: 'There\'s a bandit causing trouble in town. Catch him!',
      isCompleted: false
    }));
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Display current game state */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Game Status: {gameState.gameStatus}</Text>
      <Text>Character: {gameState.character ? gameState.character.name : 'None'}</Text>
      <Text>Location: {gameState.currentLocation || 'None'}</Text>
      <Text>Inventory: {gameState.inventory.join(', ') || 'Empty'}</Text>
      <Text>Quests: {gameState.quests.length}</Text>
      
      {/* Buttons to trigger various game actions */}
      <View style={{ marginTop: 20 }}>
        <Button title="Start Game" onPress={handleStartGame} />
        <Button title="Create Character" onPress={handleCreateCharacter} />
        <Button title="Go to Saloon" onPress={handleUpdateLocation} />
        <Button title="Add Revolver" onPress={handleAddItem} />
        <Button title="Add Quest" onPress={handleAddQuest} />
      </View>
    </View>
  );
};

export default GameCore;