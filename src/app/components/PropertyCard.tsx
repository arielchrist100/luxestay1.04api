import { Link } from 'react-router-dom';
import { Star, MapPin, Users, BedDouble } from 'lucide-react';
import { Property } from '../data/properties';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link to={`/property/${property.slug}`}>
      <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badge Type */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-full backdrop-blur-sm">
              {property.type === 'hotel' ? 'Hôtel' : 
               property.type === 'house' ? 'Maison' : 
               property.type === 'villa' ? 'Villa' : 'Appartement'}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm">{property.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-xl mb-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Amenities Icons */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.guests} personnes</span>
            </div>
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              <span>{property.beds} lits</span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {property.price.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-muted-foreground text-sm"> / nuit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {property.reviews} avis
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
