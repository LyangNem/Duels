


/* Entity에 귀속된 보조 투사체 재고. 귀속 주체/보유자/발사 AttackSpec을 데이터로 분리해
   지원탄, 위성탄, 표식탄 등 캐릭터 비의존 공격 동반 탄약에 재사용한다. */
const ProjectileWallCollisionModeService=Object.freeze({
  size(module){
    return Math.max(
      0,
      Number(module?.hitRadius)||0,
      Number(module?.radius)||0
    );
  },
  resolve(module,source=null){
    if(module?.wallCollisionMode==='center')return 'center';
    if(module?.wallCollisionMode==='radius')return 'radius';
    if(String(module?.type||'')==='delivery.range-projectile'){
      return 'center';
    }

    const sourceRadius=Math.max(
      0,
      Number(source?.radius)||0
    );
    return this.size(module)>sourceRadius
      ?'center'
      :'radius';
  },
  padding(module,source=null){
    return this.resolve(module,source)==='center'
      ?0
      :this.size(module);
  }
});