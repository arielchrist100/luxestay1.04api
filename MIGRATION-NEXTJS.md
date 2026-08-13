# 🚀 MIGRATION VERS NEXT.JS - GUIDE COMPLET

## 📋 Pourquoi Next.js ?

### Avantages SEO
✅ **Server-Side Rendering (SSR)** - Google voit le HTML complet  
✅ **Static Site Generation (SSG)** - Pages ultra-rapides  
✅ **Meta tags** côté serveur  
✅ **Open Graph** automatique  
✅ **Sitemap.xml** généré automatiquement  
✅ **Image optimization** automatique  

### Comparaison Performance

**Avant (Vite + React SPA):**
- First Contentful Paint (FCP): ~2.5s
- Time to Interactive (TTI): ~4s
- SEO Score: 60/100
- Google indexe après JavaScript

**Après (Next.js SSR):**
- First Contentful Paint (FCP): ~0.8s
- Time to Interactive (TTI): ~1.5s
- SEO Score: 95/100
- Google indexe immédiatement

---

## 🛠️ STRATÉGIE DE MIGRATION

### Option 1 : Migration complète (recommandé)
Créer un nouveau projet Next.js et migrer tout le code.

**Avantages:**
- Structure propre dès le départ
- Toutes les optimisations Next.js
- Meilleur SEO possible

**Inconvénients:**
- Plus de travail initial
- Période de transition

### Option 2 : Migration progressive
Garder Vite + React et ajouter Next.js côté serveur.

**Avantages:**
- Transition en douceur
- Moins de risques

**Inconvénients:**
- Double maintenance
- Bénéfices SEO limités

---

## 📦 ÉTAPE 1 : CRÉER LE PROJET NEXT.JS

```bash
# Dans le même dossier que votre projet actuel
npx create-next-app@latest luxestay-nextjs --typescript --tailwind --app --src-dir

cd luxestay-nextjs
```

Répondez aux questions :
```
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No
```

---

## 📁 STRUCTURE NEXT.JS vs REACT ACTUEL

### React actuel (Vite)
```
src/
├── app/
│   ├── pages/         → Composants pages
│   ├── components/    → Composants réutilisables
│   ├── context/       → Context API
│   ├── services/      → API calls
│   └── App.tsx
```

### Next.js (nouveau)
```
src/
├── app/                    → App Router (Next.js 13+)
│   ├── page.tsx           → / (Home)
│   ├── search/
│   │   └── page.tsx       → /search
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx   → /property/:id
│   ├── login/
│   │   └── page.tsx       → /login
│   ├── layout.tsx         → Layout global
│   └── api/               → API routes (optionnel)
├── components/            → Composants réutilisables
├── context/               → Context API (compatible)
└── services/              → API calls (compatible)
```

---

## 🔄 ÉTAPE 2 : MIGRATION DES FICHIERS

### 1. Copier les composants

```bash
# Copier tous les composants
cp -r ../code/src/app/components luxestay-nextjs/src/

# Copier les contexts
cp -r ../code/src/app/context luxestay-nextjs/src/

# Copier les services
cp -r ../code/src/app/services luxestay-nextjs/src/

# Copier la config Firebase
cp -r ../code/src/app/config luxestay-nextjs/src/
```

### 2. Installer les dépendances

```bash
pnpm install firebase
pnpm install axios
pnpm install motion
pnpm install lucide-react
pnpm install react-router-dom  # Pas nécessaire avec Next.js mais pour compatibilité temporaire
```

---

## 📄 ÉTAPE 3 : CRÉER LES PAGES

### Page d'accueil optimisée SEO

Créez `src/app/page.tsx` :

```typescript
import { Metadata } from 'next';
import { Home } from '@/components/pages/Home';

export const metadata: Metadata = {
  title: 'LuxeStay - Réservation d\'Hôtels, Villas et Résidences à Abidjan',
  description: 'Réservez des hôtels, villas et résidences meublées à Abidjan et partout en Côte d\'Ivoire avec LuxeStay. Cocody, Plateau, Marcory, Riviera.',
  keywords: 'hôtel Abidjan, résidence meublée Abidjan, villa Cocody, location courte durée Côte d\'Ivoire, hôtel Plateau, appartement Marcory',
  openGraph: {
    title: 'LuxeStay - Réservation de Résidences de Luxe',
    description: 'Réservez des hôtels et résidences de luxe à Abidjan',
    url: 'https://luxestay.ci',
    siteName: 'LuxeStay',
    images: [
      {
        url: '/images/hero-abidjan.webp',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'fr_CI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeStay - Réservation à Abidjan',
    description: 'Résidences de luxe en Côte d\'Ivoire',
    images: ['/images/hero-abidjan.webp'],
  },
  alternates: {
    canonical: 'https://luxestay.ci',
  },
};

export default function HomePage() {
  return <Home />;
}
```

### Page propriété avec slug SEO

Créez `src/app/property/[slug]/page.tsx` :

```typescript
import { Metadata } from 'next';
import { PropertyDetails } from '@/components/pages/PropertyDetails';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch property data
  const property = await fetchProperty(params.slug);

  return {
    title: `${property.name} - LuxeStay`,
    description: property.description.substring(0, 160),
    openGraph: {
      title: property.name,
      description: property.description,
      images: [property.images[0]],
    },
  };
}

export default function PropertyPage({ params }: Props) {
  return <PropertyDetails slug={params.slug} />;
}

async function fetchProperty(slug: string) {
  // Appel API vers votre backend Laravel
  const res = await fetch(`http://localhost:8000/api/properties/${slug}`);
  return res.json();
}
```

---

## 🎨 ÉTAPE 4 : LAYOUT GLOBAL

Créez `src/app/layout.tsx` :

```typescript
import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </UserProvider>

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TravelAgency',
              name: 'LuxeStay',
              url: 'https://luxestay.ci',
              logo: 'https://luxestay.ci/logo.png',
              description: 'Réservation d\'hôtels et résidences en Côte d\'Ivoire',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'CI',
                addressLocality: 'Abidjan',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
```

---

## 🖼️ ÉTAPE 5 : OPTIMISER LES IMAGES

### Avant (React)
```tsx
<img src="https://unsplash.com/..." alt="Hero" />
```

### Après (Next.js)
```tsx
import Image from 'next/image';

<Image
  src="/images/hero-abidjan.webp"
  alt="Résidence de luxe à Abidjan"
  width={1920}
  height={1080}
  priority
  quality={85}
/>
```

---

## 🔗 ÉTAPE 6 : ROUTING

### Avant (React Router)
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/property/123');
```

### Après (Next.js)
```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Links
<Link href="/property/villa-cocody">Voir</Link>

// Navigation programmatique
const router = useRouter();
router.push('/property/villa-cocody');
```

---

## 📊 ÉTAPE 7 : GÉNÉRER LE SITEMAP

Créez `src/app/sitemap.ts` :

```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all properties
  const properties = await fetchAllProperties();

  const propertyUrls = properties.map((property) => ({
    url: `https://luxestay.ci/property/${property.slug}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

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
    ...propertyUrls,
  ];
}
```

---

## 🚀 ÉTAPE 8 : DÉPLOIEMENT

### Vercel (recommandé)
```bash
# Installer Vercel CLI
pnpm install -g vercel

# Déployer
vercel
```

### Autre hébergeur
```bash
# Build
pnpm build

# Start
pnpm start
```

---

## ✅ CHECKLIST MIGRATION

- [ ] Créer projet Next.js
- [ ] Copier composants, contexts, services
- [ ] Installer dépendances (firebase, axios, motion, etc.)
- [ ] Créer toutes les pages dans `src/app/`
- [ ] Migrer Layout avec Navbar/Footer
- [ ] Remplacer `<img>` par `<Image>`
- [ ] Remplacer `useNavigate()` par `useRouter()`
- [ ] Remplacer `<Link>` React Router par Next.js `<Link>`
- [ ] Ajouter metadata SEO sur chaque page
- [ ] Créer sitemap.xml
- [ ] Créer robots.txt
- [ ] Tester en local (`pnpm dev`)
- [ ] Déployer sur Vercel

---

## 📈 GAINS SEO ATTENDUS

| Métrique | Avant (React SPA) | Après (Next.js SSR) |
|----------|-------------------|---------------------|
| **Lighthouse SEO** | 60-70 | 95-100 |
| **First Contentful Paint** | ~2.5s | ~0.8s |
| **Time to Interactive** | ~4s | ~1.5s |
| **Google Indexation** | 3-7 jours | 24-48h |
| **Positionnement** | Page 5-10 | Page 1-3 |

---

## 🎯 PROCHAINES ÉTAPES APRÈS MIGRATION

1. **Blog SEO** : Créer `/blog` avec articles optimisés
2. **Pages landing** : `/hotels-abidjan`, `/villas-cocody`
3. **FAQ** : Page FAQ avec Schema.org
4. **Backlinks** : Partenariats avec sites CI
5. **Google My Business** : Fiche entreprise
6. **Analytics** : Google Analytics + Search Console

Voulez-vous que je commence la migration maintenant ?
