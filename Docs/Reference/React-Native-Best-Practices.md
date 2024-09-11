# React Native Best Practices

## Table of Contents
1. [Development Environment](#1-development-environment)
2. [Code Organization and Structure](#2-code-organization-and-structure)
3. [User Interface (UI) Design](#3-user-interface-ui-design)
4. [Performance Optimization](#4-performance-optimization)
5. [Advanced Features](#5-advanced-features)
6. [Development Process](#6-development-process)

## 1. Development Environment

### 1.1 React Native CLI
- Use the React Native Command Line Interface (CLI) for creating and managing projects.
- Take advantage of hot reloading to see changes instantly without recompiling the entire app.

### 1.2 Expo
- Consider using Expo for simplified development and access to native APIs without writing native code.
- Utilize Expo Go app for real-time testing and debugging on physical devices and emulators.
- Leverage Expo's over-the-air (OTA) update capability for pushing updates directly to users' devices.

## 2. Code Organization and Structure

### 2.1 Use TypeScript
- Implement TypeScript for static typing, which leads to more reliable code and helps catch bugs during compilation.
- Define interfaces for complex objects to enhance code readability and prevent runtime errors.

Example:
```typescript
interface Order {
  price: number;
  name: string;
  taxPercentage: number;
}

function calculatePrice(order: Order) {
  const { price, taxPercentage } = order;
  const taxValue = price * taxPercentage;
  return price + taxValue;
}
```

### 2.2 Prefer Functional Components
- Use functional components over class components for simplicity, conciseness, and potential performance improvements.
- Utilize React Hooks for state management and side effects in functional components.

Example of a functional component:
```jsx
import React, { useState } from 'react';

const FunctionalComponent = () => {
  const [count, setCount] = useState(0);

  const incrementCount = () => {
    setCount(count + 1);
  };

  return (
    <View>
      <Text style={styles.h1}>Functional Component</Text>
      <Text>Count: {count}</Text>
      <Button title='Increment' onPress={incrementCount}/>
    </View>
  );
};
```

### 2.3 Organize Imports
- Order imports consistently to improve code readability:
  1. External imports (e.g., React, React Native)
  2. Internal imports (relative paths)
  3. In-folder imports
- Sort imports alphabetically within each group
- Separate import groups with a blank line
- Use ESLint and Prettier to automate and enforce correct import order

Example:
```javascript
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Button, Card } from '../components';
import { MainLayout } from '../layouts';

import { StyledCard } from './styles.ts';
```

### 2.4 Use Path Aliases
- Implement path aliases to create shorter and more meaningful import paths, especially for deep or nested folder structures.
- Configure path aliases in both TypeScript (tsconfig.json) and React Native (babel.config.js) settings.

TypeScript configuration (tsconfig.json):
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "components/*": ["src/components/*"],
      "buttons": ["src/components/buttons/index"]
    }
  }
}
```

React Native configuration (babel.config.js):
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            components: "./src/components",
            buttons: "./src/components/buttons",
          },
        },
      ],
    ],
  };
};
```

## 3. User Interface (UI) Design

### 3.1 Design Consistency
- Use a consistent design language throughout the app.
- Implement a design system or style guide.
- Utilize component libraries for consistent UI elements.

### 3.2 Responsive Design
- Ensure the UI adapts to different screen sizes and orientations.
- Use libraries like react-native-normalize to create responsive layouts effortlessly.
- Implement responsive style properties using functions to create adaptive layouts.

### 3.3 Visual Assets
- Use high-resolution images and icons.
- Implement lazy loading techniques for better performance.

### 3.4 Animations and Styling
- Use libraries like Lottie for sophisticated animations.
- Consider using Styled-Components for writing CSS in JavaScript.

### 3.5 Theming
- Implement theming using libraries like 'styled-components'.
- Consider adding a dark mode option.

### 3.6 Accessibility
- Follow accessibility best practices.
- Use semantic elements, alt text, and screen reader support.
- Utilize native accessibility tools when necessary.

## 4. Performance Optimization

### 4.1 Avoid Inline Functions
- Inline functions can lead to unnecessary re-renders and increased memory usage.
- Extract functions outside of component definitions to prevent re-creation on each render.

Example - Before optimization:
```jsx
const CustomButton = () => {
  return (
    <Pressable onPress={() => console.log('Button clicked!')}>
      <Text>Click Me</Text>
    </Pressable>
  );
};
```

Example - After optimization:
```jsx
const handlePress = () => {
  console.log('Button clicked!');
};

const CustomButton = () => {
  return (
    <Pressable onPress={handlePress}>
      <Text>Click Me</Text>
    </Pressable>
  );
};
```

### 4.2 Use useCallback for Function Memoization
- Utilize the `useCallback` hook to memoize callback functions.
- This prevents unnecessary re-renders in child components that rely on reference equality.

Example:
```jsx
import React, { useState, useCallback } from 'react';
import { Button, View } from 'react-native';

const CounterComponent = () => {
  const [count, setCount] = useState(0);

  const incrementCount = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <View>
      <Button onPress={incrementCount} title="Increment" />
    </View>
  );
};
```

### 4.3 Leverage useMemo for Complex Calculations
- Use the `useMemo` hook to memoize the results of expensive calculations.
- This prevents unnecessary recalculations on each render.

Example:
```jsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

const SumComponent = ({ numbers }) => {
  const sum = useMemo(() => {
    return numbers.reduce((acc, current) => acc + current, 0);
  }, [numbers]);

  return (
    <View>
      <Text>Sum: {sum}</Text>
    </View>
  );
};
```

### 4.4 Optimize Component Re-renders with React.memo
- Wrap components with `React.memo` to prevent unnecessary re-renders.
- Especially useful for components that receive the same props frequently.

Example:
```jsx
const UserProfile = React.memo(({ name, email }) => {
  return (
    <View>
      <Text>Name: {name}</Text>
      <Text>Email: {email}</Text>
    </View>
  );
});
```

### 4.5 Enhance Image Performance with FastImage
- Use the `FastImage` library for improved image caching and loading.
- Supports prioritized loading and progressive image display.

Example:
```jsx
import FastImage from 'react-native-fast-image';

const OptimizedImage = () => (
  <FastImage
    style={{ width: 200, height: 200 }}
    source={{
      uri: 'https://example.com/image.jpg',
      priority: FastImage.priority.normal,
    }}
    resizeMode={FastImage.resizeMode.contain}
  />
);
```

### 4.6 Use FlatList and SectionList for Efficient List Rendering
- Prefer `FlatList` and `SectionList` over `ScrollView` for long lists of data.
- These components optimize rendering by only rendering items currently in view.
- Implement pagination for improved performance with large datasets.

Example with pagination:
```jsx
import React, { useState, useEffect } from 'react';
import { FlatList, Text } from 'react-native';

const PaginatedList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    const newData = await fetchYourData(page);
    setData([...data, ...newData]);
    setPage(page + 1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.key}</Text>}
      keyExtractor={(item, index) => index.toString()}
      onEndReached={fetchData}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### 4.7 Use MMKV for Efficient Local Storage
- Replace `AsyncStorage` with MMKV for faster data access and storage.
- MMKV offers near-instantaneous read and write operations.

Example:
```jsx
import MMKVStorage from 'react-native-mmkv';

const storage = new MMKVStorage.Loader().initialize();

// Storing data
storage.setString('user_token', 'abc123');

// Retrieving data
const userToken = storage.getString('user_token');
```

### 4.8 Remove Console Logs in Production
- Remove or disable `console.log` statements in production builds.
- Use Babel plugins to automatically remove console logs in production.

Example Babel configuration:
```javascript
// babel.config.js
module.exports = {
  env: {
    production: {
      plugins: ["transform-remove-console"],
    },
  },
};
```

### 4.9 Prevent Memory Leaks with Safe State Updates
- Use a custom hook to safely update state and prevent updates on unmounted components.

Example:
```jsx
import { useState, useEffect, useCallback, useRef } from 'react';

export const useSafeState = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const isMountedRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetValue = useCallback((newValue) => {
    if (isMountedRef.current) {
      setValue(newValue);
    }
  }, []);

  return [value, safeSetValue];
};
```

Usage:
```jsx
const MyComponent = () => {
  const [data, setData] = useSafeState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchSomeData();
      setData(result);
    };
    fetchData();
  }, [setData]);

  return <View>{data && <Text>{data}</Text>}</View>;
};
```

## 5. Advanced Features

### 5.1 Navigation
- Implement efficient navigation and routing using libraries like React Navigation.
- Utilize stack, tab, and drawer navigations for intuitive user experience.

### 5.2 Authentication
- Integrate secure authentication methods, such as Firebase Authentication.
- Implement smooth sign-up, login, and password reset functionalities.

### 5.3 Debugging and Monitoring
- Use advanced debugging tools like React Native Debugger and Flipper.
- Implement performance monitoring for quick issue identification and resolution.

### 5.4 Native Device Capabilities
- Utilize native device features like camera, GPS, and push notifications.
- Leverage React Native APIs and libraries to access these features.

### 5.5 Crash Analytics
- Implement crash analytics tools for real-time monitoring and error identification.
- Use tools like Sentry, Firebase Crashlytics, or other crash reporting services.
- Analyze crash data to identify and fix root causes of app crashes.

## 6. Development Process

### 6.1 Cross-Platform Development
- Focus on building efficiently for both iOS and Android platforms.
- Utilize platform-specific code when necessary for optimal performance.

### 6.2 Testing
- Implement thorough testing strategies, including unit tests and integration tests.
- Utilize Expo's real-time testing capabilities on physical devices and emulators.

### 6.3 Continuous Integration/Continuous Deployment (CI/CD)
- Set up a CI/CD pipeline for automated testing and deployment.
- Utilize Expo's OTA updates for quick bug fixes and feature releases.

Remember, these best practices are guidelines rather than strict rules. As your codebase grows, adhering to these practices becomes increasingly important for maintaining code health, readability, and performance. Regularly profile your app's performance and adjust your optimization strategies as needed. The world of React Native is always evolving, with new tools, techniques, and best practices emerging regularly. Stay informed about the latest developments in the React Native ecosystem to ensure your app remains efficient and up-to-date.