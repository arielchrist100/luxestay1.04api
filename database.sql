-- ============================================
-- Base de données LuxeStay
-- Système de réservation d'hôtels et maisons
-- Authentification: Laravel Sanctum
-- ============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS luxestay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luxestay;

-- ============================================
-- Table: users
-- Gestion des utilisateurs (clients, propriétaires, admin)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NULL COMMENT 'google, facebook',
    provider_id VARCHAR(255) NULL,
    avatar VARCHAR(500) NULL COMMENT 'URL de la photo de profil',
    phone VARCHAR(20) NULL,
    role ENUM('admin', 'proprietaire', 'client') DEFAULT 'client' NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: personal_access_tokens
-- Tokens d'authentification Laravel Sanctum
-- ============================================
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: properties
-- Propriétés (hôtels, maisons)
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('hotel', 'house', 'apartment', 'villa') NOT NULL,
    description TEXT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    max_guests INT NOT NULL DEFAULT 2,
    amenities JSON NULL COMMENT 'Liste des équipements: wifi, piscine, parking, etc.',
    images JSON NULL COMMENT 'URLs des photos',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_price (price_per_night)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: bookings
-- Réservations
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_user (user_id),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: reviews
-- Avis et notes
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_property (property_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: favorites
-- Favoris des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, property_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Données de test
-- ============================================

-- Utilisateur admin
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin LuxeStay', 'admin@luxestay.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+33123456789');
-- Mot de passe: password

-- Utilisateurs clients
INSERT INTO users (name, email, password, role, phone) VALUES
('Jean Dupont', 'jean@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+33612345678'),
('Marie Martin', 'marie@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+33687654321');

-- Propriétaires
INSERT INTO users (name, email, password, role, phone) VALUES
('Pierre Hôtelier', 'pierre@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'proprietaire', '+33698765432'),
('Sophie Propriétaire', 'sophie@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'proprietaire', '+33611223344');

-- Propriétés
INSERT INTO properties (owner_id, name, type, description, address, city, country, price_per_night, bedrooms, bathrooms, max_guests, amenities, images, status) VALUES
(4, 'Hôtel Luxe Paris', 'hotel', 'Magnifique hôtel 5 étoiles au cœur de Paris', '123 Avenue des Champs-Élysées', 'Paris', 'France', 250.00, 1, 1, 2, '["wifi", "parking", "piscine", "spa", "restaurant"]', '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]', 'active'),
(4, 'Villa Méditerranée', 'villa', 'Villa avec vue sur la mer', '45 Promenade des Anglais', 'Nice', 'France', 450.00, 4, 3, 8, '["wifi", "piscine", "jardin", "vue mer"]', '["https://images.unsplash.com/photo-1613490493576-7fde63acd811"]', 'active'),
(5, 'Appartement Cosy Lyon', 'apartment', 'Appartement moderne en centre-ville', '78 Rue de la République', 'Lyon', 'France', 120.00, 2, 1, 4, '["wifi", "cuisine équipée", "ascenseur"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]', 'active'),
(5, 'Maison de Campagne', 'house', 'Charmante maison au calme', '12 Chemin des Vignes', 'Bordeaux', 'France', 180.00, 3, 2, 6, '["wifi", "jardin", "barbecue", "parking"]', '["https://images.unsplash.com/photo-1568605114967-8130f3a36994"]', 'active');

-- Réservations
INSERT INTO bookings (property_id, user_id, check_in, check_out, guests, total_price, status, payment_status) VALUES
(1, 2, '2026-05-10', '2026-05-15', 2, 1250.00, 'confirmed', 'paid'),
(2, 3, '2026-06-01', '2026-06-07', 6, 2700.00, 'confirmed', 'paid'),
(3, 2, '2026-05-20', '2026-05-25', 3, 600.00, 'pending', 'pending');

-- Avis
INSERT INTO reviews (property_id, user_id, booking_id, rating, comment) VALUES
(1, 2, 1, 5, 'Excellent hôtel ! Service impeccable et chambre magnifique.'),
(2, 3, 2, 4, 'Très belle villa, dommage qu\'il n\'y avait pas de climatisation dans toutes les chambres.');

-- Favoris
INSERT INTO favorites (user_id, property_id) VALUES
(2, 2),
(2, 4),
(3, 1);

-- ============================================
-- Vues utiles
-- ============================================

-- Vue: Statistiques propriétaires
CREATE OR REPLACE VIEW owner_stats AS
SELECT
    u.id AS owner_id,
    u.name AS owner_name,
    COUNT(DISTINCT p.id) AS total_properties,
    COUNT(DISTINCT b.id) AS total_bookings,
    COALESCE(SUM(b.total_price), 0) AS total_revenue,
    COALESCE(AVG(r.rating), 0) AS average_rating
FROM users u
LEFT JOIN properties p ON u.id = p.owner_id
LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
LEFT JOIN reviews r ON p.id = r.property_id
WHERE u.role = 'proprietaire'
GROUP BY u.id, u.name;

-- Vue: Propriétés disponibles
CREATE OR REPLACE VIEW available_properties AS
SELECT
    p.*,
    u.name AS owner_name,
    u.email AS owner_email,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS review_count
FROM properties p
INNER JOIN users u ON p.owner_id = u.id
LEFT JOIN reviews r ON p.id = r.property_id
WHERE p.status = 'active'
GROUP BY p.id;

-- ============================================
-- Procédures stockées
-- ============================================

DELIMITER $$

-- Vérifier la disponibilité d'une propriété
CREATE PROCEDURE check_availability(
    IN prop_id BIGINT,
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT COUNT(*) AS conflicts
    FROM bookings
    WHERE property_id = prop_id
      AND status NOT IN ('cancelled')
      AND (
          (check_in <= start_date AND check_out > start_date)
          OR (check_in < end_date AND check_out >= end_date)
          OR (check_in >= start_date AND check_out <= end_date)
      );
END$$

DELIMITER ;

-- ============================================
-- Index additionnels pour performance
-- ============================================

-- Recherche full-text sur les propriétés
ALTER TABLE properties ADD FULLTEXT INDEX idx_search (name, description, city);

-- ============================================
-- Fin du script
-- ============================================
