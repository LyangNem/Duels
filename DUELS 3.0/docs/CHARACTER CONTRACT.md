# 캐릭터 데이터 계약

현재 공식 캐릭터 58명의 데이터는 src/data/characters/<id>.js에 각각 보관한다. 파일 내용은 캐릭터 객체 표현식이며 독립 실행 스크립트나 ESM이 아니다. 조립기가 index.json의 출시 순서로 합쳐 freezeCharacterData를 한 번 적용한다. 기존 characterValue/characterCount/characterSum/characterProduct 참조도 같은 원본 실행 문맥에서 해석한다.

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
