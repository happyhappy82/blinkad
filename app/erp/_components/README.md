# BlinkAd ERP Component Ownership

ERP 병렬 개발은 `ErpClient.tsx`를 계속 키우지 않고, 메뉴별 컴포넌트 폴더를 기준으로 나눠서 작업한다.

## Folder Map

| Folder | Owner Branch | Scope |
| --- | --- | --- |
| `calendar/` | `erp/calendar` | 일정관리, 미팅관리, 주간미팅, Google Calendar/Gmail UI |
| `crm/` | `erp/crm` | 문의관리, 팔로업관리, 고객관리, 계약대기, 명함관리 |
| `automation/` | `erp/automation` | 견적서 생성, 진단자료 생성, 계약서/이폼사인 연결 |
| `ops/` | `erp/ops` | 매장 운영관리, Google 프로필 보고, Google Ads, 웹사이트/블로그 운영 |
| `shared/` | integration owner | 둘 이상 메뉴가 함께 쓰는 작은 UI/helper only |

## Rules

- 각 에이전트는 자기 폴더와 자기 API 범위만 수정한다.
- `app/erp/ErpClient.tsx`는 화면 조립, 상태 연결, 라우팅 수준만 담당한다.
- 새 패널이나 큰 UI는 `ErpClient.tsx`에 직접 만들지 말고 담당 폴더에 만든 뒤 import한다.
- `app/erp/_lib/erp-config.tsx`는 공용 타입, 메뉴, 샘플 데이터만 둔다. 삭제/이름변경은 통합 담당 확인 후 한다.
- `package.json` 또는 `package-lock.json` 변경은 완료 보고와 PR 설명에 반드시 적는다.
- 여러 영역이 함께 쓰는 코드는 바로 `shared/`로 옮기지 말고, 중복이 2회 이상 생겼을 때만 통합 담당이 분리한다.

## Current Split

- `calendar/MeetingPanels.tsx`
  - `MeetingPanel`
  - `WeeklyMeetingPanel`
  - 미팅관리 DB 테이블, 미팅 내용 모달, 주간미팅 테이블
- `crm/BusinessCardPanel.tsx`
  - 명함관리 화면, OCR 실행, Notion 명함 DB 카드 목록
- `shared/StoreTable.tsx`
  - 문의관리, 진단자료, 견적서, 계약서, 리포트 메뉴가 함께 쓰는 매장 목록 테이블
