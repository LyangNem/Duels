

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
        item?.interruptibleWindup===true
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
            const spawnX=
              (Number(originPoint.x)||0)+px;
            const spawnY=
              (Number(originPoint.y)||0)+py;

            ProjectileService.spawn({
              source:item.source,
              attack:item.attack,
              volley:item.volley,
              x:spawnX,
              y:spawnY,
              origin:{
                x:spawnX,
                y:spawnY
              },
              angle:shotAngle,
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
              item.aimMode==='live-source'&&
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
                  perpendicularOffset,
                  sourceX:Number(originPoint.x)||0,
                  sourceY:Number(originPoint.y)||0
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