# BlinkAd ERP Resume

Updated: 2026-06-16 11:28 KST

## 작업공간

- 통합 작업공간: `/Users/mcbookpro/Documents/Claude Code/sites/blinkad-erp-integration`
- 통합 브랜치: `erp/integration`
- 운영 URL: `https://www.blinkad.kr/erp`
- 통합 Preview URL(고정 alias): `https://blinkad-git-erp-integration-aijeonginsight-1976s-projects.vercel.app/erp`
- 개별 배포 URL은 push마다 바뀌므로, 통합 검수는 위 고정 alias를 기준으로 확인한다.
- 최근 커밋 기준:
  - `8dd78bd docs: refresh ERP main agent resume`
  - `ff2b7fd Add ERP resume instructions`
  - `3a3fdad Normalize unlimited billing store name`
  - `29df44a Add ERP calendar context menus and billing view`

## 메인에이전트 세팅

이 작업공간의 에이전트는 BlinkAd ERP의 메인에이전트이자 통합 담당입니다.

- 기준 디렉토리: `/Users/mcbookpro/Documents/Claude Code/sites/blinkad-erp-integration`
- 기준 브랜치: `erp/integration`
- 역할: 서브 에이전트의 완료 보고를 받아 순서대로 통합, 충돌 해결, 검증, Preview 확인, 최종 main 병합 준비
- 직접 작업 전 확인: `AGENTS.md`, `docs/ERP_RESUME.md`, `git status --short`, `git branch --show-current`
- 서브 에이전트 완료 보고에서 반드시 확인할 것: 브랜치, 최신 커밋, 변경 파일, 검증 결과, 충돌 가능 파일, Preview 또는 로컬 확인 URL
- 통합 순서 기본값: `erp/calendar` -> `erp/crm` -> `erp/automation` -> `erp/ops`
- 금지: 서브 브랜치를 `main`에 직접 병합, 사용자/다른 에이전트 변경 되돌리기, `context/` 폴더 무단 수정, `~/.claude/` 수정, Notion 작업큐 상태 변경

## 재개 명령

```bash
cd "/Users/mcbookpro/Documents/Claude Code/sites/blinkad-erp-integration"
git status --short
git branch --show-current
git pull --ff-only origin erp/integration
sed -n '1,220p' docs/ERP_RESUME.md
```

## 현재 ERP 방향

BlinkAd ERP는 영업, 미팅, 견적, 계약, 매장 운영, 리포트, 청구 관리를 한 화면에서 처리하는 내부 운영 도구입니다.

핵심 메뉴 방향:

- 대시보드: 문의/견적/계약/운영/완료 상태를 요약합니다.
- 문의관리/팔로업관리/고객관리/계약대기: Notion 문의관리 DB의 상태값을 기준으로 분류합니다.
- 진단자료/견적서/계약서: 매장별 PDF 생성 및 파일 업로드 흐름을 연결합니다.
- 매장 운영관리: 매장별로 Google 프로필, Google Ads, 웹사이트/블로그 작업을 나눠 봅니다.
- 일정관리: Google Calendar, 특히 팀 공유 캘린더인 용올 캘린더 중심으로 봅니다.
- 미팅관리: Google Calendar의 미팅 일정과 Notion 문의관리 DB의 매장 정보를 연결해서 봅니다.
- 주간미팅: 오늘 이후 7일 이내 예정된 미팅을 봅니다.
- 콘텐츠 자산: 웰컴문구, 요일별 보고 멘트 등 복사용 운영 문구를 관리합니다.
- 청구관리: 계약 매장의 월별 정산일, 청구 상태, 입금 상태를 관리합니다.

## 최근 완료

- Google Ads Telegram 알림 스크립트를 추가했습니다.
  - 스크립트: `scripts/google-ads-telegram-alert.mjs`
  - 문서: `docs/google-ads-telegram-alerts.md`
  - npm 명령: `ads:telegram:discover-chat`, `ads:telegram:dry-run`, `ads:telegram:test`, `ads:telegram:daily`, `ads:telegram:alert`
  - 규칙: 캠페인 CPC가 직전 7일 대비 30% 이상 변하면 알림 섹션에 표시하고, 매일 15:00 KST에 전 캠페인 최근 7일/지난주 대비 현황을 보고합니다.
- Google Business Profile 리뷰 변동 Telegram 알림 스크립트를 추가했습니다.
  - 스크립트: `scripts/google-business-profile-review-alert.mjs`
  - 문서: `docs/google-business-profile-review-alerts.md`
  - npm 명령: `gbp:reviews:dry-run`, `gbp:reviews:test`, `gbp:reviews:weekly`
  - 규칙: 매주 금요일 18:00 KST에 ERP 7개 매장의 리뷰 수, 전일/7일 변동, 최근 리뷰일을 표 형태로 보고합니다.
  - 현재 원천은 DataForSEO Google Maps + Google Reviews입니다. BigQuery/Notion은 향후 히스토리 비교용 fallback으로 유지합니다.
  - GitHub Actions는 매일 18:00 KST에 스냅샷을 저장하고 금요일만 텔레그램으로 발송합니다. `.cache/gbp-review-snapshots.json` 히스토리를 전일/7일 비교에 사용합니다.
  - 도르도뉴는 Google Maps CID `5895233767778032679`로 고정 매칭합니다.
- ERP 접근 보호를 추가했습니다.
  - `/erp`, `/erp/**`, `/api/erp`, `/api/erp/**`는 Basic Auth 없이는 401을 반환합니다.
  - 운영 비밀번호는 코드에 평문 저장하지 않고, 임시 fallback은 해시로만 보관합니다.
  - 배포 환경에서 회전할 때는 `ERP_AUTH_USER`, `ERP_AUTH_PASSWORD` 환경변수를 사용합니다.
- 일정관리 캘린더 영역을 크게 보고, 우측 일정 목록 의존도를 줄였습니다.
- 일정관리 우클릭 메뉴를 추가했습니다.
  - 일정 카드 우클릭: 일정 수정, 삭제, Google Calendar에서 열기, 일정 복사
  - 빈 날짜/시간 우클릭: 일정 추가, 미팅 일정 추가
  - 캘린더 이름 우클릭: 이 캘린더만 보기, 숨기기, Google Calendar에서 열기, 새로고침, 전체 보기
- 청구관리 전용 화면을 추가했습니다.
  - 요약 카드
  - 월별 정산 캘린더
  - 정산 리스트
  - 상태 변경 셀렉터
- 청구관리에서 `건대 언리미티드 입니다.`처럼 들어오는 이름은 ERP 표시상 `언리미티드`로 정리했습니다.
- 매장 운영관리 화면을 전체 현황과 매장별 상세 현황으로 분리했습니다.
  - 현재 운영 매장은 `언리미티드`, `웰믹스 광화문점` 2개로 표시합니다.
  - `매장 운영관리` 메뉴를 누르면 전체 매장 월-금 보고 현황 보드만 표시합니다.
  - 매장 리스트에서 매장명을 누르면 전체 보드는 숨기고 해당 매장 상세 보고 패널만 표시합니다.

## 주요 구현 메모

- 주요 UI 파일: `app/erp/ErpClient.tsx`
- 주요 메뉴 설정: `app/erp/_lib/erp-config.tsx`
- CRM/명함 관련 컴포넌트:
  - `app/erp/_components/crm/BusinessCardPanel.tsx`
  - `app/erp/_components/shared/StoreTable.tsx`
- 주요 API:
  - `app/api/erp/clients/**`
  - `app/api/erp/meetings/route.ts`
  - `app/api/erp/reports/route.ts`
  - `app/api/erp/google/calendar/**`
  - `app/api/erp/google/ads/route.ts`

## 연동 원칙

- Notion DB가 원본인 데이터는 ERP에서 상태를 바꾸면 Notion에도 반영되어야 합니다.
- Google Calendar 일정은 용올 캘린더를 중심으로 표시합니다.
- 개인 캘린더 전체가 팀 화면에 노출되지 않도록 팀 공유 캘린더 중심 설계를 유지합니다.
- 보고 DB는 Notion에서 전체를 보고, ERP에서는 매장별 이번 주 보고 상태를 빠르게 처리하는 용도입니다.

## 병렬 개발 운영

주요 작업 브랜치:

- `erp/automation`: 진단자료, 견적서, 계약서 자동화
- `erp/crm`: 문의관리, 팔로업관리, 고객관리, 명함관리
- `erp/calendar`: 일정관리, 미팅관리, Google Calendar
- `erp/ops`: 매장 운영관리, GBP 보고, Google Ads 성과
- `erp/integration`: 통합 검수 및 운영 배포

서브 브랜치 결과를 합칠 때는 각 에이전트의 완료 보고에서 아래를 확인합니다.

- 브랜치명
- 최신 커밋 해시
- 변경 요약
- 주요 수정 파일
- 검증 결과
- 충돌 주의 파일
- Preview URL 또는 로컬 확인 URL

## 검증 기준

기본 검증:

```bash
npx tsc --noEmit
npm run build
```

알려진 기존 경고:

- 블로그 포스트 SEO 검증에서 excerpt/imageUrl 경고가 다수 나옵니다. 현재 ERP 변경과는 별개입니다.
- `libheif-js` 관련 critical dependency warning이 나옵니다. 명함 HEIC 이미지 처리 경로에서 발생하는 기존 경고입니다.

## 다음 세션에서 특히 확인할 것

- 새 작업 전에 반드시 `git status --short`로 미커밋 변경 여부를 확인합니다.
- `app/erp/ErpClient.tsx`는 여러 브랜치가 동시에 수정하는 파일이므로 충돌 해결 시 기능을 잃지 않도록 합니다.
- 청구관리에서 실제 Notion 계약/정산 DB를 붙일 경우, 현재 로컬 상태 셀렉터를 Notion 속성 업데이트 API와 연결해야 합니다.
- 견적서/진단자료 생성 버튼은 UI 버튼만으로는 Codex 스킬이 자동 실행되지 않습니다. 배포 환경에서 동작하려면 서버 API가 해당 스킬 로직을 실행하는 스크립트/워커를 호출해야 합니다.
