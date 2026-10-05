# 의료관광협회 강남구 병원 교육 회사소식 발행 기록

기준일: 2026-10-05 KST. 대상: BlinkAd 본사이트 `main` / Vercel `blinkad` / `https://www.blinkad.kr`.

현재 상태: 게시 완료. 승인 본문·첨부 사진·3개 번역을 공식사이트에 반영했고, 운영 페이지와 PC·모바일 화면을 확인했다.

## 게시 승인과 기사

- 사용자가 사진을 직접 첨부하고 회사소식 게시를 명시적으로 요청했다. 게시 승인 범위로 기록하며, 별도 사진 소유권 확약을 받았다는 의미는 아니다.
- 승인 원문: `/tmp/blinkad-medical-news-approved.json`. 승인된 `id`, `title`, `excerpt`, `date`, `category`, `imageUrls`, `imageAlt`, `content` 8개 필드와 `constants/news.ts`를 직접 대조하여 정확한 일치를 확인했다.
- 제목: **블링크애드, 의료관광협회에서 강남구 병원 대상 AI 검색·브랜드 전략 교육 진행**.
- 슬러그: `gangnam-hospital-ai-search-brand-marketing-education`.
- 공개 주소: [한국어 회사소식](https://www.blinkad.kr/news/gangnam-hospital-ai-search-brand-marketing-education). 같은 슬러그의 `/en/news/`, `/ja/news/`, `/zh/news/` 번역도 함께 반영한다.
- `post.date=2026.10.05`는 게시일이다. 실제 행사일은 확정하지 않았으며 본문에 2026-10-05를 행사일로 쓰지 않았다.
- 권순현 대표가 직접 진행한 교육, 강남구 안과·성형외과·피부과·종합병원 관계자, 신환·구환의 병원 발견·재방문·브랜드 인식, 구글 지도·홈페이지 기본 세팅을 승인 문안대로 반영했다.
- 병원 미팅에서 기초 세팅이 부족한 채 방치된 곳을 관찰했다는 문단을 보존했다. 마지막 문단은 구글 지도 관리·웹사이트 정비·AI 검색을 고려한 콘텐츠 기획과 운영 서비스 제공 및 병원별 마케팅 운영 내용이다.

## 사진과 기존 콘텐츠 보존

- 파일: `public/news/gangnam-hospital-ai-search-brand-marketing-20261005.jpeg`.
- 원본 크기: **1920 × 1080px**, 16:9. SHA256: `b5e2a0fae72ef3ba2fcbce5a297d4881de559866b9dcd23a8939efc9814676c6`.
- 신규 기사에만 `imageLayout: 'wide'`를 적용했다. 본문 사진을 한 열의 16:9로 표시하여 원본 전체를 보여준다.
- 기존 회사소식 4개의 객체·본문은 작업 시작 HEAD `f9bfb7c`와 완전히 동일하다. 신규 1개를 추가하여 회사소식은 총 5개다.
- EN·JA·ZH 사전은 각각 **797 → 801키**다. 기존 797개 키와 값은 전부 보존하고 신규 제목·요약·사진 설명·본문 4개만 추가했다.
- 세 언어의 핵심 사실을 원문과 대조했다. HTML 태그 및 링크 구조도 승인 본문과 동일하며 Google Business Profile 링크의 `hl=ko`를 유지한다.

## 로컬 검증

아래 검증은 다국어 메타데이터 수정 이후 재실행하여 통과했다. 브라우저 화면 확인은 본문 레이아웃 변경 후 수행했으며, 메타데이터 수정은 시각 배치를 바꾸지 않는다.

| 확인 | 결과 |
| --- | --- |
| 승인 8필드·기존 4글·사진 해시 대조 | 통과 |
| `npm run test:languages` | 13/13 통과 |
| `npx tsc --noEmit` | 통과 |
| `npm run build` | 통과 |
| 로컬 다국어 통합 검증 | 54페이지·공용 뉴스 이미지 및 NewsArticle/OG/Twitter 회귀 통과 |
| 실제 브라우저 1440px·320px | 통과: 원본 사진 전체 표시·이미지 로드·가로 넘침 없음·본문 일치 |
| 회사소식 목록 | 신규 글 첫 항목 노출 확인 |

로컬 화면 증거: `/tmp/blinkad-medical-news-qa/news-1440px.png`, `news-320px.png`, `news-listing-1440px.png`, `visual-qa.json`. 빌드 기록: `/tmp/blinkad-medical-news-build.log`.

## 추가로 발견한 다국어 메타데이터 오류

- 번역 빌드가 단독 문자열 `/`까지 언어 경로로 바꾸면서, URL 구분자 및 문자열 유틸리티에도 언어 접두사가 들어갔다. 이 영향으로 번역 회사소식의 OG 사진 JPEG 주소와 `NewsArticle` URL이 잘못 생성되는 문제를 발견했다.
- `scripts/build-english.mjs`에서 단독 `/`는 홈 이동용 `href`일 때만 언어 루트로 변환하도록 수정했다.
- 다국어 래퍼가 Twitter 사진을 공통 OG 사진으로 덮어쓰는 문제도 발견했다. `lib/create-localized-site.tsx`에서 원래 페이지의 `metadata.twitter.images`를 먼저 사용하도록 수정했다.
- 수정 후 빌드·13개 회귀검사·타입검사·54페이지 통합 검증 통과. 신규 글 4언어의 상세·목록 첫 노출·NewsArticle URL·OG/Twitter 원본 사진 주소와 HTTP 원본 사진 SHA256도 별도로 확인했다.

## 운영 반영 — 완료

- 소스 커밋: `1bfabb11f2fc1326f60e3de6c0d923d57c2ddbb9`, `origin/main` push 완료.
- Vercel `blinkad` 운영 배포: `dpl_Dz8wBvXaS1qx5wgRNv3QgbyDKFSa` **READY**, 소스 SHA 일치. `www.blinkad.kr`·`blinkad.kr` 연결 확인.
- 2026-10-05 16:23 KST 공개 사이트 검수: 신규 한국어·EN·JA·ZH 상세/목록 HTTP 200, 목록 첫 항목, 게시일, NewsArticle URL, OG/Twitter 원본 사진 URL 정상.
- 공개 사진 HTTP SHA256이 첨부 원본과 일치한다. 한국어 승인 본문 15개 블록(12문단·H2 3개) 및 제목·서비스 결말 정확 일치.
- 운영 다국어 통합검사: **54페이지·공용 뉴스 이미지 5개**, canonical·hreflang·HTML·JSON-LD·404·sitemap 통과. 기존 한국어 블로그 109개 보존.
- 공개 브라우저 1440px·320px: 사진 정상 로드·16:9 표시·가로 넘침 없음, 목록 첫 항목 클릭 후 신규 글 이동 통과. 브라우저 오류 없음.
- 공개 캡처: `/tmp/blinkad-medical-news-qa/live-news-1440px.png`, `live-news-320px.png`, `live-news-listing-1440px.png`, `visual-qa-live.json`.
- 작업 기록: [GitHub Issue #331](https://github.com/blinkad-operations/blinkad-work-dashboard/issues/331). 초기 helper의 기본 Project 조회 개수 제한으로 신규 항목을 찾지 못했지만, 1000개 조회로 실제 item을 확인하여 기존 기록을 복구했다. 공유 helper 파일은 수정하지 않았다.
