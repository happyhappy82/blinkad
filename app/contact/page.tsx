import type { Metadata } from 'next';
import DiagnosisContactPage from '@/components/DiagnosisContactPage';

export const metadata: Metadata = {
  title: '무료 업장 진단 | BlinkAd',
  description: '블링크애드 전문가가 업장 현황을 무료로 진단하고 구글 SEO·AEO·GEO 개선 방향을 제안합니다.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return <DiagnosisContactPage />;
}
