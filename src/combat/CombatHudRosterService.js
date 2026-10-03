

const CombatHudRosterService=Object.freeze({
  rows:new Map(),
  activePids:new Set(),
  beginFrame(){
    this.activePids.clear();
  },
  markActive(pid){
    this.activePids.add(pid);
  },
  containerFor(entity){
    const local=Training.player;

    if(
      Training.sessionMode==='online'&&
      local&&
      entity&&
      entity!==local&&
      local.teamId&&
      entity.teamId===local.teamId
    ){
      return document.getElementById(
        'ally-health-stack'
      );
    }

    return document.getElementById(
      'remote-health-stack'
    );
  },
  label(entity,pid=''){
    if(!entity)return '';

    return WorldNamePresentationService.label(entity);
  },
  ensure(pid,entity=null){
    let entry=this.rows.get(pid);
    const stack=this.containerFor(entity);
    if(!stack)return null;

    if(entry?.root?.isConnected){
      if(entry.root.parentElement!==stack){
        stack.appendChild(entry.root);
      }
      return entry;
    }

    const root=document.createElement('div');
    root.className='remote-health-row';
    root.dataset.pid=pid;

    const label=document.createElement('div');
    label.className='hplabel remote-health-label';

    const healthLine=document.createElement('div');
    healthLine.className='duels-health-primary-line';

    const hpBg=document.createElement('div');
    hpBg.className='bar-bg duels-main-health-bg';

    const trail=document.createElement('div');
    trail.className='bar-hp-trail remote';
    trail.style.width='100%';

    const hp=document.createElement('div');
    hp.className='bar-fill bar-hp-remote';
    hp.style.width='100%';

    hpBg.append(trail,hp);

    const wrenchBg=document.createElement('div');
    wrenchBg.className='bar-bg van-wrench-hud-bg';
    wrenchBg.hidden=true;

    const wrench=document.createElement('div');
    wrench.className='bar-fill van-wrench-hud-fill';
    wrench.style.width='100%';
    wrenchBg.appendChild(wrench);

    healthLine.append(hpBg,wrenchBg);

    const shieldBg=document.createElement('div');
    shieldBg.className='bar-bg shield-bg remote-shield-bg';
    shieldBg.style.display='none';

    const shield=document.createElement('div');
    shield.className='bar-fill bar-shield-remote';
    shield.style.width='0%';
    shieldBg.appendChild(shield);

    const stBg=document.createElement('div');
    stBg.className='bar-bg remote-stamina-bg';

    const st=document.createElement('div');
    st.className='bar-fill bar-st-remote';
    st.style.width='100%';
    stBg.appendChild(st);

    root.append(label,healthLine,stBg,shieldBg);
    stack.appendChild(root);

    entry={
      root,label,hp,trail,healthLine,wrenchBg,wrench,shieldBg,shield,st,
      hpWidth:NaN,
      wrenchWidth:NaN,
      wrenchVisible:null,
      shieldWidth:NaN,
      shieldVisible:null,
      stWidth:NaN,
      labelText:''
    };
    this.rows.set(pid,entry);
    return entry;
  },
  removeUnused(){
    for(const [pid,entry] of this.rows){
      if(this.activePids.has(pid))continue;
      entry.root?.remove();
      this.rows.delete(pid);
    }
  },
  update(entity,pid){
    const entry=this.ensure(
      pid,
      entity
    );
    if(!entry||!entity)return;

    const health=Math.max(
      0,
      Math.min(
        entity.maxHealth,
        entity.health
      )
    );
    const hpWidth=
      entity.maxHealth>0
        ?health/entity.maxHealth*100
        :0;
    const shield=ShieldService.current(entity);
    const shieldWidth=
      entity.maxHealth>0
        ?shield/entity.maxHealth*100
        :0;
    const stWidth=
      entity.maxStamina>0
        ?Math.max(
          0,
          Math.min(
            100,
            entity.stamina/entity.maxStamina*100
          )
        )
        :0;

    const labelText=
      `${this.label(entity,pid)}: ${Math.round(health)} / ${Math.round(entity.maxHealth)}`;

    if(entry.labelText!==labelText){
      entry.labelText=labelText;
      entry.label.textContent=labelText;
    }

    const teamColor=
      Training.sessionMode==='online'
        ?TeamColorPresentationService.colorForEntity(
          entity,
          entity.color||'#f44'
        )
        :(entity.color||'#f44');
    if(entry.teamColor!==teamColor){
      entry.teamColor=teamColor;
      entry.hp.style.background=teamColor;
    }

    if(entry.hpWidth!==hpWidth){
      HealthBarPresentationService.sync(
        entry.hp,
        entry.trail,
        hpWidth,
        entry,
        'hpWidth'
      );
    }

    const wrenchMax=Math.max(
      0,
      Number(entity.character?.wrenchDurability?.max)||0
    );
    const wrenchValue=
      entity.character?.wrenchDurability
        ?VanWrenchDurabilityPresentationService.value(entity)
        :0;
    const wrenchVisible=
      !!entity.character?.wrenchDurability&&
      wrenchMax>0;
    if(entry.wrenchVisible!==wrenchVisible){
      entry.wrenchVisible=wrenchVisible;
      entry.wrenchBg.hidden=!wrenchVisible;
      entry.root.classList.toggle(
        'has-van-wrench',
        wrenchVisible
      );
    }
    const wrenchWidth=
      wrenchMax>0
        ?Math.max(0,Math.min(100,wrenchValue/wrenchMax*100))
        :0;
    if(entry.wrenchWidth!==wrenchWidth){
      entry.wrenchWidth=wrenchWidth;
      entry.wrench.style.width=`${wrenchWidth}%`;
    }
    const wrenchColor=String(
      entity.character?.color||'#9fcf55'
    );
    if(entry.wrenchColor!==wrenchColor){
      entry.wrenchColor=wrenchColor;
      entry.wrench.style.background=wrenchColor;
    }

    const shieldVisible=shield>0;
    if(entry.shieldVisible!==shieldVisible){
      entry.shieldVisible=shieldVisible;
      entry.shieldBg.style.display=
        shieldVisible
          ?''
          :'none';
    }

    if(entry.shieldWidth!==shieldWidth){
      entry.shieldWidth=shieldWidth;
      entry.shield.style.width=`${shieldWidth}%`;
    }

    if(entry.stWidth!==stWidth){
      entry.stWidth=stWidth;
      entry.st.style.width=`${stWidth}%`;
    }

    RecipientAssignmentPresentationService.syncHud(
      entry.root,
      entity
    );
  },
  layout(){
    const hud=document.getElementById('hud');
    const local=
      document.getElementById(
        'local-team-health-stack'
      );
    const stack=
      document.getElementById(
        'remote-health-stack'
      );
    const mid=
      document.getElementById('hud-mid');

    if(!hud||!local||!stack||!mid)return;

    const hudRect=hud.getBoundingClientRect();
    const localRect=local.getBoundingClientRect();
    const stackRect=stack.getBoundingClientRect();

    if(
      localRect.width<=0||
      stackRect.width<=0
    ){
      mid.style.removeProperty('left');
      return;
    }

    const center=
      (
        localRect.right+
        stackRect.left
      )/2-hudRect.left;

    mid.style.left=`${center}px`;
  },
  clear(){
    for(const entry of this.rows.values()){
      entry.root?.remove();
    }
    this.rows.clear();
  }
});