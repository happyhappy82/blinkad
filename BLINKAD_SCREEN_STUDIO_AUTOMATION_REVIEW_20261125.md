# Screen Studio 자동화와 기존 인사이트 영상 개선 가능성

확인일: 2026-11-25 KST. 범위는 API/MCP 조사와 현재 파일·앱 메타데이터 확인 및 개선 제안이다. 설치·연결·앱 업데이트·권한 변경·실제 영상 수정·본문 변경·발행은 수행하지 않았다.

## 확인 결과

- [공식 Guide](https://screen.studio/guide), [공식 홈페이지](https://screen.studio/), 검색 및 [공식 피드백 보드의 Claude Code/MCP 요청](https://hub.screen.studio/p/claude-code-plugin-to-edit-a-recorded-video)을 확인했다. 이 범위에서는 공개된 정식 API/MCP 문서를 찾지 못했다. 피드백 보드는 요청 게시물이며 공식 제품 기능의 부재를 확정하는 증거는 아니다.
- [tolimarchuk/screenstudio-mcp](https://github.com/tolimarchuk/screenstudio-mcp)는 제작자가 비공식·비제휴라고 명시한 MCP다. Codex 및 Claude Code에서 녹화와 기존 프로젝트 편집을 지원한다고 설명한다. [호환성 문서](https://github.com/tolimarchuk/screenstudio-mcp/blob/main/docs/compatibility.md)는 실제 앱 검증 대상을 Screen Studio4.0.1/build4897, 프로젝트 schema4.0.0으로 표기하고, 커서/줌/배경·MP4/GIF 내보내기 등을 기록한다. 제작자 문서상 설명이며 이 맥에서 동작시킨 결과는 아니다.
- 로컬 `/Applications/Screen Studio.app/Contents/Info.plist`에서 설치 앱 버전3.6.0-4214, bundleID com.timpler.screenstudio를 확인했다. 위 MCP의 검증 버전과 다르므로 3.6에서 작동한다거나 업데이트만 하면 반드시 작동한다고 단정하지 않는다. 현재 대화 도구 목록에 Screen Studio 도구가 없고, Codex config의 MCP 서버명에 screenstudio/screen_studio 항목이 없는 것만 확인했다. 인증값·라이선스는 조회하지 않았다.
- 별도 [HyperfocuSam/screenstudio-agent](https://github.com/HyperfocuSam/screenstudio-agent)와 bugiyz/screenstudio-mcp도 검색에서 확인했지만, 현재3.6 설치본과의 호환성은 검증하지 않았다. 서로 다른 프로젝트의 기능·내보내기 제약을 섞어 설명하지 않는다.

## 이번 페슈 영상에 적용할 수 있는 개선안

현재 영상은 실제 사이트의 두 캡처에 약3배 줌과 커서·화면 전환을 얹은4초 편집본이다. Screen Studio와 동일한 엔진·효과를 재현했다고 주장하지 않고, 기존 브라우저/렌더링·FFmpeg 방식으로 비슷한 시각적 연출을 구현할 수 있다는 제작 제안이다.

1. 확대용 원본을 더 큰 해상도로 촬영하고, 화면 전체 맥락이 남도록 줌 배율·위치를 조정한다.
2. 클릭 지점을 따라 감속·정지하는 커서와 작은 클릭 표시를 사용한다.
3. 줌 시작과 끝을 부드럽게 만들고 메뉴 선택 전·결과 도착 후 잠시 유지한다. 본문용3~5초 범위를 유지한다.
4. 배경·여백·모서리·그림자를 하나의 스타일로 정리한다. 반복 재생의 마지막과 처음이 덜 튀도록 연결을 다듬는다.
5. 고프레임 MP4 원본과 GIF를 함께 만들어 비교한다. 웹 본문의 무음·자동 반복 MP4는 선택 가능한 제안이며 실제 플레이어 변경은 아직 하지 않았다.

[공식 제품 설명](https://screen.studio/)은 클릭에 따른 자동 줌, 커서 부드럽게 하기·클릭 효과·유휴 커서 숨기기, 최대60fps MP4와 GIF 내보내기를 안내한다. 이는 최신 제품 안내로서 로컬3.6 앱에서 모든 기능이 동일하게 제공된다는 확인은 아니다.

현재 Documents/Claude Code/outputs/peche-real-site-gif-20261125 파일의 실제 크기는 GIF3,649,833바이트와 MP4346,623바이트다. 같은4초의 기존 파일 비교이며 신규 고프레임 영상 제작·화질 우위의 정량 검증은 아니다. 원본 프레임이 같아도 GIF/영상 포맷과 렌더링 설정에 따라 결과가 달라진다.

## 제안과 남은 확인

현재 단일 인사이트의 짧은 영상을 개선하려면 연결 설치를 선행 조건으로 삼지 않고, 먼저 기존 방식으로 줌·커서·프레임 스타일과 MP4/GIF 비교안을 만드는 편을 권한다. 정기적인 녹화·편집 자동화가 필요해지면 설치 앱과 MCP의 호환성·실제 녹화/내보내기 동작을 별도로 확인한다. 이는 제안이며 사용자 제작/설치 결정은 아직 없다.

현재 본문 검토 https://petition-transcripts-possibly-boot.trycloudflare.com/blog/hospital-website-content-structure/ 는 기존 버전 그대로다. main 병합·공식 배포0. 앱 자동 설치 명령은 다른 에이전트 폴더까지 쓸 수 있어 이번에는 실행하지 않았으며, 향후 실제 연결 요청 시 Codex 범위와 기존 환경 지침을 확인한다.

## 후속 질문: 제작자·비용·이용 순서 (2026-11-25 재확인)

[프로젝트 README](https://github.com/tolimarchuk/screenstudio-mcp)는 Toli Marchuk(tolimarchuk)이 제작했다고 명시하며, Screen Studio 제작사와 비제휴인 외부 프로젝트라고 설명한다. [LICENSE](https://github.com/tolimarchuk/screenstudio-mcp/blob/main/LICENSE)는 2026 Toli Marchuk 명의의 MIT다. MCP 코드는 무료 오픈소스이며, 기존 Screen Studio 앱을 AI가 조작하도록 연결하는 도구다. Screen Studio 유료 앱의 이용권까지 제공하는 것은 아니다.

[공식 가격](https://screen.studio/pricing)은 개인용 연간 결제 월 환산US$9(12개월 합계US$108), 월간 결제US$29로 표시한다. 원화 환산·세금·실제 계정 청구액은 이번에 확인하지 않았다. [공식 FAQ](https://screen.studio/)는 과거 일회성 라이선스가 유효하다고 안내하면서 최신 기능·업데이트 접근이 만료됐다면 갱신할 수 있다고 설명한다. 형님의 실제 라이선스 활성화·4버전 업데이트 권리는 미확인이다. 기존 구매 범위에 따라 추가 앱 비용 여부가 달라질 수 있다. Codex 등 사용하는 AI 서비스의 기존 이용 요금과도 별개다.

이용 순서는 ①기존 앱 라이선스와 MCP 검증 버전4.0.1/build4897 이용 가능 여부 확인 → ②Codex에 MCP와 편집 지침 등록 → ③필요한 macOS 화면 녹화·손쉬운 사용 권한을 사용자가 설정 → ④기존 원본을 보존하고 페슈4초 샘플로 녹화·편집·MP4/GIF 내보내기 검증이다. 로컬 재조회에서 앱3.6.0-4214, Node v25.2.1을 확인했다. 해당 MCP는 Node22+와 FFmpeg/FFprobe를 요구한다. 앱 버전은 현재 검증 요건과 다르므로 준비 완료·연결 성공으로 보고하지 않는다.

설정 방법은 local `codex mcp add --help`의 stdio 서버 등록 구문과 [공식 MCP 안내](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), 프로젝트의 수동 Codex 설정을 대조했다. 프로젝트 문서의 등록 예시는 `codex mcp add screenstudio -- npx -y screenstudio-mcp serve` 또는 config.toml의 `[mcp_servers.screenstudio]`, command=npx, args=[-y,screenstudio-mcp,serve], tool_timeout_sec=1800이다. 이번에는 help만 실행했고 등록·설치·doctor·앱 실행/업데이트·권한 변경·구매는0이다. 추후 실제 연결 시 프로젝트 기본 자동 설치 명령이 Claude 폴더도 변경할 수 있는 점을 피하고 Codex 범위에서 설정한다.

제안할 첫 지시는 ‘페슈의원 사이트에서 메인→전체 시술을4초로 보여주고, 부드러운 줌·작은 커서·은은한 배경으로 정리한 뒤 MP4와 GIF로 출력’이다. 아직 이 방식으로 제작하거나 기존 검토본을 교체하지 않았다. 이번은 이용 방법 설명까지다.

## 후속 질문: 업데이트가 계속되는가 (2026-11-25 16:42 KST 확인)

GitHub REST API(저장소/main 커밋/릴리스/이슈·PR), GitHub 릴리스·changelog 및 npm 공식 registry를 읽기 전용으로 대조했다. npm www 페이지는403, 웹 도구의 커밋 목록 URL 조회도 제한되어 공개 REST API로 확인했다. 아래 날짜는 한국시간으로 변환했다. 원본UTC와 응답 요약은 `docs/research/screenstudio-maintenance-20261125/evidence.json`에 보관한다.

- 최신 배포는 **v0.5.4, 2026-10-04 00:25 KST**다. npm latest도0.5.4이며 같은 날00:28 배포다. npm package의 repository가 동일 GitHub 저장소인지 확인했다. 0.5.0~0.5.4는10월3~4일 집중 배포됐다.
- main의 최신 커밋은 **2026-10-08 05:54 KST, 2209470**이며 내레이션 작업 순서와 가이드 정리다. 이후 main 커밋·npm 새 버전은 이번 확인에서 없다. 저장소 updated_at(별표 등으로 바뀔 수 있음)을 코드 변경 시각으로 쓰지 않았다. archived=false이나 장기 유지보수를 보증하는 근거는 아니다.
- **11월9일08:24 KST PR#2**가 Screen Studio4.1.0 지원을 제안했다. 현재open·merged_at=null로 main에 병합되지 않았다. 따라서4.1 지원이 배포됐다고 설명하지 않는다.
- **11월11일13:37 KST issue#3**에4.1.0에서 State subscription timed out/편집기 미검출 제보가 올라왔고open·댓글0이다. 제보의 존재와 상태를 확인한 것이며 이번에 실제 오류를 재현한 것은 아니다.

판단: 출시 초기의 여러 개선과 최근 커뮤니티 기여는 확인되지만, 현재도 활발한 릴리스가 계속된다고 단정할 근거는 약하다. 업데이트가 완전히 중단됐다고도 단정하지 않는다. 공개main은약7주, 배포는약7주반 새 내용이 없고4.1 관련 지원 제안·오류 제보가 미해결 상태다. 실제 도입은 검증된 버전에서 짧은 테스트 후 판단하는 방향을 권한다. 앱 최신 버전에 자동 추종하는 도구라고 가정하지 않는다.

근거: [최신 릴리스](https://github.com/tolimarchuk/screenstudio-mcp/releases/tag/v0.5.4), [최신 main 커밋](https://github.com/tolimarchuk/screenstudio-mcp/commit/220947028c58857629f1cca88d79253fc7c3acff), [미병합4.1 PR](https://github.com/tolimarchuk/screenstudio-mcp/pull/2), [4.1 연결 오류 제보](https://github.com/tolimarchuk/screenstudio-mcp/issues/3), [npm registry](https://registry.npmjs.org/screenstudio-mcp). 이번은 유지보수 상태 조사만 완료했고 설치·업데이트·앱 실행·영상/본문 변경·배포는0이다.
