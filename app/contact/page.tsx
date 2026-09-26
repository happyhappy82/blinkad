import type { Metadata } from 'next';
import DiagnosisContactPage from '@/components/DiagnosisContactPage';
import Navbar from '@/components/Navbar';
import { NestContactPage } from '@/components/NestInquiry';
import { NEST_PRODUCTS, resolveNestArticle } from '@/lib/nest-content';

type Props = { searchParams: Promise<{ service?: string | string[]; topic?: string | string[] }> };
async function getArticle(searchParams: Props['searchParams']) {
  const query = await searchParams;
  return resolveNestArticle(typeof query.service === 'string' ? query.service : undefined, typeof query.topic === 'string' ? query.topic : undefined);
}

const defaultMetadata: Metadata = {
  title: '무료 업장 진단 | BlinkAd',
  description: '블링크애드 전문가가 업장 현황을 무료로 진단하고 구글 SEO·AEO·GEO 개선 방향을 제안합니다.',
  alternates: {
    canonical: '/contact',
  },
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const article = await getArticle(searchParams);
  return article ? { ...defaultMetadata, title: `${NEST_PRODUCTS[article.product]} 도입 상담`, description: '현재 쓰는 상담 채널과 불편한 업무를 알려주세요. 필요한 기능과 설정 범위를 확인해 안내드립니다.' } : defaultMetadata;
}

export default async function ContactPage({ searchParams }: Props) {
  const article = await getArticle(searchParams);
  const query = await searchParams;
  return (
    <>
      <Navbar />
      {article ? <NestContactPage article={article} hasArticleContext={query.topic === article.id} /> : <DiagnosisContactPage />}
    </>
  );
}
