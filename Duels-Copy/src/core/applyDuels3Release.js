

/* 버전 적용 (notes: 패치노트 데이터) */
function applyDuels3Release(notes) {
  const version = String(notes?.version || '').trim();
  const date = String(notes?.date || '').trim();
  if (!version) throw new Error('패치노트에 version 값이 없습니다.');

  DUELS3_RELEASE.version = version;
  DUELS3_RELEASE.date = date;

  const meta = document.querySelector('meta[name="duels-version"]');
  if (meta) meta.content = version;

  document.querySelectorAll('[data-duels-version-text]').forEach(node => {
    const mode = node.dataset.duelsVersionText;
    node.textContent =
      mode === 'prefix-v-space' ? `v ${version}` :
      mode === 'prefix-v' ? `v${version}` :
      version;
  });

  document.querySelectorAll('[data-duels-version-only]').forEach(node => {
    node.textContent = version;
  });

  return version;
}