# BlinkAd 하위 디렉토리 다국어 사이트 — 1단계

기준일: 2026-09-27 KST. 본사이트 `blinkad.kr`, 브랜치 `main`의 작업이며 ERP 프로젝트와 무관하다.

## 범위와 경계

- 한국어는 기존 루트 URL을 유지. 영어 `/en`, 일본어 `/ja`, 간체 중국어 `/zh`로 같은 공개 사이트를 제공한다.
- 각 외국어 17개: 메인, 서비스 6개, 사례, 문의, 인사이트 목록, 회사소식 목록 및 본문 4개, 병원·식당 데모. 총 51개 응답 검증.
- 중국어는 우선 간체이며 HTML/hreflang은 `zh-Hans`, OG는 `zh_CN`. 번체는 이번 범위에 포함하지 않았다.
- **인사이트 109개 글의 본문은 아직 한국어 원문이다.** `/en/blog`, `/ja/blog`, `/zh/blog`는 각 언어 UI와 원문 안내를 제공하고 기존 `/blog/<slug>`로 연결한다. 번역하지 않은 글을 외국어 본문처럼 복제하지 않으며, 해당 언어의 상세 경로는 404이고 hreflang·사이트맵에도 넣지 않는다.
- 한국어 원고·회사소식 원본·기존 URL·ERP·API·추적 ID·문의 수신 스키마는 변경하지 않았다. 실제 문의 발송은 하지 않았다.

## 구현

- `lib/site-languages.ts`: 지원 언어, 언어별 경로, 언어 표기 및 상호 hreflang.
- `components/LanguageSwitch.tsx`: KO/EN/JA/ZH 선택. 같은 페이지의 쿼리와 앵커 유지, 전체 문서 이동으로 HTML lang 변경. 바깥 클릭·Escape로 닫힘.
- 한국어 레이아웃을 재사용하는 기존 빌드 타임 생성기를 일본어·중국어로 확장했다. 각 언어 사전 797개 키 중 현재 활성 한국어 문구 796개를 28개 모듈에 적용한다. 미번역 키는 빌드 실패.
- `i18n/site.ts`와 `lib/create-localized-site.tsx`로 인사이트 목록·404·라우팅·메타데이터를 공유한다. 언어별 실제 라우트와 루트 레이아웃은 별도여서 응답 HTML부터 올바른 언어를 가진다.
- `localized/` 생성물은 Git에서 제외한다. `npm run build:languages` 또는 dev/build의 사전 실행 단계에서 재생성한다. 런타임 번역 API나 새 패키지 의존성은 없다.
- 일본어·중국어 문의 폼도 기존 영문 폼처럼 국제 전화번호를 허용하며 수신 API는 그대로다. 원문 한국어 검증은 유지한다.
- 언어별 self-canonical, ko/en/ja/zh-Hans/x-default, OG 언어, 사이트맵을 적용했다. 데모는 기존처럼 noindex.

## 검증

- `npm run test:languages`: 8개 통과. 경로/쿼리/앵커, 사전 완전성, 회사소식 HTML 태그 구조 보존, 한글 잔존, 문의 수신 구조, 이미지·실검색어 보존.
- `npx tsc --noEmit`, `npm run build`, `git diff --check`: 통과.
- `npm run verify:languages`: 외국어 51개, 한국어 대응 URL, canonical/hreflang/HTML lang/H1/JSON-LD, 문의 제품·주제 선택값, 109개 원문 사이트맵, 15개 미지원/내부/미번역 경로의 404 통과.
- `npm run verify:english`: 기존 영문 17개 회귀 검사 통과.
- 두 사전의 숫자를 원문과 비교: 의미상 변경 없음. 숫자의 한자 표기, 격주 1회 표현, 국제 전화번호 예시 변경만 허용.
- Chrome 실제 UI: 일본어 PC 홈, 중국어 홈으로 언어 전환, 중국어 390px 홈, 일본어 390px 서비스·모바일 메뉴, 일본어→중국어 문의 전환 시 service/topic 쿼리 보존, 중국어 320px 문의 폼 확인.
- 기존 블로그 일부 SEO 경고와 HEIC 라이브러리 빌드 경고는 기존 이슈이며 수정하지 않았다.
- 번역 문구는 소스와 대조했으나, 원래 마케팅 카피의 외부 통계 전체를 새로 사실검증한 작업은 아니다. 실 문의 CRM 저장·알림도 이번에는 테스트하지 않았다.

## 다음 단계

인사이트 본문 번역을 진행할 때는 한국어 slug를 보존하여 `/en/blog/<slug>`, `/ja/blog/<slug>`, `/zh/blog/<slug>`에 검수 완료된 글만 추가한다. 글 단위 완전 번역·원문 변경 추적·언어 상호 링크·정확한 수정일을 함께 구현하며, 한국어 원본을 덮어쓰지 않는다.

## 배포

코드 커밋 `2b2628e`를 main에 push하고 기존 BlinkAd 프로젝트에 운영 배포했다.

- 배포 ID: `dpl_d8zF8nGMxKevcSEQun1DNndYHDsJ` — Ready.
- 배포 URL: `https://blinkad-8uv3n51s3-aijeonginsight-1976s-projects.vercel.app`.
- 운영 도메인 `https://www.blinkad.kr`에서 `verify:languages`와 `verify:english` 전체 통과. 외국어 51개와 한국어 대응 URL, 109개 원문 보존, 404 경계, 메타정보, 사이트맵을 재검증했다.
- www 없는 `/en`, `/ja`, `/zh`도 올바른 www URL로 이동해 각각 en/ja/zh-Hans HTML과 HTTP 200을 반환한다.
- Chrome에서 운영 일본어 홈과 언어 메뉴를 거쳐 중국어 홈으로 실제 이동한 결과를 확인했다. 로컬 중국어 인사이트 목록은 320px에서 한국어 원문 안내와 글 링크까지 확인했다.
- 검수용 탭을 닫고 기존 사용자 탭으로 복귀. 개발자 도구와 기기 모드도 종료했다. 실제 문의 발송은 0건이다.
