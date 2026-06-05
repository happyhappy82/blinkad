# 병원 AEO/GEO 콘텐츠 허브 레퍼런스 검증

- 기준일: 2026-06-05
- 목적: 블링크애드 요식업 샘플의 병원 버전을 만들기 전, 병원 기존 홈페이지를 대체하지 않고 AEO/GEO 콘텐츠를 별도 축적하는 웹사이트 레퍼런스를 검증한다.
- 전제: 병원 분야는 YMYL 영역이므로 다국어 UI보다 의사/전문가 검수, 검토일, 근거 출처, 의료 고지, 구조화 데이터가 더 중요하다.

## 결론

완전히 같은 형태의 "병원 AEO/GEO 전용 별도 사이트" 레퍼런스는 드물다. 대신 아래 5개 유형을 조합하는 것이 맞다.

1. MSK Patient & Community Education: 다국어 환자교육 라이브러리 구조
2. Mayo Clinic Health Information: 시술/질환별 환자 친화형 설명 페이지
3. Cleveland Clinic Health Library: 의료 콘텐츠 편집/검수/출처 정책
4. 닥터나우 건강 매거진/Q&A: 한국형 의사 감수, 목차, FAQ, CTA 구조
5. 서울아산병원 질환백과: 한국 병원 소유 건강정보 허브의 권위성/분류 체계

따라서 새 샘플은 "병원 공식 홈페이지"가 아니라 "의사가 답하는 다국어 의료 Q&A/시술 정보 허브"로 설계하는 것이 적합하다.

## 검증 기준

- 병원 또는 의료 권위 기관이 운영하거나 의료 전문가 감수 체계가 있는가
- 기존 병원 홈페이지와 분리된 정보 허브/라이브러리 성격이 있는가
- 질문, 질환, 시술 단위로 URL을 축적할 수 있는가
- 작성자, 감수자, 검토일, 업데이트일, 참고 출처가 드러나는가
- 다국어 페이지 또는 언어 선택 구조가 있는가
- MedicalWebPage, FAQPage, Physician, MedicalOrganization 같은 구조화 데이터 설계와 맞는가

## 레퍼런스별 검증

### 1. Memorial Sloan Kettering Cancer Center - Patient & Community Education

- URL: https://www.mskcc.org/cancer-care/patient-education
- 검증 내용:
  - 환자교육 전용 라이브러리이며 글, 영상, 온라인 프로그램을 검색할 수 있다.
  - 검색 페이지에 언어 필터가 있고 Spanish, Russian, English, Simplified Chinese, Korean 등 다수 언어가 표시된다.
  - 일부 약물/환자교육 페이지에는 Last Reviewed Date, Last Updated, PDF/large font, translation 링크가 있다.
- 샘플 반영:
  - `/resources`, `/qa`, `/procedures`, `/conditions` 같은 라이브러리형 허브
  - 언어별 필터와 페이지별 번역본 링크
  - 인쇄/PDF까지는 1차 샘플에서 생략 가능하지만 의료기관 납품형에서는 강점
- 한계:
  - 암센터 중심이고 국내 피부/성형/치과 로컬 병원과 톤이 다르다.
  - AEO/GEO라는 용어로 설계된 사이트는 아니다.

### 2. Mayo Clinic - Botox injections

- URL: https://www.mayoclinic.org/tests-procedures/botox/about/pac-20384658
- Spanish URL: https://www.mayoclinic.org/es/tests-procedures/botox/about/pac-20384658
- 검증 내용:
  - 시술 단위 페이지가 Overview, Why it is done, Risks, How you prepare, What you can expect, Results로 나뉜다.
  - 같은 Botox 주제의 Spanish 번역 페이지가 있다.
  - Results 섹션에서 효과 시작 시점과 지속 기간을 명확히 답한다.
- 샘플 반영:
  - 시술 페이지는 "요약 답변 -> 대상 -> 과정 -> 리스크 -> 회복/지속기간 -> FAQ" 순서가 적합
  - 영어/일본어/중국어 번역은 단순 UI 번역이 아니라 본문 자체 번역으로 구현
- 한계:
  - 개별 의사 byline보다 기관 권위 중심이다.
  - 지역 병원 전환 CTA 구조는 약하다.

### 3. Cleveland Clinic - Health Library

- URL: https://my.clevelandclinic.org/health/about
- 검증 내용:
  - Health Library 목적을 "education, not diagnosis or treatment"로 명확히 제한한다.
  - peer-reviewed journal, textbook, major health organization 정보를 출처로 사용한다고 밝힌다.
  - 모든 글은 해당 주제 전문 Cleveland Clinic provider가 publication 전 검토하고, 정기적으로 재검토한다고 설명한다.
- 샘플 반영:
  - `/legal`, `/editorial-policy`, 각 페이지 하단의 "의료 정보 고지"가 필수
  - 콘텐츠 작성 원칙: 의사 감수, 참고문헌, 최종 검토일
- 한계:
  - 다국어 구조는 MSK/Mayo보다 덜 참고할 만하다.

### 4. 닥터나우 건강 매거진 - 사각턱 보톡스

- URL: https://doctornow.co.kr/content/magazine/1da78434a7864b87908cc3c7783c5fac
- 검증 내용:
  - 제목, 요약, 발행일, 의사명/병원명, 빠른 목차, FAQ, 관련 진료 병원 CTA가 있다.
  - 글 하단에 콘텐츠 목적, 자문, 외부 출처, 의사 프로필이 표시된다.
  - 한국 사용자가 실제로 검색하는 "효과, 가격, 부작용, 주기, 지속 기간" 묶음에 맞춰져 있다.
- 샘플 반영:
  - 한국형 병원 샘플은 닥터나우식 질문/FAQ/CTA 구조를 참고하되, 가격 강조는 의료광고 리스크 때문에 절제
  - "관련 진료 병원 찾기" 대신 "이 답변을 감수한 의료진/병원 페이지"로 연결
- 한계:
  - 플랫폼 콘텐츠라 병원 단독 사이트 레퍼런스는 아니다.
  - 일부 출처가 2차 출처 중심이라, 새 샘플은 학회/식약처/논문 등 1차 출처를 더 강화해야 한다.

### 5. 서울아산병원 - 질환백과

- URL: https://www.amc.seoul.kr/asan/healthinfo/disease/diseaseDetail.do?contentId=31954
- 검증 내용:
  - 건강정보 아래 의료정보, 인체정보, 증상백과, 질환백과, 검사/시술/수술정보, 의약품정보, 환자교육자료 등 분류가 있다.
  - 질환 페이지가 증상, 관련질환, 진료과, 정의, 원인, 증상, 진단, 치료 순서로 정리된다.
- 샘플 반영:
  - 국내 병원형 정보 구조는 질환/증상/검사/시술/수술/의약품/FAQ로 분류하는 것이 자연스럽다.
  - 지역 병원 샘플은 "질환백과"처럼 딱딱하게만 가면 전환력이 약하므로 닥터나우식 CTA를 결합해야 한다.
- 한계:
  - 다국어/FAQ/의사 byline/lastReviewed 노출은 AEO 전용으로 보기엔 부족하다.

## 공식 기술 근거

### Google FAQPage structured data

- URL: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- 확인 내용:
  - Google은 2026-05-07 기준 FAQ rich result deprecation을 공지했지만, 정부/건강 중심 권위 사이트의 Q&A 정보에는 FAQPage 구조화 데이터를 사용할 수 있다고 설명한다.
  - 구조화 데이터는 페이지 정보를 표준 형식으로 제공하고 콘텐츠를 분류하는 방식이라고 설명한다.
- 해석:
  - FAQ rich result 노출만 기대하면 안 된다.
  - 그래도 의료 Q&A 페이지의 `FAQPage`는 AI/검색 엔진이 Q&A 구조를 이해하도록 돕는 레이어로 유지할 가치가 있다.

### Schema.org MedicalWebPage / Health and medical types

- URL: https://schema.org/MedicalWebPage
- URL: https://schema.org/docs/meddocs.html
- 확인 내용:
  - MedicalWebPage 예시에는 `audience`, `specialty`, `lastReviewed`, `about`, `mainContentOfPage`가 포함된다.
  - Health and medical schema는 의료 콘텐츠의 구조를 검색엔진과 애플리케이션에 노출하기 위한 목적이라고 설명한다.
- 해석:
  - 병원 AEO 샘플은 `MedicalOrganization`, `MedicalBusiness`, `Physician`, `MedicalWebPage`, `Article`, `FAQPage`를 중앙 생성 함수로 관리해야 한다.

### Google 다국어/hreflang

- URL: https://developers.google.com/search/docs/specialty/international/localized-versions
- 확인 내용:
  - 다국어/다지역 페이지가 있으면 Google에 alternate version을 알려야 한다.
  - HTML, HTTP Header, Sitemap 3가지 방식이 가능하며, 각 언어 버전은 자신과 다른 언어 버전을 모두 참조해야 한다.
- 해석:
  - 병원 샘플의 다국어는 클라이언트 상태 토글만으로 끝내면 안 된다.
  - 실제 납품형은 `/ko`, `/en`, `/ja`, `/zh` URL과 hreflang/sitemap까지 구현해야 한다.

### Google helpful content / E-E-A-T

- URL: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- 확인 내용:
  - Google은 helpful, reliable, people-first content를 우선한다고 설명한다.
  - 의료처럼 건강/안전 등에 영향을 주는 YMYL 주제는 강한 E-E-A-T에 더 민감하다고 설명한다.
  - 누가 만들었는지, 어떻게 만들었는지, 왜 만들었는지를 명확히 하라고 권장한다.
- 해석:
  - 의료 콘텐츠는 AI 초안만으로 발행하면 안 된다.
  - 페이지마다 작성자/감수자/검토일/근거/의료 고지를 보여야 한다.

## 블링크애드 요식업 샘플에서 가져올 것

- 현재 요식업 샘플 위치: `sites/blinkad/app/restaurant-sample`
- 가져올 요소:
  - 한국어/영어/일본어/중국어 언어 선택 UI
  - 지도, 전화, 방문 정보, 접근성, FAQ를 한 페이지에서 처리하는 구조
  - Restaurant JSON-LD처럼 업종별 구조화 데이터를 별도로 주입하는 패턴
- 병원 버전에서 바꿀 요소:
  - `Restaurant` schema -> `MedicalOrganization`, `MedicalBusiness`, `Physician`, `MedicalWebPage`, `FAQPage`
  - 메뉴/예약 중심 -> 질문 답변/감수 의료진/검토일/출처 중심
  - 매장 방문 정보 -> 진료과, 시술 범위, 병원 공식 홈페이지 링크, Google Business Profile, Naver Place 링크

## 새 병원 샘플 권장 구조

### 1차 화면

- 히어로: "강남 피부과 시술 질문, 의사가 직접 답합니다"
- 언어: KO / EN / JA / ZH
- 빠른 답변 카드: 보톡스 지속기간, 인모드 간격, 기미 치료, 여드름 흉터, 슈링크 효과
- 의료진 감수 배지: 의사명, 직함, 진료과, 최종 검토일

### 필수 섹션

- Q&A 허브: 질문별 short answer 카드
- 시술 가이드: 시술별 원리, 적합 대상, 리스크, 회복, 주기
- 의료진: Physician schema와 sameAs
- 병원 정보: 공식 홈페이지/GBP/네이버 플레이스 연결
- 근거와 고지: 참고 출처, 의료광고/의료정보 고지
- 다국어 외국인 환자 정보: 방문 전 준비, 상담 언어, 예약 채널, 위치

### 필수 URL

- `/ko`, `/en`, `/ja`, `/zh`
- `/ko/qa/botox-duration`
- `/ko/procedures/botox`
- `/ko/doctors`
- `/ko/locations/gangnam`
- `/ko/legal`
- 각 언어별 hreflang 상호 참조

## 최종 판단

다음 샘플은 MSK의 다국어 환자교육 라이브러리, Mayo의 시술 설명 흐름, Cleveland Clinic의 검수/출처 정책, 닥터나우의 한국형 Q&A UX, 서울아산병원의 국내 의료정보 분류를 결합하는 방향이 가장 적합하다.

첫 샘플은 새 repo를 만들기보다 기존 `sites/blinkad/app/restaurant-sample` 옆에 `hospital-sample`로 만드는 것이 빠르다. 다만 실제 AEO 납품형은 현재 `sites/aeo-hospital-template`의 스키마/라우트 구조를 흡수하는 것이 좋다.
