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
export function LoadingScreen({ 
  message = 'Loading game session...',
  subMessage = 'If loading persists, try navigating to another page and back.',
  size = 'medium',
  fullscreen = true
}: {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
}) {
  return (
    <div 
      className={`${fullscreen ? 'wireframe-container' : 'wireframe-section'} flex flex-col items-center justify-center p-4`}
      role="status" 
      data-testid="loading-screen"
    >
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-gray-600 mb-4 ${
        size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-12 w-12' : 'h-8 w-8'
      }`} />
      <div className={`mb-2 ${
        size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'
      }`}>{message}</div>
      {subMessage && <div className="text-sm text-gray-500">{subMessage}</div>}
    </div>
  );
}
