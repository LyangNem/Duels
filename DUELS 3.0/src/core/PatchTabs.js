
const PatchTabs=Object.freeze({
  open(name){
    const safe=['features','balance','bugfixes'].includes(name)?name:'features';
    document.querySelectorAll('[data-patch-tab]').forEach(el=>el.classList.toggle('active',el.dataset.patchTab===safe));
    document.querySelectorAll('[data-patch-page]').forEach(el=>el.classList.toggle('active',el.dataset.patchPage===safe));
  }
});