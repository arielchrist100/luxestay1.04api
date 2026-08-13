import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// ✅ Meta tags SEO - Google voit TOUT ça côté serveur
export const metadata: Metadata = {
  title: 'LuxeStay - Réservation d\'Hôtels, Villas et Résidences de Luxe à Abidjan',
  description: 'Réservez des hôtels 5 étoiles, villas avec piscine et résidences meublées à Abidjan. Cocody, Plateau, Marcory, Riviera. Les meilleurs hébergements en Côte d\'Ivoire.',
  keywords: [
    'hôtel Abidjan',
    'résidence meublée Abidjan',
    'villa Cocody',
    'location courte durée Côte d\'Ivoire',
    'hôtel luxe Plateau',
    'appartement Marcory',
    'résidence Riviera',
    'hébergement Abidjan'
  ].join(', '),

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: 'LuxeStay - Réservation de Résidences de Luxe à Abidjan',
    description: 'Trouvez votre hébergement parfait en Côte d\'Ivoire',
    url: 'https://luxestay.ci',
    siteName: 'LuxeStay',
    images: [
      {
        url: 'https://luxestay.ci/images/hero-abidjan.webp',
        width: 1200,
        height: 630,
        alt: 'Résidence de luxe à Abidjan avec piscine',
      }
    ],
    locale: 'fr_CI',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeStay - Résidences de Luxe à Abidjan',
    description: 'Réservez des hôtels et villas en Côte d\'Ivoire',
    images: ['https://luxestay.ci/images/hero-abidjan.webp'],
  },

  // Canonical URL (éviter duplicate content)
  alternates: {
    canonical: 'https://luxestay.ci',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section avec H1 SEO */}
      <section className="relative h-screen">
        <Image
          src="/images/hero-abidjan.webp"
          alt="Résidence de luxe avec piscine à Cocody, Abidjan"
          fill
          priority
          quality={90}
          className="object-cover"
        />

        <div className="relative z-10 flex items-center justify-center h-full bg-black/40">
          <div className="text-center text-white px-4">
            {/* ✅ H1 optimisé pour SEO */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Réservez des Hôtels, Villas et Résidences de Luxe à Abidjan
            </h1>

            <p className="text-xl md:text-2xl mb-8">
              Les meilleurs hébergements en Côte d'Ivoire • Cocody • Plateau • Marcory
            </p>

            <Link
              href="/search"
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity text-lg inline-block"
            >
              Commencer la recherche
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Section avec contenu texte pour SEO */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">
          Résidences Meublées et Hôtels à Abidjan
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-lg text-muted-foreground mb-4">
              LuxeStay vous propose une sélection exclusive de <strong>résidences meublées</strong>,
              <strong> villas de luxe</strong>, <strong>appartements modernes</strong> et
              <strong> hôtels 5 étoiles</strong> dans les meilleurs quartiers d'Abidjan.
            </p>

            <p className="text-lg text-muted-foreground mb-4">
              Que vous soyez en déplacement professionnel ou en vacances, trouvez l'hébergement
              parfait à <strong>Cocody</strong>, <strong>Plateau</strong>, <strong>Marcory</strong>,
              <strong> Riviera</strong> ou <strong>Deux-Plateaux</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4">
              Pourquoi choisir LuxeStay ?
            </h3>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Paiement sécurisé et service client 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Propriétés vérifiées avec photos authentiques</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Réservation instantanée sans frais cachés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Annulation flexible selon les conditions</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ✅ Quartiers populaires avec liens internes */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">
            Explorez les Quartiers d'Abidjan
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search?city=cocody" className="group">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src="/images/quartiers/cocody.webp"
                  alt="Hôtels et villas à Cocody"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-semibold">Cocody</h3>
                </div>
              </div>
            </Link>

            <Link href="/search?city=plateau" className="group">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src="/images/quartiers/plateau.webp"
                  alt="Hôtels au Plateau Abidjan"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-semibold">Plateau</h3>
                </div>
              </div>
            </Link>

            <Link href="/search?city=marcory" className="group">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src="/images/quartiers/marcory.webp"
                  alt="Résidences à Marcory"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-semibold">Marcory</h3>
                </div>
              </div>
            </Link>

            <Link href="/search?city=riviera" className="group">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src="/images/quartiers/riviera.webp"
                  alt="Appartements Riviera Abidjan"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-semibold">Riviera</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Schema.org pour Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            name: 'LuxeStay',
            description: 'Réservation d\'hôtels et résidences de luxe en Côte d\'Ivoire',
            url: 'https://luxestay.ci',
            logo: 'https://luxestay.ci/logo.png',
            image: 'https://luxestay.ci/images/hero-abidjan.webp',
            priceRange: '$$$',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'CI',
              addressLocality: 'Abidjan',
              addressRegion: 'Abidjan',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 5.345317,
              longitude: -4.024429,
            },
            sameAs: [
              'https://www.facebook.com/luxestayci',
              'https://www.instagram.com/luxestayci',
              'https://twitter.com/luxestayci',
            ],
          }),
        }}
      />
    </>
  );
}
