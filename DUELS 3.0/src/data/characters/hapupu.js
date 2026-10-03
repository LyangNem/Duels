{
    id: "hapupu",
    name: "하푸푸",
    englishName: "Hapupu",
    title: "영원한 친구",
    color: "#ffe6f7",
    classification: {style: 9, range: 0, role: 6},
    stats: {maxHealth: 1100, speed: 4.5, radius: 20, baseDamage: 100, difficulty: 4},
    desc: "누군가의 상상 속 친구 캐릭터",
    tooltipSkills: [
      {
        key: "LMB",
        name: "네가 술래!",
        attack: "lmb",
        text: "적을 밀치며 피해 및 넉백, 술래 표식 {v:attacks.lmb.modules.2.amount}중첩. 최대 {markMaxStacks}중첩. 적과 일정 거리 이상 멀어질 시 표식 폭발 ({damage}/{markMinBurstDamage}~{markMaxBurstDamage})"
      },
      {
        key: "RMB",
        name: "나 잡아봐라!",
        attack: "rmb",
        costText: "초당 스테미나 {sustainDrainPerSecond}",
        text: "이동속도 {sustainSpeedPercent}% 증가 및 벽 통과. 사용 도중 스테미나를 소모하며 재사용 시 해제"
      },
      {key: "L-Shift", name: "잡은 줄 알았지?!", attack: "counter", text: "적을 강하게 밀쳐내며 피해. 적중한 적의 술래 표식 폭발 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.hapupu.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 500,
        range: 90,
        presentation: {color: "#ffe6f7"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.lmb.range"),
            centerMode: "live-aim-point",
            centerMaxRange: 150,
            centerPointResolve: "none",
            previewAtCenter: true,
            contactType: "melee",
            wallPolicy: "ignore",
            targetRelations: ["enemy"],
            applyHitEffects: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 35,
            speed: 10,
            oncePerExecution: false
          },
          {
            type: "stack.mark",
            when: "on-hit",
            stateKey: "hapupu-tag",
            operation: "add",
            amount: 1,
            max: 5,
            duration: 0,
            breakDistance: 450,
            burstOnExpire: false,
            burstAttackId: "attack.hapupu.tag-burst",
            oncePerExecution: false,
            burstDamage: {mode: "progressive-total", first: 200, step: 50},
            presentation: {
              gauge: {
                type: "segmented-gauge",
                height: 4,
                gap: 2,
                valueMode: "count",
                activeAlpha: 0.96,
                background: "rgba(20,12,18,.9)",
                stroke: "rgba(255,230,247,.4)",
                segments: [
                  {value: 1, color: "#ffe6f7"},
                  {value: 2, color: "#ffe6f7"},
                  {value: 3, color: "#ffe6f7"},
                  {value: 4, color: "#ffe6f7"},
                  {value: 5, color: "#ffe6f7"}
                ]
              },
              rangeRing: {color: "#ffe6f7", alpha: 0.48, lineWidth: 1.8, dash: [7, 7]}
            }
          }
        ],
        tags: ["평타"]
      },
      tagBurst: {
        id: "attack.hapupu.tag-burst",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 160,
        presentation: {color: "#ffe6f7"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.tagBurst.range"),
            centerMode: "live-aim-point",
            centerMaxRange: 99999,
            centerPointResolve: "none",
            centerPreferExecutionTargetPoint: true,
            wallPolicy: "block",
            targetRelations: ["enemy"],
            renderType: "areaCircle"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.hapupu.rmb",
        effectsOnly: true,
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        presentation: {color: "#ffe6f7"},
        modules: [],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.hapupu.counter",
        damageRatio: 2,
        cost: 0,
        cd: 500,
        range: 120,
        presentation: {color: "#ffe6f7"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            centerMode: "live-aim-point",
            centerMaxRange: 150,
            centerPointResolve: "none",
            previewAtCenter: true,
            contactType: "melee",
            wallPolicy: "ignore",
            targetRelations: ["enemy"],
            applyHitEffects: true
          },
          {
            type: "stack.mark",
            when: "on-hit",
            stateKey: "hapupu-tag",
            operation: "burst",
            amount: 0,
            max: characterValue("attacks.lmb.modules.2.max"),
            duration: 5000,
            breakDistance: 450,
            burstAttackId: "attack.hapupu.tag-burst",
            oncePerExecution: false,
            burstDamage: {mode: "progressive-total", first: 200, step: 50},
            presentation: {
              gauge: {
                type: "segmented-gauge",
                height: 4,
                gap: 2,
                valueMode: "count",
                activeAlpha: 0.96,
                background: "rgba(20,12,18,.9)",
                stroke: "rgba(255,230,247,.4)",
                segments: [
                  {value: 1, color: "#ffe6f7"},
                  {value: 2, color: "#ffe6f7"},
                  {value: 3, color: "#ffe6f7"},
                  {value: 4, color: "#ffe6f7"},
                  {value: 5, color: "#ffe6f7"}
                ]
              },
              rangeRing: {color: "#ffe6f7", alpha: 0.48, lineWidth: 1.8, dash: [7, 7]}
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.hapupu.lmb",
        input: "lmb",
        attackId: "attack.hapupu.lmb",
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
        id: "ability.hapupu.rmb",
        input: "rmb",
        attackId: "attack.hapupu.rmb",
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
              type: "sustain.toggle",
              stateKey: "hapupu-catch-me",
              maxDuration: 0,
              resource: "stamina",
              activationCost: 0,
              drainPerSecond: 400,
              cooldownAttackId: "attack.hapupu.rmb",
              cooldownOnStop: 500,
              buffs: [{type: "speed", value: 0.45, tags: ["이동속도 증가"]}, {type: "wallPass", value: 1, tags: ["벽 통과"]}]
            }
          ]
        }
      },
      counter: {
        id: "ability.hapupu.counter",
        input: "counter",
        attackId: "attack.hapupu.counter",
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
              targetPointMode: "aim-point",
              preview: {type: "preview.create", shape: "attack-shape"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "away-from-source",
                distance: 84,
                speed: 14,
                oncePerExecution: false
              }
            }
          ]
        }
      }
    }
  }
