interface BrawlingControlsProps {
  isProcessing: boolean;
  onPunch: () => void;
  onGrapple: () => void;
  round: 1 | 2;
}

export const BrawlingControls: React.FC<BrawlingControlsProps> = ({
  isProcessing,
  onPunch,
  onGrapple,
  round
}) => {
  return (
    <div className="brawling-controls space-y-2">
      <div className="text-center mb-2">Round {round}</div>
      <div className="flex gap-2">
        <button
          onClick={onPunch}
          disabled={isProcessing}
          className="wireframe-button flex-1 px-4 py-2"
        >
          Punch
        </button>
        <button
          onClick={onGrapple}
          disabled={isProcessing}
          className="wireframe-button flex-1 px-4 py-2"
        >
          Grapple
        </button>
      </div>
    </div>
  );
};
