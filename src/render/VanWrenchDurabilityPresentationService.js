

const VanWrenchDurabilityPresentationService=Object.freeze({
  state(entity){
    if(!entity?.character?.wrenchDurability)return null;
    return ProgressStateService.state(
      entity,
      'van-wrench-durability'
    );
  },
  value(entity){
    if(!entity?.character?.wrenchDurability)return 0;
    const state=this.state(entity);
    if(state)return Math.max(0,Number(state.value)||0);
    return Math.max(
      0,
      Number(entity.character?.wrenchDurability?.max)||0
    );
  },
  drawBehind(ctx,entity,alpha=1){
    if(!ctx||!entity||this.value(entity)<=0)return false;

    const radius=Math.max(12,Number(entity.radius)||20);
    const color=String(entity.character?.color||entity.color||'#9fcf55');
    const baseRgb=String(ColorService.rgbString(color,'159,207,85')).split(',').map(v=>Math.max(0,Math.min(255,Number(v)||0)));
    const darkRgb=`${Math.round(baseRgb[0]*0.66)},${Math.round(baseRgb[1]*0.66)},${Math.round(baseRgb[2]*0.66)}`;

    // 캐릭터 뒤 표시는 같은 스패너 형태를 재사용하되, 본체보다 어둡게 깔아 배경 아이콘처럼 보이게 한다.
    // 전체 길이는 캐릭터 지름의 약 3배, 머리는 좌상단을 향하도록 고정.
    return WrenchShapeRenderService.draw(ctx,{
      x:0,
      y:0,
      angle:-Math.PI*.75,
      radius:radius*2.73,
      alpha:Math.max(0,Math.min(1,Number(alpha)||0)),
      bodyRgb:darkRgb,
      strokeColor:'218,240,192',
      strokeWidth:Math.max(2,Math.round(radius*.12)),
      glow:Math.max(8,radius*.72)
    });
  }
});