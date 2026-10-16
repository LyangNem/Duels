

const ColorService=Object.freeze({
  rgbCache:new Map(),
  remember(source,value){
    if(!source)return value;
    this.rgbCache.set(source,value);
    if(this.rgbCache.size>128){
      const first=this.rgbCache.keys().next().value;
      this.rgbCache.delete(first);
    }
    return value;
  },
  brighten(color,amount=.35){
    const [r,g,b]=this.rgbString(color).split(',').map(Number);
    const mix=Math.max(0,Math.min(1,Number(amount)||0));
    return `rgb(${Math.round(r+(255-r)*mix)},${Math.round(g+(255-g)*mix)},${Math.round(b+(255-b)*mix)})`;
  },
  rgbString(color,fallback='255,255,255'){
    const source=String(color||'').trim();
    if(!source)return fallback;

    const cached=this.rgbCache.get(source);
    if(cached!==undefined)return cached;

    const rgbFunction=source.match(
      /^rgb\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/i
    );
    if(rgbFunction){
      return this.remember(
        source,
        [rgbFunction[1],rgbFunction[2],rgbFunction[3]]
          .map(value=>Math.max(0,Math.min(255,Number(value)||0)))
          .join(',')
      );
    }

    if(/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(source)){
      return this.remember(
        source,
        source
          .split(',')
          .map(value=>Math.max(0,Math.min(255,Number(value)||0)))
          .join(',')
      );
    }

    const raw=source.replace(/^#/,'');
    const hex=raw.length===3
      ?raw.split('').map(char=>char+char).join('')
      :raw;

    if(!/^[0-9a-fA-F]{6}$/.test(hex))return fallback;

    const value=parseInt(hex,16);
    return this.remember(
      source,
      `${(value>>16)&255},${(value>>8)&255},${value&255}`
    );
  }
});