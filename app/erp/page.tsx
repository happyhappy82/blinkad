import type { Metadata } from 'next'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
  Globe2,
  LayoutDashboard,
  MapPinned,
  MessageSquareReply,
  ReceiptText,
  Search,
  Settings2,
  UploadCloud,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'BlinkAd ERP | Google Marketing Operations OS',
  description:
    '블링크애드의 문의관리, 진단자료, 견적서, 온보딩, Google 프로필 운영을 한 화면에서 관리하는 ERP 프로토타입입니다.',
}

const navItems = [
  { label: '운영 대시보드', icon: LayoutDashboard, active: true },
  { label: '문의 CRM', icon: Building2 },
  { label: '진단자료', icon: FileSearch },
  { label: '견적서', icon: ReceiptText },
  { label: '온보딩 자료', icon: UploadCloud },
  { label: '프로필 운영', icon: MapPinned },
  { label: '리포트', icon: BarChart3 },
  { label: '설정', icon: Settings2 },
]

const kpis = [
  {
    label: '오늘 처리할 문의',
    value: '8',
    detail: '진단 대기 3건',
    icon: Search,
  },
  {
    label: '견적 발송 대기',
    value: '5',
    detail: '1개월 견적서 3건',
    icon: ReceiptText,
  },
  {
    label: '운영 중 매장',
    value: '18',
    detail: '이번 주 게시물 42건',
    icon: MapPinned,
  },
  {
    label: '리뷰 답글 대기',
    value: '27',
    detail: '저평점 리뷰 4건 포함',
    icon: MessageSquareReply,
  },
]

const pipeline = [
  { label: '문의 접수', count: 11, color: 'bg-white' },
  { label: '진단자료 생성', count: 7, color: 'bg-brand-blue' },
  { label: '견적 발송', count: 5, color: 'bg-cyan-300' },
  { label: '계약 대기', count: 4, color: 'bg-amber-300' },
  { label: '운영 시작', count: 18, color: 'bg-emerald-300' },
]

const automations = [
  {
    title: 'Google 프로필 진단자료',
    status: '자동화 가능',
    description: '구글맵 링크 입력 후 DataForSEO 기반 PDF 진단서 생성',
    output: '분석자료 열 저장',
    icon: FileSearch,
  },
  {
    title: 'BlinkAd 견적서',
    status: '스킬 연결',
    description: '1개월, 3/6/12개월, 프로필 최적화 세팅 견적서 생성',
    output: '견적서 열 저장',
    icon: ReceiptText,
  },
  {
    title: '업종별 자료 요청',
    status: '템플릿화',
    description: '병원, 헤어샵, 요식업별 사진·메뉴판·신뢰자료 요청',
    output: '온보딩 체크리스트',
    icon: UploadCloud,
  },
]

const clients = [
  {
    name: '미플러스치과 신사',
    category: '병원',
    stage: '진단완료',
    quote: '견적 대기',
    owner: '권순현',
    next: '구글맵 진단자료 확인',
  },
  {
    name: '월하동',
    category: '요식업',
    stage: '견적발송',
    quote: '1개월',
    owner: '블링크애드',
    next: '사진·메뉴판 자료 요청',
  },
  {
    name: '대게특별시',
    category: '요식업',
    stage: '계약대기',
    quote: '3개월 제안',
    owner: '권순현',
    next: '광고비 별도 안내',
  },
  {
    name: '주하(데이즈 후카 바)',
    category: '로컬 매장',
    stage: '견적완료',
    quote: '1개월',
    owner: '블링크애드',
    next: '입금 확인',
  },
]

const operationItems = [
  {
    title: '프로필 기초 세팅',
    items: ['소유자 인증 확인', '지점명·주소·전화번호 정리', '카테고리 분석 및 재설정'],
  },
  {
    title: '콘텐츠 운영',
    items: ['Google 게시물 주 2회', '다국어 소식지 작성', '사진·메뉴판 재정렬'],
  },
  {
    title: '리뷰 관리',
    items: ['저평점 리뷰 분류', '다국어 대댓글 초안', '리뷰 인입 QR 제작'],
  },
  {
    title: '브랜드 자산 연결',
    items: ['웹사이트 URL 연결', '지점별 페이지 구성', 'FAQ·Answer 콘텐츠 설계'],
  },
]

const roadmap = [
  {
    month: '1개월차',
    title: '프로필 기본 정비',
    description: 'Google이 읽는 공식 매장 정보를 먼저 맞춥니다.',
    tasks: ['소유자 인증 확인', '기본정보 정리', '대표 사진·메뉴판 정비', '리뷰 응대 기준 구축'],
  },
  {
    month: '2개월차',
    title: '웹페이지 연결',
    description: '프로필에서 끝나지 않고 공식 브랜드 페이지로 연결합니다.',
    tasks: ['브랜드/지점 페이지 제작', 'Google 프로필 URL 연결', '메뉴·FAQ 반영', '전환 CTA 정리'],
  },
  {
    month: '3개월차',
    title: '브랜드 콘텐츠 설계',
    description: '외국인 고객과 AI가 참고할 설명 자산을 누적합니다.',
    tasks: ['다국어 게시물 운영', '블로그 콘텐츠 보강', '구조화 데이터 방향 설계', '월간 리포트'],
  },
]

export default function ErpPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black lg:block">
          <div className="flex h-20 items-center border-b border-white/10 px-7">
            <a href="/" aria-label="BlinkAd home">
              <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
            </a>
          </div>

          <nav className="px-4 py-5">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Operations OS
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                      item.active
                        ? 'bg-brand-blue text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="mx-4 mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-bold text-white">오늘의 운영 기준</p>
            <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
              문의가 들어오면 진단자료와 견적서를 먼저 만들고, 계약 후 운영 체크리스트를 자동으로 펼칩니다.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050608]/90 backdrop-blur">
            <div className="flex h-20 items-center justify-between gap-4 px-5 md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                  BlinkAd ERP
                </p>
                <h1 className="mt-1 text-xl font-black tracking-tight text-white md:text-2xl">
                  Google Marketing Operations OS
                </h1>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-bold text-gray-200 hover:border-white/30 hover:bg-white/5"
                >
                  <CalendarDays className="h-4 w-4" />
                  이번 주 업무
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-600"
                >
                  <FileText className="h-4 w-4" />
                  새 진단 만들기
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-6 md:px-8 md:py-8">
            <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">오늘 처리할 흐름</p>
                    <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl keep-all">
                      문의부터 운영까지,
                      <br className="hidden md:block" /> 한 화면에서 이어집니다.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400 keep-all">
                      진단자료, 견적서, 자료요청, Google 프로필 운영을 따로 찾지 않고 매장별 진행상태로 묶어 관리합니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm md:min-w-64">
                    <div className="rounded-md border border-white/10 bg-black p-3">
                      <p className="text-gray-500">자동화 스킬</p>
                      <p className="mt-2 text-2xl font-black text-white">5개</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-black p-3">
                      <p className="text-gray-500">핵심 단계</p>
                      <p className="mt-2 text-2xl font-black text-white">6단계</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-5">
                  {pipeline.map((step, index) => (
                    <div key={step.label} className="rounded-md border border-white/10 bg-black p-4">
                      <div className={`h-1.5 w-10 rounded-full ${step.color}`} />
                      <p className="mt-4 text-sm font-bold text-white">{step.label}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <p className="text-3xl font-black tracking-tight">{step.count}</p>
                        <span className="text-xs font-semibold text-gray-500">STEP {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-7">
                <p className="text-sm font-bold text-brand-blue">자동화 우선순위</p>
                <div className="mt-5 space-y-3">
                  {automations.map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.title} className="rounded-lg border border-white/10 bg-black p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-black">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-black text-white">{item.title}</p>
                              <p className="mt-1 text-sm leading-5 text-gray-400 keep-all">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-brand-blue/15 px-2.5 py-1 text-xs font-bold text-brand-blue">
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          {item.output}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon

                return (
                  <div key={kpi.label} className="rounded-lg border border-white/10 bg-[#0b0d12] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-400">{kpi.label}</p>
                      <Icon className="h-5 w-5 text-brand-blue" />
                    </div>
                    <p className="mt-4 text-4xl font-black tracking-tight text-white">{kpi.value}</p>
                    <p className="mt-2 text-sm text-gray-500">{kpi.detail}</p>
                  </div>
                )
              })}
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">문의관리 CRM</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">매장별 다음 행동</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full border border-white/15 px-3 py-2 text-sm font-bold text-gray-300">
                      전체
                    </button>
                    <button className="rounded-full border border-brand-blue bg-brand-blue px-3 py-2 text-sm font-bold text-white">
                      오늘 처리
                    </button>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
                  <div className="grid grid-cols-[1.1fr_0.7fr_0.75fr_0.8fr] bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 md:grid-cols-[1.2fr_0.65fr_0.7fr_0.65fr_1fr]">
                    <span>고객명</span>
                    <span>업종</span>
                    <span>상태</span>
                    <span className="hidden md:block">견적</span>
                    <span>다음 액션</span>
                  </div>
                  {clients.map((client) => (
                    <div
                      key={client.name}
                      className="grid grid-cols-[1.1fr_0.7fr_0.75fr_0.8fr] items-center border-t border-white/10 px-4 py-4 text-sm md:grid-cols-[1.2fr_0.65fr_0.7fr_0.65fr_1fr]"
                    >
                      <div>
                        <p className="font-black text-white keep-all">{client.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{client.owner}</p>
                      </div>
                      <span className="font-semibold text-gray-300">{client.category}</span>
                      <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                        {client.stage}
                      </span>
                      <span className="hidden font-semibold text-gray-400 md:block">{client.quote}</span>
                      <span className="font-semibold leading-5 text-gray-300 keep-all">{client.next}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
                <p className="text-sm font-bold text-brand-blue">운영 누락 방지</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Google 프로필 운영 보드</h2>

                <div className="mt-5 space-y-3">
                  {operationItems.map((group) => (
                    <div key={group.title} className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="font-black text-white">{group.title}</p>
                      <ul className="mt-3 space-y-2">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-5 text-gray-400">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                            <span className="keep-all">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
              <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-sm font-bold text-brand-blue">계약 후 작업 프로세스</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                    3개월 로드맵
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 keep-all">
                    광고처럼 즉각 터지는 작업이 아니라, Google과 AI가 참고할 공식 정보를 매달 누적하는 구조입니다.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  {roadmap.map((month) => (
                    <div key={month.month} className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="text-sm font-black text-brand-blue">{month.month}</p>
                      <h3 className="mt-2 text-xl font-black leading-tight text-white keep-all">
                        {month.title}
                      </h3>
                      <p className="mt-2 text-sm leading-5 text-gray-500 keep-all">{month.description}</p>
                      <div className="mt-4 space-y-2">
                        {month.tasks.map((task) => (
                          <div key={task} className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <ClipboardCheck className="h-4 w-4 text-brand-blue" />
                            <span className="keep-all">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
                <p className="text-sm font-bold text-brand-blue">자료 요청 자동화</p>
                <h2 className="mt-2 text-2xl font-black text-white">업종별 온보딩</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {['병원', '요식업', '헤어샵'].map((category) => (
                    <div key={category} className="rounded-lg border border-white/10 bg-black p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-white">{category}</p>
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="mt-3 text-sm leading-5 text-gray-400 keep-all">
                        사진, 메뉴·시술 정보, 신뢰자료, 외국인 안내에 필요한 원천자료를 체크리스트로 요청합니다.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">AEO/GEO 운영 방향</p>
                    <h2 className="mt-2 text-2xl font-black text-white">프로필에서 Answer까지 연결</h2>
                  </div>
                  <Globe2 className="h-7 w-7 text-brand-blue" />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  {['Profile', 'Website', 'Blog', 'Answer'].map((step, index) => (
                    <div key={step} className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="text-xs font-bold text-gray-500">0{index + 1}</p>
                      <p className="mt-4 text-lg font-black text-white">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                    <p className="text-sm font-semibold leading-6 text-amber-50 keep-all">
                      ERP의 목표는 단순 기록이 아니라, 매장별 Google 프로필·웹사이트·블로그·FAQ가 같은 정보를 말하도록 운영 기준을 고정하는 것입니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
