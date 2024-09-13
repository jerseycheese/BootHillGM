import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    // Wrap the entire app with Redux Provider for state management
    <Provider store={store}>
      {/* AppNavigator handles the navigation structure of the app */}
      {/* testID is used for easier component selection in tests */}
      <AppNavigator testID="mocked-app-navigator" />
    </Provider>
  );
};

export default App;