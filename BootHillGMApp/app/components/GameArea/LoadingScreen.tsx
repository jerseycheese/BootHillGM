// Simple loading screen component with user guidance
export function LoadingScreen() {
  return (
    <div className="wireframe-container flex flex-col items-center justify-center" role="status">
      <div className="text-lg mb-4">Loading game session...</div>
      <div className="text-sm text-gray-500">
        If loading persists, try navigating to another page and back.
      </div>
    </div>
  );
}
