/* 모든 월드 무기: 공용 형상 목록·계열 팔레트·조건·투명도·회전·사용 모션. */
const ModeGearPresentationService=Object.freeze({
  weaponEchoes:new Map(),
  echo(entity,start,duration=650,expansion=.55,imageAlpha=null,imageConfig=null,origin=null,imageColor=null){
    if(!entity)return false;
    for(const [id,list] of this.weaponEchoes){const live=list.filter(e=>e.start+e.duration>start);if(live.length)this.weaponEchoes.set(id,live);else this.weaponEchoes.delete(id);}
    const id=String(entity.id),list=this.weaponEchoes.get(id)||[];
    const snapshot=this.sampleWeapons(entity,1,start);
    if(origin&&Number.isFinite(Number(origin.x))&&Number.isFinite(Number(origin.y))){snapshot.x=Number(origin.x);snapshot.y=Number(origin.y);}
    if(imageConfig?.renderType==='weaponImage'&&WEAPON_IMAGE_DEFS[imageConfig.style])snapshot.images=[this.sampleImage(entity,imageConfig,start)];
    if(imageAlpha!==null&&Number.isFinite(Number(imageAlpha)))for(const image of snapshot.images)image.sample.alpha=Math.max(0,Math.min(1,Number(imageAlpha)));
    if(typeof imageColor==='string'&&imageColor)for(const image of snapshot.images){image.sample.activeColor=imageColor;image.sample.tintAmount=1;}
    list.push({start,duration:Math.max(1,duration),expansion:Math.max(0,Math.min(1,expansion)),snapshot});this.weaponEchoes.set(id,list.slice(-8));return true;
  },
  drawEchoes(ctx,entity,alpha,now){
    const id=String(entity.id),list=this.weaponEchoes.get(id)||[],live=[];
    for(const echo of list){const t=(now-echo.start)/echo.duration;if(t>=1)continue;live.push(echo);if(t<0)continue;
      ctx.save();ctx.translate(echo.snapshot.x-entity.x,echo.snapshot.y-entity.y);ctx.scale(1+echo.expansion*t,1+echo.expansion*t);
      for(const image of echo.snapshot.images)this.drawImage(ctx,echo.snapshot.entity,image.config,alpha*.55*Math.pow(1-t,1.3),now,image.sample);
      ctx.restore();
    }
    if(live.length)this.weaponEchoes.set(id,live);else this.weaponEchoes.delete(id);
  },
  weaponReactions:new Map(),
  react(id,start,duration=500,strength=.16){
    if(!id)return false;
    for(const [key,state] of this.weaponReactions)if(state.start+state.duration<=start)this.weaponReactions.delete(key);
    this.weaponReactions.set(String(id),{start,duration:Math.max(1,duration),strength:Math.max(0,Math.min(.3,strength))});return true;
  },
  reaction(entity,now){const state=this.weaponReactions.get(String(entity?.id||''));if(!state)return 0;const t=(now-state.start)/state.duration;if(t<0||t>=1){if(t>=1)this.weaponReactions.delete(String(entity.id));return 0;}return Math.sin(Math.PI*t)*state.strength;},
  weaponImages:new WeakMap(),weaponPoses:new WeakMap(),weaponPalette:new WeakMap(),
  deathState:{liveSamples:new WeakMap(),pendingSamples:new WeakMap(),remnants:new Map()},
  DEATH_HOLD_MS:160,DEATH_FADE_MS:1600,
  configs(entity){return entity?.kind==='summon'?(entity.summonSpec?.worldEffectModules||EMPTY_RUNTIME_ITEMS):(entity?.character?.worldEffectModules||EMPTY_RUNTIME_ITEMS);},
  sampleWeapons(entity,alpha,now){
    const images=[];
    for(const config of this.configs(entity)){
      if(config.renderType!=='weaponImage'||!this.matches(entity,config.conditions,now,config.conditionTarget))continue;
      images.push(this.sampleImage(entity,config,now));
    }
    return {entity:{radius:entity.radius,character:{color:entity.character?.color}},images,alpha,x:entity.x,y:entity.y,sampledAt:now};
  },
  sampleImage(entity,config,now){
    const pose=this.weaponPose(entity,config,now);
    return {config,sample:{pose:{pulse:pose.pulse,pull:pose.pull},partPoses:(config.partMotions||EMPTY_RUNTIME_ITEMS).map(m=>{const p=this.weaponPose(entity,m,now);return {pulse:p.pulse,pull:p.pull};}),spin:config.rotationStateKey?this.rotation(entity,config,Number(config.rotationMs)||300,now):0,alpha:this.imageAlpha(entity,config,now),activeColor:this.activeColor(entity,config,now),tintAmount:this.activityTint(entity,config,now)?.amount??0,sparkActive:!!config.sparkConditions&&this.matches(entity,config.sparkConditions,now,config.conditionTarget)}};
  },
  captureDeath(entity,now=performance.now()){
    if(!entity)return false;
    if(entity.alive)this.deathState.remnants.delete(entity);
    const latest=this.deathState.liveSamples.get(entity);
    const stealth=typeof StealthPresentationService!=='undefined'?StealthPresentationService.state(typeof Training!=='undefined'?Training.player:null,entity,now).alpha:1;
    const alpha=entity.hidden?0:Math.min(latest?.alpha??1,stealth);
    this.deathState.pendingSamples.set(entity,this.sampleWeapons(entity,alpha,now));
    return true;
  },
  presentDeath(entity,point,now=performance.now()){
    if(!entity||this.deathState.remnants.has(entity))return false;
    const pending=this.deathState.pendingSamples.get(entity);
    const snapshot=pending||this.deathState.liveSamples.get(entity);
    this.deathState.pendingSamples.delete(entity);
    if(!snapshot||!snapshot.images.length||snapshot.alpha<=0||(!pending&&now-snapshot.sampledAt>2000))return false;
    this.deathState.remnants.set(entity,{...snapshot,x:Number.isFinite(Number(point?.x))?Number(point.x):snapshot.x,y:Number.isFinite(Number(point?.y))?Number(point.y):snapshot.y,start:now});
    return true;
  },
  drawDeathRemnants(ctx,now=performance.now()){
    let drawn=false;
    for(const [key,remnant] of this.deathState.remnants){
      const elapsed=Math.max(0,now-remnant.start);
      if(elapsed>=this.DEATH_HOLD_MS+this.DEATH_FADE_MS){this.deathState.remnants.delete(key);continue;}
      const alpha=remnant.alpha*(1-Math.max(0,elapsed-this.DEATH_HOLD_MS)/this.DEATH_FADE_MS);
      ctx.save();ctx.translate(remnant.x,remnant.y);
      for(const image of remnant.images)drawn=this.drawImage(ctx,remnant.entity,image.config,alpha,now,image.sample)||drawn;
      ctx.restore();
    }
    return drawn;
  },
  clearDeathRemnants(){this.weaponEchoes.clear();this.weaponReactions.clear();this.deathState.remnants.clear();this.deathState.liveSamples=new WeakMap();this.deathState.pendingSamples=new WeakMap();},
  matches(entity,conditions,now,target='self'){if(target==='owner')entity=EntityService.owner(entity)||entity;return TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:conditions||EMPTY_RUNTIME_ITEMS},'presentation.draw',{source:entity,now});},
  presentWeaponTransition(entity,configs,alpha,now){
    let signature='',color=entity.character?.color;
    for(const config of configs){
      if(config.renderType!=='weaponImage'||!this.matches(entity,config.conditions,now,config.conditionTarget))continue;
      signature+=`${config.style}:${config.color}:${config.empowered===true}|`;color=config.color||color;
    }
    let previous=this.weaponImages.get(entity);
    if(!previous){this.weaponImages.set(entity,{character:entity.character,signature});return false;}
    const changed=previous.character===entity.character&&previous.signature!==signature;
    previous.character=entity.character;previous.signature=signature;
    if(!changed||alpha<=0)return false;
    if(typeof StealthPresentationService!=='undefined'&&StealthPresentationService.active(entity,now))return false;
    return DamageResourceLayerService.spawnTransitionEffect(entity,{type:'areaCircle',radiusMultiplier:2.8,minRadius:40,color,strokeColor:ColorService.rgbString(color,'255,255,255'),fillAlpha:.04,strokeAlpha:.72,lineWidth:2,pulse:true,pulseStrokeMin:.5,pulseStrokeMax:.8,pulseSpeed:.02,fadeOut:true,duration:240},now);
  },
  rotation(entity,gear,duration,now){
    const state=ModeStateService.state(entity,gear.stateKey||gear.rotationStateKey);
    const current=Number(state?.turns)||0,previous=Number(state?.previousTurns)||0;
    const progress=state?Math.max(0,Math.min(1,(now-Number(state.changedAt??now))/duration)):1;
    return (previous+(current-previous)*EffectSpawnService.ease(progress,'ease-out'))*(Number(gear.turnRadians??gear.rotationRadians)||Math.PI*2);
  },
  weaponPose(entity,config,now){
    const state=config.motionStateKey?ModeStateService.state(entity,config.motionStateKey):null;
    const elapsed=state?.changedAt===undefined?Infinity:Math.max(0,now-state.changedAt);
    const progress=Math.min(1,elapsed/Math.max(1,Number(config.motionMs)||400));
    // Fast committed strike, then a longer recovery instead of a tiny symmetric wobble.
    let pulse=progress<.18?-.2*progress/.18:progress<.42?-.2+1.2*(1-Math.pow(1-(progress-.18)/.24,3)):Math.pow(Math.max(0,1-(progress-.42)/.58),2);
    // Optional normalized keyframes share the same timeline for body and articulated parts.
    const frames=config.motionKeyframes;
    if(Array.isArray(frames)&&frames.length>1){
      pulse=Number(frames[frames.length-1].value)||0;
      for(let i=1;i<frames.length;i++){
        const a=frames[i-1],b=frames[i];
        if(progress>Number(b.at))continue;
        const t=Math.max(0,Math.min(1,(progress-Number(a.at))/Math.max(.000001,Number(b.at)-Number(a.at))));
        const eased=b.easing==='ease-in'?t*t*t:b.easing==='ease-out'?1-Math.pow(1-t,3):t;
        pulse=Number(a.value)+(Number(b.value)-Number(a.value))*eased;break;
      }
    }
    const charge=config.chargeStateKey?ChargedAttackService.state(entity,config.chargeStateKey):null;
    const attack=charge?ChargedAttackService.attack(entity,charge):null;
    const pull=charge&&attack?Math.min(1,ChargedAttackService.progress(charge,attack,now)/ChargedAttackService.maxProgress(attack)):0;
    let pose=this.weaponPoses.get(entity);if(!pose){pose={pulse:0,pull:0};this.weaponPoses.set(entity,pose);}pose.pulse=pulse;pose.pull=pull;return pose;
  },
  imageAlpha(entity,config,now){
    let alpha=Number(config.alpha??.60);
    if(config.idleAlpha!==undefined){
      const state=ModeStateService.state(entity,config.activityStateKey||config.rotationStateKey);
      const elapsed=now-Number(state?.changedAt??-Infinity);
      const activity=Math.max(0,Math.min(1,1-(elapsed-Number(config.useHoldMs||0))/Math.max(1,Number(config.useFadeMs)||1)));
      alpha=Number(config.idleAlpha)+(1-Number(config.idleAlpha))*activity;
    }
    for(const variant of config.alphaVariants||EMPTY_RUNTIME_ITEMS){if(this.matches(entity,variant.conditions,now,config.conditionTarget)){alpha*=Number(variant.alpha??1);break;}}
    return Math.max(0,Math.min(1,alpha));
  },
  activityTint(entity,config,now){
    let latest=-Infinity,tint=null;
    for(const activity of config.activityColors||EMPTY_RUNTIME_ITEMS){
      if(activity.conditions){if(this.matches(entity,activity.conditions,now,config.conditionTarget))return {color:activity.color,amount:1};continue;}
      const at=ModeStateService.state(entity,activity.stateKey)?.changedAt,duration=Number(activity.duration||600);
      if(at!==undefined&&now>=at&&now-at<duration&&at>=latest){
        const fade=Math.max(0,Math.min(duration,Number(activity.fadeMs)||0)),elapsed=now-at;
        latest=at;tint={color:activity.color,amount:fade?Math.min(1,(duration-elapsed)/fade):1};
      }
    }
    return tint;
  },
  activeColor(entity,config,now){return this.activityTint(entity,config,now)?.color??null;},
  mixColor(base,accent,amount){
    const from=ColorService.rgbString(base).split(',').map(Number),to=ColorService.rgbString(accent).split(',').map(Number),t=Math.max(0,Math.min(1,amount));
    return `rgb(${from.map((v,i)=>Math.round(v+(to[i]-v)*t)).join(',')})`;
  },
  tintedFill(color,accent){
    if(!color)return `rgb(${ColorService.rgbString(accent,'255,255,255').split(',').map(v=>Math.round(Number(v)*.38)).join(',')})`;
    const base=ColorService.rgbString(color,'100,100,100').split(',').map(Number),rgb=ColorService.rgbString(accent,'255,255,255').split(',').map(Number);
    const brightness=Math.max(...base)/255;
    return `rgb(${rgb.map(v=>Math.round(v*brightness)).join(',')})`;
  },
  palette(entity,config,now=performance.now(),capturedColor=undefined,capturedAmount=undefined){
    const tint=capturedColor===undefined?this.activityTint(entity,config,now):{color:capturedColor,amount:capturedAmount??1};
    const active=tint?.color,amount=tint?.amount??0,base=config.color||entity.character?.color||'#ffffff';
    const accent=active?this.mixColor(base,active,amount):base;let palette=this.weaponPalette.get(config);
    if(!palette||palette.base!==base||palette.accent!==accent||palette.activeColor!==active||palette.amount!==amount){
      const rgb=ColorService.rgbString(accent,'255,255,255').split(',');
      palette={base,accent,active:!!active,activeColor:active,amount,baseFill:`rgb(${ColorService.rgbString(base).split(',').map(v=>Math.round(Number(v)*.38)).join(',')})`,fill:`rgb(${rgb.map(v=>Math.round(Number(v)*.38)).join(',')})`,edge:ColorService.brighten(accent,.65)};this.weaponPalette.set(config,palette);
    }return palette;
  },
  pathFill(color,palette,config){
    const base=config.preservePalette?(color||palette.baseFill):this.tintedFill(color,palette.base);
    return palette.active?this.mixColor(base,this.tintedFill(color,palette.activeColor),palette.amount):base;
  },
  path(ctx,path,size){
    ctx.beginPath();
    if(path.points){for(let i=0;i<path.points.length;i++){const p=path.points[i];if(i===0)ctx.moveTo(p[0]*size,p[1]*size);else ctx.lineTo(p[0]*size,p[1]*size);}if(path.closed)ctx.closePath();}
    for(const p of path.commands||EMPTY_RUNTIME_ITEMS){
      if(p[0]==='M')ctx.moveTo(p[1]*size,p[2]*size);
      else if(p[0]==='L')ctx.lineTo(p[1]*size,p[2]*size);
      else if(p[0]==='C')ctx.bezierCurveTo(p[1]*size,p[2]*size,p[3]*size,p[4]*size,p[5]*size,p[6]*size);
      else if(p[0]==='A')ctx.arc(p[1]*size,p[2]*size,p[3]*size,p[4],p[5]);
      else if(p[0]==='Z')ctx.closePath();
    }
  },
  drawImage(ctx,entity,config,alpha,now=performance.now(),sample=null){
    const definition=WEAPON_IMAGE_DEFS[config.style];if(!definition)return false;
    const size=Math.max(12,Number(entity.radius)||20)*(Number(config.scale)||1.5);
    const pose=sample?.pose||this.weaponPose(entity,config,now),motion=config.motion||{};
    const spin=sample?.spin??(config.rotationStateKey?this.rotation(entity,config,Number(config.rotationMs)||300,now):0);
    const palette=this.palette(entity,config,now,sample?.activeColor,sample?.tintAmount);
    const reaction=sample?0:this.reaction(entity,now);
    ctx.save();ctx.globalAlpha=alpha*(reaction>0?Math.min(1,this.imageAlpha(entity,config,now)+reaction*2):sample?.alpha??this.imageAlpha(entity,config,now));
    ctx.translate(Number(config.x||0),Number(config.y||0));
    ctx.rotate(Number(config.angle||0)+spin+Number(motion.rotation||0)*pose.pulse+Number(motion.chargeRotation||0)*pose.pull);
    ctx.translate(Number(motion.travelX||0)*size*pose.pulse,Number(motion.travelY||0)*size*pose.pulse);
    if(reaction>0)ctx.scale(1+reaction,1+reaction);
    ctx.translate(-Number(definition.origin?.[0]||0)*size,-Number(definition.origin?.[1]||0)*size);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=Math.max(1.3,size*.055);ctx.fillStyle=palette.fill;ctx.strokeStyle=palette.edge;
    if(Number(config.glow)>0){
      ctx.shadowBlur=Number(config.glow);
      ctx.shadowColor=sample?`rgba(${ColorService.rgbString(palette.edge)},${Math.max(0,Math.min(1,alpha*sample.alpha))})`:palette.edge;
    }
    for(const [partIndex,part] of (definition.parts||EMPTY_RUNTIME_ITEMS).entries()){
      ctx.save();
      ctx.translate(Number(part.pivot?.[0]||0)*size,Number(part.pivot?.[1]||0)*size);
      const partMotion=config.partMotions?.[partIndex];
      const partPose=sample?.partPoses?.[partIndex]||(partMotion?this.weaponPose(entity,partMotion,now):pose);
      ctx.rotate(Number(part.angle||0)+Number(part.pulseAngle||0)*partPose.pulse+Number(partMotion?.rotation||0)*partPose.pulse);
      if(partMotion)ctx.translate(Number(partMotion.travelX||0)*size*partPose.pulse,Number(partMotion.travelY||0)*size*partPose.pulse);
      ctx.scale(Number(part.scaleX??1),Number(part.scaleY??1));
      for(const path of part.paths||EMPTY_RUNTIME_ITEMS){this.path(ctx,path,size);ctx.fillStyle=this.pathFill(path.fillColor,palette,config);ctx.strokeStyle=palette.edge;ctx.lineWidth=Math.min(path.fill?1.8:1.35,path.lineWidth?Math.max(.7,path.lineWidth*size):Math.max(1.3,size*.055));if(path.fill)ctx.fill();if(path.stroke!==false)ctx.stroke();}
      ctx.restore();
    }
    for(const path of definition.paths||EMPTY_RUNTIME_ITEMS){
      this.path(ctx,path,size);ctx.fillStyle=this.pathFill(path.fillColor,palette,config);ctx.strokeStyle=palette.edge;ctx.lineWidth=Math.min(path.fill?1.8:1.35,path.lineWidth?Math.max(.7,path.lineWidth*size):Math.max(1.3,size*.055));
      if(path.fill)ctx.fill();if(path.stroke!==false)ctx.stroke();
    }
    if(definition.leaf&&pose.pulse>.05){const leaf=definition.leaf,t=Math.min(1,pose.pulse),x=(leaf.right+(leaf.left-leaf.right)*t)*size;
      ctx.beginPath();ctx.moveTo(0,-.57*size);ctx.lineTo(x,leaf.top*size);ctx.lineTo(x,leaf.bottom*size);ctx.lineTo(0,.78*size);ctx.closePath();ctx.fillStyle=this.pathFill(leaf.color,palette,config);ctx.fill();ctx.strokeStyle=palette.edge;ctx.stroke();}
    ctx.strokeStyle=palette.edge;ctx.lineWidth=Math.min(1.8,Math.max(1.3,size*.055));
    for(const ring of definition.rings||EMPTY_RUNTIME_ITEMS){ctx.beginPath();ctx.arc(Number(ring.x||0)*size,Number(ring.y||0)*size,(Number(ring.radius)||Number(ring))*size,0,Math.PI*2);ctx.stroke();}
    if(definition.string){const string=definition.string;ctx.beginPath();ctx.moveTo(string.start[0]*size,string.start[1]*size);ctx.lineTo((string.restX+string.pullX*pose.pull)*size,0);ctx.lineTo(string.end[0]*size,string.end[1]*size);ctx.lineWidth=Math.max(1.2,size*.04);ctx.stroke();}
    const sparkActive=sample?.sparkActive??(!!config.sparkConditions&&this.matches(entity,config.sparkConditions,now,config.conditionTarget));
    if(sparkActive&&definition.sparks){
      ctx.save();ctx.shadowBlur=4;ctx.shadowColor=palette.edge;ctx.strokeStyle=palette.edge;ctx.lineWidth=1.5;
      const phase=Math.floor(now/95),sparkAlpha=ctx.globalAlpha*.85;
      for(let i=0;i<definition.sparks.length;i++){if((phase+i)%3===0)continue;ctx.globalAlpha=sparkAlpha;this.path(ctx,{points:definition.sparks[i]},size);ctx.stroke();}
      ctx.restore();
    }
    if(config.empowered&&!definition.empoweredIncluded){ctx.shadowBlur=0;ctx.beginPath();ctx.arc(0,.65*size,.65*size,0,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++){const y=(-2.1+i*.8)*size,w=.13*size;ctx.beginPath();ctx.moveTo(0,y-w);ctx.lineTo(w,y);ctx.lineTo(0,y+w);ctx.lineTo(-w,y);ctx.closePath();ctx.stroke();}}
    ctx.restore();return true;
  },
  drawBehind(ctx,entity,alpha=1,now=performance.now()){
    if(!ctx||!entity?.alive||entity.hidden)return false;
    const configs=this.configs(entity);this.presentWeaponTransition(entity,configs,alpha,now);let drawn=false;
    this.drawEchoes(ctx,entity,alpha,now);
    this.deathState.liveSamples.set(entity,this.sampleWeapons(entity,alpha,now));
    for(const config of configs){if(config.type==='effect.spawn'&&config.renderType==='weaponImage'&&this.matches(entity,config.conditions,now,config.conditionTarget))drawn=this.drawImage(ctx,entity,config,alpha,now)||drawn;}
    return drawn;
  }
});
