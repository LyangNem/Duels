const assert=require('node:assert/strict');const {run}=require('./support/runtime-harness.cjs');
run(`Training.selectedCharacterId='bell';Training.start();Training.cameraState={x:200,y:150};Training.spectating=false;ScreenShakeService.offset=()=>({x:0,y:0});var rects=[];var ctx={save(){},restore(){},setLineDash(){},strokeRect(...v){rects.push(v)}};TrainingWorldDrawService.drawMinimapViewport(ctx,10,10,.1,.1)`);assert.deepEqual(Array.from(run('rects[0]')),[15,15,150,100]);
for(const zoom of [.5,1,1.5]){
 run(`Training.spectating=true;Training.spectator.zoom=${zoom};rects=[];TrainingWorldDrawService.drawMinimapViewport(ctx,10,10,.1,.1)`);assert.ok(Math.abs(run('rects[0][2]')-150/zoom)<1e-6);
 run('rects=[];TrainingWorldDrawService.drawSpectatedViewport(ctx,{x:1000,y:700},1000)');assert.equal(run('rects[0][2]'),1500);assert.equal(run('rects[0][3]'),1000);
}
run('var edge=WorldViewportVisibilityService.followedBounds({x:0,y:0},1000)');assert.equal(run('edge.left'),run('-GAME_DATA.canvas.width*GAME_DATA.cameraFollow.edgeOverscanRatio'));assert.equal(run('edge.top'),run('-GAME_DATA.canvas.height*GAME_DATA.cameraFollow.edgeOverscanRatio'));
run(`Training.spectatorFollowEntity=()=>Training.dummy;Training.spectator.followPid='P2';Training.spectator.zoom=.5;var strokes=[];var realCtx=Training.ctx||Training.canvas.getContext('2d');realCtx.strokeRect=function(...v){strokes.push({v,color:this.strokeStyle})};Training.ctx=realCtx;Training.draw()`);
assert.ok(run("strokes.some(s=>s.color==='rgba(190,196,204,.78)'&&s.v[2]===1500&&s.v[3]===1000)"));assert.ok(run("strokes.some(s=>s.color==='rgba(255,255,255,.12)'&&Math.abs(s.v[2]-3000*140/WorldBoundsService.width())<1e-6)"));
console.log('PASS actual Training.draw white frame1500x1000, minimap actual zoom80%+observer .5/1/1.5, followed frame observer-independent, map-edge overscan clamp');
