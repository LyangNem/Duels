{
    id: "gae",
    name: "가에",
    englishName: "Gae",
    title: "전투용 안드로이드",
    color: "#7f8992",
    classification: {style: 7, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 3.75, radius: 20, baseDamage: 150, difficulty: 4},
    staminaGainPerAction: 150,
    killRewardStaminaMode: "decrease",
    dodgeResourcePolicy: {mode: "gain", amount: 400, blockAtMax: true},
    commandRepair: {missingHealthRatio: 0.25},
    desc: "버려질 때 비활성화된 기능을 자체적으로 가동하며 전투하는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.arc",
        valueRef: {
          type: "mode-match-count-ratio",
          modes: [{stateKey:"command:laser", value:"active", initial:"inactive"}, {stateKey:"command:cooling", value:"active", initial:"inactive"}, {stateKey:"command:accelerate", value:"active", initial:"inactive"}, {stateKey:"command:laser-dual", value:"active", initial:"inactive"}, {stateKey:"command:laser-pierce", value:"active", initial:"inactive"}, {stateKey:"command:laser-instant", value:"active", initial:"inactive"}, {stateKey:"command:laser-wide", value:"active", initial:"inactive"}, {stateKey:"command:laser-range", value:"active", initial:"inactive"}]
        },
        color: "#aeb8c0",
        lineWidth: 3.5,
        maxChargeFlash: true
      }
    ],
    tooltipSkills: [
      {
        key: "ALWAYS",
        name: "과열",
        attack: "lmb",
        showCost: false,
        text: "이동을 제외한 행동 시 스테미나가 반대로 차오르며 과열 게이지로 동작. 스테미나 자동 회복 제거"
      },
      {
        key: "LMB",
        name: "말살 레이저",
        attack: "laser",
        costText: "스테미나 +{actionStaminaGain}",
        text: "활성화된 기능에 따른 레이저 발사 ({damage})"
      },
      {
        key: "RMB",
        name: "냉각",
        attack: "cooling",
        showCost: false,
        text: "{coolingDelaySeconds}초 기절 후 최대 스테미나의 {coolingReducePercent}%만큼 스테미나 감소 / 스테미나 0"
      },
      {key: "/", name: "기능 활성화", text: "명령어 입력창을 열고 ENTER로 실행. 입력 중에는 다른 조작 불가"},
      {key: "/", name: "/laser", text: "평타 활성화"},
      {key: "/", name: "/cooling", text: "스테미나 초당 {v:commandFeatures.coolingPerSecond} 자동 냉각 활성화"},
      {key: "/", name: "/accelerate", text: "이동속도 +{v:commandFeatures.accelerateSpeed|percent}% 활성화"},
      {key: "/", name: "/repair", text: "즉시 잃은 체력의 {repairMissingHealthPercent}% 회복"},
      {key: "/", name: "/dual", text: "레이저 {v:commandFeatures.laser.dualCount}갈래 평행 발사"},
      {key: "/", name: "/pierce", text: "레이저가 적을 관통"},
      {key: "/", name: "/instant", text: "레이저 탄속 제거"},
      {key: "/", name: "/wide", text: "레이저 폭 {v:commandFeatures.laser.wideMultiplier}배"},
      {key: "/", name: "/range", text: "레이저 사거리 +{v:commandFeatures.laser.rangeBonus}"},
      {
        key: "L-Shift",
        name: "급속 냉각",
        attack: "counter",
        showCost: false,
        text: "주변에 피해를 주며 스테미나가 있다면 {rapidCoolingDurationSeconds}초동안 스테미나가 바닥날 때까지 감소하고, 해당 시간동안 무적 및 기절. ({damage}) / 스테미나 0"
      }
    ],
    attacks: {
      laser: {
        id: "attack.gae.laser",
        damageRatio: 1,
        cost: 0,
        cd: 600,
        range: 400,
        attackFeatureTransform: {
          type: "modular-laser",
          statePrefix: "command:",
          features: {base: "laser", dual: "laser-dual", pierce: "laser-pierce", instant: "laser-instant", wide: "laser-wide", range: "laser-range"},
          configPath: "commandFeatures.laser",
          effectPath: "commandFeatures.laserEffect",
          wideMultiplier: characterValue("commandFeatures.laser.wideMultiplier"),
          rangeMultiplier: characterValue("commandFeatures.laser.rangeMultiplier"),
          rangeBonus: characterValue("commandFeatures.laser.rangeBonus")
        },
        presentation: {color: "#aeb8c0"},
        modules: [
          {
            type: "delivery.projectile",
            speed: characterValue("commandFeatures.laser.speed"),
            radius: characterValue("commandFeatures.laser.radius"),
            hitRadius: characterValue("commandFeatures.laser.hitRadius")
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "laser-bolt",
              baseRadius: characterValue("attacks.laser.modules.0.radius"),
              outerColor: "122,134,144",
              midColor: "190,202,210",
              coreColor: "225,233,238",
              centerColor: "255,255,255"
            }
          }
        ],
        tags: ["평타"]
      },
      cooling: {id: "attack.gae.cooling", damageRatio: 0, cost: 0, cd: 700, range: 190, modules: [], tags: ["스킬", "선딜레이"]},
      counter: {
        id: "attack.gae.counter",
        damageRatio: 1,
        cost: 0,
        cd: 520,
        range: 180,
        presentation: {color: "#aeb8c0"},
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: characterValue("attacks.counter.range"),
            r: characterValue("attacks.counter.range"),
            color: "174,184,192",
            fillAlpha: 0.09,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            durationFrames: 14
          }
        ],
        tags: ["반격", "행동충전제외"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.gae.lmb",
        input: "lmb",
        attackId: "attack.gae.laser",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "resource.stamina-capacity-at-least", value: characterValue("staminaGainPerAction")},
            {type: "state.mode-is", stateKey: "command:laser", value: "active", initial: "inactive"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      rmb: {
        id: "ability.gae.rmb",
        input: "rmb",
        attackId: "attack.gae.cooling",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "resource.stamina-above-zero"}
          ],
          modules: [{type: "resource.cooling-burst", delay: 500, reduceMaxStaminaRatio: 0.4}]
        }
      },
      counter: {
        id: "ability.gae.counter",
        input: "counter",
        attackId: "attack.gae.counter",
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
              },
              onFinishModules: [{type: "resource.rapid-cooling", duration: 2000, stateKey: "command:rapid-cooling"}]
            }
          ]
        }
      }
    },
    commandFeatures: {
      accelerateSpeed: 0.35,
      coolingPerSecond: 200,
      overclock: {gainPerSecond: 600, attackRate: 0.5},
      protectionRefreshMs: 250,
      protectionOpacity: 0.45,
      rapidCoolingDuration: characterValue("abilities.counter.trigger.modules.0.onFinishModules.0.duration"),
      coolingDelay: characterValue("abilities.rmb.trigger.modules.0.delay"),
      coolingRatio: characterValue("abilities.rmb.trigger.modules.0.reduceMaxStaminaRatio"),
      laser: {
        speed: 30,
        radius: 8,
        hitRadius: 10,
        instantHalfWidth: characterValue("commandFeatures.laser.radius"),
        dualCount: 2,
        dualOffset: 14,
        rangeMultiplier: 1.35,
        rangeBonus: 150,
        wideMultiplier: 1.75
      },
      laserEffect: {
        color: "190,202,210",
        coreColor: "255,255,255",
        fillAlpha: 0.34,
        strokeAlpha: 0.9,
        coreAlpha: 0.82,
        coreWidthRatio: 0.16,
        lineWidth: 3,
        glowBlur: 9,
        durationFrames: 6
      },
      coolingEffect: {
        type: "areaCircle",
        range: 72,
        r: characterValue("commandFeatures.coolingEffect.range"),
        color: "174,184,192",
        fillAlpha: 0.025,
        strokeAlpha: 0.72,
        lineWidth: 2,
        duration: 220,
        followSource: true,
        renderLayer: "below-entities"
      },
      overclockColor: {pulseSpeed: 0.008, red: 255, greenBase: 150, greenAmplitude: 45, blueBase: 125, blueAmplitude: -25},
      input: {maxLength: 80, resultHoldMs: 2000, resultFadeMs: 450}
    },
    attackPresentationTransform: {
      type: "pulse-tint",
      activePath: "_commandOverclock.active",
      colorConfigPath: "commandFeatures.overclockColor",
      effectCoreColor: "255,225,190",
      projectileColors: {
        midColor: "255,190,145",
        coreColor: "255,224,190",
        centerColor: "255,248,235",
        trailStart: "255,190,145",
        trailEnd: "255,135,110"
      }
    }
  }
