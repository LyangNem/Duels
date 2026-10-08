## 최신 변경 — 3.0.0-character.120

장착 무기의 mode.toggle을 선행 예약의 after-attack 대신 실제 투사체 생성/범위 실행의 on-delivery로 이전. 공통 AttackModuleService.onDelivery와 실행 effectKey로 첫 실제 전달에서1회 모션·산탄/반복 중복 제외·선딜 취소/사망은 미발동. AreaAttackService.execute/ProjectileService.spawn 실제 전달 경로가 실행하며 기존 Counter/Ability 선딜/원격 commit/ModeState snapshot 사용. 직접 전달 없는 시로 반격 점프 시작은 after-attack 유지·최고점 화살은 실제 생성 시 추가 모션. 레이카 확대 시 선도 배율 증가하던 문제를 공용 외곽1.8px/내부1.35px 상한으로 수정·가호 glow10→5. 모든 윤곽을 캐릭터/무기색+흰색65%의 밝은 계열로 통일. 뉴/레이카 손잡이를 면이 있는 그립·4줄 감김·끝마개로 교체·기존 작은 끝 장식 제거. 헤브 작살은 사용자가 선호한117 형상을 복원 후 날/축 비율과 면 그립/5줄 감김 정리. 인투 변환탄 강조를 남은 활성 탄창의 오른쪽부터 채움(highlightFrom:right), 개수/누적/소모/재장전 유지. 전체282회귀·build/docs/check/verify/runtime 구문 통과. Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.

아래 이전 버전 기록과 달라진 무기 표시 기준은 WEAPON IMAGE GUIDE.md를 따른다.

## 최신 변경 — 3.0.0-character.118

시로 활을 폭이 좁고 끝이 뾰족한 날렵한 곡선으로 조정·차징 화살 미표시 유지. 반격 counterArrow 실제 발사(점프 최고점)에도 기존 mode.toggle siro-weapon-motion을 실행하여 점프 시작/화살 발사에 각각 모션. 인투 총3종·뉴/레이카 검·헤브 작살·반 양쪽 턱 스패너·지오핀 기어의 .116 형상/팔레트를 공용 WEAPON_IMAGE_DEFS에 복원. 뉴/레이카 손잡이 폭.23→.16·끝 장식62% 크기 및 낮은 대비, 레이카 확대1.85와 가호 하늘색 유지. 단색 강제 규칙 철회·같은 계열 명암/장식색 허용, 공용 weaponImage/모션/재장전 반투명 구조 유지. 인투 기존12칸 탄창은 남은 변환탄 수만큼만 앞쪽 활성 칸을 하늘색, 나머지는 기존 색. 반격4발 누적/실제발사1발 소비/재장전 잔량 유지/RMB 강제복귀 유지. gauge.segmented 공용 highlightCountRef/highlightColor를 추가하고 색 변형은 렌더 인자로 전달해 프레임마다 segment 배열을 복제하지 않음. 전체274회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.

아래 이전 버전 내용은 당시 기록이다. 현재 공용 규칙은 WEAPON IMAGE GUIDE.md를 따른다.

## 월드 무기 표시 최신화 — 3.0.0-character.117

월드 장식은 공용 weaponImage/WEAPON_IMAGE_DEFS로 이전했다. 단색 면과 밝은 선, 모션·투명도 설정은 WEAPON IMAGE GUIDE.md 참조. 활 차징 화살 제거·시위 당김과 큰 발사/복원 모션420ms. 공격 수치/피해 판정은 그대로다.

# 시로 — 3.0.0-character.116

시로(siro), 토끼 궁수. 체력1100, 매우 빠름4.5, 적색 #f05c68(기존 캐릭터 색상과 동일값 없음). 파워형 초장거리 저격수. 공식61번째 순수 데이터 캐릭터이며 향후 값 입력/모듈 조합 캐릭터 계약을 따른다.

## 초기 수치

사용자가 정하지 않은 피해·비용·사거리·시간은 기존 체리티/루네프/페이즈/셰리나의 전달/차징/점프 형식을 참고한 초안이다. 화염 피해는 공통 BURN에 data.flat25/interval500을 지정하여 초당50 피해를 주며 지속시간은 burnDuration4000 한 원본을 참조한다.

| 공격 | 피해 | 사거리/범위 | 스테미나 | 시간 |
|---|---|---|---|---|
| 파이어 애로우 | 100 | 800, 탄속42/프레임, 반경12 | 150 | 쿨600ms, 화염4초 |
| 다중 사격 | 탄당100 | 800, 산탄 전체각1단계0.08rad→2단계0.16rad·일반 원형 투사체 | 발사 시250/350 | 400ms에서2발,800ms에서3발; 화염4초 |
| 백드래프트 | 폭발200 | 화살800/속력34/반경14, 폭발반경140 | 400 | 쿨900ms, 넉백140/속력12,화염4초 |
| 토끼뜀 | 화살 비100/틱 | 전방 점프350, 화살 비반경150 | 0 | 반격선딜300ms, 점프700ms/높이140, 최고점140ms체류·350ms에발사 |
| 화살 비 | 100/500ms | 착탄지점 원형, 적만 타격 | 추가0 | 장판3초, 진입 즉시첫타; 적중마다 화염4초 갱신 |

다중 사격은 기존 인투 산탄총과 같은 pattern.scatter + delivery.projectile 일반 산탄이다. hit.once-per-execution을 제거하여 각 탄환이 독립 피해100을 주며 같은 적에게 여러 탄환이 맞을 수 있다. 일반 클릭은1발/150소모, 400ms~799ms는2발/250소모, 800ms이상은3발/350소모. 홀드 중에는 자원을 소모하지 않고 스테미나 자연회복도 막지 않는다. 발사 시 선택 단계 비용이 부족하면 무소모로 발사하지 않고 차징/미리보기를 정리한다. 차징 미리보기는 같은 dynamicSpec의 실제 산탄 각도/발수/사거리/반경으로 매 업데이트 갱신한다.현재 평타800이 초기 정렬/스타일의 원거리 기준이다.

백드래프트는 본체가 접촉을 감지하지만 직접 피해를 중복 적용하지 않고 실제 적/벽/경계/사거리 끝 착탄에서 폭발한다. 폭발의 판정과 표시가 공통 벽 차단을 사용하며 중심에서 바깥으로 넉백한다. 방패가 투사체를 소거하거나 화살을 저회하면 기존 공통 소거 정책에 따라 후속 폭발을 생성하지 않는다.

토끼뜀의 조준 방향은 반격 선딜 종료 시 확정된다. 이동 시작 좌표를 저장하고 최고점에서 그곳을 향해 별도 화살을 발사한다. 화살은250ms에 착탄하며 비행 중 적 접촉 없이 지상 장판으로 피해를 준다. 점프 중 비타격 무적은 기존 페이즈 점프 정책을 재사용한다. 점프 경로선은 별도 표시하지 않는다. 이동 취소/사망/원격 미러는 최고점 화살을 자체 중복 발사하지 않는다.

## 모듈 책임과 실제 사용

| 기존 모듈/서비스 | 역할 및 조절값 | 시로의 사용 |
|---|---|---|
| Trigger/input.press/input.release | 슬롯·생존·행동·대기·상태 조건 뒤 실행 | LMB차징 시작/해제, RMB공격, 반격준비 확인 |
| charge.attack.start/release | 누른 시간·소모·호·실제 해제 공격 | 800ms/2층/발사 비용150·250·350, preview:false/previewAtFull:true/previewProjectilePaths:true |
| pattern.scatter | 발수와 전체 산탄각 | 1/2/3발, 전체각0/0.08/0.16; charge.stages로 고정 구성 선택 |
| delivery.projectile | 이동·속도·반경·접촉·지정점 도착 | 평타42/12; 스킬34/14; 반격화살 targetPoint/250ms/12 |
| status.apply | 공통 CC/DOT 적용·수명/갱신 | burn4000/tickAtEnd/refresh-type; 피해/상태 파이프라인 공유 |
| projectile.impact | 실제 종료점 후속 공격/장판 | RMB 원형 폭발; 반격 착탄 화살 비 |
| delivery.area | 실제 원형 히트스캔·벽 차단 | 폭발반경140, wallPolicy:block |
| movement.knockback | 대상 넉백 방향/거리/속도 | 백드래프트 away-from-impact/140/12 |
| counter.execute | 반격준비 소비·300ms 선딜·CC 검증 | ccRefAttackId=rainTick의 화염 |
| movement.move | 공통 자기 이동·충돌·행동잠금 | forward350/700ms, 벽/적 통과, 종료겹침해결 |
| trajectory.arc | 공중 높이·오프셋/알파·크기 | 점프140/최고점 체류0.2/화면높이비0.55; 화살은 캡처높이→0 |
| field.area | 고정지점·팀관계·개별대상틱·수명·공통표시/복제 | 반경150/3000ms/500ms/적만/벽차단, 기존 areaCircle |

공통 화살/폭발/장판 표현을 사용한다. 캐릭터 전용 FX 렌더러·네트워크 패킷·별도 피해 경로를 추가하지 않는다.

## 기존 모듈의 범용 확장

새 모듈 type은 없다. 기존 charge.fullSpec은 한 임계값 전환만 지원해 두 단계 발수 증가를 표현하지 못하므로 ChargedAttackService.dynamicSpec에 선택형 charge.pelletCount {from,to}를 추가했다. 정규화 진행도 보간의 내림값을 기존 pattern.scatter.count로 사용한다. 다른 단계별 산탄/다중발사 차징도 같은 옵션을 쓸 수 있다.

기존 movement.move.onEndAttackIds는 착지 후만 실행하므로 최고점 발사에 사용하지 않았다. 선택형 progressAttacks {progress,attackId,targetPoint,captureTrajectoryHeight}로 이동 진행 위치에서1회 후속 공격한다. 기존 time.update Trigger와 생존/진행도 context 조건 및 TriggeredAttackService를 사용한다. source 권위에서만 실행하며 기존 duel-triggered-attack이 실제 원점/목표/AttackSpec을 복제한다. 긴 프레임 이동도 임계점에서 나누어 정확한 최고점 원점을 보존한다. 선택 설정이 없으면 진행도 공격 배열/후속 객체를 만들지 않는다.

기존 trajectory.arc의 startHeight 선택값은 캡처한 공중 시작 높이에서 도착높이0까지 보간한다. XY 전투 위치는 변경하지 않는다. 공중에서 던지는 다른 공격도 재사용할 수 있다. 기본값0으로 이전 점프/투척 궤적을 보존한다.

## 검증 및 직접 테스트

자동: 시로20회귀(차징399/400/799/800ms·발사 비용/홀드 무소모/취소·착탄1회/중심·정확한 최고점/긴프레임·출발점·취소/사망/원격·온라인스냅샷·장판틱·설명참조), 기존 전체 회귀, build/docs/check/verify/runtime 구문.

실제 브라우저 시각·두 기기 WebRTC는 미검증. 훈련장 시로로 클릭1발/홀드2·3발, 벽/방패/저회에서 백드래프트, 토끼뜀 최고점→출발지 착탄/3초 화살 비를 테스트한다. 온라인 상대 화면에서 반격 화살·장판이 한 번씩 보이고 장판 피격으로 화염이 적용되는지 확인한다. 체리티 차징, 페이즈 점프, 라임/레이카 이동접촉 공격도 공통 변경의 실전 회귀 대상이다.


## character.107 공통 옵션 및 미리보기

charge.costStages:[{progress,cost}]는 해당 진행도 이하의 가장 높은 임계값 비용을 발사 순간 적용한다. 시로는0:150/1:250/2:350, costTiming:release, staminaRegenDuringCharge:true. 기존 fullCost는 단일 최대 단계만 표현하고 기존 costMin~costMax 보간은 중간값 비용을 만들어 세 단계 비용을 표현할 수 없으므로 기존 ChargedAttackService에 선택형 표만 확장했다. 다른 여러 단계 차징도 같은 데이터로 재사용한다. 연속 소모/단일 최대 비용형 기존 캐릭터 동작을 유지한다.

trajectory.arc.apexHold는 전체 진행도에서 최고점에 머무는 비율(0~0.8)이다. 상승/하강 sin 구간의 끝 기울기를0으로 유지하여 체류 전후 연결을 부드럽게 한다. 시로0.2/700ms로140ms 체류, 높이140/화면비0.55로 실제 화면 최고 높이77px. 단순 height/duration만으로 최고점 체류를 표현할 수 없어 기존 궤적 샘플러의 선택형 옵션으로 확장했다. 옵션이 없는 기존 페이즈/지오핀/투척은 종전 sin 궤적이다. 실제 XY 충돌·이동·출발 위치·중간 발사 권위는 기존 공통 서비스이며 원격도 같은 모듈을 받는다.

반격은 이동 경로에 피해가 없고 출발 위치에만 화살 비가 떨어진다. previewGeometry는 rainTick.range 및 counterArrow의 field.wallPolicy 원본 참조로 출발지 원을 공용 벽 절단 미리보기로 표시한다. 이동 거리350을 공격 범위로 잘못 표시하지 않는다. LMB previewProjectilePaths는 기존 셰리나 등 다중탄 공용 형식으로 실제 탄환마다 경로를 표시한다. 별도 미리보기 렌더러가 없다.

직접 검수: 훈련장에서 단발/400ms/800ms의1·2·3발과150·250·350 비용, 홀드 중 자원 회복, 같은 적에게 여러 탄환 적중, 조준 중 경로 업데이트, 반격 높이/최고점 체류와 출발지 장판을 확인한다. 설정 설명은 현재300이며 표시 원본을 변경하면 같은 값으로 바뀐다. 실제 브라우저와 두 기기 WebRTC 시각은 자동 검사로 대체하지 않았다.


## character.108 화염과 비용
시로 평타/차징 평타·스킬 폭발·반격 화살 비의 화염을 기존 status.apply.data.flat/interval로500ms당25(초당50)로 변경. burnTickDamage25/burnTickInterval500 원본을 모든 화염 모듈이 참조하며 다른 캐릭터의 공통 화염값은 유지. 평타 해제 비용 단발150/400ms2발250/800ms3발350. 홀드 중 무소모·발사 순간 단계 비용 및 설명 참조 유지. 시로20회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
화염 수치는 burnTickDamage/Interval 원본 참조이며4초 화염은500ms마다25씩8틱으로 총200 기본 피해다. 같은 화염의 기존 refresh-type 갱신/피해 보정/대상 권위/온라인 적용은 유지한다. 새 DOT 모듈 없이 기존 flat/interval 파라미터를 재사용했다.


## character.109 차징 탄퍼짐·미리보기
시로 차징 산탄각을 charge.spread 0→0.48rad로 연속 증가: 400ms1단계0.24rad,800ms2단계0.48rad. 실제 투사체와 미리보기는 동일 dynamicSpec 사용. 일반 클릭 및400ms미만은 미리보기 없음, 기존 previewAtFull로 진행도1부터 경로 표시. 백드래프트 비용500→400. 평타150/250/350·화염25/500ms 및 기존 피해/점프 유지. 기존 charge 보간의 선택형 spread 확장·새 모듈/캐릭터ID 예외 없음. 전체240회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 시각 미검증.
charge.spread:{from:0,to:0.48}는 charge.pelletCount와 같은 정규화 진행도 보간으로 pattern.scatter.spread를 갱신한다. 기존 단일 고정 산탄각만으로는 홀드 중 연속 증가를 표현하지 못하므로 기존 ChargedAttackService.dynamicSpec을 선택 옵션으로 확장했다. 다른 차징 산탄도 이 옵션을 재사용하고 미지정 캐릭터는 기존 산탄각을 유지한다. charge.preview:false/previewAtFull:true는 기존 진행도1 조건으로400ms부터 미리보기를 보이며 그 전에는 숨긴다.


character.110: 시로 난이도1. 전투 수치/동작 변경 없음.


## character.111 단계 고정 및800 사거리
시로 차징 탄퍼짐을 연속 증가에서 단계별 고정으로 정정:400ms미만 단발/미리보기 없음,400~799ms2발/전체각0.24rad 고정,800ms이상3발/전체각0.48rad 고정. 기존 lerp의 선택형 steps2를 사용하여 같은 단계에서 실제 발사각/미리보기 폭 불변. 조준 방향 추적은 유지. 평타/스킬 투사체 사거리 모두800. 비용150/250/350 및스킬400·화염25/500ms 유지. 전체240회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
charge.spread의 from0/to0.48/steps2는 정규화 진행도를0/0.5/1로 내림한 뒤 보간하므로 각 단계 안에서 산탄각이 고정된다. 기존 공통 lerp에 선택형steps를 추가하여 단계형 수치에도 재사용하고 미지정 옵션은 기존 연속 보간을 유지한다. 단계 경계400/800ms에서만 산탄 폭이 바뀐다.


## character.112 고정 단계 구성
사용자 실화면 연속 확대 보고에 따라 시로 차징의 연속 pelletCount/spread 및steps 설정 제거. charge.stages의 고정 모듈 구성으로 단발1발/0rad,1단계2발/0.24rad,2단계3발/0.48rad 직접 선택.400/800ms에서만 구성 전환. 기존 fullSpec을 다단계 선택형 목록으로 확장·캐릭터ID 실행 분기 없음. 기존 .111 자동검사에서는 단계 고정이 확인되어 실화면 원인은 미재현; 화면 수정 성공을 단정하지 않음. 모든1ms진행점/실제발사/미리보기 포함 시로21·전체241회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
charge.stages:[{progress,spec}]는 현재 진행도 이하의 가장 높은 임계값 spec을 선택하고 기존 fullSpec 병합과 동일하게 기본 AttackSpec에 적용한다. 시로는0/1/2 임계값마다 완전히 고정된 pattern.scatter count/spread와 기존 projectile/status 모듈을 선택한다. 기존 단일 fullSpec은 두 단계 변화 표현이 어려워 선택형 목록으로 확장했다. 타 캐릭터의 여러 단계 고정 공격도 재사용한다. steps 보간 옵션은 제거했으며 연속 보간이 필요한 기존 캐릭터의 기본 lerp는 복구했다.


## character.113 탄퍼짐 축소
1단계 전체각0.24→0.08rad,2단계0.48→0.16rad(기존의1/3).400/800ms 단계 경계에서만 변경. 단계 중 연속 확대 없음. 아래 과거 확장 기록은 당시 변경 이력이며 현 구성은 위 표 및charge.stages다.


## character.116 활 이미지와 모션
worldEffectModules effect.spawn/renderType weaponSilhouette/style bow로 큰 활 표시. 평타 일반 모듈과 모든 고정 charge.stages 구성에 같은 mode.toggle(siro-weapon-motion) 추가하여 실제 공격 후260ms 활 반동. 스킬/반격도 같은 모션 갱신. chargeStateKey charge:primary의 기존 진행도/800ms/2단계를 읽어 시위를0~1로 당기고 화살을 얹는다. 해제/취소 때 차징 상태가 없어지면 시위는 기본 위치로 돌아간다. 판정/미리보기 산탄 단계는 기존 고정0/.08/.16 유지. 범용 렌더 스타일 확장·캐릭터ID 조건 없음. Canvas 렌더 및 실제 차징 상태/모드 회귀 통과; 실게임 브라우저/온라인 시각 미검증.
