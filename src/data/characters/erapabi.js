{
    id: "erapabi",
    name: "에라 파비",
    title: "파비 빔!!!!!!!!!!!!!!!!!!!!",
    color: "#38bdf8",
    classification: {style: 6, range: 0, role: 3},
    stats: {maxHealth: 1800, speed: 4.25, radius: 20, baseDamage: 40, difficulty: 3},
    desc: "차지 타입 아머로 받은 피해를 축적하여 한방에 터뜨리는 캐릭터",
    tooltipSkills: [
      {key: "ALWAYS", name: "차지 타입 아머", showCost: false, text: "받은 피해를 아머로 저장"},
      {key: "LMB", name: "레이저 건 아머", attack: "lmb", text: "레이저를 {pellets}발씩 {burstCount}회 발사 (탄당 {damage})"},
      {key: "RMB", name: "파비 레이저", attack: "megaLaserTick", ability: "rmb", text: "{channelChargeSeconds}초 선딜레이 후 아머를 소모하며 레이저 발사. 100% 미만에서 시작하면 저장된 아머 소모 속도 2배 (타당 {damage})"},
      {key: "L-Shift", name: "한바퀴 회전", attack: "counter", text: "땅을 짚고 빠르게 회전해 앞뒤 피해 ({damage})"}
    ],
    passives: [{type: "state.progress-rate", stateKey: "erapabi-charge-armor", maxHealthRatio: 2, ratePerSecond: 0, initial: 0,
      presentation: characterValue("triggers.0.modules.0.presentation")}],
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
            maxHealthRatio: 2,
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
        damageRatio: 1.25,
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
        id: "ability.erapabi.rmb", input: "rmb", attackId: "attack.erapabi.mega-laser-start",
        trigger: {type: "trigger", event: "input.press", conditions: [
          {type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "ability.pending-ready"}, {type: "combat.can-act"}
        ], modules: [
          {type: "channel.stop", stateKey: "erapabi-mega-laser"},
          {type: "action.attack"},
          {type: "channel.attack", stateKey: "erapabi-mega-laser", attackId: "attack.erapabi.mega-laser-tick",
            chargeDuration: 500, interval: 40, fireSound: "shoot", aimMode: "live-source",
            drainStateKey: "erapabi-charge-armor", drainAmount: 100,
            selfStatus: {status: "bind", applyDuringCharge: true}, cooldownMs: 400,
            cooldownAttackIds: ["attack.erapabi.mega-laser-start"], requireExecuted: true,
            conditions: [{type: "state.progress-ratio-gte", stateKey: "erapabi-charge-armor", value: 0.5}]},
          {type: "channel.attack", stateKey: "erapabi-mega-laser", attackId: "attack.erapabi.mega-laser-tick",
            chargeDuration: 500, interval: 40, fireSound: "shoot", aimMode: "live-source",
            drainStateKey: "erapabi-charge-armor", drainAmount: 200,
            selfStatus: {status: "bind", applyDuringCharge: true}, cooldownMs: 400,
            cooldownAttackIds: ["attack.erapabi.mega-laser-start"], requireExecuted: true,
            conditions: [{type: "state.progress-ratio-lt", stateKey: "erapabi-charge-armor", value: 0.5}]}
        ]}
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
