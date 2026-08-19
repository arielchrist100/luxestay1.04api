/**
 * Service API - Version Firebase +
 * Firebase gère l'authentification
 * Laravel vérifie le token Firebase et stocke les données
 */

import axios from 'axios';
import { auth } from '../config/firebase';

// Fonction helper pour accéder aux variables d'environnement de manière sûre
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore
    return import.meta?.env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// URL de base de votre API Laravel
const API_BASE_URL = getEnvVar(
  'VITE_API_URL',

);
// Instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token Firebase automatiquement
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;

      // Debug: afficher l'état de l'utilisateur
      console.log('🔍 Firebase Auth User:', user ? 'Connecté' : 'Non connecté');

      if (!user) {
        console.warn('⚠️ Utilisateur non connecté - pas de token envoyé');
        return config;
      }

      // Force le refresh du token pour éviter les tokens expirés
      const token = await user.getIdToken(true);

      // Debug: afficher le début du token
      console.log('🔑 Token Firebase:', token ? `${token.substring(0, 20)}...` : 'null');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Erreur token Firebase:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs (avec retry automatique sur 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('🔄 Token expiré → refresh et retry automatique');

      try {
        const user = auth.currentUser;

        if (user) {
          // Force refresh du token
          const newToken = await user.getIdToken(true);

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Impossible de rafraîchir le token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      console.error('❌ Token invalide ou expiré - reconnexion nécessaire');
    }

    return Promise.reject(error);
  }
);

/**
 * Service API pour communiquer avec le backend Laravel
 */
class ApiService {

  // ==================== AUTH ====================

  /**
   * Vérifie le token Firebase auprès de Laravel et récupère les infos utilisateur
   */
  async verifyAuth() {
    const response = await api.get('/auth/verify');
    return response.data;
  }

  /**
   * Enregistre ou met à jour l'utilisateur dans la base Laravel
   */
  async syncUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    idPhoto?: string;
  }) {
    // S'assurer que firstName et lastName ne sont jamais vides
    const payload = {
      email: userData.email,
      firstName: userData.firstName || 'Utilisateur',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      idPhoto: userData.idPhoto || '',
    };

    console.log('📤 Envoi vers /auth/sync:', payload);
    const response = await api.post('/auth/sync', payload);
    return response.data;
  }

  // ==================== PROPRIETAIRE ====================

  /**
   * Crée une demande pour devenir propriétaire
   */
  async registerAsOwner(ownerData: {
    companyName?: string;
    phone: string;
    address?: string;
    identityDocument?: string;
  }) {
    const response = await api.post('/owner/register', ownerData);
    return response.data;
  }

  /**
   * Vérifie le statut de la demande propriétaire
   */
  async checkOwnerRequestStatus() {
    const response = await api.get('/owner/check-status');
    return response.data;
  }

  /**
   * Récupère le dashboard du propriétaire (stats + propriétés)
   */
  async getOwnerDashboard() {
    const response = await api.get('/owner/dashboard');
    return response.data;
  }

  /**
   * Récupère les réservations du propriétaire
   */
  async getOwnerBookings() {
    const response = await api.get('/owner/bookings');
    return response.data;
  }

  /**
   * Ajoute une nouvelle propriété
   */
  async addProperty(propertyData: {
    name: string;
    type: string;
    address: string;
    city: string;
    country: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    guests: number;
    description: string;
    amenities: string[];
    images: string[];
  }) {
    const response = await api.post('/owner/properties', {
      ...propertyData,
      price_per_night: propertyData.price,
      max_guests: propertyData.guests,
    });
    return response.data;
  }

  /**
   * Met à jour une propriété
   */
  async updateProperty(propertyId: number, propertyData: any) {
    const response = await api.put(`/owner/properties/${propertyId}`, propertyData);
    return response.data;
  }

  /**
   * Supprime une propriété
   */
  async deleteProperty(propertyId: number) {
    const response = await api.delete(`/owner/properties/${propertyId}`);
    return response.data;
  }

  // ==================== PROPERTIES (PUBLIC) ====================

  /**
   * Récupère toutes les propriétés (pour la page d'accueil et recherche)
   */
  async getProperties(filters?: {
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
  }) {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  }

  /**
   * Récupère les détails d'une propriété
   */
  async getProperty(propertyId: number) {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  }

  // ==================== BOOKINGS ====================

  /**
   * Crée une nouvelle réservation
   */
  async createBooking(bookingData: {
    propertyId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
  }) {
    const response = await api.post('/bookings', {
      property_id: bookingData.propertyId,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      guests: bookingData.guests,
      total_price: bookingData.totalAmount,
    });
    return response.data;
  }

  /**
   * Récupère les réservations de l'utilisateur
   */
  async getUserBookings() {
    const response = await api.get('/user/bookings');
    return response.data;
  }

  /**
   * Annule une réservation
   */
  async cancelBooking(bookingId: number) {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
}

export const apiService = new ApiService();
