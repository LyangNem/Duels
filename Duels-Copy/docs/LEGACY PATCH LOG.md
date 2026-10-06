# 원본 HTML 주석 기록

원본 실제 HTML 주석을 순서대로 보존. 최신 규칙은 README.md를 우선한다.

3.1717 프릴/뉴/디라/시아넬리 후속 수정: 프릴 청소 채널은 외부 CC/강제이동으로 중단되지 않으며 followSourcePosition으로 채널 표시·완료 구역 기준점이 본체 이동을 추적한다. 뉴 atTarget 마검 적중은 피격자 권위가 duel-projectile-impact-confirmed를 전파하고 소유자/원격 모두 동일 좌표에서 beginLinger(target)로 전환해 적중 후 최대사거리 순간이동/관통 표시를 제거한다. effect-animation 피해는 실제 이펙트 중심을 AttackExecution impactOrigin/koOrigin으로 기록해 검 위치 충격파의 away-from-impact 넉백 방향을 일치시킨다. 디라의 폐기된 바닥 음식 픽업 attack/module/service/config를 완전 제거한다. 상호작용형 정지 투사체에 networkSync 옵션과 duel-state stationaryProjectiles 스냅샷을 추가해 시아넬리 비도 누락 시 동일 networkKey/위치/남은 수명으로 원격 화면을 자동 복원한다.

3.1717 타우 CRIT 피해 조정: LMB CRIT 피해를 450에서 550으로 상향. 일반 LMB 150 및 스파크 충전/소모/반격 연동은 유지.

3.1717 타우 크리티컬 복원: 이전 3스택 spark-scythe 구조와 LMB CRIT 분기를 복원. 일반 LMB는 baseDamage 200×0.75=150 피해, CRIT은 ×2.25=450 피해로 조정하고 기존 최대체력 비례 추가 피해는 복원하지 않았다. 일반 평타 적중마다 스파크 +1/최대3, 최대 시 LMB가 CRIT으로 전환되어 적중 시 스파크를 초기화하며 반격은 스파크를 최대 충전한다.

3.1717 티냐 반격 마법진 참조 변경: 반격 formation.manifest를 현재 배치(source:current)가 아니라 마지막 실제 발동 진형(source:last)으로 변경. CircleFormationService는 lastFormation 스냅샷을 반격 조준 위치에 복제하며, 기록이 아직 없을 때만 최소 마법진 1개로 fallback한다. 반격 자체는 storeLast:false라 마지막 일반 마법진 기록을 덮어쓰지 않는다.

3.1717 사이엔 홀드 기능 원복: 3.1717 (36).html의 홀드 도입 전 사이엔 블록을 그대로 복원. RMB는 즉시 패리, 격 최대 시 기존 alternate로 절격이 발동하며 0.3초 홀드/홀드 게이지/완료 미리보기는 사용하지 않는다. 이후 타 캐릭터 및 공통 수정은 유지.

3.1717 사이엔 절격 홀드 게이지 실제 렌더 색상 수정: PointerHoldInputService.drawHoldGauge의 흰색 하드코딩을 제거하고 진행 호/완충 호/완충 점멸링을 모두 사이엔 본색 #4f79aa로 통일. 기존 격 게이지와 동일 반경에서 후순위로 덮어쓰는 구조는 유지.

3.1717 사이엔 절격 홀드 게이지 색상 조정: 격 최대 상태에서 RMB 홀드 진행 호를 흰색이 아닌 사이엔 본색 #4f79aa로 변경. 기존 격 게이지와 동일 반경에서 그 위에 덮어쓰는 렌더 순서와 절격 가능 시에만 표시되는 조건은 유지.

3.1717 사이엔 절격 홀드 게이지 표시 수정: 절격 비활성 상태에서도 나오던 별도 ringPresentation 홀드 링을 제거하고, 실제 PointerHoldInputService의 holdGaugeRequireAvailable 조건만 사용한다. 홀드 게이지는 ProgressState 격 호를 그린 뒤 같은 chargeRadius에 순백색으로 마지막 덮어쓰기하여 격 최대 상태에서만 0→100% 진행이 확실히 보이도록 수정.

3.1717 사이엔 절격 홀드 게이지 흰색 표시: 홀드 진행 호를 순백색으로 고정하고 기존 격 게이지와 정확히 같은 반경/위치에 덮어 그리며, 빈 트랙 없이 0→100% 진행 부분만 표시한다.

3.1717 사이엔 절격 홀드 게이지 겹침 수정: RMB 절격 홀드 호를 격 게이지 바깥 별도 링이 아니라 정확히 동일한 chargeRadius에 후순위 렌더하고, 빈 트랙/완충 외곽 플래시를 제거해 기존 격 호 위에 진행된 사이엔색 호만 직접 겹쳐 표시한다.

3.1717 사이엔 절격 홀드 UX 수정: 격 최대 상태에서 RMB 홀드 중 기존 격 호게이지 바깥에 사이엔 기본색 0.3초 홀드 호게이지를 표시한다. 0.3초 완료 시 절격 공격 미리보기를 실시간 조준 방향으로 유지하고, 절격은 완료 순간이 아니라 RMB release에서 발동한다. 최대 격이 아니면 홀드 게이지/미리보기를 표시하지 않고 release 시 기존 패리만 발동한다.

3.1717 사이엔 RMB 입력 분리: RMB press에서는 패리를 즉시 발동하지 않고 release까지 보류한다. 0.3초 홀드 중 절격 조건이 실제 충족되어 절격이 실행된 경우에만 holdConsumed 처리하며, 그렇지 않으면 버튼을 놓는 순간 기존 RMB 패리가 발동한다.

3.1717 사이엔 방패 버전 정확 복원: /mnt/data/3.1717 (36).html의 마지막 RMB 방패 사이엔 블록을 그대로 복원해 조건형/체력1300/격8/우클릭 150ms 패리 및 패리 성공 격+1 구조를 되돌렸다. 단, 절격은 즉시 대체 발동하지 않고 격 최대치에서 RMB를 0.3초 홀드했을 때만 발동하도록 입력만 변경했다.

3.1717 사이엔 RMB 패리 복원/절격 홀드 입력: 평타 3연격의 attack.guard를 제거하고 기존 우클릭 패리 attack.cyien.rmb(150ms)를 다시 탭 입력에 연결. 패리 성공 격 충전은 제거 상태를 유지한다. 격 최대치(6) 도달 시 RMB 0.3초 홀드에서만 절격이 발동하도록 tapHoldSplit/holdTrigger를 구성. 체력 1100/반격형/절격 적중 +3 등 최근 수치는 유지.

3.1717 귀환 투사체 방어 회귀 수정: 온라인 비권위 화면의 attack.guard 접촉 경로가 귀환형 투사체까지 무조건 finish/remove하여 권위측 return 확정 전에 사라지던 문제를 수정. 귀환형은 방패/패리 접촉 위치에서 beginReturn으로 전환하고, duel-projectile-guard-resolved의 return 수신 시 impactPoint를 적용한 뒤 귀환해 모든 화면의 시작점을 통일한다. 일반 투사체의 기존 제거 규칙은 유지.

3.1717 사이엔 분류 변경: 전투 스타일을 조건형(style 5)에서 반격형(style 6)으로 변경. 역할군/스킬/수치는 유지.

3.1717 사이엔 체력 조정: 최대 체력을 1300에서 1100으로 감소. 기타 전투 수치/스킬은 변경하지 않음.

3.1717 사이엔 격/패리 재조정: 평타 패리는 유지하되 attack.guard onBlock의 격 충전을 제거해 패리 성공으로는 격 게이지가 오르지 않도록 했다. 격 최대치를 10→6으로 낮추고 절격 발동 조건은 기존 killRewardProgress.max 참조를 유지한다. 절격 적중 50% 충전 규칙에 맞춰 적중 충전량을 +5→+3으로 조정했다.

3.1717 반 RMB 스테미나 조정: 거대한 스패너 투척 스테미나 소모량을 300에서 400으로 조정.

3.1717 사이엔 절격 적중 충전 조정: 절격 적중 시 격 충전량을 최대 10의 50%인 +5로 변경. 처치 시 최대 충전 규칙은 유지.

3.1717 사이엔 절격/패리 조정: 격 최대치를 8→10으로 상향하고 절격 RMB 발동 조건도 killRewardProgress.max를 직접 참조하도록 통일. 평타 1·2·3타의 attack.guard 패리 지속시간과 연동 visualState를 150ms→75ms로 단축.

3.1717 온라인 이동기 경로 FX/타격 복구: requireMovementExecution 이동 공격의 원격 처리가 소유자가 보낸 충돌 반영 완료 remotePathTimeline을 다시 원격 Entity 보간 이동거리로 축소해, 패킷 순서에 따라 distance가 0에 가까워지며 상대 화면 사각 경로 FX와 대상 권위 body-contact 피해가 함께 누락되던 문제를 수정. 원격은 effect-spawn에 포함된 start/angle/distance/duration/easing 타임라인을 그대로 진행해 시각과 타격을 동일 구간에서 처리하고, 로컬은 기존 실제 Entity 이동 선분 기반 판정을 유지한다.

3.1717 디라 식재료 획득 대상 수정: 프라이팬 적중 식재료 획득은 player와 dummy 대상에 적용하고 summon/trainingBot은 제외한다. 획득량과 설명은 cooking 설정의 단일 원본을 참조한다.

3.1717 티냐/디라 수정: 티냐 일반 마법진 LMB의 무력화 넉백을 일반 movement.knockback(84/10, 티냐에게서 멀어지는 방향)으로 변경하고 반격 무력화는 유지. 디라 식재료의 별도 range-projectile 프레젠테이션을 제거해 공통 일반 투사체 기본 렌더를 사용하도록 복구.

3.1717 레테 평타 유도 조정: LMB 유도 회전량을 0.025→0.04로 높이고 preserveTurnRadius를 제거해 탄속 변화와 무관하게 동일한 프레임당 유도 강도를 유지한다.

3.1717 사이엔 격 최대치 참조 안정화: 평타에 패리를 추가하면서 modules 배열 순서가 바뀌어 attacks.lmb.modules.1.max가 attack.guard를 가리키며 시작 시 참조 오류가 발생하던 문제를 수정. 모든 격 최대치 참조를 모듈 인덱스가 아닌 killRewardProgress.max로 통일해 이후 모듈 순서 변경에도 깨지지 않게 했다.

3.1717 디라 자가 음식 투척 모션: 자기 자신을 음식 대상으로 지정하면 즉시 충돌하지 않고 음식 투사체를 약 0.52초 동안 머리 위로 포물선처럼 던졌다가 다시 받아먹는다. 내려오는 순간 기존 음식 회복/원형 수령 이펙트를 적용한다. 타 아군 대상 음식 유도 투척은 기존 동작 유지.

3.1717 디라 음식/스토브 후속 수정: 음식 적중 시 엔소냐/큐리 계열의 짧은 areaCircle 펄스를 대상 위치에 1회 생성한다. 음식 투사체 최소 반경을 프라이팬 시각 크기와 같은 18px로 상향한다. 식재료의 만석 스토브 관통이 예측 충돌에만 적용되고 실제 ProjectileService 프레임 충돌 루프에는 누락된 원인을 수정해, 자기 스토브가 최대치면 실제 접촉 검사에서도 완전히 건너뛰어 투사체가 소모되지 않고 그대로 통과한다.

3.1717 디라 음식 대상/식재료 판정 수정: 음식 보유 중 자기 자신을 포함한 모든 아군 플레이어 주변에 mealTargetSelectionRadius 기준 점선 원을 표시하고, 원 안 클릭 시에만 해당 대상에게 음식을 유도 투척한다. 자기 자신도 self 관계로 음식 대상/회복 대상에 포함. 식재료 투사체 표시는 weapon-projectile에서 일반 range-projectile로 변경. cooking.stove-input 투사체는 자기 스토브가 최대치일 때 타깃 충돌 판정 단계에서 스토브를 완전히 무시해 소모 없이 관통한다.

3.1717 디라 음식/스토브/LMB 후속 수정: 스토브 회수 시 음식은 즉시 보유되지 않고 스토브 위치에서 디라에게 weapon-projectile로 날아와 도착 후 획득. 음식 보유 호게이지는 완충 상태+공통 점선링으로 표시. 음식 투척도 weapon-projectile로 표시하고 착탄 후 5초 동안 같은 무기 투사체를 남김. 음식 식재료 수에 따라 투사체 크기와 픽업 장판 반경이 증가. 일반 탭 LMB는 프라이팬을 발사하지 않으며 0.3초 홀드만 프라이팬 발사, 식재료 보유 중에도 홀드 가능. 스토브 10개 완충 시 식재료 투사체가 스토브와 충돌하지 않아 소모되지 않음. 식재료 연사 간격 0.2초.

3.1717 디라 순서/스토브/LMB 입력 수정: 출시 순서를 샤베트 뒤로 이동. 스토브 투입 한도를 10개로 분리하고 음식 재료 수 동기화도 10까지 지원. 식재료/음식이 없을 때 LMB를 0.3초 홀드하면 프라이팬을 투척하며, 식재료/음식 LMB는 기존 탭 사용 유지. 툴팁 키 표기를 LMB FOOD, RMB/RMB로 정리.

3.1717 차징 시작 자연 체력 회복 유지: 표준 ChargedAttackService의 charge.attack.start와 MultiClickAttackService의 차징 입력 자체는 NaturalHealthRegenActivityService를 갱신하지 않도록 변경했다. 차징 시작/누적만으로 자연 체력 회복 대기시간이 초기화되지 않으며, 실제 공격이 발동하는 release/fireOnMax 경로는 기존 AttackService 실행을 통해 자연 회복을 정상 중단한다. input.drag-path 차징은 원래 시작 시 자연 회복을 갱신하지 않아 변경하지 않았다.

3.1717 스야 은신 버프 취소: 직전 밸런스 조정에서 100/s로 낮췄던 서리안개 은신 지속 스테미나 소모량을 기존 150/s로 복구한다. 최대 4초 기준 시작비용 400 + 지속소모 600 = 총 최대 1000 스테미나로 되돌린다.

3.1717 레이카/반 조정: 레이카의 damage-dealt 태양의 가호 충전 비율을 실제 체력 피해의 6%로 상향. 반 거대한 스패너 ALWAYS 설명에 내구도가 파괴되지 않은 동안 천천히 회복된다는 문구를 추가했다.

3.1717 밸런스/설명 검수: Van 비파괴 스패너 자연회복 25/s, 메인마드 반격 기절 1초, 에라 파비 LMB 비용 250, 페이즈 LMB 사거리 +35%(210.6), 스야 은신 지속 소모 100/s(최대 총비용 800), 레이즈 LMB 최대 피해 800, 나레 반격 탄당 피해 100, 가에 냉각 40%로 조정. CharacterDescriptionService는 참조가 없는 시간/비율 값을 0초·0%로 위조하지 않고 unresolved로 처리해 잘못된 수치 문구를 제거한다.

3.1717 Van 스패너 수리/자연회복 조정: 파괴된 스패너의 완전 수리 진행시간을 3.5초에서 4.5초로 늘린다. 스패너 내구도가 0보다 크고 최대치보다 낮은 동안에는 행동/피격 여부와 무관하게 초당 50씩 자연 회복하며, 내구도 0 상태에서는 자연회복 대신 기존 파괴 수리 타이머만 사용한다.

3.1717 진행형 공격 Van 내구도 중복타격 수정: progressRect/arcSweep/expanding-ring 등 effect-animation 기반 진행형 공격이 Van 스패너에 100% 흡수되어 durabilityBlocked(hit:false)가 되면 execution.hitTargets에 기록되지 않아 같은 이펙트의 다음 프레임이 동일 대상을 다시 타격하던 공통 버그를 수정했다. 완전 흡수 접촉도 effect damage의 oncePerExecution 기본 규칙에 따라 실행 내 1회 접촉으로 소비하되 onHit/CC/상태는 계속 차단한다. 샤베트 빙결 평타/분쇄가 스패너를 여러 프레임 연속 깎아 조건부 추가피해처럼 보이던 현상을 제거한다.

3.1717 샤베트 분쇄 빙결 대상 피해 하향: 일반 피해 100은 유지하고 빙결 상태 적 대상 배율을 5배에서 4배로 낮춰 조건부 피해를 500→400으로 조정했으며 툴팁 표기도 100/400으로 동기화한다.

3.1717 샤베트 조건부 피해 설명 보강: 과냉각은 일반/정확입력 피해를 100/200으로, 분쇄는 일반/빙결 대상 피해를 100/500으로 툴팁에 함께 표기해 조건부 증가 피해량이 바로 보이도록 수정한다.

3.1717 레이카 일반 RMB 선딜 미리보기 복구: rmb-push의 실제 300ms 선딜을 delivery.area.delay로 처리하는 현재 구조에서 ability modules의 preview.remove가 preview.create 직후 같은 프레임에 실행되어 미리보기를 즉시 지우고 있었다. 해당 즉시 제거 모듈을 삭제해 preview.create의 duration 300ms가 실제 선딜 동안 유지되도록 복구한다.

3.1717 인투 반격 저격탄 온라인 판정 정렬: 매우 빠른 관통 탄환에 원격 생성 지연 보정(최대 4.5프레임)을 한 번에 적용하면, 피격자 권위 화면에서 긴 과거 이동 선분을 현재 대상 위치와 swept 충돌 검사해 화면상 빗나간 탄이 맞거나 실제로 스친 탄이 빗나가는 체감이 발생할 수 있었다. delivery.projectile에 networkSpawnCompensation opt-out을 추가하고 인투 반격 저격탄에만 비활성화해 피격자 화면에서 실제 보이는 현재 프레임 궤적과 충돌 판정을 일치시킨다. 다른 투사체의 기존 지연 보정은 유지한다.

3.1717 샤베트 밸런스 조정: LMB 선딜 비용 150, 일반 평타 100 피해, 정확 과냉각 평타 200 피해, RMB 분쇄 비용 300/기본 100 피해/빙결 대상 500 피해, 반격 냉기 100 피해. 과냉각 성공 입력 구간을 250~300ms로 확대하고 호 게이지의 성공 가능 색상 구간도 동일하게 맞췄다.

3.1717 샤베트 평타 스테미나 비용 수정: 과냉각 첫 LMB 선딜 시작 비용을 150→200으로 조정하고, 실제 피해 AttackSpec(lmb)의 cost 0을 설명기가 잘못 읽어 스테미나 0으로 표시하던 문제를 tooltip costText 스테미나 200으로 명시해 실제 소비량과 표시를 일치시킨다.

3.1717 샤베트 반격 설명/탄속 조정: 냉기 반격 툴팁에 실제 피해량 참조 {damage}를 추가하고, 반격 투사체 속도를 20에서 16으로 20% 감소시켰다. 피해량/빙결/탄 수/중복 적중 방지는 변경하지 않는다.

3.1717 progressRect 벽 클리핑 탄속 보존: clipToAttackArea로 벽까지의 실제 range가 짧아질 때 range만 축소하고 duration을 유지해 진행형 공격이 벽 앞에서 느려 보이던 문제를 수정했다. 원래 range/duration 비율을 유지하도록 clippedRange/originalRange 비율만큼 duration도 함께 줄여 벽 유무와 관계없이 동일한 시각 진행속도를 유지한다.

3.1717 샤베트 진행형 냉기 벽 클리핑 수정: LMB 일반/과냉각 및 RMB 분쇄의 progressRect effect.spawn에 clipToAttackArea:true를 적용해 내부 progressive-rect delivery.area의 wallPolicy:block geometry를 그대로 사용한다. 실제 피해는 기존 벽 차단을 유지하고, 시각 냉기 역시 벽 위치에서 잘려 더 이상 벽 너머로 진행하지 않는다.

3.1717 샤베트 분쇄 사거리/탄속 조정: RMB 분쇄의 사거리를 400→500, 진행형 냉기 travelSpeed를 3000→4500으로 상향하고 progressive-rect 실제 피해 모듈도 AttackSpec의 range/halfWidth 단일 값을 참조하도록 통일했다.

3.1717 샤베트 평타/스킬 진행형 냉기 변경: 일반/과냉각 LMB와 RMB 분쇄를 다즈빈 반격의 progressRect + progressive-rect 피해 구조로 변경해 시전자 앞에서 실제로 전진하는 냉기 공격으로 만든다. 다즈빈 반격 travelSpeed 1800보다 빠른 3000을 사용하며, LMB 선딜/정확입력/빙결과 RMB 빙결 대상 2배 피해+강제해제 규칙은 유지한다. 반격기는 변경하지 않는다.

3.1717 샤베트 분쇄 FX 단일화: 분쇄가 항상 기본색 after-attack FX를 생성한 뒤 빙결 적중 시 하늘색 on-hit FX를 추가로 생성하던 구조를 제거했다. 분쇄 FX는 적중 시 1회만 생성하며, 타격 직전 대상이 빙결이면 하늘색 #7aeeff, 아니면 샤베트 기본색을 사용한다. 동일 execution의 두 색 FX는 공통 oncePerExecution 키로 상호 배타적으로 1개만 생성된다.

3.1717 샤베트 하늘색 피드백/분쇄 비용 조정: 과냉각 성공 가능 구간 및 성공 잔류 호 게이지 색을 진한 주황에서 로온 계열 하늘색 #7aeeff로 변경. 과냉각 성공 평타의 직사각형 공격 FX도 같은 하늘색을 사용한다. 분쇄는 일반 대상에는 기존 샤베트색 FX를 유지하되 타격 직전 빙결 상태인 적에게 적중하면 동일 공격 영역의 하늘색 FX를 on-hit로 덮어 표시한다. 분쇄 스테미나 비용은 400→300으로 조정.

3.1717 샤베트 과냉각 온라인 확정/밸런스 조정: state.window 선택 입력의 선택 data를 duel-action에 명시적으로 실어 원격 복제본의 retained timed state에 즉시 병합하고, 선딜 resolve는 선딜레이 태그 공격에 한해 원격 자체 타이머 실행 대신 기존 duel-windup-commit을 기다리도록 통일했다. 따라서 소유자 화면에서 성공 주황 잔류 호가 떴다면 대상 권위 화면도 동일 success 선택으로 0.5초 빙결 평타를 확정한다. 샤베트 LMB 사거리 210→294(+40%), 성공 입력 구간 260~300ms, RMB 분쇄 기본 피해 200/빙결 대상 400으로 조정.

3.1717 샤베트 과냉각 선딜 표시/조준 수정: LMB 300ms state.window에 실제 일반/성공 평타 AttackSpec을 가리키는 previewAttackIds를 연결해 선딜 동안 기존 AttackPreviewService 직사각형 미리보기가 표시되게 하고, resolveAimMode live-source를 적용해 선딜 중 마우스 방향 변경이 미리보기와 300ms 종료 실제 평타 판정에 함께 반영된다. 과냉각 성공 가능 구간 및 성공 잔류 호 게이지의 밝은 색은 진한 주황 #d96b00으로 변경했다.

3.1717 샤베트 반격 빙결 중복 근본 수정/분쇄 사거리 조정: 냉기 반격은 counter.execute.cc가 이미 실제 AttackExecution의 extraModules로 status.apply(freeze)를 주입하는데 AttackSpec에도 동일 freeze 모듈이 있어 한 대상에게 빙결 상태가 2개 생성되고 해제 fallback 피해도 2회 발생했다. AttackSpec의 중복 status.apply를 제거하고 counter.execute.cc 한 경로만 사용한다. 13발 특수 투사체와 hit.once-per-execution은 유지되어 한 실행에서 대상당 피해/빙결은 1회만 적용된다. 분쇄 사거리는 650→400으로 축소한다.

3.1717 샤베트 평타/분쇄/반격 재수정: LMB는 입력 즉시 피해를 내지 않고 attack.sherbet.lmb-windup이 300ms timed-action 선딜을 연 뒤 종료 시 일반/정확입력 평타를 자동 확정한다. 270~300ms 재입력은 state 선택만 수행해 종료 평타에 0.5초 빙결을 붙이며, 그 외 재입력은 공격을 추가 생성하지 않는다. 호 게이지는 timed-action-progress 공용 gauge.arc를 사용해 300ms 진행 및 완료 후 500ms maxChargeFlash를 표시한다. RMB 분쇄는 레이저 표현을 제거하고 평타와 같은 직사각형 effectShape를 사거리만 길게 사용한다. 반격 냉기는 13발 특수 투사체, damageRatio 1, hit.once-per-execution으로 대상당 1회만 피해/빙결을 적용한다.

3.1717 샤베트 후속 수정: 과냉각은 최초 LMB 적중 대상을 0.4초 타이밍 상태에 저장하고 0.37~0.4초 재입력 시 두 번째 평타 없이 해당 대상만 0.5초 빙결한다. 최초 적중 대상과 샤베트는 0.3초간 양 화면에 점선으로 연결된다. 호 게이지는 성공 가능 구간/성공 잔류 시 연한 색, 실패 잔류 시 기본색을 사용하고 공용 최대충전 점선링을 표시한다. LMB 판정을 직사각형으로 변경. 냉기 반격은 델트루브식 평행 5발 구조에서 effectsOnly 투사체의 applyHitEffects를 활성화하고 폭을 확대해 실제 빙결 적중을 복구한다. 분쇄 문구를 냉기로 교정하고 빙결 강제해제도 공통 freeze release 1회 보장 피해를 실행한다.

3.1717 샤베트 타이밍/반격 수정: 과냉각 후속타는 단순 state.exists가 아니라 최초 타격 후 270~300ms 구간에서만 재입력 성공하도록 timed-action elapsed 조건을 사용한다. 호 게이지는 0.3초 동안 진행되고 성공 가능 270~300ms 구간 및 성공 후 0.5초 유지 구간에는 연한 색으로 표시하며, 미입력 실패 시 기본색 완충 게이지가 0.5초 남았다가 사라진다. 반격 냉기는 델트루브 반격과 같은 평행 5발 volley 구조로 변경하고 좌우 폭과 사거리를 확대했다.

3.1717 신규 캐릭터 샤베트: 조건형 근거리 컨트롤러. 체력 1300/보통 이동속도/연한 노랑. LMB 과냉각은 최초 타격 후 0.3초 타이머를 열고 기본 쿨다운 270ms와 결합해 정확히 0.27~0.3초 재입력에서만 전방 적을 빙결한다. RMB 분쇄는 얼음 파편 투사체로 일반 피해를 주고 타격 직전 빙결 상태인 대상에게 피해 배율을 적용한 뒤 빙결을 강제 해제한다. 이 강제 해제는 빙결 자체의 종료 보정 피해를 추가하지 않는다. 반격 냉기는 전방 투사체 적중 대상을 빙결한다. 공통 모듈 damage.target-status-multiplier/status.clear를 추가해 캐릭터 ID 분기 없이 구현한다.

3.1717 적 충돌 정지 돌진 오버슈트 보정: movement.move에서 collision.passEnemies:false를 명시한 돌진은 적 충돌점에 정확히 멈추지 않고 최대 24px를 추가로 진행한 뒤 종료한다. 추가 이동 구간도 실제 MovementAbilityService 경로 피해 판정에 포함되므로 충돌점에서 이동이 먼저 종료되어 body-contact 피해가 누락되던 경우를 줄인다. 벽/장판 경계 충돌은 기존대로 우선하며, passEnemies:true 이동과 collision 설정을 생략한 일반 이동기는 변경하지 않는다.

3.1717 Van 내구도 피해 숫자 표시: 거대한 스패너가 피해를 전부 흡수해 체력 피해가 0인 경우에도 실제 감소한 내구도량을 기존 피해 숫자(dmgNum) 경로로 표시한다. 피격자 권위 화면에서는 DamagePipeline에서 즉시 표시하고, 온라인 공격자/제3자 화면은 duel-hit-confirmed의 displayAmount에 durabilityDamage를 전달해 동일 수치를 표시한다. 체력 피해/온힛/CC 차단 규칙은 변경하지 않는다.

3.1717 레이카 기본 RMB 타격 경로 단순화: 일반 상태 태양 밀어내기의 300ms 선딜을 Ability timing.delay 뒤 action.attack 구조에서 attack.reika.rmb-push의 delivery.area.delay로 이동했다. 입력 시 AttackExecution을 즉시 생성해 로컬/원격이 동일 executionSequence를 공유한 뒤 300ms 후 범위 판정을 확정한다. 기존 선딜레이 태그를 유지해 강제이동 시 예약 판정이 취소되며, annularDoubleSweep 연출도 같은 300ms delay로 판정 시점과 맞춘다.

3.1717 지연 Ability 온라인 선딜 확정 키 수정: timing.delay로 deferredExecution 상태에서 duel-action을 먼저 전송할 때 abilityUseId를 버리던 공통 버그를 수정했다. 기존에는 로컬 duel-windup-commit의 ability:<abilityUseId>:N 키와 원격에서 새로 생성된 abilityUseId가 달라 원격 continuation이 영원히 확정되지 않을 수 있었으며, 레이카 기본 RMB처럼 ability-level timing.delay 뒤에 실제 공격이 있는 스킬이 상대 권위 화면에서 피해를 못 주는 원인이었다. deferred 전송에도 원래 abilityUseId/skipAttackWindup을 보존해 로컬/원격 continuation 키를 동일하게 유지한다.

3.1717 범위 근접 타격 판정 근본 수정: 프릴 LMB/레이카 기본 근접 범위 공격이 실제 범위 안의 적을 놓치던 문제를 wall-clipped polygon 단일 판정에서 분리했다. circle/sector는 먼저 벽을 무시한 원래 공격 geometry와 대상 충돌원의 교차를 판정하고, wallPolicy:block일 때 대상 중심/최근접 접촉점/원주 샘플 중 실제 벽에 가리지 않은 점이 하나라도 있을 때 적중으로 확정한다. 또한 온라인 원격 melee delivery.area는 개별 옵션 유무와 관계없이 보간 표시좌표가 아닌 네트워크 충돌좌표를 기본 판정 원점으로 사용한다.

3.1717 범위 근접 공격 벽 교차 판정 공통 수정: delivery.area의 wallPolicy:'block' sector/circle/centered rect는 이미 최종 공격 geometry를 벽까지 잘라 생성하는데 containsPoint에서 대상 중심점까지 segmentBlocked를 다시 검사해 대상 충돌원이 유효 polygon에 걸쳐 있어도 중심이 벽/모서리 뒤면 적중을 통째로 취소하고 있었다. 중복 중심 LOS 검사를 제거하고 대상 원과 최종 wall-clipped geometry의 실제 교차를 단일 판정으로 사용한다. 프릴 LMB/레이카 일반 근접 범위 공격을 포함한 같은 구조의 범위공격에 공통 적용한다.

3.1717 Van 추가 내구도 바 CC 라벨 정렬: 체력바 위에 스패너 내구도 바를 추가하면서 이름만 7px 위로 이동했던 상태를 보정해, Van의 CC 상태 텍스트도 동일하게 7px 위로 이동시켜 이름/상태 표시의 기존 세로 간격을 유지한다. 다른 캐릭터의 CC 위치는 변경하지 않는다.

3.1717 Van 월드 내구도 바 분리: 캐릭터 상단 체력바를 좌우 분할하던 표시를 제거하고, 기존 체력바 전체 너비는 그대로 유지한 채 동일 규격의 스패너 내구도 바를 바로 위에 별도 한 줄로 표시한다. 체력/내구도 각각 기존 WorldHealthBarSegmentPresentationService의 300 단위 눈금을 사용하며 이름 표시는 추가 바와 겹치지 않게 위로 이동한다.

3.1717 Van 월드 내구도 바 통합: 캐릭터 머리 위 기존 체력바를 Van에 한해 좌측 체력/우측 스패너 내구도 1:1 폭으로 분할한다. 두 자원 사이에는 별도 구분선을 그리지 않고, 눈금은 체력/내구도 각각 따로 계산하지 않고 두 최대치를 합친 전체 바 하나에 기존 300 단위 규칙을 한 번만 적용한다. 보호막/자연회복 표시는 체력 절반에만 적용한다.

3.1717 반 스패너 파괴/복구 FX 가시성 수정: areaCircle 렌더가 maxR을 사용하지 않아 기존 효과가 캐릭터 반경 수준으로만 그려져 거의 보이지 않던 문제를 수정. 파괴/복구 시 실제 r/range를 충분한 고정 반경으로 지정하고 밝은 외곽선·짧은 펄스를 적용했다. 존재하지 않는 sendEffect 호출 대신 기존 duel-presentation effect-spawn 동기화 경로를 사용해 상대 화면에도 동일 효과를 표시한다.

3.1717 Van 스패너 파괴 FX: 내구도가 0으로 처음 떨어지는 순간에만 캐릭터 중심에서 작고 옅은 연두색 확장 원 이펙트를 1회 생성한다. 대상 권위 화면에서 생성 후 기존 effect-spawn 동기화로 상대 화면에도 동일 표시하며 수리/피해 판정은 변경하지 않는다.

3.1717 Van 스패너 장판 효과 관통 수정: damageAbsorbProgress가 피해를 100% 흡수해도 impact.type==='field-area'인 설치형 범위 공격은 완전 적중 차단으로 반환하지 않는다. 피해는 스패너 내구도가 그대로 흡수하지만 field.area의 onHit 효과/CC/상태는 정상 적용되어 샤이라즈 덫 같은 장판 효과를 스패너가 무효화하지 않는다. 일반 공격/투사체의 완전 흡수 규칙은 유지한다.

3.1717 target-point 이동 사거리 제한 복구: movement.move가 direction:'target-point'와 finite distance를 함께 가져도 런타임 targetPoint까지의 실제 거리로 distance를 덮어써 레이즈/페이즈 등 점프가 설정 사거리를 초과하던 공통 버그 수정. finite module.distance를 최대 이동거리로 공통 clamp하고 실제 targetX/Y도 같은 끝점으로 보정한다. distance가 없는 target-point 이동은 기존 동작 유지.

3.1717 펠루나 평타/지연 선딜 네트워크 공통 수정: 강화 1단계 이상 평타에 잘못 재추가된 300ms delivery.area delay/선딜레이 태그를 제거해 기존 설계(1단계 선딜 제거, 2단계 내부 범위 피해, 3단계 피해 증가)를 복구한다. 온라인 지연 선딜의 duel-windup-commit이 원격 action보다 먼저 도착하면 commit이 유실되어 대상 권위에서 delayed delivery.area가 영원히 실행되지 않던 공통 패킷 순서 경쟁을 수정했다. AttackWindupService가 미등록 commit을 source별 pending set에 보관하고 continuation 등록 시 즉시 소비하며, 강제이동 interrupt에서는 pending commit도 함께 정리한다.

3.1717 티냐 마법진 피해배율/Van 스패너 포인트선 보정: CircleFormationService의 발현 피해가 amountOverride를 사용하면서 DamagePipeline의 일반 sourceStats.damageMult 적용을 우회하던 문제를 수정했다. 티냐 LMB/반격/원격 발현이 공유하는 applyManifestDamage에서 일반 공격과 동일한 공격자 damageMult를 포함해 유리대포 등 damage modifier가 정상 반영된다. Van 월드 스패너의 밝은 양옆 선은 임의 안쪽 오프셋이 아니라 실제 손잡이 폭과 선 두께를 기준으로 가장자리 안쪽 위치를 계산해 정렬한다.

3.1717 Van 월드 스패너 전면 재설계: 기존 렌더 도형을 폐기하고 두꺼운 C자형 오픈엔드 헤드, 굵은 목/손잡이, 끝 원형 홀 중심의 새 캔버스 실루엣으로 처음부터 다시 구성했다. 캐릭터 지름 약 3배와 좌상단 머리 방향은 유지하며 장식은 최소화했다.

3.1717 프릴 LMB 이펙트 중복/Van 스패너 실루엣 수정: 프릴 LMB 3종은 전용 effect.spawn 시각 효과를 이미 사용하므로 delivery.area 자동 프레젠테이션을 비활성화해 공격 이펙트가 겹쳐 생성되지 않게 한다. 판정/피해는 유지한다. Van 월드 스패너는 장식보다 형태감을 우선해 굵은 손잡이·넓은 목·두꺼운 C자 오픈엔드 헤드로 다시 그리며 기존 3배 크기/좌상단 머리 방향은 유지한다.

3.1717 Van HUD/적중 조건/프릴/스패너 표현 수정: Van은 좌·우 하단 전투 HUD에서 기존 체력바 옆에 800 내구도 스패너 바를 한 줄로 표시하며 원격 Van에도 동일 적용한다. 스패너가 피해를 100% 흡수한 durabilityBlocked 확정은 공격자 화면의 source on-hit 모듈과 damage-dealt 증강을 재생하지 않아 메라 모나 등 실제 적중 조건 능력이 발동하지 않는다(크리티컬 공격 선택/판정 경로는 변경하지 않음). delivery.area useNetworkCollisionOrigin은 원격 source에만 적용해 프릴 LMB의 로컬 판정 원점이 실제 본체와 어긋나는 문제를 수정한다. Van 월드 스패너는 캐릭터 지름의 약 3배 크기이며 본체 회전과 분리해 머리가 항상 좌상단을 향한다.

3.1717 Van 내구도/누적 수리 조정: 스패너 내구도 800, 수리 누적시간 8초. 이동 제외 행동/피격 시 수리 진행도는 초기화하지 않고 정지하며, 방해 종료 0.5초 뒤부터 기존 진행도에서 재개한다. 툴팁의 공격 막아냄 표현을 공격 방어로 변경.

3.1717 Van 스패너 피격 피드백/월드 아이콘 추가: 거대한 스패너가 피해를 100% 흡수하더라도 체력 피해·CC·온힛은 계속 차단한 채 일반 적중과 같은 캐릭터 스쿼시, 히트 링, 피격음, 공격자/피격자 화면 흔들림, FOV 반응, 피격 플래시를 재생한다. 확정 패킷에 durability feedback amount를 포함해 공격자/제3자 화면에도 동일 피드백을 재생한다. Van은 van-wrench-durability가 1 이상일 때 본체 뒤 레이어에 직접 그린 렌치 실루엣 아이콘을 항상 표시하며 ProgressState 원격 동기화를 그대로 사용해 상대 화면에도 표시한다.

3.1717 Van 특수 투사체 내구도 중복 차감 수정: hit.once-per-execution 공격이 거대한 스패너에 100% 흡수되어 durabilityBlocked(hit:false)가 되더라도 해당 AttackExecution의 대상 적중 기록을 남긴다. 따라서 같은 특수 투사체 묶음의 후속 탄이 반의 내구도를 반복 차감하지 않으며, hit.once-per-execution이 없는 일반 다탄 공격은 기존대로 각 탄이 개별 피해를 준다.

3.1717 Van 회피 수리 중단 수정: 성공한 EntityDodgeService.activate도 lastAbilityActionTime을 갱신해, 이동은 허용하되 회피 사용 시 Van의 수리 대기/진행이 즉시 초기화되도록 수정.

3.1717 Van 내구도 적중음 동기화: 거대한 스패너가 피해를 전부 흡수해 체력 피해가 0이어도 대상 권위 클라이언트가 durabilityBlocked 적중 확인 패킷을 공격자에게 전송한다. 공격자 화면은 피해 숫자/체력 피해/on-hit 효과 없이 기존 공통 hit 사운드만 재생한다.

3.1717 Van 수리/기절 조정: RMB 초거대 스패너 투척과 L-Shift 반격의 기절 시간을 모두 0.8초로 통일했다. 성공한 능력 행동(input press/hold/release)의 시각을 lastAbilityActionTime으로 공통 기록하고, Van 수리는 이동 입력만으로는 끊기지 않되 공격/스킬/반격/차징 등 능력 행동 또는 피격이 발생하면 수리 진행도를 즉시 0으로 초기화한다. 마지막 방해 이후 0.5초 대기한 뒤에만 3초 수리 게이지가 새로 진행되어 총 3.5초 연속 비행동 상태에서 내구도를 최대치로 완전 수리한다.

3.1717 Van 내구도 수리 조건 수정: 파괴 상태 LMB의 귀환/회수/20% 회복 기믹을 제거하고 그 용도로 추가했던 projectile.return 확장(returnOnHit/targetMode/sourceCatch)도 기존 구현으로 원복했다. Van은 공격하거나 피해를 입지 않은 상태를 3초 연속 유지하면 내구도를 최대치로 한 번에 수리한다. 이동 여부는 조건에 포함하지 않는다. 수리 진행은 van-wrench-repair-progress를 기존 ProgressStateService + gauge.arc로 표시하며 lastAttackTime/lastDamageTime에서 직접 계산한다. 스패너가 피해 100%를 대신 받아 적중효과를 막아도 일반 피격음은 재생하고 lastDamageTime을 갱신해 3초 수리 조건을 끊는다.

3.1717 범위 투사체 렌더 회귀 수정: 직전 수정에서 태그를 건드린 것은 원인 오판이어서 원복했다. 실제 원인은 현재 3.1717의 projectile draw 경로에서 원본 3.1719에 존재하던 style.kind==='range-projectile' 전용 이중 원형 렌더 분기가 통째로 빠져 있던 것이다. 그 결과 delivery.range-projectile 공격들도 projectile.presentation kind:'range-projectile' 데이터를 가지고 있으면서 렌더 단계에서는 일반 원형 투사체 fallback으로 떨어지고 있었다. 원본 3.1719의 range-projectile 전용 렌더러를 그대로 복구해 외곽 원 + 내부 원의 기존 표현을 다시 사용한다. 셸로 LMB뿐 아니라 다즈빈 RMB, 루네프 반격, 셸로 일반/패리 반격, 나레 RMB, 델트루브 RMB 등 기존 모든 range-projectile에 공통 적용된다.

3.1717 Cyien 패리 비투사체 방어 수정: Cyien의 blockCountMode:'projectile'은 '투사체만 방어' 설정이 아니라 한 실행의 여러 투사체를 각각 onBlock 1회로 계산하기 위한 기존 옵션이므로 유지했다. 실제 누락 원인은 AttackGuardService가 delivery.area/hitscan만 방향 기반으로 방어하고, effect-animation body-contact/direct 등 히트스캔 태그가 없는 직접공격은 짧은 guard 영역 안의 source/impact point만 검사하던 구조였다. 공통 guard 판정을 보강해 투사체가 아닌 실제 직접공격은 execution/impact의 공격 진행 방향으로 방어각을 검사한다. DOT/상태피해는 제외하며 실제 투사체는 기존 projectile 접촉/제거 경로를 그대로 사용한다.

3.1717 Van 반격 상태 조건 수정: 간헐적으로 반격이 안 되던 원인은 반격 Ability에 van-wrench-durability >= 1 조건이 붙어 있어 스패너 내구도 0 상태에서는 counter.ready가 있어도 입력 자체가 차단되던 것이었다. 반격기는 거대한 스패너 보유 여부와 무관하게 사용할 수 있도록 해당 내구도 조건만 제거했다. entity.alive / ability.pending-ready / combat.can-act / counterWindup / counter.ready 등 기존 공용 반격 조건과 counter.execute는 그대로 유지한다.

3.1717 Van 반격/라운드 채팅 수정: Van 반격 AttackSpec의 임의 550ms 쿨다운을 기존 일반 반격 규격 300ms로 맞춰 counter.ready가 있어도 자체 공격 쿨다운 때문에 간헐적으로 입력이 막히던 경우를 제거했다. van-wrench-durability 조건에는 ProgressState 생성 직전의 짧은 공백을 위해 기존 state.progress-gte의 initial fallback으로 최대 내구도를 사용한다. 라운드 종료 후 scr-between 진입 직전에 OnlineChatService.clearRoundDraft()를 호출해 openState를 닫던 경로를 제거하고, draft/openState를 먼저 보존한 뒤 화면 전환 후 preserveAcrossScreenChange()로 입력창을 그대로 복원한다.

3.1717 Van RMB 무기 투사체 + 비율 조정: 기존 weapon-projectile anchor-cross들의 crossHalfLength/radius 공용 비율 중앙값 0.500을 그대로 적용했다. Van visualRadius 92 기준 crossHalfLength를 46로 조정해 다른 무기 투사체들과 같은 상대 비율로 보이게 했다.

3.1717 반 식별자 통일: 캐릭터 내부 식별자를 ban에서 van으로 전부 변경했다. CHARACTER_DATA key/id, attack.van.*, ability.van.*, van-wrench-* 상태키를 사용한다. 캐릭터 금지 시스템의 일반적인 ban/banned 문자열은 별개 기능이므로 변경하지 않았다.

3.1717 반 수리/무기 표시 수정: RMB 초거대 스패너의 실제 보이는 weapon-projectile 크기는 다시 visualRadius 92로 복구하되 공용 + 표시의 crossHalfLength는 8로 유지해 거대한 투사체 자체는 크게 보이고 중앙 +만 과대해지지 않게 했다. 스패너 수리는 기존 ProgressStateService의 별도 repair progress를 사용해 정지 시간이 누적된다. 움직여도 누적된 수리 진행도는 초기화되지 않고 일시 정지하며, 공격하거나 피해를 받아도 누적값은 유지한 채 충전만 멈춘다. 이동/공격/피격 뒤 다시 0.5초 동안 정지해야 누적 게이지가 재개되고, 총 2.5초 누적 시 내구도 800을 한 번에 복구한다. 수리 호게이지는 기존 gauge.arc + progress ratio로 누적값을 그대로 표시하며 ProgressStateService 기본 네트워크 동기화를 사용한다.

3.1717 신규 캐릭터 반: 체력 800/빠른 이동/연두색의 지속전투형 근거리 탱커. 캐릭터 수치·분류·설명·내구도·수리·공격 수치·투사체 크기까지 CHARACTER_DATA.ban 한곳에 모았다. durabilityGuard는 최대 800, 100당 1칸의 연속 감소형 8칸 게이지를 모든 화면에 표시하며 피해를 먼저 1:1 전이한다. 내구도 0에서 거대한 스패너가 파괴되고, 실제 위치가 움직이지 않는 동안 최대치/2.5초 속도로 수리하며 수리 중 공통 호 게이지를 표시한다. 파괴 중 LMB는 수리용 스패너 투척으로 전환되고 RMB/반격은 거대한 스패너 복구 전까지 사용 불가. RMB 초거대 스패너는 메이실 반격 투사체보다 훨씬 큰 78px 판정/92px 시각 반경의 기존 공용 weapon-projectile을 사용하며 적중 시 0.5초 기절. 내구도 상태는 duel-state로 동기화되어 상대 화면의 칸 게이지도 동일하게 보인다.

3.1717 스야 은신 해제 노란 원 FX 수정: 은신 중 적에게 감지되어 해제될 때 StealthModeService.update가 스야 중심에 직접 생성하던 type:'justdodge' (렌더러 고정색 rgba(255,215,0)) 확장 원을 제거했다. 앞서 잘못 억제했던 attack.sya.stealth-freeze의 delivery.area 자동 범위 표현과 공통 피격 표현 설정은 원래 상태로 복구했다. 무비용 툴팁의 '스테미나 0' 표기는 유지한다.

3.1719 스야 공격속도 증가 잔여횟수 게이지: 안개 기습으로 얻는 다음 평타 공격속도 증가 효과를 worldGaugeModules의 2칸 gauge.segmented로 표시한다. 값은 LimitedUseBuffService의 remaining을 직접 참조하고, 최대 칸 수는 같은 상태의 maximum(미생성 시 캐릭터 데이터 abilities.rmb.trigger.modules.0.attackBoost.uses)을 참조하므로 attackBoost.uses만 변경해도 게이지 칸 수가 함께 바뀐다. 효과가 활성일 때만 소유자 화면에 표시되며 평타 사용마다 2→1→0으로 감소한다.

Firebase 전환 일괄 패치: 관리자 권한 3분리(debugTools/accountAdmin/rankingAdmin), 마이그레이션 바인딩 Firestore 이전, GitHub 계정 원본 읽기 전용화, legacy AccountService 정리.

3.1717 티냐 선딜레이 판정 정정: 티냐 LMB의 `선딜레이`는 마법진이 맵에 그려지기 전 activation inputWindowMs 200ms만 의미한다. reveal 350ms는 이미 마법진이 맵에 그려진 뒤의 진행 상태이므로 강제이동 중단 대상이 아니다. CircleFormationService.cancelWindupOnForcedMovement는 phase==='input'일 때만 activation을 취소하며 reveal/move는 유지한다.

3.1717 선딜레이 통합 후속 수정: (1) 선딜 timing.delay와 delayed delivery.area는 이제 원격 복제본이 자체 타이머로 피해/버프를 확정하지 않고 소유자 `duel-windup-commit`을 기다린다. 강제이동 interrupt가 먼저 오면 원격 continuation 자체를 폐기해 레이카/펠루나의 '이펙트만 취소되고 피해는 들어옴'을 제거한다. (2) ability-level 선딜 effect.spawn을 abilityUseId별 key로 추적해 강제이동 시 즉시 제거, 레이카 태양의 가호 진행 이펙트 잔존을 수정. (3) 프릴 channel charging 강제중단은 stopField를 생성하지 않아 상대 화면에 청소구역만 남지 않는다. (4) 펠루나 실제 실행 stage1/2/3에 300ms delay+선딜레이 태그를 적용. (5) 키 예고 실행에서 선딜레이 태그 제거. (6) 파비 RMB는 data-driven windupCancelBuffs로 fortify DEF 잔여를 정리.

3.1717 선딜레이 시스템 통합: 비반격 공격의 강제이동 중단 여부를 AttackSpec tags의 `선딜레이` 하나로 통일했다. AttackWindupService가 timing.delay, delivery.area delay, target-point projectile launchDelay, 공격 resolve형 state.window, channel charging, 가에 cooling windup을 공통 중단하며 온라인 duel-windup-interrupt도 동일 서비스로 재생한다. 콤보 후속타 간격(Ki/Cyien/Kanon)과 ChargedAttackService/홀드 차징은 `선딜레이` 태그가 없어 강제이동으로 끊기지 않는다. 반격기는 기존 counterWindup 경로를 유지하고 데이터 태그 추가 대상에서는 제외한다.

3.1717 강제이동 선딜 중단 v3 네트워크 권위 수정: 선딜 취소가 소유자 로컬 scheduler에만 적용되어 레이카 가호 RMB처럼 action.attack이 먼저 원격에 복제된 뒤 delayed delivery.area 피해가 상대 권위 화면에서 계속 실행되던 문제를 수정했다. 소유자가 강제이동으로 선딜을 실제 취소하면 duel-windup-interrupt를 전송하고, 모든 원격 복제본이 동일 ForcedMovementWindupInterruptService를 networkReplay로 실행해 timing.delay/state.window/channel/counter/delivery.area 예약을 함께 제거한다. 따라서 이펙트만 사라지고 피해는 들어오는 분리를 제거한다. 홀드 차징 예외는 유지.

3.1717 강제이동 선딜 중단 v2: 기존 패치가 timing.delay를 context.executed=false일 때만 interruptible로 표식해 action.attack 이후 delay를 쓰는 파비 RMB 등을 놓치던 오류를 수정했다. timing.delay는 기본적으로 모두 강제이동 중단 대상이며, Runef 원소 선택처럼 previewAttackIds+resolveAttackIds를 가진 state.window 공격 선딜도 TimedActionStateService에서 취소한다. ChannelAttackService는 charging phase만 끊고 active phase는 유지한다. ChargedAttackService/홀드 차징은 이전 요청대로 예외 유지.

3.1717 강제이동 CC 차징 예외: 메인마드/메후구/나남낭/델트루브/체리티 및 레이즈/하츠하츠 등 홀드 차징은 끌어오기·밀어내기·넉백·tether로 취소하지 않는다. ForcedMovementWindupInterruptService는 일반 공격 선딜 continuation과 counter windup만 중단하며 ChargedAttackService/actionState 기반 홀드 차징은 보존한다.

3.1717 강제이동 CC 선딜 중단 공통화: 끌어오기/movement.pull, 일반·밀어내기·무력화 넉백, projectile tether가 실제 위치를 강제로 바꾸기 시작하면 대상의 공격 선딜을 공통으로 취소한다. Ability timing.delay와 최초 delivery.area.delay만 interruptible windup으로 표식해 취소하며 이미 발동한 공격의 후속 delayed hit/volley는 유지한다. counter.execute 선딜과 표준 ChargedAttackService 차징도 강제이동 시 취소하고 attackPreview를 정리한다.

3.1717 업로드 파일 기준 금지 카드 UI 수정: 일반 캐릭터 선택 화면에서도 금지 설정 화면과 동일한 전체 카드 오버레이를 사용하고, 기존 어두운 필터/비스듬한 금지 딱지를 제거했다. 금지 해제 시 오버레이도 즉시 제거한다.

3.1717 낙관적 레코드 실제 적용: 라운드 종료 즉시 예상 레코드 점수를 AccountState.current.characterRecords에 실제 반영해 프로필/카드/상대 공유 UI까지 바로 갱신한다. 이 값은 Firebase/Worker에는 저장하지 않으며 서버 확정 progress가 도착하면 권위값으로 덮어쓴 뒤 아직 미확정인 후속 라운드 예상치만 재적용한다. 서버 불일치/실패/정산 타임아웃 시 임시 점수를 자동 회수하고 정정 토스트를 표시한다.

3.1717 레코드 토스트 즉시 표시: Worker의 현재 라운드 정산 계산식을 클라이언트에 동일하게 미러링해 경기 종료 순간 예상 레코드 delta를 즉시 토스트로 표시. 서버 정산은 계속 권위값이며 결과가 동일하면 토스트를 재생하지 않고, 다를 때만 서버 값으로 정정 표시.

3.1717 아츠테오 원석 로컬 잔존 수정: 대상 권위 hit-confirmed 수신 시 orbit inventory item만 소비하던 경로에서 동일 stateKey/collection/itemId의 실제 Projectile도 즉시 discard하고, 소비 시 combatSnapshotDirty를 갱신한다. 적중 확정된 원석이 공격자 자신의 화면에 남는 현상을 제거하며 다른 원석은 건드리지 않는다.

3.1717 아츠테오×반 내구도 확정 소모 보강: 반 스패너가 피해를 100% 흡수해 체력 피해가 0인 duel-hit-confirmed도 공격자 소유 orbit inventory 원석을 impactMeta(itemId) 기준으로 즉시 소비한다. 일반 확정 이벤트와 중복 호출되어도 이미 소비된 item에는 영향이 없다.

3.1717 마이그레이션 진행 경고 추가: 인증/이전 처리 중 별도 경고 박스를 표시해 새로고침/창 닫기 금지와 처리 시간 안내를 노출. 실제 이전 중에는 beforeunload 경고도 등록하고 완료/실패 시 해제.

3.1717 Firebase 빠른 로그인 복원: Firebase Auth가 UID를 확인하면 로컬 캐시 계정을 즉시 적용하고 메인 화면을 연 뒤 /firebase/account/load를 백그라운드 동기화. 캐시는 화면 복원용으로만 사용하며 관리자 권한은 캐시하지 않음. 서버 응답 도착 시 최신 프로필/전적/권한으로 교체.

3.1717 로그인 로딩 스택 오버플로 수정: resolveAuthState()가 자기 자신을 재호출하던 재귀 버그를 제거하고 AuthResolutionUI.resolve()를 호출하도록 수정. Maximum call stack size exceeded 해결.

3.1717 로그인 로딩 UI 듀얼즈 스타일 통일: 별도 패널/스피너 스타일을 제거하고 기존 메인 화면의 검정 배경, DUELS 타이틀, Made By Lyan___ 서브텍스트, status 타이포그래피를 그대로 따르는 로딩 화면으로 변경.

3.1717 로그인 로딩 무한 대기 수정: AuthResolutionUI를 Object.freeze로 만든 상태에서 pending 값을 변경하려 해 resolve()가 영원히 true로 남던 버그 수정. mutable 상태 객체로 변경하고 10초 안전 타임아웃 및 Firebase persistence 실패 fallback 추가.

3.1717 로그인 판정 로딩 잠금: Firebase Auth의 로그인 여부가 확정되기 전 모든 버튼을 disabled 처리하고 '로그인 상태 확인 중...' 로딩 화면을 표시. 판정 완료 후 기존 disabled 상태를 복원.

3.1717 마이그레이션 계정 전환 UI 추가: 계정 설정 창 상단에 작은 '다른 Google 계정으로 로그인' 버튼을 추가. 클릭 시 현재 Firebase 로그아웃 → 저장 세션 초기화 → Google 계정 선택 팝업 → 선택 계정으로 계정 설정 흐름 재진입.

3.1717 마이그레이션 취소 버튼 제거: 로그인 계정 칩에서 마이그레이션 취소 버튼을 더 이상 생성하지 않음. 기존 서버 cancel API와 내부 함수는 호환성을 위해 유지.

3.1717 Firebase 로그인 상태 복원 수정: 계정 게이트를 기본 숨김으로 변경하고 Auth 상태 복원 완료 전 로그인 화면이 먼저 보이지 않도록 처리. browserLocalPersistence를 명시해 새로고침 후 Google 로그인 상태를 유지. 실제 미로그인 상태가 확인된 경우에만 로그인 게이트 표시.

3.1717 새 Firebase 계정 닉네임 설정 추가: 새 계정으로 시작 선택 시 닉네임 입력 폼을 표시하고 생성 직전 재확인. 닉네임은 최초 1회만 설정 가능하다는 경고를 추가하고, Worker는 명시적으로 입력된 1~24자 닉네임만 새 계정 생성에 허용.

3.1717 Worker firebaseRankingAccount helper 복구: 마이그레이션 완료/랭킹 동기화에서 참조하던 firebaseRankingAccount 정의가 legacy 정리 과정에서 함께 제거되어 Google 계정 이전이 500으로 실패하던 문제 수정.

3.1717 Worker Firestore URL helper 복구: read/write/delete/ranking 코드가 참조하던 firestoreDocumentUrl 정의가 누락되어 /firebase/account/load가 500을 반환하던 문제 수정.

3.1717 Worker CORS 오류 진단 수정: fetch 라우트가 async handler Promise를 await하지 않아 내부 오류가 바깥 try/catch를 우회하고 Cloudflare 런타임 오류로 종료되던 문제를 수정. 모든 비동기 라우트를 await하여 오류 응답에도 CORS 헤더와 JSON error/message가 반환되도록 변경.

3.1717 마이그레이션 취소 Failed to fetch 수정: 취소 시 settlement 하위 컬렉션 전체 순회 삭제를 제거해 Worker subrequest 폭증을 방지. 핵심 계정 초기화만 수행하고 랭킹 삭제는 best-effort 처리하며, 전체 랭킹 재구축은 duelsAccountReady:true 계정만 포함하도록 수정.

3.1717 마이그레이션 취소 수정: 취소 시 binding만 해제하던 문제를 수정. Worker가 Firebase 랭킹/진행도/프로필을 제거하고 private/account를 duelsAccountReady:false로 초기화해 동일 Google 계정에서 다시 마이그레이션 또는 새 계정 시작이 가능하도록 변경. 서버 권한 permissions는 보존.

3.1717 마이그레이션 계정 설정 UI 정리: 패널/버튼/입력폼 간격과 가독성을 개선하고, 10월 31일 지원 종료 경고 아래에 미마이그레이션 계정 추후 삭제 및 최초 1회 제한 안내를 추가.

3.1717 Firebase legacy 정리: 랭킹 GitHub seed/fallback과 구형 /ranking/rebuild(X-Admin-Key), /firebase/permissions/debug-tools 호환 경로 제거. HTML AccountService.save 및 비-Firebase 저장 fallback 제거. GitHub 읽기는 2026-10-31까지 기존 계정 마이그레이션 원본/초기 binding seed에만 유지.

3.1717 충돌 전용 투사체 target impact 권위 수정: damageOnTravel:false projectile이 공격자 화면의 보간 원격 대상에 예측 접촉했을 때 projectile.impact를 선행 실행하던 공통 버그 제거. 비권위 화면은 투사체만 예측 소비하고, 대상 권위 화면이 실제 충돌점을 duel-projectile-impact-confirmed로 전파해 모든 화면이 그 좌표에서만 impact를 실행한다. 루네프 화염구의 방패/대상 도달 전 폭발 및 동일 구조 키네스 등 공통 적용.

3.1717 state.window continuation 수정: 제거된 태그전 분기 잔여 참조를 삭제하고 현재 캐릭터 기준으로 후속 공격을 해석.

3.1717 채팅 라운드 전환 수정: 라운드 종료로 between 화면에 들어갈 때 작성 중이던 미전송 draft를 폐기하고 채팅 입력/타이핑 상태를 닫아 다음 라운드에 이전 문장이 남지 않게 함. 채팅 history는 유지.

3.1717 카논 반동 펀치 FX 수정: recoil-hit의 별도 회색 effectShape를 제거하고 delivery.area 공통 자동 사각 FX 하나만 사용. suppressHitImpactRing은 유지.

3.1717: Firebase 계정 전환 일괄 패치. 랭킹 저장소를 Firestore 서버 전용 문서로 이전하고, 랭킹 재구축도 Firebase 사용자 progress 기준으로 변경. 디버그 레코드/전적 조작 및 계정 삭제는 Firebase ID Token + 서버 debugTools 권한을 검증하는 Worker 관리자 API로만 수행. GitHub 랭킹은 최초 seed 용도로만 사용.

3.1717 Firebase server-only debug permission migration

3.1717 전투 복구: 3.1687의 검증된 OnlineDuelService 전체 전투/라운드/선택/네트워크 흐름을 복원. 누락됐던 startRound/updateRoundScore 및 손상된 증강 카운트다운을 원본 구조로 되돌리고, Firebase/서버 정산 계층은 유지.

3.1717: Firebase 계정 전환 4단계. 클라이언트의 /firebase/progress/save 직접 저장을 제거하고, 온라인 라운드 결과는 모든 참가자가 동일한 결과를 /match/submit으로 제출했을 때만 Worker가 서버에서 레코드/전적을 계산해 Firestore에 반영한다. 일반 이탈 패널티는 /match/departure/self에서 서버 계산.

3.1717: Firebase 계정 전환 3단계. characterRecords/characterStats의 Firestore 직접 쓰기를 제거하고 Firebase ID Token으로 Cloudflare Worker의 /firebase/progress/load, /firebase/progress/save를 호출하도록 변경. Firestore progress 문서는 서버 서비스 계정만 쓰는 구조로 전환. 일반 Duels 자체 로그인/가입은 제거 상태 유지.
<!-- 3.1717: Firebase 계정 전환 2단계. 일반 Duels 아이디/비밀번호 로그인 및 신규 계정 생성 UI를 제거하고 Google/Firebase 로그인만 계정 로그인으로 사용한다. 기존 아이디/비밀번호는 2026-10-31까지 마이그레이션 인증에만 사용한다. Firestore users/{uid}에는 프로필/마이그레이션 메타데이터를, users/{uid}/data/progress에는 characterRecords/characterStats를 분리 저장한다. permissions는 클라이언트 저장 대상에서 제외한다. 게스트 플레이는 유지.

3.1716: Firebase Google 로그인 기반 계정 온보딩/마이그레이션 UI 추가. Google 로그인 후 Firestore users/{uid}에 duelsAccountReady가 없으면 기존 계정 마이그레이션 또는 새 계정 시작 창을 표시한다. 마이그레이션 창에 "마이그레이션은 10월 31일까지만 지원됩니다." 안내를 명시하고 기존 ID/비밀번호 확인, 기존 데이터 미리보기, Firebase UID 프로필 복사 흐름을 추가. 기존 계정 비밀번호/permissions는 Firestore로 복사하지 않는다. 실제 전투/P2P 구조는 변경하지 않음.

3.1715: Firebase 웹 SDK 연결. 기존 Cloudflare 계정 시스템은 아직 유지하고, Firebase App/Auth/Google Provider/Firestore를 별도 초기화해 window.DuelsFirebase로 노출한다. Analytics는 사용하지 않는다.

3.1714: 방 설정의 증강 등장 수 선택 최대치를 15로 제한. RoomService 설정 보정의 기존 augmentCount 최대 15와 UI 선택지를 일치시켜 16~30 옵션이 더 이상 생성되지 않는다.

3.1713: 게임 모드 선택 시스템을 제거하고 기존 증강전 규칙을 단일 게임 규칙으로 고정. 방 설정/네트워크/라운드 준비에서 모드 분기를 제거했으며 1대1·2대2·FFA 인원 구성 판정만 매치 토폴로지로 유지. 이전 개발 과정에서 추가된 공통 전투 버그 수정은 유지.

3.1689: CharacterTitleService의 실제 칭호 테이블에 델트루브/시아넬리 항목을 추가. deltroove='광차 운반원', xianelli='암살자 견습생'. 기존 styleLabel과 별개로 마스터 칭호 표시가 더 이상 '칭호 미지정'으로 나오지 않도록 수정.

3.1688: 델트루브 칭호를 '광차 운반원'으로, 시아넬리 칭호를 '암살자 견습생'으로 변경. 시아넬리 설명을 '순보를 이용해 위치를 교란하며 전투하는 캐릭터'로 변경. 스탯/스킬/태그는 변경하지 않음.

3.1687: 스야 평타 attack.sya.lmb 스테미나 소모량을 300에서 250으로 조정. 다른 스야 수치/동작은 변경하지 않음.

3.1686: 가에 설명에 패시브형 [ALWAYS] '과열' 추가. 이동을 제외한 행동 시 스테미나가 반대로 차오르며 과열 게이지로 동작하고 스테미나 자동 회복이 제거된다는 내용을 LMB 위로 분리. 전투 로직/수치 변경 없음.

3.1685: 캐릭터 설명에 패시브형 [ALWAYS] 항목을 도입. 에라 파비/레이카/헤르쟝/메라 모나/제리/클레아/라임/큐리/아츠테오/키네스/뉴/사이엔의 기존 스킬 설명에 섞여 있던 상시 효과 문구를 분리해 LMB 위에 표시한다. 아츠테오 LMB 이름은 '곡괭이'로 변경. 큐리의 '단계 유지' 설명은 제거하고 자연 회복 비중단만 ALWAYS로 이동. 키 LMB 설명의 '재사용 활성화' 문구 제거.

3.1684: 레이즈 RMB 스킬 표시 이름을 '점프'에서 '도약 내려치기'로 변경하고, attack.raise.rmb 스테미나 소모량을 450에서 550으로 증가. 다른 레이즈 수치/동작은 변경하지 않음.

3.1683: 레테 평타 연속 발사 수를 4발에서 3발로 조정. attack.lete.lmb의 delayed-projectile-volley count 4→3, 마지막 중앙 추가탄을 제거해 perpendicularOffsets [-20,0,20]만 사용. 피해/탄속/발사 간격/스테미나/쿨다운은 변경하지 않음.

3.1682: 리안 방패돌진 attack.lian.shield-dash 스테미나 소모량을 150에서 200으로 조정. 다른 리안 스킬 수치/동작은 변경하지 않음.

3.1681: 키 코인 색상 경로 완전 통일. 예고장 일반 회피 보상 FieldDodgeRewardService 코인뿐 아니라 특수탈취(반격) 적중 시 on-hit effect.spawn travelToken도 평타 3타 attack.ki.lmb-final과 동일한 RGB 255,165,0으로 변경. 따라서 키의 두 회복 코인 경로가 모두 동일한 주황색을 사용한다. 반격 원/사각 공격 FX 색은 기존 키 색 유지.

3.1680: 키 예고장 회피 보상 코인 색상을 평타 3타와 동일하게 통일. attack.ki.lmb-final의 실제 effect.spawn 색상 255,165,0을 dodgeReward.color에 그대로 사용해 travelToken 코인도 동일 색으로 표시. 반격 FX 색상은 변경하지 않음.

3.1679: 키 회피 보상 코인 색상 회귀 수정. 반격 FX 색 수정 과정에서 공통 travelToken 렌더가 EffectSpec color를 우선 사용하도록 바뀌며 키 예고장 dodgeReward의 color:'195,201,222'까지 코인 색에 적용되고 있었다. 키 예고장 보상 코인은 기존 전용 금색 계열을 사용하도록 dodgeReward의 color 전달을 제거하고, 반격 type:'counter'/effectShape 색상은 그대로 키 고유색으로 유지.

3.1678: (1) 아츠테오 회전 원석 피해를 150으로 조정하고 단일 AttackSpec 원본 유지. attack.atsuteo.ore-hit damageRatio를 1로 변경해 기본피해 150 기준 원석 피해 150. 툴팁의 잘못된 linkedDamageAttackId를 제거하고 CharacterDescriptionService가 실제 지원하는 linkedAttack:'oreHit' 참조를 사용해 설명 피해가 실제 원석 피해와 자동 동기화된다. (2) 키 반격기의 근본 시각 버그 수정. 실제 사각 공격 FX는 type:'effectShape'로 정상 생성되고 있었지만 월드 FX 렌더러에 effectShape 분기가 없어 최종 fallback의 붉은 확장 원으로 잘못 렌더되고 있었다. effectShape 전용 렌더를 추가해 rect는 실제 range/halfWidth/clip polygon을 키 색으로 그리며, 더 이상 붉은 원 fallback으로 떨어지지 않는다.

3.1677: 아츠테오/키 구조 정리. (1) 아츠테오 회전 원석 피해를 attack.atsuteo.ore-hit 단일 원본으로 통일. orbitInventory.damage 기반 재계산을 제거하고 oreHit damageRatio 4/3(기본피해 150 기준 200)을 그대로 사용하도록 변경. 툴팁도 하드코딩 '피해 100'을 제거하고 linkedDamage 참조로 실제 원석 피해를 자동 표시. (2) 키 반격기 3.1676의 잘못된 previewStyle/suppressHitImpactRing 변경을 되돌림. 반격 완료 시 생성되는 실제 type:'counter' 확장 원에 counter.execute.presentation.fireColor를 명시적으로 전달해 키 색 195,201,222를 사용. 실제 사각 공격 effectShape는 이동 모듈보다 먼저 실행되도록 순서를 앞당겨 공격 위치에서 다시 보이게 복구.

3.1676: 키 반격기 시각 수정. (1) attack.ki.counter의 delivery.area에 suppressHitImpactRing:true를 적용해 적중 시 별도로 생성되던 공통 원형 확장 hitImpactRing을 제거했다. 키 반격기의 반격 발동 원(type:'counter'), 회복 travelToken, 실제 사각 공격 effectShape는 모두 키 고유색 #c3c9de / 195,201,222 계열만 사용한다. (2) counter AttackSpec에 previewStyle을 명시해 0.3초 선딜 동안 실제 rect 180×140 공격 범위가 키 색 점선/반투명 채움으로 확실히 표시되도록 했다.

3.1675: 스야 은신 해제 감지 판정을 실제 은신 가시 판정과 동일한 충돌 거리 기준으로 수정. StealthPresentationService.detectedBy는 revealRadius + viewer.radius + target.radius를 사용하므로 플레이어(20/20) 기준 실제 가시 중심거리는 80+20+20=120이다. StealthModeService.detectedTargets도 detectRange + source.radius + target.radius를 사용하도록 공통 수정해 은신 해제가 실제로 보이기 시작하는 거리와 일치한다. 안개 기습 빙결은 이 실제 가시 거리보다 25% 넓은 유효 중심거리 150이 되도록 attack/delivery 원형 range를 130으로 설정한다(Area 원형 판정이 target.radius 20을 포함하므로 130+20=150).

3.1674: 스야 은신 해제 감지 범위를 실제 은신 감지 범위와 동일하게 통일하고, 안개 기습 빙결 범위는 그보다 25% 넓게 조정. 실제 은신 감지/revealRadius 80 기준 detectRange 80, attack.sya.stealth-freeze range 100. 감지 조건과 빙결 실행 범위는 계속 분리 유지.

3.1673: 스야 은신 감지 범위와 빙결 범위 실제 실행 경로 완전 분리. StealthModeService.update가 감지 성공 후 detectAttackId를 실행할 때 state.detectRange 값을 attack.range 및 delivery.area.range에 다시 덮어써 빙결 범위까지 80으로 축소하던 공통 오류 수정. 이제 detectRange:80은 은신 해제 감지에만 사용하고, detectAttackId의 원래 AttackSpec 범위 120은 그대로 실행되어 감지 시 주변 120 범위에 빙결을 적용한다.

3.1672: 스야 은신 해제 감지 범위와 안개 기습 빙결 범위를 분리. stealth.toggle에 detectRange:80을 명시해 detectAttackId의 attack.sya.stealth-freeze range(120)를 감지 범위로 재사용하지 않도록 수정. 감지 범위는 80, 빙결 범위는 120(150%) 유지.

3.1671: 스야 안개 기습 빙결 범위를 은신 감지 범위의 150%로 조정. 은신 감지/revealRadius 80은 유지하고 attack.sya.stealth-freeze의 AttackSpec range 및 delivery.area range를 96→120으로 변경. 기타 은신/빙결 지속시간/반격 수치는 유지.

3.1670: 아츠테오 스킬 이동 중 회전 원석이 적에게 닿으면 피해 없이 사라지던 버그 수정. 3.1668에서 OrbitInventoryService.spawnProjectile이 predictiveConsumeOnContact:false를 넘기도록 했지만 ProjectileService.spawn이 projectile 객체 생성 시 data.projectile?.predictiveConsumeOnContact 값으로 다시 덮어써 명시적 false가 무시되고 있었다. spawn-level 명시값을 최우선으로 보존하도록 공통 우선순위를 수정해, 이동 중 swept 접촉도 원격 예측만으로 원석을 소비하지 않고 피격자 권위 실제 적중 확정 후 200 피해와 함께 원석이 소모된다.

3.1669: 키 반격기 발동 시 보이는 작은 원 확장 이펙트의 붉은색 혼입 수정. 실제 해당 이펙트는 travelToken/hitImpactRing이 아니라 Presentation.counterFire의 type:'counter'였으며, entity.color를 직접 사용해 온라인 상대 화면에서 팀/표시색이 섞일 수 있었다. counterFire는 캐릭터 원본 character.color를 우선 사용하도록 변경해 다른 캐릭터와 동일하게 고유 캐릭터 색으로 표시한다.

3.1668: 아츠테오 회전 원석이 적 접촉 시 피해 없이 사라지던 온라인 권위 버그 수정 및 실제 피해 200 적용. OrbitInventoryService가 생성하는 원석 projectile은 predictiveConsumeOnContact:false를 사용해 공격자 화면의 원격 대상 예측 접촉만으로 finish/projectile-resolved/인벤토리 소모가 일어나지 않게 하고, 피격자 권위의 실제 hit-confirmed 이후에만 기존 network-hit-confirmed/consumeConfirmed 경로로 정확한 원석을 소비한다. 또한 실제 원석 피해의 단일 원본인 orbitInventory.damage.base를 100→200으로 변경해 preparedProjectileAttack이 200 피해를 사용하도록 수정.

3.1667: (1) 공통 피격 hitImpactRing이 공격자 색을 전달받지 않아 키 반격기 작은 확장 원이 붉은/기본색으로 보이던 문제 수정. damage-applied presentation에서 ring color를 AttackPresentationColorService.resolve(source,event.attack)로 명시해 공격 캐릭터 색을 사용한다. (2) 뉴 마검 저스트 회피의 실제 조기 경로 수정. ProjectileService.hitTarget의 DamagePipeline 이전 JustDodgeService.confirmProjectile 분기가 비관통 atTarget+atRange 지속 투사체도 return true로 접촉 소비해 beginLinger를 호출하던 원인을 제거하고, 해당 구조는 hitIds만 기록한 뒤 return false로 계속 비행하게 한다. 따라서 상대 화면에서도 저회 시 적 위치 정지 없이 최대 사거리까지 자연스럽게 진행한다.

3.1666: 셰리나 비아 liveProjectilePath 잔향이 상대 화면에서 낮은 프레임처럼 계단식으로 자라던 버그 수정. ProjectileImpactService의 실시간 path field 네트워크 전송 주기를 고정 50ms(약 20fps)에서 GAME_DATA.frameMs 기준으로 낮춰 원격 화면에서도 로컬에 가까운 갱신 빈도로 field-point-spawn을 보내도록 변경. 최종 착탄/페이드 타임라인과 피해 판정은 유지.

3.1665: 아츠테오 밸런스 조정. 회전 원석 피해량 100→200, LMB 평타 스테미나 소모량 150→200. 기타 원석/이동/쿨다운 동작은 유지.

3.1664: 아츠테오 RMB 이동 방식을 지정 지점 이동에서 고정 거리 이동으로 변경. 기존 이동거리 270은 유지하며, target-point를 사용하지 않고 조준 방향으로 항상 270만큼 이동한다. 기타 원석/쿨다운/재사용 구조는 유지.

3.1663: 뉴 마검 저스트 회피 접촉 시 순간 정지 후 사거리 끝으로 튀던 버그 수정. projectile hitTarget의 dodged 처리에서 arrival.linger가 atTarget+atRange를 함께 사용하는 지속형 투사체는 회피 접촉을 적중으로 소비하지 않고 그대로 비행을 계속한다. 따라서 뉴 마검은 저회 성공 시 적 위치에 멈추거나 제거되지 않고 자연스럽게 최대 사거리까지 진행한 뒤 기존 atRange 착탄/장판 상태로 전환된다. 일반 비관통 폭발 투사체는 기존처럼 회피 시 접촉만 소비하고 target impact 폭발을 만들지 않는다.

3.1662: 페이즈/레이즈 RMB 이동기를 에즈레일식 점프 이동 판정으로 통일. 두 스킬 모두 trajectory.arc + target-point 이동 + 벽/적 통과 + resolveOverlapOnEnd + presentation:false를 사용해 리안 방패돌진류의 지상 경로 이동처럼 취급되지 않도록 변경했다. 이동 경로 dash-line/잔상은 생성하지 않으며 기존 착지 효과/기절 등 후속 효과는 유지.

3.1661: 뉴 마검이 적중 위치에 잠깐 멈춘 뒤 최대 사거리 끝으로 순간이동하던 버그 수정. TargetPointProjectileService.beginLinger가 모든 linger 전환에서 projectile.travel을 targetDistance(최대 사거리)로 강제 덮어쓰던 구조가 atTarget 정지에도 적용되어, 실제 적중 좌표와 진행 거리 상태가 분리되던 것이 원인. atTarget 적중으로 정지한 경우에는 실제 travel을 보존하고, atRange/targetPoint 도착처럼 실제 끝점에 도달한 경우에만 기존 targetDistance 보정을 유지한다. 현재 atTarget+atRange+snapToRangeEnd를 동시에 쓰는 캐릭터는 뉴이며 공통 서비스 수준에서 수정.

3.1660: 키 반격기 적중 시 이동하는 작은 원형 travelToken 이펙트가 전달된 캐릭터 색을 무시하고 금색/주황색 RGBA를 하드코딩해 붉은색이 섞여 보이던 문제 수정. travelToken 렌더링을 EffectSpec의 color/strokeColor 및 source 캐릭터 색 기반으로 통일해 키를 포함한 모든 travelToken이 해당 캐릭터 색 계열로 표시되도록 변경. 전투 판정/회복 타이밍은 유지.

3.1659: 셰리나 비아 projectile-path 잔향 생성 애니메이션이 최종 착탄 전환 시 한 번 더 재생되던 버그 수정. InstalledAreaFieldService.activatePoint에서 같은 instanceId의 liveProjectilePath field를 최종 고정 field로 전환할 때 EffectSpawnService의 기존 effect 타임라인(start/dur)을 보존한다. 비행 중 한 번 자란 progressRect가 착탄 시 처음부터 다시 reveal되지 않고 그대로 이어져 유지/페이드아웃된다. 동일 liveProjectilePath→fixed 전환 구조에 공통 적용.

3.1658: 루네프 화염 마법 투사체를 회피했는데도 target impact 폭발 이펙트가 생성되던 버그 수정. ProjectileService.hitTarget이 dodged 결과를 반환하면 해당 target contact가 회피로 소비되었음을 기록하고, updateOutbound의 비관통 target 소비 경로는 이 경우 ProjectileImpactService.resolve('target')를 호출하지 않고 투사체만 제거한다. 따라서 실제 적중/벽/사거리 종료 폭발은 유지되지만 회피 성공 시 폭발 FX/후속 impact가 생성되지 않는다. 동일 비관통 projectile target-impact 구조에 공통 적용.

3.1657: 방 준비 상태 갱신 때 캐릭터 금지 화면 카드 입장 애니메이션이 반복 재생되던 버그 수정. RoomUI.render→CharacterBanUI.sync 경로에서 이미 열린 select/list 화면은 준비 상태 변경만으로 renderCards/grid.replaceChildren을 다시 호출하지 않는다. vote 화면도 동일 proposalId 갱신은 카드 DOM을 유지하고 헤더/동의 버튼 상태만 갱신하며, 새 제안일 때만 카드를 새로 렌더한다.

3.1656: 비관통 target-linger 투사체의 온라인 예측 적중 좌표 분리 버그 수정. 공격자 화면에서 원격 대상 접촉은 대상 권위 확정 전에는 projectile을 소비/정지시키지 않도록 변경해, 거짓 예측 접촉 때문에 무기만 적 위치에 남고 실제 상태/장판은 최대 사거리까지 진행하는 현상을 제거. duel-hit-confirmed가 도착하면 payload의 authoritative impactX/Y를 원본 projectile 좌표/prev 좌표에 먼저 반영한 뒤 target impact 및 beginLinger를 실행해 무기·장판·귀환 시작점이 동일 좌표를 사용한다. linger.atTarget + 비관통 공통 구조에 적용되어 뉴 마검과 시아넬리 등 동일 구조 투사체를 함께 수정.

3.1655: 뉴 마검 회수 재타격/비용 수정. projectile.return에 resetSharedHitAfterStationaryMs 옵션을 추가하고 뉴 마검에 500ms 적용. 착탄 후 0.5초 이상 지난 뒤 귀환을 시작하면 outbound/returning이 공유하던 hitIds를 귀환 시작 시 초기화해 이미 투척 중 맞은 적도 귀환 중 다시 1회 피해를 받을 수 있다. 0.5초 미만 회수는 기존 공유 hitIds 유지. 뉴 RMB 재입력 '돌아와!'의 스테미나 소모량은 500→200으로 변경하며 최초 마검 투척 비용 500은 유지.

3.1654: 아츠테오 RMB 스킬 설명 문구를 '지정 방향으로 빠르게 이동'으로 변경. 전투 수치/동작은 유지.

3.1653: 아츠테오 스테미나 소모량 조정. LMB 200→150, RMB 300→200. 기타 공격/원석/이동 동작은 유지.

3.1652: 페이즈/레이즈 점프 이동기의 dash-line 경로 선 제거. 아츠테오 RMB는 이동만 수행하며 착지 광역 피해/광석 채굴/채굴 범위/원형 FX 제거. 평타 벽 채굴은 1회 성공 시 원석 3개 획득. 원석 최대치/고정 슬롯 8→9, 회전 반경 100→120(+20%), 회전 속도 25% 증가, RMB 쿨다운 800ms→500ms.

3.1651: 카논 이동 회피 평타 적중 시 생성되던 공통 원형 피격 확장 이펙트 제거. delivery.area에 선택적 suppressHitImpactRing 플래그를 전달하도록 공통 AreaAttackService를 확장하고 attack.kanon.recoil-hit에만 활성화했다. 사각 공격 이펙트/피해/넉백/스테미나 회복은 유지.

3.1650: body-contact 이동 공격의 움직이는 대상 판정 수정. 기존에는 공격자의 실제 이동 선분과 대상의 현재 위치 한 점만 비교해 같은 방향으로 이동하는 적을 추격할 때 접촉을 놓칠 수 있었다. effect 실행별로 각 대상의 이전 충돌 좌표를 저장하고, 공격자 이전→현재 이동과 대상 이전→현재 이동의 상대운동 선분을 원점 기준으로 검사한다. 레이카 반격/라임 몸통박치기 등 모든 body-contact 이동 공격에 공통 적용.

3.1649: 온라인 소환수 사망 직후 CC 패킷이 늦게 도착하면 주인 플레이어가 대신 CC를 받던 공통 버그 수정. CombatStatusApplicationService.receive()에서 targetEntityId가 명시된 패킷은 정확한 Entity가 존재하고 로컬 소유자 소속일 때만 적용하며, 대상 소환수가 이미 사망/제거되어 조회되지 않거나 소유자가 다르면 패킷을 폐기한다. targetEntityId가 없는 구형 패킷에만 Training.player fallback을 유지.

3.1648: 엘린 탐사 유령 돌진을 다른 body-contact 이동 공격과 동일한 공통 경로 판정/경로 프레젠테이션 구조로 정규화. spirit-dash effect.spawn을 after-attack에서 등록하고 contactRadius 44 및 pathPresentation(엘린 색상, width 44)을 명시하여 실제 이동한 구간마다 네모 경로 FX와 피해 판정이 같은 movement:move 실행을 추적하도록 수정.

3.1647: 셰리나 비아 projectile-path field가 비행 중 liveProjectilePath 갱신에서는 pathTimeline을 사용하지 않되 최종 착탄/종료 시에는 원래 pathTimeline을 복원하고 liveProjectilePath를 종료해 잔향이 즉시 사라지지 않고 정상 페이드아웃되도록 수정. 기존 live state의 startedAt/trigger 상태는 최종 전환에도 보존한다. 카논 이동회피 평타 recoil-hit의 명시 effectShape가 벽 절단 윤곽까지 자체 처리한다고 표시해 areaWallCutOutline이 별도로 추가 생성되지 않도록 수정.

3.1646: 리안 RMB 스킬 밸런스/명칭 수정. 스테미나 소모량을 150→200으로 변경하고 툴팁 스킬 이름을 '백업'에서 '돌진 백업'으로 변경. 기타 동작/수치는 유지.

3.1645: 셰리나 비아 평타/더블링 잔향 종료 연출을 경로 축소가 아닌 전체 알파 페이드로 통일. progressRect pathTimeline의 fade 구간은 길이/offset을 줄이지 않고 fadeOut 설정일 때 전체 직사각형 알파만 감소한다. 셰리나 LMB/더블링은 종료 전 형태를 유지한 채 페이드아웃. CharacterDescriptionService의 healAmount 참조가 비율형 회복만 찾던 오류를 수정해 고정 amount/amountRef 회복도 인식하도록 변경; 엘린 유령 구체 200 회복과 미아루키 반격 회복 설명이 실제 값으로 표시된다. 전체 tooltip placeholder 감사에서 미지원 토큰 없음 확인.

3.1644: 나남낭 평타 회복 once-per-execution 고착 제거. 스야 안개기습 은신 인식 80 / 빙결 96 분리. 엘린 LMB 툴팁 피해/회복 표기 분리. 뉴 마검 정지 좌표를 owner projectile-state snapshot으로 동기화. 아츠테오 RMB/RMB 설명 및 RMB 호게이지 제거, 품질 표현 제거, 반격 시 일반 원석 인벤토리 전체 충전. 셰리나 비아 평타/스킬 잔향 fadeOut. 리안 방패돌진 사용창 500ms.

3.1643: 아츠테오 원석 품질 단계 제거 및 고정 피해/색상 구조로 단순화. LMB/광석 발견 피해 100, 회전 광석 피해 100 고정, 광석 색상 아츠테오색 고정, 품질 게이지 제거. 광석 발견 범위는 기존 5단계 최대치 104.940375로 고정하고 연속 사용 범위 증폭 제거. 반격 채굴은 별도 counter 원석 링을 만들지 않고 기존 일반 원석 링을 채운다. 리안 방패돌진 비용 150, 타다타 RMB 비용 400, 페이즈/레이즈 점프 이동기에 trajectory.arc 추가, 메이실 LMB 비용 200, 키 추격 파생 공격/상태/설명 제거, 셰리나 비아 LMB 피해 250.

3.1642: 밸런스/버그 수정 17건. 룰리 stage 설명 참조 복구, 셰리나 RMB 잔향을 평타 경로처럼 직선 진행 판정/표현으로 변경, 레테 우편함 회복 10%, 메라 모나/하푸푸 체력 상향, 나남낭 평타 회복 15% 및 설명 참조 보강, 스야 안개기습 범위 +20%, 헤르쟝/대포 체력 1000 및 대포 탄속 +20%, 나레 난이도 3, 프릴 LMB 온라인 근접 판정 기준 보정, 엘린 수호/탐사 비용 150, 뉴 마검 사거리 끝 정지 좌표 스냅, 키네스 기동 출발/도착 피해 50, 가에 디버그 기능 토글 온라인 동기화, 로온 빙수지대 범위 -20%.

3.1641: 나레/나남낭 구조 수정. (1) ProjectileRideService input 조종의 최단각 계산을 JS 음수 %에 의존하는 식에서 atan2(sin Δ, cos Δ) 정규화로 변경해 90도 회전 대신 270도 우회전하는 각도 래핑 오류 제거. (2) 나남낭 LMB 회복을 character damage-dealt 트리거에서 제거하고 일반 근접 LMB와 최대차징 projectile fullSpec 각각에 resource.restore when:'on-hit', recipient:'source', missingResourceRatio:.2, oncePerExecution:true를 직접 배치해 더미/플레이어/온라인 모두 동일 AttackModuleService on-hit 경로 사용. (3) 온라인 network-hit-confirmed에서 CharacterTriggerEffectService damage-dealt를 attack/execution/impact가 null인 선행 호출에서 제거하고 완성된 confirmedDamageContext 이후에 dedupe하여 실행하도록 공통 수정.

3.1640: 이동 몸통공격의 0거리 접촉 판정을 구조적으로 수정. MovementAbilityService.applyPathDamage가 0길이 이동을 버리지 않고 pointContact 세그먼트로 기록하며, 현재 등록된 effect 중 hitMode:'body-contact'만 시작점 원형 접촉 판정을 수행한다. effect가 한 프레임 늦게 등록돼도 registerMovementDamage가 pointContact 세그먼트를 body-contact에 한해 재검사한다. 또한 movement state의 remainingDistance가 시작부터 0인 경우 finish 전에 pointContact를 기록/판정한다. 따라서 적과 완전히 밀착한 라임 돌진/레이카 반격도 실제 이동량 0이어도 1회 피해가 들어가며 일반 이동경로 공격에는 0거리 판정이 추가되지 않는다.

3.1639: body-contact 이동 공격이 적과 완전히 밀착해 충돌 계산 결과 실제 이동거리 0이 되면 applyMovementTrackedDamage가 moved>0 조건에서 피해 판정 자체를 건너뛰던 문제 수정. requireMovementExecution + hitMode:'body-contact'는 이동거리 0이어도 시작점=끝점 접촉 원으로 1회 판정하며, 기존 oncePerExecution 중복 방지는 유지한다. 라임 몸통박치기/어린 슬라임/레이카 반격 등 공통 적용.

3.1638: 이동 몸통공격의 간헐적 피해 누락을 공통 판정 구조에서 수정. movement.move는 실제로 이동한 각 선분을 damagePathSegments에 기록하고, requireMovementExecution effect가 한 프레임 늦게 등록되더라도 registerMovementDamage 시 이미 지나간 선분을 즉시 재검사한다. 따라서 적 충돌로 첫 프레임에 이동이 종료되는 레이카 반격/라임 몸통박치기 등도 effect 등록 순서와 무관하게 실제 이동 경로 교차 시 피해가 보장된다. 기존 oncePerExecution으로 중복 피해는 방지하며 접촉 반경/피해 수치/이동 수치는 변경하지 않았다.

3.1637: 라임 몸통박치기/어린 슬라임 자동 돌진이 적 충돌로 이동이 끝나는 마지막 접촉에서 피해 판정을 놓치던 문제 수정. body-contact contactRadius를 38→44로 조정해 레이카 반격기와 동일한 접촉 여유를 사용하며, passEnemies:false로 실제 적에게 막히는 경우에도 마지막 이동 구간이 피해 판정에 포함된다. 이동거리/피해량/감속/속도는 유지.

3.1636: 델트루브 RMB 광차 넉백을 고정 500px에서 기존 공통 movement.knockback distanceMode:'attack-range-end'로 변경. 투사체 원점 기준 적중 대상의 전방 진행거리를 계산해 attack range 500의 남은 거리만큼만 밀어내므로, 400px 지점 적중 시 약 100px, 100px 지점 적중 시 약 400px만 넉백한다. 벽 충돌 기절/피해/관통/탄속은 유지.

3.1635: 델트루브 RMB 광차의 넉백 거리가 실제 광차 사거리 500보다 긴 1200으로 설정되어 적을 광차 최대 도달거리 이상 밀어내던 오류 수정. movement.knockback distance를 500으로 맞춰 광차 사거리와 넉백 최대 거리를 통일. 피해/탄속/관통/벽 충돌 기절은 유지.

3.1634: 시아넬리 순보 비도가 상대 화면에서 간헐적으로 누락되던 네트워크 패킷 순서 경쟁 수정. action.stationary-projectile-swap-teleport는 로컬에서 선택한 실제 정지 projectile 중심 좌표를 context.targetPoint에 기록해 duel-action에 확정 목적지로 전송한다. 원격 재생 시 해당 목적지 projectile이 아직 action보다 늦게 생성되어 clickTarget이 실패하더라도, 송신자가 resolvedAttackId로 순보 실행을 확정한 경우 전송된 목적지 좌표를 사용해 순보 이동/도착 공격/시전 원위치 leaveProjectile 생성을 그대로 재생한다. consumeTarget:false 구조이므로 목적 projectile 객체 부재 시에도 게임 상태를 임의 삭제하지 않는다.

3.1633: 시아넬리 RMB 순보 스테미나 소모량을 300→200으로 조정. 기타 수치/동작은 변경 없음.

3.1632: 시아넬리 순보가 생성한 비도가 상대 화면에서 즉시 사라지던 버그 수정. swapTeleportToProjectile의 stationary source-pickup 억제가 로컬 권위 source에만 적용되어 원격 replay에서는 새 비도가 시전 원위치의 원격 캐릭터와 겹친 첫 프레임에 150px 자동회수 판정을 받아 제거되고 있었다. 회수 억제는 로컬/원격 source 모두 동일하게 적용하되, 실제 자원 회복/일괄 회수 확정은 기존처럼 로컬 권위에서만 수행한다.

3.1631: CharacterDescriptionService의 일반 {minDamage}/{maxDamage} fallback이 거리 감쇠 모듈을 무시하고 기본 피해만 표시하던 문제 수정. 차징/progressScale이 없는 일반 공격은 기존 attackRangeDamage()를 사용해 damage.range-band-multiplier 누적값까지 반영한다. 시아넬리 LMB 설명은 이제 실제 100~200으로 표시되며 캐릭터 전용 예외는 추가하지 않았다.

3.1630: 시아넬리 LMB 툴팁 피해량 하드코딩 제거. 비도술 설명의 (150~300)을 공통 CharacterDescriptionService의 {minDamage}~{maxDamage} 참조로 교체해 실제 attack.xianelli.lmb 거리 피해 범위(현재 100~200)와 자동 동기화. 전투 수치/동작 변경 없음.

3.1629: 업로드된 3.1628 기준 시아넬리 밸런스 조정. LMB/반격 비도 거리 피해를 150~300에서 100~200으로 하향(3단계 200/150/100), RMB 순보 스테미나 200→300, 쿨다운 300ms→600ms. 반격 툴팁 linkedMinDamage/linkedMaxDamage는 실제 counter-dagger AttackSpec을 계속 참조하므로 100~200으로 자동 동기화.

3.1628: 시아넬리 순보 쿨다운 300ms. 순보 정지 비도의 회수 설정을 정규화 이동 데이터가 아닌 공통 arrival 조회로 읽어 회수 반경/모드/개별 회복량 누락 수정.

3.1627: 시아넬리 순보 비도 회수 경쟁 상태 수정. 순보 시작부터 실제 1ms 이동이 끝날 때까지 source 단위 stationary projectile 자동회수를 잠시 억제하고, 이동 완료 직후 collectReadySourcePickups를 1회 실행해 목적지 150px 안의 모든 비도를 먼저 집계한 뒤 자원 회복 합계를 적용하고 각각 귀환시킨다. 이로써 순보가 남기는 비도가 생성 즉시 원위치에서 회수되어 사라지는 문제와, 순보로 여러 비도를 동시에 회수할 때 일부가 먼저 claimed되어 스테미나가 1개분만 적용되는 경쟁 상태를 제거했다. 일반 접근 회수는 기존 즉시 처리 유지. 시아넬리 RMB 쿨다운 700→500ms.

3.1626: 3.1625 회귀 오류 수정. AttackModuleService.buildAngles(spec,angle) 내부에서 정의되지 않은 volleyAttack 변수를 참조해 모든 해당 발사 경로가 ReferenceError로 중단되던 문제를 수정. 함수 인자로 받은 spec의 spread를 사용하도록 복원했다.

3.1625: 시아넬리 반격 비도/순보 회수 수정. 반격 본체 200 피해와 4발 비도 피해를 분리하기 위해 delayed-projectile-volley에 범용 attackId 참조를 추가하고 attack.xianelli.counter-dagger를 신설했다. counter-dagger는 LMB와 동일한 base 300 + 1/3,2/3 거리 경계 누적 .75,2/3으로 300/225/150 피해를 사용하며 동일 4초 linger/관통/회수 규칙을 따른다. AttackPreviewService도 volley.attackId가 있으면 해당 linked AttackSpec의 projectile/range/pierce를 사용한다. CharacterDescriptionService에 linkedMinDamage/linkedMaxDamage를 범용 추가해 반격 설명에 본체 피해/비도 피해 범위를 실제 데이터로 표시한다. 순보 회수는 이동 완료 직후 예약된 범용 collectReadySourcePickups가 해당 source의 회수 가능 정지 투사체를 모두 모아 resource별 합산 회복 후 각 projectile을 return/finish 처리하므로 순보로 여러 비도를 동시에 먹을 때 +100이 누락되지 않는다. shunpo-dagger의 sourcePickupRequireExit를 제거해 스킬 비도도 일반 비도와 동일 회수 규칙을 사용한다.

3.1624: 시아넬리 비도 후속 수정. (1) 벽 충돌 atWall linger가 beginLinger 직후 ProjectileService.handleWallCollision의 공통 finish/splice로 다시 삭제되던 실제 원인을 수정. resolveWallCollision은 linger 전환 시 'linger'를 반환하고 caller는 projectile을 목록에 유지한다. (2) 반격 4방향 비도 volley의 angleMode:absolute를 제거해 기본 relative 조준각 기준 0/90/180/270도로 회전한다. 미리보기도 같은 상대각을 사용한다. (3) 순보 leave 비도는 생성 순간 시전자와 겹쳐 자동 회수되는 것을 막기 위해 arrival.linger에 범용 sourcePickupRequireExit를 추가. 최초 생성 후 pickupRange 밖으로 한 번 벗어나야 회수 armed 상태가 되며, 이후 150px 안 진입 시 평타 비도와 동일하게 return + 스테미나 회복을 수행한다. 수동 stationary spawn도 canonical linger의 requireExit/armed를 그대로 복사한다. (4) source pickup 판정을 sourcePickupReady() 한 경로로 통일해 restore 선집계와 실제 return 전환이 동일한 armed/range 조건을 사용한다. 순보 consumeTarget:false는 유지되어 스킬이 비도를 직접 삭제하지 않는다.

3.1623: 시아넬리 비도 4종 버그 수정. (1) arrival.linger에 범용 atWall을 지원해 장판 없는 linger 투사체도 벽 접점에서 정지/잔류할 수 있게 하고 시아넬리 LMB/반격 비도에 atWall:true 적용. (2) 순보 hidden 비도 actual/visual radius를 21→15로 통일. (3)(4) stationary source pickup 회복을 개별 update 순서에 맡기지 않고 ProjectileService.update 시작 시 같은 프레임의 모든 회수 대상 비도를 source/resource별로 먼저 합산해 1회 적용하고 각 비도에 pickupRestoreClaimed를 기록하도록 변경. 순보 수동 생성 비도도 canonical sourcePickupRestore를 그대로 사용하므로 +100이 동일하게 적용되며, 여러 비도 동시 회수도 개수×100 정확히 합산된다.

3.1622: 시아넬리 비도 시스템 리메이크. LMB 투사체 실제/시각 반경을 15로 축소하고 적 관통을 적용, 적중 시 멈추지 않고 실제 사거리/벽 착탄 지점에 4초 비도를 남긴다. LMB 연사 500ms, 거리 피해 3단계 300/225/150. 평타/순보/반격 비도는 수량 제한 없이 4초 유지, 선택 점선 150, 소유자 150px 접근 시 즉시 스테미나 100 회복 후 실제 projectile.return 경로로 본체에 귀환한다. 순보 직접 대상 소모를 제거해 목적 비도는 순보 자체가 삭제하지 않고 공통 근접 회수 규칙으로 처리한다. 순보 비용 200, 도착 피해/점선 반경 150. 반격 기존 130 원형 200 피해에 추가로 절대 0/90/180/270도 4방향 비도 투사체를 100ms 간격으로 순차 발사하고, delayed-projectile-volley의 angleOffsets를 읽는 범용 projectile-path 미리보기를 추가했다. 수동 생성 stationary projectile도 canonical linger의 pickup/restore 설정을 그대로 복사하도록 공통 수정.

3.1621: 레이카 타격 가호 충전량 상향. damage-dealt 트리거 reika-gaho-damage-charge의 amountScale을 .03→.04로 변경해 실제 체력 피해 50당 가호 +2(피해량의 4%)를 충전한다. 자연 충전 초당 2.5, 최대치 200 및 기타 가호 로직은 유지.

3.1620: 레테 우편함 우편 수령 시 스테미나 회복량을 최대 스테미나의 10%→15%로 상향. 펠루나 모루 최대 체력을 600→800으로 상향. 로온 LMB 얼린 멜론 투사체 속도를 17→20.4(+20%)로 상향. 레이카 가호 타격 충전 구조는 변경 없음(실제 healthDamage×0.03).

3.1619: 카논 이동 회피 평타 `반동 펀치` 후속타 공격 FX 중복 수정. attack.kanon.recoil-hit의 delivery.area 자동 사각 프레젠테이션을 비활성화하고, 동일 range 180 / halfWidth 60 / wallPolicy:block을 참조하는 명시적 effect.spawn effectShape 사각 FX 하나만 생성하도록 통일했다. 실제 피해 판정/넉백/스테미나 회복/후속타 네트워크 재생 구조는 변경하지 않았다.

3.1618: 시아넬리 평타/순보 비도 크기 통일. LMB delivery.projectile radius/hitRadius와 weapon-projectile style.radius를 20→21로 변경. 순보가 남기는 hidden attack.xianelli.shunpo-dagger도 projectile radius/hitRadius 및 weapon-projectile style.radius를 21로 맞춰 평타/스킬 비도의 실제 판정과 화면상 크기를 동일하게 통일.

3.1617: 이동 몸통공격 사각 경로 FX 누락 공통 수정. 라임 LMB/슬라임 자동공격처럼 requireMovementExecution + hitMode:'body-contact'를 사용하면서 damage.pathPresentation을 따로 선언하지 않은 공격은 EffectSpawnService.appendMovementPathPresentation()이 즉시 false를 반환해 로컬/원격 모두 경로 사각형을 생성할 수 없었다. 이제 body-contact 이동 공격은 pathPresentation이 없어도 contactRadius를 폭으로, 공격/소스 기본색을 색으로 사용하는 공통 fallback 사각 FX를 자동 생성한다. 명시적 pathPresentation이 있는 리안/레이카/유이/클레아/Cyien 등은 기존 설정을 그대로 우선 사용한다. 따라서 라임 평타와 어린 슬라임 자동공격, 같은 구조의 누락 공격도 상대 화면에서 effect-spawn 내장 timeline을 따라 끝까지 표시된다.

3.1616: 온라인 이동 공격 사각 경로 FX를 별도 movement state 패킷에 의존하지 않도록 수정. effect.spawn 생성 시 requireMovementExecution 공격은 이미 시작된 해당 movement state에서 startX/startY/angle/presentationDistance/duration/easing을 damage.remotePathTimeline에 스냅샷한다. 이 값은 기존 effect-spawn presentationSnapshot에 포함되어 상대에게 함께 전송된다. 원격 EffectSpawnService.registerMovementDamage는 remotePathTimeline이 있으면 movement state/패킷 도착 순서/execution state 수명과 무관하게 즉시 movementPathTimeline을 구성하고 사각 pathPresentation을 끝까지 렌더한다. 실제 로컬 이동 종속 피해 판정은 기존 MovementAbilityService executionSequence 검증을 유지한다.

3.1615: 온라인 상대 화면에서 이동 경로 사각 이펙트가 아예 보이지 않던 원인 수정. effect.spawn 패킷이 movement state snapshot보다 먼저 도착하면 registerMovementDamage()가 movement=null로 실패한 뒤 다시 등록되지 않아, 원격 effect의 movementPathTimeline이 영구히 비어 pathPresentation이 한 조각도 생성되지 않았다. applyMovementTrackedDamage()가 원격 movement state를 확인한 뒤 validation/timeline이 아직 없으면 registerMovementDamage(effect)를 재시도하도록 공통 수정. 따라서 패킷 도착 순서와 무관하게 movement snapshot이 도착하는 즉시 사각 경로 이펙트가 실제 이동 시작점부터 종료점까지 생성된다. 실제 피해 판정/로컬 이동 구조는 변경 없음.

3.1614: 이동하며 공격하는 경로 공격의 이동속도를 절격(attack.cyien.rmb-charged)만 제외하고 35% 증가. movement.move에 범용 speedMultiplier를 지원하고 현재 body-contact/requireMovementExecution 기반 이동 공격들에 speedMultiplier:1.35를 선언해 이동거리는 유지한 채 이동시간만 1/1.35로 단축한다. 대상: 리안 방패 돌진, 엘린 유령 돌진, 레이카 일반/가호 반격, 유이 반격, 클레아 일반/달그림자 반격, 라임 몸통박치기/슬라임 자동공격, Cyien 반격. 절격은 기존 속도 유지. 또한 원격 화면에서 이동 경로 사각 이펙트가 state packet 보간/종료 타이밍 때문에 중간에서 잘리던 공통 문제를 수정. MovementAbilityService가 시작 시 충돌 반영 예상 이동거리/각도/easing을 상태에 보존·직렬화하고, EffectSpawnService의 movement path presentation은 원격 캐릭터 좌표 패킷이 아니라 이 확정 movement timeline을 따라 진행률 기반으로 경로를 끝까지 그린다. 실제 피해 판정은 기존 대상 권위의 실제 이동 좌표 추적을 유지해 시각 보정과 분리.

3.1613: 시아넬리 LMB 비도 크기 표시 불일치 수정. 3.1611에서 실제 delivery.projectile radius/hitRadius만 20으로 커졌지만 projectile.presentation weapon-projectile style.radius가 12로 남아 화면상 크기가 그대로였던 문제를 수정. 평타 비도의 시각 radius도 20으로 맞춰 실제 판정 크기와 렌더 크기를 통일.

3.1612: 시아넬리 LMB 거리 피해 감소를 5단계에서 3단계로 단순화. 거리 구간 피해는 200 / 175 / 150. 기존 20/40/60/80% 누적 4단계를 제거하고 1/3, 2/3 지점의 누적 배율 .875 / 6/7 두 단계만 사용한다. 투사체 크기 20은 유지.

3.1611: 시아넬리 LMB 비도 크기와 거리 피해 감소 조정. delivery.projectile radius/hitRadius를 8/10→20/20으로 확대. 거리 피해는 기존 200→175→150→125→100에서 200→187.5→175→162.5→150으로 변경해 전체 감소 범위를 150~200으로 축소.

3.1610: 시아넬리 RMB 순보 밸런스 조정. attack.xianelli.shunpo-hit damageRatio 2→1로 변경해 도착 피해 200→100, attack.xianelli.rmb cost 0→100. 순보 툴팁은 linkedAttack 기반이라 실제 피해가 자동으로 (100) 표시된다.

3.1609: 시아넬리 순보 도착 공격 범위를 비도 주변 선택 점선 범위와 동일하게 통일. 점선 selectionRadius 100에 맞춰 attack.xianelli.shunpo-hit의 range/delivery.area/effect.spawn 반경을 90→100으로 변경.

3.1608: 시아넬리 RMB 순보 스테미나 비용 200→0. 순보 이동/도착 피해/비도 생성 및 유지시간은 변경 없음.

3.1607: 시아넬리 순보 툴팁 형식을 기존 캐릭터 설명 규칙에 맞게 수정. 도착 피해를 숫자 200 하드코딩으로 쓰지 않고 linkedAttack:'shunpoHit' + ({linkedDamage})를 사용해 실제 attack.xianelli.shunpo-hit 피해값을 자동 참조한다.

3.1606: 시아넬리 밸런스/툴팁 수정. 체력 1200→1000, LMB 스테미나 150→100, RMB 순보 스테미나 300→200. 순보 툴팁을 실제 동작에 맞춰 현재 위치에 7초 비도를 남기고 선택한 비도로 순간이동하며 도착 지점에 200 피해를 준다는 내용으로 갱신.

3.1605: 시아넬리 순보로 생성되는 비도 유지시간 5000ms→7000ms. 해당 비도의 기존 ArcGaugePresentationService 잔여시간 호게이지도 동일 duration 값을 사용하므로 7초 기준으로 표시된다. 평타 착탄 비도 유지 규칙은 변경 없음.

3.1604: 시아넬리 체력 900→1200. 순보 성공 시 도착 위치에 baseDamage 100 기준 200 피해(damageRatio:2)를 주는 원형 착지 공격 attack.xianelli.shunpo-hit을 추가. 기존 순보 이동/비도 소모/시전 위치 5초 비도 생성 구조는 유지하며, swapTeleportToProjectile에서 목적지 확정 후 이동 시작과 함께 해당 도착점 geometrySource를 사용하는 범용 area 공격을 실행한다.

3.1603: 시아넬리 LMB 비도 투사체 탄속을 23.4→30으로 조정. 순보용 정지 비도/기타 공격 수치는 변경 없음.

3.1602: 시아넬리 LMB 비도 투사체 탄속 30% 증가. delivery.projectile speed 18→23.4. 순보용 정지 비도/기타 공격 수치는 변경 없음.

3.1601: 타다타 반격 annularDoubleSweep 시각 범위 수정. 실제 counter는 원형 delivery.area를 2회(repeatCount:2) 판정하지만 각 반복 이펙트 span이 Math.PI라 반원만 1회씩 그려지던 오류를 수정해 span:Math.PI*2로 변경. 이제 1타 시계방향 완전한 원 1회, 300ms 뒤 2타 반시계방향 완전한 원 1회를 그린다. 피해/범위/슬로우·속박/반복 간격은 변경 없음.

3.1600: 시아넬리 비도 owner-only 보조 UI 수정. 평타/순보 비도 자체는 모든 화면에 유지하되 StationaryProjectileInteractionService의 선택 점선링(showSelectionRadius)과 소유자 연결선(linkToSource)은 해당 source가 로컬 Training.player이며 로컬 권위를 가진 경우에만 렌더하도록 제한. 상대 화면에서는 비도 본체만 표시되고 점선링/연결선은 보이지 않는다.

3.1599: 델트루브 LMB 최대차징 차막이 설치 비용 700→400으로 조정. 공통 ChargedAttackService 구조는 유지하며 fullCost만 400으로 변경해 스테미나 400에서 100% 차징/설치가 가능하도록 수정.

3.1598: 메후구/나남낭/델트루브 LMB 홀드 기믹을 동일 ChargedAttackService 구조로 통일. 세 캐릭터 모두 기본 공격 하나에 charge.duration/costMin/fullCost/fullSpec을 선언하고 input.press=charge.attack.start, input.release=charge.attack.release를 사용한다. 메후구 fullCost 200, 나남낭 250, 델트루브 700. 따라서 현재 스테미나/fullCost 비율이 최대 차징 상한이 되고 회복에 따라 게이지가 이어서 상승한다. 델트루브의 기존 tapHoldSplit/holdAttackId/lmbInstall/holdTrigger/resource.gte 700/resource.spend 700 경로는 제거. 델트루브 차막이 설치는 fullSpec의 범용 obstacle.wall-deploy Attack module로 이동하고 AttackModuleService.afterAttack에서 로컬 권위만 기존 DynamicWallService.place를 호출한다. 차막이 설치 미리보기도 PointerHoldInputService가 아니라 charge state의 실제 progress==100%를 기준으로 표시하도록 변경.

3.1597: fullCost 차징의 스테미나 연동 상한 추가. charge.fullCost가 있는 release-cost 차징은 시간만으로 100%에 도달하지 않고 현재 사용 가능한 스테미나/fullCost 비율을 차징 상한으로 사용한다. 예: 나남낭 200/250=최대 80%, 225/250=90%, 250/250=100%. 차징 시간이 이미 끝났더라도 스테미나 자연회복에 따라 상한이 실시간 상승해 게이지/미리보기/최종 dynamicSpec이 함께 진행된다. 100% 미만에서 릴리즈하면 기존 최소비용 일반 공격, fullCost를 확보해 100%가 된 경우에만 최대차징 fullSpec이 발동한다. 캐릭터 ID 분기 없이 ChargedAttackService 공통 규칙으로 구현.

3.1596: tapHoldSplit 공통 입력 씹힘 수정. 델트루브 LMB는 탭 평타 비용 100, 홀드 설치 비용 700인데 PointerHoldInputService.press의 holdAvailable은 Trigger 조건만 확인해 자원 소모 모듈까지 검증하지 않는다. 따라서 스테미나 100~699에서도 홀드 분기로 진입한 뒤 startHoldGauge가 700 부족으로 실패했고, 기존 코드는 false로 종료해 사용 가능한 탭 평타까지 씹었다. 이제 tapHoldSplit에서 hold gauge 초기화가 실패하면 입력 상태/잔여 charge state를 정리한 뒤 Training.use(slot)으로 즉시 탭 폴백한다. 캐릭터 ID 분기 없이 공통 수정하므로 동일 tapHoldSplit 경로를 쓰는 엘린/레테에도 같은 원인의 입력 유실을 방지한다.

3.1595: 사이엔 평타 시각 잔존시간 조정. 공격 판정/연사/콤보 타이밍은 변경하지 않고 LMB 1타 arcSweep durationFrames 10→12, 2타 9→12, 3타 botDrill duration 130ms→190ms로 늘려 다른 근접 평타 대비 지나치게 빨리 사라지던 연출만 보정.

3.1594: 시아넬리 비도 owner-only 프레젠테이션 수정. 상대 시아넬리의 평타 착탄 비도는 실제 weapon-projectile 본체만 보이고 생성 순번 숫자는 로컬 소유자 화면에서만 렌더한다. 순보 비도의 5초 호게이지도 소유자 화면에서만 ArcGaugePresentationService로 표시하며 상대 화면에서는 비도 본체만 보인다. 실제 Projectile/점선 연결/클릭 판정/온라인 상태는 변경하지 않음.

3.1593: 시아넬리 비도 UI 수정. 순보 비도 5초 호게이지의 별도 밝은 gaugeColor를 모두 제거하고 시아넬리 본체색 #8b1223을 그대로 사용. 시아넬리 worldGaugeModules에 평타 착탄 비도(xianelli-dagger 그룹) 개수 전용 3칸 gauge.segmented를 추가하고 WorldGaugeModuleService.value에 범용 stationary-projectile-count valueRef를 추가해 스테미나 바 아래 현재 1~3개 수를 표시한다. 순보 비도(xianelli-shunpo-dagger)는 카운트에서 제외.

3.1592: 시아넬리 순보 비도 호게이지/소모 수정. 순보 비도의 5초 잔여시간 호를 StationaryProjectileInteractionService가 직접 ctx.arc로 그리던 중복 구현을 제거하고 기존 공통 ArcGaugePresentationService.render를 재사용하도록 변경. 정지 projectile 자체를 target으로 전달하고 visibility:'all', 공통 lineWidth/시작각/원형 span 규칙을 사용한다. 또한 순보 성공 시 목적지로 선택된 실제 정지 비도를 ProjectileStateService.remove로 즉시 소모하고, 시전 원위치에는 새 5초 순보 비도만 생성되도록 변경했다.

3.1591: 시아넬리 순보 비도 3개 버그 수정. 원인은 StationaryProjectileInteractionService/TargetPointProjectileService가 실제 projectile 생성 인수의 임시 arrival가 아니라 원본 AttackSpec의 delivery.projectile.arrival을 진실원천으로 읽는데, attack.xianelli.shunpo-dagger 원본에는 arrival.linger가 없었던 것. 순보 비도 AttackSpec 자체에 duration 5000, groupKey xianelli-shunpo-dagger, selectionRadius 100, 점선링/소유자 연결/호게이지 interaction을 정식 선언했다. 따라서 순보 비도도 클릭 대상에 포함되고 점선 선택링 및 5초 잔여 호게이지가 동일 공통 데이터에서 표시된다.

3.1590: 시아넬리 순보 비도를 평타 비도와 분리. 평타 적중 비도는 기존 xianelli-dagger 그룹/최대 3개/숫자 표시를 유지하고, 순보 사용 시 시전 위치에 별도 xianelli-shunpo-dagger 그룹의 실제 weapon-projectile을 새로 생성한다. 순보 비도는 평타 3개 제한과 무관하며 5000ms 후 자동 소멸하고, weapon-projectile 둘레에 stationaryArrival 남은 시간 비율을 원형 호 게이지로 표시한다. 순보 대상 탐색은 평타 비도와 순보 비도 두 그룹을 모두 대상으로 하며 선택된 기존 비도는 더 이상 시전 원위치로 이동시키지 않는다.

3.1589: 시아넬리 LMB 사거리 700→500으로 조정. 착탄 정지 비도의 순번 숫자 가독성을 높이기 위해 font 11→16px, 외곽선 3→4px로 확대하고 숫자 색상을 별도 캐릭터색이 아니라 해당 weapon-projectile anchor-cross의 기존 innerColor(기존 + 색상)와 동일하게 사용하도록 변경.

3.1588: 시아넬리 순보/정지 비도 렌더 재수정. 시아넬리 LMB 사거리 700은 듀얼즈 분류상 중거리(<=750) 유지. 순보는 effectsOnly AttackSpec의 after-attack 후처리에 의존하던 경로를 제거하고 AbilityModuleService의 범용 action.stationary-projectile-swap-teleport가 클릭 가능한 정지 projectile을 먼저 확정한 뒤 AttackService.execute로 비용/쿨다운을 정상 처리하고 즉시 같은 projectile과 위치를 교환하도록 변경. 로컬은 현재 마우스 좌표, 온라인 replay는 context.targetPoint를 동일 사용한다. 착탄 비도 weapon-projectile은 anchor-cross의 원형 본체/외곽선 렌더를 그대로 유지하고 정지 numbered 상태에서 중앙 + 두 선만 생략하며, 그 동일 중심에 생성 순번 숫자를 렌더한다.

3.1587: 시아넬리 정지 비도 표시/순보 입력 수정. weapon-projectile anchor-cross 렌더가 stationaryArrival + interaction.numbered인 경우 기존 + 무기 렌더를 그리지 않고 같은 Projectile 중심에 생성 순번 숫자 자체를 렌더하도록 변경해 숫자/투사체 이중표시를 제거. StationaryProjectileInteractionService의 별도 숫자 렌더는 삭제하고 점선 선택범위/소유자 연결선만 담당한다. action.attack의 captureTargetPoint를 fallback 조건 검사보다 먼저 수행하도록 공통 순서를 수정하고 captureTargetPointClampToAttackRange:false 옵션을 추가. 시아넬리 순보는 이 옵션을 사용해 클릭 좌표가 RMB range에 의해 잘리지 않으며 projectile.stationary-clickable 조건과 실제 실행이 동일 context.targetPoint를 사용한다.

3.1586: 시아넬리 순보 온라인 좌표/비도 순서 보정. RMB action.attack에 captureTargetPoint:true를 추가해 로컬 마우스 좌표를 명시적으로 action targetPoint에 싣고 원격 replay의 stationary projectile 선택도 같은 좌표를 사용하게 했다. 순보로 선택한 정지 비도를 시전 원위치로 옮길 때 stationaryArrival.startedAt을 갱신하지 않도록 수정해 비도 번호/생성 순서가 이동 전후에도 유지된다.

3.1585: 시아넬리 비도 구조를 공통 Projectile 규칙으로 재구현. 평타 적중 후 별도 field 표식을 생성하던 xianelli.dagger-place/XianelliDaggerService를 제거하고, 실제 LMB weapon-projectile 자체가 arrival.linger.atTarget + persistent로 정지해 타격판정 없이 남도록 변경. linger에 범용 groupKey/maxInstances/interaction 메타를 추가하고 TargetPointProjectileService.beginLinger가 같은 source/group의 정지 투사체를 최대 개수로 유지한다. StationaryProjectileInteractionService는 정지 weapon-projectile의 번호/선택 점선/소유자 연결선을 데이터 기반으로 렌더하며 번호는 실제 투사체 중심에 정확히 겹친다. 순보는 범용 projectile.stationary-clickable 조건 + action.stationary-projectile-swap-teleport를 사용해 클릭 범위 안에서 마우스와 가장 가까운 정지 투사체 위치로 이동하고 선택된 실제 투사체를 시전 원위치로 옮긴다. 온라인에서도 동일 action replay가 같은 Projectile 객체를 이동시키므로 상대 화면에 정지 비도가 유지된다. 정지 비도는 기존 attack.guard가 ProjectileService.items를 그대로 sweep하므로 방패에 닿으면 공통 제거 패킷으로 삭제된다. LMB 홀드 자동반복 활성화, RMB 비용 300, 반격 피해 200, 설명 변경.

3.1584: 시아넬리 후속 수정. 비도 표식을 생성 순서 기준 1~3 번호로 표시하고 각 비도 주변에 점선 순보 선택 반경을 렌더한다. RMB는 마우스가 비도 선택 반경 안에 있을 때만 사용 가능하며 그 안에서 마우스와 가장 가까운 비도로 순간이동한다. LMB 쿨다운 420→200ms, 스테미나 200→150. 기본 피해 200에서 사거리 진행률 20/40/60/80% 경계마다 누적 배율을 적용해 거리별 200/175/150/125/100 피해. 반격은 delivery.area 자체의 annularDoubleSweep 렌더를 사용해 실제 원형 판정 반경과 이펙트 크기를 단일 진실값으로 통합하고 캐릭터색 #8b1223으로 통일했으며 counter.execute에 무력화 넉백(distance 84/speed 10)을 추가.

3.1583: 시아넬리 선택창 누락 수정. 3.1582에서 XianelliDaggerService/조건/적중 처리만 추가되고 정작 GAME_DATA.characters 안의 xianelli 캐릭터 정의가 삽입되지 않아 CharacterCardDataService/Object.values(GAME_DATA.characters)가 시아넬리를 발견하지 못했다. 시아넬리 캐릭터 정의 전체를 characters 객체의 실제 마지막 항목(델트루브 다음)에 추가해 선택창/훈련장/온라인 캐릭터 목록에서 정상 노출되도록 수정.

3.1582: 시아넬리 추가. 진한 빨강 계열의 기동형 중거리 암살자 시아넬리를 구현했다. LMB 비도술은 비도 투사체 적중 시 착탄 지점에 최대 3개의 비도 표식을 남기며, RMB 순보는 현재 위치에 새 비도를 남기고 조준 위치와 가장 가까운 기존 비도로 순간이동한다(비도가 하나도 없으면 사용 불가). 반격 비도술 오의는 원형 회전 범위 피해를 준다. 표식은 InstalledAreaFieldService의 point field를 재사용해 최대 개수/수명/동기화를 공통 처리하고, XianelliDaggerService 및 on-hit/after-attack 모듈, 조건 `xianelli.dagger-exists`를 추가했다.

3.1581: 델트루브 광차 range-projectile의 내부 원 색상이 이전 밝은 갈색 #e3b06b로 남아 있던 문제 수정. innerColor를 현재 델트루브 전용색 #b5652b로 통일해 외곽/내부 원이 같은 색 계열을 사용한다. 전투 동작/수치 변경 없음.

3.1580: 델트루브 전용 색상을 청록 #4f8fa8에서 어두운 주황 #b5652b로 변경. 캐릭터 본체, 공격, 설치 차막이, 벽 개수 게이지, 본체-벽 연결선, 미니맵 차막이 표시까지 동일 색상으로 통일. 전투 동작/수치 변경 없음.

3.1579: 델트루브 색상/미니맵 표시 수정. 기존 갈색 #c78b45를 다른 캐릭터와 덜 겹치는 청록-보라 계열 #4f8fa8로 변경하고 캐릭터/공격/차막이/게이지/연결선 표시가 동일 색을 사용하도록 통일. DynamicWallService의 설치 차막이를 인게임 미니맵에도 반투명 사각형으로 표시하며, 월드에서의 이동 전용 충돌/공격 비차단 규칙은 그대로 유지.

3.1578: 델트루브 반격 미리보기 실제 범위 불일치 수정. delayed-projectile-volley의 perpendicularOffset 60은 탄 간격 60이 아니라 5발 전체의 최외곽 중심 오프셋 ±60으로 적용되므로 실제 탄 중심은 -60/-30/0/+30/+60이다. 투사체 hitRadius 20을 포함한 실제 공격 전체 반폭은 80이므로 counter previewGeometry halfWidth를 140→80으로 교정해 실제 5발 타격 범위와 일치시켰다.

3.1577: 델트루브 후속 수정. 설치된 동적 차막이 개수를 기존 worldGaugeModules/gauge.segmented 경로로 2칸 게이지에 표시하도록 dynamic-wall-count valueRef를 추가. LMB HOLD 차막이 설치 비용은 설명/실제 모두 700으로 통일하고 charge costMin/costMax 및 resource.spend를 같은 값으로 맞춤. 반격 미리보기는 5개 개별 투사체 경로 표시를 제거하고 실제 5발 전체 폭을 덮는 단일 직사각형 previewGeometry(range 720/halfWidth 140)로 변경. 델트루브 역할군은 탱커→컨트롤러로 변경하고 설명을 `광차를 출발시켜 적을 강제로 밀어버리는 캐릭터`로 교체.

3.1576: 델트루브 후속 수정. 캐릭터 정의를 GAME_DATA.characters의 마지막으로 이동. 차막이 설치 미리보기는 커스텀 갈색 표현을 제거하고 기존 공격 미리보기와 같은 흰 점선/옅은 회색 채움 스타일을 재사용하며 LMB HOLD가 완전히 충전된 이후에만 표시한다. 동적 차막이는 맵 정적 벽과 충돌 책임을 분리해 이동/강제이동만 막고 투사체·히트스캔·LOS·벽채굴 등 공격/월드 레이캐스트는 막지 않는다. 월드에서는 델트루브 색상 반투명 벽으로 별도 렌더하며 로컬 델트루브 자신의 벽에는 설치 순서 1/2를 표시하고 본체와 각 벽 중심을 점선으로 연결한다. 반격은 기존 previewProjectilePaths 공통 기능을 활성화해 실제 5발 평행 탄도와 미리보기를 일치시키고 탄간 간격을 40→60으로 확대. 장거리 movement.neutralize-knockback은 유지하면서 wallImpactStatus를 범용 지원해 벽 충돌 시 1초 기절을 다시 적용하며, 반격 탄환은 적중 시 소멸한다.

3.1575: 델트루브 후속 수정. LMB HOLD 차막이는 현재 맵 tileWorldSize 기준으로 실제 배치 좌표를 타일 중심/경계에 스냅하고, 홀드 중 마우스 위치에 실제 생성 결과와 동일한 1x5 벽 미리보기를 표시한다. LMB 차막이 휘두르기는 직사각형에서 부채꼴 공격으로 변경. RMB 광차 사거리는 1000→500으로 절반 감소. 반격 집어던지기는 일반/벽꿍 넉백을 제거하고 장거리 movement.neutralize-knockback으로 변경했으며, 소르 LMB와 같은 평행 산탄 구조로 5발을 발사한다. 각 반격 투사체는 적중 시 소멸하며 hit.once-per-execution으로 같은 실행에서 대상당 1회만 피해/무력화 넉백을 받는다.

3.1574: 델트루브 입력/반격/광차 수정. LMB HOLD용 attack.deltroove.lmb-install에 공통 charge 데이터를 추가해 tapHoldSplit 홀드 게이지가 정상 시작되도록 하고 짧게 클릭한 LMB도 릴리스 시 정상 평타 실행되게 복구. CounterModuleService는 hit-target의 movement.knockback 중 wallImpactStatus로 실제 CC를 보장하는 모듈을 정식 CC로 인정하도록 범용 확장. 델트루브 반격의 장거리 넉백은 counter.execute.cc 한 경로만 사용해 중복 적용을 방지. 광차는 다즈빈 RMB와 같은 delivery.range-projectile 기반 범위 투사체로 변경하고 projectile.pierce targets/walls를 사용해 적중해도 사라지지 않으며 rehitInterval을 두지 않아 각 대상당 1회만 피해/넉백한다.

3.1572: 실시간 경로 잔향은 피해 수명 동안 표시를 유지하며 FX와 field의 종료 시각을 통일.

3.1571: 방패 접촉 250ms 대기 제거, 루네프 화염구 방어 시 폭발 제거. projectile-path 잔향은 충돌 처리 후 실제 이동 위치로 매 프레임 갱신하며 별도 펼침 타임라인 제거.

3.1570: 지연 후속 공격의 networkReplay 상속 및 공격 효과 생성 권위 통일. 원격 공격은 effect-spawn 복제만 표시하여 직접 생성과 수신 효과의 중복 제거.

3.1566: 캐릭터 전용 TIP 20% 우선 추첨 대상을 캐릭터 선택 화면뿐 아니라 라운드 준비(scr-between)의 실제 활성 `.char-card.sel`까지 확장. 숨겨진 화면의 과거 선택 카드는 무시하고 현재 보이는 화면의 활성 카드만 기준으로 캐릭터 이름 포함 팁을 추첨한다.

3.1563: TIP 라벨과 팁 문구 글자 크기를 한 단계 키워 가독성을 개선. 외곽 박스 없는 텍스트형 UI와 기존 팁 동작은 유지.

3.1565: 캐릭터 전용 TIP 20% 우선 추첨이 동작하지 않던 문제 수정. DuelsTipService가 globalThis.Training을 조회했지만 Training은 전역 프로퍼티가 아니어서 선택 캐릭터 이름을 항상 빈 값으로 읽고 있었다. 이제 캐릭터 선택 화면의 실제 활성 카드 `.char-card.sel[data-id]`를 직접 조회하고 해당 data-id로 GAME_DATA 캐릭터 이름을 얻어 20% 전용 팁 후보를 추첨한다.

3.1562: 인게임 TIP UI의 외곽 박스를 모든 표시 화면에서 완전히 제거. 버튼 본체와 TIP 라벨의 border/background/box-shadow/focus outline을 모두 없애 텍스트만 보이도록 통일했으며 tip.json 로딩, 클릭 전환, 캐릭터 전용 팁 20% 우선 추첨 로직은 유지.

3.1561: 캐릭터 선택(scr-select) 화면에도 인게임 팁을 표시. 팁 클릭 전환 시 현재 선택 캐릭터가 있으면 20% 확률로 해당 캐릭터 이름이 포함된 tip.json 항목을 우선 추첨하며, 일치 항목이 없으면 일반 랜덤으로 폴백.

3.1560: 인게임 팁 표시 대상을 메인/방 생성/방 참가에 더해 게임 시작 증강 선택(scr-start-aug)과 라운드 준비(scr-between) 화면까지 확장. 기존 tip.json 로딩/클릭 전환/UI는 변경하지 않고 동일 컴포넌트를 재사용.

3.1559: 인게임 팁 UI를 최소형으로 단순화. 별도 패널/장식선을 제거하고 기존 UI의 작은 보조 버튼 느낌의 TIP 라벨 + 소형 텍스트만 하단에 표시하도록 수정. GitHub tip.json 로딩/클릭 전환 동작은 유지.

3.1558: 인게임 팁 UI를 Duels 기존 하단 HUD 톤으로 재디자인. 투명 텍스트형 표시를 제거하고 짙은 청색 반투명 패널, 얇은 테두리, 작은 TIP 태그와 좌우 장식선으로 정리했으며 GitHub tip.json 로딩/클릭 전환 동작은 유지.

3.1557: 인게임 팁 서비스 상태 수정. Object.freeze로 동결된 DuelsTipService에서 tips/currentIndex 재대입이 막혀 JSON 로드 후 팁이 숨겨지던 문제를 수정해 서비스 상태를 정상 갱신 가능하게 했다. 팁 UI 위치/대상 화면/클릭 전환/원격 tip.json 구조는 유지.

3.1568: 신규 캐릭터 델트루브 구현. 체력 1500/빠른 이속의 행동제약형 근거리 탱커. LMB 차막이는 전방 근거리 타격, LMB HOLD는 지정지점에 50px 셀 기준 5x1 크기의 동적 차막이를 최대 2개 설치하며 오래된 차막이부터 교체한다. 동적 차막이는 DebugMapService.walls() 공통 벽 목록에 병합되어 이동/투사체/넉백/벽 LOS와 동일 충돌 규칙을 사용하고 duel-state dynamicWalls로 온라인 동기화된다. RMB 광차는 벽/적 관통 투사체로 적중 대상을 긴 거리 넉백시키며 넉백 중 벽 충돌 시 기절한다. 반격 집어던지기는 차막이 투사체 적중 대상을 장거리 넉백시키고 벽 충돌 시 기절한다. movement.knockback에 범용 wallImpactStatus completion을 추가해 캐릭터 ID 분기 없이 벽 충돌 시 상태효과를 적용한다.

3.1548: 카논 툴팁을 사용자 지정 문구로 반영하고 설명 수치 하드코딩을 제거. 끊어치기는 linkedAttack:lmbStoppedSecond를 참조해 범용 {hitCount} 값으로 실제 2타 구조를 표시하며 피해는 타당 {damage}로 표기한다. 발차기/파고들기/높이차기 기절 시간은 각 AttackSpec의 status.apply.duration을 기존 {stunSeconds}로 읽어 표시하므로 수치 변경 시 설명도 자동 동기화된다. 전투 수치/동작은 변경하지 않았다.

3.1530: 방 캐릭터 금지 합의 시스템 추가. 방장은 방 생성 화면의 '캐릭터 금지' 창에서 복수 캐릭터를 선택해 금지 제안을 만들 수 있고, 현재 방의 모든 연결 플레이어가 동의해야 금지가 확정된다. 제안은 room-state에 동기화되고 새 참가자/호스트 승계에도 유지되며, 한 명이라도 거절하면 취소된다. 확정 금지 캐릭터는 최초 캐릭터 선택 화면에는 BAN 표시와 함께 선택 불가로 남고, 랜덤/미리선택/확정 제출에서도 제외된다. 라운드 준비 characterOptions 풀에서는 완전히 제외되어 카드 자체가 등장하지 않으며 서버도 금지 캐릭터 변경 요청을 거부한다. 금지 목록은 같은 방의 매치 종료 후에도 유지되고 방을 나가거나 RoomService.reset 시 초기화된다.

3.1341: 에즈레일 바람지대 너프. 평타 바람포 착탄 및 RMB 반동 도약이 생성하는 ezrail-wind-zone의 지속시간을 6000→4000ms로 줄이고, 1초마다 부여하는 보호막을 최대체력 10%→8%로 낮췄다. 보호막 감소(decayMaxHealthRatio 10%/초), 지대 범위/주기/생성 위치/전투 수치는 변경하지 않았으며 평타 툴팁의 바람지대 지속시간도 6초→4초로 갱신했다.

3.1340: 에즈레일 피해량 통일. Base Damage 100 기준 평타 바람포의 실제 착탄 폭발(lmbExplosion), RMB 반동 도약, 반격 바주카 휘두르기의 damageRatio를 모두 1.5로 변경해 실제 피해량을 각각 150으로 통일했다. 평타 설명은 기존 lmbExplosion 피해 참조 {damage}를 그대로 사용하므로 150으로 자동 갱신된다. 사거리/보호막/바람지대/넉백/이동/쿨다운/비용은 변경하지 않았다.

3.1339: 라운드 사이 모든 플레이어 준비 완료 후 3초+@ 카운트다운 결과 화면의 캐릭터 카드에서도 난이도 행을 제거했다. 기존 선택 중 카드/최초 증강 선택 카드와 동일하게 체력/이동속도/스타일만 표시하며 난이도 데이터 자체와 일반 캐릭터 선택 화면 표시는 유지한다.

3.1338: 증강 선택/획득 결과 카드 규격을 기존 155×96 비율을 유지한 180×112로 소폭 확대하고 시작 증강/라운드 사이/상대 획득 결과가 동일 규격을 사용하도록 통일했다. 최초 증강 선택 화면의 캐릭터 카드는 CharacterCardStatsService 결과에서 난이도 행만 제외해 선택 중 및 모든 플레이어 선택 완료 상태 모두 체력/이동속도/스타일만 표시한다. 에즈레일 바람포 설명에 실제 lmbExplosion 피해량 참조 {damage}를 추가하고 RMB 반동 도약 피해를 baseDamage 100 기준 damageRatio 2(200)로 올려 반격 200과 스킬 피해를 통일했다.

3.1332: 캐릭터 카드 난이도 설정을 파일 고정 콘텐츠로 확정하고 디버그 조작 기능을 제거. 사용자가 배포용으로 저장한 3.1330 (1)의 CHARACTER_DIFFICULTY_DATA 값을 최신 3.1331에 그대로 이식했다. CharacterDifficultyService는 난이도 조회/별 표시만 담당하며 런타임 set/export 기능을 제거했다. 디버그 조작 탭의 카드 난이도 선택/변경/배포 HTML 저장 UI, OnlineDebugControlSyncService의 character-difficulty-set 전역 명령 및 처리 분기를 제거했다. 캐릭터 카드의 난이도 표시 자체는 파일의 CHARACTER_DIFFICULTY_DATA를 그대로 사용한다.

3.1331: 캐릭터 사거리 분류의 실제 LMB 경로 추적 누락 수정. 3.1328 이후 CharacterSortService.lmbAttackEntries가 action.attack만 추적해 action.attack-proximity로 근접/원거리 평타를 선택하는 미아루키의 farAttackId가 후보에서 빠지고 기본 근접 attackId 130px만 남아 초근거리로 오분류되던 문제를 수정했다. action.attack-proximity의 nearAttackId/farAttackId를 모두 일반 LMB 후보로 수집하고, action.attack의 alternateWhen도 실제 조건과 함께 후보에 포함하도록 공통 추적을 보강했다. counter-only 상태 필터, 최대 차징/무제한 도달/착탄 폭발 반경 계산은 기존대로 유지하며 캐릭터별 예외 분기는 추가하지 않았다.

3.1330: 캐릭터 카드 난이도를 런타임 전용 Map override에서 파일 콘텐츠 데이터 CHARACTER_DIFFICULTY_DATA로 승격했다. CharacterDifficultyService.level/set이 동일 데이터를 사용하고 온라인 character-difficulty-set 수신도 이 전역 콘텐츠 데이터를 갱신한다. 디버그 카드 난이도 섹션에 '배포 HTML 저장' 버튼을 추가해 현재 난이도 값을 HTML 내부 CHARACTER_DIFFICULTY_DATA에 직렬화한 새 단일 HTML 파일로 저장할 수 있게 했다. 저장된 HTML을 배포하면 모든 유저가 같은 난이도 기본값을 사용한다. localStorage는 사용하지 않는다.

3.1329: 캐릭터 사거리 분류/정렬의 평타 최대 도달거리 계산에 착탄 폭발 피해 반경을 포함. 실제 LMB 후보 AttackSpec의 기본/최대 차징/실제 투사체 도달거리에서 projectile.impact가 직접 실행하는 후속 AttackSpec 중 delivery.area의 실제 피해 반경을 추가해 최종 최대 사거리로 사용한다. 장판(field.area), 시각 효과 범위, 회복 전용 범위 등은 폭발 피해 사거리에 포함하지 않는다. 예: 에즈레일 평타 600+폭발 110=710, 제리 평타 360+폭발 92=452, 키네스 평타 800+폭발 100=900, 엘린 평타 1100+폭발 104=1204. 카드 사거리 표시/전투 스타일/긴·짧은 사거리 정렬은 동일 basicRange를 사용하며 기존 일반 LMB 후보 필터, 반격 전용 LMB 제외, 최대 차징, 무제한 도달거리, 정렬 저장 규칙은 유지. 캐릭터 ID 예외 분기 없음.

3.1328: 캐릭터 사거리 분류의 평타 후보 판정을 실제 LMB 입력 경로 기준으로 교정. 3.1325~3.1327은 `평타` 태그가 붙은 모든 AttackSpec을 후보로 사용해 반격 후에만 열리는 인투 저격총, `스킬+평타` 파생 공격, 소환수/후속 평타까지 사거리 계산에 섞일 수 있었다. CharacterSortService는 이제 abilities.lmb의 기본 attackId와 action.attack alternates가 직접 선택하는 AttackSpec만 평타 후보로 수집하고, `반격`/`스킬`/`소환수` 태그는 제외한다. 또한 반격 Ability/반격 AttackSpec이 생성하는 state.window/state.progress/mode 상태 중 다른 일반 공격·능력에서는 생성되지 않는 counter-only state를 계산하고, 그런 상태를 필요로 하는 LMB alternate는 분류 후보에서 제외한다. 따라서 인투의 attack.intu.sniper는 `intu-sniper` 상태가 반격 저격탄에서만 생성되므로 제외되고 권총 650px/산탄총 600px 중 최대 650px 기준 중거리로 유지된다. 반면 일반 LMB 모드·콤보·성장 단계처럼 반격 전용 상태에 종속되지 않은 직접 LMB 대체 공격은 그대로 후보에 남는다. 기존 최대 차징/실제 무제한 도달거리 계산과 정렬 저장은 유지. 캐릭터 ID 예외 분기 없음.

3.1334: 캐릭터 카드 렌더 단일화. 캐릭터 선택과 라운드 준비가 별도 DOM 생성/CSS 경로를 사용해 준비 화면 카드가 최신 세로형 카드와 다르게 보이던 문제를 수정했다. CharacterCardViewService를 추가해 tooltip/icon/name/stats/레코드 스타일/공통 interaction/portrait 부착을 한 곳에서 생성하고 두 화면이 동일 빌더를 재사용한다. 최신 세로형 카드의 타이포그래피·레이아웃·초상 배경·hover 스타일도 #scr-select 전용에서 #scr-between #between-char-grid까지 동일 적용한다. 화면별 선택 처리와 팀 preview 동작은 기존 로직 유지.

3.1327: 캐릭터 사거리 분류/정렬의 '평타 최대 도달거리' 계산을 전수 보강. CharacterSortService.attackMaxRange가 기본 range만 보지 않고 progressScale.range 및 range moduleValues의 from/to, charge.range의 from/to, charge.fullSpec의 완전 충전 AttackSpec까지 재귀적으로 읽는다. 따라서 레이즈는 최대 차징 192px, 큐리는 최대 진행 300px, 메후구는 완전 차징 220px, 나나므낭은 완전 차징 600px을 기준으로 분류된다. delivery.projectile이 targetPoint:true이면서 targetPointClampToAttackRange:false인 평타는 실제 목표점이 AttackSpec.range에 제한되지 않으므로 무제한 도달로 취급하며 레비나는 초장거리로 분류된다. 명시적 range:Infinity 평타도 더 이상 finite 필터에서 탈락하지 않고 초장거리로 처리되어 티냐가 정상 분류된다. 카드 스타일 표시/전투 스타일 정렬/긴·짧은 사거리 정렬은 모두 동일 CharacterSortService.basicRange 진실원천을 계속 사용한다. Infinity끼리 정렬할 때 `Infinity-Infinity`가 NaN이 되던 비교식도 명시적 동률 처리로 교정해 출시 순서 안정 정렬을 유지한다. 캐릭터 ID 예외 분기 없음.

3.1326: 캐릭터 카드 사거리 표시와 정렬 판정 진실원천 통일. 3.1325의 CharacterSortService.primaryAttacks가 CharacterCardDataService 래퍼(character.combat)만 처리하고 CharacterCardStatsService가 직접 넘기는 GAME_DATA.characters 전투 데이터(character.attacks)는 처리하지 못해, 정렬은 새 최대 평타 사거리를 쓰면서 카드 스타일 표시는 과거 styleLabel로 되돌아가는 문제가 있었다. primaryAttacks가 래퍼/전투 데이터 양쪽 모두에서 동일 combat 객체를 해석하도록 수정해 카드 표시·전투 스타일 분류·긴/짧은 사거리 정렬이 모두 같은 '평타 중 최대 도달 사거리' 기준을 공유한다. 미아루키는 lmbRanged 700px 기준 중거리로 카드에도 표시된다. 캐릭터별 예외 분기/새 서비스 없음.

3.1325: 캐릭터 선택 거리 분류/정렬 기준 및 정렬 유지 수정. 거리 분류와 긴/짧은 사거리 정렬은 더 이상 attacks.lmb 단일 키나 과거 styleLabel의 고정 거리 단어를 기준으로 하지 않는다. 캐릭터의 모든 AttackSpec 중 `평타` 태그가 붙은 공격을 조회하고, 각 평타의 기본 range·delivery module range·charge.range.from/to 중 실제 가장 길게 나갈 수 있는 최대 사거리를 공통 기준으로 사용한다. 카드 스타일의 거리 단어도 이 값과 GAME_DATA.ranges 기준으로 동적 교체한다. 따라서 근접/원거리 평타가 별도 AttackSpec인 미아루키는 lmbRanged 700px 기준 `중거리`로 분류된다. 선택한 정렬 모드는 CharacterSortService가 localStorage에 저장/복원해 다음 실행에서도 그대로 유지한다.

3.1324: 캐릭터 선택 정렬 기능 추가. 캐릭터 선택 제목 아래에 정렬 드롭다운을 추가하고 출시 / 높은 레코드 / 낮은 레코드 / 전투 스타일 / 긴 사거리 / 짧은 사거리 / 역할군 7개 모드를 제공한다. 정렬 책임을 기존 카드 렌더/스탯/레코드 서비스에 섞지 않기 위해 재사용 가능한 CharacterSortService를 추가했다. 출시 순서는 CharacterCardDataService.all()의 원본 GAME_DATA.characters 삽입 순서를 기준으로 유지한다. 레코드 정렬은 현재 AccountState의 CharacterRecordService.points()를 사용하며 동점은 출시 순서로 안정 정렬한다. 사거리 정렬은 평타 LMB의 최초 기본 사거리를 사용하며 차징 공격은 기존 거리 분류 규칙과 동일하게 charge.range.from을 우선한다. 전투 스타일은 styleLabel의 거리/역할 토큰을 제외한 성향을 그룹화하고, 역할군은 GAME_DATA.characterRoleTags/tags를 재사용한다. 정렬 변경 시 선택 상태/툴팁/레코드/온라인 캐릭터 미리보기는 유지한 채 카드 DOM만 새 순서로 재배치한다.

3.1323: 캐릭터 일러스트 설정 OFF 시 기존 원형 아이콘 복구. 캐릭터 카드의 char-icon을 무조건 숨기던 세로형 카드 CSS를 설정 상태 기반으로 변경했다. DisplaySettings.syncUi가 html[data-character-card-illustrations]에 현재 설정을 반영하며, ON일 때만 초상 레이어를 사용하고 원형 아이콘을 숨긴다. OFF일 때는 초상 레이어를 숨기고 기존 CharacterCardColorService가 생성하는 60px 원형 char-icon을 카드 상단 이미지 영역 중앙에 다시 표시한다. 설정 토글 시 CharacterCardPortraitService.sync와 dataset 갱신이 즉시 적용되므로 화면 재진입 없이 전환된다. 새 모듈 추가 없음.

3.1322: 캐릭터 카드 세로형 2:3 리디자인. 3.1316~3.1321의 가로형 카드 구조를 폐기하고 기존 Duels의 세로 카드 감각으로 되돌렸다. 캐릭터 카드는 160×240px(2:3)로 통일하고 상단에 초상, 하단에 이름/체력/이동속도/스타일/난이도를 배치한다. 초상은 카드 상단 전체 폭을 사용하며 CharacterCardPortraitService의 기존 얼굴 위치 탐지값을 다시 직접 반영해 인물 중심을 잡고, 하단으로 갈수록 어두워지는 세로 페이드로 정보 영역과 연결한다. 한 줄 10명 배치를 유지하기 위해 선택 화면 최대 폭을 1690px(160×10 + gap 10×9)로 조정했다. 시작 증강/라운드 사이 캐릭터 카드와 MatchSelectionLayoutService 카드 폭도 160px 기준으로 통일했다. 난이도 ★/☆, 디버그 난이도 수정/온라인 동기화는 유지.

3.1321: 캐릭터 카드 초상 우측 편향 보정. 기존 3.1320은 CharacterCardPortraitService의 얼굴 탐지 결과를 사용하긴 했지만 `focus.x + 22` 후 58~90으로 좁게 clamp하여 실제 유효 이동폭이 작았고, 결과적으로 얼굴이 중앙보다 조금 오른쪽 정도에만 머무는 경우가 많았다. 이번 수정에서는 탐지값을 더 직접 반영하도록 x 매핑을 `focus.x*0.75 + 42` 기반으로 재설계하고 범위를 68~96으로 넓혀, 얼굴이 카드 우측 초상 영역 안에서도 더 오른쪽에 안정적으로 오도록 조정했다. 기본 fallback 포커스도 72%→82%로 올리고 배경 확대도 126%→132%로 높여 약간 더 과감하게 크롭한다. y축은 기존처럼 약한 보정만 유지한다.

3.1320: 캐릭터 카드/난이도 디버그 후속 수정. character-difficulty-set을 Entity 대상이 필요 없는 전역 debug-control 명령으로 승격해 인게임 Entity가 없는 메인/로비에서도 난이도 버튼이 즉시 동작하도록 수정했다. 온라인에서는 targetId/targetPid 없이도 duel-debug-control로 송신되고 수신 측도 대상 Entity 해석 전에 전역 명령을 적용하므로 참가자 전체 화면에 동일 난이도가 반영된다. 캐릭터 카드는 높이를 148→132px로 줄이고 텍스트 영역을 왼쪽, 초상 이미지를 오른쪽으로 완전히 반전했다. 기존 CharacterCardPortraitService의 얼굴 위치 감지는 그대로 사용하며 감지된 얼굴 좌표에 우측 배경용 보정을 더해, 오른쪽 초상 영역 안에서도 얼굴이 상대적으로 왼쪽(정보 쪽)에 오도록 배치한다. 페이드 mask/overlay 방향도 반대로 뒤집어 이미지가 왼쪽 텍스트 영역으로 자연스럽게 사라지도록 수정했다.

3.1319: 캐릭터 카드 후속 정리. 초상화는 CharacterCardPortraitService의 기존 얼굴 위치 감지를 그대로 사용하되 attach 단계에서 감지된 x 좌표를 그대로 받아 좌측으로 한 번 더 오프셋해 '얼굴은 왼쪽, 정보는 오른쪽' 구도가 안정적으로 나오게 조정했다. CharacterCardStatsService는 3.1318의 전투 방식/사거리/역할군 분리를 되돌려 다시 체력/이동속도/스타일/난이도 4행만 표시한다. 난이도는 문자열 대신 ★/☆ 5칸으로 렌더되며, CharacterDifficultyService를 새로 추가해 캐릭터별 난이도 override를 관리한다. 캐릭터 데이터는 Object.freeze 상태이므로 원본을 직접 수정하지 않고 별도 Map으로 관리하며 카드 렌더/갱신에서 공통 참조한다. 디버그 조작 탭에는 '카드 난이도' 섹션을 추가해 캐릭터를 선택하고 1~5단계 난이도를 즉시 변경할 수 있게 했고, OnlineDebugControlSyncService에 character-difficulty-set 명령을 추가해 온라인에서도 모든 참여자 화면에 같은 값이 동기화되게 했다. 카드 우측 정보행은 grid 정렬을 제거하고 `<b>라벨</b>: <span>값</span>` 인라인 흐름으로 바꿔 콜론이 자연스럽게 배치되도록 수정했다.

3.1318: 캐릭터 카드 후속 리메이크. 우측 정보의 '스타일' 1줄을 전투 방식/사거리/역할군으로 분리하고 난이도는 유지했다. CharacterCardStatsService에 splitStyle을 추가해 styleLabel에서 알려진 사거리 토큰(초근거리/근거리/중거리/원거리/초장거리)을 추출하고 나머지를 전투 방식/역할군으로 분해한다. 카드 높이는 148px로 소폭 늘리고 통계 텍스트 밀도를 조정했다. 초상화는 다시 얼굴 중심 보정을 사용하되, 이전처럼 중앙으로 몰리지 않도록 CharacterCardPortraitService.focus 결과를 왼쪽 편향 좌표로 변환해 적용한다. 초상 레이어는 full-card 배경 대신 138px 너비의 좌측 전용 영역으로 제한하고 background-size:auto 126%로 약간 확대/크롭, mask와 overlay gradient를 강화해 잘린 가장자리가 보이지 않도록 수정했다. 결과적으로 얼굴이 카드의 왼쪽 쪽에 배치되고 오른쪽 정보 영역으로 자연스럽게 페이드된다.

3.1317: 캐릭터 카드 가로형 리메이크 후속 수정. 초상 이미지가 CharacterCardPortraitService.focus 기반으로 다시 중앙 쪽으로 재정렬되면서 '왼쪽에 붙지 않고 중앙에 뜨는' 문제가 있었고, CSS도 background-size:cover라 인물이 잘리고 있었다. 카드 초상 레이어를 background-size:contain + background-position:left center로 바꾸고 attach 단계에서 자동 포커스 재배치를 제거해 항상 왼쪽 정렬/전체 이미지 표시가 되도록 수정했다. hover/loaded 스케일도 contain 모드에 맞게 낮춰 흔들림과 과한 확대를 줄였다. 또한 캐릭터 색상 겹침 완화를 위해 타다타 color를 더 밝은 녹색(#2f7a40), 셰리나 비아 color를 더 밝은 보라색(#6a36c9)으로 조정했다.

3.1316: 캐릭터/증강 카드 가로형 리메이크. 캐릭터 카드는 222×138 가로 비율로 변경하고 기존 CharacterCardPortraitService 초상 레이어를 왼쪽에 배치해 오른쪽으로 갈수록 mask/gradient로 흐려지도록 수정했다. 오른쪽에는 이름, 체력, 이동속도, 스타일, 난이도를 표시한다. 기존 캐릭터 데이터에는 난이도 필드가 없으므로 CharacterCardStatsService가 difficultyLabel/difficulty를 우선 사용하고 없으면 '보통'으로 표시한다. 증강 선택 카드는 300×96 가로형으로 바꾸고 왼쪽 아이콘/이모지, 오른쪽 증강 이름과 효과 설명만 보이도록 희귀도 텍스트는 숨겼다. 시작 증강/라운드 사이/훈련장 증강 카드에 동일한 방향성을 적용했다. 카드 선택/우클릭 레코드/초상 이미지 로딩/증강 선택 로직은 기존 시스템을 그대로 재사용했으며 새 모듈 추가 없음.

3.1315: 레이즈 반격기 차징 소모 추가. 카운터 펀치는 기존과 동일하게 반격 사용 시점의 raise-punch-charge 0~15 값을 progressScale로 먼저 읽어 피해 100~600 / 범위 80~320을 계산한 뒤, 공격 실행 후 state.progress operation:'reset'으로 raise-punch-charge를 0으로 초기화한다. 기존 +4 충전은 다시 추가하지 않았으며 반격 피해/범위 스케일 자체는 3.1313 값 유지.

3.1314: 캐릭터 선택 화면 10열 배치. 기존 카드 폭 138px과 간격 10px은 유지하고, #scr-select .char-grid 최대 폭을 8장 기준 1174px에서 10장 기준 1470px(138*10 + 10*9)로 확대해 한 줄에 최대 10명의 캐릭터가 배치되도록 변경했다. 캐릭터 카드 자체 크기/내용/선택 효과는 변경하지 않았다.

3.1313: 레이즈/칸 반격기 리메이크. 레이즈 카운터 펀치의 기존 +4 충전/boost 부여 모듈을 제거하고, 현재 raise-punch-charge 0~15 차징률에 비례해 피해 100~600(baseDamage 100, damageRatio 1→6), 범위는 기존 160의 50%~200%인 80→320으로 선형 증가하도록 기존 progressScale을 재사용했다. 칸 역류는 progressScale의 consumeOnCounterStart를 제거해 악식 게이지를 더 이상 소모하지 않으며, 피해량을 400~800에서 200~400(baseDamage 100, damageRatio 2→4)으로 낮췄다. 칸의 기존 악식 비례 범위 104→364는 유지한다. 각 툴팁도 새 동작에 맞게 수정. 새 모듈 추가 없음.

3.1312: 에즈레일 반동 도약 지정거리 오류 수정. action.attack captureTargetPoint는 movement.move.distance가 아니라 선택된 prepared AttackSpec.range를 최대 지정거리로 사용한다. 에즈레일 RMB는 이동 distance가 240인데 AttackSpec.range가 130이라 마우스 지정점이 130px에서 먼저 clamp되고 있었다. attack.ezrail.rmb.range를 130→240으로 맞춰 지정 가능 최대거리와 실제 점프 최대거리 240을 통일했다. 시전 지점의 실제 피해/넉백 판정은 delivery.area.range 130을 그대로 유지하므로 공격 범위는 늘어나지 않는다. 새 모듈 추가 없음.

3.1311: 에즈레일 반동 도약 지정지점 이동. RMB 반동 도약의 movement.move 방향을 고정 조준방향 attack에서 기존 범용 target-point 방식으로 변경하고, ability.ezrail.rmb의 action.attack에 captureTargetPoint:true를 추가했다. 최대 이동거리는 기존 240을 유지하므로 마우스로 지정한 지점이 240 이내면 그 지점까지, 더 멀면 240 거리까지만 점프한다. 바람지대는 기존대로 이동 전 시전 지점에 생성되며 도약 높이/무적/피해/넉백/스테미나/쿨다운은 변경하지 않았다. 새 모듈 추가 없음.

3.1310: 에즈레일 평타 사거리 조정. 바람포 사거리를 700→600으로 감소. 중거리 분류 및 나머지 수치/기믹은 유지.

3.1309: 에즈레일 사거리/역할 분류 조정. 평타 바람포 사거리를 780→700으로 줄여 듀얼즈 중거리 기준(≤750px)에 들어오도록 변경하고, styleLabel을 '지속전투형 원거리 서포터'에서 '지속전투형 중거리 서포터'로 수정했다. 피해/탄속/바람지대/보호막/스킬/반격 수치는 변경하지 않았다.

3.1308: 에즈레일 바람지대 지속시간 및 피해 수신 트리거 기준 수정. 에즈레일 평타/반동 도약 바람지대 duration을 12000→6000ms로 변경하고 툴팁도 6초로 갱신했다. 공용 damage-received 이벤트는 보호막이 대신 흡수해 실제 healthDamage가 0인 경우 실행하지 않도록 변경했다. CharacterTriggerEffectService의 대상 damage-received와 AugmentEffectModuleService의 대상 damage-received 모두 healthDamage>0일 때만 실행된다. 따라서 가시갑옷/버서커/에라 파비 같은 '피해를 받으면' 기믹은 보호막 체력만 감소했을 때 발동하지 않고 실제 본체 체력이 감소한 경우에만 발동한다. damage-dealt, 피격 판정, 보호막 흡수, CC 처리 자체는 변경하지 않았다. 새 모듈 추가 없음.

3.1307: 에즈레일 바람지대 지속시간 호 게이지 추가. 로온 빙수 지대와 동일한 areaCircle remainingArcGauge 표현을 재사용해 평타/반동 도약이 생성하는 바람지대 외곽에 12초 남은 지속시간을 표시한다. 바람지대 판정/보호막/지속시간/생성 위치는 변경하지 않았다. 새 모듈 추가 없음.

3.1306: 에즈레일 바람지대 개수 제한/지속시간 조정. 평타와 반동 도약이 생성하는 `ezrail-wind-zone`의 maxInstances:5 제한을 제거하고 duration을 12000ms로 변경해 개수 제한 없이 각각 생성 후 12초간 유지되도록 수정했다. 평타 툴팁의 '최대 5개' 문구도 제거하고 12초 유지로 갱신했다. 보호막 부여 주기/감소 규칙/생성 위치/기타 전투 수치는 변경하지 않았다.

3.1305: 에즈레일 반동 도약/반격 연출 조정. 반동 도약 이동거리를 180→240으로 증가. 반격 annularDoubleSweep은 레이카 RMB와 같은 startAngleOffset:Math.PI를 적용해 조준 반대 방향에서 시작하며, sweepFraction을 .28→.75, durationFrames를 18→30으로 조정해 회전 진행을 더 느리고 길게 보이도록 변경했다. 반격 범위/피해/CC 및 도약 높이/방향은 유지. 새 모듈 추가 없음.

3.1304: 에즈레일 보호막/반동 도약/반격 연출 수정. 바람지대 보호막은 매 1초 부여 시 ShieldService의 기존 decayStartDelay=1000 스케줄을 새 획득 시점 기준으로 다시 시작하도록 3.1303의 preserveDecaySchedule 확장을 제거했다. 따라서 보호막 획득 직후 1초 동안은 감소하지 않으며, 지대 안에서 1초마다 계속 보호막이 적용되는 동안에는 적용이 감소보다 우선되어 decay가 발생하지 않고 지대를 벗어난 뒤 마지막 획득 1초 후부터 감소한다. 반동 도약 이동 방향을 opposite-aim에서 attack으로 변경해 조준 방향으로 이동하고 trajectory.arc 높이를 105→150으로 높였다. 반격기의 별도 effect.spawn 원형 이펙트를 제거하고 기존 공용 annularDoubleSweep을 사용해 시계방향 1회전 휘두르기 연출로 변경했다. 반격 피해/범위/CC/선딜은 유지. 새 모듈 추가 없음.

3.1303: 에즈레일 6개 수정. 캐릭터/공격 주색을 기존 하늘색 #5bb9ff에서 기존 캐릭터와 겹치지 않는 남색-흰색 중간의 슬레이트 블루 #6f82a8 계열로 변경. 바람지대 duration을 네트워크 안전한 문자열 'infinite'로 변경해 시간 만료 없이 유지하고 maxInstances 5 초과 시 기존 InstalledAreaFieldService가 가장 오래된 지대를 제거한다. 평타 바람지대는 lmbExplosion의 projectile impact targetPoint를 쓰는 anchorMode:'target-point'로 변경해 실제 탄착점에 생성하며, 반동 도약 바람지대는 anchorMode:'self'로 변경해 이동 전 시전 위치에 생성한다. 바람지대 보호막은 1초마다 최대체력 10%를 부여하면서 1초 후부터 매초 최대체력 10%씩 감소하도록 decay 옵션을 추가했다. 반복 부여가 decay nextTickAt을 매번 뒤로 미뤄 감소가 영원히 발생하지 않는 문제를 막기 위해 기존 ShieldService.grant에 재사용 가능한 preserveDecaySchedule 옵션을 추가하고 field.area resource.restore가 이를 전달한다. 반동 도약은 기존 제리/라임이 쓰는 trajectory.arc + movement.move 구조를 재사용해 360ms 곡선 도약, 이동 중 회피 무적, 벽/적 통과로 변경했다. 반격기는 CounterModuleService 필수 CC 규칙에 맞춰 기존 movement.neutralize-knockback 최소 넉백을 cc로 부여해 300ms 선딜 후 정상 실행되도록 수정. 새 모듈 추가 없음.

3.1302: 에즈레일 추가 및 장판 보호막 부여 확장. GAME_DATA.characters에 에즈레일(바람의 인도자)을 추가했다. 평타 바람포는 착탄 폭발과 함께 최대 5개의 바람지대를 생성하고, 반동 도약은 주변 적에게 피해/넉백 후 짧게 뒤로 도약하며 같은 바람지대를 남긴다. 바람지대는 self/ally에게 1초마다 최대체력 10% 보호막을 부여하며 여러 지대 중첩이 가능하되 기존 ShieldService 상한 때문에 각 대상의 보호막은 자신의 maxHealth를 넘지 않는다. 작동을 위해 InstalledAreaFieldService.onTrigger의 resource.restore가 health/stamina뿐 아니라 shield 및 maxResourceRatio/missingResourceRatio/decay 옵션을 공통 지원하도록 확장했다. CharacterTitleService에 에즈레일 칭호 '바람의 인도자'를 추가했다.

3.1301: 페이즈 최대체력 시 평타 연사속도 조정 방향 수정. 이전 3.1299에서 20% 느려지도록 350→437.5ms로 잘못 적용했던 값을 되돌리고, 최대체력 기준 연사속도가 20% 빨라지도록 cooldown을 350→280ms로 변경했다. health-ratio-cooldown-scale의 minCooldown 70ms는 유지한다. 다른 밸런스 변경 없음.

3.1300: 인투 무기 종류별 탄속 통일. 인투 공격 데이터를 전수 확인한 결과 권총 계열(pistol/pistol-swap/pistol-return)은 모두 speed 20, 산탄총 계열(shotgun/shotgun-swap/shotgun-return)은 모두 speed 40으로 이미 통일되어 있었다. 저격총만 일반 sniper 45.6 / counter sniper 59.28로 달랐으므로 가장 빠른 값 59.28로 통일했다. 따라서 최종 무기별 탄속은 권총 20, 산탄총 40, 저격총 59.28이다. 사거리/피해/쿨다운/기타 로직 변경 없음.

3.1299: 밸런스 조정. 큐리 LMB 스테미나 150→300. 로온 RMB 스테미나 1000→800, LMB 탄당 피해 150→200(baseDamage 150, damageRatio 4/3). 페이즈 최대체력 기준 LMB 연사속도 20% 감소: cooldown 350→437.5ms, 저체력 최소 cooldown 70ms 유지. 메이실 반격 투척/귀환 피해 타당 300→200(baseDamage 150, damageRatio 4/3). 소르 공격에 존재하는 방전 지속시간 500→750ms. 레이즈 최대체력 1200→1300. 루네프 LMB/연쇄 LMB 스테미나 200→100. 인투 저격총 및 반격 저격탄 탄속 20% 증가(38→45.6, 49.4→59.28). 인투 산탄총 normal/swap/return 사거리 300→600, 탄속 20→40(권총 탄속의 2배). 새 모듈 추가 없음.

3.1298: 마스터 I~V 레코드 기준 조정. 마스터 I 12000 / II 14000 / III 16000 / IV 18000 / V 20000으로 변경했다. 마스터 진입 기준 12000과 다른 티어 기준/보상/표시 로직은 변경하지 않았다.

3.1297: 키네스 캐릭터 설명 문구 띄어쓰기 수정. `화염술사 캐릭터`를 `화염 술사 캐릭터`로 변경했다. 전투 로직 변경 없음.

3.1296: 캐릭터 설명 문구 수정. 키네스 설명 끝을 `화염술사 캐릭터`, 하푸푸 설명 끝을 `친구 캐릭터`로 변경했다. 전투 데이터/스킬/수치 변경 없음.

3.1295: 키네스 스킬 표시 이름 변경. `화염 마법→화염구`, `조작의 마법진→조작의 화염`, `기동의 마법진→기동의 화염`, `방출의 마법진→방출의 화염`, `보호의 마법진→보호의 화염`, `작열의 마법진→작열의 화염`. 공격 ID/수치/동작 변경 없음.

3.1294: 키네스 조작의 마법진 사용 조건 수정. 기존 범용 `action.directional-trigger-attack` 모듈에 방향별 선택 조건 `conditionsByDirection`을 추가했다. 새 모듈은 만들지 않았으며 기존 TriggerConditionService/TriggerModuleService 조건 판정 체계를 재사용한다. 키네스 RMB UP(조작의 마법진)은 `kines-fireball` 상태에 실제 `attack.kines.lmb` 평타 투사체가 존재할 때만 공격 실행 단계로 진입한다. 투사체가 없으면 입력은 소비되지만 AttackService.execute를 호출하지 않으므로 조작 마법진의 스테미나 300과 쿨다운 900ms가 소모되지 않고, 후속 projectile.detonate도 requireExecuted 조건 때문에 실행되지 않는다. 온라인에서는 실행되지 않은 입력은 기존 Training.use 경로상 ability 패킷도 전송하지 않는다. 좌/하/우 방향 스킬은 기존과 동일.

3.1293: 키네스 방출의 마법진 툴팁 설명에서 넉백 문구 제거. 실제 넉백 효과는 이미 제거되어 있었으나 설명에 `넉백`이 남아 있어 문구만 정리했다. 전투 로직 변경 없음.

3.1292: 도움말 버프기 영문 상태 색상을 실제 인게임 BuffStatusPresentation 기준으로 전수 정렬. SHIELD는 기존 도움말의 rgb(207,239,255)가 실제 인게임 `BuffStatusPresentation.styles.shield.rgb`와 이미 동일해 유지했다. STEALTH는 평상시 실제 표시색 rgb(245,245,255)로 수정하고(로컬 플레이어가 적에게 발각됐을 때만 런타임에서 rgb(255,77,77)로 변함), WALL PASS는 실제 rgb(110,255,220)로 수정했다. 그 외 DMG/DEF/SPD/REGEN/STAM/ATK SPD/BULLET SPD/DODGE/HEAL/MAX HP/MAX STAM/PROJ SIZE/INVUL 계열도 모두 실제 styles 또는 인게임 fallback 색과 대조해 동일함을 검증했다. 전투 로직 변경 없음.

3.1291: 도움말 버프기 목록에 STEALTH/WALL PASS 항목 추가. `은신 STEALTH`는 적의 화면과 미니맵에서 투명해지며 이동을 제외한 행동, 피격, 일정 거리 내 적 존재 시 일시적으로 발각된다는 설명을 추가했다. `벽 통과 WALL PASS`는 벽을 지나다닐 수 있다는 설명을 추가했다. 전투 로직 변경 없음.

3.1290: 3.1289 출혈 받는 피해 증가 제거 후 발생한 CCService.isDotImpact 누락 오류 수정. 3.1289에서 bleed 전용 incomingDamageMultiplier를 제거하면서 그 함수가 사용하던 범용 `CCService.isDotImpact()` 유틸까지 함께 삭제했지만, 다른 런타임 경로가 DOT 여부 판정에 이 유틸을 계속 참조하고 있어 TypeError가 발생했다. `isDotImpact()`만 원래 범용 유틸로 복구하고, 출혈의 directDamageTakenExtraRatio/incomingDamageMultiplier/statusIncoming 곱연산은 제거된 상태를 그대로 유지한다. 즉 출혈은 여전히 1초마다 최대 체력 5% DOT만 적용하며 받는 피해 증가는 없다. 새 모듈 추가 없음.

3.1289: 출혈(BLEED)의 받는 피해 증가 효과 제거. STATUS_EFFECT_RULES.bleed의 directDamageTakenExtraRatio 10%와 COMBAT_STATUS_DEFS 기본값을 제거하고, CCService의 bleed 전용 incomingDamageMultiplier/isDotImpact 경로 및 DamagePipeline의 statusIncoming 곱연산도 제거했다. 따라서 출혈은 이제 1초마다 최대 체력의 5% DOT만 적용하며 직접 공격의 받는 피해량에는 영향을 주지 않는다. 디버그 출혈 기본값에서도 추가 피해 배율 필드를 제거했다. 도움말은 `1초마다 최대 체력의 5% 피해를 받습니다.`로 수정. 새 모듈 추가 없음.

3.1288: 도움말 상태 설명 문구 수정. 화염(BURN)은 `0.5초마다 일정 피해를 받습니다.`로, 독(POISON)은 `1초마다 입은 피해량 비례 피해를 받습니다.`로 변경했다. 전투 로직 변경 없음.

3.1287: 도움말 버프기 목록에 SHIELD 항목 추가. `보호막 SHIELD`를 기존 도움말 상태 카드 형식으로 추가하고, 피해를 대신 받으며 보호막 체력은 최대 체력을 넘지 못하고 시간이 지나면 최대 체력의 10%씩 감소한다는 설명을 표시한다. 전투 로직 변경 없음.

3.1286: 키네스 상시 방향 표시를 부채꼴 미리보기에서 기존 호 게이지 디자인을 응용한 4방향 링으로 교체. 3.1285의 PassiveCardinalAimPreviewService/alwaysAimPreview/passiveAimPreview 경로를 전부 제거했다. 기존 ArcGaugePresentationService와 EntityRingLayoutService.chargeRadius/WIDTHS.gauge를 그대로 재사용한다. 키네스 주변 호 링은 상/하/좌/우 4구간으로 나뉘며 비선택 구간은 옅게, 현재 마우스 방향 구간 하나만 완전히 채운 색으로 표시한다. 시간/충전량/게이지 값은 사용하지 않는다. 시각 방향과 실제 RMB 마법진 선택이 동일한 경계 규칙을 쓰도록 범용 CardinalDirectionService를 추가하고 action.directional-trigger-attack도 이를 참조하도록 변경했다. 표시 자체는 로컬 소유자에게만 보이며 네트워크 전송하지 않는다. 링 레이아웃은 이 표시를 private gauge로 인식해 상태/반격 링과 겹치지 않는다. 공격/스킬 수치 변경 없음.

3.1285: 키네스 상시 방향 선택 미리보기 추가. 기존 attackPreview는 반격/차징/스킬 선딜이 공유하므로 상시 표시를 같은 슬롯에 넣지 않고, 캐릭터 데이터 `alwaysAimPreview`를 읽는 범용 PassiveCardinalAimPreviewService와 별도 `passiveAimPreview` 슬롯을 추가했다. 키네스 설정은 반경 82의 작은 90도 부채꼴(halfAngle PI/4)이며 마우스 각도를 가장 가까운 RIGHT/DOWN/LEFT/UP 4방향으로 스냅해 매 프레임 갱신한다. 키네스 색 계열의 옅은 채움/점선 외곽으로 표시한다. 이 표시는 Training.player이면서 로컬 권위인 소유자에게만 생성·렌더되어 상대/관전자 네트워크 화면으로 전송되지 않는다. 기존 공격/반격 미리보기와 독립적으로 동시에 표시된다. 새 공격/능력 모듈 추가 없음.

3.1284: 키네스 방출의 마법진 넉백 제거. `attack.kines.release`의 movement.knockback 모듈과 넉백 태그만 제거했다. 피해량, 범위, 화염 부여, 스테미나 비용, 쿨다운은 변경하지 않음. 새 모듈 추가 없음.

3.1283: 온라인 비관통 탄환이 적을 통과해 보이는 공통 버그 수정. ProjectileCollisionShapeService의 prevX→현재X swept 충돌 자체는 정상 작동하고 있었지만, 공격자 화면에서 원격 대상 접촉은 target-authoritative 확정 전이라는 이유로 일반 비관통 투사체를 소비하지 않고 계속 이동시키고 있었다. 이 때문에 레테 우편함 우편을 포함한 여러 비관통 투사체가 지연/프레임 상황에 따라 적을 관통해 보였다. delivery.projectile/range-projectile의 predictiveConsumeOnContact를 비관통 투사체 기본값으로 변경하고 명시적 false만 opt-out으로 유지했다. 공격자 화면에서 원격 대상과 static/swept 접촉한 비관통 투사체는 predictedContactConsumeOnly로 즉시 시각 소멸한다. 이 예측 소멸은 ProjectileImpactService를 실행하지 않아 폭발/후속타/CC 등 게임플레이를 공격자 화면에서 선행하지 않으며, 실제 피해와 on-hit/impact 확정은 기존 target-authoritative 및 duel-hit-confirmed 경로가 담당한다. projectile.pierce.targets=true 또는 passEnemies=true인 실제 관통 투사체는 기존대로 통과한다. 새 모듈 추가 없음.

3.1282: 루뷰 RMB/LMB 재사용의 온라인 fallback 평타 오재생 수정. 원인은 AbilityModuleService `action.attack`이 앞선 module의 `context.handled`를 로컬에서만 존중(`context.network!==true`)하고 원격 재생에서는 무시하던 구조였다. 루뷰 RMB 투척 후 LMB는 movement.move가 입력을 소비하고, RMB 재입력은 projectile.recall이 입력을 소비하므로 소유자 화면에서는 뒤의 기본 action.attack이 실행되지 않는다. 그러나 상대 화면에서는 같은 module이 handled=true가 되어도 network=true라는 이유로 action.attack이 계속 진행되어 ability 기본 attackId인 attack.ruvu.lmb/rmb를 추가 실행할 수 있었다. 특히 원격 ProjectileState가 패킷 순서상 없거나 phase가 다르면 수신 측 재판정이 실패해도 송신자가 보낸 handled=true를 무시해 fallback 공격이 나가는 문제가 있었다. action.attack의 소비 규칙을 로컬/원격 공통으로 통일하고, 온라인에서는 senderHandled=true이면서 resolvedAttackId가 비어 있으면 송신자가 이동/회수 같은 비공격 재사용으로 입력을 소비한 것으로 확정해 fallback 기본 공격을 차단한다. resolvedAttackId가 존재하는 정상 공격/alternate 공격은 그대로 해당 AttackSpec을 재생한다. 새 모듈 추가 없음.

3.1281: 온라인 이동기 경로 프레젠테이션 이중 생성 수정. 키네스 기동의 마법진처럼 movement.move의 presentation(dash-line)을 사용하는 공격은 소유자 권위 화면에서 실제 start/angle/destination으로 EffectSpawnService를 통해 생성하고 OnlinePresentationSyncService effect-spawn으로 동일 EffectSpec을 전송한다. 기존에는 상대 화면의 공격 재생에서도 MovementAbilityService.start가 같은 presentation을 다시 로컬 생성해, 원격 Entity의 보간 좌표 및 존재하지 않는 lastMovementInputAngle 기준의 잘못된 두 번째 경로가 겹칠 수 있었다. MovementAbilityService의 즉시 presentation 및 resolveOnFinish presentation을 온라인에서는 EntitySimulationAuthorityService.isLocal(entity)인 소유자만 생성하도록 범용 수정했다. 상대/관전자 화면은 소유자가 전송한 effect-spawn만 렌더하므로 위치·길이·색·지속시간이 로컬과 동일하다. 키네스 전투 이동/피해/수치 변경 없음. 새 모듈 추가 없음.

3.1280: 캐릭터 설명 참조 해석기의 가짜 0초/0% 방지. 원인: CharacterDescriptionService.abilityForSkill이 ability.attackId가 tooltip의 attack.id와 직접 같은 경우만 찾았기 때문에, 키네스처럼 RMB ability 내부 action.directional-trigger-attack/resource.restore가 실제 방향 AttackSpec을 참조하는 구조에서는 보호 마법진 ability를 찾지 못해 restoreMaxResourcePercent가 null→0으로 강제 변환됐다. abilityReferencesAttack을 추가해 trigger/releaseTrigger의 attackId/requireAttackId/attackIds/alternate 구조까지 범용 추적하고, abilityForSkill이 linked/secondary/field attack까지 포함해 이를 사용하도록 수정했다. status duration 참조도 현재 AttackSpec 하나만 보지 않고 linked/detail/secondary/field/projectile-impact 파생 AttackSpec 및 연결 Ability status.apply까지 탐색한다. field/status/burn/zap/restoreMaxResourcePercent처럼 참조형 수치는 실제 source가 없으면 더 이상 0을 생성하지 않고 null로 유지한다. interpolate는 unresolved 참조를 console.warn으로 노출하고 사용자 설명에서는 미해결 토큰의 최소 수치 구절을 제거해 `0초`, `0%`, `{placeholder}`가 보이지 않게 한다. 실제 데이터가 명시적으로 0인 스테미나 비용 등은 기존 규칙대로 정상 표시한다. 새 모듈 추가 없음.

3.1279: 키네스 툴팁 참조화 및 작열의 마법진 실제 피해 수정. 키네스 6개 스킬 설명을 사용자 지정 문구로 교체하되 화염 지속시간은 각 AttackSpec status.apply.duration의 `{burnSeconds}`, 보호 마법진 보호막 비율은 실제 ability resource.restore.maxResourceRatio의 `{restoreMaxResourcePercent}`를 참조하도록 변경했다. CharacterDescriptionService의 maxResourceRestore 탐색을 범용 확장해 공격 자체에 resource.restore가 없을 때 해당 스킬 ability의 resource.restore 중 requireAttackId가 현재 AttackSpec과 일치하는 모듈을 참조한다. 작열의 마법진은 3.1278에서 damageRatio 2(200 피해)가 설정되어 있었지만 expanding-ring damage에 `contactOnly:true`가 남아 DamagePipeline이 의도적으로 피해 0을 반환하고 있었다. 해당 contactOnly를 제거해 원 접촉 시 실제 200 직접 피해가 적용되며 기존 화염 및 무력화 넉백도 on-hit 경로에서 함께 적용된다. 새 모듈 추가 없음.

3.1278: 키네스 보호막 decay 미작동 및 반격 보강. 3.1277의 원인은 ShieldService에는 decay 기능이 있었지만 실제 키네스 AbilityAction `resource.restore`의 shield 분기가 decayStartDelay/decayInterval/decayMaxHealthRatio를 ShieldService.grant에 전달하지 않아 정책이 등록되지 않은 것이었다. Ability resource.restore의 shield 경로를 범용 확장해 해당 옵션을 그대로 전달한다. 따라서 보호 마법진 50% 보호막은 적용 1초 후부터 매초 maxHealth 10%씩 실제 감소한다. 작열의 마법진은 baseDamage 100 기준 damageRatio 2로 직접 피해 200을 주며, expanding-ring 접촉 대상에게 기존 범용 movement.neutralize-knockback(distance 84, speed 10)을 추가한다. 화염/450 반경/600ms 확장 규칙은 유지. 새 모듈 추가 없음.

3.1277: 키네스 보호 마법진/반격 및 SHIELD 상세 표기 조정. 기존 ShieldService를 범용 확장해 shield grant에 decayStartDelay/decayInterval/decayMaxHealthRatio 옵션을 지원하고, 로컬 권위 Entity update에서 ShieldService.update가 정확한 틱 감소를 처리한다. 키네스 보호 마법진은 최대체력 50% 보호막을 얻고 적용 1초 뒤 첫 틱부터 매 1000ms마다 최대체력 10%씩 보호막을 잃는다. 감소는 피해가 아니라 shield resource loss로 처리되며 0이 되면 decay 상태를 제거한다. 작열의 마법진 hitImpactRing duration을 300→600ms로 늘려 같은 450 반경을 절반 속도로 확장한다. 평상시 compact 왼쪽 표시는 기존대로 `SHIELD`만 유지하고, TAB expanded 상세에서는 `SHIELD n%` 표기를 복구했다. 새 모듈 추가 없음.

3.1276: 키네스 화염 중첩/체리티 설명/보호막 표시 수정. 키네스 화염은 25 피해/500ms로 변경하고 동일 키네스의 중첩을 여러 DOT 인스턴스로 만들지 않고 단일 BURN 상태의 stackCount를 누적하는 `stack-count-source` 방식으로 변경했다. 재적중 시 stackCount +1, 지속시간 갱신, nextTick 유지. 실제 틱 피해는 25×stackCount로 한 번만 적용된다. 다른 source 화염은 별도 상태로 공존하고 BURN 표시는 합산 DPS를 표시한다. 체리티는 잘못 추가한 저격/연막 스프레이의 `스테미나 0`을 제거하고 실제 무비용 입력인 `LMB HOLD/RMB 배율 조절`에만 `스테미나 0` 표기. 키네스 작열의 마법진 반경 900→450. 보호의 마법진 공격 범위 190→95. 보호막이 있으면 TAB 여부와 무관하게 왼쪽 compact 상태에 `SHIELD`를 항상 표시하며 퍼센트는 compact/expanded 모두 표시하지 않는다. 키네스 설명을 `스킬의 사용 방향에 따라 여러가지 마법진을 구사하는 화염술사`로 변경.

3.1275: 키네스/체리티 수정. 키네스 LMB custom rocket presentation 제거로 일반 투사체 렌더 사용. CCService에 stackMode `stack-refresh-source` 추가: 같은 source가 다시 부여하면 기존 같은-source 스택의 종료시간을 전부 새 지속시간으로 갱신한 뒤 새 스택을 추가하고 nextTick은 유지. refresh-type은 stack-refresh-source 항목을 보존해 다른 시전자의 화염과 공존. 체리티 LMB HOLD/RMB 툴팁에 costText `스테미나 0` 추가(실제 비용 변경 없음). action.directional-trigger-attack은 canonical AttackService.execute를 사용해 선택 AttackSpec의 비용/쿨다운을 적용. 키네스 조작/기동/방출/보호 비용 300/600/500/1200, 각 900ms. 보호막 40%. 키 표기 RMB UP/LEFT/DOWN/RIGHT. 작열의 마법진은 레이카 검격의 화염과 같은 hitImpactRing expanding-ring 구조로 변경해 0→900 범위를 300ms 동안 확장하며 벽을 무시하고 접촉 적에게 키네스 화염을 부여. 새 모듈 추가 없음.

3.1274: 키네스 캐릭터 선택 누락 수정. 3.1273에서 키네스 블록이 `GAME_DATA.characters` 닫힘 뒤에 삽입되어 characters의 형제 속성이 되었고, ProfileCharacterService(Object.values(GAME_DATA.characters)) 및 CharacterCardDataService가 키네스를 발견할 수 없었다. 키네스 정의 전체를 characters 객체의 실제 마지막 항목(나레 다음)으로 이동했다. 키네스 전투 수치/스킬/화염/보호막 로직은 변경하지 않음. 새 모듈 추가 없음.

3.1273: 신규 캐릭터 키네스 추가. 체력 1100/이속4/색상 #910101, 칭호 '화염 술사', 지속전투형 원거리 딜러. LMB 화염구는 직접 피해 없이 비행 후 착탄점 100 범위에 100 피해+2초 BURN(50/0.5s)을 부여하며 Kines burn은 stackMode:'independent'로 지속시간이 겹치는 동안 독립 중첩되어 총 BURN DPS가 증가한다. RMB는 공통 600 스테미나/900ms 쿨다운을 사용하고 현재 조준 각도의 4방향으로 조작/기동/방출/보호 마법진을 즉시 선택한다. 조작은 현재 kines-fireball을 현 위치에서 강제 impact시켜 150 범위/150 피해로 강화 폭발, 기동은 이동 입력 방향 280 순간이동+양 끝 110 범위/100 피해, 방출은 190 범위/150 피해+120 넉백, 보호는 최대체력 50% 보호막+190 범위 화염+220 넉백. 반격 작열의 마법진은 300ms 선딜 후 900 사거리/반경70의 벽·적 관통 범위 투사체를 발사해 2초 중첩 화염을 부여한다. 새 범용 Ability 모듈 action.directional-trigger-attack은 공격 각도를 up/left/down/right로 분류해 데이터 지정 AttackSpec을 실행하고, projectile.detonate는 stateKey 투사체를 현재 위치에서 기존 ProjectileImpactService로 강제 impact 후 제거한다. 기존 resource.restore 타입은 AbilityModuleService에서도 health/stamina/shield에 재사용 가능하도록 확장했다. BURN 표시는 동시에 활성인 burn 인스턴스의 실제 flat/interval을 합산해 총 n/s로 표시한다.

3.1272: 디버그 제어 탭 화염(BURN) 수치 편집 추가. 화염 상태 토큰을 처음 누르면 별도 편집기를 열어 `0.5초마다 적용할 고정 피해`를 직접 입력할 수 있다. 기본 입력값은 STATUS_EFFECT_RULES.burn.flatDamage(50), 입력 step은 10이다. DebugControlService에 isBurnActive/toggleBurn을 추가하고 flat:<입력값>, interval:500으로 CCService에 저장한다. OnlineDebugControlSyncService에 burn-toggle을 추가해 온라인 디버그에서도 동일하게 동기화하며, 활성 BURN 토큰을 다시 누르면 제거된다. 독은 기존대로 최대체력 % 피해 입력만 사용한다. 새 모듈 추가 없음.

3.1271: 독/화염 지속피해 규칙 변경. 독은 최대체력 비례 % 피해만 허용하고 flat 고정피해 모드를 제거했다. CombatStatusApplicationService는 과거/외부 flat poison 입력도 적용 순간 target.maxHealth 기준 percent로 정규화하며 tickDamage와 StatusPresentation은 percent만 사용한다. 독 증강의 기존 '입힌 피해의 15%/초' 효과를 유지하기 위해 새 범용 value.divide-by-target-max-health 파이프라인 모듈로 계산값을 대상 최대체력 비율로 변환한 뒤 poison percent 값으로 저장한다. 화염은 최대체력 비례 피해를 제거하고 0.5초마다 고정 피해만 적용한다. 공통 burn 기본값은 50/500ms이며 레이카의 모든 burn 부여와 루네프 화염 마법 burn도 50/500ms를 명시한다. 화염 표시는 실제 flat/interval을 초당 값으로 환산해 `BURN 100/s` 형식, 독은 `POISON n%/s` 형식을 사용한다. 디버그 독 편집기의 고정값 선택도 제거했다.

3.1270: 나레 RMB `거대 종이 비행기` 스테미나 비용을 1500→1200으로 감소. AttackSpec cost와 ability action.attack fallbackConditions의 resource.gte 요구량을 모두 1200으로 통일했다. 설명은 실제 attack cost 참조 구조를 그대로 사용하며 다른 나레 수치/동작은 변경하지 않았다. 새 모듈 추가 없음.

3.1269: HUD 보호막 게이지 배치 변경. 로컬 및 아군/적 HUD에서 보호막 게이지를 체력과 스테미나 사이가 아니라 스테미나 게이지 아래로 이동해 `체력 → 스테미나 → 보호막` 순서로 표시한다. 보호막이 0일 때 숨김/생성 시 표시 조건과 실제 보호막 전투 규칙은 변경 없음. 새 모듈 추가 없음.

3.1268: 월드 보호막 표시를 체력바 아래 별도 선에서 체력바 외곽선으로 변경. 현재 shield/maxHealth 비율만큼 체력바 전체 외곽 stroke를 왼쪽부터 clip해 표시한다. 100% 보호막은 체력바 전체를 감싸고, 부분 보호막은 왼쪽부터 해당 비율 구간의 외곽만 표시한다. 플레이어/소환수/더미/훈련 봇 월드 체력바에 동일 적용하며 HUD 보호막 게이지는 변경하지 않는다. 보호막 전용 하단 공간이 사라져 자연회복 게이지는 기존 체력바 바로 아래 위치로 복구. 새 모듈 추가 없음.

3.1267: 디버그 제어 탭에 보호막 직접 조작 추가. 기존 체력/스테미나 rangeGauge 구조를 재사용해 보호막 0~현재 maxHealth 범위를 실시간 편집하고 최대/제거 버튼을 제공한다. OnlineDebugControlSyncService에 shield-set/shield-max 명령을 추가해 온라인에서도 동일 제어가 동기화되며 실제 값 변경은 ShieldService.set()/maximum()만 사용한다. 디버그 라이브 갱신에도 data-live-gauge='shield'를 연결해 외부 피해/획득으로 보호막이 변해도 슬라이더가 즉시 따라간다. 캐릭터 강제 변경 시 기존 보호막은 새 maxHealth까지 clamp한다. 새 모듈 추가 없음.

3.1266: 보호막 표시 방식 수정. HUD에서 `보호막 현재/최대` 숫자 텍스트를 제거하고 로컬/아군/적 보호막 게이지는 현재 shield가 0보다 클 때만 표시하며 0이 되면 즉시 숨긴다. 보호막은 전투 자원 구조상 BuffService modifier로 중복 저장하지 않고 기존 BuffStatusPresentation의 TAB expanded 목록에만 합류한다. TAB 중 현재 보호막/maxHealth 비율을 `SHIELD n%` 형식으로 표시하며 평상시 compact 버프 목록에는 표시하지 않는다. 보호막 피해/상한/네트워크/월드 체력바 규칙은 변경 없음. 새 모듈 추가 없음.

3.1265: 범용 보호막 시스템 추가. 보호막은 health/maxHealth와 분리된 독립 자원이며 최대치는 항상 해당 Entity의 현재 maxHealth와 동일하다. ShieldService가 grant/set/absorb/clear/normalize를 담당하고 DamagePipeline은 최종 피해를 보호막에 먼저 적용한 뒤 남은 피해만 HealthService로 전달한다. 최대체력 비례 피해 및 현재/잃은 체력 기반 계산은 기존 health/maxHealth만 계속 참조하므로 보호막을 포함하지 않는다. 피해 결과는 shieldDamage와 healthDamage를 분리한다. resource.restore에 resource:'shield'를 범용 지원하고 duel-state 및 NetworkCombatSnapshotService에 shield를 동기화한다. 월드 체력바 아래에는 보호막/maxHealth 비율만큼 왼쪽부터 하늘색 외곽선을 표시하고, HUD의 로컬/아군/적 행에는 보호막 현재/최대 수치와 별도 게이지를 추가한다. 부활 시 보호막은 0으로 초기화된다. 새 캐릭터 전용 분기 없음.

3.1264: 셰리나 비아 projectile-path 잔향의 중간 가로선 원인 수정. 셰리나 LMB/반격은 적 관통 투사체이므로 projectile.impact.field.reasons에서 'target'을 제거해 적을 맞을 때마다 중간 경로 field를 새로 만들지 않는다. 잔향은 실제 투사체 종료 사유인 wall/boundary/range/guard에서만 생성된다. 3.1262에서 셰리나에 적용한 progressRect openEnds를 제거해 일반 닫힌 직사각형 윤곽을 복구하며, 이제 중간 target field가 없으므로 가로선은 출발점과 실제 최종 종료점에만 표시된다. 공용 progressRect의 openEnds 옵션 자체는 다른 잠재 사용처를 위해 유지하되 셰리나는 사용하지 않는다. 새 모듈 추가 없음.

3.1263: 크론 관련 코드 전부 제거. GAME_DATA.characters.kron의 캐릭터/공격/Ability/설명/귀속 단검 데이터를 삭제했다. 크론 구현을 위해 추가된 LinkedProjectileStockService, linked-projectile.stock/release/area-charge/stock-positive 처리, duel-state 재고 동기화, 월드 게이지 연결, 귀속 단검 projectile-fired/attack-fired/network-hit-confirmed 처리, projectile follower 연동, 연쇄 고정피해용 fixedDamageOverride 확장을 모두 제거했다. 다른 캐릭터가 사용하는 공용 코드 및 셰리나 비아 관련 수정은 유지. 새 모듈 추가 없음.

3.1262: 셰리나 에코 가로선/guard 종료점 및 크론 귀속 단검 발동/고정피해/비관통 수정. progressRect에 openEnds 옵션을 범용 추가해 셰리나 LMB/반격 에코는 양쪽 긴 변만 stroke하고 시작/끝 가로선을 그리지 않는다. field-point-spawn 네트워크 동기화에 canonical instanceId를 포함하고 원격 activatePoint도 동일 instanceId를 사용해 guard 보정 패킷이 기존 최대사거리 에코 field를 정확히 찾아 제거/교체한다. 귀속 단검은 실제 피해 가능 공격만 반응한다: projectile-fired는 damageOnTravel!==false 또는 projectile.impact의 피해 후속 attack이 있는 경우, hitscan attack-fired는 damageRatio>0인 delivery.area/hitscan이 있는 경우에만 발사한다. 귀속 단검 실행에는 fixedDamageOverride:50을 부여하고 DamagePipeline이 이 값을 공격자 피해배율 없이 기본 피해로 사용하며 방어/받는피해 배율은 기존대로 적용한다. projectile.impact 후속 AttackExecution에도 override를 전파해 베르 RMB 착탄 폭발 같은 연쇄 피해도 각 실제 피해 판정이 50으로 고정된다. 부모 damageOnTravel:false는 추가 단검에도 복제해 직격+후속 중복 피해를 막는다. 비관통 부모의 귀속 단검은 predictiveConsumeOnContact를 상속/활성화해 원격 화면에서도 적 접촉 시 관통해 지나가지 않는다. 새 모듈 없음.

3.1261: 크론 원격 비관통 표시/귀속 단검 적중 충전/평타 산탄각 및 셰리나 guard 잔향 재교정. 크론 LMB에 predictiveConsumeOnContact를 복구해 피격 권위가 아닌 아군 관전자 화면에서도 비관통 접촉 시 즉시 시각 소멸하며 실제 피해 권위는 변경하지 않는다. LMB 총 spread는 20도에서 10도(좌우 5도)로 축소. 귀속 단검 spawn 시 ownerReference/stockKey를 projectile.networkMeta.linkedProjectileStock에 함께 기록하고 network-hit-confirmed의 source on-hit 재생은 이 메타를 최우선으로 사용해 아군 bearer의 단검 적중도 원래 크론 소유 stock을 정확히 +2 충전한다. ProjectileImpactService는 resolveOnGuard + projectile-path field의 guard 보정에 한해 이미 range impact가 처리됐더라도 기존 동일 networkKey field를 제거하고 guard 좌표에서 impact를 다시 확정한다. 따라서 방패 패킷이 range 종료보다 늦게 도착해도 셰리나 에코가 실제 차단점까지만 남는다. 새 모듈 없음.

3.1260: 셰리나 비아 guard 잔향/귀속 단검 온라인 피해/크론 반격 충전 순서 수정. 온라인 projectile guard 결과에 실제 차단 x/y를 포함하고 수신측은 remove 전에 해당 좌표로 projectile.impact resolveOnGuard를 실행해 projectile-path field가 방패 차단점에서 정확히 끝난다. 귀속 단검 자동 동반 생성은 source-local 화면에서만 만들던 구조를 제거해 원본 projectile이 재생되는 모든 클라이언트에서 동일 parent networkKey 기준으로 생성하며, 실제 stock 감소의 네트워크 송신은 bearer 권위 화면만 수행한다. 따라서 피격자 권위 화면에도 동일 귀속 단검 Projectile이 존재해 실제 피해 판정을 수행한다. linked-projectile.stock에 recipient:'linked-bearer'를 추가해 귀속 단검 적중 시 해당 단검을 보유/발사한 bearer의 같은 owner stock을 +2 충전하고 network-hit-confirmed에서도 동일 ownerReference를 복원한다. linked-projectile.area-charge는 delivery 도중 즉시 충전하지 않고 execution deferred queue에 적재한 뒤 attack-fired 처리 직후 실행한다. 따라서 크론 반격은 피해 판정→기존 보유 단검 동반 공격 판정→자신/아군 +25% 충전 순서가 되며, 방금 반격으로 얻은 단검이 같은 반격에서 즉시 소비되지 않는다. 새 모듈 추가 없음.

3.1259: 펠루나/레이카 평타 선딜 표시-판정 불일치 수정. 펠루나 LMB 강화 1단계 이상은 실제 AttackSpec에서 300ms delay가 제거되어 즉발인데 ability가 stage1 실행 뒤에도 300ms preview를 생성하던 경로를 제거해 강화 상태에서는 선딜 미리보기도 표시하지 않는다. 레이카 일반 LMB는 ability timing.delay에만 의존하던 선딜을 AttackSpec의 실제 delivery.area delay 300ms로 이동해 피해 판정 자체가 반드시 300ms 뒤 발생하도록 했다. 동일 AttackSpec의 arcSweep effect.spawn에도 delay 300ms를 선언하고 기존 effect.spawn after-attack 경로가 선택적 delay를 범용 지원하도록 확장해 공격 연출과 피해 시점을 일치시켰다. 레이카 ability의 중복 timing.delay/preview.remove는 제거하고 preview.create 300ms + ability.lock 300ms + 즉시 AttackService 예약 구조로 단일화했다. 가호 평타는 기존 즉발 유지. 새 모듈 추가 없음.

3.1258: 셰리나 비아 projectile-path 잔향의 방어 차단 종료점과 부활 대기 중 피해 처리 수정. AttackGuardService가 투사체를 제거할 때 impact.resolveOnGuard=true인 투사체에 한해 현재 차단 위치에서 ProjectileImpactService.resolve(projectile,'guard')를 먼저 실행하는 범용 경로를 추가했다. 셰리나 LMB/반격의 projectile.impact에 resolveOnGuard:true 및 field.reasons에 'guard'를 추가해 방패/투사체 방어에 막히면 실제 소멸 위치까지만 잔향이 생성된다. DamagePipeline은 target.alive===false인 사망/부활 대기 Entity에 대한 모든 피해를 입구에서 거부해 설치 장판/DOT/일반 공격이 respawn 대기 중 체력을 다시 깎거나 사망 처리를 반복하지 못하게 했다. 새 캐릭터 전용 서비스 없음.

3.1257: 크론 귀속 단검 시스템 12건 수정. 평타/귀속단검/RMB 단검 피해를 타당 50으로 통일하고 크론 Base Damage를 50으로 변경, 반격 기존 피해는 damageRatio 1.5로 75 유지. LMB 쿨다운 500→400ms. 평타/귀속단검/RMB 적중 충전은 모두 1발 적중당 정확히 +2. 반격 염력 반발은 인원수 계산 없이 크론 자신과 범위 내 ally 각각에게 max16의 25%=4개를 충전하고 적은 피해/CC만 받는다. 추가 단검은 실제 parent projectile 객체만 추종하며 소멸 후 networkKey로 다른 탄환에 재결합하지 않는다. 추종 간격은 parent radius + dagger radius + 2px를 매 프레임 계산해 투사체 크기와 무관하게 겹치지 않는다. parent projectile을 동반하는 추가 단검은 parent의 range/speed/targetPoint/targetDistance/target relations/collision/pierce/homing/pathfinding/return/waypoint/trajectory/presentation type 등 물리 투사체 설정을 복제하고 피해/크기/색만 귀속 단검 값으로 유지한다. 실제 projectile-fired마다 재고를 즉시 1개 소비하고 snapshot dirty/state send를 즉시 갱신해 시간차 연발에서 실시간 감소한다. 히트스캔은 attack-fired 시 조준 방향으로 단검 1발을 발사한다. delivery.projectile에 predictiveConsumeOnContact 범용 옵션을 추가하고 크론 LMB에 적용해 비관통 적 접촉이 공격자 화면에서도 즉시 시각 소모되며 피해 권위는 기존 target-authoritative를 유지한다. 툴팁은 다른 캐릭터와 같은 피해 placeholder/간결 문장 형식으로 정리. 캐릭터 ID 런타임 하드코딩 없음.

3.1256: 크론 귀속 단검/반격/RMB 수정. LMB 부양 단검은 아군 또는 적에게 탄환 1발이 적중할 때마다 단검을 정확히 2개 충전한다. 염력 반발은 인원수를 세는 기존 area-charge 의미를 제거하고 범위 내 ally 각각에게 최대 단검의 25%를 독립 충전하며 적은 delivery.area 피해/CC만 받는다; max16 기준 4개. 크론 자신(self)은 ally 충전 대상에 포함하지 않는다. 툴팁도 같은 의미로 수정. RMB 다중 단검은 서비스의 직접 ProjectileService.spawn 반복 경로 대신 현재 재고 수를 pattern.scatter.count로 만든 동적 AttackSpec을 기존 AttackModuleService.deliver 경로에 전달해 실제 표준 산탄 투사체를 생성한다. 추가 단검 follower는 parent networkKey 재검색보다 생성 당시 실제 parent projectile 객체 참조를 우선 사용해 각 원본 탄환마다 정확히 자기 부모의 위치/방향을 추적한다. 캐릭터 ID 런타임 하드코딩 없음.

3.1255: 크론 귀속 단검 4건 수정. 귀속 단검 gauge.segmented는 더 이상 최대 16칸을 항상 표시하지 않고 현재 count와 동일한 개수의 칸만 생성해 1개=1/1칸, 2개=2/2칸처럼 현재 재고 자체를 최대 칸수로 표시하며 SegmentedGaugePresentationService는 1칸 게이지도 허용한다. 추가 단검은 원본 projectile과 같은 방향으로 독립 발사하던 방식을 제거하고 각 child에 parent networkKey/side/back offset을 연결해 ProjectileService 매 프레임에서 실제 부모 투사체의 현재 x/y/angle/vx/vy를 따라가도록 변경했다. 따라서 산탄/연사/유도 등 실제 생성된 각 원본 탄환마다 재고 1개가 정확히 해당 탄환 옆·뒤를 추종하며 부모가 사라지면 마지막 속도로 독립 비행한다. 반격 area-charge의 targetKinds:'player' 제한을 제거해 훈련 봇/소환수 등 실제 아군·적 전투 Entity도 범위 인원수에 포함하고 범위 내 self/ally에게 정상 충전한다. RMB 다중 단검은 stock-positive 조건을 유지하되 effectsOnly 플래그를 제거해 표준 AttackService 공격 실행 경로로 확실히 처리하며 linked-projectile.release가 현재 재고 전량을 소비/산탄한다. 캐릭터 ID 하드코딩 없음.

3.1254: 크론 1차 후속 수정. LMB 부양 단검의 총 산탄각을 60도→20도(좌우 10도)로 축소하고 크론 기본/공격 색상을 #703131→#8d3636으로 더 붉게 변경. 귀속 단검 재고는 LinkedProjectileStockService가 생성하는 범용 16칸 gauge.segmented로 보유자 아래에 표시하며 숫자 current/max 표시는 사용하지 않고 현재 count만큼 칸을 채운다. 추가 단검 자동 발사는 attack-fired 1회 기준에서 실제 projectile-fired 기준으로 변경해 원본 공격이 실제로 생성한 투사체마다 재고 1개를 소비해 단검 1개를 붙인다. 단검은 각 원본 탄환과 같은 방향/속도로 약간 뒤+옆에서 생성되어 해당 탄환을 따라가며, 실제 Projectile이 없는 히트스캔 공격만 attack-fired에서 단검 1개를 발사한다. 원본 projectile networkKey를 기반으로 linked-follow key를 만들어 로컬/원격에서 동일 논리 단검을 생성한다. TagService.derivedModuleTags()에 잘못 삽입돼 source/angle/volley를 참조하던 linked-projectile.release/area-charge 실행 코드를 제거하고 태그 파생만 남겼으며 실제 실행은 AttackModuleService.deliver()의 정식 모듈 경로로 이동. area-charge는 각 recipient 권위 클라이언트에서 자신의 로컬 recipient 재고만 확정해 팀 온라인 동기화가 가능하도록 정리.

3.1253: 신규 캐릭터 크론 추가. 체력 1300/이속 4/#703131/성장형 중거리 서포터. LMB 부양 단검은 500px 사거리에서 좌우 30도(총 spread 60도)로 2발을 발사하며, 아군 적중은 해당 아군에게 귀속 단검 +1씩, 적 적중은 크론 자신에게 +1씩 부여해 두 발 모두 적중 시 총 +2. 귀속 단검은 최대 16개이며 보유자가 일반 공격을 실행할 때 1개를 소비해 같은 방향으로 50 피해 추가 단검을 발사한다. RMB 다중 단검은 현재 보유 귀속 단검을 모두 소비해 전방 총 60도 부채로 동시 산탄하고, 각 단검이 적중할 때 크론에게 단검 2개를 충전한다. 반격 염력 반발은 0.3초 선딜 후 반경 180 원형 피해+무력화 넉백을 가하며, 범위 내 자신을 제외한 플레이어 아군+적 수마다 최대 단검의 25%(4개)를 범위 내 크론 포함 아군들에게 충전한다. 기존 자원/Progress/Orbit 구조는 타 Entity에 귀속된 공격 동반 탄약을 표현할 수 없어 범용 LinkedProjectileStockService와 linked-projectile.stock/release/area-charge 모듈을 추가했다. 서비스는 캐릭터 ID 없이 Entity별 귀속 투사체 재고, 공격 동반 소모, 전량 산탄, 영역 기반 비율 충전, duel-state 동기화를 담당한다.

3.1252: CharacterTitleService에 나레 마스터 V 칭호 `추억을 날리는 소녀`를 추가. 전투/네트워크/수치 변경 없음.

3.1251: homing 대상을 실시간 최근접 적 재선정 방식으로 변경. 기존 ProjectileService homing은 homingTargetReference가 한번 설정되면 해당 대상이 유효한 동안 다른 더 가까운 적이 생겨도 계속 기존 대상을 추적했다. 소유자 권위 homing projectile은 이제 매 프레임 searchRange 안의 targetRelations 대상 전체를 다시 탐색해 현재 projectile 위치와 가장 가까운 대상을 선택한다. homingTargetReference는 더 이상 락온 조건으로 사용하지 않고 소유자가 이번 프레임 선택한 최근접 대상 reference를 네트워크 동기화용으로 갱신한다. 원격 클라이언트는 기존 owner trajectory mirror를 그대로 사용하므로 대상 재선정도 소유자 한 곳에서만 결정된다. targetEntityOnly 지정형 homing은 명시 대상 고정 규칙을 유지한다. 캐릭터/공격 ID 하드코딩 없음.

3.1250: 온라인 투사체 networkKey의 AttackExecution.sequence를 송신자 권위로 통일. ProjectileService networkKey는 `attackId:executionSequence:projectileOrdinal`로 생성되지만 일반 duel-action은 지금까지 실제 AttackExecution.sequence를 전송하지 않았다. 그 결과 공격자와 원격이 각자의 전역 실행 카운터로 같은 공격을 생성해 networkKey가 간헐적으로 달라졌고, homing owner snapshot이 원격 렌더 projectile에 매칭되지 않는 근본 원인이었다. AttackService.execute는 생성된 execution.sequence를 attackResult에 기록하고, 표준 action.attack 모듈이 runtime.executionSequence로 보존하며 AbilityService.activate 결과에 노출한다. OnlineDuelService의 ability/hold/release 패킷은 해당 executionSequence를 전송하고 수신 측 AbilityService context로 그대로 전달한다. AttackService.execute는 networkReplay에서 executionSequence가 전달되면 AttackExecutionService.replica()를 사용해 송신자와 동일 sequence의 execution을 생성한다. 따라서 일반/지연 다중 투사체의 networkKey가 양쪽에서 동일한 진실원천을 사용하며 기존 ProjectileHomingTargetSyncService/render mirror가 정확한 projectile을 매칭한다. 캐릭터 ID 하드코딩 없음.

3.1249: 온라인 homing 렌더를 projectile 바인딩과 완전히 분리. 3.1248도 owner snapshot을 먼저 findProjectile/applySnapshot으로 원격 Projectile 객체에 붙인 뒤 renderer가 projectile.authoritativeHomingSample을 읽는 구조라, action/state 도착 순서나 networkKey 바인딩이 어긋난 프레임에는 원격 자체 trajectory가 다시 렌더될 수 있었다. ProjectileHomingTargetSyncService.renderSnapshot(projectile)을 추가해 renderer가 원격 projectile의 source+networkKey로 pending owner snapshot 캐시를 직접 조회한다. ProjectileVisualPositionService는 온라인 원격 homing에서 이 raw network snapshot을 최우선 진실원천으로 사용하고, projectile.authoritativeHomingSample은 네트워크 snapshot이 아직 없는 초기 fallback에만 사용한다. 따라서 화면 표시에는 findProjectile/applySnapshot 성공 여부, 원격 homing target 계산, 원격 projectile 좌표가 개입하지 않는다. 동일 networkKey의 중복 논리 projectile이 있더라도 모두 같은 owner snapshot 좌표에 겹쳐 그려진다. 실제 projectile 객체는 기존대로 대상 권위 충돌 판정용으로 유지. 캐릭터/공격 ID 하드코딩 없음.

3.1248: 온라인 homing 시각을 owner-only render mirror로 분리. 3.1247까지는 authoritative trajectory를 원격 Projectile 객체 좌표에 주입했지만 그 객체가 충돌/수명/기타 projectile 로직에도 동시에 사용되어 이후 실행 경로가 좌표/각도를 다시 바꿀 여지가 있었다. ProjectileVisualPositionService.sample()이 원격 homing 활성 상태에서는 projectile.x/y를 무시하고 authoritativeHomingSample의 x/y/vx/vy/angle을 직접 렌더 좌표로 사용한다. 렌더 패킷 사이에는 최대 50ms만 owner velocity로 외삽하며, projectile renderer의 rocket/laser/tracer/diamond 방향도 b.angle이 아니라 visual.angle을 우선 사용한다. 따라서 실제 원격 Projectile 객체는 대상 권위 충돌 판정용으로 남아 있어도 화면에 보이는 homing 투사체는 owner가 계산한 궤적만 복제한다. 비유도/유도 시작 전/owner 화면은 기존 ProjectileVisualPositionService 경로 그대로 유지. 캐릭터/공격 ID 하드코딩 없음.

3.1247: 온라인 homing을 소유자 단일 시뮬레이션 + 원격 trajectory follower 구조로 변경. 3.1245~3.1246의 angle-only 동기화는 원격 projectile 위치 자체가 독립 시뮬레이션이라 동일 각도를 받아도 패킷 사이 위치/회전 시점이 달라 시각 궤도가 가끔 갈릴 수 있었다. ProjectileHomingTargetSyncService snapshot에 소유자 x/y/vx/vy/angle/travel을 25ms duel-state 주기로 전송하고 sampleSequence로 최신 sample만 적용한다. 원격은 homing 활성 이후 authoritativeHomingSample을 보유하며 자체 target/turn 계산을 건너뛰고, updateOutbound 이동 직후 자신의 계산 결과를 버린 뒤 소유자 sample 위치에서 마지막 소유자 속도로 짧게 외삽한 좌표/각도/속도/이동거리로 덮어쓴다. prevX/prevY는 이전 follower 위치를 유지하므로 ProjectileCollisionShapeService의 swept collision은 실제 화면에 그려지는 추종 구간과 동일한 경로를 검사한다. 패킷이 일시 중단되면 외삽은 최대 100ms까지만 진행하고 그 자리에서 대기해 원격이 임의의 다른 궤도를 만들지 않는다. 좌표 강제 스냅은 homing 활성 투사체에만 적용하며 비유도 투사체/유도 시작 전 동작은 기존 그대로다. 캐릭터/공격 ID 하드코딩 없음.

3.1246: 온라인 homing 방향 권위 적용 위치 수정 + 과충전 공격 차징 공격 제외. 3.1245는 원격 homing 계산 후 프레임 끝에 owner angle을 덮는 구조라 패킷 사이 프레임에서 원격 자체 보간 좌표 기반 회전이 다시 끼어들 수 있었다. 원격 projectile에 최신 authoritativeHomingAngle이 있으면 homing target 탐색/turn 계산 자체를 건너뛰고 즉시 owner angle로 vx/vy를 구성하도록 변경해 패킷 사이에 로컬 계산이 방향을 재변경하지 못하게 했다. snapshot 미수신/비활성 상태에서는 기존 fallback homing을 유지한다. 과충전 공격은 차징 AttackSpec에는 적용되지 않도록 attack.tag-absent `차징` 조건을 추가하고, charge 속성이 있는 AttackSpec도 동일하게 제외되도록 TriggerConditionService에 attack.not-charge 조건을 추가했다. 캐릭터 ID 하드코딩 없음.

3.1245: 온라인 유도 투사체의 방향 권위를 소유자 기준으로 통일. 기존 ProjectileHomingTargetSyncService는 targetReference/hadHit/range만 동기화하고 실제 homing angle은 각 클라이언트가 각자의 보간된 대상 좌표로 atan2 계산해, 같은 목표라도 빠른 이동/근접 상황에서 방향이 다르게 보일 수 있었다. 소유자 homing projectile snapshot에 sampleSequence/active/angle을 추가하고, 원격은 최신 sampleSequence의 authoritative angle을 저장한다. ProjectileService의 기존 homing 계산은 패킷 도착 전 fallback으로 그대로 유지하되, 유효한 원격 authoritative angle이 있으면 프레임 최종 vx/vy/angle을 소유자 각도로 덮어써 두 화면의 진행 방향을 통일한다. 좌표를 강제 복제하지 않으므로 원격 target-owner 충돌 권위와 기존 swept collision은 유지하며, hadHit snapshot 전에는 기존 fallback 유도가 살아 있어 관통 후 직진 회귀를 막는다. 동일 revision의 패킷 역전으로 오래된 각도가 덮이지 않도록 별도 sampleSequence를 단조 증가시킨다. 캐릭터/공격 ID 하드코딩 없음.

3.1244: 하푸푸 역할군 표기 수정 + 과충전 공격 온라인 attackAdjustment 권위 동기화 수정. 하푸푸 LMB 기본 사거리 90은 거리 규칙상 초근거리이므로 styleLabel을 `행동제약형 초근거리 암살자`로 변경. 과충전 공격 등 조건부 attackAdjustment는 공격자에서 올바른 resourceConditionSnapshot으로 계산되어도 networkAttackAdjustments에 wallPierce만 캡처되고 damage/range/projectileRadius/projectileSpeed/cost 보정값은 누락되어, 원격 피해 권위 클라이언트가 차징 후 줄어든 현재 스테미나로 resource.full을 재평가하며 과충전 피해/탄속이 사라질 수 있었다. AugmentService.prepareAttack은 최종 adjustment totals 전체를 captureAdjustments에 기록하고, networkAdjustments가 전달된 원격 재생에서는 해당 송신자 권위 totals를 그대로 사용한다. 따라서 차징 시작 당시 최대 스테미나였다면 during-charge 지속 소모 이후에도 로컬/원격 모두 동일한 과충전 피해량·탄속을 사용한다. 캐릭터 ID 하드코딩 없음.

3.1243: 전체 코드 중간점검 안전 정리 + 하푸푸 역할군 변경.
- 하푸푸 역할군을 `행동제약형 (사거리) 암살자`로 변경하고 역할 태그를 행동제약형/암살자로 갱신.
- 이미 no-op이던 NetCombatTraceService와 전투/네트워크 핫패스의 진단 호출을 제거해 불필요한 객체 생성·상태 조회를 제거.
- 미사용 duels2R, 도달 불가능 showNotImplemented fallback, Training.exit 빈 training 분기 제거.
- TriggerConditionService의 resource.full/resource.not-full 공통 스냅샷 해석을 resourceState()로 통합.
- ProjectileHomingTargetSyncService의 조회 전용 updatePending이 빈 Map을 생성하지 않도록 변경하고 clear() 수명 정리 추가. 최근 나레 패치에서 더 이상 사용하지 않는 remoteHomingAuthoritative/remoteHomingSyncedAt 제거.
- ProjectileRideService가 더 이상 소비하지 않는 원격 snapshot x/y/projectileNetworkKey/remoteX/remoteY 제거.
- CircleFormationService의 `attack.tinya.counter` 직접 비교를 캐릭터 counter ability의 attackId 참조로 일반화.
- ProjectileService.confirmAuthoritativeHit()이 전역 hadHit 때문에 후속 실제 적중의 trajectory reconciliation을 생략하지 않고 기존 target별 trajectoryHitAt dedupe를 항상 사용하도록 수정.
- Training HUD의 local-health-wrap 프레임별 DOM 검색을 hudRefs 캐시에 포함.
- 위험도가 큰 CSS cascade 통합, 룰리 전용 프레젠테이션 데이터화, ProjectileService spatial index, Training reset 대형 통합, homing 궤도 네트워크 구조 재설계는 회귀 위험 때문에 보류.

3.1242: 레비나 정지 창 비공격화 + 나레 반격 넉백 전달 안정화. ProjectileService.updateOutbound의 이동 중 target collision 블록을 waypoint.stopped 상태에서는 실행하지 않도록 변경했다. 따라서 레비나 창은 경로 이동 중에만 피해를 주며 목적지에 멈춘 뒤 플레이어가 닿아도 피해/CC/저스트회피 판정을 발생시키지 않는다. 새 경로가 지정되면 waypoint.stopped=false가 되어 기존처럼 세그먼트당 동일 대상 1회 타격이 다시 활성화된다. 나레 반격의 movement.neutralize-knockback을 counter.execute의 transient extraModules에만 두지 않고 attack.nare.counter AttackSpec의 공통 on-hit 모듈로 이동했다. counter.execute는 기존 CounterModuleService의 ccRefAttackId 재사용 경로로 attack.nare.counter의 CC를 참조한다. 따라서 로컬/원격 delayed projectile volley 모두 동일 AttackSpec에 넉백 모듈을 포함해 피해 적중 시 거리 42, 속도 10의 away-from-source 무력화 넉백을 적용한다. 새 모듈 추가 없음, 캐릭터 ID 런타임 분기 없음.

3.1241: 레비나 관통 창 틱마다 반복 적중하는 실제 원인 수정. 레비나처럼 projectile.return이 있는 투사체는 ProjectileService.hitTarget()에서 outbound 시 returning.outboundHitIds, returning 시 returning.returnHitIds를 중복 적중 판정에 사용하지만, 실제 적중 확정 후 confirmAuthoritativeHit()은 projectile.hitIds에만 기록해 현재 phase의 hitIds가 비어 있던 문제를 수정했다. hitTarget()이 실제 authoritative 단발 적중 후 현재 phase에서 선택한 hitIds 세트에 target.id를 기록하도록 범용 수정했다. 따라서 같은 경로 세그먼트에서는 같은 적을 1회만 타격하고, waypoint 경로가 바뀌면 기존처럼 outboundHitIds를 초기화해 같은 적을 다시 1회 타격할 수 있다. 3.1240에서 추가했던 세그먼트 적중 초기화 비활성화 변경은 제거해 기존 규칙을 복원했다. 캐릭터 ID 런타임 분기 없음.

3.1240: 레비나 관통 창 반복 틱 피해 수정. WaypointProjectileService.applySegment()가 경로 세그먼트 재지정 때 projectile.hitIds와 returning.outboundHitIds를 무조건 clear하여 같은 물리 투사체가 같은 적과 겹쳐 있는 동안 새 세그먼트마다 다시 적중 가능한 상태가 되던 문제를 수정했다. 기존 projectile.waypoint-path에 범용 resetHitIdsOnSegment 옵션을 추가하며 기본값 true로 기존 동작을 유지한다. 레비나 LMB/RMB의 waypoint-path는 resetHitIdsOnSegment:false를 사용해 outbound 전체 동안 같은 대상은 한 번만 적중한다. 귀환 단계는 기존 별도 returnHitIds를 사용하므로 귀환 시 같은 대상을 다시 한 번 적중 가능하다. 캐릭터 ID 런타임 분기 없음.

3.1239: 온라인 homing/사거리 상태 권위 통합. 3.1238까지는 homing targetReference는 소유자 기준으로 동기화했지만, hadHit/maxTravelDistance/fadeResetTravel은 공격자 예측 접촉과 피격자 authoritative confirm 양쪽에서 따로 갱신되어 패킷 순서에 따라 한 화면만 사거리 증가가 적용되거나 targetReference가 늦게 덮여 순간적으로 다른 방향으로 유도될 수 있었다. ProjectileHomingTargetSyncService에 revision 기반 authoritative state를 추가한다. 소유자 projectile은 trajectory hit 시 homingRevision을 증가시키고 hadHit, targetReference, maxTravelDistance, fadeResetTravel을 한 snapshot으로 보낸다. 원격은 networkKey/attackId+executionSequence+ordinal로 같은 projectile을 찾은 뒤 revision이 더 최신일 때만 상태를 통째로 적용한다. 원격 자체 nearest-target은 targetReference 미수신 시에만 임시 허용하고, 한 번 authoritative targetReference를 받으면 해당 projectile 수명 동안 다른 target으로 재선택하지 않는다. 또한 duel-hit-confirmed가 돌아왔을 때 owner projectile의 사거리 증가를 다시 계산하지 않고 이미 trajectory hit에서 계산된 revision 상태를 재사용해 중복/엇갈림을 없앤다. 캐릭터/공격 ID 하드코딩 없음.

3.1238: 온라인 homing 동기화 구조 재설계. 3.1236~3.1237의 원격 homing 자체 계산 차단 + x/y/angle/vx/vy snapshot 복제 방식을 제거했다. 새 ProjectileHomingTargetSyncService는 소유자가 선택한 유도 목표 참조만 동기화한다. 원격 투사체는 기존 homing 회전을 다시 직접 수행하되 동기화된 targetReference가 있으면 반드시 동일 목표를 사용한다. 목표 snapshot이 projectile보다 먼저 와도 pending cache에 유지하고 networkKey 또는 attackId+executionSequence+ordinal fallback으로 결합한다. snapshot이 늦는 동안에도 원격 nearest-target 계산을 허용해 관통 후 직진 고정되는 실패 모드를 제거했다. 캐릭터/공격 ID 하드코딩 없음.

3.1237: 원격 homing 투사체가 관통 후 직진으로 끝나는 문제 수정. 3.1236에서 원격 homing 자체 계산을 완전히 막은 뒤, owner의 hadHit snapshot이 늦게 오거나 projectile 생성 직후 첫 snapshot이 직진 상태이면 원격 투사체가 이후 owner snapshot을 받기 전까지 계속 직진하며 관통 후 유도 전환이 시각적으로 누락될 수 있었다. ProjectileHomingNetworkService에 per-projectile latest snapshot cache + interpolation target을 추가하고, 원격 projectile은 매 프레임 latest owner snapshot의 x/y/angle/vx/vy/hadHit/travel/maxTravelDistance/fadeResetTravel을 기준으로 보간한다. 특히 hadHit=true snapshot을 한 번 받은 뒤에는 false snapshot으로 되돌아가지 않도록 monotonic 처리해 startAfterHit 유도 상태가 절대 해제되지 않는다. 또한 owner의 projectile이 적중한 프레임에 confirmTrajectoryHit이 즉시 hadHit/사거리 증가를 상태 패킷에 반영하도록 state sync dirty를 표시해 다음 정기 패킷을 기다리지 않고 가능한 즉시 전송한다. 캐릭터/공격 ID 하드코딩 없음.

3.1236: 온라인 homing 투사체 궤도 동기화 재수정. 3.1235의 snapshot 적용은 해당 networkKey 투사체가 아직 생성되지 않은 경우 snapshot을 버렸고, 첫 snapshot 이전에는 원격 클라이언트도 nearest-target homing을 계산할 수 있어 패킷 순서에 따라 양 화면 궤도가 자주 달라질 수 있었다. ProjectileHomingNetworkService에 source별 pending snapshot 저장소를 추가해 수신 즉시 최신 networkKey 상태를 보관하고, 투사체가 나중에 생성되어도 updatePending에서 자동 적용한다. ProjectileService homing 회전은 `EntitySimulationAuthorityService.isLocal(projectile.source)`인 소유자 권위 투사체에서만 실행하도록 변경해 원격 화면은 첫 프레임부터 독립 target 선택을 절대 하지 않는다. homing snapshot에 x/y도 추가하고 원격에서는 authoritative x/y/angle/vx/vy를 적용해 누적 적분 오차까지 정리한다. duel-state 수신 직후뿐 아니라 매 world simulation의 ProjectileService.update 직전 pending snapshot을 재적용해 action/projectile/state 패킷 도착 순서와 무관하게 동일 networkKey 궤도를 복원한다. 캐릭터/공격 ID 하드코딩 없음.

3.1235: 온라인 유도 투사체 궤도 권위 통일. 기존 ProjectileService.updateOutbound의 homing은 각 클라이언트가 각자의 보간된 Entity 위치를 기준으로 nearest target을 독립 계산해, 동일 networkKey 투사체가 공격자/상대 화면에서 서로 다른 대상을 선택하거나 다른 방향으로 회전할 수 있었다. 범용 ProjectileHomingNetworkService를 추가해 소유자 권위 클라이언트만 homing 방향을 계산하고, duel-state 25ms 주기로 모든 homing 투사체의 networkKey/angle/vx/vy/hadHit/maxTravelDistance/fadeResetTravel/travel을 직렬화한다. 원격 클라이언트는 source+networkKey로 동일 투사체를 찾아 이 궤도 상태를 적용하고 remoteHomingAuthoritative 플래그를 설정하며, ProjectileService의 자체 nearest-target homing 계산을 건너뛰고 송신자의 속도 벡터를 그대로 적분한다. 따라서 나레 LMB/반격뿐 아니라 동일 generic homing을 사용하는 모든 온라인 투사체가 소유자 화면의 회전 방향을 기준으로 동일하게 표시된다. 캐릭터/공격 ID 하드코딩 없음.

3.1234: 나레 온라인 탑승 표시 방향 및 적중 사거리 연장 수정. 원격 탑승 표시를 기존의 `remote player <- projectile` 강제 추종 구조에서 `remote projectile <- interpolated player` 구조로 반전했다. duel-state 수신 시 projectileRide 활성 여부와 무관하게 원격 플레이어는 기존 predictedX/predictedY 네트워크 보간을 그대로 사용하며, ProjectileRideService.applyRemote는 더 이상 플레이어 netTarget/netCollision 좌표를 비행기 snapshot 좌표로 덮지 않는다. syncAll의 원격 ride에서는 보간된 플레이어 entity.x/y를 실제 탑승 projectile의 x/y에 복사하고 snapshot angle만 비행기 방향에 반영한다. 따라서 상대 화면에서는 플레이어가 기존 부드러운 네트워크 이동의 주체가 되고 거대 종이 비행기가 플레이어를 따라 표시되며, 맵 외곽 종료 시에도 플레이어 위치가 패킷 단위로 뚝뚝 재고정되지 않는다. 또한 투사체 소유자 화면의 원격 대상 접촉에서도 피해 권위와 별개인 궤도 상태용 `confirmTrajectoryHit`을 실행한다. 이 공통 helper는 hadHit, 적중별 maxTravelDistance 증가, fadeResetTravel을 즉시 적용하고 trajectoryHitAt으로 같은 적중 틱의 duel-hit-confirmed와 중복 사거리 증가를 방지한다. 실제 피해/CC/onHit 권위는 기존 target-authoritative 경로 그대로 유지. 캐릭터 ID 하드코딩 없음.

3.1233: 나레 온라인 탑승/유도 표시를 실제 렌더 경로 기준으로 재수정. ProjectileRideService.serialize()가 ride state 식별자만 보내던 구조를 바꿔 탑승 중인 실제 projectile의 x/y/angle/networkKey까지 projectileRide snapshot에 포함한다. applyRemote()는 대응 projectile 바인딩 성공 여부와 무관하게 이 좌표를 remote ride state와 entity의 netAuthoritative/netCollision/netTarget 좌표에 직접 반영한다. syncAll()도 원격에서 projectile을 아직 찾지 못한 경우 snapshot의 remoteX/remoteY를 fallback으로 사용하므로, 투사체 state/action 패킷 순서가 뒤바뀌어도 상대 화면 캐릭터가 탑승 좌표에서 표시된다. 투사체 적중 권위는 그대로 대상 소유자에게 유지하되, 공격자 화면의 원격 대상 예측 접촉에서 startAfterHit homing 투사체는 피해/CC/onHit을 확정하지 않고 hadHit 시각 궤도 상태만 활성화한다. 따라서 대상 권위의 duel-hit-confirmed 도착 여부/지연과 관계없이 공격자 화면에서도 접촉 순간 유도가 시작되며, 실제 피해·사거리 연장·재타격 확정은 기존 권위 확인 경로에서만 처리된다. 캐릭터 ID 하드코딩 없음.

3.1232: 3.1231 온라인 수정 재구현. ProjectileStateService의 네트워크 직렬화가 기존에는 projectile.return 계열만 포함해 일반 stateKey 투사체(나레 거대 종이 비행기)가 원격 actionState에 절대 바인딩되지 않던 실제 원인을 수정했다. serialize()는 이제 ProjectileService.items에 실제 존재하는 모든 stateKey 투사체의 stateKey/networkKey를 범용 전송하고 returning 데이터는 있을 때만 추가한다. applyRemote()는 networkKey→stateKey 매핑을 원격 엔티티에 저장하며 투사체 액션 패킷이 state 패킷보다 늦게 도착해도 get()이 pending networkKey로 실제 Projectile을 찾아 지연 바인딩한다. 따라서 ProjectileRideService가 원격에서도 동일 거대 비행기를 실제로 찾고 syncAll에서 캐릭터 좌표를 그 투사체 좌표에 붙인다. duel-hit-confirmed 유도 동기화는 부가 on-hit 재생 조건에서 분리했다. 공격자 소유 화면은 payload.impactMeta.projectileKey가 있으면 attack/target/피해량 조건보다 먼저 exact networkKey 원본 Projectile을 찾아 confirmAuthoritativeHit()을 1회 적용한다. 기존 뒤쪽 확정 소비 경로에서는 exact-key 투사체를 다시 confirm하지 않아 사거리 증가가 중복 적용되지 않는다. 캐릭터 ID 하드코딩 없음.

3.1231: 나레 온라인 표시/유도 동기화 수정. ProjectileRideService에 serialize/applyRemote를 추가하고 duel-state에 projectileRide를 포함해 원격 플레이어도 소유자의 탑승 projectileStateKey/rideStateKey를 복원한다. syncAll은 로컬 권위 엔티티뿐 아니라 원격 ride snapshot도 대응 투사체 위치에 플레이어 표시 좌표를 고정해 상대 화면에서도 캐릭터가 거대 종이 비행기에 탑승한 상태로 함께 이동한다. 관통 투사체의 실제 적중은 대상 권위에서 확정되지만 공격자 화면 원본 projectile에는 hadHit가 반영되지 않아 startAfterHit homing이 시작되지 않던 문제를 수정했다. NetworkHitAuthorityService의 exact projectileKey 확정 경로에서 찾은 원본 projectile에 ProjectileService.confirmAuthoritativeHit()를 호출해 hadHit, rehit 타이머, rangeExtendOnHitRatio/fadeResetTravel을 공통 반영한다. 비관통 투사체의 기존 확정 제거 규칙은 그대로 유지하며 캐릭터 ID 전용 네트워크 분기 없음.

3.1230: 나레 사거리 조정. LMB 종이 비행기 기본 사거리 1300→1000, counter 비행기 무리 기본 사거리 950→1000. 두 공격의 rangeExtendOnHitRatio를 .40→.50으로 통일해 실제 적중 때마다 각각 기본 사거리의 50%인 500만큼 최대 이동 사거리가 증가한다. counter previewGeometry range도 950→1000으로 실제 공격 사거리와 통일.

3.1229: 나레 캐릭터 설명 문구를 사용자 지정 내용으로 교체. styleLabel/tags는 `기동형 원거리 저격수` / `['기동형','저격수']`를 유지하고, desc를 `종이 비행기를 타고 압도적인 기동성으로 적을 공격하는 캐릭터`로 변경. tooltipSkills는 LMB/RMB/RMB-RMB/L-Shift 4행으로 정리하고 모든 피해 수치는 기존 `{damage}` AttackSpec 보간을 사용해 하드코딩하지 않는다. 기존 RMB/Space 설명 행은 제거. 전투 수치/동작은 변경 없음.

3.1228: 나레 밸런스/입력 수정. RMB `거대 종이 비행기` 스테미나 비용을 600→1500으로 변경하고 ability fallback resource.gte도 1500으로 통일. LMB `종이 비행기` 실제 피해를 Base Damage 150 기준 damageRatio 1→2/3으로 낮춰 100으로 조정하고 쿨다운 420→500ms. LMB ability의 inputPolicy repeatWhileHeld:false를 제거해 일반 평타 공통 홀드 반복 입력 경로를 사용하도록 복구했다.

3.1227: 나레 조정. LMB/counter 적중 사거리 증가량을 기본 사거리의 60%→40%로 감소. counter previewGeometry halfWidth를 96→132로 확대해 현재 7발 평행 탄열의 최외곽 offset ±120 + projectile radius 11을 실제로 덮도록 수정. RMB 긴급 탈출 후 기존 거대 종이 비행기가 계속 날아가더라도 새 RMB 발사를 막던 fallback의 `state.absent nare-rmb-plane` 조건을 제거했다. 새 RMB가 발사되면 동일 stateKey는 새 투사체를 가리키며 기존 투사체 객체는 ProjectileService.items에서 그대로 독립 비행한다. LMB 재사용/강화 유도 기믹을 완전히 제거해 attack.nare.lmb-retarget / attack.nare.lmb-turn-flight와 projectile.replace-attack 분기를 삭제. LMB delivery의 stateKey도 제거하고 ability는 일반 action.attack 단일 경로로 단순화해 기존 종이 비행기가 남아 있어도 쿨다운/스테미나 조건만 충족하면 새 종이 비행기를 계속 발사할 수 있다. LMB 설명에서도 재사용 관련 문구 제거.

3.1226: 나레 조정. 거대 종이 비행기 동일 대상 재타격 주기 500→1000ms. 탑승 조종 turnPerFrame .055→.035로 낮춰 방향 전환을 더 둔하게 만들고 스킬 투사체 speed 10→8. LMB와 counter delivery.projectile에 범용 rangeExtendOnHitRatio:.60을 추가해 실제 권위 적중 때마다 최초 AttackSpec 사거리의 60%를 maxTravelDistance에 추가하고, fadeResetTravel을 현재 travel로 갱신해 희미해진 일반 투사체가 다시 선명해진 뒤 추가 사거리 동안 다시 페이드한다. LMB/counter 적중 후 homing maxTurnPerFrame은 .07→.11 / .08→.12로 높여 더 강하게 유도. counter 7발의 perpendicularOffsets를 ±84→±120으로 확대해 탄간 간격을 넓혔다. 캐릭터 ID 런타임 예외 없음.

3.1225: 나레 전투/비행 수정 13건. 거대 종이 비행기에 rehitInterval:500을 적용해 다즈빈 RMB 범위 투사체와 같은 공통 재타격 경로로 동일 대상을 0.5초마다 다시 피해. ProjectileRideService에 data-driven wallPass/turnPerFrame를 추가해 탑승 시작 시 공통 BuffService wallPass를 부여하고 종료/투사체 소멸 시 제거하며 HUD WALL PASS도 동일 BuffStatusPresentation으로 표시한다. 탑승 중 Space는 정지 토글이 아니라 기존 회피를 사용하되 dodge distanceOverride 0으로 별도 회피 이동만 제거하고, 비행기 속도/이동은 계속 유지한다. expireAtRange:false 투사체를 persistent로 처리해 공격 range 기반 렌더 fade와 사거리 수명 종료를 모두 제거하고 월드 외곽에서만 제거된다. ProjectileRideService input control은 키보드 방향으로 즉시 스냅하지 않고 turnPerFrame만큼 최단각 회전하도록 변경. projectile.replace-attack이 replacement의 homing/proximity/speedStages/rehitInterval/expireAtRange 등 delivery 런타임 필드를 실제 projectile에도 갱신하도록 범용 수정해 나레 LMB 재사용의 강한 유도가 실제 적용된다. 나레 LMB의 별도 effect.spawn과 공통 attack feedback을 제거. 반격은 7개 모두 동일 각도로 직선 평행 발사하며 일반 투사체 렌더를 사용하고 explicit previewGeometry rect로 미리보기를 고정. 나레 탄속 LMB 21→16, RMB 14→10, counter 19→15. LMB 적중 후 유도 maxTurn .032→.07, counter에도 적중 후 유도 maxTurn .08 추가. 탑승 중 LMB/반격의 ride-state 차단 조건을 제거. RMB 피해 200(damageRatio 4/3), counter 타당 150(damageRatio 1)로 조정.

3.1224: 나레 7개 수정. 색상을 #cfefff→#b8dcff로 더 파랗게 조정. LMB 유도 설정이 존재하지 않는 별도 `delivery.projectile.homing` 모듈에 있어 실제 ProjectileModuleService가 읽지 못하던 문제를 수정해 `delivery.projectile.homing` 내부 데이터로 통합했다. 기본 종이 비행기는 첫 적중 전까지 직진하고 첫 적중 이후 가까운 적을 향해 천천히 회전하며, 비행 중 LMB 재사용 시 projectile.replace-attack으로 즉시 강한 유도 상태로 전환된다. LMB 전용 projectile-style을 제거해 공통 일반 투사체 렌더를 사용한다. 반격은 counter.execute에 필수 CC가 없어 CounterModuleService.validate()에서 거부되던 문제를 수정해 기존 공통 무력화 넉백 CC를 최소 거리로 부여했고 7연속 투사체 발사가 정상 실행된다. 거대 종이 비행기는 radius 56→112로 2배 확대. delivery projectile에 범용 `expireAtRange:false`를 추가해 사거리 수명 종료를 비활성화했으며, 내부 벽/적은 계속 관통하고 월드 외곽 forceBlock에서만 기존 boundary remove 경로로 소멸한다. 기존 나레 전용 NareFlightService 및 nare.flight.* Ability 모듈은 제거하고 범용 ProjectileRideService + `projectile.ride.start/exit`로 교체했다. 투사체 탑승은 자동 전진하며 WASD 입력이 있을 때 메인마드 movement.move control:'input'과 같은 절대 입력 방향 방식으로 진행 방향을 갱신한다. Space는 탑승 중 정지/재이동 토글이며 일반 회피를 실행하지 않는다. 탑승 중 플레이어의 별도 일반 WASD 이동도 차단하고 투사체 위치에 동기화한다.

3.1223: 나레 캐릭터 데이터 순서를 전체 캐릭터 목록의 마지막(아츠테오 다음)으로 이동. NareFlightService.updateAll()의 존재하지 않는 World.entities 참조를 기존 공통 EntityService.items.values() 순회로 수정해 ReferenceError 제거.

3.1222: 신규 캐릭터 나레를 추가했다. 체력 1200 / 이동속도 4.25 / 푸른 하양 계열 색상, 기동형 원거리 저격수 콘셉트다. LMB `종이 비행기`는 벽과 적을 관통하는 장거리 투사체를 발사하며 완만한 유도 성능을 기본 보유하고, 일정 시간 안 재입력 시 현재 비행 중인 종이 비행기를 더 강한 유도 비행 상태로 전환한다. RMB `거대 종이 비행기`는 delivery.range-projectile 기반의 범위 투사체로 구현했고 적중 시 강한 넉백을 준다. 발사 직후 나레가 비행기에 탑승해 마우스 방향으로 조종할 수 있으며, 재사용 시 긴급 탈출하고 Space로 정지/재이동을 토글할 수 있다. 반격 `비행기 무리`는 delivery.delayed-projectile-volley를 사용해 왼쪽에서 오른쪽으로 7개의 종이 비행기를 순차 발사한다. 별도 전용 캐릭터 하드코딩을 최소화하기 위해 능력 모듈 `nare.flight.mount` / `nare.flight.exit`와 NareFlightService를 추가했다.

3.1221: 소르 DISCHARGE 실제 미발동 수정. 3.1220에서 hitConditionMatches() 자체는 beforeHitStatuses를 받을 수 있게 변경했지만 AttackModuleService.onHit()의 실제 호출부가 여전히 `hitConditionMatches(..., module)` 형태로 남아 있어 snapshot이 전달되지 않았다. 따라서 `target.status-active-before-hit`는 1차 공통 조건 검사에서 계속 false였다. 이번에는 onHit의 정확한 호출부를 `hitConditionMatches(..., module, {beforeHitStatuses})`로 변경했다. hitConditionMatches는 이 Map을 TriggerModuleService.matches()의 context.beforeHitStatuses로 전달하며, 조건 evaluator는 같은 Map에서 타격 직전 ZAP 여부를 읽는다. 소르 LMB/반격의 실제 모듈 순서는 ZAP status.apply → 조건부 DISCHARGE status.apply 그대로이며, DISCHARGE가 실제 생성된 뒤 기존 presentationOrder chronology로 ZAP보다 최신 상태로 표시된다. 임시 delay/priority/소르 전용 렌더 없음.

3.1220: 소르 DISCHARGE 미발동의 실제 근본 원인 수정. AttackModuleService.onHit()은 `target.status-active-before-hit` 조건을 위해 타격 시작 시 beforeHitStatuses를 올바르게 스냅샷하고 있었지만, 각 모듈 실행 전에 먼저 호출되는 hitConditionMatches()가 TriggerModuleService.matches()에 beforeHitStatuses를 전달하지 않았다. 따라서 DISCHARGE status.apply는 뒤의 progressConditionsMatch()에 도달하기도 전에 첫 공통 조건 검사에서 항상 false로 탈락해 상태 자체가 생성되지 않았다. hitConditionMatches()에 선택적 conditionContext를 추가하고 onHit의 동일 beforeHitStatuses Map을 전달하도록 공통 수정했다. 이제 현재 타격 이전부터 ZAP이 있던 대상만 조건을 정확히 통과하고, 해당 타격에서 ZAP을 먼저 갱신한 뒤 DISCHARGE를 정상 적용한다. 3.1219에서 증상 우회용으로 넣은 DISCHARGE delay:1은 LMB/반격 모두 제거했다. 표시는 베르의 SLOW/STUN과 동일하게 기존 StatusPresentation의 대상 권위 presentationOrder chronology만 사용한다. 즉 같은 적중에서 ZAP 다음 DISCHARGE가 실제 적용되므로 DISCHARGE가 더 높은 presentationOrder를 받아 500ms 동안 점선링/텍스트로 표시되고, 종료 후 남은 ZAP이 다시 표시된다. 별도 priority, 소르 전용 렌더러, 캐릭터 ID 조건 없음.

3.1219: 소르 DISCHARGE 표시 수정. 베르 RMB의 SLOW→지연 STUN과 같은 기존 CC chronology 방식을 재사용한다. 소르의 조건부 DISCHARGE status.apply에 delay:1을 추가해 ZAP 적용 다음 시뮬레이션 프레임에 DISCHARGE를 실제 적용한다. 따라서 대상 권위에서 DISCHARGE가 더 최신 presentationOrder를 받아 점선링/텍스트가 ZAP보다 우선 표시되고, 500ms 종료 뒤 남은 ZAP이 다시 표시된다. 별도 상태 우선순위나 소르 전용 렌더 분기는 추가하지 않았다.

3.1218: 펠루나/소르 수정. 펠루나 RMB 스킬 스테미나 비용을 750→600으로 변경. 소르 DISCHARGE 표시는 3.1217에서 추가한 presentationPriority 방식을 전부 제거하고, 베르 RMB에서 SLOW와 STUN이 겹칠 때 STUN이 선택되는 기존 공통 `presentationOrder` chronology 방식만 사용하도록 복원했다. StatusPresentation은 presentationOrder가 있는 상태끼리는 더 큰 order를 우선하며, CombatStatusApplicationService가 실제 상태 적용 순서대로 order를 발급한다. 소르 LMB는 기존처럼 ZAP status.apply 다음에 DISCHARGE status.apply가 실행되므로 방전이 발동한 적중에서는 DISCHARGE가 더 높은 presentationOrder를 받아 점선링/텍스트가 ZAP보다 우선 표시된다. 방전 종료 후에는 남아 있는 ZAP이 다시 표시된다. 별도 상태 우선순위 숫자나 소르 ID 프레젠테이션 예외 없음.

3.1217: 라임/스야/루네프/샤이라즈/소르/셰리나 비아 조정 및 상태 표시 수정. 라임 LMB는 실제 movement.move distance가 126인데 AttackSpec/delivery range가 180으로 남아 사거리 표기가 실제 이동보다 길었으므로 둘을 126으로 통일했다. 스야 안개 기습은 attack.sya.stealth-freeze가 96이어도 stealth.toggle.detectRange 80이 실행 직전에 실제 공격 range를 덮어써 실제 판정이 80이던 중복 진실원천 문제를 수정했다. stealth.toggle에서 detectRange를 생략하면 detectAttackId의 증강 적용 후 delivery.area/AttackSpec range를 자동 사용하도록 범용화하고, 스야의 중복 detectRange를 제거했다. canonical stealth-freeze range와 delivery.area를 96→115.2(+20%)로 변경했으므로 감지 범위/실제 빙결 판정/공통 자동 area 이펙트가 모두 동일 115.2를 사용한다. 루네프 얼음 마법 range/delivery/arcSweep를 270→189(-30%), RMB 선택 비용 500→400, 최대체력 800→900. 샤이라즈 RMB 비용 800→600, 일반/반격 덫 회수 resource.restore는 기존 300을 유지해 정확히 비용의 50%로 고정. 소르 LMB 비용 250→200. 셰리나 비아 LMB 차징 비용 100~300→100~200. 소르 방전은 CombatModifierService에서 staminaRegenBlocked=true/staminaRegenMult=0으로 실제 적용되고 있었으나 온라인에서 ZAP/DISCHARGE status packet 도착 순서가 뒤바뀌면 StatusPresentation의 '가장 최근 상태' 선택 때문에 ZAP 링이 방전 500ms를 가릴 수 있었다. COMBAT_STATUS_DEFS에 선택적 presentationPriority를 추가하고 StatusPresentation.selected가 우선순위를 chronology보다 먼저 비교하도록 범용화했다. discharge만 priority 10을 선언해 활성 중에는 노란 주황 DISCHARGE 점선링이 ZAP보다 우선 표시되고, 방전 종료 후 ZAP 표시로 복귀한다. 캐릭터 ID 전용 프레젠테이션 분기 없음.

3.1216: 모든 차징 계열 공격의 과충전 공격 판정 시점을 '최초 차징 시작 순간'으로 통일. resource.full/resource.not-full 조건은 선택적으로 resourceConditionSnapshot을 받을 수 있게 확장했고, AugmentService.captureResourceConditionSnapshot()이 health/stamina 현재값과 최대값을 데이터로 캡처한다. attackAdjustmentTotals/prepareAttack/AttackService.execute는 이 snapshot을 공통 전달하며 snapshot이 없으면 기존처럼 현재 자원을 판정한다. 표준 charge.attack은 ChargedAttackService.start()에서 스테미나를 실제 차감하기 전에 snapshot을 저장하고 release의 최종 dynamicSpec 실행까지 전달한다. 레이즈처럼 multiClick 기반 차징은 첫 유효 차징 입력 직전에 snapshot을 별도 actionState에 저장하고 최종 releaseNow의 prepareAttack에서 사용한다. 하츠하츠처럼 input.drag-path 기반 차징은 drag start에서 snapshot을 저장하고 release context를 통해 이후 action.attack에 전달한다. 따라서 메인마드/체리티/레이즈/하츠하츠 등 구현 방식과 무관하게 차징 시작 당시 최대 스테미나였다면 차징 도중 스테미나가 소모되어도 과충전 공격의 damage/projectileSpeed attackAdjustment가 최종 공격에 적용되며, 시작 당시 최대가 아니었다면 차징 중 최대치로 회복되어도 적용되지 않는다. 캐릭터 ID 하드코딩 없음. 스테미나가 없는 소환물의 기존 resource.full 판정(maxStamina<=0이면 false)은 변경하지 않음.

3.1215: 과충전 공격 HUD / 귀환 투사체 월드 경계 / 부활 DOT 사망 근본 수정. 1) 과충전 공격의 실제 효과가 3.1214에서 attackAdjustments 단일 경로로 이동하면서 effects가 비었고, BuffStatusPresentation은 BuffService만 읽어 최대 스테미나 상태의 DMG/BULLET SPD가 왼쪽 HUD에서 사라졌다. 실제 전투 효과를 다시 BuffService에 중복 등록하지 않고, attackAdjustment에 opt-in `presentationBuffs` 메타데이터를 추가했다. AugmentService.presentationAdjustmentValue()가 보유 stackCount와 동일 conditions를 공통 평가해 표시값만 계산하고, BuffStatusPresentation.value()가 기존 BuffService 값과 합쳐 보여준다. 따라서 과충전 1/2/3장일 때 실제 공격 보정과 HUD가 모두 +40/+80/+120%로 일치하며 비최대 스테미나에서는 표시도 즉시 사라진다. 증강 ID 하드코딩 없음. 2) 메이실 반격 투사체가 맵 외곽에서 사라진 원인은 projectile.return의 returnAtRange보다 월드 boundary의 기본 wall:'remove' 처리가 먼저 실행되기 때문이었다. ProjectileService.updateOutbound()에서 returnAtRange 귀환 무기가 월드 경계에 도달하면 경계 wall 처리 전에 clamp 후 ProjectileStateService.beginReturn()하도록 공통 종료 우선순위를 수정했다. 따라서 메이실뿐 아니라 동일 returnAtRange 계약을 사용하는 귀환 무기는 사거리보다 먼저 맵 외곽을 만나도 정상 귀환한다. 내부 벽 규칙은 변경 없음. 3) 부활 증강 survival.revive-delay는 치명 피해를 체력 1로 되돌린 뒤 1초 REVIVE 상태 동안 evasionInvulnerable만 부여했는데, StatusDamageService는 DOT에 ignoreEvasionInvulnerable:true를 사용하므로 파이어볼 화염 같은 후속 DOT가 그 1HP를 다시 깎아 부활 대기 중 실제 사망시킬 수 있었다. 부활 전환 시간의 보호를 공통 invulnerable 버프로 변경해 직접 피해와 burn/poison/bleed/freeze 등 모든 DamagePipeline 피해를 동일하게 차단한다. 부활 완료 시 같은 sourceId의 invulnerable을 제거하며 사용 횟수/1초 대기/체력·스테미나 완전 회복/라임 replacement-state 보존은 유지.

3.1214: 밸런스/버그 수정 20건.
1) 코녕 RMB 비용 350→500.
2) 루네프 원소 선택 선딜 400→300ms.
3) 루네프 화염 마법/폭발 피해 350→400.
4) 루네프 얼음 마법 사거리/부채꼴/FX 180→270(+50%).
5) 하푸푸 LMB 넉백 70→35.
6) 하푸푸 최대 체력 1200→1000.
7) 라임 LMB 몸통박치기 이동거리 180→126(-30%), 공격 판정 사거리 180은 유지.
8) 다즈빈 RMB 비용 600→700.
9) 인투 저격 반격 투사체 탄속 38→49.4(+30%).
10) 셰리나 비아 LMB 직접 피해 200→300(damageRatio 1→1.5).
11) field.expand-recent에 범용 triggerOnEnter override 전달을 추가하고 셰리나 RMB 확장 잔향에 triggerOnEnter:true를 지정해 적이 밟는 즉시 첫 피해가 발생.
12) 셰리나 비아 반격 직접 피해 200→300(damageRatio 1→1.5).
13) 스야 안개 기습 빙결 공격 반경 80→96(+20%).
14) 메라 모나 변신 스킬 넉백 70→140.
15) 메라 모나 투사체형 평타 탄속 28→32.2(+15%); IV 즉발 레이저는 기존 즉발 유지.
16) 스피드 샷 탄속 증가 +30%→+20%.
17) 버서커 피해 1당 스테미나 회복 3→2.
18) 부활 최대 체력 감소 -30%→-40%.
19) 절박한 마음 저체력 회피속도 최대 +100%→+300%(missing-health-ratio to 1→3).
20) 과충전 공격은 resource.changed/rebuilt modifier 버프와 attackAdjustments가 혼재해 공격 비용 지불 타이밍에 따라 해제/중복될 수 있던 구조를 제거. 실제 효과를 기존 attackAdjustments 단일 경로로 통합해 최대 스테미나에서 비용 지불 전 damageBonus +40%와 projectileSpeedBonus +40%를 스냅샷하고, attackAdjustmentTotals의 기존 stackCount 배율로 장수만큼 중첩. 새 전투 모듈/캐릭터 ID 런타임 분기 없음.

3.1213: 아츠테오/큐리/로온 수정. 아츠테오 회전 원석에 기존 projectile.collision wall:'clamp'를 복구해 projectile.pierce walls:true는 유지하면서 내부 벽은 통과하고 월드 외곽 forceBlock에서는 셸로 방패와 같은 clamp 경로로 막혀 사라지지 않게 했다. 원석 로컬/원격 시각 차이를 줄이기 위해 OrbitInventoryService snapshot에 실제 증강 반영 후 phaseSpeed와 orbitRadius를 포함하고, 원격 applyRemote가 전송된 phaseSpeed로 네트워크 지연만큼 위상을 보정하고 동일 orbitRadius를 기준으로 시작하도록 변경했다. 큐리 LMB progressScale 최대 damageRatio를 3→2로 낮춰 Base Damage 200 기준 최대 피해를 600→400으로 조정했다. 로온 RMB 적중 장판 누락은 온라인 대상 권위 확정 시 공격자 화면에서 원본 Projectile이 이미 사라져 projectile.impact target 후처리가 실행되지 않을 수 있던 공통 문제였다. duel-hit-confirmed의 비관통 projectile 처리에 원본 투사체 미존재 fallback을 추가해 실제 impact point + 기존 AttackSpec의 projectile.impact 설정으로 임시 carrier를 구성하고 기존 ProjectileImpactService.resolve(...,'target')를 그대로 재사용한다. execution effect key로 중복 target impact를 방지한다. 캐릭터 ID 전용 런타임 분기나 새 전투 모듈 없음.

3.1212: 공유 증강 `과충전 공격` 중첩 불가 버그 수정. 과충전 활성(resource.changed full)과 증강 rebuild full 경로의 damage/projectileSpeed modifier.set에 `perStack:false`가 지정되어 있어 AugmentEffectModuleService가 보유 장수 count를 곱하지 못하고 항상 +40% 한 장분만 BuffService에 설정하던 원인이었다. 해당 플래그 4개를 제거해 기존 modifier.set 공통 기본 규칙(`resolvedModifierValue * count`)을 그대로 사용한다. 따라서 과충전 공격 1/2/3장 보유 시 최대 스테미나 상태의 DMG와 BULLET SPD modifier는 각각 +40/+80/+120%로 중첩된다. resource.full 조건, 비최대 스테미나 시 modifier.remove, 기존 attack adjustment/비용 지불 전 준비 구조는 변경하지 않았고 새 모듈/증강 ID 런타임 분기는 추가하지 않음.

3.1211: 스야 RMB MELEE `안개 기습` 비용 표기 규칙 수정. 3.1210에서 비용을 숨기도록 `showCost:false` 처리한 것을 취소하고, 사용 스테미나가 없는 스킬은 명시적으로 `costText:'스테미나 0'`을 표시하도록 변경했다. 따라서 안개 기습 설명에는 `스테미나 0`이 표시된다. RMB RANGED `서리안개 은신`의 `스테미나 400~1000` 표기와 실제 전투 로직/비용은 변경하지 않음.

3.1210: 스야 RMB MELEE `안개 기습` 설명에 스테미나 400이 잘못 표시되던 문제 수정. RMB RANGED와 RMB MELEE가 동일한 attack.sya.rmb를 설명 참조용으로 공유하면서 CharacterDescriptionService가 기본 AttackSpec cost 400을 두 설명 모두에 자동 표시하고 있었다. 안개 기습은 독립 입력 비용을 소모하는 스킬이 아니라 은신 중 근접 감지로 전환되는 효과이므로 해당 tooltip entry에 기존 공통 showCost:false를 사용해 비용 표기만 숨겼다. 서리안개 은신의 `스테미나 400~1000` 표기와 실제 전투 비용/은신 로직은 변경하지 않음. 새 모듈/캐릭터 전용 런타임 분기 없음.

3.1209: 하푸푸/스야 지속 스킬 설명과 스테미나 비용 표기 정리. 하푸푸 RMB 설명을 `이동속도 {sustainSpeedPercent}% 증가 및 벽 통과. 사용 도중 스테미나를 소모하며 재사용 시 해제`로 변경하고, costText를 `초당 스테미나 {sustainDrainPerSecond}`로 지정해 sustain.toggle.drainPerSecond 실제 값을 표시한다(현재 400/초). 스야 RMB RANGED의 비용 표기는 `스테미나 {skillCost}~{stealthMaxStaminaCost}`로 변경했다. CharacterDescriptionService에 범용 skillCost와 stealthMaxStaminaCost 보간값을 추가했으며, stealthMaxStaminaCost는 AttackSpec 시작 비용 + stealth.toggle.drainPerSecond × maxDuration으로 계산한다. 현재 스야는 400 + 150×4 = 1000이므로 `스테미나 400~1000`으로 표시된다. 캐릭터 ID 하드코딩 없이 현재 스킬/모듈 데이터에서 계산하며 전투 로직과 수치는 변경하지 않음.

3.1208: 레이즈 캐릭터 설명 문구를 사용자 지정안으로 교체하고 설명 값 해석을 공통 데이터 기반으로 정리. LMB NEAR='수동 차징' / LMB FAR='파워 펀치' / RMB='점프' / L-Shift='카운터 펀치' 문구를 반영했다. LMB FAR은 costText:'스테미나 0'을 유지한다. {multiClickMax}는 캐릭터별 상수나 Raise ID 분기 없이 CharacterDescriptionService가 현재 attack.multiClick.maxClicks를 읽는 공통 보간값을 사용한다. {minDamage}/{maxDamage}/{damage} 역시 기존 공통 AttackSpec/ProgressScale 해석 경로를 그대로 사용하며 레이즈 전용 설명 분기는 추가하지 않았다. 전투 동작/수치에는 변경 없음.

3.1207: 레이즈 LMB FAR 스테미나 해석 및 설명 정정. 3.1206에서 잘못 추가한 범위 밖 즉시 발사의 clickCost 차감을 제거해 LMB FAR은 다시 스테미나 0으로 동작한다. 범위 안 LMB NEAR 연타만 기존 clickCost:30을 사용한다. LMB FAR 설명에 costText:'스테미나 0'을 명시하고, 현재 저장 차징량을 전부 소모해 즉시 공격하며 차징이 없을 때만 최소 차징 공격이 나간다는 문구로 정리했다. 범위 안 무제한 차징/연타 중단 자동발사 없음/최대 15회/RMB 고정거리 구조는 유지.

3.1206: 레이즈 LMB FAR 스테미나 비용 누락 수정. 3.1205의 범위 밖 즉시 발사 경로 `fireStoredOrMinimum()`이 기존 multi-click press의 clickCost 차감 경로를 우회해 스테미나를 소모하지 않던 문제를 수정했다. 이제 범위 밖 LMB도 발사 전에 config.clickCost를 동일하게 차감하며, 레이즈는 기존 설정 clickCost:30에 따라 스테미나 30을 소모한다. 스테미나가 부족하면 공격은 발동하지 않는다. 온라인 원격 재생은 기존 원칙대로 자원을 이중 차감하지 않도록 network 컨텍스트를 전달한다. 저장 차징 소모 발사/0차징 최소 1단계 발사/범위 안 무제한 차징/자동발사 없음/RMB 고정거리 동작은 유지.

3.1205: 레이즈 LMB 범위 내/외 동작 및 설명 수정. 범위 밖 LMB는 기존 3.1204처럼 항상 1충전으로 덮어쓰지 않고, 이미 raise-punch-charge가 있으면 현재 저장된 충전량을 그대로 소모해 발사하며 충전이 전혀 없을 때만 최소 1충전 공격으로 발사한다. MultiClickAttackService의 범용 outside-fire helper를 fireStoredOrMinimum으로 교체했다. 범위 안 연타 중단 시 즉시 발사되던 원인은 unlimitedWindow 모드에서도 기존 idleRelease fallback이 0ms timed-action을 열고 scheduleRelease를 예약하던 것이었다. unlimitedWindow에서는 idle-release fallback 자체를 생성하지 않도록 수정해 범위 안에서는 클릭을 멈춰도 절대 자동 발사되지 않는다. 레이즈 설명은 LMB NEAR(범위 안 연타 차징) / LMB FAR(범위 밖에서 현재 충전량 소모 발사)로 분리했고, RMB 설명도 고정 거리 도약에 맞췄다. 최대 15회, 무제한 유지, 회피/이동기 중 입력 차단, RMB 고정 336 이동은 유지.

3.1204: 레이즈 LMB 범위 내/외 입력 동작 분리. multiClick에 범용 fireOutsideAsMinimum 옵션을 추가했다. 레이즈는 반경 200 밖에서 LMB를 누르면 현재 저장 차징량과 무관하게 progress를 1로 임시 설정한 최소 차징 공격을 즉시 발사한다. 반대로 반경 200 안에서는 클릭이 차징만 누적되며, 마우스 이동으로 범위를 벗어났다는 이유만으로 자동 발사하지 않도록 releaseOnAimExit를 true→false로 변경했다. 따라서 범위 안에서 연타를 멈춰도 공격은 절대 자동 발사되지 않고, 이후 범위 밖에서 LMB를 눌렀을 때 최소 차징 공격이 즉시 나간다. 무제한 유지, 최대 15회, 회피/이동기 중 입력 차단, RMB 고정 336 이동은 유지. 캐릭터 ID 런타임 분기 없음.

3.1203: 레이즈 LMB 최대 연타 수를 10→15로 복원. multiClick maxClicks를 15로 변경하고 progressScale valueRange 최대값 및 반격의 raise-punch-charge/raise-punch-boost 최대 진행도도 15로 동기화했다. 3.1202의 무제한 유지, 반경 200 내부 연타, 범위 이탈 즉시 발사, 회피/이동기 중 입력 차단, RMB 고정 336 이동 구조는 유지한다.

3.1202: 레이즈 LMB 입력/발사 방식과 RMB 이동 방식 변경. 레이즈 파워 펀치는 기존 2초 fixed-window를 제거하고 multiClick의 범용 unlimitedWindow + activationRange + releaseOnAimExit를 사용한다. 소유자에게 큐리와 같은 반경 200 점선 원을 표시하며, 마우스가 원 안에 있을 때만 LMB 연타가 충전되고 시간 제한 없이 유지된다. 마우스가 원 밖으로 나가는 프레임에 즉시 현재 충전량으로 발사한다. 최대 클릭 10은 유지하되 10회 도달 자체로 자동 발사하지 않으며, progressScale 최대 단계도 15→10으로 동기화해 10회가 실제 최대 피해/사거리가 된다. MultiClickAttackService에 캐릭터 ID 없는 unlimitedWindow/activationRange/releaseOnAimExit/blockWhileDodging/blockWhileMovement 옵션과 로컬 aim-exit update를 추가했다. TriggerConditionService에는 범용 combat.not-dodging / movement.inactive 조건을 추가하고 레이즈 LMB/RMB에 적용해 회피 또는 이동기 중 입력을 막는다. 레이즈 RMB movement.move는 direction:'target-point'→'attack'으로 바꾸고 captureTargetPoint를 제거해 마우스 거리와 무관하게 항상 336 고정 거리 이동한다. 반격 +4 충전, 스테미나/피해/기절/쿨다운 등 나머지 수치는 유지.

3.1201: 레이즈 LMB 파워 펀치 입력 규칙 변경. multiClick 최대 클릭 수를 15→10, 고정 입력창을 3초→2초로 변경했다. 레이즈에서 progressiveWindow 설정을 제거해 클릭 수와 관계없이 첫 입력부터 정확히 2초의 고정 입력창을 사용한다. 10회 도달 시 기존 fireOnMax 규칙으로 즉시 발사하며, 10회 미만이면 2초 종료 시 현재 충전량으로 발사한다. 반격의 raise-punch-charge / raise-punch-boost 최대 진행도도 새 최대치에 맞춰 15→10으로 동기화했다. MultiClickAttackService의 범용 progressiveWindow 지원은 다른 향후 데이터용으로 유지하며 레이즈에서는 사용하지 않는다.

3.1200: 레이즈 LMB progressiveWindow 최소 자동 발사 대기시간 조정. 1클릭 기준 minDuration을 500ms→1500ms로 변경했다. 14클릭 maxDuration 3000ms와 15클릭 fireOnMax 즉시 발사 규칙은 유지하며, 2~13클릭 대기시간은 1.5~3.0초 사이를 선형 보간한다. 다른 전투 수치는 변경하지 않음.

3.1199: 레이즈 LMB progressiveWindow 최소 자동 발사 대기시간 조정. 1클릭 기준 minDuration을 80ms→500ms로 변경했다. 14클릭 maxDuration 3000ms와 15클릭 fireOnMax 즉시 발사 규칙은 유지하며, 2~13클릭 대기시간은 0.5~3.0초 사이를 선형 보간한다. 다른 전투 수치는 변경하지 않음.

3.1198: 레이즈 LMB 파워 펀치 자동 발사 대기시간을 클릭 수 비례형으로 변경. MultiClickAttackService에 범용 progressiveWindow 설정을 추가했다. 설정 시 lifetime 종료시간은 현재 클릭 수에 따라 minClicks~maxClicks 구간에서 minDuration~maxDuration을 선형 보간하며, 추가 클릭 성공 때마다 현재 시점 기준으로 종료 예약을 갱신한다. 레이즈는 1클릭=80ms, 14클릭=3000ms로 설정해 1회 입력은 거의 즉시 발사되고 클릭 수가 많을수록 자동 발사가 늦어진다. 15클릭은 기존 fireOnMax 규칙대로 즉시 발사한다. 클릭당 스테미나, 피해/사거리 progressScale, 반격 +4 진행도, 미리보기/게이지 구조는 유지. 캐릭터 ID 런타임 분기 없음.

3.1197: 아츠테오 원석 회전 반경 및 셸로 방패 렌더 도달성 보정. 아츠테오 fixed 원석 회전 반경을 75→100으로 변경해 orbitRadiusMin/Max를 모두 100으로 통일했다. 셸로 LMB/일반 반격의 range-projectile presentation에 범용 `renderReachability:'orbit-center-clamp'`를 지정했다. ProjectileVisualPositionService는 이 옵션이 있는 비벽관통 orbit 렌더의 현재 화면 위치가 orbit 중심에서 raycast로 도달 불가능한 경우, 현재 프레임 orbitState.desiredX/Y를 기준으로 다시 raycast해 도달 가능한 정확한 접촉 위치로 렌더 좌표를 즉시 재배치한다. 실제 projectile 충돌/피해 위치와 wall:'clamp' 게임플레이는 변경하지 않고 렌더 위치만 교정한다. 셸로 패리 반격은 walls:true이므로 대상에서 제외. 새 전투 모듈/캐릭터 ID 런타임 분기 없음.

3.1196: 아츠테오 RMB/RMB 설명의 `0초` 보간 오류 수정 및 동일 유형 재발 방지. CharacterDescriptionService.abilityForSkill()이 기존에는 tooltip의 `attack`에 직접 연결된 Ability만 찾았기 때문에, 아츠테오처럼 설명 피해는 `rmbLand`를 사용하지만 실제 입력/재사용 모듈은 `rmb` Ability에 있는 구조에서 ability=null이 되어 `recastWindowSeconds`가 undefined→0초로 표시됐다. abilityForSkill을 범용 확장해 attack뿐 아니라 costAttack/baseAttack/progressAttack/detailAttack 참조도 실제 AttackSpec id를 통해 Ability로 역해석한다. 또한 재사용 설명 보간은 현재 Ability에서 orbit.inventory-recast를 못 찾을 경우 캐릭터 내 해당 모듈을 가진 Ability가 정확히 하나일 때만 안전하게 fallback하며, 모듈 자체가 없으면 누락값을 숫자 0으로 위장하지 않도록 빈 값으로 유지한다. 아츠테오 현재 재사용 창은 실제 데이터 window:800을 읽어 `0.8초`로 표시된다. 전투 로직/수치는 변경하지 않음.

3.1195: 하푸푸 RMB `나 잡아봐라!` 자원/지속시간 조정. 발동 자체 스테미나 비용을 완전히 제거하기 위해 attack.hapupu.rmb cost를 400→0, sustain.toggle activationCost도 400→0으로 맞췄다. 지속 중 스테미나 소모는 초당 250→400으로 증가. maxDuration은 4000ms→0으로 변경해 기존 SustainedBuffModeService의 무제한 지속 경로(Infinity)를 사용하며, 스테미나 부족/재입력/사망 시에만 종료된다. 종료 후 기존 cooldownOnStop 500ms, 이동속도 +45%, wallPass 효과는 유지한다. 새 모듈/캐릭터 ID 분기 없음.

3.1194: 아츠테오 회전 원석 벽 관통 복구 및 회전 반경 축소. `attack.atsuteo.ore-hit`의 projectile.pierce walls를 false→true로 되돌리고 3.1193에서 추가했던 wall:'clamp'를 제거해 회전 원석이 다시 내부 벽을 그대로 관통하도록 했다. 아츠테오 orbitInventory의 fixed 회전 반경은 187→75로 변경했으며, fixed 모드이므로 min/max를 모두 75로 맞췄다. 적 관통은 기존 false라 적중 시 원석 소모 규칙은 유지한다. 반격 원석의 별도 counterOrbitRadiusOffset 34, 회전속도/피해/품질/스킬 수치는 변경하지 않음.

3.1193: 아츠테오 최대 체력 및 회전 원석 벽 충돌 조정. `maxHealth`를 1100→1300으로 변경했다. `attack.atsuteo.ore-hit`의 projectile.pierce walls를 true→false로 변경하고 기존 `projectile.collision wall:'clamp'` 및 `wallCollisionMode:'center'`는 유지했다. 따라서 일반/반격 회전 원석은 셸로 방패와 동일한 공통 clamp 경로를 사용해 내부 벽과 맵 외곽에 막히되 삭제되지 않고, 벽을 통과하지 않는다. 적 관통은 기존 false라 적중 시 원석 소모 규칙은 유지한다. 새 모듈/캐릭터 ID 분기 없음.

3.1192: 하푸푸 술래 표식 중복 적용 및 시간 만료 제거. 온라인 원격 대상 적중에서 stack.mark가 전용 duel-stack-mark-confirmed와 공통 duel-hit-confirmed 양쪽에서 재생되어 평타 1회당 표식이 2중첩되던 구조를 제거했다. 전용 StackMarkNetworkService/Runtime, 전용 패킷 허용/수신 분기를 삭제하고 온라인 원격 적중의 source on-hit 효과는 기존 공통 duel-hit-confirmed 한 경로만 사용한다. StackMarkService는 duration<=0을 무기한 표식으로 범용 지원하도록 expiresAt/serialize/applyRemote를 정리했고, 하푸푸 LMB 표식 duration을 5000ms→0으로 변경했다. 따라서 시간 경과로 표식은 사라지지 않으며 기존 breakDistance 450 이탈 폭발, 반격 수동 폭발, 대상/소스 사망 정리는 유지된다.

3.1191: 온라인 stack.mark 적중 시 `Cannot assign to read only property 'sequence'` 예외 수정. `StackMarkNetworkService`는 Object.freeze된 서비스 객체인데 내부 `sequence:0`을 `++this.sequence`로 직접 변경하고 있어, 원격 대상 권위 화면에서 stack.mark confirm 패킷을 처음 전송하는 순간 TypeError가 발생했다. 가변 네트워크 시퀀스를 별도 `StackMarkNetworkRuntime.sequence`로 분리하고 frozen 서비스는 메서드 정의만 유지했다. 동일한 frozen-service 직접 가변 필드 패턴을 추가 점검했으며 실제 `++this.*` 직접 변경은 StackMarkNetworkService 한 곳만 확인됐다. 표식 적용/중첩/폭발/네트워크 dedupe 규칙은 변경하지 않음.

3.1190: 아츠테오 RMB 범위/연사/재사용 창 조정. attack.atsuteo.rmb 쿨다운을 400→800ms로 변경했다. 광석 발견 착지 범위는 기본 120→60(-50%)으로 줄였고, 기존 회당 +15% 재사용 증폭을 새 기본값에 그대로 적용해 단계별 범위를 60→69→79.35→91.2525→104.940375로 조정했다. delivery.area, mine-area, effect.spawn 범위도 같은 값으로 동기화했다. 기존 orbit.inventory-recast 모듈을 범용 확장해 `windowAfterCooldown:true + cooldownAttackId`를 지원하며, 아츠테오는 RMB 쿨다운이 실제로 끝난 시점부터 추가 800ms 동안 재사용 가능하도록 설정했다. 따라서 공격 후 0.8초 쿨다운은 재사용 가능시간에서 제외되고, 쿨다운 종료 후 별도 0.8초 창이 존재한다. RMB 이동거리 270, 피해 50, 비용 300, 재사용 증폭 +15%, 원석 규칙은 유지한다. 캐릭터 ID 분기/새 모듈 없음.

3.1189: 아츠테오 최대 체력 조정. `GAME_DATA.characters.atsuteo.maxHealth`를 1500→1100으로 변경했다. 피해, 스테미나, 이동속도, 원석/회전/스킬/반격 규칙은 변경하지 않음.

3.1188: 아츠테오 회전 원석 반경 조정. OrbitInventoryService의 기존 적 거리 맞춤 계산을 유지하되 데이터 기반 `orbitRadiusMode:'fixed'`를 범용 추가해, 해당 모드에서는 nearestEnemyOrbitTarget을 사용하지 않고 항상 설정된 최대 회전 반경을 사용하도록 했다. 아츠테오 orbitInventory에 fixed 모드를 적용하여 적이 가까워져도 회전 반경이 줄어들지 않는다. 동시에 일반 회전 반경을 220→187(-15%), 최소 반경 데이터도 90→76.5(-15%), 반격 원석 외곽 오프셋을 40→34(-15%)로 조정해 일반/반격 회전 범위를 모두 동일 비율로 축소했다. 범위 증폭 증강의 rangeScaleTags 적용, 회전속도, 원석 피해/품질/소모 규칙은 변경하지 않음. 캐릭터 ID 분기 없음.

3.1187: 아츠테오 밸런스 조정. LMB `떠오르는 원석` 직접 타격 피해를 Base Damage 150 기준 150→50으로 낮춰 damageRatio 1→1/3, 스테미나 비용을 160→200으로 변경했다. RMB `광석 발견` 착지 직접 피해를 200→50으로 낮춰 attack.atsuteo.rmb-land damageRatio 4/3→1/3로 변경했다. RMB 연속 재사용 범위 증폭은 회당 +30%→+15%로 낮췄으며, 5단계 실제 범위를 120→138→158.7→182.505→209.88075로 맞추기 위해 progressScale factor와 range/moduleValues의 최대값을 모두 동일하게 갱신했다. RMB 이동거리/비용/재사용 창, 원석 피해·품질·회전, 반격 피해는 변경하지 않음.

3.1186: 3.1185의 아츠테오 원석 맵 외곽 관통을 취소하고 셸로 방패와 같은 clamp 방식으로 변경. 3.1185에서 추가한 projectile.pierce boundaries 범용 옵션과 월드 경계 bypass를 제거했다. attack.atsuteo.ore-hit은 내부 벽 관통용 projectile.pierce walls:true를 유지하면서 기존 projectile.collision wall:'clamp'를 추가해 월드 외곽 forceBlock 시 원석이 삭제되지 않고 경계에 막히도록 했다. delivery.projectile의 wallCollisionMode:'center'도 유지하므로 셸로 방패처럼 투사체 중심이 맵 외곽에 닿는 시점이 경계 기준이다. 적 관통은 false라 적중 시 원석 소모 규칙은 그대로이며, 내부 맵 벽은 기존대로 관통한다. 새 모듈/캐릭터 ID 분기 없음.

3.1185: 아츠테오 회전 원석의 맵 외곽 관통 적용. 기존 내부 벽 관통은 projectile.pierce walls:true였지만 ProjectileService의 월드 경계 처리는 항상 forceBlock:true로 clamp/remove하여 원석이 맵 외곽에 닿으면 사라질 수 있었다. 기존 projectile.pierce 모듈을 범용 확장해 선택적 boundaries:true를 추가하고, 이 값이 명시된 투사체는 WorldBounds 바깥에서도 clamp/finish 없이 실제 좌표와 궤도를 계속 유지한다. attack.atsuteo.ore-hit에 boundaries:true를 적용해 일반/반격 회전 원석 모두 맵 외곽을 그대로 관통한다. targets:false이므로 적 적중 시 소모 규칙은 유지하고, 다른 투사체의 기존 월드 경계 충돌은 변경하지 않음. 새 서비스/캐릭터 ID 분기 없음.

3.1184: 레비나 삼지창이 온라인에서 적중 확정 시 사라지던 회귀 버그 수정. `duel-hit-confirmed`의 projectileKey 정확 일치 경로가 3.1170 이후 projectile.pierce/collisionPolicy를 검사하지 않고 찾은 투사체를 무조건 finish/remove하고 있었다. 구형 execution fallback은 이미 passEnemies를 검사했지만 exact-key 경로에는 누락되어, targets:true인 레비나 지속 창도 적에게 실제 적중하는 순간 공격자 화면에서 삭제될 수 있었다. 확정 제거 직전에 공통 collisionPolicy를 다시 해석하고 passEnemies!==true인 비관통 투사체만 소비하도록 통일했다. 따라서 레비나 LMB/RMB/경유지/귀환 창은 적중 후에도 유지하며, 일반 비관통 총알의 확정 적중 제거는 그대로 동작한다. 캐릭터 ID 예외나 새 모듈 없음.

3.1183: 로온 RMB 빙수 지대가 적에게 맞지 않아도 생성되던 버그 수정. `ProjectileImpactService.resolve()`의 기존 범용 `impact.field.reasons` 필터를 재사용해 `attack.roon.rmb`의 projectile.impact.field에 `reasons:['target']`를 지정했다. 이제 빙수 투사체가 실제 적에게 충돌한 경우에만 `roon-slush-zone`이 생성되며, 사거리 종료/맵 경계/기타 비적중 종료에서는 장판이 생성되지 않는다. 적중 시 로온이 착탄점으로 이동하는 sourceRelocate(target 전용)와 기존 실패 쿨다운 처리, 빙수 지대 범위/지속시간/감금 동작은 변경하지 않음. 새 모듈/캐릭터 전용 분기 없음.

3.1182: 하푸푸 평타 연사속도 너프. `attack.hapupu.lmb` 재사용 대기시간을 300ms에서 500ms로 변경해 평타 공격 간격을 0.5초로 조정했다. 피해, 스테미나 200, 사거리, 표식 및 넉백 규칙은 변경하지 않음.

3.1181: 하푸푸 LMB 설명 문구 수정. `적을 밀치며 피해 및 넉백, 술래 표식 1중첩. 최대 {markMaxStacks}중첩. 적과 일정 거리 이상 멀어질 시 표식 폭발 ({damage}/{markMinBurstDamage}~{markMaxBurstDamage})`로 변경했다. 표식 최대 중첩/폭발 피해 플레이스홀더는 기존 실제 stack.mark 데이터 참조를 유지하며 전투 로직과 수치는 변경하지 않음.

3.1180: 하푸푸 술래 표식 시간 만료 폭발 제거. 기존 StackMarkService.update()가 expiresAt 만료와 breakDistance 이탈을 모두 burst()로 처리하던 구조를 범용화해 stack.mark에 burstOnExpire 옵션을 추가했다. 기본값은 true로 유지해 기존 stack.mark 동작을 바꾸지 않고, 하푸푸 LMB 표식에만 burstOnExpire:false를 지정했다. 따라서 하푸푸 표식은 5초가 지나면 피해 없이 제거되며, 거리 450 초과 이탈 시 폭발과 반격 operation:'burst'에 의한 수동 폭발은 그대로 유지한다. burstOnExpire는 stack mark 네트워크 snapshot에도 동기화한다.

3.1179: 하푸푸 밸런스 조정. LMB `네가 술래!` 스테미나 비용을 150→200으로 변경. 술래 표식 평타 적용을 stack.mark operation `add-or-burst-at-max`에서 기존 범용 `add`로 변경해 5중첩 도달 후 추가 평타를 맞아도 5중첩을 유지/지속시간만 갱신하며 자동 폭발하지 않게 했다. 표식 폭발은 기존 반격의 stack.mark operation `burst` 및 거리/시간 만료 규칙에서만 발생한다. RMB `나 잡아봐라!`의 AttackSpec cost를 400으로 변경하고 sustain.toggle에 범용 activationCost:400을 추가했다. sustain.toggle은 비활성→활성 전환 때만 activationCost를 실제 StaminaService로 차감하며, 재사용 해제 시에는 시작 비용을 다시 소모하지 않는다. 온라인 원격 재생은 로컬 자원 이중 차감을 하지 않으며 시작 실패 시 선차감 비용을 복구한다. 기존 지속 중 초당 스테미나 250 소모는 유지. 새 모듈/캐릭터 ID 분기 없음.

3.1178: 레이즈 파워 펀치가 간헐적으로 3초 종료 시 발사되지 않던 fixed-window 상태 경합 수정. MultiClickAttackService가 fireOnWindowEnd/fireOnMax/cancelOnWindowEnd를 사용하는 lifetime timed-action-state를 열 때 완료 후 최소 100ms(또는 4프레임)의 retainCompleteMs를 부여한다. 기존에는 레이즈 raise-punch-charge-window가 정확히 expiresAt에서 만료되며, 같은 프레임에 게이지/상태 조회가 TimedActionStateService.state()를 먼저 호출하면 state가 삭제된 뒤 scheduleFixedWindowEnd continuation이 currentRaw!==expectedLifetime로 종료되어 충전 진행도만 남고 공격이 발사되지 않을 수 있었다. 이제 원래 3000ms 발사 시점은 그대로 유지하면서 예약 continuation이 상태를 소비할 수 있을 만큼만 객체를 보존한다. 3.713에서 idle-release에 적용했던 동일 계열 race 보호를 fixed-window에도 범용 확장한 것이며 레이즈 ID 예외는 없음.

3.1177: 마스터 V 캐릭터 칭호 추가. CharacterTitleService의 기존 공통 titles 맵에 하푸푸 `영원한 친구`, 아츠테오 `광석 전문가`를 추가했다. 카드/프로필의 기존 마스터 V 칭호 표시 조건과 그라데이션/렌더 구조는 변경하지 않음.

3.1176: 캐릭터 카드 거리 스타일 기준을 다시 정정. 거리 분류는 평타만 보며, 일반 평타는 기본 사거리, 차징 평타는 최대 차징 시 실제 사거리를 사용한다. RMB/일반 스킬/반격/소환수 사거리는 제외하고, 차징이 아닌 성장·단계 강화로 평타 사거리가 늘어나는 경우는 초기 평타 사거리를 유지한다. 차징 평타 최대 사거리 기준: 메인마드 200, 메후구 220, 셰리나 비아 798, 나남낭 600, 레이즈 192, 큐리 300. 따라서 셰리나 비아는 원거리 저격수, 나남낭은 중거리 탱커, 메인마드/메후구/레이즈/큐리는 근거리로 분류한다. 인투의 반격형 중거리 딜러 변경은 유지. 전투 수치와 입력 동작은 변경하지 않음.

3.1175: 캐릭터 카드 거리 스타일 판정 기준을 사용자 정정에 맞춰 '평타 기본 사거리만'으로 재검수. RMB/스킬/반격/소환수 사거리는 거리 분류에 사용하지 않고, 평타가 차징/성장/강화로 사거리가 변하는 경우에도 최초 기본 평타 사거리만 사용한다. Duels 3 거리 기준(≤150 초근거리 / ≤400 근거리 / ≤750 중거리 / ≤1000 원거리 / >1000 초장거리)에 따라 전체 46명의 styleLabel 거리 단어를 다시 계산했다. 예: 파비 평타 900→원거리, 셰리나 비아 평타 초기 159.6→근거리, 룰리 평타 1단계 90→초근거리, 나남낭 평타 기본 110→초근거리. 3.1174에서 스킬 사거리까지 반영해 변경됐던 일부 캐릭터는 평타 기준으로 원복. 인투는 성향을 파워형에서 반격형으로 변경해 styleLabel과 캐릭터 tags를 함께 반영. 전투 수치는 변경하지 않음.

3.1174: 캐릭터 카드 거리 스타일 전수 검수 및 정정. 거리 판정은 Duels 3 기준(≤150 초근거리 / ≤400 근거리 / ≤750 중거리 / ≤1000 원거리 / >1000 초장거리)을 사용한다. 반격기 사거리와 순수 이동기 이동거리는 메인 교전거리에서 제외한다. 기본 RMB 스킬이 실제 공격/설치/소환 공격으로 여러 사거리를 가지면 그 스킬의 가장 긴 실제 유효 사거리를 사용한다. 평타가 차징/성장/강화로 사거리가 늘어나는 경우에는 강화 전 최초 사거리를 사용한다. 슈비 근→중, 타우 근→중, 메이실 근→중, 에라 파비 근→원, 샤이라즈 근→중, 헤르쟝 원→초장, 프릴 근→원, 다즈빈 중→원, 로온 근→중, 펠루나 초근→중, 나남낭 중→초근, 레이즈 근→초근, 셰리나 비아 원→근, 소르 중→원, 룰리 중→초근, 레테 중→원, 큐리 근→초근, 하푸푸 근→초근, 아츠테오 초근→근으로 styleLabel 거리만 정정했다. 레이카는 성장형 근거리 딜러 유지. 역할/성향/전투 수치는 변경하지 않음.

3.1173: 캐릭터 카드 스타일 누락 및 레테 RMB 입력 분리. 캐릭터 카드 스타일 빈칸 원인은 CharacterCardStatsService가 styleLabel을 정상 표시하지만 엔소냐/메이실/레이카 데이터에 styleLabel 자체가 없던 것이므로 각각 기동형 중거리 서포터/조건형 근거리 딜러/성장형 근거리 딜러를 복구했다. 셸로는 조건형→반격형 근거리 탱커, 라임은 성장형→반격형 근거리 탱커로 styleLabel과 분류 태그를 함께 변경하며 레이카는 성장형 유지. 레테 RMB는 최초 설치 attack.lete.rmb(비용 750)를 유지하고, 우편함 활성 상태의 다음 RMB는 범용 inputAttackAlternates로 attack.lete.rmb-retarget(cost 0)을 선택해 RMB/RMB 수취인 변경을 스테미나와 분리한다. RMB HOLD는 holdAttackId attack.lete.rmb-hold(cost 0, 500ms charge)를 사용해 설치 RMB와 별도 공격 데이터를 사용하며 holdTrigger의 ability.pending-ready도 제거해 설치 공격 대기와 분리했다. AbilityService에 이벤트별 hold/release attackId 및 조건부 inputAttackAlternates를 해석하는 범용 eventAttack 경로를 추가하고 PointerHoldInputService의 홀드 게이지/직접 홀드 실행도 같은 경로를 사용한다. 기존 summon.toggle recipientSelection/summon.spawn 시스템은 그대로 재사용하며 레테 전용 신규 전투 모듈은 추가하지 않음.

3.1172: 키 스킬 저스트 회피 보정 및 3.1171 노란색 예고 제거. 키 forecastExecute의 실제 타격 AttackSpec에 범용 justDodgeWindowExtension:30을 추가해 공통 저스트 회피 80ms가 끝난 뒤 추가 30ms 동안만 해당 공격의 저스트 회피를 허용한다(총 110ms). JustDodgeService.confirmDamageAttempt/confirm은 attack 데이터의 justDodgeWindowExtension을 범용으로 읽어 canonical justWindow 뒤에 더한다. 키 RMB/RMB deceive에는 extension을 넣지 않아 페이크 자체는 추가 저회 판정을 만들지 않는다. 3.1171의 forecastStrike 노란색 justDodgeCue 플래그/렌더 전환은 전부 제거해 기존 흰색 예고 표현으로 복구. 기본 GAME_DATA.dodge.justWindow=80ms 및 다른 공격의 저회 시간은 변경하지 않음.

3.1171: 셸로/베르 밸런스 및 키 예고 타이밍 프레젠테이션 수정. 셸로 counter/counterParry 피해를 Base Damage 150 기준 damageRatio 1로 낮춰 각각 150으로 변경하고, 툴팁을 사용자 지정 문구로 교체하되 피해 표시는 기존 {damage} 실제 AttackSpec 참조 유지. 베르 최대 체력 1000→1100, counter 피해를 Base Damage 100 기준 damageRatio 1.5로 낮춰 타당 150으로 변경. 키 forecastExecute와 deceive의 동일 forecastStrike 이펙트에 justDodgeCue 플래그/색 데이터를 추가했다. 범용 forecastStrike 렌더러는 GAME_DATA.dodge.justWindow을 직접 참조해 실제 저스트 회피 판정 직전 구간 동안 지정 cue 색으로 전환한다. 따라서 RMB/LMB 예고 실행은 실제 공격 직전 노란색으로 변하고 RMB/RMB 기만도 동일 타이밍에 같은 노란색 페이크를 보여준다. 저스트 회피 판정 시간 자체, 피해 지연, 공격 판정은 변경하지 않음.

3.1170: 아츠테오 온라인 공격자 화면에서 적중하지 않은 다른 원석까지 동시에 사라지던 실제 원인 수정. 피격자 권위 화면의 원격 원석은 OrbitInventoryService가 그 클라이언트에서 새 AttackExecution을 만들기 때문에 executionSequence가 공격자 원본 원석의 sequence와 동일하다는 보장이 없다. 그런데 duel-hit-confirmed 수신 후 일반 비관통 투사체 제거 경로가 payload.executionSequence+attackId로 공격자 화면의 Projectile을 찾고 있어, 맞은 원석은 impactMeta.itemId로 정상 소비된 뒤 피격자 측 sequence와 우연히 일치하는 다른 원석 Projectile까지 추가 제거될 수 있었다. 이제 모든 ProjectileService 적중 impact의 networkMeta에 실제 projectile.networkKey를 `projectileKey`로 포함하고, NetworkHitAuthorityService.receive는 확정된 projectileKey가 있으면 source+networkKey로 정확한 Projectile 하나만 제거한다. projectileKey가 없는 구형/일반 패킷에만 기존 executionSequence 기반 탐색을 fallback으로 유지한다. 아츠테오 전용 예외 없이 모든 네트워크 투사체의 확정 제거 식별을 실제 networkKey 우선으로 개선.

3.1169: 아츠테오 회전 원석의 비적중 원석 간헐 소멸을 투사체 궤도/경계 단계에서 수정. ProjectileService.updateOutbound의 일반 월드 경계 만료가 orbitActive 투사체에도 적용되어, 소유자가 맵 가장자리 근처에 있을 때 회전 원석이 궤도상 잠시 월드 경계 밖으로 나가면 적중과 무관하게 range 종료로 소멸하던 문제를 수정했다. orbitActive 동안에는 일반 x/y 월드 경계 만료를 적용하지 않고 orbit 자체 complete/실제 적중/방패/저스트 회피 같은 terminal resolution만 사용한다. 또한 ProjectileCollisionShapeService가 회전 투사체에도 이전 위치→현재 위치 단일 직선 swept collision을 사용하던 구조를 범용 orbit-aware sweep으로 확장했다. ProjectileOrbitService는 이전/현재 중심점·반경·각도를 보존하고, orbitHitsTarget은 각도 변화의 최단 방향과 중심 이동/반경 변화를 따라 최대 4px 간격의 분할 원호 경로를 검사한다. 따라서 실제 원호가 닿지 않았는데 직선 chord가 대상을 가로질러 원석이 적중/소멸하는 오판정을 줄인다. 일반 직선/다이아몬드 투사체 충돌은 기존 경로 유지. 캐릭터 ID 예외 없음.

3.1168: 아츠테오 회전 원석의 잔존 이중 피해/비적중 원석 동시 소멸 원인 수정. 첫째, 3.1167의 syncProjectiles 중복/상태 정리가 ProjectileService.finish를 호출해 projectile-resolved를 발생시켰고, 그 이벤트가 실제 inventory item을 소비하면서 맞지 않은 원석까지 사라질 수 있었다. ProjectileService에 범용 discard(projectile)를 추가해 상태 동기화/중복 객체 정리는 presentation/state만 제거하고 projectile-resolved/augment resolution을 발생시키지 않도록 분리했다. 둘째, 피격자 권위 화면에서 원석이 적중/저스트 회피/방패로 terminal resolution된 직후 공격자 최신 duel-state가 도착하기 전의 오래된 snapshot이 같은 itemId를 다시 복원하면 동일 원석 Projectile이 재생성되어 같은 대상에 두 번째 피해를 줄 수 있었다. OrbitInventoryService에 state-local resolvedProjectileItems tombstone을 범용 추가해 실제 projectile-resolved된 collection+itemId를 기록하고, applyRemote가 이후 도착한 stale snapshot에서 해당 원석을 필터링한다. ID는 증가형이며 tombstone은 256개 상한. projectile-resolved는 정확한 collection/itemId만 mark+consume한다. 새 캐릭터 ID 기반 예외는 없고 ProjectileService의 sync discard와 OrbitInventoryService의 원격 stale-state 방지 책임으로 구현.

3.1167: 아츠테오 회전 원석의 간헐적 이중 피해/동시 소멸 버그 수정. OrbitInventoryService의 실제 ProjectileService 동기화가 동일 원석에 대응하는 Projectile 객체가 둘 이상 존재해도 정리하지 않아 온라인 스냅샷/소모 타이밍이 겹칠 때 한 원석이 중복 생성될 수 있었다. 원석 Projectile 식별키를 stateKey+collection+itemId 복합키로 변경하고 syncProjectiles가 같은 키의 Projectile을 정확히 하나만 유지하도록 중복 제거한다. projectileFor/spawn도 동일 복합키를 사용해 normal/counter 간 식별 충돌 가능성을 제거했다. 또한 비관통 Projectile이 저스트 회피로 소비된 경우 finish(...,true)로 적중 처리되던 공통 경로를 projectile.hadHit 기준으로 교정했다. 새 캐릭터 전용 충돌 시스템 없이 기존 OrbitInventoryService/ProjectileService만 수정.

3.1166: 아츠테오 실제 ProjectileService 원석의 방패/저스트 회피 소멸 버그 수정. 원인은 ProjectileService.finish가 방패 제거처럼 hit:false로 terminal resolution을 발생시켜도 OrbitInventoryService의 projectile-resolved 리스너가 event.hit===true일 때만 원석 인벤토리 항목을 소비하던 데 있었다. 그 결과 실제 투사체 객체는 정상 제거되지만 원본 orbit inventory item이 남아 다음 syncProjectiles에서 같은 원석이 즉시 재생성됐다. 이제 orbitInventoryMeta를 가진 실제 ProjectileService 투사체는 projectile-resolved가 발생하면 hit 여부와 무관하게 해당 inventory item을 소비한다. 따라서 리안/셸로 방패 제거, 저스트 회피 등 일반 투사체가 terminal finish되는 공통 경로에서 원석도 실제로 사라진다. Orbit projectile은 orbitActive 동안 일반 range expiry가 Infinity이므로 정상 회전 중 임의 소모는 발생하지 않는다. 기존 ProjectileService/AttackGuardService/JustDodgeService를 그대로 재사용하며 아츠테오 ID 전용 충돌 분기나 새 모듈은 추가하지 않음.

3.1165: 아츠테오 회전 원석 피해 범위 조정. orbitInventory.damage를 base:50, perQuality:150/11로 변경해 1품질 최소 피해 50, 12품질 최대 피해 200이 되도록 맞췄다. 중간 품질 피해는 기존 품질 선형 증가 공식을 그대로 사용한다. 설명 UI의 원석 최소~최대 피해 표시는 orbitInventory.damage/maxQuality를 참조하므로 자동으로 50~200으로 갱신된다. 원석 개수/품질 상승/투사체 판정/회전/증강 적용은 변경하지 않음.

3.1164: 셰리나 비아 투사체 적 관통 추가. 3.1163에서 벽 관통으로 변경한 LMB `소리의 활`과 반격 `멀티샷`의 기존 범용 projectile.pierce 설정을 targets:false,walls:true에서 targets:true,walls:true로 변경해 적과 벽을 모두 관통한다. 피해/탄속/사거리/에코 생성/기타 전투 수치는 변경하지 않으며 새 모듈이나 캐릭터 ID 전용 충돌 분기는 추가하지 않음.

3.1163: 셰리나 비아 투사체 벽 관통 적용. 셰리나 비아 LMB `소리의 활`과 반격 `멀티샷`은 이미 기존 범용 projectile.pierce 모듈을 사용하고 있었으나 walls:false로 설정되어 있었다. 두 공격의 설정을 targets:false,walls:true로 변경해 탄환은 벽을 관통하고 적은 기존처럼 관통하지 않는다. 피해/탄속/사거리/에코 생성/기타 전투 수치는 변경하지 않으며 새 모듈이나 캐릭터 ID 전용 충돌 분기는 추가하지 않음.

3.1162: 스야 RMB MELEE 설명의 빙결 시간이 0초로 표시되던 버그 수정. CharacterDescriptionService의 stealthFreezeSeconds가 stealth.toggle.detectStatusDuration만 조회했지만 스야 실제 빙결 시간은 detectAttackId:'attack.sya.stealth-freeze' 내부 hit.sequence→status.apply.duration에 정의되어 있어 0으로 표시됐다. 이제 stealth.toggle.detectStatusDuration이 없으면 detectAttackId가 가리키는 실제 공격의 status.apply duration을 범용으로 탐색해 사용한다. 스야 현재 값은 500ms이므로 설명에는 0.5초로 표시된다. 전투 동작/수치는 변경하지 않음.

3.1161: 하푸푸/스야 지속형 이동 스킬 설명 정리. 하푸푸 `나 잡아봐라!` 설명을 `최대 {sustainMaxSeconds}초 동안 이동속도 {sustainSpeedPercent}% 증가 및 벽 통과. 지속시간동안 스테미나를 소모하며 재사용 시 해제`로 변경해 지속시간과 이속 증가율은 기존 sustain.toggle 데이터에서 계속 참조하고 초당 스테미나 수치 표기는 제거했다. 스야 `RMB RANGED / 서리안개 은신` 설명도 동일한 형식으로 변경한다. 기존 stealthDurationSeconds는 stealth.toggle.maxDuration을 참조하며, 새 범용 `stealthSpeedPercent` placeholder는 stealth.toggle.speedModifier에서 계산한다. 따라서 현재 4초 및 이동속도 증가율을 설명 문자열에 하드코딩하지 않는다. 전투 동작/수치는 변경하지 않음.

3.1160: 하푸푸 스킬 설명을 사용자 지정 문구로 변경하고 설명 수치 하드코딩 제거. LMB는 실제 평타 피해와 술래 표식 최소~최대 폭발 피해, 최대 중첩을 표시한다. RMB는 실제 sustain.toggle의 maxDuration, speed buff value, drainPerSecond를 표시하며 재사용 해제 문구를 유지한다. 반격은 실제 counter 피해를 표시하고 기존 표식 폭발 기능을 설명한다. CharacterDescriptionService.interpolate에 범용 stack.mark/sustain.toggle placeholder를 추가했다. `markMaxStacks`는 stack.mark.max, progressive-total 최소 피해는 burstDamage.first, 최대 피해는 `max*first + step*max*(max-1)/2`로 실제 StackMarkService.burst 공식과 동일하게 계산한다. `sustainMaxSeconds`, `sustainSpeedPercent`, `sustainDrainPerSecond`는 ability의 sustain.toggle 데이터와 speed buff를 직접 참조한다. 따라서 5중첩/200~1500/4초/45%/250 같은 값은 설명 문자열에 하드코딩하지 않는다. 전투 로직과 수치는 변경하지 않음.

3.1159: 아츠테오 스킬 설명을 사용자 지정 4행 구조로 재작성하고 설명 수치 하드코딩 제거. LMB는 곡괭이 피해/원석 최소~최대 피해, 최대 품질을 표시하고 RMB는 기본 행과 RMB/RMB 재사용 행을 분리했으며 반격은 내려치기 피해/원석 최소~최대 피해를 표시한다. CharacterDescriptionService.interpolate에 범용 orbitInventory/recast placeholder를 추가했다. `orbitMaxQuality`는 character.orbitInventory.maxQuality, `orbitMinDamage`는 orbitInventory.damage.base, `orbitMaxDamage`는 base+(maxQuality-1)*perQuality에서 계산한다. `recastWindowSeconds`는 ability trigger의 orbit.inventory-recast window, `recastMaxStage`와 `recastRangeIncreasePercent`는 progressAttack의 progressScale.valueRange.to/factor에서 계산한다. 따라서 12단계/원석 60~280/1초/5회/30%를 설명 문자열에 숫자로 하드코딩하지 않는다. 전투 수치와 동작은 변경하지 않음.

3.1158: 아츠테오 RMB 설명에 실제 착지 피해량 표기 추가. 광석 발견은 이미 attack:'rmbLand'로 실제 착지 공격을 참조하고 있었지만 설명 문자열에 {damage} placeholder가 없어서 피해량이 표시되지 않았다. 설명에 `피해 ({damage})`를 추가했으며 전투 수치/범위/재사용 로직은 변경하지 않음.

3.1157: 아츠테오 RMB 착지 범위 증가 미적용 원인 수정. MovementAbilityService.finish의 onEndAttackIds 후속 공격 경로가 base AttackSpec을 곧바로 AugmentService.prepareAttack에 넘겨 일반 AttackService.execute가 수행하는 ProgressScaledAttackService.resolve 단계를 건너뛰고 있었다. 이 때문에 attack.atsuteo.rmb-land의 progressScale/scaleStage가 정상적으로 2~5단계까지 올라가도 실제 착지 공격은 항상 기본 범위 120으로 실행됐다. 이제 모든 이동 종료 후속 공격은 `ProgressScaledAttackService.resolve(entity, baseAttack)` 후 `AugmentService.prepareAttack` 순서로 처리해 일반 공격과 동일한 준비 파이프라인을 사용한다. 아츠테오 RMB는 도착 후 1초 재사용 창, 범위 120→156→202.8→263.64→342.732, 5회차 상한, 무제한 재사용, 400ms 쿨다운, 이동거리 270을 그대로 유지. 캐릭터 ID 예외나 별도 전용 모듈 추가 없음.

3.1156: 아츠테오 RMB 재사용 1초 창을 이동 도착 이후부터 시작하도록 변경. 기존 orbit.inventory-recast commit은 입력/공격 성공 직후 expiresAt=now+1000을 기록해 180ms 이동시간까지 재사용 가능 시간에서 차감했다. 이제 commit은 uses/scaleStage만 갱신하고 expiresAt=0으로 두며, 이동 중에는 체인 만료 판정을 하지 않는다. attack.atsuteo.rmb-land의 after-attack에 기존 orbit.inventory-recast 모듈의 operation:'start-window'를 추가해 실제 도착 후 착지 공격이 실행된 시점에 expiresAt=landingNow+1000을 기록한다. AttackModuleService.afterAttack의 기존 orbit inventory dispatch에 start-window operation만 범용 확장했으며 별도 전용 모듈/서비스는 추가하지 않았다. 연속 재사용 시에도 입력 순간 새 창을 멈추고 다음 도착에서 다시 1초를 시작한다. 범위 단계 120→156→202.8→263.64→342.732, 5회차 상한, 무제한 재사용, RMB 공격 쿨다운 400ms, 이동거리 270은 유지.

3.1155: 아츠테오 RMB 재사용 체인/범위 증가 복구. `atsuteo-rmb-chain`은 OrbitInventoryService가 actionState의 orbit-recast로 관리하지만 ProgressScaledAttackService.ratio가 ProgressStateService만 조회해 항상 범위 진행도 0으로 계산되던 원인을 수정했다. ProgressScaledAttackService에 범용 stateValue를 추가해 같은 stateKey의 ProgressState가 없으면 actionState의 scaleStage/value를 읽으며, 기존 ProgressState 기반 공격은 우선순위를 유지한다. 첫 RMB는 기본 범위 120으로 실행된 뒤 commit되므로 새 recast 상태의 scaleStage를 1→2로 변경해 다음 사용이 정확히 2회차 범위부터 시작한다. 재사용 성공마다 expiresAt을 현재 시점+1000ms로 갱신하며 1초가 지나면 orbit-recast 상태를 삭제해 다음 사용은 다시 기본 범위로 시작한다. 사용 횟수 제한은 없음. ProgressScaledAttackService에 데이터 기반 curve:'multiplicative'/factor 지원을 추가해 아츠테오 progressScale의 factor 1.3을 실제 적용한다. 따라서 연속 사용 범위는 정확히 120→156→202.8→263.64→342.732이며 scaleStage는 5에서 고정되어 이후 재사용은 342.732를 유지한다. RMB 공격 쿨다운 400ms, 이동거리 270, 원석 실제 ProjectileService 구조는 변경하지 않음.

3.1154: 아츠테오 원석 실제 투사체 전환 후 phase 런타임 오류 수정. 3.1153에서 OrbitInventoryService.phase 내부가 준비된 projectileSpeed를 계산하기 위해 entity를 참조하도록 변경됐지만 함수 시그니처가 phase(state,config,now)로 남아 `ReferenceError: entity is not defined`가 발생했다. phase를 phase(entity,state,config,now)로 교정하고 points/serialize의 모든 호출부에서 동일 entity를 전달한다. 원석 실제 ProjectileService 구조, 거대 총알/스피드 샷/범위 증폭 적용, 피해/품질/회전 규칙은 변경하지 않음.

3.1153: 아츠테오 원석을 실제 ProjectileService 일반 투사체로 전환. 수동 OrbitInventoryService 충돌 판정을 제거하고 각 원석마다 준비된 attack.atsuteo.ore-hit delivery.projectile을 실제 ProjectileService에 생성한다. ProjectileOrbitService의 범용 externalAngle/externalRadius 입력으로 기존 고정 슬롯/적 거리 보정 궤도를 실제 투사체에 공급하며 충돌, 저스트회피, 온라인 권위, 피해 확정, 소멸은 일반 ProjectileService 경로를 사용한다. 원석 기본 projectile speed 6.75/radius 10이며 wall pierce, suppressProjectileFireSound를 사용한다. 품질 피해는 원석별 raw damageRatio로 변환 후 AugmentService.prepareAttack을 통과한다. 따라서 거대 총알 projectileRadius +60%, 스피드 샷 projectileSpeed +30% 및 projectileRadius -15%가 실제 원석 projectile에 적용된다. 회전 phase 속도도 준비된 projectile.speed/baseProjectileSpeed 비율을 사용해 스피드 샷 탄속 증가가 실제 회전속도 증가로 이어진다. 범위 증폭의 궤도 반경 배율은 기존 rangeScaleTags 경로를 유지한다. ProjectileService에 범용 networkMeta 전달과 projectile-resolved 이벤트를 추가해 authoritative 실제 적중 후 해당 원석만 소모한다. 기존 커스텀 원석 원 렌더는 제거하고 실제 ProjectileService renderer만 사용한다.

3.1152: 아츠테오 원석 적중 확정/범위 증폭/일반 투사체 판정 수정. 온라인 공격자 화면의 원석 예측 접촉만으로 원석을 즉시 소모하던 버그를 제거했다. 원석 적중 impact에 범용 networkMeta(itemId/stateKey/collection)를 실어 기존 duel-hit-confirmed 경로로 되돌려 받고, GameEvents network-hit-confirmed에서 소유자 원석을 실제 확정 적중 후에만 제거한다. 피격자 권위 미러에서는 authoritative hit 즉시 동일 원석을 제거하며 공격자 예측 원석은 300ms pending으로 중복 예측만 억제한다. attack.atsuteo.ore-hit에 일반 delivery.projectile(radius/hitRadius 10, speed 0) geometry를 부여해 TagService에서 일반 투사체로 분류되며, 원석 접촉 판정은 직접 원-원 거리 계산 대신 기존 ProjectileCollisionShapeService.hitsTarget()의 swept 일반 투사체 충돌을 사용한다. 따라서 projectileRadius 증강도 동일 prepared AttackSpec을 통해 판정 반경에 적용된다. orbitInventory에 rangeScaleTags:['범위 공격']을 데이터로 추가하고 AugmentService.rangeAdjustmentTotalForTags()를 재사용해 범위 증폭 배율을 일반 원석 최소/최대 궤도와 반격 링 바깥 간격에 동일 적용한다. 명시 koOrigin mode:'source'는 projectile contact보다 우선하도록 ImpactDirectionService를 범용 보완해 원석 K.O. 레이저의 아츠테오 본체 방향 규칙을 유지한다.

3.1151: 아츠테오 원석 온라인 위치 동기화 및 로컬 전용 타격음 수정. OrbitInventoryService가 원석 목록/슬롯만 동기화하고 각 클라이언트의 performance.now()*angularSpeed로 회전 phase를 독립 계산하던 구조를 수정했다. state.phase/phaseAt을 실제 회전 기준으로 사용하고 duel-state orbitInventory snapshot에 phase를 포함하며, 원격 적용 시 payload.sentAt 기준 전송 지연만큼 angularSpeed를 보정한 뒤 같은 phase에서 계속 회전한다. 따라서 일반/반격 원석의 슬롯·회전방향·보간 반경뿐 아니라 회전 각도도 양쪽 화면에서 동일 기준을 사용한다. 아츠테오 벽 채굴 hit 사운드는 mineWall의 기존 local simulation authority 가드 안에서만 재생됨을 유지해 본인 화면 전용으로 확정. SummonDeployService spawn 옵션에 범용 spawnEffectSoundLocalOnly를 추가하고 펠루나 attack.peluna.anvil-impact의 범위 내 hit 사운드에 적용해, 모루 착탄 시 펠루나 자신이 강화 범위 안에 있어서 나는 타격음은 펠루나 소유자 화면에서만 재생된다. 모루 적 타격/다른 일반 hit 사운드, 원석 피해/위치 판정/채굴 수치는 변경하지 않음.

3.1150: 아츠테오 회전 원석 K.O. 레이저 방향 수정. OrbitInventoryService.tryHit의 원석 접촉 AttackExecution에 기존 범용 AttackExecutionService.setKoOrigin({mode:'source'})을 적용해, `attack.atsuteo.ore-hit`으로 적이 사망하면 원석 위치나 기본 execution angle 0이 아니라 실제 공격자 아츠테오 본체 좌표를 K.O. 원점으로 사용한다. 따라서 일반 원석/반격 원석 어느 쪽에 맞아 죽어도 K.O. 레이저는 아츠테오→피격자 방향으로 생성된다. 원석 회전/피해/품질/소모/온라인 사망 확정 구조는 변경하지 않음.

3.1149: 아츠테오 평타 벽 채굴 타격음 추가. OrbitInventoryService.mineWall에서 벽 채굴 판정이 실제 성공한 경우 기존 공통 SoundService.play('hit')를 호출해 적 타격과 동일한 hit 효과음을 재생한다. 같은 프레임에 벽 채굴과 적 타격이 동시에 발생해도 SoundService의 기존 frame dedupe로 hit 사운드는 한 번만 재생된다. 채굴 판정/원석 획득/품질/피해/공격 이펙트는 변경하지 않음.

3.1148: 아츠테오 초근접 적 회전 반경 최대치 점프 버그 수정. nearestEnemyOrbitTarget가 기존에는 `contactMax < orbitRadiusMin` 조건으로 너무 가까운 적을 후보에서 제외해, 적과 거의 겹치면 유효 대상이 없다고 판단하고 desiredOrbitRadius가 최대 반경 220으로 복귀했다. 이 최소반경 하한 필터를 제거하고, 최대 반경 220보다 멀어 원석이 물리적으로 닿을 수 없는 적만 제외한다. 따라서 적이 최소 반경 안쪽이나 캐릭터와 거의 겹쳐도 가장 가까운 적 후보로 계속 유지되며 desired radius는 orbitRadiusMin 90으로 clamp된다. 기존 120ms 반경 보간, 반격 링 +40px, 원석 피해/품질/채굴/RMB 수치는 변경하지 않음.

3.1147: 아츠테오 원석 회전 반경 전환 보간 수정. 가장 가까운 적이 원석 궤도보다 지나치게 가까워 desired radius가 최소값 아래로 내려가도 최대 반경으로 복귀하지 않고 orbitRadiusMin 90에 그대로 고정하도록 desiredOrbitRadius를 명시 분리했다. 원석 회전 반경은 actionState의 orbitRadius/orbitRadiusAt을 사용해 목표 반경으로 즉시 점프하지 않고 약 120ms 지수 보간으로 빠르게 추종한다. 따라서 적 사망/이탈로 목표가 사라져 기본 최대 반경 220으로 돌아갈 때도 링이 순간적으로 커지지 않고 빠르게 확장되며, 새 적 진입/거리 변화 시에도 같은 보간을 사용한다. 일반/반격 원석 슬롯, 반격 링 +40px, 피해/품질/채굴/RMB 수치는 변경하지 않음.

3.1146: 아츠테오 평타 채굴 간헐 실패 수정. 기존 mineWall은 벽을 정상 탐지한 뒤에도 addOne이 실제 원석 추가/교체에 실패하면 false를 반환했고, addOne 내부에서만 품질을 올렸기 때문에 일반 원석 8칸이 차 있거나 현재 품질로 교체 가능한 저품질 원석이 없으면 벽을 맞췄어도 원석 획득과 품질 상승이 동시에 멈췄다. 이제 평타 채굴은 벽 탐지 성공을 채굴 성공의 단일 기준으로 사용한다. 현재 품질 원석을 빈 슬롯/교체 가능한 슬롯에 우선 반영하되, 인벤토리 갱신이 불가능한 경우에도 채굴 성공은 유지하고 다음 품질을 +1한다. wallInSector도 최근접점/모서리 위주 판정에서 부채꼴 전체 25개 raycast + 기존 geometry fallback으로 강화해 벽 모서리나 부채꼴 사이 각도에서 채굴을 놓치던 경우를 줄였다. RMB/반격 범위 채굴, 원석 피해/회전/재사용 수치는 변경하지 않음.

3.1145: 아츠테오 원석 회전 반경 의미 교정 및 RMB 무제한 연속 재사용 수정. 원석 회전 반경은 적 거리 비례 선형 변화가 아니라, 허용 반경 90~220 안에서 실제 원석 궤도와 접촉 가능한 가장 가까운 적을 찾고 해당 적의 중심거리-적 반지름-원석 반지름 기준으로 궤도를 실시간 보정해 원석이 그 적을 실제로 스치도록 변경했다. 회전 범위 밖 적은 반경 보정 대상이 아니며 후보가 없으면 최대 반경 220을 사용. 반격 원석 링은 기존처럼 일반 링보다 +40px 바깥에서 반대 회전. RMB orbit.inventory-recast의 최대 3회 제한 제거. maxUses<=0은 범용 무제한 체인으로 처리하고, 성공한 재사용마다 1초 연속 재사용 창을 갱신한다. RMB 착지 범위 증가는 1~5회차까지만 30%씩 누적되며 5회차 이후에는 scaleStage를 5로 고정해 더 이상 커지지 않는다. 기본 120 기준 1/2/3/4/5회차 범위는 120/156/202.8/263.64/342.732. ProgressScaledAttackService는 orbit-recast 상태의 scaleStage가 있으면 일반 progress value보다 우선 사용한다. RMB 공격 쿨다운 400ms, 재사용 창 1초, 이동거리 270은 유지.

3.1144: 아츠테오 품질/회전거리/교체/RMB 후속 조정. RMB와 반격 orbit.inventory.mine-area에 advanceQuality:false를 적용해 범위 채굴로는 품질 단계가 상승하지 않으며, 평타 벽 채굴만 다음 품질 +1을 유지한다. OrbitInventoryService.effectiveQuality/highestHeldQuality를 추가해 일반/반격 두 원석 링 전체의 보유 최고 품질을 새 획득 품질의 최소 기준으로 사용한다. 따라서 일반 원석이 모두 소모돼도 반격 링에 높은 품질 원석이 남아 있으면 품질이 1로 초기화되지 않고, 이후 일반 채굴도 해당 높은 품질부터 이어진다. 품질 초기화는 일반 items와 counterItems가 둘 다 완전히 비었을 때만 발생. 반격 counterItems도 10개 최대치에서 더 높은 품질을 획득하면 일반 원석과 동일하게 가장 낮은 품질 원석의 고정 슬롯을 승계해 자동 교체한다. 원석 회전 반경은 고정 150을 제거하고 가장 가까운 적의 거리를 읽어 140px 이하일 때 105, 650px 이상일 때 190, 그 사이 선형 보간으로 동적으로 변화한다. 반격 링은 항상 일반 링보다 40px 바깥에서 같은 거리 변화에 따라 움직이며 반대 방향 회전. RMB `광석 발견` 재사용 윈도우 3초→1초, 공격 쿨다운 420ms→400ms, 최대 이동/지정 사거리 180→270(+50%)로 변경. 기존 최대 3회 재사용, 이동시간 180ms, 착지 범위 증가 규칙과 피해는 유지.

3.1143: 아츠테오 재사용/호게이지/반격 원석 완전 분리 및 FX 수정. `atsuteo-rmb-chain`에 orbit-recast 상태와 state.progress를 동시에 기록해 재사용 체인이 깨지던 구조를 제거. orbit.inventory-recast를 check→action.attack→commit 2단계로 변경해 실제 공격 성공 후에만 사용 횟수를 증가시키며, 3초 안 최대 3회 재사용하고 attack.atsuteo.rmb의 기존 420ms 실제 쿨다운마다 정상 재사용 가능. WorldGaugeModuleService/EntityRingLayoutService에 범용 cooldown-remaining-ratio valueRef를 추가하고 아츠테오 RMB 420ms 남은 쿨다운을 1→0으로 감소하는 정식 gauge.arc로 표시. 원석 품질 호는 OrbitInventoryService 직접 렌더에서 완전히 제거. 새 쿨다운 호는 worldGaugeModules 정식 링 배치에 포함되어 상태/반격 활성 링을 바깥으로 밀어낸다. 일반 원석 회전 반경 110→150. 반격 채굴은 일반 items에 원석을 넣고 임시 duplicates로 복제하던 구조를 폐기하고 persistent counterItems 별도 저장소로 분리. 반격 범위의 벽 수만큼 현재 품질 원석을 counterItems에만 추가하며 일반 8개 한도/일반 원석 가득참과 완전히 독립적으로 최대 10개까지 누적. 새 반격 사용 시 기존 counterItems를 삭제하지 않고 빈 고정 슬롯에 추가하며, 지속시간/duplicateUntil을 완전히 제거해 적중으로 소모될 때까지 영구 유지. 반격 원석은 반경 190의 별도 10고정슬롯에서 일반 원석과 반대 방향으로 회전하고 duel-state에도 counterItems를 독립 동기화. RMB 착지/반격 FX는 animation:false 정적 단일 areaCircle로 변경하고 clipToAttackArea/progressSweep을 제거해 벽과 무관하게 전체 원을 그대로 렌더. delivery.area wallPolicy:'ignore'와 이동 passWalls:true는 유지.

3.1142: 아츠테오 원석/채굴/벽 관통/FX 후속 수정. RMB `광석 발견`과 반격 `원석 충전`은 범위 채굴 시작 시 현재 품질을 한 번 스냅샷하고 범위 안 벽 수만큼 획득하는 모든 원석을 동일 품질로 지급한다. 벽을 하나 이상 채굴한 사용 1회가 끝난 뒤 다음 채굴 품질만 +1. OrbitInventoryService.addMany을 이 일괄 품질 규칙으로 범용 수정. LMB 채굴 실패 원인은 wallInSector가 첫 검사 벽이 사거리 밖이면 return false로 전체 탐색을 종료하던 버그였으며 이를 제거하고 closest point/네 모서리/중심 ray 접촉까지 검사하도록 수정. 원석 기본 회전 반경 54→110, 원 반경 9→10. 일반 원석은 보유 개수와 무관하게 항상 8개 고정 각도 슬롯을 사용하며 획득 시 빈 슬롯을 차지하고 소모되어도 다른 원석 위치가 재배치되지 않는다. 교체 시 기존 최저 품질 원석의 슬롯을 그대로 승계. 반격 복제 원석도 10개 고정 슬롯/반경 150의 바깥 고정 궤도를 사용하며 반대 방향 회전. slot을 duel-state snapshot에 동기화. RMB 이동 collision을 passWalls:true로 변경하고 RMB 착지/반격 delivery.area wallPolicy를 ignore로 변경해 벽을 관통. 3.1141의 RMB/반격 2중 areaCircle FX 중 밝은 내부링을 제거하고 각 공격당 단일 충격파만 렌더. 피해/스테미나/재사용/원석 피해는 변경하지 않음.

3.1141: 아츠테오 공격 FX 전면 정리. 3.1139에서 임시 사용한 코녕 전용 konyeongSwing과 단일 기본 areaCircle을 제거했다. LMB는 기존 범용 botSwing sector EffectSpec을 사용해 실제 105px 곡괭이 부채꼴 판정과 동일한 짧고 굵은 스윙으로 변경하고 자동 delivery FX를 숨겼다. RMB 착지와 반격은 자동 원형 공격 FX를 숨기고, 캐릭터의 짙은 황갈색 확장 충격파 + 밝은 광석색 내부 충격링의 2중 areaCircle EffectSpec으로 통일했다. RMB는 빠른 12프레임 외곽 충격파/9프레임 내부링, 반격은 더 굵은 14프레임 외곽 충격파/10프레임 내부링을 사용한다. 기존 effect.spawn/areaCircle/botSwing 렌더러만 재사용하며 아츠테오 전용 렌더러는 추가하지 않았다. 공격 판정/피해/채굴/원석 시스템/범위는 변경하지 않음.

3.1140: 아츠테오 선택창 미노출 수정. 3.1139에서 아츠테오 정의가 GAME_DATA.characters 닫힘 뒤에 삽입되어 ProfileCharacterService의 Object.values(GAME_DATA.characters) 카탈로그에 포함되지 않던 구조 오류를 수정했다. 아츠테오 블록을 characters 객체의 실제 마지막 항목으로 이동해 캐릭터 선택창, 라운드 사이 선택, 프로필/레코드 및 개발자 캐릭터 목록에 기존 공통 경로로 자동 노출되도록 했다. 아츠테오 전투 수치와 원석 시스템은 변경하지 않음.

3.1139: 신규 캐릭터 아츠테오(Atsuteo) 추가. 체력 1500/이속 4/색 #735800/조건형 초근거리 딜러.
LMB `떠오르는 원석`: 105px 곡괭이 부채꼴 피해 150. 공격 부채꼴 안에 벽이 있으면 현재 품질 원석 1개 채굴, 채굴마다 다음 품질 +1(최대 12). 원석 최대 8개이며 가득 찬 상태에서 더 좋은 원석을 얻으면 가장 낮은 품질 원석을 교체. 모든 실제 원석 소모 시 품질 1로 초기화.
원석은 아츠테오 주변 반경 54를 회전하고 적 접촉 시 개별 파괴되며 품질 1~12 피해는 60부터 단계당 +20(60~280). 품질 색은 캐릭터색 3단계→보라 3단계→파랑 3단계→하늘 3단계로 밝아진다. 품질은 공통 ArcGaugePresentationService 호 게이지, 보유 원석은 8칸 색상 게이지로 표시.
RMB `광석 발견`: 최대 180px 지정지점으로 180ms 이동 후 원형 200 피해. 범위 내 50px 벽 타일 수만큼 원석 획득. 3초 내 최대 3회 재사용하며 1/2/3회차 내려찍기 반경 120/156/202.8(+30%씩).
반격 `원석 충전`: 0.3초 선딜 후 제자리 반경 150 원형 200 피해+무력화 넉백, 범위 내 벽 타일 수만큼 원석 획득. 그때 실제 획득된 원석을 최대 10개까지 4초 동안 반대 방향의 임시 복제층으로 회전시킨다.
신규 범용 OrbitInventoryService는 품질형 회전 인벤토리/접촉 소모/임시 복제/색상·게이지/온라인 duel-state snapshot을 담당하며 캐릭터 ID 분기 없이 character.orbitInventory 데이터로 동작. AttackModuleService에 orbit.inventory.mine-wall / mine-area, AbilityModuleService에 orbit.inventory-recast를 범용 추가. 벽 개수는 현재 DebugMapService.walls()의 병합 사각형을 50px 월드 셀로 환산해 원형 범위와 실제 겹치는 고유 벽 셀 수로 계산한다.

3.1138: 코녕 RMB `뜨거운 마시멜로` 장판 적중 일반 넉백 거리 84→42로 감소. 넉백 속도 10, 장판 피해/범위/지속시간 및 반격기의 무력화 넉백은 변경하지 않음.

3.1137: 레이즈 RMB `내려찍기` 사거리/이동 방식 변경. AttackSpec.range와 최대 이동 기준을 280→336(+20%)으로 증가. 기존 조준 방향 고정거리 280 이동을 제거하고 action.attack captureTargetPoint + movement.move direction:'target-point' 공용 경로를 사용해 336px 사거리 안에서 지정한 실제 지점까지 이동한다. 지정점이 336px 밖이면 기존 captureTargetPoint 규칙으로 사거리 끝점에 clamp된다. 이동 duration 220ms, 벽/적 통과, 이동 중 invulnerable, 착지 attack.raise.rmb-land 및 1초 기절은 변경하지 않음.

3.1136: 하푸푸 공격 범위 추가 하향. LMB `네가 술래!` 지정지점 원형 반경 120→90. 반격 `잡은 줄 알았지?!` 지정지점 원형 반경 200→120으로 변경해 직전 평타 범위와 동일하게 맞췄다. 두 공격의 지정 가능 거리 centerMaxRange 150, 벽 관통, 피해/넉백/표식 규칙은 변경하지 않음.

3.1135: wallPass 버프 HUD 표시 개선. BuffStatusPresentation에 wallPass 전용 스타일을 추가해 `WALL PASS`를 밝은 민트색 rgb(110,255,220)으로 표시한다. wallPass를 compactTypes에 포함해 벽 통과 버프가 활성인 동안 TAB 여부와 관계없이 캐릭터 왼쪽 기본 버프 HUD에 항상 `WALL PASS`가 표시된다. 벽 통과 판정/수명주기/스테미나 소모 및 다른 버프 표시는 변경하지 않음.

3.1134: 하푸푸 공격 범위 하향. LMB `네가 술래!`의 지정지점 원형 반경을 140→120, 반격 `잡은 줄 알았지?!`의 지정지점 원형 반경을 240→200으로 감소. 두 공격의 지정 가능 거리 centerMaxRange 150, 벽 관통, 피해/넉백/표식 규칙은 변경하지 않음.

3.1133: 하푸푸 역할 및 술래 표식 누적 피해 규칙 변경. STYLE을 `지속전투형 근거리 컨트롤러`, 캐릭터 태그를 지속전투형/컨트롤러로 변경. LMB 표식은 add-or-burst-at-max를 사용해 이미 5중첩인 적을 평타로 다시 적중하면 표식을 갱신하지 않고 즉시 폭발한다. 표식 폭발은 각 단계마다 200 + 50*(단계-1)의 피해가 추가되는 누적합으로 계산해 1/2/3/4/5중첩 총피해가 200/450/750/1100/1500이 된다. 5초 만료, 450px 거리 이탈, 반격 즉시 폭발, 5중첩 평타 재적중 모두 같은 progressive-total 공식을 사용한다. StackMarkService에 범용 burstDamage progressive-total과 add-or-burst-at-max operation을 추가하고 combat snapshot에도 동기화.

3.1132: 하푸푸 LMB/반격 지정지점 및 벽 관통, wallPass 끼임 보정 수정. LMB와 반격 delivery.area를 모두 centerMode:'live-aim-point', centerMaxRange:150, centerPointResolve:'none', wallPolicy:'ignore'로 변경해 하푸푸 기준 초근거리 150px 안의 지정지점을 중심으로 벽을 관통하는 원형 공격을 사용한다. LMB 원 반경 140, 반격 원 반경 240은 유지한다. LMB 넉백은 distance 140/speed 14→distance 70/speed 10으로 완화했고 반격 무력화 넉백은 기존 distance 140/speed 14 유지. 반격 counter.execute에는 targetPointMode:'aim-point'를 복구해 0.3초 선딜 종료 시 지정지점을 실제 실행에 전달한다. 벽 통과 실패의 실제 원인은 Buff refresh가 아니라 매 프레임 MovementService.updateForced()의 no-motion 경로와 finalizeForcedMotion()이 wallPass 상태를 무시하고 ensureValidPosition()을 호출해 벽 내부 하푸푸를 즉시 밖으로 밀어내던 것이었다. 두 경로가 wallPass 활성 중에는 끼임 보정을 건너뛰도록 공통 수정했으며, wallPass 종료 시 SustainedBuffModeService.stop의 resolveEmbedded()로 기존처럼 가장 가까운 정상 위치에 복귀한다.

3.1131: 하푸푸 위치/전투 구조/벽 통과 수정. 캐릭터 등록 순서를 큐리 바로 다음으로 이동. LMB `네가 술래!`를 자기 중심 반경 140 원형 히트스캔으로 변경하고 기본 피해 100(damageRatio 1)과 강한 일반 넉백 distance 140/speed 14를 추가했다. 술래 표식 폭발은 중첩당 100→200으로 상향해 1~5중첩이 200/400/600/800/1000 광역 피해를 준다. 반격 `잡은 줄 알았지?!`는 지정지점 방식에서 LMB와 같은 자기 중심 원형으로 변경하되 반경 240으로 확대하고 기본 피해 200(damageRatio 2), 무력화 넉백 distance 140/speed 14를 적용한다. 반격은 더 이상 표식을 5중첩으로 채우지 않고 적중한 대상에게 이미 존재하는 해당 하푸푸의 술래 표식을 즉시 폭발시킨다. StackMarkService에는 재사용 가능한 operation:'burst'를 추가했다. RMB 벽 통과 버그는 SustainedBuffModeService가 지속 상태 생존 중 각 버프를 짧은 TTL로 refresh해 state와 buff 수명주기가 어긋나지 않도록 공통 보강했다. wallPass는 계속 일반 BuffService 토글 버프이며 스테미나 소모는 sustain.toggle 능력 상태가 담당한다.

3.1130: 신규 캐릭터 하푸푸 추가. 체력 1200/이속 4.5/색 #ffe6f7, 기동형 초근거리 암살자. LMB `네가 술래!`는 140px 부채꼴 적중 대상에 최대 5중첩 술래 표식을 부여하며 각 적용마다 5초 갱신, 대상 중심 450px 점선 링 밖으로 하푸푸가 벗어나거나 5초 경과 시 표식 수×100 피해의 160px 광역 폭발을 발생시킨다. 대상 아래 5칸 segmented 게이지 표시. RMB `나 잡아봐라!`는 최대 4초 동안 speed +45%와 범용 wallPass 버프를 부여하고 하푸푸 능력 상태가 초당 스테미나 250을 별도로 소모하며 재입력 해제 가능. wallPass 버프 자체에는 자원 소모 로직이 없다. 반격 `잡은 줄 알았지?!`는 500px 내 지정지점 135px 범위 적에게 5중첩 표식 및 반격 규칙용 0.3초 속박을 부여. 범용 StackMarkService(stack.mark)와 SustainedBuffModeService(sustain.toggle)를 추가하고 combat snapshot에 표식 상태를 동기화. 일반 MovementService는 wallPass 활성 중에만 벽 충돌을 무시하고 종료 시 resolveEmbedded로 안전 위치 복귀.

3.1129: 프릴 RMB `청소 구역` 사용 중 호 게이지/시간 호 게이지 표시 제거 및 행동 잠금 추가. 프릴 channel.attack의 gauge 설정을 제거해 충전/지속/완료 호와 완료 점멸링이 표시되지 않는다. 기존 ChannelAttackService를 확장한 범용 actionLocks와 channel.action-unlocked 조건을 사용해 프릴 RMB가 활성인 동안 LMB/반격/회피를 차단한다. RMB 재입력에 의한 청소 완료/채널 종료는 그대로 허용한다. 이동 제한(bind), 채널 틱 공격, 완료 버프 지대, 피해/범위/시간 수치는 변경하지 않음.

3.1128: 루네프 원소 선택 완료 시 실제 발사 조준이 선택창 렌더 프레임의 마지막 state.data.angle에 의존하던 경합 수정. state.window resolve에 범용 resolveAimMode:'live-source'를 추가하고 루네프 RMB 선택창에 적용해 0.4초 완료 순간의 실제 로컬/원격 조준각과 targetPoint를 직접 스냅샷한다. 따라서 실시간 미리보기와 실제 화염구 발사 방향이 일치하며, 화염구 자체는 기존 delivery.projectile의 고정 vx/vy 직선 이동을 그대로 사용한다. 화염구 속도 18/반경 14/사거리 700/폭발 및 다른 원소 수치는 변경하지 않음.

3.1127: 로온 RMB `빙수 지대`가 적 직접 적중 시에만 생성되던 버그 수정. projectile.impact의 field.area에 잘못 붙어 있던 reasons:['target'] 제한을 제거해 투사체가 적 적중/사거리 종료/경계 종료 등 정상 impact로 끝난 위치에 빙수 지대가 생성된다. sourceRelocate.reasons:['target']는 유지하므로 로온 본체의 지대 중앙 이동은 기존대로 적 직접 적중 때만 발생한다. 빙수 지대 범위 200, 지속 5초/활성 4초, containment, 빙수 게이지 및 다른 수치는 변경하지 않음.

3.1126: 라임이 어린 슬라임 치환 상태에서 부활 증강을 사용할 때 원래 라임 상태로 복귀하며 부활 수명주기가 꼬이던 문제 수정. survival.revive-delay가 EntityCharacterDeathResetService.reset을 호출할 때 replacement-state를 보존하는 범용 옵션 preserveReplacementState를 사용한다. 이에 따라 lime-slime-revived의 단계/치환 최대체력/공격 스케일링 상태가 1초 부활 대기와 부활 이후에도 유지되어, 슬라임 상태에서 죽으면 동일 단계 슬라임 상태 그대로 부활한다. 실제 최종 사망/정상 리스폰의 reset은 옵션을 사용하지 않아 기존처럼 replacement-state를 제거하고 원래 캐릭터 최대체력으로 복귀한다. 부활 usage.consume/lifeUses는 초기화하지 않아 같은 생명에서 부활 증강은 기존 제한대로 1회만 사용한다.

3.1125: 사용자 전달 팀전 비오픈맵10을 기존 official-team-closed-10 자리에 교체. JSON의 35×50 / tileWorldSize 50 타일을 공식 팀전 맵과 동일한 wallRects 압축 형식으로 변환했다. 원본 560개 벽 타일을 18개 사각형으로 압축했으며 복원 후 원본 JSON과 전수 비교해 타일 불일치 0 확인. 기존 맵 선택/온라인 동기화/충돌 판정 구조는 변경하지 않음.

3.1124: 사용자 전달 비오픈맵4/5/10을 각각 기존 기본 비오픈맵 4/5/10 자리에 교체. 세 JSON은 28×40 / tileWorldSize 50 규격이며, 비오픈맵5 파일의 잘못된 내부 id(official-basic-closed-04)는 이름/번호 기준으로 official-basic-closed-05에 정상 매핑했다. 전체 tiles를 공식 맵과 동일한 wallRects 압축 형식으로 변환하고 복원 결과를 원본 JSON과 전수 비교해 3개 맵 모두 타일 불일치 0 확인.

3.1123: 큐리 LMB `집중력` 공격 범위를 현재 값에서 1/3 감소. 기본/최대 범위를 225→150, 450→300으로 변경하고 progressScale의 range 및 delivery.area range도 동일하게 맞췄다. 피해, 넉백 거리, 공식 입력 범위, 반격 범위와 다른 수치는 변경하지 않음.

3.1122: just-dodge 이벤트 증강 트리거의 ReferenceError 수정. 3.1119 라디아&먀코 제거 과정에서 GameEvents 'just-dodge' 리스너의 const target=event?.target 선언이 함께 제거되어 저스트 회피 확정 시 미정의 target을 참조하던 문제를 복구했다. 기존 AugmentEffectModuleService just-dodge 트리거, CounterStockService, 회피 판정/부활/큐리 수치는 변경하지 않음.

3.1121: 큐리 공식 입력 오답 페널티를 현재 단계 입력 진행도 50% 감소에서 100% 감소로 변경. formulaSequence.mistakeProgress의 retain-ratio를 .5→0으로 조정해 오입력 시 현재 공식 단계는 유지하되 해당 단계에서 입력한 진행도는 0으로 초기화한다. LMB NEAR/RMB NEAR 툴팁도 `오입력 시 현재 단계 입력 진행도 초기화`로 실제 동작과 일치시켰다. 정답 입력/단계 완료/최종 완성 및 자연회복 보존 규칙은 변경하지 않음.

3.1120: 라임과 부활 증강의 사망 우선순위 수정. 부활 증강 trigger에 범용 defeat.replacement-available 조건의 negate를 추가해, 아직 deathReplacement 치환 전이고 실제 사용할 살아 있는 cluster summon이 있으면 부활을 소비하지 않고 기존 ClusterSummonService 치환이 먼저 진행된다. 살아 있는 슬라임이 없으면 일반 부활 증강이 정상 발동하며, 한 번 슬라임으로 치환되어 setStateOnReplace 상태가 활성화된 뒤의 사망에서는 남은 슬라임 존재와 무관하게 부활 증강이 정상 발동한다. 최후의 발악 등 다른 before-defeat 효과와 ClusterSummonService 치환 자체의 수치/동작은 변경하지 않음.

3.1117: SummonAIService의 chase-melee 복구가 라임 어린 슬라임의 기존 전용 우선행동을 건너뛰던 회귀 수정. projectileAvoidance/fieldAvoidance/enemyAvoidance/damageEscape/ownerThreatHold/ownerReturn/attackTraversal 중 하나라도 존재하는 chase-melee는 기존 priorityUpdate 흐름을 그대로 사용하고, 이러한 우선행동이 없는 순수 chase-melee(엘린 유령 등)만 chaseMeleeUpdate로 즉시 진입한다. 라임 AI 데이터와 수치는 변경하지 않았고 엘린 유령 추적/공격 복구는 유지한다.

3.1116: 레이즈 시간 호의 밝은 색을 파란빛이 도는 밝은 톤으로 변경. timeColor 255,239,170 → 225,235,255. 클릭 충전 호 색 191,161,54 및 3초/15회 차징 동작은 변경하지 않음.

3.1115: 하츠하츠 RMB `캔버스 위 세상`의 드래그 경로 스테미나 소모량을 cost.perDistance 1.33→0.7로 감소. 경로 계산/이동 속도/방어 효과/기타 수치는 변경하지 않음.

3.1114: 레이즈 평타 스테미나 표기에서 `/클릭`만 제거. 공통 multiClick 스테미나 포맷터에 선택적 staminaCostSuffix를 추가하고 레이즈만 빈 suffix를 사용한다. 실제 clickCost 30 및 3초/15회 차징 동작은 변경하지 않음.

3.1113: 레이즈 시간 호 밝기 상향. 기존 밝은 황금색 235,207,104가 배경과 클릭 충전 호 위에서 충분히 구분되지 않아 timeColor를 더 밝은 255,239,170으로 변경했다. 클릭 충전 호 색 191,161,54, 동일 반경 overlay 구조, 3초/15회 차징 동작은 유지한다.

3.1112: 레이즈 3초 클릭 차징 종료 시 미완성 차징을 취소하지 않고 현재 progressScale 값으로 자동 발사하도록 변경. MultiClickAttackService에 범용 fireOnWindowEnd 옵션을 추가해 fixed window 종료 시 진행도가 1 이상이면 releaseNow를 실행한다. 레이즈는 fireOnMax:true를 유지해 15회 도달 즉시 발사하고, fireOnWindowEnd:true/cancelOnWindowEnd:false로 3초 종료 시 현재 차징으로 자동 발사한다. 레이즈 시간 호 색은 파란 80,110,160에서 레이즈 기본색 계열의 밝은 235,207,104로 변경했으며 클릭 충전색 191,161,54와 같은 반경 overlay 구조는 유지한다.

3.1111: 3.1110의 레이즈 시간 호 구현을 클레아 달 그림자 실제 구조에 맞게 교정. 클레아의 두 gauge.arc는 모두 기본 chargeRadius를 사용해 같은 반경에 겹쳐 렌더되고, ArcGaugePresentationService 기본 startAngle -PI/2 / span +2PI를 공유한다. 레이즈도 클릭 충전 호를 먼저 같은 chargeRadius에 그리고, progress×timed-remaining 시간 호를 그 위에 같은 반경으로 겹쳐 그리도록 변경했다. 3.1110에서 추가한 outerTimeGaugeRadius 및 상태/반격 링 바깥 슬롯 점유 처리는 제거했다. 레이즈 기존 충전/시간 색상은 유지한다.

3.1110: 레이즈 클릭 차징 시간 호를 클레아 달 그림자식 progress-timed-remaining 표현으로 변경. 클릭 충전 호는 기존 안쪽 chargeRadius에 유지하고 시간 호는 바로 바깥 링 슬롯에 렌더한다. 시간 호 값은 현재 클릭 충전 비율 × 3초 lifetime 남은 비율이며 기존 timeColor 80,110,160 / chargeColor 191,161,54를 유지한다. EntityRingLayoutService도 바깥 시간 호를 점유 링으로 인식해 상태/반격 링이 겹치지 않게 한다.

3.1109: 레테 우편함 우편 사거리 1400→800. 레이즈 평타는 3초 고정 클릭 카운트 방식으로 변경. 3초 동안 클릭 간격 제한 없이 15회 누르면 15번째 클릭 즉시 발사하며, 3초 종료 시 15회 미만이면 공격 없이 차징 상태/미리보기를 취소한다. 레이즈의 holdAfterWindow, holdGrace, releaseTrigger, idle-release 연타 종료 기믹은 더 이상 사용하지 않는다.

3.1108: 레테 우편함 우편 투사체의 길찾기 AI 제거. attack.lete.mailbox-mail의 delivery.projectile.pathfindingTarget을 제거하고 기존 공통 homing으로 변경했다. 지정된 recipientEntityId/targetEntityId만 계속 추적하도록 homing에 범용 targetEntityOnly 옵션을 추가했으며, 기존 pathfinding의 기본 회전 속도였던 maxTurnPerFrame .08을 유도 회전 속도로 유지한다. projectile.pierce walls:true를 추가해 벽을 무시하고 직선 공간에서 대상 방향으로만 유도된다. A* GridPathfinding, waypoint 재계산, wallSafeSteering, wall correction, retargetOnDeath는 더 이상 우편함 우편에 사용되지 않는다.

3.1107: 레이즈 1.5초 클릭 차징 종료 후 300ms 홀드 전환 유예 추가. MultiClickAttackService의 holdAfterWindow 모드에 범용 holdGrace를 추가했다. 레이즈는 1500ms 차징 종료 후 300ms 동안 press/release로 공격이 발사되지 않으며, 이 시간에 LMB를 다시 눌러 held 상태로 전환할 수 있다. 1800ms 시점에 held면 차징을 유지하고, held가 아니면 즉시 발사한다. 1800ms 이후 held 상태에서 LMB release 시 즉시 발사한다. 유예 중 추가 클릭은 충전량을 늘리지도 않고 발사를 만들지도 않는다.

3.1106: 레이즈 파워 펀치 입력 구조 개편. MultiClickAttackService에 범용 holdAfterWindow 모드를 추가했다. 레이즈는 첫 입력부터 1500ms의 고정 클릭 차징 구간을 사용하며 그 안에서는 클릭마다 충전량이 증가한다. 1500ms 종료 시 LMB를 누르고 있으면 현재 차징을 유지하고, 누르고 있지 않으면 즉시 발사한다. 1500ms 이후 유지 중에는 추가 연타로 타이머를 갱신하지 않으며 LMB release 즉시 발사한다. 기존 300ms idleRelease 종료 감지 선딜은 레이즈에서 제거했다. 최대 클릭 수 및 progressScale 상한을 12→15로 변경했고 반격의 charge/boost 최대치도 15로 통일했다. 또한 3.1104에서 나남낭 반격 수면 대신 RMB 수면이 잘못 1200ms로 변경된 이전 패치를 바로잡아, RMB는 800ms로 복구하고 반격 수면을 요청대로 1200ms로 적용했다.

3.1088: 파비콘 모서리 시각 복원. 3.1087의 SVG는 원래 rx=12 둥근 사각형이었지만 PNG/ICO fallback이 불투명 사각 캔버스를 사용해 해당 포맷을 채택한 브라우저에서 모서리가 각져 보일 수 있었다. PNG 32/64와 ICO를 투명 배경 위 rx=12 비율의 둥근 사각형으로 다시 생성하고, 런타임 favicon fallback도 같은 둥근 PNG64를 사용하도록 교체했다. 기존 교차 검 도형과 색상은 유지한다.

3.1087: 파비콘 복구를 브라우저 채택/캐시 문제까지 포함해 재구성했다. 3.1086의 SVG favicon 문자열은 기존 3.894(1)과 동일했고 favicon을 삭제/교체하는 런타임 코드도 없었으므로 단순 태그 누락은 원인이 아니었다. favicon 선언을 head의 viewport 직후로 이동해 조기 발견되도록 하고, 같은 Duels 교차 검 도형을 SVG sizes:any / PNG 32x32 / PNG 64x64 / ICO shortcut / apple-touch-icon으로 모두 내장했다. PNG 데이터는 3.1087 전용 바이트를 사용해 로컬 file URL의 stale/blank favicon 캐시 재사용 가능성을 낮췄다. 추가로 head의 duels-favicon-runtime이 로드시 64x64 PNG rel=icon을 동적으로 한 번 더 등록하고 pageshow/탭 재활성 시 재할당해 브라우저가 정적 SVG를 무시하거나 이전 빈 favicon 상태를 유지하는 경우를 보완한다.

3.1086: 파비콘 복구. 사용자가 제공한 3.894(1).html의 실제 작동하던
태그를 그대로 추출해 <title>Duels</title> 바로 뒤에 삽입했다. 3.1075 이후 추가했던 shortcut icon/ICO fallback 및 중복 favicon link는 모두 제거해 reference 파일과 동일한 단일 favicon 구조로 복원했다.

3.1085: 큐리 LMB FAR 평타 설명에 `캐릭터 멀리서 클릭으로` 구문을 추가했다. 평타 AttackSpec의 피해/비용/쿨다운/범위/동작은 변경하지 않았다.

3.1084: 3.1083에서 추가한 적 인식 범위 점선의 벽 차단 시각 변경만 취소했다. activeDetectionRange range.circle의 wallPolicy/wallSegments를 제거하고 공통 range.circle 렌더를 기존 완전 원형 ctx.arc 경로로 복원했다. 3.1082까지의 AI 전투 회피 조건/확률/스테미나/반격/추종 규칙과 다른 기능은 유지한다.

3.1046: 3.1045에서 잘못 적용한 직접 enemyAvoidance 도주 중 합체 방향 bias를 제거했다. 요청대로 라임 주변에 적이 있어 ownerThreatHold가 활성화되어 어린 슬라임이 안전 위치 주변을 배회하는 동안에만 같은 단계 mergePartner를 우선 추적하도록 수정했다. ClusterSummonService가 mergePartner를 먼저 계산해 ownerThreatMergeTarget으로 전달하고, ownerThreatHold는 해당 대상이 있으면 랜덤 배회 대신 그 슬라임 방향으로 이동한다. 슬라임 자신의 적 직접 회피/fleeEnemy, desperate fallback, hostile field 합체 경로 차단, 실제 접촉 합체 판정은 기존 동작을 유지한다.

3.1044: 샤이라즈 추가 덫/반격기 직접 적중의 피해와 기절을 일반 덫 스킬과 항상 동일하게 유지하도록 참조 구조로 통합했다. attack.shairaz.counter는 damageRatioRefAttackId:'attack.shairaz.trap-trigger'를 사용하고, counter.execute는 ccRefAttackId:'attack.shairaz.trap-trigger'를 사용한다. AbilityService에 범용 damageRatio 참조 해석을 추가해 런타임 AugmentService.prepareAttack과 CharacterDescriptionService가 같은 기준을 사용하며, CounterModuleService는 참조 AttackSpec의 CC 모듈을 재사용한다. 따라서 현재 일반 덫 150 피해/1.25초 기절이 반격기 직접 적중에도 동일하게 적용되고, 이후 일반 덫 수치를 바꾸면 자동으로 함께 변경된다. 캐릭터 ID 분기는 추가하지 않았다.

3.1043: 샤이라즈 추가 덫(반격 투척)의 직접 피해를 일반 덫과 동일한 150으로 맞췄다. 샤이라즈 Base Damage 70 기준 attack.shairaz.counter의 damageRatio를 7에서 2.142857142857143(15/7)으로 변경했다. 착탄 후 생성되는 shairaz-counter-trap은 기존처럼 attack.shairaz.trap-trigger를 사용하므로 덫 발동 피해도 150, 기절 1250ms를 유지한다.

3.1042: 샤이라즈 기본 피해를 50에서 70으로 변경해 attack.shairaz.lmb의 damageRatio 1 기준 평타 7발이 탄환당 70 피해를 주도록 조정했다. 덫 발동 attack.shairaz.trap-trigger는 새 Base Damage 70 기준 정확히 150 피해가 되도록 damageRatio를 2.142857142857143(15/7)으로 변경했다. 덫 기절 1250ms, 설치 스테미나 800, 설치 쿨다운 400ms, 회수 전용 400ms는 유지한다.

3.1041: 샤이라즈 덫 발동 공격 attack.shairaz.trap-trigger의 기절 시간을 1500ms에서 1250ms로 조정했다. 덫 설치 쿨다운 400ms, 설치 스테미나 800, 회수 전용 400ms 쿨다운, 발동/피해 반경 78은 유지한다.

3.1040: 샤이라즈 일반 RMB 덫 설치 쿨다운을 1700ms에서 400ms로 되돌리고, 설치 스테미나 소모를 600에서 800으로 증가시켰다. 회수는 기존처럼 별도 공용 attackDelayGroup 'shairaz-rmb-recall' 400ms를 유지해 설치 쿨다운과 독립적으로 동작한다. 덫 발동/피해 반경 78, 회수 반경 39, 최대 설치 수 3은 변경하지 않았다.

3.1039: 샤이라즈 덫 발동 후 설치 불가 지역과 해당 afterlife 이펙트를 제거했다. 일반/반격 덫의 triggerAfterlife 및 placementBlockRadius를 제거하고 RMB 입력의 afterlife field.at-target 설치 차단 조건도 삭제했다. 일반 RMB 덫 설치 쿨다운은 400ms에서 1700ms로 변경했다. 회수는 설치 쿨다운과 분리해 일반 덫/반격 덫 회수 모두 공용 attackDelayGroup 'shairaz-rmb-recall' 400ms를 사용하므로, 설치 쿨다운과 회수 쿨다운이 서로 간섭하지 않는다. 실제 덫 발동/피해 범위 78, 회수 반경 39, 최대 설치 수 3은 유지한다.

3.1038: 샤이라즈 지뢰 발동 후 재설치 금지 반경을 156에서 118로 조정했다. 기준은 트랩 자체 지름 78(range 39×2) + 플레이어 기본 지름 40(radius 20×2) = 118이다. 일반/반격 지뢰의 placementBlockRadius 및 RMB afterlife 설치 차단 조건을 모두 118로 통일했다. 기존 detonationPointPresentation은 placementBlockRadius를 시각 반경으로 사용하므로 afterlife 이펙트도 118로 함께 변경된다. 실제 triggerResolveRange/피해 반경 78과 회수 반경 39는 변경하지 않았다.

3.1037: 샤이라즈 지뢰 발동 후 시각 범위를 기존 afterlife/detonation 이펙트 하나로 통일했다. 3.1036에서 추가한 별도 placementBlockIndicator 이펙트는 제거하고, 기존 detonationPointPresentation의 원 반경이 placementBlockRadius가 있으면 이를 우선 사용하도록 범용화했다. 따라서 샤이라즈 일반/반격 지뢰는 발동 후 기존 원 이펙트가 156으로 표시되며, 실제 trap-trigger 발동/피해 범위 78과 설치 불가 판정 156은 그대로 유지된다. EffectSpawnService 및 기존 effect-spawn 동기화 경로를 그대로 사용하며 캐릭터 ID 분기는 없다.

3.1036: 샤이라즈 지뢰 발동 후 설치 불가 반경 156이 보이지 않던 시각 문제를 수정했다. 기존 폭발/피해 이펙트는 triggerResolveRange 78을 그대로 사용하고, field presentation의 placementBlockIndicator가 활성화된 경우 placementBlockRadius 크기의 별도 채움 없는 점선 원을 triggerAfterlife 동안 표시한다. 샤이라즈 일반/반격 지뢰에 indicator를 활성화해 폭발 78과 설치 금지 156을 시각적으로 분리했다. EffectSpawnService 및 기존 effect-spawn 네트워크 동기화 경로를 재사용하며 캐릭터 ID 분기는 없다.

3.1035: 샤이라즈 지뢰의 발동 후 재설치 금지 반경을 78에서 156으로 확대했다. 일반 RMB 지뢰와 반격 지뢰 모두 field.area placementBlockRadius를 156으로 변경했고, RMB 입력 전 field.at-target afterlife 차단 조건도 동일하게 156으로 맞췄다. 지뢰 실제 발동 반경 triggerResolveRange 78, trap-trigger 공격 범위 78, 회수 반경 39는 기존 유지.

3.1034: 타다타 RMB 덩굴 지대 투사체가 탄착할 때 기존 attack.tadta.vine-tick을 projectile.impact attackIds에서 1회 실행하도록 추가했다. 따라서 탄착 순간 반경 180에 타다타 baseDamage 50 × damageRatio 2 = 100 피해를 주고, 기존 vine-slow-field 설치와 별도 피해 field.area는 그대로 유지한다. 장판 자체는 triggerOnEnter:false를 유지해 진입 즉시 피해가 없으며 이후 1초 주기 vine-tick만 적용된다. 새 전용 AttackSpec 없이 기존 타다타 장판 틱 AttackSpec을 재사용한다.

3.1033: 3.1032에서 잘못 복구한 소르 정전기장 진입 즉시 tick 피해를 제거했다. 소르 RMB 투사체 탄착 시 별도 attack.sor.rmb-impact를 projectile.impact attackIds로 실행하도록 복구해, 탄착 순간 장판 반경 120 안의 적에게 0.5배 피해와 감전 2초를 1회 적용한다. 설치된 정전기장 자체는 triggerOnEnter:false를 유지하며 진입 즉시 피해는 없고, 기존 attack.sor.field-tick의 1초 주기 피해/감전만 유지한다.

3.1032: 소르 RMB 정전기장 착탄 즉시 피해 복구 및 어린 슬라임 장판 회피 개선. 소르 projectile.impact field에 기존 InstalledAreaFieldService의 triggerImmediately:true를 사용해 설치 순간 attack.sor.field-tick을 즉시 1회 처리하고 이후 1초 간격 장판 피해를 유지한다. SummonAIService에 기존 field.area collisionArea를 재사용하는 hostileFieldObstacles/segmentCrossesHostileField를 추가해 ownerReturn/배회/동단계 합체 추적 경로가 적 피해 장판을 장애물로 취급하므로 안전지대에서 장판 쪽으로 다시 접근하지 않는다. fieldAvoid의 유효 탈출 판정은 enemy fleeEnemy와 동일하게 found=true + 장판 밖 + 위협 중심으로부터 최소 max(12,cellSize*0.35) 거리 증가를 요구하며, 실패 시 기존처럼 위협 중심 fallback과 fieldAvoidDesperate 고정을 사용한다. 캐릭터 ID 분기 없이 데이터 기반 fieldAvoidance를 사용하는 소환수에 재사용된다.

3.1031: 플레이어 이탈 후 한 명만 남아도 매치 종료가 누락될 수 있는 호스트 권위/마이그레이션 경로를 수정. 기존 RoomMatchLifecycleService를 확장해 activeMatchPids 중 connected=true, departed=false, spectator/spectating=false이며 현재 라운드에서 살아 있는 참가자만 세는 activeSurvivorPids와 호스트 전용 reevaluateRemainingPlayers를 추가했다. 일반 참가자 이탈 시 기존 eliminateDepartedPlayer 뒤 즉시 재평가하며, 호스트 이탈 시 beginHostMigration에서 로컬 매치를 선종료하던 경로를 제거해 반드시 새 호스트 선출을 완료한다. 새 호스트 peer open 및 resumeDelegatedHostPhase 진입 시 같은 canonical 재평가를 실행해 생존 참가자가 정확히 1명이면 기존 abortMatchToRoom으로 매치를 종료한다. 생존자가 2명 이상이면 기존 evaluateRoundSurvivors를 호출하고, 0명은 기존 동시 사망 death resolution에 맡긴다. 새 네트워크 시스템/캐릭터 예외 없음.

3.1030: 어린 슬라임 AI가 적대적인 피해 field.area 장판도 회피하도록 SummonAIService의 기존 회피 계층을 범용 확장했다. 새 fieldAvoidance는 InstalledAreaFieldService의 실제 collisionArea/relationAllowed/overlapsAreaPoint를 재사용해 활성 적 장판만 판정하며, 라임 슬라임은 detectionPadding 48, pathDistance 260, recalc 180ms를 사용한다. 일반 도주 경로가 장판 밖으로 빠져나가지 못하면 기존 enemyAvoidance 발악 구조와 같은 방식으로 fieldAvoidDesperate 상태를 고정하고 attackTraversal을 포함한 fallback 경로를 사용하며, 장판 영역에서 exitPadding 72만큼 완전히 벗어날 때까지 발악 상태를 유지한다. 투사체 회피 우선순위는 기존대로 더 높고, 캐릭터 ID 하드코딩/새 장판 시스템은 없다.

3.1029: 3.1028의 어린 슬라임 mergeMinOverlap 4px 변경을 취소했다. 군집 합체 접촉 조건은 다시 중심거리 <= 두 Entity 반지름 합의 기존 기준으로 복원했다. 다른 합체 조건/AI 우선순위/체력 정책은 변경하지 않았다.

3.1028: 군집 소환수 합체 조건에 범용 mergeMinOverlap을 추가했다. 기존에는 두 Entity 중심거리가 반지름 합 이하이면 접촉만 해도 즉시 합체했지만, 이제 실제 겹침량(contactDistance-distance)이 지정 최소값 이상일 때만 합체한다. 라임 어린 슬라임은 mergeMinOverlap:4를 사용해 반지름 20 기준 중심거리 36 이하, 즉 약 4px만 겹치면 합체한다. 합체 체력 비율/단계/AI는 기존 유지. 캐릭터 ID 분기 없음.

3.1027: 위치 지정 공격의 벽 좌표 보정을 기본 정책으로 통일했다. targetPoint:true 투사체는 targetPointResolve를 명시하지 않으면 기존 엘린 LMB와 같은 nearest-open/clearance 2를 기본 사용한다. movement.move direction:'target-point' 역시 AttackService.resolveTargetPoint()에서 같은 nearest-open 기본 정책을 사용하므로 라임 뛰어오르기 등 위치 지정 이동도 벽 내부 좌표를 가장 가까운 유효 지점으로 보정한다. live-aim-point 원형 delivery도 centerPointResolve 미지정 시 nearest-open이 기본이다. 메후구 RMB처럼 벽 자체를 목표로 쓰는 특수 공격은 targetPointResolve:'none'을 명시해 기본 보정에서 제외한다. 캐릭터 ID 분기 없음.

3.1026: 라임 어린 슬라임 치환 부활 시 최대 체력 증강이 이중 적용되던 버그 수정. ClusterSummonService.replaceOwnerBeforeDefeat()가 기존에는 summon.maxHealth(증강 반영 후 유효 최대체력)를 owner.baseMaxHealth에 그대로 대입한 뒤 AugmentService.syncVitals()에서 탱크 등 maxHealth modifier를 다시 적용했다. 이제 summon.baseMaxHealth를 부활 캐릭터의 canonical baseMaxHealth로 승계하고, 현재 체력은 summon.health/summon.maxHealth 비율로 보존한 뒤 기존 syncConstantBuffs/syncVitals 경로가 증강을 정확히 한 번만 적용한다. 예: 900 기본 어린 슬라임 + 탱크 = 1080에서 부활해도 최종 최대체력 1080 유지.

3.1025: 스야 은신 해제 범위와 은신 기습 빙결 범위를 동일 판정값으로 통일했다. StealthModeService의 detectAttackId 실행 시 AugmentService.prepareAttack 이후 delivery.area와 AttackSpec range를 현재 stealth state.detectRange로 다시 정규화한다. 따라서 기본 80뿐 아니라 향후 detectRange가 변경되어도 은신 해제 판정과 빙결 공격 판정이 항상 같은 반경을 사용하며, 범위 증폭 등 공격 범위 보정으로 둘이 어긋나지 않는다. 기존 TriggeredAttackService/저스트 회피 경로는 유지한다.

3.1024: 디버그 맵 탭의 맵 선택 버튼이 로컬 DebugMapService.set()만 호출해 상대에게 동기화되지 않던 버그 수정. 기존 OnlineDebugMapSyncService.apply()를 재사용해 로컬 적용과 duel-debug-map-change 송신을 같은 경로로 통일했다. 수신 측은 기존 OnlineDebugMapSyncService.receive() 및 DebugMapService.set() 경로를 그대로 사용한다. 새 네트워크 시스템 없음.

3.1023: 스야 은신 기습 0피해 빙결 공격을 기존 칸 RMB의 effects-only CC 공격 구조에 맞췄다. attack.sya.stealth-freeze에 effectsOnly:true를 추가하고, 직접 on-hit status.apply 대신 delivery.area 적중 후 hit.sequence에서 hit-target에게 freeze 500ms를 적용한다. TriggeredAttackService 기반 일반 공격/회피/저스트 회피 경로는 그대로 유지한다. 따라서 정상 적중 시 빙결이 적용되고, 회피 중이면 기존 공격 적중 판정에서 저스트 회피와 반격 획득을 처리한다.

3.1022: 스야 서리안개 은신 기습 빙결을 직접 CombatStatusApplicationService.apply() 하던 별도 경로에서 제거하고 기존 AttackSpec 적중 경로로 통합했다. 신규 attack.sya.stealth-freeze는 피해 0, 반경 80 원형 delivery.area + freeze 500ms로 구성되며 StealthModeService의 근접 감지 시 은신 해제/공속 버프 이후 TriggeredAttackService.execute()로 실행된다. 따라서 일반 공격과 동일한 회피 비대상/저스트 회피/적중 판정/온라인 공격 재생 경로를 사용하고, 회피 성공 시 빙결 미적용과 기존 JustDodgeService 반격 획득이 함께 처리된다. 3.1021에서 추가했던 requireTargetable 직접 상태 우회 코드는 제거했다.

3.1021: 스야 서리안개 은신 감지 빙결이 회피 비대상 판정을 건너뛰던 버그 수정. StealthModeService가 detectStatus를 CombatStatusApplicationService에 직접 적용하던 경로에 데이터 기반 detectStatusRequiresTargetable 옵션을 추가했다. CombatStatusApplicationService는 requireTargetable이 true인 직접 상태 부여에 대해 ActionStateCombatPolicyService.blocksAttackInteraction()을 검사하며, 온라인 status packet에도 동일 플래그를 전달해 대상 권위에서 재검사한다. 따라서 스야 은신은 근접 감지 시 기존대로 해제되지만 상대가 회피 판정 중이면 freeze는 적용되지 않는다. 일반 상태 부여는 기본 false로 기존 동작 유지.

3.1020: 밸런스/버그 수정. 라임 뛰어오르기 attack.lime.jump의 cooldown 900→1400ms, stamina cost 300→500. 루뷰 RMB 왕복 무기 스킬의 발사/귀환 탄속을 32.2→24.15(-25%)로 통일. FormulaSequenceService에 데이터 기반 mistakeProgress 규칙을 추가하고 큐리는 오입력 시 현재 단계는 유지한 채 현재 단계 입력 진행도를 floor(progress*0.5)로 감소시킨다(1→0,3→1). 헤르쟝 대포의 meleeAttackId가 데이터에는 존재하지만 SummonAIService에서 stationary 자동공격 실행 경로가 빠져 있던 문제를 수정했다. 기존 nearestEnemy/meleeRange/attack/attackInterval을 재사용하는 범용 stationaryAutoAttack을 추가하고 carry 중에는 공격하지 않도록 했다.

3.1019: 라임 어린 슬라임의 막다른 도주 폴백에 발악 모드를 추가했다. 막다른 길로 판정되어 적 방향 폴백 경로를 선택하면 enemyAvoidDesperate 상태와 해당 적 ID를 잠그고, 적과 330 이상 거리가 벌어질 때까지 일반 nearest-enemy 재판정 및 recalcMs 기반 경로 교체를 하지 않는다. 발악 중에는 현재 탈출 경로를 끝까지 소비한 뒤에만 다음 도주 경로를 계산하며, 잠긴 적이 사망/무효화되거나 exitDistance를 넘으면 정상 AI로 복귀한다. 기존 2칸 벽 slime-auto movement-attack traversal은 유지한다.

3.1018: 라임 어린 슬라임의 막다른 도주 판정을 found 여부만으로 판단하던 문제를 수정했다. 맵 가장자리/구석에서는 nearestOpenPoint가 현재 근처의 유효 좌표를 반환해 A*가 found:true가 될 수 있으므로, 이제 도주 경로의 최종 지점이 현재보다 적과의 거리를 최소 12px 또는 path cell의 35% 이상 실제로 늘리는지 확인한다. 거리 이득이 없는 경로는 found:true라도 막다른 길로 판정하여 적 위치를 최후 폴백 목표로 재탐색한다. 기존 2칸 벽 movement-attack traversal은 동일하게 유지한다.

3.1017: 라임 어린 슬라임 도주 경로 폴백 판정을 수정했다. GridPathfindingService는 목표 도달 실패 시에도 closest partial path를 반환하므로, 기존 '!found && path.length===0' 조건은 막힌 상황을 실패로 인식하지 못했다. 이제 도주 목표 탐색 결과가 found:false이면 부분 경로 존재 여부와 무관하게 도주 실패로 판정하고 적 위치를 최후 폴백 목표로 다시 길찾기한다. 적 방향 폴백 경로에서도 기존 2칸 벽 movement-attack traversal을 그대로 사용한다.

3.1016: 라임 어린 슬라임 경로 AI를 범용 GridPathfindingService 확장으로 개선했다. 선택적 traversal 설정이 있는 소환수는 최대 지정 blocked cell 수의 짧은 벽 구간을 movement-attack 링크로 경로 탐색할 수 있고, 해당 waypoint에 도달하면 일반 이동이 아니라 기존 공격 이동 AttackSpec을 실제 실행한다. 라임 slime은 attack.lime.slime-auto로 최대 2칸 벽을 150 이동거리의 traversal 평타로 건너도록 설정했다. enemyAvoidance는 적 반대 방향의 경로를 먼저 탐색하고, 도망 경로가 완전히 없을 때만 적 위치 자체를 최후 폴백 목표로 길찾기한다. ownerReturn도 같은 traversal 링크를 사용한다. 캐릭터 ID 예외 없음.

3.1015: CharacterTitleService의 기존 칭호 데이터에 라임 '슬라임 보호자', 큐리 '큐브 선수'를 추가했다. 마스터 V 칭호 표시 구조 및 다른 캐릭터/맵 데이터는 변경하지 않았다.

3.1014: 사용자가 전달한 팀전 공식 맵 35개(오픈10/반오픈15/비오픈10)를 누적 적용했다. 모든 맵은 mode:'team', 35×50, tileWorldSize 50이며 표시 이름은 '팀전 ' 접두사를 사용한다. 기존 기본 공식 맵35, FFA 공식 맵35, 훈련장은 그대로 유지했다. 각 팀전 맵의 원본 tiles를 연속 벽 사각형으로 압축 저장하고 전체 35개 복원 결과를 원본과 전수 비교해 불일치 0 확인.

3.1013: 사용자가 전달한 FFA 비오픈맵7~10을 기존 공식 FFA 맵 데이터에 누적 적용했다. 기존 FFA 오픈10/반오픈15/비오픈1~6은 유지하며 최종 FFA 비오픈맵은 1~10이 되었다. 표시 이름은 'FFA 비오픈맵N' 규칙을 적용하고, 각 54×54 타일 원본은 연속 벽 사각형으로 압축 저장했다. 4개 모두 원본 tiles와 압축 복원 결과 전수 비교 불일치 0.

3.1012: 3.991 맵 초기화 이후 누락돼 있던 3.960 기준 기존 FFA 오픈맵10/반오픈맵15를 복구했다. 3.960의 duels2BuildOpenTileLayout/duels2BuildSemiOpenTileLayout → duels2BuildFfaSquareTiles 변환을 그대로 재현해 54×54 타일 결과를 생성했고, 각 결과를 현재 공식 맵 압축 형식 wallRects로 저장했다. 예전 FFA 비오픈맵15는 사용자 지시에 따라 복구하지 않았고 현재 사용자 제작 FFA 비오픈맵1~6을 유지한다. 표시 이름은 FFA 오픈맵 01~10 / FFA 반오픈맵 01~15로 기존 형식을 유지한다.

3.1011: 공식 맵 표시 이름 규칙 정리. mode:'ffa'인 맵 이름 앞에 'FFA ', mode:'team'인 맵 이름 앞에 '팀전 '을 자동 접두 표기로 적용했다. 맵 ID/모드/타일 데이터/선택 로직은 변경하지 않았고 basic/훈련장 이름은 그대로 유지한다.

3.1010: 3.1009에서 함께 들어온 빈 FFA '새 맵' 항목만 제거했다. FFA 비오픈맵1~6, 기존 기본 공식 맵 35개, 훈련장 맵 및 맵 에디터 기능은 변경하지 않았다.

3.1009: 사용자가 전달한 Duels3_Maps (3).json의 FFA 비오픈맵 묶음을 기존 공식 맵 데이터에 누적 적용했다. 업로드된 모든 맵은 ffa / 54×54 / tileWorldSize 50임을 확인했고, 기존 기본 오픈10+반오픈15+비오픈10 및 훈련장/맵 에디터 기능은 유지했다. 업로드 내부 ID는 재사용될 수 있으므로 official-ffa-closed-XX 형식의 충돌 없는 공식 ID를 부여했으며, 타일 배치는 변경하지 않고 연속 벽 타일을 사각형 목록으로 압축 저장했다. 각 맵의 원본 tiles와 압축 복원 결과 전수 비교 불일치 0.

3.1008: FFA 맵 에디터 시작 위치 미리보기를 4인 전용에서 3인/4인 동시 표시로 확장했다. 새 스폰 좌표를 하드코딩하지 않고 기존 MatchSpawnService.pointMap을 참가자 3명과 4명 각각에 재사용해 실제 정다각형 스폰 계산을 그대로 표시한다. 3인 마커는 청록색 '3인 P1~P3', 4인 마커는 기존 노란색 '4인 P1~P4'로 구분하며 실제 매치 스폰 로직은 변경하지 않았다.

3.1007: 3.1006의 훈련장 교체 과정에서 canonical duels2TileWalls/duels2CreateTilemap 정의가 함께 제거되어 발생한 ReferenceError를 수정했다. 정상 구조의 3.1005를 기준으로 맵 시스템을 복원하고, 사용자가 전달한 새 훈련장 맵은 오직 duels2BuildTrainingTileLayout 내부 데이터만 교체했다. TRAINING_TILEMAP 생성 경로와 기존 공식 기본 맵 35개는 그대로 유지했다.

3.1005: 사용자가 전달한 Duels3_Maps (2).json의 비오픈맵1~10을 기존 오픈맵1~10 및 반오픈맵1~15에 누적해 공식 기본 맵으로 추가했다. 업로드 전체를 검사해 10개 모두 basic / 28×40 / tileWorldSize 50이며 이름이 비오픈맵1~10 순서임을 확인했다. 기존 ID와 충돌하지 않도록 비오픈맵은 official-basic-closed-01~10으로 지정했다. 전체 tiles는 기존과 동일하게 연속 벽 타일 사각형으로 압축 저장하며 10개 모든 타일과 복원 결과를 전수 비교해 불일치 0 확인.

3.1004: 사용자가 전달한 Duels3_Maps (1).json의 반오픈맵1~15를 기존 오픈맵1~10에 누적해 공식 기본 맵으로 추가했다. 업로드 파일 전체를 검사해 15개 모두 basic / 28×40 / tileWorldSize 50이며 이름이 반오픈맵1~15 순서임을 확인했다. 기존 official-basic-01~10과 ID가 충돌하지 않도록 반오픈맵은 official-basic-semiopen-01~15로 지정했다. 각 맵의 전체 tiles는 연속 벽 타일을 [rowStart,rowEnd,colStart,colEnd] 사각형으로 압축 저장하고 런타임에서 기존 tiles로 정확히 복원한다. 15개 모든 타일과 압축 복원 결과 전수 비교 불일치 0.

3.1003: 사용자가 전달한 Duels3_Maps(1).json의 기본 오픈맵1~10을 공식 맵으로 이식했다. 전체 28×40 0/1 배열을 소스에 직접 중복 저장하지 않고 연속 벽 타일을 [rowStart,rowEnd,colStart,colEnd] 사각형 목록으로 압축한 OFFICIAL_DUELS_MAP_SOURCE를 사용한다. 시작 시 duels2DecodeOfficialMapTiles가 기존 tiles 형식으로 정확히 복원하므로 DebugMapService/맵 에디터/전투 맵 선택 인터페이스는 변경하지 않는다. 원본 10개 모든 타일과 압축 후 복원 결과를 전수 비교해 불일치 0 확인.

3.1002: 맵 에디터 대칭 UI 정리. 3.1000~3.1001에서 이미 하나의 180도 반대편 복제 기능으로 합쳐진 동작에 맞춰 symmetry 상태를 diagonal 단일 토글로 단순화하고, 맵 탭의 대칭 버튼도 '대각선 대칭' 하나만 남겼다. 설치/제거/드래그의 실제 반대편 복제 로직은 변경하지 않았다.

3.1001: 맵 에디터 대칭 기능의 동작은 3.1000 그대로 유지하고 UI 명칭만 '대각선 대칭'으로 정리했다. 대칭 계산/설치/제거/드래그 로직 변경 없음.

4.000: 맵 에디터 대칭을 단일 180도 반대편 복제로 단순화했다. 대칭 토글 중 하나라도 켜져 있으면 모든 편집 타일은 정확히 `(rows-1-row, cols-1-col)` 위치에도 같은 값으로 적용된다. 좌표 정규화, 대각선 반사, 행/열 교환, 코너 분류 로직을 모두 제거했다. 설치/제거/좌우 드래그 범위 편집이 전부 같은 symmetricCells 경로를 사용하며 기본 40×28, FFA 54×54, 팀전 50×35의 모든 타일을 전수 검사해 반대편 매핑 누락 0을 확인했다.

3.999: 맵 에디터 대칭 처리에서 정규화 좌표/비율 좌표 반사식을 제거했다. 더 이상 `(u,v)` 좌표나 대각선 좌표식을 사용하지 않고, 실제 타일 배열의 row/col 인덱스 순번을 서로 대응시켜 대칭 타일을 찾는다. 좌하↔우상 축은 행/열 순번을 반대 방향으로 뒤집은 인덱스 대응, 좌상↔우하 축은 행/열 순번을 그대로 교환한 인덱스 대응을 사용한다. 설치/제거/드래그 모두 같은 배열 인덱스 대칭 경로를 사용한다.

3.998: 맵 에디터 대칭 토글의 의미를 코너쌍 복제에서 '대각선 축 대칭'으로 수정했다. 좌하단↔우상단 토글은 두 꼭짓점을 잇는 / 축을 기준으로 맵 전체를 반사하므로 좌상단↔우하단 영역도 자동으로 대응된다. 좌상단↔우하단 토글은 \ 축을 기준으로 맵 전체를 반사하므로 좌하단↔우상단 영역도 자동으로 대응된다. 직사각형 맵도 타일 배열의 행/열 순번 대응만 사용하며 설치/제거/드래그 모두 동일한 symmetricCells 경로를 사용한다. 두 축 동시 활성화 시 반복 closure로 두 반사와 합성 위치까지 함께 반영한다. 기본 40×28, FFA 54×54, 팀전 50×35 전체 좌표 범위 및 각 사분면 반사 방향 정적 실행 검증 완료.

3.997: 맵 에디터 대칭 누락 수정. 3.996에서는 타일을 좌하/우상 또는 좌상/우하 코너 구역으로 분류할 때 중앙 행/열을 center로 반환해 일부 위치가 어느 대칭 쌍에도 속하지 않아 대칭이 빠질 수 있었다. 이제 모든 타일을 중심 기준 두 코너쌍 중 하나에 반드시 배정하며 정확한 중앙선 타일도 tie-break 규칙으로 처리한다. 활성 대칭 쌍의 모든 타일은 정확한 반대 좌표 `(rows-1-row, cols-1-col)`에 동일 변경을 적용한다. 기본 40×28, FFA 54×54, 팀전 50×35의 모든 타일을 전수 검사해 미배정 0, 활성 쌍 대칭 누락 0을 확인했다.

3.996: 맵 에디터 대칭 의미 수정. 3.995의 정규화 좌표 대각선 반사 `(u,v)->(v,u)/(1-v,1-u)`를 제거했다. 이제 대칭은 타일의 정확한 반대편 대응 위치 `(rows-1-row, cols-1-col)`를 사용한다. '좌하단↔우상단'은 좌하/우상 구역에서 편집할 때만 해당 반대 코너에 복제하고, '좌상단↔우하단'은 좌상/우하 구역에서 편집할 때만 해당 반대 코너에 복제한다. 두 토글은 독립적이며 설치/제거/드래그 범위 모두 같은 규칙을 사용한다. 기본 40×28, FFA 54×54, 팀전 50×35 크기에 대해 반대 위치 매핑 정적 실행 검증 완료.

3.995: 맵 에디터 이동/대각선 대칭 편집 수정. 기존 에디터 카메라 이동이 Training.update 루프에 의존해 게임 시뮬레이션을 돌리지 않으면 WASD/Space 입력이 실제 프레임 이동으로 반영되지 않던 문제를 수정했다. DebugMapEditorService가 독립 requestAnimationFrame 루프를 소유하며 WASD 이동/Space spectatorDash/렌더를 직접 갱신하고, Training.update의 중복 에디터 이동 경로는 제거했다. 디버그 맵 탭에 '좌하단↔우상단', '좌상단↔우하단' 대칭 토글을 추가했다. 편집 적용은 대각선 좌표 반사가 아니라 각 타일의 정확한 반대편 대응 좌표 `(rows-1-row, cols-1-col)`를 사용한다. 좌하↔우상 토글은 좌하/우상 구역에서만, 좌상↔우하 토글은 좌상/우하 구역에서만 적용되며 좌클릭 설치/우클릭 제거/사각 드래그 모두 같은 규칙을 사용한다.

3.994: 맵 에디터 화면/스폰 표시 수정. 에디터가 관전자 카메라를 재사용하면서 일반 관전 화면의 붉은 전체 화면 오버레이와 기존 CombatScreenFeedback까지 함께 그려지던 문제를 수정해 에디터 활성 중에는 두 화면 tint를 모두 제외한다. DebugMapEditorService에 spawnPreview/drawSpawnPreview를 추가해 별도 하드코딩 좌표가 아니라 기존 MatchSpawnService.pointMap을 그대로 재사용하며 기본은 2명, FFA는 4명, 팀전은 2+2 팀 구성의 실제 시작 위치를 P1~P4 원형/십자 마커로 월드에 표시한다.

3.993: 맵 에디터 파일 전달 워크플로우 추가. 편집한 맵을 브라우저 개인 저장소에 보관하는 대신 선택 맵을 `Duels3_Map_맵이름.json`으로, 현재 설계 맵 전체를 `Duels3_Maps.json`으로 직접 다운로드할 수 있다. 단일 파일은 `{format:'duels3-map',version:1,map}`, 묶음 파일은 `{format:'duels3-map-bundle',version:1,maps}` 고정 포맷이며 이름/기본·FFA·팀전 모드/크기/tileWorldSize/전체 tiles를 그대로 보존한다. 사용자가 해당 파일을 다시 전달하면 공식 맵 데이터에 좌표 변경 없이 이식할 수 있다. 훈련장은 파일 저장 대상에서 제외.

3.992: 맵 에디터를 개인 localStorage 맵 제작기가 아니라 Duels 3 공식 맵 제작기로 변경했다. DebugMapStorageService/localStorage 영속화를 제거하고 OFFICIAL_DUELS_MAP_DATA.entries를 현재 파일의 실제 공식 맵 원본 데이터로 사용한다. DebugMapService의 생성/편집/삭제/이름 변경은 이 공식 데이터 배열을 직접 수정하며 기본/FFA/팀전 모드를 유지한다. 맵 탭에 현재 공식 맵 데이터를 코드 반영용 JSON으로 확인하는 영역을 추가했다. 훈련장은 계속 고정 내장 맵이며 편집/삭제 불가.

3.991: 디버그 맵 제작 툴 추가 및 기존 전투 맵 전면 제거. 내장 맵은 타일 훈련장 하나만 유지하고 기존 기본/FFA/팀전 맵 생성/목록을 삭제했다. DebugMapService를 사용자 커스텀 맵 CRUD + localStorage 영속화 구조로 확장하고, 새 DebugMapEditorService는 편집 카메라/입력/드래그 범위/타일 수정만 담당한다. 디버그 패널에 별도 '맵' 탭을 추가해 캐릭터 선택처럼 맵을 선택하고 기본/FFA/팀전 중 모드를 선택해 빈 맵을 생성, 이름 변경, 삭제, 편집 시작할 수 있다. 기존 조작 탭의 맵 변경 UI는 제거했다. 편집 중 WASD 이동/Space 대시/휠 줌, 좌클릭 벽 설치, 우클릭 벽 제거, 좌·우 드래그 사각 범위 채우기/지우기, ESC 종료를 지원하며 선택 범위를 월드에 표시한다.

3.990: 2대2 맵 전면 재제작. 랜덤 배치형 seed를 제거하고 직선/대각선/타원 링/사각 프레임/다각선처럼 명확한 기하 구조만 사용한다. 양 대각선 대칭은 생성 아이디어가 아니라 최종 공정성 검증/보정으로만 사용한다. 모든 맵은 연결요소 검사 후 필요 시 대칭 L자 통로를 결정론적으로 파서 FLOOR 연결요소가 정확히 1개가 되게 하며 AI가 갇히는 구조를 금지한다. 오픈 10/반오픈 15/비오픈 15는 서로 다른 도형 조합으로 구성하고 비오픈도 다중 외곽벽 대신 1~2겹 선형 차단, 관문, 격자, 링, 프레임을 사용한다. 정적 생성 검증: 40개 모두 고유, 양 대각선 대칭 오류 0, 모든 맵 FLOOR 연결요소 1, 평균 벽 밀도 오픈<반오픈<비오픈, 비오픈 최대 벽 수 제한 통과.

3.989: 2대2 맵 전면 재설계. 오픈/반오픈/비오픈을 서로 다른 finalizer와 10/15/15개의 별도 레이아웃으로 분리했다. 오픈은 넓은 3축 진입과 드문 엄폐, 반오픈은 방/관문/긴 벽/부분 회랑과 좁은 중앙 통로, 비오픈은 외곽 프레임을 공통 규칙으로 사용하지 않고 내부 방/격자/미로/성채/부분 외곽/뱀형 회랑 등 서로 다른 폐쇄 구조를 사용한다. 비오픈에는 외곽 사용 0인 내부형과 일부 외곽만 사용하는 형태를 여러 단계로 섞었다. 모든 후처리는 정규화 양 대각선 symmetry component 단위로 적용하며 정적 생성 검증에서 40개 모두 고유, 대각선 대칭 오류 0, 평균 벽 밀도 오픈<반오픈<비오픈, 비오픈 외곽 사용량이 여러 단계로 분산됨.

3.988: 2대2 맵 대칭/비오픈 재설계. 팀전 50×35의 정규화 양 대각선 partner mapping을 union-find equivalence component로 고정하고, 모든 팀전 맵의 최종 생성 단계에서 component 단위 대칭을 강제한다. 스폰/진입로/중앙 통로를 비울 때도 같은 component 전체를 비워 후처리로 대칭이 깨지지 않는다. 비오픈 15개는 별도 nonOpen 마감과 외곽 프레임/관문/방/회랑 구조를 사용하도록 전면 재구성했으며 큰 좌우 스폰 사각형과 3축 개방을 제거했다. 정적 생성 검증에서 팀전 40개(10/15/15), 양 대각선 대칭 오류 0, 전체 40개 레이아웃 고유, 비오픈 15개 전부 고유 및 외곽 3칸 띠/벽 밀도 기준 통과.

3.985: 큐리 설명 문구 수정. 공식 입력 설명의 '/ 자연회복을 끊지 않음' 표기를 ', 자연회복을 끊지 않음'으로 변경하고 LMB NEAR/RMB NEAR 양쪽 공식 입력 설명에 동일하게 표기한다. 기능/수치/로직 변경 없음.

3.984: 큐리 설명 보강. 공식 입력이 자연회복을 끊지 않는다는 안내 문구를 tooltipSkills에 추가한다. 기능/수치/로직 변경 없음.

3.983: 큐리 공식 입력 자연회복 보존 수정. 기존 formula.sequence-input preserveNaturalRegenActivity가 lastNaturalRegenBlockTime/nextHealthRegenAt만 복원해 스테미나 자연회복 기준 lastStaminaUse는 공식 입력 때 갱신된 채 남던 문제를 수정했다. 이제 옵션이 활성화된 공식 입력은 입력 전 lastStaminaUse까지 함께 보존/복원해 체력·스테미나 자연회복을 모두 중단시키지 않는다. 큐리 LMB/RMB의 기존 preserveNaturalRegenActivity:true 데이터를 그대로 재사용하며 캐릭터 ID 예외 없음.

3.982: 캐릭터 역할/거리 표기 정리. 큐리를 '성장형 근거리 컨트롤러' / ['성장형','컨트롤러']로 변경하고, 메라모나는 기존 역할군을 유지한 채 거리 표기를 중거리로 변경한다. 전투 수치/기능 변경 없음.

3.981: 제리 역할군 표기 정리. 3.0 제리 styleLabel을 '파워형 중거리 암살자'에서 '파워형 중거리 딜러'로 변경해 기존 tags ['파워형','딜러']와 일치시킨다. 전투 수치/기능 변경 없음.

3.980: 디버그 계정 탭에 계정+랭킹 동시 삭제 UI 추가. 3.979의 고아 랭킹 필터링은 채택하지 않고 3.978 기준으로 진행한다. AccountService.debugDeleteAccountAndRankings()는 디버그 권한 계정의 requesterAccountId와 삭제 대상 accountId를 새 관리자 API /admin/account/delete에 전달한다. 서버는 이 요청에서 대상 계정 파일과 rankings/characters.json의 동일 accountId 항목을 원자적으로 함께 제거해야 한다. 삭제 성공 시 CharacterRecordService 랭킹 캐시를 비우고, 현재 로그인 계정 자신을 삭제한 경우 로그아웃한다.

3.978: 설명 문구 수정. 라임 어린 슬라임 설명을 '주변 적에게서 도망 / 같은 단계끼리 합쳐짐'으로, 스야 은신 설명을 '최대 {stealthDurationSeconds}초 은신 및 재사용으로 해제'로 변경. 기능/수치/로직 변경 없음.

3.977: 어린 슬라임 투사체 후속 공격 회피의 예상 착탄점 보정. 기존 최대 사거리/targetPoint 끝점만 보던 projectileImpactPoint를 실제 outbound 충돌 규칙에 맞춰 현재 위치부터 남은 비행 구간의 최초 벽/엔티티 충돌점을 예측하도록 확장했다. 벽은 WorldGeometryService.raycastDistance와 실제 projectile wall padding/collisionPolicy를 사용하고, 엔티티는 실제 target relation/targetKinds/targetEntityOnly 조건을 거친 뒤 projectile hit radius+target radius 원 충돌의 최초 진입거리를 비교한다. 비관통 투사체가 플레이어나 벽에 먼저 닿아 조기 폭발하면 그 예상 충돌점을 projectile.impact 후속 범위의 중심으로 사용한다. clamp/stop/return 벽 동작은 impact 폭발점으로 취급하지 않는다. 캐릭터 ID 예외 없음.

3.976: 라임 어린 슬라임 투사체 회피/단계 속도 확장. SummonAIService.projectileThreat가 현재 투사체 충돌 궤적뿐 아니라 projectile.impact.attackIds 및 impact.sourceRelocate.onEndAttackIds로 연결된 후속 공격의 실제 준비된 range/delivery.area 범위를 예상 착탄점 기준으로 검사한다. 후속 범위가 어린 슬라임에 닿을 예정이면 착탄점 반대 방향으로 회피한다. ClusterSummonService stageStats/applyStage에 범용 stageSpeedPerStage를 추가해 라임 slime은 1단계 4.5, 2단계 4.25, 3단계 4.0, 4단계 3.75가 실제 entity.speed로 적용된다. 도주/투사체 회피/damageEscape는 별도 5.5 override를 제거하고 entity.speed를 사용하며, 합체 추적도 entity.speed를 우선 사용한다. 평상시 배회 2.5는 유지. 캐릭터 ID 예외 없음.

3.975: 라임 어린 슬라임 공격 범위 표시 제거. summon presentation의 attackRangePresentation을 제거해 어린 슬라임 주변 공격 사거리 원이 더 이상 표시되지 않는다. 실제 AI/도주/추종/합체/평타 이동 데이터는 변경하지 않는다.

3.974: 라임 어린 슬라임 라임 추종 안전 우회 경로 추가. ownerReturn 경로 계산 때만 적 주변 250을 임시 위험 구역으로 사용해 GridPathfindingService의 기존 dynamicObstacles 경로 탐색으로 우회한다. 우회 경로가 없으면 라임 쪽으로 강행하지 않고 기존 idleWander로 넘어간다. 이동 중 자기 detectionRange 250 안에 적이 들어오면 최우선 enemyAvoidance가 즉시 도주로 전환한다. 라임 주변 ownerThreatRange 250 위협 시 안전 위치 배회가 계속 우선. 캐릭터 ID 예외 없음.

3.973: 라임 어린 슬라임 감지 범위 조정. 자기 중심 적 감지 detectionRange 150→250, 라임 주변 위협 감지 ownerThreatRange 150→250. AI 우선순위/도주/라임 추종/합체/배회/이동 평타 동작은 그대로 유지.

3.972: 라임 어린 슬라임 AI 우선순위 재구성. 1) 자기 주변 적 회피, 2) 라임 추종/라임 주변 위협 시 안전 위치 배회, 3) 같은 단계 슬라임 합체, 4) 평상시 라임 주변 배회. 자기/라임 주변 감지 범위 150. 적 회피와 라임 추종 중 slime-auto 이동 평타를 주기적으로 병행. 적 대상 melee 공격 없음.

3.971: 라임 어린 슬라임 ownerReturn 경로에서 적 주변을 다시 이동 불가 영역으로 취급한다. GridPathfindingService의 기존 dynamicObstacles 범용 기능을 재사용해 ownerReturn 시 적 엔티티 반경+clearance를 장애물로 전달하며, 직선 경로와 A*/다익스트라 탐색 모두 해당 영역을 통과 가능한 경로로 선택하지 않는다. 자기 중심 detectionRange 150 적 회피 로직과 복귀용 slime-auto 평타 이동은 유지한다. 캐릭터 ID 예외 없음.

3.970: 라임 어린 슬라임 조정. 자기 중심 적 인식 범위를 350→150으로 변경했다. ownerReturn에는 기존 attack.lime.slime-auto를 다시 연결해 라임을 따라올 때 복귀 경로 waypoint를 향해 평타 이동을 사용하도록 복구했다. 이 attackId는 적 공격 추적용이 아니라 ownerReturn 이동 수단으로만 사용되며, 어린 슬라임의 적 대상 meleeAttackId는 계속 제거된 상태다.

3.969: 라임 어린 슬라임 적 장애물 처리 제거. ownerReturn 경로 계산에서 avoidEnemies/dynamicObstacles를 제거해 적이 라임 복귀 길목에 있어도 벽처럼 우회하지 않고 그대로 지나간다. ownerThreatWander도 제거해 라임 주변 적 유무는 배회/복귀 상태 선택에 영향을 주지 않는다. 어린 슬라임은 자기 detectionRange 350 안에 적이 들어온 경우에만 enemyAvoidance로 도망가며, 적이 감지 범위를 벗어나면 기존 idleWander 또는 ownerReturn으로 복귀한다. 캐릭터 ID 예외 없음.

3.968: 라임 어린 슬라임 도주/배회 수정. enemyAvoidance의 횡방향(lateral) 보정을 완전히 제거해 적 감지 중 이동 벡터가 항상 적 중심→슬라임 중심의 순수 반대 방향이 되도록 했다. 기존 lateral 성분이 엔티티 접촉 분리와 겹쳐 적 주위를 원형으로 타는 것처럼 보이던 현상을 제거한다. ownerThreatWander는 별도 speed 값을 사용하지 않고 moveSpeedRef:'idle-wander'로 ai.idleWander.moveSpeed를 참조해 평상시 라임 주변 배회 속도와 항상 동일하게 유지한다.

3.967: 라임 어린 슬라임 공격 행동 제거. enemyAvoidance 중 적이 meleeRange 안에 들어와도 meleeAttackId를 실행하지 않으며, 적 감지 시 이동은 계속 fleeEnemy로 처리한다. 적 인식/도주/투사체 회피/owner 위협 시 안전 위치 배회/ownerReturn은 유지한다. 캐릭터 ID 예외 없음.

3.966: 라임 어린 슬라임 enemyAvoidance 이동/공격 분리. 기존에는 적이 meleeRange 안에 들어오면 fleeEnemy 분기를 건너뛰어 이후 targetWander/추적 경로가 적 방향 이동을 다시 만들 수 있었다. 이제 enemyAvoidance가 활성화된 소환수는 적 감지 중 거리와 무관하게 항상 fleeEnemy 이동을 사용하고, meleeRange 안이면 기존 meleeAttackId 공격을 별도로 병행한다. 따라서 도망 방향은 항상 적 반대이며, 도망치는 중에도 사거리 안의 적에게 평타를 사용한다. 캐릭터 ID 예외 없음.

3.965: 라임 어린 슬라임 근접 평타 복구. 3.961 이후 enemyAvoidance 조기 반환이 melee 판정 이전에 실행되어 적이 실제 평타 사거리 안에 들어와도 공격 로직이 실행되지 않던 버그를 수정했다. SummonAIService.update에서 melee 판정을 먼저 수행하고, enemyAvoidance는 !inMelee일 때만 fleeEnemy로 분기한다. 따라서 적 인식 범위 안의 원거리 적은 추격하지 않고 도망가며, 적이 실제 단계별 meleeRange 안으로 들어온 경우 기존 slime-auto 평타를 사용한다. 캐릭터 ID 예외 없음.

3.964: 라임 주변 적 감지 시 외곽 배회 기준 수정. ownerThreatWander가 owner(라임)를 anchor로 사용해 배회 목표가 다시 안쪽으로 잡히던 문제를 수정했다. ownerThreat가 처음 감지된 시점의 어린 슬라임 현재 위치를 ownerThreatSafeAnchor로 저장하고, 위협이 유지되는 동안 해당 안전 앵커 주변에서만 배회한다. 자기 detectionRange 적 회피가 최우선이며, owner 위협이 사라질 때만 안전 앵커를 해제하고 ownerReturn을 허용한다.

3.963: 라임 어린 슬라임 AI 우선순위 조정. 자기 detectionRange 350 안 적 회피가 최우선이며, 자기 주변에는 적이 없더라도 owner 주변 ownerThreatRange 안에 적이 있으면 ownerReturn을 수행하지 않고 owner 외곽 safeOrbitMin~safeOrbitMax 범위에서 배회한다. 자기 주변 적 회피 > owner 주변 적 감지 시 외곽 배회 > ownerReturn 순서. 캐릭터 ID 예외 없음.

3.962: 라임 어린 슬라임 적 인식 기준 수정. SummonAIService.nearestEnemy에 범용 detectionOrigin:'self' + detectionRange 옵션을 추가해 소환수마다 자기 위치 중심의 독립 감지 반경을 사용할 수 있게 했다. 라임 slime은 detectionOrigin:'self', detectionRange:350을 사용하며 더 이상 ownerGuardRange 350으로 라임 주변 적을 공유 인식하지 않는다. ownerReturn distance 250 및 적 회피/동적 장애물 복귀 로직은 유지한다. 캐릭터 ID 예외 없음.

3.961: 라임 어린 슬라임 AI 단순화. 적 회피가 ownerReturn보다 우선하며, ownerGuardRange 350 안에 적이 있으면 배회/대피 지점 없이 매 프레임 적 현재 위치의 반대 방향으로 도망친다. 인식 적이 없을 때만 라임 복귀를 수행한다. ownerReturn의 attackId를 제거해 복귀 경로에서 평타를 사용하지 않는다. GridPathfindingService에 범용 dynamicObstacles 옵션을 추가해 라임 복귀 경로 계산 시 적 엔티티를 원형 동적 장애물로 취급하며, 직선 경로와 A*/다익스트라 셀 탐색 모두 적 몸체+소환수 반경+clearance를 피한다. 캐릭터 ID 예외 없음.

3.960: 라임 어린 슬라임 회피 AI 우선순위 재정리. ownerReturn을 최우선으로 두고, ownerReturn 조건이 아닐 때만 enemyAvoidance가 적의 현재 위치를 매 프레임 기준으로 반대 방향 이동을 계산한다. 고정 enemyAvoidAnchor를 제거하고, 적과 충분한 거리(avoidDistance)에 도달하면 그 현재 위치를 wander anchor로 삼아 배회한다. 적이 다시 가까워지면 wander를 즉시 해제하고 다시 반대 방향으로 도망친다. enemyAvoidance 중에는 melee 사거리 밖에서 공격 시도를 하지 않으며, 실제 melee 사거리 안에 들어온 경우에만 기존 공격 로직을 수행한다. 라임과의 거리 복귀가 1순위, 적 회피가 2순위. 캐릭터 ID 예외 없음.

3.959: 큐리/라임 조정. 큐리 Base Damage 400→200으로 변경하고 성장 피해를 200→600으로 맞췄으며 반격 폭발은 실제 200 유지하도록 ratio 0.5→1로 재보정했다. formula.sequence-input에 preserveNaturalRegenActivity 범용 옵션을 추가해 공식 입력 전후 lastNaturalRegenBlockTime/nextHealthRegenAt을 보존하며 큐리는 이를 사용한다. 큐브 입력 설명의 스테미나 0 표기를 유지/명시했다. 라임 enemyAvoidance는 owner 방향 보정으로 호를 그리던 동작을 제거하고 적 반대편에 생성한 지역 anchor 주변을 5.5 속도로 배회하도록 변경했다. projectileAvoidance는 단순 방향 내적 대신 현재 투사체 위치/속도와 합산 충돌반경을 이용해 미래 최근접 접근점이 실제 충돌 범위 안일 때만 위협으로 판정한다.

3.958: 라임 어린 슬라임 회피 AI 자연화. SummonAIService enemyAvoidance는 적 반대 직선만 따라가는 대신 엔티티별 시간 변화 횡방향 성분을 섞어 자연스럽게 곡선 회피한다. damageEscape는 현재 melee 교전 중인 대상이 ownerGuardRange 안에 있으면 발동하지 않으며, 라임 slime의 피격 이탈 속도는 별도 가속 없이 기본 5.5를 사용한다. 새 범용 projectileAvoidance 행동은 반경 내 적 투사체의 이동 벡터가 소환수 쪽으로 향하는 경우 진행방향에 수직으로 피하며 ownerReturn보다 우선해 소유자 주변 범위를 일시적으로 벗어날 수 있다. 라임 slime은 projectileAvoidance range 200을 사용한다. 캐릭터 ID 예외 없음.

3.957: 큐리 평타 밸런스 조정. Base Damage 100→400, LMB 연사 간격 450→900ms(연사속도 50% 감소). 3.944의 단계별 사거리 증가 150→450 패치를 롤백한 기존 150→300 구조를 기준으로 전체 사거리를 +50% 적용해 최종 225→450으로 변경했다. progressScale delivery.area도 동일 225→450을 사용한다. Base Damage 변경으로 반격 폭발까지 변하지 않도록 counter-explosion damageRatio를 2→0.5로 재보정해 기존 실제 피해 200을 유지한다.

3.956: 라임 어린 슬라임 AI/게이지 수정. SummonVisualPresentationService가 stageGauge의 실제 점유 높이를 공통 HUD 게이지 스택에 반영해 소환수 단계 게이지와 증강/기타 segmented gauge가 겹치지 않게 했다. SummonAIService에 데이터 기반 enemyAvoidance/damageEscape 동작을 확장했다. enemyAvoidance는 인식된 적을 추격하지 않고 공격 사거리 밖에서는 반대 방향으로 피하며, 실제 stage-scaled meleeRange 안에 들어온 적에게만 기존 melee 공격을 수행한다. damageEscape는 실제 damage-applied 이벤트의 source/impact를 기준으로 짧은 시간 빠르게 이탈하며, owner 근처에서는 owner 주변의 반대편 유효 지점으로 이동한다. 라임 slime은 ownerGuardRange 250→350, enemyAvoidance 활성, damageEscape 활성. 캐릭터 ID 예외 및 새 전투 모듈 없음.

3.955: 치유 회피 중첩 누락 수정 및 증강 회복 중첩 경로 정리. AugmentEffectModuleService의 resource.restore에 범용 perStack:true 처리를 추가해 amount/maxResourceRatio를 보유 장수만큼 배율 적용할 수 있게 했다. heal_dodge는 maxResourceRatio:.10 + perStack:true를 사용하므로 1/2/3장 = 최대 체력 10/20/30% 회복. 흡혈·버서커는 기존 value.multiply 단계가 이미 count를 반영하므로 perStack을 지정하지 않아 기존 중첩량이 이중 적용되지 않는다. 현재 공유 증강의 다른 resource.restore 사용처를 점검했으며 같은 누락은 치유 회피만 확인됐다.

3.954: 치유 회피를 현재 사양인 '저스트 회피 시 최대 체력 10% 회복'으로 복구하고 실제 회복 경로를 수정. AugmentEffectModuleService의 resource.restore가 health 회복에도 CombatStats healingMult를 다시 적용해 비율 회복량이 변형/0 처리될 수 있던 경로를 범용 applyHealingModifier 옵션으로 제어하게 했다. heal_dodge는 applyHealingModifier:false를 사용해 저스트 회피 성공 시 최대 체력의 정확히 10%를 회복한다. just-dodge 공통 이벤트/트리거 구조는 유지하고 캐릭터·증강 ID 예외 분기는 추가하지 않았다.

3.953: 공유 증강 치유 회피 수정. 현재 데이터가 과거 사양인 '저스트 회피 시 최대 체력 10% 회복'으로 남아 있어 기대 동작인 스테미나 회복이 발생하지 않던 원인을 수정했다. heal_dodge의 resource.restore를 stamina/maxResourceRatio:.20으로 변경하고 설명도 '저스트 회피 시 스테미나 20% 회복, 회피 거리 -15%'로 동기화했다. 기존 just-dodge GameEvents → AugmentEffectModuleService.runTrigger → resource.restore 공통 경로는 정상이며 별도 전용 로직은 추가하지 않았다.

3.952: 라임 분열/군집 슬라임 체력 구조 수정. 분열 비용 1000→1500. ClusterSummonService stageStats에 범용 stageHealthGrowth:'linear'을 추가해 단계 체력을 baseMaxHealth×stage로 계산할 수 있게 했고 라임은 900/1800/2700/3600을 사용한다. 합체 체력은 mergeHealthPolicy:'ratio'로 두 소환수의 합산 현재체력/합산 최대체력 비율을 다음 단계 최대체력에 적용해 절대 체력 합산으로 풀피가 되는 현상을 제거했다. reduceOwnerMaxHealthByMissing은 현재 적용 중인 maxHealth modifier 배율을 역산해 baseMaxHealth를 조정한 뒤 syncVitals하므로 탱크 등 최대체력 증강이 분열 직후 중복 적용되어 체력이 다시 증가하지 않는다. 캐릭터 ID 예외 없음.

3.951: 레비나 경유지 명령의 온라인 스테미나 불일치 수정. WaypointProjectileService.append가 쿨다운/목표점 없음/스테미나 부족으로 실제 명령을 실행하지 못한 경우 false를 반환하도록 교정하고, projectile.waypoint-path Ability 모듈은 이 반환값이 true일 때만 executed=true로 기록한다. releaseHold는 원격 재생에서 senderExecuted:false면 홀드 상태만 정리하고 경유지 추가/귀환을 재생하지 않는다. 따라서 로컬에서 스테미나 부족으로 실패한 경유지 입력이 성공 패킷처럼 상대 화면에서 창을 움직이지 않는다. 캐릭터 ID 예외 없음.

3.950: 라임 슬라임 합체/부활 완전 회복 정책 제거. 라임 summon의 mergeHealthPolicy:'full'을 제거해 합체 시 다시 두 슬라임 현재 체력을 합산하고, deathReplacement의 healthPolicy:'full'을 제거해 라임 부활 시 선택된 슬라임의 현재 체력을 승계한다. ClusterSummonService의 범용 정책 지원은 유지한다.

3.949: 레테 우편함 지원 적중 사운드 조정. delivery.projectile에 범용 supportHitSound:false 옵션을 추가해 ally/self 지원 적중 경로의 hit 사운드만 억제할 수 있게 했다. attack.lete.mailbox-mail에 해당 옵션을 지정해 아군/자기 적중은 무음, 적 적중의 일반 피해 사운드는 기존 유지. 캐릭터 ID 예외 없음.

3.948: 레테 RMB HOLD 자리잡기 미실행 수정. holdTrigger의 summon.spawn이 AttackModuleService에는 존재하지만 AbilityModuleService에는 핸들러가 없어 홀드 릴리스 시 모듈이 건너뛰어지던 원인을 수정했다. 기존 SummonDeployService.spawnFromAttack을 AbilityModuleService의 범용 summon.spawn 핸들러에서도 재사용해 입력/홀드 Trigger에서 활성 소환수 재배치와 체력 보존을 실행한다. 캐릭터 ID 예외 없음.

3.947: 스야 서리안개 은신의 근접 발각 판정 지연 추가. StealthModeService가 범용 detectDelay를 지원하고, 스야는 detectDelay:400을 사용해 은신 시작 후 0.4초 동안 근접 적 감지로 인한 은신 해제/빙결/후속 평타 가속이 발생하지 않는다. 0.4초 이후부터 기존 detectRange 80 판정이 활성화된다.

3.946: 라임 어린 슬라임 설명의 MOVE SPEED 표기를 '빠름'→'매우 빠름'으로 변경. 실제 이동속도 5.5는 유지한다.

3.945: 레테 평타 묶음 공격 딜레이 500ms→200ms, 라임 분열 스테미나 소모량 2000→1000.

3.944: 다수 밸런스/기능/버그 수정. 라임 어린 슬라임 ownerReturn.distance 150→250. 큐리 LMB 성장 범위를 단계당 기본범위의 +50%가 되도록 150→450(4단계)로 변경. 스야 은신 maxDuration 5000→4000ms. 레비나 모든 창 이동 탄속 +15%(LMB 11.52→13.248, RMB 16.8→19.32, 귀환 20→23) 및 평타/스킬 입력·경로 명령 딜레이를 300ms로 통일. 헤르쟝 대포 명령 탄당 피해 100→200(damageRatio .5→1), 명령 스테미나 300→400. 하츠하츠 LMB cd는 이미 400ms라 유지. 루뷰 LMB 비용 200→150, 탄속 28→32.2(+15%), RMB/귀환 탄속도 32.2로 평타와 통일. 프릴 RMB 청소 완료 구역/반격 피해 증가 35%→50%. 레테 RMB에 기존 tapHoldSplit/holdTrigger를 재사용해 500ms 홀드 시 이미 설치된 우편함을 현재 위치로 체력 보존 재배치하는 '자리잡기' 추가. 나남낭 maxHealth 1300→1500, 잘 자요 회복 missingResourceRatio .4→.6. 배치형 소환수는 저장 체력을 증강 적용 전 base max 기준으로 복원해 유리대포 -50%가 재소환마다 다시 현재체력에 곱해지던 문제를 수정: 공통 SummonDeployService.spawn에서 constant buffs/syncVitals로 최종 maxHealth를 먼저 확정한 뒤 stored health를 복원한다.

3.943: 라임 슬라임 체력 정책 변경. ClusterSummonService 합체는 summon spec의 mergeHealthPolicy를 범용으로 읽으며 'full'이면 다음 단계 최대 체력으로 완전 회복한다. deathReplacement는 healthPolicy를 범용으로 읽으며 'full'이면 선택된 슬라임 단계의 최대 체력으로 부활한다. 라임 slime에 mergeHealthPolicy:'full', deathReplacement에 healthPolicy:'full'을 지정했다. 캐릭터 ID 예외는 추가하지 않았다.

3.942: 라임 밸런스 조정. 어린 슬라임 기본 speed 4.25→5.5, meleeInterval 800→600ms, ownerReturn.distance 420→150, 기본 maxHealth 600→900. 라임 maxHealth 1500→1800, 뛰어오르기 cost 500→300, 평타 cost 250→150. 라임 평타 cd 500ms(0.5초)는 요청값과 기존값이 동일해 유지한다.

3.941: 어린 슬라임이 라임 주변에서 유휴 배회할 때의 이동속도를 1→2.5로 변경했다. idleWander의 near-anchor 전용 moveSpeed만 2.5로 조정하며, 적 추적/targetWander/라임 복귀는 기존 기본 speed 4.25를 유지한다.

3.940: 어린 슬라임 유휴 배회 속도 규칙 교정. 3.939에서 idleWander.moveSpeed:1 자체를 제거했던 변경을 되돌리고, 실제 원인이던 SummonAIService.wanderAround의 speedOverride 적용 범위를 수정했다. wander.moveSpeed는 이제 기본적으로 anchor 근처(설정된 배회 반경 안)에 있을 때만 적용되며, anchor에서 멀어 배회 위치로 복귀하는 동안에는 entity 기본 speed와 현재 이동속도 배율을 사용한다. 어린 슬라임은 라임 주변에서 실제로 맴돌 때만 속도 1, 멀리 떨어져 복귀할 때는 speed 4.25를 사용한다. targetWander는 moveSpeed를 지정하지 않으므로 기존 4.25 유지.

3.939: 어린 슬라임이 적을 인식하지 못한 모든 상황에서 idleWander.moveSpeed:1 강제값 때문에 이동속도가 1로 고정되던 문제를 수정했다. 라임 idleWander의 moveSpeed:1을 제거해 적이 없을 때도 본체 speed 4.25와 현재 이동속도 배율을 그대로 사용한다. targetWander/ownerReturn도 3.938에서 맞춘 동일 공통 속도 계산을 유지한다.

3.938: 어린 슬라임 이동속도 불일치 수정. 일반 추적은 entity.speed×CombatStats speedMult를 사용하지만 targetWander는 moveSpeed:4.25 + nearAnchor ignoreSpeedModifiers, ownerReturn은 speedOverride:spec.speed를 사용해 행동 상태마다 이동속도 보정이 달라지던 원인을 정리했다. SummonAIService.wanderAround에 기존 동작을 보존하는 ignoreSpeedModifiersNearAnchor 옵션을 범용 추가하고, 라임 targetWander는 false로 지정하며 moveSpeed 강제값을 제거해 본체 speed 4.25와 현재 이동속도 배율을 그대로 사용한다. ownerReturn에도 useBaseSpeed 옵션을 범용 추가하고 라임은 false로 지정해 복귀 역시 일반 추적과 동일한 이동속도 연산을 사용한다. idleWander moveSpeed:1은 의도대로 유지한다.

3.937: 큐리 툴팁 입력 표기를 사용 조건별로 분리했다. 집중력 키 표기를 LMB→LMB FAR로 변경하고, 기존 LMB/RMB NEAR 통합 큐브 행을 LMB NEAR와 RMB NEAR 두 행으로 분리했다. 두 큐브 행은 name:'큐브', costText:'스테미나 0', 설명 문구를 완전히 동일하게 유지한다. 실제 입력/스킬 동작은 변경하지 않는다.

3.936: 라임 설명 문구 조정. 소환수 ABILITY 설명을 '주변 적에게 몸통박치기 ({damage}) / 같은 단계끼리 합쳐짐'으로 변경하고 summonSpecs 설명이 실제 slimeAuto AttackSpec 피해를 참조할 수 있도록 범용 summon attack placeholder 해석을 추가했다. 라임 tooltipSkills는 사용자 지정 문구로 교체: 몸통박치기 1초 감속, 분열에 사망 시 가장 강한 슬라임으로 부활 추가, 뛰어오르기 키를 RMB/RMB로 변경하고 4단계 조건 문구 제거, 끈끈이 3초 감속/매초 피해 문구로 복원. 공격/detailAttack 참조는 현재 실제 AttackSpec(lmb/split/jump+jumpLand/counter+stickyTick)을 그대로 유지한다.

3.935: 큐리 최종 완성 점멸링을 500ms 일회성에서 최종 완성 후 상시 유지로 변경했다. formulaSequence completeFlashMode:'final-persistent'는 현재 단계가 maxStage 이상인 동안 공통 maxChargeFlash 링을 계속 렌더하며 별도 만료 타이머에 의존하지 않는다. 큐리 desc/툴팁 문구를 사용자 지정 문구로 정리하고 집어던지기 detailAttack의 잘못된 counterBurst 참조를 실제 counterExplosion으로 수정했다. 라임 툴팁의 1초/4단계/3초/매초 하드코딩을 제거하고 CharacterDescriptionService의 범용 statusSeconds/requiredSummonStage/fieldStatusSeconds/fieldIntervalSeconds 값으로 실제 AttackSpec·ability condition·field.area 데이터를 참조하도록 변경했다. 캐릭터 ID 분기는 추가하지 않았다.

3.934: 큐리 공식 단계별 0.5초 점멸링을 제거했다. FormulaSequenceService는 단계 완료 시마다 점멸 상태를 만들지 않고, completeFlashMode:'final-only' 데이터가 있는 경우 현재 progress가 maxStage에 도달한 최종 완성 시점에만 1회 complete-flash 상태를 생성한다. 큐리는 completeFlashMode:'final-only'를 사용하므로 CROSS/F2L/OLL 완료에서는 점멸링 없음, PLL까지 완전히 완성했을 때만 기존 표준 maxChargeFlashRadius 점멸링이 500ms 표시된다.

3.933: 큐리 호게이지/링 배치/완충 점멸/반격 폭발 미리보기 수정. 큐리 formula gauge의 임의 radius:30/lineWidth:3.5를 제거하고 공통 EntityRingLayoutService.chargeRadius + WIDTHS.gauge(3) 규격을 사용한다. EntityRingLayoutService.worldArcGaugeState가 formula-sequence-progress-ratio를 실제 WorldGauge와 동일하게 해석하도록 확장해 호게이지가 보이는 동안 상태/반격 활성 링이 바깥 슬롯으로 정상 밀려난다. FormulaSequenceService는 각 공식 단계 완성 시 최소 500ms의 범용 complete-flash 상태를 기록하고 WorldGauge gauge.arc는 다음 단계 진행도가 0으로 초기화돼도 그 500ms 동안 공통 maxChargeFlashRadius에 점멸링만 표시한다. PLL 완성 후 호게이지 100%는 유지하지만 점멸링은 500ms 후 사라진다. 반격 target-point 투사체 미리보기는 projectile.impact.attackIds의 후속 delivery.area를 예상 탄착점에 AttackPreviewAreaService로 재사용해 최초 투사체 경로와 counter-explosion 실제 원형 폭발 반경을 동시에 표시한다.

3.932: 큐리 반격을 6갈래 특수 투사체 구조에서 원형 폭발 피해 구조로 단순화했다. 최초 투척탄은 일반 투사체이며 damageRatio:0 / damageOnTravel:false로 직격 피해를 제거한다. 적/지정점/벽/경계/사거리 탄착 시 projectile.impact로 attack.quri.counter-explosion을 실행하고, 해당 후속 공격은 delivery.area circle 피해 200(damageRatio:2, 큐리 Base Damage 100)을 1회 적용한다. 기존 counter-burst 6발 특수투사체, delayed-projectile-volley, hit.once-per-execution, 고정 6방향 미리보기는 제거했다. 반격 미리보기는 최초 투척 일반 투사체 경로만 표시한다.

3.931: 큐리 반격 후속 6갈래 특수 투사체가 같은 대상에게 여러 갈래 겹침으로 중복 피해를 주던 문제를 수정했다. attack.quri.counter-burst에 기존 범용 hit.once-per-execution 모듈을 추가해 하나의 burst 실행에서 동일 대상은 최초 1회만 피해를 받는다. 6발 자체는 그대로 생성되며 서로 다른 대상은 각각 정상 타격 가능하다. 새 시스템은 추가하지 않고 클레아 등 다중 투사체가 이미 사용하는 공통 중복 적중 방지 경로를 재사용한다.

3.930: 3.929의 delayed-projectile-volley 확장에서 AttackModuleService.deliver() 내부에 존재하지 않는 execution 변수를 참조하던 ReferenceError를 수정해 volley?.execution?.projectileImpactPoint를 사용한다. AttackPreviewService는 previewProjectilePaths:true인 target-point 투사체에 options.targetPoint가 전달되면 실제 지정지점까지의 투사체 경로를 계산하고, projectile.impact.attackIds로 연결된 AttackSpec 중 originMode:'impact-point' delayed-projectile-volley를 읽어 착탄 예상점에서 후속 투사체 경로까지 preview.parts로 자동 생성한다. absolute angleMode는 실제와 동일하게 월드 절대각을 사용한다. CounterModuleService는 aim-point 반격 미리보기 생성 시 windup.targetPoint를 AttackPreviewService options로 전달한다. 큐리 반격의 hideAttackShape/targetPointArea 원 미리보기는 제거해 최초 일반 투사체 선 + 착탄점 고정 6방향 특수 투사체 선이 표시된다. 새 전용 미리보기 모듈은 추가하지 않고 기존 AttackPreviewService target-point projectile 경로를 범용 확장했다.

3.929: 큐리 반격/디버그/호게이지 수정. ProjectileImpactService의 linked attack 실행이 delivery.area만 직접 처리하고 그 외 delivery는 AttackModuleService.afterAttack만 호출하던 공통 누락을 수정해, area가 아닌 linked attack은 기존 AttackModuleService.deliver→afterAttack 전체 경로를 실행한다. 따라서 attack.quri.counter-burst의 delayed-projectile-volley가 실제 착탄점에서 6발 생성된다. 큐리 최초 투척탄은 damageRatio 0/damageOnTravel:false/diamond 표현을 제거하고 damageRatio 1의 일반 투사체로 변경해 직접 적중 피해를 주며, 적중 후 동일 projectile.impact로 6갈래 후속탄을 생성한다. 후속 6발만 diamond 특수투사체를 유지한다. formulaSequence에 범용 state.progress progressModule을 canonical 데이터로 추가하고 FormulaSequenceConfigService가 이 모듈에서 progressStateKey/maxStage를 파생하도록 해 기존 DebugGaugeControlService의 재귀 자동 탐색에 큐리 단계가 노출된다. WorldGauge valueRef에 범용 formula-sequence-progress-ratio를 추가하고 큐리 gauge.arc가 현재 단계 공식의 입력 글자 수/전체 글자 수를 읽어 단계별 호게이지를 충전한다. 단계 완료 시 다음 공식에서 0부터 다시 차며 PLL 완성 후에는 100%를 유지한다.

3.928: 큐리 집중력 비용을 250→150으로 낮췄다. 공식 단계가 4단계가 된 뒤에도 progressScale.valueRange가 0→5로 남아 있던 값을 0→4로 맞춰 PLL 완성 시 성장치가 최대치에 도달하게 했다. 집중력 넉백 거리는 progressScale.moduleValues로 55→110까지 단계에 따라 선형 증가한다. 집어던지기는 지정지점으로 특수 투사체 1발을 던지고 적/벽/경계/사거리/지정점 탄착 시 projectile.impact로 6갈래 특수 투사체를 생성한다. 기존 delayed-projectile-volley에 범용 originMode:'impact-point'와 angleMode:'absolute'를 확장해 6발이 착탄점에서 생성되고 투척 방향과 무관하게 월드 고정 0/60/120/180/240/300도 방향으로 퍼진다.

3.927: 큐리 공식 단계 상승(CROSS/F2L/OLL/PLL 완성)마다 기존 effect.spawn areaCircle 펄스를 1회 생성한다. 새 이펙트 렌더러/전용 FX 경로를 만들지 않고 FormulaSequenceService.input()의 completed 결과를 formula.sequence-input Ability handler가 character.formulaSequence.completeEffect 데이터로 받아 기존 AbilityModuleService 'effect.spawn' handler에 그대로 위임한다. EffectSpec은 엔소냐 RMB 발동 펄스와 동일한 range/r 72, fillAlpha .02, strokeAlpha .44, lineWidth 1.5, duration 220, below-entities를 사용하고 색상만 character로 두어 큐리 #8b6cd9를 사용한다. 기존 effect-spawn 온라인 프레젠테이션 동기화도 동일 경로를 사용한다.

3.926: 큐리 PLL 완성 후 공식 입력 범위 자체를 제거한다. FormulaSequenceService.input()은 maxStage 완성을 마우스 거리/회피 판정보다 먼저 확인하고 handled:false로 일반 Ability 체인에 넘기므로, 완성 후에는 클릭 위치가 200px 안/밖인지 전혀 검사하지 않는다. worldGauge의 range.circle도 character.formulaSequence.activationRange를 참조하는 공식 범위일 때 progress가 maxStage 이상이면 렌더하지 않아 점선 원이 사라진다. 따라서 PLL 완성 이후 LMB는 위치와 무관하게 일반 집중력 경로로 넘어간다.

3.925: 큐리 공식 입력 가능 범위를 130→200으로 확대했다. formulaSequence.activationRange 단일 값을 사용하므로 점선 표시 범위와 실제 L/R 공식 입력 판정 범위가 함께 200으로 증가한다.

3.924: 큐리 공식 입력 가능 범위를 105→130으로 확대했다. formulaSequence.activationRange 단일 값을 사용하므로 점선 표시 범위와 실제 L/R 공식 입력 판정 범위가 함께 130으로 증가한다.

3.923: 큐리 CROSS/F2L/OLL/PLL 단계별 공식 후보 3개씩을 사용자 지정 값으로 교체했다. 입력 판정, 글자 단위 흰색 강조, 4단계 구조는 유지한다.

3.922: 큐리 공식 단계를 5→4로 줄이고 단계명을 CROSS/F2L/OLL/PLL로 변경했다. 각 단계 공식 길이를 늘렸으며 모든 공식은 계속 R/RL/RR 중 하나로 시작한다. FormulaSequenceService tokenProgress()를 글자 단위 진행 정보까지 반환하도록 확장해 LR/RL/RR/LL 같은 복합 토큰도 현재 입력해야 하는 정확한 한 글자만 흰색으로 표시한다. WorldGaugeModuleService의 formula.sequence-text 렌더는 토큰 전체 색칠이 아니라 각 토큰 내부 문자를 분할 렌더링하며 현재 문자만 activeColor(#fff)를 사용한다. 기존 STAGE n 표시는 제거하고 character.formulaSequence.stageLabels의 CROSS/F2L/OLL/PLL을 사용한다.

3.921: 큐리 공식 입력 불가 원인을 수정했다. RMB ability가 attackId:null이라 AbilityService.activate()가 모듈 실행 전에 종료되던 문제를 해결하기 위해 RMB에도 기존 attack.quri.lmb를 context용 AttackSpec으로 연결하되 action.attack 모듈은 두지 않아 공격은 발생하지 않는다. formula.sequence-input은 공식 입력을 실제 처리했을 때 next()를 호출하지 않고 모듈 체인을 소비해 LMB가 원 안에서 공식 입력 후 집중력까지 같이 발동하지 않게 했다. 반대로 원 밖이면 next()로 넘어가 LMB 집중력만 실행된다. formula.sequence-input에 범용 blockWhileDodging 옵션을 추가하고 큐리 LMB/RMB에 적용해 source.dodgeUntil>now 동안 마우스 위치와 무관하게 입력을 소비하되 공식 진행/공격은 실행하지 않는다. 따라서 회피 도중 커서가 순간적으로 공식 범위를 벗어나도 집중력이 오발되지 않는다.

3.920: 큐리 공식 입력 시작 상태를 완전히 제거했다. 공식 입력 여부는 매 클릭 시 마우스가 formulaSequence.activationRange 안/밖인지로만 판정하며, 점선 원 안의 LMB/RMB는 즉시 L/R 입력으로 처리되고 원 밖 LMB만 집중력을 발동한다. FormulaSequenceService의 started/waitingForStart/RMB START 분기를 삭제해 공식은 항상 즉시 입력 가능하다. 모든 단계별 공식 15개는 첫 토큰이 반드시 R로 시작하도록 변경했으며 첫 토큰은 R/RL/RR 중 하나다. 공식 표시도 시작 상태와 무관하게 현재 진행도와 다음 입력 토큰을 항상 계산해 현재 입력해야 하는 토큰을 흰색으로 표시한다.

3.919: 큐리 공식 입력 UX 수정. 별도 공식 모드 전환은 만들지 않고 매 클릭마다 마우스가 activationRange 안/밖인지로 행동을 결정한다. 원 안 LMB/RMB는 공식 입력, 원 밖 LMB는 집중력, 원 밖 RMB는 아무 동작 없음. 공식 상태는 월드 렌더 시 미리 생성되어 시작 전부터 항상 표시되며 각 새 단계 공식도 즉시 표시된다. 공식 입력 시작은 반드시 원 안 RMB 1회로 하며 이 시작 클릭은 공식 글자 입력으로 소비하지 않는다. 시작 전 원 안 LMB는 공격 대신 공식 영역 입력으로 처리되지만 진행시키지 않는다. WorldGaugeModuleService에 범용 range.circle 표시를 추가해 큐리 주변 activationRange 105를 소유자 화면에 점선 원으로 표시한다. formula.sequence-text는 토큰별로 렌더하며 현재 입력해야 할 토큰만 흰색, 나머지는 캐릭터 지정 보라색으로 표시한다.

3.918: 신규 캐릭터 큐리 구현. 체력 1200/이속 4/#8b6cd9/성장형 근거리 딜러. 큐브 도형/이미지/전용 큐브 렌더는 만들지 않고 공식 문자열과 5단계 게이지만 표시한다. LMB 집중력은 마우스가 본체 근접 입력 반경 밖일 때 자신 중심 원형 범위로 적을 밀쳐내며 피해를 주고, quri-cube-stage 0~5에 따라 피해 100→300/범위 150→300으로 증가한다. 본체 근접 반경 안에서는 LMB/RMB가 각각 L/R 공식 입력으로 전환된다. 새 범용 FormulaSequenceService + formula.sequence-input Ability 모듈은 캐릭터 ID를 모르며 character.formulaSequence의 stateKey/activationRange/formulas/maxStage/progressStateKey 데이터만 사용해 단계별 3개 공식 중 하나 선택, 입력 비교, 오입력 시 현재 단계 입력 진행만 초기화, 완성 시 ProgressStateService 단계 상승을 처리한다. WorldGaugeModuleService에는 formula.sequence-text 문자열 표시만 추가했다. 반격 집어던지기는 실제 폭발/폭발 이펙트 없이 기존 delayed-projectile-volley angleOffsets로 6방향 특수 마름모 투사체를 동시에 발사하고 적중 시 소폭 넉백한다.

3.917: 어린 슬라임 기본 최대 체력을 900→600으로 변경했다. 기존 stageHealthMultiplier:2 규칙은 유지되어 단계별 최대 체력은 600/1200/2400/4800이 된다.

3.916: 어린 슬라임의 라임 주변 idleWander에 moveSpeed:1을 명시해 주변 배회 속도를 1로 낮췄다. 충전 반격은 최대 소지량 증가뿐 아니라 기존 의도대로 획득량도 함께 증가하도록 복구했다. 스택당 acquireBonusPerStack:1과 capacityBonusPerStack:1을 동시에 적용하며 CounterStockService.acquireAmount()가 기본 획득 1 + 활성 스택 수를 계산하고 acquire()가 해당 개수만큼 추가하되 capacity를 넘지 않게 제한한다. 따라서 충전 반격 1개면 한 번에 2개 획득/최대 2개, 2개면 한 번에 3개 획득/최대 3개가 된다. 설명에도 두 효과를 모두 반영했다.

3.915: 충전 반격 저장 규칙을 최대 소지량 방식으로 변경했다. charged_counter는 더 이상 스택당 획득량을 늘리지 않고 capacityBonusPerStack:1을 제공한다. CounterStockService.capacity()가 기본 1 + 활성 충전 반격 스택 수를 계산하며 acquire()는 저스트 회피/패리 1회당 반격기 1개만 추가하고 capacity를 넘지 않게 제한한다. 따라서 충전 반격 1개 보유 시 최대 2개, 2개 보유 시 최대 3개까지 저장된다. 새 반격기 획득 시 전체 활성 시간 초기화와 normal/parry 종류 기록은 유지한다. 설명도 최대 소지량 증가 규칙으로 갱신했다.

3.914: 라임 deathReplacement 시 기존 MovementPresentationService를 재사용해 처치된 라임 위치(defeatedPoint)에서 새로 조종하게 되는 가장 강한 슬라임 위치(revivePoint)까지 한 번의 공통 dash-line 이동기 선을 생성한다. 라임 LMB와 동일한 색/두께/알파/지속시간(193,250,177 / width 6 / alpha .4 / 167ms)을 사용하며, 별도 라임 전용 렌더 경로는 만들지 않는다.

3.913: 어린 슬라임 합체 체력 계산 수정. ClusterSummonService.applyStage가 단계 상승 시 maxHealth만 갱신하고 baseMaxHealth를 이전 단계 값으로 남겨 AugmentService.syncVitals 등 공통 활력 동기화가 이후 이전 단계 최대체력을 기준으로 현재 체력을 재환산하던 문제를 수정했다. 단계 적용 시 baseMaxHealth와 maxHealth를 동일한 새 단계 최대체력으로 함께 갱신하며, mergePair는 합체 직전 두 슬라임의 실제 현재 체력을 먼저 합산해 다음 단계 현재 체력으로 사용한다. 합체 직후 healthTrailHealth도 새 현재 체력과 정확히 동일하게 맞춰 잔상 체력바가 이전 슬라임 값으로 남지 않는다.

3.912: 라임/군집 슬라임 후속 수정. 어린 슬라임 ownerReturn 몸통박치기가 별도 nextOwnerReturnAttackAt/450ms 타이머를 사용해 실제 meleeInterval보다 빠르게 반복되던 구조를 제거하고 일반 적 공격과 동일한 nextMeleeAt + attackInterval(meleeInterval) 쿨다운을 공유한다. 복귀 시에도 GridPathfinding waypoint를 대상으로 실제 meleeAttackId AttackService 실행을 사용하며 공격 사이에는 경로 이동만 수행한다. 슬라임 ownerGuardRange를 350→250으로 줄여 표시 범위와 실제 적 탐색 범위를 함께 축소했다. 치환 부활 직전의 치명 피해량을 replacement 이후 부활 체력과 다시 비교해 actual=0으로 덮어쓰던 HealthService 오류를 수정해 K.O. 프레젠테이션이 정상 실행된다. replacement-state에 원래 캐릭터 baseMaxHealth 복구값을 저장하고 EntityCharacterDeathResetService가 이후 실제 사망 시 이를 원복한 뒤 상태를 지우므로, 치환 부활 후 다시 죽고 정상 리스폰하면 라임 기본 최대 체력으로 살아난다.

3.911: 3.908의 프로필/레코드 단일화 과정에서 GAME_DATA.characters 선언 순서가 그대로 노출되며 기존 캐릭터 표시 순서가 바뀐 문제를 수정했다. 별도 미구현 카탈로그를 되살리지 않고 GAME_DATA.characters 자체의 top-level 선언 순서를 3.907까지 사용하던 기존 표시 순서로 재배열했다. 따라서 ProfileCharacterService(Object.values), CharacterCardDataService, 캐릭터 선택, 프로필, 레코드/전적, 개발자 캐릭터 선택 등 모든 파생 목록이 동일한 기존 순서를 자동 사용한다. 순서: shubi→ruvu→miaruky→mainmad→mehugu→lian→tau→veleu→elin→nsonya→maisil→erapabi→reika→shairaz→phase→kan→cherity→konyeong→herjang→hatsuhats→prill→dazbin→yui→peluna→sherina→sya→runef→roon→intu→meramona→tadta→nanamnang→raise→levina→ki→sor→jerry→ruli→lete→clea→shello→tinya→lime.

3.910: 라임/군집 슬라임 후속 수정. 3.908 정리 과정에서 미구현 카드 전용 selector 앞부분이 제거되어 일반 카드 아이콘/이름/스탯에 opacity:.18이 적용되던 CSS 오류를 제거했다. 어린 슬라임 평타를 effectsOnly+숨김 body-contact 경로에서 라임 LMB와 동일한 delivery.area rect + movement.move 구조/동일 dash-line EffectSpec으로 교체하고, stageAttackScaling이 delivery.area range까지 함께 스케일하도록 수정해 실제 피해/이동/표시가 같은 거리값을 사용한다. ownerReturn은 라임 본체를 직선 조준해 평타를 쓰지 않고 GridPathfinding waypoint 방향으로만 몸통박치기를 사용한다. 라임 사망 후 흡수 대기는 1000→500ms로 변경하되 대기 중 슬라임끼리 일반 합체는 허용하며, 500ms 이후에는 남은 슬라임이 GridPathfinding으로 현재 조종 라임에게 접근해 거의 겹친 시점에만 제거·현재 체력만큼 회복한다. mergePair는 두 기존 현재 체력 합을 다음 단계 현재 체력으로 유지하며 풀피 리셋하지 않는다. action.attack에 범용 captureTargetPoint 옵션을 추가해 뛰어오르기 선택 시 현재 마우스 위치를 실제 prepared attack range 안으로 clamp하여 movement.move direction:'target-point'로 이동한다. stickyTick 기본 피해를 100으로 변경하고 projectile impact/delegated field attack도 ProgressScaledAttackService.resolve를 먼저 거쳐 부활 단계별 반격 피해 강화가 적용된다. replacementAttackScaling은 피해 단계당 +50%, 이동거리/이동사거리 단계당 +25%로 분리했다.

3.909: 라임/군집 슬라임 후속 수정. 적 주변 행동은 매 프레임 회전 목표를 만드는 targetOrbit을 제거하고 라임 주변 idleWander와 동일한 불규칙 목표점+GridPathfinding 구조를 범용 wanderAround()로 공유해 적 주변에서도 자연스럽게 배회한다. strictOwnerGuardRange 옵션을 추가해 슬라임은 적 중심이 ownerGuardRange 350 안에 있을 때만 탐색/공격한다. 어린 슬라임 몸통박치기 presentation을 라임 LMB와 동일한 dash-line EffectSpec(color 193,250,177/width 6/alpha .4/duration 167/resolveOnFinish)으로 통일하며 단계별 차이는 기존 이동거리/피해 수치만 적용한다. 라임 사망 치환은 EntityCharacterDeathResetService+EntityRespawnService를 재사용해 캐릭터 색/반경/속도/baseDamage/입력·이동·상태를 정상 라임 런타임으로 복구하고 희생된 슬라임 단계만 replacement-state에 저장한다. 남은 슬라임 흡수는 즉시 하지 않고 1000ms 대기 후 시작하며 대기 중 일반 합체를 억제한다. replacementAttackScaling 데이터와 ProgressScaledAttackService의 범용 runtime state scaling을 추가해 부활 단계 1/2/3/4에 따라 LMB 피해·이동거리와 뛰어오르기 이동거리/착지 피해가 1/1.5/2/2.5배가 되고, 반격 sticky-field/sticky-tick은 피해만 같은 배율로 증가한다.

3.908: 프로필/레코드의 미구현 캐릭터 선등록 예약 구조를 제거했다. 별도 PROFILE_CHARACTERS 카탈로그를 삭제하고 ProfileCharacterService는 GAME_DATA.characters만 단일 기준으로 사용한다. CharacterCardDataService의 미구현 fallback 카드/implemented 플래그/준비 중 배지와 선택 차단 경로, 관련 CSS, 구현 캐릭터 필터링 경로를 제거했다. 개발자 레코드/전적 선택, 프로필 메인 캐릭터 선택, 통계/랭킹, 캐릭터 카드 모두 실제 GAME_DATA.characters에 구현된 캐릭터만 자동 사용한다. 현재 43명은 전부 실제 구현 데이터에 존재하므로 사용자-visible 캐릭터 수는 변하지 않으며, 앞으로 미구현 ID를 프로필/레코드에 따로 선등록하는 경로는 존재하지 않는다.

3.907: 라임 후속 조정. 어린 슬라임 평타에 일반 이동기 dash-line 이펙트를 복구하고 실제 적 충돌 시 movement collision에서 즉시 멈추도록 passEnemies:false로 변경했다. 슬라임 AI는 엘린과 같은 SummonAIService/GridPathfindingService를 계속 사용하되 3.906의 직접 벡터 ownerReturn/orbit 이동을 제거하고 두 특수 행동도 GridPathfindingService 기반 waypoint로 통합해 벽 대응과 추적 품질을 엘린 경로와 맞췄다. summon stageAttackScaling 데이터와 SummonAIService.resolveStageAttack을 범용 추가해 단계당 공격 사거리/몸통박치기 이동거리 +25%를 적용하고, 기존 ClusterSummonService stageDamageMultiplier 2배는 그대로 사용해 피해 100/200/400/800을 유지한다. attackRangePresentation은 같은 최종 meleeRange를 읽는다. 뛰어오르기는 passWalls:true로 벽을 관통한다. 라임 사망 치환 시 가장 강한 슬라임을 조종 대상으로 삼은 뒤 남은 모든 살아있는 슬라임을 흡수해 각 슬라임의 현재 체력만큼 순차 회복하고 해당 슬라임들을 제거한다.

3.906: 라임 군집 슬라임 AI/부활 후속 조정. ClusterSummonService에 동일 owner/summonKey/단계의 합체 가능 파트너를 최우선 목표로 선택하는 merge-pursuit를 추가해 접촉 전부터 서로 찾아가며, 합체 가능 파트너가 있으면 적 추적/owner 복귀보다 우선한다. SummonAIService에는 범용 targetOrbit과 ownerReturnAttack 설정을 추가했다. 슬라임은 적을 공격할 때 원래 이속 4.25로 목표 주변을 계속 공전하며 몸통박치기하고, ownerReturnDistance를 넘으면 같은 평타를 라임 방향으로 사용하며 복귀한다. slime-auto는 movement body-contact 공격으로 변경했다. 라임 적 인식 반경은 500→350(-30%)이며 ownerRangePresentation도 같은 값을 읽는다. 슬라임 공격 사거리 95를 attackRangePresentation으로 표시한다. deathReplacement에 setStateOnReplace를 추가해 어린 슬라임으로 부활한 뒤 RMB는 4단계 존재 여부와 무관하게 뛰어오르기로 고정된다. 부활 치환은 실제 라운드 사망을 막되 원래 처치 위치의 K.O. 프레젠테이션만 별도로 재생해 처치 이펙트가 사라지지 않는다.

3.905: 라임 후속 조정. 끈끈이 착탄 넉백 방향을 away-from-source에서 기존 범용 away-from-impact로 변경해 라임 본체가 아니라 실제 착탄/범위 중심에서 바깥쪽으로 밀어낸다. 어린 슬라임은 엘린 수호 유령과 같은 ownerGuardRange 500 제한으로 라임 주변 500 안의 적만 추적/공격하며 해당 범위를 ownerRangePresentation으로 표시한다. 유휴 맴돌기에는 SummonAIService idleWander의 범용 moveSpeed 옵션을 추가해 슬라임만 2 이속으로 맴돌고 적 추적 시 원래 4.25를 사용한다. 단계별 색상 팔레트를 presentation.stageColors로 추가해 1→4단계로 갈수록 점점 진해진다. 슬라임 단계 게이지는 본체 회전/스퀴시 transform 안의 body 렌더에서 제거하고 월드 좌표 range 렌더로 옮겨 항상 수평으로 표시한다. 뛰어오르기는 movement.move presentation:false로 경로 이펙트를 숨기고 이동 동안 공통 evasionInvulnerable 버프를 부여한다.

3.904: 라임 어린 슬라임 소환의 실제 런타임 예외를 수정했다. ClusterSummonService는 Object.freeze된 객체인데 `counter:0`을 두고 `++this.counter`로 ID 시퀀스를 갱신해 첫 소환 시 TypeError가 발생하고 있었다. 가변 시퀀스를 별도 ClusterSummonRuntime 객체로 분리해 frozen 서비스 정의는 유지하면서 복수 슬라임 ID를 정상 생성한다. 끈끈이 착탄용 attack.lime.sticky-field는 effectsOnly를 해제하고 damageRatio 1로 변경해 라임 Base Damage 100 기준 착탄 반경 150에 100 피해와 기존 넉백을 동시에 1회 적용한다. 장판의 진입 즉시 슬로우/첫 피해 1초 지연 규칙과 이후 틱 피해는 유지한다.

3.903: 라임 3차 후속 수정. 분열 소환 실패의 실행 경로를 정리해 summon.cluster-spawn을 afterAttack 후처리에서 제거하고 AttackModuleService.deliver의 정식 전달 모듈로 승격했다. 분열 AttackSpec 실행이 성공하면 같은 AttackExecution 안에서 군집 소환을 즉시 생성하며, 생성 성공 뒤에만 잃은 체력만큼 최대 체력을 소모한다. 군집 소환은 단일 SummonDeployService stateKey 경로를 사용하지 않는다. 라임 LMB 이동 이펙트는 movement.move presentation에 범용 resolveOnFinish 옵션을 추가해 이동 시작 때 예상 최대거리 선을 그리지 않고 실제 이동 종료 좌표까지의 dash-line을 종료 순간 생성하므로 적 충돌 지점과 시각 끝점이 정확히 같다. 끈끈이 착탄 공격은 0피해 원형 delivery.area + 일반 넉백을 즉시 적용하고 같은 위치에 field.area를 생성한다. 장판 triggerOnEnter:false를 사용해 진입 즉시 3초 슬로우만 부여하고 첫 피해는 1초 뒤, 이후 1초마다 적용한다.

3.902: 라임 2차 후속 수정. 군집 슬라임에 단일 SummonDeployService용 summonStateKey를 억지로 부여했던 호환 경로를 제거해 단일 소환수 파괴/상태 수명주기가 군집 슬라임을 잘못 처리하지 않게 했다. ClusterSummonService가 복수 슬라임의 생성/사망/합체/네트워크를 독립 관리하며, 슬라임 AI는 엘린 유령과 동일한 chase-melee ownerGuardRange 500 + idle wander/pathfinding 설정을 재사용해 라임 주변을 따라다니다 주변 적을 추적한다. 라임 LMB delivery.area 자동 직사각형 FX는 제거하고 movement.move의 기존 collision-aware dash-line presentation을 사용해 적에게 막힌 실제 이동거리까지만 경로 이펙트가 표시된다. 끈끈이 반격은 선딜 중 projectile attack-shape 미리보기를 없애고 counter.execute의 범용 targetPointArea preview로 착탄 원만 표시한다. 본체 투사체는 collisionTargets:false + walls/targets pierce로 이동 중 어떤 대상에도 적중하지 않으며 지정지점에 도달한 뒤 projectile.impact가 별도 effectsOnly attack.lime.sticky-field를 실행해 기존 field.area 경로로 슬로우 지대를 확실히 생성한다.

3.901: 라임 1차 후속 수정. LMB 몸통박치기는 공격 판정 wallPolicy:'ignore' 및 이동 collision passWalls:true/passEnemies:false로 변경해 벽은 통과하지만 적을 관통하지 않는다. RMB 분열/뛰어오르기 선택은 전용 summon.cluster-select Ability handler 대신 기존 action.attack alternate/fallback 구조로 통합하고, 범용 TriggerCondition `summon.cluster-stage`를 추가했다. 4단계 슬라임이 있으면 뛰어오르기, 없으면 resource.not-full(health)일 때만 분열 가능하므로 최대 체력에서는 분열을 사용할 수 없다. 반격 target-point 투사체가 counter.execute에서 execution.targetPoint를 받지 못해 발사 자체가 생략되던 원인을 수정했다. counter.execute에 범용 targetPointMode:'aim-point'를 추가해 0.3초 선딜 동안 최신 조준 지점을 추적하고 완료 시 AttackService.execute targetPoint로 전달하며, 라임 끈끈이는 사거리 650 안의 지정지점에 실제 착탄한다. 라임 본체 아래에는 WorldGaugeModuleService의 새 범용 valueRef `summon.cluster-max-stage`로 최고 단계 슬라임을 4칸 segmented gauge에 표시한다.

3.900: 신규 캐릭터 라임을 구현했다. 체력 1500/이속 4/#c1fab1/성장형 근거리 탱커. LMB 몸통박치기는 전방 돌진 범위공격+1초 감속, RMB는 현재 잃은 체력만큼 최대 체력을 소모해 어린 슬라임을 생성하고 4단계 슬라임이 존재하면 뛰어오르기 공격으로 전환한다. 어린 슬라임은 체력 900/이속 4.25의 다중 소환수로 라임 주변을 따라다니며 자동공격하고 같은 단계끼리 접촉하면 최대 4단계까지 합체하며 단계마다 최대체력/기본피해가 2배가 된다. 라임 사망 시 가장 높은 단계·현재체력 순의 슬라임을 소모해 그 위치/체력을 이어받아 생존한다. 기존 단일 stateKey 소환 구조로 복수 동종 소환수 합체를 표현할 수 없어 캐릭터 ID 비의존 ClusterSummonService와 summon.cluster-select/summon.cluster-spawn 범용 모듈을 추가하고, duel-state.clusterSummons로 다중 소환수 위치/체력/단계/전투상태를 동기화한다. 반격 끈끈이는 착탄 지점 field.area에 3초 감속을 즉시 갱신하고 1초마다 피해를 준다.

3.899: 티냐 범위 증폭의 마법진 생성 최대 크기 연동. circleFormation.circle에 범용 maxRadiusScaleAttackKey를 추가하고 CircleFormationService.maxRadius()가 지정 AttackSpec의 실제 rangeBonus를 읽어 생성/배치 최대 반지름에 적용한다. 티냐는 lmb 발동 AttackSpec을 참조하므로 범위 증폭 +20% 보유 시 마법진 최대 반지름이 240→288로 증가하며 최소 반지름 68은 유지된다. 확대된 실제 원 크기를 그대로 저장하므로 이후 포함/연결/교차/증폭 관계와 발동 판정/시각도 같은 원 geometry를 사용한다. 캐릭터 ID 예외는 추가하지 않았다.

3.895: 훈련장 근거리/원거리 봇의 피해량 및 공격속도 조절 상한을 500%에서 2000%로 확대했다. 공격속도 런타임 보정과 현재 남은 공격 대기시간 재계산의 clamp도 동일한 2000% 상한을 사용한다.

3.759: 제리 반격 폭발 점프의 이동 중 무적을 일반 invulnerable에서 공통 evasionInvulnerable 비타격 무적으로 변경했다. 이동 거리/시간/벽 통과/적 통과/포물선 시각 및 폭발 판정은 유지한다.

3.748: 하츠하츠의 덧칠 기능을 제거했다. LMB 드래그 중 RMB로 progress를 되감던 input.drag-path rewind-start 사용처와 release 시 rewind 정리/보조 경로 보존 분기를 삭제하고, 캐릭터 설명의 [LMB DRAG/RMB] 덧칠 항목도 제거했다. 범용 input.drag-path rewind 기능 자체는 다른 재사용 가능성을 위해 유지하며, 하츠하츠 RMB 캔버스 위 세상은 LMB 드래그가 없을 때 기존대로 동작한다.

3.745: 디버그 탭의 비밀번호 변경을 기존 비밀번호 검증 방식에서 계정 재설정 방식으로 변경했다. 입력은 아이디/새 비밀번호/새 비밀번호 확인으로 구성하며, AccountService.debugResetPassword가 지정 계정을 로드한 뒤 새 salt/PBKDF2 해시를 생성해 저장한다. 일반 로그인 인증 로직은 변경하지 않는다.

3.744: 고정형 areaCircle이 sourceEntityId를 보유해도 followSource가 false면 소유 source를 null로 취급해 strokeColorMode:'source-team'이 실행되지 않던 공통 렌더 오류를 수정했다. 위치 추적용 follow source와 색/관계 판정용 effect source를 분리하고, forecastField에 boundaryStrokeOnTop을 추가해 키 예고장 범위 자체의 실선 윤곽을 보조 채움/게이지 위에 source-team 색으로 마감한다. 키의 arm/remaining gauge는 기존 은색을 유지한다. FieldDodgeRewardService는 코인 travelToken 생성을 공통 spawnTravelToken으로 분리하고, 원격 키에게 보상 패킷을 보내는 회피자 화면에서도 같은 EffectSpec을 로컬 생성해 코인을 보내는 쪽과 받는 쪽 모두 회피 종료 후 동일한 코인 이동을 볼 수 있게 했다.

3.743: 키 예고장 일반 회피 보상 패킷이 reward owner를 sourcePid에 담아도 RoomService.sendGameplay가 sourcePid를 실제 송신자 PID로 덮어써 키 소유 화면에서 항상 거부되던 근본 원인을 수정했다. duel-field-dodge-reward는 rewardOwnerPid를 별도 필드로 사용하며 sourcePid는 공통 네트워크 송신자 의미를 유지한다. 키 예고장은 기본 field stroke뿐 아니라 arm/ready 시간 링도 source-team 색을 사용하도록 areaCircle forecastField에 범용 gauge stroke color mode를 추가해 최외곽에 은색 링이 남지 않게 했고, 내부 fill/overlay 및 게이지 채움 색은 기존 은색을 유지한다.

3.742: 키 기만(RMB/RMB)의 예고장 종료 연출이 delivery.area가 없는 effectsOnly 공격에서 attack-center를 source 위치로 되돌려 예고장이 키 쪽으로 이동해 보이던 문제를 수정했다. effect.spawn의 attack-center는 실제 delivery.area 중심이 없으면 execution.targetPoint를 사용하며, fieldStateKey 후속 입력이 전달한 설치 지점을 유지한다. 키 예고장은 내부 채움/보조 연출은 기존 은색을 유지하고 외곽선만 source-team 색을 사용하는 실선으로 변경했다. FieldDodgeRewardService는 회피자 권위에서 후보를 판정할 때 네트워크 미러 충돌좌표가 아니라 실제 로컬 entity 좌표를 사용하고, dodge-ended를 정상 완료 기준으로 사용하며 timer는 이벤트 유실 fallback으로만 유지해 예고장 안 일반 회피 종료 후 보상 패킷/코인이 확정되도록 교정했다.

3.741: 키 예고장 일반 회피 보상 판정이 원격 일반 field 상태 존재 시 별도 dodgeReward 동기화 상태를 무시하던 문제를 수정해 로컬/원격 보상 field를 합쳐 중복 없이 판정한다. 키 예고장 외곽은 팀 색 실선으로 통일하고 LMB/RMB 안내를 제거했으며, 아군이 보는 예고장은 범용 areaCircle allyAlphaScale로 반투명 표시한다. ProgressStateService는 blocksStaminaRegen을 명시적으로 true인 진행도 상태에만 적용하도록 기본 의미와 네트워크 직렬화를 교정해 영구 스택/게이지 상태가 자연 스테미나 회복을 막는 공통 버그를 수정한다.

3.737: 키 3타 적중 후 750ms 추격 재입력 state.window을 감소형 gauge.arc에 연결해 가득 찬 호가 0까지 감소하도록 표시한다. 기존 듀얼즈의 키 예고장 시각을 복원해 설치 선딜 중 소유자-예고점 점선/위치 원/활성화 부채꼴, 활성 후 은색 펄스 원/2초 감소 링/LMB-RMB 안내, 재입력 시 4개 수렴 토큰/수축 점선 원/중앙 플래시/진행 부채꼴, 이후 0.5초 페이드를 effect.spawn의 범용 areaCircle forecast presentation 옵션으로 재현한다. effect.spawn은 startDelay를 범용 지원해 지연 페이드도 동일 EffectSpec으로 로컬/원격 동기화한다.

3.736: 기존 듀얼즈(423)의 키를 3.0 공통 구조로 이식했다. 손기술은 170ms 간격 3연타와 3타 적중 후 750ms 추격 재입력, 예고장은 지정지점 270 내 설치/0.5초 활성/2초 유지 후 LMB 광역 실행 또는 RMB 기만 순간이동, 반격은 0.3초 선딜 직선 공격+후방 순간이동+적중 시 체력/스테미나 20% 회복을 유지한다. field.area에 non-just dodge 보상 데이터를 추가해 회피자 권위에서 예고장 내부 일반 회피만 확정하고 온라인 소유자에게 보상을 전달하며, state.window on-hit·field armed 조건·field clear·triggered attack의 field 중심 지정을 범용 확장했다.

3.735: 온라인 duel-hit-confirmed 수신부가 주석과 달리 projectile.pierce/collisionPolicy를 검사하지 않고 모든 projectile.return outbound 투사체를 적중 확정 순간 강제 제거하던 공통 오류를 수정했다. 확정 적중 후 실제 투사체 소비는 collisionPolicy.passEnemies가 false인 비관통 투사체에만 적용하며, 레비나처럼 projectile.pierce targets:true인 왕복/지속 투사체는 적중 후에도 현재 경로를 계속 유지한다.

3.734: 레비나 waypoint 창의 persistOnTargetHit 예외를 제거했다. 플레이어 적중 후 투사체 소비 여부는 기존 projectile.pierce targets 정책만 사용하며, targets:true 관통 투사체는 hit 후에도 제거되지 않는다. waypoint 설정/런타임의 persistOnTargetHit 필드와 ProjectileService 소비 조건의 별도 예외 검사를 삭제해 관통 규칙을 단일 기준으로 복구했다.

3.733: projectile.waypoint-path에 persistOnTargetHit 옵션을 추가해 레비나처럼 경유지 기반 지속 무기가 플레이어 접촉에서 일반 투사체 소비 경로로 제거되지 않게 했다. waypoint가 경로 끝에 정지할 때 hitIds/rehitAt을 초기화하던 잘못된 경로를 제거해 같은 세그먼트에서는 같은 대상을 계속 1회만 타격하고, 실제 새 세그먼트가 시작되는 applySegment()에서만 적중 가능 대상이 갱신된다. weapon-projectile anchor-cross에 범용 allyAlpha를 추가해 소유자가 로컬 플레이어의 아군일 때만 본체 알파를 낮추며 레비나 창은 allyAlpha 0.45를 사용한다.

3.732: 레터박스/캔버스 밖 포인터는 실제 바깥 좌표를 월드까지 연장하지 않고 화면 중심→포인터 방향으로 플레이 화면 사각형 가장자리에 먼저 투영한 뒤 월드 좌표로 변환한다. 변환 결과가 월드 밖일 때만 현재 입력 앵커(일반은 플레이어, waypoint 무기 존재 시 현재 무기 위치)→목표 방향으로 월드 경계까지 제한한다. 레비나 최초 LMB/RMB에서 3.731에 추가했던 boundary-ray/clearance 보정을 제거해 엘린처럼 지정지점 입력 좌표를 그대로 사용하며 nearest-open 벽 끼임 보정은 적용하지 않는다.

3.731: target-point 투사체에 범용 targetPointResolve:'boundary-ray' 보정을 추가해 최초 발사 시에도 발사 원점→클릭 방향을 유지한 채 투사체 충돌 반경만큼 월드 경계 안쪽으로 목표점을 투영한다. 레비나 LMB/RMB 최초 삼지창 발사에 적용하며, 이미 창이 존재할 때의 waypoint 입력은 기존처럼 현재 창 위치 기준 보정을 유지한다.

3.730: 맵 밖/레터박스 클릭 보정의 입력 기준점을 범용 waypoint 무기가 존재할 때 플레이어가 아니라 해당 무기의 현재 위치로 전환하고, 투사체 충돌 반경만큼 맵 안쪽에 목표점을 투영한다. 지속 waypoint 투사체가 월드 경계에 닿았을 때 일반 투사체의 boundary 제거 경로를 타던 문제를 수정해 경계 안쪽에 고정한 뒤 현재 세그먼트 도착으로 처리하며, 다음 경로가 없으면 그 위치에 정지하고 경로가 남아 있으면 이어서 이동한다.

3.727: FFA 결과 판정을 팀 순위 기준으로 재조정했다. 3팀전 2등과 4팀전 2·3등은 outcome:'neutral'로 유지하며 승리/패배 어느 쪽에도 포함하지 않고 레코드 점수 변화도 0으로 처리한다. FFA result.won은 중립일 때 null이며, plays는 증가하지만 wins/losses는 증가하지 않는다.

3.726: 레비나 waypoint 경로의 현재 이동 세그먼트 점선 위상을 원래 세그먼트 시작점 기준으로 고정해 창 이동 중에도 점선이 실선처럼 뭉개지지 않게 했다. waypoint presentation의 suppressOwnerAimLine 옵션으로 창이 존재하는 동안 플레이어→마우스 공통 빨간 조준선을 숨기되 창/마지막 경유지→마우스 조준선은 유지한다. 새 세그먼트 적용 시 projectile.hitIds뿐 아니라 projectile.returning.outboundHitIds도 초기화해 같은 적을 경로마다 다시 타격할 수 있게 했다. 레비나 LMB/RMB 기본 쿨다운과 경유지 입력 지연은 서로 독립 상태를 유지한다.

3.721: 레이즈 반격 방출의 다음 파워 펀치 보너스를 퍼센트 선충전이 아니라 클릭 카운트 최대치 부여로 변경했다. 방출 적중 여부와 무관하게 공격 실행 후 현재 파워 펀치 차징 상태가 있으면 진행도를 즉시 maxClicks까지 채우고, 차징 중이 아니면 다음 LMB 시작 시 maxClicks에서 시작하도록 boost state를 저장한다. 설명도 33% 문구를 제거하고 다음 파워 펀치 4회 충전으로 정리했다.

3.894: 훈련장 근거리/원거리 공격 봇의 공격 속도를 각각 10~500%로 조절할 수 있게 했다. 기존 Training.settings와 GAME_DATA.trainingBots의 firstDelay/intervals 공통 주기 경로를 재사용하며, 설정 배율은 첫 공격 대기와 이후 공격 간격에 동일 적용된다. 공속을 플레이 중 변경하면 현재 남은 공격 대기도 기존/신규 배율 비율로 즉시 재조정하고, 봇 쿨타임 표시도 같은 배율 계산을 사용한다. 새 전투 모듈이나 봇 타입별 하드코딩 공격 경로는 추가하지 않았다.

3.893: 관통샷 온라인 원격 화면의 영구 벽 관통 버그 수정. 관통샷 cooldown.consume은 source 권위 로컬에서만 실행되므로 원격 mirror의 cooldown.ready가 계속 true인 상태에서 AugmentService.prepareAttack()이 매 평타에 wallPierce를 재적용하던 것이 원인이었다. prepareAttack에 source 권위가 확정한 network adjustment override/capture를 추가하고 AttackExecution/duel-action/duel-scheduled-projectile-shot에 wallPierce 적용 여부를 전달한다. 원격은 자체 관통샷 cooldown 상태를 재판정하지 않고 송신자가 실제 해당 공격에 적용한 wallPierce boolean을 사용한다. 자연적으로 벽 관통하는 AttackSpec은 base projectile.pierce를 그대로 유지하며, 증강 적용 여부만 동기화한다.

3.892: 클레아 RMB/LMB 추가 전륜 툴팁에도 현재 평타 거리 피해 범위를 명시. `평타와 추가 전륜을 날림 (90~45)`으로 변경했다. 실제 거리별 피해 구조와 공격 동작은 변경하지 않는다.

3.891: 클레아 LMB 툴팁을 현재 거리 비례 피해 구조에 맞춰 수정. `날아갈수록 피해가 감소하며 느려짐 (90~45)` 문구로 변경했다. 실제 0~25/25~50/50~75/75~100% 거리 피해 90/75/60/45 및 감속형 탄속 구조는 변경하지 않는다.

3.890: 클레아 추가 전륜의 벽 관통/개별 피해를 제거하고 두 전륜을 동일 공격으로 통일. lmb/lmbShadow는 근거리 기준 damageRatio 1.5(90)에서 기존 damage.range-band-multiplier를 25%/50%/75% 경계에 누적 적용해 거리별 90/75/60/45 피해를 준다. 추가 전륜 perShotProjectileOverrides의 pierceWalls/damageRatio를 제거해 일반 전륜과 동일하게 벽에 막히고 동일 거리 피해를 사용한다. 추가 전륜 차등 피해를 위해 3.887에 추가했던 attackWithShotOverride와 3.889의 높은 피해 탄 우선 선점 보정도 더 이상 필요 없어 제거했다. 탄별 radius/renderColor override와 hit.once-per-execution은 유지한다.

3.889: 같은 AttackExecution의 hit.once-per-execution 다중 투사체가 같은 대상에 같은 프레임 접촉할 때 낮은 피해 탄이 먼저 판정을 선점하는 문제 수정. AttackHitTriggerService는 projectile impact에서 현재 대상과 실제 충돌 중인 같은 source/execution의 더 높은 damageRatio 투사체가 있으면 낮은 피해 판정을 이번 프레임 보류한다. 이후 높은 피해 탄이 먼저 확정되어 execution hit를 기록하고 낮은 탄은 중복 적중으로 무효화된다. 클레아 달 그림자 전륜 60/30처럼 탄 생성/업데이트 순서와 무관하게 동시 적중 시 높은 피해가 우선하며, 한 탄만 맞으면 해당 탄 피해가 그대로 적용된다. 새 모듈이나 캐릭터 ID 분기는 추가하지 않았다.

3.888: 엔소냐 LMB 넉백 유효구간 투사체 색상 표시 및 클레아 설명 수정. delivery.projectile에 knockbackActiveColor를 선택적으로 지정할 수 있게 하고, 공통 projectile 렌더가 같은 AttackSpec의 movement.knockback.maxProjectileTravelRatio를 읽어 해당 진행률 이내에서만 지정 색을 사용한다. 엔소냐 LMB는 knockbackActiveColor:'#213b5a'로 지정해 사거리 25% 이내 넉백 가능 구간에서 남색, 이후 기존 엔소냐 색으로 표시된다. 넉백 판정의 .25 값을 시각에 중복 하드코딩하지 않는다. 클레아 RMB/LMB 추가 전륜 설명은 `평타와 벽 관통 추가 전륜을 날림`으로 변경했다.

3.887: 클레아/엔소냐 밸런스 조정. 클레아 Base Damage를 50→60으로 올려 일반 LMB 60으로 변경하고 counter/counterShadow damageRatio는 4→10/3으로 재보정해 기존 반격 실제 피해 200을 유지했다. 클레아 LMB/lmbShadow 사거리는 676→540.8(-20%). lmbShadow 두 번째 추가 전륜에 perShotProjectileOverrides.damageRatio:.5를 지정해 추가 전륜 피해를 30으로 분리했으며, 기존 per-shot override 경로를 범용적으로 확장해 로컬/원격 모두 동일 projectile attack damageRatio를 사용한다. 엔소냐 RMB III는 basicAttackWallPierce를 제거하고 기존 dodgeDistance +30%로 복구했으며, 더 이상 사용처가 없는 basicAttackWallPierce 공통 버프/prepareAttack 분기도 제거했다. 엔소냐 LMB에는 사거리 진행 25% 이내 적중 시 movement.knockback distance 20을 추가하고, movement.knockback의 maxProjectileTravelRatio 범용 조건을 prepared AttackSpec.range 기준으로 복구했다.

3.886: 제리 LMB 벽 지정 보정을 엘린 LMB와 동일하게 적용. attack.jerry.lmb의 delivery.projectile에 targetPointResolve:'nearest-open', targetPointClearance:2를 추가해 벽 내부/벽 위를 지정해도 가장 가까운 열린 지점으로 목표점이 보정된다. 기존 targetPointMinRange 45, targetPointClampToAttackRange:true, 곡사/착탄 폭발/벽 차단 구조는 유지한다.

3.885: 제리 평타/C4 폭발 시각을 반격과 동일한 자동 원형 area 경로로 통일. attack.jerry.grenade-explosion과 attack.jerry.c4-explosion의 별도 effect.spawn areaCircle을 제거해 delivery.area가 생성하는 자동 원형 이펙트만 남겼다. 따라서 wallPolicy:'block'으로 계산된 실제 원형 geometry와 동일한 시각만 1개 생성되며, areaWallCutOutline과 커스텀 원형이 겹치던 이중 이펙트가 사라진다. 폭발 판정/착탄점/피해/넉백/반격 이펙트는 유지한다.

3.884: 제리 착탄 폭발 판정을 제리 반격 폭발과 동일한 원형 area 경로로 통일. 기존 ProjectileImpactService가 linked circle attack에 centerPoint를 주입하는 우회 방식을 제거하고, AreaAttackService.execute에 범용 geometrySource 옵션을 추가했다. projectile impact linked attack은 실제 착탄점을 geometrySource로 전달하므로 판정용 source 좌표 자체가 착탄점이 되고, 이후 AreaGeometryService.polygon / containsPoint / wallPolicy:'block' LOS가 제리 반격처럼 동일한 source-centered 원형 계산을 수행한다. 실제 damage source/owner/relation/network authority는 원래 제리를 유지한다. 반격 원 확장 이펙트는 유지한다.

3.883: 제리 폭발 벽 차단 후속 수정. 3.882에서 평타/C4 착탄 폭발 EffectSpec에 추가한 clipToAttackArea:true를 제거했다. 실제 피해는 기존 공통 원형 delivery.area + wallPolicy:'block'이 착탄점 centerPoint에서 대상까지 LOS를 검사해 다른 원형 폭발과 동일하게 벽에 막히며, 시각 폭발은 position:'impact-point'의 원래 원형 이펙트를 그대로 유지한다. 반격 delivery.area의 visual:false를 제거해 원 확장 자동 이펙트를 복구했다.

3.882: 제리 폭발 벽 차단 및 반격 자동 원형 이펙트 제거. attack.jerry.grenade-explosion, attack.jerry.c4-explosion, attack.jerry.counter의 delivery.area wallPolicy를 ignore→block으로 변경해 평타/스킬/반격 폭발 피해가 벽을 넘어가지 않게 했다. 평타/스킬 폭발의 areaCircle EffectSpec에는 clipToAttackArea:true를 추가해 시각도 실제 벽 차단 영역과 동일하게 잘리도록 했다. 반격기는 delivery.area visual:false로 자동 생성되던 원 확장 범위 이펙트만 제거하고 실제 폭발 판정/피해/폭발점프 이동은 유지한다.

3.881: 엔소냐/클레아 근거리 넉백 제거 및 벽 관통 변경. 두 캐릭터 LMB에 3.873~3.880에서 추가했던 사거리 30% 이내 movement.knockback을 완전히 제거하고, 이 기능 전용으로 확장했던 maxProjectileTravelRatio 처리도 제거해 기존 maxProjectileTravel 절대거리 지원만 남겼다. 엔소냐 RMB 3단계는 dodgeDistance +30% 대신 basicAttackWallPierce 토글 버프를 부여하며, AugmentService의 기존 wallPierce 준비 경로를 평타 태그에 한해 재사용해 3단계 동안 평타가 벽을 관통한다. 클레아 lmbShadow의 두 발 중 추가 전륜(두 번째 발)에만 perShotProjectileOverrides.pierceWalls:true를 지정했다. 기존 perShotProjectileOverrides를 radius/renderColor뿐 아니라 pierceWalls/pierceTargets에도 적용하도록 ProjectileModuleService.withShotOverride를 추가해 공격별 별도 구현 없이 재사용한다.

3.880: 클레아/엔소냐 LMB 근거리 넉백 상향. 사거리 진행 30% 이내 적중 시 적용되는 movement.knockback distance를 8→16으로 변경했다. 클레아 기본 평타와 추가 전륜 모두 적용되며, 엔소냐 평타에도 동일 적용된다. 진행률 조건과 속도/피해/비용은 변경하지 않았다.

3.879: 나남낭 온라인 플레이어 적중 시 LMB 잃은 체력 비례 회복 누락 수정. 대상 권위의 duel-hit-confirmed를 공격자에게 재생하는 source resource.restore 경로가 amount/maxResourceRatio만 처리하고 missingResourceRatio를 누락해, 더미/로컬 적중에서는 회복되지만 실제 원격 플레이어 적중 확정에서는 회복량이 0이 되던 공통 버그였다. confirmed source restore 계산을 AttackModuleService.onHit의 canonical resource.restore 계산과 동일하게 ModuleValueService.resolve + maxResourceRatio + missingResourceRatio 순서로 맞췄다. 나남낭 전용 하드코딩 없이 모든 source on-hit 회복 모듈에 동일 적용된다.

3.878: 소르 RMB 정전기장 투사체 벽 관통 적용. attack.sor.rmb의 projectile.pierce walls:false→true로 변경해 기존 적 관통(targets:true)을 유지하면서 벽도 통과하도록 했다. 목표 지점 도착 후 projectile.impact의 정전기장 생성 구조와 다른 수치는 변경하지 않았다.

3.877: 밸런스 조정 및 런 앤 건 제거. 클레아 maxHealth 1000→1100. 헤르쟝 이동형 대포 자동공격 meleeInterval 600→461.538ms(연사속도 +30%), 대포 명령 3연사 interval 180→138.462ms(연사속도 +30%), LMB 비용 200→150. 펠루나 강화 단계당 시간 5초→3초로 통일해 gauge segmentDuration 3000, 강화 add 3000/max 9000, 단계 임계값 3000/6000으로 조정하고 관련 반격/평타 alternate/피해증가 임계값을 같은 기준으로 맞췄다. 모루 maxHealth 800→600, 강화지대 반경 240→192(-20%)로 fieldArea/표시/강화 판정/연결 range를 동일하게 조정했다. 공유 증강 run_and_gun 정의와 그 전용 skill-speed/summon-command-speed 트리거를 완전히 제거했다.

3.876: 칸 수치 조정. maxHealth를 1000→1300으로 변경하고 LMB 연사속도를 현재보다 20% 빠르게 하기 위해 attack.kan.lmb의 cd를 350ms→291.6666666667ms(350/1.2)로 조정했다. 피해/비용/사거리/악식 게이지/다른 스킬은 변경하지 않았다.

3.875: 셸로 벽 판정 후속 수정. 3.874의 wallCollisionMode:'center'가 일반 ProjectileService 벽 충돌에는 적용됐지만 ProjectileOrbitService가 궤도 벽 raycast에서 projectile.radius를 직접 padding으로 사용해 LMB/스피닝이 여전히 방패 외곽선 기준으로 잘리던 원인을 수정했다. orbit도 ProjectileService.wallCollisionPadding(projectile)을 사용해 center/radius 정책을 동일하게 따른다. 또한 attack.guard의 area()가 wallPolicy:'ignore'를 강제하던 구조를 module.wallPolicy 기반으로 일반화하고 셸로 RMB의 delivery.area와 attack.guard 모두 wallPolicy:'block'으로 지정해 방어/넉백 판정과 시각 clipping이 벽을 넘지 않게 했다.

3.874: 셸로 방패 투사체 벽 충돌 기준을 외곽 반경이 아닌 중심점으로 변경. 기존 ProjectileService의 범용 wallCollisionMode:'center' 경로를 재사용해 attack.shello.lmb, attack.shello.counter, attack.shello.counter-parry의 delivery.range-projectile에 center 모드를 지정했다. 따라서 월드 경계/벽 raycast padding이 48px 투사체 반경이 아니라 0으로 계산되어 방패 중심이 벽에 닿을 때 충돌한다. RMB 방어자세는 delivery.area+attack.guard로 투사체가 아니므로 변경하지 않았다.

3.873: 클레아/엔소냐 근거리 투사체 넉백 및 수치 조정. 기존 movement.knockback의 maxProjectileTravel 절대거리 제한을 확장해 maxProjectileTravelRatio를 추가했다. on-hit 시 실제 projectile.travel을 준비된 AttackSpec.range×ratio와 비교하므로 범위 증폭 후에도 동일한 진행률 기준을 유지한다. 클레아 baseDamage를 60→50으로 낮춰 LMB/달그림자 추가 전륜의 타당 피해를 50으로 조정하고, 기존 반격 실제 피해 200은 counter/counterShadow damageRatio를 10/3→4로 재보정했다. 클레아 기본 LMB와 lmbShadow에 사거리 30% 이내 적중 시 8 넉백을 추가했다. 엔소냐 LMB 비용을 50→80으로 올리고 같은 30% 이내 8 넉백을 추가했다.

3.872: 티냐 마법진 저스트 회피 시 증폭 CC가 남는 온라인 권위 버그 수정. CircleFormationService.applyManifestDamage에서 AttackHitTriggerService.damage()의 공격자 측 prediction(hit:true, authoritative:false)을 실제 적중 확정으로 취급해 applyAmplifierStatus()가 duel-status-apply를 선전송하던 문제였다. 증폭 SLOW/BIND/FREEZE는 target-authoritative 실제 hit 결과에서만 적용하도록 제한한다. 대상 권위 DamagePipeline에서 저스트 회피가 성공하면 hit:false/dodged:true이므로 피해와 on-hit 효과와 증폭 CC가 모두 생략된다. 오프라인 및 대상 권위의 정상 적중은 기존대로 적용된다.

3.871: 셸로 방어자세 지속시간 갱신 제거. attack.shello.rmb의 attack.guard onBlock에서 refreshGuardDuration:true를 제거해 방어 성공 시에도 최초 발동 시점의 200ms guard expiresAt을 유지한다. 패리 반격 5초 획득과 방어 성공 시 주황색 visualState 교체는 그대로 유지하며, AttackGuardService의 범용 refreshGuardDuration 지원 자체는 다른 데이터 재사용을 위해 유지한다.

3.870: 나남낭 LMB 잃은 체력 비례 회복 수정. 기존에는 일반/최대차징 평타 회복이 character.triggers의 damage-dealt + resolvedChargeProgress 조건에 분리되어 실제 평타 적중 처리와 별개 경로를 탔다. 두 전용 트리거를 제거하고 attack.nanamnang.lmb 기본 modules 및 charge.fullSpec.modules에 공통 resource.restore when:'on-hit', recipient:'source', missingResourceRatio:.2, oncePerExecution:true를 직접 배치했다. 따라서 근접 베개 휘두르기와 최대차징 베개 투척 모두 실제 적중한 execution에서 잃은 체력의 20%를 정확히 1회 회복하며 공통 AttackModuleService.onHit 경로를 사용한다.

3.869: 엘린 LMB 아군 회복 누락 수정 및 레테 지원 회복 경로 검증. attack.elin.lmb-heal의 resource.restore에 when:'on-hit'이 빠져 공통 AttackModuleService.onHit()의 회복 처리 분기에 진입하지 못하던 원인을 수정했다. 엘린 LMB impact는 기존대로 적용 피해용 attack.elin.lmb-explosion과 아군 지원용 attack.elin.lmb-heal을 같은 착탄점에서 실행하며, heal delivery의 targetRelations:['ally'] + applyHitEffects:true를 통해 아군만 피해 없이 회복한다. 회복량은 기존 ModuleValueService attack-damage 참조로 LMB 폭발 피해의 2배를 유지한다. 레테 LMB와 우편함 우편은 이미 resource.restore when:'on-hit', applyHitEffects:true, ally/self 관계 필터가 정상 구성되어 있어 변경하지 않았다.

3.868: 클레아 역할 카드 미반영 원인 수정. 3.866~3.867에서 공통 tags 문자열을 전역 첫 일치로 교체해 클레아가 아니라 슈비 태그가 잘못 변경되고 클레아 정의는 그대로 남아 있던 문제를 수정했다. 이번에는 GAME_DATA.characters의 clea/shubi 블록 범위를 ID 기준으로 한정해 클레아를 '파워형 중거리 암살자' / ['파워형','암살자']로 정확히 변경하고, 슈비는 원래 '파워형 근거리 딜러' / ['파워형','딜러']로 복원했다. 캐릭터 카드는 GAME_DATA.characters의 styleLabel을 직접 읽으므로 별도 카드 코드 수정 없이 즉시 반영된다.

3.867: 클레아 역할 분류 수정. 3.866에서 잘못 바꾼 1차 스타일 분류 '파워형→암살자'를 되돌리고, 사용자가 요청한 대로 2차 역할 '딜러'를 '암살자'로 변경했다. 따라서 클레아 표기는 '파워형 중거리 암살자', tags는 ['파워형','암살자']가 된다.

3.866: 캐릭터 역할 분류 수정. 메후구를 행동제약형, 티냐를 조건형, 클레아를 암살자로 변경하고 각 캐릭터의 styleLabel과 명시적 tags를 동일 분류로 맞췄다. 역할/거리/직군 표시는 기존 CharacterTag/설명 경로가 이 데이터를 그대로 사용하므로 별도 UI 하드코딩 없이 반영된다.

3.865: 자동 공격 증강 완전 제거. AUGMENTS의 auto_attack 정의(최대 스테미나 -25%, dodge-ended→action.basic-attack)를 삭제하고, 티냐 자동공격 지원을 위해 3.862~3.864에서 추가했던 CircleFormationService.automaticBasicAttack 및 AugmentEffectModuleService의 formationResult 우선 분기를 제거했다. action.basic-attack 범용 모듈과 automaticScaledBasicAttackSpec은 다른 증강/시스템 재사용 가능성이 있어 유지하며, auto_attack ID/설명/전용 티냐 자동발현 경로는 파일에서 모두 제거했다.

3.864: 티냐 자동공격 스택별 조준 위치 갱신 수정. 3.863에서 한 dodge-ended 트리거 전체에 고정했던 formation 자동공격 targetPoint를 제거하고, 각 repeat 실행 직전에 로컬 마우스 위치를 다시 읽도록 복원했다. 따라서 자동공격 증강을 여러 장 보유하면 80ms 간격의 각 자동공격마다 그 순간의 마우스 위치를 새 중심으로 사용하며, 각 발동 내부의 마법진 상대 배치는 그대로 유지된다. 즉시 발동/무공개 선딜 규칙은 그대로 유지한다.

3.863: 티냐 공개 선딜 2단계/링 점유/자동공격 고정 위치·무선딜 수정. reveal 300ms 중 앞 50%에서만 12시→시계방향으로 마법진을 완성하고 뒤 50%는 완성 상태를 그대로 유지한 뒤 기존 resolveActivation 시점에 피해를 준다. CircleFormationService.entityHoldGaugeState를 추가하고 EntityRingLayoutService.privateGaugeVisible/flashVisible이 이를 읽어 티냐의 커스텀 홀드 호와 완료 점멸링도 공통 링 점유로 인식하므로 상태/반격 활성 링이 호와 점멸링 바깥으로 정상 배치된다. 자동공격 증강은 한 dodge-ended 트리거가 시작될 때 formation 평타의 마우스 위치를 한 번만 캡처해 같은 스택 연사 전체가 그 위치를 재사용한다. 티냐 자동공격은 attackDelay/attackDelayGroup을 제거한 즉시 발현용 준비 AttackSpec을 사용하고 formation.activate/reveal/ability pending을 전혀 거치지 않으며 duel-formation-attack만 즉시 전송한다.

3.862: 티냐 홀드 호/링 배치와 자동공격 발현 방식 수정. CircleFormationService.drawHoldGauge는 온라인에서 일반 원 객체가 EntitySimulationAuthorityService.isLocal 판정에 막히던 문제를 해결하기 위해 마법진 대상에 visibility:'all'을 명시하며, 마법진 호 반경은 원 반경+공통 BODY_GAP, 완료 점멸링은 EntityRingLayoutService.nextRadius로 바로 바깥 슬롯에 배치한다. 티냐 본체 호는 공통 chargeRadius, 완료 링은 maxChargeFlashRadius를 그대로 사용해 다른 캐릭터 링 체계와 동일하게 맞춘다. 자동 공격 증강의 action.basic-attack은 평타 AttackSpec에 formation.manifest가 있으면 CircleFormationService.automaticBasicAttack을 우선 사용한다. 현재 배치된 모든 마법진의 상대 배치를 매 발동마다 마우스 위치에 복제해 반격처럼 즉시 발현하고, 배치 원은 소모하지 않으며 자동공격 스택 수만큼 기존 delayStep 간격으로 각각 발현한다. 이 경로는 formation.activate/reveal을 거치지 않고 실제 원 스냅샷을 duel-formation-attack으로 바로 동기화하므로 상대 공개 선딜레이가 없다.

3.861: 티냐 빈 필드 주문서 재입력/생성 빨강 조건/일반전 홀드 호/아군 배치 미리보기/미리보기 색상/증폭원 연결선 수정. beginActivation은 현재 원이 없어도 lastFormation이 있으면 0.2초 LMB 입력창을 열어 LMB/LMB 주문서 재입력을 허용하고, 단일 LMB 종료 시에는 빈 필드이므로 발동 없이 취소한다. 생성 preview는 최대 개수 초과 또는 invalidContain 관계에 참여하는 생성 원을 기존처럼 빨강 채움+빨강 점선으로 표시하며 invalidContainInnerIds의 기존 내부 원도 동시에 빨강 표시한다. 로컬 판정은 Training.player 직접 비교 대신 EntitySimulationAuthorityService.isLocal을 재사용해 일반 온라인 게임에서도 생성/이동 홀드 호와 개수 게이지가 정상 표시된다. formation state 네트워크 스냅샷은 평상시 배치 circles도 함께 보내되 공개 여부를 별도 revealRemaining으로 유지하고, 수신 측은 아군 원만 0.48 alpha 미리보기로 표시하며 적군 평상시 배치는 숨기고 reveal 단계만 표시한다. 배치/생성/편집 미리보기 외곽은 티냐 고유색 #92cbd6만 사용하고 reveal/manifest에서만 팀 색상을 사용한다. 활성 증폭 마법진들은 수신 관계나 배치 조건과 무관하게 서로 모두 점선으로 연결되며 발동 snapshot에서도 같은 sourceIds 집합의 모든 쌍을 실선으로 저장한다.

3.860: 티냐 생성 중 아이콘/배율 글꼴/기본색/무효 포함/마법진 개수 게이지 수정. 생성 드래그 중에는 previewSet 전체를 한 번만 그리되 기존 원과 신규 미리보기 원의 역할 아이콘을 모두 같은 패스로 렌더해 기존 아이콘이 사라지거나 중복되지 않는다. 원 중앙/교차 렌즈 배율 텍스트는 모두 bold 18px Pretendard로 통일했다. 티냐 캐릭터 기본색을 기존 파일의 #92cbd6로 복원하고 홀드 완료 펄스도 동일 색을 사용한다. invalidContainInnerIds는 기존 파일처럼 빨강 채움/빨강 점선 외곽으로 표시해 포함 조건을 만족하지 못하는 내부 원이 즉시 드러난다. CircleFormationService에 일반 배치 개수용 segmented count gauge를 추가해 최대 원 개수와 현재 state.circles 개수를 데이터에서 읽고, 기존 티냐와 동일한 48px 폭/2px 간격/4px 높이/청록 채움 칸을 스테미나 바 아래에 표시한다.

3.859: 티냐 관계 아이콘/증폭 중복/팀색 외곽선/발동 시각/공개 선딜을 정리했다. 포함 외부 마법진 아이콘은 바깥 원-안쪽 원 사이 도넛 영역을 채우고, 내부 포함은 기존처럼 안쪽 원을 채운다. 생성 드래그 중에는 기존 배치와 임시 previewSet을 두 번 그리던 경로를 제거해 관계 아이콘이 겹치지 않는다. 증폭 단계는 source별 affectedIds 기여 맵으로 다시 계산해 동일 증폭 마법진이 같은 연결망의 여러 원과 직접 접촉해도 대상당 한 번만 기여한다(유효 포함으로 증폭원 자체가 강화된 경우의 amount=2 의미는 유지). 배치/공개/발동 마법진 외곽선은 TeamColorPresentationService의 실제 팀 색상을 사용하고, 미리보기는 회색 채움+점선, 발동 잔상은 기존 파일의 청록 채움/교차 렌즈/증폭 연결선/짧은 확장 플래시 질감을 복원하되 외곽선만 팀색 실선으로 변경했다. 공개 reveal은 revealStartedAt/remaining을 기준으로 12시에서 시작해 시계방향으로 원 외곽선과 채움이 진행되며 로컬/원격이 같은 revealMs 진행률을 사용한다.

3.858: 티냐 미리보기/배수 표기와 현재 진형 참조 규칙 수정. 마법진 배수 표기를 `1배/2배`에서 `×1/×2` 형식으로 통일하고, 교차 관계의 실제 crossMultiplierByPair 값을 교차 렌즈 중심에도 표시한다. 발동 전 티냐 미리보기는 청록/빨강 색상을 제거하고 흰색·회색 계열만 사용하며 교차/증폭처럼 진해지는 영역은 회색 농도로 구분한다. 무영창 주문서는 lastFormation이 아니라 현재 배치된 state.circles의 상대 스냅샷을 조준 위치에 복제하며, 자동공격을 포함한 formation.activate도 현재 배치된 마법진이 없으면 과거 lastFormation을 사용하지 않고 실패하도록 정리해 항상 현재 그려진 진형만 참조한다.

3.857: 마지막 캐릭터 티냐를 기존 듀얼즈 기준으로 구현하고 LMB/RMB 기능을 완전히 교환했다. 새 LMB는 기존 RMB의 마법진 발동/마법진 제거/마법 주문서/연결 그룹 이동을 담당하고, 새 RMB는 기존 LMB의 클릭·드래그 마법진 생성/단일 마법진 수정/포함·연결·교차·증폭 관계를 담당한다. 동적 원 집합의 관계 그래프·교차 렌즈·증폭 단계·입력 상태·발현 피해를 재사용 가능하게 관리하는 CircleFormationService와 formation.manifest/formation.activate 범용 모듈을 추가했다. 일반 배치 최대 6개, 반지름 68~240, 생성 비용 250/쿨다운 180ms, 발동 입력창 200ms+공개 300ms, 주문서 비용 800, 발동계열 후딜 100ms, 기본 피해 50, 증폭 CC 1초, 반격 쿨다운 550ms를 기존 수치의 Duels 3 스케일로 이식했다. 발현은 대상별 최고 배율만 한 번 적용하며 포함/교차/렌즈 공유와 증폭 1단계 감속·2단계 속박·3단계 빙결을 기존 관계 규칙으로 계산한다. 온라인에서는 공개 중 원 배치를 duel-state에 동기화하고 실제 발현 원 스냅샷을 duel-formation-attack으로 재생하며, 반격은 duel-counter-resolve에 formationSnapshot을 포함해 피격 권위 화면에서도 같은 배치를 사용한다.

3.856: 셸로 태그 정리. 셸로 AttackSpec은 실제 모듈 기반 파생 태그를 사용하며, 일반 반격과 패리 반격의 counter.execute CC 태그 연결을 정확히 분리했다. TagService.linkedAbilityModuleTags는 alternateWhen으로 선택되는 AttackSpec에는 기본 module.cc가 아니라 alternateWhen.cc를 우선 파생하도록 수정해 패리 반격의 실제 CC 태그가 선택된 반격 사양과 일치한다. 셸로 캐릭터 태그는 조건형/근거리/탱커, LMB는 평타+근거리+범위 투사체/범위 공격/히트스캔/원형/적 관통, RMB는 스킬+초근거리+범위 공격/히트스캔/부채꼴/방어/넉백, 일반 반격은 반격+근거리+범위 투사체/범위 공격/히트스캔/원형/적 관통/무력화 넉백, 패리 반격은 반격+중거리+범위 투사체/범위 공격/히트스캔/원형/이동기/벽 관통/적 관통/무력화 넉백으로 실제 동작과 일치한다.

3.855: 반격 선딜 counterCharge 이펙트가 실제 소비한 반격 종류의 색상을 사용하도록 수정했다. Presentation.counterCharge가 presentation.color를 EffectSpec에 전달하고, ability-telegraph 바인딩은 source.counterWindup.counterKind와 character.counterReadyPresentation.kindColors를 사용해 현재 반격 종류의 색상을 결정한다. 따라서 셸로 패리 반격 선딜 게이지는 패리 활성 링과 동일한 주황색 255,118,32를 사용하고 일반 반격은 기존 노란색을 유지한다.

3.854: 셸로가 벽에 가까울 때 orbit 방패가 첫 프레임부터 벽 반대편에 생성/이동할 수 있던 버그 수정. ProjectileOrbitService.update()가 desiredX/Y를 그대로 projectile.x/y에 대입하기 전에 orbit 중심→desired 위치를 projectile 반경 padding 기준 WorldGeometryService.raycastDistance로 제한한다. 벽을 관통하지 않는 orbit projectile은 목표 반경 방향의 최초 허용 위치까지만 배치되며, 이후 기존 wall:'clamp' 접선 슬라이드/재합류 로직이 계속 적용된다. projectile.pierce walls:true인 패리 반격은 이 제한을 받지 않는다.

3.853: 셸로 orbit이 벽을 따라간 뒤 원래 궤도로 복귀하지 못하는 문제 수정. wall:'clamp' 처리에서 매 프레임 현재 실제 위치→orbit desired 위치 직선 경로가 projectile 반경 기준으로 열려 있는지 먼저 검사한다. 열려 있으면 즉시 desiredX/Y로 복귀하고 clamp를 종료하며, 아직 막혀 있을 때만 기존 벽면 법선 제거/접선 슬라이드를 적용한다. 따라서 반격 방패가 벽을 비비며 계속 남지 않고 회전 궤도가 벽 밖으로 돌아오는 순간 원래 orbit 위치를 다시 따라간다.

3.852: 셸로 orbit wall clamp를 접선 재-raycast 방식에서 실제 벽면 투영 방식으로 변경했다. 벽 접촉점에서 접선 raycast도 0으로 판정되어 방패가 고정되던 원인을 제거했다. wall:'clamp'는 현재 접촉점과 projectile 반경으로 확장한 DebugMap wall 면을 비교해 충돌한 면을 판별한다. 수직 벽면이면 남은 X 이동만 제거하고 Y 이동은 그대로 적용하며, 수평 벽면이면 남은 Y만 제거하고 X를 유지한다. 코너에서는 원래 이동벡터 중 진입량이 더 큰 축을 차단한다. orbit desiredX/Y와 시간/각도는 계속 진행되므로 벽을 따라 미끄러지다가 궤도가 다시 열린 방향으로 돌아오면 원래 orbit 위치를 자연스럽게 회복한다.

3.851: 셸로 orbit 투사체가 벽에서 멈추는 문제 수정. 3.849/3.850의 일반 projectile wall clamp는 ProjectileService가 한 프레임의 목표점을 벽 접촉점으로 잘라낸 뒤 prevX/prevY까지 덮어써 orbit의 절대 목표 위치와 실제 제한 위치를 분리하지 못했다. orbit 투사체 전용으로 ProjectileOrbitService가 매 프레임 desiredX/desiredY를 orbitState에 저장하고, wall:'clamp' 충돌 시 현재 위치에서 desired 좌표까지의 X/Y 성분을 독립 raycast해 가능한 접선 이동만 적용한다. 실제 위치가 벽에 막혀도 orbit의 시간/각도/desired 좌표는 계속 진행하므로 궤도가 다시 벽 밖으로 향하는 순간 자연스럽게 원래 궤도로 복귀한다. 일반 비-orbit clamp 동작은 기존 유지.

3.850: 3.849 projectile wall clamp ReferenceError 수정. handleWallCollision 내부에서 desiredEndX/Y를 if(!boundary) 블록 안에 const로 선언해 두고, 블록 밖의 wall:'clamp' 처리에서 참조하던 스코프 오류가 원인이었다. desiredEndX/Y를 함수 스코프로 올려 실제 이동 목표점을 저장하도록 수정했으며 셸로 평타/반격의 벽 접선 슬라이드 동작은 그대로 유지한다.

3.849: 클레아 달 그림자 자동 활성화와 셸로 orbit 벽 슬라이드를 수정했다. 온라인/권위 확정 hit-confirmed의 source state.window 처리 경로가 module.conditions를 검사하지 않고 TimedActionStateService.open()을 직접 호출하던 것이 클레아 LMB가 플레이어/소환수 적중 시 RMB 없이 달 그림자를 새로 여는 원인이었다. 해당 경로도 AttackModuleService.hitConditionMatches()를 통과하게 해 이미 활성 상태일 때만 5초 갱신되며 미활성 상태에서는 절대 새로 열리지 않는다. projectile.collision wall:'clamp'는 단순 접촉점 고정 대신 벽에 막힌 이동 성분만 제거하는 slide 처리를 사용한다. 원래 목표점까지의 남은 X/Y 이동을 각각 공통 raycast로 재시도해 가능한 접선 성분은 계속 이동하고, orbit 시간/각도는 멈추지 않으므로 궤도가 다시 열린 방향으로 향하면 자연스럽게 원래 궤도를 회복한다.

3.848: 셸로 범위 투사체의 벽 정책을 교정했다. 기존 projectile.collision의 wall 정책에 범용 'clamp' 동작을 추가했다. clamp는 벽 충돌 시 기존 raycast 접촉점까지만 위치를 되돌리고 투사체를 제거/정지시키지 않으므로, orbit 투사체는 다음 프레임에도 원래 회전 궤도를 계속 계산하면서 벽에 막힌 구간에서는 벽 경계를 따라 이동한다. 셸로 LMB와 일반 회피 반격은 projectile.pierce walls:false + projectile.collision wall:'clamp'를 사용한다. 패리 반격은 projectile.pierce walls:true를 사용해 벽을 관통하며 대상 관통은 false로 유지한다.

3.847: 셸로 방패 패리 갱신/발사음/K.O. 방향을 교정했다. attack.guard의 refreshGuardDuration으로 갱신된 실제 guard.expiresAt 남은 시간을 blockFeedback 교체 shieldSwing의 dur에 반영해 패리 성공 때 보이는 방패도 판정과 함께 처음부터 다시 유지된다. projectile-fired 공통 사운드 경로가 AttackSpec.suppressProjectileFireSound를 존중하도록 수정하고 셸로 LMB/일반 회피 반격에만 true를 부여해 두 공격의 발사음을 제거했으며 패리 반격 투척음은 유지했다. K.O. 방향에는 AttackSpec.koDirectionMode:'attack-direction'을 범용 지원해 투사체 공격이라도 명시된 경우 일반 근거리 히트스캔처럼 execution.directionAngle을 우선한다. 셸로 LMB/일반 반격/패리 반격 모두 이 모드를 사용하므로 범위 투사체 중앙이 아니라 타격자의 공격 방향으로 처치 레이저가 발생한다.

3.846: 충전 반격 저장 구조를 3.843 이전 의미로 복원하면서 스택별 획득량만 증가시키고, 셸로 타격 원점/회피 반격 추적 및 COUNTER WINDOW 표시를 교정했다. counter.stock은 다시 별도 최대 보유량 없이 활성 시간 동안 여러 반격을 계속 보관하며 새 획득 시 전체 활성 시간을 갱신한다. charged_counter는 중첩 가능하고 스택당 acquireBonusPerStack:1을 제공해 저스트 회피/셸로 패리 1회 성공 시 기본 1 + 충전 반격 스택 수만큼 반격 스톡을 얻는다. 각 스톡의 normal/parry 종류 기록과 주황 패리 세그먼트는 유지한다. 셸로 일반 회피 반격 orbit은 anchor:'source'로 복원해 회전 중 셸로를 따라다닌다. 셸로 LMB/일반 반격/패리 반격의 top-level impactOrigin:'source'를 공통 ProjectileService가 읽어 적중 순간 셸로 현재 위치를 피해/KO/CC 타격 원점으로 사용하며 delivery.range-projectile 전용 impactOriginMode 설정은 제거했다. counterWindow는 시간 계산용 내부 modifier로 유지하되 presentationHidden:true를 추가하고 BuffStatusPresentation expanded 목록에서 제외해 COUNTER WINDOW +1000000% 같은 버프 표기가 나오지 않는다.

3.845: 클레아 달 그림자 평타 스테미나 해석 오류 수정. RMB/LMB 추가 전륜은 평타와 별개의 추가 비용이 아니라 달 그림자 활성 중 사용하는 변형 평타 자체를 뜻하므로 attack.clea.lmb-shadow 비용을 일반 평타와 동일한 20으로 복원했다. tooltip의 추가 전륜 항목은 costAttack:'lmb'를 유지해 스테미나 20을 표시하지만 실제 실행에서 기본 평타 20 + 추가 전륜 20을 이중 소모하지 않는다.

3.844: 클레아 추가 전륜 실제 스테미나 비용과 셸로 반격 스톡/패리 디버그/증강 연동을 정리했다. 클레아 달그림자 평타 AttackSpec 비용을 기본 평타 20 + 추가 전륜 20 = 40으로 변경하고 추가 전륜 tooltip은 costAttack:'lmb'로 별도 비용 20을 표시한다. 셸로 LMB/일반 반격의 orbit anchor를 source 추적이 아닌 projectile origin snapshot으로 바꾸고, 셸로 LMB/일반 반격/패리 반격 range projectile에 impactOriginMode:'projectile-origin'을 부여해 피해/KO/away-from-impact CC 기준점을 공격 시작 순간 셸로 위치로 통일했다. CounterStockService는 counter.stock의 capacityBonusPerStack을 합산해 기본 1 + 스택당 1의 저장 한도를 제공하며, 회피/패리 1회당 정확히 1 charge만 추가하고 charge kind(normal/parry)를 LIFO로 보관한다. charged_counter는 nonStackable 제거, 스택당 활성 개수 +1로 변경. 셸로 attack.guard의 패리 획득은 kind:'parry'로 기록하고 counterWindow 버프를 동일하게 더하므로 신중한 반격이 패리 반격에도 적용된다. counter.execute는 소비 전 charge kind를 잠그고 alternateWhen.counterKind로 일반/패리 AttackSpec을 선택해 혼합 스톡에서도 올바른 반격을 사용한다. stock-segments 게이지는 normal=#4af, parry=#ff7620로 개별 segment를 표시한다. 셸로 디버그는 데이터 기반 debugCounterModes로 일반/패리 반격 토글을 따로 제공하며 둘은 상호 배타적이다.

3.843: 클레아 추가 전륜 설명/비용 표기와 셸로 3.0 구현 오류를 정리했다. 클레아 RMB/LMB 추가 전륜은 독립 스테미나 비용이 없는 평타 파생 효과이므로 showCost:false로 표시하고 설명을 '평타와 추가 전륜을 날림'으로 수정했다. 셸로 orbit 범위 투사체는 일반 projectile.travel 사거리 만료에서 제외해 먼 거리일수록 회전각이 일찍 잘리던 문제를 제거하고 orbit 자체 duration에서만 종료한다. 방어자세 shieldSwing은 리안 LMB처럼 캐릭터를 추적하지 않는 생성 시점 snapshot 이펙트로 변경하고 방어 성공 visualState는 주황색 255,118,32로 동일 geometry를 교체한다. 일반 반격 미리보기는 실제 시간 전체 도달 영역인 반경 205.5 원, 패리 반격 미리보기는 실제 552.75×96 직선 범위로 명시했다. 패리 방패 투사체는 기존 셸로 방패와 같은 자주색 시각으로 복원하고, 패리 반격 준비 상태의 반격 활성 링만 주황색으로 표시한다. CounterModuleService.alternateWhen에 선택 Attack별 cc를 범용 지원해 일반 스피닝은 방사형 무력화 넉백, 패리 쉴드 어택은 진행방향 무력화 넉백을 각각 한 번만 적용하며 AttackSpec 내부의 중복 CC 모듈은 제거했다.

3.842: 클레아 사용자 설명 수정. RMB 달 그림자 설명을 '5초 동안 달 그림자를 활성화. 지속시간동안 미적중 또는 모든 달 그림자 소모 시 비활성화'로 변경하고, 별도 RMB/LMB '추가 전륜' 항목을 추가해 '평타 사용 시 추가 전륜을 날림'으로 표기했다. 내부 수치/동작은 변경하지 않았다.

3.840: 클레아 사용자 표기에서 '수리검'을 전부 '전륜'으로 변경했다. 내부 attack id/state key/실행 구조는 변경하지 않았다.

3.839: 범위 증폭 수치를 +25%에서 +20%로 낮추고 설명/attackAdjustment rangeBonus를 함께 0.20으로 통일했다. ability-level effect.spawn에도 기존 AugmentService.prepareAttackLinkedGeometry를 재사용하는 scaleWithAttackRange 경로를 연결했다. effect가 rangeScaleAttackId 또는 requireAttackId로 연결된 실제 범위 AttackSpec을 참조하면 해당 AttackSpec의 범위 증폭 배율을 동일하게 적용한다. 레이카 가호 변신 500ms 진행 원은 attack.reika.gaho-activate를 참조해 실제 180 범위와 함께 확대된다. 메라 모나 변신 600ms 회전 원은 attack.meramona.rmb 내부에서 제거하고 ability.meramona.rmb의 선딜 effect.spawn으로 이동해 attack.meramona.emerge를 참조하므로, 실제 변신 후 170 범위 공격과 동일한 범위 증폭을 받는다. 새 전용 렌더러/게임플레이 모듈은 추가하지 않았다.

3.838: 범위공격 이동기의 범위 증폭과 클레아 태그를 정리했다. 범위 공격 태그를 가진 AttackSpec에 rangeBonus가 적용되고 같은 실행에 movement.move가 있으면 movement distance도 동일 배율로 증가하며, movement-linked effect.spawn의 animation.distance와 top-level previewGeometry도 같은 배율을 사용한다. 따라서 유이 LMB/반격, 레이카 반격처럼 공격 범위와 이동거리가 같은 의미인 이동기는 범위 증폭 시 둘이 함께 증가한다. 단순 이동기에는 적용하지 않는다. 클레아 반격/달그림자 반격은 실제 300x88 swept 범위 이동 공격 의미에 맞게 범위 공격/히트스캔/공격형태 사각 태그를 명시했고, resource.restore의 체력/스테미나 회복 태그를 TagService 공통 파생으로 추가해 클레아 LMB/달그림자 LMB의 스테미나 회복 태그도 실제 모듈에서 자동 파생된다. 클레아 botDrill 반격 FX도 scaleWithAttackRange를 사용해 범위 증폭된 이동/공격 크기와 일치한다.

3.837: 클레아 설명 문구를 사용자 지정 문장으로 교체했다. CharacterDescriptionService는 windowSeconds/progressPercent 값을 이미 계산하고 있었지만 최종 interpolate 정규식 키 목록에서 두 키가 누락되어 `{windowSeconds}`/`{progressPercent}`가 그대로 노출되던 공통 오류를 수정했다. 이제 RMB는 실제 state.window 5000ms에서 5초, 반격은 실제 state.progress 150/300에서 50%를 데이터 기반으로 표시한다.

3.836: 클레아 RMB/반격 시각을 기존 공통 이펙트와 정확히 통일했다. RMB activation areaCircle은 엔소냐 RMB pulse와 같은 geometry/timing인 range 72, r 72, fillAlpha .02, strokeAlpha .44, lineWidth 1.5, duration 220, renderLayer below-entities를 사용하고 색만 클레아 기본색 33,59,90으로 변경했다. 반격은 레이카 일반 반격이 delivery.area 자동 시각으로 생성하는 동일 `botDrill` rect 이펙트(range 300/halfWidth 44/duration 200/default fill·stroke)와 동일 `dash-line`(width 7/alpha .45/duration 220)을 함께 사용한다. 클레아는 실제 피해가 슬라이딩 body-contact 경로이므로 가짜 delivery.area 피해를 추가하지 않고 기존 effect.spawn에서 같은 botDrill renderer를 재사용한다. 달 그림자 ON/OFF는 모든 시각 수치를 동일하게 유지하고 색만 #213b5a / #87c3f5로 구분한다.

3.835: 클레아 반격/링 배치 수정. EntityRingLayoutService.worldArcGaugeState가 기존에는 timed-action/projectile형 gauge.arc만 점유 링으로 인식하고 progress/progress-timed-remaining형을 무시해 클레아 호와 상태/반격 링이 겹치던 원인을 수정했다. 이제 gauge.arc의 conditions를 동일하게 검사하고 progress 및 progress-timed-remaining 값도 실제 ratio로 계산해 호 게이지/점멸링 슬롯을 공통 링 배치가 정상 점유한다. 클레아 반격의 커스텀 previewStyle은 일반/달그림자 양쪽에서 제거해 공통 반격 미리보기 색을 사용한다. 실제 돌진 이펙트는 레이카 반격과 동일한 dash-line 규격으로 맞춰 일반 상태 width 7/alpha .45, 달그림자 상태는 레이카 가호 반격처럼 width 8/alpha .52를 사용하며 각각 클레아 기본색/달그림자색만 적용한다.

3.834: 클레아 반격 폭/상태색 수정. 레이카 반격의 실제 delivery.area 폭인 halfWidth 44(전체 88)를 기준으로 클레아 previewGeometry도 halfWidth 44로 변경하고, effect animation body-contact에 범용 damage.contactRadius를 추가해 실제 슬라이딩 판정도 중심 경로 기준 44px 반경으로 맞췄다. 달 그림자 OFF용 attack.clea.counter는 #213b5a, ON용 attack.clea.counter-shadow는 #87c3f5의 presentation/previewStyle/dash-line을 사용하며 counter.execute.alternateWhen으로 활성 상태를 판정해 선딜 미리보기와 실제 반격이 같은 AttackSpec을 사용한다.

3.833: 클레아 달 그림자 호/상태 갱신 수정. Clea의 두 gauge.arc에서 임의 radius 30/lineWidth 3.5를 제거해 다른 Duels 3 호 게이지와 동일하게 EntityRingLayoutService.chargeRadius 및 기본 3px 선폭을 사용한다. on-hit 모듈의 `conditions`가 AttackModuleService.hitConditionMatches에서 검사되지 않던 공통 버그를 수정해, 달 그림자 비활성 상태의 평타 적중이 state.window를 새로 열지 않으며 활성 중 적중만 5초 타이머를 갱신한다. 최대 충전 점멸링은 총량 호가 계속 담당하되 completePulseColorVariants를 범용 지원해 비활성 시 어두운 호 색 #1a314f, 달 그림자 활성 중에는 밝은 호 색 #87c3f5를 사용한다.

3.832: 클레아 달 그림자 게이지/유지 조건 수정. 호 게이지는 기존 Duels 3의 gauge.arc/ArcGaugePresentationService를 그대로 사용한다. 기본 달 그림자 총량은 반경 30의 어두운 호로 표시하고, 활성 중에는 같은 반경에 두 번째 밝은 호를 겹친다. 새 범용 valueRef `progress-timed-remaining`은 현재 progress 비율 × timed-action 남은 비율을 반환해 밝은 호가 현재 달 그림자 총량을 절대 넘지 않으면서 마지막 적중 후 5초에 걸쳐 감소하도록 한다. 3.831의 별도 gauge.bar는 제거했다. 5초 타이머 갱신은 character damage-dealt 우회 경로를 제거하고 이미 존재하던 AttackModuleService의 `state.window when:on-hit` 공통 경로를 LMB/달그림자 LMB/반격에 직접 사용해 실제 적중 순간 확실히 5초로 재개방한다. 달 그림자 추가탄 발사 후 게이지가 추가탄 비용 4 미만이면 즉시 활성 상태를 종료하며, RMB 활성 직후에도 게이지가 4 미만이면 바로 종료한다.

3.831: 클레아 달 그림자 유지 규칙과 기존 시각을 복원했다. RMB 비용은 700으로 변경했다. clea-moon-shadow timed-action-state는 절대 지속시간이 아니라 5초 비전투 종료 타이머로 사용하며, 활성 중 적에게 실제 피해를 주면 character damage-dealt Trigger가 같은 state.window를 5초로 갱신한다. 게이지를 추가 수리검으로 모두 소모하면 같은 AttackSpec의 후처리에서 즉시 state.window를 clear한다. 따라서 게이지 0 또는 5초 무적중, 사망 외에는 달 그림자가 종료되지 않는다. 달 그림자 충전 호는 비활성 시 #1a314f, 활성 시 기존 파일의 밝은 #87c3f5와 glow를 사용하고 최대 충전 점멸링을 유지한다. 5초 무적중 타이머는 worldGauge gauge.bar로 표시해 밝은 채움이 남은 시간에 따라 감소한다. 추가 수리검은 기존 파일과 동일한 반경 14.08/색 #87c3f5를 사용하도록 delayed-projectile-volley의 perShotProjectileOverrides를 범용 확장했으며 기본 수리검은 반경 18/#213b5a를 유지한다.

3.830: 클레아 후속 정리. 달 그림자 충전량은 gauge.arc progress ratio로 캐릭터 주변 호 게이지에 표시하고 완충 시 공통 maxChargeFlash 점멸링을 사용한다. 달 그림자 활성 시간은 별도 바깥 호에서 클레아 색 #213b5a로 timed-action-remaining 값을 표시해 5초 동안 감소한다. LMB 일반탄과 달 그림자 추가탄은 모두 diamond 특수 투사체 표현을 사용한다. 달 그림자 활성+게이지 4 이상에서는 별도 TriggeredAttack이 아니라 하나의 attack.clea.lmb-shadow AttackExecution 안에서 좌우 2발을 동시에 생성하고 hit.once-per-execution을 사용해 같은 대상이 두 발에 모두 맞아도 피해/스테미나 회복/달 그림자 충전이 한 번만 적용된다. 추가탄 발사 후 게이지 4를 차감한다. 3.829에서 클레아만을 위해 확장했던 action.trigger-attack conditions/progressConsume 경로는 더 이상 필요하지 않아 3.828 canonical 구현으로 복원했다. 반격 preview는 실제 피해 모듈을 추가하지 않고 AttackSpec.previewGeometry의 300x38 rect를 AttackPreviewService가 읽도록 범용 확장해 기존 슬라이딩 폭과 일치시켰다. 클레아 프로필/스킬 설명은 기존 듀얼즈 문구와 동일하게 복원하고 windowSeconds/progressPercent 데이터 치환을 추가했다.

3.829: 기존 듀얼즈 기준 클레아를 Duels 3 공통 구조로 구현했다. 체력 1000/이속 4.25/색 #213b5a, Base Damage 60을 사용한다. LMB 달 수리검은 요청대로 weapon/special 전용 렌더가 아닌 일반 delivery.projectile이며 비용 20, 피해 60, 사거리 676, 탄속 31.68, 반경 18, 쿨다운 50ms다. 이동거리 82/90/96%에서 탄속 12.96/5.04/1.152로 감소하도록 delivery.projectile.speedStages를 범용 확장했고 적중 시 스테미나 60과 달 그림자 게이지 6을 회복/충전한다. RMB 달 그림자는 비용 350, 5초 지속, 쿨다운 300ms이며 활성 중 LMB마다 게이지 4를 소모할 수 있으면 반대 평행 레인에 추가 일반 투사체를 같은 프레임 발사한다. 기존 action.trigger-attack에 conditions/progressConsume 옵션을 범용 확장해 별도 클레아 전용 실행 모듈은 추가하지 않았다. 반격 슬라이딩은 300ms 선딜 후 300px/220ms 이동하면서 body-contact swept 피해 200과 무력화 넉백을 적용하고 달 그림자 게이지 150을 충전한다.

3.828: 레테/엘린 지원 타격 후속 수정. 아군에 실제 적중하는 delivery.projectile/area 지원 경로에서도 기존 공통 SoundService의 `hit` 효과음을 호출해 레테 우편함 우편, 레테 LMB, 엘린 LMB 회복 적중에 타격 효과음이 재생되도록 했다. 레테 recipientSelection은 preserveExistingOnMiss:true를 사용해 이미 유효 수취인이 있는 상태에서 RMB 선택 원에 아무 대상도 없으면 기존 수취인을 유지하며, 최초 설치/기존 수취인 무효 시에만 fallback:'self'를 사용한다. pathfinding wallSafeSteering은 안전한 보정각을 찾지 못했을 때 속도를 0으로 멈추던 처리를 제거해 계산된 선회각으로 그대로 진행하고 실제 projectile 벽 충돌 경로에서 소멸하게 했다. 수취인 선택 반경은 대상 중심점이 아니라 원-Entity 원형 겹침으로 판정해 선택 원에 대상 반지름이 조금이라도 걸치면 후보가 된다.

3.827: 레테 우편 경로/이펙트 후속 수정. pathfindingTarget에 wallSafeSteering/wallLookahead/wallCorrectionTurnPerFrame 범용 옵션을 추가했다. 레테 우편은 일반 0.08rad/frame, 근접 최대 0.22rad/frame 유도를 유지하되 현재 선택 각도로 일정 거리 전진했을 때 벽 충돌이 예상되면 waypoint 방향 쪽으로 최대 0.18rad/frame 범위에서 추가 보정해 안전한 각을 우선 선택하고, 안전한 각을 찾지 못하면 해당 프레임 이동을 멈추고 경로 재계산을 요청한다. 수취인 지정 이펙트는 RMB 사용 때마다 한 번 생성되는 독립 areaCircle로 유지하면서 10프레임→450ms로 늘려 다른 일반 범위공격 이펙트처럼 충분히 보이게 했다. 우편 획득 이펙트는 짧은 r:0 설정을 제거하고 delivery.projectile.supportHitEffect의 동일 EffectSpec을 아군 지원 투사체 실제 수령 순간 직접 effect.spawn 경로로 생성하도록 바꿔 확실히 표시한다.

3.826: 레테 후속 조정. 우편함 우편 pathfindingTarget에 nearTurnRange/nearMaxTurnPerFrame을 추가해 먼 거리에서는 기존 0.08rad/frame으로 완만하게 선회하고 수취인 220px 이내에서는 거리에 비례해 최대 0.22rad/frame까지 유도가 강해지도록 했다. 수취인 지정 원형 이펙트는 미리보기형 점선이 아니라 일반 범위공격과 같은 채움 0.25/윤곽 0.95/2px의 짧은 areaCircle 이펙트로 변경했다. 레테 LMB에도 friendlyRequiresResource:'stamina'를 적용해 최대 스테미나가 없는 아군은 평타 우편을 수령하지 못한다. 우편함 AI와 recipientSelection 모두 같은 friendlyRequiresResource:'stamina' 기준을 명시한다. 우편함 소환수 baseDamage를 50으로 지정하고 mailboxMail을 damageRatio 1의 실제 공격으로 바꿔 적 수취인에게 탄당 50 피해가 적용되며 아군은 기존 지원 충돌 경로로 피해 없이 스테미나 10%만 회복한다. RMB 비용은 750으로 감소했다. mailboxMail on-hit에 hit-target 중심의 짧은 우편 수령 areaCircle 이펙트를 추가했다.

3.825: 레테 조정. LMB Base Damage를 50으로 낮춰 타당 피해 50, 비용을 250으로 변경하고 반격 피해 200은 ratio 4로 보존했다. 수취인 선택 반경은 160→40으로 축소했으며 player 전용 targetKinds 제한을 제거해 봇/더미/소환수도 관계 조건에 따라 후보가 된다. 단 excludeOwnSummonStateKey:'mailbox'로 자기 우편함은 수취인으로 지정할 수 없고, 유효 후보가 없으면 fallback:'self'로 레테 자신을 기본 수취인으로 지정한다. 상시 수취인 범위 프리뷰는 제거하고 recipientSelection.selectionEffect를 통해 RMB 사용 순간 마우스 중심 반경 40 원형 이펙트만 표시한다. 우편함 우편의 일반 투사체 시각은 유지하며 별도 회전 렌더는 사용하지 않는다. 지원 우편은 friendlyRequiresResource:'stamina'를 사용해 적이 아닌 대상은 최대 스테미나가 있어야 수령할 수 있으므로 스테미나가 없는 아군 소환수가 우편을 가로채지 않는다.

3.824: 레테 우편 관련 공통 판정/경로/프리뷰를 교정했다. 저스트 회피 투사체 판정은 적대 관계(enemy)에만 허용해 아군 레테 우편함 우편과 아군 적중형 레테 평타가 저회 후보가 되지 않도록 했고, 같은 규칙이 다른 지원 투사체에도 공통 적용된다. 우편함 우편은 별도 mail-envelope 투사체 렌더를 제거하고 일반 투사체 렌더를 사용한다. pathfindingTarget은 waypoint 방향으로 즉시 꺾지 않고 maxTurnPerFrame만큼 현재 진행각에서 매 프레임 회전하는 범용 steering을 지원하며 레테 우편에는 0.08rad/frame을 사용한다. 수취인 선택은 마우스 중심 반경 160 원 안에서 가장 가까운 유효 플레이어를 고르며 같은 원을 월드에 점선 미리보기로 표시한다. 일반 projectile K.O. 방향은 충돌점-대상 중심 벡터가 아니라 실제 projectile impact.angle을 우선해 다중/평행 투사체의 레이저 방향이 흔들리지 않도록 했다.

3.823: 레테 후속 조정. 우편함 우편은 사거리 1400, 1초 발송 주기, 2발 순차 발사를 유지하되 오른쪽(+20)→왼쪽(-20)에서 발사하고 visualWave DNA 이동을 제거했다. 우편함 우편 프레젠테이션은 이모지가 아닌 선으로 그리는 mail-envelope 형상과 고정 각속도 회전을 사용한다. 수취인 경로 점선 표시는 제거하고 수취인 표식은 체력바 오른쪽으로 이동했으며, 표식 색은 해당 우편함 소유자의 팀 색을 사용한다. 레테 LMB는 비용 300/타당 100을 유지하고 공격 후딜을 500ms로 지정하며 좌/중앙/우/중앙 횡오프셋을 -20/0/20/0으로 조정했다. RMB 수취인 변경이 일반 ability.pending-ready에 막히던 구조를 제거해 설치 중에는 RMB 입력 즉시 수취인을 다시 지정할 수 있게 했다. 우편함 우편은 수취인 사망 시 재지정하며 벽 충돌/수취/최대 이동거리 1400 외의 임의 수명 만료는 두지 않는다.

3.822: 레테 리메이크 후속 조정. 수취인은 자신/아군/적 플레이어 모두 지정 가능하며 온라인에서도 참가자 PID 기반 안정 참조를 사용한다. 우편함은 1초마다 지원 공격을 실행하고 한 번에 우편 2통을 180ms 간격으로 순차 발송한다. 각 우편은 아군 수령 시 최대 스테미나 10%를 회복하며, 지정 수취인만 수령하고 수취인 사망 시 가장 가까운 유효 플레이어로 재지정한다. 경로탐색 투사체의 실제 충돌 경로는 그대로 유지하면서 visualWave 옵션으로 두 우편이 서로 반대 위상의 사인 곡선을 그려 DNA 형태로 보이도록 했다. 수취인 연결은 소환수 recipientPresentation 데이터로 HUD 및 월드 체력바 왼쪽 우편 표식과 월드 점선 경로를 공통 렌더한다. 평타는 baseDamage 100/타당 100, 비용 300으로 변경하고 좌/중앙/우/중앙 발사 오프셋을 -28/0/28/0으로 넓혔다.

3.821: 레테를 전면 리메이크해 전투 캐릭터로 구현했다. Duels 3의 10배 체력/피해 스케일에 맞춰 레테 체력 1100, 우편함 체력 900을 사용한다. LMB는 우편 4통을 좌→중앙→우→중앙 순서로 시간차 발사하고 적에게 피해, 아군 적중 시 스테미나를 회복한다. RMB는 조준 위치에 가장 가까운 자신/아군을 수취인으로 확정하며 현재 위치에 우편함을 설치하고, 설치 후 재사용은 우편함을 회수하지 않고 수취인만 다시 지정한다. 우편함은 2초마다 수취인에게 일반 투사체 우편을 발사하며 GridPathfindingService 경로를 따라 벽을 우회하고 벽을 관통하지 않는다. 수취인이 사망하면 가장 가까운 자신/아군으로 자동 재지정한다. 반격은 우편함이 설치돼 있으면 기존 체력을 보존한 채 회수/휘두르기 후 레테 위치에 다시 설치하고, 미설치 상태에서는 휘두르기만 한다. 소환수 파괴 후 7초 재사용 제한을 사용한다. 기존 delayed-projectile-volley에 perpendicularOffsets 배열, delivery.projectile에 targetRelations/applyHitEffects/pathfindingTarget 옵션, summon.toggle에 recipientSelection, summon.spawn에 requireActive를 범용 확장했으며 별도 레테 전용 전투 모듈은 추가하지 않았다.

3.820: 미아루키 회복지대 설명에 표시되던 `REGEN 회복` 표현을 사용자 표기용 `회복`으로 변경했다. 내부 regeneration 버프 이름과 실제 회복 수치/주기/동작은 변경하지 않는다.

3.819: 미아루키 RMB 회복지대 설명의 `재생 부여` 표현을 실제 공통 regeneration 표기와 맞춰 `REGEN 회복`으로 변경했다. 반격의 즉시 체력 회복 설명과 실제 회복 수치/주기/동작은 변경하지 않는다.

3.818: 베르 RMB 로켓 가속의 재사용 가능 기준을 최대 비행거리 30%에서 20%로 변경했다. 실제 projectile.progress-ratio-gte 조건과 월드 호 게이지 completeAt을 모두 20%로 맞췄으며 로켓의 사거리/쿨다운/가속/피해는 변경하지 않는다.

3.817: 캐릭터 선택 화면의 키보드 조작 기능을 전부 제거했다. CharacterCardKeyboardNavigationService와 전역 keydown 연결을 삭제해 WASD/방향키 카드 이동, 라운드 준비 진입 1초 키보드 잠금, 스페이스바 선택 취소가 더 이상 동작하지 않는다. 마우스 카드 클릭 선택/취소와 기존 온라인 preview 로직은 유지한다.

3.816: 코녕 RMB(attack.konyeong.rmb) 실제 피해량을 150으로 조정했다. baseDamage 150 기준 damageRatio를 1로 변경했으며 범위/선딜/스테미나/기타 효과는 유지한다.

3.815: 자동공격이 선딜레이가 있는 평타를 일반 Ability 경로로 실행하면서 preview/ability.lock/timing.delay 및 delivery.area.delay를 그대로 적용하던 문제를 수정했다. action.basic-attack은 skipAttackWindup 컨텍스트를 사용하고, 실제 공격 실행 전의 선딜 모듈과 delivery.area 최초 delay만 생략한다. 반복 타격 간격/공격 후 delay는 유지하며 온라인 duel-action/duel-triggered-attack에도 동일 플래그를 동기화한다.

3.814: 메라 모나 스킬(attack.meramona.rmb)의 스테미나 비용을 0으로 변경했다. 평타/단계별 공격/기타 수치는 유지한다.

3.813: 펠루나 강화 1·2단계 능력 순서를 교체했다. 누적 강화 구조를 유지해 1단계는 선딜레이 제거, 2단계는 선딜 제거 상태에서 내부 범위까지 피해, 3단계는 기존 피해 증가를 추가한다. 펠루나 기본/1~3단계 평타 스테미나 비용을 모두 250으로 통일하고, 모루 던지기 attack.peluna.rmb는 baseDamage 200 기준 damageRatio 1로 조정해 실제 피해 200으로 변경했다.

3.812: triggerOnEnter:false인 field.area가 첫 피해 틱뿐 아니라 onTrigger CC까지 interval 뒤로 미루던 공통 문제를 수정했다. InstalledAreaFieldService는 대상의 신규 진입을 감지하면 COMBAT_STATUS_DEFS.kind==='cc'인 status.apply만 즉시 실행하고, 이 진입 CC는 markTriggered/lastTriggerAt을 소비하지 않아 피해·회복 등 일반 field tick은 기존 interval 이후 처음 발생한다. 이후 정상 tick에서는 기존 onTrigger 전체가 그대로 실행되어 CC가 갱신된다.

3.811: 캐릭터 카드 키보드 방향 탐색이 단순 거리 가중치로 후보를 고르면서 세로 이동 중 인접 열 카드가 번갈아 선택되어 아래키 홀드 시 좌우로 흔들리던 문제를 수정했다. 실제 카드 중심좌표에서 행/열 정렬 오차 허용값을 계산하고, 상/하는 같은 열 후보를 우선하며 없을 때만 가장 가까운 열로, 좌/우는 같은 행 후보를 우선하며 없을 때만 가장 가까운 행으로 이동한다. 열 수는 하드코딩하지 않는다.

3.810: 라운드 준비(#scr-between) 진입 직후 이전 라운드의 이동키 홀드/연타가 캐릭터 카드 선택으로 이어지는 것을 막기 위해 CharacterCardKeyboardNavigationService가 화면 진입 시각을 기록하고 1000ms 동안 WASD/방향키 카드 이동을 소비만 하도록 했다. 스페이스바는 라운드 준비에서 현재 선택된 캐릭터 카드가 있을 때 기존 카드 click 토글 로직을 재사용해 선택을 취소하고 팀 캐릭터 preview도 함께 해제한다. 새 전역 keydown은 추가하지 않는다.

3.809: 제리 RMB C4 폭발이 단순 넉백이어야 하는데 movement.neutralize-knockback을 사용해 무력화까지 함께 부여하던 문제를 수정했다. C4 폭발의 거리 비례 넉백 수치와 방향은 유지하고 모듈만 movement.knockback으로 교체했다. 제리 반격의 무력화/넉백은 변경하지 않는다.

3.808: 메이실 RMB tapered-rect의 AreaGeometryService.polygon()에서 존재하지 않는 target 식별자를 rayDistance 호출 인자로 평가해 런타임 ReferenceError가 발생하며 스킬 실행이 중단되던 문제를 수정했다. rayDistance는 원래 source geometry만 필요하므로 잘못된 추가 인자를 제거했다. 또한 로컬에서 preview cooldown에 의해 중단된 입력도 Ability에 timing.delay가 정적으로 존재한다는 이유만으로 duel-action이 전송되어, cooldown 검사를 생략하는 canonical networkReplay에서 인투 공격이 상대 화면에 연사되던 문제를 수정했다. timing.delay가 실제로 예약된 경우에만 context.deferredExecution을 기록하고 Training.use는 실제 실행 또는 실제 예약된 지연 실행만 네트워크에 전송한다.

3.807: 캐릭터 카드 선택 화면에서 WASD/방향키로 선택 카드를 이동할 수 있도록 기존 전역 keydown 경로에 CharacterCardKeyboardNavigationService를 연결했다. 열 수를 하드코딩하지 않고 실제 카드 화면 좌표를 기준으로 상/하/좌/우의 가장 가까운 선택 가능 카드를 찾으며, 기존 카드 click 선택 로직을 그대로 재사용해 온라인 preview/라운드 사이 캐릭터 변경과 상태를 동일하게 유지한다.

3.806: 공통 화염(BURN)은 이미 최대 체력 2%/0.5초인데 레이카의 화염 부여 5곳에 구버전 data.ratio:.05가 직접 남아 공통값을 덮어쓰던 문제를 수정했다. 레이카의 burn status.apply에서 ratio/interval 직접 지정을 제거해 COMBAT_STATUS_DEFS.burn.defaults를 그대로 사용하며, 각 화염의 기존 duration과 tickAtEnd/stackMode는 유지한다.

3.805: 셰리나 비아의 스킬 에코도 평타 에코와 동일하게 진입 즉시 피해를 주지 않도록 field.area의 triggerOnEnter를 false로 통일했다. 에코 지속시간과 기존 반복 틱 간격은 유지하며 첫 피해는 해당 tickInterval 경과 후 발생한다.

3.804: 타다타 피해 장판, 소르 정전기장, 셰리나 비아 LMB 에코의 field.area triggerOnEnter를 false로 변경해 범위 진입 즉시 피해가 발생하지 않도록 했다. 각 필드는 기존 interval(타다타 1000ms, 소르 1000ms, 셰리나 LMB 에코 500ms)을 유지하며 첫 피해는 범위 안에 해당 시간만큼 머문 뒤 발생한다.

3.803: 소르 감전→방전 적용 순서를 복구하면서도 방전 조건은 현재 타격의 감전 적용 이전 상태만 보도록 범용 target.status-active-before-hit 조건을 추가했다. AttackModuleService.onHit 진입 시 해당 조건이 참조하는 상태를 대상별로 먼저 스냅샷하고, 이후 status.apply 실행 순서와 무관하게 그 스냅샷을 사용한다. 소르 LMB/반격은 zap을 먼저 적용한 뒤 pre-hit zap이 있었던 경우에만 discharge를 적용한다.

3.802: 소르 LMB/반격에서 같은 AttackExecution 안에 새로 적용한 zap이 곧바로 target.status-active 조건을 만족해 첫 타부터 discharge가 발생하던 문제를 수정했다. 소르의 상태 모듈 순서를 기존 zap→discharge에서 discharge 조건 검사→zap 적용으로 변경해, 공격 이전부터 이미 감전된 대상에게만 방전이 발동하고 현재 타격의 감전은 이후 타격용으로 남도록 했다. 새 조건/모듈은 추가하지 않는다.

3.801: 타다타 RMB의 벽 목표점 보정을 기존 wallSnapDistance 방식에서 엘린 LMB와 동일한 범용 targetPointResolve:'nearest-open' 방식으로 변경했다. 목표점이 벽/월드 경계 내부면 WorldGeometryService.nearestOpenPoint()로 가장 가까운 유효 공터 좌표를 확정한 뒤 발사하며, 기존 wallSnapDistance:50은 제거했다.

3.800: 레이카 평타 피해를 100으로 변경하는 과정에서 baseDamage만 낮추고 다른 damageRatio를 재환산하지 않아 전체 피해가 변한 문제를 수정했다. 3.797을 기준으로 재작성해 baseDamage=100, 일반 LMB=100, RMB 저리가!=100으로 변경하고, 가호 평타/가호 발동/강하/반격 계열은 3.797의 실제 피해량을 그대로 유지하도록 ratio를 100 기준으로 재환산했다. 일반 LMB 스테미나 150, 저리가! 넉백 180도 유지한다.

3.797: 레이카의 피해 기반 태양의 가호 충전량을 50 피해당 1.5 게이지가 되도록 amountScale 0.075→0.03으로 조정했다. 일반 RMB `저리가!`의 기존 넉백 거리 140은 유지한다.

3.796: 제리 반격 폭발 점프의 실제 movement XY는 원격에 동기화되지만 trajectory.arc가 movementAbility snapshot에 포함되지 않고 MovementAbilityService.presentation도 로컬 actionState만 읽어 상대 화면에서 공중 점프 시각이 빠지던 문제를 수정했다. movementAbility serialize/applyRemote에 범용 trajectory 데이터를 포함하고 presentation이 원격 권위 movement state의 elapsed/duration으로 동일 ArcTrajectoryService를 샘플링하도록 통일했다.

3.795: 타다타 RMB target-point 투사체에 기존 arrival.wallSnapDistance:50 벽 보정 경로를 적용해 벽을 지정했을 때 착탄 지점을 가장 가까운 유효 벽 외곽점으로 보정한다. 소르 RMB 정전기장과 field-tick의 wallPolicy를 ignore→block으로 통일해 장판 피해/감전 판정이 벽 너머 대상에게 적용되지 않도록 수정했다.

3.794: 키 예고 실행/기만의 forecastStrike에서 중앙으로 수축하는 점선 원 연출을 제거했다. 공통 areaCircle forecastStrike에 showContractingCircle 플래그를 추가하고 키의 두 후속 이펙트에서 false로 지정해 진행 게이지/페이드/실제 판정은 유지한다.

3.793: fieldStateKey를 사용하는 alternate 공격의 온라인 재생에서 송신자가 보낸 canonical targetPoint를 delivery.area.centerPoint에 다시 주입하지 않아 키 예고 실행이 상대 권위 화면에서 키 본인 위치 중심으로 판정될 수 있던 문제를 수정했다. action.attack 네트워크 재생도 resolvedAttackId와 일치하는 alternate의 fieldStateKey를 식별하고, payload targetPoint를 실제 area centerPoint에 적용해 로컬/원격 판정 중심을 동일하게 유지한다.

3.792: 에라 파비 캐릭터 데이터에 누락된 styleLabel을 추가해 카드의 스타일 표기를 복구했다. 소르 반격은 정적 effectShape rect가 현재 렌더 경로에서 표시되지 않던 문제를 제거하고, 실제 delivery.area의 공통 자동 사각 이펙트를 사용하도록 render:false 및 중복 custom effect.spawn을 제거했다.

3.791: 룰리 상시 줄자 geometry가 prepared delivery.area의 wallPolicy를 무시하고 항상 벽 raycast로 centerDistance를 잘라 관통샷 상태와 표시가 불일치하던 문제를 수정했다. wallPolicy:'ignore'인 prepared 평타는 실제 centerDistance를 그대로 사용한다. 키 예고 실행/기만의 후속 areaCircle 이펙트가 범위 증폭과 연결되지 않아 예고장 본체와 크기가 달라지던 문제를 수정했다. forecast-execute 이펙트는 scaleWithAttackRange로 실제 delivery와 동일 배율을 사용하고, deceive는 범위 공격 태그를 선언해 같은 증강 배율을 시각 geometry에 적용한다.

3.790: 과충전 공격 증강의 이모티콘이 배속과 겹치던 문제를 수정해 🔋에서 🔌로 변경했다.

3.789: 원인 추적이 끝난 NET-COMBAT 진단 로깅을 비활성화했다. NetCombatTraceService는 호환용 no-op으로 유지해 기존 진단 호출부가 전투 로직에 영향을 주지 않도록 하고, 콘솔 출력/엔트리 수집/시작 안내 메시지를 제거했다.

3.788: 레이즈 multi-click.attack의 실제 300ms 방출을 각 클라이언트가 독립 재생하던 구조를 수정했다. 온라인에서는 source 권위 클라이언트만 AttackService.execute로 실제 방출을 확정하고, 그 AttackExecution/확정 AttackSpec/발동 sourceX/Y/angle을 기존 duel-triggered-attack 경로로 방송한다. 원격 multi-click 타이머는 차징 상태와 preview만 정리하며 공격을 생성하지 않는다. AttackService에는 선택적 broadcastTriggeredAttack 옵션을 추가해 기존 비용/쿨다운/attack-fired 의미를 유지한 채 TriggeredAttackService의 기존 재생 경로를 재사용한다. 3.787의 고빈도 movement 진단 로그는 제거했다.

3.787: 레이즈를 시작 캐릭터로 사용하고 RMB/회피/벽 접촉 없이 LMB만 사용해도 원격 플레이어 공격이 간헐적으로 defer되는 원인을 확정하기 위한 진단 빌드. MovementAbilityService.start/applyRemote/serialize(active)와 AttackService defer-check에 movement stateKey/defer/remaining 및 start 호출 스택을 기록한다. 게임 동작은 변경하지 않는다.

3.786: 온라인 디버그 캐릭터 변경이 캐릭터/스탯만 교체하고 기존 actionState/movement/forcedMotion/wallDeferredAttacks/attackPreview/counter 상태를 남기던 문제를 수정했다. DebugManipulationService.setCharacter는 일반 Training.changeCharacter와 같은 기존 Training.clearCharacterRuntime 경로를 재사용한 뒤 transient combat state를 초기화한다. MovementAbilityService.clear도 _remoteMovementEffectState를 함께 제거해 clear 이후 과거 이동 snapshot이 새 캐릭터에 잔존하지 않는다.

3.785: 레이즈 RMB 이동 중 공격을 보류하던 deferAttacksUntilEnd 설정을 제거했다. 레이즈는 RMB 이동 중에도 평타/일반 공격을 즉시 사용할 수 있으며, WallOverlapAttackDeferService의 공통 구조와 다른 캐릭터의 defer 정책은 변경하지 않는다.

3.784: NET-COMBAT 로그에서 일반 공격이 movementDefer=true로 실제 보류되는 것을 확인했다. 원격 movement snapshot은 endsAt을 갖고 있음에도 MovementAbilityService.state/active/deferAttacks가 _remoteMovementAbilityActive boolean만 신뢰해 종료시간이 지난 상태도 영구 active/defer로 남을 수 있었다. remoteStateActive를 추가해 endsAt을 공통 수명 기준으로 사용하고, applyRemote는 active:true라도 remaining<=0이면 즉시 inactive로 정규화하며, serialize도 endsAt이 지난 local state를 active로 송신하지 않는다.

3.783: 3.782 이동기 defer 수정이 실제 증상을 해결하지 못해 폐기하고 3.780 진단 기준으로 복귀했다. 공격 로직은 변경하지 않고 ability-release payload, AttackService 진입/prepare/defer/deliver/exit, AttackModuleService delivery dispatch를 세분화해 특정 원격 플레이어의 일반 공격이 정확히 어느 return/분기에서 사라지는지 추적한다.

3.780: 특정 플레이어의 기본 duel-action 경로가 끊기는 위치를 확정하기 위한 진단 빌드. 게임 동작은 변경하지 않고 [NET-COMBAT] 로그만 추가한다. duel-action 송신/수신/거절, AbilityService 활성화, networkReplay AttackService, projectile spawn, area execute, DamagePipeline 관계 거절을 추적하며 duels3NetTraceDump()/duels3NetTraceClear()를 제공한다.

3.778: 특정 플레이어가 반격 사용 후 투사체가 원격 화면에 생성되지 않고 히트스캔도 판정되지 않으며 field 장판만 정상인 공통 네트워크 오류를 수정했다. duel-action의 actionSequence와 duel-counter-resolve의 counterSequence가 같은 lastRemoteActionSequences를 공유해 서로 다른 시퀀스를 비교하던 것이 원인이었다. counter resolve 전용 lastRemoteCounterResolveSequences/lastRemoteCounterResolveSequence를 분리하고 라운드 초기화도 독립 처리한다. 3.777에서 증상 우회를 위해 추가했던 메인마드/레이즈 networkCommitReplay 경로는 제거하고 기존 단일 공통 action 복제 구조를 유지한다.

3.776: 룰리 범위 증폭 시 실제 prepared delivery.area와 상시 미리보기/거리조절 강조/반격 단계 FX가 서로 다른 128x72 원본 geometry를 사용하던 문제를 제거했다. RuliRulerPresentationService는 현재 단계 AttackSpec을 AugmentService.prepareAttack()한 뒤 실제 rect range/halfWidth/centerDistance를 단일 geometry 원본으로 사용한다. 따라서 상시 타격 박스, 줄자 눈금 끝, 단계 변경 강조 모두 범위 증폭 후 크기와 일치한다. steppedRewind 단계 FX도 prepared counter delivery의 실제 halfWidth*2/range를 직접 사용해 반격 타격 FX까지 동일하게 확대된다.

3.775: 룰리 rulerStrike FX가 범위 증폭으로 prepare된 delivery.area의 실제 rect geometry를 사용하도록 syncAreaRectGeometry를 추가했다. targetFromAreaCenter와 함께 prepared area의 centerDistance/range/halfWidth를 동일 원본으로 읽어 FX 타격 네모는 strikeLength=halfWidth*2, strikeWidth=range가 된다. 따라서 범위 증폭 시 실제 판정 160x90과 룰리 평타 FX도 정확히 같은 160x90으로 확대되며 단계 중심거리는 기존 규칙대로 유지된다.

3.774: 룰리 RMB 거리조절 AttackSpec에 presentation.suppressAttackFeedback을 추가하고 공통 attack-fired 피드백 경로가 이를 존중하도록 해 우클릭 거리조절 시 공격 스퀴시를 발생시키지 않는다. steppedRangeSpan 반격 미리보기는 기존 기본 preview.parts를 명시적으로 비워 계산한 source.radius 시작 rect만 렌더한다. 룰리 반격 delivery.area에는 visual:false를 적용해 각 되감기 단계마다 생성되던 공통 중심기준 area FX를 제거하고, 실제 rulerCounterStrike 단계 FX만 남겨 1단계 앞 중복 난사를 제거한다.

3.773: 룰리 LMB rulerStrike의 단계 고정 tx/ty가 마지막 targetPoint 처리에서 마우스 좌표로 덮어써지던 공통 effect.spawn 버그를 수정해, 이미 명시 좌표가 있는 FX에는 targetPoint가 덮어쓰지 않게 했다. 룰리 평타/반격 ruler FX는 생성 순간 source.radius를 startDistance로 저장해 로컬/원격 모두 캐릭터 테두리부터 시작한다. steppedRewind 실행 중 progress 단계 변경은 RMB rulerAdjust 강조를 발생시키지 않도록 범용 rewind active 상태를 노출하고 룰리 presentation이 이를 제외해 1단계 쪽 중복/난사 FX를 제거한다.

3.772: 룰리 평타 FX의 타격 중심을 별도 distance/마우스 좌표가 아니라 실제 실행된 단계 AttackSpec의 delivery.area.centerDistance에서 직접 계산하도록 effect.spawn targetFromAreaCenter를 추가했다. 평타/반격 공격 FX의 줄자 윤곽과 강한 눈금은 source.radius부터 시작하며 끝 타격 네모는 확대 없이 실제 크기로 고정 표시한다. 룰리 반격 판정/미리보기/FX 크기를 평타와 동일한 128x72(halfWidth 64)로 통일하고 반격 긴 미리보기 시작점도 source.radius부터 시작한다.

3.771: 룰리 LMB rulerStrike FX는 마우스 좌표/거리와 분리해 각 단계 AttackSpec의 centerDistance를 실제 실행 angle에 고정한 fixedDistanceTarget으로 생성한다. 룰리 상시 타격 미리보기는 다른 공격 미리보기처럼 색 채움 없이 흰 점선 외곽만 사용한다. RMB 홀드 호게이지는 룰리 presentation의 직접 렌더를 제거하고 ringPresentation 데이터를 읽는 3.0 공용 EntityRingLayoutService/ArcGaugePresentationService 경로에서만 렌더한다. 평타/반격 rulerStrike의 끝 네모 확대 애니메이션은 제거한다. 반격 steppedRangeSpan 미리보기 시작점은 평타 1단계 타격 사각형의 안쪽 경계인 18px로 명시해 캐릭터 중심에서 시작하지 않는다.

3.770: 룰리를 기존 듀얼즈 구현 기준으로 다시 전면 정렬했다. 룰리 점멸은 7단계 고정 점멸이 아니라 RMB 홀드 호게이지가 완료될 때만 발생하며, 특히 최소 1단계에서는 progress=1로 유지되어 완료 점멸이 계속 보인다. ringPresentation은 hold gauge의 input/state/min/interval 데이터만 선언하고 EntityRingLayoutService가 실제 hold progress/full 상태를 계산해 호게이지→완료 점멸→상태링→반격 활성링 순서를 잡는다. 상시 줄자 눈금 시작점/반격 preview 시작점은 기존과 동일한 18px로 복원하고, 상시 타격 박스 채움도 룰리 색 #e6dd85의 0x22 알파로 복구했다. rulerStrike의 기존 타격 팁 0.2→1.0 빠른 확장 연출도 완전 동일 요청에 따라 복구했다. steppedRewind는 0.3초 후 도달 가능한 최외곽 단계에서 시작해 90ms마다 live aim/wall 재계산·state 갱신·136x72 타격·넉백·단계별 rulerStrike FX를 실행한다.

3.769: 룰리 상시 타격 박스의 색을 공통 AttackPreview 기본색(흰 외곽/회청색 채움)과 동일하게 통일했다. 반격 steppedRangeSpan preview 시작거리를 source.radius 이상으로 제한해 평타 줄자 시작점보다 뒤로 들어가지 않게 했다. steppedRewind 단계 FX는 stage/distance뿐 아니라 실제 타격 중심 tx/ty를 저장하고 rulerCounterStrike가 해당 좌표를 우선 사용해 7→1 각 단계 위치에 정확히 생성된다. 캐릭터 데이터 기반 ringPresentation을 추가해 RMB 홀드 gauge와 최대 progress flash를 EntityRingLayoutService가 공통으로 인식하며, 룰리 호게이지/점멸링/상태링/반격 활성링이 정식 슬롯 순서로 배치된다.

3.768: 룰리 상시 presentation이 존재하지 않는 entity.charDef.id를 검사해 전체 미리보기/RMB 호게이지를 조기 종료하던 문제를 entity.character.id 기준으로 수정했다. 상시 평타 미리보기는 기존처럼 캐릭터 근처 첫 눈금부터 현재 단계의 점선 128x72 타격 박스/단계 숫자까지 매 프레임 표시한다. RMB 단계 변경 순간 rulerAdjust식 강한 눈금/숫자 강조를 복구하고 홀드 200ms 호게이지를 표시한다. LMB에는 rulerStrike를 복구하되 사용자가 제거 요청한 끝 네모 확장 애니메이션은 제외하고 기존의 전체 줄자 윤곽+강한 눈금 타격 FX만 표시한다.

3.767: 룰리 평타의 자동 area rect FX와 rulerStrike 확장 FX를 제거하고 상시 줄자/타격지점 미리보기만 유지한다. 룰리 LMB 단계 선택 조건을 현재 progress 단계의 정확한 구간으로 제한했다. rectCenterMode:'center'+wallPolicy:'block'은 대상까지의 선분 벽 차단도 검사해 벽 뒤 대상에게 피해가 전달되지 않게 한다. 상시 룰리 미리보기는 progress state 유무와 무관하게 1단계 기본값부터 매 프레임 표시하며 RMB 홀드/단계변경 중에도 끊기지 않는다.

3.766: 룰리를 기존 듀얼즈 구현과 다시 대조해 기능/시각을 재구성했다. LMB 비용을 3.0 스케일 400으로 복구하고 현재 단계 끝점의 128x72 사각 타격을 사용한다. RMB는 짧은 클릭 +1, 홀드 200ms마다 -1을 유지하며 단계 변경 rulerAdjust 시각과 홀드 호 게이지를 기존 타이밍으로 복구했다. 반격은 단순 7회 반복을 제거하고 delivery.area의 범용 steppedRewind 옵션으로 0.3초 후 현재 조준/벽 기준 도달 가능한 최외곽 단계에서 시작해 90ms마다 실시간 조준/벽거리를 다시 계산하며 1단계까지 되감고, 매 타격마다 실제 단계 상태/136x72 타격/넉백/FX를 갱신한다. 반격 선딜 미리보기는 기존처럼 1단계 안쪽 경계부터 도달 가능한 최외곽 단계 바깥 경계까지 공통 직사각형 미리보기를 표시한다.

3.765: 룰리 단계형 사각 타격이 centerDistance를 무시해 모든 단계가 발앞 72px만 타격하던 문제를 수정했다. delivery.area rect에 범용 rectCenterMode:'center'를 추가해 지정 중심거리 기준 사각 판정을 지원하며 룰리 LMB/반격에 적용한다. 룰리 상시 평타 미리보기는 현재 progress 상태에서 매 프레임 독립 렌더하고 RMB 거리조절 중에도 유지한다. rulerStrike FX의 진행도 계산을 자체 now/start/dur 기준으로 고쳐 타격 팁 확장 이펙트가 비정상적으로 보이던 문제를 수정하고, 실제 벽 제한 거리까지 시각 위치를 맞춘다.

3.764: 룰리의 화면 시각을 기존파일 기준으로 재정렬했다. 상시 타격 팁의 축/크기, 첫 눈금부터 4눈금 주기의 굵은 눈금, 벽/맵 경계에 따른 표시 거리 제한, 단계 숫자, 단계 변경 rulerAdjust 강조, 반격 선딜 중 도달 가능한 최대 단계 표시와 평타 팁 숨김, 반격 되감기 136px 폭 타격 연출을 복원했다.

3.763: 룰리 rulerStrike/rulerRewind FX 렌더 분기에서 정의되지 않은 a 알파 변수를 사용하던 런타임 오류를 수정하고 분기 내부 표준 alpha=1-progress를 사용한다.

3.762: 제리 폭발 점프 movement.move에 범용 blocksAction을 적용해 이동 중 공격 행동을 차단한다. 룰리의 기존 줄자 시각(18px 눈금, 4눈금별 굵은 눈금, 현재 타격 팁/단계 숫자, 공격 시 전체 윤곽+팁 확장, RMB 홀드 호 게이지)을 3.0 상태/AttackSpec을 읽는 presentation으로 복원했다.

3.761: 제리 반격 폭발의 원 확장 areaCircle FX를 제거했다. 기존파일 기준 룰리를 3.0 공통 AttackSpec/state.progress 구조로 구현했다. 룰리 RMB의 클릭 증가/홀드 200ms 단계 감소는 캐릭터 전용 타이머 대신 PointerHoldInputService의 범용 deferTapUntilRelease+holdRepeatProgress 정책으로 처리한다.

3.760: 제리 반격 폭발 점프의 이동 경로 dash-line을 제거했다. movement.move에 presentation:false를 범용 흔적 비활성 옵션으로 추가해 이동기 태그/판정은 유지하면서 시각 경로선만 생성하지 않도록 했다.

3.719: 레이즈 RMB에 임의로 추가했던 trajectory.arc를 제거해 이동 중 캐릭터 본체가 포물선으로 폴짝이는 표현을 삭제하고 기존 220ms 평면 이동 동작으로 복구했다. 레이즈 툴팁 문구는 기존 듀얼즈 문장을 기준으로 복구하며, 3.0에서 실제 변경된 최대 연타 12회와 최대충전 넉백 삭제만 반영한다.

3.718: 레이즈 multi-click 호 게이지가 기존 파일의 RGB 문자열을 Canvas strokeStyle에 그대로 전달해 유효한 CSS 색상으로 렌더되지 않던 문제를 수정했다. 시간 호는 기존 rgba(80,110,160,0.95), 클릭 충전 호는 기존 rgba(191,161,54,0.9)와 동일하게 ColorService.rgbString을 거쳐 렌더하며 최대충전 점멸색은 기존 255,180,20을 유지한다.

3.711: 나남낭 LMB/반격에 잘못 추가된 arcSweep 커스텀 이펙트를 제거해 기존 정적 sector 공격 표현으로 복구하고, 최대차징 베개 투척 뒤 counterCharge 이펙트를 제거했다. 나남낭 LMB 재사용 대기시간은 일반/최대차징 모두 기존 대비 공격 빈도 +30%가 되도록 cd를 1.3으로 나눈다. 메라 모나 IV 설명은 평타 탄속이 즉발임을 직접 표기하고, 실제 공격은 기존 instant-laser delivery.area 즉발 판정을 유지한다.

3.717: 레이즈 방출 선충전의 별도 강조색/펄스 표현을 제거하고 일반 차징 게이지와 동일한 색·선 두께를 사용한다. 방출은 최대 12회 기준 4클릭분을 부여하며, 파워 펀치 차징 진행 중이면 현재 raise-punch-charge에 4를 직접 더하고 최대 12에서 제한한다. 차징 중이 아닐 때만 기존 raise-punch-boost 대기 상태를 저장해 다음 파워 펀치를 4클릭 상태에서 시작한다.

3.716: 레이즈 방출의 33% 선충전을 최대 클릭 수에 대한 실제 클릭 단계로 환산해 12회 기준 정확히 4회치로 저장한다. multi-click 게이지는 클릭 수/최대 클릭 수 기준으로 표시해 방출 직후와 LMB 시작 뒤 모두 4/12가 유지되며, boost state가 대기 중일 때는 별도 boostColor와 펄스형 선 두께로 선충전 상태를 시각적으로 구분한다.

3.715: 레이즈 반격 방출의 33% 선충전이 별도 boost state에만 저장되어 호 게이지에 표시되지 않고, 12회 클릭 단계로 반올림되며 실제 시작 진행도도 약 36%가 되던 문제를 수정했다. multi-click.attack은 boostRatio를 클릭 수로 반올림하지 않고 progressScale valueRange상의 연속 진행값으로 직접 변환해 정확히 33%를 유지하며, boost-only 상태도 공통 호 게이지가 즉시 표시한다. 반격 직후에는 시간 호 없이 33% 충전 호만 표시되고 첫 LMB 입력 시 그 진행도를 그대로 이어받아 1.5초 충전 가능 시간 호가 시작된다.

3.714: ProgressStateService의 blocksStaminaRegen 의미가 실제 자연 스테미나 회복 조건에 연결되지 않았던 공통 누락을 수정해 레이즈 multi-click 차징 중 스테미나가 회복되지 않게 했다. multi-click.attack에는 캐릭터 비의존 gauge presentation을 추가해 현재 클릭 충전량 호와 충전 증가 가능 시간 호를 같은 반경에 표시하고 최대 충전 점멸을 지원한다. 레이즈는 기존 듀얼즈 표현대로 1.5초 시간 호 + 캐릭터색 클릭 호를 사용한다.

3.713: 메인마드 LMB 최대 차징 시간을 1초로 단축하고 최대 차징 피해를 기존 3.0 스케일 600으로 낮췄다. multi-click.attack의 미리보기가 현재 progressScale을 resolve하지 않아 레이즈 연타 차징 크기가 갱신되지 않던 문제와, 300ms idle state가 예약 continuation과 같은 시각에 만료 삭제되어 실제 공격이 실행되지 않던 문제를 공통 수정했다. idle state는 짧은 완료 보존 구간을 두고 continuation이 동일 state identity를 확인한 뒤 소비하며, 미리보기는 현재 진행도로 resolve된 AttackSpec을 사용한다.

3.712: 기존 듀얼즈 기준 레이즈를 3.0에 구현했다. LMB 파워 펀치는 범용 multi-click.attack 모듈로 최대 12회 연타, 첫 입력부터 1500ms 충전 증가 창, 마지막 클릭 후 300ms 무입력 자동 발동, 클릭당 스테미나 30, 피해 100~900/판정 크기 1.0~1.6배를 처리하며 최대충전 넉백은 제거했다. RMB 내려찍기는 기존 movement.move + 이동 종료 AttackSpec으로 280 이동/220ms/이동 중 무적/착지 반경 55의 1초 기절을 재사용한다. 반격 방출은 200 원형 피해+넉백 후 다음 파워 펀치를 33% 충전 상태로 시작한다. ProgressScaledAttackService는 선택적 valueRange로 1..N 클릭형 진행도의 0..1 보간을 일반화했다.

3.710: 나남낭을 기존파일 기준으로 3.0에 구현했다. LMB는 0.3초 차징 베개 휘두르기/투척, RMB는 0.8초 수면 후 잃은 체력 비례 회복, 반격은 0.3초 선딜 후 수면 부여로 구성했다. 타다타 설명은 기존 파일 형식에 맞춰 L-Shift BIND를 복구했고 detailDamage 플레이스홀더 렌더를 고쳐 덩굴 지대 설명이 실제 피해량으로 표시된다. 메라 모나 단계 설명은 세부 수치를 제거하고 4단계 문구를 즉발 광선 기준으로 정리했다.

3.720: 레이즈 캐릭터 설명에서 LMB CHARGED 보조 행을 제거했다. 실제 최대충전 후 연타 유지 동작과 전투 로직은 변경하지 않는다.

3.722: 레이즈 반격 방출의 효과를 최대충전이 아니라 정확히 4클릭분 충전으로 수정했다. 차징 중이면 현재 raise-punch-charge에 +4(최대 12), 차징 중이 아니면 다음 LMB를 4클릭 상태에서 시작한다. 설명도 33%/최대충전 표현을 제거하고 4회 충전으로 맞췄다.

3.723: 레이즈 방출 선충전 대기 상태를 1회성 플래그가 아니라 실제 예약 클릭 수 progress로 저장하도록 수정했다. 차징 중이 아니어도 방출을 반복하면 raise-punch-boost가 4→8→12로 누적되고, 다음 LMB는 저장된 클릭 수에서 시작한다. 차징 중 방출의 현재 진행도 +4 동작은 유지한다.

3.724: EntityRingLayoutService.flashVisible()이 ChargedAttackService 최대차징만 검사하고 MultiClickAttackService의 실제 최대차징 점멸을 누락해 레이즈 점멸링과 반격 활성 링이 같은 반경에 겹치던 문제를 수정했다. MultiClickAttackService.isFull()을 추가해 현재 차징 진행도뿐 아니라 방출로 대기 중인 실제 클릭 카운트가 maxClicks에 도달했는지도 공통 판정하며, 링 레이아웃이 실제 표시 중인 점멸 링을 반영해 상태/반격 링을 바깥 슬롯으로 민다.

3.725: 기존 듀얼즈 기준으로 레비나를 3.0에 이식했다. 삼지창은 지속 투사체의 경유지 큐/정지/회수를 처리하는 범용 projectile.waypoint-path를 사용하며, LMB 짧은 해제는 100 스테미나 경로 추가·300ms 홀드 해제는 회수, RMB는 200 스테미나 강화 경로 추가, 반격은 출발지 피해 후 창 위치로 이동해 도착지 피해를 준다. 창 경로는 벽/적을 관통하고 세그먼트마다 같은 대상을 1회 타격하며 LMB 100, RMB 250+넉백, 귀환 100을 유지한다.

3.728: 레비나 RMB 경로의 투사체 적중 시 실제 impact point를 AttackExecution에 기록해 away-from-impact 넉백이 정상 적용되도록 공통 ProjectileService를 수정했다. 자동 공격 증강은 레비나의 홀드 회수 입력을 시작하지 않고 기존 창이 있으면 현재 마우스 위치에 무료 LMB 경유지를 추가하며, 창이 없으면 기존 LMB를 무료로 발사한다. FFA 3팀 2등/4팀 2·3등의 outcome은 neutral로 유지하되 점수는 기존 승리 점수 배수(3팀 2등 ×1, 4팀 2등 ×2, 3등 ×1)를 적용한다.

3.729: 맵 밖 또는 레터박스/캔버스 밖 포인터 좌표를 화면 중심 기준으로 캔버스 가장자리에 투영하던 경로를 제거했다. mouseWorld()는 실제 클릭의 raw 월드 좌표를 먼저 계산한 뒤, 플레이어→클릭 방향을 유지한 광선을 WorldGeometryService.boundaryRayDistance()로 맵 경계 1px 안쪽에 투영한다. 캔버스 내부라도 카메라 때문에 월드 좌표가 맵 밖이면 같은 보정을 적용하며, 플레이어가 없는 경우에는 nearestOpenPoint()로 월드 내부 좌표를 보장한다.

3.738: 키 예고 실행 피해를 벽 무시 원형 판정으로 변경하고 kiStrike의 4개 수렴 토큰만 제거했다. 예고장 field에 blocksStaminaRegen을 연결해 존재 중 자연 스테미나 회복을 막고, 기만 후 0.5초 페이드 동안에는 reward-only field 상태를 유지해 일반 회피 보상 판정은 계속하되 입력용 field.exists/armed에서는 제외한다. FieldDodgeRewardService의 코인 연출을 대상→소유자 이동 토큰으로 복구하고, 온라인 duel-hit-confirmed에서도 source recipient resource.restore/effect.spawn을 확정 처리해 키 특수탈취 적중 회복과 코인 연출이 공격자 소유 화면에서 정상 적용되게 했다.

3.739: 키 예고 타격의 중앙 밝아짐 플래시를 제거하고 반격 직사각형 폭을 기존 segment width 70 기준 halfWidth 70으로 복구했다. 예고 field에 blocksStaminaRegen:true를 실제 연결하고 reward-only 페이드 상태는 자연 스테미나 회복 차단에서 제외한다. AttackService가 when:'on-hit' source resource.restore까지 공격 직후 무조건 실행하던 공통 오류를 수정해 실제 적중 전 회복/적중 후 중복 회복을 제거했다. FieldDodgeRewardService는 dodgeReward field descriptor를 duel-state에 동기화해 회피자 권위 클라이언트에서도 원격 예고장을 판정하고 non-just 회피 보상을 소유자에게 전달한다. action.trigger-attack에 선택적 explicitNetworkReplay를 추가해 키 2·3타를 독립 triggered-attack 패킷으로 대상 권위에 재생한다.

3.740: 키 3타의 on-hit state.window가 온라인 duel-hit-confirmed 소유자 확정 경로에서 누락되던 문제를 수정해 3타 실제 적중 시 ki-lmb-chase 750ms 재사용 상태가 생성된다. FieldDodgeRewardService는 일반 회피에 별도 dodge-ended 이벤트가 없어 보상이 끝까지 확정되지 않던 문제를 회피 시작 시 실제 dodgeUntil 기준 완료 예약으로 보완하고, duel-field-dodge-reward를 gameplay 패킷 허용 목록에 등록해 온라인 보상 패킷이 폐기되지 않게 했다. 키의 예고장/특수탈취 회복은 코인 생성 즉시가 아니라 333ms travelToken 도착 시점에 적용되며, resource.restore on-hit에 범용 delay를 지원해 로컬/온라인 모두 같은 도착 시점에 체력·스테미나를 회복한다.

3.746: K.O. 레이저 길이를 고정 900 halfLength에서 월드 대각선 기반으로 확장해 어떤 각도에서도 맵을 충분히 가로지르도록 변경했다. 사망 관전자는 자기 팀이 아닌 은신 플레이어를 reveal/근접 탐지와 무관하게 완전히 볼 수 없으며, 해당 은신 플레이어를 추적 관전 중이면 followPid는 유지한 채 카메라 위치 갱신과 시야 사각형 표시만 일시 중단하고 은신 종료 시 자동으로 추적을 재개한다.

3.747: 기존파일 기준 소르를 3.0 공통 AttackSpec 구조로 구현했다. LMB 배터리는 평행 3발 전파와 2초 감전, 이미 감전된 대상 재적중 시 0.5초 방전을 적용한다. RMB 정전기장은 배터리 투사체 착탄 위치에 반경 120/4초 field.area를 생성해 범위 내 적에게 1초마다 100 피해와 지속 감전을 적용한다. 반격 정전기 방출은 0.3초 선딜 직선 공격/넉백/2초 감전 및 기존 감전 대상 0.5초 방전을 사용한다. 전파가 정전기장을 통과해 방전되는 기존 상호작용은 제거했으며 새 gameplay 모듈은 추가하지 않았다.

3.750: 화염 공통 DOT를 최대 체력 2%/0.5초(초당 4%)로 조정했다. STATUS_EFFECT_RULES와 디버그 CC 기본값을 같은 수치로 통일하고 도움말 표기도 함께 수정한다.

3.751: field.area 피해의 공통 impact.type인 field-area가 피격 스퀴시 원점 계산에서 누락되어 타다타 슬로우 지대와 소르 감전 지대 틱 피해 시 스퀴시만 장판 소유자 방향으로 눌리던 오류를 수정했다. ImpactDirectionService.squashOrigin이 field-area도 실제 impact.origin 장판 중심을 사용하도록 통일해 피해 방향과 피격 피드백 방향을 일치시킨다.

3.749: 기존파일 소르 정전기장 표현을 3.0 범용 areaCircle로 복원해 중앙 ZAP 라벨과 점선 원 펄스를 표시한다. RMB target-point 착탄 미리보기는 제거했다. 원형 field.area 피해가 impact.type field-area일 때도 실제 장판 중심을 피해 방향 원점으로 사용하도록 ImpactDirectionService를 공통 수정했다. 소르 LMB 상태 적용 순서를 감전 후 방전으로 변경해 DISCHARGE가 최종 CC 표시로 남도록 했다.

3.752: 소르 툴팁 문구를 지정 형식으로 정리하고 RMB 정전기장 감전 시간의 문자열 하드코딩을 제거했다. CharacterDescriptionService에 범용 detailZapSeconds를 추가해 detailAttack 또는 설치 field의 onTrigger status.apply(zap) 지속시간을 실제 데이터에서 읽는다.

3.753: 모든 캐릭터 tooltip 설명의 직접 수치 하드코딩을 전수 제거했다. 타다타 연사/반격 횟수는 delivery count/repeatCount, 레이즈 착지 기절/반격 충전량은 linked status.duration/state.progress.amount, 키 연타 횟수/예고장·특수탈취 회복률은 ability 공격 연쇄/dodgeReward·resource.restore 비율, 메라 모나 변신 요구 적중/무적/임시 단계 시간은 trigger condition/timing.delay/state.progress decay에서 CharacterDescriptionService가 범용 참조한다. 단계 이름 RMB I~IV는 데이터 수치가 아닌 UI 단계 표기이므로 유지한다.

3.755: 메라 모나~소르 태그 감사. 캐릭터 사거리 태그는 TagService의 평타 최대 사거리 자동 파생만 사용하도록 메라 모나/소르의 중복 명시 사거리 태그를 제거했다. 메라 모나는 단계 평타 최대 900에 따라 원거리로, 로온은 평타 400 규칙에 따라 근거리로 스타일 표기를 정합화했다. 셰리나 반격의 폐기된 '투사체' 명시 태그와 로온 RMB의 실제 미부여 '빙결' 태그를 제거했다. TagService는 range 0 보조 AttackSpec에 초근거리 태그를 잘못 부여하지 않으며 state.progress.onFull 상태이상도 자동 파생한다.

3.757: 기존파일 기준 제리를 Duels 3 AttackSpec으로 구현했다. LMB 유탄은 target-point 곡사 투사체가 지정 거리에서 폭발하고, RMB C4 3개는 부채꼴 직사 후 적/벽/사거리 종점에서 폭발하며 projectile.presentation kind:'weapon-projectile'을 사용해 무기 투사체로 분류된다. 반격은 300ms 선딜 후 자기 중심 폭발과 조준 방향 310px/520ms 포물선 폭발 점프를 재현했다. 제리 C4/반격의 기존 거리 비례 넉백을 보존하기 위해 기존 movement.knockback 계열에 범용 distanceMode:'impact-proximity'를 추가했다.

3.758: 제리 C4 weapon-projectile의 source-link 점선을 제거했다. 폭발 점프는 기존 이동기의 벽 통과 정책(passWalls:true)을 사용하도록 복구했다. 포물선 movement.presentation의 시각 offset을 캐릭터 본체뿐 아니라 반격/회피 링, 상태·충전 게이지, 체력·이름·스테미나 등 부착형 월드 UI에도 공통 적용해 점프 중 UI가 바닥 좌표에 남지 않게 했다.

3.754: 방전이 실제로 적용되지 않던 공통 원인을 수정했다. status.apply가 같은 AttackExecution에서 즉시 적용/전송된 상태를 execution effect로 기록하고 target.status-active가 이를 함께 조회해 온라인 원격 대상도 감전→방전 연쇄 조건을 동일하게 판정한다. 소르 반격의 상태 순서를 감전→방전으로 교정했다. CombatModifierService는 discharge를 staminaRegenBlocked로 기록하고 CombatStatsService.current()가 감전/버프 가산 재계산 뒤에도 최종 회복 배율 0을 유지해 실제 스테미나 회복 정지가 적용된다.

3.898: 레테 온라인 평타의 원격 연사처럼 보이는 네트워크 타이밍 압축을 수정했다. duel-scheduled-projectile-shot 수신 시 delayed-projectile-volley의 동일 AttackExecution 내부 발사 간격과 AttackSpec attackDelayGroup의 실행 간격을 패킷 도착 간격과 무관하게 예약 재생해, 지연 후 묶여 도착한 패킷도 원래 최소 공격딜레이/연사 간격을 유지한다. 레테 RMB에는 lete-primary 500ms 공격딜레이를 적용하고, summon.toggle의 active recipient 재지정이 AttackService cooldown/attackDelay를 공통 검사·소비하도록 교정했다. recipientSelection.noOpOnMissWithExisting을 추가해 기존 유효 수취인이 있는 상태에서 허공을 클릭하면 기존 수취인을 유지하되 선택 이펙트·쿨다운·공격딜레이·네트워크 실행이 발생하지 않도록 했다.

3.897: 셸로 밸런스 조정. Base Damage를 200→150으로 낮춰 LMB 실제 피해를 150으로 변경하고 LMB 스테미나 비용을 200→150으로 낮췄다. 일반 반격 스피닝과 패리 반격 쉴드 어택은 Base Damage 변경 후에도 실제 피해 200이 되도록 damageRatio를 1.25→4/3으로 재보정했다. 다른 사거리/쿨다운/이동/CC/투사체 동작은 변경하지 않는다.

3.896: 공통 화염(BURN) DOT 피해를 0.5초마다 최대 체력 2%→4%로 상향했다. STATUS_EFFECT_RULES.burn의 단일 기준값을 변경하고, 같은 값을 별도 fallback으로 사용하는 디버그 상태 부여 기본값과 도움말 표기도 4%로 통일했다. 화염 틱 간격 500ms, 지속시간, refresh-type 중첩 규칙은 변경하지 않는다.

3.1545: 카논 수치 조정. 일반 평타/반동 펀치/끊어치기의 모든 평타 계열 스테미나 소모를 0으로 변경하고 실제 타격 피해를 타당 100(baseDamage 100, damageRatio 1)으로 통일했다. 발차기/파고들기/높이차기 스킬은 스테미나 소모를 200, 피해를 200(damageRatio 2)으로 통일하고 기절 시간을 각각 0.25/0.5/0.75초로 조정했다. 반격은 변경하지 않았다.

3.1544: 카논 이동 회피 후속 판정 수정. 반동 펀치의 후속 타격을 AttackSpec 내부 attack.sequence 예약에서 제거하고 ability.kanon.lmb의 표준 timing.delay + action.trigger-attack 경로 하나로 통일해 이동 회피 평타가 2회 공격되는 중복 실행을 방지했다. 반동 펀치 본체/후속 타격 사거리는 일반 평타와 동일한 180으로 통일했다. DodgeFollowupStateService에 회피 중 이동 입력 관찰을 추가해 MOVING으로 시작한 회피라도 회피가 끝나기 전에 입력이 한 프레임이라도 0이 되면 STOPPED 상태로 즉시 고정되며, 이후 다시 방향키를 눌러도 해당 회피는 정지 회피로 유지된다.

3.1543: 카논 밸런스/이동 회피 평타 조정. RMB 발차기 3종의 기절을 0.3/0.6/0.9초, 쿨다운을 각 1000ms, 스테미나 비용을 각 400으로 변경했다. 카논 평타 3계열의 공격 사거리를 20% 증가시켜 일반 180, 반동 펀치 216, 끊어치기 186으로 조정했다. 이동 회피 평타 반동 펀치의 전용 185px/165ms 벽 관통 이동을 제거하고 일반 평타와 동일한 45px/90ms 전진 이동(passWalls:false)으로 교체했으며, 이동 완료 90ms 뒤 recoil-hit을 발동해 도착 후에만 공격하도록 맞췄다.

3.1542: 뉴 돌아오는 마검 적중 시 출혈 제거. attack.nyu.sword-return의 status.apply bleed 모듈만 제거했으며 귀환 직격 피해/관통/속도/프레젠테이션 및 나가는 마검과 다른 출혈 효과는 변경하지 않았다.

3.1541: 카논 평타 계열 적중 스테미나 회복량을 타격당 150으로 통일. 일반 평타는 기존 150을 유지하고, 반동 펀치 180→150, 끊어치기 1·2타 각각 100→150으로 변경했다. 비용/피해/쿨다운/이동/넉백은 변경하지 않았다.

3.1717 Van 호게이지/셰리나 비아 잔향 수정: EntityRingLayoutService.worldArcGaugeState가 실제 gauge.arc 렌더와 동일하게 duels3CanViewTeamGauge를 검사해 적 화면에서 숨겨진 반 수리 호가 CC/반격 링 배치 공간을 차지하지 않게 했다. field.area 피해가 반 스패너에 100% 흡수되어 durabilityBlocked(hit:false)가 된 경우에도 해당 대상의 장판 interval 틱과 damageStackGroup 공용 쿨다운을 정상 소비한다. 따라서 셰리나 비아 잔향 위의 반에게 매 프레임 내구도 피해가 재시도되지 않으며, 체력 피해/CC/온힛/onTrigger는 완전 흡수 시 계속 차단된다.

3.1717 아츠테오 원석 로컬/원격 표시 동기화 수정: 원격 OrbitInventory 상태가 snapshot의 phaseSpeed/orbitRadius를 받은 직후 다음 프레임부터 해당 클라이언트의 증강/대상거리 기준으로 다시 계산해 덮어쓰던 문제를 수정했다. applyRemote가 동기화된 회전속도/반경을 remote state에 보존하고, 원격 엔티티의 phaseSpeed/orbitRadius는 이 authoritative snapshot 값을 사용한다. 소유자 화면은 기존 실제 계산을 유지하며 itemId/slot 기반 배치와 네트워크 지연 위상 보정은 그대로 사용한다.

3.1717 신규 캐릭터 디라: 체력 1000/보통 이속/#f3b36f의 지속전투형 원거리 서포터. LMB는 식재료가 없으면 프라이팬 투척으로 적중 시 식재료 2개를 얻고, 식재료 보유 중에는 재료 투척으로 전환되어 아군 최대체력 10% 회복 또는 자신의 휴대용 스토브에 재료를 투입한다. 스토브 재사용 시 투입 수만큼의 음식을 획득하며, 음식 LMB는 벽을 무시해 지정 지점에 5초 픽업을 남기고 재료 수×최대체력 10% 및 최대스테미나 10%를 회복한다. 반격은 주변 프라이팬 공격 적중 시 실행당 식재료 2개를 획득한다. CookingService와 duel-state 동기화/월드 게이지를 복구해 재료·스토브·음식 상태를 공통 처리한다.

3.1717 디라 LMB/음식 타기팅 후속 수정: 홀드 평타를 제거하고 LMB를 0.3초 연사 간격의 즉시 평타로 통일. 식재료 보유 시 프라이팬 본체와 식재료 시각 투사체가 같은 궤도에 겹쳐 비행하며, 프라이팬은 적 피해/식재료 획득을 유지하고 식재료 효과는 아군 회복·스토브 투입을 처리한다. 음식 보유 중에는 클릭 지점 주변의 아군 플레이어가 있을 때만 음식을 해당 아군 전용 homing 투사체로 던지고, 그 외에는 프라이팬을 발사한다. 새 음식이 도착하면 기존 음식 수치에 합산하지 않고 새 음식으로 교체한다. 음식 호게이지는 mealCount>0 즉시 100%가 아니라 실제 음식 식재료 수/스토브 최대 10 비율로 표시한다. 가득 찬 스토브는 식재료 투사체 충돌 대상에서 제외되어 그대로 관통한다.

3.1717 디라 투사체 분리 + 음식 대상 판정 + 다즈빈 원격 잔탄 수정: 디라 식재료 보유 LMB는 프라이팬 공격을 그대로 발사하면서 동일 방향/동일 시작점에 별도의 실제 식재료 지원 투사체를 겹쳐 발사한다. 프라이팬은 적 피해/식재료 획득만 담당하고 아군/스토브 판정에서 완전히 분리되며, 식재료만 아군/스토브에 충돌해 회복/스토브 입력을 적용한다. 음식 대체 분기의 targetEntityId 조건을 context.exists에서 context.truthy로 교정해 아군 주변 클릭으로 실제 대상 ID가 잡힌 경우에만 음식이 발사된다. 온라인 원격 homing snapshot에서 소유자 목록에서 사라진 투사체는 짧은 유예 뒤 원격 객체도 discard해 다즈빈 LMB 등이 상대 화면에서 마지막 좌표에 멈춰 영구 잔존하는 현상을 방지한다.

디라 음식 호게이지 색상 수정: 미완성은 어두운 기본색, 식재료 10개(100%)일 때만 밝은 완충색/점멸을 사용.

3.1717 디라 설명 최신화: percent 참조 뒤 % 기호 누락을 수정하고, 현재 음식 지정 투척/자가 투척/식재료 1개당 10% 회복/스토브 최대 10개·만석 관통/완성 음식 도착·교체 사양에 맞춰 디라 전체 툴팁을 갱신.

3.1717 디라 설명/반격 수정: 디라 desc와 기술 설명을 사용자 지정 문구로 갱신하고, 주방 출입 금지 반격의 실제 공격 범위를 원형에서 전방 120도 부채꼴(range 190, halfAngle 60도)로 변경했다. 피해/식재료 획득/선딜/벽 차단 규칙은 유지한다.

3.1717 디라 스토브 회수 체력바/파괴 쿨타임: 회수형 소환수의 체력바 표시를 자연회복과 분리하는 storedHealthBar 옵션을 추가. 디라 휴대용 스토브는 회수 시 저장된 현재 체력을 스테미나 바 아래에 표시하고, 파괴 시 respawnDelay 7000ms 동안 재설치 불가. summonSpecs에 HEALTH/DEATH 설명을 추가해 다른 소환수와 동일한 형식으로 표시한다.

3.1717: 디라 반격기 주방 출입 금지에 공통 반격기 규칙과 동일한 movement.neutralize-knockback(distance 84, speed 10)을 추가. 기존 부채꼴 범위/피해/식재료 획득/300ms 선딜은 유지.

3.1717 에즈레일 바람지대 팀색/즉시 보호막: LMB/RMB 바람지대 외곽선을 source-team 색상으로 표시하고, triggerOnEnter:true로 변경해 생성 직후 범위 안의 자기 자신/아군에게 첫 보호막 틱을 즉시 부여한다. 내부 링과 남은 지속시간 호 게이지 색은 기존 바람색을 유지한다.

디라 음식 유도 보강: 지정 아군 음식은 expireAtRange:false로 사거리 소멸하지 않으며, self/ally 지정 유도 및 충돌은 hidden 표시 여부와 무관하게 지정 대상을 끝까지 추적/적중한다.

3.1717 엔소냐/프릴 버그 수정: 엔소냐 RMB 즉시 1단계 볼륨 버프의 rmbPulse 대상 관계를 self+ally로 확장해 주변 아군에게도 첫 5초 단계가 즉시 적용되도록 했다. 프릴 LMB 3타는 강제 네트워크 충돌 원점을 끄고 현재 캐릭터 위치 기준의 area 판정을 사용해 온라인/보간 상황에서 시각 위치와 피해 판정 원점이 어긋나 피해가 누락되던 문제를 수정했다.

3.1717 밸런스 일괄 조정: 에즈레일 바람지대 첫 진입 즉시 보호막 제거 및 0.5초마다 최대체력 5% 보호막, 티냐 마법진 발현 공개시간 0.375초 및 타격 시 티냐 반대방향 무력화 넉백(84/10), 사이엔 RMB 패리 제거 후 LMB 3타에 패리 이전, 디라 적중 식재료 획득 1개 및 식재료 실제 아군/스토브 적중 시에만 소모, 레이즈 체력 1100, 레테 RMB HOLD 0.3초·LMB 비용 300·벽 관통·약한 아군/적 유도, 카논 LMB 계열 넉백 제거, 시아넬리 순보 쿨다운 0.4초.

3.1717 타우 리워크: LMB CRIT/최대체력 비례 추가 피해와 스파크 충전 연동을 제거하고 일반 평타 피해를 250으로 상향. 역할군을 딜러로 변경하고 칭호를 사슬낫의 소년, LMB를 사슬낫 휘두르기, RMB를 쇠사슬 추격, 반격을 체인 웨이브로 변경.

3.1717 레테 호게이지 색상 복구: 사이엔 홀드 수정 과정에서 공통 PointerHold/characterHold 렌더러에 남은 #4f79aa 하드코딩을 제거하고 각 캐릭터의 entity.color/ringPresentation 색상을 다시 사용하도록 복원. 레테는 본색 #A7B0A4로 표시된다.

3.1717 구조 통합 1차: 프릴 LMB의 원격 근접 판정 예외(useNetworkCollisionOrigin:false)를 제거해 모든 melee delivery.area가 공통 네트워크 충돌 원점 규칙을 사용한다. Ruli/Deltroove/Van의 런타임 캐릭터 ID 분기를 캐릭터 데이터 기능 존재 여부와 presentation 설정으로 교체했다. Van 내구도 파괴/수리 FX도 damageAbsorbProgress/combatIdleProgressRepair 데이터의 effect 설정으로 이동해 DamagePipeline/수리 시스템이 van ID를 알지 않는다.

3.1717 구조 통합 2차: 미아루키 근/원거리 선택과 키네스 4방향 선택을 별도 action.attack-proximity/action.directional-trigger-attack 실행기에서 제거하고 공통 action.attack + Trigger 조건(attack.proximity-near/aim.cardinal-is)으로 전환했다. 두 전용 Ability 실행기와 설명/사거리 분석기의 특례 추적도 제거했다.

3.1717 구조 통합 3차: WorldGaugeModuleService 안에 있던 progress/timed/projectile/field/cooking/orbit 등 값 해석을 RuntimeValueReferenceService 단일 원본으로 분리했다. TriggerConditionService의 projectile progress, progress full/ratio/gte/lt/sum/empty 비교도 동일 ValueReference 계산을 재사용해 게이지와 조건 판정의 중복 계산식을 제거했다.

3.1717 구조 통합 4차: 리안 RMB는 context.position-memory→공통 action.attack→성공 시 memory consume으로 분해, 유이 RMB는 context.temporal-snapshot→공통 action.attack→공통 movement.move(target-point)→snapshot 자원복원으로 분해했다. 시아넬리 순보도 정지 비도 선택(context.stationary-projectile-target), 공통 action.attack, 이동/교환(movement.stationary-projectile-swap)으로 분리해 기존 거대 action.stationary-projectile-swap-teleport를 제거했다.

3.1717 구조 통합 5차: 칸의 hit.sequence 후속타가 직접 AttackHitTriggerService.damage/onHit/afterAttack을 조립하던 action.target-attack 우회를 제거하고 범용 delivery.target + TriggeredAttackService를 사용하도록 변경했다. AttackService의 source after-attack resource.restore도 별도 회복량 계산을 제거하고 ResourceRestoreEffectService 단일 경로로 통합했다.

3.1717 구조 통합 6차: 디라 CookingService는 요리 자원 상태만 관리하도록 축소했다. 식재료 동반 발사는 수동 AttackExecution/volley 생성 대신 TriggeredAttackService를 사용하고, 음식 귀환/자가 투척의 직접 projectile x/y 갱신은 캐릭터 비의존 ScriptedProjectileMotionService(seek-entity/anchored-arc)로 이동했다. 도착 결과는 generic event를 통해 CookingService가 상태만 반영한다.

3.1717 구조 통합 7차: 가에의 명령 UI는 유지하되 CommandFeatureService의 캐릭터 ID 판정을 commandFeatures 데이터 존재 여부로 일반화했다. 기능 토글 온라인 송수신은 generic GameplayFeatureStateSyncService(namespace/feature/active)로 분리하고, repair/행동 충전/급속냉각 기절은 각각 공통 ResourceRestoreEffectService/CombatStatusApplicationService 경로를 사용한다.

3.1717 구조 통합 8차: Van의 damageAbsorbProgress 전용 분기를 일반 damageResourceLayers 데이터로 교체하고 DamageResourceLayerService를 추가했다. DamagePipeline은 progress 자원 레이어를 우선순위대로 흡수하고 완전흡수 시 적중효과 차단/field-area 예외/depleted effect를 공통 처리하며 특정 캐릭터나 자원 이름을 알지 않는다.

3.1717 구조 통합 9차: 레이카 태양의 가호는 Ability timing.delay와 delivery.area.delay의 이중 500ms 타이머를 제거했다. 실제 delayed delivery가 확정된 시점을 공통 AttackModuleService.onDeliveryResolved 이벤트로 노출하고 gahoActivate의 mode.set을 when:after-delivery로 이동해 피해/가호 전환이 하나의 windup 확정 경로를 공유한다.

3.1717 구조 통합 10차: 뉴를 포함한 linger 투사체의 정지 원인을 projectile.arrivalReason/stationaryArrival.arrivalReason 하나로 고정했다. target/range/boundary/wall/target-point 모든 beginLinger 진입점이 명시적 reason을 전달하고 snap/fixed-position 판정도 이 값만 사용해 hadHit·travel·targetDistance로 정지 이유를 재추론하지 않는다.

3.1717 구조 통합 11차: 티냐 CircleFormationService를 기하/상태 계산으로 축소했다. 실제 대상 순회·DamagePipeline 진입·onHit·단계별 CC는 범용 WeightedCircleAttackDeliveryService + StageStatusEffectService가 처리하고, 전용 duel-formation-attack 송신은 generic GameplayAttackSnapshotSyncService(namespace/snapshot)로 이동했다. 기존 duel-formation-attack은 수신 호환만 유지한다.

3.1717 구조 통합 12차: 룰리 LMB의 단계별 lmbStage1~7 복제 AttackSpec과 Ability alternate 6개를 제거하고 attack.ruli.lmb 하나의 progressScale로 통합했다. ruli-range-stage 1~7 값이 AttackSpec range, delivery.area centerDistance, rulerStrike stage를 동시에 스케일하며 프레젠테이션도 stageAttackPrefix 대신 단일 stageAttackId+단계 geometry를 사용한다.

3.1717 구조 통합 13차: 칸 hit.sequence의 후속 모듈 이름도 전용 action.target-attack에서 기존 범용 action.trigger-attack으로 통일했다. hit.sequence는 대상 ID/좌표만 TriggeredAttackService에 전달하고 후속 AttackSpec의 delivery.target이 실제 직격/온힛/넉백을 처리한다.

3.1717 구조 통합 14차: RuliRulerPresentationService의 GAME_DATA.characters.ruli 직접 참조를 제거했다. 프레젠테이션 설정은 rulerPresentation 데이터가 있는 캐릭터에서 해석하고 효과 렌더의 반경 fallback도 일반 기본값을 사용해 렌더러가 캐릭터 이름을 알지 않는다.

3.1717 구조 통합 15차: 코녕 공격 프레젠테이션의 GAME_DATA.characters.konyeong 직접 참조를 제거하고 EffectSpec 자체에 스타일 값을 실어 범용 렌더러가 데이터만 사용하게 했다. 사용처가 없던 konyeongStab 전용 렌더 분기는 제거했다. ProjectileStateService 네트워크 스냅샷은 stationaryArrival의 canonical arrivalReason/fixedX/fixedY/fixedTravel도 동기화해 뉴 마검의 적중 정지 원인이 상대 화면에서도 동일하게 유지되도록 보강했다.

3.1717 구조 통합 16차: 가에 지속 기능 상태를 전용 kind:command-feature actionState에서 기존 ModeStateService(active/inactive)로 통일하고 LMB 조건/기능 개수 호게이지도 state.mode-is + 범용 mode-match-count-ratio 값 참조로 교체했다. EntityRingLayoutService가 progress/projectile/cooldown/formula/가에 값을 별도 재계산하던 중복 분기를 제거해 RuntimeValueReferenceService 하나를 사용한다. 더 이상 송신하지 않던 duel-command-feature/duel-formation-attack 구형 프로토콜과 수신 호환 분기도 제거했으며 linger의 stopReason/stoppedBeforeRange 중복 상태 필드를 삭제해 arrivalReason만 유지한다.

3.1717 구조 통합 17차: 가에 오버클럭의 초당 과열 충전과 FieldDodgeRewardService의 체력/스테미나 보상을 직접 Health/StaminaService 호출에서 공통 ResourceRestoreEffectService로 이동했다. 특수 기능 레이어의 회복/충전도 일반 resource.restore와 같은 최대치·표시·변경 이벤트 경로를 사용한다. ProjectileState 원격 적용에 남아 있던 obsolete stationaryArrival.stopReason 복사도 제거해 arrivalReason 하나만 유지한다.

3.1717 구조 통합 18차: RuntimeValueReferenceService에 provider registry를 추가해 게이지 코어가 CookingService/OrbitInventoryService/FormulaSequenceService/ClusterSummonService/DynamicWallService 내부를 직접 아는 분기를 제거했다. 각 독립 시스템이 자신의 valueRef를 provider로 등록하며 progress/mode/timed/cooldown/projectile/field 같은 엔진 공통 값만 core resolver에 남긴다.

3.1717 구조 통합 18차: 가에 레이저의 projectile/pierce/scatter/instant beam AttackSpec 재조립을 CommandFeatureService에서 제거하고 범용 AttackFeatureTransformService + attackFeatureTransform 데이터로 이동했다. CommandFeatureService는 명령 상태와 오버클럭 프레젠테이션만 담당하며 공격 delivery 구조를 직접 만들지 않는다.

3.1717 구조 통합 19차: CommandFeatureService.beginCooling을 객체 생성 후 런타임으로 덧붙이던 패치형 정의를 제거하고 정식 서비스 메서드로 통합했다. 냉각 선딜/취소/스테미나 감소 동작은 유지한다.

3.1717 구조 통합 20차: network-hit-confirmed 재생과 AttackModule on-hit에 남아 있던 resource.restore의 최대자원/잃은자원 비율 계산 및 Health/Stamina 직접 호출을 제거하고 ResourceRestoreEffectService 단일 경로로 통합했다. Ability/Attack/온라인 확정/특수 기능의 회복 계산 원본이 하나로 통일된다.

3.1717 구조 통합 20차: 가에 오버클럭 공격 색변환을 CommandFeatureService 전용 tintAttack에서 제거하고 캐릭터 데이터의 attackPresentationTransform + 범용 AttackFeatureTransformService pulse-tint 경로로 이동했다. AttackService는 이제 CommandFeatureService를 직접 참조하지 않는다. 키 예고장 일반 회피 보상의 전용 duel-field-dodge-reward 패킷을 제거하고 범용 GameplayEffectEventSyncService/duel-effect-event namespace 이벤트로 통합했다.

3.1717 구조 통합 21차: 공통 ProjectileService가 디라 CookingService와 cooking.stove-input을 직접 검사하던 역방향 결합을 제거했다. 범용 ProjectileTargetFilterService registry를 추가하고 cooking.stove-input의 만석 스토브 관통 조건은 CookingService 정의 뒤 provider로 등록해 투사체 코어가 캐릭터 기능을 모르게 했다.

3.1717 구조 통합 22차: CharacterTriggerEffectService와 AugmentEffectModuleService가 resource.restore의 최대자원 비율/잃은자원 비율/Health·Stamina·Shield 분기를 각각 재구현하던 중복을 제거하고 공통 ResourceRestoreEffectService로 통합했다. 증강 부활의 체력·스테미나 완전회복도 같은 공통 경로를 사용한다.

3.1717 타우 피해량 조정: Base Damage 200 기준 LMB CRIT 피해를 550→450(damageRatio 2.25), 스파크 웨이브 반격 피해를 200→150(damageRatio 0.75)으로 조정. 일반 LMB 150과 스파크 충전/소모 구조는 유지.

3.1717 에즈레일 설명 추가: ALWAYS 바람지대 항목에 "범위 내 아군에게 보호막을 적용" 설명을 추가. 전투 수치/동작은 변경하지 않음.

3.1717 타우 설명 수정: 캐릭터 설명을 "스파크와 사슬 낫을 이용한 변칙적인 움직임으로 전투하는 캐릭터"로 변경. 전투 수치와 동작은 변경하지 않음.

3.1717 타우 역할/설명 조정: 역할군을 딜러에서 암살자로 변경하고 설명을 '스파크를 충전해 강력한 한방 싸움을 전개하는 캐릭터'로 수정. 전투 수치와 스파크/스킬 동작은 변경하지 않음.

3.1717 디버그 캐릭터 레코드 삭제: 계정 탭에 Firebase UID + 캐릭터 선택 기반의 개별 삭제 UI를 추가했다. DebugAccessService.deleteCharacterRecord()는 /firebase/admin/progress/character/delete 관리자 API를 호출해 해당 UID의 선택 캐릭터 characterRecords/characterStats와 랭킹 항목만 삭제하며 다른 캐릭터/계정 데이터는 유지한다. debugTools + rankingAdmin 권한을 요구하고 성공 후 랭킹 캐시를 즉시 갱신한다.

3.1717 뉴 마검 적중 정지 원인 고정 보강: 뉴 RMB는 targetPoint/targetDistance를 사용하지 않는 일반 직선 투사체라 travel<targetDistance 방식만으로는 적중 정지를 식별할 수 없었다. 적 충돌/권위 적중 확정에서 beginLinger에 stopReason=target을 직접 전달하고 projectile/stationaryArrival에 보존한다. target 정지 상태는 대상 사망·소멸 뒤에도 고정 좌표/이동거리를 유지하며 snapToRangeEnd 사거리 끝 보정을 차단한다.

3.1717 뉴 마검 적중 정지 위치 고정: atTarget+atRange 투사체가 적중 후 정지했을 때 hadHit 상태에 의존하지 않고 실제 travel<targetDistance 여부로 사거리 전 정지를 판정한다. stationaryArrival에 정지 좌표/이동거리를 고정 저장하고 정지 중 매 프레임 복원하며, stoppedBeforeRange 상태에서는 snapToRangeEnd를 금지해 대상 소멸/네트워크 상태 갱신 뒤 최대 사거리 끝으로 순간이동하지 않게 한다.

3.1717 레비나 관통 재적중 회귀 수정: Van 스패너 중복 차감을 막기 위해 추가했던 projectileKey 수명 전체 1회 제한을 제거했다. 레비나처럼 하나의 투사체가 waypoint/귀환 경로를 따라 다시 적중하는 공격은 기존 phase hitIds/trajectory 판정대로 정상 재적중한다. Van 이동 경로 공격의 스패너 중복 차감 방지는 별도 AttackExecution 접촉 기록으로 유지한다.

3.1717 Van 스패너 이동공격 중복 차감 수정: movement-linked effect-animation 공격이 스패너에 100% 흡수되면 hit:false로 반환되어 AttackExecution.hitTargets에 대상이 기록되지 않던 문제를 수정. durabilityBlocked도 해당 이동 공격 실행의 접촉 완료로만 기록해 같은 실행의 다음 이동 세그먼트가 스패너 내구도를 재차 차감하지 않으며, 체력 피해/CC/온힛 효과는 계속 차단한다.

3.1718: CHARACTER_DATA 단일 원본. 55명 능력치/분류/기술/소환/상태/연출/설명 참조 통합.

3.1569: 온라인 원격 방패 접촉은 권위 결과 수신 전 투사체 진행/후속 impact를 최대 250ms 보류. 셸로식 벽 제한 orbit의 실제 렌더 좌표를 피해 좌표와 통일하고 중심 기준 시야 검사로 벽면 접촉 누락 방지. 카논 난이도 3.

3.1568: 투사체 이동 후 최초 방패 접촉점에서 guard impact/잔향 경로를 확정. 루네프 화염구 guard impact 활성화. 비벽관통 회전 투사체의 피해 궤도도 벽 raycast 제한 및 대상 가시성 적용.

3.1540: 카논 평타/스킬 자원·쿨다운·발차기 수치 조정. 일반 평타/반동 펀치/끊어치기는 공용 kanon-primary attackDelayGroup을 제거해 각 AttackSpec의 개별 cd만 사용하도록 분리하고, 평타 입력 비용을 각각 200으로 증가시켰다. 발차기/파고들기/높이차기는 각자 attack id의 독립 cd를 유지하면서 비용을 500으로 통일했다. 기절은 0.2/0.4/0.6초로 감소. 일반 발차기 사거리 240→192(-20%), 파고들기 153.6(일반의 80%), 높이차기 230.4(일반의 120%)로 변경했다. 파고들기의 별도 145px 전진 movement.move를 제거해 사용 시 추가로 짧게 이동하던 버그를 수정했다.

3.1539: 금지 제안과 금지 해제 제안을 투표 화면에서 명확히 구분했다. 현재 미금지 캐릭터는 `금지 제안`, 이미 금지된 캐릭터는 `금지 해제 제안`으로 분류해 각각 별도 섹션/제목 아래 일반 캐릭터 카드로 표시한다. 한 종류만 있을 때는 화면 제목도 `캐릭터 금지 제안` 또는 `캐릭터 금지 해제 제안`으로 바뀌며, 두 종류가 섞인 경우에만 `캐릭터 금지 설정 요청`으로 표시한다. 카드 자체에는 빨간 가림막이나 `금지 제안` 오버레이를 추가하지 않는다.

3.1538: 캐릭터 금지 해제 선택 표시와 거절자 안내 수정. 이미 금지된 캐릭터를 금지 화면에서 클릭해 해제 대상으로 고르면 `금지 해제 선택` 오버레이를 띄우지 않고 금지 표시 자체를 제거해 일반 캐릭터 카드 모습으로 되돌리며, 다시 클릭하면 기존 금지 표시가 복구된다. 금지 설정 제안을 누군가 거절하면 host가 거절한 PID를 room-state의 일회성 characterBanNotice로 동기화하고 모든 플레이어에게 해당 멤버의 displayName을 사용해 `OO님이 캐릭터 금지 설정 제안을 거절했습니다.`라고 표시한다.

3.1537: 캐릭터 금지 제안을 단순 추가가 아니라 금지 상태 토글 제안으로 변경했다. 이미 금지된 캐릭터도 방장이 금지 선택 화면에서 클릭할 수 있으며 선택 시 `금지 해제 선택`, 재클릭 시 선택 취소된다. 만장일치 확정 시 현재 금지 캐릭터는 해제되고 미금지 캐릭터는 금지된다. 제안 적용 후에도 최소 1캐릭터는 항상 허용되도록 최종 금지 수를 기준으로 검증한다. 다른 플레이어에게 표시되는 금지 제안 화면에서는 카드 위 `금지 제안` 문구와 빨간 전체 가림막/강조를 제거해 일반 캐릭터 카드만 보이게 했다.

3.1536: 캐릭터 금지 표시를 카드 전체 오버레이로 강화했다. scr-character-ban에서 `금지`/`금지 선택` 배지가 우상단 작은 딱지로만 보여 식별이 약했던 문제를 수정해, 카드 전체를 덮는 반투명 오버레이·대형 중앙 텍스트·대각선 경고 패턴으로 한눈에 보이도록 조정했다. proposal-selected 테두리와 함께 금지 상태/금지 선택 상태를 더 명확하게 구분한다.

3.1535: 캐릭터 금지 화면 표시를 수정했다. 금지 선택 중 선택한 카드는 즉시 붉은 테두리와 `금지 선택` 배지가 남고 재클릭하면 바로 해제되며, 카드 전체를 다시 렌더하지 않아 선택 상태가 눈에 확실히 보인다. 기존 금지 캐릭터는 금지 화면에서 어둡게 필터링하지 않고 일반 캐릭터 카드와 동일한 모습 위에 `금지` 배지만 표시한다. 금지 캐릭터 목록은 금지된 캐릭터만 거르지 않고 전체 캐릭터를 모두 보여주며 실제 금지 캐릭터에만 금지 표시를 붙인다.

3.1534: 캐릭터 금지 UI를 별도 모달이 아니라 실제 캐릭터 선택 화면과 같은 full-screen screen 구조로 변경했다. scr-select에 적용되던 카드/초상/정렬 CSS를 scr-character-ban에도 동일 적용하고, 금지 제안·금지 목록·금지 투표 모두 같은 160×240 캐릭터 카드 화면에서 처리한다. 전체 캐릭터 금지는 불가능하며 항상 최소 1캐릭터는 허용되도록 UI 선택 한도와 RoomService 제안 검증을 함께 추가했다.

3.1533: 캐릭터 금지창의 CharacterSelectionUI 미정의 오류를 제거하고 정렬 모드는 CharacterSortService의 저장된 캐릭터 선택 정렬값을 직접 사용한다. 방 설정의 캐릭터 금지 행을 다른 설정 행과 동일한 52px 고정 높이로 맞추고 내부 요약/버튼 줄바꿈을 막았다. 금지 요약은 평소 '없음', 확정 금지가 있으면 '1명', '2명'처럼 인원수만 표시한다.

3.1529: 유이 반격 경로 FX의 잘못된 흰색 강제값 제거. 경로 FX 색상은 기존 AttackPresentationColorService를 사용해 명시 색상/공격 색상/캐릭터 기본색 순으로 해석.

3.1528: 이동경로형 공격의 즉발 delivery.area를 제거하고 실제 이동 body-contact 판정으로 통일(레이카 일반/가호, 유이 반격, 라임/슬라임 돌진, 사이엔 절격). 기존 및 신규 경로 공격의 botDrill 전체 길이 선생성을 제거하고 실제 이동 구간에서만 경로 이펙트를 생성/연장.

3.1527: 이동기 좌표의 온라인 선행 예측을 차단하고 경로 피해를 실제 세부 이동 구간별로 처리. 교체된 이동 execution의 잔여 피해 차단. containEnteredTargets 원형 지대는 이동 거리 계산 단계에서 경계 이탈을 차단하여 이동 후 되끌림 제거.

3.1526: 리안 방패 돌진을 클레아/사이엔 등 이동경로 피해 공격과 같은 구조로 통일했다. 방패 돌진은 movement:lian-shield-dash 이동 상태 + 사각 경로 이펙트(botDrill) + body-contact 경로 피해(contactRadius 50)를 사용하며, 실제 이동 경로에만 판정한다. 기존 일회성 rect attack.guard는 제거했다. 회피 후 방패 돌진 활성 0.4초 동안 보이던 점선 actionWindowIndicator는 비활성화하고, 같은 shield-dash-ready timed state의 남은 시간을 표시하는 감소형 gauge.arc로 교체했다.

3.1525: 이동 경로 피해 처리 위치를 Effect animation update에서 실제 MovementAbilityService 이동 루프 내부로 옮겼다. 로컬 권위 Entity는 movement.move가 이번 프레임에 실제로 좌표를 변경한 직후 그 시작점→도착점 구간만 피해 판정하며, 이동 전에 예정 경로 전체를 판정하는 경로를 완전히 차단했다. 벽/적 충돌이나 중간 종료 시에도 실제 이동한 거리까지만 판정한다. 온라인 원격 source는 소유자 스냅샷으로 실제 좌표가 갱신되므로 기존 remote 추적 경로만 유지한다.

3.1524: 이동 경로 피해를 '예정된 애니메이션 경로'가 아니라 실제 Entity 이동 좌표에 결합했다. requireMovementExecution:true인 모든 movement-linked swept/body-contact 피해는 매 프레임 직전 실제 위치→현재 실제 위치 구간만 판정하며, 벽/충돌/중단으로 도달하지 못한 미래 위치에는 더 이상 피해를 주지 않는다. 이동이 마지막 프레임에 종료되어 state가 사라진 경우에도 실제로 이동한 마지막 구간까지만 한 번 처리한다. 리안 방패 돌진, 엘린 유령 돌진, 클레아/사이엔 슬라이딩 반격 등 기존 이동경로 피해 캐릭터가 공통 적용된다.

3.1523: 카논 설명 표기를 다른 캐릭터와 동일한 실제 AttackSpec 참조형으로 정리해 피해가 있는 항목 끝에 ({damage})를 표시하고, 끊어치기는 ({damage}×2)로 표기했다. 카논 평타 계열은 1타당 150 피해로 통일하고 반동 펀치의 이동용/후속 타격 AttackSpec도 모두 150으로 맞췄다. RMB 발차기/파고들기/높이차기 스킬 피해는 모두 300으로 통일했다.

3.1522: 카논 이동회피 평타(반동 펀치)의 공격 판정을 이동과 분리했다. 기존에는 동일 AttackSpec의 delivery.area가 즉시 판정된 뒤 movement.move가 시작되어 이동하면서 펀치가 나가는 것처럼 보였다. 이제 attack.kanon.recoil은 165ms 벽 관통 이동만 먼저 실행하고, 이동 지속시간이 끝나는 시점에 attack.sequence로 별도 attack.kanon.recoil-hit을 발동해 도착 위치에서 평타 판정/넉백/스테미나 회복이 발생한다. 비용/쿨다운/이동거리/공격 사거리/피해량은 유지한다.

3.1521: 카논 이동회피 평타(반동 펀치)의 이동 경로만 벽 관통으로 변경했다. attack.kanon.recoil의 movement.move collision.passWalls를 false→true로 바꿨고, 공격 판정 자체의 wallPolicy:'block'은 유지해 벽 너머 적을 직접 타격하는 기능은 추가하지 않았다.

3.1520: 페이즈의 직선 사각 공격 폭을 확대했다. LMB halfWidth 36→50, 반격 halfWidth 35→50으로 통일했으며 사거리/피해/비용/끌어오기 등 다른 수치는 유지했다.

3.1519: Kanon의 좌/우 교차 공격 시스템을 제거했다. 좌/우 별도 AttackSpec과 kanon-side 상태/전환 로직, perpendicularOffset을 모두 삭제하고 평타/반동 펀치/끊어치기/발차기/파고들기/높이차기를 각각 하나의 중앙 일자 사각 공격으로 통합했다. 기존 회피 시작 시 MOVING/STOPPED 판정, 2초 콤보 창, 공격 방향 넉백, 사거리/두께/이동거리 수치는 유지한다. 설명에서도 좌우 교차 문구를 제거했다.

3.1518: Kanon 반동 펀치 폭을 halfWidth 62→60으로 평타류와 통일했다. 좌우 교차가 시각/미리보기에서 중앙에 겹쳐 보이던 원인을 수정해 rect delivery의 perpendicularOffset을 자동 사각 이펙트와 공격 미리보기 anchor에도 공통 적용했다. Kanon의 좌우 전환은 after-attack mode.toggle 대신 각 좌측 공격이 right, 우측 공격이 left를 명시적으로 mode.set 하도록 바꿔 실제 선택 상태가 확실히 교차되게 했다.

3.1517: Kanon 판정 폭/넉백/발차기 사거리 조정. 발차기 계열 폭을 기존 평타 수준(halfWidth 44)으로 키우고 평타 계열은 halfWidth 60~62로 더 두껍게 확대했다. 평타/스킬의 일반 넉백 방향을 away-from-source가 아닌 attack 방향으로 통일했다. 일반 발차기 사거리 240을 기준으로 STOPPED 높이차기는 70%=168, MOVING 파고들기는 130%=312를 수치로 직접 기록했다.

3.1516: Kanon 전투 형상을 전부 직선 사각 히트스캔으로 변경했다. 좌/우 공격은 perpendicularOffset으로 판정 원점 자체를 좌우로 교차시키며 평타는 두껍고 발차기는 얇고 길게 구성했다. 기본 평타 전진거리는 감소, 반동 펀치 전진거리는 증가했다. 발차기 계열도 좌/우 교차 및 넉백/side toggle 경로에 통합했다. 회피 후속 판정은 회피 종료가 아니라 dodge-started 순간의 이동 입력으로 MOVING/STOPPED를 즉시 확정해 2초간 유지하고, 후속 공격의 movement.cancel-dodge로 회피 도중에도 리안처럼 콤보를 즉시 끊어 사용할 수 있게 했다. 툴팁 설명은 사용자 원문 문장으로 교체했다.

3.1515: 신규 캐릭터 카논(Kanon) 추가. HP 1300/빠름/빨강 계열의 조건형 근거리 딜러로, 회피 종료 시점의 이동 입력을 기준으로 MOVING/STOPPED 후속 상태를 2초간 생성한다. 스테미나 바 아래 2칸 게이지의 왼쪽은 이동 회피, 오른쪽은 제자리 회피를 표시하며 상태가 없으면 완전히 비어 있다. LMB는 좌/우 펀치를 번갈아 사용하고 전진+넉백+적중 스테미나 회복, MOVING LMB는 반동 펀치, STOPPED LMB는 빠른 2연타로 변환된다. RMB 발차기는 기본 0.3초/MOVING 0.6초/STOPPED 0.9초 기절로 변환된다. 범용 DodgeFollowupStateService, action-state-choice 게이지 valueRef, AttackSpec after-attack mode.toggle 처리를 추가했다.

3.1514: Nare LMB 스테미나 소모량을 200→150으로 감소시켰다. 탄속, 사거리 증가량(+85%), 회전반경 보정 등 다른 수치는 변경하지 않았다.

3.1513: Nare LMB/Counter 적중 시 사거리 증가량을 +70%→+85%로 조정했다. 회전반경 자동 보정, 마지막 적중 대상 우선 추적, 자연 사거리 소진 구조는 그대로 유지한다.

3.1512: Nare LMB/Counter 적중 시 사거리 증가량을 +98%→+70%로 조정했다. 회전반경 자동 보정, 마지막 적중 대상 우선 추적, 자연 사거리 소진 구조는 그대로 유지한다.

3.1511: Nare LMB/Counter 적중 시 사거리 증가량을 +20%→+98%로 변경했다. 회전반경 자동 보정과 마지막 적중 대상 우선 추적 구조는 그대로 유지하고, 별도의 횟수 제한/강제 한바퀴 사거리 보장 로직은 추가하지 않았다.

3.1510: Nare 재타격 수를 인위적으로 2회 제한하던 maxPostHitExtensions 방식을 철회했다. Nare LMB/Counter는 적중 시 사거리 +20%만 자연스럽게 누적하며, 한 바퀴 분량의 비행거리를 강제로 보장하던 ensureLoopTravel도 제거했다. 따라서 탄환은 기존 사거리 안에서 회전하고 재적중하면서 실제 이동거리로 사거리를 소모해 대략 2회 전후 재타격 뒤 자연스럽게 소멸한다. 회전반경 보정과 마지막 적중 대상 우선 추적은 유지한다.

3.1509: Nare LMB/Counter 적중 시 사거리 증가량을 +30%→+20%로 낮췄다. 재회전 투사체가 무한히 사거리를 갱신하지 않도록 범용 homing.maxPostHitExtensions를 추가하고 Nare에 2회를 설정했다. 첫 적중 후 1회, 첫 재적중 후 1회까지만 회전용 최소 비행거리와 적중 사거리 증가를 갱신하며, 그 다음 적중부터는 더 이상 사거리를 늘리지 않아 남은 거리 소진 후 자연스럽게 사라진다.

3.1508: Nare 탄속을 LMB 20 / RMB 8 / Counter 20으로 조정했다. LMB와 Counter의 적중 후 사거리 증가량은 +50%→+30%로 낮췄다. 3.1507의 적중 후 재회전/회전반경 자동 보정 시스템은 유지한다.

3.1507: Nare 적중 후 재회전이 실제 런타임에서 동작하도록 수정했다. 3.1506에서 preserveTurnRadius가 ProjectileModuleService homing 스냅샷에 복사되지 않던 문제를 고치고, 마지막 적중 대상을 우선 추적하며 한 바퀴 회전에 필요한 최소 비행거리와 검색 반경을 자동 확보하는 범용 옵션을 추가했다.

3.1506: Nare 투사체 탄속을 상향했다(LMB 16→20, RMB 8→10, counter 15→19). 유도 투사체에 범용 preserveTurnRadius 옵션을 추가해 탄속 증가/탄속 버프가 적용되어도 authored 기준 회전 반경이 유지되도록 maxTurnPerFrame을 현재 탄속 비율에 따라 자동 보정한다. Nare LMB/counter의 적중 후 유도에 이 옵션을 적용해 빨라진 탄환도 다시 원형 궤도로 돌아 적을 재타격할 수 있게 했다.

3.1505: CharacterTitleService의 마스터 V 칭호를 변경/추가했다. Gae는 '폐기된 전투용 안드로이드'→'전투용 안드로이드', Cyien은 신규 칭호 '격이 다른 실력자'를 사용한다. 전투 데이터와 레코드 조건은 변경하지 않았다.

3.1504: Tinya 평타 마법진 활성화의 reveal 연출 시간을 300ms→350ms로 변경했다. inputWindowMs와 공격 쿨다운/딜레이 등 다른 수치는 변경하지 않았다.

3.1503: Gae /repair의 즉시 회복량을 잃은 체력의 40%→25%로 변경했다. 설명 숫자는 기존 character.commandRepair.missingHealthRatio 데이터를 그대로 읽으므로 하드코딩 없이 25%로 동기화된다.

3.1502: Dira 캐릭터 추가를 전부 철회했다. 3.1500~3.1501에서 추가했던 Dira 캐릭터 데이터, CookingService, 식재료/요리/스토브 게이지, 투사체 재료 처리, 네트워크 cooking 상태 동기화 등 Dira 전용 변경을 제거하고 3.1499의 전투 코드 상태로 복원했다.

3.1499: Ezrail LMB 바람탄이 적뿐 아니라 아군/아군 소환수와도 충돌해 해당 위치에서 즉시 착탄하도록 변경했다. delivery.projectile에 targetRelations:['enemy','ally']를 사용해 본인(self)은 제외하고 팀원이면 종류와 무관하게 충돌한다. 탄착 후 폭발 피해는 기존 공격의 적 대상 규칙을 유지해 아군에게 피해를 주지 않는다. LMB 설명에 '아군 적중 가능'을 명시했다.

3.1498: Nyu 평타 피해를 150→100으로 낮추기 위해 baseDamage를 100으로 변경했다. RMB 마검 스킬 피해는 500으로 맞춰 damageRatio 5로 조정했고, 동일 마검의 귀환 피해도 500으로 동기화했다. 기본 피해 변경으로 의도치 않게 달라질 수 있는 설치 장판/반격 피해는 기존 절대값 150을 유지하도록 ratio를 1.5로 보정했다.

3.1497: 아츠테오의 2개 worldGauge 호(광물 품질/광석 발견 쿨다운)가 실제 반경을 EntityRingLayoutService에 전달하지 않아 상태 링·반격 활성 링이 기본 chargeRadius만 기준으로 배치되던 겹침을 범용 수정했다. worldArcGaugeState가 각 gauge.arc의 실제 radius/radiusOffset/lineWidth 및 최대충전 점선 링 반경까지 계산해 outermost bound를 반환하고, statusRadius/outermostRing/counterRadius가 이를 사용한다. WorldGaugeModuleService의 최대충전 점선 링도 각 호의 실제 반경 바로 바깥에 배치되도록 변경했다.

3.1496: Gae 설명 문구 정리. 급속 냉각 설명을 실제 데이터 placeholder 기반으로 '주변 피해 / 스테미나가 있으면 2초 동안 0까지 감소 / 해당 시간 무적+기절 / 피해 150 / 스테미나 0' 구조로 변경했다. 냉각 설명의 '최대 스테미나의 30%만큼 과열 감소' 표현도 '스테미나 감소'로 수정했으며 수치는 기존 coolingBurst 데이터에서 동적으로 읽는다.

3.1495: Cyien 절격 스킬 재사용 대기시간을 0.65초→0.3초로 변경했다. 피해/격/사거리/이동/체력 조건 등 다른 수치는 변경하지 않았다.

3.1494: Gae 급속 냉각은 발동 시 스테미나가 0이면 2초 자기 기절/무적/스테미나 감소 상태를 만들지 않고 반격 피해만 실행한다. Gae 명령 기능 상태를 duel-action에 스냅샷으로 함께 보내 수신 측이 공격 재생 직전에 동일 상태를 적용하도록 해 /pierce 활성 평타가 상대 화면에서 첫 적에 제거되던 패킷 순서 경합을 수정했다. Atsuteo worldGauge에 orbit-inventory-quality-ratio 범용 valueRef를 추가해 현재 광물 품질 1~12를 호 게이지로 표시하며 기존 RMB 쿨다운 호와는 별도 반경에 배치한다.

3.1493: Cyien 강조색을 더 밝은 #a8d5ff로 조정하고 기존 강조색 사용처를 동기화했다. 단일 호 게이지는 최대 충전 시 캐릭터 accentColor가 있으면 해당 색, 없으면 현재 게이지색을 밝힌 강조색으로 전환하며 최대충전 점선 링도 같은 색을 사용한다. layers>1 Progress/Charge와 MultiClick의 겹친 2중 호는 이 강조 전환에서 제외한다. Gae 급속 냉각은 발동 시점 스테미나를 2초에 걸쳐 정확히 0까지 감소시키고 2초간 기절한다. 발동 시 스테미나가 1 이상일 때만 무적이며, 스테미나 0에서도 반격 사용 가능하다.

3.1492: Gae 반격기를 오버클럭에서 '급속 냉각'으로 교체했다. 반격 피해를 150으로 맞추고, 적중 공격 실행 후 현재 스테미나가 0이 될 때까지 초당 1000씩 감소하는 동안 자신에게 무적+기절을 유지한다. /cooling의 지속 감소는 급속 냉각 중 중첩되지 않는다. /repair는 자연 회복 강제 시작이 아니라 잃은 체력의 40% 즉시 회복으로 변경했다. 명령 입력 자체는 NaturalHealthRegenActivityService를 건드리지 않는 기존 경로를 확인해 자연 체력 회복을 끊지 않으며 그대로 유지했다. 설명 수치는 실제 데이터 placeholder를 사용한다.

3.1491: Cyien 주색을 기존 #355a86보다 밝은 #4f79aa로 조정하고 주색 계열 공격/게이지/대시 RGB도 함께 동기화했다(강조색 #6f9ed0은 유지). 사용자가 제시한 Cyien 설명/스킬 문구와 Gae 스킬 문구를 반영하면서 설명 숫자 하드코딩을 제거했다. CharacterDescriptionService에 linked/secondary progress, progress max, guard progress, 체력 조건/피해 배율, Gae 행동 과열 충전, 냉각 선딜/감소율, 오버클럭 초당 충전/공속 값을 실제 AttackSpec/Ability/캐릭터 데이터에서 읽는 범용 placeholder를 추가했다.

3.1490: Cyien 절격 이동거리를 300→400으로 늘리고, 이동 경로 판정/이펙트 길이도 400으로 함께 맞췄다. 판정 폭은 halfWidth 44→57.2로 30% 증가시켰고 botDrill 시각 폭도 동일하게 57.2로 맞췄다. 피해/격/이동시간/체력 조건은 변경하지 않았다.

3.1489: 캐릭터 난이도 조정. 가에 4, 큐리 4, 루네프 3, 키네스 4로 변경했다. 기타 난이도 값과 전투 데이터는 변경하지 않았다.

3.1488: Cyien 반격기 피해량을 150으로 조정했다. baseDamage 100 기준 attack.cyien.counter damageRatio를 10/3→1.5로 변경했으며, 반격기의 이동/범위/격 +2/기타 동작은 유지한다.

3.1487: Cyien의 체력 기준을 전부 50%로 통일했다. 점선 연결뿐 아니라 절격의 체력 비례 추가 피해 조건과 관련 툴팁의 40% 표기도 모두 50% 미만 기준으로 변경했다. player/dummy 대상 제한 및 나머지 전투 수치는 유지한다.

3.1486: Cyien 점선 연결 조건을 대상 체력 40% 미만→50% 미만으로 변경했다. 대상 종류(player,dummy), 적 관계, owner-only 표시 규칙은 그대로 유지한다.

3.1485: Cyien의 체력 40% 미만 점선 연결 대상에 더미(dummy)를 다시 포함했다. player와 dummy만 표시되며 소환수/훈련봇 등 다른 비플레이어 적은 제외된다.

3.1484: Cyien의 체력 40% 미만 점선 연결 대상을 적 플레이어로만 제한했다. conditionalTargetLinks에 범용 targetKinds 필터를 추가하고 Cyien은 ['player']만 지정해 소환수/훈련봇/더미 등 비플레이어 적에게는 점선이 표시되지 않는다. 기존 40% 미만(strict), 적 관계, owner-only 규칙은 유지한다.

3.1483: Cyien 절격을 이전 300 사거리 기준으로 완전히 롤백했다. 실제 공격 판정 range와 delivery.area range를 390→300으로 낮춰 이동거리 300 및 botDrill 이펙트 길이 300과 일치시켰다. 피해/격/이동시간/폭은 변경하지 않았다.

3.1482: Cyien 절격 이동거리 300 롤백 이후 botDrill 이펙트만 기존 390/공격 사거리 연동을 유지해 실제 이동보다 길게 보이던 불일치를 수정했다. 절격 이동 FX 길이를 실제 movement.move distance 300과 동일하게 맞추고 scaleWithAttackRange를 제거했다. 공격 판정 사거리 390과 피해/격/이동시간은 변경하지 않았다.

3.1481: Cyien 격 최대치를 16→8로 낮췄다. 패리 성공 onBlock +1은 그대로 유지하고, 그 외 격 획득량은 절반으로 조정했다: LMB 1타 +2→+1, 2타 +2→+1, 3타 +4→+2, 절격 적중 +8→+4, 반격 적중 +4→+2. 절격 사용 조건/처치 최대충전/모든 관련 max와 툴팁도 8 기준으로 동기화했다.

3.1480: Cyien 패리가 한 실행에서 여러 투사체를 막아도 격 +1만 적용되던 공통 방어 그룹화 문제를 수정했다. attack.guard에 범용 blockCountMode:'projectile' 옵션을 추가해 Cyien 패리는 막은 투사체마다 독립적으로 onBlock 격 +1을 적용한다. 또한 3타 botDrill 벽 클리핑이 후방 angleOffset(Math.PI)을 무시하고 정면으로 raycast하던 실제 원인을 수정해 effect.spawn clipToAttackArea의 rect 유효 사거리 계산에 delivery.area angleOffset을 포함했다. 3타 연출 자체(botDrill/색/길이/폭/지속시간)는 변경하지 않았다.

3.1479: Cyien 3타 시각을 3.1474의 원래 botDrill 연출로 완전히 복구했다. 임의로 추가했던 progressRect 애니메이션/선/채움 스타일은 제거했다. 원래 색상 111,158,208, 길이 180, 폭 54, 지속시간 130ms를 그대로 사용하며, 기존 botDrill에 clipToAttackArea:true만 추가해 실제 wallPolicy:'block' 판정과 동일하게 벽에서 길이만 잘리도록 했다.

3.1478: Cyien 3타 벽 관통 FX 회귀를 수정했다. 3.1475에서 3타 이펙트를 effectShape로 바꾼 것이 원인이었으며, effectShape는 rect의 clipToAttackArea 벽 절단 렌더 경로를 사용하지 않았다. 3타 FX를 기존 공통 progressRect + clipToAttackArea 구조로 변경해 실제 wallPolicy:'block' 판정과 동일하게 벽에서 길이가 잘리도록 했다. 피해 150/사거리 180/반폭 54/격 +4/밝은 색상은 유지한다.

3.1477: Cyien 절격 이동거리를 이전 값 300으로 롤백했다(공격 판정/FX 사거리 390은 유지). 반격기는 클레아의 슬라이딩 반격 구조와 동일한 300 사거리/220ms 이동/벽·적 통과/이동 경로 접촉 피해/넉백 중화 구조로 교체하고, 클레아 전용 달 그림자·게이지 충전 대신 적중 시 Cyien 격 +4를 적용했다. 반격기 색상은 Cyien 고유색을 유지한다. Cyien 난이도를 6으로 올려 빨간 별 표시로 변경했다.

3.1476: 사이엔(Cyien) 최대 체력을 1100→1300으로 상향했다. 그 외 전투 수치와 스킬 동작은 변경하지 않았다.

3.1475: Cyien LMB 3타의 후방 베기 FX가 벽을 무시하고 끝까지 그려지던 버그를 수정했다. 실제 판정은 wallPolicy:'block'이었지만 botDrill effect.spawn은 별도 벽 클리핑 정보가 없어 180 전 구간을 렌더하고 있었다. 3타 FX를 실제 delivery.area rect와 동일한 effectShape rect + clipToAttackArea:true 경로로 되돌려 벽에서 정확히 잘리도록 했다. 밝은 3타 색 #6f9ed0과 사거리 180/반폭 54는 유지한다.

3.1474: Cyien 패리 적중 시 격이 충전되던 버그를 수정했다. attack.cyien.rmb에 남아 있던 on-hit state.progress +8 모듈을 제거해 단순히 패리 범위에 적이 맞는 것만으로는 격이 오르지 않는다. 실제 공격을 성공적으로 패리했을 때의 onBlock 격 +1은 유지한다.

3.1473: 사이엔의 내부 식별자까지 Cyien/cyien→Cyien/cyien으로 전면 변경했다. character id, attack/ability id, 격 stateKey, 패리/effect stateKey, movement stateKey, 조건/처치 보상 attackId 참조, 난이도 키 등 런타임 참조를 모두 cyien 기준으로 통일했다. 한글 표시명 '사이엔'은 유지한다.

3.1472: 사이엔의 영문 표기를 Cyien→Cyien으로 변경했다. 캐릭터 ID(cyien)와 한글 이름(사이엔), 전투 로직은 변경하지 않았다.

3.1471: 사이엔 LMB 3타의 격 충전량만 +8→+4로 조정했다. 1·2타는 각각 +2를 유지하며, 3타 피해/사거리/폭 등 나머지 수치는 변경하지 않았다. 툴팁도 3타 격 +4로 동기화했다.

3.1470: 사이엔 밸런스/표시 수정. LMB 격 획득량을 1타 +1→+2, 2타 +1→+2, 3타 +4→+8로 2배 상향했다. 격 최대 시 arc-gauge의 기존 표준 점선 완충 링(maxChargeFlash)을 다시 활성화했다(40% 미만 적 연결 점선은 유지). 패리 가드 시간을 100→150ms로 늘리고 관련 시각 지속시간도 동기화했다. 3타는 사거리 120→180, 반폭 36→54(+50%)로 확대하고 피해를 100→150으로 올렸다. 2타 피해도 100→150, 반격기 탄당 피해도 100→150으로 상향했다. 절격 비용은 300→0으로 변경했다. 툴팁은 절격의 적중 +8/치명 처치 시 최대 충전 설명을 RMB CHARGED로 이동하고 일반 패리 설명에서 제거했다.

3.1469: 사이엔 체력 40% 미만 대상 연결 점선이 월드 본체/공격 이펙트 아래 레이어에 묻혀 사라져 보일 수 있던 렌더 순서를 수정했다. ConditionalTargetLinkPresentationService 호출을 엔티티 본체 렌더 뒤의 상단 월드 레이어로 이동해 사이엔 소유자 화면에서 항상 점선이 보이도록 했다. 판정 조건(적, 현재 체력 40% 미만), 색상 #6f9ed0, 점선 간격/굵기는 유지한다.

3.1468: 사이엔 최대 체력을 900→1100으로 상향했다. 그 외 전투 수치와 스킬 동작은 변경하지 않았다.

3.1467: 사이엔 쌍도낙엽이 벽을 관통하는 것처럼 보이던 문제를 수정했다. 반격 미리보기의 previewGeometry wallPolicy를 ignore→block으로 바꿔 벽에서 잘리도록 했고, 실제 단검 투사체에도 projectile.collision wall:'remove'를 명시해 벽 충돌 시 즉시 제거되도록 계약을 고정했다. 기존 좌→우 평행 2발/100ms 간격/적중 격 +4는 유지한다.

3.1466: 사이엔 절격의 시각 색상을 3타 강조색과 동일한 #6f9ed0 / 111,158,208 계열로 통일했다. 절격의 presentation, dash-line, botDrill 색을 모두 동일 강조색으로 변경하고, 체력 40% 미만 적과 연결되는 소유자 전용 점선 색도 같은 색으로 맞췄다.

3.1465: 사이엔 절격 처치 판정을 '실제 사망'뿐 아니라 치명 피해가 부활/라임 치환 등으로 막힌 경우까지 포함하도록 확장했다. HealthService의 defeatPrevented를 DamagePipeline/네트워크 확정 패킷에 명시적으로 전달하고, 절격이 적 플레이어에게 치명타를 냈다면 부활·라임 치환으로 생존해도 격을 즉시 최대 16으로 충전한다. 소환수(kind:'summon')는 기존처럼 최대 충전 대상에서 제외한다.

3.1464: 사이엔 절격 격 소비/재충전 순서를 수정했다. 절격 시작 시 기존 격 16을 공격 판정보다 먼저 소비하고, 이후 적중 +8 / 실제 적 처치 시 즉시 최대 16이 남도록 state.progress before-attack 공통 처리 경로를 추가했다. 처치 최대 충전은 attack.cyien.rmb-charged로 처치한 경우에만 적용하며 소환수(kind:'summon') 처치에는 적용하지 않는다. 온라인에서도 확정 hit의 defeated/attackId를 이용해 동일 규칙을 적용하고, 기존 KillRewardService의 무조건 killRewardProgress 적용은 제거했다.

3.1463: 사이엔 시각/격 충전/반격 미리보기 수정. 3타와 패리 성공 시 강조색은 캐릭터 기본색(#355a86)보다 밝은 청남색 #6f9ed0으로 분리했다. 쌍도낙엽 미리보기는 별도 previewStyle 색을 제거하고 나레 반격처럼 두 평행 탄의 전체 폭을 나타내는 previewGeometry 직사각형만 사용한다. 절격에는 on-hit 격 +8을 추가하고, entity-defeated 공통 이벤트에서 캐릭터의 killRewardProgress를 적용해 오프라인/훈련에서도 절격 포함 적 처치 시 즉시 격 최대 16이 되도록 했다. 절격 시각은 클레아 반격과 같은 botDrill + dash-line 구조를 사용하되 사이엔 색으로 렌더한다.

3.1462: 사이엔 후속 수정. 반격 쌍도낙엽 미리보기는 겹친 단일 projectile 선 대신 두 평행 투사체가 차지하는 폭을 명확히 보여주는 전용 직사각형 previewGeometry를 사용한다. 사이엔 기본색은 3.1459~3.1460의 #355a86으로 복원했다. 3타는 후방 일자 판정은 유지하되 botDrill 기반의 명시적 후방 베기 FX로 교체해 확실히 보이도록 했다. 절격 이동/공격 경로는 300→390(+30%)로 늘렸고 70ms의 거의 즉발 이동과 적 관통을 유지한다. 패리 적중 시 격 +8, 적 처치 시 격 즉시 16 최대 충전 규칙과 설명을 유지·명시했다. LMB 3타 모두 suppressAttackFeedback을 적용해 평타 사용 시 공통 빨간 원 확장 FX를 제거했다.

3.1461: 사이엔 절격/패리 연출 및 색상 수정. 절격은 클레아 반격처럼 명시적 이동 공격 FX(botDrill+dash-line)를 사용하고 자동 공격 피드백의 빨간 확장 원을 suppressAttackFeedback으로 제거했다. 이동은 300 사거리에서 70ms의 거의 즉발 속도로 바꾸고 적을 관통(passEnemies:true)한다. 패리의 적 넉백은 제거했다. 3타/패리 성공/저체력 연결선의 노란 강조색은 제거하고 모두 사이엔 고유색으로 복원했으며, 고유색 자체를 #4776ad로 더 밝게 조정했다.

3.1460: 사이엔 3타 후방 공격 형태를 부채꼴에서 후방 일자(rect) 공격으로 변경했다. 2타와 동일한 사거리 120은 유지하고, 후방 방향(angleOffset:PI)으로 반폭 36의 직선 판정을 사용한다. 사이엔의 연노랑 계열 연출은 살구빛을 줄이고 더 노란 #ffe36e / 255,227,110 계열로 조정해 3타·패리 성공·저체력 연결선에 통일했다.

3.1459: 사이엔 2차 수정. 캐릭터를 목록 맨 뒤(가에 다음)로 이동하고 색상을 더 밝은 남색 #355a86으로 조정했다. LMB 1·2타 각도를 동일하게 하고 2·3타/패리 사거리를 120으로 통일·축소했으며 3타 연출은 연노랑으로 변경했다. 패리는 자동 빨간 범위 FX를 끄고 성공 시 연노랑 방패 연출, 범위 내 적 넉백 및 적중 시 격 +8을 적용한다. 적 처치 시 격은 즉시 최대 16이 된다. 격 완충 시에도 게이지 색/점멸이 변하지 않는다. 절격은 레이카 일반 반격과 동일한 300 사거리·44 반폭·220ms 이동 속도/충돌 구조를 사용하며 체력 40% 미만 2배 피해를 유지한다. 쌍도낙엽은 산탄을 제거하고 좌→우 평행 단검 2발을 100ms 간격으로 발사한다. 체력 40% 미만 적은 사이엔 소유자 화면에서만 연노랑 점선으로 연결된다.

3.1458: 신규 캐릭터 사이엔(Cyien) 1차 구현. HP 900/빠름/어두운 남색의 조건형 근거리 암살자. LMB 양손 단검은 전방 대형→전방 소형→후방의 3타를 100ms 간격으로 실행하며 각 타격 직전 실시간 조준을 다시 읽고 적중 시 격 1/1/4를 충전한다(최대16). RMB 패리는 셸로 attack.guard 공통 원리를 재사용해 100ms 방어 성공 시 격 +1. 격 16에서는 같은 RMB가 절격으로 전환되어 전방 320 경로를 이동/공격하고 기본 500 피해, 대상 체력 40% 미만이면 2배 피해를 주며 격을 전부 소모한다. 반격 쌍도낙엽은 단검 2자루를 좌우로 투척하고 각 적중마다 격 +4 및 공통 무력화 넉백을 적용한다. attack.guard onBlock progress와 대상 현재 체력 비율 피해 배율은 캐릭터 비의존 범용 데이터 옵션으로 추가했다.

3.1457: 가에 평타의 기본 과열 충전량을 +200→+150으로 조정했다. staminaGainPerAction, LMB 도움말, 평타 사용에 필요한 빈 스테미나 기준을 모두 150으로 동기화했다. 감전은 가에 평타의 실제 충전량과 사용 조건에 영향을 주지 않는다.

3.1456: 일반 온라인 채팅창을 ESC로 닫았을 때 다음 재오픈 시 직전에 입력되어 있던 채팅 문장을 전체선택 상태로 복원한다. 전송 후 마지막 전송 문장을 전체선택하는 기존 동작은 유지하며, 외부 클릭으로 닫는 경우에는 기존처럼 draft를 보존하되 커서는 끝에 둔다.

3.1455: 가에 평타의 감전 중 추가 스테미나 요구량을 제거했다. 감전 여부와 무관하게 평타 사용에 필요한 빈 스테미나는 기본 과열 충전량과 동일한 200으로 고정한다. 감전은 자연 스테미나 회복만 감소시키며 가에 평타의 실제 과열 충전량과 사용 조건에는 영향을 주지 않는다.

3.1454: 가에 평타의 기본 과열 충전량을 +100→+200으로 상향했다. staminaGainPerAction, LMB 도움말, 평타 사용에 필요한 빈 스테미나 기준을 모두 200으로 동기화했다. 감전은 실제 충전량에는 계속 영향을 주지 않으며, 사용 조건의 기존 1.4배만 적용되어 감전 중에는 빈 스테미나 280이 필요하다.

3.1453: 가에 처치 보상과 감전 과열 규칙 수정. 적 처치 시 일반 캐릭터처럼 스테미나를 최대로 회복하지 않고 가에는 과열 게이지를 0까지 감소시킨다. 캐릭터 ID 분기 대신 killRewardStaminaMode:'decrease' 데이터로 처리한다. 또한 감전 중 가에의 실제 행동 과열 충전량 +40% 증가는 제거해 평타 적중/사용 시 실제 충전은 항상 기본 +100을 유지한다. 감전 중 평타 사용에 필요한 빈 스테미나 요구량 140은 그대로 유지한다.

3.1452: 미아루키 `회복 반격`의 자기 회복 누락 수정. 회복 모듈이 recipient:'target'인데 on-hit 시점을 명시하지 않아 친화 대상 delivery.area가 자기 자신을 포함해도 resource.restore 실행 경로에 들어가지 못하던 문제를 수정했다. 기존 범용 on-hit resource.restore 경로를 사용하도록 when:'on-hit'을 명시해 범위 내 자신과 아군 각각에게 기존 회복량 200을 정상 적용한다. 적 피해/반격 CC/범위는 변경하지 않는다.

3.1451: 가에 `/cooling` 지속 냉각량을 초당 150→200으로 다시 상향했다. 도움말의 `스테미나 초당 200 감소` 표기와 실제 동작을 다시 일치시켰다. 냉각 스킬의 최대 스테미나 30% 감소, 방전 차단, 감전 비적용 규칙은 변경하지 않는다.

3.1450: 가에 냉각 선딜 취소와 감전 과열 충전을 보정했다. 냉각 선딜 중 외부 기절/빙결/수면/무력화 등 행동불능 CC가 들어오면 cooling-windup을 즉시 취소해 예약된 완료 원형 FX와 냉각 효과가 모두 실행되지 않는다(자기 냉각 선딜 STUN은 제외). 감전 중 가에의 일반 행동 과열 충전량도 평타 요구량과 동일하게 +40% 적용되어 기본 +100이 +140이 된다. 냉각/반격 오버클럭 자동충전은 이 감전 배율을 받지 않는다.

3.1449: 가에 평타의 최소 빈 스테미나 요구량에 감전 상태를 반영한다. 기본 요구량은 100을 유지하고, 감전 중에는 감전의 40% 자연회복 감소 수치에 대응해 요구량만 +40%인 140으로 증가한다. 실제 평타 과열 충전량 +100, 냉각, 반격 오버클럭 충전은 변경하지 않는다. 조건은 resource.stamina-capacity-at-least의 범용 statusMultiplier 옵션으로 처리한다.

3.1448: 도움말 조작키의 회피 스테미나 표기 오류 수정. 실제 GAME_DATA.dodge.cost는 400인데 도움말에 40으로 적혀 있던 고정 문구를 400으로 동기화했다. 전투 로직과 실제 회피 비용은 변경하지 않는다.

3.1447: 가에 냉각의 감전 연동을 제거했다. 감전은 규칙대로 자연 스테미나 회복 속도만 감소시키며 `/cooling` 지속 냉각과 냉각 스킬의 최대 스테미나 30% 감소량에는 영향을 주지 않는다. 방전만 기존처럼 냉각을 완전히 차단한다. 반격 후 오버클럭 자동 충전은 계속 감전/방전에 막히지 않는다.

3.1446: 가에 냉각에 감전 배율 적용. 가에는 자연 스테미나 회복을 사용하지 않고 스테미나 감소가 곧 냉각이므로, 감전의 staminaRegen 배율을 `/cooling` 지속 감소와 냉각 스킬의 30% 감소량에 적용한다. 기본 감전 40% 감소 시 냉각량/속도도 60%가 되며, 방전은 기존처럼 냉각을 완전히 차단한다. 반격 후 오버클럭 자동 충전은 냉각이 아니므로 감전/방전의 냉각 배율을 받지 않는다. 다른 캐릭터의 일반 스테미나 회복 규칙은 변경하지 않는다.

3.1445: 가에 냉각/방전 및 소환수 무력화 수명 수정. 방전이 활성 중이면 가에의 `/cooling` 지속 냉각과 스킬 완료 시 최대 스테미나 30% 냉각을 모두 막도록 staminaRegenBlocked 공통 상태를 확인한다. 반격 후 오버클럭의 초당 자동 과열 충전은 냉각과 분리해 기존처럼 StaminaService.restore를 직접 사용하므로 방전에 막히지 않는다. 소환수 무력화가 영구 잔류할 수 있던 원인은 carry/relocate/swap/새 movement 시작 경로가 neutralize completion이 달린 forcedMotion을 `null`로 직접 버리던 것이어서, 해당 경로들을 MovementService.finalizeForcedMotion()으로 통일해 반드시 knockback phase를 recovery phase로 전환한 뒤 정상 만료되게 했다.

3.1444: 가에 LMB 발당 피해를 100→150으로 상향했다. Base Damage를 150으로 올리고 LMB damageRatio 1을 유지해 평타 1발당 150 피해가 되도록 맞췄다. 반격기는 기존 요청값 100 피해를 유지하도록 damageRatio를 2/3으로 조정했다.

3.1443: 가에 LMB 기본 사거리를 450→400으로 낮췄다. `/range` 기능의 고정 추가 사거리 +150은 그대로 유지하므로 RANGE 활성 시 총 사거리는 550이다.

3.1442: 전역 사거리 분류 기준 조정. 근거리 상한을 400→350으로 낮췄다. 따라서 초근거리는 기존처럼 150 이하, 근거리는 151~350, 중거리는 351~750으로 분류된다. 원거리/초장거리 기준은 유지한다.

3.1441: 가에 LMB 사거리 조정. 기본 사거리를 390→450으로 변경하고 `/range` 활성 시 총 사거리가 정확히 600이 되도록 고정 추가 사거리를 227.5→150으로 변경했다.

3.1440: 가에 냉각 완료 원형 FX 추가. 엔소냐 RMB 발동 펄스/베르 RMB 재사용 FX와 같은 기존 areaCircle 프레젠테이션을 재사용해, 냉각 0.5초 선딜이 정상 완료된 순간 캐릭터 중심에 짧은 원형 펄스를 1회 생성한다. 공격 판정/넉백/범위 게이지는 다시 추가하지 않았으며, 넉백으로 선딜이 취소되면 완료 FX도 생성되지 않는다.

3.1439: 가에 냉각을 순수 자원 감소 스킬로 단순화. 냉각의 범위 공격/피해/넉백/cooling-burst 후속 공격과 공격 미리보기·annularDoubleSweep 원형 게이지 FX를 제거하고, 0.5초 선딜 후 최대 스테미나의 30%만 감소하도록 변경했다. 냉각 선딜의 넉백 취소 토큰은 유지한다. 가에 최대 체력은 1200→1300, 회피 스테미나 충전량은 +200→+400, 일반 행동/평타 스테미나 충전량은 +150→+100으로 조정하고 LMB 최소 남은 공간/툴팁도 100으로 동기화했다.

3.1438: 가에 냉각 선딜 넉백 취소 수정. 냉각 0.5초 선딜을 actionState의 interruptible cooling-windup 토큰으로 관리하고, 선딜 FX에 고유 key를 부여했다. MovementService.knockback 진입 시 진행 중 냉각을 취소해 예약된 후속 공격/스테미나 감소가 실행되지 않게 하며, 공격 미리보기·선딜 FX·냉각 자기 STUN도 즉시 정리한다. 예약 continuation은 시작 당시 token과 현재 windup state가 일치할 때만 완료되므로 취소 뒤 늦게 발동하지 않는다.

3.1437: 가에 `/cooling` 지속 효과의 과열 감소량을 초당 200→150으로 낮췄다. CommandFeatureService.update의 지속 감소 수치와 툴팁 `스테미나 초당 150 감소 활성화`를 함께 동기화했다.

3.1436: 가에 이동속도를 `빠름`에서 다시 `느림`으로 낮췄다. 실제 이동속도 수치도 4.25→3.75로 복구하고 moveLabel을 `느림`으로 동기화했다.

3.1435: 가에 사거리/반격기/체력 조정. LMB 기본 사거리를 650→390으로 40% 감소시켰다. `/range` 기능으로 추가되던 기존 +35%분(650×0.35=227.5)은 감소시키지 않도록 commandFeatureProfile에 rangeBonus:227.5를 두고, 레이저 사거리 계산을 기본 사거리 + 고정 추가 사거리 방식으로 변경해 RANGE 활성 시 총 617.5가 된다. 반격기 피해는 150→100으로 낮춰 damageRatio 1.5→1, 최대 체력은 1300→1200으로 변경했다.

3.1434: 가에 기본 공격/냉각/체력 조정. LMB 발당 피해를 100으로 맞추기 위해 baseDamage를 150→100으로 변경하고, 반격기의 기존 150 절대 피해는 damageRatio 1→1.5로 보존했다. LMB 투사체 속도는 30→40, 공격 간격은 0.4초→0.6초(cd 600ms)로 변경했다. 냉각은 현재 스테미나 50% 감소 방식에서 다시 최대 스테미나의 35%를 감소시키는 방식으로 변경하고 툴팁/런타임을 동기화했다. 최대 체력은 1500→1300으로 낮췄다.

3.1433: 가에 냉각 스킬 감소 방식 변경. 기존 최대 스테미나 기준 25% 고정 감소를 제거하고, 냉각 발동 완료 시점의 현재 스테미나를 기준으로 50% 감소하도록 변경했다. 툴팁도 `현재 스테미나의 50%만큼 과열 감소`로 동기화했다.

3.1432: 가에 명령어/기본 수치 조정. 명령어의 activate/system/mode/operation 접두·접미 구문을 모두 제거해 `/laser`, `/cooling`, `/accelerate`, `/repair`, `/dual`, `/pierce`, `/instant`, `/wide`, `/range`의 단일 키워드만 입력하면 기능이 실행되도록 commandMap과 툴팁을 동기화했다. 최대 체력은 1300→1500, 일반 행동/평타 스테미나 충전량은 +200→+150으로 낮추고 LMB 사용 가능 최소 남은 공간도 150으로 맞췄다. 이동속도는 3.75→4.25로 높이고 표시를 `빠름`으로 변경했다.

3.1431: 가에 명령어 축약 오해 수정. `/system laser activate`에서 맨 앞 `/system`만 제거해 `/laser activate`로 복구했다. 나머지는 기존 3.1430처럼 맨 앞 접두어만 제거된 `/cooling activate`, `/accelerate activate`, `/mode dual`, `/mode pierce`, `/mode instant`, `/operation wide`, `/operation range`를 유지하며 `/system repair`도 그대로 유지한다.

3.1430: 가에 명령 입력/명령어 축약. '/' 명령 입력 중 자기 자신에게 부여하던 command-input:gae STUN과 종료 시 해당 STUN 제거 코드를 모두 삭제했다. 명령어의 맨 앞 SYSTEM/LASER 접두 구문을 제거해 `/activate`, `/cooling activate`, `/accelerate activate`, `/mode dual`, `/mode pierce`, `/mode instant`, `/operation wide`, `/operation range`로 축약했으며 `/system repair`만 예외로 그대로 유지했다. 가에 툴팁 명령어 표기도 같은 구문으로 동기화했다.

3.1429: 가에 평타 행동 스테미나 충전량을 +300에서 +200으로 낮췄다. staminaGainPerAction과 LMB 툴팁의 스테미나 표기를 함께 +200으로 동기화했으며, 기존 과열/행동 충전 공통 경로는 그대로 유지한다.

3.1428: 가에 회피 스테미나 충전량을 +400에서 다시 +200으로 복구했다. 기존 gain-mode 공통 경로를 그대로 사용하므로 회피 시 일반 스테미나 비용은 없고 +200만 충전되며, 남은 스테미나 공간이 200 미만이면 회피를 사용할 수 없다.

3.1427: 메라 모나 반격기 범위 FX 중복 수정. attack.meramona.counter의 커스텀 areaCircle이 delivery.area 자동 범위 FX와 동시에 생성되면서 하나는 wallPolicy:block polygon을 따르고 다른 하나는 완전한 원형으로 벽을 뚫어 보이던 문제를 수정했다. 반격 커스텀 areaCircle에 clipToAttackArea:true와 replaceAutoAreaEffect:true를 적용해 실제 벽 차단 범위 하나만 표시한다.

3.1426: 가에 회피 스테미나 충전량 상향. dodgeResourcePolicy의 gain amount를 +200에서 +400으로 변경했다. 기존 gain-mode 공통 경로를 그대로 사용하므로 회피 시 일반 스테미나 비용은 없고 +400만 충전되며, 남은 스테미나 공간이 400 미만이면 회피를 사용할 수 없다.

3.1425: 메라 모나/가에 명령 및 원격 오버클럭 수정. 메라 모나 emerge 발동 FX의 별도 areaCircle이 wallPolicy:block 판정과 무관하게 완전한 원형으로 그려지던 경로를 clipToAttackArea:true + replaceAutoAreaEffect:true로 통합해 실제 벽 절단 polygon만 사용하도록 했다. 온라인 duel-state에 commandOverclockActive를 추가하고 원격 Entity의 _commandOverclock 상태를 매 상태 패킷에서 canonical 값으로 갱신해, 가에 냉각 원게이지가 상대 화면에서 이전 반격 오버클럭 색으로 영구 고정되던 문제를 수정했다. 가에 '/' 명령 입력 모드 진입 시 sourceId `command-input:gae`의 무기한 STUN을 자기 자신에게 부여하고 입력 종료/실행/취소 시 즉시 제거한다.

3.1424: 메라 모나 변신 원게이지 벽 윤곽 교정. 3.1423의 clipMaskOnly 방식은 원형 stroke를 벽 polygon으로 마스킹한 뒤 절단면만 추가해 윤곽 자체가 여전히 원형 기준으로 보였다. 메라 모나는 clipMaskOnly를 제거하고 annularDoubleSweep의 기존 ProgressiveClippedAreaOutlinePresentationService가 현재 sweep 진행도와 AreaGeometryService의 wallPolicy:block raycast 결과로 만든 실제 clipped polygon 전체를 단 한 번 stroke하도록 변경했다. clipAttackId의 별도 wallCutSegments는 clipMaskOnly 모드에서만 생성하도록 제한해 메라 모나에 이중 윤곽이 다시 생기지 않는다.

3.1423: 메라 모나/가에/뉴 수정. 메라 모나 변신 annularDoubleSweep는 원본 원호를 clip mask로 한 번만 그리는 3.1422 구조를 유지하면서, clipAttackId로 계산한 실제 벽 차단 polygon에서 AreaWallCutPresentationService의 절단 segment만 추출해 벽에 의해 새로 생긴 절단면 윤곽선을 추가했다. 가에 오버 클럭 공격속도 버프 raw attackRate를 1/3에서 .5로 변경해 버프 표기와 데이터 모두 +50%로 맞췄다. 뉴 LMB의 출혈 status.apply, 출혈 태그, 툴팁의 출혈 문구를 모두 제거했다.

3.1422: 가에/메라모나 후속 수정. 냉각의 시전 후 과열 감소량을 최대 스테미나 30%→25%로 변경하고 설명도 25%로 동기화했다. 가에 전용 command runtime에 resetEntity를 추가하고 캐릭터 교체 시 command state/오버클럭/전용 버프/초기화 플래그/lastStaminaUse를 정리해 가에 사용 후 다른 캐릭터로 바꿨을 때 일반 스테미나 자연충전이 막히지 않게 했다. 메라 모나 변신 annularDoubleSweep는 clipMaskOnly로 벽 clip만 적용하고 별도의 진행 polygon 윤곽선을 다시 그리지 않도록 해 이중 윤곽선을 제거했다. 냉각 beginCooling의 coolingPreviewAttack 선언보다 먼저 참조하던 TDZ ReferenceError를 선언 순서 교정으로 수정했다. INSTANT 비관통 beamLine은 벽 clip 뒤에도 enemyStopRange를 다시 최종 clamp하고 endFlare:false를 사용해 첫 적 뒤로 시각 효과가 넘어가지 않는다. 오버클럭 중 회피는 이동 자체는 허용하되 가에의 +200 과열 충전을 적용하지 않는다. ACCELERATE 이동속도 증가량은 +25%→+35%로 변경했다.

3.1421: 가에/메라모나/히트스캔 FX 수정. 가에 냉각과 메라 모나 변신 annularDoubleSweep에 실제 delivery.area의 wallPolicy:block polygon을 전달해 선딜 원형 진행 이펙트도 벽에 의해 잘리게 했다. Ability effect.spawn에 범용 clipAttackId를 추가해 현재 Ability AttackSpec과 다른 후속 범위 공격의 geometry로도 clip할 수 있다. AttackModuleService.forEachModule은 안정적인 module key를 전달하고 afterAttack effect.spawn은 execution별 key로 dedupe해 동일 히트스캔 실행에서 커스텀 FX가 중복 생성되는 경로를 차단했다(루네프 얼음 마법 포함). spawnAttackEffect는 effect.spawn의 perpendicularOffset과 일치하는 delivery.area를 선택하고 해당 좌우 origin에서 effect를 생성하며, stopAtFirstEnemy rect는 실제 첫 적 접촉 사거리까지 effect.range도 줄여 가에 INSTANT가 비관통 상태에서 적 뒤까지 보이지 않게 한다. INSTANT+DUAL은 좌우 ±14 판정/시각 origin을 동일하게 사용한다. 가에 오버 클럭 tooltip은 본문에서 초당 수치를 분리해 costText `스테미나 초당 +600`으로 표시하고, 반격 attack 자체에 행동충전제외 태그를 추가해 발동 순간 일반 행동 +300이 섞이지 않게 했다. 오버클럭은 실제 반격 0.3초 선딜 종료/공격 실행 뒤부터 초당 +600만 적용된다. 오버클럭 중 냉각 기능의 지속 감소는 정지하며 상태 텍스트는 노랑, 냉각 선딜 annularDoubleSweep 색도 오버클럭의 연한 빨강~주황 색을 사용한다.

3.1420: 가에 설계/입력/instant/cooling/오버클럭 교정. 냉각 설명 피해량은 본문 삽입형 문장을 제거하고 끝에 `(50~400)`으로 표기하며, cooling 명령 설명은 `스테미나 초당 150 감소 활성화`로 정리했다. 가에 반격 오버클럭은 최초 설계대로 0.3초 반격 선딜과 범위 피해가 끝난 실제 발동 시점부터 시작해 초당 600 과열을 최대까지 자동 충전하고, 그동안 공격속도 +50%(attackRate 1/3)와 일반 행동 과열 충전 차단을 적용하며 최대 도달 시 종료한다. 냉각은 오버클럭 중 일시 정지하고 기능 상태 텍스트를 노란색으로 표시한다. 냉각 선딜 FX는 임시 counterCharge 링을 제거하고 메라 모나 변신과 같은 annularDoubleSweep 원형 진행 이펙트로 교체했으며 500ms 동안 실제 cooling-burst 범위 미리보기를 유지한다. 명령 입력은 hidden input/DOM focus 구조를 완전히 제거하고 전역 KeyboardEvent.code만으로 버퍼를 처리해 입력 후 게임 조작이 잠기는 경로를 없앴다. instant+dual은 angleOffset이 아닌 좌우 perpendicularOffset ±14의 실제 평행 히트스캔 2갈래로 유지하고, instant 상태에서 pierce가 비활성일 때 delivery.area stopAtFirstEnemy를 사용해 첫 적 뒤로 피해가 관통하지 않는다. LMB는 남은 과열 공간이 300 이상일 때만, 회피는 남은 과열 공간이 200 이상일 때만 사용 가능하다. 가에 기능 상태 텍스트는 LASER/COOLING/ACCELERATE를 첫 줄, DUAL부터 두 번째 줄에 표시한다. 냉각 최소 피해는 50, 최대 400의 50 단위 단계이며 넉백 최소 84/최대168을 유지한다.

3.1419: 가에 후속 수정. 일반 행동 과열 충전량을 150→300으로 변경하고 LMB 설명을 +300으로 동기화했다. 명령 입력 잠금은 openState뿐 아니라 실제 hidden input focus까지 함께 검사해 포커스가 사라진 상태에서는 즉시 self-heal close하며 close 시 키 상태도 정리한다. instant+dual은 angleOffset로 중앙에서 갈라지던 방식을 제거하고 delivery.area/effect.spawn의 범용 perpendicularOffset을 사용해 파비식 좌우 평행 간격을 유지한다. 캐릭터 아래 명령 문자열을 조금 더 아래로 내리고 그 위에 REPAIR 제외 8개 기능 상태를 10px 텍스트로 항상 표시하며 활성 초록/비활성 빨강을 사용한다. 냉각 500ms 선딜에는 실제 cooling-burst 원형 공격 미리보기와 기존 counterCharge 원형 진행 이펙트를 생성하고 종료 시 정리한다. command-feature-count-ratio를 EntityRingLayoutService 정식 worldArcGaugeState에 추가하고 가에 gauge.arc에 maxChargeFlash:true를 적용해 상태/반격 링과 겹치지 않으며 8개 완전 활성 시 기존 최대충전 점선링을 사용한다. 오버 클럭은 고정 지속시간을 제거하고 초당 600 과열을 충전하며 최대치 도달 시 자동 종료/공격속도 +50% 버프 해제된다. 오버클럭 중 가에의 모든 공격 presentation/effect/projectile 색을 연한 빨강~연한 주황 사이로 동적 치환한다. Training.dodge의 선행 resource.can-spend-stamina 조건도 dodgeResourcePolicy gain 캐릭터에서는 우회해 가에 회피가 비용 없이 +200만 충전하고 최대 과열일 때만 차단된다.

3.1418: 가에 명령/냉각/과열 후속 수정. 레이저 명령 접두사는 /attack에서 /laser로 복원하고 POWER 명령/툴팁/디버그 토글/버프 기능을 제거했다. REPAIR 명령은 `/system repair`로 단축하고 설명을 `즉시 자연 체력 회복 시작`으로 변경했다. COOLING 설명 끝에 `활성화`를 추가했다. 명령 입력 hidden input이 포커스를 잃거나 창이 비활성화될 때 openState를 자동 종료해 입력 잠금이 남는 현상을 방지했다. 냉각 범위 공격의 명시 areaCircle을 제거해 delivery.area 자동 FX와 중복되던 원형 연출을 하나로 줄였다. 냉각 피해는 사용 직전 과열 비율을 8단계로 올림 처리해 50 단위 0~400 피해를 사용하며 설명에 0~400을 표기한다. 과열 0에서는 냉각 사용 불가. 냉각 0.5초 자기 제어는 속박에서 기절로 변경했다. `/system cooling activate`의 지속 감소 계산을 프레임 ms 기준 초당 200으로 보정(dt/1000)해 일반 행동 충전과 정상 병행된다. 가에 worldGaugeModules에 REPAIR 제외 지속 활성 기능 8개의 활성 개수/8 비율을 표시하는 gauge.arc를 추가했다. DUAL 평행 레이저 간격은 파비식 perpendicularOffset 12→14로 소폭 증가했다.

3.1417: 가에 과열/명령/레이저 후속 수정. 회피는 일반 스테미나 비용을 쓰지 않고 성공 시 과열 +200만 적용하며 최대 과열에서는 회피/평타/반격 같은 충전 행동을 사용할 수 없게 했다(냉각은 과열 해소용이라 예외). '/' 명령 입력은 KeyboardEvent.code를 ASCII 영문으로 직접 해석해 OS 한/영 상태와 무관하게 영문 명령이 입력된다. 냉각 설명 끝에 '/ 스테미나 0'을 명시하고 냉각 자체는 과열을 전혀 충전하지 않는다. DUAL은 에라 파비 LMB와 같은 spread 0 + perVolleyPellets + perpendicularOffset 방식으로 좌우 평행 2갈래 투사체를 동시에 발사한다. 오버 클럭은 시간 충전 대신 반격 입력 즉시 과열을 최대치로 만들고 2초간 공격속도 +50% 버프를 부여한다. REPAIR는 토글 상태를 제거하고 명령 실행 시 자연회복 대기 상태를 즉시 완료시키는 1회성 명령으로 변경했다. POWER는 레이저 전용 damageRatio가 아니라 BuffService damage +50% 공격력 증가 기능으로 변경했다. 모든 /laser 명령은 /attack으로 변경했다. COOLING 활성화는 과열을 초당 200 감소시킨다. 말살 레이저 기본 쿨다운은 400ms. 냉각 폭발 넉백은 과열 0~100%에 따라 84~168로 변경했다. 이미 활성화된 지속 기능 명령을 다시 입력하면 노란색으로 표시하며 상태는 유지한다. 캐릭터 아래 명령 글꼴은 11px→16px로 확대했다.

3.1416: 뉴/가에 후속 수정. 뉴 반격 선딜 중 마검 위치의 follow-up 공격 미리보기가 누락되던 문제를 수정해 counter preview.projectiles에 nyu-dark-sword/attack.nyu.counter-sword를 연결하고, 미리보기 조회도 actionState 누락 시 살아있는 ProjectileService 항목을 fallback 검색한다. GAME_DATA.characters 선언 순서에서 가에를 뉴 뒤로 이동했다. 가에 '/' 명령 입력은 화면 하단 DOM 입력창을 제거하고 숨김 입력만 사용하며, 입력 문자열/성공·실패 결과를 큐리 공식처럼 캐릭터 하단 월드 UI에 직접 그린다. 가에 평타는 기존 laser-bolt 투사체 표현을 사용하고 instant 모드는 기존 instant-laser delivery.area + beamLine 경로를 사용한다. 개발자 패널에는 가에의 10개 기능을 개별 ON/OFF 할 수 있는 토글 버튼을 추가했다. 가에는 공격 스테미나 사용량 배율을 행동 스테미나 충전량에 반전 적용해 사용량 -30% 효과는 충전량 +30%, 사용량 +30% 효과는 충전량 -30%가 되도록 했다. 기본 행동 충전량은 +150이며 LMB 설명 비용도 '스테미나 +150'으로 표시한다. 냉각은 활성 비용 0을 유지하고 총 쿨다운을 700ms로 변경했으며 500ms 속박은 그 쿨다운 안에 포함된다.

3.1415: 신규 캐릭터 가에 추가. 체력 1300/느림/#7f8992/성장형 중거리 딜러. 스테미나를 과열 게이지로 사용해 시작 0, 일반 자동 회복 없음, 비이동 전투 행동 시 충전. LMB 말살 레이저는 명령 활성화 후 사용하며 dual/pierce/instant/wide/range/power 기능을 누적 활성화한다. RMB 냉각은 0.5초 자기 속박 후 과열량 비례 광역 피해/넉백 및 최대 스테미나 30% 감소. L-Shift 오버 클럭은 최대 과열까지 자동 충전하며 충전 중 공격속도 100% 증가 및 행동 과열 충전을 차단. '/' 전용 명령 입력 UI와 온라인 기능 동기화를 추가했다.

3.1414: 뉴 마검 적 적중 후 소멸 버그 수정. 온라인 duel-hit-confirmed의 비관통 투사체 소비 경로가 collisionPolicy.passEnemies=false이면 무조건 finish/remove 하던 구조 때문에, 로컬에서 atTarget linger로 멈춘 뉴 마검도 적중 확정 패킷 도착 시 삭제되고 있었다. 이제 arrival.linger.atTarget=true인 비관통 투사체는 확정 적중 시 projectile.impact를 처리한 뒤 기존 stationaryArrival을 유지하거나 없으면 beginLinger로 전환하며 제거하지 않는다. 일반 비관통 투사체는 기존대로 적중 후 소비된다.

3.1413: 뉴 RMB 툴팁 설명 수정. 마검 설명을 '벽을 관통하는 마검을 날려 적중 시 피해. 탄착지점에 남아 주변에 피해를 주며, 뉴가 접근하면 회수 ({damage})'로 변경했다. 다른 수치/동작은 유지한다.

3.1412: 뉴 캐릭터 설명 문구 수정. desc를 '마검 때문에 중2병 걸린 작은 요정 캐릭터'로 변경하고, 다른 수치/스킬/동작은 유지한다.

3.1411: 제리 툴팁 설명 보강. RMB C4와 L-Shift 폭발 점프 설명에 폭발 중심에 가까울수록 넉백 거리가 증가한다는 내용을 추가했다. 실제 넉백 수치와 동작은 변경하지 않았다.

3.1410: 반격기의 일반 무력화 넉백 거리 통일. counter 계열 공격/실행 경로에서 고정 거리형 movement.neutralize-knockback의 distance를 모두 84로 통일했다. distanceMode:'attack-range-end', distanceMode:'impact-proximity'처럼 별도 거리 계산을 쓰는 특수 무력화 넉백은 기존 동작을 유지한다.

3.1409: 뉴 RMB 최소 사용 딜레이를 0.5초로 단축. attack.nyu.rmb의 cd를 900ms→500ms로 변경했으며 마검 피해/사거리/착탄/귀환/장판 동작은 유지한다.

3.1408: 뉴 마검 귀환/런타임 오류 수정. projectile.recall 및 stationary 근접 회수 경로가 실제 clearBoundField 메서드가 있는 ProjectileService가 아니라 TargetPointProjectileService를 잘못 호출하던 TypeError를 수정했다. 이제 수동 귀환/근접 자동 귀환이 시작되는 즉시 마검에 귀속된 범위 피해 field.area를 제거한 뒤 귀환한다. CharacterCardLayoutService는 Object.freeze 객체의 topPlayerBaseline을 직접 갱신해 발생하던 read-only TypeError를 제거하고, 측정 기준값을 서비스 외부의 가변 캐시 변수로 분리했다.

3.1407: 무기한 정지 투사체의 색/알파가 어두워지는 공통 렌더 버그 수정. ProjectileVisualPositionService가 stationaryArrival의 duration/endsAt이 Infinity인 경우 remaining/duration을 계산하면서 Infinity/Infinity=NaN이 되어 alpha/strokeAlpha가 비정상화되던 원인이었다. 이제 유한 duration + fadeOut일 때만 남은 시간 비율로 페이드하고, 무기한 stationaryArrival은 alpha/strokeAlpha를 항상 1로 유지한다. 현재 persistent:true 무기한 linger를 사용하는 것은 뉴 마검뿐이지만, 이후 같은 구조를 쓰는 다른 투사체도 동일 문제 없이 정상 밝기를 유지한다.

3.1406: 뉴 마검 충돌/회수 구조 및 피해량 조정. Base Damage를 150으로 설정해 평타/마검 장판 틱/반격/마검 위치 후속 반격을 150으로 맞추고, RMB 일반 직격과 귀환 직격은 damageRatio 4로 600 피해가 되게 했다. RMB 마검은 적 관통을 제거해 최초 적 접촉 시 그 위치에서 persistent linger 상태로 멈추고 장판을 생성한다. projectile.return에 sharedHitIds 옵션을 추가해 같은 마검에 한 번 피해를 받은 대상은 outbound/returning phase를 합쳐 1회만 피해를 받는다. linger에 sourcePickupMode:'return'을 추가해 뉴가 회수 범위에 직접 접근해도 즉시 삭제하지 않고 장판을 종료한 뒤 실제 projectile.return 귀환 경로로 전환되어 귀환 충돌 판정을 수행한다.

3.1405: 뉴 평타 조작감 조정. LMB의 300ms preview/timing.delay 선딜레이를 제거해 입력 즉시 공격하도록 변경했다. 기존 sector/arcSweep의 angleOffset:.35를 제거해 공격이 조준 방향 기준 좌우 대칭이 되도록 했으며, 평타 부채꼴 총 각도를 200도(halfAngle=100도=1.7453292519943295rad)로 확대했다. 사거리/피해/출혈 등 나머지 평타 수치는 유지한다.

3.1404: 뉴 마검 투사체 크기 조정. 투척 RMB와 귀환 swordReturn의 delivery.projectile radius/hitRadius를 모두 20으로 통일하고, anchor-cross 투사체 프레젠테이션 radius도 20으로 맞춰 실제 판정 크기와 시각 크기가 동일하게 보이도록 했다. 다른 사거리/피해/장판/회수 동작은 변경하지 않았다.

3.1403: 뉴 피해량 재조정. Base Damage가 평타 피해를 따라가므로 baseDamage를 150→100으로 변경했다. 평타와 마검 장판 틱은 damageRatio 1로 100 피해, 반격기와 마검 위치 후속 반격도 damageRatio 1로 100 피해가 되도록 낮췄다. 앞서 정한 마검 일반 직격/귀환 직격 400은 유지하기 위해 두 AttackSpec damageRatio를 각각 4로 재조정했다.

3.1402: 뉴 마검 피해/회수 조건 조정. Base Damage 150 기준 RMB 일반 직격과 귀환 직격을 각각 400으로 맞춰 attack.nyu.rmb 및 attack.nyu.sword-return damageRatio를 8/3으로 통일했다. `돌아와!` 설명을 '착탄한 마검이 뉴에게 복귀'로 변경했다. 또한 범용 projectile.stationary-arrival 조건과 projectile.recall requireStationaryArrival 옵션을 추가해 뉴 RMB 재입력은 마검이 사거리/경계에 착탄해 stationaryArrival 상태가 된 뒤에만 귀환 가능하며, 비행 중 재입력은 스테미나 소모/귀환/새 투척 모두 발생하지 않는다.

3.1401: 뉴 Base Damage 기준 수정. Base Damage는 평타 피해를 따라가므로 baseDamage를 100→150으로 변경하고, 평타 damageRatio를 1, RMB 마검 직격 damageRatio를 4, 마검 장판 틱 damageRatio를 1로 재조정했다. 결과적으로 평타 150 / 마검 직격 600 / 장판 틱 150이 유지되며 Base Damage 표기도 실제 평타와 일치한다.

3.1400: 뉴 공격 피해량 조정. baseDamage 100은 유지하고 개별 AttackSpec damageRatio만 변경해 평타 150(damageRatio 1.5), RMB 마검 직격 600(damageRatio 6), 탄착 후 마검 장판 틱 150(damageRatio 1.5)으로 설정했다. 반격/귀환 피해 등 다른 뉴 공격 수치는 변경하지 않았다.

3.1399: 뉴 밸런스 조정. 기본 체력 400→600, 마검 보유 패시브 공격력/방어력 +80%→+60%로 변경해 방어 패시브 활성 시 받는 피해 배율 0.4, 즉 체력 600 기준 실질체력 1500이 되도록 맞췄다. RMB 마검 사거리 1400→700. 탄착 장판과 틱 공격의 wallPolicy를 ignore→block으로 변경해 범위 피해가 벽을 넘어가지 않도록 했다. 회수/피해 반경 140 및 나머지 마검 동작은 유지한다.

3.1398: 뉴 리메이크 마검의 사거리/맵 경계 종료 버그 수정. 원인은 projectile.return 모듈이 있는 투사체가 outbound 상태여도 일반 range-expiry 분기보다 먼저 returning 분기에서 return되어, expireAtRange=true인 뉴 마검이 1400px 사거리에서 멈추지 않고 월드 경계까지 계속 비행한 것이었다. atRange linger 투사체는 return-capable 여부와 무관하게 사거리 도달 시 먼저 impact+linger를 처리하도록 공통 순서를 교정했다. 또한 동일 atRange linger 투사체가 월드 경계에 먼저 닿으면 기존 wall remove로 삭제하지 않고 경계 안쪽 좌표에서 boundary impact 후 정지/장판 상태로 전환하도록 했다. 뉴 ID 예외 분기 없이 arrival.linger.atRange 데이터 기반으로 처리한다.

3.1397: 뉴 마검의 자동 회수 범위를 장판 피해 범위와 동일하게 통일. sourcePickupRange를 120→140px로 변경하고 RMB 툴팁의 회수 거리 표기도 140px로 갱신했다. 장판 피해 반경 140px 및 나머지 피해/귀환 동작은 변경하지 않았다.

3.1396: 뉴 RMB 탄착 피해를 1회 폭발에서 지속 장판 피해로 변경. 날아가는 마검의 관통 직격 피해는 유지하되 최대 사거리 도착 순간 즉시 피해는 제거했다. 탄착 후 반경 140의 무기한 field.area를 생성하며 triggerOnEnter:false + 1000ms per-target interval로 최초 1초 후부터 주기 피해를 준다. 장판은 마검 투사체에 귀속되어 수동 귀환 시작/근접 자동회수/투사체 종료 시 즉시 제거된다. 이를 위해 projectile.impact field의 bindToProjectile 옵션과 공통 귀환/종료 정리 경로를 추가했다.

3.1395: 뉴 마검 스킬 리메이크. RMB `저 녀석을 처리해!`는 더 이상 유도/배회/재조준하지 않고 직선으로 벽과 적을 관통해 최대 사거리에서 멈춘다. 탄착 시 주변 140px에 1회 피해를 주고 마검은 그 자리에 지속적으로 남으며, 뉴가 120px 안으로 접근하면 자동 회수된다. 마검이 나가 있는 동안 LMB의 기존 수동 귀환은 제거하고 기본 검격도 사용하지 못한다. RMB 재입력은 기존 LMB 귀환과 동일한 비용 500/속도 28의 `돌아와!`만 수행하며 기존 RMB 빠른 귀환(속도 60/비용 1000)은 삭제했다. 기존 마검 보유 패시브/반격의 검 위치 후속타는 유지한다.

3.1394: 특수 빨간별 난이도 후속 조정. 빨간별 색상을 강한 #ff4a4a에서 밝고 부드러운 파스텔 코랄 #ff8f8f 계열로 완화하고, 큐리(quri)를 CHARACTER_DIFFICULTY_DATA 6단계에 추가했다. 따라서 유이/클레아/티냐/큐리가 모두 동일한 빨간 ★★★★★로 표시되며 높은/낮은 난이도 정렬에서도 동일하게 일반 5별보다 높은 6단계로 처리된다.

3.1393: 캐릭터 난이도에 특수 빨간별(사실상 6단계) 추가. CHARACTER_DIFFICULTY_DATA에서 유이(yui), 클레아(clea), 티냐(tinya)를 6으로 지정하고 CharacterDifficultyService의 최대 단계를 6으로 확장했다. 1~5단계는 기존 ★/☆ 표시를 유지하며 6단계는 5개의 빨간 ★로 표시한다. 높은/낮은 난이도 정렬은 기존 level 값을 그대로 사용하므로 6단계가 일반 5별보다 높은 난이도로 정렬된다.

3.1392: 캐릭터 선택 정렬 드롭다운의 표시 이름을 `색상순`에서 `색상`으로 변경. color-rainbow 정렬 로직과 저장 키/동작은 그대로 유지한다.

3.1391: 캐릭터 선택 색상순을 HSL hue 정렬에서 OKLCH 기반 지각 색상순으로 교체. sRGB를 linear RGB→OKLab→OKLCH로 변환해 사람이 느끼는 색상 차이에 더 가까운 hue를 사용하고, 색상환 시작점을 분홍 계열에 두어 분홍 → 빨강 → 주황 → 노랑 → 연두 → 초록 → 청록 → 하늘 → 파랑 → 남색 → 보라 → 자주 순으로 한 번만 진행한다. 별도 저채도 그룹은 사용하지 않으며 동일 hue 계열에서는 chroma 높은 쪽 → lightness 높은 쪽 → 출시순으로 정렬한다.

3.1390: 캐릭터 선택 색상순 정렬을 단일 연속 hue 순서로 단순화. 저채도/무채색 그룹 분리를 제거하고 모든 캐릭터를 동일한 hue 기준으로 정렬한다. 시작점은 나남낭의 실제 캐릭터 색 #fbc7ff (hue 약 295.7°)를 기준으로 회전해 나남낭부터 분홍 계열이 시작되도록 했다. 같은 hue에서는 채도 높은 쪽 → 명도 → 출시순으로 안정 정렬한다.

3.1389: 캐릭터 선택 색상순의 저채도 그룹도 hue 기준으로 정렬. saturation<=0.35인 저채도 캐릭터를 선명한 색 뒤쪽 그룹으로 보내는 규칙은 유지하되, 저채도 그룹 내부도 분홍 → 빨강 → 주황 → 노랑 → 초록 → 청록 → 파랑 → 보라 순의 동일한 hue 회전을 적용하고 같은 hue에서는 채도/명도/출시순으로 안정 정렬한다.

3.1388: 캐릭터 선택 색상순 정렬의 저채도 분류 기준을 강화. 기존 saturation<0.08만 무채색으로 취급하던 기준을 saturation<=0.35로 올려 키처럼 연한 회청색/저채도 캐릭터가 선명한 무지개색 사이에 끼지 않고 색상순 후반의 저채도 그룹으로 이동하도록 했다. 분홍 시작 hue 회전 및 저채도 그룹 내부 명도/출시순 정렬은 유지한다.

3.1387: 캐릭터 선택 색상순 정렬의 시작점을 분홍 계열로 변경. 기존 0°(빨강) 기준 hue 정렬을 330° 부근(분홍/마젠타) 시작으로 회전해 분홍 → 빨강 → 주황 → 노랑 → 초록 → 청록 → 파랑 → 보라 순으로 배치한다. 무채색 후순위, 동일 계열 채도/명도/출시순 안정 정렬은 유지한다.

3.1386: 캐릭터 선택 정렬에 색상순 추가. 각 캐릭터의 canonical color 값을 RGB→HSL로 변환해 hue 기준 빨강→주황→노랑→초록→청록→파랑→보라→분홍의 무지개 순서로 정렬한다. 채도가 거의 없는 무채색은 유채색 뒤로 보내고, 같은 색상대에서는 채도 높은 순→명도 낮은 순→출시 순으로 안정 정렬한다. 선택한 색상순 모드는 기존 localStorage 정렬 저장 규칙을 그대로 사용한다.

3.1385: TOP-PLAYER 배지 세로 정렬 보정. 줄바꿈이 있는 카드에서도 TOP-PLAYER가 줄바꿈 없는 카드와 동일한 Y 위치에 오도록 compact-lines 상태의 이름/스탯 간격을 추가 축소하고, CharacterCardLayoutService가 일반 카드의 배지 offsetTop을 기준값으로 저장한 뒤 줄바꿈 카드에 top-player-shift CSS 변수를 적용해 남는 높이 차이를 정확히 보정한다.

3.1384: 캐릭터 카드 칭호 타이포/정렬 조정. 칭호는 이름과 같은 줄의 inline span 구조를 유지하되 체력/이동속도/스타일/난이도 스탯 행과 동일한 폰트 크기를 사용하도록 var 기반으로 통일하고, 이름 기준선보다 아래쪽에 정렬되도록 vertical-align:bottom 및 소폭 translateY를 적용했다. TOP-PLAYER 줄바꿈 compact 로직은 유지한다.

3.1383: 캐릭터 카드 칭호/줄바꿈 레이아웃 수정. 마스터 V 칭호를 이름 아래 별도 행이 아니라 char-name 내부의 이름 바로 뒤 inline span으로 이동하고 캐릭터 설명 행과 동일한 11px 폰트 크기로 통일했다. TOP-PLAYER 배지가 있는 카드에서 스탯 문구가 실제 두 줄 이상으로 줄바꿈되는 경우 CharacterCardLayoutService가 compact-lines 클래스를 자동 적용해 이름 하단 여백, 스탯 gap/line-height, TOP-PLAYER 상단 여백을 줄여 고정 카드 높이 안에서 배지가 가려지지 않도록 했다. 줄바꿈이 없는 카드는 기존 간격을 유지한다.

3.1382: 타다타/메라 모나/나남낭 3건 수정. 타다타 캐릭터 color가 #2f7a40으로 변경된 뒤 공격 데이터에 이전 #16391c / rgb(22,57,28) 색이 남아 LMB/RMB/장판/반격이 캐릭터 색과 달랐던 문제를 현재 캐릭터 색 #2f7a40 / rgb(47,122,64)로 통일했다. 메라 모나 변신 폭발 attack.meramona.emerge와 반격 attack.meramona.counter의 delivery.area wallPolicy가 ignore라 벽 너머 적까지 맞던 문제를 block으로 수정했다. 나남낭 LMB 회복은 기본/풀차지 AttackSpec의 source on-hit resource.restore에 분산되어 온라인 및 동적 차징 적중 확정 경로에서 누락될 수 있던 구조를 제거하고, 캐릭터 공통 damage-dealt 트리거에서 attack.tag '평타' + impact.direct 조건으로 실제 확정 피해 시 잃은 체력 20%를 실행당 1회 회복하도록 통일했다.

3.1381: 스턴샷이 나남낭 평타마다 계속 적용되던 문제 수정. stun_shot의 cooldown.ready에서 shareExecution:true를 제거해 준비 상태를 AttackExecution 전체에 캐시하지 않고 매 실제 적중마다 현재 쿨다운을 다시 확인한다. 첫 평타 적중이 cooldown.consume으로 4초 쿨다운을 시작하면 같은 실행의 추가 적중 및 이후 평타는 즉시 ready=false가 되어 스턴이 재적용되지 않는다. 캐릭터 ID 예외 없이 스턴샷 설명인 '4초마다 다음 평타 적중 1회'와 실제 동작을 일치시켰다.

3.1380: 뉴 마검 보유 패시브의 이동속도 감소량을 35%→20%로 완화. passiveBuffs의 speed multiplier/value만 변경했으며 공격력 +80%, 방어력 +80%, 마검 투척/유도/배회/귀환/피해 주기 등 나머지 동작은 유지한다. 툴팁의 passiveSpeedPenaltyPercent는 같은 passiveBuffs 값을 참조하므로 20%로 자동 반영된다.

3.1379: 뉴 마검 적 인식 거리 제한 제거. homing.sourceDetectionRange=550 및 detectionPresentation 점선 링을 제거하고, idleWander 진입 여부 판정도 유한 감지거리일 때만 적을 검색하던 조건을 없애 맵 전체의 감지 가능한 적을 대상으로 가장 가까운 적을 찾는다. 은신으로 비감지 상태인 적은 기존 ProjectileHomingTargetVisibilityService 규칙대로 제외되며, 감지 가능한 적이 맵에 하나도 없을 때만 뉴 주변 idleWander를 유지한다.

3.1378: 뉴 마검 기본 탄속을 20으로 증가. attack.nyu.rmb의 delivery.projectile.speed만 변경했으며 배회는 projectile.baseSpeed를 참조하므로 동일하게 20으로 이동한다. 귀환 속도/빠른 귀환/감지 범위/피해 주기/외곽 회피는 변경하지 않았다.

3.1377: 통과 기반 재조준 투사체의 지연된 원격 적중 확인이 공격자 궤도/재타격 타이머를 다시 시작하지 않도록 분리. 피격자 실제 충돌은 기존 500ms 재타격 규칙을 유지하며, 공격자 궤도는 로컬 통과 판정만 사용. exact-key와 legacy 확인 경로 모두 remoteConfirmation 문맥 전달.

3.1376: 원격 idleWander 지원 투사체의 배회/재조준/직진 충돌 좌표를 송신 시각 버퍼의 현재 프레임 좌표로 통일. renderer도 판정에 사용한 좌표를 그대로 표시하여 별도 원격 시뮬레이션과 표시 궤도의 시간차 제거. 최초 버퍼 바인딩은 prev 좌표를 초기화하여 가짜 swept 접촉 방지.

3.1375: 원격 배회/재조준/직진 표시를 단일 송신 시각 버퍼로 통합. sampleTime을 전송하고 최초 수신 시 고정한 시계 오프셋으로 재생하여 수신 간격 지터가 탄속으로 변환되는 문제를 수정. 중복/역순 샘플은 수신 시각을 갱신하지 않으며 버퍼는 32개로 제한.

3.1374: 뉴 마검 idleWander 원격 렌더와 외곽 안전 이동을 구조적으로 분리. 원격 배회 마검은 자체 시뮬레이션 좌표를 그대로 렌더하지 않고 최근 권위 homing sample들을 짧은 지연 버퍼로 선형 보간해 표시하여 패킷 보정에 따른 체감 탄속 출렁임을 제거했다. 실제 projectile 판정 좌표는 기존 권위 동기화를 유지한다. 로컬 idleWander는 이동 직전 외곽 safe padding과 진행 방향을 검사해 가까운 외곽을 향하는 속도 성분을 즉시 안쪽으로 반사하고 배회 목표를 폐기해 다음 프레임 새 안전 목표를 뽑는다. 따라서 안전 목표점으로 향하는 곡선 궤적 중에도 외곽을 직접 박지 않는다. 캐릭터 ID 하드코딩 없음.

3.1373: 뉴 마검 idleWander 속도/외곽 충돌 수정. idleWander를 일반 homing 감속 루프와 명확히 분리하고 배회 활성 중에는 이동 직전 projectile.baseSpeed를 정확히 재적용한다. 배회 목표 생성 시 투사체 충돌 반경과 boundaryAvoidance.margin을 포함한 월드 안전 경계 안으로 clamp해 뉴가 외곽/구석에 있어도 맵 밖 목표를 만들지 않는다. 원격 idleWander 권위 보정은 소유자 vx/vy를 그대로 사용하되 위치 오차 보정이 한 프레임 이동량을 과도하게 증폭하지 않도록 보정량을 baseSpeed 기준으로 제한한다. 캐릭터 ID 하드코딩 없음.

3.1372: 뉴 마검 idleWander 온라인 동기화 수정. 적 은신/550px 감지범위 이탈로 소유자 권위 마검이 idleWander에 들어갈 때 hadHit=false 때문에 projectileHomingTargets.active가 false가 되어 상대 클라이언트가 더 이상 소유자 궤도를 따라가지 못하던 문제를 수정했다. homing snapshot에 idleWanderActive를 추가하고, 배회 중에는 active를 계속 true로 유지해 x/y/vx/vy/angle 권위 샘플을 지속 전송한다. applySnapshot/applyRemote도 idleWanderActive를 동기화하며 hadHit false를 최신 샘플 그대로 반영한다. 따라서 은신/감지범위 이탈 시 상대 화면에서도 검이 뉴에게 복귀하지 않고 소유자 화면과 동일하게 주변 배회를 유지한다. 캐릭터 ID 하드코딩 없음.

3.1371: 뉴 마검 적 감지 범위를 700px→550px로 조정. homing.sourceDetectionRange 값만 변경했으며 idleWander, 기본 탄속, 재유도, 외곽 벽 타격 허용 로직은 유지한다. 점선 감지 링도 동일 값을 참조하므로 550px 반경으로 자동 축소된다.

3.1370: 외곽 벽에 붙은 적 타격 허용. 유도 외곽 회피를 단순 '벽 방향 금지'가 아니라 실제 충돌 순서 기준으로 변경했다. ProjectileHomingTargetVisibilityService.contactBeforeBoundary()가 현재 투사체 진행선과 대상 원의 최초 접촉 거리, 월드 외곽 도달 거리를 비교한다. 유도 대상에게 외곽보다 먼저 접촉 가능한 경우에는 homing turnBlock과 boundaryAvoidance를 모두 건너뛰어 벽에 붙은 적까지 그대로 접근해 타격한다. 대상보다 외곽을 먼저 넘어가는 경로만 기존 회피를 유지한다. 캐릭터 ID 하드코딩 없음.

3.1369: 뉴 마검 적 감지 범위를 1000px→700px로 조정. homing.sourceDetectionRange 값만 변경했으며 idleWander 반경/탄속/재유도/외곽 회피 동작은 유지한다. 점선 감지 링도 동일 값을 참조하므로 700px 반경으로 자동 축소된다.

3.1368: 뉴 마검 1000px 링을 최대 활동 반경이 아닌 적 감지 범위로 변경. 뉴의 sourceRangeLimit 데이터와 1000px 도달 자동귀환을 제거하고 homing.sourceDetectionRange=1000 및 detectionPresentation을 사용한다. 감지 가능한 적이 범위 안에 하나도 없으면 projectile homing의 범용 idleWander가 활성화되어 소환수 AI idleWander처럼 소유자 주변의 임의 목표점을 주기적으로 갱신하며 배회한다. 배회 조향은 projectile.baseSpeed를 항상 유지해 일반 소환수식 대기 감속이 없다. 적이 감지 범위에 들어오면 idleWander를 즉시 종료하고 재유도를 활성화한다. 은신 비공개 적은 감지 대상에서 제외한다. 캐릭터 ID 하드코딩 없음.

3.1367: 뉴 마검 외곽 회전 방향 차단 + 최대 활동 반경 추가. boundaryAvoidance에 turnBlockDistance를 추가하고 homing 회전 각도를 적용하기 전에 후보 방향의 WorldGeometryService.boundaryRayDistance를 검사한다. 가까운 외곽 쪽으로 도는 후보가 막혀 있고 반대 회전이 더 넓으면 반대 방향으로 회전해, 벽 쪽으로 꺾었다가 다시 밀려나는 반복을 줄였다. delivery.projectile에 범용 sourceRangeLimit을 추가해 source 기준 최대 활동 반경을 지정할 수 있게 했고, 뉴 마검은 1000px 반경을 넘으면 자동 귀환한다. 검이 outbound 상태일 때 뉴 본인 화면에는 동일 1000px 반경의 점선 링을 표시한다. 캐릭터 ID 하드코딩 없음.

3.1366: 유도 공격 은신 인식 차단 + 외곽 회피 감속 버그 수정. ProjectileHomingTargetVisibilityService를 추가해 유도 투사체가 적을 선택/유지할 때 StealthPresentationService의 실제 탐지/임시 공개 상태를 공통 검사한다. 현재 유도 대상이 은신해 공격자에게 비공개가 되는 순간 homingTargetReference를 즉시 해제하고, 재유도/통과 추적 대상에서도 제외한다. 온라인 homing targetReference의 빈 값도 권위 snapshot으로 전파되도록 수정했다. 또한 boundaryAvoidance는 진행 방향이 실제로 해당 외곽을 향할 때만 압력을 주고, 회피 조향이 개입하는 프레임에는 최소 baseSpeed를 복구해 homing 감속과 외곽 회피가 반복 충돌하며 탄속이 minTurnSpeed까지 떨어지는 현상을 제거했다. 캐릭터 ID 하드코딩 없음.

3.1365: 온라인 유도 투사체 실제 좌표 하드스냅 제거. 3.1364는 렌더만 보간했지만 ProjectileService.updateOutbound에서 원격 homing projectile.x/y를 매 프레임 최신 권위 snapshot 위치로 직접 덮어써 상태 전환 시 순간이동이 남았다. 이제 원격 유도 투사체는 소유자 snapshot의 vx/vy/angle을 즉시 반영하되 위치/이동거리는 70ms 지수 보정으로 권위 위치에 수렴한다. 320px 이상 심각한 desync일 때만 즉시 snap한다. ProjectileVisualPositionService의 별도 snapshot 렌더 미러도 제거해 실제로 부드럽게 보정된 projectile.x/y를 단일 렌더 경로로 사용한다. 캐릭터 ID 하드코딩 없음.

3.1364: 온라인 유도 투사체 상대 화면 렌더 보간 추가. projectile homing 권위 스냅샷은 25ms 상태 패킷마다 갱신되지만 기존 ProjectileVisualPositionService가 최신 snapshot x/y/angle을 즉시 사용해 고속 유도 투사체가 상대 화면에서 끊기거나 순간이동해 보였다. RemoteProjectileHomingPresentationService를 추가해 실제 충돌/피해 좌표는 그대로 두고 원격 유도 투사체의 시각 좌표와 각도만 지수 보간한다. 최신 snapshot의 속도로 짧게 extrapolate한 목표점을 따라가며 45ms smoothing, 260px 이상 큰 오차는 즉시 snap한다. returning phase에서는 보간을 사용하지 않아 기존 직선 귀환 경로를 그대로 렌더한다. 캐릭터 ID 하드코딩 없음.

3.1363: 뉴/에즈레일 툴팁 수치 하드코딩 제거. 뉴 tooltipSkills를 사용자 지정 문구로 재정리하고 별도 PASSIVE 행을 제거해 마검 보유 효과를 LMB 설명에 통합했다. 출혈 지속시간은 실제 status.apply.duration, 공격력/방어력/이동속도 수치는 character.passiveBuffs의 damage/defense/speed valueRef를 CharacterDescriptionService가 참조한다. 에즈레일 LMB의 바람지대 유지시간도 attack.ezrail.lmb-explosion의 field.area.duration을 fieldSeconds로 참조한다. 따라서 해당 전투 데이터가 바뀌면 설명 숫자도 자동 동기화된다.

3.1362: 뉴 마검 회수 비용 툴팁 수정. 실제 resource.spend는 돌아와 500/살려줘 1000으로 정상인데 tooltipSkills에 costText:'스테미나 0'이 남아 있던 표시 버그를 제거했다. 돌아와는 ability.nyu.lmb trigger의 resource.spend, 살려줘는 ability.nyu.rmb trigger의 resource.spend를 costRef로 직접 참조하므로 실제 비용 변경 시 설명도 자동 동기화된다. 전투 비용/귀환 동작은 변경하지 않았다.

3.1361: 귀환 투사체 외곽 회피 해제. ProjectileStateService.beginReturn()이 귀환을 시작하는 순간 projectile.boundaryAvoidance를 null로 초기화해 outbound 전용 외곽 회피 조향이 귀환 상태에 남지 않도록 했다. 따라서 뉴 마검은 수동/자동/경계 귀환 모두 현재 위치에서 뉴 위치로 직선 복귀하며, 월드 밖 좌표 방지를 위한 clampToBounds 안전장치만 유지한다. 범용 처리이며 캐릭터 ID 분기 없음.

3.1360: 대형 투사체 자동 벽 충돌 기준을 고정 20px에서 현재 공격 주체 크기로 변경. wallCollisionMode를 명시하지 않은 delivery.projectile은 max(radius, hitRadius)가 source.radius를 초과하면 center, 이하이면 radius 판정을 사용한다. 명시적 center/radius와 delivery.range-projectile의 center 기본값은 우선 유지한다. 실제 Projectile spawn과 AttackPreviewService가 동일 ProjectileWallCollisionModeService를 사용해 실제/미리보기 판정 기준을 통일했다.

3.1359: 뉴 플레이어 크기 조정. 뉴 character.radius를 20→15로 변경해 본체 렌더/충돌/월드 UI 기준 크기를 함께 줄였다. 마검 투사체 크기, 공격 범위, 이동속도, 체력 및 기타 전투 수치는 변경하지 않았다.

3.1358: 뉴 마검 무타겟 자동 회수. delivery.projectile.homing에 범용 returnWhenNoTargetOnReaim 옵션을 추가했다. 재유도 단계(hadHit=true, reacquire 시점 도달)에 들어갔을 때 유효한 추적 대상이 하나도 없으면 소유자 권위에서 즉시 기존 projectile.return을 시작한다. 뉴 마검에 해당 옵션을 적용해 적을 지나친 뒤 110px 직진한 다음 재유도할 적이 없으면 자동으로 일반 '돌아와!' 속도로 뉴에게 복귀한다. 초기 발사 직후나 아직 재유도 타이밍이 아닌 직선 비행 중에는 자동 회수하지 않으며, 수동 회수 스테미나 비용도 발생하지 않는다. 캐릭터 ID 하드코딩 없음.

3.1357: 뉴 마검 맵 외곽 회피 추가. delivery.projectile에 범용 boundaryAvoidance 옵션을 추가해 월드 외곽에 접근하면서 바깥쪽으로 진행하는 투사체가 충돌 전에 안쪽으로 자연스럽게 선회할 수 있게 했다. margin/lookahead/maxTurnPerFrame/strength를 데이터로 지정하며, 실제 이동 직전 현재 속도와 월드 경계까지의 여유를 계산해 가장 가까운 외곽의 반대 방향으로 제한 회전한다. 뉴 마검에는 margin 90px, lookahead 150px, maxTurnPerFrame 0.18, strength 1을 적용했다. 기존 적 통과→감속→재조준→직선 돌진 로직은 유지되며 외곽 회피가 마지막 안전 조향으로만 개입한다. 드물게 경계를 실제 이탈하면 기존 returnAtBoundary 즉시 귀환이 안전장치로 남는다. 캐릭터 ID 하드코딩 없음.

3.1356: 레이카 일반 LMB 선딜 조준 갱신 수정. 기존 일반 평타는 preview만 live-source였고 ability.lock 이후 AttackSpec 내부 delivery/effect delay가 최초 입력 각도를 그대로 사용해 선딜 중 방향전환이 실제 판정에 반영되지 않았다. 일반 모드 LMB를 preview.create 300ms + timing.delay 300ms(aimMode:'live-source') + 즉시 action.attack 구조로 변경하고 attack.reika.lmb의 delivery.area/effect.spawn 내부 delay 300을 제거했다. 선딜 종료 순간의 최종 조준 방향이 검격 판정과 arcSweep 연출에 함께 적용된다. 가호 상태 lmbBlessed는 기존 즉발 동작을 유지한다.

3.1355: 대형 투사체 공통 벽 충돌 규칙 추가. delivery.projectile에 wallCollisionMode를 명시하지 않은 경우 실제 충돌 크기(max(radius, hitRadius))가 20을 초과하면 자동으로 center 판정을 사용하고, 20 이하는 기존 radius 판정을 유지한다. 명시적 wallCollisionMode:'center'/'radius'는 자동 규칙보다 우선한다. delivery.range-projectile의 기존 center 기본값도 유지한다. AttackPreviewService는 3.1354에서 wallCollisionMode를 공통 참조하므로 실제 투사체와 미리보기 모두 동일 규칙을 따른다.

3.1354: 투사체 미리보기 wallCollisionMode 반영 수정. 3.1353은 샤이라즈 반격기가 실제로 사용하는 일반 단일 projectile preview fallback 경로를 수정하지 않아 화면상 변화가 없었다. AttackPreviewService의 단일/산탄/targetPoint projectile-path raycast가 이제 delivery.projectile.wallCollisionMode를 공통 반영하며, center 모드에서는 projectileRadius 대신 padding 0을 사용한다. 따라서 샤이라즈 반격기 실제 투사체와 미리보기 모두 투사체 중심이 벽에 닿는 지점에서 막힌다. radius 모드 투사체의 기존 미리보기는 유지된다.

3.1353: 샤이라즈 반격기 미리보기 벽 충돌 기준 통일. 3.1352에서 실제 반격 투사체에 적용한 wallCollisionMode:'center'를 공격 미리보기 경로 계산에도 그대로 반영하도록 확인/정리했다. projectile-path 미리보기의 벽 raycast padding은 delivery.projectile.wallCollisionMode==='center'이면 0을 사용하므로 샤이라즈 반격기 미리보기도 투사체 외곽이 벽에 스치는 지점이 아니라 중심이 벽에 닿는 지점까지 표시된다. 미리보기 종점 이후 설치되는 counter trap preview anchor도 같은 terminalDistance를 사용한다.

3.1352: 뉴/샤이라즈 조정. 뉴 마검의 passDistanceBeforeReaim을 150px→110px로 줄였다. 샤이라즈 반격 투사체 delivery.projectile에 기존 범용 wallCollisionMode:'center'를 적용해 원형 투사체 외곽이 벽에 스치는 것만으로는 막히지 않고, 투사체 중심점이 벽에 닿는 경로에서만 wall impact가 발생하도록 변경했다. 다른 투사체/덫/피해 판정은 변경하지 않았다.

3.1351: 뉴 마검 재유도 시작 거리 조정. 적을 지나친 뒤 재유도 단계에 들어가기 전 추가 직선 비행 거리 기준을 220px→150px로 줄였다. 감속/방향전환/정렬 후 재돌진, 미적중 통과 판정, 귀환 및 피해 주기는 변경하지 않았다.

3.1350: 뉴 마검 회수 스테미나/설명 수정. '돌아와!'는 마검이 outbound 상태일 때 스테미나 500을 소모한 뒤 일반 속도 귀환을 시작하고, '살려줘!'는 스테미나 1000을 소모한 뒤 고속 귀환을 시작한다. 자원이 부족하면 회수가 실행되지 않는다. 뉴의 캐릭터/스킬 설명은 사용자가 처음 제시한 문구로 맞췄다.

3.1349: 뉴 반격 위치/마검 재조준 거리 수정. CounterModuleService의 follow-up 위치 지정이 effect.spawn의 실제 attackCenter와 중첩 damage area에 전달되지 않아 마검이 있어도 두 번째 어둠 기운이 뉴 위치에 보일 수 있던 문제를 수정했다. projectileStateKey 조회가 actionState에서 일시적으로 누락돼도 동일 source/stateKey의 살아있는 Projectile을 fallback 검색하며, follow-up AttackSpec의 top-level delivery.area와 effect.spawn.damage.module 모두 centerPoint를 주입하고 effect는 attack-center를 사용한다. 뉴 마검 homing에는 passDistanceBeforeReaim:110을 추가했다. 실제 적중 또는 미적중 통과 즉시 유도를 켜지 않고 해당 적을 지나친 상태로 계속 직선 비행하며, 적과 220px 이상 벌어진 뒤에만 hadHit/reacquire를 활성화해 감속→방향전환→정렬→재돌진 사이클로 들어간다. 캐릭터 ID 하드코딩 없음.

3.1348: 뉴/키네스 후속 수정. 뉴 마검의 outbound 속도를 18→14로 낮췄고 귀환 속도 28/60은 유지한다. effect-animation 피해에 suppressHitImpactRing 옵션을 범용 추가해 키네스 반격과 뉴 반격의 확장 원이 레이카 가호 평타처럼 원본 확장 원 하나만 보이고 피격자용 추가 hitImpactRing을 만들지 않도록 했다. CounterModuleService에 data-driven followUpAttacks를 추가해 반격 선딜 종료 후 source 권위에서 별도 TriggeredAttack을 순차 예약할 수 있게 했다. 뉴 반격은 첫 어둠 기운을 뉴 위치에서 발동한 뒤 140ms 후 두 번째 어둠 기운을 실행하며, 실행 순간 nyu-dark-sword가 맵에 있으면 그 검 위치, 없으면 뉴 위치를 사용한다. 따라서 검이 없으면 뉴 위치에서 2회, 검이 있으면 뉴→검 순서로 발동한다. 기존 dead-code였던 counter.execute 뒤 action.trigger-attack은 제거했다. 캐릭터 ID 하드코딩 없음.

3.1347: 뉴 마검의 재조준 조건 보강. 기존에는 실제 적중(confirmTrajectoryHit)만 stopAfterAligned homing 재조준을 활성화해, 적을 스쳐 지나갔지만 충돌 판정이 없었던 경우 계속 직진했다. delivery.projectile.homing에 범용 reaimAfterPassingEnemy 옵션을 추가했다. 직선 비행 상태에서 진행 방향 앞쪽의 가장 가까운 적을 추적 대상으로 기억하고, 그 적의 진행축을 실제로 지나쳐 앞→뒤로 바뀌는 순간 적중 여부와 무관하게 hadHit/reacquire 타이머를 활성화한다. 이후 기존 감속→강한 방향보정→정렬 완료→baseSpeed 복구→직선 돌진 사이클을 그대로 재사용한다. 온라인은 소유자 권위에서만 통과 판정을 만들고 기존 homing snapshot으로 동기화한다. 캐릭터 ID 하드코딩 없음.

3.1346: 뉴 6개 후속 수정. LMB 선딜을 AttackSpec 내부 지연이 아니라 ability timing.delay(aimMode:'live-source')로 이동해 300ms 미리보기 동안 바뀐 최종 조준 방향을 실제 판정/검격 연출에 그대로 사용한다. 뉴 주색은 다른 분홍 캐릭터와 덜 겹치는 딥 로즈 #c64a73 계열로 변경하고 모든 출혈 지속시간을 1초로 통일했다. 마검은 월드 외곽 접촉 시 projectile.return의 범용 returnAtBoundary로 즉시 일반 '돌아와!' 속도 귀환을 시작한다. 마검 재조준은 적을 실제 통과/적중한 뒤에만 시작하며 재조준 중 매 프레임 감속해 최소 속도까지 느려지고, 목표 방향 정렬이 끝나는 순간 baseSpeed로 복구한 뒤 homing을 끄고 다시 직선 돌진한다. 동일 대상 재타격 최소 주기는 500ms다. 반격 어둠 원은 기존 hitImpactRing 공통 렌더를 유지하되 220ms로 빠르게 확장하도록 조정했다.

3.1345: 뉴 6개 수정. LMB를 레이카 일반 평타와 동일한 sector/arcSweep 구조로 통일하되 사거리 210으로 조정하고 300ms preview는 레이카와 같은 duration+ability.lock 구조를 사용해 깜빡임을 제거했다. 마검 투척은 사거리 정지/초기 유도를 제거하고 startAfterHit + stopAfterAligned 범용 homing을 추가해 최초에는 직진, 적을 통과해 실제 적중한 뒤 짧은 통과 지연 후 가까운 적을 강하게 재조준하고 방향이 맞으면 다시 직진 돌진하는 사이클을 반복한다. projectile.return stopAtRange를 제거해 수동 회수 전까지 계속 비행하며 귀환 공격 damageOnReturn을 활성화하고 sword-return에 실제 피해+출혈을 부여했다. 반격의 본체/마검 위치 어둠 기운은 키네스 반격과 같은 hitImpactRing expanding-ring 피해 구조로 변경했다.

3.1344: 신규 캐릭터 뉴 추가. 체력 400/매우 빠른 이동/분홍 계열, 파워형 근거리 저격수. 일반 LMB는 300ms 선딜 후 마검을 휘둘러 피해+3초 BLEED, RMB는 벽/적 관통 지속 유도 마검을 투척하고 LMB/RMB 재입력으로 일반/고속 귀환한다. 마검이 본체에 있을 때 damage/defense +80%, speed -35%를 조건부 passiveBuffs로 적용하도록 CharacterPassiveBuffService의 범용 conditions를 추가했다. projectile.recall은 선택적 speed를 받아 귀환 속도를 데이터로 바꿀 수 있게 했다. counter는 본체와 현재 마검 위치에서 어둠 파동을 발생시키며 action.trigger-attack의 projectileStateKey를 범용 지원한다.

3.1719: 공격 태그를 실제 전달/판정 모듈에서 계산. 수동 사거리·전달형태·CC 태그 제거, 자기 반동/시각 이펙트 오분류 방지, 이동 접촉·중첩 적중 효과·장판 피해 프로필·조건부 반격/능력 효과 조회 통합.

DUELS FAVICON: rounded original-style assets + runtime fallback

3.709: 레코드 정산을 팀 수/팀 순위 기준으로 개편했다. FFA는 개인 사망 순위가 아니라 teamId별 최종 탈락 순서로 팀 등수를 만들며 4팀은 1/2/3/4등에 승리점수×4/×2/×1/패배점수×1, 3팀은 ×3/×1/패배점수×1을 적용한다. 2:1:1·3:1 등 불균형 구성의 승리팀은 일반 1등 배수 대신 기존 불균형 승리 배율(다인팀이 1인팀 승리 시 1/인원수, 1인팀이 2/3인팀 승리 시 1.5/2배)을 우선 적용한다. 정확한 2v2 TEAM은 승리점수×3, 패배점수×1을 적용한다. 동일 계정 또는 동일 기기가 참가자 중 단 한 쌍이라도 있으면 모든 참가자의 라운드 정산/탈주 정산을 차단한다.

3.708: FFA에서 2:1:1·3:1처럼 승리 팀에 여러 명이 있는 경우 ffaPlacements가 대표 winnerPid 한 명만 1등으로 두고 같은 승리팀 동료를 중간 순위로 처리해 다이아 이상 레코드가 0점이 되던 문제를 수정했다. FFA 팀 승리 시 현재 승리팀 구성원 전원을 공동 1등으로 기록하며, 각 클라이언트의 레코드 갱신은 기존처럼 자기 localPid의 현재 캐릭터 하나에만 적용된다.

3.707: 즉발 레이저 투사체의 beamLine 시각은 실제 타격 halfWidth와 독립된 nonHitAuraHalfWidth를 지원한다. 외곽 glow/mid glow/끝점 flare만 이 장식 폭을 사용하고 실제 body/core 및 delivery.area 판정은 기존 halfWidth를 유지한다. 파비 레이저는 기존 주변광 폭을 보존하고 메라 모나 4단계 즉발 레이저에도 넓은 비타격 주변광을 추가했다.

3.706: EntityRingLayoutService가 실제 화면에 렌더되지 않는 owner-only 호 게이지/최대충전 점멸 링을 원격 엔티티의 링 슬롯 계산에서 제외한다. 온라인 상대 화면에서는 숨겨진 private gauge 때문에 CC 링이나 반격 활성 링 반경이 바깥으로 밀리지 않으며, visibility:'all'인 공개 world gauge만 기존처럼 레이아웃에 반영한다.

3.705: 지속 field.area의 피해 틱을 저스트 회피/무적으로 막았을 때도 해당 대상의 그 틱을 소비하도록 공통 처리한다. 회피된 틱을 markTriggered하지 않아 80ms 무적 종료 직후 같은 첫 틱이 매 프레임 재시도되며 피해가 들어가던 문제를 수정했다. 반복 장판은 정상 interval 뒤에 다음 피해를 시도하고, onTrigger 상태효과는 회피된 피해 틱에서 적용되지 않는다.

3.704: 채널형 즉발 레이저의 발사음 시점을 채널 시작 AttackSpec이 아니라 실제 첫 channel tick으로 이동했다. channel.attack이 선택적 fireSound를 보존하고 첫 실제 TriggeredAttack에만 전달하므로 에라 파비 파비 레이저는 0.5초 선딜 시작이 아니라 빔이 실제 발사되는 순간 shoot 효과음이 1회 재생되며 이후 40ms tick은 suppressProjectileFireSound로 무음 유지한다.

3.703: 즉발 레이저 투사체도 일반 투사체와 동일하게 발사 시 shoot 효과음을 재생한다. 공통 attack-fired 사운드 판정이 delivery.area의 projectileClassification:'instant-laser'를 투사체 발사로 취급한다. 채널형 파비 레이저의 40ms 내부 tick은 반복 발사음이 나지 않도록 suppressProjectileFireSound 데이터로 제외하고, 실제 채널 시작 AttackSpec에서 fireSound:'shoot'를 1회 재생한다.

3.702: 타다타 RMB 설명이 detailAttack의 실제 피해를 표시할 수 있도록 CharacterDescriptionService에 범용 detailDamage 값을 추가하고, 덩굴 지대 피해/슬로우 field와 vineTick 판정을 wallPolicy:block으로 통일해 벽에 의해 범위가 차단되게 했다. 타다타 반격 반복 공격은 타격당 annularDoubleSweep 하나만 생성하도록 sweepCount를 1로 교정해 1타 시계방향, 0.3초 뒤 2타 반시계방향으로 순차 스윕한다.

3.701: 메라 모나 RMB annularDoubleSweep 시각을 공통 회전 공격 스타일로 통일했다. 타다타 반격은 delivery.area repeatCount 2회/300ms 간격으로 실제 2타를 처리하고 반복별 회전 방향을 지원해 기존 시계/반시계 스윕을 복구했다. 타다타 LMB는 모든 슬로우 대상 적중 시 속박으로 승격하며, 덩굴 지대는 진입 즉시/1초마다 피해와 별도의 100ms 슬로우 갱신 필드를 사용해 이탈 즉시 해제된다. 타다타 공격/지대 색은 캐릭터색 #16391c로 통일했다. 재타격 투사체의 hitIds 영구 차단을 수정하고 range-projectile에 접촉 상태 갱신 옵션을 추가해 다즈빈 RMB가 0.5초 피해를 반복하면서 범위 안에서는 슬로우를 유지한다.

3.700: 기존 듀얼즈 기준 타다타 구현을 정리했다. LMB 9연사는 발사 시작 방향을 locked aim으로 고정해 버스트 중 조준 방향이 바뀌지 않는다. 반격 2회 타격은 각 타격 시점의 대상 상태를 독립 판정해 슬로우가 이미 있으면 1초 속박, 없으면 1초 슬로우만 부여한다. 첫 타격이 무조건 슬로우를 선적용하던 경로를 제거하고 두 타격 모두 같은 조건부 status.apply 규칙을 사용한다.

3.699: 인투 설명의 `공용 탄창`을 `탄창`으로 단순화했다. 3.696의 preview cooldown 차단은 공격 실행 전 preview에만 적용해 action.attack 성공 뒤 requireAttackId 후속 모듈(레이카 가호 변신 FX/bind/delay/mode 전환)이 쿨다운 때문에 중단되지 않게 했다. 레이카 일반/가호 LMB는 정적 arcSweep 렌더와 별개로 실제 delivery.area sector가 피해를 처리하도록 복구했다. effect.spawn에 범용 angleMode:absolute를 추가해 메라 모나 RMB annularDoubleSweep이 조준 방향과 무관하게 월드 12시에서 시작한다. 프릴 RMB 설명은 타당 피해량으로 표기한다.

3.698: 인투 설명의 `공용 탄창`을 `탄창`으로 변경하고 기존 듀얼즈 기준 타다타를 3.0 공통 AttackSpec/field/status 구조로 구현했다. 타다타 LMB 9연사는 기존 delayed-projectile-volley를 angleOffsets로 범용 확장하고, RMB 덩굴 지대는 target-point projectile + projectile.impact + field.area를 재사용한다. status.apply on-hit에 기존 conditions 판정을 연결하고 target.status-active/absent 조건을 추가해 느려진 대상의 속박 승격을 공통 조건으로 표현한다.

3.697: 인투의 baseDamage에 기존 듀얼즈→3.0 피해 10배 스케일 변환이 누락된 오류를 수정해 20→200으로 교정했다. 기존 damageRatio는 유지되어 권총 200, 산탄총 탄당 100, 저격총/반격 저격탄 650 피해가 된다.

3.696: 선딜 미리보기가 공격 쿨다운으로 거부된 입력에서도 timing.delay까지 계속 진행해 보이지 않는 예약 공격이 쌓이던 문제를 수정했다. preview.create가 실제 prepared AttackSpec 기준으로 준비되지 않았으면 해당 Ability 파이프라인을 즉시 종료한다. 타격 기반 state.progress는 대상이 일반 무적이면 로컬/온라인 모두 충전되지 않으며 duel-hit-confirmed에 prevented 상태를 동기화한다.

3.695: 메라 모나 변신 0.6초 무적을 비타격 무적(evasionInvulnerable)에서 일반 피해 무적(invulnerable)로 변경했다. 인투 월드 게이지 순서를 재배치해 탄창 게이지 아래에 무기 모드 2칸 게이지가 표시되며, 엘린 본체/유령의 수호·탐사 모드 게이지 색상을 모두 엘린 색 #c8d8f0으로 통일했다.

3.694: 인투의 PT/SG/SP 문자형 무기 표시를 제거하고 엘린과 같은 2칸 gauge.segmented 모드 표시를 추가했다. 왼쪽은 권총, 오른쪽은 산탄총이며 현재 intu-weapon 칸만 인투색으로 채운다. 저격 상태에서는 같은 선택 칸 구조를 유지한 채 활성 색만 #9bdcff로 변경한다. 12칸 탄창 게이지는 유지한다.

3.693: 메라 모나 3단계 공격속도 증가를 50%로 조정하고 영구/임시 단계의 attackRate modifier를 모두 +0.5로 통일했다. RMB I~IV 설명은 엔소냐와 동일한 inlineStages 한 줄 형식으로 묶어 줄바꿈 없이 표시한다.

3.692: 미니맵 은신 가시성을 StealthPresentationService.state(viewer,target)의 관계 판정으로 복구해 자신/아군은 표시하고 적 은신만 숨긴다. preview.create 쿨다운 검사는 실제 AttackService와 같은 ProgressScaled+Augment prepared AttackSpec을 사용하도록 previewReady로 통합한다. 레이카 일반/가호 LMB는 3.681에서 추가된 arcSweep 시각 애니메이션만 제거해 기존 정적 부채꼴 렌더로 복구하되 progressive hit 판정은 유지한다.

3.691: 체리티 최대 차징 탄속을 53으로 조정. 미니맵은 플레이어/원격/소환수/더미/봇 모두 공통으로 stealth 활성 시 숨긴다. 0 스테미나 실제 행동은 설명에 `스테미나 0`을 표시하며 관련 규칙을 명시했다. 미아루키 공구함 배치 넉백 범위와 회복지대 범위를 단일 상수로 통일했다. 메라 모나 변신 회전 FX는 월드 12시에서 고정 시작한다. 디버그 화면 배율을 실시간 range 게이지로 변경했다. 공유 증강 회피 공격을 제거했다. preview.create는 실제 resolved Attack의 공격 쿨다운/공통 공격 딜레이가 준비되지 않으면 미리보기를 만들지 않는다. 레이카 가호 공중강하는 target-point 사거리 clamp를 제거했다.

3.690: 메라 모나 III/IV 평타의 기본 cd를 350ms로 복구해 기존 attackRate +4/7 보정으로 실제 150ms 공쿨만 한 번 적용되게 했다. 영구+임시 단계를 합산한 4칸 segmented 단계 게이지를 캐릭터 아래에 표시한다. CameraFovService에 로컬 debugScale을 추가해 디버그 패널에서 25~200% 화면 배율을 조절할 수 있게 했고, 관전 카메라 줌 범위는 spectator의 minZoom/maxZoom 단일 데이터로 관리하며 최소 줌을 0.35로 확대했다.

3.689: 모바일 디버그 진입 버튼을 메인/로비 계정 칩에서 제거하고 실제 인게임 HUD용 고정 버튼으로 이동했다. 모바일 환경이면서 debugTools 권한이 있을 때만 게임 화면에서 표시되며 기존 DebugPanel을 직접 토글한다.

3.688: 메라 모나 적중 게이지는 완충 시 호 색상을 흰색으로 바꾸지 않고 기존 마젠타를 유지하며 최대 충전 점멸링만 표시한다. 모바일 환경에서는 debugTools 권한이 있는 계정의 좌하단 계정 칩에 DEBUG 버튼을 표시해 Backquote 없이 기존 DebugPanel을 열고 닫을 수 있게 한다.

3.687: 에라 파비 파비 레이저와 메라 모나 4단계를 공통 `projectileClassification:'instant-laser'` 분류로 묶었다. 즉발 레이저 투사체는 실제 판정은 delivery.area/hitscan geometry를 사용하면서 `히트스캔 / 범위 공격 / 공격형태 투사체 / 레이저 투사체 / 즉발 레이저 투사체` 태그를 동시에 파생한다. 메라 모나 4단계는 이동 투사체를 제거하고 파비 beamLine과 동일한 시각 구조를 얇은 halfWidth 8로 사용하며 벽 차단 사거리와 시각을 clipToAttackArea로 일치시킨다. 새 gameplay 모듈은 추가하지 않았다.

3.686: 3.685의 체리티 LMB 기본 탄속 10% 감소를 취소해 기본 탄속을 18로 복구하고, 최대 차징 탄속만 44로 조정한다. RMB 피해 150 및 메인마드 networkReplay 수정은 유지한다.

3.685: 체리티 LMB 탄속 10% 감소, RMB 피해 150 교정. 송신자에서 이미 확정된 networkReplay 공격은 수신측 원격 canAct 미러 상태로 재차 취소하지 않아 차징 공격(메인마드 등)의 대상 권위 재생 누락을 방지한다.

3.684: 기존파일 기준 메라 모나를 3.0에 구현했다. 평타는 전 단계 공통 laser-bolt 투사체를 사용하고 변신 600ms 동안 레이카 회전 원 계열 annularDoubleSweep을 표시한다. 엘린/미아루키/프릴 밸런스 변경을 함께 반영했다.

3.683: 로비 멤버 카드는 PID가 아니라 joinOrder 순으로 표시해 재입장자를 항상 가장 오른쪽에 배치한다. 새 참가자의 초기 팀은 현재 연결된 참가자가 쓰지 않는 색을 red→blue→yellow→green 순으로 배정한다.

DUELS 3.0 개발 절대 규칙
- 3.682: 아군 호 게이지 공개를 공통화해 레이카/파비/칸 progress 호, 인투 timed-action 재장전 호, 채널/차징 호, 소환수 파괴 복구 호를 같은 팀 화면에도 표시한다. timed-action 상태를 duel-state에 직렬화해 원격 아군의 인투 재장전 진행도도 동기화한다. 호스트 승계/재입장에서는 stale connection close가 새 연결을 다시 끊지 못하도록 현재 connection identity를 검증하고, 동일 방 코드 host claim 재시도를 강화해 승계자가 완전한 RoomService host 권한을 유지한다. 방 대기 중 끊긴 stale 멤버 슬롯도 새 입장 전에 정리한다.
- 3.681: 레이카 일반/가호 평타의 직접 피해를 arcSweep 애니메이션 진행과 동일한 progressive hit 경로로 통합해 검격이 닿기 전에 전체 부채꼴 피해가 선적용되던 문제를 제거했다. 로온 빙수 지대는 회피 중에도 containment를 유지한다. 조건부 replaceAutoAreaEffect가 실제로 실행되지 않은 경우에도 자동 공격 이펙트를 숨기던 공통 판정을 수정해 미리보기 뒤 실제 공격 연출이 사라지는 경우를 제거했다. 실제 설치 field.area와 소환수 fieldArea 윤곽선은 중립 연막을 제외하고 공통 실선으로 통일했다. 소환수 spawnEffect는 scaleWithFieldRange 옵션으로 실제 준비된 field 범위 배율을 재사용하며 펠루나 모루 착탄 원도 범위 증폭과 일치한다.
- 3.680: 애니메이션형 clipToAttackArea 공격의 벽 절단 윤곽을 완성형 정적 선으로 미리 생성하지 않고, 스야 arcSweep/progressSweep과 동일하게 현재 애니메이션 진행 geometry에서 생성하도록 공통화했다. annularDoubleSweep은 현재 sweep 각도·반경을 따라 벽 raycast가 반영된 진행형 polygon 윤곽을 만들고, konyeongSwing은 현재 확장 반경까지의 벽 차단 polygon을 그린다. progressRect는 벽에 도달한 프레임부터 실제 절단면만 표시한다. 레이카 RMB 등 회전/확장 공격의 잘린 부분과 막힌 부분 윤곽이 이펙트 진행과 함께 생성된다.
- 3.679: annularDoubleSweep의 clipToAttackArea polygon을 렌더러가 매 프레임 전체 stroke하던 중복 윤곽 경로를 수정했다. clip points는 sweep 마스크로만 사용하고 현재 진행도에 따른 outer/inner arc가 윤곽을 그리며, 전체 clipped polygon stroke는 drawsClippedOutline:true일 때만 사용한다. 레이카 RMB가 회전 이펙트 시작 순간부터 완성된 원형 윤곽선을 표시하던 문제를 해결했다.
- 3.678: 홀드 평타 반복 준비시간이 Ability의 기본 attackId만 보던 문제를 수정했다. action.attack의 현재 상태 기반 alternate AttackSpec을 공통 해석해 실제 실행될 공격의 cooldown을 기준으로 반복 입력을 제한한다. 레이카 가호 상태에서 LMB 홀드 시 기본 평타 쿨다운이 비어 있어 매 프레임 가호 평타가 재실행되던 즉발 다단히트를 해결하며, 캐릭터 전용 차단은 추가하지 않았다.
- 3.677: 3.676에서 잘못 변경한 레이카 화염 고정 40 피해를 롤백했다. 레이카가 부여하는 화염은 다른 화염과 동일하게 최대 체력 5%/0.5초의 공통 BURN 규칙을 사용한다. 메인마드 차징 평타 온라인 릴리스 수정은 유지한다.
- 3.675: 인투 재장전 gauge.arc의 색상을 기존 노란색 #ffd97a에서 인투 캐릭터 색 #a18a8a로 통일했다. 재장전 동작과 점멸링, 탄창 게이지 및 공격 수치는 변경하지 않았다.
- 3.674: 인투 스테미나 비용을 3.0 스테미나 스케일에 맞춰 권총 150/산탄총 300으로 교정했다. 재장전은 timed-action-progress gauge.arc로 1.5초 호 게이지를 표시하고 완료 후 500ms 점멸링을 유지하되 activeOnly 상태 조건으로 완료 직후 공격 잠금/탄창 색상은 해제한다. 일반 관통 투사체에도 대상별 1회 hitIds를 공통 적용해 같은 대상을 프레임마다 재타격하지 않게 했고, 저격 LMB는 기존 timing.delay를 조건부 재사용해 300ms 선딜 후 실시간 조준으로 발사한다. 저격총 탄환은 반격 첫 발과 이후 수동 발사 모두 하늘색 #9bdcff로 통일했다.
- 3.673: 인투 재장전/반격 실행 오류를 수정했다. 재장전 state.window에 완료 예약 실행을 보호하는 retainCompleteMs를 부여해 1.5초 만료 프레임의 state.absent 조회가 resolve AttackSpec보다 먼저 상태를 삭제하지 않게 했고, 반격은 CounterModuleService가 실제 CC로 인정하는 기존 movement.neutralize-knockback을 사용해 0.3초 선딜 후 정상 발사된다. 반격 첫 저격탄과 SP 표시는 하늘색 #9bdcff, PT/SG 표시는 인투 캐릭터색 #a18a8a로 통일했다.
- 3.672: 기존파일 기준으로 인투를 3.0 공통 구조에 구현했다. 권총/산탄총 전환 즉시 발사, 공용 12발 탄창, 소진 시 1.5초 재장전, 반격 저격총 전환/관통/넉백을 유지하고 탄창은 본체 아래 12칸 segmented gauge로 표시하고 기존 PT/SG/SP 무기명과 무기/재장전별 색상은 유지한다. 탄창은 기존 state.progress, 재장전은 state.window 만료 후 effectsOnly AttackSpec, 무기 상태는 기존 mode state를 재사용한다. ProgressStateService와 월드 게이지/조건 판정에는 범용 initial 값을 추가하고 AttackModuleService의 after-attack 모듈에 기존 TriggerConditionService 조건 판정을 연결해 캐릭터 전용 런타임을 추가하지 않았다.
- 3.671: 로온 빙수 지대의 remainingArcGauge 색상을 로온 캐릭터 색 #A5F9A6과 동일한 RGB(165,249,166)로 통일했다.
- 3.670: areaCircle의 remainingArcGauge가 clip polygon points 존재 시 렌더되지 않던 조건 오류를 수정했다. remainingArcGauge는 areaCircle의 실제 외곽 반경을 기준으로 points 유무와 무관하게 표시되며 로온 빙수 지대의 4초 감소형 호 게이지가 정상 출력된다.
- 3.669: 로온 빙수 지대 외곽에 남은 활성시간을 표시하는 감소형 호 게이지를 추가했다. 기존 areaCircle 프레젠테이션에 범용 remainingArcGauge 옵션을 확장해 키의 남은 시간 호와 동일하게 -π/2에서 시작해 가득 찬 호가 남은 시간 비율만큼 감소하고 지대 이펙트 종료와 동시에 사라진다. 로온 전용 렌더러/타이머 상태는 추가하지 않았다.
- 3.667: 설명 참조 보간을 수정해 range-projectile의 rehitInterval도 fieldIntervalSeconds로 사용하고 modifierAttack의 실제 Buff modifier 값을 damageIncreasePercent에 우선 반영한다. tooltip 키의 슬래시 양옆 공백을 제거했다. 다즈빈 LMB 유도 시작을 이동거리 30% 이후로 변경하고 셰리나 LMB/반격 화살 탄속을 40% 증가시켰다. 실제 설치 field.area의 presentation 윤곽선은 InstalledAreaFieldService에서 공통 실선으로 강제해 셰리나 잔향/더블링·베르 장판 등 설치형 범위공격을 통일하되 별도 effect.spawn 안내범위의 점선은 유지한다.
- 3.666: 로온 빙수 게이지를 다시 8칸 segmented-gauge로 복구하고 valueMode:'count'를 사용해 현재 누적값 이하의 모든 칸이 계속 채워지도록 수정했다. 5스택이면 1~5칸이 모두 채워지고 6~8칸만 비어 있다.
- 3.665: 로온 분류를 행동제약형으로 복구했다. 빙수 progress presentation은 기존 WorldGaugeBarPresentationService를 재사용하는 bar-gauge로 변경해 최대 8 기준의 연속 게이지 바가 1/8씩 차오르게 했다. recipient:'target' state.progress의 on-hit 적용 권위를 맞은 대상 권위 클라이언트로 수정해 온라인에서 빙수 게이지가 즉시 사라지던 문제를 해결했다.
- 3.664: 샤이라즈와 로온의 전투 성향을 범위장악형으로 변경했다. AttackModuleService.onHit의 state.progress 처리에서 스코프에 존재하지 않는 impact 변수를 참조하던 회귀를 제거하고, 실제 delivery/AttackExecution 정보에서 필요한 hit impact context를 범용 생성해 전달하도록 수정했다.
- 3.663: 공통 은신 프레젠테이션 판정을 미니맵에도 연결해 아군/자신에게는 은신 플레이어를 계속 표시하고 적에게는 감지/일시노출되지 않은 은신 플레이어를 숨긴다. 미니맵 겹침 투명도 계산도 같은 가시성 판정을 사용해 숨은 적 위치가 간접 노출되지 않는다. live-aim-point 반복 범위공격은 원격 source의 `_remoteAimTargetPoint`를 매 반복 타격 시 읽어 대상 권위 화면에서도 송신자의 최신 조준점을 사용하며, 루네프 낙뢰가 로컬 이펙트만 보이고 상대 권위 판정에서 빗나가던 문제를 공통 범위공격 경로에서 수정했다.
- 3.662: 기존 듀얼즈 기준으로 로온을 구현했다. LMB 얼린 멜론 2연타/빙수 누적, RMB 빙수 지대의 적중 이동·감금, 반격 급속 냉동을 3.0 공통 AttackSpec/field/CC 구조로 옮겼다. 빙수 누적은 state.progress의 target recipient를 범용 지원해 피격 대상에게 저장하고, segmented progress presentation을 WorldGaugeModuleService가 스테미나 바 아래에 표시한다. 최대 8칸이 차면 공통 freeze를 적용하고 진행도를 초기화한다. field.area에는 원형 지대에 한 번 들어온 적을 활성시간 동안 경계 안에 유지하는 범용 containment 옵션과 activeDuration을 추가했다.
- 3.661: 증강 rebuild 시 더 이상 보유하지 않는 증강이 남긴 무한 trigger modifier source를 공통 정리한다. 증강 제거 후 과충전 공격의 DMG/BULLET SPD가 남는 stale buff를 캐릭터 ID/증강 ID 예외 없이 해결한다.
- 3.660: 전체 코드 중간점검. 프레임/고빈도 경로의 불필요한 배열·객체 할당을 줄이고, gameplay raw timer를 SimulationScheduleService로 통합했으며, 캐릭터 Trigger/패시브 스캔의 임시 배열 생성을 제거했다. NetworkCollisionPositionService는 Entity별 좌표 객체를 재사용하고, timed-threshold 게이지 그룹/세그먼트도 pool/cache를 재사용한다. 중복 CSS 규칙과 캐릭터 설명의 중복 수치 하드코딩을 제거했다. 광범위 충돌 알고리즘/네트워크 프로토콜/선언형 캐릭터 데이터 builder화처럼 회귀 위험이 큰 구조 변경은 감사 결과만 기록하고 보류했다.
- 3.659: retainCompleteMs가 있는 timed-action-state가 만료 프레임의 presentation 갱신에서 예약된 resolve continuation보다 먼저 삭제되는 경합을 수정했다. open 시 retainUntil을 expiresAt+retainCompleteMs로 미리 설정해 완료 공격 실행 전 상태가 사라지지 않게 하며, 루네프 RMB 원소 선택이 미리보기만 끝나고 실제 마법이 가끔 발사되지 않던 문제를 공통 TimedActionStateService 수명 규칙에서 해결했다.
- 3.658: 루네프 LMB의 공통 attackDelayGroup(runef-lmb)은 유지하고, 3.657에서 임의로 추가했던 inputPolicy.repeatWhileHeld:false만 제거해 3.0 평타 기본 홀드 자동반복 규칙으로 복구했다.
- 3.657: 3.656의 피해 숫자 AttackExecution별 병합 분리를 완전히 롤백했다. 루네프 LMB 1타/연쇄 2타는 기존 듀얼즈의 단일 lmbCooldown 동작과 동일하도록 공통 attackDelayGroup을 공유하며 각각 200ms/500ms 딜레이를 적용한다. 루네프 LMB는 홀드 자동반복을 끄고 각 클릭 입력에서만 발사되어 1타 상태가 자동 반복으로 소비되거나 추가 탄환이 생성되지 않는다.
- 3.656: 루네프 화염구 선택 미리보기에 본체 projectile-path와 후속 폭발 범위를 동시에 표시하도록 공통 projectile.impact preview parts를 수정했다. 서로 다른 AttackExecution의 피해 숫자가 80ms 병합창에서 하나로 합쳐지지 않도록 피해 숫자 그룹키를 executionSequence로 분리해 루네프 LMB/LMB가 100+150을 250 한 타처럼 표시하던 문제를 제거했다. live-aim-point 범위공격에 범용 centerPointResolve:'nearest-open'을 추가하고 루네프 낙뢰에 적용해 엘린 지정점 투사체와 같은 WorldGeometryService.nearestOpenPoint 보정을 사용한다.
- 3.655: 루네프 화염구/낙뢰의 범위 판정을 wallPolicy:block으로 통일해 벽 너머 피해를 차단했다. 화염구 본체는 충돌 전용 투사체(damageOnTravel:false + collisionTargets:true)로 바꿔 직격 350과 폭발 350이 중첩되던 문제를 제거하고, 기존 파일의 폭발 넉백 420을 3.0 거리 42의 away-from-impact 공통 넉백으로 복구했다. 루네프 LMB/연쇄 LMB 색은 캐릭터 색 #4c10c4로 통일하고 연쇄 상태는 action.attack의 consume 단일 경로만 사용하도록 중복 clear를 제거했다.
- 3.654: 루네프 바람 반격의 운반 거리를 공격 사거리 끝점까지만 계산하는 공통 distanceMode로 수정했다. 범위 투사체는 delivery.range-projectile 자체의 기본 벽 충돌을 중심점 기준으로 통일하고 다즈빈 전용 wallCollisionMode 지정은 제거했다. 루네프 바람 범위 투사체 색을 기존 파일의 0,180,50 계열로 맞추고, projectile.impact 후속 범위 공격을 투사체 예상 착탄점에 표시하는 공통 미리보기 경로를 추가해 화염구 폭발 반경이 표시되도록 했다.
- 3.653: DOT 종료 틱을 재검증해 화염 공통 틱 간격을 500ms로 통일하고 종료 시각 틱을 포함한다. 빙결은 별도 해제 5% 피해를 제거하고 실제 빙결 DOT 피해를 한 번도 받지 못한 상태로 해제될 때만 정상 빙결 DOT 1회를 보장한다. 도움말의 빙결 해제 피해 문구와 폐기된 재생 항목을 제거하고 버프 색상을 BuffStatusPresentation의 실제 인게임 색상과 통일했다.
- 3.645: StaminaService의 실제 소비/회복/설정도 공통 resource.changed(stamina)를 발생시키도록 통합하고, 훈련장 자연 스테미나 회복도 StaminaService.restore 경로를 사용한다. 과충전 공격의 DMG/BULLET SPD가 최대 스테미나가 아닌데 남아 있던 stale modifier를 제거한다.
- 3.646: 샤이라즈 덫 발동 후 afterlife 재설치 금지 반경을 실제 발동 이펙트/피해 반경 78과 동일하게 통일했다. 반격기로 생성한 `shairaz-counter-trap`도 RMB 대상 판정에서 별도 회수 AttackSpec을 선택해 일반 덫과 동일하게 회수하고 스테미나 300을 회복한다.
- 3.652: 루네프 번개 선택 미리보기를 실제 조준 지점에 고정하고, 루네프 바람 마법과 다즈빈 파동 구체를 공통 신규 전달형태 `delivery.range-projectile`/`범위 투사체`로 통합했다. 범위 투사체는 투사체이면서 히트스캔·범위 공격·원형 공격 태그를 함께 파생하고 같은 이중 원형 범위 투사체 렌더를 사용한다. 루네프 원소 선택 gauge.arc는 완료 후 500ms 유지하며 3.0 공통 점멸링을 표시하고 EntityRingLayoutService가 timed-action gauge도 private gauge로 인식해 반격 활성 링과 슬롯이 겹치지 않게 한다.
- 3.651: 루네프의 일반 투사체/공통 공격 표현을 3.0 기본 시스템으로 복구했다. 3.650에서 루네프를 위해 추가했던 simple-circle/gradient-tail-circle/multi-ring-trail/multiCircle 전용 프레젠테이션 경로를 제거하고, LMB·화염구는 3.0 기본 투사체 렌더, 화염 폭발·번개는 기존 areaCircle, 반격 토네이도는 기존 special-projectile ring을 사용한다. 루네프 고유 수치·색·상태 선택 동작은 유지하며 LMB/LMB 중복 실행 방지 수정도 유지한다.
- 3.650: 루네프 시각 표현을 기존 듀얼즈 기준으로 재조정했다. LMB/연쇄탄은 기존 보라색 투사체, 화염구는 적색 투사체, 화염 폭발/번개/토네이도는 기존 다중 원형의 색·알파·선 두께·지속시간을 공통 multiCircle/다중 링 투사체 프레젠테이션으로 재현한다. RMB 0.4초 선택창은 기존 state.window 상태를 공통 gauge.arc와 실시간 공격 미리보기에 연결한다. LMB/LMB의 실제 두 번째 AttackSpec 피해는 baseDamage 100 × damageRatio 1.5 = 150으로 고정 검증하며 기본 LMB와의 중복 실행 경로를 차단한다.
- 3.649: 루네프 원소 선택을 불필요한 신규 선택 서비스에서 제거하고 기존 state.window + Trigger 선처리/fallback 구조로 통합했다. 활성 선택 창에서 LMB/RMB는 state.window 선택 갱신이 먼저 처리되어 기본 공격을 막고, 0.4초 만료 시 저장된 선택의 AttackSpec을 실행한다. 루뷰 RMB/LMB와 같은 '특수 상태 모듈 우선 → action.attack fallback' 입력 구조를 재사용한다.
- 3.647: 기존 듀얼즈 기준으로 스야를 구현했다. 대낫베기, 서리안개 은신의 지속 스테미나 소모/이동속도 증가/근접 발각 빙결/다음 2회 평타 가속, 서리폭풍 베기 반격을 3.0 공통 AttackSpec·BuffService·CCService 구조로 옮겼다. 은신 유지와 제한 횟수 공격 버프는 캐릭터 ID 분기 없이 재사용 가능한 StealthModeService/LimitedUseBuffService가 담당한다.
- 3.644: 과충전 공격은 별도 OVERCHARGE 상태를 제거하고 기존 BuffService의 damage/projectileSpeed modifier를 사용해 DMG/BULLET SPD로 표시한다. 충전 반격은 반격 사용 후 남은 스택이 있으면 활성 유지 시간을 최신 획득 창으로 초기화한다. 공격 스텝/회피 공격/충전 반격 설명의 사용자 지정 핵심 문구 강조를 복구했다.
- 3.643: 충전 반격의 현재 보유 반격 수를 스테미나 바 아래 증강 게이지에 채워진 칸만큼 표시하고 사용 시 칸 자체가 줄어들도록 했다. 같은 저스트 회피 토큰의 반격 획득을 중복 처리하지 않도록 CounterStockService 획득을 토큰 단위로 멱등화했다. 훈련장 증강 화면은 일반/희귀/에픽/고유 섹션 구조를 복구하고 AUGMENTS 코드 배열도 등급별로 묶어 각 등급 내부 기존 순서를 유지한다. 회피 공격은 기본 이동거리 160으로 상향하고 해당 회피 공격으로 유예된 평타 실행에 84 고정 넉백 extra module을 부여하며, 공격 스텝/회피 공격 이모지를 고유 이모지로 교체했다. 과충전 공격은 최대 스테미나 여부를 공통 BuffService OVERCHARGE 버프로 동기화하고 attack adjustment가 해당 버프를 참조한다.
- 3.642: 증강 3.641 후속 수정. 공격 스텝/속공 이모지를 고유 이모지로 교체하고 공격 스텝 설명을 요청 문구로 단순화했다. 충전 반격의 phantom charge fallback을 제거해 실제 저스트 회피 획득 수만 저장한다. attackAdjustments 조건은 공통 TriggerConditionService로 fallback해 과충전 공격의 최대 스테미나 조건이 정상 적용된다. 회피 공격은 attack-requested 증강 Trigger에서 기존 movement.move를 사용해 현재 회피를 즉시 취소하고 고정거리 이동기를 시작하며, 해당 이동 종료까지 모든 공격은 기존 공격 대기 큐로 유예한다. DODGE SPD는 TAB 상세 표시에만 노출하고 연속 회피의 각 추가 회피는 시작 순간의 현재 이동 입력을 다시 읽는다. 훈련장 증강 화면과 AUGMENTS 배열은 추가 순서를 그대로 유지하며 파일 내 사용자 표기 '에픽'을 '에픽'으로 통일했다.
- 3.641: 공유 증강 7종(절박한 마음/속공/공격 스텝/분산 투자/회피 공격/충전 반격/과충전 공격)을 추가했다. dodgeSpeed 공통 버프 스탯과 DODGE SPD 표시를 추가하고, modifier.set의 기존 valueRef 해석을 증강 Trigger에서도 재사용한다. 공격 준비 시 resource.full 조건과 projectileSpeedBonus attack adjustment를 지원해 최대 스테미나 조건 공격을 비용 지불 전 스냅샷으로 적용한다. 충전 반격은 캐릭터 비의존 CounterStockService가 반격 충전 보관/소비/활성시간 갱신을 담당한다.
- 3.636: 회피 계열 공유 증강을 개편했다. 신중한 반격은 기본 저스트 회피 반격 활성시간의 +200%, 치유 회피는 저스트 회피 시 최대 체력 10% 회복/회피거리 -15%, 가드 회피는 회피 시작 시 3초간 방어 +25%, 연속 회피는 추가 1회/회피거리 -15%로 변경했다. 가벼운 걸음 이모티콘을 신발로 변경하고, 일반 등급 예비 탄약을 추가해 평타 사용 시 현재 스테미나가 실제 요구량보다 부족하면 라운드당 1회 최대 스테미나의 50%를 즉시 회복한 뒤 사용 가능 여부를 다시 판정한다.
- 3.640: target-point 투사체 도착 정책에 `passWallsInFlight` 옵션을 추가했다. 이 옵션은 비행 중 중간 벽 충돌만 무시하고 최종 targetPoint의 벽 착탄/벽 스냅 판정은 기존 arrival 경로를 유지한다. 메후구 RMB 로프 투척에 적용해 벽 너머 목표까지 비행하면서도 최종 벽에는 정상적으로 로프를 설치한다.
- 3.639: 공유 증강 `예비 탄약`을 완전히 제거했다. 관련 stamina.reserve 발동 경로, 라운드 사용 상태, 로컬/원격 전용 연출도 함께 삭제했다.
- 3.637: 에라 파비 파비 레이저 피해를 50% 증가시켰다. 레이카의 직접 사용 평타/LMB 및 스킬/RMB 상태별 본체 공격 쿨다운을 40% 증가시키고, 피해 기반 가호 충전 비율을 50 피해당 자연충전 1.5초분으로 조정했다. 연속 회피의 추가 회피 간격은 80ms에서 40ms로 단축했다.
- 3.634: 페이즈/펠루나 요청 설명 문구를 반영했다. 부활 증강은 hidden 처리와 일반 stun/invulnerable 조합을 제거하고 공통 REVIVE CC + evasionInvulnerable(비타격 무적)로 통일해 로컬/원격 모두 같은 캐릭터 표시/CC 프레젠테이션을 사용한다. 타격 기반 state.progress 획득은 공통 ProgressHitTargetPolicy에서 summon/trainingBot 대상을 제외하며, attack on-hit progress와 character damage-dealt progress 모두 같은 정책을 사용한다.
- 3.632: 셰리나 비아의 LMB/반격 잔향과 RMB 더블링 progressRect 외곽선을 다른 설치형 범위와 동일한 점선으로 통일했다. 펠루나 LMB 선딜 중 contractingChargeCircle을 제거하고 미리보기만 유지한다. 펠루나 LMB III는 실제 damageRatio 1.6(+60%) 기준 설명을 참조하며, 반격은 기본 캐릭터색/현재 3단계일 때 주황색 AttackSpec을 기존 counter.execute.alternateWhen으로 선택한다. 캐릭터 tooltipSkills에 남아 있던 숫자 하드코딩(페이즈/셰리나/펠루나/프릴)을 실제 공격·필드·패시브·progress 데이터 참조값으로 치환했다.
- 3.633: 다즈빈/유이/하츠하츠 설명 문구를 요청한 표현으로 정리했다. 펠루나 3단계는 별도 LMB damageRatio가 아니라 ProgressStateService의 범용 thresholdModifiers가 실제 BuffService damage +60%를 활성/해제하도록 변경해 3단계 동안 공통 피해 증가 버프를 사용한다.
- 3.630: 셰리나 비아 RMB 사용 원과 베르 RMB/RMB 가속 사용 원의 시각 반경을 엔소냐 RMB pulse의 72px와 동일하게 통일했다. 실제 공격/장판 범위는 변경하지 않고 effect.spawn의 시각 반경만 수정했다.
- 3.629: 공격 미리보기 렌더를 엔티티 본체 패스 이전으로 이동해 점선 범위가 캐릭터 아래에 표시되도록 통일했다. 셰리나 반격은 기존 CounterModuleService charge preview를 사용해 300ms 동안 3개 projectile-path 직사각 미리보기 사거리가 0→798로 연속 증가한다.
- 3.628: 셰리나 LMB 차징 비용을 체리티/메인마드와 같은 during-charge 실시간 100~300 소모로 변경하고 차징 중 스테미나 자연회복을 막았다. 셰리나 반격은 실제 AttackSpec 사거리를 798로 수정하고 previewProjectilePaths로 3발 직사각 경로 미리보기를 사용한다. projectile-path rect field처럼 생성 전 range가 0이어도 halfWidth가 있는 실제 피해 field는 범위 공격 태그를 파생해 기존 범위 증폭 geometry scaler를 받도록 수정했다. 체리티 LMB는 기존 ChargedAttackService 기본 차징 미리보기를 활성화했다.
- 3.627: 셰리나 LMB 스테미나를 차징률 비례 100~300으로 변경하고 차징 미리보기는 3.0 기본 스타일을 사용한다. projectile-path 잔향의 생성 속도는 실제 투사체 속도와 경로 길이로 계산하며, 최근 LMB 경로 3개는 잔향 수명과 별도로 보존해 잔향이 사라진 뒤에도 더블링이 가능하다. RMB 잔향 피해 틱은 500ms로 교정했다. damageOnTrigger field도 실제 피해 범위이므로 범위 공격 태그/범위 증폭을 받게 수정했다. 반격 사거리는 LMB와 같은 798이며 3발 직사각 projectile-path 미리보기를 표시한다.
- 3.626: 셰리나 잔향을 pathTimeline으로 시작점→끝점 순서로 생성·소멸시키고 실제 field.area 충돌 범위도 같은 시간 geometry를 사용한다. damageStackGroup으로 겹친 잔향은 같은 대상에 가장 높은 피해 하나만 틱을 적용한다. 반격은 3발 동시 투사체 + 독립 counter 잔향으로 리메이크해 LMB/RMB 최근 잔향 목록과 분리했다.
- 3.625: 셰리나 비아 구현. LMB를 최대 0.7초 차징 투사체로 변경해 사거리가 20%~100% 연속 증가하며, 투사체 종료 시 실제 비행 경로와 동일한 rect field.area 잔향을 생성해 2.5초 동안 0.5초 간격 피해를 준다. RMB 더블링은 넉백을 제거하고 비용 500으로 변경하며 최근 잔향 3개를 확장 field로 재생성한다. 기존 field.area에 projectile-path anchor 해석을 추가하고 범용 field.expand-recent 모듈을 추가했다.

0. 최우선 규칙
- 코드를 추가, 삭제, 수정, 리팩터링하기 전에는 반드시 이 규칙 전체를 처음부터 끝까지 세세하게 정독한다.
- 캐릭터/스킬 설명의 스테미나 비용은 실제 비용이 0이어도 생략하지 않고 `스테미나 0`으로 표시한다. 단계 설명·추가 효과처럼 독립적으로 사용하는 행동이 아닌 정보 행만 비용 표기를 숨길 수 있다.
- 코드 작업을 시작하기 전 반드시 가장 먼저 규칙 전체를 읽었다고 명시한다.
- 이전 작업에서 읽었다는 이유로 생략하지 않는다.
- 모든 코드 구현 및 수정은 이 규칙보다 우선할 수 없다.

0-A. 기존 기능 선확인 규칙
- 새로운 기능을 추가하기 전에는 반드시 기존 코드와 모듈 전체에서 동일하거나 유사한 기능이 이미 존재하는지 먼저 확인한다.
- 동일하거나 유사한 기능이 존재하면 새 구현을 별도로 만들지 않고 기존 기능이나 모듈을 재사용, 응용, 확장 또는 일반화한다.
- 새로운 모듈은 기존 기능으로 합리적으로 표현할 수 없는 경우에만 추가한다.
- 이 확인 없이 새 기능이나 새 모듈을 추가하는 것을 금지한다.

0-A-1. 기존 코드 형식 우선 규칙
- 새 기능, 데이터, 설명, UI, 네트워크, 모듈 또는 시스템을 제작할 때 현재 코드에 동일하거나 유사한 용도의 형식, 구조, 패턴, 데이터 작성법이 이미 사용되고 있으면 그 방식을 우선 사용한다.
- 예외가 필요한 경우는 허용하지만, 특별한 이유가 없다면 새로운 형식을 임의로 만들기보다 기존에 사용 중인 형식을 재사용하거나 그 형식 안에서 확장하는 것을 우선 권장한다.
- 기존 형식으로 충분히 표현 가능한 내용을 캐릭터 전용 예외 형식이나 별도 표기 규칙으로 만들지 않는다.

0-B. 추측 수정·추측 보고 절대 금지
- 현재 기준 파일의 실제 코드를 직접 확인하지 않은 상태에서 구현을 추측해 수정하지 않는다.
- 실제 파일에 반영됐는지 검증하지 않은 내용을 수정 완료라고 보고하지 않는다.
- 원인, 기존 모듈 존재 여부, 변경 위치, 검증 결과를 추측으로 단정하지 않는다.
- 코드 수정과 패치 보고는 반드시 현재 기준 파일에서 직접 확인한 코드와 실행 가능한 정적 검증 결과를 근거로 한다.
- 확인할 수 없는 항목은 확인하지 못했다고 명시하며, 추측으로 빈 내용을 채우지 않는다.

0-C. effect.spawn 시각 이펙트 단일 생성 규칙
- 캐릭터, 공격, 버프, 디버프, CC, 이동, K.O., 전투 피드백 등 게임 월드의 모든 시각 이펙트 생성은 원칙적으로 공통 `effect.spawn` 모듈과 EffectSpawnService를 사용한다.
- 개별 시스템이 `Training.fx`에 직접 이펙트를 삽입하거나 캐릭터/스킬 전용 FX 생성 함수를 새로 만드는 것을 금지한다.
- 기존 이펙트도 수정 또는 리팩터링 시 가능한 범위에서 `effect.spawn` 생성 경로로 통합한다.
- 움직이는 이펙트는 `effect.spawn`의 `animation:true`와 animation 데이터로 표현한다. 이펙트 진행 위치를 공격 판정에 사용하는 경우 같은 animation state를 렌더와 판정이 공유해 보이는 위치와 실제 피해 위치를 일치시킨다.
- 같은 하나의 이펙트는 자기 화면과 다른 모든 플레이어 화면에서 완전히 같은 EffectSpec과 동일한 진행 타임라인을 사용한다. 위치, 크기, 지속시간, 색상, 채움/윤곽 알파, 선 두께, 점선 간격, variant, easing, animation 값 등 사소한 내부 시각 수치까지 일부만 골라 복사하거나 원격에서 다른 기본값으로 재구성하는 것을 금지한다. 상태 동기화가 반복되더라도 같은 이펙트의 start/progress/fade를 매 패킷마다 초기화하지 않는다. 서로 다른 phase/trigger의 이펙트가 같은 effectKey를 공유해 한쪽 화면에서만 갱신·삭제되는 구조도 금지한다. 네트워크 동기화가 필요한 이펙트는 공통 EffectSpawnService의 직렬화 가능한 EffectSpec 및 상대 타임라인 스냅샷을 그대로 전달한다.
- 자동 area 공격 FX와 movement.move 경로선도 로컬 전용 생성으로 두지 않고, 로컬에서 생성한 동일 EffectSpec의 presentationSnapshot을 원격에 전달한다. 원격 지속 투사체는 공격 액션보다 오래된 duel-state 누락 스냅샷으로 삭제하지 않는다.
- `effect.spawn`으로 합리적으로 표현할 수 없는 예외가 발견되면 별도 전용 구현을 임의로 추가하지 않는다. 예외가 필요한 이유, 재사용 불가능한 기존 구조, 필요한 대안을 사용자에게 먼저 별도로 보고한다.

0-D. 새 모듈 생성 사유 보고 규칙
- 새로운 모듈을 추가할 때마다 패치 보고에 반드시 다음 세 가지를 명시한다.
- `projectile.impact`는 투사체가 적/벽/경계/최대 사거리에서 종료될 때 충돌 지점에서 별도 AttackSpec들과 고정 좌표 `field.area`를 실행하는 범용 후속 모듈이다. 로켓, 수류탄, 착탄 장판이 재사용한다.
- `damageOnTravel:false + collisionTargets:true`인 충돌 전용 투사체도 적 접촉 순간 먼저 공통 `JustDodgeService.confirmProjectile()`을 통과한다. 저스트 회피가 성립하면 투사체만 제거하고 `projectile.impact` 후속 AttackSpec/field를 실행하지 않는다. 따라서 투사체 본체를 저회한 대상에게 그 접촉에서 파생된 폭발/기절/장판이 뒤늦게 적용되지 않는다.
- `field.area anchorMode:'point'`는 기존 InstalledAreaFieldService의 relation/interval/status/정리 경로를 그대로 사용하는 고정 좌표 장판이다.
- `field.area`의 trigger module은 `removeOnExit:true`를 사용하면 field를 벗어난 즉시 해당 field source의 효과를 제거한다. `modifier.set`뿐 아니라 `status.apply`도 같은 sourceId 규칙으로 CCService.removeSource()를 사용하며, 베르 감속 지대는 이 경로로 이탈 즉시 감속이 해제된다.
- 설치 `field.area` 자체의 공간 접촉은 저스트 회피 판정이 아니다. 장판에 실제 `state.attack` 피해가 있다면 그 피해 tick이 `DamagePipeline`에 도달하는 순간에만 공통 `JustDodgeService.confirmDamageAttempt()`로 저회를 판정한다. 피해가 없는 버프/디버프/상태 장판은 저회 후보가 아니며, 저회 성공은 field state의 생성/수명/제거와 연결하지 않는다.
- `delivery.area repeatCenterDistanceStart/repeatCenterDistanceStep`은 반복 범위 공격의 중심을 공격 방향으로 순차 이동시키는 범용 옵션이다.
- 반복 원형 `delivery.area`가 순차 중심 거리를 가지면 AttackPreviewService가 해당 반복 구간을 하나의 직사각형 예고로 자동 파생한다. 캐릭터/공격 ID 예외는 사용하지 않는다.
- `movement.knockback`/`movement.neutralize-knockback`의 `direction:'away-from-impact'`는 전달된 area 중심 또는 projectile impact point를 기준으로 바깥 방향을 계산한다. 폭발형 넉백이 source 위치에 종속되지 않는다.
- `projectile.presentation`은 `kind`와 `style`을 범용 보존한다. 베르 로켓은 legacy 주황 원형 본체와 25px 불꽃 꼬리 렌더를 `kind:'projectile-style', type:'rocket'` 데이터로 사용하며 무기 투사체로 잘못 태깅하지 않는다.
- `delivery.delayed-projectile-volley`의 count도 `pattern.scatter`와 동일하게 `다중 공격` 자동 파생의 실제 데이터 원본으로 취급한다.
- AttackSpec에 `delivery.delayed-projectile-volley`가 있으면 그 모듈이 해당 공격의 projectile 생성 횟수/타이밍을 전담하고 `delivery.projectile`은 투사체 수치 정의만 담당한다. 둘이 동시에 별도 발사를 생성하지 않는다.
- `delivery.delayed-projectile-volley aimMode:'live-source'`는 예약 시점의 angle을 고정하지 않고 각 projectile 실제 생성 시점에 로컬 소유자의 현재 조준각을 다시 해석한다. 온라인에서는 원격 action replay가 최초 각도로 가짜 연속탄을 만들지 않으며, 각 실제 발사 시점의 `duel-scheduled-projectile-shot`을 받아 동일 attack/execution/shot ordinal로 투사체를 생성한다.
- 중심이 이동된 원형 `delivery.area`의 벽 LOS는 캐릭터 source가 아니라 실제 `AreaGeometryService` 중심에서 검사한다. 폭발 판정과 벽 절단 polygon이 같은 중심을 사용한다.
- point `field.area`는 명시한 wallPolicy를 유지하며 생성 순간 AreaGeometry polygon을 EffectSpec.points로 저장한다. 장판 판정과 장판 렌더가 같은 벽 절단 형상을 사용한다.
- point `field.area`는 생성 순간의 벽 절단 `areaGeometry`를 state에 canonical snapshot으로 보존한다. 지속 판정, 저스트 회피 접촉, 로컬/원격 EffectSpec.points 렌더는 전부 이 동일 polygon을 재사용한다. `slowZoneAppear`도 points가 있으면 전체 원을 다시 그리지 않고 해당 polygon 자체를 fill/stroke한다.
- 반복 범위 공격의 `repeatPathWallPolicy:'block'`은 source에서 각 반복 중심까지의 경로가 최초로 벽에 막히는 지점부터 해당 반복과 이후 반복 자체를 생성하지 않는다. 각 생성된 폭발의 내부 범위는 자신의 `wallPolicy`로 다시 벽 절단된다.
- `projectile.impact`가 point `field.area`를 포함하면 해당 field의 `설치형`/형태/CC 태그도 같은 TagService 재귀 파생 경로를 사용한다.
- 반복 폭발 AttackSpec의 `range`는 마지막 반복 중심뿐 아니라 최외곽 실제 판정까지 포함한 값을 사용한다. 베르 반격은 중심 최대 400 + 폭발 반경 100 = 실제 최대 500이다.
  1) 왜 이 모듈을 새로 만들었는가.
  2) 기존 모듈의 재사용 또는 확장만으로 해결할 수 없었던 이유는 무엇인가.
  3) 새 모듈이 맡는 범용 책임과 앞으로 어떤 기능이 재사용할 수 있는가.
- 이유와 범용 책임을 설명할 수 없는 모듈은 추가하지 않는다.
- `input.drag-path`는 포인터 드래그 경로·거리·진행도·거리 비례 지속 스테미나 소모를 하나의 범용 입력 상태로 수집해 release 단계의 기존 Attack/Movement 모듈에 전달한다. `maxDistance`는 진행도와 비용 상한이며 실제 포인터 경로 수집은 계속할 수 있다. 드래그 중 스테미나가 소진되면 입력 상태는 유지한 채 경로 기록만 일시 정지하고, 외부 회복 등으로 스테미나가 다시 생기면 같은 드래그를 이어서 기록한다. 공격 범위 미리보기는 이 모듈이 직접 만들지 않고 기존 `preview.create`/AttackPreviewService를 사용한다. 하츠하츠뿐 아니라 자유 경로 돌진·그리기 공격·경로 설치물에 재사용한다.

1. 기존 Duels와 모든 시각적 디자인을 완벽히 동일하게 유지한다.
- 내부 구조는 새롭게 제작해도 플레이어에게 보이는 결과는 기존 Duels를 기준으로 한다.
- UI, HUD, 카드, 메뉴, 공격 미리보기, 투사체, 범위 표시, 피해 인디케이터, 이펙트, 애니메이션, 색상, 크기, 배치 등 시각 요소를 임의로 재해석하지 않는다.
- 일반 공격 투사체는 기본적으로 기존 Duels의 원형 투사체 렌더를 사용한다.
- 한 공격 실행에서 여러 투사체를 동시에 발사하지만 같은 대상에게 피해가 한 번만 적용되는 공격은 `pattern.scatter` + `hit.once-per-execution` 조합으로 표현하고 `특수 투사체`로 분류하며 기존 Duels의 정마름모 규격(반경×1.2, 채움 알파 0.25, 윤곽 알파 0.95, 2px, 마지막 30% 페이드)을 사용한다.
- `무기 투사체`는 망치, 낫, 모루처럼 실제 무기나 물체 자체를 던지는 공격에만 사용한다.
- 히트스캔 공격은 공격 투사체 계열과 동일한 채움 알파 0.25, 윤곽 알파 0.95, 2px 규격과 공격 색 계열을 사용한다.
- 게임 로직과 시각적 표현은 분리한다.

2. 캐릭터, 실제 공격, 실제 효과는 태그 시스템을 사용한다.
- 증강 자체에는 태그를 두지 않는다. 증강은 효과와 모듈을 조립하는 데이터 묶음으로만 취급한다.
- 증강이 발생시키는 실제 효과와 AttackSpec에는 그 효과가 실제로 무엇을 하는지를 나타내는 태그를 둔다.
- 단순 수치 Modifier는 값이 증가면 `증강 버프`, 감소면 `증강 디버프` 태그를 자동 파생한다.
- 태그는 출처가 아니라 실제 성질을 나타낸다. `증강 발동`, 특정 증강 이름 같은 출처 태그를 전투 Query용으로 사용하지 않는다.
- 같은 입력에서 여러 공격이 나와도 실제 공격 단위마다 태그를 가진다.
- 연속 공격의 각 타격도 독립 태그를 가지며 마지막 타격만 크리티컬이면 그 타격에만 크리티컬 태그가 존재한다.
- 태그 시스템이 처리할 수 있는 내용을 캐릭터 이름이나 스킬 이름 예외문으로 처리하지 않는다.

3. 사거리 분류 태그는 실제 사거리 값으로 자동 결정한다.
- 근거리, 단거리, 중거리, 장거리, 초장거리 등을 공격 데이터에 직접 입력하지 않는다.
- 실제 사거리 수치만 원본 데이터로 보유하고 중앙 사거리 분류기가 자동 파생 태그를 생성한다.
- 실제 사거리가 바뀌면 태그도 자동으로 바뀐다.
- 사거리 기준은 중앙 시스템 한 곳에만 존재한다.

4. 기존 Duels의 계정 시스템과 데이터는 그대로 이용하되 내부 코드 구조는 개선한다.
- 기존 계정 API, 로그인, 계정 데이터, 통계, 랭킹과 호환한다.
- 기존 계정 구현을 게임 로직 곳곳에 복사하지 않는다.
- 계정 서비스 또는 어댑터 계층을 통해 게임 로직과 분리한다.

5. 모든 일반 버프/디버프는 하나의 공통 Modifier 시스템을 사용하고 서로 중첩한다.
- 어떤 출처의 일반 버프/디버프라도 공통 시스템에서 등록, 유지, 계산, 만료한다.
- 같은 종류의 증가 효과와 감소 효과를 포함해 현재 활성화된 모든 Modifier 인스턴스의 수치를 합산한다.
- 예를 들어 이동속도 +30%와 +10%는 +25%, +25%와 -10%는 최종 +30%로 계산한다.
- 각 Modifier 인스턴스는 출처, 수치, 시작 시점, 지속시간, 만료 시점을 독립적으로 유지한다.
- 최대 체력, 최대 스테미나, 투사체 크기처럼 CombatStatsService 바깥에서 적용되는 특수 수치 변화도 별도 Modifier 저장소를 만들지 않고 반드시 BuffService에 등록한다. 적용하는 시스템은 달라도 값의 등록, 출처, 중첩, 제거는 BuffService 한 경로를 사용한다.
- BuffService에 활성 일반 Modifier가 존재하면 별도 presentation 플래그나 효과별 렌더 코드를 요구하지 않고 StatusPresentation이 자동으로 버프/디버프 표시 후보로 취급한다. 최대 체력, 최대 스테미나, 투사체 크기처럼 특수 Modifier는 BuffService의 계산/중첩 시스템만 공유하고 점선 링 표시 대상에서는 제외한다. 점선 링은 기존 우선순위 규칙에 따라 가장 우선하는 일반 버프/디버프 또는 CC 하나만 표시한다.
- 코드 수정 중 수치 증가/감소 효과가 BuffService를 우회해 직접 필드나 배율을 변경하는 경로를 발견하면, 그것이 CC 자체 판정, 캐릭터 원본값 설정, 피해/회복/스테미나 소비 같은 일회성 자원 변화가 아닌 이상 즉시 BuffService 기반으로 통합한다.
- 모든 퍼센트형 BuffService stat은 COMBAT_BUFF_DEFS에 min/max 상한을 반드시 가진다. 여러 Modifier를 모두 합산한 뒤 ModifierLimitService가 최종 합계에 제한을 적용하며, 실제 전투 계산과 점선 링 라벨은 같은 BuffService.resolve() 제한값을 사용한다.
- 상한은 증가/감소 양쪽에 대칭으로 걸지 않는다. 문제가 생기는 방향만 제한한다. 예를 들어 공격속도는 빨라지는 방향만 +90%에서 제한하고 느려지는 방향에는 디자인 상한을 두지 않는다. 단, 실제 계산에서 배율이 0 이하가 되어 역전되는 수학적 오류만 내부 안전값으로 방지한다. 최대 체력/최대 스테미나는 감소 방향만 -90%에서 제한하고 증가는 제한하지 않는다. 100%를 넘어도 결과가 더 이상 달라지지 않는 방향만 정확히 100%에서 제한한다.
- 새로운 일반/특수 퍼센트 Modifier stat을 추가할 때는 같은 패치에서 min/max 제한값도 반드시 정의한다. flat 수치처럼 퍼센트 상한 개념이 맞지 않는 경우에만 limitMode:'flat'을 명시한다.
- 이 규칙은 둔화, 속박, 기절, 빙결 등 CC에는 적용하지 않는다. CC는 공통 CC 시스템의 별도 중첩 규칙을 따른다.

6. 절대 어떤 상황에서도 하드코딩을 금지한다.
- 특정 캐릭터, 공격, 스킬, 증강만을 위한 이름 기반 예외 처리를 금지한다.
- 동일 규칙은 데이터, 태그, 모듈, 이벤트, Query 또는 공통 시스템으로 구현한다.
- 기존 시스템으로 표현할 수 없는 기능이면 캐릭터 전용 예외 코드 대신 재사용 가능한 시스템이나 모듈을 추가한다.

7. 모든 전투 개체는 동일한 Entity 시스템을 사용한다.
- 플레이어, 봇, 소환수, 더미, 분신 등 모든 전투 개체는 동일한 기본 Entity 구조를 사용한다.
- 피해, 회복, 버프, 디버프, CC, 넉백, 충돌, 타겟팅, 팀 판정은 대상 종류마다 별도 경로를 만들지 않는다.
- 개체 종류 차이는 Entity의 구성요소, 태그, 소유 관계 또는 데이터 차이로 표현한다.

8. 피해 계산 파이프라인은 단 하나만 존재한다.
- 평타, 스킬, 반격, 지속 피해, 투사체, 히트스캔, 범위 공격, 설치물, 소환수, 증강 피해 모두 하나의 공통 피해 파이프라인을 거친다.
- 어떤 코드도 HP를 직접 감소시키지 않는다.
- 피해량 계산, 주는 피해 증감, 받는 피해 증감, 방어, 크리티컬, 증강, 최종 피해, HP 반영, 피격 이벤트의 순서는 중앙 시스템에서 정의한다.

9. CC는 버프와 분리된 하나의 공통 CC 시스템을 사용한다.
- 둔화, 속박, 기절, 빙결 등 모든 CC는 공통 CC 시스템을 이용한다.
- 버프 시스템과 책임과 경로를 분리한다.
- 동일 종류 CC가 여러 개면 현재 활성 효과 중 가장 긴 남은 지속시간을 적용한다.
- 짧은 CC 인스턴스를 삭제하지 않는다.
- 모든 CC 인스턴스는 시작 시점, 지속시간, 남은 시간, 출처를 독립적으로 유지한다.
- 동일 출처의 같은 상태를 새 적용으로 교체·갱신해야 하는 효과는 범용 stackMode:'replace-source' 옵션을 사용한다. 특정 상태 이름으로 예외 처리하지 않는다.

10. 증강은 특별한 제한이 없으면 소유 플레이어와 그 플레이어의 소환수 모두에게 적용한다.
- 소환수에게 증강을 복사하거나 캐릭터별 예외를 만들지 않는다.
- Entity 소유 관계를 통해 실질적인 소유자를 조회한다.
- 플레이어 전용 또는 소환수 전용 제한은 증강 데이터나 태그 조건으로 명시한다.

11. 모든 스킬은 새로운 시스템이 아니라면 기존 범용 모듈을 조립해서 구현한다.
- 하나의 스킬을 하나의 거대한 전용 함수로 만들지 않는다.
- 입력, 방향, 거리 제한, 미리보기, 렌더, 발사, 이동, 충돌, 공격 발생 등 책임을 가능한 한 작게 쪼갠 범용 모듈로 구성한다.
- 새로운 동작이 필요하면 캐릭터 전용 코드가 아니라 재사용 가능한 새 모듈을 만든다.
- 새 모듈도 가능한 한 작은 책임 단위로 쪼개 활용도를 높인다.

12. 핫픽스와 덮어쓰기 방식을 절대 금지한다.
- 기존 잘못된 코드를 남겨두고 파일 하단에서 덮어쓰지 않는다.
- 동일 함수 재선언, 런타임 함수 교체, 중복 이벤트 처리, 임시 fallback, Observer를 이용한 사후 수정 방식으로 문제를 숨기지 않는다.
- 실제 원인을 찾아 원본 시스템을 수정하고 필요 없어진 기존 경로는 제거한다.
- 하나의 기능에는 하나의 정식 구현만 존재해야 한다.

13. 범용 시스템은 캐릭터 이름을 알지 못해야 한다.
- 전투, 피해, 버프, CC, 투사체, 히트 판정, 증강, Entity 등 범용 시스템에서 특정 캐릭터 이름이나 ID에 따라 동작을 바꾸지 않는다.
- 범용 시스템이 이해하는 것은 Entity, Attack, Ability, Tag, Status, Modifier, Projectile, Field, Module, Owner 등의 일반 개념뿐이다.
- 캐릭터 차이는 데이터, 태그, 모듈 구성과 설정값으로 표현한다.

14. 모든 공격 피해는 캐릭터의 Base Damage를 기준으로 한 비율로 정의한다.
- 모든 캐릭터는 하나의 Base Damage를 가진다.
- 각 공격은 절대 피해량이 아니라 Base Damage에 대한 Damage Ratio를 가진다.
- 일반적인 평타는 기본적으로 100%를 사용한다.
- 평타 피해가 기준이 되기 어려운 캐릭터도 공통 피해 체계 참여를 위해 Base Damage를 가진다.
- 실제 피해의 단일 원본은 Base Damage × Damage Ratio이며 이후 공통 피해 파이프라인에서 보정한다.
- 같은 실제 피해 수치를 여러 곳에 중복 저장하지 않는다.

15. 네트워크 코드를 게임 로직에 직접 섞지 않는다.
- 캐릭터 스킬, 공격, 피해, 이동, 상태 효과 내부에서 네트워크 전용 판정을 수행하지 않는다.
- 로컬용과 원격용 게임 로직을 따로 만들지 않는다.
- 입력 또는 네트워크 명령은 공통 Command로 Simulation에 전달한다.
- Simulation이 상태를 변경하고 Event를 발생시키며 네트워크 계층은 Command/State/Event의 송수신과 동기화만 담당한다.
- 오프라인, 훈련장, 온라인은 가능한 한 같은 게임 로직을 사용한다.

16. Duels 3.0은 반드시 단일 HTML 파일로 유지한다.
- 외부 JS/CSS 파일로 게임 코드를 분리하지 않는다.
- 단일 파일 내부에서도 시스템별 영역과 책임을 명확하게 구획한다.
- 단일 파일 조건은 모듈화 금지를 의미하지 않는다.

17. 직접 지정 태그와 자동 파생 태그를 명확히 구분한다.
- 실제 데이터나 모듈 구성으로 확실히 판단 가능한 공격/효과 태그는 자동 파생한다.
- 사거리 값이 있으면 사거리 태그를 수동 입력하지 않는다.
- Projectile 모듈 사용으로 투사체 여부를 알 수 있으면 투사체 태그를 중복 입력하지 않는다.
- 수치 Modifier의 양수/음수는 각각 `증강 버프`/`증강 디버프`로 자동 파생한다.
- 상태 부여, 자원 회복, 피해 감소, 넉백처럼 모듈 구성으로 알 수 있는 효과 성질도 가능한 한 자동 파생한다.
- 크리티컬, 반격, 연계 마지막 타격 등 의도를 명시해야 하는 의미적 특성만 명시 태그로 둘 수 있다.
- 자동 파생 태그와 명시 태그는 하나의 통합 Tag Query 인터페이스로 조회한다.

18. 실제 공격 하나하나는 각각 독립적인 AttackSpec으로 취급한다.
- 입력, Ability, 실제 공격을 같은 개체로 취급하지 않는다.
- 하나의 입력이나 스킬에서 여러 공격이 발생하면 각 공격은 독립 AttackSpec을 가진다.
- AttackSpec은 Damage Ratio, 실제 사거리, 태그, 판정 정보, 모듈 구성을 포함한다.
- 키의 연속 평타 각 타격, 미아루키의 근거리/원거리 평타처럼 실제 공격 성질이 다르면 각각 독립 AttackSpec을 사용한다.
- Ability는 어떤 조건에서 어떤 AttackSpec이나 모듈 조합을 실행할지 결정하고 AttackSpec은 실제 한 번의 공격 성질을 정의한다.

19. 모든 캐릭터와 범용 시스템은 팀전, FFA 등 추가 멀티플레이 모드를 고려해 설계한다.
- 현재 1대1 방에서는 방장이 준비 상태를 갖지 않고 게임 시작을 관리한다. 참가자가 준비 완료했고 두 플레이어의 teamId가 서로 다를 때 방장의 `room.start-request` Trigger가 캐릭터 선택으로 진입시킨다. 방장 혼자서는 시작할 수 없다. 팀 판정은 Room/Relation 공통 teamId만 사용한다.
- 모든 `.char-card[data-id]` 우클릭은 `CharacterCardInteractionService` 하나의 이벤트 위임 경로만 사용하며 화면별 우클릭 핸들러를 만들지 않는다.
- 캐릭터 카드의 레코드 상세는 모든 화면에서 동일한 absolute overlay 레이아웃을 사용하고 카드의 기본 콘텐츠를 숨긴다. 카드 하단 레코드는 1행 `레코드 / 등급`, 2행 우측 정렬 점수의 고정 2줄 구조를 사용하며 카드 밖으로 넘치지 않는다.
- 기본 캐릭터 카드에는 레코드 텍스트를 표시하지 않는다. 레코드 등급/점수는 우클릭 통계 상세에서만 `레코드 / 등급` + 다음 줄 점수 구조로 표시한다.
- 프로필 메인 캐릭터 저장 중에는 특정 캐릭터 카드만 가리지 않고 프로필 캐릭터 선택 영역 전체를 검은 반투명 오버레이로 덮고 중앙에 `적용중`을 표시한다.
- 캐릭터 선택/시작 증강/라운드 사이 선택 화면의 캐릭터·증강 선택지는 `SelectionEntranceAnimationService`를 통해 프로필 캐릭터 선택지와 같은 순차 등장 애니메이션을 사용한다. 재사용된 DOM에서도 애니메이션이 확실히 재생되도록 강제 reflow 대신 Web Animations API를 사용한다.
- 게임 중 증강 인벤토리 변경은 `OnlineAugmentInventorySyncService`로 즉시 동기화하고 양쪽 좌상단 HUD를 다시 렌더한다.
- 브라우저 blur/visibilitychange/pagehide 또는 게임 UI 탭·버튼 클릭 시 `GameInputResetService`로 키보드/포인터 홀드 상태를 전부 해제한다.
- 회피는 `EntityDodgeService` 하나가 로컬/원격 엔티티 모두의 상태·이동·이펙트 사건을 생성한다. 자연 체력 회복의 무행동 판정은 `NaturalHealthRegenActivityService`가 관리하며 피해·공격·일반 이동·회피 등 플레이 행동은 회복 대기시간을 갱신한다. 정밀 이동만 `precisionMovement:true` 예외로 자연 회복을 막지 않는다. 온라인 회피는 `duel-action:dodge`로 재생한다.
- 반격 선딜 방향은 로컬/원격 모두 `CounterModuleService.trackAim` 규칙을 공유한다. 원격은 자기 타이머로 공격을 확정하지 않고, 소유자가 실제 발동 순간 전송한 `duel-counter-resolve`의 최종 각도로 `CounterModuleService.finish`를 실행한다. 차징 반격은 같은 패킷의 `resolvedCharge`에 최종 사거리·spread·투사체 속도를 함께 보내 피격 권위 클라이언트도 동일한 AttackSpec으로 실행한다. 선딜 중 방향은 `duel-state.counterWindupAngle`로 계속 동기화한다. 공격 선딜 범위/미리보기는 별도 명시가 없는 한 항상 해당 공격 소유자 본인 화면에서만 렌더한다.
- 좌상단 증강 HUD는 세션 시작 때만 그리지 않고 현재 캐릭터/증강 목록의 런타임 시그니처와 `augment-inventory-changed` 사건을 통해 즉시 갱신한다.
- 소유자에서만 발생하는 월드 프레젠테이션 사건(저스트 회피·증강 발동 이펙트 등)은 `OnlinePresentationSyncService`로 상대 화면에 동일한 Presentation 메서드를 재생한다. 화면 흔들림/FOV처럼 관전자 시점에 종속되는 화면 효과는 월드 이펙트와 분리한다.
- 온라인 사망 K.O. 연출은 일반 `entity-defeated` 예측 이벤트에서 즉시 재생하지 않는다. 실제 소유 플레이어의 사망 보고를 P1이 roundToken 기준으로 확정한 `duel-death-confirmed`에서만 재생한다. 사망 위치가 현재 카메라 안에 있을 때만 실제 월드 위치/방향으로 레이저·발사 이펙트를 그리고, 화면 밖이면 사운드와 화면 흔들림만 재생한다. `duel-state.alive=false`는 원격 표시 상태일 뿐 사망 판정 트리거로 사용하지 않고, 소유자의 명시적 `duel-round-death`만 authoritative 사망 입력으로 사용한다.
- 실제 적 처치 보상은 authoritative `duel-death-confirmed`에서만 발동한다. 네트워크 `sourcePid`는 패킷 발신자 예약 필드이므로 사망 원인 공격자는 반드시 `killerPid`로 별도 운반한다. 피해자 소유 클라이언트가 마지막 실제 공격자를 `killerPid`로 사망 보고하고, 호스트는 이를 roundToken 기준으로 확정해 모든 참가자에게 같은 `duel-death-confirmed`를 중계한다. 탈주/연결 종료의 silent death는 처치로 계산하지 않는다. 유효한 처치마다 처치자 체력은 `min(maxHealth, health + maxHealth*0.3)`, 스테미나는 `maxStamina`로 직접 갱신한다.
- 온라인 방 수명주기: 참가자 연결 종료와 호스트 연결 종료를 전체 페이지 초기화로 처리하지 않는다. 참가자 이탈은 `RoomMatchLifecycleService`가 단일 처리하고, 현재 라운드에서는 탈락으로만 반영한 뒤 다음 라운드 경계에서 실제 참가자 목록과 모드를 재계산한다. 연결된 실제 참가자가 1명 이하가 되면 매치를 중도 종료하고 같은 방 생성 화면으로 복귀한다.
- 호스트 승계: 호스트 연결이 종료되면 기존 호스트를 제외한 연결 순서가 가장 빠른 멤버부터 같은 4자리 방 코드를 인계받는 후보가 된다. 새 호스트는 기존 PID/프로필/점수/증강/라운드 상태를 유지하고 나머지 클라이언트는 자신의 기존 PID로 재연결한다. 호스트가 나가기 버튼으로 정상 종료한 경우에도 다른 플레이어가 남아 있으면 `room-closed`를 보내지 않고 동일한 승계 경로를 사용한다.
- 게임 중 이탈 계정/게스트의 식별자는 `blockedRejoinKeys`에 남겨 기존 전투 참가자 권한 복귀만 막는다. 같은 사용자가 다시 방에 접속하는 것은 허용하되 새 spectator 멤버로만 등록하고, 관전 버튼을 눌러야 실제 관전 상태가 된다. 호스트 승계를 위한 migration 재연결만 기존 sessionKey+PID가 일치할 때 기존 PID를 복원한다.
- 관전 상태는 `member.spectator`(현재 매치 비참가자)와 `member.spectating`(실제로 관전 진입 완료)을 분리한다. 점수판 관전자 수는 `spectating===true`만 센다. 중도 입장/재입장만으로는 전투 프레젠테이션 화면으로 자동 전환하지 않고, 반드시 관전 버튼 요청을 host가 승인한 뒤에만 `spectating=true`와 spectator phase packet을 적용한다. 관전 카메라 중심 좌표 자체를 실제 카메라 이동 가능 범위로 clamp해 경계 밖 내부 이동량이 누적되지 않게 한다.
- 채팅은 기존 Duels의 Enter 열기/최근 메시지 플로팅/기록 패널/Escape 닫기 구조를 공통 `OnlineChatService`로 유지하며, 3~4인과 관전자에서도 동일한 브로드캐스트 경로를 사용한다. 타이핑 상태는 PID별로 관리하고 비정상 종료 시 자동 만료한다.

- DOT/상태 피해처럼 대상 소유 클라이언트에서만 계산되는 피해/사망의 월드 이펙트도 `OnlinePresentationSyncService`로 복제한다. 직접 공격은 양쪽에서 동일 공격 실행을 재생하므로 중복 복제하지 않는다.
- 정상 매치 종료 후에는 리매치/처음으로 선택 화면을 만들지 않고 기존 방의 초기 상태로 복귀한다. 두 참가자의 준비 상태와 매치 런타임은 초기화한다. 이때 `GameHudVisibilityService.hideAll()`로 전투/증강/점수/결과/채팅/훈련장 HUD를 전부 숨긴다.
- 온라인 매치 진행 중 상대 플레이어가 0명이 되면 방 복귀가 아니라 전체 페이지 reload를 실행해 새로고침과 동일한 완전 초기화 후 메인 화면으로 복귀한다.
- 온라인 매치 진행 도중 새 연결이 들어오면 현재 매치 참가자 목록에는 추가하지 않고 spectator로 등록한다. 해당 사용자는 방 화면의 `관전` 버튼으로 현재 authoritative round-start 상태를 받아 기존 온라인 Entity/네트워크 재생 경로를 그대로 관전하며 WASD로 spectator 카메라를 이동한다.
- 캐릭터 선택 화면은 기존 Duels와 같이 `scr-select` 하나에서 PvP용 `confirm-pvp-wrap`(랜덤/선택 완료)과 훈련장용 `confirm-training-wrap`(훈련장 입장/뒤로)을 분리해 사용한다. 온라인 준비 완료 후에는 좌클릭 캐릭터 변경만 잠그고 카드 hover/우클릭 정보는 유지한다.
- 1대1은 캐릭터 선택 → 시작 증강 선택 → 라운드 시작 → 사망 판정 → 라운드 결과 → 라운드 사이 캐릭터 변경/패배자 증강 선택 → 다음 라운드 흐름을 사용한다. 최종 승수 도달 시 결과 화면으로 전환하며 게임 중 임의 나가기 버튼은 두지 않는다. 결과 화면에서만 리매치/처음으로를 제공한다.
- 온라인 점수와 라운드 종료 판정은 현재 호스트 권한 보유자 단일 권한으로 처리하고 roundToken으로 중복/지연 결과를 차단한다. 방 설정은 총 판 수가 아니라 요구 승리 수(1~8)를 직접 저장한다. 시작 증강/라운드 준비 완료 후 대기시간은 2명 4초, 3명 6초, 4명 8초다. 사망은 80ms 동시 사망 유예 후 P1이 한 번만 확정한다. 라운드 승자 확정 즉시 남은 승자는 다음 라운드까지 무적 처리한다.
- 모든 온라인 모드의 라운드 결과는 게임 세션을 즉시 정지하거나 전체 화면을 검게 전환하지 않는다. 기존 월드 위에 약한 암전과 라운드 결과 문구만 표시하며 다음 준비 화면으로 넘어가기 전까지 이동·조작 권한과 네트워크 상태 동기화를 유지한다.
- 1대1 첫 라운드와 각 다음 라운드의 전투 맵은 P1이 플레이 가능한 맵 중 하나를 무작위 선택해 authoritative round-start 데이터로 공유한다. 라운드 사이 상대 증강 선택은 상대가 먼저 준비해도 숨기고, 양쪽 준비 완료 후에만 상대가 실제 선택한 증강 결과를 공개한다.
- 맵은 기존 Duels의 타일맵 생성기와 목록을 단일 기준으로 사용한다. 설계는 80×56 세부 격자를 사용하되 실제 월드 블록은 기존 크기인 40×28(블록당 50×50)로 정렬한다. 벽 충돌체는 실제 블록 경계에 정확히 맞추고 블록 단위를 벗어난 임의 크기 벽을 만들지 않는다. FFA는 같은 50×50 블록 크기로 54×54 정사각형(2700×2700)을 사용하며 두 대각선에 대해 완전 대칭을 유지한다.
- 온라인 전투 중 디버그 조작 탭의 맵 변경은 `OnlineDebugMapSyncService`를 통해 현재 맵 ID와 실제 `DebugMapService` 적용을 양쪽 클라이언트에 동일하게 전파한다. 그 외 개발자 조작 탭의 캐릭터 변경, 증강 지급/제거, 체력·스태미나, 무한/정지/반격 플래그, CC·독, 버프/디버프, 강제 행동, 더미 추가/제거는 `OnlineDebugControlSyncService`의 `duel-debug-control` 명령 하나로 양쪽에 동기화한다.
- 온라인 FFA: 3~4인에서 정확한 2+2 두 팀 구성이 아닌 유효한 팀 분포는 FFA로 판정한다. 2대1·3대1·2+1+1도 FFA이며 같은 색 유저는 같은 teamId를 유지해 실제 아군으로 판정한다. FFA 라운드는 마지막 개인이 아니라 마지막 생존 팀 1개가 남으면 종료한다. 승리 팀의 현재 참가자가 2명 이상이면 팀원 모두 승점을 얻고 팀 색상 승리 문구를 사용하며, 승리 팀이 1명이면 기존 닉네임 승리를 사용한다. 패배 측 전원은 다음 준비에서 각자 증강 선택지를 받는다. FFA 좌상단 증강 HUD와 점수 UI는 기존 FFA 형식을 유지한다.
- FFA 레코드 정산은 개인 수가 아니라 teamId별 팀 수와 팀 최종 순위 기준이다. 팀은 마지막 구성원이 탈락한 시점에 순위가 확정되며 같은 팀 구성원은 항상 같은 placement를 받는다. 4팀전은 1등만 승리, 4등만 패배이며 2·3등은 승리도 패배도 아닌 중립이다. 3팀전은 1등만 승리, 3등만 패배이며 2등은 중립이다. 중립 결과는 플레이 횟수만 증가하고 승/패 통계와 레코드 점수는 변하지 않는다. 2:1:1처럼 4명이더라도 3팀이면 3팀전 규칙을 사용한다.
- 불균형 팀 구성의 승리팀은 FFA 1등의 팀수 배수를 사용하지 않고 불균형 승리 배율을 우선한다. 다인 팀이 1인 팀을 이기면 2대1은 1/2, 3대1은 1/3이며 1인 팀이 2인/3인 팀을 이기면 각각 1.5/2배다. 정확한 2대2 TEAM은 승리점수×3, 패배점수×1이다. 플레티넘 이상 일반 패배 점수 차감은 없다.
- 매치 참가자 중 동일 계정 또는 동일 기기가 단 한 쌍이라도 있으면 해당 매치의 모든 참가자는 레코드 점수를 얻지 못한다. 각 클라이언트는 localPid 쌍만 보지 않고 전체 matchPids의 계정/기기 식별자를 검사한다.
- 매치 진행 중 직접 방을 나가면 동일 계정/동일 기기 매치가 아닌 경우 현재 사용 캐릭터 레코드를 차감한다. 없음~골드는 고정 -50, 다이아 이상은 현재 티어 패배값 절대치의 2배를 음수로 적용하며 패배값이 0이면 -50이다. 기존 티어 하한선은 유지한다.
- 성능 규칙: 매 프레임/고주기 경로에서는 고정 배열·트리거·타입 목록을 새로 만들지 않는다. 프로필/캐릭터 카드 정적 카탈로그도 캐시하고, 프레임 렌더용 증강 게이지 배열·Set·상태 객체는 풀링해 재사용한다. HUD는 사건 기반으로 갱신하고, 33ms 위치 동기화와 전체 상태/버프 재동기화 주기를 분리한다. 동일 네트워크 패킷을 여러 Peer에 방송할 때는 연결마다 다시 직렬화하지 않고 `NetworkPayloadCodec.transport()` 결과 하나를 재사용한다. reliable DataChannel의 bufferedAmount가 128KiB를 넘은 경우 대체 가능한 `duel-state`만 폐기하고 사건성 패킷은 그대로 보존한다.
- 구조 규칙: 후처리용 `<style>` 블록을 추가하지 않고 `#duels3-styles` 단일 스타일 소스의 실제 규칙 위치를 수정한다.
- 전역 이벤트 규칙: 동일 브라우저 이벤트를 기능별로 중복 등록하거나 `window.__...Bound` 플래그로 막지 않는다. resize처럼 공통 이벤트는 조정 서비스 하나에서 분기한다.
- 고주기 UI 규칙: tooltip pointermove와 디버그 실시간 갱신처럼 화면 상태에 종속된 작업은 해당 UI가 열려 있을 때만 등록/실행하며, 100ms 갱신을 위해 60fps rAF 루프를 돌리지 않는다.
- 4자리 방 번호가 PeerJS에서 이미 사용 중이면 사용자에게 재생성을 요구하지 않고 `RoomService.openHostPeer()`가 아직 시도하지 않은 다른 번호로 자동 재시도한다.
- 라운드 준비에서 양쪽 준비 완료 후에는 선택 UI를 숨기고 시작 증강 결과 화면처럼 양쪽의 확정 캐릭터 카드와 상대가 획득한 증강 결과를 함께 표시한다.
- 증강은 현재 공유 증강 단일 풀만 사용한다. 캐릭터 전용 증강 시스템은 만들지 않는다.
- PeerJS로 전송하는 시간값에는 Infinity/NaN을 직접 넣지 않는다. 무한 지속 시간은 `remaining:0 + infinite:true` 형식으로 직렬화하고, 수신 시에만 다시 Infinity로 복원한다.
- 1대1 전투 상태 스냅샷은 소유자 기준으로 sequence를 검증하며, 위치/체력/스테미나뿐 아니라 CC·버프 잔여시간을 원격 미러에 동기화한다. 원격 미러 DOT는 표시/판정 상태만 유지하고 피해는 중복 계산하지 않는다. 능력 입력 패킷도 actionSequence로 중복/역순 실행을 차단한다.
- 새 1대1 매치/리매치의 캐릭터 선택 진입은 host의 duel-select를 단일 authoritative 경계로 사용하고 양쪽 모두 이전 선택/증강/점수/라운드 토큰/카운트다운 상태를 초기화한다. 네트워크 사망 패킷의 roundToken은 0/누락을 현재 토큰으로 보정하지 않는다.
- 온라인 세션에서 훈련장 전용 설정, DPS, 무한 자원, 훈련 봇 UI를 재사용하지 않는다. 원격 좌표는 첫 상태만 즉시 적용하고 이후에는 보간하며 월드 렌더와 미니맵이 같은 원격 Entity를 사용한다.
- 1대1 전용 판정을 범용 전투 코드에 넣지 않는다.
- 팀, 적대 관계, 소유 관계, 타겟 가능 여부는 캐릭터 이름이나 게임 모드 이름을 검사하지 않고 공통 관계 판정 시스템으로 처리한다.
- FFA와 TEAM 모두 Room의 공통 teamId를 그대로 사용한다. 모드와 무관하게 같은 teamId는 아군, 다른 teamId는 적이며, 차이는 맵·스폰·UI·라운드 구성 규칙으로만 표현한다.
- 플레이어, 봇, 소환수, 더미 등 모든 Entity는 같은 관계 판정 규칙을 사용한다.

20. 새로운 기능이나 수정 후에는 렉 유발 가능성을 점검한다.
- 매 프레임 불필요한 배열, 객체, DOM 노드, 타이머를 생성하는 구조를 피한다.
- 반복 탐색과 전체 목록 복사를 피하고 가능한 한 기존 데이터와 직접 순회를 사용한다.
- 동일 기능을 더 가볍게 구현할 수 있다면 더 효율적인 방식을 우선한다.
- 중간점검 3.223: CC 표시는 실제 `entity.statuses`에 존재하는 타입만 순회하고 Entity별/프레임별 캐시를 재사용한다.
- 중간점검 3.223: 버프 월드 표시는 Entity별 배열/항목 pool을 재사용하고 미니맵 겹침 판정은 임시 플레이어 배열을 만들지 않는다.
- 중간점검 3.223: 미사용 타일맵 상수/난수 함수/동일 구현 미사용 pair helper와 후속 CSS에 완전히 덮이는 중복 선언을 제거한다.
- 렉을 유발할 가능성이 있던 구현을 더 효율적인 방식으로 변경했다면 패치 보고에서 이를 명시한다.

21. 모듈은 사용자가 모듈만으로 캐릭터를 제작할 수 있는 수준의 독립적인 제작 단위로 설계한다.
- 모듈은 단순한 내부 함수 분리나 특정 스킬용 헬퍼가 아니다.
- 사용자가 제공된 모듈들의 세부 파라미터를 직접 조정하고 조합하는 것만으로 새로운 캐릭터와 스킬을 설계할 수 있어야 한다.
- 모듈은 캐릭터 이름, 스킬 이름, 특정 입력키를 알지 못한다.
- 입력, 조준, 드래그, 홀드, 차징, 지연, 반복, 조건, 자원 소모, 공격 생성, 투사체 이동, 산탄 패턴, 히트스캔, 범위 판정, 이동, 넉백, 돌진, 상태 부여, 소환, 필드 생성, 미리보기, 렌더 이벤트처럼 가능한 한 작은 책임 단위로 나눈다.
- 각 모듈은 필요한 수치와 옵션을 파라미터로 받아 재사용 가능해야 한다.
- 서로 비슷한 기능을 별도 모듈로 복제하지 않고 범용 모듈의 파라미터 차이로 표현할 수 있는지 먼저 확인한다.
- 기존 모듈 조합으로 구현 가능한 기능이면 새로운 모듈을 추가하지 않는다.
- 새 모듈이 필요하면 특정 캐릭터 전용이 아니라 다른 캐릭터에서도 조합 가능한 수준으로 일반화한다.
- 조건부 능력과 증강은 공통 Trigger 모듈을 사용한다. Trigger는 이벤트와 조건만 검사하며 효과 자체를 알지 못한다.
- Trigger 모듈은 증강 전용이 아니며 캐릭터 능력, 공격, 패시브 등 모든 조건부 기능에서 동일하게 재사용한다.
- Trigger는 `event`와 `conditions`를 파라미터로 받아 조건 충족 시 뒤에 연결된 범용 효과 모듈 체인을 즉시 실행한다.
- 사망 직전, 피해 받음, 피해 적중, 공격 태그 조건, 쿨다운 준비 등은 캐릭터/증강별 전용 분기 대신 Trigger의 이벤트와 조건으로 표현한다.

22. 캐릭터, 스킬, 증강을 구현한 뒤 사용한 모듈을 반드시 구체적으로 설명한다.
- 모듈 이름만 나열하지 않는다.
- 각 모듈이 무슨 기능을 담당하는지 설명한다.
- 각 모듈에서 어떤 파라미터를 조절할 수 있는지 설명한다.
- 해당 캐릭터나 스킬에서 실제로 어떤 값으로 사용했는지 설명한다.
- 왜 그 모듈을 사용했는지 설명한다.
- 비슷한 역할의 기존 모듈이 있다면 같이 언급하고, 왜 사용하지 않았는지 설명한다.

23. 모든 반격기는 공통 반격 모듈을 사용한다.
- 모든 반격기는 기본적으로 0.3초의 선딜레이를 가진다.
- 반격 모듈은 선딜레이와 적중 시 부여할 CC 모듈을 파라미터로 가진다.
- 반격에는 최소 하나의 CC가 필요하다.
- CC의 종류는 제한하지 않는다. 게임 내에 존재하는 어떤 상태이상이든 반격의 CC로 사용할 수 있다.
- 넉백도 CC로 인정하며, 다른 상태이상이 존재하면 넉백은 필수 요소가 아니다.
- 반격의 선딜레이와 CC 부여는 캐릭터 이름을 검사하지 않고 공통 반격 모듈에서 처리한다.

24. 항시 지속 효과를 제외한 모든 게임플레이 효과는 공통 Trigger 모듈을 통해 시작한다.
- Trigger는 증강 전용이 아니라 캐릭터 능력, 입력, 공격, 적중, 피격, 사망 직전, 쿨다운, 상태 변화, 자원 조건, 거리 조건 등 게임 전체의 조건부 실행에 사용하는 표준 진입점이다.
- Trigger는 event와 conditions를 파라미터로 받고, 조건이 모두 충족되면 연결된 modules를 즉시 실행한다.
- 좌클릭/우클릭/반격 입력처럼 사소한 사용 조건도 Trigger 데이터로 표현한다.
- 평타 여부, 직접 적중 여부, 쿨다운 준비, 특정 상태 보유, 자원 충분 여부, 사망 예정 여부처럼 게임플레이 의미가 있는 조건을 개별 시스템의 이름 기반 if문으로 흩어놓지 않는다.
- 단, 좌표 유효성, 0 나눗셈 방지, 배열 범위 검사처럼 게임플레이 조건이 아닌 내부 안전 검사는 Trigger로 만들지 않는다.
- 항시 적용되는 Modifier, 상시 렌더 데이터, 상시 파생 태그처럼 기다리는 조건 없이 계속 존재하는 효과만 Trigger를 거치지 않는다.
- Trigger 자체는 효과의 정체를 알지 못하며 캐릭터/증강/스킬 이름을 검사하지 않는다.
- 새로운 Trigger 이벤트나 조건 감지 방식을 추가할 때는 실제 구현과 같은 패치에서 아래 'Trigger 사용 가능 목록'도 반드시 갱신한다. 목록에 없는 감지 방식을 암묵적으로 추가하지 않는다.
- 캐릭터, 증강, 능력을 새로 만들기 전에는 반드시 아래 목록을 먼저 확인하고 기존 Trigger 이벤트/조건 조합으로 표현 가능한지 검토한다.
- 이후 어떤 코드 수정 중이든 게임플레이 의미가 있는 조건부 실행이 Trigger를 거치지 않는 것을 발견하면 요청 범위와 직접 관련이 없더라도 즉시 공통 Trigger 구조로 교정한다. 새 기능을 추가하면서 기존 직접 조건 분기보다 Trigger로 표현하는 편이 더 일관되고 재사용 가능하면 같은 패치에서 Trigger로 구현하거나 변환한다. 단, 내부 안전 검사와 순수 수학/자료구조 검사는 예외로 한다.

24-A. Trigger 사용 가능 목록
[EVENT: Trigger가 언제 평가되는지]
- input.press : 일반 입력 누름. input.slot 조건과 조합해 LMB/RMB/COUNTER 등 특정 입력을 구분한다.
- input.release : 일반 입력을 뗄 때 평가한다. 홀드 후 릴리스 발동처럼 입력 종료 시점이 실제 행동 조건인 능력에 사용한다.
- input.dodge : 회피 입력 시 평가한다.
- input.hold-repeat : 누르고 있는 입력의 반복 실행 시점을 평가한다. 일반 공격 쿨다운/Ability 대기 조건과 조합한다.
- damage-dealt : 실제 피해가 확정되어 공격자가 피해를 입힌 뒤 평가한다. 적중 후 효과, 흡혈, 독, 스턴샷 등에 사용한다.
- damage-received : 실제 피해가 확정되어 대상이 피해를 받은 뒤 평가한다. 피격 반응, 버서커, 쿨다운 초기화 등에 사용한다.
- before-damage-received : 최종 피해를 체력에 반영하기 직전에 평가한다. 피해 감소/무효화처럼 들어오는 피해를 수정해야 하는 효과에 사용한다.
- before-defeat : 체력이 0 이하가 된 뒤 사망을 확정하기 직전에 평가한다. 사망 방지, 부활 직전 효과 등에 사용한다.
- time.update : 시간 경과를 검사해야 하는 상태에서 평가한다. 선딜 종료, 예약 실행 등에 사용한다.
- bot.attack : 훈련장 봇이 공격을 시도할 때 평가한다.
- attack.hit : 공격 판정이 실제 대상에 적중했을 때 평가한다. 투사체/범위 공격의 공통 적중 진입점이다.
- entity.respawn : 사망 Entity의 리스폰 시점을 평가한다.
- resource.changed : 체력/스테미나 등 Entity 자원 값이 실제로 변한 직후 평가한다. 조건부 지속 Modifier의 활성/해제에도 사용한다.
- ability.module : Ability 내부 모듈 체인에서 앞 모듈 처리 결과에 따라 다음 모듈을 조건부 실행할 때 평가한다.
- room.changed : 멀티플레이 방의 멤버/팀/준비 상태가 변했을 때 평가한다. 매치 포맷 진입 조건에 사용한다.
- room.start-request : 방장이 게임 시작 버튼을 눌렀을 때 평가한다. 인원/참가자 준비/팀 조건을 모두 만족해야 캐릭터 선택으로 진입한다.

[CONDITION: Trigger가 무엇을 검사하는지]
- input.slot { slot } : 현재 입력 슬롯이 지정 슬롯인지 검사. 현재 lmb, rmb, counter 사용.
- entity.alive : 실행 주체가 살아있는지 검사.
- entity.dead : 실행 주체가 사망 상태인지 검사.
- health.ratio-lte { value } : 현재 체력 비율이 지정 값 이하인지 검사. 라스트 댄스 같은 조건부 지속 효과에도 같은 판정기를 사용한다.
- health.ratio-gte { value } : 현재 체력 비율이 지정 값 이상인지 검사.
- health.ratio-lt { value } : 현재 체력 비율이 지정 값 미만인지 검사.
- health.ratio-gt { value } : 현재 체력 비율이 지정 값 초과인지 검사.
- combat.can-act : 기절/빙결 등 현재 전투 상태상 행동 가능한지 검사.
- combat.can-dodge : 현재 전투 상태상 회피 가능한지 검사.
- ability.pending-ready : 해당 Ability의 선딜/대기 상태가 끝났는지 검사.
- counter.ready : 공통 반격 준비 시간이 남아 있는지 검사.
- cooldowns.ready { attackIds[] } : 지정 Attack들의 일반 공격 쿨다운이 모두 준비됐는지 검사.
- cooldown.ready { cooldownId, shareExecution? } : 증강/효과의 공통 Cooldown이 최대 충전인지 검사.
- time.ready { at, sourceProperty? } : 지정 시각에 도달했는지 검사. sourceProperty를 주면 실행 주체의 해당 시각 속성을 직접 읽는다.
- impact.direct : DOT가 아닌 직접 적중/직접 피해인지 검사.
- attack.tag { tag } : 현재 AttackSpec이 지정 태그를 가지고 있는지 검사. 평타/투사체/넉백 등 실제 공격 성질 조건에 사용.
- resource.gte { resource, value } : 현재 자원이 지정 값 이상인지 검사. health/stamina 등 Entity 수치에 사용.
- state.exists { stateKey } : actionState에 지정 상태가 존재하는지 검사.
- state.absent { stateKey } : actionState에 지정 상태가 존재하지 않는지 검사.
- state.phase { stateKey, phase } : 지정 actionState가 특정 phase인지 검사.
- state.progress-gte { stateKey, value, strict? } : 범용 진행도 상태의 현재 값을 임계값과 비교한다. 기본은 이상(>=), strict:true면 초과(>)로 검사한다. 적중 스택, 무기 충전률, 콤보 단계처럼 수치형 actionState 조건에 사용한다.
- summon.available { stateKey } : 지정 소환수가 파괴 복구 대기 중이 아닐 때 참이다. 소환수가 현재 활성/비활성인지는 구분하지 않고 파괴 쿨다운만 검사한다.
- source.property.truthy { property } : 실행 주체의 범용 속성이 참인지 검사.
- source.property.falsy { property } : 실행 주체의 범용 속성이 거짓인지 검사.
- context.truthy { key } : 현재 Trigger context의 값이 참인지 검사.
- context.falsy { key } : 현재 Trigger context의 값이 거짓인지 검사.
- context.exists { key } : 현재 Trigger context에 지정 값이 null/undefined가 아닌지 검사.
- source.property.lte { property, value } : 실행 주체의 숫자 속성이 지정 값 이하인지 검사.
- source.property.gte { property, value } : 실행 주체의 숫자 속성이 지정 값 이상인지 검사.
- usage.available { limit } : 해당 효과의 사용 횟수가 제한 미만인지 검사. 생명당 1회 같은 제한에 사용.
- room.members-count { value } : 현재 방의 참가 인원이 정확히 지정 값인지 검사한다.
- room.all-ready : 현재 방의 모든 참가자가 준비 완료인지 검사한다.
- room.teams-distinct : 현재 방 참가자들의 team 식별자가 서로 모두 다른지 검사한다. 개별 팀 분포 검사에 사용할 수 있다.
- room.match-format-valid : 현재 참가자/팀 구성이 `MatchModeService`의 DUEL/TEAM/FFA 중 하나로 유효한지 검사한다. 2명은 서로 다른 팀이면 DUEL, 정확한 2명+2명 두 팀 구성만 TEAM, 그 외 3~4인은 팀 색이 2개 이상 존재하면 FFA.
- room.non-host-ready : 방장을 제외한 모든 참가자가 준비 완료인지 검사한다. 방장은 준비 상태를 갖지 않고 게임 시작을 관리한다.
- buff.source-absent { stat, key } : 해당 증강/효과가 지정 stat에 같은 source key의 버프/디버프를 아직 등록하지 않았는지 검사. 쿨다운 완료 후 준비 버프를 한 번만 부여하는 경우 등에 사용.

[목록 관리 규칙]
- 위 EVENT/CONDITION 이름은 실제 코드의 event/type 문자열과 반드시 완전히 동일하게 유지한다.
- 새 조건이 기존 파라미터 확장으로 표현 가능하면 새 CONDITION을 만들지 않고 기존 CONDITION을 확장한다.
- 캐릭터 이름, 증강 이름, 스킬 이름을 조건 타입으로 추가하지 않는다.
- 조건은 '누가 만든 기능인가'가 아니라 입력, 상태, 태그, 자원, 시간, 거리, 쿨다운처럼 재사용 가능한 게임 상태를 검사해야 한다.


- 모든 **자기 이동기**는 `movement.move` 모듈과 `MovementAbilityService` 하나만 사용한다. `control` 기본값은 `fixed`, 필요할 때만 `input`을 사용한다. 이동 수치는 `speed`(units/sec), `duration`(ms), `distance` 중 정확히 두 값만 입력하고 나머지 하나는 공통 계산한다. 목표 지점/투사체를 향하는 이동은 런타임에 계산된 목표 거리를 `distance` 입력으로 간주한다. 일반 `movement.move`의 기본 충돌 정책은 `passWalls:true`, `passEnemies:false`이며, 벽에 막혀야 하는 이동만 `collision.passWalls:false`를 명시한다. `movement.knockback`은 적중 대상 CC 전용, Space 회피는 회피 시스템 전용 저수준 이동으로 분리한다. 벽 통과 이동 종료 후 필요한 경우 `resolveEmbedded()`로 실제 비충돌 위치에 복귀한다.
- `movement.move` 모듈에 `이동기` 태그가 있으면 `MovementAbilityService.start()`가 공통 `dash-line` 이동 흔적을 자동 생성한다. 개별 이동기는 색/두께/알파/지속시간만 `presentation`으로 덮어쓸 수 있고, `이동기`가 아닌 자가 넉백은 자동 흔적 대상이 아니다.
- 라운드 생존 판정은 `_deadPids`만 보지 않고 참가 Entity의 `alive`와 `health`도 함께 검사한다. 호스트 승계/탈주 직후에도 즉시 같은 생존자 평가를 실행한다.
- 준비 완료 플레이어는 본인이 팀을 바꿀 수 없지만 호스트는 준비 상태를 해제하지 않고 강제로 팀을 변경할 수 있다. 호스트가 다른 플레이어 팀을 강제 변경하면 이전 팀 색→새 팀 색 그라데이션의 전투 토스트를 **변경된 플레이어 화면에만** 표시한다.
- 온라인 2대2 팀전: 정확히 4명의 참가자가 두 팀에 2명씩 배치된 경우에만 `MatchModeService.TEAM`으로 판정한다. 팀전 맵은 기존 1대1 40×28(2000×1400)의 10:7 비율을 유지한 50×35(2500×1750) 50px 타일맵이며 기존 40개 전투 맵 각각에 대응하는 팀전 맵을 생성한다. 같은 팀 두 명은 좌/우 진영에 가까이 모여 스폰한다. 한 팀의 현재 참가자가 모두 사망하면 상대 팀이 라운드 승리하며 패배 팀의 현재 참가자 전원에게 다음 준비 증강 선택지를 제공한다. 팀전 중 한 팀원이 탈주하면 현재 라운드는 TEAM 판정을 유지하고 다음 라운드 경계에서 남은 3인을 FFA로 재평가한다. 같은 팀 두 명이 모두 탈주해 해당 팀에 연결된 플레이어가 0명이 되면 매치를 즉시 종료한다. TEAM 승리 문구는 `빨강 승리!`처럼 승리한 RoomTeams 색상 이름과 실제 팀 색을 사용한다. 승점은 팀원 둘에게 동일하게 기록하며 중앙 점수판은 두 팀의 공유 승점을 한 줄로 표시한다.
- 방의 `게임 시작` 버튼 활성화와 실제 `requestGameStart()` 실행 가능 여부는 `RoomService.matchEntryTrigger()` 하나를 동일하게 사용한다. UI에서 별도의 인원/준비/팀 분포 조건을 중복 구현하지 않는다. 따라서 DUEL/TEAM/FFA 판정 변경은 `MatchModeService`와 Trigger에만 반영하면 버튼 상태에도 즉시 동일하게 적용된다.
- 진행 중인 매치에서 실제 연결 게임 플레이어(`connected=true`, `departed=false`, `spectator=false`)가 1명 이하가 되는 순간은 호스트/비호스트/호스트 승계 여부와 관계없이 즉시 매치 종료 조건이다. `RoomMatchLifecycleService.abortIfInsufficient()` 하나가 이를 판정하며, 호스트는 authoritative `abortMatchToRoom()`으로 모든 연결자에게 종료를 전파하고 비호스트는 `abortLocalMatchToRoom()`으로 즉시 로컬 매치 상태/HUD/타이머를 정리해 방 화면으로 복귀한다. `duel-member-left` 수신과 기존 호스트 이탈로 시작되는 migration도 같은 조건을 즉시 검사한다.
- TEAM 맵 대칭 규칙: 10:7 직사각형 비율을 유지한 정규화 좌표에서 **양방향 대각선 대칭**을 모두 적용한다. 주대각선은 `(u,v)->(v,u)`, 반대 대각선은 `(u,v)->(1-v,1-u)`이며 두 변환을 같은 타일 equivalence component에 묶는다. 따라서 모든 TEAM 맵은 두 대각선에 대해 동시에 대칭이고, 두 대칭의 합성인 180도 회전 대칭도 자동 성립한다. 스폰 안전구역 역시 component 단위로 비워 대칭을 깨지 않는다.
- 캐릭터 선택 아군 미리보기: 온라인 선택 화면에서 카드 클릭은 확정 준비와 별개의 `duel-character-preview` 상태를 전송한다. 호스트는 같은 teamId의 현재 참가자에게만 해당 상태를 중계하며 적 팀에는 전송하지 않는다. 같은 팀의 미리선택 카드는 팀 색상 윤곽/글로우로 표시하고 카드 우하단에 해당 플레이어 닉네임 배지를 표시한다. 실제 확정 선택은 기존 `duel-character-ready` / `duel-character-state` 경로를 그대로 사용한다.
- 매치 승리 종료 연출: `duel-round-result`의 기존 승리 문구를 3초 유지한 뒤 호스트가 `duel-match-ending` 프레젠테이션 패킷을 전송한다. 모든 플레이어는 같은 `round-result-overlay`에 `매치 종료`를 2초 표시하고, 그 후 호스트가 기존 `finishMatchToRoom()` / `duel-return-room` 경로로 방 화면에 복귀시킨다. 각 클라이언트가 독립적으로 방 복귀 타이머를 만들지 않고 authoritative host만 최종 복귀를 실행한다.
- 캐릭터 선택 아군 미리보기는 항상 `RoomService.localPid`를 제외하고 렌더한다. 본인 클릭 선택은 기존 `.sel` 선택 표시만 사용하며, 팀 색상 `team-preview-selected`와 우하단 닉네임 배지는 다른 아군의 현재 클릭 선택에만 표시한다.
- 캐릭터 선택 아군 미리보기는 최초 캐릭터 선택(`select`)과 라운드 준비의 캐릭터 변경(`between`)에서 동일한 `duel-character-preview` 상태와 `renderCharacterPreviews()` 렌더 경로를 사용한다. 라운드 준비에서 캐릭터 카드를 클릭하면 같은 팀 아군에게 팀 색상 강조와 우하단 닉네임 배지가 즉시 표시되고, 같은 카드를 다시 눌러 변경 선택을 취소하면 preview도 즉시 제거된다. 본인 선택은 두 화면 모두 기존 `.sel`만 표시하고 아군 미리보기 스타일에서는 제외한다.
- 라운드 준비 아군 증강 미리보기: `duel-augment-preview`는 확정 `duel-between-ready`와 분리된 클릭 상태이며, 호스트가 같은 teamId 아군에게만 중계한다. 다른 아군이 고른 증강 카드는 팀 색상 윤곽/글로우와 우하단 닉네임 배지로 표시하며 본인 증강은 기존 `.sel`만 표시한다. 적 팀에는 미리보기 패킷을 보내지 않는다.
- 게스트 캐릭터 카드 레코드 스타일: 게스트는 mastery 스타일을 제거하지 않고 항상 레코드 0점의 `none` 티어를 사용한다. 따라서 일반 계정의 0점 캐릭터 카드와 외곽선/글로우가 완전히 동일하다.
- 온라인 팀 색상 체력바: 온라인 플레이어의 월드 체력바와 하단 HUD 체력바는 RoomTeams의 teamId 색을 `TeamColorPresentationService` 하나로 사용한다. 훈련장 대상은 기존 표시를 유지한다.
- 온라인 이름 가독성: 월드 플레이어 이름은 12px bold, 검은 4px 외곽선, 팀 색 본문으로 표시한다.
- FFA 스폰 배정: 좌표 집합은 기존 정다각형 스폰을 유지하고 host가 매 라운드 `spawnOrder`만 무작위화해 round-start에 넣는다. 모든 클라이언트와 중도 관전자는 동일한 authoritative spawnOrder를 사용한다.
- 방 프로필 카드: 우클릭 base/stats/records 모드를 PID별로 보존해 room-state 재렌더에도 유지한다. 팀 버튼은 34px hit area + pointerdown 입력을 사용하고 비호스트는 클릭 직후 로컬 표시를 갱신한 뒤 host broadcast로 최종 확정한다.
- 좌상단 전투 HUD는 input shield를 사용해 아이콘 pointer/click이 월드 공격 입력으로 전달되지 않는다.
- 라운드 준비 캐릭터 변경은 `betweenSelections`에만 저장하고 카운트다운 종료 직전 다음 라운드 시작 경계에서만 `duelSelections`에 확정 반영한다. 준비 중 좌상단 HUD는 이전 캐릭터를 유지한다.
- 온라인 전투 동기화: state 전송은 25ms, state/action에 sender timestamp 및 action source 좌표를 포함한다. 렌더 보간 좌표와 충돌 좌표를 분리하고 충돌은 최신 state를 짧게 extrapolation한 `netCollisionX/Y`를 사용한다. 원격 action은 발동자의 실제 source 좌표로 교정하고, 원격 투사체는 추정 transport delay만큼 최대 4.5 frame 초기 진행을 보정한다. 기존 DamagePipeline/AttackModule onHit 흐름은 유지해 넉백·상태이상·증강 효과의 판정 경로를 분기시키지 않는다.
- 상태 링 텍스트는 점선 링보다 시각적 우선도가 낮도록 10px로 표시하고 다중 상태 간 세로 간격도 13px로 축소한다.
- 시작 증강 선택의 캐릭터 카드는 `card._recordAccountData`로 해당 PID의 실제 Room profile snapshot을 소유하며, 캐릭터 통계/레코드 상세은 로컬 AccountState가 아니라 그 소유자 프로필의 `characterStats`/`characterRecords`를 읽는다. PlayerProfileService.snapshot은 온라인 공유용 캐릭터별 plays/wins/losses를 포함한다.
- 온라인 월드 이름 본문 색은 팀 색으로 변경하지 않고 기존 고정 밝은 색 `#f4f7fb`를 유지한다. 아군 위치 표시는 별도 반투명 팀색 점선으로 로컬 플레이어 위치와 살아있는 아군 플레이어 위치를 연결해 표현한다.
- 좌상단 증강/캐릭터 HUD는 `game-wrapper` 바깥 DOM이므로 단순 버블링에 의존하지 않는다. `mousedown`을 기존 `PointerHoldInputService.slot()/press()` 경로에 직접 연결해 좌/우 클릭 시 일반 월드 클릭과 동일한 공격 입력을 발생시키며, UI pointer-events는 유지하고 contextmenu 기본 메뉴만 막는다.
- 모든 ProjectileService 탄환 본체는 기존 형상/채움/윤곽 디자인을 유지한 채 주황색 `rgba(255,135,35,.92)` 외곽 glow(shadowBlur 9)를 공통 적용한다. 투사체에 연결된 보조 링크 선은 글로우 대상이 아니다.
- DOT 틱 규칙: burn은 0.5초, poison/bleed는 기본 1초 단위로 피해를 주며 지속시간 끝 시점의 정수 틱을 포함한다. 예: 1초 화염은 0.5초와 1초에 각 1회, 2초 독은 1초와 2초에 각 1회. freeze는 1초마다 활성 틱을 주며 자연 만료/정화/소스 제거 등 어떤 방식으로 풀릴 때까지 실제 freeze DOT 피해를 한 번도 받지 못했다면 해제 순간 정상 freeze DOT 1회를 보장한다.
- 관전 카메라는 WASD 자유 이동에 더해 wheel로 0.65~1.8배 줌, 좌클릭한 살아있는 플레이어 추적, 우클릭 추적 해제를 지원한다. 추적은 기존 Online Entity를 직접 camera focus로 사용하고 별도 관전 복제 객체를 만들지 않는다.
- 처치 보상은 기존 30% 체력/스테미나 전량 회복과 함께 `regenDelay -100%` 버프를 700ms 부여하며 같은 BuffService/CombatStatsService 경로를 사용한다.
- 온라인 저스트 회피 성공 여부는 회피 대상의 소유 클라이언트만 `JustDodgeService.confirm()`할 수 있다. 성공 시 `duel-just-dodge-confirmed`를 전송하고, 다른 화면에서 해당 원격 플레이어의 회피 중 예측 적용했던 피해가 있으면 그 피해를 즉시 롤백한다. 원격 미러는 자체 충돌 계산으로 회피 성공을 확정하지 않는다.
- 모든 실제 피해는 종류와 전달 방식에 관계없이 저스트 회피 대상이다. 투사체/범위/지속 선분처럼 공간 형상이 있는 공격은 기존 형상 기반 저스트 회피를 우선 사용하고, `DamagePipeline`까지 도달하는 모든 피해 시도는 공통 `JustDodgeService.confirmDamageAttempt()`를 거친다. 따라서 burn/poison/bleed/freeze 등의 상태 피해, 메후구 로프 같은 지속 필드 피해, 이후 추가되는 비공간 피해도 별도 예외 없이 저스트 회피할 수 있다.
- 온라인 미니맵의 모든 플레이어 점은 캐릭터 고유색이 아니라 `RoomTeams`의 실제 팀 색을 사용한다.
- 아군 연결 점선은 로컬 플레이어와 `teamId`가 완전히 같은 살아있는 플레이어를 직접 연결하며 팀 색, dash `[6,6]`, alpha .46, lineWidth 2를 사용한다.
- 모든 탄환 본체 주황 글로우는 `rgba(255,128,24,1)`, shadowBlur 17로 강화한다.
- 관전 플레이어 추적은 마우스 위치를 검사하지 않는다. 관전 중 좌클릭할 때마다 `RoomService.matchPids()` 순서의 살아있는 플레이어를 순환하며 추적하고, 우클릭은 `followPid`를 비워 자유 관전으로 복귀한다. 사망 안내의 `~에게 죽었습니다!` 아래에는 자유 관전일 때 `좌클릭으로 플레이어 관전`, 플레이어 추적 중일 때 `우클릭으로 자유 관전`을 표시한다.
- 처치 보상의 `regenDelay -100%`는 자연회복 idle을 0으로 만드는 의미이므로 버프 부여 직후 `nextHealthRegenAt`을 현재 시각으로 맞추고 `HealthRegenService.update()`를 즉시 1회 실행해 일반 자연회복이 idle 종료 순간 첫 틱을 주는 것과 동일하게 즉시 회복을 시작한다.
- 아군 연결 점선은 기존 팀 색상/두께/dash를 유지하되 alpha를 .46에서 .28로 낮춘다.
- DOT 만료 보존 규칙: `CCService.live()`는 상태 end에 도달했더라도 `tickAtEnd=true`이고 `nextTick<=end`인 마지막 틱이 아직 소비되지 않았다면 상태를 삭제하지 않는다. 따라서 상태/스탯/UI 조회가 `CCService.update()`보다 먼저 실행되어도 2초 DOT의 2초 틱이 사라지지 않는다.
- 온라인 직접 피격 권위: 원격 대상에 대한 공격자 화면의 기하 충돌은 `NetworkHitAuthorityService.prediction()`으로만 처리하며 체력/CC/DOT/넉백/onHit을 확정하지 않는다. `effectsOnly` 공격도 같은 권위 규칙을 사용한다. 실제 대상 소유 클라이언트에서 동일 공격이 자기 로컬 캐릭터와 충돌했을 때만 `DamagePipeline`과 `AttackModuleService.onHit`을 실행한다. 직접 공격 피해가 적용되면 피격자 클라이언트가 `duel-hit-confirmed`를 전송해 공격자에게 적중 사실을 통보한다. DOT/상태 피해는 이미 대상 소유 클라이언트에서만 틱하므로 별도 hit-confirmed를 보내지 않는다. 공격자 화면만 맞았다고 판단하고 피격자 화면이 맞지 않았다면 확인 패킷이 없으며 실제 피해는 처음부터 적용되지 않는다.
- 온라인 `damage-dealt` 증강은 피격자 권위 클라이언트의 원격 공격자 복제본에서 소비하지 않는다. 피격자는 피해를 확정해 `duel-hit-confirmed`만 보내고, 실제 공격자 소유 클라이언트가 동일 `AttackExecution.sequence`를 복원해 `damage-dealt` 트리거를 실행한다. 따라서 증강 쿨다운/사용횟수/흡혈/공격자 자원처럼 소유자 상태를 바꾸는 효과는 실제 소유 Entity에만 반영된다.
- 온라인 원격 대상의 CC는 공격자 화면의 원격 Entity `statuses` Map에 예측 기록하지 않는다. 상태 Map은 대상 권위 `duel-state` combatSnapshot만 갱신하며, 공격자 측은 `duel-status-apply` 요청만 전송한다. 따라서 장판형 반복 CC가 예측 추가와 authoritative snapshot 교체 사이에서 삭제/재생성되어 점선 링이 깜빡이는 현상이 없다.
- 온라인 combatSnapshot은 기본 150ms baseline을 유지하고, CC/Buff가 실제로 추가·갱신·제거된 Entity만 `combatSnapshotDirty`로 표시해 다음 25ms 상태 패킷에 즉시 포함한다. 짧은 장판 CC도 변경 사건 직후 동기화되며, CC가 존재한다는 이유만으로 전체 combatSnapshot을 50ms 주기로 계속 보내지 않는다.
- `modifier.set`은 `duration`을 지원하며 미지정 시 기존처럼 Infinity다. 공격방어는 `damage-dealt` 확정 후 defense +30%를 2000ms 갱신한다.
- 월드 상태 표시는 CC와 버프를 분리한다. CC는 현재 살아 있는 상태 중 presentation 적용 시각이 가장 최근인 하나만 문자+점선 링으로 표시하며, 그 상태가 끝나면 다음으로 최근인 활성 CC가 자동 표시된다.
- `field.area`가 부여하는 CC의 presentation 적용 시각은 반복 trigger 시각이 아니라 대상이 해당 field instance에 진입한 시각이다. 이탈 후 재진입하면 새 진입 시각으로 갱신한다.
- 장판형 CC의 점선링 최근성은 상태 duration/start 갱신과 분리한다. `presentationAppliedAt`/`presentationStartedAt`은 최초 진입 시각으로 고정하고, 장판 내부 반복 refresh는 기계적 CC 지속시간만 갱신한다. 이탈 후 재진입할 때만 점선링 최근성이 새로 갱신된다.
- CC 점선링 최근성은 대상 권위 클라이언트의 `presentationOrder`를 단일 기준으로 사용한다. 원격 sender의 `performance.now()`/순번은 서로 비교할 수 없으므로 `duel-status-apply` 수신 시 제거하고 대상 권위에서 다시 부여한다. `replace-source`/`refresh-type`의 지속 갱신은 최초 표시 순번을 보존한다. `CCService`와 상태 적용 서비스의 순번 생성기도 하나로 통합하고, 상태 변경 revision으로 같은 프레임의 StatusPresentation 캐시까지 즉시 무효화한다.
- 버프는 캐릭터 외곽 점선 링을 사용하지 않는다. 평상시 캐릭터 왼쪽에는 DMG/DEF/SPD/REGEN의 +/- 축약만 표시하고, TAB을 누르는 동안 활성 BuffService modifier 전체를 수치 포함 세로 목록으로 표시한다.
- TAB은 개발자 패널 단축키가 아니다. 개발자 권한 계정은 백틱(`Backquote`)을 눌러 기존 DebugPanel을 연다.
- DebugPanel의 버프 토큰 스타일은 `BuffStatusPresentation.styles`를 단일 기준으로 사용한다. 상태 표시 분리 후 제거된 `StatusPresentation.buffs`를 참조하지 않는다.
- DebugPanel 버프 토큰/편집기 이름은 월드 축약명과 분리해 `COMBAT_BUFF_DEFS.label`을 사용한다. 따라서 regenFlat/regenPercent/regeneration은 각각 `초당 체력 회복 · 고정` / `초당 체력 회복 · 퍼센트` / `재생`으로 구분된다.
- 월드 버프 축약 표시는 13px/16px line-height, TAB 상세 표시는 11px/15px line-height를 사용한다.
- 공유 증강 15~21번은 `공격방어`, `범위 증폭`, `힐링`, `가벼운 걸음`, `런 앤 건`, `배속`, `치유회피` 순서다.
- `범위 증폭`은 히트스캔 공격에만 적용한다. 장당 범위 +25%, 피해 -10%를 합연산하며 무기 투사체 크기 증가는 없다.
- 증강 에픽 등급 내부 ID는 `epic`만 사용하며 구형 별칭은 두지 않는다.
- 런 앤 건의 이동속도 +100%는 `modifier.set perStack:true`로 중첩 수만큼 합산한다.
- `attackAdjustments`는 `augmentCache.counts`의 고유 ID별 stackCount를 한 번만 합산하고 최종 배율을 한 번 적용한다.
- 히트스캔 범위 증가는 delivery.area/delivery.hitscan의 판정 크기에 적용한다. 반복형 delivery.area의 중심 시작거리/간격은 공격 배치 거리이므로 범위 증폭으로 변경하지 않는다.
- projectile.impact 보조 AttackSpec과 projectile.return 귀환 AttackSpec도 `AugmentService.prepareAttack()`을 거친다.
- 온라인 개발자 증강 변경은 대상 소유자가 실제 inventory를 수정하고 `duel-augment-inventory` 하나를 canonical 복제 경로로 사용한다.
- `movement.move replaceActive:true`는 기존 자기 이동기를 취소하고 새 이동으로 교체한다. 리안 RMB는 방패대시 중 백업 이동을 위해 이 범용 옵션을 사용한다.
- 이동 종속 swept damage는 `requireMovementExecution:true`로 발동한 이동의 executionSequence에 결합할 수 있다. 같은 stateKey의 다른 이동으로 replace되어도 이전 이동의 피해 판정은 이어지지 않는다.
- `MovementAbilityService.state()`는 로컬 Entity에서는 actionState를 사용하고, 온라인 원격 Entity에서는 소유자가 `duel-state`로 보낸 `_remoteMovementEffectState`를 우선한다. 원격 `duel-action` 재생이 만든 보조 actionState가 권위 movement execution을 덮어쓰지 않으므로 이동 실행번호 종속 피해 판정이 양쪽 화면에서 동일하다.
- `ability-used`는 공격을 직접 발사하지 않는 성공한 스킬 능력도 공통 증강 Trigger에 전달한다. 런 앤 건은 이 사건과 AttackSpec의 `스킬` 태그를 사용한다.
- `ability-used`의 스킬 판정은 base AttackSpec 하나만 보지 않고 실제 성공한 Ability module의 의미 태그와 실제 resolved AttackSpec 태그를 `usageTags`로 합친다. 따라서 평타 입력에 조건부 스킬 이동이 섞인 루뷰 RMB→LMB도 실제 실행된 `movement.move`의 `스킬/이동기` 태그를 기준으로 런 앤 건이 발동한다.
- 루뷰 RMB→LMB는 망치까지 접근하는 본 이동만 `스킬/이동기`이며, 사거리 끝 추가 이동은 `motionMode:'knockback'` 자가 넉백 followup이라 의미 태그를 상속하지 않는다. RMB→RMB도 `스킬/귀환`만 가지며 자가 넉백에는 `이동기` 태그를 부여하지 않는다.
- 홀드 평타 연사는 `PointerHoldInputService`의 공통 규칙 하나만 사용한다. `input:'lmb'`이면서 실제 AttackSpec에 `평타` 태그가 있으면 기본적으로 쿨다운마다 반복하고, 차징/홀드형처럼 연사를 막아야 하는 평타만 `inputPolicy.repeatWhileHeld:false`로 명시한다. 캐릭터별 `repeatWhileHeld:true`/`repeatMode:'cooldown'` 중복 선언은 두지 않는다. RMB/스킬은 자동 홀드 연사 대상이 아니다.
- 타우 평타의 `state.progress`는 `when:'on-hit'`를 대상별로 처리한다. 한 번의 평타가 여러 적을 맞히면 실제 적중 확정된 적 수만큼 스파크가 각각 +1되고 최대 3에서 포화된다. 차징 평타 선택은 공격 실행 전에 현재 게이지를 검사하므로, 같은 일반 평타가 여러 명을 맞혀 그 순간 최대 충전이 되어도 그 공격 자체가 차징 평타로 바뀌지 않고 다음 평타부터 차징 평타가 된다.
- `field.area.rangeRef.type='impact-attack-range'`는 projectile.impact가 준비한 보조 AttackSpec의 실제 delivery.area 범위를 설치 장판 범위와 프레젠테이션 반경에 재사용한다.
- 범위 증폭는 별도 Effect type을 사용하지 않는다. augment의 `attackAdjustments` 데이터와 기존 `TagService`/`AttackQueryService`를 사용한다. 표시 설명에는 히트스캔 범위 +25%와 피해량 -10%만 적고, 숨겨진 효과로 `무기 투사체` 태그 공격의 실제 projectile radius와 weapon-projectile presentation radius를 +25% 적용한다.
- 런 앤 건은 기존 `attack-fired` GameEvent를 증강 Trigger로 전달하고 `attack.tag:'스킬'` 조건 + `modifier.set speed +100% / 200ms`만 사용한다.
- 치유 회피는 기존 `just-dodge` GameEvent에서만 발동하며 `resource.restore resource:'health', maxResourceRatio:.10`으로 최대 체력의 10%를 회복한다. 일반 회피는 회복하지 않으며 회피 거리 -15%를 함께 적용한다.
- `cooldown.consume oncePerExecution:true`는 같은 AttackExecution의 다중 타격이 `shareExecution:true`로 준비 상태를 공유하더라도 쿨다운 시작 시각은 한 번만 소비한다. 스턴샷은 한 번의 다중 평타 실행에서 준비 효과를 공유하되 4초 게이지는 최초 소비에서만 초기화한다.
- 아군 연결 점선은 팀 색상/dash `[6,6]`/lineWidth 2를 유지하되 alpha를 13%로 표시한다.
- 관전 스페이스 이동: 관전 중 Space는 전투 회피를 호출하지 않고 `spectatorDash()`를 사용한다. 현재 WASD 방향 또는 마지막 관전 이동 방향으로 기존 회피 거리 `GAME_DATA.dodge.dist`만큼 카메라를 즉시 이동시키며, 스태미나/무적/저스트 회피 같은 전투 효과는 생성하지 않는다. 자유 이동/대시는 플레이어 추적을 해제한다.
- 관전/부활 안내의 주 메시지 묶음은 화면 중앙(`50%`)보다 위, 상단과 중앙 사이인 canvas 높이 37% 지점을 기준으로 배치한다.
- 월드 상단 텍스트 레이아웃은 이름 → 상태효과 → DPS 순으로 겹치지 않게 계산한다. 이름은 `radius+30px` 위, 상태효과의 가장 아래 라벨은 `radius+48px` 위에서 13px 간격으로 위로 쌓고, DPS는 현재 가장 위 상태 라벨보다 최소 15px 더 위에 배치한다.
- 온라인 개발자 모드의 캐릭터/증강 변경은 현재 Entity만 수정하지 않고 매치 authoritative 상태에도 즉시 영속화한다. `character` 변경은 해당 PID의 `RoomService.duelSelections`를 갱신하고 라운드 준비 중 `betweenSelections`가 있으면 `characterId/resolvedCharacterId`도 같은 값으로 바꿔 countdown 종료 시 이전 선택이 되살아나지 않게 한다. `augment-acquire/remove`는 변경 직후 실제 owner의 `augments` 배열 전체를 `RoomService.matchAugments[pid]`에 복사한다. 따라서 다음 `duel-round-start` 패킷이 개발자 모드에서 변경한 캐릭터와 증강을 그대로 사용한다.
- 관전/부활 안내 묶음은 화면 높이 29%를 기준으로 표시해 기존 37%보다 더 위로 올린다.
- 관전 Space 이동은 좌표 순간이동이 아니라 `spectatorDash()`가 방향/잔여거리만 예약하고 `updateSpectatorDash(dt)`가 약 170ms 동안 기존 회피 거리만큼 빠르게 이동시킨다. 경계에 막히면 잔여 대시는 즉시 종료한다.
- 아군 연결 점선은 최대 650px 이내의 같은 teamId 아군에게만 표시한다. 180px 이내에서는 기존 최대 alpha 13%를 사용하고, 180~650px 구간에서 거리에 따라 선형으로 13%→0% 페이드되어 650px 이상에서는 완전히 표시하지 않는다.
- 일반 관전자(`onlineConfig.spectatorOnly`) 화면에도 관전 조작 안내를 표시한다. `followPid`가 없으면 `좌클릭으로 플레이어 관전`, 플레이어 추적 중이면 `우클릭으로 자유 관전`을 `관전 중` 아래에 표시하며 FFA 사망 관전과 동일한 상태 기준을 사용한다.
- 아군 연결 점선은 고정 650px이 아니라 현재 화면 크기와 관전 줌을 반영한 화면 반대각선 거리를 가시 시작점으로 사용한다. 아군이 화면에 들어오기 시작하는 거리에서는 alpha 1.5%로 아주 옅게 보이고 가까워질수록 증가해 180px 이내에서 최대 13%가 된다. 현재 화면 반대각선보다 멀면 점선을 그리지 않는다.
- 플레이어 추적 관전(`spectator.followPid` 존재) 중에는 일반 관전자/사망 관전자/훈련장 사망 관전자 모두 WASD 자유 이동과 Space 대시가 비활성화된다. 우클릭으로 추적을 해제한 후에만 WASD와 Space 자유 관전을 다시 사용할 수 있다.
- 플레이어 추적 관전 중 `spectator.followPid` 대상이 기본 1배율에서 실제로 볼 수 있는 `GAME_DATA.canvas.width × height` 화면 범위를 실제 게임 월드 위에 회색 실선 사각형으로 표시한다. 미니맵에는 이 사각형을 표시하지 않는다. 맵 가장자리에서는 실제 카메라와 동일하게 clamp한다.
- 인게임 HUD 체력바는 로컬 팀과 적 팀을 컨테이너 단위로 분리한다. `local-team-health-stack`에는 내 체력바와 같은 `teamId` 아군의 체력/스테미나 바를 좌하단에 가로로 함께 배치하고, `remote-health-stack`에는 적 플레이어만 우하단에 배치한다. 팀이 개발자 모드/동기화로 바뀌면 기존 row DOM을 재생성하지 않고 올바른 stack으로 이동시킨다.
- 미아루키는 업로드된 기존 듀얼즈 기준 수치/동작을 현재 10배 전투 수치 체계에 맞춰 이식한다. 원거리 LMB는 공구 투척(피해 200, 사거리 700, 속도 18, 반경 15), 근거리 LMB는 전방 130/halfAngle 1.309 범위 공구함 휘두르기(피해 250), 공통 비용 200/쿨다운 450. 적이 근접 부채꼴 안에 하나라도 있으면 근거리, 아니면 원거리 AttackSpec을 선택한다. RMB는 비용 250으로 현재 위치에 공구함을 설치하고 재사용 시 비용 없이 회수하며 회수 쿨다운 200. 평타 사용 후에도 공구함을 회수한다. 반격은 0.3초 선딜 뒤 자기 체력 400 회복 + 반경 300 피해 250 + 공통 넉백을 사용한다.
- 공구함은 일반 고정형 소환수 시스템 `SummonDeployService`를 사용한다. 최대 체력 1000, 이동속도 0, 회복지대 반경 275에서 250ms마다 아군 로컬 권위 대상에게 regeneration 30을 부여한다. 회수 시 현재 체력을 state에 저장하고 재배치 시 그대로 복원한다. 파괴 시 체력 0과 5초 복구 cooldown을 저장하고 소유 캐릭터 주변에 캐릭터 색상의 원형 호 게이지를 표시한다. 복구 완료 시 저장 체력이 1로 돌아오며, 비활성 상태에서도 소유자의 자연회복 policy를 사용해 최대 체력까지 회복한다. 회복 도중에도 재배치할 수 있다. 소환수는 ownerId/teamId를 플레이어와 공유해 기존 RelationService/EntitySimulationAuthorityService/피격 권위를 그대로 사용한다.
- 온라인 소환수는 별도 캐릭터 전용 패킷을 만들지 않고 `duel-state.summons`에 고정형 소환 stateKey/active/health/x/y/destroyedRemaining을 포함해 소유자 authoritative 상태를 동기화한다. 원격 ability action으로 즉시 생성·회수 연출을 재현하고 state packet이 체력/파괴/재사용 상태를 최종 보정한다. `destroyedRemaining=0`은 파괴 이력이 아니라 정상 사용 가능 상태로 저장해 원격 공구함의 현재 체력을 최대 체력으로 잘못 초기화하지 않는다.
- 캐릭터 설명의 소환수 표기는 기존 펠루나 방식과 같은 `summonSpecs`의 `[SUMMON] / HEALTH / MOVE SPEED / ABILITY` 블록을 사용한다.
- 미아루키 공구함 최대 체력은 1000. 회복지대는 직접 회복하지 않고 범용 `regeneration` 버프를 부여하며, 버프 인스턴스 자체가 250ms마다 체력 30을 회복한다. zone refresh는 nextTick을 초기화하지 않는다.
- 소환수는 기존 Duels `classicMinion` 몸체 규격(pulse 0.88±0.12, local/remote alpha 0.90/0.45, fill alpha 0.61/0.67, 2px, dash [4,3])을 사용한다. 몸체 생김새 외 피격 피드백/상태링/이름/체력바/스테미나 위치 등은 플레이어와 같은 `drawEntity` 경로를 사용한다.
- 공구함 파괴 5초 호 게이지는 기존 `legacyChargeArc` 규격인 radius+8, 3px, 12시 시작, track 없음, 캐릭터 색상, lineCap butt을 사용한다. 링 반경은 EntityRingLayoutService가 호 게이지·CC/버프·풀충전 점멸의 실제 중심 반경과 선 두께를 한 기준으로 계산하며, 반격 활성 링은 현재 표시 중인 가장 바깥 링과 일정한 간격만 유지해 동적으로 배치한다.
- AttackPreviewService는 `delivery.area shape:'circle'`을 공통 지원하며, 미아루키 반격의 0.3초 선딜에는 소유자 화면에서 반경 300 원형 점선 미리보기가 표시된다.
- `counter.execute`는 선택적으로 `charge.duration`, `charge.holdDuration`, `charge.range {from,to}`, `charge.spread {from,to}`, `charge.projectileSpeed {from,to}`를 받아 실제 홀드 시간에 따라 AttackSpec 사거리·산탄 spread·탄속을 연속 보간할 수 있다. `lockOnRelease:true`면 실제 홀드한 만큼만 충전하고, 중간에 `input.release`가 발생하면 그 시점의 충전률을 잠근 뒤 다시 충전하지 않는다. 최대 충전 뒤 `holdDuration` 동안은 100% 호와 최대충전 점멸 링을 유지한 후 자동 발사한다. 슈비 반격은 이 차징 경로를 사용하지 않고 클릭 즉시 공통 반격 선딜에 진입하며, 기존 최대 차징 결과값인 사거리 810 / spread 0.15 / 탄속 39.6을 고정 사용하고 RMB와 동일한 자체 반동 이동을 함께 실행한다. 투사체 기반 sector 미리보기는 실제 투사체와 동일하게 벽 raycast로 잘린 polygon을 사용한다.
- 공격 입력 기본 규칙: 홀드 자동 반복은 실제 AttackSpec에 `평타` 태그가 있는 공격만 허용한다. `inputPolicy.repeatWhileHeld=false`인 평타는 예외적으로 반복하지 않는다. RMB 스킬과 반격 입력은 홀드해도 자동 반복하지 않는다. 홀드형 반격은 홀드 시간만 상태로 사용하고 릴리스 Trigger 또는 반격 완료 경로에서 한 번만 발동한다.
- 소환수 공통 규칙: 소환수는 소유 플레이어와 동일한 radius를 사용하고, owner의 자연회복 policy를 상속한다. 월드 체력바는 팀 색이며 스테미나 바는 그리지 않는다. 소환수 자신이 만든 aura는 자기 자신에게 적용되지 않지만 같은 팀의 다른 플레이어/소환수에는 적용된다.
- 소환수 `attackRangePresentation`은 AI 공격 판정과 독립된 시각 사양으로, 원형 공격범위를 소환수 중심의 점선 원으로 상시 표시한다. 엘린 유령은 실제 근접 공격 사거리 110과 동일한 반경을 사용한다.
- 소환수의 피격 넉백도 일반 Entity와 동일한 `MovementService.forcedMotion`을 사용하며 `SummonDeployService`가 매 프레임 `MovementService.updateForced()`를 호출해 수명을 끝낸다. 강제이동 중에는 AI가 중단되고 종료 직후 정상 재개된다.
- 소환수 연결선: 살아있는 소환수는 소유 플레이어와 항상 `[5,6]` 연한 점선으로 연결한다. 색은 팀 색이 아니라 소유 캐릭터 고유색이며 alpha 18%. 소유자 본인과 같은 팀 아군 화면에서만 표시한다.
- 회수형 소환수의 저장 체력: active=false, health>0, 파괴 cooldown 없음 상태는 소유 캐릭터의 월드 HP바 바로 아래에 추가 52×4 체력바로 표시하고 팀 색을 사용한다. HUD에는 표시하지 않는다.
- regeneration 표기는 tick 단위가 아니라 항상 초당 환산값으로 표시한다. 미아루키 공구함은 250ms마다 30 회복이므로 `REGEN +120/s`. 모든 실제 회복은 공통 health-restored 프레젠테이션 경로를 사용해 기존 듀얼즈 healPulse와 초록색 회복량 인디케이터를 생성하고 온라인 상대 화면에도 동기화한다.
- 소환수 combatSnapshot을 duel-state.summons에 포함해 buff/debuff/CC 상태를 원격에도 동기화한다. 따라서 소환수 상태 점선 링/텍스트는 모든 플레이어 화면에서 같은 상태를 표시한다.
- ArcGaugePresentationService는 온라인에서 기본적으로 해당 Entity 소유자 로컬 화면에서만 표시하며 `visibility:'all'`로만 예외 공개한다. 기본 색은 target.color. 배치형 소환수 파괴 cooldown 호도 owner.color를 사용하고 완료 뒤 500ms 동안 호 게이지를 최대 충전 상태(radius+8)로 유지하면서 기존 chargeArc 최대치 점멸 규격(radius+18, lineWidth2.5, dash[4,3], speed .025, alpha scale .8)의 점선 원을 함께 표시한다.
- target-authoritative 직접 피해 확인 패킷은 패킷 발신자 예약 필드 `sourcePid`와 실제 공격자 `attackerPid`를 분리하고 sourceEntityId/targetEntityId도 포함한다. 공격자 화면은 duel-hit-confirmed를 받으면 실제 target Entity(소환수 포함) 위치에 피해량 인디케이터를 생성한다. 피격 스퀴시 같은 순수 시각 피드백은 전투 확정 패킷에 섞지 않고 `duel-presentation`의 `hit-contact`로 동기화하며, 수신 즉시 동일한 `VisualFeedbackService` 렌더 상태를 적용한다.
- `delivery.area`의 shape는 공격 범위 형상이다. 원형 범위는 `공격형태 원`으로 분류하며, 이 형상 태그가 기존 폭발형 분류 역할까지 담당한다. 별도 폭발 분류 태그나 폭발 전용 impact 모듈은 사용하지 않는다. circle/sector 범위는 같은 가시영역 polygon을 미리보기·실제 판정·이펙트에 공유하고, `wallPolicy:'ignore'`가 아닌 경우 source→target 가시선도 같은 WorldGeometryService 벽 판정을 사용해 벽 뒤 대상을 적중시키지 않는다.
- projectile impact에서 파생된 `delivery.area shape:'circle'`은 `AttackExecution.projectileImpactPoint`를 기본 centerPoint로 사용한다. 따라서 판정 polygon, 자동 원형 FX, 넉백 방향이 모두 실제 착탄점을 같은 중심으로 공유한다.
- 원형 공격의 방향 기준은 공격자 Entity가 아니라 실제 `delivery.area` 중심이다. `AreaAttackService`가 만든 `impact.origin/point`와 `AttackExecution.impactOrigin/koOrigin`이 피해 방향·넉백·피격 스퀴시·K.O. 레이저에서 동일한 중심을 공유한다.
- `effect.spawn.clipToAttackArea:true`인 커스텀 공격 FX는 delivery.area의 실제 `AreaGeometryService.polygon()` snapshot을 그대로 렌더 clip mask로 사용한다. 미리보기·실제 적중·커스텀 발동 애니메이션의 벽 절단 형상은 서로 따로 계산하지 않는다.
- `area-attack-fired`의 벽 차단 범위공격은 캐릭터/이펙트 종류와 무관하게 실제 `AreaGeometryService` 절단 형상에서 벽에 의해 새로 생긴 경계선만 공통 `areaWallCutOutline` EffectSpec으로 표시한다. 원래 외곽선은 중복해서 덧그리지 않으며, rect처럼 중앙 ray로 사거리가 단축되는 범위도 실제 막힌 끝면을 같은 공통 윤곽선으로 표시한다.
- `areaWallCutOutline`은 대체 커스텀 이펙트의 일반 윤곽선과 동일한 알파를 `wallCutStrokeAlpha`로 상속할 수 있으며, 커스텀 이펙트가 최종 절단 polygon 윤곽을 직접 그리는 경우 `drawsClippedOutline:true`로 중복 절단선을 생성하지 않는다. 절단면은 일반 외곽선보다 진해지도록 중첩 렌더하지 않는다.
- 캐릭터/스킬/증강 설명에서 `x2`, `×2` 같은 배수형 횟수 표기를 사용하지 않는다. 여러 번 타격하는 공격은 개별 타격 기준이면 `타당`처럼 표기한다.
- 리안 이식으로 추가된 범용 모듈 `attack.guard`: 특정 시간/공격 형상 안에서 들어오는 적대 공격을 차단하는 방향성 방어 판정을 담당한다. 투사체는 실제 제거하고, 히트스캔·근접·폭발·이펙트 경로 공격은 공통 DamagePipeline 진입 전에 차단한다. 기존 delivery 모듈들은 공격을 전달하는 책임만 있고 일정 시간 다른 공격을 방어하는 수명 상태가 없어 분리했으며, 이후 방패·패리·공격 소거 기술이 재사용한다.
- 상태 기반 입력 재사용/대체는 별도 `action.attack-window` 모듈을 만들지 않는다. 기존 `action.attack`이 `alternateWhen` 조건을 선택적으로 받아 공통 Trigger의 `state.exists`/`state.phase` 판정으로 대체 AttackSpec을 선택하고 성공 시 해당 상태를 선택적으로 소비한다. 루뷰의 투사체 재입력도 같은 Trigger 상태 조건 판정기를 사용해 상태 기반 입력 분기의 기준을 하나로 유지한다.
- 리안 이식으로 추가된 범용 모듈 `action.attack-position-memory`: 이벤트로 저장된 과거 위치를 소비해 AttackSpec의 targetPoint로 전달한다. 기존 `movement.move`는 목표점 이동만 담당하고 과거 위치 저장/만료/스택 소비 책임이 없어서 분리했으며, 이후 귀환·되감기·체크포인트 기술이 재사용한다.
- 유이 이식으로 추가된 범용 모듈 `action.temporal-rewind`: 캐릭터의 `temporalMemory` 데이터가 지정한 간격으로 위치/자원을 원형 버퍼에 기록하고 지정 시간 전 스냅샷으로 자기 Entity를 되감는다. 기존 `PositionMemoryService`는 회피 사건 위치만 저장해 연속 시간축의 자원 상태를 복원할 수 없어 재사용만으로는 표현할 수 없었다. 이 모듈은 캐릭터 ID를 모르며 위치 되감기·체크포인트·시간 역행 기술이 재사용한다.
- `attack.guard`는 공격 종류를 개별 하드코딩하지 않는다. 방어 대상의 피격 권위 측 `DamagePipeline`에서 공격의 origin/source를 공통으로 가드 형상에 대입해 투사체·히트스캔·근접·폭발·움직이는 이펙트 공격을 동일하게 차단하며, 투사체만 실제 Projectile 객체도 제거한다.
- 리안의 `attack.guard`는 평타 AttackSpec에만 존재한다. 반격 AttackSpec은 일반 범위 공격/무력화 반격이며 방어 모듈과 파생 `방어` 태그를 가지지 않는다.
- 디버그 더미는 항상 `ownerId=id`, `teamId=id`인 독립 Entity이며 팀 변경 UI/명령을 제공하지 않는다.
- 온라인 디버그 더미는 생성한 참가자의 PID를 `simulationAuthorityPid`로 저장해 기존 target-authoritative 피해 모델 안에서 정확히 하나의 권위 클라이언트를 갖는다. owner/team 관계는 변경하지 않는다.
- 권위 플레이어의 기존 `duel-state` 25ms 스트림에 그 플레이어가 권위를 가진 디버그 더미 snapshot을 함께 싣는다. 더미 위치·충돌 위치·HP·스테미나·생존/숨김·리스폰 남은 시간을 동일한 상태 경로로 복제하며 별도 주기 타이머를 만들지 않는다.
- `duel-hit-confirmed.targetHealth`는 공격 직후 빠른 표시용이고, 더미 상태의 최종 진실은 다음 `duel-state.debugDummies` snapshot이다.
- 비플레이어 권위 Entity의 확정 피해도 `duel-hit-confirmed`가 `targetEntityId`와 권위 PID를 함께 사용하며, 더미의 확정 HP를 비권위 미러에 반영한다.
- `attack.guard`가 투사체를 방어할 때 같은 가드 인스턴스는 같은 Projectile 객체를 정확히 1회만 처리한다. `귀환` 태그가 있으면 삭제하지 않고 기존 `ProjectileStateService.beginReturn()`으로 즉시 강제 귀환시키며, 없으면 제거한다. 온라인에서는 방패 소유 클라이언트가 충돌을 확정한 뒤 `duel-projectile-guard-resolved`로 projectileKey와 remove/return 결과를 모든 화면에 일방 통보하고, 각 화면은 동일 투사체에 동일 결과만 적용한다. 캐릭터명/공격 ID로 귀환 여부를 분기하지 않는다.
- `attack.guard`는 `onBlockExtend`를 가지면 방어 성공 시 현재 남은 방어 시간에 해당 시간을 추가한다. 방어 성공 시 `visualState.effectStateKey`가 있으면 연결된 기존 `effect.spawn` 인스턴스를 제거한 뒤 동일한 `effectKey`로 색상만 변경한 같은 타입의 새 이펙트를 생성한다. 동일 key를 사용하므로 원격 화면에서도 기존 주황 이펙트가 새 시안 이펙트로 직접 교체되고 두 색이 겹치지 않는다.
- `attack.guard`의 `onBlockExtend`와 방어 성공 시각 변화는 막힌 Projectile 객체 수가 아니라 공격 실행(`AttackExecution.sequence`) 횟수 기준으로 1회 적용한다. 한 번의 산탄/다중 투사체 공격에서 여러 발을 동시에 막아도 방어 성공 1회로 계산하며, 서로 다른 공격 실행을 연속으로 막으면 실행 횟수만큼 각각 연장한다.
- 온라인 확정 피해 인디케이터는 피격자 권위의 `duel-hit-confirmed`를 모든 참가자가 수신해 동일 피해량을 표시한다. 피격자 본인 화면은 이미 로컬 `damage-applied`에서 표시했으므로 해당 화면만 네트워크 표시를 중복하지 않는다. 공격자 전용 표시 조건을 두지 않는다.
- `attack.guard`의 방어 성공 여부는 온라인에서 가드 소유자(피격 대상)의 로컬 권위 클라이언트만 판정한다. 다른 클라이언트는 자체적으로 막힘을 확정하지 않는다. 방어자는 `duel-attack-guard-resolved` 또는 투사체 전용 `duel-projectile-guard-resolved`로 결과를 통보하고, 다른 화면은 그 결과를 수신한다.
- `attack.guard`의 히트스캔 방어는 공격자 위치, 공격 중심 위치, 방패 사거리 안의 적 존재 여부를 검사하지 않는다. 해당 히트스캔이 대상에게 적중 가능한 상태라면 `AttackExecution.directionAngle`의 반대 방향을 피격자 기준 유입 방향으로 계산하고, 그 방향이 방패 `halfAngle` 안에 들어오는지만 검사한다. 따라서 사거리가 아무리 긴 히트스캔도 방패 정면에서 들어오면 막고, 가까운 적의 공격이라도 방패 뒤/옆에서 들어오면 막지 않는다.
- 훈련장 공격 봇의 체력 설정은 더미와 동일하게 `처치 가능 · 3초 후 부활 / 무적` cycle UI와 `'killable' / 'infinite'` 상태값을 사용한다. 무적 처리도 새 모듈 없이 동일한 `HealthService.setInvulnerable()` 정책을 재사용하며, 현재 봇과 이후 재생성되는 봇 모두 같은 설정을 따른다.
- 서로 다른 AttackSpec이 같은 공격 후딜을 공유해야 할 때 캐릭터/분기 모듈에서 상대 Attack ID의 cooldown을 직접 덮어쓰지 않는다. AttackSpec의 `attackDelayGroup` + `attackDelay`를 사용하며 `AttackService`가 공통 그룹 딜레이를 관리한다. 개별 `cd`는 해당 Attack 자체의 재사용 대기시간으로 유지되고, 그룹 딜레이는 그룹 내 다른 공격까지 동일 시간 동안 막는다. 리안 평타/방패 돌진은 `lian-primary` 320ms, 미아루키 근거리/원거리 평타는 `miaruky-primary` 450ms를 공유한다.
- 신규 범용 모듈 `movement.neutralize-knockback`: 일반 `movement.knockback`만으로는 넉백 이동 중 행동불능과 실제 넉백 종료 시점 이후 체력 비례 후속 행동불능을 하나의 수명으로 표현할 수 없어 추가했다. 이동 자체는 기존 `MovementService.knockback()`을 재사용하고, 종료 감지는 범용 `ForcedMotionCompletionService`를 통해 처리한다. 무력화 중에는 `neutralize` CC가 기절과 동일하게 이동/행동/회피를 막고 반격기 색상의 기존 CC 점선 링을 사용한다. 넉백 종료 후 무력화 시간은 대상 현재 HP 비율 기준 선형으로 100% HP=750ms, 0% HP=1500ms다.
- 반격기의 CC가 넉백인 경우 일반 `movement.knockback`은 허용하지 않고 `movement.neutralize-knockback`만 사용한다. `CounterModuleService.validate()`가 이 규칙을 검증하므로 이후 새 반격기도 일반 넉백을 실수로 사용할 수 없다. 반격기가 넉백 대신 기절/속박 등 다른 CC를 사용하는 경우 기존 `status.apply`는 그대로 허용한다.
- 무력화 상태의 내부 status key는 `neutralize`를 유지하지만, 사용자에게 보이는 영어 상태 표기는 항상 `KNOCKDOWN`으로 표시한다. 도움말 분류는 `버프기 / CC기`를 사용하며 기존 상태이상/디버프 항목은 모두 `CC기` 아래에 배치한다.
- 도움말의 버프기/CC기 색상 표시는 동그라미나 RGB 숫자가 아니라 실제 상태 색상으로 칠한 영문 상태명을 한국어 이름 바로 뒤에 표시한다. 무력화 넉백의 실제 상태 색상과 도움말 `KNOCKDOWN` 색상은 밝은 회색 `210,215,220`으로 고정한다.
- 도움말에는 상태/버프의 값이 스킬·증강에 따라 달라질 수 있으면 임의의 대표 수치를 적지 않는다. 공통 시스템 상수로 고정된 값만 정확히 표기한다. 현재 고정 CC 수치는 감속 50%, 감전 스테미나 회복 40% 감소, 방전 스테미나 회복 정지, 빙결 1초마다 최대 체력 5%, 화염 0.5초마다 최대 체력 4%, 출혈 1초마다 최대 체력 5% + 직접 피해 10% 증가, 무력화 종료 후 0.5~1초다.
- 도움말에서 스킬/증강에 따라 지속시간이 달라져 정확한 시간을 제시할 수 없는 상태는 `일정 시간` 같은 불필요한 표현을 붙이지 않고 효과 자체만 설명한다. 독은 `1초마다 피해를 받습니다.`, 출혈은 `1초마다 최대 체력의 5% 피해를 받습니다.`로 표기한다.
- 감전(`zap`)의 스테미나 회복 감소는 `staminaRegen` 버프와 별도 곱연산하지 않는다. 둘 다 `staminaRegenAdditive`에 가산한 뒤 최종적으로 `1 + 합계`를 한 번만 배율화한다. 기본 감전은 `0.60 - 1 = -0.40`이므로 스테미나 회복속도 +50%와 동시에 적용되면 최종 +10%다. 방전(`discharge`)은 별도로 최종 스테미나 회복을 0으로 만든다.
- 메후구 `segmentRope`의 자신/아군 화면 관계 알파는 40%를 사용한다. 투척 중 `projectileRef`가 연결된 로프는 별도 페이드 공식을 만들지 않고 `ProjectileVisualPositionService.sample()`이 반환하는 동일 `trajectory.arc` alpha를 곱한다. 따라서 투사체와 로프가 최고점으로 갈수록 함께 fade-out되고 이후 함께 fade-in되며, 메후구 RMB의 `apexAlpha:.4`를 동일하게 따른다.
- `trajectory.arc`는 메후구 전용이 아니라 모든 공중 투척형 Projectile/Entity가 재사용하는 범용 궤적 모듈이다. `height`, `screenLiftRatio`, `apexScale`, `apexAlpha`, `apexStrokeAlpha`를 조합해 최고점에서 화면상 상승·크기 축소·본체 페이드·외곽선 잔존을 표현한다. 메후구 RMB는 시범값으로 `apexScale:.84`, `apexAlpha:.4`, `apexStrokeAlpha:.62`를 사용한다. 별도 메후구 전용 공중 렌더 모듈은 만들지 않았다.
- `field.area`는 범용 설치형 범위 필드다. 메후구 로프는 두 끝점을 기준으로 `shape:'rect'`, `range=두 끝점 거리`, `halfWidth=판정 폭/2`, `angle=두 끝점 방향`인 회전 사각 장판으로 구성하며 `AreaAttackService.containsPoint()`의 기존 사각 판정을 그대로 재사용한다. 자동 태그는 `설치형`, `공격형태 사각`이다.
- 메후구 로프의 시각적인 선은 `segmentRope` 이펙트일 뿐 전투 판정이 아니다. 설치 로프의 피해/저스트 회피에서는 `closestPointOnSegment`나 `segmentsDistance` 같은 선분 충돌 계산을 사용하지 않는다. 기존 선 전용 `field.segment` 모듈은 제거하고 `field.area`로 대체한다.
- `field.area`는 `intervalMode:'global'|'per-target'`을 지원한다. `global`은 필드 인스턴스가 하나의 다음 틱 시각을 공유하고, `per-target`은 필드 인스턴스 안의 `lastTriggerAt` Map으로 대상별 마지막 발동 시각을 기억한다. 대상이 장판 밖으로 나가도 필드가 살아있는 동안 기록을 지우지 않으므로 재진입해도 interval 이전에는 다시 발동하지 않는다.
- 동일한 `field.area`가 여러 개 겹쳐도 장판 인스턴스별 타이머/대상 기록을 독립적으로 유지하며 효과는 항상 중첩 가능하다. 중첩 방지 옵션은 두지 않는다. `stateKey`는 종류 식별/정리 용도이며 서로 다른 인스턴스의 효과를 합치지 않는다.
- 메후구 로프는 `field.area + intervalMode:'per-target' + interval:0 + removeOnTrigger:true`를 사용한다. `pairWalls + maxAnchors:4`로 최대 4개 벽 앵커(완성 로프 2쌍)를 유지하며 초과 설치 시 가장 오래된 field 쌍부터 제거한다. 미아루키 공구함 회복지대는 공구함 Entity를 따라가는 원형 `field.area`, `intervalMode:'per-target'`, `interval:250`으로 처리하며 기존 `SummonDeployService.updateAura()`의 직접 거리/버프 판정은 제거한다.
- `field.area`의 global 틱은 한 틱 시각을 먼저 확정한 뒤 그 순간 범위 안의 모든 유효 대상을 처리하고, 모든 대상 처리가 끝난 뒤 한 번만 다음 global 틱을 예약한다. `triggerOnEnter:false`인 per-target 필드는 첫 진입 시각을 기록하고 interval이 지난 뒤 첫 발동한다.
- 일반 `field.area` 생성 시 같은 `stateKey`의 기존 장판을 자동 삭제하지 않는다. 같은 종류/같은 소유자의 장판도 서로 다른 instanceId를 갖고 항상 독립 중첩한다. 명시적 제거/교체가 필요한 스킬만 clear/replace를 따로 호출한다.
- `field.area.onTrigger`는 새로운 전용 효과 타입을 만들지 않고 기존 `resource.restore`, `status.apply` 모듈을 재사용한다. `status.apply`는 field instanceId를 sourceId에 포함하므로 같은 종류 장판 여러 개가 겹쳐도 각 장판의 CC가 독립적으로 적용/갱신된다. 장판 CC의 지속시간과 interval은 별개 데이터이며, 장판 위 대상에게 interval마다 기존 `CombatStatusApplicationService` 경로로 CC를 부여한다.
- 미아루키 공구함 회복지대는 `field.area` 대상별 1000ms 틱, `triggerOnEnter:false`, `resource.restore health 80`을 사용한다. 따라서 진입 즉시 회복하지 않고 범위 안에서 실제 1초가 지난 뒤 80씩, 이후 매 1초마다 80씩 회복한다.
- `field.area.onTrigger`의 버프 부여는 새 buff 전용 모듈을 만들지 않고 기존 `modifier.set` 타입을 재사용한다. `field.area`에서는 `modifier.set`을 `BuffService.refresh()`로 적용해 장판에 머무는 동안 동일 field instance source를 갱신한다. 버프의 실제 주기 효과는 각 버프 서비스가 담당하며 field.area가 직접 회복/피해를 계산하지 않는다.
- 미아루키 공구함 회복지대는 250ms마다 `regeneration` 버프를 갱신하고, 버프 값 80·`tickInterval:1000`·linger 300ms를 사용한다. 따라서 실제 체력 회복 코드는 공구함/field.area에 없고 `HealthRegenService`가 정확히 1초마다 80 회복한다.
- `field.area`의 `modifier.set`은 `removeOnExit:true`일 때 장판 내부 대상 목록을 프레임별로 비교해 범위를 벗어난 그 프레임에 해당 field instance source의 버프를 `BuffService.remove()`로 즉시 제거한다. 필드 자체가 사라질 때도 같은 출처 버프를 즉시 정리한다. 미아루키 공구함 재생에는 linger를 사용하지 않는다.
- 카메라는 플레이어 좌표에 즉시 고정하지 않고 범용 지수 보간 추적을 사용한다. WASD 이동은 `cameraFollow.wasdResponseMs`, `movement.move`/회피 중에는 `mobilityResponseMs`로 더 느리게 따라가 속도감을 만든다. 관전 카메라는 기존처럼 즉시 추적하며, 순간이동성 큰 좌표 변화는 `snapDistance` 이상이면 즉시 맞춘다.
- 화면 흔들림과 동적 FOV 설정은 boolean ON/OFF가 아니라 0~100 강도다. 기존 localStorage boolean은 100/0으로 자동 이관하고, 실제 흔들림 offset과 FOV 변화량에 설정 비율을 곱한다. 0은 완전 비활성, 100은 기존 강도다.
- 소환수 `fieldArea`가 `excludeAnchor:true`이면 해당 장판을 발생시키는 anchor summon 자신은 대상에서 제외한다. 미아루키 공구함은 소유자/아군은 재생시키되 자기 공구함 자신은 재생시키지 않는다. 공구함 범위 표시는 `summonSpec.fieldArea.shape/range`를 읽는다.
- 3.612: 펠루나 평타/반격 연출을 기존 파일 기준으로 복원했다. 평타 `annularDoubleSweep`은 기존 22프레임, 수명 알파 감소, 선단 흰색 강조선과 비클립 시각 경로를 옵션으로 재현하며 강화 시 형태는 유지하고 색만 주황색으로 변경한다. 300ms 선딜이 있는 기본/1단계 평타는 `preview.create`로 실제 annulus/circle 판정 미리보기를 표시하고, AttackPreviewAreaService가 `innerRange`를 범용 보존해 링 미리보기도 실제 판정과 일치한다. 반격은 공통 원형 FX 대신 기존 `pelunaPull`과 같은 수축 주황 링+고정 점선 외곽을 재사용 가능한 `contractingPullRing` 렌더러로 표시한다. 선딜 차징 원은 재사용 가능한 `contractingChargeCircle` 렌더러로 복원했다. 새 gameplay 모듈/캐릭터 ID 분기는 추가하지 않았다.
- 3.613: 펠루나 모루/강화 구조를 보정했다. 비강화 평타 FX는 캐릭터 색 #555555로 통일하고 강화 중에만 주황색을 사용한다. 모루 RMB 비용은 400, 파괴 복구시간은 7초이며 기존 SummonDeployService 파괴 쿨다운 게이지를 그대로 사용한다. projectile impact 재설치는 summon.spawn의 preserveHealthOnReplace 옵션으로 기존 모루 체력을 보존한다. 강화 상태는 단계 카운트가 아니라 0~15000ms의 누적 남은시간을 단일 값으로 사용해 모루 착탄 범위 안의 펠루나에게 정확히 +5000ms를 더하고, 모루 지대 안에서는 연속 감소를 정지한다. 모루 착탄 범위 넉백은 제거하고 RMB 직격 대상만 일반 on-hit 넉백을 받는다. delivery.area aimMode live-source를 지연 판정에도 적용해 선딜 300ms 동안 최신 조준 방향을 실제 공격/FX에 반영한다. circle/sector wallPolicy:block은 규칙대로 실제 area 중심→대상 중심 LOS도 검사해 미리보기뿐 아니라 피해 판정도 벽에 막힌다.
- 3.614: 펠루나 평타 실제 피해의 벽 차단은 유지하되 회전 공격 FX는 기존처럼 완전한 원형 스윕을 유지하도록 presentationWallClip을 분리했다. annulus 선딜 미리보기의 innerRange도 외곽과 같은 AreaGeometryService 벽 절단 geometry를 사용해 작은 내부 원이 벽을 관통해 보이지 않게 했다.
- 3.615: 펠루나 평타의 실제 피해는 이미 wallPolicy:block과 AreaAttackService LOS로 벽 차단되고 있었으나, 3.614에서 presentationWallClip:false로 둔 회전 스윕 FX만 벽을 관통해 보였다. 펠루나 전 단계 평타 FX도 실제 delivery.area와 동일한 AreaGeometryService polygon clip을 사용하도록 되돌려 미리보기·피해 판정·발동 FX가 같은 벽 경계를 공유한다.
- 3.616: annularDoubleSweep의 벽 clip 시 원래 스윕 stroke를 생략하고 AreaGeometry polygon 외곽선을 대신 그리던 보정 경로를 제거했다. 회전 FX는 기존 arc/annulus 도형과 선단선을 그대로 그린 뒤 wall polygon은 clip mask로만 사용해, 벽 차단은 유지하면서 기존 공격 디자인을 보존한다.
- 3.618: 펠루나 평타/강화 평타의 벽 절단 윤곽선 누락을 공통 AreaWallCutPresentationService 경로에서 수정했다. 자동 범위 FX일 때 절단선을 이미 그렸다고 잘못 판단하던 조건을 바로잡아 실제 벽에 의해 새로 생긴 경계에만 areaWallCutOutline이 표시된다. 펠루나 모루 설명에 다른 소환수와 같은 DEATH 재사용 불가 문구를 추가하고, LMB 강화 설명을 엔소냐와 같은 inlineStages의 LMB I/II/III로 분리했다. 반격기 movement.pull은 AttackModuleService.onHit에서 distanceMode:'source-contact'를 실제 접촉거리로 해석하도록 공통 수정해 기존 펠루나처럼 적중 대상을 펠루나 쪽으로 끌어온다.
- 3.619: 펠루나 annularDoubleSweep의 벽 절단 윤곽선을 별도 areaWallCutOutline FX가 아니라 원래 스윕 내부에서 같은 수명·색·알파로 그리도록 통합했다. delivery.area drawsClippedOutline으로 공통 중복 절단선을 억제한다. contractingPullRing은 clipToAttackArea polygon을 실제 렌더 마스크로 사용한다. summon.spawn은 착탄점 기준 source 거리 조건으로 spawnEffect 색과 선택적 사운드를 결정하는 범용 옵션을 지원하며, 펠루나 모루는 240 안이면 주황 원+hit 사운드, 밖이면 캐릭터색 원을 사용한다.
- 3.620: 3.618에서 추가된 자동 범위공격의 별도 벽 절단면 areaWallCutOutline 생성 경로를 3.617 이전 동작으로 복원했다. 자동 범위 FX는 다른 캐릭터들과 동일하게 실제 AreaGeometry polygon을 clip mask로만 사용하며 별도 절단선을 추가하지 않는다. 펠루나 LMB의 drawsClippedOutline/통합 wallCutSegments도 제거해 annularDoubleSweep 원본 디자인을 그대로 벽에 clip만 한다.
- 3.621: 펠루나 LMB 0~3단계의 annularDoubleSweep를 delivery.area 자동 렌더 경로에서 제거하고, 레이카/하츠하츠/엘린 등 다른 annularDoubleSweep 공격과 동일한 effect.spawn + clipToAttackArea + replaceAutoAreaEffect 경로로 통일했다. 벽 절단 윤곽선도 펠루나 전용 보정 없이 기존 공통 AreaWallCutPresentationService가 처리한다.
- 3.622: 펠루나 지연 평타의 커스텀 effect.spawn이 delivery.area.delay보다 먼저 실행되던 문제를 수정했다. effect.spawn의 범용 delayWithDelivery 옵션은 같은 AttackSpec의 delivery.area 지연 시점에 맞춰 FX를 실행하고 live-source 조준이면 실행 순간의 최신 조준각을 다시 읽는다. progress 단계 경계는 state.progress-gt 조건을 추가해 5000ms 정확히는 I, 10000ms 정확히는 II로 처리하여 시간형 3칸 게이지와 실제 LMB 단계 선택을 일치시켰다.
- 3.623: 3.622에서 불필요하게 추가한 state.progress-gt와 effect.spawn.delayWithDelivery를 제거했다. 기존 state.progress-gte에 strict 비교 옵션만 두고 펠루나의 5000/10000ms 경계는 단순 초과(>)로 판정한다. 펠루나 LMB FX는 다시 delivery.area의 자동 annularDoubleSweep로 통합해 delay가 실제 판정/FX에 하나의 타이밍 진실값이 되게 했다. annularDoubleSweep은 clip polygon이 있을 때 별도 wall-cut 효과 없이 해당 polygon 자체를 같은 stroke로 마감해 일반 areaCircle처럼 자연스러운 벽 절단 윤곽을 만든다.
- 3.617: projectile.impact 보조 AttackSpec이 delivery.area를 가지지 않아도 afterAttack 후속 모듈을 실행하도록 범용 수정했다. effects-only 착탄 공격의 summon.spawn/effect.spawn 등 비피해 후속 모듈이 더 이상 건너뛰어지지 않으며, 펠루나 모루 착탄 소환도 같은 경로를 사용한다. 캐릭터 ID 예외는 추가하지 않았다.

- 3.611: 펠루나 3단계 게이지를 엔소냐의 시간형 3칸 게이지처럼 현재 단계 한 칸이 5초 동안 연속 감소하도록 변경했다. `gauge.segmented`의 progress valueRef에 범용 `mode:'decay-time'`을 추가하고 ProgressStateService의 다음 감소까지 남은 시간을 온라인 snapshot에도 동기화한다. 펠루나 세 칸은 모두 캐릭터 색 `#555555`로 통일했다. 평타는 delivery.area의 범용 `annularDoubleSweep` 자동 렌더를 사용해 기존 펠루나의 회전 망치 스윕 애니메이션을 복원하며, 1단계 이상 강화 평타는 동일 스윕을 주황색으로 표시한다. 새 펠루나 전용 서비스/렌더러는 추가하지 않았다.
- 3.610: 기존 파일의 펠루나를 3.0 범용 모듈 구조로 구현했다. 펠루나 평타 강화는 `state.progress` 3단계로 관리하며 1단계 내부 안전지대 제거, 2단계 300ms 선딜 제거, 3단계 피해 250→400을 누적 적용한다. 모루 투사체는 기존 직격 300/사거리 500/강화 범위 240/체력 800을 유지하고 착탄점에서 범위 넉백, 범위 안의 소유자 단계 +1, 공격 가능한 고정 모루 설치를 수행한다. 반격 적중 시 즉시 3단계가 된다. `ProgressStateService.decay.stepInterval/stepAmount/pauseFieldStateKey`를 범용 확장해 단계가 5초마다 하나씩 감소하고 지정 설치 field 안에서는 타이머를 정확히 정지시킨다. `SummonDeployService.spawnFromAttack()`은 `position:'impact-point'`를 범용 지원하고, `delivery.area.innerRange`는 원/부채꼴의 내부 안전 반경으로 일반화했다. 새 캐릭터 전용 서비스/네트워크 패킷은 추가하지 않았다.
- 3.599: 온라인 `duel-hit-confirmed`가 실제 AttackExecution의 `directionAngle`을 함께 전송/복원하도록 수정했다. 기존 확인 처리에서 존재하지 않는 `execution.angle`을 읽어 기본 0라디안(오른쪽)으로 떨어지던 공통 오류를 `execution.directionAngle` 기준으로 교정해, 유이처럼 플레이어 적중 확정 후 공격 방향 자기이동을 사용하는 효과가 실제 조준 방향을 유지한다. `movement.move`의 공통 dash-line은 시작 시 계산된 실제 presentation endpoint snapshot을 그대로 사용하도록 유지하며 유이 LMB 흔적 지속시간을 다른 순간 이동기와 같은 250ms로 늘려 순간이동에서도 경로가 명확히 보이게 했다. 다즈빈 LMB homing 최대 회전량은 0.05에서 0.03으로 낮췄다.
- 3.600: 온라인 `ability-release`의 차징 공격은 송신자가 전달한 `resolvedChargeProgress`를 canonical 값으로 사용하며, 수신 측의 임시 ChargedAttackService state가 누락된 경우에도 같은 dynamic AttackSpec을 직접 복원해 재생한다. 메인마드처럼 차징 평타가 대상 권위 클라이언트에서 공격 자체를 잃어 플레이어를 타격하지 못하는 경로를 캐릭터 예외 없이 보완했다. 재타격 가능한 관통 투사체는 `confirmProjectile()` 저스트 회피 성공 시에도 해당 대상의 `rehitInterval`을 소비해 같은 투사체가 다음 프레임 즉시 재피격시키지 않는다. 다즈빈 LMB homing 최대 회전량은 0.05로 복구했고, 유이 LMB dash-line 지속시간은 250ms 변경을 취소해 167ms로 되돌렸다.
- 3.601: ProjectileService의 대상 접촉 순서를 수정했다. 프레임 끝 정적 원 겹침만 먼저 검사하던 구조 때문에 큰/느린 투사체를 회피 한 프레임에 완전히 통과하면 JustDodgeService의 swept 선분 판정이 호출되지 않던 문제를 해결했다. 이제 로컬 권위 대상의 활성 저스트 회피 경로와 투사체 이동 경로가 교차하면 정적 겹침이 끝난 뒤에도 confirmProjectile()을 먼저 평가한다. 캐릭터/공격 ID 예외는 사용하지 않는다.
- 3.604: 이동 중 벽 겹침으로 AttackService 실행이 지연되거나 charge.attack.release의 deferWhileMovement로 릴리스가 대기된 공격은 대기 시작 시점의 조준값을 고정하지 않고 실제 커밋 직전에 소유자의 최신 aimAngle/aimTargetPoint를 다시 사용한다. 온라인 원격 Entity도 duel-state로 동기화된 최신 조준 방향/마우스 월드 좌표를 사용해 같은 최종 방향으로 재생한다. 캐릭터별 예외 없이 기존 WallOverlapAttackDeferService/ChargedAttackService를 확장했다.
- 3.603: `ProgressStateService`의 범용 진행도 상태를 `duel-state.progressStates`로 직렬화/복원하도록 추가했다. 칸 `kan-feast`처럼 현재 진행도에 따라 공격 배율이 달라지는 상태가 공격자 로컬에만 존재해 대상 권위 클라이언트에서 항상 0게이지 피해로 재계산되던 문제를 캐릭터 전용 패킷 없이 해결했다. 원격 재생 중 임시로 생성된 progress-state는 소유자 권위 스냅샷으로 보정하며, 스냅샷에 없는 progress-state는 제거한다.
- 3.602: rehitInterval>0인 재타격형 투사체는 단발 투사체의 접촉 저회(confirmProjectile)를 사용하지 않고 실제 피해 틱에서 DamagePipeline의 공통 저스트 회피만 판정한다. 저회/회피 보호로 막힌 피해 틱도 rehitInterval을 소비하므로 다음 프레임 즉시 재시도하지 않는다. 기존 다즈빈 파동 구체의 500ms tick → applyDamage 구조와 동일한 의미를 범용 ProjectileService로 복원했으며 공격 ID 예외는 사용하지 않는다.
- 3.598: 캐릭터 설명 템플릿 치환 목록에서 누락된 `rewindSeconds`를 추가해 유이 RMB 설명의 `{rewindSeconds}` 원문 노출을 수정했다. `movement.move` Ability 실행기와 projectile recall/자동 귀환이 `MovementAbilityService.start()` 이후 `MovementPresentationService.pushLine()`을 직접 중복 호출하던 경로를 제거했다. 이동 흔적은 이제 규칙대로 실제 `이동기` 태그가 있는 movement만 `MovementAbilityService.start()`에서 생성하며, 루뷰의 망치 접근 뒤 extraDistance 자가 넉백과 RMB 귀환/자동 귀환 자가 넉백에는 이동기 흔적이 생성되지 않는다.
- 3.597: 유이 평타 적중 후 `movement.move`에 다른 이동기들과 동일한 공통 `dash-line` presentation을 명시해 출발점부터 도착점까지 이동 경로가 167ms 동안 표시되도록 통일했다. 별도 유이 전용 이펙트는 추가하지 않고 기존 MovementPresentationService/EffectSpawnService 경로만 사용한다.
- 3.596: 유이 평타/반격의 전용 순간이동 잔상을 제거하고 다른 `이동기`와 동일한 공통 `dash-line` 흔적만 사용하며, 더 이상 사용되지 않는 `teleportBurst`/`teleportDash` 렌더 경로도 삭제했다. 평타 미적중 순간이동의 실제 원인은 `AttackModuleService.afterAttack()`이 `when:'on-hit'`인 `movement.move`까지 무조건 실행하던 공통 버그였으므로 afterAttack은 `when` 미지정/`after-attack` 이동만 실행하도록 수정했다. 온라인 원격 대상의 source-side `on-hit` 이동도 공격자 예측 접촉에서 실행하지 않고 대상 권위 `duel-hit-confirmed` 이후에만 확정한다. 유이 반격의 전용 progressRect도 제거해 공통 area 공격 이펙트와 공통 이동 흔적을 사용한다. 리와인드 위치 표시는 기존 파일과 같이 정확히 3초 전 보간 위치에 캐릭터 크기 반투명 원, 바깥 파란 점선 링, 중앙 ⟲, 아래 48×4 스테미나 바를 표시하며 스테미나 비율은 해당 과거 스냅샷 값을 사용한다.
- 3.595: 기존 파일 기준으로 유이를 이식했다. HP 900/이동속도 4.25/Base Damage 300, LMB 120 범위·120도 부채꼴·비용 200·쿨 400ms·적중 시 조준 방향 192 순간이동, RMB 비용 600·쿨 500ms·3초 전 위치/스테미나 되감기, 반격 0.3초 선딜·320×반폭40 경로 공격·순간이동·무력화 넉백을 사용한다. 연속 과거 상태는 새 범용 `TemporalSnapshotService`와 `action.temporal-rewind`로 처리하고, 적중 후 조준방향 이동은 기존 `movement.move`의 `target:'attack-direction'`을 일반화했다. 기존 유이의 순간이동/되감기/반격 잔상은 `effect.spawn` 기반 범용 `teleportBurst`/`temporalRewind`/`teleportDash` 프레젠테이션으로 재현한다.
- 3.594: `delivery.projectile.homing`이 존재하면 TagService가 `유도` 태그를 자동 파생한다. 다즈빈 파동 구체의 `proximitySpeed.range:150` 하드코딩을 제거해 준비된 실제 projectile radius를 공통 fallback으로 사용하므로 투사체 크기 증감도 감속 감지 범위에 반영된다. `field.area`의 `modifier.set`에 범용 `stackGroup`을 지원해 같은 소유자·같은 그룹의 여러 필드가 하나의 Buff source만 갱신하며, 한 필드를 벗어나거나 제거해도 다른 같은 그룹 필드가 대상을 덮고 있으면 버프를 제거하지 않는다. 프릴 청소 완료 구역의 피해 +50%는 이 그룹을 사용해 여러 구역이 겹쳐도 중첩되지 않는다.
- 3.593: 외곽 글로우를 만들기 위해 별도의 주황색 발광용 stroke를 그리던 경로를 제거했다. `drawProjectileOutlineGlow()`는 현재 투사체가 이미 사용하는 원래 `strokeStyle`과 `lineWidth`를 변경하지 않고 같은 외곽 경로에 `shadowColor:'rgba(255,128,24,1)'`, blur 17만 적용한다. 이후 본체 fill과 원래 외곽선을 위에 렌더하므로 외곽선 자체를 주황색으로 채우지 않으며, 중앙 fill도 글로우 원본으로 사용하지 않고 기존 외곽 경로에서 발생한 주황 shadow만 탄환 아래에 남는다.
- 3.592: 기존 투사체 주황 글로우의 색상(`rgba(255,128,24,1)`), blur 17, offset 0은 그대로 유지하면서 발광 원본을 본체 fill+stroke에서 외곽 경로 전용으로 변경했다. 공통 `drawProjectileOutlineGlow()`는 현재 외곽 경로를 원래 lineWidth의 절반인 발광용 중심선으로 먼저 그리며, 이후 본체 fill과 원래 외곽선이 그 위를 완전히 덮는다. 따라서 중앙 채움은 글로우 생성에 참여하지 않고 별도 주황 윤곽선도 노출되지 않으며, 기존과 동일한 주황 shadow가 탄환 외곽선을 따라 아래에만 퍼진다.
- 3.591: 투사체 글로우를 별도 주황 stroke로 그리던 3.587~3.590 경로를 제거하고, 정상 구현이던 3.585의 Canvas shadow 방식으로 정확히 복구했다. 각 탄환은 `applyProjectileGlow → 기존 fill/stroke → clearProjectileGlow` 순서로 렌더되며 별도 주황 선이나 굵은 underlay를 생성하지 않는다. Canvas shadow는 원본 도형 뒤에 합성되므로 주황빛은 탄환 실루엣 바깥 아래쪽 레이어에만 나타나고, 본체 색상과 기존 외곽선은 그 위에 유지된다. 이후 추가된 레이저 볼트·트레이서에도 같은 공통 방식을 적용했다.
- 3.590: 3.589의 굵은 반투명 주황 stroke 레이어를 제거하고 3.580~3.586에서 사용하던 투사체 글로우 값(`rgba(255,128,24,1)`, shadowBlur 17)으로 복구했다. 공통 `drawProjectileGlowUnderlay()`는 현재 투사체 외곽 경로에 글로우만 먼저 렌더하고, 각 투사체 렌더러가 그 뒤에 본체 fill과 원래 stroke를 그린다. 일반 원형·특수 마름모·덫·로켓·레이저 볼트·트레이서·무기 투사체 모두 `glow → fill → 원래 외곽선` 순서를 사용해 주황빛이 탄환 위가 아니라 아래에 깔린다.
- 3.589: 투사체 주황 글로우가 원래 외곽선의 낮은 stroke alpha에 함께 약해져 거의 보이지 않던 원인을 수정했다. 공통 `drawProjectileGlowStroke()`가 현재 외곽 경로를 그대로 재사용하되, 원본 strokeStyle/lineWidth와 분리된 주황 확산층(기존 선폭+14px, blur 36)과 집중층(기존 선폭+7px, blur 18)을 `lighter` 합성으로 먼저 그린다. 이후 shadow 없이 원래 외곽선을 한 번만 복원해 주황색 별도 윤곽선이 아니라 외곽선을 따라 넓게 퍼지는 glow로 표시한다.
- 3.588: 공통 투사체 중심 충돌 변경은 취소하고 기존 반지름 기반 벽·월드 경계 충돌을 복구했다. 다즈빈 `강한 파도`에만 `wallCollisionMode:'center'`를 지정해 파동 중심이 맵 경계에 닿을 때 즉시 사라지며, 이전의 경계 밖 추가 진행·페이드 전용 분기는 제거했다. 일반·무기·특수 투사체의 주황 글로우는 채움이 아닌 외곽선에만 진한 주황색 2중 번짐으로 표시한다.
- 3.587: 외곽선 전용으로 바꾼 투사체 주황 글로우가 특히 1px 일반 투사체 윤곽에서 너무 연해진 문제를 수정했다. 공통 `TrainingWorldDrawService.drawProjectileGlowStroke()`가 주황색 외곽선을 넓은 22px 번짐과 집중된 10px 번짐으로 두 번 그린다. 일반·무기·특수 및 기존 커스텀 투사체가 같은 경로를 사용하며 채움에는 글로우를 다시 적용하지 않는다.
- 3.586: 다즈빈 평타의 최대 유도 회전량을 0.07→0.05로 낮췄다. `강한 파도`는 맵 경계까지의 거리에 따라 지속시간을 계산해 항상 1800 units/s로 진행하며, 200 피해와 공통 반격 전용 무력화 넉백을 적용한다. 잘못 사용한 `allowNoCc` 예외를 제거하고 animation damage가 원래 AttackExecution의 extraModules를 이어받도록 일반화했다. 파동 구체는 경계 접촉 후 지름만큼 바깥으로 계속 이동하며 월드 경계에 점차 잘리고 페이드된 뒤 제거된다. 파도가 투사체를 제거할 때 기존 리안 방패의 parry EffectSpec을 재사용한다. 일반 원형·무기·특수 투사체의 주황 글로우는 채움이 아닌 외곽선 stroke에만 적용한다.
- 3.585: 기존 파일 기준으로 다즈빈을 이식했다. 물의 정령은 거리 진행도 이후 가장 가까운 적을 향해 점차 유도되고, 파동 구체는 벽과 적을 관통하면서 범위 내 적에게 0.5초 간격 피해와 감속을 적용한다. 반격은 `강한 파도`로 리메이크해 공통 0.3초 선딜 뒤 현재 조준 방향의 실제 맵 경계까지 거대한 `progressRect` 파도가 전진하며, 파도 선단이 지나간 모든 투사체를 제거한다. 진행 시각과 제거 판정은 같은 Effect animation progress를 공유하고 온라인 제거 결과도 기존 투사체 방어 동기화 경로를 재사용한다.
- 3.584: 원격 엔티티가 권위 시뮬레이션 검사에서 제외될 때 `channel.attack`의 지속 presentation 갱신까지 건너뛰던 문제를 수정했다. 채널 피해 시뮬레이션과 Effect 추적을 분리해 프릴의 팀색 점선 윤곽선이 원격 화면에서도 수신된 실시간 조준 각도를 따라간다. 자동 공격은 실행 순간의 로컬 마우스 월드 좌표를 `targetPoint`로 전달해 엘린처럼 착탄 지점형 평타도 현재 마우스 위치로 발사된다.
- 3.583: 자동 공격이 차징 평타를 새로 시작한 뒤 0%로 즉시 해제하던 경로를 제거했다. 평타 AttackSpec이 `charge`면 현재 `ChargedAttackService` 진행률의 dynamic spec을, `progressScale`이면 현재 `ProgressStateService` 값의 resolved spec을 스냅샷으로 준비해 무료 추가 공격으로 실행한다. 기존 수동 차징/드래그 상태는 소비하지 않으며 하츠하츠 드래그 평타도 현재 드래그 진행률로 발사된다.
- 3.582: 실시간 조준 `channel.attack`의 현재 각도·기준점을 기존 `duel-state`에 포함하고 원격 채널 상태에 적용한다. 원격 화면에서도 프릴 청소 구역처럼 채널 presentation이 최초 각도에 고정되지 않고 소유자의 조준을 따라간다. 프릴 baseDamage는 일반 평타 실제 피해 100에 맞추고 3타는 damageRatio 2로 200 피해를 주며, 스킬 틱·반격은 배율을 재정렬해 기존 실제 피해 100/200을 유지한다.
- 3.581: `channel.attack.stopField`가 채널 공격에 적용된 범위 증폭을 이어받지 않던 문제를 수정했다. 공격 연동 geometry 준비 경로가 field 본체와 중첩 presentation을 함께 재귀 변환해, 프릴 청소 완료 후 피해 증가 구역의 실제 판정·점선 표시가 채널 피해 범위와 동일하게 확대된다.
- 3.580: `channel.attack`의 지속 공격 윤곽선이 원본 presentation 수치에 머물러 실제 준비된 AttackSpec의 범위 증폭을 따라가지 않던 문제를 수정했다. 공격에 연결된 채널 presentation은 동일 attack adjustment의 범위 배율로 range/halfWidth 등 모든 시각 geometry를 준비하므로, 프릴 청소 구역의 팀색 점선 윤곽선과 실제 피해 범위가 일치한다.
- 3.579: 차징 공격 릴리스가 실제 공격을 실행하고도 능력 실행 결과의 `executed`와 `resolvedAttackId`를 기록하지 않던 문제를 수정했다. 메인마드 LMB를 포함해 `charge.attack.release`를 공유하는 모든 차징 공격은 이제 로컬 입력 결과와 온라인 `ability-release` 패킷에 실제 실행 성공 여부·공격 ID가 동일하게 전달된다.
- `delivery.area.targetRelations`는 `self/ally/enemy` 관계 배열을 지원한다. `effectsOnly:true` 범위는 피해 없이 기존 onHit 효과만 대상 권위 클라이언트에서 실행한다. `resource.restore recipient:'target'`도 AttackModuleService의 범용 적중 효과로 처리한다.
- 파생 수치는 고정 숫자를 복제하지 않는다. `ModuleValueService`의 `amountRef.type:'summon-field-modifier'`는 지정 소환수 fieldArea의 modifier 값을 찾아 multiplier를 적용한다. 미아루키 회복 반격은 공구함 `regeneration` 부여량×5를 사용한다.
- 자연회복 대기 게이지는 기존 `nextHealthRegenAt`, `healthRegenPolicy.idle`, `regenDelayMult`를 읽는 Presentation 전용 표시다. 자연회복을 기다리는 동안 체력바 바로 아래 2px 흰색 게이지가 차며, 자연회복이 시작되면 숨긴다.
- 피해/회복 숫자 인디케이터는 `Presentation.numberBuffer` 단일 합산 경로를 사용한다. 동일 대상의 동일 종류(damage/heal)가 80ms 안에 연속 발생하면 하나의 숫자로 합산한다. 피해와 회복은 서로 상쇄하지 않고 종류별로 따로 합산한다.
- 일반 `movement.move`는 `passWalls:true`가 기본값이다. `motionMode:'knockback'`만 벽 통과가 기본 금지이며, 일반 이동기를 벽에 막히게 할 때만 `collision.passWalls:false`를 명시한다. 리안 방패 돌진/백업의 구버전 `passWalls:false`는 제거한다.
- 자연회복 흰 게이지는 대기 중 0→100%로 차고, 자연회복이 시작된 뒤에는 체력이 최대가 될 때까지 100%로 유지한다. 회수 상태 소환수 체력바도 `storedNaturalRegenReadyAt`을 기준으로 같은 표현을 사용한다.
- 자연회복 활성화 타이머 표시는 `DisplaySettings.state.naturalRegenTimer`로 제어하며 기본값은 OFF(false)다. OFF일 때 플레이어/소환수의 월드 체력바와 회수 상태 소환수 체력바의 흰 자연회복 게이지를 모두 렌더하지 않는다. 자연회복 계산 자체에는 영향이 없다.
- `defeat.prevent`는 `protectDamageBatch:true`일 때 발동 원인이 된 `AttackExecution`을 대상의 `augmentState.defeatProtection`에 짧게 기록한다. 보호 시간 동안 같은 execution에서 이어지는 산탄/다중 투사체 피해는 `beforeIncomingDamage()`에서 0으로 처리한다. `최후의 발악`은 80ms 동시 피해 묶음 보호를 사용하므로 첫 치명타에서 체력 1로 생존한 직후 같은 공격의 나머지 탄환으로 즉사하지 않는다. 보호는 execution 단위이면서 시간 제한이 있어 귀환 등 한참 뒤의 재적중까지 막지 않는다.
- 전투 HUD 캐릭터 아이콘의 레코드 윤곽선은 아이콘 소유 참가자의 profile 데이터를 기준으로 계산한다. `CharacterRecordService.applyHudIconStyle()`은 account/profile 인자를 받아 `applyMasteryStyle()`로 전달하며, 로컬은 로컬 profile, 상대/아군은 각 참가자 profile을 사용한다. 툴팁의 recordPoints와 아이콘 mastery tier가 같은 profile source를 사용해야 한다.
- `delivery.projectile.arrival`은 target-point 투사체의 범용 착탄 정책이다. `targetRelations`, `targetPriority:'before-wall'`, `triggerHitEffects`, `clearFieldStateKey`를 조합할 수 있다. 메후구 RMB는 입력 단계의 `target.wall` 제한을 사용하지 않아 모든 지점을 지정할 수 있고, 착탄 지점에 적과 벽이 함께 겹치면 적을 먼저 선택한다. 적 착탄 시 기존 `status.apply` onHit 효과로 즉시 속박하고 `rope-anchor` field 인스턴스를 전부 제거하며 새 벽 로프는 생성하지 않는다. 적이 없고 벽이 있을 때만 기존 `field.area` 로프 연결을 실행한다.
- target-point 투사체의 `arrival.linger`는 적/벽이 없는 착탄 지점에서 투사체 자체를 일정 시간 잔류시키는 범용 착탄 상태다. `duration`, `fadeOut`, `triggerOnEnter`, `removeOnTrigger`, `showRange`를 사용하며 착탄 순간 비행 연결선 presentation만 제거한다. 메후구 RMB는 빈 곳 착탄 후 500ms 동안 제자리에 남아 선형으로 투명해지고, 그동안 적이 범위에 들어오면 기존 onHit `status.apply(bind)`를 실행한 뒤 즉시 제거된다.
- 메후구 RMB 착탄 판정은 `targetRadiusScale:2`로 실제 projectile 판정 반경의 2배(100% 증가)를 사용하며, 잔류 중 그 판정 반경을 같은 색의 점선 원 이펙트로 표시한다. 원 이펙트와 착탄 투사체는 같은 잔류 alpha를 사용해 함께 사라진다.
- 메후구 RMB의 빈 지점 착탄은 별도 임시 Entity/field를 만들지 않는다. 비행하던 Projectile 객체 자체의 `vx/vy`를 0으로 만들고 `targetPoint/targetDistance`를 해제한 뒤 `stationaryArrival` 상태로 1000ms 유지한다. 따라서 ProjectileService의 기존 렌더/상태 수명을 그대로 사용하며 착탄 직후 제거 경로로 다시 진입하지 않는다.
- 빈 지점 착탄의 속박 판정 반경은 실제 projectile 판정 반경의 3배다. 벽에 붙은 경우에는 원 범위 이펙트를 만들지 않고 기존 벽 로프만 생성한다. 빈 지점에서는 기존 `actionWindowIndicator` 이펙트로 같은 반경의 원을 1000ms 생성하고 지속시간 전체에 걸쳐 fade-out한다. 정지 투사체도 같은 1000ms 동안 fade-out한다. 그 사이 적이 범위에 닿으면 기존 onHit `status.apply(bind)`를 실행하고 투사체와 범위 이펙트를 즉시 함께 제거한다.
- 리안 LMB는 `delivery.area`의 자동 botSwing과 명시적 shieldSwing이 동시에 생성되던 중복 시각 경로가 있었다. 자동 이펙트는 벽 절단 polygon을 사용하고 shieldSwing은 단순 arc를 사용해 벽 모양에 따라 다르게 보였다. `replaceAutoAreaEffect:true`인 명시 효과가 자동 area 시각을 대체하고, `clipToAttackArea:true`는 실제 delivery.area와 동일한 AreaGeometry polygon을 snapshot해 렌더한다. 리안 평타는 이제 shieldSwing 하나만 실제 판정과 동일하게 벽에 잘린다.
- `AreaZonePresentationService`는 미아루키 회복지대와 메후구 비벽 착탄 범위가 공유하는 원형 지대 표현이다. 내부 채움은 본체/효과 색, 점선 윤곽선은 소유 Entity의 팀 색이다.
- 메후구 target-point 투사체는 `wallSnapDistance:50`으로 기존 1블록 벽 보정을 사용한다. 원래 지정 지점에 적이 착탄 판정 안에 있으면 적 우선 때문에 벽 보정을 하지 않고, 적이 없을 때만 50px 이내 벽 외곽으로 targetPoint를 보정한다.
- 메후구 빈 지점 정지 투사체는 targetPoint/targetDistance를 유지해 착탄 progress=1의 렌더 좌표/알파를 보존한다. `stationaryArrival`이 다음 프레임의 이동보다 먼저 실행되어 1000ms 유지된다. 벽이 아닌 적 직접 착탄에도 3배 판정 반경의 `areaZoneIndicator`를 생성하며, 빈 지점 잔류 시에는 같은 표시를 1초 동안 유지한다.
- 미니맵은 `EntityService`의 `kind:'summon'` 엔티티도 표시한다. 소환수 점은 `TeamColorPresentationService.colorForEntity()`의 해당 팀 색을 쓰고 플레이어 점보다 조금 작게, 55% 알파로 표시한다.
- 미니맵 투명도는 월드 좌표의 임의 구역이 아니라 실제 화면 겹침을 기준으로 한다. 로컬 플레이어의 screen-space 원이 우상단 미니맵 rect와 겹치면 미니맵 전체 알파를 0.34로 낮추고, 벗어나면 1로 복구한다.
- target-point 착탄 판정의 `targetRadiusBase:'visual'`은 `projectile.presentation.style.radius`를 기준 반경으로 사용한다. 메후구 RMB는 시각 반경 16×3=48px을 실제 착탄/잔류 판정과 범위 표시 모두에 사용한다.
- `arrival.wallSnapDistance`는 발사 전 조준 보정뿐 아니라 실제 착탄 시점에도 다시 검사한다. 적 우선 판정 후 직접 벽이 아니더라도 50px 이내 벽이 있으면 가장 가까운 벽 외곽점으로 착탄 위치를 확정하고 field.area 로프를 생성하며, 빈 바닥 stationaryArrival보다 우선한다.
- 미니맵 겹침 투명화는 로컬 플레이어만 검사하지 않는다. 미니맵에 표시되는 로컬/원격 모든 player Entity의 screen-space 원이 미니맵 rect와 겹치는지 검사하고 하나라도 겹치면 미니맵 전체 알파를 낮춘다.
- target-point 투사체의 적 접촉 판정은 `TargetPointProjectileService.contactTarget()` 하나만 사용한다. 최초 착탄과 stationaryArrival 잔류 모두 같은 중심-반경/관계 판정을 쓰며 별도 `targetAtPoint`/`stationaryTarget` 경로를 두지 않는다. 메후구는 적>벽>잔류 우선순위를 유지한다.
- 메후구의 직접 적 착탄도 먼저 동일 stationaryArrival 원 범위를 생성한 뒤 `resolveContact()`를 즉시 실행한다. 잔류 중 적중도 같은 `resolveContact()`를 사용하며, 성공 시 `rangeEffectKey`의 원 이팩트를 즉시 제거하고 projectile도 기존 finish 경로로 제거한다.
- 자연회복 활성화 게이지의 원격 표시에는 로컬에서 추정한 `lastAttackTime/lastDamageTime`을 사용하지 않는다. authoritative 플레이어가 `naturalRegenReadyRemaining`과 `naturalRegenReady`를 duel-state에 실어 보내고, 원격 Entity는 이를 로컬 performance 시간으로 복원한 `_networkNaturalRegenReadyAt`을 Presentation에서 사용한다.
- `attack.guard.visualState`로 원본 공격 이팩트를 교체할 때는 색/지속시간만 새로 만들지 않고 원본 effect의 geometry snapshot(`points`)을 복사한다. 따라서 리안 방어 성공 시 시안 shieldSwing도 방어 전 주황 shieldSwing과 동일한 벽 절단 모양을 사용하고, 로컬/원격 모두 같은 points가 presentation snapshot으로 전달된다.
- 온라인 디버그 강제 행동은 Entity의 로컬 id가 아니라 참가자 `targetPid`를 함께 전송한다. 수신 측은 `OnlineParticipantEntityService.entity(targetPid)`로 자기 소유 player를 해석한 뒤 그 소유자 화면에서만 행동을 실행한다. `DebugControlService.canForceAction()`은 로컬/원격 구분 없이 player의 실제 abilities를 기준으로 버튼 활성 여부를 결정한다.
- target-point projectile의 적 착탄/잔류 접촉은 상태 효과만 직접 실행하지 않는다. `triggerTarget()`이 `AttackHitTriggerService.damage()`를 먼저 통과한 뒤 authoritative hit에서 기존 `AttackModuleService.onHit()`을 실행한다. 따라서 메후구 로프 투척의 적 직접 착탄과 빈 지점 잔류 접촉도 벽-벽/벽-소스 rope field와 동일한 damageRatio 피해 규칙을 사용하고, 속박은 같은 onHit 모듈로 적용된다.
- target-point projectile이 `stationaryArrival` 상태면 비행용 trajectory.arc/range fade 계산을 더 이상 사용하지 않는다. `ProjectileVisualPositionService.sample()`은 실제 착탄 x/y를 그대로 반환하고, stationary duration의 남은 비율만 alpha/strokeAlpha로 사용한다. 메후구 RMB 공터 착탄은 1000ms 동안 동일 weapon-projectile 객체가 착탄 지점에 남아 선형 fade-out한다.
- `anchor-cross` weapon-projectile 렌더는 별도로 visual.alpha만 사용하지 않고 공통 projectile `alpha`를 사용한다. 따라서 persistent/stationary 상태의 생명주기와 무기 투사체 실제 표시가 분리되지 않는다.
- 타우 스파크 체인은 기존 `projectile.presentation kind:'weapon-projectile'`의 `anchor-cross` 렌더를 재사용한다. 별도 sickle 전용 렌더는 제거했다. `movement.move`는 `on-projectile-wall-hit`/`on-projectile-outbound-hit` 시점에서도 같은 충돌 정책을 사용하고, `movement.knockback`의 `toward-source + distanceMode:'source-contact'`는 귀환 투사체 적중 대상을 소유자와 겹치지 않는 접촉 거리까지만 끌어온다.
- 타우 스파크 체인 귀환 적중은 `movement.projectile-tether`가 실제 귀환 투사체와 피격 대상을 함께 이동시키며 이동 중 bind를 유지하고, 투사체 회수 시 즉시 해제한다. tether 이동의 벽 관통 여부는 별도 상수로 정하지 않고 연결된 투사체의 `collisionPolicy.passWalls`를 그대로 상속한다. 따라서 벽 관통 귀환 투사체에 묶인 대상도 같은 벽을 통과한다. 타우의 스킬 이동 목표는 같은 stateKey의 가장 최근 투사체를 사용한다.
- 전투 카메라는 플레이 영역 경계와 카메라 경계를 동일시하지 않는다. `cameraFollow.edgeOverscanRatio`만큼 화면을 맵 바깥으로 허용해 가장자리 Entity도 화면 중앙 쪽에 유지하며, Entity/충돌의 실제 WorldBounds는 변경하지 않는다.
- `WorldBoundsService` 바깥 영역은 충돌/공격 판정에서 완전한 벽으로 취급한다. `WorldGeometryService`의 line-of-sight/raycast/wallAtPoint/nearestWallTarget이 같은 외곽 가상 벽을 사용하며, wallPolicy:'ignore' 또는 명시적인 벽 관통 효과가 아닌 히트스캔·범위 공격은 맵 경계를 넘어가지 않는다.
- 공통 피격 피드백의 기존 노란 팽창 링 `hitImpactRing`을 `EffectSpawnService` 생성 경로로 복원하고, 온라인에는 동일 EffectSpec snapshot을 전송한다.
- 기존 듀얼즈의 실제 공격 발사 피드백은 `duels2AddFireShake()`와 동일한 power 4.4 / 125ms 화면 흔들림이며 별도 발사 FOV는 없다. 적중 피드백은 52ms 피해 묶음 후 공격자/피격자 역할별 흔들림과 강타 FOV를 함께 사용한다.
- 기존 강타 FOV의 60 피해 기준은 Duels 3의 10배 피해 스케일에 맞춰 600으로 환산한다. duration 82ms, basePeak .026, maxPeak .045, attackRatio .23, releasePower 2.6은 그대로 사용하고 damagePeakStep만 .00024→.000024로 환산한다.
- `neutralize` 상태 대상을 직접 타격하면 실제 피해량은 바꾸지 않고 프레젠테이션 피해량만 강타 기준 이상으로 승격해 기존 강타 피격 squash, hitImpactRing, 화면 흔들림, 강타 FOV 경로를 그대로 재사용한다.
- `delivery.projectile.arrival.clearFieldStateKey`는 접촉 시도 전에 실행하지 않는다. 해당 target-point projectile의 `AttackHitTriggerService.damage()`가 실제 authoritative hit로 성립한 뒤에만 그 projectile 설정의 field를 제거한다. 따라서 메후구 RMB 로프 투사체가 적에게 실제 적중하면 기존 `rope-anchor`는 제거되지만, LMB·차징 LMB·반격 등 다른 공격 적중이나 회피/방어된 접촉은 기존 벽 연결 로프를 제거하지 않는다.
- 메후구 RMB의 적 적중은 기존 설치 `rope-anchor` field를 제거하지 않는다. targetPriority:'before-wall'은 목표점 도착뿐 아니라 실제 벽 충돌에서도 먼저 평가해 벽과 적을 동시에 맞힌 경우 로프 설치와 적중이 동시에 남지 않게 한다. 벽↔메후구 로프가 존재하는 상태에서 다시 RMB를 적에게 맞혀도 새 투사체의 피해/속박과 착탄 이펙트만 처리하고 기존 벽 연결 로프는 그대로 유지한다. `arrival.clearFieldStateKey`와 `TargetPointProjectileService.clearConfiguredField()` 경로는 제거했다. 로프 field의 생성/연결/소멸은 오직 `field.area`의 벽 착탄·pairWalls·duration·removeOnTrigger 등 field 자체 규칙으로만 관리한다.
- 메후구 완성 벽-벽 로프는 샤이라즈 덫과 같은 관계 가시성 원칙을 사용한다. 설치자/아군에게는 관리용으로 보이지만 적에게는 숨기고, 실제 발동 시 짧게 로프를 다시 표시한 뒤 제거한다. 완성 시 벽 외곽선도 숨긴다.
- 메후구 RMB/RMB-RMB 툴팁의 속박 시간은 고정 문자열 `1`을 복제하지 않고 기존 `{bindSeconds}` 보간을 사용한다. 현재 `status.apply bind duration:1000`이므로 화면에는 1초로 표시되며 데이터 변경 시 자동 반영된다.
- 캐릭터에서 마우스로 이어지는 빨간 조준선은 월드 캐릭터/소환수 렌더보다 먼저 그린다. 기능/좌표 계산은 기존 `mouseWorld()`를 그대로 사용하고 렌더 순서만 낮춰 캐릭터 본체 아래 레이어에 표시한다.
- 리안 반격기 `attack.lian.counter` 사거리는 기존 133에서 정확히 30% 증가한 172.9를 사용한다. AttackSpec.range, delivery.area, attack.guard, shieldUppercut presentation의 range를 모두 같은 값으로 유지한다.
- 미아루키 공구함 재생은 현재 `regeneration value:20`, `tickInterval:250`으로 0.25초마다 20 회복한다. 회복 반격은 같은 공구함 regeneration 값을 `ModuleValueService amountRef multiplier:10`으로 읽으므로 현재 즉시 회복량은 200이며, 공구함 재생 수치 변경 시 자동으로 함께 변한다.
- 미아루키 공구함 최대 체력은 80, 파괴 후 복구 대기시간은 7000ms다. `respawnHealth:80`은 `maxHealth:80`과 같아서 파괴 복구 완료 뒤 다시 설치할 때 항상 최대 체력으로 생성된다. 일반 회수는 기존 규칙대로 현재 체력을 보존한다.
- 훈련장 좌상단 캐릭터 HUD는 온라인 참가자 profile 해석을 재사용하지 않고 `AccountState.current`를 로컬 profile source로 사용한다. 따라서 훈련장에서는 `isLocal=true`로 처리하고 캐릭터 설명의 `recordPoints`와 레코드 외곽선 모두 실제 로그인 계정의 `characterRecords[characterId]`를 사용한다. 훈련장 캐릭터 변경/선택 툴팁도 같은 `CharacterRecordService.points()` 경로를 사용한다.
- 레코드 정산은 매 라운드 `duel-round-result`를 한 번만 처리한다. 1대1은 골드 이하 +100/+50, 다이아 +50/0, 플레티넘 +40/0, 마스터 +30/0. FFA는 골드 이하 승리/중간/패배 +100/+50/+50, 다이아 +50/0/0, 플레티넘 +40/0/0, 마스터 +30/0/0이다. 팀전은 골드 이하 +150/+75, 다이아 +75/0, 플레티넘 +60/0, 마스터 +45/0이다. 일반 라운드 패배의 음수 차감은 없으며 중도 탈주 패널티는 별도 규칙을 유지한다.
- 불균형 팀전 승리 점수는 개인별 FFA 승리 점수를 원본으로 팀 구성 배율을 적용한 뒤 `Math.round()`한다. 2인 팀이 1인 팀을 이기면 1/2, 3인 팀이 1인 팀을 이기면 1/3, 1인 팀이 2인 팀을 이기면 1.5, 1인 팀이 3인 팀을 이기면 2배다. 그 밖의 팀 구성은 기본 팀전 점수를 유지한다.
- 미아루키 공구함 최대체력과 파괴 후 복구 체력은 800이며, 별도 피해 배율 없이 공통 HealthService 피해량을 그대로 받는다.
- 마스터 레코드는 I 12000 / II 14000 / III 18000 / IV 24000 / V 30000의 5단계만 존재한다. 30000점을 넘겨도 마스터 V이며, 각 단계에 도달한 뒤 해당 단계 아래로 강등되지 않는다.
- 레코드와 캐릭터 전적은 동일 계정 또는 동일 기기 identity가 참가한 매치에서는 변동하지 않는다. 기기 identity는 `duels3.room.deviceIdentity.v1` localStorage 키로 유지하고 방 참가자 상태에 전달한다.
- 방 재입장은 매치 단위 차단 상태와 방 연결 슬롯을 분리한다. `blockedRejoinKeys`는 진행 중인 매치에서 이탈한 identity의 즉시 플레이어 복귀만 막는 match-scoped 상태이며, 정상 종료/중도 종료/비호스트 로컬 종료에서 모두 방 복귀와 동시에 비운다.
- 방 대기(`duelPhase:'room'`) 중 같은 identity가 번호로 다시 접속하면 새 PID를 추가로 소비하지 않고 기존 비호스트 슬롯을 재사용한다. 이전 Peer 연결 close 이벤트가 늦게 도착해 stale member가 남아 있어도 방이 `room-full`로 잘못 막히지 않는다.
- 전적은 정산 가능한 완료 라운드마다 현재 사용 캐릭터의 plays +1, 승리 시 wins +1, 패배 시 losses +1이며 승률은 wins/plays×100으로 계산한다.
- 레코드 회피 FX는 후반 기존 Duels 프로필을 기준으로 다이아 46ms/count1/20f/spread34, 플레티넘 54ms/count2/24f/spread20, 마스터 46ms/count2/28f/spread20/sizeScale1.45를 사용한다. 마스터도 별도 시작/도착 버스트 없이 이동 중 공통 트레일만 생성한다.
- 마스터 I 이상 캐릭터 카드는 우상단에 현재 로마 단계가 표시된다. 메인 캐릭터가 마스터면 프로필 캐릭터 아이콘 우상단에도 노랑/보라 그라데이션 단계 표식을 표시한다.
- 마스터 I 회피 트레일은 수명 후반에 수평 scanline 조각으로 깨지며 사라진다. 마스터 II 이상은 저스트 회피에 중앙 대형 육각형과 외곽 2~3개 소형 육각형의 노랑/보라 FX를 추가한다. 마스터 III 이상은 처치 위치에만 육각형과 자신의 현재 로마 마스터 단계가 표시되며 사망 시 전용 마스터 이팩트는 생성하지 않는다.
- 마스터 카드 우상단 단계 표식은 검은 배경 없이 로마 숫자와 글로우만 표시한다.
- 레코드 회피 FX 활성 개수 검사는 `EffectSpawnService.items`가 아니라 실제 활성 이팩트 배열 `Training.fx`를 사용한다.
- 프로필 마스터 단계 표식은 프로필 이미지 내부가 아니라 이미지 사각형의 우상단 모서리 바깥에 겹쳐 표시한다. 설정 프로필과 방 프로필이 같은 wrapper/표식 구조를 사용하며 배경 원·테두리·박스는 없다.
- 레코드 회피 FX는 실제 후기 Duels의 `masteryDodgeTrail` 생성/렌더 규칙을 기준으로 사용한다. 다이아는 중첩 마름모, 플레티넘은 십자/작은 네모/4갈래 별 변형, 마스터는 색이 순환하는 사각 홀로그램+스캔선이다. 생성 위치는 진행 방향 뒤쪽과 좌우 spread를 사용하고 마스터 간 최소 간격을 검사한다.
- 마스터 III 이상 처치 이팩트는 1200ms 유지하며 노랑→보라 그라데이션, 강화 글로우, 31px 로마 숫자를 사용한다. 사망 시에는 생성하지 않고 처치 위치에서만 생성되며 Entity 뒤 FX 레이어라 캐릭터보다 위에 표시한다.
- 플레이어가 직접 지정한 메인 캐릭터는 account 최상위 `mainCharacterId/mainCharacterExplicit`에 canonical player data로 저장하고, 기존 `profile.mainCharacterId/mainCharacterExplicit`에도 호환용으로 동일 값을 유지한다. 로그인 시 두 경로를 정규화하며 프로필 snapshot과 방 참가자 데이터는 canonical 값을 사용한다.
- 차징 최대 완료 점멸 링은 상태 버프/CC 점선 링보다 안쪽에 위치한다. 상태 링은 기존보다 바깥으로 키우고, 점멸 링 폭/반경은 줄여 `charge gauge < flash < status` 순서를 유지한다.
- 마스터 IV 이름 그라데이션 기능은 전부 폐기한다. 인게임 닉네임, 설정 프로필, 방 프로필, 캐릭터 카드 이름에 마스터 IV 색상 변경을 적용하지 않는다.
- 프로필 마스터 단계 로마 숫자는 프로필 사진 우상단 바깥에 `top:-2px/right:-3px`로 거의 붙여 표시한다.
- 마스터 IV 칭호는 마스터 IV/V에서만 표시하며 카드와 프로필 모두 노랑→보라 텍스트 그라데이션을 사용한다. 마스터 III 이하는 칭호 DOM을 생성하지 않거나 숨긴다.
- 최대 차징 점멸 링은 호 게이지의 바깥선과 상태 점선 링의 안쪽선 사이에 `nextRadius(charge,gauge,flash)`로 배치해 두 링 어느 쪽과도 겹치지 않는다.
- 프로필 우상단 마스터 로마 숫자는 `top:-2px/right:2px`로 프로필 사진 모서리에 가깝게 붙인다.
- 마스터 V는 현재 전용 보상이 없다. 월드 캐릭터 본체를 변경하는 마스터 V 전용 렌더 분기는 존재하지 않는다.
- 레코드 회피 FX의 기준은 사용자가 제공한 `듀얼즈(427)(3).html`이다. 마스터 프로필은 interval 46ms/count2/duration28f/spread20/active14/nearby5/sizeScale1.45/minSpacing20이며, 생성 위치/겹침 시 skip/4·5프레임 stagger/시작·이동·종료 생성까지 427 구현을 그대로 따른다. 마스터 렌더는 사각형이 아니라 427의 노랑·보라·주황 팔레트 육각형 홀로그램이며 별도 수평 glitch 소멸을 추가하지 않는다.
- 마스터 II 이상 저스트 회피 추가 이팩트는 캐릭터 위에 노랑→보라 큰 육각형 하나만 생성한다.
- 레코드 등급 회피 이팩트(`recordDodgeTrail`)는 월드 캐릭터 Entity 렌더 루프 직전에 전용 pre-pass로 한 번만 그린다. 후단 `this.fx` 렌더 루프에서는 해당 타입을 즉시 skip해 중복 렌더를 막는다. 따라서 다이아/플레티넘/마스터의 427 원본 회피 이팩트는 모두 캐릭터 아래에 표시되며, 저스트 회피/처치 등 별도 마스터 이팩트는 기존 후단 FX 레이어를 유지한다.
- 캐릭터 칭호 문구는 사용자 확정 목록을 그대로 사용한다. `mehugu`는 파일상의 메후구 캐릭터 ID이며 사용자 표기의 '메루구'에 지정한 `최고의 모험가`를 적용한다.
- 레코드 정산 직후 427과 동일한 독립 상단 토스트를 표시한다. `.record-delta-toast`는 top 86px, 7×13px padding, currentColor border/glow, 0.18초 등장 이동/페이드이며 2400ms 뒤 숨긴다. 문구는 `레코드 ±변동 · 이전점수 → 이후점수`, 증가 #7fffa0 / 감소 #ff8585 / 변화 없음 #aab6c2다. 라운드 결과 overlay 내부의 레코드 중복 문구는 표시하지 않는다.
- 레코드 점수에는 상한이 없다. 30000은 마스터 V 진입 기준일 뿐이며 이후에도 정상 라운드 정산, 프로필 snapshot, 개발자 레코드 조작을 통해 계속 누적된다.
- 캐릭터 칭호는 마스터 V 전용 보상이다. 마스터 IV 이하는 카드/프로필에 칭호가 표시되지 않는다. 캐릭터 카드 칭호 글자 크기는 10px이다.
- 마스터 III 이상 처치 이팩트는 처치 좌표에서 약 18px 위에 떠서 시작하고 수명 동안 추가로 10px 상승하며 약한 상하 부유를 적용해 바닥에 붙은 느낌을 줄인다.
- 마스터 V 칭호는 카드뿐 아니라 설정/방 프로필의 칭호에도 노랑→보라 background-clip 그라데이션을 사용한다. 캐릭터 카드의 이름과 칭호, 프로필 칭호는 font-weight 800이다.
- 마스터 III 처치 이팩트는 `-28px` 높이에서 시작해 수명 동안 추가 28px 상승하고 3.5px 부유하며, 보라→노랑 세로 잔광을 추가해 위로 떠오르는 움직임을 더 명확히 보여준다.
- 원격 레코드 회피 FX는 상태 미러의 `dodgeUntil/dodgeRemaining`만으로 자동 시작하지 않는다. 로컬 입력 또는 수신된 `duel-action:dodge`가 `EntityDodgeService.activate()`를 실행할 때만 시작한다.
- 시작/메인 화면의 `#duels3-account-chip`은 viewport 좌하단 `left:18px/bottom:14px`, `.duels3-account-version`은 viewport 우하단 `right:14px/bottom:10px`에 `position:fixed`로 고정한다. 페이지 스크롤/콘텐츠 이동에 따라 위치가 변하지 않는다.
- 상대 캐릭터 공개 카드의 닉네임 라벨(`between-ready-char-label`)은 해당 ownerPid의 팀 색상을 `TeamColorPresentationService.colorForPid()`로 사용한다.
- 게임 시작 증강 선택 화면의 캐릭터 공개 카드도 라운드 사이 공개 카드와 동일하게 owner pid의 팀 색상을 닉네임 라벨에 사용한다.
- 마스터 IV 승리 연출 `masterVictoryHexBloom`은 폭발/월계관을 사용하지 않는다. 승리 캐릭터의 현재 위치를 계속 추적하며 노랑→보라 큰 정육각형 하나가 약 18px에서 46px까지 커지고, 후반에는 9개의 가로 strip으로 분할되어 좌우로 어긋나며 홀로그램처럼 사라진다. 총 지속시간은 1050ms다.
- 프로필 칭호 그라데이션은 flex column 전체 폭이 아니라 실제 칭호 글자 폭에 맞춘다. `.room-profile-title/.duels-profile-title`은 `width:fit-content; align-self:flex-start`를 사용하고 Chromium에서 확실히 보이도록 `-webkit-text-fill-color:transparent`와 scoped `!important` background-clip 규칙을 사용한다.
- Entity 주변 링은 캐릭터에서 바깥쪽으로 `호 게이지 → 최대차징 점멸 링 → 버프/CC 점선 링 → 반격 활성 링` 순서를 사용한다. `BODY_GAP=5`, `INTER_RING_GAP=1`로 줄이고, 상태 링은 보이지 않는 안쪽 링의 공간을 예약하지 않는다. 따라서 호/점멸 링이 없으면 버프·CC 링이 캐릭터에 바로 붙고, 동시에 표시될 때만 실제 안쪽 링 바로 바깥에 이어진다. 반격 활성 링은 항상 현재 실제 최외곽 표시 링 바로 바깥 슬롯을 사용한다.
- 온라인 채팅 입력은 UI 화면과 분리된 `draftText` 상태를 사용한다. 입력 이벤트마다 최대 120자의 draft를 저장한다. 화면 자체가 전환되는 동안에는 `preserveAcrossScreenChange()`로 작성 상태를 이어가지만, 사용자가 `#chat-input-wrap` 이외 영역을 직접 클릭하면 현재 draft를 저장한 뒤 채팅창을 닫는다. 다시 열면 저장된 draft가 복원된다.
- 채팅 전송 성공 시 `lastSentText`에 마지막 문장을 저장하고 `restoreLastSentOnOpen=true`로 설정한다. 다음 채팅 open 시 작성 중 draft가 없으면 마지막 전송 문장을 입력창에 복원한 뒤 `setSelectionRange(0,length)`로 전체 선택한다. 새 입력을 시작하면 draft가 갱신되어 정상적으로 대체된다.
- 레코드 정산 토스트는 마스터 V 이후에도 `레코드 ±점수 · 이전 → 이후`를 그대로 표시한다.
- 저스트 회피의 80ms 판정 창은 `justCheck`의 geometry 상태와 별도로 `justDodgeStartedAt/justDodgeWindowUntil`에 저장한다. DOT·독·출혈·화염처럼 DamagePipeline에 직접 들어오는 피해 시도는 프레임 geometry 상태가 먼저 정리되었더라도 canonical 80ms 창 안이면 같은 `JustDodgeService.confirm()`으로 저회를 확정한다. 80ms 자체는 늘리지 않으며 회피 무적 110ms와 구분한다.
- 회피에는 별도 무적 시간이 없다. `GAME_DATA.dodge.justWindow=80ms` 하나가 저스트 회피 판정과 회피 피해 무시를 동시에 담당한다. 회피 이동은 130ms지만 80ms 이후에는 피해를 받을 수 있다. 기존 `듀얼즈(427)(3).html`에는 `invincible:110`이 실제로 있었으나 Duels 3에서는 폐기한다.
- 무력화 넉백 종료 후 추가 `neutralize` 지속시간은 피격 대상 HP가 아니라 무력화를 건 source의 현재 HP 비율 기준이다. source HP 100%=750ms, 0%=1500ms. 종료 시 source Entity를 조회하고 source가 사라졌다면 넉백 시작 시 저장한 동일 계산값을 fallback으로 사용한다.
- 채팅이 열린 상태에서 마우스로 클릭할 때 열린 상태를 유지하는 영역은 `#chat-input-wrap`뿐이다. 채팅 기록 영역을 포함해 그 밖의 화면을 클릭하면 `syncDraftFromInput()` 후 `OnlineChatService.close()`를 호출해 입력 내용은 보존하고 채팅창만 닫는다.
- 매치 내부 화면 전환(게임 시작, 라운드 준비, 매치 종료 후 같은 방 복귀)은 `OnlineChatService.preserveAcrossMatchTransition()`으로 채팅 openState, history, draft/입력값을 유지한다. `reset()`은 방 자체를 떠나거나 종료하는 실제 채팅 세션 종료에서만 사용한다.
- `delivery.area.applyHitEffects:true`는 self/ally처럼 비적대 관계에 피해를 주지 않고 동일 AttackSpec의 관계 필터된 onHit 효과만 적용하는 범용 옵션이다. `AttackModuleService.onHit()`의 효과 모듈은 선택적으로 `targetRelations`를 가질 수 있으며, 명시한 관계에서만 실행된다. delivery 모듈의 targetRelations는 전달 대상 선택만 담당한다.
- `modifier.set when:'on-hit'`은 `recipient:'source'|'target'|'source-and-target'`으로 버프 수신자를 지정한다. 비적대 `applyHitEffects`의 target 버프는 대상 권위 화면, source 버프는 공격자 권위 화면에서 같은 적중 geometry를 사용해 처리한다.
- 미아루키 반격 `attack.miaruky.counter`는 범위 300의 적대 원형 delivery로 baseDamage 100 × damageRatio 2.5 = 250 피해를 주고, 별도 self/ally 원형 delivery는 피해 없이 공구함 재생 부여량×10 회복만 적용한다. 반격의 `movement.neutralize-knockback`에는 `targetRelations:['enemy']`를 명시해 자신/아군에게 무력화 넉백이 적용되지 않는다. 설명은 `범위 내 아군 체력 {healAmount} 회복 및 적에게 피해 ({damage})`다.
- 리안 반격기 캐릭터 설명에서는 공통 반격 규칙인 `무력화 넉백` 문구를 중복 표기하지 않는다. 실제 `movement.neutralize-knockback` 기능은 그대로 유지한다.
- 리안 평타 `attack.lian.lmb`는 의미 태그 `평타`만 명시하고, 공격/사거리/히트스캔/공격형태/방어는 실제 수치와 모듈에서 자동 파생한다.
- 모든 AttackSpec은 의미 태그만 명시하고, 공격/사거리/전달형태/이동/방어/CC 등 자동 판별 가능한 태그는 TagService가 실제 수치와 모듈에서 파생한다.어/넉백/무력화 넉백.
- 라운드 레코드 정산은 서버 저장 완료를 기다리지 않고 `AccountState.current`와 `RoomService.localMember().profile`을 즉시 같은 최신 snapshot으로 갱신한다. 비동기 AccountService.save 응답이 뒤늦게 와도 현재 로컬 `characterRecords/characterStats`를 우선 merge해 이전 라운드 값으로 UI가 되감기지 않는다.
- 레코드/전적 변경은 `character-record-changed` 단일 이벤트를 발행한다. 캐릭터 카드 외곽선·마스터 단계·칭호·카드 툴팁 `[RECORD]`·훈련장 캐릭터 툴팁·인게임 캐릭터 HUD·설정 프로필·방 프로필·시작/라운드 준비 카드는 이 이벤트에서 즉시 최신 profile snapshot을 다시 읽는다.
- 레코드 라운드 중복 정산 방지는 단순 `roundToken`만 사용하지 않고 `matchGeneration:roundToken`을 사용한다. `RoomService.resetMatchRuntimeForSelection()`에서 새 매치가 시작될 때 `CharacterRecordProgressionService.reset()`을 호출해 이전 매치의 정산 캐시를 반드시 비운다.
- 온라인 레코드 변경은 `duel-record-update`로 해당 PID의 최신 characterRecords/characterStats/profile snapshot을 즉시 복제한다. 서버 저장 응답이나 다음 `duel-state`, 다음 화면 진입을 기다리지 않는다.
- 라운드 준비 `#between-char-grid` 캐릭터 카드는 `RoomService.localPid` 문자열을 account 인수로 넘기지 않고 `AccountState.current`를 사용한다. 툴팁의 `[RECORD]`도 같은 최신 점수를 명시적으로 전달한다. 준비 완료 공개 카드와 좌상단 로컬 HUD 역시 로컬일 때 stale room profile보다 최신 AccountState를 우선한다.
- 배치형 소환수 복구 호 게이지는 `EntityRingLayoutService.chargeRadius(owner)`와 `WIDTHS.gauge`를 실제 렌더에도 그대로 사용한다. 점멸 링은 `maxChargeFlashRadius()`의 다음 슬롯에 그려져 `호 게이지 → 점멸 링` 순서와 실제 반경이 일치한다. `readyFlashUntil`은 복구 완료 직후 마지막 500ms 구간에서만 점멸 상태로 취급한다.
- 리안 `attack.lian.shield-dash`는 평타 후 연계 공격이며 스턴샷 같은 `attack.tag('평타')` 기반 효과를 받아야 하므로 명시 태그에 `평타`를 포함한다. 현재 태그는 `스킬/평타/공격/근거리/이동기/공격형태 원/방어/넉백`이다.
- `movement.neutralize-knockback`은 최초 넉백 거리를 neutralize 상태에 보존한다. 넉백 종료 후 `phase:'recovery'` 무력화 상태인 대상이 실제 피해를 받으면, 해당 공격에 넉백 모듈이 있든 없든 `NeutralizingKnockbackService.followupHit()`가 공격자 반대 방향으로 최초 무력화 넉백 거리의 25%만큼 추가 넉백한다. 최초 넉백 이동 중(`phase:'knockback'`)에는 이 후속 넉백을 중복 적용하지 않는다.
- 캐릭터 카드 우클릭으로 연 상세/랭킹 상태는 화면 진입을 넘겨 보존하지 않는다. `Training.showSelect()` 진입 시 `CharacterRecordService.resetGridViews()`로 기존 카드의 `.char-record-detail`, detailMode/ranking 상태 클래스를 제거하고, `renderCharacterCards()`의 reusable 경로에서도 같은 초기화를 수행해 다시 들어올 때 항상 기본 카드 상태로 시작한다.
- 라운드 준비의 `#between-char-grid` 캐릭터 카드는 더 이상 독립 우클릭 동작을 갖지 않는다. 일반 캐릭터 선택 카드와 동일하게 `CharacterCardInteractionService.bind()`를 사용해 account 연결과 우클릭 `CharacterRecordService.cycle()`을 공유한다. 일반 카드 신규/재사용 경로도 같은 bind를 사용하며, 명시 바인딩된 카드가 contextmenu를 stopPropagation하므로 전역 fallback과 중복 실행되지 않는다.
- 라운드 준비 진입 시 `CharacterRecordService.resetGridViews()`로 이전 상세/랭킹 면을 지우고 각 새 카드도 `resetCardView()` 후 기본면에서 시작한다. 레코드 스타일/툴팁/우클릭 통계·랭킹은 모두 최신 `AccountState.current` 기준이다.
- 은신 상태의 월드 버프 표기는 `STEALTH`만 사용하며 ON/OFF 또는 퍼센트 수치를 붙이지 않는다. 은신 중 위치가 적에게 노출되면 캐릭터 왼쪽 공통 버프 목록에 빨간색 `STEALTH`를 TAB 없이 표시하고, 노출되지 않은 평상시에는 TAB 상세 목록에서만 흰색 `STEALTH`를 표시한다. 별도 `DETECTED` 월드 텍스트는 사용하지 않는다.
- 체리티 반격은 연막 field의 영역 내 STEALTH와 별개로 반격 발동 완료 시 자신에게 3000ms STEALTH와 이동속도 +30%를 각각 공통 BuffService selfModifier로 부여한다.
- 은신 중 적 시점의 월드 프레젠테이션은 StealthPresentationService의 동일 감지 판정을 사용한다. 감지되지 않은 적에게는 health-restored 회복 pulse/회복량 숫자를 재생하지 않으며, 감지되어 본체가 보이는 순간에는 체력바·스테미나바·상태링 등 Entity 월드 UI도 함께 표시한다.
- 은신 중 행동 노출은 기존 스야 규칙을 공통화한다. 공격/스킬/반격/회피 사용 시 600ms, 실제 피해를 입으면 800ms 동안 적에게 일시 노출한다. 일시 노출은 캐릭터 전용 변수가 아니라 StealthPresentationService의 공통 타이머를 사용하며 온라인에서는 duel-presentation으로 같은 남은 시간을 동기화한다.
- ProjectileService의 모든 투사체 본체는 별도 주황 외곽 stroke를 추가하지 않는다. 기존 본체 fill/stroke 자체에 공통 주황 shadow glow만 적용해 윤곽선과 글로우를 중복 렌더하지 않는다.

3.1343: 소환수 AI 은신 인식 통일. SummonAIService에 canPerceiveEnemy를 추가해 은신 중이면서 소환수 자신의 감지 반경에도 들어오지 않았고 일시 노출도 아닌 적은 AI 타겟 후보에서 완전히 제외한다. nearestEnemy/nearestEnemyAround/engagedEnemy/적 회피 desperate 유지/피격 후 damageEscape가 같은 판정을 사용하므로 미발각 은신 적을 공격·추적·상대로 도주하지 않는다. SummonDeployService의 nearest-enemy 자동 타겟/자동 조준도 동일 판정을 재사용한다. 은신 적이 소환수의 revealRadius 안에 들어오거나 공격 등으로 temporarily revealed 상태가 되면 기존처럼 정상 인식한다. 캐릭터 ID 하드코딩 없음.

3.1342: 캐릭터 선택 정렬에 높은 난이도/낮은 난이도 추가. 파일 고정 콘텐츠인 CHARACTER_DIFFICULTY_DATA를 CharacterDifficultyService.level()로 읽어 difficulty-desc는 5→1, difficulty-asc는 1→5 순으로 정렬한다. 같은 난이도끼리는 기존 출시 순서 안정 정렬을 유지하며 선택한 모드는 기존 CharacterSortService localStorage 저장/복원 규칙을 그대로 사용한다.

3.1337: 라운드 준비 캐릭터 카드의 잔존 #between-char-grid 전용 구형 CSS를 제거해 선택 화면과 완전히 동일한 160×240 규칙을 사용한다. 카드 컨테이너는 화면 폭에 따라 카드 자체를 축소하지 않고 160px 고정 폭으로 줄바꿈한다. 증강 결과 표시도 AugmentSelectionCardViewService를 추가해 라운드 사이 선택 카드와 동일한 155×96 DOM/스타일을 재사용하며 상대방 획득 증강 결과의 별도 190×220 카드 렌더를 제거했다.

3.1336: 증강 선택 카드 규격을 3.1334 리사이즈 시 실제 표시되던 155×96 비율로 고정. 시작 증강/라운드 사이 증강 모두 155×96을 사용하고 한 줄 최대 5장으로 통일했다. MatchSelectionLayoutService의 초기 렌더/refresh가 동일한 155px 폭을 사용하도록 맞춰 창 크기 변경 전후 카드 비율이 달라지지 않는다. 캐릭터 카드는 최신 160×240 규격을 그대로 유지한다.

3.1333: 라운드 사이 준비 화면 다음 맵 미리보기 추가. 호스트가 beginBetween 진입 시 다음 라운드 맵을 한 번만 선택해 duel-between packet의 mapId로 모든 참가자/관전자에게 공유하며, 실제 MatchMapService.apply는 기존처럼 between-countdown 시작 시 수행한다. 준비 화면 우상단의 기존 인게임 미니맵 위치에 140px 폭 맵 프리뷰를 표시하고 선택된 맵의 실제 walls/worldWidth/worldHeight 데이터를 축소 렌더링하며 맵 이름을 함께 표시한다. 준비 완료 시 맵을 다시 추첨하지 않아 준비 화면에서 본 맵과 실제 다음 라운드 맵이 항상 일치한다.

기존 Duels 1대1 인게임 채팅
