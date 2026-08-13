import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { SearchBar } from '../components/SearchBar';
import { properties as allProperties } from '../data/properties';
import { SlidersHorizontal } from 'lucide-react';

export function Search() {
  const [searchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState(allProperties);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...allProperties];

    // Filter by type from URL
    const typeParam = searchParams.get('type');
    if (typeParam) {
      filtered = filtered.filter(p => p.type === typeParam);
      setSelectedType(typeParam);
    } else if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // Filter by location
    const locationParam = searchParams.get('location');
    if (locationParam) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(locationParam.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by rating
    filtered = filtered.filter(p => p.rating >= minRating);

    setFilteredProperties(filtered);
  }, [searchParams, selectedType, priceRange, minRating]);

  const propertyTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'hotel', label: 'Hôtels' },
    { value: 'house', label: 'Maisons' },
    { value: 'villa', label: 'Villas' },
    { value: 'apartment', label: 'Appartements' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar compact />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border rounded-xl hover:border-primary transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} w-full lg:w-80 space-y-6`}>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="text-lg mb-4">Filtres</h3>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  Type de propriété
                </label>
                <div className="space-y-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                        selectedType === type.value
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'bg-input-background hover:bg-muted text-foreground'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  Prix par nuit
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{priceRange[0].toLocaleString('fr-FR')} FCFA</span>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {priceRange[1].toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  Note minimum
                </label>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                        minRating === rating
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'bg-input-background hover:bg-muted text-foreground'
                      }`}
                    >
                      {rating === 0 ? 'Toutes les notes' : `${rating}+ étoiles`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedType('all');
                  setPriceRange([0, 1000000]);
                  setMinRating(0);
                }}
                className="w-full px-4 py-2 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'propriété trouvée' : 'propriétés trouvées'}
              </h2>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <SlidersHorizontal className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl mb-2">Aucune propriété trouvée</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
