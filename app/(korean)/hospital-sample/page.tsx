import type { Metadata } from 'next'
import HospitalSampleClient from './HospitalSampleClient'

export const metadata: Metadata = {
  applicationName: '블링크 피부과의원',
  title: '블링크 피부과의원 | 강남 피부과 상담 전 확인할 질문',
  description:
    '블링크 피부과의원의 여드름, 여드름 흉터, 보톡스, 기미·색소, 리프팅 상담 전 자주 묻는 질문과 의료진 검수 정보를 확인할 수 있습니다.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: '블링크 피부과의원 | 강남 피부과 상담 전 확인할 질문',
    description:
      '강남 피부과 상담 전 많이 묻는 여드름, 보톡스, 기미·색소, 리프팅 질문을 의료진 검수 Q&A로 정리합니다.',
    url: 'https://www.blinkad.kr/hospital-sample',
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
    title: '블링크 피부과의원 | 강남 피부과 상담 전 확인할 질문',
    description:
      '블링크 피부과의원의 피부과 시술 정보와 의료진 검수 Q&A를 확인할 수 있습니다.',
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
    name: '블링크 피부과의원',
    alternateName: ['Blink Dermatology Clinic', '블링크피부과', 'ブリンク皮膚科クリニック', 'Blink皮肤科诊所'],
    url: 'https://www.blinkad.kr/hospital-sample',
    description:
      'Doctor-reviewed dermatology Q&A and local visit information for acne, acne scars, botulinum toxin treatment, pigmentation care, lifting, and international patient preparation.',
    medicalSpecialty: ['Dermatology'],
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
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': 'https://www.blinkad.kr/hospital-sample#local-business',
    name: '블링크 피부과의원',
    url: 'https://www.blinkad.kr/hospital-sample',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
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
      'https://www.blinkad.kr/hospital-sample/columns/acne-scar-treatment',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: 'https://www.blinkad.kr/hospital-sample',
    name: '블링크 피부과의원 피부과 상담 Q&A',
    description:
      'Patient education, frequently asked dermatology questions, and clinic visit information reviewed by a physician.',
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    audience: 'https://schema.org/Patient',
    specialty: 'https://schema.org/Dermatology',
    lastReviewed: reviewedAt,
    dateModified: reviewedAt,
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
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '강남 피부과에서 여드름 치료는 어디서부터 시작하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '반복되는 여드름은 압출이나 장비명보다 원인 확인이 먼저입니다. 염증 정도, 피지 분비, 생활 패턴, 복용 약을 확인한 뒤 약물, 스킨케어, 레이저 보조치료를 단계적으로 조합합니다.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Seo Kim',
          },
          dateModified: reviewedAt,
        },
      },
      {
        '@type': 'Question',
        name: '보톡스 효과는 얼마나 지속되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '보툴리눔 톡신 효과는 부위, 용량, 근육 사용량에 따라 다르지만 일반적으로 3~6개월 정도 유지됩니다. 반복 간격은 내성 위험과 시술 부위를 고려해 의료진과 정해야 합니다.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Seo Kim',
          },
          dateModified: reviewedAt,
        },
      },
      {
        '@type': 'Question',
        name: '기미 치료는 레이저 한 번으로 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '기미와 색소는 멜라닌, 염증, 호르몬, 자외선 노출이 함께 작용하는 경우가 많아 한 번의 레이저로 끝나기 어렵습니다. 악화 위험과 재발 관리를 먼저 설명받는 것이 중요합니다.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Seo Kim',
          },
          dateModified: reviewedAt,
        },
      },
    ],
  },
]

export default function HospitalSamplePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hospitalJsonLd),
        }}
      />
      <HospitalSampleClient />
    </>
  )
}
