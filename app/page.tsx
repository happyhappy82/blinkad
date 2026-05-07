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
        <section id="blog" className="py-20 md:py-32 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-5 md:px-6 text-center">
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Insights</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 md:mb-6 keep-all">검색과 AI 답변의 변화를 기록합니다.</h2>
            <p className="text-base md:text-lg text-gray-400 mb-9 md:mb-12 keep-all">
              병원 AEO, 외국인 마케팅, Google Maps 운영, 로컬 브랜드 성장에 대한 실무 기록.
            </p>
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 text-lg font-medium transition-colors group"
            >
              블로그 보기
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  )
}
