

const RoomMatchLifecycleService=Object.freeze({
  activePhases:new Set([
    'select',
    'start-augment',
    'start-countdown',
    'playing',
    'round-result',
    'between',
    'between-countdown',
    'match-result'
  ]),
  matchActive(room=RoomService){
    return this.activePhases.has(room.duelPhase);
  },
  connectedGamePlayerPids(room=RoomService){
    return [
      ...room.members.values()
    ]
      .filter(member=>
        member&&
        member.connected!==false&&
        member.departed!==true&&
        member.spectator!==true
      )
      .map(member=>member.pid)
      .sort((a,b)=>
        String(a).localeCompare(String(b))
      );
  },
  markDeparted(room,pid){
    const member=room.members.get(pid);
    if(!member)return false;

    member.connected=false;
    member.departed=true;
    member.ready=false;
    member.spectating=false;
    room.departedMatchPids.add(pid);
    room.activeMatchPids.delete(pid);
    OnlineChatService.clearTyping(pid);

    if(member.identityKey){
      room.blockedRejoinKeys.add(
        member.identityKey
      );
    }
    return true;
  },
  removePeerEntity(pid){
    OnlineDuelService.removePeer(
      pid
    );
    return true;
  },
  activeSurvivorPids(room=RoomService){
    const result=[];

    for(const pid of room.activeMatchPids){
      const member=room.members.get(pid);
      if(
        !member||
        member.connected===false||
        member.departed===true||
        member.spectator===true||
        member.spectating===true
      )continue;

      if(
        typeof OnlineDuelService!=='undefined'&&
        OnlineDuelService.active&&
        !OnlineDuelService.isRoundParticipantAlive(pid)
      )continue;

      result.push(pid);
    }

    return result.sort(
      (a,b)=>
        String(a).localeCompare(String(b))
    );
  },
  reevaluateRemainingPlayers(
    room=RoomService,
    reason='플레이어 이탈로 매치가 종료되었습니다.'
  ){
    if(
      !room?.isHost||
      !this.matchActive(room)
    )return false;

    const survivors=
      this.activeSurvivorPids(room);

    if(survivors.length>1){
      if(
        room.duelPhase==='playing'&&
        OnlineDuelService.active
      ){
        OnlineDuelService.evaluateRoundSurvivors(
          room.roundToken
        );
      }
      return false;
    }

    if(survivors.length===1){
      room.abortMatchToRoom(reason);
      return true;
    }

    if(
      room.duelPhase==='playing'&&
      OnlineDuelService.active
    ){
      OnlineDuelService.evaluateRoundSurvivors(
        room.roundToken
      );
    }
    return false;
  },
  abortIfInsufficient(room,reason='플레이어 이탈로 매치가 종료되었습니다.'){
    const connected=
      this.connectedGamePlayerPids(room);

    if(connected.length>1)return false;

    if(room.isHost){
      room.abortMatchToRoom(reason);
    }else{
      room.abortLocalMatchToRoom(reason);
    }
    return true;
  },
  teamHasConnectedPlayer(
    room,
    teamId
  ){
    if(!teamId)return false;

    for(const member of room.members.values()){
      if(
        member?.team===teamId&&
        member.connected!==false&&
        member.departed!==true&&
        member.spectator!==true
      ){
        return true;
      }
    }

    return false;
  },
  teamMatchShouldAbortAfterDeparture(
    room,
    departedTeam
  ){
    return (
      room.matchMode===
        MatchModeService.TEAM&&
      !this.teamHasConnectedPlayer(
        room,
        departedTeam
      )
    );
  },
  onHostMemberDisconnected(room,pid){
    const member=room.members.get(pid);
    if(!member)return false;

    const inMatch=
      room.activeMatchPids.has(pid)&&
      this.matchActive(room);

    if(inMatch){
      const departedTeam=
        member.team;

      this.markDeparted(room,pid);
      this.removePeerEntity(pid);

      if(
        this.teamMatchShouldAbortAfterDeparture(
          room,
          departedTeam
        )
      ){
        room.abortMatchToRoom(
          '한 팀의 플레이어가 모두 이탈해 매치가 종료되었습니다.'
        );
        return true;
      }

      const name=
        PlayerDisplayNameService.resolve(
          pid,
          member.profile
        );
      const leaveText=
        `${name}님이 게임을 나갔습니다.`;

      OnlineChatService.system(
        leaveText
      );
      CombatEventToastService.departure(
        pid,
        name
      );
      room.sendToPeers({
        type:'duel-member-left',
        pid,
        phase:room.duelPhase,
        name,
        chatText:leaveText
      });

      if(
        room.duelPhase==='playing'&&
        OnlineDuelService.active
      ){
        OnlineDuelService.eliminateDepartedPlayer(
          pid
        );

        if(
          this.reevaluateRemainingPlayers(
            room
          )
        ){
          return true;
        }
        return true;
      }

      if(
        this.reevaluateRemainingPlayers(
          room
        )
      ){
        return true;
      }

      if(
        room.duelPhase==='between'||
        room.duelPhase==='between-countdown'||
        room.duelPhase==='round-result'
      ){
        clearTimeout(
          room._betweenCountdownTimer
        );
        clearTimeout(
          room._roundResolveTimer
        );
        room._betweenCountdownTimer=0;
        room._roundResolveTimer=0;

        const winner=
          room._lastRoundWinnerPid;
        const losers=[
          ...(room._lastRoundLoserPids||[])
        ];

        room.duelPhase='round-result';

        if(winner){
          room.beginBetween(
            winner,
            losers
          );
        }else{
          this.applyNextRoundRoster(room);
        }
        return true;
      }

      if(
        room.duelPhase==='start-augment'||
        room.duelPhase==='start-countdown'||
        room.duelPhase==='select'
      ){
        this.applyNextRoundRoster(room);

        if(
          room.duelPhase==='start-countdown'
        ){
          clearTimeout(
            room._startCountdownTimer
          );
          room._startCountdownTimer=0;
          room.duelPhase='start-augment';
        }

        if(
          room.duelPhase==='select'&&
          room.characterReady.size===
            room.matchPids().length&&
          room.matchPids().length>=2
        ){
          room.beginStartAugments();
          return true;
        }

        if(
          room.duelPhase==='start-augment'&&
          room.startAugments.size===
            room.matchPids().length
        ){
          room.beginStartCountdown();
        }

        return true;
      }

      return true;
    }

    room.members.delete(pid);
    room.activeMatchPids.delete(pid);
    room.departedMatchPids.delete(pid);
    this.removePeerEntity(pid);
    room.broadcast();
    return true;
  },
  applyNextRoundRoster(room=RoomService){
    if(!room.departedMatchPids.size){
      return true;
    }

    for(const pid of room.departedMatchPids){
      room.activeMatchPids.delete(pid);
      room.characterReady.delete(pid);
      room.startAugmentChoices.delete(pid);
      room.startAugments.delete(pid);
      room.matchAugments.delete(pid);
      room.betweenReady.delete(pid);
      room.betweenSelections.delete(pid);
      room.duelSelections.delete(pid);

      const currentMember=
        room.members.get(pid);
      if(currentMember?.departed===true){
        room.members.delete(pid);
      }
    }

    room.departedMatchPids.clear();

    const participants=room.matchPids();
    const members=
      participants
        .map(pid=>room.members.get(pid))
        .filter(Boolean);

    if(participants.length<=1){
      room.abortMatchToRoom(
        '플레이어 이탈로 매치가 종료되었습니다.'
      );
      return false;
    }

    room.matchMode=
      MatchModeService.resolve(members);

    if(!room.matchMode){
      room.abortMatchToRoom(
        '남은 플레이어 구성으로 매치를 계속할 수 없습니다.'
      );
      return false;
    }

    const packet={
      type:'duel-roster-update',
      mode:room.matchMode,
      activeMatchPids:[...participants],
      members:participants.map(pid=>{
        const member=room.members.get(pid);
        return {
          ...member,
          profile:{...member.profile}
        };
      }),
      scores:room.scoreObject(),
      selections:room.selectionObject(),
      augments:room.augmentObject()
    };

    room.sendToPeers(packet);
    OnlineDuelService.applyRosterUpdate(
      packet
    );
    room.broadcast();
    return true;
  }
});