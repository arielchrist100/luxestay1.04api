import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { properties } from '../data/properties';
import { Sparkles, Shield, HeadphonesIcon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

export function Home() {
  const featuredProperties = properties.filter(p => p.featured);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.15]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden -mt-16 pt-16">
        {/* Background Image with Parallax Effect */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80"
            alt="Luxury resort"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </motion.div>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 mix-blend-overlay" />

        {/* Floating gradient orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative h-full flex items-center justify-center px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-7xl mx-auto text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            >
              Découvrez Votre Refuge Parfait
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              Réservez des hôtels de luxe et des maisons exceptionnelles dans le monde entier
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <SearchBar />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
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
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Sélection Premium</h3>
              <p className="text-muted-foreground">
                Des propriétés soigneusement sélectionnées pour une expérience inoubliable
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 hover:border-secondary/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Réservation Sécurisée</h3>
              <p className="text-muted-foreground">
                Paiement 100% sécurisé avec protection complète de vos données
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 hover:border-accent/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Support 24/7</h3>
              <p className="text-muted-foreground">
                Notre équipe est disponible à tout moment pour vous assister
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Propriétés en Vedette
            </h2>
            <p className="text-muted-foreground text-lg">
              Découvrez nos sélections les plus populaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl mb-6">
            Prêt à Commencer Votre Aventure ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez des milliers de voyageurs satisfaits et trouvez votre prochaine destination
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity text-lg">
            Explorez Toutes les Propriétés
          </button>
        </div>
      </section>
    </div>
  );
}
