

const KoreanParticleService=Object.freeze({
  hasFinalConsonant(text){
    const value=String(text||'').trim();
    if(!value)return false;
    const code=value.charCodeAt(value.length-1);

    if(code>=0xAC00&&code<=0xD7A3){
      return (code-0xAC00)%28!==0;
    }

    return false;
  },
  attach(text,withFinal,withoutFinal){
    const value=String(text||'').trim();
    return `${value}${this.hasFinalConsonant(value)?withFinal:withoutFinal}`;
  },
  subject(text){
    return this.attach(text,'이','가');
  },
  topic(text){
    return this.attach(text,'은','는');
  }
});