# 닥터네스트·뷰티네스트 홈페이지와 문의 연결

2026-09-26 KST · 홈페이지 6편 집필·교정 및 문의 화면 구현 · 운영 반영·공개 주소 검증 완료

오픈애즈에서 문제와 개선 팁을 읽고, 홈페이지에서 제품을 적용할 업무를 확인한 뒤 같은 글에서 도입 상담을 신청하도록 연결했다. 글은 H1부터 H6까지 한 편씩 작성·검토했다. 각각 4개 소제목, 약 2,100자 안팎이며 장문 대화 예시·반복 FAQ·근거 없는 성과 수치를 넣지 않았다.

## 완성한 홈페이지 글

| 글 | 제목·공개 주소 | 주요 연결 원고 |
| --- | --- | --- |
| H1 | [카카오톡·DM으로 흩어진 병원 문의, 한곳에서 관리하려면](https://www.blinkad.kr/blog/dagteoneseuteulan-byeong-ueon-sangdam-eul-hanalo-moeuneun-bangsig-jeongli) | O1 |
| H2 | [가격·행사 안내가 직원마다 다를 때, 상담 기준을 맞추는 방법](https://www.blinkad.kr/blog/doctornest-consultation-manual-handover) | O2·O6 |
| H3 | [외국인 환자 문의, 번역부터 다음 상담까지 어떻게 이어갈까?](https://www.blinkad.kr/blog/oigug-in-hoanja-yuchi-google-maps-mun-euileul-silje-yeyag-eulo-bakkuneun-sangdam-dongseon) | P1 |
| H4 | [예약 확인·변경 연락을 놓치지 않으려면 무엇을 정리해야 할까?](https://www.blinkad.kr/blog/3-byeong-ueon-allimtog-yeyagsisul-hujaebangmun-mesijineun-eonje-bonaeya-halkka) | O3 |
| H5 | [뷰티 매장 고객관리, 상담 기록과 다음 안내를 함께 챙기는 법](https://www.blinkad.kr/blog/byutineseuteulan-miyongsilneilsyab-sangdamgoa-jaebangmun-eul-han-hoamyeon-eseo-boneun-bangsig) | O4 |
| H6 | [광고로 들어온 문의, 예약까지 어디에 기록해야 할까?](https://www.blinkad.kr/blog/byeong-ueon-maketing-goanggo-yuib-eul-sangdamyeyagjaebangmun-eulo-yeongyeolhaneun-bangbeob) | O5 |

기존 다섯 글은 공개 주소와 원래 발행일을 유지했다. H2는 신규 글이다. 본문 수정일은 구조화 데이터에 2026-09-26으로 표시한다. Notion Posts의 기존 페이지 다섯 개를 수정하고 H2를 한 개 생성했다. 사용자 작업큐와 프리미엄 원고는 변경하지 않았다. 홈페이지 원고의 저장·재조회 결과는 각 `NEST_HOMEPAGE_H*_SAVE_20260926.json`에 기록한다.

## 문의 화면

- 각 글 첫 부분과 마지막 링크, 하단 버튼에서 제품 도입 상담창을 연다. 링크를 새 탭에서 열면 같은 제품의 `/contact?service=…&topic=…` 화면으로 이동한다.
- 관심 제품과 업무를 미리 표시하고 사용자가 바꿀 수 있게 했다. 사업장·담당자·회신 연락처는 필수, 채널·불편한 업무는 선택이다.
- 기존 문의 접수 경로를 재사용한다. 새 필드가 기존 수신 자동화에서 별도 매핑되지 않아도 확인할 수 있도록 제품·사업장·관심 업무·홈페이지 글·외부 원고 ID를 기존 `message`에도 함께 담는다.
- `utm_content`를 제출 데이터에 추가했다. 내부 문의 링크에는 새 UTM을 넣지 않는다. 선택 제품을 바꿔도 원래 홈페이지 글 ID는 보존한다.
- 전송 중 중복 요청을 막고, 실패하면 입력을 유지한다. 정상 HTTP 응답을 받은 경우에만 접수 안내와 `nest_inquiry_accepted` 이벤트를 표시한다. 열기·작성 시작·접수 응답 이벤트를 구분한다.
- 일반 방문자의 기존 SEO 문의 화면은 유지한다. 제품별 화면에는 24시간 회신 등의 약속을 넣지 않았다.

## 검증

`npx tsc --noEmit`, `npm run build`, `git diff --check` 통과. Chromium에서 여섯 글의 제품/주제, 직접 문의 URL, 일반 문의 화면, 320px·390px 모바일 및 데스크톱 화면을 확인했다. 잘못된 전화번호, HTTP 오류, 재시도, 연속 클릭, 제품 변경, 원글 정보·UTM 전달을 검사했다. 추가한 분석 이벤트에는 이름·전화번호·문의 본문이 들어가지 않는다.

브라우저의 접수 요청은 테스트 응답으로 대체했다. 실제 문의 수신처에 테스트 연락을 보내지는 않았다. 따라서 Make 이후 CRM 저장·담당자 알림은 이번에 검증한 항목이 아니다. `nest_inquiry_accepted`는 수신 HTTP 응답을 뜻하며 실제 유효 문의나 예약 성과로 세면 안 된다. GA4 보고서의 이벤트 설정·운영 수집 여부도 별도 확인 대상이다.

Notion 자동 동기화의 HTML 변환 결과와 정적 게시글 데이터가 6편 모두 일치했다. H1에 예전 문의 문구와 내부 UTM을 다시 삽입하던 처리를 제거했다. 이번 여섯 글 이외의 기존 게시글 데이터는 그대로 유지했다.

## 사실 확인과 문체 검토

기능 설명은 작업 시작 시 확인한 닥터네스트·뷰티네스트 제공자 소개와 기존 상품 검토 범위에 한정했다. 상담 통합, 등록 안내, 번역·원문, 상담/시술 기록, 후속 메시지를 다룬다. 제품 운영 계정에서 기능을 독립적으로 시험한 것은 아니므로 특정 채널의 현재 연결 가능 여부와 설정 조건은 도입 상담에서 확인하도록 썼다.

자동 예약 확정, 광고별 매출 자동 귀속, 관리권 잔액·차감 관리, 모바일 지원, 번역 정확도 보장, 매출·재방문 증가 보장은 쓰지 않았다. 관리권 문의는 기능 제한을 늘어놓는 문단 대신 현재 결제·상담 업무 중 무엇을 정리할지 문의하는 내용으로 연결했다. 문체 검토는 직접 읽고 고친 결과이며 AI 판별 점수를 산출하지 않았다.

출처 확인일은 2026-09-26이다. 제품 제공자 소개는 위 H1·H5의 변경 전 공개 원문 및 Notion 원본을 작업 시작 시 백업해 확인했다. [Google 캠페인 URL 안내](https://support.google.com/analytics/answer/10917952?hl=ko)는 UTM으로 캠페인 유입을 구분하는 설명의 근거다. H5 광고성 연락의 확인 항목은 [정보통신망법 제50조](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1025057211)(2026-09-11 시행)에 근거한다. 업무 순서와 기록 방법은 운영 제안이며 성과 검증 결과가 아니다.

## 공개 범위

홈페이지 6개 주소의 HTTP 200·canonical·제품 문의 화면을 운영 사이트에서 확인했다. 오픈애즈 여섯 원고는 최종 홈페이지에 맞춰 마지막 문단을 수정하고 Notion 전체 본문과 속성을 재조회했다. O2와 O6는 새 H2로 연결했다. 모두 `Review`·발행일 없음이며 오픈애즈와 네이버 프리미엄콘텐츠에는 발행하지 않았다.

기획: [aeo-content-planning](/Users/mcbookpro/.codex/skills/aeo-content-planning/SKILL.md). 윤문: [humanize-korean](/Users/mcbookpro/.codex/skills/humanize-korean/SKILL.md). 업무 기록: [blinkad-work-tracker](/Users/mcbookpro/.agents/skills/blinkad-work-tracker/SKILL.md), 기존 Issue235에 기록.

운영 반영 커밋: `2f936e1`. Vercel `dpl_51DcJf6zpbe9KrC8b7Wqg4UsJ6Kf` Ready, `www.blinkad.kr` alias 확인. 운영 브라우저 검사 완료: 2026-09-26 19:59 KST. [브라우저 검증](NEST_HOMEPAGE_BROWSER_AUDIT_20260926.json) · [Notion 자동 동기화 대조](NEST_HOMEPAGE_SYNC_AUDIT_20260926.json) · [편별 원문 검토](NEST_HOMEPAGE_EDITORIAL_AUDIT_20260926.json) · [오픈애즈 최종 연결 검증](NEST_OPENADS_FINAL_FUNNEL_AUDIT_20260926.json).
