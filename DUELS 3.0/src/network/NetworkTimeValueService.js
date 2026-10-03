


const NetworkTimeValueService=Object.freeze({
  serializeDeadline(deadline,now=performance.now()){
    if(deadline===Infinity){
      return {remaining:0,infinite:true};
    }

    const value=Number(deadline);
    if(!Number.isFinite(value)){
      return {remaining:0,infinite:false};
    }

    return {
      remaining:Math.max(0,value-now),
      infinite:false
    };
  },
  restoreDeadline(remaining,infinite,now=performance.now()){
    if(infinite===true)return Infinity;

    const value=Number(remaining);
    return now+Math.max(
      0,
      Number.isFinite(value)?value:0
    );
  },
  finite(value,fallback=0){
    const number=Number(value);
    return Number.isFinite(number)
      ?number
      :fallback;
  }
});