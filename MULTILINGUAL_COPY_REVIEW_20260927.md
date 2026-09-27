# 다국어 표현 검수 및 영문 메인 문구 변경

기준일: 2026-09-27 KST. 대상: BlinkAd 본사이트 `main` / Vercel `blinkad` (ERP 제외).

## 결론과 변경 범위

- `/en`의 문서 제목과 H1을 사용자가 지정한 문자열 그대로 반영했다. 두 문장을 하나의 H1으로 표시한다.
- OG·Twitter 제목도 해당 문서 제목과 일치한다. 메타 설명, 기존 보조 설명, CTA, 다른 페이지의 제목·본문, 한국어·일본어·중국어 문구는 변경하지 않았다.
- 긴 H1에 한해서 본문 흐름에 따라 영역 높이가 늘어나도록 하고 글자 크기를 조정했다. 기존 한국어·일본어·중국어 슬로건에는 기존 레이아웃을 유지한다.
- 다국어 표현은 대체로 의미가 전달되지만, **전체 문구를 무조건 통과로 판정하지 않았다.** 아래 개선 후보와 의미 차이가 남아 있다. 사용자의 ‘제목과 첫 문장만’ 범위를 지키기 위해 검수 결과만 기록했다.

제목:

> BlinkAd | Korea Inbound Tourism Marketing Agency for Foreign Tourists — Google Maps & Google Business Profile

H1:

> BlinkAd is an inbound tourism marketing agency in Korea. We help Korean hospitals, clinics, restaurants and local brands attract foreign tourists through Google Maps and Google Business Profile.

## 검수 방법과 한계

- 한국어 원문과 EN·JA·ZH 사전 797개 항목(실제 빌드 사용 796개), 별도 사이트 공통 문구, 병원·음식점 데모의 언어별 문구를 직접 대조했다. 메인·서비스·업종 마케팅·문의·사례·뉴스 4편 등의 문법, 의미, 고유명사, 수치·예시 고지를 점검했다.
- 3개 언어 × 17 URL = 51페이지의 실제 HTML 응답을 검사했다. 본문 언어, H1 수, canonical, hreflang, JSON-LD, 기존 한국어 글 연결을 확인했다.
- 중국어는 간체 버전이다. 번체 지역별 현지화나 원어민 전문 교정 완료를 의미하지 않는다. 검수는 AI의 원문 대조 및 실제 렌더링 검사다.
- 인사이트 109개 본문은 한국어 원문으로 남아 있으며, 외국어 목록에 이를 안내한다. 이 본문들의 외국어 번역을 검수했다고 주장하지 않는다.
- 수치의 **번역상 보존**과 수치 원자료의 **사실 검증**은 다르다. 45%, 83%, 58%, 3.2배, 41% 등의 기존 마케팅 주장 및 의료 데모의 임상 내용은 이번 작업에서 독립적으로 재검증하지 않았다.
- 사용자가 알려준 GPT 검색 10회 관찰은 전달받은 맥락이다. 이번 작업에서 AI 질의 실험을 수행하거나 변경 후 노출 효과를 측정하지 않았다.

## 표현 검수 결과 — 미수정 항목

아래 권장안은 언어적 검수 의견이며, 승인 전 적용하지 않았다.

| 대상 | 현재 표현 / 확인된 차이 | 판단 및 권장 방향 |
| --- | --- | --- |
| EN 메인·마케팅 연결 문구 | `inbound marketing`, `International marketing` | 문법 오류는 아니지만 일반적인 콘텐츠 마케팅·국제 마케팅으로도 읽힐 수 있다. 이번에 승인한 H1의 `inbound tourism marketing agency in Korea`는 방한 관광객 대상이라는 뜻이 명확하다. 다른 페이지까지 용어를 바꾸는 작업은 미실행. |
| ZH `/aeo` | `从搜索走向向AI提问。` | `走向向`이 겹쳐 어색하다. `从搜索转向向AI提问。` 또는 더 간결한 `从搜索到向AI提问。` 권장. |
| ZH 제품 문의 | `产品导入咨询`, `咨询医疗机构咨询管理` | 뜻은 유추되지만 직역·반복 느낌이 있다. 문맥에 맞게 `产品使用咨询`, `了解医疗机构咨询管理方案` 등으로 정리 권장. |
| JA 제품 문의 | `相談時の案内整理を相談`, `外国語での相談対応を相談` | `相談`의 반복이 부자연스럽다. `相談時の案内を整える`, `外国語の問い合わせ対応について相談する` 등으로 간결화 권장. |
| 뉴스의 인명 | 영어 `Kihyun Kang`, 일·중 `Kang Gihyun`; 대표 이름은 영어 `Soonhyun Kwon`, 일·중 `Kwon Soonhyun` | 성명 순서 차이 자체는 오류가 아니지만, `Kihyun`/`Gihyun`처럼 철자가 달라지는 것은 동일 인물 표기를 흐릴 수 있다. 본인 사용 영문명을 기준으로 통일 필요. 이 작업에서 공식 영문명은 확인 불가. |
| PNJ 관련 뉴스 | 영어 `P&J`, 일·중 `PNJ` | 회사 표기가 언어별로 다르다. 공식 표기를 확인한 뒤 제목·요약·본문·사진 설명 전체를 통일해야 한다. 임의로 한쪽을 정답으로 결정하지 않았다. |
| 중국어 교육 뉴스 | `강기현 이사` → `董事Kang Gihyun` | `董事`는 이사회 이사를 뜻하는 강한 직함이다. 한국어 직급만으로 이사회 구성원 여부를 확정할 수 없어 직함 확인이 필요하다. 확인 전에는 직함을 빼고 이름·교육 담당 역할을 쓰는 편이 덜 단정적이다. |
| 병원 데모 3개 외국어 버전 | 한국어 Q&A의 ‘여드름 치료 시작’이 외국어에서는 ‘InMode 시술 간격’으로 바뀜. 시술 표 구성도 다름 | 단순 번역이 아니라 기존 데모의 내용 차이다. ‘동일 내용의 번역본’으로는 불일치. 별도 콘텐츠 정합화 필요. 데모는 noindex지만 그 자체가 내용 검수 통과를 의미하지 않는다. |
| JA 음식점 데모 | `伝統味噌` / `北村で続く夕食` | ‘전통 장’을 ‘된장’으로 좁힌 번역과 직역투 제목이다. `伝統的な発酵調味料` / `北村散策のあとの夕食` 등으로 보완 권장. |
| ZH 음식점 데모 | 배 콩포트 → `梨子果酱` | 잼으로 의미가 좁혀진다. 조리 방식에 맞는 `糖煮梨` 등으로 조정 권장. |
| 공통 통계 설명 | 영어는 `in the cited study`, `examined` 등 조사 범위를 붙인 경우가 있지만, 일·중은 더 일반화된 문장인 경우가 있음 | `/google-map-marketing`, `/blog-marketing`, `/aeo`에서 조사 대상·기간·조건을 원자료 기준으로 언어별 동일하게 한정하는 후속 검수가 필요하다. 원문 주장 자체의 진위를 이번 번역 검수로 확정하지 않았다. |

사례 화면의 `Illustrative figures` / `サンプル値` / `示例数据`와 실제 고객 성과가 아니라는 설명은 세 언어에 유지되어 있다. Google Business Profile 제품명은 일본어 `ビジネス プロフィール`, 중국어 `商家资料`에 대응하며 공식 언어별 도움말과 대조했다. 띄어쓰기 차이는 있으나 다른 제품으로 오역하지 않았다.

## 근거 위치

- 원문·번역 사전: [영어](i18n/en.json), [일본어](i18n/ja.json), [중국어](i18n/zh.json).
- 원문 뉴스: [constants/news.ts](constants/news.ts). 실제 확인 URL: [영어 교육 뉴스](https://www.blinkad.kr/en/news/medical-tourism-association-aeo-geo-education), [일본어 PNJ 뉴스](https://www.blinkad.kr/ja/news/pnj-google-marketing-seminar), [중국어 AEO](https://www.blinkad.kr/zh/aeo).
- 데모: [병원 소스](app/%28korean%29/hospital-sample/HospitalSampleClient.tsx), [음식점 소스](app/%28korean%29/restaurant-sample/RestaurantSampleClient.tsx). [영어 병원 데모](https://www.blinkad.kr/en/hospital-sample), [일본어 음식점 데모](https://www.blinkad.kr/ja/restaurant-sample), [중국어 음식점 데모](https://www.blinkad.kr/zh/restaurant-sample).
- 공식 제품명 확인: [Google 일본어 도움말](https://support.google.com/business/answer/3038177?hl=ja), [Google 중국어 간체 도움말](https://support.google.com/business/answer/3038177?hl=zh-Hans). 확인일 2026-09-27.

## 구현·검증

- 승인된 문구는 `i18n/site.ts`의 `englishHomeCopy`로 분리했다. 다른 페이지 기본 제목에 영향을 주지 않는다.
- 빌드 시 영문 홈에서만 Hero에 문구를 전달한다. 한국어 홈 소스와 일·중 홈의 호출은 그대로 유지된다.
- `npm run test:languages`: 9/9 통과. 정확한 문구 및 언어별 격리 회귀검사 포함.
- `npx tsc --noEmit`, `npm run build`, `git diff --check`: 통과. 기존 블로그 경고는 이 작업과 무관하며 유지.
- `npm run verify:languages`: 51페이지·한국어 대응 페이지·원문 글 109개 연결·404 격리·사이트맵 통과. 영문 홈의 정확한 title/H1/OG/Twitter 제목 검사 포함.
- `npm run verify:english`: 기존 영어 17페이지 회귀검사 통과.
- 실제 Chrome: 영문 홈 PC, 모바일 390px, 320px에서 두 문장 전체, 보조 설명, 두 CTA의 줄바꿈·잘림·겹침을 확인했다. 문의 전송은 하지 않았다.
- 운영 배포 및 배포 후 확인 결과는 아래에 추가한다.
