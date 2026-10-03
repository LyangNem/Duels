


const DebugPanel={
  open:false,
  tab:'control',
  targetId:'training.local',
  recordCharacterId:ProfileCharacterService.all()[0]?.id||null,
  element:null,
  scrollTop:0,
  liveTimer:0,
  canOpen(){return DebugAccessService.canUse()},
  target(){return EntityService.items.get(this.targetId)||Training.player||null},
  isTypingTarget(target=document.activeElement){
    return target instanceof HTMLInputElement||
      target instanceof HTMLTextAreaElement||
      target instanceof HTMLSelectElement;
  },
  capturesGameInput(){
    return (
      this.open&&
      !(
        typeof DebugMapEditorService!=='undefined'&&
        DebugMapEditorService.active
      )
    );
  },
  toggle(){
    if(!this.canOpen())return false;
    this.open=!this.open;
    Training.keys.clear();
    this.render();
    return true;
  },
  close(){
    this.open=false;
    Training.keys.clear();
    clearTimeout(this.liveTimer);
    this.liveTimer=0;
    this.render();
  },
  el(tag,className='',text=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  },
  button(text,onClick,className=''){
    const node=this.el('button',`debug-button ${className}`.trim(),text);
    node.type='button';
    node.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      onClick(event);
    });
    return node;
  },
  section(title,subtitle=''){
    const root=this.el('section','debug-section');
    const head=this.el('div','debug-section-head');
    head.appendChild(this.el('strong','debug-section-title',title));
    if(subtitle)head.appendChild(this.el('small','debug-section-subtitle',subtitle));
    root.appendChild(head);
    return root;
  },
  row(label,description=''){
    const row=this.el('div','debug-row');
    const copy=this.el('div','debug-row-copy');
    copy.appendChild(this.el('strong','debug-label',label));
    if(description)copy.appendChild(this.el('small','debug-description',description));
    const controls=this.el('div','debug-controls');
    row.append(copy,controls);
    return {row,controls};
  },
  input(value,placeholder=''){
    const input=this.el('input','debug-input');
    input.type='text';
    input.inputMode='decimal';
    input.autocomplete='off';
    input.spellcheck=false;
    input.value=String(value??'');
    input.placeholder=placeholder;
    return input;
  },
  passwordInput(placeholder=''){
    const input=this.el('input','debug-input');
    input.type='password';
    input.autocomplete='new-password';
    input.spellcheck=false;
    input.placeholder=placeholder;
    return input;
  },
  select(options,current,onChange){
    const wrap=this.el('label','debug-select-wrap');
    const select=this.el('select','debug-select');
    for(const [value,label] of options){
      const option=this.el('option','',label);
      option.value=value;
      option.selected=value===current;
      select.appendChild(option);
    }
    select.addEventListener('change',()=>onChange?.(select.value));
    wrap.appendChild(select);
    return wrap;
  },
  stepper(value,{step=1,min=-Infinity,max=Infinity}={}){
    const wrap=this.el('div','debug-stepper');
    const input=this.input(value);
    const apply=next=>{
      const value=Math.max(min,Math.min(max,Number(next)||0));
      input.value=String(value);
    };
    wrap.append(
      this.button('−',()=>apply((Number(input.value)||0)-step),'step'),
      input,
      this.button('+',()=>apply((Number(input.value)||0)+step),'step')
    );
    return {wrap,input};
  },
  rangeGauge(value,max,onInput){
    const wrap=this.el('div','debug-range-gauge');
    const input=this.el('input','debug-range-input');
    input.type='range';
    input.min='0';
    input.max=String(Math.max(1,Number(max)||1));
    input.step='1';
    input.value=String(Math.max(0,Math.min(Number(max)||0,Number(value)||0)));

    const valueText=this.el('span','debug-range-value','');

    const sync=(emit=true)=>{
      const current=Math.max(0,Number(input.value)||0);
      valueText.textContent=`${Math.round(current).toLocaleString()} / ${Math.round(max).toLocaleString()}`;
      wrap.style.setProperty('--debug-gauge',`${Math.max(0,Math.min(100,current/Math.max(1,max)*100))}%`);
      if(emit)onInput?.(current);
    };

    input.addEventListener('input',()=>sync(true));
    wrap.append(input,valueText);
    sync(false);

    const setValue=next=>{
      const current=Math.max(0,Math.min(Number(max)||0,Number(next)||0));
      input.value=String(current);
      valueText.textContent=`${Math.round(current).toLocaleString()} / ${Math.round(max).toLocaleString()}`;
      wrap.style.setProperty(
        '--debug-gauge',
        `${Math.max(0,Math.min(100,current/Math.max(1,max)*100))}%`
      );
    };

    return {wrap,input,sync,setValue};
  },
  targetOptions(){
    const result=[];
    for(const entity of EntityService.items.values()){
      let label=entity.id;
      if(entity===Training.player)label='플레이어';
      else if(entity.kind==='dummy')label='더미';
      else if(entity.botType==='melee')label='근거리 봇';
      else if(entity.botType==='ranged')label='원거리 봇';
      result.push([entity.id,label]);
    }
    return result;
  },
  characterOptions(){
    return [
      ['__all__','전체'],
      ...ProfileCharacterService.all().map(
        character=>[
          character.id,
          character.name
        ]
      )
    ];
  },
  formatRemaining(remaining){
    if(remaining===Infinity)return '무한';
    return `${Math.max(0,remaining/1000).toFixed(1)}s`;
  },
  fillStatusStrip(strip,target){
    strip.replaceChildren();
    const cc=DebugControlService.activeCc(target);
    const modifiers=DebugControlService.activeModifiers(target);

    if(!cc.length&&!modifiers.length){
      strip.appendChild(this.el('span','debug-status-empty','활성 CC / 버프 없음'));
      return;
    }

    for(const item of cc){
      strip.appendChild(
        this.el(
          'span',
          'debug-status-chip cc',
          `${item.label} · ${this.formatRemaining(item.remaining)}`
        )
      );
    }

    for(const item of modifiers){
      const value=item.type==='regenFlat'
        ?`${item.value>=0?'+':''}${Math.round(item.value)}/s`
        :`${item.value>=0?'+':''}${Math.round(item.value*100)}%`;

      strip.appendChild(
        this.el(
          'span',
          'debug-status-chip modifier',
          `${item.label} ${value} · ${this.formatRemaining(item.remaining)}`
        )
      );
    }
  },
  statusStrip(target){
    const strip=this.el('div','debug-status-strip');
    strip.dataset.liveStatus='true';
    this.fillStatusStrip(strip,target);
    return strip;
  },
  refreshControlLive(){
    if(this.tab!=='control'||!this.element?.isConnected)return;

    const target=this.target();
    if(!target)return;

    const activeElement=document.activeElement;

    const hpInput=this.element.querySelector('[data-live-gauge="health"] .debug-range-input');
    const hpWrap=hpInput?.closest('[data-live-gauge="health"]');
    const hpValue=hpWrap?.querySelector('.debug-range-value');

    if(hpInput&&hpWrap&&hpValue&&activeElement!==hpInput){
      const current=Math.max(0,Math.min(target.maxHealth||0,target.health||0));
      hpInput.max=String(Math.max(1,target.maxHealth||1));
      hpInput.value=String(current);
      hpValue.textContent=`${Math.round(current).toLocaleString()} / ${Math.round(target.maxHealth||0).toLocaleString()}`;
      hpWrap.style.setProperty(
        '--debug-gauge',
        `${Math.max(0,Math.min(100,current/Math.max(1,target.maxHealth||1)*100))}%`
      );
    }

    const shieldInput=this.element.querySelector('[data-live-gauge="shield"] .debug-range-input');
    const shieldWrap=shieldInput?.closest('[data-live-gauge="shield"]');
    const shieldValue=shieldWrap?.querySelector('.debug-range-value');

    if(shieldInput&&shieldWrap&&shieldValue&&activeElement!==shieldInput){
      const max=Math.max(0,target.maxHealth||0);
      const current=ShieldService.current(target);
      shieldInput.max=String(Math.max(1,max));
      shieldInput.value=String(current);
      shieldValue.textContent=`${Math.round(current).toLocaleString()} / ${Math.round(max).toLocaleString()}`;
      shieldWrap.style.setProperty(
        '--debug-gauge',
        `${Math.max(0,Math.min(100,current/Math.max(1,max)*100))}%`
      );
    }

    const staminaInput=this.element.querySelector('[data-live-gauge="stamina"] .debug-range-input');
    const staminaWrap=staminaInput?.closest('[data-live-gauge="stamina"]');
    const staminaValue=staminaWrap?.querySelector('.debug-range-value');

    if(staminaInput&&staminaWrap&&staminaValue&&activeElement!==staminaInput){
      const max=Math.max(0,target.maxStamina||0);
      const current=Math.max(0,Math.min(max,target.stamina||0));
      staminaInput.max=String(Math.max(1,max));
      staminaInput.value=String(current);
      staminaValue.textContent=`${Math.round(current).toLocaleString()} / ${Math.round(max).toLocaleString()}`;
      staminaWrap.style.setProperty(
        '--debug-gauge',
        `${Math.max(0,Math.min(100,current/Math.max(1,max)*100))}%`
      );
    }

    for(const button of this.element.querySelectorAll('[data-live-flag]')){
      button.classList.toggle(
        'active',
        DebugControlService.flag(target,button.dataset.liveFlag)
      );
    }

    for(const button of this.element.querySelectorAll('[data-live-action]')){
      button.disabled=!DebugControlService.canForceAction(
        target,
        button.dataset.liveAction
      );
    }

    for(const button of this.element.querySelectorAll('[data-live-cc]')){
      button.classList.toggle(
        'active',
        DebugControlService.isCcActive(target,button.dataset.liveCc)
      );
    }

    for(const button of this.element.querySelectorAll('[data-live-buff]')){
      button.classList.toggle(
        'active',
        DebugControlService.isModifierActive(target,button.dataset.liveBuff)
      );
    }

    const strip=this.element.querySelector('[data-live-status="true"]');
    if(strip)this.fillStatusStrip(strip,target);
  },
  startLiveRefresh(){
    clearTimeout(this.liveTimer);
    this.liveTimer=0;

    if(!this.open||!this.element)return;

    const tick=()=>{
      if(!this.open||!this.element?.isConnected){
        this.liveTimer=0;
        return;
      }

      this.refreshControlLive();
      this.liveTimer=setTimeout(tick,100);
    };

    this.liveTimer=setTimeout(tick,100);
  },
  openPoisonEditor(target){
    const overlay=this.el('div','debug-editor-overlay');
    const editor=this.el('div','debug-token-editor');
    editor.appendChild(this.el('strong','debug-token-editor-title','독 설정'));

    const value=this.stepper(
      1,
      {step:1,min:0,max:100}
    );

    const actions=this.el('div','debug-editor-actions');
    actions.append(
      this.button('적용',()=>{
        const raw=Math.max(
          0,
          Math.min(
            100,
            Number(value.input.value)||0
          )
        );
        OnlineDebugControlSyncService.perform(
          'poison-toggle',
          target,
          {
            value:raw/100,
            active:true,
            infinite:true
          }
        );
        overlay.remove();
        this.render();
      },'primary'),
      this.button('취소',()=>overlay.remove())
    );

    editor.append(
      this.el(
        'span',
        'debug-token-editor-help',
        '1초마다 최대 체력의 % 피해'
      ),
      value.wrap,
      actions
    );
    overlay.appendChild(editor);
    this.element.appendChild(overlay);
  },
  openBurnEditor(target){
    const overlay=this.el('div','debug-editor-overlay');
    const editor=this.el('div','debug-token-editor');
    editor.appendChild(
      this.el(
        'strong',
        'debug-token-editor-title',
        '화염 설정'
      )
    );

    const value=this.stepper(
      STATUS_EFFECT_RULES.burn.flatDamage,
      {step:10,min:0,max:100000}
    );

    const actions=this.el('div','debug-editor-actions');
    actions.append(
      this.button('적용',()=>{
        const raw=Math.max(
          0,
          Number(value.input.value)||0
        );
        OnlineDebugControlSyncService.perform(
          'burn-toggle',
          target,
          {
            value:raw,
            active:true,
            infinite:true
          }
        );
        overlay.remove();
        this.render();
      },'primary'),
      this.button('취소',()=>overlay.remove())
    );

    editor.append(
      this.el(
        'span',
        'debug-token-editor-help',
        '0.5초마다 적용할 고정 피해'
      ),
      value.wrap,
      actions
    );

    overlay.appendChild(editor);
    this.element.appendChild(overlay);
  },
  openModifierEditor(target,type){
    const overlay=this.el('div','debug-editor-overlay');
    const editor=this.el('div','debug-token-editor');
    const def=COMBAT_BUFF_DEFS[type];
    if(def?.toggleOnly===true)return;
    const style=BuffStatusPresentation.styles[type];

    editor.appendChild(
      this.el('strong','debug-token-editor-title',def?.label||type)
    );

    let sign=1;
    const signGroup=this.el('div','debug-segmented');

    const plus=this.button('+ 증가',()=>{
      sign=1;
      plus.classList.add('active');
      minus.classList.remove('active');
    },'active');

    const minus=this.button('− 감소',()=>{
      sign=-1;
      minus.classList.add('active');
      plus.classList.remove('active');
    });

    signGroup.append(plus,minus);

    const defaultValue=type==='regenFlat'?100:50;
    const value=this.stepper(defaultValue,{step:type==='regenFlat'?100:5,min:0,max:100000});

    const actions=this.el('div','debug-editor-actions');
    actions.append(
      this.button('적용',()=>{
        OnlineDebugControlSyncService.perform(
          'buff-toggle',
          target,
          {
            buff:type,
            value:
              (Number(value.input.value)||0)*sign,
            active:true,
            infinite:true
          }
        );
        overlay.remove();
        this.render();
      },'primary'),
      this.button('취소',()=>overlay.remove())
    );

    editor.append(
      signGroup,
      this.el(
        'span',
        'debug-token-editor-help',
        type==='regenFlat'?'초당 고정 체력 수치':'퍼센트 수치'
      ),
      value.wrap,
      actions
    );

    overlay.appendChild(editor);
    this.element.appendChild(overlay);
  },
  renderControl(body){
    const target=this.target();
    const section=this.section('대상 제어','대상 스탯과 상태를 직접 변경');

    const targetRow=this.row('대상');
    targetRow.controls.appendChild(this.select(this.targetOptions(),this.targetId,value=>{
      this.targetId=value;
      this.render();
    }));
    section.appendChild(targetRow.row);

    const cameraScale=this.row(
      '화면 배율',
      '로컬 디버그 화면만 축소/확대'
    );
    const cameraScaleGauge=this.el('div','debug-range-gauge');
    const cameraScaleInput=this.el('input','debug-range-input');
    cameraScaleInput.type='range';
    cameraScaleInput.min='25';
    cameraScaleInput.max='200';
    cameraScaleInput.step='1';
    cameraScaleInput.value=String(
      Math.round(CameraFovService.debugScale*100)
    );
    const cameraScaleValue=this.el(
      'span',
      'debug-range-value',
      `${cameraScaleInput.value}%`
    );
    const syncCameraScale=()=>{
      const percent=Math.max(25,Math.min(200,Number(cameraScaleInput.value)||100));
      CameraFovService.setDebugScale(percent/100);
      cameraScaleValue.textContent=`${Math.round(percent)}%`;
      cameraScaleGauge.style.setProperty(
        '--debug-gauge',
        `${(percent-25)/(200-25)*100}%`
      );
    };
    cameraScaleInput.addEventListener('input',syncCameraScale);
    cameraScaleGauge.append(cameraScaleInput,cameraScaleValue);
    syncCameraScale();
    cameraScale.controls.append(cameraScaleGauge);
    section.appendChild(cameraScale.row);

    if(target){
      section.appendChild(this.statusStrip(target));

      const debugFlags=this.row('제어 상태');
      const flagGrid=this.el('div','debug-action-grid debug-control-flags');

      const counterDebugModes=
        target.character?.debugCounterModes;
      const debugFlagEntries=[
        ['healthInfinite','체력 무한'],
        ['staminaInfinite','스테 무한'],
        ['healthFrozen','체력 정지'],
        ['staminaFrozen','스테 정지']
      ];
      if(
        Array.isArray(counterDebugModes)&&
        counterDebugModes.length
      ){
        for(const mode of counterDebugModes){
          debugFlagEntries.push([
            String(mode.flag||''),
            String(mode.label||'반격 활성화')
          ]);
        }
      }else{
        debugFlagEntries.push([
          'counterActive',
          '반격 활성화'
        ]);
      }

      for(const [key,label] of debugFlagEntries){
        const active=DebugControlService.flag(target,key);
        const button=this.button(
          label,
          ()=>{
            OnlineDebugControlSyncService.perform(
              'flag',
              target,
              {
                key,
                value:
                  !DebugControlService.flag(
                    target,
                    key
                  )
              }
            );
            this.refreshControlLive();
          },
          active?'active':''
        );
        button.dataset.liveFlag=key;
        flagGrid.appendChild(button);
      }

      debugFlags.controls.appendChild(flagGrid);
      section.appendChild(debugFlags.row);

      if(CommandFeatureService.isCharacter(target)){
        const commandFeatures=this.row(
          '가에 기능',
          '명령어 기능을 개발자 모드에서 직접 ON/OFF'
        );
        const featureGrid=
          this.el(
            'div',
            'debug-action-grid debug-control-flags'
          );

        for(
          const entry of
          CommandFeatureService.featureEntries
        ){
          const active=
            entry.oneShot===true
              ?false
              :CommandFeatureService.has(
                target,
                entry.feature
              );
          const button=this.button(
            entry.label,
            ()=>{
              if(entry.oneShot===true){
                OnlineDebugControlSyncService.perform(
                  'command-feature-repair',
                  target
                );
              }else{
                OnlineDebugControlSyncService.perform(
                  'command-feature-toggle',
                  target,
                  {
                    feature:entry.feature,
                    value:!CommandFeatureService.has(
                      target,
                      entry.feature
                    )
                  }
                );
              }
              this.render();
            },
            active?'active':''
          );
          featureGrid.appendChild(button);
        }

        commandFeatures.controls.appendChild(
          featureGrid
        );
        section.appendChild(
          commandFeatures.row
        );
      }

      const hp=this.row('체력','게이지를 드래그해 즉시 변경');
      const hpGauge=this.rangeGauge(
        target.health,
        target.maxHealth,
        value=>{
          OnlineDebugControlSyncService.perform(
            'health-set',
            target,
            {value}
          );
        }
      );
      hpGauge.wrap.dataset.liveGauge='health';
      hp.controls.append(
        hpGauge.wrap,
        this.button('최대',()=>{
          OnlineDebugControlSyncService.perform(
            'health-max',
            target
          );
          hpGauge.setValue(target.maxHealth);
        }),
        this.button('처치',()=>{
          OnlineDebugControlSyncService.perform(
            'kill',
            target
          );
          this.refreshControlLive();
        },'danger')
      );
      section.appendChild(hp.row);

      const shield=this.row(
        '보호막',
        '최대치는 현재 최대체력과 동일'
      );
      const shieldGauge=this.rangeGauge(
        ShieldService.current(target),
        ShieldService.maximum(target),
        value=>{
          OnlineDebugControlSyncService.perform(
            'shield-set',
            target,
            {value}
          );
        }
      );
      shieldGauge.wrap.dataset.liveGauge='shield';
      shield.controls.append(
        shieldGauge.wrap,
        this.button('최대',()=>{
          OnlineDebugControlSyncService.perform(
            'shield-max',
            target
          );
          shieldGauge.setValue(
            ShieldService.maximum(target)
          );
        }),
        this.button('제거',()=>{
          OnlineDebugControlSyncService.perform(
            'shield-set',
            target,
            {value:0}
          );
          shieldGauge.setValue(0);
        })
      );
      section.appendChild(shield.row);

      const stamina=this.row('스테미나','게이지를 드래그해 즉시 변경');
      const staminaGauge=this.rangeGauge(
        target.stamina||0,
        target.maxStamina||0,
        value=>{
          OnlineDebugControlSyncService.perform(
            'stamina-set',
            target,
            {value}
          );
        }
      );
      staminaGauge.wrap.dataset.liveGauge='stamina';
      stamina.controls.append(
        staminaGauge.wrap,
        this.button('최대',()=>{
          OnlineDebugControlSyncService.perform(
            'stamina-max',
            target
          );
          staminaGauge.setValue(target.maxStamina||0);
        })
      );
      section.appendChild(stamina.row);

      const gaugeEntries=
        DebugGaugeControlService.entries(
          target
        );

      if(gaugeEntries.length){
        const gaugeBlock=
          this.el(
            'div',
            'debug-token-block'
          );
        gaugeBlock.appendChild(
          this.el(
            'div',
            'debug-token-title',
            '─── 캐릭터 게이지 / 차징 ───'
          )
        );

        for(const entry of gaugeEntries){
          const gaugeRow=
            this.row(
              entry.label,
              `${Math.round(entry.value)} / ${Math.round(entry.max)}`
            );
          const gauge=
            this.rangeGauge(
              entry.value,
              entry.max,
              value=>{
                OnlineDebugControlSyncService.perform(
                  'gauge-set',
                  target,
                  {
                    kind:entry.kind,
                    key:entry.key,
                    value
                  }
                );
              }
            );

          gaugeRow.controls.append(
            gauge.wrap,
            this.button('50%',()=>{
              const value=entry.max*.5;
              OnlineDebugControlSyncService.perform(
                'gauge-set',
                target,
                {
                  kind:entry.kind,
                  key:entry.key,
                  value
                }
              );
              gauge.setValue(value);
            }),
            this.button('최대',()=>{
              OnlineDebugControlSyncService.perform(
                'gauge-set',
                target,
                {
                  kind:entry.kind,
                  key:entry.key,
                  value:entry.max
                }
              );
              gauge.setValue(entry.max);
            })
          );
          gaugeBlock.appendChild(
            gaugeRow.row
          );
        }

        section.appendChild(gaugeBlock);
      }

      const ccBlock=this.el('div','debug-token-block');
      ccBlock.appendChild(this.el('div','debug-token-title','─── CC / 디버프 토큰 ───'));

      const ccGrid=this.el('div','debug-status-token-grid');

      for(const [type,def] of Object.entries(COMBAT_STATUS_DEFS)){
        const style=StatusPresentation.cc[type];
        const active=DebugControlService.isCcActive(target,type);
        const token=this.button(def.label,()=>{
          if(type==='poison'){
            if(DebugControlService.isPoisonActive(target)){
              OnlineDebugControlSyncService.perform(
                'poison-toggle',
                target,
                {
                  value:.01,
                  active:false,
                  infinite:true
                }
              );
              this.refreshControlLive();
            }else{
              this.openPoisonEditor(target);
            }
            return;
          }

          if(type==='burn'){
            if(DebugControlService.isBurnActive(target)){
              OnlineDebugControlSyncService.perform(
                'burn-toggle',
                target,
                {
                  value:STATUS_EFFECT_RULES.burn.flatDamage,
                  active:false,
                  infinite:true
                }
              );
              this.refreshControlLive();
            }else{
              this.openBurnEditor(target);
            }
            return;
          }

          OnlineDebugControlSyncService.perform(
            'cc-toggle',
            target,
            {
              status:type,
              active:
                !DebugControlService.isCcActive(
                  target,
                  type
                ),
              infinite:true
            }
          );
          this.refreshControlLive();
        },`status-token ${active?'active':''}`);

        token.dataset.liveCc=type;
        if(style)token.style.setProperty('--status-rgb',style.rgb);
        ccGrid.appendChild(token);
      }

      ccBlock.appendChild(ccGrid);
      section.appendChild(ccBlock);

      const buffBlock=this.el('div','debug-token-block');
      buffBlock.appendChild(this.el('div','debug-token-title','─── 버프 / 디버프 토큰 ───'));

      const buffGrid=this.el('div','debug-status-token-grid buff-grid');

      for(const [type,def] of Object.entries(COMBAT_BUFF_DEFS)){
        if(def.debugHidden===true)continue;
        const style=BuffStatusPresentation.styles[type];
        const active=DebugControlService.isModifierActive(target,type);
        const token=this.button(
          def.label,
          ()=>{
            if(DebugControlService.isModifierActive(target,type)){
              OnlineDebugControlSyncService.perform(
                'buff-toggle',
                target,
                {
                  buff:type,
                  value:0,
                  active:false,
                  infinite:true
                }
              );
              this.refreshControlLive();
              return;
            }

            if(def.toggleOnly===true){
              OnlineDebugControlSyncService.perform(
                'buff-toggle',
                target,
                {buff:type,value:1,active:true,infinite:true}
              );
              this.refreshControlLive();
              return;
            }
            this.openModifierEditor(target,type);
          },
          `status-token ${active?'active':''}`
        );

        token.dataset.liveBuff=type;
        token.title=def.label;
        if(style)token.style.setProperty('--status-rgb',style.rgb);
        buffGrid.appendChild(token);
      }

      buffBlock.appendChild(buffGrid);
      section.appendChild(buffBlock);
    }
    body.appendChild(section);

    const action=this.section('강제 행동','선택 대상이 지원하는 행동을 즉시 실행');
    const grid=this.el('div','debug-action-grid');
    for(const [slot,label] of [
      ['lmb','LMB'],
      ['rmb','RMB'],
      ['counter','반격'],
      ['dodge','회피']
    ]){
      const button=this.button(
        label,
        ()=>{
          const actionTarget=this.target();
          OnlineDebugControlSyncService.perform(
            'force-action',
            actionTarget,
            {slot}
          );
          this.refreshControlLive();
        }
      );
      button.dataset.liveAction=slot;
      button.disabled=!DebugControlService.canForceAction(this.target(),slot);
      grid.appendChild(button);
    }
    action.appendChild(grid);
    body.appendChild(action);

    const spawn=this.section('더미','여러 더미를 소환하고 플레이어와 가장 가까운 더미를 제거');
    const spawnGrid=this.el('div','debug-action-grid');

    spawnGrid.append(
      this.button('더미 추가',()=>{
        OnlineDebugControlSyncService.spawnDummy();
        this.render();
      },'primary'),
      this.button('가까운 더미 제거',()=>{
        OnlineDebugControlSyncService.removeNearestDummy(
          Training.player
        );
        this.render();
      },'danger')
    );

    spawn.appendChild(spawnGrid);
    body.appendChild(spawn);
  },
  renderManipulation(body){
    const target=this.target();

    const targetSection=this.section(
      '조작 대상',
      '캐릭터 변경은 플레이어 Entity에 적용'
    );

    const targetRow=this.row('대상');
    targetRow.controls.appendChild(
      this.select(this.targetOptions(),this.targetId,value=>{
        this.targetId=value;
        this.render();
      })
    );
    targetSection.appendChild(targetRow.row);

    body.appendChild(targetSection);

    const characterSection=this.section(
      '캐릭터 변경',
      '기존 조작 탭처럼 선택한 나/상대 플레이어에게 적용'
    );

    if(DebugManipulationService.canEditCombatant(target)){
      const grid=this.el('div','debug-manip-grid');

      for(const character of CharacterCardDataService.all().map(card=>card.combat)){
        const active=target.character?.id===character.id;
        grid.appendChild(
          this.button(character.name,()=>{
            OnlineDebugControlSyncService.perform(
              'character',
              target,
              {characterId:character.id}
            );
            this.render();
          },active?'active':'')
        );
      }

      characterSection.appendChild(grid);
    }else{
      characterSection.appendChild(
        this.el('div','debug-empty-note','캐릭터 변경은 플레이어 대상에서만 사용 가능')
      );
    }

    body.appendChild(characterSection);



    const augmentSection=this.section(
      '증강 지급',
      '기존 개발자 모드와 동일하게 좌클릭 지급 / 우클릭 1개 제거'
    );

    if(target&&AugmentService.owner(target)){
      const grid=this.el('div','debug-augment-grid');

      for(const augment of AugmentDataService.all()){
        const count=AugmentService.count(target,augment.id);
        const card=this.el(
          'button',
          `debug-augment-card ${count>0?'active':''}`.trim()
        );
        card.type='button';
        card.dataset.augmentId=augment.id;
        
        const emoji=this.el('span','debug-augment-emoji',augment.emoji||'◆');
        const copy=this.el('span','debug-augment-copy');
        copy.append(
          this.el('strong','',augment.name),
          this.el(
            'small',
            '',
            `${augment.rarity||'augment'}${count>0?` · ×${count}`:''}`
          )
        );
        card.append(emoji,copy);

        card.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          if(
            OnlineDebugControlSyncService.perform(
              'augment-acquire',
              target,
              {augmentId:augment.id}
            )
          ){
            this.render();
          }
        });
        card.addEventListener('contextmenu',event=>{
          event.preventDefault();
          event.stopPropagation();
          if(
            OnlineDebugControlSyncService.perform(
              'augment-remove',
              target,
              {augmentId:augment.id}
            )
          ){
            this.render();
          }
        });

        grid.appendChild(card);
      }

      augmentSection.appendChild(grid);
    }else{
      augmentSection.appendChild(
        this.el('div','debug-empty-note','현재 대상에는 증강을 지급할 수 없습니다.')
      );
    }

    body.appendChild(augmentSection);

  },
  renderMap(body){
    const map=DebugMapService.current();

    const current=this.section(
      '맵 선택',
      '훈련장과 현재 파일에 이식된 공식 맵 표시'
    );

    const grid=this.el(
      'div',
      'debug-manip-grid debug-map-card-grid'
    );

    for(const candidate of DebugMapService.maps){
      const active=
        candidate.id===
        DebugMapService.currentId;
      const button=this.button(
        candidate.name,
        ()=>{
          OnlineDebugMapSyncService.apply(
            candidate.id
          );
          this.render();
        },
        active?'active':''
      );
      button.title=
        `${candidate.type} · ${candidate.cols}×${candidate.rows}`;
      grid.appendChild(button);
    }

    current.appendChild(grid);
    current.appendChild(
      this.el(
        'div',
        'debug-map-info',
        `현재: ${map.name} · ${map.type} · ${map.cols}×${map.rows} · 벽 ${map.walls.length}개`
      )
    );
    body.appendChild(current);

    const create=this.section(
      '새 맵 만들기',
      '이식할 맵 모드를 선택하고 빈 맵에서 시작'
    );

    const nameRow=this.row('이름');
    const nameInput=
      this.input(
        '',
        '새 맵 이름'
      );
    nameRow.controls.appendChild(
      nameInput
    );
    create.appendChild(
      nameRow.row
    );

    const modeRow=this.row('모드');
    let selectedMode='basic';
    const modeGrid=this.el(
      'div',
      'debug-action-grid'
    );
    const modeButtons=new Map();

    for(const [mode,spec] of Object.entries(
      OfficialMapDataService.modeSpecs
    )){
      const button=this.button(
        spec.label,
        ()=>{
          selectedMode=mode;
          for(
            const [id,node] of
              modeButtons
          ){
            node.classList.toggle(
              'active',
              id===selectedMode
            );
          }
        },
        mode===selectedMode
          ?'active'
          :''
      );
      modeButtons.set(
        mode,
        button
      );
      modeGrid.appendChild(button);
    }
    modeRow.controls.appendChild(
      modeGrid
    );
    create.appendChild(
      modeRow.row
    );

    create.appendChild(
      this.button(
        '새 맵 생성',
        ()=>{
          const record=
            DebugMapService.create({
              name:
                nameInput.value.trim()||
                '새 맵',
              mode:selectedMode
            });
          DebugMapService.set(
            record.id
          );
          this.render();
        },
        'primary'
      )
    );
    body.appendChild(create);

    const symmetrySection=this.section(
      '대각선 대칭',
      '활성화 시 설치·제거·드래그를 반대편 같은 위치에 즉시 같이 반영'
    );
    const symmetryGrid=this.el(
      'div',
      'debug-action-grid'
    );

    symmetryGrid.appendChild(
      this.button(
        '대각선 대칭',
        ()=>{
          DebugMapEditorService
            .toggleSymmetry();
          this.render();
        },
        DebugMapEditorService
          .symmetry
          .diagonal
            ?'active'
            :''
      )
    );

    symmetrySection.appendChild(
      symmetryGrid
    );
    body.appendChild(
      symmetrySection
    );

    const edit=this.section(
      '맵 관리',
      '설계 맵 편집·이름 변경·삭제·파일 저장'
    );

    if(
      map.id==='training-tilemap'
    ){
      edit.appendChild(
        this.el(
          'div',
          'debug-empty-note',
          '훈련장은 고정 맵이라 편집하거나 삭제할 수 없습니다.'
        )
      );
    }else{
      const record=
        DebugMapService.record(map.id);
      const renameRow=
        this.row('이름 변경');
      const renameInput=
        this.input(
          record?.name||map.name
        );
      renameRow.controls.append(
        renameInput,
        this.button(
          '적용',
          ()=>{
            DebugMapService.rename(
              map.id,
              renameInput.value.trim()
            );
            this.render();
          }
        )
      );
      edit.appendChild(
        renameRow.row
      );

      const actions=this.el(
        'div',
        'debug-action-grid'
      );
      actions.append(
        this.button(
          '맵 편집 시작',
          ()=>{
            DebugMapEditorService
              .start(map.id);
          },
          'primary'
        ),
        this.button(
          '맵 파일 저장',
          ()=>{
            DebugMapService
              .downloadMap(map.id);
          }
        ),
        this.button(
          '맵 삭제',
          ()=>{
            DebugMapService.remove(
              map.id
            );
            this.render();
          },
          'danger'
        )
      );
      edit.appendChild(actions);
    }

    body.appendChild(edit);

    const dataSection=this.section(
      '맵 파일 저장',
      '완성한 설계 파일을 저장한 뒤 ChatGPT에 전달하면 공식 맵으로 그대로 이식 가능'
    );

    const fileActions=this.el(
      'div',
      'debug-action-grid'
    );

    if(map.id!=='training-tilemap'){
      fileActions.appendChild(
        this.button(
          '현재 맵 저장',
          ()=>{
            DebugMapService
              .downloadMap(map.id);
          },
          'primary'
        )
      );
    }

    fileActions.appendChild(
      this.button(
        '전체 맵 묶음 저장',
        ()=>{
          DebugMapService
            .downloadAllMaps();
        }
      )
    );

    dataSection.appendChild(
      fileActions
    );
    dataSection.appendChild(
      this.el(
        'div',
        'debug-empty-note',
        '개별 파일: duels3-map / 묶음 파일: duels3-map-bundle · 이름/모드/크기/전체 타일 배치를 그대로 저장'
      )
    );
    body.appendChild(dataSection);

    const guide=this.section(
      '편집 조작',
      '편집 시작 후 월드에서 직접 사용'
    );
    guide.appendChild(
      this.el(
        'div',
        'debug-empty-note',
        'WASD 이동 · Space 대시 · 휠 확대/축소 · 좌클릭 설치 · 우클릭 제거 · 좌/우 드래그 범위 채우기/지우기 · 대칭 토글 자동 반영 · FFA 3인/4인 시작 위치 표시 · ESC 종료'
      )
    );
    body.appendChild(guide);
  },

  renderAccount(body){
    const account=AccountState.current;

    const current=this.section(
      '현재 계정',
      'Firebase 서버 전용 관리자 권한'
    );
    const card=this.el(
      'div',
      'debug-account-card'
    );

    card.append(
      this.el(
        'strong',
        'debug-account-name',
        account?.displayName||
        '로그인 없음'
      ),
      this.el(
        'span',
        'debug-account-id',
        account?.firebaseUid||
        account?.accountId||
        '-'
      )
    );

    for(
      const [
        key,
        label
      ] of [
        ['debugTools','DEBUG'],
        ['accountAdmin','ACCOUNT ADMIN'],
        ['rankingAdmin','RANKING ADMIN']
      ]
    ){
      const allowed=
        DebugAccessService.has(
          key,
          account
        );

      card.appendChild(
        this.el(
          'span',
          `debug-permission ${allowed?'allowed':'denied'}`,
          `${label}: ${allowed?'ON':'OFF'}`
        )
      );
    }

    current.appendChild(card);
    body.appendChild(current);

    const permission=this.section(
      '관리자 권한',
      'Firebase UID 기준 · accountAdmin 보유자만 변경 가능'
    );

    const permissionRow=
      this.row('Firebase UID');

    const id=
      this.input(
        '',
        'firebase_uid'
      );

    id.inputMode='text';

    let selectedPermission=
      'debugTools';

    const permissionSelect=
      this.select(
        [
          ['debugTools','디버그 도구'],
          ['accountAdmin','계정 관리자'],
          ['rankingAdmin','랭킹 관리자']
        ],
        selectedPermission,
        value=>{
          selectedPermission=value;
        }
      );

    const message=
      this.el(
        'span',
        'debug-message',
        ''
      );

    const allowButton=
      this.button(
        '권한 허용',
        async()=>{
          try{
            await DebugAccessService
              .setPermission(
                id.value,
                selectedPermission,
                true
              );

            message.textContent=
              '권한 저장 완료';
            message.dataset.state=
              'ok';
            this.render();
          }catch(error){
            message.textContent=
              error.message;
            message.dataset.state=
              'error';
          }
        },
        'primary'
      );

    const revokeButton=
      this.button(
        '권한 해제',
        async()=>{
          try{
            await DebugAccessService
              .setPermission(
                id.value,
                selectedPermission,
                false
              );

            message.textContent=
              '권한 해제 완료';
            message.dataset.state=
              'ok';
            this.render();
          }catch(error){
            message.textContent=
              error.message;
            message.dataset.state=
              'error';
          }
        },
        'danger'
      );

    allowButton.disabled=
      !DebugAccessService
        .canManageAccounts();

    revokeButton.disabled=
      !DebugAccessService
        .canManageAccounts();

    permissionRow.controls.append(
      id,
      permissionSelect,
      allowButton,
      revokeButton,
      message
    );

    permission.appendChild(
      permissionRow.row
    );
    body.appendChild(permission);

    const rankingAdmin=
      this.section(
        '랭킹 관리자',
        'Firestore의 users/progress를 기준으로 전체 랭킹을 다시 계산'
      );

    const rankingRow=
      this.row(
        '전체 랭킹 재구축'
      );

    const rankingMessage=
      this.el(
        'span',
        'debug-message',
        ''
      );

    const rebuildButton=
      this.button(
        '재구축',
        async()=>{
          try{
            rankingMessage.textContent=
              '재구축 중…';
            rankingMessage.dataset.state=
              '';

            const result=
              await DebugAccessService
                .rebuildRankings();

            rankingMessage.textContent=
              `완료 · 사용자 ${Number(result.loadedAccountCount)||0} · 캐릭터 ${Number(result.characterCount)||0}`;
            rankingMessage.dataset.state=
              'ok';
          }catch(error){
            rankingMessage.textContent=
              error?.message||
              '랭킹 재구축 실패';
            rankingMessage.dataset.state=
              'error';
          }
        },
        'primary'
      );

    rebuildButton.disabled=
      !DebugAccessService
        .canManageRankings();

    rankingRow.controls.append(
      rebuildButton,
      rankingMessage
    );

    rankingAdmin.appendChild(
      rankingRow.row
    );
    body.appendChild(
      rankingAdmin
    );

    const characterRecordDeletion=this.section(
      '캐릭터 레코드 삭제',
      'Firebase UID와 캐릭터를 지정해 해당 캐릭터의 레코드·전적·랭킹 기록만 삭제'
    );
    const characterRecordDeletionRow=
      this.row(
        '플레이어 / 캐릭터',
        '다른 캐릭터 기록과 계정 데이터는 유지'
      );
    const characterRecordDeletionId=
      this.input('', 'firebase_uid');
    characterRecordDeletionId.inputMode='text';
    characterRecordDeletionId.autocomplete='off';

    let characterRecordDeletionCharacterId=
      ProfileCharacterService.all()[0]?.id||'';
    const characterRecordDeletionSelect=
      this.select(
        ProfileCharacterService.all().map(character=>[
          character.id,
          character.name
        ]),
        characterRecordDeletionCharacterId,
        value=>{
          characterRecordDeletionCharacterId=value;
        }
      );

    const characterRecordDeletionMessage=
      this.el('span','debug-message','');
    const characterRecordDeletionButton=
      this.button(
        '레코드 + 랭킹 삭제',
        async()=>{
          try{
            const targetUid=
              String(
                characterRecordDeletionId.value||''
              ).trim();
            if(!targetUid){
              throw new Error(
                '대상 Firebase UID를 입력하세요.'
              );
            }

            const character=
              ProfileCharacterService.get(
                characterRecordDeletionCharacterId
              );
            if(!character){
              throw new Error(
                '삭제할 캐릭터를 선택하세요.'
              );
            }

            characterRecordDeletionMessage.textContent=
              '삭제 중…';
            characterRecordDeletionMessage.dataset.state='';

            const result=
              await DebugAccessService.deleteCharacterRecord(
                targetUid,
                character.id
              );

            characterRecordDeletionMessage.textContent=
              `${result.targetUid} · ${character.name} 삭제 완료 · 랭킹 ${result.removedRankingEntries}개 제거`;
            characterRecordDeletionMessage.dataset.state='ok';

            if(
              String(
                AccountState.current?.firebaseUid||
                AccountState.current?.accountId||
                ''
              )===result.targetUid
            ){
              this.render();
            }
          }catch(error){
            characterRecordDeletionMessage.textContent=
              error?.message||
              '캐릭터 레코드 삭제에 실패했습니다.';
            characterRecordDeletionMessage.dataset.state='error';
          }
        },
        'danger'
      );

    characterRecordDeletionButton.disabled=
      !(
        DebugAccessService.canUse()&&
        DebugAccessService.canManageRankings()
      );

    characterRecordDeletionRow.controls.append(
      characterRecordDeletionId,
      characterRecordDeletionSelect,
      characterRecordDeletionButton,
      characterRecordDeletionMessage
    );
    characterRecordDeletion.appendChild(
      characterRecordDeletionRow.row
    );
    body.appendChild(
      characterRecordDeletion
    );

    const deletion=this.section(
      '계정 삭제',
      'Firebase UID 기준 계정 데이터와 해당 랭킹 기록을 함께 삭제'
    );
    const deletionRow=this.row('Firebase UID');
    const deletionId=this.input('','firebase_uid');
    deletionId.inputMode='text';
    deletionId.autocomplete='off';
    const deletionMessage=this.el('span','debug-message','');

    deletionRow.controls.append(
      deletionId,
      this.button('계정 + 랭킹 삭제',async()=>{
        try{
          if(!DebugAccessService.canManageAccounts()){
            throw new Error('계정 관리자 권한이 없습니다.');
          }
          const targetId=
            String(deletionId.value||'').trim();

          if(!targetId){
            throw new Error(
              '삭제할 Firebase UID를 입력하세요.'
            );
          }

          deletionMessage.textContent='삭제 중…';
          deletionMessage.dataset.state='';

          const result=
            await DebugAccessService
              .deleteAccount(
                targetId
              );

          CharacterRecordService
            .clearRankingCache();

          deletionId.value='';
          deletionMessage.textContent=
            `${result.targetUid} 삭제 완료 · 랭킹 ${result.removedRankings}개 제거`;
          deletionMessage.dataset.state='ok';

          if(
            String(
              AccountState.current?.firebaseUid||
              AccountState.current?.accountId||
              ''
            )===result.targetUid
          ){
            AccountUI.logout();
            return;
          }

          CharacterRecordService
            .loadAllRankings(true)
            .catch(()=>{});
        }catch(error){
          deletionMessage.textContent=
            error?.message||
            '계정 삭제에 실패했습니다.';
          deletionMessage.dataset.state='error';
        }
      },'danger'),
      deletionMessage
    );
    deletion.appendChild(deletionRow.row);
    body.appendChild(deletion);

    if(!account||account.isGuest)return;

    const profile=this.section('계정','계정 기본 정보');
    const display=this.row('표시 이름');
    const name=this.input(account.displayName||'','display name');
    name.inputMode='text';
    display.controls.append(
      name,
      this.button('저장',async()=>{
        account.displayName=String(name.value||'').trim().slice(0,24);
        AccountState.current=
          await FirebaseProfilePersistenceService.save(
            account
          );
        AccountUI.updateChip();this.render();
      },'primary')
    );

    body.appendChild(profile);

    const record=this.section('레코드 / 전적','캐릭터를 선택해 개별 또는 전체 데이터를 수정');
    const characterRow=this.row('캐릭터');
    characterRow.controls.appendChild(
      this.select(this.characterOptions(),this.recordCharacterId,value=>{
        this.recordCharacterId=value;
        this.render();
      })
    );
    record.appendChild(characterRow.row);

    const allCharacters=
      ProfileCharacterService.all();
    const allSelected=
      this.recordCharacterId==='__all__';
    const selectedProfile=
      allSelected
        ?null
        :ProfileCharacterService.get(
          this.recordCharacterId
        );
    const characterName=
      allSelected
        ?'전체 캐릭터'
        :(
          selectedProfile?.name||
          this.recordCharacterId
        );

    const selectedRecord=
      allSelected
        ?0
        :Math.max(
          0,
          Number(
            account.characterRecords?.[
              this.recordCharacterId
            ]
          )||0
        );

    const scoreRow=this.row(
      '레코드 조작',
      allSelected
        ?'모든 캐릭터 레코드를 같은 값으로 저장'
        :characterName
    );
    const score=this.stepper(
      selectedRecord,
      {
        step:50,
        min:0
      }
    );

    scoreRow.controls.append(
      score.wrap,
      this.button('저장',async()=>{
        const value=
          Math.max(
            0,
            Math.floor(
              Number(score.input.value)||0
            )
          );

        const records={
          ...(account.characterRecords||{})
        };

        if(allSelected){
          for(const character of allCharacters){
            records[character.id]=value;
          }
        }else{
          records[this.recordCharacterId]=value;
        }

        const payload=
          await DebugAccessService.setProgress({
            characterRecords:records
          });

        account.characterRecords={
          ...(payload.progress?.characterRecords||records)
        };
        AccountState.current=account;
        this.render();
      },'primary')
    );
    record.appendChild(scoreRow.row);

    const stats=
      allSelected
        ?{}
        :(
          account.characterStats?.[
            this.recordCharacterId
          ]||
          {}
        );
    const statRow=this.row(
      '전적 조작',
      allSelected
        ?'모든 캐릭터 전적을 같은 값으로 저장'
        :characterName
    );
    const plays=this.stepper(
      Number(stats.plays)||0,
      {step:1,min:0,max:999999}
    );
    const wins=this.stepper(
      Number(stats.wins)||0,
      {step:1,min:0,max:999999}
    );
    const losses=this.stepper(
      Number(stats.losses)||0,
      {step:1,min:0,max:999999}
    );

    statRow.controls.append(
      this.el('span','debug-mini-label','P'),
      plays.wrap,
      this.el('span','debug-mini-label','W'),
      wins.wrap,
      this.el('span','debug-mini-label','L'),
      losses.wrap,
      this.button('저장',async()=>{
        const nextStats={
          ...(account.characterStats||{})
        };
        const value={
          plays:Math.max(
            0,
            Math.floor(
              Number(plays.input.value)||0
            )
          ),
          wins:Math.max(
            0,
            Math.floor(
              Number(wins.input.value)||0
            )
          ),
          losses:Math.max(
            0,
            Math.floor(
              Number(losses.input.value)||0
            )
          )
        };

        if(allSelected){
          for(const character of allCharacters){
            nextStats[character.id]={
              ...(nextStats[character.id]||{}),
              ...value
            };
          }
        }else{
          nextStats[this.recordCharacterId]={
            ...(nextStats[this.recordCharacterId]||{}),
            ...value
          };
        }

        const payload=
          await DebugAccessService.setProgress({
            characterStats:nextStats
          });

        account.characterStats={
          ...(payload.progress?.characterStats||nextStats)
        };
        AccountState.current=account;
        this.render();
      },'primary')
    );
    record.appendChild(statRow.row);
    body.appendChild(record);
  },
  savedSize(){
    const maxWidth=Math.max(280,window.innerWidth-24);
    const minWidth=Math.min(520,maxWidth);
    const savedWidth=Number(localStorage.getItem('duels3.debug.width'))||820;
    const width=Math.max(minWidth,Math.min(maxWidth,savedWidth));

    const maxHeight=Math.max(300,window.innerHeight-54);
    const minHeight=Math.min(420,maxHeight);
    const savedHeight=Number(localStorage.getItem('duels3.debug.height'))||700;
    const height=Math.max(minHeight,Math.min(maxHeight,savedHeight));

    return {width,height};
  },
  installResize(panel){
    const handle=this.el('div','debug-resize-handle');
    panel.appendChild(handle);

    handle.addEventListener('pointerdown',event=>{
      event.preventDefault();
      event.stopPropagation();

      const rect=panel.getBoundingClientRect();
      const startX=event.clientX;
      const startY=event.clientY;
      const startWidth=rect.width;
      const startHeight=rect.height;

      const move=moveEvent=>{
        const maxWidth=Math.max(280,window.innerWidth-24);
        const minWidth=Math.min(520,maxWidth);
        const width=Math.max(
          minWidth,
          Math.min(maxWidth,startWidth+(startX-moveEvent.clientX))
        );

        const maxHeight=Math.max(300,window.innerHeight-54);
        const minHeight=Math.min(420,maxHeight);
        const height=Math.max(
          minHeight,
          Math.min(maxHeight,startHeight+(moveEvent.clientY-startY))
        );

        panel.style.width=`${Math.round(width)}px`;
        panel.style.height=`${Math.round(height)}px`;
      };

      const up=()=>{
        const rect=panel.getBoundingClientRect();
        localStorage.setItem('duels3.debug.width',String(Math.round(rect.width)));
        localStorage.setItem('duels3.debug.height',String(Math.round(rect.height)));
        window.removeEventListener('pointermove',move);
        window.removeEventListener('pointerup',up);
      };

      window.addEventListener('pointermove',move);
      window.addEventListener('pointerup',up);
    });
  },
  render(){
    clearTimeout(this.liveTimer);
    this.liveTimer=0;

    const previousBody=this.element?.querySelector('.debug-body');
    if(previousBody){
      this.scrollTop=previousBody.scrollTop;
    }

    this.element?.remove();
    this.element=null;
    if(!this.open||!this.canOpen())return;

    const panel=this.el('aside','debug-panel');
    panel.id='duels-debug-panel';

    const savedSize=this.savedSize();
    panel.style.width=`${Math.round(savedSize.width)}px`;
    panel.style.height=`${Math.round(savedSize.height)}px`;
    panel.addEventListener('mousedown',event=>event.stopPropagation());
    panel.addEventListener('pointerdown',event=>event.stopPropagation());
    panel.addEventListener('contextmenu',event=>event.stopPropagation());

    const header=this.el('div','debug-header');
    const heading=this.el('div','debug-heading');
    heading.append(this.el('strong','debug-title','DEBUG'),this.el('small','debug-subtitle','TOOLS'));
    header.append(heading,this.button('×',()=>this.close(),'debug-close'));

    const tabs=this.el('div','debug-tabs');
    for(const [id,label] of [['control','제어'],['manipulation','조작'],['map','맵'],['account','계정']]){
      tabs.appendChild(this.button(label,()=>{
        this.tab=id;
        this.scrollTop=0;
        this.render();
      },id===this.tab?'active':''));
    }

    const body=this.el('div','debug-body');
    if(this.tab==='control')this.renderControl(body);
    else if(this.tab==='manipulation')this.renderManipulation(body);
    else if(this.tab==='map')this.renderMap(body);
    else this.renderAccount(body);

    panel.append(header,tabs,body);
    this.installResize(panel);
    document.body.appendChild(panel);
    this.element=panel;

    body.scrollTop=Math.max(
      0,
      Math.min(this.scrollTop,body.scrollHeight-body.clientHeight)
    );

    body.addEventListener('scroll',()=>{
      this.scrollTop=body.scrollTop;
    },{passive:true});

    this.startLiveRefresh();
  }
};