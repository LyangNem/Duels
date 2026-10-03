{
    id: "erapabi",
    name: "에라 파비",
    title: "파비 빔!!!!!!!!!!!!!!!!!!!!",
    color: "#38bdf8",
    classification: {style: 6, range: 0, role: 3},
    stats: {maxHealth: 1800, speed: 4.25, radius: 20, baseDamage: 40, difficulty: 3},
    desc: "차지 타입 아머로 받은 피해를 축적하여 한방에 터뜨리는 캐릭터",
    tooltipSkills: [
      {
        key: "ALWAYS",
        name: "차지 타입 아머",
        attack: "megaLaserTick",
        showCost: false,
        text: "피해를 받으면 충전. 최대 체력의 {progressThresholdPercent}% 이상 피해를 받을 시 파비 레이저 활성화"
      },
      {key: "LMB", name: "레이저 연사", attack: "lmb", text: "레이저를 {pellets}발씩 {burstCount}회 발사 (탄당 {damage})"},
      {
        key: "RMB",
        name: "버티기",
        attack: "rmb",
        ability: "rmb",
        text: "{delaySeconds}초 후 {modifierSeconds}초간 받는 피해 {modifierPercent}% 감소 및 주변 적 넉백"
      },
      {
        key: "RMB CHARGE",
        name: "파비 레이저",
        attack: "megaLaserTick",
        ability: "rmb",
        progressStateKey: "erapabi-charge-armor",
        showCost: false,
        text: "{channelChargeSeconds}초 선딜레이 후 저장 피해를 소모하며 벽과 적을 관통하는 레이저 발사 (타당 {damage})"
      },
      {key: "L-Shift", name: "한바퀴 회전", attack: "counter", text: "땅을 짚고 빠르게 회전해 앞뒤 피해 ({damage})"}
    ],
    triggers: [
      {
        id: "charge-armor-store-damage",
        type: "trigger",
        event: "damage-received",
        modules: [
          {
            type: "state.progress",
            stateKey: "erapabi-charge-armor",
            operation: "add",
            amountFrom: "healthDamage",
            maxHealthRatio: 4,
            presentation: {
              type: "arc-gauge",
              color: "#38bdf8",
              overflowColor: "#c8efff",
              lineWidth: 3.5,
              layers: 2,
              readyAtRatio: 0.5,
              maxChargeFlash: true,
              flashAfterFirstLayer: true
            }
          }
        ]
      }
    ],
    attacks: {
      lmb: {
        id: "attack.erapabi.lmb",
        damageRatio: 1,
        cost: 250,
        cd: 380,
        range: 900,
        modules: [
          {type: "pattern.scatter", count: 2, spread: 0},
          {type: "delivery.projectile", speed: 30, radius: 8},
          {
            type: "delivery.delayed-projectile-volley",
            count: 2,
            interval: 130,
            aimMode: "live-source",
            perVolleyPellets: true,
            perpendicularOffset: 12,
            phaseKey: "erapabi-laser-burst"
          },
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "laser-bolt",
              baseRadius: characterValue("attacks.lmb.modules.1.radius"),
              outerColor: "14,165,233",
              midColor: "56,189,248",
              coreColor: "125,211,252",
              centerColor: "255,255,255"
            }
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.erapabi.rmb",
        damageRatio: 0,
        cost: 300,
        cd: 400,
        attackDelayGroup: "erapabi-rmb",
        attackDelay: 400,
        windupCancelBuffs: [{stat: "defense", sourceId: "ability.erapabi.rmb:fortify"}],
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            range: 72,
            r: 72,
            color: "56,189,248",
            fillAlpha: 0.035,
            strokeAlpha: 0.72,
            lineWidth: 2.5,
            duration: 400,
            followSource: true
          }
        ],
        tags: ["스킬", "선딜레이"]
      },
      rmbBurst: {
        id: "attack.erapabi.rmb-burst",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 200,
        effectsOnly: true,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.rmbBurst.range"), wallPolicy: "block"},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 70,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            range: characterValue("attacks.rmbBurst.range"),
            r: characterValue("attacks.rmbBurst.range"),
            color: "56,189,248",
            fillAlpha: 0.08,
            strokeAlpha: 0.72,
            lineWidth: 2.5,
            durationFrames: 18,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["스킬"]
      },
      megaLaserStart: {
        id: "attack.erapabi.mega-laser-start",
        damageRatio: 0,
        cost: 0,
        cd: 500,
        attackDelayGroup: "erapabi-rmb",
        attackDelay: 500,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            range: 96,
            r: 96,
            color: "56,189,248",
            fillAlpha: 0.025,
            strokeAlpha: 0.94,
            lineWidth: 3,
            duration: 500,
            followSource: true
          }
        ],
        tags: ["스킬", "선딜레이"]
      },
      megaLaserTick: {
        id: "attack.erapabi.mega-laser-tick",
        damageRatio: 3.75,
        cost: 0,
        cd: 0,
        range: 4000,
        suppressProjectileFireSound: true,
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.megaLaserTick.range"),
            halfWidth: 52.5,
            wallPolicy: "ignore",
            projectileClassification: "instant-laser"
          },
          {
            type: "effect.spawn",
            renderType: "beamLine",
            range: characterValue("attacks.megaLaserTick.range"),
            halfWidth: characterValue("attacks.megaLaserTick.modules.0.halfWidth"),
            nonHitAuraHalfWidth: 52.5,
            color: "56,189,248",
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
            scaleWithAttackRange: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.erapabi.counter",
        damageRatio: 6.25,
        cost: 0,
        cd: 300,
        range: 170,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 1.8849555921538759,
            wallPolicy: "ignore"
          },
          {
            type: "delivery.area",
            shape: "sector",
            range: 140,
            halfAngle: 1.8849555921538759,
            angleOffset: 3.141592653589793,
            delay: 200,
            wallPolicy: "ignore"
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.erapabi.lmb",
        input: "lmb",
        attackId: "attack.erapabi.lmb",
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
        id: "ability.erapabi.rmb",
        input: "rmb",
        attackId: "attack.erapabi.rmb",
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
            {type: "channel.stop", stateKey: "erapabi-mega-laser"},
            {
              type: "action.attack",
              alternateWhen: {
                attackId: "attack.erapabi.mega-laser-start",
                conditions: [{type: "state.progress-ratio-gte", stateKey: "erapabi-charge-armor", value: 0.5}]
              }
            },
            {type: "timing.delay", duration: 400, requireAttackId: "attack.erapabi.rmb"},
            {
              type: "modifier.set",
              stat: "defense",
              value: 0.5,
              duration: 3000,
              sourceId: "ability.erapabi.rmb:fortify",
              requireAttackId: "attack.erapabi.rmb"
            },
            {
              type: "action.trigger-attack",
              attackId: "attack.erapabi.rmb-burst",
              requireExecuted: true,
              requireAttackId: "attack.erapabi.rmb"
            },
            {
              type: "channel.attack",
              stateKey: "erapabi-mega-laser",
              attackId: "attack.erapabi.mega-laser-tick",
              chargeDuration: 500,
              interval: 40,
              fireSound: "shoot",
              aimMode: "live-source",
              drainStateKey: "erapabi-charge-armor",
              drainAmount: 100,
              selfStatus: {status: "bind", applyDuringCharge: true},
              cooldownMs: 400,
              cooldownAttackIds: ["attack.erapabi.rmb", "attack.erapabi.mega-laser-start"],
              requireExecuted: true,
              requireAttackId: "attack.erapabi.mega-laser-start"
            }
          ]
        }
      },
      counter: {
        id: "ability.erapabi.counter",
        input: "counter",
        attackId: "attack.erapabi.counter",
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
