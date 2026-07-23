import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import BrandSystem from '@/components/BrandSystem'
import Services from '@/components/Services'
import AIDiagnostic from '@/components/AIDiagnostic'
import MethodStack from '@/components/MethodStack'
import Process from '@/components/Process'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const BlogArticlePreview = () => (
  <div className="relative mx-auto w-full max-w-[660px]">
    <div className="absolute -inset-6 rounded-[44px] bg-brand-blue/10 blur-3xl" />
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#050505] p-5 shadow-2xl shadow-black/40 md:p-8">
      <div className="mb-6 h-1.5 w-16 rounded-full bg-brand-blue" />
      <h3 className="text-[1.55rem] font-black leading-[1.05] tracking-tight text-white md:text-4xl keep-all">
        외국인 관광객 통계와 추이, 2026년 외국인마케팅이 중요한 이유
      </h3>

      <div className="mt-7 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-base font-black text-white md:h-14 md:w-14">
          BA
        </div>
        <div>
          <p className="text-base font-bold text-white md:text-lg">BlinkAds Team</p>
          <p className="text-sm font-medium text-gray-500 md:text-base">AEO·GEO Marketing Agency</p>
        </div>
      </div>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-gray-300 md:text-base keep-all">
        <p>외국인 관광객 수는 단순한 뉴스로만 보시면 안됩니다.</p>
        <p>
          한국에 들어오는 외국인이 얼마나 늘고 있는지, 어느 나라에서 많이 오는지, 서울에만 머무는지 지역으로 퍼지는지에 따라 브랜드와 매장이 준비해야 할 마케팅 방식이 달라집니다.
        </p>
        <p className="font-bold text-white underline decoration-white/40 underline-offset-4">
          특히 외국인 고객을 받을 수 있는 업종이라면 더 그렇습니다. 뷰티, 의료, 리테일, 숙박, 체험, 전시, 공연, 로컬 브랜드까지 모두 해당됩니다.
        </p>
        <p className="hidden text-gray-400 md:block">
          외국인 관광객이 늘어난다는 말은 검색 언어가 달라지고, 지도에서 찾는 방식이 달라지고, 리뷰를 확인하는 기준이 달라진다는 뜻입니다.
        </p>
      </div>
    </div>
  </div>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <BrandSystem />
        <Services />
        <AIDiagnostic />
        <MethodStack />
        <Process />

        <FAQ />

        {/* Blog Preview Section */}
        <section id="blog" className="py-24 md:py-40 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-5 md:px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div>
                <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Insights</p>
                <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] keep-all">
                  Google 프로필 운영과<br />
                  외국인마케팅을 기록합니다.
                </h2>
                <p className="mt-6 md:mt-8 max-w-2xl text-base md:text-xl text-gray-400 mb-9 md:mb-12 keep-all">
                  Google Maps 운영, 외국인 고객 유입, 웹사이트·블로그 콘텐츠, AEO 전환에 대한 실무 기록.
                </p>
                <div className="flex flex-col items-start gap-4">
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 text-lg font-semibold transition-colors group"
                  >
                    블로그 보기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a
                    href="/foreign-marketing"
                    className="inline-flex items-center gap-2 text-white hover:text-blue-100 text-lg font-semibold transition-colors group"
                  >
                    외국인마케팅 대행 구조 보기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>

              <BlogArticlePreview />
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  )
}
