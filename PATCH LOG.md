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
