import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Bed,
  Bath,
  Users,
  Wifi,
  Car,
  Tv,
  Wind,
  Coffee,
  Check
} from 'lucide-react';
import { OwnerGuard } from '../components/OwnerGuard';
import { apiService } from '../services/api';

const amenitiesOptions = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ac', label: 'Climatisation', icon: Wind },
  { id: 'breakfast', label: 'Petit-déjeuner', icon: Coffee },
];

function AddPropertyContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    address: '',
    city: '',
    country: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    description: '',
    images: [] as string[],
    amenities: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.addProperty({
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        guests: parseInt(formData.guests),
        description: formData.description,
        amenities: formData.amenities,
        images: formData.images,
      });

      // Rediriger vers le dashboard
      navigate('/owner/dashboard');
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de la propriété:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'ajout de la propriété');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter(a => a !== amenityId)
        : [...formData.amenities, amenityId],
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ajouter une Propriété
            </h1>
            <p className="text-muted-foreground text-lg">
              Remplissez les informations pour ajouter votre propriété
            </p>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 rounded-xl p-4 text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Informations de Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Nom de la propriété *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="Villa Paradis"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Type de propriété *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                  >
                    <option value="hotel">Hôtel</option>
                    <option value="house">Maison</option>
                    <option value="apartment">Appartement</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Prix par nuit (FCFA) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="450"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Localisation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="123 Rue de la Plage"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="Nice"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Pays *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="France"
                  />
                </div>
              </div>
            </div>

            {/* Détails */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Détails de la Propriété</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Chambres *
                  </label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Salles de bain *
                  </label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Capacité *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Équipements */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {amenitiesOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      formData.amenities.includes(id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {formData.amenities.includes(id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-center">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors resize-none"
                placeholder="Décrivez votre propriété en détail..."
              />
            </div>

            {/* Images */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-primary" />
                Photos
              </h2>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Cliquez pour ajouter des photos ou glissez-déposez
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG jusqu'à 10MB
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/owner/dashboard')}
                className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publication en cours...' : 'Publier la propriété'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export function AddProperty() {
  return (
    <OwnerGuard>
      <AddPropertyContent />
    </OwnerGuard>
  );
}
