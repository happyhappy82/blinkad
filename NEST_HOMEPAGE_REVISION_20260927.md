# 닥터네스트·뷰티네스트 공식홈페이지 6편 수정

기준일: 2026-09-27 KST. [9월 26일 검토](NEST_HOMEPAGE_PREPUBLICATION_REVIEW_20260926.md)를 실제 원고·Notion Posts·홈페이지 코드에 반영했다. 이 문서는 최종 수정 내용과 검증 범위를 기록한다.

## 바꾼 내용

| 글 | 수정한 중심 내용 |
| --- | --- |
| [H1 문의 통합](https://www.blinkad.kr/blog/dagteoneseuteulan-byeong-ueon-sangdam-eul-hanalo-moeuneun-bangsig-jeongli) | 문의 채널 확인 → 이전 답변과 상담 메모 확인 → 등록 안내 활용 순서로 설명했다. |
| [H2 가격·행사](https://www.blinkad.kr/blog/doctornest-consultation-manual-handover) | 공통으로 쓸 등록 안내와 고객별로 이미 보낸 답변의 역할을 분리했다. |
| [H3 외국인 상담](https://www.blinkad.kr/blog/oigug-in-hoanja-yuchi-google-maps-mun-euileul-silje-yeyag-eulo-bakkuneun-sangdam-dongseon) | 원문·번역 비교, 기본 안내, 교대 때 남길 질문을 중심으로 고쳤다. |
| [H4 예약 변경](https://www.blinkad.kr/blog/3-byeong-ueon-allimtog-yeyagsisul-hujaebangmun-mesijineun-eonje-bonaeya-halkka) | 변경 요청 기록 → 예약 프로그램 수정 → 예정 메시지 확인으로 순서를 분명히 했다. |
| [H5 뷰티 고객 기록](https://www.blinkad.kr/blog/byutineseuteulan-miyongsilneilsyab-sangdamgoa-jaebangmun-eul-han-hoamyeon-eseo-boneun-bangsig) | 관리권 잔액 이야기를 빼고 상담·시술 기록과 다음 방문 안내에 집중했다. |
| [H6 광고 문의](https://www.blinkad.kr/blog/byeong-ueon-maketing-goanggo-yuib-eul-sangdamyeyagjaebangmun-eulo-yeongyeolhaneun-bangbeob) | UTM·성과 집계 설명을 줄이고 상담 메모와 실제 예약 기록을 대조하는 방법을 앞세웠다. ‘미확인으로 남겨도 됩니다’를 ‘어디서 보고 연락했는지 모르는 문의는 따로 표시해 두세요’로 고쳤다. |

각 글의 본문 맨 앞 제품 문의 링크 한 개를 유지하고, 끝의 중복 링크와 반복 안내 문단을 삭제했다. 하단 제품 상담 박스에 글별 불편과 문의 후 설명할 내용을 적었다. 문의 폼에는 실제 필수 항목인 사업장명·담당자명·회신 연락처를 명시하고, 불편한 업무 설명은 선택이라고 안내한다.

기존 여섯 주소·제목·원래 발행일·제품 선택·문의 주제는 유지했다. 수정일은 구조화 데이터와 사이트맵에 2026-09-27로 표시한다.

## 제품 설명의 근거와 한계

통합 문의, 등록 안내, 원문·번역, 상담 이력·메모, 예약 전후 메시지, 손님별 상담·시술 기록과 재방문 안내는 제공자의 기존 닥터네스트·뷰티네스트 소개 및 9월 26일 제품 검토 범위에서 확인한 내용만 썼다. 도입 계정에서 기능을 독립적으로 실험한 결과는 아니다. 실제 채널 연결과 PC 이용 조건은 계정·환경을 확인해 안내하도록 했다. 예약 확정, 예약 프로그램과 메시지의 자동 연동, 광고별 예약·매출 자동 집계, 관리권 잔액·차감 관리, 번역 정확도나 성과 보장은 넣지 않았다.

H6의 UTM 설명은 [Google 애널리틱스의 캠페인 URL 안내](https://support.google.com/analytics/answer/10917952?hl=ko)와 범위를 맞췄다. H5의 광고성 연락 관련 문구는 [정보통신망법 제50조](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1025057211), 2026-09-11 시행 조문을 확인했다. 두 링크 모두 2026-09-27 KST에 재확인했다.

## 검증

- Notion 여섯 페이지를 기존 20블록에서 18블록으로 순차 수정하고 본문 전체를 다시 읽어 새 원고와 일치함을 확인했다. 각 글의 저장 결과는 `NEST_HOMEPAGE_H1_SAVE_20260926.json` ~ `NEST_HOMEPAGE_H6_SAVE_20260926.json`에 기록했다. Notion 속성은 Excerpt만 새 첫 문단에 맞춰 바꿨으며 Published 상태와 제목·Slug·Date 등은 보존했다.
- Notion의 Markdown 변환 결과와 `constants/index.ts`의 HTML이 여섯 글 모두 일치한다: [변환 대조](NEST_HOMEPAGE_SYNC_AUDIT_20260927.json). 그 외 정적 블로그 글 103편은 이전 커밋과 항목별로 일치했다.
- `npx tsc --noEmit`, `npm run build`, `git diff --check` 통과. 기존 일부 글의 썸네일 누락 등에 관한 `validate:posts` 경고와 ERP 의존성 경고는 빌드를 막지 않았다.
- 로컬 운영 빌드에서 6개 글 모두 HTTP 200, 본문 문의 링크 1개·하단 버튼 1개, 글별 제품·업무가 맞는 문의창, 390px 모바일 가로 넘침 없음, H5/H6 320px 가로 넘침 없음, 사이트맵 수정일을 확인했다: [브라우저 검증](NEST_HOMEPAGE_BROWSER_AUDIT_20260927.json).
- 실제 문의는 발송하지 않았다. 이전 UI 검증에서도 전송은 모의 응답으로 대체했으므로 CRM 저장·담당자 알림은 별도 확인이 남아 있다.

## 운영 반영

커밋 `aa6cc4d`를 main에 push하고 BlinkAd 운영 프로젝트에 배포했다. Vercel 운영 배포는 `https://blinkad-he1yiz7m6-aijeonginsight-1976s-projects.vercel.app`이며 `https://www.blinkad.kr`에 연결됐다.

운영 사이트에서 여섯 글 모두 HTTP 200, 수정 문장과 글별 상담 박스 노출, 본문 문의 링크 한 개와 하단 버튼 한 개, 각 글에 맞는 제품·업무 선택, 390px·320px 화면 가로 넘침 없음, 사이트맵 수정일 2026-09-27, 브라우저 오류 없음까지 확인했다: [운영 브라우저 검증](NEST_HOMEPAGE_PRODUCTION_AUDIT_20260927.json). 공개 페이지의 문의 전송은 시험하지 않았으며 실제 외부 문의 발송은 0건이다.
