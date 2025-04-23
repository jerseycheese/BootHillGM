/**
 * SettingsPanel Component
 * 
 * Displays and manages game settings, including UI preferences,
 * gameplay options, and save/load functionality.
 */

import React, { useState } from 'react';
import { ActionTypes } from '../../types/actionTypes';
import GameStorage from '../../utils/gameStorage';

interface SettingsPanelProps {
  dispatch?: React.Dispatch<unknown>;
}

/**
 * SettingsPanel component - allows players to configure game settings
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  dispatch
}) => {
  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [textSpeed, setTextSpeed] = useState('medium');
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState('western');
  
  // Game management states
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [loadInProgress, setLoadInProgress] = useState(false);
  const [message, setMessage] = useState('');
  
  // Toggle sound effects
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    if (dispatch) {
      dispatch({
        type: ActionTypes.SET_SOUND_ENABLED,
        payload: newValue
      });
    }
  };
  
  // Toggle background music
  const toggleMusic = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    if (dispatch) {
      dispatch({
        type: ActionTypes.SET_MUSIC_ENABLED,
        payload: newValue
      });
    }
  };
  
  // Change text speed setting
  const changeTextSpeed = (speed: string) => {
    setTextSpeed(speed);
    if (dispatch) {
      dispatch({
        type: ActionTypes.SET_TEXT_SPEED,
        payload: speed
      });
    }
  };
  
  // Change font size setting
  const changeFontSize = (size: string) => {
    setFontSize(size);
    if (dispatch) {
      dispatch({
        type: ActionTypes.SET_FONT_SIZE,
        payload: size
      });
    }
  };
  
  // Change theme setting
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    if (dispatch) {
      dispatch({
        type: ActionTypes.SET_THEME,
        payload: newTheme
      });
    }
  };
  
  // Save game state
  const saveGame = () => {
    setSaveInProgress(true);
    setMessage('');
    
    try {
      if (dispatch) {
        dispatch({
          type: ActionTypes.SAVE_GAME,
          payload: undefined
        });
      }
      
      // Directly call save function as a fallback
      GameStorage.saveGameState();
      
      setMessage('Game saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error saving game. Please try again.');
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Load game state
  const loadGame = () => {
    setLoadInProgress(true);
    setMessage('');
    
    try {
      if (dispatch) {
        dispatch({
          type: ActionTypes.LOAD_GAME,
          payload: undefined
        });
      }
      
      setMessage('Game loaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error loading game. Please try again.');
    } finally {
      setLoadInProgress(false);
    }
  };
  
  // Reset game state (new game)
  const newGame = () => {
    if (window.confirm('Start a new game? This will erase your current progress.')) {
      if (dispatch) {
        dispatch({
          type: ActionTypes.RESET_STATE,
          payload: undefined
        });
      }
      
      setMessage('New game started!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  return (
    <div className="settings-panel">
      <h3 className="text-xl font-bold mb-3">Settings</h3>
      
      {/* Game Management */}
      <div className="game-management mb-6 p-3 bg-gray-50 rounded border">
        <h4 className="font-semibold mb-2">Game</h4>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={saveGame}
            disabled={saveInProgress}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            data-testid="save-game-button"
          >
            {saveInProgress ? 'Saving...' : 'Save Game'}
          </button>
          
          <button 
            onClick={loadGame}
            disabled={loadInProgress}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            data-testid="load-game-button"
          >
            {loadInProgress ? 'Loading...' : 'Load Game'}
          </button>
          
          <button 
            onClick={newGame}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            data-testid="new-game-button"
          >
            New Game
          </button>
        </div>
        
        {message && (
          <div className="message text-sm text-center p-1">
            {message}
          </div>
        )}
      </div>
      
      {/* Audio Settings */}
      <div className="audio-settings mb-4">
        <h4 className="font-semibold mb-2">Audio</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={soundEnabled}
              onChange={toggleSound}
              className="mr-2"
              data-testid="sound-toggle"
            />
            Sound Effects
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={musicEnabled}
              onChange={toggleMusic}
              className="mr-2"
              data-testid="music-toggle"
            />
            Background Music
          </label>
        </div>
      </div>
      
      {/* Display Settings */}
      <div className="display-settings mb-4">
        <h4 className="font-semibold mb-2">Display</h4>
        
        <div className="mb-2">
          <div className="text-sm mb-1">Text Speed</div>
          <div className="flex gap-2">
            <button 
              onClick={() => changeTextSpeed('slow')}
              className={`px-2 py-1 rounded text-sm ${textSpeed === 'slow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="text-speed-slow"
            >
              Slow
            </button>
            <button 
              onClick={() => changeTextSpeed('medium')}
              className={`px-2 py-1 rounded text-sm ${textSpeed === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="text-speed-medium"
            >
              Medium
            </button>
            <button 
              onClick={() => changeTextSpeed('fast')}
              className={`px-2 py-1 rounded text-sm ${textSpeed === 'fast' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="text-speed-fast"
            >
              Fast
            </button>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-sm mb-1">Font Size</div>
          <div className="flex gap-2">
            <button 
              onClick={() => changeFontSize('small')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="font-size-small"
            >
              Small
            </button>
            <button 
              onClick={() => changeFontSize('medium')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="font-size-medium"
            >
              Medium
            </button>
            <button 
              onClick={() => changeFontSize('large')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="font-size-large"
            >
              Large
            </button>
          </div>
        </div>
        
        <div>
          <div className="text-sm mb-1">Theme</div>
          <div className="flex gap-2">
            <button 
              onClick={() => changeTheme('western')}
              className={`px-2 py-1 rounded text-sm ${theme === 'western' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="theme-western"
            >
              Western
            </button>
            <button 
              onClick={() => changeTheme('dark')}
              className={`px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="theme-dark"
            >
              Dark
            </button>
            <button 
              onClick={() => changeTheme('sepia')}
              className={`px-2 py-1 rounded text-sm ${theme === 'sepia' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              data-testid="theme-sepia"
            >
              Sepia
            </button>
          </div>
        </div>
      </div>
      
      {/* Game version info */}
      <div className="version-info text-xs text-gray-500 mt-6 pt-2 border-t">
        <div>Boot Hill GM v1.0.0</div>
        <div>&copy; 2023 Boot Hill Games</div>
      </div>
    </div>
  );
};

export default SettingsPanel;