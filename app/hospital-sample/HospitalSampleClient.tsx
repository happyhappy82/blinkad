'use client'

import { useMemo, useState } from 'react'
import { Languages, Menu, X } from 'lucide-react'

const languages = [
  { code: 'ko', label: 'KO', native: '한국어' },
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'ja', label: 'JA', native: '日本語' },
  { code: 'zh', label: 'ZH', native: '中文' },
] as const

type Lang = (typeof languages)[number]['code']

const doctorPhoto =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80'

const copy = {
  ko: {
    brand: 'SEOUL SKIN CLINIC',
    official: '공식 홈페이지 →',
    nav: ['홈', 'Q&A', '칼럼', '시술정보', '의료진', '소개'],
    mobileMenu: '메뉴',
    toc: '목차',
    articleLabel: '서울스킨클리닉',
    title: '여드름 흉터 치료, 어떤 방법부터 시작해야 좋을까?',
    author: '이민재 대표원장',
    authorTitle: '피부과 진료 · 서울스킨클리닉 강남점',
    readTime: '9 min read',
    date: '2026-06-05',
    reviewed: '의학 검토 2026-06-05',
    lead: [
      '"여드름은 가라앉았는데 얼굴이 움푹 패여 보여요. 시간이 지나면 나아질까요?"',
      '"프락셀, 서브시전, TCA 크로스가 너무 많아서 어디서부터 시작해야 할지 모르겠어요."',
      '"한두 번만 받으면 되는 건지, 여러 번 계획을 잡아야 하는지도 궁금해요."',
    ],
    intro: [
      '진료실에서 여드름 흉터 상담을 할 때 가장 자주 듣는 질문입니다. 검색하면 장비 이름과 후기성 표현이 많아서 오히려 더 헷갈리기 쉽습니다.',
      '저는 처음 상담할 때 어떤 시술이 가장 센지보다, 지금 얼굴에 남은 흉터가 어떤 타입인지부터 함께 정리합니다. 흉터 타입이 달라지면 시작해야 할 치료도 달라지기 때문입니다.',
    ],
    summary: [
      '여드름 흉터는 한 번에 없애는 치료가 아니라 여러 차례 계획을 세워 덜 보이게 만드는 치료에 가깝습니다.',
      '패인 흉터는 한 종류가 아닙니다. 같은 얼굴에도 아이스픽, 박스카, 롤링 흉터가 섞여 있는 경우가 많습니다.',
      '새 여드름이 계속 올라오는 시기라면 흉터 치료보다 여드름 조절이 먼저일 수 있습니다.',
      '시술 선택 전에는 피부톤, 복용 약, 색소침착 위험, 회복 기간을 함께 확인해야 합니다.',
    ],
    sections: [
      {
        id: 'mark-or-scar',
        title: '흉터와 자국, 먼저 구분해야 합니다',
        body: [
          '환자분들이 흉터라고 부르는 흔적은 크게 두 가지입니다. 붉은 자국이나 갈색 자국처럼 색만 남은 상태가 있고, 피부 표면이 실제로 꺼진 위축성 흉터가 있습니다.',
          '붉은 자국은 시간이 지나며 옅어지는 경우가 적지 않습니다. 반면 패인 흉터는 색이 좋아져도 피부 단차가 남아 보일 수 있어 치료 방향이 달라집니다.',
        ],
        questions: [
          {
            q: '아직 여드름이 계속 올라오는데 흉터 치료부터 해도 되나요?',
            a: '대개는 여드름을 먼저 안정시키는 쪽을 권합니다. 염증성 여드름이 계속 생기면 새 흉터가 추가될 수 있어 기존 흉터 치료 계획도 흔들릴 수 있습니다.',
          },
          {
            q: '붉은 자국과 패인 흉터를 집에서 구분할 수 있나요?',
            a: '밝은 조명에서 옆으로 비춰봤을 때 단차가 느껴지면 구조적인 흉터 가능성이 있습니다. 다만 실제 상담에서는 피부를 당겨 보거나 각도를 바꿔 확인합니다.',
          },
        ],
      },
      {
        id: 'scar-types',
        title: '패인 흉터는 타입별로 접근이 달라집니다',
        body: [
          '패인 흉터는 한 덩어리가 아니라 모양이 다른 여러 타입으로 섞여 있는 경우가 많습니다. 좁고 깊은 아이스픽, 경계가 비교적 뚜렷한 박스카, 넓게 물결처럼 꺼지는 롤링 흉터를 구분해 봅니다.',
          '이 구분이 중요한 이유는 치료 시작점이 다르기 때문입니다. 좁고 깊은 흉터와 피부 아래가 당겨져 보이는 흉터는 같은 장비 하나로 설명하기 어렵습니다.',
        ],
        table: {
          headers: ['타입', '보이는 모양', '상담 때 확인하는 점'],
          rows: [
            ['아이스픽', '좁고 깊은 V자 모양', '입구는 작지만 아래로 깊게 내려가는지'],
            ['박스카', '경계가 비교적 뚜렷한 웅덩이', '넓이와 깊이, 가장자리 각도'],
            ['롤링', '넓고 완만한 물결 모양', '피부를 당겼을 때 꺼짐이 줄어드는지'],
          ],
        },
      },
      {
        id: 'treatment-order',
        title: '시술은 하나를 고르기보다 순서를 짜야 합니다',
        body: [
          '롤링 흉터가 두드러지면 피부 아래 당김을 풀어주는 서브시전을 먼저 고려할 수 있습니다. 박스카 흉터와 피부결 변화가 섞여 있으면 프랙셔널 레이저나 RF 마이크로니들링이 계획에 들어갈 수 있습니다.',
          '아이스픽처럼 좁고 깊은 흉터에는 TCA 크로스처럼 국소적으로 접근하는 치료가 논의될 수 있습니다. 하지만 실제 계획은 흉터 타입, 피부톤, 회복 가능 기간, 이전 시술 이력에 따라 달라집니다.',
        ],
        table: {
          headers: ['주된 고민', '먼저 보는 치료', '함께 확인할 점'],
          rows: [
            ['물결처럼 꺼지는 흉터', '서브시전', '멍, 붓기, 필러 병행 여부'],
            ['넓은 패임과 피부결', '프랙셔널 레이저 또는 RF', '붉은기, 색소침착, 회복 기간'],
            ['좁고 깊은 패임', 'TCA 크로스', '딱지, 색소 변화, 반복 간격'],
          ],
        },
      },
      {
        id: 'aftercare',
        title: '치료 후 관리가 결과를 크게 좌우합니다',
        body: [
          '시술만큼 중요한 것이 치료 후 관리입니다. 자외선 차단, 새 여드름 조절, 피부 뜯지 않기, 자극 적은 세안과 보습은 흉터 치료 만족도에 직접 영향을 줍니다.',
          '특히 시술 후 갈색 자국이 오래 남기 쉬운 피부톤이라면 강도와 간격을 더 보수적으로 잡는 편이 안전합니다. 이상 증상이 생기면 자가 처치보다 병원에 문의해야 합니다.',
        ],
        checklist: ['SPF 30 이상 자외선 차단제를 꾸준히 사용합니다.', '새 여드름이 올라오면 흉터 치료와 별도로 조절합니다.', '딱지나 각질을 억지로 떼지 않습니다.', '복용 중인 약과 최근 시술 이력을 의료진에게 알립니다.'],
      },
      {
        id: 'faq',
        title: '자주 받는 질문 모음',
        body: ['본문에서 다 못 담은 질문들을 모았습니다.'],
        questions: [
          {
            q: '한 번 치료로 얼마나 좋아지나요?',
            a: '한 번에 큰 변화를 약속하기는 어렵습니다. 여러 차례 반복하면서 서서히 덜 눈에 띄게 만드는 쪽이 현실적인 기대치입니다.',
          },
          {
            q: '집에서 쓰는 더마롤러는 효과가 있나요?',
            a: '가정용 롤러의 근거는 제한적이고, 잘못 쓰면 자극이나 감염 위험이 있습니다. 패인 흉터 치료 목적이라면 병변에 맞춘 치료 계획을 먼저 권합니다.',
          },
          {
            q: '비용은 어느 정도 생각하면 될까요?',
            a: '시술 종류, 병변 수, 반복 횟수에 따라 차이가 커서 평균가만으로 판단하기 어렵습니다. 상담 때는 1회 비용보다 전체 치료 계획을 같이 확인하는 편이 낫습니다.',
          },
        ],
      },
    ],
    relatedTitle: '함께 읽으면 좋은 글',
    related: ['여드름 치료, 어디서부터 시작해야 맞는 걸까?', '기미 치료, 레이저 전에 확인해야 할 것', '보톡스 효과 지속 기간은 얼마나 될까?'],
    referencesTitle: '참고문헌',
    references: [
      'Jacob CI, Dover JS, Kaminer MS. Acne scarring: a classification system and review of treatment options. J Am Acad Dermatol. 2001.',
      'Fabbrocini G, Annunziata MC, D\'Arco V, et al. Acne scars: pathogenesis, classification and treatment. Dermatol Res Pract. 2010.',
      'American Academy of Dermatology. Acne scars: Consultation and treatment.',
      'American Academy of Dermatology. Acne scars: How to care for your skin after treatment.',
    ],
    disclaimer:
      '본 콘텐츠는 일반 의학 정보 제공 목적이며 개인별 진단·치료를 대체하지 않습니다. 여드름 흉터 치료는 흉터 타입, 피부톤, 현재 복용 중인 약에 따라 계획이 달라지고 색소침착, 붉은기, 붓기, 감염 같은 부작용이 생길 수 있습니다. 정확한 치료 여부는 대면 진료에서 확인해 주세요.',
    footer: {
      clinic: '서울스킨클리닉 강남점',
      address: '서울 강남구 테헤란로10길 12, 5층',
      phone: '02-555-0148',
      business: '사업자등록번호: 000-00-00000',
      legal: 'Medical Disclaimer',
      privacy: '개인정보처리방침',
      note: '본 사이트의 의학 정보는 전문의의 직접 진료를 대체하지 않습니다.',
    },
  },
  en: {
    brand: 'SEOUL SKIN CLINIC',
    official: 'Official website →',
    nav: ['Home', 'Q&A', 'Column', 'Procedures', 'Doctors', 'About'],
    mobileMenu: 'Menu',
    toc: 'Contents',
    articleLabel: 'Seoul Skin Clinic',
    title: 'Acne scar treatment: where should you start?',
    author: 'Dr. Min Jae Lee',
    authorTitle: 'Dermatology care · Seoul Skin Clinic Gangnam',
    readTime: '9 min read',
    date: 'June 5, 2026',
    reviewed: 'Medically reviewed June 5, 2026',
    lead: [
      '"My acne has settled, but my skin still looks indented. Will it improve over time?"',
      '"There are too many options: fractional laser, subcision, TCA CROSS. Where should I start?"',
      '"Do I need one or two sessions, or should I plan repeated treatment?"',
    ],
    intro: [
      'These are common questions in acne scar consultations. Search results often focus on device names, which can make the decision harder.',
      'In consultation, I first check the scar type rather than choosing the strongest procedure. Different scar shapes usually need different starting points.',
    ],
    summary: [
      'Acne scar care is usually a plan to make scars less visible over several sessions, not a one-time eraser.',
      'Indented scars are not one single type. Ice pick, boxcar, and rolling scars often appear together.',
      'If active acne is still frequent, acne control may need to come before scar procedures.',
      'Skin tone, medications, pigmentation risk, and downtime should be checked before choosing treatment.',
    ],
    sections: [
      {
        id: 'mark-or-scar',
        title: 'First, separate marks from scars',
        body: [
          'What patients call scars often falls into two groups: red or brown marks that mainly involve color, and atrophic scars where the skin surface is truly indented.',
          'Color marks can fade over time. Indented scars may remain visible even when redness improves, so the treatment direction changes.',
        ],
        questions: [
          {
            q: 'Can I treat scars while new acne is still active?',
            a: 'Often, controlling active acne comes first. Ongoing inflammation can create new scars and make scar treatment planning less stable.',
          },
          {
            q: 'Can I tell at home whether it is a mark or a scar?',
            a: 'Side lighting can show whether there is a true surface depression, but a consultation checks angles, stretching, and skin texture more accurately.',
          },
        ],
      },
      {
        id: 'scar-types',
        title: 'Indented scars need type-based planning',
        body: [
          'Indented acne scars often include several shapes. I look for narrow deep ice pick scars, more defined boxcar depressions, and broad rolling scars.',
          'This matters because each type tends to need a different starting point. One device rarely explains every scar pattern.',
        ],
        table: {
          headers: ['Type', 'Appearance', 'What is checked'],
          rows: [
            ['Ice pick', 'Narrow and deep V-shaped pit', 'Small opening with depth'],
            ['Boxcar', 'Defined round or oval depression', 'Width, depth, edge angle'],
            ['Rolling', 'Broad wave-like depression', 'Whether stretching improves it'],
          ],
        },
      },
      {
        id: 'treatment-order',
        title: 'Treatment is about sequence, not one device',
        body: [
          'When rolling scars dominate, subcision may be discussed to release tethering under the skin. For boxcar scars and texture change, fractional laser or RF microneedling may be part of the plan.',
          'For narrow and deep ice pick scars, a focal approach such as TCA CROSS may be considered. The final plan depends on scar type, skin tone, downtime, and treatment history.',
        ],
        table: {
          headers: ['Main concern', 'Common starting point', 'What to discuss'],
          rows: [
            ['Wave-like depression', 'Subcision', 'Bruising, swelling, filler support'],
            ['Wide dents and texture', 'Fractional laser or RF', 'Redness, pigmentation, downtime'],
            ['Narrow deep pits', 'TCA CROSS', 'Crusting, color change, intervals'],
          ],
        },
      },
      {
        id: 'aftercare',
        title: 'Aftercare strongly affects results',
        body: [
          'Aftercare matters as much as the procedure itself. Sun protection, acne control, not picking, gentle cleansing, and moisturization all affect satisfaction.',
          'If your skin is prone to prolonged brown marks after irritation, treatment energy and intervals may need to be more conservative.',
        ],
        checklist: ['Use broad-spectrum SPF 30 or higher.', 'Continue acne control to prevent new scars.', 'Do not pick crusts or flakes.', 'Tell your clinician about medications and recent procedures.'],
      },
      {
        id: 'faq',
        title: 'Frequently asked questions',
        body: ['Here are additional questions patients often ask.'],
        questions: [
          {
            q: 'How much improvement can I expect after one session?',
            a: 'It is difficult to promise a large change after one session. Scar treatment usually works gradually over repeated treatments.',
          },
          {
            q: 'Do home derma rollers help?',
            a: 'Evidence for home rollers is limited, and incorrect use can cause irritation or infection. A scar-specific plan is safer.',
          },
          {
            q: 'How should I think about cost?',
            a: 'Cost varies by procedure, lesion count, and number of sessions. It is better to review the full plan rather than only a one-session price.',
          },
        ],
      },
    ],
    relatedTitle: 'Recommended reading',
    related: ['How to start acne treatment', 'What to check before laser for melasma', 'How long does Botox last?'],
    referencesTitle: 'References',
    references: [
      'Jacob CI, Dover JS, Kaminer MS. Acne scarring: a classification system and review of treatment options. J Am Acad Dermatol. 2001.',
      'Fabbrocini G, Annunziata MC, D\'Arco V, et al. Acne scars: pathogenesis, classification and treatment. Dermatol Res Pract. 2010.',
      'American Academy of Dermatology. Acne scars: Consultation and treatment.',
      'American Academy of Dermatology. Acne scars: How to care for your skin after treatment.',
    ],
    disclaimer:
      'This content is for general medical education and does not replace diagnosis or treatment. Acne scar treatment plans depend on scar type, skin tone, medication history, and individual risks. Please confirm treatment options during an in-person consultation.',
    footer: {
      clinic: 'Seoul Skin Clinic Gangnam',
      address: '5F, 12 Teheran-ro 10-gil, Gangnam-gu, Seoul',
      phone: '+82-2-555-0148',
      business: 'Business registration: 000-00-00000',
      legal: 'Medical Disclaimer',
      privacy: 'Privacy Policy',
      note: 'Medical information on this site does not replace direct care from a licensed clinician.',
    },
  },
  ja: {
    brand: 'SEOUL SKIN CLINIC',
    official: '公式サイト →',
    nav: ['ホーム', 'Q&A', 'コラム', '施術情報', '医師', '紹介'],
    mobileMenu: 'メニュー',
    toc: '目次',
    articleLabel: 'Seoul Skin Clinic',
    title: 'ニキビ跡治療、どこから始めるべきですか？',
    author: 'イ・ミンジェ代表院長',
    authorTitle: '皮膚科診療 · Seoul Skin Clinic 江南院',
    readTime: '9 min read',
    date: '2026-06-05',
    reviewed: '医学的確認 2026-06-05',
    lead: [
      '「ニキビは落ち着いたのに、肌がへこんで見えます。自然に良くなりますか？」',
      '「フラクショナルレーザー、サブシジョン、TCA CROSSが多すぎて迷います。」',
      '「1〜2回でよいのか、何回か計画するべきか知りたいです。」',
    ],
    intro: [
      'ニキビ跡相談でよく聞く質問です。検索では機器名が多く、かえって判断しにくいことがあります。',
      '私はまず強い施術を選ぶより、残っている瘢痕のタイプを確認します。タイプにより治療の出発点が変わるからです。',
    ],
    summary: [
      'ニキビ跡治療は一度で消すものではなく、数回に分けて目立ちにくくする治療に近いです。',
      'へこんだ跡は一種類ではありません。アイスピック、ボックスカー、ローリングが混在します。',
      '新しいニキビが続く時期は、跡治療よりニキビの安定化が先になる場合があります。',
      '治療前に肌色、服薬、色素沈着リスク、ダウンタイムを確認します。',
    ],
    sections: [
      {
        id: 'mark-or-scar',
        title: 'まず跡と瘢痕を分けて考えます',
        body: [
          '患者さんがニキビ跡と呼ぶものには、赤みや茶色い色だけが残る状態と、実際に皮膚表面がへこんだ萎縮性瘢痕があります。',
          '色だけの跡は時間とともに薄くなる場合があります。一方でへこみは赤みが引いても残ることがあり、治療方針が異なります。',
        ],
        questions: [
          {
            q: 'まだニキビが出ている時に跡治療をしてもよいですか？',
            a: '多くの場合、まずニキビを安定させます。炎症が続くと新しい瘢痕が増える可能性があります。',
          },
          {
            q: '自宅で跡か瘢痕か分かりますか？',
            a: '横から光を当てるとへこみの有無が見えやすいですが、診察では角度や皮膚を引いた時の変化も確認します。',
          },
        ],
      },
      {
        id: 'scar-types',
        title: 'へこんだ瘢痕はタイプ別に見ます',
        body: [
          'へこんだニキビ跡には、狭く深いアイスピック、境界が比較的はっきりしたボックスカー、広く波のようなローリングがあります。',
          'この分類が大切なのは、タイプによって治療の出発点が違うためです。',
        ],
        table: {
          headers: ['タイプ', '見え方', '診察で見る点'],
          rows: [
            ['アイスピック', '狭く深いV字型', '入口の小ささと深さ'],
            ['ボックスカー', '境界がはっきりしたへこみ', '幅、深さ、縁の角度'],
            ['ローリング', '広い波のようなへこみ', '皮膚を引くと改善するか'],
          ],
        },
      },
      {
        id: 'treatment-order',
        title: '一つの機器より治療の順番が重要です',
        body: [
          'ローリングが強い場合は皮膚下の引きつれを緩めるサブシジョンを検討します。ボックスカーや肌質の変化にはフラクショナルレーザーやRFマイクロニードルを考えることがあります。',
          '狭く深い瘢痕にはTCA CROSSのような局所治療を検討します。実際の計画は瘢痕タイプ、肌色、休める期間、過去の施術歴で変わります。',
        ],
        table: {
          headers: ['主な悩み', '最初に見る治療', '確認する点'],
          rows: [
            ['波のようなへこみ', 'サブシジョン', '内出血、腫れ、フィラー併用'],
            ['広いへこみと肌質', 'レーザーまたはRF', '赤み、色素沈着、回復期間'],
            ['狭く深いへこみ', 'TCA CROSS', 'かさぶた、色変化、間隔'],
          ],
        },
      },
      {
        id: 'aftercare',
        title: '治療後の管理も結果に影響します',
        body: [
          '紫外線対策、新しいニキビの管理、触らないこと、刺激の少ない洗顔と保湿は満足度に影響します。',
          '刺激後に茶色い跡が長く残りやすい肌では、出力や間隔を慎重に決めます。',
        ],
        checklist: ['SPF 30以上の日焼け止めを使います。', '新しいニキビをコントロールします。', 'かさぶたや角質を無理に取らないでください。', '服薬や最近の施術歴を医師に伝えます。'],
      },
      {
        id: 'faq',
        title: 'よくある質問',
        body: ['本文で触れきれなかった質問です。'],
        questions: [
          { q: '一回でどのくらい改善しますか？', a: '一回で大きな変化を約束するのは難しいです。複数回で徐々に目立ちにくくする治療です。' },
          { q: '家庭用ローラーは効果がありますか？', a: '根拠は限られ、誤った使用は刺激や感染につながることがあります。病変に合った計画を先に相談することを勧めます。' },
          { q: '費用はどのように考えればいいですか？', a: '施術、病変数、回数で大きく変わります。1回費用だけでなく全体計画を確認しましょう。' },
        ],
      },
    ],
    relatedTitle: 'あわせて読みたい記事',
    related: ['ニキビ治療、どこから始めるべき？', '肝斑レーザー前に確認すること', 'ボトックス効果はどのくらい続く？'],
    referencesTitle: '参考文献',
    references: [
      'Jacob CI, Dover JS, Kaminer MS. Acne scarring: a classification system and review of treatment options. J Am Acad Dermatol. 2001.',
      'Fabbrocini G, Annunziata MC, D\'Arco V, et al. Acne scars: pathogenesis, classification and treatment. Dermatol Res Pract. 2010.',
      'American Academy of Dermatology. Acne scars: Consultation and treatment.',
      'American Academy of Dermatology. Acne scars: How to care for your skin after treatment.',
    ],
    disclaimer:
      'この内容は一般的な医学情報であり、個別の診断や治療に代わるものではありません。治療の可否は対面診療でご確認ください。',
    footer: {
      clinic: 'Seoul Skin Clinic 江南院',
      address: 'ソウル特別市 江南区 テヘラン路10キル 12, 5階',
      phone: '+82-2-555-0148',
      business: '事業者登録番号: 000-00-00000',
      legal: 'Medical Disclaimer',
      privacy: 'プライバシーポリシー',
      note: '本サイトの医学情報は医師による直接診療に代わるものではありません。',
    },
  },
  zh: {
    brand: 'SEOUL SKIN CLINIC',
    official: '官方网站 →',
    nav: ['首页', '问答', '专栏', '项目信息', '医生', '介绍'],
    mobileMenu: '菜单',
    toc: '目录',
    articleLabel: 'Seoul Skin Clinic',
    title: '痘坑痘疤治疗，应该从哪里开始？',
    author: '李敏宰代表院长',
    authorTitle: '皮肤科诊疗 · Seoul Skin Clinic 江南店',
    readTime: '9 min read',
    date: '2026-06-05',
    reviewed: '医学审核 2026-06-05',
    lead: [
      '“痘痘已经好了，但脸上还是有凹陷，会自己变好吗？”',
      '“点阵激光、皮下分离、TCA CROSS 太多了，不知道从哪里开始。”',
      '“做一两次就够，还是需要多次计划？”',
    ],
    intro: [
      '这是痘疤咨询中很常见的问题。网上常看到各种设备名称，反而更难判断。',
      '咨询时我会先看疤痕类型，而不是先选择最强的项目。不同类型的疤痕，治疗起点不同。',
    ],
    summary: [
      '痘坑治疗通常不是一次清除，而是通过多次计划让疤痕变得不明显。',
      '凹陷疤痕不止一种。冰锥型、厢车型、滚动型常常混合出现。',
      '如果新痘痘还在反复出现，可能需要先控制痘痘。',
      '选择治疗前需要一起确认肤色、用药、色沉风险和恢复期。',
    ],
    sections: [
      {
        id: 'mark-or-scar',
        title: '先区分痘印和凹陷疤痕',
        body: [
          '患者说的痘疤大致分为两类：红色或褐色的痘印，以及皮肤表面真正凹陷的萎缩性疤痕。',
          '颜色型痘印可能随时间变淡，但凹陷疤痕即使红色消退也可能留下皮肤落差，因此治疗方向不同。',
        ],
        questions: [
          { q: '新痘痘还在长，可以先做痘疤治疗吗？', a: '多数情况下会先稳定痘痘。炎症持续出现，可能会继续形成新的疤痕。' },
          { q: '在家能区分痘印和凹陷吗？', a: '侧光下可以大致观察是否有凹陷，但面诊会通过不同角度和牵拉皮肤来判断。' },
        ],
      },
      {
        id: 'scar-types',
        title: '凹陷疤痕需要按类型判断',
        body: [
          '凹陷痘疤通常包括狭窄较深的冰锥型、边界较清楚的厢车型，以及较宽的滚动型。',
          '分类很重要，因为不同类型的治疗起点不同，一个设备很难解释所有疤痕。',
        ],
        table: {
          headers: ['类型', '外观', '咨询时确认'],
          rows: [
            ['冰锥型', '狭窄且深的V形凹陷', '入口大小和深度'],
            ['厢车型', '边界较清楚的凹陷', '宽度、深度和边缘'],
            ['滚动型', '宽而波浪状的凹陷', '牵拉皮肤后是否改善'],
          ],
        },
      },
      {
        id: 'treatment-order',
        title: '治疗重点是顺序，而不是单一设备',
        body: [
          '滚动型明显时，可能会讨论皮下分离来松解牵拉。厢车型和肤质变化明显时，点阵激光或射频微针可能进入计划。',
          '狭窄较深的冰锥型疤痕，可以考虑 TCA CROSS 等局部治疗。最终计划取决于疤痕类型、肤色、恢复期和既往治疗。',
        ],
        table: {
          headers: ['主要问题', '常见起点', '需要讨论'],
          rows: [
            ['波浪状凹陷', '皮下分离', '淤青、肿胀、填充辅助'],
            ['较宽凹陷和肤质', '点阵激光或射频', '泛红、色沉、恢复期'],
            ['狭窄深凹陷', 'TCA CROSS', '结痂、颜色变化、间隔'],
          ],
        },
      },
      {
        id: 'aftercare',
        title: '术后管理会影响结果',
        body: [
          '防晒、控制新痘痘、不抠皮肤、温和清洁和保湿都会影响治疗满意度。',
          '如果肤色容易留下褐色痕迹，能量和间隔通常需要更保守。',
        ],
        checklist: ['坚持使用 SPF 30 以上防晒。', '继续控制新痘痘，减少新疤痕。', '不要强行抠掉结痂或角质。', '告诉医生用药和近期项目经历。'],
      },
      {
        id: 'faq',
        title: '常见问题',
        body: ['这里整理了一些常见问题。'],
        questions: [
          { q: '一次治疗能改善多少？', a: '很难承诺一次就有明显变化。痘坑治疗通常是多次逐渐改善。' },
          { q: '家用滚轮有帮助吗？', a: '证据有限，使用不当可能刺激或感染。建议先制定适合病灶的治疗计划。' },
          { q: '费用应该怎么判断？', a: '费用会根据项目、病灶数量和次数不同而变化。建议看整体治疗计划，而不是只看单次价格。' },
        ],
      },
    ],
    relatedTitle: '推荐阅读',
    related: ['痘痘治疗，从哪里开始？', '黄褐斑激光前要确认什么', '肉毒素效果能维持多久？'],
    referencesTitle: '参考文献',
    references: [
      'Jacob CI, Dover JS, Kaminer MS. Acne scarring: a classification system and review of treatment options. J Am Acad Dermatol. 2001.',
      'Fabbrocini G, Annunziata MC, D\'Arco V, et al. Acne scars: pathogenesis, classification and treatment. Dermatol Res Pract. 2010.',
      'American Academy of Dermatology. Acne scars: Consultation and treatment.',
      'American Academy of Dermatology. Acne scars: How to care for your skin after treatment.',
    ],
    disclaimer:
      '本内容仅用于一般医学信息说明，不能替代个人诊断或治疗。具体治疗方案请通过线下面诊确认。',
    footer: {
      clinic: 'Seoul Skin Clinic 江南店',
      address: '首尔江南区德黑兰路10街12号5层',
      phone: '+82-2-555-0148',
      business: '营业执照号: 000-00-00000',
      legal: 'Medical Disclaimer',
      privacy: '隐私政策',
      note: '本网站医学信息不能替代医生的直接诊疗。',
    },
  },
} as const

export default function HospitalSampleClient() {
  const [lang, setLang] = useState<Lang>('ko')
  const [menuOpen, setMenuOpen] = useState(false)
  const t = copy[lang]
  const activeLanguage = useMemo(
    () => languages.find((item) => item.code === lang) ?? languages[0],
    [lang],
  )

  return (
    <main
      lang={lang}
      className="min-h-screen bg-white text-[#222] [--color-primary:#4b3539] [--color-accent:#b46b78] [--color-bg-alt:#faf7f5] [--color-border:#e7dfdb] [--color-text-light:#707070] [--radius:4px] [font-family:var(--font-pretendard)]"
    >
      <div className="bg-[var(--color-primary)] px-4 py-2 text-xs text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <span className="font-semibold">{t.brand}</span>
          <a href="#contact" className="underline opacity-80 transition hover:opacity-100">
            {t.official}
          </a>
        </div>
      </div>

      <nav className="relative border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:justify-center md:px-6">
          <div className="hidden items-center gap-8 text-sm md:flex">
            {t.nav.map((item, index) => (
              <a
                key={item}
                href={index === 0 ? '#top' : index === 1 ? '#faq' : '#article'}
                className={index === 0 ? 'font-semibold transition hover:opacity-70' : 'transition hover:opacity-70'}
              >
                {item}
              </a>
            ))}
          </div>

          <span className="text-sm font-semibold md:hidden">{t.brand}</span>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] md:hidden"
            aria-expanded={menuOpen}
            aria-label={t.mobileMenu}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 md:hidden">
            <div className="grid gap-2 text-sm">
              {t.nav.map((item, index) => (
                <a
                  key={item}
                  href={index === 0 ? '#top' : index === 1 ? '#faq' : '#article'}
                  className="py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-light)]">
            <Languages className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            {activeLanguage.native}
          </div>
          <div className="flex flex-wrap gap-1">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={item.code === lang}
                onClick={() => setLang(item.code)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  item.code === lang
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--color-border)] bg-white text-[var(--color-text-light)] hover:text-[#222]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="article" className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
        <div className="flex gap-16">
          <article data-toc-content className="min-w-0 flex-1" style={{ maxWidth: '700px' }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {t.articleLabel}
            </p>
            <h1 id="top">{t.title}</h1>

            <div className="mt-8 mb-3 flex flex-wrap items-center gap-3">
              <img
                src={doctorPhoto}
                alt={t.author}
                className="m-0 h-11 w-11 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{t.author}</span>
              <span className="text-sm text-[var(--color-text-light)]">·</span>
              <span className="text-sm text-[var(--color-text-light)]">{t.authorTitle}</span>
              <span className="text-sm text-[var(--color-text-light)]">·</span>
              <span className="text-sm text-[var(--color-text-light)]">{t.readTime}</span>
              <span className="text-sm text-[var(--color-text-light)]">·</span>
              <span className="text-sm text-[var(--color-text-light)]">{t.date}</span>
            </div>

            <p className="mb-8 text-sm font-medium text-[var(--color-text-light)]">{t.reviewed}</p>
            <hr />

            <blockquote>
              {t.lead.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </blockquote>

            {t.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <ul>
              {t.summary.map((item) => (
                <li key={item}>
                  <strong>{item}</strong>
                </li>
              ))}
            </ul>

            {t.sections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {'table' in section && section.table && (
                  <table>
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join('-')}>
                          {row.map((cell) => (
                            <td key={cell}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {'checklist' in section && section.checklist && (
                  <ul>
                    {section.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {'questions' in section && section.questions && (
                  <div className="mt-6">
                    <p>
                      <strong>{lang === 'ko' ? '이 주제로 자주 받는 질문' : lang === 'ja' ? 'このテーマでよくある質問' : lang === 'zh' ? '本主题常见问题' : 'Common questions about this topic'}</strong>
                    </p>
                    {section.questions.map((item) => (
                      <p key={item.q}>
                        <strong>Q. {item.q}</strong>
                        <br />
                        A. {item.a}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <h2>{t.relatedTitle}</h2>
            <ul>
              {t.related.map((item) => (
                <li key={item}>
                  <a href="#article">{item}</a>
                </li>
              ))}
            </ul>

            <hr />

            <h2>{t.referencesTitle}</h2>
            <ol className="text-xs text-[var(--color-text-light)]">
              {t.references.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>

            <p className="mt-8 text-xs italic text-[var(--color-text-light)]">{t.disclaimer}</p>
          </article>

          <aside className="sticky top-24 hidden w-56 flex-shrink-0 self-start lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]">
              {t.toc}
            </p>
            <ul className="space-y-1.5 border-l border-[var(--color-border)] text-sm">
              {t.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block border-l-2 border-transparent py-0.5 pl-3 text-[var(--color-text-light)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      <footer
        id="contact"
        className="bg-[var(--color-primary)] px-4 py-8 text-xs leading-relaxed text-white/70 md:px-6"
      >
        <div className="mx-auto max-w-4xl space-y-2">
          <p className="font-semibold text-white">{t.footer.clinic}</p>
          <p className="break-words">{t.footer.address}</p>
          <p>{t.footer.phone}</p>
          <p>{t.footer.business}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#article" className="underline">
              {t.footer.legal}
            </a>
            <a href="#article" className="underline">
              {t.footer.privacy}
            </a>
          </div>
          <p className="pt-2 opacity-60">{t.footer.note}</p>
        </div>
      </footer>

      <style jsx global>{`
        [data-toc-content] h1 {
          color: #000;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.2;
          margin: 0 0 0.5rem;
          word-break: keep-all;
        }

        [data-toc-content] h2 {
          border-bottom: 1px solid var(--color-border);
          color: #222;
          font-size: 1.625rem;
          font-weight: 700;
          letter-spacing: 0;
          line-height: 1.35;
          margin: 3rem 0 1rem;
          padding-bottom: 0.625rem;
          word-break: keep-all;
        }

        [data-toc-content] p {
          color: #333;
          font-size: 1.125rem;
          line-height: 1.9;
          margin-bottom: 1.5rem;
          word-break: keep-all;
        }

        [data-toc-content] strong {
          color: #222;
          font-weight: 600;
        }

        [data-toc-content] blockquote {
          background: var(--color-bg-alt);
          border-left: 3px solid var(--color-accent);
          border-radius: 0 var(--radius) var(--radius) 0;
          color: #333;
          font-size: 1.0625rem;
          line-height: 1.8;
          margin: 2rem 0;
          padding: 1.25rem 1.5rem;
        }

        [data-toc-content] blockquote p {
          margin-bottom: 0.25rem;
        }

        [data-toc-content] ul,
        [data-toc-content] ol {
          margin-bottom: 1.5rem;
          padding-left: 1.75rem;
        }

        [data-toc-content] ul {
          list-style: disc;
        }

        [data-toc-content] ol {
          list-style: decimal;
        }

        [data-toc-content] li {
          color: #333;
          font-size: 1.0625rem;
          line-height: 1.85;
          margin-bottom: 0.5rem;
        }

        [data-toc-content] li::marker {
          color: var(--color-accent);
          font-weight: 600;
        }

        [data-toc-content] table {
          border-collapse: collapse;
          font-size: 0.875rem;
          margin: 1.5rem 0;
          width: 100%;
        }

        [data-toc-content] th {
          background: var(--color-bg-alt);
          border-bottom: 2px solid var(--color-border);
          color: #222;
          font-weight: 600;
          padding: 0.625rem 0.75rem;
          text-align: left;
        }

        [data-toc-content] td {
          border-bottom: 1px solid var(--color-border);
          color: #333;
          padding: 0.625rem 0.75rem;
        }

        [data-toc-content] a {
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        [data-toc-content] hr {
          border: 0;
          border-top: 1px solid var(--color-border);
          margin: 2.5rem 0;
        }

        [data-toc-content] img {
          margin: 0;
        }

        @media (max-width: 768px) {
          [data-toc-content] h1 {
            font-size: 2rem;
          }

          [data-toc-content] h2 {
            font-size: 1.375rem;
            margin-top: 2.5rem;
          }

          [data-toc-content] p {
            font-size: 1.0625rem;
            line-height: 1.85;
          }

          [data-toc-content] li {
            font-size: 1rem;
            line-height: 1.8;
          }

          [data-toc-content] blockquote {
            font-size: 1rem;
            padding: 1rem 1.25rem;
          }
        }
      `}</style>
    </main>
  )
}
