# 캐릭터 데이터 계약

현재 공식 캐릭터 60명의 데이터는 src/data/characters/<id>.js에 각각 보관한다. 파일 내용은 캐릭터 객체 표현식이며 독립 실행 스크립트나 ESM이 아니다. 조립기가 index.json의 출시 순서로 합쳐 freezeCharacterData를 한 번 적용한다. 기존 characterValue/characterCount/characterSum/characterProduct 참조도 같은 원본 실행 문맥에서 해석한다.

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
