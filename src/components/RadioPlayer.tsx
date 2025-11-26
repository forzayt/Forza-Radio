import { useState, useEffect, useRef } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { StationCard } from "./StationCard";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import stations from "@/data/stations.json";

interface Station {
  id: string;
  name: string;
  url: string;
  image: string;
  genre: string;
  description: string;
}

export const RadioPlayer = () => {
  const [currentStation, setCurrentStation] = useState<Station>(stations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const audio = new Audio(currentStation.url);
    audioRef.current = audio;

    audio.addEventListener("playing", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    // Setup Web Audio API for visualization
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Auto-play
    audio.play().catch(console.error);

    return () => {
      audio.pause();
      audio.src = "";
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [currentStation]);

  useEffect(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentStation]);

  const handleStationChange = (station: Station) => {
    setCurrentStation(station);
  };

  return (
    <div className="min-h-screen gradient-animated relative overflow-hidden">
      {/* Dynamic background glow */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(var(--visualizer-primary) / ${audioLevel}), transparent 70%)`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Forza Radio
          </h1>
          <ThemeToggle />
        </header>

        {/* Main Player */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full mb-12">
          {/* Station Image with Visualizer */}
          <div className="relative mb-8">
            <div
              className="absolute inset-0 rounded-full blur-2xl animate-pulse-glow"
              style={{
                background: `radial-gradient(circle, hsl(var(--visualizer-primary) / ${audioLevel}), hsl(var(--visualizer-secondary) / ${audioLevel * 0.5}))`,
              }}
            />
            <img
              src={currentStation.image}
              alt={currentStation.name}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl ring-4 ring-white/20 transition-transform duration-500"
              style={{
                transform: `scale(${1 + audioLevel * 0.1})`,
              }}
            />
          </div>

          {/* Station Info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {currentStation.name}
            </h2>
            <p className="text-xl text-white/80 mb-1">{currentStation.genre}</p>
            <p className="text-sm text-white/60">{currentStation.description}</p>
          </div>

          {/* Audio Visualizer */}
          <AudioVisualizer
            analyser={analyserRef.current}
            isPlaying={isPlaying}
            audioLevel={audioLevel}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              isActive={station.id === currentStation.id}
              onClick={() => handleStationChange(station)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
