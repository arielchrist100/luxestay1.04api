import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Home,
  TrendingUp,
  Eye,
  Calendar,
  DollarSign,
  Plus,
  Building2,
  MapPin,
  Edit,
  Trash2,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { OwnerGuard } from '../components/OwnerGuard';
import { apiService } from '../services/api';

interface Property {
  id: number;
  name: string;
  type: string;
  location: string;
  image: string;
  price: number;
  visits: number;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

interface Booking {
  id: number;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: 'confirmed' | 'completed' | 'pending' | 'cancelled';
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalVisits: number;
  avgOccupancy: number;
}

function OwnerDashboardContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    totalVisits: 0,
    avgOccupancy: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Charger les données du dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Charger les réservations quand on change vers l'onglet bookings
  useEffect(() => {
    if (activeTab === 'bookings' && bookings.length === 0) {
      loadBookings();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOwnerDashboard();
      setStats(data.stats);
      setProperties(data.properties);
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await apiService.getOwnerBookings();
      setBookings(data.bookings);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      return;
    }

    try {
      await apiService.deleteProperty(propertyId);
      // Recharger les données
      await loadDashboardData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la propriété');
    }
  };

  // Affichage du loader
  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="backdrop-blur-xl bg-card/50 border border-destructive/50 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              Réessayer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl mb-2 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Espace Propriétaire
              </h1>
              <p className="text-muted-foreground">
                Gérez vos propriétés et suivez vos performances
              </p>
            </div>
            <Link
              to="/owner/add-property"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Ajouter une propriété
            </Link>
          </div>
        </motion.div>

        {/* Statistiques globales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Réservations</p>
                <p className="text-2xl">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vues totales</p>
                <p className="text-2xl">{stats.totalVisits.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux d'occupation</p>
                <p className="text-2xl">{stats.avgOccupancy}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'properties', label: 'Mes Propriétés', icon: Home },
            { id: 'bookings', label: 'Réservations', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-gradient-to-r from-accent to-secondary text-white'
                  : 'bg-card border border-border hover:border-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Performance Mensuelle</h2>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Graphique de performance - À venir</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'properties' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {properties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore de propriétés</p>
                <Link
                  to="/owner/add-property"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter votre première propriété
                </Link>
              </div>
            ) : (
              properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl overflow-hidden hover:border-primary transition-colors group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-1">{property.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                      {property.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-2xl mb-1">{property.visits}</p>
                      <p className="text-xs text-muted-foreground">Vues</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-2xl mb-1">{property.bookings}</p>
                      <p className="text-xs text-muted-foreground">Réservations</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenus</p>
                      <p className="text-xl">{property.revenue.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Occupation</p>
                      <p className="text-xl text-primary">{property.occupancyRate}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl overflow-hidden"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucune réservation pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm">Propriété</th>
                      <th className="px-6 py-4 text-left text-sm">Client</th>
                      <th className="px-6 py-4 text-left text-sm">Arrivée</th>
                      <th className="px-6 py-4 text-left text-sm">Départ</th>
                      <th className="px-6 py-4 text-left text-sm">Montant</th>
                      <th className="px-6 py-4 text-left text-sm">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          {booking.propertyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">{booking.guestName}</td>
                      <td className="px-6 py-4">{new Date(booking.checkIn).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4">{new Date(booking.checkOut).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4">{booking.amount.toLocaleString('fr-FR')} €</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                          booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmée' :
                           booking.status === 'completed' ? 'Terminée' :
                           'En attente'}
                        </span>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function OwnerDashboard() {
  return (
    <OwnerGuard>
      <OwnerDashboardContent />
    </OwnerGuard>
  );
}
