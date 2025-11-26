import { Play, Pause } from "lucide-react";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

export const PlayPauseButton = ({ isPlaying, onClick }: PlayPauseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="glass p-6 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl group"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <Pause className="w-12 h-12 text-white fill-white" />
      ) : (
        <Play className="w-12 h-12 text-white fill-white ml-1" />
      )}
    </button>
  );
};
