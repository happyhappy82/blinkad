# 닥터네스트·뷰티네스트 프리미엄콘텐츠 8편 작성·저장 기록

확인일: 2026-09-26 · 저장 위치: 블링크애드 프리미엄 콘텐츠 Notion DB · 상태: 전체 Review / 네이버 미발행 / 발행일 미지정

사용자 요청에 따라 P2~P8을 한 편씩 작성 → 사실·구성·문체 검수 → Notion 저장 → 본문 재조회 검증 순서로 완료했다. 다음 편은 이전 편 저장 검증이 끝난 뒤 작성했다. 기존 P1은 수정하지 않았다.

## 원고 목록

| 순서 | 제목·Notion 링크 | 글별 핵심 내용 | 본문 글자 수 | 상태 |
|---|---|---|---:|---|
| P1 | [퇴근 후 들어온 외국인 환자 문의, 아침에 답해도 괜찮을까?](https://app.notion.com/p/3e6753ebc013818fa249d6a5a754aba7) | 야간 접수·다음 근무 인계 (9/25 작성본 유지) | 5,262 | Review |
| P2 | [실장님이 퇴사하면, 진행 중인 환자 상담은 누가 이어받을까?](https://app.notion.com/p/3e7753ebc01381829e26edbc934a97fd) | 퇴사 전 미해결 상담·마지막 약속·인계 수락 | 4,127 | Review |
| P3 | [원하는 머리 사진까지 보냈던 손님은 왜 예약하지 않았을까?](https://app.notion.com/p/3e7753ebc01381809043cf75229c0e8a) | 사진 문의→현재 상태→가격·시간→예약 방법 | 4,099 | Review |
| P4 | [외국인 손님과 번역기로 대화했는데 원하는 스타일은 서로 다르게 이해했다면](https://app.notion.com/p/3e7753ebc01381dda494e631879a83e9) | 번역 뒤 스타일 의미·원치 않는 변화·최종 확인 | 4,197 | Review |
| P5 | [시술 후 안내문을 줬는데도 같은 질문을 다시 받는다면](https://app.notion.com/p/3e7753ebc0138179a739e19880403767) | 귀가 전 설명·시점별 재안내·의료진 확인 | 4,091 | Review |
| P6 | [네일·왁싱 손님에게 “다음에 또 오세요”만 말하고 있나요?](https://app.notion.com/p/3e7753ebc01381839dfffa34a3cb08bb) | 방문일과 연락일 구분·고객이 요청한 다음 안내 | 4,077 | Review |
| P7 | [피부관리권을 끊고 안 오는 손님에게는 뭐라고 연락해야 할까?](https://app.notion.com/p/3e7753ebc01381ac869bc344b23df01e) | 관리권 이용 중단 이유·불편 접수·후속 약속 | 4,162 | Review |
| P8 | [AI가 답해도 되는 질문, 직원이 직접 답해야 하는 질문](https://app.notion.com/p/AI-3e7753ebc013816b8436e023569dfd29) | 자동 안내·직원 확인·전문 판단·예외 질문 시험 | 4,348 | Review |

글자 수는 Markdown·링크 포함이며 분량 목표나 독서시간 계산값이 아니다. 전체 글에는 각각 FAQ 3개가 있고, Notion에서는 질문을 토글로 저장했다.

## 검수한 내용

- 승인 제목 8개·서로 다른 원고/Notion 페이지 8개 확인. 기존 P1의 SHA-256 보존.
- 새 원고마다 실제 제품 기능과 운영 제안·가상 문구/양식을 구분. 병원 실무 경험·고객 사례·예약 전환 성과를 창작하지 않음.
- 가격·시술 결과·회복 기간·일률적 재방문 주기·자동 예약 확정·개인 계정 수집·자동 위험 감지·관리권 결제 연동을 기능으로 주장하지 않음.
- P2/P1, P3/P4, P6/P7의 의도를 나누고 긴 본문 문단의 완전 일치 중복 0건 확인. 이는 의미 유사도가 0이라는 주장이 아님.
- 원고별 제목·요약·slug·본문·표·FAQ 하위 블록·링크를 저장 직후 API로 다시 읽어 대조. 전체 8편의 Review·네이버 발행 false·발행일 없음 최종 확인.
- 모든 외부 CTA에 p01_footer~p08_footer UTM 포함. P2~P8 삽입 링크 직접 GET 성공.
- humanize-korean 규칙에 따라 문체를 검토하고 원고별 소수 문장을 윤문. 별도 _workspace에 원문·윤문본·수정 기록 보존. 전용 verify_change_rate.py가 없어 변경률은 SequenceMatcher 참고값이며 공식 검증값으로 주장하지 않음.

## 홈페이지 연결에서 반영한 변경

- P2의 H2 인수인계 전용 예정 URL은 404. 실제 공개 H1의 상담 기록 설명으로 연결하고 링크 문구도 현재 내용에 맞춤. H2 신규 글을 작성했다고 보고하지 않음.
- P5의 H4 기존 URL은 제목 장식 제거 후 404. 현재 sitemap의 새 주소 `/blog/3-byeong-ueon-allimtog-yeyagsisul-hujaebangmun-mesijineun-eonje-bonaeya-halkka`로 연결, 공개 본문 HTTP 200 확인.
- P3·P4·P6·P7은 H5 실제 공개 소개로 연결. 미구현 절 앵커나 세부 실무 예시가 홈페이지에 이미 있는 것처럼 약속하지 않음.
- H1에는 공식 대행사 도입 문의 CTA가 추가된 현재 내용을 확인. H5·H4의 제품별 문의 문구·상세 본문 보강은 별도 후속 작업이며 이 원고 저장에서 변경하지 않음.

## 근거와 확인 한계

- [닥터네스트 공식 소개](https://www.blinkad.kr/blog/dagteoneseuteulan-byeong-ueon-sangdam-eul-hanalo-moeuneun-bangsig-jeongli): 2026-09-26 직접 GET 200. 등록 기본 안내·통합 상담·상담 이력·전문 판단 제외 범위. 과거 출시 문구는 인용하지 않음.
- [뷰티네스트 공식 소개](https://www.blinkad.kr/blog/byutineseuteulan-miyongsilneilsyab-sangdamgoa-jaebangmun-eul-han-hoamyeon-eseo-boneun-bangsig): 같은 날 직접 GET 200. 번역·원문·고객 기록·재방문 안내·PC 기준. 실제 운영 계정에서 기능을 시험한 결과는 아님.
- [병원 메시지 운영 글](https://www.blinkad.kr/blog/3-byeong-ueon-allimtog-yeyagsisul-hujaebangmun-mesijineun-eonje-bonaeya-halkka): 같은 날 새 URL과 공개 내용 확인. 이 글의 재방문 성과·단정적 효과 표현은 신규 원고의 근거로 재사용하지 않음.
- 사용자 제공 `닥터네스트_상품설명서_정영훈.pdf` 3·6·7~9쪽: 이전 작업에서 12쪽 전체 확인. 상담 매뉴얼·메모·사후 메시지 기능 설명 참고. 위챗·구글 예약 관련 충돌 사항은 소구하지 않음.
- [정보통신망법 제50조](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1025057211): 2026-09-26 확인, 시행 2026-09-11. P6·P7의 광고 수신동의/거부·시간·표시 기준에 한정해 참고. 개별 메시지의 적법성을 보장하지 않음.
- [KISA 안내서 제7차 개정본 공지](https://www.kisa.kr/401/form?page=1&postSeq=3608): 2026-03-04 공지 및 주요 변경 사항 확인. 첨부 PDF 전문을 읽었다고 주장하지 않음.

## 저장 범위

이번에 완료한 작업은 네이버 프리미엄콘텐츠 8편의 초안 작성과 Notion 저장이다. 네이버 발행·예약, 홈페이지 본문/폼 수정, 고객 연락, Notion 작업큐와 context 변경은 하지 않았다. 오픈애즈 6편과 홈페이지 6편 작업은 이번 배치에 포함하지 않았다.

로컬 원고 `NEST_PREMIUM_P2_DRAFT_20260926.md`~`P8`, 저장·검증 기록 `NEST_PREMIUM_P2_SAVE_20260926.json`~`P8`에 원고별 근거·예외·Notion URL·해시·검수 결과를 보존했다. 작업 이력은 Issue235 및 [blinkad-work-tracker 스킬](/Users/mcbookpro/.agents/skills/blinkad-work-tracker/SKILL.md)로 기록했다.
