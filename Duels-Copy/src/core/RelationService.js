

const RelationService=Object.freeze({
  relation(a,b){
    if(!a||!b)return 'neutral';
    if(a===b||a.id===b.id)return 'self';
    if(a.teamId!=null&&b.teamId!=null&&a.teamId===b.teamId)return 'ally';
    return 'enemy';
  },
  canTarget(source,target,policy={},attack=null){
    const ignoreEvasionInvulnerable=
      policy.ignoreEvasionInvulnerable===true;

    if(
      !source||
      !target||
      !target.alive||
      target.hidden||
      ActionStateCombatPolicyService.blocksTargeting(
        target,
        {ignoreEvasionInvulnerable}
      )
    )return false;
    const relation=this.relation(source,target);
    if(relation==='self')return policy.allowSelf===true;
    if(relation==='ally')return policy.allowAllies===true;
    return relation==='enemy';
  }
});