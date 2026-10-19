

const SimulationScheduleService={
  items:[],
  scheduleProjectile(item){
    this.items.push({
      type:'projectile',
      ...item
    });
  },
  scheduleContinuation(item){
    this.items.push({
      type:'continuation',
      ...item
    });
  },
  clear(){
    this.items.length=0;
  },
  clearSource(source){
    if(!source)return false;

    let write=0;
    let removed=false;
    for(const item of this.items){
      if(
        item?.source===source
      ){
        removed=true;
        continue;
      }
      this.items[write++]=item;
    }
    this.items.length=write;
    return removed;
  },
  interruptWindups(source){
    if(!source)return false;

    let write=0;
    let removed=false;
    const abilityIds=
      new Set();

    for(const item of this.items){
      if(
        item?.source===source&&
        item?.type==='continuation'&&
        (item?.interruptibleWindup===true||item?.attackWindup===true)
      ){
        removed=true;

        if(item.abilityId){
          abilityIds.add(
            String(item.abilityId)
          );
        }
        continue;
      }

      this.items[write++]=item;
    }

    this.items.length=write;

    if(source.abilityPending){
      for(const abilityId of abilityIds){
        source.abilityPending.delete(
          abilityId
        );
      }
    }

    return removed;
  },
  update(now=performance.now()){
    let write=0;

    for(let read=0;read<this.items.length;read++){
      const item=this.items[read];

      if(now<item.at){
        this.items[write++]=item;
        continue;
      }

      if(item.type==='continuation'){
        if(item.source?.abilityPending&&item.abilityId){
          item.source.abilityPending.delete(item.abilityId);
        }

        if(item.source?.alive){
          item.continue?.();
        }
        continue;
      }

      if(item.type==='projectile'){
        if(item.source?.alive){
          const projectile=AttackModuleService.projectile(
            item.attack
          );

          if(projectile){
            const projectileOverride=
              item.projectileOverride&&
              typeof item.projectileOverride==='object'
                ?item.projectileOverride
                :null;
            const resolvedProjectile=
              projectileOverride
                ?{
                  ...projectile,
                  ...(Number.isFinite(
                    Number(
                      projectileOverride.radius
                    )
                  )
                    ?{
                      radius:Math.max(
                        1,
                        Number(
                          projectileOverride.radius
                        )
                      )
                    }
                    :{}),
                  renderColor:
                    projectileOverride.renderColor||
                    projectile.renderColor||
                    null
                }
                :projectile;
            let shotAngle=Number(item.angle)||0;

            if(
              item.aimMode==='live-source'&&
              EntitySimulationAuthorityService.isLocal(
                item.source
              )&&
              item.source===Training.player
            ){
              shotAngle=Training.aimAngle();
            }

            const perpendicularOffset=
              Number(item.perpendicularOffset)||0;
            const px=
              -Math.sin(shotAngle)*
              perpendicularOffset;
            const py=
              Math.cos(shotAngle)*
              perpendicularOffset;
            const originPoint=
              item.originPoint&&
              Number.isFinite(Number(item.originPoint.x))&&
              Number.isFinite(Number(item.originPoint.y))
                ?item.originPoint
                :item.source;
            const originAngle=item.originOrientation==='last-movement'
              ?MovementService.lastDirectionAngle(item.source):Number(item.originAngle)||0;
            const forward=Number(item.originOffset?.forward)||0;
            const lateral=Number(item.originOffset?.lateral)||0;
            const spawnX=(Number(originPoint.x)||0)+px+Math.cos(originAngle)*forward-Math.sin(originAngle)*lateral+(Number(item.originOffset?.x)||0);
            const spawnY=(Number(originPoint.y)||0)+py+Math.sin(originAngle)*forward+Math.cos(originAngle)*lateral+(Number(item.originOffset?.y)||0);
            let targetPoint=item.aimMode==='live-target-point'
              ?CounterModuleService.aimTargetPoint(item.source)||item.volley?.execution?.targetPoint
              :item.aimMode==='target-point'?item.volley?.execution?.targetPoint:null;
            if(item.aimMode==='live-target-point'&&targetPoint){
              targetPoint=AttackService.resolveAimTargetPoint(item.source,item.attack,targetPoint);
            }
            if(targetPoint&&Number.isFinite(targetPoint.x)&&Number.isFinite(targetPoint.y)){
              shotAngle=Math.atan2(targetPoint.y-spawnY,targetPoint.x-spawnX);
            }

            ProjectileService.spawn({
              source:item.source,
              perpendicularOffset,
              attack:item.attack,
              volley:item.volley,
              x:spawnX,
              y:spawnY,
              origin:{
                x:spawnX,
                y:spawnY
              },
              angle:shotAngle,
              targetPoint:targetPoint?{x:targetPoint.x,y:targetPoint.y}:null,
              targetDistance:targetPoint?Math.hypot(targetPoint.x-spawnX,targetPoint.y-spawnY):null,
              targetEntityId:
                item.volley?.execution
                  ?.targetEntityId||'',
              projectile:resolvedProjectile,
              behavior:
                ProjectileModuleService.withShotOverride(
                  ProjectileModuleService.config(
                    item.attack
                  ),
                  projectileOverride
                )
            });

            if(
              (item.aimMode==='live-source'||item.aimMode==='target-point'||item.aimMode==='live-target-point')&&
              Training.sessionMode==='online'&&
              OnlineDuelService.active&&
              EntitySimulationAuthorityService.isLocal(
                item.source
              )
            ){
              OnlineDuelService
                .sendScheduledProjectileShot({
                  attack:item.attack,
                  execution:
                    item.volley?.execution||null,
                  shotIndex:
                    Math.max(
                      0,
                      Math.floor(
                        Number(item.shotIndex)||0
                      )
                    ),
                  angle:shotAngle,
                  perpendicularOffset:targetPoint?0:perpendicularOffset,
                  sourceX:targetPoint?spawnX:Number(originPoint.x)||0,
                  sourceY:targetPoint?spawnY:Number(originPoint.y)||0,
                  targetPoint
                });
            }
          }
        }else if(
          item.volley&&
          !item.volley.finished
        ){
          item.volley.resolved++;

          if(item.volley.resolved>=item.volley.total){
            item.volley.finished=true;
          }
        }
      }
    }

    this.items.length=write;
  }
};
