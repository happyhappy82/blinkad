# 묶음3 H06·H04 집필 근거

확인일: **2026-10-27 KST**. 현행 topic-plan.json의 H06/H04 제목·중심 결정·본문 방향·링크 정책을 읽고 필요한 1차자료5개를 재조회했다. 이 문서는 근거 메모이며 완성 원고·플랫폼·설정·Git을 변경하지 않았다.

## 출처와 확인 사실

| ID | 공식·1차 출처 | 확인 사실 | 사용할 범위·한계 |
|---|---|---|---|
| B1 | [Pew, 미국인의 소셜미디어 이용2026](https://www.pewresearch.org/internet/fact-sheet/social-media/) | 10/19발표. 미국성인5,511명,1/30~6/18조사. Reddit ever-use25%. | 미국에서의 이용 기반 근거. 영어권전체·서양인·의료관광객의 이용률이나 구매율이 아님. |
| B2 | [Reddit Path to Purchase2026](https://www.business.reddit.com/blog/research-2026-half-of-us-shoppers-verify-ai-recommendations-on-reddit-before-they-buy) | 6/22발표. 미국·영국에서 추천을 다시 확인하고 선택지·경험을 비교한다는 조사. 5월Attest,18~65세월간소셜·LLM·전자상거래이용자. | 공급사 마케팅 조사로 구분. 일반인구 독립조사·한국방문·업종별예약성과로 확대하지 않음. 수치 인용 없이 맥락 설명 가능. |
| B3 | [Google AI 기능과 웹사이트](https://developers.google.com/search/docs/appearance/ai-features) | Google AI검색은 기존 검색의 기술·품질 요건을 사용하며 색인·스니펫 자격 등이 필요하나 게재는 보장되지 않음. 검색 접근과 일부 다른 시스템의 학습·grounding 제어를 구분. | Google의 Overviews/AI Mode 범위. 모든 AI의 기술요건이 아님. |
| B4 | [Google 크롤러: Googlebot·Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended) | 10/15갱신. Google-Extended는 일부 Gemini학습·grounding 사용을 제어하는 robots제품토큰이며 Google검색게재·순위에 영향을 주지 않는다고 설명. | 모든AI·모든Gemini용도 차단이 아님. 별도 HTTP요청 user-agent가 있는 크롤러로 설명하지 않음. |
| B5 | [Google robots 메타·미리보기 설정](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) | noindex는 검색결과제외. nosnippet은검색스니펫/영상미리보기를막고AI검색의직접입력사용도제한. max-snippet은텍스트분량, data-nosnippet은텍스트부분을다룸. | 규칙을 읽으려면 크롤러가 페이지에 접근할 수 있어야 함. 다른검색엔진·AI가동일하게처리한다고일반화하지 않음. |

이전 [레딧 필요성 근거 메모](reddit-importance-evidence.md)의 모집단·공급사 조사 한계를 유지한다. Google제휴는 이전 메모의 기존 공식 근거를 재사용할 수 있으나 이번에는 새 근거5개에 추가하지 않았다.

## H06 — 초기 마케팅 계획에서 레딧을 확인할 이유

- 유지할 질문: 영어권 고객을 유치할 계획을 세울 때 왜 레딧의 질문·후기를 처음부터 봐야 하는가.
- `레딧에서 고객의 질문과 후기를 확인하는 일은 필수입니다`는 **고객조사를 권하는 편집상 판단**으로 쓸 수 있다. 모든 영어권 고객이 레딧을 이용한다거나 어떤 업종이든 레딧 게시를 해야 한다는 실증 결론으로 바꾸지 않는다.
- B1은 미국 내 이용 기반, B2는 경험 비교·추천 검증의 맥락을 각각 뒷받침한다. 두 자료를 합쳐 레딧이 실제 한국 방문객의 필수 구매 경로라는 비율을 만들지 않는다.
- 광고·공식홈페이지는 기업이 제공한 정보를 보여주고 이용자 간 대화에는 다른 경험·비교·확인 질문이 나타날 수 있다는 방향으로 전개한다. 어느 쪽이 항상 더 진실하다고 결론내리지 않는다.
- 목표 국가와 업종의 실제 대화가 있는지, 무엇을 묻고 비교하는지 관측해야 한다. **이번 공식자료 재확인만으로 실제 업종 토론 표본을 새로 확인한 것은 아니다.** 실게시물 사례가 필요하면 별도 공개 표본을 읽고 근거 URL·시점·관측 범위를 남긴다. 실제 사례를 아직 읽지 않았다면 수치 없는 상황 예시로 명시한다.
- 자사 서비스·납품물·댓글 건수·집계법으로 중심 답을 되돌리지 않는다. 현재 H06 브리프의 직접 서비스·상담 CTA없음과 보조 관련읽기1개 정책을 유지한다.

## H04 — 검색과 일부 학습·grounding 허용을 나눠 설명

질문의 직접 답은 **Google AI 검색에 보이기 위해 Google-Extended가 다루는 학습·grounding 사용을 일괄 허용해야 하는 것은 아니다**라는 범위다. Google 검색 자격과 다른 Gemini 제품의 콘텐츠 사용 범위는 구분해서 결정한다. 검색에 보인다고 모든 AI 학습을 허용한 증거도 아니고, 접근 허용만으로 인용되는 것도 아니다. [B3,B4]

| 확인할 대상 | 무엇을 다루는가 | 혼동하지 않을 것 |
|---|---|---|
| Googlebot 접근 | Google 검색과 그 AI 기능을 위한 검색 크롤링 | 허용=검색/AI인용 보장 아님 |
| Google-Extended | Gemini Apps·Vertex AI의 일부 향후학습·grounding 사용 | 모든 AI나모든학습·현재검색결과를통제하는전체스위치 아님 |
| nosnippet·max-snippet | 검색 미리보기와 설명된 AI검색 직접입력사용의 제한 | 일부정보만제한하면서모든AI학습을막는설정이 아님 |
| data-nosnippet | 페이지의 지정 텍스트 부분을 검색 스니펫에서 제외 | 다른 위치에 제공한 구조화데이터까지 모두차단된다고단정하지 않음 |
| noindex | 페이지를 검색결과에서 제외 | 일반검색은남기고학습만막는설정 아님 |

- Google-Extended는 독립 제품 토큰이며, 실제 요청에서는 기존 Google user-agent를 사용한다. 서버 로그에서 `Google-Extended`라는 별도 방문자만 찾으면 된다고 설명하지 않는다.
- Google-Extended 설명에는 **학습과 grounding이 함께 포함**된다. `Gemini의학습만차단하고grounding은반드시유지하는개별스위치`처럼 쓰지 않는다.
- nosnippet은 페이지가 검색에서 사라진다는 noindex와 다르다. 미리보기를 바꾸는 영향과 실제 검색 게재 상태는 나누어 설명한다.
- 메타/HTTP헤더 규칙을 적용하려면 페이지에서 읽을 수 있어야 한다. 크롤링을 막고 noindex를 넣으면 바로 모두 처리된다고 설명하지 않는다.
- 글은 대표·마케팅 담당자가 원하는 공개·사용 범위를 개발 담당에게 전달하도록 돕는다. 복사해서 전체 사이트에 붙일 차단 명령이나 실제 설정 일괄 변경을 하지 않는다.
- 기존 검색 접근,원하는미리보기범위,일부Gemini제품사용정책을 표로 정리하고 개발 담당과 반영·재확인을 나누는 실무 제안은 Google 의무가 아닌 편집상 운영 권고로 표시한다.

## 검증 범위

공식5문서의 가용 본문을 다시 읽었다. 자사사이트·고객사이트의현재robots/메타/HTTP헤더·로그·검색색인·AI답변을 조사하지 않았다. B1/B2는 사용 배경, B3~B5는 플랫폼 기능의 근거이며 실제 계약·성과의 증거가 아니다. 원고·광고·플랫폼·배포 변경0.
