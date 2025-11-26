import { useState, useEffect, useRef } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { StationCard } from "./StationCard";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { PlayPauseButton } from "./PlayPauseButton";
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
  const [showSearchResults, setShowSearchResults] = useState(false);
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
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
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
        {/* Header with Search */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Forza Radio
            </h1>
            <ThemeToggle />
          </div>
          <div className="relative">
            <SearchBar 
              value={searchQuery} 
              onChange={(value) => {
                setSearchQuery(value);
                setShowSearchResults(value.length > 0);
              }} 
            />
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-4 max-h-96 overflow-y-auto z-50">
                {filteredStations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredStations.map((station) => (
                      <StationCard
                        key={station.id}
                        station={station}
                        isActive={station.id === currentStation.id}
                        onClick={() => handleStationChange(station)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No stations found</p>
                )}
              </div>
            )}
          </div>
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

          {/* Play/Pause Button */}
          <PlayPauseButton 
            isPlaying={isPlaying} 
            onClick={togglePlayPause}
          />

          {/* Audio Visualizer */}
          <div className="mt-8">
            <AudioVisualizer
              analyser={analyserRef.current}
              isPlaying={isPlaying}
              audioLevel={audioLevel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
