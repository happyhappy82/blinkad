# 병원마케팅 핵심7페이지 — 로컬 초안

작성·검증: 2026-11-24. 형님이 앞서 제안한7페이지를 만들고 로컬로 띄우라고 요청해 구현했다.

## 현재 검토본 · 서비스 메뉴 진입

[병원마케팅 대행 초안](https://particle-enrolled-andale-parameters.trycloudflare.com/hospital-marketing-preview/hospital-marketing/)은 데스크톱의 서비스 드롭다운과 모바일의 메뉴 → 서비스 → 병원마케팅에서 열린다. 목록과 본문에 같은 메뉴가 있다. 대표 서비스 상단에 6개 분야별 가이드를 연결했고 각 가이드의 상단에서 대표 서비스로 돌아갈 수 있다. 기존 전체 목록 URL은 7개 초안 검토용이다. 운영 사이트 메뉴 변경은 별도다.

2026-11-24 기존 HTTPS에서 8개 경로 200, PC 1280px·모바일 390px 메뉴 진입, 6개 링크 표시, 제작비 가이드 왕복을 확인했다. 언어 테스트 16개와 TypeScript 검사를 통과했다.

## 이전 검토본 · 공식 사이트 디자인 반영

[모바일 검토](https://particle-enrolled-andale-parameters.trycloudflare.com/hospital-marketing-preview/)에서 목록과 본문 7개를 확인할 수 있다. 기존 로컬 주소와 외부 주소를 모두 유지했다. 아래 최초 검토 기록에 있는 읽기 흐름 도식과 우측 고정 목차는 이전 디자인이다.

- 공식 한국어 서비스 화면과 대행사 선택 칼럼을 브라우저에서 비교했다. 목록은 공식 서비스의 소개·체크리스트 교차 배치를, 상세 글은 공식 칼럼의 제목·작성자·본문 폭·표·관련 글 배치를 따른다. 대표 서비스 상세에는 서비스용 제목 규격을 사용했다.
- 공식 Navbar와 Footer를 공유하고 검토 화면의 링크는 실제 공식 주소에 연결했다. 상단의 전체 목록과 상세의 뒤로가기는 검토본 안에서 이동한다. 병원 원고 데이터와 공식 게시물은 그대로다.
- 목록과 상세 7개 외부 HTTPS 200, 각 H1 1개·noindex, 검토 본문과 로컬 정적 파일 일치 확인. 외부 링크의 푸터 메일은 Cloudflare가 인코딩하고 브라우저에서 원래 주소로 표시한다.
- Ego Lite 데스크톱 1280px, 모바일 390px, 좁은 화면 320px에서 확인했다. 모바일 메뉴·서비스 하위 메뉴, 목차 위치 이동 후 뒤로가기, 작업 기록 사진, 3열 표 내부 스크롤, 고정 메뉴 44px를 확인했다. TypeScript 및 언어 테스트 16개 통과. 실기기 5G는 미측정이다.

## 로컬에서 보기

- 전체 목록: http://127.0.0.1:18896/hospital-marketing-preview
- 서버 작업트리: `/private/tmp/blinkad-hospital-content-preview-20261124`
- 시작 기준: `origin/main`의 `de0e4b6`.
- 브랜치: `erp/local-hospital-content-preview-20261124`.
- 서버: `./node_modules/.bin/next dev --hostname 127.0.0.1 --port 18896`.
- 현재 터미널 서버 세션: `92641`. 형님이 검토할 수 있도록 실행 유지.
- 브라우저: Ego Lite 공간109의 결과 탭을 목록 화면으로 열고 `finish({keep:['p1']})`로 사용자에게 남겼다. 다음 턴에서 재개할 때 공간109를 claim한 뒤 남긴 탭을 adopt한다. 이전 조사 공간93은 조작하지 않았다.

이 브랜치는 저장소의 기존 `vercel.json`에 있는 `erp/*: false` 자동배포 제외 규칙을 사용한다. 이 목적의 브랜치 접두어이며 ERP 업무를 수정하지 않았다. Vercel 설정·권한, 공식 도메인 배포·Sites등록·발행은 수행하지 않았다. 초기 로컬 구현 이후 형님의 모바일 요청으로 아래 별도 검토자료 HTTPS 공유를 추가했다. [Vercel 공식 Git배포 설정](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled)

## 7개 본문과 역할

| 로컬 경로: `/hospital-marketing-preview/…` | 초안 | 운영 반영 시 관계 |
|---|---|---|
| `hospital-marketing` | 병원마케팅 대행 | 신규 대표 서비스 안내 제안 |
| `agency-selection` | 대행사 선택 기준 | 기존 대행사 선택 글의 보강안 |
| `hospital-geo` | 병원GEO·AEO·AI 검색 | 기존 병원AI 글의 보강안. 운영 대표글 선택은 별도 |
| `hospital-website` | 병원 홈페이지 제작 | 기존 홈페이지 시리즈의 대표 안내 보강안 |
| `website-cost` | 제작 비용·견적 | 기존 제작비 글의 보강안 |
| `foreign-patients` | 병원 해외·외국인 마케팅 | 기존 병원외국인 업무범위 글의 보강안 |
| `hospital-work` | 공개 병원 교육·컨설팅과 작업 확인 | 신규 병원 사례 역할의 초안. 환자/매출 성공수치가 없어 활동 기록과 실제 작업 확인 기준으로 구성 |

기존 공개5글·고객 검수완료 원고·콘텐츠상수·다국어 원고를 덮어쓰지 않았다. 이7개는 비교 검토를 위한 별도 경로이며 같은 내용의7개 운영URL을 추가 발행한 것이 아니다. 운영 반영 단계에서는 기존 공개URL과 질문 역할을 보존해 보강/통합/신규를 구분한다.

## 구현과 확인

- 기존 로고·Pretendard·어두운 배경/파란색 강조를 활용한 독립 미리보기 레이아웃.
- 별도 route group `(hospital-preview)`로 구성해 운영SiteDocument·GTM·Tracker·접수API를 불러오지 않는다. 모든 미리보기는 `noindex, nofollow`.
- 상단 고정 뒤로가기·실제 전체목록 링크, 본문 목차, 관련 페이지와 다음 안내. 직접 상세 진입 시 뒤로가기의 목록 fallback.
- 390px 모바일: 문서 가로 넘침 없음, 비교표 내부 가로스크롤, 상단 이동버튼44px, 실제 교육사진 로드 확인.
- 공개 교육·컨설팅 이미지2개는 기존 `public/news/` 자산 재사용. 수치·고객 후기·실제 병원 성장 효과를 창작하지 않았다.
- 공식상담CTA는 기존 `https://www.blinkad.kr/contact`를 새 탭으로 연다. 로컬 접수 폼이나 실제 신청 제출은 없다.

검증 결과:

1. 기존 언어 생성기 `npm run build:languages` 실행 후 `tsc --noEmit` 통과. 최초에는 새 작업트리의 무시된 `localized/` 생성물이 없어 실패했고 생성 후 해소했다. 생성 파일은 Git제외, 번역 원본 변경0.
2. 목록+본문7개, 총8URL200·H1각1·noindex·GTM/폼 없음, 참조사진200: `http-validation.json`.
3. 실제 브라우저: 대표 안내 이동·목록 복귀, PC1440/모바일390의 대표 화면·가로스크롤·사진 확인: `browser-validation.json`.
4. `git diff --check` 통과. 전체 사이트 production build·전체기기/CWV검사는 이번 로컬 초안 범위에서 실행하지 않았다.

원고 근거는 각 페이지 맨 아래에 실제 공개URL을 연결했다. 이전 조사 정본은 `docs/research/blinkad-hospital-own-site-seo-strategy-2026-11-24.md`와 `blinkad-hospital-content-competition-2026-11-24.md`다. 이 구현 작업트리는 최신main에서 분리되어 이전 조사브랜치의 문서가 없을 수 있으므로 해당 브랜치도 함께 보존한다.

## 실제 다음 일

형님이 로컬 초안의 내용·정보 배치·디자인을 검토한다. 반영할 수정이 정해지면 같은 URL/서버/브라우저 공간109를 재사용한다. 공식사이트 적용·실제 검색노출 측정·사례 원자료 추가·운영 발행은 이번 완료와 구분한다.


## 모바일 외부 공유 — 2026-11-24 후속 요청

- **휴대폰 검토 주소: https://particle-enrolled-andale-parameters.trycloudflare.com/hospital-marketing-preview/**
- 같은Wi-Fi 없이 접속하는 외부HTTPS 주소다. 일반 DNS/TLS로 목록+7본문8경로200·noindex 헤더를 확인했다. 실제 휴대폰5G 측정은 하지 않았고, 실제 브라우저390px에서 표시와 이동을 확인했다.
- 공유 루트는 `.hospital-preview-share/public/`이며, 8개HTML과 필요한 로고/교육사진/스타일/짧은뒤로가기JS만 있다. Next.js 런타임·HMR·운영API·저장소/계정자료는 포함하지 않는다. /api/inquiry·/erp·/.env·/.git/config·디렉터리목록은404 확인.
- 기존 개발서버18896은 그대로 두고, 정적공유서버18897(세션35163)과 Cloudflare터널(세션28211)을 실행 유지한다. 계정/권한/호스팅 설정 변경·새패키지설치0. 기존 `/tmp/blinkad-f02-tunnel-bin/cloudflared`를 재사용했다.
- 터널로그: `/tmp/blinkad-hospital-mobile-tunnel-20261124.log`. 상태: `.hospital-preview-share/state.json`. 로그/생성자료는Git제외. 임시주소이므로 맥·공유서버·터널이 실행 중이어야 한다. 재개 시 기존프로세스/주소부터 확인해 새 터널을 불필요하게 만들지 않는다.
- 수정 후에는 같은 개발서버를 확인하고 `python3 scripts/export-hospital-preview.py`로 정적자료를 갱신한다. 같은 정적서버·터널은 유지하며 URL을 바꾸지 않는다. 외부공유는 기존 localhost18896변경을 자동반영하지 않으므로 export가 필요하다.
- 모바일390에서 목록→대표안내→뒤로가기, 상세직접진입→전체목록, 상단44px·문서가로넘침없음을 확인했다. JavaScript없이도 뒤로가기링크의 목록fallback이 작동하는 정적anchor를 사용한다.
- 공개검토 연결이며 공식 사이트 배포·검색색인·광고/접수 제출은 수행하지 않았다. 검증: `mobile-share-validation.json`.
