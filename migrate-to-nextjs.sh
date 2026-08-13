#!/bin/bash

# ========================================
# SCRIPT DE MIGRATION VERS NEXT.JS
# ========================================

echo "🚀 Démarrage de la migration vers Next.js..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Étape 1: Créer le projet Next.js
echo -e "${BLUE}📦 Étape 1/7: Création du projet Next.js...${NC}"
npx create-next-app@latest luxestay-nextjs --typescript --tailwind --app --src-dir --eslint --no-git

cd luxestay-nextjs

# Étape 2: Installer les dépendances
echo -e "${BLUE}📦 Étape 2/7: Installation des dépendances...${NC}"
pnpm install firebase
pnpm install axios
pnpm install motion
pnpm install lucide-react

# Étape 3: Copier les fichiers
echo -e "${BLUE}📁 Étape 3/7: Copie des fichiers...${NC}"

# Créer les dossiers
mkdir -p src/components
mkdir -p src/context
mkdir -p src/services
mkdir -p src/config
mkdir -p public/images

# Copier les composants
echo "  Copie des composants..."
cp -r ../src/app/components/* src/components/ 2>/dev/null || echo "  ⚠️  Pas de composants à copier"

# Copier les contexts
echo "  Copie des contexts..."
cp -r ../src/app/context/* src/context/ 2>/dev/null || echo "  ⚠️  Pas de contexts à copier"

# Copier les services
echo "  Copie des services..."
cp -r ../src/app/services/* src/services/ 2>/dev/null || echo "  ⚠️  Pas de services à copier"

# Copier la config Firebase
echo "  Copie de la config Firebase..."
cp -r ../src/app/config/* src/config/ 2>/dev/null || echo "  ⚠️  Pas de config à copier"

# Étape 4: Créer le layout principal
echo -e "${BLUE}📝 Étape 4/7: Création du layout...${NC}"
cat > src/app/layout.tsx << 'EOF'
import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LuxeStay - Réservation d\'Hôtels et Résidences à Abidjan',
  description: 'Réservez des hôtels, villas et résidences meublées en Côte d\'Ivoire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
EOF

# Étape 5: Créer la page d'accueil
echo -e "${BLUE}📝 Étape 5/7: Création des pages...${NC}"
cat > src/app/page.tsx << 'EOF'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LuxeStay - Réservation d\'Hôtels, Villas et Résidences à Abidjan',
  description: 'Réservez des hôtels, villas et résidences meublées à Abidjan. Cocody, Plateau, Marcory, Riviera.',
  keywords: 'hôtel Abidjan, résidence meublée, villa Cocody, location Côte d\'Ivoire',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <h1>LuxeStay - Réservation à Abidjan</h1>
      <p>Migration Next.js réussie !</p>
    </div>
  );
}
EOF

# Étape 6: Créer next.config.js optimisé
echo -e "${BLUE}⚙️  Étape 6/7: Configuration Next.js...${NC}"
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
}

module.exports = nextConfig
EOF

# Étape 7: Créer sitemap et robots.txt
echo -e "${BLUE}🗺️  Étape 7/7: Création du sitemap...${NC}"
cat > src/app/sitemap.ts << 'EOF'
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://luxestay.ci',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://luxestay.ci/search',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
EOF

cat > src/app/robots.ts << 'EOF'
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/owner/dashboard'],
    },
    sitemap: 'https://luxestay.ci/sitemap.xml',
  };
}
EOF

# Créer .env.local
echo -e "${BLUE}🔐 Création du fichier .env.local...${NC}"
cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

echo ""
echo -e "${GREEN}✅ Migration terminée !${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "1. cd luxestay-nextjs"
echo "2. Modifiez .env.local avec vos vraies credentials Firebase"
echo "3. pnpm dev"
echo "4. Ouvrez http://localhost:3000"
echo ""
echo -e "${GREEN}🎉 Votre projet Next.js est prêt !${NC}"
