

const CharacterNamePresentationService=Object.freeze({
  glow(){
    return '0 0 5px rgba(0,0,0,.72),0 0 10px rgba(0,0,0,.34)';
  },
  apply(element){
    if(!element)return false;
    element.style.setProperty(
      '--char-name-glow',
      this.glow()
    );
    return true;
  }
});