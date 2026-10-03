# 방 연결 — 3.0.0-room.2

RoomConnectionService는 연결과 타이머의 단일 소유자다. RoomService는 참가 승인과 방/매치 데이터의 단일 소유자다. UI는 기존 RoomUI로 표시한다. 기존 NetworkPayloadCodec을 재사용한다.

## 흐름
- 생성: reset/이전 세대 무효화 → PeerJS 로딩 → 4자리 후보 예약 → open 성공 → 코드 공개/P1 방장 등록 → 참가 대기. unavailable-id는 다른 번호로 최대 32회 시도한다.
- 입장: 번호 형식 확인 → reset/이전 세대 무효화 → 익명 Peer 등록 → namespace가 포함된 방 ID 연결 → hello → host 승인 → room-assign/state 적용. 승인 전에는 게임 메시지를 처리하지 않는다.
- 취소/나가기: 세대 증가 → 타이머 취소 → Peer/채널 참조 제거 → 채널 종료 → 방 상태 정리. 늦은 open/data/close는 세대와 현재 소켓 소유권 검사에서 폐기된다.
- 승계: 실제 host DataChannel 종료 → 기존 host 이탈 규칙 반영 → 기존 순서의 후보 선정 → 동일 코드 등록 경쟁 또는 기존 후보에 재접속 → 예약 성공자만 host 권한 설정 → 기존 매치 재개. 후보별 4초 간격을 주며, 전체 45초 뒤에는 종료 안내와 자원 정리한다. 등록 충돌 때는 이미 승계된 host에 연결을 시도한다.

## 승인 계약
hello는 protocol=1, 공개 code, profile, 비어 있지 않은 sessionKey를 포함한다. migration hello에는 기존 roomInstance, migrationEpoch, desiredPid가 추가된다. host는 migrationEpoch/roomInstance와 기존 member의 PID/sessionKey/이탈 여부를 모두 검사한다. 승계 검증 실패를 신규 참가로 바꾸지 않는다.
room-assign의 state에도 protocol/code/roomInstance/members가 들어간다. client는 본인 PID/sessionKey를 확인하고, 승계일 때는 기존 PID/epoch/instance를 추가 검사한다. 다른 방의 room-state는 폐기한다. 이는 연결 정합성 검사이며 별도 서버 인증 시스템을 추가한 것은 아니다.

## 실패 및 한계
Peer 등록은 12초, 참가 승인은 10초, 승계는 전체 45초로 제한한다. 제한은 다시 시도할 수 있는 실패 상태로 끝나며 무한 재시도하지 않는다. CDN은 각 URL 10초 뒤 다음 URL로 넘어가고 다음 사용자 시도에서 다시 로딩할 수 있다.
신호 서버 disconnected는 데이터 연결이 남아 있을 수 있으므로 방을 지우지 않고 reconnect한다. DataChannel 자체의 close/error는 참가자 이탈/호스트 승계를 발생시킨다. 운영 PeerServer와 NAT 조건은 실제 기기로 추가 확인해야 한다.

## 호환성과 검사
기존 숫자 Peer ID 방과 새 namespace 방은 연결되지 않는다. 모든 플레이어가 같은 새 배포본을 사용한다. 게임의 계정 저장/캐릭터/전투 데이터 형식은 변경하지 않았다.
`node tools/test-room-connection.cjs`는 Node 내장 vm/assert와 가짜 Peer·채널·시계로 실제 서비스 핸들러를 검증한다. 네트워크를 쓰지 않는 재현 검사이며 실제 브라우저/WebRTC 검증과 구별한다.
실기기에서는 2인/4인 참가, 만원 방, 취소 후 재생성, host 브라우저 종료 및 P2 승계, 선택/증강/전투/결과 단계별 승계, 모바일/서로 다른 네트워크 연결을 확인한다.

## 참가 카드 순서
PID는 빈 P1~P4를 재사용할 수 있는 네트워크 식별자다. 카드 위치는 joinOrder 오름차순이다. 새 입장/일반 재입장은 증가하는 순서를 배정하며 기존 멤버 뒤에 표시한다. 호스트 최초 입장만 명시적 0을 사용한다. null/undefined/비정상 순서는 0으로 변환하지 않는다.
RoomService는 사용한 최대 입장 순번을 joinSequence로 스냅샷에 담는다. acceptState는 이 값과 현재 멤버의 최대 joinOrder로 로컬 카운터를 갱신하므로, 최근 입장자가 떠난 뒤 승계돼도 과거 순번을 재사용하지 않는다. 승계 자동 재연결은 멤버 객체를 복구하므로 기존 입장 순서를 유지한다.
예: P1/P2/P3 중 P1 이탈 → P2/P3 유지 → 이전 P1 재입장 시 화면은 P2/P3/P1. 중간 P2 이탈·재입장 시 화면은 P1/P3/P2. 방장 권한은 카드 위치/PID와 독립적이다.
