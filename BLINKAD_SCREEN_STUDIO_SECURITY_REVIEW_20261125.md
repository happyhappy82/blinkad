# Screen Studio MCP 보안 검토 — 2026-11-25

대상: tolimarchuk/screenstudio-mcp. 형님 질문에 대한 설치 전 정적 검토다. GitHub main 커밋220947028c58857629f1cca88d79253fc7c3acff를 고정해 주요 소스를 읽고, npm 최신0.5.4의 배포 JS·Swift 텍스트에서 핵심 동작을 교차 확인했다. 압축본을 다운로드했지만 설치·스크립트·네이티브 바이너리·앱·MCP 서버를 실행하지 않았다. npm tarball의 SHA1이 레지스트리 메타데이터와 일치함을 확인했다. 이는 배포 출처/내용 대조이며 악성 여부나 바이너리-소스 동등성 검증은 아니다.

## 결론

화면 읽기·키보드/마우스 제어·로컬 파일/프로젝트 변경 권한을 다루므로 업무용 맥에 항상 켜두는 방식은 권하지 않는다. 공개 홈페이지와 가상 자료로 한정한 전용 환경 테스트를 먼저 권한다. 이번에 악용 가능한 취약점이나 실제 침해를 입증한 것은 아니다. 개발자 문서와 주요 코드 검토 결과이며 독립적인 전체 보안 감사·동적 네트워크 검사·의존성 취약점 전수 검사는 수행하지 않았다.

## 확인된 동작과 위험 해석

1. **화면/조작 권한.** README는 화면 녹화·접근성 권한을 요구한다. desktop 도구는 실제 클릭·타이핑·단축키를 보낸다. 대상 창 확인, 초점/가림 검사, 60초 단회 관측 토큰과 시스템 단축키 제한이 있다. native/Desktop.swift:230~251은 터미널·비밀번호관리·시스템설정 앱을 기본 제외하되 SCREENSTUDIO_ALLOW_APPS로 해제 가능하다. 보호는 앱 내부 제한이며 macOS 권한 자체를 대상 사이트에만 묶는 보안 샌드박스가 아니다. 로그인된 브라우저에 대한 오조작 가능성은 남는다. 민감한 앱을 닫고 알림을 끄며, 강한 분리는 업무계정과 구분한 macOS 사용자 계정을 권한다. 브라우저 프로필만 나누면 파일/OS 접근까지 격리되지는 않는다.

2. **영상 로컬 저장과 AI 전달을 구분.** docs/architecture.md는 내보내기가 로컬이고 업로드하지 않는다고 안내한다. src/mcp/main.ts는 stdio 연결이다. 그러나 src/mcp/tools/footage.ts:43~68의 source_frames와 desktop_screenshot·editor_frames는 원본/미리보기 화면을 MCP image 결과로 반환한다. src/mcp/tool.ts는 이를 클라이언트로 전달한다. 따라서 사용 중인 AI 호스트가 이 이미지를 모델에 제공하면 화면 내용이 해당 AI 서비스로 전달될 수 있다. 영상 파일 전체가 개발자에게 자동 전송된다는 증거와는 다르다. 이번 주요 통신·내보내기 경로 검토에서 제작자 서버로 영상이 자동 전송되는 경로는 발견하지 못했으나 모든 의존성·실행 동작의 부재를 보증하지 않는다. 예약자 명단·환자 화면·고객 연락처·토큰·메신저 알림을 촬영/미리보기 대상에서 제외한다.

3. **온라인 내레이션.** src/mcp/tools/audio.ts와 README는 edge-tts가 Microsoft 온라인 음성 서비스로 문장을 보낸다고 명시하고 ONLINE으로 분류한다. 무음GIF 작업에는 사용하지 않는 것을 권한다. 비공개 고객 원고나 개인정보가 있는 대사를 넘기지 않는다. 이번 서비스 실제 전송/보관 정책 검증은 수행하지 않았다.

4. **디버깅 포트.** src/studio/service.ts:343~349는 Screen Studio를 --remote-debugging-port와 --remote-debugging-address=127.0.0.1로 시작한다. src/cdp/page-finder.ts는 로컬주소·포트·ScreenStudio 번들 경로를 확인한다. 외부 인터넷에 기본 공개하는 구성은 아니지만 별도 인증 토큰을 붙이는 코드는 이 연결에서 확인하지 못했다. 같은 맥에서 실행되는 신뢰하지 않는 로컬 프로세스에 대한 접근면이 생길 수 있다는 구조적 위험이며 실제 악용을 재현한 것은 아니다. 포트를 공용 터널/포워딩으로 노출하지 않고 작업이 끝나면 프로젝트 저장 후 앱도 정상 종료해 디버깅 연결을 닫는 것을 권한다. MCP 프로세스만 끝내면 앱의 포트도 반드시 닫힌다고 가정하지 않는다.

5. **설치와 공급망.** npm 패키지는 로컬 Node프로그램과 native helper를 사용한다. main/package.json과 배포 메타데이터에는 install/postinstall 스크립트가 보이지 않지만 CLI install 실행은 별도로 전역 에이전트 설정과 skills를 수정한다. 기본 target=all이 Claude/Codex를 함께 건드릴 수 있으며 형님 환경은 ~/.claude 수정 금지다. 실제 설정 시 Codex 전용 범위로 제한해야 한다. 현재 installer는 등록 구문에 @0.5.4처럼 버전을 고정한다. 과거 안내한 수동 npx -y screenstudio-mcp serve는 버전이 명시되지 않아 향후 최신 해석에 의존하므로, 실제 적용 시 검토 버전 또는 검토한 로컬 경로로 고정하는 편을 권한다. 버전 고정은 새 버전의 무검토 유입을 줄일 뿐 의존성·패키지 안전성을 보증하지 않는다. 관리자권한/sudo·전체 디스크 접근을 추가로 허용할 이유는 이번 요구사항에서 확인하지 못했다.

6. **마스킹과 자료 보관.** find_sensitive는 OCR/패턴으로 일부 텍스트를 찾고 apply=false가 기본이며, 사전 자동 강제 필터가 아니다. src/studio/redact.ts:1111도 얼굴·아바타·프로필사진은 눈으로 검토하라고 명시한다. 샘플링 간격과 OCR누락도 가능하다. 별도 source_frames는 선행마스킹을 강제하지 않는다. util.ts의 state 폴더는0700으로 생성하고 일부 메타파일은0600, PNG는1일·체크포인트/내보내기기록은1주 후 시작시 정리한다. 음성/분석 캐시는 유지되며 원본 영상/프로젝트도 자동 삭제 보장은 없다. 최종내보내기만 가려도 원본과 이전 미리보기가 삭제/회수되는 것은 아니다.

7. **유지보수/호환성.** 공식 공개 API가 아니라 앱 내부 모델에 의존한다. 문서는 검증 버전4.0.1 유지와 자동업데이트 끄기를 권한다. 이 때문에 새 앱 업데이트를 늦춰야 하는 유지보수상의 상충이 생긴다. 오래된 버전에 보안 수정이 누락됐다고 이번에 입증하지는 않았다. 현재 로컬3.6은 문서 검증 버전과 달라 실사용 호환성도 미확인이다. 미검증 허용환경변수로 보호를 우회하지 않는 편을 권한다.

## 형님 콘텐츠 작업에 적용할 권고안 — 실행하지 않음

공개 병원 홈페이지/가상자료 → 로그인 없는 별도 브라우저와 전용 macOS 계정 → 검토한 버전 고정·Codex만 연결 → 화면녹화/접근성만 필요한 범위로 → 음성내레이션 제외·기본 보호 해제하지 않기 → 창 단위 촬영·미리보기 전 민감화면 제외 → 저장 후 앱 종료·결과와 캐시 확인.

단일 4초GIF의 줌/커서/여백 개선만 필요하면 기존 캡처·FFmpeg 제작도 가능한 선택지다. 이 경우 새 MCP의 화면조작 권한과 디버깅 연결을 추가할 필요가 없다는 운영상 이점이 있다. 기존 제작 방식 전체가 보안감사를 통과했다는 뜻은 아니다. 설치/연결 선택은 아직 미정이다.

## 근거

- [프로젝트 README](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/README.md)
- [구조](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/docs/architecture.md)
- [네이티브 입력 제한](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/native/Desktop.swift)
- [원본 프레임 도구](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/mcp/tools/footage.ts)
- [이미지 반환](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/mcp/tool.ts)
- [음성 도구](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/mcp/tools/audio.ts)
- [앱 실행과 디버깅](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/studio/service.ts)
- [로컬 연결 검증](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/cdp/page-finder.ts)
- [설치기](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/cli/main.ts)
- [마스킹 도구](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/mcp/tools/privacy.ts)
- [캐시 정리](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/src/studio/util.ts)
- [호환 문서](https://github.com/tolimarchuk/screenstudio-mcp/blob/220947028c58857629f1cca88d79253fc7c3acff/docs/compatibility.md)
- [npm 배포 메타데이터](https://registry.npmjs.org/screenstudio-mcp)
- [Apple 접근성 권한 안내](https://support.apple.com/en-ie/guide/mac-help/mh43185/27/mac/27) (검색 결과 확인, 본문 직접 열기는429)

재현 자료는 docs/research/screenstudio-security-20261125/evidence.json이며 비밀값은 포함하지 않는다. rg 미설치로 Python검색을 사용했다. Python3.9의 npm tarball TLS 인증서 검증 실패는 시스템 curl의 정상 TLS검증 경로로 다시 받아 대조했고 검증을 끄지 않았다. 설치·업데이트·MCP연결·앱권한/실행·영상/본문 변경·운영배포 모두0. 기존 검토 서버/터널을 유지한다.
