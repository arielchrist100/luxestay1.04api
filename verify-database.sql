-- ========================================
-- SCRIPT DE VÉRIFICATION BASE DE DONNÉES
-- ========================================

-- 1. Vérifier que la base existe
SHOW DATABASES LIKE 'luxestay';

-- 2. Utiliser la base
USE luxestay;

-- 3. Lister toutes les tables
SHOW TABLES;

-- 4. Vérifier la structure de chaque table
DESCRIBE users;
DESCRIBE owner_requests;
DESCRIBE properties;
DESCRIBE bookings;

-- 5. Vérifier les contraintes de clés étrangères
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'luxestay'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 6. Vérifier les index
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM
    information_schema.STATISTICS
WHERE
    TABLE_SCHEMA = 'luxestay'
ORDER BY
    TABLE_NAME, INDEX_NAME;

-- 7. Vérifier la colonne firebase_uid est UNIQUE
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'luxestay'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'firebase_uid';

-- 8. Vérifier que role a une valeur par défaut
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM
    information_schema.COLUMNS
WHERE
    TABLE_SCHEMA = 'luxestay'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role';

-- 9. Compter les enregistrements
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'owner_requests', COUNT(*) FROM owner_requests
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;

-- 10. Vérifier qu'il n'y a pas de doublons firebase_uid
SELECT
    firebase_uid,
    COUNT(*) AS count
FROM
    users
WHERE
    firebase_uid IS NOT NULL
GROUP BY
    firebase_uid
HAVING
    COUNT(*) > 1;

-- Si tout est OK, vous ne devriez voir aucun résultat ici
