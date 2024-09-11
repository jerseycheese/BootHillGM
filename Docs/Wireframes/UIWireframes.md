# BootHillGM User Interface (UI) Wireframes

## 1. Overview
BootHillGM features a text-based interface with minimal graphics, designed for cross-platform mobile devices using React Native. The UI focuses on clear presentation of game text, easy input methods, and quick access to essential game information.

## 2. Key Screens

### 2.1 Main Menu
- Title: "BootHillGM"
- Buttons:
  - New Game
  - Load Game (disabled if no saved games)
  - Settings
  - About

### 2.2 Character Creation
- Header: "Create Your Character"
- Text input fields:
  - Character Name
  - Background (short description)
- Attribute allocation:
  - Strength, Agility, Intelligence sliders
- Skill selection:
  - List of checkboxes for available skills
- "Create Character" button at the bottom

### 2.3 Game Interface
- Top bar:
  - Character name
  - Health status
- Main content area:
  - Scrollable text display for game narrative and dialogue
- Input area:
  - Text input field for player responses
  - Send button
- Quick action buttons:
  - Access Character Sheet
  - Access Inventory
  - Save Game

### 2.4 Character Sheet
- Character name and basic info at the top
- Attributes displayed as text with values
- Skills listed with proficiency levels
- Equipment summary
- "Back to Game" button

### 2.5 Inventory
- Scrollable list of items:
  - Item name
  - Quantity
  - Brief description on tap
- "Use Item" button for applicable items
- "Back to Game" button

### 2.6 Combat Interface
- Initiative order displayed at the top
- Current character's turn highlighted
- Action buttons:
  - Attack
  - Defend
  - Use Item
  - Flee
- Combat log in main content area
- "End Turn" button when applicable

### 2.7 Settings
- Text size adjustment
- Sound on/off toggle (for future use)
- "Clear Saved Data" button (with confirmation)
- "Back to Main Menu" button

### 2.8 Save/Load Game
- List of save slots (3-5 slots)
- Each slot shows:
  - Save date/time
  - Character name
  - Brief location description
- "Save" and "Load" buttons for each slot
- "Back to Game" button

## 3. UI Elements and Styling

### 3.1 Color Scheme
- Primary Background: Dark brown or parchment texture
- Text Color: Off-white or sepia
- Accent Color: Aged gold or rust red

### 3.2 Typography
- Main Text: Clear, easily readable sans-serif font
- Headers: Western-style font for titles and headers
- Button Text: Sans-serif font for clarity

### 3.3 Buttons
- Styled to resemble weathered wood or leather
- Clear hover/tap states

### 3.4 Text Input Fields
- Simple, bordered design
- Placeholder text to guide user input

### 3.5 Lists and Menus
- Clear separation between items
- Subtle hover/selection effects

## 4. Accessibility Considerations
- Implement dynamic font scaling for adjustable text sizes
- Ensure sufficient color contrast for readability
- Design tap targets with adequate size and spacing

## 5. Responsiveness
- Design UI to adapt to different mobile device sizes and orientations
- Implement scrolling for content that exceeds screen height
- Use React Native's flexbox layout for adaptive designs

## 6. Future Enhancements (Post-MVP)
- Implement dark/light mode toggle
- Add subtle Western-themed background images or textures
- Integrate simple animations for transitions and effects
- Implement haptic feedback for key interactions (platform-specific)

Note: These wireframes serve as a guideline for the UI implementation. The actual design may evolve during development based on usability testing and technical considerations specific to React Native.