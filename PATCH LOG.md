# PATCH LOG

## 라티스 지속전투형 분류 — 3.0.0-character.332 (2026-10-16)

라티스 classification.style을 행동제약형(9)에서 지속전투형(3)으로 변경. 공용 스타일 설명·필터·정렬에 같은 데이터 적용. 체력1300 및 전투 수치 유지. 검증: 라티스 회귀, build/docs/check/verify/runtime 구문 검사.

## 라티스 표기/체력·키3타 코인·후리 이속 제거 — 3.0.0-character.331 (2026-10-16)

라티스 월척 키 표기를 RMB RECAST→RMB/RMB, 체력1200→1300. 후리 포식자의 speed 패시브와 우클릭 speed modifier.set,설명에서 이동속도30% 증가 제거. 자연 활성/잔여/스킬 활성 동안에도 기본 이동속도 유지. 평타250ms/210도/150사거리 및 다른 포식자 효과 유지.

키 평타3타(lmbFinal) 실제 적중 시 기존 반격기의 코인과 동일하게 주황 travelToken 연출 및333ms 후 최대체력/최대스테미나20% 회복. 기존 resource.restore/effect.spawn 조합을 그대로 사용하고 oncePerExecution으로 여러 적을 맞혀도3타1회당 코인1개 효과만 발생. 1·2타/미적중/무적·회피한3타에는 지급하지 않는다. 설명에3타 적중 보상과 실제 비율 참조 추가.

검증: 실제 runtime 키3타 지연회복/다중적중1회/1·2타없음/빗나감·회피없음,후리 자연/잔여/스킬 이동속도1.0,라티스체력1300/기존끌기·피해·연출 회귀. 전체42개 회귀/build/docs/check/verify/runtime구문/ZIP 무결성.


## 채팅 ESC 설정 동시 열림 수정 — 3.0.0-character.330 (2026-10-16)

원인: window capture 단계의 PanelController가 OnlineChatService/CharacterCommandInputService보다 먼저 ESC를 소비하며 채팅을 닫은 뒤 설정도 토글했다. 활성 채팅/명령 입력이 있으면 기존 close 동작만 실행하고 즉시 종료하도록 입력 우선순위를 수정. 일반 채팅은 기존 selectDraftOnReopen 옵션을 유지하고 가에 명령은 기존 buffer 정리 경로 사용. 채팅을 닫은 ESC의 키반복으로 설정을 열지 않는다. 다음 별도 ESC부터 기존 설정 열기/닫기 유지. 준비 화면과 실제 게임 모두 같은 입력 경로 사용.

검증: 실제 runtime 채팅 ESC→채팅만닫힘/설정닫힘,누르고있음 무효,명령ESC도 입력만닫힘,다음 별도ESC 설정열기/닫기,준비화면 동일 동작. 전체41개 회귀/build/docs/check/verify/runtime구문/ZIP 검사.


## 후리 연사·포식자 이동속도·평타 각도 — 3.0.0-character.329 (2026-10-16)

평타 쿨350→250ms(0.25초), 부채꼴 전체180→210도(halfAngle105도). 사거리150 유지. 포식자 활성 중 speed+0.3(이동속도30% 증가) 추가. 기존 staminaCostScale 포식자 버프의 활성 여부를 공용 passiveBuffs 조건으로 참조해 자연 조건 유지·조건 이탈 후 잔여2초와 함께 동기화하고 비활성 시 즉시 제거. 스킬 강제 포식자도 같은 sourceId의 공용 modifier.set로 즉시 속도 증가를 부여. 동일 sourceId라 프레임 갱신/자연조건/스킬 간 중첩되지 않는다. 설명에 실제 속도 증가량 참조 추가. 피해/회복/자원 비용 등 다른 수치 유지.

검증: 실제 runtime 평타250ms/210도/150,자연 포식자 및 잔여시간 speedMult1.3·갱신 중첩없음·종료1.0,스킬 즉시1.3·2초뒤1.0,후리 기존회귀와 독립3runtime 네트워크회귀/build/docs/check/verify/runtime구문/ZIP 무결성.


## 카운트다운 준비 취소 차단·어두운 버튼 — 3.0.0-character.328 (2026-10-16)

게임/라운드의 모든 참가자가 준비해 카운트다운이 시작된 이후에는 준비 취소를 거부한다. 이전 준비 취소 허용은 선택/상대 대기 단계에만 유지. 로컬 요청/버튼 클릭 및 호스트 승인 모두 단계 검사하고 카운트다운 버튼은 비활성 “N초 후 시작...”로 복구. 이미 시작한 카운트다운을 취소 패킷으로 중단할 수 없다.

사용 가능한 준비 취소 버튼은 ready-cancel 공통 클래스로 어두운 배경/글자/테두리,글로우없음/어두운hover를 사용한다. 비활성 처리로 가장하지 않아 대기 단계에서는 클릭 가능. 최초 캐릭터 준비/게임 준비/라운드 준비의 준비/취소 상태에 따라 클래스를 동기화하며 새 선택 화면에서 이전 스타일 제거. 기존 증강 실제시작1회 지급 유지.

검증: 실제 runtime 대기중 취소 허용/카운트다운 로컬·호스트취소 거절/카운트다운 진행과 증강1회 지급/버튼 비활성·라벨/취소 어두운 클래스/관전자 잠금, 전체40개 회귀/build/docs/check/verify/runtime구문/ZIP 검사. 실제 브라우저 화면/다기기 플레이는 별도 확인 필요.


## 후리 스킬 기본 소모량400 — 3.0.0-character.327 (2026-10-16)

후리 아드레날린 포션 기본 스테미나800→400. 기존800이400 소모되던 경우는 포식자 소모량50% 감소 적용에 따른 정상 공용 비용 계산이었다. 기본400 변경 후 비활성 시400, 이미 포식자 활성 시200(추가 가산 버프 없을 때). 다른 공격의50% 감소 규칙은 유지. 검증: 실제 runtime 기본소비400·기존버프중200·자원부족 미발동·평타75 및 후리 전체회귀/build/docs/check/verify/runtime구문/ZIP 무결성.


## 라티스 미끼·월척 피해 조정 — 3.0.0-character.326 (2026-10-16)

미끼 적중 피해150→100, 월척 재사용 피해0→100. 재사용의 contactOnly/confirmContact/effectsOnly를 제거해 일반 delivery.target 피해와 끌기200을 함께 적용. 설명은 실제 피해 참조를 다시 표시. 사거리/속도/비용/2초 기회/본인 점선/일반 투사체/적중 잔향 없음/재사용 회전 유지. 검증: 실제 runtime 미끼 단독100·재사용100 합계200 및 기존 라티스 회귀, build/docs/check/verify/runtime 구문/ZIP 무결성.


## 후리 회복·평타 범위 조정 — 3.0.0-character.325 (2026-10-16)

포식자 적중 회복을 최대체력5→10%(체력1000 기준100)로 상향. 기존 더미 허용/봇·소환수·DOT 제외 규칙 유지. 평타 전체각도180도(halfAngle π/2), 사거리130→150. 판정 사거리는 공격 사거리 단일 참조로 연결해 공용 미리보기/판정/설명/사거리 정렬이 일치한다. 회복 설명도 실제 maxResourceRatio 참조로 변경. 반격 범위 및 다른 수치 변경 없음. 검증: 실제 runtime 후리 전체 회귀와 독립3runtime 네트워크 회복, 평타 각도/사거리 및 build/docs/check/verify/ZIP 검사.


## 메이실·시아넬리 난이도 조정 — 3.0.0-character.324 (2026-10-16)

메이실 난이도4→1, 시아넬리3→5. 공식 캐릭터 stats.difficulty만 수정해 카드/설명/정렬의 공통 참조로 반영. 전투 수치 변경 없음. 검증: 실제 runtime 컴파일 후 난이도1/5 확인, build/docs/check/verify/runtime 구문 및 ZIP 무결성.


## 정상 레코드 정산의 잘못된 서버 정정 수정 — 3.0.0-character.323 (2026-10-16)

확인한 원인1: FFA 중립 순위(3팀2위/4팀2·3위)에 ffaScore.kind가 neutral이어도 예상 점수 계산이 win 분기로 들어가100~200을 먼저 부여했다. 문서 규칙대로 중립 예상 획득량0으로 수정. 승리/패배/불균형 배율은 유지.

원인2: applyServerProgress가 개별 result.after 대신 응답 progress.characterRecords의 누적 현재 점수를 해당 라운드 after로 기록했다. 예:1라운드 확정100과 누적300을 비교하며 정상 응답도 정정 처리. result.after를 라운드 결과로 사용하고, 계정 누적 점수는별도로 progress에서 반영한다. before/after 기준점 이동만으로 서버 정정을 띄우지 않고 해당 라운드 delta 차이만 비교. 실제 획득량 차이는 정상 레코드 확정 획득량 토스트와 개발자 진단 로그로 표시하며, 서버가 명시적으로 거절한 정산 오류/회수 경로는 유지한다.

원인3 재현: 최신 확정 plays3/300 이후 지연된 plays2/200 응답이 오면 기존에는200으로 덮었다. 라운드 응답 반영 시 기존 서버 확정 캐릭터별 plays가 더 큰 스냅샷을 보존한다. 점수 최대값을 고르는 방식이 아니므로 새plays6의 정상감점500 등은 수용. 낙관적 점수는 비교 기준으로 쓰지 않는다. 정상 동기화/오류 구분을 위한 실제 서버정산 검증을 우회하지 않는다.

검증: 순수 실제 서비스 로딩 재현에서 FFA 중립0/승리배율 유지,누적300와 라운드100 분리,역순응답 최신점수 보존,동일delta 기준점이동 무알림,실제차이 확정값 표시,새 감점수용 확인. 기존 로그인/캐시 정산 동기화 회귀 포함 전체40개 스크립트/build/docs/check/verify/ZIP 무결성. 운영 서버 응답 로그와 다기기 실전은 직접 확인하지 않았으므로 실제 발생건 전체가 같은 원인이라고 단정하지 않는다.


## 준비 취소·지오핀 난이도·월척 무피해 — 3.0.0-character.322 (2026-10-16)

지오핀 난이도4. 라티스 월척 피해0/설명 피해 문구 제거,끌기200/비용100/재사용2초 유지. delivery.target에 기존 contactOnly/confirmContact 영향값 전달 옵션을 추가해 피해0이어도 회피·무적 검사를 거친 접촉/끌기를 유지하며 피해·회복/흡혈 이벤트를 만들지 않는다. 후리에서 사용하던 공용 피해0 접촉 경로 재사용.

캐릭터 선택 준비·게임 준비/증강 선택·라운드 준비에서 준비 완료 버튼을 준비 취소로 전환. 게임/라운드 카운트다운 중에도 취소 가능. 취소 요청은 duplex ready-cancel(stage) 패킷으로 호스트만 적용하며 활성 참가자/단계/준비 여부를 검증하고 관전자/진행중 요청은 거부. 호스트가 기존 ready-state 패킷에 phase/cancelledPid를 담아 전체에 동기화. 선택값은 UI에 유지하며 취소한 본인의 카드 잠금/결과뷰/버튼을 복원한다. 타인의 준비는 유지. 일반전 최초 자동 카운트다운은 유지하되 취소 후에는 명시적 재준비 필요.

취소 시 타이머를 지우고 세대 번호를 증가시켜 이전 카운트다운 콜백이 재준비한 새 단계에 개입하지 못한다. 라운드 증강은 준비 클릭에서 지급하던 것을 실제 다음 라운드 시작 직전으로 옮겨 취소·재준비 중복 지급을 방지. 캐릭터 변경도 기존대로 실제 시작 직전에만 적용.

검증: 실제 runtime 호스트 게임카운트다운 취소/재준비/이전콜백 무효,라운드 준비/카운트다운 취소,증강 최종1회 지급,부적격요청 거부,UI 버튼·선택잠금 복원·관전자 잠금,월척 무피해/끌기200. 전체39개 회귀/build/docs/check/verify/ZIP 검사. 실제 다기기 브라우저 플레이는 별도 확인 필요.


## 라티스 일반 투사체·적중 잔향 제거 — 3.0.0-character.321 (2026-10-15)

라티스 미끼를 weapon-projectile anchor-cross에서 기본 원형 projectile-style로 변경. 적중 시 weaponImageEcho 제거. 기존 본인 전용 투사체 점선과 적중 대상 점선/2초 재사용/벽 관통/수치/월척 회전은 유지한다.

일반 투사체의 선택적 showLink를 공용 TrainingWorldDrawService.drawProjectileOwnerLink로 렌더하도록 연결했다. 명시적으로 요청한 일반 투사체만 연결하며, 기존 무기 투사체 분기는 그대로 둔다. 소유자와 현재 플레이어가 같을 때만 렌더하고 캐릭터 전용 분기 없음.

검증: 일반 투사체 형상·소유자 전용 점선·적중 잔향없음·대상 연결/끌기/회전 유지 및 전체38개 회귀/build/docs/check/verify/ZIP 검사. 실제 다기기 브라우저 플레이는 별도 확인 필요.


## 라티스 연결선·무기 연출·수치 및 지오핀 근거리 조건 수정 — 3.0.0-character.320 (2026-10-15)

라티스 평타225/월척 끌기200/반격150. 낚시찌는 기존 공용 weapon-projectile anchor-cross의 소유자 전용 점선 연결을 사용한다. 적중 후에는 captureHitTarget 시간창과 공용 conditionalTargetLinks로 원래 맞은 적에 점선 연결(본인만, 재사용/2초만료/사망 시 종료). target.matches-state-target 공용 조건을 추가해 시간창에 기록된 ID만 표시하며, 기존 은신/관전자 숨김 규칙을 따른다. 연결선의 벽 통과는 미끼와 동일하며 실제 끌기 이동은 기존 충돌을 따른다.

미끼 실제 적중 시 공용 weaponImageEcho로 낚싯대 잔향. 월척은 delivery.target에 on-delivery 모션이 발생하지 않아 회전이 빠졌으므로 after-attack으로 모션 시점을 수정했다. 스킬 재사용 비용/기회 처리 및 대상 ID 네트워크 전달 유지.

지오핀 점선 원/아이디어 범위350과 근거리 모듈 조건220이 달랐다. ideaModules.closeDistance와 점선 원 범위를 ideaModules.range 단일 참조로 연결해350이하 근거리,350초과 원거리로 통일했다. 실제 근거리 공격 사거리220/넉백60 등은 유지.

검증: 실제 runtime 끌기200/평타225/반격150/미끼 적중 잔향/재사용 회전/맞은 대상만 연결·소유자만 표시·소비 후 종료/지오핀350 경계 판정. 전체38개 회귀/build/docs/check/verify/ZIP 무결성. 실제 다기기 브라우저 플레이는 별도 확인 필요.


## 라티스 추가 — 3.0.0-character.319 (2026-10-15)

라티스/능숙한 낚시꾼: 체력1200, 빠름4.25, 행동제약형 근거리 딜러, 파란계열 #358fb8(중복없음), 난이도3. 미지정 수치: 평타150/사거리300/부채꼴 약155도/소모150/쿨450ms. 미끼150/사거리600/탄속30/크기14/소모300/쿨1500ms. 월척150/끌기80·속도8/소모100/적중 후2초 이내 한번. 반격250/전방직사각300·반폭65/무력화넉백100·속도12/공통선딜300ms.

스킬 미끼는 projectile.pierce의 벽만 관통하며 첫 적에게 실제 적중하면 captureHitTarget으로2초 시간창에 적 ID를 기억한다. 공용 action.attack alternates에 선택적 targetStateKey를 추가해 해당 시간창의 대상 ID를 실행의 targetEntityId로 전달하며, 기존 delivery.target과 movement.pull로 월척을 처리한다. 새 캐릭터 전용 분기 없음. 대상 ID는 기존 duel-action 결과에 포함되므로 원격에서 재조준/새 대상 선택을 하지 않는다. 재사용 성공 시 consume으로 기회 소비. 죽은/잘못된 대상은 비용 없이 기록 제거, 비용 부족은 기록 유지. 빗나감은 기록 없음. 끌어당김 이동은 기존 지형 충돌 준수.

보드 등과 같은 공용 벡터 무기 시스템에 낚싯대·릴·줄·낚시찌 형상을 등록하고 공격 시 회전. 재사용 가능한2초는 공용 호게이지 표시. 반격은 기존 공용 내려치기 직사각 판정 및 무력화 넉백. 평타 사거리 분류는300(근거리).

검증: 실제 runtime 스펙/중복없는색/평타150/벽관통 적중150/원래 대상만 재사용150·끌기/빗나감/2초만료/대상사망/비용부족/반격250·넉백/네트워크결과 대상ID. 전체38개 회귀/build/docs/check/verify/ZIP 무결성. 실제 다기기 브라우저 실전 검증은 별도 필요.


## 샤베트 이른 두 번째 클릭 즉시 공격 — 3.0.0-character.318 (2026-10-15)

두 번째 클릭이250ms보다 이르면 해당 클릭 시점에 일반 평타를 즉시 발사한다. 타이밍 성공 입력(250~300ms)은 기존대로300ms 종료 시 강화 공격. 두 번째 클릭 없는 일반 공격도300ms 종료 유지. 연사간격500ms/소모150/일반100·성공200/빙결500ms 등 나머지 수치 유지.

공용 state.window select에 선택적 resolveImmediately를 추가하고, 기존 창의 resolveNow continuation을 호출하도록 연결했다. 원래 예약과 즉시 완료가 동일한 continuation을 사용하며 completionPending 선점으로 중복 발사를 막는다. 즉시 종료 시 expiresAt/completedAt을 실제 시각으로 갱신해 미리보기/게이지가 계속 진행하지 않는다. 기존 windup commit을 즉시 전송해 원격 화면도 동일한 일반 공격을 실행하며 원래 예약 시간에는 commit/공격을 다시 발생시키지 않는다. 캐릭터 ID 분기 없음.

검증: 이른 입력1/100/249ms 즉시 일반공격 생성,100ms 입력 후200ms에100피해(원래300ms 이전),원래 예약 이후에도 총100피해 유지,성공/연타실패확정/다음공격초기화 유지. 전체37개 회귀 및 build/docs/check/verify/ZIP 무결성. 실제 다기기 브라우저 플레이는 별도 검증 필요.


## 샤베트 두 번째 클릭 판정 확정 — 3.0.0-character.317 (2026-10-15)

과냉각의 두 번째 클릭 한 번으로 성공/실패를 확정한다. 첫 클릭 후250~300ms 사이면 강화200피해/빙결500ms, 일찍 누르면 일반100피해로 고정된다. 이후 같은 선딜 안에서 연타해도 결과를 바꾸지 못한다. 두 번째 클릭 없이 선딜이 끝나면 일반 공격. 새 공격은 decided:false로 다시 시작. 기존 선딜300ms/연사간격500ms/소모150/사거리294 유지.

기존 공용 state.window select와 state.timed-data-equals만 조합해 캐릭터 데이터에 decided 플래그를 추가했다. 확정 이후의 클릭은 선택을 변경하지 않고 기존 활성 창 소비 모듈로 처리한다. 실패 확정 후 성공 구간에 진입해도 게이지가 성공색으로 바뀌지 않으며 실제 성공한 경우는 기존 성공색 유지. 선택 data는 기존 stateWindowSelection 네트워크 전달 경로를 이용한다. 전용 모듈/캐릭터 ID 분기 없음. 설명에 두 번째 클릭과 이른 입력의 실패 확정을 표시.

검증: 실제 runtime에서1/100/249ms 이른 두 번째 클릭 이후 성공 구간 연타→일반 피해100/빙결없음,250/275/299ms 성공→200/빙결,무입력 일반,다음 공격에서 판정 초기화/성공. 전체37개 회귀/build/docs/check/verify/ZIP 무결성. 다기기 브라우저 실전은 별도 검증 필요.


## 레나 설명·후리/레나 완충 점선 링 수정 — 3.0.0-character.316 (2026-10-15)

레나 스킬 설명을 “적 또는 벽에 적중 시 주변에 피해 ({linkedDamage})”로 변경. 후리와 레나의 호게이지에서 부분 진행 외곽 점선 옵션 outlineRing 및 flashWhilePartial을 제거하고 공용 maxChargeFlash만 사용한다. 이제 점선 링은 완충일 때만 표시하고 감소 중에는 실선 호게이지만 표시한다. 후리 호게이지의 밝은색 강조는 유지하며 시간/판정/전투 수치는 변경하지 않는다. 공용 렌더 코드는 변경하지 않음.

검증: 실제 공용 렌더 호출을 기록해 두 캐릭터 모두 완충 점선 표시/50% 점선 미표시 및 설명 확인. 전체36개 회귀/build/docs/check/verify/ZIP 무결성 검사. 아래 과거 버전의 감소 중 점선 설명은 폐기된 이력이다.


## 레나 보드 방향·연계 게이지·중복 충돌 수정 — 3.0.0-character.315 (2026-10-15)

레나 피해량 평타100/스킬150/반격150, 스테미나 평타100/스킬300. 일반/강화 양쪽과 스킬 후속 광역에 동일하게 반영. 연계500ms는 공용 timed-action-remaining/gauge.arc로 표시하고 공용 링 배치 사용. 보드는 이동 방향을 향하며 스킬도 after-attack에서 기존 회전 상태를 갱신한다(이동만 하는 스킬에는 on-delivery가 없어 회전이 누락됐음).

공용 weaponImage의 선택적 facing:movement와 facingMovementStateKey를 추가. 실제 위치 변화 방향과 활성 이동기 방향을 사용하고 정지하면 마지막 방향 유지. 원격 위치 변화에도 동일하게 적용하며 잔향/사망 스냅샷은 방향을 저장해 이후 움직임에 끌려가지 않는다. 기존 무기는 옵션이 없어 영향 없음.

초근거리 중복 원인: applyPathDamage에서 접촉 온힛이 movement.stop→finish를 호출한 뒤 외부 이동 루프가 같은 state를 다시 finish해 onEndAttackIds를 두 번 실행. 공용 finish 시작에서 finished를 선점해 재호출을 막았다. 같은 상태의 후속 공격/종료 부수효과는 한번만 실행. 접촉0~120거리에서 단일 광역/피해150 확인. 피해 선행 방지 및 벽 차단/허공 종료 미폭발 유지.

검증: 레나 실제 runtime 연계·감전5초·일반/강화 수치·스킬 회전·0.5초 호게이지·이동 방향/정지/스냅샷·초근거리 단일 광역, 전체36개 회귀/build/docs/check/verify/ZIP 검사. 실제 다기기 브라우저 플레이는 별도 확인 필요. 아래 버전 기록은 이력이다.


## 레나 추가 — 3.0.0-character.314 (2026-10-15)

레나(샹큼한 레몬): 체력1200/빠름4.25/지속전투형 근거리 컨트롤러/노랑 #e4ed36/난이도3. 미지정 기본 수치는 평타150피해·사거리240·스테미나150·쿨350ms, 스킬200피해·이동360/180ms·폭발180·스테미나400·쿨1200ms, 반격200피해·반경280·공통선딜300ms.

공격 사용 후500ms 안에 다음 공격을 사용하면 강넉백180 및 감전5000ms 추가. 첫 공격/500ms 초과는 일반 공격이며, 강화 공격도 다음 연계를 연다. inputAttackAlternates로 입력 시 강화 여부를 고정하므로 나중에 적중하거나 반격 선딜 중 시간이 지나도 판정이 변하지 않는다. 실패 입력은 창을 갱신하지 않으며 ability.lock으로 일반/강화 공격 간 쿨 우회 방지. 스킬 내부 광역은 연계 창을 추가로 열지 않는다.

스킬은 실제 이동 접촉과 movement.stop, onEndAttackIds의 공용 경로를 조합한다. 피해0 접촉 뒤 종료 위치에서 한 번 광역 피해. 이동 최대거리 미도달 종료에만 후속 공격을 실행하는 선택 옵션 onEndBeforeMaxDistance를 공용 이동 서비스에 추가해 허공 최대거리 종료는 폭발하지 않는다. 벽을 넘지 않고 공격/연출은 벽에 차단. 반격은 공용 무력화 넉백 및 annularDoubleSweep. 보드 형상은 공용 순수 벡터 정의와 weaponImage 회전 사용. 캐릭터 ID 분기 없음.

검증: 실제 runtime 첫 공격/연계 감전/5초 종료/500ms 창 종료/쿨다운/돌진 선행피해 없음/충돌 광역1회/원형 반격. 전체 회귀 및 build/docs/check/verify/ZIP 무결성. 다기기 브라우저 실전 검증은 수행하지 않음.


## 후리 스킬 중 자연 포식자 조건 유지 수정 — 3.0.0-character.313 (2026-10-15)

우클릭 강제 활성화 상태가 자연 포식자의 동기화를 막던 조건을 제거했다. 스킬 사용 여부와 관계없이 기존 자연 조건(500범위, 자신보다 낮은 체력비율, 벽 없이 연결)이 충족되면 지속시간을 계속 갱신하며 호게이지는 완충으로 유지된다. 조건이 끊기면 마지막 충족 시점부터2초 감소하고, 다시 충족되면 완충된다. 자연 조건 없는 우클릭은 기존대로 즉시2초 감소한다. 기존 자연 패시브/값 참조 공용 경로를 사용하며 다른 캐릭터나 공용 코드는 변경하지 않는다.

검증: 실제 runtime에서 스킬 지속시간 이후까지 조건 유지, 이탈 시 감소, 재진입 시 완충, 자연 조건 없는 스킬 감소를 확인. 전체 회귀와 build/docs/check/verify 및 ZIP 무결성 검사. 아래 이전 버전의 강제 활성화 중 자연 갱신 차단 설명은 폐기된 이력이다.


## 후리 회복·스킬 연출·호게이지·색상 조정 — 3.0.0-character.312 (2026-10-15)

포식자 직접 적중 회복은 최대체력5%(체력1000 기준50)로 감소. 더미 허용, 봇/소환수/DOT 제외는 유지. 우클릭에 베르 스킬 재사용과 동일한 공용 areaCircle(반경72,150ms,fillAlpha0.04,strokeAlpha0.78,lineWidth2)을 밝은 파랑으로 추가하며 포션 잔향을 유지한다. 후리 기본색은 #2d6de0으로 변경하고 기본 공격/이동/적중 색을 동기화했다.

포식자 호게이지는 감소 중에도 밝은색 #b5d9ff와 점선 점멸 강조를 유지한다. 공용 gauge.arc에 선택 옵션 flashWhilePartial을 추가해 같은 점멸 연출을 재사용하며, 부분 진행의 정적 외곽 링과 중복되지 않도록 했다. 링 공간 예약은 기존 방식 유지. 다른 캐릭터에는 옵션을 적용하지 않는다.

검증: 기존 후리 회복/네트워크 확정 회귀와 감소 중 강조 렌더 검사, 전체 회귀 스크립트, build/docs/check/verify/runtime 구문 및 ZIP CRC. 실제 다기기 브라우저 플레이는 별도 확인 필요. 아래 이전 버전 기록은 역사이며 현재 수치는 이 항목을 우선한다.


## 후리 포식자 자원/회복·강제 활성화·무피해 접촉 개편 — 3.0.0-character.311 (2026-10-15)

후리 반격기 이동거리는 사이엔 절격(rmbCharged)과 같은 400. 돌진 접촉 자체의 기존100 피해는 제거하고, 적중 감지/무력화/정지와 후속5회 범위 공격(각100)을 유지한다. 무피해 접촉은 회피/무적/방어 검사를 통과한 뒤 기존 contactOnly 경로에서 처리하고, 선택적 confirmContact로 피격 확정만 전송한다. 피해 이벤트/흡혈/피해 숫자는 접촉에서 발생하지 않는다. 온라인 공격자 권위 연속 공격과 주변 적의 각자 피격 권위는 유지.

포식자 효과 변경 해석: 기존 스테미나 회복속도+70%와 피해50% 회복을 스테미나 소모량50% 감소 및 **포식자 중 직접 적중 시 최대체력10% 회복**으로 정리했다. 최대체력1000이면 타격마다100 회복. 기존에 더미(dummy)까지 봇으로 함께 제외했으나 이제 훈련 더미는 회복을 허용한다. 실제 훈련봇(trainingBot)/소환수 및 DOT/피해0은 계속 제외. 피해를 줘 새로 피식자가 되는 첫 타격과 온라인 확정 체력 스냅샷 판정도 유지.

스킬 기본 스테미나800. 사용하면 모든 적을 상대로 즉시2초 포식자를 적용하고 호게이지는 바로 감소한다. 적 존재·거리·벽·체력 조건을 검사하지 않는다. 강제 활성화 중 자연 조건이 충족돼도 지속시간을 갱신하지 않으며 추가 잔여2초를 붙이지 않는다. 강제 활성화가 끝난 뒤 자연 조건이 따로 충족되면 자연 포식자는 다시 발동할 수 있다. 자연 포식자의 기존 체력비율/500범위/시야 조건과 조건 이탈 후 잔여2초는 유지. 강제 모드 중 피식자 표식·연결선 및 평타 잔향의 조건도 완화하며 은신 UI 감지 규칙은 유지.

호게이지는 완충일 때만 밝은색 #b5d9ff, 감소 중 기본색 #427dcc. 점선 외곽 링은 감소 중에도 보이고 완충 시에는 기존 공용 점멸 링을 사용한다. 자연 조건 유지 중 프레임 간 시간차로 값이0.9999가 되어 완충 표시가 누락되지 않도록 fullWhen 조건을 값 참조에 추가했다. 외곽 링 공간은 EntityRingLayoutService에서 예약해 상태/반격 링과 겹치지 않는다.

레이카/후리 반격기 경로 선은 기존부터 같은 movement.move/dash-line 공용 모듈을 사용했고, 서로 다른 매개값이 원인이었다. 사이엔/클레아와 같은 width7/alpha0.45/duration200으로 통일했다. 기존 실제 이동 구간만 따라가는 trail:true, 레이카 상태별색/후리 포식자색, 공격 판정 범위와 벽 통과는 유지. 레이카 게임플레이 수치/공격 방식 변경 없음.

공용 확장 이유: 기존 staminaCost 가산 버프는40% 감소 한도가 있어50%를 그대로 적용할 수 없었다. 한도를 전역으로 바꾸지 않고 공용 BuffService의 staminaCostScale(0.5)을 별도 곱연산 계층으로 추가했다. 기존 일반 가산 감소40%는 유지하고 실제 StaminaService의 소비/예산/사용 가능 판정이 같은 배율을 사용한다. 버프 표시도 -50%로 표시한다. 추가 공용 옵션은 condition.any, buff-duration-remaining.fullWhen, gauge.arc.outlineRing/공용 링 공간, 선택적 접촉 확정. 캐릭터 ID 분기나 전용 피해/호게이지 모듈 없음.

검증: 후리22개 실제 runtime 회귀, 독립 runtime3개 패킷 전달(피해0 접촉 확정→범위5타·주변 적 실제 피해, 첫 타격 최대체력10% 회복). 전체35개 회귀 스크립트, build/docs/check/verify/runtime 구문 및 ZIP CRC. 기존 일반 소모감소40%와 포식자50% 별도 곱연산, 기본스킬800 소비, 즉시호게이지 감소, 자연조건 중 강제시간 연장 없음, 더미/봇/소환수 구분, 완충/감소 색·점선, 경로선 공용 설정 확인. 실제 두 기기 브라우저/WebRTC 실전 플레이는 별도 확인 필요.

## 후리 호게이지·잔향·벽 차단·첫 흡혈 수정 — 3.0.0-character.310 (2026-10-15)

포식자의 잔여 2초를 공용 gauge.arc로 표시. 조건 유지 중에는 가득 차고, 조건이 끊기면 2초 동안 감소한다. 스킬의 2초 강제 활성화 뒤에도 동일한 잔여 2초를 표시한다. 별도 수동 링을 그리지 않아 공용 링 배치를 사용한다. 피식자에게 실제 평타 적중 시 발톱 무기 잔향, 스킬 사용 시 포션 무기 잔향을 고정 위치에서 확장/페이드한다. 평소 발톱 무기는 그대로 유지.

흡혈 누락 재현: 후리 800/1000, 상대 1300/1500 상태에서 평타 150을 맞히면 상대가 1150/1500이 되어 피식자 조건을 충족하지만, 이전 구현은 피해 전 버프 판정만 사용해 그 타격의 회복이 0이었다. 공용 damage-dealt 처리에서 피해 직후 패시브 조건을 먼저 갱신해 후리 체력이 875가 되는 것을 확인했다. 이미 포식자가 켜진 상태의 회복도 유지한다. 소환수/훈련 봇/더미 및 DOT는 계속 제외.

온라인: 피격 확정의 targetHealth/targetAlive와 선택적 targetMaxHealth를 일시 조건 스냅샷으로 전달한다. 원격 캐릭터의 실제 health 미러를 직접 덮어쓰지 않고 현재 체력 비율로 같은 타격의 포식자/흡혈/조건부 잔향을 판정한다. 피해 확정 전에 온힛 이펙트 조건을 빠뜨리던 공용 경로도 검사하도록 수정. 독립 runtime 3개에서 상대 체력 미러가 4100에 머물러 있어도 확정 체력 3950/5000으로 피식자를 판정해 후리가 800→875 회복하는 것을 확인.

반격기의 이동은 기존대로 벽을 통과하지만 5회 자동 범위 공격은 판정과 연출 모두 벽에 막힌다. 돌진 사거리 300/미리보기 폭44와 마지막 원형 반경300을 레이카 반격기와 맞추고 최종 회전 이펙트의 span/시작각/회전방향/지속시간/투명도/공통 클리핑 설정을 동일하게 사용한다. 빠른 돌진 시간120ms 유지. 나머지 부채꼴/일자/반대 부채꼴/원형 구성과 타당100 유지. 최종 넉백 거리180 유지, 속도14→20. 설명은 “빠르게 돌진해 기절. 적중 시 무력화 후 정지하며 5회 범위 공격. 마지막에 무력화 및 강한 넉백”으로 수정.

포식자 활성 시 공격·돌진 궤적·반격 선딜/발동·범위 공격 색을 무기 활성색 #b5d9ff로 통일한다. 범위 점선도 조건별 색상 옵션 사용. 회복 링과 포션도 같은 계열 색을 사용한다. 기존 회복 숫자의 공용 표시는 유지.

공용 확장: buff-duration-remaining 값 참조(stat/sourceId/duration), 패시브 조건의 이벤트 체력 스냅샷, 반격 프레젠테이션의 기존 colorVariants 참조, range.circle의 선택적 colorVariants, 선택적 character.healPresentation.color. 캐릭터 전용 전투/호게이지 모듈이나 캐릭터 ID 분기는 추가하지 않았다.

검증: 후리27개 실제 runtime 회귀(호게이지1→0.5→0, 첫 흡혈/제외 대상, 잔향의 조건·포션 스타일, 벽 뒤 피해/연출 차단, 레이카와 범위·연출 동일성, 색상/속도), 독립 runtime3개의 범위 반격 및 첫 흡혈 확정 패킷 검사, 전체35개 회귀 스크립트. build/docs/check/verify·runtime 구문·ZIP CRC 검사. 포션 벡터 및 잔향은 실제 Canvas 출력 확인. 실제 두 기기 브라우저/WebRTC 실전 플레이와 체감 밸런스는 별도 확인 필요.

## 후리 포식자·반격기·표식 개편 — 3.0.0-character.309 (2026-10-15)

후리 포식자의 기준을 절대 체력이 아닌 현재/최대 체력 비율로 변경. 후리 1000/1000과 상대 1799/1800이면 상대가 피식자다. 중심 거리 500의 감지 범위는 소유자 전용 점선 원으로 표시한다. 피식자는 레테 수신자 표식과 같은 체력바 옆 슬롯에 발톱 표식을 표시하고, 벽 없이 연결될 때만 소유자 화면에 점선을 그린다. 은신 감지 규칙 유지. 발톱 자국 무기 이미지는 평타로 움직이지 않으며, 포식자 적용 중에만 밝아진다.

포식자는 조건 유지 중 계속 갱신하고, 조건이 끊긴 뒤 2초 동안 효과가 남는다. 출혈은 제거하고 플레이어에게 실제로 준 직접 체력 피해의 50%를 회복한다. 소환수·훈련 봇·더미/DOT에는 회복 없음. 스킬은 피격 해제를 없애고 체력과 무관하게 2초 강제 활성화한 뒤 동일한 2초 잔여 효과를 남긴다. 자연/강제 활성화는 같은 출처 버프를 사용해 회복 속도 +70%가 중첩되지 않는다. 기존 평타/스킬 비용과 기본 스탯 유지.

반격기 선딜 0.3초는 공통 counterCharge와 경로 미리보기를 사용한다. 누락 원인은 기존 데이터의 비표준 반격기 태그로, 공통 반격 태그로 바로잡았다. 돌진은 레이카 반격기의 실제 이동 궤적 연출을 사용하며 벽을 통과한다. 발동 후 본인 기절 1초: 적중/미적중 모두 적용, 속박 제거. 적중 시 돌진 정지와 첫 대상 0.8초 무력화 후 부채꼴→일자→반대 방향 부채꼴→원형→큰 회전 원형을 차례로 발동한다. 반대 방향은 같은 전방 부채꼴을 반대 회전 방향으로 베는 연출이다. 각각 실제 범위 공격이며 주변 적도 맞고, 최초 표적 사망 후에도 나머지 범위 공격은 계속된다. 돌진 접촉 및 각 범위 공격의 피해는 모두 100. 자동 공격 첫 네 타는 공통 반격 CC 규칙의 무력화 0.2초, 마지막은 무력화 및 넉백 180. 최종 원형은 레이카와 같은 annularDoubleSweep. 반격 피해 범위도 벽을 무시한다. 자동 공격 단계 0/180/360/540/760ms.

공용화: target.health-ratio-lt-source 조건, resource.restore 이벤트 값 amountFrom/amountScale, 조건부 체력바 표식의 기존 무기 벡터 아이콘 재사용, 조건부 점선의 requireLineOfSight 옵션을 추가. 기존 hit.sequence에 선택적 authority:source/브로드캐스트/대상 사망 후 유지 옵션을 더했다. 적중 확정을 받은 공격자만 5연타를 예약하고 각 범위 공격을 복제해, 주변 다른 적도 각자의 피격 권위 화면에서 실제 피해를 받게 한다. 원격 피해 예측 미러에 직접 피해를 쓰지 않는다. 캐릭터 ID로 분기하는 전용 전투 모듈 없음.

검증: 후리 실제 runtime 20개 회귀와 독립 runtime 3개의 확정/트리거 공격 패킷 전달 검사. 전체 35개 회귀 스크립트, build/docs/check/verify, runtime JS 구문, ZIP CRC 확인. 발톱 비활성/활성 상태는 실제 Canvas 벡터 출력으로 확인. 실제 브라우저 두 기기 WebRTC 플레이와 체감 밸런스는 별도 확인 필요. 역할/문서/버전 갱신 완료.

## 후리 — 북극 늑대 추가 · 3.0.0-character.308 (2026-10-15)

기준 파일은 사용자가 지정한 Duels (2).zip / character.306. 보스전 구현은 포함하지 않는다. 후리(huri)를 63번째 공식 캐릭터로 등록. 체력 1000, 빠름(4.25), 파랑 #427dcc, 조건형 초근거리 암살자.

포식자는 중심 거리 500 안에서 자신보다 **현재 체력 수치**가 낮은 적을 감지한다. 소유자에게만 피식자 점선 표시. 은신 감지 규칙을 재사용하며 일직선 경로에 벽이 없으면 회복 속도 +70% 버프를 갱신한다. 마지막 조건 충족 뒤 2초 유지. 활성 상태의 모든 실제 공격 적중에 기존 공통 출혈 2초 적용. 아드레날린 포션은 2초 강제 활성화, 자연 발동과 중첩하지 않으며 실제 체력 피해를 받으면 강제 효과만 즉시 해제. 자연 조건이 여전히 충족되면 자연 포식자가 다시 발동할 수 있다.

지정되지 않은 초기 수치: 평타 피해 150, 사거리 130, 스테미나 150, 간격 0.35초. 스킬 스테미나 400, 쿨다운 2.5초. 반격기 공통 선딜레이 0.3초 뒤 450 돌진(120ms), 첫 타 50 피해와 0.8초 무력화. 접촉 후 정지하고 0.18/0.36/0.54초에 각각 50, 0.76초에 100 피해 및 무력화 넉백 180. 공격자는 연속 공격 동안 0.82초 속박으로 제자리를 유지한다. 적중 대상만 후속 공격, 대상 사망 또는 무력화 해제 이후 남은 타격은 취소. 벽 통과/이동 경로 선 없음.

새 캐릭터 전용 실행 분기 없이 기존 delivery.area/target, movement.move, effect.spawn 몸통 접촉, hit.sequence, status.apply/bleed, modifier.set, counter.execute를 조합했다. 기존 조건에 현재 체력 비교/범위 내 대상 검색/버프 출처 필터가 없어 TriggerConditionService에 범용 옵션을 추가했다. 기존 패시브는 조건 소실 즉시 제거여서 duration/retainOnConditionLost를 선택적으로 지원한다. 지연 연속 공격은 생존/단계 조건 검사 및 sourceModules를 지원한다. 온라인 피격 권위는 대상 연속 공격을 처리하고 피격 확정 통지를 받은 공격자 권위만 이동 정지/자가 속박을 한 번 적용한다. 기존 캐릭터는 이 옵션을 선언하지 않아 기존 경로 유지.

검증: 후리 12개 회귀(실제 조립 runtime 실행, 자원 소비, 포식자·출혈, 체력/거리/벽/은신 경계, 피격 해제, 돌진 정지/연속 타격/마지막 넉백, 회피·사망·무력화 해제, 확정 sourceModules 중복 방지) 및 전체 34개 회귀 스크립트. build/docs/check/verify와 JS 구문 검사, ZIP CRC 검사. DOM/시간 fixture에서 실제 runtime을 실행했으며 두 기기 WebRTC 및 실제 브라우저 화면 검수는 별도 필요.

직접 확인할 항목: 벽 뒤 피식자를 향해 걸어나오며 포식자 발동, 체력 역전 뒤 2초 유지, 스킬 사용 후 피격 해제, 반격기 첫 적중 정지와 마지막 밀어내기, 상대가 회피하거나 사망할 때 붙잡기 종료.

## 퇴장 통지/연결 생존검사·모든 게임단계 ESC 설정 — 3.0.0-character.306 (2026-10-14)

원인: pagehide는 입력만해제·명시적나가기도연결close에만의존. RoomService.leave 시작에 room-leave 제어통지(클라이언트→호스트/호스트→참가자)·pagehide에서silentleave. 수신은소켓자체에묶인현세대watchChannel에서기존호스트참가자정리 또는클라이언트hostmigration실행. 새제어패킷은gameplay/채팅디스패치와분리. close/error와중복실행없음·이전소켓/세대무효·reset/dispose타이머정리 유지.

공용watchChannel 5초ping/pong·데이터수신으로lastAt갱신·90초초과무응답이면기존disconnect경로. 급격한로컬타이머중단(15초이상poll지연)후에는응답검사를재시작해컴퓨터잠자기/호스트탭freeze뒤오탐을줄임. 신호서버끊김은기존대로liveDataChannel이탈로취급하지않음. 갑작스러운종료/네트워크유실은close/알림이없을시약90~95초후정리·즉시판별한다고주장하지않음.

PanelController.inGameContext는Training.active 또는방localPid 존재. ESC/입력차단/기존설정DOM body포털조건에공유. 방대기/선택/증강/라운드준비/전투/라운드결과/매치결과/관전에서메인설정동일패널을열수있음. 메인메뉴복귀/방퇴장 시 기존닫기복원 유지·설정값별도복제없음.

대상 RoomConnectionService/RoomService/pagehide초기화/PanelController·room/ESC회귀·project.json/README/PATCH/DIVIDE. 검증: 실제방hello승인→close없는room-leave로roster/connection삭제·ping/pong/장시간살아있는응답유지·90초무응답정리/중복/이전세대/타이머누수없음·실제공통DOM ESC 단계별열기/닫기·메인과원래위치복원. 전체33회귀·build/docs/check/verify/runtime구문·ZIP무결성. 실제브라우저탭종료/두기기WebRTC실전 미검증.

## 모든 이동기 도중 회피 무적 적용 — 3.0.0-character.305 (2026-10-14)

사용자정정: 타우전용예외/이동취소 없음. 모든 MovementAbilityService 이동기에서 회피를사용할수있고 기존이동경로/속도/시간을그대로유지·회피방향으로별도이동하지 않음. 원인 EntityDodgeService.activeMovement 일괄false반환. 해당차단제거·기존공용회피의 비용/주기/저회80ms/무적80ms/이벤트/증강연속회피/표시를그대로실행한뒤 별도회피MovementService.startMotion 이전에return. 이동기없으면기존방향회피이동 정상. 별도CC금지/채널금지/자원검사유지. 같은원격duel-action:dodge도실제이동기상태를보존하며회피무적적용·추가패킷/캐릭터ID분기없음.

타우만취소하는중간구현은삭제·tau.js와MovementAbilityService.js는원본byte동일. 대상 EntityDodgeService.js, tools/test-tau-hit-move.cjs, project.json/README/PATCH/DIVIDE. 검증: 실제타우적중/외곽/임의일반movement.start→회피성공·스테미나1회소모/공용80ms보호·movement state동일객체보존·실제update에서기존+X경로진행/회피+Y추가이동없음·부족한자원은실패후이동유지·원격스냅샷/회피재생경로유지·이동기없는일반회피방향이동유지. 전체33회귀와build/docs/check/verify/runtime구문·ZIP무결성. 실제두기기WebRTC/브라우저플레이 미검증.

## 선딜 취소 CC 한정 — 3.0.0-character.304 (2026-10-14)

사용자정정: 기절(stun)/빙결(freeze)/무력화(neutralize)/수면(sleep)에 선딜취소. 넉백/끌어당김/순수투사체운반에는 선딜유지. 속박/감속/침묵/방전은 이번취소목록에 추가하지 않음·기존새입력제한 유지. 지오핀근거리220/넉백60과체리티무제한 등 기존밸런스 유지.

공용 CCService.add의 양의지속시간 상태적용 순간에 AttackWindupService.interrupt 호출. 잠깐 걸린CC가 선딜끝전에 풀려도 이미취소됨. 예약취소/원격continuation/효과/시간게이지/채널준비/반격 제거·기존공용취소 이벤트/온라인패킷 사용. 사망/리셋/중복상태관리 유지. 기존태그없는 preattack timing.delay도 attackWindup 메타데이터로예약취소. 채널의 강제이동제외옵션은 네가지CC 면제가아님. 티냐 reveal도 네가지CC에서cancelActivation. ForcedMovementWindupInterruptService는네가지상태이유만전달·예전넉백패킷으로취소없음. completedWindup의행동제한우회는네가지활성CC에적용되지않음.

대상: CCService, AttackWindupService, ForcedMovementWindupInterruptService, SimulationScheduleService, AbilityModuleService, ChannelAttackService, AttackService, test-windup-continuation/test-tinya, project.json/README/PATCH/DIVIDE. 검증: 실제CC.add 네상태×가에/엔소냐태그여부에관계없이 스킬예약/반격/채널/게이지/FX/원격commit취소·1msCC뒤지연발사없음·순수강제이동과취소대상아닌상태유지·0msCC미취소·활성네CC완료우회차단. 실제티냐reveal네CC취소·밀기유지. 전체33회귀 및 build/docs/check/verify/runtime구문·ZIP무결성검사. 실제두기기WebRTC플레이 미검증.

## 지오핀 근거리220/넉백복구·시작된 선딜 유지 — 3.0.0-character.303 (2026-10-14)

지오핀 이중 충격 제작 근거리기준·실제압력·미리보기175→220. 제거 전 movement.knockback(distance60/speed12/direction:attack/when:on-hit)와 장착평타 참조를 복구. 실제150피해·동일 대상 중복없음·미적중 때만 끝에서 후속탄·모듈조합/은신실제적중10%/첫벽만감속 유지. 설명 넉백 복구.

공용 ForcedMovementWindupInterruptService.interrupt를 강제이동 취소없는 호환경로로 변경. 실제 넉백/끌어당김/투사체운반 및 이전duel-windup-interrupt 수신은 기존선딜 예약/효과/채널준비/시간상태/반격/원격commit을 삭제하지 않음. 기존 AttackWindupService 명시적취소API·사망/리셋정리 보존. 능력 timing.delay의 실제 선딜재개에서 completedWindup 컨텍스트를 전달하고 AbilityAttackExecutionService→AttackService.canUse에 연결. 완료된 선딜만 행동제한 검사를 건너뜀·새 입력/스테미나/쿨다운/사망검사 유지·무료시전도 사망검사 유지. Counter.finish도 같은완료플래그 사용. 티냐는 시작된activation을CC로삭제하지 않고 완료시같은플래그·선불소모를사용·새시전CC차단/사망취소유지. 파비채널준비는 강제취소경로에서보존·기존채널 실행경로 유지.

대상: geopin.js, ForcedMovementWindupInterruptService/AttackWindupService/AbilityModuleService/AbilityAttackExecutionService/AttackService/CounterModuleService/CircleFormationService, 지오핀/티냐회귀·신규test-windup-continuation.cjs, project.json/README/PATCH/DIVIDE/docs GEOPIN. 검증: 전체33회귀·근거리220경계/실제150피해·넉백60·원격넉백/벽반사유지. 실제 일반스킬delay→넉백·끌어당김→CC중종료1회·새공격차단·스테/쿨다운/사망검사유지. 실제반격finish·티냐activation 및 AttackService완료발사·사망취소. 원격continuation/선딜FX/반격/채널/시간게이지 보존. build/docs/check/verify/runtime 구문·ZIP CRC/바이트검사. 실제 두기기 WebRTC플레이 미검증.

## 지오핀 은신 적 실제타격 아이디어 누락 — 3.0.0-character.302 (2026-10-14)

원인: IdeaModuleService.hit 자체는 은신필터를 쓰지 않지만 damage-applied만 구독했음. 온라인 피해는 피격자권위에서 발생하므로 그 화면의 원격공격자 gain은 권위검사로 차단됨. 공격자에게돌아오는 확정패킷은 아이디어에 미연결. 보이는적은 별도 주변존재초당충전이 있어 누락이 가려질수있고, 감지불가은신적은 주변존재도제외되어 타격충전이 없는현상이명확히 나타남.

NetworkHitAuthorityService.receive의 기존 sourceConfirmedTriggers 중복방지 안에서 공용 source-damage-confirmed 이벤트 발행. initialization-equipment의 공통바인딩에서 기존 IdeaModuleService.hit으로 전달. 피해권위/은신감지/유도후보필터/주변존재·발명상황후보는 변경없음. 실제 양의 피해만10%·소환수제외·로컬권위·중복확정방지 유지. 캐릭터ID분기/새피해모듈/새패킷 없음.

대상: NetworkHitAuthorityService.js, initialization-equipment.js, tools/test-tau-hit-move.cjs, project.json/README/PATCH/DIVIDE. 검증: 실제 receive와 실제바인딩에서 감지불가은신/일반플레이어 각타격10%·원격damage-applied만으로는0 재현·같은패킷재수신/피해0/소환수/비로컬공격자0·다음별도타격20%·기존타우확정이동 유지. 전체32회귀 및 build/docs/check/verify/runtime구문·ZIP CRC/바이트검사. 실제 두기기 WebRTC플레이는 미검증.

## 체리티 무제한 평타·실제 발사점 조준선 잔광 — 3.0.0-character.301 (2026-10-14)

체리티 lmb.range를 기존 공용 데이터 표현 Infinity로 변경. 차징dynamicSpec/증강/공용투사체 사거리·카드정렬은 같은 무제한값 사용. 일반탄 벽차단/완충 벽관통·적1회타격·맵외곽제거는 기존판정 유지. Infinity 때문에 Canvas에 무한 좌표를 전달하지 않도록 조준선과 일반/산탄 공용 투사체 미리보기의 관통경로 표시만 WorldGeometryService.boundaryRayDistance로 현재맵 끝까지 유한화. 실제 공격 사거리에는 표시거리 적용하지 않음.

원인: drawChargeAimLine이 마지막 그리기 프레임의 source좌표/조준각만 보관하여 렌더사이 빠른이동·발사 후 300ms잔광이 이전위치에 남았음. 공용 TrainingPresentationBindings의 실제 projectile-fired 이벤트에서 ArcGaugePresentationService.captureChargeShot 실행. 실제투사체 생성 x/y/launchAngle과 발사시각으로 잔광을 갱신·반경오프셋0으로 실제출발점 표시. 원격과 로컬 모두 로컬효과음 조건 이전에 처리·이전렌더없어도 생성·발사후이동과조준변경은잔광위치/방향을바꾸지 않음. 다음차징은 기존실시간본체/조준각추적·팀색/은신숨김/사망삭제/300ms페이드 유지. 새로운패킷/캐릭터ID분기 없음.

대상: cherity.js, ArcGaugePresentationService.js, TrainingPresentationBindings.js, AttackPreviewService.js, test-update250/test-hab-projectile/test-character-range/test-geopin/test-siro, project.json/README/PATCH/DIVIDE. 검증: 실제 spawn→projectile-fired→잔광좌표가100/200에서900/600 발사후1400/700이동해도900/600·발사각0.7 유지, 이전그리기유무·로컬/원격·150ms반투명/300ms삭제·일반/완충유한맵미리보기·1400이후실제피해·벽차단/관통·외곽제거. 전체32회귀와 build/docs/check/verify/runtime 구문·ZIP 무결성검사. 실제 두기기 WebRTC 및 실제브라우저시각 미검증.

## 지오핀 근거리·탄속·첫 벽 감속·아이디어·버터 조정 — 3.0.0-character.300 (2026-10-14)

이중 충격 모듈의 제작 근거리 기준과 실제 압력/미리보기 범위175. 근거리 공격의 movement.knockback과 평타 장착옵션 참조 제거·피해150 및 미적중 시 끝에서 고무탄 발사 유지. 기본/후속탄과 정밀 모듈 탄속 모두 기존값×0.7(32.643→22.8501, 51.83421428571428→36.28395). 후속탄 고유 사거리400/정밀600은 유지. 이동속도3.75/느림 및 CHARACTER_RULES 표시 동기화. 버터 이동속도800→1200·HP400/벽통과/운반/실시간 거리0.7소모 유지.

발명은 타격/주변 공격 관측각10%, 범위350 내 적 한 명당초당20%·소환수제외 유지. 근거리175 밖은 정밀 상황 후보. 반격50%·세모듈완성100% 고정 유지.

공용 projectile.redirect의 선택적 wallSpeedOnce:true 선언: 첫 실제 벽/맵외곽 반사에서만 기존50% 감속. 이후 벽은 속력유지·적중 반사50% 감속은 기존대로. wallRedirectCount를 기존 온라인snapshot으로 복제. 근거리 압력이 벽에 닿아 생성하는 실제탄은 첫 감속이 소비된 redirect 모듈로 전달해 다음벽에서 중복감속없음. 옵션미지정 기존캐릭터·옛fixture는 매벽감속 유지.

대상: geopin.js, CHARACTER_RULES.js, ProjectileRedirectService.js, 지오핀/버터회귀, docs/GEOPIN.md, project.json, README/PATCH/DIVIDE. 검증: 전체32개 회귀·일반/정밀30%·175경계/미리보기/150피해·원격넉백없음·첫벽/4연속벽/원격복제/압력반사후추가벽감속없음·소환수0/적1~3명초당20/40/60%·실제버터1200운반·벽뒤150수신 유지. build/docs/check/verify/runtime 구문·ZIP CRC/파일바이트검사. 실제 두 기기 WebRTC 플레이는 미검증.

## 요오 캐릭터 삭제·지오핀 다수 적 충전/소환수 제외·벽뒤 피해 복제 — 3.0.0-character.299 (2026-10-14)

요오를 숨김이 아닌 삭제 처리: src/data/characters/yoo.js, 출시 index 항목, CHARACTER_RULES.moveLabels, docs/YOO.md, 요오 전용 회귀파일 제거. 공식등록62명·캐릭터 선택/금지/카드/출시 목록은 기존 동적 등록을 따름. 공용 선택/분열/반사 등 모듈은 보존·다른캐릭터 전투를 삭제하지 않음. 요오 검사에 함께 있던 미아루키 공구함 회귀는 독립 tools/test-miaruky-toolbox.cjs로 이관. 공통 반사이동 검사는 캐릭터와 무관한 reflection-attack fixture로 교체·공식캐릭터 데이터/등록에는 미포함. 과거 PATCH 기록은 역사로 보존.

geopin.ideaModules.presencePerEnemy:true/excludedEntityKinds:[summon] 선언. 공용 IdeaModuleService는 살아있고 유도감지 가능한 주변 적 각개체당 기존초당10%를 누적: 1명10%/2명20%/3명30%. 같은친구/자신/은신·범위밖 제외 유지. 소환수는 주변존재/상황발명 후보/타격20%/소환수공격·투사체·효과20%의 모든 충전에 기여하지 않음. 다른 데이터가 이 옵션을 생략하면 기존행동 유지. 설명도 주변 적 한명당10%로 갱신. 반격50%·모듈완성100%고정·범위350 유지.

벽뒤 피해 원인: OnlineDuelService의 duel-projectile-relay 수신 검증은 attacks.*.modules만 검사했음. 현재 지오핀은 충격전달을 attackFeatureTransform.options[].modules에 선언하므로 공격자 측 실제150 충격이 발생해도 피격자 화면의 패킷은 검증단계에서 거부·피해 미처리. 공용 ProjectileRedirectService.declaredRelay가 기본 모듈과 선언된 장착옵션 모두 검사하도록 확장하고 기존 수신경로에서 사용. 순간적인 원격모드 snapshot 지연과 무관하게 선언 검증·피격자 권위 fireRelay→AreaAttackService 경로 재사용. ownerPid/송신자/라운드/실행seq/공격ID/좌표/중복키 검증 유지·다른 공격ID나 위조owner 거부·피해150 유지·벽관통 직사각 원점/범위 변경없음.

검증: 전체32개 회귀 통과. 공식62명/요오파일·등록없음/구조·사거리/반격·미아루키회복 및 일반반사이동 유지. 지오핀 실제 update에서 적1/2/3명 1초 아이디어10/20/30%, 소환수존재/타격/공격/투사체/효과0%. 실제 현재Wall 모듈 준비→벽충돌→relay 패킷 생성(벽끝262)→OnlineDuelService.receive→HealthService로 피격자1000→850; 이전기본모듈검증false 재현·원격Wall 모드가 아직없어도 정상수신·중복패킷 추가피해없음·다른공격/owner위조 차단. build/docs/check/verify/runtime 구문 및 소스잔여등록 검사. 실제 두 기기 WebRTC 플레이는 미검증.

## 인게임 ESC 메인 설정 패널 — 3.0.0-character.298 (2026-10-14)

인게임 ESC를 capture 단계에서 처리해 채팅/가에 명령/디버그/관전/입력필드 상태와 무관하게 메인 설정을 열고 다시ESC로 닫음·길게누른 repeat는 재토글하지 않음. 기존 PanelController/duels-display-settings-panel 자체를 사용·새설정 복제/별도데이터 없음. 숨겨진 scr-lobby 자식이라 게임에서 보이지 않던 패널을 열 때만 document.body로 옮겨 고정 중앙 탭으로 표시·최대높이와 스크롤 적용. 닫을 때 원래 DOM 위치로 복원·기존설정/버튼 바인딩/값 유지. 열기 시 DisplaySettings.syncUi/ProfileSettingsUI.render 그대로 재사용·×닫기도 기존동작.

열 때 GameInputResetService.releaseAll로 이동/홀드/드래그 입력 해제·훈련 개별패널/디버그/채팅 닫음. 설정이 열려 있는 동안 전투 키다운/키업/외부클릭/휠을 공통 패널 입력차단으로 막고 패널 내부 네이티브 입력/슬라이더/버튼/Tab/스크롤은 유지. 게임 진행은 정지하지 않음. 훈련장 선택 화면/온라인 세션정지/나가기에도 설정 닫고 메인 위치로 복원. 훈련장 전용 설정은 별도HUD 버튼의 기존기능 유지. 기존 전투단계 ESC 중복분기는 삭제·메인화면 입력은 기존대로.

검증: 전체32개 회귀파일 통과. 실제 PanelController 및 capture/bubble 키보드 handlers에서 숨겨진로비의 동일DOM이body위로이동·ESC열기/입력필드ESC닫기/×호출/길게누름 재토글없음/온라인·관전/채팅닫기·이동/홀드해제·Space/Shift/외부클릭/휠 전투차단·설정내키/클릭/휠허용·닫힌후전투복귀·메인위치/값/노드순서 복원 검사. build/docs/check/verify/runtime 구문 검사. 실제 브라우저 시각과 두기기 온라인 플레이 미검증.

## 지오핀·버터 설명·속도·무제한 거리 비례 소모 — 3.0.0-character.297 (2026-10-14)

요청 문구 그대로: RMB DRAG 도우미 로봇 “버터의 이동경로를 지정”, 버터 ABILITY “경로를 이동하며 이동경로의 아군을 운반”. 버터 이동속도1200→800(초당 월드거리·약33% 감소). HP400/기본 소환수 몸체/벽통과·하차보정/단일비관통 투사체 보호/사망대기 없음 유지.

지오핀 input.drag-path.cost.perDistance를 하츠하츠 RMB와 동일한0.7로 설정. 기존 실시간 sample/spendSegment 경로 재사용·그린 월드 경로거리마다 스테미나0.7 소모·포인터정지 시 소모없음·소환실행 AttackSpec 비용0으로 놓을 때 이중소모없음. 설명 비용도 하츠하츠와 같은 costRef per-distance로 실제 입력 모듈을 참조하여 스테미나0.7/px 표기. 드래그 입력 maxDistance1000 및 경로 carrier maxDistance 참조를 둘다 제거·미지정 공용Infinity 처리로 길이제한 없음. 맵경계는 기존 물리한계 유지.

공용 DragPathInputService.capturePointer의 놓는 순간 마지막 미샘플 구간도 실시간 sample과 같은 spendSegment를 사용하도록 보정. 마지막 구간의 비용이 부족하면 남은스테미나만큼 거리만 추가하고 이미 지불한 경로는 실행 가능·스테미나0/frozen 경로는 추가비용 없음. 유한 maxDistance를 사용하는 기존 드래그는 남은유효거리까지만 기록. 캐릭터ID분기/새모듈/패킷 없음.

검증: 전체31회귀파일 통과·운반12그룹·실제 sample에서300거리/210소모→정지추가0→500거리/350소모→400거리/280소모·총1200거리/스테160 남음/Infinity·놓을 때 추가소모0. 마지막200거리 입력에 스테70만 있으면100거리까지만 기록/스테0/지불된경로로400HP 버터생성·800속도. 일반경로1200 전체수용·속도변경 후 물리도달시간/벽통과/운반/파괴/대리피격/원격보호 유지. 실제 설명HTML 두문구/스테미나0.7/px 참조·build/docs/check/verify/runtime 구문 검사. 실제 두 기기 WebRTC 플레이·브라우저 시각 미검증.

## 버터 기본 소환수 표시·벽 통과·탑승자 투사체 보호 — 3.0.0-character.296 (2026-10-14)

사용자지시로 helper-robot 전용 몸체 렌더와 butter.presentation을 제거. 다른 소환수와 동일한 SummonVisualPresentationService 기본 원/점선윤곽/체력 표시 사용. 버터HP400/독립 경로/파괴/사망 대기없음/설명 유지.

지오핀 movement.path-carrier.collision.passWalls:true 및 riderCollision을 같은 collision 데이터에 참조. 경로와 탑승자 이동 모두 공용 CollisionPolicyService/MovementService의 벽통과 정책 사용·맵외곽 제한 유지. 탑승자/버터에는 공용wallPass 버프를 이동 중 갱신하여 다른 위치보정/강제이동에서 벽 밖으로 튕기지 않게 처리. 하차/파괴/삭제/리셋 시 해당 버프 해제·탑승자가 벽 내부라면 공용 ensureValidPosition으로 정상 위치 복귀. 픽업의 실제경로/벽사이 감지 및 아군 운반 유지.

summons.butter.protectRidersFromProjectiles:true 선언. PathCarrierService.projectileTarget은 살아있는 같은 generation 버터에 탑승한 적을 향한 단일 비관통 projectile만 버터로 대상을 교체한다. ProjectileService.processTargets의 실제접촉후 대상선택을 피해/저회/무적/필터 처리보다 먼저 적용·실제접촉 geometry는 원래 탑승자 좌표를 유지하여 원격 버터 미러 위치차에도 대리피격 가능. hitTarget도 같은 공용 선택기를 적용하여 귀환/직접적중 호출을 포함. 피해/상태/적중이력/권위대상은 버터 한 대상만 사용. 아군지원/관통/범위투사체/반복틱/착탄범위 전용 투사체는 제외·범위 공격은 탑승자를 정상 타격. 버터사망/하차/옛generation은 보호하지 않음.

OnlineDuelService의 기존 duel-state에 pathCarrierRide {ownerId,stateKey,sequence}를 추가·각 플레이어가 자신의 탑승 상태만 전파. 원격 탑승자는 공용 PathCarrierService.carrierFor에서 실제 버터 생존/상태/generation을 확인해 동일 대리피격을 사용. 객체참조/새패킷/캐릭터ID분기 없음. 소환수 설명 ABILITY에 벽통과와 단일투사체 대신맞기를 추가.

검증: 전체31개 회귀파일(30개통과 후 신규 운반회귀의 누락 mock 보완 재통과)·운반10그룹. 기본 소환수body 실제렌더가 원을 그리고 로봇roundRect를 사용하지 않음·버터/탑승자 벽을 통과해700도달·맵외곽975제한·벽내부280에서 wallPass버프 유지/하차 후 해제 및 충돌없는 위치·실제 hitTarget/HealthService에서150피해는 버터에만/탑승자1100유지·원격 탑승 snapshot 동일 버터 연결·관통/범위투사체는 탑승자피해·실제 processTargets에서 원격몸체 오프셋/탑승자 무적분기 이전 대리피격·버터사망/하차후 보호해제. 이전400HP파괴/재소환/역순보호/타우확정이동 유지. build/docs/check/verify/runtime 구문 검사. 실제 두 기기 WebRTC 플레이·실제 브라우저 시각 미검증.

## 지오핀 독립 경로 버터 소환수·타우 예측 접촉 소비 수정 — 3.0.0-character.295 (2026-10-14)

사용자정정: 경로는 지오핀과 이어지지 않아도 됨. 버터는 타격·파괴 가능한 체력400 소환수·사망7초쿨다운 없음·DEATH 설명 없음. 기존 input.drag-path의 명시적 pathOrigin:pointer는 첫 포인터 좌표부터 경로 수집하도록 확장(기존 source/미지정 동작 유지). PathCarrierService도 pointer 첫 점에서 시작. 지오핀 RMB DRAG 도우미 로봇 설명 유지.

movement.path-carrier의 summonStateKey 옵션으로 실제 공용 SummonDeployService/Entity 생성·피해·체력표시·사망·상태복제를 조합. geopin.summons.butter는 maxHealth400/respawnDelay0/healthRegenfalse/공격AI없음·기존 이동속도1200 및 픽업반경45 유지. 경로 끝에서 하차하고 소환수 종료·파괴/소유자사망/삭제/리셋 시 운반해제. 재사용은 이전경로 종료 후 새버터400으로 소환·추가 사망대기 없음(스킬 자체300ms 쿨다운은 기존값). 각클라이언트는 자신의 아군 이동만 처리. 기존 pathCarrier FX는 경로와 공용소환스냅샷만 전파·몸체는 공용 소환수 렌더에 helper-robot style로 표시하여 중복그림 제거. summonSpecs에 HEALTH400/ABILITY 운반만 등록·DEATH/MOVE SPEED0 미표시.

공용 pathCarrier 소환수 generation/ended snapshot으로 오래된 경로·생존 패킷이 파괴되거나 교체된 버터를 다시 살리거나 새버터를 지우지 않도록 처리. 다른 소환수는 이 옵션과 메타데이터를 사용하지 않음. 캐릭터 ID 분기 없음.

타우 원인: 로컬 공격자 화면의 원격 적 접촉은 authoritative:false 예측이다. 기본 predictiveConsumeOnContact:true에서는 processTargets가 투사체만 즉시삭제·피해/onHit이동은 실행하지 않음. 같은방향 이동·화면별 위치차로 target권위 적중이 확정되지 않으면 이동도 오지 않는다. 타우 outbound delivery.projectile에 기존 공용 predictiveConsumeOnContact:false를 적용하여 실제 target 확정 전 예측소비를 차단. 다른캐릭터 공통예측/피해/저회·귀환·외곽 이동 변경없음. 실제지연 hit-confirmed는 이미 사라진 투사체여도 확정impact좌표로420ms 이동·중복패킷은 이동재시작없음을 검증.

검증: 전체31개 회귀파일 통과. 실제 DragPath start/release 경로 첫점600(본체100)→800; 실제 SummonDeploy 생성/HP400/경로 이동/아군운반·HealthService400피해 및 destroy→운반해제/즉시새소환400. 원격 FX→공용소환 생성/대상권위/죽은generation 재생차단/새generation 보호. 모듈회전8조합·외곽반사 유지·실제설명HTML 버터/400/소환수표시. 타우 실제 processTargets 예측소비 전후 및 실제 NetworkHitAuthorityService.receive의 지연/제거후478거리420ms 이동·중복확정 재시작없음·맵4변/모서리 이동/일반귀환 유지. build/docs/check/verify/runtime 구문 검사. 실제 두 기기 WebRTC 플레이·브라우저 시각 미검증.

## 지오핀 공격 회전·도우미 로봇·맵 외곽 반사 — 3.0.0-character.294 (2026-10-14)

근거리 모듈이 delivery.projectile을 제거하면 on-delivery 회전도 누락되던 원인 수정. geopin-shot-image의 mode.toggle을 after-attack으로 옮겨 실제 공격 후 본체와 장착된 모든 파츠가 같은 회전 상태를 사용. 기본·근거리·정밀·벽뒤 8조합 동일·기존 ModeState 원격 snapshot 재사용.

RMB 궤도변경을 RMB DRAG 도우미 로봇으로 교체. 설명: “버터가 경로를 빠르게 이동하며 이동 경로의 아군을 들고 이동합니다.” 기존 input.drag-path start/release/clear, action.attack, 공용 CollisionPolicyService/MovementService, effect-spawn 복제 재사용. 기존 summon.carry는 소환수가 주인을 따라가는 기능이라 경로를 이동하며 다른 아군을 태울 수 없어 공용 movement.path-carrier 및 PathCarrierService 추가. 캐릭터 ID 분기 없음·순수 데이터의 speed/radius/pickupRange/targetRelations/collision으로 조절. 지오핀부터 우클릭으로 최대1000 경로를 그린 뒤 놓으면 버터가 초당1200 이동·반경45+대상반경 이내 자신/아군 플레이어 운반. 벽과 외곽에서 경로 종료·종점에서 하차·적/소환수 제외·각 화면에서 자신의 권위 대상만 이동. 기존 스킬 비용0/쿨다운300ms 유지. 체력/공격/소환수 UI는 추가하지 않은 이동 로봇.

경로 각 선분의 연속 접촉 검사로 빠른 이동·긴 프레임·꺾인 경로에서도 픽업 누락 방지. 운반 대상은 기존 충돌 이동거리로 벽에 끼지 않게 처리·운반 중 일반이동 중복 방지. source/대상 사망, keyed 삭제, 종료, clearAll/훈련 리셋 시 운반 상태 해제. 기존 이펙트 상대 clock 복제·운반 대상의 실시간 참조는 snapshot에서 제외.

근거리 압력의 pressureContact가 일반 wall만 찾던 원인 수정. 출력 고무탄 반경으로 boundaryRayDistance 및 경계 법선을 검사하고, 기존 wall(carrier,true) 반사·안전 위치·탄속50%·유도를 재사용. 남은 사거리에서 접촉/이탈거리 차감·일반벽 충격전달 유지·외곽에서 가짜 벽뒤공격 없음·실제 반사탄 한 번만 생성.

검증: 전체31개 회귀파일 통과·실제 prepared AttackSpec afterAttack 8조합 회전/원격 ModeState·실제 FX→맵4변/모서리 반사탄1회/탄속절반/안전원점·일반사거리끝 반사없음·실제 드래그 입력/성공공격 조건/꺾인경로 아군2명 운반/벽·맵외곽/적·원격·소환수 제외/온라인FX 상대clock·대상권위/사망·삭제·리셋 정리/로봇 렌더 색상 유틸. build/docs/check/verify/runtime 구문 검사. 실제 두 기기 WebRTC 플레이와 실제 브라우저 시각은 미검증.

## 가에 FIX 매사용 첫 회복·주기 갱신 — 3.0.0-character.293 (2026-10-13)

runFix의 기존활성버프 첫회복 차단조건 제거·매사용 ResourceRestoreEffectService 즉시50회복. BuffService.refresh 데이터 nextTick=현재시점+tickInterval 전달하여 기존 재생버프도 다음회복시각을1초뒤로 재설정. 기간은기존처럼 재사용부터5초·동일 sourceKey 단일버프로 유지·회복속도중첩없음. 원격명령표시는 회복재실행하지 않음·설명 매사용 첫회복 및 주기갱신 추가. 공용BuffService/다른재생효과 변경없음.

검증: 가에12그룹/공개표시·재생회귀·초기50/활성중재사용50/동시4사용200·재사용7500시점 nextTick8500/기간12500·8000/8499미회복/8500에50회복·버프1개·만료/사망/리셋/원격중복회복없음·build/docs/check/verify/runtime구문. 실제두기기WebRTC 플레이 미검증.

## 지오핀 반사 장치 제거·즉시 궤도 변경 스킬 — 3.0.0-character.292 (2026-10-13)

사용자정정으로 회수소환수 체력표시 요청은 이번범위 제외·해당공용표시 변경없음. geopin.summons/summonSpecs 삭제·RMB summon.toggle→action.attack·회수설명 제거. RMB 이름궤도변경·효과는 이미날아가는 자신의rubber 패밀리 탄환 전부의 방향을 각탄환에서 가장가까운 유도가능 적으로 즉시변경. 빈타겟이면 기존궤도유지. 스테미나0/쿨다운300ms 유지·지점설치사거리 제거(range0).

기존 projectile.redirect를 after-attack 단계에서 실행하는 공용 처리 추가·ProjectileRedirectService.retargetOwned가 기존nearest/aim/broadcast 재사용. 현재탄속/남은사거리/travel/벽·적튕김횟수/적중이력 유지·탄속감소추가없음·다른소유자/다른패밀리/정지·종료탄 제외·벽/은신/이미맞힌적 유도 제외. 소유자권위·실행당1회·기존방향전환 패킷으로복제. 기존반사장치 공용서비스 회귀자료는 tools fixture에만 보관·공식런타임 미포함.

검증: 전체30회귀(새13그룹 포함)·실제afterAttack→자기2고무탄 즉시회전/다른주인·패밀리제외/재실행중복없음·속도32.643/8.16 및 travel120/maxRange900·적중이력 보존·snapshot 방향복원·벽/은신/이미적중/원격소유자 제외·실제설명HTML 궤도변경/반사장치·회수·소환수항목없음·build/docs/check/verify/runtime구문. 실제두기기WebRTC 플레이 미검증.

## 지오핀 반사 장치 소환수 설명 등록 — 3.0.0-character.291 (2026-10-13)

summons 데이터만 있고 공용설명 렌더용 summonSpecs 등록이 없어 반사장치 설명 누락. 기존다른소환수와 같은 summonSpecs/stateKey/stats 형식으로 HEALTH {maxHealth}/ABILITY 고무탄 적중 시 탄속감소없이 가장가까운적방향발사/DEATH 사망시{respawnSeconds}초재사용불가 추가. 체력900/대기7초 실제데이터 참조·MOVE SPEED0 미표시·전투변경없음.

검증: CharacterDescriptionService.interpolateSummon 및 실제html [SUMMON]반사장치 하단에900/능력/7초/이속0없음·공용무기회귀·build/docs/check/verify/runtime구문. 실제브라우저 시각 미검증.

## 지오핀 근거리 넉백60 — 3.0.0-character.290 (2026-10-13)

근거리 movement.knockback.distance90→60. 실제평타의 참조도 자동반영·속도12/공격방향/피해150/벽반사 유지.

검증: 실제FX생성→피해→MovementService에서 거리60/속도12/이동12px·원격snapshot복원/중복방지/벽반사회귀·build/docs/check/verify/runtime구문. 실제두기기WebRTC 플레이 미검증.

## 지오핀 근거리 넉백 절반·벽 접촉 반사탄 — 3.0.0-character.289 (2026-10-13)

동일요청 재전송은 추가절반으로 해석하지 않음. 근거리 movement.knockback.distance180→90(속도12 유지)·실제평타의 기존참조도 자동반영.

근거리 pressureContact는 충격전달 파츠뿐 아니라 벽튕김 설정이 있으면 벽접촉을 감지. 소유자 확정 접촉에서 실제 ProjectileRedirectService.wall을 재사용해 벽법선/이음새이탈/은신·벽차단유도/탄속50%를 적용한 후 실제 고무탄발사. 남은전체사거리에서 벽이탈량 차감·가상carrier redirect 패킷 억제·실제탄환은 기존공용 발사패킷. 벽뒤파츠 있으면 기존150충격전달도 동시에 사용. 근거리 압력은 접촉점 종료/끝탄 미발사/재프레임 중복없음·적 선적중 시 벽탄없음·원격은 접촉종료만 하고 소유자탄환사건 재생.

검증: 실제 spawnAttackEffect→progressive접촉→wall재사용에서 벽뒤파츠없는 반사탄1회/속도16.3215/원점203(벽220·탄반경15)/반사각/남은513·벽뒤파츠 충격150 1회+반사탄1회·적 선적중/원격 중복탄없음·실제 넉백90/원격복원·전체30회귀·build/docs/check/verify/runtime구문. 실제두기기WebRTC 플레이 미검증.

## 지오핀 근거리 모듈 실제 넉백 누락 수정 — 3.0.0-character.288 (2026-10-13)

원인: 실제 AttackModuleService.spawnAttackEffect는 effect.damage.attack에 준비된 원래평타(lmb)를 저장·initAnimation은 attackId:punch보다 저장된attack을 우선. 근거리옵션은 압력FX만 추가하고 넉백은 별도punch에만 있어 로컬 실제적중onHit에 넉백없음. 이전검사는 animationState.attack을punch로 직접주입하여 실제생성경로 누락을 놓침.

수정: 근거리옵션의 실제평타 모듈에 {$ref:attacks.punch.modules.1}로 기존강넉백180/12/공격방향 모듈을 추가. 수치복제/캐릭터ID분기/공용엔진변경없음. 파츠없음/미적중끝탄에는 넉백추가없음·압력150/후속중복방지/장치반사/벽전달/무기형상 유지.

검증: 실제spawnAttackEffect→initAnimation→progressive피해→MovementService 경로에서 수정전150피해/forcedMotion없음 재현·수정후150피해1회/거리180/속도12/공격방향·실제updateForced12px이동/재프레임재적용없음·presentation snapshot 원격온라인소스/로컬대상 복원도넉백180·전체30회귀·build/docs/check/verify/runtime구문. 피해권위패킷은VM검사·실제두기기WebRTC 플레이 미검증.

## 지오핀 근거리·벽뒤 모듈 재디자인 — 3.0.0-character.287 (2026-10-13)

근거리 압력총구는 길이/폭을 줄이고 앞면압력판/후방장착선/두짧은홈으로 새로 정리·기존총구 대체유지. 벽뒤는 본체에 붙는 사각슬라이드 장치/장착밴드/중앙부로 변경·후면중심과 접합x-1.48 유지. 공용계열색/모션/조건·정밀/본체/전투수치 유지.

검증: 근거리단독/벽뒤단독/전체파츠3상태형상·공용무기렌더/8파츠조합회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 네모 파츠 간결화 — 3.0.0-character.286 (2026-10-13)

충격전달 네모 부품 높이.7→.54·길이.7→.62로 축소·총뒤중심y-.205/접합x-1.48 유지. 뒤쪽 두모서리 작은모따기·내부테두리/여러고정선 제거·짧은패널선 하나만 남김. 공용계열색/모션/조건/전투수치 유지.

검증: 공용무기렌더/8파츠조합회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 네모 파츠 부착 정렬·패널 — 3.0.0-character.285 (2026-10-13)

충격전달 네모중심y-.11에서 총후면 직선접합면의 중심y-.205로 정렬·부품오른쪽 x-1.42→본체후면x-1.48로 밀착. 본체와 공용원점/회전 유지. 네모형태 보존·안쪽테두리/중앙패널선/짧은고정선 추가·전투변경없음.

검증: 단독/전체파츠2상태 형상 확인·공용무기렌더/8파츠조합회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 충격 전달 단순 네모 부품 — 3.0.0-character.284 (2026-10-13)

충격전달 후방 하우징을 단일 정사각형 부품으로 단순화. 내부선/별도끝판 제거·본체뒤에 직접부착·캐릭터계열색/공용조건/모션 유지·전투변경없음.

검증: 공용무기렌더/8파츠조합 회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 충격 전달 본체 밀착 하우징 — 3.0.0-character.283 (2026-10-13)

후방 두피스톤/노출 연결축을 본체 후면 폭에 맞춘 단일 하우징으로 교체. 짧은 모따기 외곽/내부압축부/후면마감판으로 구성·본체에 직접밀착해 떨어진장식처럼 보이는 형태 제거. 계열색/공용모션/조건 유지·다른무기/파츠/전투수치 변경없음.

검증: 충격전달 단독/전체파츠2상태형상·공용무기렌더 및 지오핀8파츠조합 회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 충격 전달 파츠 이중 피스톤 — 3.0.0-character.282 (2026-10-13)

후방 C형 프레임을 위아래 평행 이중 피스톤/짧은 연결축/장착클램프로 교체. 총뒤 부착자리/캐릭터계열색/공용모션/조건 유지·다른무기/파츠/전투수치 변경없음.

검증: 충격전달 단독/전체파츠2상태형상·공용무기렌더 및 지오핀8파츠조합 총구상호배제 회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 충격 전달 파츠 형상 변경 — 3.0.0-character.281 (2026-10-13)

후방 원반형 전달판을 제거·안쪽이 열린 각진 C형 전달프레임/연결축/보강선으로 교체. 총뒤 부착자리/캐릭터계열색/공용모션/조건 유지·다른무기/파츠/전투수치 변경없음.

검증: 충격전달 단독/전체파츠2상태형상·공용무기렌더 및 지오핀8파츠조합 총구상호배제 회귀·build/docs/check/verify/runtime구문. 실제게임브라우저플레이 미검증.

## 지오핀 파츠 재배치·근거리 총구 교체 — 3.0.0-character.280 (2026-10-13)

정밀 파츠는 연장총열/상부조준부 제거·하부 직선형 조준보정장치로 재설계. 충격전달은 후방 각진박스 대신 원반형 전달판/연결축으로 변경. 근거리 모듈은 기존총구 위에 덧붙이지 않도록 기본총구를 독립 rubber-muzzle 형상으로 분리·inactive 조건에서만 표시·장착 시 넓은 압력총구로 실제교체. 본체/같은팔레트/공용모션/전투수치 유지.

검증: 기본/근거리/정밀벽뒤/전체4상태 형상·실제공용 sampleWeapons8조합 기본총구/근거리총구 상호배제 및 두파츠독립·무기회귀/지오핀12그룹/구조회귀·build/docs/check/verify/runtime구문. 실제게임브라우저/두기기WebRTC 미검증.

## 지오핀 정밀·충격 전달 파츠 형상 변경 — 3.0.0-character.279 (2026-10-13)

정밀 파츠는 기존 긴 직선총열 대신 단계적으로 좁아지는 정밀총열/장착칼라/상부조준부로 변경. 충격전달은 하부카트리지 제거·총뒤 연결부와 각진 후방 전달장치/세로보강대로 재배치. 공용 기준점/계열팔레트/조건/모션 유지·전투변경없음.

검증: 기본/정밀/충격전달/전체파츠4상태형상·공용무기렌더회귀·지오핀12그룹·build/docs/check/verify/runtime구문. 실제브라우저플레이 미검증.

## 슈비 형상 참고 지오핀 무기 다듬기 — 3.0.0-character.278 (2026-10-13)

슈비 electronic-shotgun의 실제 넓은 각진 본체/사각총구/측면패널/3개홈을 참고해 지오핀 고무탄발사기를 조정. 손잡이/방아쇠틀을 위쪽으로 배치·본체와 파츠 공통기준점(.025,-.22). 근거리 사각압력칼라/정밀 연장총열/벽뒤하부 전달부도 같은 직선형 패널 디자인 적용. 공용 팔레트로 지오핀 계열색·모션/조건/전투수치 유지. 슈비 원본형상 유지.

검증: 슈비/지오핀기본/근거리/전체파츠4상태 비교·공용 무기렌더 회귀·지오핀12그룹·구조회귀·build/docs/check/verify/runtime구문. 실제게임브라우저/두기기WebRTC 미검증.

## 지오핀 무기·파츠 재디자인 및 반격·칸수색 — 3.0.0-character.277 (2026-10-13)

발사기 본체·위손잡이·약실·총구를 새 형태로 변경. 근거리 압력포크/원거리 연장총열 및 조준레일/벽뒤 하부 전달카트리지로 공용 형상 재디자인·파츠 조합에서 부착자리 구분·기존공용 팔레트/조건/모션 유지. 반격 damageRatio2.5→1.5로150피해. 칸수3색의 고정밝은색#fff5a3를 순수 {$ref:color}로 바꿔 본래 캐릭터색#e6ca3b와 일치.

검증: 실제컴파일 반격150/각칸색 캐릭터색 동일·무기4상태형상 확인·공용 무기렌더 및 전체30회귀·build/docs/check/verify/runtime구문. 기존 근거리 중복방지/넉백/반사장치/벽전달 유지. 실제두기기WebRTC 플레이 미검증.

## 미아루키·티냐 조정 및 근거리 모듈 전달 연동 — 3.0.0-character.276 (2026-10-13)

미아루키 반격 damageRatio2.5→2로200피해. 공구함 설치 movement.knockback 삭제·아군200회복/재사용회수/범위176/비용 유지·설명 넉백 제거. 티냐 difficulty6→5(일반5별).

지오핀 근거리 압력에 interactionAttackId로 기존 고무탄 후속 AttackSpec을 선언. 공용 진행형FX가 실제 진행 길이와 폭에서 가장 먼저 닿는 자기반사장치 또는 벽을 검사·적 선접촉 우선. 장치 접촉 시 기존 유도 가능 대상 검사/현재탄속/남은사거리/투사체 발사를 재사용하고 기어회전. 충격전달 파츠가 있으면 벽 접촉에서 기존 벽 반대편 위치/150피해/벽관통 히트스캔 및 복제 사건을 재사용. 상호작용 해결 뒤 압력 범위 제한·끝탄 미발사·재프레임 중복 방지. 원격은 같은 접촉에서 압력만 종료하고 탄환/벽전달은 소유자 확정 사건만 재생. 새캐릭터ID분기/새모듈 없음.

검증: 전체30회귀·미아루키200/설치넉백없음/아군200힐1회·티냐5·근거리압력 자체 장치접촉224에서 탄속보존/남은526/기어1회/끝탄중복없음·벽뒤150피해1회·가까운적 선접촉·원격 발사없음·기존 근거리끝경계 중복회귀·build/docs/check/verify/runtime구문. 실제 두기기WebRTC 플레이 미검증.

## 지오핀 파츠 평타·표시·반사 장치 보정 — 3.0.0-character.275 (2026-10-13)

지오핀/티냐 난이도6(빨간별). 지오핀 주변 아이디어감지 범위350 및 본인 점선링350·원거리 모듈 상황 판별650/설치650 유지. 기존기어 대신 슈비 계열 각진 고무탄발사기(위손잡이), 근거리총구/정밀연장총열/하부벽전달 파츠를 공용 조건/무기형상으로 합성. 아래 칸수게이지는 왼쪽부터 근거리/원거리/벽뒤의 독립습득 비트. 기존 우측 원UI 제거. 모든파츠습득 시 아이디어100% 고정.

원인: 근거리 옵션이 기본탄 delivery를 유지하고 압력FX를 추가하여 이중 공격. 이제 기본탄/튕김/벽전달 delivery를 제거하고 근거리압력으로 대체·미적중일 때만250 끝에서400 고무탄1회. 정밀습득 후 끝탄600 및 기존정밀탄속·벽전달습득 후 끝탄에도 벽전달 합성. 압력과 벽뒤피해 모두150, 실제압력적중 onHit 강넉백180/공격방향 사용. 끝경계 적중은 압력 접촉 먼저 기록하여 후속탄 미발사. 기본평타150/연사350ms/비용150 유지.

반사장치 뒤 기어·성공 반사마다 한바퀴350ms. 공용 ModeState를 투사체 반사확정 패킷 및 소환물 snapshot으로 복제·같은 revision 재수신은 회전재시작 없음. 이후 다른 반사에는 오래된장치회전 snapshot 전달하지 않음.

검증: 전체30회귀·현재근거리250끝경계4위치 각각150피해1회/강넉백1회/후속탄0·미적중 후속탄1회/정밀벽합성·12그룹아이디어/칸0~7/완성100%/반사회전 snapshot/중복제외·무기4상태형상 확인·build/docs/check/verify/runtime구문. 실제브라우저/두기기WebRTC 플레이 미검증.

## 지오핀 아이디어·영구 모듈·반사 장치 리메이크 — 3.0.0-character.274 (2026-10-13)

체력900·매우빠름/기존칭호/색상 유지·반격형 중거리 딜러. 기존8무기 전환을 아이디어 기반 영구3모듈 합성으로 교체. 적 실제타격20%, 범위 내 적 존재초당10%, 적 투사체/공격 관찰20%(같은 공격 반복프레임 중복제외). 사용자확인:100%마다 상황에 맞는 미습득 모듈1개 추가·아이디어 소모·모듈 중첩 유지. 근거리350/원거리350초과·감지/설치650. 벽뒤→근거리→원거리 우선순위로 미습득 조건 판정·조건없으면100% 보존.

고무탄150·650사거리·기존 전이의 적/벽튕김 병합·튕김 탄속50% 감소. 정밀 모듈850사거리/기존정밀탄속, 이중충격250근거리넉백/미적중끝150고무탄, 충격전달벽너머250을 공용 공격변환으로 합성. 반격기 기존주변250피해 및 아이디어50%. RMB 지정지점 반사장치 설치/재사용회수·체력900·자기고무탄을 가까운 적으로 현재탄속 유지 반사·공용 CCD 실제접촉/은신/벽차단유도·파괴 후7초 제한. 설치비용0 유지. 기존기어/아이디어호/3모듈습득표시·모듈디버깅·기존상태/투사체동기화 사용.

대상:geopin 데이터·IdeaModuleService·공용 공격변환/투사체반사/충돌/이펙트식별자/장비표시/디버깅/훈련갱신/이벤트연결·회귀 및 레거시fixture. 캐릭터ID 분기없음·runtime 생성·project 역할 및 DIVIDE TASKS 갱신. 이전8무기는 테스트fixture만 유지·게임목록에는 포함되지 않음.

검증: 전체30회귀 및 리메이크11그룹(누적/중복/제로dt/모듈합성/은신/권위/빠른투사체/실제장치충돌/재반사방지/회수/6999·7000ms경계/스냅샷/디버깅)·build/docs/check/verify/runtime구문. 실제 브라우저 게임 및 두 기기 WebRTC 플레이 미검증.

## 티냐 편집·발동 크기 일치 — 3.0.0-character.273 (2026-10-13)

editingScale 고정0.5를 circleFormation.castingScale 참조로 교체·현재0.75. 편집 원 반경/간격/포인터 역변환/화면 중심 제한/홀드호가 실제발동 크기와 동일해짐. 실제 공격 최소/최대 반경51/180 및 피해/쿨다운/빙결/원격/시전위치고정 유지. 순수 설정 참조 사용·공용 코드 변경 없음.

검증: 실제컴파일 두배율0.75동일·반경68/150/240×줌1/0.75/2에서 편집/발동 반경 및 간격 일치·홀드/화면경계/AMP·티냐19그룹/구조/무기회귀·build/docs/check/verify/runtime구문·ZIP573파일 대조·저장후 재다운로드 검증. 실제 두 기기 플레이 미검증.


## 나레 스킬 자원 조건 불일치 수정 — 3.0.0-character.272 (2026-10-13)

원인: attack.nare.rmb.cost400과 별개로 action.attack.fallbackConditions에 resource.gte stamina1200이 남아 일반 사용을 미리 차단. 이 중복조건을 제거하고 공용 AttackService의 증강/버프 적용 prepared.cost 자원검사 및1회소모만 사용. ride 없음/스킬 쿨다운 조건은 유지·재사용 탈출 cost0 및 비행기 잔존 유지. 비용할인에도 기본400조건으로 차단되지 않음·증가비용은 실제비용 부족시 차단. 캐릭터 데이터 한 조건 삭제·공용 실행 코드 변경 없음.

검증: 실제 입력모듈→AbilityAttackExecution→AttackService에서 과거조건은500스테에도 미발동 재현·수정후399차단/400·500·1199발동 및400차감·조정비용200/800 경계·쿨다운차단/발사후탑승/스테0 무료탈출·전체29회귀·build/docs/check/verify/runtime구문·비압축ZIP573파일 대조·저장후 재다운로드 검증. 투사체 전달/탑승 물리 mock·실제 두 기기 플레이 미검증.


## 티냐 난이도 조정 — 3.0.0-character.271 (2026-10-13)

stats.difficulty5→4. 전투수치/입력/연출 유지.

검증: 실제컴파일 난이도4·티냐18그룹/공개표시회귀·build/docs/check/verify/runtime구문·ZIP572파일 대조·저장후 재다운로드 검증. 실제 두 기기 플레이 미검증.


## 체리티 은신 중 레이저 숨김 — 3.0.0-character.270 (2026-10-13)

charge.aimLine.hideDuringStealth=true 선택형 순수설정. 공용 레이저 렌더는 StealthPresentationService.active의 실제 은신버프를 검사해 차징선/저장된 페이드잔선을 즉시 숨김·제거. entity.hidden만 보던 누락 수정. 자기/아군/적/관전 동일·은신 노출/근접 탐지 여부와 무관하게 은신버프가 유지되면 선 미표시. 은신 종료시 진행중 차징만 새로 표시하며 숨겨진 과거 잔선은 복구하지 않음. 전투/은신버프/팀색/평상시 페이드 유지·캐릭터 ID 분기 없음.

검증: 실제 BuffService 은신/entity.hidden=false 상태의4뷰 렌더0·차징선/종료페이드 모두 제거·버프 해제/만료 후 진행차징 복구/옛 잔선없음·공개레이저/FIX/티냐 회귀·무기회귀·build/docs/check/verify/runtime구문·ZIP572파일 대조·저장후 재다운로드 검증. 실제 두 기기 플레이 미검증.


## 티냐 평타 쿨다운 조정 — 3.0.0-character.269 (2026-10-13)

lmb.cd500→650ms. 선딜 종료 발동부터0.65초 쿨다운·나머지 수치/효과 유지.

검증: 발동후649ms차단/650ms허용·티냐18그룹·build/docs/check/verify/runtime구문·비압축ZIP572파일·저장후 재다운로드 대조. 실제 두 기기 플레이 미검증.


## 티냐 증폭 빙결·쿨다운 조정 — 3.0.0-character.268 (2026-10-13)

durationPerSource150→100ms로 증폭당0.1초빙결·포함 증폭2배는0.2초 유지. lmb.cd400→500ms·선딜 종료 발동부터0.5초 쿨다운. 스테50×원수/기본20/발동0.75/고정시전 등 유지.

검증: 실제증폭1원100/2원200/포함1원200/포함2원400ms·실제상태전달/중복제외·499ms차단/500ms허용·티냐18그룹·build/docs/check/verify/runtime구문·비압축 ZIP572파일 대조·저장후 재다운로드 검증. 실제 두 기기 플레이 미검증.


## 티냐 비용·빙결 증폭·피해·연사·발동 크기 — 3.0.0-character.267 (2026-10-13)

평타 formationCost.perCircle100→50·설명 기존 데이터참조 스테미나50×마법진수. 기본피해40→20·평타/반격 기존배율 적용·8배160. lmb.cd800→400ms로 선딜375ms 뒤 실제발동부터400ms 쿨다운·시전위치고정/스테 선소모 유지. 반격 기존스테0/쿨타임 유지.

castingScale0.75로 실제 평타/반격 발동 원 반경과 묶음 간격25%축소·편집0.5유지·최소AMP/연결/포함/교차 판정 templateScale 보존·원격/선딜/피해/효과 동일snapshot.

증폭 status freeze/durationPerSource150·포함된 증폭원 containedStageWeight2(300ms)·maxStage는 최대원수×2=12. 기존 감속/속박/3단계빙결을 증폭당150ms빙결로 교체. 고유 sourceContributionByCircle의 가중치 합을 사용해 같은 증폭원이 여러 연결/피해원에 걸려도 한 번 계산·포함 기여2배 보존. 개수별 duration150×가중치의 기존 StageStatusEffectService 경로 사용·실제적중/권위 조건 유지. AMP 설명 데이터참조0.15초/포함2배·표시는 실제 가중치.

검증: 실제원수비용1/3원50/150·선소모1회·쿨다운400·피해20/거리무관8배160·발동반경51/180/줌AMP·실제 graph 증폭1원150/2원300/포함1원300/포함2원600·같은source중복제외/실제 Weighted→StageStatus freeze600ms/미적중 제외·티냐18그룹·전체28회귀·build/docs/check/verify/runtime구문·비압축 ZIP572파일 추출/원본대조·저장 후 재다운로드 대조. 실제 두 기기 온라인 플레이 미검증.


## 티냐 선딜 마우스 추적 제거 — 3.0.0-character.266 (2026-10-13)

updateActivation에서 매 프레임 현재 마우스로 castTemplate 재계산하던 코드 제거. beginActivation의 시전 시작 위치/원모양/크기 snapshot을 선딜/실제 발동/원격에 그대로 사용. 고정375ms/쿨다운800ms/기존발동크기/증폭 단계 유지·다른 변경 없음.

검증: 선딜374ms 마우스 변경 후 최초600/600 유지/375ms 발동·티냐17그룹/공개표시회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 두 기기 온라인 플레이 미검증.


## 루네프 빙결 범위 증가 취소 — 3.0.0-character.265 (2026-10-13)

사용자 정정: 현재값30%감소가 아니라 character.260의30%증가 취소. ice.range를 증가전189로 복구·character.264의171.99도 취소. 피해50/빙결1000ms/각도/벽차단 유지.

검증: 컴파일/판정/이펙트 range189/피해50·무기회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 두 기기 온라인 플레이 미검증.


## 루네프 빙결 범위 감소 — 3.0.0-character.264 (2026-10-13)

현재 ice.range245.7에서30% 감소하여171.99로 변경. delivery.area와 arcSweep는 같은 range 참조로 판정/연출 일치. 피해50·빙결1000ms·각도/벽차단 유지. 다른 캐릭터/공용 실행 변경 없음.

검증: 실제 컴파일245.7×0.7/판정 및 연출 range171.99/피해50·무기회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 두 기기 온라인 플레이 미검증.


## 티냐 거리 선딜 변경 전 복구 — 3.0.0-character.263 (2026-10-13)

사용자가 확인한 복구범위: character.261의 변경5개 및 character.262 최대시간 변경을 모두 취소. 평타 선딜 고정375ms·발동후쿨다운800ms·실제발동 반경/간격 기존 full-template 크기·증폭1단계 감속/2단계 속박/3단계 빙결(1000ms 및 포함증폭기여2)·선딜 중 마우스/카메라 추적 복구. 원수쿨다운 증가 문구 제거·AMP 설명 기존문구 복구.

기존 character.260까지의 기본피해40/난이도5·편집0.5·화면내중심·넉백없음·전체홀드호·선딜시 스테미나 선소모·원래 미리보기·공용 원채움 유지. 루네프 빙결245.7/50 및 디라비용/스토브회복100 유지. 미사용 activationDelay/증폭source합산/발동배율 설정 제거·캐릭터별 런타임 분기 없음.

검증: 실제고정375ms·374ms미발동/375ms발동·발동후800ms재사용·마우스 추적/원래반경·증폭3단계/포함2/기본40 난이도5 보존·티냐17그룹·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 두 기기 온라인 플레이 미검증.


## 티냐 최대 선딜 조정 — 3.0.0-character.262 (2026-10-13)

평타 revealByDistance.maxDuration800→500ms. 거리0~500은100~500ms 선형보간·거리250은300ms·500이상500ms. 최소선딜/거리기준/고정시전/원수쿨다운/크기/빙결 유지.

검증: 실제 거리0/250/500/900×원수1/2/6의100/300/500 선딜 및 발동후 원수쿨다운·티냐18그룹·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 두 기기 온라인 플레이 미검증.


## 티냐 거리 선딜·원수 쿨다운·고정 시전·증폭 빙결 — 3.0.0-character.261 (2026-10-13)

평타 activation.revealByDistance {maxDistance500,minDuration100,maxDuration800}: 시전 시작 당시 티냐와 클릭한 마우스 월드위치(전체 테두리 중앙) 사이 거리로 선형 보간·500이상800ms 고정. 시전 시작에 원 모양/위치/크기 및 preparedAttack을 snapshot·선딜 중 마우스/카메라/캐릭터가 움직여도 위치/크기/선딜 불변. 시작 스테미나 선소모/취소 유지. cooldownPerCircle150으로 원수×150ms를 준비 공격의cd에 저장·기존 증강 attackRate 처리 적용·실제 발동 뒤 쿨다운 시작. 설명에 많은 마법진 사용 시 쿨다운 증가 추가.

castingScale0.5: 평타·반격의 실제 원 반경과 묶음 간격을 기존 발동의 절반으로 변경·편집 크기와 동일. 편집 설정0.5는 그대로·기존 minimum/templateScale·포함/교차/연결 배율은 보존. 선딜/판정/발동 이펙트/원격 동일snapshot을 사용.

증폭 설정 status freeze/durationPerSource200/maxStage6/containedStageWeight1. 기존 단계 감속/속박/빙결과 포함시2배 CC기여 제거. 실제 연결 원에 영향을 주는 고유 증폭 원을 원당1회 계산·직간접 연결 상속·겹친 여러 피해원의 고유 source 집합 합산·같은 증폭원 중복 계산 없음. 기존 StageStatusEffectService에 개수별 freeze200×개수 duration 단계로 전달·기존 적중 성공/권위/상태 적용 경로 유지. 설명은 데이터참조0.2초/개수·표시 수치는3단계 로마자 상한 대신 실제 개수.

검증: 거리0/250/500/900×원수1/2/6의 선딜100/450/800 및 발동후150×원수·마우스/카메라/이동/줌 후 위치크기 고정·반경34/120 및 줌AMP·1/2원 실제 graph/고유집합 중복제외/6단계200~1200ms·실제 Weighted 전달/StageStatus 빙결400/미적중 제외·본인/원격 같은선딜·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 루네프 빙결 범위·피해 — 3.0.0-character.260 (2026-10-13)

attack.runef.ice range189→245.7(+30%), damageRatio2→0.5로 기준100×0.5=피해50. delivery.area 및 arcSweep 효과는 기존 attacks.ice.range 참조로 실제 판정/연출 모두 같은 증가 적용. 부채꼴 각도0.9·벽차단·빙결1000ms·다른 마법/비용 유지. 공용 실행 코드 변경 없음.

검증: 컴파일 range189×1.3/피해50·실제 delivery 및 효과 참조245.7·각도/벽/빙결시간 보존·구조/무기회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 피해·난이도 조정 — 3.0.0-character.259 (2026-10-13)

티냐 stats.baseDamage50→40, difficulty6→5. 평타/반격은 기존damageRatio1과 마법진 배율을 그대로 사용해 기준40에서 계산·8배는320. 다른 수치/입력/연출/배율 유지·공용 코드 변경 없음.

검증: 실제 컴파일40/난이도5·티냐 근/원거리8배320·실제포함교차 배율/원격 전달320·티냐17그룹/구조회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 디라 평타 비용·스토브 회복 — 3.0.0-character.258 (2026-10-13)

평타 fryingPan 및 음식 전달 meal의 cost150→100. 식재료의 cooking.own-stove 조건 source stamina 회복 amount150→100. 기존 ingredient 후속 비용0/스토브 적중 실행당1회·아군소환수 제외·원격 중복회복 제외/최대스테미나 clamp 유지. 설명은 기존 공격 비용 참조 사용·공용 실행 코드 변경 없음.

검증: 실제 스토브 적중 회복100/실행당중복방지/다른소환수·원격 제외/최대치·평타 및 음식 비용100·구조/무기회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 드래그 미리보기 복구 — 3.0.0-character.257 (2026-10-12)

사용자 요청으로 character.255의 공용 공격 미리보기 변경만 복구. 드래그 원을 실제 편집 원 묶음과 합쳐 기존 CircleFormationService.drawSet alpha0.48로 한 번 표시·기존 팔레트/점선/채움/포함·교차·연결·AMP 표시 복원. 최대6개 초과 시 preview ID를 extraInvalidIds에 전달해 빨강 유지·초과 무기제외/400ms 빨강 잔여 표시 유지. 공용 AttackPreview 렌더 호출 제거. 선딜 공용 원채움/편집50%/중심 화면내 제한/전체홀드호/선소모/평타 발동후800ms/넉백없음은 유지.

검증: 실제 draw 경로 복합원1회/드래그 포함 및 초과 빨강 전달·본인/상대 무기제외·티냐17그룹/전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 전체 홀드 호·화면 중심 제한·넉백/쿨다운 — 3.0.0-character.256 (2026-10-12)

홀드 중 캐릭터 호와 모든 편집 마법진의 주변 호를 표시·선택 원 하나만 그리던 문제 수정. constrainCentersToView 순수 설정으로 화면 크기/편집0.5 역변환 경계에 원 중심을 제한. 포인터/배치·연결묶음 이동/화면 크기 변화에서 적용·연결 이동은 공통 delta를 제한해 원간격 보존. 테두리는 화면 밖으로 나갈 수 있음·맵 경계와 독립·발동 월드 판정은 기존 위치/크기 유지.

평타/반격의 넉백 모듈 제거·반격 wrapper 추가 무력화넉백도 제거. 사용자 지정 예외로 counter.execute cc:null을 데이터에 명시·공용 validate는300ms+명시null을 허용하고 누락/allowNoCc 우회는 거부. finish 기존 nullable CC 처리 사용·다른 캐릭터 CC 유지·마법진 증폭 속박/빙결 유지. README/캐릭터 계약에 최신 예외 기록. lmb.cd100→800·발동 성공 시 기존 AttackService가 now+800 설정하므로375ms 선딜 제외 후800ms 재사용 대기·기존100ms 공격딜레이는 더 짧아서 중복 연장 없음.

검증: 전체 원호 개수/연결 이동/화면 네방향·중심만 제한/리사이즈/줌·선딜375ms 후 cooldown800ms/799ms차단·800ms허용·평타/반격 넉백없음/명시null/누락거부·다른반격 전수CC검수·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 공용 미리보기·원 채움·축소 편집 — 3.0.0-character.255 (2026-10-12)

설명 CIRCLE 키 RMB INCLUDE/LINK/CROSS/AMP에서 RMB 접두사 제거. 메라모나 등 기존 annularDoubleSweep 렌더를 AnnularSweepPresentationService로 그대로 추출·Training FX 호출. 티냐 선딜은 같은 단일 시계방향 원 채움/두께/알파/12시 시작/edgeLine false 스타일로 전체 선딜 진행률을 전달·본인/원격 동일. 기존 drawSet 부채꼴 clip/점선 채움 선딜은 사용 중지.

현재 드래그 원은 AttackPreviewService.fromTargetPoint→TrainingWorldDrawService.drawAttackPreview 공용 경로 사용·기본 흰 점선/약한 채움 동일. 최대6개 상태에서 초과 드래그는 빨강 미리보기·놓으면400ms 빨강 잔여 표시 후 소멸·생성 차단. weaponDefinition은 실제 원수 기준으로 초과 preview를 제외·복제 상대도 같은 계산.

circleFormation.editingScale0.5 선택형 데이터. 편집 마법진의 위치 간격/반경을 화면에 절반으로 투영·포인터는 역변환. 원본 템플릿은 기존 발동 크기68~240 기준으로 보존하여 선딜/실제 발동 시 원 크기/간격 모두 기존 크기. AMP 최소크기 판정 templateScale 보존·카메라/줌/연결 홀드·테두리 중앙 발동/비용 선소모 유지. 무기 미니어처는 기존 중앙/크기 유지.

검증: 화면 반경34/120·발동68/240·간격/포인터 역변환/줌AMP·실제 공용 미리보기 Canvas 경로 동일/초과빨강/6개보존/본인상대 무기preview 제외·실제 메라모나와 티냐 반진행 렌더 명령 동일/원격 동일·기존 렌더 회귀 포함28스크립트·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 선딜 시작 비용·홀드 호 복구 — 3.0.0-character.254 (2026-10-12)

좌클릭 준비 성공 시 증강 적용 준비 공격의100×원수 비용을 즉시1회 소모·준비 공격을 저장. 공용 AttackService의 선택 resourcePrepaid 옵션으로 발동 때 자원 검사/재소모만 생략하며 행동/쿨타임/공격 이벤트/피해 전달 유지. 잔여0이어도 예정 공격 발동·선딜 취소 비용은 돌려주지 않음. 선딜 시작에 진행 중 원 편집 입력 종료하여 발동 중 원수 변경/비용 우회 방지. 반격 비용0/기존 사용 경로 유지.
RMB 홀드 pending/move에 선택한 마법진을 실제 화면 투영한 뒤 기존 drawHoldGauge 원주 호/완료 펄스 호출 복구. 본인 캐릭터 호도 기존 공용 위치 사용. entityHoldGaugeState가 pending뿐 아니라 move도 visible/full을 반환해 EntityRingLayoutService가 상태/반격링에 공간을 확보. 상대는 개인 홀드 게이지 미표시/링 배치 변화 없음·놓으면 슬롯 제거.

검증: 즉시1회 소모/자원0에도 발동/부족한 시작 차단/취소·실제 AttackService 재소모0 및 쿨타임·이벤트 유지/죽음차단·pending/move 원주호 투영/놓기/상대·실제 링 배치 바깥 간격 및 상대/종료복귀·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 발동 중앙·선딜 채움 복구 — 3.0.0-character.253 (2026-10-12)

발동 템플릿 기준을 각 원 중심 평균에서 전체 원 테두리의 minX/maxX/minY/maxY 중앙으로 변경. 원 크기 반영·한쪽 작은 원이 많아도 치우치지 않음. 단일 원은 원 중심·화면 줌 변환/배치 간격/원 크기 보존·같은 템플릿 발동을 사용하는 반격에도 동일 중앙.
좌클릭375ms 선딜 동안 기존 drawSet revealProgress 원호/부채꼴 clip 채움 재연결. 본인은 실제 activation 시작/종료시각, 상대는 기존 snapshot revealElapsed/revealRemaining을 사용해 동일 진행률 렌더. 마우스 추적·팀색 윤곽·발동 확정/잔상은 기존 경로 유지·선딜 종료에는 준비 표시 제거.

검증: 비대칭 원 크기/작은 원 중복/단일 원/줌 후 테두리 중앙·실제 로컬 입력/원격 serialize-applyRemote의1/3·2/3 진행 및 종료·실제 drawSet 반원 arc/clip/fill·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 거리 피해 제거·체리티 차징 조정 — 3.0.0-character.252 (2026-10-12)

티냐 distanceFalloff 설정/설명 삭제. 모든 거리에서 기준피해50×기존 마법진 배율 유지·화면 고정 템플릿/입력/비용/보존은 그대로.
체리티 speed3.5 및 표시 매우 느림. 평타 최소100/최대900·charge.damageRatio.step 선택형 공용 옵션으로100단위 증가. 최대 피해/차징 시간/스테미나 유지. charge.aimLine.fadeDuration300ms·차징 종료 후 마지막 월드 선 위치/색 고정 및 알파 감소. 자기/상대/관전 기존 표시 경로 공유·은신/사망시 즉시 정리·재차징 시 새 선으로 갱신.

검증: 실제 차징 피해801개 표본100~900/연속형 타 공격 대조·팀색/150ms중간 및300ms종료·티냐 근/원거리400/실제 교차배율8/원격전달·전체28회귀·build/docs/check/verify/runtime구문·ZIP 원본대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 티냐 화면 고정 마법진 템플릿·입력 개편 — 3.0.0-character.251 (2026-10-12)

요청17항 반영. 거리 기준피해는50/40/30/20/10 계단식·기존거리2000 최소점 유지(0~499:50,500~999:40,1000~1499:30,1500~1999:20,2000이상10). 포함/교차 배율은 감소한 기준피해에 그대로 곱함. LMB 설명의 최소10 문구 삭제. AMP 설명을 사용자 지정 문장으로 교체.

RMB 클릭=선택한 가장 최근 원 삭제. 빈 곳 클릭은 생성 없음. RMB DRAG=무료 원 생성. RMB HOLD=선택한 원과 직간접 연결된 묶음 이동(기존 LMB HOLD 역할). 기존 한 원 이동용 RMB HOLD·LMB HOLD·LMB/LMB 주문서·LMB/RMB 제거 입력 삭제. 평타 클릭은 홀드/두번클릭 시간 창 없이 기존375ms 발동 선딜 사용. 마법진 편집은 스테미나/공격 쿨타임·공격 이벤트를 소모하지 않음.

편집 원은 시전자 카메라의 화면 중심 상대 좌표/크기로 저장·카메라 이동/확대 시 편집 표시의 화면 위치/크기 유지. 마법진 입력은 선택 unclamped mouseWorld로 맵 밖에 그릴 수 있고 다른 캐릭터는 기존 맵 경계 제한 유지. LMB 발동 시 현재 마법진 묶음 중심을 마우스 월드 위치로 옮겨 실제 판정/연출을 생성·편집 묶음은 보존. 선딜 중 현재 마우스를 추적. 평타 스테미나는100×발동 원 수이며 공용 증강 준비 단계에서도 같은 비용 계산. 반격도 현재 묶음을 같은 마우스 위치에서 발동·기존 반격 활성 상태 소비와 무력화 넉백/스테미나0 유지. 평타/반격 모두 빈 템플릿이면 발동 금지·빈 반격은 활성 상태 소비 전에 차단·최소 원 자동 생성/과거 발동 기록 fallback 제거.

공용 weaponImage의 formationKey 선택형 정의 공급으로 실제 편집 원 묶음을 캐릭터 중앙 뒤에100px 미니어처로 실시간 표시. 기존 공용 팔레트/반투명/은신·전환/사망 snapshot/페이드 경로 사용·이후 편집에도 사망 표본은 고정. 카메라 줌으로 투영한 원에는 templateScale을 보존하여 최소크기 AMP 판정 유지. 원격 템플릿/드래그 미리보기·월드 발동 선딜 범위·기존 최종 공격 snapshot 복제를 구분해 상대 카메라로 템플릿을 잘못 표시하지 않음. 사망 시 로컬/원격 편집 데이터 정리.

구조: CircleFormationService 기존 서비스의 입력/투영/생성/전달 개편·formation.remove 공용 핸들러/formation.nonempty 조건·AttackService 빈형성 방지·AugmentService formationCost 계산·ModeGear 선택형 동적 형상 정의/표본 보존. 캐릭터 ID 분기 없음. 설명/능력은 순수 캐릭터 데이터 유지.

검증: 실제 RMB클릭/무료드래그/연결묶음홀드·카메라 이동/줌 후 화면불변 및 최소AMP·마우스 발동중심·LMB 자원부족/원수비용/보존/중복입력·빈 평타/반격/반격상태소비전차단·실제 증강준비1/3원100/300·반격0·공용 실제 무기 렌더/원격/사망표본·실제 mouseWorld의 밖 입력/기존경계대조·피해 단계 경계499/500/999/1000/1500/2000·기존 회귀 포함28개 스크립트 및 build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 공개 차징 조준선·마법진 거리 피해·FIX 재생 — 3.0.0-character.250 (2026-10-12)

체리티 charge.aimLine 순수 표시설정 추가. 공용 ArcGaugePresentationService.drawChargeAimLine이 현재 차징 상태/로컬 조준 및 기존 원격 최신 조준을 읽고 발사자 팀 색상으로 사거리1400까지 실선 표시. Training 월드에 자기·아군·적·관전자 모두 볼 수 있게 렌더·차징 취소/발사/사망 후 제거. 개인 공격 미리보기와 독립·기존 hold/release/조준 패킷 사용·전투판정 변경 없음.

사용자 선택한 최대 감소거리2000. 티냐 circleFormation.damage.distanceFalloff에서 기본50→거리1000에서30→2000이상10 선형감소. 기존 마법진 포함/교차 배율은 그대로 유지한 뒤 감소한 기준피해에 곱함·8배 마법진은 최장거리80. 각 마법진 중심과 발동 당시 시전자 사이 거리 사용·원마다 감소한 최종 피해를 기존 최대피해 방식으로 비교. 교차 양측의 원 중 높은 기준피해와 동일 교차 배율 사용. 배율 표시·CC·다중피해 방지 유지. CircleFormation/WeightedCircleAttackDelivery 공용 선택 옵션으로 구현하며 옵션 없는 공격은 그대로. 기존 formation snapshot에 damageOrigin을 보존하여 발동 후 티냐가 움직여도 상대의 거리 피해 산정 일치·구 패킷은 현재 source 위치 fallback.

가에 FIX 잃은체력20% 즉시회복 삭제. 공용 regeneration 버프 value50/duration5000/tickInterval1000 사용. 새 효과는 즉시50·이후1초 간격(0/1/2/3/4초 총5틱250). 효과 중 재사용은 같은 source 키 하나를 refresh해5초 갱신·기존 nextTick 유지·중첩/반복 즉시회복 없음. 기존1초 녹색 표시 유지. 원격 명령은 표시만·HealthRegenService의 선택 localOnly 옵션으로 복제 버프가 원격에서 중복회복하지 않음. resetEntity는 해당 FIX 재생만 제거. 설명 수치 모두 데이터참조.

검증: 실제 차징취소/월드표시 경로 및 자기·아군·적·관전자 팀색/최신방향·실제 티냐8배 교차80/원본배율 보존/기본50·30·10/옵션 없는 피해400/원격 source 이동 후 발동원점 보존·실제 BuffService/HealthRegenService 첫틱/각1초/만료/5틱250/재사용 주기보존·1개버프/원격/사망/초기화·전체27 회귀 스크립트 및 build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 브라우저/두 기기 WebRTC 플레이 미검증.


## 나레 스킬 비용/투사체·룰리 접이식 자 — 3.0.0-character.249 (2026-10-12)

나레 rmb.cost800→400, lmb/counter delivery.projectile radius18→15. 설명은 기존 attacks.rmb.cost 참조 사용. 탑승 스킬 투사체112·탄속/관통/유도/반격7발 및 모션은 유지.

룰리 무기 형상을 세 마디 접이식 눈금자로 새로 제작. 두 연결축과 세 평판의 Z형 실루엣·길고 짧은 눈금·기존 캐릭터 팔레트/반투명 및 거리조절260ms 모션 사용. 공용 WEAPON_IMAGE_DEFS의 tape-measure 형상만 교체하며 전용 렌더/실행 분기 없음.

검증: 형상 확대/게임 크기 시각 미리보기·공용 실제 렌더·나레 평타/반격15/탑승112 및 스킬400·기존 룰리 실제 입력/상대 모션 회귀·전체26 회귀 스크립트 통과·build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.


## 가에만 벽 수정 유지·대물저격총/말린 자·투사체/기절 표시 — 3.0.0-character.248 (2026-10-12)

사용자 범위 정정에 따라 character.247의 공용 범위 이펙트 벽정책 상속·네모 벽마스크·Training FX 마스크·설치영역 변경·룰리 경로/끝 클리핑·시아넬리 순보 변경을 모두 character.246 원문으로 복구. 가에 반격의 원형 효과 clipToAttackArea/replaceAutoAreaEffect만 유지. 베르 연결 기절범위에 적용됐던 추가 clipping도 공용 코드 복구로 제거. 이전에 존재한 레비나 등 벽클립은 그대로 유지.

체리티 cherity-bolt-rifle을 대물저격총으로 재설계: 두꺼운 리시버/환기구·긴 중총열·2실 소염기·대형 조준경·스켈레톤 개머리판·별도 탄창/그립/방아쇠. 전체 실루엣 길이5.8→6.94·기존 캐릭터 팔레트/투명도·300ms 반시계 회전·연막탄 전환 유지. 룰리는 풀린 꼬리/케이스 없이 원형 테두리·안쪽 말린 띠·짧은 눈금만 표시·기존 조절 모션 유지.

나레 lmb radius12→18, counter radius11→18. 거대 비행기 rmb112·탄속/관통/유도/반격7발 및 전투값 유지. 베르 강화 바주카 기절 중심54 표시는 fillAlpha0.035→0.16, strokeAlpha0.95→1, 밝은 strokeColor#fff3a0, lineWidth2.5→3.5, duration180→450ms. 실제 폭발150/기절범위54/기절1250ms/120ms지연 유지·모든 수치는 기존 geometryFrom 참조.

검증: 복구 대상7개 소스 character.246 바이트 대조·나머지 캐릭터 데이터 보존·형상 확대/게임 크기 시각 미리보기·가에 실제 벽 polygon/빈공간·베르 실제 원 렌더/밝은 윤곽 및54반경·나레18/18/112·기존 모션/전환·전체26 회귀 및 build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.


## 벽 차단 판정과 공격 연출 일치 — 3.0.0-character.247 (2026-10-12)

전63명 데이터와 공용 범위/이동/설치영역 연출 경로 검수. 가에 반격·시아넬리 순보 도착의 별도 원형 효과가 벽 차단 polygon을 누락한 문제 수정·공용 clipToAttackArea 및 replaceAutoAreaEffect로 중복 원 제거. 베르 강화 바주카의 중심 기절54 표시도 별도 반경으로 벽 차단하며 실제 폭발150 범위는 유지.

AttackModuleService의 범위 렌더러는 wallPolicy를 기본 상속하여 clipToAttackArea 누락에도 원/부채꼴/직선 연출 제한. geometryFrom의 연결 상태 반경과 impactWallPolicy를 독립 표시 geometry로 사용. 무기 잔향·적중 지점 장식·진짜 벽 관통 공격은 별도 표시 규칙 유지. 새 모듈/캐릭터별 실행 분기 없음.

공용 ProgressiveClippedAreaOutlinePresentationService.rectWallMask/beginWallMask로 직선 공격의 너비가 비스듬한 벽/모서리를 넘어 그려지는 부분 제한. 별도 effect.spawn·자동 네모 공격·설치형 직선 영역에 동일 mask snapshot 전달·Training FX 루프는 continue/조기 종료에도 Canvas 상태 복구. 룰리 줄자 경로와 끝 네모는 원점 가시영역으로 제한하여 중심 거리만 보정했을 때 남던 벽 뒤 끝부분 제거. 온라인 effect-spawn은 기존 JSON snapshot으로 polygon/mask 보존.

검증: 63명 전체 스캔·벽차단 공격 효과50개의 실제 생성/빈공간 대조·베르 표시54/피해150 분리·가에/시아넬리 원 중복 제거·관통/장식 대조·실제 Training FX 마스크 렌더/Canvas 복구·원격 snapshot 보존·동적 벽 목록 변경·전체26 회귀 스크립트 통과. build/docs/check/verify/runtime 구문 및 ZIP 원본 대조. 실제 브라우저/두 기기 온라인 플레이 검증은 미실시.

수동 확인 추천: 가에 반격, 베르 강화 바주카 중심, 시아넬리 순보 도착, 룰리 평타/반격, 코녕·샤베트·지오핀 직선 공격을 벽 바로 앞/비스듬한 방향/모서리에서 사용. 벽을 관통하는 공격은 기존처럼 관통.


## 단검·독립 저격총·레이저 파츠/넉백 — 3.0.0-character.246

시아넬리 긴 삼각형 날/고리 손잡이를 제거·평행 날몸과 짧은 가드/균형형 일반 그립의 투척단검으로 교체. 유이 일반 서양식 단검 비율·평행날/가드/정렬그립/둥근마감 재디자인. 기존 각 사용모션·회전방향 유지.

체리티 인투 sniper 공용 형상 사용을 해제하고 일체형 개머리판·별도 조준경·볼트/방아쇠 구조의 cherity-bolt-rifle 독립형상 등록·같은 실제길이/반시계회전/연막탄 전환 유지. 룰리 눈금띠를 작은 중심구멍/층겹침이 있는 연질테이프 코일과 풀린 끝으로 재디자인·조절모션 유지.

가에 본체와8파츠 scale1.7→2.125(+25%). PIERCE 압축집광부/3단내부판, WIDE 크게 벌어진 방출구, INSTANT 펄스 방전셀로 교체·다른기능/조합/FIX/회전/잔향 유지. 사용자 선택으로 /knockback on-hit distance160→80. 일반 투사체 및 INSTANT 실제 변환 모두80·RMB 스킬 자체 넉백160 및 반격은 유지.

검증: 형상미리보기·평행날/일반그립/원형끝없음·독립총/같은실길이·기존회전/복제·기능별파트/25%크기·실제명령/일반·즉시 넉백80·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 회전·차징 표시·기능별 레이저 파츠 — 3.0.0-character.245

시아넬리 스킬/반격 회전을 반시계→시계로 반전·평타 헤브식 투척 유지. 체리티는 별도 marksman-rifle 형상을 삭제하고 인투 실제 sniper 공용 형상/동일크기를 사용·평타 발사모션을300ms 반시계 한바퀴 회전으로 교체·연막탄 전환 유지. 시로 worldEffect chargeStateKey/chargeRotation 제거로 차징 중 활/시위 형상 고정·실제 차징/차징단계/평타 및 반격 발사모션 유지.

유이 단검 좌우정렬 칼날/곧은 중심선/수평가드/직선그립 재디자인·평타반격 반시계/역행스킬 시계. 룰리 줄자는 납작한 연질띠 코일/곡선 풀린 눈금띠로 변경·기존조절 흔들림 유지.

가에 팔방 판장식 형태를 길게 이어지는 광학레이저 본체로 교체. DUAL 2방출구, WIDE 넓은 방출구, RANGE 긴 집광레일, PIERCE 집중렌즈3층, INSTANT 방전축전기, KNOCKBACK 반동구동부, ACCELERATE 냉각핀, ELECTRIC 전극권선(노랑계열)로 실제기능과 형태 연결. 기능 조합에 따른 레이어 순서와 의도적 결합 겹침 사용·기계적으로 비겹침 강요 제거. 기존 기능조건/FIX녹색/평타회전/스킬반격잔향 유지. 전투수치/모듈 참조 유지·공용코드 변경없음.

검증: 형상미리보기·차징 중 실제 활 렌더 동형/발사모션·공용형상 동일성/실길이·회전방향/상대·8기능형상/변환공격/전체조합·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 무기 재디자인·파츠 직접 장착 — 3.0.0-character.244

키네스 worldEffectModules/표시전용모션·선택모드 및 전용불꽃 형상5개 제거. character.242의 동일 전투 데이터로 복구하여 마법·방향 선택·피해·참조 인덱스 유지.

체리티 저격총을 견착부/연속총몸/조준경/총열 연결이 자연스러운 디자인으로 변경·기존 인투 동일실길이·모션·연막탄 전환 유지. 유이 단검을 곡선 날/작은 가드/일체형 그립으로 재디자인·역행 반시계모션 유지. 룰리 케이스형 줄자를 삭제하고 가운데가 빈 말린 눈금띠와 풀린 띠 형상으로 교체·기존거리조절 흔들림 유지.

가에 주변에 분리되어 떠 있던 기능 그림을 삭제·렌즈 본체에 광학부/집광부/방열핀/코일/추진부 등의8파츠가 각각 고유 장착면으로 직접 연결되게 재디자인. 파츠간 영역분리와 본체 경계접촉을 모두 검사. 기존기능 조건/FIX/회전/잔향/상대 복제 유지·공용코드 변경없음.

검증: 형상미리보기·키네스표시 및 전투 보존·인투실길이/본체장착 경계/파츠간 간섭·기존실행모션/상대·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 무기 재디자인·불꽃/단검/줄자 — 3.0.0-character.243

체리티 저격총을 연속된 총몸/견착부/조준경/탄창/길어진 총열로 재디자인·인투 sniper와 실제 길이 동일5.8×scale1.5 및 동일각도. 가에 총 형상 삭제·중앙 광학 렌즈와8기능 장식을 개별 방향에 분산해 장식간 겹침 제거. 기존 평타회전/스킬반격잔향/기능조건/FIX색 유지.

키네스 기본 불꽃 및 실제 사용한 마법에 맞는 구슬(위)/날개(왼쪽)/화염방출(아래)/불꽃방패(오른쪽)를800ms 표시 후 기본 복귀·반격 화염방출형. 선택된 AttackSpec 모드조합이라 마우스가 이후 움직여도 사용한 형상 유지. 시아넬리 투척단검·평타 헤브와동일480ms 투척모션·스킬/반격 반시계회전. 유이 단검·평타반격 시계회전/역행실행 반시계회전.

룰리 줄자·큐리형260ms rotation0.12/travelY-0.06 모션. 기존 state.progress와 holdRepeatProgress에 onChangeModes 범용옵션 조합·실제 값변화시에만 ModeState 갱신·홀드200ms 감소에도 동일표현/한계무변화는 모션없음·상대 기존모드 복제. 전투수치/기존 모듈 인덱스 참조 유지·캐릭터 전용 실행 분기 없음.

검증: 형상 미리보기·실길이/레이저부품9개 bounding box 분리·키네스4종/반격799·800ms/상대·시아넬리 실제발사 모션/유이 역방향·룰리 실제홀드200ms/한계/상대·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 방어 성공 표시·가에/체리티/나레 무기 — 3.0.0-character.242

사이엔 방어 색상만250ms 변화하던 표현을650ms로 늘리고 idleAlpha0.45→방어성공1.0으로 선명하게 표시·120ms유지/530ms투명도 복귀·색상450ms fade. 실제 AttackGuard.activate→blockDamage→모드 갱신→렌더 색/알파 회귀 추가. 이전 방어 성공 mode/색 경로를 직접검수하며 시각대비 보완.

가에 기본 레이저 건+DUAL/WIDE/RANGE/PIERCE/INSTANT/KNOCKBACK/ACCELERATE/ELECTRIC 각각 별도 부품을 현재 command 모드로 표시·기능 조합만큼 겹쳐 강화. 평타 공용회전·스킬반격 현재조합650ms 잔향. FIX는 기존 _commandFixGlowUntil을 공용 activityColors untilProperty로 읽어1초내 초록색/마지막300ms fade. 원격 기존 기능 snapshot/command 이벤트 재사용.

체리티 인투를 참고한 저격총·평타 발사모션·스킬/반격 실제 사용후800ms 연막탄 이미지로 전환/복귀·재사용갱신/상대모드 동기화. 나레 종이비행기 이미지·평타/거대비행기/반격 실제발사 회전. 새캐릭터 런타임 분기 없이 순수형상·모드·조건·잔향 공용조합. 전투수치와 기존 모듈 인덱스 참조 유지.

검증: 형상 미리보기·실제guard차단/렌더 색/알파·가에8개별/모두조합/변환 AttackSpec 회전/FIX만료/상대·체리티799·800ms전환/상대·나레 발사회전·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 레비나 벽 연출·무기 장식 — 3.0.0-character.241

레비나 반격 출발/도착은 delivery.area wallPolicy:block이나 사용자 areaCircle 이펙트에 clipToAttackArea가 없어 온전한 원을 표시. 두 효과 모두 공용 실제 가시영역 polygon 클리핑/replaceAutoAreaEffect로 벽 차단 판정과 연출 동기화. 순간이동/피해/사거리 수치 유지.

메라모나 마지막단계 가시형 왕관/마름모를 곡선 장식/둥근 보석으로 교체. 사이엔 이미지 angle PI로 날이 좌하단·단검별 기존회전 유지. 패리 onBlock.modes로 cyien-dagger-block 갱신 및 리안과 동일 activityColors250ms/fade220ms에 accentColor 참조. 방어 성공에만 색변화·동일블록 중복 차단·상대 상태 복제 유지.

검증: 형상 미리보기·실제 방어성공/시간색상/상대/중복·레비나 출발·도착 실제벽 raycast polygon/원형효과 렌더·빈공간 대조·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각 검증 미실시.


## 무기 모션·메라모나 실행 오류 — 3.0.0-character.240

character.239에서 메라모나 빈 rmb.modules에 모션을 추가하는 과정에서 배열 빈 슬롯이 생김. AugmentService.prepareAttack의 module.type 접근 오류 원인. 빈 슬롯 제거·CharacterDataService 배열 누락 항목은 컴파일 시 경로 포함 오류로 검출. 전63명 공격 모듈 슬롯 대조 및 대상3명 실제 AugmentService.prepareAttack 회귀 추가.

사이엔 같은방향으로 포개진 외날 쌍단검 재디자인. 공용 partMotions rotationStateKey/rotationMs/rotationRadians로 단검별 완전회전·partSpins snapshot으로 잔향/사망 당시 자세 보존. 1타앞/2타뒤 반시계·3타회전없음/적중시650ms 잔향1회. 패리/절격/반격 발동 시 두 단검 반시계회전. 미아루키 기존 살짝 꺾임 모션 대신 완전회전·반격 공구함650ms 명시 잔향(설치/원거리전환과 무관하게 표시). 메라모나 모든 단계봉 scale1.65→2.0(+21.2%). 전투 수치/기존 참조 인덱스 유지.

검증: 형상 미리보기·실제 onDelivery/onHit/afterAttack 모션·3타 미적중/적중/중복·상대 독립회전 및 잔향 자세고정·설치중공구함잔향·63명 슬롯/대상 실제 증강 준비·전체26회귀·build/docs/check/verify/runtime 구문·ZIP대조. 실제 브라우저/온라인 시각검증 미실시.


## 사이엔·미아루키·메라모나 무기 이미지 — 3.0.0-character.239

공용 WEAPON_IMAGE_DEFS에 쌍단검·공구함·투척 스패너·마법소녀 별 마법봉과 단계별 리본/후광/날개/왕관 장식 등록. 사이엔 단검2자루는 실제 공격 전달 시 회전. 미아루키는 summon.inactive 조건으로 설치 중 본인 공구함 숨김·원거리 평타 전달 시800ms 스패너 전환 후 복구. mode.set 및 별도 ageStateKey의 mode.toggle로 재발사마다 갱신·상대 모드 snapshot 복제. 근접 평타는 공구함 모션. 메라모나 기본봉 위에 영구/임시 진행도 합산1~4단계 장식 누적·임시단계 소멸 시 장식 복구. 기존 기본 투명도/캐릭터 계열색/은신/사망/전환 연출 공용사용. 전투값과 기존 모듈 인덱스 참조 유지·캐릭터별 런타임 분기 없음.

검증: 형상 미리보기 시각 확인·공용 렌더 실행·설치/회수/799·800ms 경계/재발사/상대 snapshot·영구0~4×임시0/1 장식·전체26회귀·build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 브라우저/온라인 시각 검증 미실시.


## 카논 적중 회복 조정 — 3.0.0-character.238

일반 평타·제자리 회피 후 연타1/2타의 resource.restore amount100→70. 두 타 모두 적중 시 총140. 실행당1회 및 소환수/훈련봇 제외 유지. 공용 코드 변경 없음.

검증: 세 공격 모듈 수치/제외 조건 대조·구조/무기 회귀·build/docs/check/verify/runtime 구문·ZIP 원본 대조. 실제 온라인 플레이 미검증.


## 요오 평타 중복 피해 방지 — 3.0.0-character.237

온라인 착탄 확정 패킷에 원탄 적중 대상 목록이 없어 피해 확정보다 먼저 도착하면 분열탄 제외 대상이 비었음. 동일 networkKey의 별도 피해/착탄 carrier도 다시 분열 가능. excludeHitTargets 사용 공격은 착탄 패킷에 hitTargetIds를 보존하고 기존 탄환/복원 execution에 반영. 요오 평타는 기존 oncePerProjectile 공용 옵션으로 동일 탄환 분열1회. 원탄150·분열탄100 수치와 다른 적의 두 분열탄 적중 허용 유지.

검증: 수정 전 실제 착탄 송수신 회귀의 원탄 대상 제외 실패 확인·수정 후 통과. 전체26회귀 및 build/docs/check/verify/runtime 구문·ZIP 대조. 실제 두 기기 온라인 플레이 미검증.


## 룰리 평타 도달 피해 — 3.0.0-character.236

원인: 즉시 delivery.area가 먼저 피해를 주고 animateOutline은300ms 중45% 시간 동안 뻗음. rulerPresentation strikeDuration300/travelFraction0.45를 평타 연출과 전달 지연에 공통참조·135ms 도달 후 끝 네모 판정. 공용 delivery.area travelDelay는 원격 skipWindup으로 생략하지 않는 비행시간·geometryOriginMode cast-source는 발사원점 snapshot을 AreaAttackService geometrySource로 전달. 시전 후 이동해도 판정이 따라 움직이지 않음·기존 적 위치는 도달 시 검사·사망 취소·반격/기타 기본 area 즉시전달 유지.

검증: 신규 룰리 실제 전달 스케줄1/4/7단계·134ms 미발동/135ms 전달·동일 시점 채움·발사원점·원격skipWindup·1회·사망·기본 area 즉시 유지. 전체26개 회귀 스크립트 통과 및 build/docs/check/verify/runtime 구문·ZIP 대조. 실제 브라우저/온라인 플레이 미검증.


## 미아루키 회복·범위 — 3.0.0-character.235

공구함 배치 넉백 AttackSpec에 self/ally applyHitEffects 전달 및 관계필터 resource.restore200 조합·넉백은 enemy만. 스킬 설명 적 넉백/아군200회복·지속 회복 수치는 소환수 설명에만 유지. 공구함 최대/복구 체력400·250ms 재생40·범위220→176(-20%). 근거리 평타 실제 사거리/근접전환 geometry 및 본인 점선 원 모두 동일 fieldArea.range 참조. 기존 반격 회복200 유지 위해 회복 참조 multiplier10→5. 배치 중심 기존 공구함 위치·추가 실행분기 없음.

검증: 미아루키 배치 실제 공용 전달·관계 필터/회복 중복·범위 참조·요오/구조 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 플레이 미검증.


## 요오 딜러 검 좌우반전 — 3.0.0-character.234

공용 role-dealer paths의 x좌표만 반전. 딜러가 포함된5개 반격 조합의 해당 검 paths에도 동일 반전·배치 pivot/다른 역할/크기/색/잔향 유지.

검증: 요오·무기 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 미리보기·캡슐 전환 제거 — 3.0.0-character.233

일반/홀드/반격 attack.select 컨트롤러 preview:false 제거·공용600 벽차단 원 미리보기 복구. 평타800ms capsule state.window 및 기본무기 교체조건/월드캡슐 제거. 기본 역할 아이콘 유지·평타 캡슐 잔향650ms 유지.

검증: 요오39그룹·구조 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 캡슐 무기 전환 — 3.0.0-character.232

평타 발사 후 state.window800ms 동안 기본 역할 무기 이미지를 캡슐로 교체. 재발사 시800ms 갱신·만료 후 현재 역할 복구. 선딜/반격 선택 능력 표시는 기존 우선 유지. 캡슐 잔향은 공용650ms로 통일·확장페이드 유지. 기존 TimedActionState snapshot으로 상대도 동일 표시·전투 수치 변경 없음.

검증: 요오39그룹·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 평타 캡슐 잔향 — 3.0.0-character.231

평타 weaponImageEcho의 지속800ms·imageConfig gacha-capsule. 공용 순수 형상에 중앙 결합선의 둥근 뽑기 캡슐 추가·요오 계열 팔레트/발동 위치 고정확장 페이드 사용. 평상시 역할 아이콘·스킬/홀드/반격 잔향650ms 유지·공격 수치 변경 없음.

검증: 요오·무기·구조 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 사용 잔향 — 3.0.0-character.230

평타·일반/홀드 스킬·반격 발동 시 공용 weaponImageEcho650ms/확장0.55/imageAlpha1. wrapper after-attack에서 선택/무기 변경 전에 현재 사용 아이콘을 snapshot해 발동 위치 고정·확장 페이드. 회전 모듈/아이콘 rotationStateKey 제거. 분열탄/선택 후속에는 잔향 중복 없음·선딜에는 미발동. 반격은 선택 두 아이콘 snapshot. 컨트롤러 공격 회전 원 연출은 유지.

검증: 요오 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 평타 회전 제거 — 3.0.0-character.229

평타 lmb의 yoo-icon-rotation mode.toggle만 제거. 일반/홀드 스킬·반격 실제 발동350ms 아이콘 회전 및 컨트롤러600 벽차단/회전 원 유지.

검증: 요오38그룹·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 컨트롤러 범위 — 3.0.0-character.228

컨트롤러를 반경600·wallPolicy:block으로 변경. 하츠하츠 반격의 공용 annularDoubleSweep 시계방향1회300ms 회전 원 연출 사용·요오 색·실제 공격 범위로 벽 clipping. 일반/홀드/반격이 같은 AttackSpec 참조·속박1초 유지·반격 CC도 같은600 벽차단 범위. 기존 컨트롤러 선딜 미리보기 제외 유지.

검증: 요오 회귀·구조 회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 시각 검증 미실시.


## 요오 아이콘 회전 — 3.0.0-character.227

평타·일반/홀드 스킬·반격 실제 발동 시 공용 mode.toggle로 yoo-icon-rotation을1회 증가. 모든 기본/선딜/반격 조합 아이콘은 같은 rotationStateKey와350ms 한 바퀴 회전을 참조. 선딜 준비/분열탄/선택된 후속 능력은 추가 회전하지 않음. 기존 밝기·두 아이콘800ms·공격 수치 유지. 공용 모드 snapshot/무기 렌더 사용·전용 실행 분기 없음.

검증: 요오·무기·구조 회귀 및 build/docs/check/verify/runtime 구문·ZIP 무결성. 실제 온라인 시각 검증 미실시.


## 3.0.0-split.1 — 2026-10-03
- 기준: 3.1717 (65).html. 내부 게임 밸런스/릴리스 번호는 변경하지 않음. 이 번호는 소스 구조 변경 버전.
- 요청: 규칙 이관, 필독 README, 역할 목록, 버전 기록, 고정 파일명, 향후 모듈 조합형 유저 캐릭터를 고려한 분할.
- 변경: README/AGENTS/DIVIDE TASKS/project.json, 캐릭터 58개 데이터 파일 및 순서 목록, 서비스별 소스, CSS 2개, 별도 Firebase/UI 스크립트, 조립·문서 검사·로컬 서버·실행 파일, 캐릭터 계약 문서.
- 기존 규칙/과거 HTML 주석 전부 별도 문서로 보존. 단일 HTML 규칙 및 이전 파일명 규칙만 현재 지시로 대체.
- 현재 캐릭터 객체·참조·등록 순서·실행 순서 보존. 유저 캐릭터 기능은 구현하지 않음.
- 검증: 조립된 메인 JavaScript SHA-256이 원본과 동일. 공식 데이터 58명 참조 해석/컴파일/동결 확인. 서비스·인라인 스크립트 435개 구문 검사 통과. 로컬 서버 HTML/runtime/CSS/Firebase 파일 HTTP 200 확인. 전체 파일 역할 목록과 해시 최신화 검사 통과.
- 브라우저 실행 검증은 환경에 브라우저 실행 파일이 없어 완료하지 못함. 실제 로그인·온라인 실전·훈련장 시각 검증은 미완료.
- 남은 작업: 대형 객체 내부 책임 분리, 명시적 의존 주입/ESM 전환, 미래 제작 UI/카탈로그/검증/정규화/등록 구현. 온라인 실전과 실제 로그인 검증 필요.

## 3.0.0-split.2 — 2026-10-03 검수 및 수정
- 발견: 정규식 스타일 추출이 원본 규칙 주석의 `<style>` 예시를 실제 태그로 오인. game.css에 규칙/주석 내용이 섞였으며 README/LEGACY RULES/LEGACY PATCH LOG에 뒤쪽 규칙 누락과 HTML 혼입 발생. split.1의 메인 JavaScript 대조·HTTP 검사만으로는 탐지하지 못했다.
- 수정: 실제 HTML 파서로 2개 style/3개 script/주석을 구분해 다시 추출. 스타일/스크립트 ID와 원본 리소스 순서 유지. 전체 기존 규칙과 모든 원본 HTML 주석 복원. 캐릭터/전투 JavaScript는 변경하지 않음.
- 수정: Python의 텍스트 입출력을 명시적 UTF-8로 변경해 Windows 로캘 의존 제거. 역할 목록 검사에서 등록된 파일의 실제 누락도 탐지. 로컬 서버 캐시를 막고 동적 runtime의 GET/HEAD 응답을 통일.
- 추가: tools/verify.py. 초기 분할 기준 DOM/리소스/실행 순서/등록/규칙/배포 결과 대조. project.json에 원본 검증 기준 저장.
- 검증: 원본 DOM 구조/내용·실제 CSS 2개·보조 JS 2개·메인 JS 1개·리소스 순서 모두 대조 통과. 58명 데이터 참조 해석/컴파일/동결 및 435개 서비스/인라인 JS 구문 검사 통과. 로컬 서버 리소스 6개 GET/HEAD의 바이트·길이·상태·캐시 정책 통과.
- 검사기 검증: CSS 훼손, 등록 캐릭터 삭제, README 변경 후 문서 미갱신, 규칙 누락, 오래된 runtime, 중복 실행 순서, 미등록 파일을 각각 의도적으로 만들었을 때 모두 실패를 탐지. 원복 후 전체 검사 통과.
- 미검증: 실제 브라우저 화면·훈련장 조작·Firebase 로그인·온라인 실전. 이 환경에 브라우저 실행 파일이 없어 자동 브라우저 검수는 수행하지 못함.

## 3.0.0-split.3 — 2026-10-03 서버 시작 검사 수정
- 보고: Windows Python 3.13에서 DIVIDE TASKS 최신화 검사 실패가 CalledProcessError로 이어져 서버 시작 차단.
- 확인: 기존 serve.py는 개발용 check를 subprocess.run(check=True)로 강제 실행해 문서 차이만으로 전체 서버를 종료했다. 배포 ZIP 자체는 현재 환경에서 문서 검사 통과. 사용자 PC에서 달라진 구체적인 파일은 확인하지 못했음.
- 수정: 서버는 등록 파일 존재·소스 조립을 먼저 검증하고, 문서가 오래된 경우에는 안내만 출력해 서버를 실행한다. 개발용 엄격 check 및 작업자의 역할/변경 기록 갱신 의무는 유지. 문서를 무조건 자동 재생성하지 않음.
- 수정: 텍스트 해시는 UTF-8 BOM 및 LF/CRLF 차이를 정규화. docs/build 출력은 LF로 고정. 같은 내용의 Windows 줄바꿈 변환이 해시 불일치로 이어지는 경로 제거.
- 변경 파일: tools/project.py, tools/serve.py, README.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, docs/VERIFICATION.md.
- 검증: 전체 텍스트를 CRLF로 바꾼 복사본에서 문서 검사·원본 대조 통과. 실제 README 내용 변경은 엄격 검사에서 계속 탐지. 문서가 오래된 상태에서 서버 HTML/runtime HTTP 200 및 CalledProcessError/시작 Traceback 없음 확인. 문서 자동 덮어쓰기 없음 확인. docs 후 엄격 검사 재통과. 캐릭터 파일 실제 누락은 명확한 안내로 시작 차단 확인.
- 검증 한계: Windows 줄바꿈과 공백/한글 경로를 재현한 검사이며 실제 Windows Python 3.13 실행 환경은 없음.

## 3.0.0-room.1 — 2026-10-03 방 연결 구조 교체
- 요청: 불안정한 방 생성 시스템 재구현, 비정상적인 중복/임시 구조 제거 및 변경 설명.
- 확인한 원인: 등록 전 방장/코드 공개, 모듈 로딩 이후 reset으로 취소/연타 경합, 취소된 연결의 늦은 open/data, handshake 타임아웃과 close의 중복 실패 처리, 승인 없이 대기하는 채널, 승계 identity 실패의 신규 관전자 fallback, 여러 승계 재시도 루프, CDN 실패 Promise 영구 재사용.
- 변경: RoomConnectionService로 생성/입장/승계 수명주기 통합. 세대 토큰과 Peer/채널 소유권으로 오래된 콜백 차단, dispose가 소유권을 먼저 무효화한 뒤 닫음. 등록 12초/handshake 10초/승계 전체 45초 제한. 코드 충돌 최대 32회 새 번호 시도. 번호 등록 성공 뒤 방장 권한 설정.
- 프로토콜: 화면의 4자리 코드는 유지. 내부 Peer ID에 duels3-room-v1 namespace 적용. hello/welcome에 protocol/code/roomInstance 포함. 승계는 epoch/PID/sessionKey/roomInstance가 모두 맞을 때만 기존 PID 복원. 승인 전 gameplay 차단. 정원/중복 세션/버전/잘못된 승계 사유 구분. 이전 배포본과 방 연결은 호환되지 않으며 모두 새 파일로 실행해야 함.
- 구조: 기존 openHostPeer/claimDelegatedHost/restoreMigrationClientPeer/reconnectToMigratedHost 제거. 기존 전투·계정·회원/관전자 정책·점수·선택·라운드 재개 경로 재사용. 준비/팀 변경은 room phase에서만 승인.
- 신호 서버 disconnected는 살아 있는 DataChannel의 이탈로 처리하지 않고 Peer.reconnect 수행. 실제 DataChannel close/error만 단일 이탈 경로로 처리.
- PeerRuntime: CDN별 10초 제한, 실패 script 정리, 공유 로딩 Promise 성공/실패 후 해제하여 재시도 가능.
- 신규 연결 서비스 사유: 기존 RoomService에는 타이머/Peer/멤버·매치 규칙이 섞여 단일 연결 소유자가 없었음. 기존 기능을 확장·분리하여 취소/세대/승계의 수명주기 책임을 한 곳에 둠. 이후 초대·재입장도 같은 start/승인 경로를 재사용할 수 있음. 캐릭터 제작 기능은 추가하지 않음.
- 변경 파일: src/network/RoomConnectionService.js, src/network/RoomService.js, src/core/PeerRuntime.js, tools/test-room-connection.cjs, tools/verify.py, README.md, docs/ROOM CONNECTION.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성 runtime.js.
- 검증: 실제 서비스 코드에 가짜 Peer/채널/시계를 주입한 14개 회귀 시나리오 통과. 4인 승인/브로드캐스트 이후 호스트 이탈, P2 승계와 P3/P4 기존 PID 재접속 포함. 전체 JS 구문·현재 배포/원본 UI 구조·미변경 리소스·58명 등록·규칙 이관·문서 최신화 검사 통과. ZIP 추출본 동일 검사 통과.
- 미검증: 실제 브라우저 화면·PeerServer·WebRTC/NAT·서로 다른 기기의 온라인 대전·Firebase 로그인. 가짜 Peer 검사는 실제 네트워크 연결 성공을 보장하지 않음. 실행 가능한 브라우저가 없는 환경이므로 실기기 검수가 남아 있음.

## 3.0.0-room.2 — 2026-10-03 재입장 카드 순서 수정
- 요청: 나갔다 들어온 플레이어를 현재 참가자 뒤의 마지막 자리에 표시.
- 원인: createMember의 기본 joinOrder=null을 Number(null)=0으로 변환해 일반 참가자 전체가 순서 0이 됨. RoomUI의 joinOrder 정렬이 PID 순서로 떨어져 빈 P1/P2 재사용 시 앞/중간에 표시됨. 승계 클라이언트의 _joinSequence도 스냅샷에서 이어받지 않았음.
- 수정: 기존 RoomService에 syncJoinSequence/allocateJoinOrder를 분리. 명시적 유효 숫자 순서만 유지하고 일반 입장/재입장은 최대 사용 순번보다 증가. 스냅샷에 joinSequence를 포함하고 acceptState에서 현재 멤버 순서와 함께 카운터 복원. 마지막 참가자 삭제 후에도 카운터 보존. 승계 자동 재연결은 기존 멤버/순서를 유지.
- UI: 기존 joinOrder 정렬을 그대로 재사용하며 PID/방장 권한/팀·관전 정책을 화면 위치와 분리. 새 UI나 후처리 덮어쓰기 없음.
- 변경 파일: src/network/RoomService.js, tools/test-room-connection.cjs, project.json, README.md, docs/ROOM CONNECTION.md, docs/VERIFICATION.md, PATCH LOG.md, DIVIDE TASKS.md 및 생성 runtime.js.
- 기록 정정: RoomService symbols 목록에서 room.1에 제거된 네 메서드 삭제, roomInstance와 새 순서 메서드 등록. RoomUI 역할 설명에 실제 정렬 책임 명시.
- 검증 강화: 모의 다중 클라이언트에서 같은 패킷 객체를 공유하던 시험 방식을 structuredClone 전송으로 수정. 다른 클라이언트의 host 이탈 상태가 서로 영향을 주지 않게 하고, 실제 migration 승인 패킷/호스트 연결 Map을 검증함. 기존 room.1 시험은 실제 WebRTC뿐 아니라 이 재접속 확인에도 한계가 있었음.
- 검증: 총 17개 회귀 검사 통과. 기존 4인 승계 시험을 P1 재입장까지 확장해 모든 화면의 P2/P3/P4/P1 순서 확인. 실제 RoomUI.render를 사용해 기본/null 순서, 중간 P2 이탈·재입장(P1/P3/P2), 빈 슬롯 후배치, 최근 참가자 삭제 후 스냅샷 카운터 복원을 추가 검사. 현재 runtime 구문·배포 일치·원본 UI 구조·미변경 리소스·문서 최신화 및 ZIP 추출본 검사 통과.
- 미검증: 실제 브라우저 시각/기기 간 WebRTC. 카드 외형은 시험에서 대체하고 실제 render의 순서/빈 슬롯 배치는 실행함.

## 3.0.0-game.1 — 2026-10-03 자동 관전·방어 잔향·선택지 상한
- 요청: 죽은 플레이어는 처치자를 자동 관전, 셰리나 비아 평타가 방어됐는데 잔향이 끝까지 남는 문제 수정, 캐릭터/증강 등장 수 최대 25.
- 관전: 확정된 duel-death-confirmed를 단일 진입점으로 사용. 로컬 사망만 Training.spectating과 공통 spectatorFollowPlayer로 처치자 추적. 기존 좌클릭 순환도 같은 추적 메서드 재사용. 처치자 없음/사망/이탈은 추적하지 않으며 silent 이탈·다른 플레이어 사망·토큰 불일치·중복 확정으로 관전을 다시 바꾸지 않음.
- 잔향 원인: duel-projectile-guard-resolved 수신은 이미 사거리/경계에 도달해 사라진 투사체를 찾지 못하면 성공으로 종료해 남은 전체 길이 field와 최근 경로를 보정하지 않았음. 기존 guard 재생성의 clearResolved도 필드 수명/타격 기록을 잃게 했음.
- 잔향 수정: ProjectileImpactService.correctGuardPath가 projectileKey에 연결된 살아 있는 경로 필드와 최근 경로를 접촉점까지 보정. 기존 투사체가 없어도 수신 처리. 셰리나 평타뿐 아니라 반격/향후 같은 projectile-path field에 공통 적용. InstalledAreaFieldService.activatePoint의 preserveState 옵션으로 시작/종료/틱/대상 기록 보존, 프레젠테이션 preserveTimeline 및 네트워크 보정 수신에서도 동일 처리. 기존 guard clear 후 새로 생성하는 경로 제거. 만료된 필드는 보정으로 되살리지 않음.
- 상한: RoomService.maxChoiceCount=25를 추가해 설정 저장·라운드 준비 추첨·RoomUI 선택지의 단일 기준으로 사용. 기본값 7/5, 최초 증강 선택 10개와 기존 중복 없는 추첨/제외 정책은 유지. 선택지 부족 시 가능한 풀의 수까지만 제공.
- 변경 파일: src/modes/Training.js, src/network/OnlineDuelService.js, src/network/OnlinePresentationSyncService.js, src/projectiles/ProjectileImpactService.js, src/core/InstalledAreaFieldService.js, src/network/RoomService.js, src/ui/RoomUI.js, tools/test-gameplay-fixes.cjs, README.md, PATCH LOG.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: gameplay 회귀 12개 및 기존 방 연결 17개 통과. 실제 셰리나 데이터의 평타/반격 impact를 실행해 range 종료 뒤 guard 보정 확인. 실제 InstalledAreaFieldService로 판정 range·이펙트 range·최근 경로·수명/틱 보존 확인. 실제 RoomUI의 0~25 옵션, 설정 clamp, 중복 없는 25개 추첨과 라운드 준비 패킷 확인. 현재 빌드 구문·원본 UI 구조/미변경 리소스·문서 최신화 검사와 ZIP 추출본 검사 통과.
- 한계: 제어된 서비스 실행/모의 메시지 검사이며 실제 브라우저 시각·WebRTC 지연·실기기 온라인 실전은 미검증. 이미 잘못 적용된 과거 잔향 피해를 되돌리는 기능은 추가하지 않았음.

## 3.0.0-game.2 — 2026-10-03 원격 잔향 보간·설명·스토브
- 요청: 상대 화면의 셰리나 평타 잔향이 뚝뚝 끊겨 보임, 설명 ‘소리의 잔향을 이용해’, 샤베트 (피해 수치)→(수치), 휴대용 스토브 체력 1000.
- 확인한 구조: 원격 projectile-path field는 field-point-spawn 수신 때만 길이가 갱신되고 progressRect가 그 길이를 즉시 사용. 연속 렌더 중에도 패킷 단위의 길이 점프가 그대로 노출됨.
- 수정: 기존 activatePoint/EffectSpawnService/progressRect 경로 확장. 원격 live 갱신의 최근 수신 간격(최대 100ms)을 표시 보간 시간으로 사용하고, 새 갱신은 현재 보이는 길이에서 이어감. 수신 길이 밖으로 예측 연장하지 않음. 최종 종료·방어·축소는 즉시 확정 길이 사용. 키별 전환 상태는 네트워크 snapshot에서 제외. 피해 module.range는 보간하지 않으며 타격 기록·필드/이펙트 타임라인 보존. 캐릭터 전용 분기/새 모듈 없음.
- 데이터: 셰리나 desc 문구 수정. 샤베트 LMB/RMB 괄호의 ‘피해’만 제거, 수치/공격 유지. 디라 스토브 maxHealth/respawnHealth 700→1000, tooltip의 기존 참조가 새 수치 표시.
- 변경 파일: src/core/InstalledAreaFieldService.js, src/render/EffectSpawnService.js, src/network/OnlinePresentationSyncService.js, src/modes/Training.js, src/data/characters/sherina.js, sherbet.js, dira.js, tools/test-gameplay-fixes.cjs, README.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md 및 생성 runtime.js.
- 검증: gameplay 회귀 15개(기존 12개+불규칙 수신 연속성·종료/방어 즉시 축소와 틱/수명 보존·패킷 몰림/별도 효과 독립성), 방 연결 17개. 현재 소스/배포·원본 UI/미변경 리소스·58명 등록·규칙 보존·문서/구문 및 ZIP 추출본 검사.
- 한계: 실제 기기 간 브라우저 시각/WebRTC 지연은 미검증. 네트워크 수신이 100ms보다 오래 끊기면 마지막 확정 길이에서 대기하며 추측 연장하지 않음.

## 3.0.0-audit.1 — 2026-10-04 캐릭터 구조 검수·충전 반격
- 요청: 충전 반격 설명 변경 및 최대 스테미나 -20%, 전체 코드의 규칙/공통 모듈 구조 검사와 교정·테스트 대상 안내.
- 충전 반격: 설명에서 최대 소지량 문구 제거, 획득량 +1·새 획득 시 보유 시간 초기화 표시. 기존 counter.stock 기능은 보존하고 modifier.constant(maxStamina,-0.20) 추가. BuffService/AugmentService의 중첩·제거·비율 유지·소환수 상속 경로 사용.
- 구조: 체리티 allowNoCc 제거와 기존 AttackSpec CC 참조, 반 수리 ProgressStateService 이동/전용 설정 참조 제거/완료 repair 미정의 변수 교정. MovementAbilityService에서 기존 TagService로 이동 태그 파생, 적중·벽 적중·온라인 확정·시아넬리 교환의 별도 흔적 생성 제거. 시아넬리·디라 중복 홀드 정책과 디라 5개 공격의 수동 파생 태그 제거.
- 지연/이벤트: 키 회복·뉴 반격 후속을 SimulationScheduleService로 통합. FieldDodgeRewardService의 종료 타이머 fallback 제거, dodge-ended 단일 확정과 취소/세션 정리. CharacterTriggerEffectService now/InstalledAreaFieldService frameScale 미정의 참조 교정. regenPercent 감소 하한 -100%.
- 새 게임플레이 모듈/유저 캐릭터 제작 기능 없음. 상세 원인·값·모듈 재사용·58명 결과와 직접 플레이 항목은 docs/STRUCTURE AUDIT.md.
- 이전 실행 환경 연결 장애로 중단했던 문서·패키지 작업을 복구 후 완료. 코드 수정은 유지됐고 임시 분석 파일은 유실되어 검증은 현재 소스 기준 재실행.
- 변경 파일: runtime.js, tools/test-structure.cjs, src/abilities/MovementAbilityService.js, src/render/CharacterTriggerEffectService.js, src/core/InstalledAreaFieldService.js, src/core/COMBAT_BUFF_DEFS.js, src/core/ProgressStateService.js, src/combat/CounterModuleService.js, src/combat/AugmentDodgeSequenceService.js, src/combat/AttackModuleService.js, src/combat/FieldDodgeRewardService.js, src/projectiles/StationaryProjectileInteractionService.js, src/data/AUGMENTS.js, src/modes/Training.js, src/network/NetworkHitAuthorityService.js, src/data/characters/cherity.js, src/data/characters/xianelli.js, src/data/characters/van.js, src/data/characters/dira.js, README.md, PATCH LOG.md, docs/STRUCTURE AUDIT.md, docs/VERIFICATION.md, project.json, DIVIDE TASKS.md.
- 검증: 58명 공통 컴파일/동결/함수 없는 데이터/Trigger/반격 및 공격 참조/태그. 구조 회귀 11개·게임 15개·방 연결 17개. 현재 runtime 구문/배포 일치·원본 UI/미변경 리소스·규칙·역할/문서 및 ZIP 추출본 검사.
- 한계: 실제 브라우저 시각·WebRTC/NAT·Firebase 로그인 미검증. 전체 가능한 실행 상황의 무오류 증명 아님. 기존 대형 객체·네트워크 결합은 별도 구조 과제로 유지. 반 수리 시간 등 수치 변경은 하지 않음.

## 3.0.0-ui.1 — 2026-10-04 카드 칭호 선명도
- 요청: 캐릭터 카드 칭호가 흐리게 보임.
- 확인: 칭호는 char-name의 자식으로 5px/10px 검은 text-shadow를 상속하며, 두 색상 캐릭터 이름의 drop-shadow 필터도 함께 적용됨.
- 수정: 기존 카드 칭호 규칙에서 text-shadow:none, 불필요한 inline transform 제거, 규칙상 10px 적용. 칭호가 있는 이름만 :has 필터 해제. 마스터 V 조건·800 굵기·그라데이션·프로필 표시 유지. 이름의 기존 검은 그림자는 유지되며 해당 카드의 색상 필터만 제거됨.
- 검증 도구: 원본 baseline_resources 해시 보존, 의도적으로 변경한 CSS의 현재 해시 별도 등록. --baseline은 원본 검사 유지.
- 변경 파일: styles/game.css, tools/verify.py, project.json, README.md, PATCH LOG.md, DIVIDE TASKS.md.
- 검증: 문서 최신화·HTML/리소스/배포 검사와 기존 구조 11개·게임 15개·방 연결 17개 회귀 검사 및 ZIP 무결성 확인.
- 한계: 실제 브라우저/사용자 디스플레이 시각 검증은 미실시.

## 3.0.0-balance.1 — 2026-10-04 타우 충전 피해 500
- 요청: 타우 스파크 충전 피해를 500으로 상향.
- 변경: attack.tau.lmb-charged damageRatio 2.25→2.5, Base Damage 200 기준 실제 기본 피해 450→500. LMB CRIT 설명은 기존 {damage} 보간으로 같은 데이터 참조.
- 기존 모듈: state.progress로 적중당 +1/최대 3 및 충전 공격 적중 시 초기화, action.attack alternateWhen으로 최대 충전 공격 선택, delivery.area로 근접 부채꼴 전달. 수치 변경만으로 구현하며 새 모듈 없음.
- 변경 파일: src/data/characters/tau.js, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: 실제 캐릭터 컴파일·공통 설명 피해 계산으로 500 확인, 타우 데이터의 다른 필드 보존 대조, 구조 회귀 11개·runtime 구문·배포 일치·문서 최신화·ZIP 무결성 검사.
- 한계: 실제 브라우저 온라인 전투는 미실시. 피해 버프/방어 적용 후 최종 피해는 공통 계산에 따라 달라짐.

## 3.0.0-text.1 — 2026-10-04 엔소냐 평타 설명
- 요청: 엔소냐 평타 설명에 가까운 적 넉백 추가.
- 변경: LMB 설명을 ‘석궁 화살 연사 및 가까운 적 넉백 ({damage})’으로 수정. 기존 공통 설명의 피해 보간 사용.
- 확인: movement.knockback(distance:20, maxProjectileTravelRatio:0.25)이 이미 존재함. 공격 데이터·피해·넉백·실행 서비스는 변경하지 않음. 새 모듈 없음.
- 변경 파일: src/data/characters/nsonya.js, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성 runtime.js.
- 검증: 문구 외 원본 데이터 보존 대조, 생성 runtime 문구 반영·구문·배포 일치·문서 최신화·ZIP 무결성 검사.
- 한계: 실제 브라우저 화면 확인은 미실시.

## 3.0.0-package.1 — 2026-10-04 배포 파일명 변경
- 요청: 최신본을 Duels.zip / Duels.html 이름으로 제공.
- 변경: 진입 HTML 이름 변경, serve.py의 루트 GET/HEAD 경로 및 verify.py·project.json·README의 현 파일명 규칙 갱신. 압축 내부 최상위 폴더는 Duels. 기존 개발 로그·원본 규칙 기록은 보존. 게임 코드와 HTML 내용은 그대로 유지.
- 변경 파일: Duels.html(이름), tools/serve.py, tools/verify.py, project.json, README.md, PATCH LOG.md, DIVIDE TASKS.md.
- 검증: 문서 최신화·원본 HTML 구조/리소스·현재 배포 일치 및 ZIP 무결성·내부 진입 파일 이름 확인.

## 3.0.0-character.1 — 2026-10-04 테르디온 구현
- 요청: 노련한 발파원 테르디온, HP1500/보통 이속/새 색상, 착탄 0.5초 뒤 중심 거리별 폭발 피해·넉백, 평타 카트리지, 지정점 발파/벽 파괴, 8방향 시계 순차 반격. 직격 피해도 포함하도록 최종 지시 반영.
- 순수 데이터: src/data/characters/terdion.js를 공식 59번째로 등록. #c49a68, speed4, Base Damage100, 지속전투형/원거리/컨트롤러. 함수/캐릭터 전용 실행 분기나 유저 제작 UI 없음. 임시 LMB 직격100/폭발100~300·범위120·비용200·쿨450ms, RMB 직격150/폭발150~450·범위180·비용400·쿨1200ms, 반격 폭약당 직격100/폭발100~300·범위120·비용0·8발80ms간격. 반격 공통 선딜300ms와 무력화 CC.
- 재사용: delivery.projectile/pierce/impact, effect.spawn, delivery.area.delay와 SimulationScheduleService, impact-proximity 넉백, counter.execute/ccRefAttackId, delayed-projectile-volley/angleOffsets. damage.range-band-multiplier를 radial-linear로 확장하고 공통 DamagePipeline에서 실제 impact.origin 거리로 보간. 설명 피해는 같은 원본 참조. 기존 단계별 거리 피해 동작 보존.
- 착탄: projectile.impact.oncePerProjectile를 설정/실행 경로 모두 지원. 확정 피해와 착탄 패킷이 별도 carrier로 들어와도 key별 1회만 실행. 일반 직격 투사체의 피격 권위 착탄 확정도 전송해 제3 참가자/관전자에 같은 착탄 경로 전달.
- 새 모듈: world.destroy-walls. 기존 geometry/벽 설치/채굴은 실제 맵 제거·원본 보존·복원·스냅샷을 제공하지 않아 신규 책임 분리 필요. WorldDestructionService가 실제 범위 발동 중심·반경으로 맵 블록/설치 벽 제거, 원본 맵 보존/라운드 복원. 다른 폭발/지형 파괴 기술도 재사용 가능. TagService에서 벽 파괴 자동 파생. 온라인 어댑터는 사건과 기존 전투 스냅샷 주기만 사용하며 다른 라운드/맵 차단·단조 제거 집합·늦은 설치 벽 복제 재등장 방지.
- 성능: 파괴 변화 때만 벽 배열/렌더 캐시 갱신. 인접 잔존 블록을 행별로 합쳐 충돌 탐색 수 감소, 설치 벽 소유자별 필터도 revision 캐시. 게임플레이 raw timer 없음.
- 변경 파일: src/data/characters/terdion.js, index.json, src/combat/DamageRangeBandService.js, DamagePipeline.js, AreaAttackService.js, src/projectiles/ProjectileImpactService.js, ProjectileModuleService.js, ProjectileService.js, src/world/WorldDestructionService.js, DynamicWallService.js, src/debug/DebugMapService.js, src/network/OnlineWorldDestructionSyncService.js, OnlineDuelService.js, src/core/TagService.js, tools/test-terdion.cjs, test-structure.cjs, verify.py, docs/TERDION.md, CHARACTER CONTRACT.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md 및 생성 runtime.js.
- 검증: 테르디온 12개 실제 서비스/모의환경 회귀(직격/감쇠·회피/방어/팀·넉백·499/500ms·중복 착탄·8발 시계 순서·반격·원본 보존/복원·stale 설치 벽·토큰/합집합·실제 impact→area 벽 파괴). 전체59명 구조11개·기존 게임15개·방 연결17개. runtime 구문·현재 소스/배포 일치·원본 UI/미변경 리소스·기존 규칙 보존·역할 문서·ZIP 추출본 검사.
- 한계/직접 검사: 실제 브라우저/WebRTC/Firebase·시각/실기기 성능·실전 밸런스 미검증. 테르디온 직접 착탄/벽/회피/반격/다음 라운드 복원과 상대·관전자·승계 화면을 확인. 공통 경로 회귀 대상 루네프/메후구/시아넬리/클레아. 모듈별 값/설치 벽 단위 정책 등은 docs/TERDION.md.

## 3.0.0-character.2 — 2026-10-04 테르디온 투척·맵 교체
- 요청: 첨부 맵2개 교체, 가벼운 벽 파괴 연출, 평타/스킬/반격 무기 투사체, 폭발1/.8/.4 단계, 메후구형 공중 스킬/근거리 반격, 피해 괄호 단순화, 착탄 호 게이지, 8방향 폭발 미리보기.
- 맵: 비오픈맵3/8의 기존ID/크기를 유지하고 첨부 전체 타일을 기존 압축 wallRects로 변환. 전체 타일 SHA-256 대조. 팀전은 기존 생성 경로로 새 원본을 사용.
- 데이터: 기존 weapon-projectile/anchor-cross·trajectory.arc·arrival.linger·effect.spawn remainingArcGauge 조합. 스킬은 비행 벽 통과/경로 피해 없음/착탄 적 우선 직격150을 사용해 메후구형 지정점 투척. 반격350/8발80ms/8방향 미리보기. 착탄500ms 잔류와 게이지·폭발 delay를 같은 원본 값으로 참조. 설명(100/300)/(150/450)/(100/300).
- 피해: 기존 radial 모듈 centerMode:impact 확장. 반경을3등분하고 .8/.5 누적으로1/.8/.4. 정확한 경계는 기존 > 규칙대로 안쪽 단계. 평타/반격300/240/120, 스킬450/360/180. 넉백만 기존 선형 유지.
- 공통 수정: 잔류 진입의 벽/빈 지정점에서도 impact를 실행하고 target-point 직격 removeOnTrigger:false는 잔류를 보존. 예측 접촉만으로 착탄 확정하지 않음. 사거리 착탄은 snapToRangeEnd 옵션을 재사용해 정확한 위치 유지. 온라인 확정에 앞서 예측 소비된 무기 객체는 기존 spawn/linger로 복원, 비행 지연 보정 금지/키별 중복 방지. 다방향 delayedVolley 미리보기마다 실제 linked area를 추가. 지정점 비행 벽 통과 미리보기 정책 반영.
- 벽 연출: 공통 effectShape/animation/spawn의240ms 작은 조각, 사건최대32개. owner 생성/같은 presentation snapshot 복제, 기존 지형 사건/상태 복제 유지. 새 gameplay 모듈/캐릭터 분기/전용 렌더러/타이머 없음.
- 변경 파일: src/core/OFFICIAL_DUELS_MAP_SOURCE.js, src/data/characters/terdion.js, src/combat/DamageRangeBandService.js, AttackPreviewService.js, src/projectiles/TargetPointProjectileService.js, ProjectileService.js, src/network/OnlineDuelService.js, src/world/WorldDestructionService.js, tools/test-terdion.cjs, docs/TERDION.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온21개(기존12+단계 경계/무기·궤적·설명/실제 잔류/8방향 preview/Canvas 호 렌더/조각 snapshot/첨부 타일 전체 SHA-256/실제 적·벽·빈 지정점 도착/실제 온라인 확정 수신 복원), 59명 구조11개·기존 게임15개·방17개. 구문·현재 소스/배포·원본 UI·미변경 리소스·전체 기존 규칙·역할 문서 및 ZIP 추출본 검사.
- 한계: 실제 브라우저·WebRTC·로그인·시각/프레임 성능/실전 밸런스는 미검증. 테르디온 전체 착탄/8방향/벽 파괴/라운드 복원과 상대·관전자 화면, 메후구/시아넬리/루네프/클레아 공통 경로를 직접 플레이 확인.

### character.2 추가 지시 반영 — 2026-10-04
- 최종 폭발 단계는 평타/반격300/200/100, 스킬450/300/150. 기존 radial 단계에2/3와1/2를 누적해1/(2/3)/(1/3)으로 적용. 앞 character.2의1/.8/.4 기록은 최초 요청 경과이며 이 최종 지시가 우선한다.
- 반격 투척 간격80ms→40ms. 첫 발부터 마지막 발까지560ms→280ms이며8방향/공통 선딜300ms는 유지. 피해 경계 및 실제 순차 예약 검사도 최종값으로 변경.

## 3.0.0-character.3 — 2026-10-04 테르디온 접촉 벽만 파괴
- 요청: 스킬이 직접 맞닿은 벽만 파괴.
- 변경: 기존 world.destroy-walls.range를 rmb 투사체 판정 radius 참조로 설정(현재12). 폭발180 범위 전체 파괴에서 착탄 투사체 원과 실제 겹치는 블록/설치 벽만 파괴하도록 변경. 500ms 폭발 시점·조각 연출·기존 지형 동기화 재사용. 설명도 직접 닿은 벽으로 갱신. 신규 모듈/공통 실행 코드 변경 없음.
- 변경 파일: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개, 구조11개·게임15개·방17개. 추가 실제impact→area 검사에서 접촉 블록1개 파괴/인접 블록 및 설치 벽 보존/벽 근처 바닥 착탄 파괴 없음 확인. 구문·배포·문서·ZIP 무결성 검사.
- 한계: 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-character.4 — 2026-10-04 폭발 벽 차단·도달 벽 파괴 및 스킬 수치
- 최종 지시: 폭발은 벽에 막히며 폭발이나 탄환에 직접 닿은 벽 파괴. 이전 character.3의 탄환 접촉만 파괴 해석을 수정.
- 스킬: 직격150 유지, 폭발600/400/200(Base Damage100×6과2/3·1/2 단계), 스테미나1000. 반격40ms 간격 유지.
- 공통: AreaAttackService는 기존 벽으로 판정/FX를 완료한 뒤 지형 파괴 실행. world.destroy-walls의 기존 range에 폭발 반경 참조, contactRange에 탄환 반경 참조, wallPolicy:block으로 파괴 전 벽 목록의 가시성 검사. WorldGeometryService.segmentRectEntry 재사용. 폭발 범위 안이어도 다른 벽에 가려진 벽은 파괴하지 않고 탄환이 직접 접촉한 벽은 포함. 같은 폭발이 부서진 벽 뒤로 추가 피해/파괴를 전달하지 않음. 새 모듈/캐릭터 예외 없음.
- 변경 파일: src/data/characters/terdion.js, src/combat/AreaAttackService.js, src/world/WorldDestructionService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온22개(600/400/200·cost1000·벽 차단 옵션·노출 벽/가려진 벽·탄환 접촉·형상 확정 후 파괴 순서 포함), 구조11개·게임15개·방17개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 화면은 미검증.

## 3.0.0-character.5 — 2026-10-04 스킬 탄환 크기·소모 조정
- 테르디온 RMB 투사체 반경12→18(지름24→36), 스테미나1000→800. 표시 무기 크기/착탄 호 반경/벽 직접 접촉 반경은 기존 데이터 참조로 함께 반영. 폭발600/400/200·범위180·벽 차단/도달 벽 파괴 유지.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(실제 컴파일된 판정/표시/게이지/접촉 반경18·비용800 포함), 구조11개·구문·배포·역할 문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수는 미실시.

## 3.0.0-character.6 — 2026-10-04 반격 거리·미리보기
- 반격 투척 거리350→175(50% 감소). 미리보기는8방향 폭발 원만 표시하고 비행 경로를 숨김. 공통 AttackPreviewService의 기존 previewProjectilePaths에 impact-only 선택 지원; 다른 공격의 경로 표시는 유지.
- 변경: src/data/characters/terdion.js, src/combat/AttackPreviewService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(175거리·경로0개/폭발 원8개·벽에 막힌 방향 착탄 위치 포함), 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-character.7 — 2026-10-04 스킬 투척 사거리
- 테르디온 RMB 투척 가능 사거리950→500. 기존 AttackSpec.range를 사용해 지정점 제한·발사·미리보기에 함께 적용.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개(컴파일된 RMB range500 포함), 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.8 — 2026-10-04 반격 조준 방향 잔여 미리보기 수정
- 원인: 순차8방향 경로는 숨겼으나 공통 AttackPreviewAreaService의 기본 조준 방향 projectile-impact 미리보기가 먼저 추가되고 있었음. 이전 부분 검사에서 전체 fromAttack 경로 누락.
- 수정: impact-only는 fromAttack에서8방향 착탄 범위만 생성 후 반환해 기본 경로/중앙 착탄 중복과 단일 경로 fallback을 제거. 다른 공격의 미리보기 경로는 유지.
- 변경: src/combat/AttackPreviewService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개에 실제 전체 fromAttack 및 기존 경로 객체 재사용 검사 추가: 정확히 원8개·경로0개·본체 projectile=false/range0. 구조11개·구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-text.2 — 2026-10-04 테르디온 ALWAYS 표기
- 테르디온 tooltipSkills의 항시 항목 key를 ALWAYS로 변경. 표시 문자열만 수정.
- 변경: src/data/characters/terdion.js, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개·구문·배포·문서·ZIP 검사. 실제 브라우저 화면 미검증.

## 3.0.0-character.9 — 2026-10-04 공중 반격 적 충돌 제거
- 원인: trajectory.arc는 시각 궤적이며 반격 delivery.projectile의 기본 비행 피해/적 충돌이 활성 상태였음.
- 수정: 기존 damageOnTravel:false 설정, collisionTargets 미설정으로 ProjectileService의 비행 대상 검사에서 제외. 공중 적을 통과하고 벽/사거리 착탄 후500ms 폭발만 적중. 반격 설명도 사용하지 않는 비행 직격 피해를 제외하고 폭발 피해만 표시. 신규 모듈/전용 분기 없음.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개·구조11개·구문·배포·문서·ZIP. 비행 대상 검사 조건 damageOnTravel=false/collisionTargets!=true 확인. 실제 브라우저/WebRTC 시각 검수 미실시.

## 3.0.0-ui.2 — 2026-10-04 테르디온 색상 변경
- 요청: 테르디온 색상 변경. 기존 황갈색 #c49a68 → 짙은 청록 #238f96 (RGB 35,143,150). 59명 기본 색상과 동일 HEX 없음 확인. 본체·공격 프레젠테이션·폭발·착탄 호의 HEX/RGB 값을 함께 변경.
- 변경: src/data/characters/terdion.js, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온22개, 구문·배포·문서·ZIP 검사. 실제 브라우저 색상 시각 검수 미실시.

## 3.0.0-ui.3 — 2026-10-04 상대 착탄 호 숨김
- 요청: 상대 화면에서 테르디온 투사체 주변 호 게이지 숨김. 평타/스킬/반격 착탄 effect.spawn 3개에 기존 visibility:owner-team 적용. 본인·아군 표시, 적 숨김. 투사체/폭발/피해/500ms 타이밍은 유지. 공통 EffectPresentationVisibilityService 재사용, 신규 모듈 없음.
- 변경: src/data/characters/terdion.js, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 공개 범위 본인/아군/적 실행 검사, 테르디온22개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 화면 미검증.

## 3.0.0-game.3 — 2026-10-04 레테 평타 자원 없는 소환수 유도 제외
- 원인: 평타 delivery의 friendlyRequiresResource는 적중에만 적용되고 homing 후보 선택은 자원을 확인하지 않았음.
- 수정: LMB homing.requiresResource:stamina, 공통 valid에서 최대 자원>0 조건 검사. 아군/적 자원 없는 소환수 제외, 현재 스테미나0인 자원 보유 개체 유지. 같은 valid가 탐색/기존 유도 유지에 사용됨. 적중 및 우편함 수취인/스킬 정책 유지. 신규 모듈/캐릭터 ID 분기 없음.
- 모듈: 기존 delivery.projectile.homing에 requiresResource 선택값 추가. stamina/health 및 resources[name].max를 최대 자원 기준으로 검사하며 미설정 공격에는 적용하지 않음.
- 변경: src/data/characters/lete.js, src/projectiles/ProjectileHomingTargetVisibilityService.js, src/combat/AttackModuleService.js, tools/test-structure.cjs, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 구조12개(실제 컴파일→AttackModuleService.projectile 변환 후 레테 설정·아군/적 maxStamina 누락/0 제외·현재0 허용·기존 대상 자원 제거·미설정 공격 유지), 게임15개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.10 — 2026-10-04 순차 산탄 평타·제거된 폭약 폭발 취소
- 요청: 테르디온 평타 폭약5개 왼쪽부터 순차 산탄,500ms 폭발 전에 방패 등으로 제거되면 폭발 금지.
- 평타: 기존 delivery.delayed-projectile-volley count5/40ms/locked/방향 -30,-15,0,+15,+30도(총60도). 비용200·쿨450ms·폭약당 피해/범위 유지. 설명은 개수 참조·타당 피해로 수정.
- 원인: 착탄 예약 continuation은 source 생존만 확인하고 폭약 제거와 연결되지 않았음. 수정: 기존 projectile.impact에 선택 cancelDelayedOnRemove, source+networkKey별 토큰. discard와 원격 guard 확정으로 폭발 전 제거 토큰 취소, 해당 착탄 호 키 제거. 정상500ms 만료는 예약 유지. stationary 폭약도 방패 접촉 검사. 다른 공격은 옵션 미설정 시 기존 지연 유지. 신규 모듈/캐릭터 ID 분기 없음.
- 변경: src/data/characters/terdion.js, src/projectiles/ProjectileModuleService.js, src/projectiles/ProjectileImpactService.js, src/projectiles/ProjectileService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js.
- 검증: 테르디온25개(실제5발/40ms/각도·실제 guard.remove/discard·평타/스킬/반격 취소·호 제거·다른 폭약 유지·원격guard key취소·만료 프레임 선제 제거 정상 폭발·미설정 공격 유지), 구조12개·게임15개·방17개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-character.11 — 2026-10-04 정상 만료 폭발 누락 수정
- 원인 재현: 착탄 수명은 프레임 now, 폭발 예약은 이후 performance.now() 기준. 만료 시각이0.1ms만 먼저 도달해도 기존 discard가 예약 전 강제 제거로 오인해 폭발 취소. 이전 검사는 두 시각을 동일하게 두어 누락.
- 수정: 공통 ProjectileService.finish/discard의 종료 이유 전달. updateStationary 수명 만료는 expired로 예약 취소 제외. 방패/기타 제거는 removed로 기존 취소 정책 유지. 지연/피해/발사 수치와 신규 모듈 변경 없음.
- 변경: src/projectiles/ProjectileService.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 수정 전 신규 회귀 실패 확인 후 수정 후 통과. 테르디온26개(평타/스킬/반격×0.1/1/8ms 차이×만료/예약 순서2종18조건 포함), 구조12개·게임15개, 구문·배포·문서·ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-balance.2 — 2026-10-04 테르디온 평타 소모량
- 최종 요청250에 따라 LMB cost200→250. 폭약5개 발사1회 기준. 설명 비용은 실제 AttackSpec 참조로250 표시.
- 변경: src/data/characters/terdion.js, tools/test-terdion.cjs, README.md, docs/TERDION.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js.
- 검증: 테르디온26개(cost250 포함), 구문·배포·문서·ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-character.12 — 2026-10-04

- 요청: 테르디온 평타 산탄/스테미나 롤백 및 직격 상향.
- 평타 단발·비용200으로 복원, 판정/표시/호 반경14. 평타·스킬 직격200. 반격은 비행 접촉 없이 착탄 순간200을1회 적용한다. 폭발 수치와 조기 제거/정상 만료 정책은 유지한다.
- 공통 TargetPointProjectileService의 선택형 arrival.triggerOnLanding이 기존 접촉 탐색/피해/회피/방어 경로를 사용한다. 캐릭터 전용 실행 분기는 없다.
- 변경: 테르디온 데이터, 공통 착탄 서비스, 테르디온 회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성 runtime.js.
- 검증: 테르디온27·구조12·게임15·방17, build/docs/check/verify 및 runtime 구문 검사. 실제 브라우저/WebRTC 실기기 전투는 미검증.

## 3.0.0-character.13 — 2026-10-04
- 요청: 테르디온 반격기 투사체 크기14. delivery.projectile.radius10→14, 기존 참조로 무기 표시/착탄 직격 판정/호 반경 동시 반영.
- 변경: 테르디온 데이터, 기존 테르디온 회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개(반격 판정/표시/호 반경14 포함), build/docs/check/verify, runtime 구문 및 ZIP 검사. 실제 브라우저 플레이는 미검증.

## 3.0.0-balance.3 — 2026-10-04
- 요청: 테르디온 평타 탄속30% 증가. delivery.projectile.speed16→20.8.
- 변경: 테르디온 데이터, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개 회귀, build/docs/check/verify, runtime 구문 및 ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-game.4 — 2026-10-04
- 요청: 하츠하츠 우클릭에 원래 없던 초록 이동 경로 선 수정.
- 원인: movement.move의 파생 이동기 태그가 공통 기본 dash-line 표시를 활성화했으나 캐릭터 데이터에 표시 제외가 없었음.
- 수정: 기존 presentation:false 옵션으로 자동 이동 선을 제외. 드래그 점선 미리보기·이동·방어 수치는 유지. 공통 런타임 변경/캐릭터 전용 분기 없음.
- 변경: hatsuhats.js, 기존 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 실제 컴파일한 하츠하츠 이동 모듈을 공통 start에 적용해 이동 성공/선0개 확인, 구조12·게임15 회귀, build/docs/check/verify, 구문/ZIP 검사. 실제 브라우저/WebRTC 미검증.

## 3.0.0-game.5 — 2026-10-04
- 요청: 시아넬리 착탄 투사체 미표시. 기본 linger.fadeOut 알파 감소를3종 비도에서 제외해4초 동안 본체 표시 유지.
- 수정: xianelli 평타/counterDagger/shunpoDagger의 fadeOut:false. 공통 로컬/원격 잔류 해석에 동일 적용. 호 게이지·회수·수명 수치는 유지.
- 변경: xianelli.js, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 실제3종 데이터 컴파일·4초/비영구 수명·만료1ms 전 로컬/원격 공통 visual 알파1, 기존 구조/테르디온 회귀, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-game.6 — 2026-10-04
- 정정: game.5의 알파 변경은 상대 미표시 문제의 원인을 해결하지 않았음. xianelli fadeOut 설정 롤백.
- 공통 수정: networkSync 잔류 비도는 비소유 화면의 sourcePickupReady를 차단. 착탄 snapshot 복원은 예측 returning.phase를 outbound로 돌려 stationary 분기를 유지. 상대 위치 지연에 따른 자체 회수/귀환 제거를 방지.
- 변경: TargetPointProjectileService, StationaryProjectileInteractionService, xianelli 데이터 롤백, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증:3종 실제 데이터의 원격 회수 금지/소유 회수 유지/예측 귀환→착탄 복원; 구조13·테르디온27·게임15 회귀, build/docs/check/verify·구문·ZIP 검사. 실제 두 기기 WebRTC는 미검증.

## 3.0.0-balance.4 — 2026-10-04
- 테르디온 평타/반격 직격200→150. 스킬 직격200 유지. 반격 최대 투척175→350,8방향 폭발 미리보기/착탄 사거리 공통 참조.
- 변경: 테르디온 데이터·회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온27개(직격150/착탄1회/8방향 사거리350), build/docs/check/verify·runtime 구문·ZIP 검사. 실제 브라우저 플레이 미검증.

## 3.0.0-character.14 — 2026-10-04
- 요청: 테르디온 반격 착탄 거리를 마우스 위치로 조절. 최대350,8방향은 동일 선택 거리. 선딜 동안 조준 갱신 후 발사 시작 시 거리 확정.
- 공통 volleyTravelRange + delayed-projectile-volley.distanceMode:target-point, 기존 Counter aim-point 사용. 실행/미리보기에 같은 거리 해석. 캐릭터 전용 분기 없음.
- 변경: AttackModuleService, AttackPreviewService, 테르디온 데이터/회귀, README, TERDION 문서, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온28개(0/100/350/초과600 실제8발·미리보기 일치), 구조13, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-ui.2 — 2026-10-04
- 요청: 무기 투사체 중앙+ 크기를 절대값이 아닌 비율로 통일, 밝은 본인 캐릭터 색으로 통일.
- 공통 anchor-cross 렌더에서 반길이=반경*0.5, 선 굵기=반경/6(최소0.5), 궤적scale 동시 적용. 색은 source.character.color 우선, ColorService.brighten 기본35% 사용. numbered 표시는 기존 유지.
- 변경: Training.js, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 테르디온28·구조13 회귀, build/docs/check/verify·runtime 구문·ZIP 검사. 실제 브라우저 시각 검수는 미실행.

## 3.0.0-game.7 — 2026-10-04
- 요청: 분할 전 원본에서 선 없던 이동기들의 이동 선 제거. 원본 movement state.tags(명시값만 사용) 및 이동 선 조건과 전체58명 데이터 대조.
- 대상11개: 슈비.attacks.rmb.modules.2, 슈비.attacks.counter.modules.2, 루뷰.attacks.rmb.modules.1.autoArrivalMovement, 루뷰.abilities.rmb.trigger.modules.0.movement, 메인마드.attacks.rmb.modules.0, 리안.attacks.rmb.modules.0, 타우.attacks.rmb.modules.5, 타우.attacks.rmb.modules.7, 헤르쟝.attacks.lmb.modules.1, 헤르쟝.attacks.counter.modules.3, 레비나.attacks.counter.modules.2; 하츠하츠 기존 제외 유지.
- 각 모듈 presentation:false 명시. 원본에 presentation 정의가 있어도 이동기 태그가 없으면 실행되지 않던 루뷰/타우도 포함. 신규 태그 파생 및 게임 효과는 유지.
- 변경: 대상7개 캐릭터 데이터, 구조 회귀, README, project.json, DIVIDE TASKS, 생성runtime.js.
- 검증: 구조14개(대상11개+하츠하츠), 게임15·테르디온28, build/docs/check/verify·구문·ZIP. 실제 브라우저/WebRTC 미검증.

## 3.0.0-remake.1 — 2026-10-04
- 요청: 반 CC/재생, 가에 명령/정상 스테미나/스킬/고정 반격 리메이크, 레테 비용/체리티 탄속. 추가 답변에 따라 명령 윗줄 KNOCKBACK/ACCELERATE/FIX/ELECTRIC.
- 변경: van/gae/lete/cherity 데이터, CommandFeatureService 과열/냉각 제거 및 기본 모드/FIX 원격 표시, AttackFeatureTransformService 데이터 기반 적중 옵션/레이저 팔레트/평타1.4배, CharacterCommandInputService 자동완성 실행/정렬/FIX 글로우, AbilityModuleService 사용 안 하는 냉각 핸들러 제거, 구조 회귀, 신규 가에 회귀, README/GAE REMAKE 문서, project.json/DIVIDE TASKS/생성runtime.js.
- 세부 수치는 docs/GAE REMAKE.md. 미지정 스킬 피해150/넉백160/소모200 선택, 기존 범위190/쿨700 유지. 반격 기존 피해/무력화 넉백은 유지하고 무적/자기 기절2초로 고정.
- 검증: 가에7개 그룹·구조14·테르디온28·게임15·방17, build/docs/check/verify·runtime 구문·ZIP. 실제 브라우저/WebRTC 미검증.
- Ctrl+W는 일반 탭의 브라우저 예약 단축키이므로 차단을 보장할 수 없다. 전체화면/권한이 필요한 Keyboard Lock을 현재 일반 탭 실행에 무조건 적용하거나 가짜 preventDefault 차단을 넣지 않음.

## 3.0.0-remake.2 — 2026-10-05

요청/이유: 반 스킬 소모200, 가에 FIX 글로우 제거, ELECTRIC 고정 주황색, 우클릭 선딜 복구, 설명 정렬. 공격 전 timing.delay에 공격 실행 후 ID를 요구하는 조건이 붙어 지연이 건너뛰어졌다. 해당 조건을 제거하고 기존 preview.create로500ms 선딜 표시와 쿨다운 검사를 연결했다. 공통 레이저 변환은 데이터 electricColor를 사용하며 투사체 전체 층과 INSTANT 코어도 같은 주황색이다. FIX의1초 녹색 표시와 회복은 유지한다. 신규 캐릭터 전용 실행 모듈은 추가하지 않았다.

대상: src/data/characters/gae.js, van.js, src/input/CharacterCommandInputService.js, src/combat/AttackFeatureTransformService.js, tools/test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, runtime.js. 기존 심볼 유지; 파일 역할 메타데이터 갱신.

검증: 가에9개·구조14개·테르디온28개·게임15개·방17개 모두 통과. 실제 AbilityModuleService/SimulationScheduleService로499ms 미발동/500ms 발동과 쿨다운 차단 확인. build/docs/check/verify 및 runtime 구문 검사 실행. 실제 브라우저 표시·두 기기 WebRTC 전투는 미검증.

## 3.0.0-tools.1 — 2026-10-05

요청/원인: START.bat 실행 시 graphify-out 분석 결과·캐시의 역할 등록 누락으로 서버 시작이 중단됨. tools/project.py inventory에서 루트 graphify-out 하위 생성물만 제외한다. 기존 미등록 파일 및 등록 소스 누락 검사는 유지한다. 분석 파일은 보존한다.
대상: tools/project.py, README.md, project.json, DIVIDE TASKS.md, PATCH LOG.md. 기존 심볼 유지.
검증: 실제 분석 생성물 포함 inventory 통과; 임시 프로젝트에서 새 버전 중첩 분석 캐시 제외, 미등록 JS 및 등록 소스 누락 거부 확인. START가 실행하는 tools/serve.py 서버 시작 및 HTML/runtime HTTP200·조립 소스 일치 확인. docs/check/verify 검사. 배치 창 수동 조작은 미검증.

## 3.0.0-remake.3 — 2026-10-05

요청: 가에 FIX 회복량을 잃은체력25%로 변경. fixMissingHealthRatio=0.25와 기존 ResourceRestoreEffectService의 missingResourceRatio를 연결한다. 설명도 동일 데이터 비율을 참조한다. 예: 최대1300/현재100이면300 회복하여400. 최대체력에서는0 회복.
대상: src/data/characters/gae.js, src/core/CommandFeatureService.js, tools/test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 가에9개 및 구조14개 통과; 현재100/1000/1300에서 각300/75/0 회복 및 원격 중복 회복 없음. build·runtime 구문·docs/check/verify 검사. 실제 브라우저 및 두 기기 전투는 미검증.

## 3.0.0-game.8 — 2026-10-05

요청/원인: 첨부 Duels(1).zip 기준 엘린 스킬 홀드가 낮은 스테미나에서 막힘. 공통 차징 최소비용의 || fallback이 명시0을 무시하고 소환 비용750으로 대체해 PointerHoldInputService.press가 홀드를 취소하고 탭 입력으로 전환했다. 시작·릴리스·지속 비용 해석에서 nullish fallback으로 명시0을 보존한다. 모드 전환150 및 소환750 데이터는 유지. 신규 모듈/캐릭터 예외 없음.
대상: src/abilities/ChargedAttackService.js, tools/test-structure.cjs, README.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 기존 심볼 유지·역할 설명 갱신.
검증: 구조15개(실제 차징 start:0/149/150/200/749/750, 포인터 press:150/200/749, 비용 생략750 및 명시100 제한), 기존 회귀·build/docs/check/verify·구문 검사. 실제 브라우저/두 기기 전투 미검증.

## 3.0.0-game.9 — 2026-10-05

요청: 반 정상 스패너 회복25/초, 파괴 후6회 타격으로 완전 복구. 기준은 직전 엘린 수정본(첨부 Duels(1).zip 파생). van 데이터에 기존 damage-dealt Trigger/state.progress 조합 추가. 공통 ProgressStateService 수리 정책에 repairMode:hit-count/requiredHits를 추가해 시간 누적 대신 적중 누적을 해석한다. 일반 시간형 수리는 기존 경로 유지. 파괴 시 직접 피해 확정 적중만 집계하고, 기존 ProgressHitTargetPolicy에 따라 소환수/훈련봇 및 DOT 제외. 6회복구 시800·횟수0, 대기/이동 중 누적 유지. 기존 FX/진행도 온라인 복제 재사용, 캐릭터 전용 서비스/새 모듈 없음.
대상: van.js, ProgressStateService.js, test-structure.cjs, test-gae.cjs, README, GAE REMAKE, project.json, DIVIDE TASKS, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 구조16개(시간 복구 없음·초당25·실제 Trigger/모듈6회·5회 누적·DOT/소환수 제외·복구 후 초기화), 가에9개, 게임15개, 테르디온28개, build/docs/check/verify·구문 검사. 실제 브라우저·다기기 전투는 미검증.

## 3.0.0-balance.2 — 2026-10-05
요청: 반 정상 스패너 회복15/초, 파괴 후 복구 타격5회. van 단일 원본 수치를 수정해 실제 재생·복구·호 게이지·툴팁 참조가 함께 변경된다. 기존 대상/적중/초기화 정책 유지.
대상: van.js, test-structure.cjs, test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할 갱신.
검증: 구조16개·가에9개, build/docs/check/verify·runtime 구문.4회 누적 유지/5회 완전복구·초당15 확인. 실제 온라인 전투는 미검증.

## 3.0.0-game.10 — 2026-10-05
요청: 반 내구도가 방어 판정으로 적중 효과를 무시하지 않도록 변경, 정상 스패너 회복25/초. 기존 damageResourceLayers.blockHitEffectsWhenFullyAbsorbed:false로 내구도에 피해를 전부 받아도 DamagePipeline의 정상 applied/hit 및 onHit/네트워크 확정 경로를 사용한다. 내구도 우선 피해·초과분 본체 피해·파괴 후5회복구 유지. 설명에서 방어 문구 제거. 새 모듈/전용 실행 코드 없음.
대상: van.js, test-structure.cjs, test-gae.cjs, README.md, docs/GAE REMAKE.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할 갱신.
검증: 구조17개(실제 DamageResourceLayerService로 투사체/근접/장판 완전흡수 시 적중차단false 및 초과피해50 확인·재생25·5회복구), 가에9개, build/docs/check/verify·runtime 구문. 실제 두 기기 전투는 미검증.

## 3.0.0-game.11 — 2026-10-05
원인: 이전 패치는 완전흡수 시 적중차단만 제거했다. 레이카 damage-dealt Trigger는 healthDamage를 읽는데 DamagePipeline은 내구도 피해를 여전히 해당 집계에서 제외하고 온라인 notify도 amount0을 전송했다.
변경: van 선행자원에 countsAsHealthDamage:true, 공통 DamageResourceLayerService가 해당 피해를 healthDamage로 반환하고 DamagePipeline에서 실제 본체 피해와 합산한다. 기존 레이카 데이터·Trigger 및 duel-hit-confirmed 형식 그대로 재사용. 본체 체력은 초과 피해만 감소하며 일반 방어/쉴드 정책은 유지. 초당25·파괴후5회복구 유지.
대상: van.js, DamageResourceLayerService.js, DamagePipeline.js, test-terdion.cjs, README, project.json, DIVIDE TASKS, runtime.js. 기존 심볼 유지·역할 갱신.
검증: 전투29개(실제 내구도100/혼합50+50/본체100 각각 레이카 가호+6, 본체체력 보존·온라인 notify amount100), 구조17개 및 build/docs/check/verify·구문. 실제 두 기기 전투 미검증.

## 3.0.0-game.12 — 2026-10-05
요청: 지오핀(천재 발명가) 추가. 체력1100/느림/고유 노랑, 세 기어27조합,300ms 반격 및 다음3회 연사40% 강화. 미지정 기본값: 평타150/200/600ms, 광선300·탄850·추진220, 반격300/반경200. 상세는 docs/GEOPIN.md.
구조: 순수 geopin 데이터에 기존 모드·평타·이동·CC·패시브·횟수 버프 조합. 공통 mode-modules 변환, modifier.limited-use 어댑터, 기어 렌더만 추가. 공통 입력에서 탭/홀드/스크롤을 처리하고 기존 네트워크 패킷에 모드/횟수 스냅샷을 포함한다. 발사 조합 고정·후속 폭발 적중 집합 공유. 공유 attackDelay에도 공격속도 적용, 가에 변환 멱등화. 투사체 범위 끝 정렬 및 형상별 FX 대체로 폭발 위치·표시를 보존한다.
대상: geopin.js, characters/index.json, CHARACTER_RULES, CharacterDataService, CharacterSortService, ModeStateService, AttackFeatureTransformService, AugmentService, AbilityModuleService, LimitedUseBuffService, AbilityService, Training, PointerHoldInputService, initialization-417, OnlineDuelService, AttackExecutionService, AttackService, TriggeredAttackService, MovementAbilityService, ProjectileImpactService, ProjectileModuleService, ProjectileService, TargetPointProjectileService, AreaGeometryService, TrainingPresentationBindings, EffectSpawnService, ModeGearPresentationService, TrainingWorldDrawService, tools/test-geopin.cjs, 기존 카탈로그 검사3파일, README, CHARACTER CONTRACT, GEOPIN, project.json, DIVIDE TASKS, 생성runtime.js. 역할·심볼 목록 갱신.
검증: 지오핀19그룹/27조합 및 기존 구조17·가에9·테르디온29·게임15·방17, build·구문·docs/check/verify. 실제 브라우저/두 기기 온라인 전투 미검증.

## 3.0.0-ui.3 — 2026-10-05
요청: 지오핀 확실한 노랑, 큰 기어3개 전부 맞물림, 왼쪽2/오른쪽1 배치, 새 디자인, 기어 글자 제거.
변경: #d8e21b→#ffdc24 및 탄환 밝은 층·강화 게이지 노랑 통일. 반경22→36(약64% 확대), 삼각 배치와 중심 거리64.8/치형 위상으로 세 쌍 모두 접촉. 이중 림·세 살·육각 축과 밝은 선택점, caption/labels 및 텍스트 렌더 제거. 삼각 외접 기어 폐회로의 회전 충돌을 피하기 위해 stationaryRim 옵션으로 맞물림을 유지하며 내부 선택판은 기존 동기화 시간축으로 회전한다. effect.spawn·관계 투명도·사망 정리·전투 수치 유지, 신규 모듈 없음. 치형 루프 임시 배열 제거·색상 변환 캐시로 고빈도 할당 감소.
대상: src/data/characters/geopin.js, src/render/ModeGearPresentationService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 변경 역할 설명 갱신.
검증: 지오핀20그룹/27조합(문자 없음·36반경·2/1배치·모든 기어 쌍 접촉·색상 중복 없음·관계40%·수명·타임라인), 구조17그룹, 실제 Canvas 렌더로 본인/적 배치·색상 확인, build/구문/docs/check/verify. 실제 브라우저·두 기기 온라인 전투 미검증.

## 3.0.0-game.13 — 2026-10-05
요청: 지오핀 기어 자체 회전, 일반 직사각 히트스캔/원형 투사체/기존 점프, 조작한 기어만 일시 선명, 적중·비관통 끝점의 일반 원형 폭발, 상시 조준 미리보기, 반 스패너 리디자인.
변경: 고정 림 제거·모드별 독립450ms 회전. 평상시35%→조작 기어만500ms100%→400ms 복귀(적 관계40% 곱). ModeState의 명시적 hasChanged 및0시각 보존으로 미사용 기어가 원격에서 번쩍이지 않으며 반복 패킷도 시각을 재시작하지 않는다. 광선 커스텀beamLine/탄laser-bolt/폭발bombBlast 제거, 기존 rect/기본projectile/areaCircle 사용. 추진은 에즈레일 궤적과360ms 공통 점프 정책 재사용(기존 거리220·출발피해120 유지). 투사체 target 적중도 폭발; 광선 후속 원은 첫 적/벽/최대거리 중 비관통 종료점에서 생성하고 적중 집합 공유로 중첩 방지. 조준 미리보기는 현재 Ability 해석과 기존 AttackPreview 경로로27조합을 상시 표시, 단발 탄 경로 및 후속 폭발 원도 지원한다. 반 스패너는 열린 육각 턱·끝 구멍·손잡이 홈의 단일 도형, 약한 광택으로 변경하며 전투 판정 불변. 신규 모듈 없음.
대상: geopin.js, ModeGearPresentationService.js, ModeStateService.js, HitScanGeometryService.js, AreaGeometryService.js, AreaAttackService.js, AttackPreviewService.js, Training.js, WrenchShapeRenderService.js, VanWrenchDurabilityPresentationService.js, test-geopin.cjs, README, GEOPIN, CHARACTER CONTRACT, project.json, DIVIDE TASKS, 생성runtime.js. 책임·선언 갱신.
검증: 지오핀24그룹/27조합, 구조17·가에9·테르디온29·게임15·방17, 실제Canvas로 반투명/조작기어 회전·밝기/스패너 모양 확인, build/구문/docs/check/verify. 실제 브라우저 및 두 기기 온라인 전투 미검증.

## 3.0.0-game.14 — 2026-10-05
요청: 시아넬리 착탄 비도가 상대 화면에서 여전히 보이지 않음.
원인/변경: 기존 검사는 상태 복원만 확인했다. StationaryProjectileInteractionService.restoreNetworkProjectile은 원격 sentAt과 로컬 Date.now의 원시 차이를 남은4초 수명에서 차감해 컴퓨터 시계 차이만으로 복원 즉시 discard할 수 있었다. OnlineDuelService의 기존 networkDelayMs 기준선 보정 지연을 동일 착탄 스냅샷 복원에 전달하도록 수정. 별도 시계 시스템/캐릭터 예외 없음. 함께 null 고정좌표·거리를 Number(null)=0으로 대입하는 원격 복원/정지 update 경로를 수정해 착탄 위치와 travel을 보존한다.
대상: StationaryProjectileInteractionService.js, OnlineDuelService.js, ProjectileStateService.js, ProjectileService.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js. 역할 갱신.
검증: 실제 networkDelayMs·세 비도 평타/반격/순보·시계차±60초·보정 지연20ms·복원 후 실제 updateStationary 및 표시 위치/alpha·null 좌표 거리 보존. 구조18·지오핀24·가에9·테르디온29·게임15·방17 및 build/구문/docs/check/verify. 실제 두 기기 WebRTC 전투는 미검증이다.

## 3.0.0-game.15 — 2026-10-05
요청: 같은 방향으로 이동하는 적에게 라임 평타/레이카 반격 피해가 간헐적으로 누락됨.
원인: movement의 발동 순간 presentationDistance가 당시 적의 정지 위치로 잘려 있었고, 원격 EffectSpec 피해 timeline이 그 길이를 전체 이동 duration 동안 진행했다. 실제 소유자 돌진은 매 프레임 움직인 적의 위치로 검사하지만 상대 권위 화면의 경로는 짧고 느리게 고정돼 접촉하지 않을 수 있었다. 기존 길이 경로로 돌린 회귀 검사에서 라임 moving-away 피해0회 재현.
수정: AttackModuleService가 전체 movement.distance와 duration·collision·enemyCollisionOvershoot를 기존 EffectSpec에 보존. EffectSpawnService는 각 원격 진행 구간에서 기존 MovementAbilityService.travelWithEnemyOvershoot를 재사용해 현재 적/벽/장판 충돌을 처리하고 실제 허용 끝점에서 피해/경로 표시를 함께 종료. 정지 후 전체 사거리로 재진행 금지, 대상별1회/상대운동 접촉/AttackHitTriggerService→onHit 경로 유지. CollisionPolicyService 적 몸통 충돌도 피해와 같은 최신 NetworkCollisionPositionService 위치 사용. 프레임별 충돌 앵커/상태 객체는 timeline에 재사용. 신규 모듈·캐릭터 예외·밸런스 변경 없음.
대상: src/combat/AttackModuleService.js, src/render/EffectSpawnService.js, src/core/CollisionPolicyService.js, tools/test-movement-contact.cjs, README.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/선언 갱신.
검증: 실제 lime.lmb/reika.counter/reika.counterBlessed 데이터→실제 spawnAttackEffect→원격 복원→매 프레임 applyMovementTrackedDamage19개(동일 방향 이동·1회 적중·정지 적 접촉·첫 적 뒤 경로 중단·빠른 도주/범위 밖 미적중·최신 충돌 좌표). 기존 구조18/지오핀24/가에9/테르디온29/게임15/방17, build/구문/docs/check/verify 및 배포 ZIP 모든 원본 일치/CRC. 실제 두 기기 WebRTC 전투는 미검증.

## 3.0.0-game.16 — 2026-10-05
요청: 지오핀을 파일에서 제거.
변경: 지오핀 캐릭터 데이터·출시 등록·이동 표기·전용 문서/회귀 파일 삭제, 현재 공식 캐릭터59명으로 카탈로그 검사/안내 갱신. 기존 공통 기어/모드/무기 모듈과 반 스패너 리디자인은 유지. 이전 PATCH LOG 이력 보존. runtime 재생성으로 선택/랜덤/훈련장/라운드 후보에서 제외.
대상: characters/index.json, CHARACTER_RULES.js, geopin.js(삭제), GEOPIN.md(삭제), test-geopin.cjs(삭제), test-structure.cjs, test-terdion.cjs, verify.py, README, CHARACTER CONTRACT, project.json, DIVIDE TASKS, 생성runtime.js.
검증:59명 등록·컴파일, 배포 runtime에 지오핀 데이터 없음, 나머지 구조/전투/이동/방 회귀·build·구문·docs/check/verify·ZIP 무결성. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.17 — 2026-10-05
요청/확정: 티냐 반격은 마지막 발동 마법진 기준. 설명과 미리보기 불일치 수정.
변경: 티냐 설명을 마지막 발동 배치 재사용/기록 없으면 최소 원으로 교정. CircleFormationService.drawCounterPreview가 현재 설치 배치를 사용하던 defaultCounterFormation 대신 반격의 formation.manifest 데이터와 실제 resolveModuleCircles를 공유. pendingManifest는 source:pending 평타만 소비하도록 제한해 반격/미리보기에서 예약 평타를 잘못 사용하는 경로 제거. 새 모듈/캐릭터 예외 없음.
대상: tinya.js, CircleFormationService.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증: 실제 마지막 배치와 미리보기 geometry 일치·현재 설치 배치 불일치·조준 이동·최소 원 fallback·예약 평타 비소비/평타 소비. 구조19·가에9·테르디온29·게임15·방17·이동19 및 build/구문/docs/check/verify·ZIP 원본 일치/CRC. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.18 — 2026-10-05
요청: 카논 스킬셋의 이동 회피 관련 능력 제거.
범위: MOVING SPACE 연계 반동 펀치/파고들기 및 반동 후속 타격 삭제. 제자리 회피 연계와 기본3종/공통 회피 유지.
변경: lmbMoving/lmbMovingHit/rmbMoving AttackSpec, 해당 Ability alternates/지연/후속 Trigger, 이동 회피 상태/게이지 구간/설명 제거. movingStateKey 빈 문자열로 기존 DodgeFollowupStateService가 이동 회피에 보너스 상태를 만들지 않도록 설정. 공통 서비스 변경/신규 모듈 없음.
대상: kanon.js, test-structure.cjs, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증:59명 컴파일·삭제 공격 참조 없음·이동 회피 상태 미생성·제자리 회피 상태 생성·기본 수치 유지, 구조20·가에9·테르디온29·게임15·방17·이동19, build/구문/docs/check/verify·ZIP 원본 일치/CRC. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.19 — 2026-10-05
요청: 카논 칸 게이지를 남은 시간 감소형 호로 교체, 설명 변경, 스킬 기절0.6초 통일.
변경: 기존 gauge.arc + timed-action-remaining이 kanon-dodge-stopped의2000ms 실제 수명을 읽는다. 만료/소비 시 숨김. 기존 segmented 제거. desc 요청 문구 반영. rmb/rmbStopped status.apply stun600ms, 설명은 기존 stunSeconds 참조. 공통 서비스/신규 모듈 없음.
대상: kanon.js, README, project.json, DIVIDE TASKS, 생성runtime.js.
검증: 기존 회귀 전체·호 시간비율/만료/상태 소비 확인·build/구문/docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-game.20 — 2026-10-05
요청: 카논 호게이지 색상 교정.
원인/수정: 이전 칸 게이지 연분홍#ff8a7a를 유지한 값을 제거하고 color/completeColor 모두 characterValue("color")로 본래#c94141 참조. 100%일 때 공통 completeAccent가 자동 밝게 만들던 색도 동일 원본으로 지정. 새 모듈 없음.
대상: kanon.js, README, project.json 역할/버전/해시, DIVIDE TASKS, 생성runtime.js.
검증: 실제 컴파일된 호의 일반/완료 색 동일·구문·구조 회귀20개·docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저 표시 미검증.

## 3.0.0-game.21 — 2026-10-05
요청: 카논 제자리 회피 인식 보정 복구.
원인: game.18에서 이동 연계를 지우면서 movingStateKey를 비워 observeMovement의 회피 중 키 해제 보정까지 비활성화.
수정: 기존 kanon-dodge-moving 상태키를 내부 회피 입력 판정 기록으로 복구. 기존 DodgeFollowupStateService가 회피 중 이동키 해제 시 기록을 소비하고 제자리 연계2000ms를 생성한다. 반동 펀치/파고들기 및 이동 연계 Ability/게이지는 제거된 상태 유지. 공통 서비스 변경/신규 모듈 없음.
대상: kanon.js, test-structure.cjs, README, project.json 역할/버전/해시, DIVIDE TASKS, 생성runtime.js.
검증: 실제 공통 begin/observeMovement/state.consume·키 유지/해제·130ms 종료 경계·강제 이동 없음·연속 갱신 방지·소비 후 재생성 방지·호50%·색상·스킬600ms·구조21개 및 build/구문/docs/check/verify·ZIP CRC/소스 일치. 실제 브라우저/두 기기 온라인 미검증.

## 3.0.0-character.15 — 2026-10-06
요청: 새 지오핀/천재 발명가/체력1100/매우빠름/고유노랑/8조건 발명·기어1개·자신만8호. 방어 차단은 적 방어, 급접근은 상대 이동/끌어당김으로 확정. 미지정 수치는 기존 캐릭터를 기준으로 선택하도록 승인됨.
변경: 순수 geopin 데이터(실제 ID geopin)와 공통 ReactiveEquipmentService;3회 발견/자동 장착·우선순위·기본 복귀·공통 반격 즉시 발견. 기존 공격/진행도/모드/이동/호 렌더를 재사용. 범용 projectile.redirect/wall-relay와 사건 기반 온라인 Sync 어댑터 추가. 벽 전달 검사에서 AreaAttackService 네모 벽 절단/연출이 원래 캐릭터 좌표를 읽던 문제를 실제 geometryOrigin으로 통일; 수직 오프셋 중복 표시 방지. 기어350ms1바퀴,8개 개인 호의 활동 강조/활성 고정.
대상: geopin.js/index/CHARACTER_RULES, ReactiveEquipmentService, ProjectileRedirectService/Sync, EquipmentGaugePresentationService, AbilityModuleService/AttackModuleService, CCService/InstalledAreaFieldService/AttackGuardService/OnlineDuelService/ProjectileService/Training/ModeGearPresentationService/WorldGaugeModuleService/TagService/AreaAttackService/TrainingPresentationBindings, initialization-equipment, test-geopin/structure/terdion/verify, CHARACTER CONTRACT/GEOPIN/README/project.json/DIVIDE TASKS/생성runtime.
새 모듈 이유·수치·조합 책임: docs/GEOPIN.md에 기록. Trigger 사용 가능 목록 갱신. 향후 유저 캐릭터 제작 UI는 추가하지 않음.
검증: 지오핀18·구조22·가에9·테르디온29·게임15·방17·이동19 및 build/구문/docs/check/verify·ZIP 소스 일치/CRC 검사. 제어된 VM 검사이며 실제 브라우저/두 기기 WebRTC는 미검증.

## 3.0.0-character.16 — 2026-10-06
요청: 지오핀14항목·튀길 때 증가 대상은 사거리로 확정.
변경: 큰42/16톱니 기어·6살/볼트·회전 중 불투명/페이드, 개인 큰11호3/3/2·활성 밝은색/점 제거·150/현재 평타 사거리 점선. 디버깅9종 발명품 활성화는 기존 공통 명령 권위/복제로 구현. 기본 고무탄500, 지오핀 모든 투사체 확대14/정밀11/폭발17. 모든 고무탄 벽 반사/적 없을 때 정반사. 최초 사거리80/60/40/20% 추가·벽/적 통합 횟수·사거리 절대 감소 없음·4회 이후 증가0. 벽 접촉 후 실제 이동2를 travel에 포함해0거리 반복 종료. 벽 전달도 각 반사에 대응. 마지막 조건의 기록을 진행도와 분리하고1초 만료를 제거. JustDodge 원인(source/attack/impact)을 기존 사건으로 전달해 회피 조건도 기록. 이후 장판 피격 시 마지막 조건 교체. 반 스패너 톱니 헤드/이중림/볼트 리디자인, 전투 수치 유지.
대상: geopin.js, ReactiveEquipmentService, JustDodgeService/DamagePipeline/AreaAttackService/initialization-equipment, ProjectileRedirectService/Sync, EquipmentGaugePresentationService/WorldGaugeModuleService/ModeGearPresentationService/WrenchShapeRenderService, DebugPanel/OnlineDebugControlSyncService, test-geopin, README/GEOPIN/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime.
모듈: 기존 projectile.redirect 파라미터/원격snapshot 확장·기존 ArcGauge 및 Debug 명령 재사용. range.equipment-thresholds는 개인 조건 경계 표시, 저회 원인 분류는 기존 equipment.situation Trigger 사용. 캐릭터 이름 분기 없음.
검증: 지오핀27·구조22·가에9·테르디온29·게임15·방17·이동19, build/구문/docs/check/verify 및 ZIP CRC/소스 일치. 실제 브라우저/두 기기 WebRTC 미검증.

## 3.0.0-character.17 — 2026-10-06
요청: 지오핀13항목·무적/저회 누적·고속/벽 앞 접촉·폭발 직격·기본 RMB 차단·샤베트 주먹·기본 사거리 이상 정밀 조건·이음새 반사·비접촉 적 재조준·페이즈 점프·고각도 벽 전달·파비 즉시 레이저·폭발 넉백 제거·고회전 레이저 이름.
원인/변경: rememberOnly를 제거하여 저회도 진행도 누적, 공통 damage-avoided 사건으로 피해 무적과 점프 비타격 무적 시도도 누적. 정밀 기준은 farAttackId의 기본 사거리500 이상. 폭발탄의 damageOnTravel/collisionTargets 비활성 제거·직격100/폭발200·넉백 제거. 기본 RMB state.mode-is invert 조건으로 차단. 주먹은 기존 progressRect progressive-rect200/반폭50/3000/220ms·넉백180, 점프는 기존 페이즈 trajectory55/0.55·180/280ms·비타격 무적, 레이저는 파비 instant-laser/beamLine750/반폭14/150/72ms·벽 차단.
공통 충돌: 벽 처리/prev 초기화가 대상 swept 판정 전에 경로를 소비하던 순서를 실제 도달 가능한 벽 앞 구간 접촉 우선으로 교정. 첫 접촉 위치/현재 방향으로 피해 및 후속효과 실행·대상 등록 순서 제거. 반사 법선은 실제 확대 충돌체 진입면, 법선 이탈로 이음새 반복 방지. 벽 전달의 반경만큼 조준 전진한 점 대신 접촉 블록 내부/연속 벽 출구를 계산하여 고각도 누락 제거. 사거리 끝에서도 가시 적 재조준, 기존80/60/40/20% 증가 횟수 공유·4회 이후 종점 종료. 후보 배열/비교함수/마름모probe 재사용. 신규 gameplay 모듈·캐릭터 예외 없음.
대상: geopin.js, TriggerConditionService, ReactiveEquipmentService, EquipmentGaugePresentationService, DamagePipeline, initialization-equipment, ProjectileService, ProjectileCollisionShapeService, ProjectileRedirectService, test-geopin, README/GEOPIN/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime. 역할/선언·Trigger 목록 갱신. 상세 모듈 파라미터/재사용 이유는 docs/GEOPIN.md.
검증: 지오핀38·구조22·가에9·테르디온29·게임15·방17·이동19(총149), 실제 고속 updateOutbound/벽 앞 적중·뒤 적 미적중/등록 순서/이음새 다음 프레임 이동/각도별 전달/무적3회/저회 누적/비타격 무적 접촉1회/폭발 직격/반사 후execution 방향·build/구문/docs/check/verify·ZIP 무결성. 실제 브라우저·두 기기 온라인 미검증.

## 3.0.0-character.18 — 2026-10-05
요청: 반 스패너 재디자인·같은 컴퓨터 다중 참가·지오핀 종점 가짜 반사/벽 정지 수정·점프/탄속/주먹 가속·무기별 반사 사거리 증가·가시 적 재조준·레이저500.
원인/변경: character.17에서 잘못 해석해 추가한 사거리 끝 range 재조준 이벤트/함수/호출을 삭제했다. 벽 반경 안 시작 시 기존2px 보정으로246↔248 재충돌하는 실패를 실제 updateOutbound에서 재현하고 확대 벽들의 겹침 깊이 이탈로 수정. 매 프레임 추가 배열 없음. 실제 벽 반사 가시 적 탐색은 searchRadius0(무제한), 전이 적중 연쇄도 무제한 가시 적 탐색·최대2회 유지. 증가량은 발사한 준비된 무기 사거리의80/60/40/20%이며 이후 장착 변경과 독립적임을 무기6종 검사.
수치: 고무탄 속력25% 증가(기본/충격30·전이32.5·과반동52.5·정밀60·폭발27.5), 추진180/200ms(기존280), 주먹4500(기존3000), 레이저 판정/표시500. 공통 delivery.projectile/movement.move/trajectory.arc/effect.spawn 재사용. 스패너는 양쪽 열린 턱·각진 어깨·홈 손잡이로 변경, 캔버스 실제/확대 크기 검수.
방: sessionStorage는 복제 탭에서 복사되어 중복 세션으로 거절될 수 있었다. 접속 키를 페이지 수명 고유값으로 변경하여 다른 창은 같은 기기/계정에서도 독립 PID 참가. 같은 페이지 재연결/승계 키 유지, 정원4·게임 중 관전자·동일 계정/기기 레코드 제외 유지.
대상: geopin.js, ProjectileRedirectService, ProjectileService, TagService, RoomIdentityService, WrenchShapeRenderService, test-geopin, test-room-connection, README/GEOPIN/ROOM CONNECTION/CHARACTER CONTRACT/project.json/DIVIDE TASKS/생성runtime. 역할/선언/문서 최신화. 새 gameplay 모듈/캐릭터 이름 예외 없음. TagService는 searchRadius0 무제한 탐색도 실제 redirect 모듈에서 유도 태그를 파생하도록 수정.
검증: 지오핀43·구조22·가에9·테르디온29·게임15·방19·이동19(총156그룹). 벽 내부 시작 실패 후 수정 성공·가로/세로 이음새/각도30조건·사거리 끝 정상 제거·범위 밖 가시 적 조준·벽 뒤 제외·6무기 증가/속력·복제 탭 실제 identity/3인 승인·기존 승계/전투 회귀. build/구문/docs/check/verify 및 ZIP CRC/전체 소스 일치 검사.
미검증: 실제 브라우저 다중 탭/창·두 기기 WebRTC/실전. 자동 검사는 제어된 VM/모의 Peer 환경으로 실제 온라인 접속을 보장하는 검사가 아니다.

## 3.0.0-character.19 — 2026-10-06
요청: 연한 지오핀 색상·탄환 크기 포함 유도 경로·반사 사거리 증가 제거·전이 횟수 제한 제거·정밀700·충격 전달 벽 관통·주먹 대폭 가속.
원인: 후보 선택은 중심선 LOS만 검사하고 반사 직후2px만 두께 검사하여 중간 벽/좁은 틈을 향했다. 공통 nearest에서 실제 wallCollisionPadding과 최초 적 접촉까지 전 구간 raycast로 후보를 검증한다. 사거리 증가 설정을6종 모두 제거하고 증가율이 없을 때 extendRange가 travel 초과분까지 사거리를 늘리거나 페이드를 초기화하지 않도록 조기 종료한다.
변경: 색상#e4c52a→#e6ca3b(표현 색 포함), maxRedirects0 무제한 계약·중복 대상 제외 유지, 정밀1100→700, 충격 전달 delivery.area.wallPolicy ignore, 주먹4500→18000(4배). 공통 모듈 조합 유지·새 모듈/캐릭터 이름 분기 없음.
파일: src/data/characters/geopin.js, src/projectiles/ProjectileRedirectService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, docs/CHARACTER CONTRACT.md, project.json, DIVIDE TASKS.md, PATCH LOG.md 및 생성runtime.js.
검증: 지오핀47·구조22·가에9·테르디온29·게임15·방19·이동19(총160). 좁은 틈/중간 벽/반경 변화/벽 앞 적·6명 실제 연쇄·동일 적 제외·사거리 초과 travel 확장 없음·6무기 고정 사거리·다음 벽 관통 검증. build/구문/docs/check/verify·ZIP CRC/파일 전체 바이트·추출본 검사.
미검증: 실제 브라우저 외형/주먹 체감 속도·두 기기 WebRTC 실전. 제어된 Node VM 회귀는 실제 온라인 검증을 대신하지 않는다.
주먹 추가 검수: travelSpeed는 world-edge 범위에서만 duration을 계산하므로 고정 사거리 progressRect에서는 값만 변경해도 실제 속도가 바뀌지 않았다. 기존 growthSpeed를19.8로 설정하여 220ms 표현 중200거리를 약11.1ms에 진행하도록 수정. 실제 EffectSpawnService 피해 진행을5ms/12ms로 실행해 종점 적 타격 검증.

## 3.0.0-character.20 — 2026-10-06
요청: 주먹 넉백 공격 방향 고정·전이 적중 사거리40% 증가·주먹 약간 감속·전이 사거리700.
변경: 주먹 기존 movement.knockback.direction attack, 진행속력15300/growthSpeed16.83(이전보다15% 감소·거리200 약13.1ms·표현220ms). 전이 최초700·projectile.redirect.rangeGrowthRatio0.4 및 rangeGrowthOn[hit]. 준비된 기본 사거리의40%인280씩700→980→1260…누적하며 travel은 보존. 벽/중복 대상 제외·전이 횟수 무제한 유지. 마지막 적중도 증가 기록 후 후보 없으면 종료. 새 모듈·캐릭터 ID 예외 없음.
파일: geopin.js, ProjectileRedirectService.js, tools/test-geopin.cjs, README.md, docs/GEOPIN.md, docs/CHARACTER CONTRACT.md, project.json, DIVIDE TASKS.md, PATCH LOG.md, 생성runtime.js. 역할/선언 최신화.
검증: 지오핀49·구조22·가에9·테르디온29·게임15·방19·이동19(총162). 세 공격 방향의 실제 onHit 넉백, 주먹12ms 미접촉/14ms 종점 피해,6명 연쇄 증가/중복 제외/벽 증가 없음, 준비된1000 사거리 기준400 증가·장착 변경 무관·snapshot 복원/중복 순번 무시·후속 증가 검증. build/구문/docs/check/verify·ZIP CRC/전체 파일 바이트 일치·추출본 검사.
미검증: 실제 브라우저의 속도 체감·두 기기 온라인 실전. 제어된 Node VM 회귀는 실전 검증을 대신하지 않는다.

## 3.0.0-character.21 — 2026-10-06
요청: 주먹 발사기 추가 감속. 앞서 안내한 현재 대비20% 감소 적용.
변경: 진행속력15300→12240, 실제 표시/피해 진행 growthSpeed16.83→13.464. 사거리200 약16.3ms, 표현 수명220ms. 기존 effect.spawn progressRect/damage progressive-rect 값만 조정하며 공통 모듈·공격 방향 넉백·전이탄 동작 유지.
파일: src/data/characters/geopin.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/수치/변경 기록 최신화.
검증: 지오핀49·구조22그룹. 실제 progressive-rect 피해를15ms 미접촉/17ms 종점 적중으로 검사하며 공격 방향 넉백·전이 연쇄 회귀 유지. build/구문/docs/check/verify·ZIP CRC/파일 전체 바이트 일치/추출본 검사 통과.
미검증: 실제 브라우저 속도 체감·두 기기 온라인 대전.

## 3.0.0-character.22 — 2026-10-06
요청: 급접근 대상에 소환수 포함·조건 완화·회피 접근 감지.
변경: approachTargetKinds에 summon 추가. approachWindow250→350ms, approachDelta180→100, approachNear300→350. 적 자체 이동 조건은 기존 delta×0.75를 재사용해135→75. 재감지 경계는 near+delta인450 초과. 주먹 제작3회 유지.
원인: 기본 회피는140/130ms여서180 감소 조건을 충족하지 못하며 고정 관측 구간 경계에서 이동이 나뉘면 누락될 수 있었다. 기존 ReactiveEquipmentService.update의 위치 감지를16ms 간격 재사용24슬롯 rolling history로 변경하여350ms 내 유효 이전 위치를 검사한다. 프레임마다 배열/객체를 생성하지 않고 최초 추적 시만 할당. 새 모듈/캐릭터 이름 예외 없음·기존 equipment.situation Trigger 유지.
파일: src/data/characters/geopin.js, src/core/ReactiveEquipmentService.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, 생성runtime.js. 역할/심볼/현 수치 갱신.
검증: 지오핀53·구조22·가에9·테르디온29·게임15·방19·이동19(총166). player/trainingBot/summon 포함·350ms/100/350 경계·미달99/최종351/시간351 제외·아군/자기 회피 제외·기본140/130ms 이동을 시간 경계에 걸쳐 샘플링해 감지·중복 누적 제외/이탈 뒤3회 발명·신규 소환 자체 제외·사망 기록 정리/원격 관측자 제외. build/구문/docs/check/verify·ZIP CRC/전체 파일 바이트 일치·추출본 검사.
미검증: 실제 브라우저·두 기기 WebRTC에서 회피/소환수 접근. 기본 회피 검사는140/130ms 위치 변화 샘플을 주입한 제어된 VM 회귀이며 실제 입력/네트워크 실전 대체 검사가 아니다.

## 3.0.0-character.23 — 2026-10-06
- 장판 반복 trigger와 field-area 피해가 모두 발명 진행을 올리던 중복 경로 제거. InstalledAreaFieldService는 피해 간격 대기 중에도 진입/이탈 갱신, 진입만 ReactiveEquipmentService.field 호출. 지속 틱/무적/저회로 재누적하지 않음.
- ReactiveEquipmentService.behindWall에 DynamicWallService의 활성 차막이 포함. 델트루브 차막이 뒤 공격/저회 조건도 집계.
- 벽 반경 내에서 시작한 탄환은 진입면이 없어서 접촉 블록을 못 찾던 충격 전달150 피해 누락 재현(검사0≠1). ProjectileRedirectService.contact에서 겹친 실제 블록 복구 후 통과.
- 폭발 고무탄 직격/폭발 기본200. 기존 projectile.impact 공유 적중과 hit.once-per-execution 조합으로 동일 대상 중첩 제거. 설명/GEOPIN 최신화.
- 대상: 위 공통 서비스3개, 지오핀 데이터, 회귀 검사, README/GEOPIN/project.json/DIVIDE TASKS/runtime.
- 검증: 지오핀59·구조22·가에9·테르디온29·게임15·방19·이동19 총172 회귀; 구문/build/docs/check/verify, ZIP CRC/원본 바이트 대조.
- 한계: 제어된 Node VM의 실제 서비스+권위/피해 스텁 검사. 실제 브라우저/다중 기기 WebRTC 실전은 미검증.

## 3.0.0-character.24 — 2026-10-06
- 요청: 근거리/원거리 게이지는 직접 공격만 인정. 뒤 기어 더 크게/평소 더 투명하게.
- 원인: ReactiveEquipmentService.damage가 field-area 외 모든 피해를 거리만으로 분류하여 상태/DOT 등도 누적 가능.
- 수정: 거리 사실에 데이터 허용 impact 유형 및 제외 공격 태그 검사 적용. direct/projectile/area/effect-animation만 허용하며 트랩(field-area/덫 발동), 상태/DOT, CC 태그 및 유형 없는 피해 제외. 기존 장판 진입·이동 제한·벽 뒤·직접 공격 무적/저회 경로 유지.
- 데이터: 기어 반경42→50/idleAlpha0.35→0.2. 회전350ms/강조/페이드500ms 및 개인8호 유지. 거리 설명에 직접 공격 명시.
- 대상: ReactiveEquipmentService.js, geopin.js, test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS, 생성 runtime.
- 검증: 지오핀62·기타113 총175 회귀, 실제 기어 렌더 알파 검사, 구문/build/docs/check/verify, ZIP CRC 및 원본 바이트 대조.
- 한계: 제어된 Node VM 검사. 실제 브라우저/온라인 실전 미검증.

character.24 추가: 과반동의 restrictedStatuses에서 knockback, restrictedAttackTags에서 넉백을 제외. 순수 넉백/넉백 저회는 제작·자동장착·마지막 조건을 바꾸지 않는다. 기절/속박/둔화/빙결/수면/무력화/끌어오기 조건은 유지. 넉백 공격은 거리 조건 제외 태그에는 남겨 거리 게이지로 우회 집계하지 않는다.62 지오핀/총175 회귀 검사.

## 3.0.0-character.25 — 2026-10-06
- 과반동 발사기 사거리700→500. geopin.js의 AttackSpec 단일 원본 수정. GEOPIN/README/project.json 역할 갱신, DIVIDE TASKS/runtime 재생성.
- 지오핀62 회귀·build/구문/docs/check/verify·ZIP CRC 및 원본 바이트 대조 통과. 실제 온라인 실전 미검증.

## 3.0.0-character.26 — 2026-10-06
- 신고: 엔소냐 평타 저회로 과반동 스택 증가. 최신 소스에서는 실제 엔소냐 데이터/TagService/JustDodge 이벤트3회에서0스택·기본 무기 유지로 미재현. 넉백은 character.24에서 이미 제외됨. 추측 전투 수정 없음.
- tools/test-geopin.cjs에 실제 데이터/태그/저회 통합 회귀 추가. 기존 단순 넉백 태그 스텁 검사보다 범위 확대. README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신.
- 지오핀63 회귀·build/구문/docs/check/verify·ZIP CRC/바이트 일치 통과. 실제 사용자 실행 파일/온라인 브라우저는 미확인.

## 3.0.0-character.27 — 2026-10-06
- 코녕 장판의 둔화50ms 갱신(120ms replace-source)을 CCService.add가 매번 restriction 사건으로 보고해 빠르게3스택/과반동 장착. 실제 코녕 데이터+CCService 반복 검사에서3≠1 재현.
- 활성 동일 sourceId replace-source/refresh-type 갱신은 발명 사건 제외. 첫 적용1회·해제/만료 후 재적용은 새1회. CC 유지/다른 상태 적용 경로 유지. 캐릭터 이름 예외 없음.
- CCService.js, test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신.
- 지오핀64+기타113 총177 회귀, 구문/build/docs/check/verify 및 ZIP CRC/바이트 대조 통과. 실제 브라우저/온라인은 미검증.

## 3.0.0-character.28 — 2026-10-06
- 루네프 화염 폭발 원거리 정밀 스택0≠1 재현. 폭발의 넉백 태그가 거리 조건 제외 목록에 있어 직접 피해도 차단됨.
- geopin.js distanceExcludedAttackTags에서 넉백만 제거. 직접 넉백 공격의 거리 조건 허용, 과반동 넉백 제외는 restrictedStatuses/restrictedAttackTags에서 유지. 후속 화염 status/DOT 제외 유지.
- 실제 루네프 데이터/TagService 폭발400 사건1스택, DOT4회 추가 없음 회귀. 엔소냐 저회/코녕 둔화 및 넉백 과반동 제외 회귀 통과.
- 대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀65+기타113 총178 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.

## 3.0.0-character.29 — 2026-10-06
- 과반동 발명은 이동 정지CC(기절/속박/빙결/수면/무력화)만 인정. restrictedStatuses의 slow/pull 및 restrictedAttackTags의 slow/끌어오기 제거. 넉백 제외 유지.
- 코녕 둔화 장판은 장판 진입만 집계, 둔화 유지/해제/재적용으로 과반동0스택. 기절 등5종은 각각3회 제작 검사.
- 사용자 확인한 과반동 피해200→250(DamageRatio2.5). 사거리500. 실제 설명은 DamageRatio 원본 참조.
- geopin.js/test-geopin.cjs, README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신. 지오핀66+기타113 총179 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조 통과. 실제 온라인 미검증.

## 3.0.0-character.30 — 2026-10-06
- 타우 추격: 적중 투사체 carrier는 존재하나 상태 조회null인 상황에서 이동[]≠[300] 재현. AttackModuleService.onHit은 적중 carrier 우선, 이동 성공 시에만 oncePerExecution 소비. NetworkHitAuthorityService는 투사체 대상 추격에 확정 적중 좌표 우선(귀환 위치 오조준 방지).
- 지오핀 체력1100→1300.
- 추가 신고 체리티 원거리 누락: 실제 데이터/TagService/차징 AttackSpec의 벽 없는거리500/700/1400 정밀1스택, 벽 뒤에서는 충격 우선1/정밀0 확인. 사용자 실전 누락 미재현, 추측 조건 변경 없음.
- 대상: AttackModuleService/NetworkHitAuthorityService/geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀68+기타113 총181 회귀·구문/build/docs/check/verify·ZIP 검사. 온라인 이동 변경은 실제 브라우저 실전 미검증.

## 3.0.0-character.31 — 2026-10-06
- 주먹 급접근에서 일반 걸음 제외. ReactiveEquipmentService.update가 현재 CombatStats.speedMult 반영 일반 이동속도의 approachSpeedRatio1.2 초과 관측 이동속도를 요구. 기존 상대이동75/거리100/350ms/최종350 조건과 함께 검사. 끌려감 예외 유지.
- geopin.js 파라미터, 서비스/테스트 역할, README/GEOPIN 갱신. 일반 걸음/1.5배/2배 버프 걸음 미집계 및 기본 회피140/130ms 집계 통과. 지오핀69 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 일치. 실제 온라인 미검증.

## 3.0.0-character.32 — 2026-10-06
- 200 미만 고무탄 투사체 본체 피해를200(DamageRatio2)으로 상향: 기본/충격/전이100→200, 정밀150→200. 기타 공격 수치 유지.
- geopin.js/README/GEOPIN/project.json/DIVIDE TASKS/runtime 갱신. 지오핀69 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조 및4개 원본 피해 확인 통과. 실제 온라인 미검증.

## 3.0.0-character.33 — 2026-10-06
- 충격 전달/반사 패킷이 ROOM_GAMEPLAY_PACKET_TYPES에 누락돼 Room.receiveGameplay/handleClientPacket에서 실제 처리되지 않음. 두 타입 등록 후 실제 Room 호스트 중계/클라이언트 수신 검사 false≠true→통과. 기존 전달 피해 코드 유지.
- 무기 투사체 연결 점선은 Training.js 공통 렌더에서 EntityService.owner(source)===Training.player일 때만 표시. 상대/관전자에서는 숨김.
- 대상: ROOM_GAMEPLAY_PACKET_TYPES.js/Training.js/test-room-connection.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime. 지오핀69/방20 포함183 회귀·구문/build/docs/check/verify·ZIP CRC/바이트 대조. 점선은 코드 경로 검수, 실제 브라우저 시각/두 기기 실전은 미검증.

## 3.0.0-character.34 — 2026-10-06
우클릭 즉시 이전 장착 무기로 전환, 홀드200ms 시 고무탄 복귀. 기존 holdTriggerWhilePressed/equipment.select operation:previous 파라미터 확장 사용. 전환 이력 previousValue를 공통 ModeState snapshot에 복제. 동일 무기 재선택은 이력 미변경. 짧은 클릭 직후 전환하고 계속 누르면 기본으로 전환. 기존 비용0/쿨250ms 유지. 지오핀69 포함183 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: ReactiveEquipmentService/AbilityModuleService/ModeStateService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime. 이전 기본 장착중 RMB 금지 계약 폐기.

## 3.0.0-character.35 — 2026-10-06
충격 전달 벽 뒤 네모 기본 피해150→300(DamageRatio3). 벽 뒤 조건은 기존 직접 공격 허용 유형/제외 태그 검사와 함께 평가. 트랩/field-area/상태DOT/CC 태그 공격·해당 저회는 벽 뒤 집계에서 제외, CC 자체 적용은 이동 제한 조건만 처리. 직접 투사체/범위 공격과 동적 차막이 지원 유지. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증.
대상: ReactiveEquipmentService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.36 — 2026-10-06
지오핀 RMB는 기존 tapHoldSplit/holdGauge 경로 사용. 누르는 동안200ms 호게이지 표시, 200ms 미만으로 떼면 이전 무기, 200ms 이상 홀드 후 떼면 기본 고무탄 전환. 눌렀을 때/홀드 도중 전환 없음. 엘린 등과 같은 PointerHoldInputService 호게이지/해제 분기 재사용. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.37 — 2026-10-06
고무탄6종 반경18. 사거리500→650(기본/과반동),700→850(전이/정밀). 탄속은 사거리 비율 곱해 기본39/과반동68.25/전이약39.4643/정밀약72.8571. 충격650/탄속30, 폭발250/27.5 유지. 원거리 조건과 개인 점선 기준은 기본 사거리 참조로650, 전이 적중40% 추가는340. 지오핀70 포함184 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 온라인 미검증.
대상: geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.38 — 2026-10-06
기본 고무탄 평타 쿨400→350ms(0.35초). 발명품별 고유 쿨은 유지. 기존 홀드 평타 반복은 AttackSpec.cd 원본을 참조. 지오핀70 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.39 — 2026-10-06
거리350 이하 근거리/350 초과 원거리. farAttackId 기본 사거리 참조 제거·고정longDistance350/farExclusive:true 사용. 같은 반경인 기준 원은 공통 renderer에서 한 번만 표시. 기본 고무탄 평타350→300ms.349/350/351 경계·캔버스 arc1개 실제 검사. 공통 유도 시야 판정으로 미탐지 은신 적은 벽 반사/연쇄 유도 대상에서 제외. 공개 적이 없으면 반사각 유지. 탐지된 적은 기존 시야 규칙 적용. 지오핀72 포함186 회귀·구문/build/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: ReactiveEquipmentService/EquipmentGaugePresentationService/geopin.js/test-geopin, README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.40 — 2026-10-06
지오핀 최대 체력1300→1100. 탄속12% 감소 요청은 취소되어 기존 탄속 유지. 캐릭터 stats.maxHealth 원본과 기존 체력 회귀 기대값을 갱신. 지오핀72 회귀·빌드/구문/docs/check/verify·압축 무결성 검사 통과. 실제 브라우저/온라인 플레이 미검증.
대상: src/data/characters/geopin.js, tools/test-geopin.cjs, docs/GEOPIN.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.

## 3.0.0-character.41 — 2026-10-06
최근 사거리 상향 때 빨라진 기본/전이/과반동/정밀 고무탄의 탄속을 현재 값×0.93으로7% 감소. 기본39→36.27, 전이39.464285714285715→36.70178571428571, 과반동68.25→63.4725, 정밀72.85714285714286→67.75714285714285. 충격30/폭발27.5와 체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 데이터만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 무결성 검사. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.42 — 2026-10-06
기본/전이/과반동/정밀 고무탄 탄속을 character.41 현재 값에서 추가10% 감소(×0.9). 기본32.643, 전이33.03160714285714, 과반동57.12525, 정밀60.981428571428566. 첫7% 감소 전 대비 총16.3% 감소. 충격30/폭발27.5·체력1100·사거리·연사속도 유지. 기존 delivery.projectile.speed 원본만 변경. 지오핀72 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin.cjs 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.43 — 2026-10-06
지오핀 RMB의 holdGaugeTimerOnly:true 누락으로 startHoldGauge가 실패하여 press 즉시 일반 스킬로 빠지던 오류 수정. 공통 PointerHoldInputService.release는 마지막 update와 무관하게 실제 누른 시간도 확인.199ms 해제 이전 무기,200ms 이상 해제 기본 고무탄,누름/홀드 도중 미발동,강제 취소 미발동. 실제 Pointer press/release와 장착 결과 회귀 추가. 전체187그룹(지오핀73)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/WebRTC는 미검증. 이전 검사는 모듈 선택만 확인하여 입력 준비 실패를 놓쳤음.
대상: PointerHoldInputService/geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.44 — 2026-10-06
지오핀 설명 간결화: 폐기된 벽튕 사거리80/60/40/20% 증가 문구 제거. 상황별3회는 발명 설명에서만 표기하고 개별 발명품의 반복3회/중복 저회/목록 우선순위 문구 제거. 조작 구분·조건·피해·전이 적중40% 사거리 증가 유지. 반격 설명에 주변 피해 명시. 게임 실행 데이터 변경 없음. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 미검증.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.45 — 2026-10-06
지오핀 기본 고무탄 평타 피해200→150. Base Damage100은 유지하고 기본 AttackSpec damageRatio2→1.5만 수정. 발명품별 피해·탄속·사거리·체력1100 유지. 툴팁은 기존 damage 참조로150 표시. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.46 — 2026-10-06
사용자 확인에 따라 사거리850인 전이/정밀 고무탄 탄속을 현재 값에서15% 감소(×0.85). 33.03160714285714→28.07686607142857, 60.981428571428566→51.83421428571428. 사거리850·피해 및 다른 무기 탄속 유지. 기존 delivery.projectile.speed 값만 변경. 지오핀73 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.47 — 2026-10-06
지오핀 고무탄6종 벽 반사마다 현재 속력×0.8. projectile.redirect wallSpeedMultiplier0.8 범용 파라미터로 실제 vx/vy/baseSpeed 갱신, redirect snapshot 복원 시 baseSpeed도 수신 속력으로 동기화. 적중 연쇄 자체는 감속하지 않음. 지오핀200 피해 본체(충격/전이/정밀/폭발)와 폭발 후속을150으로 하향. 기본150·레이저150·주먹150·과반동250·반격250 유지. 충격 전달 벽 뒤300→250. 반 스패너 공격(lmb/rmb/counter) 후 기존 mode.toggle로 누적 회전 상태 갱신, 기존 ModeGearPresentationService.rotation을 스패너 renderer에 연결하여300ms에 한바퀴 회전. 파괴 상태는 숨김 유지. 모드 snapshot으로 상대 동일 시간축 회전. 새 모듈 없음. 전체189그룹(지오핀75)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/두 기기 실전 미검증.
대상: geopin.js/van.js, ProjectileRedirectService, VanWrenchDurabilityPresentationService, test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.48 — 2026-10-06
지오핀 기본 및 발명품 평타9종(lmb,jump,wall,laser,chain,punch,recoil,sniper,bomb)의 AttackSpec.cd를350ms(0.35초)로 통일. 보조 폭발/벽뒤 공격과 스킬/반격은 제외. 기존 홀드 반복은 현재 장착 공격의 cd를 참조. 피해/탄속 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.49 — 2026-10-06
추진 도약기 이동거리180→360(100% 증가). 기존 movement.move distance 원본 수정, 이동시간200ms 유지하여 이동속력1800units/sec. 점프 궤적/피해/평타간격350ms 유지. 지오핀75 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 플레이 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.50 — 2026-10-06
키 스킬/좌클 forecastExecute 및 스킬/우클 deceive는 예고 field를 clear하되500ms 보상 판정만 유지하는 기존 구조. 예고 지역에 reactiveEquipmentEntry:false를 지정하고 공통 ReactiveEquipmentService.field에서 해당 옵션 및 rewardOnly 상태를 제외. 예고 지역 최초 진입과 실행/취소 후 보상 잔류 모두 지오핀 장판 게이지 미누적. 일반 지속 적 장판 진입은 유지. 실제 사용자 온라인 증상 재현은 미확인, 실제 키 데이터/분류76회귀 및 전체190그룹·빌드/구문/docs/check/verify·ZIP 검사 통과. 새 모듈/캐릭터ID 예외 없음. 실제 온라인 미검증.
대상: ki.js/ReactiveEquipmentService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.51 — 2026-10-06
추진 도약기→추진 가속기. jump AttackSpec 내부 참조ID 유지, trajectory.arc 제거. 기존 movement.move 조준 방향 distance260/duration200ms와 delivery.area rect range200/halfWidth45/angleOffsetπ/wallPolicy:block 조합. 후방 공격 크기는 충격 전달 wallBurst와 같은200×90, 기본 피해150으로 설정. 즉시 후방 히트스캔과 전방 이동 발동, 기존 이동 중 비타격 무적/벽·적 통과/미표시 이동선 유지. 비용150·cd350ms. 새 모듈 없음. 실제 AreaAttackService 후방 적중/전방 제외 회귀 포함 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.52 — 2026-10-06
추진 가속기를 추진 도약기로 롤백: 리메이크 전 trajectory.arc 높이55·전방/목표점360·200ms·비타격 무적 이동 복구, 후방 히트스캔 제거. 발명 조건은 지속 장판 실제 피해3회. reactiveEquipment.fieldTrigger:damage로 공통 field 진입 누적 차단, InstalledAreaFieldService 실제 피해 impact에 fieldDuration 전달. ReactiveEquipmentService는 field-area/fieldDuration>0/amount>0/적대 출처를 확인하여 field 조건만 누적. 장판 진입·무적·저회·일회성/상태DOT 제외. 같은 장판 지속 피해도 실제 피해 사건별1회 누적. 키 예고 및 보상 잔류는 실제 피해가 없어 제외 유지. 전체191그룹(지오핀77)·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/온라인 미검증. 기존 공통 분류 파라미터 확장·새 모듈 없음.
대상: geopin.js/ReactiveEquipmentService/InstalledAreaFieldService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.53 — 2026-10-06
추진 도약기 이동거리/AttackSpec.range360→220. 이동시간200ms·점프 궤적·지속 장판 실제 피해3회 발명 유지. 기존 movement.move distance 원본만 조정. 지오핀77 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.54 — 2026-10-06
뉴 마검 장판 duration:infinite가 Number 변환에서NaN→0이 되어 지오핀 지속 장판 판정에서 제외되던 원인 수정. InstalledAreaFieldService 피해 impact에 fieldPersistent boolean 전달(infinite 문자열/Infinity/무기한 endsAt 지원), 숫자 fieldDuration은 유한값만 전달. ReactiveEquipmentService는 양수 duration 또는 persistent 장판 실제 피해를 집계. 피해0/무적/저회 제외·진입 미누적 유지. 실제 뉴 데이터 기반 무기한 장판3회 제작 회귀 추가. 전체192그룹(지오핀78)·빌드/구문/docs/check/verify·ZIP 검사. 실제 온라인 플레이 미검증. 새 모듈/캐릭터ID 예외 없음.
대상: InstalledAreaFieldService/ReactiveEquipmentService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.55 — 2026-10-06
지오핀 고무탄6종 벽 반사마다 현재 탄속35% 감소(×0.65)로 변경. 이전20%(×0.8) 대체. 기본 발사 탄속 및 적중 연쇄 자체 유지. 기존 projectile.redirect.wallSpeedMultiplier 원본 변경, 반복 반사와 원격 baseSpeed 복원 회귀 기대값 갱신. 지오핀78 회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 온라인 미검증.
대상: geopin.js/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-balance.2 — 2026-10-06
공통 Space 회피 기본거리140→119(15% 감소), 스테미나 비용400→300. GAME_DATA.dodge 단일 원본 변경. EntityDodgeService의 실제 비용/이동과 DebugControl/입력 조건이 기존 원본을 참조. 회피 속도17.95·dur130ms·저스트 회피80ms 및 증강 배율 유지. 관전 Space 대시도 기존 공통 거리 참조로119 사용. 전체192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저/온라인 미검증.
대상: GAME_DATA.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.3 — 2026-10-06
공통 회피 잔상: 기존 RecordDodgePresentationService.begin/update/emit을 재사용하여 실제 Entity 위치에 캐릭터색 원형 실루엣(알파0.18·150ms·46ms 간격)을 EffectSpawnService로 생성. 낮은 레코드에도 기본 잔상 profile 제공, 기존 상위 레코드 전용 연출 유지. 저스트 회피의 기존 금색 원에 얇은 밝은 내부 원과 짧은4방향 선 추가,360ms 수명/텍스트/화면흔들림 유지. 실제 회피 경로를 매 프레임 추적하는 기존 경로만 사용, 예상 도착점 잔상 없음. 기존 로컬/원격 dodge activate 및 just-dodge 프레젠테이션 복제 경로 재사용. 실제 emit 위치/수명/알파 실행검사 및 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 시각/두 기기 온라인 미검증.
대상: RecordDodgePresentationService.js/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.4 — 2026-10-06
회피 잔상 리디자인: 기본 생성간격46→25ms/수명150→240ms, 단색 저알파 원을 캐릭터색 채움0.32·외곽0.7·짧은 밝은 호0.4로 변경, 제곱 페이드 대신 선형 페이드로 가시성 향상. 실제 위치만 기록. 저회는 기존 이중원/4선 대신 금색3분할 호·밝은 내부호·작은4마름모가 짧게 퍼지는360ms 연출. 약한 glow7·최대 반경54/장식61로 화면 가림 제한. 기존 이펙트 생성/회피 시간축/동기화 재사용, 화면흔들림 추가 없음. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저 시각 검수/온라인 미완료.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.5 — 2026-10-06
사용자 시각 피드백 반영: 회피 잔상의 테두리/장식 호 제거, 실제 본체색 원형 실루엣만 채움0.38·190ms 제곱 페이드로 표시. 기본25ms 생성 유지. 저회 금색 원형 호/마름모 제거,90도 교차형 가늘고 뾰족한 두 빛줄기와90ms 미만의 약한 중심 섬광으로 교체. 기존360ms수명/텍스트/화면흔들림 유지. 기존 effect.spawn 생성/실제회피 위치/원격 프레젠테이션 경로 유지. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 통과. 실제 브라우저 시각/온라인 미검증.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-ui.6 — 2026-10-06
사용자 최종 지시: 회피거리119/비용300 유지. ui.3~ui.5에서 추가한 공통 잔상/저회 연출을 전부 롤백. RecordDodgePresentationService.js 및 Training.js를 연출 변경 직전 balance.2 배포본과 바이트 동일하게 복구. 기존 상위 레코드 회피 연출과 원래 저회 금색 원/텍스트/화면흔들림 복구. 기존192회귀·빌드/구문/docs/check/verify·ZIP 검사 및 롤백 원본 바이트 대조 통과. 실제 브라우저/온라인 미검증.
대상: RecordDodgePresentationService/Training.js 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.56 — 2026-10-06
지오핀 RMB 홀드 성공 해제 후500ms 최대 호/점선링 유지: 공통 PointerHoldInputService holdGaugeRetainMs 설정/잔류 렌더 지원. 기본 고무탄 상태는 holdTrigger state.mode-is invert 조건으로 홀드 차단. deferTapUntilRelease 및 cancelUnavailableHold로 홀드 준비 불가 시 누름 즉시 탭 실행 방지·길게 눌러도 탭으로 오발하지 않음. 짧은 이전무기 전환 유지. 설명 화살표 나열 대신 다른 캐릭터처럼 조건과 행동 문장으로 정리. 기존78지오핀 회귀 포함192·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저/온라인 미검증.
대상: geopin.js/PointerHoldInputService/test-geopin 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.57 — 2026-10-06
레이카 가호 상태에서 대검, 뉴 마검 보유 상태에서 마검을 본체 뒤에 표시. 캐릭터 데이터의 worldEffectModules 조건과 공통 후면 장식 렌더를 조합하며 캐릭터별 실행 분기 없음. 기존 상태 동기화와 본체 투명도 적용. 전체193회귀·빌드/구문/docs/check/verify·ZIP 검사. 실제 브라우저 시각/온라인 미검증.
대상: reika.js/nyu.js/ModeGearPresentationService/test-geopin 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.58 — 2026-10-06
지오핀 뒤 기어의 돌출 톱니16개→6개. 기존 공통 gearPath의 teeth 설정만 변경하여 크기·색상·회전·사용 밝기·평소 투명도 유지. 지오핀79회귀 및 빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 검증은 미실시.
대상: geopin.js 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.59 — 2026-10-06
뉴 마검 확대(scale1→1.35): 뾰족한 보라색 검날·측면 돌기·꺾인 중심선·갈고리형 가드. 레이카 태양의 대검 별도 디자인(scale1→1.25): 넓은 금빛 검날·밝은 중심선·날개형 가드·8방향 태양 문양. 공통 swordSilhouette 스타일 분기로 구현하며 상태 조건과 후면 렌더 유지. 지오핀79회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각/온라인 미검증.
대상: nyu.js/reika.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.60 — 2026-10-06
지오핀6톱니 기어 외형 보정: 깊은 홈(몸통 반경0.78)·8점 모따기 톱니·넓고 평평한 돌출부·내부 림0.68로 외곽과 정렬. 기존 반경50·색상·투명도·회전 유지. 공통 toothProfile 설정으로 다른 기어 원형 유지. 지오핀79회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 미검증.
character.59 뉴/레이카 검 리디자인과 함께 제공. 대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.61 — 2026-10-06
레이카/뉴 후면 검 공격 시300ms 한바퀴 회전: 기존 mode.toggle after-attack과 ModeGear.rotation 시간축 조합, 모드 상태 원격 복제 재사용. 레이카 기본/가호 평타·스킬·반격 및 뉴 평타·투척·반격에 적용, 후속 파동/장판/착탄 중복 회전 제외. 기존 characterValue 모듈 인덱스 보존을 위해 회전 모듈은 배열 끝에 추가. 레이카 검날 폭 일정한 직선형으로 변경(끝만 뾰족), 금빛 가드/태양 문양 유지. 은신 확인: 본체 bodyAlpha를 검·기어·스패너 모두 적용, 미탐지 적 완전 숨김/자신·아군 반투명/탐지 노출. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: reika.js/nyu.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.62 — 2026-10-06
인투 뒤 현재 무기 표시: 기본 권총/산탄총은 intu-weapon 모드, 저격총은 intu-sniper 상태 우선으로 표시. 공통 gunSilhouette 렌더와 데이터 조건 조합. 권총 짧은 몸통/손잡이, 산탄총 긴 총열/펌프, 저격총 긴 총열/스코프·하늘색#9bdcff. 무기 종류 칸수 게이지만 제거, 탄약 칸수와 재장전 호 게이지 유지. 본체 은신 투명도 공유. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: intu.js/ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.63 — 2026-10-06
인투 후면 무기 리디자인·전체 스케일1.5배: 권총 슬라이드/각진 프레임/손잡이/방아쇠 보호대, 샷건 두꺼운 총열/펌프/개머리판, 하늘색 저격총 긴 총열/큰 스코프/개머리판을 별도 부품으로 표현. 총 실루엣과 부품 대비 확대, 기본 알파0.8→0.9. 무기 전환 조건·탄약/재장전·은신 본체 알파 공유 유지. 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 검증 미실시.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.64 — 2026-10-06
가에 활성화 정도 표시를 호→8칸 게이지로 교체. 기존8종 활성 명령 모드를 그대로 세어 활성 명령당1칸 표시. 공통 RuntimeValueReferenceService의 mode-match-count 값을 추가하여 기존 비율 참조와 집계 로직 공유, 기존 gauge.segmented renderer 사용. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: gae.js/RuntimeValueReferenceService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.65 — 2026-10-06
인투 총 전면 리디자인: 이전 세로 부품 조합 폐기, 가로 측면 실루엣을 기울여 후면 배치. 권총 긴 슬라이드/각진 손잡이·샷건 펌프/개머리판·하늘색 저격총 스코프/탄창/긴 총열을 구분. 스케일1.5 및 본체 은신 알파 유지. 실제 drawGun을 @napi-rs/canvas로 렌더해 본체 원형 포함3무기 PNG 시각 확인. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 게임 브라우저/온라인 미검증.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.66 — 2026-10-06
지오핀 기어 전면 재설계: 6개 굵은 블록 톱니·깊은 홈·굵은 원형 림·3개의 열린 창/넓은 회전자 축·육각 중심, 기존 촘촘한 살/볼트 제거. toothProfile:block/gearDesign:openRotor 공통 데이터 옵션 사용. 기존 크기/회전/알파 유지. 실제 renderer 캔버스2배 확대+본체 포함 시각 확인. 인투 실제 발사 AttackSpec8종 after-attack mode.toggle로300ms 반시계 한바퀴(-2π), 기존 ModeGear.rotation/상태 원격 복제 재사용. 모듈 배열 끝에 추가하여 기존 인덱스 보존. 재장전 자체는 회전 없음. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인/브라우저 미검증.
대상: geopin.js/intu.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.67 — 2026-10-06
지오핀 기어 디자인 재정리: 길쭉한 블록 톱니를 짧고 두툼한6톱니(몸통0.84)로 변경. 열린3창/육각 축 제거, 내부 원형 림·6개의 단순한 살·원형 중심 축으로 교체. 실제 렌더+본체2배 확대 이미지 확인. 크기/회전/투명도 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인 미검증.
대상: ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.68 — 2026-10-06
사용자 정정에 따라 지오핀 기어를 전면 리디자인 전 character.65/60 외형으로 정확히 복구: chamfered6톱니·이중 림·6살·6볼트·육각 축. character.66/67 새 기어 디자인 폐기, 추가 다듬기 없음. geopin.js는character.65 배포 원본과 바이트 동일, gearPath/기어 내부 렌더 원본 복구. 인투 발사 반시계 회전 유지. 전체193회귀·빌드/구문/docs/check/verify 통과.
대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.69 — 2026-10-06
복구한 지오핀 기어 디자인 유지하며 세부 보정: 6톱니/6살/6볼트/육각 축 유지. 모따기 톱니 몸통0.78→0.8·모서리 비율 조정, 외곽선2→1.7/둥근 연결, 내부 림0.68→0.7, 볼트3→2.2/배치0.58→0.57, 중심 축0.22→0.2. 크기/색/회전/알파 유지. 실제 캔버스 렌더 본체 포함 이미지 확인. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인 미검증.
대상: ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.70 — 2026-10-06
사용자 요청으로 지오핀 기어를6개로 줄이기 전 character.57 배포본의16톱니 디자인으로 정확히 복구. geopin.js 바이트 원본 및 gearPath/기어 렌더 전체 원본 복구. character.58/60/66/67/69의6톱니 디자인/보정 제거. 인투 총 회전·뉴/레이카 검·가에 칸수 등 이후 다른 변경 유지. 전체193회귀·빌드/구문/docs/check/verify 통과.
대상: geopin.js/ModeGearPresentationService 및 README/GEOPIN/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.71 — 2026-10-06
레이카 가호 미리보기 공용 사용 확인: counterBlessed 독자 하늘색 previewStyle/geometry color 제거해 기본 공용 흰색 적용. 공통 AttackPreviewAreaService가 명시 previewGeometry를 이동 종점 후속 범위와 합성하지 않던 원인 수정: delivery.area 없는 공격의 명시 경로를 parts에 포함, 경로 직사각형300/반폭44+종점 원 함께 표시. 지오핀 설명13개(탭/홀드 분리·WEAPON 표기)/테르디온4개 사용자 문구 반영. 설명 선두 [키] strong에 공통 class 부여·밝은#f4f7ff 적용. 기존193회귀 및 별도 실제 parts 실행 경로+종점 원2개/종점좌표 검사·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: reika/geopin/terdion.js·AttackPreviewAreaService·CharacterDescriptionService·game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.72 — 2026-10-06
레이카 tooltip 순서를 사용자 지정대로 일반 ALWAYS/LMB/RMB/RMB CHARGE/L-Shift 뒤 가호 LMB/RMB/L-Shift/Space PROTECTION으로 변경. 공통 설명 렌더가 WEAPON/PROTECTION 키 또는 명시 section을 분리해 기본 스킬 아래 margin-top11px 별도 블록에 모음(소환수 설명과 같은 여백). 각 그룹 내 순서/보간/비용/밝은 대괄호 유지. 지오핀 WEAPON8개도 같은 공통 경로로 분리. 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: reika.js/CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.73 — 2026-10-06
기존 추가 설명 점검: 가에 / 명령10개와 카논 STOPPED SPACE 콤보2개도 공통 하단 그룹 분리 적용. WEAPON/PROTECTION/명시 section 및 기존 소환수 하단 영역 유지. 일반 스킬 조합 표기는 기본 영역 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.74 — 2026-10-06
캐릭터 한줄 설명과 대괄호 표기를 밝은 하늘색#bdeaff로 통일. 기본/추가 스킬 키 및 HEALTH/MOVE SPEED/RECORD/SUMMON 표기도 공통 class 적용. 한줄 설명 별도 span class 사용, 캐릭터 이름/칭호 색은 기존 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterDescriptionService/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.75 — 2026-10-06
이동속도0 소환수 MOVE SPEED 줄을 공통 설명에서 생략. 티냐 RMB INCLUDE/LINK/CROSS/AMP4종을 명시 section:CIRCLE로 하단 분리(RMB DRAG/HOLD 기본 유지). 카논 STOPPED SPACE 하단 분리 취소해 기존 위치 유지. 소환수 관련 기존 RMB/RMB 및 엘린 RMB/LMB를 RMB SUMMONER 표기로 변경(엘린/레테/라임/디라/허장)·공통 SUMMONER 하단 그룹. 실제 입력/효과는 유지. 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: elin/lete/lime/dira/herjang/tinya.js·CharacterDescriptionService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.76 — 2026-10-06
후면 검/총 표시 생성·제거·스타일 전환 공통 효과: ModeGearPresentationService WeakMap 시각 상태 관측, 변화마다 반의 DamageResourceLayerService.spawnTransitionEffect 재사용하여 캐릭터/무기색 얇은 areaCircle240ms 생성. 레이카 가호 진입/해제·뉴 마검 투척/회수·인투 총 전환 적용. 최초 표시/같은 상태/캐릭터 교체 반복 없음·은신 중 효과 억제. 기존 반 파괴/복구 효과 유지. 기존 효과 생성/로컬 권위/온라인 effect-spawn 복제 경로 공유, 원격 중복 생성 없음. 별도 상태 변화 실행검사(생성/제거/교체1회·은신 억제) 및 전체193회귀·빌드/구문/docs/check/verify 통과. 실제 온라인/브라우저 미검증.
대상: ModeGearPresentationService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.77 — 2026-10-06
지오핀 타이머 홀드 게이지가 링 배치에서 누락되어 반격/상태 링과 겹치던 원인 수정. PointerHoldInputService.holdGaugePresentationState로 실제 표시/비율/완료 상태 단일화, drawHoldGauge와 EntityRingLayoutService.characterHoldGaugeState가 동일 참조. 홀드/해제500ms 잔류 동안 호 및 최대충전 링 공간 예약·만료 후 해제. 기본 고무탄 홀드 차단 조건 그대로 반영. 캐릭터ID 분기 없이 공통 홀드 지원. 별도 링 반경 실행검사25→29→32→25 및 기존193회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: PointerHoldInputService/EntityRingLayoutService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.78 — 2026-10-06
캐릭터 수치: 스야 은신 초당150→100(시전400+4초400=최대800), 유이 평타120→144, 엘린/유령체력800→1000, 티냐 주문서800→600, 메라모나 평타 투사체반경8→12/최종 레이저반폭8→12, 나레 스킬1200→800. 방 설정 gameMode normal/augment 추가·기본normal·호스트 일반전/증강전 탭·동기화. 일반전 시작 증강 선택지 없음/게임 준비 제목/캐릭터 카드/준비 완료 버튼·미선택 경고 없음·증강 제출 차단. 일반전 라운드 사이 증강 선택도 제외; 증강전 기존 선택 유지. 기존193+모드 회귀1=194·빌드/구문/docs/check/verify 통과. HTML 의도 변경은 current_layout_sha256로 검증하고 원래 baseline 유지. 실제 브라우저/두 클라이언트 온라인 미검증.
대상: sya/yui/elin/tinya/meramona/nare.js·RoomService/RoomUI/OnlineDuelService·Duels.html/game.css·test-gameplay-fixes/test-room-connection/verify 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.79 — 2026-10-06
혼자 방 금지 선택 버튼: 제안 즉시 확정 후 proposal:null이 되어도 select 모드 sync는 창을 닫지 않던 원인 수정. 버튼 성공 후 제안이 없으면 returnToRoom, 투표 대기 제안은 기존 sync 유지. 실제 RoomService+CharacterBanUI 버튼 핸들러로 금지 반영/제안 해제/창 복귀 회귀 추가. 지오핀 난이도5→4. 전체195회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 미검증.
대상: CharacterBanUI/geopin.js/test-gameplay-fixes 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.80 — 2026-10-06
방 설정 항목을2열 grid로 배치(width최대760/94vw). 게임 모드는 닉네임 표시 설정과 동일 duels-display-cycle-button 버튼으로 현재 일반전/증강전 표시·클릭 시 순환 변경. 호스트만 조작·클라이언트 설정 반영 유지. 기존 개별 모드 탭 대신 공통 순환 버튼 사용. 전체195회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/RoomUI/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.81 — 2026-10-06
일반전 최초 캐릭터 선택 완료 후 증강 없는 게임 준비 화면 표시·호스트가 모든 참가자를 준비 처리해 즉시 카운트다운, 추가 준비 클릭 없음. 일반전 카운트다운 상대 증강 미선택 결과 영역 숨김. 모드별 요구승리/캐릭터수/증강수 및 마지막 모드를 duels-room-settings-v1 localStorage에 저장, 전환 전에 현재값 저장/대상모드 복원·방 reset/탭 재개설 복원. 일반전 신규 기본캐릭터15/증강전7, 기존 저장값 우선. 모드 전환·fresh VM 저장소 복원·일반15·자동카운트다운 검사 포함 전체196회귀·빌드/구문/docs/check/verify 통과. 실제 브라우저/온라인 미검증.
대상: RoomService/OnlineDuelService/test-gameplay-fixes 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.82 — 2026-10-06
방 설정 2열 전환 후 캐릭터 금지 버튼이 기존 52px 행 밖으로 넘쳐 아래 방 정보와 겹치던 문제 수정. 금지 행은 제목/요약과 버튼 줄을 grid로 나누어 실제 내용 높이를 확보, 버튼은 줄바꿈 가능한 flex로 칸 안 배치. 설정 grid의 flex 축소 차단, 기존 행 원본 폭/간격을 2열에 맞게 수정하고 중복 하단 덮어쓰기 제거. 모드 버튼의 오래된 flex 탭 CSS 제거·공통 순환 버튼 가운데 정렬. 일반전 증강 행은 hidden 속성 및 명시 숨김 CSS로 display:flex!important보다 우선 처리. 기존196 회귀 통과·빌드/구문/docs/check/verify 통과. 첨부 사진 확인; 실제 브라우저 시각 검증은 실행 파일 미설치로 수행 불가, 온라인 미검증.
대상: game.css/RoomUI 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.83 — 2026-10-06
캐릭터 금지 화면 showScreen이 숨김→표시로 전환될 때만 화면/목록 scrollTop0, 이미 열린 투표 상태 갱신은 스크롤 유지. 뉴 후면 swordSilhouette scale1.35→1.75(약30% 확대). 레이카 가호 스킬은 delivery.projectile delay220ms 후 targetPreview가 처음 생성되고 독자 하늘색을 쓰던 원인 수정. 성공한 gahoWeapon 직후 preview.create320ms로 즉시 표시, targetPreview 범위는 gahoSlam.range 참조/독자 스타일 제거. 공통 AttackPreviewService.fromTargetPoint가 입력 직후/비행 중 동일한 원과 기본 스타일을 재사용, Ability preview에 targetPoint 전달 및 기존 nearest-open/사거리 clamp 조건 반영. 공격 판정/발사/이동 타이밍은 유지. 신규 게임플레이 모듈/캐릭터 ID 실행 예외 없음. 실제 ability 데이터 포함3회귀 추가·전체199 및 빌드/구문/docs/check/verify 통과. 실제 브라우저 시각/온라인 미검증.
대상: CharacterBanUI/nyu/reika/AttackPreviewService/AbilityModuleService/ProjectileService/test-gameplay-fixes/test-geopin 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.84 — 2026-10-06
후속 첨부 사진에서 금지 버튼 넘침 지속 확인. 지난 수정이 놓친 debug.css의 더 구체적인 금지 행 height/min-height/max-height52px!important가 실제 원인. 해당 원본을 height:auto/max-height:none으로 수정하고 제목/요약+버튼2행 grid 및 버튼 wrap 규칙을 debug.css 한 곳으로 통합, game.css 중복 제거. 전체199 회귀 및 docs/check/verify·구문/빌드 통과. 실제 브라우저 시각 미검증.
대상: debug.css/game.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.85 — 2026-10-06
사용자 요청으로 캐릭터 금지의 없음/금지 인원수를 제목 바로 옆으로 이동. 기존 summary ID와 동적 갱신 유지, inline 및 왼쪽8px 간격 적용. 버튼은 아래 줄 유지. build/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/debug.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.86 — 2026-10-06
사용자 요구에 따라 금지 설정도 다른 설정과 같은52px 높이. 제목 바로 옆 요약과 버튼을 한 줄 flex로 배치, 버튼9px/가로 padding6px/요약 간격6px로 두 열 칸 안 너비 확보. 기존2줄 배치 제거. build/docs/check/verify 통과. 실제 브라우저 시각 미검증.
대상: debug.css 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.87 — 2026-10-06
라운드 준비 캐릭터 선택 안내를 미선택 시 현재 캐릭터 유지로 변경. 동작 변경 없음. build/docs/check/verify 및 runtime 구문 검사 통과.
대상: OnlineDuelService 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.88 — 2026-10-06
긴/짧은 사거리 정렬은 기존대로 평타 계열의 최대 공격 도달 범위(조건부 강화/차징 포함)를 기준으로 하되 숫자 AttackSpec.range를 무조건 공격으로 세던 구현 제거. 실제 delivery.area/hitscan/projectile/range-projectile, effect.damage, 이동 타격, formation.manifest로 공격 여부 판단. 착탄 및 벽 전달 후속 AttackSpec 재귀 추적·지속 피해 field 범위 포함·state.window 실제 발동 공격 참조·LMB action.trigger-attack 후속 포함. 순환 참조 보호. charge fullSpec은 병합된 실제 모듈로 평가해 피해 없는 차막이/이동/회복/장식 거리 제외. 차징/스케일 최대값은 해당 모듈 속성으로 적용, 중심 이동/반복 중심/중심형 사각 반길이 계산. 상대 대상이 아닌 회복 폭발 제외. 동적 적중 후 연쇄 사거리 증가는 최초 공격 도달 기준에 가산하지 않는다. 레이카230→276/라임126→170/하푸푸90→240/델트루브650→170, 테르디온970 등 기존 정상 착탄 사거리 유지. 신규9+기존199=208 회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증. 프레임 루프 변경 없이 카드 정렬 시 계산만 수정.
대상: CharacterSortService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.89 — 2026-10-06
긴/짧은 사거리 정렬은 게임 시작 무기·모드·진행도 기준. 레이카 가호 없는230, 반 스패너220, 지오핀 기본 고무탄650, 인투 권총650. 메라모나550/루리90/큐리150/레이즈120 초기 단계. 공통 ProgressStateService.ensure 및 TriggerConditionService의 상태 조건으로 초기 평타 선택, ProgressScaledAttackService.resolve로 초기 단계 범위 해석. 매칭된 대체 평타는 기본 공격을 대체하며 requireAttackId 후속은 선택된 공격만 포함. 거리/조준 등 공간 조건에 따른 기본 무기 분기는 유지. 기본 무기에서 가능한 일반 차징 최대 범위 및 폭발/실제 피해 도달 계산 유지. 기존 반격 전용 상태 추측 필터 제거. 캐릭터 ID 예외/전투 코드 변경 없음. 60명 실제 데이터 및 초기 무기/공간 조건/원본 무변경 포함12 사거리 회귀·기존199=211 전체 회귀 통과. build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저/온라인 미검증. 정렬 시 계산만 수정하여 프레임 루프 추가 없음.
대상: CharacterSortService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.90 — 2026-10-06
성장형·발명형 캐릭터 사거리 정렬은 초기/미성장 평타 기준 유지. 스타일의 사거리도 같은 basicRange와 공통 CHARACTER_RULES.ranges로 자동 분류. classification.range/rangeLabel 고정 표기 우선 제거하여 정렬과 표시 불일치 해소. 카드 카탈로그도 구형 combat.styleLabel보다 공통 스타일 해석 사용. 메라모나550 중거리/큐리150 초근거리/지오핀650 중거리/루리90 초근거리/레이카230 근거리/반220 근거리 확인. 성장/발명 후 무기 및 강화 범위는 초기 분류에 포함하지 않음. 실제 공격/성장 효과/일반 차징·폭발 포함 도달 계산 유지. 전체60명 표시 기준 및 카드 카탈로그2회귀 추가, 14+기존199=213 전체 검사 통과. build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저/온라인 미검증. 캐릭터 ID 실행 예외/신규 모듈 없음.
대상: CharacterSortService/CharacterCardDataService/test-character-range 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.91 — 2026-10-06
사용자 기준 보정: 게임 시작 직후 본인이 직접 조절 가능한 평타 범위는 최대, 차징은 최대 충전 범위. 성장/발명/가호/파괴 등 추가 조건으로 바뀌는 공격은 초기 상태 유지. progressScale을 무조건 초기 해석하던 원인 제거하여 기본은 최대 endpoint, 성장 데이터에만 rangeBasis:initial 명시(큐리/칸). 레이즈192 근거리/룰리522 중거리, 큐리150 초근거리/메라모나550 중거리/지오핀650 중거리. 인투 산탄총 대체에 rangeAvailableInitially:true로 직접 전환 무기도 비교, 반격 저격총은 제외. 같은 공통 분류를 정렬/스타일/카드에서 사용. 신규 모듈/캐릭터 ID 실행 예외/실제 전투 동작 변경 없음. 15 사거리+기존199=214회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: CharacterSortService/quri/kan/intu/test-character-range/CHARACTER CONTRACT 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.92 — 2026-10-06
도움말 CC기 목록의 기존 침묵(SILENCE) 항목 설명을 사용자 지정 문구 “이동을 제외한 모든 행동이 제한됩니다.”로 수정. 중복 항목 추가 없이 기존 색상/구조 유지. 전투 동작 변경 없음. build/docs/check/verify 및 침묵 항목1개·설명 문구 확인 통과. 실제 브라우저 시각 미검증.
대상: Duels.html 및 README/project.json/DIVIDE TASKS.

## 3.0.0-character.93 — 2026-10-06
도움말 침묵(SILENCE) 색상을 StatusPresentation.cc.silence의 실제 RGB190,170,225와 동일하게 수정. 설명은 “이동을 제외한 모든 행동이 제한됩니다.” 유지. 전투 동작 변경 없음. build/docs/check/verify 및 도움말/실제 색상 일치 검증 통과. 실제 브라우저 시각 미검증.
대상: Duels.html 및 README/project.json/DIVIDE TASKS.

## 3.0.0-character.94 — 2026-10-06
도움말 Space 회피 스테미나400 하드코딩 제거. data-help-dodge-cost 값 영역에 HelpTabs.open이 실제 GAME_DATA.dodge.cost 원본을 참조하여 표시. 현재300, 도움말 열기/탭 전환마다 최신 설정 갱신. 전투 비용 변경 없음. 실제 HelpTabs VM 실행으로300 표시 및 설정325 변경 후 재표시 확인, build/docs/check/verify/runtime 구문 검사 통과. 실제 브라우저 시각 미검증.
대상: Duels.html/HelpTabs 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.95 — 2026-10-06
훈련장 리셋이 setupSession만 호출하여 기존 설정/캐릭터/맵을 재사용하던 원인 수정. TRAINING_DEFAULT_SETTINGS 단일 원본으로 모든 훈련 설정 복원, start에서 기록한 초기 선택 캐릭터 복원, DebugMapService.set(training-tilemap)으로 맵/파괴 상태 초기화 후 기존 setupSession으로 증강/개체/봇/더미/투사체/장판/예약/자원 재생성. 패널/캐릭터 명령창 정리·카메라/HUD 초기화 및 훈련 버튼 재구축. 온라인 리셋 동작 유지. 실제 Training.reset VM 검사(설정/캐릭터/맵 초기화 순서·반복 리셋·온라인 격리), 기존214회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: Training 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.96 — 2026-10-06
사용자 정정: 훈련장 리셋은 현재 변경한 캐릭터를 유지하고 해당 캐릭터의 전투 상태만 재생성. 초기 입장 캐릭터 저장/복원 제거. 기본 설정/기본 맵/증강/봇/더미 초기화 유지. Training.reset 실제 VM 실행으로 현재 선택 유지 및 기본설정/맵 복원 확인·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: Training 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.97 — 2026-10-06
지오핀 고무탄6종(기본/충격/전이/과반동/정밀/폭발) delivery.projectile.radius18→15. 캐릭터 본체/기어/게이지/피해/사거리/탄속 유지. 기존 공통 투사체 표시 및 충돌 반경 원본 변경. 지오핀80회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: geopin/GEOPIN 문서 및 README/project.json/DIVIDE TASKS/runtime.

## 3.0.0-character.98 — 2026-10-06
- 요청: 샤베트 스킬 빙결 파괴 효과 추가.
- 변경: sherbet.js 대상 위치/얼음 파편 데이터, Training.js 공통 링 선택형 파편 렌더링, README/project/DIVIDE TASKS/runtime 갱신.
- 조건: 기존 before-hit freeze 검사 유지. 기존 링 위치 target(미지원)을 hit-target으로 수정.
- 검증: 전체 회귀·빌드/문서/구문 검사. 실제 브라우저/온라인 시각 미검증.

## 3.0.0-character.99 — 2026-10-06
- 요청: 샤베트 빙결 파괴를 기존 연출로 처리.
- Training.js 신규 파편 렌더러 제거, sherbet.js 파편 속성 제거. 기존 hitImpactRing 및 hit-target 사용. README/project/DIVIDE TASKS/runtime 갱신.
- build/docs/check/verify/runtime 구문 및 게임플레이 회귀 통과. 실제 화면 미검증.

## 3.0.0-character.100 — 2026-10-07
장판 대응 추진 도약기→과반동 발사기, 이동 정지 대응 기존 과반동→충격 도약기로 교체. 과반동 반동100→200/사거리650, 주먹 사거리200→240/피해150→250. 충격 도약기는 발동 위치 반경220에250피해 후 조준 반대 방향220/200ms 점프. 기존 delivery.area/trajectory.arc/movement.move 재사용. 저회 확정 이벤트에 justDodged 표식 전달하여 지속 장판 저회를 실제 피해0으로 제외하던 버그 수정. 일반 무적/일회성 장판 제외 유지. 투사체/범위/장판 실제 저회 이벤트·3회 발명 및 제자리 광역/후방 점프 각도 회귀 추가. 전체216회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 플레이 미검증.
대상: geopin.js, ReactiveEquipmentService, initialization-equipment, test-geopin, GEOPIN/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.101 — 2026-10-07
고회전 레이저→고회전 발사기: 일반 고무탄2발100ms 간격, 각150/사거리650/기본 탄속32.643/반경15/벽튕. 과반동 탄속32.643 통일. 충격 도약 피해 반경220→110(뒤 점프220 유지). 정밀 발사기/폭발형 발사기 이름 변경. 주먹→이중 충격기: 압력250/피해250/기존 넉백, 미적중 시 끝점에서400/150 고무탄 발사. 공통 progressive-rect damage.missAttackId와 delivery.projectile.origin point로 기존 TriggeredAttackService 및 패킷 재사용. 적중/방어 접촉/벽으로 차단된 원점/원격 중복 생성 제외. 저회 확정에서 ReactiveEquipmentService.justDodge 직접 호출·즉시 flush 및 cause.execution 공격/출처 복원·누락 impact는 실제 전달 모듈로 복원. 이전 늦은 이벤트 listener 제거. 기존 CC/트랩/상태DOT 제외 정책 유지. 전체220회귀·빌드/문서/구문 통과. 실제 브라우저/온라인 플레이 미검증.
대상: geopin/ReactiveEquipment/JustDodge/initialization-equipment/AttackModule/EffectSpawn/test-geopin/test-structure 및 README/GEOPIN/CHARACTER CONTRACT/project/DIVIDE TASKS/runtime.

## 3.0.0-character.102 — 2026-10-07
전이 고무탄 발사기→전이 발사기. geopin.js 발명 목록/설명2곳 수정. README/project/DIVIDE TASKS/runtime 갱신. build/docs/check/verify/runtime 구문 통과. 전투 동작 변경 없음.

## 3.0.0-character.103 — 2026-10-07
지오핀 고무탄8종의 벽 반사 탄속 배율0.65→0.5(튕길 때마다 현재 속도의50%). 공통 LMB 발명품 설명에서 기본 고무탄의150을 모든 무기의 피해처럼 표기하던 ({damage}) 제거. 무기별 WEAPON 피해 설명 유지. 지오핀86회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 미검증.
대상: geopin.js/test-geopin/GEOPIN/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.104 — 2026-10-07
지오핀 스킬/무기 설명 간결화. 반복된 저회 충전 안내를 발명 설명에 통합, 어색한 반동/압력 표현 및 일정거리 외/내 표현 정리, 기본 무기 전환 문장 축약. 거리 조건은 실제 reactiveEquipment 기준값 참조. 폭발형의 잘못된 근거리 폭발 문구를 실제 적중/사거리 끝 폭발로 수정. 조건·피해 참조·조작 구분 유지. 전투 동작 변경 없음. build/docs/check/verify/runtime 구문 통과.
대상: geopin.js/README/project/DIVIDE TASKS/runtime.

## 3.0.0-character.105 — 2026-10-07
지오핀 사용자 지정 tooltipSkills13개 반영, 발사기으로→발사기로 조사 교정. 공격 참조/비용 표시/조건/전투 동작 유지. geopin.js/README/project/DIVIDE TASKS/runtime 갱신. build/docs/check/verify/runtime 구문 통과.


## 3.0.0-character.106 — 2026-10-07
시로(siro) 토끼 궁수 추가: HP1100/매우빠름4.5/적색#f05c68/파워형 초장거리 저격수. 평타200/1200/화염4초, 차징500ms2발/1000ms3발 및150~450소모. 백드래프트1100/폭발350/반경140/넉백/화염. 반격300ms선딜 뒤350/500ms점프·정확한 최고점에서 저장된출발지로화살·착탄에반경150/3초/500ms100피해 화살비. 미지정수치는초안. 기존모듈조합+선택형 charge.pelletCount/movement.move.progressAttacks/trajectory.arc.startHeight 확장, 캐릭터ID실행분기·전용피해/네트워크/FX없음. 공식61명등록·역할/문서/검사갱신. 시로14+기존220=234회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 실전 미검증. 모듈/수치/테스트는 docs/SIRO.md.
대상: siro/index/CHARACTER_RULES, ChargedAttackService, MovementAbilityService, ArcTrajectoryService, test-siro/test-structure/test-character-range/test-terdion/verify, SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 공통 모듈 확장 이유·범용 책임·실제 값은 SIRO 문서에 기록.
화살 비의 각500ms 틱마다 화염4초를 갱신하며 첫 틱 이후 상태 효과가 막히지 않도록 rainTick은 oncePerExecution을 지정하지 않는다. 재타격 시 화염 재적용 회귀 포함.


## 3.0.0-character.107 — 2026-10-07
시로 평타 탄당100/일반 산탄(동일 적 다중 적중 가능), 스킬 폭발200. 차징400ms 2발/800ms 3발, 홀드 중 소모 없이 발사 시100/150/200(증강 비용 배율 적용), 단계 비용 부족 시 무소모 미발사 및 상태 정리. 단발/홀드 비용 설명 분리. previewProjectilePaths로 실제1/2/3발 경로·최신 조준을 즉시 표시. 반격 미리보기는 점프 사거리 대신 출발지 화살 비 반경150/벽 차단 원. 점프높이70→140/시간500→700ms, apexHold0.2로 최고점140ms 체류 후 하강·350ms에 출발지 화살 발사. 설정 체력 구분선 설명400 하드코딩 제거·실제 WorldHealthBarSegmentPresentationService.step(현재300) 참조. 기존 모듈 선택형 costStages/apexHold 확장, 새 모듈/캐릭터ID 실행 예외 없음. 전체239회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 시각 미검증.
대상: siro.js, ChargedAttackService, ArcTrajectoryService, DisplaySettings, Duels.html, test-siro, SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 공통 확장 이유와 실제 파라미터는 SIRO 문서. 브라우저 실전 검수는 미완료.


## 3.0.0-character.108 — 2026-10-07
시로 평타/차징 평타·스킬 폭발·반격 화살 비의 화염을 기존 status.apply.data.flat/interval로500ms당25(초당50)로 변경. burnTickDamage25/burnTickInterval500 원본을 모든 화염 모듈이 참조하며 다른 캐릭터의 공통 화염값은 유지. 평타 해제 비용 단발150/400ms2발250/800ms3발350. 홀드 중 무소모·발사 순간 단계 비용 및 설명 참조 유지. 시로20회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro.js/test-siro/SIRO/README/project/DIVIDE TASKS/runtime. 신규 모듈 및 공통 실행 기능 변경 없음.


## 3.0.0-character.109 — 2026-10-07
시로 차징 산탄각을 charge.spread 0→0.48rad로 연속 증가: 400ms1단계0.24rad,800ms2단계0.48rad. 실제 투사체와 미리보기는 동일 dynamicSpec 사용. 일반 클릭 및400ms미만은 미리보기 없음, 기존 previewAtFull로 진행도1부터 경로 표시. 백드래프트 비용500→400. 평타150/250/350·화염25/500ms 및 기존 피해/점프 유지. 기존 charge 보간의 선택형 spread 확장·새 모듈/캐릭터ID 예외 없음. 전체240회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 시각 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 선택형 spread는 기존 산탄 count 보간과 동일 경로로 적용하며 실제 발사/온라인 진행도 복원/미리보기의 값을 공유한다.


## 3.0.0-character.110 — 2026-10-07
시로 stats.difficulty4→1. 전투 수치/동작 변경 없음. siro/README/SIRO/project/DIVIDE TASKS/runtime 갱신. 데이터 값 및 build/docs/check/verify/runtime 구문 검사 통과.


## 3.0.0-character.111 — 2026-10-07
시로 차징 탄퍼짐을 연속 증가에서 단계별 고정으로 정정:400ms미만 단발/미리보기 없음,400~799ms2발/전체각0.24rad 고정,800ms이상3발/전체각0.48rad 고정. 기존 lerp의 선택형 steps2를 사용하여 같은 단계에서 실제 발사각/미리보기 폭 불변. 조준 방향 추적은 유지. 평타/스킬 투사체 사거리 모두800. 비용150/250/350 및스킬400·화염25/500ms 유지. 전체240회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 신규 모듈 없음.


## 3.0.0-character.112 — 2026-10-07
사용자 실화면 연속 확대 보고에 따라 시로 차징의 연속 pelletCount/spread 및steps 설정 제거. charge.stages의 고정 모듈 구성으로 단발1발/0rad,1단계2발/0.24rad,2단계3발/0.48rad 직접 선택.400/800ms에서만 구성 전환. 기존 fullSpec을 다단계 선택형 목록으로 확장·캐릭터ID 실행 분기 없음. 기존 .111 자동검사에서는 단계 고정이 확인되어 실화면 원인은 미재현; 화면 수정 성공을 단정하지 않음. 모든1ms진행점/실제발사/미리보기 포함 시로21·전체241회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 미검증.
대상: siro/ChargedAttackService/test-siro/SIRO/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime. 일반 클릭 미리보기 없음/평타·스킬800/기존 비용·피해 유지.


## 3.0.0-character.113 — 2026-10-07

요청: 시로 탄퍼짐 대폭 축소, 헤브 추가, 반격을 커다란 범위 투사체로 표현.

시로 1/2단계 산탄 전체각0.24/0.48→0.08/0.16rad(기존의1/3),400/800ms 고정 단계 유지. 헤브(hab) 대양의 선장 추가: HP1300/빠름4.25/고유 갈색#9a6848/조건형 중거리 암살자. 출혈 대상 직접 타격마다 최대 스테미나50% 회복·출혈 DOT/피해0 제외. 작살200/650, 관통 추진 작살250/650 및 넉백180. 반격은 적/벽 관통 대형 범위 투사체350/750/반경100. 반격 공통 CC 규칙에 따라 출혈4초 추가. 미지정 수치 초안은 docs/HAB.md. 기존 Trigger/resource.restore/status.apply/투사체/넉백/반격 모듈만 조합, 캐릭터ID 실행 분기·신규 모듈 없음. 공통 확정 피해 패킷에 피격 순간 활성 상태 목록을 전달하고 target.status-active는 해당 snapshot을 우선하여 첫 출혈 타격과 기존 출혈 타격의 온라인 회복 조건을 일치. 전체253회귀(헤브12/시로21) 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저 시각/두 기기 WebRTC 미검증.

변경 파일: src/data/characters/{siro,hab}.js, src/data/characters/index.json, src/data/CHARACTER_RULES.js, src/core/TriggerConditionService.js, src/network/NetworkHitAuthorityService.js, tools/test-{hab,siro,structure,character-range,terdion}.cjs, docs/{HAB,SIRO}.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.114 — 2026-10-07

요청: 출혈1초/회복35%, 반격 극저속·크기3배 이상.

헤브의 모든 공격 출혈 지속시간4000→1000ms(bleedDuration 단일 원본), 피의 발자취 최대 스테미나 회복50→35%. 반격 delivery.range-projectile 탄속16→2(기존의1/8,87.5% 감소), 반경100→300(직경200→600,가로/세로3배). 크기는 공통 렌더와 충돌이 같은 모듈 반경을 참조. 기존 사거리750/피해350/적·벽 관통 유지. 새 모듈·캐릭터ID 실행 예외 없음. 헤브12·구조22회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저 시각/온라인 실전 미검증.

변경 파일: src/data/characters/hab.js, tools/test-hab.cjs, docs/HAB.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.115 — 2026-10-07
헤브 평타 작살 스테미나 소모량150→250. AttackSpec.cost 단일 원본을 공통 소비/설명 경로가 참조한다. 순수 데이터 수치 변경이며 신규 모듈 없음. 헤브12회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 브라우저/온라인 실전 미검증.
대상: src/data/characters/hab.js, docs/HAB.md, README.md, PATCH LOG.md, project.json, DIVIDE TASKS.md, runtime.js.


## 3.0.0-character.116 — 2026-10-07

헤브 반격은 delivery.range-projectile.expireAtRange:false로 맵 경계까지 이동하고 rehitInterval1000으로 대상별1초 재타격. 출혈 모듈 제거·movement.neutralize-knockback(84/10)으로 교체. 출혈 중인 적에게 직접 피해를 줄 때 기존 hitImpactRing240ms를 대상 위치에 매 타격 표시·비출혈/DOT/피해0 제외. 인투 반격 저격총은 시간4초 대신 독립 progress 탄창4발(최초 반격 탄 포함)로 변경·일반 탄창 보존·4발 후 이전 권총/산탄총 복귀·RMB 강제 복귀 유지·저격 탄창4칸 하늘색. 레이카 검 평상시 표시·가호 시 #38bdf8 하늘색 및 광택/장식 강화·기존 회전 유지. 페이즈 저체력 강화 설명을 ALWAYS 불굴의 의지로 분리. 시로 활/헤브 작살은 기존 effect.spawn 월드 장식의 weaponSilhouette 스타일로 표시·mode.toggle 공격 모션 및 시로 charged-attack-state 시위 당김. 새 모듈 type/캐릭터ID 실행 예외 없음. 기존 CharacterTriggerEffectService에 effect.spawn 처리 및 ModeGearPresentationService에 범용 무기 스타일/팔레트/모션 옵션 확장. 전체265회귀 및 build/docs/check/verify/runtime 구문 통과. Canvas 무기 표시 확인, 실제 게임 브라우저/두 기기 WebRTC 미검증.
대상: characters/{hab,intu,phase,reika,siro}.js, CharacterTriggerEffectService.js, ModeGearPresentationService.js, tools/test-{hab,siro,geopin,hab-projectile,weapon-updates}.cjs, docs/{HAB,SIRO,WEAPON UPDATES}.md, README/PATCH LOG/project/DIVIDE TASKS/runtime.


## 3.0.0-character.117 — 2026-10-07

- 요청/이유: 월드 무기 디자인/모션 개선·단색 표현 통일·미래 모든 캐릭터 공용 제작 구조·레이카 비용 부족 미리보기·인투 재장전 반투명/탄창색/반격4발 누적.
- 결과: 검·활·작살·총·스패너·기어의 월드 무기 이미지를 effect.spawn renderType:weaponImage와 WEAPON_IMAGE_DEFS 목록으로 통합. 단색 면과 동일 색 계열의 밝은 윤곽/내부선 사용. 레이카 대검 scale1.25→1.85, 가호 하늘색/회전/장식 유지. 시로 활 시위 당김 유지·차징 화살 제거·420ms 큰 발사/복원 모션, 헤브 작살480ms 투척/회수 모션. 공용 alphaVariants로 인투 재장전 동안 투명도28%, 종료 즉시 원복. 인투 별도4칸 저격 탄창 제거·기존12칸 탄창 전체 하늘색, 저격 발사도 일반 탄창1 소모. 반격마다 변환탄4발 추가(최초 반격 탄 포함)·누적·재장전 후 잔량 유지·RMB 강제복귀 시 폐기. ProgressStateService의 선택형 growMax로 유한 상한을 필요한 만큼 확장해 기존 JSON snapshot 재사용. 레이카 일반 RMB 선딜 미리보기에 requireResource:true, 공통 previewReady가 실제 증강/스테미나 할인/체력 대체 비용을 확인하고 부족하면 후속 잠금까지 중단. 캐릭터ID 실행 예외·새 gameplay 모듈 type 없음. 전체270회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 Canvas12개 상태 확인; 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 변경: src/data/WEAPON_IMAGE_DEFS.js; 7명 캐릭터(reika/nyu/siro/hab/intu/van/geopin); ModeGearPresentationService; VanWrenchDurabilityPresentationService; TrainingWorldDrawService; ProgressStateService; AttackService; AbilityModuleService; test-geopin/test-weapon-updates; docs/WEAPON IMAGE GUIDE, WEAPON UPDATES, HAB, SIRO; README/project.json/DIVIDE TASKS 및 생성 runtime.js.
- 기존 모듈: effect.spawn/Trigger 조건·mode.toggle·state.progress·state.window·gauge.segmented/colorVariants·preview.create. 기존 무기 렌더를 데이터 목록으로 일반화하고 중복 렌더 삭제; 별도 입력/피해/네트워크 시스템 없음. growMax는 고정4 상한으로 누적을 표현할 수 없어 명시 add에만 유한 용량 확장. 반투명 옵션은 미래 모든 무기의 재장전/비활성 상태에 재사용.
- 검증: 전체270회귀·Canvas12상태·build/docs/check/verify/runtime 구문. 실제 브라우저 및 두 기기 WebRTC 미검증. 훈련장 검수 권장: 레이카 부족/충분 비용과 가호 대검, 시로 차징/해제, 헤브 투척, 인투 연속 반격·12발 소모/재장전·RMB 복귀 및 상대 투명도, 반 파괴/복구·뉴 투척/귀환·지오핀 무기 교체.


## 3.0.0-character.118 — 2026-10-07

- 요청: 시로 활 날렵하게/반격 발사 추가 모션·기존 무기 원복/검 손잡이 완화·같은 계열 색 허용·인투 변환 탄환 수만큼 칸 색 변경.
- 결과: 시로 활을 폭이 좁고 끝이 뾰족한 날렵한 곡선으로 조정·차징 화살 미표시 유지. 반격 counterArrow 실제 발사(점프 최고점)에도 기존 mode.toggle siro-weapon-motion을 실행하여 점프 시작/화살 발사에 각각 모션. 인투 총3종·뉴/레이카 검·헤브 작살·반 양쪽 턱 스패너·지오핀 기어의 .116 형상/팔레트를 공용 WEAPON_IMAGE_DEFS에 복원. 뉴/레이카 손잡이 폭.23→.16·끝 장식62% 크기 및 낮은 대비, 레이카 확대1.85와 가호 하늘색 유지. 단색 강제 규칙 철회·같은 계열 명암/장식색 허용, 공용 weaponImage/모션/재장전 반투명 구조 유지. 인투 기존12칸 탄창은 남은 변환탄 수만큼만 앞쪽 활성 칸을 하늘색, 나머지는 기존 색. 반격4발 누적/실제발사1발 소비/재장전 잔량 유지/RMB 강제복귀 유지. gauge.segmented 공용 highlightCountRef/highlightColor를 추가하고 색 변형은 렌더 인자로 전달해 프레임마다 segment 배열을 복제하지 않음. 전체274회귀 및 build/docs/check/verify/runtime 구문 통과. 실제 Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 파일: WEAPON_IMAGE_DEFS/ModeGearPresentationService; characters/siro,reika,van,intu; WorldGaugeModuleService/SegmentedGaugePresentationService; test-siro/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,SIRO; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈/이유: 기존 effect.spawn weaponImage 데이터 형상을 복원·palette 경로 확장, 반격 후속 화살에 기존 mode.toggle after-attack 추가. 색상만 바꾸는 colorVariants는 실제 잔량별 칸을 표현할 수 없어 기존 gauge.segmented에 선택형 강조 개수/색을 확장. 별도 게임플레이/네트워크 모듈·캐릭터ID 분기 없음.
- 검증: 전체274회귀·탄창 실제 렌더0/1/3/7/20변환 및 발사 소모/색 우선순위/월드 연결, 시로 실제 MovementAbility 최고점 발사 모션/중복 방지/원격 시간 복원, Canvas12상태 및 build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.


## 3.0.0-character.119 — 2026-10-07

- 요청/결과: 헤브 피의 발자취 Trigger에 target.kind-not-in kinds:[summon,trainingBot]를 추가하여 출혈 소환수/훈련 봇 직접 타격의 스테미나 회복과 hitImpactRing 모두 제외. 플레이어/더미 회복35%·DOT/피해0 제외 정책 유지, 항시 설명에 소환수·봇 제외 명시. 사이엔 killRewardProgress의 절격 전용 attackIds 제한 제거·모든 공격의 적 처치에서 격 최대8 충전/절격 활성화. ALWAYS 격의 차이 설명을 “적 처치 또는 격 최대치 시 절격 활성화”로 변경하고 절격 설명의 처치 최대 충전 중복 문구 제거. 기존 CharacterKillProgressService/처치·온라인 확정 이벤트/ProgressState snapshot 재사용. 아군/자신/소환수 처치 제외와 기존 사망방지 치명타 처리 유지. 새 실행 모듈/캐릭터ID 분기 없음. 전체279회귀·build/docs/check/verify/runtime 구문 통과. 실제 브라우저/두 기기 WebRTC 미검증.
- 파일: characters/hab,cyien.js; TriggerConditionService.js; tools/test-hab,test-cyien,test-weapon-updates.cjs; docs/HAB,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: 헤브 기존 damage-dealt Trigger/target.status-active/impact.direct/resource.restore/effect.spawn 유지·target.kind-not-in 공통 대상 종류 조건으로 체인 전체 제외. 사이엔 기존 killRewardProgress/state.progress set-max와 entity-defeated/network-hit-confirmed를 사용하고 공격ID 제한만 제거. 새 피해/처치/네트워크 시스템 없음.
- 검증: 전체279회귀(사이엔5 신규). 헤브 제외 대상/플레이어/더미 및 권위 상태 snapshot·FX 제외. 사이엔 모든 AttackSpec 처치 이벤트,8 충전/절격 선택, 사용 뒤 재처치,자신/아군/소환수/사망 공격자 제외,온라인 원격 권위 제외/로컬 확정,JSON 상태 복원/설명 단일화. 실제 브라우저/두 기기 온라인 미검증.


## 3.0.0-character.120 — 2026-10-07

- 요청/결과: 장착 무기의 mode.toggle을 선행 예약의 after-attack 대신 실제 투사체 생성/범위 실행의 on-delivery로 이전. 공통 AttackModuleService.onDelivery와 실행 effectKey로 첫 실제 전달에서1회 모션·산탄/반복 중복 제외·선딜 취소/사망은 미발동. AreaAttackService.execute/ProjectileService.spawn 실제 전달 경로가 실행하며 기존 Counter/Ability 선딜/원격 commit/ModeState snapshot 사용. 직접 전달 없는 시로 반격 점프 시작은 after-attack 유지·최고점 화살은 실제 생성 시 추가 모션. 레이카 확대 시 선도 배율 증가하던 문제를 공용 외곽1.8px/내부1.35px 상한으로 수정·가호 glow10→5. 모든 윤곽을 캐릭터/무기색+흰색65%의 밝은 계열로 통일. 뉴/레이카 손잡이를 면이 있는 그립·4줄 감김·끝마개로 교체·기존 작은 끝 장식 제거. 헤브 작살은 사용자가 선호한117 형상을 복원 후 날/축 비율과 면 그립/5줄 감김 정리. 인투 변환탄 강조를 남은 활성 탄창의 오른쪽부터 채움(highlightFrom:right), 개수/누적/소모/재장전 유지. 전체282회귀·build/docs/check/verify/runtime 구문 통과. Canvas12상태 확인. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 대상: AttackModuleService/AreaAttackService/ProjectileService·ModeGearPresentationService/WEAPON_IMAGE_DEFS/SegmentedGaugePresentationService·characters(hab,siro,reika,intu,van,nyu)·test-weapon-updates/geopin/hab/siro·docs(WEAPON IMAGE GUIDE,WEAPON UPDATES,HAB,SIRO,CHARACTER CONTRACT)·README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: effect.spawn weaponImage/기존 mode.toggle에 실제 전달 on-delivery 옵션 확장. after-attack은 지연 Delivery 예약 직후이므로 실제 공격 시점을 표현하지 못했음. 공용 실제 생성/판정 hook과 execution effectKey로 기존 Trigger/ModeState snapshot 재사용·중복/취소 방지. 새 전용 실행/네트워크 시스템 없음. gauge.segmented의 highlightFrom:right는 기존 강조 개수에 방향만 추가.
- 검증: 전체282회귀·실제300ms 예약299/300 경계·취소/사망 미모션/skipWindup 즉시·실행당1회·최고점 후속/원격 시간축 기존회귀·오른쪽 활성 칸 강조순서·외곽1.8/내부1.35 제한/밝은선/면그립. 실제 Canvas12상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.


## 3.0.0-character.121 — 2026-10-07

- 요청/결과: 레이카 가호 전후 대검의 좌표/경로/장식을 동일하게 맞추고 태양 장식을 원판과4개의 짧은 빛살로 단순화. 가호 하늘색 계열 면/밝은선/glow5 유지·가호 전용 큰 원/검날 마름모 장식 제거. 헤브 평타/스킬의 기존 weapon-projectile kind에 실제 공용 anchor-cross style을 연결해 일반 탄환 fallback을 수정. 반경14/18·피해/출혈/탄속/사거리/관통 유지·연결선 없음. 인투 권총은 기존 모드 상태를 motionStateKey로 읽어 시로와 동일한420ms 반동/복원 모션·산탄총/저격총 반시계 회전과 재장전 투명도 유지. 스야 서리 대낫과 타우 교차 사슬낫2개/체인/추의 순수 형상을 WEAPON_IMAGE_DEFS에 추가·공용 weaponImage로 후면 표시. 실제 공격 on-delivery의 mode.toggle로 스야 평타/반격 및 타우 일반/충전평타/스킬/반격 회전·선딜 대기 미발동. 기존 모듈/ModeState/은신/전환효과/원격snapshot 재사용·캐릭터 전용 실행/그리기/네트워크 코드 없음.
- 원인: 헤브 presentation.kind만 지정하면 실제 렌더의 anchor-cross 스타일 분기로 들어가지 않고 일반 투사체 fallback을 사용했음. 두 공격에 기존 무기투사체 스타일 명시. 가호 전용 형상과 empowered 장식을 데이터에서 제거·색/글로우만 유지.
- 파일: WEAPON_IMAGE_DEFS.js; characters/reika,hab,intu,sya,tau.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,HAB; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조: 기존 effect.spawn weaponImage/형상목록·mode.toggle on-delivery·projectile.presentation anchor-cross·motionStateKey를 데이터로 조합. 새 실행 모듈/서비스/캐릭터ID분기 없음. 공격모듈 끝에 회전 추가해 기존 인덱스 참조 보존.
- 검증: 전체286회귀(무기25)·헤브 실제발사 스타일/수치/관통·레이카 가호 전후 실제렌더경로 동일/글로우·인투 반동/420ms복원/원격시간/다른총회전·스야/타우 실제전달당1회/원격복원/숨김/사망·9명 공용유한좌표·Canvas16상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 레이카 가호 전환 시 형상/글로우·헤브 평타/스킬 원/+투사체·인투 권총 반동/재장전/총교체·스야 은신과 반격선딜/대낫·타우 충전평타/추격/반격선딜/사슬낫.


## 3.0.0-character.122 — 2026-10-07

- 요청/결과: 마지막 정정에 따라 스야 낫은121의 날/막대 형상을 좌우반전·기울기 반전(angle+.25)하고 시계방향2π로 회전. 낫의 별도 그립/감김선 제거. 타우 날을 각진 등선/안쪽 절삭곡선으로 새로 설계·막대는 감김없이 단순화·사슬은 더 큰6링크/추. 합쳐진 crossed-chain-scythes를 제거하고 chain-scythe-left/right의 별도 worldEffectModules로 분리. 같은 실제공격1회 모드snapshot을 왼쪽-2π/오른쪽+2π로 각각 해석·각 이미지의 기준점에서 독립 회전. 반은 내구도0에서 small-wrench 후면 이미지·내구도1이상 큰 wrench. 초기800 fallback으로 생성 직후 중복/작은 무기 오표시 방지. 작은 스패너는 큰 것보다 작은 scale1.5/한쪽 턱·둥근 끝이며 lmbThrown 실제발사에 기존 on-delivery 회전 추가. 기존 은신/전환효과/밝은윤곽/원격모드/내구도 복제를 그대로 사용. 새 실행서비스/렌더분기/모듈type 없음.
- 정정 반영: 스야 최초의 반시계 지시는 마지막 좌우반전/시계방향 지시로 대체. 스야 날을 추가 재설계하지 않음. 타우만 날 형상 재설계.
- 파일: WEAPON_IMAGE_DEFS; characters/sya,tau,van; tools/test-weapon-updates,test-geopin; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 모듈: 기존 weaponImage/rotationRadians/조건식·mode.toggle on-delivery·ModeState 및 ProgressState snapshot. 타우 개별회전은 config2개이며 상태/타이머는 하나. 작은스패너는 기존내구도만참조·전투수치/피해/수리판정 유지.
- 검증: 전체289회귀(무기28)·스야반전/시계회전·타우회전각부호반대/별개Canvas호출/원격일치·반 초기800/799/1/0/복구800 상호배타/작은평타1회모션/원격내구도와모드복원·Canvas19상태·build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 평타/반격시계·타우 평타/강화평타/스킬/반격의각각반대회전·반파괴/투척5타복구/은신 및 상대화면전환.


## 3.0.0-character.123 — 2026-10-07

- 요청/결과: 타우의 늘어진 사슬/추를 제거하고 손잡이에5회 감긴 사슬 형태로 교체·각 낫 반대방향 독립회전 유지. 스야는 서리 결정이 솟은 각진 등선·큰 곡선 절삭날·청색 얼음 면/결정 축/끝장식으로 대낫 재설계·감긴 그립 없음·오른쪽 날/시계회전 유지. 반 작은스패너 scale1.5→2(33.3% 확대), 큰스패너2.73 유지. 로온 후면 melon-slice/melon-slush 공용형상 추가·field.exists activeOnly:true로 실제4초 빙수지대 중 빙수·없음/효과종료/afterlife/rewardOnly에서 조각멜론·기존5초 잔류 스킬차단 조건은 유지. 기존 mode.toggle on-delivery로 실제 평타/스킬/반격 투척 모션. 모든 장착무기는 죽기직전 종류/회전/차징/투명도를 캡처하고 사망점에160ms 유지 뒤1600ms 선형 페이드. HealthService는 실제 사망/상태리셋 전에 캡처·Presentation.deathLaunch의 실제사망/온라인confirmed에서만 표시·부활대체 연출 제외. 원격은 마지막 실제표시 샘플 사용·미노출 알파0 무기는 미표시. ModeGearPresentationService 공용 prepass가 죽은본체/UI 없이 무기만 그리고 만료삭제·중복확정 미재시작·새사망 교체·EffectSpawnService.clearAll에서 전체정리. 잔류샘플은 독립 최소 Entity/고정pose이며 게임상태/네트워크를 새로 만들지 않음. 페이드 시 글로우 알파도 감소해 그림자가 남는 문제 방지.
- 파일: WEAPON_IMAGE_DEFS; characters/van,roon; ModeGearPresentationService/HealthService/Presentation/EffectSpawnService/Training/TriggerConditionService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조/이유: 기존effect.spawn weaponImage/형상목록·mode.toggle on-delivery·field.exists사용. 실제로보이는4초와복구/보상잔류5초를구별할activeOnly선택옵션확장. 사망시상태리셋으로가호/총/차징각도가없어지므로공통렌더표본을고정해사용·KO확정흐름과clearAll수명주기재사용. 살아있는이미지렌더/전투판정/입력제약변경없음·캐릭터ID실행분기/전용네트워크패킷없음.
- 검증: 전체294회귀(무기33)·로온실제필드3999/4000ms와기존5초조건·실제치명타상태리셋전캡처/KO연결·가호/회전/원격재장전알파보존·무기만고정렌더/160+1600페이드/만료/중복/새사망/공용clearAll·미노출0/부활대체제외·Canvas24상태/글로우동시페이드·build/docs/check/verify/runtime구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우손잡이사슬/별개회전·스야서리대낫·반파괴작은무기확대·로온지대4초전환·각무기의일반/가호/장착/은신/재장전상태사망 및 온라인확정/라운드리셋.


## 3.0.0-character.124 — 2026-10-07

- 요청/결과: 타우의 왼쪽 낫은 시계방향(+2π), 오른쪽 낫은 반시계방향(-2π)으로 반전. 각 낫의 독립 기준점/실제 공격 시점/공유 모드 snapshot은 유지한다. 낫날을 연속 곡선의 초승달 절삭날과 안쪽 면으로 재설계하고, 손잡이 목 아래부터 끝마개까지11개의 대각선 사슬 링크를 감았다. 로온 조각 멜론의 껍질/과육/씨앗과 윤곽 기준색만 짙은 녹색/올리브 계열로 변경해 밝은 캐릭터 본체와 구별한다. 멜론 빙수 이미지·캐릭터 색·전투 수치·장판 전환·사망 페이드는 유지한다.
- 파일: src/data/WEAPON_IMAGE_DEFS.js; src/data/characters/tau.js,roon.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE.md,WEAPON UPDATES.md; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 구조: 기존 순수 형상/weaponImage 색/rotationRadians 설정 조합. 실행 서비스나 캐릭터별 렌더 분기 추가 없음.
- 검증: 전체294회귀(무기33), 로컬/원격 회전 방향 대칭 및 두 이미지 실제 drawBehind, 공용 Canvas24상태, 이전123과 소스 비교로 타우/로온 외 캐릭터 및 멜론빙수 불변 확인. build/docs/check/verify/runtime 구문. 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우 평타/스킬/반격 독립회전과 손잡이 사슬, 로온 조각 멜론 대비 및 빙수 전환.


## 3.0.0-character.125 — 2026-10-07

- 요청/결과: 샤베트 후면에6방향 눈결정 snow-crystal 추가. 평소 반투명48%, 실제 평타/분쇄/반격 공격 시60도 회전하며 선명해진 뒤 복원. 평타 윈도 시작에는 모션이 없고 실제 progressRect가 생성되는 normal/frozen 해결 시 after-attack으로 시작한다. 실제 빙결 부여 성공에는 기존 contractingPullRing 하늘색 수축 링300ms, 피격 직전 빙결된 적에게 매 타격 시 hitImpactRing 밝은 확산 링190ms. 기존 분쇄 빙결해제 링300ms는 유지하며 상대에게도 표시한다. 슈비 electronic-shotgun 형상은 각진 에너지 셀/상하 레일/두꺼운 총구/하부 전원부와 붉은 계열 면·밝은 윤곽. 실제 평타/반동샷/반격 발사 시 공통420ms 반동/복원·산탄은 공격당1회. 기존 무기와 같은 은신/원격 모드 복원/사망 페이드 경로를 사용한다. 피해/CC 지속시간/스테미나/사거리/탄속/판정 변경 없음.
- 구조/이유: 공용 effect.spawn presentationAuthority:target은 피격자 시뮬레이션 권위에서만 생성하고 기존 effect-spawn 패킷을 피격자 ID로 복제한다. 기본 공격자 권위는 그대로다. status.apply onAppliedEffects는 실제 apply 성공 뒤 기존 effect.spawn만 실행하므로 거절된 CC/미적중/회피에서는 빙결 성공 연출이 없다. 공격자/관전자 미러는 중복 생성하지 않는다. target.status-active-before-hit 공용 조건으로 분쇄가 상태를 지운 뒤에도 해당 타격의 빙결 타격 연출을 유지한다. 캐릭터 ID 분기/새 모듈 type/전용 렌더/새 네트워크 패킷 없음.
- 파일: src/data/WEAPON_IMAGE_DEFS.js; src/data/characters/sherbet.js,shubi.js; src/combat/AttackModuleService.js; tools/test-weapon-updates.cjs; docs/WEAPON IMAGE GUIDE.md,WEAPON UPDATES.md,CHARACTER CONTRACT.md; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체299회귀(무기38), 실제 공용 Canvas28상태 렌더, 빙결 성공/실패·피격 전 상태·분쇄 후 해제·두 대상/매 타격·온라인 피격자 권위와 replay/공격자 효과 불변·산탄1회 모션/원격 복원·build/docs/check/verify/runtime 구문. 실제 게임 브라우저 및 두 기기 WebRTC 미검증.
- 플레이검수: 샤베트 평타 윈도 대기/일반/과냉각·분쇄 빙결해제·반격 여러 적 빙결/빙결 적 연타·상대 화면 링. 슈비 평타/우클릭/반격 산탄 모션·은신과 두 캐릭터 사망 무기 페이드.


## 3.0.0-character.126 — 2026-10-07

- 요청/결과: 타우 손잡이 대각 사슬11개→5개로 간격 확대·낫날을 단일 면의 각진 후크날로 재설계·왼쪽 반시계/오른쪽 시계로 다시 반전. 슈비는 개머리판/긴 레일 샷건에서 큰 슬라이드/총구·두꺼운 그립·트리거 가드·전자 패널이 있는 거대 권총형으로 변경하고 인투 산탄총처럼 실제발사 시 반시계1회 회전350ms. 장착 무기 기본 알파85→72%, 기존 개별 반투명/재장전 비율은 유지. 검/마검/작살의 긴 베벨선을 제거·눈결정 면을 한 색으로 통일·타우 광택 면 제거. 스야 서리대낫 형상/색/빙면은 그대로 유지한다. 샤베트 빙결적 타격 연출은 분쇄에만 남기고 링190→300ms/최대반경34→48. 빙결성공 수축 링 반경48→68/300→420ms/선3으로 보강. 빙결 부여 및 빙결 적 스킬 타격에 자기 무기 이미지가16% 확대되고 선명해졌다가500ms 안에 복원되는 공용반응 추가. 로온은 빙수 게이지 완성/반격으로 실제 빙결시킨 경우 같은 무기 반응. 헤브는 기존 피의발자취 유효 출혈타격마다 작살 무기 반응·기존 대상 링/회복 및 소환수/봇/DOT 제외 유지.
- 구조/이유: weaponImagePulse는 effect.spawn의 순수 시각효과로 target:source를 사용해 공격자 무기 ID를 targetEntityId에 보존한다. EffectSpawnService 생성/기존 effect-spawn 복원에서 ModeGearPresentationService.react가 짧은 시각 상태만 갱신하고 렌더가 확대/알파반응을 읽는다. 별도 전투 모드/캐릭터 ID 분기/네트워크 패킷 없음. 피격자 권위로 보낸 효과도 원래 공격자 ID를 유지하여 해당 무기만 반응한다. 상태 성공 onAppliedEffects 공용 경로를 state.progress.onFull에도 연결해 실제 CC 성공에서만 실행하며 status.apply 성공도 같은 함수 사용. 거절/미적중에는 무기 반응 없음. 시간만료/clearAll에서 정리. 기존 전투 수치/모듈 판정/CC시간 변경 없음.
- 샤베트 표시 보정: 이전 작은/짧은 피격 링만으로 눈결정 자체의 반응이 없었다. 이번에는 대상 링의 크기/수명을 보강하고 자기 무기 확대/선명도 반응을 함께 표시한다. 실제 진행형 EffectSpawnService 피해 경로에서 생성/복원/렌더까지 확인했으며 미검증 온라인 실기기의 원인을 단정하지 않는다.
- 파일: WEAPON_IMAGE_DEFS; characters/tau,shubi,sherbet,roon,hab; AttackModuleService/EffectSpawnService/ModeGearPresentationService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체301회귀(무기40), 공용 Canvas31상태, 실제 EffectSpawnService 진행형 평타→빙결→링/무기반응 생성·JSON 효과 복원/원래 공격자ID·확대 렌더/시간 만료/clearAll, 로온 게이지 완성 성공/실패, 헤브 출혈당 반응과 제외조건, 샤베트 스킬만 빙결타격 연출, 슈비 반시계 발사1회/원격, build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 타우 좌우회전/사슬간격·슈비 세공격 반시계·샤베트 과냉각/반격 빙결 및 분쇄 빙결타격·로온8스택/반격 빙결·헤브 출혈적 타격/봇 제외·상대화면 무기 반응.


## 3.0.0-character.127 — 2026-10-07

- 요청/결과: 슈비 전자식 거대권총을 둥근 후면/두꺼운 슬라이드·총구/곡선 그립/열린 트리거 가드/단순 전자 패널로 재설계. 기존 실제발사 반시계 회전 유지. 레이카 일반/가호 대검과 헤브 작살의 날 중앙선 복원: 이전 무광 정리에서 기능적인 중앙선까지 제거했던 것을 교정한다. 샤베트 눈결정 scale2.3→1.955(15% 축소), 빙결 성공/빙결된 적 분쇄 타격에서 기본 무기 확대 반응 대신 눈결정 표본이650ms 동안1→1.55배 퍼지고 알파가 줄어드는 잔향. 빙결 성공 contractingPullRing 점선 링 제거·분쇄의 기존 확산/해제 링은 유지. 루네프 후면 열린 spellbook 이미지·보라 계열 표지/페이지·중앙 책등·책갈피·글줄 추가. 실제 평타/연쇄/화염구/얼음/번개/반격 실행 시480ms 책이 떠오르고 기울어지며 공용 leaf 페이지가 넘어갔다 복원. 선택 윈도 대기와 후속 화염구 폭발은 책 모션 제외·반복 범위는 실행당1회.
- 구조: weaponImageEcho는 기존 effect.spawn 순수 시각효과. EffectSpawnService 생성과 기존 effect-spawn 복원에서 owner targetEntityId로 실제 장착무기의 종류/각도/pose/알파 표본을 캡처한다. 공용 ModeGearPresentationService.drawEchoes가 본체 뒤에 확대/페이드하고 기본 무기 크기는 바꾸지 않는다. 같은 Entity 표시/은신 알파 적용·최대8잔향/수명만료/clearAll 정리. 별도 전투 모드나 캐릭터 ID 분기/새 네트워크 패킷 없음. 책 leaf는 순수 형상 옵션이며 공용 pose.pulse로만 페이지 경로를 움직인다. 전투 수치/판정/CC 지속시간 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/sherbet,runef; EffectSpawnService/ModeGearPresentationService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체302회귀(무기41), 공용 Canvas33상태, 실제 진행형 평타 빙결→잔향 생성/점선 링 없음·확대와 알파감소/기본무기 크기 유지·JSON 효과 복원 ownerID·만료/clearAll, 루네프6공격 실제전달1회/원격/페이지 렌더·선택대기/후속폭발 제외·15%축소. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 샤베트 과냉각/반격 빙결·빙결적 분쇄에 잔향·점선 링 없음·15%축소. 슈비 디자인/회전. 레이카/헤브 중앙선. 루네프6공격 및 원격/은신/사망 책 이미지.


## 3.0.0-character.128 — 2026-10-07

- 요청/결과: 슈비를 각진 두꺼운 슬라이드/짧은 대형 총구·기울어진 면 그립·열린 트리거 가드·통합 전원 패널의 전자식 거대권총으로 재설계. 실제발사 반시계 회전 유지. 루네프는 실제 화염/얼음/번개/바람 실행 후600ms 책 전체를 해당 빨강/하늘색/노랑/초록 계열로 변경 후 복원. 선택 대기와 후속 폭발은 색 재발동 제외. 샤베트 빙결 평타/반격의 공통 피격 링 제거·스킬 분쇄의 기존 하늘색/밝은 링은 유지. 눈결정 잔향은 생성 위치·크기·각도·사용모션 표본에 고정되어 확대/페이드만 하며 이동/회전/크기 변경을 따라가지 않는다. 타우 스파크3충전 동안 양쪽 낫날에 짧은 전기선 점멸·소모 후 제거. 공용 기본 불투명도72→60%, 샤베트 평상시48→40%. 재장전 비율/사용 중 선명해지는 표시 유지.
- 구조: 공용 weaponImage activityColors는 mode.toggle on-delivery의 changedAt을 읽어 가장 최근 마법 색만 수명 내 적용. 기존 ModeState serialize/applyRemote 재사용·공용 tintedFill로 기존 명암을 유지해 해당 계열로 변환. sparkConditions는 기존 Trigger 조건 평가, WEAPON_IMAGE_DEFS.sparks는 순수 경로 목록. 사망/잔향 표본은 활성색/스파크까지 캡처. drawEchoes는 생성 좌표와 현재 좌표의 차이를 먼저 적용 후 표본 Entity/모션으로 렌더하여 생성점 고정. presentation.suppressHitImpactRing 옵션은 공통 피해 바인딩에서만 기본 피격 링을 제외·게임플레이 영향 없음. 캐릭터 ID 분기/새 전투 모듈/패킷 없음. 피해·CC·사거리·탄속·스테미나 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/sherbet,runef,tau; ModeGearPresentationService/TrainingPresentationBindings; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체306회귀(무기45), 공용 Canvas38상태 렌더 확인. 잔향 이동/회전/크기 변경 후 위치·표본 고정, 루네프4마법색600ms/최신색/원격/사망 표본, 타우2충전/3충전/소모/원격, 실제 damage-applied 바인딩의 빙결 링 제외/기존 링 유지. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비 디자인/실제발사 회전. 루네프4마법별 색/반복 번개에서1회/0.6초 복원. 샤베트 빙결 링 없음·이동 중 잔향 생성점 고정. 타우 풀충전/소모. 전체 기본 투명도·재장전/은신/사망 표시.


## 3.0.0-character.129 — 2026-10-07

- 요청/결과: 스야 서리대낫 날의 밝은 분할 면2개/연결선을 제거하고 단일 무광색 날로 변경·서리 외곽/축장식/회전 유지. 슈비는 짧고 넓은 전자총열·둥근 후면·원형 전원부·두꺼운 총구와 곡선 면 그립/열린 트리거가드로 새 거대권총 설계·기존 실제발사 반시계 회전 유지. 샤베트 빙결 시 빨간 확장 원의 실제 원인은 weaponImageEcho가 Training.fx 기본 fallback 빨간 원에 진입하는 경로였다. 전용 무기 renderer에서 이미 처리된 Echo/Pulse를 일반 FX그리기 루프에서 제외해 기본 원을 제거. 기존 피격 링 제외 옵션은 HitContactFeedbackService에도 연결하여 원격 contact 경로 일치. 타우3충전은 전기선/글로우 대신 두 낫을 노랑 계열로만 변경·소모 후 원래색 복원. 루네프4마법 책 색은200ms 유지 후400ms 면/윤곽 모두 원래색으로 페이드. 카논 정면 맨주먹 이미지 추가·두 RMB 스킬 실제 사용 후600ms 신발바닥으로 표시 후 주먹 복원·평타/반격 실제 전달에 공용 타격모션.
- 구조: 공용 activityTint는 state changedAt 기반 duration/fadeMs와 Trigger 조건 기반 지속색을 지원하며 mixColor로 기존 면색/마법 계열과 기본/활성 윤곽을 보간. 표본 tintAmount도 캡처해 잔향/사망 중간색 고정. 카논은 기존 mode.toggle on-delivery·state.window after-attack·state.exists/absent activeOnly:true·TimedActionState 원격복원 조합이며 캐릭터 전용 렌더/새 모듈/패킷 없음. 무기제어 Echo/Pulse는 일반 FX fallback을 사용하지 않고 기존 수명/복제/clearAll과 공용무기 렌더만 사용. 피해/CC/사거리/스테미나/탄속 변경 없음.
- 이전 수정 정정:128에서 기본 피격 링만 제외했으나 Echo/Pulse의 일반 FX fallback을 놓쳤다.129는 실제 Training FX 루프 재현 검사로 해당 빨간 원을 제거한다.
- 파일: WEAPON_IMAGE_DEFS; characters/runef,tau,kanon; ModeGearPresentationService/Training/HitContactFeedbackService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체309회귀(무기48), 공용 Canvas41상태 렌더 확인. 실제 Training FX루프 Echo/Pulse 원 미출력/기존 피격 링 유지, 실제 피해 바인딩+contact 빙결 링제외, 책200/400/600ms 면·윤곽 페이드/중간 사망색 캡처, 타우 노랑/소모/원격/전기선없음, 카논 두스킬599/600ms/연속갱신/원격/실패/공용형상. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 무광 날/슈비 전자권총·샤베트 빙결과 잔향에 빨간 원 없음·타우 완충 노랑/소모·책 색 페이드·카논 두 발차기600ms 신발바닥/주먹 복원/공격 모션.


## 3.0.0-character.130 — 2026-10-07

- 요청/결과: 슈비를 직선/모따기 위주의 계단형 총열·각진 두꺼운 총구/프레임·기울어진 면 그립·사각 전원부로 재설계·원형 패널/곡선 몸통 제거. 카논 정면 주먹은 높이가 다른4손가락 마디·접힌 손가락선·옆 엄지·좁은 손목으로 재설계, 밑창은 둥근 발끝/좁아지는 중간/뒤꿈치·지그재그 접지패턴으로 재설계. 모든 실제 공격에420ms/28% 확장의 작은 무기 잔향·스킬은 신발표본·생성점 고정/공용만료/기본 빨간 원 없음. 루네프 노랑색은 첫발만 반응하던 것을 실제 낙뢰3회 각각에서 다시 시작하며200ms 유지/400ms 색복원 페이드 유지. 스야 날의 기능적인 중앙 연결선 복원·무광 단일날 색/서리외곽/회전 유지.
- 구조: mode.toggle when:on-delivery everyDelivery:true는 각 실제 범위/투사체 전달마다 해당 모드의 changedAt/turns를 갱신한다. 미지정은 기존 실행당1회·산탄/반복 중복 제외 동작 유지. 루네프 번개색 상태에만 적용하고 책 사용모션은1회 유지·기존 ModeState 원격복원/색페이드 재사용. 카논은 effect.spawn weaponImageEcho after-attack을 기존 공격 성공 경로에 조합·state.window600ms 후 신발/주먹과 해당표본 자동선택. 기존 무기 잔향 위치고정/은신/복제/만료/clearAll 경로 재사용·새 캐릭터 ID 분기/모듈/네트워크 패킷 없음. 전투 수치/판정 변경 없음.
- 이전 수정 정정:129의 스야 무광 처리에서 기능적인 중앙 연결선까지 제거했던 것을 복원한다. 밝은 분할 면 제거는 유지한다.
- 파일: WEAPON_IMAGE_DEFS; characters/runef,kanon; AttackModuleService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체311회귀(무기50), 공용 Canvas43상태 렌더 확인. 실제 공용 범위공격 스케줄로0/350/700ms 낙뢰 각각의 책색 재반응/모션1회/3전달/원격/페이드종료, 카논6공격 주먹/신발 잔향표본·생성점 고정/JSON복원·기본FX원없음, 스야 중앙선/단일면과 기존 회귀. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 스야 중앙선/무광날·슈비 각진권총/발사회전·카논 주먹/밑창·평타/두발차기/반격의 작은고정잔향·루네프 낙뢰3회 책색 재반응/페이드.


## 3.0.0-character.131 — 2026-10-07

- 요청/결과: 슈비는 두 갈래 가속 총구/레일과 짧은 후방 프레임을 가진 전자식 산탄포로 실루엣 변경·발사 회전 유지. 카논은 정면 건틀릿과 굵은 접지 패널이 있는 전투화 밑창으로 새 설계·기존600ms신발/공격 고정잔향 유지. 뉴 마검 날 중앙 세로선 복원. 시로 flashAfterFirstLayer 옵션을 실제 게이지 렌더와 공용 링 공간계산에 연결해400ms 첫 단계부터 점선링·800ms 두번째 단계 색으로 전환. 클레아 후면에 두꺼운 단일면 초승달 추가·달 그림자 활성 중 하늘색 계열로 변화·만료/중도종료 즉시 복원·평타는 실제발사당 회전1회/쌍탄 중복제외·반격은 실제 이동공격 시작 시 회전·스킬은 색만 변화.
- 구조: ChargedAttackService.flashReady/hasChargeFlash가 gauge.layers/flashAfterFirstLayer/maxChargeFlash를 기준으로 점선링 표시 임계값을 결정하며 EntityRingLayoutService가 동일 판정을 사용한다. 기존 isFull은 완전충전 의미 유지. 공용 weaponImage moon-crescent 형상과 state.exists activeOnly activityColors/기존ModeState 회전만 조합·클레아 스킬 지속시간을 복사하지 않고 실제 달 그림자 상태를 참조. 원격 상태/은신/사망페이드/60% 기본알파 재사용. 새로운 캐릭터 전용 렌더/전투모듈/네트워크패킷 없음·전투 수치 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/clea; ChargedAttackService/EntityRingLayoutService; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체313회귀(무기52), 공용 Canvas45상태 렌더 확인. 시로399/400/600/800ms 실제 점선그리기·첫단계 공간확보/완전충전판정 유지, 클레아 실제스킬 상태/5000ms 종료/중도해제/원격 색·평타/쌍탄1회 회전·공용형상, 기존 회귀. build/docs/check/verify/runtime 구문. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비/카논 신규 실루엣과 회전/잔향·뉴 중앙선·시로1단계 링/반격활성 링 간격·클레아 초승달/스킬색/종료/평타/반격 회전.


## 3.0.0-character.132 — 2026-10-07

- 요청/결과: 슈비를 단일 넓은 총구·두꺼운 상부프레임·면 그립/열린 트리거가드·작은 전자패널의 권총형 전자식 샷건으로 변경. 두갈래 산탄포 형상 제거·기존 실제발사 회전 유지. 카논 worldEffectModules/6공격의 무기모션/신발600ms표시상태/잔향 및 미사용 주먹·밑창 공용형상 제거. 뉴 중앙선을131의 직선에서125 파일의 원래 꺾인 경로 M(0,-2.8)→(-.13,-1.7)→(.12,-1.05)→(0,.48)와 선설정으로 복원. 기존 전투 수치/모듈판정 변경 없음.
- 구조: 캐릭터 순수무기 데이터와 공용형상만 수정. 카논의 표시 전용 mode.toggle/state.window/weaponImageEcho만 제거하고 제자리회피/타격/기절/이동 모듈 유지. 뉴 선은 저장된125 배포 형상에서 직접 복원하며 새 좌표를 추정하지 않는다. 기존 무기 투명도/은신/원격/사망페이드 경로 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/kanon; tools/test-weapon-updates; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT; README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 무기51·구조22 회귀, 공용 Canvas45상태(카논 이미지 없음) 렌더 확인. 카논 표시모듈/형상/실제렌더 없음·원본 전투데이터 보존·뉴 원래선 동일 비교. build/docs/check/verify/runtime 구문·압축548항목 무결성. 실제 게임 브라우저/두 기기 WebRTC 미검증.
- 플레이검수: 슈비 권총형 전자샷건·카논 무기/잔향 없음·뉴 원래 꺾인 중앙선.


## 3.0.0-character.133 — 2026-10-07

- 요청/결과: 카논 평타 설명의 넉백 문구 제거. 카논 기본 무기 불투명도20%, 제자리 회피 성립 시650ms 고정 위치 확장/페이드 잔향(캡처 불투명도80%). 이동회피 중 정지 보정도 한 번만 반응. 슈비 권총형 전자샷건 외곽/그립/트리거가드 각도 보강. 클레아 초승달 내측 곡선과 중앙 장착부 추가.
- 구조: 제자리 회피 공용 상태 서비스의 stoppedEffects 데이터로 연출을 생성하고 기존 effect-spawn 원격 복제 사용. 원격 소유자 중복 생성 방지. 잔향 imageAlpha 선택값은 캡처에만 적용하며 기본 무기와 기존 잔향 투명도 유지. 전투 수치 및 판정은 유지.
- 검증: 전체313 회귀(무기52·구조22) 통과. Canvas45상태 렌더 검수. 제자리회피/정지보정/중복방지/원격권한/고정위치/만료/기존잔향 회귀. build/docs/check/verify/runtime 구문 및 압축 무결성 검사. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 대상: 카논 제자리회피/이동회피 중 정지·슈비·클레아.


## 3.0.0-character.134 — 2026-10-07

- 요청/결과: 슈비 전자식 권총형 샷건의 계단형 프레임/전원부/큰 총구로 재설계. 카논 정면 주먹과 운동화 밑창을 새 윤곽/접지패널로 재설계·타격/발차기 모션 구분·20% 기본알파/제자리회피 잔향 유지. 클레아 두꺼운 초승달을 길게 휘어진 날/중앙 마운트로 재설계·스킬색/회전 유지. 큐리 3면과 각 면3×3격자가 보이는 큐브·공격/투척 시90도 회전. 리안 단순 방패·실제 공격/돌진/귀환 때 스윙. 엘린 유령 없을 때 본체20%, 소환 시60%·수호 방패/탐사 고글을 본체와 유령 모두에 표시·양쪽 칸수 모드게이지 제거·추가 모션 없음. 디라 프라이팬/식재료 얹은 프라이팬/접시 요리 세 상태를 실제 보유 상태에 연동·요리 우선·공격 모션. 메이실 큰 재단가위·실제 공격에서 두 날 여닫기·반격 투척 회전.
- 구조: 무기 형상은 WEAPON_IMAGE_DEFS의 순수 데이터. 공용 parts의 angle/pulseAngle/scaleX/scaleY/pivot를 동일 pose.pulse로 렌더해 가위 관절 움직임을 조합. ModeGearPresentationService.configs는 소환수에는 summonSpec.worldEffectModules만 사용해 본체 이미지 중복 상속을 막으며 conditionTarget:owner로 주인 모드 조건을 읽는다. 엘린 summon.active/inactive와 state.mode-is, 디라 CookingService.syncReady의 기존 state.exists/absent를 사용하며 별도 모드/수치 복제 없음. 모션은 기존 mode.toggle on-delivery/after-attack 조합·선딜 전/실패/미전달 중복을 피한다. 기존 은신/원격 상태/전환효과/사망페이드 공용 경로 유지. 전투 수치/모듈 인덱스/판정 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; ModeGearPresentationService; characters/kanon,quri,lian,elin,dira,maisil; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 전체318 회귀(무기57·구조22) 통과. 공용 Canvas24상태 렌더 검수. 큐브3면/경로유한·엘린 유령 유무20/60%/본체와유령 모드일치/원격/칸수제거/무모션·디라 식재료/요리/소비/원격·가위 양쪽 관절/실제공격1회/투척회전/원격·큐브/방패/프라이팬 실제전달 모션·기존 무기 회귀. build/docs/check/verify/runtime 구문·배포 압축 무결성. 실제 브라우저 플레이와 두 기기 WebRTC 미검증.
- 플레이 검수 대상: 슈비·카논 주먹/밑창·클레아·큐리·리안·엘린 모드/소환/해제·디라 식재료/음식·메이실 가위질/투척.


## 3.0.0-character.135 — 2026-10-07

- 요청/결과: 슈비 권총형 전자샷건은 방향성을 유지하며 길게 모따기한 상부 프레임/집중된 총구/전원부로 변경. 카논 주먹은 기존 실루엣을 다듬고 분리된 위쪽 물결 선 제거. 카논 주먹/밑창은 이동/회전 모션 제거·실제 공격에서120ms100% 불투명 후280ms 동안20%로 복원·제자리 회피 고정 잔향 유지. 클레아는 옆으로 누운 초승달 날의 양 끝/외곽/내측부터 새 형상으로 설계·기존 스킬색/회전 유지. 리안은 곡선 윗면/테두리/중앙 보강대가 있는 단순 방패, 엘린 탐사 고글은 둥근 렌즈/연결대/짧은 밴드로 변경. 메이실 가위 기본각도−0.6rad·기존 여닫기/투척 유지. 디라 요리는 접시 테두리/구운 메인/잎 가니시의 플레이팅으로 재설계·보유 시 정지·실제 사용에서만650ms45% 확대 고정 잔향. 큐리는 실제0~4단계에 섞임/흰 십자가/F2L/OLL/PLL 색상 패턴27칸을 표시.
- 구조: CFOP 단계별 큐브는54개 면 조각의 회전으로 물리적으로 유효한 색상을 만든 뒤 순수 WEAPON_IMAGE_DEFS 경로로 저장. 십자가는 흰 아래면을 보이도록 시점을 뒤집어 표시, F2L부터는 노란 윗면/초록 앞면/빨강 옆면. 기존 quri-cube-stage의 progress-gte/lt 조건으로 이미지 하나만 선택·원격 진행 상태 사용·사망/잔향은 선택 형상에 고정. imageAlpha의 activityStateKey는 기존 ModeState 전달 시점만 읽어 불투명도 복원. 공용 echo의 선택 imageConfig는 이미 소비한 요리 등 명시한 이미지 하나를 캡처하며 sampleImage로 일반무기 표본과 같은 경로 사용. effect-spawn은 imageConfig와 생성 좌표를 유지해 원격 수신 뒤 주인이 이동해도 원래 위치에 잔향을 생성. 음식 투사체/회복/식재료·스테미나/피해/CC/사거리/모듈 인덱스 및 다른 무기 형상 유지.
- 파일: WEAPON_IMAGE_DEFS; ModeGearPresentationService/EffectSpawnService; characters/kanon,quri,dira,maisil; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 전체321 회귀(무기60·구조22) 통과. 공용 Canvas20상태 렌더 검수. 카논6공격20/100/페이드/20%·위치/각도 고정·원격 불투명도; 큐리5단계27칸/흰십자가/아래2층/OLL윗면/PLL옆면/원격/표본고정; 디라 실제 음식 소비 이후에도 요리 단일잔향/정지모션/생성위치/원격복원/만료; 기존 회귀. build/docs/check/verify/runtime 구문·배포 파일 무결성. 실제 브라우저 플레이와 두 기기 WebRTC 미검증.
- 플레이 검수: 슈비·클레아·리안·엘린 고글·메이실 가위·카논 공격 알파/정지·디라 요리 사용·큐리0~4 단계.


## 3.0.0-character.136 — 2026-10-07

- 요청/결과: 메이실 재단가위 재설계/실제 치명타 잔향, 타우 강화 치명타 잔향/사선 평행 두 낫 배치, 로온 빙결 성공과 헤브 출혈타격 무기 확장반응을 고정 잔향으로 변경. 슈비134 권총형 전자샷건 복원 후 총구/프레임 접합과 열린 트리거가드 중첩 정리. 리안 돌진백업 개수 제한 제거/6초 보관 유지/300ms 재사용, 넓은 네모 에너지방패/평소24%·공격100%·방어 성공 하늘색·스킬 한바퀴. 카논 타격 스테미나 회복은 소환수/훈련봇 제외. 디라 요리는 보유 이미지 제거/실제 사용 후650ms 고정 잔향만. 큐리는 전부 보라 계열/완성 부분 밝기 강조·평타 잔향/공식 입력 미세모션/반격 한바퀴. 클레아 실제 원형 챠크람, 엘린 고글·수호방패 재설계.
- 공용 구조: 캐릭터 데이터와 공용 순수형상만 조합. 기존 weaponImageEcho/on-hit/onAppliedEffects/after-attack으로 적중·빙결·요리 사용에 연결하고 현재 위치 표본을 고정·확대/페이드·원격복제/은신/사망페이드 유지. PositionMemoryService는 maxCount:null만 무제한, 기존 유한 상한 및 시간만료 유지. 공용 방어 성공 onBlock.modes는 기존 ModeState만 변경·같은 공격 그룹 중복제외. 공식 inputMotion은 정상 처리된 입력에만 기존 ModeState 모션 연결·자연회복 타이머 보존·회피차단/원거리/네트워크재생 중복 제외. 카논 excludedTargetKinds 검사 후 실행당 회복표시로 봇 타격이 플레이어 회복을 소모하지 않음. 큐브 단계 조건/27칸 좌표는 유지하고 색상만 단일계열 밝기로 변경.
- 파일: WEAPON_IMAGE_DEFS; characters/maisil,tau,roon,hab,lian,kanon,dira,quri; PositionMemoryService; AbilityModuleService; AttackGuardService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기67 회귀 통과: 실제 치명타 적중/빙결 성공 및 거절/고정잔향과 원격복원/요리 소비 후 잔향·보유 이미지 없음/백업40개·역순소비·6초만료/카논 소환수·봇 다음 플레이어 적중/방어 성공 실제 훅·중복제외·원격색/공식 입력 허용·차단/큐브 단계표본. 공용 Canvas20상태 렌더 확인. 전체13개 회귀 스크립트 통과·build/docs/check/verify/runtime 구문 통과. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/타우 치명타, 로온 빙결, 헤브 출혈타격, 리안 회피 연속 후 백업/방어/스킬, 카논 플레이어와 봇 비교, 디라 요리사용, 큐리 공식/평타/반격, 슈비/클레아/엘린 디자인.


## 3.0.0-character.137 — 2026-10-07

- 요청/결과: 타우 두 낫 동일 형상/방향/반시계 회전·사선 포개기 유지·실제 치명타 잔향은 노랑 고정. 큐리2단계 F2L에서도 십자가 밝기 유지 및 이후 단계의 완성 부분 유지. 메이실 가위 긴 재단날/엄지·손가락 비대칭 열린 손잡이/공통 관절 재설계·기존 여닫기/투척 유지. 리안 넓은 에너지방패 세로18% 연장. 카논 일반/제자리/후속 평타 실행 시 잔류 신발 상태 해제·주먹 복원. 클레아 단일 넓은 초승달 날로 재설계·기존 스킬색/회전 유지. 엘린 평타 실제 체력 회복 성공 시 본체 고정 무기 잔향, 유령은 모든 실제 체력 회복 성공 시 자기 고정 무기 잔향.
- 공용구조: 공용 echo imageColor는 캡처 표본의 색/혼합비만 고정하고 기본 무기 색은 바꾸지 않음·effect-spawn 기존 복제에 옵션 전달. 카논은 기존 state.window operation:clear를 평타 after-attack에 조합. ResourceRestoreEffectService가 순수 onRestoredEffects를 HealthService에 전달하며 HealthService는 실제 restored>0에서만 해당 목록과 summonSpec.onHealedEffects를 공용 spawnAttackEffect로 실행. 피치유자 권위 presentationAuthority:target·기존 effect-spawn 복제·대상 위치 고정·은신/사망/수명 정리 재사용. 체력최대/회복배율0/원격 미러에는 새 잔향 없음. 캐릭터 ID 분기나 별도 렌더/패킷 없이 데이터로 연결. 전투 피해/사거리/스테미나/회복량 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/tau,kanon,elin; ModeGearPresentationService; EffectSpawnService; ResourceRestoreEffectService; HealthService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기73 회귀 통과: 동일 낫방향·치명잔향 노랑/기본색 분리·큐브1~4단계 십자가/완성부분 유지·신발 잔류 중3평타 주먹복귀/원격복원·실제 엘린 평타→유령200치유→양쪽 잔향·체력최대/회복배율0/원격 미러 제외·유령의 다른 치유 수신/잔향 위치고정/복제. 공용 Canvas20상태 렌더 검수. 전체13개 회귀 스크립트 통과·build/docs/check/verify/runtime 구문 및 압축 무결성 확인. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 타우 치명타/회전, 큐리2단계, 메이실 가위, 리안 방패, 카논 스킬 직후 평타, 클레아 초승달, 엘린 평타 아군치유/유령피치유.


## 3.0.0-character.138 — 2026-10-07

- 요청/결과: 메이실 가위 양 손잡이 간격 확대/관절 기본각과 여닫기 방향 교정·모든 모션 구간 비겹침. 클레아 닫힌 원형 외곽 복원·오른쪽으로 치우친 열린 내부로 두꺼운 초승달 절삭면 유지. 루뷰 후면에 큰 망치/못 교차 배치·실제 못 발사/올려치기에 망치 모션·스킬 망치 투사체가 나가 있는 동안 망치 이미지 숨김·못 유지·회수/돌진소비/제거 이후 복원.
- 공용구조: 공용 WEAPON_IMAGE_DEFS 순수 경로/관절과 weaponImage 설정만 조합. 루뷰 실제 primary-weapon 투사체 상태를 공용 projectile.absent 조건으로 참조·귀환까지 존재하면 숨김·원격 pending networkKey도 포함해 투사체 수신 전 표시 깜빡임 예방. projectile.exists/absent는 ProjectileStateService.get 및 기존 원격 상태키를 조회하며 캐릭터 ID 분기/새 패킷/전용 렌더 없음. 공용 전환효과/은신/죽음 페이드/원격 ModeState 모션 유지. 클레아 스킬색/공격회전과 메이실 치명타 잔향/투척 유지. 전투 수치/피해/판정은 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; characters/ruvu; TriggerConditionService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기76 회귀 및 전체13개 회귀 스크립트 통과. 루뷰 망치/못 교차·투척/귀환 숨김·회수 복원·원격 지연 연결 상태, 가위121개 모션 표본에서 손잡이 외곽 비겹침, 클레아 원형 외곽과 열린 내부 렌더 검수. Canvas20상태 렌더, build/docs/check/verify/runtime 구문/압축 무결성 확인. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실 평타/투척, 클레아 평타/달그림자, 루뷰 평타/투척/자동·수동귀환/망치돌진.


## 3.0.0-character.139 — 2026-10-07 KST

- 요청/결과: 전체 공용 무기 형상의 순수 origin 중심값과 기본 weaponImage x/y=0으로 캐릭터 중심에 정렬·소환수/요리 선택잔향 포함·타우 두 낫은 상대간격을 유지하며 그룹 중심0. 메이실 재단가위 넓어진 곡선날/서로 분리된 비대칭 손잡이 재설계·여닫기/치명잔향 유지. 클레아 빠른 연타도 매 공격당 한바퀴를 연속 완주하도록 회전 대기열·원격 동일. 루뷰 각진 합성 망치헤드/양쪽 충격캡/중앙 체결판/직선 그립으로 현대적 재설계·못/망치 길이 및 scale2 통일·투척시 망치숨김 유지. 하츠하츠 큰 붓 이미지 추가·실제 평타/반격 공격당 반시계 회전1회·산탄 중복 제외.
- 공용구조: 형상 origin은 순수 좌표2개로 기본실루엣 경계 중심을 나타내고 drawImage가 회전 전 원점으로 보정·움직임/잔향/사망표본은 같은 공용 경로. ModeState module.queueRotationMs 및 config.rotationMode:queued는 기존 turns에 미완주 회전을 누적·회전 시작점/출발 turns/바퀴당 시간은 기존 modeStates snapshot으로 직렬화·원격 복원. 다른 무기의 기존 ease-out 회전 유지. 캐릭터 ID 분기/새 네트워크패킷/전용렌더 없이 데이터+공용서비스 조합. 하츠 드래그 시작/취소에는 모션 없고 실제 전달에 on-delivery 모드만 적용. 전투 수치/피해/사거리/스테미나/기존 은신·전환·사망페이드 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/dira,elin,intu,kanon,lian,maisil,quri,ruvu,tau,clea,hatsuhats; ModeGearPresentationService; ModeStateService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기79 회귀 및 전체13개 회귀 스크립트 통과. 클레아100ms 간격3공격 연속각도/3바퀴완주/다음공격/원격 동일, 전체 형상 중심값 및 모든 기본 weaponImage 위치/소환수/타우 상대배치 중심, 루뷰 같은배율/하츠6산탄1회회전·반격 추가1회. 가위 전구간 비겹침/기존 치유·잔향·투척 회귀. Canvas20상태 렌더 검수·build/docs/check/verify/runtime 구문/압축 무결성. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/루뷰/하츠하츠, 클레아 연타와 증강 연사속도, 기존 전체무기 중심 위치·은신·사망 잔류.


## 3.0.0-character.140 — 2026-10-08 KST

- 요청/결과: 루뷰 평타/반격의 실제 공격에서 망치/못 함께 한바퀴 회전·기존 스윙 제거. 하츠하츠 평타/반격/실제 스킬 실행에서 붓 시계방향 회전·이전 방향 반전. 메이실 손잡이 같은 높이/크기 대칭배치·짧은 연결부/날/열린 고리 재설계·전구간 비겹침 유지. 클레아 회전대기열 기능/데이터/직렬화 제거·기존 공용 ease-out 회전으로 복원. 큐리 실제 공식 오입력에서만 붉은 무기색100ms 유지/450ms 원래색으로 페이드·반복오입력 재시작·원격 동일.
- 공용구조: 공용 ModeStateService를138 상태로 복원하고 무기 renderer의 queued 분기 제거·139 origin 중심 정렬은 유지. 루뷰 on-delivery 기존모드로 완전회전, 하츠 스킬 effectsOnly after-attack 기존모드 조합. FormulaSequence 결과 wrong:true에서만 순수 inputErrorMotion 모드를 갱신·기존 activityColors 상태색/페이드 사용·회피차단/정상입력/원거리 클릭 제외·자연회복 타이머 보존. 캐릭터 ID 분기/새 패킷/전용렌더 없음·전투 수치/판정 유지.
- 파일: WEAPON_IMAGE_DEFS; characters/ruvu,hatsuhats,clea,quri; ModeGearPresentationService; ModeStateService; AbilityModuleService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; docs/WEAPON IMAGE GUIDE,WEAPON UPDATES,CHARACTER CONTRACT.
- 검증: 무기82 회귀 및 전체13개 회귀 스크립트 통과. 루뷰 실제 전달2회/각무기2바퀴·하츠 스킬 실행 회전/시계방향·클레아 대기열 제거/이전각도/원격일치·큐리 실제 공식 정상/오입력 판정·빨강/중간페이드/550ms복원/반복/원격/회피차단 제외. 가위121표본 손잡이 비겹침·전체 중심/기존 잔향/치유/투척 유지. Canvas20상태 렌더·build/docs/check/verify/runtime 구문/압축무결성. 실제 브라우저 플레이 및 두 기기 WebRTC 미검증.
- 플레이 검수 권장: 메이실/루뷰/하츠하츠, 클레아 연타와 증강 연사속도, 기존 전체무기 중심 위치·은신·사망 잔류.


## 3.0.0-character.141 — 2026-10-08 KST

- 결과: 루뷰 못은 정지 유지하고 실제 공격 때 망치만 회전. 망치를 양면 타격부·결합부·두꺼운 그립으로 재설계. 메이실 기본각도를 바로잡아 두 손잡이 높이와 연결 위치 정렬. 공용 무기 면색/윤곽을 현재 캐릭터 색과 동기화하고 명암 유지. 로온 과육 및 기존 특수 상태색 유지. 베르 쌍권총·바주카포·초콜릿 폭탄 추가: 실제 발사 시 해당 형상으로 전환하고 150ms 선명 유지 후 400ms 페이드, 평소20% 투명도·무기별 반동/회전.
- 구조: 기존 weaponImage 순수 형상과 모드상태 조합. on-delivery에서 mode.set도 기존 실행중복 방지 경로로 처리. 선딜레이 이전에는 무기 전환/모션하지 않음. 공용 pathFill로 면색 명도와 캐릭터색을 조합하고 캐시가 현재 색 변화에 갱신. preservePalette는 의도된 과육색 보존. 캐릭터 ID 분기/새 네트워크 패킷 없음.
- 파일: characters/ruvu,maisil,roon,veleu; WEAPON_IMAGE_DEFS; AttackModuleService; ModeGearPresentationService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기84 회귀와 전체13개 스크립트, build/docs/check/verify/runtime 구문 및 ZIP 무결성 검사. Canvas 표본으로 손잡이/망치/베르3무기 확인. 실제 브라우저 조작과 두 기기 온라인 대전은 미검증.
- 실플레이 권장: 루뷰 평타/반격/망치 투척, 메이실 평타/가위 투척, 베르 세 공격과 반격 선딜레이, 캐릭터별 기본/특수 색과 은신/사망.


## 3.0.0-character.142 — 2026-10-08 KST

- 결과: 헤브 항시 설명에서 소환수·봇 제외 문구만 제거(효과 조건 유지). 클레아 원형 초승달 실루엣 유지·안쪽 곡선/작은 마름모 장식. 베르 쌍권총은 인투 권총 형상구조를 공유한 이중 배치, 바주카는 총구/후방 배기구/조준부/그립, 폭탄은 초콜릿 격자/포장지/심지로 재디자인. 실제 무기 사용800ms 뒤 쌍권총 복귀. 스킬 재사용 시350ms 노랑 반응(마지막250ms 페이드)·복귀 시간 재시작. 메이실 가위는 교차 날/중앙축/반대편 손잡이 연결 구조로 다시 설계·손잡이 비겹침.
- 구조: 기존 weaponImage/관절/형상/모드/activityColors 재사용. state.mode-is에 선택적인 expiresAfterMs/ageStateKey/expiredValue를 추가해 저장된 모드 타임스탬프를 기준으로 일시적인 표시조건 평가. 표시 만료는 상태를 변이하지 않으며 타이머/새 패킷/캐릭터 ID 분기 없음. 베르 rmbBoost 실제 after-attack에서 모드색/모션/표시시간 갱신. 기존 전투 수치와 헤브 회복 대상 제한 유지.
- 파일: characters/hab,veleu; WEAPON_IMAGE_DEFS; TriggerConditionService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기85 회귀 및 전체13개 회귀 스크립트 통과. 799/800ms 복귀 경계·재사용색/중간페이드/350ms복원·시간 재시작·원격 모드 직렬화 일치, 가위121표본 비겹침. Canvas20상태 시각 확인. build/docs/check/verify/runtime 구문/ZIP 무결성 확인. 실제 브라우저 플레이·두 기기 온라인 대전 미검증.
- 실플레이 권장: 메이실 가위 개폐/투척, 클레아 스킬 상태색, 베르 스킬 발사/재사용/800ms복귀/반격 선딜/연속 공격과 상대 화면.


## 3.0.0-character.143 — 2026-10-08 KST

- 결과: 타우/메이실 치명타 적중 무기 잔향 제거. 카논 강조 표시 총800ms(600ms선명+200ms페이드), 신발800ms; 베르 일시무기800ms 뒤 쌍권총 복귀와 공용 기준값으로 통일. 스야/타우 낫 origin을 손잡이 중앙으로 복원. 루뷰 망치를 비대칭 타격부/갈고리형 현대 망치로 재설계(못 유지). 베르 무기 기본알파100%, 권총/바주카 총구 우상단 및 반시계 반동, 겹친 쌍권총을 인투와 다른 단차 프레임/큰 총구/그립으로 재설계. 메이실 재단가위는 서로 다른 크기의 엄지/손가락 고리·연결부·곧은 절삭면·비대칭 기울임으로 재설계. 클레아는 원형외곽 안의 넓은 초승달날/안쪽 선/각인으로 재설계. 헤브 반격 피해350→100, 탄속2→3(50%상향).
- 구조: CHARACTER_RULES.weaponPresentation.transientMs를800으로 단일정의하고 카논/베르 root참조와 $ref/$scale로 연결. 전투기절600ms는 변경하지 않고 표시창만800ms. 타우/메이실 on-hit effect.spawn weaponImageEcho만 삭제·치명피해/스파크 노랑/회전 유지. 기존 공용 형상·origin·관절·alpha·모드 선택·타임스탬프/원격복원만 사용. 베르 스킬재사용 노랑350ms 유지. 헤브 관통/매초 재타격/무력화넉백 유지.
- 파일: characters/tau,maisil,kanon,veleu,hab; CHARACTER_RULES; WEAPON_IMAGE_DEFS; test-weapon-updates,test-hab; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기86회귀 및 전체13개 스크립트 통과. 실제 치명타 적중의 잔향/FX 미생성, 공용800ms/신발799·800ms복귀/기존원격, 베르 불투명도/방향, 가위121표본 비겹침, 헤브 공용 투사체 탄속/100피해 확인. Canvas20상태 시각 확인. build/docs/check/verify/runtime구문/압축무결성 확인. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 메이실/타우 치명타, 스야/타우 낫회전, 베르3무기/재사용/복귀, 카논 신발/평타복귀, 헤브 선체 피해·탄속, 루뷰 망치투척, 클레아 회전.


## 3.0.0-character.144 — 2026-10-08 KST

- 결과: 카논 주먹/밑창 상시 무기와 공격 모션/표시창 제거·제자리회피에서만 단일 회피흔적800ms 고정위치 확대/페이드 잔향. 루뷰 망치 시계→반시계 회전. 베르 권총을 짧은 슬라이드/사선그립/빈 방아쇠울/가늠자 형태로 재설계하고 3무기 origin을 형상중앙으로 복원. 가위 날의 절삭면 방향만 반전·손잡이/축/개폐 유지. 클레아 적중 달그림자 유지가 소환수/훈련봇을 제외(게이지 충전 유지). 타우 낫scale1.55→1.85(약19%확대). 슈비 평타는 완전회전 대신 인투권총식 반시계 짧은반동·스킬/반격은 기존 완전회전.
- 구조: 기존 stoppedEffects.weaponImageEcho의 명시적 imageConfig로 카논 평소 worldEffectModules 없이 단일회피 형상표본 캡처. 기본 반투명 무기 없음·실제 제자리회피/이동회피 정지보정1회/원격중복방지 기존공용 경로. 클레아 state.window on-hit에 기존 target.kind-not-in 조건 추가·거절은 실행효과를 소비하지 않아 같은공격의 뒤따른 플레이어적중 갱신가능. 슈비 평타용 motionStateKey 분리·스킬/반격 rotationStateKey 유지. 캐릭터전용 실행서비스/새패킷 없음.
- 파일: characters/kanon,ruvu,veleu,clea,tau,shubi; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기87회귀 및 전체13개 스크립트 통과. 카논 평소/일반공격 무기0개·제자리회피 단일표본/위치고정/800ms만료/원격 중복제외, 클레아 소환수/봇 후 같은실행 플레이어 갱신, 슈비 산탄1회/평타짧은반동/스킬반격회전/원격, 루뷰 반시계2회·가위121표본 비겹침·전체형상 좌표유한. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 카논 제자리/이동회피 정지보정 및 평상시무기없음, 클레아 소환수/봇/플레이어 유지차이, 슈비 평타/스킬/반격, 루뷰 망치반시계, 타우 확대, 베르3무기중앙/가위날.


## 3.0.0-character.145 — 2026-10-08 KST

- 결과: 엘린 반격 summon.swap-pulse의 수호모드 강제reset 제거·기존 모드 유지. 카논 회피흔적 이미지 평소에도 공용60%알파로 표시·제자리회피800ms 고정확대잔향 유지. 베르 자동권총을 경사진 슬라이드/배출구/사선그립/방아쇠울로 재설계·리볼버 아님. 메이실 날/연결부/손잡이를 다각형으로 각지게 재설계·기존 절삭면 방향 유지. 레비나 악마삼지창 공용이미지 추가·levina-spear 투척/귀환/원격지연 중 숨김·회수복원.
- 구조: 전투 코드 변경 없이 기존 캐릭터 데이터 조합. 엘린 resetMode만 제거하여 모드/위치교환/주변폭발 유지. 카논 worldEffectModules에 dodge-slip 1개 등록하고 회피잔향 명시적 imageConfig 유지. 레비나는 기존 projectile.absent 조건으로 투척 상태를 읽어 별도 타이머/변수/패킷 없음. 자동권총/각진가위/삼지창은 WEAPON_IMAGE_DEFS 순수 형상.
- 파일: characters/elin,kanon,levina; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기89회귀 및 전체13개 스크립트 통과. 엘린 실제 교환/수호·탐사 유지/원격모드복원, 카논 평소1개/일반공격 추가잔향없음/제자리회피800ms잔향, 레비나 투척·귀환·원격지연숨김/회수복원, 가위121표본 비겹침. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 엘린 탐사모드 반격 후 유지, 카논 기본이미지/회피잔향, 베르 자동권총/메이실 각진가위, 레비나 투척/귀환/회수 및 상대화면.


## 3.0.0-character.146 — 2026-10-08 KST

- 결과: 카논 평타/스킬/반격 실제 전달에서 회피이미지 시계 완전회전. 리안 기본 방패알파100%·평타/반격 시계/스킬 반시계 완전회전·방어 하늘색 유지. 레비나 삼지창 각도−0.3→−0.6rad. 베르 자동권총 프레임/그립/슬라이드/방아쇠울 다듬기. 프릴 빗자루 추가·평타1타시계/2타반시계/3타 헤브식 전방 찌르기·청소스킬 각 타격 생성 때 시계회전.
- 구조: 기존 weaponImage rotationStateKey/motionStateKey와 mode.toggle on-delivery/after-attack 조합. 공격 전달 모션은 기존 실행중복방지로 산탄/반복delivery1회. 프릴 청소 progressRect 생성과 동일 after-attack에서 각 rmbTick 별 spin증가·시작/종료 선택에서는 회전없음. 좌우회전은 같은 mode상태의 step±1, 찌르기는 별도 mode키. 새전용렌더/서비스/패킷없음.
- 파일: characters/kanon,lian,levina,prill; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기92회귀 및 전체13개 스크립트 통과. 카논3공격시계/중복제외, 리안알파1/방향, 프릴1·2타 회전/3타찌르기/스킬4타 회전/원격복원, 기존회귀. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 카논 평타/스킬/반격 회전, 리안 평타/스킬/반격방향, 프릴3타콤보/스킬매타회전, 베르 자동권총·레비나 기울임.


## 3.0.0-character.147 — 2026-10-08 KST

- 결과: 리안 회피연계 shieldDash 실제 실행에 시계완전회전 추가. 프릴 빗자루를 넓게 퍼지는 솔/묶음띠/구분된 솔끝으로 재디자인. 베르 평타는 실제 탄별 좌우 발사위치에 맞춰 뒤/앞 권총만 독립 반동·좌우좌=뒤앞뒤/우좌우=앞뒤앞·75ms복원으로80ms연사에서 모션겹침 방지.
- 구조: 공용 mode.toggle when:on-projectile-shot/perpendicularSide로 실제 spawn 후 해당측 상태만 갱신. 로컬 예약발사와 원격탄 재생이 기존 perpendicularOffset을 같은 공용spawn 입력으로 전달·새패킷 없음. 공용 weaponImage config.partMotions로 형상 parts별 모션 평가, sampleImage가 partPoses를 캡처하여 잔향/사망 표본에 고정. 베르 기존 공격당 전체권총모션 제거·공용 탄별실행과 모드원격복원 사용. 리안은 기존 after-attack mode.toggle 조합.
- 파일: characters/lian,veleu; WEAPON_IMAGE_DEFS; AttackModuleService/ProjectileService/SimulationScheduleService/OnlineDuelService/ModeGearPresentationService; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기94회귀 및 전체13개 스크립트 통과. 리안 회피평타 회전, 뒤앞뒤/앞뒤앞 실제 side분기/단일권총 활성/75ms복원/원격모드/캡처표본고정. Canvas20상태 시각확인·build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 리안 회피평타, 베르 연속평타 좌우좌/우좌우 개별반동 및 상대화면/사망잔류, 프릴 빗자루.


## 3.0.0-character.148 — 2026-10-08 KST

- 결과: 베르 평타 개별권총 반동시간75→150ms로2배 연장해 회복동작 완화. 실제발사 간격80ms/좌우발사순서/뒤앞매핑/회전각/이동량 유지. 두권총은 독립적으로 반동/회복하며 같은권총의 다음발사160ms 전 모션복원.
- 구조: 기존 config.partMotions.motionMs 데이터만150ms로 조정. 실제탄별모드/원격복원/표본고정과 전투수치 유지. 이전 권총 회복 중 다른 권총이 발사될 수 있어 급한 강제복원을 피함.
- 파일: characters/veleu; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기94회귀 및 전체13개 스크립트 통과. 뒤앞뒤/앞뒤앞 실제발사별 상태갱신/원격복원/150ms모션 표본고정. build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 베르 연속평타 좌우좌/우좌우 반동 회복동작 및 상대화면.


## 3.0.0-character.149 — 2026-10-08 KST

- 결과: 베르 개별권총 반동시간150→420ms로 인투권총과 통일. 코녕 후면무기에 마시멜로 하나가 꽂힌 거대한 꼬치 추가. 손잡이가 캐릭터중앙에 위치하고 기본 기울임0.5rad/배율1.9. 실제 평타/스킬 착탄범위 생성에서440ms 전방찌르기, 반격에서380ms시계한바퀴 휘두르기. 기존 캐릭터색/밝은윤곽/기본공용투명도 사용.
- 구조: WEAPON_IMAGE_DEFS marshmallow-skewer 순수형상과 기존 weaponImage/motionStateKey/rotationStateKey. lmb/rmbImpact/counter on-delivery mode.toggle로 실제공격모션·실행중복방지·선딜전 모션없음. 캐릭터전용렌더/새서비스/패킷 없음·기존전투수치/판정 유지.
- 파일: characters/konyeong; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기95회귀 및 전체13개 스크립트 통과. 코녕 실제평타/스킬전달2회/중복방지/찌르기/반격한바퀴/원격모드 복원, Canvas기본/찌르기 표본 시각확인. build/docs/check/verify/runtime구문/ZIP무결성. 실제 브라우저 조작·두기기 온라인대전 미검증.
- 실플레이 권장: 코녕 평타/스킬 선딜후찌르기/반격휘두르기·은신/사망무기잔류.


## 3.0.0-character.150 — 2026-10-08 KST

- 요청/결과: 코녕 거대 꼬치 재디자인. 마시멜로 하나를 넓고 둥근 원통형 윤곽/윗면 곡선으로 표현하고 꼬치가 마시멜로 면을 관통해 비쳐보이던 선 제거. 손잡이를 폭이 있는 다각형 그립과 두 구분선으로 변경.
- 구조: 공용 WEAPON_IMAGE_DEFS의 marshmallow-skewer 순수 형상만 수정. 기존 캐릭터색/밝은 윤곽/투명도/손잡이 중앙/실제 공격 찌르기와 반격회전 유지. 전투 수치와 판정 변경 없음.
- 파일: WEAPON_IMAGE_DEFS; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기95회귀 통과. 공용 Canvas 기본/찌르기 시각 확인. build/docs/check/verify/runtime구문/ZIP무결성 검사 통과. 실제 브라우저 및 두기기 온라인대전 미검증.
- 실플레이 권장: 코녕 기본 꼬치 실루엣/평타·스킬 찌르기/반격회전.


## 3.0.0-character.151 — 2026-10-08 KST

- 요청/결과: 메이실 가위 모션420→360ms. 25ms 짧은 준비 뒤72ms까지 급가속 절삭,108ms까지 닫힌 자세 유지 후360ms까지 복원. 전체 회전량0.16→0.23rad/전방이동0.3→0.4로 절삭 강조.
- 구조: 공용 weaponPose에 선택적 motionKeyframes(at/value/easing) 추가. 몸체와 가위 관절이 동일 pulse를 사용하며 미지정 무기는 기존 곡선 유지. 실제전달/실행중복방지/원격모드/잔향표본 그대로 사용. 디자인·피해·스테미나·연사속도·반격회전 유지.
- 파일: ModeGearPresentationService/characters/maisil/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과(무기96그룹). 메이실 급가속/닫힘유지/복원/실행중복/원격/표본고정 검사. Canvas 기본/절삭 렌더 확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 브라우저 및 두기기 대전 미검증.
- 실플레이 권장: 메이실 평타/치명타/스킬 가위개폐 및 연속공격.


## 3.0.0-character.152 — 2026-10-08 KST

- 요청/결과: 엘린 유령 재소환 체력의 오래된800 고정값을 최대체력1000 참조로 변경. 디라 음식 사용 후 투사체 크기/메타/자기섭취 anchored-arc520ms·높이96 설정을 로컬과 원격 모두 적용. 음식 소비/준비상태/dirty 갱신은 로컬 권위에서만 처리.
- 구조: 기존 summon respawnHealth 참조 및 cooking.meal-commit after-attack 공용 경로 사용. CookingService.commitMealThrow에서 시각적 투사체 구성과 로컬 자원변경의 권위 분리. 기존 duel-action targetEntityId/cookingMealCount와 scripted-projectile-arrived 로컬 회복 권위 재사용. 새패킷/캐릭터전용렌더 없음. 아군 음식투척은 기존 유도 경로 유지.
- 파일: characters/elin/CookingService/AttackModuleService/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과(무기98그룹). 엘린 최초/파괴7초후1000체력 복구·참조 검사. 디라 실제 afterAttack 로컬/원격 자기섭취 투사체 최고점/하강/이동추적/종료·원격 소비없음·아군투척 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 두기기 실제 온라인 시각검증 미실시.
- 실플레이 권장: 엘린 유령 파괴후 재소환/디라 자기 음식섭취와 아군투척 상대화면.


## 3.0.0-character.153 — 2026-10-08 KST

- 요청/결과: 시로 지속전투형/평타·풀차징·스킬1200사거리. 반격 조준반대 점프/출발점화살비 벽관통. 스킬 발사와 동시에 후방240 낮은점프(높이30/180ms/벽차단/추가무적없음). 헤브 평타100피해/150스테미나, 스킬200피해/벽관통, 출혈공통2초. 평타탄속32→24·스킬40→30(25%감소), 선체반격3→12(4배).
- 구조: 캐릭터 데이터의 공용 movement.move opposite-aim/module.trajectory, field.wallPolicy ignore, projectile.pierce 및 기존 피해/자원 참조 사용. 스킬 projectile 생성 뒤 같은 after-attack에서 이동 시작·발사원점은 이동전. 반격 이동350/700ms·최고점발사/출발점 화살비/스테미나/피해 유지. 새서비스/패킷 없음.
- 파일: characters/siro/hab; test-siro/hab/weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과. 시로 반대방향 점프/최고점 발사/출발점 화살비·관통 미리보기·일반/차징1200·스킬발사 동시 후방240/180ms/낮은궤적 실제실행 검사. 헤브 실제3공격탄속/벽관통/피해설명/2초출혈 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 온라인 시각검증 미실시.
- 실플레이 권장: 시로 평타차징/스킬후방점프/반격반대점프·벽너머화살비/헤브3공격.




## 3.0.0-character.154 — 2026-10-08 KST

- 요청/결과: 시로 스킬 후방점프의 벽관통/이동중 evasionInvulnerable을 기존 공용점프와 통일. 화살비 triggerOnEnter=false로 첫지속틱 제거·진입후500ms부터 지속틱. 별도 rainArrival 원형100피해/4초화염/무력화넉백을 생성시 적플레이어에게1회·벽관통. 지오핀은 지속피해장판 생성에 함께 발생하는 광역피해 및 저회를 장판조건으로 인식.
- 구조: 기존 movement.move collision/buffs, projectile.impact attackIds 및 공용 delivery.area/targetKinds/neutralize-knockback 조합. 생성피해는 rainTick 피해/범위 참조·지속틱과 별도 실행. ReactiveEquipmentService.creationField가 area 공격의 field.area 또는 동일 impact에서 함께 실행되는 linked attack을 순수 모듈로 확인. interval>0/지속시간/피해장판만 인정·일반탄환 직격/비피해장판 제외·캐릭터ID/새패킷 없음.
- 파일: characters/siro; ReactiveEquipmentService; test-siro/geopin; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과. 시로 생성1회/플레이어필터/무력화넉백/화염·벽관통/첫틱없음·대상별500ms지연과 스킬점프권위 설정 검사. 지오핀 직접/투사체연결 생성광역피해와 저회→장판누적/일반직격·비피해장판 제외 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 두기기 실플레이 미검증.
- 실플레이 권장: 시로 스킬 벽넘기/점프무적·화살비 생성순간과 지속틱/지오핀 장판생성광역피해·저회.


## 3.0.0-character.155 — 2026-10-08 KST

- 요청/결과: 시로 화살비 생성 피해에서 player-only targetKinds 제거. 타다타/소르와 같은 공용 원형delivery로 범위내 적 더미/봇/소환수/플레이어를 타격. 지속 rainTick에도 무력화넉백84/속도10 추가·oncePerExecution=false로 매틱 적용. 생성100피해/화염/벽관통·첫지속틱500ms지연 유지.
- 구조: 캐릭터 순수 데이터의 공용 delivery.area 관계필터와 movement.neutralize-knockback 사용. 생성피해는1회, 지속피해는 대상별500ms마다 반복하며 같은 field execution에 묶여 넉백이 최초1회만 발동하지 않도록 반복허용. 장판 소환/시간/피해/화염수치 유지·새서비스/패킷 없음.
- 파일: characters/siro; test-siro; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀 스크립트 통과. 실제 fieldTrigger의 서로 다른2회 지속타격에서 무력화넉백2회 호출 및 화염 검사·생성delivery의 대상종류제한 없음/적관계필터/피해100·생성1회/첫틱지연 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 두기기대전 미검증.
- 실플레이 권장: 시로 화살비 생성순간 더미/봇/소환수/플레이어 타격 및 지속타격넉백.


## 3.0.0-character.156 — 2026-10-08 KST

- 요청/결과: 라임 반격 착탄 stickyField의 movement.knockback을 movement.neutralize-knockback으로 교체. 기존 착탄점 반대방향/거리55/속도8/실행당1회 유지. 피해/4초장판/1초틱/둔화 유지.
- 구조: 캐릭터 순수데이터 기존 공용무력화넉백 조합만 변경. 투사체 자체가 아닌 실제피해를 주는 착탄범위 공격에 적용·캐릭터전용 분기/새서비스/패킷 없음.
- 파일: characters/lime; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기99그룹). 실제 stickyField onHit에서 NeutralizingKnockbackService 호출/대상/착탄점기준 방향/거리55/속도8 및 장판유지 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제두기기대전 미검증.
- 실플레이 권장: 라임 반격 착탄범위 적중·무력화넉백/기존장판.


## 3.0.0-character.157 — 2026-10-08 KST

- 요청/결과: 62명 반격의 기본·대체·연결 타격을 전수검수. 발동시 counter.execute cc를 주입하는 기존공용 경로와 실제 연결공격을 구분. 메이실 귀환가위 일반넉백→무력화넉백, 셰리나 반격잔향틱·라임 끈적장판틱·큐리 반격폭발·시아넬리 반격비도에 무력화넉백 추가. 타다타 비둔화 대상 첫타격에 조건부 무력화넉백 추가·둔화된 대상 기존속박 유지.
- 구조: 순수 캐릭터 데이터 공용 movement.neutralize-knockback 조합. 기존 기절/속박/빙결/수면 및 강제이동 끌어당김 반격 유지. 둔화만으로는 예외취급하지 않음. 별도실행 귀환/폭발/비도에 효과 명시, 장판/귀환 반복은 oncePerExecution=false. 타다타 기존모듈 참조 인덱스 보정·추가 CC는 enemy 관계필터. 새서비스/패킷 없음.
- 파일: characters/maisil/sherina/lime/quri/xianelli/tadta; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기102그룹). 전체62명 반격태그 실제피해 공격의 직접효과/발동주입/대체바인딩 검사. 5연결반격 실제onHit 공용무력화넉백 호출·타다타 일반대상 넉백/둔화대상 속박/참조1000ms 검수. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 두기기대전 미검증.
- 실플레이 권장: 메이실 귀환/셰리나 반격잔향/라임 장판/큐리 반격폭발/시아넬리 반격비도/타다타 비둔화·둔화 대상.


## 3.0.0-character.158 — 2026-10-08 KST

- 요청/결과: 큐리5단계 후면큐브 scale1.6→2(25%확대)·단계별밝기/잔향/공식입력/반격모션 유지. 펠루나 대장장이 forge-hammer 추가: 쐐기형뒤끝/넓은평면 타격머리/중앙결합부/긴그립·캐릭터회색계열 밝은윤곽/손잡이중앙. 실제4평타 전달에서420ms망치질, 일반/강화반격에서400ms시계한바퀴.
- 구조: WEAPON_IMAGE_DEFS 순수형상·기존 weaponImage motionStateKey/rotationStateKey/mode.toggle on-delivery 조합. 평타 선딜전에는 모션없음·실행당중복제외·기존원격모드복원/은신/사망페이드 유지. 펠루나 Infinity장판시간 유지·전투수치 변경없음·새서비스/패킷 없음.
- 파일: characters/quri/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기103그룹). 큐리5단계scale2·펠루나4평타실제전달/중복제외/2반격회전/원격모션/모루Infinity 보존. Canvas20상태 큐브단계/망치기본·공격자세 시각확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 큐리5단계큐브·펠루나4평타 선딜후망치질/반격회전/은신·사망무기.


## 3.0.0-character.159 — 2026-10-08 KST

- 요청/결과: 펠루나 망치scale2→1.7(15%축소). 일반/강화4평타·모루투척스킬·일반/강화반격의 실제전달에서 공용400ms 시계한바퀴로 통일. 3단계(value>6000)에서는 기존 강화평타 hitColor 255,160,40 참조로 무기색 변화·해제시회색 복원. 코녕 스킬 발동전 반경42/300ms areaCircle 제거.
- 구조: 기존 weaponImage rotationStateKey/mode.toggle on-delivery/activityColors 상태조건·색상참조 조합. 펠루나 찌르기모션키 제거·선딜전회전 없음·스킬 실제발사1회. 코녕 preview/선딜300ms/실제타격/후면꼬치모션 유지·시작장식링만 삭제. 전투수치/새서비스/패킷 변경없음.
- 파일: characters/peluna/konyeong; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기104그룹). 펠루나7공격실제전달7회/시계각/축소/6000·6001단계색경계 및 코녕장식링없음/선딜유지 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나3공격 회전/3단계색/단계해제·코녕 스킬발동전링.


## 3.0.0-character.160 — 2026-10-08 KST

- 요청/결과: 펠루나 forge-hammer 두개를 손잡이중심에서±0.55rad로 교차 배치. 실제 평타/스킬/반격에서 기존망치는 시계(+2π), 추가망치는 반시계(-2π)로400ms회전. 두망치scale1.7/3단계 강화색참조 유지.
- 구조: 동일 공용weaponImage 형상 두개/공유rotationStateKey·부호반전 rotationRadians 데이터만 조합. 두망치는 동일 실제전달시각/원격모드 복원/은신/사망페이드/단계색 사용. 전투수치·실행모듈 변경없음.
- 파일: characters/peluna; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기105그룹). 실제스킬 전달의2망치100/200/400ms 반대회전·교차각/크기/단계색/원격일치. Canvas기본/회전표본 시각확인. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.161 — 2026-10-08 KST

- 요청/결과: 펠루나 추가망치를 공용parts.scaleX=-1로 좌우반전. 기존망치/추가망치 타격면과 쐐기끝이 대칭으로 배치. 교차각/크기1.7/공격시반대회전/3단계색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치style만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/기존형상일치/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.162 — 2026-10-08 KST

- 요청/결과: 펠루나 추가망치를 짧은 손잡이·작은 사각 타격면·쐐기형 뒤끝의 소형 대장장이 망치로 재디자인. 기존 대형 망치와 크기 차이를 부여하고 좌우반전/교차 배치/반대 회전/3단계 색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.163 — 2026-10-08 KST

- 요청/결과: 펠루나 소형망치를 좁은 목·분리된 사각 타격면·둥근 뒤머리의 공구형 망치로 재디자인. 소형망치 각도 -0.55→-0.85rad로 추가 기울임. 대형망치·좌우반전·크기·반대회전·강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상 및 배치각만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.164 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치를 양쪽 사각 타격면·단차형 머리·중앙 결합부·짧은 테이퍼 그립의 정비용 망치로 재디자인. 기울기 -0.85rad/좌우반전/크기/반대회전/강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.165 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치의 돌출된 양끝 타격면을 제거하고 얇고 균일한 사각 머리로 정리. 머리폭1.64→1.4/높이0.75→0.47, 타격면 구분선은 얇게 유지. 기울기/크기/반대회전/강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.166 — 2026-10-08 KST

- 요청/결과: 펠루나 작은망치 머리 두께40%/손잡이 폭25% 확대. 양끝 돌출 없는 균일한 머리 윤곽과 기존 길이·기울기·회전·강화색 유지.
- 구조: WEAPON_IMAGE_DEFS forge-hammer-mirrored 순수형상과 기존parts 변환 사용·추가망치 형상만 교체. 전투/회전모드/네트워크 변경없음.
- 파일: characters/peluna; WEAPON_IMAGE_DEFS; test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 통과(무기106그룹). 추가망치scaleX=-1/소형형상크기/추가기울임/반대회전 유지 검사. Canvas교차망치 시각확인·build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 펠루나 교차쌍망치/3공격 반대회전/3단계색.


## 3.0.0-character.167 — 2026-10-08 KST

- 요청/결과: 키네스 반격 사거리450→270(40%감소), 타다타 스킬 투척사거리550→440(20%감소)/스테미나400→500. 타다타 장판반경180 유지.
- 구조: 캐릭터 순수데이터 수치만 수정. 키네스 확장링 실제피해 delivery.area.range도 attacks.counter.range 참조로 통일하여 시각/타격 일치. 타다타 기존 공용투척·설명·미리보기 참조 유지.
- 파일: characters/kines/tadta; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 키네스 실제피해범위 참조270 및 타다타 사거리440/비용500 검수. 실제온라인 플레이 미검증.
- 실플레이 권장: 키네스 반격270범위·타다타 스킬440투척/500비용.


## 3.0.0-character.168 — 2026-10-08 KST

- 요청/결과: 헤브 이동속도 빠름4.25→느림3.75. 평타 투사체 반경14→20, 스킬18→25. 공용 무기투사체 시각크기는 기존 반경참조로 동기화.
- 구조: 헤브 순수데이터 및 공용 CHARACTER_RULES 이동속도 라벨 수정. 판정과 이미지크기 동일반경 참조 유지·탄속/피해/사거리/반격 변경없음.
- 파일: characters/hab; CHARACTER_RULES; test-hab; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀스크립트 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 헤브 컴파일 이동속도3.75/느림·실제발사반경20/25 검수. 실제온라인 플레이 미검증.
- 실플레이 권장: 헤브 느림 이동·평타20/스킬25투사체.


## 3.0.0-character.169 — 2026-10-08 KST

- 요청/결과: 시로 스킬600스테미나/넉백100/점프300ms·높이60/화염초당30. 헤브 평타25·스킬35반경/탄속30·37.5/사거리550/각400ms쿨/스킬넉백100/항시50%회복. 레비나 스킬 최초투척·재조작·귀환 넉백 반복허용.
- 구조: 캐릭터 순수데이터와 기존 공용모듈 조합. 시로500ms화염틱15로 초당30. 레비나 스킬3경로의 oncePerExecution=true 제거(false)하여 재사용된 투사체 실행의 넉백소비기록에 차단되지 않게 함. 타격중복 판정은 기존투사체가 담당.
- 파일: characters/siro/hab/levina; test-siro/test-hab/test-weapon-updates; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 전체13개 회귀와 build/docs/check/verify/runtime구문/ZIP무결성 통과. 시로 실제300ms점프·화염틱/헤브 실제탄반경·속도·회복·넉백 검사. 실제온라인 플레이 미검증.
- 실플레이 권장: 시로 점프·화염/헤브 공격/레비나 반복스킬 넉백.


## 3.0.0-character.170 — 2026-10-08 KST

- 요청/결과: 레비나 삼지창 무기이미지 배율1.85→1.665(10%축소). 기울기/투척중숨김/모션/전투판정 유지.
- 구조: 레비나 순수데이터 weaponImage.scale만 수정. 공용렌더/은신/사망페이드 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검증 미실시.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.171 — 2026-10-08 KST

- 요청/결과: 레비나 삼지창 배율1.665→1.58175(현재대비5%추가축소). 하푸푸 평타넉백거리35→52.5(50%증가). 다른수치/모션/판정 유지.
- 구조: 캐릭터 순수데이터 weaponImage.scale 및 movement.knockback.distance만 수정. 기존 공용렌더·전투모듈 사용.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.172 — 2026-10-08 KST

- 요청/결과: 하푸푸 평타넉백거리52.5→47.25. 기존35대비 증가율을50%에서35%로 조정. 레비나 무기크기 유지.
- 구조: 하푸푸 순수데이터 movement.knockback.distance만 수정. 기존 공용전투모듈 사용.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.173 — 2026-10-08 KST

- 요청/결과: 사용자 제공 헤브·시로 stats/desc/tooltipSkills 반영. 헤브체력1200/난이도4·한줄설명 및 반격설명 교체. 시로 다중사격2/3발·토끼뜀 설명 교체. 전투모듈 유지.
- 구조: 캐릭터 순수데이터 및 헤브 체력 회귀기대값 변경. tooltip 값참조 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 헤브·시로 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.174 — 2026-10-08 KST

- 요청/결과: 시로 화살비 지속타격 넉백이 시로 위치를 기준으로 계산되던 문제 수정. 공용 장판 타격 실행의 impactOrigin을 실제 장판중심으로 설정하여 이동후에도 중심 반대방향으로 넉백.
- 구조: InstalledAreaFieldService.fieldTrigger에서 실제 area.center를 point impactOrigin으로 전달. away-from-impact 공용효과가 장판중심을 읽음. 생성타격의 기존 착탄중심 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 시로·무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.175 — 2026-10-08 KST

- 요청/결과: 실제 장판 state.execution=null인 경우 중심좌표가 전달되지 않아 기본0rad 오른쪽넉백이 되던 원인 수정. 실행정보가 없으면 공용 AttackExecutionService.create로 생성 후 실제장판 중심 전달.
- 구조: InstalledAreaFieldService.fieldTrigger에서 실제 area.center를 point impactOrigin으로 전달. away-from-impact 공용효과가 장판중심을 읽음. 생성타격의 기존 착탄중심 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 실제와 동일한 execution=null·시로이동후 상하좌우4방향 넉백 회귀 및 시로·무기 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.176 — 2026-10-08 KST

- 요청/결과: 지오핀 발명스택 폐기·모든무기 시작보유. 장판/방어차단/이동제한/급접근/소환수 조건 및 과반동/고회전/충격도약/전이/폭발형 제거. 남은 벽뒤 충격전달·근거리 이중충격·원거리 정밀 즉시장착. 전이고무탄 효과를 남은4탄종에 적용. 오른쪽게이지/후면기어를 장착별4총이미지로 교체·총열위 손잡이.
- 구조: ReactiveEquipmentService 선택적 initialOwned는 스택 생성없이 즉시선택. 기본자료는 기존경로 유지. 기존 공용모드/무기이미지/튕김모듈 조합·기존 우클릭 이전/홀드기본/반격 마지막조건 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 새 리메이크5그룹·구조 회귀/build/docs/check/verify/runtime구문/ZIP무결성 통과. 기존8스택전용 test-geopin은 과거계약으로 현재리메이크검수에서 제외. 실제온라인 시각검증 미실시.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.177 — 2026-10-08 KST

- 요청/결과: 지오핀 character175의8무기/8조건/기어/오른쪽UI/전이전용효과 복구·발명스택만제거하여 첫조건 즉시장착. 시로 평타60/스킬180/화살비60. 헤브 평타300·스킬600스테미나/반경15·20·반격재타격간격제거(적별1회).
- 구조: 지오핀 initialOwned 공용선택옵션 유지·기존스택 생성없음·UI보유상태완충표시. 헤브 범위탄환 기존 hitIds로 적별1회·관통/맵끝비행 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 지오핀복구/시로/헤브 실제투사체 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 검사. 실제온라인 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.178 — 2026-10-08 KST

- 요청/결과: 지오핀 발명스택 복구. 각8조건3회발생 제작·이후자동장착·기존우측스택UI 진행표시 복원. 시로/헤브 최근수치 유지.
- 구조: character175의 geopin/ReactiveEquipmentService/EquipmentGaugePresentationService 원문복구. initialOwned 즉시장착옵션 제거.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 기존 지오핀 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.179 — 2026-10-08 KST

- 요청/결과: 시로 평타 발당60→80/스킬180→160/반격 화살비60→80. 생성타격은 rainTick 참조로 동일80. 차징평타/설명 공용참조 유지.
- 구조: 캐릭터순수데이터 damageRatio .4/.8/.4만 변경·화염틱/스테미나/모션 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 시로 실제차징/착탄/화살비/설명 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.180 — 2026-10-08 KST

- 요청/결과: 타우 스킬 적중후 투사체 참조가 정리된 경우 실제적중좌표로 이동대상 복원. 온라인 적중확인 이동시 시작실패에도 실행소비를 기록하던 문제 수정·성공한경우만 기록.
- 구조: 공용 AttackModuleService 투사체대상이 없을때 execution.projectileImpactPoint fallback. NetworkHitAuthorityService 기존 impactX/Y 복원 경로·이동시작 성공후만 markEffect. 타우 전용분기/새패킷없음.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 타우 투사체제거후 실제 movement 상태생성·적중점거리 회귀 및 이동접촉/build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 미검증.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.181 — 2026-10-08 KST

- 요청/결과: 헤브 스킬 넉백 모듈제거·설명 넉백문구제거. 평타스테미나300→250/스킬600→500. 피해·출혈·관통·탄속/크기 유지.
- 구조: 헤브 순수캐릭터 데이터 변경·공용모듈 조합 유지.
- 파일: characters/levina; README/PATCH LOG/project/DIVIDE TASKS/runtime; 무기/캐릭터 계약 문서.
- 검증: 헤브 실제발사/출혈/회복 회귀 및 build/docs/check/verify/runtime구문/ZIP무결성 통과.
- 실플레이 권장: 레비나 삼지창 축소·투척중숨김·복원.


## 3.0.0-character.182 — 2026-10-09 KST

- 변경: 타우 스킬이 맵 외곽에 닿았을 때 귀환만 하던 문제 수정. 경계 접촉점으로 이동한 뒤 투사체는 기존처럼 귀환한다.
- 원인/구조: 공용 ProjectileService의 경계 귀환 분기에서 좌표 보정 후 onProjectileWallHit을 귀환 시작 전에 호출한다. 기존 movement.move 모듈 사용, 캐릭터 전용 분기 없음.
- 대상: src/projectiles/ProjectileService.js, tools/test-tau-hit-move.cjs, README.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 실제 updateOutbound에서 상하좌우 경계 및 모서리의 접촉좌표·이동거리·이동 후 귀환 순서, 기존 적중 후 이동 회귀 통과. build/docs/check/verify/runtime 구문 및 ZIP 무결성 검증. 실제 온라인 플레이 미검증.
- 실플레이 확인: 타우 스킬을 맵 외곽 네 방향과 모서리에 발사해 이동/귀환 확인.


## 3.0.0-character.183 — 2026-10-09 KST

- 변경: 타우 스킬 맵 외곽 접촉 시 이동만 하도록 정정. 접촉점으로 이동하고 투사체는 제거하며 귀환하지 않는다.
- 원인/구조: projectile.return의 returnAtBoundary를 명시적으로 false 지정 가능하게 수정. 생략 시 기존 returnAtRange 정책 유지. 타우는 false로 지정하여 기존 벽 충돌 이동/제거 경로 사용. 일반 사거리 끝 귀환 유지.
- 대상: src/projectiles/ProjectileService.js, src/projectiles/ProjectileModuleService.js, src/data/characters/tau.js, tools/test-tau-hit-move.cjs, README.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 실제 updateOutbound에서 상하좌우 경계 및 모서리의 접촉좌표·이동거리·이동 후 투사체 제거·귀환 없음, 기존 적중 후 이동 회귀 통과. build/docs/check/verify/runtime 구문 및 ZIP 무결성 검증. 실제 온라인 플레이 미검증.
- 실플레이 확인: 타우 스킬을 맵 외곽 네 방향과 모서리에 발사해 이동만 하고 투사체 제거 확인.


## 3.0.0-character.184 — 2026-10-09 KST

- 변경: 가에 이전 라운드의 작성 중인 명령이 다음 라운드에 남던 문제 수정. 새 세션 생성 전 입력창·버퍼·결과 표시를 모두 초기화.
- 원인/구조: CharacterCommandInputService.reset으로 입력 상태 초기화 책임 통합. Training.setupSession의 온라인 분기 전에 호출하여 라운드·훈련장 공통 적용, exit도 동일 reset 사용.
- 대상: src/input/CharacterCommandInputService.js, src/modes/Training.js, tools/test-gae.cjs, README.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 실제 setupSession 실행으로 미완성/완성 입력·결과 잔존·입력 잠금 제거 및 재열기 검증. 가에 10개 회귀 및 build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 플레이 미검증.
- 실플레이 확인: 가에 명령을 작성하던 상태로 라운드 종료 후 다음 라운드의 입력창/명령 잔존 여부 확인.


## 3.0.0-character.185 — 2026-10-09 KST

- 요청/결과: 레이카 리메이크: 기존 칭호/색·체력1300/느림 유지. 기본평타와 가호평타 검격/검기 사거리350, 스킬 투척거리350. 가호 게이지와 모드에 관계없이 공중 상승→대검 투척→강하 스킬 사용. 가호 전용 우클릭/반격/회피 불길 삭제, 가호 평타만 유지. 반격은 적 접촉 또는 사거리 끝의 정지점에서 회전 타격. 가호 활성 중 타격으로도 게이지 충전.
- 구조: 기존 공용 AttackSpec/Trigger/진행도/모드/투사체 착탄/자기 이동/원격 상태 조합. movement.move의 거리0+trajectory는 지속시간과 시간 진행률로 제자리 공중 상승 유지. projectile.impact.sourceRelocate가 replaceActive/blocksAction/trajectory/buffs를 공용 이동으로 전달해 상승을 강하로 교체. 캐릭터 이름 분기 없음. 게이지0에서 스킬 사용 가능, 가호 유지 시간은 남은 게이지 기준(사용자 확인), 스킬 타격으로 충전된 게이지는 착지 후 가호에 반영.
- 대상: characters/reika, MovementAbilityService, ProjectileImpactService; 레이카 새 회귀/사거리/이동접촉/지오핀/무기 기존 검사 계약 갱신; README/REIKA/CHARACTER CONTRACT/project/DIVIDE TASKS/runtime. 기존 무기검사의 헤브 재타격/크기 기대값도 현재 실제 계약과 일치시킴(헤브 전투 변경 없음).
- 검증: 레이카 새7그룹: 0/50/200 게이지·일반/가호 6조합의 실제220ms발사/착탄/이동종료; 전방 검기/화염; 적 접촉 및 최대거리 정지점 회전; 활성중 충전/200상한/소진; 제자리 공중 시간·원격 동일높이·350목표제한 검사. 전체15개 회귀 스크립트 및 build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 브라우저·두 기기 온라인 플레이는 미검증.
- 플레이 확인: 0게이지·가호중 스킬, 적중 게이지 유지,350거리, 반격 정지점 회전.


## 3.0.0-character.186 — 2026-10-09 KST

- 변경: 레이카 스킬 최대 이동/투척거리500. 화염 검기는 샤베트 평타와 같은 공용 progressRect, 폭208(halfWidth104, 샤베트2배), 전방350. 일반/가호 평타 시계방향 좌→우 스윕. 가호 평타100/검기100. 낙하1타 반경90→180(+100%),2타도1타 참조180. 타격 충전은50피해당 최대게이지4%(200중8), 가호 소모 초당16→20(+25%). 가호중 모든 공격/이동/무기투사체 중앙표시 하늘색.
- 구조: 순수 캐릭터 수치·진행 직사각형/스윕 공용 모듈 재사용. AttackPresentationColorService에 조건부 presentation.colorVariants 팔레트 해석을 추가하고 명시적 effect.spawn·공용 자기이동·무기투사체 +표시도 같은 팔레트를 사용. 기본팔레트 없는 기존 공격은 원래 색/캐릭터 밝은색 유지. 캐릭터 이름 분기 없음. 공격 팔레트는 생성 시 이펙트 snapshot에 포함하여 기존 원격 복제 경로 사용.
- 대상: characters/reika, AttackPresentationColorService, AttackModuleService, MovementAbilityService, Training 무기투사체 표시; test-reika/geopin/terdion 기대값과 docs/REIKA/CHARACTER CONTRACT/README/project/DIVIDE TASKS/runtime.
- 검증: 레이카10그룹(실제 공중/강하·500목표제한·충전/소진·180동일낙하·100/100피해·넓은 공용형상·스윕·실제 생성 회전이펙트 팔레트/원본 보존) 및 전체15회귀 스크립트 통과. build/docs/check/verify/runtime구문/ZIP무결성 검사. 실제 브라우저·두 기기 온라인 시각검수는 미실시.
- 미지정 수치 결정: 가호 소모속도는 기존보다25%높은 초당20, 검기폭은 샤베트 평타2배로 지정.


## 3.0.0-character.187 — 2026-10-09 KST

- 변경: 레이카 검기를 공용 범위 투사체로 변경. 사거리350→875(2.5배), 반경104/탄속50/피해100/적 관통·벽 차단·화염 유지. 이동 중 지나온 위치에240ms 잔상(40ms 간격)을 남기고 페이드. 일반/가호 평타 좌우 스윕 제거. 가호 충전은50피해당 최대1%(최대200중2), 피해량×0.04. 반격 실제 이동 구간에250ms 잔선(폭12/알파0.65), 가호중 하늘색 및 온라인 이펙트 복제.
- 구조: 캐릭터 조건 분기 없이 기존 delivery.range-projectile 및 projectile.presentation 재사용. ProjectileVisualPositionService의 공용 WeakMap 이력과 Training 범위투사체 렌더로 잔상 생성. MovementAbilityService의 opt-in presentation.trail은 미래 경로 대신 실제 이동분을 공용 MovementPresentationService로 표시/복제. 기존 비trail 이동은 유지.
- 검증: 레이카12그룹(실제 잔상 렌더의 고정 위치/페이드/만료, 실제 반격 이동분/색/온라인 전송 포함) 및 전체15회귀 스크립트 통과. build/docs/check/verify/runtime구문/ZIP무결성 검사. 실제 브라우저 및 두 기기 온라인 시각 검수는 미실시.


## 3.0.0-character.188 — 2026-10-10 KST

- 변경: 레이카 가호 활성(blessed) 도중에는 모든 적중 피해의 가호 충전 차단. 비활성(normal)일 때만50피해당1% 충전. 시간 충전/가호 소모 및 다른 전투 수치는 유지.
- 구조: 기존 트리거 조건 state.mode-is 재사용.
- 대상: src/data/characters/reika.js, tools/test-reika.cjs, README.md, docs/REIKA.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 레이카12그룹 및 전체15회귀 통과. 활성중100/5000피해에도 게이지 유지, 소진후50피해2충전 및200상한 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 온라인 플레이 미검증.


## 3.0.0-character.189 — 2026-10-10 KST

- 변경: 에라 파비 회피 타입 아머 리메이크. 칭호/색/1800체력/빠름4.25/반격형 원거리 탱커 유지. 저스트 회피 판정시간80→120ms(+50%), 성공마다 아머20% 충전·5회완충·피격충전 제거. 평타 레이저 건 아머는 기존2발×2회/40피해/250비용/900거리 유지. 우클릭은 아머가 조금이라도 있으면500ms후 파비 레이저(기존 타당150/4000거리/40ms틱). 시작시 완충이면틱당100, 미완충이면200 소모(최대7200·기존 완충지속2.88초 유지). 버티기/방어버프/조건부스킬 변경 제거. 반격 출력 증가는170반경 원형250피해/기존무력화넉백84·사용완료마다 기본회피거리10% 누적 영구증가.
- 구조: 기존 progress/채널/입력조건/원형공격/반격CC 모듈 조합. JustDodgeService.begin에 공용 character.dodge.justWindowMultiplier 옵션(생략시1) 추가. 기존 just-dodge 초기화 바인딩에서 로컬캐릭터 트리거도 전달. ProgressStateService thresholdModifiers의 valuePerProgress 옵션으로 누적 진행도에 비례한 버프 산정·고정value 기존동작 유지. 비안정 소모속도는 입력시조건에 맞는 채널을 생성해 시작시 고정. 캐릭터 이름분기/새 네트워크패킷 없음.
- 대상: characters/erapabi, JustDodgeService, initialization-120, ProgressStateService, test-erapabi, docs/ERAPABI, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 에라 파비 신규5그룹 및 전체16회귀 통과. 실제저회확정→트리거20%/중복차단/상한, 일반캐릭터80ms 유지, 실제 우클릭 모듈 및 채널선딜/완충·부분2배 소모/고갈종료/쿨다운, 반격 실제종료마다10% 누적/Infinity 지속/타버프보존 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 브라우저/온라인 플레이 미검증.
- 미지정 결정: 저회 시간 증가50%(120ms), 나머지 공격 수치 기존 유지.


## 3.0.0-character.190 — 2026-10-10 KST

- 변경: 레이카 스킬 입력은 가호 완충(최대200/100%) 및 비활성(normal) 상태에서만 허용. 부분충전/가호활성 상태에서는 스킬 공격과 입력 미리보기 생성 차단. 가호 활성중 적중충전을 복구하고 일반/활성 모두50피해당2%(200중4, 피해량×0.08) 충전. 기존 소모속도20/검기875/스킬500/스테미나400 등 유지.
- 구조: 기존 입력 트리거의 공용 진행도/모드 조건 재사용.
- 대상: src/data/characters/reika.js, tools/test-reika.cjs, README.md, docs/REIKA.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 레이카12그룹 및 전체16회귀 통과. 게이지0/50/200×일반/가호6조합에서 완충일반만 스킬허용, 나머지5조합 공격·이동·미리보기 없음. 활성중100피해8충전·상한 및 일반50피해4충전 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제 온라인 플레이 미검증.


## 3.0.0-character.191 — 2026-10-10 KST

- 변경: 에라 파비 완충/안정발사 기준을 첫 번째 호게이지로 정정(전체7200중3600·readyAtRatio0.5). 미만 시작시 소모200, 이상이면100 고정. 패시브는 저스트회피 판정80→120ms만 유지·성공충전 제거. 반격은 기존170원형250피해/무력화넉백 유지하며 사용완료마다 첫호게이지20%(720) 충전·5회첫링완충·10회전체상한. 영구회피거리 증가 및 erapabi-output 진행도 생성 제거. 레이카190 및 기타수치 유지.
- 구조: 기존 공용 state.progress after-attack 및 채널 입력조건만 조합. 새 실행코드 없음.
- 대상: src/data/characters/erapabi.js, tools/test-erapabi.cjs, docs/ERAPABI.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 에라파비5그룹과 전체16회귀 통과. 실제저회120ms/충전없음, 0/부분 스킬조건, 첫링 경계50% 및49%·80%·100% 실제채널소모, 반격11회충전상한/영구거리버프생성없음/기존타버프유지 검사. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 확인: 사용자 선택으로 회피시간 증가는 저스트회피 판정시간을 의미. 충전20%는 첫링기준으로 적용.


## 3.0.0-character.192 — 2026-10-10 KST

- 변경: 레이카 가호 표시를 단일 호게이지로 통일(layers1/readyAtRatio1). 한 링100%가 완충이며 스킬은100% 및 비활성 상태에서만 사용. 기존50피해2%충전/가호중충전/초당소모20과 공격수치 유지. 내부진행도200=화면100% 매핑 유지.
- 구조: 기존 입력 트리거의 공용 진행도/모드 조건 재사용.
- 대상: src/data/characters/reika.js, tools/test-reika.cjs, README.md, docs/REIKA.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 레이카12그룹 및 전체16회귀 통과. 모든 가호 프레젠테이션 layers1/readyAtRatio1, 완충비활성만 스킬허용과50피해2%충전 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검수 미실시.


## 3.0.0-character.193 — 2026-10-10 KST

- 변경: 사용자 확인에 따라 에라 파비 리메이크 전(character188) 캐릭터 원문을 바이트 동일하게 복구. 피격 피해 저장형 아머/기존 버티기(방어50%3초와 주변넉백)/아머50% 이상 조건부 파비레이저/앞뒤 회전반격 복구. 저회시간 기본80ms·반격 아머충전과 영구거리증가 없음. 레이카192 단일호게이지와 최신전투 변경 유지. 공용 확장옵션은 남아있지만 파비는 사용하지 않음.
- 구조: 리메이크 전 캐릭터 데이터 원문 복구. 공용 서비스/다른 캐릭터는 유지.
- 대상: src/data/characters/erapabi.js, tools/test-erapabi.cjs, docs/ERAPABI.md, README.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 에라파비 복구3그룹 및 전체16회귀 통과. 원문 바이트동일·피격저장/체력4배상한/저회충전없음/80ms·버티기/레이저분기50%·실제채널소모/고갈 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.
- 확인: 사용자가 리메이크 전 복구를 선택.


## 3.0.0-character.194 — 2026-10-10 KST

- 변경: 레이카 가호는 첫호게이지100%/두번째까지200%의 2층 개념으로 정정. 내부200=표시200%, 스킬은100%이상 및 비활성 상태에서 허용. 일반/가호중50피해당2%(피해량×0.04) 충전. layers2/readyAtRatio0.5 복구. 초당 가호 감소량20→25%(25%증가);100%는 무충전4초/200%는8초. 파비 리메이크전 복구193 및 나머지수치 유지.
- 구조: 기존 입력 트리거의 공용 진행도/모드 조건 재사용.
- 대상: src/data/characters/reika.js, tools/test-reika.cjs, README.md, docs/REIKA.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 레이카12그룹 및 전체16회귀 통과.0/99/100/150/200×일반/가호10조합의100%경계,2층표시,50피해2%,초당25소모 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검수 미실시.


## 3.0.0-character.195 — 2026-10-10 KST

- 변경: 레이카 가호평타 스테미나 비용200→150. 일반평타와 동일150. 가호 검기/피해/사거리/발사간격/게이지 조건과 나머지 캐릭터 유지. 설명 비용은 기존 공격값 참조로150 반영.
- 구조: 기존 입력 트리거의 공용 진행도/모드 조건 재사용.
- 대상: src/data/characters/reika.js, tools/test-reika.cjs, README.md, docs/REIKA.md, project.json, DIVIDE TASKS.md, runtime.js.
- 검증: 레이카 회귀 및 전체16스크립트 통과. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 미검증.


## 3.0.0-character.196 — 2026-10-10 KST

- 변경: 파비 버티기/rmbBurst/방어버프 및 RMB CHARGE 행 제거. 파비 레이저를 일반RMB 스킬로 통합·아머조건없이 입력가능. 평타명 레이저 건 아머·탄당40→50(2발×2회/250비용/900거리 유지). 피격 저장 아머 최대치는 최대체력4배→2배:첫링100%는최대체력만큼 피격/전체200%는2배피격(1800체력=1800/3600). 일반레이저 시작시첫링100%미만이면틱당200·이상이면100소모로 고정. 선딜500ms/40ms틱/타당150/거리4000/기존앞뒤반격 유지. 아머0도 입력/선딜가능하되 아머가 없으면 피해없이종료. 레이카195 유지.
- 구조: 기존 damage-received 진행도/2층호게이지/조건별 channel.attack/레이저공격 조합. maxHealthRatio2와 공용 passive rate0으로 체력변화에도 용량동기화. TriggerConditionService에 기존비율gte와 같은해석의 ratio-lt 추가. ChannelAttackService는 소모자원이0이면틱 실행전에종료하여 무료피해방지. 캐릭터ID 분기/새패킷 없음.
- 대상: characters/erapabi, TriggerConditionService, ChannelAttackService, test-erapabi, docs/ERAPABI, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 파비4그룹 및 전체16회귀 통과. 탄당50·평타2×2,1800/3600체력별피격100/200% 상한,0/99/100/150/200% 실제입력/선딜/선택소모/고갈/쿨다운,체력버프100%비율경계 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제브라우저/온라인 플레이 미검증.


## 3.0.0-character.197 — 2026-10-10 KST

- 변경: 메라모나 체력1200→1000/기본피해200→150(전단계평타·변신타격·반격 모두150). 스킬필요평타적중3→2·단계별참조와설명동기화. 반격은 적중여부와무관하게 사용완료시4초간 임시1단계 상승. 미적중시에도 누적단계에맞는속도/공격속도 버프를 공용onFinishModules로 적용. 다른캐릭터 변경 유지.
- 구조: 순수캐릭터 수치와 기존 state.progress after-attack/CounterModuleService.onFinishModules/조건별 modifier.set 조합. 새공용코드/캐릭터ID분기 없음.
- 대상: characters/meramona, test-meramona, docs/MERAMONA, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 메라모나2그룹 및 전체17회귀 통과. 모든피해150/2회스킬조건·미적중 임시단계/영구단계합산속도와공격속도·적중중복상승없음 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인플레이 미검증.


## 3.0.0-character.198 — 2026-10-10 KST

- 변경: 파비 ALWAYS 차지 타입 아머 설명을 사용자문구 받은 피해를 아머로 저장으로 변경(showCost:false 유지). 레이카 반격 정지점 원형회전 반경130→350. 실제원형타격/회전이펙트는 기존 counterSpin.range 참조로동기화. 돌진거리300/피해200/무력화넉백과 기타수치 유지.
- 구조: 캐릭터 설명/공격 range만 수정. 기존 공용범위와참조 사용.
- 대상: characters/erapabi/reika, docs/ERAPABI, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 전체17회귀/build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 시각검수 미실시.


## 3.0.0-character.199 — 2026-10-10 KST

- 변경: 파비 레이저 설명 소모량2배를 저장된 아머 소모 속도2배로 변경. 실제전투값/레이카 등 기타변경 유지.
- 구조: 캐릭터 tooltipSkills 문구만 수정.
- 대상: characters/erapabi/reika, docs/ERAPABI, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: build/docs/check/verify/runtime구문/ZIP무결성 통과. 전투변경없음.


## 3.0.0-character.200 — 2026-10-10 KST

- 변경: 디라 평타 식재료가 자기 스토브에 적중하면 source 디라의 스테미나150 회복. 기존식재료투입/소비와 아군회복 유지. 타플레이어/타소환수/타인스토브에는 새스테미나회복없음·실행당1회·원격미러 중복제외.
- 구조: 기존 resource.restore on-hit/source/oncePerExecution과 공용 cooking.own-stove 조건 조합. 조건은 CookingService.isOwnStove 재사용. 새캐릭터ID분기없음.
- 대상: characters/dira, TriggerConditionService, test-dira-stove, docs/DIRA, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 디라스토브1그룹 및 전체18회귀 통과. 실제적중모듈경로에서150회복/중복제외/타인스토브와아군제외/최대치/원격미러제외 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.


## 3.0.0-character.201 — 2026-10-10 KST

- 변경: 헤브 분류를 조건형 중거리 딜러로 변경(role6암살자→1딜러). 기존조건형style5/평타550중거리 기준 유지. 전투수치변경없음.
- 구조: 캐릭터 classification.role 데이터만 변경·공용카드/정렬 표시 참조.
- 대상: characters/erapabi/reika, docs/ERAPABI, CHARACTER CONTRACT, README, project, DIVIDE TASKS, runtime.
- 검증: 헤브회귀/build/docs/check/verify/runtime구문/ZIP무결성 통과.


## 3.0.0-character.202 — 2026-10-10 KST

- 변경: 가에 fix 잃은 체력20%. 레이카 일반/가호 평타·반격 돌진/회전275. 룰리 체력1100. 메라모나 단계별 평타 반경/반폭12→24. 파비 평타40/스킬 타당120/반격240. 훈련장·온라인 시작 시 공용 전체화면 요청, 거절 시 다음 신뢰 입력에서 재시도. 게임 중 Ctrl+W/Meta+W preventDefault 및 지원 시 KeyW keyboard lock 시도. 브라우저 예약 단축키의 완전 차단은 보장되지 않음. Esc 종료 후 강제 재진입 없음.
- 대상: gae/reika/ruli/meramona/erapabi 캐릭터 데이터, Training, GameplayBrowserService, 관련 회귀, README/project/DIVIDE TASKS/runtime.
- 검증: 기존18회귀·신규 브라우저 서비스 회귀, build/docs/check/verify/runtime 구문 및 ZIP 무결성 검사. 실제 브라우저 단축키/온라인 미검증.


## 3.0.0-character.203 — 2026-10-10 KST

- 변경: 아츠테오 회전원석(oreHit) 피해150→120. baseDamage150×damageRatio0.8. 평타100·반격200 및 원석 수/회전/이동 판정 유지. ALWAYS 설명은 기존 피해 참조로 자동120 반영.
- 대상: src/data/characters/atsuteo.js, README, PATCH LOG, project, DIVIDE TASKS, runtime.
- 검증: 구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 미검증.


## 3.0.0-character.204 — 2026-10-10 KST

- 변경: 체리티 평타 차징 스테미나100~600→100~750. 최소100 유지·최대750. 차징 중 소비/재생 제한/피해/사거리 유지. 설명은 기존 charge 비용 참조 사용.
- 대상: src/data/characters/cherity.js, README, PATCH LOG, project, DIVIDE TASKS, runtime.
- 검증: 구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 미검증.


## 3.0.0-character.205 — 2026-10-10 KST

- 변경/원인: 엔소냐 스킬 발동 범위 아군은 기존 5000ms(1칸)만 충전. 오라 버프 연장 계산의 프레임 now와 BuffService.set의 performance.now 차이가 매 프레임 추가 시간으로 누적되던 문제 수정. set 선택적 now 인자로 동일 기준시각 저장. 주변은 기존 순증가 초당1000ms(1칸에5초), 초기0에서 프레임마다 만료되어 충전되지 않던 경우 자연감소 보상 유지. 아군 오라 재전파 없음·적/원격 권위 제외·범위 이탈 정상감소. 다른 캐릭터/버프 set 기본시각 유지.
- 대상: BuffService, TimedThresholdBuffService, test-timed-threshold, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체20회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 80ms 처리시각 지연을 매프레임 주입해 1초후5000→6000 확인·뒤늦은 진입/이탈/적/원격 제외. 실제 온라인 미검증.


## 3.0.0-character.206 — 2026-10-10 KST

- 변경: 프릴 스킬 청소 완료 구역의 피해 증가 및 반격 자신/아군 피해 증가50%→35%. modifier.set value 세곳0.35. 지속시간/범위/발동조건 유지·설명은 modifierPercent 공용참조로35 반영.
- 대상: src/data/characters/prill.js, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 미검증.


## 3.0.0-character.207 — 2026-10-10 KST

- 변경/원인: 자동 전체화면/실패 재요청/keyboard lock 제거. 기존 게임중 Ctrl+W preventDefault만 유지. 레코드 제출의 계정별 큐가 한 라운드 전체 무한 재시도를 기다려 뒤 라운드를 제출하지 못하던 구조 수정: HTTP 개별 요청만 직렬화하고 정산별 독립 재시도·동일 정산 중복 방지. 서버 승인/로그인/동일계정·기기 제한 및 점수 산정은 유지. 실제 사용자 저장 실패 원인과 서버 응답은 미확인이며 이 변경으로 실서비스 저장 복구를 단정하지 않음.
- 대상: GameplayBrowserService, MatchResultSubmissionService, test-gameplay-browser/test-match-submission, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체21회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 첫 라운드 미확정 응답/재시도 대기 중 두번째 라운드 제출·확정 재현 검사. 실제 서버 저장 미검증.


## 3.0.0-character.208 — 2026-10-11 KST

- 변경/원인: 로그인 캐시 진입 뒤 계정 조회 지연 응답이 그 사이 확정된 최신 레코드/전적을 덮어쓰는 경쟁 조건 수정. 조회 시작 시 authoritativeProgress 참조 기록·확정변화/미확정 투영 존재시 최신 점수 유지하면서 프로필 동기화. 서버 확정 진행도를 로그인 캐시에 저장·임시점수 캐시 저장 제외. 정산 차단/제출 snapshot 누락/첫 통신 실패/서버 확정 대기 진단 추가(토큰·개인식별정보 미출력). 207의 앞 라운드 재시도 막힘 수정 유지. 서버 정산 실응답은 확인하지 못했으며 실제 사용자 저장 실패 원인 확정/서버 저장 복구를 단정하지 않음.
- 대상: FirebaseAccountMigrationUI/CharacterRecordProgressionService/MatchResultSubmissionService/test-record-sync, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 전체22회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 조회 지연 중100→200 확정 후100 응답에도200유지/캐시200, 미확정300은화면유지·캐시확정200 검사. 실제 서버 응답/저장 미검증.


## 3.0.0-character.209 — 2026-10-11 KST

- 변경: 메라 모나 모든 단계 평타 스테미나150→200. 스킬 변신 비용0→400. 후속 변신타격/반격 비용0 유지·피해/성장조건/연출 유지. 기존 공격 비용 참조로 설명/공용소비 동기화.
- 대상: meramona 캐릭터, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 메라모나/구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 미검증.


## 3.0.0-character.210 — 2026-10-11 KST

- 변경: 사이엔 체력50%미만 대상 점선이 은신 적 위치를 노출하던 문제 수정. 공용 ConditionalTargetLinkPresentationService가 StealthPresentationService.state.hideWorldUi를 확인해 시야에 숨겨진 적 연결 제외. 근접감지/행동으로 실제노출된 대상은 공용시야대로 표시. 전투/피해/게이지변경없음.
- 대상: ConditionalTargetLinkPresentationService/test-target-link, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 대상연결/사이엔/구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 시각 미검증.


## 3.0.0-character.211 — 2026-10-11 KST

- 변경/원인: 사망 관전자 은신 캐릭터 완전숨김 분기를 페이드 중/일시노출/근접감지에는 표시하도록 수정. 사이엔 처치 충전/ALWAYS 처치문구 제거·격 최대치 절격 유지. 레이카 평타(일반/가호)/반격 돌진·회전275→300·피해충전0.04→0.06(50피해3%)·자동충전2.5→2.875(+15%). 엘린 평타탄속18→22.5(+25%). 로온 스킬 requireSuccessfulHit 공용옵션으로 회피/방어접촉의 장판/이동 차단·확정 적중 carrier복원 및 허위착탄 패킷 전송 제외. 룰리 평타 윤곽이 뻗고 끝의 기존 피해네모만 채움·판정/피해시점 유지·반격연출 유지.
- 대상: cyien/reika/elin/roon/ruli, StealthPresentationService/RuliRulerPresentationService/ProjectileImpactService/NetworkHitAuthorityService/OnlineDuelService, 관련 회귀와 docs/REIKA, README/project/DIVIDE TASKS/runtime.
- 검증: 전체24회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 관전50%페이드/노출/만료, 장판성공여부, 줄자진행중채움없음/끝채움 검사. 실제 온라인 시각검증 미실시.


## 3.0.0-character.212 — 2026-10-11 KST

- 변경: 디라 체력1000→1200. 평타계열 식재료/음식/프라이팬 투사체 탄속20→27(+35%). 스토브체력1000·사거리/비용/식재료 회복 유지.
- 대상: dira 캐릭터, README/PATCH LOG/project/DIVIDE TASKS/runtime.
- 검증: 디라스토브/구조 회귀·build/docs/check/verify/runtime 구문·ZIP 무결성 통과. 실제 온라인 미검증.


## 3.0.0-character.213 — 2026-10-11 KST

요오 신규 구현. 사용자 요구의 캡슐 역방향 분열/6종 피규어 효과/홀드 저비용 뽑기/중복 없는 두 효과 반격/역할 아이콘 반영. 미지정 밸런스는 docs/YOO.md 표의 초안. 기존212 디라 및211 변경 유지.

대상: src/data/characters/yoo.js,index.json,CHARACTER_RULES.js,WEAPON_IMAGE_DEFS.js; src/combat/SelectableAttackService.js,AttackModuleService.js,AttackGuardService.js; src/projectiles/ProjectileModuleService.js,ProjectileImpactService.js; src/abilities/MovementAbilityService.js; src/core/CharacterSortService.js. README/PATCH LOG/project.json/DIVIDE TASKS, docs/YOO.md, tools/test-yoo.cjs 및 기존 캐릭터 등록 기대 총원62→63 갱신.

전투는 순수 AttackSpec 조합. 무작위 결과는 소유자 권위 생성 후 기존 트리거 공격 snapshot으로 복제·원격 재추첨 없음. 분열 원점 고정/첫 적중 집합 공유/실제 벽 반사/전방 사거리에 역방향 분열 단순 합산 방지. 반격 피해 효과에 공통 CC 상속·컨트롤러는 속박. 역할 형상은 공용 무기 렌더에 추가하며 타 캐릭터 형상은 유지.

검증: 신규 요오12그룹 및 전체25회귀 스크립트, build/docs/check/verify/runtime 구문, ZIP 엔트리 바이트/CRC 검사. 잔여: 실제 브라우저 시각·두 기기 온라인·실전 밸런스 검증 미실시.


## 3.0.0-character.214 — 2026-10-11 KST

요오: 두 분열탄은 전방 일반 투사체로 변경·shareHitTargets와 hit.once-per-execution 제거로 원탄+분열 두 발 중복 피해 가능. 반격 이름 두번 가챠. 선택 결과 두 역할 형상을0.8초 표시하고 이후 새 모드 전환. 여섯 기본 아이콘 scale1.7→2.1·암살자/컨트롤러 재디자인. 실제 접촉 벽면/외곽 법선으로 돌진 반사각 산정.

대상: src/data/characters/yoo.js, src/data/WEAPON_IMAGE_DEFS.js, src/combat/SelectableAttackService.js, src/abilities/MovementAbilityService.js, tools/test-yoo.cjs, tools/test-character-range.cjs, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 모드/TimedActionState 기존 snapshot 및 예약 서비스 사용·캐릭터 이름 조건 분기 없음. 이후 입력을 이전 예약이 덮어쓰지 않도록 예약 토큰 검사. 기존 캐릭터 무기 디자인 유지.

검증: 요오15그룹·전체25회귀 스크립트 통과, 실제 원탄 및 분열 재피해 경로/800ms 결과 표시 및 원격 상태/직사각형 벽의 비스듬한 실제 반사·이동량 소진 검증. build/docs/check/verify/runtime 구문 및 ZIP CRC/엔트리 바이트 검사. 실제 브라우저/두 기기 온라인 플레이 미검증.

## 3.0.0-character.215 — 2026-10-11 KST

여러 벽 후보에서 이동거리를 중복 축소하던 공용 충돌 계산 수정·반복 반사 안정화. 원탄 적중 대상은 분열 피해 제외, 다른 적은 두 분열탄 각각 피해 가능. 홀드는 무작위 피규어 효과1개 사용 후 피규어 변경·스테미나300. 딜러 부채꼴 사거리300→500. 공용 모듈과 순수 데이터 유지.

검증: 요오19그룹·전체25회귀, build/docs/check/verify/runtime 구문·ZIP 압축 해제 및 원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

대상: src/core/MovementService.js, src/abilities/MovementAbilityService.js, src/projectiles/ProjectileModuleService.js, src/projectiles/ProjectileImpactService.js, src/projectiles/ProjectileTargetFilterService.js, src/data/characters/yoo.js, docs/YOO.md, tools/test-yoo.cjs, README/PATCH LOG/project.json/DIVIDE TASKS. 원탄 확정 제외 ID를 기존 공격 snapshot으로 전달·새 캐릭터 실행 분기 없음. 기존 ZIP 누락 문제를 피하도록 업로드 사본과 최종 전달본 분리·저장 후 ZIP 재검사.

## 3.0.0-character.216 — 2026-10-11 KST

암살자는 후드와 가면, 컨트롤러는 서로 연결된 구속 사슬 형상으로 변경. 반격 결과 두 아이콘 조합에도 같은 형상 반영. 캐릭터 색·공용 투명도/크기/은신/모드 및 전투 수치 유지.

검증: 요오19그룹·구조 회귀·공용 렌더 미리보기 확인·build/docs/check/verify/runtime 구문·ZIP 압축 해제 및 원본 대조. 실제 브라우저/온라인 시각 검증 미실시.

대상: src/data/WEAPON_IMAGE_DEFS.js, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 원형상 데이터만 교체·기존 공용 무기 렌더 사용.

## 3.0.0-character.217 — 2026-10-11 KST

저격탄은 다즈빈 평타와 같은 startTravelRatio0.3/preserveTurnRadius 방식으로 유도. 기본 회전량은 다즈빈0.03의10배인0.3rad/frame. 다즈빈처럼 가장 가까운 적을 공용 유도 대상 선정으로 선택. 암살자는 기울어진 단검, 컨트롤러는 세 고리로 연결된 사슬 형상. 반격 결과 조합도 동일 형상 반영.

검증: 요오19그룹·구조 회귀·형상 미리보기·다즈빈 대비 유도 설정 대조·build/docs/check/verify/runtime 구문·ZIP 압축 해제/원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

대상: src/data/characters/yoo.js, src/data/WEAPON_IMAGE_DEFS.js, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 기존 공용 유도/무기 렌더 옵션·순수 데이터만 변경.

## 3.0.0-character.218 — 2026-10-11 KST

컨트롤러는 두께와 안쪽 빈 공간을 가진 곡선 고리·뒤쪽 가는 연결 고리로 사슬을 표현. 저격수는 모따기 조준경 테두리·마운트·분리된 십자선·중앙 표식·거리 눈금으로 재디자인. 일반과 반격 결과 조합에 같은 형상 반영. 기존 색·투명도·크기·강한 저격 유도/전투 유지.

검증: 요오19그룹·구조 회귀·큰 크기/게임 크기 형상 미리보기·build/docs/check/verify/runtime 구문·ZIP 압축 해제/원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

대상: src/data/WEAPON_IMAGE_DEFS.js, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 순수 형상 데이터·기존 공용 경로 렌더 재사용.

## 3.0.0-character.219 — 2026-10-11 KST

게임/라운드 및 훈련장 시작의 피규어를6종 중 균등 무작위로 선택. initialModes 데이터·ModeStateService 최초 조회/snapshot 생성에서 소유자만1회 초기화하고 원격은 동일 결과 수신. 재조회/동기화로 재추첨하지 않으며 시작 효과 발동/비용 없음. 딜러 아이콘은 긴 검신·중앙선·가드·손잡이·검끝 장식을 가진 장검으로 교체하고 반격 조합도 반영.

검증: 요오21그룹·전체25회귀·형상 미리보기·build/docs/check/verify/runtime 구문·ZIP 압축 해제/원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

대상: src/core/ModeStateService.js, src/data/characters/yoo.js, src/data/WEAPON_IMAGE_DEFS.js, tools/test-yoo.cjs, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 캐릭터ID 분기 없음·기존 모드 snapshot으로 선택 결과 동기화.

## 3.0.0-character.220 — 2026-10-11

가에 명령창은 ESC·창 포커스 이탈·탭 숨김·명령 자동/수동 제출·reset 등 모든 close 경로에서 입력 버퍼와 이전 결과 문구/타이머를 제거. 제출 결과를 닫힌 창에 다시 남기지 않음. 로컬 플레이어 사망 정리에서 즉시 닫고, 사망/관전/게임 종료 후 입력 및 명령 실행 차단. 다른 플레이어 사망은 자기 입력창을 닫지 않으며 활성 기능과 일반 온라인 채팅은 유지.

검증: 가에12그룹 및 전체25회귀·build/docs/check/verify/runtime 구문·ZIP 압축 해제/원본 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

대상: src/input/CharacterCommandInputService.js, src/core/EntityCharacterDeathResetService.js, tools/test-gae.cjs, README/PATCH LOG/project.json/DIVIDE TASKS. 캐릭터 ID 분기 없음·공용 입력/사망 수명 정리.

## 3.0.0-character.221 — 2026-10-11

저격수 역할 아이콘을 원형 테두리와 네 방향 조준선만 남긴 단순한 조준경으로 변경. 마운트·거리 눈금·중앙 장식 제거. 반격 두 역할 조합에도 같은 형상 적용. 기존 색상/크기/유도 및 전투 수치 유지.

대상: src/data/WEAPON_IMAGE_DEFS.js, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 순수 경로 데이터와 기존 공용 렌더 유지.
검증: 요오/구조 회귀·build/docs/check/verify/runtime 구문·형상 미리보기·ZIP 압축 해제 대조. 실제 온라인 시각 검증 미실시.

## 3.0.0-character.222 — 2026-10-11

요오 반격 선택의 서포터 효과가 공통 무력화 넉백 모듈을 상속해 자신/아군 회복 대상까지 무력화하던 오류 수정. 기존 inheritExtraModules:false 선택 옵션으로 서포터의 공격 부가효과 상속만 차단. 딜러/저격수/암살자 적 적중의 반격 넉백 및 컨트롤러 속박 유지.
대상: src/data/characters/yoo.js, tools/test-yoo.cjs, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 순수 캐릭터 데이터·기존 공용 선택 모듈 옵션 재사용.
검증: 수정 전 자기/아군 무력화 재현·모든15조합 회귀·전체25회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 온라인 플레이 미검증.

## 3.0.0-character.223 — 2026-10-11

요오 짧은 우클릭과 홀드 스킬에500ms 선딜·반격은 기존300ms 유지. 선딜 시작에 실제 사용할1종/2종 능력을 소유자만 확정하고 해당 역할 아이콘과 공용 공격 범위 미리보기 표시. 끝날 때 재추첨하지 않고 같은 효과 발동. 반격의2아이콘800ms 표시/이후 종류 변경 유지. 스테미나는 발동 시 소모·자원 부족은 준비 차단·사망/강제이동 시 선딜 취소. 원격은 기존 모드/시간 상태로 아이콘 동기화·공격 미리보기는 본인만 표시.

대상: SelectableAttackService, CounterModuleService, AbilityModuleService, AttackPreviewService, yoo 데이터/회귀, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS. 공용 선택 준비 옵션과 복합 미리보기 확장·캐릭터 ID 분기 없음.
검증: 요오26그룹(6능력 실제 미리보기/499·500ms 경계/선택 고정/원격 아이콘/자원/사망/강제이동 취소)·전체25회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.

## 3.0.0-character.224 — 2026-10-11

요오 일반/홀드 스킬 미리보기의 확정 선택 AttackSpec을 liveTracking에 유지해 모든 능력이 현재 캐릭터 위치·마우스 조준을 추적하고 실제 발동도 최종 조준 사용. 반격 기존 liveAim 유지. 컨트롤러 선택은 preview:false로 거대 영역 기하 생성 제외·아이콘/실제 속박과 다른 동시 능력 미리보기 유지. 탱커 visualState/effect stateKey를 리안과 같은 공용 방어 성공 교체 연출에 연결·현재 방어자 위치로 재생성·방어 종료 시간 유지. 서포터는 시전 위치 반경300의3초 고정 영역·안의 자신/아군 플레이어 자연회복 시작·적/원격 중복 제외. 사이엔 쌍도낙엽 적중 격2→1·oncePerExecution 유지.

공용 확장: 확정 선택 미리보기 추적/선택별 미리보기 제외, field.area onTrigger의 health.start-natural-regen. 나머지는 기존 방어/영역/진행도 데이터 조합. 캐릭터 ID 분기 없음.
대상: AbilityModuleService, AttackPreviewService, InstalledAreaFieldService, yoo/cyien 데이터·회귀, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS.
검증: 요오30그룹·사이엔4그룹 및 전체25회귀·build/docs/check/verify/runtime 구문·ZIP 압축 해제 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.


## 3.0.0-character.225 — 2026-10-11

요오 암살자 미리보기를 실제 이동 반경/벽·외곽 충돌과 반사각을 사용하는 구간별 경로로 표시. 반사 시 effect.damage.resetHitsOnWallReflection:true에 따라 새 AttackExecution 생성·동일 구간 중복 피해 방지·이전 적 재타격 허용. 일반/홀드/반격 선택 모두 같은 AttackSpec 사용. 원격 effect 이동 timeline에 reflectWalls 전달 및 실제 반사 경로 접촉 재생 추가. 경로/미리보기 객체 풀 재사용. 기존 movement.move/effect.spawn/AttackPreview 확장·캐릭터 ID 분기 및 새 모듈 타입 없음.

대상: MovementAbilityService, AttackPreviewService, AttackModuleService, EffectSpawnService, yoo 데이터, test-yoo/test-movement-contact, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS 및 생성 runtime.
검증: 요오31그룹·이동 접촉10그룹 및 전체25회귀·build/docs/check/verify/runtime 구문·ZIP 압축 해제 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.


## 3.0.0-character.226 — 2026-10-11

요오 일반/홀드 선딜 단일 아이콘 alpha0.85→0.55로 평소와 동일 유지. 반격의 공통 CC 방향은 away-from-impact로 실제 투사체 접촉점/범위 중심을 사용·enemy 관계만 허용. 반격 탱커/서포터 선택에 원래 효과 반경을 참조하는 적 전용 effectsOnly 전달을 조합하고 컨트롤러의 기존 전체 적 전달에도 CC 상속. 별도 반격 중심 범위 없음·일반 스킬에는 CC 추가 없음·자신/아군 제외. 공용 attack.select choice.modules는 선택된 AttackSpec에 전달 모듈을 합성·기존 triggered-attack snapshot 복제 유지. 서포터 100ms 반복 startNow가 자연 회복 틱을 초기화하던 오류를 lastNaturalHealthRegenTickAt 기반 최소 간격으로 수정. Entity 생성/리스폰에서 틱 기록 초기화. 겹친 영역/계속 공격·이동해도 기본 회복량·틱 주기 유지.

암살자 상호작용 검수: 델트루브 차막이는 DynamicWallService→DebugMapService.movementWalls의 실제 벽으로 일반 벽처럼 반사. 로온 빙수 영역은 벽 블록이 아닌 containEnteredTargets 원형 이탈 제한: 내부에 포획된 적은 암살자 이동으로 탈출 불가·경계에서 이동이 막혀 되돌아감. 외부에서는 별도 벽 충돌체가 아님. 반사/포획 동작 수치는 변경하지 않음.

대상: yoo 데이터, SelectableAttackService, NaturalHealthRegenActivityService, HealthRegenService, EntityService/EntityRespawnService, test-yoo, docs/YOO.md, README/PATCH LOG/project.json/DIVIDE TASKS 및 생성 runtime. 기존 모듈 확장·캐릭터 ID 분기·새 모듈 타입 없음.
검증: 요오36그룹(선딜 알파/원격 표시, 무피해3능력 실제 범위·관계·권위, 저격 접촉점 넉백, 로온 포획/동적 차막이, 실제 회복 영역 겹침·행동 중3초3틱)·전체25회귀·build/docs/check/verify/runtime 구문·ZIP 대조. 실제 브라우저/두 기기 온라인 플레이 미검증.
