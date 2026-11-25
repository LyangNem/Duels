## 밸런스17항목·피해/비용 표시 — 3.0.0-character.396 (2026-11-06)

## 게레타 온라인 차징 스킬 피해 누락 — 3.0.0-character.400 (2026-11-07)

원인: ChargedAttackService.release가 실제 AttackService.execute의 attackResult를 런타임 context에 연결하지 않아 ability-release.executionSequence가null. 수신측은0번 공격 복제본의 선딜을 대기하고, 발신측은 실제N번 공격의 delivery windup commit을 송신해 키 불일치·피격자 권위 타격 미실행. 일반 훈련장에서는 발생하지 않아 기존 단일runtime검사로 누락.
수정: charge release에 attackResult:context·executionSequence·networkAttackAdjustments·abilityUseId 전달. 기존 공용 공격 결과/복제 계약 사용. 차징 수치/소모/미스기절/다른 입력 변경 없음. 같은 차징 릴리스의 번호 누락도 공용 경로에서 보완.
검증: 독립2runtime 실제온라인 입력→릴리스패킷→선딜commit→피격자 체력 경로에서 탭200·완충800 확인. 수정 전399runtime로 같은 검사가 실제 번호 누락 재현, 수정 후 통과. 실제 브라우저 플레이 미실시.


## 루네트·게레타·아이리 조정 — 3.0.0-character.399 (2026-11-06)

루네트 평타 투척650→422.5·스킬700→455(-35%), 장판 반경/전체 대상 반격 유지. 게레타 스킬 최대피해600→800(50단위 유지), 최소피해200/최소비용200 유지·최대비용350→650. 기존 메인마드 charge.costTiming=during-charge와 staminaRegenDuringCharge=false 재사용: 시작200 소모 후1.5초간 추가450 실시간소모, 릴리스 중복소모 없음. 일반RMB 설명 제거하고 RMB HOLD만 유지. 아이리 평타 탄당100→150, 스킬비용400→500·침묵750→1000ms.
검증: 실제 게레타 포인터 누름/중간/완충200·425·650누적소모 및 release 추가소모0, 실제 최소200/최대800 피해·50단위, 아이리2발 각150/침묵1초, 설명/루네트 투척거리 확인. 기존검사 기대값 갱신. 실제 브라우저 플레이 미실시.


최신 사용자첨부 계열395를 기준으로 반영. 루네트 체력1300→1100, 평타 장판/독/재생 및 취기3→2초, 스킬 장판/독/재생 및 취기5→3초·틱당150→100. 스킬 범위 감소 미지정값은 반경220→176(-20%)으로 설정; 투척거리700 유지. 반격 효과는 유지.
게레타 rmb 비용400~600→200~350, 피해200~500→200~600. 일반RMB는 costText로 실제costMin200만 표시, RMB HOLD는 기존 공용 범위 비용200~350 표기 유지. 회색#bcbcbc/차징·사거리·미스기절 유지.
아이리 평타비용250→150, 수갑반경18→25·침묵500→750ms. 라티스 평타비용150→200·체력1300→1200. 테르디온 스킬비용800→650·폭발 중심600/중간400/외곽200→450/300/150(직격200 유지). 모든 테르디온 공격 설명은 직격/폭발최소~최대 공용 참조로 변경:평타150/100~300·스킬200/150~450·반격150/100~300. 지오핀 버터 이동속도1200→1800(+50%).
검증: 실제 아이리/게레타/루네트·라티스 적중·회복·독/재생 지속, 테르디온 공용파이프라인3단계 실제피해, 공용설명 비용·피해렌더 확인. 버터 경로/벽관통/운반·네트워크 복제 기존검사. 이동좌표 검증은 새속도의 부동소수점 오차에 대해1e-6 허용오차 적용(게임코드 변경 없음). 전체72개 회귀 검사에서 남아 있던 버터1200 기대값을1800으로 갱신 후 재통과. build/docs/check/verify/구문/최종ZIP의 소스·runtime·회색/CRC·저장 후 동일성 확인. 실제 브라우저 플레이 미실시.
대상: lunet/gereta/airi/latis/terdion/geopin/회귀/README/PATCH LOG/관련설계문서/project.json/DIVIDE TASKS/생성runtime.

## 게레타 스킬 피해200~500 — 3.0.0-character.395 (2026-11-06)

사용자 재첨부389를 회색으로 수정한394를 기준으로 작업. 엑슬래시·롱 엑슬래시 피해300~750→200~500. 기본피해150은 유지하고 rmb damageRatio 및 차징 from/to만4/3~10/3으로 변경. 평타150·반격300·회색#bcbcbc·차징시간/범위/소모/자기기절/미리보기 유지. 설명은 기존 min/max 피해 참조로 자동 반영.
검증: 실제 스킬 최소200/최대500 적중 회귀, 기존 차징·미스 기절·선딜 미리보기·반격 판정 유지. build/docs/check/verify/구문 및 최종ZIP의 소스·runtime·회색/CRC 확인.
대상: gereta/test-gereta388/docs GERETA/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 게레타 차징·선딜 미리보기/도끼 크기 — 3.0.0-character.389 (2026-11-05)

우클릭 charge.preview 활성화로 차징 중180→325 실제 범위 미리보기. 기존 delayed delivery.area에 previewDuringDelay 선택옵션을 추가해 릴리스 시 확정 차징 AttackSpec으로 공용 AttackPreviewService를 만들고350ms 선딜동안 유지. preparedAttack/liveTracking으로 차징값·위치·실시간 조준을 보존하고 해당 delivery 실행 또는 기존 선딜 취소 경로에서 제거. 선택옵션을 사용하지 않는 다른 공격 변화 없음. 반격 투사체 반경18→36, 표시 반경은 같은 값 참조로 통일. 새 캐릭터 전용 모듈 없음.
검증: 실제 포인터 차징 시작/절반/완충 미리보기180/252.5/325, release 이후350ms 유지·이동/조준 추적·타격시 제거·기절 취소시 제거. 반격 판정/표시 반경36 일치. 기존388 공격·차징/미스 자기기절, 아이리·벨·사거리 회귀와 build/docs/check/verify/구문/ZIP CRC 검사. 실제 브라우저 시각검수 미실시.
대상: gereta/AttackModuleService/test-gereta389/docs GERETA/README/PATCH LOG/project.json/DIVIDE TASKS/생성runtime.

## 게레타 추가·벨 홀드1초 — 3.0.0-character.388 (2026-11-05)

벨 평타 charge.duration1500→1000ms. 게레타 gereta/Gereta: 단련된 나무꾼, 체력1200/보통4/차징형 근거리 딜러. 색·난이도 미정 초기값 올리브#526b3f·3. 평타150/사거리225/스테미나200/쿨500ms 부채꼴. 엑슬래시350ms 선딜 후 전방 직사각 타격. 최대1.5초 홀드로 피해300→750/사거리180→325/스테미나400→600/미적중 자기 기절400→1200ms 선형 증가. 스킬 쿨800ms. 반격 도끼300피해/사거리700/탄속28/반경18/공용300ms선딜·무력화넉백84. 미지정 수치는 초기값으로 기록. 기존 공용 벡터 경로 형식으로 woodcutter-axe 무기 형상 추가·공용 회전.
공용 확장: 기존 after-delivery 훅에 recipient source인 status.apply 허용, AreaAttackService가 해당 전달의 hits와 원격예측 접촉수를 전달해 delivery.hit-count-lte 조건 제공. 원격 미러는 자기CC를 중복 적용하지 않음. 빗나감은 전달 시점 적중 결과로 판정하며 원격예측 접촉도 적중으로 인정(피격자 권위의 뒤늦은 저회 확정에 따른 자기기절 재판정은 없음). 기존 ChargedAttackService에 charge.moduleValues 수치 보간을 추가해 같은 데이터로 실패 기절 시간을 차징비례 조절. 새 전용 모듈·캐릭터ID 분기 없음. 범위공격 적중결과 조건과 모듈 수치 보간은 다른 차징·실패 패널티 공격도 재사용 가능.
검증: 실제 포인터 press/release 즉시/절반/풀홀드·350ms선딜·피해300/750·명중 시 자기기절 없음·미스400/800/1200ms·벽차단 미스·원격예측 적중시 잘못된 자기기절 없음·반격300/기본무력화·벨1000ms 확인. 전체70개 회귀 중 벨의 옛 완충시간 기대값1건을999/1000ms 경계로 갱신 후 재통과. build/docs/check/verify/구문/ZIP CRC 검사. 실제 브라우저 시각검수 미실시.
대상: gereta/bell/ChargedAttackService/AreaAttackService/AttackModuleService/TriggerConditionService/WEAPON_IMAGE_DEFS/등록·규칙·검증·문서/생성runtime.

