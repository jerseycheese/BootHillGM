# BootHillGM User Interface (UI) Wireframes (MVP)

## 1. Overview
BootHillGM features a responsive web-based interface with minimal graphics, designed using Next.js and React components. The MVP UI focuses on clear presentation of game text, easy input methods, and quick access to essential game information across various devices and screen sizes.

## 2. Key Screens (MVP)

### 2.1 Home Page
- [ ] Title: "BootHillGM"
- [ ] Brief game description
- [ ] Buttons:
  - New Game
  - Load Game (disabled if no saved games)
  - Settings

### 2.2 Character Creation
- [ ] Header: "Create Your Character"
- [ ] Simplified AI-guided character creation
- [ ] Text input field for player responses
- [ ] Display area for AI prompts and character information
- [ ] "Confirm Character" button at the bottom

### 2.3 Game Session
- [ ] Top bar:
  - Character name
  - Health status
  - Current location
- [ ] Main content area:
  - Scrollable text display for game narrative and dialogue
- [ ] Input area:
  - Text input field for player responses
  - Send button
- [ ] Quick action buttons:
  - Access Character Sheet
  - Access Inventory
  - Save Game

### 2.4 Character Sheet
- [ ] Character name and basic info
- [ ] Simplified attributes display
- [ ] Basic skills list
- [ ] Equipment summary
- [ ] "Back to Game" button

### 2.5 Inventory
- [ ] Simple list of items:
  - Item name
  - Quantity
- [ ] "Use Item" button for applicable items
- [ ] "Back to Game" button

### 2.6 Combat Interface
- [ ] Current character's turn highlighted
- [ ] Basic action buttons:
  - Attack
  - Defend
  - Use Item
- [ ] Simple combat log
- [ ] "End Turn" button

### 2.7 Settings
- [ ] Text size adjustment
- [ ] High contrast mode toggle
- [ ] "Clear Saved Data" button (with confirmation)
- [ ] "Back to Home" button

### 2.8 Save/Load Game
- [ ] List of 3 save slots
- [ ] Each slot shows:
  - Save date/time
  - Character name
- [ ] "Save" and "Load" buttons for each slot
- [ ] "Back to Game" button

## 3. Responsive Design Considerations

### 3.1 Desktop
- [ ] Single-column layout for game session to simplify development
- [ ] Sidebar navigation for quick access to character sheet and inventory

### 3.2 Mobile
- [ ] Single-column layout with stacked elements
- [ ] Bottom navigation bar for essential actions
- [ ] Collapsible sections for character info and inventory

## 4. UI Elements and Styling

### 4.1 Color Scheme
- [ ] Primary Background: Light parchment texture
- [ ] Text Color: Dark brown
- [ ] Accent Color: Rust red

### 4.2 Typography
- [ ] Main Text: Clear, easily readable sans-serif font
- [ ] Headers: Simple serif font for titles

### 4.3 Components
- [ ] Basic Button component
- [ ] Simple Input component
- [ ] Card component for displaying items and character info

## 5. Accessibility Considerations
- [ ] Implement proper heading structure (h1, h2, etc.) for screen readers
- [ ] Ensure sufficient color contrast for readability
- [ ] Implement basic keyboard navigation for interactive elements

## 6. Next.js Specific Considerations
- [ ] Utilize Next.js Image component for any necessary images
- [ ] Use Next.js Link component for navigation between pages

Note: These wireframes serve as a guideline for the MVP UI implementation. The design prioritizes simplicity and core functionality, with the option to enhance and expand in future iterations.