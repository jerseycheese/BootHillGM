/**
 * Generic loading indicator component.
 * Supports different sizes and fullscreen/section modes.
 * Used for providing user feedback during async operations.
 * 
 * Props:
 * - message: Main loading message
 * - subMessage: Optional additional context
 * - size: small | medium | large
 * - fullscreen: Whether to display full screen or in a section
 */
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
}

export function LoadingScreen({ 
  message = 'Loading game session...',
  subMessage = 'If loading persists, try navigating to another page and back.',
  size = 'medium',
  fullscreen = true
}: LoadingScreenProps) {
  const containerClass = fullscreen 
    ? 'wireframe-container flex flex-col items-center justify-center' 
    : 'wireframe-section flex flex-col items-center justify-center p-4';

  const spinnerSize = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }[size];

  const textSize = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  }[size];

  return (
    <div className={containerClass} role="status" data-testid="loading-screen">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-gray-600 ${spinnerSize} mb-4`} />
      <div className={`${textSize} mb-2`}>{message}</div>
      {subMessage && (
        <div className="text-sm text-gray-500">{subMessage}</div>
      )}
    </div>
  );
}
