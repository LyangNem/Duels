
(()=>{
  const href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACF0lEQVR4nO2bXU7DMBCEJ36s4EKchqNxGi4E6iPwgCxZrhP/zaxTO/OEaqvr+WKn2V2yoUC328tvybyz6X7/3nJzDic8q/FYRyCSA7MYj5UC4eIPZjUPpL253ITZFHt0ewMzK/T6cARWkwPWuvpe3vPyO2Bb8eqHWn4HXABGL2C0KADePr4YXzMkbjcAvwhrCKy4XQDi4FYQmHGbAewFVUNgx20CkAumgqCIWw2gNAgbgipuNYDP99fiuSwINd9Tsz6g8QhYQlCaBzpughYQ1OaBzp9BJQQL8wDhQUgBwco8QHoUZkKwNA8QkyEGBGvzADkb7IEwwjwgSIdbIIwyD4jqAaWL9PNq5zMlK4jkFhuP185nSVoR2lu0/zw+Arn5CplUhcMzHpsPlRpTmgeMaoLxWc/9DNbeG3pk3hcoueNbGPcyrQqPqiUcyQyAMhnqkQkAi3S4VXIAlgWRFkkBjCiJ1UoGYFRRtFYSAKrkRgGBDqDF/EgIVAA9V34UBBoAxrYfAcG8Pc5Me0/VHi+RovBxqvb4kWoTHCsI9PZ4Sq3ZnQUESXs8VG9qq4Yga48DvLxeCUHWHmcXNVRxJe1xVUVHEZfeHleXs9hxqe1xq1oeMy6tPW5ZyGTG3YA13xcA/l+iuv5XGCh7wXA2ec/XDvB/rLQLQq9ub2BWxR4fjsDMEFLehr887QD8iGNUvzwd61mfE0p28x82cClLHoDnbwAAAABJRU5ErkJggg==';
  const apply=()=>{
    let link=document.getElementById('duels-favicon-runtime-link');
    if(!link){
      link=document.createElement('link');
      link.id='duels-favicon-runtime-link';
      link.rel='icon';
      link.type='image/png';
      link.sizes='64x64';
      document.head.appendChild(link);
    }
    link.href=href;
  };
  apply();
  window.addEventListener('pageshow',apply);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)apply();
  });
})();
