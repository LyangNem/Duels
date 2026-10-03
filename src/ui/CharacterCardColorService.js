

/* 모든 캐릭터 카드 공통 우클릭 */
const CharacterCardColorService=Object.freeze({
  colors(character){
    const source=
      Array.isArray(character?.cardColors)
        ?character.cardColors
            .map(color=>String(color||'').trim())
            .filter(Boolean)
        :[];
    if(source.length>=2)return source.slice(0,2);
    const color=String(character?.color||'#dbe7ef');
    return [color,color];
  },
  gradient(character,alphaHex=''){
    const [a,b]=this.colors(character);
    return `linear-gradient(135deg,${a}${alphaHex} 0%,${a}${alphaHex} 50%,${b}${alphaHex} 50%,${b}${alphaHex} 100%)`;
  },
  applyIcon(icon,character){
    if(!icon)return false;
    const [a,b]=this.colors(character);
    if(a===b){
      icon.style.background=`${a}22`;
      icon.style.border=`3px solid ${a}`;
      return true;
    }
    icon.style.background=
      `linear-gradient(rgba(13,16,21,.10),rgba(13,16,21,.10)) padding-box,`+
      `linear-gradient(135deg,${a} 0%,${a} 50%,${b} 50%,${b} 100%) border-box`;
    icon.style.border='3px solid transparent';
    icon.style.borderImage='none';
    icon.style.borderRadius='50%';
    icon.style.backgroundClip='padding-box,border-box';
    return true;
  },
  applyName(name,character){
    if(!name)return false;
    const [a,b]=this.colors(character);
    if(a===b){
      name.style.color=a;
      CharacterNamePresentationService.apply(name,a);
      return true;
    }
    name.style.backgroundImage=`linear-gradient(135deg,${a} 0%,${a} 50%,${b} 50%,${b} 100%)`;
    name.style.backgroundClip='text';
    name.style.webkitBackgroundClip='text';
    name.style.color='transparent';
    name.style.webkitTextFillColor='transparent';
    name.style.filter=`drop-shadow(0 0 5px ${a}55) drop-shadow(0 0 5px ${b}55)`;
    return true;
  },
  inlineIconStyle(character){
    const [a,b]=this.colors(character);
    if(a===b)return `background:${a}22;border:3px solid ${a};`;
    return `background:linear-gradient(rgba(13,16,21,.10),rgba(13,16,21,.10)) padding-box,linear-gradient(135deg,${a} 0%,${a} 50%,${b} 50%,${b} 100%) border-box;background-clip:padding-box,border-box;border:3px solid transparent;border-image:none;border-radius:50%;`;
  },
  inlineNameStyle(character){
    const [a,b]=this.colors(character);
    if(a===b)return `color:${a};--char-name-glow:${CharacterNamePresentationService.glow(a)}`;
    return `background-image:linear-gradient(135deg,${a} 0%,${a} 50%,${b} 50%,${b} 100%);background-clip:text;-webkit-background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 5px ${a}55) drop-shadow(0 0 5px ${b}55)`;
  },
  inlineNameHtml(character){
    return String(character?.name||'');
  }
});