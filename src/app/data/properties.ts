export interface Property {
  id: string;
  slug: string;
  title: string;
  type: 'hotel' | 'house' | 'apartment' | 'villa';
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  beds: number;
  baths: number;
  guests: number;
  description: string;
  images: string[];
  featured?: boolean;
}

export const properties: Property[] = [
  {
    id: '1',
    slug: 'hotel-luxe-moderne-abidjan',
    title: 'Hôtel Luxe Moderne',
    type: 'hotel',
    location: 'Paris, France',
    price: 299,
    rating: 4.9,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1768346564825-6f90c0b89e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBob3RlbCUyMGxvYmJ5fGVufDF8fHx8MTc3MjgzNTI4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Parking'],
    beds: 1,
    baths: 1,
    guests: 2,
    description: 'Découvrez le luxe moderne dans notre hôtel 5 étoiles situé au cœur de Paris. Profitez d\'une vue imprenable sur la ville et d\'équipements de classe mondiale.',
    images: [
      'https://images.unsplash.com/photo-1768346564825-6f90c0b89e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBob3RlbCUyMGxvYmJ5fGVufDF8fHx8MTc3MjgzNTI4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1572177215152-32f247303126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzcyODM1Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: true,
  },
  {
    id: '2',
    slug: 'villa-beach-resort-abidjan',
    title: 'Villa Beach Resort',
    type: 'villa',
    location: 'Bali, Indonésie',
    price: 450,
    rating: 5.0,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1593067222087-55aa1fc931e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZpbGxhJTIwcmVzb3J0fGVufDF8fHx8MTc3MjgzNTI4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Plage Privée', 'Piscine Infinity', 'Chef Privé', 'Jacuzzi', 'Vue Mer'],
    beds: 4,
    baths: 3,
    guests: 8,
    description: 'Villa de luxe avec accès direct à la plage. Piscine à débordement avec vue sur l\'océan et service de conciergerie 24h/24.',
    images: [
      'https://images.unsplash.com/photo-1593067222087-55aa1fc931e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZpbGxhJTIwcmVzb3J0fGVufDF8fHx8MTc3MjgzNTI4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1629711129507-d09c820810b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHJlc29ydCUyMHBvb2x8ZW58MXx8fHwxNzcyNzgzNTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: true,
  },
  {
    id: '3',
    slug: 'appartement-urbain-abidjan',
    title: 'Appartement Urbain',
    type: 'apartment',
    location: 'Tokyo, Japon',
    price: 180,
    rating: 4.7,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1692852061011-91914c522211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50JTIwYnVpbGRpbmclMjBuaWdodHxlbnwxfHx8fDE3NzI4MzUyODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['WiFi Ultra-Rapide', 'Gym', 'Terrasse', 'Smart Home', 'Sécurité 24/7'],
    beds: 2,
    baths: 2,
    guests: 4,
    description: 'Appartement moderne au cœur de Tokyo avec vue panoramique sur la ville. Technologie smart home et design contemporain.',
    images: [
      'https://images.unsplash.com/photo-1692852061011-91914c522211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50JTIwYnVpbGRpbmclMjBuaWdodHxlbnwxfHx8fDE3NzI4MzUyODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI3NjMwNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: true,
  },
  {
    id: '4',
    slug: 'chalet-montagne-abidjan',
    title: 'Chalet Montagne',
    type: 'house',
    location: 'Alpes Suisses',
    price: 380,
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1627750168257-9a7d3965ef8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmluJTIwaG91c2V8ZW58MXx8fHwxNzcyODM1Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Cheminée', 'Sauna', 'Accès Ski', 'Cuisine Équipée', 'Balcon'],
    beds: 3,
    baths: 2,
    guests: 6,
    description: 'Chalet authentique avec vue sur les sommets. Parfait pour des vacances à la montagne avec accès direct aux pistes de ski.',
    images: [
      'https://images.unsplash.com/photo-1627750168257-9a7d3965ef8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmluJTIwaG91c2V8ZW58MXx8fHwxNzcyODM1Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: false,
  },
  {
    id: '5',
    slug: 'maison-de-campagne-abidjan',
    title: 'Maison de Campagne',
    type: 'house',
    location: 'Abidjan',
    price: 220,
    rating: 4.6,
    reviews: 174,
    image: 'https://images.unsplash.com/photo-1742071853545-653689b94aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VudHJ5c2lkZSUyMGhvdXNlJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzcyODM1Mjg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Jardin', 'BBQ', 'Piscine', 'WiFi', 'Parking'],
    beds: 3,
    baths: 2,
    guests: 6,
    description: 'Charmante maison provençale entourée de lavande. Jardin privé avec piscine et terrasse pour profiter du soleil du sud.',
    images: [
      'https://images.unsplash.com/photo-1742071853545-653689b94aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VudHJ5c2lkZSUyMGhvdXNlJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzcyODM1Mjg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: false,
  },
  {
    id: '6',
    slug: 'hotel-boutique-abidjan',
    title: 'Hôtel Boutique',
    type: 'hotel',
    location: 'New York, USA',
    price: 320,
    rating: 4.8,
    reviews: 512,
    image: 'https://images.unsplash.com/photo-1572177215152-32f247303126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzcyODM1Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Rooftop Bar', 'Concierge', 'Room Service', 'Fitness', 'WiFi'],
    beds: 1,
    baths: 1,
    guests: 2,
    description: 'Hôtel boutique élégant dans le quartier branché de Manhattan. Design contemporain et service personnalisé.',
    images: [
      'https://images.unsplash.com/photo-1572177215152-32f247303126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzcyODM1Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    featured: false,
  },
];
