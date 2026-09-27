# BlinkAd English site

기준일: 2026-09-27 KST. 공식 본사이트 `https://www.blinkad.kr/en` 영문 버전 구현 기록.

## 범위

- 기존 디자인, 이미지, 섹션 순서, 문의 흐름을 유지한 영문 페이지 17개: 메인, 서비스 6개, 사례, 문의, 인사이트 목록, 회사소식 목록·본문 4개, 병원·식당 데모.
- 헤더에 EN / KO 버튼. 서비스·회사소식은 영문 경로를 유지하며, 언어 전환은 같은 페이지의 쿼리·앵커를 보존한다.
- 기존 블로그 109개 본문은 원문 그대로 보존했다. `/en/blog`에 한국어 아카이브 안내와 `Read article in Korean`을 표시하고 원문으로 연결한다. 이번 범위에서 블로그 전체 본문 번역은 하지 않았다.
- 병원·식당 데모는 이미 보유한 영어 문구를 서버 첫 렌더부터 사용한다. 데모는 기존처럼 noindex다. 병원 데모의 칼럼 상세는 기존 다국어 데모 경로를 사용한다.
- ERP·고객 입력 페이지는 영문화하지 않았다. 이들의 기존 URL·본문·API는 유지한다.

## 구현과 유지보수

- 한국어 공개 라우트는 `app/(korean)`으로 이동했다. 괄호 라우트 그룹이므로 공개 URL은 바뀌지 않는다. ERP·고객 입력 소스는 원래 디렉터리에 두었다.
- 한국어/영어 루트 레이아웃은 `components/SiteDocument.tsx`를 공유한다. 응답 HTML 자체에 `lang=ko` 또는 `lang=en`이 있으며, 브라우저에서 뒤늦게 문구나 언어를 치환하지 않는다.
- `i18n/en.json`에 검수한 영문 문구를 저장한다. `scripts/build-english.mjs`가 지정된 공개 모듈 28개의 레이아웃·동작을 재사용하여 `localized/en`을 생성한다. 생성물은 Git에 중복 저장하지 않는다.
- `npm run dev`, `npm run build` 전에 자동으로 영문 모듈을 생성한다. 독립 타입 검사는 먼저 `npm run build:english`를 실행한다. 한국어 문구를 바꾸면 영문 사전도 함께 갱신해야 한다. 미번역 문구는 빌드 오류로 표시한다.
- `--inventory` 옵션으로 번역 대상 목록을 조회할 수 있다. 블로그 본문은 생성 대상에서 제외되어 Notion 블로그 동기화에 새 영문 번역이 필요하지 않다. 회사소식/서비스 문구 변경에는 번역 추가가 필요하다.
- 서버 렌더링·정적 생성 유지. 번역 API, 추가 런타임 의존성, 브라우저 DOM 번역 없음. 한국어 디자인 수정도 재빌드 시 영어에 반영된다.
- 이미지 경로, 외부 링크, API, 문의 수신 주소·필드, 추적 ID는 보존했다. 실제 검색 키워드 `한식당`은 번역하지 않았다.
- 영문 문의 폼만 국제 전화번호 형식을 허용한다. 한국어 전화번호 검증은 유지한다. 문의 모달은 작은 화면에서 내부 스크롤이 가능하게 보완했다.
- 각 언어 canonical, 상호 hreflang, x-default, OG 언어, 사이트맵을 적용했다. 영문 미등록 경로와 `/en/erp`, `/en/api/*`는 404다.

## 검증

- `npm run test:english`: 경로 변환, 보존 범위, 언어 대체주소, 국제 전화번호, 기존 문의 수신 구조, 원문 검색어·자산 보존 6개 테스트 통과.
- `npm run verify:english`: 영문 17개와 한국어 대응 페이지의 HTTP 상태·lang·canonical·hreflang·H1·JSON-LD 파싱, Nest 문의 쿼리, 한국어 원문, 404 경계, 사이트맵 검증.
- `npx tsc --noEmit`, `npm run build`, `git diff --check` 확인. 기존 109개 글의 썸네일/요약 길이 및 `libheif-js` 경고는 이번 변경과 별개다.
- Chrome 실제 UI: PC 메인, 390px 메인·서비스·메뉴 확장, 서비스 경로 유지, KO→EN 왕복, 영문 문의 모달 및 빈 입력 오류, 320px 문의창 표시 확인.
- 외부 문의 발송 0건. 실수신 CRM 저장·알림은 별도 E2E 검증하지 않았으며 기존 연동을 유지했다.

## 배포

코드 커밋 `f056d48`을 main에 push하고 기존 BlinkAd Vercel 프로젝트에 운영 배포했다.

- 배포: `dpl_5gTn5dzQrFXSYiCLaEYa5mYvqocZ`
- 배포 URL: `https://blinkad-7cvasqjko-aijeonginsight-1976s-projects.vercel.app`
- 운영 URL: `https://www.blinkad.kr/en`
- 운영 도메인에서 `npm run verify:english -- https://www.blinkad.kr` 전체 통과: 영문 17개, 한국어 대응 페이지, 메타정보·언어 대체주소·구조화 데이터, Nest 문의 선택값, 기존 원문, 404 및 사이트맵.
- `https://blinkad.kr/en`도 www 주소로 정상 이동하여 HTTP 200과 영문 HTML을 반환한다.
- Chrome에서 운영 영문 메인의 기존 전구 배경·영문 제목·EN/KO 전환 메뉴를 직접 확인했다. 문의 실발송은 하지 않았다.
