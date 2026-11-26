/* 벽 반사/적중 연쇄와 벽 반대편 AttackSpec 전달. 공통 투사체 권위 결과 복제. */
const ProjectileRedirectService=Object.freeze({
 declaredRelay(character,attackId){
  return Object.values(character?.attacks||{}).some(attack=>[...(attack.modules||[]),...(attack.attackFeatureTransform?.options||[]).flatMap(option=>option.modules||[])].some(module=>module.type==='projectile.wall-relay'&&module.attackId===attackId));
 },
 module(p,type){return ProjectileModuleService.module(p?.attack,type)},
 supports(config,event){return Array.isArray(config?.on)?config.on.includes(event):config?.on===event},
 extendRange(p,config,event){
  if(config.rangeGrowthOn&&!this.supports({on:config.rangeGrowthOn},event))return;
  const count=Number(p.rangeBounceCount)||0;
  const ratio=Math.max(0,Number(config.rangeGrowthRatio??config.rangeGrowthRatios?.[count])||0);
  if(!(ratio>0))return;
  const base=Number(p.rangeBounceBase)||Number(p.baseAttackRange)||Number(p.attack?.range)||0;
  p.rangeBounceBase=base;p.rangeBounceCount=count+1;
  p.maxTravelDistance=Math.max(Number(p.maxTravelDistance)||base,Number(p.travel)||0)+base*ratio;
  p.fadeResetTravel=Number(p.travel)||0;
 },
 nearest(p,config,exclude=null){
  let best=null,distance=config.searchRadius===0?Infinity:Math.max(0,Number(config.searchRadius)||600);
  for(const e of EntityService.items.values()){
   if(!e?.alive||e===exclude||p.hitIds?.has(e.id)||RelationService.relation(p.source,e)!=='enemy'||!ProjectileHomingTargetVisibilityService.canPerceive(p.source,e))continue;
   const point=NetworkCollisionPositionService.point(e),d=Math.hypot(point.x-p.x,point.y-p.y);
   const padding=ProjectileService.wallCollisionPadding(p);
   const angle=Math.atan2(point.y-p.y,point.x-p.x);
   const contactDistance=Math.max(0,d-(Number(e.radius)||0)-(Number(p.radius)||0));
   if(d>=distance||WorldGeometryService.raycastDistance(p.x,p.y,angle,contactDistance,padding)<contactDistance-1e-6)continue;
   best=e;distance=d;
  }
  return best;
 },
 aim(p,target,angle){
  delete p.relayPresentation;
  if(target){const point=NetworkCollisionPositionService.point(target);angle=Math.atan2(point.y-p.y,point.x-p.x)}
  const speed=Math.hypot(p.vx,p.vy)||Number(p.baseSpeed)||24;
  p.angle=angle;p.vx=Math.cos(angle)*speed;p.vy=Math.sin(angle)*speed;
  p.prevX=p.x;p.prevY=p.y;
  p.redirectRevision=(Number(p.redirectRevision)||0)+1;
 },
 broadcast(p){if(p.suppressRedirectBroadcast===true)return;GameEvents.emit('projectile-redirected',{projectile:p});},
 apply(p,snapshot){
  if(!p||!(snapshot.revision>Number(p.networkRedirectRevision||0)))return false;
  for(const k of ['x','y','angle','vx','vy','travel','revision','redirectCount'])if(!Number.isFinite(Number(snapshot[k])))return false;
  for(const k of ['x','y','angle','vx','vy','travel','redirectCount'])p[k]=Number(snapshot[k]);
  for(const k of ['maxTravelDistance','rangeBounceBase','rangeBounceCount','wallRedirectCount','hitRedirectCount','fadeResetTravel'])if(Number.isFinite(Number(snapshot[k])))p[k]=Number(snapshot[k]);
  p.baseSpeed=Math.hypot(p.vx,p.vy);
  p.prevX=p.x;p.prevY=p.y;p.redirectRevision=Number(snapshot.revision);p.networkRedirectRevision=Number(snapshot.revision);p.redirectEnded=snapshot.ended===true;
  if(snapshot.relayPresentation){const relay=EntityService.items.get(snapshot.relayPresentation.entityId);if(relay)ModeStateService.applyRemote(relay,snapshot.relayPresentation.modeStates,performance.now());}
  for(const id of snapshot.hitIds||[])p.hitIds.add(String(id));return true;
 },
 retargetOwned(source,config){
  if(!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return 0;
  let changed=0;
  for(const p of ProjectileService.items){
   if(p.source!==source||config.family&&p.attack?.projectileFamily!==config.family||!(Math.hypot(p.vx,p.vy)>0)||p.redirectEnded===true)continue;
   const target=this.nearest(p,config);if(!target)continue;
   this.aim(p,target,p.angle);this.broadcast(p);changed++;
  }
  return changed;
 },
 relaySummon(p,target,now=performance.now()){
  const config=target?.summonSpec?.projectileRelay;
  if(!config||config.family!==p.attack?.projectileFamily||!EntitySimulationAuthorityService.isLocal(p.source))return false;
  if(config.ownerOnly===true&&String(target.ownerId)!==String(p.source.id))return false;
  const contacts=p._relayContacts||(p._relayContacts=new Map());if(contacts.has(target.id))return false;
  const ratio=Math.max(0,Math.min(1,ProjectileCollisionShapeService.contactRatio(p,target))),oldX=p.x,oldY=p.y;
  p.x=p.prevX+(oldX-p.prevX)*ratio;p.y=p.prevY+(oldY-p.prevY)*ratio;
  const next=this.nearest(p,config);if(!next){p.x=oldX;p.y=oldY;return false;}
  const advanced=Math.hypot(oldX-p.prevX,oldY-p.prevY);
  p.travel=Math.max(0,(Number(p.travel)||0)-advanced*(1-ratio));
  contacts.set(target.id,true);this.aim(p,next,p.angle);if(config.rotationStateKey){ModeStateService.toggle(target,{stateKey:config.rotationStateKey,values:['a','b']});p.relayPresentation={entityId:target.id,modeStates:ModeStateService.serialize(target,now)};}this.broadcast(p);return true;
 },
 hit(p,target){
  const config=this.module(p,'projectile.redirect');
  if(!this.supports(config,'hit'))return false;
  this.extendRange(p,config,'hit');
  const limit=config.maxRedirects===0?Infinity:Number(config.maxRedirects||0);
  const next=(Number(p.hitRedirectCount)||0)<limit?this.nearest(p,config,target):null;
  if(!next){p.redirectEnded=true;p.redirectRevision=(Number(p.redirectRevision)||0)+1;this.broadcast(p);return false;}
  p.hitRedirectCount=(Number(p.hitRedirectCount)||0)+1;p.redirectCount=(Number(p.redirectCount)||0)+1;const multiplier=Number(config.hitSpeedMultiplier??1);p.vx*=multiplier;p.vy*=multiplier;this.aim(p,next,p.angle);this.broadcast(p);return true;
 },
  contact(p,boundary=false){
  const pad=Number(p.radius)||0,epsilon=.01;
  const dx=Math.cos(p.angle),dy=Math.sin(p.angle);
  if(boundary){
   const nx=p.x<=pad+epsilon&&dx<0?1:p.x>=WorldBoundsService.width()-pad-epsilon&&dx>0?-1:0;
   const ny=p.y<=pad+epsilon&&dy<0?1:p.y>=WorldBoundsService.height()-pad-epsilon&&dy>0?-1:0;
   return {nx,ny,wall:null};
  }
  let best=null,bestAt=Infinity;
  const ex=p.x+dx*.1,ey=p.y+dy*.1;
  for(const wall of DebugMapService.walls()){
   const at=WorldGeometryService.segmentRectEntry(p.prevX,p.prevY,ex,ey,wall,pad);
   if(at===null||at>bestAt+1e-6)continue;
   const x=p.prevX+(ex-p.prevX)*at,y=p.prevY+(ey-p.prevY)*at;
   const nx=Math.abs(x-(wall.x-pad))<epsilon&&dx>0?-1:Math.abs(x-(wall.x+wall.w+pad))<epsilon&&dx<0?1:0;
   const ny=Math.abs(y-(wall.y-pad))<epsilon&&dy>0?-1:Math.abs(y-(wall.y+wall.h+pad))<epsilon&&dy<0?1:0;
   if(!nx&&!ny)continue;
   if(best&&Math.abs(at-bestAt)<1e-6){best.nx=best.nx||nx;best.ny=best.ny||ny;}
   else{best={nx,ny,wall};bestAt=at;}
  }
  if(!best){
   // A shot born within expanded wall padding has no entering face.
   // Preserve the contacted block so relay delivery can still find its exit.
   for(const wall of DebugMapService.walls()){
    if(p.x<wall.x-pad||p.x>wall.x+wall.w+pad||p.y<wall.y-pad||p.y>wall.y+wall.h+pad)continue;
    const horizontal=Math.abs(dx)>=Math.abs(dy);
    best={nx:horizontal?-Math.sign(dx):0,ny:horizontal?0:-Math.sign(dy),wall};break;
   }
  }
  return best;
 },
 clearContact(p,dx,dy){
  const pad=Number(p.radius)||0,walls=DebugMapService.walls();
  let total=0;
  // Expanded adjacent blocks form a union. Clear every overlapping block,
  // including bullets spawned inside the collision padding near a wall.
  for(let step=0;step<=walls.length;step++){
   let distance=0;
   for(const wall of walls){
    const left=wall.x-pad,right=wall.x+wall.w+pad,top=wall.y-pad,bottom=wall.y+wall.h+pad;
    if(p.x<left||p.x>right||p.y<top||p.y>bottom)continue;
    const tx=dx>1e-9?(right-p.x)/dx:dx<-1e-9?(left-p.x)/dx:Infinity;
    const ty=dy>1e-9?(bottom-p.y)/dy:dy<-1e-9?(top-p.y)/dy:Infinity;
    distance=Math.max(distance,Math.min(tx,ty)+2);
   }
   if(!(distance>0)||!Number.isFinite(distance))break;
   p.x+=dx*distance;p.y+=dy*distance;total+=distance;
  }
  p.travel=(Number(p.travel)||0)+total;
 },
 wall(p,boundary){
  const contact=this.contact(p,boundary);
  const relay=this.module(p,'projectile.wall-relay');if(relay&&!boundary)this.relay(p,relay,contact);
  const config=this.module(p,'projectile.redirect');
  const limit=config?.maxWallRedirects===0?Infinity:Number(config?.maxWallRedirects??config?.maxRedirects??0);
  if(!this.supports(config,'wall')||(Number(p.wallRedirectCount)||0)>=limit)return false;
  const incoming=p.angle;
  const nx=contact?.nx||0,ny=contact?.ny||0;
  let angle=nx||ny?Math.atan2(ny?-p.vy:p.vy,nx?-p.vx:p.vx):incoming+Math.PI;
  // A face-normal push clears adjacent block seams; backing along a grazing ray did not.
  const length=Math.hypot(nx,ny)||1;
  const pushX=nx||ny?nx/length:-Math.cos(incoming),pushY=nx||ny?ny/length:-Math.sin(incoming);
  if(boundary){p.x+=pushX*2;p.y+=pushY*2;p.travel=(Number(p.travel)||0)+2;}
  else this.clearContact(p,pushX,pushY);
  const target=this.nearest(p,config);
  if(target){const point=NetworkCollisionPositionService.point(target),candidate=Math.atan2(point.y-p.y,point.x-p.x);
   if(WorldGeometryService.raycastDistance(p.x,p.y,candidate,2,Number(p.radius)||0)>=2-1e-6)angle=candidate;
  }
  p.wallRedirectCount=(Number(p.wallRedirectCount)||0)+1;p.redirectCount=(Number(p.redirectCount)||0)+1;this.extendRange(p,config,'wall');this.aim(p,null,angle);
  const speedMultiplier=config.wallSpeedOnce===true&&p.wallRedirectCount>1?1:Math.max(0,Number(config.wallSpeedMultiplier??1));
  if(Number.isFinite(speedMultiplier)){p.vx*=speedMultiplier;p.vy*=speedMultiplier;p.baseSpeed=Math.hypot(p.vx,p.vy);}
  if(EntitySimulationAuthorityService.isLocal(p.source))this.broadcast(p);return true;
 },
 pressureContact(source,attack,angle,origin,length,halfWidth){
  const dx=Math.cos(angle),dy=Math.sin(angle);
  let best=null;
  for(const target of EntityService.items.values()){
   const config=target?.summonSpec?.projectileRelay;
   if(!target.alive||!config||config.family!==attack.projectileFamily||(config.ownerOnly&&String(target.ownerId)!==String(source.id)))continue;
   const px=target.x-origin.x,py=target.y-origin.y,along=px*dx+py*dy,across=Math.abs(-px*dy+py*dx),radius=Math.max(0,Number(target.radius)||0);
   const side=Math.max(0,across-halfWidth);if(side>radius)continue;
   const at=Math.max(0,along-Math.sqrt(Math.max(0,radius*radius-side*side)));
   if(along+radius<0||at>length||best&&at>=best.length)continue;
   if(WorldGeometryService.segmentBlocked(origin.x,origin.y,origin.x+dx*at,origin.y+dy*at,0))continue;
   const point={x:origin.x+dx*at,y:origin.y+dy*at};
   if(!this.nearest({source,attack,...point,radius:Number(this.module({attack},'delivery.projectile')?.radius)||0,hitIds:new Set()},config))continue;
   best={length:at,target};
  }
  const relay=this.module({attack},'projectile.wall-relay'),redirect=this.module({attack},'projectile.redirect');
  if(relay||this.supports(redirect,'wall')){
   const at=WorldGeometryService.raycastDistance(origin.x,origin.y,angle,length,0);
   if(at<=length&&(!best||at<best.length)){
    const carrier={source,attack,angle,radius:0,prevX:origin.x,prevY:origin.y,x:origin.x+dx*at,y:origin.y+dy*at};
    const contact=this.contact(carrier,false);if(contact?.wall)best={length:at,carrier,contact,relay,wallBounce:this.supports(redirect,'wall')};
   }
  }
  if(this.supports(redirect,'wall')){
   // The map edge is not a wall block. Test the outgoing bullet's center boundary.
   const radius=Math.max(0,Number(this.module({attack},'delivery.projectile')?.radius)||0);
   const at=WorldGeometryService.boundaryRayDistance(origin.x,origin.y,angle,length,radius);
   const carrier={source,attack,angle,radius,prevX:origin.x,prevY:origin.y,x:origin.x+dx*at,y:origin.y+dy*at};
   const contact=this.contact(carrier,true);
   if((contact.nx||contact.ny)&&at<=length&&(!best||at<best.length))best={length:at,carrier,contact,boundary:true,wallBounce:true};
  }
  return best;
 },
 resolvePressureContact(source,attack,angle,origin,range,plan,key){
  if(!plan)return false;
  if(plan.contact?.wall||plan.boundary){
   if(!EntitySimulationAuthorityService.isLocal(source))return true;
   if(!plan.wallBounce){plan.carrier.networkKey=key;return this.relay(plan.carrier,plan.relay,plan.contact);}
   const delivery=this.module({attack},'delivery.projectile');if(!delivery)return false;
   const speed=Math.max(0,Number(delivery.speed)||0);
   const carrier={...plan.carrier,radius:Math.max(0,Number(delivery.radius)||0),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,baseSpeed:speed,travel:0,hitIds:new Set(),networkKey:key,suppressRedirectBroadcast:true};
   // Reuse actual wall normals, seam clearance, visibility-safe homing, relay and bounce slowdown.
   if(!this.wall(carrier,plan.boundary===true))return false;
   const outgoing={...attack,range:Math.max(0,Number(attack.range)||0)+range-plan.length-(Number(carrier.travel)||0),modules:attack.modules.map(m=>m.type==='delivery.projectile'?{...m,speed:Math.hypot(carrier.vx,carrier.vy),origin:{type:'point',x:carrier.x,y:carrier.y}}:m.type==='projectile.redirect'&&m.wallSpeedOnce===true?{...m,wallSpeedMultiplier:1}:m)};
   TriggeredAttackService.execute(source,outgoing,carrier.angle);return true;
  }
  const target=plan.target,config=target?.summonSpec?.projectileRelay;if(!target?.alive||!config)return false;
  const point={x:origin.x+Math.cos(angle)*plan.length,y:origin.y+Math.sin(angle)*plan.length};
  const carrier={source,attack,...point,radius:Number(this.module({attack},'delivery.projectile')?.radius)||0,hitIds:new Set()};
  const enemy=this.nearest(carrier,config);if(!enemy)return false;
  if(!EntitySimulationAuthorityService.isLocal(source))return true;
  const enemyPoint=NetworkCollisionPositionService.point(enemy),direction=Math.atan2(enemyPoint.y-point.y,enemyPoint.x-point.x);
  if(config.rotationStateKey)ModeStateService.toggle(target,{stateKey:config.rotationStateKey,values:['a','b']});
  // A real shared projectile delivery inherits speed and remaining range; the pressure never continues beyond the relay.
  const outgoing={...attack,range:Math.max(0,Number(attack.range)||0)+range-plan.length,modules:attack.modules.map(m=>m.type==='delivery.projectile'?{...m,origin:{type:'point',...point}}:m)};
  TriggeredAttackService.execute(source,outgoing,direction);return true;
 },
 fireRelay(source,attack,point,angle,key,sequence=0){
  if(!source||!attack||!key||!Number.isFinite(point?.x)||!Number.isFinite(point?.y)||!Number.isFinite(angle))return false;
  if(!source._wallRelayKeys)source._wallRelayKeys=new Set();
  if(source._wallRelayKeys.has(key))return false;
  source._wallRelayKeys.add(key);if(source._wallRelayKeys.size>128)source._wallRelayKeys.delete(source._wallRelayKeys.values().next().value);
  attack=AugmentService.prepareAttack(source,ProgressScaledAttackService.resolve(source,attack),performance.now());
  const execution=sequence>0?AttackExecutionService.replica(source,attack,sequence,angle):AttackExecutionService.create(source,attack,angle);
  source._wallRelaySequence=execution.sequence;
  AttackExecutionService.setImpactOrigin(execution,{mode:'point',...point});
  AttackExecutionService.setKoOrigin(execution,{mode:'point',...point});
  const volley={execution,hits:0,total:1,resolved:0,finished:false};
  const module=ProjectileModuleService.module(attack,'delivery.area');
  AreaAttackService.execute(source,attack,angle,module,volley,{geometrySource:point});
  return true;
 },
  relay(p,config,contact=this.contact(p,false)){
  const bounce=Number(p.wallRedirectCount)||0;
  if(p.relayAtBounce===bounce)return false;
  if(!EntitySimulationAuthorityService.isLocal(p.source))return false;
  const attack=AbilityService.attackById(p.source.character,String(config.attackId||''));if(!attack)return false;
  const wall=contact?.wall;if(!wall)return false;
  const dx=Math.cos(p.angle),dy=Math.sin(p.angle),epsilon=.05;
  // Start inside the actual contacted block, not at radius/speed along an oblique ray.
  const sx=Math.max(wall.x+epsilon,Math.min(wall.x+wall.w-epsilon,p.x-contact.nx*(Number(p.radius)||0)+dx*epsilon));
  const sy=Math.max(wall.y+epsilon,Math.min(wall.y+wall.h-epsilon,p.y-contact.ny*(Number(p.radius)||0)+dy*epsilon));
  const intervals=[];
  for(const block of DebugMapService.walls()){
   let enter=-Infinity,exit=Infinity;
   for(const [origin,direction,lo,hi] of [[sx,dx,block.x,block.x+block.w],[sy,dy,block.y,block.y+block.h]]){
    if(Math.abs(direction)<1e-9){if(origin<lo||origin>hi){exit=-1;break;}continue;}
    const a=(lo-origin)/direction,b=(hi-origin)/direction;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
   }
   if(exit>=Math.max(0,enter))intervals.push({enter,exit});
  }
  intervals.sort((a,b)=>a.enter-b.enter);
  let distance=0;
  for(const interval of intervals){if(interval.enter>distance+epsilon)break;distance=Math.max(distance,interval.exit);}
  const x=sx+dx*(distance+2),y=sy+dy*(distance+2);
  if(!distance||x<0||y<0||x>WorldBoundsService.width()||y>WorldBoundsService.height())return false;
  p.relayAtBounce=bounce;
  const key=`relay:${p.networkKey||p.volley?.execution?.sequence}:${attack.id}:${bounce}`;
  this.fireRelay(p.source,attack,{x,y},p.angle,key);
  GameEvents.emit('projectile-wall-relayed',{source:p.source,attackId:attack.id,point:{x,y},angle:p.angle,key,executionSequence:p.source._wallRelaySequence});
  return true;
 }
});
