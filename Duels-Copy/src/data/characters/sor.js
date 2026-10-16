{
    id: "sor",
    name: "소르",
    englishName: "Sor",
    title: "감전 사랑꾼",
    color: "#4d4d8f",
    classification: {style: 9, range: 0, role: 5},
    stats: {maxHealth: 1100, speed: 4, radius: 20, baseDamage: 200, difficulty: 3},
    desc: "감전을 이용해 상대의 행동을 제한하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "배터리", attack: "lmb", text: "전파를 발사해 피해 및 감전 {zapSeconds}초 ({damage})"},
      {key: "LMB DISCHARGE", name: "", attack: "lmb", text: "감전된 적에게 적중 시 일시적으로 방전"},
      {
        key: "RMB",
        name: "정전기장",
        attack: "rmb",
        detailAttack: "fieldTick",
        text: "배터리를 던져 정전기장 생성. 범위 내 적에게 지속 피해 및 감전 {detailZapSeconds}초 (타당 {detailDamage})"
      },
      {key: "L-Shift", name: "정전기 방출", attack: "counter", text: "전방에 피해 및 감전 {zapSeconds}초 ({damage})"},
      {key: "L-Shift DISCHARGE", name: "", attack: "counter", showCost: false, text: "감전된 적에게 적중 시 일시적으로 방전"}
    ],
    attacks: {
      lmb: {
        id: "attack.sor.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 400,
        range: 450,
        presentation: {color: "#4d4d8f"},
        modules: [
          {type: "pattern.scatter", count: 3, spread: 0},
          {type: "delivery.projectile", speed: 17, radius: 14},
          {
            type: "delivery.delayed-projectile-volley",
            count: 1,
            interval: 0,
            aimMode: "locked",
            perVolleyPellets: true,
            perpendicularOffset: 40
          },
          {type: "hit.once-per-execution"},
          {
            type: "status.apply",
            status: "zap",
            duration: 2000,
            data: {staminaRegenMultiplier: characterValue("statusDefaults.zap.staminaRegenMultiplier")}
          },
          {
            type: "status.apply",
            status: "discharge",
            duration: 750,
            conditions: [{type: "target.status-active-before-hit", status: "zap"}]
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.sor.rmb",
        damageRatio: 0,
        cost: 400,
        cd: 800,
        range: 800,
        presentation: {color: "#4d4d8f"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 14,
            radius: 10,
            damageOnTravel: false,
            collisionTargets: false,
            targetPoint: true
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.impact",
            attackIds: ["attack.sor.rmb-impact"],
            field: {
              type: "field.area",
              stateKey: "sor-static-field",
              anchorMode: "point",
              shape: "circle",
              range: 120,
              wallPolicy: "block",
              duration: 4000,
              targetRelations: ["enemy"],
              interval: 1000,
              intervalMode: "per-target",
              triggerOnEnter: false,
              attackId: "attack.sor.field-tick",
              damageOnTrigger: true,
              onTrigger: [
                {
                  type: "status.apply",
                  status: "zap",
                  duration: 2000,
                  data: {
                    stackMode: "refresh-type",
                    staminaRegenMultiplier: characterValue("statusDefaults.zap.staminaRegenMultiplier")
                  }
                }
              ],
              presentation: {
                type: "areaCircle",
                r: characterValue("attacks.rmb.modules.2.field.range"),
                color: "255,225,40",
                fillAlpha: 0.1,
                strokeAlpha: 0.8,
                lineWidth: 2.5,
                dash: [8, 5],
                pulse: true,
                pulseSpeed: 0.006,
                pulseStrokeMin: 0.6,
                pulseStrokeMax: 0.9,
                centerLabel: "ZAP",
                centerLabelColor: "255,225,40",
                centerLabelAlpha: 0.8,
                centerLabelFont: "bold 14px Pretendard",
                centerLabelOffsetY: 5
              }
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbImpact: {
        id: "attack.sor.rmb-impact",
        damageRatio: 0.5,
        cost: 0,
        cd: 0,
        range: 120,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.rmbImpact.range"),
            wallPolicy: "block"
          },
          {
            type: "status.apply",
            status: "zap",
            duration: 2000,
            data: {
              stackMode: "refresh-type",
              staminaRegenMultiplier: characterValue("statusDefaults.zap.staminaRegenMultiplier")
            }
          }
        ],
        tags: ["스킬"]
      },
      fieldTick: {
        id: "attack.sor.field-tick",
        damageRatio: 0.5,
        cost: 0,
        cd: 0,
        range: 120,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.fieldTick.range"),
            wallPolicy: "block",
            render: false
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.sor.counter",
        damageRatio: 0.75,
        cost: 0,
        cd: 300,
        range: 350,
        presentation: {color: "#6464ff"},
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.counter.range"),
            halfWidth: 45,
            wallPolicy: "block"
          },
          {
            type: "status.apply",
            status: "zap",
            duration: 2000,
            data: {staminaRegenMultiplier: characterValue("statusDefaults.zap.staminaRegenMultiplier")}
          },
          {
            type: "status.apply",
            status: "discharge",
            duration: 750,
            conditions: [{type: "target.status-active-before-hit", status: "zap"}]
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.sor.lmb",
        input: "lmb",
        attackId: "attack.sor.lmb",
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
        id: "ability.sor.rmb",
        input: "rmb",
        attackId: "attack.sor.rmb",
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
        id: "ability.sor.counter",
        input: "counter",
        attackId: "attack.sor.counter",
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
                distance: characterValue("attacks.counter.modules.3.distance"),
                speed: characterValue("attacks.counter.modules.3.speed"),
                oncePerExecution: true
              }
            }
          ]
        }
      }
    },
    statusDefaults: {zap: {staminaRegenMultiplier: 0.6}}
  }
