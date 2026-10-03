{
    id: "shubi",
    name: "슈비",
    title: "샷건 소녀",
    color: "#ff4500",
    classification: {style: 1, range: 0, role: 1},
    stats: {maxHealth: 1200, speed: 4, radius: 20, baseDamage: 100, difficulty: 1},
    desc: "샷건으로 근거리를 장악하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "샷건", attack: "lmb", text: "샷건 {pellets}발 발사 (탄당 {damage})"},
      {key: "RMB", name: "반동샷", attack: "rmb", text: "샷건 {pellets}발 발사하며 반동으로 자체 넉백 (탄당 {damage})"},
      {
        key: "L-Shift",
        name: "충전 사격",
        attack: "counter",
        text: "사거리, 집탄률, 탄속이 증가한 샷건 {pellets}발 발사하며 반동으로 자체 넉백 (탄당 {damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.shubi.lmb",
        damageRatio: 1,
        cost: 300,
        cd: 400,
        range: 300,
        modules: [{type: "pattern.scatter", count: 4, spread: 0.28}, {type: "delivery.projectile", speed: 24, radius: 8}],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.shubi.rmb",
        damageRatio: 1,
        cost: 600,
        cd: 700,
        range: 450,
        modules: [
          {type: "pattern.scatter", count: 6, spread: 0.28},
          {type: "delivery.projectile", speed: 36, radius: 9},
          {
            type: "movement.move",
            direction: "opposite-aim",
            motionMode: "knockback",
            distance: 90,
            duration: 140,
            collision: {passWalls: false, passEnemies: true}
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.shubi.counter",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 650,
        modules: [
          {type: "pattern.scatter", count: 6, spread: 0.15},
          {type: "delivery.projectile", speed: 64.8, radius: 9},
          {
            type: "movement.move",
            direction: "opposite-aim",
            motionMode: "knockback",
            distance: 90,
            duration: 140,
            collision: {passWalls: false, passEnemies: true}
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.shubi.lmb",
        input: "lmb",
        attackId: "attack.shubi.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      rmb: {
        id: "ability.shubi.rmb",
        input: "rmb",
        attackId: "attack.shubi.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.shubi.counter",
        input: "counter",
        attackId: "attack.shubi.counter",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "counter"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "source.property.falsy", property: "counterWindup"},
            {type: "counter.ready"}
          ],
          modules: [
            {
              type: "counter.execute",
              windup: 300,
              consumeState: "counter-ready",
              preview: {type: "preview.create", shape: "attack-sector"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "away-from-source",
                distance: 84,
                speed: 10,
                oncePerExecution: true
              }
            }
          ]
        }
      }
    }
  }
