

/* 패널 */
const PanelController = Object.freeze({
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
    }
  }
});