import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: 'MockedNavigator',
    Screen: 'MockedScreen',
  }),
}));

// Mock Redux
jest.mock('react-redux', () => ({
  Provider: ({ children }) => children,
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

// Silence the warning about missing native animated module
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');