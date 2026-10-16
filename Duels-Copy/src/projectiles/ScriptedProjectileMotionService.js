

const ScriptedProjectileMotionService=Object.freeze({
  update(projectile,frameScale=1,now=performance.now()){
    const motion=projectile?.scriptedMotion;
    if(!motion||typeof motion!=='object')return false;
    const mode=String(motion.mode||'');
    const targetId=String(motion.targetEntityId||'');
    const target=targetId?EntityService.items.get(targetId)||null:null;

    if(mode==='seek-entity'){
      if(!target?.alive){
        ProjectileStateService.remove(projectile);
        return true;
      }
      const dx=(Number(target.x)||0)-(Number(projectile.x)||0);
      const dy=(Number(target.y)||0)-(Number(projectile.y)||0);
      const dist=Math.hypot(dx,dy);
      const step=Math.max(.1,Number(motion.speed)||1)*Math.max(.01,Number(frameScale)||1);
      if(dist<=Math.max(step,Number(target.radius)||0,Number(projectile.radius)||0)){
        GameEvents.emit('scripted-projectile-arrived',{projectile,target,motion,now});
        ProjectileStateService.remove(projectile);
        return true;
      }
      projectile.prevX=projectile.x;
      projectile.prevY=projectile.y;
      projectile.x+=dx/Math.max(.001,dist)*Math.min(step,dist);
      projectile.y+=dy/Math.max(.001,dist)*Math.min(step,dist);
      projectile.angle=Math.atan2(dy,dx);
      projectile.vx=0;
      projectile.vy=0;
      return true;
    }

    if(mode==='anchored-arc'){
      if(!target?.alive){
        ProjectileStateService.remove(projectile);
        return true;
      }
      const startedAt=Number(motion.startedAt)||now;
      const duration=Math.max(1,Number(motion.duration)||1);
      const progress=Math.max(0,Math.min(1,(now-startedAt)/duration));
      const arc=4*progress*(1-progress);
      projectile.prevX=projectile.x;
      projectile.prevY=projectile.y;
      projectile.x=Number(target.x)||0;
      projectile.y=(Number(target.y)||0)-Math.max(0,Number(motion.height)||0)*arc;
      projectile.angle=progress<.5?-Math.PI/2:Math.PI/2;
      projectile.travel=0;
      projectile.vx=0;
      projectile.vy=0;
      if(progress>=1){
        GameEvents.emit('scripted-projectile-arrived',{projectile,target,motion,now});
        ProjectileStateService.remove(projectile);
      }
      return true;
    }

    return false;
  }
});