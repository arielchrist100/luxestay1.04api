import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  compact?: boolean;
}

export interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function SearchBar({ onSearch, compact = false }: SearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = { location, checkIn, checkOut, guests };
    
    if (onSearch) {
      onSearch(params);
    } else {
      const searchParams = new URLSearchParams();
      if (location) searchParams.set('location', location);
      if (checkIn) searchParams.set('checkIn', checkIn);
      if (checkOut) searchParams.set('checkOut', checkOut);
      searchParams.set('guests', guests.toString());
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Où souhaitez-vous aller ?"
            className="w-full px-12 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-3 shadow-2xl shadow-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Location */}
          <div className="relative">
            <label className="block text-sm text-muted-foreground mb-1 px-4">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Où allez-vous ?"
                className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Check-in */}
          <div className="relative">
            <label className="block text-sm text-muted-foreground mb-1 px-4">
              Arrivée
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="relative">
            <label className="block text-sm text-muted-foreground mb-1 px-4">
              Départ
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* Guests & Search */}
          <div className="relative flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1 px-4">
                Voyageurs
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-7 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              <span className="hidden lg:inline">Rechercher</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
