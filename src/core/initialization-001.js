


// ============================================================
// 00. BOOT / MOBILE GUARD — 모바일 감지, PC 전용 게임
// 모바일 환경에서는 경고를 표시하지만, 사용자가 무시하면 실행 자체는 허용한다.
// ============================================================
(function(){
  if(new URLSearchParams(location.search).get('force')==='1')return;

  const ua=navigator.userAgent;
  const isMobile=
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)||
    ('ontouchstart' in window&&navigator.maxTouchPoints>0);

  if(!isMobile)return;

  document.documentElement.dataset.duelsMobile='true';

  const overlay=document.createElement('div');
  overlay.id='duels3-mobile-warning';
  overlay.style.cssText=
    'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#0a0a0c;';

  const content=document.createElement('div');
  content.style.cssText=
    'text-align:center;color:#adf;font-family:var(--font-ui);padding:40px;max-width:420px;';

  content.innerHTML=
    '<div style="font-size:2em;letter-spacing:4px;color:#f44;margin-bottom:24px;">⚠ 플레이 불가</div>'
    +'<div style="font-size:.9em;color:#778;letter-spacing:2px;line-height:2.4;">'
    +'이 게임은 PC에서만 플레이 가능합니다.<br>키보드와 마우스가 필요합니다.<br><br>'
    +'<span style="color:#556;">This game requires keyboard & mouse.<br>Please play on a PC.</span>'
    +'</div>';

  const ignore=document.createElement('button');
  ignore.type='button';
  ignore.textContent='무시하고 접속합니다.';
  ignore.style.cssText=
    'margin-top:32px;padding:0;border:0;background:transparent;font-size:12px;color:#556;letter-spacing:2px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;';
  ignore.addEventListener('click',()=>{
    overlay.remove();
  });

  content.appendChild(ignore);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
})();