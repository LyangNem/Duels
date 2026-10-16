

const ResourceRestoreEffectService=Object.freeze({
  recipient(source,target,module={},defaultRecipient='source'){
    const mode=String(module.recipient||defaultRecipient||'source');
    if(mode==='target')return target||null;
    if(mode==='owner')return EntityService.owner(source)||source||null;
    return source||null;
  },
  maximum(recipient,resource){
    if(resource==='stamina')return Math.max(0,Number(recipient?.maxStamina)||0);
    return Math.max(0,Number(recipient?.maxHealth)||0);
  },
  current(recipient,resource){
    const maximum=this.maximum(recipient,resource);
    if(resource==='stamina')return Math.max(0,Math.min(maximum,Number(recipient?.stamina)||0));
    if(resource==='shield')return Math.max(0,Math.min(maximum,Number(recipient?.shield)||0));
    return Math.max(0,Math.min(maximum,Number(recipient?.health)||0));
  },
  amount(source,recipient,module={}){
    let amount=Math.max(0,ModuleValueService.resolve(source,module.amount,module.amountRef||null));
    const resource=String(module.resource||'health');
    const maximum=this.maximum(recipient,resource);
    if(Number.isFinite(Number(module.maxResourceRatio))){
      amount=maximum*Math.max(0,Number(module.maxResourceRatio)||0);
    }
    if(Number.isFinite(Number(module.missingResourceRatio))){
      amount=(maximum-this.current(recipient,resource))*Math.max(0,Number(module.missingResourceRatio)||0);
    }
    return Math.max(0,amount);
  },
  apply({source,target=null,module={},defaultRecipient='source',presentationDefault='default',reason='resource.restore',now=performance.now()}={}){
    const recipient=this.recipient(source,target,module,defaultRecipient);
    if(!recipient?.alive)return 0;
    const resource=String(module.resource||'health');
    const amount=this.amount(source,recipient,module);
    if(amount<=0)return 0;
    if(resource==='health'){
      return HealthService.restore(recipient,amount,source||recipient,{
        notify:module.notify!==false&&module.presentation!=='none',
        presentation:String(module.presentation||presentationDefault||'default'),
        applyHealingModifier:module.applyHealingModifier!==false,
        onRestoredEffects:module.onRestoredEffects
      });
    }
    if(resource==='stamina')return StaminaService.restore(recipient,amount,now);
    if(resource==='shield'){
      return ShieldService.grant(recipient,amount,source||recipient,{
        reason,now,
        decayStartDelay:Number.isFinite(Number(module.decayStartDelay))?Math.max(0,Number(module.decayStartDelay)):undefined,
        decayInterval:Number.isFinite(Number(module.decayInterval))?Math.max(1,Number(module.decayInterval)):undefined,
        decayMaxHealthRatio:Number.isFinite(Number(module.decayMaxHealthRatio))?Math.max(0,Number(module.decayMaxHealthRatio)):undefined
      });
    }
    return 0;
  }
});