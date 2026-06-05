'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Globe2,
  Hospital,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'

const heroImage =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2400&q=88'
const consultationImage =
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a1?auto=format&fit=crop&w=1600&q=85'
const treatmentImage =
  'https://images.unsplash.com/photo-1588776813677-77aaf5595d19?auto=format&fit=crop&w=1600&q=85'
const clinicImage =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85'

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
      answers: '답변',
      procedures: '시술',
      doctors: '의료진',
      visit: '방문',
      book: '상담 예약',
    },
    hero: {
      eyebrow: '병원 AEO/GEO 콘텐츠 허브',
      title: 'Seoul Clinic Answers',
      subtitle:
        '강남 피부·성형 시술 질문을 의료진 검수 답변, 근거 출처, 다국어 방문 정보로 축적하는 별도 하위 사이트 샘플입니다.',
      primary: '답변 보기',
      secondary: '의료진 확인',
      reviewed: '최종 의학 검토 2026.06.05',
    },
    quick: [
      { label: '전문영역', value: '피부과 · 미용시술' },
      { label: '콘텐츠', value: '질문별 직접 답변' },
      { label: '언어', value: '한국어 · 영어 · 일본어 · 중국어' },
      { label: '목적', value: '교육용 정보 · 진료 대체 아님' },
    ],
    answers: {
      eyebrow: 'AEO answer blocks',
      title: 'AI가 바로 추출할 수 있는 질문 단위 답변',
      subtitle:
        '각 답변은 2~5문장 결론, 개인차, 진료 필요 조건, 감수 의료진, 검토일을 함께 보여줍니다.',
      items: [
        {
          q: '보톡스 효과는 얼마나 지속되나요?',
          a: '보툴리눔 톡신 효과는 부위와 용량, 근육 사용량에 따라 다르지만 일반적으로 3~6개월 정도 유지됩니다. 이마·미간은 3~4개월, 턱·승모근처럼 근육량이 큰 부위는 4~6개월 이상으로 안내되는 경우가 많습니다. 반복 간격은 내성 위험과 시술 부위를 고려해 의료진이 정해야 합니다.',
          tag: '보톡스 지속기간',
        },
        {
          q: '인모드는 몇 주 간격으로 받나요?',
          a: '인모드 계열 고주파 시술은 피부 두께, 통증 민감도, 멍 발생 여부에 따라 간격이 달라집니다. 보통 초기 관리는 2~4주 간격으로 계획하지만, 같은 장비라도 모드와 에너지 설정에 따라 회복 시간이 달라질 수 있습니다. 시술 전에는 최근 레이저·필러·실리프팅 이력을 확인해야 합니다.',
          tag: '인모드 간격',
        },
        {
          q: '기미 치료는 레이저 한 번으로 되나요?',
          a: '기미는 멜라닌, 염증, 호르몬, 자외선 노출이 함께 작용하는 경우가 많아 한 번의 레이저로 완결되는 질환이 아닙니다. 토닝, 미백 관리, 자외선 차단, 재발 관리가 함께 필요하며 과한 에너지는 오히려 색소를 악화시킬 수 있습니다. 피부 진단 후 강도를 낮게 시작하는 편이 안전합니다.',
          tag: '기미 치료',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure library',
      title: '시술별 페이지로 확장되는 정보 구조',
      subtitle:
        '홈은 허브 역할만 하고, 실제 AEO 성과는 시술·질문·지역 조합의 개별 URL이 누적되면서 만들어집니다.',
      headers: ['시술', '직접답변에 필요한 핵심', '개별 URL 예시'],
      rows: [
        ['보톡스', '효과 시작, 지속기간, 부위별 차이, 내성', '/qa/botox-duration'],
        ['피코토닝', '적합 색소, 횟수, 악화 가능성, 자외선 관리', '/procedures/pico-toning'],
        ['인모드', '간격, 멍, 통증, 유지관리, 병행 시술', '/qa/inmode-interval'],
        ['여드름 흉터', '흉터 유형, 프락셀/니들/RF 차이, 회복', '/conditions/acne-scar'],
      ],
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '답변 하단까지 이어지는 의료진 신뢰 신호',
      name: '이민재 대표원장',
      role: '피부과 진료 · 미용시술 감수',
      bio:
        '상담실에서 반복되는 질문을 진료 경험과 공개 가능한 의학 근거로 정리합니다. 모든 답변은 개인 진단이 아니라 상담 전 이해를 돕기 위한 교육용 자료입니다.',
      credentials: ['의사 면허 SAMPLE-24819', '피부·레이저 시술 상담 12년', '콘텐츠 최종 검토 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '외국인 환자가 방문 전 확인해야 할 정보',
      items: [
        {
          title: '상담 언어',
          body: '영어, 일본어, 중국어 안내문을 제공하고 실제 진료 내용은 의료진 상담에서 확정합니다.',
        },
        {
          title: '방문 준비',
          body: '최근 시술 이력, 복용 약, 알레르기, 임신·수유 여부를 예약 전 확인합니다.',
        },
        {
          title: '위치 연결',
          body: '공식 홈페이지, Google Business Profile, 네이버 플레이스 링크를 동일한 병원 엔티티로 연결합니다.',
        },
      ],
    },
    policy: {
      title: '출처와 의료 고지',
      body:
        '이 사이트는 의료정보 이해를 돕기 위한 교육용 콘텐츠입니다. 진단, 처방, 시술 결정은 대면 진료와 의료진 판단이 필요합니다.',
      items: ['의료진 감수자 표기', '페이지별 lastReviewed', '학회·식약처·논문 등 근거 링크', '의료광고 표현 검수'],
    },
    footer: {
      title: '병원 공식 홈페이지와 별도로 쌓이는 답변 자산',
      body:
        '기존 병원 홈페이지는 예약과 브랜드 소개를 맡고, 이 하위 사이트는 AI 검색이 인용하기 쉬운 의료 Q&A와 다국어 방문 정보를 담당합니다.',
      phone: '+82 2 555 0148',
      website: '병원 공식 홈페이지',
    },
  },
  en: {
    nav: {
      answers: 'Answers',
      procedures: 'Procedures',
      doctors: 'Doctor',
      visit: 'Visit',
      book: 'Book consult',
    },
    hero: {
      eyebrow: 'Hospital AEO/GEO content hub',
      title: 'Seoul Clinic Answers',
      subtitle:
        'A separate sample sub-site that turns common dermatology and aesthetic procedure questions into doctor-reviewed multilingual answers with sources and visit guidance.',
      primary: 'View answers',
      secondary: 'Check reviewer',
      reviewed: 'Medically reviewed on June 5, 2026',
    },
    quick: [
      { label: 'Specialty', value: 'Dermatology · Aesthetics' },
      { label: 'Format', value: 'Question-level answers' },
      { label: 'Languages', value: 'Korean · English · Japanese · Chinese' },
      { label: 'Purpose', value: 'Education · Not a diagnosis' },
    ],
    answers: {
      eyebrow: 'AEO answer blocks',
      title: 'Question pages written for direct extraction',
      subtitle:
        'Each answer includes a concise conclusion, variability, when to consult, reviewer, and review date.',
      items: [
        {
          q: 'How long does Botox usually last?',
          a: 'Botulinum toxin effects vary by area, dose, and muscle activity, but many patients are told to expect roughly three to six months. Forehead and frown lines are often shorter, while jaw or trapezius treatments may last longer. Treatment intervals should be decided by a licensed clinician to reduce resistance risk.',
          tag: 'Botox duration',
        },
        {
          q: 'How often can InMode be done?',
          a: 'InMode-style radiofrequency treatment intervals depend on skin thickness, bruising, pain sensitivity, and energy settings. Initial sessions are often planned every two to four weeks, but the exact schedule changes by mode and recovery. Recent laser, filler, or thread lifting history should be checked first.',
          tag: 'InMode interval',
        },
        {
          q: 'Can melasma improve after one laser session?',
          a: 'Melasma is commonly affected by pigment, inflammation, hormones, and ultraviolet exposure, so one laser session is rarely a complete answer. Toning, pigment care, sun protection, and recurrence management usually work together. Excessive energy can worsen pigmentation, so assessment matters.',
          tag: 'Melasma care',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure library',
      title: 'A structure that expands into procedure pages',
      subtitle:
        'The home page acts as a hub. AEO value grows through individual URLs for procedure, question, and local intent combinations.',
      headers: ['Procedure', 'Answer requirements', 'URL example'],
      rows: [
        ['Botox', 'Onset, duration, area differences, resistance', '/qa/botox-duration'],
        ['Pico toning', 'Pigment type, sessions, aggravation risk, sun care', '/procedures/pico-toning'],
        ['InMode', 'Interval, bruising, pain, maintenance, combinations', '/qa/inmode-interval'],
        ['Acne scars', 'Scar type, fractional laser, RF, recovery', '/conditions/acne-scar'],
      ],
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: 'Trust signals carried through every answer',
      name: 'Dr. Min Jae Lee',
      role: 'Dermatology care · Aesthetic procedure reviewer',
      bio:
        'Common consultation-room questions are rewritten with clinical experience and publicly citeable medical sources. The answers support understanding before a consultation and do not replace diagnosis.',
      credentials: ['Medical license SAMPLE-24819', '12 years of skin and laser consultation', 'Last reviewed June 5, 2026'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: 'What visitors should check before a clinic visit',
      items: [
        {
          title: 'Consultation language',
          body: 'English, Japanese, and Chinese guides are provided. Final medical decisions are confirmed during consultation.',
        },
        {
          title: 'Before visiting',
          body: 'Recent procedures, current medication, allergies, pregnancy, and breastfeeding status should be checked before booking.',
        },
        {
          title: 'Entity links',
          body: 'Official website, Google Business Profile, and Naver Place links are connected to the same clinic entity.',
        },
      ],
    },
    policy: {
      title: 'Sources and medical notice',
      body:
        'This site provides educational medical information. Diagnosis, prescriptions, and procedure decisions require an in-person consultation and clinician judgment.',
      items: ['Physician reviewer shown', 'Page-level lastReviewed', 'Guideline, regulator, or paper references', 'Medical advertising review'],
    },
    footer: {
      title: 'Answer assets built separately from the clinic website',
      body:
        'The main clinic website handles booking and brand introduction. This sub-site handles AI-citable medical Q&A and multilingual visit preparation.',
      phone: '+82 2 555 0148',
      website: 'Official clinic website',
    },
  },
  ja: {
    nav: {
      answers: '回答',
      procedures: '施術',
      doctors: '医師',
      visit: '来院',
      book: '相談予約',
    },
    hero: {
      eyebrow: '病院AEO/GEOコンテンツハブ',
      title: 'Seoul Clinic Answers',
      subtitle:
        '皮膚科・美容施術の質問を、医師監修の多言語回答、根拠、来院情報として蓄積する別サイト型サンプルです。',
      primary: '回答を見る',
      secondary: '監修医を見る',
      reviewed: '医学的確認日 2026.06.05',
    },
    quick: [
      { label: '専門分野', value: '皮膚科 · 美容施術' },
      { label: '形式', value: '質問ごとの直接回答' },
      { label: '言語', value: '韓国語 · 英語 · 日本語 · 中国語' },
      { label: '目的', value: '教育用情報 · 診断ではありません' },
    ],
    answers: {
      eyebrow: 'AEO answer blocks',
      title: 'AIが抽出しやすい質問単位の回答',
      subtitle:
        '各回答には結論、個人差、受診が必要な条件、監修医、確認日を含めます。',
      items: [
        {
          q: 'ボトックスの効果はどのくらい続きますか？',
          a: 'ボツリヌストキシンの効果は部位、量、筋肉の使い方によって異なりますが、一般的には3〜6か月程度と案内されます。額や眉間は短め、顎や僧帽筋のように筋肉量が多い部位は長めになる場合があります。間隔は耐性リスクと部位を考慮して医師が判断します。',
          tag: 'ボトックス持続期間',
        },
        {
          q: 'インモードは何週間おきに受けますか？',
          a: '高周波系施術の間隔は皮膚の厚さ、痛み、内出血、出力設定で変わります。初期管理では2〜4週間間隔で計画されることがありますが、モードや回復により調整が必要です。直近のレーザー、フィラー、糸リフト歴も確認します。',
          tag: 'インモード間隔',
        },
        {
          q: '肝斑はレーザー1回で改善しますか？',
          a: '肝斑はメラニン、炎症、ホルモン、紫外線が関係するため、1回のレーザーで完結しにくい状態です。トーニング、美白管理、日焼け対策、再発管理を組み合わせます。強すぎる出力は悪化につながるため診断が重要です。',
          tag: '肝斑治療',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure library',
      title: '施術別ページに広がる情報構造',
      subtitle:
        'トップページはハブで、実際のAEO効果は施術・質問・地域の個別URLが増えることで作られます。',
      headers: ['施術', '回答に必要な要素', 'URL例'],
      rows: [
        ['ボトックス', '効果発現、持続期間、部位差、耐性', '/qa/botox-duration'],
        ['ピコトーニング', '色素タイプ、回数、悪化リスク、紫外線管理', '/procedures/pico-toning'],
        ['インモード', '間隔、内出血、痛み、維持、併用施術', '/qa/inmode-interval'],
        ['ニキビ跡', '瘢痕タイプ、レーザー/RF差、回復', '/conditions/acne-scar'],
      ],
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '各回答につながる医師の信頼シグナル',
      name: 'イ・ミンジェ代表院長',
      role: '皮膚科診療 · 美容施術監修',
      bio:
        '相談室で繰り返される質問を、診療経験と公開可能な医学的根拠に基づいて整理します。回答は個別診断ではなく、相談前の理解を助ける教育用情報です。',
      credentials: ['医師免許 SAMPLE-24819', '皮膚・レーザー相談12年', '最終確認 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '外国人患者が来院前に確認する情報',
      items: [
        {
          title: '相談言語',
          body: '英語、日本語、中国語の案内を提供し、実際の診療内容は医師相談で確定します。',
        },
        {
          title: '来院前準備',
          body: '最近の施術歴、服薬、アレルギー、妊娠・授乳の有無を予約前に確認します。',
        },
        {
          title: '位置情報連携',
          body: '公式サイト、Google Business Profile、Naver Placeを同じ医院エンティティに接続します。',
        },
      ],
    },
    policy: {
      title: '根拠と医療情報の注意',
      body:
        'このサイトは医療情報の理解を助ける教育用コンテンツです。診断、処方、施術決定には対面診療と医師判断が必要です。',
      items: ['監修医の表示', 'ページ別lastReviewed', '学会・規制機関・論文の根拠', '医療広告表現の確認'],
    },
    footer: {
      title: '医院公式サイトとは別に蓄積される回答資産',
      body:
        '公式サイトは予約とブランド紹介を担当し、この下位サイトはAIが引用しやすい医療Q&Aと多言語来院情報を担当します。',
      phone: '+82 2 555 0148',
      website: '医院公式サイト',
    },
  },
  zh: {
    nav: {
      answers: '问答',
      procedures: '项目',
      doctors: '医生',
      visit: '到访',
      book: '预约咨询',
    },
    hero: {
      eyebrow: '医院 AEO/GEO 内容中心',
      title: 'Seoul Clinic Answers',
      subtitle:
        '这是一个独立子站样本，把皮肤科和医美项目问题整理成医生审核、多语言、带依据和到访信息的内容资产。',
      primary: '查看回答',
      secondary: '查看医生',
      reviewed: '医学审核日期 2026.06.05',
    },
    quick: [
      { label: '专业领域', value: '皮肤科 · 医美项目' },
      { label: '内容形式', value: '按问题提供直接回答' },
      { label: '语言', value: '韩语 · 英语 · 日语 · 中文' },
      { label: '目的', value: '教育信息 · 不替代诊断' },
    ],
    answers: {
      eyebrow: 'AEO answer blocks',
      title: '适合 AI 直接提取的问题级回答',
      subtitle:
        '每个回答都包含简短结论、个体差异、需要咨询医生的情况、审核医生和审核日期。',
      items: [
        {
          q: '肉毒素效果通常能维持多久？',
          a: '肉毒素效果会根据部位、剂量和肌肉使用量而不同，通常可维持约3至6个月。额头和眉间可能较短，下颌或斜方肌等肌肉量较大的部位可能更长。治疗间隔应由医生根据耐药风险和部位决定。',
          tag: '肉毒素维持时间',
        },
        {
          q: 'InMode 通常间隔多久做一次？',
          a: '射频类项目的间隔取决于皮肤厚度、疼痛敏感度、淤青情况和能量设置。初期管理常以2至4周为一个参考范围，但不同模式和恢复情况会改变计划。近期激光、填充或线雕经历也需要先确认。',
          tag: 'InMode 间隔',
        },
        {
          q: '黄褐斑一次激光就能好吗？',
          a: '黄褐斑通常与色素、炎症、激素和紫外线有关，单次激光很少能完全解决。通常需要淡斑治疗、防晒和复发管理一起进行。能量过强可能加重色素，因此皮肤评估很重要。',
          tag: '黄褐斑治疗',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure library',
      title: '可扩展为项目页面的信息结构',
      subtitle:
        '首页只是内容入口，真正的 AEO 价值来自项目、问题和地区组合的独立 URL 积累。',
      headers: ['项目', '直接回答需要的重点', 'URL 示例'],
      rows: [
        ['肉毒素', '起效时间、维持时间、部位差异、耐药', '/qa/botox-duration'],
        ['皮秒淡斑', '色素类型、次数、加重风险、防晒', '/procedures/pico-toning'],
        ['InMode', '间隔、淤青、疼痛、维持、联合项目', '/qa/inmode-interval'],
        ['痘坑痘疤', '疤痕类型、点阵/RF差异、恢复期', '/conditions/acne-scar'],
      ],
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '贯穿每个回答的医生可信信号',
      name: '李敏宰代表院长',
      role: '皮肤科诊疗 · 医美项目审核',
      bio:
        '把咨询室里反复出现的问题，用临床经验和可公开引用的医学依据整理成内容。所有回答用于咨询前理解，不等同于个人诊断。',
      credentials: ['医生执照 SAMPLE-24819', '皮肤与激光咨询12年', '最后审核 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '海外患者到访前需要确认的信息',
      items: [
        {
          title: '咨询语言',
          body: '提供英语、日语、中文说明，最终医疗决定需在医生咨询中确认。',
        },
        {
          title: '到访准备',
          body: '预约前需要确认近期项目经历、正在服用的药物、过敏、怀孕或哺乳情况。',
        },
        {
          title: '位置链接',
          body: '官方网站、Google Business Profile 和 Naver Place 连接到同一个诊所实体。',
        },
      ],
    },
    policy: {
      title: '依据与医疗声明',
      body:
        '本网站提供教育性医疗信息。诊断、处方和项目选择必须通过线下咨询和医生判断完成。',
      items: ['显示医生审核人', '每页 lastReviewed', '学会、监管机构或论文依据', '医疗广告表达审核'],
    },
    footer: {
      title: '独立于医院官网积累的回答资产',
      body:
        '医院官网负责预约和品牌介绍，这个子站负责 AI 更容易引用的医疗问答和多语言到访准备信息。',
      phone: '+82 2 555 0148',
      website: '医院官方网站',
    },
  },
} as const

const quickIcons = [Stethoscope, BookOpen, Globe2, ShieldCheck]
const visitIcons = [Languages, ClipboardCheck, MapPin]

export default function HospitalSampleClient() {
  const [lang, setLang] = useState<Lang>('ko')
  const t = copy[lang]
  const activeLanguage = useMemo(
    () => languages.find((item) => item.code === lang) ?? languages[0],
    [lang],
  )

  return (
    <main
      lang={lang}
      className="min-h-screen bg-[#f6f3ee] text-[#18221f] [font-family:var(--font-pretendard)]"
    >
      <section className="relative min-h-[78svh] overflow-hidden bg-[#17332f]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#102622]/72" />

        <header className="absolute left-0 right-0 top-0 z-20 border-b border-white/12 bg-[#102622]/78 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
            <a href="#top" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/24 bg-white/10">
                <Hospital className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold text-white">SEOUL CLINIC ANSWERS</span>
            </a>

            <nav className="hidden items-center gap-7 text-sm text-white/76 lg:flex">
              <a className="transition hover:text-white" href="#answers">
                {t.nav.answers}
              </a>
              <a className="transition hover:text-white" href="#procedures">
                {t.nav.procedures}
              </a>
              <a className="transition hover:text-white" href="#doctors">
                {t.nav.doctors}
              </a>
              <a className="transition hover:text-white" href="#visit">
                {t.nav.visit}
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-black/20 p-1 sm:flex">
                <Languages className="ml-2 h-4 w-4 text-white/68" aria-hidden="true" />
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={item.code === lang}
                    title={item.native}
                    onClick={() => setLang(item.code)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      item.code === lang
                        ? 'bg-[#f6f3ee] text-[#17332f]'
                        : 'text-white/72 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#e06b4f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c85a42]"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {t.nav.book}
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
                  item.code === lang ? 'bg-[#f6f3ee] text-[#17332f]' : 'text-white/72'
                }`}
              >
                {item.native}
              </button>
            ))}
          </div>
        </header>

        <div
          id="top"
          className="relative z-10 mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-32 md:px-10 md:pb-16"
        >
          <p className="mb-5 max-w-2xl text-sm font-semibold uppercase text-[#99dfcf]">
            {t.hero.eyebrow}
          </p>
          <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-normal text-white md:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/86 md:text-2xl md:leading-10">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#answers"
              className="inline-flex items-center gap-2 rounded-full bg-[#e06b4f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c85a42]"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t.hero.primary}
            </a>
            <a
              href="#doctors"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {t.hero.secondary}
            </a>
          </div>
          <p className="mt-8 inline-flex max-w-max items-center gap-2 rounded-full border border-white/18 bg-black/24 px-4 py-2 text-sm font-semibold text-white/84">
            <ShieldCheck className="h-4 w-4 text-[#99dfcf]" aria-hidden="true" />
            {t.hero.reviewed}
          </p>
        </div>
      </section>

      <section className="border-y border-[#d9d2c5] bg-[#fcfaf6]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#ded6ca] px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-10">
          {t.quick.map((item, index) => {
            const Icon = quickIcons[index]
            return (
              <div key={item.label} className="flex min-h-28 items-center gap-4 py-6 md:px-6">
                <Icon className="h-5 w-5 shrink-0 text-[#0c7a6d]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase text-[#69736f]">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-[#18221f]">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="answers" className="bg-[#f6f3ee] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[#0c7a6d]">{t.answers.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#18221f] md:text-6xl">
              {t.answers.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#56615d]">{t.answers.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {t.answers.items.map((item) => (
              <article key={item.q} className="rounded-md border border-[#d9d2c5] bg-white p-6">
                <p className="inline-flex items-center gap-2 rounded-full bg-[#e9f6f2] px-3 py-1 text-xs font-bold text-[#0c6b61]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.tag}
                </p>
                <h3 className="mt-5 text-2xl font-semibold leading-snug text-[#18221f]">{item.q}</h3>
                <p className="mt-4 text-base leading-8 text-[#4c5753]">{item.a}</p>
                <div className="mt-6 border-t border-[#e3ddd3] pt-4 text-sm text-[#69736f]">
                  <p className="font-semibold text-[#18221f]">Reviewed by Dr. Min Jae Lee</p>
                  <p className="mt-1">lastReviewed 2026-06-05 · FAQPage ready</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="procedures" className="bg-[#17332f] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[#99dfcf]">
                {t.procedures.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
                {t.procedures.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">{t.procedures.subtitle}</p>
            </div>
            <div
              className="min-h-[360px] rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${consultationImage})` }}
              aria-label="Doctor reviewing medical information with a patient"
            />
          </div>

          <div className="mt-12 overflow-x-auto rounded-md border border-white/14 bg-white/6">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/14 bg-white/8 text-sm text-white/72">
                  {t.procedures.headers.map((header) => (
                    <th key={header} className="px-5 py-4 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.procedures.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-white/10 last:border-b-0">
                    <td className="px-5 py-5 text-lg font-semibold">{row[0]}</td>
                    <td className="px-5 py-5 text-white/76">{row[1]}</td>
                    <td className="px-5 py-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#f6f3ee] px-3 py-1 text-sm font-semibold text-[#17332f]">
                        {row[2]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="doctors" className="bg-[#fcfaf6] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center md:px-10">
          <div
            className="min-h-[520px] rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${treatmentImage})` }}
            aria-label="Clinical consultation room"
          />
          <div>
            <p className="text-sm font-semibold uppercase text-[#0c7a6d]">{t.doctor.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#18221f] md:text-6xl">
              {t.doctor.title}
            </h2>
            <div className="mt-8 rounded-md border border-[#d9d2c5] bg-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-[#e9f6f2]">
                  <Stethoscope className="h-10 w-10 text-[#0c7a6d]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#18221f]">{t.doctor.name}</h3>
                  <p className="mt-1 text-[#56615d]">{t.doctor.role}</p>
                </div>
              </div>
              <p className="mt-6 text-base leading-8 text-[#4c5753]">{t.doctor.bio}</p>
              <ul className="mt-6 divide-y divide-[#e3ddd3] border-y border-[#e3ddd3]">
                {t.doctor.credentials.map((item) => (
                  <li key={item} className="py-4 text-sm font-semibold text-[#34413c]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="visit" className="bg-[#e9f6f2] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-[#0c7a6d]">{t.visit.eyebrow}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#18221f] md:text-6xl">
                {t.visit.title}
              </h2>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#b8d9d0] bg-white px-4 py-2 text-sm font-semibold text-[#34413c]">
                <Globe2 className="h-4 w-4 text-[#0c7a6d]" aria-hidden="true" />
                {activeLanguage.native}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {t.visit.items.map((item, index) => {
                const Icon = visitIcons[index]
                return (
                  <article key={item.title} className="rounded-md border border-[#b8d9d0] bg-white p-6">
                    <Icon className="h-6 w-6 text-[#0c7a6d]" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold text-[#18221f]">{item.title}</h3>
                    <p className="mt-3 leading-7 text-[#56615d]">{item.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f3ee] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center md:px-10">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0c7a6d]">Editorial policy</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#18221f] md:text-6xl">
              {t.policy.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#56615d]">{t.policy.body}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {t.policy.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-[#d9d2c5] bg-white p-4">
                  <FileText className="h-5 w-5 shrink-0 text-[#0c7a6d]" aria-hidden="true" />
                  <span className="text-sm font-semibold text-[#34413c]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="min-h-[500px] rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${clinicImage})` }}
            aria-label="Hospital corridor"
          />
        </div>
      </section>

      <section id="contact" className="bg-[#17332f] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <h2 className="text-4xl font-semibold leading-tight md:text-6xl">{t.footer.title}</h2>
              <p className="mt-6 text-lg leading-8 text-white/72">{t.footer.body}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="tel:+8225550148"
                className="inline-flex min-h-24 items-center justify-between gap-4 rounded-md bg-[#e06b4f] p-6 text-left font-bold text-white transition hover:bg-[#c85a42]"
              >
                <span className="inline-flex items-center gap-3">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  {t.footer.phone}
                </span>
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.blinkad.kr"
                className="inline-flex min-h-24 items-center justify-between gap-4 rounded-md border border-white/22 bg-white/8 p-6 text-left font-bold text-white transition hover:bg-white/14"
              >
                <span className="inline-flex items-center gap-3">
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  {t.footer.website}
                </span>
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="mt-10 rounded-md border border-white/14 bg-black/18 p-5">
            <p className="flex items-start gap-3 text-sm leading-7 text-white/72">
              <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[#f0c46c]" aria-hidden="true" />
              Seoul Clinic Answers is a sample content hub. It does not provide diagnosis, prescription,
              procedure recommendation, or emergency medical guidance.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
