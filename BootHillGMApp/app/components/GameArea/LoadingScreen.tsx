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
 */
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  type?: 'session' | 'combat' | 'ai' | 'inventory' | 'general';
  onRetry?: () => void;
  error?: string | null;
}

export function LoadingScreen({ 
  message,
  subMessage,
  size = 'medium',
  fullscreen = true,
  type = 'general',
  onRetry,
  error
}: LoadingScreenProps) {
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
      default:
        return 'Loading...';
    }
  };

  const defaultSubMessage = error 
    ? 'An error occurred. Please try again.' 
    : type === 'session' 
      ? 'If loading persists, try navigating to another page and back.'
      : undefined;

  const displayMessage = message || getDefaultMessage();
  const displaySubMessage = subMessage || defaultSubMessage;

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
      
      {error && onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 wireframe-button text-sm"
          type="button"
        >
          Retry
        </button>
      )}
    </div>
  );
}
