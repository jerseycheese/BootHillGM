import React, { useEffect, useState } from 'react';

/**
 * LoadingScreen Component
 * 
 * A unified loading indicator that provides consistent loading states across the application.
 * Supports different loading scenarios with type-specific messages and error handling.
 *
 * @param props.type - Type of loading operation ('session' | 'combat' | 'ai' | 'inventory' | 'general')
 * @param props.size - Size of the loading spinner ('small' | 'medium' | 'large')
 * @param props.fullscreen - Whether to display in fullscreen or section mode
 * @param props.error - Optional error message
 * @param props.onRetry - Optional retry callback for error states
 * @param props.message - Optional custom message override
 * @param props.subMessage - Optional custom sub-message override
 * @param props.children - Optional content to render below the loading indicator (recovery options, etc.)
 * @param props.loadingTime - Optional loading time display in seconds
 */
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  type?: 'session' | 'combat' | 'ai' | 'inventory' | 'general' | 'reset';
  onRetry?: () => void;
  error?: string | null;
  children?: React.ReactNode;
  loadingTime?: number;
}

export function LoadingScreen({ 
  message,
  subMessage,
  size = 'medium',
  fullscreen = true,
  type = 'general',
  onRetry,
  error,
  children,
  loadingTime
}: LoadingScreenProps) {
  // Check if we should suppress loading screen during reset
  const [shouldRender, setShouldRender] = useState(true);
  
  useEffect(() => {
    // Check for skip loading flag in localStorage
    const skipLoading = localStorage.getItem('_boothillgm_skip_loading');
    
    // If this is a reset operation and skip flag is set, don't render
    if (type === 'reset' || skipLoading === 'true') {
      setShouldRender(false);
      
      // Clean up the flag after we've used it
      if (skipLoading) {
        localStorage.removeItem('_boothillgm_skip_loading');
      }
    } else {
      setShouldRender(true);
    }
  }, [type]);
  
  // If we shouldn't render, return null
  if (!shouldRender) {
    return null;
  }

  const getDefaultMessage = () => {
    switch(type) {
      case 'session':
        return 'Loading game session...';
      case 'combat':
        return 'Preparing combat...';
      case 'ai':
        return 'Processing response...';
      case 'inventory':
        return 'Updating inventory...';
      case 'reset':
        return 'Resetting game...';
      default:
        return 'Loading...';
    }
  };

  const getDefaultSubMessage = () => {
    if (error) {
      return 'An error occurred. Please try again.';
    }
    
    switch(type) {
      case 'session':
        return 'This may take a moment. If loading persists, try recovery options below.';
      case 'combat':
        return 'Calculating combat outcomes...';
      case 'ai':
        return 'The AI is generating a response...';
      case 'inventory':
        return 'Updating your items...';
      case 'reset':
        return 'Preparing a new adventure...';
      default:
        return 'Please wait...';
    }
  };

  const displayMessage = message || getDefaultMessage();
  const displaySubMessage = subMessage || getDefaultSubMessage();
  
  // Render loading time if provided
  const loadingTimeDisplay = loadingTime ? (
    <div className="text-xs text-gray-400 mt-1">
      Loading for {loadingTime.toFixed(1)}s
    </div>
  ) : null;

  return (
    <div 
      className={`${
        fullscreen ? 'wireframe-container' : 'wireframe-section'
      } flex flex-col items-center justify-center p-4`}
      role="status" 
      data-testid="loading-screen"
    >
      <div 
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-gray-600 mb-4 ${
          size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-12 w-12' : 'h-8 w-8'
        }`} 
      />
      
      <div className={`mb-2 ${
        size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'
      }`}>
        {displayMessage}
      </div>
      
      {displaySubMessage && (
        <div className="text-sm text-gray-500">{displaySubMessage}</div>
      )}
      
      {loadingTimeDisplay}
      
      {error && (
        <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {error && onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 wireframe-button text-sm"
          type="button"
        >
          Retry
        </button>
      )}
      
      {/* Render any children, which may include recovery options */}
      {children && (
        <div className="mt-4 w-full max-w-md">
          {children}
        </div>
      )}
    </div>
  );
}