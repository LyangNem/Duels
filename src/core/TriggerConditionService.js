

const TriggerConditionService=Object.freeze({
  resourceState(source,resource,context={}){
    if(!source)return null;
    const key=String(resource||'');
    const maxKey=
      key==='health'
        ?'maxHealth'
        :key==='stamina'
          ?'maxStamina'
          :'';
    if(!maxKey)return null;

    const snapshot=
      context.resourceConditionSnapshot?.[key]||
      null;
    const current=
      snapshot&&
      Number.isFinite(Number(snapshot.value))
        ?Number(snapshot.value)
        :Number(source[key]);
    const maximum=
      snapshot&&
      Number.isFinite(Number(snapshot.max))
        ?Math.max(0,Number(snapshot.max))
        :Math.max(0,Number(source[maxKey])||0);

    return {
      current:Math.max(0,Number(current)||0),
      maximum
    };
  },
  matches(condition,context={}){
    if(!condition)return true;
    const source=context.source||context.entity||null;
    const now=Number(context.now)||performance.now();

    if(condition.type==='input.slot'){
      return context.inputSlot===condition.slot;
    }
    if(condition.type==='entity.alive'){
      return source?.alive===true;
    }
    if(condition.type==='entity.dead'){
      return !!source&&source.alive!==true;
    }
    if(condition.type==='health.ratio-lte'){
      if(!source||!(source.maxHealth>0))return false;
      return source.health/source.maxHealth<=Number(condition.value);
    }
    if(condition.type==='health.ratio-gte'){
      if(!source||!(source.maxHealth>0))return false;
      return source.health/source.maxHealth>=Number(condition.value);
    }
    if(condition.type==='health.ratio-lt'){
      if(!source||!(source.maxHealth>0))return false;
      return source.health/source.maxHealth<Number(condition.value);
    }
    if(condition.type==='health.ratio-gt'){
      if(!source||!(source.maxHealth>0))return false;
      return source.health/source.maxHealth>Number(condition.value);
    }
    if(condition.type==='combat.can-act'){
      return !!source&&CombatStatsService.current(source,now).canAct===true;
    }
    if(condition.type==='combat.can-dodge'){
      return !!source&&CombatStatsService.current(source,now).canUseDodge===true;
    }
    if(condition.type==='combat.dodging'){
      return !!source&&Math.max(0,Number(source.dodgeUntil)||0)>now;
    }
    if(condition.type==='combat.not-dodging'){
      return !!source&&Math.max(0,Number(source.dodgeUntil)||0)<=now;
    }
    if(condition.type==='movement.inactive'){
      return !!source&&!MovementAbilityService.active(source);
    }
    if(condition.type==='combat.dodge-ready'){
      return AugmentDodgeSequenceService.ready(source,now);
    }
    if(condition.type==='channel.action-unlocked'){
      return !!source&&!ChannelAttackService.locksAction(
        source,
        String(condition.action||'')
      );
    }
    if(condition.type==='ability.pending-ready'){
      return !!source&&!!context.ability&&
        (source.abilityPending.get(context.ability.id)||0)<=now;
    }
    if(condition.type==='source.property.falsy'){
      return !source?.[condition.property];
    }
    if(condition.type==='source.property.truthy'){
      return !!source?.[condition.property];
    }
    if(condition.type==='source.property.lte'){
      return !!source&&Number(source?.[condition.property])<=Number(condition.value);
    }
    if(condition.type==='source.property.gte'){
      return !!source&&Number(source?.[condition.property])>=Number(condition.value);
    }
    if(condition.type==='source.property.equals'){
      return !!source&&source?.[condition.property]===condition.value;
    }
    if(condition.type==='counter.ready'){
      return CounterStockService.ready(source,now);
    }
    if(condition.type==='cooldowns.ready'){
      return !!source&&(condition.attackIds||[]).every(
        attackId=>(source.cooldowns.get(attackId)||0)<=now
      );
    }
    if(condition.type==='time.ready'){
      const at=condition.sourceProperty
        ?source?.[condition.sourceProperty]
        :(condition.at ?? context.readyAt);
      return now>=Math.max(0,Number(at)||0);
    }
    if(condition.type==='impact.direct'){
      return !CCService.isDotImpact(context.impact);
    }
    if(condition.type==='attack.tag'){
      return !!context.attack&&TagService.hasAttack(context.attack,condition.tag);
    }
    if(condition.type==='attack.tag-absent'){
      return !context.attack||!TagService.hasAttack(context.attack,condition.tag);
    }
    if(condition.type==='attack.not-charge'){
      return !context.attack?.charge;
    }
    if(condition.type==='attack.charge-progress-gte'){
      return (
        !!context.attack&&
        Number(context.attack.resolvedChargeProgress)>=Number(condition.value)
      );
    }
    if(condition.type==='attack.charge-progress-lt'){
      return (
        !!context.attack&&
        Number(context.attack.resolvedChargeProgress)<Number(condition.value)
      );
    }
    if(condition.type==='ability-use.tag'){
      return (
        context.usageTags instanceof Set&&
        context.usageTags.has(
          String(condition.tag||'')
        )
      );
    }
    if(condition.type==='context.truthy'){
      return !!context[condition.key];
    }
    if(condition.type==='context.falsy'){
      return !context[condition.key];
    }
    if(condition.type==='context.exists'){
      return context[condition.key]!==null&&context[condition.key]!==undefined;
    }
    if(condition.type==='target.kind-not-in'){
      return !!context.target&&Array.isArray(condition.kinds)&&
        !condition.kinds.includes(String(context.target.kind||''));
    }
    if(condition.type==='target.wall'){
      const point=context.targetPoint;
      if(!point)return false;

      const target=WorldGeometryService.nearestWallTarget(
        point.x,
        point.y,
        Math.max(
          0,
          Number(condition.snapDistance)||
          Number(condition.padding)||
          0
        )
      );
      if(!target)return false;

      if(Number(condition.snapDistance)>0){
        point.x=target.point.x;
        point.y=target.point.y;
        context.targetWall=target.wall;
      }
      return true;
    }
    if(condition.type==='cooking.own-stove')return CookingService.isOwnStove(source,context.target);
    if(condition.type==='target.status-active'){
      const target=context.target||null;
      if(!target)return false;
      const status=String(condition.status||'');
      // Confirmed hit context carries the victim authority's status snapshot.
      if(Array.isArray(context.targetStatusTypes)){
        return context.targetStatusTypes.includes(status);
      }
      if(CCService.has(target,status,now))return true;
      return AttackExecutionService.hasEffect(
        context.execution,
        `status-applied:${status}:${target.id}`
      );
    }
    if(condition.type==='target.status-active-before-hit'){
      const target=context.target||null;
      if(!target)return false;
      const status=String(condition.status||'');
      return context.beforeHitStatuses instanceof Map&&
        context.beforeHitStatuses.get(status)===true;
    }
    if(condition.type==='target.status-absent'){
      const target=context.target||null;
      if(!target)return false;
      return !CCService.has(target,String(condition.status||''),now);
    }
    if(condition.type==='source.status-active'){
      if(!source)return false;
      return CCService.has(source,String(condition.status||''),now);
    }
    if(condition.type==='source.status-absent'){
      if(!source)return false;
      return !CCService.has(source,String(condition.status||''),now);
    }

    if(condition.type==='projectile.stationary-clickable'){
      if(!source)return false;
      const point=
        context.targetPoint||
        (
          source===Training.player&&
          EntitySimulationAuthorityService.isLocal(source)
            ?Training.mouseWorld()
            :(
              source?._remoteAimTargetPoint||
              null
            )
        );
      const found=
        StationaryProjectileInteractionService.clickTarget(
          source,
          String(condition.groupKey||''),
          point,
          Math.max(1,Number(condition.selectionRadius)||1)
        );
      return condition.negate===true?!found:found;
    }
    if(condition.type==='field.exists'){
      if(!source)return false;
      const stateKey=String(condition.stateKey||'');
      const found=!!InstalledAreaFieldService.findState(
        source,
        stateKey,
        state=>
          state?.phase!=='afterlife'&&
          state?.rewardOnly!==true&&
          now<Number(state?.endsAt||Infinity)&&
          (condition.activeOnly!==true||!Number.isFinite(Number(state.module?.activeDuration))||now<Number(state.startedAt||0)+Math.max(0,Number(state.module.activeDuration)||0))
      );
      return condition.negate===true?!found:found;
    }
    if(condition.type==='field.armed'){
      if(!source)return false;
      const stateKey=String(condition.stateKey||'');
      const found=!!InstalledAreaFieldService.findState(
        source,
        stateKey,
        state=>
          state?.phase!=='afterlife'&&
          state?.rewardOnly!==true&&
          now<Number(state?.endsAt||Infinity)&&
          now>=Number(state?.armedAt||state?.startedAt||0)
      );
      return condition.negate===true?!found:found;
    }
    if(condition.type==='field.contains-target'){
      if(!source||!context.target)return false;
      const found=InstalledAreaFieldService.containsTarget(
        source,
        String(condition.stateKey||''),
        context.target,
        now
      );
      return condition.negate===true?!found:found;
    }
    if(condition.type==='field.at-target'){
      const point=context.targetPoint;
      if(!source||!point)return false;
      const radius=Math.max(0,Number(condition.radius)||0);
      const stateKey=String(condition.stateKey||'');
      const phases=Array.isArray(condition.phases)
        ?condition.phases.map(String)
        :null;
      const found=!!InstalledAreaFieldService.findState(
        source,
        stateKey,
        state=>{
          if(
            phases
              ?!phases.includes(String(state?.phase||''))
              :state?.phase!=='point'
          )return false;
          if(condition.excludePending===true&&state.pendingTrigger)return false;
          return Math.hypot(
            (Number(state.pointX)||0)-(Number(point.x)||0),
            (Number(state.pointY)||0)-(Number(point.y)||0)
          )<=radius;
        }
      );
      return condition.negate===true?!found:found;
    }
    if(condition.type==='room.members-count'){
      const room=context.room;
      return !!room&&room.members?.size===Math.max(0,Number(condition.value)||0);
    }
    if(condition.type==='room.members-count-between'){
      const room=context.room;
      const count=room
        ?[...room.members.values()].filter(member=>
          !member?.spectator&&
          member?.departed!==true&&
          member?.connected!==false
        ).length
        :0;
      const min=Math.max(0,Number(condition.min)||0);
      const max=Math.max(min,Number(condition.max)||min);
      return count>=min&&count<=max;
    }
    if(condition.type==='room.all-ready'){
      const room=context.room;
      if(!room||!room.members?.size)return false;
      for(const member of room.members.values()){
        if(member?.ready!==true)return false;
      }
      return true;
    }
    if(condition.type==='room.teams-distinct'){
      const room=context.room;
      if(!room||!room.members?.size)return false;
      const participants=[...room.members.values()]
        .filter(member=>
          !member?.spectator&&
          member?.departed!==true&&
          member?.connected!==false
        );
      if(!participants.length)return false;
      const teams=new Set();
      for(const member of participants){
        if(!member?.team||teams.has(member.team))return false;
        teams.add(member.team);
      }
      return teams.size===participants.length;
    }
    if(condition.type==='room.match-format-valid'){
      const room=context.room;
      return !!(room&&MatchModeService.resolve(room.members));
    }
    if(condition.type==='room.non-host-ready'){
      const room=context.room;
      if(!room)return false;
      let participantCount=0;
      for(const member of room.members.values()){
        if(
          member?.host||
          member?.spectator||
          member?.departed===true||
          member?.connected===false
        )continue;
        participantCount++;
        if(member?.ready!==true)return false;
      }
      return participantCount>0;
    }
    if(condition.type==='summon.cluster-stage'){
      if(
        !source||
        typeof ClusterSummonService==='undefined'
      )return false;
      const minStage=Math.max(
        1,
        Math.floor(
          Number(
            condition.minStage??
            condition.stage
          )||1
        )
      );
      return ClusterSummonService.hasStage(
        source,
        String(condition.summonKey||''),
        minStage
      );
    }
    if(condition.type==='defeat.replacement-available'){
      const entity=context.entity||context.target||null;
      const available=!!(
        entity&&
        typeof ClusterSummonService!=='undefined'&&
        ClusterSummonService.replacementAvailable(entity)
      );
      return condition.negate===true?!available:available;
    }
    if(condition.type==='resource.gte'){
      if(!source)return false;
      return Math.max(0,Number(source[condition.resource])||0)>=Math.max(0,Number(condition.value)||0);
    }

    if(condition.type==='resource.full'){
      const state=this.resourceState(
        source,
        condition.resource,
        context
      );
      return !!state&&
        state.maximum>0&&
        state.current>=state.maximum-1e-6;
    }
    if(condition.type==='resource.not-full'){
      const state=this.resourceState(
        source,
        condition.resource,
        context
      );
      return !!state&&(
        state.maximum<=0||
        state.current<state.maximum-1e-6
      );
    }
    if(condition.type==='resource.is'){
      return String(context.resource||'')===String(condition.resource||'');
    }
    if(condition.type==='buff.active'){
      return !!source&&BuffService.resolve(
        source,
        String(condition.stat||''),
        now
      )!==0;
    }
    if(condition.type==='resource.can-spend-stamina'){
      return !!source&&StaminaService.canSpend(
        source,
        Math.max(0,Number(condition.value)||0),
        now
      );
    }
    if(condition.type==='resource.stamina-below-max'){
      if(!source)return false;
      ResourceValueService.normalizeStamina(source);
      return (
        Number(source.stamina)||0
      )<
      (
        Number(source.maxStamina)||0
      )-1e-6;
    }
    if(condition.type==='resource.stamina-above-zero'){
      if(!source)return false;
      ResourceValueService.normalizeStamina(source);
      return (Number(source.stamina)||0)>1e-6;
    }
    if(condition.type==='resource.stamina-capacity-at-least'){
      if(!source)return false;
      ResourceValueService.normalizeStamina(source);

      let required=
        Math.max(
          0,
          Number(condition.value)||0
        );

      const statusMultiplier=
        condition.statusMultiplier&&
        typeof condition.statusMultiplier==='object'
          ?condition.statusMultiplier
          :null;
      if(
        statusMultiplier&&
        CCService.has(
          source,
          String(statusMultiplier.status||''),
          now
        )
      ){
        required*=
          Math.max(
            0,
            Number(statusMultiplier.multiplier)||1
          );
      }

      return (
        (Number(source.maxStamina)||0)-
        (Number(source.stamina)||0)
      )>=required-1e-6;
    }
    if(condition.type==='state.timed-elapsed-between'){
      const state=TimedActionStateService.state(
        source,
        String(condition.stateKey||''),
        now
      );
      if(!state)return false;
      if(
        condition.activeOnly===true&&
        Number(state.expiresAt)<=now
      )return false;
      const elapsed=Math.max(
        0,
        now-Number(state.startedAt||now)
      );
      const min=Math.max(0,Number(condition.min)||0);
      const max=Number.isFinite(Number(condition.max))
        ?Math.max(min,Number(condition.max))
        :Infinity;
      return elapsed>=min&&elapsed<=max;
    }
    if(condition.type==='state.timed-completed'){
      const state=TimedActionStateService.state(
        source,
        String(condition.stateKey||''),
        now
      );
      return !!state&&
        Number(state.completedAt)>0&&
        (
          Number(state.retainUntil)<=0||
          Number(state.retainUntil)>now
        );
    }
    if(condition.type==='state.timed-data-equals'){
      const state=TimedActionStateService.state(
        source,
        String(condition.stateKey||''),
        now
      );
      if(!state)return false;
      const key=String(condition.key||'');
      if(!key)return false;
      return state.data?.[key]===condition.value;
    }
    if(condition.type==='state.exists'){
      const value=source?.actionState?.get(condition.stateKey)||null;
      if(value?.kind==='timed-action-state'){
        const timed=TimedActionStateService.state(source,condition.stateKey,now);
        if(!timed)return false;
        if(condition.activeOnly===true)return Number(timed.expiresAt)>now;
      }
      return !!value;
    }
    if(condition.type==='state.absent'){
      const value=source?.actionState?.get(condition.stateKey)||null;
      if(value?.kind==='timed-action-state'){
        const timed=TimedActionStateService.state(source,condition.stateKey,now);
        if(!timed)return true;
        if(condition.activeOnly===true)return Number(timed.expiresAt)<=now;
      }
      return !value;
    }
    if(condition.type==='state.phase'){
      const value=source?.actionState?.get(condition.stateKey)||null;
      if(
        value?.kind==='timed-action-state'&&
        !TimedActionStateService.state(source,condition.stateKey,now)
      )return false;
      return !!value&&value.behavior?.returning?.phase===condition.phase;
    }
    if(condition.type==='projectile.exists'||condition.type==='projectile.absent'){
      const key=String(condition.stateKey||'');
      const exists=!!ProjectileStateService.get(source,key)||!!source?._remoteProjectileStateKeys?.get(key);
      return condition.type==='projectile.exists'?exists:!exists;
    }
    if(condition.type==='projectile.attack-id-is'){
      const projectile=ProjectileStateService.get(
        source,
        String(condition.stateKey||'')
      );
      return !!projectile&&
        String(projectile.attack?.id||'')===
        String(condition.attackId||'');
    }
    if(condition.type==='projectile.stationary-arrival'){
      const projectile=ProjectileStateService.get(
        source,
        String(condition.stateKey||'')
      );
      return !!projectile?.stationaryArrival;
    }
    if(condition.type==='projectile.progress-ratio-gte'){
      return RuntimeValueReferenceService.resolve(
        source,
        {
          type:'projectile-progress-ratio',
          stateKey:String(condition.stateKey||''),
          completeAt:1
        }
      )>=Math.max(0,Number(condition.value)||0);
    }
    if(condition.type==='state.progress-full'){
      return RuntimeValueReferenceService.resolve(
        source,
        {
          type:'progress',
          stateKey:String(condition.stateKey||''),
          mode:'ratio',
          initial:Number(condition.initial)||0
        }
      )>=1;
    }
    if(condition.type==='state.progress-ratio-gte'||condition.type==='state.progress-ratio-lt'){
      const ratio=RuntimeValueReferenceService.resolve(source,{type:'progress',stateKey:String(condition.stateKey||''),mode:'ratio',initial:Number(condition.initial)||0});
      const threshold=Math.max(0,Number(condition.value)||0);
      return condition.type==='state.progress-ratio-lt'?ratio<threshold:ratio>=threshold;
    }
    if(condition.type==='state.progress-empty'){
      return RuntimeValueReferenceService.resolve(
        source,
        {
          type:'progress',
          stateKey:String(condition.stateKey||''),
          initial:Math.max(0,Number(condition.initial)||0)
        }
      )<=0;
    }
    if(condition.type==='state.progress-gte'){
      const current=RuntimeValueReferenceService.resolve(
        source,
        {
          type:'progress',
          stateKey:String(condition.stateKey||''),
          initial:Math.max(0,Number(condition.initial)||0)
        }
      );
      const threshold=Math.max(0,Number(condition.value)||0);
      return condition.strict===true?current>threshold:current>=threshold;
    }
    if(condition.type==='state.progress-sum-gte'){
      const current=RuntimeValueReferenceService.resolve(
        source,
        {
          type:'progress-sum',
          stateKeys:Array.isArray(condition.stateKeys)?condition.stateKeys:[]
        }
      )+Math.max(0,Number(condition.initial)||0);
      const threshold=Math.max(0,Number(condition.value)||0);
      return condition.strict===true?current>threshold:current>=threshold;
    }
    if(condition.type==='state.progress-lt'){
      const current=RuntimeValueReferenceService.resolve(
        source,
        {
          type:'progress',
          stateKey:String(condition.stateKey||''),
          initial:Math.max(0,Number(condition.initial)||0)
        }
      );
      return current<Math.max(0,Number(condition.value)||0);
    }
    if(condition.type==='state.mode-is'){
      let value=ModeStateService.current(source,String(condition.stateKey||''),String(condition.initial||''));
      if(Number(condition.expiresAfterMs)>0){
        const at=ModeStateService.state(source,String(condition.ageStateKey||condition.stateKey||''))?.changedAt;
        if(at===undefined||Number(context.now??performance.now())-at>=Number(condition.expiresAfterMs))value=String(condition.expiredValue||condition.initial||'');
      }
      return (value===String(condition.value||''))!==(condition.invert===true);
    }
    if(condition.type==='aim.cardinal-is'){
      return CardinalDirectionService.resolve(
        Number(context.angle)||0
      )===String(condition.direction||'');
    }
    if(condition.type==='attack.proximity-near'){
      if(!source)return false;
      const near=AbilityService.attackById(
        source.character,
        String(condition.nearAttackId||'')
      );
      const far=AbilityService.attackById(
        source.character,
        String(condition.farAttackId||'')
      );
      if(!near||!far)return false;
      return SummonDeployService.proximityAttack(
        source,
        near,
        far,
        Number(context.angle)||0
      )===near;
    }
    if(condition.type==='summon.available'){
      const state=
        SummonDeployService.state(
          source,
          String(condition.stateKey||''),
          false
        );
      return !state||
        Number(state.destroyedUntil)<=performance.now();
    }
    if(condition.type==='summon.active'){
      const state=
        SummonDeployService.state(
          source,
          String(condition.stateKey||''),
          false
        );
      return state?.active===true;
    }
    if(condition.type==='summon.inactive'){
      const state=
        SummonDeployService.state(
          source,
          String(condition.stateKey||''),
          false
        );
      return state?.active!==true;
    }
    return undefined;
  }
});
