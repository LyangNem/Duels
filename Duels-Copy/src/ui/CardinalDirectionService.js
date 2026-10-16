

// EntityRingLayoutService: 현재 Entity 주변에 실제 표시 중인 호/상태 링의 중심·선 두께를 한 기준으로 계산해 링 간격을 안정적으로 유지한다.
const CardinalDirectionService=Object.freeze({
  resolve(angle){
    const resolved=Number(angle)||0;
    const dx=Math.cos(resolved);
    const dy=Math.sin(resolved);
    return Math.abs(dx)>=Math.abs(dy)
      ?(dx>=0?'right':'left')
      :(dy>=0?'down':'up');
  },
  centerAngle(direction){
    const key=String(direction||'right');
    if(key==='down')return Math.PI/2;
    if(key==='left')return Math.PI;
    if(key==='up')return -Math.PI/2;
    return 0;
  },
  order:Object.freeze([
    'right','down','left','up'
  ])
});