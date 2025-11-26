interface Station {
  id: string;
  name: string;
  url: string;
  image: string;
  genre: string;
  description: string;
}

interface StationCardProps {
  station: Station;
  isActive: boolean;
  onClick: () => void;
}

export const StationCard = ({ station, isActive, onClick }: StationCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 ${
        isActive ? "ring-4 ring-white shadow-2xl" : "glass hover:shadow-xl"
      }`}
    >
      <div className="aspect-square">
        <img
          src={station.image}
          alt={station.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-semibold text-sm truncate">
              {station.name}
            </p>
            <p className="text-white/70 text-xs truncate">{station.genre}</p>
          </div>
        </div>
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
        )}
      </div>
    </button>
  );
};
