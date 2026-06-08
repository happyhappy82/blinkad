import type { Metadata } from 'next'
import ColumnArticleClient from './ColumnArticleClient'

export const metadata: Metadata = {
  applicationName: '블링크 피부과의원',
  title: '강남 피부과 여드름 흉터 치료, 어떤 순서로 시작해야 할까? | 블링크 피부과의원',
  description:
    '블링크 피부과의원이 여드름 흉터 타입별 치료 순서와 프랙셔널 레이저, 서브시전, TCA 크로스, RF 마이크로니들링 선택 기준을 의료진 검수 콘텐츠로 정리합니다.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: '강남 피부과 여드름 흉터 치료, 어떤 순서로 시작해야 할까?',
    description:
      '여드름 흉터 타입별 치료 순서와 시술 전 확인할 점을 블링크 피부과의원 의료진 검수 콘텐츠로 정리합니다.',
    url: 'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment',
    siteName: '블링크 피부과의원',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
        width: 1200,
        height: 800,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '강남 피부과 여드름 흉터 치료, 어떤 순서로 시작해야 할까?',
    description:
      '블링크 피부과의원이 여드름 흉터 타입별 치료 순서와 시술 전 확인할 점을 정리합니다.',
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
    ],
  },
}

const reviewedAt = '2026-06-05'
const articleUrl = 'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment'
const articleImage =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85'

const hospitalJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: '블링크 피부과의원',
    alternateName: ['Blink Dermatology Clinic', '블링크피부과', 'ブリンク皮膚科クリニック', 'Blink皮肤科诊所'],
    url: 'https://www.blinkad.kr/hospital-sample',
    description:
      'Doctor-reviewed dermatology information for acne scar treatment, acne care, laser procedures, botulinum toxin treatment, pigmentation care, and international patient preparation.',
    medicalSpecialty: ['Dermatology'],
    sameAs: [
      'https://www.blinkad.kr',
      articleUrl,
    ],
    department: {
      '@type': 'MedicalBusiness',
      name: '블링크 피부과의원 강남',
      telephone: '+82-2-555-0148',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '12 Teheran-ro 10-gil',
        addressLocality: 'Gangnam-gu',
        addressRegion: 'Seoul',
        postalCode: '06234',
        addressCountry: 'KR',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '10:00',
          closes: '19:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '10:00',
          closes: '15:00',
        },
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': 'https://www.blinkad.kr/hospital-sample#local-business',
    name: '블링크 피부과의원',
    url: 'https://www.blinkad.kr/hospital-sample',
    image: articleImage,
    telephone: '+82-2-555-0148',
    priceRange: '₩₩',
    medicalSpecialty: 'Dermatology',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '12 Teheran-ro 10-gil',
      addressLocality: 'Gangnam-gu',
      addressRegion: 'Seoul',
      postalCode: '06234',
      addressCountry: 'KR',
    },
    areaServed: ['Gangnam-gu', 'Seoul', 'Korea'],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '15:00',
      },
    ],
    sameAs: [
      'https://www.blinkad.kr/hospital-sample',
      articleUrl,
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr. Min Seo Kim',
    alternateName: '김민서 원장',
    jobTitle: 'Medical Director',
    medicalSpecialty: 'Dermatology',
    worksFor: {
      '@type': 'MedicalOrganization',
      name: '블링크 피부과의원',
    },
    identifier: 'KMA-SAMPLE-24819',
    sameAs: [
      'https://www.blinkad.kr/hospital-sample#doctors',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: articleUrl,
    name: 'Acne scar treatment guide',
    description:
      'Doctor-reviewed patient education about acne scar types, treatment order, aftercare, and consultation preparation.',
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    audience: 'https://schema.org/Patient',
    specialty: 'https://schema.org/Dermatology',
    lastReviewed: reviewedAt,
    datePublished: reviewedAt,
    dateModified: reviewedAt,
    mainContentOfPage: [
      'Acne scar types',
      'Treatment order',
      'Aftercare',
      'Frequently asked questions',
    ],
    reviewedBy: {
      '@type': 'Physician',
      name: 'Dr. Min Seo Kim',
      jobTitle: 'Medical Director',
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: '블링크 피부과의원',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '강남 피부과 여드름 흉터 치료, 어떤 순서로 시작해야 할까?',
    alternativeHeadline: 'Acne scar treatment: where should you start?',
    image: [articleImage],
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: reviewedAt,
    dateModified: reviewedAt,
    author: {
      '@type': 'Physician',
      name: 'Dr. Min Seo Kim',
      alternateName: '김민서 원장',
      medicalSpecialty: 'Dermatology',
      worksFor: {
        '@type': 'MedicalOrganization',
        name: '블링크 피부과의원',
      },
    },
    reviewedBy: {
      '@type': 'Physician',
      name: 'Dr. Min Seo Kim',
      jobTitle: 'Medical Director',
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: '블링크 피부과의원',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.blinkad.kr/logo-black-nav.png',
      },
    },
    about: [
      'Acne scar treatment',
      'Dermatology',
      'Fractional laser',
      'Subcision',
      'TCA CROSS',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can acne scar treatment be done while active acne is still present?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Active acne often needs to be controlled before acne scar procedures. Ongoing inflammation can create new scars and make the treatment plan less stable.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Seo Kim',
          },
          dateModified: reviewedAt,
        },
      },
      {
        '@type': 'Question',
        name: 'How much improvement can be expected after one acne scar treatment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A single session usually cannot guarantee a large change. Acne scar treatment is commonly planned over repeated sessions to make scars gradually less visible.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Seo Kim',
          },
          dateModified: reviewedAt,
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '블링크 피부과의원',
        item: 'https://www.blinkad.kr/hospital-sample',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '피부과 칼럼',
        item: 'https://www.blinkad.kr/hospital-sample#columns',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '여드름 흉터 치료 순서',
        item: articleUrl,
      },
    ],
  },
]

export default function AcneScarTreatmentColumnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hospitalJsonLd),
        }}
      />
      <ColumnArticleClient />
    </>
  )
}
