{
    id: "shello",
    name: "셸로",
    englishName: "Shello",
    title: "히어로 지망생",
    color: "#522a50",
    classification: {style: 6, range: 0, role: 3},
    stats: {maxHealth: 1500, speed: 4.25, radius: 20, baseDamage: 150, difficulty: 1},
    desc: "날카롭게 개조한 방패로 공격을 패리하는 캐릭터",
    counterReadyPresentation: {color: "255,215,0", kindColors: {parry: "255,118,32"}},
    debugCounterModes: [
      {flag: "counterActive", label: "반격 활성화", kind: "normal"},
      {flag: "counterParryActive", label: "패리 반격 활성화", kind: "parry"}
    ],
    tooltipSkills: [
      {key: "LMB", name: "방패 베기", attack: "lmb", text: "방패의 옆면으로 휘둘러 베어냄 ({damage})"},
      {key: "RMB", name: "방어자세", attack: "rmb", text: "방패를 내세워 찰나동안 모든 공격을 방어. 방어 성공 시 패리 반격기 활성화"},
      {key: "RMB/L-Shift", name: "쉴드 어택", attack: "counterParry", text: "방패를 먼저 날리고 적중 시 이동 ({damage})"},
      {key: "L-Shift", name: "스피닝", attack: "counter", text: "방패를 날려 주변을 회전 (타당 {damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.shello.lmb",
        koDirectionMode: "attack-direction",
        suppressProjectileFireSound: true,
        impactOrigin: "source",
        damageRatio: 1,
        cost: 150,
        cd: 420,
        range: 205.5,
        modules: [
          {
            type: "delivery.range-projectile",
            speed: 0,
            radius: 48,
            wallCollisionMode: "center",
            orbit: {
              anchor: "origin",
              radiusMode: "nearest-enemy",
              minRadius: 0,
              maxRadius: 157.5,
              startAngleOffset: -1.413716694115407,
              totalAngle: 2.827433388230814,
              duration: 180
            }
          },
          {type: "projectile.pierce", targets: true, walls: false},
          {type: "projectile.collision", wall: "clamp"},
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              renderReachability: "orbit-center-clamp",
              fillAlpha: 0.2,
              strokeColor: "#522a50",
              strokeAlpha: 0.92,
              strokeWidth: 3,
              innerColor: "#8a5686",
              innerScale: 0.58,
              innerAlpha: 0.48,
              innerStrokeWidth: 2
            }
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.shello.rmb",
        damageRatio: 0,
        cost: 300,
        cd: 650,
        range: 92,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.rmb.range"),
            halfAngle: 1.319468914507713,
            wallPolicy: "block"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 42,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            stateKey: "shello-guard",
            renderType: "shieldSwing",
            range: characterValue("attacks.rmb.range"),
            halfAngle: characterValue("attacks.rmb.modules.0.halfAngle"),
            color: "82,42,80",
            duration: 200,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "attack.guard",
            stateKey: "shello-guard",
            shape: "sector",
            range: characterValue("attacks.rmb.range"),
            halfAngle: 1.319468914507713,
            wallPolicy: "block",
            duration: 200,
            onBlock: {counterWindow: 5000, counterKind: "parry"},
            visualState: {effectStateKey: "shello-guard", duration: 200, syncToGuardDuration: true, color: "255,118,32"}
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.shello.counter",
        koDirectionMode: "attack-direction",
        suppressProjectileFireSound: true,
        impactOrigin: "source",
        damageRatio: 0.6666666666666666,
        cost: 0,
        cd: 550,
        range: 205.5,
        previewGeometry: {shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "ignore"},
        modules: [
          {
            type: "delivery.range-projectile",
            speed: 0,
            radius: 48,
            wallCollisionMode: "center",
            orbit: {
              anchor: "source",
              minRadius: 0,
              maxRadius: 157.5,
              startAngleOffset: 0,
              angularSpeed: 0.025132741228718346,
              growDuration: 250,
              holdDuration: 500,
              shrinkDuration: 250,
              resetHitEachRevolution: true
            }
          },
          {type: "projectile.pierce", targets: true, walls: false},
          {type: "projectile.collision", wall: "clamp"},
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              renderReachability: "orbit-center-clamp",
              fillAlpha: 0.2,
              strokeColor: "#522a50",
              strokeAlpha: 0.94,
              strokeWidth: 3,
              innerColor: "#8a5686",
              innerScale: 0.58,
              innerAlpha: 0.5,
              innerStrokeWidth: 2
            }
          }
        ],
        tags: ["반격"]
      },
      counterParry: {
        id: "attack.shello.counter-parry",
        koDirectionMode: "attack-direction",
        impactOrigin: "source",
        damageRatio: 0.6666666666666666,
        cost: 0,
        cd: 550,
        range: 552.75,
        previewGeometry: {shape: "rect", range: characterValue("attacks.counterParry.range"), halfWidth: 48, wallPolicy: "ignore"},
        modules: [
          {type: "delivery.range-projectile", speed: 19.64, radius: 48, wallCollisionMode: "center"},
          {type: "projectile.pierce", targets: false, walls: true},
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              fillAlpha: 0.2,
              strokeColor: "#522a50",
              strokeAlpha: 0.94,
              strokeWidth: 3,
              innerColor: "#8a5686",
              innerScale: 0.58,
              innerAlpha: 0.5,
              innerStrokeWidth: 2
            }
          },
          {
            type: "movement.move",
            when: "on-hit",
            target: "hit-target",
            duration: 308.2,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            oncePerExecution: true,
            tags: ["이동기"],
            presentation: {
              type: "dash-line",
              color: "82,42,80",
              width: 7,
              alpha: 0.45,
              duration: characterValue("attacks.counterParry.modules.3.duration")
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.shello.lmb",
        input: "lmb",
        attackId: "attack.shello.lmb",
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
        id: "ability.shello.rmb",
        input: "rmb",
        attackId: "attack.shello.rmb",
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
        id: "ability.shello.counter",
        input: "counter",
        attackId: "attack.shello.counter",
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
              alternateWhen: {
                attackId: "attack.shello.counter-parry",
                counterKind: "parry",
                cc: {
                  type: "movement.neutralize-knockback",
                  target: "hit-target",
                  direction: "away-from-impact",
                  distance: 84,
                  speed: 10,
                  oncePerExecution: true
                }
              },
              preview: {type: "preview.create", shape: "attack-shape"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "away-from-impact",
                distance: 84,
                speed: 10
              }
            }
          ]
        }
      }
    }
  }
