const TRAINING_DEFAULT_SETTINGS=Object.freeze({dummyHp:'killable',botHp:'killable',infiniteHp:false,infiniteStam:false,hasMelee:false,hasRanged:false,meleeDamage:100,rangedDamage:100,meleeAttackSpeed:100,rangedAttackSpeed:100,showCooldown:true,showDps:true});


const Training={
  active:false,sessionMode:'training',onlineConfig:null,selectedCharacterId:null,characterSortMode:CharacterSortService.loadMode(),player:null,remotePlayer:null,remotePlayers:new Map(),dummy:null,dummies:[],dummySequence:0,bots:[],cameraState:{x:0,y:0},cameraFollowState:{x:0,y:0,initialized:false,lastAt:0},mouseWorldState:{x:0,y:0},aimAngleState:{frame:-1,mouseX:NaN,mouseY:NaN,playerX:NaN,playerY:NaN,value:0},canvas:null,ctx:null,hudRefs:null,hudRenderState:{},playerRespawnAt:0,respawning:false,spectating:false,lastDeathSourcePid:null,spectator:{
    x:0,
    y:0,
    speed:7,
    zoom:1,
    minZoom:.35,
    maxZoom:1.8,
    followPid:null,
    lastMoveX:0,
    lastMoveY:0,
    dashX:0,
    dashY:0,
    dashRemaining:0,
    dashDuration:170
  },koFreezeUntil:0,koFlashUntil:0,screenHitFlashUntil:0,keys:new Set(),mouse:{x:0,y:0},fx:[],stats:{totalDmg:0,comboHits:0,lastHit:0,dpsTimes:new Float64Array(256),dpsValues:new Float64Array(256),dpsHead:0,dpsCount:0,comboExecutions:new WeakSet()},settings:{...TRAINING_DEFAULT_SETTINGS},lastFrame:0,raf:0,loopFrame:null,
  clampSpectatorPoint(x,y){
    const halfW=GAME_DATA.canvas.width/2;
    const halfH=GAME_DATA.canvas.height/2;
    const worldW=WorldBoundsService.width();
    const worldH=WorldBoundsService.height();
    const overscanRatio=Math.max(0,Number(GAME_DATA.cameraFollow.edgeOverscanRatio)||0);
    const overscanX=GAME_DATA.canvas.width*overscanRatio;
    const overscanY=GAME_DATA.canvas.height*overscanRatio;

    const minX=
      worldW<=GAME_DATA.canvas.width
        ?worldW/2
        :halfW-overscanX;
    const maxX=
      worldW<=GAME_DATA.canvas.width
        ?worldW/2
        :worldW-halfW+overscanX;
    const minY=
      worldH<=GAME_DATA.canvas.height
        ?worldH/2
        :halfH-overscanY;
    const maxY=
      worldH<=GAME_DATA.canvas.height
        ?worldH/2
        :worldH-halfH+overscanY;

    this.spectator.x=Math.max(
      minX,
      Math.min(maxX,Number(x)||minX)
    );
    this.spectator.y=Math.max(
      minY,
      Math.min(maxY,Number(y)||minY)
    );
    return this.spectator;
  },
  moveSpectator(dx,dy,frameScale){
    const length=Math.hypot(dx,dy);
    if(length<=0)return false;

    const nx=dx/length;
    const ny=dy/length;
    this.spectator.lastMoveX=nx;
    this.spectator.lastMoveY=ny;

    // 자유 이동을 시작하면 플레이어 추적은 해제한다.
    this.spectator.followPid=null;

    this.clampSpectatorPoint(
      this.spectator.x+
        nx*
        this.spectator.speed*
        frameScale,
      this.spectator.y+
        ny*
        this.spectator.speed*
        frameScale
    );
    return true;
  },
  spectatorDash(direction=null){
    if(
      !this.spectating||
      this.spectator.followPid
    )return false;

    const movement=
      direction||
      TrainingInputVectorService.movement(
        this.keys
      );
    let dx=Number(movement?.x)||0;
    let dy=Number(movement?.y)||0;
    let length=Math.hypot(dx,dy);

    if(length<=.01){
      dx=Number(this.spectator.lastMoveX)||0;
      dy=Number(this.spectator.lastMoveY)||0;
      length=Math.hypot(dx,dy);
    }

    if(length<=.01)return false;

    const nx=dx/length;
    const ny=dy/length;

    this.spectator.lastMoveX=nx;
    this.spectator.lastMoveY=ny;
    this.spectator.followPid=null;

    // 순간이동하지 않고 짧은 고속 이동으로 처리한다.
    this.spectator.dashX=nx;
    this.spectator.dashY=ny;
    this.spectator.dashRemaining=
      GAME_DATA.dodge.dist;

    return true;
  },
  updateSpectatorDash(dt){
    const remaining=
      Math.max(
        0,
        Number(
          this.spectator.dashRemaining
        )||0
      );

    if(remaining<=0)return false;

    const duration=Math.max(
      1,
      Number(
        this.spectator.dashDuration
      )||170
    );
    const speed=
      GAME_DATA.dodge.dist/
      duration;

    const distance=Math.min(
      remaining,
      speed*Math.max(0,Number(dt)||0)
    );

    if(distance<=0)return false;

    const beforeX=this.spectator.x;
    const beforeY=this.spectator.y;

    this.clampSpectatorPoint(
      this.spectator.x+
        this.spectator.dashX*
        distance,
      this.spectator.y+
        this.spectator.dashY*
        distance
    );

    const moved=Math.hypot(
      this.spectator.x-beforeX,
      this.spectator.y-beforeY
    );

    this.spectator.dashRemaining=
      Math.max(
        0,
        remaining-moved
      );

    // 맵 경계에 막혔다면 남은 대시를 종료한다.
    if(
      moved<distance*.25
    ){
      this.spectator.dashRemaining=0;
    }

    return moved>0;
  },
  spectatorZoom(){
    return this.spectating
      ?Math.max(
        Number(this.spectator.minZoom)||.35,
        Math.min(
          Number(this.spectator.maxZoom)||1.8,
          Number(this.spectator.zoom)||1
        )
      )
      :1;
  },
  spectatorFollowTargetHidden(entity,now=performance.now()){
    return StealthPresentationService.hiddenFromDeadSpectator(
      this.player,
      entity,
      now
    );
  },
  spectatorFollowEntity({allowStealthHidden=false}={}){
    const pid=String(
      this.spectator.followPid||''
    );
    if(!pid)return null;

    const entity=
      OnlineParticipantEntityService
        .entity(pid);

    if(!entity?.alive||entity.hidden){
      this.spectator.followPid=null;
      return null;
    }

    if(
      !allowStealthHidden&&
      this.spectatorFollowTargetHidden(entity)
    )return null;

    return entity;
  },
  camera(){
    if(this.spectating){
      const follow=
        this.spectatorFollowEntity();
      if(follow){
        this.spectator.x=Number(follow.x)||0;
        this.spectator.y=Number(follow.y)||0;
      }
    }

    const aimOffset=this.spectating
      ?{x:0,y:0}
      :CameraAimOffsetService.offset(this.player);
    const focusX=
      this.spectating
        ?this.spectator.x
        :(this.player?.x||600)+(Number(aimOffset.x)||0);
    const focusY=
      this.spectating
        ?this.spectator.y
        :(this.player?.y||400)+(Number(aimOffset.y)||0);
    const out=this.cameraState;

    const overscanRatio=Math.max(0,Number(GAME_DATA.cameraFollow.edgeOverscanRatio)||0);
    const overscanX=GAME_DATA.canvas.width*overscanRatio;
    const overscanY=GAME_DATA.canvas.height*overscanRatio;
    const minCameraX=-overscanX;
    const maxCameraX=Math.max(minCameraX,WorldBoundsService.width()-GAME_DATA.canvas.width+overscanX);
    const minCameraY=-overscanY;
    const maxCameraY=Math.max(minCameraY,WorldBoundsService.height()-GAME_DATA.canvas.height+overscanY);
    const targetX=Math.max(
      minCameraX,
      Math.min(
        maxCameraX,
        focusX-GAME_DATA.canvas.width/2
      )
    );
    const targetY=Math.max(
      minCameraY,
      Math.min(
        maxCameraY,
        focusY-GAME_DATA.canvas.height/2
      )
    );

    // 관전 카메라는 기존대로 즉시 추적한다.
    if(this.spectating){
      out.x=targetX;
      out.y=targetY;
      this.cameraFollowState.initialized=false;
      return out;
    }

    const follow=this.cameraFollowState;
    const now=performance.now();
    const config=GAME_DATA.cameraFollow;
    const distance=Math.hypot(
      targetX-follow.x,
      targetY-follow.y
    );

    if(
      !follow.initialized||
      distance>config.snapDistance
    ){
      follow.x=targetX;
      follow.y=targetY;
      follow.initialized=true;
      follow.lastAt=now;
      out.x=targetX;
      out.y=targetY;
      return out;
    }

    const player=this.player;
    const mobilityActive=
      !!player&&
      (
        (
          typeof MovementAbilityService!=='undefined'&&
          MovementAbilityService.active(player)
        )||
        now<Number(player.dodgeUntil||0)
      );

    const movement=
      TrainingInputVectorService.movement(
        this.keys
      );
    const wasdActive=
      Math.hypot(
        Number(movement?.x)||0,
        Number(movement?.y)||0
      )>.0001;

    const responseMs=
      mobilityActive
        ?config.mobilityResponseMs
        :wasdActive
          ?config.wasdResponseMs
          :config.idleResponseMs;

    const elapsed=Math.max(
      0,
      Math.min(
        config.maxStepMs,
        now-follow.lastAt||
        GAME_DATA.frameMs
      )
    );
    follow.lastAt=now;

    const alpha=
      1-
      Math.exp(
        -elapsed/
        Math.max(1,responseMs)
      );

    follow.x+=
      (targetX-follow.x)*alpha;
    follow.y+=
      (targetY-follow.y)*alpha;

    out.x=follow.x;
    out.y=follow.y;
    return out;
  },
  renderAugHud(){
    const wrapper=
      document.getElementById('aug-wrapper');
    const local=
      document.getElementById('aug-hud');
    const peer=
      document.getElementById('peer-aug-hud');
    const divider=
      document.getElementById('aug-divider');

    if(!wrapper||!local||!peer||!divider)return;

    local.replaceChildren();
    peer.replaceChildren();
    divider.style.display='none';
    peer.style.display='none';

    if(
      !this.active||
      (
        !this.player?.character&&
        !this.onlineConfig?.spectatorOnly
      )
    ){
      wrapper.style.display='none';
      return;
    }

    const participantConfig=
      new Map(
        (this.onlineConfig?.participants||[])
          .map(item=>[item.pid,item])
      );

    const participantPids=
      this.sessionMode==='online'
        ?(
          OnlineDuelService.mode===
            MatchModeService.FFA||
          this.onlineConfig?.spectatorOnly
            ?[
              ...participantConfig.keys()
            ].sort((a,b)=>a.localeCompare(b))
            :[
              OnlineDuelService.localPid,
              ...OnlineDuelService.remotePids
            ].filter(Boolean)
        )
        :[OnlineDuelService.localPid||'local'];

    const resolveEntity=pid=>{
      if(this.sessionMode!=='online'){
        return this.player;
      }
      return OnlineParticipantEntityService.entity(pid);
    };

    for(const pid of participantPids){
      const entity=resolveEntity(pid);
      const character=
        entity?.character||
        GAME_DATA.characters[
          participantConfig.get(pid)?.characterId
        ];

      if(!character)continue;

      const row=document.createElement('div');
      row.className='aug-player-row';
      row.dataset.pid=pid;

      const isTraining=
        this.sessionMode!=='online';

      const profile=
        isTraining
          ?AccountState.current
          :(
            participantConfig.get(pid)?.profile||
            RoomService.members.get(pid)?.profile||
            {}
          );

      const label=document.createElement('div');
      label.className='aug-player-label';
      label.textContent=
        this.sessionMode==='online'
          ?PlayerDisplayNameService.resolve(
            pid,
            profile
          )
          :(
            AccountState.current?.isGuest
              ?'나'
              :String(
                AccountState.current?.displayName||
                '나'
              )
          );
      row.appendChild(label);

      const isLocal=
        isTraining||
        (
          pid===OnlineDuelService.localPid&&
          !this.onlineConfig?.spectatorOnly
        );


      const appendCharacterIcon=({
        characterId,
        slot=null,
        known=true,
        active=false,
        dead=false,
        health=0,
        stamina=0
      }={})=>{
        const slotCharacter=
          GAME_DATA.characters[characterId]||
          null;

        const charIcon=
          document.createElement('div');
        charIcon.className=
          `aug-icon training-char-icon${isLocal?'':' peer-char-icon'}${known?'':' unknown'}`;
        charIcon.dataset.pid=pid;

        if(known&&slotCharacter){
          charIcon.dataset.id=slotCharacter.id;
          charIcon.dataset.charTooltip='true';
          charIcon.style.setProperty(
            '--char-color',
            slotCharacter.color
          );

          CharacterRecordService.applyHudIconStyle(
            charIcon,
            slotCharacter.id,
            isLocal
              ?AccountState.current
              :profile
          );

          charIcon.textContent=
            String(slotCharacter.id||'?')
              .charAt(0)
              .toUpperCase();

          const tooltip=
            document.createElement('div');
          tooltip.className='char-tooltip';

          const recordPoints=isLocal
            ?CharacterRecordService.points(
              slotCharacter.id
            )
            :Math.max(
              0,
              Math.floor(
                Number(
                  profile.characterRecords?.[
                    slotCharacter.id
                  ]??
                  (
                    profile.mainCharacterId===
                      slotCharacter.id
                      ?profile.recordPoints
                      :0
                  )
                )||0
              )
            );

          tooltip.innerHTML=
            CharacterDescriptionService.html(
              slotCharacter,
              {recordPoints}
            );
          charIcon.appendChild(tooltip);
        }else{
          charIcon.textContent='?';
          charIcon.style.setProperty(
            '--char-color',
            '#70808d'
          );
        }


        row.appendChild(charIcon);
        return charIcon;
      };

      appendCharacterIcon({
        characterId:character.id,
        known:true
      });

      const augments=(entity?.augments||participantConfig.get(pid)?.augments||[]);

      for(const id of augments){
        const augment=
          AugmentDataService.get(id);
        if(!augment)continue;

        const augIcon=
          document.createElement('div');
        augIcon.className=
          AugmentHudStyleService.className(
            isLocal?'local':'peer'
          );
        augIcon.dataset.augmentId=augment.id;
        augIcon.dataset.pid=pid;
        augIcon.dataset.charTooltip='true';
        augIcon.textContent=augment.emoji;

        const augTooltip=
          document.createElement('div');
        augTooltip.className='char-tooltip';
        augTooltip.innerHTML=
          `<div style="font-weight:800;color:${AugmentRarityPresentation.color(augment.rarity)}">${augment.name}</div>`+
          `<div style="margin-top:5px;line-height:1.45;color:#aab">${augment.desc||''}</div>`;
        augIcon.appendChild(augTooltip);

        row.appendChild(augIcon);
      }

      local.appendChild(row);
    }

    wrapper.style.display=
      local.children.length
        ?'flex'
        :'none';
  },

  showSelect(mode='training'){
    this.sessionMode=mode==='online'?'online':'training';

    document.querySelectorAll('.screen').forEach(screen=>{
      screen.classList.add('hidden');
      screen.style.removeProperty('display');
    });

    const settingsPanel=document.getElementById('duels-display-settings-panel');
    if(settingsPanel)settingsPanel.hidden=true;

    const select=document.getElementById('scr-select');
    OnlineChatService.syncVisibility();
    this.selectedCharacterId=null;

    const status=document.getElementById('sel-status');
    if(status){
      status.textContent='';
      status.className='status';
    }

    const pvpWrap=document.getElementById('confirm-pvp-wrap');
    const trainingWrap=document.getElementById('confirm-training-wrap');
    if(pvpWrap)pvpWrap.style.display=this.sessionMode==='online'?'flex':'none';
    if(trainingWrap)trainingWrap.style.display=this.sessionMode==='training'?'flex':'none';

    const pvpConfirm=document.getElementById('confirm-btn');
    const randomButton=document.getElementById('random-btn');
    const trainingConfirm=document.getElementById('training-confirm-btn');
    const trainingBack=document.getElementById('training-select-back');

    if(trainingBack)trainingBack.style.removeProperty('display');

    if(pvpConfirm){
      pvpConfirm.disabled=false;
      pvpConfirm.textContent='선택 완료';
    }
    if(randomButton)randomButton.disabled=false;
    if(trainingConfirm){
      trainingConfirm.disabled=false;
      trainingConfirm.textContent='훈련장 입장';
    }

    select.scrollTop=0;
    select.scrollLeft=0;

    const grid=document.getElementById('char-grid');
    if(grid){
      grid.scrollTop=0;
      grid.scrollLeft=0;
      CharacterRecordService.resetGridViews(
        grid
      );
    }

    select.classList.remove('hidden');

    const sortSelect=
      document.getElementById(
        'character-sort-select'
      );
    if(sortSelect){
      sortSelect.value=this.characterSortMode;
    }

    this.renderCharacterCards();

    requestAnimationFrame(()=>{
      select.scrollTop=0;
      select.scrollLeft=0;

      CharacterCardPortraitService.animateEntrance(
        document.getElementById('char-grid')
      );
    });

    if(AccountState.current&&!AccountState.current.isGuest&&!CharacterRecordService.allRankingState.loadedAt&&!CharacterRecordService.allRankingState.promise){
      requestAnimationFrame(()=>{CharacterRecordService.loadAllRankings().catch(()=>{});});
    }
  },
  selectRandomCharacter(){
    const available=CharacterCardDataService.all().filter(
      character=>
        this.sessionMode!=='online'||
        !RoomService.isCharacterBanned(character.id)
    );
    if(!available.length)return false;

    const grid=document.getElementById('char-grid');
    const pick=available[Math.floor(Math.random()*available.length)];
    this.selectedCharacterId=pick.id;

    grid?.querySelectorAll('.char-card').forEach(card=>{
      card.classList.toggle('sel',card.dataset.id===pick.id);
    });

    const card=grid?.querySelector(`.char-card[data-id="${pick.id}"]`);
    card?.scrollIntoView({block:'nearest'});

    if(this.sessionMode==='online'){
      RoomService.submitCharacterPreview(
        pick.id
      );
    }

    return true;
  },
  renderCharacterCards(){
    const grid=document.getElementById('char-grid'); if(!grid)return false;
    const characters=CharacterSortService.sorted(
      this.characterSortMode,
      AccountState.current
    );
    const existing=[...grid.querySelectorAll(':scope > .char-card[data-id]')];
    const reusable=existing.length===characters.length&&existing.every((card,index)=>card.dataset.id===characters[index]?.id);
    if(reusable){
      CharacterRecordService.resetGridViews(
        grid
      );
      for(const card of existing){ const character=CharacterCardDataService.get(card.dataset.id); const banned=this.sessionMode==='online'&&RoomService.isCharacterBanned(card.dataset.id); card.classList.toggle('sel',!banned&&card.dataset.id===this.selectedCharacterId); card.classList.remove('selection-locked','character-banned'); if(character)CharacterRecordService.applyCardStyle(card,character.id,AccountState.current); CharacterCardInteractionService.bind(card,{account:AccountState.current}); CharacterBanPresentationService.apply(card,card.dataset.id); } CharacterRecordService.refreshTopPlayerBadges(grid); SelectionEntranceAnimationService.animate(grid,':scope > .char-card'); CharacterSelectionDeferredWorkService.schedulePortraits(grid);
      if(this.sessionMode==='online'){
        requestAnimationFrame(()=>
          OnlineDuelService
            .renderCharacterPreviews()
        );
      }
      return true;
    }
    CharacterSelectionDeferredWorkService.cancel(); grid.replaceChildren(); const fragment=document.createDocumentFragment();
    for(const char of characters){
      const card=CharacterCardViewService.create(
        char,
        {
          account:AccountState.current,
          selected:char.id===this.selectedCharacterId
        }
      );
      if(!card)continue;
      if(
        this.sessionMode==='online'
      ){
        CharacterBanPresentationService.apply(card,char.id);
      }
      card.addEventListener('click',()=>{
        if(
          card.classList.contains(
            'selection-locked'
          )||
          (
            this.sessionMode==='online'&&
            RoomService.isCharacterBanned(char.id)
          )
        )return;

        this.selectedCharacterId=char.id;
        for(
          const other of
          grid.querySelectorAll('.char-card')
        ){
          other.classList.toggle(
            'sel',
            other===card
          );
        }

        if(this.sessionMode==='online'){
          RoomService.submitCharacterPreview(
            char.id
          );
        }
      });
      fragment.appendChild(card);
    }
    grid.appendChild(fragment); CharacterRecordService.refreshTopPlayerBadges(grid); SelectionEntranceAnimationService.animate(grid,':scope > .char-card'); CharacterSelectionDeferredWorkService.schedulePortraits(grid);
    if(this.sessionMode==='online'){
      requestAnimationFrame(()=>
        OnlineDuelService
          .renderCharacterPreviews()
      );
    }
    return true;
  },
  startOnline(config){
    this.sessionMode='online';
    this.onlineConfig={...config};

    const localParticipant=
      (config?.participants||[])
        .find(
          participant=>
            participant.pid===config.localPid
        )||
      null;

    this.selectedCharacterId=localParticipant?.characterId||
      config?.localCharacterId||
      config?.participants?.[0]?.characterId||
      null;

    return this.start();
  },
  stopSessionOnly(){
    CameraFovService.reset();this.active=false;cancelAnimationFrame(this.raf);this.raf=0;this.closePanels();PointerHoldInputService.releaseAll();
    EntityService.clear();DynamicWallService.clearAll();ProjectileService.clear();SimulationScheduleService.clear();EffectSpawnService.clearAll();this.keys.clear();this.bots.length=0;this.dummies.length=0;
    this.player=null;
    this.remotePlayer=null;
    this.remotePlayers.clear();
    this.dummy=null;
    this.onlineConfig=null;
    const trainingHud=document.getElementById('training-hud');
    trainingHud?.replaceChildren();

    const trainingStats=document.getElementById('training-stats');
    trainingStats?.replaceChildren();

    GameHudVisibilityService.hideAll();
  },
  start(){
    const char=
      GAME_DATA.characters[
        this.selectedCharacterId
      ];
    if(
      !char&&
      !this.onlineConfig?.spectatorOnly
    ){
      UiStatusService.set(
        'sel-status',
        '캐릭터를 선택해주세요!',
        'err'
      );
      return;
    }

    this.active=true;
    if(this.sessionMode==='training'){
      DebugMapService.set('training-tilemap');
    }

    document.querySelectorAll('.screen').forEach(screen=>{
      screen.classList.add('hidden');
      screen.style.removeProperty('display');
    });

    GameHudVisibilityService.hideAll();
    GameHudVisibilityService.showGame();

    this.canvas=document.getElementById('gameCanvas');
    this.ctx=this.canvas?.getContext('2d')||null;
    this.hudRefs=null;
    this.hudRenderState={};

    this.setupSession();
    this.buildHud();
    this.renderAugHud();
    this.resize();
    this.lastFrame=performance.now();

    cancelAnimationFrame(this.raf);
    if(!this.loopFrame){
      this.loopFrame=this.loop.bind(this);
    }
    this.raf=requestAnimationFrame(this.loopFrame);
  },
  reset(){
    if(!this.active)return false;
    if(this.sessionMode==='training'){
      this.closePanels();
      this.settings={...TRAINING_DEFAULT_SETTINGS};
      DebugMapService.set('training-tilemap');
      CameraFovService.reset();
      this.cameraFollowState.initialized=false;
      this.hudRefs=null;
    }
    this.setupSession();
    if(this.sessionMode==='training')this.buildHud();
    return true;
  },
  setupOnlineSession(){
    PointerHoldInputService.releaseAll();
    EntityService.clear();
    DynamicWallService.clearAll();
    EntitySquashPresentationService.reset();
    ProjectileService.clear();
    SimulationScheduleService.clear();
    FieldDodgeRewardService.clear();
    EffectSpawnService.clearAll();
    this.keys.clear();
    this.bots.length=0;
    this.dummies.length=0;
    this.dummy=null;
    this.player=null;
    this.remotePlayer=null;
    this.remotePlayers.clear();

    this.playerRespawnAt=0;
    this.respawning=false;
    this.spectating=false;
    this.spectator.zoom=1;
    this.spectator.followPid=null;
    this.spectator.lastMoveX=0;
    this.spectator.lastMoveY=0;
    this.spectator.dashX=0;
    this.spectator.dashY=0;
    this.spectator.dashRemaining=0;
    this.lastDeathSourcePid=null;
    this.koFreezeUntil=0;
    this.koFlashUntil=0;
    this.screenHitFlashUntil=0;
    this.hudRenderState={};

    const config=this.onlineConfig;
    const participants=Array.isArray(
      config?.participants
    )
      ?config.participants
      :[];

    if(
      !config||
      !config.localPid||
      participants.length<2
    )return false;

    const spawnPids=
      config.mode===MatchModeService.FFA&&
      Array.isArray(config.spawnOrder)&&
      config.spawnOrder.length===participants.length
        ?config.spawnOrder
        :participants.map(item=>item.pid);

    const spawnMap=
      MatchSpawnService.pointMap(
        spawnPids,
        config.mode,
        Object.fromEntries(
          participants.map(item=>[
            item.pid,
            item.roomTeam||
            item.team
          ])
        )
      );

    for(const participant of participants){
      const character=
        GAME_DATA.characters[
          participant.characterId
        ];
      if(!character)continue;

      const spawn=
        spawnMap[participant.pid]||
        {
          x:WorldBoundsService.width()*.5,
          y:WorldBoundsService.height()*.5
        };

      const entity=EntityService.create({
        id:`duel.${participant.pid}`,
        kind:'player',
        ownerId:`duel.${participant.pid}`,
        teamId:participant.team,
        x:spawn.x,
        y:spawn.y,
        radius:character.radius,
        color:character.color,
        maxHealth:character.maxHealth,
        deathPolicy:{respawnMs:0},
        stamina:GAME_DATA.stamina.max,
        maxStamina:GAME_DATA.stamina.max,
        speed:character.speed,
        baseDamage:character.baseDamage,
        healthRegenPolicy:GAME_DATA.healthRegen,
        augments:[
          ...(participant.augments||[])
        ]
      });

      entity.character=character;
      entity.displayName=
        participant.profile?.displayName||
        participant.profile?.accountId||
        participant.pid;
      entity.baseX=spawn.x;
      entity.baseY=spawn.y;
      entity.counterReadyUntil=0;
      entity.counterReadyCharges=0;
      entity.dodgeUntil=0;
      entity.invincibleUntil=0;

      if(
        participant.pid===config.localPid&&
        !config.spectatorOnly
      ){
        this.player=entity;
      }else{
        entity.netTargetX=entity.x;
        entity.netTargetY=entity.y;
        entity._networkStateReady=false;
        this.remotePlayers.set(
          participant.pid,
          entity
        );
      }

      AugmentService.rebuild(entity);
    }

    if(
      !this.player&&
      !config.spectatorOnly
    )return false;

    if(config.spectatorOnly){
      this.spectating=true;
      this.respawning=false;
      this.playerRespawnAt=0;
      this.clampSpectatorPoint(
        WorldBoundsService.width()/2,
        WorldBoundsService.height()/2
      );
    }

    this.remotePlayer=
      this.remotePlayers.values().next().value||
      null;

    OnlineDuelService.remotePlayers=
      this.remotePlayers;
    OnlineDuelService.remotePlayer=
      this.remotePlayer;

    this.stats={
      totalDmg:0,
      comboHits:0,
      lastHit:0,
      dpsTimes:new Float64Array(256),
      dpsValues:new Float64Array(256),
      dpsHead:0,
      dpsCount:0,
      comboExecutions:new WeakSet()
    };

    this.renderAugHud();
    this.syncHud();
    return true;
  },
  setupSession(){
    CharacterCommandInputService.reset();
    if(this.sessionMode==='online')return this.setupOnlineSession();
    PointerHoldInputService.releaseAll();
    EntityService.clear();
    DynamicWallService.clearAll();
    EntitySquashPresentationService.reset();
    ProjectileService.clear();
    SimulationScheduleService.clear();
    FieldDodgeRewardService.clear();
    EffectSpawnService.clearAll();
    this.keys.clear();
    this.playerRespawnAt=0;
    this.respawning=false;
    this.spectating=false;
    this.spectator.zoom=1;
    this.spectator.followPid=null;
    this.spectator.lastMoveX=0;
    this.spectator.lastMoveY=0;
    this.spectator.dashX=0;
    this.spectator.dashY=0;
    this.spectator.dashRemaining=0;
    this.lastDeathSourcePid=null;
    this.koFreezeUntil=0;
    this.koFlashUntil=0;
    this.screenHitFlashUntil=0;
    this.hudRenderState={};

    const character=GAME_DATA.characters[this.selectedCharacterId];

    this.player=EntityService.create({
      id:'training.local',
      kind:'player',
      ownerId:'training.local',
      teamId:'training.local',
      x:WorldBoundsService.width()*.25,
      y:WorldBoundsService.height()/2,
      radius:character.radius,
      color:character.color,
      maxHealth:character.maxHealth,
      healthPolicy:{invulnerable:this.settings.infiniteHp},
      deathPolicy:{respawnMs:3000},
      stamina:GAME_DATA.stamina.max,
      maxStamina:GAME_DATA.stamina.max,
      speed:character.speed,
      baseDamage:character.baseDamage,
      healthRegenPolicy:GAME_DATA.healthRegen,
      augments:[]
    });

    this.player.character=character;
    AugmentService.rebuild(this.player);
    this.player.counterReadyUntil=0;
    this.player.counterReadyCharges=0;
    this.player.dodgeUntil=0;
    this.player.invincibleUntil=0;

    this.dummySequence=0;
    this.dummies.length=0;

    this.dummy=EntityService.create({
      id:'training.target',
      kind:'dummy',
      ownerId:'training.target',
      teamId:'training.target',
      x:WorldBoundsService.width()*.5,
      y:WorldBoundsService.height()/2,
      radius:20,
      color:'#888',
      maxHealth:10000,
      maxStamina:GAME_DATA.stamina.max,
      stamina:GAME_DATA.stamina.max,
      healthPolicy:{invulnerable:this.settings.dummyHp==='infinite'},
      deathPolicy:{respawnMs:3000}
    });

    this.dummies.push(this.dummy);

    this.stats={
      totalDmg:0,
      comboHits:0,
      lastHit:0,
      dpsTimes:new Float64Array(256),
      dpsValues:new Float64Array(256),
      dpsHead:0,
      dpsCount:0,
      comboExecutions:new WeakSet()
    };

    this.initBots();
    this.renderAugHud();
    this.syncHud();
  },
  exit(){
    CharacterCommandInputService.reset();
    CameraFovService.reset();
    this.active=false;
    cancelAnimationFrame(this.raf);
    this.raf=0;
    this.closePanels();
    CharacterTooltip.hide();

    EntityService.clear();
    DynamicWallService.clearAll();
    EntitySquashPresentationService.reset();
    ProjectileService.clear();
    SimulationScheduleService.clear();
    FieldDodgeRewardService.clear();
    EffectSpawnService.clearAll();
    this.keys.clear();
    this.bots.length=0;
    this.dummies.length=0;
    this.player=null;
    this.dummy=null;
    this.playerRespawnAt=0;
    this.respawning=false;
    this.spectating=false;
    this.lastDeathSourcePid=null;
    this.koFreezeUntil=0;
    this.koFlashUntil=0;
    this.screenHitFlashUntil=0;

    const trainingHud=document.getElementById('training-hud');
    trainingHud?.replaceChildren();
    if(trainingHud)trainingHud.style.display='none';

    const stats=document.getElementById('training-stats');
    if(stats){stats.replaceChildren();stats.style.display='none'}

    const augWrapper=document.getElementById('aug-wrapper');
    const augHud=document.getElementById('aug-hud');
    const peerAugHud=document.getElementById('peer-aug-hud');
    const divider=document.getElementById('aug-divider');
    augHud?.replaceChildren();
    peerAugHud?.replaceChildren();
    if(divider)divider.style.display='none';
    if(augWrapper)augWrapper.style.display='none';

    document.getElementById('game-wrapper').style.display='none';
    document.getElementById('hud').style.display='none';

    CombatHudRosterService.clear();
    this.hudRefs=null;
    this.hudRenderState={};

    const canvas=document.getElementById('gameCanvas');
    canvas?.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);

    document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
    const lobby=document.getElementById('scr-lobby');
    lobby.style.removeProperty('display');
    lobby.classList.remove('hidden');
  },
  initBots(){
    for(const bot of this.bots||[])EntityService.items.delete(bot.id);
    this.bots=[];

    for(const [type,enabled] of [
      ['melee',this.settings.hasMelee],
      ['ranged',this.settings.hasRanged]
    ]){
      if(enabled)this.bots.push(this.createBot(type));
    }
  },
  createBot(type){
    const config=GAME_DATA.trainingBots[type];
    if(!config)return null;

    const bot=EntityService.create({
      id:`training.bot.${type}`,
      kind:'trainingBot',
      ownerId:`training.bot.${type}`,
      teamId:'training.target',
      x:config.spawn.x,
      y:config.spawn.y,
      radius:20,
      color:config.color,
      maxHealth:2000,
      deathPolicy:{respawnMs:3000},
      stamina:2000,
      maxStamina:2000,
      speed:3,
      baseDamage:100
    });

    bot.botType=type;
    bot.phaseTimer=this.botCadenceMs(type,config.firstDelay);
    bot.attackIndex=0;
    HealthService.setInvulnerable(
      bot,
      this.settings.botHp==='infinite'
    );
    return bot;
  },
  botAttackSpeed(type){
    const key=type==='ranged'?'rangedAttackSpeed':'meleeAttackSpeed';
    const percent=Math.max(10,Math.min(2000,Number(this.settings[key])||100));
    return percent/100;
  },
  botCadenceMs(type,baseMs){
    return Math.max(1,Number(baseMs)||1)/this.botAttackSpeed(type);
  },
  trackDamage(event){
    if(this.sessionMode!=='training')return;
    const amount=Math.max(0,Number(event?.amount)||0);
    if(amount<=0)return;

    const now=performance.now();
    const stats=this.stats;
    stats.totalDmg+=amount;
    stats.lastHit=now;

    const index=(stats.dpsHead+stats.dpsCount)%stats.dpsTimes.length;
    stats.dpsTimes[index]=now;
    stats.dpsValues[index]=amount;

    if(stats.dpsCount<stats.dpsTimes.length){
      stats.dpsCount++;
    }else{
      stats.dpsHead=(stats.dpsHead+1)%stats.dpsTimes.length;
    }

    const execution=event?.execution;
    if(execution&&!stats.comboExecutions.has(execution)){
      stats.comboExecutions.add(execution);
      stats.comboHits++;
    }
  },
  currentDps(now=performance.now()){
    const stats=this.stats;
    let total=0;

    for(let offset=0;offset<stats.dpsCount;offset++){
      const index=(stats.dpsHead+offset)%stats.dpsTimes.length;
      if(now-stats.dpsTimes[index]<=1000)total+=stats.dpsValues[index];
    }

    if(now-stats.lastHit>2000){
      stats.comboHits=0;
      stats.comboExecutions=new WeakSet();
    }

    return total;
  },
  mouseWorld(cameraState=null){
    const canvas=this.canvas||
      document.getElementById('gameCanvas');
    const rect=canvas.getBoundingClientRect();
    const cam=
      cameraState||
      this.cameraState;
    const sx=canvas.width/Math.max(1,rect.width);
    const sy=canvas.height/Math.max(1,rect.height);
    const out=this.mouseWorldState;
    let cssX=this.mouse.x-rect.left;
    let cssY=this.mouse.y-rect.top;
    const insideCanvas=
      cssX>=0&&
      cssX<=rect.width&&
      cssY>=0&&
      cssY<=rect.height;

    if(!insideCanvas){
      // 레터박스/캔버스 밖 포인터는 바깥 좌표를 월드까지 연장하지 않는다.
      // 화면 중심→실제 포인터 방향을 유지한 채 플레이 화면 가장자리까지만 투영한다.
      const cx=rect.width/2;
      const cy=rect.height/2;
      const dx=cssX-cx;
      const dy=cssY-cy;
      const tx=
        Math.abs(dx)>.0001
          ?(dx>0?(rect.width-cx)/dx:(0-cx)/dx)
          :Infinity;
      const ty=
        Math.abs(dy)>.0001
          ?(dy>0?(rect.height-cy)/dy:(0-cy)/dy)
          :Infinity;
      const t=Math.max(0,Math.min(Math.abs(tx),Math.abs(ty)));
      cssX=Math.max(0,Math.min(rect.width,cx+dx*t));
      cssY=Math.max(0,Math.min(rect.height,cy+dy*t));
    }

    const canvasX=cssX*sx;
    const canvasY=cssY*sy;
    const zoom=this.spectatorZoom();
    const rawX=
      cam.x+
      canvas.width/2+
      (canvasX-canvas.width/2)/zoom;
    const rawY=
      cam.y+
      canvas.height/2+
      (canvasY-canvas.height/2)/zoom;
    const worldWidth=WorldBoundsService.width();
    const worldHeight=WorldBoundsService.height();
    const outsideWorld=
      rawX<0||
      rawX>worldWidth||
      rawY<0||
      rawY>worldHeight;

    if(outsideWorld&&this.player?.alive){
      // 화면 가장자리로 투영한 지점조차 월드 밖이면 그때만 현재 입력 앵커 기준으로
      // 같은 방향의 월드 경계까지만 제한한다. waypoint 무기는 현재 무기 위치가 앵커다.
      const pointerAnchor=WaypointProjectileService.pointerAnchor(this.player);
      const px=Number(pointerAnchor?.x??this.player.x)||0;
      const py=Number(pointerAnchor?.y??this.player.y)||0;
      const dx=rawX-px;
      const dy=rawY-py;
      const distance=Math.hypot(dx,dy);

      if(distance>1e-9){
        const angle=Math.atan2(dy,dx);
        const projectedDistance=
          WorldGeometryService.boundaryRayDistance(
            px,
            py,
            angle,
            distance,
            0
          );
        out.x=px+Math.cos(angle)*projectedDistance;
        out.y=py+Math.sin(angle)*projectedDistance;
        return out;
      }
    }

    if(outsideWorld){
      out.x=Math.max(0,Math.min(worldWidth,rawX));
      out.y=Math.max(0,Math.min(worldHeight,rawY));
      return out;
    }

    out.x=rawX;
    out.y=rawY;
    return out;
  },
  aimAngle(){
    const player=this.player;
    if(!player)return 0;

    const cache=this.aimAngleState;
    const frame=Number(this.lastFrame)||0;
    const mouseX=Number(this.mouse.x)||0;
    const mouseY=Number(this.mouse.y)||0;
    const playerX=Number(player.x)||0;
    const playerY=Number(player.y)||0;

    if(
      cache.frame===frame&&
      cache.mouseX===mouseX&&
      cache.mouseY===mouseY&&
      cache.playerX===playerX&&
      cache.playerY===playerY
    )return cache.value;

    const point=this.mouseWorld();
    cache.frame=frame;
    cache.mouseX=mouseX;
    cache.mouseY=mouseY;
    cache.playerX=playerX;
    cache.playerY=playerY;
    cache.value=Math.atan2(
      point.y-playerY,
      point.x-playerX
    );
    return cache.value;
  },
  spectatorViewablePids(){
    const result=[];

    for(const pid of RoomService.matchPids()){
      const entity=
        OnlineParticipantEntityService
          .entity(pid);

      if(
        !entity?.alive||
        entity.hidden
      )continue;

      result.push(pid);
    }

    return result;
  },
  spectatorFollowPlayer(pid){
    const targetPid=String(pid||'');
    const entity=targetPid?OnlineParticipantEntityService.entity(targetPid):null;
    if(!entity?.alive||entity.hidden)return false;
    this.spectator.followPid=targetPid;
    this.spectator.dashRemaining=0;
    this.clampSpectatorPoint(entity.x,entity.y);
    return true;
  },
  spectatorPickPlayer(){
    if(!this.spectating)return false;

    const pids=
      this.spectatorViewablePids();

    if(!pids.length){
      this.spectator.followPid=null;
      return false;
    }

    const current=
      pids.indexOf(
        this.spectator.followPid
      );
    const nextPid=
      pids[
        current<0
          ?0
          :(current+1)%pids.length
      ];
    const entity=
      OnlineParticipantEntityService
        .entity(nextPid);

    if(!entity)return false;

    return this.spectatorFollowPlayer(nextPid);
  },
  spectatorReleaseFollow(){
    if(!this.spectating)return false;
    this.spectator.followPid=null;
    return true;
  },
  spectatorAdjustZoom(deltaY){
    if(!this.spectating)return false;

    const direction=
      Math.sign(Number(deltaY)||0);
    if(!direction)return false;

    this.spectator.zoom=
      Math.max(
        Number(this.spectator.minZoom)||.35,
        Math.min(
          Number(this.spectator.maxZoom)||1.8,
          (Number(this.spectator.zoom)||1)*
            (direction>0?.90:1.10)
        )
      );
    return true;
  },
  use(slot,angle=null,inputOptions={}){
    const player=this.player;
    const ability=player?.character?.abilities?.[slot];
    if(!player||!ability)return false;
    if(this.sessionMode==='online'&&OnlineDuelService.roundResolving)return false;

    const resolvedAngle=angle!==null&&angle!==undefined&&Number.isFinite(Number(angle))?Number(angle):this.aimAngle();
    const mousePoint=this.mouseWorld();
    const targetPoint={
      x:Number(mousePoint.x)||0,
      y:Number(mousePoint.y)||0
    };
    const result={
      handled:false,
      executed:false
    };
    const activated=AbilityService.activate(
      player,
      ability,
      {
        event:'input.press',
        modeStep:Number(inputOptions.modeStep)<0?-1:1,
        inputSlot:slot,
        angle:resolvedAngle,
        resolveAim:()=>this.aimAngle(),
        targetPoint,
        result
      }
    );
    if(
      activated&&
      (
        result.executed===true||
        result.deferredExecution===true
      )&&
      this.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      OnlineDuelService.sendAbility(
        slot,
        resolvedAngle,
        result.executed===true
          ?result
          :{
            handled:result.handled===true,
            executed:false,
            attackId:'',
            abilityUseId:String(result.abilityUseId||''),
            skipAttackWindup:result.skipAttackWindup===true,
            targetPoint
          },
        targetPoint
      );
    }
    return activated;
  },
  holdInput(slot,angle=null){
    const player=this.player;
    const ability=player?.character?.abilities?.[slot];
    if(!player||!ability?.holdTrigger)return false;
    if(this.sessionMode==='online'&&OnlineDuelService.roundResolving)return false;

    const resolvedAngle=
      angle!==null&&
      angle!==undefined&&
      Number.isFinite(Number(angle))
        ?Number(angle)
        :this.aimAngle();
    const mousePoint=this.mouseWorld();
    const targetPoint={
      x:Number(mousePoint.x)||0,
      y:Number(mousePoint.y)||0
    };
    const result={
      handled:false,
      executed:false
    };

    const activated=AbilityService.activate(
      player,
      ability,
      {
        event:'input.hold',
        inputSlot:slot,
        angle:resolvedAngle,
        targetPoint,
        result
      }
    );

    if(
      activated&&
      result.executed===true&&
      this.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      OnlineDuelService.sendAbilityHold(
        slot,
        resolvedAngle,
        result,
        targetPoint
      );
    }

    return (
      activated&&
      result.executed===true
    );
  },

  releaseInput(slot,angle=null){
    const player=this.player;
    const ability=player?.character?.abilities?.[slot];
    if(!player||!ability?.releaseTrigger)return false;
    if(this.sessionMode==='online'&&OnlineDuelService.roundResolving)return false;

    const resolvedAngle=angle!==null&&angle!==undefined&&Number.isFinite(Number(angle))
      ?Number(angle)
      :this.aimAngle();
    const chargedReleaseData=ChargedAttackService.releaseData(
      player,
      ability,
      performance.now()
    );
    const dragReleaseData=DragPathInputService.releaseData(
      player,
      ability
    );
    const releaseData=
      chargedReleaseData||dragReleaseData
        ?{
          ...(chargedReleaseData||{}),
          ...(dragReleaseData||{})
        }
        :null;
    const result={
      handled:false,
      executed:false
    };
    const activated=AbilityService.activate(
      player,
      ability,
      {
        event:'input.release',
        inputSlot:slot,
        angle:resolvedAngle,
        ...(releaseData||{}),
        result
      }
    );
    if(activated&&this.sessionMode==='online'&&OnlineDuelService.active){
      OnlineDuelService.sendAbilityRelease(slot,resolvedAngle,releaseData,result);
    }
    return activated;
  },
  dodge(direction=null){
    const p=this.player;
    const now=performance.now();
    if(this.sessionMode==='online'&&OnlineDuelService.roundResolving){
      return false;
    }

    const dodgeGainMode=
      p?.character?.dodgeResourcePolicy?.mode==='gain';
    const dodgeTrigger={
      type:'trigger',
      event:'input.dodge',
      conditions:[
        {type:'entity.alive'},
        ...(
          dodgeGainMode
            ?[]
            :[
              {
                type:'resource.can-spend-stamina',
                value:GAME_DATA.dodge.cost
              }
            ]
        ),
        {type:'combat.dodge-ready'},
        {type:'combat.can-dodge'}
      ]
    };

    if(!TriggerModuleService.matches(
      dodgeTrigger,
      'input.dodge',
      {source:p,now}
    ))return false;

    const riding=
      ProjectileRideService.active(p);
    const movement=
      riding
        ?TrainingInputVectorService.zero
        :(direction||TrainingInputVectorService.movement(this.keys));
    const vector={
      x:Number(movement?.x)||0,
      y:Number(movement?.y)||0
    };

    const activated=EntityDodgeService.activate(
      p,
      vector,
      {
        spend:true,
        startJustDodge:true,
        emit:true,
        distanceOverride:
          riding
            ?0
            :null
      }
    );

    if(
      activated&&
      this.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      OnlineDuelService.sendDodge(vector);
    }

    return activated;
  },
  botAttack(bot,slot){
    const config=GAME_DATA.trainingBots[bot?.botType];
    const baseSpec=config?.attacks?.[slot];
    const botAttackTrigger={
      type:'trigger',
      event:'bot.attack',
      conditions:[
        {type:'entity.alive'},
        {type:'context.exists',key:'attack'}
      ]
    };
    if(!TriggerModuleService.matches(
      botAttackTrigger,
      'bot.attack',
      {source:bot,attack:baseSpec}
    ))return false;

    const damageScale=(bot.botType==='ranged'
      ?this.settings.rangedDamage
      :this.settings.meleeDamage)/100;

    const spec={
      ...baseSpec,
      damageRatio:baseSpec.damageRatio*damageScale
    };

    return AttackService.execute(bot,spec,Math.PI);
  },
  tickBots(dt,now,frameScale){
    for(const bot of this.bots){
      if(!bot.alive){
        TriggerDispatchService.execute(
          TRAINING_RUNTIME_TRIGGERS.entityRespawn,
          'entity.respawn',
          {source:bot,now},
          ()=>EntityRespawnService.revive(bot)
        );
        continue;
      }

      MovementService.updateForced(bot,now,frameScale);
      bot.phaseTimer-=dt;

      if(!TriggerModuleService.matches(
        TRAINING_RUNTIME_TRIGGERS.botCadence,
        'time.update',
        {source:bot,now}
      ))continue;

      const config=GAME_DATA.trainingBots[bot.botType];
      if(!config)continue;

      const slot=config.cycle[bot.attackIndex%config.cycle.length];

      bot.attackIndex++;
      bot.phaseTimer=this.botCadenceMs(bot.botType,config.intervals[slot]||1000);

      this.botAttack(bot,slot);
    }
  },
  updateWorldSimulation(dt,now,frameScale,skipAugmentEntity=null){
    Presentation.update(now);
    RecordDodgePresentationService.update(
      now
    );

    if(this.player?.alive){
      PositionMemoryService.updatePresentation(this.player,now);
      TemporalSnapshotService.updatePresentation(this.player,now);
      TimedActionStateService.updatePresentation(this.player,now);
    }

    for(const dummy of this.dummies){
      if(!dummy||!EntityService.items.has(dummy.id))continue;

      MovementService.updateForced(dummy,now,frameScale);

      TriggerDispatchService.execute(
        TRAINING_RUNTIME_TRIGGERS.entityRespawn,
        'entity.respawn',
        {source:dummy,now},
        ()=>EntityRespawnService.revive(dummy,{
          x:dummy===this.dummy
            ?WorldBoundsService.width()*.5
            :dummy.baseX,
          y:dummy===this.dummy
            ?WorldBoundsService.height()/2
            :dummy.baseY
        })
      );
    }

    this.tickBots(dt,now,frameScale);
    SimulationScheduleService.update(now);

    /*
      로컬 비플레이어 Entity의 저회 이동 구간은 이번 프레임 이동 전에 시작점을 고정한다.
      이후 소환 AI가 움직인 뒤 ProjectileService 충돌 판정 직전에 endFrame으로 종점을 기록한다.
    */
    for(const entity of EntityService.items.values()){
      if(
        entity!==this.player&&
        EntitySimulationAuthorityService.isLocal(entity)&&
        entity.justCheck
      ){
        JustDodgeService.beginFrame(entity);
      }
    }

    InstalledAreaFieldService.update(now);
    TimedThresholdBuffService.updateAuras(
      now,
      dt
    );
    SummonDeployService.update(now,frameScale);
    ClusterSummonService.update(now,frameScale);

    for(const entity of EntityService.items.values()){
      if(
        entity!==this.player&&
        EntitySimulationAuthorityService.isLocal(entity)&&
        entity.justCheck
      ){
        JustDodgeService.endFrame(entity);
      }
    }

    ProjectileRideService.updateControls(
      frameScale
    );
    ProjectileHomingTargetSyncService.updatePending();
    ProjectileService.update(frameScale);
    ProjectileRideService.syncAll();

    for(const entity of EntityService.items.values()){
      TemporalSnapshotService.update(entity,now);
      AugmentDodgeSequenceService.update(entity,now);
      WallOverlapAttackDeferService.update(entity,now);

      if(entity!==this.player&&MovementAbilityService.active(entity)){
        MovementAbilityService.update(entity,now,dt,null);
      }

      // 원격 반격은 선딜 방향만 추적한다.
      // 실제 공격 확정은 소유자가 보낸 duel-counter-resolve에서만 수행한다.
      if(
        entity!==this.player&&
        entity!==skipAugmentEntity&&
        entity.counterWindup
      ){
        CounterModuleService.trackAim(
          entity,
          ()=>Number(entity.counterWindup?.angle)||0
        );
      }

      if(!EntitySimulationAuthorityService.isLocal(entity)){
        OrbitInventoryService.update(entity,now);
        CookingService.update(entity);
        continue;
      }

      if(entity!==skipAugmentEntity){
        AugmentService.update(entity,now);
      }
      ProgressStateService.update(entity,now,dt);
      MultiClickAttackService.updateAimExit(
        entity,
        entity===this.player
          ?this.mouseWorld()
          :null,
        now
      );
      PassiveProgressRateService.update(entity,now);
      DodgeTrailFieldService.update(entity,now);
      ChannelAttackService.update(entity,now);
      SustainedBuffModeService.update(entity,now);
      OrbitInventoryService.update(entity,now);
      CookingService.update(entity);
      StackMarkService.update(entity,now);
      StealthModeService.update(entity,now);
      CCService.update(entity,now);
      ShieldService.update(entity,now);

      if(entity.character?.reactiveEquipment)ReactiveEquipmentService.update(entity,now);
      ProgressStateService.updateIdleRepair(entity,now);

      if(entity!==this.player)ChargedAttackService.update(entity,now);
      HealthRegenService.update(entity,now);

      if(entity!==this.player){
        JustDodgeService.expire(entity,now);
      }
    }
  },
  compactFx(now){
    EffectSpawnService.compact(now);
  },
  update(dt,now){
    this.lastFrameDt=dt;
    const frameScale=
      dt/GAME_DATA.frameMs;

    if(
      this.sessionMode==='online'&&
      this.onlineConfig?.spectatorOnly
    ){
      this.spectating=true;

      if(!this.spectator.followPid){
        this.updateSpectatorDash(dt);

        const movement=
          TrainingInputVectorService.movement(
            this.keys
          );
        const length=Math.hypot(
          movement.x,
          movement.y
        );

        if(length>0){
          this.moveSpectator(
            movement.x,
            movement.y,
            frameScale
          );
        }
      }

      OnlineDuelService.interpolateRemote(
        frameScale
      );
      this.updateWorldSimulation(
        dt,
        now,
        frameScale
      );
      this.compactFx(now);
      return;
    }

    const p=this.player;
    if(!p)return;

    if(now<this.koFreezeUntil){
      this.compactFx(now);
      this.syncHud();
      return;
    }

    if(this.sessionMode==='online'&&OnlineDuelService.roundResolving){
      OnlineDuelService.interpolateRemote(frameScale);
      this.compactFx(now);
      this.syncHud();
      return;
    }

    if(!p.alive&&this.sessionMode==='online'){
      if(!this.respawning){
        this.respawning=true;
        this.spectating=true;
        this.playerRespawnAt=0;
        this.clampSpectatorPoint(p.x,p.y);
      }

      if(!this.spectator.followPid){
        this.updateSpectatorDash(dt);

        const movement=
          TrainingInputVectorService.movement(
            this.keys
          );
        const length=Math.hypot(
          movement.x,
          movement.y
        );

        if(length>0){
          this.moveSpectator(
            movement.x,
            movement.y,
            frameScale
          );
        }
      }

      this.updateWorldSimulation(
        dt,
        now,
        frameScale
      );
      this.compactFx(now);
      OnlineDuelService.syncLocalState(
        p,
        now
      );
      OnlineDuelService.tickRound(now);
      this.syncHud();
      return;
    }

    if(!p.alive){
      if(!this.respawning){
        this.respawning=true;
        this.spectating=true;
        this.playerRespawnAt=p.respawnAt||0;
        this.clampSpectatorPoint(p.x,p.y);
      }

      if(!this.spectator.followPid){
        this.updateSpectatorDash(dt);

        const movement=TrainingInputVectorService.movement(this.keys);
        const dx=movement.x;
        const dy=movement.y;
        const length=Math.hypot(dx,dy);

        if(length>0){
          this.moveSpectator(
            dx,
            dy,
            frameScale
          );
        }
      }

      let playerRespawned=false;
      TriggerDispatchService.execute(
        TRAINING_RUNTIME_TRIGGERS.entityRespawn,
        'entity.respawn',
        {source:p,now},
        ()=>{
          EntityRespawnService.revive(p,{x:p.baseX,y:p.baseY});
          this.playerRespawnAt=0;
          this.respawning=false;
          this.spectating=false;
          this.syncHud();
          playerRespawned=true;
        }
      );
      if(playerRespawned)return;

      this.updateWorldSimulation(dt,now,frameScale);
      this.compactFx(now);
      this.syncHud();
      return;
    }

    this.spectating=false;

    AugmentService.update(p,now);
    CounterModuleService.update(p,now,()=>this.aimAngle());
    ChargedAttackService.update(p,now,()=>this.aimAngle());
    PointerHoldInputService.update(now);
    JustDodgeService.beginFrame(p);

    const movement=
      DragPathInputService.blocksMovement(p)||
      ProjectileRideService.active(p)
        ?TrainingInputVectorService.zero
        :TrainingInputVectorService.movement(this.keys);
    DodgeFollowupStateService.observeMovement(p,movement,now);
    if(!MovementAbilityService.update(p,now,dt,movement)){
      if(!MovementService.updateForced(p,now,frameScale)){
        if(movement.x||movement.y){
          // 일반 WASD 이동과 정밀 이동은 자연 체력 회복을 막지 않는다.
          // 공격/스킬/회피 등 적극 행동만 NaturalHealthRegenActivityService에 기록한다.
          MovementService.move(
            p,
            movement.x,
            movement.y,
            frameScale
          );
        }
      }
    }

    AttackPreviewService.updateAim(p,this.aimAngle(),now);
    AttackPreviewService.updateLive(
      p,
      ()=>this.aimAngle(),
      now
    );

    JustDodgeService.endFrame(p);
    JustDodgeService.expire(p,now);

    CommandFeatureService.update(p,dt,now);

    if((this.sessionMode==='training'&&this.settings.infiniteStam)||p.debugControl?.staminaInfinite){
      StaminaService.set(p,p.maxStamina,now);
    }else if(
      !CommandFeatureService.blocksNaturalStaminaRegen(p)&&
      !p.debugControl?.staminaFrozen&&
      ChargedAttackService.allowsStaminaRegen(p)&&
      !ProgressStateService.blocksStaminaRegen(p)&&
      !DragPathInputService.blocksStaminaRegen(p)&&
      !InstalledAreaFieldService.blocksStaminaRegen(p,now)&&
      now-p.lastStaminaUse>=GAME_DATA.stamina.regenDelay&&
      p.stamina<p.maxStamina
    ){
      const staminaStats=CombatStatsService.current(p,now);
      StaminaService.restore(
        p,
        p.maxStamina/GAME_DATA.stamina.regenTime
          *Math.max(0,staminaStats.staminaRegenMult)
          *dt,
        now
      );
    }

    this.updateWorldSimulation(
      dt,
      now,
      frameScale,
      p
    );

    this.compactFx(now);
    if(this.sessionMode==='online'&&OnlineDuelService.active){OnlineDuelService.syncLocalState(p,now);OnlineDuelService.tickRound(now)}
    this.syncHud();
  },
  draw(){
    const c=this.canvas||document.getElementById('gameCanvas');
    const ctx=this.ctx||(c?c.getContext('2d'):null);
    if(!c||!ctx)return;

    this.canvas=c;
    this.ctx=ctx;

    const cam=this.camera(),now=performance.now();
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#0d0d0f';ctx.fillRect(0,0,c.width,c.height);

    const shake=ScreenShakeService.offset(now);
    const spectatorZoom=this.spectatorZoom();
    const cameraZoom=
      CameraFovService.scale(now)*
      spectatorZoom;

    ctx.save();
    ctx.translate(c.width/2,c.height/2);
    ctx.scale(cameraZoom,cameraZoom);
    ctx.translate(-c.width/2,-c.height/2);
    ctx.translate(shake.x-cam.x,shake.y-cam.y);

    StaticWorldRenderer.draw(ctx);
    DynamicWallService.drawWorld(
      ctx,
      this.player
    );
    StationaryProjectileInteractionService.drawWorld(
      ctx
    );

    if(
      typeof DebugMapEditorService!=='undefined'&&
      DebugMapEditorService.active
    ){
      DebugMapEditorService.draw(ctx);
    }

    if(
      this.sessionMode==='online'&&
      this.player?.alive&&
      !this.player.hidden
    ){
      ctx.save();
      ctx.lineWidth=2;
      ctx.setLineDash([6,6]);
      ctx.lineDashOffset=
        -(now*.012)%12;
      ctx.lineCap='round';

      const allyColor=
        TeamColorPresentationService
          .colorForEntity(
            this.player,
            '#f4f7fb'
          );

      const allyRgb=
        ColorService.rgbString(
          allyColor,
          '244,247,251'
        );

      const linkZoom=
        Math.max(
          .001,
          spectatorZoom
        );
      const allyLinkStartDistance=
        Math.hypot(
          c.width/2,
          c.height/2
        )/
        linkZoom;
      const allyLinkFullDistance=180;

      for(
        const ally of
        EntityService.items.values()
      ){
        if(
          ally===this.player||
          ally.kind!=='player'||
          !ally.alive||
          ally.hidden||
          !this.player.teamId||
          ally.teamId!==this.player.teamId
        )continue;

        const distance=Math.hypot(
          ally.x-this.player.x,
          ally.y-this.player.y
        );

        if(
          distance>
          allyLinkStartDistance
        )continue;

        const denominator=Math.max(
          1,
          allyLinkStartDistance-
          allyLinkFullDistance
        );
        const fade=
          distance<=allyLinkFullDistance
            ?1
            :Math.max(
              0,
              Math.min(
                1,
                (
                  allyLinkStartDistance-
                  distance
                )/
                denominator
              )
            );

        const alpha=
          .015+
          (.13-.015)*fade;

        ctx.strokeStyle=
          `rgba(${allyRgb},${alpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.moveTo(
          this.player.x,
          this.player.y
        );
        ctx.lineTo(
          ally.x,
          ally.y
        );
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.restore();
    }

    for(const linkedSource of EntityService.items.values()){
      if(linkedSource?.alive&&!linkedSource.hidden){
        TimedTargetLinkPresentationService.draw(
          ctx,
          linkedSource,
          now
        );
      }
    }

    for(const summon of EntityService.items.values()){
      if(
        summon?.alive&&
        !summon.hidden&&
        summon.kind==='summon'
      ){
        SummonDeployService.drawRange(
          ctx,
          summon,
          now
        );
        SummonConnectionPresentationService
          .draw(
            ctx,
            summon
          );
      }
    }

    CircleFormationService.draw(
      ctx,
      this,
      now
    );

    /* 조준선 - 캐릭터보다 아래 레이어 */
    if(
      !this.spectating&&
      this.player?.alive&&
      !WaypointProjectileService.suppressesOwnerAimLine(this.player)
    ){
      const aim=this.mouseWorld(cam);
      ctx.beginPath();
      ctx.moveTo(
        this.player.x,
        this.player.y
      );
      ctx.lineTo(
        aim.x,
        aim.y
      );
      ctx.strokeStyle='rgba(255,80,80,0.2)';
      ctx.lineWidth=1.5;
      ctx.stroke();
    }

    // 레코드 회피 이팩트는 캐릭터 본체보다 먼저 그려 항상 아래 레이어에 둔다.
    // 실제 427 회피 도형/알파/수명 렌더 코드는 이 단일 경로에서만 처리한다.
    for(const f of this.fx){
      if(
        f?.type!=='recordDodgeTrail'||
        f.visible===false
      )continue;
        const progress=
          Math.max(
            0,
            Math.min(
              1,
              (
                now-
                Number(f.start)
              )/
              Math.max(
                1,
                Number(f.maxDur)||Number(f.dur)||1
              )
            )
          );

        // 427과 동일: 앞부분은 선명도를 유지하고 후반부에 smoothstep으로 빠르게 소멸.
        const fadeStart=
          f.tierId==='master'
            ?.48
            :f.tierId==='platinum'
              ?.42
              :.46;
        const fadeProgress=
          Math.max(
            0,
            Math.min(
              1,
              (
                progress-
                fadeStart
              )/
              (
                1-
                fadeStart
              )
            )
          );
        const alpha=
          1-
          (
            fadeProgress*
            fadeProgress*
            (
              3-
              2*fadeProgress
            )
          );
        const seed=
          Number(f.seed)||0;

        ctx.save();
        ctx.translate(
          f.x,
          f.y
        );

        if(
          f.tierId!=='diamond'&&
          f.tierId!=='platinum'&&
          f.tierId!=='master'
        ){
          ctx.rotate(
            (Number(f.angle)||0)+
            progress*.18
          );
        }

        if(f.tierId==='diamond'){
          const size=
            8+
            (f.index||0)*4+
            progress*8;

          ctx.rotate(
            Math.PI/4
          );
          ctx.shadowColor=
            `rgba(${f.primary||'104,186,255'},${alpha*.38})`;
          ctx.shadowBlur=6;
          ctx.strokeStyle=
            `rgba(${f.primary||'104,186,255'},${alpha*.82})`;
          ctx.lineWidth=1.6;
          ctx.strokeRect(
            -size/2,
            -size/2,
            size,
            size
          );

          ctx.shadowBlur=3;
          ctx.strokeStyle=
            `rgba(${f.secondary||'157,232,255'},${alpha*.42})`;
          ctx.lineWidth=1;
          ctx.strokeRect(
            -size*.28,
            -size*.28,
            size*.56,
            size*.56
          );
        }else if(f.tierId==='platinum'){
          const index=
            Number(f.index)||0;
          const variant=
            index%3;
          const mainColor=
            f.primary||
            '220,244,255';
          const subColor=
            f.secondary||
            '154,255,221';
          const localX=
            Math.sin(
              seed*2.41+
              index*1.37
            )*
            (5+index*2);
          const localY=
            Math.cos(
              seed*2.89+
              index*1.11
            )*
            (5+index*2);

          ctx.translate(
            localX,
            localY
          );

          if(variant===0){
            const arm=
              5.5+
              progress*3;

            ctx.shadowColor=
              `rgba(${mainColor},${alpha*.52})`;
            ctx.shadowBlur=7;
            ctx.strokeStyle=
              `rgba(${mainColor},${alpha*.76})`;
            ctx.lineWidth=1.25;
            ctx.beginPath();
            ctx.moveTo(-arm,0);
            ctx.lineTo(arm,0);
            ctx.moveTo(0,-arm);
            ctx.lineTo(0,arm);
            ctx.stroke();

            const dot=1.15;
            ctx.fillStyle=
              `rgba(${subColor},${alpha*.72})`;
            ctx.fillRect(
              -dot/2,
              -dot/2,
              dot,
              dot
            );
          }else if(variant===1){
            const base=
              1.4+
              progress*.4;

            ctx.shadowColor=
              `rgba(${subColor},${alpha*.42})`;
            ctx.shadowBlur=5;

            for(let sub=0;sub<2;sub++){
              const offsetX=
                (sub-.5)*3.6;
              const offsetY=
                Math.sin(
                  seed*1.7+
                  sub*1.9
                )*2;
              const size=
                base+
                (
                  sub===1
                    ?.35
                    :0
                );
              const color=
                sub%2===0
                  ?mainColor
                  :subColor;

              ctx.fillStyle=
                `rgba(${color},${alpha*(sub===1?.70:.52)})`;
              ctx.fillRect(
                offsetX-size/2,
                offsetY-size/2,
                size,
                size
              );
            }
          }else{
            const outer=
              5.8+
              progress*3.2;
            const inner=
              1.35+
              progress*.45;

            ctx.shadowColor=
              `rgba(${mainColor},${alpha*.56})`;
            ctx.shadowBlur=8;
            ctx.fillStyle=
              `rgba(${mainColor},${alpha*.70})`;
            ctx.beginPath();
            ctx.moveTo(0,-outer);
            ctx.lineTo(inner,-inner);
            ctx.lineTo(outer,0);
            ctx.lineTo(inner,inner);
            ctx.lineTo(0,outer);
            ctx.lineTo(-inner,inner);
            ctx.lineTo(-outer,0);
            ctx.lineTo(-inner,-inner);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle=
              `rgba(${subColor},${alpha*.58})`;
            ctx.fillRect(
              -.75,
              -.75,
              1.5,
              1.5
            );
          }
        }else{
          // 427 실제 마스터: 노랑/보라/주황 팔레트의 육각형 홀로그램.
          const index=
            Number(f.index)||0;
          const burstType=
            f.burstType||
            'travel';
          const sizeBias=
            Math.max(
              0,
              Math.min(
                1,
                Number(f.sizeBias)||.4
              )
            );

          let size;

          if(burstType==='travel'){
            size=
              8+
              sizeBias*8+
              progress*2.5;
          }else{
            size=
              9+
              sizeBias*11+
              progress*3;
          }

          size=
            Math.min(
              size,
              23
            )*
            Math.max(
              1,
              Number(f.sizeScale)||1
            );

          const palette=[
            f.secondary||'168,108,255',
            f.primary||'255,227,79',
            f.accent||'255,157,56'
          ];
          const paletteOffset=
            Math.abs(
              Math.floor(
                (Number(f.seed)||0)*10
              )
            )%
            palette.length;
          const color=
            palette[
              (
                index+
                paletteOffset
              )%
              palette.length
            ];
          const isMain=
            burstType!=='travel'&&
            index===0;

          const glowAlpha=
            isMain
              ?alpha*.52
              :alpha*
                (
                  burstType==='travel'
                    ?.34
                    :.30
                );
          const edgeAlpha=
            isMain
              ?alpha*.78
              :alpha*
                (
                  burstType==='travel'
                    ?.58
                    :.54
                );

          const drawHex=radius=>{
            ctx.beginPath();
            for(let side=0;side<6;side++){
              // 427 그대로: 기존 방향에서 90도 회전한 육각형.
              const hexAngle=
                side*
                Math.PI/3;
              const hx=
                Math.cos(hexAngle)*
                radius;
              const hy=
                Math.sin(hexAngle)*
                radius;

              if(side===0){
                ctx.moveTo(hx,hy);
              }else{
                ctx.lineTo(hx,hy);
              }
            }
            ctx.closePath();
          };

          ctx.shadowColor=
            `rgba(${color},${glowAlpha})`;
          ctx.shadowBlur=
            isMain
              ?8
              :burstType==='travel'
                ?5
                :6;
          ctx.strokeStyle=
            `rgba(${color},${edgeAlpha})`;
          ctx.lineWidth=
            isMain
              ?1.8
              :1.1;

          drawHex(
            size*.55
          );
          ctx.stroke();

          if(isMain){
            ctx.fillStyle=
              `rgba(${color},${alpha*.08})`;
            drawHex(
              size*.55
            );
            ctx.fill();

            ctx.shadowBlur=4;
            ctx.strokeStyle=
              `rgba(${f.primary||'255,227,79'},${alpha*.28})`;
            ctx.lineWidth=.8;
            drawHex(
              size*.32
            );
            ctx.stroke();
          }else if(
            (
              burstType!=='travel'&&
              index===1
            )||
            (
              burstType==='travel'&&
              index===0
            )
          ){
            ctx.fillStyle=
              `rgba(${color},${alpha*.045})`;
            drawHex(
              size*.55
            );
            ctx.fill();
          }

          if(index>=2){
            const pixel=1.1;
            ctx.shadowBlur=2;
            ctx.fillStyle=
              `rgba(${f.primary||'255,227,79'},${alpha*.40})`;
            ctx.fillRect(
              size*.62,
              -pixel/2,
              pixel,
              pixel
            );
          }
        }

        ctx.restore();

    }

    for(const f of this.fx){
      if(
        f?.type!=='areaCircle'||
        String(f.renderLayer||'default')!==
          'below-entities'||
        f.visible===false||
        !EffectPresentationVisibilityService.visible(f)
      )continue;

      AreaCircleEffectPresentationService.draw(
        ctx,
        f,
        now
      );
    }

    WaypointProjectileService.drawPath(ctx,this.player);
    for(const b of ProjectileService.items){
      const visual=ProjectileVisualPositionService.sample(b);
      const maxRange=
        Number.isFinite(Number(b.targetDistance))&&Number(b.targetDistance)>0
          ?Number(b.targetDistance)
          :Math.max(
            1,
            Number(b.maxTravelDistance)||
            Number(b.attack?.range)||
            1
          );
      const fadeStartTravel=
        Math.max(
          0,
          Number(b.fadeResetTravel)||0
        );
      const travelRatio=Math.max(
        0,
        Math.min(
          1,
          Math.max(
            0,
            (Number(b.travel)||0)-fadeStartTravel
          )/
          Math.max(
            1,
            maxRange-fadeStartTravel
          )
        )
      );
      const knockbackColorModule=
        b.projectile?.knockbackActiveColor
          ?(b.attack?.modules||[]).find(module=>
            AttackModuleService.type(module)==='movement.knockback'&&
            Number.isFinite(Number(module.maxProjectileTravelRatio))
          )||null
          :null;
      const projectileRenderRgb=
        knockbackColorModule&&
        travelRatio<=Math.max(
          0,
          Math.min(
            1,
            Number(knockbackColorModule.maxProjectileTravelRatio)||0
          )
        )
          ?ColorService.rgbString(
            b.projectile.knockbackActiveColor,
            b.renderRgb
          )
          :b.renderRgb;
      const rangeFade=travelRatio<AttackVisualStyle.fadeStart
        ?1
        :Math.max(0,1-(travelRatio-AttackVisualStyle.fadeStart)/(1-AttackVisualStyle.fadeStart));
      const alpha=
        (b.persistent?.88:rangeFade)*
        visual.alpha;

      const style=b.renderStyle;

      const detectionRange=
        Number(b.homing?.sourceDetectionRange);
      const detectionPresentation=
        b.homing?.detectionPresentation||null;
      if(
        Number.isFinite(detectionRange)&&
        detectionRange>0&&
        detectionPresentation&&
        b.source?.alive&&
        b.behavior?.returning?.phase!=='returning'&&
        (
          detectionPresentation.ownerOnly!==true||
          b.source===this.player
        )
      ){
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          Number(b.source.x)||0,
          Number(b.source.y)||0,
          detectionRange,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=
          `rgba(${b.renderRgb},${Math.max(
            0,
            Math.min(
              1,
              Number(detectionPresentation.alpha)||.4
            )
          )})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(detectionPresentation.lineWidth)||2
          );
        ctx.setLineDash(
          Array.isArray(detectionPresentation.dash)
            ?detectionPresentation.dash
            :[10,10]
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      const sourceRangeLimit=
        b.sourceRangeLimit;
      const sourceRangePresentation=
        sourceRangeLimit?.presentation||null;
      if(
        sourceRangeLimit&&
        sourceRangePresentation&&
        Number(sourceRangeLimit.range)>0&&
        b.source?.alive&&
        b.behavior?.returning?.phase!=='returning'&&
        (
          sourceRangePresentation.ownerOnly!==true||
          b.source===this.player
        )
      ){
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          Number(b.source.x)||0,
          Number(b.source.y)||0,
          Math.max(
            1,
            Number(sourceRangeLimit.range)||1
          ),
          0,
          Math.PI*2
        );
        ctx.strokeStyle=
          `rgba(${b.renderRgb},${Math.max(
            0,
            Math.min(
              1,
              Number(sourceRangePresentation.alpha)||.4
            )
          )})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(
              sourceRangePresentation.lineWidth
            )||2
          );
        ctx.setLineDash(
          Array.isArray(
            sourceRangePresentation.dash
          )
            ?sourceRangePresentation.dash
            :[10,10]
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      if(style?.kind==='projectile-style'&&style?.type==='rocket'){
        const radius=
          Math.max(
            1,
            Number(style.radius)||
            Number(b.radius)||
            18
          )*
          visual.scale;
        const direction=
          Number.isFinite(Number(visual.angle))
            ?Number(visual.angle)
            :Math.atan2(
              Number(visual.vy)||0,
              Number(visual.vx)||0
            );
        const dx=Math.cos(direction);
        const dy=Math.sin(direction);
        const trailLength=Math.max(
          0,
          Number(style.trailLength)||25
        );
        const tx=visual.x-dx*trailLength;
        const ty=visual.y-dy*trailLength;

        ctx.save();

        ctx.beginPath();
        ctx.arc(
          visual.x,
          visual.y,
          radius,
          0,
          Math.PI*2
        );
        ctx.fillStyle=
          `rgba(${ColorService.rgbString(style.fillColor,'255,140,0')},${alpha})`;
        ctx.strokeStyle=
          `rgba(${ColorService.rgbString(style.strokeColor,'255,220,0')},${alpha})`;
        ctx.lineWidth=
          Math.max(
            1,
            Number(style.strokeWidth)||2.5
          );
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.fill();
        ctx.stroke();

        const gradient=
          ctx.createLinearGradient(
            visual.x,
            visual.y,
            tx,
            ty
          );
        gradient.addColorStop(
          0,
          `rgba(${ColorService.rgbString(style.trailStart,'255,180,0')},${alpha*.8})`
        );
        gradient.addColorStop(
          1,
          `rgba(${ColorService.rgbString(style.trailEnd,'255,80,0')},0)`
        );
        ctx.beginPath();
        ctx.moveTo(visual.x,visual.y);
        ctx.lineTo(tx,ty);
        ctx.strokeStyle=gradient;
        ctx.lineWidth=
          Math.max(
            1,
            Number(style.trailWidth)||6
          );
        ctx.stroke();

        ctx.restore();
        continue;
      }

      if(
        style?.kind==='projectile-style'&&
        style?.type==='laser-bolt'
      ){
        const direction=
          Number.isFinite(Number(visual.angle))
            ?Number(visual.angle)
            :Math.atan2(
              Number(visual.vy)||0,
              Number(visual.vx)||0
            );
        const dx=Math.cos(direction);
        const dy=Math.sin(direction);
        const nx=-dy;
        const ny=dx;
        const baseRadius=Math.max(
          1,
          Number(style.baseRadius)||8
        );
        const scale=
          (
            Math.max(1,Number(b.radius)||1)/
            baseRadius
          )*
          visual.scale;
        const traveled=
          Math.max(
            0,
            Number(b.travel)||
            Number(b.traveled)||
            0
          );
        const length=
          Math.min(
            34,
            traveled+
            Math.max(1,Number(b.radius)||1)
          );
        const tailX=
          visual.x-dx*length;
        const tailY=
          visual.y-dy*length;

        const outerRgb=
          ColorService.rgbString(
            style.outerColor,
            b.renderRgb
          );
        const coreRgb=
          ColorService.rgbString(
            style.coreColor,
            b.renderRgb
          );
        const centerRgb=
          ColorService.rgbString(
            style.centerColor,
            '255,255,255'
          );

        ctx.save();
        ctx.globalAlpha=alpha;
        ctx.lineCap='round';
        ctx.lineJoin='round';

        // 일반 투사체 수준의 단순한 2중 꼬리.
        ctx.beginPath();
        ctx.moveTo(tailX,tailY);
        ctx.lineTo(visual.x,visual.y);
        ctx.strokeStyle=
          `rgba(${outerRgb},.26)`;
        ctx.lineWidth=14*scale;
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tailX,tailY);
        ctx.lineTo(visual.x,visual.y);
        ctx.strokeStyle=
          `rgba(${coreRgb},.88)`;
        ctx.lineWidth=6*scale;
        ctx.stroke();

        // 선단 도형 없이 꼬리/코어 선만 사용한다.

        ctx.restore();
        continue;
      }


      if(
        style?.kind==='projectile-style'&&
        style?.type==='tracer-bolt'
      ){
        const direction=
          Number.isFinite(Number(visual.angle))
            ?Number(visual.angle)
            :Math.atan2(
              Number(visual.vy)||0,
              Number(visual.vx)||0
            );
        const length=Math.max(
          1,
          Number(style.length)||13
        );
        const tx=
          visual.x-
          Math.cos(direction)*
          length;
        const ty=
          visual.y-
          Math.sin(direction)*
          length;

        ctx.save();
        ctx.globalAlpha=alpha;
        ctx.beginPath();
        ctx.moveTo(
          visual.x,
          visual.y
        );
        ctx.lineTo(
          tx,
          ty
        );
        ctx.strokeStyle=String(
          style.strokeColor||
          '#d946a8'
        );
        ctx.lineWidth=Math.max(
          1,
          Number(style.lineWidth)||3
        );
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          visual.x,
          visual.y,
          Math.max(
            1,
            Number(b.radius)||1
          )*
          visual.scale,
          0,
          Math.PI*2
        );
        ctx.fillStyle=String(
          style.coreColor||
          '#ffa0e6'
        );
        ctx.fill();
        ctx.restore();
        continue;
      }

      if(style?.kind==='weapon-projectile'&&style?.type==='wrench'){
        const radius=Math.max(4,Number(style.radius)||24)*visual.scale;
        const direction=
          Number.isFinite(Number(visual.angle))
            ?Number(visual.angle)
            :Math.atan2(Number(visual.vy)||0,Number(visual.vx)||0);
        WrenchShapeRenderService.draw(ctx,{
          x:visual.x,
          y:visual.y,
          angle:direction,
          radius,
          alpha,
          fillColor:style.fillColor,
          strokeColor:style.strokeColor,
          strokeWidth:Number(style.strokeWidth)||2.5,
          glow:Number(style.glow)||0,
          bodyRgb:b.renderRgb
        });
        continue;
      }

      if(style?.kind==='range-projectile'){
        const echoes=ProjectileVisualPositionService.afterimages(b,visual,style.afterimage,now);
        for(const echo of echoes){
          const life=Math.max(0,1-(now-echo.at)/Math.max(1,Number(style.afterimage?.duration)||200));
          if(now===echo.at)continue;
          ctx.save();
          ctx.beginPath();
          ctx.arc(echo.x,echo.y,Math.max(1,Number(b.radius)||1)*echo.scale,0,Math.PI*2);
          ctx.fillStyle=`rgba(${b.renderRgb},${alpha*life*Math.max(0,Number(style.afterimage?.alpha)||.18)})`;
          ctx.strokeStyle=`rgba(${b.renderRgb},${alpha*life*.25})`;
          ctx.lineWidth=Math.max(1,Number(style.strokeWidth)||3);
          ctx.fill();ctx.stroke();ctx.restore();
        }
        const radius=Math.max(1,Number(b.radius)||1)*visual.scale;
        const outerRgb=ColorService.rgbString(style.strokeColor,b.renderRgb);
        const innerRgb=ColorService.rgbString(style.innerColor,b.renderRgb);
        ctx.save();
        ctx.beginPath();
        ctx.arc(visual.x,visual.y,radius,0,Math.PI*2);
        ctx.fillStyle=`rgba(${b.renderRgb},${alpha*Math.max(0,Number(style.fillAlpha)||.20)})`;
        ctx.strokeStyle=`rgba(${outerRgb},${alpha*Math.max(0,Number(style.strokeAlpha)||.90)})`;
        ctx.lineWidth=Math.max(1,Number(style.strokeWidth)||3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(visual.x,visual.y,radius*Math.max(.05,Number(style.innerScale)||.55),0,Math.PI*2);
        ctx.strokeStyle=`rgba(${innerRgb},${alpha*Math.max(0,Number(style.innerAlpha)||.50)})`;
        ctx.lineWidth=Math.max(1,Number(style.innerStrokeWidth)||2);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(style?.kind==='weapon-projectile'&&style?.type==='anchor-cross'){
        const stationaryInteraction=
          b.stationaryArrival&&
          typeof StationaryProjectileInteractionService!=='undefined'
            ?StationaryProjectileInteractionService.interaction(b)
            :null;
        const stationaryNumbered=
          stationaryInteraction?.numbered===true&&
          b.source===this.player&&
          EntitySimulationAuthorityService.isLocal(b.source);

        const viewer=this.player;
        const allyAlpha=(
          viewer&&
          b.source&&
          viewer!==b.source&&
          RelationService.relation(viewer,b.source)==='ally'&&
          Number.isFinite(Number(style.allyAlpha))
        )
          ?Math.max(0,Math.min(1,Number(style.allyAlpha)))
          :1;
        const returnBaseAlpha=(
          b.behavior?.returning?.phase==='returning'
            ?Math.max(0,Number(style.returningAlpha)||.55)
            :1
        )*allyAlpha;
        const returningAlpha=
          returnBaseAlpha*alpha;
        const returningStrokeAlpha=
          returnBaseAlpha*
          Math.max(
            0,
            Math.min(
              1,
              alpha*
              (
                Number(visual.strokeAlpha)/
                Math.max(
                  .0001,
                  Number(visual.alpha)||1
                )
              )
            )
          );
        const pulseMin=Number(style.pulseMin)||.7;
        const pulseMax=Number(style.pulseMax)||1;
        const pulse=
          pulseMin+
          (pulseMax-pulseMin)*
          (.5+.5*Math.sin(now*(Number(style.pulseSpeed)||.014)));
        const radius=Math.max(1,Number(style.radius)||16);


        ctx.save();

        ctx.beginPath();
        ctx.arc(visual.x,visual.y,radius*visual.scale,0,Math.PI*2);
        ctx.fillStyle=`rgba(${b.renderRgb},${returningAlpha*(Number(style.fillAlpha)||.28)})`;
        ctx.strokeStyle=`rgba(${ColorService.rgbString(style.strokeColor,b.renderRgb)},${returningStrokeAlpha*pulse})`;
        ctx.lineWidth=Math.max(1,Number(style.strokeWidth)||3);
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.fill();
        ctx.stroke();

        if(!stationaryNumbered){
          const half=radius*.5;
          const paletteColor=AttackPresentationColorService.variant(b.source,b.attack,{presentation:style});
          const crossColor=ColorService.rgbString(ColorService.brighten(paletteColor||b.source?.character?.color||b.source?.color||b.renderRgb));
          ctx.strokeStyle=`rgba(${crossColor},${returningStrokeAlpha*.85})`;
          ctx.lineWidth=Math.max(.5,radius/6*visual.scale);

          ctx.beginPath();
          ctx.moveTo(visual.x-half*visual.scale,visual.y);
          ctx.lineTo(visual.x+half*visual.scale,visual.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(visual.x,visual.y-half*visual.scale);
          ctx.lineTo(visual.x,visual.y+half*visual.scale);
          ctx.stroke();
        }

        if(stationaryNumbered){
          const ordinal=
            StationaryProjectileInteractionService.ordinal(b);
          const numberRgb=ColorService.rgbString(
            style.innerColor,
            b.renderRgb
          );
          ctx.font='bold 16px Pretendard';
          ctx.textAlign='center';
          ctx.textBaseline='middle';
          ctx.lineJoin='round';
          ctx.lineWidth=4;
          ctx.strokeStyle='rgba(10,10,12,.88)';
          ctx.strokeText(
            String(Math.max(1,ordinal)),
            visual.x,
            visual.y+.25
          );
          ctx.fillStyle=`rgba(${numberRgb},${returningAlpha})`;
          ctx.fillText(
            String(Math.max(1,ordinal)),
            visual.x,
            visual.y+.25
          );
        }

        if(style.showLink!==false&&EntityService.owner(b.source)===this.player){
          ctx.beginPath();
          ctx.moveTo(b.source.x,b.source.y);
          ctx.lineTo(visual.x,visual.y);
          const linkAlpha=
            Number.isFinite(Number(style.linkAlpha))
              ?Math.max(0,Number(style.linkAlpha))
              :.2;
          ctx.strokeStyle=
            `rgba(${b.renderRgb},${returningAlpha*linkAlpha})`;
          ctx.lineWidth=Math.max(.5,Number(style.linkWidth)||1.5);
          ctx.setLineDash(Array.isArray(style.linkDash)?style.linkDash:[5,4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
        continue;
      }


      const execution=b.volley?.execution||null;
      const useTrap=style?.shape==='trap';
      const useDiamond=
        style?.shape==='diamond'||
        (
          AttackModuleService.pelletCount(b.attack)>1&&
          AttackModuleService.hasModule(
            b.attack,
            execution,
            'hit.once-per-execution'
          )
        );

      ctx.save();
      ctx.translate(visual.x,visual.y);
      ctx.scale(visual.scale,visual.scale);
      ctx.beginPath();

      if(useTrap){
        // 투사체 심볼이 아니라 설치될 덫 본체와 같은 단순 형상을 그대로 비행시킨다.
        const trapRadius=Math.max(18,Number(style?.radius)||b.radius*1.65);
        ctx.beginPath();
        ctx.arc(0,0,trapRadius,0,Math.PI*2);
        ctx.fillStyle=`rgba(${projectileRenderRgb},${alpha*.12})`;
        ctx.strokeStyle=`rgba(${projectileRenderRgb},${alpha*.95})`;
        ctx.lineWidth=2;
        ctx.setLineDash([4,4]);
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(0,0,trapRadius*.22,0,Math.PI*2);
        ctx.fillStyle=`rgba(${projectileRenderRgb},${alpha*.9})`;
        ctx.fill();
        ctx.strokeStyle=`rgba(${projectileRenderRgb},${alpha*.82})`;
        ctx.lineWidth=1.6;
        for(let i=0;i<4;i++){
          const a=Math.PI*.5*i;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a)*trapRadius*.48,Math.sin(a)*trapRadius*.48);
          ctx.lineTo(Math.cos(a)*trapRadius*.78,Math.sin(a)*trapRadius*.78);
          ctx.stroke();
        }
      }else if(useDiamond){
        ctx.rotate(
          Number.isFinite(Number(visual.angle))
            ?Number(visual.angle)
            :Math.atan2(
              Number(visual.vy)||0,
              Number(visual.vx)||0
            )
        );
        const projectileRadius=Math.max(2,b.radius)*AttackVisualStyle.projectileDiamondScale;
        ctx.moveTo(projectileRadius,0);
        ctx.lineTo(0,projectileRadius);
        ctx.lineTo(-projectileRadius,0);
        ctx.lineTo(0,-projectileRadius);
        ctx.closePath();

        const projectileStrokeAlpha=
          (b.persistent?.88:rangeFade)*
          Math.max(
            0,
            Math.min(
              1,
              Number(visual.strokeAlpha)||0
            )
          );
        ctx.fillStyle=`rgba(${projectileRenderRgb},${alpha*AttackVisualStyle.fillAlpha})`;
        ctx.strokeStyle=`rgba(${projectileRenderRgb},${projectileStrokeAlpha*AttackVisualStyle.strokeAlpha})`;
        ctx.lineWidth=AttackVisualStyle.strokeWidth;
        // 특수 투사체도 일반 투사체와 같은 원칙으로 본체 채움에는 glow를 적용하지 않고 외곽선에만 적용한다.
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.fill();
        ctx.stroke();
      }else{
        const circleMaxRange=
          Number.isFinite(Number(b.targetDistance))&&Number(b.targetDistance)>0
            ?Number(b.targetDistance)
            :Math.max(
              1,
              Number(b.maxTravelDistance)||
              Number(b.attack?.range)||
              1
            );
        const circleFadeStart=
          Math.max(
            0,
            Number(b.fadeResetTravel)||0
          );
        const circleBaseAlpha=b.persistent
          ?.88
          :Math.max(
            .18,
            1-
            Math.max(
              0,
              (Number(b.travel)||0)-circleFadeStart
            )/
            Math.max(
              1,
              circleMaxRange-circleFadeStart
            )
          );
        const circleAlpha=
          circleBaseAlpha*visual.alpha;
        const circleStrokeAlpha=
          circleBaseAlpha*
          Math.max(
            0,
            Math.min(
              1,
              Number(visual.strokeAlpha)||0
            )
          );

        ctx.arc(0,0,Math.max(2,b.radius),0,Math.PI*2);
        ctx.fillStyle=`rgba(${projectileRenderRgb},${circleAlpha})`;
        ctx.strokeStyle=`rgba(255,255,255,${circleStrokeAlpha*.32})`;
        ctx.lineWidth=1;
        TrainingWorldDrawService.drawProjectileOutlineGlow(ctx);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    for(const f of this.fx){
      if(f?.type==='recordDodgeTrail'||f?.type==='dmgNum'||f?.type==='gearCluster'||f?.type==='weaponImageEcho'||f?.type==='weaponImagePulse')continue;
      const progress=Math.max(0,Math.min(1,(now-f.start)/Math.max(1,f.dur)));
      if(
        f.visible===false||
        !EffectPresentationVisibilityService.visible(f)
      ){
        continue;
      }
      if(f.animationState&&(!f.type||f.type==='effectShape')){
        const alpha=Math.max(0,1-progress);
        const scale=Number(f.scale)||1;
        ctx.save();
        ctx.translate(Number(f.x)||0,Number(f.y)||0);
        ctx.rotate(Number(f.angle)||0);
        ctx.globalAlpha=alpha;
        if(String(f.shape||'circle')==='rect'){
          const w=Math.max(1,Number(f.width)||24)*scale;
          const h=Math.max(1,Number(f.height)||24)*scale;
          ctx.fillStyle=f.fillStyle||f.color||'#fff';
          ctx.fillRect(-w/2,-h/2,w,h);
        }else{
          ctx.beginPath();
          ctx.arc(0,0,Math.max(1,Number(f.radius)||12)*scale,0,Math.PI*2);
          ctx.fillStyle=f.fillStyle||f.color||'#fff';
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      if(f.type==='temporalRewind'){
        const a=Math.max(0,1-progress);
        const ring=ColorService.rgbString(f.ringColor||f.color,'180,210,255');
        const fill=ColorService.rgbString(f.fillColor,'69,122,255');
        const stroke=ColorService.rgbString(f.strokeColor,'130,170,255');
        const sx=Number(f.x)||0,sy=Number(f.y)||0,tx=Number(f.tx)||sx,ty=Number(f.ty)||sy;
        const rr=28*progress;
        ctx.beginPath();ctx.arc(sx,sy,30+rr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${ring},${a*.9})`;ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(tx,ty,Math.max(7,35-rr),0,Math.PI*2);
        ctx.fillStyle=`rgba(${fill},${a*.30})`;ctx.fill();
        ctx.strokeStyle=`rgba(${stroke},${a})`;ctx.lineWidth=3;ctx.stroke();
        continue;
      }

      if(f.type==='arcSweep'){
        const a=Math.max(0,1-progress);
        const rgb=ColorService.rgbString(
          f.color,
          '200,216,240'
        );
        const range=Math.max(0,Number(f.range)||0);
        const halfAngle=Math.max(0,Number(f.halfAngle)||0);
        const angle=Number(f.angle)||0;
        const animateSweep=f.animateSweep===true;
        const counterclockwise=
          String(f.sweepDirection||'clockwise')===
          'counterclockwise';

        const hasArcClip=
          animateSweep&&
          Array.isArray(f.points)&&
          f.points.length>=3;
        const applyArcClip=()=>{
          if(!hasArcClip)return;
          ctx.beginPath();
          ctx.moveTo(
            Number(f.points[0].x)||0,
            Number(f.points[0].y)||0
          );
          for(let index=1;index<f.points.length;index++){
            ctx.lineTo(
              Number(f.points[index].x)||0,
              Number(f.points[index].y)||0
            );
          }
          ctx.closePath();
          ctx.clip();
        };

        ctx.save();
        applyArcClip();
        ctx.beginPath();

        /*
          clipToAttackArea가 전달한 실제 벽 차단 폴리곤이 있으면
          렌더러도 그 geometry를 그대로 사용한다.
        */
        if(animateSweep){
          const sweepProgress=Math.min(
            1,
            progress*
            Math.max(.001,Number(f.sweepSpeed)||1)
          );
          const startAngle=counterclockwise
            ?angle+halfAngle
            :angle-halfAngle;
          const endAngle=counterclockwise
            ?startAngle-halfAngle*2*sweepProgress
            :startAngle+halfAngle*2*sweepProgress;
          ctx.moveTo(f.x,f.y);
          ctx.arc(
            f.x,
            f.y,
            range,
            startAngle,
            endAngle,
            counterclockwise
          );
          ctx.closePath();
        }else if(
          Array.isArray(f.points)&&
          f.points.length>=3
        ){
          ctx.moveTo(
            Number(f.points[0].x)||0,
            Number(f.points[0].y)||0
          );
          for(
            let index=1;
            index<f.points.length;
            index++
          ){
            ctx.lineTo(
              Number(f.points[index].x)||0,
              Number(f.points[index].y)||0
            );
          }
          ctx.closePath();
        }else{
          ctx.moveTo(f.x,f.y);
          ctx.arc(
            f.x,
            f.y,
            range,
            angle-halfAngle,
            angle+halfAngle
          );
          ctx.closePath();
        }

        ctx.fillStyle=
          `rgba(${rgb},${a*Math.max(0,Math.min(1,(Number.isFinite(Number(f.fillAlpha))?Number(f.fillAlpha):.25)))})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${rgb},${a*Math.max(0,Math.min(1,(Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):.85)))})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||1.5);
        if(!hasArcClip)ctx.stroke();

        if(animateSweep&&f.edgeLine===true){
          const sweepProgress=Math.min(
            1,
            progress*
            Math.max(.001,Number(f.sweepSpeed)||1)
          );
          const startAngle=counterclockwise
            ?angle+halfAngle
            :angle-halfAngle;
          const edgeAngle=counterclockwise
            ?startAngle-halfAngle*2*sweepProgress
            :startAngle+halfAngle*2*sweepProgress;
          ctx.beginPath();
          ctx.moveTo(f.x,f.y);
          ctx.lineTo(
            f.x+Math.cos(edgeAngle)*range,
            f.y+Math.sin(edgeAngle)*range
          );
          ctx.strokeStyle=
            `rgba(${ColorService.rgbString(f.edgeColor,'255,255,255')},${a*Math.max(0,Math.min(1,Number(f.edgeAlpha)||.75))})`;
          ctx.lineWidth=Math.max(.5,Number(f.edgeLineWidth)||2.5);
          ctx.stroke();
        }

        if(
          f.endChord===true&&
          Array.isArray(f.points)&&
          f.points.length>=3
        ){
          const firstArc=f.points[1];
          const lastArc=f.points[f.points.length-1];
          ctx.beginPath();
          ctx.moveTo(firstArc.x,firstArc.y);
          ctx.lineTo(lastArc.x,lastArc.y);
          ctx.strokeStyle=
            `rgba(${rgb},${a*Math.max(0,Math.min(1,(Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):.85)))})`;
          ctx.lineWidth=Math.max(.5,Number(f.endChordWidth)||Number(f.lineWidth)||1.5);
          ctx.lineCap='round';
          ctx.stroke();
        }

        if(hasArcClip){
          const sweepProgress=Math.min(
            1,
            progress*
            Math.max(.001,Number(f.sweepSpeed)||1)
          );
          const startAngle=counterclockwise
            ?angle+halfAngle
            :angle-halfAngle;
          const endAngle=counterclockwise
            ?startAngle-halfAngle*2*sweepProgress
            :startAngle+halfAngle*2*sweepProgress;
          const currentSweep=Math.abs(endAngle-startAngle);
          if(currentSweep>1e-5){
            const currentGeometry=AreaGeometryService.polygon(
              {x:Number(f.x)||0,y:Number(f.y)||0,radius:0},
              {
                type:'delivery.area',
                shape:'sector',
                range,
                halfAngle:currentSweep/2,
                wallPolicy:'block'
              },
              (startAngle+endAngle)/2,
              96
            );
            const currentPoints=currentGeometry?.points||[];
            if(currentPoints.length>=3){
              /*
                레이카 우클릭과 동일하게 채움만 최종 공격 polygon으로 clip하고,
                현재 프레임의 벽 절단 geometry 윤곽은 clip 밖에서 직접 그린다.
              */
              ctx.restore();
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(currentPoints[0].x,currentPoints[0].y);
              for(let currentIndex=1;currentIndex<currentPoints.length;currentIndex++){
                ctx.lineTo(currentPoints[currentIndex].x,currentPoints[currentIndex].y);
              }
              ctx.closePath();
              ctx.strokeStyle=
                `rgba(${rgb},${a*Math.max(0,Math.min(1,(Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):.85)))})`;
              ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||1.5);
              ctx.lineJoin='round';
              ctx.lineCap='round';
              ctx.setLineDash([]);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
        continue;
      }

      if(f.type==='progressRect'){
        const angle=Number(f.angle)||0;
        const range=EffectSpawnService.presentationRange(f,now);
        const halfWidth=Math.max(
          0,
          Number(f.halfWidth)||
          Number(f.width)/2||
          0
        );
        const growthSpeed=Math.max(
          .001,
          Number(f.growthSpeed)||
          1
        );
        const timeline=f.pathTimeline&&typeof f.pathTimeline==='object'
          ?f.pathTimeline
          :null;
        let offset=0;
        let a=f.holdVisibleUntilEnd===true
          ?(now<f.start+f.dur?1:0)
          :Math.max(0,1-progress);
        let length=f.fullLength===true
          ?range
          :range*Math.min(1,progress*growthSpeed);
        if(timeline){
          const revealEnd=Math.max(.001,Math.min(.49,Number(timeline.revealRatio)||.10));
          const fadeStart=Math.max(revealEnd,Math.min(.999,Number(timeline.fadeStart)||.75));
          if(progress<revealEnd){
            length=range*(progress/revealEnd);
            a=1;
          }else if(progress<fadeStart){
            length=range;
            a=1;
          }else{
            const fadeProgress=Math.max(0,Math.min(1,(progress-fadeStart)/Math.max(.001,1-fadeStart)));
            if(f.fadeOut===true){
              // 페이드아웃 잔향은 마지막 형태를 유지한 채 투명도만 감소한다.
              offset=0;
              length=range;
              a=1-fadeProgress;
            }else{
              // 기존 progressRect 사용처의 축소 종료 연출은 그대로 유지한다.
              offset=range*fadeProgress;
              length=range*(1-fadeProgress);
              a=1-fadeProgress;
            }
          }
        }
        const cos=Math.cos(angle);
        const sin=Math.sin(angle);
        const sx=f.x+cos*offset;
        const sy=f.y+sin*offset;
        const px=-sin*halfWidth;
        const py=cos*halfWidth;
        const ex=sx+cos*length;
        const ey=sy+sin*length;
        const rgb=ColorService.rgbString(f.color,'255,105,180');
        const source=
          EntityService.items.get(
            String(f.sourceEntityId||'')
          )||null;
        const strokeRgb=
          f.strokeColorMode==='source-team'&&source
            ?ColorService.rgbString(
              TeamColorPresentationService.colorForEntity(
                source,
                source.color||'#ffb6da'
              ),
              rgb
            )
            :ColorService.rgbString(
              f.strokeColor,
              f.color||'255,182,218'
            );

        ctx.save();
        if(Array.isArray(f.points)&&f.points.length>=3){
          ctx.beginPath();
          ctx.moveTo(Number(f.points[0].x)||0,Number(f.points[0].y)||0);
          for(let index=1;index<f.points.length;index++){
            ctx.lineTo(Number(f.points[index].x)||0,Number(f.points[index].y)||0);
          }
          ctx.closePath();
          ctx.clip();
        }

        ctx.beginPath();
        ctx.moveTo(sx+px,sy+py);
        ctx.lineTo(ex+px,ey+py);
        ctx.lineTo(ex-px,ey-py);
        ctx.lineTo(sx-px,sy-py);
        ctx.closePath();
        ctx.fillStyle=
          `rgba(${rgb},${a*Math.max(0,Math.min(1,Number(f.fillAlpha)||.22))})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${strokeRgb},${a*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.9))})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
        if(Array.isArray(f.lineDash))ctx.setLineDash(f.lineDash);
        if(f.openEnds===true){
          ctx.beginPath();
          ctx.moveTo(sx+px,sy+py);
          ctx.lineTo(ex+px,ey+py);
          ctx.moveTo(sx-px,sy-py);
          ctx.lineTo(ex-px,ey-py);
          ctx.stroke();
        }else{
          ctx.stroke();
        }
        ctx.setLineDash([]);

        if(f.endCap===true){
          ctx.beginPath();
          ctx.moveTo(ex+px,ey+py);
          ctx.lineTo(ex-px,ey-py);
          ctx.strokeStyle=
            `rgba(${ColorService.rgbString(f.endCapColor,'255,255,255')},${a*Math.max(0,Math.min(1,Number(f.endCapAlpha)||.9))})`;
          ctx.lineWidth=Math.max(.5,Number(f.endCapLineWidth)||4.5);
          ctx.stroke();
        }

        if(f.centerLine===true){
          ctx.beginPath();
          ctx.moveTo(f.x,f.y);
          ctx.lineTo(ex,ey);
          ctx.strokeStyle=
            `rgba(${ColorService.rgbString(f.centerColor,'255,255,255')},${a*Math.max(0,Math.min(1,Number(f.centerAlpha)||.35))})`;
          ctx.lineWidth=Math.max(.5,Number(f.centerLineWidth)||1.5);
          ctx.stroke();
        }

        const highlightFraction=Math.max(
          0,
          Math.min(1,Number(f.highlightFraction)||0)
        );
        if(highlightFraction>0&&length>0){
          const originalRange=Math.max(
            range,
            Number(f.originalRange)||0
          );
          const highlightStart=
            originalRange*(1-highlightFraction);
          const highlightLength=Math.max(
            0,
            length-highlightStart
          );
          if(highlightLength>0){
            ctx.save();
            ctx.translate(f.x,f.y);
            ctx.rotate(angle);
            ctx.fillStyle=
              `rgba(${ColorService.rgbString(f.highlightColor,'255,200,100')},${a*Math.max(0,Math.min(1,Number(f.highlightAlpha)||.6))})`;
            ctx.fillRect(
              highlightStart,
              -halfWidth,
              highlightLength,
              halfWidth*2
            );
            ctx.restore();
          }
        }


        if(
          String(f.clipAreaShape||'')==='rect'&&
          String(f.clipWallPolicy||'block')!=='ignore'&&
          Number(f.originalRange)>range+.75&&
          length>=range-.75
        ){
          const cutX=f.x+cos*range;
          const cutY=f.y+sin*range;
          ctx.beginPath();
          ctx.moveTo(cutX+px,cutY+py);
          ctx.lineTo(cutX-px,cutY-py);
          ctx.strokeStyle=
            `rgba(${strokeRgb},${a*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.9))})`;
          ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
          ctx.setLineDash([]);
          ctx.stroke();
        }

        if(f.impactCircle===true){
          const impactRadius=
            halfWidth*
            Math.max(
              0,
              Number(f.impactRadiusScale)||.8
            )*
            Math.min(1,progress*growthSpeed);
          ctx.beginPath();
          ctx.arc(ex,ey,Math.max(1,impactRadius),0,Math.PI*2);
          ctx.strokeStyle=
            `rgba(${ColorService.rgbString(f.impactColor,'255,200,80')},${a*Math.max(0,Math.min(1,Number(f.impactAlpha)||.7))})`;
          ctx.lineWidth=Math.max(.5,Number(f.impactLineWidth)||2);
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }

      if(f.type==='shieldSwing'){
        const a=Math.max(0,1-progress);
        const rgb=ColorService.rgbString(
          f.color,
          '255,119,0'
        );
        const range=
          Math.max(
            0,
            Number(f.range)||0
          );
        const halfAngle=
          Math.max(
            0,
            Number(f.halfAngle)||0
          );
        const startAngle=
          (Number(f.angle)||0)-halfAngle;
        const endAngle=
          (Number(f.angle)||0)+halfAngle;

        ctx.save();
        ctx.beginPath();
        if(
          Array.isArray(f.points)&&
          f.points.length>=3
        ){
          ctx.moveTo(
            Number(f.points[0].x)||0,
            Number(f.points[0].y)||0
          );
          for(
            let index=1;
            index<f.points.length;
            index++
          ){
            ctx.lineTo(
              Number(f.points[index].x)||0,
              Number(f.points[index].y)||0
            );
          }
          ctx.closePath();
        }else{
          ctx.moveTo(f.x,f.y);
          ctx.arc(
            f.x,
            f.y,
            range,
            startAngle,
            endAngle
          );
          ctx.closePath();
        }
        ctx.fillStyle=
          `rgba(${rgb},${a*.22})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${rgb},${a*.9})`;
        ctx.lineWidth=AttackVisualStyle.strokeWidth;
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if(f.type==='shieldDash'){
        const a=Math.max(0,1-progress);
        const rr=Math.max(0,Number(f.range)||0)*progress;
        const angle=Number(f.angle)||0;
        const ex=f.x+Math.cos(angle)*rr;
        const ey=f.y+Math.sin(angle)*rr;
        const rgb=ColorService.rgbString(f.color,'255,119,0');
        const gradient=ctx.createLinearGradient(f.x,f.y,ex,ey);
        gradient.addColorStop(0,`rgba(${rgb},${a*.9})`);
        gradient.addColorStop(1,`rgba(${rgb},0)`);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(ex,ey);
        ctx.strokeStyle=gradient;
        ctx.lineWidth=12;
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='taperedArea'){
        const a=Math.max(0,1-progress);
        const angle=Number(f.angle)||0;
        const range=Math.max(0,Number(f.range)||0);
        const startHalfWidth=Math.max(
          0,
          Number(f.startHalfWidth)||
          Number(f.halfWidth)||
          range*.12
        );
        const endHalfWidth=Math.max(
          0,
          Number(f.endHalfWidth)||0
        );
        const cos=Math.cos(angle),sin=Math.sin(angle);
        const px=-sin,py=cos;
        const ex=f.x+cos*range;
        const ey=f.y+sin*range;
        const rgb=ColorService.rgbString(
          f.color,
          '255,215,0'
        );

        ctx.save();
        ctx.beginPath();

        if(
          Array.isArray(f.points)&&
          f.points.length>=3
        ){
          ctx.moveTo(
            Number(f.points[0].x)||0,
            Number(f.points[0].y)||0
          );
          for(
            let index=1;
            index<f.points.length;
            index++
          ){
            ctx.lineTo(
              Number(f.points[index].x)||0,
              Number(f.points[index].y)||0
            );
          }
          ctx.closePath();
        }else{
          ctx.moveTo(
            f.x+px*startHalfWidth,
            f.y+py*startHalfWidth
          );
          ctx.lineTo(
            ex+px*endHalfWidth,
            ey+py*endHalfWidth
          );
          ctx.lineTo(
            ex-px*endHalfWidth,
            ey-py*endHalfWidth
          );
          ctx.lineTo(
            f.x-px*startHalfWidth,
            f.y-py*startHalfWidth
          );
          ctx.closePath();
        }
        ctx.fillStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.fillAlpha)||.28)})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.strokeAlpha)||.9)})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(f.lineWidth)||2.5
          );
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='beamLine'){
        const baseAlpha=Math.max(0,1-progress);
        const beamSource=
          EntityService.items.get(
            String(f.sourceEntityId||'')
          )||
          null;
        const viewer=
          Training.player||
          null;
        const viewerRelation=
          beamSource&&viewer
            ?RelationService.relation(
              viewer,
              beamSource
            )
            :'neutral';
        const friendlyViewer=
          viewerRelation==='self'||
          viewerRelation==='ally';
        const viewerAlphaScale=
          friendlyViewer
            ?Math.max(
              0,
              Math.min(
                1,
                Number.isFinite(
                  Number(f.friendlyViewerAlphaScale)
                )
                  ?Number(f.friendlyViewerAlphaScale)
                  :1
              )
            )
            :1;
        const a=
          baseAlpha*
          viewerAlphaScale;
        const angle=Number(f.angle)||0;
        const len=Math.max(0,Number(f.range)||0);
        const halfWidth=Math.max(
          0,
          Number(f.halfWidth)||
          Number(f.width)/2||
          0
        );
        // 장식용 주변광 폭은 실제 피해 판정/beam body 폭과 완전히 분리한다.
        const nonHitAuraHalfWidth=Math.max(
          halfWidth,
          Number(f.nonHitAuraHalfWidth)||halfWidth
        );
        const rgb=
          ColorService.rgbString(
            f.color,
            '56,189,248'
          );
        const coreRgb=
          ColorService.rgbString(
            f.coreColor,
            '255,255,255'
          );
        const cos=Math.cos(angle);
        const sin=Math.sin(angle);
        const ex=f.x+cos*len;
        const ey=f.y+sin*len;
        const px=-sin*halfWidth;
        const py=cos*halfWidth;

        const pulse=
          .82+
          .18*
          Math.sin(
            now*
            (
              Number(f.pulseSpeed)||
              .014
            )
          );

        ctx.save();
        ctx.globalCompositeOperation='lighter';

        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(ex,ey);
        ctx.strokeStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.glowAlpha)||.18)*pulse})`;
        ctx.lineWidth=
          Math.max(
            1,
            nonHitAuraHalfWidth*2*
            Math.max(
              1,
              Number(f.glowWidthRatio)||2.2
            )
          );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(ex,ey);
        ctx.strokeStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.midGlowAlpha)||.28)})`;
        ctx.lineWidth=
          Math.max(
            1,
            nonHitAuraHalfWidth*2*
            Math.max(
              1,
              Number(f.midGlowWidthRatio)||1.35
            )
          );
        ctx.stroke();

        ctx.globalCompositeOperation='source-over';
        ctx.beginPath();
        ctx.moveTo(f.x+px,f.y+py);
        ctx.lineTo(ex+px,ey+py);
        ctx.lineTo(ex-px,ey-py);
        ctx.lineTo(f.x-px,f.y-py);
        ctx.closePath();
        ctx.fillStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.fillAlpha)||.30)})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${rgb},${a*Math.max(0,Number(f.strokeAlpha)||.90)})`;
        ctx.lineWidth=
          Math.max(1,Number(f.lineWidth)||2.5);
        ctx.stroke();

        const coreHalf=
          halfWidth*
          Math.max(
            .05,
            Math.min(
              1,
              Number(f.coreWidthRatio)||.18
            )
          );
        const cpx=-sin*coreHalf;
        const cpy=cos*coreHalf;
        ctx.beginPath();
        ctx.moveTo(f.x+cpx,f.y+cpy);
        ctx.lineTo(ex+cpx,ey+cpy);
        ctx.lineTo(ex-cpx,ey-cpy);
        ctx.lineTo(f.x-cpx,f.y-cpy);
        ctx.closePath();
        ctx.fillStyle=
          `rgba(${coreRgb},${a*Math.max(0,Number(f.coreAlpha)||.62)})`;
        ctx.fill();

        if(f.endFlare!==false){
          const flareRadius=
            nonHitAuraHalfWidth*
            Math.max(
              .1,
              Number(f.flareRadiusRatio)||.8
            )*
            pulse;
          ctx.save();
          ctx.globalCompositeOperation='lighter';
          const flare=
            ctx.createRadialGradient(
              ex,
              ey,
              0,
              ex,
              ey,
              Math.max(1,flareRadius)
            );
          flare.addColorStop(
            0,
            `rgba(${coreRgb},${a*Math.max(0,Number(f.flareAlpha)||.65)})`
          );
          flare.addColorStop(
            .45,
            `rgba(${rgb},${a*.38})`
          );
          flare.addColorStop(
            1,
            `rgba(${rgb},0)`
          );
          ctx.beginPath();
          ctx.arc(
            ex,
            ey,
            Math.max(1,flareRadius),
            0,
            Math.PI*2
          );
          ctx.fillStyle=flare;
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
        continue;
      }

      if(f.type==='shieldUppercut'){
        const a=Math.max(0,1-progress);
        const angle=Number(f.angle)||0;
        const len=Math.max(0,Number(f.range)||0);
        const halfWidth=Math.max(0,Number(f.halfWidth)||0);
        const cos=Math.cos(angle),sin=Math.sin(angle);
        const ex=f.x+cos*len,ey=f.y+sin*len;
        const px=-sin*halfWidth,py=cos*halfWidth;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.x+px,f.y+py);
        ctx.lineTo(ex+px,ey+py);
        ctx.lineTo(ex-px,ey-py);
        ctx.lineTo(f.x-px,f.y-py);
        ctx.closePath();
        ctx.fillStyle=`rgba(255,165,0,${a*.22})`;
        ctx.fill();
        ctx.strokeStyle=`rgba(255,180,50,${a*.9})`;
        ctx.lineWidth=3;
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='parry'){
        const a=Math.max(0,1-progress);
        const radius=Math.max(1,Number(f.maxRadius)||40)*progress;
        ctx.save();

        if(Array.isArray(f.points)&&f.points.length>=3){
          ctx.beginPath();
          ctx.moveTo(f.points[0].x,f.points[0].y);
          for(let index=1;index<f.points.length;index++){
            ctx.lineTo(f.points[index].x,f.points[index].y);
          }
          ctx.closePath();
          ctx.clip();
        }

        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${a*.45})`;
        ctx.fill();
        if(!(Array.isArray(f.points)&&f.points.length>=3)){
          ctx.strokeStyle=`rgba(255,220,80,${a*.9})`;
          ctx.lineWidth=3;
          ctx.stroke();
        }
        ctx.restore();
        if(Array.isArray(f.points)&&f.points.length>=3){
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(f.points[0].x,f.points[0].y);
          for(let index=1;index<f.points.length;index++)ctx.lineTo(f.points[index].x,f.points[index].y);
          ctx.closePath();
          ctx.strokeStyle=`rgba(255,220,80,${a*.9})`;
          ctx.lineWidth=3;
          ctx.lineJoin='round';
          ctx.stroke();
          ctx.restore();
        }
        continue;
      }

      if(f.type==='backup'){
        const a=Math.max(0,1-progress);
        const rgb=ColorService.rgbString(f.color,'255,119,0');
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(Number(f.tx)||f.x,Number(f.ty)||f.y);
        ctx.strokeStyle=`rgba(${rgb},${a*.7})`;
        ctx.lineWidth=2;
        ctx.setLineDash([5,4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        continue;
      }

      if(f.type==='positionMemoryLink'){
        const rgb=ColorService.rgbString(f.color,'255,119,0');
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(Number(f.tx)||f.x,Number(f.ty)||f.y);
        ctx.strokeStyle=`rgba(${rgb},${Math.max(0,Math.min(1,Number(f.alpha)||0))})`;
        ctx.lineWidth=Math.max(.5,Number(f.width)||1.5);
        ctx.setLineDash(Array.isArray(f.dash)?f.dash:[5,4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        continue;
      }

      if(f.type==='positionMemoryMarker'){
        const alpha=Math.max(0,Math.min(1,Number(f.alpha)||0));
        const ratio=Math.max(0,Math.min(1,Number(f.ratio)||0));
        const radius=Math.max(1,Number(f.radius)||10);
        const customColor=f.color!=null&&String(f.color)!=='';
        const rgb=ColorService.rgbString(f.color,'255,119,0');
        const lineWidth=Math.max(.5,Number(f.lineWidth)||3);
        ctx.save();
        if(Number(f.fillRadius)>0&&Number(f.fillAlpha)>0){
          ctx.beginPath();
          ctx.arc(f.x,f.y,Math.max(1,Number(f.fillRadius)),0,Math.PI*2);
          ctx.fillStyle=`rgba(${rgb},${Math.max(0,Math.min(1,Number(f.fillAlpha)))})`;
          ctx.fill();
        }
        const baseStrokeAlpha=Number.isFinite(Number(f.baseStrokeAlpha))
          ?Math.max(0,Math.min(1,Number(f.baseStrokeAlpha)))
          :.25;
        if(baseStrokeAlpha>0){
          ctx.beginPath();
          ctx.arc(f.x,f.y,radius,0,Math.PI*2);
          ctx.strokeStyle=`rgba(${rgb},${alpha*baseStrokeAlpha})`;
          ctx.lineWidth=lineWidth;
          if(Array.isArray(f.dash))ctx.setLineDash(f.dash);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if(ratio>0){
          ctx.beginPath();
          ctx.arc(f.x,f.y,radius,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio);
          const arcAlpha=Number.isFinite(Number(f.arcAlpha))
            ?Math.max(0,Math.min(1,Number(f.arcAlpha)))*alpha
            :alpha;
          ctx.strokeStyle=customColor
            ?`rgba(${rgb},${arcAlpha})`
            :`rgba(255,${Math.round(119+100*ratio)},0,${arcAlpha})`;
          ctx.lineWidth=lineWidth;
          if(Array.isArray(f.dash))ctx.setLineDash(f.dash);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if(f.icon){
          ctx.fillStyle=`rgba(${ColorService.rgbString(f.iconColor,'180,210,255')},${Math.max(0,Math.min(1,Number(f.iconAlpha)||1))})`;
          ctx.font=String(f.iconFont||'bold 14px Arial');
          ctx.textAlign='center';
          ctx.fillText(String(f.icon),f.x,f.y+(Number(f.iconOffsetY)||0));
        }
        if(Number.isFinite(Number(f.resourceRatio))){
          const resourceRatio=Math.max(0,Math.min(1,Number(f.resourceRatio)));
          const width=Math.max(1,Number(f.resourceWidth)||48);
          const height=Math.max(1,Number(f.resourceHeight)||4);
          const x=f.x-width/2;
          const y=f.y+(Number(f.resourceOffsetY)||17);
          const resourceAlpha=Math.max(0,Math.min(1,Number(f.resourceAlpha)||.75));
          ctx.globalAlpha=resourceAlpha;
          ctx.fillStyle=String(f.resourceBackColor||'#111');
          ctx.fillRect(x,y,width,height);
          ctx.fillStyle=resourceRatio>Math.max(0,Math.min(1,Number(f.resourceThreshold)||.4))
            ?String(f.resourceHighColor||'#fa0')
            :String(f.resourceLowColor||'#f64');
          ctx.fillRect(x,y,width*resourceRatio,height);
          ctx.globalAlpha=1;
        }
        ctx.restore();
        continue;
      }

      if(f.type==='areaZoneIndicator'){
        const source=
          EntityService.items.get(
            String(f.sourceEntityId||'')
          )||null;
        const baseAlpha=
          Math.max(
            0,
            Math.min(
              1,
              Number(f.alpha)||1
            )
          );
        const lifeAlpha=
          f.fadeOut===true
            ?baseAlpha*(1-progress)
            :baseAlpha;
        const pulse=
          .65+.35*Math.sin(now*.006);

        AreaZonePresentationService.draw(
          ctx,
          {
            x:Number(f.x)||0,
            y:Number(f.y)||0,
            radius:
              Math.max(
                0,
                Number(f.radius)||0
              ),
            bodyColor:
              f.bodyColor||
              source?.color||
              '#62e889',
            source,
            pulse,
            alpha:lifeAlpha
          }
        );
        continue;
      }

      if(f.type==='actionWindowIndicator'){
        const baseAlpha=Math.max(
          0,
          Math.min(
            1,
            Number(f.alpha)||0
          )
        );
        const alpha=
          f.fadeOut===true
            ?baseAlpha*(1-progress)
            :baseAlpha;
        const rgb=ColorService.rgbString(f.color,'255,119,0');
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x,f.y,Math.max(1,Number(f.radius)||36),0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb},${alpha})`;
        ctx.lineWidth=Math.max(1,Number(f.width)||3);
        ctx.setLineDash(Array.isArray(f.dash)?f.dash:[4,4]);
        ctx.stroke();
        ctx.setLineDash([]);
        if(f.text){
          ctx.fillStyle='rgba(255,150,0,.95)';
          ctx.font='bold 11px Pretendard';
          ctx.textAlign='center';
          ctx.fillText(
            String(f.text),
            f.x,
            f.y+Math.max(1,Number(f.sourceRadius)||20)+33
          );
        }
        ctx.restore();
        continue;
      }

      if(f.type==='segmentRope'){
        const source=EntityService.items.get(f.sourceEntityId)||null;
        if(!source?.alive)continue;

        const projectile=f.projectileRef||null;
        const fieldState=f.fieldStateRef||null;

        let from={
          x:Number.isFinite(Number(f.fromX))
            ?Number(f.fromX)
            :(Number(source.x)||0),
          y:Number.isFinite(Number(f.fromY))
            ?Number(f.fromY)
            :(Number(source.y)||0)
        };
        let target={
          x:Number(f.tx)||0,
          y:Number(f.ty)||0
        };

        let trajectoryAlpha=1;

        if(projectile){
          target=
            ProjectileVisualPositionService.sample(
              projectile
            );
          trajectoryAlpha=Math.max(
            0,
            Math.min(
              1,
              Number(target.alpha)||0
            )
          );
        }else if(fieldState){
          from={
            x:Number(fieldState.ax)||0,
            y:Number(fieldState.ay)||0
          };
          target={
            x:Number(fieldState.bx)||0,
            y:Number(fieldState.by)||0
          };
        }

        const lifeAlpha=f.fadeOut===true
          ?Math.max(0,1-progress)
          :(
            progress<.9
              ?1
              :Math.max(0,(1-progress)/.1)
          );
        const rgb=ColorService.rgbString(
          f.color||source.color,
          ColorService.rgbString(source.color,'0,230,118')
        );
        const localPlayer=Training.player||null;
        const localRelation=
          localPlayer
            ?RelationService.relation(
              localPlayer,
              source
            )
            :'neutral';
        const friendly=
          localRelation==='self'||
          localRelation==='ally';
        const ownerVisible=localRelation==='self';
        const pairedVisibilityPolicy=String(
          fieldState?.module?.pairedVisibilityPolicy||''
        );
        const pairedVisible=
          pairedVisibilityPolicy==='owner-only'
            ?ownerVisible
            :pairedVisibilityPolicy==='friendly-only'
              ?friendly
              :true;
        let pairedVisibilityAlpha=1;
        if(
          fieldState?.phase==='wall-wall'&&
          !pairedVisible
        ){
          const fadeDuration=Math.max(
            0,
            Number(fieldState.module?.pairedHideFadeDuration)||0
          );
          const fadeStartedAt=Number(
            fieldState.pairedVisibilityStartedAt
          )||Number(fieldState.startedAt)||now;
          pairedVisibilityAlpha=fadeDuration>0
            ?Math.max(0,Math.min(1,1-(now-fadeStartedAt)/fadeDuration))
            :0;
          if(pairedVisibilityAlpha<=0)continue;
        }
        const allyVisualAlpha=friendly ? .40 : 1;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(from.x,from.y);
        ctx.lineTo(target.x,target.y);
        ctx.strokeStyle=
          `rgba(${rgb},${Math.max(0,Math.min(1,(Number(f.alpha)||.72)*lifeAlpha*allyVisualAlpha*pairedVisibilityAlpha*trajectoryAlpha))})`;
        ctx.lineWidth=Math.max(1,Number(f.width)||4);
        ctx.lineCap=String(f.lineCap||'round');
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='wallOutline'){
        const lifeAlpha=
          progress<.9
            ?1
            :Math.max(0,(1-progress)/.1);
        const pulse=.78+.22*Math.sin(now*.012);
        const rgb=ColorService.rgbString(
          f.color,
          '0,230,118'
        );
        const source=
          EntityService.items.get(
            f.sourceEntityId
          )||null;
        const localPlayer=Training.player||null;
        const localRelation=
          localPlayer&&source
            ?RelationService.relation(
              localPlayer,
              source
            )
            :'neutral';
        const relationAlpha=
          (
            localRelation==='self'||
            localRelation==='ally'
          )
            ?.45
            :1;

        ctx.save();
        ctx.shadowColor=
          `rgba(${rgb},${lifeAlpha*.85*relationAlpha})`;
        ctx.shadowBlur=12+6*pulse;
        ctx.strokeStyle=
          `rgba(${rgb},${Math.max(0,Math.min(1,(Number(f.alpha)||.82)*lifeAlpha*pulse*relationAlpha))})`;
        ctx.lineWidth=Math.max(1,Number(f.lineWidth)||3);
        ctx.strokeRect(
          Number(f.x)||0,
          Number(f.y)||0,
          Math.max(0,Number(f.w)||0),
          Math.max(0,Number(f.h)||0)
        );
        ctx.restore();
        continue;
      }

      if(f.type==='dmgNum'){
        ctx.save();ctx.globalAlpha=1-progress;ctx.fillStyle=f.col||'#ff6060';ctx.font=`bold ${f.size||19}px Pretendard`;ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y-progress*22);ctx.restore();continue;
      }
      if(f.type==='justDodgeText'){
        ctx.save();
        ctx.globalAlpha=1-progress;
        ctx.font='bold 20px Pretendard';
        ctx.textAlign='center';
        const gradient=ctx.createLinearGradient(f.x-34,f.y,f.x+34,f.y);
        gradient.addColorStop(0,'#ffe55c');
        gradient.addColorStop(.55,'#ffb62f');
        gradient.addColorStop(1,'#ff6a00');
        ctx.fillStyle=gradient;
        ctx.fillText(f.text,f.x,f.y-progress*24);
        ctx.restore();
        continue;
      }
      if(f.type==='koImpact'){
        ctx.save();
        const alpha=1-progress;

        const radius=20+progress*115;
        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
        ctx.lineWidth=8*(1-progress)+1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(f.x,f.y,radius*.62,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,190,55,${alpha*.9})`;
        ctx.lineWidth=11*(1-progress)+1;
        ctx.stroke();

        ctx.restore();
        continue;
      }

      if(f.type==='koBeam')continue;

      if(f.type==='koAfterimage'){
        const local=Math.max(0,Math.min(1,progress));
        const travel=(1-Math.pow(1-local,4))*780;
        const x=f.x+Math.cos(f.angle)*travel;
        const y=f.y+Math.sin(f.angle)*travel;

        ctx.save();
        ctx.globalAlpha=(1-local)*.16;
        ctx.translate(x,y);
        ctx.rotate(f.angle);
        ctx.scale(2.8,.38);

        ctx.beginPath();
        ctx.arc(0,0,16,0,Math.PI*2);
        ctx.fillStyle=f.color||'#fff';
        ctx.fill();

        ctx.restore();
        continue;
      }

      if(f.type==='koLaunch'){
        const local=Math.max(0,Math.min(1,progress));
        const travel=(1-Math.pow(1-local,5))*1250;
        const x=f.x+Math.cos(f.angle)*travel;
        const y=f.y+Math.sin(f.angle)*travel;

        ctx.save();
        ctx.globalAlpha=1-Math.pow(local,2.1);
        ctx.translate(x,y);
        ctx.rotate(f.angle);
        ctx.scale(3.4,.30);

        ctx.shadowBlur=24*(1-local);
        ctx.shadowColor='rgba(255,220,100,.95)';

        ctx.beginPath();
        ctx.arc(0,0,17,0,Math.PI*2);
        ctx.fillStyle=f.color||'#fff';
        ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.96)';
        ctx.lineWidth=3;
        ctx.stroke();

        ctx.restore();
        continue;
      }

      if(f.type==='healPulse'){
        const alpha=1-progress;
        const radius=Math.max(1,Number(f.maxR)||32);
        const rgb=ColorService.rgbString(
          f.color||f.col||f.strokeColor,
          '80,255,120'
        );

        ctx.save();
        ctx.beginPath();
        ctx.arc(
          f.x,
          f.y,
          radius,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=
          `rgba(${rgb},${alpha*.9})`;
        ctx.lineWidth=2.5;
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='annularDoubleSweep'){
        ctx.save();

        const hasAnnularClip=
          Array.isArray(f.points)&&
          f.points.length>=3;
        const applyAnnularClip=()=>{
          if(!hasAnnularClip)return;
          ctx.beginPath();
          ctx.moveTo(
            Number(f.points[0]?.x)||0,
            Number(f.points[0]?.y)||0
          );
          for(
            let pointIndex=1;
            pointIndex<f.points.length;
            pointIndex++
          ){
            ctx.lineTo(
              Number(f.points[pointIndex]?.x)||0,
              Number(f.points[pointIndex]?.y)||0
            );
          }
          ctx.closePath();
          ctx.clip();
        };
        applyAnnularClip();

        // 기존 듀얼즈 shape.annularDoubleSweep와 동일한 시각 수식.
        // Duels 3에서는 f.dur가 총 지속시간(ms)이므로 공통 progress를 사용한다.
        const legacyAlpha=1-progress;
        const sweepFraction=
          Math.max(
            .001,
            Math.min(
              .999,
              Number(f.sweepFraction)||.55
            )
          );
        const sweep=
          Math.min(
            1,
            progress/sweepFraction
          );
        const fade=
          progress>sweepFraction
            ?Math.pow(
              1-
              (
                progress-sweepFraction
              )/
              (
                1-sweepFraction
              ),
              Number(f.fadePower)||1.5
            )
            :1;

        // 회전 공격은 진행 중 기본 공격과 같은 선명도를 유지하고,
        // sweep 완료 뒤에만 fade 곡선으로 사라진다. 수명 alpha와 fade를
        // 중복 곱해 공격 중간부터 과도하게 흐려지는 현상을 만들지 않는다.
        const visualAlpha=
          (f.lifetimeAlpha===true?legacyAlpha:1)*
          (progress>sweepFraction?fade:1);

        const outer=
          Math.max(
            1,
            Number(f.outer)||
            Number(f.r)||
            60
          );
        const inner=
          Math.max(
            0,
            Number(f.inner)||0
          );
        const angle=
          (Number.isFinite(Number(f.angle))
            ?Number(f.angle)
            :-Math.PI/2)+
          (Number(f.startAngleOffset)||0);
        const span=
          Number.isFinite(Number(f.halfAngle))
            ?Number(f.halfAngle)
            :(
              Number.isFinite(Number(f.span))
                ?Number(f.span)
                :Math.PI
            );
        const hitColor=
          ColorService.rgbString(
            f.hitColor||
            (
              f.empow
                ?(
                  f.empoweredColor||
                  '255,160,40'
                )
                :(
                  f.color||
                  '180,180,200'
                )
            ),
            '180,180,200'
          );
        const safeColor=
          ColorService.rgbString(
            f.safeColor,
            '80,80,100'
          );

        const sweepCount=Math.max(
          1,
          Math.floor(Number(f.sweepCount)||2)
        );
        const clockwise=
          String(f.sweepDirection||'clockwise')!==
          'counterclockwise';

        for(let index=0;index<sweepCount;index++){
          const converge=
            f.converge===true;

          // 기본(Tau): 서로 반대편 시작점에서 같은 방향으로 sweep.
          // sweepCount:1은 하나의 회전 공격이 지정 span 전체를 순회한다.
          // converge: 지정된 최종 부채꼴의 양 끝에서 중앙을 향해 각각 sweep.
          const finalStart=
            angle-span;
          const finalEnd=
            angle+span;
          const startAngle=
            converge
              ?(
                index===0
                  ?finalStart
                  :finalEnd
              )
              :angle+index*(Math.PI*2/sweepCount);
          const signedSweep=
            span*sweep*(clockwise?1:-1);
          const endAngle=
            converge
              ?(
                index===0
                  ?finalStart+span*sweep
                  :finalEnd-span*sweep
              )
              :startAngle+signedSweep;
          const counterClockwise=
            converge
              ?index===1
              :!clockwise;

          if(inner>0){
            ctx.beginPath();
            ctx.moveTo(f.x,f.y);
            ctx.arc(
              f.x,
              f.y,
              inner,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.closePath();
            ctx.fillStyle=
              `rgba(${safeColor},${visualAlpha*Math.max(0,Number(f.safeFillAlpha)||.1)})`;
            ctx.fill();
            ctx.setLineDash(
              Array.isArray(f.safeDash)
                ?f.safeDash
                :[5,4]
            );
            ctx.strokeStyle=
              `rgba(${safeColor},${visualAlpha*Math.max(0,Number(f.safeStrokeAlpha)||.55)})`;
            ctx.lineWidth=
              Math.max(
                .5,
                Number(f.safeLineWidth)||1.5
              );
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const hitFillAlpha=
            visualAlpha*
            Math.max(
              0,
              Number(f.fillAlpha)||.28
            );
          const hitStrokeAlpha=
            visualAlpha*
            Math.max(
              0,
              Number(f.strokeAlpha)||.95
            );
          const visibleLineWidth=
            Math.max(
              .5,
              Number(f.lineWidth)||2.5
            );

          if(inner<=0&&f.edgeLine===false){
            /*
              중심까지 닫는 sector path는 fill 경계에 방사형 seam을 만들 수 있다.
              중심이 0인 edge-less sweep은 두꺼운 원호 stroke로 면을 채워
              시작/끝 방사선을 path 자체에서 제거한다.
            */
            ctx.save();
            ctx.lineCap='butt';
            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer*.5,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.strokeStyle=
              `rgba(${hitColor},${hitFillAlpha})`;
            ctx.lineWidth=outer;
            ctx.stroke();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.strokeStyle=
              `rgba(${hitColor},${hitStrokeAlpha})`;
            ctx.lineWidth=visibleLineWidth;
            if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
          }else{
            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer,
              startAngle,
              endAngle,
              counterClockwise
            );
            if(inner>0){
              ctx.arc(
                f.x,
                f.y,
                inner,
                endAngle,
                startAngle,
                !counterClockwise
              );
            }else{
              ctx.lineTo(f.x,f.y);
            }
            ctx.closePath();
            ctx.fillStyle=
              `rgba(${hitColor},${hitFillAlpha})`;
            ctx.fill();
            ctx.strokeStyle=
              `rgba(${hitColor},${hitStrokeAlpha})`;
            ctx.lineWidth=visibleLineWidth;
            if(f.edgeLine===false){
              ctx.beginPath();
              ctx.arc(
                f.x,
                f.y,
                outer,
                startAngle,
                endAngle,
                counterClockwise
              );
              if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
              if(inner>0){
                ctx.beginPath();
                ctx.arc(
                  f.x,
                  f.y,
                  inner,
                  startAngle,
                  endAngle,
                  counterClockwise
                );
                if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
              }
            }else if(!hasAnnularClip){
              ctx.stroke();
            }
          }

          if(f.edgeLine===true&&Math.abs(endAngle-startAngle)>1e-5){
            const edgeColor=ColorService.rgbString(f.edgeColor,'255,255,255');
            const edgeAlpha=Math.max(0,Math.min(1,Number.isFinite(Number(f.edgeAlpha))?Number(f.edgeAlpha):.75));
            const edgeLineWidth=Math.max(.5,Number(f.edgeLineWidth)||2.5);
            ctx.beginPath();
            ctx.moveTo(
              f.x+Math.cos(endAngle)*inner,
              f.y+Math.sin(endAngle)*inner
            );
            ctx.lineTo(
              f.x+Math.cos(endAngle)*outer,
              f.y+Math.sin(endAngle)*outer
            );
            ctx.strokeStyle=`rgba(${edgeColor},${visualAlpha*edgeAlpha})`;
            ctx.lineWidth=edgeLineWidth;
            ctx.setLineDash([]);
            ctx.stroke();
          }



        }

        /*
          clipToAttackArea가 있는 회전 공격은 완성된 polygon 윤곽을 시작 프레임부터
          미리 그리지 않는다. 스야 arcSweep과 동일하게 현재 sweep 각도만큼의 geometry를
          다시 만들고 그 polygon을 stroke해 외곽선과 벽 절단면이 애니메이션 진행과 함께
          생성되도록 한다.
        */
        if(hasAnnularClip&&sweep>0&&f.clipMaskOnly!==true){
          // clip 마스크 바깥에서 현재 geometry 윤곽을 그려 벽 절단선이 반쪽으로 잘리지 않게 한다.
          ctx.restore();
          ctx.save();
          for(let index=0;index<sweepCount;index++){
            const converge=f.converge===true;
            const finalStart=angle-span;
            const finalEnd=angle+span;
            const startAngle=
              converge
                ?(index===0?finalStart:finalEnd)
                :angle+index*(Math.PI*2/sweepCount);
            const signedSweep=span*sweep*(clockwise?1:-1);
            const endAngle=
              converge
                ?(index===0?finalStart+span*sweep:finalEnd-span*sweep)
                :startAngle+signedSweep;
            const counterClockwise=converge?index===1:!clockwise;
            const currentPoints=
              ProgressiveClippedAreaOutlinePresentationService
                .annularSweepPoints(
                  f,
                  startAngle,
                  endAngle,
                  outer,
                  inner,
                  counterClockwise
                );
            ProgressiveClippedAreaOutlinePresentationService.strokePolygon(
              ctx,
              currentPoints,
              {
                color:hitColor,
                alpha:visualAlpha*Math.max(0,Number(f.strokeAlpha)||.95),
                lineWidth:Math.max(.5,Number(f.lineWidth)||2.5)
              }
            );
          }
        }

        const integratedCuts=Array.isArray(f.wallCutSegments)?f.wallCutSegments:[];
        if(integratedCuts.length){
          ctx.setLineDash([]);
          ctx.beginPath();
          for(const segment of integratedCuts){
            const ax=Number(segment?.ax),ay=Number(segment?.ay),bx=Number(segment?.bx),by=Number(segment?.by);
            if(![ax,ay,bx,by].every(Number.isFinite))continue;
            ctx.moveTo(ax,ay);
            ctx.lineTo(bx,by);
          }
          ctx.strokeStyle=`rgba(${hitColor},${visualAlpha*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.95))})`;
          ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
          ctx.lineCap='round';
          ctx.lineJoin='round';
          ctx.stroke();
        }
        ctx.restore();

        continue;
      }
      if(f.type==='contractingChargeCircle'){
        const radius=Math.max(4,40*(1-progress));
        const strokeColor=ColorService.rgbString(f.color,'150,150,160');
        const fillColor=ColorService.rgbString(f.fillColor,'100,100,110');
        const alpha=1-progress;
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${strokeColor},${alpha*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.9))})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(f.x,f.y,Math.max(2,radius*.5),0,Math.PI*2);
        ctx.fillStyle=`rgba(${fillColor},${alpha*Math.max(0,Math.min(1,Number(f.fillAlpha)||.4))})`;
        ctx.fill();
        ctx.restore();
        continue;
      }
      if(f.type==='contractingPullRing'){
        ctx.save();
        if(Array.isArray(f.points)&&f.points.length>=3){
          ctx.beginPath();
          ctx.moveTo(Number(f.points[0]?.x)||0,Number(f.points[0]?.y)||0);
          for(let i=1;i<f.points.length;i++)ctx.lineTo(Number(f.points[i]?.x)||0,Number(f.points[i]?.y)||0);
          ctx.closePath();
          ctx.clip();
        }
        const radius=Math.max(4,Math.max(0,Number(f.range)||Number(f.maxR)||0)*(1-progress));
        const color=ColorService.rgbString(f.color,'255,180,80');
        const outerColor=ColorService.rgbString(f.outerColor,'200,200,210');
        const alpha=1-progress;
        const outerRadius=Math.max(0,Number(f.range)||Number(f.maxR)||0);
        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${color},${alpha*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.9))})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(f.x,f.y,outerRadius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${outerColor},${alpha*Math.max(0,Math.min(1,Number(f.outerStrokeAlpha)||.4))})`;
        ctx.lineWidth=Math.max(.5,Number(f.outerLineWidth)||1.5);
        ctx.setLineDash(Array.isArray(f.dash)?f.dash:[5,5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        continue;
      }
      if(f.type==='hitImpactRing'){
        const startRadius=Number.isFinite(Number(f.r))?Math.max(0,Number(f.r)):8;
        const endRadius=Number.isFinite(Number(f.maxR))?Math.max(startRadius,Number(f.maxR)):42;
        const radius=startRadius+(endRadius-startRadius)*progress;
        const rgb=ColorService.rgbString(f.color,'255,215,80');
        const alpha=(1-progress)*Math.max(0,Math.min(1,Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):1));
        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb},${alpha})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
        ctx.stroke();
        continue;
      }
      if(f.type==='areaWallCutOutline'){
        const alpha=Math.max(0,Math.min(1,1-progress));
        const segments=Array.isArray(f.segments)?f.segments:[];
        if(segments.length){
          const rgb=ColorService.rgbString(f.color,'255,255,255');
          ctx.save();
          ctx.beginPath();
          for(const segment of segments){
            const ax=Number(segment?.ax);
            const ay=Number(segment?.ay);
            const bx=Number(segment?.bx);
            const by=Number(segment?.by);
            if(![ax,ay,bx,by].every(Number.isFinite))continue;
            ctx.moveTo(ax,ay);
            ctx.lineTo(bx,by);
          }
          const strokeAlpha=Math.max(0,Math.min(1,Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):AttackVisualStyle.strokeAlpha));
          ctx.strokeStyle=`rgba(${rgb},${alpha*strokeAlpha})`;
          ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||AttackVisualStyle.strokeWidth);
          ctx.lineCap='round';
          ctx.lineJoin='round';
          ctx.stroke();
          ctx.restore();
        }
        continue;
      }
      if(f.type==='botDrill'){
        const alpha=1-progress,cos=Math.cos(f.angle),sin=Math.sin(f.angle),w=f.width;
        ctx.beginPath();ctx.moveTo(f.x-sin*(-w),f.y+cos*(-w));ctx.lineTo(f.x+cos*f.len-sin*(-w),f.y+sin*f.len+cos*(-w));ctx.lineTo(f.x+cos*f.len-sin*w,f.y+sin*f.len+cos*w);ctx.lineTo(f.x-sin*w,f.y+cos*w);ctx.closePath();
        const fillAlpha=Math.max(0,Math.min(1,Number.isFinite(Number(f.fillAlpha))?Number(f.fillAlpha):AttackVisualStyle.fillAlpha));
        const strokeAlpha=Math.max(0,Math.min(1,Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):AttackVisualStyle.strokeAlpha));
        ctx.fillStyle=`rgba(${f.color},${alpha*fillAlpha})`;ctx.fill();ctx.strokeStyle=`rgba(${f.color},${alpha*strokeAlpha})`;ctx.lineWidth=AttackVisualStyle.strokeWidth;ctx.stroke();continue;
      }
      if(f.type==='botSwing'){
        const alpha=1-progress;
        const points=Array.isArray(f.points)?f.points:[];
        ctx.beginPath();
        if(points.length>=3){
          ctx.moveTo(points[0].x,points[0].y);
          for(let index=1;index<points.length;index++)ctx.lineTo(points[index].x,points[index].y);
          ctx.closePath();
        }else{
          ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,f.range,f.angle-f.halfAngle,f.angle+f.halfAngle);ctx.closePath();
        }
        ctx.fillStyle=`rgba(${f.color},${alpha*AttackVisualStyle.fillAlpha})`;
        ctx.fill();
        ctx.strokeStyle=`rgba(${f.color},${alpha*AttackVisualStyle.strokeAlpha})`;
        ctx.lineWidth=AttackVisualStyle.strokeWidth;
        ctx.stroke();

        if(f.endChord===true&&points.length>=3){
          const firstArc=points[1];
          const lastArc=points[points.length-1];
          ctx.beginPath();
          ctx.moveTo(firstArc.x,firstArc.y);
          ctx.lineTo(lastArc.x,lastArc.y);
          ctx.strokeStyle=`rgba(${f.color},${alpha*.9})`;
          ctx.lineWidth=
            Math.max(
              .5,
              Number(f.endChordWidth)||
              AttackVisualStyle.strokeWidth
            );
          ctx.lineCap='round';
          ctx.stroke();
        }
        continue;
      }
      if(f.type==='underMove'){
        const variant=String(f.variant||'pulse');
        const lifeAlpha=variant==='pulse'?1-progress:Math.min(1,(1-progress)*2.2);
        const pulse=.78+.22*Math.sin(now/120);
        const baseRange=Math.max(1,Number(f.range)||33);
        const radius=variant==='pulse'?baseRange*progress:baseRange;
        const rgb=f.strokeColor||f.fillColor||ColorService.rgbString(f.color,'121,85,72');

        ctx.save();
        ctx.setLineDash(Array.isArray(f.dash)?f.dash:[5,4]);
        ctx.beginPath();
        ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb},${Math.max(0,Math.min(1,(Number(f.strokeAlpha)||.70)*lifeAlpha*pulse))})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(
          f.x,f.y,
          Math.max(3,Number(f.innerRadius)||15)*(variant==='pulse'?Math.max(.25,progress):1),
          0,Math.PI*2
        );
        ctx.fillStyle=`rgba(${f.fillColor||rgb},${Math.max(0,Math.min(1,(Number(f.fillAlpha)||.15)*lifeAlpha))})`;
        ctx.fill();
        ctx.restore();
        continue;
      }
      if(f.type==='konyeongSwing'){
        const style={
          tipRatio:Number.isFinite(Number(f.tipRatio))?Number(f.tipRatio):.7,
          fillColor:String(f.fillColor||'245,230,200'),
          strokeColor:String(f.strokeColor||'245,220,180'),
          tipColor:String(f.tipColor||'255,230,80'),
          fillAlpha:Number.isFinite(Number(f.fillAlpha))?Number(f.fillAlpha):.24,
          strokeAlpha:Number.isFinite(Number(f.strokeAlpha))?Number(f.strokeAlpha):.82,
          strokeWidth:Number.isFinite(Number(f.strokeWidth))?Number(f.strokeWidth):2,
          swingTipFillAlpha:Number.isFinite(Number(f.swingTipFillAlpha))?Number(f.swingTipFillAlpha):.58,
          swingTipStrokeAlpha:Number.isFinite(Number(f.swingTipStrokeAlpha))?Number(f.swingTipStrokeAlpha):.95,
          swingTipStrokeWidth:Number.isFinite(Number(f.swingTipStrokeWidth))?Number(f.swingTipStrokeWidth):3,
          growthSpeed:Number.isFinite(Number(f.growthSpeed))?Number(f.growthSpeed):2.2,
          outlineSegments:Math.max(8,Math.floor(Number(f.outlineSegments)||96))
        };
        const alpha=Math.max(0,Math.min(1,1-progress));
        const maxR=Math.max(0,Number(f.range)||Number(f.maxR)||0);
        const tipRatio=Math.max(0,Math.min(1,Number(f.tipRatio??style.tipRatio)));
        const tipR=maxR*tipRatio;
        const cur=maxR*Math.min(1,progress*style.growthSpeed);
        const points=Array.isArray(f.points)?f.points:[];
        const tracePolygon=()=>{
          ctx.beginPath();
          ctx.moveTo(points[0].x,points[0].y);
          for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
          ctx.closePath();
        };

        ctx.save();
        if(points.length>=3){
          tracePolygon();
          ctx.clip();
        }

        ctx.beginPath();ctx.arc(f.x,f.y,Math.max(1,cur),0,Math.PI*2);
        ctx.fillStyle=`rgba(${style.fillColor},${alpha*style.fillAlpha})`;ctx.fill();
        ctx.strokeStyle=`rgba(${style.strokeColor},${alpha*style.strokeAlpha})`;ctx.lineWidth=style.strokeWidth;
        if(points.length<3)ctx.stroke();

        if(cur>tipR){
          ctx.beginPath();ctx.arc(f.x,f.y,cur,0,Math.PI*2);ctx.arc(f.x,f.y,tipR,0,Math.PI*2,true);
          ctx.fillStyle=`rgba(${style.fillColor},${alpha*style.swingTipFillAlpha})`;ctx.fill();
        }
        if(cur>=tipR){
          ctx.beginPath();ctx.arc(f.x,f.y,tipR,0,Math.PI*2);
          ctx.strokeStyle=`rgba(${style.tipColor},${alpha*style.swingTipStrokeAlpha})`;ctx.lineWidth=style.swingTipStrokeWidth;ctx.stroke();
        }
        ctx.restore();
        if(points.length>=3&&cur>0){
          const currentGeometry=
            ProgressiveClippedAreaOutlinePresentationService.circleGeometry(
              f.x,
              f.y,
              cur,
              f.clipWallPolicy||'block',
              style.outlineSegments
            );
          ProgressiveClippedAreaOutlinePresentationService.strokePolygon(
            ctx,
            currentGeometry?.points||[],
            {
              color:style.strokeColor,
              alpha:alpha*style.strokeAlpha,
              lineWidth:style.strokeWidth
            }
          );
        }
        continue;
      }

      if(f.type==='slowZoneAppear'){
        const pulse=.5+.5*Math.sin(now*.004);
        const alpha=Math.max(0,Math.min(1,1-progress));
        const radius=Math.max(
          1,
          Number(f.r)||Number(f.range)||150
        );
        const points=Array.isArray(f.points)?f.points:[];

        if(f.damageOnly===true){
          ctx.save();
          ctx.beginPath();
          if(points.length>=3){
            ctx.moveTo(points[0].x,points[0].y);
            for(let index=1;index<points.length;index++){
              ctx.lineTo(points[index].x,points[index].y);
            }
            ctx.closePath();
          }else{
            ctx.arc(f.x,f.y,radius,0,Math.PI*2);
          }
          const damageFill=ColorService.rgbString(
            f.fillColor,
            '80,180,255'
          );
          const damageStroke=ColorService.rgbString(
            f.strokeColor,
            '100,190,255'
          );
          const damageFillAlpha=Math.max(
            0,
            Number.isFinite(Number(f.damageFillAlpha))
              ?Number(f.damageFillAlpha)
              :.18
          );
          const damageStrokeAlpha=Math.max(
            0,
            Number.isFinite(Number(f.damageStrokeAlpha))
              ?Number(f.damageStrokeAlpha)
              :.90
          );
          ctx.fillStyle=`rgba(${damageFill},${alpha*damageFillAlpha})`;
          ctx.fill();
          ctx.strokeStyle=`rgba(${damageStroke},${alpha*damageStrokeAlpha})`;
          ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2);
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.restore();
          continue;
        }

        ctx.save();
        ctx.beginPath();
        if(points.length>=3){
          ctx.moveTo(points[0].x,points[0].y);
          for(let index=1;index<points.length;index++){
            ctx.lineTo(points[index].x,points[index].y);
          }
          ctx.closePath();
        }else{
          ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        }

        const slowZoneFill=ColorService.rgbString(
          f.fillColor,
          '80,180,255'
        );
        ctx.fillStyle=
          `rgba(${slowZoneFill},${alpha*.08*(f.flatFill===true?1:(.7+.3*pulse))})`;
        ctx.fill();
        const slowZoneSource=
          EntityService.items.get(
            String(f.sourceEntityId||'')
          )||null;
        const slowZoneStroke=
          f.strokeColorMode==='source-team'&&slowZoneSource
            ?ColorService.rgbString(
              TeamColorPresentationService.colorForEntity(
                slowZoneSource,
                slowZoneSource.color||'#4af'
              ),
              '100,190,255'
            )
            :ColorService.rgbString(
              f.strokeColor,
              '100,190,255'
            );
        ctx.strokeStyle=`rgba(${slowZoneStroke},${alpha*.72})`;
        ctx.lineWidth=2;
        ctx.setLineDash(
          Array.isArray(f.dash)
            ?f.dash
            :(Array.isArray(f.lineDash)?f.lineDash:[])
        );
        ctx.stroke();
        ctx.setLineDash([]);

        if(f.damageOverlay===true){
          ctx.beginPath();
          if(points.length>=3){
            ctx.moveTo(points[0].x,points[0].y);
            for(let index=1;index<points.length;index++){
              ctx.lineTo(points[index].x,points[index].y);
            }
            ctx.closePath();
          }else{
            ctx.arc(f.x,f.y,radius,0,Math.PI*2);
          }
          const damageFillAlpha=Math.max(
            0,
            Number(f.damageFillAlpha)||.16
          );
          const damageStrokeAlpha=Math.max(
            0,
            Number(f.damageStrokeAlpha)||.88
          );
          ctx.fillStyle=`rgba(${slowZoneFill},${alpha*damageFillAlpha})`;
          ctx.fill();
          ctx.strokeStyle=`rgba(${slowZoneStroke},${alpha*damageStrokeAlpha})`;
          ctx.lineWidth=2;
          ctx.stroke();
        }

        if(f.hideCenterDecoration!==true){
          ctx.fillStyle=`rgba(130,210,255,${alpha*.65})`;
          ctx.font='bold 12px Pretendard';
          ctx.textAlign='center';
          ctx.fillText('SLOW',f.x,f.y+4);
        }
        ctx.restore();
        continue;
      }

      if(f.type==='smokeZone'){
        const progress=Math.max(0,Math.min(1,(now-(Number(f.start)||now))/Math.max(1,Number(f.dur)||1)));
        const fadeT=Math.max(0,Math.min(1,(progress-.45)/.55));
        const fade=1-(fadeT*fadeT*(3-2*fadeT));
        const pulse=(.3+.12*Math.sin(now*.004+(Number(f.x)||0)*.005))*fade;
        const radius=Math.max(1,Number(f.range)||Number(f.r)||Number(f.radius)||143);
        ctx.save();
        const grad=ctx.createRadialGradient(f.x,f.y,radius*.1,f.x,f.y,radius);
        grad.addColorStop(0,`rgba(200,200,200,${pulse*.55})`);
        grad.addColorStop(1,`rgba(160,160,160,${pulse*.18})`);
        ctx.beginPath();
        if(Array.isArray(f.points)&&f.points.length>=3){
          ctx.moveTo(f.points[0].x,f.points[0].y);
          for(let i=1;i<f.points.length;i++)ctx.lineTo(f.points[i].x,f.points[i].y);
          ctx.closePath();
        }else{
          ctx.arc(f.x,f.y,radius,0,Math.PI*2);
        }
        ctx.fillStyle=grad;
        ctx.fill();
        ctx.strokeStyle=`rgba(220,220,220,${pulse*.7})`;
        ctx.lineWidth=2;
        ctx.setLineDash([10,7]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=`rgba(200,200,200,${pulse*.45})`;
        ctx.font='bold 13px Pretendard';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillText('SMOKE',f.x,f.y+5);
        ctx.restore();
        continue;
      }

      if(
        f.type==='rulerStrike'||
        f.type==='rulerCounterStrike'
      ){
        const rulerProgress=
          Math.max(
            0,
            Math.min(
              1,
              (
                now-(Number(f.start)||now)
              )/
              Math.max(
                1,
                Number(f.dur)||GAME_DATA.frameMs
              )
            )
          );
        const alpha=Math.max(0,Math.min(1,1-rulerProgress));
        RuliRulerPresentationService.drawStrike(
          ctx,
          f,
          alpha,
          rulerProgress
        );
        continue;
      }

      if(f.type==='areaCircle'){
        if(
          String(f.renderLayer||'default')===
          'below-entities'
        )continue;

        AreaCircleEffectPresentationService.draw(
          ctx,
          f,
          now
        );
        continue;
      }

      if(f.type==='masterJustDodgeHex'){
        const fade=
          Math.max(
            0,
            1-progress
          );
        const radius=
          34+
          progress*5;
        const gradient=
          ctx.createLinearGradient(
            f.x-radius,
            f.y,
            f.x+radius,
            f.y
          );
        gradient.addColorStop(
          0,
          '#ffe34f'
        );
        gradient.addColorStop(
          1,
          '#a86cff'
        );

        ctx.save();
        ctx.translate(
          f.x,
          f.y
        );
        ctx.beginPath();

        for(let side=0;side<6;side++){
          const angle=
            side*
            Math.PI/3;
          const x=
            Math.cos(angle)*
            radius;
          const y=
            Math.sin(angle)*
            radius;

          if(side===0){
            ctx.moveTo(x,y);
          }else{
            ctx.lineTo(x,y);
          }
        }

        ctx.closePath();
        ctx.shadowColor=
          `rgba(178,116,255,${.76*fade})`;
        ctx.shadowBlur=14;
        ctx.strokeStyle=gradient;
        ctx.lineWidth=2.6;
        ctx.globalAlpha=
          .95*fade;
        ctx.stroke();

        ctx.fillStyle=
          `rgba(255,227,79,${.035*fade})`;
        ctx.fill();
        ctx.restore();
        continue;
      }

      if(f.type==='masterVictoryHexBloom'){
        const entity=f.entity;
        const centerX=
          entity?.alive
            ?Number(entity.x)||Number(f.x)||0
            :Number(f.x)||0;
        const centerY=
          entity?.alive
            ?Number(entity.y)||Number(f.y)||0
            :Number(f.y)||0;
        const t=
          Math.max(
            0,
            Math.min(
              1,
              progress
            )
          );

        const appear=
          Math.max(
            0,
            Math.min(
              1,
              t/.58
            )
          );
        const disappear=
          t>.62
            ?Math.max(
              0,
              Math.min(
                1,
                (t-.62)/.38
              )
            )
            :0;
        const alpha=
          disappear>0
            ?1-disappear
            :Math.min(
              1,
              appear*1.25
            );
        const radius=
          18+
          appear*28;

        const gradient=
          ctx.createLinearGradient(
            centerX-radius,
            centerY,
            centerX+radius,
            centerY
          );
        gradient.addColorStop(
          0,
          '#ffe34f'
        );
        gradient.addColorStop(
          .50,
          '#ffd15a'
        );
        gradient.addColorStop(
          1,
          '#a86cff'
        );

        const drawHex=()=>{
          ctx.beginPath();
          for(let side=0;side<6;side++){
            const angle=
              -Math.PI/2+
              side*
              Math.PI/3;
            const x=
              centerX+
              Math.cos(angle)*
              radius;
            const y=
              centerY+
              Math.sin(angle)*
              radius;

            if(side===0){
              ctx.moveTo(
                x,
                y
              );
            }else{
              ctx.lineTo(
                x,
                y
              );
            }
          }
          ctx.closePath();
          ctx.globalAlpha=
            .94*alpha;
          ctx.strokeStyle=gradient;
          ctx.lineWidth=
            2.8-
            appear*.5;
          ctx.shadowColor=
            `rgba(178,116,255,${.78*alpha})`;
          ctx.shadowBlur=
            14+
            appear*4;
          ctx.stroke();

          ctx.fillStyle=
            `rgba(255,227,79,${.045*alpha})`;
          ctx.fill();
        };

        ctx.save();

        if(disappear>0){
          // 저스트 회피/마스터 홀로그램 계열처럼 가로 조각으로 깨지며 소멸.
          const stripCount=9;
          const fullHeight=
            radius*2+
            12;
          const stripHeight=
            fullHeight/
            stripCount;

          for(let index=0;index<stripCount;index++){
            ctx.save();

            const stripY=
              centerY-
              fullHeight/2+
              index*
              stripHeight;

            ctx.beginPath();
            ctx.rect(
              centerX-radius-18,
              stripY,
              radius*2+36,
              stripHeight+.8
            );
            ctx.clip();

            const direction=
              index%2===0
                ?1
                :-1;
            ctx.translate(
              direction*
              disappear*
              (
                3+
                index*1.15
              ),
              0
            );

            drawHex();
            ctx.restore();
          }
        }else{
          drawHex();
        }

        ctx.restore();
        continue;
      }

      if(f.type==='masterEliminationHex'){
        const fade=
          Math.max(
            0,
            1-progress
          );
        const holdAlpha=
          progress<.62
            ?1
            :Math.max(
              0,
              1-
              (
                progress-.62
              )/.38
            );
        const glitch=
          progress>.68
            ?Math.min(
              1,
              (progress-.68)/.32
            )
            :0;
        const radius=
          48+
          7*
          Math.min(
            1,
            progress*2
          );

        const gradient=
          ctx.createLinearGradient(
            f.x-radius,
            f.y,
            f.x+radius,
            f.y
          );
        gradient.addColorStop(
          0,
          '#ffe34f'
        );
        gradient.addColorStop(
          .48,
          '#ffd15a'
        );
        gradient.addColorStop(
          1,
          '#a86cff'
        );

        const drawMark=()=>{
          ctx.save();
          const hoverY=
            f.y-
            28-
            progress*28+
            Math.sin(
              progress*Math.PI*2.2
            )*3.5;
          ctx.translate(
            f.x,
            hoverY
          );

          ctx.shadowColor=
            `rgba(176,104,255,${.84*fade})`;
          ctx.shadowBlur=18;

          for(const scale of [1,.72]){
            ctx.beginPath();

            for(let index=0;index<6;index++){
              const angle=
                -Math.PI/2+
                Math.PI*2*
                index/6;
              const px=
                Math.cos(angle)*
                radius*
                scale;
              const py=
                Math.sin(angle)*
                radius*
                scale;

              if(index===0){
                ctx.moveTo(px,py);
              }else{
                ctx.lineTo(px,py);
              }
            }

            ctx.closePath();
            ctx.strokeStyle=gradient;
            ctx.globalAlpha=
              (
                scale===1
                  ?.98
                  :.58
              )*
              fade;
            ctx.lineWidth=
              scale===1
                ?3
                :1.5;
            ctx.stroke();
          }

          ctx.shadowColor=
            `rgba(255,222,79,${.82*fade})`;
          ctx.shadowBlur=20;
          ctx.globalAlpha=
            .98*
            holdAlpha;
          ctx.fillStyle=gradient;
          ctx.font=
            '900 31px Pretendard';
          ctx.textAlign='center';
          ctx.textBaseline='middle';

          ctx.strokeStyle=
            `rgba(15,10,25,${.76*holdAlpha})`;
          ctx.lineWidth=4;
          ctx.strokeText(
            String(f.roman||'III'),
            0,
            1
          );
          ctx.fillText(
            String(f.roman||'III'),
            0,
            1
          );

          ctx.restore();
        };

        // 상승 방향을 명확하게 보여주는 세로 홀로그램 잔광.
        const trailTop=
          f.y-
          22-
          progress*26;
        const trailBottom=
          f.y+
          8;
        const trailGradient=
          ctx.createLinearGradient(
            f.x,
            trailBottom,
            f.x,
            trailTop
          );
        trailGradient.addColorStop(
          0,
          'rgba(168,108,255,0)'
        );
        trailGradient.addColorStop(
          .55,
          `rgba(168,108,255,${.20*fade})`
        );
        trailGradient.addColorStop(
          1,
          `rgba(255,227,79,${.48*fade})`
        );
        ctx.save();
        ctx.strokeStyle=trailGradient;
        ctx.lineWidth=2;
        ctx.shadowColor=
          `rgba(178,116,255,${.55*fade})`;
        ctx.shadowBlur=10;
        ctx.beginPath();
        ctx.moveTo(
          f.x,
          trailBottom
        );
        ctx.lineTo(
          f.x,
          trailTop
        );
        ctx.stroke();
        ctx.restore();

        ctx.save();

        if(glitch>0){
          for(let index=0;index<10;index++){
            ctx.save();
            const hoverBaseY=
              f.y-
              28-
              progress*28+
              Math.sin(
                progress*Math.PI*2.2
              )*3.5;
            const stripY=
              hoverBaseY-66+
              index*13;
            ctx.beginPath();
            ctx.rect(
              f.x-78,
              stripY,
              156,
              10
            );
            ctx.clip();
            ctx.translate(
              (
                index%2===0
                  ?1
                  :-1
              )*
              glitch*
              (4+index*1.35),
              0
            );
            drawMark();
            ctx.restore();
          }
        }else{
          drawMark();
        }

        ctx.restore();
        continue;
      }

      if(f.type==='effectShape'){
        const a=Math.max(0,1-progress);
        const rgb=ColorService.rgbString(
          f.color||f.strokeColor,
          '200,216,240'
        );
        const fillAlpha=
          Math.max(
            0,
            Math.min(
              1,
              Number.isFinite(Number(f.fillAlpha))
                ?Number(f.fillAlpha)
                :.18
            )
          );
        const strokeAlpha=
          Math.max(
            0,
            Math.min(
              1,
              Number.isFinite(Number(f.strokeAlpha))
                ?Number(f.strokeAlpha)
                :.75
            )
          );

        ctx.save();
        ctx.beginPath();

        if(
          Array.isArray(f.points)&&
          f.points.length>=3
        ){
          ctx.moveTo(
            Number(f.points[0].x)||0,
            Number(f.points[0].y)||0
          );
          for(let index=1;index<f.points.length;index++){
            ctx.lineTo(
              Number(f.points[index].x)||0,
              Number(f.points[index].y)||0
            );
          }
          ctx.closePath();
        }else if(String(f.shape||'')==='rect'){
          const range=Math.max(
            0,
            Number(f.range)||Number(f.len)||0
          );
          const halfWidth=Math.max(
            0,
            Number(f.halfWidth)||Number(f.width)||0
          );
          const angle=Number(f.angle)||0;
          const ux=Math.cos(angle);
          const uy=Math.sin(angle);
          const vx=-uy;
          const vy=ux;
          const x=Number(f.x)||0;
          const y=Number(f.y)||0;

          ctx.moveTo(
            x+vx*halfWidth,
            y+vy*halfWidth
          );
          ctx.lineTo(
            x+ux*range+vx*halfWidth,
            y+uy*range+vy*halfWidth
          );
          ctx.lineTo(
            x+ux*range-vx*halfWidth,
            y+uy*range-vy*halfWidth
          );
          ctx.lineTo(
            x-vx*halfWidth,
            y-vy*halfWidth
          );
          ctx.closePath();
        }else{
          const radius=Math.max(
            1,
            Number(f.r)||
            Number(f.radius)||
            Number(f.range)||
            20
          );
          ctx.arc(
            Number(f.x)||0,
            Number(f.y)||0,
            radius,
            0,
            Math.PI*2
          );
        }

        ctx.fillStyle=
          `rgba(${rgb},${a*fillAlpha})`;
        ctx.fill();
        ctx.strokeStyle=
          `rgba(${rgb},${a*strokeAlpha})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(f.lineWidth)||2
          );
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='dodge'){
        const rgb=ColorService.rgbString(
          f.color||f.col||f.strokeColor,
          '170,210,255'
        );
        ctx.beginPath();
        ctx.arc(f.x,f.y,22+24*progress,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb},${.55*(1-progress)})`;
        ctx.lineWidth=2;
        ctx.stroke();
        continue;
      }
      if(f.type==='counterCharge'){
        const entity=f.entity;
        const cx=entity?.x??f.x;
        const cy=entity?.y??f.y;
        const radius=Math.max(34,(f.maxR||f.r||30)+12);
        const alpha=.95*(1-progress);
        const rgb=ColorService.rgbString(
          f.color||f.col||f.strokeColor,
          '255,215,0'
        );

        ctx.save();
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius,
          -Math.PI/2,
          -Math.PI/2+Math.PI*2*progress
        );
        ctx.strokeStyle=`rgba(${rgb},${alpha})`;
        ctx.lineWidth=5;
        ctx.lineCap='round';
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='counter'){
        const color=ColorService.rgbString(f.color);
        const alpha=1-progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
          f.x,
          f.y,
          20+40*progress,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=`rgba(${color},${alpha})`;
        ctx.lineWidth=3;
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if(f.type==='dash-line'){
        const alpha=(1-progress)*(Number(f.alpha)||.4);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.x,f.y);
        ctx.lineTo(f.tx,f.ty);
        ctx.strokeStyle=`rgba(${f.color||'255,255,255'},${alpha})`;
        ctx.lineWidth=Math.max(.5,Number(f.width)||6);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      ctx.beginPath();ctx.arc(f.x,f.y,20+40*progress,0,Math.PI*2);
      ctx.strokeStyle=f.type==='justdodge'?`rgba(255,215,0,${1-progress})`:`rgba(255,80,40,${1-progress})`;
      ctx.lineWidth=3;ctx.stroke();
    }

    OwnedFieldManagementPresentationService.draw(
      ctx,
      this.player
    );

    // 공격 선딜 범위/미리보기는 모든 엔티티 본체보다 아래 레이어에 렌더한다.
    if(this.player?.alive){
      TrainingWorldDrawService.drawAttackPreview(
        ctx,
        this.player,
        this.player.attackPreview||this.player.aimAttackPreview,
        now
      );
      CounterModuleService.drawProjectilePreviews(
        ctx,
        this.player,
        now
      );
    }

    ModeGearPresentationService.drawDeathRemnants(ctx,now);
    for(const e of EntityService.items.values()){
      if(!e.alive||e.hidden)continue;
      if(e.kind==='trainingBot'){
        const squash=EntitySquashPresentationService.sample(e,now);

        ctx.save();
        ctx.translate(e.x+squash.offsetX,e.y+squash.offsetY);
        ctx.rotate(squash.rotation);
        ctx.scale(squash.scaleX,squash.scaleY);

        ctx.beginPath();
        ctx.arc(0,0,e.radius,0,Math.PI*2);
        ctx.fillStyle=e.color+'44';
        ctx.fill();
        ctx.strokeStyle=e.color;
        ctx.lineWidth=2.5;
        ctx.stroke();

        if(squash.flash){
          ctx.beginPath();
          ctx.arc(0,0,Math.max(0,e.radius-.75),0,Math.PI*2);
          ctx.fillStyle='rgba(255,255,255,.92)';
          ctx.fill();
        }

        ctx.restore();

        const name=e.botType==='melee'?'근거리 봇':'원거리 봇';ctx.fillStyle=e.color;ctx.font='bold 11px Pretendard';ctx.textAlign='center';ctx.fillText(name,e.x,e.y-e.radius-23);
        const bw=e.radius*2,bh=4,bx=e.x-e.radius,by=e.y-e.radius-14;
        const hpDisplay=WorldHealthBarPresentationService.ratio(
          e,
          now,
          (this.lastFrameDt||GAME_DATA.frameMs)/GAME_DATA.frameMs
        );
        ctx.fillStyle='#222';ctx.fillRect(bx,by,bw,bh);
        ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillRect(bx,by,bw*hpDisplay.trail,bh);
        ctx.fillStyle=e.color;ctx.fillRect(bx,by,bw*hpDisplay.current,bh);
        const shieldPct=e.maxHealth>0?ShieldService.current(e)/e.maxHealth:0;
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
        NaturalHealthRegenGaugePresentationService.draw(
          ctx,
          e,
          bx,
          by+bh+2,
          bw,
          now
        );
        StatusPresentation.draw(ctx,e,now);
        if(this.sessionMode==='training'&&this.settings.showCooldown){
          const config=GAME_DATA.trainingBots[e.botType];
          const slot=config?.cycle[e.attackIndex%config.cycle.length];
          const cdMax=this.botCadenceMs(e.botType,config?.intervals?.[slot]||1000);
          const ratio=e.phaseTimer>0?Math.min(1,e.phaseTimer/cdMax):0,cy=e.y+e.radius+4;ctx.fillStyle='#222';ctx.fillRect(e.x-e.radius,cy,bw,4);ctx.fillStyle=ratio>.3?'#fa6':'#f44';ctx.fillRect(e.x-e.radius,cy,bw*(1-ratio),4)
        }
      }else if(e.kind==='dummy'){
        TrainingWorldDrawService.drawEntity(ctx,this,e,'더미',TrainingWorldDrawService.emptyOptions,now);
      }else if(e.kind==='summon'){
        TrainingWorldDrawService.drawEntity(
          ctx,
          this,
          e,
          e.displayName||'소환수',
          TrainingWorldDrawService.summonBodyOptions,
          now
        );
      }else if(e===this.player){
        TrainingWorldDrawService.drawEntity(
          ctx,
          this,
          e,
          WorldNamePresentationService.label(e),
          TrainingWorldDrawService.emptyOptions,
          now
        );
      }else if(e.kind==='player'){
        TrainingWorldDrawService.drawEntity(
          ctx,
          this,
          e,
          WorldNamePresentationService.label(e),
          TrainingWorldDrawService.emptyOptions,
          now
        );
      }
    }

    // 사이엔 조건부 대상 연결선은 캐릭터/소환수 본체보다 위에서 렌더해 가려지지 않게 한다.
    ConditionalTargetLinkPresentationService.draw(
      ctx,
      this.player
    );

    // 디라가 음식을 보유 중이면 자기 자신을 포함한 아군별 음식 지정 가능 범위를 표시한다.
    CookingService.drawMealTargetRanges(
      ctx,
      this.player
    );

    // 피해 인디케이터는 일반 월드 FX와 달리 캐릭터 위 레이어에서 렌더한다.
    for(const f of this.fx){
      if(f?.type!=='dmgNum'||f.visible===false)continue;
      const progress=Math.max(0,Math.min(1,(now-f.start)/Math.max(1,f.dur)));
      ctx.save();
      ctx.globalAlpha=1-progress;
      ctx.fillStyle=f.col||'#ff6060';
      ctx.font=`bold ${f.size||19}px Pretendard`;
      ctx.textAlign='center';
      ctx.fillText(f.text,f.x,f.y-progress*22);
      ctx.restore();
    }

    if(this.sessionMode==='training'&&this.settings.showDps&&this.player?.alive){
      const dps=this.currentDps(now);
      ctx.save();
      ctx.textAlign='center';
      ctx.font='bold 10px Pretendard';
      ctx.fillStyle='rgba(177,199,218,.78)';
      const statusTopY=
        StatusPresentation.topLabelY(
          this.player,
          now
        );
      const dpsY=Math.min(
        this.player.y-this.player.radius-46,
        statusTopY-15
      );

      ctx.fillText(
        `DPS ${dps.toFixed(1)} · 콤보 ${this.stats.comboHits}`,
        this.player.x,
        dpsY
      );
      ctx.restore();
    }




    // 모든 일반 월드 이펙트는 캐릭터 아래에 있고, K.O. 레이저만 예외로 위에 그린다.
    for(const f of this.fx){
      if(
        f?.type!=='koBeam'||
        f.visible===false||
        !EffectPresentationVisibilityService.visible(f)
      )continue;
      KoBeamPresentationService.draw(ctx,f,now);
    }


    if(
      this.spectating&&
      this.spectator.followPid
    ){
      const followed=
        this.spectatorFollowEntity();

      if(followed){
        const viewWidth=
          GAME_DATA.canvas.width;
        const viewHeight=
          GAME_DATA.canvas.height;
        const overscanRatio=
          Math.max(
            0,
            Number(
              GAME_DATA.cameraFollow
                .edgeOverscanRatio
            )||0
          );
        const overscanX=
          viewWidth*overscanRatio;
        const overscanY=
          viewHeight*overscanRatio;
        const minViewX=-overscanX;
        const maxViewX=Math.max(
          minViewX,
          WorldBoundsService.width()-
            viewWidth+
            overscanX
        );
        const minViewY=-overscanY;
        const maxViewY=Math.max(
          minViewY,
          WorldBoundsService.height()-
            viewHeight+
            overscanY
        );
        const viewX=Math.max(
          minViewX,
          Math.min(
            maxViewX,
            followed.x-viewWidth/2
          )
        );
        const viewY=Math.max(
          minViewY,
          Math.min(
            maxViewY,
            followed.y-viewHeight/2
          )
        );

        ctx.save();
        ctx.strokeStyle=
          'rgba(190,196,204,.78)';
        ctx.lineWidth=2;
        ctx.setLineDash([]);
        ctx.strokeRect(
          viewX,
          viewY,
          viewWidth,
          viewHeight
        );
        ctx.restore();
      }
    }

    ctx.restore();

    if(
      !(
        typeof DebugMapEditorService!=='undefined'&&
        DebugMapEditorService.active
      )&&
      !(
        this.sessionMode==='online'&&
        OnlineDuelService.mode===
          MatchModeService.FFA&&
        !this.player?.alive
      )
    ){
      CombatScreenFeedback.draw(
        ctx,
        c.width,
        c.height,
        this.player,
        now
      );
    }

    if(this.koFlashUntil>now){
      const flash=Math.max(0,Math.min(1,(this.koFlashUntil-now)/145));
      ctx.save();
      ctx.fillStyle=`rgba(255,250,235,${flash*.46})`;
      ctx.fillRect(0,0,c.width,c.height);
      ctx.restore();
    }

    if(
      this.spectating&&
      !(
        typeof DebugMapEditorService!=='undefined'&&
        DebugMapEditorService.active
      )
    ){
      ctx.save();

      const ffaOnline=
        this.sessionMode==='online'&&
        OnlineDuelService.mode===
          MatchModeService.FFA;
      const spectatorOnly=
        this.onlineConfig?.spectatorOnly===true;

      if(!ffaOnline&&!spectatorOnly){
        ctx.fillStyle='rgba(145,0,0,.13)';
        ctx.fillRect(
          0,
          0,
          c.width,
          c.height
        );
      }

      ctx.textAlign='center';

      const spectatorMessageY=
        c.height*.29;

      if(this.playerRespawnAt>0){
        const remain=
          Math.max(
            0,
            (this.playerRespawnAt-now)/1000
          );
        ctx.font='bold 18px Pretendard';
        ctx.fillStyle=
          'rgba(255,230,230,.94)';
        ctx.fillText(
          `${remain.toFixed(1)}초 뒤 부활`,
          c.width/2,
          spectatorMessageY-26
        );
      }

      ctx.font='bold 19px Pretendard';
      ctx.fillStyle=
        'rgba(225,235,245,.94)';
      ctx.fillText(
        spectatorOnly
          ?'관전 중'
          :'전투 대기 중',
        c.width/2,
        spectatorMessageY
      );

      if(spectatorOnly){
        ctx.font='11px Pretendard';
        ctx.fillStyle=
          'rgba(195,205,218,.72)';
        ctx.fillText(
          this.spectator.followPid
            ?'우클릭으로 자유 관전'
            :'좌클릭으로 플레이어 관전',
          c.width/2,
          spectatorMessageY+22
        );
      }

      ctx.restore();
    }

    if(
      this.sessionMode==='online'&&
      !this.onlineConfig?.spectatorOnly&&
      OnlineDuelService.mode===
        MatchModeService.FFA&&
      !this.player?.alive&&
      !OnlineDuelService.roundResolving
    ){
      ctx.save();
      ctx.textAlign='center';
      ctx.font='bold 19px Pretendard';
      ctx.fillStyle=
        'rgba(225,235,245,.94)';
      ctx.fillText(
        '전투 대기 중',
        c.width/2,
        c.height*.29
      );
      const killerName=
        this.lastDeathSourcePid
          ?PlayerDisplayNameService.resolve(
            this.lastDeathSourcePid
          )
          :'알 수 없는 상대';

      ctx.font='12px Pretendard';
      ctx.fillStyle=
        'rgba(210,150,150,.84)';
      ctx.fillText(
        `${killerName}에게 죽었습니다!`,
        c.width/2,
        c.height*.29+25
      );

      ctx.font='11px Pretendard';
      ctx.fillStyle=
        'rgba(195,205,218,.72)';
      ctx.fillText(
        this.spectator.followPid
          ?'우클릭으로 자유 관전'
          :'좌클릭으로 플레이어 관전',
        c.width/2,
        c.height*.29+45
      );

      ctx.restore();
    }

    /* 상단 표시 */
    ctx.save();
    ctx.font='12px Pretendard';ctx.fillStyle='rgba(180,200,255,.65)';ctx.textAlign='left';
    const topStatusText=
      this.onlineConfig?.spectatorOnly
        ?'관전  |  온라인'
        :`${this.player?.character?.name||'플레이어'}  |  ${this.sessionMode==='online'?(RoomService.isHost?'방장':'참가자'):'훈련장'}`;
    ctx.fillText(
      topStatusText,
      10,
      20
    );

    /* 미니맵 */
    const mw=140;
    const mh=Math.round(
      mw*
      WorldBoundsService.height()/
      WorldBoundsService.width()
    );
    const mx=c.width-mw-10;
    const my=10;
    const sx=mw/WorldBoundsService.width();
    const sy=mh/WorldBoundsService.height();

    // 카메라가 맵 우상단에 붙었을 때 플레이어의 화면 좌표가
    // 미니맵과 겹치면 미니맵 전체를 반투명하게 만든다.
    // 은신으로 적에게 숨겨진 Entity는 미니맵 점뿐 아니라 이 겹침 계산에서도 제외한다.
    const minimapNow=performance.now();
    const minimapViewer=this.player;
    const visibleOnMinimap=entity=>(
      !!entity&&
      !entity.hidden&&
      !StealthPresentationService.state(
        minimapViewer,
        entity,
        minimapNow
      ).hideWorldUi
    );

    let overlapsMinimap=
      visibleOnMinimap(this.player)&&
      TrainingWorldDrawService.overlapsScreenRect(
        this.player,
        cam,
        mx,
        my,
        mw,
        mh
      );

    if(!overlapsMinimap){
      for(const entity of this.remotePlayers.values()){
        if(
          !visibleOnMinimap(entity)
        )continue;
        if(
          TrainingWorldDrawService.overlapsScreenRect(
            entity,
            cam,
            mx,
            my,
            mw,
            mh
          )
        ){
          overlapsMinimap=true;
          break;
        }
      }
    }

    ctx.save();
    ctx.globalAlpha=
      overlapsMinimap
        ?.34
        :1;

    ctx.fillStyle='rgba(0,0,0,.55)';
    ctx.fillRect(mx,my,mw,mh);
    ctx.strokeStyle='rgba(100,160,255,.3)';
    ctx.lineWidth=1;
    ctx.strokeRect(mx,my,mw,mh);
    ctx.fillStyle='rgba(100,160,255,.4)';
    for(const w of DebugMapService.walls()){
      ctx.fillRect(
        mx+w.x*sx,
        my+w.y*sy,
        w.w*sx,
        w.h*sy
      );
    }

    for(const w of DynamicWallService.all()){
      const rgb=ColorService.rgbString(
        w.color||'#b5652b',
        '181,101,43'
      );
      ctx.fillStyle=`rgba(${rgb},.58)`;
      ctx.strokeStyle=`rgba(${rgb},.95)`;
      ctx.lineWidth=1;
      ctx.fillRect(
        mx+w.x*sx,
        my+w.y*sy,
        Math.max(1,w.w*sx),
        Math.max(1,w.h*sy)
      );
      ctx.strokeRect(
        mx+w.x*sx+.5,
        my+w.y*sy+.5,
        Math.max(0,w.w*sx-1),
        Math.max(0,w.h*sy-1)
      );
    }

    ctx.strokeStyle='rgba(255,255,255,.12)';
    ctx.strokeRect(
      mx+cam.x*sx,
      my+cam.y*sy,
      c.width*sx,
      c.height*sy
    );

    if(this.player?.alive&&visibleOnMinimap(this.player)){
      ctx.beginPath();
      ctx.arc(
        mx+this.player.x*sx,
        my+this.player.y*sy,
        3,
        0,
        Math.PI*2
      );
      ctx.fillStyle=
        this.sessionMode==='online'
          ?TeamColorPresentationService
            .colorForEntity(
              this.player,
              this.player.color
            )
          :this.player.color;
      ctx.fill();
    }

    if(this.sessionMode==='online'){
      for(const remote of this.remotePlayers.values()){
        if(!remote?.alive||!visibleOnMinimap(remote))continue;
        ctx.beginPath();
        ctx.arc(
          mx+remote.x*sx,
          my+remote.y*sy,
          3,
          0,
          Math.PI*2
        );
        ctx.fillStyle=
          TeamColorPresentationService
            .colorForEntity(
              remote,
              remote.color
            );
        ctx.fill();
      }
    }

    // 모든 소환수는 소유 팀 색으로 반투명하게 표시한다.
    for(const summon of EntityService.items.values()){
      if(
        summon?.kind!=='summon'||
        !summon.alive||
        !visibleOnMinimap(summon)
      )continue;

      ctx.save();
      ctx.globalAlpha*=.55;
      ctx.beginPath();
      ctx.arc(
        mx+summon.x*sx,
        my+summon.y*sy,
        2.5,
        0,
        Math.PI*2
      );
      ctx.fillStyle=
        TeamColorPresentationService
          .colorForEntity(
            summon,
            summon.color
          );
      ctx.fill();
      ctx.restore();
    }

    for(const dummy of this.dummies){
      if(!dummy?.alive||!visibleOnMinimap(dummy))continue;
      ctx.beginPath();
      ctx.arc(
        mx+dummy.x*sx,
        my+dummy.y*sy,
        3,
        0,
        Math.PI*2
      );
      ctx.fillStyle=dummy.color;
      ctx.fill();
    }

    for(const bot of this.bots){
      if(!bot?.alive||!visibleOnMinimap(bot))continue;
      ctx.beginPath();
      ctx.arc(
        mx+bot.x*sx,
        my+bot.y*sy,
        3,
        0,
        Math.PI*2
      );
      ctx.fillStyle=bot.color;
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  },
  syncHud(){
    const p=this.player;

    if(!this.hudRefs){
      this.hudRefs={
        localLabel:document.getElementById('local-label'),
        localHp:document.getElementById('local-hp'),
        localHpTrail:document.getElementById('local-hp-trail'),
        localWrenchBg:document.getElementById('local-van-wrench-bg'),
        localWrench:document.getElementById('local-van-wrench-fill'),
        localShieldBg:document.getElementById('local-shield-bg'),
        localShield:document.getElementById('local-shield'),
        localSt:document.getElementById('local-st'),
        localHealthWrap:document.getElementById('local-health-wrap'),
        mid:document.getElementById('hud-mid'),
        stats:document.getElementById('training-stats')
      };
    }

    const refs=this.hudRefs;
    const state=this.hudRenderState;
    const now=performance.now();

    if(p){
      const hp=Math.max(
        0,
        Math.min(p.maxHealth,p.health)
      );
      const shield=ShieldService.current(p);
      const stamina=Math.max(
        0,
        Math.min(p.maxStamina,p.stamina)
      );
      const hpRounded=Math.round(hp);
      const staminaRounded=Math.round(stamina);
      const maxHealthRounded=
        Math.round(p.maxHealth);

      const localLabel=
        `${WorldNamePresentationService.label(p)}: ${hpRounded} / ${maxHealthRounded}`;

      if(state.localLabel!==localLabel){
        state.localLabel=localLabel;
        refs.localLabel.textContent=localLabel;
      }

      const localTeamColor=
        this.sessionMode==='online'
          ?TeamColorPresentationService.colorForEntity(
            p,
            p.color||'#4af'
          )
          :(p.color||'#4af');
      if(state.localTeamColor!==localTeamColor){
        state.localTeamColor=localTeamColor;
        refs.localHp.style.background=localTeamColor;
      }

      HealthBarPresentationService.sync(
        refs.localHp,
        refs.localHpTrail,
        p.maxHealth>0
          ?hp/p.maxHealth*100
          :0,
        state,
        'localHpWidth'
      );

      const localWrenchMax=Math.max(
        0,
        Number(p.character?.wrenchDurability?.max)||0
      );
      const localWrenchVisible=
        !!p.character?.wrenchDurability&&
        localWrenchMax>0;
      if(state.localWrenchVisible!==localWrenchVisible){
        state.localWrenchVisible=localWrenchVisible;
        refs.localWrenchBg.hidden=!localWrenchVisible;
        refs.localHealthWrap.classList.toggle(
          'has-van-wrench',
          localWrenchVisible
        );
      }
      const localWrenchValue=
        localWrenchVisible
          ?VanWrenchDurabilityPresentationService.value(p)
          :0;
      const localWrenchWidth=
        localWrenchMax>0
          ?Math.max(0,Math.min(100,localWrenchValue/localWrenchMax*100))
          :0;
      if(state.localWrenchWidth!==localWrenchWidth){
        state.localWrenchWidth=localWrenchWidth;
        refs.localWrench.style.width=`${localWrenchWidth}%`;
      }
      const localWrenchColor=String(
        p.character?.color||'#9fcf55'
      );
      if(state.localWrenchColor!==localWrenchColor){
        state.localWrenchColor=localWrenchColor;
        refs.localWrench.style.background=localWrenchColor;
      }

      const localShieldVisible=shield>0;
      if(state.localShieldVisible!==localShieldVisible){
        state.localShieldVisible=localShieldVisible;
        refs.localShieldBg.style.display=
          localShieldVisible
            ?''
            :'none';
      }

      const localShieldWidth=
        p.maxHealth>0
          ?shield/p.maxHealth*100
          :0;
      if(state.localShieldWidth!==localShieldWidth){
        state.localShieldWidth=localShieldWidth;
        refs.localShield.style.width=`${localShieldWidth}%`;
      }

      const localStWidth=
        p.maxStamina>0
          ?stamina/p.maxStamina*100
          :0;

      if(state.localStWidth!==localStWidth){
        state.localStWidth=localStWidth;
        refs.localSt.style.width=
          `${localStWidth}%`;
      }

      RecipientAssignmentPresentationService.syncHud(
        refs.localHealthWrap,
        p
      );

      const counterReady=
        (p.counterReadyUntil||0)>now;
      const midText=
        !p.alive
          ?''
          :counterReady
            ?`스테미나: ${staminaRounded} / ${Math.round(p.maxStamina)}  ·  COUNTER READY`
            :`스테미나: ${staminaRounded} / ${Math.round(p.maxStamina)}`;

      if(state.midText!==midText){
        state.midText=midText;
        refs.mid.textContent=midText;
      }
    }else if(refs.mid){
      refs.mid.textContent='';
    }

    CombatHudRosterService.beginFrame();
    let remoteHudSignature='';

    if(this.sessionMode==='online'){
      for(const pid of OnlineDuelService.remotePids){
        const entity=this.remotePlayers.get(pid);
        if(!entity)continue;

        CombatHudRosterService.markActive(pid);
        remoteHudSignature+=
          `${remoteHudSignature?'|':''}${pid}`;

        CombatHudRosterService.update(
          entity,
          pid
        );
      }
    }else{
      const remote=
        this.dummy&&
        EntityService.items.has(this.dummy.id)
          ?this.dummy
          :this.dummies.find(
            entity=>
              entity&&
              EntityService.items.has(entity.id)
          )||
          null;

      if(remote){
        CombatHudRosterService.markActive(
          remote.id
        );
        remoteHudSignature=remote.id;
        CombatHudRosterService.update(
          remote,
          remote.id
        );
      }
    }

    CombatHudRosterService.removeUnused();

    if(
      state.remoteHudSignature!==
        remoteHudSignature
    ){
      state.remoteHudSignature=
        remoteHudSignature;
      requestAnimationFrame(
        ()=>CombatHudRosterService.layout()
      );
    }

    if(state.statsHidden!==true){
      state.statsHidden=true;
      if(refs.stats){
        refs.stats.style.display='none';
      }
    }
  },
  loop(now){
    if(!this.active)return;
    const dt=Math.min(
      40,
      now-this.lastFrame||GAME_DATA.frameMs
    );
    this.lastFrame=now;
    this.update(dt,now);
    this.draw();
    this.raf=requestAnimationFrame(this.loopFrame);
  },
  resize(){
    const c=document.getElementById('gameCanvas');
    const vw=innerWidth;
    const vh=innerHeight;
    let w,h;

    if(vw/vh>=GAME_DATA.canvas.aspect){
      h=vh;
      w=Math.floor(h*GAME_DATA.canvas.aspect);
    }else{
      w=vw;
      h=Math.floor(w/GAME_DATA.canvas.aspect);
    }

    c.width=GAME_DATA.canvas.width;
    c.height=GAME_DATA.canvas.height;
    c.style.width=`${w}px`;
    c.style.height=`${h}px`;
    this.fitUi();
    requestAnimationFrame(
      ()=>CombatHudRosterService.layout()
    );
  },
  fitUi(panel=null,narrow=false){
    const hud=document.getElementById('hud');
    const canvas=document.getElementById('gameCanvas');
    const menu=document.getElementById('training-hud');
    const hr=hud.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
    const center=hr.left+hr.width/2;
    menu.style.left=`${center}px`;
    menu.style.bottom='auto';
    menu.style.top='0px';
    const menuTop=Math.max(8,hr.top-(menu.getBoundingClientRect().height||38)-6);
    menu.style.top=`${menuTop}px`;
    if(!panel)return;
    const left=Math.max(hr.left,cr.left),right=Math.min(hr.right,cr.right),available=Math.max(280,right-left);
    const width=narrow?Math.min(430,available-28):Math.min(980,available-28);
    panel.style.left=`${left+available/2}px`;
    panel.style.bottom=`${Math.max(8,innerHeight-menuTop+7)}px`;
    panel.style.width=`${Math.max(narrow?320:480,width)}px`;
    panel.style.maxHeight=`${Math.max(narrow?260:300,Math.min(narrow?470:620,cr.height*(narrow?.58:.65),menuTop-16))}px`;
  },
  buildHud(){
    const hud=document.getElementById('training-hud');hud.replaceChildren();hud.style.display='flex';
    const make=(label,action,panelId='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.panelId=panelId;b.sync=()=>b.classList.toggle('active',!!(panelId&&document.getElementById(panelId)));b.onclick=()=>{action();requestAnimationFrame(()=>{document.querySelectorAll('#training-hud button').forEach(x=>x.sync?.());this.fitUi()})};b.sync();return b};
    if(this.sessionMode==='online'){hud.style.display='none';return}
    hud.append(
      make('설정',()=>this.openSettings(),'training-settings-panel'),
      make('캐릭터',()=>this.openCharacters(),'training-char-panel'),
      make('증강',()=>this.openAugments(),'training-aug-panel')
    );

    const sep=document.createElement('span');sep.className='training-separator';hud.append(sep,make('리셋',()=>this.reset()),make('나가기',()=>this.exit()));this.fitUi();
  },
  closePanels(except=''){
    CharacterTooltip.hide();
    for(const id of [
      'training-settings-panel',
      'training-char-panel',
      'training-aug-panel'
    ]){
      if(id!==except)document.getElementById(id)?.remove();
    }
    requestAnimationFrame(()=>
      document.querySelectorAll('#training-hud button').forEach(
        button=>button.sync?.()
      )
    );
  },
  panel(title,id,narrow=false,sub=''){
    const old=document.getElementById(id);if(old){old.remove();this.closePanels();return null}
    this.closePanels(id);
    const panel=document.createElement('div');panel.id=id;panel.className='training-simple-panel'+(narrow?' narrow':'');
    const header=document.createElement('div');header.className='training-simple-header';
    const titleWrap=document.createElement('div');
    const heading=document.createElement('span');heading.className='training-simple-title';heading.textContent=title;titleWrap.appendChild(heading);
    if(sub){const subtitle=document.createElement('span');subtitle.className='training-simple-sub';subtitle.textContent=sub;titleWrap.appendChild(subtitle)}
    const close=document.createElement('button');close.type='button';close.className='training-simple-close';close.textContent='×';close.onclick=()=>{panel.remove();this.closePanels()};
    header.append(titleWrap,close);
    const body=document.createElement('div');body.className='training-simple-body';panel.append(header,body);document.body.appendChild(panel);this.fitUi(panel,narrow);return body
  },
  setSetting(key,value,opt={}){
    if(!Object.prototype.hasOwnProperty.call(this.settings,key))return false;

    const previousValue=this.settings[key];
    this.settings[key]=value;

    if(key==='meleeAttackSpeed'||key==='rangedAttackSpeed'){
      const type=key==='rangedAttackSpeed'?'ranged':'melee';
      const previousPercent=Math.max(10,Math.min(2000,Number(previousValue)||100));
      const nextPercent=Math.max(10,Math.min(2000,Number(value)||100));
      for(const bot of this.bots){
        if(bot?.botType!==type)continue;
        bot.phaseTimer=Math.max(0,Number(bot.phaseTimer)||0)*(previousPercent/nextPercent);
      }
    }

    if(key==='dummyHp'){
      for(const dummy of this.dummies){
        if(dummy)HealthService.setInvulnerable(dummy,value==='infinite');
      }
    }

    if(key==='infiniteHp'&&this.player){
      HealthService.setInvulnerable(this.player,value===true);
    }

    if(key==='botHp'){
      for(const bot of this.bots){
        if(bot){
          HealthService.setInvulnerable(
            bot,
            value==='infinite'
          );
        }
      }
    }

    if(opt.reinitBots)this.initBots();
    return true;
  },
  openSettings(){
    const body=this.panel('훈련장 설정','training-settings-panel',false);
    if(!body)return;

    const layout=document.createElement('div');
    layout.className='training-settings-layout';

    const section=title=>{
      const root=document.createElement('section');
      root.className='training-settings-section';
      const heading=document.createElement('div');
      heading.className='training-settings-section-title';
      heading.textContent=title;
      root.appendChild(heading);
      layout.appendChild(root);
      return root;
    };

    const row=(root,labelText,control)=>{
      const line=document.createElement('div');
      line.className='training-setting-row';

      const label=document.createElement('span');
      label.className='training-setting-label';
      label.textContent=labelText;

      const wrap=document.createElement('div');
      wrap.className='training-setting-control';
      wrap.appendChild(control);

      const toggleInput=control.matches('.training-toggle')
        ?control.querySelector('input')
        :control.querySelector('.training-toggle input');

      if(toggleInput){
        line.classList.add('toggle-row');
        line.tabIndex=0;
        line.setAttribute('role','switch');

        const syncAria=()=>{
          line.setAttribute('aria-checked',toggleInput.checked?'true':'false');
        };

        line.addEventListener('click',event=>{
          if(event.target.closest('.training-toggle'))return;
          if(event.target.closest('input[type="range"],select,button'))return;
          toggleInput.click();
        });

        line.addEventListener('keydown',event=>{
          if(event.key!=='Enter'&&event.key!==' ')return;
          if(event.target.matches('input[type="range"],select,button'))return;
          event.preventDefault();
          toggleInput.click();
        });

        toggleInput.addEventListener('change',syncAria);
        syncAria();
      }

      if(control.classList.contains('training-cycle')){
        line.classList.add('cycle-row');
        line.tabIndex=0;
        line.setAttribute('role','button');

        line.addEventListener('click',event=>{
          if(event.target.closest('button'))return;
          control.activate();
        });

        line.addEventListener('keydown',event=>{
          if(event.key!=='Enter'&&event.key!==' ')return;
          event.preventDefault();
          control.activate();
        });
      }

      line.append(label,wrap);
      root.appendChild(line);
    };

    const toggle=(current,onChange)=>{
      const label=document.createElement('label');
      label.className='training-toggle';

      const input=document.createElement('input');
      input.type='checkbox';
      input.checked=current;
      input.addEventListener('change',event=>onChange(event.target.checked));

      const track=document.createElement('span');
      track.className='training-toggle-track';
      const knob=document.createElement('span');
      knob.className='training-toggle-knob';
      track.appendChild(knob);
      label.append(input,track);
      return label;
    };

    const select=(options,current,onChange)=>{
      const element=document.createElement('select');
      for(const [value,label] of options){
        const option=document.createElement('option');
        option.value=value;
        option.textContent=label;
        option.selected=value===current;
        element.appendChild(option);
      }
      element.addEventListener('change',event=>onChange(event.target.value));
      return element;
    };

    const cycle=(options,current,onChange)=>{
      const control=document.createElement('div');
      control.className='training-cycle';

      const button=document.createElement('button');
      button.type='button';
      button.className='training-cycle-button';

      let index=Math.max(0,options.findIndex(([value])=>value===current));

      const sync=()=>{
        button.textContent=options[index][1];
      };

      control.activate=()=>{
        index=(index+1)%options.length;
        sync();
        onChange(options[index][0]);
      };

      button.addEventListener('click',control.activate);
      control.appendChild(button);
      sync();
      return control;
    };

    const botControl=(enabled,damage,attackSpeed,onToggle,onDamage,onAttackSpeed)=>{
      const wrap=document.createElement('div');
      wrap.className='training-bot-control';

      const enabledControl=toggle(enabled,onToggle);
      const sliders=document.createElement('div');
      sliders.className='training-bot-sliders';

      const percentSlider=(labelText,current,min,max,onChange)=>{
        const line=document.createElement('div');
        line.className='training-bot-range-row';

        const label=document.createElement('span');
        label.className='training-bot-range-label';
        label.textContent=labelText;

        const rangeControl=document.createElement('div');
        rangeControl.className='duels-display-range-control training-range-control';

        const slider=document.createElement('input');
        slider.type='range';
        slider.min=String(min);
        slider.max=String(max);
        slider.step='10';
        slider.value=String(current);

        const value=document.createElement('output');
        value.className='training-range-value';

        slider.addEventListener('input',()=>{
          value.textContent=`${slider.value}%`;
          onChange(Number(slider.value));
        });

        rangeControl.append(slider,value);
        line.append(label,rangeControl);
        sliders.appendChild(line);
        return {slider,value};
      };

      const damageControl=percentSlider('피해',damage,0,2000,onDamage);
      const speedControl=percentSlider('공속',attackSpeed,10,2000,onAttackSpeed);

      const sync=()=>{
        const disabled=!enabledControl.querySelector('input').checked;
        damageControl.slider.disabled=disabled;
        speedControl.slider.disabled=disabled;
        damageControl.value.textContent=`${damageControl.slider.value}%`;
        speedControl.value.textContent=`${speedControl.slider.value}%`;
      };

      enabledControl.querySelector('input').addEventListener('change',sync);
      wrap.append(enabledControl,sliders);
      sync();
      return wrap;
    };

    const dummy=section('더미');
    row(dummy,'체력',cycle(
      [['killable','처치 가능 · 3초 후 부활'],['infinite','무적']],
      this.settings.dummyHp,
      value=>this.setSetting('dummyHp',value)
    ));

    const bots=section('공격 봇');
    row(bots,'근거리',botControl(
      this.settings.hasMelee,
      this.settings.meleeDamage,
      this.settings.meleeAttackSpeed,
      value=>this.setSetting('hasMelee',value,{reinitBots:true}),
      value=>this.setSetting('meleeDamage',value),
      value=>this.setSetting('meleeAttackSpeed',value)
    ));
    row(bots,'원거리',botControl(
      this.settings.hasRanged,
      this.settings.rangedDamage,
      this.settings.rangedAttackSpeed,
      value=>this.setSetting('hasRanged',value,{reinitBots:true}),
      value=>this.setSetting('rangedDamage',value),
      value=>this.setSetting('rangedAttackSpeed',value)
    ));
    row(bots,'체력',cycle(
      [['killable','처치 가능 · 3초 후 부활'],['infinite','무적']],
      this.settings.botHp,
      value=>this.setSetting('botHp',value)
    ));

    const player=section('플레이어');
    row(player,'체력 무한',toggle(
      this.settings.infiniteHp,
      value=>this.setSetting('infiniteHp',value)
    ));
    row(player,'스테미나 무한',toggle(
      this.settings.infiniteStam,
      value=>this.setSetting('infiniteStam',value)
    ));

    const display=section('표시');
    row(display,'봇 쿨타임',toggle(
      this.settings.showCooldown,
      value=>this.setSetting('showCooldown',value)
    ));
    row(display,'DPS / 콤보',toggle(
      this.settings.showDps,
      value=>this.setSetting('showDps',value)
    ));

    body.appendChild(layout);
  },
  clearCharacterRuntime(player){
    if(!player)return false;

    if(
      typeof CommandFeatureService!=='undefined'
    ){
      CommandFeatureService.resetEntity(
        player
      );
    }

    const owned=[
      ...EntityService.items.values()
    ].filter(entity=>
      entity&&
      entity!==player&&
      EntityService.owner(entity)===player
    );
    const sources=[player,...owned];
    const sourceIds=new Set(
      sources.map(entity=>String(entity.id||''))
    );

    for(const source of sources){
      DynamicWallService.clearOwner(source);
      ProjectileService.removeOwnedBy(source);
      AttackGuardService.clearSource(source);
      MovementAbilityService.clear(source);

      for(const state of InstalledAreaFieldService.states(source)){
        InstalledAreaFieldService.clearState(
          source,
          state,
          {broadcast:false}
        );
      }
    }

    for(const entity of owned){
      EntityService.items.delete(entity.id);
    }

    this.fx=this.fx.filter(
      effect=>
        !sourceIds.has(
          String(effect?.sourceEntityId||'')
        )
    );

    SustainedBuffModeService.clear(player);
    StackMarkService.clear(player);
    player.buffs.clear();
    player.statuses.clear();
    BuffStatusPresentation.cache.delete(player);
    StatusPresentation.cache.delete(player);
    player._positionMemories?.clear?.();

    return true;
  },
  changeCharacter(characterId){
    const character=GAME_DATA.characters[characterId];
    const player=this.player;

    if(!character||!player)return false;
    if(player.character?.id===character.id)return true;

    CharacterTooltip.hide();
    this.clearCharacterRuntime(player);
    SimulationScheduleService.clear();
    FieldDodgeRewardService.clear();

    player.actionState.clear();
    player.wallDeferredAttacks=[];
    player.cooldowns.clear();
    player.abilityPending.clear();
    player.counterWindup=null;
    player.counterReadyUntil=0;
    player.counterReadyCharges=0;
    player.attackPreview=null;
    MovementService.finalizeForcedMotion(player);

    player.character=character;
    player.color=character.color;
    player.radius=character.radius;
    player.speed=character.speed;
    player.baseDamage=character.baseDamage;
    player.baseMaxHealth=character.maxHealth;
    player.maxHealth=character.maxHealth;
    player.baseMaxStamina=GAME_DATA.stamina.max;
    player.maxStamina=GAME_DATA.stamina.max;
    player.lastStaminaUse=0;
    AugmentService.rebuild(player);
    EntityRespawnService.revive(player,{
      x:player.x,
      y:player.y
    });

    this.playerRespawnAt=0;
    this.respawning=false;
    this.spectating=false;
    this.lastDeathSourcePid=null;
    this.selectedCharacterId=character.id;
    this.renderAugHud();
    this.syncHud();
    return true;
  },
  openCharacters(){
    const body=this.panel('캐릭터 변경','training-char-panel',false);if(!body)return;

    const note=document.createElement('div');
    note.className='training-simple-note';
    note.textContent=`현재 캐릭터: ${this.player?.character?.name||GAME_DATA.characters[this.selectedCharacterId]?.name||'선택 없음'}`;
    body.appendChild(note);

    const list=document.createElement('div');
    list.className='training-char-list';

    for(const char of CharacterCardDataService.all().map(card=>card.combat)){
      const button=document.createElement('button');
      button.type='button';
      button.className='training-char-button current';
      button.style.setProperty('--char-color',char.color);
      button.dataset.id=char.id;
      button.dataset.charTooltip='true';
      button.textContent=char.name;
      const tooltip=document.createElement('div');
      tooltip.className='char-tooltip';
      tooltip.innerHTML=
        CharacterDescriptionService.html(
          char,
          {
            recordPoints:
              CharacterRecordService.points(
                char.id,
                AccountState.current
              )
          }
        );
      button.appendChild(tooltip);
      button.addEventListener('click',()=>{
        if(this.player?.character?.id===char.id)return;
        this.changeCharacter(char.id);
        this.closePanels();
        this.buildHud();
      });
      list.appendChild(button);
    }

    body.appendChild(list);
  },
  openAugments(){
    const body=this.panel('증강','training-aug-panel',false);
    if(!body)return;

    const content=document.createElement('div');
    content.className='training-aug-content';
    body.appendChild(content);

    const rarityOrder=Object.freeze([
      Object.freeze({id:'common',label:'일반'}),
      Object.freeze({id:'rare',label:'희귀'}),
      Object.freeze({id:'epic',label:'에픽'}),
      Object.freeze({id:'unique',label:'고유'})
    ]);

    const render=()=>{
      content.replaceChildren();
      const augments=AugmentDataService.all();

      if(!augments.length){
        const empty=document.createElement('div');
        empty.className='training-aug-placeholder';
        empty.textContent='증강은 이후 구현 단계에서 추가됩니다.';
        content.appendChild(empty);
        return;
      }

      for(const rarity of rarityOrder){
        const list=augments.filter(
          augment=>augment.rarity===rarity.id
        );
        if(!list.length)continue;

        const section=document.createElement('section');
        section.className='training-augment-section';

        const title=document.createElement('div');
        title.className='training-augment-section-title';
        title.textContent=`${rarity.label} · ${list.length}`;

        const grid=document.createElement('div');
        grid.className='training-augment-grid';

        for(const augment of list){
          const count=AugmentService.count(this.player,augment.id);
          const card=document.createElement('button');
          card.type='button';
          card.className=
            `training-augment-card rarity-${augment.rarity}`+
            (count>0?' owned':'');
          card.dataset.augmentId=augment.id;
          
          const top=document.createElement('div');
          top.className='training-augment-card-top';

          const emoji=document.createElement('span');
          emoji.className='training-augment-emoji';
          emoji.textContent=augment.emoji||'◆';

          const name=document.createElement('strong');
          name.textContent=augment.name;

          const rarityText=document.createElement('span');
          rarityText.className='training-augment-rarity';
          rarityText.textContent=rarity.label;

          const desc=document.createElement('div');
          desc.className='training-augment-desc';
          desc.innerHTML=augment.desc||'';

          top.append(emoji,name,rarityText);
          card.append(top,desc);

          if(count>0){
            const owned=document.createElement('span');
            owned.className='training-augment-count';
            owned.textContent=`×${count}`;
            card.appendChild(owned);
          }

          card.addEventListener('click',()=>{
            if(!this.player)return;
            if(AugmentService.acquire(this.player,augment)){
              this.renderAugHud();
              render();
            }
          });

          card.addEventListener('contextmenu',event=>{
            event.preventDefault();
            if(!this.player)return;
            if(AugmentService.remove(this.player,augment)){
              this.renderAugHud();
              render();
            }
          });

          grid.appendChild(card);
        }

        section.append(title,grid);
        content.appendChild(section);
      }
    };

    render();
  },
};
