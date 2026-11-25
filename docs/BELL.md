## 벨 완충 아군 효과를 실제 판정에 직접 포함 — 3.0.0-character.377 (2026-11-02)

사용자 재보고: 완충 평타 아군 효과 미적용.376 단독 입력/기존 독립runtime 테스트는 통과하여 사용자 환경의 정확한 누락 경로는 확정하지 못함. 이전 검증은 직접 applyProgressiveDamage 호출과 차징 단계 복원 메타데이터가 있는 경로에 치우쳤음.
수정: 완충 progressRect.damage.extraModules에 아군전용 최대체력10%회복/500ms CC면역 모듈을 직접 담고, stage.spec의 별도 온힛 모듈은 제거. 실제 이펙트 판정 실행이 이 모듈을 소유·스냅샷 전달하므로 원격에서 baseAttack만 복원되더라도 지원효과가 보존됨. 기존 resolvedChargeProgress 복원도 유지. 공용 spawnAttackEffect는 선언한 damage.extraModules를 실행 증강 extraModules로 덮어쓰지 않고 병합. 새 전용 모듈/캐릭터ID 예외/패킷 종류 없음. 설명 참조 경로 갱신.
검증: 기존 벨 실제runtime·독립3runtime 온라인 통과. 추가 독립3runtime에서는 effect패킷의 chargeProgress 메타데이터를 의도적으로 제거하고 실제16ms compact/update 수명주기로 두 아군에게 각각10%회복+500ms면역·중복회복없음·시전자 미회복 확인. 기존 벽/줌 판정 회귀 및 build/docs/check/verify/runtime구문/ZIP CRC 통과. 실제 사용자 브라우저 환경 재현은 미완료.
대상: bell.js/AttackModuleService/test-bell-network375·docs/BELL/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 줌 좌표/벨 온라인 완충·적 이동/직선 벽판정 수정 — 3.0.0-character.376 (2026-11-02)

원인1: draw는 CameraFovService.scale를 곱했지만 mouseWorld는 spectatorZoom만 역변환했다.375에서 마우스도 반영됐다고 기록한 것은 잘못된 검증이었다. 기본배율.9→.8, mouseWorld가 같은 FOV·관전배율·화면흔들림 역변환. 티냐 pointerFor의 별도FOV나눗셈 제거, viewport가시성/가장자리클램프/화면HUD겹침/카메라경계도 확대된 실제 시야에 맞춤.
원인2: effect-spawn 스냅샷은 순환참조 방지를 위해 attack 자체를 제외하므로 상대 화면은 base LMB만 복원해 완충 아군회복·면역 모듈이 사라졌다. damage.resolvedChargeProgress 스칼라 전달 후 기존 ChargedAttackService.dynamicSpec로 단계 복원. 실제 대상권위 10%회복·500ms면역 확인.
원인3: 원격 적중 ACK의 source 효과 후처리가 module.targetRelations를 검사하지 않아 적에게 적중해도 ally전용movement가 실행됐다. 공용 ACK 루프에 같은 관계필터 추가. 아군구조는 유지, 적100피해 후 미이동.
원인4: 벽에 잘린 progressRect의 effect.range는150이지만 damage.module.range는450이라 피해가 시각보다 빠르거나 더 멀리 적용됐다. 또 대상 중심까지의 벽검사로 실제 그림에 걸친 몸체 적중이 무효화되고 축별박스 확장으로 끝모서리 허위적중이 났다. 진행형 피해는 실제 effect.range와 동일한 길이/진행률의 사각형-대상원 최소거리로 판정. 대상중심 추가벽검사는 제거, 렌더의 기존 벽클립 geometry 재사용. 월드0좌표를 falsy로 잃는 원점도 보정. 공용 progressive-rect 사용자 모두 적용.
무기: 둥근 울림통+길고 직선인 취구+상단 공기구멍+고리의 공용 호루라기 실루엣으로 새로 구성. 색/공통 투명도/모션 유지.
검증: 60개 회귀 중59개 최초통과, 티냐 격리fixture에 카메라/흔들림 의존성을 추가해 남은1개도통과. 실제runtime3배율 마우스 왕복·확대뷰경계, 벽너머 비가시미적중/벽끝 몸체 적중/모서리 허위적중 방지/공격도달 전 무피해, 독립3runtime 완충 effect패킷 회복·면역 및 적스킬 실제피해 ACK 미이동 확인. build/docs/check/verify/runtime구문/ZIP CRC 확인. 실제 두 브라우저 시각 검수 미실시.
대상: Training/TrainingWorldDrawService/WorldViewportVisibilityService/CircleFormationService/GAME_DATA/AttackModuleService/EffectSpawnService/NetworkHitAuthorityService/WEAPON_IMAGE_DEFS/관련회귀·docs/BELL/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 벨 구조 투사체·회복 개편/CC면역/시야 — 3.0.0-character.375 (2026-11-02)

벨 평타650→450(미지정 축소값), 기본 비용100·완충150 표기 분리. 완충1.5초 후 빨간 진행형 직선타격은 유지하며 아군에게 최대체력10% 회복+0.5초 CC면역. CC면역 획득 즉시 기존 상태 제거. 공용 미리보기 색 유지.
긴급 구조: 비용1000,650내 조준 대상에게 속도32/반경16 강유도 투사체 발사. 벽을 통과하며 지정 대상만 충돌. 아군·적을 모두 선택 가능, 포인터 거리 동률이면 아군 우선. 적에게100피해(미지정 초기값)만 주고 이동없음. 아군 적중 시300ms 벽통과 이동, 도착 시 선택 아군 최대체력40% 회복·2초 CC면역 및180반경 적100거리 일반넉백(미지정 초기값). 반격 회복은 시전자/적중아군 각각 본인 최대체력20%. 공용 호루라기 실루엣 재정리.
CC면역: COMBAT_BUFF_DEFS 선언형 clearAdverseOnApply로 BuffService add/set/refresh 때 기존CC/DOT·강제넉백 정리(부활 lifecycle 제외), 피해무적은 없음. CC IMMUNITY 명칭·캐릭터 왼쪽 평상시 compact 버프 표시. 기본 카메라 배율.9(미지정 초기값)로10%줌아웃; 공용 scale로 렌더/마우스좌표 함께 반영.
공용 target.select 관계우선순위 옵션 추가, 아군 투사체 온힛의 로컬 시전자 movement.move 허용 및 이동완료 대상ID 전달. 기존 대상권위 회복·네트워크 triggered-attack 재사용. 캐릭터ID 분기/새패킷 없음.
검증: 실제runtime 비용1000/발사직후 미이동/아군적중 이동/도착40%·면역/적100·미이동/동률아군/벽통과/도착넉백/완충10%·500ms종료/기존CC제거·상시라벨/기본scale.9/반격각각20% 통과. 독립3runtime 실제 패킷으로 도착40% 및 반격양쪽20% 중복없음 확인. 파비벽/지오핀후속탄/벨진행형 회귀·build/docs/check/verify/runtime구문/ZIP CRC 확인. 실제 브라우저 시각검수 미실시.
대상: bell/공용 선택·온힛·버프·표시·카메라·무기데이터/벨회귀·docs/BELL/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 벨 완충 평타 미리보기 — 3.0.0-character.374 (2026-11-02)

벨 LMB charge.preview false/previewAtFull true로 공용 완충 미리보기 정책 사용. 홀드1500ms 전까지 미리보기 없음, 완료 즉시 빨간 직선 공격 미리보기. 차징 호게이지·실제 공격·정화·비용 유지. 공용 코드 변경 없음.
검증: 실제 입력0/1499ms 미리보기 없음·1500ms 생성·완충 빨강 spec·해제 후 제거 확인. 벨 진행형 평타 회귀와 build/docs/check/verify/runtime구문/ZIP CRC 통과. 실제 브라우저 시각검수 미실시.
대상: bell.js·docs/BELL/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 벨 우클릭 아군 선택 범위 점선 — 3.0.0-character.373 (2026-11-02)

긴급 구조의 target.select에 showTargetRange 선언. 본인 화면에서 실제 지정 가능한 살아있는 아군 주변에 디라 음식과 같은 색상알파.55/선1.8/점선7·6 원 표시. 선택반경80+대상 몸체반경(기본100)을 그대로 사용하며 시전자 자신/적/사망/650밖/벽 차단 대상 제외.
기존 AbilityModuleService의 target.select 유효성·선택반경 계산을 공통 메서드로 추출해 입력/렌더가 같은 기준 사용. 공용 AbilityTargetRangePresentationService는 선언한 선택 모듈만 렌더. 캐릭터 전용 분기·네트워크 패킷 없음. 디라 기존 음식 표시는 유지.
검증: 실제runtime 유효아군 원1개/반경100, 사거리밖·사망·적·벽차단·원격시전자 원0개 확인. 벨 기존/독립3runtime 온라인/진행형 평타 회귀 및 build/docs/check/verify/runtime구문/ZIP CRC 통과. 실제 브라우저 시각검수 미실시.
대상: bell.js/AbilityModuleService/AbilityTargetRangePresentationService/Training·docs/BELL/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 벨 직선 진행형 평타·완충 빨강 — 3.0.0-character.372 (2026-11-02)

벨 부채꼴 즉시평타를 샤베트의 공용 progressRect/effect.spawn 조합으로 변경. 사거리650/반너비52/전개속도3000, 실제 도달 시100피해. 차징1500ms/비용100·완충150/쿨400ms 유지. 완충 공격 채움·윤곽·미리보기는 빨강#ff6565, 일반/미완충은 벨 색. 아군 정화도 같은 직선 진행 도달 시 적용.
공용 progressive-rect의 명시적 targetRelations/applyHitEffects로 아군 무피해 온힛 지원. 기존 enemy 타격/권위 경로 유지, 아군 효과는 대상 권위에서만 적용. 새 캐릭터 전용 분기 없음. 기존 모듈은 적만 순회해 아군 도달 정화를 표현하지 못했으므로 기존 관계/온힛 정책을 재사용해 확장.
검증: 기본/1499ms/1500ms 실제 입력과 progressRect 도달 전 무피해·미정화/도달 후100 한 번/완충 아군 무피해 정화/벽 차단/채움·윤곽색 확인. 벨 기존/독립3runtime 온라인·파비 벽·지오핀 후속탄 회귀 통과. build/docs/check/verify/runtime구문/ZIP CRC 확인. 실제 브라우저 시각 검수 미실시.
대상: bell.js/EffectSpawnService/test-bell370/test-bell-whistle372/docs/BELL·README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

# 벨 · 구조 대원

설산에서 구조 임무를 맡은 족제비 수인. 지속전투형 중거리 서포터.

| 항목 | 초기 수치 |
|---|---|
| 체력 / 이동속도 | 900 / 빠름(4.25) |
| 색상 / 난이도 | #e8e6d9 / 2 |
| 평타 | 사거리650, 피해100, 비용100, 쿨0.4초 |
| 평타 홀드 | 1.5초 완충, 비용150. 적에게 동일 피해, 아군 상태이상 제거 |
| 긴급 구조 | 지정 아군 위치로0.3초 이동, 도착 시 해당 아군200회복·상태이상 면역2초. 비용400, 쿨1.5초, 사거리650 |
| 마약성 진통제 | 선딜0.3초 후 약물 투사체. 적150피해·무력화 넉백, 아군 무피해. 적중 시 자신400회복·면역2초, 맞은 아군도400회복·면역2초 |

피해/회복/소모량/사거리/난이도는 미지정 초기값. 반격기는 사용자 진행 요청에 따라 일회 약물 발사형으로 구현했다. 빗나가면 회복·면역이 없다. 상태이상 면역은 피해 무적이 아니며 기존 상태를 자동 정화하지 않는다.

## 모듈 연결

- LMB 입력: 공용 차징 시작/릴리스 → AttackSpec 단계 → 적대 음파 범위 + 완충 시 아군 전용 무피해 범위/정화.
- RMB 입력: 공용 target.select → movement.move → onEndAttackIds → 선택 ID가 보존된 rescueAid 범위 전달 → 대상 권위 회복/면역.
- 반격: 공용 counter.execute → 아군/적 공통 투사체 → 관계 필터된 resource.restore/modifier.set. 적에게만 공용 반격CC.
- 상태 면역: 기존 buffs/snapshot/버프 UI에 statusImmunity 등록. CCService에서 부활·자기 제한을 제외한 신규 상태를 차단한다.
- 무기: 공용 rescue-whistle 벡터 정의와 worldEffectModules로 동작한다.

## 검증

`node tools/test-bell370.cjs`, `node tools/test-bell-network370.cjs`. 전체55회귀 통과. 실제 브라우저/WebRTC 시각 검수는 별도 필요.
