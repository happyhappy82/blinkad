import type { Metadata } from 'next'
import HospitalSampleClient from './HospitalSampleClient'

export const metadata: Metadata = {
  title: 'Seoul Clinic Answers | Hospital AEO Website Sample',
  description:
    'A multilingual hospital AEO content hub sample for doctor-reviewed Q&A, procedure guides, patient education, and AI answer visibility.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Seoul Clinic Answers | Hospital AEO Website Sample',
    description:
      'Doctor-reviewed multilingual Q&A and procedure guide sample for hospital AEO and GEO strategy.',
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
    name: 'Seoul Clinic Answers',
    alternateName: ['서울클리닉답변', 'ソウルクリニックアンサー', '首尔诊所问答'],
    url: 'https://www.blinkad.kr/hospital-sample',
    description:
      'A doctor-reviewed multilingual patient education hub for dermatology and aesthetic procedure questions.',
    medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
    sameAs: [
      'https://www.blinkad.kr',
      'https://www.blinkad.kr/hospital-sample',
    ],
    department: {
      '@type': 'MedicalBusiness',
      name: 'Seoul Clinic Answers Gangnam',
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
      name: 'Seoul Clinic Answers',
    },
    identifier: 'KMA-SAMPLE-24819',
    sameAs: [
      'https://www.blinkad.kr/hospital-sample#doctors',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: 'https://www.blinkad.kr/hospital-sample',
    name: 'Seoul Clinic Answers',
    description:
      'Doctor-reviewed dermatology and aesthetic procedure Q&A for patients and international visitors.',
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    audience: 'https://schema.org/Patient',
    specialty: 'https://schema.org/Dermatology',
    lastReviewed: reviewedAt,
    datePublished: reviewedAt,
    dateModified: reviewedAt,
    mainContentOfPage: [
      'Procedure answers',
      'Patient education',
      'Doctor review',
      'Multilingual visit information',
    ],
    reviewedBy: {
      '@type': 'Physician',
      name: 'Dr. Min Jae Lee',
      jobTitle: 'Medical Director',
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'Seoul Clinic Answers',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does Botox usually last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Botulinum toxin treatment commonly starts to show effect within a few days and often lasts around three to six months depending on the area, dose, and individual muscle activity. A licensed clinician should assess the treatment interval.',
          author: {
            '@type': 'Physician',
            name: 'Dr. Min Jae Lee',
          },
          dateModified: reviewedAt,
        },
      },
      {
        '@type': 'Question',
        name: 'Can international patients use this guide before visiting a Korean clinic?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This guide is for patient education and visit preparation only. Diagnosis, treatment choice, and medical advice must be confirmed during an in-person consultation with a licensed clinician.',
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
