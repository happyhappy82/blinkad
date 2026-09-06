# 블링크애드 ERP 입금·정산 캘린더 등록 결과

기준일: 2026-09-06 (Asia/Seoul)

반복 작업의 저장 방식·공유·회차·정산 규칙은 [캘린더 운영 기준](docs/billing-calendar-operations.md)을 먼저 읽는다. 아래 목록은 위 기준일의 등록 결과이며 최신 외부 현황을 대신하지 않는다.

## 결과

- 대상: Google Calendar `블링크애드 입금·정산` (소유자 travelingtoseoul@gmail.com).
- ERP 등록 이력 10개 매장(활성 8개·계약 해제 2개)의 일정 64건 반영: 신규 63건, 주도락 테스트 1건 정식 전환.
- 기간: 2026-06-10~2027-06-30. 현재 ERP에 등록된 계약 범위를 옮겼으며 무기한 반복을 만들지 않았다.
- 원본 유형: 계약일 10건, 입금완료 기록 9건, 입금요청 22건, 회차 종료·정산 23건.
- 종일 일정, 캘린더 기본 주황색, 시간 점유 없음. 별도 참석자와 개별 알림을 추가하지 않았다.
- 실제 송금·고객 연락·ERP 입금 또는 정산 상태 변경은 수행하지 않았다.
- 후속 요청에 따라 64건 모두 회차를 제목 맨 앞에 표시했다. 입금요청은 입금받을 회차, 정산은 마감 회차, 3개월 선입금은 `1~3회차`로 구분한다.

## 반영 기준과 예외

- 원본: https://blinkad-erp-ops.vercel.app/erp?menu=billing 및 https://blinkad-erp-ops.vercel.app/erp?menu=settlement
- ERP 청구관리 13개월의 화면별 건수와 운영 소스에서 계산한 64개 일정을 대조했다. 이 범위에 추가 수동 일정은 없었다.
- 정산 화면은 원본 Google Sheet 검증 상태 FAIL로 내장 데이터를 표시 중이었다. 이번 반영은 실제 ERP 화면에 표시되는 내장 계약 데이터 기준이며 원본 시트 오류를 수정한 작업은 아니다.
- 에코쟈댕 롯데월드몰점은 3개월 선입금 상태이므로 ERP의 2·3회차 입금요청 2건을 `선입금 확인`으로 표시하고 추가 청구 대상이 아님을 명시했다.
- 등록 계약 이후 입금요청은 `갱신 입금 요청`으로 표시했다. 기존 월 금액은 참고값이며 갱신 여부와 실제 청구액 확인이 필요하다.
- 바다당은 용역비와 광고 집행비 월 330,000원(VAT 포함)을 분리했다. 에코쟈댕은 총액에 포함된 광고 집행비 월 880,000원을 분리 표시했다.
- 렛츠바레는 실제 입금일이 미등록이어서 ERP 계약일 기준 일정과 입금·연장 확인 필요 문구를 함께 반영했다.
- 웰믹스 광화문점·도르도뉴는 현재 계약 해제 매장이므로 과거 기록으로 표시했다.
- 사용자 확정 규칙: 각 회차의 작업이 끝난 달의 말일에 정산한다. 정산 일정은 월말로 이동하고, 기존 ERP 회차 종료 기준일과 입금 기준일은 설명에서 별도로 구분한다.
- ERP와 캘린더 사이의 지속적인 자동 동기화는 설정하지 않았다. 이후 변경·신규 계약·갱신분은 별도 반영해야 한다.

## 확정 정산 규칙 — 2026-09-06

- 정산일 = 해당 회차 작업 종료일이 속한 달의 마지막 날짜.
- 9월 4일 작업 종료 → 9월 30일 정산. 9월 5일 연장 시작·10월 4일 작업 종료 → 10월 31일 정산.
- 회차는 각각 따로 계산한다. 연장 입금일을 이전 회차의 정산일로 사용하지 않는다.
- 기존 정산 일정 23건에 적용했다. 날짜 이동 21건, 이미 말일인 2건은 날짜 유지·설명 갱신. 입금요청 등 다른 41건은 그대로 보존했다.
- 이번 변경은 공유 Google Calendar의 정산일 설정에 적용했다. ERP 앱 코드·원본 시트를 수정하거나 지속 동기화를 설정한 작업은 아니다.
- 일정 제목의 회차, 금액, 기본 색상, 알림은 유지했다. 설명에서 `회차 종료·정산 기준일`을 두 항목으로 나누고, 이전의 `같은 날 다음 회차 입금` 표현을 실제 입금 기준 날짜로 바꿨다.

## 검증

월말 정산 변경 후 전체 64건을 재조회했다. 정산 23건이 모두 해당 월 말일이며, 입금요청·계약·입금완료 등 41건은 변경 전과 동일하다.

회차 표기 후 64건을 재조회해 제목과 회차 범위를 검증했다. 날짜·금액 설명·알림·색상 등 제목 외 필드는 변경 전과 동일하다.

Google Calendar API로 대상 캘린더 전체를 다시 조회해 64건의 제목·설명·시작일·종료일·원본 식별자·종일 여부·기본 색상·알림을 대조했다. 누락 0건, 중복 0건, 테스트 제목 0건. Google API가 생략한 visibility는 문서상 기본값인 default로 정규화해 검증했다.

월별 건수: 2026-06 8건, 2026-07 8건, 2026-08 14건, 2026-09 14건, 2026-10 4건, 2026-11 2건, 2026-12 2건, 2027-01 2건, 2027-02 2건, 2027-03 2건, 2027-04 2건, 2027-05 2건, 2027-06 2건.

## 등록 목록

| 날짜 | ERP 원본 유형 | 등록 제목 |
|---|---|---|
| 2026-06-10 | 계약일 | [[1회차 계약 시작] 웰믹스 광화문점](https://www.google.com/calendar/event?eid=YmxpbmthZDE5ZmU2MzFiZGI1MjVhYTIzNDY4Mjg2ZTg4ZWMzMWNmMGJkOTQyNjEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-11 | 입금일 | [[1회차 입금완료 기록] 웰믹스 광화문점](https://www.google.com/calendar/event?eid=YmxpbmthZGRmZmFjYjM1Njg5ZWM1MzE2YWIyZDVlZjdiNGQzMTZjMGQxODQ3ZjUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-16 | 계약일 | [[1회차 계약 시작] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGUyZjczMGJhMTFlYmI4M2Y0ZTZhYTAyZDM4N2RjODk3MmExMGQ4ZTIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-16 | 입금일 | [[1회차 입금완료 기록] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDdiOTU2NjVkNDgzZDdkMjMyY2NlMDM2OTM0YmEyNmMzMGMxZDdlYzIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-20 | 입금일 | [[1회차 입금완료 기록] 자루야키용산로 신용산본점](https://www.google.com/calendar/event?eid=YmxpbmthZGYwZDc5NDBkNzE5NGFkODY3MWExNWM5YWFjNzI1YmY4MTc3MzI1NWUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-20 | 입금일 | [[1회차 입금완료 기록] 주도락 을지로점](https://www.google.com/calendar/event?eid=YmxpbmthZDBiZWM4Njc4NGI5ZDA3NmJlODFhZDQ3ZTE2OWM2ODBlNWU5MTgwMzQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-23 | 계약일 | [[1회차 계약 시작] 도르도뉴](https://www.google.com/calendar/event?eid=YmxpbmthZDFiODRiMGY2ZjkzZWZkYzRlNTU5ZTQ3NTIxYmFmODg3YzIyZDE5ZDUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-06-23 | 입금일 | [[1회차 입금완료 기록] 도르도뉴](https://www.google.com/calendar/event?eid=YmxpbmthZDViN2YxMzNlMWVmODkzMGQyMjBlNDc1ODBmZmIyOTEyZmRiMzAxMTQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-06 | 입금요청 | [[2회차 과거 입금요청 기록] 웰믹스 광화문점](https://www.google.com/calendar/event?eid=YmxpbmthZDBiNDcyMzljNzNmMzJhOTgwNDNkZWVkMTkyODY0MzI4ODU4ZGY0MDAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-11 | 입금요청 | [[2회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDFmMmVjOTQzMTA5MGU5YzE5YTBlZGZiZmQxY2I0NDFkMmQyMTE4YzggMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-24 | 계약일 | [[1회차 계약 시작] 렛츠바레](https://www.google.com/calendar/event?eid=YmxpbmthZDZmNzcwMTc0ZWM4Y2Y1N2FlZmFlMTFkZDA0MWRiZDhjZmYzMmM3YTggMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-31 | 입금일 | [[1~3회차 선입금 완료] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZDc5ZjE3YzYxZWY2NDA1ZTQ1OTMyM2U3M2YzYWYwMzM3MTQ4NDcwYzMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-31 | 계약일 | [[1회차 계약 시작] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZDg1NWE0MzBkZDJkNDlkMDhiN2E4MzBjMjAzZGEwNGUxMWY4MjVmMTAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-31 | 종료일 | [[1회차 정산] 도르도뉴](https://www.google.com/calendar/event?eid=YmxpbmthZDhlZDFjYWVkMmVmNWFiODg4Y2JhM2E1OGNjZDJiM2Y5YmY1NDUzMWYgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-31 | 종료일 | [[1회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDgwNzNmNGM0NDRlOWZjMDU0MmFiZTIwZTZiMzM2ZDZjNmY3Mjk0YWQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-07-31 | 종료일 | [[1회차 정산] 웰믹스 광화문점](https://www.google.com/calendar/event?eid=YmxpbmthZDNkMGQ0MWFhYTFjNzc0OTlmZTM5MjQwYjYxOWI3NTBmYTFhMDAzMDYgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-06 | 계약일 | [[1회차 계약 시작] 에코쟈댕 홍대점](https://www.google.com/calendar/event?eid=YmxpbmthZGUyZTdlZmI3ZjQzYWEwMzA4ZGQwZjE0N2JmOTA4NjI0MzQ5NGIzMWIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-06 | 입금일 | [[1회차 입금완료 기록] 에코쟈댕 홍대점](https://www.google.com/calendar/event?eid=YmxpbmthZDRjMDYyZGQ2Mzg5NjRhNzRmOGJiMTI4NjVkYjQ3ZWUzNzA2OTkzZjMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-11 | 입금요청 | [[3회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDg2OTNjZTJiZThjN2QzMGI3MzcwMGI0MmM0ZTZjM2M0MGU2ZmRkZTkgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-12 | 계약일 | [[1회차 계약 시작] 자루야키용산로 신용산본점](https://www.google.com/calendar/event?eid=YmxpbmthZDY0ZDVhYjcwZmE4NDkxN2ZlODZjYWJkNmI4MjRiNmNmZWFjZTVkZGUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-12 | 계약일 | [[1회차 계약 시작] 주도락 을지로점](https://www.google.com/calendar/event?eid=YmxpbmthZDg2NmNhNzAxYWZhY2MzMjUwNzBkN2ZkNjgxMTFlODYxMTZiZTVlZmIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-19 | 입금요청 | [[2회차 갱신 입금 요청] 렛츠바레](https://www.google.com/calendar/event?eid=YmxpbmthZGZmMWNlYTZjYWM2NzU3NzdmZTE2ZWQ2ODgwMjJlYmRhNzQ5N2JhYjIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-26 | 계약일 | [[1회차 계약 시작] 영종센트럴피부과](https://www.google.com/calendar/event?eid=YmxpbmthZDlmNDk0NWM5ZTMyYTM4NzM0NjIzNzBjODNmNmI0ZTNlNGJiOGU3OWMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-26 | 계약일 | [[1회차 계약 시작] 원스타올드패션드 햄버거 어린이대공원점](https://www.google.com/calendar/event?eid=YmxpbmthZDJlMDY1ZmFkYzIxMjYwZWY0YjdmZTVlZTk3NTBlZjI0ZGY5ZTZhZjkgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-26 | 입금일 | [[1회차 입금완료 기록] 영종센트럴피부과](https://www.google.com/calendar/event?eid=YmxpbmthZDIxY2Y0MzI5MjE1OTgyMzk0MmJlODUyOTBhMGM2ZWM3NGI4MGFkMGEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-26 | 입금일 | [[1회차 입금완료 기록] 원스타올드패션드 햄버거 어린이대공원점](https://www.google.com/calendar/event?eid=YmxpbmthZDJiODQ1ZTVkMWE0OTIwOTNmNzE0ODgzYWMxMzc4Nzc2ZjFhZGFmM2YgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-26 | 입금요청 | [[2회차 선입금 확인] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZGRmZGI1NDVkODNjZDBlMGM3MmE0ZWVhNjY2OTFhODZkMDA3YzkwNmYgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-31 | 종료일 | [[1회차 정산] 렛츠바레](https://www.google.com/calendar/event?eid=YmxpbmthZGYxYTdlOTZlMTE0OTllOThmMGIzMzQ0ODViMzA5ZjNlZGRkMmQ5MjcgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-31 | 종료일 | [[1회차 정산] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZDA4MmM2MjRkMTMzNDkwMDMyYmIwZmNlY2I4Nzg0Y2JlMTZiZjE3YjMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-08-31 | 종료일 | [[2회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDQ1Y2UzYTNkMThjZDcwYTI1MmFhNmY1Yzg1MzU0Yzg2ZDlkNmVmMjAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-01 | 입금요청 | [[2회차 갱신 입금 요청] 에코쟈댕 홍대점](https://www.google.com/calendar/event?eid=YmxpbmthZDY4MWJmN2RmMTZkZDFhY2ZiYzZmMDJmYjlmZTBjZDhiODYxZjhiYmIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-07 | 입금요청 | [[2회차 갱신 입금 요청] 자루야키용산로 신용산본점](https://www.google.com/calendar/event?eid=YmxpbmthZDAzMGU2ZDYzY2ZmOTNkNDA2MDJkNmE2NDY1ZjFkMmQyNDA1NTI3YWEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-07 | 입금요청 | [[2회차 갱신 입금 요청] 주도락 을지로점](https://www.google.com/calendar/event?eid=NjBmaWsycDhzYWV0ZjdhcGUzM2dlZWM1MHAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-11 | 입금요청 | [[4회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGM1ZDZhNDk1YmFkMjMwM2FiMTU5ZTA0ZGI0ODUzMDk3ODNmY2MzOTMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-21 | 입금요청 | [[2회차 갱신 입금 요청] 영종센트럴피부과](https://www.google.com/calendar/event?eid=YmxpbmthZDA0MjIxZmU3MmVmMmNiMTZkYTIzMWRhMTQ5ZTkxMjMwODQyYWQ4YmIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-21 | 입금요청 | [[2회차 갱신 입금 요청] 원스타올드패션드 햄버거 어린이대공원점](https://www.google.com/calendar/event?eid=YmxpbmthZGJmYzYyNTZhZDhlYzkzNzc3YmYyZjM4NDQ2YWNkNjViNjhhZWFlYmQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-25 | 입금요청 | [[3회차 선입금 확인] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZGQxNGU1NzBlYTQzMWViMTJlZDQ4NmQ5ZDVjMzJiNTVlMzViMzMzMmMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[1회차 정산] 에코쟈댕 홍대점](https://www.google.com/calendar/event?eid=YmxpbmthZDM1OWIxNGNiNzI1NjM1YjcyYmQyZGRhNDMwNDk1NDhlNzZmMDVkMGUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[1회차 정산] 영종센트럴피부과](https://www.google.com/calendar/event?eid=YmxpbmthZDA4ZmU0ZDUzMjEzODk1YzBmYmI3ZDRlMTI3MjdhMzJlNjE4NTk5YjAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[1회차 정산] 원스타올드패션드 햄버거 어린이대공원점](https://www.google.com/calendar/event?eid=YmxpbmthZGZkZWM2NjZkNjAwZGRmODBkYzliNGMxNGQ4ZGQ0ZGVmOWYyMGZlZDkgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[1회차 정산] 자루야키용산로 신용산본점](https://www.google.com/calendar/event?eid=YmxpbmthZDBkYTQzMjlhN2Q1NmZiMmVjZmY3NDU2NGRmMjlkYWE2YTVjMTAxY2MgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[1회차 정산] 주도락 을지로점](https://www.google.com/calendar/event?eid=YmxpbmthZDg2NzkxMmIzOTdjZTUzMTUxOTMwNzlkNTQyM2FmYjY2ZjJkMDdmNGIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[2회차 정산] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZDg5OWQzNDgwN2VlOWE2MTQwZjIyNzJiODc5YmNiNTRiODFhYzE4ODYgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-09-30 | 종료일 | [[3회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGNlNjMxY2VjYmFkNjdiNjExMGYxMDViMmQ1Mzg4NWRjNTM3NzczMjAgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-10-11 | 입금요청 | [[5회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGE2OTMzNzYzYzg0ZTJkZjczNTY1MTkxZmQxOTkxZjc5ZTY4YmM0MTIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-10-25 | 입금요청 | [[4회차 갱신 입금 요청] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZGExZTY2Y2VkMzMyYjQ5YjgxYzkxNDA4ZWI3NTc5NzZiZDk4MzZlNTMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-10-31 | 종료일 | [[3회차 정산] 에코쟈댕 롯데월드몰점](https://www.google.com/calendar/event?eid=YmxpbmthZGIxMThhYjVmMTQxMDQ3NmFiYWY3YjM4NjhjMmJkNDY3YWY1ZTc4MzggMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-10-31 | 종료일 | [[4회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDQ4YTg1NWMwYmJlZmZmZDdhZDg0NjIyMDk1N2FhYmVjMTMxZDY4ODQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-11-11 | 입금요청 | [[6회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDQxNjllNmMzMWRkMmNmZDhmNGE4OTExNTBkZGJlYWQzZTUzZmVlMjggMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-11-30 | 종료일 | [[5회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDZkOWI3NjUwYzVhOGYzZWE5MjI5ODI1NWY0MjVkZWNlYWQyZDI5ZjkgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-12-11 | 입금요청 | [[7회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDY0Nzg2MzczNGIwM2JmNGM5ZmFhZDJmNWMxZGQ5ZGQwYzgwNjc0ODcgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2026-12-31 | 종료일 | [[6회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDM3OTk5Zjc2MDc0OTk5MTMzNTMwNzc5MjIyYWQxZDdmYWVjNDY2YWQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-01-11 | 입금요청 | [[8회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDIwNTBlOGU0MzUyNmQ4MTgzYjBkMmIwYzg1MzFjZTY3NjIzYzViZWUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-01-31 | 종료일 | [[7회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDUyYTM5ZDQ1MTljMDUxOGU4M2I3YzljOTQxMGRmNmY4MWIwZDQzMDEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-02-11 | 입금요청 | [[9회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDg0NzE2MGY2ZTI5NTkwN2NmZTRiYzEwNWU5ZWI4ZDM2ODkzMDQ4ZjcgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-02-28 | 종료일 | [[8회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDA4MjIyNjM1ODY1YjFhMTExM2EzODFlYmViZWY5NDQxOWZiOWM4NWQgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-03-11 | 입금요청 | [[10회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDlkNWQ3NTcyNTBlMTcyMDUwYTJkYmQwY2IyOWJkYTZhNDYzYjBhM2UgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-03-31 | 종료일 | [[9회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGZiM2IxYWMwZDVmNjgyMjA0NGQ2ODAzYWY2YTc5MzVkMzE4ODE4YTIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-04-11 | 입금요청 | [[11회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDdmMTk1ZTljYjE5M2ZlMTA2N2E5M2NiMTU3MjIwMDlhMTM3NWEzMmUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-04-30 | 종료일 | [[10회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDljZDYxMGNiODI3YmY3MjI2NDU3NGE2ZDMyZGNlM2RkOWQ5ZDY2ZWIgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-05-11 | 입금요청 | [[12회차 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDA3OGIyMDcyMTU3Mzc0YjQ5N2ExNjMwNDc0OGM3NzVkOWM3ODcxZTEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-05-31 | 종료일 | [[11회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDFkZGQ4YzZhNjgzMzJhMmZlNjQ5ZDFmM2Y2NzRlNmZkMTZhNTkzODMgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-06-11 | 입금요청 | [[13회차 갱신 입금 요청] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZGYxNGFiNGUzMzBlMmE3ODY5NGQ0ZWUzMjEyMzIxZGU3MDBlM2NhYTUgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |
| 2027-06-30 | 종료일 | [[12회차 정산] 바다당 해운대점](https://www.google.com/calendar/event?eid=YmxpbmthZDczY2YxZjgzMjY4ZjNjMzNkM2VhZjMwMTAyZDZjYzMxYjhjZTI1OTEgMjZmNzRlZjc1OTkyZGMwNmM0NDg0ZGU2YjYwNGYwZjUwOGEzM2Y0NTIwM2IyYTFmZTQyNmQwZjAzMGVmYjdiMkBn) |

## 재개 정보

- 캘린더 ID: `26f74ef75992dc06c4484de6b604f0f508a33f45203b2a1fe426d0f030efb7b2@group.calendar.google.com`
- 이벤트 `extendedProperties.private.blinkadErpSourceId`에 ERP 원본 ID를 저장했다. 재등록 전 반드시 이를 대조한다.
- 변경 전·후 데이터와 계획 원장은 Git 제외 경로 `.erp-private/billing-calendar-import-20260906/`에 보관했다.
- 캘린더 전용 CLI 인증은 로컬 `~/.config/blinkad-billing-calendar`에 암호화 저장했다. 기존 gws 기본 계정 설정은 변경하지 않았다. 인증 파일은 Git에 포함하지 않는다.
- Apple Calendar의 기존 `세팅 스킬 제작` 이벤트 접근 오류 해소 여부는 아직 확인되지 않았다. 이번 Google Calendar 등록과 별개이다.
