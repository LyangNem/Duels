

/* 패널 */
const PanelController = Object.freeze({
  settingsHome:{parent:null,next:null},
  placeSettings(inGame){
    const panel=this.panel('settings');
    if(!panel)return;
    if(inGame){
      if(!panel.classList.contains('duels-settings-ingame')){
        this.settingsHome.parent=panel.parentNode;
        this.settingsHome.next=panel.nextSibling;
        document.body.appendChild(panel);
        panel.classList.add('duels-settings-ingame');
      }
    }else if(panel.classList.contains('duels-settings-ingame')){
      panel.classList.remove('duels-settings-ingame');
      const home=this.settingsHome;
      if(home.parent)home.parent.insertBefore(panel,home.next?.parentNode===home.parent?home.next:null);
      home.parent=null;home.next=null;
    }
  },
  inGameContext(){return (typeof Training!=='undefined'&&Training.active)||(typeof RoomService!=='undefined'&&!!RoomService.localPid);},
  capturesGameInput(){
    return this.inGameContext()&&this.panel('settings')?.hidden===false;
  },
  handleGameplayKeydown(event){
    if(!this.inGameContext())return false;
    if(event.code==='Escape'||event.key==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();
      if(event.repeat)return true;
      // The capture listener owns Escape: close an active editor before settings.
      if(typeof CharacterCommandInputService!=='undefined'&&CharacterCommandInputService.openState){
        CharacterCommandInputService.close();
        return true;
      }
      if(typeof OnlineChatService!=='undefined'&&OnlineChatService.openState){
        OnlineChatService.close({selectDraftOnReopen:true});
        return true;
      }
      if(typeof DebugMapEditorService!=='undefined'&&DebugMapEditorService.active)DebugMapEditorService.stop();
      if(typeof DebugPanel!=='undefined'&&DebugPanel.capturesGameInput())DebugPanel.close();
      if(typeof CharacterCommandInputService!=='undefined')CharacterCommandInputService.close();
      if(typeof OnlineChatService!=='undefined'&&OnlineChatService.openState)OnlineChatService.close();
      Training.closePanels();
      this.toggle('settings');
      return true;
    }
    if(this.capturesGameInput()&&!this.panel('settings').contains(event.target)){
      event.preventDefault();event.stopImmediatePropagation();return true;
    }
    return false;
  },
  panel(name){
    return name === 'help'
      ?document.getElementById('duels-help-panel')
      :name === 'patch'
        ?document.getElementById('duels-patch-panel')
        :name === 'settings'
          ?document.getElementById('duels-display-settings-panel')
          :null;
  },
  closeAll(except = '') {
    for (const name of ['help','patch','settings']) {
      if (name === except) continue;
      const panel=this.panel(name);
      if(panel)panel.hidden=true;
      if(name==='settings')this.placeSettings(false);
    }
  },
  toggle(name, forceOpen) {
    const panel=this.panel(name);
    if (!panel) return;

    const shouldOpen =
      typeof forceOpen === 'boolean'
        ?forceOpen
        :panel.hidden;

    if (shouldOpen) this.closeAll(name);
    if(name==='settings'){
      const inGame=shouldOpen&&this.inGameContext();
      if(inGame)GameInputResetService.releaseAll();
      if(!shouldOpen){
        ProfileSettingsUI.setPickerOpen(false);
        if(panel.contains(document.activeElement))document.activeElement?.blur?.();
      }
      this.placeSettings(inGame);
    }
    panel.hidden = !shouldOpen;

    if (shouldOpen && name === 'help') {
      HelpTabs.open('how');
    }

    if (shouldOpen && name === 'patch') {
      PatchTabs.open('features');
      if (!duels3PatchNotesLoaded) duels3LoadPatchNotes();
    }

    if (shouldOpen && name === 'settings') {
      DisplaySettings.syncUi();
      ProfileSettingsUI.render();
      if(panel.classList.contains('duels-settings-ingame')){panel.tabIndex=-1;panel.focus();}
    }
  }
});
