{
    id: "meramona",
    name: "메라 모나",
    englishName: "Mera Mona",
    title: "마법 소녀",
    color: "#ff21da",
    classification: {style: 7, range: 0, role: 1},
    stats: {maxHealth: 1000, speed: 4, radius: 20, baseDamage: 150, difficulty: 3},
    desc: "정의를 수호하며 단계적으로 성장하는 마법소녀 캐릭터",
    tagPersistentActionStateKeys: ["meramona-stage", "meramona-hit-stack"],
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        valueMode: "count",
        valueRef: {type: "progress-sum", stateKeys: ["meramona-stage", "meramona-temp-stage"], max: 4},
        segments: [
          {value: 1, color: "#ff21da"},
          {value: 2, color: "#ff21da"},
          {value: 3, color: "#ff21da"},
          {value: 4, color: "#ff21da"}
        ],
        height: 4,
        gap: 2
      }
    ],
    tooltipSkills: [
      {
        key: "ALWAYS",
        name: "더욱 진심으로",
        attack: "rmb",
        showCost: false,
        text: "평타 {v:attacks.lmb.modules.2.max}회 적중 시 변신 활성화"
      },
      {key: "LMB", name: "정의의 이름으로!", attack: "lmb", text: "레이저 투사체 발사 ({damage})"},
      {
        key: "RMB",
        name: "변신!",
        attack: "rmb",
        text: "{delaySeconds}초 무적 후 다음 단계로 변신하며 주변 적에게 피해 및 넉백 ({linkedDamage})",
        linkedAttack: "emerge"
      },
      {
        inlineStages: [
          {key: "RMB I", attack: "lmbStage1", text: "평타 사거리 증가"},
          {key: "RMB II", attack: "lmbStage1", text: "이동속도 증가"},
          {key: "RMB III", attack: "lmbStage3", text: "평타 공격속도 증가"},
          {key: "RMB IV", attack: "lmbStage4", text: "평타 탄속 즉발"}
        ]
      },
      {
        key: "L-Shift",
        name: "지지않아!",
        attack: "counter",
        text: "정의의 에너지 방출. 적중 여부와 관계없이 {progressDecaySeconds}초간 임시 단계 1단계 상승 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.meramona.lmb",
        damageRatio: 1,
        cost: 150,
        cd: 350,
        range: 550,
        modules: [
          {type: "delivery.projectile", speed: 32.2, radius: 24},
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "laser-bolt",
              radius: characterValue("attacks.lmb.modules.0.radius"),
              strokeColor: "255,33,218",
              fillColor: "255,136,238"
            }
          },
          {
            type: "state.progress",
            when: "on-hit",
            stateKey: "meramona-hit-stack",
            operation: "add",
            amount: 1,
            max: 2,
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#ff21da", lineWidth: 3.5, lineCap: "round", maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      lmbStage1: {
        id: "attack.meramona.lmb-stage1",
        damageRatio: 1,
        cost: 150,
        cd: 350,
        range: 900,
        modules: [
          {type: "delivery.projectile", speed: 32.2, radius: 24},
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "laser-bolt",
              radius: characterValue("attacks.lmbStage1.modules.0.radius"),
              strokeColor: "255,33,218",
              fillColor: "255,136,238"
            }
          },
          {
            type: "state.progress",
            when: "on-hit",
            stateKey: "meramona-hit-stack",
            operation: "add",
            amount: 1,
            max: characterValue("attacks.lmb.modules.2.max"),
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#ff21da", lineWidth: 3.5, lineCap: "round", maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      lmbStage3: {
        id: "attack.meramona.lmb-stage3",
        damageRatio: 1,
        cost: 150,
        cd: 350,
        range: 900,
        modules: [
          {type: "delivery.projectile", speed: 32.2, radius: 24},
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "laser-bolt",
              radius: characterValue("attacks.lmbStage3.modules.0.radius"),
              strokeColor: "255,33,218",
              fillColor: "255,136,238"
            }
          },
          {
            type: "state.progress",
            when: "on-hit",
            stateKey: "meramona-hit-stack",
            operation: "add",
            amount: 1,
            max: characterValue("attacks.lmb.modules.2.max"),
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#ff21da", lineWidth: 3.5, lineCap: "round", maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      lmbStage4: {
        id: "attack.meramona.lmb-stage4",
        damageRatio: 1,
        cost: 150,
        cd: 350,
        range: 900,
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.lmbStage4.range"),
            halfWidth: 24,
            wallPolicy: "block",
            projectileClassification: "instant-laser"
          },
          {
            type: "effect.spawn",
            renderType: "beamLine",
            range: characterValue("attacks.lmbStage4.range"),
            halfWidth: characterValue("attacks.lmbStage4.modules.0.halfWidth"),
            nonHitAuraHalfWidth: 30,
            color: "255,33,218",
            coreColor: "255,255,255",
            fillAlpha: 0.34,
            strokeAlpha: 0.9,
            coreAlpha: 0.82,
            coreWidthRatio: 0.16,
            lineWidth: 3,
            glowAlpha: 0.065,
            glowWidthRatio: 2.8,
            midGlowAlpha: 0.11,
            midGlowWidthRatio: 1.65,
            flareAlpha: 0.36,
            flareRadiusRatio: 1.15,
            pulseSpeed: 0.018,
            friendlyViewerAlphaScale: 0.5,
            duration: 72,
            followSource: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true,
            clipToAttackArea: true
          },
          {
            type: "state.progress",
            when: "on-hit",
            stateKey: "meramona-hit-stack",
            operation: "add",
            amount: 1,
            max: characterValue("attacks.lmb.modules.2.max"),
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#ff21da", lineWidth: 3.5, lineCap: "round", maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.meramona.rmb",
        damageRatio: 0,
        cost: 0,
        cd: 500,
        range: 170,
        effectsOnly: true,
        modules: [],
        tags: ["스킬", "선딜레이"]
      },
      emerge: {
        id: "attack.meramona.emerge",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 170,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.emerge.range"), wallPolicy: "block"},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: characterValue("attacks.emerge.range"),
            r: 0,
            maxR: characterValue("attacks.emerge.range"),
            color: "255,33,218",
            fillAlpha: 0.12,
            strokeAlpha: 0.95,
            lineWidth: 3,
            durationFrames: 16,
            animation: true,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 140,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.meramona.counter",
        damageRatio: 1,
        cost: 0,
        cd: 400,
        range: 200,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: characterValue("attacks.counter.range"),
            r: 0,
            maxR: characterValue("attacks.counter.range"),
            color: "255,33,218",
            fillAlpha: 0.1,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            durationFrames: 22,
            animation: true,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "state.progress",
            when: "after-attack",
            stateKey: "meramona-temp-stage",
            operation: "add",
            amount: 1,
            max: 4,
            oncePerExecution: false,
            decay: {delay: 4000, rate: 100000}
          },
          {
            type: "modifier.set",
            when: "on-hit",
            stat: "speed",
            value: 0.25,
            duration: 4000,
            sourceId: "meramona:stage-speed",
            recipient: "source",
            conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 2}]
          },
          {
            type: "modifier.set",
            when: "on-hit",
            stat: "attackRate",
            value: 0.5,
            duration: 4000,
            sourceId: "meramona:stage-attack-rate",
            recipient: "source",
            conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 3}]
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.meramona.lmb",
        input: "lmb",
        attackId: "attack.meramona.lmb",
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
              alternates: [
                {
                  attackId: "attack.meramona.lmb-stage4",
                  conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 4}]
                },
                {
                  attackId: "attack.meramona.lmb-stage3",
                  conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 3}]
                },
                {
                  attackId: "attack.meramona.lmb-stage1",
                  conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 1}]
                }
              ]
            }
          ]
        }
      },
      rmb: {
        id: "ability.meramona.rmb",
        input: "rmb",
        attackId: "attack.meramona.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {
              type: "state.progress-gte",
              stateKey: "meramona-hit-stack",
              value: characterValue("attacks.lmb.modules.2.max")
            }
          ],
          modules: [
            {type: "action.attack"},
            {
              type: "effect.spawn",
              requireExecuted: true,
              renderType: "annularDoubleSweep",
              position: "source",
              angleMode: "absolute",
              angle: 0,
              r: 170,
              inner: 0,
              span: 6.283185307179586,
              sweepCount: 1,
              sweepDirection: "clockwise",
              startAngleOffset: -1.5707963267948966,
              sweepFraction: 0.75,
              fadePower: 1.35,
              hitColor: "255,33,218",
              fillAlpha: 0.2,
              strokeAlpha: 0.88,
              lineWidth: 2.5,
              edgeLine: false,
              duration: 600,
              animation: true,
              followSource: true,
              scaleWithAttackRange: true,
              rangeScaleAttackId: "attack.meramona.emerge",
              clipAttackId: "attack.meramona.emerge",
              clipToAttackArea: true
            },
            {type: "state.progress", stateKey: "meramona-hit-stack", operation: "reset", requireExecuted: true},
            {
              type: "state.progress",
              stateKey: "meramona-stage",
              operation: "add",
              amount: 1,
              max: 4,
              requireExecuted: true,
              thresholdModifiers: [
                {threshold: 2, stat: "speed", value: 0.25, sourceId: "meramona:stage-speed"},
                {threshold: 3, stat: "attackRate", value: 0.5, sourceId: "meramona:stage-attack-rate"}
              ]
            },
            {
              type: "status.apply",
              target: "self",
              status: "bind",
              duration: 600,
              sourceId: "ability.meramona.rmb:transform-bind",
              requireExecuted: true
            },
            {
              type: "modifier.set",
              stat: "invulnerable",
              value: 1,
              duration: 600,
              sourceId: "ability.meramona.rmb:transform-invulnerable",
              requireExecuted: true
            },
            {type: "timing.delay", duration: 600, requireExecuted: true},
            {type: "action.trigger-attack", attackId: "attack.meramona.emerge", requireExecuted: true}
          ]
        }
      },
      counter: {
        id: "ability.meramona.counter",
        input: "counter",
        attackId: "attack.meramona.counter",
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
              onFinishModules: [
                {type: "modifier.set", stat: "speed", value: 0.25, duration: 4000, sourceId: "meramona:stage-speed",
                  conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 2}]},
                {type: "modifier.set", stat: "attackRate", value: 0.5, duration: 4000, sourceId: "meramona:stage-attack-rate",
                  conditions: [{type: "state.progress-sum-gte", stateKeys: ["meramona-stage", "meramona-temp-stage"], value: 3}]}
              ],
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
