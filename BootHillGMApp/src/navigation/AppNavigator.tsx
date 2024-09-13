import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  testID?: string;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ testID }) => {
  return (
    // NavigationContainer is the root component of React Navigation
    <NavigationContainer>
      {/* Stack.Navigator manages the navigation stack */}
      <Stack.Navigator testID={testID}>
      {/* Define screens in the navigation stack */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;