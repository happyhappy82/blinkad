import type { Metadata } from 'next'
import RestaurantSampleClient from './RestaurantSampleClient'

export const metadata: Metadata = {
  title: '하늘식탁 | Restaurant GBP Website Sample',
  description:
    'Dishoom-style restaurant website sample for Google Business Profile, local search, AI answers, and multilingual visitors.',
  robots: {
    index: false,
    follow: false,
  },
}

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: '하늘식탁',
  alternateName: ['Haneul Table', 'ハヌルシクタク', '天空餐桌'],
  url: 'https://www.blinkad.kr/restaurant-sample',
  image: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1600&q=85',
  ],
  telephone: '+82-2-734-1950',
  email: 'hello@haneultable.example',
  priceRange: '$$',
  servesCuisine: ['Korean', 'Modern Korean', 'Seasonal'],
  acceptsReservations: true,
  menu: 'https://www.blinkad.kr/restaurant-sample#menu',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '15-3 Bukchon-ro 5-gil',
    addressLocality: 'Jongno-gu',
    addressRegion: 'Seoul',
    postalCode: '03053',
    addressCountry: 'KR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.579617,
    longitude: 126.984852,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '11:30',
      closes: '22:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '11:00',
      closes: '22:30',
    },
  ],
  amenityFeature: [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'English menu',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Vegetarian options',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Group dining',
      value: true,
    },
  ],
}

export default function RestaurantSamplePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd),
        }}
      />
      <RestaurantSampleClient />
    </>
  )
}
