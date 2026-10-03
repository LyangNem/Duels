



/* 전투 데이터 */
/*
 * 캐릭터 설정 읽기: CHARACTER_DATA만 편집한 뒤 파일을 다시 열면 전투/설명/카드에 함께 반영된다.
 * 시간은 ms, 거리/반지름은 게임 좌표 px, speed는 1프레임 이동량, 비율은 1=100%.
 * damageRatio × stats.baseDamage가 기본 피해. modifier.value는 0.2=20%.
 * characterValue('경로'): 같은 캐릭터 안의 원본을 참조한다. 숫자를 복사하지 않는다.
 * characterValue('경로', 배율): 원본의 배율. characterCount는 배열의 실제 요소 수.
 * 설명의 {v:경로}, {v:경로|seconds}, {v:경로|percent}도 같은 원본을 읽는다.
 * 분류: style/role은 아래 표의 번호, range는 0=실제 평타 최대 사거리로 자동 분류.
 * 별개 기술의 서로 다른 값은 독립 항목이다. 같은 숫자라는 이유로 합치지 않는다.
 * 조회 예: CharacterDataService.numbers('xianelli')는 해석된 모든 숫자와 경로를 반환한다.
 * 공통 엔진의 배열 인덱스·기하 공식·정규화 0/1은 캐릭터 밸런스 값이 아니다.
 */
function characterValue(path,scale=1){
  return scale===1?{$ref:path}:{$ref:path,$scale:scale};
}