{
    id: "van",
    name: "반",
    englishName: "Van",
    title: "만능 정비공",
    color: "#9fcf55",
    classification: {style: 3, range: 2, role: 3},
    stats: {maxHealth: 800, speed: 4.25, radius: 20, baseDamage: 100, difficulty: 2},
    wrenchDurability: {
      stateKey: "van-wrench-durability",
      repairProgressStateKey: "van-wrench-repair-progress",
      max: 800,
      segmentSize: 100,
      repairDelay: 500,
      repairDuration: 4500,
      intactRegenPerSecond: 25
    },
    damageResourceLayers: [
      {
      type: "progress",
      stateKey: "van-wrench-durability",
      max: characterValue("wrenchDurability.max"),
      priority: 100,
      blockHitEffectsWhenFullyAbsorbed: true,
      depletedEffect: {
        type: "areaCircle",
        radiusMultiplier: 3.2,
        minRadius: 64,
        strokeColor: "205,235,170",
        fillAlpha: 0.09,
        strokeAlpha: 0.95,
        lineWidth: 4,
        pulse: true,
        pulseStrokeMin: 0.68,
        pulseStrokeMax: 1,
        pulseSpeed: 0.024,
        fadeOut: true,
        duration: 320
      }
      }
    ],
    combatIdleProgressRepair: {
      intactRegenPerSecond: characterValue("wrenchDurability.intactRegenPerSecond"),
      stateKey: "van-wrench-durability",
      progressStateKey: "van-wrench-repair-progress",
      delay: characterValue("wrenchDurability.repairDelay"),
      duration: characterValue("wrenchDurability.repairDuration"),
      restoreToMax: true,
      onlyWhenDepleted: true,
      repairedEffect: {
        type: "areaCircle",
        radiusMultiplier: 2.9,
        minRadius: 58,
        strokeColor: "225,247,205",
        fillAlpha: 0.075,
        strokeAlpha: 0.92,
        lineWidth: 3.5,
        pulse: true,
        pulseStrokeMin: 0.62,
        pulseStrokeMax: 1,
        pulseSpeed: 0.02,
        fadeOut: true,
        duration: 360
      }
    },
    desc: "거대한 스패너로 피해를 받아내며 지속적으로 전투하는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.arc",
        valueRef: {
          type: "progress",
          stateKey: "van-wrench-repair-progress",
          mode: "ratio",
          max: characterValue("wrenchDurability.repairDuration")
        },
        color: characterValue("color"),
        lineWidth: 3,
        maxChargeFlash: true,
        visibility: "all",
        conditions: [
          {type: "state.progress-gte", stateKey: "van-wrench-repair-progress", value: 0.001}
        ]
      }
    ],
    tooltipSkills: [
      {
        key: "ALWAYS",
        name: "거대한 스패너",
        attack: "lmb",
        showCost: false,
        text: "거대한 스패너로 공격을 방어. 내구도 {v:wrenchDurability.max}, 내구도는 천천히 회복. 전부 소모 시 파괴. 파괴된 뒤 이동을 제외한 다른 행동을 하지 않을 시 {v:wrenchDurability.repairDelay|seconds}초 뒤 거대한 스패너 수리 시작"
      },
      {key: "LMB", name: "스패너 던지기", attack: "lmbThrown", text: "스패너 내구도가 없을 때 수리용 스패너를 던져 피해 ({damage})"},
      {key: "LMB/SPANNER", name: "스패너 휘두르기", attack: "lmb", text: "거대한 스패너를 휘둘러 맞은 적에게 피해 ({damage})"},
      {key: "RMB/SPANNER", name: "거대한 스패너 투척", attack: "rmb", text: "거대한 스패너를 던져 피해 및 {v:attacks.rmb.stunDuration|seconds}초 기절 ({damage})"},
      {key: "L-Shift", name: "스패너 내려치기", attack: "counter", text: "스패너로 전방을 내려쳐 피해 및 {v:attacks.counter.stunDuration|seconds}초 기절 ({damage})"}
    ],
    passives: [
      {
        type: "state.progress-rate",
        stateKey: "van-wrench-durability",
        initial: characterValue("wrenchDurability.max"),
        max: characterValue("wrenchDurability.max"),
        ratePerSecond: 0
      }
    ],
    attacks: {
      lmb: {
        id: "attack.van.lmb",
        damageRatio: 1.5,
        cost: 200,
        cd: 450,
        range: 220,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.12,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            color: characterValue("color"),
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
      lmbThrown: {
        id: "attack.van.lmb-thrown",
        damageRatio: 1,
        cost: 150,
        cd: 450,
        range: 520,
        projectileRadius: 15,
        projectileSpeed: 25,
        modules: [
          {
            type: "delivery.projectile",
            radius: characterValue("attacks.lmbThrown.projectileRadius"),
            hitRadius: characterValue("attacks.lmbThrown.projectileRadius"),
            speed: characterValue("attacks.lmbThrown.projectileSpeed")
          },
          {type: "projectile.pierce", targets: false, walls: false}
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.van.rmb",
        damageRatio: 2,
        cost: 400,
        cd: 1100,
        range: 650,
        projectileRadius: 78,
        visualRadius: 92,
        projectileSpeed: 14,
        stunDuration: 800,
        modules: [
          {
            type: "delivery.projectile",
            radius: characterValue("attacks.rmb.projectileRadius"),
            hitRadius: characterValue("attacks.rmb.projectileRadius"),
            speed: characterValue("attacks.rmb.projectileSpeed"),
            wallCollisionMode: "center"
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.rmb.visualRadius"),
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 46,
              showLink: false
            }
          },
          {
            type: "status.apply",
            status: "stun",
            duration: characterValue("attacks.rmb.stunDuration")
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.van.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 300,
        range: 260,
        halfWidth: 55,
        stunDuration: 800,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.counter.range"),
            halfWidth: characterValue("attacks.counter.halfWidth"),
            wallPolicy: "block"
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.van.lmb",
        input: "lmb",
        attackId: "attack.van.lmb-thrown",
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
                  attackId: "attack.van.lmb",
                  conditions: [
                    {
                      type: "state.progress-gte",
                      stateKey: "van-wrench-durability",
                      value: 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      rmb: {
        id: "ability.van.rmb",
        input: "rmb",
        attackId: "attack.van.rmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "state.progress-gte", stateKey: "van-wrench-durability", value: 1, initial: characterValue("wrenchDurability.max")}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.van.counter",
        input: "counter",
        attackId: "attack.van.counter",
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
                type: "status.apply",
                status: "stun",
                duration: characterValue("attacks.counter.stunDuration")
              }
            }
          ]
        }
      }
    }
  }
