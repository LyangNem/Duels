{
    id: "maisil",
    name: "메이실",
    title: "기사의 재단사",
    color: "#ffd700",
    classification: {style: 5, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 4.25, radius: 20, baseDamage: 150, difficulty: 4},
    desc: "가위로 정확한 중앙 타격을 노리며 전투하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "가위질", attack: "lmb", text: "가위로 잘라 피해 ({damage})"},
      {
        key: "LMB CRIT",
        name: "",
        attack: "lmb",
        linkedAttack: "lmbCritical",
        showCost: false,
        text: "중앙에 적중 시 추가 피해 ({combinedDamage})"
      },
      {key: "RMB", name: "가위 찌르기", attack: "rmb", text: "가위로 찌르기. 적 소폭 끌어당김 ({damage})"},
      {key: "L-Shift", name: "가위 던지기", attack: "counter", text: "커다란 가위를 던져 최대 사거리 도달 후 귀환 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.maisil.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 380,
        range: 200,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.0471975511965976,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            color: "250,204,21",
            fillAlpha: 0.22,
            strokeAlpha: 0.8,
            lineWidth: 2,
            durationFrames: 14,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      lmbCritical: {
        id: "attack.maisil.lmb-critical",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 200,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmbCritical.range"),
            halfAngle: 0.16755160819145565,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmbCritical.range"),
            halfAngle: characterValue("attacks.lmbCritical.modules.0.halfAngle"),
            color: "250,204,21",
            fillAlpha: 0.46,
            strokeAlpha: 0.96,
            lineWidth: 2.4,
            durationFrames: 14,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 21,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["평타", "크리티컬"]
      },
      rmb: {
        id: "attack.maisil.rmb",
        damageRatio: 1,
        cost: 350,
        cd: 900,
        range: 420,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "tapered-rect",
            range: characterValue("attacks.rmb.range"),
            startHalfWidth: 50.4,
            endHalfWidth: 0,
            wallPolicy: "block"
          },
          {type: "movement.pull", target: "hit-target", distance: 126, speed: 7.5, oncePerExecution: true},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "taperedArea",
            position: "source",
            range: characterValue("attacks.rmb.range"),
            startHalfWidth: 50.4,
            endHalfWidth: 0,
            fillAlpha: 0.28,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            color: "250,204,21",
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.maisil.counter",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 500,
        range: 525,
        modules: [
          {type: "delivery.projectile", speed: 35.1, radius: 40},
          {
            type: "projectile.return",
            stateKey: "maisil-scissors",
            returnAttackId: "attack.maisil.counter-return",
            stopAtRange: true,
            returnAtRange: true,
            speed: 35.1,
            damageOnReturn: true
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.counter.modules.0.radius"),
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.012,
              strokeWidth: 3.5,
              innerStrokeWidth: 2.5,
              crossHalfLength: 16,
              returningAlpha: 0.62,
              strokeColor: "250,204,21",
              innerColor: "255,255,150",
              showLink: false
            }
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-impact",
            distance: 84,
            speed: 10,
            oncePerExecution: false
          }
        ],
        tags: ["반격"]
      },
      counterReturn: {
        id: "attack.maisil.counter-return",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 0,
        range: 350,
        modules: [
          {type: "delivery.projectile", phase: "returning", speed: 23.4, radius: 40},
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.counterReturn.modules.0.radius"),
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.012,
              strokeWidth: 3.5,
              innerStrokeWidth: 2.5,
              crossHalfLength: 16,
              returningAlpha: 0.62,
              strokeColor: "250,204,21",
              innerColor: "255,255,150",
              showLink: false
            }
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-impact",
            distance: 84,
            speed: 10,
            oncePerExecution: false
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.maisil.lmb",
        input: "lmb",
        attackId: "attack.maisil.lmb",
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
            {type: "action.attack"},
            {type: "action.trigger-attack", attackId: "attack.maisil.lmb-critical", requireExecuted: true}
          ]
        }
      },
      rmb: {
        id: "ability.maisil.rmb",
        input: "rmb",
        attackId: "attack.maisil.rmb",
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
        id: "ability.maisil.counter",
        input: "counter",
        attackId: "attack.maisil.counter",
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
