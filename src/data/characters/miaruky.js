{
    id: "miaruky",
    name: "미아루키",
    title: "공방 속 소녀",
    color: "#ff1493",
    classification: {style: 3, range: 0, role: 4},
    stats: {maxHealth: 1300, speed: 3.75, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "공구함으로 회복지대를 생성하며 장기전을 이끄는 캐릭터",
    worldGaugeModules: [{type:"range.circle",range:characterValue("attacks.lmbMelee.range"),visibility:"owner",color:characterValue("color"),alpha:0.42,lineWidth:1.5,dash:[5,5]}],
    worldEffectModules: [
  {
    "type": "effect.spawn",
    "renderType": "weaponImage",
    "style": "toolbox",
    "scale": 1.65,
    "conditions": [
      {
        "type": "state.mode-is",
        "stateKey": "miaruky-weapon-image",
        "initial": "toolbox",
        "expiresAfterMs": 800,
        "expiredValue": "toolbox",
        "ageStateKey": "miaruky-image-life",
        "value": "toolbox"
      },
      {
        "type": "summon.inactive",
        "stateKey": "toolbox"
      }
    ],
    "rotationStateKey": "miaruky-toolbox-motion",
    "rotationMs": 350,
    "rotationRadians": -6.283185307179586
  },
  {
    "type": "effect.spawn",
    "renderType": "weaponImage",
    "style": "toolbox-wrench",
    "scale": 1.65,
    "conditions": [
      {
        "type": "state.mode-is",
        "stateKey": "miaruky-weapon-image",
        "initial": "toolbox",
        "expiresAfterMs": 800,
        "expiredValue": "toolbox",
        "ageStateKey": "miaruky-image-life",
        "value": "wrench"
      },
      {
        "type": "summon.inactive",
        "stateKey": "toolbox"
      }
    ],
    "angle": -0.6,
    "rotationStateKey": "miaruky-image-life",
    "rotationMs": 350,
    "rotationRadians": -6.283185307179586
  }
],
    tooltipSkills: [
      {key: "LMB RANGED", name: "공구 투척", attack: "lmbRanged", text: "원거리 시 공구를 꺼내 투척 ({damage})"},
      {key: "LMB MELEE", name: "공구함 휘두르기", attack: "lmbMelee", text: "근접 시 공구함 휘두르기 ({damage})"},
      {
        key: "RMB",
        name: "회복지대",
        attack: "rmb",
        text: "공구함을 내려놓아 아군 체력 {v:attacks.toolboxDeployKnockback.modules.2.amount} 회복. 재사용 또는 평타 사용 시 회수"
      },
      {key: "L-Shift", name: "회복 반격", attack: "counter", text: "범위 내 아군 체력 {healAmount} 회복 및 적에게 피해 ({damage})"}
    ],
    summonSpecs: [
      {
        stateKey: "toolbox",
        stats: [
          {key: "HEALTH", text: "{maxHealth}"},
          {key: "MOVE SPEED", text: "{moveLabel}"},
          {key: "ABILITY", text: "주변 아군에게 {regenerationLabel} 부여"},
          {key: "DEATH", text: "사망 시 {respawnSeconds}초간 재사용 불가"}
        ]
      }
    ],
    summons: {
      toolbox: {
        id: "summon.miaruky.toolbox",
        name: "공구함",
        maxHealth: 400,
        radius: 16,
        speed: 0,
        respawnDelay: 7000,
        respawnHealth: 400,
        storedNaturalRegen: true,
        tags: ["소환수", "고정형"],
        fieldArea: {
          stateKey: "toolbox-heal-zone",
          shape: "circle",
          range: 176,
          duration: Infinity,
          follow: "summon",
          targetRelations: ["self", "ally"],
          excludeAnchor: true,
          interval: 250,
          intervalMode: "per-target",
          triggerOnEnter: true,
          removeOnTrigger: false,
          onTrigger: [
            {
              type: "modifier.set",
              stat: "regeneration",
              value: 40,
              duration: Infinity,
              removeOnExit: true,
              data: {tickInterval: 250, presentationSource: "zone"}
            }
          ]
        },
        presentation: {profile: "classicMinion", color: "#ff1493"}
      }
    },
    attacks: {
      lmbMelee: {
        id: "attack.miaruky.lmb.melee",
        damageRatio: 1.5,
        cost: 150,
        cd: 450,
        attackDelayGroup: "miaruky-primary",
        attackDelay: 450,
        range: characterValue("summons.toolbox.fieldArea.range"),
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmbMelee.range"),
            halfAngle: 1.309,
            contactType: "melee"
          },
{"type": "mode.toggle", "when": "on-delivery", "stateKey": "miaruky-toolbox-motion", "values": ["a", "b"], "step": 1}
],
        tags: ["평타"]
      },
      lmbRanged: {
        id: "attack.miaruky.lmb.ranged",
        damageRatio: 1,
        cost: 150,
        cd: 450,
        attackDelayGroup: "miaruky-primary",
        attackDelay: 450,
        range: 700,
        modules: [{type: "delivery.projectile", speed: 18, radius: 15},
{"type": "mode.set", "when": "on-delivery", "stateKey": "miaruky-weapon-image", "value": "wrench"},
{"type":"mode.toggle","when":"on-delivery","stateKey":"miaruky-image-life","values":["a","b"],"step":1}
],
        tags: ["평타"]
      },
      rmb: {id: "attack.miaruky.rmb", damageRatio: 0, cost: 250, cd: 300, range: 300, modules: [], tags: ["스킬"]},
      toolboxDeployKnockback: {
        id: "attack.miaruky.toolbox-deploy-knockback",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: characterValue("summons.toolbox.fieldArea.range"),
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.toolboxDeployKnockback.range"),
            targetRelations: ["enemy"]
          },
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.toolboxDeployKnockback.range"),
            targetRelations: ["self", "ally"],
            applyHitEffects: true
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "health",
            recipient: "target",
            targetRelations: ["self", "ally"],
            amount: 200
          },

        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.miaruky.counter",
        damageRatio: 2,
        cost: 0,
        cd: 300,
        range: 300,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            targetRelations: ["enemy"]
          },
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            targetRelations: ["self", "ally"],
            applyHitEffects: true,
            predictiveConsumeOnContact: true
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "health",
            recipient: "target",
            targetRelations: ["self", "ally"],
            amountRef: {type: "summon-field-modifier", stateKey: "toolbox", stat: "regeneration", multiplier: 5}
          },
{"type": "effect.spawn", "when": "after-attack", "renderType": "weaponImageEcho", "position": "source", "target": "source", "duration": 650, "expansion": 0.55, "imageAlpha": 1, "oncePerExecution": true, "imageConfig": {"renderType": "weaponImage", "style": "toolbox", "scale": 1.65}}
],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.miaruky.lmb",
        input: "lmb",
        attackId: "attack.miaruky.lmb.ranged",
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
                  attackId: "attack.miaruky.lmb.melee",
                  conditions: [
                    {
                      type: "attack.proximity-near",
                      nearAttackId: "attack.miaruky.lmb.melee",
                      farAttackId: "attack.miaruky.lmb.ranged"
                    }
                  ]
                }
              ]
            },
            {type: "summon.recall", stateKey: "toolbox", whenHandled: true}
          ]
        }
      },
      rmb: {
        id: "ability.miaruky.rmb",
        input: "rmb",
        attackId: "attack.miaruky.rmb",
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
              type: "summon.toggle",
              stateKey: "toolbox",
              placementTarget: "aim-point",
              maxPlaceDistance: 300,
              deployAttackId: "attack.miaruky.toolbox-deploy-knockback",
              recallCooldown: 200
            }
          ]
        }
      },
      counter: {
        id: "ability.miaruky.counter",
        input: "counter",
        attackId: "attack.miaruky.counter",
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
                targetRelations: ["enemy"],
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
