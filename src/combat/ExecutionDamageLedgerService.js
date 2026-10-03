

/* 대상 권위의 실행별 실제 피해 기록. 명시적으로 중복 피해를 금지한 후속 field만 조회한다. */
const ExecutionDamageLedgerService=Object.freeze({
  sourceKey(source){
    if(!source)return 'source:unknown';
    const owner=EntityService.owner(source)||source;
    const pid=OnlineParticipantEntityService.pid(owner);
    return pid
      ?`pid:${pid}:${String(source.character?.id||source.kind||'entity')}`
      :`entity:${String(source.id||'unknown')}`;
  },
  key(source,execution){
    const sequence=Math.max(0,Math.floor(Number(execution?.sequence)||0));
    return sequence>0?`${this.sourceKey(source)}:${sequence}`:'';
  },
  record(source,target,execution,amount,now=performance.now()){
    const value=Math.max(0,Number(amount)||0);
    const key=this.key(source,execution);
    if(!target||!key||value<=0)return false;
    const ledger=target._executionDamageLedger||(target._executionDamageLedger=new Map());
    ledger.set(key,{amount:value,at:now});
    while(ledger.size>64)ledger.delete(ledger.keys().next().value);
    return true;
  },
  hasDamage(source,target,execution,now=performance.now()){
    const key=this.key(source,execution);
    if(!key||!(target?._executionDamageLedger instanceof Map))return false;
    const entry=target._executionDamageLedger.get(key)||null;
    if(!entry)return false;
    if(now-(Number(entry.at)||0)>3000){
      target._executionDamageLedger.delete(key);
      return false;
    }
    return Math.max(0,Number(entry.amount)||0)>0;
  }
});