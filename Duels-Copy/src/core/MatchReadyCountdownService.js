

const MatchReadyCountdownService=Object.freeze({
  seconds(playerCount){
    const count=Math.max(2,Math.floor(Number(playerCount)||2));
    return 4+Math.max(0,count-2)*2;
  }
});