'use client'

import Image from 'next/image'
import {
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FolderOpen,
  MapPin,
  MessageCircleQuestion,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'

type IntakeFormData = {
  businessName: string
  desiredIdentity: string
  associationKeywords: string
  priorityServices: string
  differentiators: string
  competitorNames: string
  excludedExpressions: string
  revenueProducts: string
  growProducts: string
  priceRange: string
  averageTicket: string
  targetCustomers: string
  visitSituations: string
  targetRegions: string
  targetCountriesLanguages: string
  difficultCustomers: string
  frequentQuestions: string
  purchaseConcerns: string
  comparisonQuestions: string
  priceQuestions: string
  accessQuestions: string
  cancellationReasons: string
  misinformation: string
  originStory: string
  operatingHistory: string
  uniqueProcess: string
  qualityStandards: string
  experts: string
  firstPartyData: string
  cases: string
  nonPublicInformation: string
  awards: string
  credentials: string
  associations: string
  mediaActivities: string
  partnerships: string
  evidenceUrls: string
  openingHours: string
  reservationPolicy: string
  accessParking: string
  paymentMethods: string
  supportedLanguages: string
  foreignCustomerSupport: string
  messengerChannels: string
  cancellationPolicy: string
  recentChanges: string
  assetTypes: string[]
  assetFolderUrl: string
  additionalNotes: string
  factsConfirmed: boolean
  rightsConfirmed: boolean
  privacyConfirmed: boolean
  publicUseConfirmed: boolean
  privacyPolicyAgreed: boolean
  website: string
}

const STORAGE_KEY = 'blinkad-aeo-geo-client-intake-v2'

const initialData: IntakeFormData = {
  businessName: '',
  desiredIdentity: '',
  associationKeywords: '',
  priorityServices: '',
  differentiators: '',
  competitorNames: '',
  excludedExpressions: '',
  revenueProducts: '',
  growProducts: '',
  priceRange: '',
  averageTicket: '',
  targetCustomers: '',
  visitSituations: '',
  targetRegions: '',
  targetCountriesLanguages: '',
  difficultCustomers: '',
  frequentQuestions: '',
  purchaseConcerns: '',
  comparisonQuestions: '',
  priceQuestions: '',
  accessQuestions: '',
  cancellationReasons: '',
  misinformation: '',
  originStory: '',
  operatingHistory: '',
  uniqueProcess: '',
  qualityStandards: '',
  experts: '',
  firstPartyData: '',
  cases: '',
  nonPublicInformation: '',
  awards: '',
  credentials: '',
  associations: '',
  mediaActivities: '',
  partnerships: '',
  evidenceUrls: '',
  openingHours: '',
  reservationPolicy: '',
  accessParking: '',
  paymentMethods: '',
  supportedLanguages: '',
  foreignCustomerSupport: '',
  messengerChannels: '',
  cancellationPolicy: '',
  recentChanges: '',
  assetTypes: [],
  assetFolderUrl: '',
  additionalNotes: '',
  factsConfirmed: false,
  rightsConfirmed: false,
  privacyConfirmed: false,
  publicUseConfirmed: false,
  privacyPolicyAgreed: false,
  website: '',
}

const sections = [
  { title: '매장명', short: '매장', icon: Building2 },
  { title: '브랜딩 목표', short: '목표', icon: Target },
  { title: '상품·고객', short: '고객', icon: Users },
  { title: '실제 고객 질문', short: '질문', icon: MessageCircleQuestion },
  { title: '고유 경험', short: '경험', icon: Sparkles },
  { title: '경력·수상·증빙', short: '증빙', icon: BadgeCheck },
  { title: '방문·외국인 응대', short: '운영', icon: MapPin },
  { title: '자료·공개 동의', short: '확인', icon: FileCheck2 },
]

const requiredByStep: Array<Array<keyof IntakeFormData>> = [
  ['businessName'],
  ['desiredIdentity', 'associationKeywords', 'priorityServices'],
  ['growProducts', 'targetCustomers'],
  ['frequentQuestions'],
  ['uniqueProcess'],
  [],
  [],
  ['factsConfirmed', 'rightsConfirmed', 'privacyConfirmed', 'publicUseConfirmed', 'privacyPolicyAgreed'],
]

const labels: Partial<Record<keyof IntakeFormData, string>> = {
  businessName: '매장명',
  desiredIdentity: '원하는 브랜드 이미지',
  associationKeywords: '브랜드 연상 키워드',
  priorityServices: '가장 자신 있는 상품·서비스',
  growProducts: '앞으로 판매를 늘리고 싶은 상품·서비스',
  targetCustomers: '가장 유치하고 싶은 고객',
  frequentQuestions: '고객이 실제로 자주 묻는 질문',
  uniqueProcess: '다른 업체와 구분되는 운영 방식',
  factsConfirmed: '제공 정보의 사실 확인',
  rightsConfirmed: '자료 사용 권한 확인',
  privacyConfirmed: '개인정보 제외 확인',
  publicUseConfirmed: '콘텐츠 활용 범위 확인',
  privacyPolicyAgreed: '개인정보 수집·이용 동의',
}

const assetOptions = [
  '로고·브랜드 가이드',
  '외관·입구·찾아오는 길',
  '내부 공간·좌석',
  '대표 상품·메뉴·서비스',
  '대표자·의료진·셰프·직원 프로필',
  '운영·제작·상담 과정',
  '장비·시설·재료',
  '메뉴판·가격표',
  '수상·자격·인증서',
  '강연·방송·행사·협업',
  '외국어 안내문',
  '영상 자료',
]

function Field({
  id,
  label,
  required = false,
  help,
  children,
  error,
}: {
  id: string
  label: string
  required?: boolean
  help?: string
  children: ReactNode
  error?: string
}) {
  return (
    <div id={`field-${id}`} className="scroll-mt-28">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </label>
      {help && <p className="mb-3 text-xs leading-relaxed text-slate-500">{help}</p>}
      {children}
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-8 border-b border-slate-200 pb-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

export default function ClientIntakeForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<IntakeFormData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hydrated, setHydrated] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submissionId, setSubmissionId] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setData({ ...initialData, ...JSON.parse(saved) })
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated || submissionId) return
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1600)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [data, hydrated, submissionId])

  const progress = useMemo(() => Math.round(((step + 1) / sections.length) * 100), [step])

  const update = <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setData((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
  }

  const inputClass = (key?: keyof IntakeFormData) =>
    `w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
      key && errors[key] ? 'border-red-400' : 'border-slate-200'
    }`

  const validateStep = (targetStep = step) => {
    const nextErrors: Record<string, string> = {}
    for (const key of requiredByStep[targetStep]) {
      const value = data[key]
      if ((typeof value === 'string' && !value.trim()) || value === false) {
        nextErrors[key] = `${labels[key] || '필수 항목'}을 확인해 주세요.`
      }
    }
    setErrors(nextErrors)
    const first = Object.keys(nextErrors)[0]
    if (first) document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return Object.keys(nextErrors).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    setStep((current) => Math.min(current + 1, sections.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const previous = () => {
    setErrors({})
    setStep((current) => Math.max(current - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleAsset = (value: string) => {
    update(
      'assetTypes',
      data.assetTypes.includes(value)
        ? data.assetTypes.filter((item) => item !== value)
        : [...data.assetTypes, value]
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateStep(7)) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/client-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = (await response.json()) as { ok?: boolean; submissionId?: string; message?: string }
      if (!response.ok || !result.ok || !result.submissionId) {
        throw new Error(result.message || '제출 중 오류가 발생했습니다.')
      }
      setSubmissionId(result.submissionId)
      window.localStorage.removeItem(STORAGE_KEY)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submissionId) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-5 py-12 text-slate-950 md:py-20">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white px-7 py-14 text-center shadow-xl shadow-slate-200/60 md:px-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Submission complete</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">자료가 정상적으로 접수되었습니다</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            보내주신 내용을 확인한 뒤 추가 확인이 필요한 항목만 담당자를 통해 요청드리겠습니다.
          </p>
          <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-slate-50 px-5 py-4 text-sm">
            <span className="text-slate-500">접수번호</span>
            <strong className="ml-3 font-mono text-slate-900">{submissionId}</strong>
          </div>
          <p className="mt-8 text-xs leading-5 text-slate-500">접수번호를 별도로 저장해 주세요. 추가 자료는 담당자에게 보내주시면 됩니다.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <a href="https://www.blinkad.kr" aria-label="블링크애드 홈페이지">
            <Image src="/logo-black-nav.png" alt="BlinkAd" width={138} height={34} priority className="h-auto w-[128px] md:w-[138px]" />
          </a>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            클라이언트 전용
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <section className="mb-8 rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl shadow-slate-300/40 md:px-10 md:py-11">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">BlinkAd Client Intake</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">AEO·GEO 콘텐츠 자료 입력</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                검색·지도·AI 답변에 업체의 실제 강점을 정확히 반영하기 위한 자료입니다. 확인되지 않은 내용은 추측하지 말고 비워두거나 ‘확인 필요’라고 적어주세요.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
              <p>예상 작성 시간 <strong className="text-white">15~20분</strong></p>
              <p className="mt-1">작성 내용은 이 브라우저에 임시 저장됩니다.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>작성 진행률</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <nav className="grid grid-cols-4 gap-2 lg:block lg:space-y-1" aria-label="입력 단계">
                {sections.map((section, index) => {
                  const Icon = section.icon
                  const active = index === step
                  const completed = index < step
                  return (
                    <button
                      key={section.title}
                      type="button"
                      onClick={() => {
                        if (index <= step) {
                          setErrors({})
                          setStep(index)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                      className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center text-xs transition lg:flex-row lg:px-3 lg:text-left ${
                        active
                          ? 'bg-blue-600 font-semibold text-white'
                          : completed
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-slate-400'
                      }`}
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-white/15' : completed ? 'bg-white' : 'bg-slate-50'}`}>
                        {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className="lg:hidden">{section.short}</span>
                      <span className="hidden lg:inline">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="mt-4 hidden items-center justify-center gap-2 border-t border-slate-100 px-2 pt-4 text-xs text-slate-400 lg:flex">
                <Save className="h-3.5 w-3.5" />
                {saveState === 'saved' ? '임시 저장됨' : '자동 임시 저장'}
              </div>
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            {step === 0 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 1" title="매장명 확인" description="자료를 구분할 수 있도록 매장명만 입력해 주세요." />
                <Field id="businessName" label="매장명" required error={errors.businessName}>
                  <input id="businessName" className={inputClass('businessName')} value={data.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="예: 자루야키 용산" autoFocus />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 2" title="원하는 브랜드 이미지" description="키워드의 정확한 표현은 블링크애드가 검색수요를 확인해 다시 제안합니다. 여기서는 업체가 장기적으로 어떻게 기억되고 싶은지 알려주세요." />
                <Field id="desiredIdentity" label="고객에게 어떤 업체로 기억되고 싶으신가요?" required error={errors.desiredIdentity} help="예: 여행 일정 중에도 편하게 상담받을 수 있는 외국인 친화 안과">
                  <textarea id="desiredIdentity" rows={4} className={inputClass('desiredIdentity')} value={data.desiredIdentity} onChange={(e) => update('desiredIdentity', e.target.value)} />
                </Field>
                <Field id="associationKeywords" label="매장명과 함께 알려지고 싶은 표현을 3개까지 적어주세요." required error={errors.associationKeywords} help="예: 용산 숙성육 전문점 / 인천공항 근처 외국인 진료 피부과">
                  <textarea id="associationKeywords" rows={3} className={inputClass('associationKeywords')} value={data.associationKeywords} onChange={(e) => update('associationKeywords', e.target.value)} />
                </Field>
                <Field id="priorityServices" label="가장 자신 있는 상품·서비스는 무엇인가요?" required error={errors.priorityServices}>
                  <textarea id="priorityServices" rows={4} className={inputClass('priorityServices')} value={data.priorityServices} onChange={(e) => update('priorityServices', e.target.value)} />
                </Field>
                <Field id="differentiators" label="경쟁업체가 아닌 귀사를 선택해야 하는 이유는 무엇인가요?" help="실제 운영 방식, 전문성, 상품, 위치, 응대 등 확인 가능한 차이만 적어주세요.">
                  <textarea id="differentiators" rows={5} className={inputClass()} value={data.differentiators} onChange={(e) => update('differentiators', e.target.value)} />
                </Field>
                <Field id="competitorNames" label="비교되는 경쟁업체·대안이 있나요?">
                  <textarea id="competitorNames" rows={3} className={inputClass()} value={data.competitorNames} onChange={(e) => update('competitorNames', e.target.value)} placeholder="업체명 또는 고객이 함께 비교하는 상품·서비스" />
                </Field>
                <Field id="excludedExpressions" label="사용하지 않았으면 하는 표현이나 강조하면 안 되는 내용이 있나요?">
                  <textarea id="excludedExpressions" rows={3} className={inputClass()} value={data.excludedExpressions} onChange={(e) => update('excludedExpressions', e.target.value)} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 3" title="핵심 상품과 고객" description="정확한 매출액이 부담스러우면 상품 순위와 대략적인 비중만 적어도 됩니다. 공개 여부는 블링크애드가 다시 확인합니다." />
                <Field id="revenueProducts" label="현재 매출 비중이 높은 상품·서비스 3가지는 무엇인가요?">
                  <textarea id="revenueProducts" rows={4} className={inputClass()} value={data.revenueProducts} onChange={(e) => update('revenueProducts', e.target.value)} />
                </Field>
                <Field id="growProducts" label="앞으로 판매를 늘리고 싶은 상품·서비스 3가지는 무엇인가요?" required error={errors.growProducts}>
                  <textarea id="growProducts" rows={4} className={inputClass('growProducts')} value={data.growProducts} onChange={(e) => update('growProducts', e.target.value)} />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field id="priceRange" label="대표 가격 또는 가격대">
                    <textarea id="priceRange" rows={3} className={inputClass()} value={data.priceRange} onChange={(e) => update('priceRange', e.target.value)} placeholder="상품명과 현재 가격, 확인일" />
                  </Field>
                  <Field id="averageTicket" label="평균 객단가">
                    <input id="averageTicket" className={inputClass()} value={data.averageTicket} onChange={(e) => update('averageTicket', e.target.value)} placeholder="공개가 어렵다면 대략적인 범위" />
                  </Field>
                </div>
                <Field id="targetCustomers" label="앞으로 가장 유치하고 싶은 고객은 누구인가요?" required error={errors.targetCustomers} help="연령대·지역·방문 목적·동반 인원·고민을 함께 적어주세요.">
                  <textarea id="targetCustomers" rows={5} className={inputClass('targetCustomers')} value={data.targetCustomers} onChange={(e) => update('targetCustomers', e.target.value)} />
                </Field>
                <Field id="visitSituations" label="고객은 주로 어떤 상황에서 귀사를 찾나요?" help="예: 회식 장소를 예약할 때, 여행 중 당일 진료가 필요할 때">
                  <textarea id="visitSituations" rows={4} className={inputClass()} value={data.visitSituations} onChange={(e) => update('visitSituations', e.target.value)} />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field id="targetRegions" label="중점 지역·상권">
                    <textarea id="targetRegions" rows={3} className={inputClass()} value={data.targetRegions} onChange={(e) => update('targetRegions', e.target.value)} />
                  </Field>
                  <Field id="targetCountriesLanguages" label="목표 국가·언어">
                    <textarea id="targetCountriesLanguages" rows={3} className={inputClass()} value={data.targetCountriesLanguages} onChange={(e) => update('targetCountriesLanguages', e.target.value)} />
                  </Field>
                </div>
                <Field id="difficultCustomers" label="유치가 어렵거나 서비스를 제공하기 어려운 고객·상황이 있나요?">
                  <textarea id="difficultCustomers" rows={3} className={inputClass()} value={data.difficultCustomers} onChange={(e) => update('difficultCustomers', e.target.value)} />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 4" title="고객이 실제로 묻는 질문" description="검색어처럼 다듬지 말고 전화·상담·예약 현장에서 들었던 표현과 최대한 비슷하게 적어주세요." />
                <Field id="frequentQuestions" label="가장 자주 받는 질문을 5~10개 적어주세요." required error={errors.frequentQuestions} help="한 줄에 질문 하나씩 적어주세요.">
                  <textarea id="frequentQuestions" rows={8} className={inputClass('frequentQuestions')} value={data.frequentQuestions} onChange={(e) => update('frequentQuestions', e.target.value)} placeholder={'예) 주차 가능한가요?\n예) 당일 예약도 가능한가요?'} />
                </Field>
                <Field id="purchaseConcerns" label="고객이 구매·예약 전에 가장 걱정하는 부분은 무엇인가요?">
                  <textarea id="purchaseConcerns" rows={4} className={inputClass()} value={data.purchaseConcerns} onChange={(e) => update('purchaseConcerns', e.target.value)} />
                </Field>
                <Field id="comparisonQuestions" label="다른 업체나 상품과 비교해서 묻는 질문은 무엇인가요?">
                  <textarea id="comparisonQuestions" rows={4} className={inputClass()} value={data.comparisonQuestions} onChange={(e) => update('comparisonQuestions', e.target.value)} />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field id="priceQuestions" label="가격과 관련해 자주 받는 질문">
                    <textarea id="priceQuestions" rows={4} className={inputClass()} value={data.priceQuestions} onChange={(e) => update('priceQuestions', e.target.value)} />
                  </Field>
                  <Field id="accessQuestions" label="방문·주차·예약 관련 질문">
                    <textarea id="accessQuestions" rows={4} className={inputClass()} value={data.accessQuestions} onChange={(e) => update('accessQuestions', e.target.value)} />
                  </Field>
                </div>
                <Field id="cancellationReasons" label="고객이 구매를 망설이거나 취소하는 주요 이유는 무엇인가요?">
                  <textarea id="cancellationReasons" rows={4} className={inputClass()} value={data.cancellationReasons} onChange={(e) => update('cancellationReasons', e.target.value)} />
                </Field>
                <Field id="misinformation" label="검색·AI·후기에서 잘못 알려졌거나 자주 생기는 오해가 있나요?">
                  <textarea id="misinformation" rows={4} className={inputClass()} value={data.misinformation} onChange={(e) => update('misinformation', e.target.value)} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 5" title="업체만의 고유한 경험" description="다른 사이트에서 찾을 수 없는 실제 운영 경험이 콘텐츠의 가장 중요한 재료입니다. 영업비밀은 공개 가능한 범위까지만 적어주세요." />
                <Field id="originStory" label="창업·개원 계기와 브랜드 이야기를 알려주세요.">
                  <textarea id="originStory" rows={5} className={inputClass()} value={data.originStory} onChange={(e) => update('originStory', e.target.value)} />
                </Field>
                <Field id="operatingHistory" label="현재까지의 운영 이력">
                  <textarea id="operatingHistory" rows={3} className={inputClass()} value={data.operatingHistory} onChange={(e) => update('operatingHistory', e.target.value)} placeholder="개업일, 이전·확장·리뉴얼 등" />
                </Field>
                <Field id="uniqueProcess" label="다른 업체와 구분되는 실제 운영·상담·제작·서비스 방식은 무엇인가요?" required error={errors.uniqueProcess}>
                  <textarea id="uniqueProcess" rows={6} className={inputClass('uniqueProcess')} value={data.uniqueProcess} onChange={(e) => update('uniqueProcess', e.target.value)} />
                </Field>
                <Field id="qualityStandards" label="품질을 유지하기 위해 내부적으로 지키는 기준이 있나요?">
                  <textarea id="qualityStandards" rows={4} className={inputClass()} value={data.qualityStandards} onChange={(e) => update('qualityStandards', e.target.value)} />
                </Field>
                <Field id="experts" label="대표자·의료진·셰프·디자이너 등 전문가와 전문 분야를 알려주세요.">
                  <textarea id="experts" rows={5} className={inputClass()} value={data.experts} onChange={(e) => update('experts', e.target.value)} placeholder="성명, 직책, 전문 분야, 주요 경력" />
                </Field>
                <Field id="firstPartyData" label="공개 가능한 자체 데이터가 있나요?" help="누적 이용·판매·시술 건수, 재방문율, 만족도 등은 집계 기간과 방법도 함께 적어주세요.">
                  <textarea id="firstPartyData" rows={5} className={inputClass()} value={data.firstPartyData} onChange={(e) => update('firstPartyData', e.target.value)} />
                </Field>
                <Field id="cases" label="개인정보 없이 소개할 수 있는 실제 사례가 있나요?">
                  <textarea id="cases" rows={5} className={inputClass()} value={data.cases} onChange={(e) => update('cases', e.target.value)} />
                </Field>
                <Field id="nonPublicInformation" label="외부에 공개하면 안 되는 정보가 있나요?">
                  <textarea id="nonPublicInformation" rows={3} className={inputClass()} value={data.nonPublicInformation} onChange={(e) => update('nonPublicInformation', e.target.value)} />
                </Field>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 6" title="경력·수상·활동과 증빙" description="정확한 명칭, 주최·발급기관, 날짜, 역할과 공식 확인 링크를 함께 적어주세요. 증빙할 수 없는 ‘1위·최고·유일’ 표현은 사용하지 않습니다." />
                <Field id="awards" label="수상·선정·인증">
                  <textarea id="awards" rows={5} className={inputClass()} value={data.awards} onChange={(e) => update('awards', e.target.value)} placeholder="명칭 / 기관 / 날짜 / 부문 / 적용 대상" />
                </Field>
                <Field id="credentials" label="면허·자격·경력">
                  <textarea id="credentials" rows={5} className={inputClass()} value={data.credentials} onChange={(e) => update('credentials', e.target.value)} placeholder="성명 / 자격명 / 발급기관 / 취득일" />
                </Field>
                <Field id="associations" label="협회·학회·공식기관 활동">
                  <textarea id="associations" rows={4} className={inputClass()} value={data.associations} onChange={(e) => update('associations', e.target.value)} />
                </Field>
                <Field id="mediaActivities" label="언론·방송·기고·강연·세미나 활동">
                  <textarea id="mediaActivities" rows={5} className={inputClass()} value={data.mediaActivities} onChange={(e) => update('mediaActivities', e.target.value)} />
                </Field>
                <Field id="partnerships" label="공식 파트너십·입점·협업·납품 이력">
                  <textarea id="partnerships" rows={4} className={inputClass()} value={data.partnerships} onChange={(e) => update('partnerships', e.target.value)} />
                </Field>
                <Field id="evidenceUrls" label="공식 확인 URL" help="수상·자격·기사·협회·파트너 페이지를 한 줄에 하나씩 적어주세요.">
                  <textarea id="evidenceUrls" rows={6} className={inputClass()} value={data.evidenceUrls} onChange={(e) => update('evidenceUrls', e.target.value)} placeholder="https://" />
                </Field>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 7" title="방문·예약과 외국인 응대" description="고객이 방문과 예약을 결정할 때 필요한 실제 운영정보입니다. 변경 가능성이 있는 내용은 기준일을 함께 적어주세요." />
                <Field id="openingHours" label="요일별 영업시간·휴무·브레이크타임">
                  <textarea id="openingHours" rows={4} className={inputClass()} value={data.openingHours} onChange={(e) => update('openingHours', e.target.value)} />
                </Field>
                <Field id="reservationPolicy" label="예약·당일 방문·단체 이용 조건">
                  <textarea id="reservationPolicy" rows={5} className={inputClass()} value={data.reservationPolicy} onChange={(e) => update('reservationPolicy', e.target.value)} />
                </Field>
                <Field id="accessParking" label="대중교통·주차·입구·접근성 안내">
                  <textarea id="accessParking" rows={5} className={inputClass()} value={data.accessParking} onChange={(e) => update('accessParking', e.target.value)} />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field id="paymentMethods" label="결제 가능한 수단">
                    <textarea id="paymentMethods" rows={3} className={inputClass()} value={data.paymentMethods} onChange={(e) => update('paymentMethods', e.target.value)} />
                  </Field>
                  <Field id="supportedLanguages" label="실제 응대 가능한 언어와 수준">
                    <textarea id="supportedLanguages" rows={3} className={inputClass()} value={data.supportedLanguages} onChange={(e) => update('supportedLanguages', e.target.value)} placeholder="예: 영어 기본 안내, 일본어 통역 예약 필요" />
                  </Field>
                </div>
                <Field id="foreignCustomerSupport" label="외국인 고객에게 별도로 안내해야 하는 내용">
                  <textarea id="foreignCustomerSupport" rows={5} className={inputClass()} value={data.foreignCustomerSupport} onChange={(e) => update('foreignCustomerSupport', e.target.value)} placeholder="해외카드, 여권, 세금, 알레르기, 진료·예약 준비 등" />
                </Field>
                <Field id="messengerChannels" label="외국어 예약·문의 채널">
                  <textarea id="messengerChannels" rows={3} className={inputClass()} value={data.messengerChannels} onChange={(e) => update('messengerChannels', e.target.value)} placeholder="WhatsApp, LINE, WeChat 등 실제 운영 채널과 URL" />
                </Field>
                <Field id="cancellationPolicy" label="취소·환불·예약 변경 규정">
                  <textarea id="cancellationPolicy" rows={4} className={inputClass()} value={data.cancellationPolicy} onChange={(e) => update('cancellationPolicy', e.target.value)} />
                </Field>
                <Field id="recentChanges" label="최근 변경되었거나 곧 변경될 정보">
                  <textarea id="recentChanges" rows={4} className={inputClass()} value={data.recentChanges} onChange={(e) => update('recentChanges', e.target.value)} placeholder="가격, 영업시간, 인력, 주소, 서비스 등" />
                </Field>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-7">
                <SectionHeading eyebrow="Step 8" title="자료 전달과 공개 동의" description="이 Form에는 파일을 직접 올리지 않습니다. 회사에서 관리하는 Google Drive·Dropbox 등 공유 폴더에 원본 자료를 넣고 링크를 전달해 주세요." />
                <Field id="assetTypes" label="전달 가능한 자료를 모두 선택해 주세요.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {assetOptions.map((option) => {
                      const checked = data.assetTypes.includes(option)
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAsset(option)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${checked ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                            {checked && <Check className="h-3.5 w-3.5" />}
                          </span>
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </Field>
                <Field id="assetFolderUrl" label="자료 공유 폴더 URL" help="접근 권한을 확인해 주세요. 고객·환자의 민감한 개인정보는 포함하지 마세요.">
                  <div className="relative">
                    <FolderOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input id="assetFolderUrl" type="url" className={`${inputClass()} pl-12`} value={data.assetFolderUrl} onChange={(e) => update('assetFolderUrl', e.target.value)} placeholder="https://" />
                  </div>
                </Field>
                <Field id="additionalNotes" label="추가로 전달할 내용">
                  <textarea id="additionalNotes" rows={5} className={inputClass()} value={data.additionalNotes} onChange={(e) => update('additionalNotes', e.target.value)} />
                </Field>

                <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 md:p-6">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><ShieldCheck className="h-5 w-5 text-blue-600" /> 개인정보 수집·이용 안내</h3>
                  <dl className="mt-5 grid gap-4 text-sm leading-6 text-slate-700 md:grid-cols-[132px_1fr] md:gap-x-5 md:gap-y-3">
                    <dt className="font-semibold text-slate-950">수집 항목</dt>
                    <dd>매장명과 입력·전달한 업체 자료</dd>
                    <dt className="font-semibold text-slate-950">이용 목적</dt>
                    <dd>제출 매장 식별, 계약 및 온보딩 업무, AEO·GEO 콘텐츠 기획·제작, 사실 확인과 보완 요청</dd>
                    <dt className="font-semibold text-slate-950">보유·이용 기간</dt>
                    <dd>계약 종료 또는 마지막 업무 완료일로부터 1년간 보관 후 파기합니다. 관계 법령에 별도 보존 의무가 있는 경우에는 해당 기간 동안 보관합니다.</dd>
                    <dt className="font-semibold text-slate-950">동의 거부 안내</dt>
                    <dd>동의를 거부할 수 있으나, 거부 시 Form 제출과 관련 콘텐츠 업무 진행이 제한될 수 있습니다.</dd>
                  </dl>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><ShieldCheck className="h-5 w-5 text-blue-600" /> 제출 전 확인</h3>
                  <div className="mt-5 space-y-3">
                    {[
                      { key: 'factsConfirmed', text: '제공한 내용은 확인 가능한 사실을 기준으로 작성했습니다.' },
                      { key: 'rightsConfirmed', text: '전달한 사진·영상·문서의 사용 권한을 보유하고 있습니다.' },
                      { key: 'privacyConfirmed', text: '고객·환자를 식별할 수 있는 개인정보와 민감정보를 포함하지 않았습니다.' },
                      { key: 'publicUseConfirmed', text: '공개 불가라고 별도 표시하지 않은 자료는 홈페이지·지도·콘텐츠 제작에 사용할 수 있습니다.' },
                      { key: 'privacyPolicyAgreed', text: '위 개인정보 수집·이용 안내를 확인했으며 이에 동의합니다.' },
                    ].map((item) => {
                      const key = item.key as keyof IntakeFormData
                      const checked = Boolean(data[key])
                      return (
                        <div key={item.key} id={`field-${item.key}`} className="scroll-mt-28">
                          <button
                            type="button"
                            onClick={() => update(key, !checked as never)}
                            className="flex w-full items-start gap-3 text-left"
                          >
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {checked && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span className="text-sm leading-6 text-slate-700">{item.text} <span className="text-blue-600">*</span></span>
                          </button>
                          {errors[item.key] && <p className="ml-8 mt-1 text-xs font-medium text-red-600">{errors[item.key]}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update('website', e.target.value)} />
                </div>

                {submitError && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{submitError}</div>}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={previous}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronLeft className="h-4 w-4" /> 이전
              </button>
              {step < sections.length - 1 ? (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                  다음 <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? '제출 중…' : '자료 제출하기'} <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        <footer className="py-10 text-center text-xs leading-5 text-slate-400">
          계정 비밀번호, 주민등록번호, 진료기록, 고객·환자를 식별할 수 있는 정보는 입력하지 마세요.<br />
          © BlinkAd. AEO·GEO Client Intake.
        </footer>
      </div>
    </main>
  )
}
