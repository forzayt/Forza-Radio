import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  audioLevel: number;
}

export const AudioVisualizer = ({ analyser, isPlaying, audioLevel }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, `hsla(${262 + i}, 83%, 65%, 0.8)`);
        gradient.addColorStop(1, `hsla(${340 + i}, 82%, 68%, 0.8)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <div className="relative w-full max-w-md">
      {/* Circular Visualizer */}
      <div className="flex items-center justify-center gap-1 mb-6 h-24">
        {[...Array(32)].map((_, i) => (
          <div
            key={i}
            className="visualizer-bar w-2 bg-gradient-to-t from-visualizer-primary to-visualizer-secondary rounded-full"
            style={{
              height: `${20 + Math.random() * audioLevel * 60}%`,
              animationDelay: `${i * 0.05}s`,
              opacity: isPlaying ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-20 opacity-60"
      />

      {/* Audio Level Indicator */}
      <div className="mt-4 glass rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-visualizer-primary to-visualizer-secondary transition-all duration-100"
          style={{ width: `${audioLevel * 100}%` }}
        />
      </div>
    </div>
  );
};
