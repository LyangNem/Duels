{
    id: "atsuteo",
    name: "아츠테오",
    englishName: "Atsuteo",
    title: "광석 전문가",
    color: "#735800",
    classification: {style: 5, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 4, radius: 20, baseDamage: 150, difficulty: 3},
    desc: "찾아낸 광석으로 적을 공격하는 탐사자 캐릭터",
    orbitInventory: {
      stateKey: "atsuteo-ore",
      attackId: "attack.atsuteo.ore-hit",
      rangeScaleTags: ["범위 공격"],
      capacity: 9,
      maxQuality: 1,
      orbitRadiusMode: "fixed",
      orbitRadiusMin: 120,
      orbitRadiusMax: 120,
      itemRadius: 10,
      angularSpeed: 0.003375,
      baseProjectileSpeed: 6.75,
      fixedSlots: 9,
      counterOrbitRadiusOffset: 34,
      counterFixedSlots: 10,
      palette: ["#735800"]
    },
    tooltipSkills: [
      {key: "ALWAYS", name: "떠오르는 원석", attack: "oreHit", showCost: false, text: "채굴한 원석이 주변을 회전하며 피해 ({damage})"},
      {key: "LMB", name: "곡괭이", attack: "lmb", text: "곡괭이를 휘둘러 피해. 벽을 채굴하면 원석 획득 ({damage})"},
      {key: "RMB", name: "광석 발견", attack: "rmbLand", costAttack: "rmb", text: "지정 방향으로 빠르게 이동"},
      {key: "L-Shift", name: "원석 충전", attack: "counter", text: "제자리를 내려쳐 피해를 주고 모든 원석을 충전 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.atsuteo.lmb",
        damageRatio: 0.6666666666666666,
        cost: 200,
        cd: 380,
        range: 105,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 0.78,
            contactType: "melee",
            wallPolicy: "block",
            render: false
          },
          {
            type: "orbit.inventory.mine-wall",
            when: "after-attack",
            stateKey: "atsuteo-ore",
            range: 105,
            halfAngle: 0.78,
            amountPerWall: 3
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "botSwing",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            durationFrames: 9,
            color: "115,88,0",
            fillColor: "115,88,0",
            strokeColor: "196,158,47",
            fillAlpha: 0.13,
            strokeAlpha: 0.92,
            lineWidth: 3,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            endChord: true,
            endChordWidth: 3.5
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.atsuteo.rmb",
        damageRatio: 0,
        cost: 200,
        cd: 500,
        range: 270,
        effectsOnly: true,
        modules: [
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:atsuteo-discovery",
            direction: "attack",
            distance: characterValue("attacks.rmb.range"),
            duration: 180,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            onEndAttackIds: ["attack.atsuteo.rmb-land"],
            tags: ["이동기"],
            presentation: {
              type: "dash-line",
              color: "115,88,0",
              width: 6,
              alpha: 0.4,
              duration: characterValue("attacks.rmb.modules.0.duration")
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbLand: {
        id: "attack.atsuteo.rmb-land",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "orbit.inventory-recast",
            operation: "start-window",
            stateKey: "atsuteo-rmb-chain",
            window: 800,
            windowAfterCooldown: true,
            cooldownAttackId: "attack.atsuteo.rmb",
            when: "after-attack"
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.atsuteo.counter",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 650,
        range: 150,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            wallPolicy: "ignore",
            render: false
          },
          {type: "orbit.inventory.fill", when: "after-attack", stateKey: "atsuteo-ore"},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: characterValue("attacks.counter.range"),
            r: characterValue("attacks.counter.range"),
            maxR: characterValue("attacks.counter.range"),
            color: "115,88,0",
            fillAlpha: 0.1,
            strokeAlpha: 0.96,
            lineWidth: 4,
            durationFrames: 14,
            animation: false,
            scaleWithAttackRange: true
          }
        ],
        tags: ["반격"]
      },
      oreHit: {
        id: "attack.atsuteo.ore-hit",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 0,
        impactOrigin: "source",
        suppressProjectileFireSound: true,
        modules: [
          {
            type: "delivery.projectile",
            speed: 6.75,
            radius: 10,
            hitRadius: characterValue("attacks.oreHit.modules.0.radius"),
            wallCollisionMode: "center",
            orbit: {anchor: "source", duration: 0, minRadius: 0, maxRadius: 0, angularSpeed: 0}
          },
          {type: "projectile.pierce", targets: false, walls: true},
          {type: "projectile.collision", wall: "clamp"}
        ],
        tags: ["특수 공격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.atsuteo.lmb",
        input: "lmb",
        attackId: "attack.atsuteo.lmb",
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
        id: "ability.atsuteo.rmb",
        input: "rmb",
        attackId: "attack.atsuteo.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [
            {
              type: "orbit.inventory-recast",
              operation: "check",
              stateKey: "atsuteo-rmb-chain",
              window: 1000,
              maxUses: 0
            },
            {type: "action.attack", captureTargetPoint: true},
            {
              type: "orbit.inventory-recast",
              operation: "commit",
              stateKey: "atsuteo-rmb-chain",
              window: 1000,
              maxUses: 0,
              requireExecuted: true
            }
          ]
        }
      },
      counter: {
        id: "ability.atsuteo.counter",
        input: "counter",
        attackId: "attack.atsuteo.counter",
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
                direction: "away-from-source",
                distance: 42,
                speed: 10,
                oncePerExecution: true
              }
            }
          ]
        }
      }
    }
  }
