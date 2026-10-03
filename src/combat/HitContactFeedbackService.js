

/* 피해 */
const HitContactFeedbackService=Object.freeze({
  apply({
    source=null,
    target=null,
    attack=null,
    impact=null,
    amount=0,
    now=performance.now()
  }={}){
    if(!target)return false;

    const feedbackAmount=Math.max(1,Number(amount)||0);
    StealthPresentationService.exposeState(
      target,
      800,
      now
    );

    const strongPresentation=
      feedbackAmount>=GAME_DATA.cameraFeedback.strongDamage;
    const presentationAmount=
      strongPresentation
        ?Math.max(
          feedbackAmount,
          GAME_DATA.cameraFeedback.strongDamage
        )
        :feedbackAmount;

    const squashOrigin=
      ImpactDirectionService.squashOrigin(
        source,
        impact
      );
    EntitySquashPresentationService.impact(
      target,
      presentationAmount,
      squashOrigin,
      {
        directionless:
          CCService.isDotImpact(impact)
      },
      now
    );

    SoundService.play('hit');

    if(
      !CCService.isDotImpact(impact)&&
      impact?.suppressHitImpactRing!==true
    ){
      EffectSpawnService.spawn({
        type:'hitImpactRing',
        x:Number(target.x)||0,
        y:Number(target.y)||0,
        color:AttackPresentationColorService.resolve(
          source,
          attack
        ),
        r:Math.max(8,Number(target.radius)||20),
        maxR:Math.max(
          42,
          (Number(target.radius)||20)+
          (
            presentationAmount>=GAME_DATA.cameraFeedback.strongDamage
              ?48
              :34
          )
        ),
        start:now,
        dur:
          presentationAmount>=GAME_DATA.cameraFeedback.strongDamage
            ?14*GAME_DATA.frameMs
            :10*GAME_DATA.frameMs,
        sourceEntityId:target.id
      },{source:target});
    }

    if(Training.active){
      if(source===Training.player){
        ScreenShakeService.queue(
          'attacker',
          presentationAmount,
          target.id||'target'
        );
        CameraFovService.queue(
          'attacker',
          presentationAmount,
          target.id||'target'
        );
      }

      if(target===Training.player){
        Training.screenHitFlashUntil=
          now+CombatScreenFeedback.immediateDuration;
        ScreenShakeService.queue(
          'victim',
          presentationAmount,
          target.id||'local'
        );
        CameraFovService.queue(
          'victim',
          presentationAmount,
          target.id||'local'
        );
      }
    }

    return true;
  }
});