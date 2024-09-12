# React Native Core Components: In-Depth Summary

1. Fundamental Building Blocks

- View:
  - The foundational element for constructing UI layouts, analogous to a `<div>` in HTML.
  - Serves as a container for other components and enables styling and positioning.
  - Supports flexbox for flexible and responsive layouts.
  - Key props include style, onLayout, and accessibility-related props.

- Text:
  - Renders textual content within your app.
  - Supports various styling options like font family, size, color, and alignment.
  - Can handle multiline text and nested Text components for rich formatting.
  - Key props include style, numberOfLines, onPress, and accessibility-related props.

- Image:
  - Displays images from local or remote sources (URLs).
  - Handles image loading, caching, and resizing.
  - Supports various content modes (cover, contain, stretch) and image formats.
  - Key props include source, style, resizeMode, onLoad, and accessibility-related props.

- TextInput:
  - Enables user text input through a keyboard.
  - Offers customization options for placeholder text, keyboard type, auto-correction, and more.
  - Supports controlled and uncontrolled input handling.
  - Key props include value, onChangeText, placeholder, keyboardType, secureTextEntry, and accessibility-related props.

- TouchableOpacity:
  - Transforms any component into a touch-responsive element.
  - Provides visual feedback on press (opacity change).
  - Useful for creating interactive buttons and other touchable areas.
  - Key props include onPress, style, activeOpacity, and accessibility-related props.

2. List and Scrolling

- FlatList:
  - Highly performant component for rendering scrollable lists of data.
  - Optimized for large datasets through virtualization (renders only visible items).
  - Supports various layout options (vertical, horizontal) and customizable item rendering.
  - Key props include data, renderItem, keyExtractor, ListHeaderComponent, ListFooterComponent, and more.

- ScrollView:
  - A generic scrolling container for content that exceeds the screen size.
  - Less optimized than FlatList for large lists but offers more layout flexibility.
  - Useful for scrollable content with non-uniform item sizes or complex layouts.
  - Key props include contentContainerStyle, onScroll, scrollEnabled, and more.

3. Styling and Layout

- StyleSheet:
  - Enables defining reusable styles for components, similar to CSS.
  - Improves performance by caching styles and preventing inline style recalculations.
  - Supports most common CSS properties and flexbox layout.
  - Key functions include create, flatten, and compose.

- Flexbox:
  - The primary layout system in React Native, offering flexible and responsive arrangements.
  - Controls the alignment, direction, and sizing of components within a container.
  - Key props include flexDirection, justifyContent, alignItems, flex, and more.

Remember:

- Core components are the foundation of React Native UI development.
- Each component has its specific use case and props for customization.
- Refer to the official React Native documentation for the most up-to-date and detailed information.
