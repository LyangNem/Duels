

const NetworkPayloadCodec=Object.freeze({
  TYPE_KEY:'__duelsTransportType',
  encode(value,seen=new WeakSet()){
    if(value===null)return null;

    const type=typeof value;

    if(type==='string'||type==='boolean')return value;

    if(type==='number'){
      if(Number.isFinite(value))return value;
      return {
        [this.TYPE_KEY]:'number',
        value:Number.isNaN(value)
          ?'NaN'
          :value===Infinity
            ?'Infinity'
            :'-Infinity'
      };
    }

    if(type==='bigint'){
      return {
        [this.TYPE_KEY]:'bigint',
        value:String(value)
      };
    }

    if(
      type==='undefined'||
      type==='function'||
      type==='symbol'
    ){
      return undefined;
    }

    if(type!=='object')return undefined;

    if(seen.has(value)){
      return {
        [this.TYPE_KEY]:'circular'
      };
    }
    seen.add(value);

    if(value instanceof Set){
      const values=[];
      for(const item of value){
        const encoded=this.encode(item,seen);
        if(encoded!==undefined)values.push(encoded);
      }
      seen.delete(value);
      return {
        [this.TYPE_KEY]:'set',
        values
      };
    }

    if(value instanceof Map){
      const entries=[];
      for(const [key,item] of value){
        const encodedKey=this.encode(key,seen);
        const encodedValue=this.encode(item,seen);
        if(
          encodedKey!==undefined&&
          encodedValue!==undefined
        ){
          entries.push([encodedKey,encodedValue]);
        }
      }
      seen.delete(value);
      return {
        [this.TYPE_KEY]:'map',
        entries
      };
    }

    if(value instanceof Date){
      seen.delete(value);
      return {
        [this.TYPE_KEY]:'date',
        value:value.toISOString()
      };
    }

    if(Array.isArray(value)){
      const result=value.map(item=>{
        const encoded=this.encode(item,seen);
        return encoded===undefined?null:encoded;
      });
      seen.delete(value);
      return result;
    }

    if(ArrayBuffer.isView(value)){
      const values=Array.from(value);
      seen.delete(value);
      return {
        [this.TYPE_KEY]:'typed-array',
        name:value.constructor?.name||'Array',
        values
      };
    }

    if(value instanceof ArrayBuffer){
      const values=Array.from(new Uint8Array(value));
      seen.delete(value);
      return {
        [this.TYPE_KEY]:'array-buffer',
        values
      };
    }

    const result={};
    for(const [key,item] of Object.entries(value)){
      const encoded=this.encode(item,seen);
      if(encoded!==undefined)result[key]=encoded;
    }
    seen.delete(value);
    return result;
  },
  decode(value){
    if(value===null||typeof value!=='object')return value;

    if(Array.isArray(value)){
      return value.map(item=>this.decode(item));
    }

    const tagged=value[this.TYPE_KEY];
    if(tagged==='number'){
      if(value.value==='Infinity')return Infinity;
      if(value.value==='-Infinity')return -Infinity;
      if(value.value==='NaN')return NaN;
      return 0;
    }
    if(tagged==='bigint'){
      try{return BigInt(value.value)}
      catch{return 0n}
    }
    if(tagged==='set'){
      return new Set(
        (value.values||[]).map(item=>this.decode(item))
      );
    }
    if(tagged==='map'){
      return new Map(
        (value.entries||[]).map(([key,item])=>[
          this.decode(key),
          this.decode(item)
        ])
      );
    }
    if(tagged==='date'){
      return new Date(value.value);
    }
    if(tagged==='typed-array'){
      const values=Array.isArray(value.values)
        ?value.values
        :[];
      const Constructor=globalThis[value.name];
      if(
        typeof Constructor==='function'&&
        typeof Constructor.BYTES_PER_ELEMENT==='number'
      ){
        try{return new Constructor(values)}
        catch{}
      }
      return values;
    }
    if(tagged==='array-buffer'){
      return Uint8Array.from(
        Array.isArray(value.values)?value.values:[]
      ).buffer;
    }
    if(tagged==='circular'){
      return null;
    }

    const result={};
    for(const [key,item] of Object.entries(value)){
      result[key]=this.decode(item);
    }
    return result;
  },
  transport(payload){
    return this.encode(payload);
  },
  sendEncoded(connection,encodedPayload){
    if(!connection?.open)return false;

    // 위치 상태는 다음 패킷이 곧 최신값으로 대체한다.
    // reliable DataChannel 큐가 크게 밀린 경우 오래된 상태만 버려
    // 지연 패킷이 한꺼번에 처리되는 순간 끊김을 막는다.
    if(encodedPayload?.type==='duel-state'){
      const bufferedAmount=
        Number(
          connection.dataChannel?.bufferedAmount??
          connection._dc?.bufferedAmount??
          0
        )||0;

      if(bufferedAmount>131072){
        return false;
      }
    }

    connection.send(encodedPayload);
    return true;
  },
  send(connection,payload){
    if(!connection?.open)return false;
    return this.sendEncoded(
      connection,
      this.transport(payload)
    );
  }
});