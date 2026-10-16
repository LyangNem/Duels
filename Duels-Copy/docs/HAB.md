## 최신 변경 — 3.0.0-character.121

레이카 가호 전후 대검의 좌표/경로/장식을 동일하게 맞추고 태양 장식을 원판과4개의 짧은 빛살로 단순화. 가호 하늘색 계열 면/밝은선/glow5 유지·가호 전용 큰 원/검날 마름모 장식 제거. 헤브 평타/스킬의 기존 weapon-projectile kind에 실제 공용 anchor-cross style을 연결해 일반 탄환 fallback을 수정. 반경14/18·피해/출혈/탄속/사거리/관통 유지·연결선 없음. 인투 권총은 기존 모드 상태를 motionStateKey로 읽어 시로와 동일한420ms 반동/복원 모션·산탄총/저격총 반시계 회전과 재장전 투명도 유지. 스야 서리 대낫과 타우 교차 사슬낫2개/체인/추의 순수 형상을 WEAPON_IMAGE_DEFS에 추가·공용 weaponImage로 후면 표시. 실제 공격 on-delivery의 mode.toggle로 스야 평타/반격 및 타우 일반/충전평타/스킬/반격 회전·선딜 대기 미발동. 기존 모듈/ModeState/은신/전환효과/원격snapshot 재사용·캐릭터 전용 실행/그리기/네트워크 코드 없음.

검증: 전체286회귀·Canvas16상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증. 아래 내용은 이전 버전 기록이다.

## 최신 변경 — 3.0.0-character.120

장착 무기의 mode.toggle을 선행 예약의 after-attack 대신 실제 투사체 생성/범위 실행의 on-delivery로 이전. 공통 AttackModuleService.onDelivery와 실행 effectKey로 첫 실제 전달에서1회 모션·산탄/반복 중복 제외·선딜 취소/사망은 미발동. AreaAttackService.execute/ProjectileService.spawn 실제 전달 경로가 실행하며 기존 Counter/Ability 선딜/원격 commit/ModeState snapshot 사용. 직접 전달 없는 시로 반격 점프 시작은 after-attack 유지·최고점 화살은 실제 생성 시 추가 모션. 레이카 확대 시 선도 배율 증가하던 문제를 공용 외곽1.8px/내부1.35px 상한으로 수정·가호 glow10→5. 모든 윤곽을 캐릭터/무기색+흰색65%의 밝은 계열로 통일. 뉴/레이카 손잡이를 면이 있는 그립·4줄 감김·끝마개로 교체·기존 작은 끝 장식 제거. 헤브 작살은 사용자가 선호한117 형상을 복원 후 날/축 비율과 면 그립/5줄 감김 정리. 인투 변환탄 강조를 남은 활성 탄창의 오른쪽부터 채움(highlightFrom:right), 개수/누적/소모/재장전 유지. 전체282회귀·build/docs/check/verify/runtime 구문 통과. Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.

아래 이전 버전 기록과 달라진 무기 표시 기준은 WEAPON IMAGE GUIDE.md를 따른다.

## 항시 대상 정책 최신화 — 3.0.0-character.119

피의 발자취는 target.kind-not-in(kinds:summon/trainingBot) 조건으로 소환수·훈련 봇에게 발동하지 않는다. 회복과 타격 링 모두 같은 Trigger로 차단. 플레이어·더미 출혈 타격의 최대 스테미나35% 회복, 비출혈/상태DOT/피해0 제외 유지. 실제 피격 권위 targetStatusTypes snapshot이 있어도 대상 종류 제한을 우회하지 않는다. 헤브12/전체279회귀 통과.

## 월드 무기 표시 최신화 — 3.0.0-character.117

월드 장식은 공용 weaponImage/WEAPON_IMAGE_DEFS로 이전했다. 단색 면과 밝은 선, 모션·투명도 설정은 WEAPON IMAGE GUIDE.md 참조. 작살의 큰 투척/회수 모션480ms. 공격 수치/피해 판정은 그대로다.

# 헤브 — 3.0.0-character.116

헤브(hab), 대양의 선장. HP1300, 이동 빠름(4.25), 고유 갈색#9a6848. 조건형 중거리 암살자. 공식62번째 캐릭터. 순수 데이터만 등록하며 앞으로 모듈 선택/값 입력으로 제작할 캐릭터 계약을 따른다.

## 사용자 지정과 초안 수치

HP/이동 등급/갈색/출혈 조건 최대 스테미나35% 회복/스킬 적 관통·넉백·출혈/반격 적과 벽 관통은 사용자 지정이다. 아래 피해·사거리·비용·시간·크기 및 난이도3은 미지정 수치의 초안이다. 반격 표현은 사용자 정정대로 커다란 범위 투사체이며 별도 배 렌더러를 만들지 않는다. 반격은 출혈 없이 공통 무력화 넉백을 적용한다.

| 공격 | 기본 피해 | 사거리 | 비용 | 간격 | 투사체 |
|---|---|---|---|---|---|
| 작살 | 200 | 650 | 250 | 500ms | 무기 투사체, 탄속32/프레임, 반경14 |
| 녀석을 노려! | 250 | 650 | 400 | 900ms | 무기 투사체, 탄속40/프레임, 반경18, 적 관통·벽 차단 |
| 출항이다! | 350/1초 | 맵 경계까지 | 0 | 공통 반격 선딜300ms | 범위 투사체, 탄속2/프레임, 반경300, 적·벽 관통·무력화 넉백84/10 |

Base Damage200×Damage Ratio1/1.25/1.75가 피해 원본이다. 평타/스킬 출혈 지속시간1000ms는 bleedDuration 한 원본을 참조한다. 반격에는 출혈이 없다. 출혈 피해/틱은 기존 공통 출혈 규칙을 그대로 쓴다. 추진 작살은 공격 방향으로180 넉백(속력14). 최초 평타650 기준 중거리 분류/정렬을 공통 시스템에서 자동 파생한다.

## 피의 발자취

기존 damage-dealt Trigger에 entity.alive/impact.direct/context.truthy(amount)/target.status-active(bleed) 조건을 조합하고 resource.restore(maxResourceRatio0.35,stamina,source)를 실행한다. 출혈을 처음 부여하는 타격에는 이미 출혈 중이 아니므로 회복하지 않는다. 출혈 대상의 다음 직접 타격부터 회복하며 출혈 지속 피해 자체는 회복하지 않는다. 소환수/더미도 같은 Entity·출혈 조건으로 판정한다. 최대 스테미나 증감과 회복 상한은 공통 StaminaService가 처리한다. 각 대상의 실제 타격별로 회복한다.

온라인은 피격 권위 클라이언트가 duel-hit-confirmed에 targetStatusTypes(피격 순간 활성 상태 이름)를 담고, 공격자 소유 클라이언트에서 상태 목록을 확정 피해 context로 전달한다. target.status-active는 이 목록이 있으면 현재 상태 미러/실행 표식보다 우선한다. 비출혈 첫 타격이 나중에 도착한 상태 미러 때문에 회복하거나 기존 출혈 타격이 늦은 미러 때문에 회복하지 못하는 문제를 방지한다. 목록 없는 구형 context는 기존 상태 검사 유지. 중복 패킷 회복은 기존 hitSequence 중복 방지 경로를 그대로 사용한다. 캐릭터 ID 분기나 전용 패킷은 없다.

## 분할과 재사용

hab.js는 수치·설명·AttackSpec·Ability·Trigger 데이터만 담당한다. 작살은 delivery.projectile/projectile.presentation(weapon-projectile), 추진 작살은 projectile.pierce 및 movement.knockback, 반격은 delivery.range-projectile/projectile.pierce/status.apply를 조합한다. 모든 적중은 기존 공통 피해/CC/저스트 회피/네트워크 권위 경로를 사용한다. 렌더러·FX 생성 경로를 새로 만들지 않는다. 새 모듈 type은 없다. 공통 확정 피해 context의 상태 snapshot 전달만 추가했다.

## 검증 및 실전 확인

헤브12개 실제 서비스 VM 회귀: 등록·색상·능력치,3종 발사·관통 정책,출혈1초 onHit,넉백 방향,최초 타격/다음 타격,최대 스테미나 변화·상한, DOT/피해0/사망/만료 제외,소환수/더미,반격 CC,설명 참조,권위 상태 우선,실제 확정 피해 패킷 송신/수신/중복 방지. 시로21개 및 기존 전체 합계253개 통과. build/docs/check/verify/runtime 구문 확인.

실제 브라우저 시각·두 기기 WebRTC는 미검증. 훈련장에서 헤브의 최초 작살→출혈 대상 후속 타격 회복, 두 적을 관통하는 스킬과 벽 차단, 반격 대형 투사체의 적·벽 관통을 확인한다. 온라인에서는 첫 타격 미회복/출혈 중 후속 타격 회복과 양쪽 대형 투사체 표시를 확인한다. 시로 홀드400ms/800ms에서 좁아진2/3발 산탄 미리보기와 실제 발사각을 확인한다.


## character.114 조정
헤브의 모든 공격 출혈 지속시간4000→1000ms(bleedDuration 단일 원본), 피의 발자취 최대 스테미나 회복50→35%. 반격 delivery.range-projectile 탄속16→2(기존의1/8,87.5% 감소), 반경100→300(직경200→600,가로/세로3배). 크기는 공통 렌더와 충돌이 같은 모듈 반경을 참조. 기존 사거리750/피해350/적·벽 관통 유지. 새 모듈·캐릭터ID 실행 예외 없음. 헤브12·구조22회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저 시각/온라인 실전 미검증.


## character.115 평타 비용
헤브 평타 작살 스테미나 소모량150→250. AttackSpec.cost 단일 원본을 공통 소비/설명 경로가 참조한다. 순수 데이터 수치 변경이며 신규 모듈 없음. 헤브12회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 실전 미검증.


## character.116 반격·타격 효과·작살 표시
헤브 반격은 delivery.range-projectile.expireAtRange:false로 맵 경계까지 이동하고 rehitInterval1000으로 대상별1초 재타격. 출혈 모듈 제거·movement.neutralize-knockback(84/10)으로 교체. 출혈 중인 적에게 직접 피해를 줄 때 기존 hitImpactRing240ms를 대상 위치에 매 타격 표시·비출혈/DOT/피해0 제외. 인투 반격 저격총은 시간4초 대신 독립 progress 탄창4발(최초 반격 탄 포함)로 변경·일반 탄창 보존·4발 후 이전 권총/산탄총 복귀·RMB 강제 복귀 유지·저격 탄창4칸 하늘색. 레이카 검 평상시 표시·가호 시 #38bdf8 하늘색 및 광택/장식 강화·기존 회전 유지. 페이즈 저체력 강화 설명을 ALWAYS 불굴의 의지로 분리. 시로 활/헤브 작살은 기존 effect.spawn 월드 장식의 weaponSilhouette 스타일로 표시·mode.toggle 공격 모션 및 시로 charged-attack-state 시위 당김. 새 모듈 type/캐릭터ID 실행 예외 없음. 기존 CharacterTriggerEffectService에 effect.spawn 처리 및 ModeGearPresentationService에 범용 무기 스타일/팔레트/모션 옵션 확장. 전체265회귀 및 build/docs/check/verify/runtime 구문 통과. Canvas 무기 표시 확인, 실제 게임 브라우저/두 기기 WebRTC 미검증.
반격의 기존 AttackSpec.range750은 데이터 호환을 위해 유지하되 expireAtRange:false이므로 거리 만료가 아닌 실제 맵 경계에서 제거한다. rehitInterval의 기존 공통 hitExecution 경로가 매 피해 틱을 독립 실행으로 계산하여 무력화 넉백도 틱마다 적용된다. 출혈 타격 FX는 character damage-dealt Trigger의 같은 출혈/직접 피해 조건을 사용하고 AttackModuleService.spawnAttackEffect→EffectSpawnService로 생성/원격 복제한다. 작살 worldEffectModules의 motionStateKey는 실제 공격 후 mode.toggle의 changedAt으로 움직이며, 기존 모드 snapshot 시간축을 공유한다.
