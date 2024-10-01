# BootHillGM User Interface (UI) Wireframes

## 1. Overview
BootHillGM features a responsive web-based interface with minimal graphics, designed using Next.js and React components. The UI focuses on clear presentation of game text, easy input methods, and quick access to essential game information across various devices and screen sizes.

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
- [ ] Conversational UI for AI-guided character creation
- [ ] Text input field for player responses
- [ ] Display area for AI prompts and character information
- [ ] Progress indicator
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
- [ ] Character name and basic info at the top
- [ ] Attributes displayed as text with values
- [ ] Skills listed with proficiency levels
- [ ] Equipment summary
- [ ] "Back to Game" button

### 2.5 Inventory
- [ ] Scrollable grid or list of items:
  - Item name
  - Quantity
  - Brief description on hover/tap
- [ ] "Use Item" button for applicable items
- [ ] "Back to Game" button

### 2.6 Combat Interface
- [ ] Initiative order displayed at the top
- [ ] Current character's turn highlighted
- [ ] Action buttons:
  - Attack
  - Defend
  - Use Item
  - Flee
- [ ] Combat log in main content area
- [ ] "End Turn" button when applicable

### 2.7 Settings
- [ ] Text size adjustment
- [ ] High contrast mode toggle
- [ ] "Clear Saved Data" button (with confirmation)
- [ ] "Back to Home" button

### 2.8 Save/Load Game
- [ ] List of save slots (3-5 slots)
- [ ] Each slot shows:
  - Save date/time
  - Character name
  - Brief location description
- [ ] "Save" and "Load" buttons for each slot
- [ ] "Back to Game" button

## 3. Responsive Design Considerations

### 3.1 Desktop
- [ ] Two-column layout for game session (narrative on left, actions on right)
- [ ] Sidebar navigation for quick access to character sheet and inventory
- [ ] Larger text input areas

### 3.2 Tablet
- [ ] Flexible layout that adapts to portrait and landscape orientations
- [ ] Collapsible sidebar for navigation
- [ ] Touch-friendly button sizes

### 3.3 Mobile
- [ ] Single-column layout with stacked elements
- [ ] Bottom navigation bar for essential actions
- [ ] Expandable/collapsible sections for character info and inventory

## 4. UI Elements and Styling

### 4.1 Color Scheme
- [ ] Primary Background: Dark brown or parchment texture
- [ ] Text Color: Off-white or sepia
- [ ] Accent Color: Aged gold or rust red

### 4.2 Typography
- [ ] Main Text: Clear, easily readable sans-serif font
- [ ] Headers: Western-style font for titles and headers
- [ ] Utilize Next.js font optimization for custom fonts

### 4.3 Components
- [ ] Custom Button component with hover and active states
- [ ] Input component with clear styling
- [ ] Card component for displaying items and character info
- [ ] Modal component for confirmations and additional info

## 5. Accessibility Considerations
- [ ] Implement proper heading structure (h1, h2, etc.) for screen readers
- [ ] Ensure sufficient color contrast for readability
- [ ] Provide alt text for any decorative images
- [ ] Implement keyboard navigation for all interactive elements

## 6. Next.js Specific Considerations
- [ ] Utilize Next.js Image component for optimized image loading
- [ ] Implement dynamic imports for non-critical components
- [ ] Use Next.js Link component for client-side navigation between pages

## 7. Future Enhancements (Post-MVP)
- [ ] Implement dark/light mode toggle
- [ ] Add subtle Western-themed background images or textures
- [ ] Integrate simple animations for transitions and effects
- [ ] Implement a map interface for navigation between locations

Note: These wireframes serve as a guideline for the UI implementation. The actual design may evolve during development based on usability testing and technical considerations specific to Next.js and web development best practices.