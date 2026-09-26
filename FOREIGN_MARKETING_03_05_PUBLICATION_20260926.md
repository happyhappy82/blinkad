# 지역×업종 외국인 마케팅 03~05 홈페이지 발행

기준일: 2026-09-26 KST. 사용자의 “나머지 이어서 진행해” 요청에 따라, 앞서 안내한 발행 대기 3편을 공식 홈페이지에 등록한다. 새 주제 집필이나 오픈애즈 발행은 이번 범위가 아니다.

## 대상과 정본

- 정본: 검수 포털 `blinkad / 2026-09 / 03, 04, 05`, 모두 v3.0, ready=true, 한국어 direct 원고.
- 2026-09-26 운영 API로 최신본을 조회했다. 포털의 draft는 원고 보관 상태이며 홈페이지 공개 상태와 별개다.
- 제목·요약·본문·출처·FAQ 3개는 정본을 보존했다. Markdown을 HTML로 변환하고 모바일 표 가로 스크롤용 포장/안내만 더했다.
- 원고 작성일은 2026-09-18, 기존 조사일은 03·04의 9월 17일 및 05의 9월 18일 그대로다. 새 홈페이지 발행일은 2026-09-26으로 구분한다.
- 포털 저장/승인/검수요청, Notion/작업큐, 오픈애즈 상태는 변경하지 않는다.

| 원고 | 제목 | 공개 주소 |
|---|---|---|
| 03 | 강남 성형외과 외국인 마케팅, 일본·중국·영어권 검색을 문의로 연결하려면 | [글 열기](https://www.blinkad.kr/blog/gangnam-seonghyeong-oigoa-oigug-in-maketing-ilbonjunggugyeong-eogueon-geomsaeg-eul-mun-euilo-yeongyeolhalyeomyeon) |
| 04 | 홍대 미용실 외국인 마케팅, Google Maps와 Instagram 문의를 예약으로 바꾸는 법 | [글 열기](https://www.blinkad.kr/blog/hongdae-miyongsil-oigug-in-maketing-google-mapsoa-instagram-mun-euileul-yeyag-eulo-bakkuneun-beob) |
| 05 | 명동 피부과 외국인 마케팅, 단기 체류 환자의 검색을 예약으로 연결하는 법 | [글 열기](https://www.blinkad.kr/blog/myeongdong-pibugoa-oigug-in-maketing-dangi-chelyu-hoanjaeui-geomsaeg-eul-yeyag-eulo-yeongyeolhaneun-beob) |

## 발행 전 검증

- 원고 본문의 고유 링크 35개 HTTP 200. URL 해석과 내부 글·문의 UTM 목적지 확인.
- [강남구 공식 통계](https://medicaltour.gangnam.go.kr/content/399/view.do?cid=399&lang=ko&mid=395-396)의 2025 유치실적 650,958명, 성형외과 22.7%, 일본 37.9%/중국 31.8%/미국 8%, 2026-05-01 협력 의료기관 148곳/성형 44곳과 대조했다.
- [Google hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=ko), [개인식별정보 정책](https://support.google.com/analytics/answer/6366371?hl=ko), [예약 링크 정책](https://support.google.com/business/answer/13769188?hl=ko), [예약 제공업체 실적](https://support.google.com/business/answer/7475773?hl=ko), [소셜 링크 실적 미제공](https://support.google.com/business/answer/13580646?hl=ko)을 재확인했다.
- [Medical Korea 등록 안내](https://www.medicalkorea.or.kr/korp/register/intro.do), [미등록 유치행위 사례](https://www.medicalkorea.or.kr/kmediwatch/sign/case), 의료법 [제56조](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1018923417)/[제57조](https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029945875) 공식 안내 대조.
- RE:BERRY의 방문 60~90분·상담·사후관리 공개 안내, Kind Global의 회복/주의 안내가 실제 공개돼 있음을 재확인했다. 이는 의료 효과나 개인 적용의 검증이 아니다.
- 과거 Google 지도 순위·버튼 개수는 정본에 기록된 조사일의 표본 결과다. 이번 발행 점검에서 과거 지도 결과를 다시 재현했다고 주장하지 않는다.

## 구현·회귀 검사

- `constants/index.ts`: 기존 106편을 변경하지 않고 3편 추가, 총 109편.
- `scripts/fetch-notion-posts.js`: 기존 수동 글 보존 목록에 새 3개 ID만 추가. 동기화/예약/발행 조건을 새로 만들지 않음.
- `scripts/foreign-marketing-posts.test.mjs`: 중복·완전성·FAQ·출처/UTM·표 접근성 및 Notion 병합 보존 검사. 네트워크/실제 파일 쓰기 없이 기존 병합 함수를 검증.
- 정본 대조: 모바일 표 포장과 안내를 제외하면 HTML 변환 결과·제목·요약이 정본과 일치.
- `node --test scripts/foreign-marketing-posts.test.mjs` 4/4, `node --check scripts/fetch-notion-posts.js`, `git diff --check`, `npm run build` 통과.
- 페이지 공통 레이아웃·기존 01/02 사진·기존 글 본문·FAQ 스키마 정책은 변경하지 않음.
- 로컬 production 서버에서 3개 글 × 1440/390/320px 9개 조합 및 모바일 목록을 확인. H1/canonical/Article/Breadcrumb/FAQ/표/UTM 링크 정상, 페이지 가로 넘침과 JavaScript 오류 0건. 모바일의 표 8개는 너비 576px로 개별 가로 스크롤, 키보드 포커스 지원.
- 배포 커밋 `ee4da11`. 배포 직전 포털 재조회에서 03~05 제목·본문·요약·출처·메모·ready·version·status가 모두 최초 조회와 동일함을 확인.

## 정본 Markdown SHA-256

| ID | SHA-256 |
|---|---|
| 03 | d9750dfd97e50c9ddbb3c16d4751b45f6126aec401ff47e33774c571872ccbf9 |
| 04 | 478d2bd603433a59f52bf52cbf9482b3623b85bb134cc97c304b4bad20168ced |
| 05 | c8e3478fc6b7fd9d02e394b8d7bdcfe3bdc1c2b46ec5151be96370a04ac41b4e |

## 운영 확인

- 2026-09-26 운영 배포 `dpl_zypBHvd9H1V2ipQvWhWN7TopJiZj` Ready, `www.blinkad.kr` 등 운영 alias 연결 확인. 코드 커밋 `ee4da11`.
- 운영 3개 URL 모두 HTTP 200, self-canonical, noindex 없음, `/blog/sitemap.xml` 포함 확인.
- 운영에서도 3개 글 × 1440/390/320px 9개 조합 및 모바일 글 목록 통과. H1, Article/Breadcrumb JSON-LD, 표 2/3/3개, 각 글 FAQ 3개, 문의 UTM 링크 정상. 페이지 가로 넘침·JavaScript 오류 없음, 모바일 개별 표 가로 스크롤 및 키보드 포커스 확인.
- 기존 106편 불변, 새 3편을 포함한 총 109편. 01~05 준비 원고의 홈페이지 공개가 모두 완료됐다.
- 운영 배포는 홈페이지에만 해당한다. 오픈애즈 발행·Notion 상태 변경·고객 검수요청·대신 승인·신규 문의 전송은 하지 않았다.
- 검색엔진 색인·검색 노출 완료는 홈페이지 발행 완료와 다르며 이번 작업에서 보장하지 않는다. 과거 지도 표본을 9월 26일 실측으로 갱신하지 않았다.
