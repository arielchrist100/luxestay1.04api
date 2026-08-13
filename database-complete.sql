-- ========================================
-- BASE DE DONNÉES COMPLÈTE - LUXESTAY
-- Système de réservation avec Firebase Auth
-- ========================================

-- 1. TABLE USERS (modifiée pour Firebase)
-- ========================================

-- Si la table existe déjà, modifier les colonnes
ALTER TABLE users
MODIFY COLUMN first_name VARCHAR(255) NULL,
MODIFY COLUMN last_name VARCHAR(255) NULL,
MODIFY COLUMN firebase_uid VARCHAR(255) NULL,
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'client',
ADD UNIQUE KEY users_firebase_uid_unique (firebase_uid);

-- Si id_photo n'existe pas, l'ajouter
ALTER TABLE users
ADD COLUMN IF NOT EXISTS id_photo VARCHAR(255) NULL;

-- OU créer la table users depuis zéro
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    phone VARCHAR(30) NULL,
    id_photo VARCHAR(255) NULL,
    role ENUM('admin', 'proprietaire', 'client') NOT NULL DEFAULT 'client',
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. TABLE OWNER_REQUESTS (demandes propriétaire)
-- ========================================

CREATE TABLE IF NOT EXISTS owner_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_name VARCHAR(255) NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NULL,
    identity_document VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. TABLE PROPERTIES (propriétés/logements)
-- ========================================

CREATE TABLE IF NOT EXISTS properties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL COMMENT 'Le propriétaire du logement',
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL COMMENT 'hotel, house, apartment, villa, studio',
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    max_guests INT NOT NULL DEFAULT 2,
    amenities JSON NULL COMMENT 'WiFi, Parking, Piscine, Climatisation, etc.',
    images JSON NULL COMMENT 'URLs des images',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_price (price_per_night)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. TABLE BOOKINGS (réservations)
-- ========================================

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL COMMENT 'La propriété réservée',
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Le client qui réserve',
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT NULL COMMENT 'Notes ou demandes spéciales',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_check_in (check_in),
    INDEX idx_check_out (check_out)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. TABLE REVIEWS (avis/commentaires) - OPTIONNEL
-- ========================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL COMMENT 'Lien avec la réservation',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. TABLE FAVORITES (favoris) - OPTIONNEL
-- ========================================

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ========================================

-- Admin par défaut
INSERT INTO users (firebase_uid, email, first_name, last_name, role, created_at, updated_at)
VALUES
    ('admin-uid-001', 'admin@luxestay.com', 'Admin', 'LuxeStay', 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Quelques propriétés d'exemple
-- (À décommenter après avoir créé un utilisateur propriétaire)
/*
INSERT INTO properties (owner_id, name, type, description, address, city, country, price_per_night, bedrooms, bathrooms, max_guests, amenities, images, status)
VALUES
    (1, 'Villa Paradis', 'villa', 'Magnifique villa en bord de mer avec piscine privée', '123 Avenue de la Plage', 'Nice', 'France', 250.00, 3, 2, 6, '["WiFi", "Piscine", "Parking", "Climatisation"]', '["https://example.com/image1.jpg"]', 'active'),
    (1, 'Appartement Centre-Ville', 'apartment', 'Appartement moderne au cœur de Paris', '45 Rue du Centre', 'Paris', 'France', 120.00, 2, 1, 4, '["WiFi", "Ascenseur", "Cuisine équipée"]', '["https://example.com/image2.jpg"]', 'active');
*/


-- ========================================
-- VÉRIFICATION DE LA STRUCTURE
-- ========================================

-- Pour vérifier que tout est correct :
-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE owner_requests;
-- DESCRIBE properties;
-- DESCRIBE bookings;

-- Pour voir les contraintes :
-- SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'luxestay';
