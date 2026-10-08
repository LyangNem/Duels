# 캐릭터 데이터 계약

현재 공식 캐릭터 61명의 데이터는 src/data/characters/<id>.js에 각각 보관한다. 파일 내용은 캐릭터 객체 표현식이며 독립 실행 스크립트나 ESM이 아니다. 조립기가 index.json의 출시 순서로 합쳐 freezeCharacterData를 한 번 적용한다. 기존 characterValue/characterCount/characterSum/characterProduct 참조도 같은 원본 실행 문맥에서 해석한다.

| 필드 | 책임 |
|---|---|
| id/name/title/color/desc | 식별·표시 정보 |
| stats/classification | 능력치·분류 |
| attacks | 독립 AttackSpec: damageRatio, cost, cd, range, modules, tags |
| abilities | 입력·Trigger 조건·실행 연결·attackId |
| passives와 기타 상태/소환 설정 | 공통 기능의 설정 데이터 |
| tooltipSkills | 공격/설정 참조에 의한 설명 |

필드는 캐릭터마다 필요한 것만 존재한다. 분할 과정에서 필드명을 평준화하거나 기능을 삭제하지 않았다. 캐릭터 수치의 단일 원본은 이 파일이다. 피해/충돌/전송/렌더 구현을 이 파일로 복사하지 않는다. 컴파일은 기존 CharacterDataService가 담당하며 GAME_DATA.characters에서 기존 등록 경로를 사용한다.

## 향후 유저 캐릭터 연결
플레이어는 명령어·코드를 입력하지 않고 제공된 모듈을 고르고 값을 입력하고 연결한다. 미래 편집기는 직렬화 가능한 순수 데이터(schemaVersion, metadata, stats, attacks, abilities, passives 등)를 출력한다. 모듈 type/값/연결은 공통 모듈 카탈로그의 정의에 따른다. 함수, JavaScript 실행 문자열, eval, 임의 소스 주입은 데이터 형식에 넣지 않는다.

미래 구현 순서: 편집기 데이터 → 스키마/수치/참조/모듈 조합 검증 → 현재 공식 캐릭터 객체 형식으로 정규화 → CharacterDataService의 공통 컴파일 → 같은 Entity/Ability/Attack/피해/투사체 경로. 식별자는 공식 ID와 충돌하지 않는 네임스페이스를 사용한다. 원본 정의와 전투 중 상태는 분리하고, 공식 데이터의 동결·출시 순서·계정 호환성을 보존한다.

지금은 편집기·카탈로그·유저 데이터 로더·검증기·변환기·런타임 등록 기능을 구현하지 않았다. 미래 등록은 GAME_DATA 동결 이전에 통합할지 별도 레지스트리로 확장할지 검토해야 한다. 동결된 CHARACTER_DATA에 런타임으로 속성을 추가해서는 안 된다. 먼저 현재 데이터의 참조 해석·스펙 등록 경로를 공통 API로 확장한다. JSON의 Infinity 표현과 $ref 등의 참조도 버전이 있는 데이터 계약으로 정의할 필요가 있다.

기어 조합형 캐릭터는 gearSettings, wheelInput, ModeState 및 AttackSpec.attackFeatureTransform.mode-modules 데이터를 사용한다. 선택은 기존 모드 상태로 동기화하고 캐릭터 파일에 실행 코드를 넣지 않는다. classification.rangeLabel은 혼합 사거리 표시를 지원한다. worldEffectModules의 gearCluster는 effect.spawn을 거쳐 공통 ModeGearPresentationService가 표시한다.

선택적 aimPreview {input}은 현재 Ability가 해석한 공격의 상시 소유자 조준 미리보기다. gearCluster는 모드별 외곽 회전과 idleAlpha/useHoldMs/useFadeMs를 데이터로 조정한다. delivery.area의 centerPathFirstEnemy/centerPathHalfWidth는 비관통 직사각 경로의 첫 적에서 후속 원형 중심을 절단한다. projectile.impact.previewAttackIds/previewStopAtFirstEnemy는 종료 후속 공격의 미리보기만 해석하며 실제 착탄은 기존 reasonAttackIds로 실행한다.

## 상황 발명/장착 데이터
reactiveEquipment는 stateKey/initial/inputSlot, items의 무기값·진행 stateKey·required·Trigger, farAttackId가 참조하는 기준 AttackSpec 사거리와 급접근 기준 및 마지막 상황 기록을 받는다. equipment.situation + situation.flag는 기존 TriggerModuleService를 사용하며, 발견 기록은 ProgressStateService, 장착은 ModeStateService로 분리된다. equipment.select/discover·projectile.redirect/wall-relay·gauge.equipment-bank도 캐릭터 이름을 모르는 공통 모듈이다. gear.turnRadians로1회 전환의 회전각을 데이터로 정한다. 지오핀은 순수 데이터와 같은 CharacterDataService 컴파일 경로를 사용하며 편집기 구현은 추가하지 않았다. 구체적 파라미터·추가 이유는 GEOPIN.md를 따른다.

character.16: projectile.redirect의 on 복수 사건/벽·적 별도 전환 횟수/rangeGrowthRatios가 직렬화 가능한 값이다. 개인 range.equipment-thresholds 및 gauge.equipment-bank.columns/activeColor도 데이터로 조절한다. 마지막 조건은 발명 진행도/디버깅 장착과 독립적이며 저회 원인을 포함한다.

character.17: state.mode-is.invert로 모드 불일치 입력 제한. reactiveEquipment.farAttackId는 기준 사거리 원본을 참조한다(장착에 무관·이상 비교). 무적/저회 사건도 기존 equipment.situation을 통해 진행도를 누적한다. projectile.redirect.on의 range는 사거리 끝 비접촉 적 조준이며 벽/적 증가율과 같은 횟수를 사용한다. geometry/충돌 경로/모드 분기는 캐릭터 실행 코드가 아닌 공통 서비스 책임이다.

character.18: 종점 range 재조준 기능은 제거했다. projectile.redirect.on은 실제 wall/hit 접촉만 사용한다. searchRadius:0은 실제 벽/적 접촉에서 사거리와 무관하게 가시 적을 탐색한다. 증가량 기준은 발사한 준비된 AttackSpec.range이며 이후 장착 상태와 독립적이다. 기존 공통 실행 모듈 확장으로 처리하며 사용자 캐릭터 제작 기능을 추가하지 않았다.

character.19: projectile.redirect.maxRedirects:0은 적 전환 무제한(maxWallRedirects:0과 같은 계약). 동일 탄환의 hitIds는 유지하여 대상별1회이며 총 이동 거리 제한은 유지한다. rangeGrowthRatios가 없거나 현재 증가율이0이면 사거리/페이드/증가 횟수를 변경하지 않는다. 후보 경로는 실제 wallCollisionPadding과 최초 적 접촉 거리를 검사한다. 충격 전달의 delivery.area.wallPolicy:ignore는 벽 관통 네모로 기존 공통 모듈을 사용한다.

character.20: projectile.redirect.rangeGrowthRatio는 매번 반복하는 고정 증가율이며 rangeGrowthRatios 배열보다 우선한다. rangeGrowthOn:[hit]는 적중에만 증가하고 wall을 제외한다. 증가 기준은 발사한 준비된 AttackSpec.range, 소비된 travel은 보존한다. 적중 증가는 다음 후보 탐색 전에 처리하여 마지막 적중도 포함한다. movement.knockback.direction:attack은 기존 공격 각도 기준이며 away-from-impact의 방사 방향과 다르다. 새 모듈 없음.

## 사거리 정렬 및 스타일 분류 메타데이터
일반 차징과 직접 조절 가능한 progressScale은 최대 도달 범위로 분류한다. 성장 상태에 따른 progressScale에만 `rangeBasis:"initial"`을 지정하여 시작 진행도로 계산한다. Ability 대체 공격 중 시작 직후 직접 전환 가능한 무기는 `rangeAvailableInitially:true`로 사거리 비교에 포함한다. 이 두 값은 정렬/카드 분류만 담당하며 실제 능력 사용 조건과 전투 수치를 변경하지 않는다. 발명/가호/파괴/처치/복잡한 조건을 달성해야 하는 대체 공격에는 즉시 전환 플래그를 지정하지 않는다. 캐릭터 ID 분기 없이 공통 CharacterSortService가 해석한다.

## 선택형 진행 공격 미적중 연계
기존 effect.spawn의 damage.hitMode:progressive-rect에서 damage.missAttackId를 명시하면 길이 진행 완료 시 미적중일 때 후속 AttackSpec을 한 번 실행한다. 원본 공격자 권위에서만 실행하고, 적중/방어 접촉·후속 투사체 반경으로 막힌 경로에서는 생성하지 않는다. 후속 delivery.projectile.origin:{type:point,x,y}는 유한 좌표일 때 공통 발사 원점으로 사용한다. 기존 triggered-attack의 AttackSpec 스냅샷으로 복제하며 Entity 좌표를 바꾸지 않는다.


## 단계별 다중 발사 및 이동 중 후속 공격
charge.pelletCount:{from,to}는 차징의 정규화 진행도에 따라 pattern.scatter.count를 보간/내림하여 단계별 발수를 정한다. 기존 비용/릴리스/미리보기/온라인 차징 진행도 복원 경로를 사용한다.
movement.move.progressAttacks는 {progress:0~1,attackId,targetPoint:"start",captureTrajectoryHeight:true} 목록이다. time.update 공통 Trigger를 통해 실제 이동 진행점에서 source 권위가 후속 AttackSpec을1회 실행하며, 취소/사망/원격 자체 재생은 추가 발사를 만들지 않는다. 긴 프레임도 지정 진행점에서 이동을 나눈다. 기존 duel-triggered-attack이 원점/목표/수치 스냅샷을 복제한다. trajectory.arc.startHeight는 시작높이에서착탄높이0까지의보간이며 기본값0이다. 시로의구체적조합/선택이유는 SIRO.md에있다.


character.107: charge.costStages [{progress,cost}]는 해당 진행도 이하 최대 임계값의 해제 비용, costTiming:release로 홀드 소모 없음. 부족하면 무소모/미발사 정리하며 증강 비용 배율 및 온라인 재생 정책 공유. trajectory.arc.apexHold(0~0.8, 기본0)는 sin 상승/하강 사이 최고점 체류 비율. previewProjectilePaths:true는 dynamicSpec의 실제 산탄 발수/방향/반경 경로를 표시하며 previewGeometry는 실제 피해 위치/범위 참조로 지정한다. 새 type/캐릭터 예외 없이 향후 값 입력 조합에 재사용.

character.109: charge.spread:{from,to}는 정규화 차징 진행도에 따른 pattern.scatter.spread 보간이며 실제 발사/온라인/미리보기가 동일 동적 모듈 사용. 미지정 시 기존 spread 유지. charge.preview:false/previewAtFull:true는 기존 진행도1부터만 미리보기 표시.

character.111: 차징 보간 pair의 선택형steps(양의 정수)는 정규화 진행도를 N등분 내림한 뒤 보간한다. 미지정은 기존 연속 보간. charge.spread{from:0,to:0.48,steps:2}는 진행도0/1/2에서0/0.24/0.48, 같은 단계의 실제 발사와 미리보기 폭 고정.

character.112: charge.stages [{progress,spec}]는 최고 충족 임계값의 고정 spec을 기존 fullSpec처럼 병합한다. 시로는 고정 모듈 전체를 직접 선택하고 연속 산탄 설정 없음. character.111의steps 보간 옵션은 폐기하고 기본lerp 복구. 기존 fullSpec/연속 차징은 유지.


## 공용 대상 종류 제외 조건 — 3.0.0-character.119

`target.kind-not-in`은 기존 Trigger condition에 `kinds` 배열을 지정하여 제외할 Entity 종류를 선언한다. target 없거나 잘못된 배열이면 false. 헤브 항시가 summon/trainingBot 제외에 사용한다. 조건은 회복/FX 등 모듈 체인 전체에 적용한다. 상태/피해 확정 패킷은 기존 Entity 대상 정보를 사용하고 별도 네트워크 필드를 추가하지 않는다. 다른 캐릭터의 조건부 효과에도 재사용할 수 있다. 기존 source.property 조건만으로는 target Entity 종류를 검사할 수 없어 대상용 공통 조건을 확장했다.


## 실제 전달 단계 모드 연출 — 3.0.0-character.120

mode.toggle when:on-delivery는 기존 공격 실행의 첫 실제 투사체 생성/범위 판정 실행에서 공용 Trigger event attack.delivery 조건을 검사한다. 효과 키는 AttackExecution에 보존해 산탄/반복/같은 실행 재호출로 회전이 중복되지 않는다. 선딜은 이미 공용 Delivery/Ability/Counter 예약이 담당하므로 모션용 별도 타이머나 캐릭터ID 분기를 만들지 않는다. 직접 전달 없는 이동 모션은 after-attack을 유지한다. 입력 공격 예약 단계에서 실제 공격을 알 수 없던 after-attack 시각 모드 실행을 이 옵션으로 확장했다. 기존 ModeState 원격 시간축/상태 snapshot을 재사용한다.


## 장판 이미지/사망 잔류 — 3.0.0-character.123

공통 field.exists의 activeOnly:true는 activeDuration으로 실제효과가유지되는장판만찾으며 미지정판정/입력제약은유지한다. 로온은 공용 weaponImage2개를 negate조건으로상호배타표시한다. 새무기는순수 WEAPON_IMAGE_DEFS에만추가한다. 사망무기는HealthService 실제사망직전표본/Presentation 사망확정/ModeGearPresentationService 공용잔류프리패스/EffectSpawnService.clearAll을사용한다. 상태리셋후장착모드를재해석하거나 사망본체를재표시하지않고 캡처한종류/좌표/각도/알파/차징을고정한다. 온라인은기존confirmed KO이벤트시각/마지막표시샘플로동일구조를사용하며 별도모드/실행/네트워크모듈은추가하지않는다.


## 상태 성공/피격자 연출 — 3.0.0-character.125

공용 effect.spawn presentationAuthority:target은 피격자 시뮬레이션 권위에서만 생성하고 기존 effect-spawn 패킷을 피격자 ID로 복제한다. 기본 공격자 권위는 그대로다. status.apply onAppliedEffects는 실제 apply 성공 뒤 기존 effect.spawn만 실행하므로 거절된 CC/미적중/회피에서는 빙결 성공 연출이 없다. 공격자/관전자 미러는 중복 생성하지 않는다. target.status-active-before-hit 공용 조건으로 분쇄가 상태를 지운 뒤에도 해당 타격의 빙결 타격 연출을 유지한다. 캐릭터 ID 분기/새 모듈 type/전용 렌더/새 네트워크 패킷 없음.
순수 캐릭터 데이터에서 무기 형상 목록과 기존 모션/반투명 옵션을 조합한다. 효과 목록은 status.apply.onAppliedEffects에 effect.spawn만 넣는다. 해당 목록은 CC 거절 시 실행하지 않는다. 피격자 권위 옵션은 on-hit/상태 성공 피격 연출에만 사용하며 공격 선딜/전달 연출의 기본 공격자 권위를 바꾸지 않는다.


## 무기 이미지 반응 — 3.0.0-character.126

weaponImagePulse는 effect.spawn의 순수 시각효과로 target:source를 사용해 공격자 무기 ID를 targetEntityId에 보존한다. EffectSpawnService 생성/기존 effect-spawn 복원에서 ModeGearPresentationService.react가 짧은 시각 상태만 갱신하고 렌더가 확대/알파반응을 읽는다. 별도 전투 모드/캐릭터 ID 분기/네트워크 패킷 없음. 피격자 권위로 보낸 효과도 원래 공격자 ID를 유지하여 해당 무기만 반응한다. 상태 성공 onAppliedEffects 공용 경로를 state.progress.onFull에도 연결해 실제 CC 성공에서만 실행하며 status.apply 성공도 같은 함수 사용. 거절/미적중에는 무기 반응 없음. 시간만료/clearAll에서 정리. 기존 전투 수치/모듈 판정/CC시간 변경 없음.
장착 무기는 기본72% 알파를 사용한다. 광택/베벨선은 추가하지 않으며 서리 대낫의 기존 빙면은 보존한다. 상태 성공과 기존 유효 피격 Trigger에서 기존 effect.spawn weaponImagePulse를 조합한다.


## 무기 이미지 잔향/페이지 — 3.0.0-character.127

weaponImageEcho는 기존 effect.spawn 순수 시각효과. EffectSpawnService 생성과 기존 effect-spawn 복원에서 owner targetEntityId로 실제 장착무기의 종류/각도/pose/알파 표본을 캡처한다. 공용 ModeGearPresentationService.drawEchoes가 본체 뒤에 확대/페이드하고 기본 무기 크기는 바꾸지 않는다. 같은 Entity 표시/은신 알파 적용·최대8잔향/수명만료/clearAll 정리. 별도 전투 모드나 캐릭터 ID 분기/새 네트워크 패킷 없음. 책 leaf는 순수 형상 옵션이며 공용 pose.pulse로만 페이지 경로를 움직인다. 전투 수치/판정/CC 지속시간 변경 없음.


## 공용 활동색/스파크/고정 잔향 — 3.0.0-character.128

공용 weaponImage activityColors는 mode.toggle on-delivery의 changedAt을 읽어 가장 최근 마법 색만 수명 내 적용. 기존 ModeState serialize/applyRemote 재사용·공용 tintedFill로 기존 명암을 유지해 해당 계열로 변환. sparkConditions는 기존 Trigger 조건 평가, WEAPON_IMAGE_DEFS.sparks는 순수 경로 목록. 사망/잔향 표본은 활성색/스파크까지 캡처. drawEchoes는 생성 좌표와 현재 좌표의 차이를 먼저 적용 후 표본 Entity/모션으로 렌더하여 생성점 고정. presentation.suppressHitImpactRing 옵션은 공통 피해 바인딩에서만 기본 피격 링을 제외·게임플레이 영향 없음. 캐릭터 ID 분기/새 전투 모듈/패킷 없음. 피해·CC·사거리·탄속·스테미나 변경 없음.


## 무기 활동색 페이드/제어효과/카논 — 3.0.0-character.129

공용 activityTint는 state changedAt 기반 duration/fadeMs와 Trigger 조건 기반 지속색을 지원하며 mixColor로 기존 면색/마법 계열과 기본/활성 윤곽을 보간. 표본 tintAmount도 캡처해 잔향/사망 중간색 고정. 카논은 기존 mode.toggle on-delivery·state.window after-attack·state.exists/absent activeOnly:true·TimedActionState 원격복원 조합이며 캐릭터 전용 렌더/새 모듈/패킷 없음. 무기제어 Echo/Pulse는 일반 FX fallback을 사용하지 않고 기존 수명/복제/clearAll과 공용무기 렌더만 사용. 피해/CC/사거리/스테미나/탄속 변경 없음.


## 무기 활동색 페이드/제어효과/카논 — 3.0.0-character.130

mode.toggle when:on-delivery everyDelivery:true는 각 실제 범위/투사체 전달마다 해당 모드의 changedAt/turns를 갱신한다. 미지정은 기존 실행당1회·산탄/반복 중복 제외 동작 유지. 루네프 번개색 상태에만 적용하고 책 사용모션은1회 유지·기존 ModeState 원격복원/색페이드 재사용. 카논은 effect.spawn weaponImageEcho after-attack을 기존 공격 성공 경로에 조합·state.window600ms 후 신발/주먹과 해당표본 자동선택. 기존 무기 잔향 위치고정/은신/복제/만료/clearAll 경로 재사용·새 캐릭터 ID 분기/모듈/네트워크 패킷 없음. 전투 수치/판정 변경 없음.


## 첫단계 차징링/초승달 공용계약 — 3.0.0-character.131

ChargedAttackService.flashReady/hasChargeFlash가 gauge.layers/flashAfterFirstLayer/maxChargeFlash를 기준으로 점선링 표시 임계값을 결정하며 EntityRingLayoutService가 동일 판정을 사용한다. 기존 isFull은 완전충전 의미 유지. 공용 weaponImage moon-crescent 형상과 state.exists activeOnly activityColors/기존ModeState 회전만 조합·클레아 스킬 지속시간을 복사하지 않고 실제 달 그림자 상태를 참조. 원격 상태/은신/사망페이드/60% 기본알파 재사용. 새로운 캐릭터 전용 렌더/전투모듈/네트워크패킷 없음·전투 수치 변경 없음.


## 첫단계 차징링/초승달 공용계약 — 3.0.0-character.132

캐릭터 순수무기 데이터와 공용형상만 수정. 카논의 표시 전용 mode.toggle/state.window/weaponImageEcho만 제거하고 제자리회피/타격/기절/이동 모듈 유지. 뉴 선은 저장된125 배포 형상에서 직접 복원하며 새 좌표를 추정하지 않는다. 기존 무기 투명도/은신/원격/사망페이드 경로 유지.


## 제자리 회피 표시 계약 — 3.0.0-character.133

제자리 회피 공용 상태 서비스의 stoppedEffects 데이터로 연출을 생성하고 기존 effect-spawn 원격 복제 사용. 원격 소유자 중복 생성 방지. 잔향 imageAlpha 선택값은 캡처에만 적용하며 기본 무기와 기존 잔향 투명도 유지. 전투 수치 및 판정은 유지.


## 무기 관절/소환수 표시 계약 — 3.0.0-character.134

무기 형상은 WEAPON_IMAGE_DEFS의 순수 데이터. 공용 parts의 angle/pulseAngle/scaleX/scaleY/pivot를 동일 pose.pulse로 렌더해 가위 관절 움직임을 조합. ModeGearPresentationService.configs는 소환수에는 summonSpec.worldEffectModules만 사용해 본체 이미지 중복 상속을 막으며 conditionTarget:owner로 주인 모드 조건을 읽는다. 엘린 summon.active/inactive와 state.mode-is, 디라 CookingService.syncReady의 기존 state.exists/absent를 사용하며 별도 모드/수치 복제 없음. 모션은 기존 mode.toggle on-delivery/after-attack 조합·선딜 전/실패/미전달 중복을 피한다. 기존 은신/원격 상태/전환효과/사망페이드 공용 경로 유지. 전투 수치/모듈 인덱스/판정 변경 없음.


## 선택 이미지 잔향/활동 알파/진행 단계 계약 — 3.0.0-character.135

CFOP 단계별 큐브는54개 면 조각의 회전으로 물리적으로 유효한 색상을 만든 뒤 순수 WEAPON_IMAGE_DEFS 경로로 저장. 십자가는 흰 아래면을 보이도록 시점을 뒤집어 표시, F2L부터는 노란 윗면/초록 앞면/빨강 옆면. 기존 quri-cube-stage의 progress-gte/lt 조건으로 이미지 하나만 선택·원격 진행 상태 사용·사망/잔향은 선택 형상에 고정. imageAlpha의 activityStateKey는 기존 ModeState 전달 시점만 읽어 불투명도 복원. 공용 echo의 선택 imageConfig는 이미 소비한 요리 등 명시한 이미지 하나를 캡처하며 sampleImage로 일반무기 표본과 같은 경로 사용. effect-spawn은 imageConfig와 생성 좌표를 유지해 원격 수신 뒤 주인이 이동해도 원래 위치에 잔향을 생성. 음식 투사체/회복/식재료·스테미나/피해/CC/사거리/모듈 인덱스 및 다른 무기 형상 유지.


## 무제한 백업/입력모션/방어모드 계약 — 3.0.0-character.136

캐릭터 데이터와 공용 순수형상만 조합. 기존 weaponImageEcho/on-hit/onAppliedEffects/after-attack으로 적중·빙결·요리 사용에 연결하고 현재 위치 표본을 고정·확대/페이드·원격복제/은신/사망페이드 유지. PositionMemoryService는 maxCount:null만 무제한, 기존 유한 상한 및 시간만료 유지. 공용 방어 성공 onBlock.modes는 기존 ModeState만 변경·같은 공격 그룹 중복제외. 공식 inputMotion은 정상 처리된 입력에만 기존 ModeState 모션 연결·자연회복 타이머 보존·회피차단/원거리/네트워크재생 중복 제외. 카논 excludedTargetKinds 검사 후 실행당 회복표시로 봇 타격이 플레이어 회복을 소모하지 않음. 큐브 단계 조건/27칸 좌표는 유지하고 색상만 단일계열 밝기로 변경.


## 표본색·치유 성공 연출 계약 — 3.0.0-character.137

공용 echo imageColor는 캡처 표본의 색/혼합비만 고정하고 기본 무기 색은 바꾸지 않음·effect-spawn 기존 복제에 옵션 전달. 카논은 기존 state.window operation:clear를 평타 after-attack에 조합. ResourceRestoreEffectService가 순수 onRestoredEffects를 HealthService에 전달하며 HealthService는 실제 restored>0에서만 해당 목록과 summonSpec.onHealedEffects를 공용 spawnAttackEffect로 실행. 피치유자 권위 presentationAuthority:target·기존 effect-spawn 복제·대상 위치 고정·은신/사망/수명 정리 재사용. 체력최대/회복배율0/원격 미러에는 새 잔향 없음. 캐릭터 ID 분기나 별도 렌더/패킷 없이 데이터로 연결. 전투 피해/사거리/스테미나/회복량 변경 없음.


## 투사체 존재에 따른 무기표시 계약 — 3.0.0-character.138

공용 WEAPON_IMAGE_DEFS 순수 경로/관절과 weaponImage 설정만 조합. 루뷰 실제 primary-weapon 투사체 상태를 공용 projectile.absent 조건으로 참조·귀환까지 존재하면 숨김·원격 pending networkKey도 포함해 투사체 수신 전 표시 깜빡임 예방. projectile.exists/absent는 ProjectileStateService.get 및 기존 원격 상태키를 조회하며 캐릭터 ID 분기/새 패킷/전용 렌더 없음. 공용 전환효과/은신/죽음 페이드/원격 ModeState 모션 유지. 클레아 스킬색/공격회전과 메이실 치명타 잔향/투척 유지. 전투 수치/피해/판정은 변경 없음.


## 형상 중심·회전 대기열 계약 — 3.0.0-character.139

형상 origin은 순수 좌표2개로 기본실루엣 경계 중심을 나타내고 drawImage가 회전 전 원점으로 보정·움직임/잔향/사망표본은 같은 공용 경로. ModeState module.queueRotationMs 및 config.rotationMode:queued는 기존 turns에 미완주 회전을 누적·회전 시작점/출발 turns/바퀴당 시간은 기존 modeStates snapshot으로 직렬화·원격 복원. 다른 무기의 기존 ease-out 회전 유지. 캐릭터 ID 분기/새 네트워크패킷/전용렌더 없이 데이터+공용서비스 조합. 하츠 드래그 시작/취소에는 모션 없고 실제 전달에 on-delivery 모드만 적용. 전투 수치/피해/사거리/스테미나/기존 은신·전환·사망페이드 유지.


## 회전 복원·공식 오입력 색 계약 — 3.0.0-character.140

공용 ModeStateService를138 상태로 복원하고 무기 renderer의 queued 분기 제거·139 origin 중심 정렬은 유지. 루뷰 on-delivery 기존모드로 완전회전, 하츠 스킬 effectsOnly after-attack 기존모드 조합. FormulaSequence 결과 wrong:true에서만 순수 inputErrorMotion 모드를 갱신·기존 activityColors 상태색/페이드 사용·회피차단/정상입력/원거리 클릭 제외·자연회복 타이머 보존. 캐릭터 ID 분기/새 패킷/전용렌더 없음·전투 수치/판정 유지.


## 실제 전달 무기 선택·색 동기화 — 3.0.0-character.141

기존 weaponImage 순수 형상과 모드상태 조합. on-delivery에서 mode.set도 기존 실행중복 방지 경로로 처리. 선딜레이 이전에는 무기 전환/모션하지 않음. 공용 pathFill로 면색 명도와 캐릭터색을 조합하고 캐시가 현재 색 변화에 갱신. preservePalette는 의도된 과육색 보존. 캐릭터 ID 분기/새 네트워크 패킷 없음.


## 일시 무기 표시조건 — 3.0.0-character.142

기존 weaponImage/관절/형상/모드/activityColors 재사용. state.mode-is에 선택적인 expiresAfterMs/ageStateKey/expiredValue를 추가해 저장된 모드 타임스탬프를 기준으로 일시적인 표시조건 평가. 표시 만료는 상태를 변이하지 않으며 타이머/새 패킷/캐릭터 ID 분기 없음. 베르 rmbBoost 실제 after-attack에서 모드색/모션/표시시간 갱신. 기존 전투 수치와 헤브 회복 대상 제한 유지.


## 공용 표시시간·손잡이 원점 — 3.0.0-character.143

CHARACTER_RULES.weaponPresentation.transientMs를800으로 단일정의하고 카논/베르 root참조와 $ref/$scale로 연결. 전투기절600ms는 변경하지 않고 표시창만800ms. 타우/메이실 on-hit effect.spawn weaponImageEcho만 삭제·치명피해/스파크 노랑/회전 유지. 기존 공용 형상·origin·관절·alpha·모드 선택·타임스탬프/원격복원만 사용. 베르 스킬재사용 노랑350ms 유지. 헤브 관통/매초 재타격/무력화넉백 유지.


## 제자리 회피 이미지·적중대상 조건 — 3.0.0-character.144

기존 stoppedEffects.weaponImageEcho의 명시적 imageConfig로 카논 평소 worldEffectModules 없이 단일회피 형상표본 캡처. 기본 반투명 무기 없음·실제 제자리회피/이동회피 정지보정1회/원격중복방지 기존공용 경로. 클레아 state.window on-hit에 기존 target.kind-not-in 조건 추가·거절은 실행효과를 소비하지 않아 같은공격의 뒤따른 플레이어적중 갱신가능. 슈비 평타용 motionStateKey 분리·스킬/반격 rotationStateKey 유지. 캐릭터전용 실행서비스/새패킷 없음.


## 유령모드 유지·투척무기 표시 — 3.0.0-character.145

전투 코드 변경 없이 기존 캐릭터 데이터 조합. 엘린 resetMode만 제거하여 모드/위치교환/주변폭발 유지. 카논 worldEffectModules에 dodge-slip 1개 등록하고 회피잔향 명시적 imageConfig 유지. 레비나는 기존 projectile.absent 조건으로 투척 상태를 읽어 별도 타이머/변수/패킷 없음. 자동권총/각진가위/삼지창은 WEAPON_IMAGE_DEFS 순수 형상.


## 공격 전달 회전·스킬타격 모션 — 3.0.0-character.146

기존 weaponImage rotationStateKey/motionStateKey와 mode.toggle on-delivery/after-attack 조합. 공격 전달 모션은 기존 실행중복방지로 산탄/반복delivery1회. 프릴 청소 progressRect 생성과 동일 after-attack에서 각 rmbTick 별 spin증가·시작/종료 선택에서는 회전없음. 좌우회전은 같은 mode상태의 step±1, 찌르기는 별도 mode키. 새전용렌더/서비스/패킷없음.


## 실제 탄별 모션·부분별 표본 — 3.0.0-character.147

공용 mode.toggle when:on-projectile-shot/perpendicularSide로 실제 spawn 후 해당측 상태만 갱신. 로컬 예약발사와 원격탄 재생이 기존 perpendicularOffset을 같은 공용spawn 입력으로 전달·새패킷 없음. 공용 weaponImage config.partMotions로 형상 parts별 모션 평가, sampleImage가 partPoses를 캡처하여 잔향/사망 표본에 고정. 베르 기존 공격당 전체권총모션 제거·공용 탄별실행과 모드원격복원 사용. 리안은 기존 after-attack mode.toggle 조합.


## 개별 권총 반동시간 — 3.0.0-character.148

기존 config.partMotions.motionMs 데이터만150ms로 조정. 실제탄별모드/원격복원/표본고정과 전투수치 유지. 이전 권총 회복 중 다른 권총이 발사될 수 있어 급한 강제복원을 피함.


## 코녕 꼬치 형상·실제공격모션 — 3.0.0-character.149

WEAPON_IMAGE_DEFS marshmallow-skewer 순수형상과 기존 weaponImage/motionStateKey/rotationStateKey. lmb/rmbImpact/counter on-delivery mode.toggle로 실제공격모션·실행중복방지·선딜전 모션없음. 캐릭터전용렌더/새서비스/패킷 없음·기존전투수치/판정 유지.


## 코녕 꼬치 재디자인 — 3.0.0-character.150

공용 WEAPON_IMAGE_DEFS의 marshmallow-skewer 순수 형상만 수정. 기존 캐릭터색/밝은 윤곽/투명도/손잡이 중앙/실제 공격 찌르기와 반격회전 유지. 전투 수치와 판정 변경 없음.


## 메이실 날카로운 절삭 모션 — 3.0.0-character.151

공용 weaponPose에 선택적 motionKeyframes(at/value/easing) 추가. 몸체와 가위 관절이 동일 pulse를 사용하며 미지정 무기는 기존 곡선 유지. 실제전달/실행중복방지/원격모드/잔향표본 그대로 사용. 디자인·피해·스테미나·연사속도·반격회전 유지.


## 엘린 재소환 체력·디라 원격 음식 연출 — 3.0.0-character.152

기존 summon respawnHealth 참조 및 cooking.meal-commit after-attack 공용 경로 사용. CookingService.commitMealThrow에서 시각적 투사체 구성과 로컬 자원변경의 권위 분리. 기존 duel-action targetEntityId/cookingMealCount와 scripted-projectile-arrived 로컬 회복 권위 재사용. 새패킷/캐릭터전용렌더 없음. 아군 음식투척은 기존 유도 경로 유지.


## 시로·헤브 전투 조정 — 3.0.0-character.153

캐릭터 데이터의 공용 movement.move opposite-aim/module.trajectory, field.wallPolicy ignore, projectile.pierce 및 기존 피해/자원 참조 사용. 스킬 projectile 생성 뒤 같은 after-attack에서 이동 시작·발사원점은 이동전. 반격 이동350/700ms·최고점발사/출발점 화살비/스테미나/피해 유지. 새서비스/패킷 없음.




## 시로 공용 점프·화살비 생성피해·장판 인식 — 3.0.0-character.154

기존 movement.move collision/buffs, projectile.impact attackIds 및 공용 delivery.area/targetKinds/neutralize-knockback 조합. 생성피해는 rainTick 피해/범위 참조·지속틱과 별도 실행. ReactiveEquipmentService.creationField가 area 공격의 field.area 또는 동일 impact에서 함께 실행되는 linked attack을 순수 모듈로 확인. interval>0/지속시간/피해장판만 인정·일반탄환 직격/비피해장판 제외·캐릭터ID/새패킷 없음.


## 시로 화살비 타격대상·매틱 무력화넉백 — 3.0.0-character.155

캐릭터 순수 데이터의 공용 delivery.area 관계필터와 movement.neutralize-knockback 사용. 생성피해는1회, 지속피해는 대상별500ms마다 반복하며 같은 field execution에 묶여 넉백이 최초1회만 발동하지 않도록 반복허용. 장판 소환/시간/피해/화염수치 유지·새서비스/패킷 없음.


## 라임 반격 무력화넉백 복구 — 3.0.0-character.156

캐릭터 순수데이터 기존 공용무력화넉백 조합만 변경. 투사체 자체가 아닌 실제피해를 주는 착탄범위 공격에 적용·캐릭터전용 분기/새서비스/패킷 없음.


## 전체 반격 CC 전수검수 — 3.0.0-character.157

순수 캐릭터 데이터 공용 movement.neutralize-knockback 조합. 기존 기절/속박/빙결/수면 및 강제이동 끌어당김 반격 유지. 둔화만으로는 예외취급하지 않음. 별도실행 귀환/폭발/비도에 효과 명시, 장판/귀환 반복은 oncePerExecution=false. 타다타 기존모듈 참조 인덱스 보정·추가 CC는 enemy 관계필터. 새서비스/패킷 없음.


## 큐리 확대·펠루나 대장장이 망치 — 3.0.0-character.158

WEAPON_IMAGE_DEFS 순수형상·기존 weaponImage motionStateKey/rotationStateKey/mode.toggle on-delivery 조합. 평타 선딜전에는 모션없음·실행당중복제외·기존원격모드복원/은신/사망페이드 유지. 펠루나 Infinity장판시간 유지·전투수치 변경없음·새서비스/패킷 없음.


## 펠루나 회전·단계색·코녕 선딜링 제거 — 3.0.0-character.159

기존 weaponImage rotationStateKey/mode.toggle on-delivery/activityColors 상태조건·색상참조 조합. 펠루나 찌르기모션키 제거·선딜전회전 없음·스킬 실제발사1회. 코녕 preview/선딜300ms/실제타격/후면꼬치모션 유지·시작장식링만 삭제. 전투수치/새서비스/패킷 변경없음.


## 펠루나 교차 쌍망치 — 3.0.0-character.160

동일 공용weaponImage 형상 두개/공유rotationStateKey·부호반전 rotationRadians 데이터만 조합. 두망치는 동일 실제전달시각/원격모드 복원/은신/사망페이드/단계색 사용. 전투수치·실행모듈 변경없음.


## 펠루나 추가망치 좌우반전 — 3.0.0-character.161

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치style만 교체. 전투/회전모드/네트워크 변경없음.


## 펠루나 소형 망치 리디자인 — 3.0.0-character.162

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.


## 펠루나 소형 망치 리디자인 — 3.0.0-character.163

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상 및 배치각만 교체. 전투/회전모드/네트워크 변경없음.


## 펠루나 소형 망치 리디자인 — 3.0.0-character.164

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.


## 펠루나 소형 망치 리디자인 — 3.0.0-character.165

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.


## 펠루나 소형 망치 리디자인 — 3.0.0-character.166

WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.


## 키네스·타다타 전투 조정 — 3.0.0-character.167

캐릭터 순수데이터 수치만 수정. 키네스 확장링 실제피해 delivery.area.range도 attacks.counter.range 참조로 통일하여 시각/타격 일치. 타다타 기존 공용투척·설명·미리보기 참조 유지.


## 헤브 이동속도·투사체 크기 — 3.0.0-character.168

헤브 순수데이터 및 공용 CHARACTER_RULES 이동속도 라벨 수정. 판정과 이미지크기 동일반경 참조 유지·탄속/피해/사거리/반격 변경없음.


## 시로·헤브 조정 및 레비나 넉백 — 3.0.0-character.169

캐릭터 순수데이터와 기존 공용모듈 조합. 시로500ms화염틱15로 초당30. 레비나 스킬3경로의 oncePerExecution=true 제거(false)하여 재사용된 투사체 실행의 넉백소비기록에 차단되지 않게 함. 타격중복 판정은 기존투사체가 담당.


## 레비나 삼지창 크기 축소 — 3.0.0-character.170

레비나 순수데이터 weaponImage.scale만 수정. 공용렌더/은신/사망페이드 유지.


## 레비나 크기·하푸푸 넉백 조정 — 3.0.0-character.171

캐릭터 순수데이터 weaponImage.scale 및 movement.knockback.distance만 수정. 기존 공용렌더·전투모듈 사용.


## 하푸푸 넉백 증가율 조정 — 3.0.0-character.172

하푸푸 순수데이터 movement.knockback.distance만 수정. 기존 공용전투모듈 사용.


## 헤브·시로 능력치 및 설명 — 3.0.0-character.173

캐릭터 순수데이터 및 헤브 체력 회귀기대값 변경. tooltip 값참조 유지.
