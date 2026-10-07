/* 개별 누적 호 게이지 은행. 활성 무기와 최근 갱신만 강조하며 소유자 전용. */
const EquipmentGaugePresentationService=Object.freeze({
 thresholds(ctx,e,module){
  if(e!==Training.player)return false;
  const config=ReactiveEquipmentService.config(e);if(!config)return false;
  const active=ModeStateService.current(e,config.stateKey,config.initial);
  let ranges=e._equipmentThresholdRanges;
  if(!ranges||ranges.active!==active){
   const attack=AbilityService.attackById(e.character,config.farAttackId);
   ranges=e._equipmentThresholdRanges={active,outer:Number(attack?.range)||config.longDistance};
  }
  ctx.save();ctx.globalAlpha=Number(module.alpha??.4);ctx.strokeStyle=module.color||e.color;ctx.lineWidth=Number(module.lineWidth)||1.5;ctx.setLineDash(module.dash||[]);
  ctx.beginPath();ctx.arc(e.x,e.y,config.closeDistance,0,Math.PI*2);ctx.stroke();
  if(ranges.outer!==config.closeDistance){ctx.beginPath();ctx.arc(e.x,e.y,ranges.outer,0,Math.PI*2);ctx.stroke();}ctx.restore();return true;
 },
 draw(ctx,e,module,now=performance.now()){
  if(e!==Training.player)return false;
  const config=ReactiveEquipmentService.config(e);if(!config)return false;
  const active=ModeStateService.current(e,config.stateKey,config.initial);
  const scale=(Number(e.radius)||20)/20;
  const render=e._equipmentGaugeRender||(e._equipmentGaugeRender={anchor:{x:0,y:0,radius:7,color:e.color},track:{visibility:'all',color:'rgba(255,255,255,.3)',lineWidth:2,showEmpty:true},fill:{visibility:'all',lineWidth:3,showEmpty:true}});
  ctx.save();ctx.translate(Number(e.x)||0,Number(e.y)||0);
  for(let i=0;i<config.items.length;i++){
   const item=config.items[i],state=ProgressStateService.state(e,item.stateKey);
   const ratio=Math.max(0,Math.min(1,(Number(state?.value)||0)/item.required));
   const elapsed=now-Number(state?.lastActivityAt??-Infinity);
   const activity=Math.max(0,Math.min(1,1-(elapsed-Number(module.holdMs||500))/Number(module.fadeMs||500)));
   ctx.globalAlpha=active===item.value?1:Number(module.idleAlpha??.35)+(1-Number(module.idleAlpha??.35))*activity;
   const columns=Math.max(1,Number(module.columns)||1);
   const x=(Number(module.x??38)+(i%columns)*Number(module.gap||18))*scale,y=(Number(module.y??-63)+Math.floor(i/columns)*Number(module.gap||18))*scale,r=Number(module.radius||7)*scale;
   render.anchor.x=x;render.anchor.y=y;render.anchor.radius=r;render.track.radius=r;render.fill.radius=r;render.fill.color=active===item.value?(module.activeColor||module.color||e.color):(module.color||e.color);
   ArcGaugePresentationService.render(ctx,render.anchor,1,render.track);
   ArcGaugePresentationService.render(ctx,render.anchor,ratio,render.fill);

  }
  ctx.restore();return true;
 }
});
