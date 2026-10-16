


/* 격자 기반 범용 길찾기.
   A*는 목표점 최단 경로에 사용하고, 정확한 목표 경로가 막힌 경우
   다익스트라가 탐색한 도달 가능한 노드 중 목표에 가장 가까운 지점으로 폴백한다. */
const GridPathfindingService=Object.freeze({
  DEFAULT_CELL:48,
  MAX_EXPANSIONS:2600,

  grid(radius,cellSize=this.DEFAULT_CELL){
    const cell=Math.max(16,Number(cellSize)||this.DEFAULT_CELL);
    const r=Math.max(0,Number(radius)||0);
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();
    const cols=Math.max(1,Math.ceil(width/cell));
    const rows=Math.max(1,Math.ceil(height/cell));
    return {cell,radius:r,width,height,cols,rows};
  },

  key(cx,cy){
    return `${cx}:${cy}`;
  },

  cellCenter(grid,cx,cy){
    return {
      x:Math.max(
        grid.radius,
        Math.min(
          grid.width-grid.radius,
          (cx+.5)*grid.cell
        )
      ),
      y:Math.max(
        grid.radius,
        Math.min(
          grid.height-grid.radius,
          (cy+.5)*grid.cell
        )
      )
    };
  },

  pointCell(grid,x,y){
    return {
      cx:Math.max(
        0,
        Math.min(
          grid.cols-1,
          Math.floor((Number(x)||0)/grid.cell)
        )
      ),
      cy:Math.max(
        0,
        Math.min(
          grid.rows-1,
          Math.floor((Number(y)||0)/grid.cell)
        )
      )
    };
  },

  dynamicBlocked(
    grid,
    x,
    y,
    obstacles=[]
  ){
    for(const obstacle of obstacles||[]){
      if(!obstacle)continue;
      const radius=
        Math.max(
          0,
          Number(obstacle.radius)||0
        )+
        Math.max(
          0,
          Number(obstacle.clearance)||0
        )+
        grid.radius;
      if(
        Math.hypot(
          Number(x)-Number(obstacle.x),
          Number(y)-Number(obstacle.y)
        )<=radius
      ){
        return true;
      }
    }
    return false;
  },

  staticWalkable(grid,cx,cy){
    if(
      cx<0||
      cy<0||
      cx>=grid.cols||
      cy>=grid.rows
    )return false;

    const point=this.cellCenter(grid,cx,cy);
    return !MovementService.collides(
      point.x,
      point.y,
      grid.radius
    );
  },

  walkable(grid,cx,cy,obstacles=[]){
    if(!this.staticWalkable(grid,cx,cy))return false;

    const point=this.cellCenter(grid,cx,cy);
    return !this.dynamicBlocked(
      grid,
      point.x,
      point.y,
      obstacles
    );
  },

  nearestWalkable(
    grid,
    cx,
    cy,
    maxRing=6,
    obstacles=[]
  ){
    if(this.walkable(grid,cx,cy,obstacles)){
      return {cx,cy};
    }

    for(let ring=1;ring<=maxRing;ring++){
      let best=null;
      let bestD2=Infinity;

      for(let oy=-ring;oy<=ring;oy++){
        for(let ox=-ring;ox<=ring;ox++){
          if(
            Math.max(
              Math.abs(ox),
              Math.abs(oy)
            )!==ring
          )continue;

          const nx=cx+ox;
          const ny=cy+oy;
          if(!this.walkable(grid,nx,ny,obstacles))continue;

          const d2=ox*ox+oy*oy;
          if(d2>=bestD2)continue;
          best={cx:nx,cy:ny};
          bestD2=d2;
        }
      }

      if(best)return best;
    }

    return null;
  },

  heuristic(ax,ay,bx,by){
    const dx=Math.abs(ax-bx);
    const dy=Math.abs(ay-by);
    const diagonal=Math.min(dx,dy);
    const straight=Math.max(dx,dy)-diagonal;
    return diagonal*Math.SQRT2+straight;
  },

  neighbors(
    grid,
    cx,
    cy,
    obstacles=[],
    traversal=null
  ){
    const result=[];
    for(let oy=-1;oy<=1;oy++){
      for(let ox=-1;ox<=1;ox++){
        if(ox===0&&oy===0)continue;

        const nx=cx+ox;
        const ny=cy+oy;
        if(!this.walkable(grid,nx,ny,obstacles))continue;

        // 대각선으로 벽/동적 장애물 모서리를 뚫지 않는다.
        if(
          ox!==0&&
          oy!==0&&
          (
            !this.walkable(grid,cx+ox,cy,obstacles)||
            !this.walkable(grid,cx,cy+oy,obstacles)
          )
        )continue;

        result.push({
          cx:nx,
          cy:ny,
          cost:
            ox!==0&&oy!==0
              ?Math.SQRT2
              :1
        });
      }
    }

    if(
      traversal?.enabled===true&&
      Math.max(0,Number(traversal.maxBlockedCells)||0)>0
    ){
      const maxBlockedCells=Math.max(
        1,
        Math.floor(Number(traversal.maxBlockedCells)||1)
      );
      const maxDistance=Math.max(
        grid.cell,
        Number(traversal.movementDistance)||0
      );
      const from=this.cellCenter(grid,cx,cy);

      for(let oy=-1;oy<=1;oy++){
        for(let ox=-1;ox<=1;ox++){
          if(ox===0&&oy===0)continue;

          let blockedCount=0;
          let crossedWall=false;

          for(let step=1;step<=maxBlockedCells+1;step++){
            const nx=cx+ox*step;
            const ny=cy+oy*step;

            if(
              nx<0||
              ny<0||
              nx>=grid.cols||
              ny>=grid.rows
            )break;

            const staticOpen=
              this.staticWalkable(
                grid,
                nx,
                ny
              );

            if(!staticOpen){
              crossedWall=true;
              blockedCount++;
              if(blockedCount>maxBlockedCells)break;
              continue;
            }

            if(!crossedWall)break;
            if(
              this.dynamicBlocked(
                grid,
                this.cellCenter(grid,nx,ny).x,
                this.cellCenter(grid,nx,ny).y,
                obstacles
              )
            )break;

            const landing=
              this.cellCenter(
                grid,
                nx,
                ny
              );
            const distance=Math.hypot(
              landing.x-from.x,
              landing.y-from.y
            );

            if(distance>maxDistance+1e-6)break;

            if(
              this.segmentBlockedByDynamic(
                from.x,
                from.y,
                landing.x,
                landing.y,
                grid.radius,
                obstacles
              )
            )break;

            result.push({
              cx:nx,
              cy:ny,
              cost:
                distance/grid.cell+
                blockedCount*
                Math.max(
                  0,
                  Number(traversal.costPerBlockedCell)||0
                ),
              traversal:String(traversal.type||'movement-attack'),
              traversalDistance:distance,
              blockedCells:blockedCount
            });
            break;
          }
        }
      }
    }

    return result;
  },

  reconstruct(cameFrom,currentKey,nodeByKey,grid){
    const keys=[currentKey];
    let key=currentKey;

    while(cameFrom.has(key)){
      key=cameFrom.get(key);
      keys.push(key);
    }

    keys.reverse();

    // 첫 노드는 현재 위치 셀이므로 이동 waypoint에서는 제외한다.
    return keys.slice(1).map(itemKey=>{
      const node=nodeByKey.get(itemKey);
      return {
        ...this.cellCenter(
          grid,
          node.cx,
          node.cy
        ),
        ...(
          node.traversal
            ?{
              traversal:node.traversal,
              traversalDistance:
                Math.max(
                  0,
                  Number(node.traversalDistance)||0
                ),
              blockedCells:
                Math.max(
                  0,
                  Number(node.blockedCells)||0
                )
            }
            :{}
        )
      };
    });
  },

  segmentBlockedByDynamic(
    x1,
    y1,
    x2,
    y2,
    entityRadius=0,
    obstacles=[]
  ){
    const dx=Number(x2)-Number(x1);
    const dy=Number(y2)-Number(y1);
    const lengthSq=dx*dx+dy*dy;

    for(const obstacle of obstacles||[]){
      if(!obstacle)continue;
      const ox=Number(obstacle.x)||0;
      const oy=Number(obstacle.y)||0;
      let t=0;
      if(lengthSq>1e-9){
        t=
          (
            (ox-Number(x1))*dx+
            (oy-Number(y1))*dy
          )/
          lengthSq;
        t=Math.max(0,Math.min(1,t));
      }
      const px=Number(x1)+dx*t;
      const py=Number(y1)+dy*t;
      const radius=
        Math.max(
          0,
          Number(obstacle.radius)||0
        )+
        Math.max(
          0,
          Number(obstacle.clearance)||0
        )+
        Math.max(
          0,
          Number(entityRadius)||0
        );

      if(
        Math.hypot(
          ox-px,
          oy-py
        )<=radius
      ){
        return true;
      }
    }

    return false;
  },

  search(startX,startY,targetX,targetY,{
    radius=0,
    cellSize=this.DEFAULT_CELL,
    algorithm='astar',
    maxExpansions=this.MAX_EXPANSIONS,
    dynamicObstacles=[],
    traversal=null
  }={}){
    const grid=this.grid(radius,cellSize);
    const rawStart=this.pointCell(grid,startX,startY);
    const rawGoal=this.pointCell(grid,targetX,targetY);
    const start=this.nearestWalkable(
      grid,
      rawStart.cx,
      rawStart.cy,
      6,
      dynamicObstacles
    );
    const goal=this.nearestWalkable(
      grid,
      rawGoal.cx,
      rawGoal.cy,
      6,
      dynamicObstacles
    );

    if(!start||!goal){
      return {
        found:false,
        path:[],
        algorithm,
        closest:null,
        expansions:0
      };
    }

    const startKey=this.key(start.cx,start.cy);
    const goalKey=this.key(goal.cx,goal.cy);
    const open=[];
    const openKeys=new Set();
    const closed=new Set();
    const cameFrom=new Map();
    const gScore=new Map([[startKey,0]]);
    const nodeByKey=new Map([
      [startKey,start],
      [goalKey,goal]
    ]);

    const heuristic=
      String(algorithm)==='dijkstra'
        ?()=>0
        :(cx,cy)=>this.heuristic(
          cx,cy,goal.cx,goal.cy
        );

    open.push({
      ...start,
      key:startKey,
      g:0,
      f:heuristic(start.cx,start.cy)
    });
    openKeys.add(startKey);

    let expansions=0;
    let closestKey=startKey;
    let closestGoalDistance=
      this.heuristic(
        start.cx,
        start.cy,
        goal.cx,
        goal.cy
      );

    while(
      open.length&&
      expansions<
        Math.max(
          1,
          Number(maxExpansions)||
          this.MAX_EXPANSIONS
        )
    ){
      let bestIndex=0;
      for(let index=1;index<open.length;index++){
        if(
          open[index].f<open[bestIndex].f||
          (
            open[index].f===open[bestIndex].f&&
            open[index].g<open[bestIndex].g
          )
        ){
          bestIndex=index;
        }
      }

      const current=open.splice(bestIndex,1)[0];
      openKeys.delete(current.key);
      if(closed.has(current.key))continue;
      closed.add(current.key);
      expansions++;

      const goalDistance=this.heuristic(
        current.cx,
        current.cy,
        goal.cx,
        goal.cy
      );
      if(goalDistance<closestGoalDistance){
        closestGoalDistance=goalDistance;
        closestKey=current.key;
      }

      if(current.key===goalKey){
        return {
          found:true,
          path:this.reconstruct(
            cameFrom,
            current.key,
            nodeByKey,
            grid
          ),
          algorithm:String(algorithm),
          closest:this.cellCenter(
            grid,
            current.cx,
            current.cy
          ),
          expansions
        };
      }

      for(const neighbor of this.neighbors(
        grid,
        current.cx,
        current.cy,
        dynamicObstacles,
        traversal
      )){
        const key=this.key(
          neighbor.cx,
          neighbor.cy
        );
        if(closed.has(key))continue;

        nodeByKey.set(
          key,
          neighbor
        );

        const tentative=
          current.g+
          neighbor.cost;
        const known=
          gScore.has(key)
            ?gScore.get(key)
            :Infinity;
        if(tentative>=known)continue;

        cameFrom.set(
          key,
          current.key
        );
        gScore.set(
          key,
          tentative
        );

        const item={
          ...neighbor,
          key,
          g:tentative,
          f:
            tentative+
            heuristic(
              neighbor.cx,
              neighbor.cy
            )
        };

        if(!openKeys.has(key)){
          open.push(item);
          openKeys.add(key);
        }else{
          const existing=open.find(
            value=>value.key===key
          );
          if(existing){
            existing.g=item.g;
            existing.f=item.f;
          }
        }
      }
    }

    return {
      found:false,
      path:
        closestKey!==startKey
          ?this.reconstruct(
            cameFrom,
            closestKey,
            nodeByKey,
            grid
          )
          :[],
      algorithm:String(algorithm),
      closest:
        nodeByKey.has(closestKey)
          ?this.cellCenter(
            grid,
            nodeByKey.get(closestKey).cx,
            nodeByKey.get(closestKey).cy
          )
          :null,
      expansions
    };
  },

  findPath(
    entity,
    target,
    options={}
  ){
    if(!entity||!target)return {
      found:false,
      path:[],
      algorithm:'none'
    };

    const radius=Math.max(
      0,
      Number(options.radius)||
      Number(entity.radius)||
      0
    );
    const cellSize=Math.max(
      16,
      Number(options.cellSize)||
      this.DEFAULT_CELL
    );

    const dynamicObstacles=
      Array.isArray(options.dynamicObstacles)
        ?options.dynamicObstacles
        :[];
    const directClear=
      !WorldGeometryService.segmentBlocked(
        entity.x,
        entity.y,
        target.x,
        target.y,
        radius
      )&&
      !this.segmentBlockedByDynamic(
        entity.x,
        entity.y,
        target.x,
        target.y,
        radius,
        dynamicObstacles
      );

    if(directClear){
      return {
        found:true,
        direct:true,
        path:[{
          x:Number(target.x)||0,
          y:Number(target.y)||0
        }],
        algorithm:'direct',
        expansions:0
      };
    }

    const astar=this.search(
      entity.x,
      entity.y,
      target.x,
      target.y,
      {
        radius,
        cellSize,
        algorithm:'astar',
        maxExpansions:
          options.maxExpansions,
        dynamicObstacles,
        traversal:
          options.traversal||null
      }
    );

    if(astar.found){
      return astar;
    }

    // A*가 정확한 목표 경로를 못 찾았을 때
    // 다익스트라가 비용만으로 전체 도달 가능 영역을 확인해
    // 목표에 가장 가까운 도달점을 폴백으로 제공한다.
    const dijkstra=this.search(
      entity.x,
      entity.y,
      target.x,
      target.y,
      {
        radius,
        cellSize,
        algorithm:'dijkstra',
        maxExpansions:
          options.maxExpansions,
        dynamicObstacles,
        traversal:
          options.traversal||null
      }
    );

    if(
      dijkstra.found||
      dijkstra.path.length
    ){
      return {
        ...dijkstra,
        fallbackFrom:'astar'
      };
    }

    return astar;
  }
});