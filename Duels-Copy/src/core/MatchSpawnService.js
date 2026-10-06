

const MatchSpawnService=Object.freeze({
  shuffled(ids){
    const out=[...(ids||[])];
    for(let index=out.length-1;index>0;index--){
      const random=
        globalThis.crypto?.getRandomValues
          ?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]/4294967296
          :Math.random();
      const swap=Math.floor(random*(index+1));
      [out[index],out[swap]]=[out[swap],out[index]];
    }
    return out;
  },
  pointClear(x,y,clearance=28){
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();

    if(
      x-clearance<0||
      y-clearance<0||
      x+clearance>width||
      y+clearance>height
    )return false;

    const walls=
      typeof DebugMapService!=='undefined'
        ?DebugMapService.walls()
        :[];

    return !walls.some(wall=>
      x+clearance>=wall.x&&
      x-clearance<=wall.x+wall.w&&
      y+clearance>=wall.y&&
      y-clearance<=wall.y+wall.h
    );
  },
  polygon(ids,rotation,radius,width,height){
    const out={};
    const cx=width*.5;
    const cy=height*.5;

    ids.forEach((pid,index)=>{
      const angle=
        rotation+
        Math.PI*2*index/ids.length;
      out[pid]={
        x:cx+Math.cos(angle)*radius,
        y:cy+Math.sin(angle)*radius
      };
    });

    return out;
  },
  pointMap(
    pids,
    mode,
    teamByPid={}
  ){
    const ids=[...(pids||[])];
    if(!MatchModeService.isFfa(mode)){
      ids.sort(
        (a,b)=>String(a).localeCompare(String(b))
      );
    }
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();
    const out={};

    if(
      MatchModeService.isTeam(mode)&&
      ids.length===4
    ){
      const groups=new Map();

      for(const pid of ids){
        const team=
          teamByPid?.[pid]||
          RoomService.members.get(pid)?.team||
          pid;

        if(!groups.has(team)){
          groups.set(team,[]);
        }
        groups.get(team).push(pid);
      }

      const teamIds=[
        ...groups.keys()
      ].sort((a,b)=>
        String(a).localeCompare(String(b))
      );

      if(
        teamIds.length===2&&
        teamIds.every(team=>
          groups.get(team).length===2
        )
      ){
        const spawnX=[
          width*.16,
          width*.84
        ];
        const verticalGap=
          Math.min(
            90,
            height*.07
          );

        teamIds.forEach((team,index)=>{
          const members=[
            ...groups.get(team)
          ].sort((a,b)=>
            String(a).localeCompare(String(b))
          );
          const centerY=height*.5;

          out[members[0]]={
            x:spawnX[index],
            y:centerY-verticalGap
          };
          out[members[1]]={
            x:spawnX[index],
            y:centerY+verticalGap
          };
        });

        if(
          ids.every(pid=>
            this.pointClear(
              out[pid].x,
              out[pid].y
            )
          )
        ){
          return out;
        }
      }
    }

    if(
      ids.length===2&&
      !MatchModeService.isFfa(mode)&&
      !MatchModeService.isTeam(mode)
    ){
      out[ids[0]]={
        x:width*.20,
        y:height*.50
      };
      out[ids[1]]={
        x:width*.80,
        y:height*.50
      };
      return out;
    }

    const baseRadius=
      Math.min(width,height);
    const radiusRatios=[
      .33,
      .30,
      .36,
      .27,
      .39,
      .24,
      .42,
      .21
    ];
    const baseRotation=-Math.PI/2;

    // 모든 참가자의 반지름을 한꺼번에 바꾸고 전체 정다각형을 함께 회전한다.
    // 특정 플레이어만 벽을 피해 밀어내지 않으므로 대칭성과 공정한 간격이 유지된다.
    for(const ratio of radiusRatios){
      const radius=
        baseRadius*ratio;

      for(let step=0;step<72;step++){
        const rotation=
          baseRotation+
          Math.PI*2*step/72;
        const candidate=this.polygon(
          ids,
          rotation,
          radius,
          width,
          height
        );

        if(
          ids.every(pid=>
            this.pointClear(
              candidate[pid].x,
              candidate[pid].y
            )
          )
        ){
          return candidate;
        }
      }
    }

    // 비정상적으로 모든 후보가 막힌 맵에서도 정다각형 자체는 깨지지 않는다.
    return this.polygon(
      ids,
      baseRotation,
      baseRadius*.21,
      width,
      height
    );
  }
});