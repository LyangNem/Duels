

const AugmentDataService=Object.freeze({
  all(){return AUGMENTS},
  get(id){
    return AUGMENTS.find(item=>item.id===id)||null;
  }
});