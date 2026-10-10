# 디라 현재 계약 — 3.0.0-character.200

디라 평타 식재료가 자기 스토브에 적중하면 source 디라의 스테미나150 회복. 기존식재료투입/소비와 아군회복 유지. 타플레이어/타소환수/타인스토브에는 새스테미나회복없음·실행당1회·원격미러 중복제외.

기존 resource.restore on-hit/source/oncePerExecution과 공용 cooking.own-stove 조건 조합. 조건은 CookingService.isOwnStove 재사용. 새캐릭터ID분기없음.

디라스토브1그룹 및 전체18회귀 통과. 실제적중모듈경로에서150회복/중복제외/타인스토브와아군제외/최대치/원격미러제외 검증. build/docs/check/verify/runtime구문/ZIP무결성 통과. 실제온라인 플레이 미검증.

## 이전 기록(200이 우선)

