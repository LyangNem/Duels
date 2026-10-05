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
