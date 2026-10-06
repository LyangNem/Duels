# 테르디온 — 3.0.0-character.14

테르디온 / 노련한 발파원 / 지속전투형 원거리 컨트롤러. 체력 1500, 이동속도 4(보통), 반경 20, Base Damage 100, 색상 #238f96. 공식 59번째 순수 데이터 캐릭터이며 향후 모듈 선택·값 입력 방식 제작 데이터와 같은 계약을 사용한다.

## 현재 수치와 동작

| 공격 | 직격 | 폭발 3단계 | 폭발 반경 | 비행 사거리 | 스테미나 | 쿨다운 | 탄속/반경 |
|---|---:|---|---:|---:|---:|---:|---|
| 폭약 카트리지 | 150 | 300 / 200 / 100 | 120 | 850 | 200 | 450ms | 20.8/14 |
| 발파 폭약 | 200 | 600 / 400 / 200 | 180 | 500 | 800 | 1200ms | 18/18 |
| 폭약밭, 폭약 1개 | 착탄150 | 300 / 200 / 100 | 120 | 350 | 0 | 공통 선딜300ms | 14/14 |

폭발 반경을 3등분한다. 대상 중심까지의 거리가 R/3 이하면 100%, R/3 초과~2R/3 이하면 2/3, 2R/3 초과면 1/3다. 시전자 위치가 아니라 실제 착탄점 기준이다. 구간 안에서 피해는 연속 감소하지 않는다. 정확히 경계에 있으면 기존 radial 비교 규칙대로 안쪽 단계다. 넉백 거리만 기존 선형 감소(평타/반격100→20, 스킬140→20)를 유지한다.

세 공격 모두 기존 anchor-cross 무기 투사체를 사용한다. 평타는 단발 폭약 투척으로 롤백했고 비용200·쿨450ms·직격150·반경14를 사용한다. 첫 벽/적 접촉 또는 사거리 끝에서 멈춘다. 스킬은 메후구 로프와 같은 trajectory.arc(높이120, 상승비율.72, 최고점 크기.84/알파.4/윤곽.62)로 지정점에 투척한다. 비행 중 벽을 넘어가며 중간 경로에는 피해를 주지 않고 지정점 착탄 시 적 우선 판정으로 직격 피해200을 적용한다. 지정점의 벽/빈 바닥에서도 착탄한다. 반격도 같은 공중 연출로 최대350까지만 투척하며 비행 중 적은 통과하고 벽/사거리 끝에서 착탄한다. arrival.triggerOnLanding은 착탄 순간 가장 가까운 접촉 적에게 공통 피해 경로로150을1회 적용한다. 빈 지점·아군·회피에는 피해를 주지 않으며 재진입해도 반복하지 않는다.

착탄한 실제 Projectile 객체를 arrival.linger로 500ms 고정한다. 다른 적에게 다시 직격하거나 회수되지 않는다. 기존 areaCircle의 remainingArcGauge를 투사체 바깥6px에 표시해 100%에서 0%로 줄인다. 이 효과는 본체를 덧그리지 않고 호만 표시한다. 같은 시간500ms를 원본 delay에서 참조해 폭발 예약과 일치시킨다. 호 이펙트는 기존 EffectSpec snapshot 경로를 사용하며 visibility:owner-team으로 본인·아군에게만 표시하고 상대에게는 숨긴다. 투사체 본체와 폭발은 기존 공개 범위를 유지한다. 설명은 (150/300), (200/600), (150/300) 형식으로 두 피해 수치만 표시한다.

폭약밭은 공통 반격 선딜300ms 뒤 첫 조준 방향부터 시계방향45도 간격으로 8발을 40ms마다 발사한다. 선딜 미리보기는 비행 경로 없이 착탄 폭발 원8개를 모두 표시하고, 막힌 방향만 기존 벽 raycast 지점으로 단축한다. 사거리 끝 착탄은 snapToRangeEnd로 정확히350에 고정한다. 반격은 기존 ccRefAttackId와 movement.neutralize-knockback을 사용한다.

## 공통 모듈과 역할

- delivery.projectile / projectile.presentation / trajectory.arc / arrival.linger: 이동·착탄 직격·무기 표시·공중 연출·정지 수명. 새 캐릭터 실행 서비스나 렌더러 없이 조합한다.
- projectile.impact.oncePerProjectile: landing/explosion AttackSpec을 key별1회만 실행한다. TargetPointProjectileService는 벽/빈 지정점에서 잔류 시작 시에도 같은 impact 진입점을 사용한다. 확정 전 예측 접촉은 폭발을 확정하지 않는다.
- delivery.area.delay / SimulationScheduleService: 고정 착탄점에서 500ms 뒤 실제 범위 판정. 소스 사망/세션·맵 정리 시 기존 지연 공격 정책대로 미실행 예약을 취소한다.
- damage.range-band-multiplier: 기존 radial에 centerMode:impact만 추가한다. R/3에서 2/3, 2R/3에서 .5를 누적해 최종1/(2/3)/(1/3)를 만든다. 기존 source 기준 캐릭터의 동작은 유지한다.
- effect.spawn / remainingArcGauge: 동일 프레젠테이션 정의·타임라인으로 호 게이지 생성/복제. 별도 테르디온 게이지 구현 없음.
- AttackPreviewService / AttackPreviewAreaService: 순차 투사체의 각 angleOffsets와 실제 linked delivery.area를 같은 미리보기 목록에 넣는다. 다른 다방향 착탄 기술도 재사용한다.
- OnlineDuelService: 예측 소비 후 확정 착탄이 오면 같은 무기 투사체를 기존 spawn/linger로 복원한다. 복원에는 비행 지연 보정을 적용하지 않으며 key별 중복 확정은 새 객체/새 폭발을 만들지 않는다.
- WorldDestructionService: 지형 제거·원본 보존·라운드 복원·revision 캐시. 파괴 변화 시 기존 effectShape 애니메이션으로 회색 작은 조각을 240ms 표시한다. 한 사건 최대32개이며 별도 화면 흔들림은 추가하지 않는다. 소유 화면에서 만든 동일 snapshot을 기존 온라인 presentation 경로로 전송한다.

## 지형과 교체 맵

비오픈맵3(official-basic-closed-03), 비오픈맵8(official-basic-closed-08)의 전체 타일을 첨부 JSON으로 교체했다. 기존 ID·순서·28×40·50px 구조를 유지한다. 저장은 기존 압축 wallRects로 변환하며 디코딩 결과가 첨부본의 모든 타일과 동일하다. 기존 팀전 맵은 변경된 원본으로 자동 파생한다.

world.destroy-walls는 이전 character.1에서 분리한 범용 지형 파괴 모듈이다. 조회/벽 설치/채굴은 원본 맵 제거·복원·스냅샷 책임이 없어 분리했으며 다른 지형 파괴 범위 공격도 재사용한다. 이번 버전에는 새 gameplay 모듈을 추가하지 않았다.

맵 원본은 보존하고 큰 벽은50px 블록 단위로 부분 제거한다. 설치 벽은 해당 인스턴스 전체를 제거한다. 월드 외곽은 파괴하지 않는다. 스킬 폭발은 wallPolicy:block으로 벽에 막힌다. 기존 벽으로 폭발 형상/LOS/피해/FX를 먼저 확정하고, 그 뒤 폭발180이 실제 도달한 벽과 탄환18에 직접 닿은 벽을 제거한다. world.destroy-walls.range는 폭발 range, contactRange는 탄환 radius를 참조한다. wallPolicy:block 선택은 파괴 전 벽 목록과 공통 segmentRectEntry로 가려진 벽을 제외한다. 벽이 파괴돼도 같은 폭발은 그 뒤 대상/벽으로 관통하지 않는다. 직격200, 폭발600/400/200, 스테미나800. 평타/반격은 벽을 파괴하지 않는다. 기존 단조 제거 집합/맵ID/roundToken 검증과150ms 전투 snapshot을 유지해 중복/역순/stale 설치 벽 패킷이 지형을 복원하지 못하게 한다. 새 라운드/맵 set에서는 제거 목록을 비운다.

## 검증과 직접 플레이

`node tools/test-terdion.cjs`: 27개 제어된 실행 검사. 기존12개에 피해 경계, 무기/궤적/설명, 실제 잔류 진입, 8방향 미리보기, 실제 호 렌더, 조각 수/타임라인 복제, 첨부 맵 전체 타일 SHA-256, 실제 스킬 적/벽/빈 지정점 도착, 실제 온라인 확정 수신 복원을 추가했다. 렌더는 Canvas 호출을 기록하며 일부 geometry·Entity·전송은 모의 환경이다.

59명 구조11개·기존 게임15개·방 연결17개, 구문/배포 일치/원본 UI·미변경 리소스/기존 규칙/역할 문서/ZIP 추출본 검사를 유지한다. 실제 브라우저·기기 간 WebRTC/Firebase와 실전 밸런스·프레임 성능은 미검증이다.

직접 검수: 테르디온 평타 적/벽 착탄과 호 게이지, 스킬 중간 벽을 넘어 지정점 착탄/직격/벽 파괴, 반격8개 미리보기/순차 투척/175거리/무력화, 다음 라운드 지형 복원. 상대·관전자 화면의 동일 위치/호/폭발/파괴도 확인한다. 공통 경로 회귀 대상으로 메후구 착탄/로프, 시아넬리 비도 잔류·회수, 루네프 착탄, 클레아 거리 피해를 확인한다.

## 순차 평타·폭발 취소 — 3.0.0-character.10
- 기존 delivery.delayed-projectile-volley: count5, interval40ms, aimMode locked, angleOffsets -π/6,-π/12,0,π/12,π/6. 새 발사 서비스 없이 좌측부터5발 산탄. 비용/쿨다운은 공격 요청1회에 적용.
- 기존 projectile.impact.cancelDelayedOnRemove:true: source+projectile networkKey에 지연 후속 실행 토큰 연결. ProjectileService.discard는 폭발 예정시각 전 제거 때만 취소한다. 만료 프레임 제거와 예약 갱신 순서가 바뀌어도 정상 폭발 유지.
- 기존 effect.spawn.stateKey projectile-fuse: 실행별 호 키를 기록해 취소된 폭약의 호만 EffectSpawnService.removeKey로 제거. 다른 폭약/폭발에는 영향 없음.
- 온라인 guard 확정은 기존 correctGuardPath에서 같은 key의 토큰도 취소하므로 예측/확정 carrier가 달라도 같은 폭약에 적용. stationary 폭약도 폭발 전 방패 접촉을 검사.
- 검증: 테르디온25개·구조12개·게임15개·방17개. 실제 브라우저/WebRTC 시각 검수 미실시.

## 정상 만료 폭발 누락 수정 — 3.0.0-character.11
착탄 수명은 프레임 now, 폭발 예약은 후속 performance.now()를 사용해 만료가 예약보다 먼저 도달할 수 있었다. 이전 제거 처리에서는 정상 만료까지 조기 제거로 오인했다. ProjectileService.finish/discard에 종료 이유를 전달하고 updateStationary의 수명 만료는 expired로 표시해 예약 취소를 건너뛴다. 방패/강제 제거는 기존 removed로 해당 폭약만 취소한다. 평타·스킬·반격 각각0.1/1/8ms 차이, 만료/예약 두 실행 순서18조건을 추가 검사했다. 테르디온26개·구조12개·게임15개 통과, 실제 브라우저/WebRTC 미검증.

## 현재 반격 착탄 거리
선딜 중 마우스 위치를 aim-point로 갱신하고 발사 시작 시 시전자와 마우스 거리(최대350)를8방향에 공통 적용한다. 발사 중에는 확정 거리를 유지한다. delayed-projectile-volley.distanceMode:target-point를 공통 실행과 미리보기에서 같은 volleyTravelRange로 해석한다. 벽은 기존 방식으로 더 가까운 착탄점으로 단축한다.0/100/350/600 거리의 실제8발 및 미리보기 일치 회귀 포함28개 검증.
