# PATCH LOG

## 3.0.0-split.1 — 2026-10-03
- 기준: 3.1717 (65).html. 내부 게임 밸런스/릴리스 번호는 변경하지 않음. 이 번호는 소스 구조 변경 버전.
- 요청: 규칙 이관, 필독 README, 역할 목록, 버전 기록, 고정 파일명, 향후 모듈 조합형 유저 캐릭터를 고려한 분할.
- 변경: README/AGENTS/DIVIDE TASKS/project.json, 캐릭터 58개 데이터 파일 및 순서 목록, 서비스별 소스, CSS 2개, 별도 Firebase/UI 스크립트, 조립·문서 검사·로컬 서버·실행 파일, 캐릭터 계약 문서.
- 기존 규칙/과거 HTML 주석 전부 별도 문서로 보존. 단일 HTML 규칙 및 이전 파일명 규칙만 현재 지시로 대체.
- 현재 캐릭터 객체·참조·등록 순서·실행 순서 보존. 유저 캐릭터 기능은 구현하지 않음.
- 검증: 조립된 메인 JavaScript SHA-256이 원본과 동일. 공식 데이터 58명 참조 해석/컴파일/동결 확인. 서비스·인라인 스크립트 435개 구문 검사 통과. 로컬 서버 HTML/runtime/CSS/Firebase 파일 HTTP 200 확인. 전체 파일 역할 목록과 해시 최신화 검사 통과.
- 브라우저 실행 검증은 환경에 브라우저 실행 파일이 없어 완료하지 못함. 실제 로그인·온라인 실전·훈련장 시각 검증은 미완료.
- 남은 작업: 대형 객체 내부 책임 분리, 명시적 의존 주입/ESM 전환, 미래 제작 UI/카탈로그/검증/정규화/등록 구현. 온라인 실전과 실제 로그인 검증 필요.

## 3.0.0-split.2 — 2026-10-03 검수 및 수정
- 발견: 정규식 스타일 추출이 원본 규칙 주석의 `<style>` 예시를 실제 태그로 오인. game.css에 규칙/주석 내용이 섞였으며 README/LEGACY RULES/LEGACY PATCH LOG에 뒤쪽 규칙 누락과 HTML 혼입 발생. split.1의 메인 JavaScript 대조·HTTP 검사만으로는 탐지하지 못했다.
- 수정: 실제 HTML 파서로 2개 style/3개 script/주석을 구분해 다시 추출. 스타일/스크립트 ID와 원본 리소스 순서 유지. 전체 기존 규칙과 모든 원본 HTML 주석 복원. 캐릭터/전투 JavaScript는 변경하지 않음.
- 수정: Python의 텍스트 입출력을 명시적 UTF-8로 변경해 Windows 로캘 의존 제거. 역할 목록 검사에서 등록된 파일의 실제 누락도 탐지. 로컬 서버 캐시를 막고 동적 runtime의 GET/HEAD 응답을 통일.
- 추가: tools/verify.py. 초기 분할 기준 DOM/리소스/실행 순서/등록/규칙/배포 결과 대조. project.json에 원본 검증 기준 저장.
- 검증: 원본 DOM 구조/내용·실제 CSS 2개·보조 JS 2개·메인 JS 1개·리소스 순서 모두 대조 통과. 58명 데이터 참조 해석/컴파일/동결 및 435개 서비스/인라인 JS 구문 검사 통과. 로컬 서버 리소스 6개 GET/HEAD의 바이트·길이·상태·캐시 정책 통과.
- 검사기 검증: CSS 훼손, 등록 캐릭터 삭제, README 변경 후 문서 미갱신, 규칙 누락, 오래된 runtime, 중복 실행 순서, 미등록 파일을 각각 의도적으로 만들었을 때 모두 실패를 탐지. 원복 후 전체 검사 통과.
- 미검증: 실제 브라우저 화면·훈련장 조작·Firebase 로그인·온라인 실전. 이 환경에 브라우저 실행 파일이 없어 자동 브라우저 검수는 수행하지 못함.

## 3.0.0-split.3 — 2026-10-03 서버 시작 검사 수정
- 보고: Windows Python 3.13에서 DIVIDE TASKS 최신화 검사 실패가 CalledProcessError로 이어져 서버 시작 차단.
- 확인: 기존 serve.py는 개발용 check를 subprocess.run(check=True)로 강제 실행해 문서 차이만으로 전체 서버를 종료했다. 배포 ZIP 자체는 현재 환경에서 문서 검사 통과. 사용자 PC에서 달라진 구체적인 파일은 확인하지 못했음.
- 수정: 서버는 등록 파일 존재·소스 조립을 먼저 검증하고, 문서가 오래된 경우에는 안내만 출력해 서버를 실행한다. 개발용 엄격 check 및 작업자의 역할/변경 기록 갱신 의무는 유지. 문서를 무조건 자동 재생성하지 않음.
- 수정: 텍스트 해시는 UTF-8 BOM 및 LF/CRLF 차이를 정규화. docs/build 출력은 LF로 고정. 같은 내용의 Windows 줄바꿈 변환이 해시 불일치로 이어지는 경로 제거.
- 변경 파일: tools/project.py, tools/serve.py, README.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, docs/VERIFICATION.md.
- 검증: 전체 텍스트를 CRLF로 바꾼 복사본에서 문서 검사·원본 대조 통과. 실제 README 내용 변경은 엄격 검사에서 계속 탐지. 문서가 오래된 상태에서 서버 HTML/runtime HTTP 200 및 CalledProcessError/시작 Traceback 없음 확인. 문서 자동 덮어쓰기 없음 확인. docs 후 엄격 검사 재통과. 캐릭터 파일 실제 누락은 명확한 안내로 시작 차단 확인.
- 검증 한계: Windows 줄바꿈과 공백/한글 경로를 재현한 검사이며 실제 Windows Python 3.13 실행 환경은 없음.

## 3.0.0-room.1 — 2026-10-03 방 연결 구조 교체
- 요청: 불안정한 방 생성 시스템 재구현, 비정상적인 중복/임시 구조 제거 및 변경 설명.
- 확인한 원인: 등록 전 방장/코드 공개, 모듈 로딩 이후 reset으로 취소/연타 경합, 취소된 연결의 늦은 open/data, handshake 타임아웃과 close의 중복 실패 처리, 승인 없이 대기하는 채널, 승계 identity 실패의 신규 관전자 fallback, 여러 승계 재시도 루프, CDN 실패 Promise 영구 재사용.
- 변경: RoomConnectionService로 생성/입장/승계 수명주기 통합. 세대 토큰과 Peer/채널 소유권으로 오래된 콜백 차단, dispose가 소유권을 먼저 무효화한 뒤 닫음. 등록 12초/handshake 10초/승계 전체 45초 제한. 코드 충돌 최대 32회 새 번호 시도. 번호 등록 성공 뒤 방장 권한 설정.
- 프로토콜: 화면의 4자리 코드는 유지. 내부 Peer ID에 duels3-room-v1 namespace 적용. hello/welcome에 protocol/code/roomInstance 포함. 승계는 epoch/PID/sessionKey/roomInstance가 모두 맞을 때만 기존 PID 복원. 승인 전 gameplay 차단. 정원/중복 세션/버전/잘못된 승계 사유 구분. 이전 배포본과 방 연결은 호환되지 않으며 모두 새 파일로 실행해야 함.
- 구조: 기존 openHostPeer/claimDelegatedHost/restoreMigrationClientPeer/reconnectToMigratedHost 제거. 기존 전투·계정·회원/관전자 정책·점수·선택·라운드 재개 경로 재사용. 준비/팀 변경은 room phase에서만 승인.
- 신호 서버 disconnected는 살아 있는 DataChannel의 이탈로 처리하지 않고 Peer.reconnect 수행. 실제 DataChannel close/error만 단일 이탈 경로로 처리.
- PeerRuntime: CDN별 10초 제한, 실패 script 정리, 공유 로딩 Promise 성공/실패 후 해제하여 재시도 가능.
- 신규 연결 서비스 사유: 기존 RoomService에는 타이머/Peer/멤버·매치 규칙이 섞여 단일 연결 소유자가 없었음. 기존 기능을 확장·분리하여 취소/세대/승계의 수명주기 책임을 한 곳에 둠. 이후 초대·재입장도 같은 start/승인 경로를 재사용할 수 있음. 캐릭터 제작 기능은 추가하지 않음.
- 변경 파일: src/network/RoomConnectionService.js, src/network/RoomService.js, src/core/PeerRuntime.js, tools/test-room-connection.cjs, tools/verify.py, README.md, docs/ROOM CONNECTION.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성 runtime.js.
- 검증: 실제 서비스 코드에 가짜 Peer/채널/시계를 주입한 14개 회귀 시나리오 통과. 4인 승인/브로드캐스트 이후 호스트 이탈, P2 승계와 P3/P4 기존 PID 재접속 포함. 전체 JS 구문·현재 배포/원본 UI 구조·미변경 리소스·58명 등록·규칙 이관·문서 최신화 검사 통과. ZIP 추출본 동일 검사 통과.
- 미검증: 실제 브라우저 화면·PeerServer·WebRTC/NAT·서로 다른 기기의 온라인 대전·Firebase 로그인. 가짜 Peer 검사는 실제 네트워크 연결 성공을 보장하지 않음. 실행 가능한 브라우저가 없는 환경이므로 실기기 검수가 남아 있음.

## 3.0.0-room.2 — 2026-10-03 재입장 카드 순서 수정
- 요청: 나갔다 들어온 플레이어를 현재 참가자 뒤의 마지막 자리에 표시.
- 원인: createMember의 기본 joinOrder=null을 Number(null)=0으로 변환해 일반 참가자 전체가 순서 0이 됨. RoomUI의 joinOrder 정렬이 PID 순서로 떨어져 빈 P1/P2 재사용 시 앞/중간에 표시됨. 승계 클라이언트의 _joinSequence도 스냅샷에서 이어받지 않았음.
- 수정: 기존 RoomService에 syncJoinSequence/allocateJoinOrder를 분리. 명시적 유효 숫자 순서만 유지하고 일반 입장/재입장은 최대 사용 순번보다 증가. 스냅샷에 joinSequence를 포함하고 acceptState에서 현재 멤버 순서와 함께 카운터 복원. 마지막 참가자 삭제 후에도 카운터 보존. 승계 자동 재연결은 기존 멤버/순서를 유지.
- UI: 기존 joinOrder 정렬을 그대로 재사용하며 PID/방장 권한/팀·관전 정책을 화면 위치와 분리. 새 UI나 후처리 덮어쓰기 없음.
- 변경 파일: src/network/RoomService.js, tools/test-room-connection.cjs, project.json, README.md, docs/ROOM CONNECTION.md, docs/VERIFICATION.md, PATCH LOG.md, DIVIDE TASKS.md 및 생성 runtime.js.
- 기록 정정: RoomService symbols 목록에서 room.1에 제거된 네 메서드 삭제, roomInstance와 새 순서 메서드 등록. RoomUI 역할 설명에 실제 정렬 책임 명시.
- 검증 강화: 모의 다중 클라이언트에서 같은 패킷 객체를 공유하던 시험 방식을 structuredClone 전송으로 수정. 다른 클라이언트의 host 이탈 상태가 서로 영향을 주지 않게 하고, 실제 migration 승인 패킷/호스트 연결 Map을 검증함. 기존 room.1 시험은 실제 WebRTC뿐 아니라 이 재접속 확인에도 한계가 있었음.
- 검증: 총 17개 회귀 검사 통과. 기존 4인 승계 시험을 P1 재입장까지 확장해 모든 화면의 P2/P3/P4/P1 순서 확인. 실제 RoomUI.render를 사용해 기본/null 순서, 중간 P2 이탈·재입장(P1/P3/P2), 빈 슬롯 후배치, 최근 참가자 삭제 후 스냅샷 카운터 복원을 추가 검사. 현재 runtime 구문·배포 일치·원본 UI 구조·미변경 리소스·문서 최신화 및 ZIP 추출본 검사 통과.
- 미검증: 실제 브라우저 시각/기기 간 WebRTC. 카드 외형은 시험에서 대체하고 실제 render의 순서/빈 슬롯 배치는 실행함.

## 3.0.0-game.1 — 2026-10-03 자동 관전·방어 잔향·선택지 상한
- 요청: 죽은 플레이어는 처치자를 자동 관전, 셰리나 비아 평타가 방어됐는데 잔향이 끝까지 남는 문제 수정, 캐릭터/증강 등장 수 최대 25.
- 관전: 확정된 duel-death-confirmed를 단일 진입점으로 사용. 로컬 사망만 Training.spectating과 공통 spectatorFollowPlayer로 처치자 추적. 기존 좌클릭 순환도 같은 추적 메서드 재사용. 처치자 없음/사망/이탈은 추적하지 않으며 silent 이탈·다른 플레이어 사망·토큰 불일치·중복 확정으로 관전을 다시 바꾸지 않음.
- 잔향 원인: duel-projectile-guard-resolved 수신은 이미 사거리/경계에 도달해 사라진 투사체를 찾지 못하면 성공으로 종료해 남은 전체 길이 field와 최근 경로를 보정하지 않았음. 기존 guard 재생성의 clearResolved도 필드 수명/타격 기록을 잃게 했음.
- 잔향 수정: ProjectileImpactService.correctGuardPath가 projectileKey에 연결된 살아 있는 경로 필드와 최근 경로를 접촉점까지 보정. 기존 투사체가 없어도 수신 처리. 셰리나 평타뿐 아니라 반격/향후 같은 projectile-path field에 공통 적용. InstalledAreaFieldService.activatePoint의 preserveState 옵션으로 시작/종료/틱/대상 기록 보존, 프레젠테이션 preserveTimeline 및 네트워크 보정 수신에서도 동일 처리. 기존 guard clear 후 새로 생성하는 경로 제거. 만료된 필드는 보정으로 되살리지 않음.
- 상한: RoomService.maxChoiceCount=25를 추가해 설정 저장·라운드 준비 추첨·RoomUI 선택지의 단일 기준으로 사용. 기본값 7/5, 최초 증강 선택 10개와 기존 중복 없는 추첨/제외 정책은 유지. 선택지 부족 시 가능한 풀의 수까지만 제공.
- 변경 파일: src/modes/Training.js, src/network/OnlineDuelService.js, src/network/OnlinePresentationSyncService.js, src/projectiles/ProjectileImpactService.js, src/core/InstalledAreaFieldService.js, src/network/RoomService.js, src/ui/RoomUI.js, tools/test-gameplay-fixes.cjs, README.md, PATCH LOG.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: gameplay 회귀 12개 및 기존 방 연결 17개 통과. 실제 셰리나 데이터의 평타/반격 impact를 실행해 range 종료 뒤 guard 보정 확인. 실제 InstalledAreaFieldService로 판정 range·이펙트 range·최근 경로·수명/틱 보존 확인. 실제 RoomUI의 0~25 옵션, 설정 clamp, 중복 없는 25개 추첨과 라운드 준비 패킷 확인. 현재 빌드 구문·원본 UI 구조/미변경 리소스·문서 최신화 검사와 ZIP 추출본 검사 통과.
- 한계: 제어된 서비스 실행/모의 메시지 검사이며 실제 브라우저 시각·WebRTC 지연·실기기 온라인 실전은 미검증. 이미 잘못 적용된 과거 잔향 피해를 되돌리는 기능은 추가하지 않았음.

## 3.0.0-game.2 — 2026-10-03 원격 잔향 보간·설명·스토브
- 요청: 상대 화면의 셰리나 평타 잔향이 뚝뚝 끊겨 보임, 설명 ‘소리의 잔향을 이용해’, 샤베트 (피해 수치)→(수치), 휴대용 스토브 체력 1000.
- 확인한 구조: 원격 projectile-path field는 field-point-spawn 수신 때만 길이가 갱신되고 progressRect가 그 길이를 즉시 사용. 연속 렌더 중에도 패킷 단위의 길이 점프가 그대로 노출됨.
- 수정: 기존 activatePoint/EffectSpawnService/progressRect 경로 확장. 원격 live 갱신의 최근 수신 간격(최대 100ms)을 표시 보간 시간으로 사용하고, 새 갱신은 현재 보이는 길이에서 이어감. 수신 길이 밖으로 예측 연장하지 않음. 최종 종료·방어·축소는 즉시 확정 길이 사용. 키별 전환 상태는 네트워크 snapshot에서 제외. 피해 module.range는 보간하지 않으며 타격 기록·필드/이펙트 타임라인 보존. 캐릭터 전용 분기/새 모듈 없음.
- 데이터: 셰리나 desc 문구 수정. 샤베트 LMB/RMB 괄호의 ‘피해’만 제거, 수치/공격 유지. 디라 스토브 maxHealth/respawnHealth 700→1000, tooltip의 기존 참조가 새 수치 표시.
- 변경 파일: src/core/InstalledAreaFieldService.js, src/render/EffectSpawnService.js, src/network/OnlinePresentationSyncService.js, src/modes/Training.js, src/data/characters/sherina.js, sherbet.js, dira.js, tools/test-gameplay-fixes.cjs, README.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md 및 생성 runtime.js.
- 검증: gameplay 회귀 15개(기존 12개+불규칙 수신 연속성·종료/방어 즉시 축소와 틱/수명 보존·패킷 몰림/별도 효과 독립성), 방 연결 17개. 현재 소스/배포·원본 UI/미변경 리소스·58명 등록·규칙 보존·문서/구문 및 ZIP 추출본 검사.
- 한계: 실제 기기 간 브라우저 시각/WebRTC 지연은 미검증. 네트워크 수신이 100ms보다 오래 끊기면 마지막 확정 길이에서 대기하며 추측 연장하지 않음.

## 3.0.0-audit.1 — 2026-10-04 캐릭터 구조 검수·충전 반격
- 요청: 충전 반격 설명 변경 및 최대 스테미나 -20%, 전체 코드의 규칙/공통 모듈 구조 검사와 교정·테스트 대상 안내.
- 충전 반격: 설명에서 최대 소지량 문구 제거, 획득량 +1·새 획득 시 보유 시간 초기화 표시. 기존 counter.stock 기능은 보존하고 modifier.constant(maxStamina,-0.20) 추가. BuffService/AugmentService의 중첩·제거·비율 유지·소환수 상속 경로 사용.
- 구조: 체리티 allowNoCc 제거와 기존 AttackSpec CC 참조, 반 수리 ProgressStateService 이동/전용 설정 참조 제거/완료 repair 미정의 변수 교정. MovementAbilityService에서 기존 TagService로 이동 태그 파생, 적중·벽 적중·온라인 확정·시아넬리 교환의 별도 흔적 생성 제거. 시아넬리·디라 중복 홀드 정책과 디라 5개 공격의 수동 파생 태그 제거.
- 지연/이벤트: 키 회복·뉴 반격 후속을 SimulationScheduleService로 통합. FieldDodgeRewardService의 종료 타이머 fallback 제거, dodge-ended 단일 확정과 취소/세션 정리. CharacterTriggerEffectService now/InstalledAreaFieldService frameScale 미정의 참조 교정. regenPercent 감소 하한 -100%.
- 새 게임플레이 모듈/유저 캐릭터 제작 기능 없음. 상세 원인·값·모듈 재사용·58명 결과와 직접 플레이 항목은 docs/STRUCTURE AUDIT.md.
- 이전 실행 환경 연결 장애로 중단했던 문서·패키지 작업을 복구 후 완료. 코드 수정은 유지됐고 임시 분석 파일은 유실되어 검증은 현재 소스 기준 재실행.
- 변경 파일: runtime.js, tools/test-structure.cjs, src/abilities/MovementAbilityService.js, src/render/CharacterTriggerEffectService.js, src/core/InstalledAreaFieldService.js, src/core/COMBAT_BUFF_DEFS.js, src/core/ProgressStateService.js, src/combat/CounterModuleService.js, src/combat/AugmentDodgeSequenceService.js, src/combat/AttackModuleService.js, src/combat/FieldDodgeRewardService.js, src/projectiles/StationaryProjectileInteractionService.js, src/data/AUGMENTS.js, src/modes/Training.js, src/network/NetworkHitAuthorityService.js, src/data/characters/cherity.js, src/data/characters/xianelli.js, src/data/characters/van.js, src/data/characters/dira.js, README.md, PATCH LOG.md, docs/STRUCTURE AUDIT.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md.
- 검증: 58명 공통 컴파일/동결/함수 없는 데이터/Trigger/반격 및 공격 참조/태그. 구조 회귀 11개·게임 15개·방 연결 17개. 현재 runtime 구문/배포 일치·원본 UI/미변경 리소스·규칙·역할/문서 및 ZIP 추출본 검사.
- 한계: 실제 브라우저 시각·WebRTC/NAT·Firebase 로그인 미검증. 전체 가능한 실행 상황의 무오류 증명 아님. 기존 대형 객체·네트워크 결합은 별도 구조 과제로 유지. 반 수리 시간 등 수치 변경은 하지 않음.

## 3.0.0-ui.1 — 2026-10-04 카드 칭호 선명도
- 요청: 캐릭터 카드 칭호가 흐리게 보임.
- 확인: 칭호는 char-name의 자식으로 5px/10px 검은 text-shadow를 상속하며, 두 색상 캐릭터 이름의 drop-shadow 필터도 함께 적용됨.
- 수정: 기존 카드 칭호 규칙에서 text-shadow:none, 불필요한 inline transform 제거, 규칙상 10px 적용. 칭호가 있는 이름만 :has 필터 해제. 마스터 V 조건·800 굵기·그라데이션·프로필 표시 유지. 이름의 기존 검은 그림자는 유지되며 해당 카드의 색상 필터만 제거됨.
- 검증 도구: 원본 baseline_resources 해시 보존, 의도적으로 변경한 CSS의 현재 해시 별도 등록. --baseline은 원본 검사 유지.
- 변경 파일: styles/game.css, tools/verify.py, project.json, README.md, PATCH LOG.md, DIVIDE TASKS.md.
- 검증: 문서 최신화·HTML/리소스/배포 검사와 기존 구조 11개·게임 15개·방 연결 17개 회귀 검사 및 ZIP 무결성 확인.
- 한계: 실제 브라우저/사용자 디스플레이 시각 검증은 미실시.

## 3.0.0-balance.1 — 2026-10-04 타우 충전 피해 500
- 요청: 타우 스파크 충전 피해를 500으로 상향.
- 변경: attack.tau.lmb-charged damageRatio 2.25→2.5, Base Damage 200 기준 실제 기본 피해 450→500. LMB CRIT 설명은 기존 {damage} 보간으로 같은 데이터 참조.
- 기존 모듈: state.progress로 적중당 +1/최대 3 및 충전 공격 적중 시 초기화, action.attack alternateWhen으로 최대 충전 공격 선택, delivery.area로 근접 부채꼴 전달. 수치 변경만으로 구현하며 새 모듈 없음.
- 변경 파일: src/data/characters/tau.js, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: 실제 캐릭터 컴파일·공통 설명 피해 계산으로 500 확인, 타우 데이터의 다른 필드 보존 대조, 구조 회귀 11개·runtime 구문·배포 일치·문서 최신화·ZIP 무결성 검사.
- 한계: 실제 브라우저 온라인 전투는 미실시. 피해 버프/방어 적용 후 최종 피해는 공통 계산에 따라 달라짐.

## 3.0.0-text.1 — 2026-10-04 엔소냐 평타 설명
- 요청: 엔소냐 평타 설명에 가까운 적 넉백 추가.
- 변경: LMB 설명을 ‘석궁 화살 연사 및 가까운 적 넉백 ({damage})’으로 수정. 기존 공통 설명의 피해 보간 사용.
- 확인: movement.knockback(distance:20, maxProjectileTravelRatio:0.25)이 이미 존재함. 공격 데이터·피해·넉백·실행 서비스는 변경하지 않음. 새 모듈 없음.
- 변경 파일: src/data/characters/nsonya.js, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: 문구 외 원본 데이터 보존 대조, 생성 runtime 문구 반영·구문·배포 일치·문서 최신화·ZIP 무결성 검사.
- 한계: 실제 브라우저 화면 확인은 미실시.

## 3.0.0-package.1 — 2026-10-04 배포 파일명 변경
- 요청: 최신본을 Duels.zip / Duels.html 이름으로 제공.
- 변경: 진입 HTML 이름 변경, serve.py의 루트 GET/HEAD 경로 및 verify.py·project.json·README의 현 파일명 규칙 갱신. 압축 내부 최상위 폴더는 Duels. 기존 개발 로그·원본 규칙 기록은 보존. 게임 코드와 HTML 내용은 그대로 유지.
- 변경 파일: Duels.html(이름), tools/serve.py, tools/verify.py, project.json, README.md, PATCH LOG.md, DIVIDE TASKS.md.
- 검증: 문서 최신화·원본 HTML 구조/리소스·현재 배포 일치 및 ZIP 무결성·내부 진입 파일 이름 확인.

## 3.0.0-character.1 — 2026-10-04 테르디온 구현
- 요청: 노련한 발파원 테르디온, HP1500/보통 이속/새 색상, 착탄 0.5초 뒤 중심 거리별 폭발 피해·넉백, 평타 카트리지, 지정점 발파/벽 파괴, 8방향 시계 순차 반격. 직격 피해도 포함하도록 최종 지시 반영.
- 순수 데이터: src/data/characters/terdion.js를 공식 59번째로 등록. #c49a68, speed4, Base Damage100, 지속전투형/원거리/컨트롤러. 함수/캐릭터 전용 실행 분기나 유저 제작 UI 없음. 임시 LMB 직격100/폭발100~300·범위120·비용200·쿨450ms, RMB 직격150/폭발150~450·범위180·비용400·쿨1200ms, 반격 폭약당 직격100/폭발100~300·범위120·비용0·8발80ms간격. 반격 공통 선딜300ms와 무력화 CC.
- 재사용: delivery.projectile/pierce/impact, effect.spawn, delivery.area.delay와 SimulationScheduleService, impact-proximity 넉백, counter.execute/ccRefAttackId, delayed-projectile-volley/angleOffsets. damage.range-band-multiplier를 radial-linear로 확장하고 공통 DamagePipeline에서 실제 impact.origin 거리로 보간. 설명 피해는 같은 원본 참조. 기존 단계별 거리 피해 동작 보존.
- 착탄: projectile.impact.oncePerProjectile를 설정/실행 경로 모두 지원. 확정 피해와 착탄 패킷이 별도 carrier로 들어와도 key별 1회만 실행. 일반 직격 투사체의 피격 권위 착탄 확정도 전송해 제3 참가자/관전자에 같은 착탄 경로 전달.
- 새 모듈: world.destroy-walls. 기존 geometry/벽 설치/채굴은 실제 맵 제거·원본 보존·복원·스냅샷을 제공하지 않아 신규 책임 분리 필요. WorldDestructionService가 실제 범위 발동 중심·반경으로 맵 블록/설치 벽 제거, 원본 맵 보존/라운드 복원. 다른 폭발/지형 파괴 기술도 재사용 가능. TagService에서 벽 파괴 자동 파생. 온라인 어댑터는 사건과 기존 전투 스냅샷 주기만 사용하며 다른 라운드/맵 차단·단조 제거 집합·늦은 설치 벽 복제 재등장 방지.
- 성능: 파괴 변화 때만 벽 배열/렌더 캐시 갱신. 인접 잔존 블록을 행별로 합쳐 충돌 탐색 수 감소, 설치 벽 소유자별 필터도 revision 캐시. 게임플레이 raw timer 없음.
- 변경 파일: src/data/characters/terdion.js, index.json, src/combat/DamageRangeBandService.js, DamagePipeline.js, AreaAttackService.js, src/projectiles/ProjectileImpactService.js, ProjectileModuleService.js, ProjectileService.js, src/world/WorldDestructionService.js, DynamicWallService.js, src/debug/DebugMapService.js, src/network/OnlineWorldDestructionSyncService.js, OnlineDuelService.js, src/core/TagService.js, tools/test-terdion.cjs, test-structure.cjs, verify.py, docs/TERDION.md, CHARACTER CONTRACT.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md 및 생성 runtime.js.
- 검증: 테르디온 12개 실제 서비스/모의환경 회귀(직격/감쇠·회피/방어/팀·넉백·499/500ms·중복 착탄·8발 시계 순서·반격·원본 보존/복원·stale 설치 벽·토큰/합집합·실제 impact→area 벽 파괴). 전체59명 구조11개·기존 게임15개·방 연결17개. runtime 구문·현재 소스/배포 일치·원본 UI/미변경 리소스·기존 규칙 보존·역할 문서·ZIP 추출본 검사.
- 한계/직접 검사: 실제 브라우저/WebRTC/Firebase·시각/실기기 성능·실전 밸런스 미검증. 테르디온 직접 착탄/벽/회피/반격/다음 라운드 복원과 상대·관전자·승계 화면을 확인. 공통 경로 회귀 대상 루네프/메후구/시아넬리/클레아. 모듈별 값/설치 벽 단위 정책 등은 docs/TERDION.md.

## 3.0.0-character.2 — 2026-10-04 테르디온 투척·맵 교체
- 요청: 첨부 맵2개 교체, 가벼운 벽 파괴 연출, 평타/스킬/반격 무기 투사체, 폭발1/.8/.4 단계, 메후구형 공중 스킬/근거리 반격, 피해 괄호 단순화, 착탄 호 게이지, 8방향 폭발 미리보기.
- 맵: 비오픈맵3/8의 기존ID/크기를 유지하고 첨부 전체 타일을 기존 압축 wallRects로 변환. 전체 타일 SHA-256 대조. 팀전은 기존 생성 경로로 새 원본을 사용.
- 데이터: 기존 weapon-projectile/anchor-cross·trajectory.arc·arrival.linger·effect.spawn remainingArcGauge 조합. 스킬은 비행 벽 통과/경로 피해 없음/착탄 적 우선 직격150을 사용해 메후구형 지정점 투척. 반격350/8발80ms/8방향 미리보기. 착탄500ms 잔류와 게이지·폭발 delay를 같은 원본 값으로 참조. 설명(100/300)/(150/450)/(100/300).
- 피해: 기존 radial 모듈 centerMode:impact 확장. 반경을3등분하고 .8/.5 누적으로1/.8/.4. 정확한 경계는 기존 > 규칙대로 안쪽 단계. 평타/반격300/240/120, 스킬450/360/180. 넉백만 기존 선형 유지.
- 공통 수정: 잔류 진입의 벽/빈 지정점에서도 impact를 실행하고 target-point 직격 removeOnTrigger:false는 잔류를 보존. 예측 접촉만으로 착탄 확정하지 않음. 사거리 착탄은 snapToRangeEnd 옵션을 재사용해 정확한 위치 유지. 온라인 확정에 앞서 예측 소비된 무기 객체는 기존 spawn/linger로 복원, 비행 지연 보정 금지/키별 중복 방지. 다방향 delayedVolley 미리보기마다 실제 linked area를 추가. 지정점 비행 벽 통과 미리보기 정책 반영.
- 벽 연출: 공통 effectShape/animation/spawn의240ms 작은 조각, 사건최대32개. owner 생성/같은 presentation snapshot 복제, 기존 지형 사건/상태 복제 유지. 새 gameplay 모듈/캐릭터 분기/전용 렌더러/타이머 없음.
- 변경 파일: src/core/OFFICIAL_DUELS_MAP_SOURCE.js, src/data/characters/terdion.js, src/combat/DamageRangeBandService.js, AttackPreviewService.js, src/projectiles/TargetPointProjectileService.js, ProjectileService.js, src/network/OnlineDuelService.js, src/world/WorldDestructionService.js, tools/test-terdion.cjs, docs/TERDION.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온21개(기존12+단계 경계/무기·궤적·설명/실제 잔류/8방향 preview/Canvas 호 렌더/조각 snapshot/첨부 타일 전체 SHA-256/실제 적·벽·빈 지정점 도착/실제 온라인 확정 수신 복원), 59명 구조11개·기존 게임15개·방17개. 구문·현재 소스/배포·원본 UI·미변경 리소스·전체 기존 규칙·역할 문서 및 ZIP 추출본 검사.
- 한계: 실제 브라우저·WebRTC·로그인·시각/프레임 성능/실전 밸런스는 미검증. 테르디온 전체 착탄/8방향/벽 파괴/라운드 복원과 상대·관전자 화면, 메후구/시아넬리/루네프/클레아 공통 경로를 직접 플레이 확인.

### character.2 추가 지시 반영 — 2026-10-04
- 최종 폭발 단계는 평타/반격300/200/100, 스킬450/300/150. 기존 radial 단계에2/3와1/2를 누적해1/(2/3)/(1/3)으로 적용. 앞 character.2의1/.8/.4 기록은 최초 요청 경과이며 이 최종 지시가 우선한다.
- 반격 투척 간격80ms→40ms. 첫 발부터 마지막 발까지560ms→280ms이며8방향/공통 선딜300ms는 유지. 피해 경계 및 실제 순차 예약 검사도 최종값으로 변경.

## 3.0.0-character.3 — 2026-10-04 테르디온 접촉 벽만 파괴
- 요청: 스킬이 직접 맞닿은 벽만 파괴.
- 변경: 기존 world.destroy-walls.range를 rmb 투사체 판정 radius 참조로 설정(현재12). 폭발180 범위 전체 파괴에서 착탄 투사체 원과 실제 겹치는 블록/설치 벽만 파괴하도록 변경. 500ms 폭발 시점·조각 연출·기존 지형 동기화 재사용. 설명도 직접 닿은 벽으로 갱신. 신규 모듈/공통 실행 코드 변경 없음.
- 변경 파일: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개, 구조11개·게임15개·방17개. 추가 실제impact→area 검사에서 접촉 블록1개 파괴/인접 블록 및 설치 벽 보존/벽 근처 바닥 착탄 파괴 없음 확인. 구문·배포·문서·ZIP 무결성 검사.
- 한계: 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-character.4 — 2026-10-04 폭발 벽 차단·도달 벽 파괴 및 스킬 수치
- 최종 지시: 폭발은 벽에 막히며 폭발이나 탄환에 직접 닿은 벽 파괴. 이전 character.3의 탄환 접촉만 파괴 해석을 수정.
- 스킬: 직격150 유지, 폭발600/400/200(Base Damage100×6과2/3·1/2 단계), 스테미나1000. 반격40ms 간격 유지.
- 공통: AreaAttackService는 기존 벽으로 판정/FX를 완료한 뒤 지형 파괴 실행. world.destroy-walls의 기존 range에 폭발 반경 참조, contactRange에 탄환 반경 참조, wallPolicy:block으로 파괴 전 벽 목록의 가시성 검사. WorldGeometryService.segmentRectEntry 재사용. 폭발 범위 안이어도 다른 벽에 가려진 벽은 파괴하지 않고 탄환이 직접 접촉한 벽은 포함. 같은 폭발이 부서진 벽 뒤로 추가 피해/파괴를 전달하지 않음. 새 모듈/캐릭터 예외 없음.
- 변경 파일: src/data/characters/terdion.js, src/combat/AreaAttackService.js, src/world/WorldDestructionService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온22개(600/400/200·cost1000·벽 차단 옵션·노출 벽/가려진 벽·탄환 접촉·형상 확정 후 파괴 순서 포함), 구조11개·게임15개·방17개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 화면은 미검증.

## 3.0.0-character.5 — 2026-10-04 스킬 탄환 크기·소모 조정
- 테르디온 RMB 투사체 반경12→18(지름24→36), 스테미나1000→800. 표시 무기 크기/착탄 호 반경/벽 직접 접촉 반경은 기존 데이터 참조로 함께 반영. 폭발600/400/200·범위180·벽 차단/도달 벽 파괴 유지.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(실제 컴파일된 판정/표시/게이지/접촉 반경18·비용800 포함), 구조11개·구문·배포·역할 문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수는 미실시.

## 3.0.0-character.6 — 2026-10-04 반격 거리·미리보기
- 반격 투척 거리350→175(50% 감소). 미리보기는8방향 폭발 원만 표시하고 비행 경로를 숨김. 공통 AttackPreviewService의 기존 previewProjectilePaths에 impact-only 선택 지원; 다른 공격의 경로 표시는 유지.
- 변경: src/data/characters/terdion.js, src/combat/AttackPreviewService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(175거리·경로0개/폭발 원8개·벽에 막힌 방향 착탄 위치 포함), 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-character.7 — 2026-10-04 스킬 투척 사거리
- 테르디온 RMB 투척 가능 사거리950→500. 기존 AttackSpec.range를 사용해 지정점 제한·발사·미리보기에 함께 적용.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(컴파일된 RMB range500 포함), 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.8 — 2026-10-04 반격 조준 방향 잔여 미리보기 수정
- 원인: 순차8방향 경로는 숨겼으나 공통 AttackPreviewAreaService의 기본 조준 방향 projectile-impact 미리보기가 먼저 추가되고 있었음. 이전 부분 검사에서 전체 fromAttack 경로 누락.
- 수정: impact-only는 fromAttack에서8방향 착탄 범위만 생성 후 반환해 기본 경로/중앙 착탄 중복과 단일 경로 fallback을 제거. 다른 공격의 미리보기 경로는 유지.
- 변경: src/combat/AttackPreviewService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개에 실제 전체 fromAttack 및 기존 경로 객체 재사용 검사 추가: 정확히 원8개·경로0개·본체 projectile=false/range0. 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-text.2 — 2026-10-04 테르디온 ALWAYS 표기
- 테르디온 tooltipSkills의 항시 항목 key를 ALWAYS로 변경. 표시 문자열만 수정.
- 변경: src/data/characters/terdion.js, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개·구문·배포·문서·ZIP 검사. 실제 브라우저 화면 미검증.

## 3.0.0-character.9 — 2026-10-04 공중 반격 적 충돌 제거
- 원인: trajectory.arc는 시각 궤적이며 반격 delivery.projectile의 기본 비행 피해/적 충돌이 활성 상태였음.
- 수정: 기존 damageOnTravel:false 설정, collisionTargets 미설정으로 ProjectileService의 비행 대상 검사에서 제외. 공중 적을 통과하고 벽/사거리 착탄 후500ms 폭발만 적중. 반격 설명도 사용하지 않는 비행 직격 피해를 제외하고 폭발 피해만 표시. 신규 모듈/전용 분기 없음.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개·구조11개·구문·배포·문서·ZIP. 비행 대상 검사 조건 damageOnTravel=false/collisionTargets!=true 확인. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-ui.2 — 2026-10-04 테르디온 색상 변경
- 요청: 테르디온 색상 변경. 기존 황갈색 #c49a68 → 짙은 청록 #238f96 (RGB 35,143,150). 59명 기본 색상과 동일 HEX 없음 확인. 본체·공격 프레젠테이션·폭발·착탄 호의 HEX/RGB 값을 함께 변경.
- 변경: src/data/characters/terdion.js, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개, 구문·배포·문서·ZIP 검사. 실제 브라우저 색상 시각 검수 미실시.

## 3.0.0-ui.3 — 2026-10-04 상대 착탄 호 숨김
- 요청: 상대 화면에서 테르디온 투사체 주변 호 게이지 숨김. 평타/스킬/반격 착탄 effect.spawn 3개에 기존 visibility:owner-team 적용. 본인·아군 표시, 적 숨김. 투사체/폭발/피해/500ms 타이밍은 유지. 공통 EffectPresentationVisibilityService 재사용, 신규 모듈 없음.
- 변경: src/data/characters/terdion.js, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 공개 범위 본인/아군/적 실행 검사, 테르디온22개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 화면 미검증.

## 3.0.0-game.3 — 2026-10-04 레테 평타 자원 없는 소환수 유도 제외
- 원인: 평타 delivery의 friendlyRequiresResource는 적중에만 적용되고 homing 후보 선택은 자원을 확인하지 않았음.
- 수정: LMB homing.requiresResource:stamina, 공통 valid에서 최대 자원>0 조건 검사. 아군/적 자원 없는 소환수 제외, 현재 스테미나0인 자원 보유 개체 유지. 같은 valid가 탐색/기존 유도 유지에 사용됨. 적중 및 우편함 수취인/스킬 정책 유지. 신규 모듈/캐릭터 ID 분기 없음.
- 모듈: 기존 delivery.projectile.homing에 requiresResource 선택값 추가. stamina/health 및 resources[name].max를 최대 자원 기준으로 검사하며 미설정 공격에는 적용하지 않음.
- 변경: src/data/characters/lete.js, src/projectiles/ProjectileHomingTargetVisibilityService.js, src/combat/AttackModuleService.js, tools/test-structure.cjs, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 구조12개(실제 컴파일→AttackModuleService.projectile 변환 후 레테 설정·아군/적 maxStamina 누락/0 제외·현재0 허용·기존 대상 자원 제거·미설정 공격 유지), 게임15개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.10 — 2026-10-04 순차 산탄 평타·제거된 폭약 폭발 취소
- 요청: 테르디온 평타 폭약5개 왼쪽부터 순차 산탄,500ms 폭발 전에 방패 등으로 제거되면 폭발 금지.
- 평타: 기존 delivery.delayed-projectile-volley count5/40ms/locked/방향 -30,-15,0,+15,+30도(총60도). 비용200·쿨450ms·폭약당 피해/범위 유지. 설명은 개수 참조·타당 피해로 수정.
- 원인: 착탄 예약 continuation은 source 생존만 확인하고 폭약 제거와 연결되지 않았음. 수정: 기존 projectile.impact에 선택 cancelDelayedOnRemove, source+networkKey별 토큰. discard와 원격 guard 확정으로 폭발 전 제거 토큰 취소, 해당 착탄 호 키 제거. 정상500ms 만료는 예약 유지. stationary 폭약도 방패 접촉 검사. 다른 공격은 옵션 미설정 시 기존 지연 유지. 신규 모듈/캐릭터 ID 분기 없음.
- 변경: src/data/characters/terdion.js, src/projectiles/ProjectileModuleService.js, src/projectiles/ProjectileImpactService.js, src/projectiles/ProjectileService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온25개(실제5발/40ms/각도·실제 guard.remove/discard·평타/스킬/반격 취소·호 제거·다른 폭약 유지·원격guard key취소·만료 프레임 선제 제거 정상 폭발·미설정 공격 유지), 구조12개·게임15개·방17개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.11 — 2026-10-04 정상 만료 폭발 누락 수정
- 원인 재현: 착탄 수명은 프레임 now, 폭발 예약은 이후 performance.now() 기준. 만료 시각이0.1ms만 먼저 도달해도 기존 discard가 예약 전 강제 제거로 오인해 폭발 취소. 이전 검사는 두 시각을 동일하게 두어 누락.
- 수정: 공통 ProjectileService.finish/discard의 종료 이유 전달. updateStationary 수명 만료는 expired로 예약 취소 제외. 방패/기타 제거는 removed로 기존 취소 정책 유지. 지연/피해/발사 수치와 신규 모듈 변경 없음.
- 변경: src/projectiles/ProjectileService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 수정 전 신규 회귀 실패 확인 후 수정 후 통과. 테르디온26개(평타/스킬/반격×0.1/1/8ms 차이×만료/예약 순서2종18조건 포함), 구조12개·게임15개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-balance.2 — 2026-10-04 테르디온 평타 소모량
- 최종 요청250에 따라 LMB cost200→250. 폭약5개 발사1회 기준. 설명 비용은 실제 AttackSpec 참조로250 표시.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온26개(cost250 포함), 구문·배포·문서·ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-character.12 — 2026-10-04

- 요청: 테르디온 평타 산탄/스테미나 롤백 및 직격 상향.
- 평타 단발·비용200으로 복원, 판정/표시/호 반경14. 평타·스킬 직격200. 반격은 비행 접촉 없이 착탄 순간200을1회 적용한다. 폭발 수치와 조기 제거/정상 만료 정책은 유지한다.
- 공통 TargetPointProjectileService의 선택형 arrival.triggerOnLanding이 기존 접촉 탐색/피해/회피/방어 경로를 사용한다. 캐릭터 전용 실행 분기는 없다.
- 변경: 테르디온 데이터, 공통 착탄 서비스, 테르디온 회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성 runtime.js.
- 검증: 테르디온27·구조12·게임15·방17, build/docs/check/verify 및 runtime 구문 검사. 실제 브라우저/WebRTC 실기기 전투는 미검증.

## 3.0.0-character.13 — 2026-10-04
- 요청: 테르디온 반격기 투사체 크기14. delivery.projectile.radius10→14, 기존 참조로 무기 표시/착탄 직격 판정/호 반경 동시 반영.
- 변경: 테르디온 데이터, 기존 테르디온 회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개(반격 판정/표시/호 반경14 포함), build/docs/check/verify, runtime 구문 및 ZIP 검사. 실제 브라우저 플레이는 미검증.

## 3.0.0-balance.3 — 2026-10-04
- 요청: 테르디온 평타 탄속30% 증가. delivery.projectile.speed16→20.8.
- 변경: 테르디온 데이터, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개 회귀, build/docs/check/verify, runtime 구문 및 ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-game.4 — 2026-10-04
- 요청: 하츠하츠 우클릭에 원래 없던 초록 이동 경로 선 수정.
- 원인: movement.move의 파생 이동기 태그가 공통 기본 dash-line 표시를 활성화했으나 캐릭터 데이터에 표시 제외가 없었음.
- 수정: 기존 presentation:false 옵션으로 자동 이동 선을 제외. 드래그 점선 미리보기·이동·방어 수치는 유지. 공통 런타임 변경/캐릭터 전용 분기 없음.
- 변경: hatsuhats.js, 기존 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 실제 컴파일한 하츠하츠 이동 모듈을 공통 start에 적용해 이동 성공/선0개 확인, 구조12·게임15 회귀, build/docs/check/verify, 구문/ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-game.5 — 2026-10-04
- 요청: 시아넬리 착탄 투사체 미표시. 기본 linger.fadeOut 알파 감소를3종 비도에서 제외해4초 동안 본체 표시 유지.
- 수정: xianelli 평타/counterDagger/shunpoDagger의 fadeOut:false. 공통 로컬/원격 잔류 해석에 동일 적용. 호 게이지·회수·수명 수치는 유지.
- 변경: xianelli.js, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 실제3종 데이터 컴파일·4초/비영구 수명·만료1ms 전 로컬/원격 공통 visual 알파1, 기존 구조/테르디온 회귀, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-game.6 — 2026-10-04
- 정정: game.5의 알파 변경은 상대 미표시 문제의 원인을 해결하지 않았음. xianelli fadeOut 설정 롤백.
- 공통 수정: networkSync 잔류 비도는 비소유 화면의 sourcePickupReady를 차단. 착탄 snapshot 복원은 예측 returning.phase를 outbound로 돌려 stationary 분기를 유지. 상대 위치 지연에 따른 자체 회수/귀환 제거를 방지.
- 변경: TargetPointProjectileService, StationaryProjectileInteractionService, xianelli 데이터 롤백, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증:3종 실제 데이터의 원격 회수 금지/소유 회수 유지/예측 귀환→착탄 복원; 구조13·테르디온27·게임15 회귀, build/docs/check/verify·구문·ZIP 검사. 실제 두 기기 WebRTC는 미검증.

## 3.0.0-balance.4 — 2026-10-04
- 테르디온 평타/반격 직격200→150. 스킬 직격200 유지. 반격 최대 투척175→350,8방향 폭발 미리보기/착탄 사거리 공통 참조.
- 변경: 테르디온 데이터·회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개(직격150/착탄1회/8방향 사거리350), build/docs/check/verify·runtime 구문·ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-character.14 — 2026-10-04
- 요청: 테르디온 반격 착탄 거리를 마우스 위치로 조절. 최대350,8방향은 동일 선택 거리. 선딜 동안 조준 갱신 후 발사 시작 시 거리 확정.
- 공통 volleyTravelRange + delayed-projectile-volley.distanceMode:target-point, 기존 Counter aim-point 사용. 실행/미리보기에 같은 거리 해석. 캐릭터 전용 분기 없음.
- 변경: AttackModuleService, AttackPreviewService, 테르디온 데이터/회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온28개(0/100/350/초과600 실제8발·미리보기 일치), 구조13, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-ui.2 — 2026-10-04
- 요청: 무기 투사체 중앙+ 크기를 절대값이 아닌 비율로 통일, 밝은 본인 캐릭터 색으로 통일.
- 공통 anchor-cross 렌더에서 반길이=반경*0.5, 선 굵기=반경/6(최소0.5), 궤적scale 동시 적용. 색은 source.character.color 우선, ColorService.brighten 기본35% 사용. numbered 표시는 기존 유지.
- 변경: Training.js, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온28·구조13 회귀, build/docs/check/verify·runtime 구문·ZIP 검사. 실제 브라우저 시각 검수는 미실행.

## 3.0.0-game.7 — 2026-10-04
- 요청: 분할 전 원본에서 선 없던 이동기들의 이동 선 제거. 원본 movement state.tags(명시값만 사용) 및 이동 선 조건과 전체58명 데이터 대조.
- 대상11개: 슈비.attacks.rmb.modules.2, 슈비.attacks.counter.modules.2, 루뷰.attacks.rmb.modules.1.autoArrivalMovement, 루뷰.abilities.rmb.trigger.modules.0.movement, 메인마드.attacks.rmb.modules.0, 리안.attacks.rmb.modules.0, 타우.attacks.rmb.modules.5, 타우.attacks.rmb.modules.7, 헤르쟝.attacks.lmb.modules.1, 헤르쟝.attacks.counter.modules.3, 레비나.attacks.counter.modules.2; 하츠하츠 기존 제외 유지.
- 각 모듈 presentation:false 명시. 원본에 presentation 정의가 있어도 이동기 태그가 없으면 실행되지 않던 루뷰/타우도 포함. 신규 태그 파생 및 게임 효과는 유지.
- 변경: 대상7개 캐릭터 데이터, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 구조14개(대상11개+하츠하츠), 게임15·테르디온28, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-remake.1 — 2026-10-04
- 요청: 반 CC/재생, 가에 명령/정상 스테미나/스킬/고정 반격 리메이크, 레테 비용/체리티 탄속. 추가 답변에 따라 명령 윗줄 KNOCKBACK/ACCELERATE/FIX/ELECTRIC.
- 변경: van/gae/lete/cherity 데이터, CommandFeatureService 과열/냉각 제거 및 기본 모드/FIX 원격 표시, AttackFeatureTransformService 데이터 기반 적중 옵션/레이저 팔레트/평타1.4배, CharacterCommandInputService 자동완성 실행/정렬/FIX 글로우, AbilityModuleService 사용 안 하는 냉각 핸들러 제거, 구조 회귀, 신규 가에 회귀, README/GAE REMAKE 문서, project.json/DIVIDE TASKS/생성runtime.js.
- 세부 수치는 docs/GAE REMAKE.md. 미지정 스킬 피해150/넉백160/소모200 선택, 기존 범위190/쿨700 유지. 반격 기존 피해/무력화 넉백은 유지하고 무적/자기 기절2초로 고정.
- 검증: 가에7개 그룹·구조14·테르디온28·게임15·방17, build/docs/check/verify·runtime 구문·ZIP. 실제 브라우저/WebRTC 미검증.
- Ctrl+W는 일반 탭의 브라우저 예약 단축키이므로 차단을 보장할 수 없다. 전체화면/권한이 필요한 Keyboard Lock을 현재 일반 탭 실행에 무조건 적용하거나 가짜 preventDefault 차단을 넣지 않음.

## 3.0.0-remake.2 — 2026-10-05

요청/이유: 반 스킬 소모200, 가에 FIX 글로우 제거, ELECTRIC 고정 주황색, 우클릭 선딜 복구, 설명 정렬. 공격 전 timing.delay에 공격 실행 후 ID를 요구하는 조건이 붙어 지연이 건너뛰어졌다. 해당 조건을 제거하고 기존 preview.create로500ms 선딜 표시와 쿨다운 검사를 연결했다. 공통 레이저 변환은 데이터 electricColor를 사용하며 투사체 전체 층과 INSTANT 코어도 같은 주황색이다. FIX의1초 녹색 표시와 회복은 유지한다. 신규 캐릭터 전용 실행 모듈은 추가하지 않았다.

대상: src/data/characters/gae.js, van.js, src/input/CharacterCommandInputService.js, src/combat/AttackFeatureTransformService.js, tools/test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, runtime.js. 기존 심볼 유지; 파일 역할 메타데이터 갱신.

검증: 가에9개·구조14개·테르디온28개·게임15개·방17개 모두 통과. 실제 AbilityModuleService/SimulationScheduleService로499ms 미발동/500ms 발동과 쿨다운 차단 확인. build/docs/check/verify 및 runtime 구문 검사 실행. 실제 브라우저 표시·두 기기 WebRTC 전투는 미검증.

## 3.0.0-tools.1 — 2026-10-05

요청/원인: START.bat 실행 시 graphify-out 분석 결과·캐시의 역할 등록 누락으로 서버 시작이 중단됨. tools/project.py inventory에서 루트 graphify-out 하위 생성물만 제외한다. 기존 미등록 파일 및 등록 소스 누락 검사는 유지한다. 분석 파일은 보존한다.
대상: tools/project.py, README.md, project.json, DIVIDE TASKS.md, PATCH LOG.md. 기존 심볼 유지.
검증: 실제 분석 생성물 포함 inventory 통과; 임시 프로젝트에서 새 버전 중첩 분석 캐시 제외, 미등록 JS 및 등록 소스 누락 거부 확인. START가 실행하는 tools/serve.py 서버 시작 및 HTML/runtime HTTP200·조립 소스 일치 확인. docs/check/verify 검사. 배치 창 수동 조작은 미검증.

## 3.0.0-remake.3 — 2026-10-05

요청: 가에 FIX 회복량을 잃은체력25%로 변경. fixMissingHealthRatio=0.25와 기존 ResourceRestoreEffectService의 missingResourceRatio를 연결한다. 설명도 동일 데이터 비율을 참조한다. 예: 최대1300/현재100이면300 회복하여400. 최대체력에서는0 회복.
대상: src/data/characters/gae.js, src/core/CommandFeatureService.js, tools/test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 가에9개 및 구조14개 통과; 현재100/1000/1300에서 각300/75/0 회복 및 원격 중복 회복 없음. build·runtime 구문·docs/check/verify 검사. 실제 브라우저 및 두 기기 전투는 미검증.

## 3.0.0-game.8 — 2026-10-05

요청/원인: 첨부 Duels(1).zip 기준 엘린 스킬 홀드가 낮은 스테미나에서 막힘. 공통 차징 최소비용의 || fallback이 명시0을 무시하고 소환 비용750으로 대체해 PointerHoldInputService.press가 홀드를 취소하고 탭 입력으로 전환했다. 시작·릴리스·지속 비용 해석에서 nullish fallback으로 명시0을 보존한다. 모드 전환150 및 소환750 데이터는 유지. 신규 모듈/캐릭터 예외 없음.
대상: src/abilities/ChargedAttackService.js, tools/test-structure.cjs, README.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 기존 심볼 유지·역할 설명 갱신.
검증: 구조15개(실제 차징 start:0/149/150/200/749/750, 포인터 press:150/200/749, 비용 생략750 및 명시100 제한), 기존 회귀·build/docs/check/verify·구문 검사. 실제 브라우저/두 기기 전투 미검증.

## 3.0.0-game.9 — 2026-10-05

요청: 반 정상 스패너 회복25/초, 파괴 후6회 타격으로 완전 복구. 기준은 직전 엘린 수정본(첨부 Duels(1).zip 파생). van 데이터에 기존 damage-dealt Trigger/state.progress 조합 추가. 공통 ProgressStateService 수리 정책에 repairMode:hit-count/requiredHits를 추가해 시간 누적 대신 적중 누적을 해석한다. 일반 시간형 수리는 기존 경로 유지. 파괴 시 직접 피해 확정 적중만 집계하고, 기존 ProgressHitTargetPolicy에 따라 소환수/훈련봇 및 DOT 제외. 6회복구 시800·횟수0, 대기/이동 중 누적 유지. 기존 FX/진행도 온라인 복제 재사용, 캐릭터 전용 서비스/새 모듈 없음.
대상: van.js, ProgressStateService.js, test-structure.cjs, test-gae.cjs, README, GAE REMAKE, project.json, DIVIDE TASKS, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 구조16개(시간 복구 없음·초당25·실제 Trigger/모듈6회·5회 누적·DOT/소환수 제외·복구 후 초기화), 가에9개, 게임15개, 테르디온28개, build/docs/check/verify·구문 검사. 실제 브라우저·다기기 전투는 미검증.

## 3.0.0-balance.2 — 2026-10-05
요청: 반 정상 스패너 회복15/초, 파괴 후 복구 타격5회. van 단일 원본 수치를 수정해 실제 재생·복구·호 게이지·툴팁 참조가 함께 변경된다. 기존 대상/적중/초기화 정책 유지.
대상: van.js, test-structure.cjs, test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할 갱신.
검증: 구조16개·가에9개, build/docs/check/verify·runtime 구문.4회 누적 유지/5회 완전복구·초당15 확인. 실제 온라인 전투는 미검증.

## 3.0.0-game.10 — 2026-10-05
요청: 반 내구도가 방어 판정으로 적중 효과를 무시하지 않도록 변경, 정상 스패너 회복25/초. 기존 damageResourceLayers.blockHitEffectsWhenFullyAbsorbed:false로 내구도에 피해를 전부 받아도 DamagePipeline의 정상 applied/hit 및 onHit/네트워크 확정 경로를 사용한다. 내구도 우선 피해·초과분 본체 피해·파괴 후5회복구 유지. 설명에서 방어 문구 제거. 새 모듈/전용 실행 코드 없음.
대상: van.js, test-structure.cjs, test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할 갱신.
검증: 구조17개(실제 DamageResourceLayerService로 투사체/근접/장판 완전흡수 시 적중차단false 및 초과피해50 확인·재생25·5회복구), 가에9개, build/docs/check/verify·runtime 구문. 실제 두 기기 전투는 미검증.

## 3.0.0-game.11 — 2026-10-05
원인: 이전 패치는 완전흡수 시 적중차단만 제거했다. 레이카 damage-dealt Trigger는 healthDamage를 읽는데 DamagePipeline은 내구도 피해를 여전히 해당 집계에서 제외하고 온라인 notify도 amount0을 전송했다.
변경: van 선행자원에 countsAsHealthDamage:true, 공통 DamageResourceLayerService가 해당 피해를 healthDamage로 반환하고 DamagePipeline에서 실제 본체 피해와 합산한다. 기존 레이카 데이터·Trigger 및 duel-hit-confirmed 형식 그대로 재사용. 본체 체력은 초과 피해만 감소하며 일반 방어/쉴드 정책은 유지. 초당25·파괴후5회복구 유지.
대상: van.js, DamageResourceLayerService.js, DamagePipeline.js, test-terdion.cjs, README, project.json, DIVIDE TASKS, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 전투29개(실제 내구도100/혼합50+50/본체100 각각 레이카 가호+6, 본체체력 보존·온라인 notify amount100), 구조17개 및 build/docs/check/verify·구문. 실제 두 기기 전투 미검증.

## 3.0.0-game.12 — 2026-10-05
요청: 지오핀(천재 발명가) 추가. 체력1100/느림/고유 노랑, 세 기어27조합,300ms 반격 및 다음3회 연사40% 강화. 미지정 기본값: 평타150/200/600ms, 광선300·탄850·추진220, 반격300/반경200. 상세는 docs/GEOPIN.md.
구조: 순수 geopin 데이터에 기존 모드·평타·이동·CC·패시브·횟수 버프 조합. 공통 mode-modules 변환, modifier.limited-use 어댑터, 기어 렌더만 추가. 공통 입력에서 탭/홀드/스크롤을 처리하고 기존 네트워크 패킷에 모드/횟수 스냅샷을 포함한다. 발사 조합 고정·후속 폭발 적중 집합 공유. 공유 attackDelay에도 공격속도 적용, 가에 변환 멱등화. 투사체 범위 끝 정렬 및 형상별 FX 대체로 폭발 위치·표시를 보존한다.
대상: geopin.js, characters/index.json, CHARACTER_RULES, CharacterDataService, CharacterSortService, ModeStateService, AttackFeatureTransformService, AugmentService, AbilityModuleService, LimitedUseBuffService, AbilityService, Training, PointerHoldInputService, initialization-417, OnlineDuelService, AttackExecutionService, AttackService, TriggeredAttackService, MovementAbilityService, ProjectileImpactService, ProjectileModuleService, ProjectileService, TargetPointProjectileService, AreaGeometryService, TrainingPresentationBindings, EffectSpawnService, ModeGearPresentationService, TrainingWorldDrawService, tools/test-geopin.cjs, 기존 카탈로그 검사3파일, README, CHARACTER CONTRACT, GEOPIN, project.json, DIVIDE TASKS, 생성runtime.js. 역할·심볼 목록 갱신.
검증: 지오핀19그룹/27조합 및 기존 구조17·가에9·테르디온29·게임15·방17, build·구문·docs/check/verify. 실제 브라우저/두 기기 온라인 전투 미검증.

## 3.0.0-ui.3 — 2026-10-05
요청: 지오핀 확실한 노랑, 큰 기어3개 전부 맞물림, 왼쪽2/오른쪽1 배치, 새 디자인, 기어 글자 제거.
변경: #d8e21b→#ffdc24 및 탄환 밝은 층·강화 게이지 노랑 통일. 반경22→36(약64% 확대), 삼각 배치와 중심 거리64.8/치형 위상으로 세 쌍 모두 접촉. 이중 림·세 살·육각 축과 밝은 선택점, caption/labels 및 텍스트 렌더 제거. 삼각 외접 기어 폐회로의 회전 충돌을 피하기 위해 stationaryRim 옵션으로 맞물림을 유지하며 내부 선택판은 기존 동기화 시간축으로 회전한다. effect.spawn·관계 투명도·사망 정리·전투 수치 유지, 신규 모듈 없음. 치형 루프 임시 배열 제거·색상 변환 캐시로 고빈도 할당 감소.
대상: src/data/characters/geopin.js, src/render/ModeGearPresentationService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 변경 역할 설명 갱신.
검증: 지오핀20그룹/27조합(문자 없음·36반경·2/1배치·모든 기어 쌍 접촉·색상 중복 없음·관계40%·수명·타임라인), 구조17그룹, 실제 Canvas 렌더로 본인/적 배치·색상 확인, build/구문/docs/check/verify. 실제 브라우저·두 기기 온라인 전투 미검증.

## 3.0.0-game.13 — 2026-10-05
요청: 지오핀 기어 자체 회전, 일반 직사각 히트스캔/원형 투사체/기존 점프, 조작한 기어만 일시 선명, 적중·비관통 끝점의 일반 원형 폭발, 상시 조준 미리보기, 반 스패너 리디자인.
변경: 고정 림 제거·모드별 독립450ms 회전. 평상시35%→조작 기어만500ms100%→400ms 복귀(적 관계40% 곱). ModeState의 명시적 hasChanged 및0시각 보존으로 미사용 기어가 원격에서 번쩍이지 않으며 반복 패킷도 시각을 재시작하지 않는다. 광선 커스텀beamLine/탄laser-bolt/폭발bombBlast 제거, 기존 rect/기본projectile/areaCircle 사용. 추진은 에즈레일 궤적과360ms 공통 점프 정책 재사용(기존 거리220·출발피해120 유지). 투사체 target 적중도 폭발; 광선 후속 원은 첫 적/벽/최대거리 중 비관통 종료점에서 생성하고 적중 집합 공유로 중첩 방지. 조준 미리보기는 현재 Ability 해석과 기존 AttackPreview 경로로27조합을 상시 표시, 단발 탄 경로 및 후속 폭발 원도 지원한다. 반 스패너는 열린 육각 턱·끝 구멍·손잡이 홈의 단일 도형, 약한 광택으로 변경하며 전투 판정 불변. 신규 모듈 없음.
대상: geopin.js, ModeGearPresentationService.js, ModeStateService.js, HitScanGeometryService.js, AreaGeometryService.js, AreaAttackService.js, AttackPreviewService.js, Training.js, WrenchShapeRenderService.js, VanWrenchDurabilityPresentationService.js, test-geopin.cjs, README, GEOPIN, CHARACTER CONTRACT, project.json, DIVIDE TASKS, 생성runtime.js. 책임·선언 갱신.
검증: 지오핀24그룹/27조합, 구조17·가에9·테르디온29·게임15·방17, 실제Canvas로 반투명/조작기어 회전·밝기/스패너 모양 확인, build/구문/docs/check/verify. 실제 브라우저 및 두 기기 온라인 전투 미검증.

## 3.0.0-game.14 — 2026-10-05
요청: 시아넬리 착탄 비도가 상대 화면에서 여전히 보이지 않음.
원인/변경: 기존 검사는 상태 복원만 확인했다. StationaryProjectileInteractionService.restoreNetworkProjectile은 원격 sentAt과 로컬 Date.now의 원시 차이를 남은4초 수명에서 차감해 컴퓨터 시계 차이만으로 복원 즉시 discard할 수 있었다. OnlineDuelService의 기존 networkDelayMs 기준선 보정 지연을 동일 착탄 스냅샷 복원에 전달하도록 수정. 별도 시계 시스템/캐릭터 예외 없음. 함께 null 고정좌표·거리를 Number(null)=0으로 대입하는 원격 복원/정지 update 경로를 수정해 착탄 위치와 travel을 보존한다.
대상: StationaryProjectileInteractionService.js, OnlineDuelService.js, ProjectileStateService.js, ProjectileService.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js. 역할 갱신.
검증: 실제 networkDelayMs·세 비도 평타/반격/순보·시계차±60초·보정 지연20ms·복원 후 실제 updateStationary 및 표시 위치/alpha·null 좌표 거리 보존. 구조18·지오핀24·가에9·테르디온29·게임15·방17 및 build/구문/docs/check/verify. 실제 두 기기 WebRTC 전투는 미검증이다.

## 3.0.0-game.15 — 2026-10-05
요청: 같은 방향으로 이동하는 적에게 라임 평타/레이카 반격 피해가 간헐적으로 누락됨.
원인: movement의 발동 순간 presentationDistance가 당시 적의 정지 위치로 잘려 있었고, 원격 EffectSpec 피해 timeline이 그 길이를 전체 이동 duration 동안 진행했다. 실제 소유자 돌진은 매 프레임 움직인 적의 위치로 검사하지만 상대 권위 화면의 경로는 짧고 느리게 고정돼 접촉하지 않을 수 있었다. 기존 길이 경로로 돌린 회귀 검사에서 라임 moving-away 피해0회 재현.
수정: AttackModuleService가 전체 movement.distance와 duration·collision·enemyCollisionOvershoot를 기존 EffectSpec에 보존. EffectSpawnService는 각 원격 진행 구간에서 기존 MovementAbilityService.travelWithEnemyOvershoot를 재사용해 현재 적/벽/장판 충돌을 처리하고 실제 허용 끝점에서 피해/경로 표시를 함께 종료. 정지 후 전체 사거리로 재진행 금지, 대상별1회/상대운동 접촉/AttackHitTriggerService→onHit 경로 유지. CollisionPolicyService 적 몸통 충돌도 피해와 같은 최신 NetworkCollisionPositionService 위치 사용. 프레임별 충돌 앵커/상태 객체는 timeline에 재사용. 신규 모듈·캐릭터 예외·밸런스 변경 없음.
대상: src/combat/AttackModuleService.js, src/render/EffectSpawnService.js, src/core/CollisionPolicyService.js, tools/test-movement-contact.cjs, README.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/선언 갱신.
검증: 실제 lime.lmb/reika.counter/reika.counterBlessed 데이터→실제 spawnAttackEffect→원격 복원→매 프레임 applyMovementTrackedDamage19개(동일 방향 이동·1회 적중·정지 적 접촉·첫 적 뒤 경로 중단·빠른 도주/범위 밖 미적중·최신 충돌 좌표). 기존 구조18/지오핀24/가에9/테르디온29/게임15/방17, build/구문/docs/check/verify 및 배포 ZIP 모든 원본 일치/CRC. 실제 두 기기 WebRTC 전투는 미검증.

## 3.0.0-game.16 — 2026-10-05
요청: 지오핀을 파일에서 제거.
변경: 지오핀 캐릭터 데이터·출시 등록·이동 표기·전용 문서/회귀 파일 삭제, 현재 공식 캐릭터59명으로 카탈로그 검사/안내 갱신. 기존 공통 기어/모드/무기 모듈과 반 스패너 리디자인은 유지. 이전 PATCH LOG 이력 보존. runtime 재생성으로 선택/랜덤/훈련장/라운드 후보에서 제외.
대상: characters/index.json, CHARACTER_RULES.js, geopin.js(삭제), GEOPIN.md(삭제), test-geopin.cjs(삭제), test-structure.cjs, test-terdion.cjs, verify.py, README, CHARACTER CONTRACT, project.json, DIVIDE TASKS, 생성runtime.js.
검증:59명 등록·컴파일, 배포 runtime에 지오핀 데이터 없음, 나머지 구조/전투/이동/방 회귀·build·구문·docs/check/verify·ZIP 무결성. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.17 — 2026-10-05
요청/확정: 티냐 반격은 마지막 발동 마법진 기준. 설명과 미리보기 불일치 수정.
변경: 티냐 설명을 마지막 발동 배치 재사용/기록 없으면 최소 원으로 교정. CircleFormationService.drawCounterPreview가 현재 설치 배치를 사용하던 defaultCounterFormation 대신 반격의 formation.manifest 데이터와 실제 resolveModuleCircles를 공유. pendingManifest는 source:pending 평타만 소비하도록 제한해 반격/미리보기에서 예약 평타를 잘못 사용하는 경로 제거. 새 모듈/캐릭터 예외 없음.
대상: tinya.js, CircleFormationService.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증: 실제 마지막 배치와 미리보기 geometry 일치·현재 설치 배치 불일치·조준 이동·최소 원 fallback·예약 평타 비소비/평타 소비. 구조19·가에9·테르디온29·게임15·방17·이동19 및 build/구문/docs/check/verify·ZIP 원본 일치/CRC. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.18 — 2026-10-05
요청: 카논 스킬셋의 이동 회피 관련 능력 제거.
범위: MOVING SPACE 연계 반동 펀치/파고들기 및 반동 후속 타격 삭제. 제자리 회피 연계와 기본3종/공통 회피 유지.
변경: lmbMoving/lmbMovingHit/rmbMoving AttackSpec, 해당 Ability alternates/지연/후속 Trigger, 이동 회피 상태/게이지 구간/설명 제거. movingStateKey 빈 문자열로 기존 DodgeFollowupStateService가 이동 회피에 보너스 상태를 만들지 않도록 설정. 공통 서비스 변경/신규 모듈 없음.
대상: kanon.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증:59명 컴파일·삭제 공격 참조 없음·이동 회피 상태 미생성·제자리 회피 상태 생성·기본 수치 유지, 구조20·가에9·테르디온29·게임15·방17·이동19, build/구문/docs/check/verify·ZIP 원본 일치/CRC. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.19 — 2026-10-05
요청: 카논 칸 게이지를 남은 시간 감소형 호로 교체, 설명 변경, 스킬 기절0.6초 통일.
변경: 기존 gauge.arc + timed-action-remaining이 kanon-dodge-stopped의2000ms 실제 수명을 읽는다. 만료/소비 시 숨김. 기존 segmented 제거. desc 요청 문구 반영. rmb/rmbStopped status.apply stun600ms, 설명은 기존 stunSeconds 참조. 공통 서비스/신규 모듈 없음.
대상: kanon.js, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증: 기존 회귀 전체·호 시간비율/만료/상태 소비 확인·build/구문/docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.20 — 2026-10-05
요청: 카논 호게이지 색상 교정.
원인/수정: 이전 칸 게이지 연분홍#ff8a7a를 유지한 값을 제거하고 color/completeColor 모두 characterValue("color")로 본래#c94141 참조. 100%일 때 공통 completeAccent가 자동 밝게 만들던 색도 동일 원본으로 지정. 새 모듈 없음.
대상: kanon.js, README, project.json 역할/버전/해시, DIVIDE TASKS, 생성runtime.js.
검증: 실제 컴파일된 호의 일반/완료 색 동일·구문·구조 회귀20개·docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저 표시 미검증.

## 3.0.0-game.21 — 2026-10-05
요청: 카논 제자리 회피 인식 보정 복구.
원인: game.18에서 이동 연계를 지우면서 movingStateKey를 비워 observeMovement의 회피 중 키 해제 보정까지 비활성화.
수정: 기존 kanon-dodge-moving 상태키를 내부 회피 입력 판정 기록으로 복구. 기존 DodgeFollowupStateService가 회피 중 이동키 해제 시 기록을 소비하고 제자리 연계2000ms를 생성한다. 반동 펀치/파고들기 및 이동 연계 Ability/게이지는 제거된 상태 유지. 공통 서비스 변경/신규 모듈 없음.
대상: kanon.js, test-structure.cjs, README, project.json 역할/버전/해시, DIVIDE TASKS, 생성runtime.js.
검증: 실제 공통 begin/observeMovement/state.consume·키 유지/해제·130ms 종료 경계·강제 이동 없음·연속 갱신 방지·소비 후 재생성 방지·호50%·색상·스킬600ms·구조21개 및 build/구문/docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-character.15 — 2026-10-06
요청: 새 지오핀/천재 발명가/체력1100/매우빠름/고유노랑/8조건 발명·기어1개·자신만8호. 방어 차단은 적 방어, 급접근은 상대 이동/끌어당김으로 확정. 미지정 수치는 기존 캐릭터를 기준으로 선택하도록 승인됨.
변경: 순수 geopin 데이터(실제 ID geopin)와 공통 ReactiveEquipmentService;3회 발견/자동 장착·우선순위·기본 복귀·공통 반격 즉시 발견. 기존 공격/진행도/모드/이동/호 렌더를 재사용. 범용 projectile.redirect/wall-relay와 사건 기반 온라인 Sync 어댑터 추가. 벽 전달 검사에서 AreaAttackService 네모 벽 절단/연출이 원래 캐릭터 좌표를 읽던 문제를 실제 geometryOrigin으로 통일; 수직 오프셋 중복 표시 방지. 기어350ms1바퀴,8개 개인 호의 활동 강조/활성 고정.
대상: geopin.js/index/CHARACTER_RULES, ReactiveEquipmentService, ProjectileRedirectService/Sync, EquipmentGaugePresentationService, AbilityModuleService/AttackModuleService, CCService/InstalledAreaFieldService/AttackGuardService/OnlineDuelService/ProjectileService/Training/ModeGearPresentationService/WorldGaugeModuleService/TagService/AreaAttackService/TrainingPresentationBindings, initialization-equipment, test-geopin/structure/terdion/verify, CHARACTER CONTRACT/GEOPIN/README/project.json/DIVIDE TASKS/생성runtime.
새 모듈 이유·수치·조합 책임: docs/GEOPIN.md에 기록. Trigger 사용 가능 목록 갱신. 향후 유저 캐릭터 제작 UI는 추가하지 않음.
검증: 지오핀18·구조22·가에9·테르디온29·게임15·방17·이동19 및 build/구문/docs/check/verify·ZIP 소스 일치/CRC 검사. 제어된 VM 검사이며 실제 브라우저/두 기기 WebRTC는 미검증.

## 3.0.0-character.16 — 2026-10-06
요청: 지오핀14항목·튀길 때 증가 대상은 사거리로 확정.
변경: 큰42/16톱니 기어·6살/볼트·회전 중 불투명/페이드, 개인 큰11호3/3/2·활성 밝은색/점 제거·150/현재 평타 사거리 점선. 디버깅9종 발명품 활성화는 기존 공통 명령 권위/복제로 구현. 기본 고무탄500, 지오핀 모든 투사체 확대14/정밀11/폭발17. 모든 고무탄 벽 반사/적 없을 때 정반사. 최초 사거리80/60/40/20% 추가·벽/적 통합 횟수·사거리 절대 감소 없음·4회 이후 증가0. 벽 접촉 후 실제 이동2를 travel에 포함해0거리 반복 종료. 벽 전달도 각 반사에 대응. 마지막 조건의 기록을 진행도와 분리하고1초 만료를 제거. JustDodge 원인(source/attack/impact)을 기존 사건으로 전달해 회피 조건도 기록. 이후 장판 피격 시 마지막 조건 교체. 반 스패너 톱니 헤드/이중림/볼트 리디자인, 전투 수치 유지.
대상: geopin.js, ReactiveEquipmentService, JustDodgeService/DamagePipeline/AreaAttackService/initialization-equipment, ProjectileRedirectService/Sync, EquipmentGaugePresentationService/WorldGaugeModuleService/ModeGearPresentationService/WrenchShapeRenderService, DebugPanel/OnlineDebugControlSyncService, test-geopin, README/GEOPIN/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime.
모듈: 기존 projectile.redirect 파라미터/원격snapshot 확장·기존 ArcGauge 및 Debug 명령 재사용. range.equipment-thresholds는 개인 조건 경계 표시, 저회 원인 분류는 기존 equipment.situation Trigger 사용. 캐릭터 이름 분기 없음.
검증: 지오핀27·구조22·가에9·테르디온29·게임15·방17·이동19, build/구문/docs/check/verify 및 ZIP CRC/소스 일치. 실제 브라우저/두 기기 WebRTC 미검증.

## 3.0.0-character.17 — 2026-10-06
요청: 지오핀13항목·무적/저회 누적·고속/벽 앞 접촉·폭발 직격·기본 RMB 차단·샤베트 주먹·기본 사거리 이상 정밀 조건·이음새 반사·비접촉 적 재조준·페이즈 점프·고각도 벽 전달·파비 즉시 레이저·폭발 넉백 제거·고회전 레이저 이름.
원인/변경: rememberOnly를 제거하여 저회도 진행도 누적, 공통 damage-avoided 사건으로 피해 무적과 점프 비타격 무적 시도도 누적. 정밀 기준은 farAttackId의 기본 사거리500 이상. 폭발탄의 damageOnTravel/collisionTargets 비활성 제거·직격100/폭발200·넉백 제거. 기본 RMB state.mode-is invert 조건으로 차단. 주먹은 기존 progressRect progressive-rect200/반폭50/3000/220ms·넉백180, 점프는 기존 페이즈 trajectory55/0.55·180/280ms·비타격 무적, 레이저는 파비 instant-laser/beamLine750/반폭14/150/72ms·벽 차단.
공통 충돌: 벽 처리/prev 초기화가 대상 swept 판정 전에 경로를 소비하던 순서를 실제 도달 가능한 벽 앞 구간 접촉 우선으로 교정. 첫 접촉 위치/현재 방향으로 피해 및 후속효과 실행·대상 등록 순서 제거. 반사 법선은 실제 확대 충돌체 진입면, 법선 이탈로 이음새 반복 방지. 벽 전달의 반경만큼 조준 전진한 점 대신 접촉 블록 내부/연속 벽 출구를 계산하여 고각도 누락 제거. 사거리 끝에서도 가시 적 재조준, 기존80/60/40/20% 증가 횟수 공유·4회 이후 종점 종료. 후보 배열/비교함수/마름모probe 재사용. 신규 gameplay 모듈·캐릭터 예외 없음.
대상: geopin.js, TriggerConditionService, ReactiveEquipmentService, EquipmentGaugePresentationService, DamagePipeline, initialization-equipment, ProjectileService, ProjectileCollisionShapeService, ProjectileRedirectService, test-geopin, README/GEOPIN/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime. 역할/선언·Trigger 목록 갱신. 상세 모듈 파라미터/재사용 이유는 docs/GEOPIN.md.
검증: 지오핀38·구조22·가에9·테르디온29·게임15·방17·이동19(총149), 실제 고속 updateOutbound/벽 앞 적중·뒤 적 미적중/등록 순서/이음새 다음 프레임 이동/각도별 전달/무적3회/저회 누적/비타격 무적 접촉1회/폭발 직격/반사 후execution 방향·build/구문/docs/check/verify·ZIP 무결성. 실제 브라우저·두 기기 온라인 미검증.

## 3.0.0-character.18 — 2026-10-05
요청: 반 스패너 재디자인·같은 컴퓨터 다중 참가·지오핀 종점 가짜 반사/벽 정지 수정·점프/탄속/주먹 가속·무기별 반사 사거리 증가·가시 적 재조준·레이저500.
원인/변경: character.17에서 잘못 해석해 추가한 사거리 끝 range 재조준 이벤트/함수/호출을 삭제했다. 벽 반경 안 시작 시 기존2px 보정으로246↔248 재충돌하는 실패를 실제 updateOutbound에서 재현하고 확대 벽들의 겹침 깊이 이탈로 수정. 매 프레임 추가 배열 없음. 실제 벽 반사 가시 적 탐색은 searchRadius0(무제한), 전이 적중 연쇄도 무제한 가시 적 탐색·최대2회 유지. 증가량은 발사한 준비된 무기 사거리의80/60/40/20%이며 이후 장착 변경과 독립적임을 무기6종 검사.
수치: 고무탄 속력25% 증가(기본/충격30·전이32.5·과반동52.5·정밀60·폭발27.5), 추진180/200ms(기존280), 주먹4500(기존3000), 레이저 판정/표시500. 공통 delivery.projectile/movement.move/trajectory.arc/effect.spawn 재사용. 스패너는 양쪽 열린 턱·각진 어깨·홈 손잡이로 변경, 캔버스 실제/확대 크기 검수.
방: sessionStorage는 복제 탭에서 복사되어 중복 세션으로 거절될 수 있었다. 접속 키를 페이지 수명 고유값으로 변경하여 다른 창은 같은 기기/계정에서도 독립 PID 참가. 같은 페이지 재연결/승계 키 유지, 정원4·게임 중 관전자·동일 계정/기기 레코드 제외 유지.
대상: geopin.js, ProjectileRedirectService, ProjectileService, TagService, RoomIdentityService, WrenchShapeRenderService, test-geopin, test-room-connection, README/GEOPIN/ROOM CONNECTION/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime. 역할/선언/문서 최신화. 새 gameplay 모듈/캐릭터 이름 예외 없음. TagService는 searchRadius0 무제한 탐색도 실제 redirect 모듈에서 유도 태그를 파생하도록 수정.
검증: 지오핀43·구조22·가에9·테르디온29·게임15·방19·이동19(총156그룹). 벽 내부 시작 실패 후 수정 성공·가로/세로 이음새/각도30조건·사거리 끝 정상 제거·범위 밖 가시 적 조준·벽 뒤 제외·6무기 증가/속력·복제 탭 실제 identity/3인 승인·기존 승계/전투 회귀. build/구문/docs/check/verify 및 ZIP CRC/전체 소스 일치 검사.
미검증: 실제 브라우저 다중 탭/창·두 기기 WebRTC/실전. 자동 검사는 제어된 VM/모의 Peer 환경으로 실제 온라인 접속을 보장하는 검사가 아니다.

## 3.0.0-character.19 — 2026-10-06
요청: 연한 지오핀 색상·탄환 크기 포함 유도 경로·반사 사거리 증가 제거·전이 횟수 제한 제거·정밀700·충격 전달 벽 관통·주먹 대폭 가속.
원인: 후보 선택은 중심선 LOS만 검사하고 반사 직후2px만 두께 검사하여 중간 벽/좁은 틈을 향했다. 공통 nearest에서 실제 wallCollisionPadding과 최초 적 접촉까지 전 구간 raycast로 후보를 검증한다. 사거리 증가 설정을6종 모두 제거하고 증가율이 없을 때 extendRange가 travel 초과분까지 사거리를 늘리거나 페이드를 초기화하지 않도록 조기 종료한다.
변경: 색상#e4c52a→#e6ca3b(표현 색 포함), maxRedirects0 무제한 계약·중복 대상 제외 유지, 정밀1100→700, 충격 전달 delivery.area.wallPolicy ignore, 주먹4500→18000(4배). 공통 모듈 조합 유지·새 모듈/캐릭터 이름 분기 없음.
파일: src/data/characters/geopin.js, src/projectiles/ProjectileRedirectService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, docs/CHARACTER CONTRACT.md, project.json, DIVIDE TASKS.md, PATCH LOG.md 및 생성runtime.js.
검증: 지오핀47·구조22·가에9·테르디온29·게임15·방19·이동19(총160). 좁은 틈/중간 벽/반경 변화/벽 앞 적·6명 실제 연쇄·동일 적 제외·사거리 초과 travel 확장 없음·6무기 고정 사거리·다음 벽 관통 검증. build/구문/docs/check/verify·ZIP CRC/파일 전체 바이트·추출본 검사.
미검증: 실제 브라우저 외형/주먹 체감 속도·두 기기 WebRTC 실전. 제어된 Node VM 회귀는 실제 온라인 검증을 대신하지 않는다.
주먹 추가 검수: travelSpeed는 world-edge 범위에서만 duration을 계산하므로 고정 사거리 progressRect에서는 값만 변경해도 실제 속도가 바뀌지 않았다. 기존 growthSpeed를19.8로 설정하여 220ms 표현 중200거리를 약11.1ms에 진행하도록 수정. 실제 EffectSpawnService 피해 진행을5ms/12ms로 실행해 종점 적 타격 검증.

## 3.0.0-character.20 — 2026-10-06
요청: 주먹 넉백 공격 방향 고정·전이 적중 사거리40% 증가·주먹 약간 감속·전이 사거리700.
변경: 주먹 기존 movement.knockback.direction attack, 진행속력15300/growthSpeed16.83(이전보다15% 감소·거리200 약13.1ms·표현220ms). 전이 최초700·projectile.redirect.rangeGrowthRatio0.4 및 rangeGrowthOn[hit]. 준비된 기본 사거리의40%인280씩700→980→1260…누적하며 travel은 보존. 벽/중복 대상 제외·전이 횟수 무제한 유지. 마지막 적중도 증가 기록 후 후보 없으면 종료. 새 모듈·캐릭터 ID 예외 없음.
파일: geopin.js, ProjectileRedirectService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, docs/CHARACTER CONTRACT.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js. 역할/선언 최신화.
검증: 지오핀49·구조22·가에9·테르디온29·게임15·방19·이동19(총162). 세 공격 방향의 실제 onHit 넉백, 주먹12ms 미접촉/14ms 종점 피해,6명 연쇄 증가/중복 제외/벽 증가 없음, 준비된1000 사거리 기준400 증가·장착 변경 무관·snapshot 복원/중복 순번 무시·후속 증가 검증. build/구문/docs/check/verify·ZIP CRC/전체 파일 바이트 일치·추출본 검사.
미검증: 실제 브라우저의 속도 체감·두 기기 온라인 실전. 제어된 Node VM 회귀는 실전 검증을 대신하지 않는다.

## 3.0.0-character.21 — 2026-10-06
요청: 주먹 발사기 추가 감속. 앞서 안내한 현재 대비20% 감소 적용.
변경: 진행속력15300→12240, 실제 표시/피해 진행 growthSpeed16.83→13.464. 사거리200 약16.3ms, 표현 수명220ms. 기존 effect.spawn progressRect/damage progressive-rect 값만 조정하며 공통 모듈·공격 방향 넉백·전이탄 동작 유지.
파일: src/data/characters/geopin.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/수치/변경 기록 최신화.
검증: 지오핀49·구조22그룹. 실제 progressive-rect 피해를15ms 미접촉/17ms 종점 적중으로 검사하며 공격 방향 넉백·전이 연쇄 회귀 유지. build/구문/docs/check/verify·ZIP CRC/파일 전체 바이트 일치/추출본 검사 통과.
미검증: 실제 브라우저 속도 체감·두 기기 온라인 대전.

## 3.0.0-character.22 — 2026-10-06
요청: 급접근 대상에 소환수 포함·조건 완화·회피 접근 감지.
변경: approachTargetKinds에 summon 추가. approachWindow250→350ms, approachDelta180→100, approachNear300→350. 적 자체 이동 조건은 기존 delta×0.75를 재사용해135→75. 재감지 경계는 near+delta인450 초과. 주먹 제작3회 유지.
원인: 기본 회피는140/130ms여서180 감소 조건을 충족하지 못하며 고정 관측 구간 경계에서 이동이 나뉘면 누락될 수 있었다. 기존 ReactiveEquipmentService.update의 위치 감지를16ms 간격 재사용24슬롯 rolling history로 변경하여350ms 내 유효 이전 위치를 검사한다. 프레임마다 배열/객체를 생성하지 않고 최초 추적 시만 할당. 새 모듈/캐릭터 이름 예외 없음·기존 equipment.situation Trigger 유지.
파일: src/data/characters/geopin.js, src/core/ReactiveEquipmentService.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/심볼/현 수치 갱신.
검증: 지오핀53·구조22·가에9·테르디온29·게임15·방19·이동19(총166). player/trainingBot/summon 포함·350ms/100/350 경계·미달99/최종351/시간351 제외·아군/자기 회피 제외·기본140/130ms 이동을 시간 경계에 걸쳐 샘플링해 감지·중복 누적 제외/이탈 뒤3회 발명·신규 소환 자체 제외·사망 기록 정리/원격 관측자 제외. build/구문/docs/check/verify·ZIP CRC/전체 파일 바이트 일치·추출본 검사.
미검증: 실제 브라우저·두 기기 WebRTC에서 회피/소환수 접근. 기본 회피 검사는140/130ms 위치 변화 샘플을 주입한 제어된 VM 회귀이며 실제 입력/네트워크 실전 대체 검사가 아니다.

## 3.0.0-character.23 — 2026-10-06
- 장판 반복 trigger와 field-area 피해가 모두 발명 진행을 올리던 중복 경로 제거. InstalledAreaFieldService는 피해 간격 대기 중에도 진입/이탈 갱신, 진입만 ReactiveEquipmentService.field 호출. 지속 틱/무적/저회로 재누적하지 않음.
- ReactiveEquipmentService.behindWall에 DynamicWallService의 활성 차막이 포함. 델트루브 차막이 뒤 공격/저회 조건도 집계.
- 벽 반경 내에서 시작한 탄환은 진입면이 없어서 접촉 블록을 못 찾던 충격 전달150 피해 누락 재현(검사0≠1). ProjectileRedirectService.contact에서 겹친 실제 블록 복구 후 통과.
- 폭발 고무탄 직격/폭발 기본200. 기존 projectile.impact 공유 적중과 hit.once-per-execution 조합으로 동일 대상 중첩 제거. 설명/GEOPIN 최신화.
- 대상: 위 공통 서비스3개, 지오핀 데이터, 회귀 검사, README/GEOPIN/project.json/DIVIDE TASKS/runtime.
- 검증: 지오핀59·구조22·가에9·테르디온29·게임15·방19·이동19 총172 회귀; 구문/build/docs/check/verify, ZIP CRC/원본 바이트 대조.
- 한계: 제어된 Node VM의 실제 서비스+권위/피해 스텁 검사. 실제 브라우저/다중 기기 WebRTC 실전은 미검증.

## 3.0.0-character.24 — 2026-10-06
- 요청: 근거리/원거리 게이지는 직접 공격만 인정. 뒤 기어 더 크게/평소 더 투명하게.
- 원인: ReactiveEquipmentService.damage가 field-area 외 모든 피해를 거리만으로 분류하여 상태/DOT 등도 누적 가능.
- 수정: 거리 사실에 데이터 허용 impact 유형 및 제외 공격 태그 검사 적용. direct/projectile/area/effect-animation만 허용하며 트랩(field-area/덫 발동), 상태/DOT, CC 태그 및 유형 없는 피해 제외. 기존 장판 진입·이동 제한·벽 뒤·직접 공격 무적/저회 경로 유지.
- 데이터: 기어 반경42→50/idleAlpha0.35→0.2. 회전350ms/강조/페이드500ms 및 개인8호 유지. 거리 설명에 직접 공격 명시.
- 대상: ReactiveEquipmentService.js, geopin.js, test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS, 생성 runtime.
- 검증: 지오핀62·기타113 총175 회귀, 실제 기어 렌더 알파 검사, 구문/build/docs/check/verify, ZIP CRC 및 원본 바이트 대조.
- 한계: 제어된 Node VM 검사. 실제 브라우저/온라인 실전 미검증.

character.24 추가: 과반동의 restrictedStatuses에서 knockback, restrictedAttackTags에서 넉백을 제외. 순수 넉백/넉백 저회는 제작·자동장착·마지막 조건을 바꾸지 않는다. 기절/속박/둔화/빙결/수면/무력화/끌어오기 조건은 유지. 넉백 공격은 거리 조건 제외 태그에는 남겨 거리 게이지로 우회 집계하지 않는다.62 지오핀/총175 회귀 검사.

## 3.0.0-character.25 — 2026-10-06
- 과반동 발사기 사거리700→500. geopin.js의 AttackSpec 단일 원본 수정. GEOPIN/README/project.json 역할 갱신, DIVIDE TASKS/runtime 재생성.
- 지오핀62 회귀·build/구문/docs/check/verify·ZIP CRC 및 원본 바이트 대조 통과. 실제 온라인 실전 미검증.

## 3.0.0-character.26 — 2026-10-06
- 신고: 엔소냐 평타 저회로 과반동 스택 증가. 최신 소스에서는 실제 엔소냐 데이터/TagService/JustDodge 이벤트3회에서0스택·기본 무기 유지로 미재현. 넉백은 character.24에서 이미 제외됨. 추측 전투 수정 없음.
- tools/test-geopin.cjs에 실제 데이터/태그/저회 통합 회귀 추가. 기존 단순 넉백 태그 스텁 검사보다 범위 확대. README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신.
- 지오핀63 회귀·build/구문/docs/check/verify·ZIP CRC/바이트 일치 통과. 실제 사용자 실행 파일/온라인 브라우저는 미확인.

## 3.0.0-character.27 — 2026-10-06
- 코녕 장판의 둔화50ms 갱신(120ms replace-source)을 CCService.add가 매번 restriction 사건으로 보고해 빠르게3스택/과반동 장착. 실제 코녕 데이터+CCService 반복 검사에서3≠1 재현.
- 활성 동일 sourceId replace-source/refresh-type 갱신은 발명 사건 제외. 첫 적용1회·해제/만료 후 재적용은 새1회. CC 유지/다른 상태 적용 경로 유지. 캐릭터 이름 예외 없음.
- CCService.js, test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신.
- 지오핀64+기타113 총177 회귀, 구문/build/docs/check/verify 및 ZIP CRC/바이트 대조 통과. 실제 브라우저/온라인은 미검증.

## 3.0.0-character.28 — 2026-10-06
- 루네프 화염 폭발 원거리 정밀 스택0≠1 재현. 폭발의 넉백 태그가 거리 조건 제외 목록에 있어 직접 피해도 차단됨.
- geopin.js distanceExcludedAttackTags에서 넉백만 제거. 직접 넉백 공격의 거리 조건 허용, 과반동 넉백 제외는 restrictedStatuses/restrictedAttackTags에서 유지. 후속 화염 status/DOT 제외 유지.
- 실제 루네프 데이터/TagService 폭발400 사건1스택, DOT4회 추가 없음 회귀. 엔소냐 저회/코녕 둔화 및 넉백 과반동 제외 회귀 통과.
- 대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀65+기타113 총178 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.

## 3.0.0-character.29 — 2026-10-06
- 과반동 발명은 이동 정지CC(기절/속박/빙결/수면/무력화)만 인정. restrictedStatuses의 slow/pull 및 restrictedAttackTags의 slow/끌어오기 제거. 넉백 제외 유지.
- 코녕 둔화 장판은 장판 진입만 집계, 둔화 유지/해제/재적용으로 과반동0스택. 기절 등5종은 각각3회 제작 검사.
- 사용자 확인한 과반동 피해200→250(DamageRatio2.5). 사거리500. 실제 설명은 DamageRatio 원본 참조.
- geopin.js/test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신. 지오핀66+기타113 총179 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조 통과. 실제 온라인 미검증.

## 3.0.0-character.30 — 2026-10-06
- 타우 추격: 적중 투사체 carrier는 존재하나 상태 조회null인 상황에서 이동[]≠[300] 재현. AttackModuleService.onHit은 적중 carrier 우선, 이동 성공 시에만 oncePerExecution 소비. NetworkHitAuthorityService는 투사체 대상 추격에 확정 적중 좌표 우선(귀환 위치 오조준 방지).
- 지오핀 체력1100→1300.
- 추가 신고 체리티 원거리 누락: 실제 데이터/TagService/차징 AttackSpec의 벽 없는거리500/700/1400 정밀1스택, 벽 뒤에서는 충격 우선1/정밀0 확인. 사용자 실전 누락 미재현, 추측 조건 변경 없음.
- 대상: AttackModuleService/NetworkHitAuthorityService/geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀68+기타113 총181 회귀·구문/build/docs/check/verify·ZIP 검사. 온라인 이동 변경은 실제 브라우저 실전 미검증.

## 3.0.0-character.31 — 2026-10-06
- 주먹 급접근에서 일반 걸음 제외. ReactiveEquipmentService.update가 현재 CombatStats.speedMult 반영 일반 이동속도의 approachSpeedRatio1.2 초과 관측 이동속도를 요구. 기존 상대이동75/거리100/350ms/최종350 조건과 함께 검사. 끌려감 예외 유지.
- geopin.js 파라미터, 서비스/테스트 역할, README/GEOPIN 갱신. 일반 걸음/1.5배/2배 버프 걸음 미집계 및 기본 회피140/130ms 집계 통과. 지오핀69 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 일치. 실제 온라인 미검증.

## 3.0.0-character.32 — 2026-10-06
- 200 미만 고무탄 투사체 본체 피해를200(DamageRatio2)으로 상향: 기본/충격/전이100→200, 정밀150→200. 기타 공격 수치 유지.
- geopin.js/README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신. 지오핀69 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조 및4개 원본 피해 확인 통과. 실제 온라인 미검증.

## 3.0.0-character.33 — 2026-10-06
- 충격 전달/반사 패킷이 ROOM_GAMEPLAY_PACKET_TYPES에 누락돼 Room.receiveGameplay/handleClientPacket에서 실제 처리되지 않음. 두 타입 등록 후 실제 Room 호스트 중계/클라이언트 수신 검사 false≠true→통과. 기존 전달 피해 코드 유지.
- 무기 투사체 연결 점선은 Training.js 공통 렌더에서 EntityService.owner(source)===Training.player일 때만 표시. 상대/관전자에서는 숨김.
- 대상: ROOM_GAMEPLAY_PACKET_TYPES.js/Training.js/test-room-connection.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀69/방20 포함183 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조. 점선은 코드 경로 검수, 실제 브라우저 시각/두 기기 실전은 미검증.

## 3.0.0-character.34 — 2026-10-06
우클릭 즉시 이전 장착 무기로 전환, 홀드200ms 시 고무탄 복귀. 기존 holdTriggerWhilePressed/equipment.select operation:previous 파라미터 확장 사용. 전환 이력 previousValue를 공통 ModeState snapshot에 복제. 동일 무기 재선택은 이력 미변경. 짧은 클릭 직후 전환하고 계속 누르면 기본으로 전환. 기존 비용0/쿨250ms 유지. 지오핀69 포함183 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: ReactiveEquipmentService/AbilityModuleService/ModeStateService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime. 이전 기본 장착중 RMB 금지 계약 폐기.

## 3.0.0-character.35 — 2026-10-06
충격 전달 벽 뒤 네모 기본 피해150→300(DamageRatio3). 벽 뒤 조건은 기존 직접 공격 허용 유형/제외 태그 검사와 함께 평가. 트랩/field-area/상태DOT/CC 태그 공격·해당 저회는 벽 뒤 집계에서 제외, CC 자체 적용은 이동 제한 조건만 처리. 직접 투사체/범위 공격과 동적 차막이 지원 유지. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증.
대상: ReactiveEquipmentService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.36 — 2026-10-06
지오핀 RMB는 기존 tapHoldSplit/holdGauge 경로 사용. 누르는 동안200ms 호게이지 표시, 200ms 미만으로 떼면 이전 무기, 200ms 이상 홀드 후 떼면 기본 고무탄 전환. 눌렀을 때/홀드 도중 전환 없음. 엘린 등과 같은 PointerHoldInputService 호게이지/해제 분기 재사용. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.37 — 2026-10-06
고무탄6종 반경18. 사거리500→650(기본/과반동),700→850(전이/정밀). 탄속은 사거리 비율 곱해 기본39/과반동68.25/전이약39.4643/정밀약72.8571. 충격650/탄속30, 폭발250/27.5 유지. 원거리 조건과 개인 점선 기준은 기본 사거리 참조로650, 전이 적중40% 추가는340. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증.
대상: geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.38 — 2026-10-06
기본 고무탄 평타 쿨400→350ms(0.35초). 발명품별 고유 쿨은 유지. 기존 홀드 평타 반복은 AttackSpec.cd 원본을 참조. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.39 — 2026-10-06
거리350 이하 근거리/350 초과 원거리. farAttackId 기본 사거리 참조 제거·고정longDistance350/farExclusive:true 사용. 같은 반경인 기준 원은 공통 renderer에서 한 번만 표시. 기본 고무탄 평타350→300ms.349/350/351 경계·캔버스 arc1개 실제 검사. 공통 유도 시야 판정으로 미탐지 은신 적은 벽 반사/연쇄 유도 대상에서 제외. 공개 적이 없으면 반사각 유지. 탐지된 적은 기존 시야 규칙 적용. 지오핀72 포함186 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: ReactiveEquipmentService/EquipmentGaugePresentationService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.40 — 2026-10-06
지오핀 최대 체력1300→1100. 탄속12% 감소 요청은 취소되어 기존 탄속 유지. 캐릭터 stats.maxHealth 원본과 기존 체력 회귀 기대값을 갱신. 지오핀72 회귀·빌드/구문/docs/check/verify·압축 무결성 검사 통과. 실제 브라우저/온라인 플레이 미검증.
대상: src/data/characters/geopin.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.

## 3.0.0-character.41 — 2026-10-06
최근 사거리 상향 때 빨라진 기본/전이/과반동/정밀 고무탄의 탄속을 현재 값×0.93으로7% 감소. 기본39→36.27, 전이39.464285714285715→36.70178571428571, 과반동68.25→63.4725, 정밀72.85714285714286→67.75714285714285. 충격30/폭발27.5와 체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 데이터만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 무결성 검사. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.42 — 2026-10-06
기본/전이/과반동/정밀 고무탄 탄속을 character.41 현재 값에서 추가10% 감소(×0.9). 기본32.643, 전이33.03160714285714, 과반동57.12525, 정밀60.981428571428566. 첫7% 감소 전 대비 총16.3% 감소. 충격30/폭발27.5·체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 원본만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.43 — 2026-10-06
지오핀 RMB의 holdGaugeTimerOnly:true 누락으로 startHoldGauge가 실패하여 press 즉시 일반 스킬로 빠지던 오류 수정. 공통 PointerHoldInputService.release는 마지막 update와 무관하게 실제 누른 시간도 확인.199ms 해제 이전 무기,200ms 이상 해제 기본 고무탄,누름/홀드 도중 미발동,강제 취소 미발동. 실제 Pointer press/release와 장착 결과 회귀 추가. 전체187그룹(지오핀73)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/WebRTC는 미검증. 이전 검사는 모듈 선택만 확인하여 입력 준비 실패를 놓쳤음.
대상: PointerHoldInputService/geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.44 — 2026-10-06
지오핀 설명 간결화: 폐기된 벽튕 사거리80/60/40/20% 증가 문구 제거. 상황별3회는 발명 설명에서만 표기하고 개별 발명품의 반복3회/중복 저회/목록 우선순위 문구 제거. 조작 구분·조건·피해·전이 적중40% 사거리 증가 유지. 반격 설명에 주변 피해 명시. 게임 실행 데이터 변경 없음. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.45 — 2026-10-06
지오핀 기본 고무탄 평타 피해200→150. Base Damage100은 유지하고 기본 AttackSpec damageRatio2→1.5만 수정. 발명품별 피해·탄속·사거리·체력1100 유지. 툴팁은 기존 damage 참조로150 표시. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.46 — 2026-10-06
사용자 확인에 따라 사거리850인 전이/정밀 고무탄 탄속을 현재 값에서15% 감소(×0.85). 33.03160714285714→28.07686607142857, 60.981428571428566→51.83421428571428. 사거리850·피해 및 다른 무기 탄속 유지. 기존 delivery.projectile.speed 값만 변경. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.47 — 2026-10-06
지오핀 고무탄6종 벽 반사마다 현재 속력×0.8. projectile.redirect wallSpeedMultiplier0.8 범용 파라미터로 실제 vx/vy/baseSpeed 갱신, redirect snapshot 복원 시 baseSpeed도 수신 속력으로 동기화. 적중 연쇄 자체는 감속하지 않음. 지오핀200 피해 본체(충격/전이/정밀/폭발)와 폭발 후속을150으로 하향. 기본150·레이저150·주먹150·과반동250·반격250 유지. 충격 전달 벽 뒤300→250. 반 스패너 공격(lmb/rmb/counter) 후 기존 mode.toggle로 누적 회전 상태 갱신, 기존 ModeGearPresentationService.rotation을 스패너 renderer에 연결하여300ms에 한바퀴 회전. 파괴 상태는 숨김 유지. 모드 snapshot으로 상대 동일 시간축 회전. 새 모듈 없음. 전체189그룹(지오핀75)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/두 기기 실전 미검증.
대상: geopin.js/van.js, ProjectileRedirectService, VanWrenchDurabilityPresentationService, test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.48 — 2026-10-06
지오핀 기본 및 발명품 평타9종(lmb,jump,wall,laser,chain,punch,recoil,sniper,bomb)의 AttackSpec.cd를350ms(0.35초)로 통일. 보조 폭발/벽뒤 공격과 스킬/반격은 제외. 기존 홀드 반복은 현재 장착 공격의 cd를 참조. 피해/탄속 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.49 — 2026-10-06
추진 도약기 이동거리180→360(100% 증가). 기존 movement.move distance 원본 수정, 이동시간200ms 유지하여 이동속력1800units/sec. 점프 궤적/피해/평타간격350ms 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.50 — 2026-10-06
키 스킬/좌클 forecastExecute 및 스킬/우클 deceive는 예고 field를 clear하되500ms 보상 판정만 유지하는 기존 구조. 예고 지역에 reactiveEquipmentEntry:false를 지정하고 공통 ReactiveEquipmentService.field에서 해당 옵션 및 rewardOnly 상태를 제외. 예고 지역 최초 진입과 실행/취소 후 보상 잔류 모두 지오핀 장판 게이지 미누적. 일반 지속 적 장판 진입은 유지. 실제 사용자 온라인 증상 재현은 미확인, 실제 키 데이터/분류76회귀 및 전체190그룹·빌드/구문/docs/check/verify·ZIP 검사 통과. 새 모듈/캐릭터ID 예외 없음. 실제 온라인 미검증.
대상: ki.js/ReactiveEquipmentService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.51 — 2026-10-06
추진 도약기→추진 가속기. jump AttackSpec 내부 참조ID 유지, trajectory.arc 제거. 기존 movement.move 조준 방향 distance260/duration200ms와 delivery.area rect range200/halfWidth45/angleOffsetπ/wallPolicy:block 조합. 후방 공격 크기는 충격 전달 wallBurst와 같은200×90, 기본 피해150으로 설정. 즉시 후방 히트스캔과 전방 이동 발동, 기존 이동 중 비타격 무적/벽·적 통과/미표시 이동선 유지. 비용150·cd350ms. 새 모듈 없음. 실제 AreaAttackService 후방 적중/전방 제외 회귀 포함 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.52 — 2026-10-06
추진 가속기를 추진 도약기로 롤백: 리메이크 전 trajectory.arc 높이55·전방/목표점360·200ms·비타격 무적 이동 복구, 후방 히트스캔 제거. 발명 조건은 지속 장판 실제 피해3회. reactiveEquipment.fieldTrigger:damage로 공통 field 진입 누적 차단, InstalledAreaFieldService 실제 피해 impact에 fieldDuration 전달. ReactiveEquipmentService는 field-area/fieldDuration>0/amount>0/적대 출처를 확인하여 field 조건만 누적. 장판 진입·무적·저회·일회성/상태DOT 제외. 같은 장판 지속 피해도 실제 피해 사건별1회 누적. 키 예고 및 보상 잔류는 실제 피해가 없어 제외 유지. 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/온라인 미검증. 기존 공통 분류 파라미터 확장·새 모듈 없음.
대상: geopin.js/ReactiveEquipmentService/InstalledAreaFieldService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.53 — 2026-10-06
추진 도약기 이동거리/AttackSpec.range360→220. 이동시간200ms·점프 궤적·지속 장판 실제 피해3회 발명 유지. 기존 movement.move distance 원본만 조정. 지오핀77 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.54 — 2026-10-06
뉴 마검 장판 duration:infinite가 Number 변환에서NaN→0이 되어 지오핀 지속 장판 판정에서 제외되던 원인 수정. InstalledAreaFieldService 피해 impact에 fieldPersistent boolean 전달(infinite 문자열/Infinity/무기한 endsAt 지원), 숫자 fieldDuration은 유한값만 전달. ReactiveEquipmentService는 양수 duration 또는 persistent 장판 실제 피해를 집계. 피해0/무적/저회 제외·진입 미누적 유지. 실제 뉴 데이터 기반 무기한 장판3회 제작 회귀 추가. 전체192그룹(지오핀78)·빌드/구문/docs/check/verify·ZIP 검사. 실제 온라인 플레이 미검증. 새 모듈/캐릭터ID 예외 없음.
대상: InstalledAreaFieldService/ReactiveEquipmentService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.55 — 2026-10-06
지오핀 고무탄6종 벽 반사마다 현재 탄속35% 감소(×0.65)로 변경. 이전20%(×0.8) 대체. 기본 발사 탄속 및 적중 연쇄 자체 유지. 기존 projectile.redirect.wallSpeedMultiplier 원본 변경, 반복 반사와 원격 baseSpeed 복원 회귀 기대값 갱신. 지오핀78 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-balance.2 — 2026-10-06
공통 Space 회피 기본거리140→119(15% 감소), 스테미나 비용400→300. GAME_DATA.dodge 단일 원본 변경. EntityDodgeService의 실제 비용/이동과 DebugControl/입력 조건이 기존 원본을 참조. 회피 속도17.95·dur130ms·저스트 회피80ms 및 증강 배율 유지. 관전 Space 대시도 기존 공통 거리 참조로119 사용. 전체192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/온라인 미검증.
대상: GAME_DATA.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.3 — 2026-10-06
공통 회피 잔상: 기존 RecordDodgePresentationService.begin/update/emit을 재사용하여 실제 Entity 위치에 캐릭터색 원형 실루엣(알파0.18·150ms·46ms 간격)을 EffectSpawnService로 생성. 낮은 레코드에도 기본 잔상 profile 제공, 기존 상위 레코드 전용 연출 유지. 저스트 회피의 기존 금색 원에 얇은 밝은 내부 원과 짧은4방향 선 추가,360ms 수명/텍스트/화면흔들림 유지. 실제 회피 경로를 매 프레임 추적하는 기존 경로만 사용, 예상 도착점 잔상 없음. 기존 로컬/원격 dodge activate 및 just-dodge 프레젠테이션 복제 경로 재사용. 실제 emit 위치/수명/알파 실행검사 및 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 시각/두 기기 온라인 미검증.
대상: RecordDodgePresentationService.js/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.4 — 2026-10-06
회피 잔상 리디자인: 기본 생성간격46→25ms/수명150→240ms, 단색 저알파 원을 캐릭터색 채움0.32·외곽0.7·짧은 밝은 호0.4로 변경, 제곱 페이드 대신 선형 페이드로 가시성 향상. 실제 위치만 기록. 저회는 기존 이중원/4선 대신 금색3분할 호·밝은 내부호·작은4마름모가 짧게 퍼지는360ms 연출. 약한 glow7·최대 반경54/장식61로 화면 가림 제한. 기존 이펙트 생성/회피 시간축/동기화 재사용, 화면흔들림 추가 없음. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저 시각 검수/온라인 미완료.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.5 — 2026-10-06
사용자 시각 피드백 반영: 회피 잔상의 테두리/장식 호 제거, 실제 본체색 원형 실루엣만 채움0.38·190ms 제곱 페이드로 표시. 기본25ms 생성 유지. 저회 금색 원형 호/마름모 제거,90도 교차형 가늘고 뾰족한 두 빛줄기와90ms 미만의 약한 중심 섬광으로 교체. 기존360ms수명/텍스트/화면흔들림 유지. 기존 effect.spawn 생성/실제회피 위치/원격 프레젠테이션 경로 유지. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저 시각/온라인 미검증.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.6 — 2026-10-06
사용자 최종 지시: 회피거리119/비용300 유지. ui.3~ui.5에서 추가한 공통 잔상/저회 연출을 전부 롤백. RecordDodgePresentationService.js 및 Training.js를 연출 변경 직전 balance.2 배포본과 바이트 동일하게 복구. 기존 상위 레코드 회피 연출과 원래 저회 금색 원/텍스트/화면흔들림 복구. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 및 롤백 원본 바이트 대조 통과. 실제 브라우저/온라인 미검증.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.56 — 2026-10-06
지오핀 RMB 홀드 성공 해제 후500ms 최대 호/점선링 유지: 공통 PointerHoldInputService holdGaugeRetainMs 설정/잔류 렌더 지원. 기본 고무탄 상태는 holdTrigger state.mode-is invert 조건으로 홀드 차단. deferTapUntilRelease 및 cancelUnavailableHold로 홀드 준비 불가 시 누름 즉시 탭 실행 방지·길게 눌러도 탭으로 오발하지 않음. 짧은 이전무기 전환 유지. 설명 화살표 나열 대신 다른 캐릭터처럼 조건과 행동 문장으로 정리. 기존78지오핀 회귀 포함192·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: geopin.js/PointerHoldInputService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.57 — 2026-10-06
레이카 가호 상태에서 대검, 뉴 마검 보유 상태에서 마검을 본체 뒤에 표시. 캐릭터 데이터의 worldEffectModules 조건과 공통 후면 장식 렌더를 조합하며 캐릭터별 실행 분기 없음. 기존 상태 동기화와 본체 투명도 적용. 전체193회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 시각/온라인 미검증.
대상: reika.js/nyu.js/ModeGearPresentationService/test-geopin 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.58 — 2026-10-06
지오핀 뒤 기어의 돌출 톱니16개→6개. 기존 공통 gearPath의 teeth 설정만 변경하여 크기·색상·회전·사용 밝기·평소 투명도 유지. 지오핀79회귀 및 빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 검증은 미실시.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.59 — 2026-10-06
뉴 마검 확대(scale1→1.35): 뾰족한 보라색 검날·측면 돌기·꺾인 중심선·갈고리형 가드. 레이카 태양의 대검 별도 디자인(scale1→1.25): 넓은 금빛 검날·밝은 중심선·날개형 가드·8방향 태양 문양. 공통 swordSilhouette 스타일 분기로 구현하며 상태 조건과 후면 렌더 유지. 지오핀79회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각/온라인 미검증.
대상: nyu.js/reika.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.60 — 2026-10-06
지오핀6톱니 기어 외형 보정: 깊은 홈(몸통 반경0.78)·8점 모따기 톱니·넓고 평평한 돌출부·내부 림0.68로 외곽과 정렬. 기존 반경50·색상·투명도·회전 유지. 공통 toothProfile 설정으로 다른 기어 원형 유지. 지오핀79회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 미검증.
character.59 뉴/레이카 검 리디자인과 함께 제공. 대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.61 — 2026-10-06
레이카/뉴 후면 검 공격 시300ms 한바퀴 회전: 기존 mode.toggle after-attack과 ModeGear.rotation 시간축 조합, 모드 상태 원격 복제 재사용. 레이카 기본/가호 평타·스킬·반격 및 뉴 평타·투척·반격에 적용, 후속 파동/장판/착탄 중복 회전 제외. 기존 characterValue 모듈 인덱스 보존을 위해 회전 모듈은 배열 끝에 추가. 레이카 검날 폭 일정한 직선형으로 변경(끝만 뾰족), 금빛 가드/태양 문양 유지. 은신 확인: 본체 bodyAlpha를 검·기어·스패너 모두 적용, 미탐지 적 완전 숨김/자신·아군 반투명/탐지 노출. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: reika.js/nyu.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.62 — 2026-10-06
인투 뒤 현재 무기 표시: 기본 권총/산탄총은 intu-weapon 모드, 저격총은 intu-sniper 상태 우선으로 표시. 공통 gunSilhouette 렌더와 데이터 조건 조합. 권총 짧은 몸통/손잡이, 산탄총 긴 총열/펌프, 저격총 긴 총열/스코프·하늘색#9bdcff. 무기 종류 칸수 게이지만 제거, 탄약 칸수와 재장전 호 게이지 유지. 본체 은신 투명도 공유. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: intu.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.63 — 2026-10-06
인투 후면 무기 리디자인·전체 스케일1.5배: 권총 슬라이드/각진 프레임/손잡이/방아쇠 보호대, 샷건 두꺼운 총열/펌프/개머리판, 하늘색 저격총 긴 총열/큰 스코프/개머리판을 별도 부품으로 표현. 총 실루엣과 부품 대비 확대, 기본 알파0.8→0.9. 무기 전환 조건·탄약/재장전·은신 본체 알파 공유 유지. 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 검증 미실시.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.64 — 2026-10-06
가에 활성화 정도 표시를 호→8칸 게이지로 교체. 기존8종 활성 명령 모드를 그대로 세어 활성 명령당1칸 표시. 공통 RuntimeValueReferenceService의 mode-match-count 값을 추가하여 기존 비율 참조와 집계 로직 공유, 기존 gauge.segmented renderer 사용. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: gae.js/RuntimeValueReferenceService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.65 — 2026-10-06
인투 총 전면 리디자인: 이전 세로 부품 조합 폐기, 가로 측면 실루엣을 기울여 후면 배치. 권총 긴 슬라이드/각진 손잡이·샷건 펌프/개머리판·하늘색 저격총 스코프/탄창/긴 총열을 구분. 스케일1.5 및 본체 은신 알파 유지. 실제 drawGun을 @napi-rs/canvas로 렌더해 본체 원형 포함3무기 PNG 시각 확인. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 게임 브라우저/온라인 미검증.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.66 — 2026-10-06
지오핀 기어 전면 재설계: 6개 굵은 블록 톱니·깊은 홈·굵은 원형 림·3개의 열린 창/넓은 회전자 축·육각 중심, 기존 촘촘한 살/볼트 제거. toothProfile:block/gearDesign:openRotor 공통 데이터 옵션 사용. 기존 크기/회전/알파 유지. 실제 renderer 캔버스2배 확대+본체 포함 시각 확인. 인투 실제 발사 AttackSpec8종 after-attack mode.toggle로300ms 반시계 한바퀴(-2π), 기존 ModeGear.rotation/상태 원격 복제 재사용. 모듈 배열 끝에 추가하여 기존 인덱스 보존. 재장전 자체는 회전 없음. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인/브라우저 미검증.
대상: geopin.js/intu.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.67 — 2026-10-06
지오핀 기어 디자인 재정리: 길쭉한 블록 톱니를 짧고 두툼한6톱니(몸통0.84)로 변경. 열린3창/육각 축 제거, 내부 원형 림·6개의 단순한 살·원형 중심 축으로 교체. 실제 렌더+본체2배 확대 이미지 확인. 크기/회전/투명도 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인 미검증.
대상: ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.68 — 2026-10-06
사용자 정정에 따라 지오핀 기어를 전면 리디자인 전 character.65/60 외형으로 정확히 복구: chamfered6톱니·이중 림·6살·6볼트·육각 축. character.66/67 새 기어 디자인 폐기, 추가 다듬기 없음. geopin.js는character.65 배포 원본과 바이트 동일, gearPath/기어 내부 렌더 원본 복구. 인투 발사 반시계 회전 유지. 전체193회귀·빌드/구문/docs/check/verify 통과.
대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.69 — 2026-10-06
복구한 지오핀 기어 디자인 유지하며 세부 보정: 6톱니/6살/6볼트/육각 축 유지. 모따기 톱니 몸통0.78→0.8·모서리 비율 조정, 외곽선2→1.7/둥근 연결, 내부 림0.68→0.7, 볼트3→2.2/배치0.58→0.57, 중심 축0.22→0.2. 크기/색/회전/알파 유지. 실제 캔버스 렌더 본체 포함 이미지 확인. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인 미검증.
대상: ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.70 — 2026-10-06
사용자 요청으로 지오핀 기어를6개로 줄이기 전 character.57 배포본의16톱니 디자인으로 정확히 복구. geopin.js 바이트 원본 및 gearPath/기어 렌더 전체 원본 복구. character.58/60/66/67/69의6톱니 디자인/보정 제거. 인투 총 회전·뉴/레이카 검·가에 칸수 등 이후 다른 변경 유지. 전체193회귀·빌드/구문/docs/check/verify 통과.
대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.71 — 2026-10-06
레이카 가호 미리보기 공용 사용 확인: counterBlessed 독자 하늘색 previewStyle/geometry color 제거해 기본 공용 흰색 적용. 공통 AttackPreviewAreaService가 명시 previewGeometry를 이동 종점 후속 범위와 합성하지 않던 원인 수정: delivery.area 없는 공격의 명시 경로를 parts에 포함, 경로 직사각형300/반폭44+종점 원 함께 표시. 지오핀 설명13개(탭/홀드 분리·WEAPON 표기)/테르디온4개 사용자 문구 반영. 설명 선두 [키] strong에 공통 class 부여·밝은#f4f7ff 적용. 기존193회귀 및 별도 실제 parts 실행 경로+종점 원2개/종점좌표 검사·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: reika/geopin/terdion.js·AttackPreviewAreaService·CharacterDescriptionService·game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.72 — 2026-10-06
레이카 tooltip 순서를 사용자 지정대로 일반 ALWAYS/LMB/RMB/RMB CHARGE/L-Shift 뒤 가호 LMB/RMB/L-Shift/Space PROTECTION으로 변경. 공통 설명 렌더가 WEAPON/PROTECTION 키 또는 명시 section을 분리해 기본 스킬 아래 margin-top11px 별도 블록에 모음(소환수 설명과 같은 여백). 각 그룹 내 순서/보간/비용/밝은 대괄호 유지. 지오핀 WEAPON8개도 같은 공통 경로로 분리. 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: reika.js/CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.73 — 2026-10-06
기존 추가 설명 점검: 가에 / 명령10개와 카논 STOPPED SPACE 콤보2개도 공통 하단 그룹 분리 적용. WEAPON/PROTECTION/명시 section 및 기존 소환수 하단 영역 유지. 일반 스킬 조합 표기는 기본 영역 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.74 — 2026-10-06
캐릭터 한줄 설명과 대괄호 표기를 밝은 하늘색#bdeaff로 통일. 기본/추가 스킬 키 및 HEALTH/MOVE SPEED/RECORD/SUMMON 표기도 공통 class 적용. 한줄 설명 별도 span class 사용, 캐릭터 이름/칭호 색은 기존 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterDescriptionService/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.75 — 2026-10-06
이동속도0 소환수 MOVE SPEED 줄을 공통 설명에서 생략. 티냐 RMB INCLUDE/LINK/CROSS/AMP4종을 명시 section:CIRCLE로 하단 분리(RMB DRAG/HOLD 기본 유지). 카논 STOPPED SPACE 하단 분리 취소해 기존 위치 유지. 소환수 관련 기존 RMB/RMB 및 엘린 RMB/LMB를 RMB SUMMONER 표기로 변경(엘린/레테/라임/디라/허장)·공통 SUMMONER 하단 그룹. 실제 입력/효과는 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: elin/lete/lime/dira/herjang/tinya.js·CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.76 — 2026-10-06
후면 검/총 표시 생성·제거·스타일 전환 공통 효과: ModeGearPresentationService WeakMap 시각 상태 관측, 변화마다 반의 DamageResourceLayerService.spawnTransitionEffect 재사용하여 캐릭터/무기색 얇은 areaCircle240ms 생성. 레이카 가호 진입/해제·뉴 마검 투척/회수·인투 총 전환 적용. 최초 표시/같은 상태/캐릭터 교체 반복 없음·은신 중 효과 억제. 기존 반 파괴/복구 효과 유지. 기존 효과 생성/로컬 권위/온라인 effect-spawn 복제 경로 공유, 원격 중복 생성 없음. 별도 상태 변화 실행검사(생성/제거/교체1회·은신 억제) 및 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인/브라우저 미검증.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.77 — 2026-10-06
지오핀 타이머 홀드 게이지가 링 배치에서 누락되어 반격/상태 링과 겹치던 원인 수정. PointerHoldInputService.holdGaugePresentationState로 실제 표시/비율/완료 상태 단일화, drawHoldGauge와 EntityRingLayoutService.characterHoldGaugeState가 동일 참조. 홀드/해제500ms 잔류 동안 호 및 최대충전 링 공간 예약·만료 후 해제. 기본 고무탄 홀드 차단 조건 그대로 반영. 캐릭터ID 분기 없이 공통 홀드 지원. 별도 링 반경 실행검사25→29→32→25 및 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: PointerHoldInputService/EntityRingLayoutService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.78 — 2026-10-06
캐릭터 수치: 스야 은신 초당150→100(시전400+4초400=최대800), 유이 평타120→144, 엘린/유령체력800→1000, 티냐 주문서800→600, 메라모나 평타 투사체반경8→12/최종 레이저반폭8→12, 나레 스킬1200→800. 방 설정 gameMode normal/augment 추가·기본normal·호스트 일반전/증강전 탭·동기화. 일반전 시작 증강 선택지 없음/게임 준비 제목/캐릭터 카드/준비 완료 버튼·미선택 경고 없음·증강 제출 차단. 일반전 라운드 사이 증강 선택도 제외; 증강전 기존 선택 유지. 기존193+모드 회귀1=194·빌드/구문/docs/check/verify 통과. HTML 의도 변경은 current_layout_sha256로 검증하고 원래 baseline 유지. 실제 브라우저/두 클라이언트 온라인 미검증.
대상: sya/yui/elin/tinya/meramona/nare.js·RoomService/RoomUI/OnlineDuelService·Duels.html/game.css·test-gameplay-fixes/test-room-connection/verify 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.79 — 2026-10-06
혼자 방 금지 선택 버튼: 제안 즉시 확정 후 proposal:null이 되어도 select 모드 sync는 창을 닫지 않던 원인 수정. 버튼 성공 후 제안이 없으면 returnToRoom, 투표 대기 제안은 기존 sync 유지. 실제 RoomService+CharacterBanUI 버튼 핸들러로 금지 반영/제안 해제/창 복귀 회귀 추가. 지오핀 난이도5→4. 전체195회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterBanUI/geopin.js/test-gameplay-fixes 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.80 — 2026-10-06
방 설정 항목을2열 grid로 배치(width최대760/94vw). 게임 모드는 닉네임 표시 설정과 동일 duels-display-cycle-button 버튼으로 현재 일반전/증강전 표시·클릭 시 순환 변경. 호스트만 조작·클라이언트 설정 반영 유지. 기존 개별 모드 탭 대신 공통 순환 버튼 사용. 전체195회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/RoomUI/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.81 — 2026-10-06
일반전 최초 캐릭터 선택 완료 후 증강 없는 게임 준비 화면 표시·호스트가 모든 참가자를 준비 처리해 즉시 카운트다운, 추가 준비 클릭 없음. 일반전 카운트다운 상대 증강 미선택 결과 영역 숨김. 모드별 요구승리/캐릭터수/증강수 및 마지막 모드를 duels-room-settings-v1 localStorage에 저장, 전환 전에 현재값 저장/대상모드 복원·방 reset/탭 재개설 복원. 일반전 신규 기본캐릭터15/증강전7, 기존 저장값 우선. 모드 전환·fresh VM 저장소 복원·일반15·자동카운트다운 검사 포함 전체196회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: RoomService/OnlineDuelService/test-gameplay-fixes 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.82 — 2026-10-06
방 설정 2열 전환 후 캐릭터 금지 버튼이 기존 52px 행 밖으로 넘쳐 아래 방 정보와 겹치던 문제 수정. 금지 행은 제목/요약과 버튼 줄을 grid로 나누어 실제 내용 높이를 확보, 버튼은 줄바꿈 가능한 flex로 칸 안 배치. 설정 grid의 flex 축소 차단, 기존 행 원본 폭/간격을 2열에 맞게 수정하고 중복 하단 덮어쓰기 제거. 모드 버튼의 오래된 flex 탭 CSS 제거·공통 순환 버튼 가운데 정렬. 일반전 증강 행은 hidden 속성 및 명시 숨김 CSS로 display:flex!important보다 우선 처리. 기존196 회귀 통과·빌드/구문/docs/check/verify 통과. 첨부 사진 확인; 실제 브라우저 시각 검증은 실행 파일 미설치로 수행 불가, 온라인 미검증.
대상: game.css/RoomUI 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.83 — 2026-10-06
캐릭터 금지 화면 showScreen이 숨김→표시로 전환될 때만 화면/목록 scrollTop0, 이미 열린 투표 상태 갱신은 스크롤 유지. 뉴 후면 swordSilhouette scale1.35→1.75(약30% 확대). 레이카 가호 스킬은 delivery.projectile delay220ms 후 targetPreview가 처음 생성되고 독자 하늘색을 쓰던 원인 수정. 성공한 gahoWeapon 직후 preview.create320ms로 즉시 표시, targetPreview 범위는 gahoSlam.range 참조/독자 스타일 제거. 공통 AttackPreviewService.fromTargetPoint가 입력 직후/비행 중 동일한 원과 기본 스타일을 재사용, Ability preview에 targetPoint 전달 및 기존 nearest-open/사거리 clamp 조건 반영. 공격 판정/발사/이동 타이밍은 유지. 신규 게임플레이 모듈/캐릭터 ID 실행 예외 없음. 실제 ability 데이터 포함3회귀 추가·전체199 및 빌드/구문/docs/check/verify 통과. 실제 브라우저 시각/온라인 미검증.
대상: CharacterBanUI/nyu/reika/AttackPreviewService/AbilityModuleService/ProjectileService/test-gameplay-fixes/test-geopin 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.84 — 2026-10-06
후속 첨부 사진에서 금지 버튼 넘침 지속 확인. 지난 수정이 놓친 debug.css의 더 구체적인 금지 행 height/min-height/max-height52px!important가 실제 원인. 해당 원본을 height:auto/max-height:none으로 수정하고 제목/요약+버튼2행 grid 및 버튼 wrap 규칙을 debug.css 한 곳으로 통합, game.css 중복 제거. 전체199 회귀 및 docs/check/verify·구문/빌드 통과. 실제 브라우저 시각 미검증.
대상: debug.css/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.85 — 2026-10-06
사용자 요청으로 캐릭터 금지의 없음/금지 인원수를 제목 바로 옆으로 이동. 기존 summary ID와 동적 갱신 유지, inline 및 왼쪽8px 간격 적용. 버튼은 아래 줄 유지. build/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/debug.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.86 — 2026-10-06
사용자 요구에 따라 금지 설정도 다른 설정과 같은52px 높이. 제목 바로 옆 요약과 버튼을 한 줄 flex로 배치, 버튼9px/가로 padding6px/요약 간격6px로 두 열 칸 안 너비 확보. 기존2줄 배치 제거. build/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: debug.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.87 — 2026-10-06
라운드 준비 캐릭터 선택 안내를 미선택 시 현재 캐릭터 유지로 변경. 동작 변경 없음. build/docs/check/verify 및 runtime 구문 검사 통과.
대상: OnlineDuelService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.88 — 2026-10-06
긴/짧은 사거리 정렬은 기존대로 평타 계열의 최대 공격 도달 범위(조건부 강화/차징 포함)를 기준으로 하되 숫자 AttackSpec.range를 무조건 공격으로 세던 구현 제거. 실제 delivery.area/hitscan/projectile/range-projectile, effect.damage, 이동 타격, formation.manifest로 공격 여부 판단. 착탄 및 벽 전달 후속 AttackSpec 재귀 추적·지속 피해 field 범위 포함·state.window 실제 발동 공격 참조·LMB action.trigger-attack 후속 포함. 순환 참조 보호. charge fullSpec은 병합된 실제 모듈로 평가해 피해 없는 차막이/이동/회복/장식 거리 제외. 차징/스케일 최대값은 해당 모듈 속성으로 적용, 중심 이동/반복 중심/중심형 사각 반길이 계산. 상대 대상이 아닌 회복 폭발 제외. 동적 적중 후 연쇄 사거리 증가는 최초 공격 도달 기준에 가산하지 않는다. 레이카230→276/라임126→170/하푸푸90→240/델트루브650→170, 테르디온970 등 기존 정상 착탄 사거리 유지. 신규9+기존199=208 회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증. 프레임 루프 변경 없이 카드 정렬 시 계산만 수정.
대상: CharacterSortService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.89 — 2026-10-06
긴/짧은 사거리 정렬은 게임 시작 무기·모드·진행도 기준. 레이카 가호 없는230, 반 스패너220, 지오핀 기본 고무탄650, 인투 권총650. 메라모나550/루리90/큐리150/레이즈120 초기 단계. 공통 ProgressStateService.ensure 및 TriggerConditionService의 상태 조건으로 초기 평타 선택, ProgressScaledAttackService.resolve로 초기 단계 범위 해석. 매칭된 대체 평타는 기본 공격을 대체하며 requireAttackId 후속은 선택된 공격만 포함. 거리/조준 등 공간 조건에 따른 기본 무기 분기는 유지. 기본 무기에서 가능한 일반 차징 최대 범위 및 폭발/실제 피해 도달 계산 유지. 기존 반격 전용 상태 추측 필터 제거. 캐릭터 ID 예외/전투 코드 변경 없음. 60명 실제 데이터 및 초기 무기/공간 조건/원본 무변경 포함12 사거리 회귀·기존199=211 전체 회귀 통과. build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저/온라인 미검증. 정렬 시 계산만 수정하여 프레임 루프 추가 없음.
대상: CharacterSortService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.90 — 2026-10-06
성장형·발명형 캐릭터 사거리 정렬은 초기/미성장 평타 기준 유지. 스타일의 사거리도 같은 basicRange와 공통 CHARACTER_RULES.ranges로 자동 분류. classification.range/rangeLabel 고정 표기 우선 제거하여 정렬과 표시 불일치 해소. 카드 카탈로그도 구형 combat.styleLabel보다 공통 스타일 해석 사용. 메라모나550 중거리/큐리150 초근거리/지오핀650 중거리/루리90 초근거리/레이카230 근거리/반220 근거리 확인. 성장/발명 후 무기 및 강화 범위는 초기 분류에 포함하지 않음. 실제 공격/성장 효과/일반 차징·폭발 포함 도달 계산 유지. 전체60명 표시 기준 및 카드 카탈로그2회귀 추가, 14+기존199=213 전체 검사 통과. build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저/온라인 미검증. 캐릭터 ID 실행 예외/신규 모듈 없음.
대상: CharacterSortService/CharacterCardDataService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.91 — 2026-10-06
사용자 기준 보정: 게임 시작 직후 본인이 직접 조절 가능한 평타 범위는 최대, 차징은 최대 충전 범위. 성장/발명/가호/파괴 등 추가 조건으로 바뀌는 공격은 초기 상태 유지. progressScale을 무조건 초기 해석하던 원인 제거하여 기본은 최대 endpoint, 성장 데이터에만 rangeBasis:initial 명시(큐리/칸). 레이즈192 근거리/룰리522 중거리, 큐리150 초근거리/메라모나550 중거리/지오핀650 중거리. 인투 산탄총 대체에 rangeAvailableInitially:true로 직접 전환 무기도 비교, 반격 저격총은 제외. 같은 공통 분류를 정렬/스타일/카드에서 사용. 신규 모듈/캐릭터 ID 실행 예외/실제 전투 동작 변경 없음. 15 사거리+기존199=214회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: CharacterSortService/quri/kan/intu/test-character-range/CHARACTER CONTRACT 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.92 — 2026-10-06
도움말 CC기 목록의 기존 침묵(SILENCE) 항목 설명을 사용자 지정 문구 “이동을 제외한 모든 행동이 제한됩니다.”로 수정. 중복 항목 추가 없이 기존 색상/구조 유지. 전투 동작 변경 없음. build/docs/check/verify 및 침묵 항목1개·설명 문구 확인 통과. 실제 브라우저 시각 미검증.
대상: Duels.html 및 README/project.json/DIVIDE TASKS.

## 3.0.0-character.93 — 2026-10-06
도움말 침묵(SILENCE) 색상을 StatusPresentation.cc.silence의 실제 RGB190,170,225와 동일하게 수정. 설명은 “이동을 제외한 모든 행동이 제한됩니다.” 유지. 전투 동작 변경 없음. build/docs/check/verify 및 도움말/실제 색상 일치 검증 통과. 실제 브라우저 시각 미검증.
대상: Duels.html 및 README/project.json/DIVIDE TASKS.

## 3.0.0-character.94 — 2026-10-06
도움말 Space 회피 스테미나400 하드코딩 제거. data-help-dodge-cost 값 영역에 HelpTabs.open이 실제 GAME_DATA.dodge.cost 원본을 참조하여 표시. 현재300, 도움말 열기/탭 전환마다 최신 설정 갱신. 전투 비용 변경 없음. 실제 HelpTabs VM 실행으로300 표시 및 설정325 변경 후 재표시 확인, build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/HelpTabs 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.95 — 2026-10-06
훈련장 리셋이 setupSession만 호출하여 기존 설정/캐릭터/맵을 재사용하던 원인 수정. TRAINING_DEFAULT_SETTINGS 단일 원본으로 모든 훈련 설정 복원, start에서 기록한 초기 선택 캐릭터 복원, DebugMapService.set(training-tilemap)으로 맵/파괴 상태 초기화 후 기존 setupSession으로 증강/개체/봇/더미/투사체/장판/예약/자원 재생성. 패널/캐릭터 명령창 정리·카메라/HUD 초기화 및 훈련 버튼 재구축. 온라인 리셋 동작 유지. 실제 Training.reset VM 검사(설정/캐릭터/맵 초기화 순서·반복 리셋·온라인 격리), 기존214회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: Training 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.96 — 2026-10-06
사용자 정정: 훈련장 리셋은 현재 변경한 캐릭터를 유지하고 해당 캐릭터의 전투 상태만 재생성. 초기 입장 캐릭터 저장/복원 제거. 기본 설정/기본 맵/증강/봇/더미 초기화 유지. Training.reset 실제 VM 실행으로 현재 선택 유지 및 기본설정/맵 복원 확인·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: Training 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.97 — 2026-10-06
지오핀 고무탄6종(기본/충격/전이/과반동/정밀/폭발) delivery.projectile.radius18→15. 캐릭터 본체/기어/게이지/피해/사거리/탄속 유지. 기존 공통 투사체 표시 및 충돌 반경 원본 변경. 지오핀80회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: geopin/GEOPIN 문서 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.98 — 2026-10-06
- 요청: 샤베트 스킬 빙결 파괴 효과 추가.
- 변경: sherbet.js 대상 위치/얼음 파편 데이터, Training.js 공통 링 선택형 파편 렌더링, README/project/DIVIDE TASKS/runtime 갱신.
- 조건: 기존 before-hit freeze 검사 유지. 기존 링 위치 target(미지원)을 hit-target으로 수정.
- 검증: 전체 회귀·빌드/문서/구문 검사. 실제 브라우저/온라인 시각 미검증.

## 3.0.0-character.99 — 2026-10-06
- 요청: 샤베트 빙결 파괴를 기존 연출로 처리.
- Training.js 신규 파편 렌더러 제거, sherbet.js 파편 속성 제거. 기존 hitImpactRing 및 hit-target 사용. README/project/DIVIDE TASKS/runtime 갱신.
- build/docs/check/verify/runtime 구문 및 게임플레이 회귀 통과. 실제 화면 미검증.

## 3.0.0-character.100 — 2026-10-07
장판 대응 추진 도약기→과반동 발사기, 이동 정지 대응 기존 과반동→충격 도약기로 교체. 과반동 반동100→200/사거리650, 주먹 사거리200→240/피해150→250. 충격 도약기는 발동 위치 반경220에250피해 후 조준 반대 방향220/200ms 점프. 기존 delivery.area/trajectory.arc/movement.move 재사용. 저회 확정 이벤트에 justDodged 표식 전달하여 지속 장판 저회를 실제 피해0으로 제외하던 버그 수정. 일반 무적/일회성 장판 제외 유지. 투사체/범위/장판 실제 저회 이벤트·3회 발명 및 제자리 광역/후방 점프 각도 회귀 추가. 전체216회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 플레이 미검증.
대상: geopin.js, ReactiveEquipmentService, initialization-equipment, test-geopin, GEOPIN/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.101 — 2026-10-07
고회전 레이저→고회전 발사기: 일반 고무탄2발100ms 간격, 각150/사거리650/기본 탄속32.643/반경15/벽튕. 과반동 탄속32.643 통일. 충격 도약 피해 반경220→110(뒤 점프220 유지). 정밀 발사기/폭발형 발사기 이름 변경. 주먹→이중 충격기: 압력250/피해250/기존 넉백, 미적중 시 끝점에서400/150 고무탄 발사. 공통 progressive-rect damage.missAttackId와 delivery.projectile.origin point로 기존 TriggeredAttackService 및 패킷 재사용. 적중/방어 접촉/벽으로 차단된 원점/원격 중복 생성 제외. 저회 확정에서 ReactiveEquipmentService.justDodge 직접 호출·즉시 flush 및 cause.execution 공격/출처 복원·누락 impact는 실제 전달 모듈로 복원. 이전 늦은 이벤트 listener 제거. 기존 CC/트랩/상태DOT 제외 정책 유지. 전체220회귀·빌드/문서/구문 통과. 실제 브라우저/온라인 플레이 미검증.
대상: geopin/ReactiveEquipment/JustDodge/initialization-equipment/AttackModule/EffectSpawn/test-geopin/test-structure 및 README/GEOPIN/CHARACTER CONTRACT/project/DIVIDE TASKS/runtime.

## 3.0.0-character.102 — 2026-10-07
전이 고무탄 발사기→전이 발사기. geopin.js 발명 목록/설명2곳 수정. README/project/DIVIDE TASKS/runtime 갱신. build/docs/check/verify/runtime 구문 통과. 전투 동작 변경 없음.

## 3.0.0-character.103 — 2026-10-07
지오핀 고무탄8종의 벽 반사 탄속 배율0.65→0.5(튕길 때마다 현재 속도의50%). 공통 LMB 발명품 설명에서 기본 고무탄의150을 모든 무기의 피해처럼 표기하던 ({damage}) 제거. 무기별 WEAPON 피해 설명 유지. 지오핀86회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: geopin.js/test-geopin/GEOPIN/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.104 — 2026-10-07
지오핀 스킬/무기 설명 간결화. 반복된 저회 충전 안내를 발명 설명에 통합, 어색한 반동/압력 표현 및 일정거리 외/내 표현 정리, 기본 무기 전환 문장 축약. 거리 조건은 실제 reactiveEquipment 기준값 참조. 폭발형의 잘못된 근거리 폭발 문구를 실제 적중/사거리 끝 폭발로 수정. 조건·피해 참조·조작 구분 유지. 전투 동작 변경 없음. build/docs/check/verify/runtime 구문 통과.
대상: geopin.js/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.105 — 2026-10-07
지오핀 사용자 지정 tooltipSkills13개 반영, 발사기으로→발사기로 조사 교정. 공격 참조/비용 표시/조건/전투 동작 유지. geopin.js/README/project/DIVIDE TASKS/runtime 갱신. build/docs/check/verify/runtime 구문 통과.


## 3.0.0-character.106 — 2026-10-07
시로(siro) 토끼 궁수 추가: HP1100/매우빠름4.5/적색#f05c68/파워형 초장거리 저격수. 평타200/1200/화염4초, 차징500ms2발/1000ms3발 및150~450소모. 백드래프트1100/폭발350/반경140/넉백/화염. 반격300ms선딜 뒤350/500ms점프·정확한 최고점에서 저장된출발지로화살·착탄에반경150/3초/500ms100피해 화살비. 미지정수치는초안. 기존모듈조합+선택형 charge.pelletCount/movement.move.progressAttacks/trajectory.arc.startHeight 확장, 캐릭터ID실행분기·전용피해/네트워크/FX없음. 공식61명등록·역할/문서/검사갱신. 시로14+기존220=234회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 실전 미검증. 모듈/수치/테스트는 docs/SIRO.md.
대상: siro/index/CHARACTER_RULES, ChargedAttackService, MovementAbilityService, ArcTrajectoryService, test-siro/test-structure/test-character-range/test-terdion/verify, SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 공통 모듈 확장 이유·범용 책임·실제 값은 SIRO 문서에 기록.
화살 비의 각500ms 틱마다 화염4초를 갱신하며 첫 틱 이후 상태 효과가 막히지 않도록 rainTick은 oncePerExecution을 지정하지 않는다. 재타격 시 화염 재적용 회귀 포함.


## 3.0.0-character.107 — 2026-10-07
시로 평타 탄당100/일반 산탄(동일 적 다중 적중 가능), 스킬 폭발200. 차징400ms 2발/800ms 3발, 홀드 중 소모 없이 발사 시100/150/200(증강 비용 배율 적용), 단계 비용 부족 시 무소모 미발사 및 상태 정리. 단발/홀드 비용 설명 분리. previewProjectilePaths로 실제1/2/3발 경로·최신 조준을 즉시 표시. 반격 미리보기는 점프 사거리 대신 출발지 화살 비 반경150/벽 차단 원. 점프높이70→140/시간500→700ms, apexHold0.2로 최고점140ms 체류 후 하강·350ms에 출발지 화살 발사. 설정 체력 구분선 설명400 하드코딩 제거·실제 WorldHealthBarSegmentPresentationService.step(현재300) 참조. 기존 모듈 선택형 costStages/apexHold 확장, 새 모듈/캐릭터ID 실행 예외 없음. 전체239회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 시각 미검증.
대상: siro.js, ChargedAttackService, ArcTrajectoryService, DisplaySettings, Duels.html, test-siro, SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 공통 확장 이유와 실제 파라미터는 SIRO 문서. 브라우저 실전 검수는 미완료.


## 3.0.0-character.108 — 2026-10-07
시로 평타/차징 평타·스킬 폭발·반격 화살 비의 화염을 기존 status.apply.data.flat/interval로500ms당25(초당50)로 변경. burnTickDamage25/burnTickInterval500 원본을 모든 화염 모듈이 참조하며 다른 캐릭터의 공통 화염값은 유지. 평타 해제 비용 단발150/400ms2발250/800ms3발350. 홀드 중 무소모·발사 순간 단계 비용 및 설명 참조 유지. 시로20회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro.js/test-siro/SIRO/README/project/DIVIDE TASKS/runtime. 신규 모듈 및 공통 실행 기능 변경 없음.


## 3.0.0-character.109 — 2026-10-07
시로 차징 산탄각을 charge.spread 0→0.48rad로 연속 증가: 400ms1단계0.24rad,800ms2단계0.48rad. 실제 투사체와 미리보기는 동일 dynamicSpec 사용. 일반 클릭 및400ms미만은 미리보기 없음, 기존 previewAtFull로 진행도1부터 경로 표시. 백드래프트 비용500→400. 평타150/250/350·화염25/500ms 및 기존 피해/점프 유지. 기존 charge 보간의 선택형 spread 확장·새 모듈/캐릭터ID 예외 없음. 전체240회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 시각 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 선택형 spread는 기존 산탄 count 보간과 동일 경로로 적용하며 실제 발사/온라인 진행도 복원/미리보기의 값을 공유한다.


## 3.0.0-character.110 — 2026-10-07
시로 stats.difficulty4→1. 전투 수치/동작 변경 없음. siro/README/SIRO/project/DIVIDE TASKS/runtime 갱신. 데이터 값 및 build/docs/check/verify/runtime 구문 검사 통과.


## 3.0.0-character.111 — 2026-10-07
시로 차징 탄퍼짐을 연속 증가에서 단계별 고정으로 정정:400ms미만 단발/미리보기 없음,400~799ms2발/전체각0.24rad 고정,800ms이상3발/전체각0.48rad 고정. 기존 lerp의 선택형 steps2를 사용하여 같은 단계에서 실제 발사각/미리보기 폭 불변. 조준 방향 추적은 유지. 평타/스킬 투사체 사거리 모두800. 비용150/250/350 및스킬400·화염25/500ms 유지. 전체240회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 신규 모듈 없음.


## 3.0.0-character.112 — 2026-10-07
사용자 실화면 연속 확대 보고에 따라 시로 차징의 연속 pelletCount/spread 및steps 설정 제거. charge.stages의 고정 모듈 구성으로 단발1발/0rad,1단계2발/0.24rad,2단계3발/0.48rad 직접 선택.400/800ms에서만 구성 전환. 기존 fullSpec을 다단계 선택형 목록으로 확장·캐릭터ID 실행 분기 없음. 기존 .111 자동검사에서는 단계 고정이 확인되어 실화면 원인은 미재현; 화면 수정 성공을 단정하지 않음. 모든1ms진행점/실제발사/미리보기 포함 시로21·전체241회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 일반 클릭 미리보기 없음/평타·스킬800/기존 비용·피해 유지.


## 3.0.0-character.113 — 2026-10-07

요청: 시로 탄퍼짐 대폭 축소, 헤브 추가, 반격을 커다란 범위 투사체로 표현.

시로 1/2단계 산탄 전체각0.24/0.48→0.08/0.16rad(기존의1/3),400/800ms 고정 단계 유지. 헤브(hab) 대양의 선장 추가: HP1300/빠름4.25/고유 갈색#9a6848/조건형 중거리 암살자. 출혈 대상 직접 타격마다 최대 스테미나50% 회복·출혈 DOT/피해0 제외. 작살200/650, 관통 추진 작살250/650 및 넉백180. 반격은 적/벽 관통 대형 범위 투사체350/750/반경100. 반격 공통 CC 규칙에 따라 출혈4초 추가. 미지정 수치 초안은 docs/HAB.md. 기존 Trigger/resource.restore/status.apply/투사체/넉백/반격 모듈만 조합, 캐릭터ID 실행 분기·신규 모듈 없음. 공통 확정 피해 패킷에 피격 순간 활성 상태 목록을 전달하고 target.status-active는 해당 snapshot을 우선하여 첫 출혈 타격과 기존 출혈 타격의 온라인 회복 조건을 일치. 전체253회귀(헤브12/시로21) 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저 시각/두 기기 WebRTC 미검증.

변경 파일: src/data/characters/{siro,hab}.js, src/data/characters/index.json, src/data/CHARACTER_RULES.js, src/core/TriggerConditionService.js, src/network/NetworkHitAuthorityService.js, tools/test-{hab,siro,structure,character-range,terdion}.cjs, docs/{HAB,SIRO}.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.114 — 2026-10-07

요청: 출혈1초/회복35%, 반격 극저속·크기3배 이상.

헤브의 모든 공격 출혈 지속시간4000→1000ms(bleedDuration 단일 원본), 피의 발자취 최대 스테미나 회복50→35%. 반격 delivery.range-projectile 탄속16→2(기존의1/8,87.5% 감소), 반경100→300(직경200→600,가로/세로3배). 크기는 공통 렌더와 충돌이 같은 모듈 반경을 참조. 기존 사거리750/피해350/적·벽 관통 유지. 새 모듈·캐릭터ID 실행 예외 없음. 헤브12·구조22회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저 시각/온라인 실전 미검증.

변경 파일: src/data/characters/hab.js, tools/test-hab.cjs, docs/HAB.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.115 — 2026-10-07
헤브 평타 작살 스테미나 소모량150→250. AttackSpec.cost 단일 원본을 공통 소비/설명 경로가 참조한다. 순수 데이터 수치 변경이며 신규 모듈 없음. 헤브12회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 실전 미검증.
대상: src/data/characters/hab.js, docs/HAB.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.116 — 2026-10-07

헤브 반격은 delivery.range-projectile.expireAtRange:false로 맵 경계까지 이동하고 rehitInterval1000으로 대상별1초 재타격. 출혈 모듈 제거·movement.neutralize-knockback(84/10)으로 교체. 출혈 중인 적에게 직접 피해를 줄 때 기존 hitImpactRing240ms를 대상 위치에 매 타격 표시·비출혈/DOT/피해0 제외. 인투 반격 저격총은 시간4초 대신 독립 progress 탄창4발(최초 반격 탄 포함)로 변경·일반 탄창 보존·4발 후 이전 권총/산탄총 복귀·RMB 강제 복귀 유지·저격 탄창4칸 하늘색. 레이카 검 평상시 표시·가호 시 #38bdf8 하늘색 및 광택/장식 강화·기존 회전 유지. 페이즈 저체력 강화 설명을 ALWAYS 불굴의 의지로 분리. 시로 활/헤브 작살은 기존 effect.spawn 월드 장식의 weaponSilhouette 스타일로 표시·mode.toggle 공격 모션 및 시로 charged-attack-state 시위 당김. 새 모듈 type/캐릭터ID 실행 예외 없음. 기존 CharacterTriggerEffectService에 effect.spawn 처리 및 ModeGearPresentationService에 범용 무기 스타일/팔레트/모션 옵션 확장. 전체265회귀 및 build/docs/check/verify/runtime 구문 통과. Canvas 무기 표시 확인, 실제 게임 브라우저/두 기기 WebRTC 미검증.
대상: characters/{hab,intu,phase,reika,siro}.js, CharacterTriggerEffectService.js, ModeGearPresentationService.js, tools/test-{hab,siro,geopin,hab-projectile,weapon-updates}.cjs, docs/{HAB,SIRO,WEAPON UPDATES}.md, README/PATCH LOG/project/DIVIDE TASKS/runtime.


## 3.0.0-character.117 — 2026-10-07

- 요청/이유: 월드 무기 디자인/모션 개선·단색 표현 통일·미래 모든 캐릭터 공용 제작 구조·레이카 비용 부족 미리보기·인투 재장전 반투명/탄창색/반격4발 누적.
- 결과: 검·활·작살·총·스패너·기어의 월드 무기 이미지를 effect.spawn renderType:weaponImage와 WEAPON_IMAGE_DEFS 목록으로 통합. 단색 면과 동일 색 계열의 밝은 윤곽/내부선 사용. 레이카 대검 scale1.25→1.85, 가호 하늘색/회전/장식 유지. 시로 활 시위 당김 유지·차징 화살 제거·420ms 큰 발사/복원 모션, 헤브 작살480ms 투척/회수 모션. 공용 alphaVariants로 인투 재장전 동안 투명도28%, 종료 즉시 원복. 인투 별도4칸 저격 탄창 제거·기존12칸 탄창 전체 하늘색, 저격 발사도 일반 탄창1 소모. 반격마다 변환탄4발 추가(최초 반격 탄 포함)·누적·재장전 후 잔량 유지·RMB 강제복귀 시 폐기. ProgressStateService의 선택형 growMax로 유한 상한을 필요한 만큼 확장해 기존 JSON snapshot 재사용. 레이카 일반 RMB 선딜 미리보기에 requireResource:true, 공통 previewReady가 실제 증강/스테미나 할인/체력 대체 비용을 확인하고 부족하면 후속 잠금까지 중단. 캐릭터ID 실행 예외·새 gameplay 모듈 type 없음. 전체270회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 Canvas12개 상태 확인; 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 변경: src/data/WEAPON_IMAGE_DEFS.js; 7명 캐릭터(reika/nyu/siro/hab/intu/van/geopin); ModeGearPresentationService; VanWrenchDurabilityPresentationService; TrainingWorldDrawService; ProgressStateService; AttackService; AbilityModuleService; test-geopin/test-weapon-updates; docs/WEAPON IMAGE GUIDE, WEAPON UPDATES, HAB, SIRO; README/project.json/DIVIDE TASKS 및 생성 runtime.js.
- 기존 모듈: effect.spawn/Trigger 조건·mode.toggle·state.progress·state.window·gauge.segmented/colorVariants·preview.create. 기존 무기 렌더를 데이터 목록으로 일반화하고 중복 렌더 삭제; 별도 입력/피해/네트워크 시스템 없음. growMax는 고정4 상한으로 누적을 표현할 수 없어 명시 add에만 유한 용량 확장. 반투명 옵션은 미래 모든 무기의 재장전/비활성 상태에 재사용.
- 검증: 전체270회귀·Canvas12상태·build/docs/check/verify/runtime 구문. 실제 브라우저 및 두 기기 WebRTC 미검증. 훈련장 검수 권장: 레이카 부족/충분 비용과 가호 대검, 시로 차징/해제, 헤브 투척, 인투 연속 반격·12발 소모/재장전·RMB 복귀 및 상대 투명도, 반 파괴/복구·뉴 투척/귀환·지오핀 무기 교체.


## 3.0.0-character.118 — 2026-10-07

- 요청: 시로 활 날렵하게/반격 발사 추가 모션·기존 무기 원복/검 손잡이 완화·같은 계열 색 허용·인투 변환 탄환 수만큼 칸 색 변경.
- 결과: 시로 활을 폭이 좁고 끝이 뾰족한 날렵한 곡선으로 조정·차징 화살 미표시 유지. 반격 counterArrow 실제 발사(점프 최고점)에도 기존 mode.toggle siro-weapon-motion을 실행하여 점프 시작/화살 발사에 각각 모션. 인투 총3종·뉴/레이카 검·헤브 작살·반 양쪽 턱 스패너·지오핀 기어의 .116 형상/팔레트를 공용 WEAPON_IMAGE_DEFS에 복원. 뉴/레이카 손잡이 폭.23→.16·끝 장식62% 크기 및 낮은 대비, 레이카 확대1.85와 가호 하늘색 유지. 단색 강제 규칙 철회·같은 계열 명암/장식색 허용, 공용 weaponImage/모션/재장전 반투명 구조 유지. 인투 기존12칸 탄창은 남은 변환탄 수만큼만 앞쪽 활성 칸을 하늘색, 나머지는 기존 색. 반격4발 누적/실제발사1발 소비/재장전 잔량 유지/RMB 강제복귀 유지. gauge.segmented 공용 highlightCountRef/highlightColor를 추가하고 색 변형은 렌더 인자로 전달해 프레임마다 segment 배열을 복제하지 않음. 전체274회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 파일: WEAPON_IMAGE_DEFS/ModeGearPresentationService; characters/siro,reika,van,intu; WorldGaugeModuleService/SegmentedGaugePresentationService; test-siro/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,SIRO; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈/이유: 기존 effect.spawn weaponImage 데이터 형상을 복원·palette 경로 확장, 반격 후속 화살에 기존 mode.toggle after-attack 추가. 색상만 바꾸는 colorVariants는 실제 잔량별 칸을 표현할 수 없어 기존 gauge.segmented에 선택형 강조 개수/색을 확장. 별도 게임플레이/네트워크 모듈·캐릭터ID 분기 없음.
- 검증: 전체274회귀·탄창 실제 렌더0/1/3/7/20변환 및 발사 소모/색 우선순위/월드 연결, 시로 실제 MovementAbility 최고점 발사 모션/중복 방지/원격 시간 복원, Canvas12상태 및 build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.


## 3.0.0-character.119 — 2026-10-07

- 요청/결과: 헤브 피의 발자취 Trigger에 target.kind-not-in kinds:[summon,trainingBot]를 추가하여 출혈 소환수/훈련 봇 직접 타격의 스테미나 회복과 hitImpactRing 모두 제외. 플레이어/더미 회복35%·DOT/피해0 제외 정책 유지, 항시 설명에 소환수·봇 제외 명시. 사이엔 killRewardProgress의 절격 전용 attackIds 제한 제거·모든 공격의 적 처치에서 격 최대8 충전/절격 활성화. ALWAYS 격의 차이 설명을 “적 처치 또는 격 최대치 시 절격 활성화”로 변경하고 절격 설명의 처치 최대 충전 중복 문구 제거. 기존 CharacterKillProgressService/처치·온라인 확정 이벤트/ProgressState snapshot 재사용. 아군/자신/소환수 처치 제외와 기존 사망방지 치명타 처리 유지. 새 실행 모듈/캐릭터ID 분기 없음. 전체279회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/두 기기 WebRTC 미검증.
- 파일: characters/hab,cyien.js; TriggerConditionService.js; tools/test-hab,test-cyien,test-weapon-updates.cjs; docs/HAB,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: 헤브 기존 damage-dealt Trigger/target.status-active/impact.direct/resource.restore/effect.spawn 유지·target.kind-not-in 공통 대상 종류 조건으로 체인 전체 제외. 사이엔 기존 killRewardProgress/state.progress set-max와 entity-defeated/network-hit-confirmed를 사용하고 공격ID 제한만 제거. 새 피해/처치/네트워크 시스템 없음.
- 검증: 전체279회귀(사이엔5 신규). 헤브 제외 대상/플레이어/더미 및 권위 상태 snapshot·FX 제외. 사이엔 모든 AttackSpec 처치 이벤트,8 충전/절격 선택, 사용 뒤 재처치,자신/아군/소환수/사망 공격자 제외,온라인 원격 권위 제외/로컬 확정,JSON 상태 복원/설명 단일화. 실제 브라우저/두 기기 온라인 미검증.


## 3.0.0-character.120 — 2026-10-07

- 요청/결과: 장착 무기의 mode.toggle을 선행 예약의 after-attack 대신 실제 투사체 생성/범위 실행의 on-delivery로 이전. 공통 AttackModuleService.onDelivery와 실행 effectKey로 첫 실제 전달에서1회 모션·산탄/반복 중복 제외·선딜 취소/사망은 미발동. AreaAttackService.execute/ProjectileService.spawn 실제 전달 경로가 실행하며 기존 Counter/Ability 선딜/원격 commit/ModeState snapshot 사용. 직접 전달 없는 시로 반격 점프 시작은 after-attack 유지·최고점 화살은 실제 생성 시 추가 모션. 레이카 확대 시 선도 배율 증가하던 문제를 공용 외곽1.8px/내부1.35px 상한으로 수정·가호 glow10→5. 모든 윤곽을 캐릭터/무기색+흰색65%의 밝은 계열로 통일. 뉴/레이카 손잡이를 면이 있는 그립·4줄 감김·끝마개로 교체·기존 작은 끝 장식 제거. 헤브 작살은 사용자가 선호한117 형상을 복원 후 날/축 비율과 면 그립/5줄 감김 정리. 인투 변환탄 강조를 남은 활성 탄창의 오른쪽부터 채움(highlightFrom:right), 개수/누적/소모/재장전 유지. 전체282회귀·build/docs/check/verify/runtime 구문 통과. Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 대상: AttackModuleService/AreaAttackService/ProjectileService·ModeGearPresentationService/WEAPON_IMAGE_DEFS/SegmentedGaugePresentationService·characters(hab,siro,reika,intu,van,nyu)·test-weapon-updates/geopin/hab/siro·docs(WEAPON IMAGE GUIDE,WEAPON UPDATES,HAB,SIRO,CHARACTER CONTRACT)·README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: effect.spawn weaponImage/기존 mode.toggle에 실제 전달 on-delivery 옵션 확장. after-attack은 지연 Delivery 예약 직후이므로 실제 공격 시점을 표현하지 못했음. 공용 실제 생성/판정 hook과 execution effectKey로 기존 Trigger/ModeState snapshot 재사용·중복/취소 방지. 새 전용 실행/네트워크 시스템 없음. gauge.segmented의 highlightFrom:right는 기존 강조 개수에 방향만 추가.
- 검증: 전체282회귀·실제300ms 예약299/300 경계·취소/사망 미모션/skipWindup 즉시·실행당1회·최고점 후속/원격 시간축 기존회귀·오른쪽 활성 칸 강조순서·외곽1.8/내부1.35 제한/밝은선/면그립. 실제 Canvas12상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.


## 3.0.0-character.121 — 2026-10-07

- 요청/결과: 레이카 가호 전후 대검의 좌표/경로/장식을 동일하게 맞추고 태양 장식을 원판과4개의 짧은 빛살로 단순화. 가호 하늘색 계열 면/밝은선/glow5 유지·가호 전용 큰 원/검날 마름모 장식 제거. 헤브 평타/스킬의 기존 weapon-projectile kind에 실제 공용 anchor-cross style을 연결해 일반 탄환 fallback을 수정. 반경14/18·피해/출혈/탄속/사거리/관통 유지·연결선 없음. 인투 권총은 기존 모드 상태를 motionStateKey로 읽어 시로와 동일한420ms 반동/복원 모션·산탄총/저격총 반시계 회전과 재장전 투명도 유지. 스야 서리 대낫과 타우 교차 사슬낫2개/체인/추의 순수 형상을 WEAPON_IMAGE_DEFS에 추가·공용 weaponImage로 후면 표시. 실제 공격 on-delivery의 mode.toggle로 스야 평타/반격 및 타우 일반/충전평타/스킬/반격 회전·선딜 대기 미발동. 기존 모듈/ModeState/은신/전환효과/원격snapshot 재사용·캐릭터 전용 실행/그리기/네트워크 코드 없음.
- 원인: 헤브 presentation.kind만 지정하면 실제 렌더의 anchor-cross 스타일 분기로 들어가지 않고 일반 투사체 fallback을 사용했음. 두 공격에 기존 무기투사체 스타일 명시. 가호 전용 형상과 empowered 장식을 데이터에서 제거·색/글로우만 유지.
- 파일: WEAPON_IMAGE_DEFS.js; characters/reika,hab,intu,sya,tau.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,HAB; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조: 기존 effect.spawn weaponImage/형상목록·mode.toggle on-delivery·projectile.presentation anchor-cross·motionStateKey를 데이터로 조합. 새 실행 모듈/서비스/캐릭터ID분기 없음. 공격모듈 끝에 회전 추가해 기존 인덱스 참조 보존.
- 검증: 전체286회귀(무기25)·헤브 실제발사 스타일/수치/관통·레이카 가호 전후 실제렌더경로 동일/글로우·인투 반동/420ms복원/원격시간/다른총회전·스야/타우 실제전달당1회/원격복원/숨김/사망·9명 공용유한좌표·Canvas16상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 레이카 가호 전환 시 형상/글로우·헤브 평타/스킬 원/+투사체·인투 권총 반동/재장전/총교체·스야 은신과 반격선딜/대낫·타우 충전평타/추격/반격선딜/사슬낫.


## 3.0.0-character.122 — 2026-10-07

- 요청/결과: 마지막 정정에 따라 스야 낫은121의 날/막대 형상을 좌우반전·기울기 반전(angle+.25)하고 시계방향2π로 회전. 낫의 별도 그립/감김선 제거. 타우 날을 각진 등선/안쪽 절삭곡선으로 새로 설계·막대는 감김없이 단순화·사슬은 더 큰6링크/추. 합쳐진 crossed-chain-scythes를 제거하고 chain-scythe-left/right의 별도 worldEffectModules로 분리. 같은 실제공격1회 모드snapshot을 왼쪽-2π/오른쪽+2π로 각각 해석·각 이미지의 기준점에서 독립 회전. 반은 내구도0에서 small-wrench 후면 이미지·내구도1이상 큰 wrench. 초기800 fallback으로 생성 직후 중복/작은 무기 오표시 방지. 작은 스패너는 큰 것보다 작은 scale1.5/한쪽 턱·둥근 끝이며 lmbThrown 실제발사에 기존 on-delivery 회전 추가. 기존 은신/전환효과/밝은윤곽/원격모드/내구도 복제를 그대로 사용. 새 실행서비스/렌더분기/모듈type 없음.
- 정정 반영: 스야 최초의 반시계 지시는 마지막 좌우반전/시계방향 지시로 대체. 스야 날을 추가 재설계하지 않음. 타우만 날 형상 재설계.
- 파일: WEAPON_IMAGE_DEFS; characters/sya,tau,van; tools/test-weapon-updates,test-geopin; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: 기존 weaponImage/rotationRadians/조건식·mode.toggle on-delivery·ModeState 및 ProgressState snapshot. 타우 개별회전은 config2개이며 상태/타이머는 하나. 작은스패너는 기존내구도만참조·전투수치/피해/수리판정 유지.
- 검증: 전체289회귀(무기28)·스야반전/시계회전·타우회전각부호반대/별개Canvas호출/원격일치·반 초기800/799/1/0/복구800 상호배타/작은평타1회모션/원격내구도와모드복원·Canvas19상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 평타/반격시계·타우 평타/강화평타/스킬/반격의각각반대회전·반파괴/투척5타복구/은신 및 상대화면전환.


## 3.0.0-character.123 — 2026-10-07

- 요청/결과: 타우의 늘어진 사슬/추를 제거하고 손잡이에5회 감긴 사슬 형태로 교체·각 낫 반대방향 독립회전 유지. 스야는 서리 결정이 솟은 각진 등선·큰 곡선 절삭날·청색 얼음 면/결정 축/끝장식으로 대낫 재설계·감긴 그립 없음·오른쪽 날/시계회전 유지. 반 작은스패너 scale1.5→2(33.3% 확대), 큰스패너2.73 유지. 로온 후면 melon-slice/melon-slush 공용형상 추가·field.exists activeOnly:true로 실제4초 빙수지대 중 빙수·없음/효과종료/afterlife/rewardOnly에서 조각멜론·기존5초 잔류 스킬차단 조건은 유지. 기존 mode.toggle on-delivery로 실제 평타/스킬/반격 투척 모션. 모든 장착무기는 죽기직전 종류/회전/차징/투명도를 캡처하고 사망점에160ms 유지 뒤1600ms 선형 페이드. HealthService는 실제 사망/상태리셋 전에 캡처·Presentation.deathLaunch의 실제사망/온라인confirmed에서만 표시·부활대체 연출 제외. 원격은 마지막 실제표시 샘플 사용·미노출 알파0 무기는 미표시. ModeGearPresentationService 공용 prepass가 죽은본체/UI 없이 무기만 그리고 만료삭제·중복확정 미재시작·새사망 교체·EffectSpawnService.clearAll에서 전체정리. 잔류샘플은 독립 최소 Entity/고정pose이며 게임상태/네트워크를 새로 만들지 않음. 페이드 시 글로우 알파도 감소해 그림자가 남는 문제 방지.
- 파일: WEAPON_IMAGE_DEFS; characters/van,roon; ModeGearPresentationService/HealthService/Presentation/EffectSpawnService/Training/TriggerConditionService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조/이유: 기존effect.spawn weaponImage/형상목록·mode.toggle on-delivery·field.exists사용. 실제로보이는4초와복구/보상잔류5초를구별할activeOnly선택옵션확장. 사망시상태리셋으로가호/총/차징각도가없어지므로공통렌더표본을고정해사용·KO확정흐름과clearAll수명주기재사용. 살아있는이미지렌더/전투판정/입력제약변경없음·캐릭터ID실행분기/전용네트워크패킷없음.
- 검증: 전체294회귀(무기33)·로온실제필드3999/4000ms와기존5초조건·실제치명타상태리셋전캡처/KO연결·가호/회전/원격재장전알파보존·무기만고정렌더/160+1600페이드/만료/중복/새사망/공용clearAll·미노출0/부활대체제외·Canvas24상태/글로우동시페이드·build/docs/check/verify/runtime구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우손잡이사슬/별개회전·스야서리대낫·반파괴작은무기확대·로온지대4초전환·각무기의일반/가호/장착/은신/재장전상태사망 및 온라인확정/라운드리셋.


## 3.0.0-character.124 — 2026-10-07

- 요청/결과: 타우의 왼쪽 낫은 시계방향(+2π), 오른쪽 낫은 반시계방향(-2π)으로 반전. 각 낫의 독립 기준점/실제 공격 시점/공유 모드 snapshot은 유지한다. 낫날을 연속 곡선의 초승달 절삭날과 안쪽 면으로 재설계하고, 손잡이 목 아래부터 끝마개까지11개의 대각선 사슬 링크를 감았다. 로온 조각 멜론의 껍질/과육/씨앗과 윤곽 기준색만 짙은 녹색/올리브 계열로 변경해 밝은 캐릭터 본체와 구별한다. 멜론 빙수 이미지·캐릭터 색·전투 수치·장판 전환·사망 페이드는 유지한다.
- 파일: src/data/WEAPON_IMAGE_DEFS.js; src/data/characters/tau.js,roon.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE.md,WEAPON UPDATES.md; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조: 기존 순수 형상/weaponImage 색/rotationRadians 설정 조합. 실행 서비스나 캐릭터별 렌더 분기 추가 없음.
- 검증: 전체294회귀(무기33), 로컬/원격 회전 방향 대칭 및 두 이미지 실제 drawBehind, 공용 Canvas24상태, 이전123과 소스 비교로 타우/로온 외 캐릭터 및 멜론빙수 불변 확인. build/docs/check/verify/runtime 구문. 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우 평타/스킬/반격 독립회전과 손잡이 사슬, 로온 조각 멜론 대비 및 빙수 전환.


## 3.0.0-character.125 — 2026-10-07

- 요청/결과: 샤베트 후면에6방향 눈결정 snow-crystal 추가. 평소 반투명48%, 실제 평타/분쇄/반격 공격 시60도 회전하며 선명해진 뒤 복원. 평타 윈도 시작에는 모션이 없고 실제 progressRect가 생성되는 normal/frozen 해결 시 after-attack으로 시작한다. 실제 빙결 부여 성공에는 기존 contractingPullRing 하늘색 수축 링300ms, 피격 직전 빙결된 적에게 매 타격 시 hitImpactRing 밝은 확산 링190ms. 기존 분쇄 빙결해제 링300ms는 유지하며 상대에게도 표시한다. 슈비 electronic-shotgun 형상은 각진 에너지 셀/상하 레일/두꺼운 총구/하부 전원부와 붉은 계열 면·밝은 윤곽. 실제 평타/반동샷/반격 발사 시 공통420ms 반동/복원·산탄은 공격당1회. 기존 무기와 같은 은신/원격 모드 복원/사망 페이드 경로를 사용한다. 피해/CC 지속시간/스테미나/사거리/탄속/판정 변경 없음.
- 구조/이유: 공용 effect.spawn presentationAuthority:target은 피격자 시뮬레이션 권위에서만 생성하고 기존 effect-spawn 패킷을 피격자 ID로 복제한다. 기본 공격자 권위는 그대로다. status.apply onAppliedEffects는 실제 apply 성공 뒤 기존 effect.spawn만 실행하므로 거절된 CC/미적중/회피에서는 빙결 성공 연출이 없다. 공격자/관전자 미러는 중복 생성하지 않는다. target.status-active-before-hit 공용 조건으로 분쇄가 상태를 지운 뒤에도 해당 타격의 빙결 타격 연출을 유지한다. 캐릭터 ID 분기/새 모듈 type/전용 렌더/새 네트워크 패킷 없음.
- 파일: src/data/WEAPON_IMAGE_DEFS.js; src/data/characters/sherbet.js,shubi.js; src/combat/AttackModuleService.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE.md,WEAPON UPDATES.md,CHARACTER CONTRACT.md; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체299회귀(무기38), 실제 공용 Canvas28상태 렌더, 빙결 성공/실패·피격 전 상태·분쇄 후 해제·두 대상/매 타격·온라인 피격자 권위와 replay/공격자 효과 불변·산탄1회 모션/원격 복원·build/docs/check/verify/runtime 구문. 실제 게임 브라우저 및 두 기기 WebRTC 미검증.
- 플레이검수: 샤베트 평타 윈도 대기/일반/과냉각·분쇄 빙결해제·반격 여러 적 빙결/빙결 적 연타·상대 화면 링. 슈비 평타/우클릭/반격 산탄 모션·은신과 두 캐릭터 사망 무기 페이드.


## 3.0.0-character.126 — 2026-10-07

- 요청/결과: 타우 손잡이 대각 사슬11개→5개로 간격 확대·낫날을 단일 면의 각진 후크날로 재설계·왼쪽 반시계/오른쪽 시계로 다시 반전. 슈비는 개머리판/긴 레일 샷건에서 큰 슬라이드/총구·두꺼운 그립·트리거 가드·전자 패널이 있는 거대 권총형으로 변경하고 인투 산탄총처럼 실제발사 시 반시계1회 회전350ms. 장착 무기 기본 알파85→72%, 기존 개별 반투명/재장전 비율은 유지. 검/마검/작살의 긴 베벨선을 제거·눈결정 면을 한 색으로 통일·타우 광택 면 제거. 스야 서리대낫 형상/색/빙면은 그대로 유지한다. 샤베트 빙결적 타격 연출은 분쇄에만 남기고 링190→300ms/최대반경34→48. 빙결성공 수축 링 반경48→68/300→420ms/선3으로 보강. 빙결 부여 및 빙결 적 스킬 타격에 자기 무기 이미지가16% 확대되고 선명해졌다가500ms 안에 복원되는 공용반응 추가. 로온은 빙수 게이지 완성/반격으로 실제 빙결시킨 경우 같은 무기 반응. 헤브는 기존 피의발자취 유효 출혈타격마다 작살 무기 반응·기존 대상 링/회복 및 소환수/봇/DOT 제외 유지.
- 구조/이유: weaponImagePulse는 effect.spawn의 순수 시각효과로 target:source를 사용해 공격자 무기 ID를 targetEntityId에 보존한다. EffectSpawnService 생성/기존 effect-spawn 복원에서 ModeGearPresentationService.react가 짧은 시각 상태만 갱신하고 렌더가 확대/알파반응을 읽는다. 별도 전투 모드/캐릭터 ID 분기/네트워크 패킷 없음. 피격자 권위로 보낸 효과도 원래 공격자 ID를 유지하여 해당 무기만 반응한다. 상태 성공 onAppliedEffects 공용 경로를 state.progress.onFull에도 연결해 실제 CC 성공에서만 실행하며 status.apply 성공도 같은 함수 사용. 거절/미적중에는 무기 반응 없음. 시간만료/clearAll에서 정리. 기존 전투 수치/모듈 판정/CC시간 변경 없음.
- 샤베트 표시 보정: 이전 작은/짧은 피격 링만으로 눈결정 자체의 반응이 없었다. 이번에는 대상 링의 크기/수명을 보강하고 자기 무기 확대/선명도 반응을 함께 표시한다. 실제 진행형 EffectSpawnService 피해 경로에서 생성/복원/렌더까지 확인했으며 미검증 온라인 실기기의 원인을 단정하지 않는다.
- 파일: WEAPON_IMAGE_DEFS; characters/tau,shubi,sherbet,roon,hab; AttackModuleService/EffectSpawnService/ModeGearPresentationService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체301회귀(무기40), 공용 Canvas31상태, 실제 EffectSpawnService 진행형 평타→빙결→링/무기반응 생성·JSON 효과 복원/원래 공격자ID·확대 렌더/시간 만료/clearAll, 로온 게이지 완성 성공/실패, 헤브 출혈당 반응과 제외조건, 샤베트 스킬만 빙결타격 연출, 슈비 반시계 발사1회/원격, build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우 좌우회전/사슬간격·슈비 세공격 반시계·샤베트 과냉각/반격 빙결 및 분쇄 빙결타격·로온8스택/반격 빙결·헤브 출혈적 타격/봇 제외·상대화면 무기 반응.


## 3.0.0-character.127 — 2026-10-07

- 요청/결과: 슈비 전자식 거대권총을 둥근 후면/두꺼운 슬라이드·총구/곡선 그립/열린 트리거 가드/단순 전자 패널로 재설계. 기존 실제발사 반시계 회전 유지. 레이카 일반/가호 대검과 헤브 작살의 날 중앙선 복원: 이전 무광 정리에서 기능적인 중앙선까지 제거했던 것을 교정한다. 샤베트 눈결정 scale2.3→1.955(15% 축소), 빙결 성공/빙결된 적 분쇄 타격에서 기본 무기 확대 반응 대신 눈결정 표본이650ms 동안1→1.55배 퍼지고 알파가 줄어드는 잔향. 빙결 성공 contractingPullRing 점선 링 제거·분쇄의 기존 확산/해제 링은 유지. 루네프 후면 열린 spellbook 이미지·보라 계열 표지/페이지·중앙 책등·책갈피·글줄 추가. 실제 평타/연쇄/화염구/얼음/번개/반격 실행 시480ms 책이 떠오르고 기울어지며 공용 leaf 페이지가 넘어갔다 복원. 선택 윈도 대기와 후속 화염구 폭발은 책 모션 제외·반복 범위는 실행당1회.
- 구조: weaponImageEcho는 기존 effect.spawn 순수 시각효과. EffectSpawnService 생성과 기존 effect-spawn 복원에서 owner targetEntityId로 실제 장착무기의 종류/각도/pose/알파 표본을 캡처한다. 공용 ModeGearPresentationService.drawEchoes가 본체 뒤에 확대/페이드하고 기본 무기 크기는 바꾸지 않는다. 같은 Entity 표시/은신 알파 적용·최대8잔향/수명만료/clearAll 정리. 별도 전투 모드나 캐릭터 ID 분기/새 네트워크 패킷 없음. 책 leaf는 순수 형상 옵션이며 공용 pose.pulse로만 페이지 경로를 움직인다. 전투 수치/판정/CC 지속시간 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/sherbet,runef; EffectSpawnService/ModeGearPresentationService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체302회귀(무기41), 공용 Canvas33상태, 실제 진행형 평타 빙결→잔향 생성/점선 링 없음·확대와 알파감소/기본무기 크기 유지·JSON 효과 복원 ownerID·만료/clearAll, 루네프6공격 실제전달1회/원격/페이지 렌더·선택대기/후속폭발 제외·15%축소. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 샤베트 과냉각/반격 빙결·빙결적 분쇄에 잔향·점선 링 없음·15%축소. 슈비 디자인/회전. 레이카/헤브 중앙선. 루네프6공격 및 원격/은신/사망 책 이미지.


## 3.0.0-character.128 — 2026-10-07

- 요청/결과: 슈비를 각진 두꺼운 슬라이드/짧은 대형 총구·기울어진 면 그립·열린 트리거 가드·통합 전원 패널의 전자식 거대권총으로 재설계. 실제발사 반시계 회전 유지. 루네프는 실제 화염/얼음/번개/바람 실행 후600ms 책 전체를 해당 빨강/하늘색/노랑/초록 계열로 변경 후 복원. 선택 대기와 후속 폭발은 색 재발동 제외. 샤베트 빙결 평타/반격의 공통 피격 링 제거·스킬 분쇄의 기존 하늘색/밝은 링은 유지. 눈결정 잔향은 생성 위치·크기·각도·사용모션 표본에 고정되어 확대/페이드만 하며 이동/회전/크기 변경을 따라가지 않는다. 타우 스파크3충전 동안 양쪽 낫날에 짧은 전기선 점멸·소모 후 제거. 공용 기본 불투명도72→60%, 샤베트 평상시48→40%. 재장전 비율/사용 중 선명해지는 표시 유지.
- 구조: 공용 weaponImage activityColors는 mode.toggle on-delivery의 changedAt을 읽어 가장 최근 마법 색만 수명 내 적용. 기존 ModeState serialize/applyRemote 재사용·공용 tintedFill로 기존 명암을 유지해 해당 계열로 변환. sparkConditions는 기존 Trigger 조건 평가, WEAPON_IMAGE_DEFS.sparks는 순수 경로 목록. 사망/잔향 표본은 활성색/스파크까지 캡처. drawEchoes는 생성 좌표와 현재 좌표의 차이를 먼저 적용 후 표본 Entity/모션으로 렌더하여 생성점 고정. presentation.suppressHitImpactRing 옵션은 공통 피해 바인딩에서만 기본 피격 링을 제외·게임플레이 영향 없음. 캐릭터 ID 분기/새 전투 모듈/패킷 없음. 피해·CC·사거리·탄속·스테미나 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/sherbet,runef,tau; ModeGearPresentationService/TrainingPresentationBindings; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체306회귀(무기45), 공용 Canvas38상태 렌더 확인. 잔향 이동/회전/크기 변경 후 위치·표본 고정, 루네프4마법색600ms/최신색/원격/사망 표본, 타우2충전/3충전/소모/원격, 실제 damage-applied 바인딩의 빙결 링 제외/기존 링 유지. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비 디자인/실제발사 회전. 루네프4마법별 색/반복 번개에서1회/0.6초 복원. 샤베트 빙결 링 없음·이동 중 잔향 생성점 고정. 타우 풀충전/소모. 전체 기본 투명도·재장전/은신/사망 표시.


## 3.0.0-character.129 — 2026-10-07

- 요청/결과: 스야 서리대낫 날의 밝은 분할 면2개/연결선을 제거하고 단일 무광색 날로 변경·서리 외곽/축장식/회전 유지. 슈비는 짧고 넓은 전자총열·둥근 후면·원형 전원부·두꺼운 총구와 곡선 면 그립/열린 트리거가드로 새 거대권총 설계·기존 실제발사 반시계 회전 유지. 샤베트 빙결 시 빨간 확장 원의 실제 원인은 weaponImageEcho가 Training.fx 기본 fallback 빨간 원에 진입하는 경로였다. 전용 무기 renderer에서 이미 처리된 Echo/Pulse를 일반 FX그리기 루프에서 제외해 기본 원을 제거. 기존 피격 링 제외 옵션은 HitContactFeedbackService에도 연결하여 원격 contact 경로 일치. 타우3충전은 전기선/글로우 대신 두 낫을 노랑 계열로만 변경·소모 후 원래색 복원. 루네프4마법 책 색은200ms 유지 후400ms 면/윤곽 모두 원래색으로 페이드. 카논 정면 맨주먹 이미지 추가·두 RMB 스킬 실제 사용 후600ms 신발바닥으로 표시 후 주먹 복원·평타/반격 실제 전달에 공용 타격모션.
- 구조: 공용 activityTint는 state changedAt 기반 duration/fadeMs와 Trigger 조건 기반 지속색을 지원하며 mixColor로 기존 면색/마법 계열과 기본/활성 윤곽을 보간. 표본 tintAmount도 캡처해 잔향/사망 중간색 고정. 카논은 기존 mode.toggle on-delivery·state.window after-attack·state.exists/absent activeOnly:true·TimedActionState 원격복원 조합이며 캐릭터 전용 렌더/새 모듈/패킷 없음. 무기제어 Echo/Pulse는 일반 FX fallback을 사용하지 않고 기존 수명/복제/clearAll과 공용무기 렌더만 사용. 피해/CC/사거리/스테미나/탄속 변경 없음.
- 이전 수정 정정:128에서 기본 피격 링만 제외했으나 Echo/Pulse의 일반 FX fallback을 놓쳤다.129는 실제 Training FX 루프 재현 검사로 해당 빨간 원을 제거한다.
- 파일: WEAPON_IMAGE_DEFS; characters/runef,tau,kanon; ModeGearPresentationService/Training/HitContactFeedbackService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체309회귀(무기48), 공용 Canvas41상태 렌더 확인. 실제 Training FX루프 Echo/Pulse 원 미출력/기존 피격 링 유지, 실제 피해 바인딩+contact 빙결 링제외, 책200/400/600ms 면·윤곽 페이드/중간 사망색 캡처, 타우 노랑/소모/원격/전기선없음, 카논 두스킬599/600ms/연속갱신/원격/실패/공용형상. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 무광 날/슈비 전자권총·샤베트 빙결과 잔향에 빨간 원 없음·타우 완충 노랑/소모·책 색 페이드·카논 두 발차기600ms 신발바닥/주먹 복원/공격 모션.


## 3.0.0-character.130 — 2026-10-07

- 요청/결과: 슈비를 직선/모따기 위주의 계단형 총열·각진 두꺼운 총구/프레임·기울어진 면 그립·사각 전원부로 재설계·원형 패널/곡선 몸통 제거. 카논 정면 주먹은 높이가 다른4손가락 마디·접힌 손가락선·옆 엄지·좁은 손목으로 재설계, 밑창은 둥근 발끝/좁아지는 중간/뒤꿈치·지그재그 접지패턴으로 재설계. 모든 실제 공격에420ms/28% 확장의 작은 무기 잔향·스킬은 신발표본·생성점 고정/공용만료/기본 빨간 원 없음. 루네프 노랑색은 첫발만 반응하던 것을 실제 낙뢰3회 각각에서 다시 시작하며200ms 유지/400ms 색복원 페이드 유지. 스야 날의 기능적인 중앙 연결선 복원·무광 단일날 색/서리외곽/회전 유지.
- 구조: mode.toggle when:on-delivery everyDelivery:true는 각 실제 범위/투사체 전달마다 해당 모드의 changedAt/turns를 갱신한다. 미지정은 기존 실행당1회·산탄/반복 중복 제외 동작 유지. 루네프 번개색 상태에만 적용하고 책 사용모션은1회 유지·기존 ModeState 원격복원/색페이드 재사용. 카논은 effect.spawn weaponImageEcho after-attack을 기존 공격 성공 경로에 조합·state.window600ms 후 신발/주먹과 해당표본 자동선택. 기존 무기 잔향 위치고정/은신/복제/만료/clearAll 경로 재사용·새 캐릭터 ID 분기/모듈/네트워크 패킷 없음. 전투 수치/판정 변경 없음.
- 이전 수정 정정:129의 스야 무광 처리에서 기능적인 중앙 연결선까지 제거했던 것을 복원한다. 밝은 분할 면 제거는 유지한다.
- 파일: WEAPON_IMAGE_DEFS; characters/runef,kanon; AttackModuleService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체311회귀(무기50), 공용 Canvas43상태 렌더 확인. 실제 공용 범위공격 스케줄로0/350/700ms 낙뢰 각각의 책색 재반응/모션1회/3전달/원격/페이드종료, 카논6공격 주먹/신발 잔향표본·생성점 고정/JSON복원·기본FX원없음, 스야 중앙선/단일면과 기존 회귀. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 중앙선/무광날·슈비 각진권총/발사회전·카논 주먹/밑창·평타/두발차기/반격의 작은고정잔향·루네프 낙뢰3회 책색 재반응/페이드.


## 3.0.0-character.131 — 2026-10-07

- 요청/결과: 슈비는 두 갈래 가속 총구/레일과 짧은 후방 프레임을 가진 전자식 산탄포로 실루엣 변경·발사 회전 유지. 카논은 정면 건틀릿과 굵은 접지 패널이 있는 전투화 밑창으로 새 설계·기존600ms신발/공격 고정잔향 유지. 뉴 마검 날 중앙 세로선 복원. 시로 flashAfterFirstLayer 옵션을 실제 게이지 렌더와 공용 링 공간계산에 연결해400ms 첫 단계부터 점선링·800ms 두번째 단계 색으로 전환. 클레아 후면에 두꺼운 단일면 초승달 추가·달 그림자 활성 중 하늘색 계열로 변화·만료/중도종료 즉시 복원·평타는 실제발사당 회전1회/쌍탄 중복제외·반격은 실제 이동공격 시작 시 회전·스킬은 색만 변화.
- 구조: ChargedAttackService.flashReady/hasChargeFlash가 gauge.layers/flashAfterFirstLayer/maxChargeFlash를 기준으로 점선링 표시 임계값을 결정하며 EntityRingLayoutService가 동일 판정을 사용한다. 기존 isFull은 완전충전 의미 유지. 공용 weaponImage moon-crescent 형상과 state.exists activeOnly activityColors/기존ModeState 회전만 조합·클레아 스킬 지속시간을 복사하지 않고 실제 달 그림자 상태를 참조. 원격 상태/은신/사망페이드/60% 기본알파 재사용. 새로운 캐릭터 전용 렌더/전투모듈/네트워크패킷 없음·전투 수치 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/clea; ChargedAttackService/EntityRingLayoutService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체313회귀(무기52), 공용 Canvas45상태 렌더 확인. 시로399/400/600/800ms 실제 점선그리기·첫단계 공간확보/완전충전판정 유지, 클레아 실제스킬 상태/5000ms 종료/중도해제/원격 색·평타/쌍탄1회 회전·공용형상, 기존 회귀. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비/카논 신규 실루엣과 회전/잔향·뉴 중앙선·시로1단계 링/반격활성 링 간격·클레아 초승달/스킬색/종료/평타/반격 회전.


## 3.0.0-character.132 — 2026-10-07

- 요청/결과: 슈비를 단일 넓은 총구·두꺼운 상부프레임·면 그립/열린 트리거가드·작은 전자패널의 권총형 전자식 샷건으로 변경. 두갈래 산탄포 형상 제거·기존 실제발사 회전 유지. 카논 worldEffectModules/6공격의 무기모션/신발600ms표시상태/잔향 및 미사용 주먹·밑창 공용형상 제거. 뉴 중앙선을131의 직선에서125 파일의 원래 꺾인 경로 M(0,-2.8)→(-.13,-1.7)→(.12,-1.05)→(0,.48)와 선설정으로 복원. 기존 전투 수치/모듈판정 변경 없음.
- 구조: 캐릭터 순수무기 데이터와 공용형상만 수정. 카논의 표시 전용 mode.toggle/state.window/weaponImageEcho만 제거하고 제자리회피/타격/기절/이동 모듈 유지. 뉴 선은 저장된125 배포 형상에서 직접 복원하며 새 좌표를 추정하지 않는다. 기존 무기 투명도/은신/원격/사망페이드 경로 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/kanon; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 무기51·구조22 회귀, 공용 Canvas45상태(카논 이미지 없음) 렌더 확인. 카논 표시모듈/형상/실제렌더 없음·원본 전투데이터 보존·뉴 원래선 동일 비교. build/docs/check/verify/runtime 구문·압축548항목 무결성. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비 권총형 전자샷건·카논 무기/잔향 없음·뉴 원래 꺾인 중앙선.


## 3.0.0-character.133 — 2026-10-07

- 요청/결과: 카논 평타 설명의 넉백 문구 제거. 카논 기본 무기 불투명도20%, 제자리 회피 성립 시650ms 고정 위치 확장/페이드 잔향(캡처 불투명도80%). 이동회피 중 정지 보정도 한 번만 반응. 슈비 권총형 전자샷건 외곽/그립/트리거가드 각도 보강. 클레아 초승달 내측 곡선과 중앙 장착부 추가.
- 구조: 제자리 회피 공용 상태 서비스의 stoppedEffects 데이터로 연출을 생성하고 기존 effect-spawn 원격 복제 사용. 원격 소유자 중복 생성 방지. 잔향 imageAlpha 선택값은 캡처에만 적용하며 기본 무기와 기존 잔향 투명도 유지. 전투 수치 및 판정은 유지.
- 검증: 전체313 회귀(무기52·구조22) 통과. Canvas45상태 렌더 검수. 제자리회피/정지보정/중복방지/원격권한/고정위치/만료/기존잔향 회귀. build/docs/check/verify/runtime 구문 및 압축 무결성 검사. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 대상: 카논 제자리회피/이동회피 중 정지·슈비·클레아.


## 3.0.0-character.134 — 2026-10-07

- 요청/결과: 슈비 전자식 권총형 샷건의 계단형 프레임/전원부/큰 총구로 재설계. 카논 정면 주먹과 운동화 밑창을 새 윤곽/접지패널로 재설계·타격/발차기 모션 구분·20% 기본알파/제자리회피 잔향 유지. 클레아 두꺼운 초승달을 길게 휘어진 날/중앙 마운트로 재설계·스킬색/회전 유지. 큐리 3면과 각 면3×3격자가 보이는 큐브·공격/투척 시90도 회전. 리안 단순 방패·실제 공격/돌진/귀환 때 스윙. 엘린 유령 없을 때 본체20%, 소환 시60%·수호 방패/탐사 고글을 본체와 유령 모두에 표시·양쪽 칸수 모드게이지 제거·추가 모션 없음. 디라 프라이팬/식재료 얹은 프라이팬/접시 요리 세 상태를 실제 보유 상태에 연동·요리 우선·공격 모션. 메이실 큰 재단가위·실제 공격에서 두 날 여닫기·반격 투척 회전.
- 구조: 무기 형상은 WEAPON_IMAGE_DEFS의 순수 데이터. 공용 parts의 angle/pulseAngle/scaleX/scaleY/pivot를 동일 pose.pulse로 렌더해 가위 관절 움직임을 조합. ModeGearPresentationService.configs는 소환수에는 summonSpec.worldEffectModules만 사용해 본체 이미지 중복 상속을 막으며 conditionTarget:owner로 주인 모드 조건을 읽는다. 엘린 summon.active/inactive와 state.mode-is, 디라 CookingService.syncReady의 기존 state.exists/absent를 사용하며 별도 모드/수치 복제 없음. 모션은 기존 mode.toggle on-delivery/after-attack 조합·선딜 전/실패/미전달 중복을 피한다. 기존 은신/원격 상태/전환효과/사망페이드 공용 경로 유지. 전투 수치/모듈 인덱스/판정 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; ModeGearPresentationService; characters/kanon,quri,lian,elin,dira,maisil; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 전체318 회귀(무기57·구조22) 통과. 공용 Canvas24상태 렌더 검수. 큐브3면/경로유한·엘린 유령 유무20/60%/본체와유령 모드일치/원격/칸수제거/무모션·디라 식재료/요리/소비/원격·가위 양쪽 관절/실제공격1회/투척회전/원격·큐브/방패/프라이팬 실제전달 모션·기존 무기 회귀. build/docs/check/verify/runtime 구문·배포 압축 무결성. 실제 브라우저 플레이와 두 기기 WebRTC 미검증.
- 플레이 검수 대상: 슈비·카논 주먹/밑창·클레아·큐리·리안·엘린 모드/소환/해제·디라 식재료/음식·메이실 가위질/투척.


## 3.0.0-character.135 — 2026-10-07

- 요청/결과: 슈비 권총형 전자샷건은 방향성을 유지하며 길게 모따기한 상부 프레임/집중된 총구/전원부로 변경. 카논 주먹은 기존 실루엣을 다듬고 분리된 위쪽 물결 선 제거. 카논 주먹/밑창은 이동/회전 모션 제거·실제 공격에서120ms100% 불투명 후280ms 동안20%로 복원·제자리 회피 고정 잔향 유지. 클레아는 옆으로 누운 초승달 날의 양 끝/외곽/내측부터 새 형상으로 설계·기존 스킬색/회전 유지. 리안은 곡선 윗면/테두리/중앙 보강대가 있는 단순 방패, 엘린 탐사 고글은 둥근 렌즈/연결대/짧은 밴드로 변경. 메이실 가위 기본각도−0.6rad·기존 여닫기/투척 유지. 디라 요리는 접시 테두리/구운 메인/잎 가니시의 플레이팅으로 재설계·보유 시 정지·실제 사용에서만650ms45% 확대 고정 잔향. 큐리는 실제0~4단계에 섞임/흰 십자가/F2L/OLL/PLL 색상 패턴27칸을 표시.
- 구조: CFOP 단계별 큐브는54개 면 조각의 회전으로 물리적으로 유효한 색상을 만든 뒤 순수 WEAPON_IMAGE_DEFS 경로로 저장. 십자가는 흰 아래면을 보이도록 시점을 뒤집어 표시, F2L부터는 노란 윗면/초록 앞면/빨강 옆면. 기존 quri-cube-stage의 progress-gte/lt 조건으로 이미지 하나만 선택·원격 진행 상태 사용·사망/잔향은 선택 형상에 고정. imageAlpha의 activityStateKey는 기존 ModeState 전달 시점만 읽어 불투명도 복원. 공용 echo의 선택 imageConfig는 이미 소비한 요리 등 명시한 이미지 하나를 캡처하며 sampleImage로 일반무기 표본과 같은 경로 사용. effect-spawn은 imageConfig와 생성 좌표를 유지해 원격 수신 뒤 주인이 이동해도 원래 위치에 잔향을 생성. 음식 투사체/회복/식재료·스테미나/피해/CC/사거리/모듈 인덱스 및 다른 무기 형상 유지.
- 파일: WEAPON_IMAGE_DEFS; ModeGearPresentationService/EffectSpawnService; characters/kanon,quri,dira,maisil; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 전체321 회귀(무기60·구조22) 통과. 공용 Canvas20상태 렌더 검수. 카논6공격20/100/페이드/20%·위치/각도 고정·원격 불투명도; 큐리5단계27칸/흰십자가/아래2층/OLL윗면/PLL옆면/원격/표본고정; 디라 실제 음식 소비 이후에도 요리 단일잔향/정지모션/생성위치/원격복원/만료; 기존 회귀. build/docs/check/verify/runtime 구문·배포 파일 무결성. 실제 브라우저 플레이와 두 기기 WebRTC 미검증.
- 플레이 검수: 슈비·클레아·리안·엘린 고글·메이실 가위·카논 공격 알파/정지·디라 요리 사용·큐리0~4 단계.


## 3.0.0-character.136 — 2026-10-07

- 요청/결과: 메이실 재단가위 재설계/실제 치명타 잔향, 타우 강화 치명타 잔향/사선 평행 두 낫 배치, 로온 빙결 성공과 헤브 출혈타격 무기 확장반응을 고정 잔향으로 변경. 슈비134 권총형 전자샷건 복원 후 총구/프레임 접합과 열린 트리거가드 중첩 정리. 리안 돌진백업 개수 제한 제거/6초 보관 유지/300ms 재사용, 넓은 네모 에너지방패/평소24%·공격100%·방어 성공 하늘색·스킬 한바퀴. 카논 타격 스테미나 회복은 소환수/훈련봇 제외. 디라 요리는 보유 이미지 제거/실제 사용 후650ms 고정 잔향만. 큐리는 전부 보라 계열/완성 부분 밝기 강조·평타 잔향/공식 입력 미세모션/반격 한바퀴. 클레아 실제 원형 챠크람, 엘린 고글·수호방패 재설계.
- 공용 구조: 캐릭터 데이터와 공용 순수형상만 조합. 기존 weaponImageEcho/on-hit/onAppliedEffects/after-attack으로 적중·빙결·요리 사용에 연결하고 현재 위치 표본을 고정·확대/페이드·원격복제/은신/사망페이드 유지. PositionMemoryService는 maxCount:null만 무제한, 기존 유한 상한 및 시간만료 유지. 공용 방어 성공 onBlock.modes는 기존 ModeState만 변경·같은 공격 그룹 중복제외. 공식 inputMotion은 정상 처리된 입력에만 기존 ModeState 모션 연결·자연회복 타이머 보존·회피차단/원거리/네트워크재생 중복 제외. 카논 excludedTargetKinds 검사 후 실행당 회복표시로 봇 타격이 플레이어 회복을 소모하지 않음. 큐브 단계 조건/27칸 좌표는 유지하고 색상만 단일계열 밝기로 변경.
- 파일: WEAPON_IMAGE_DEFS; characters/maisil,tau,roon,hab,lian,kanon,dira,quri; PositionMemoryService; AbilityModuleService; AttackGuardService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기67 회귀 통과: 실제 치명타 적중/빙결 성공 및 거절/고정잔향과 원격복원/요리 소비 후 잔향·보유 이미지 없음/백업40개·역순소비·6초만료/카논 소환수·봇 다음 플레이어 적중/방어 성공 실제 훅·중복제외·원격색/공식 입력 허용·차단/큐브 단계표본. 공용 Canvas20상태 렌더 확인. 전체13개 회귀 스크립트 통과·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/타우 치명타, 로온 빙결, 헤브 출혈타격, 리안 회피 연속 후 백업/방어/스킬, 카논 플레이어와 봇 비교, 디라 요리사용, 큐리 공식/평타/반격, 슈비/클레아/엘린 디자인.


## 3.0.0-character.137 — 2026-10-07

- 요청/결과: 타우 두 낫 동일 형상/방향/반시계 회전·사선 포개기 유지·실제 치명타 잔향은 노랑 고정. 큐리2단계 F2L에서도 십자가 밝기 유지 및 이후 단계의 완성 부분 유지. 메이실 가위 긴 재단날/엄지·손가락 비대칭 열린 손잡이/공통 관절 재설계·기존 여닫기/투척 유지. 리안 넓은 에너지방패 세로18% 연장. 카논 일반/제자리/후속 평타 실행 시 잔류 신발 상태 해제·주먹 복원. 클레아 단일 넓은 초승달 날로 재설계·기존 스킬색/회전 유지. 엘린 평타 실제 체력 회복 성공 시 본체 고정 무기 잔향, 유령은 모든 실제 체력 회복 성공 시 자기 고정 무기 잔향.
- 공용구조: 공용 echo imageColor는 캡처 표본의 색/혼합비만 고정하고 기본 무기 색은 바꾸지 않음·effect-spawn 기존 복제에 옵션 전달. 카논은 기존 state.window operation:clear를 평타 after-attack에 조합. ResourceRestoreEffectService가 순수 onRestoredEffects를 HealthService에 전달하며 HealthService는 실제 restored>0에서만 해당 목록과 summonSpec.onHealedEffects를 공용 spawnAttackEffect로 실행. 피치유자 권위 presentationAuthority:target·기존 effect-spawn 복제·대상 위치 고정·은신/사망/수명 정리 재사용. 체력최대/회복배율0/원격 미러에는 새 잔향 없음. 캐릭터 ID 분기나 별도 렌더/패킷 없이 데이터로 연결. 전투 피해/사거리/스테미나/회복량 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/tau,kanon,elin; ModeGearPresentationService; EffectSpawnService; ResourceRestoreEffectService; HealthService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기73 회귀 통과: 동일 낫방향·치명잔향 노랑/기본색 분리·큐브1~4단계 십자가/완성부분 유지·신발 잔류 중3평타 주먹복귀/원격복원·실제 엘린 평타→유령200치유→양쪽 잔향·체력최대/회복배율0/원격 미러 제외·유령의 다른 치유 수신/잔향 위치고정/복제. 공용 Canvas20상태 렌더 검수. 전체13개 회귀 스크립트 통과·build/docs/check/verify/runtime 구문 및 압축 무결성 확인. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 타우 치명타/회전, 큐리2단계, 메이실 가위, 리안 방패, 카논 스킬 직후 평타, 클레아 초승달, 엘린 평타 아군치유/유령피치유.


## 3.0.0-character.138 — 2026-10-07

- 요청/결과: 메이실 가위 양 손잡이 간격 확대/관절 기본각과 여닫기 방향 교정·모든 모션 구간 비겹침. 클레아 닫힌 원형 외곽 복원·오른쪽으로 치우친 열린 내부로 두꺼운 초승달 절삭면 유지. 루뷰 후면에 큰 망치/못 교차 배치·실제 못 발사/올려치기에 망치 모션·스킬 망치 투사체가 나가 있는 동안 망치 이미지 숨김·못 유지·회수/돌진소비/제거 이후 복원.
- 공용구조: 공용 WEAPON_IMAGE_DEFS 순수 경로/관절과 weaponImage 설정만 조합. 루뷰 실제 primary-weapon 투사체 상태를 공용 projectile.absent 조건으로 참조·귀환까지 존재하면 숨김·원격 pending networkKey도 포함해 투사체 수신 전 표시 깜빡임 예방. projectile.exists/absent는 ProjectileStateService.get 및 기존 원격 상태키를 조회하며 캐릭터 ID 분기/새 패킷/전용 렌더 없음. 공용 전환효과/은신/죽음 페이드/원격 ModeState 모션 유지. 클레아 스킬색/공격회전과 메이실 치명타 잔향/투척 유지. 전투 수치/피해/판정은 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/ruvu; TriggerConditionService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기76 회귀 및 전체13개 회귀 스크립트 통과. 루뷰 망치/못 교차·투척/귀환 숨김·회수 복원·원격 지연 연결 상태, 가위121개 모션 표본에서 손잡이 외곽 비겹침, 클레아 원형 외곽과 열린 내부 렌더 검수. Canvas20상태 렌더, build/docs/check/verify/runtime 구문/압축 무결성 확인. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실 평타/투척, 클레아 평타/달그림자, 루뷰 평타/투척/자동·수동귀환/망치돌진.


## 3.0.0-character.139 — 2026-10-07 KST

- 요청/결과: 전체 공용 무기 형상의 순수 origin 중심값과 기본 weaponImage x/y=0으로 캐릭터 중심에 정렬·소환수/요리 선택잔향 포함·타우 두 낫은 상대간격을 유지하며 그룹 중심0. 메이실 재단가위 넓어진 곡선날/서로 분리된 비대칭 손잡이 재설계·여닫기/치명잔향 유지. 클레아 빠른 연타도 매 공격당 한바퀴를 연속 완주하도록 회전 대기열·원격 동일. 루뷰 각진 합성 망치헤드/양쪽 충격캡/중앙 체결판/직선 그립으로 현대적 재설계·못/망치 길이 및 scale2 통일·투척시 망치숨김 유지. 하츠하츠 큰 붓 이미지 추가·실제 평타/반격 공격당 반시계 회전1회·산탄 중복 제외.
- 공용구조: 형상 origin은 순수 좌표2개로 기본실루엣 경계 중심을 나타내고 drawImage가 회전 전 원점으로 보정·움직임/잔향/사망표본은 같은 공용 경로. ModeState module.queueRotationMs 및 config.rotationMode:queued는 기존 turns에 미완주 회전을 누적·회전 시작점/출발 turns/바퀴당 시간은 기존 modeStates snapshot으로 직렬화·원격 복원. 다른 무기의 기존 ease-out 회전 유지. 캐릭터 ID 분기/새 네트워크패킷/전용렌더 없이 데이터+공용서비스 조합. 하츠 드래그 시작/취소에는 모션 없고 실제 전달에 on-delivery 모드만 적용. 전투 수치/피해/사거리/스테미나/기존 은신·전환·사망페이드 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/dira,elin,intu,kanon,lian,maisil,quri,ruvu,tau,clea,hatsuhats; ModeGearPresentationService; ModeStateService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기79 회귀 및 전체13개 회귀 스크립트 통과. 클레아100ms 간격3공격 연속각도/3바퀴완주/다음공격/원격 동일, 전체 형상 중심값 및 모든 기본 weaponImage 위치/소환수/타우 상대배치 중심, 루뷰 같은배율/하츠6산탄1회회전·반격 추가1회. 가위 전구간 비겹침/기존 치유·잔향·투척 회귀. Canvas20상태 렌더 검수·build/docs/check/verify/runtime 구문/압축 무결성. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/루뷰/하츠하츠, 클레아 연타와 증강 연사속도, 기존 전체무기 중심 위치·은신·사망 잔류.


## 3.0.0-character.140 — 2026-10-08 KST

- 요청/결과: 루뷰 평타/반격의 실제 공격에서 망치/못 함께 한바퀴 회전·기존 스윙 제거. 하츠하츠 평타/반격/실제 스킬 실행에서 붓 시계방향 회전·이전 방향 반전. 메이실 손잡이 같은 높이/크기 대칭배치·짧은 연결부/날/열린 고리 재설계·전구간 비겹침 유지. 클레아 회전대기열 기능/데이터/직렬화 제거·기존 공용 ease-out 회전으로 복원. 큐리 실제 공식 오입력에서만 붉은 무기색100ms 유지/450ms 원래색으로 페이드·반복오입력 재시작·원격 동일.
- 공용구조: 공용 ModeStateService를138 상태로 복원하고 무기 renderer의 queued 분기 제거·139 origin 중심 정렬은 유지. 루뷰 on-delivery 기존모드로 완전회전, 하츠 스킬 effectsOnly after-attack 기존모드 조합. FormulaSequence 결과 wrong:true에서만 순수 inputErrorMotion 모드를 갱신·기존 activityColors 상태색/페이드 사용·회피차단/정상입력/원거리 클릭 제외·자연회복 타이머 보존. 캐릭터 ID 분기/새 패킷/전용렌더 없음·전투 수치/판정 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/ruvu,hatsuhats,clea,quri; ModeGearPresentationService; ModeStateService; AbilityModuleService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기82 회귀 및 전체13개 회귀 스크립트 통과. 루뷰 실제 전달2회/각무기2바퀴·하츠 스킬 실행 회전/시계방향·클레아 대기열 제거/이전각도/원격일치·큐리 실제 공식 정상/오입력 판정·빨강/중간페이드/550ms복원/반복/원격/회피차단 제외. 가위121표본 손잡이 비겹침·전체 중심/기존 잔향/치유/투척 유지. Canvas20상태 렌더·build/docs/check/verify/runtime 구문/압축무결성. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/루뷰/하츠하츠, 클레아 연타와 증강 연사속도, 기존 전체무기 중심 위치·은신·사망 잔류.


## 3.0.0-character.141 — 2026-10-08 KST

- 결과: 루뷰 못은 정지 유지하고 실제 공격 때 망치만 회전. 망치를 양면 타격부·결합부·두꺼운 그립으로 재설계. 메이실 기본각도를 바로잡아 두 손잡이 높이와 연결 위치 정렬. 공용 무기 면색/윤곽을 현재 캐릭터 색과 동기화하고 명암 유지. 로온 과육 및 기존 특수 상태색 유지. 베르 쌍권총·바주카포·초콜릿 폭탄 추가: 실제 발사 시 해당 형상으로 전환하고 150ms 선명 유지 후 400ms 페이드, 평소20% 투명도·무기별 반동/회전.
- 구조: 기존 weaponImage 순수 형상과 모드상태 조합. on-delivery에서 mode.set도 기존 실행중복 방지 경로로 처리. 선딜레이 이전에는 무기 전환/모션하지 않음. 공용 pathFill로 면색 명도와 캐릭터색을 조합하고 캐시가 현재 색 변화에 갱신. preservePalette는 의도된 과육색 보존. 캐릭터 ID 분기/새 네트워크 패킷 없음.
- 파일: characters/ruvu,maisil,roon,veleu; WEAPON_IMAGE_DEFS; AttackModuleService; ModeGearPresentationService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기84 회귀와 전체13개 스크립트, build/docs/check/verify/runtime 구문 및 ZIP 무결성 검사. Canvas 표본으로 손잡이/망치/베르3무기 확인. 실제 브라우저 조작과 두 기기 온라인 대전은 미검증.
- 실플레이 권장: 루뷰 평타/반격/망치 투척, 메이실 평타/가위 투척, 베르 세 공격과 반격 선딜레이, 캐릭터별 기본/특수 색과 은신/사망.


## 3.0.0-character.142 — 2026-10-08 KST

- 결과: 헤브 항시 설명에서 소환수·봇 제외 문구만 제거(효과 조건 유지). 클레아 원형 초승달 실루엣 유지·안쪽 곡선/작은 마름모 장식. 베르 쌍권총은 인투 권총 형상구조를 공유한 이중 배치, 바주카는 총구/후방 배기구/조준부/그립, 폭탄은 초콜릿 격자/포장지/심지로 재디자인. 실제 무기 사용800ms 뒤 쌍권총 복귀. 스킬 재사용 시350ms 노랑 반응(마지막250ms 페이드)·복귀 시간 재시작. 메이실 가위는 교차 날/중앙축/반대편 손잡이 연결 구조로 다시 설계·손잡이 비겹침.
- 구조: 기존 weaponImage/관절/형상/모드/activityColors 재사용. state.mode-is에 선택적인 expiresAfterMs/ageStateKey/expiredValue를 추가해 저장된 모드 타임스탬프를 기준으로 일시적인 표시조건 평가. 표시 만료는 상태를 변이하지 않으며 타이머/새 패킷/캐릭터 ID 분기 없음. 베르 rmbBoost 실제 after-attack에서 모드색/모션/표시시간 갱신. 기존 전투 수치와 헤브 회복 대상 제한 유지.
- 파일: characters/hab,veleu; WEAPON_IMAGE_DEFS; TriggerConditionService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기85 회귀 및 전체13개 회귀 스크립트 통과. 799/800ms 복귀 경계·재사용색/중간페이드/350ms복원·시간 재시작·원격 모드 직렬화 일치, 가위121표본 비겹침. Canvas20상태 시각 확인. build/docs/check/verify/runtime 구문/ZIP 무결성 확인. 실제 브라우저 플레이·두 기기 온라인 대전 미검증.
- 실플레이 권장: 메이실 가위 개폐/투척, 클레아 스킬 상태색, 베르 스킬 발사/재사용/800ms복귀/반격 선딜/연속 공격과 상대 화면.


## 3.0.0-character.143 — 2026-10-08 KST

- 결과: 타우/메이실 치명타 적중 무기 잔향 제거. 카논 강조 표시 총800ms(600ms선명+200ms페이드), 신발800ms; 베르 일시무기800ms 뒤 쌍권총 복귀와 공용 기준값으로 통일. 스야/타우 낫 origin을 손잡이 중앙으로 복원. 루뷰 망치를 비대칭 타격부/갈고리형 현대 망치로 재설계(못 유지). 베르 무기 기본알파100%, 권총/바주카 총구 우상단 및 반시계 반동, 겹친 쌍권총을 인투와 다른 단차 프레임/큰 총구/그립으로 재설계. 메이실 재단가위는 서로 다른 크기의 엄지/손가락 고리·연결부·곧은 절삭면·비대칭 기울임으로 재설계. 클레아는 원형외곽 안의 넓은 초승달날/안쪽 선/각인으로 재설계. 헤브 반격 피해350→100, 탄속2→3(50%상향).
- 구조: CHARACTER_RULES.weaponPresentation.transientMs를800으로 단일정의하고 카논/베르 root참조와 $ref/$scale로 연결. 전투기절600ms는 변경하지 않고 표시창만800ms. 타우/메이실 on-hit effect.spawn weaponImageEcho만 삭제·치명피해/스파크 노랑/회전 유지. 기존 공용 형상·origin·관절·alpha·모드 선택·타임스탬프/원격복원만 사용. 베르 스킬재사용 노랑350ms 유지. 헤브 관통/매초 재타격/무력화넉백 유지.
- 파일: characters/tau,maisil,kanon,veleu,hab; CHARACTER_RULES; WEAPON_IMAGE_DEFS; test-weapon-updates,test-hab; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기86회귀 및 전체13개 스크립트 통과. 실제 치명타 적중의 잔향/FX 미생성, 공용800ms/신발799·800ms복귀/기존원격, 베르 불투명도/방향, 가위121표본 비겹침, 헤브 공용 투사체 탄속/100피해 확인. Canvas20상태 시각 확인. build/docs/check/verify/runtime구문/압축무결성 확인. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 메이실/타우 치명타, 스야/타우 낫회전, 베르3무기/재사용/복귀, 카논 신발/평타복귀, 헤브 선체 피해·탄속, 루뷰 망치투척, 클레아 회전.


## 3.0.0-character.144 — 2026-10-08 KST

- 결과: 카논 주먹/밑창 상시 무기와 공격 모션/표시창 제거·제자리회피에서만 단일 회피흔적800ms 고정위치 확대/페이드 잔향. 루뷰 망치 시계→반시계 회전. 베르 권총을 짧은 슬라이드/사선그립/빈 방아쇠울/가늠자 형태로 재설계하고 3무기 origin을 형상중앙으로 복원. 가위 날의 절삭면 방향만 반전·손잡이/축/개폐 유지. 클레아 적중 달그림자 유지가 소환수/훈련봇을 제외(게이지 충전 유지). 타우 낫scale1.55→1.85(약19%확대). 슈비 평타는 완전회전 대신 인투권총식 반시계 짧은반동·스킬/반격은 기존 완전회전.
- 구조: 기존 stoppedEffects.weaponImageEcho의 명시적 imageConfig로 카논 평소 worldEffectModules 없이 단일회피 형상표본 캡처. 기본 반투명 무기 없음·실제 제자리회피/이동회피 정지보정1회/원격중복방지 기존공용 경로. 클레아 state.window on-hit에 기존 target.kind-not-in 조건 추가·거절은 실행효과를 소비하지 않아 같은공격의 뒤따른 플레이어적중 갱신가능. 슈비 평타용 motionStateKey 분리·스킬/반격 rotationStateKey 유지. 캐릭터전용 실행서비스/새패킷 없음.
- 파일: characters/kanon,ruvu,veleu,clea,tau,shubi; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기87회귀 및 전체13개 스크립트 통과. 카논 평소/일반공격 무기0개·제자리회피 단일표본/위치고정/800ms만료/원격 중복제외, 클레아 소환수/봇 후 같은실행 플레이어 갱신, 슈비 산탄1회/평타짧은반동/스킬반격회전/원격, 루뷰 반시계2회·가위121표본 비겹침·전체형상 좌표유한. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 카논 제자리/이동회피 정지보정 및 평상시무기없음, 클레아 소환수/봇/플레이어 유지차이, 슈비 평타/스킬/반격, 루뷰 망치반시계, 타우 확대, 베르3무기중앙/가위날.


## 3.0.0-character.145 — 2026-10-08 KST

- 결과: 엘린 반격 summon.swap-pulse의 수호모드 강제reset 제거·기존 모드 유지. 카논 회피흔적 이미지 평소에도 공용60%알파로 표시·제자리회피800ms 고정확대잔향 유지. 베르 자동권총을 경사진 슬라이드/배출구/사선그립/방아쇠울로 재설계·리볼버 아님. 메이실 날/연결부/손잡이를 다각형으로 각지게 재설계·기존 절삭면 방향 유지. 레비나 악마삼지창 공용이미지 추가·levina-spear 투척/귀환/원격지연 중 숨김·회수복원.
- 구조: 전투 코드 변경 없이 기존 캐릭터 데이터 조합. 엘린 resetMode만 제거하여 모드/위치교환/주변폭발 유지. 카논 worldEffectModules에 dodge-slip 1개 등록하고 회피잔향 명시적 imageConfig 유지. 레비나는 기존 projectile.absent 조건으로 투척 상태를 읽어 별도 타이머/변수/패킷 없음. 자동권총/각진가위/삼지창은 WEAPON_IMAGE_DEFS 순수 형상.
- 파일: characters/elin,kanon,levina; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기89회귀 및 전체13개 스크립트 통과. 엘린 실제 교환/수호·탐사 유지/원격모드복원, 카논 평소1개/일반공격 추가잔향없음/제자리회피800ms잔향, 레비나 투척·귀환·원격지연숨김/회수복원, 가위121표본 비겹침. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 엘린 탐사모드 반격 후 유지, 카논 기본이미지/회피잔향, 베르 자동권총/메이실 각진가위, 레비나 투척/귀환/회수 및 상대화면.


## 3.0.0-character.146 — 2026-10-08 KST

- 결과: 카논 평타/스킬/반격 실제 전달에서 회피이미지 시계 완전회전. 리안 기본 방패알파100%·평타/반격 시계/스킬 반시계 완전회전·방어 하늘색 유지. 레비나 삼지창 각도−0.3→−0.6rad. 베르 자동권총 프레임/그립/슬라이드/방아쇠울 다듬기. 프릴 빗자루 추가·평타1타시계/2타반시계/3타 헤브식 전방 찌르기·청소스킬 각 타격 생성 때 시계회전.
- 구조: 기존 weaponImage rotationStateKey/motionStateKey와 mode.toggle on-delivery/after-attack 조합. 공격 전달 모션은 기존 실행중복방지로 산탄/반복delivery1회. 프릴 청소 progressRect 생성과 동일 after-attack에서 각 rmbTick 별 spin증가·시작/종료 선택에서는 회전없음. 좌우회전은 같은 mode상태의 step±1, 찌르기는 별도 mode키. 새전용렌더/서비스/패킷없음.
- 파일: characters/kanon,lian,levina,prill; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기92회귀 및 전체13개 스크립트 통과. 카논3공격시계/중복제외, 리안알파1/방향, 프릴1·2타 회전/3타찌르기/스킬4타 회전/원격복원, 기존회귀. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 카논 평타/스킬/반격 회전, 리안 평타/스킬/반격방향, 프릴3타콤보/스킬매타회전, 베르 자동권총·레비나 기울임.


## 3.0.0-character.147 — 2026-10-08 KST

- 결과: 리안 회피연계 shieldDash 실제 실행에 시계완전회전 추가. 프릴 빗자루를 넓게 퍼지는 솔/묶음띠/구분된 솔끝으로 재디자인. 베르 평타는 실제 탄별 좌우 발사위치에 맞춰 뒤/앞 권총만 독립 반동·좌우좌=뒤앞뒤/우좌우=앞뒤앞·75ms복원으로80ms연사에서 모션겹침 방지.
- 구조: 공용 mode.toggle when:on-projectile-shot/perpendicularSide로 실제 spawn 후 해당측 상태만 갱신. 로컬 예약발사와 원격탄 재생이 기존 perpendicularOffset을 같은 공용spawn 입력으로 전달·새패킷 없음. 공용 weaponImage config.partMotions로 형상 parts별 모션 평가, sampleImage가 partPoses를 캡처하여 잔향/사망 표본에 고정. 베르 기존 공격당 전체권총모션 제거·공용 탄별실행과 모드원격복원 사용. 리안은 기존 after-attack mode.toggle 조합.
- 파일: characters/lian,veleu; WEAPON_IMAGE_DEFS; AttackModuleService/ProjectileService/SimulationScheduleService/OnlineDuelService/ModeGearPresentationService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기94회귀 및 전체13개 스크립트 통과. 리안 회피평타 회전, 뒤앞뒤/앞뒤앞 실제 side분기/단일권총 활성/75ms복원/원격모드/캡처표본고정. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 리안 회피평타, 베르 연속평타 좌우좌/우좌우 개별반동 및 상대화면/사망잔류, 프릴 빗자루.


## 3.0.0-character.148 — 2026-10-08 KST

- 결과: 베르 평타 개별권총 반동시간75→150ms로2배 연장해 회복동작 완화. 실제발사 간격80ms/좌우발사순서/뒤앞매핑/회전각/이동량 유지. 두권총은 독립적으로 반동/회복하며 같은권총의 다음발사160ms 전 모션복원.
- 구조: 기존 config.partMotions.motionMs 데이터만150ms로 조정. 실제탄별모드/원격복원/표본고정과 전투수치 유지. 이전 권총 회복 중 다른 권총이 발사될 수 있어 급한 강제복원을 피함.
- 파일: characters/veleu; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기94회귀 및 전체13개 스크립트 통과. 뒤앞뒤/앞뒤앞 실제발사별 상태갱신/원격복원/150ms모션 표본고정. build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 베르 연속평타 좌우좌/우좌우 반동 회복동작 및 상대화면.


## 3.0.0-character.149 — 2026-10-08 KST

- 결과: 베르 개별권총 반동시간150→420ms로 인투권총과 통일. 코녕 후면무기에 마시멜로 하나가 꽂힌 거대한 꼬치 추가. 손잡이가 캐릭터중앙에 위치하고 기본 기울임0.5rad/배율1.9. 실제 평타/스킬 착탄범위 생성에서440ms 전방찌르기, 반격에서380ms시계한바퀴 휘두르기. 기존 캐릭터색/밝은윤곽/기본공용투명도 사용.
- 구조: WEAPON_IMAGE_DEFS marshmallow-skewer 순수형상과 기존 weaponImage/motionStateKey/rotationStateKey. lmb/rmbImpact/counter on-delivery mode.toggle로 실제공격모션·실행중복방지·선딜전 모션없음. 캐릭터전용렌더/새서비스/패킷 없음·기존전투수치/판정 유지.
- 파일: characters/konyeong; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기95회귀 및 전체13개 스크립트 통과. 코녕 실제평타/스킬전달2회/중복방지/찌르기/반격한바퀴/원격모드 복원, Canvas기본/찌르기 표본 시각확인. build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 코녕 평타/스킬 선딜후찌르기/반격휘두르기·은신/사망무기잔류.


## 3.0.0-character.150 — 2026-10-08 KST

- 요청/결과: 코녕 거대 꼬치 재디자인. 마시멜로 하나를 넓고 둥근 원통형 윤곽/윗면 곡선으로 표현하고 꼬치가 마시멜로 면을 관통해 비쳐보이던 선 제거. 손잡이를 폭이 있는 다각형 그립과 두 구분선으로 변경.
- 구조: 공용 WEAPON_IMAGE_DEFS의 marshmallow-skewer 순수 형상만 수정. 기존 캐릭터색/밝은 윤곽/투명도/손잡이 중앙/실제 공격 찌르기와 반격회전 유지. 전투 수치와 판정 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기95회귀 통과. 공용 Canvas 기본/찌르기 시각 확인. build/docs/check/verify/runtime구문/ZIP무결성 검사 통과. 실제 브라우저 및 두기기 온라인대전 미검증.
- 실플레이 권장: 코녕 기본 꼬치 실루엣/평타·스킬 찌르기/반격회전.


## 3.0.0-character.151 — 2026-10-08 KST

- 요청/결과: 메이실 가위 모션420→360ms. 25ms 짧은 준비 뒤72ms까지 급가속 절삭,108ms까지 닫힌 자세 유지 후360ms까지 복원. 전체 회전량0.16→0.23rad/전방이동0.3→0.4로 절삭 강조.
- 구조: 공용 weaponPose에 선택적 motionKeyframes(at/value/easing) 추가. 몸체와 가위 관절이 동일 pulse를 사용하며 미지정 무기는 기존 곡선 유지. 실제전달/실행중복방지/원격모드/잔향표본 그대로 사용. 디자인·피해·스테미나·연사속도·반격회전 유지.
- 파일: ModeGearPresentationService/characters/maisil/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과(무기96그룹). 메이실 급가속/닫힘유지/복원/실행중복/원격/표본고정 검사. Canvas 기본/절삭 렌더 확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 브라우저 및 두기기 대전 미검증.
- 실플레이 권장: 메이실 평타/치명타/스킬 가위개폐 및 연속공격.


## 3.0.0-character.152 — 2026-10-08 KST

- 요청/결과: 엘린 유령 재소환 체력의 오래된800 고정값을 최대체력1000 참조로 변경. 디라 음식 사용 후 투사체 크기/메타/자기섭취 anchored-arc520ms·높이96 설정을 로컬과 원격 모두 적용. 음식 소비/준비상태/dirty 갱신은 로컬 권위에서만 처리.
- 구조: 기존 summon respawnHealth 참조 및 cooking.meal-commit after-attack 공용 경로 사용. CookingService.commitMealThrow에서 시각적 투사체 구성과 로컬 자원변경의 권위 분리. 기존 duel-action targetEntityId/cookingMealCount와 scripted-projectile-arrived 로컬 회복 권위 재사용. 새패킷/캐릭터전용렌더 없음. 아군 음식투척은 기존 유도 경로 유지.
- 파일: characters/elin/CookingService/AttackModuleService/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과(무기98그룹). 엘린 최초/파괴7초후1000체력 복구·참조 검사. 디라 실제 afterAttack 로컬/원격 자기섭취 투사체 최고점/하강/이동추적/종료·원격 소비없음·아군투척 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 두기기 실제 온라인 시각검증 미실시.
- 실플레이 권장: 엘린 유령 파괴후 재소환/디라 자기 음식섭취와 아군투척 상대화면.


## 3.0.0-character.153 — 2026-10-08 KST

- 요청/결과: 시로 지속전투형/평타·풀차징·스킬1200사거리. 반격 조준반대 점프/출발점화살비 벽관통. 스킬 발사와 동시에 후방240 낮은점프(높이30/180ms/벽차단/추가무적없음). 헤브 평타100피해/150스테미나, 스킬200피해/벽관통, 출혈공통2초. 평타탄속32→24·스킬40→30(25%감소), 선체반격3→12(4배).
- 구조: 캐릭터 데이터의 공용 movement.move opposite-aim/module.trajectory, field.wallPolicy ignore, projectile.pierce 및 기존 피해/자원 참조 사용. 스킬 projectile 생성 뒤 같은 after-attack에서 이동 시작·발사원점은 이동전. 반격 이동350/700ms·최고점발사/출발점 화살비/스테미나/피해 유지. 새서비스/패킷 없음.
- 파일: characters/siro/hab; test-siro/hab/weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과. 시로 반대방향 점프/최고점 발사/출발점 화살비·관통 미리보기·일반/차징1200·스킬발사 동시 후방240/180ms/낮은궤적 실제실행 검사. 헤브 실제3공격탄속/벽관통/피해설명/2초출혈 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 온라인 시각검증 미실시.
- 실플레이 권장: 시로 평타차징/스킬후방점프/반격반대점프·벽너머화살비/헤브3공격.




## 3.0.0-character.154 — 2026-10-08 KST

- 요청/결과: 시로 스킬 후방점프의 벽관통/이동중 evasionInvulnerable을 기존 공용점프와 통일. 화살비 triggerOnEnter=false로 첫지속틱 제거·진입후500ms부터 지속틱. 별도 rainArrival 원형100피해/4초화염/무력화넉백을 생성시 적플레이어에게1회·벽관통. 지오핀은 지속피해장판 생성에 함께 발생하는 광역피해 및 저회를 장판조건으로 인식.
- 구조: 기존 movement.move collision/buffs, projectile.impact attackIds 및 공용 delivery.area/targetKinds/neutralize-knockback 조합. 생성피해는 rainTick 피해/범위 참조·지속틱과 별도 실행. ReactiveEquipmentService.creationField가 area 공격의 field.area 또는 동일 impact에서 함께 실행되는 linked attack을 순수 모듈로 확인. interval>0/지속시간/피해장판만 인정·일반탄환 직격/비피해장판 제외·캐릭터ID/새패킷 없음.
- 파일: characters/siro; ReactiveEquipmentService; test-siro/geopin; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과. 시로 생성1회/플레이어필터/무력화넉백/화염·벽관통/첫틱없음·대상별500ms지연과 스킬점프권위 설정 검사. 지오핀 직접/투사체연결 생성광역피해와 저회→장판누적/일반직격·비피해장판 제외 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 두기기 실플레이 미검증.
- 실플레이 권장: 시로 스킬 벽넘기/점프무적·화살비 생성순간과 지속틱/지오핀 장판생성광역피해·저회.


## 3.0.0-character.155 — 2026-10-08 KST

- 요청/결과: 시로 화살비 생성 피해에서 player-only targetKinds 제거. 타다타/소르와 같은 공용 원형delivery로 범위내 적 더미/봇/소환수/플레이어를 타격. 지속 rainTick에도 무력화넉백84/속도10 추가·oncePerExecution=false로 매틱 적용. 생성100피해/화염/벽관통·첫지속틱500ms지연 유지.
- 구조: 캐릭터 순수 데이터의 공용 delivery.area 관계필터와 movement.neutralize-knockback 사용. 생성피해는1회, 지속피해는 대상별500ms마다 반복하며 같은 field execution에 묶여 넉백이 최초1회만 발동하지 않도록 반복허용. 장판 소환/시간/피해/화염수치 유지·새서비스/패킷 없음.
- 파일: characters/siro; test-siro; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과. 실제 fieldTrigger의 서로 다른2회 지속타격에서 무력화넉백2회 호출 및 화염 검사·생성delivery의 대상종류제한 없음/적관계필터/피해100·생성1회/첫틱지연 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 두기기대전 미검증.
- 실플레이 권장: 시로 화살비 생성순간 더미/봇/소환수/플레이어 타격 및 지속타격넉백.


## 3.0.0-character.156 — 2026-10-08 KST

- 요청/결과: 라임 반격 착탄 stickyField의 movement.knockback을 movement.neutralize-knockback으로 교체. 기존 착탄점 반대방향/거리55/속도8/실행당1회 유지. 피해/4초장판/1초틱/둔화 유지.
- 구조: 캐릭터 순수데이터 기존 공용무력화넉백 조합만 변경. 투사체 자체가 아닌 실제피해를 주는 착탄범위 공격에 적용·캐릭터전용 분기/새서비스/패킷 없음.
- 파일: characters/lime; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기99그룹). 실제 stickyField onHit에서 NeutralizingKnockbackService 호출/대상/착탄점기준 방향/거리55/속도8 및 장판유지 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제두기기대전 미검증.
- 실플레이 권장: 라임 반격 착탄범위 적중·무력화넉백/기존장판.


## 3.0.0-character.157 — 2026-10-08 KST

- 요청/결과: 62명 반격의 기본·대체·연결 타격을 전수검수. 발동시 counter.execute cc를 주입하는 기존공용 경로와 실제 연결공격을 구분. 메이실 귀환가위 일반넉백→무력화넉백, 셰리나 반격잔향틱·라임 끈적장판틱·큐리 반격폭발·시아넬리 반격비도에 무력화넉백 추가. 타다타 비둔화 대상 첫타격에 조건부 무력화넉백 추가·둔화된 대상 기존속박 유지.
- 구조: 순수 캐릭터 데이터 공용 movement.neutralize-knockback 조합. 기존 기절/속박/빙결/수면 및 강제이동 끌어당김 반격 유지. 둔화만으로는 예외취급하지 않음. 별도실행 귀환/폭발/비도에 효과 명시, 장판/귀환 반복은 oncePerExecution=false. 타다타 기존모듈 참조 인덱스 보정·추가 CC는 enemy 관계필터. 새서비스/패킷 없음.
- 파일: characters/maisil/sherina/lime/quri/xianelli/tadta; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기102그룹). 전체62명 반격태그 실제피해 공격의 직접효과/발동주입/대체바인딩 검사. 5연결반격 실제onHit 공용무력화넉백 호출·타다타 일반대상 넉백/둔화대상 속박/참조1000ms 검수. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 두기기대전 미검증.
- 실플레이 권장: 메이실 귀환/셰리나 반격잔향/라임 장판/큐리 반격폭발/시아넬리 반격비도/타다타 비둔화·둔화 대상.


## 3.0.0-character.158 — 2026-10-08 KST

- 요청/결과: 큐리5단계 후면큐브 scale1.6→2(25%확대)·단계별밝기/잔향/공식입력/반격모션 유지. 펠루나 대장장이 forge-hammer 추가: 쐐기형뒤끝/넓은평면 타격머리/중앙결합부/긴그립·캐릭터회색계열 밝은윤곽/손잡이중앙. 실제4평타 전달에서420ms망치질, 일반/강화반격에서400ms시계한바퀴.
- 구조: WEAPON_IMAGE_DEFS 순수형상·기존 weaponImage motionStateKey/rotationStateKey/mode.toggle on-delivery 조합. 평타 선딜전에는 모션없음·실행당중복제외·기존원격모드복원/은신/사망페이드 유지. 펠루나 Infinity장판시간 유지·전투수치 변경없음·새서비스/패킷 없음.
- 파일: characters/quri/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기103그룹). 큐리5단계scale2·펠루나4평타실제전달/중복제외/2반격회전/원격모션/모루Infinity 보존. Canvas20상태 큐브단계/망치기본·공격자세 시각확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 큐리5단계큐브·펠루나4평타 선딜후망치질/반격회전/은신·사망무기.


## 3.0.0-character.159 — 2026-10-08 KST

- 요청/결과: 펠루나 망치scale2→1.7(15%축소). 일반/강화4평타·모루투척스킬·일반/강화반격의 실제전달에서 공용400ms 시계한바퀴로 통일. 3단계(value>6000)에서는 기존 강화평타 hitColor 255,160,40 참조로 무기색 변화·해제시회색 복원. 코녕 스킬 발동전 반경42/300ms areaCircle 제거.
- 구조: 기존 weaponImage rotationStateKey/mode.toggle on-delivery/activityColors 상태조건·색상참조 조합. 펠루나 찌르기모션키 제거·선딜전회전 없음·스킬 실제발사1회. 코녕 preview/선딜300ms/실제타격/후면꼬치모션 유지·시작장식링만 삭제. 전투수치/새서비스/패킷 변경없음.
- 파일: characters/peluna/konyeong; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기104그룹). 펠루나7공격실제전달7회/시계각/축소/6000·6001단계색경계 및 코녕장식링없음/선딜유지 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나3공격 회전/3단계색/단계해제·코녕 스킬발동전링.


## 3.0.0-character.160 — 2026-10-08 KST

- 요청/결과: 펠루나 forge-hammer 두개를 손잡이중심에서±0.55rad로 교차 배치. 실제 평타/스킬/반격에서 기존망치는 시계(+2π), 추가망치는 반시계(-2π)로400ms회전. 두망치scale1.7/3단계 강화색참조 유지.
- 구조: 동일 공용weaponImage 형상 두개/공유rotationStateKey·부호반전 rotationRadians 데이터만 조합. 두망치는 동일 실제전달시각/원격모드 복원/은신/사망페이드/단계색 사용. 전투수치·실행모듈 변경없음.
- 파일: characters/peluna; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기105그룹). 실제스킬 전달의2망치100/200/400ms 반대회전·교차각/크기/단계색/원격일치. Canvas기본/회전표본 시각확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.161 — 2026-10-08 KST

- 요청/결과: 펠루나 추가망치를 공용parts.scaleX=-1로 좌우반전. 기존망치/추가망치 타격면과 쐐기끝이 대칭으로 배치. 교차각/크기1.7/공격시반대회전/3단계색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치style만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/기존형상일치/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.162 — 2026-10-08 KST

- 요청/결과: 펠루나 추가망치를 짧은 손잡이·작은 사각 타격면·쐐기형 뒤끝의 소형 대장장이 망치로 재디자인. 기존 대형 망치와 크기 차이를 부여하고 좌우반전/교차 배치/반대 회전/3단계 색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.163 — 2026-10-08 KST

- 요청/결과: 펠루나 소형망치를 좁은 목·분리된 사각 타격면·둥근 뒤머리의 공구형 망치로 재디자인. 소형망치 각도 -0.55→-0.85rad로 추가 기울임. 대형망치·좌우반전·크기·반대회전·강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상 및 배치각만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.164 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치를 양쪽 사각 타격면·단차형 머리·중앙 결합부·짧은 테이퍼 그립의 정비용 망치로 재디자인. 기울기 -0.85rad/좌우반전/크기/반대회전/강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.165 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치의 돌출된 양끝 타격면을 제거하고 얇고 균일한 사각 머리로 정리. 머리폭1.64→1.4/높이0.75→0.47, 타격면 구분선은 얇게 유지. 기울기/크기/반대회전/강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.166 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치 머리 두께40%/손잡이 폭25% 확대. 양끝 돌출 없는 균일한 머리 윤곽과 기존 길이·기울기·회전·강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.167 — 2026-10-08 KST

- 요청/결과: 키네스 반격 사거리450→270(40%감소), 타다타 스킬 투척사거리550→440(20%감소)/스테미나400→500. 타다타 장판반경180 유지.
- 구조: 캐릭터 순수데이터 수치만 수정. 키네스 확장링 실제피해 delivery.area.range도 attacks.counter.range 참조로 통일하여 시각/타격 일치. 타다타 기존 공용투척·설명·미리보기 참조 유지.
- 파일: characters/kines/tadta; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 키네스 실제피해범위 참조270 및 타다타 사거리440/비용500 검수. 실제온라인 플레이 미검증.
- 실플레이 권장: 키네스 반격270범위·타다타 스킬440투척/500비용.


## 3.0.0-character.168 — 2026-10-08 KST

- 요청/결과: 헤브 이동속도 빠름4.25→느림3.75. 평타 투사체 반경14→20, 스킬18→25. 공용 무기투사체 시각크기는 기존 반경참조로 동기화.
- 구조: 헤브 순수데이터 및 공용 CHARACTER_RULES 이동속도 라벨 수정. 판정과 이미지크기 동일반경 참조 유지·탄속/피해/사거리/반격 변경없음.
- 파일: characters/hab; CHARACTER_RULES; test-hab; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 헤브 컴파일 이동속도3.75/느림·실제발사반경20/25 검수. 실제온라인 플레이 미검증.
- 실플레이 권장: 헤브 느림 이동·평타20/스킬25투사체.


## 3.0.0-character.169 — 2026-10-08 KST

- 요청/결과: 시로 스킬600스테미나/넉백100/점프300ms·높이60/화염초당30. 헤브 평타25·스킬35반경/탄속30·37.5/사거리550/각400ms쿨/스킬넉백100/항시50%회복. 레비나 스킬 최초투척·재조작·귀환 넉백 반복허용.
- 구조: 캐릭터 순수데이터와 기존 공용모듈 조합. 시로500ms화염틱15로 초당30. 레비나 스킬3경로의 oncePerExecution=true 제거(false)하여 재사용된 투사체 실행의 넉백소비기록에 차단되지 않게 함. 타격중복 판정은 기존투사체가 담당.
- 파일: characters/siro/hab/levina; test-siro/test-hab/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀와 build/docs/check/verify/runtime구문/ZIP무결성 통과. 시로 실제300ms점프·화염틱/헤브 실제탄반경·속도·회복·넉백 검사. 실제온라인 플레이 미검증.
- 실플레이 권장: 시로 점프·화염/헤브 공격/레비나 반복스킬 넉백.


## 3.0.0-character.170 — 2026-10-08 KST

- 요청/결과: 레비나 삼지창 무기이미지 배율1.85→1.665(10%축소). 기울기/투척중숨김/모션/전투판정 유지.
- 구조: 레비나 순수데이터 weaponImage.scale만 수정. 공용렌더/은신/사망페이드 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.171 — 2026-10-08 KST

- 요청/결과: 레비나 삼지창 배율1.665→1.58175(현재대비5%추가축소). 하푸푸 평타넉백거리35→52.5(50%증가). 다른수치/모션/판정 유지.
- 구조: 캐릭터 순수데이터 weaponImage.scale 및 movement.knockback.distance만 수정. 기존 공용렌더·전투모듈 사용.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.172 — 2026-10-08 KST

- 요청/결과: 하푸푸 평타넉백거리52.5→47.25. 기존35대비 증가율을50%에서35%로 조정. 레비나 무기크기 유지.
- 구조: 하푸푸 순수데이터 movement.knockback.distance만 수정. 기존 공용전투모듈 사용.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.173 — 2026-10-08 KST

- 요청/결과: 사용자 제공 헤브·시로 stats/desc/tooltipSkills 반영. 헤브체력1200/난이도4·한줄설명 및 반격설명 교체. 시로 다중사격2/3발·토끼뜀 설명 교체. 전투모듈 유지.
- 구조: 캐릭터 순수데이터 및 헤브 체력 회귀기대값 변경. tooltip 값참조 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 헤브·시로 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.174 — 2026-10-08 KST

- 요청/결과: 시로 화살비 지속타격 넉백이 시로 위치를 기준으로 계산되던 문제 수정. 공용 장판 타격 실행의 impactOrigin을 실제 장판중심으로 설정하여 이동후에도 중심 반대방향으로 넉백.
- 구조: InstalledAreaFieldService.fieldTrigger에서 실제 area.center를 point impactOrigin으로 전달. away-from-impact 공용효과가 장판중심을 읽음. 생성타격의 기존 착탄중심 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 시로·무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.175 — 2026-10-08 KST

- 요청/결과: 실제 장판 state.execution=null인 경우 중심좌표가 전달되지 않아 기본0rad 오른쪽넉백이 되던 원인 수정. 실행정보가 없으면 공용 AttackExecutionService.create로 생성 후 실제장판 중심 전달.
- 구조: InstalledAreaFieldService.fieldTrigger에서 실제 area.center를 point impactOrigin으로 전달. away-from-impact 공용효과가 장판중심을 읽음. 생성타격의 기존 착탄중심 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 실제와 동일한 execution=null·시로이동후 상하좌우4방향 넉백 회귀 및 시로·무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.
