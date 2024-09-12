import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import GameCore from './src/components/GameCore';

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle="dark-content" />
        <GameCore />
      </SafeAreaView>
    </Provider>
  );
};

export default App;