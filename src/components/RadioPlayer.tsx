import { useState, useEffect, useRef } from "react";
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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const audio = new Audio(currentStation.url);
    audio.volume = 1.0; // Set volume to maximum
    audioRef.current = audio;

    audio.addEventListener("playing", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    // Auto-play
    audio.play().catch(console.error);

    return () => {
      audio.pause();
      audio.src = "";
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
          background: `radial-gradient(circle at 50% 50%, hsl(var(--visualizer-primary) / 0.5), transparent 70%)`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header with Search */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight animate-fade-in">
              <span className="inline-block animate-pulse-glow">F</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.1s' }}>o</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.2s' }}>r</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.3s' }}>z</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.4s' }}>a</span>
              <span className="inline-block mx-2">🎵</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.5s' }}>R</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.6s' }}>a</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.7s' }}>d</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.8s' }}>i</span>
              <span className="inline-block animate-pulse-glow" style={{ animationDelay: '0.9s' }}>o</span>
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
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-2 max-h-96 overflow-y-auto z-50 bg-card/95 backdrop-blur-xl border border-white/20">
                {filteredStations.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredStations.map((station) => (
                      <li key={station.id}>
                        <button
                          onClick={() => handleStationChange(station)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-white/10 ${
                            station.id === currentStation.id
                              ? "bg-white/20 text-white font-semibold"
                              : "text-white/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{station.name}</span>
                            {station.id === currentStation.id && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs text-white/50">{station.genre}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/60 text-center py-8">No stations found</p>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Player */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full mb-12">
          {/* Station Image */}
          <div className="relative mb-8">
            <div
              className="absolute inset-0 rounded-full blur-2xl animate-pulse-glow"
              style={{
                background: `radial-gradient(circle, hsl(var(--visualizer-primary) / 0.6), hsl(var(--visualizer-secondary) / 0.3))`,
              }}
            />
            <img
              src={currentStation.image}
              alt={currentStation.name}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl ring-4 ring-white/20"
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
        </div>
      </div>
    </div>
  );
};
