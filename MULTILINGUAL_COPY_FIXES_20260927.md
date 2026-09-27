# 다국어 표현 보완 및 데모 정합화

기준일: 2026-09-27 KST. 대상: BlinkAd 본사이트 `main` / Vercel `blinkad`. ERP·Notion·고객 사이트는 변경하지 않음.

이전 [검수 보고서](MULTILINGUAL_COPY_REVIEW_20260927.md)의 개선 후보를 사용자의 “보완할 부분 진행” 요청에 따라 적용했다.

## 반영 사항

- 승인된 `/en` 문서 제목·H1·OG/Twitter 제목을 그대로 유지했다. 인사이트 한국어 원문 109개, 원문 URL, canonical/hreflang, 문의 수신 구조는 변경하지 않았다.
- 외국인마케팅을 가리키던 영어 메뉴·제목의 모호한 `International marketing`, `inbound marketing`을 `Inbound tourism marketing`으로 구체화했다. 별도 의미인 ‘해외 마케팅’은 바꾸지 않았다.
- 중국어 `走向向`, 제품 문의의 직역·반복 표현, 일본어 CTA의 `相談` 반복을 정리했다. 일부 CTA는 현재 공개 외국어 기사에서 쓰이지 않는 사전 항목이다.
- 회사명은 공식 홈페이지의 `PNJ`로 통일했다. 인명은 **공식 영문명 확인 완료가 아니라 기존 영어 사이트의 표시명** `Soonhyun Kwon`, `Kihyun Kang`을 세 언어에서 일관되게 사용한 것이다. 중국어 `董事`는 이사회 구성원으로 단정하지 않도록 제거하고 교육 담당 역할을 유지했다.
- 병원 데모의 질문을 한국어와 동일하게 여드름 시작 → 보톡스 지속기간 → 기미로 맞췄다. 시술표도 흉터 → 여드름 → 보톡스 → 기미로 통일했다. 기본 정보·방문 안내·의료진 설명의 의미와 순서를 맞췄다.
- 음식점 데모의 ‘전통 장’을 된장으로 한정하던 일본어, 배 콩포트를 잼으로 옮긴 중국어, 바 좌석이 워크인 전용이라는 영문 오역을 수정했다.
- 두 데모의 4개 언어 모두 상단에 가상 정보·예약 미제공 안내를 추가했다. 기존 noindex는 유지했다. 의료 내용은 원문 정합화 대상이며 임상 감수 완료를 의미하지 않는다.
- 실제 Chrome에서 발견한 데모의 잘못된 투명도 클래스(`/72` 등)를 Tailwind 3에서 지원되는 임의값 표기로 수정했다. 병원 데모의 모바일 헤더를 문서 흐름 안에 배치하고 제목 크기를 조정해 긴 영문 메뉴가 본문을 가리지 않게 했다. 한국어 데모에도 공통 표시 개선이 적용된다.

## 외국어 통계 문구의 원자료 대조

수치 자체가 BlinkAd 고객 성과이거나 노출 보장이라는 뜻이 아니다. 한국어 본사이트의 기존 마케팅 통계 문구는 이번 외국어 사전 보완 범위에서 변경하지 않았다.

| 항목 | 확인 및 적용 | 원자료 |
| --- | --- | --- |
| PNJ 회사명 | 공식 소개 페이지의 `PNJ INTRODUCTION` 및 피엔제이·박준뷰티랩 관계 확인 | [PNJ 공식 소개](https://www.parkjun.com/park/sub01/sub01.php) |
| 6% → 45% | BrightLocal의 2025·2026년 미국 소비자 조사임을 명시. 2026년 표본은 성인 1,002명. 세계 전체 소비자로 일반화하지 않음 | [Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/) |
| 83% / 14% | 2026년 2월 Local Falcon이 추적하는 식당 표본의 ChatGPT/Google 미등장 결과. 전 세계 식당의 비율이나 프로필 미정비의 인과 증거로 서술하지 않음 | [Local Falcon 연구·방법·한계](https://www.localfalcon.com/blog/the-ai-visibility-crisis-why-83-percent-of-restaurants-dont-exist-in-chatgpt) |
| 58% | 2024년 12월 발표, ChatGPT Search 지역 검색 800건에서 **기록한 출처** 중 업체 웹사이트 비중. 답변 수 비율이 아님. FAQ에도 같은 단위를 적용 | [BrightLocal 원문](https://www.brightlocal.com/research/uncovering-chatgpt-search-sources/) |
| 54.5% / 39.6% | 비교는 2025년 **12월과 3월**이지 전년 대비가 아님. PDF 9쪽 표의 기준은 검색 이용자 989명·990명(전체 각 1,000명과 구별), 10~59세, 최근 3개월 이용 경험·중복응답. 원문 표를 이미지로 확인 | [Opensurvey 원본 PDF](https://docs.opensurvey.co.kr/report/opensurvey-trend-ai-search-2026.pdf), [조사 설계 안내](https://blog.opensurvey.co.kr/trendreport/ai-search-2026/) |
| 최대 41% | 2024 GEO 논문 표 1의 최상위 방법·위치 가중 가시성 지표 개선치. ‘통계만 넣으면 인용률 41% 증가’나 트래픽 증가 보장으로 쓰지 않음 | [GEO 논문 v3, 표 1](https://arxiv.org/html/2311.09735v3) |
| 브랜드 멘션 상관 | Ahrefs의 Google AI Overviews 대상 연구로 한정. 전체 AI에 적용되는 3배 성과 법칙·인과 관계로 표현하지 않음 | [Ahrefs 원문](https://ahrefs.com/blog/ai-overview-brand-correlation/) |
| 3.2배 | ConvertMate 자사 분석의 보고 수치임을 명시하고 독립 검증·성과 보장이 아님을 같은 설명에 고지. 원시 데이터로 독립 재현한 결과가 아님 | [ConvertMate 원문](https://www.convertmate.io/research/ai-visibility-2026) |

PDF 스킬은 Opensurvey의 조사 분모·비교 기간을 원본 표와 대조하는 데 사용했다. 통계 검증은 발표 자료가 실제로 무엇을 보고했는지에 대한 검증이며, 업체 연구 원시 데이터의 독립 재현을 뜻하지 않는다. ConvertMate 원문은 검색 수집본에서 주장 확인, 직접 웹 도구 열기는 실패했다.

## 검증

- 사전 변경: EN 32개, JA 19개, ZH 24개 값. 키 797개 및 실제 빌드 사용 796개 유지. 뉴스 HTML 태그 구조 보존.
- `npm run test:languages`: 13/13 통과. 이름·회사명·오역 방지·통계 조건·데모 질문/시술 순서·투명도 클래스·승인 H1 보호 포함.
- `npx tsc --noEmit`, `npm run build`, `git diff --check`: 통과. 기존 블로그·libheif·Browserslist 경고는 이 변경과 무관하다.
- 로컬 `verify:languages`: 51개 외국어 페이지 및 한국어 대응 링크·메타데이터·JSON-LD·원문 109개·404·사이트맵 검사 통과. `verify:english`: 기존 영어 17개 페이지 회귀검사 통과. 문의 전송 없음.
- 실제 Chrome: 영문 병원 데모 PC에서 색상 문제 발견 후 수정, 수정본 모바일 390px/320px에서 안내·헤더·H1 잘림/겹침 없음 확인. 일본어 음식점 데모 320px 및 중국어 AEO 통계 카드 390px 줄바꿈·설명 표시 확인.

## 남은 한계

- 두 인물의 본인 사용 영문명은 사용자 확인 대기. 현재는 기존 EN 표기를 표시 기준으로 사용한다.
- 원어민 감수나 모든 의료 내용의 임상 검증을 완료했다고 주장하지 않는다.
- 한국어 인사이트 109개를 이번 작업에서 번역·발행하지 않았다. 외국어 목록에는 한국어 원문 안내가 유지된다.
- 이 수정만으로 GPT 노출이 늘어났다고 판단하지 않는다. AI 검색 질의 실험·유료 API 측정은 실행하지 않았다.

## 운영 반영

검증 및 배포 진행 중.
