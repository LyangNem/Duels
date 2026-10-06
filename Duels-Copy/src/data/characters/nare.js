{
    id: "nare",
    name: "나레",
    englishName: "Nare",
    title: "추억을 날리는 소녀",
    color: "#b8dcff",
    classification: {style: 2, range: 0, role: 2},
    stats: {maxHealth: 1200, speed: 4.25, radius: 20, baseDamage: 150, difficulty: 3},
    desc: "종이 비행기를 타고 압도적인 기동성으로 적을 공격하는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB",
        name: "종이 비행기",
        attack: "lmb",
        text: "벽과 적을 관통하는 종이 비행기를 발사. 적중 후 가까운 적을 향해 방향을 꺾어 날아가며 사거리 증가 ({damage})"
      },
      {key: "RMB", name: "거대 종이 비행기", attack: "rmb", text: "벽과 적을 관통하는 거대 종이 비행기를 날리고 탑승해 조종. 맵 외곽에 부딪히면 소멸 ({damage})"},
      {key: "RMB/RMB", name: "긴급 탈출!", attack: "rmbExit", text: "재사용 시 비행기에서 내리며, 비행기는 이동하던 방향으로 계속 날아감"},
      {
        key: "L-Shift",
        name: "비행기 무리",
        attack: "counter",
        text: "왼쪽부터 순차적으로 종이 비행기 {v:attacks.counter.modules.1.count}개를 날림 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.nare.lmb",
        damageRatio: 0.6666666666666666,
        cost: 150,
        cd: 500,
        range: 1000,
        presentation: {color: "#b8dcff", suppressAttackFeedback: true},
        modules: [
          {
            type: "delivery.projectile",
            speed: 20,
            radius: 12,
            collisionTargets: true,
            rehitInterval: 260,
            rangeExtendOnHitRatio: 0.85,
            homing: {
              startAfterHit: true,
              startTravelRatio: 0,
              maxTurnPerFrame: 0.11,
              preserveTurnRadius: true,
              preferLastHitTarget: true,
              searchRange: 340,
              targetRelations: ["enemy"]
            }
          },
          {type: "projectile.pierce", targets: true, walls: true}
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.nare.rmb",
        damageRatio: 1.3333333333333333,
        cost: 800,
        cd: 1200,
        range: 2200,
        presentation: {color: "#b8dcff"},
        modules: [
          {
            type: "delivery.range-projectile",
            speed: 8,
            radius: 112,
            collisionTargets: true,
            stateKey: "nare-rmb-plane",
            rehitInterval: 1000,
            expireAtRange: false
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-impact",
            distance: 180,
            speed: 14,
            oncePerExecution: true
          },
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              fillAlpha: 0.12,
              strokeColor: "#ffffff",
              strokeAlpha: 0.95,
              strokeWidth: 3,
              innerColor: "#dff7ff",
              innerScale: 0.58,
              innerAlpha: 0.36,
              innerStrokeWidth: 2
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbExit: {
        id: "attack.nare.rmb-exit",
        effectsOnly: true,
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        presentation: {color: "#b8dcff"},
        modules: [
          {
            type: "effect.spawn",
            position: "source",
            renderType: "areaCircle",
            range: 78,
            r: 78,
            color: "184,220,255",
            fillAlpha: 0.03,
            strokeAlpha: 0.7,
            lineWidth: 2,
            duration: 140
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.nare.counter",
        damageRatio: 0.6666666666666666,
        cost: 0,
        cd: 500,
        range: 1000,
        previewGeometry: {shape: "rect", range: characterValue("attacks.counter.range"), halfWidth: 132, wallPolicy: "ignore"},
        presentation: {color: "#b8dcff", suppressAttackFeedback: true},
        modules: [
          {
            type: "delivery.projectile",
            speed: 20,
            radius: 11,
            collisionTargets: true,
            rehitInterval: 260,
            rangeExtendOnHitRatio: 0.85,
            homing: {
              startAfterHit: true,
              startTravelRatio: 0,
              maxTurnPerFrame: 0.12,
              preserveTurnRadius: true,
              preferLastHitTarget: true,
              searchRange: 420,
              targetRelations: ["enemy"]
            }
          },
          {
            type: "delivery.delayed-projectile-volley",
            count: 7,
            delay: 0,
            interval: 65,
            aimMode: "locked",
            angleOffsets: [0, 0, 0, 0, 0, 0, 0],
            perpendicularOffsets: [-120, -80, -40, 0, 40, 80, 120]
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.nare.lmb",
        input: "lmb",
        attackId: "attack.nare.lmb",
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
        id: "ability.nare.rmb",
        input: "rmb",
        attackId: "attack.nare.rmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.nare.rmb-exit",
                  conditions: [
                    {type: "state.exists", stateKey: "projectile-ride"},
                    {type: "state.exists", stateKey: "nare-rmb-plane"}
                  ]
                }
              ],
              fallbackConditions: [
                {type: "state.absent", stateKey: "projectile-ride"},
                {type: "cooldowns.ready", attackIds: ["attack.nare.rmb"]},
                {type: "resource.gte", resource: "stamina", value: 1200}
              ]
            },
            {
              type: "projectile.ride.start",
              projectileStateKey: "nare-rmb-plane",
              rideStateKey: "projectile-ride",
              control: "input",
              turnPerFrame: 0.035,
              wallPass: true,
              requireExecuted: true,
              requireAttackId: "attack.nare.rmb"
            },
            {
              type: "projectile.ride.exit",
              rideStateKey: "projectile-ride",
              requireExecuted: true,
              requireAttackId: "attack.nare.rmb-exit"
            }
          ]
        }
      },
      counter: {
        id: "ability.nare.counter",
        input: "counter",
        attackId: "attack.nare.counter",
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
              ccRefAttackId: "attack.nare.counter"
            }
          ]
        }
      }
    }
  }
