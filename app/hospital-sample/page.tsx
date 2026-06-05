import type { Metadata } from 'next'
import HospitalSampleClient from './HospitalSampleClient'

export const metadata: Metadata = {
  title: 'Seoul Skin Clinic | 피부과 시술 정보',
  description:
    '서울스킨클리닉 강남점의 피부과 시술 정보, 의료진 검수 Q&A, 다국어 방문 안내를 한곳에서 확인할 수 있습니다.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Seoul Skin Clinic | 피부과 시술 정보',
    description:
      '여드름 흉터, 보톡스, 기미 치료 등 피부과 상담 전 확인할 정보를 의료진 검수 콘텐츠로 제공합니다.',
    url: 'https://www.blinkad.kr/hospital-sample',
    siteName: 'BlinkAd',
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
      'Doctor-reviewed dermatology information for acne scars, botulinum toxin treatment, pigmentation care, and international patient preparation.',
    medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
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
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: 'https://www.blinkad.kr/hospital-sample',
    name: 'Seoul Skin Clinic patient education',
    description:
      'Patient education and clinic visit information reviewed by a physician.',
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    audience: 'https://schema.org/Patient',
    specialty: 'https://schema.org/Dermatology',
    lastReviewed: reviewedAt,
    dateModified: reviewedAt,
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
