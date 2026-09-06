# Notion 원장 → 매장 입금 자동 연동

기준일: 2026-09-06 KST
상태: 원장 직접 연결·수식 조회 완료. 신규 자동 매칭은 연결 권한 대기.

## 사용자 화면

- 관리 페이지: https://app.notion.com/p/3d3753ebc0138148b3b3c77f394da297
- 카뱅 원장: https://app.notion.com/p/54d5801f26d148228bb6bbac2d27212c
- 자동연동 상태: https://app.notion.com/p/3d3753ebc01381b699e5e2f94b605df9

기존 매장3·서비스6·회차5 샘플에 원장 직접 관계를 추가했다. 입금 기록은 4건(원장 대조2·확인 후보2), 입금 배분은 5건(확정4·확인필요1)이다.

첫 화면과 매장별 표의 입금현황(자동), 반영 입금액, 미수금은 연결된 원장으로 계산한다. 기존 수기 입금상태·입금액·회차 배분액은 보존하되 주요 뷰에서는 자동 필드를 보여준다.

## 계산 흐름

1. 카뱅 원장 입금 집계액: 구분=입금일 때 금액, 출금은 0.
2. 관리 입금내역 원장거래 관계 → 원장 입금액/원장 입금일 롤업.
3. 확인된 입금액: 확인상태=원장 대조인 거래만 반영.
4. 입금 배분: 확정된 배분에 한해 min(배분예정액, max(0, 확인된 입금액 - 선배분액)).
5. 회차: 배분 반영액 합계와 회차 청구액을 비교하여 입금완료/일부입금/입금대기/확인필요 계산.
6. 매장: 확인된 총입금과 계약총액을 비교하여 입금 현황 표시.

에코쟈댕 선입금 594만원은 198만원씩 3회차에 배분한다. 같은 은행 거래를 3건의 실제 입금으로 중복 기록하지 않는다. 원장 금액이 줄어들면 후순위 배분부터 차감된다.

영종센트럴 200만원은 확정, 별도 110만원은 회차 확인으로 연결했다. 렛츠바레 77만원은 매장 확인 후보이며 확정 입금에 합산하지 않는다. 원본 은행 거래일·금액·상대/적요·잔액·원문은 변경하지 않는다.

## 신규 거래 자동 연결

- 프로그램: `scripts/notion-deposit-sync.py`
- 설정: `config/notion-deposit-sync.json`
- 시작일: 2026-09-06. 이전 거래를 이름만으로 새로 자동 확정하지 않는다.
- 매장 입금자명 속성의 한 줄당 한 입금자명과 완전 일치해야 한다. 퍼지/부분 문자열 매칭 금지.
- 자동 연결은 회차 잔액과 금액이 정확히 맞고, 작업 시작 7일 전~종료일 범위에서 유일한 회차인 경우만 허용한다.
- 계약에 남은 전체 회차의 합계와 정확히 맞는 선입금도 지원한다.
- 부분입금·금액 불일치·여러 회차 후보·이미 완료된 회차의 추가 입금은 확인 대상으로 둔다.
- 종료 매장은 신규 자동 확정하지 않는다.
- 원장에서 매장·정산회차를 직접 선택하고 입금매칭=수동확정으로 바꾸면 사람이 확정한 연결을 적용한다.
- 원장 제외·출금 변경·삭제/보관·중복과 회차 중복 배분은 확인된 입금에서 제외하거나 검토 상태로 처리한다.
- 거래 분/구분/금액/잔액/계좌끝4로 엑셀/문자 중복 후보를 감지한다. 기존 확정 거래가 있으면 그 행을 기준으로 중복 집계를 막는다.
- 은행 원장에 쓰는 필드는 매장, 정산회차, 입금매칭, 매칭메모 4개로 제한한다.
- 원장ID/배분키로 멱등성을 유지하며, 잠금으로 실행 중복을 막는다. 생성 타임아웃에 무조건 재생성하지 않는다. 자동배분계획을 보관하여 중단된 배분을 재개한다.
- Notion 작업큐, 은행 계좌, Google Calendar, 메시지 전송은 호출하지 않는다.

## 실행과 남은 권한

LaunchAgent `com.blinkad.notion-deposit-sync`를 등록했다.

- 위치: `~/Library/LaunchAgents/com.blinkad.notion-deposit-sync.plist`
- 60초 간격, 로그인한 이 Mac이 켜져 있고 네트워크에 연결된 동안 실행.
- Python: `/Users/mcbookpro/opt/anaconda3/bin/python3`
- 설정·토큰 경로·state-dir를 인자로 전달하고 `--apply` 사용.
- 모든 데이터소스를 읽는 사전 점검이 끝나야 쓰기를 시작한다. 읽기 오류 시 금융 데이터를 수정하지 않는다.
- 프라이빗 경로: `.erp-private/notion-deposit-sync/`; 폴더700·토큰600. 기존 중립 경로의 Notion 자격증명을 사용하며 비밀값은 Git/로그에 기록하지 않는다.
- `health.json`: 마지막 시도/성공과 상태. `latest-snapshot.json`, `latest-plan.json`, `latest-audit.json`, `audit.jsonl`로 재개 및 감사.
- 첫 성공 시 Notion 자동연동 상태 페이지에 마지막 원장 확인 시각을 기록한다.

현재 자동 프로그램의 연결 이름은 **SEO블로그(에이정,테크 등)** 이다. 카뱅 원장은 HTTP200으로 읽지만 새 샘플 관리 페이지/데이터소스는 HTTP404이다. Notion 편집에 사용하는 MCP 연결과 자동 실행용 연결의 권한이 달라 생긴 제약이다.

사용자에게 관리 페이지의 **··· → 연결 추가 → SEO블로그(에이정,테크 등)**을 한 번 추가하도록 요청했다. 등록된 프로그램은 다음 60초 실행에서 재시도한다. 권한이 추가되기 전에는 신규 자동 매칭 완료라고 보고하지 않는다. 추가 후 직접 실제 API 재조회·두 번째 무변경 실행까지 확인한다.

은행→원장은 기존 문자 수집에 의존한다. 원장 86건(엑셀79·문자7)을 확인했으며 가장 최근 문자 원장 생성은 2026-09-05이다. 상위 수집 시스템의 구현·항상 가동 여부는 이 작업에서 확인되지 않았다. 은행 송금 시점부터의 무지연을 보장하는 구조가 아니다.

## 검증

- 단위 테스트15개 통과: 정확 매칭, 부분/초과 입금 검토, 동일금액 회차 모호성, 이름 오매칭, 종료/과거 거래, 선입금, 중복, 삭제/출금/제외, 수동 부분입금, 후보 유지, 추가 입금, 중복 수동배분, 원장 쓰기 제한, 멱등 패치, 중단 배분 재개.
- 실제 Notion 속성 스냅샷의 시뮬레이션: 확정 입금2·검토2·확정 배분4, 두 번째 실행 패치0, 원장 금융 필드 보존.
- Notion의 입금현황(자동)=입금완료 필터가 기대한 4회차(에코쟈댕3·영종1)를 반환했다. 원장 검토 뷰는 2건 반환.
- `npx tsc --noEmit`, `npm run build` 통과. 기존 블로그 SEO 경고가 있다.
- LaunchAgent 등록과 60초 설정 확인. 실제 첫 실행은 새 데이터소스 접근 HTTP404로 쓰기 전에 종료. 실서버 자동 생성/갱신 검증은 권한 추가 후 필요하다.
- ERP 웹앱 코드·배포는 변경하지 않았다.

## 운영 명령

```bash
python3 scripts/notion-deposit-sync.py --config config/notion-deposit-sync.json --token-file .erp-private/notion-deposit-sync/token --state-dir .erp-private/notion-deposit-sync
python3 scripts/notion-deposit-sync.py --config config/notion-deposit-sync.json --token-file .erp-private/notion-deposit-sync/token --state-dir .erp-private/notion-deposit-sync --apply
python3 -m unittest discover -s tests -p 'test_notion_deposit_sync.py' -v
launchctl print gui/$(id -u)/com.blinkad.notion-deposit-sync
launchctl bootout gui/$(id -u)/com.blinkad.notion-deposit-sync
```

수동 재확정은 원장의 매장/정산회차/입금매칭을 수정한다. 은행 금액을 자동 테스트 용도로 변조하지 않는다. 기존 실제 거래의 이체·삭제를 하지 않는다.

## 관련 문서

- 샘플 최초 구성: `NOTION_STORE_SETTLEMENT_SAMPLE_20260906.md` (이 문서 이후의 원장 연동 상태가 우선)
- [Notion 연결 관리](https://www.notion.com/help/add-and-manage-connections-with-the-api)
- [Notion data source/API 구조](https://developers.notion.com/guides/data-apis/working-with-databases)
