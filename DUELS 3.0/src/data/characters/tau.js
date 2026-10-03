{
    id: "tau",
    name: "타우",
    title: "사슬낫의 소년",
    color: "#00ffff",
    classification: {style: 1, range: 0, role: 6},
    stats: {maxHealth: 1000, speed: 4.5, radius: 20, baseDamage: 200, difficulty: 2},
    desc: "스파크를 충전해 강력한 한방 싸움을 전개하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "사슬낫 휘두르기", attack: "lmb", text: "사슬낫을 휘둘러 피해. 적중한 적마다 스파크 {progressAmount} 충전 ({damage})"},
      {key: "LMB CRIT", name: "", attack: "lmbCharged", showCost: false, text: "스파크 최대 충전 시 강화 피해 ({damage})"},
      {key: "RMB", name: "쇠사슬 추격", attack: "rmb", text: "낫을 던져 적중 시 해당 위치로 이동 후 피해. ({damage})"},
      {key: "L-Shift", name: "스파크 웨이브", attack: "counter", text: "낫을 한 바퀴 돌려 주변 광역 피해 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.tau.lmb",
        damageRatio: 0.75,
        cost: 200,
        cd: 350,
        attackDelayGroup: "tau-primary",
        attackDelay: 350,
        range: 200,
        modules: [
          {type: "delivery.area",
            contactType: "melee", shape: "sector", range: characterValue("attacks.lmb.range"), halfAngle: 1.2},
          {
            type: "state.progress",
            stateKey: "spark-scythe",
            when: "on-hit",
            operation: "add",
            amount: 1,
            max: 3,
            presentation: {type: "arc-gauge", color: "#00ffff", lineWidth: 3, maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      lmbCharged: {
        id: "attack.tau.lmb-charged",
        damageRatio: 2.5,
        cost: 200,
        cd: 350,
        attackDelayGroup: "tau-primary",
        attackDelay: 350,
        range: 200,
        modules: [
          {type: "delivery.area",
            contactType: "melee", shape: "sector", range: characterValue("attacks.lmbCharged.range"), halfAngle: 1.2},
          {
            type: "effect.spawn",
            renderType: "botSwing",
            shape: "sector",
            range: characterValue("attacks.lmbCharged.range"),
            halfAngle: characterValue("attacks.lmbCharged.modules.0.halfAngle"),
            durationFrames: 10,
            color: "255,215,0",
            fillColor: "255,215,0",
            strokeColor: "255,215,0",
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 42,
            speed: 10,
            oncePerExecution: true
          },
          {type: "state.progress", stateKey: "spark-scythe", when: "on-hit", operation: "reset", oncePerExecution: true}
        ],
        tags: ["평타", "크리티컬"]
      },
      rmb: {
        id: "attack.tau.rmb",
        damageRatio: 0.75,
        cost: 450,
        cd: 400,
        range: 650,
        modules: [
          {type: "delivery.projectile", speed: 22, radius: 12},
          {
            type: "projectile.return",
            stateKey: "spark-scythe-projectile",
            returnAttackId: "attack.tau.rmb-return",
            stopAtRange: true,
            returnAtRange: true,
            returnOnMiss: true,
            speed: 28,
            damageOnReturn: true
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {type: "projectile.collision", wall: "remove"},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: 18,
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 9,
              returningAlpha: 0.62,
              strokeColor: "0,255,255",
              innerColor: "190,255,255",
              showLink: true,
              linkAlpha: 0.18,
              linkWidth: 1.5,
              linkDash: [5, 4]
            }
          },
          {
            type: "movement.move",
            when: "on-projectile-outbound-hit",
            target: {type: "projectile", stateKey: "spark-scythe-projectile"},
            replaceActive: true,
            duration: 420,
            easing: "ease-out",
            oncePerExecution: true,
            collision: {passWalls: true, passEnemies: true},
            presentation: {type: "dash-line", color: "0,255,255", width: 6, alpha: 0.4, duration: 167}
          },
          {
            type: "status.apply",
            when: "on-projectile-outbound-hit",
            status: "bind",
            duration: 500,
            oncePerExecution: true
          },
          {
            type: "movement.move",
            when: "on-projectile-wall-hit",
            target: {type: "projectile", stateKey: "spark-scythe-projectile"},
            replaceActive: true,
            duration: 420,
            easing: "ease-out",
            oncePerExecution: true,
            collision: {passWalls: true, passEnemies: true},
            presentation: {type: "dash-line", color: "0,255,255", width: 6, alpha: 0.4, duration: 167}
          }
        ],
        tags: ["스킬"]
      },
      rmbReturn: {
        id: "attack.tau.rmb-return",
        damageRatio: 0.75,
        cost: 0,
        cd: 0,
        range: 650,
        modules: [
          {type: "delivery.projectile", phase: "returning", speed: 28, radius: 12},
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: 18,
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 9,
              returningAlpha: 0.62,
              strokeColor: "0,255,255",
              innerColor: "190,255,255",
              showLink: true,
              linkAlpha: 0.18,
              linkWidth: 1.5,
              linkDash: [5, 4]
            }
          },
          {
            type: "movement.projectile-tether",
            target: "hit-target",
            status: "bind",
            duration: 500,
            projectile: "impact-projectile",
            contactSource: true,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.tau.counter",
        damageRatio: 0.75,
        cost: 0,
        cd: 300,
        range: 200,
        modules: [
          {type: "delivery.area",
            contactType: "melee", shape: "circle", range: characterValue("attacks.counter.range")},
          {
            type: "effect.spawn",
            renderType: "annularDoubleSweep",
            position: "source",
            r: characterValue("attacks.counter.range"),
            span: 3.141592653589793,
            sweepFraction: 0.55,
            fadePower: 1.5,
            hitColor: "0,220,220",
            fillAlpha: 0.18,
            strokeAlpha: 0.85,
            lineWidth: 2.5,
            edgeLine: false,
            durationFrames: 22,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "state.progress",
            stateKey: "spark-scythe",
            when: "after-attack",
            operation: "set-max",
            max: characterValue("attacks.lmb.modules.1.max"),
            presentation: {type: "arc-gauge", color: "#00ffff", lineWidth: 3, maxChargeFlash: true}
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.tau.lmb",
        input: "lmb",
        attackId: "attack.tau.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [
            {
              type: "action.attack",
              alternateWhen: {
                conditions: [
                  {
                    type: "state.progress-gte",
                    stateKey: "spark-scythe",
                    value: characterValue("attacks.lmb.modules.1.max")
                  }
                ],
                attackId: "attack.tau.lmb-charged"
              }
            }
          ]
        }
      },
      rmb: {
        id: "ability.tau.rmb",
        input: "rmb",
        attackId: "attack.tau.rmb",
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
        id: "ability.tau.counter",
        input: "counter",
        attackId: "attack.tau.counter",
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
              presentation: {chargeRadius: 40, fireEffect: false},
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
