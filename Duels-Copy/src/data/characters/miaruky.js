{
    id: "miaruky",
    name: "미아루키",
    title: "공방 속 소녀",
    color: "#ff1493",
    classification: {style: 3, range: 0, role: 4},
    stats: {maxHealth: 1300, speed: 3.75, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "공구함으로 회복지대를 생성하며 장기전을 이끄는 캐릭터",
    tooltipSkills: [
      {key: "LMB RANGED", name: "공구 투척", attack: "lmbRanged", text: "원거리 시 공구를 꺼내 투척 ({damage})"},
      {key: "LMB MELEE", name: "공구함 휘두르기", attack: "lmbMelee", text: "근접 시 공구함 휘두르기 ({damage})"},
      {
        key: "RMB",
        name: "회복지대",
        attack: "rmb",
        text: "공구함을 내려놓아 범위 내 아군에게 {summonRegenSeconds}초마다 {summonRegenValue} 회복. 재사용 또는 평타 사용 시 회수"
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
        maxHealth: 800,
        radius: 16,
        speed: 0,
        respawnDelay: 7000,
        respawnHealth: 800,
        storedNaturalRegen: true,
        tags: ["소환수", "고정형"],
        fieldArea: {
          stateKey: "toolbox-heal-zone",
          shape: "circle",
          range: 220,
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
              value: 20,
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
        damageRatio: 2,
        cost: 200,
        cd: 450,
        attackDelayGroup: "miaruky-primary",
        attackDelay: 450,
        range: 130,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmbMelee.range"),
            halfAngle: 1.309,
            contactType: "melee"
          }
        ],
        tags: ["평타"]
      },
      lmbRanged: {
        id: "attack.miaruky.lmb.ranged",
        damageRatio: 1.5,
        cost: 200,
        cd: 450,
        attackDelayGroup: "miaruky-primary",
        attackDelay: 450,
        range: 700,
        modules: [{type: "delivery.projectile", speed: 18, radius: 15}],
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
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.miaruky.counter",
        damageRatio: 2.5,
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
            amountRef: {type: "summon-field-modifier", stateKey: "toolbox", stat: "regeneration", multiplier: 10}
          }
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
