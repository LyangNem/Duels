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
