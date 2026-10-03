

const CircleFormationService=Object.freeze({
  states:new WeakMap(),
  KIND:'circle-formation',
  EMPTY:Object.freeze([]),

  config(entity,key='circleFormation'){
    const config=entity?.character?.[String(key||'circleFormation')]||null;
    return config&&typeof config==='object'?config:null;
  },

  state(entity,create=true,key='circleFormation'){
    if(!entity)return null;
    const config=this.config(entity,key);
    if(!config)return null;

    let state=this.states.get(entity)||null;
    const characterId=String(entity.character?.id||'');
    if(
      !state||
      state.characterId!==characterId||
      state.formationKey!==String(key||'circleFormation')
    ){
      if(!create)return null;
      state={
        kind:this.KIND,
        characterId,
        formationKey:String(key||'circleFormation'),
        circles:[],
        lastFormation:[],
        circleOrder:0,
        circleInput:null,
        activation:null,
        revealStartedAt:0,
        revealUntil:0,
        burst:null,
        remoteCircles:[],
        remoteRevealStartedAt:0,
        remoteRevealUntil:0,
        limitPreview:null,
        pendingManifest:null,
        lastCounterNetworkSnapshot:null,
        clearedForDeath:false
      };
      this.states.set(entity,state);
    }
    return state;
  },

  pointerFor(entity,fallback=null){
    if(
      fallback&&
      Number.isFinite(Number(fallback.x))&&
      Number.isFinite(Number(fallback.y))
    ){
      return {x:Number(fallback.x),y:Number(fallback.y)};
    }
    if(
      this.isLocalEntity(entity)&&
      Training.active
    ){
      const point=Training.mouseWorld();
      return {
        x:Number(point.x)||0,
        y:Number(point.y)||0
      };
    }
    const remote=entity?._remoteAimTargetPoint;
    if(
      remote&&
      Number.isFinite(Number(remote.x))&&
      Number.isFinite(Number(remote.y))
    ){
      return {x:Number(remote.x),y:Number(remote.y)};
    }
    const angle=Number(entity?.counterWindup?.angle)||0;
    return {
      x:(Number(entity?.x)||0)+Math.cos(angle)*300,
      y:(Number(entity?.y)||0)+Math.sin(angle)*300
    };
  },

  cloneCircle(circle,index=0,prefix='formation'){
    return {
      id:String(circle?.id||`${prefix}:${index}`),
      x:Number(circle?.x)||0,
      y:Number(circle?.y)||0,
      r:Math.max(0,Number(circle?.r)||0),
      order:Math.max(0,Number(circle?.order)||index+1)
    };
  },

  cloneCircles(circles,prefix='formation'){
    return (Array.isArray(circles)?circles:[])
      .filter(Boolean)
      .map((circle,index)=>this.cloneCircle(circle,index,prefix));
  },

  snapshotRelative(circles){
    const list=this.cloneCircles(circles,'snapshot');
    if(!list.length)return [];
    const cx=list.reduce((sum,c)=>sum+c.x,0)/list.length;
    const cy=list.reduce((sum,c)=>sum+c.y,0)/list.length;
    return list.map((circle,index)=>({
      dx:circle.x-cx,
      dy:circle.y-cy,
      r:circle.r,
      order:Number(circle.order)||index+1
    }));
  },

  cloneRelative(snapshot,cx,cy,prefix='formation'){
    const now=Math.floor(performance.now());
    return (Array.isArray(snapshot)?snapshot:[])
      .slice(0,64)
      .map((circle,index)=>({
        id:`${prefix}:${now}:${index}`,
        x:Number(cx)+(Number(circle?.dx)||0),
        y:Number(cy)+(Number(circle?.dy)||0),
        r:Math.max(0,Number(circle?.r)||0),
        order:Number(circle?.order)||index+1
      }));
  },

  circleConfig(entity){
    return this.config(entity)?.circle||null;
  },

  activationConfig(entity){
    return this.config(entity)?.activation||null;
  },

  maxCount(entity){
    return Math.max(
      1,
      Math.floor(
        Number(this.circleConfig(entity)?.maxCount)||1
      )
    );
  },

  minRadius(entity){
    return Math.max(0,Number(this.circleConfig(entity)?.minRadius)||0);
  },

  maxRadius(entity,now=performance.now()){
    const config=this.circleConfig(entity);
    const minRadius=this.minRadius(entity);
    const baseRadius=Math.max(
      minRadius,
      Number(config?.maxRadius)||minRadius
    );
    const attackKey=String(
      config?.maxRadiusScaleAttackKey||''
    ).trim();
    if(!attackKey)return baseRadius;

    const attack=entity?.character?.attacks?.[attackKey]||null;
    if(!attack)return baseRadius;

    const rangeBonus=Number(
      AugmentService.attackAdjustmentTotals(
        entity,
        attack,
        now
      )?.rangeBonus
    )||0;
    return Math.max(
      minRadius,
      baseRadius*Math.max(.05,1+rangeBonus)
    );
  },

  isMinimum(entity,circle){
    return Math.abs(
      (Number(circle?.r)||0)-
      this.minRadius(entity)
    )<=Math.max(
      .01,
      Number(
        this.circleConfig(entity)
          ?.amplifierRadiusTolerance
      )||1.5
    );
  },

  relation(entity,a,b){
    if(!a||!b)return {type:'none'};
    const dx=(Number(a.x)||0)-(Number(b.x)||0);
    const dy=(Number(a.y)||0)-(Number(b.y)||0);
    const distance=Math.hypot(dx,dy);
    const ar=Math.max(0,Number(a.r)||0);
    const br=Math.max(0,Number(b.r)||0);
    const small=Math.min(ar,br);
    const large=Math.max(ar,br);
    const relationConfig=
      this.config(entity)?.relation||{};
    const containLimit=Math.max(
      0,
      Number(relationConfig.containAreaRatioMax)
    );

    if(distance+small<=large+.5){
      const inner=ar<=br?a:b;
      const outer=ar>br?a:b;
      const outerRadius=Math.max(.0001,Number(outer.r)||0);
      const innerRadius=Math.max(0,Number(inner.r)||0);
      const areaRatio=
        (innerRadius*innerRadius)/
        (outerRadius*outerRadius);

      return areaRatio<=containLimit
        ?{
          type:'contain',
          inner,
          outer,
          areaRatio,
          containLimit
        }
        :{
          type:'invalidContain',
          inner,
          outer,
          areaRatio,
          containLimit
        };
    }

    if(distance>=ar+br){
      return {
        type:'none',
        gap:distance-ar-br
      };
    }

    const depth=ar+br-distance;
    const connectLimit=Math.max(
      0,
      Number(
        relationConfig.connectDepthRatioMax
      )
    );

    return {
      type:
        depth/Math.max(1,small)<connectLimit
          ?'connect'
          :'cross',
      depth
    };
  },

  graph(entity,circles){
    const list=Array.isArray(circles)?circles:[];
    const edges=new Map(
      list.map(circle=>[String(circle.id),new Set()])
    );
    const rels=[];

    for(let i=0;i<list.length;i++){
      for(let j=i+1;j<list.length;j++){
        const a=list[i];
        const b=list[j];
        const relation=this.relation(entity,a,b);
        const entry={a,b,...relation};
        rels.push(entry);

        if(
          relation.type==='contain'||
          relation.type==='connect'||
          relation.type==='cross'
        ){
          edges.get(String(a.id))?.add(String(b.id));
          edges.get(String(b.id))?.add(String(a.id));
        }
      }
    }

    return {edges,rels};
  },

  connectedIds(entity,seedIds,circles){
    const graph=this.graph(entity,circles);
    const seen=new Set(
      [...(seedIds||[])].map(String)
    );
    const queue=[...seen];

    while(queue.length){
      const id=queue.shift();
      for(const next of graph.edges.get(id)||[]){
        if(seen.has(next))continue;
        seen.add(next);
        queue.push(next);
      }
    }
    return seen;
  },

  intersectionPoints(a,b){
    const dx=Number(b.x)-Number(a.x);
    const dy=Number(b.y)-Number(a.y);
    const distance=Math.hypot(dx,dy);
    const ar=Math.max(0,Number(a.r)||0);
    const br=Math.max(0,Number(b.r)||0);

    if(
      distance<=.0001||
      distance>ar+br||
      distance<Math.abs(ar-br)
    )return [];

    const along=
      (ar*ar-br*br+distance*distance)/
      (2*distance);
    const heightSq=Math.max(
      0,
      ar*ar-along*along
    );
    const height=Math.sqrt(heightSq);
    const ux=dx/distance;
    const uy=dy/distance;
    const px=Number(a.x)+along*ux;
    const py=Number(a.y)+along*uy;

    return [
      {
        x:px-height*uy,
        y:py+height*ux
      },
      {
        x:px+height*uy,
        y:py-height*ux
      }
    ];
  },

  pointInside(point,circle,slack=.75){
    return Math.hypot(
      Number(point?.x)-Number(circle?.x),
      Number(point?.y)-Number(circle?.y)
    )<=
      Math.max(0,Number(circle?.r)||0)+
      Math.max(0,Number(slack)||0);
  },

  circleTouchesCrossLens(candidate,a,b){
    if(!candidate||!a||!b)return false;

    if(
      this.pointInside(candidate,a)&&
      this.pointInside(candidate,b)
    )return true;

    for(const point of this.intersectionPoints(a,b)){
      if(this.pointInside(point,candidate))return true;
    }
    for(const point of this.intersectionPoints(candidate,a)){
      if(this.pointInside(point,b))return true;
    }
    for(const point of this.intersectionPoints(candidate,b)){
      if(this.pointInside(point,a))return true;
    }
    if(
      this.pointInside(a,candidate)&&
      this.pointInside(a,b)
    )return true;
    if(
      this.pointInside(b,candidate)&&
      this.pointInside(b,a)
    )return true;

    return false;
  },

  sharedCrossEffects(entity,circles,graph){
    const list=Array.isArray(circles)?circles:[];
    const inheritedIds=new Set();
    const sourcePairs=[];

    for(const cross of graph.rels.filter(
      relation=>relation.type==='cross'
    )){
      const inherited=[];

      for(const candidate of list){
        if(
          candidate.id===cross.a.id||
          candidate.id===cross.b.id
        )continue;

        const relationA=
          this.relation(
            entity,
            candidate,
            cross.a
          ).type;
        const relationB=
          this.relation(
            entity,
            candidate,
            cross.b
          ).type;
        const connected=
          relationA==='connect'||
          relationB==='connect';

        if(
          !connected||
          !this.circleTouchesCrossLens(
            candidate,
            cross.a,
            cross.b
          )
        )continue;

        inheritedIds.add(candidate.id);
        inherited.push(candidate.id);
      }

      if(inherited.length){
        sourcePairs.push({
          a:cross.a,
          b:cross.b,
          inheritedIds:inherited
        });
      }
    }

    return {inheritedIds,sourcePairs};
  },

  amplifierEffects(entity,circles,graph){
    const list=Array.isArray(circles)?circles:[];
    const minimumIds=new Set(
      list
        .filter(circle=>this.isMinimum(entity,circle))
        .map(circle=>String(circle.id))
    );
    const byId=new Map(
      list.map(circle=>[String(circle.id),circle])
    );
    const sourceIds=new Set();
    const containedSources=new Set();
    const directRelations=new Map();

    for(const relation of graph.rels){
      if(
        relation.type==='contain'&&
        minimumIds.has(String(relation.inner?.id))
      ){
        containedSources.add(
          String(relation.inner.id)
        );
      }
    }

    const addDirect=(source,receiver)=>{
      if(
        !source||
        !receiver||
        minimumIds.has(String(receiver.id))
      )return;

      const sourceId=String(source.id);
      const receiverId=String(receiver.id);
      sourceIds.add(sourceId);
      if(!directRelations.has(sourceId)){
        directRelations.set(
          sourceId,
          new Map()
        );
      }
      directRelations
        .get(sourceId)
        .set(
          receiverId,
          {source,receiver}
        );
    };

    for(const relation of graph.rels){
      if(relation.type!=='cross')continue;
      if(minimumIds.has(String(relation.a.id))){
        addDirect(relation.a,relation.b);
      }
      if(minimumIds.has(String(relation.b.id))){
        addDirect(relation.b,relation.a);
      }
    }

    const connectEdges=new Map(
      list.map(circle=>[
        String(circle.id),
        new Set()
      ])
    );

    for(const relation of graph.rels){
      if(
        relation.type==='none'||
        relation.type==='invalidContain'
      )continue;

      const aId=String(relation.a.id);
      const bId=String(relation.b.id);
      if(
        minimumIds.has(aId)||
        minimumIds.has(bId)
      )continue;

      connectEdges.get(aId)?.add(bId);
      connectEdges.get(bId)?.add(aId);
    }

    const stageByCircle=new Map(
      list.map(circle=>[String(circle.id),0])
    );
    const directStageByCircle=new Map(
      list.map(circle=>[String(circle.id),0])
    );
    const directReceiverIds=new Set();
    const inheritedStageIds=new Set();
    const links=[];
    const maxStage=Math.max(
      1,
      Math.floor(
        Number(
          this.config(entity)?.amplifier
            ?.maxStage
        )||3
      )
    );

    const sourceContributionByCircle=new Map();

    for(const [sourceId,relationMap] of directRelations){
      const source=byId.get(sourceId);
      if(!source)continue;

      const amount=
        containedSources.has(sourceId)
          ?this.config(entity).amplifier.containedStageWeight
          :1;
      const affectedIds=new Set();
      const directIds=new Set();

      for(const relation of relationMap.values()){
        const directId=String(
          relation.receiver.id
        );
        directIds.add(directId);
        links.push({
          source,
          receiver:relation.receiver,
          amount
        });

        const seen=new Set([directId]);
        const queue=[directId];

        while(queue.length){
          const id=queue.shift();
          for(const next of connectEdges.get(id)||[]){
            if(
              seen.has(next)||
              minimumIds.has(next)
            )continue;
            seen.add(next);
            queue.push(next);
          }
        }

        for(const id of seen){
          affectedIds.add(id);
        }
      }

      for(const id of directIds){
        directReceiverIds.add(id);
        directStageByCircle.set(
          id,
          Math.min(
            maxStage,
            (directStageByCircle.get(id)||0)+
            amount
          )
        );
      }

      for(const id of affectedIds){
        if(
          !byId.has(id)||
          minimumIds.has(id)
        )continue;

        if(!sourceContributionByCircle.has(id)){
          sourceContributionByCircle.set(
            id,
            new Map()
          );
        }
        sourceContributionByCircle
          .get(id)
          .set(
            sourceId,
            amount
          );
      }
    }

    for(const [id,contributions] of sourceContributionByCircle){
      const stage=
        [...contributions.values()]
          .reduce(
            (sum,value)=>sum+Math.max(0,Number(value)||0),
            0
          );
      stageByCircle.set(
        id,
        Math.min(
          maxStage,
          stage
        )
      );
    }

    for(const [id,stage] of stageByCircle){
      if(
        stage>0&&
        !directReceiverIds.has(id)&&
        !minimumIds.has(id)
      ){
        inheritedStageIds.add(id);
      }
    }

    for(const id of minimumIds){
      stageByCircle.set(id,0);
      directStageByCircle.set(id,0);
      directReceiverIds.delete(id);
      inheritedStageIds.delete(id);
    }

    return {
      sourceIds,
      minimumIds,
      containedSources,
      stageByCircle,
      directStageByCircle,
      directReceiverIds,
      inheritedStageIds,
      links
    };
  },

  pairKey(a,b){
    return [
      String(a?.id||''),
      String(b?.id||'')
    ].sort().join('|');
  },

  damageModel(entity,circles){
    const list=this.cloneCircles(
      circles,
      'damage'
    );
    const rawGraph=this.graph(entity,list);
    const amplifier=
      this.amplifierEffects(
        entity,
        list,
        rawGraph
      );
    const amplifierIds=amplifier.sourceIds;
    const amplificationPairs=new Set(
      amplifier.links.map(
        link=>this.pairKey(
          link.source,
          link.receiver
        )
      )
    );

    for(const relation of rawGraph.rels){
      if(relation.type!=='cross')continue;
      const aMinimum=
        amplifier.minimumIds.has(
          String(relation.a.id)
        );
      const bMinimum=
        amplifier.minimumIds.has(
          String(relation.b.id)
        );
      if(
        aMinimum&&
        bMinimum&&
        (
          amplifierIds.has(String(relation.a.id))||
          amplifierIds.has(String(relation.b.id))
        )
      ){
        amplificationPairs.add(
          this.pairKey(
            relation.a,
            relation.b
          )
        );
      }
    }

    const graph={
      edges:rawGraph.edges,
      rels:rawGraph.rels.map(relation=>{
        const key=this.pairKey(
          relation.a,
          relation.b
        );
        if(
          relation.type==='cross'&&
          amplificationPairs.has(key)
        ){
          return {
            ...relation,
            type:'amplifier',
            amplifierLink:true
          };
        }

        if(
          relation.type==='connect'&&
          (
            amplifierIds.has(
              String(relation.a.id)
            )||
            amplifierIds.has(
              String(relation.b.id)
            )
          )
        ){
          return {
            ...relation,
            type:'none',
            suppressedAmplifierConnect:true
          };
        }
        return relation;
      })
    };

    const containRels=
      graph.rels.filter(
        relation=>relation.type==='contain'
      );
    const invalidContainRels=
      graph.rels.filter(
        relation=>
          relation.type==='invalidContain'
      );
    const contained=new Set(
      containRels.map(
        relation=>String(relation.inner.id)
      )
    );
    const invalidContainInnerIds=new Set(
      invalidContainRels.map(
        relation=>String(relation.inner.id)
      )
    );

    const inheritedContainInnerIds=new Set();
    const inheritedContainOuterIds=new Set();

    for(const contain of containRels){
      for(const candidate of list){
        if(
          candidate.id===contain.inner.id||
          candidate.id===contain.outer.id||
          amplifierIds.has(String(candidate.id))
        )continue;

        if(
          this.relation(
            entity,
            candidate,
            contain.inner
          ).type==='connect'
        ){
          inheritedContainInnerIds.add(
            String(candidate.id)
          );
        }
        if(
          this.relation(
            entity,
            candidate,
            contain.outer
          ).type==='connect'
        ){
          inheritedContainOuterIds.add(
            String(candidate.id)
          );
        }
      }
    }

    const crossRels=
      graph.rels.filter(
        relation=>relation.type==='cross'
      );
    const crossIds=new Set();
    for(const relation of crossRels){
      crossIds.add(String(relation.a.id));
      crossIds.add(String(relation.b.id));
    }

    const nonAmplifier=
      list.filter(
        circle=>
          !amplifierIds.has(String(circle.id))
      );
    const sharedCross=
      this.sharedCrossEffects(
        entity,
        nonAmplifier,
        {
          edges:graph.edges,
          rels:crossRels
        }
      );
    const inheritedCrossIds=
      new Set(
        [...sharedCross.inheritedIds]
          .filter(
            id=>
              !amplifierIds.has(String(id))
          )
          .map(String)
      );

    const crossMultiplierByPair=new Map();
    for(const relation of crossRels){
      const validContainedCount=
        Number(
          contained.has(String(relation.a.id))
        )+
        Number(
          contained.has(String(relation.b.id))
        );

      crossMultiplierByPair.set(
        this.pairKey(
          relation.a,
          relation.b
        ),
        this.config(entity).damage.intersectionBase+validContainedCount*this.config(entity).damage.intersectionContainStep
      );
    }

    const inheritedCrossMultiplierById=
      new Map();

    for(const shared of sharedCross.sourcePairs){
      const value=
        crossMultiplierByPair.get(
          this.pairKey(shared.a,shared.b)
        )??this.config(entity).damage.intersectionBase;

      for(const id of shared.inheritedIds){
        inheritedCrossMultiplierById.set(
          String(id),
          Math.max(
            value,
            inheritedCrossMultiplierById
              .get(String(id))||0
          )
        );
      }
    }

    const circleMultiplierById=new Map();
    for(const circle of list){
      const id=String(circle.id);
      const containRole=
        contained.has(id)||
        inheritedContainInnerIds.has(id);
      const crossRole=
        crossIds.has(id);

      let value=
        (containRole?this.config(entity).damage.containMultiplier:1)*
        (crossRole?this.config(entity).damage.crossMultiplier:1);

      if(
        inheritedCrossMultiplierById.has(id)
      ){
        value=Math.max(
          value,
          inheritedCrossMultiplierById
            .get(id)
        );
      }

      circleMultiplierById.set(id,value);
    }

    const multiplierForTarget=(
      x,
      y,
      radius=0
    )=>{
      const targetCircle={
        x:Number(x)||0,
        y:Number(y)||0,
        r:Math.max(0,Number(radius)||0)
      };
      let best=0;

      for(const circle of list){
        if(
          Math.hypot(
            targetCircle.x-circle.x,
            targetCircle.y-circle.y
          )<=
          targetCircle.r+circle.r
        ){
          best=Math.max(
            best,
            circleMultiplierById.get(
              String(circle.id)
            )??1
          );
        }
      }

      for(const relation of crossRels){
        if(
          this.circleTouchesCrossLens(
            targetCircle,
            relation.a,
            relation.b
          )
        ){
          best=Math.max(
            best,
            crossMultiplierByPair.get(
              this.pairKey(
                relation.a,
                relation.b
              )
            )??this.config(entity).damage.intersectionBase
          );
        }
      }
      return best;
    };

    return {
      list,
      graph,
      rawGraph,
      amplifier,
      amplifierIds,
      containRels,
      invalidContainRels,
      contained,
      invalidContainInnerIds,
      inheritedContainInnerIds,
      inheritedContainOuterIds,
      crossRels,
      crossIds,
      inheritedCrossIds,
      circleMultiplierById,
      crossMultiplierByPair,
      multiplierForTarget
    };
  },

  circleAtPointer(circles,pointer){
    let selected=null;
    let selectedIndex=-1;
    const list=Array.isArray(circles)?circles:[];

    for(let index=0;index<list.length;index++){
      const circle=list[index];
      if(
        Math.hypot(
          Number(pointer.x)-Number(circle.x),
          Number(pointer.y)-Number(circle.y)
        )>Math.max(0,Number(circle.r)||0)
      )continue;

      const order=Number(circle.order)||0;
      const currentOrder=
        Number(selected?.order)||0;

      if(
        !selected||
        order>currentOrder||
        (
          order===currentOrder&&
          index>selectedIndex
        )
      ){
        selected=circle;
        selectedIndex=index;
      }
    }

    return selected;
  },

  circlesAtPointer(circles,pointer){
    return (Array.isArray(circles)?circles:[])
      .filter(circle=>
        Math.hypot(
          Number(pointer.x)-Number(circle.x),
          Number(pointer.y)-Number(circle.y)
        )<=Math.max(0,Number(circle.r)||0)
      );
  },

  removeAtPointer(entity,pointer){
    const state=this.state(entity);
    if(!state)return false;
    const selected=this.circleAtPointer(
      state.circles,
      pointer
    );
    if(!selected)return false;

    const index=state.circles.indexOf(selected);
    if(index<0)return false;
    state.circles.splice(index,1);
    return true;
  },

  utilityAttack(entity,key){
    return entity?.character?.attacks?.[
      String(key||'')
    ]||null;
  },

  canUtility(entity,attack,now=performance.now()){
    if(!entity?.alive||!attack)return false;
    if(
      CombatStatsService.current(entity,now)
        .canAct!==true
    )return false;

    const prepared=
      AugmentService.prepareAttack(
        entity,
        ProgressScaledAttackService.resolve(
          entity,
          attack
        ),
        now
      );

    return (
      AttackService.cooldownReady(
        entity,
        prepared,
        now
      )&&
      StaminaService.canSpend(
        entity,
        prepared.cost,
        now
      )
    );
  },

  commitUtility(
    entity,
    attack,
    now=performance.now()
  ){
    if(
      !this.canUtility(
        entity,
        attack,
        now
      )
    )return false;

    const prepared=
      AugmentService.prepareAttack(
        entity,
        ProgressScaledAttackService.resolve(
          entity,
          attack
        ),
        now
      );

    if(
      !StaminaService.spend(
        entity,
        prepared.cost,
        now
      )
    )return false;

    entity.cooldowns.set(
      prepared.id,
      now+Math.max(0,Number(prepared.cd)||0)
    );
    AttackService.applyAttackDelay(
      entity,
      prepared,
      now
    );
    entity.lastAttackTime=now;
    NaturalHealthRegenActivityService.mark(
      entity,
      now
    );

    GameEvents.emit(
      'ability-used',
      {
        source:entity,
        ability:null,
        attack:prepared,
        angle:0,
        usageTags:new Set(
          TagService.attackTags(prepared)
        ),
        suppressStealthReveal:false
      }
    );

    return true;
  },

  placeCircle(
    entity,
    circle,
    now=performance.now()
  ){
    const state=this.state(entity);
    const config=this.circleConfig(entity);
    const attack=
      this.utilityAttack(entity,'rmb');
    if(
      !state||
      !config||
      !attack||
      state.circles.length>=this.maxCount(entity)
    )return false;

    if(
      !this.commitUtility(
        entity,
        attack,
        now
      )
    )return false;

    const minRadius=
      Math.max(0,Number(config.minRadius)||0);
    const maxRadius=this.maxRadius(entity,now);
    const radius=Math.max(
      minRadius,
      Math.min(
        maxRadius,
        Number(circle?.r)||minRadius
      )
    );

    state.circleOrder++;
    state.circles.push({
      id:
        `${String(entity.id)}:${String(state.formationKey)}:${state.circleOrder}`,
      x:Number(circle?.x)||0,
      y:Number(circle?.y)||0,
      r:radius,
      order:state.circleOrder
    });
    return true;
  },

  placeMinimum(
    entity,
    pointer,
    {now=performance.now()}={}
  ){
    return this.placeCircle(
      entity,
      {
        x:Number(pointer?.x)||0,
        y:Number(pointer?.y)||0,
        r:this.minRadius(entity)
      },
      now
    );
  },

  handlesInput(entity,slot){
    const config=this.config(entity);
    if(!config)return false;
    return (
      String(config.circle?.input||'')===
        String(slot)||
      String(config.activation?.input||'')===
        String(slot)
    );
  },

  isLocalEntity(entity){
    if(!entity)return false;
    if(
      typeof EntitySimulationAuthorityService!=='undefined'
    ){
      return EntitySimulationAuthorityService
        .isLocal(entity)===true;
    }
    return entity===Training.player;
  },

  press(entity,slot,now=performance.now()){
    const config=this.config(entity);
    const state=this.state(entity);
    if(
      !config||
      !state||
      !entity?.alive||
      CombatStatsService.current(entity,now)
        .canAct!==true
    )return false;

    const pointer=this.pointerFor(entity);

    if(
      String(slot)===
      String(config.circle?.input||'')
    ){
      const cast=state.activation;
      if(cast?.phase==='input'){
        this.cancelActivation(
          entity,
          'cross-input-remove'
        );

        if(
          this.removeAtPointer(
            entity,
            pointer
          )
        ){
          this.commitUtility(
            entity,
            this.utilityAttack(
              entity,
              'remove'
            ),
            now
          );
        }

        state.circleInput={
          mode:'consumed'
        };
        return true;
      }

      if(cast){
        state.circleInput={
          mode:'consumed'
        };
        return true;
      }

      const picked=this.circleAtPointer(
        state.circles,
        pointer
      );
      state.circleInput={
        mode:'pending',
        startAt:now,
        start:{...pointer},
        last:{...pointer},
        createStart:null,
        circle:picked||null,
        preview:null,
        moved:false,
        dragIntent:false,
        dragStarted:false,
        holdOrigin:{...pointer},
        limitBlocked:
          state.circles.length>=
          this.maxCount(entity)
      };
      return true;
    }

    if(
      String(slot)===
      String(config.activation?.input||'')
    ){
      const existing=state.activation;

      if(existing?.phase==='input'){
        if(existing.held)return true;

        const previous=
          this.cancelActivation(
            entity,
            'same-input-recast'
          );
        const saved=
          state.lastFormation.length
            ?state.lastFormation
            :previous?.previousFormation||[];

        const spellbook=
          this.utilityAttack(
            entity,
            'spellbook'
          );

        if(
          saved.length&&
          this.commitUtility(
            entity,
            spellbook,
            now
          )
        ){
          const restored=
            this.cloneRelative(
              saved,
              pointer.x,
              pointer.y,
              `${entity.id}:spellbook`
            ).slice(
              0,
              this.maxCount(entity)
            );
          state.circles=restored;
          state.circleOrder=Math.max(
            state.circleOrder,
            ...restored.map(
              circle=>Number(circle.order)||0
            ),
            0
          );
        }
        return true;
      }

      if(existing)return true;

      return this.beginActivation(
        entity,
        pointer,
        {
          held:true,
          now
        }
      );
    }

    return false;
  },

  release(
    entity,
    slot,
    triggerRelease=true,
    now=performance.now()
  ){
    const config=this.config(entity);
    const state=this.state(entity,false);
    if(!config||!state)return false;

    if(
      String(slot)===
      String(config.circle?.input||'')
    ){
      const input=state.circleInput;
      state.circleInput=null;

      if(!triggerRelease){
        return true;
      }

      if(
        !input||
        input.mode==='consumed'
      )return true;

      if(input.mode==='move'){
        return true;
      }

      let creation=null;

      if(
        input.mode==='create'&&
        input.preview
      ){
        creation={...input.preview};
      }else if(input.mode==='pending'){
        creation={
          x:Number(input.start.x)||0,
          y:Number(input.start.y)||0,
          r:this.minRadius(entity)
        };
      }

      if(creation){
        if(
          state.circles.length>=
          this.maxCount(entity)
        ){
          state.limitPreview={
            ...creation,
            endAt:now+280
          };
          return true;
        }

        this.placeCircle(
          entity,
          creation,
          now
        );
      }
      return true;
    }

    if(
      String(slot)===
      String(config.activation?.input||'')
    ){
      const cast=state.activation;
      if(!cast)return true;

      if(!triggerRelease){
        this.cancelActivation(
          entity,
          'input-reset'
        );
        return true;
      }

      cast.held=false;

      if(cast.phase==='move'){
        this.finishGroupMove(
          entity,
          now
        );
      }
      return true;
    }

    return false;
  },

  beginActivation(
    entity,
    pointer,
    {
      held=false,
      now=performance.now()
    }={}
  ){
    const state=this.state(entity);
    const config=this.config(entity);
    if(!state||!config)return false;

    if(state.activation)return false;

    const lmbAttack=
      this.utilityAttack(entity,'lmb');
    if(!lmbAttack)return false;

    const prepared=
      AugmentService.prepareAttack(
        entity,
        ProgressScaledAttackService.resolve(
          entity,
          lmbAttack
        ),
        now
      );

    if(
      !entity.alive||
      CombatStatsService.current(entity,now)
        .canAct!==true||
      !AttackService.cooldownReady(
        entity,
        prepared,
        now
      )
    )return false;

    const currentCircles=
      this.cloneCircles(
        state.circles,
        'activation-current'
      );
    const hasSavedFormation=
      Array.isArray(state.lastFormation)&&
      state.lastFormation.length>0;
    if(
      !currentCircles.length&&
      !hasSavedFormation
    )return false;

    const picked=this.circlesAtPointer(
      state.circles,
      pointer
    );
    const selectedIds=this.connectedIds(
      entity,
      new Set(
        picked.map(circle=>String(circle.id))
      ),
      state.circles
    );
    const inputWindow=Math.max(
      1,
      Number(
        config.activation?.inputWindowMs
      )||200
    );

    state.activation={
      phase:'input',
      startedAt:now,
      inputUntil:now+inputWindow,
      held:held===true,
      pointer:{...pointer},
      selectedIds,
      activationCircles:currentCircles,
      previousFormation:
        state.lastFormation.map(
          item=>({...item})
        ),
      moveLast:{...pointer},
      holdOrigin:{...pointer},
      moveStarted:false
    };

    return true;
  },

  cancelActivation(entity,reason='cancel'){
    const state=this.state(entity,false);
    if(!state?.activation)return null;

    const previous={
      ...state.activation,
      selectedIds:
        new Set(state.activation.selectedIds||[])
    };
    previous.reason=String(reason||'cancel');
    state.activation=null;
    state.revealStartedAt=0;
    state.revealUntil=0;
    return previous;
  },

  cancelWindupOnForcedMovement(
    entity,
    reason='forced-movement'
  ){
    const state=this.state(
      entity,
      false
    );

    const cast=
      state?.activation||
      null;

    if(!cast)return false;

    /*
     * 티냐의 선딜은 맵에 마법진이 그려지기 전 input 구간만이다.
     * reveal(0.35초)은 이미 마법진이 맵에 그려진 뒤의 진행 상태이므로
     * 선딜로 취급하지 않고 강제이동으로 취소하지 않는다.
     * move 역시 LMB HOLD 위치 조정 상태이므로 제외한다.
     */
    if(
      cast.phase!=='input'
    ){
      return false;
    }

    const attack=
      this.utilityAttack(
        entity,
        'lmb'
      );

    if(
      !AttackWindupService
        .isTaggedAttack(
          attack
        )
    ){
      return false;
    }

    this.cancelActivation(
      entity,
      reason
    );

    return true;
  },

  beginReveal(entity,cast,now){
    const state=this.state(entity,false);
    const config=this.config(entity);
    if(
      !state||
      state.activation!==cast||
      !config
    )return false;

    if(
      !cast.activationCircles?.length
    ){
      this.cancelActivation(
        entity,
        'empty-field'
      );
      return false;
    }

    cast.phase='reveal';
    cast.revealStartedAt=now;
    cast.revealUntil=
      now+
      Math.max(
        0,
        Number(config.activation?.revealMs)||0
      );
    state.revealStartedAt=now;
    state.revealUntil=cast.revealUntil;
    return true;
  },

  finishGroupMove(entity,now){
    const state=this.state(entity,false);
    const cast=state?.activation;
    if(!state||cast?.phase!=='move')return false;

    state.activation=null;
    state.revealStartedAt=0;
    state.revealUntil=0;

    const lmb=this.utilityAttack(entity,'lmb');
    if(lmb){
      const prepared=
        AugmentService.prepareAttack(
          entity,
          ProgressScaledAttackService.resolve(
            entity,
            lmb
          ),
          now
        );
      AttackService.applyAttackDelay(
        entity,
        prepared,
        now
      );
    }
    return true;
  },

  updateCircleInput(entity,state,now){
    const input=state.circleInput;
    const config=this.circleConfig(entity);
    if(
      !input||
      input.mode==='consumed'||
      !config
    )return false;

    const pointer=this.pointerFor(entity);

    if(input.mode==='pending'){
      const distance=Math.hypot(
        pointer.x-input.start.x,
        pointer.y-input.start.y
      );
      const intentDistance=Math.max(
        0,
        Number(config.dragIntentDistance)||5
      );
      const startDistance=Math.max(
        intentDistance,
        Number(config.dragStartDistance)||12
      );

      if(distance>=intentDistance){
        input.dragIntent=true;
      }

      if(distance>=startDistance){
        const holdMs=Math.max(
          1,
          Number(config.moveHoldMs)||150
        );

        if(now-input.startAt<holdMs){
          input.mode='create';
          input.createStart={...input.start};
        }else if(input.circle){
          input.mode='move';
          input.last={...input.start};
          input.holdOrigin={...input.start};
          input.dragStarted=true;
          input.moved=true;
        }
      }
    }

    if(input.mode==='create'){
      const origin=
        input.createStart||
        input.start;
      const distance=Math.hypot(
        pointer.x-origin.x,
        pointer.y-origin.y
      );
      const minRadius=Math.max(
        0,
        Number(config.minRadius)||0
      );
      const maxRadius=this.maxRadius(entity,now);
      const radius=Math.max(
        minRadius,
        Math.min(maxRadius,distance/2)
      );

      input.preview={
        x:(origin.x+pointer.x)/2,
        y:(origin.y+pointer.y)/2,
        r:radius
      };
      input.last={...pointer};
      return true;
    }

    if(
      input.mode==='move'&&
      input.circle
    ){
      const deadzone=Math.max(
        0,
        Number(config.holdMoveDeadzone)||10
      );
      const origin=input.holdOrigin||input.start;

      if(
        !input.dragStarted&&
        Math.hypot(
          pointer.x-origin.x,
          pointer.y-origin.y
        )>=deadzone
      ){
        input.dragStarted=true;
      }

      if(input.dragStarted){
        const dx=pointer.x-input.last.x;
        const dy=pointer.y-input.last.y;
        const distance=Math.hypot(dx,dy);
        const factor=
          distance<.35
            ?1
            :Math.min(
              .58,
              .22+distance/180
            );
        const mx=dx*factor;
        const my=dy*factor;

        if(Math.abs(mx)+Math.abs(my)>.001){
          input.circle.x+=mx;
          input.circle.y+=my;
          input.last={
            x:input.last.x+mx,
            y:input.last.y+my
          };
          input.moved=true;
        }
      }
      return true;
    }

    return false;
  },

  updateActivation(entity,state,now){
    const cast=state.activation;
    const config=this.config(entity);
    if(!cast||!config)return false;

    if(
      cast.phase==='input'&&
      now>=cast.inputUntil
    ){
      if(cast.held){
        if(!cast.selectedIds?.size){
          this.cancelActivation(
            entity,
            'hold-outside-circle'
          );
          return false;
        }

        cast.phase='move';
        cast.moveLast={...cast.pointer};
        cast.holdOrigin={...cast.pointer};
        cast.moveStarted=false;
      }else{
        this.beginReveal(
          entity,
          cast,
          now
        );
      }
    }

    if(cast.phase==='move'){
      const pointer=this.pointerFor(entity);
      const deadzone=Math.max(
        0,
        Number(
          config.activation?.holdMoveDeadzone
        )||10
      );
      const origin=
        cast.holdOrigin||
        cast.pointer;

      if(
        !cast.moveStarted&&
        Math.hypot(
          pointer.x-origin.x,
          pointer.y-origin.y
        )>=deadzone
      ){
        cast.moveStarted=true;
      }

      if(cast.moveStarted){
        const dx=pointer.x-cast.moveLast.x;
        const dy=pointer.y-cast.moveLast.y;
        const distance=Math.hypot(dx,dy);
        const factor=
          distance<.35
            ?1
            :Math.min(
              .58,
              .22+distance/180
            );
        const mx=dx*factor;
        const my=dy*factor;

        if(Math.abs(mx)+Math.abs(my)>.001){
          for(const circle of state.circles){
            if(
              cast.selectedIds.has(
                String(circle.id)
              )
            ){
              circle.x+=mx;
              circle.y+=my;
            }
          }
          cast.moveLast={
            x:cast.moveLast.x+mx,
            y:cast.moveLast.y+my
          };
        }
      }
      return true;
    }

    if(
      cast.phase==='reveal'&&
      now>=cast.revealUntil
    ){
      this.resolveActivation(
        entity,
        cast,
        now
      );
      return true;
    }

    return true;
  },

  update(entity,now=performance.now()){
    const state=this.state(entity,false);
    if(!state)return false;

    if(!entity?.alive){
      if(!state.clearedForDeath){
        state.circles.length=0;
        state.circleInput=null;
        state.activation=null;
        state.revealStartedAt=0;
        state.revealUntil=0;
        state.burst=null;
        state.pendingManifest=null;
        state.lastCounterNetworkSnapshot=null;
        state.clearedForDeath=true;
      }
      return false;
    }

    state.clearedForDeath=false;

    this.updateCircleInput(
      entity,
      state,
      now
    );
    this.updateActivation(
      entity,
      state,
      now
    );

    if(
      state.limitPreview&&
      now>=state.limitPreview.endAt
    ){
      state.limitPreview=null;
    }

    if(
      state.burst&&
      now>=state.burst.endAt
    ){
      state.burst=null;
    }

    return true;
  },

  resolveActivation(entity,cast,now){
    const state=this.state(entity,false);
    if(
      !state||
      state.activation!==cast
    )return false;

    const circles=
      this.cloneCircles(
        cast.activationCircles,
        'manifest'
      );
    state.activation=null;
    state.revealStartedAt=0;
    state.revealUntil=0;

    if(!circles.length)return false;

    const attack=
      this.utilityAttack(entity,'lmb');
    if(!attack)return false;

    const pointerCenter={
      x:circles.reduce(
        (sum,circle)=>sum+circle.x,
        0
      )/circles.length,
      y:circles.reduce(
        (sum,circle)=>sum+circle.y,
        0
      )/circles.length
    };
    const angle=Math.atan2(
      pointerCenter.y-(Number(entity.y)||0),
      pointerCenter.x-(Number(entity.x)||0)
    );

    state.pendingManifest={
      circles,
      source:'placed'
    };

    const beforeSequence=
      Math.max(0,Number(entity.attackSequence)||0);

    const executed=
      AttackService.execute(
        entity,
        attack,
        angle
      );

    if(!executed){
      state.pendingManifest=null;
      return false;
    }

    const executionSequence=
      Math.max(
        beforeSequence+1,
        Number(entity.attackSequence)||0
      );

    state.lastFormation=
      this.snapshotRelative(circles);
    state.circles.length=0;
    this.createBurst(
      entity,
      circles,
      now
    );

    this.broadcastManifest(
      entity,
      attack,
      circles,
      angle,
      executionSequence
    );

    return true;
  },


  defaultCounterFormation(entity,pointer){
    const state=this.state(entity);
    const currentSnapshot=
      state?.circles?.length
        ?this.snapshotRelative(
          state.circles
        )
        :[
          {
            dx:0,
            dy:0,
            r:this.minRadius(entity),
            order:1
          }
        ];

    return this.cloneRelative(
      currentSnapshot,
      pointer.x,
      pointer.y,
      `${entity.id}:counter`
    );
  },

  resolveModuleCircles(
    entity,
    module,
    execution
  ){
    const state=this.state(entity);
    if(!state)return [];

    if(
      state.pendingManifest?.circles?.length
    ){
      const circles=this.cloneCircles(
        state.pendingManifest.circles,
        'pending-manifest'
      );
      state.pendingManifest=null;
      return circles;
    }

    const sourceMode=String(module?.source||'placed');

    if(sourceMode==='last'){
      const pointer=this.pointerFor(
        entity,
        execution?.targetPoint
      );
      const snapshot=
        Array.isArray(state.lastFormation)&&
        state.lastFormation.length
          ?state.lastFormation
          :[
            {
              dx:0,
              dy:0,
              r:this.minRadius(entity),
              order:1
            }
          ];
      return this.cloneRelative(
        snapshot,
        pointer.x,
        pointer.y,
        `${entity.id}:counter-last`
      );
    }

    if(sourceMode==='current'){
      return this.defaultCounterFormation(
        entity,
        this.pointerFor(
          entity,
          execution?.targetPoint
        )
      );
    }

    return this.cloneCircles(
      state.circles,
      'placed-manifest'
    );
  },

  strongestImpactCircle(
    model,
    target
  ){
    let best=null;
    let bestMultiplier=0;
    const tx=Number(target?.x)||0;
    const ty=Number(target?.y)||0;
    const radius=Math.max(
      0,
      Number(target?.radius)||0
    );

    for(const circle of model.list){
      if(
        Math.hypot(
          tx-circle.x,
          ty-circle.y
        )>
        radius+circle.r
      )continue;

      const multiplier=
        model.circleMultiplierById.get(
          String(circle.id)
        )||1;

      if(multiplier>bestMultiplier){
        bestMultiplier=multiplier;
        best=circle;
      }
    }

    return best;
  },

  amplifierStageForTarget(
    model,
    target
  ){
    const tx=Number(target?.x)||0;
    const ty=Number(target?.y)||0;
    const radius=Math.max(
      0,
      Number(target?.radius)||0
    );
    let stage=0;

    for(const circle of model.list){
      if(
        Math.hypot(
          tx-circle.x,
          ty-circle.y
        )<=
        radius+circle.r
      ){
        stage=Math.max(
          stage,
          Number(
            model.amplifier
              .stageByCircle.get(
                String(circle.id)
              )
          )||0
        );
      }
    }
    return stage;
  },

  amplifierStatusConfig(entity){
    const config=this.config(entity)?.amplifier||{};
    const duration=Math.max(0,Number(config.duration)||0);
    return {
      sourceId:`${String(entity?.id||'source')}:formation-amplifier`,
      duration,
      stages:[
        {
          stage:1,
          status:'slow',
          data:{factor:Math.max(.05,Math.min(1,Number(config.slowFactor)||1))}
        },
        {stage:2,status:'bind'},
        {stage:3,status:'freeze'}
      ]
    };
  },

  applyManifestDamage(
    entity,
    attack,
    execution,
    circles,
    angle,
    now=performance.now()
  ){
    if(!entity||!attack||!execution||!circles?.length)return 0;
    const model=this.damageModel(entity,circles);
    return WeightedCircleAttackDeliveryService.execute({
      source:entity,
      attack,
      execution,
      model,
      circles,
      impactCircleForTarget:target=>this.strongestImpactCircle(model,target)||circles[0],
      statusStageForTarget:target=>this.amplifierStageForTarget(model,target),
      statusConfig:this.amplifierStatusConfig(entity),
      now
    });
  },

  manifestFromModule(
    entity,
    attack,
    execution,
    module,
    angle,
    now=performance.now()
  ){
    const circles=
      this.resolveModuleCircles(
        entity,
        module,
        execution
      );
    if(!circles.length)return false;

    this.applyManifestDamage(
      entity,
      attack,
      execution,
      circles,
      angle,
      now
    );

    const state=this.state(entity);
    if(state){
      if(module.storeLast===true){
        state.lastFormation=
          this.snapshotRelative(circles);
      }

      if(
        ['last','current'].includes(
          String(module.source||'')
        )
      ){
        state.lastCounterNetworkSnapshot=
          this.cloneCircles(
            circles,
            'counter-network'
          );
      }

      this.createBurst(
        entity,
        circles,
        now
      );
    }

    return true;
  },

  createBurst(entity,circles,now=performance.now()){
    const state=this.state(entity);
    const config=this.config(entity);
    if(!state||!config)return false;

    const model=this.damageModel(
      entity,
      circles
    );
    const activeAmplifiers=
      model.list.filter(circle=>
        model.amplifier.sourceIds.has(
          String(circle.id)
        )
      );
    const amplifierSegments=[];

    for(let i=0;i<activeAmplifiers.length;i++){
      for(let j=i+1;j<activeAmplifiers.length;j++){
        amplifierSegments.push({
          x1:activeAmplifiers[i].x,
          y1:activeAmplifiers[i].y,
          x2:activeAmplifiers[j].x,
          y2:activeAmplifiers[j].y
        });
      }
    }

    const duration=Math.max(
      220,
      Number(config.burstDuration)||440
    );
    state.burst={
      circles:this.cloneCircles(
        circles,
        'burst'
      ),
      amplifierSegments,
      startedAt:now,
      endAt:now+duration,
      duration
    };
    return true;
  },

  broadcastManifest(
    entity,
    attack,
    circles,
    angle,
    executionSequence
  ){
    return GameplayAttackSnapshotSyncService.send(
      entity,
      'circle-formation',
      {
        attackId:String(attack?.id||''),
        angle:Number(angle)||0,
        executionSequence:Math.max(0,Math.floor(Number(executionSequence)||0)),
        snapshot:{circles:this.cloneCircles(circles,'network-manifest')}
      }
    );
  },

  receiveManifest(entity,payload){
    if(!entity?.alive)return false;

    const attackId=String(payload?.attackId||'');
    const base=
      AbilityService.attackById(
        entity.character,
        attackId
      );
    if(!base)return false;

    const now=performance.now();
    const attack=
      AugmentService.prepareAttack(
        entity,
        ProgressScaledAttackService.resolve(
          entity,
          base
        ),
        now
      );
    const sequence=Math.max(
      0,
      Math.floor(
        Number(payload.executionSequence)||0
      )
    );
    const angle=Number(payload.angle)||0;
    const execution=
      AttackExecutionService.bySequence(
        entity,
        sequence,
        attack,
        angle
      );
    if(!execution)return false;

    entity.attackSequence=Math.max(
      Math.max(
        0,
        Number(entity.attackSequence)||0
      ),
      sequence
    );

    const circles=this.cloneCircles(
      payload?.snapshot?.circles||payload?.circles,
      'remote-manifest'
    );
    if(!circles.length)return false;

    this.applyManifestDamage(
      entity,
      attack,
      execution,
      circles,
      angle,
      now
    );
    this.createBurst(
      entity,
      circles,
      now
    );
    return true;
  },

  counterNetworkSnapshot(entity){
    const state=this.state(entity,false);
    if(!state?.lastCounterNetworkSnapshot){
      return null;
    }
    const snapshot=
      this.cloneCircles(
        state.lastCounterNetworkSnapshot,
        'counter-packet'
      );
    state.lastCounterNetworkSnapshot=null;
    return snapshot;
  },

  setPendingCounterSnapshot(
    entity,
    circles
  ){
    const state=this.state(entity);
    if(!state)return false;
    const snapshot=this.cloneCircles(
      circles,
      'remote-counter'
    );
    if(!snapshot.length)return false;

    state.pendingManifest={
      circles:snapshot,
      source:'last'
    };
    return true;
  },

  serialize(entity,now=performance.now()){
    const state=this.state(entity,false);
    if(!state)return null;

    const revealing=
      state.revealUntil>now&&
      state.circles.length>0;

    return {
      revealRemaining:
        revealing
          ?Math.max(
            0,
            state.revealUntil-now
          )
          :0,
      revealElapsed:
        revealing
          ?Math.max(
            0,
            now-
            Math.max(
              0,
              Number(state.revealStartedAt)||now
            )
          )
          :0,
      circles:this.cloneCircles(
        state.circles,
        'state'
      )
    };
  },

  applyRemote(
    entity,
    snapshot,
    now=performance.now()
  ){
    const state=this.state(entity);
    if(!state)return false;

    if(
      !snapshot||
      !Array.isArray(snapshot.circles)
    ){
      state.remoteCircles.length=0;
      state.remoteRevealStartedAt=0;
      state.remoteRevealUntil=0;
      return false;
    }

    state.remoteCircles=
      this.cloneCircles(
        snapshot.circles,
        'remote-state'
      );
    state.remoteRevealStartedAt=
      now-
      Math.max(
        0,
        Number(snapshot.revealElapsed)||0
      );
    state.remoteRevealUntil=
      now+
      Math.max(
        0,
        Number(snapshot.revealRemaining)||0
      );
    return true;
  },

  roleMeta(entity,circles){
    const model=this.damageModel(
      entity,
      circles
    );
    const meta=new Map(
      model.list.map(circle=>[
        String(circle.id),
        {
          containInner:false,
          containOuter:false,
          inheritedContainInner:false,
          inheritedContainOuter:false,
          connect:false,
          cross:false,
          inheritedCross:false,
          amplifierSource:false,
          amplifyLevel:0,
          amplifyInherited:false
        }
      ])
    );

    for(const relation of model.graph.rels){
      const a=meta.get(String(relation.a.id));
      const b=meta.get(String(relation.b.id));

      if(relation.type==='contain'){
        const inner=meta.get(
          String(relation.inner.id)
        );
        const outer=meta.get(
          String(relation.outer.id)
        );
        if(inner)inner.containInner=true;
        if(outer)outer.containOuter=true;
      }else if(relation.type==='connect'){
        if(a)a.connect=true;
        if(b)b.connect=true;
      }
    }

    for(const relation of model.crossRels){
      const a=meta.get(String(relation.a.id));
      const b=meta.get(String(relation.b.id));
      if(a)a.cross=true;
      if(b)b.cross=true;
    }

    for(const id of model.inheritedCrossIds){
      const item=meta.get(String(id));
      if(item)item.inheritedCross=true;
    }

    for(const id of model.inheritedContainInnerIds){
      const item=meta.get(String(id));
      if(item)item.inheritedContainInner=true;
    }

    for(const id of model.inheritedContainOuterIds){
      const item=meta.get(String(id));
      if(item)item.inheritedContainOuter=true;
    }

    for(const id of model.amplifier.sourceIds){
      const item=meta.get(String(id));
      if(!item)continue;
      item.amplifierSource=true;
      item.connect=false;
      item.cross=false;
      item.inheritedCross=false;
      item.inheritedContainInner=false;
      item.inheritedContainOuter=false;
    }

    for(const [id,stage] of model.amplifier.stageByCircle){
      const item=meta.get(String(id));
      if(!item||model.amplifier.sourceIds.has(String(id)))continue;
      item.amplifyLevel=
        Math.max(
          0,
          Math.min(this.config(entity).amplifier.maxStage,Number(stage)||0)
        );
      item.amplifyInherited=
        model.amplifier.inheritedStageIds
          .has(String(id))&&
        !model.amplifier.directReceiverIds
          .has(String(id));
    }

    return {model,meta};
  },

  drawRoleIcon(ctx,icon,x,y,alpha=1){
    const gray=icon?.gray===true;
    const stroke=
      gray
        ?`rgba(156,160,166,${.96*alpha})`
        :`rgba(230,233,236,${.96*alpha})`;
    const fill=
      gray
        ?`rgba(118,122,128,${.9*alpha})`
        :`rgba(178,182,188,${.92*alpha})`;

    ctx.save();
    ctx.translate(x,y);
    ctx.lineWidth=2.4;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.strokeStyle=stroke;
    ctx.fillStyle=fill;

    if(icon.type==='contain'){
      if(icon.outerFilled){
        ctx.beginPath();
        ctx.arc(0,0,10.5,0,Math.PI*2);
        ctx.arc(0,0,5.2,0,Math.PI*2,true);
        ctx.fill('evenodd');
      }
      ctx.beginPath();
      ctx.arc(0,0,10.5,0,Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0,0,5.2,0,Math.PI*2);
      if(icon.innerFilled)ctx.fill();
      ctx.stroke();
    }else if(icon.type==='connect'){
      ctx.beginPath();
      ctx.moveTo(-10,0);
      ctx.lineTo(10,0);
      ctx.moveTo(0,-10);
      ctx.lineTo(0,10);
      ctx.stroke();
    }else if(icon.type==='cross'){
      if(icon.sharedFilled){
        ctx.save();
        ctx.beginPath();
        ctx.arc(-4.6,0,10.5,0,Math.PI*2);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(4.6,0,10.5,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(-4.6,0,10.5,0,Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4.6,0,10.5,0,Math.PI*2);
      ctx.stroke();
    }else{
      ctx.beginPath();
      ctx.arc(0,0,10.5,0,Math.PI*2);
      ctx.stroke();
      const label=String(icon.label||'');
      if(label){
        ctx.fillStyle=
          gray
            ?`rgba(178,182,188,${.98*alpha})`
            :`rgba(232,235,238,${.98*alpha})`;
        ctx.font='bold 12px Pretendard';
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillText(label,12,.5);
      }
    }

    ctx.restore();
  },

  drawSet(
    ctx,
    entity,
    circles,
    alpha=1,
    {
      manifest=false,
      hideRoleIcons=false,
      amplifierSegments=null,
      revealProgress=1,
      roleIconIds=null,
      manifestProgress=null,
      extraInvalidIds=null,
      teamOutline=false
    }={}
  ){
    const list=this.cloneCircles(
      circles,
      'draw'
    );
    if(!list.length)return false;

    const {model,meta}=
      this.roleMeta(
        entity,
        list
      );
    const nativeRgb=
      String(
        this.config(entity)?.color||
        '146,203,214'
      );
    const teamColor=
      TeamColorPresentationService.colorForEntity(
        entity,
        entity?.color||'#92cbd6'
      );
    const outlineRgb=
      manifest||teamOutline
        ?ColorService.rgbString(
          teamColor,
          nativeRgb
        )
        :nativeRgb;
    const progress=Math.max(
      0,
      Math.min(
        1,
        Number(revealProgress)
      )
    );
    const sweepStart=-Math.PI/2;
    const sweepEnd=
      sweepStart+
      Math.PI*2*progress;

    /*
      활성 증폭 마법진끼리는 별도 조건 없이 항상 서로 연결한다.
      발동 잔상에서는 아래 amplifierSegments의 고정 실선만 사용한다.
    */
    if(!manifest){
      const activeAmplifiers=
        list.filter(circle=>
          model.amplifier.sourceIds.has(
            String(circle.id)
          )
        );

      for(let i=0;i<activeAmplifiers.length;i++){
        for(let j=i+1;j<activeAmplifiers.length;j++){
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(
            activeAmplifiers[i].x,
            activeAmplifiers[i].y
          );
          ctx.lineTo(
            activeAmplifiers[j].x,
            activeAmplifiers[j].y
          );
          ctx.strokeStyle=
            `rgba(${outlineRgb},${.58*alpha})`;
          ctx.lineWidth=2;
          ctx.setLineDash([6,7]);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    for(const relation of model.crossRels){
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        relation.a.x,
        relation.a.y,
        relation.a.r,
        0,
        Math.PI*2
      );
      ctx.clip();
      ctx.beginPath();
      ctx.arc(
        relation.b.x,
        relation.b.y,
        relation.b.r,
        0,
        Math.PI*2
      );
      ctx.fillStyle=
        manifest
          ?`rgba(146,203,214,${.24*alpha})`
          :`rgba(118,122,128,${.30*alpha})`;
      ctx.fill();
      ctx.restore();
    }

    for(const circle of list){
      const id=String(circle.id);
      const invalid=
        !manifest&&
        (
          model.invalidContainInnerIds
            .has(id)||
          extraInvalidIds?.has(id)
        );

      ctx.save();

      /*
        공개 선딜은 12시부터 시계방향으로 실제 마법진이 그려지는 형태.
        채움도 같은 sweep 부채꼴 clip을 사용해 원 전체가 한 번에 나타나지 않는다.
      */
      if(!manifest&&progress<1){
        ctx.beginPath();
        ctx.moveTo(circle.x,circle.y);
        ctx.arc(
          circle.x,
          circle.y,
          circle.r,
          sweepStart,
          sweepEnd,
          false
        );
        ctx.closePath();
        ctx.clip();
      }

      ctx.beginPath();
      ctx.arc(
        circle.x,
        circle.y,
        circle.r,
        0,
        Math.PI*2
      );
      ctx.fillStyle=
        manifest
          ?`rgba(146,203,214,${.12*alpha})`
          :(
            invalid
              ?`rgba(230,55,65,${.22*alpha})`
              :`rgba(178,182,188,${.10*alpha})`
          );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      if(!manifest&&progress<1){
        ctx.arc(
          circle.x,
          circle.y,
          circle.r,
          sweepStart,
          sweepEnd,
          false
        );
      }else{
        ctx.arc(
          circle.x,
          circle.y,
          circle.r,
          0,
          Math.PI*2
        );
      }
      ctx.strokeStyle=
        invalid
          ?`rgba(255,72,82,${.98*alpha})`
          :`rgba(${outlineRgb},${.94*alpha})`;
      ctx.lineWidth=invalid?4:3;
      ctx.setLineDash(
        manifest
          ?[]
          :(invalid?[8,5]:[10,6])
      );
      ctx.stroke();
      ctx.restore();

      const item=meta.get(id)||{};
      if(item.amplifierSource){
        ctx.save();
        ctx.beginPath();
        if(!manifest&&progress<1){
          ctx.arc(
            circle.x,
            circle.y,
            Math.max(2,circle.r-7),
            sweepStart,
            sweepEnd,
            false
          );
        }else{
          ctx.arc(
            circle.x,
            circle.y,
            Math.max(2,circle.r-7),
            0,
            Math.PI*2
          );
        }
        ctx.strokeStyle=
          manifest
            ?`rgba(255,255,255,${.78*alpha})`
            :`rgba(198,202,207,${.78*alpha})`;
        ctx.lineWidth=2;
        ctx.setLineDash(
          manifest?[]:[3,7]
        );
        if(!manifest){
          ctx.lineDashOffset=
            -(performance.now()/55)%10;
        }
        ctx.stroke();
        ctx.restore();
      }

      const allowRoleIcons=
        !manifest&&
        !hideRoleIcons&&
        (
          !roleIconIds||
          roleIconIds.has(id)
        );

      if(allowRoleIcons){
        const icons=[];
        if(
          item.containInner||
          item.containOuter
        ){
          icons.push({
            type:'contain',
            innerFilled:
              item.containInner===true,
            outerFilled:
              item.containOuter===true
          });
        }
        if(
          item.inheritedContainInner||
          item.inheritedContainOuter
        ){
          icons.push({
            type:'contain',
            innerFilled:
              item.inheritedContainInner===true,
            outerFilled:
              item.inheritedContainOuter===true,
            gray:true
          });
        }
        if(item.connect){
          icons.push({type:'connect'});
        }
        if(
          item.cross||
          item.inheritedCross
        ){
          icons.push({
            type:'cross',
            sharedFilled:
              item.inheritedCross===true
          });
        }
        if(item.amplifierSource){
          icons.push({
            type:'solo',
            label:''
          });
        }
        if(item.amplifyLevel>0){
          icons.push({
            type:'solo',
            label:[
              '',
              'I',
              'II',
              'III'
            ][Math.min(3,item.amplifyLevel)]||
              'III',
            gray:
              item.amplifyInherited===true
          });
        }
        if(!icons.length){
          icons.push({
            type:'solo',
            label:''
          });
        }

        const iconWidth=icon=>
          icon?.type==='cross'
            ?31
            :23;
        const gaps=
          icons.slice(0,-1).map(
            (icon,index)=>
              (
                iconWidth(icon)+
                iconWidth(icons[index+1])
              )/2+
              7
          );
        const total=
          gaps.reduce(
            (sum,gap)=>sum+gap,
            0
          );
        const baseY=
          circle.y-circle.r-18;
        let iconX=
          circle.x-total/2;

        for(let index=0;index<icons.length;index++){
          this.drawRoleIcon(
            ctx,
            icons[index],
            iconX,
            baseY,
            alpha
          );
          if(index<gaps.length){
            iconX+=gaps[index];
          }
        }

        const multiplier=
          model.circleMultiplierById.get(id)||1;
        ctx.save();
        ctx.font='bold 18px Pretendard';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.lineWidth=4;
        ctx.strokeStyle=
          `rgba(10,14,18,${.86*alpha})`;
        ctx.fillStyle=
          `rgba(255,255,255,${.96*alpha})`;
        const text=`×${multiplier}`;
        ctx.strokeText(
          text,
          circle.x,
          circle.y
        );
        ctx.fillText(
          text,
          circle.x,
          circle.y
        );
        ctx.restore();
      }
    }

    if(!manifest&&!hideRoleIcons){
      for(const relation of model.crossRels){
        const multiplier=
          model.crossMultiplierByPair.get(
            this.pairKey(
              relation.a,
              relation.b
            )
          )??this.config(entity).damage.intersectionBase;
        const points=
          this.intersectionPoints(
            relation.a,
            relation.b
          );
        if(!points.length)continue;

        const labelX=
          points.reduce(
            (sum,point)=>sum+Number(point.x||0),
            0
          )/points.length;
        const labelY=
          points.reduce(
            (sum,point)=>sum+Number(point.y||0),
            0
          )/points.length;

        ctx.save();
        ctx.font='bold 18px Pretendard';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.lineWidth=4;
        ctx.strokeStyle=
          `rgba(10,14,18,${.90*alpha})`;
        ctx.fillStyle=
          `rgba(255,255,255,${.98*alpha})`;
        const text=`×${multiplier}`;
        ctx.strokeText(
          text,
          labelX,
          labelY
        );
        ctx.fillText(
          text,
          labelX,
          labelY
        );
        ctx.restore();
      }
    }

    /*
      기존 파일의 발동 잔상 증폭 연결선:
      어두운 외곽 + 흰색 실선. 실제 발동 시점 snapshot만 사용한다.
    */
    if(
      manifest&&
      Array.isArray(amplifierSegments)
    ){
      for(const segment of amplifierSegments){
        const x1=Number(segment.x1)||0;
        const y1=Number(segment.y1)||0;
        const x2=Number(segment.x2)||0;
        const y2=Number(segment.y2)||0;

        ctx.save();
        ctx.setLineDash([]);
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.strokeStyle=
          `rgba(8,14,18,${.42*alpha})`;
        ctx.lineWidth=4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.strokeStyle=
          `rgba(255,255,255,${.82*alpha})`;
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.restore();
      }
    }

    /*
      기존 tinyaManifestFlash 질감 복원.
      발동 직후 짧게 12% 팽창하는 청록 채움 + 흰 외곽 플래시.
    */
    if(
      manifest&&
      Number.isFinite(Number(manifestProgress))
    ){
      const flashProgress=Math.max(
        0,
        Math.min(
          1,
          Number(manifestProgress)/.68
        )
      );
      if(flashProgress<1){
        const flashAlpha=
          1-flashProgress;
        for(const circle of list){
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            circle.x,
            circle.y,
            circle.r*
              (
                1+
                flashProgress*.12
              ),
            0,
            Math.PI*2
          );
          ctx.fillStyle=
            `rgba(146,203,214,${.28*flashAlpha})`;
          ctx.fill();
          ctx.strokeStyle=
            `rgba(255,255,255,${.90*flashAlpha})`;
          ctx.lineWidth=4;
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    return true;
  },

  entityHoldGaugeState(
    entity,
    now=performance.now()
  ){
    const state=this.state(entity,false);
    if(
      !state||
      !this.isLocalEntity(entity)
    ){
      return {
        visible:false,
        ratio:0,
        full:false
      };
    }

    const circleInput=state.circleInput;
    if(
      circleInput?.mode==='pending'&&
      circleInput.circle
    ){
      const holdMs=Math.max(
        1,
        Number(
          this.circleConfig(entity)
            ?.moveHoldMs
        )||150
      );
      const ratio=Math.max(
        0,
        Math.min(
          1,
          (
            now-
            Math.max(
              0,
              Number(circleInput.startAt)||now
            )
          )/
          holdMs
        )
      );
      return {
        visible:true,
        ratio,
        full:ratio>=1
      };
    }

    const cast=state.activation;
    if(cast?.phase==='input'){
      const ratio=Math.max(
        0,
        Math.min(
          1,
          (
            now-
            Math.max(
              0,
              Number(cast.startedAt)||now
            )
          )/
          Math.max(
            1,
            Number(cast.inputUntil)-
            Number(cast.startedAt)
          )
        )
      );
      return {
        visible:true,
        ratio,
        full:ratio>=1
      };
    }

    if(cast?.phase==='move'){
      return {
        visible:true,
        ratio:1,
        full:true
      };
    }

    return {
      visible:false,
      ratio:0,
      full:false
    };
  },

  drawCountGauge(
    ctx,
    entity,
    x,
    y,
    width=48
  ){
    const config=this.config(entity);
    const state=this.state(entity,false);
    if(
      !ctx||
      !config||
      !state||
      !this.isLocalEntity(entity)
    )return 0;

    const maxCount=this.maxCount(entity);
    const placed=Math.max(
      0,
      Math.min(
        maxCount,
        state.circles.length
      )
    );
    const gap=2;
    const height=4;
    const gaugeWidth=Math.max(
      1,
      Number(width)||48
    );
    const cellWidth=
      (
        gaugeWidth-
        gap*(maxCount-1)
      )/
      maxCount;
    const fillColor=
      String(config.color||'146,203,214');

    ctx.save();
    for(let index=0;index<maxCount;index++){
      const cellX=
        Number(x)+
        index*(cellWidth+gap);
      ctx.fillStyle='rgba(10,18,22,0.92)';
      ctx.fillRect(
        cellX,
        Number(y),
        cellWidth,
        height
      );
      if(index<placed){
        ctx.fillStyle=
          `rgba(${fillColor},0.95)`;
        ctx.fillRect(
          cellX,
          Number(y),
          cellWidth,
          height
        );
      }
      ctx.strokeStyle='rgba(205,238,244,0.34)';
      ctx.lineWidth=.75;
      ctx.strokeRect(
        cellX+.375,
        Number(y)+.375,
        Math.max(0,cellWidth-.75),
        Math.max(0,height-.75)
      );
    }
    ctx.restore();

    return height+
      WorldGaugeBarPresentationService.gap;
  },

  drawHoldGauge(
    ctx,
    target,
    progress,
    now
  ){
    const isFormationCircle=
      Number.isFinite(Number(target?.r))&&
      !Number.isFinite(Number(target?.radius));
    const gaugeRadius=
      isFormationCircle
        ?Math.max(
          1,
          Number(target.r)||1
        )+
          EntityRingLayoutService.BODY_GAP
        :EntityRingLayoutService
          .chargeRadius(target);
    const flashRadius=
      isFormationCircle
        ?EntityRingLayoutService.nextRadius(
          gaugeRadius,
          EntityRingLayoutService.WIDTHS.gauge,
          EntityRingLayoutService.WIDTHS.flash
        )
        :EntityRingLayoutService
          .maxChargeFlashRadius(
            target,
            now
          );

    return ArcGaugePresentationService.render(
      ctx,
      target,
      Math.max(
        0,
        Math.min(1,Number(progress)||0)
      ),
      {
        color:'#92cbd6',
        lineWidth:
          EntityRingLayoutService.WIDTHS.gauge,
        lineCap:'butt',
        radius:gaugeRadius,
        showEmpty:true,
        visibility:
          isFormationCircle
            ?'all'
            :'owner',
        maxChargeFlash:progress>=1,
        completePulseColor:'#92cbd6',
        completePulseRadius:flashRadius,
        completePulseLineWidth:
          EntityRingLayoutService.WIDTHS.flash
      }
    );
  },

  drawCounterPreview(ctx,entity,now){
    const windup=entity?.counterWindup;
    const counterAttackId=
      String(
        entity?.character?.abilities?.counter
          ?.attackId||
        ''
      );
    if(
      !this.isLocalEntity(entity)||
      !windup||
      !counterAttackId||
      String(windup.attack?.id||'')!==
        counterAttackId
    )return false;

    const pointer=this.pointerFor(entity);
    const circles=
      this.defaultCounterFormation(
        entity,
        pointer
      );
    return this.drawSet(
      ctx,
      entity,
      circles,
      .48,
      {hideRoleIcons:false}
    );
  },

  draw(
    ctx,
    runtime,
    now=performance.now()
  ){
    if(!ctx||!runtime)return false;
    let drawn=false;

    for(const entity of EntityService.items.values()){
      if(
        !entity?.alive||
        entity.hidden||
        !this.config(entity)
      )continue;

      const state=this.state(entity);
      if(!state)continue;

      if(this.isLocalEntity(entity)){
        const input=state.circleInput;
        const revealActive=
          state.activation?.phase==='reveal';
        const revealMs=Math.max(
          1,
          Number(
            this.config(entity)
              ?.activation?.revealMs
          )||1
        );
        const revealProgress=
          revealActive
            ?Math.max(
              0,
              Math.min(
                1,
                (
                  1-
                  (
                    Math.max(
                      0,
                      state.revealUntil-now
                    )/
                    revealMs
                  )
                )*2
              )
            )
            :1;
        const creatingPreview=
          input?.mode==='create'&&
          !!input.preview;
        const alpha=
          revealActive
            ?1
            :.48;

        if(
          state.circles.length&&
          !creatingPreview
        ){
          drawn=
            this.drawSet(
              ctx,
              entity,
              state.circles,
              alpha,
              {
                hideRoleIcons:revealActive,
                revealProgress,
                teamOutline:revealActive
              }
            )||drawn;
        }

        if(
          creatingPreview
        ){
          const preview={
            id:'formation-preview',
            x:input.preview.x,
            y:input.preview.y,
            r:input.preview.r,
            order:Number.MAX_SAFE_INTEGER
          };
          const previewSet=[
            ...this.cloneCircles(
              state.circles,
              'preview-base'
            ),
            preview
          ];
          const previewGraph=
            this.graph(
              entity,
              previewSet
            );
          const previewInvalidIds=
            new Set();

          if(input.limitBlocked){
            previewInvalidIds.add(
              String(preview.id)
            );
          }

          for(const relation of previewGraph.rels){
            if(
              relation.type!=='invalidContain'
            )continue;

            if(
              String(relation.a.id)===
                String(preview.id)||
              String(relation.b.id)===
                String(preview.id)
            ){
              previewInvalidIds.add(
                String(preview.id)
              );
            }
          }

          drawn=
            this.drawSet(
              ctx,
              entity,
              previewSet,
              .48,
              {
                extraInvalidIds:
                  previewInvalidIds
              }
            )||drawn;
        }

        if(
          state.limitPreview&&
          now<state.limitPreview.endAt
        ){
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            state.limitPreview.x,
            state.limitPreview.y,
            state.limitPreview.r,
            0,
            Math.PI*2
          );
          ctx.strokeStyle='rgba(255,72,82,.98)';
          ctx.fillStyle='rgba(230,55,65,.22)';
          ctx.lineWidth=4;
          ctx.setLineDash([8,5]);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        if(
          input?.mode==='pending'&&
          input.circle
        ){
          const config=this.circleConfig(entity);
          const progress=
            Math.max(
              0,
              Math.min(
                1,
                (
                  now-input.startAt
                )/
                Math.max(
                  1,
                  Number(config.moveHoldMs)||150
                )
              )
            );
          this.drawHoldGauge(
            ctx,
            entity,
            progress,
            now
          );
          this.drawHoldGauge(
            ctx,
            input.circle,
            progress,
            now
          );
        }

        const cast=state.activation;
        if(cast?.phase==='input'){
          const progress=
            Math.max(
              0,
              Math.min(
                1,
                (
                  now-cast.startedAt
                )/
                Math.max(
                  1,
                  cast.inputUntil-cast.startedAt
                )
              )
            );
          this.drawHoldGauge(
            ctx,
            entity,
            progress,
            now
          );
          for(const circle of state.circles){
            if(
              cast.selectedIds.has(
                String(circle.id)
              )
            ){
              this.drawHoldGauge(
                ctx,
                circle,
                progress,
                now
              );
            }
          }
        }else if(cast?.phase==='move'){
          this.drawHoldGauge(
            ctx,
            entity,
            1,
            now
          );
          for(const circle of state.circles){
            if(
              cast.selectedIds.has(
                String(circle.id)
              )
            ){
              this.drawHoldGauge(
                ctx,
                circle,
                1,
                now
              );
            }
          }
        }

        this.drawCounterPreview(
          ctx,
          entity,
          now
        );
      }else if(state.remoteCircles.length){
        const localEntity=Training.player;
        const allied=
          !!localEntity&&
          RelationService.relation(
            localEntity,
            entity
          )==='ally';
        const revealing=
          state.remoteRevealUntil>now;

        if(allied||revealing){
          const revealMs=Math.max(
            1,
            Number(
              this.config(entity)
                ?.activation?.revealMs
            )||1
          );
          const revealProgress=
            revealing
              ?Math.max(
                0,
                Math.min(
                  1,
                  (
                    1-
                    (
                      Math.max(
                        0,
                        state.remoteRevealUntil-now
                      )/
                      revealMs
                    )
                  )*2
                )
              )
              :1;

          drawn=
            this.drawSet(
              ctx,
              entity,
              state.remoteCircles,
              revealing?1:.48,
              {
                hideRoleIcons:true,
                revealProgress,
                teamOutline:revealing
              }
            )||drawn;
        }
      }

      if(
        state.burst&&
        now<state.burst.endAt
      ){
        const alpha=
          Math.max(
            0,
            (
              state.burst.endAt-now
            )/
            Math.max(
              1,
              state.burst.duration
            )
          );
        drawn=
          this.drawSet(
            ctx,
            entity,
            state.burst.circles,
            alpha,
            {
              manifest:true,
              hideRoleIcons:true,
              amplifierSegments:
                state.burst.amplifierSegments,
              manifestProgress:
                Math.max(
                  0,
                  Math.min(
                    1,
                    (
                      now-
                      Number(state.burst.startedAt)
                    )/
                    Math.max(
                      1,
                      Number(state.burst.duration)||1
                    )
                  )
                )
            }
          )||drawn;
      }
    }

    return drawn;
  }
});