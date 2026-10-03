

const ForcedMotionCompletionService=Object.freeze({
  handlers:Object.freeze({
    neutralize(context){
      return NeutralizingKnockbackService.finish(
        context.entity,
        context.motion,
        context.now
      );
    },
    'wall-impact-status'(context){
      if(context.motion?.blocked!==true)return false;
      const status=String(context.completion?.status||'stun');
      const duration=Math.max(0,Number(context.completion?.duration)||0);
      if(!status||duration<=0)return false;
      CCService.add(
        context.entity,
        status,
        duration,
        String(context.completion?.sourceId||`wall-impact:${context.entity.id}`),
        {
          phase:'wall-impact',
          sourceEntityId:String(context.completion?.sourceEntityId||'')
        }
      );
      return true;
    }
  }),
  resolve(entity,motion,now=performance.now()){
    const completion=motion?.completion;
    if(!entity||!completion?.type)return false;

    const handler=this.handlers[completion.type];
    if(typeof handler!=='function')return false;

    return handler({
      entity,
      motion,
      completion,
      now
    });
  }
});