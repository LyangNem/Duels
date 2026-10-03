



const RecipientAssignmentPresentationService=Object.freeze({
  assignments(target){
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

    const assignments=this.assignments(target);
    if(!assignments.length)return false;

    for(
      let index=0;
      index<assignments.length;
      index++
    ){
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