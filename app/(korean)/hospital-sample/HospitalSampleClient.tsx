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

const columnPath = '/hospital-sample/columns/acne-scar-treatment'

const heroImage =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2400&q=88'
const consultationImage =
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a1?auto=format&fit=crop&w=1600&q=85'
const doctorImage =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85'
const clinicImage =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85'

const languages = [
  { code: 'ko', label: 'KO', native: '한국어' },
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'ja', label: 'JA', native: '日本語' },
  { code: 'zh', label: 'ZH', native: '中文' },
] as const

type Lang = (typeof languages)[number]['code']

export const hospitalSampleCopy = {
  ko: {
    demo: '웹사이트 제작 예시입니다. 병원·의료진·면허·검토일·연락처는 가상 정보이며 실제 진료나 예약을 제공하지 않습니다.',
    nav: {
      answers: 'Q&A',
      procedures: '시술정보',
      columns: '칼럼',
      doctors: '의료진',
      visit: '방문',
      book: '상담 예약',
    },
    hero: {
      eyebrow: '블링크 피부과의원 · 강남 피부과 정보 허브',
      title: '피부과 상담 전, 가장 많이 묻는 질문을 먼저 확인하세요',
      subtitle:
        '여드름, 여드름 흉터, 보톡스, 기미·색소, 리프팅처럼 상담 전 자주 묻는 질문을 의료진 검수 답변과 지역 방문 정보로 정리했습니다.',
      primary: '자주 묻는 질문 보기',
      secondary: '칼럼 읽기',
      reviewed: '최종 의학 검토 2026.06.05',
    },
    quick: [
      { label: '지역', value: '강남역 인근 피부과' },
      { label: '진료영역', value: '여드름 · 색소 · 보톡스 · 리프팅' },
      { label: '콘텐츠', value: '의료진 검수 Q&A' },
      { label: '언어', value: '한국어 · 영어 · 일본어 · 중국어' },
    ],
    answers: {
      eyebrow: 'Questions patients ask',
      title: '환자가 실제로 검색하고 묻는 질문',
      subtitle:
        '상담 전 바로 이해할 수 있도록 결론을 먼저 제시합니다. 개인별 진단과 시술 가능 여부는 대면 상담에서 확정됩니다.',
      items: [
        {
          q: '강남 피부과에서 여드름 치료는 어디서부터 시작하나요?',
          a: '반복되는 여드름은 압출이나 장비명보다 원인 확인이 먼저입니다. 염증 정도, 피지 분비, 생활 패턴, 복용 약을 확인한 뒤 약물, 스킨케어, 레이저 보조치료를 단계적으로 조합합니다.',
          tag: '강남 피부과 여드름',
        },
        {
          q: '보톡스 효과는 얼마나 지속되나요?',
          a: '보툴리눔 톡신 효과는 부위, 용량, 근육 사용량에 따라 다르지만 일반적으로 3~6개월 정도 유지됩니다. 반복 간격은 내성 위험과 시술 부위를 고려해 의료진과 정해야 합니다.',
          tag: '보톡스 지속기간',
        },
        {
          q: '기미 치료는 레이저 한 번으로 되나요?',
          a: '기미와 색소는 멜라닌, 염증, 호르몬, 자외선 노출이 함께 작용하는 경우가 많아 한 번의 레이저로 끝나기 어렵습니다. 악화 위험과 재발 관리를 먼저 설명받는 것이 중요합니다.',
          tag: '기미·색소 치료',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure guide',
      title: '시술명보다 먼저 확인해야 할 기준',
      subtitle:
        '피부과 선택 전에는 가격이나 장비명보다 내 피부 상태, 회복 기간, 반복 간격, 부작용 가능성을 함께 확인해야 합니다.',
      headers: ['질문/고민', '상담 때 확인할 점', '관련 콘텐츠'],
      rows: [
        ['여드름 흉터', '흉터 타입, 피부톤, 회복 기간, 복용 약', '칼럼 보기'],
        ['여드름 치료', '염증 단계, 피지, 압출 필요성, 약물 병행', 'Q&A 준비중'],
        ['보톡스', '부위별 지속기간, 반복 간격, 내성 가능성', 'Q&A 준비중'],
        ['기미·색소', '악화 가능성, 자외선 관리, 병행 관리', '시술정보 준비중'],
      ],
    },
    column: {
      eyebrow: 'Doctor column',
      title: '강남 피부과 여드름 흉터 치료, 어떤 순서로 시작해야 할까?',
      body:
        '상담 전 바로 이해할 수 있도록 아이스픽·박스카·롤링 흉터의 차이와 서브시전, 프랙셔널 레이저, TCA 크로스 선택 기준을 정리했습니다.',
      cta: '칼럼 읽기',
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '콘텐츠를 검토한 의료진',
      name: '김민서 대표원장',
      role: '피부과 진료 · 여드름·색소·레이저 콘텐츠 감수',
      bio:
        '블링크 피부과의원은 상담실에서 반복되는 질문을 의료진 검수 답변으로 정리합니다. 모든 답변은 개인 진단이 아니라 상담 전 이해를 돕기 위한 교육용 자료입니다.',
      credentials: ['의사 면허 SAMPLE-24819', '피부·레이저 상담 12년', '콘텐츠 최종 검토 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '강남 피부과 방문 전 확인해야 할 정보',
      items: [
        {
          title: '위치와 접근성',
          body: '강남역 인근 방문을 기준으로 주소, 전화번호, 진료 시간, 예약 가능 여부를 한 페이지에서 확인할 수 있게 정리합니다.',
        },
        {
          title: '방문 준비',
          body: '최근 시술 이력, 복용 약, 알레르기, 임신·수유 여부를 예약 전 확인합니다.',
        },
        {
          title: '다국어 안내',
          body: '외국인 환자를 위해 영어, 일본어, 중국어 안내문을 제공하고 실제 진료 내용은 의료진 상담에서 확정합니다.',
        },
      ],
    },
    policy: {
      title: '출처와 의료 고지',
      body:
        '이 사이트는 의료정보 이해를 돕기 위한 교육용 콘텐츠입니다. 진단, 처방, 시술 결정은 대면 진료와 의료진 판단이 필요합니다.',
      items: ['의료진 감수자 표기', '최종 검토일 표시', '학회·논문 등 근거 참고', '의료광고 표현 검수'],
    },
    footer: {
      title: '블링크 피부과의원 상담 안내',
      body:
        '예약 전 궁금한 내용을 먼저 확인하고, 개인별 치료 가능 여부는 의료진 상담에서 결정합니다.',
      phone: '+82 2 555 0148',
      website: '병원 공식 홈페이지',
    },
  },
  en: {
    demo: 'Website demo. Clinic, clinician, license, review date and contact details are fictional. No medical services or bookings are provided.',
    nav: {
      answers: 'Q&A',
      procedures: 'Procedures',
      columns: 'Articles',
      doctors: 'Doctor',
      visit: 'Visit',
      book: 'Book a consultation',
    },
    hero: {
      eyebrow: 'Blink Dermatology Clinic Gangnam',
      title: 'Check the essentials before your dermatology consultation',
      subtitle:
        'Doctor-reviewed answers and local visit information for common questions about acne, acne scars, Botox, melasma, pigmentation and skin lifting.',
      primary: 'View Q&A',
      secondary: 'Read column',
      reviewed: 'Medically reviewed on June 5, 2026',
    },
    quick: [
      { label: 'Location', value: 'Dermatology near Gangnam Station' },
      { label: 'Care areas', value: 'Acne · Pigmentation · Botox · Skin lifting' },
      { label: 'Content', value: 'Doctor-reviewed Q&A' },
      { label: 'Languages', value: 'Korean · English · Japanese · Chinese' },
    ],
    answers: {
      eyebrow: 'Questions patients ask',
      title: 'Common questions from the consultation room',
      subtitle:
        'Short answers help you understand the basics before seeing a clinician. Personal diagnosis is confirmed in consultation.',
      items: [
        {
          q: 'Where should acne treatment at a Gangnam clinic begin?',
          a: 'For recurring acne, assessing the causes comes before choosing extractions or a device. A clinician reviews inflammation, oil production, lifestyle and medications, then considers medication, skincare and laser treatment as appropriate.',
          tag: 'Acne treatment in Gangnam',
        },
        {
          q: 'How long does Botox usually last?',
          a: 'Botulinum toxin effects vary by area, dose, and muscle activity, but many patients are told to expect roughly three to six months. Treatment intervals should be decided by a licensed clinician.',
          tag: 'Botox duration',
        },
        {
          q: 'Can melasma improve after one laser session?',
          a: 'Melasma is affected by pigment, inflammation, hormones, and ultraviolet exposure, so one laser session is rarely a complete answer. Sun protection and recurrence care matter.',
          tag: 'Melasma care',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure guide',
      title: 'What to check before choosing a procedure',
      subtitle:
        'It is safer to review suitability, downtime, risks, and intervals rather than deciding by procedure name alone.',
      headers: ['Concern', 'What to discuss', 'Content'],
      rows: [
        ['Acne scars', 'Scar type, skin tone, downtime, medications', 'Read column'],
        ['Acne treatment', 'Inflammation, oil production, need for extractions, medication', 'Q&A soon'],
        ['Botox', 'Area-specific duration, interval, resistance risk', 'Q&A soon'],
        ['Melasma and pigmentation', 'Aggravation risk, sun care, combined care', 'Guide soon'],
      ],
    },
    column: {
      eyebrow: 'Doctor column',
      title: 'Acne scar treatment: where should you start?',
      body:
        'A consultation-style explanation of ice pick, boxcar, and rolling scars, plus subcision, fractional laser, and TCA CROSS selection criteria.',
      cta: 'Read column',
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: 'Medical reviewer',
      name: 'Dr. Min Seo Kim',
      role: 'Dermatology care · Acne, pigmentation and laser content reviewer',
      bio:
        'Blink Dermatology Clinic organizes common consultation questions into doctor-reviewed answers. This educational material supports understanding before a consultation and does not provide a personal diagnosis.',
      credentials: ['Medical license SAMPLE-24819', '12 years of skin and laser consultation', 'Last reviewed June 5, 2026'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: 'What visitors should check before a clinic visit',
      items: [
        {
          title: 'Location and access',
          body: 'Find the address, phone number, opening hours and appointment availability for a visit near Gangnam Station in one place.',
        },
        {
          title: 'Before visiting',
          body: 'Recent procedures, current medication, allergies, pregnancy, and breastfeeding status should be checked before booking.',
        },
        {
          title: 'Multilingual guidance',
          body: 'English, Japanese and Chinese guides are provided for international patients. Clinical care is determined in consultation with a clinician.',
        },
      ],
    },
    policy: {
      title: 'Sources and medical notice',
      body:
        'This site provides educational medical information. Diagnosis, prescriptions, and procedure decisions require an in-person consultation and clinician judgment.',
      items: ['Physician reviewer shown', 'Last-reviewed date', 'Guideline and paper references', 'Medical advertising review'],
    },
    footer: {
      title: 'Clinic information before consultation',
      body:
        'Review common questions before booking. Personal treatment decisions are made during clinician consultation.',
      phone: '+82 2 555 0148',
      website: 'Official clinic website',
    },
  },
  ja: {
    demo: 'ウェブサイトの制作例です。医院・医師・免許・確認日・連絡先は架空の情報です。実際の診療や予約は提供していません。',
    nav: {
      answers: 'Q&A',
      procedures: '施術情報',
      columns: 'コラム',
      doctors: '医師',
      visit: '来院',
      book: '相談予約',
    },
    hero: {
      eyebrow: 'Blink Dermatology Clinic 江南院',
      title: '皮膚科相談の前に、必要な情報を確認できます',
      subtitle:
        'ニキビ、ニキビ跡、ボトックス、肝斑・色素、リフティングなど、相談前によくある質問を医師監修の回答と地域の来院情報にまとめました。',
      primary: 'よくある質問を見る',
      secondary: 'コラムを読む',
      reviewed: '医学的確認日 2026.06.05',
    },
    quick: [
      { label: '地域', value: '江南駅周辺の皮膚科' },
      { label: '診療分野', value: 'ニキビ · 色素 · ボトックス · リフティング' },
      { label: '内容', value: '医師監修Q&A' },
      { label: '言語', value: '韓国語 · 英語 · 日本語 · 中国語' },
    ],
    answers: {
      eyebrow: 'Questions patients ask',
      title: '診察室でよくある質問',
      subtitle:
        '相談前に理解しやすいよう、結論から説明します。個別の診断や施術の適否は対面での診察で判断します。',
      items: [
        {
          q: '江南の皮膚科でニキビ治療は何から始めますか？',
          a: '繰り返すニキビは、圧出や機器の選択より先に原因を確認します。炎症の程度、皮脂、生活習慣、服薬を確認し、薬物療法、スキンケア、補助的なレーザー治療を段階的に検討します。',
          tag: '江南の皮膚科でのニキビ治療',
        },
        {
          q: 'ボトックスの効果はどのくらい続きますか？',
          a: '効果は部位、量、筋肉の使い方で変わりますが、一般的には3〜6か月程度と案内されます。間隔は医師が部位と耐性リスクを見て判断します。',
          tag: 'ボトックス持続期間',
        },
        {
          q: '肝斑はレーザー1回で改善しますか？',
          a: '肝斑はメラニン、炎症、ホルモン、紫外線が関係するため、一度で完結しにくい状態です。日焼け対策と再発管理が重要です。',
          tag: '肝斑治療',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure guide',
      title: '施術ごとに確認する基準',
      subtitle:
        '施術名だけで決めるのではなく、適応、回復期間、副作用の可能性、間隔を一緒に確認します。',
      headers: ['悩み', '相談時に確認すること', '関連コンテンツ'],
      rows: [
        ['ニキビ跡', '瘢痕タイプ、肌色、回復期間、服薬', 'コラムを見る'],
        ['ニキビ治療', '炎症の段階、皮脂、圧出の必要性、薬物療法の併用', 'Q&A準備中'],
        ['ボトックス', '部位別の持続期間、間隔、耐性', 'Q&A準備中'],
        ['肝斑・色素', '悪化リスク、紫外線管理、併用管理', '施術情報準備中'],
      ],
    },
    column: {
      eyebrow: 'Doctor column',
      title: 'ニキビ跡治療、どこから始めるべきですか？',
      body:
        'アイスピック、ボックスカー、ローリング瘢痕の違いと、サブシジョン、フラクショナルレーザー、TCA CROSSの選択基準を説明します。',
      cta: 'コラムを読む',
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '監修医',
      name: 'キム・ミンソ代表院長',
      role: '皮膚科診療 · ニキビ・色素・レーザーのコンテンツ監修',
      bio:
        'Blink Dermatology Clinicでは、診察室でよくある質問を医師監修の回答にまとめています。個別の診断ではなく、相談前の理解を助ける教育用資料です。',
      credentials: ['医師免許 SAMPLE-24819', '皮膚・レーザー相談12年', '最終確認 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '外国人患者が来院前に確認する情報',
      items: [
        {
          title: '所在地とアクセス',
          body: '江南駅周辺への来院に向け、住所、電話番号、診療時間、予約の可否を一つのページで確認できるよう整理します。',
        },
        {
          title: '来院前準備',
          body: '最近の施術歴、服薬、アレルギー、妊娠・授乳の有無を予約前に確認します。',
        },
        {
          title: '多言語のご案内',
          body: '外国人患者向けに英語、日本語、中国語の案内を提供します。実際の診療内容は医師との相談で判断します。',
        },
      ],
    },
    policy: {
      title: '根拠と医療情報の注意',
      body:
        'このサイトは医療情報の理解を助ける教育用コンテンツです。診断、処方、施術決定には対面診療と医師判断が必要です。',
      items: ['監修医の表示', '最終確認日の表示', '学会・論文などの参考', '医療広告表現の確認'],
    },
    footer: {
      title: '相談前の理解を助ける病院情報ページ',
      body:
        '予約前に気になる内容を確認し、個別の治療可否は医師相談で決定します。',
      phone: '+82 2 555 0148',
      website: '医院公式サイト',
    },
  },
  zh: {
    demo: '网站设计示例。诊所、医生、执照、审核日期及联系方式均为虚构信息，不提供实际诊疗或预约服务。',
    nav: {
      answers: '问答',
      procedures: '项目信息',
      columns: '专栏',
      doctors: '医生',
      visit: '到访',
      book: '预约咨询',
    },
    hero: {
      eyebrow: 'Blink Dermatology Clinic 江南店',
      title: '皮肤科咨询前，先确认必要信息',
      subtitle:
        '将痤疮、痘坑痘疤、肉毒素、黄褐斑与色素、提升项目等常见问题，整理为医生审核的回答和本地就诊信息。',
      primary: '查看常见问题',
      secondary: '阅读专栏',
      reviewed: '医学审核日期 2026.06.05',
    },
    quick: [
      { label: '地区', value: '江南站附近的皮肤科诊所' },
      { label: '诊疗领域', value: '痤疮 · 色素 · 肉毒素 · 提升项目' },
      { label: '内容', value: '医生审核问答' },
      { label: '语言', value: '韩语 · 英语 · 日语 · 中文' },
    ],
    answers: {
      eyebrow: 'Questions patients ask',
      title: '咨询室常见问题',
      subtitle:
        '先给出结论，帮助您在咨询前理解基本信息。个人诊断及是否适合接受相关治疗，需通过面诊确认。',
      items: [
        {
          q: '在江南皮肤科治疗痤疮，应从哪里开始？',
          a: '反复出现的痤疮，应先了解成因，而不是先选择清痘或设备。医生会了解炎症程度、皮脂分泌、生活习惯及用药情况，再分阶段考虑药物、皮肤护理和激光辅助治疗。',
          tag: '江南皮肤科痤疮治疗',
        },
        {
          q: '肉毒素效果通常能维持多久？',
          a: '效果会根据部位、剂量和肌肉使用量而不同，通常可维持约3至6个月。治疗间隔应由医生根据部位和耐药风险决定。',
          tag: '肉毒素维持时间',
        },
        {
          q: '黄褐斑一次激光就能好吗？',
          a: '黄褐斑与色素、炎症、激素和紫外线有关，单次激光很少能完全解决。防晒和复发管理很重要。',
          tag: '黄褐斑治疗',
        },
      ],
    },
    procedures: {
      eyebrow: 'Procedure guide',
      title: '按项目确认标准',
      subtitle:
        '不要只看项目名称，还要一起确认适合人群、恢复期、副作用可能性和间隔。',
      headers: ['问题/项目', '咨询时确认', '相关内容'],
      rows: [
        ['痘坑痘疤', '疤痕类型、肤色、恢复期、用药', '阅读专栏'],
        ['痤疮治疗', '炎症阶段、皮脂、是否需要清痘、配合用药', '问答准备中'],
        ['肉毒素', '部位维持时间、间隔、耐药可能', '问答准备中'],
        ['黄褐斑·色素', '加重风险、防晒、联合管理', '项目信息准备中'],
      ],
    },
    column: {
      eyebrow: 'Doctor column',
      title: '痘坑痘疤治疗，应该从哪里开始？',
      body:
        '用咨询说明的方式整理冰锥型、厢车型、滚动型疤痕的差异，以及皮下分离、点阵激光、TCA CROSS的选择标准。',
      cta: '阅读专栏',
    },
    doctor: {
      eyebrow: 'Reviewed by physician',
      title: '审核医生',
      name: '金敏瑞代表院长',
      role: '皮肤科诊疗 · 痤疮、色素与激光内容审核',
      bio:
        'Blink Dermatology Clinic将咨询中反复出现的问题整理为医生审核的回答。所有内容均为帮助咨询前理解的教育资料，不提供个人诊断。',
      credentials: ['医生执照 SAMPLE-24819', '皮肤与激光咨询12年', '最后审核 2026.06.05'],
    },
    visit: {
      eyebrow: 'For international patients',
      title: '海外患者到访前需要确认的信息',
      items: [
        {
          title: '位置与交通',
          body: '为计划前往江南站附近就诊的人士，在同一页面整理地址、电话、诊疗时间及预约信息。',
        },
        {
          title: '到访准备',
          body: '预约前需要确认近期项目经历、正在服用的药物、过敏、怀孕或哺乳情况。',
        },
        {
          title: '多语言说明',
          body: '为国际患者提供英语、日语和中文说明。实际诊疗内容需与医生面谈后确定。',
        },
      ],
    },
    policy: {
      title: '依据与医疗声明',
      body:
        '本网站提供教育性医疗信息。诊断、处方和项目选择必须通过线下咨询和医生判断完成。',
      items: ['显示医生审核人', '显示最后审核日期', '参考学会和论文资料', '医疗广告表达审核'],
    },
    footer: {
      title: '帮助咨询前理解的医院信息页',
      body:
        '预约前先确认常见问题，个人治疗可行性需在医生咨询中决定。',
      phone: '+82 2 555 0148',
      website: '医院官方网站',
    },
  },
} as const

const quickIcons = [MapPin, Stethoscope, BookOpen, Globe2]
const visitIcons = [MapPin, ClipboardCheck, Languages]

export default function HospitalSampleClient({ initialLang = 'ko' }: { initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = hospitalSampleCopy[lang]

  const activeLanguage = useMemo(
    () => languages.find((item) => item.code === lang) ?? languages[0],
    [lang],
  )

  return (
    <main
      lang={lang === 'zh' ? 'zh-Hans' : lang}
      className="min-h-screen bg-[#f6f3ee] text-[#18221f] [font-family:var(--font-pretendard)]"
    >
      <p className="bg-[#e9e3d8] px-5 py-3 text-center text-xs leading-relaxed text-[#343e39]">{t.demo}</p>
      <section className="relative min-h-[78svh] overflow-hidden bg-[#17332f]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#102622]/[0.72]" />

        <header className="relative left-0 right-0 top-0 z-20 border-b border-white/[0.12] bg-[#102622]/[0.78] backdrop-blur-md sm:absolute">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:flex-nowrap md:px-10">
            <a href="#top" className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/[0.24] bg-white/[0.1] text-white">
                <Hospital className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-white sm:text-base">BLINK DERMATOLOGY CLINIC</span>
            </a>

            <nav className="hidden items-center gap-7 text-sm text-white/[0.76] lg:flex">
              <a className="transition hover:text-white" href="#answers">
                {t.nav.answers}
              </a>
              <a className="transition hover:text-white" href="#procedures">
                {t.nav.procedures}
              </a>
              <a className="transition hover:text-white" href={columnPath}>
                {t.nav.columns}
              </a>
              <a className="transition hover:text-white" href="#doctors">
                {t.nav.doctors}
              </a>
              <a className="transition hover:text-white" href="#visit">
                {t.nav.visit}
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-full border border-white/[0.15] bg-black/[0.2] p-1 sm:flex">
                <Languages className="ml-2 h-4 w-4 text-white/[0.68]" aria-hidden="true" />
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
                        : 'text-white/[0.72] hover:bg-white/[0.1] hover:text-white'
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
          <div className="flex gap-1 overflow-x-auto border-t border-white/[0.1] px-5 py-2 sm:hidden">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={item.code === lang}
                onClick={() => setLang(item.code)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  item.code === lang ? 'bg-[#f6f3ee] text-[#17332f]' : 'text-white/[0.72]'
                }`}
              >
                {item.native}
              </button>
            ))}
          </div>
        </header>

        <div
          id="top"
          className="relative z-10 mx-auto flex min-h-[60svh] max-w-7xl flex-col justify-end px-5 pb-12 pt-10 sm:min-h-[78svh] sm:pt-32 md:px-10 md:pb-16"
        >
          <p className="mb-5 max-w-2xl text-sm font-semibold uppercase text-[#99dfcf]">
            {t.hero.eyebrow}
          </p>
          <h1 className="max-w-5xl text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl md:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/[0.86] md:text-2xl md:leading-10">
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
              href={columnPath}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.35] bg-white/[0.1] px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/[0.2]"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              {t.hero.secondary}
            </a>
          </div>
          <p className="mt-8 inline-flex max-w-max items-center gap-2 rounded-full border border-white/[0.18] bg-black/[0.24] px-4 py-2 text-sm font-semibold text-white/[0.84]">
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
                  <p className="font-semibold text-[#18221f]">Reviewed by Dr. Min Seo Kim</p>
                  <p className="mt-1">lastReviewed 2026-06-05</p>
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
              <p className="mt-5 text-lg leading-8 text-white/[0.72]">{t.procedures.subtitle}</p>
            </div>
            <div
              className="min-h-[360px] rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${consultationImage})` }}
              aria-label="Doctor reviewing medical information with a patient"
            />
          </div>

          <div className="mt-12 overflow-x-auto rounded-md border border-white/[0.14] bg-white/[0.06]">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.14] bg-white/[0.08] text-sm text-white/[0.72]">
                  {t.procedures.headers.map((header) => (
                    <th key={header} className="px-5 py-4 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.procedures.rows.map((row, index) => (
                  <tr key={row[0]} className="border-b border-white/[0.1] last:border-b-0">
                    <td className="px-5 py-5 text-lg font-semibold">{row[0]}</td>
                    <td className="px-5 py-5 text-white/[0.76]">{row[1]}</td>
                    <td className="px-5 py-5">
                      {index === 0 ? (
                        <a
                          href={columnPath}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f6f3ee] px-3 py-1 text-sm font-semibold text-[#17332f]"
                        >
                          {row[2]}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f6f3ee] px-3 py-1 text-sm font-semibold text-[#17332f]">
                          {row[2]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="columns" className="bg-[#fcfaf6] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center md:px-10">
          <div
            className="min-h-[500px] rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${clinicImage})` }}
            aria-label="Clinic corridor"
          />
          <div>
            <p className="text-sm font-semibold uppercase text-[#0c7a6d]">{t.column.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#18221f] md:text-6xl">
              {t.column.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#56615d]">{t.column.body}</p>
            <a
              href={columnPath}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17332f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24443f]"
            >
              {t.column.cta}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="doctors" className="bg-[#f6f3ee] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center md:px-10">
          <div
            className="min-h-[520px] rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${doctorImage})` }}
            aria-label="Medical reviewer"
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
            <p className="text-sm font-semibold uppercase text-[#0c7a6d]">Medical notice</p>
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
          <div className="rounded-md border border-[#d9d2c5] bg-white p-6">
            <p className="flex items-start gap-3 text-sm leading-7 text-[#56615d]">
              <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[#bf7b2f]" aria-hidden="true" />
              Blink Dermatology Clinic information pages are for patient education. They do not provide diagnosis,
              prescriptions, emergency guidance, or individual procedure recommendations.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#17332f] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <h2 className="text-4xl font-semibold leading-tight md:text-6xl">{t.footer.title}</h2>
              <p className="mt-6 text-lg leading-8 text-white/[0.72]">{t.footer.body}</p>
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
                className="inline-flex min-h-24 items-center justify-between gap-4 rounded-md border border-white/[0.22] bg-white/[0.08] p-6 text-left font-bold text-white transition hover:bg-white/[0.14]"
              >
                <span className="inline-flex items-center gap-3">
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  {t.footer.website}
                </span>
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
