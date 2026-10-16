/* movement.path-carrier: shared drag route, swept ally pickup and owner-authoritative transport.
   The visual route travels on every client; each client moves only its own riders. */
const PathCarrierService=Object.freeze({
  KIND:'path-carrier-rider',
  riderKey:'movement:path-carrier-rider',
  start(context,module){
    const source=context.source;
    if(context.network===true||!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return false;
    const raw=(context.dragPath||[]).slice(0,DragPathInputService.MAX_POINTS).filter(point=>Number.isFinite(point?.x)&&Number.isFinite(point?.y));
    const start=module.pathOrigin==='pointer'?raw[0]:source;
    if(!start)return false;
    const points=[{x:Number(start.x),y:Number(start.y)}];
    const radius=Math.max(1,Number(module.radius)||25);
    let total=0;
    const maximum=Number.isFinite(Number(module.maxDistance))?Math.max(0,Number(module.maxDistance)):Infinity;
    for(const point of raw){
      if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y))continue;
      const from=points[points.length-1],distance=Math.hypot(point.x-from.x,point.y-from.y);
      if(distance<.001)continue;
      const angle=Math.atan2(point.y-from.y,point.x-from.x);
      const requested=Math.min(distance,Math.max(0,maximum-total));
      const allowed=CollisionPolicyService.entityTravelDistance({...source,...from,radius},angle,requested,module.collision);
      if(allowed>.001){points.push({x:from.x+Math.cos(angle)*allowed,y:from.y+Math.sin(angle)*allowed});total+=allowed;}
      if(allowed<distance-.001)break;
    }
    if(total<.001)return false;
    const speed=Math.max(1,Number(module.speed)||1200),now=Number(context.now)||performance.now();
    const summonStateKey=String(module.summonStateKey||'');
    let summonSnapshot=null;
    if(summonStateKey){
      const spec=SummonDeployService.spec(source,summonStateKey);
      if(!spec)return false;
      // A new use replaces the prior route, not the owner's movement or stored summon health.
      for(const old of Training.fx)if(old.type==='pathCarrier'&&old.sourceEntityId===source.id&&old.summonStateKey===summonStateKey){this.release(old);old.dur=0;}
      const state=SummonDeployService.state(source,summonStateKey,true);
      if(state.active)SummonDeployService.recall(source,summonStateKey);
      state.health=Number(spec.maxHealth)||1;state.destroyedUntil=0;state.readyFlashUntil=0;
      state.pathCarrierSequence=(Number(state.pathCarrierSequence)||0)+1;state.pathCarrierEnded=false;
      const robot=SummonDeployService.spawn(source,summonStateKey,{x:points[0].x,y:points[0].y});
      if(!robot)return false;
      // The summon uses common wall/boundary spawn correction; only the route start follows it.
      const offset=Math.hypot(robot.x-points[0].x,robot.y-points[0].y);
      if(offset>.001){points[0]={x:robot.x,y:robot.y};total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);}
      summonSnapshot=SummonDeployService.serialize(source,now).find(item=>item.stateKey===summonStateKey);
    }
    const effect=EffectSpawnService.spawn({type:'pathCarrier',key:`path-carrier:${source.id}:${context.abilityUseId||now}`,
      summonStateKey,summonSnapshot,x:points[0].x,y:points[0].y,points,total,speed,radius,pickupRange:Math.max(0,Number(module.pickupRange)||45),
      collision:module.collision,riderCollision:module.riderCollision||module.collision,targetRelations:module.targetRelations||['ally'],color:module.color||source.color,name:module.name||'',start:now,dur:total/speed*1000+160},{source});
    if(effect&&OnlinePresentationSyncService?.shouldSend?.(source))OnlinePresentationSyncService.send('effect-spawn',source,{effect:EffectSpawnService.presentationSnapshot(effect,now)});
    return !!effect;
  },
  wallPassKey:'movement:path-carrier-wall-pass',
  clearRider(entity,effect){
    if(entity?.actionState?.get(this.riderKey)?.effect!==effect)return;
    entity.actionState.delete(this.riderKey);
    BuffService.remove(entity,'wallPass',this.wallPassKey);
    if(entity.alive&&EntitySimulationAuthorityService.isLocal(entity))MovementService.ensureValidPosition(entity);
  },
  carrierFor(entity){
    if(!entity?.alive)return null;
    const effect=entity.actionState?.get(this.riderKey)?.effect;
    const snapshot=effect?{ownerId:effect.sourceEntityId,stateKey:effect.summonStateKey,sequence:effect.summonSnapshot?.pathCarrierSequence}:entity._remotePathCarrierRide;
    if(!snapshot?.stateKey)return null;
    const owner=EntityService.items.get(String(snapshot.ownerId||'')),state=SummonDeployService.state(owner,snapshot.stateKey,false);
    const robot=SummonDeployService.entity(owner,snapshot.stateKey);
    return state?.active&&!state.pathCarrierEnded&&state.pathCarrierSequence===snapshot.sequence&&robot?.alive&&robot.health>0?robot:null;
  },
  serialize(entity){
    const carrier=this.carrierFor(entity);
    if(!carrier)return null;
    const owner=EntityService.items.get(String(carrier.ownerId||'')),state=SummonDeployService.state(owner,carrier.summonStateKey,false);
    return {ownerId:owner.id,stateKey:carrier.summonStateKey,sequence:state.pathCarrierSequence};
  },
  applyRemote(entity,snapshot){
    if(!entity||EntitySimulationAuthorityService.isLocal(entity))return false;
    entity._remotePathCarrierRide=snapshot&&typeof snapshot.ownerId==='string'&&typeof snapshot.stateKey==='string'&&Number.isFinite(snapshot.sequence)
      ?{ownerId:snapshot.ownerId,stateKey:snapshot.stateKey,sequence:snapshot.sequence}:null;
    return true;
  },
  projectileTarget(projectile,target){
    const policy=projectile.behavior?.collisionPolicy;
    if(policy?.passEnemies===true||projectile.behavior?.pierce?.targets===true||projectile.rehitInterval>0||projectile.attack?.effectsOnly===true||projectile.projectile?.collisionTargets===true||(projectile.attack?.modules||[]).some(m=>m.type==='delivery.range-projectile'))return target;
    const carrier=this.carrierFor(target);
    return carrier?.summonSpec?.protectRidersFromProjectiles===true&&RelationService.relation(projectile.source,target)==='enemy'&&RelationService.relation(projectile.source,carrier)==='enemy'?carrier:target;
  },
  carried(entity){
    const state=entity?.actionState?.get(this.riderKey);
    return state?.kind===this.KIND&&entity.alive!==false;
  },
  release(effect){
    for(const id of effect?.carrierState?.riders||[]){
      const entity=EntityService.items.get(id),state=entity?.actionState?.get(this.riderKey);
      if(state?.effect===effect)this.clearRider(entity,effect);
    }
    if(effect?.carrierState)effect.carrierState.riders.clear();
    if(effect?.summonStateKey){
      const owner=EntityService.items.get(String(effect.sourceEntityId||''));
      const state=SummonDeployService.state(owner,effect.summonStateKey,false);
      if(state&&state.pathCarrierSequence===effect.summonSnapshot?.pathCarrierSequence){
        state.pathCarrierEnded=true;
        const robot=SummonDeployService.entity(owner,effect.summonStateKey);
        if(robot)BuffService.remove(robot,'wallPass',this.wallPassKey);
        if(state.active)SummonDeployService.recall(owner,effect.summonStateKey);
      }
    }
  },
  segment(effect,source,from,to){
    const state=effect.carrierState,dx=to.x-from.x,dy=to.y-from.y,length2=dx*dx+dy*dy;
    for(const entity of EntityService.items.values()){
      if(!entity?.alive||entity.kind==='summon'||!entity.actionState||!EntitySimulationAuthorityService.isLocal(entity)||!effect.targetRelations.includes(RelationService.relation(source,entity)))continue;
      const existing=entity.actionState.get(this.riderKey);
      if(existing&&existing.effect!==effect)continue;
      if(!state.riders.has(entity.id)){
        const point=NetworkCollisionPositionService.point(entity);
        const t=length2?Math.max(0,Math.min(1,((point.x-from.x)*dx+(point.y-from.y)*dy)/length2)):0;
        const near={x:from.x+dx*t,y:from.y+dy*t};
        if(Math.hypot(point.x-near.x,point.y-near.y)>effect.pickupRange+(Number(entity.radius)||0)||WorldGeometryService.segmentBlocked(point.x,point.y,near.x,near.y,0))continue;
        if(entity.forcedMotion)MovementService.finalizeForcedMotion(entity);
        MovementAbilityService.clear(entity);
        entity.actionState.set(this.riderKey,{kind:this.KIND,effect});state.riders.add(entity.id);
      }
      if(effect.riderCollision?.passWalls===true)BuffService.refresh(entity,'wallPass',1,this.wallPassKey,200);
      // Riders use the declared carrier collision policy, including wall passage.
      const distance=Math.hypot(to.x-entity.x,to.y-entity.y),angle=Math.atan2(to.y-entity.y,to.x-entity.x);
      const allowed=CollisionPolicyService.entityTravelDistance(entity,angle,distance,effect.riderCollision||{passWalls:false,passEnemies:true});
      entity.x+=Math.cos(angle)*allowed;entity.y+=Math.sin(angle)*allowed;
      if(allowed<distance-.001){this.clearRider(entity,effect);state.riders.delete(entity.id);}
    }
    for(const id of [...state.riders]){
      const entity=EntityService.items.get(id);
      if(!entity?.alive||entity.actionState?.get(this.riderKey)?.effect!==effect){this.clearRider(entity,effect);state.riders.delete(id);}
    }
  },
  update(effect,now){
    if(effect?.type!=='pathCarrier')return false;
    const source=EntityService.items.get(String(effect.sourceEntityId||''));
    if(!source?.alive||!Array.isArray(effect.points)||effect.points.length<2){this.release(effect);effect.dur=0;return false;}
    if(!effect.carrierState){
      if(effect.summonStateKey&&!EntitySimulationAuthorityService.isLocal(source)&&effect.summonSnapshot)SummonDeployService.applyRemote(source,[effect.summonSnapshot],now);
      effect.x=effect.points[0].x;effect.y=effect.points[0].y;effect.carrierState={distance:0,index:1,riders:new Set(),finished:false};
    }
    const robot=effect.summonStateKey?SummonDeployService.entity(source,effect.summonStateKey):null;
    if(effect.summonStateKey){
      const summonState=SummonDeployService.state(source,effect.summonStateKey,false);
      if(!robot?.alive||robot.health<=0||summonState?.pathCarrierEnded||summonState?.pathCarrierSequence!==effect.summonSnapshot?.pathCarrierSequence){this.release(effect);effect.dur=0;return false;}
    }
    const state=effect.carrierState;
    if(state.finished)return false;
    const target=Math.min(effect.total,Math.max(0,now-effect.start)*effect.speed/1000);
    let remaining=Math.max(0,target-state.distance);
    // Process every crossed segment, including bends, even on a long frame.
    while(remaining>.0001&&state.index<effect.points.length){
      const point=effect.points[state.index],from={x:effect.x,y:effect.y},distance=Math.hypot(point.x-from.x,point.y-from.y);
      if(distance<.0001){state.index++;continue;}
      const step=Math.min(remaining,distance),to={x:from.x+(point.x-from.x)*step/distance,y:from.y+(point.y-from.y)*step/distance};
      this.segment(effect,source,from,to);effect.x=to.x;effect.y=to.y;effect.angle=Math.atan2(to.y-from.y,to.x-from.x);
      remaining-=step;state.distance+=step;if(step>=distance-.0001)state.index++;
    }
    if(robot){if(effect.collision?.passWalls===true)BuffService.refresh(robot,'wallPass',1,this.wallPassKey,200);robot.x=effect.x;robot.y=effect.y;}
    if(state.distance>=effect.total-.0001){state.finished=true;this.release(effect);}
    return true;
  },
  draw(ctx,effect,now){
    const fade=Math.max(0,Math.min(1,(effect.dur-(now-effect.start))/160));
    ctx.save();ctx.translate(effect.x,effect.y);ctx.globalAlpha=fade;ctx.fillStyle=effect.color;ctx.strokeStyle=ColorService.brighten(effect.color,.55);ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-22,-17,44,34,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=`rgb(${ColorService.rgbString(effect.color).split(',').map(value=>Math.round(Number(value)*.55)).join(',')})`;ctx.fillRect(-15,-8,30,13);
    ctx.strokeStyle=ColorService.brighten(effect.color,.8);ctx.beginPath();ctx.moveTo(-10,-2);ctx.lineTo(-4,-2);ctx.moveTo(4,-2);ctx.lineTo(10,-2);ctx.stroke();
    ctx.fillStyle=effect.color;ctx.fillRect(-26,14,15,7);ctx.fillRect(11,14,15,7);
    ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(0,-25);ctx.stroke();ctx.beginPath();ctx.arc(0,-26,3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
});
