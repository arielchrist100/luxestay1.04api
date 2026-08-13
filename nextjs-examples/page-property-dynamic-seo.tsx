// src/app/property/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Property {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_per_night: number;
  city: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  images: string[];
  amenities: string[];
  owner: {
    name: string;
    verified: boolean;
  };
}

interface Props {
  params: { slug: string };
}

// ✅ Fetch data côté serveur (SSR)
async function fetchProperty(slug: string): Promise<Property | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/properties/${slug}`,
      {
        // Next.js cache management
        next: { revalidate: 60 }, // Revalider toutes les 60 secondes
      }
    );

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

// ✅ Génération DYNAMIQUE des meta tags (crucial pour SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await fetchProperty(params.slug);

  if (!property) {
    return {
      title: 'Propriété non trouvée - LuxeStay',
    };
  }

  const title = `${property.name} - ${property.city} | LuxeStay`;
  const description = `${property.description.substring(0, 155)}... Réservez dès maintenant à partir de ${property.price_per_night}€/nuit.`;

  return {
    title,
    description,
    keywords: [
      property.name,
      `hôtel ${property.city}`,
      `résidence ${property.city}`,
      `location ${property.city}`,
      property.amenities.join(', '),
    ].join(', '),

    openGraph: {
      title,
      description,
      url: `https://luxestay.ci/property/${property.slug}`,
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 630,
          alt: property.name,
        }
      ],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.images[0]],
    },

    alternates: {
      canonical: `https://luxestay.ci/property/${property.slug}`,
    },
  };
}

// ✅ Page component
export default async function PropertyPage({ params }: Props) {
  const property = await fetchProperty(params.slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb pour SEO */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li>/</li>
          <li><Link href="/search" className="hover:text-primary">Recherche</Link></li>
          <li>/</li>
          <li><Link href={`/search?city=${property.city}`} className="hover:text-primary">{property.city}</Link></li>
          <li>/</li>
          <li className="text-foreground">{property.name}</li>
        </ol>
      </nav>

      {/* Images */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 gap-2 h-[500px]">
          <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden">
            <Image
              src={property.images[0]}
              alt={`${property.name} - Photo principale`}
              fill
              priority
              quality={90}
              className="object-cover"
            />
          </div>
          {property.images.slice(1, 5).map((image, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden">
              <Image
                src={image}
                alt={`${property.name} - Photo ${i + 2}`}
                fill
                quality={80}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* ✅ H1 avec nom de la propriété */}
          <h1 className="text-4xl font-bold mb-4">
            {property.name}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-muted-foreground">
            <span>{property.city}, {property.country}</span>
            <span>•</span>
            <span>{property.bedrooms} chambres</span>
            <span>•</span>
            <span>{property.bathrooms} salles de bain</span>
            <span>•</span>
            <span>Jusqu'à {property.max_guests} voyageurs</span>
          </div>

          {/* ✅ H2 pour structurer le contenu */}
          <h2 className="text-2xl font-semibold mb-4">
            À propos de cet hébergement
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            {property.description}
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            Équipements et services
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {property.amenities.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Quartier : {property.city}
          </h2>

          <p className="text-muted-foreground">
            Cette propriété est située dans le quartier de {property.city},
            connu pour ses restaurants, commerces et sa proximité avec les
            principaux sites d'Abidjan.
          </p>
        </div>

        {/* Sidebar - Réservation */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 border border-border rounded-2xl p-6">
            <div className="text-3xl font-bold mb-6">
              {property.price_per_night}€ <span className="text-base font-normal text-muted-foreground">/ nuit</span>
            </div>

            <button className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity text-lg">
              Réserver maintenant
            </button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Vous ne serez pas débité pour le moment
            </p>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  👤
                </div>
                <div>
                  <p className="font-semibold">Hôte : {property.owner.name}</p>
                  {property.owner.verified && (
                    <p className="text-sm text-green-600">✓ Vérifié</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FAQ pour SEO (Schema.org) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">
          Questions fréquentes
        </h2>

        <div className="space-y-4">
          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              Quels sont les horaires d'arrivée et de départ ?
            </summary>
            <p className="mt-2 text-muted-foreground">
              L'arrivée se fait à partir de 14h00 et le départ avant 11h00.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              L'annulation est-elle gratuite ?
            </summary>
            <p className="mt-2 text-muted-foreground">
              Oui, annulation gratuite jusqu'à 48h avant l'arrivée.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              Le parking est-il inclus ?
            </summary>
            <p className="mt-2 text-muted-foreground">
              {property.amenities.includes('Parking')
                ? 'Oui, un parking gratuit est disponible.'
                : 'Parking non disponible dans cette propriété.'}
            </p>
          </details>
        </div>
      </section>

      {/* ✅ Schema.org - Product pour Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: property.name,
            description: property.description,
            image: property.images,
            offers: {
              '@type': 'Offer',
              price: property.price_per_night,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: `https://luxestay.ci/property/${property.slug}`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '127',
            },
          }),
        }}
      />

      {/* ✅ Schema.org - Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: 'https://luxestay.ci',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Recherche',
                item: 'https://luxestay.ci/search',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: property.city,
                item: `https://luxestay.ci/search?city=${property.city}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: property.name,
                item: `https://luxestay.ci/property/${property.slug}`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}

// ✅ Générer les pages statiques pour les propriétés populaires
export async function generateStaticParams() {
  // Fetch les propriétés les plus populaires
  const properties = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/properties?limit=100`
  ).then(res => res.json());

  return properties.map((property: Property) => ({
    slug: property.slug,
  }));
}
