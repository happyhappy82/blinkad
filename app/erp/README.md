# BlinkAd ERP 개발 경계

ERP는 병렬 작업 충돌을 줄이기 위해 아래 경계로 나눠서 작업한다.

## 파일 역할

- `ErpClient.tsx`: ERP 화면 조립, 상태 연결, 메뉴 라우팅. 새 큰 패널은 이 파일에 직접 만들지 않는다.
- `_components/`: 메뉴별 UI 컴포넌트. 병렬 개발 시 각 에이전트는 자기 담당 폴더를 우선 수정한다.
- `_lib/erp-config.tsx`: 메뉴, 상태값, 샘플 운영 데이터, 공용 타입. 여러 화면이 같이 쓰는 값만 둔다.
- `../api/erp/**`: Notion, Google Calendar, Google Ads, 자동화 액션 API.
- `scripts/erp-quote-worker.mjs`: 배포 ERP에서 받은 견적서/진단자료 생성 요청을 로컬 Mac에서 처리하는 워커.

## 병렬 개발 권장 단위

- `CRM/영업`: `app/api/erp/clients/**`, 문의관리/팔로업/고객관리 UI
- `견적/진단/계약`: `app/api/erp/actions/**`, 견적서/진단자료/계약서 UI
- `매장 운영관리`: 구글프로필/구글애즈/웹사이트·블로그 운영 UI
- `일정/미팅/메일`: 캘린더, 미팅관리, 주간미팅, 메일관리 UI/API
- `리포트/청구`: 보고 DB, 청구관리, 운영 리포트 UI/API

공용 타입이나 메뉴를 바꿀 때는 `_lib/erp-config.tsx`만 최소 변경하고, 화면별 구현은 가능한 한 별도 컴포넌트로 분리한다.

## 관련 문서

- `_components/README.md`: 메뉴별 컴포넌트 소유권과 수정 규칙
- `PARALLEL_DEVELOPMENT.md`: `erp/integration` 병합 순서, Preview 검수, 완료 보고 템플릿
