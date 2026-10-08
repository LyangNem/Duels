

const TrainingWorldDrawService=Object.freeze({
  emptyOptions:Object.freeze({}),
  previewRgbCache:new Map(),
  previewRgb(value){
    const key=String(value||'');
    let cached=this.previewRgbCache.get(key);
    if(cached)return cached;
    const parts=key.split(',');
    const parsed=[Number(parts[0]),Number(parts[1]),Number(parts[2])];
    if(parsed.some(component=>!Number.isFinite(component)))return null;
    cached=Object.freeze(parsed);
    if(this.previewRgbCache.size>=64){
      this.previewRgbCache.delete(this.previewRgbCache.keys().next().value);
    }
    this.previewRgbCache.set(key,cached);
    return cached;
  },
  interpolatePreviewRgb(from,to,t){
    const a=this.previewRgb(from);
    const b=this.previewRgb(to);
    if(!a||!b)return null;
    return `${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)}`;
  },
  summonBodyOptions:Object.freeze({
    bodyRenderer(bodyCtx,entity,bodyNow){
      return SummonDeployService.drawBody(bodyCtx,entity,bodyNow);
    }
  }),
  overlapsScreenRect(entity,cam,x,y,w,h){
    if(!entity?.alive||entity.hidden)return false;
    const screenX=Number(entity.x)-cam.x;
    const screenY=Number(entity.y)-cam.y;
    const radius=Math.max(0,Number(entity.radius)||0);
    return (
      screenX+radius>=x&&
      screenX-radius<=x+w&&
      screenY+radius>=y&&
      screenY-radius<=y+h
    );
  },
  drawAttackPreview(ctx,entity,preview,now){
      if(!entity||!preview||preview.until<=now)return;

      const style=
        preview.style||
        TrainingWorldDrawService.emptyOptions;
      const dash=
        Array.isArray(style.dash)
          ?style.dash
          :[7,5];
      const lineWidth=
        Math.max(
          .5,
          Number(style.lineWidth)||1.5
        );
      const previewProgress=Math.max(0,Math.min(1,Number(preview.progress)||0));
      const progressColor=style.progressColor||null;
      const resolvedProgressColor=progressColor
        ?this.interpolatePreviewRgb(
          progressColor.from,
          progressColor.to,
          previewProgress
        )
        :null;
      const strokeColor=
        String(resolvedProgressColor||style.strokeColor||'255,255,255');
      const strokeAlpha=
        Number.isFinite(Number(style.strokeAlpha))
          ?Math.max(
            0,
            Math.min(
              1,
              Number(style.strokeAlpha)
            )
          )
          :.55;
      const fillColor=
        String(resolvedProgressColor||style.fillColor||'165,175,185');
      const rawFillAlpha=
        Number.isFinite(Number(style.fillAlpha))
          ?Math.max(
            0,
            Math.min(
              1,
              Number(style.fillAlpha)
            )
          )
          :.16;
      const fillAlpha=
        style.preserveFillAlpha===true
          ?rawFillAlpha
          :Math.min(
            1,
            rawFillAlpha*.20
          );

      ctx.save();
      ctx.setLineDash(dash);
      ctx.lineWidth=lineWidth;
      ctx.strokeStyle=
        `rgba(${strokeColor},${strokeAlpha})`;
      ctx.fillStyle=
        `rgba(${fillColor},${fillAlpha})`;

      const drawPart=part=>{
        if(!part)return;

        if(
          part.type==='sector'||
          part.type==='circle'
        ){
          const points=
            Array.isArray(part.points)
              ?part.points
              :[];
          if(points.length<3)return;

          const innerRange=Math.max(0,Number(part.innerRange)||0);
          ctx.beginPath();
          ctx.moveTo(
            points[0].x,
            points[0].y
          );
          for(
            let index=1;
            index<points.length;
            index++
          ){
            ctx.lineTo(
              points[index].x,
              points[index].y
            );
          }
          ctx.closePath();
          if(part.type==='circle'&&innerRange>0){
            const innerPoints=
              Array.isArray(part.innerPoints)
                ?part.innerPoints
                :[];
            if(innerPoints.length>=3){
              ctx.moveTo(
                innerPoints[0].x,
                innerPoints[0].y
              );
              for(
                let index=innerPoints.length-1;
                index>=0;
                index--
              ){
                ctx.lineTo(
                  innerPoints[index].x,
                  innerPoints[index].y
                );
              }
              ctx.closePath();
              ctx.fill('evenodd');
              ctx.stroke();
            }else{
              const anchorX=Number.isFinite(Number(part.anchorX))?Number(part.anchorX):entity.x;
              const anchorY=Number.isFinite(Number(part.anchorY))?Number(part.anchorY):entity.y;
              ctx.moveTo(anchorX+innerRange,anchorY);
              ctx.arc(anchorX,anchorY,innerRange,0,Math.PI*2,true);
              ctx.fill('evenodd');
              ctx.stroke();
            }
          }else{
            ctx.fill();
            ctx.stroke();
          }
          return;
        }

        if(
          part.type==='rect'||
          part.type==='projectile-path'
        ){
          const partAngle=
            Number.isFinite(
              Number(part.angle)
            )
              ?Number(part.angle)
              :0;
          const halfWidth=
            Math.max(
              0,
              Number(part.halfWidth)||0
            );

          ctx.save();
          ctx.translate(
            Number.isFinite(Number(part.anchorX))?Number(part.anchorX):entity.x,
            Number.isFinite(Number(part.anchorY))?Number(part.anchorY):entity.y
          );
          ctx.rotate(partAngle);
          ctx.beginPath();
          ctx.rect(
            0,
            -halfWidth,
            Math.max(
              0,
              Number(part.range)||0
            ),
            halfWidth*2
          );
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      };

      const parts=
        Array.isArray(preview.parts)&&
        preview.parts.length>0
          ?preview.parts
          :[preview];

      for(const part of parts){
        drawPart(part);
      }

      ctx.restore();
  },

  drawEntity(ctx,runtime,e,label,options,now){
      const squash=EntitySquashPresentationService.sample(e,now);
      const motion=VisualFeedbackService.motion(e,now);
      const attack=VisualFeedbackService.attackState(e,now);
      const trajectory=MovementAbilityService.presentation(e);
      const bodyX=
        e.x+
        squash.offsetX+
        attack.offsetX+
        (motion.offsetX||0)+
        trajectory.offsetX;
      const bodyY=
        e.y+
        squash.offsetY+
        attack.offsetY+
        (motion.offsetY||0)+
        trajectory.offsetY;
    
      const invincible=
        (e.invincibleUntil||0)>now||
        BuffService.live(e,'invulnerable',now).length>0;
      const evasionUntargetable=
        ActionStateCombatPolicyService.isEvasionUntargetable(e,now);
      const counterReady=(e.counterReadyUntil||0)>now;
    
      const bodyRotation=
        attack.active
          ?attack.rotation
          :squash.active
            ?squash.rotation
            :motion.rotation;

      const specialBuffOpacity=BuffService.presentationOpacity(e,now);
      const stealthVisual=StealthPresentationService.state(runtime.player,e,now);
      const bodyAlpha=
        (
          (invincible||evasionUntargetable)
            ?Math.min(.45,specialBuffOpacity,stealthVisual.alpha)
            :Math.min(specialBuffOpacity,stealthVisual.alpha)
        )*
        trajectory.alpha;

      // Van의 거대한 스패너는 본체 회전보다 먼저 그려 방향이 변하지 않는다.
      // 내구도가 남아 있는 동안 자신/상대 화면 모두에서 캐릭터 뒤에 표시한다.
      ctx.save();
      ctx.translate(bodyX,bodyY);
      ModeGearPresentationService.drawBehind(ctx,e,bodyAlpha,now);
      ctx.restore();

      ctx.save();
      ctx.translate(bodyX,bodyY);
      ctx.rotate(bodyRotation);
      ctx.scale(
        squash.scaleX*motion.scaleX*attack.scaleX*trajectory.scale,
        squash.scaleY*motion.scaleY*attack.scaleY*trajectory.scale
      );
      ctx.globalAlpha=bodyAlpha;
      // 일반 버프는 캐릭터 외곽 점선 링을 사용하지 않는다.
      // 무적/비타격 무적만 캐릭터 본체 윤곽선을 점선으로 표시한다.
      ctx.setLineDash([]);
    
      if(typeof options.bodyRenderer==='function'){
        options.bodyRenderer(ctx,e,now);
      }else{
        ctx.beginPath();
        ctx.arc(0,0,e.radius,0,Math.PI*2);
        ctx.fillStyle=e.color;
        ctx.fill();

        ctx.strokeStyle=e.color;
        ctx.lineWidth=2.5;
        ctx.setLineDash(
          invincible||evasionUntargetable
            ?[5,4]
            :[]
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
    
      if(squash.flash){
        ctx.beginPath();
        ctx.arc(0,0,Math.max(0,e.radius-.75),0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,.92)';
        ctx.fill();
      }
      ctx.restore();

      // 캐릭터 본체에 적용되는 포물선/공중 이동 시각 오프셋은 캐릭터 주변의
      // 부착형 월드 UI에도 동일하게 적용한다. 실제 충돌 좌표(e.x/e.y)는 바꾸지 않는다.
      const worldUiOffsetX=Number(trajectory.offsetX)||0;
      const worldUiOffsetY=Number(trajectory.offsetY)||0;
      ctx.save();
      ctx.translate(worldUiOffsetX,worldUiOffsetY);

      {
        const directionalArc=
          EntityRingLayoutService
            .directionalArcIndicatorState(e);

        if(directionalArc.visible){
          const config=directionalArc.config||{};
          const radius=
            EntityRingLayoutService.chargeRadius(e);
          const lineWidth=
            Math.max(
              .5,
              Number(config.lineWidth)||
              EntityRingLayoutService.WIDTHS.gauge
            );
          const gap=
            Math.max(
              0,
              Math.min(
                Math.PI/3,
                Number(config.gap)||0
              )
            );
          const span=
            Math.max(
              .05,
              Math.PI/2-gap
            );

          for(
            const direction of
            CardinalDirectionService.order
          ){
            const center=
              CardinalDirectionService
                .centerAngle(direction);

            ArcGaugePresentationService.render(
              ctx,
              e,
              1,
              {
                radius,
                startAngle:center-span/2,
                span,
                color:
                  direction===directionalArc.direction
                    ?String(
                      config.color||
                      e.color||
                      '#ffffff'
                    )
                    :String(
                      config.inactiveColor||
                      'rgba(255,255,255,.14)'
                    ),
                lineWidth,
                lineCap:String(
                  config.lineCap||
                  'butt'
                ),
                maxChargeFlash:false
              }
            );
          }
        }
      }

      {
        const characterHoldGauge=
          EntityRingLayoutService.characterHoldGaugeState(
            e,
            now
          );
        if(characterHoldGauge.visible){
          const holdConfig=
            EntityRingLayoutService
              .characterRingPresentation(e)
              ?.holdGauge||{};
          ArcGaugePresentationService.render(
            ctx,
            e,
            characterHoldGauge.ratio,
            {
              radius:
                EntityRingLayoutService.chargeRadius(e),
              color:String(holdConfig.color||e.color||'#ffffff'),
              completeColor:String(holdConfig.completeColor||holdConfig.color||e.color||'#ffffff'),
              completePulseColor:String(holdConfig.completePulseColor||e.color||'#ffffff'),
              lineWidth:3.5,
              lineCap:'butt',
              showEmpty:false,
              maxChargeFlash:false,
              completePulseRadius:
                EntityRingLayoutService.maxChargeFlashRadius(
                  e,
                  now
                )
            }
          );
        }
      }

      RuliRulerPresentationService.drawPersistent(ctx,runtime,e,now);

    
      if(!stealthVisual.hideWorldUi&&(e.dodgeUntil||0)>now){
        ctx.beginPath();
        ctx.arc(e.x,e.y,e.radius+6,0,Math.PI*2);
        ctx.strokeStyle='rgba(200,220,255,.55)';
        ctx.lineWidth=2;
        ctx.stroke();
      }
    
      if(!stealthVisual.hideWorldUi&&counterReady){
        const pulse=.62+.18*Math.sin(now*.009);
        ctx.beginPath();
        ctx.arc(
          e.x,
          e.y,
          EntityRingLayoutService.counterRadius(
            e,
            now,
            {
              // 호 게이지/최대충전 점멸은 소유자 전용 표시다.
              // 상대 화면의 반격 링은 실제로 그 화면에 보이는 상태 링만 감싼다.
              includePrivateGauges:
                e===runtime.player||
                EntitySimulationAuthorityService.isLocal(e)
            }
          ),
          0,
          Math.PI*2
        );
        const counterPresentation=
          e.character?.counterReadyPresentation||
          null;
        const counterKind=
          CounterStockService.peekKind(
            e,
            now
          );
        const counterColor=
          counterPresentation?.kindColors?.[
            counterKind
          ]||
          counterPresentation?.color||
          '255,215,0';
        ctx.strokeStyle=`rgba(${counterColor},${pulse})`;
        ctx.lineWidth=3;
        ctx.stroke();
      }
    
      if(!stealthVisual.hideWorldUi){
        CounterModuleService.drawCharge(ctx,e,now);
        MultiClickAttackService.drawGauge(ctx,e,now);
        WaypointProjectileService.drawHoldGauge(ctx,e,now);
        ChargedAttackService.draw(ctx,e,now);
        if(e===runtime.player){
          DynamicWallService.drawPlacementPreview(
            ctx,
            e
          );
        }
        if(!ChannelAttackService.drawGauge(ctx,e,now)){
          ProgressStateService.draw(ctx,e,now);
        }
        // 탭/홀드 입력 게이지는 기존 호 게이지가 모두 그려진 뒤 마지막에 덮어쓴다.
        // 사이엔 절격 홀드는 holdGaugeRequireAvailable로 격 최대 상태에서만 여기까지 온다.
        if(e===runtime.player){
          PointerHoldInputService.drawHoldGauge(
            ctx,
            e,
            now
          );
        }
        StatusPresentation.draw(ctx,e,now);
        BuffStatusPresentation.draw(
          ctx,
          e,
          now,
          runtime.keys.has('Tab')
        );
        SummonDeployService.drawCooldown(
          ctx,
          e,
          now
        );
      }
      ctx.restore();
    
      if(e===runtime.player){
        DragPathInputService.draw(ctx,e,now);
        MovementAbilityService.drawPath(ctx,e);
      }
    
      if(
        !stealthVisual.hideWorldUi&&
        !SummonDeployService.isCarriedEntity(e)
      ){
      ctx.save();
      ctx.translate(worldUiOffsetX,worldUiOffsetY);
      const bw=52,bh=5,bx=e.x-bw/2,by=e.y-e.radius-22;
      const hpDisplay=WorldHealthBarPresentationService.ratio(
        e,
        now,
        (runtime.lastFrameDt||GAME_DATA.frameMs)/GAME_DATA.frameMs
      );
      const hpPct=hpDisplay.current;
      const hcol=
        runtime.sessionMode==='online'&&
        (e.kind==='player'||e.kind==='summon')
          ?TeamColorPresentationService.colorForEntity(
            e,
            e.color||'#4af'
          )
          :hpPct>.5?'#4af':hpPct>.25?'#fa0':'#f44';
    
      const wrenchMax=
        e.character?.wrenchDurability
          ?Math.max(
            0,
            Number(e.character?.wrenchDurability?.max)||0
          )
          :0;
      const hasWrenchBar=wrenchMax>0;
      const wrenchBarY=by-bh-2;

      // 기본 체력바는 다른 캐릭터와 동일한 전체 너비를 그대로 사용한다.
      ctx.fillStyle='#161616';
      ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle=hcol;
      ctx.fillRect(
        bx,
        by,
        bw*hpPct,
        bh
      );

      // Van의 스패너 내구도는 체력바를 분할하지 않고, 같은 규격의 별도 바를 바로 위에 쌓는다.
      if(hasWrenchBar){
        const wrenchValue=
          VanWrenchDurabilityPresentationService.value(e);
        const wrenchPct=Math.max(
          0,
          Math.min(1,wrenchValue/wrenchMax)
        );
        ctx.fillStyle='#161616';
        ctx.fillRect(bx,wrenchBarY,bw,bh);
        ctx.fillStyle=String(
          e.character?.color||'#9fcf55'
        );
        ctx.fillRect(
          bx,
          wrenchBarY,
          bw*wrenchPct,
          bh
        );
        WorldHealthBarSegmentPresentationService.drawValue(
          ctx,
          wrenchMax,
          bx,
          wrenchBarY,
          bw,
          bh
        );
      }

      const shieldPct=
        e.maxHealth>0
          ?ShieldService.current(e)/e.maxHealth
          :0;
      if(shieldPct>0){
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          bx-1,
          by-1,
          (bw+2)*shieldPct,
          bh+2
        );
        ctx.clip();
        ctx.strokeStyle='rgba(207,239,255,.96)';
        ctx.lineWidth=1.5;
        ctx.strokeRect(
          bx-.75,
          by-.75,
          bw+1.5,
          bh+1.5
        );
        ctx.restore();
      }

      WorldHealthBarSegmentPresentationService.drawValue(
        ctx,
        e.maxHealth,
        bx,
        by,
        bw,
        bh
      );

      RecipientAssignmentPresentationService.drawWorldMarkers(
        ctx,
        e,
        bx,
        by,
        bw
      );

      NaturalHealthRegenGaugePresentationService.draw(
        ctx,
        e,
        bx,
        by+bh+2,
        bw,
        now
      );
    
      const nameColor='#f4f7fb';
      ctx.save();
      ctx.font='700 12px Pretendard';
      ctx.textAlign='center';
      ctx.textBaseline='alphabetic';
      ctx.lineJoin='round';
      ctx.strokeStyle='rgba(0,0,0,.92)';
      ctx.lineWidth=4;
      const nameY=
        e.y-e.radius-(hasWrenchBar?37:30);
      ctx.strokeText(label,e.x,nameY);

      ctx.fillStyle=nameColor;

      ctx.fillText(label,e.x,nameY);
      ctx.restore();

      const sbw=48,sbh=4,sbx=e.x-sbw/2;
      const hasStaminaBar=e.kind!=='summon';
      const sby=e.y+e.radius+7;
    
      if(hasStaminaBar){
        const stPct=e.maxStamina
          ?Math.max(
            0,
            Math.min(
              1,
              e.stamina/e.maxStamina
            )
          )
          :0;
        ctx.fillStyle='#111';
        ctx.fillRect(sbx,sby,sbw,sbh);
        ctx.fillStyle=stPct>.4?'#fa0':'#f64';
        ctx.fillRect(
          sbx,
          sby,
          sbw*stPct,
          sbh
        );
    
      }
    
      const showOwnedAugmentGauge=
        e===runtime.player||
        (
          e.kind==='summon'&&
          EntityService.owner(e)===runtime.player
        );
      const augmentBars=showOwnedAugmentGauge
        ?AugmentPresentationService.chargeBars(
          e,
          now
        )
        :EMPTY_AUGMENT_EFFECTS;
      let nextGaugeY=
        hasStaminaBar
          ?sby+sbh+4
          :sby+
            SummonVisualPresentationService
              .stageGaugeStackHeight(e);
    

      if(
        hasStaminaBar&&
        e.kind==='player'
      ){
        const formationGaugeHeight=
          CircleFormationService.drawCountGauge(
            ctx,
            e,
            sbx,
            nextGaugeY,
            sbw
          );
        if(formationGaugeHeight>0){
          nextGaugeY+=formationGaugeHeight;
        }
      }

      OrbitInventoryService.draw(
        ctx,
        e,
        now
      );

      const orbitInventoryGaugeHeight=
        OrbitInventoryService.drawCountGauge(
          ctx,
          e,
          sbx,
          nextGaugeY,
          sbw
        );
      if(orbitInventoryGaugeHeight>0){
        nextGaugeY+=orbitInventoryGaugeHeight;
      }

      const worldGaugeHeight=
        WorldGaugeModuleService.draw(
          ctx,
          e,
          sbx,
          nextGaugeY,
          sbw
        );
      if(worldGaugeHeight>0){
        nextGaugeY+=worldGaugeHeight;
      }

      const commandTextHeight=
        CharacterCommandInputService.draw(
          ctx,
          e,
          nextGaugeY,
          now
        );
      if(commandTextHeight>0){
        nextGaugeY+=commandTextHeight;
      }

      if(hasStaminaBar&&e.kind==='player'){
        const storedBarCount=
          SummonDeployService.drawStoredHealthBars(
            ctx,
            e,
            nextGaugeY,
            now
          );
        if(storedBarCount>0){
          nextGaugeY+=
            storedBarCount*
            (WorldGaugeBarPresentationService.height+
             WorldGaugeBarPresentationService.gap);
        }
      }
    
      if(augmentBars.length){
        ctx.save();
        ctx.font='9px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        for(const bar of augmentBars){
          const barH=4;
          const emojiX=sbx-8;
          const emojiY=nextGaugeY+barH/2;
          ctx.fillStyle='rgba(255,255,255,.9)';
          ctx.fillText(bar.emoji,emojiX,emojiY);

          if(bar.type==='stock-segments'){
            const count=Math.max(1,Math.floor(Number(bar.count)||1));
            const gap=2;
            const cellWidth=Math.max(
              2,
              Math.min(
                8,
                (sbw-gap*(count-1))/count
              )
            );
            const totalWidth=
              cellWidth*count+
              gap*(count-1);
            let cellX=sbx+(sbw-totalWidth)/2;
            for(let cell=0;cell<count;cell++){
              ctx.fillStyle=
                String(bar.kinds?.[cell]||'normal')==='parry'
                  ?'#ff7620'
                  :'#4af';
              ctx.fillRect(cellX,nextGaugeY,cellWidth,barH);
              cellX+=cellWidth+gap;
            }
          }else{
            WorldGaugeBarPresentationService.render(
              ctx,
              {
                x:sbx,
                y:nextGaugeY,
                width:sbw,
                height:barH,
                progress:bar.progress,
                color:'#4af',
                background:'#111'
              }
            );
          }
          nextGaugeY+=
            barH+WorldGaugeBarPresentationService.gap;
        }
        ctx.restore();
      }
      ctx.restore();
      }

  },
  applyProjectileGlow(ctx){
    ctx.shadowColor='rgba(255,128,24,1)';
    ctx.shadowBlur=17;
    ctx.shadowOffsetX=0;
    ctx.shadowOffsetY=0;
  },
  drawProjectileOutlineGlow(ctx){
    ctx.save();
    this.applyProjectileGlow(ctx);
    ctx.stroke();
    ctx.restore();
  }
});
