/* 공통 방향 전환/벽 전달 사건의 패킷 직렬화와 순서 보정. */
const ProjectileRedirectSyncService=Object.freeze({
 broadcast(p){
  if(Training.sessionMode!=='online'||!OnlineDuelService.active)return;
  RoomService.sendGameplay({type:'duel-projectile-redirect',roundToken:OnlineDuelService.roundToken,
   projectileOwnerPid:OnlineParticipantEntityService.pid(p.source),projectileKey:p.networkKey,
   revision:p.redirectRevision,x:p.x,y:p.y,angle:p.angle,vx:p.vx,vy:p.vy,travel:p.travel,
   redirectCount:p.redirectCount||0,ended:p.redirectEnded===true,hitIds:Array.from(p.hitIds||[]),
   maxTravelDistance:p.maxTravelDistance,rangeBounceBase:p.rangeBounceBase,rangeBounceCount:p.rangeBounceCount||0,
   wallRedirectCount:p.wallRedirectCount||0,hitRedirectCount:p.hitRedirectCount||0,fadeResetTravel:p.fadeResetTravel||0});
 },
 receive(owner,snapshot){
  if(!owner||!snapshot.projectileKey)return false;
  for(const key of ['x','y','angle','vx','vy','travel','revision','redirectCount'])if(!Number.isFinite(Number(snapshot[key])))return false;
  if(!(Number(snapshot.revision)>0))return false;
  const pending=owner._redirectSnapshots||(owner._redirectSnapshots=new Map());
  const previous=pending.get(snapshot.projectileKey);
  if(previous&&Number(previous.revision)>=Number(snapshot.revision))return false;
  pending.set(snapshot.projectileKey,{...snapshot,receivedAt:performance.now()});
  for(const [key,value] of pending)if(performance.now()-value.receivedAt>1500)pending.delete(key);
  while(pending.size>64)pending.delete(pending.keys().next().value);
  const projectile=ProjectileService.findByNetworkKey(owner,String(snapshot.projectileKey));
  return projectile?ProjectileRedirectService.apply(projectile,snapshot):true;
 },
 restore(p){
  const snapshot=p.source?._redirectSnapshots?.get(p.networkKey);
  if(snapshot&&performance.now()-snapshot.receivedAt<=1500)ProjectileRedirectService.apply(p,snapshot);
 },
 relay(event){
  if(Training.sessionMode!=='online'||!OnlineDuelService.active)return;
  RoomService.sendGameplay({type:'duel-projectile-relay',roundToken:OnlineDuelService.roundToken,ownerPid:OnlineParticipantEntityService.pid(event.source),attackId:event.attackId,point:event.point,angle:event.angle,key:event.key,executionSequence:event.executionSequence});
 }
});
