{
    id: "dazbin",
    name: "다즈빈",
    englishName: "Dazbin",
    title: "견습 마법사",
    color: "#3355ff",
    classification: {style: 8, range: 0, role: 5},
    stats: {maxHealth: 1000, speed: 3.75, radius: 20, baseDamage: 300, difficulty: 2},
    desc: "물의 정령과 파동으로 적을 압박하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "물의 정령", attack: "lmb", text: "물의 정령이 가장 가까운 적을 향해 유도 ({damage})"},
      {
        key: "RMB",
        name: "파동 구체",
        attack: "rmb",
        text: "벽과 적을 관통하는 파동 구체. 범위 내 적에게 {fieldIntervalSeconds}초마다 피해 및 감속 ({damage})"
      },
      {key: "L-Shift", name: "강한 파도", attack: "counter", text: "벽과 적을 관통하는 거대한 파도. 적에게 피해, 경로의 모든 투사체 제거 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.dazbin.lmb",
        damageRatio: 1,
        cost: 350,
        cd: 380,
        range: 650,
        modules: [
          {
            type: "delivery.projectile",
            speed: 16.9,
            radius: 10,
            homing: {startTravelRatio: 0.3, maxTurnPerFrame: 0.03, preserveTurnRadius: true, targetRelations: ["enemy"]}
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.dazbin.rmb",
        damageRatio: 0.3333333333333333,
        cost: 700,
        cd: 400,
        range: 820,
        modules: [
          {
            type: "delivery.range-projectile",
            speed: 7,
            radius: 150,
            rehitInterval: 500,
            proximitySpeed: {active: 2, targetRelations: ["enemy"]},
            contactStatus: {status: "slow", duration: 120, targetRelations: ["enemy"]}
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              fillAlpha: 0.2,
              strokeColor: "#508cff",
              strokeAlpha: 0.9,
              strokeWidth: 3,
              innerColor: "#8fc2ff",
              innerScale: 0.55,
              innerAlpha: 0.5,
              innerStrokeWidth: 2
            }
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.dazbin.counter",
        damageRatio: 0.6666666666666666,
        cost: 0,
        cd: 300,
        range: 4000,
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "source",
            rangeMode: "world-edge",
            range: characterValue("attacks.counter.range"),
            halfWidth: 240,
            growthSpeed: 1,
            travelSpeed: 1800,
            animation: true,
            color: "51,85,255",
            strokeColor: "125,211,252",
            fillAlpha: 0.22,
            strokeAlpha: 0.92,
            lineWidth: 3,
            endCap: true,
            endCapColor: "224,242,254",
            endCapAlpha: 0.95,
            endCapLineWidth: 6,
            centerLine: true,
            centerColor: "186,230,253",
            centerAlpha: 0.4,
            centerLineWidth: 2,
            duration: 1100,
            damage: {
              attackId: "attack.dazbin.counter",
              hitMode: "progressive-rect",
              projectileClear: {targetRelations: ["self", "ally", "enemy", "neutral"]},
              module: {type: "delivery.area", shape: "rect", range: 4000, halfWidth: 240, wallPolicy: "ignore"}
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.dazbin.lmb",
        input: "lmb",
        attackId: "attack.dazbin.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "cooldowns.ready", attackIds: ["attack.dazbin.lmb"]},
            {type: "resource.gte", resource: "stamina", value: 300}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      rmb: {
        id: "ability.dazbin.rmb",
        input: "rmb",
        attackId: "attack.dazbin.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "cooldowns.ready", attackIds: ["attack.dazbin.rmb"]},
            {type: "resource.gte", resource: "stamina", value: 600}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.dazbin.counter",
        input: "counter",
        attackId: "attack.dazbin.counter",
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
              preview: {type: "preview.create", shape: "attack-shape"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "away-from-impact",
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
