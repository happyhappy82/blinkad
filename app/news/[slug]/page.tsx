import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { NEWS_POSTS } from '@/constants/news';

const SITE_URL = 'https://www.blinkad.kr';
const NEWS_BASE_URL = `${SITE_URL}/news`;
const SITE_NAME = 'BlinkAd';

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDateToISO(dateStr: string): string {
  return dateStr.replace(/\./g, '-');
}

export async function generateStaticParams() {
  return NEWS_POSTS.map((post) => ({
    slug: post.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = NEWS_POSTS.find((p) => p.id === slug);

  if (!post) {
    return {
      title: `News Not Found - ${SITE_NAME}`,
    };
  }

  const canonicalUrl = `${NEWS_BASE_URL}/${post.id}`;

  return {
    title: `${post.title} | ${SITE_NAME} 회사소식`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} | ${SITE_NAME} 회사소식`,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 734,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${SITE_NAME} 회사소식`,
      description: post.excerpt,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = NEWS_POSTS.find((p) => p.id === slug);

  if (!post) {
    notFound();
  }

  const isoDate = formatDateToISO(post.date);
  const canonicalUrl = `${NEWS_BASE_URL}/${post.id}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-white-nav.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '회사소식',
        item: NEWS_BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt={SITE_NAME} className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/foreign-marketing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">외국인마케팅</Link>
            <Link href="/services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">서비스</Link>
            <Link href="/case-studies" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</Link>
            <Link href="/blog" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">블로그</Link>
            <Link href="/news" className="text-sm font-medium text-white transition-colors">회사소식</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">문의하기</Link>
          </div>

          <Link
            href="/contact"
            className="bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            무료 진단하기
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/news"
            className="group mb-8 inline-flex items-center text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">회사소식으로 돌아가기</span>
          </Link>

          <header className="mb-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-medium text-brand-blue">
                {post.category}
              </span>
              <time dateTime={isoDate} className="text-sm text-gray-400">
                {post.date}
              </time>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white keep-all md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-8 flex items-center gap-3 border-b border-white/10 pb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue">
                <span className="text-sm font-bold text-white">BA</span>
              </div>
              <div>
                <p className="font-medium text-white">{SITE_NAME} Team</p>
                <p className="text-sm text-gray-400">Company News</p>
              </div>
            </div>
          </header>

          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-gray-300
              prose-strong:text-white
              prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
