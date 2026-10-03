


/* 훈련장 */

/* 입력 공급자 통합: 키보드 외 조작 장치는 provider로만 연결 */
const TrainingInputVectorService=Object.freeze({
  zero:Object.freeze({x:0,y:0}),
  providers:new Set(),
  output:{x:0,y:0},
  movement(keys){
    let x=(keys?.has('KeyD')?1:0)-(keys?.has('KeyA')?1:0);
    let y=(keys?.has('KeyS')?1:0)-(keys?.has('KeyW')?1:0);

    for(const provider of this.providers){
      const value=provider();
      if(!value)continue;
      x+=Number(value.x)||0;
      y+=Number(value.y)||0;
    }

    const length=Math.hypot(x,y);
    const out=this.output;
    if(length>1){
      out.x=x/length;
      out.y=y/length;
    }else{
      out.x=x;
      out.y=y;
    }
    return out;
  }
});