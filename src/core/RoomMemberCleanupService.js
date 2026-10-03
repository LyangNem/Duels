

const RoomMemberCleanupService=Object.freeze({
  connectedMembers(room=RoomService){
    return [
      ...room.members.values()
    ]
      .filter(member=>
        member&&
        member.connected!==false&&
        member.departed!==true
      )
      .sort((a,b)=>
        (Number(a.joinOrder)||0)-
          (Number(b.joinOrder)||0)||
        String(a.pid).localeCompare(String(b.pid))
      );
  },
  pruneDeparted(room=RoomService){
    const connected=this.connectedMembers(room);

    room.members=new Map(
      connected.map(member=>[
        member.pid,
        member
      ])
    );

    for(const pid of [
      ...room.activeMatchPids
    ]){
      if(!room.members.has(pid)){
        room.activeMatchPids.delete(pid);
      }
    }

    for(const pid of [
      ...room.departedMatchPids
    ]){
      if(!room.members.has(pid)){
        room.departedMatchPids.delete(pid);
      }
    }

    return connected;
  }
});