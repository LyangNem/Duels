

const HelpTabs = Object.freeze({
  open(name) {
    const safe = ['how','controls','status'].includes(name) ? name : 'how';
    document.querySelectorAll('[data-help-tab]').forEach(el => el.classList.toggle('active', el.dataset.helpTab === safe));
    document.querySelectorAll('[data-help-page]').forEach(el => el.classList.toggle('active', el.dataset.helpPage === safe));
  }
});