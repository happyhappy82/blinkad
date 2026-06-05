import type { Metadata } from 'next'
import ColumnArticleClient from './ColumnArticleClient'

export const metadata: Metadata = {
  applicationName: 'Seoul Skin Clinic',
  title: '여드름 흉터 치료, 어떤 방법부터 시작해야 좋을까? | Seoul Skin Clinic',
  description:
    '여드름 흉터 타입별 치료 순서와 프랙셔널 레이저, 서브시전, TCA 크로스, RF 마이크로니들링 선택 기준을 의료진 검수 콘텐츠로 정리합니다.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: '여드름 흉터 치료, 어떤 방법부터 시작해야 좋을까?',
    description:
      '여드름 흉터 타입별 치료 순서와 시술 전 확인할 점을 의료진 검수 콘텐츠로 정리합니다.',
    url: 'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment',
    siteName: 'Seoul Skin Clinic',
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
    title: '여드름 흉터 치료, 어떤 방법부터 시작해야 좋을까?',
    description:
      '여드름 흉터 타입별 치료 순서와 시술 전 확인할 점을 의료진 검수 콘텐츠로 정리합니다.',
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
    ],
  },
}

const reviewedAt = '2026-06-05'

const hospitalJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Seoul Skin Clinic',
    alternateName: ['서울스킨클리닉', 'Seoul Skin Clinic Gangnam', 'ソウルスキンクリニック', '首尔皮肤诊所'],
    url: 'https://www.blinkad.kr/hospital-sample',
    description:
      'Doctor-reviewed dermatology information for acne scar treatment, laser procedures, and international patient preparation.',
    medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
    sameAs: [
      'https://www.blinkad.kr',
      'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment',
    ],
    department: {
      '@type': 'MedicalBusiness',
      name: 'Seoul Skin Clinic Gangnam',
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
    '@type': 'Physician',
    name: 'Dr. Min Jae Lee',
    alternateName: '이민재 원장',
    jobTitle: 'Medical Director',
    medicalSpecialty: 'Dermatology',
    worksFor: {
      '@type': 'MedicalOrganization',
      name: 'Seoul Skin Clinic',
    },
    identifier: 'KMA-SAMPLE-24819',
    sameAs: [
      'https://www.blinkad.kr/hospital-sample#doctors',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: 'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment',
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
      name: 'Dr. Min Jae Lee',
      jobTitle: 'Medical Director',
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'Seoul Skin Clinic',
    },
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
            name: 'Dr. Min Jae Lee',
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
            name: 'Dr. Min Jae Lee',
          },
          dateModified: reviewedAt,
        },
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
