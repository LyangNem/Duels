

const CombatEventToastService=Object.freeze({
  duration:8000,
  maxEntries:3,
  shownKills:new Set(),
  reset(){
    this.shownKills.clear();
    document
      .getElementById('kill-log')
      ?.replaceChildren();
  },
  colorForPid(pid,fallback='#87939d'){
    const member=
      RoomService.members.get(
        String(pid||'')
      );
    return (
      RoomTeams[member?.team]?.color||
      fallback
    );
  },
  push({
    text,
    fromColor='#87939d',
    toColor='#87939d',
    key=null
  }={}){
    const root=
      document.getElementById(
        'kill-log'
      );
    if(!root||!text)return false;

    const line=
      document.createElement('div');
    line.className=
      'combat-event-toast';
    if(key)line.dataset.eventKey=key;

    line.style.setProperty(
      '--toast-from',
      fromColor
    );
    line.style.setProperty(
      '--toast-to',
      toColor
    );

    const label=
      document.createElement('span');
    label.className=
      'combat-event-toast-text';
    label.textContent=String(text);
    line.appendChild(label);
    root.appendChild(line);

    while(
      root.children.length>
        this.maxEntries
    ){
      root.firstElementChild?.remove();
    }

    requestAnimationFrame(()=>{
      line.classList.add('show');
    });

    setTimeout(()=>{
      line.classList.remove('show');
      setTimeout(
        ()=>line.remove(),
        200
      );
    },this.duration);

    return true;
  },
  kill(payload){
    if(
      !KillRewardService.isValidKill(
        payload
      )
    )return false;

    const key=
      KillRewardService.key(
        payload.roundToken,
        payload.deadPid
      );

    if(this.shownKills.has(key)){
      return false;
    }
    this.shownKills.add(key);

    const killerPid=
      String(payload.sourcePid);
    const victimPid=
      String(payload.deadPid);

    return this.push({
      key:`kill:${key}`,
      text:
        `${PlayerDisplayNameService.resolve(killerPid)} → ${PlayerDisplayNameService.resolve(victimPid)}`,
      fromColor:
        this.colorForPid(killerPid),
      toColor:
        this.colorForPid(victimPid)
    });
  },
  teamChange(
    pid,
    fromTeam,
    toTeam
  ){
    const member=
      RoomService.members.get(
        String(pid||'')
      );
    const playerName=
      PlayerDisplayNameService.resolve(
        pid,
        member?.profile
      );
    const fromColor=
      RoomTeams[fromTeam]?.color||
      '#87939d';
    const toColor=
      RoomTeams[toTeam]?.color||
      '#87939d';

    return this.push({
      key:`team:${pid}:${Date.now()}`,
      text:'호스트가 팀을 변경시켰습니다.',
      fromColor,
      toColor
    });
  },
  departure(pid,name=null){
    const actualPid=String(pid||'');
    const playerName=
      String(
        name||
        PlayerDisplayNameService.resolve(
          actualPid
        )
      );

    return this.push({
      key:`leave:${actualPid}:${Date.now()}`,
      text:`${playerName}님이 게임을 나갔습니다.`,
      fromColor:
        this.colorForPid(actualPid),
      toColor:'#87939d'
    });
  }
});