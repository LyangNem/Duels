{
    id: "kan",
    name: "칸",
    englishName: "Kan",
    title: "기생충 숙주",
    color: "#1a6b35",
    classification: {style: 7, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 4.5, radius: 20, baseDamage: 100, difficulty: 1},
    desc: "적을 붙잡아 일방적으로 공격한 뒤 강력한 충격파로 적을 처치하는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB",
        name: "악식",
        attack: "lmb",
        text: "팔의 기생 생물이 공격. 타격 시 악식 게이지가 차오르며 비례해 피해량 증가 ({minDamage}~{maxDamage})"
      },
      {key: "RMB MELEE", name: "붙들기", attack: "rmb", text: "근거리 적을 붙들어 끌어당긴 뒤 밀쳐내며 피해 및 기절 ({throwDamage})"},
      {key: "L-Shift", name: "역류", attack: "counter", text: "악식 게이지에 비례한 범위와 피해의 충격파 발산 ({minDamage}~{maxDamage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.kan.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 291.6666666667,
        range: 130,
        progressScale: {stateKey: "kan-feast", damageRatio: {from: characterValue("attacks.lmb.damageRatio"), to: 4.5}},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 0.75,
            wallPolicy: "block"
          },
          {
            type: "state.progress",
            stateKey: "kan-feast",
            when: "on-hit",
            operation: "add",
            amount: 1,
            max: 10,
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#1a6b35", lineWidth: 3, maxChargeFlash: true}
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.kan.rmb",
        damageRatio: 0,
        cost: 600,
        cd: 1200,
        range: 130,
        effectsOnly: true,
        modules: [
          {type: "delivery.area",
            contactType: "melee", shape: "circle", range: characterValue("attacks.rmb.range"), wallPolicy: "block"},
          {
            type: "hit.sequence",
            targetMode: "nearest",
            oncePerExecution: true,
            steps: [
              {
                delay: 0,
                modules: [
                  {
                    type: "movement.pull",
                    target: "hit-target",
                    distanceMode: "source-contact",
                    gap: 6,
                    duration: 280,
                    speed: 10
                  },
                  {
                    type: "status.apply",
                    target: "hit-target",
                    status: "stun",
                    duration: 1750,
                    sourceId: "attack.kan.rmb:target-stun"
                  }
                ]
              },
              {delay: 550, modules: [{type: "action.trigger-attack", attackId: "attack.kan.rmb-throw"}]}
            ]
          }
        ],
        tags: ["스킬"]
      },
      rmbThrow: {
        id: "attack.kan.rmb-throw",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 0,
        modules: [
          {type: "delivery.target", targetRelations: ["enemy"]},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 116,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.kan.counter",
        damageRatio: 2,
        cost: 0,
        cd: 300,
        range: 104,
        progressScale: {
          stateKey: "kan-feast",
          range: {from: characterValue("attacks.counter.range"), to: 364},
          damageRatio: {from: characterValue("attacks.counter.damageRatio"), to: 4},
          moduleValues: [
            {
              type: "delivery.area",
              property: "range",
              from: characterValue("attacks.counter.progressScale.range.from"),
              to: characterValue("attacks.counter.progressScale.range.to")
            }
          ]
        },
        modules: [{type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"}],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.kan.lmb",
        input: "lmb",
        attackId: "attack.kan.lmb",
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
        id: "ability.kan.rmb",
        input: "rmb",
        attackId: "attack.kan.rmb",
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
            {type: "action.attack"},
            {
              type: "status.apply",
              target: "self",
              status: "stun",
              duration: 500,
              requireExecuted: true,
              sourceId: "ability.kan.rmb:self-stun"
            }
          ]
        }
      },
      counter: {
        id: "ability.kan.counter",
        input: "counter",
        attackId: "attack.kan.counter",
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
