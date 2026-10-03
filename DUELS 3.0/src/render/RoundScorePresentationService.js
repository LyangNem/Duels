

const RoundScorePresentationService=Object.freeze({
  pids(scores=null){
    const active=RoomService.matchPids();
    if(active.length)return active;

    return Object.keys(scores||{})
      .sort((a,b)=>a.localeCompare(b));
  },
  pip(teamColor,filled){
    const pip=document.createElement('span');
    pip.className=
      `round-score-pip${filled?' filled':''}`;
    pip.style.setProperty(
      '--score-color',
      teamColor
    );
    return pip;
  },
  side(pid,scores,winsNeeded,{reverse=false}={}){
    const side=document.createElement('div');
    side.className=
      `round-score-side${reverse?' reverse':''}`;

    if(!pid){
      side.classList.add('empty');
      return side;
    }

    const member=RoomService.members.get(pid);
    const team=
      RoomTeams[member?.team]||
      RoomTeams.red;
    const score=
      Math.max(
        0,
        Number(scores?.[pid])||0
      );

    const name=document.createElement('span');
    name.className='round-score-name';
    name.textContent=
      PlayerDisplayNameService.resolve(
        pid,
        member?.profile
      );

    const pips=document.createElement('span');
    pips.className='round-score-pips';

    for(let index=0;index<winsNeeded;index++){
      pips.appendChild(
        this.pip(
          team.color,
          index<score
        )
      );
    }

    if(reverse){
      side.append(pips,name);
    }else{
      side.append(name,pips);
    }

    return side;
  },
  row(leftPid,rightPid,scores,winsNeeded){
    const row=document.createElement('div');
    row.className='round-score-row';

    row.append(
      this.side(
        leftPid,
        scores,
        winsNeeded
      )
    );

    const separator=document.createElement('span');
    separator.className='round-score-separator';
    separator.textContent=':';
    row.appendChild(separator);

    row.append(
      this.side(
        rightPid,
        scores,
        winsNeeded,
        {reverse:true}
      )
    );

    return row;
  },
  teamSide(
    teamId,
    pids,
    scores,
    winsNeeded,
    {reverse=false}={}
  ){
    const side=
      document.createElement('div');
    side.className=
      `round-score-side${reverse?' reverse':''}`;

    const team=
      RoomTeams[teamId]||
      {
        label:String(teamId),
        color:'#87939d'
      };
    const score=Math.max(
      0,
      ...pids.map(pid=>
        Number(scores?.[pid])||0
      )
    );

    const name=
      document.createElement('span');
    name.className='round-score-name';
    name.textContent=team.label;

    const pips=
      document.createElement('span');
    pips.className='round-score-pips';

    for(
      let index=0;
      index<winsNeeded;
      index++
    ){
      pips.appendChild(
        this.pip(
          team.color,
          index<score
        )
      );
    }

    if(reverse){
      side.append(pips,name);
    }else{
      side.append(name,pips);
    }

    return side;
  },
  teamRow(scores,winsNeeded){
    const groups=new Map();

    for(const pid of this.pids(scores)){
      const teamId=
        RoomService.members.get(pid)?.team;
      if(!teamId)continue;

      if(!groups.has(teamId)){
        groups.set(teamId,[]);
      }
      groups.get(teamId).push(pid);
    }

    const teamIds=[
      ...groups.keys()
    ].sort((a,b)=>
      String(a).localeCompare(String(b))
    );

    if(teamIds.length!==2)return null;

    const row=
      document.createElement('div');
    row.className='round-score-row';

    row.append(
      this.teamSide(
        teamIds[0],
        groups.get(teamIds[0]),
        scores,
        winsNeeded
      )
    );

    const separator=
      document.createElement('span');
    separator.className=
      'round-score-separator';
    separator.textContent=':';
    row.appendChild(separator);

    row.append(
      this.teamSide(
        teamIds[1],
        groups.get(teamIds[1]),
        scores,
        winsNeeded,
        {reverse:true}
      )
    );

    return row;
  },
  spectatorCount(){
    let count=0;
    for(const member of RoomService.members.values()){
      if(member?.spectating===true)count++;
    }
    return count;
  },
  render(container,scores,winsRequired,mode){
    if(!container)return false;

    const pids=this.pids(scores);
    const winsNeeded=
      Math.max(
        1,
        Math.min(
          8,
          Number(winsRequired)||1
        )
      );

    container.replaceChildren();

    if(
      mode===MatchModeService.TEAM
    ){
      const teamRow=
        this.teamRow(
          scores,
          winsNeeded
        );

      if(teamRow){
        container.appendChild(teamRow);
      }
    }else if(
      mode===MatchModeService.FFA||
      pids.length>2
    ){
      container.appendChild(
        this.row(
          pids[0]||null,
          pids[1]||null,
          scores,
          winsNeeded
        )
      );
      container.appendChild(
        this.row(
          pids[2]||null,
          pids[3]||null,
          scores,
          winsNeeded
        )
      );
    }else{
      container.appendChild(
        this.row(
          pids[0]||null,
          pids[1]||null,
          scores,
          winsNeeded
        )
      );
    }

    const spectatorCount=
      this.spectatorCount();

    if(spectatorCount>0){
      const badge=document.createElement('span');
      badge.className='round-score-spectators';
      badge.textContent=
        `${spectatorCount}명 관전 중`;
      container.appendChild(badge);
    }

    container.style.display='flex';
    return true;
  }
});