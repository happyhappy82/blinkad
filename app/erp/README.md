# BlinkAd ERP 개발 경계

ERP는 병렬 작업 충돌을 줄이기 위해 아래 경계로 나눠서 작업한다.

## 파일 역할

- `ErpClient.tsx`: ERP 화면 조립과 기존 패널 로직. 큰 화면 변경은 여기서 하되, 새 공용 데이터는 `_lib`로 분리한다.
- `_lib/erp-config.tsx`: 메뉴, 상태값, 샘플 운영 데이터, 공용 타입. 여러 화면이 같이 쓰는 값만 둔다.
- `../api/erp/**`: Notion, Google Calendar, Google Ads, 자동화 액션 API.
- `scripts/erp-quote-worker.mjs`: 배포 ERP에서 받은 견적서 생성 요청을 로컬 Mac에서 처리하는 워커.

## 병렬 개발 권장 단위

- `CRM/영업`: `app/api/erp/clients/**`, 문의관리/팔로업/고객관리 UI
- `견적/진단/계약`: `app/api/erp/actions/**`, 견적서/진단자료/계약서 UI
- `매장 운영관리`: 구글프로필/구글애즈/웹사이트·블로그 운영 UI
- `일정/미팅/메일`: 캘린더, 미팅관리, 위클리미팅, 메일관리 UI/API
- `리포트/청구`: 보고 DB, 청구관리, 운영 리포트 UI/API

공용 타입이나 메뉴를 바꿀 때는 `_lib/erp-config.tsx`만 최소 변경하고, 화면별 구현은 가능한 한 별도 컴포넌트로 분리한다.
