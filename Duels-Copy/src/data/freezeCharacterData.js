
function freezeCharacterData(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    for(const child of Object.values(value))freezeCharacterData(child);
    Object.freeze(value);
  }
  return value;
}