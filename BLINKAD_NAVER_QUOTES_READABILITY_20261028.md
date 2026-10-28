# 네이버 신규5편 인용구·본문 간격 수정 — 2026-10-28

사용자 요청에 따라 방금 등록한5편의 소제목 각4개/총20개를 네이버 실제 세로선 인용구로 바꾸고, 기존 본문 문단 경계의 여백을 정리했다. 같은 contentId를 수정했으며 제목/본문문장/순서·표·링크/UTM·썸네일·무료·작성자·예약/기존발행일시를 보존했다. 새글등록·일정변경·다른18글수정은 수행하지 않았다.

| 원고 | 현재상태 | 인용구 | 수정본 |
|---|---|---|---|
| N02 · 병원 외국인 마케팅 경쟁분석, 어떤 병원과 비교해야 할까요? | 발행 | 4개 | [현재글](https://contents.premium.naver.com/blinkad/blink/contents/261028123905601ev) |
| N03 · 병원 다국어 홈페이지 제작, 어떤 진료·언어부터 준비해야 할까요? | reserved | 4개 | [현재글](https://contents.premium.naver.com/blinkad/blink/contents/preview_reserved/261028124221710gm) |
| N01 · 프랜차이즈 구글맵 관리, 이렇게 하는 게 가장 효율적입니다 | reserved | 4개 | [현재글](https://contents.premium.naver.com/blinkad/blink/contents/preview_reserved/261028124403773rx) |
| N05 · 외국인 마케팅, 구글광고도 해야 할까요? | reserved | 4개 | [현재글](https://contents.premium.naver.com/blinkad/blink/contents/preview_reserved/261028124654504ui) |
| N06 · 영어권 고객 유치에 레딧 마케팅이 중요한 이유 | reserved | 4개 | [현재글](https://contents.premium.naver.com/blinkad/blink/contents/preview_reserved/261028124832817qi) |

- Aside가5편을실제저장/재열람해네이티브컴포넌트와텍스트/문단/링크/표·설정을확인했다. Codex는ID/소제목20문구/컴포넌트종류와검증값을대조하고각글첫소제목/본문구간캡처5개를직접열어가독성을확인했다. 전체rawHTML동일성/전문전체시각검토로확대주장하지않는다.
- N03표의최초false검증은editor innerText와reader textContent의템플릿앞뒤공백차이였다. 실제5행3열/15셀 rendered innerText와원래배열이정확일치했다. N03-table-verification.json에셀별증거를보존했다.
- 최초N01캡처본문단락이밀집해root피드백후기존문단경계빈줄을추가하고캡처를갱신했다. 비어있지않은문단텍스트/순서와표/인용내부를보존해개행을조정했다.
- N02 표15셀과본문2304자·링크4개는 root가공개서버HTML/원문MD와직접비교해일치확인했다. 본문비교시공백과빈문단용U+200B14개만제외했다. 초기링크false는구독위젯만잡은baseline선택오류였다.
- N02는오늘13시예약으로이미발행된같은글을수정했으며발행취소/재등록/발행일시이동을하지않았다.
- 내용정본MD17개SHA·비대상12source fullitem불변. 로컬원고뷰본문은의미정본으로보존하고네이버실제서식은저장화면캡처/현URL로연결했다. 홈페이지/OA/Notion/계정·운영배포변경0.
- 수정본5편보기: /Users/mcbookpro/Downloads/블링크애드_6키워드_3채널_주제기획_20261027/네이버프리미엄_예약등록_20261028/서식수정/index.html
- 최종검증: docs naver-five-quote-format-final-verification-20261028.json
