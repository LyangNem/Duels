

const MatchModeService=Object.freeze({
  DUEL:'duel',
  FFA:'ffa',
  TEAM:'team',
  participants(members){
    return [
      ...(members?.values?.()||members||[])
    ].filter(member=>
      member&&
      !member.spectator&&
      member.departed!==true&&
      member.connected!==false
    );
  },
  teamCounts(members){
    const counts=new Map();

    for(const member of this.participants(members)){
      if(!member?.team)continue;

      counts.set(
        member.team,
        (counts.get(member.team)||0)+1
      );
    }

    return counts;
  },
  isExactTwoVsTwo(members){
    const list=this.participants(members);
    if(list.length!==4)return false;

    const counts=this.teamCounts(list);

    return (
      counts.size===2&&
      [...counts.values()].every(
        count=>count===2
      )
    );
  },
  resolve(members){
    const list=this.participants(members);
    const count=list.length;

    if(count<2||count>4)return null;

    if(count===2){
      const first=list[0];
      const second=list[1];

      if(
        !first?.team||
        !second?.team||
        first.team===second.team
      ){
        return null;
      }

      return this.DUEL;
    }

    if(this.isExactTwoVsTwo(list)){
      return this.TEAM;
    }

    // 정확한 2+2가 아닌 3~4인은 FFA지만
    // 실제 적대 팀이 하나 이상 있어야 게임을 시작할 수 있다.
    const counts=this.teamCounts(list);
    if(counts.size<2)return null;

    return this.FFA;
  },
  isFfa(mode){
    return mode===this.FFA;
  },
  isTeam(mode){
    return mode===this.TEAM;
  },
});