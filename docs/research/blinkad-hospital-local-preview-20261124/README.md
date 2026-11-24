# 병원마케팅 핵심7페이지 — 로컬 초안

작성·검증: 2026-11-24. 형님이 앞서 제안한7페이지를 만들고 로컬로 띄우라고 요청해 구현했다.

## 로컬에서 보기

- 전체 목록: http://127.0.0.1:18896/hospital-marketing-preview
- 서버 작업트리: `/private/tmp/blinkad-hospital-content-preview-20261124`
- 시작 기준: `origin/main`의 `de0e4b6`.
- 브랜치: `erp/local-hospital-content-preview-20261124`.
- 서버: `./node_modules/.bin/next dev --hostname 127.0.0.1 --port 18896`.
- 현재 터미널 서버 세션: `92641`. 형님이 검토할 수 있도록 실행 유지.
- 브라우저: Ego Lite 공간109의 결과 탭을 목록 화면으로 열고 `finish({keep:['p1']})`로 사용자에게 남겼다. 다음 턴에서 재개할 때 공간109를 claim한 뒤 남긴 탭을 adopt한다. 이전 조사 공간93은 조작하지 않았다.

이 브랜치는 저장소의 기존 `vercel.json`에 있는 `erp/*: false` 자동배포 제외 규칙을 사용한다. 이 목적의 브랜치 접두어이며 ERP 업무를 수정하지 않았다. Vercel 설정·권한은 바꾸지 않았고 공식 도메인 배포·Sites등록·외부공유 터널·발행은 수행하지 않았다. [Vercel 공식 Git배포 설정](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled)

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
