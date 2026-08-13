import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from "motion/react";
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { Search, MapPin, Calendar } from 'lucide-react';

const properties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1614620371233-e4f517277b15?w=1080&q=80',
    title: 'Hôtel Luxe Moderne',
    location: 'Paris, France',
    price: 450,
    rating: 4.9,
    type: 'hotel' as const
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=1080&q=80',
    title: 'Villa Contemporaine',
    location: 'Côte d\'Azur, France',
    price: 850,
    rating: 5.0,
    type: 'house' as const
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1597172173960-b8da219af0ba?w=1080&q=80',
    title: 'Résidence Architecturale',
    location: 'Dubaï, UAE',
    price: 1200,
    rating: 4.8,
    type: 'hotel' as const
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1757264119016-7e6b568b810d?w=1080&q=80',
    title: 'Maison Design Piscine',
    location: 'Bali, Indonésie',
    price: 680,
    rating: 4.9,
    type: 'house' as const
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1597171149529-7a8f69abe77b?w=1080&q=80',
    title: 'Hôtel Avant-Garde',
    location: 'Tokyo, Japon',
    price: 520,
    rating: 4.7,
    type: 'hotel' as const
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=1080&q=80',
    title: 'Villa Montagne Luxe',
    location: 'Alpes, Suisse',
    price: 950,
    rating: 5.0,
    type: 'house' as const
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hotel' | 'house'>('all');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const filteredProperties = properties.filter(
    property => activeFilter === 'all' || property.type === activeFilter
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header user={user} onAuthChange={setUser} />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1748741426070-f11ac876e7dd?w=1920&q=80"
            alt="Luxury resort"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </motion.div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 mix-blend-overlay" />

        <div className="relative h-full flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-4xl text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-7xl mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent"
            >
              L'Excellence du Voyage
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl text-white/80 mb-12"
            >
              Découvrez les destinations les plus exclusives du monde
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Destination"
                    className="bg-transparent border-none outline-none text-white placeholder-white/50 w-full"
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Dates"
                    className="bg-transparent border-none outline-none text-white placeholder-white/50 w-full"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                >
                  <Search className="w-5 h-5" />
                  Rechercher
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Filters Section */}
      <section className="relative py-12 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {[
              { id: 'all', label: 'Tout' },
              { id: 'hotel', label: 'Hôtels' },
              { id: 'house', label: 'Maisons' }
            ].map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                className={`px-8 py-3 rounded-full transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:border-cyan-500/50'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Sélection Premium
            </h2>
            <p className="text-white/60 text-lg">
              Les meilleures propriétés soigneusement sélectionnées pour vous
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={property.id} {...property} index={index} />
            ))}
          </div>
        </div>
      </section>