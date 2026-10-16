



const RecipientAssignmentPresentationService=Object.freeze({
  assignments(target,includeConditional=false){
    if(!target)return [];

    const result=[];
    for(
      const summon of
      EntityService.items.values()
    ){
      if(
        summon?.kind!=='summon'||
        !summon.alive||
        summon.hidden||
        !summon.summonStateKey
      )continue;

      const presentation=
        summon.summonSpec
          ?.recipientPresentation;
      if(!presentation)continue;

      const owner=EntityService.owner(summon);
      const state=
        owner
          ?SummonDeployService.state(
            owner,
            summon.summonStateKey,
            false
          )
          :null;
      if(!state?.active)continue;

      const property=String(
        presentation.stateProperty||
        'recipientEntityId'
      );
      const recipient=
        EntityTargetReferenceService.resolve(
          state[property]
        );
      if(recipient!==target)continue;

      result.push({
        summon,
        owner,
        state,
        presentation
      });
    }

    if(includeConditional){
      const owner=Training.player;
      if(owner?.alive&&!owner.hidden&&EntitySimulationAuthorityService.isLocal(owner)){
        for(const config of owner.character?.conditionalTargetMarkers||EMPTY_RUNTIME_ITEMS){
          if(config.visibility!=='owner')continue;
          if(RelationService.relation(owner,target)!==String(config.relation||'enemy'))continue;
          if(Number.isFinite(config.range)&&Math.hypot(target.x-owner.x,target.y-owner.y)>Math.max(0,Number(config.range)||0))continue;
          if(!ProjectileHomingTargetVisibilityService.canPerceive(owner,target))continue;
          if(!(config.conditions||EMPTY_RUNTIME_ITEMS).every(condition=>TriggerConditionService.matches(condition,{source:owner,target})))continue;
          result.push({owner,presentation:config});
        }
      }
    }
    return result;
  },
  markerColor(assignment){
    const source=
      assignment?.owner||
      assignment?.summon||
      null;
    if(!source)return '#d7ded4';

    return TeamColorPresentationService
      .colorForEntity(
        source,
        source.color||'#d7ded4'
      );
  },
  drawWorldMarkers(
    ctx,
    target,
    bx,
    by,
    barWidth=52
  ){
    if(!ctx||!target)return false;

    const assignments=this.assignments(target,true);
    if(!assignments.length)return false;

    for(
      let index=0;
      index<assignments.length;
      index++
    ){
      const assignment=assignments[index];
      const marker=assignment.presentation?.marker;
      if(marker?.shape==='weapon-icon'&&WEAPON_IMAGE_DEFS[marker.style]){
        ctx.save();
        ctx.translate(Number(bx)+Number(barWidth)+8+index*16,Number(by)+2.5);
        ctx.fillStyle=this.markerColor(assignment);
        ctx.strokeStyle=ColorService.brighten(this.markerColor(assignment),.65);
        ctx.lineWidth=.8;
        for(const path of WEAPON_IMAGE_DEFS[marker.style].paths||EMPTY_RUNTIME_ITEMS){
          ModeGearPresentationService.path(ctx,path,5);
          if(path.fill)ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }
      EnvelopeIconPresentationService.draw(
        ctx,
        Number(bx)+Number(barWidth)+8+index*16,
        Number(by)+2.5,
        {
          width:12,
          height:8,
          color:this.markerColor(
            assignments[index]
          ),
          lineWidth:1.25
        }
      );
    }

    return true;
  },
  syncHud(root,target){
    if(!root)return false;

    const assignments=this.assignments(target);
    let container=
      root.querySelector(
        ':scope > .recipient-mail-markers'
      );

    if(!assignments.length){
      container?.remove();
      return false;
    }

    if(!container){
      container=document.createElement('div');
      container.className=
        'recipient-mail-markers';
      root.appendChild(container);
    }

    if(
      Number(container.dataset.count)!==
      assignments.length
    ){
      container.replaceChildren();
      for(const assignment of assignments){
        const marker=document.createElement('span');
        marker.className='recipient-mail-marker';
        marker.style.color=
          this.markerColor(assignment);
        container.appendChild(marker);
      }
      container.dataset.count=
        String(assignments.length);
    }

    return true;
  },

});