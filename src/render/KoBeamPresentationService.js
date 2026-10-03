


/* K.O. 레이저만 캐릭터 위 레이어에서 그리는 단일 프레젠테이션 경로. */
const KoBeamPresentationService=Object.freeze({
  draw(ctx,f,now){
    const progress=Math.max(0,Math.min(1,(now-f.start)/Math.max(1,f.dur)));

        const local=Math.max(0,Math.min(1,progress));
        const ux=Math.cos(f.angle);
        const uy=Math.sin(f.angle);
        const fade=1-Math.pow(local,1.55);

        // 생성 순간의 월드 좌표를 고정해 이후 카메라/캐릭터 이동을 따라가지 않는다.
        const centerX=f.x;
        const centerY=f.y;
        const halfLength=Math.max(
          Math.hypot(
            WorldBoundsService.width(),
            WorldBoundsService.height()
          )*1.5,
          Math.hypot(
            GAME_DATA.canvas.width,
            GAME_DATA.canvas.height
          )*1.5
        );
        const sx=centerX-ux*halfLength;
        const sy=centerY-uy*halfLength;
        const ex=centerX+ux*halfLength;
        const ey=centerY+uy*halfLength;

        ctx.save();
        ctx.lineCap='butt';

        // 진행 방향으로 갈수록 불투명도가 커지는 그라데이션.
        const outer=ctx.createLinearGradient(sx,sy,ex,ey);
        outer.addColorStop(0,'rgba(255,80,30,0)');
        outer.addColorStop(.22,`rgba(255,80,30,${fade*.12})`);
        outer.addColorStop(.72,`rgba(255,105,35,${fade*.48})`);
        outer.addColorStop(1,`rgba(255,135,45,${fade*.78})`);
        ctx.strokeStyle=outer;
        ctx.lineWidth=76*(1-local*.22);
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();

        const mid=ctx.createLinearGradient(sx,sy,ex,ey);
        mid.addColorStop(0,'rgba(255,210,70,0)');
        mid.addColorStop(.28,`rgba(255,205,70,${fade*.16})`);
        mid.addColorStop(.72,`rgba(255,225,105,${fade*.72})`);
        mid.addColorStop(1,`rgba(255,240,150,${fade*.96})`);
        ctx.strokeStyle=mid;
        ctx.lineWidth=38*(1-local*.18);
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();

        const core=ctx.createLinearGradient(sx,sy,ex,ey);
        core.addColorStop(0,'rgba(255,255,255,0)');
        core.addColorStop(.35,`rgba(255,255,255,${fade*.2})`);
        core.addColorStop(.75,`rgba(255,255,255,${fade*.82})`);
        core.addColorStop(1,`rgba(255,255,255,${fade})`);
        ctx.strokeStyle=core;
        ctx.lineWidth=13*(1-local*.12);
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();

        ctx.restore();
        return;
        }
});