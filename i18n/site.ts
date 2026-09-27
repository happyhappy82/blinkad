import type { ForeignLanguage } from '@/lib/site-languages'

// Homepage-only wording approved by the user. Other page titles remain unchanged.
export const englishHomeCopy = {
  title: 'BlinkAd | Korea Inbound Tourism Marketing Agency for Foreign Tourists — Google Maps & Google Business Profile',
  heading: 'BlinkAd is an inbound tourism marketing agency in Korea. We help Korean hospitals, clinics, restaurants and local brands attract foreign tourists through Google Maps and Google Business Profile.',
} as const

export const siteCopy = {
  en: {
    title: 'BlinkAd | Google, AEO & GEO Marketing Agency',
    description: 'Connect Google Search, Maps, websites and AI search to reach international customers. Marketing for healthcare, restaurants and local brands in Korea.',
    insights: 'Insights',
    insightsDescription: 'Practical insights on Google marketing, international customers and AI search.',
    archive: 'Our article archive is currently available in Korean. The links below open the original Korean articles.',
    readOriginal: 'Read article in Korean →',
    notFound: 'Page not found',
    notFoundDescription: 'This page may have moved or does not exist.',
    backHome: 'Back to home',
    hospitalTitle: 'BLINK Clinic | Website Demo',
    hospitalDescription: 'A multilingual clinic website demonstration.',
    restaurantTitle: 'Haneul Table | Restaurant Website Demo',
    restaurantDescription: 'A multilingual restaurant website demonstration.',
  },
  ja: {
    title: 'BlinkAd | Google・AEO・GEOマーケティング',
    description: 'Google検索・マップ、ウェブサイト、AI検索をつなぎ、韓国の医療機関・飲食店・地域ブランドの外国人集客を支援します。',
    insights: 'インサイト',
    insightsDescription: 'Googleマーケティング、外国人集客、AI検索に関する実務の知見をお届けします。',
    archive: '記事本文は現在、韓国語で公開しています。以下のリンクから韓国語の原文をご覧いただけます。',
    readOriginal: '韓国語の原文を読む →',
    notFound: 'ページが見つかりません',
    notFoundDescription: 'ページが移動されたか、存在しない可能性があります。',
    backHome: 'ホームに戻る',
    hospitalTitle: 'BLINK Clinic | 医療機関サイトのデモ',
    hospitalDescription: '多言語対応の医療機関ウェブサイトのデモです。',
    restaurantTitle: 'Haneul Table | 飲食店サイトのデモ',
    restaurantDescription: '多言語対応の飲食店ウェブサイトのデモです。',
  },
  zh: {
    title: 'BlinkAd | Google、AEO与GEO营销服务',
    description: '连接Google搜索、地图、网站与AI搜索，帮助韩国医疗机构、餐饮店和本地品牌吸引国际客户。',
    insights: '行业洞察',
    insightsDescription: '分享Google营销、国际客户获客与AI搜索的实践经验。',
    archive: '文章正文目前以韩语发布。点击下方链接可阅读韩语原文。',
    readOriginal: '阅读韩语原文 →',
    notFound: '找不到该页面',
    notFoundDescription: '该页面可能已被移动或不存在。',
    backHome: '返回首页',
    hospitalTitle: 'BLINK Clinic | 医疗机构网站演示',
    hospitalDescription: '多语言医疗机构网站演示。',
    restaurantTitle: 'Haneul Table | 餐饮网站演示',
    restaurantDescription: '多语言餐饮网站演示。',
  },
} satisfies Record<ForeignLanguage, Record<string, string>>
