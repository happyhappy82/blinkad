# 병원 홈페이지 인사이트 10편 등록 — 2026-10-23

## 요청과 구성

- 사용자 요청: Aside에 작성된 공식 블로그 초안 10편을 BlinkAd 웹사이트 인사이트에 게시. 백그라운드로 진행.
- 원본: `공식블로그_병원홈페이지_10편_전체초안.md`, SHA-256 `62cd4f407eedfc0a2709fac2e6df03ddcbbb5463c77d9464b5ba2e18998bbf1f`.
- 원문 제목·본문·출처 링크를 보존하고 개별 Markdown 원고로 분리했다. 합본의 내부 검토용 안내와 글 사이 구분선은 공개 본문에서 제외했다.
- 기존 109편의 모든 필드와 상대 순서를 보존하고 10편을 원고 순서대로 목록 앞에 추가했다. 총 119편이다.
- 게시일은 2026.10.23, 카테고리는 HOSPITAL WEBSITE. 글별 요약·대표 이미지·공유 정보를 설정했다.
- 수동 발행 글 ID를 Notion 동기화 보존 목록에 추가했다. Notion이나 Aside의 원본 상태는 변경하지 않았다.

## 개별 URL

1. [병원 홈페이지 제작, AI 검색까지 고려하면 무엇이 달라질까?](https://www.blinkad.kr/blog/hospital-website-ai-search)
2. [병원 홈페이지 진단은 무엇을 보고, 어떤 개선안을 내야 할까?](https://www.blinkad.kr/blog/hospital-website-audit)
3. [병원 홈페이지 개선과 재제작, 작업 범위는 어떻게 달라질까?](https://www.blinkad.kr/blog/hospital-website-improvement-vs-rebuild)
4. [병원 홈페이지 제작사에 확인할 검색·운영·인수 조건](https://www.blinkad.kr/blog/hospital-website-agency-checklist)
5. [병원 홈페이지 SEO 검수, 실제 페이지에서 확인하는 항목](https://www.blinkad.kr/blog/hospital-website-seo-review)
6. [병원 홈페이지 제작비가 달라지는 작업 범위와 추가 비용](https://www.blinkad.kr/blog/hospital-website-cost-scope)
7. [병원 소개·의료진·진료 안내를 검색 가능한 페이지로 구성하는 법](https://www.blinkad.kr/blog/hospital-website-content-structure)
8. [병원 홈페이지 문의·예약 경로, 제작 단계에서 점검할 부분](https://www.blinkad.kr/blog/hospital-website-inquiry-booking)
9. [병원 홈페이지 리뉴얼, 기존 주소와 검색 유입을 지키는 이전 작업](https://www.blinkad.kr/blog/hospital-website-renewal-url-migration)
10. [병원 홈페이지 오픈 검수와 이후 관리, 어디까지 맡겨야 할까?](https://www.blinkad.kr/blog/hospital-website-launch-maintenance)

## 배포 전 검증

- 원본 Markdown과 HTML 표시 텍스트 10/10 일치, 출처 링크 10/10 일치, 기존 109편 객체 동일.
- 고유 링크 13개 모두 HTTP 200. 링크 연결 확인이며 전체 주장에 대한 신규 독립 사실검증을 의미하지 않는다.
- `npm run build` 성공(Next.js 컴파일·타입 검사·정적 생성). 신규 10편 검증 오류 없음. 일부 짧은 제목·요약 권고 경고는 원문 제목 유지 및 편집 판단에 따라 허용했다.
- 전체 검증기는 기존 글의 대표 이미지 누락 등 기존 오류도 출력한다. 기존 글 수정은 이번 범위에 포함하지 않았다. 기존 libheif 동적 의존성 및 오래된 Browserslist 데이터 경고도 남아 있다.
- 로컬 프로덕션 서버: 10개 상세 페이지 HTTP 200, 본문 전체·H1·canonical·description·Article 구조화 데이터·날짜·이미지 원본 SHA 검증.
- 목록 119편·첫 10편 순서·사이트맵 신규 10개 URL 포함 확인.
- 대표 이미지 첫 장을 시각적으로 확인했다. 숨김 브라우저 연결이 없어 브라우저 렌더링 캡처 대신 생성 HTML·기존 템플릿·이미지 파일로 확인했다.
- 운영 배포 결과와 재검증은 [작업 기록 #596](https://github.com/blinkad-operations/blinkad-work-dashboard/issues/596)에 남긴다.
