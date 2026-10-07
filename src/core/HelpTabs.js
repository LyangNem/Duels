

const HelpTabs = Object.freeze({
  open(name) {
    document.querySelectorAll('[data-help-dodge-cost]').forEach(el => {
      el.textContent = String(GAME_DATA.dodge.cost);
    });
    const safe = ['how','controls','status'].includes(name) ? name : 'how';
    document.querySelectorAll('[data-help-tab]').forEach(el => el.classList.toggle('active', el.dataset.helpTab === safe));
    document.querySelectorAll('[data-help-page]').forEach(el => el.classList.toggle('active', el.dataset.helpPage === safe));
  }
});