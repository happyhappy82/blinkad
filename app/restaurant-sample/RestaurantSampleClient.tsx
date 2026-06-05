'use client'

import { useMemo, useState } from 'react'
import {
  Accessibility,
  ArrowUpRight,
  CalendarDays,
  Car,
  ChefHat,
  Clock,
  Languages,
  Leaf,
  MapPin,
  Navigation,
  Phone,
  Star,
  Train,
  Users,
  Utensils,
} from 'lucide-react'

const heroImage =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2400&q=88'
const diningImage =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85'
const grillImage =
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1600&q=85'
const noodleImage =
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85'
const tableImage =
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=85'

const languages = [
  { code: 'ko', label: 'KO', native: '한국어' },
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'ja', label: 'JA', native: '日本語' },
  { code: 'zh', label: 'ZH', native: '中文' },
] as const

type Lang = (typeof languages)[number]['code']

const copy = {
  ko: {
    nav: {
      story: '공간',
      menu: '메뉴',
      visit: '방문',
      faq: 'FAQ',
      reserve: '예약',
    },
    hero: {
      eyebrow: '북촌 한옥 골목의 모던 한식 다이닝',
      title: '하늘식탁',
      subtitle:
        '계절 나물, 숯불 고기, 전통 장을 현대적으로 풀어낸 서울 북촌의 저녁 식사.',
      primary: '예약하기',
      secondary: '메뉴보기',
      map: '길찾기',
    },
    quick: [
      { label: '오늘 영업', value: '11:30 - 22:00' },
      { label: '위치', value: '안국역 2번 출구 4분' },
      { label: '전화', value: '+82 2 734 1950' },
      { label: '가능', value: '영어 메뉴 · 단체 예약' },
    ],
    story: {
      eyebrow: 'Seoul, softly served',
      title: '외국인도 바로 이해하는 한국의 맛, 그러나 가볍지 않게.',
      body:
        '하늘식탁은 북촌의 오래된 골목과 현대적인 다이닝 룸 사이에 있습니다. 낮에는 햇살이 한옥 처마를 지나 테이블에 내려앉고, 저녁에는 숯불 향과 장의 깊은 맛이 공간을 채웁니다.',
      proof: '2019년부터 북촌에서 운영 · 영어/일본어/중국어 메뉴 제공 · 단체 식사 가능',
    },
    visit: {
      title: '방문 정보',
      subtitle: '예약 전, 찾아오기 전, 식사 동선을 정할 때 필요한 정보를 한곳에 모았습니다.',
      items: [
        { title: '주소', body: '서울 종로구 북촌로5길 15-3' },
        { title: '교통', body: '안국역 2번 출구 도보 4분, 경복궁 도보 9분' },
        { title: '주차', body: '전용 주차장은 없으며 정독도서관 공영주차장을 권장합니다.' },
        { title: '예약', body: '2-8인 온라인 예약 가능, 9인 이상은 전화 문의' },
        { title: '식단', body: '채식 옵션, 견과류 알레르기 안내, 맵기 조절 가능' },
        { title: '접근성', body: '입구에 낮은 턱이 있으며 직원 안내가 가능합니다.' },
      ],
    },
    menu: {
      title: '대표 메뉴',
      subtitle: '재료와 맛의 방향을 함께 적어 처음 방문하는 손님도 편하게 고를 수 있습니다.',
      items: [
        {
          name: '숯불 갈비 반상',
          price: '32,000원',
          desc: '간장과 배로 재운 소갈비, 제철 나물, 된장국, 솥밥.',
        },
        {
          name: '들기름 버섯 국수',
          price: '18,000원',
          desc: '표고와 느타리, 들기름, 김부각을 올린 고소한 온면.',
        },
        {
          name: '전복 솥밥',
          price: '28,000원',
          desc: '완도 전복, 버터 간장, 구운 김, 계절 장아찌.',
        },
        {
          name: '오미자 배 타르트',
          price: '12,000원',
          desc: '오미자 젤, 배 콩포트, 쌀가루 크럼블.',
        },
      ],
    },
    nearby: {
      title: '북촌에서 이어지는 저녁',
      body:
        '경복궁, 국립현대미술관 서울, 삼청동 카페 거리와 가까워 관광 후 저녁 식사로 방문하기 좋습니다. 한복 대여점과 호텔이 많은 동선에 있어 외국인 손님 안내에도 편합니다.',
      bullets: ['경복궁 도보 9분', '국립현대미술관 서울 도보 7분', '삼청동 카페 거리 도보 5분'],
    },
    reviews: {
      title: '방문객이 자주 남기는 말',
      items: [
        '한국 음식을 처음 먹는 친구에게 설명하기 쉬웠어요.',
        '북촌 산책 후 바로 예약하고 방문하기 좋았습니다.',
        '메뉴 설명이 친절해서 알레르기와 맵기를 고르기 쉬웠습니다.',
      ],
    },
    faq: {
      title: '자주 묻는 질문',
      items: [
        {
          q: '예약 없이 방문할 수 있나요?',
          a: '가능하지만 금요일 저녁과 주말은 예약을 권장합니다. 바 좌석은 현장 방문도 받습니다.',
        },
        {
          q: '영어, 일본어, 중국어 메뉴가 있나요?',
          a: '네. 주요 메뉴와 알레르기 안내를 한국어, 영어, 일본어, 중국어로 제공합니다.',
        },
        {
          q: '단체 식사가 가능한가요?',
          a: '최대 8인은 온라인 예약, 9-18인은 전화 또는 이메일로 문의해 주세요.',
        },
        {
          q: '채식 메뉴가 있나요?',
          a: '들기름 버섯 국수와 계절 나물 반상은 채식으로 조정할 수 있습니다.',
        },
      ],
    },
    footer: {
      title: '오늘 저녁, 북촌에서 만나요.',
      body: '예약, 길찾기, 메뉴 확인을 한 화면에서 끝낼 수 있습니다.',
    },
  },
  en: {
    nav: {
      story: 'Space',
      menu: 'Menu',
      visit: 'Visit',
      faq: 'FAQ',
      reserve: 'Reserve',
    },
    hero: {
      eyebrow: 'Modern Korean dining in the Bukchon hanok lanes',
      title: 'Haneul Table',
      subtitle:
        'Seasonal greens, charcoal-grilled beef, and traditional jang reworked for a calm Seoul dinner.',
      primary: 'Reserve',
      secondary: 'View menu',
      map: 'Directions',
    },
    quick: [
      { label: 'Open today', value: '11:30 AM - 10:00 PM' },
      { label: 'Area', value: '4 min from Anguk Station' },
      { label: 'Phone', value: '+82 2 734 1950' },
      { label: 'Available', value: 'English menu · Groups' },
    ],
    story: {
      eyebrow: 'Seoul, softly served',
      title: 'Korean flavors that international guests can understand without losing depth.',
      body:
        'Haneul Table sits between Bukchon’s old lanes and a quiet modern dining room. At lunch, sunlight falls across the tables. At night, charcoal smoke and the deep flavor of fermented sauces shape the room.',
      proof: 'Serving Bukchon since 2019 · English, Japanese, and Chinese menus · Group dining available',
    },
    visit: {
      title: 'Plan your visit',
      subtitle: 'Everything you need before booking, finding us, and planning dinner around Bukchon.',
      items: [
        { title: 'Address', body: '15-3 Bukchon-ro 5-gil, Jongno-gu, Seoul' },
        { title: 'Transit', body: '4 min from Anguk Station Exit 2, 9 min from Gyeongbokgung' },
        { title: 'Parking', body: 'No private parking. Jeongdok Public Parking is recommended.' },
        { title: 'Reservations', body: 'Online booking for 2-8 guests. Call for 9+ guests.' },
        { title: 'Dietary', body: 'Vegetarian options, allergy notes, and spice-level adjustments.' },
        { title: 'Accessibility', body: 'A low step at the entrance. Staff assistance is available.' },
      ],
    },
    menu: {
      title: 'Signature menu',
      subtitle: 'Ingredients and flavor notes are clear, so first-time guests can choose with confidence.',
      items: [
        {
          name: 'Charcoal Galbi Bansang',
          price: 'KRW 32,000',
          desc: 'Soy-pear marinated short rib, seasonal greens, doenjang soup, and pot rice.',
        },
        {
          name: 'Perilla Mushroom Noodles',
          price: 'KRW 18,000',
          desc: 'Shiitake, oyster mushroom, perilla oil, and crisp seaweed.',
        },
        {
          name: 'Abalone Pot Rice',
          price: 'KRW 28,000',
          desc: 'Wando abalone, butter soy, roasted seaweed, and seasonal pickles.',
        },
        {
          name: 'Omija Pear Tart',
          price: 'KRW 12,000',
          desc: 'Omija jelly, pear compote, and rice-flour crumble.',
        },
      ],
    },
    nearby: {
      title: 'An evening around Bukchon',
      body:
        'Close to Gyeongbokgung, MMCA Seoul, and Samcheong-dong cafes, the restaurant works well after sightseeing. It is also easy to recommend to hotel guests and visitors renting hanbok nearby.',
      bullets: ['9 min walk to Gyeongbokgung', '7 min walk to MMCA Seoul', '5 min walk to Samcheong-dong cafes'],
    },
    reviews: {
      title: 'What guests often say',
      items: [
        'Easy to explain Korean food to a first-time visitor.',
        'Perfect after a walk through Bukchon.',
        'Clear menu notes made allergies and spice levels easy.',
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Can I walk in without a reservation?',
          a: 'Yes, but reservations are recommended on Friday evenings and weekends. Bar seats are kept for walk-ins.',
        },
        {
          q: 'Do you have English, Japanese, and Chinese menus?',
          a: 'Yes. Main dishes and allergy notes are available in Korean, English, Japanese, and Chinese.',
        },
        {
          q: 'Can you host groups?',
          a: 'Online reservations are available for up to 8 guests. For 9-18 guests, please call or email us.',
        },
        {
          q: 'Do you have vegetarian dishes?',
          a: 'The perilla mushroom noodles and seasonal greens bansang can be adjusted for vegetarians.',
        },
      ],
    },
    footer: {
      title: 'Dinner in Bukchon, tonight.',
      body: 'Reserve, get directions, and check the menu from one page.',
    },
  },
  ja: {
    nav: {
      story: '空間',
      menu: 'メニュー',
      visit: '訪問',
      faq: 'FAQ',
      reserve: '予約',
    },
    hero: {
      eyebrow: '北村韓屋通りのモダン韓国ダイニング',
      title: 'ハヌルシクタク',
      subtitle:
        '季節のナムル、炭火焼き、伝統味噌を現代的に楽しむソウル北村のディナー。',
      primary: '予約する',
      secondary: 'メニューを見る',
      map: '道案内',
    },
    quick: [
      { label: '本日営業', value: '11:30 - 22:00' },
      { label: '場所', value: '安国駅2番出口から4分' },
      { label: '電話', value: '+82 2 734 1950' },
      { label: '対応', value: '日本語メニュー · 団体予約' },
    ],
    story: {
      eyebrow: 'Seoul, softly served',
      title: '初めての方にも伝わる韓国の味を、深みはそのままに。',
      body:
        'ハヌルシクタクは北村の古い路地と静かなダイニングルームの間にあります。昼は陽の光がテーブルに落ち、夜は炭火と発酵調味料の香りが空間を満たします。',
      proof: '2019年から北村で営業 · 英語/日本語/中国語メニュー · 団体利用可',
    },
    visit: {
      title: 'ご来店案内',
      subtitle: '予約前、来店前、北村での食事予定を立てる時に必要な情報をまとめました。',
      items: [
        { title: '住所', body: 'ソウル特別市 鍾路区 北村路5キル 15-3' },
        { title: '交通', body: '安国駅2番出口から徒歩4分、景福宮から徒歩9分' },
        { title: '駐車場', body: '専用駐車場はありません。正読図書館公営駐車場をご利用ください。' },
        { title: '予約', body: '2-8名はオンライン予約、9名以上は電話でお問い合わせください。' },
        { title: '食事対応', body: 'ベジタリアン対応、アレルギー案内、辛さ調整が可能です。' },
        { title: 'アクセシビリティ', body: '入口に低い段差があります。スタッフがお手伝いします。' },
      ],
    },
    menu: {
      title: '代表メニュー',
      subtitle: '材料と味わいをわかりやすく記載し、初めての方も選びやすくしています。',
      items: [
        {
          name: '炭火カルビ定食',
          price: '32,000ウォン',
          desc: '醤油と梨で漬けた牛カルビ、季節ナムル、味噌汁、釜飯。',
        },
        {
          name: 'エゴマ油きのこ麺',
          price: '18,000ウォン',
          desc: '椎茸、ヒラタケ、エゴマ油、海苔チップをのせた温麺。',
        },
        {
          name: 'アワビ釜飯',
          price: '28,000ウォン',
          desc: '莞島アワビ、バター醤油、焼き海苔、季節の漬物。',
        },
        {
          name: '五味子と梨のタルト',
          price: '12,000ウォン',
          desc: '五味子ゼリー、梨のコンポート、米粉クランブル。',
        },
      ],
    },
    nearby: {
      title: '北村で続く夕食',
      body:
        '景福宮、国立現代美術館ソウル、三清洞カフェ通りから近く、観光後の食事に便利です。韓服レンタル店やホテルも多く、海外ゲストにも案内しやすい場所です。',
      bullets: ['景福宮まで徒歩9分', '国立現代美術館ソウルまで徒歩7分', '三清洞カフェ通りまで徒歩5分'],
    },
    reviews: {
      title: 'お客様の声',
      items: [
        '韓国料理が初めての友人にも説明しやすかったです。',
        '北村散策のあとに予約して訪れやすい場所でした。',
        'アレルギーと辛さを選びやすいメニューでした。',
      ],
    },
    faq: {
      title: 'よくある質問',
      items: [
        {
          q: '予約なしで入れますか？',
          a: '可能ですが、金曜夜と週末は予約をおすすめします。カウンター席は当日来店も受け付けています。',
        },
        {
          q: '英語、日本語、中国語メニューはありますか？',
          a: 'はい。主要メニューとアレルギー案内を韓国語、英語、日本語、中国語で提供しています。',
        },
        {
          q: '団体利用はできますか？',
          a: '8名まではオンライン予約、9-18名は電話またはメールでお問い合わせください。',
        },
        {
          q: 'ベジタリアンメニューはありますか？',
          a: 'エゴマ油きのこ麺と季節ナムル定食はベジタリアン向けに調整できます。',
        },
      ],
    },
    footer: {
      title: '今夜、北村でお会いしましょう。',
      body: '予約、道案内、メニュー確認をこのページで完了できます。',
    },
  },
  zh: {
    nav: {
      story: '空间',
      menu: '菜单',
      visit: '到访',
      faq: 'FAQ',
      reserve: '预约',
    },
    hero: {
      eyebrow: '北村韩屋巷里的现代韩餐',
      title: '天空餐桌',
      subtitle:
        '以季节野菜、炭火烤肉和传统酱料呈现首尔北村的安静晚餐。',
      primary: '预约',
      secondary: '查看菜单',
      map: '路线',
    },
    quick: [
      { label: '今日营业', value: '11:30 - 22:00' },
      { label: '位置', value: '安国站2号出口步行4分钟' },
      { label: '电话', value: '+82 2 734 1950' },
      { label: '提供', value: '中文菜单 · 团体预约' },
    ],
    story: {
      eyebrow: 'Seoul, softly served',
      title: '让海外客人容易理解，也保留韩国味道的深度。',
      body:
        '天空餐桌位于北村古老小巷与安静现代餐厅之间。白天阳光落在餐桌上，夜晚炭火香气和发酵酱料的味道让空间更有层次。',
      proof: '自2019年在北村营业 · 提供英语/日语/中文菜单 · 可接待团体',
    },
    visit: {
      title: '到访信息',
      subtitle: '预约前、到店前和规划北村晚餐路线时需要的信息都在这里。',
      items: [
        { title: '地址', body: '首尔钟路区北村路5街15-3' },
        { title: '交通', body: '安国站2号出口步行4分钟，景福宫步行9分钟' },
        { title: '停车', body: '无专用停车场，建议使用正读图书馆公共停车场。' },
        { title: '预约', body: '2-8人可在线预约，9人以上请电话咨询。' },
        { title: '饮食需求', body: '可提供素食选择、过敏信息和辣度调整。' },
        { title: '无障碍', body: '入口有低台阶，工作人员可协助。' },
      ],
    },
    menu: {
      title: '招牌菜单',
      subtitle: '清楚说明食材和味道，让第一次到访的客人也能轻松选择。',
      items: [
        {
          name: '炭火牛排骨定食',
          price: '32,000韩元',
          desc: '酱油和梨腌制的牛排骨、时令野菜、大酱汤、锅饭。',
        },
        {
          name: '紫苏油蘑菇汤面',
          price: '18,000韩元',
          desc: '香菇、平菇、紫苏油和脆海苔搭配的温面。',
        },
        {
          name: '鲍鱼锅饭',
          price: '28,000韩元',
          desc: '莞岛鲍鱼、黄油酱油、烤海苔、时令小菜。',
        },
        {
          name: '五味子梨挞',
          price: '12,000韩元',
          desc: '五味子果冻、梨子果酱和米粉酥粒。',
        },
      ],
    },
    nearby: {
      title: '北村晚餐动线',
      body:
        '餐厅靠近景福宫、国立现代美术馆首尔馆和三清洞咖啡街，适合观光后用餐。周边有韩服租赁店和酒店，也方便推荐给外国客人。',
      bullets: ['步行9分钟到景福宫', '步行7分钟到国立现代美术馆首尔馆', '步行5分钟到三清洞咖啡街'],
    },
    reviews: {
      title: '客人常说',
      items: [
        '很容易向第一次吃韩餐的朋友介绍。',
        '逛完北村后预约来吃晚餐很方便。',
        '菜单说明清楚，过敏和辣度选择都很容易。',
      ],
    },
    faq: {
      title: '常见问题',
      items: [
        {
          q: '没有预约可以到店吗？',
          a: '可以，但周五晚上和周末建议提前预约。吧台座位也接受现场客人。',
        },
        {
          q: '有英语、日语、中文菜单吗？',
          a: '有。主要菜单和过敏信息提供韩语、英语、日语和中文版本。',
        },
        {
          q: '可以接待团体吗？',
          a: '最多8人可在线预约，9-18人请通过电话或邮件咨询。',
        },
        {
          q: '有素食菜单吗？',
          a: '紫苏油蘑菇面和时令野菜定食可调整为素食版本。',
        },
      ],
    },
    footer: {
      title: '今晚，在北村见。',
      body: '预约、路线和菜单确认都可以在这一页完成。',
    },
  },
} as const

const visitIcons = [MapPin, Train, Car, CalendarDays, Leaf, Accessibility]

export default function RestaurantSampleClient() {
  const [lang, setLang] = useState<Lang>('ko')
  const t = copy[lang]

  const activeLanguage = useMemo(
    () => languages.find((item) => item.code === lang) ?? languages[0],
    [lang],
  )

  return (
    <main
      lang={lang}
      className="min-h-screen bg-[#10100f] text-[#f8f2e8] [font-family:var(--font-pretendard)]"
    >
      <section className="relative min-h-[92svh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-[#10100f]" />

        <header className="absolute left-0 right-0 top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
            <a href="#top" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <Utensils className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold">HANEUL TABLE</span>
            </a>

            <nav className="hidden items-center gap-7 text-sm text-white/78 lg:flex">
              <a className="transition hover:text-white" href="#story">
                {t.nav.story}
              </a>
              <a className="transition hover:text-white" href="#menu">
                {t.nav.menu}
              </a>
              <a className="transition hover:text-white" href="#visit">
                {t.nav.visit}
              </a>
              <a className="transition hover:text-white" href="#faq">
                {t.nav.faq}
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-black/25 p-1 sm:flex">
                <Languages className="ml-2 h-4 w-4 text-white/65" aria-hidden="true" />
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={item.code === lang}
                    title={item.native}
                    onClick={() => setLang(item.code)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      item.code === lang
                        ? 'bg-[#f8f2e8] text-[#1d1712]'
                        : 'text-white/68 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <a
                href="#reserve"
                className="inline-flex items-center gap-2 rounded-full bg-[#f8f2e8] px-4 py-2 text-sm font-semibold text-[#18120e] transition hover:bg-white"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {t.nav.reserve}
              </a>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-white/10 px-5 py-2 sm:hidden">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={item.code === lang}
                onClick={() => setLang(item.code)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  item.code === lang ? 'bg-[#f8f2e8] text-[#18120e]' : 'text-white/72'
                }`}
              >
                {item.native}
              </button>
            ))}
          </div>
        </header>

        <div
          id="top"
          className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-5 pb-14 pt-32 md:px-10 md:pb-24"
        >
          <p className="mb-5 max-w-2xl text-sm font-semibold uppercase text-[#e5c076]">
            {t.hero.eyebrow}
          </p>
          <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-normal text-white md:text-7xl lg:text-8xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-2xl md:leading-10">
            {t.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#reserve"
              className="inline-flex items-center gap-2 rounded-full bg-[#e24d3d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f15e4e]"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {t.hero.primary}
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChefHat className="h-4 w-4" aria-hidden="true" />
              {t.hero.secondary}
            </a>
            <a
              href="https://maps.google.com/?q=Bukchon%20Hanok%20Village%20Seoul"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {t.hero.map}
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#181512]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-10">
          {t.quick.map((item, index) => {
            const Icon = [Clock, MapPin, Phone, Users][index]
            return (
              <div key={item.label} className="flex min-h-28 items-center gap-4 py-6 md:px-6">
                <Icon className="h-5 w-5 shrink-0 text-[#e5c076]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase text-white/42">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="story" className="bg-[#10100f] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-10">
          <div>
            <p className="text-sm font-semibold uppercase text-[#70b986]">
              {t.story.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
              {t.story.title}
            </h2>
            <p className="mt-7 text-lg leading-8 text-[#d8cec0]">{t.story.body}</p>
            <p className="mt-7 border-l-2 border-[#e5c076] pl-5 text-sm font-semibold leading-7 text-white/72">
              {t.story.proof}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[0.8fr_1fr]">
            <div
              className="min-h-[420px] rounded-md bg-cover bg-center sm:mt-20"
              style={{ backgroundImage: `url(${diningImage})` }}
              aria-label="Warm restaurant dining room"
            />
            <div
              className="min-h-[500px] rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${grillImage})` }}
              aria-label="Korean charcoal table"
            />
          </div>
        </div>
      </section>

      <section id="visit" className="bg-[#f4efe6] py-20 text-[#1b1815] md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[#8f5b2f]">
              {activeLanguage.native}
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              {t.visit.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5d554c]">{t.visit.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.visit.items.map((item, index) => {
              const Icon = visitIcons[index]
              return (
                <article key={item.title} className="rounded-md border border-[#d8ccb8] bg-white p-6">
                  <Icon className="h-6 w-6 text-[#b33f32]" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#5d554c]">{item.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="menu" className="bg-[#151b17] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[#e5c076]">
                Signature
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
                {t.menu.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#d8cec0]">{t.menu.subtitle}</p>
            </div>
            <div
              className="min-h-[360px] rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${noodleImage})` }}
              aria-label="Signature Korean noodle dish"
            />
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {t.menu.items.map((item) => (
              <article
                key={item.name}
                className="rounded-md border border-white/10 bg-[#20251f] p-6 transition hover:border-[#e5c076]/50"
              >
                <div className="flex items-start justify-between gap-5">
                  <h3 className="text-2xl font-semibold text-white">{item.name}</h3>
                  <p className="shrink-0 text-sm font-bold text-[#e5c076]">{item.price}</p>
                </div>
                <p className="mt-4 leading-7 text-[#d8cec0]">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#10100f] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-10">
          <div
            className="min-h-[520px] rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${tableImage})` }}
            aria-label="Restaurant table with seasonal dishes"
          />
          <div>
            <MapPin className="h-7 w-7 text-[#e5c076]" aria-hidden="true" />
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
              {t.nearby.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#d8cec0]">{t.nearby.body}</p>
            <ul className="mt-7 space-y-3">
              {t.nearby.bullets.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/82">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#70b986]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#201713] py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="text-3xl font-semibold text-white">{t.reviews.title}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.reviews.items.map((item) => (
              <blockquote key={item} className="rounded-md border border-white/10 bg-white/5 p-6">
                <div className="flex gap-1 text-[#e5c076]" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 leading-7 text-white/82">{item}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#f4efe6] py-20 text-[#1b1815] md:py-28">
        <div className="mx-auto max-w-4xl px-5 md:px-10">
          <h2 className="text-4xl font-semibold leading-tight md:text-6xl">{t.faq.title}</h2>
          <div className="mt-10 divide-y divide-[#d8ccb8] rounded-md border border-[#d8ccb8] bg-white">
            {t.faq.items.map((item, index) => (
              <details key={item.q} className="group p-6" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                  {item.q}
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition group-open:-rotate-45" />
                </summary>
                <p className="mt-4 leading-7 text-[#5d554c]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="reserve" className="bg-[#10100f] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 text-center md:px-10">
          <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
            {t.footer.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#d8cec0]">
            {t.footer.body}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+8227341950"
              className="inline-flex items-center gap-2 rounded-full bg-[#e24d3d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f15e4e]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              +82 2 734 1950
            </a>
            <a
              href="https://maps.google.com/?q=Bukchon%20Hanok%20Village%20Seoul"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Google Maps
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
