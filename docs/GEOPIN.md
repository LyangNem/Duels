# 지오핀 — 3.0.0-character.70

천재 발명가 · 체력1100 · 이속4.5(매우 빠름) · 노랑#e6ca3b · 반격형 하이브리드 딜러.

## 발명 조건
각 조건3회로 발명·자동 장착한다. 완성 후 같은 조건 발생 시 재장착한다. 동일 공격의 조건이 겹치면 아래 순서로 하나를 누적한다. 실제 피격과 무적/비타격 무적/저스트 회피로 피한 공격 모두 누적한다. 같은 비타격 무적 투사체 접촉은 대상별1회 기록하며 투사체를 소비하지 않는다. 피해0 일반 사건·아군/자기 공격·사망·비권위 미러는 누적하지 않는다.

| 순서 | 조건 | 발명품 |
|---|---|---|
|1|지속 적 공격 장판 범위 진입|추진 도약기|
|2|벽 뒤 적에게 공격받음|충격 전달기|
|3|적 방어에 자신의 공격 차단|고회전 레이저|
|4|적 소환수에게 공격받음|전이 고무탄 발사기|
|5|상대 이동/끌어당김으로 급접근|주먹 발사기|
|6|기절/속박/빙결/수면/무력화|과반동 발사기|
|7|위 조건 외 직접 공격 접촉 거리≥기본 고무탄 사거리(현재500)|정밀 고무탄 발사기|
|8|위 조건 외 직접 공격 접촉 거리≤150|폭발 고무탄 발사기|

급접근은350ms 안에 거리100 이상 감소·최종350 이하이며 적 자체 이동75 이상 또는 상대 끌어당김이 필요하다. 적 플레이어/훈련봇/소환수 모두 대상이다. 기본 회피140/130ms 접근도 감지한다. 고정 시간 구간 대신16ms 간격의 재사용 rolling history(350ms 기준24슬롯)를 검사하여 경계를 가로지르는 이동도 감지한다. 같은 적은 거리450 초과 후 재감지하며3회로 제작한다. 아군/사망 대상·지오핀 자신만의 이동/회피는 제외. 첫 관측 이전 이동/새 소환 그 자체는 접근으로 세지 않는다. 같은 타격의 장판/CC/피해 보고는 같은 source 사건으로 우선순위 통합한다. 방어 차단은 공격 실행키로 중복 방어 확정을 제거한다.
LMB는 장착 무기. RMB는 비용0/쿨250ms로 기본 무기 복귀하되 이미 기본 무기면 입력 Trigger에서 차단하여 공격/쿨/사용 사건을 만들지 않는다. 반격은 마지막 조건을 시간 제한 없이 기억하여 해당 무기를 즉시3회 완료/장착하고 주변 피해. 무적/저회도 마지막 조건을 바꾸며 그 뒤 장판에 진입하면 장판 조건이 최신이 된다. 조건이 없으면 기본 무기.

## 현재 공격 수치

|무기|피해|소모|쿨ms|사거리|전달/추가|
|---|---:|---:|---:|---:|---|
|기본 고무탄|200|150|300|500|탄속30·반경14|
|추진 도약기|0|150|400|180|200ms·높이55·지정점 점프·이동 중 비타격 무적|
|충격 전달기|200/300|150|450|650/200|탄속30·반경14·벽 뒤 반폭45 네모|
|고회전 레이저|150|200|500|500|즉시 사각 레이저·반폭14·72ms 표현|
|전이 고무탄|200|150|450|700|탄속32.5·반경14·적중마다 기본 사거리40% 추가·전환 무제한·대상별1회|
|주먹 발사기|150|150|400|200|반폭50·진행속력12240·표현220ms·넉백180|
|과반동 발사기|250|200|500|500|탄속52.5·반경14·자가 후방100/140ms|
|정밀 고무탄|200|200|500|700|탄속60·반경11|
|폭발 고무탄|200|200|500|250|탄속27.5·반경17·원형 폭발110·넉백 없음|
|반격|250|0|350|220|공통300ms 선딜·무력화 넉백100|

피해는 Base Damage100×Damage Ratio의 단일 원본이다. 폭발은 적중 또는 사거리 끝에서 별도 AttackSpec으로 실행한다. 방어 제거/저회한 접촉에서는 적중 폭발을 만들지 않는다. 직격과 폭발은 각각 기본200이며 실행 적중 집합을 공유하여 동일 대상에 중첩하지 않는다. 직격 대상 이외 주변 적은 폭발200을 받는다. 공통 피해 증감/방어 보정은 적용한다. 폭발은 벽에 막히며 벽을 파괴하지 않는다.

## 고무탄 반사·충돌
모든 고무탄(기본/충격/전이/과반동/정밀/폭발)은 벽에 튕긴다. 고회전 레이저/주먹/점프는 고무탄이 아니다. 벽 반사 시 실제 탄환 반경을 포함한 경로가 열린 가까운 적을 향하고, 적이 없거나 해당 방향이 벽으로 막히면 실제 진입면 법선으로 정반사한다. 벽 반사의 탐색 범위는 searchRadius:0으로 무제한이며 남은 사거리 밖이라도 가시 적을 선택한다. 전이탄의 실제 적중 연쇄도 가시 적 탐색은 무제한이며 전환 횟수 제한은 없다(동일 탄환의 같은 대상 재타격은 제외). 사거리 끝에서는 반사/재조준/확장하지 않고 정상 종료한다. 벽 뒤/이미 적중한 대상은 후보 제외.
벽 반사는 사거리를 늘리지 않는다. 기본500/충격650/전이700/과반동500/정밀700/폭발250에서 시작한다. 전이탄만 실제 적중마다 발사 당시 준비된 AttackSpec.range의40%를 누적 추가한다(기본700이면700→980→1260→1540…). 현재 늘어난 사거리의40%를 곱하는 복리 증가는 아니다. 마지막 적중 뒤 다음 후보가 없어도 증가값을 기록하며 종료한다. 기존 소모 거리는 초기화하지 않고 벽 이탈 보정도 소모한다. searchRadius:0은 후보 탐색만 무제한이다. nearest는 wallCollisionPadding과 적/탄환 반경으로 최초 적 접촉까지 전 구간을 검사하여 탄환 가장자리가 걸리는 벽/틈을 제외한다.
일반 탄환은 실제 도달 가능한 벽 앞 이동 구간에 대해 접촉 순서대로 판정하고, 첫 접촉 위치와 현재 탄환 방향을 DamagePipeline/AttackExecution/onHit에 전달한다. 벽 처리 전에 이전 경로를 없애지 않는다. 특수 궤도/소스 추적은 기존 형상·수명 경로 유지. 마름모는 실제 swept 마름모 판정으로 접촉 시각을 찾는다. 후보 배열·비교 함수·probe는 Projectile 객체에 재사용한다.
충격 전달은 확대 충돌체의 실제 접촉 블록을 찾고 실제 블록 내부에서 진행 방향에 따른 연속 벽 출구를 계산한다. 고각도에서 반경만큼 전진한 점이 벽 안에 없어서 전달이 누락되던 방식을 제거했다. 출구의 geometrySource/impactOrigin/FX/피해를 동일 좌표로 사용하고 그 다음 떨어진 벽도 관통한다(delivery.area.wallPolicy:ignore). 벽을 파괴하지 않는다. 벽 반경 안에서 시작하면 기존2px 보정으로246↔248 반복 재충돌을 실제 재현했다. clearContact가 인접 확대 벽들의 겹침 깊이까지 계산해 완전히 이탈한다. 보정 거리는 travel에 포함하고 매 프레임 배열은 만들지 않는다.

## 표시·디버그
뒤 기어1개 반경50/16톱니·이중 림·6살/볼트/육각 축. 다른 무기 전환350ms1회전·회전 동안 불투명·500ms 페이드·기본0.2. 같은 무기 선택 재회전 없음. 원격 ModeState snapshot은 같은 시간축 유지.
본인 오른쪽 호8개 반경11·3/3/2·x58/y-30/간격29. 활동500ms 강조+500ms 페이드·기본0.35·활성 밝은 노랑#fff5a3/알파1·중앙 점 없음. 본인 점선 원150/기본500, 무기 전환에 따라 원거리 기준이 변하지 않는다. 디버그 ‘발명품 활성화’는 기본+8종을 선택/완성하며 기존 OnlineDebugControlSyncService 권위/동기화 사용.

## 사용 모듈과 책임
- equipment.situation/situation.flag: 공통 사건을 목록 우선순위로 분류. ProgressStateService 최대3 누적, ModeStateService 장착. farAttackId로 기준 공격 사거리 참조.
- action.attack alternates/state.mode-is: LMB 대체 공격 선택. invert:true는 모드가 같지 않을 때 RMB 허용. 기존 조건 파라미터 확장이므로 새 모듈 없음.
- delivery.projectile: 속력/반경/사거리. projectile.redirect: 벽·hit 방향 전환/탐색반경/선택적 증가율. 전이탄 rangeGrowthRatio:0.4/rangeGrowthOn:[hit]는 매 적중마다 준비된 기본 사거리40%를 더하고 벽은 제외한다. searchRadius:0은 실제 벽/적 접촉에서 무제한 가시 적 탐색, range 이벤트/종점 재조준 경로는 삭제. 기존 서비스에서 충돌면·이탈 깊이 처리만 확장, 별도 고무탄 실행 코드 없음.
- projectile.wall-relay: 접촉 벽 출구에서 기존 AreaAttackService 네모 실행. projectile.pierce: 전이 적중 뒤 다음 대상으로 이동. projectile.impact: 적중/종점의 별도 원형 폭발.
- effect.spawn progressRect + damage progressive-rect: 샤베트의 진행형 네모를 주먹200/50/12240/220ms로 재사용. movement.knockback on-hit: 주먹 적중 넉백180/속력12/공격 방향 고정(direction:attack). 폭발 넉백은 제거.
- movement.move + trajectory.arc: 페이즈의 지정점 점프·벽/적 통과·종료 겹침 해소·이동 중 evasionInvulnerable 재사용(거리180/200ms/높이55/상승비율0.55). 자체 반동100/140ms은 기존 모듈 유지.
- delivery.area instant-laser + effect.spawn beamLine: 파비 레이저의 즉시 공격/흰 코어/글로우 표현 재사용, 사거리500/반폭14/72ms/캐릭터 노랑. wallPolicy:block과 clipToAttackArea:true로 실제 벽 절단과 표시 공유.
- counter.execute:300ms 선딜·준비 소비·미리보기·무력화 넉백100. equipment.discover는 마지막 조건 즉시 완성, equipment.select는 성공한 기본 복귀 후 장착값 변경.
- DamagePipeline/JustDodge/initialization-equipment: 실제 피해·저회·피해 무적/비타격 무적 접촉 사건을 같은 발명 어댑터로 전달. 기존 피해/CC/권위 계산 유지. 캐릭터 이름 분기 없음.
- gauge.equipment-bank/ArcGauge/gearCluster/range.equipment-thresholds: 데이터 기반 배치와 표시. ProjectileRedirectSyncService: 동일 revision/좌표/현재 방향/증가 횟수·사거리 결과 복제 및 생성 전·역순 보정.

## 검증과 실기기 확인
지오핀62/구조22/가에9/테르디온29/게임15/방19/이동19(총175그룹) 자동 회귀, 구문/build/docs/check/verify 및 ZIP 전체 바이트 일치/CRC 검사. 제어된 Node VM에서 실제 공통 updateOutbound/피해/반사/전달 모듈을 실행한다. 실제 브라우저·두 기기 WebRTC는 미검증.
실기기에서는 기본·정밀 고무탄으로 벽에 붙은 적/이동 중 적 타격, 타일 모서리·이음새·비스듬한 반사·벽 반경 내부 시작, 사거리 끝 정상 종료/폭발, 충격 전달의 여러 각도/이어진 벽, 무적/저회 중8호 누적, 주먹의 진행 피해/넉백, 점프와 즉시 레이저, 기본 상태 RMB 무반응, 온라인 적 튕김 방향/거리 복제를 확인한다.

character.18: 스패너 공통 WrenchShapeRenderService를 양쪽 열린 턱·각진 어깨·홈 손잡이로 리디자인했다. 캔버스로 실제 크기/확대 외형 확인, 판정/내구도/재생 수치 유지. 같은 컴퓨터 참가 계약은 ROOM CONNECTION.md.

주먹의 실제 표시/피해 진행은 growthSpeed13.464 × (시간/220ms)로200거리를 약16.3ms에 완료한다. travelSpeed12240만 변경하면 고정 사거리에는 적용되지 않으므로 기존 공통 growthSpeed도 함께 설정했다. 15ms 미접촉/17ms 종점 타격 실제 서비스 회귀 포함.

character.23: 장판 진입은 매 프레임 insideTargets 전환에서1회만 집계한다. 반복 피해/무적/저회 field-area 사건은 발명 집계에서 제외한다. 이탈 후 재진입은 새 진입이다. 동적 차막이도 behindWall에 포함한다. 접촉 반경 안에서 생성된 충격 전달 탄환은 해당 블록을 찾아 벽 뒤 네모150을 실행한다. 폭발 고무탄은 projectile.impact.shareHitTargets:true와 두 AttackSpec의 hit.once-per-execution을 조합한다.59 회귀 그룹은 실제 공통 서비스와 제어된 피해/권위 스텁을 사용하며 실기기 검증을 대신하지 않는다.

character.24: 거리 조건은 reactiveEquipment.distanceImpactTypes의 direct/projectile/area/effect-animation 접촉만 허용한다. dot:true 및 distanceExcludedAttackTags(상태 피해/덫 발동/이동 제한 CC 태그)는 제외한다. 피해 종류 없는 사건도 제외. 무적/저회로 피한 직접 공격은 집계한다. CC 자체는 기존 과반동 발명 경로이며 트랩/장판은 거리 조건이 아니다. 뒤 기어 평소0.2/반경50, 회전 중1과500ms 페이드 유지. 개인8호의0.35/크기는 유지. 실제 기어 렌더와 직접/비직접 피해 분류 회귀 포함.

character.24 추가: 과반동의 restrictedStatuses에서 knockback, restrictedAttackTags에서 넉백을 제외. 순수 넉백/넉백 저회는 제작·자동장착·마지막 조건을 바꾸지 않는다. 기절/속박/둔화/빙결/수면/무력화/끌어오기 조건은 유지. 넉백 공격은 거리 조건 제외 태그에는 남겨 거리 게이지로 우회 집계하지 않는다.62 지오핀/총175 회귀 검사.

character.26: 실제 엔소냐 평타 모듈에서 생성한 TagService 태그와 JustDodge 이벤트3회로 과반동0스택 회귀 확인. 최신 소스에서 신고 미재현, 전투 코드 추측 수정 없음. 사용자 실행 파일은 미확인. 지오핀63 회귀.

character.27: 과반동은 같은 활성 CC의 replace-source/refresh-type 수명 갱신으로 스택을 추가하지 않는다. 최초 적용1회, 제거/만료 후 재적용 또는 다른 sourceId 적용은 새 사건이다. 코녕50ms/120ms 둔화 갱신20회에도1스택·이후 해제/만료 재적용3회로 제작하는 실제 CCService 회귀 확인. 지오핀64 포함177 회귀.

character.28 현재 계약: 직접 넉백 공격은 거리 조건에서 제외하지 않는다. 루네프 화염 폭발 직접 피해는 원거리 정밀 스택, 화염 지속 status/DOT는 제외. 넉백은 여전히 과반동 제한 조건에서 제외. character.24의 넉백 거리 우회 차단 기록은 이 버전에서 폐기. 실제 루네프 데이터/TagService 회귀 포함65/총178 검사.

character.29 현재 계약: 둔화/끌어당김/넉백은 과반동 제작·자동장착 조건이 아니다. 이동 정지5종만 인정. 코녕 둔화는 진입 추진 게이지만 집계한다. 과반동 기본250/사거리500. character.27 둔화1스택 검증은 폐기되어 현재0스택 검사로 대체.66/총179 회귀.

character.30: 체력1300. 체리티 실제 저격/차징 태그에 자기 속박이 포함되지 않으며 원거리 정밀 누적 정상 확인. 벽 뒤 조건이 정밀보다 우선이라 벽 관통 피격은 충격 전달기로 분류. 실제 사용자 환경의 누락은 미재현. 타우 추격 공통 onHit carrier/온라인 확정 적중점 변경과 관련 회귀 포함68/총181 검사.

character.31: 주먹 급접근은 관측 상대 이동속도가 현재 기본 이동속도×CombatStats.speedMult의1.2배를 초과해야 한다. 일반/버프 걸음은 제외. 회피/빠른 이동 및 기존 끌려감 예외 유지.69 회귀 통과.

character.32: 200 미만 고무탄 본체(기본/충격/전이100, 정밀150)를200으로 상향. 충격 전달 네모150·레이저150·주먹150은 고무탄 투사체가 아니므로 유지. 과반동250/폭발200 유지.

character.33: 충격 전달/반사 사건 패킷을 Room 허용 목록에 등록하여 상대 피해 권위 화면에 전달한다. 실제 Room 호스트/클라이언트 라우팅 회귀 추가. 무기 투사체 소유 연결 점선은 본인만 표시.183 회귀, 실제 두 기기 실전 미검증.

character.34 현재 RMB 계약: 우클릭 즉시 이전 장착 무기로 전환, 홀드200ms 시 고무탄 복귀. 기존 holdTriggerWhilePressed/equipment.select operation:previous 파라미터 확장 사용. 전환 이력 previousValue를 공통 ModeState snapshot에 복제. 동일 무기 재선택은 이력 미변경. 짧은 클릭 직후 전환하고 계속 누르면 기본으로 전환. 기존 비용0/쿨250ms 유지. 지오핀69 포함183 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증. 이전 기본 장착중 RMB 금지 계약 폐기.

character.35 현재 계약: 충격 전달 벽 뒤 네모 기본 피해150→300(DamageRatio3). 벽 뒤 조건은 기존 직접 공격 허용 유형/제외 태그 검사와 함께 평가. 트랩/field-area/상태DOT/CC 태그 공격·해당 저회는 벽 뒤 집계에서 제외, CC 자체 적용은 이동 제한 조건만 처리. 직접 투사체/범위 공격과 동적 차막이 지원 유지. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증.

character.36 현재 RMB 계약: 지오핀 RMB는 기존 tapHoldSplit/holdGauge 경로 사용. 누르는 동안200ms 호게이지 표시, 200ms 미만으로 떼면 이전 무기, 200ms 이상 홀드 후 떼면 기본 고무탄 전환. 눌렀을 때/홀드 도중 전환 없음. 엘린 등과 같은 PointerHoldInputService 호게이지/해제 분기 재사용. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증. 이전 즉시 전환 계약 폐기.

character.37 현재 수치: 고무탄6종 반경18. 사거리500→650(기본/과반동),700→850(전이/정밀). 탄속은 사거리 비율 곱해 기본39/과반동68.25/전이약39.4643/정밀약72.8571. 충격650/탄속30, 폭발250/27.5 유지. 원거리 조건과 개인 점선 기준은 기본 사거리 참조로650, 전이 적중40% 추가는340. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증. 이전 표의 사거리/크기/탄속은 이 항목으로 대체.

character.38: 기본 고무탄 평타 쿨400→350ms(0.35초). 발명품별 고유 쿨은 유지. 기존 홀드 평타 반복은 AttackSpec.cd 원본을 참조. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.

character.39 현재 기준: 거리350 이하 근거리/350 초과 원거리. farAttackId 기본 사거리 참조 제거·고정longDistance350/farExclusive:true 사용. 같은 반경인 기준 원은 공통 renderer에서 한 번만 표시. 기본 고무탄 평타350→300ms.349/350/351 경계·캔버스 arc1개 실제 검사. 공통 유도 시야 판정으로 미탐지 은신 적은 벽 반사/연쇄 유도 대상에서 제외. 공개 적이 없으면 반사각 유지. 탐지된 적은 기존 시야 규칙 적용. 지오핀72 포함186 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증. 과거150/기본사거리 기준은 폐기.

character.40 현재 체력:1100. 기본/전이/과반동/정밀 등 모든 탄속은 character.39와 동일.

character.41 현재 탄속: 최근 사거리 상향 때 빨라진 기본/전이/과반동/정밀 고무탄의 탄속을 현재 값×0.93으로7% 감소. 기본39→36.27, 전이39.464285714285715→36.70178571428571, 과반동68.25→63.4725, 정밀72.85714285714286→67.75714285714285. 충격30/폭발27.5와 체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 데이터만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 무결성 검사. 실제 온라인 플레이 미검증.

character.42 현재 탄속: 기본/전이/과반동/정밀 고무탄 탄속을 character.41 현재 값에서 추가10% 감소(×0.9). 기본32.643, 전이33.03160714285714, 과반동57.12525, 정밀60.981428571428566. 첫7% 감소 전 대비 총16.3% 감소. 충격30/폭발27.5·체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 원본만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.

character.43 입력 수정: 지오핀 RMB의 holdGaugeTimerOnly:true 누락으로 startHoldGauge가 실패하여 press 즉시 일반 스킬로 빠지던 오류 수정. 공통 PointerHoldInputService.release는 마지막 update와 무관하게 실제 누른 시간도 확인.199ms 해제 이전 무기,200ms 이상 해제 기본 고무탄,누름/홀드 도중 미발동,강제 취소 미발동. 실제 Pointer press/release와 장착 결과 회귀 추가. 전체187그룹(지오핀73)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/WebRTC는 미검증. 이전 검사는 모듈 선택만 확인하여 입력 준비 실패를 놓쳤음.

character.44 설명: 지오핀 설명 간결화: 폐기된 벽튕 사거리80/60/40/20% 증가 문구 제거. 상황별3회는 발명 설명에서만 표기하고 개별 발명품의 반복3회/중복 저회/목록 우선순위 문구 제거. 조작 구분·조건·피해·전이 적중40% 사거리 증가 유지. 반격 설명에 주변 피해 명시. 게임 실행 데이터 변경 없음. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.

character.45 기본 평타: 지오핀 기본 고무탄 평타 피해200→150. Base Damage100은 유지하고 기본 AttackSpec damageRatio2→1.5만 수정. 발명품별 피해·탄속·사거리·체력1100 유지. 툴팁은 기존 damage 참조로150 표시. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.

character.46 탄속: 사용자 확인에 따라 사거리850인 전이/정밀 고무탄 탄속을 현재 값에서15% 감소(×0.85). 33.03160714285714→28.07686607142857, 60.981428571428566→51.83421428571428. 사거리850·피해 및 다른 무기 탄속 유지. 기존 delivery.projectile.speed 값만 변경. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.

character.47 변경: 지오핀 고무탄6종 벽 반사마다 현재 속력×0.8. projectile.redirect wallSpeedMultiplier0.8 범용 파라미터로 실제 vx/vy/baseSpeed 갱신, redirect snapshot 복원 시 baseSpeed도 수신 속력으로 동기화. 적중 연쇄 자체는 감속하지 않음. 지오핀200 피해 본체(충격/전이/정밀/폭발)와 폭발 후속을150으로 하향. 기본150·레이저150·주먹150·과반동250·반격250 유지. 충격 전달 벽 뒤300→250. 반 스패너 공격(lmb/rmb/counter) 후 기존 mode.toggle로 누적 회전 상태 갱신, 기존 ModeGearPresentationService.rotation을 스패너 renderer에 연결하여300ms에 한바퀴 회전. 파괴 상태는 숨김 유지. 모드 snapshot으로 상대 동일 시간축 회전. 새 모듈 없음. 전체189그룹(지오핀75)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/두 기기 실전 미검증.

character.48 연사: 지오핀 기본 및 발명품 평타9종(lmb,jump,wall,laser,chain,punch,recoil,sniper,bomb)의 AttackSpec.cd를350ms(0.35초)로 통일. 보조 폭발/벽뒤 공격과 스킬/반격은 제외. 기존 홀드 반복은 현재 장착 공격의 cd를 참조. 피해/탄속 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.

character.49 도약: 추진 도약기 이동거리180→360(100% 증가). 기존 movement.move distance 원본 수정, 이동시간200ms 유지하여 이동속력1800units/sec. 점프 궤적/피해/평타간격350ms 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.

character.50 예고 지역: 키 스킬/좌클 forecastExecute 및 스킬/우클 deceive는 예고 field를 clear하되500ms 보상 판정만 유지하는 기존 구조. 예고 지역에 reactiveEquipmentEntry:false를 지정하고 공통 ReactiveEquipmentService.field에서 해당 옵션 및 rewardOnly 상태를 제외. 예고 지역 최초 진입과 실행/취소 후 보상 잔류 모두 지오핀 장판 게이지 미누적. 일반 지속 적 장판 진입은 유지. 실제 사용자 온라인 증상 재현은 미확인, 실제 키 데이터/분류76회귀 및 전체190그룹·빌드/구문/docs/check/verify·ZIP 검사 통과. 새 모듈/캐릭터ID 예외 없음. 실제 온라인 미검증.

character.51 추진 가속기: 추진 도약기→추진 가속기. jump AttackSpec 내부 참조ID 유지, trajectory.arc 제거. 기존 movement.move 조준 방향 distance260/duration200ms와 delivery.area rect range200/halfWidth45/angleOffsetπ/wallPolicy:block 조합. 후방 공격 크기는 충격 전달 wallBurst와 같은200×90, 기본 피해150으로 설정. 즉시 후방 히트스캔과 전방 이동 발동, 기존 이동 중 비타격 무적/벽·적 통과/미표시 이동선 유지. 비용150·cd350ms. 새 모듈 없음. 실제 AreaAttackService 후방 적중/전방 제외 회귀 포함 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.

character.52 현재 조건/도약: 추진 가속기를 추진 도약기로 롤백: 리메이크 전 trajectory.arc 높이55·전방/목표점360·200ms·비타격 무적 이동 복구, 후방 히트스캔 제거. 발명 조건은 지속 장판 실제 피해3회. reactiveEquipment.fieldTrigger:damage로 공통 field 진입 누적 차단, InstalledAreaFieldService 실제 피해 impact에 fieldDuration 전달. ReactiveEquipmentService는 field-area/fieldDuration>0/amount>0/적대 출처를 확인하여 field 조건만 누적. 장판 진입·무적·저회·일회성/상태DOT 제외. 같은 장판 지속 피해도 실제 피해 사건별1회 누적. 키 예고 및 보상 잔류는 실제 피해가 없어 제외 유지. 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/온라인 미검증. 기존 공통 분류 파라미터 확장·새 모듈 없음.

character.53 도약: 추진 도약기 이동거리/AttackSpec.range360→220. 이동시간200ms·점프 궤적·지속 장판 실제 피해3회 발명 유지. 기존 movement.move distance 원본만 조정. 지오핀77 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.

character.54 무기한 장판: 뉴 마검 장판 duration:infinite가 Number 변환에서NaN→0이 되어 지오핀 지속 장판 판정에서 제외되던 원인 수정. InstalledAreaFieldService 피해 impact에 fieldPersistent boolean 전달(infinite 문자열/Infinity/무기한 endsAt 지원), 숫자 fieldDuration은 유한값만 전달. ReactiveEquipmentService는 양수 duration 또는 persistent 장판 실제 피해를 집계. 피해0/무적/저회 제외·진입 미누적 유지. 실제 뉴 데이터 기반 무기한 장판3회 제작 회귀 추가. 전체192그룹(지오핀78)·빌드/구문/docs/check/verify·ZIP 검사. 실제 온라인 플레이 미검증. 새 모듈/캐릭터ID 예외 없음.

character.55 벽튕: 지오핀 고무탄6종 벽 반사마다 현재 탄속35% 감소(×0.65)로 변경. 이전20%(×0.8) 대체. 기본 발사 탄속 및 적중 연쇄 자체 유지. 기존 projectile.redirect.wallSpeedMultiplier 원본 변경, 반복 반사와 원격 baseSpeed 복원 회귀 기대값 갱신. 지오핀78 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.

character.56 홀드: 지오핀 RMB 홀드 성공 해제 후500ms 최대 호/점선링 유지: 공통 PointerHoldInputService holdGaugeRetainMs 설정/잔류 렌더 지원. 기본 고무탄 상태는 holdTrigger state.mode-is invert 조건으로 홀드 차단. deferTapUntilRelease 및 cancelUnavailableHold로 홀드 준비 불가 시 누름 즉시 탭 실행 방지·길게 눌러도 탭으로 오발하지 않음. 짧은 이전무기 전환 유지. 설명 화살표 나열 대신 다른 캐릭터처럼 조건과 행동 문장으로 정리. 기존78지오핀 회귀 포함192·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.

## 기어 외형 — character.58
뒤 기어 돌출 톱니6개. 반경50·평소 알파0.2·무기 전환 시 한바퀴 회전 및 잠시 선명해지는 설정 유지.

character.60: 6톱니 전용 chamfered 외형·몸통0.78/내부 림0.68·8점 모따기 돌출부.

character.66: block 톱니/openRotor 전면 리디자인, 굵은6톱니/원형 림/열린3창·회전자3축. 이전 살/볼트 제거.

character.67: 짧고 두툼한6톱니·6살·원형 축으로 교체. 열린3창/육각 축 제거.

character.68: 66/67 기어 리디자인 롤백, character.60/65 chamfered6톱니·6살·6볼트·육각 축으로 정확히 복구.

character.69: 기존6톱니/6살/6볼트 외형 유지, 모따기/선 두께/내부 림/볼트 크기 세부 보정.

character.70: 6톱니 변경 전체 취소, character.57 배포16톱니 디자인으로 정확히 복구.

character.97: 고무탄6종 투사체 반경은15(기존18 대체).

## character.100 현재 계약
장판 대응 추진 도약기→과반동 발사기, 이동 정지 대응 기존 과반동→충격 도약기로 교체. 과반동 반동100→200/사거리650, 주먹 사거리200→240/피해150→250. 충격 도약기는 발동 위치 반경220에250피해 후 조준 반대 방향220/200ms 점프. 기존 delivery.area/trajectory.arc/movement.move 재사용. 저회 확정 이벤트에 justDodged 표식 전달하여 지속 장판 저회를 실제 피해0으로 제외하던 버그 수정. 일반 무적/일회성 장판 제외 유지. 투사체/범위/장판 실제 저회 이벤트·3회 발명 및 제자리 광역/후방 점프 각도 회귀 추가. 전체216회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 플레이 미검증.
발명 슬롯0(field)는 recoil/과반동, 슬롯5(restricted)는 jump/충격 도약. 기존 저장 진행도 stateKey는 슬롯별 유지하며 UI/디버그/평타 분기는 items.value와 기존 attackId를 공유.

## character.101 현재 계약
고회전 레이저→고회전 발사기: 일반 고무탄2발100ms 간격, 각150/사거리650/기본 탄속32.643/반경15/벽튕. 과반동 탄속32.643 통일. 충격 도약 피해 반경220→110(뒤 점프220 유지). 정밀 발사기/폭발형 발사기 이름 변경. 주먹→이중 충격기: 압력250/피해250/기존 넉백, 미적중 시 끝점에서400/150 고무탄 발사. 공통 progressive-rect damage.missAttackId와 delivery.projectile.origin point로 기존 TriggeredAttackService 및 패킷 재사용. 적중/방어 접촉/벽으로 차단된 원점/원격 중복 생성 제외. 저회 확정에서 ReactiveEquipmentService.justDodge 직접 호출·즉시 flush 및 cause.execution 공격/출처 복원·누락 impact는 실제 전달 모듈로 복원. 이전 늦은 이벤트 listener 제거. 기존 CC/트랩/상태DOT 제외 정책 유지. 전체220회귀·빌드/문서/구문 통과. 실제 브라우저/온라인 플레이 미검증.

## character.103 현재 계약
지오핀 고무탄8종의 벽 반사 탄속 배율0.65→0.5(튕길 때마다 현재 속도의50%). 공통 LMB 발명품 설명에서 기본 고무탄의150을 모든 무기의 피해처럼 표기하던 ({damage}) 제거. 무기별 WEAPON 피해 설명 유지. 지오핀86회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
