import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { NEWS_POSTS } from '@/constants/news';

const SITE_URL = 'https://www.blinkad.kr';
const NEWS_BASE_URL = `${SITE_URL}/news`;
const SITE_NAME = 'BlinkAds';

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDateToISO(dateStr: string): string {
  return dateStr.replace(/\./g, '-');
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
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
  const leadImageUrl = post.imageUrls?.[0] ? toAbsoluteUrl(post.imageUrls[0]) : `${SITE_URL}/og-image.png`;

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
          url: leadImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${SITE_NAME} 회사소식`,
      description: post.excerpt,
      images: [leadImageUrl],
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
  const leadImageUrl = post.imageUrls?.[0] ? toAbsoluteUrl(post.imageUrls[0]) : '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    ...(leadImageUrl && { image: leadImageUrl }),
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

      <Navbar />

      <main className="px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-32">
        <article className="mx-auto max-w-4xl">
          <Link
            href="/news"
            className="group mb-8 inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white md:mb-10"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">회사소식으로 돌아가기</span>
          </Link>

          <header className="mb-9 md:mb-12">
            <div className="mb-5 flex items-center gap-3 text-xs md:text-sm">
              <span className="font-semibold text-brand-blue">
                {post.category}
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <time dateTime={isoDate} className="text-sm text-gray-400">
                {post.date}
              </time>
            </div>

            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white keep-all md:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h1>

            <div className="mt-7 border-b border-white/10 pb-7 md:mt-9 md:pb-9">
              <p className="text-sm font-medium text-gray-300">{SITE_NAME} Team</p>
            </div>
          </header>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-10 grid gap-3 sm:grid-cols-2 md:mb-14 md:gap-4">
              {post.imageUrls.map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-900"
                >
                  <Image
                    src={imageUrl}
                    alt={`${post.imageAlt ?? post.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) calc(100vw - 40px), 440px"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          )}

          <div
            className="prose prose-invert max-w-3xl
              prose-headings:text-white prose-headings:font-bold
              prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl md:prose-h2:mt-12 md:prose-h2:text-3xl
              prose-p:mb-5 prose-p:text-[1rem] prose-p:leading-8 prose-p:text-gray-300 md:prose-p:text-lg
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
