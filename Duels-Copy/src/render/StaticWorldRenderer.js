

/* 월드 렌더 */
const StaticWorldRenderer={
  canvas:null,
  ready:false,
  build(){
    if(this.ready)return;

    const canvas=document.createElement('canvas');
    canvas.width=WorldBoundsService.width();
    canvas.height=WorldBoundsService.height();
    const ctx=canvas.getContext('2d');

    ctx.fillStyle='#0d0d0f';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle='rgba(255,255,255,.04)';
    ctx.lineWidth=1;
    for(let x=0;x<=WorldBoundsService.width();x+=50){
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WorldBoundsService.height());ctx.stroke();
    }
    for(let y=0;y<=WorldBoundsService.height();y+=50){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WorldBoundsService.width(),y);ctx.stroke();
    }

    ctx.strokeStyle='rgba(255,255,255,.08)';
    for(let x=0;x<=WorldBoundsService.width();x+=250){
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WorldBoundsService.height());ctx.stroke();
    }
    for(let y=0;y<=WorldBoundsService.height();y+=250){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WorldBoundsService.width(),y);ctx.stroke();
    }

    ctx.strokeStyle='rgba(100,160,255,.3)';
    ctx.lineWidth=3;
    ctx.strokeRect(0,0,WorldBoundsService.width(),WorldBoundsService.height());

    ctx.strokeStyle='rgba(255,255,255,.05)';
    ctx.lineWidth=1;
    ctx.setLineDash([8,8]);
    ctx.beginPath();
    ctx.moveTo(WorldBoundsService.width()/2,0);
    ctx.lineTo(WorldBoundsService.width()/2,WorldBoundsService.height());
    ctx.stroke();
    ctx.setLineDash([]);


    const tile=50;
    for(const wall of DebugMapService.walls()){
      for(let y=wall.y;y<wall.y+wall.h;y+=tile){
        for(let x=wall.x;x<wall.x+wall.w;x+=tile){
          const tw=Math.min(tile,wall.x+wall.w-x);
          const th=Math.min(tile,wall.y+wall.h-y);
          ctx.fillStyle='rgba(40,55,75,.92)';
          ctx.fillRect(x,y,tw,th);
          ctx.fillStyle='rgba(100,160,220,.12)';
          ctx.fillRect(x,y,tw,Math.min(6,th));
          ctx.strokeStyle='rgba(100,160,255,.28)';
          ctx.lineWidth=1;
          ctx.strokeRect(x+.5,y+.5,tw-1,th-1);
        }
      }
    }

    this.canvas=canvas;
    this.ready=true;
  },
  invalidate(){
    this.canvas=null;
    this.ready=false;
  },
  draw(ctx){
    this.build();
    ctx.drawImage(this.canvas,0,0);
  }
};