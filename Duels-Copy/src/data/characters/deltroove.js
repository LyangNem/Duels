{
    id: "deltroove",
    name: "델트루브",
    englishName: "Deltroove",
    title: "광차 운반원",
    color: "#b5652b",
    classification: {style: 9, range: 0, role: 5},
    stats: {maxHealth: 1500, speed: 4.25, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "광차를 출발시켜 적을 강제로 밀어버리는 캐릭터",
    dynamicWallPresentation: {linkToOwner: true, showOrder: true},
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        valueMode: "count",
        valueRef: {type: "dynamic-wall-count"},
        segments: [{value: 1, color: "#b5652b"}, {value: 2, color: "#b5652b"}],
        visibility: "owner",
        height: 4,
        gap: 2
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "차막이", attack: "lmb", text: "차막이를 휘둘러 전방에 피해 ({damage})"},
      {
        key: "LMB HOLD",
        name: "차막이 설치",
        attack: "lmb",
        costText: "스테미나 {fullCost}",
        text: "최대 차징 시 지정 지점에 이동을 막는 {v:attacks.lmb.charge.fullSpec.modules.0.shortCells}×{v:attacks.lmb.charge.fullSpec.modules.0.longCells} 차막이를 설치. 최대 {v:attacks.lmb.charge.fullSpec.modules.0.maxInstances}개"
      },
      {key: "RMB", name: "광차", attack: "rmb", text: "벽과 적을 관통하는 광차로 적을 벽까지 밀어냄. 벽 충돌 시 기절 ({damage})"},
      {key: "L-Shift", name: "집어던지기", attack: "counter", text: "차막이를 집어던져 적을 장거리 넉백. 벽 충돌 시 기절 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.deltroove.lmb",
        damageRatio: 1,
        cost: 100,
        cd: 360,
        range: 170,
        charge: {
          duration: 350,
          gauge: true,
          costMin: 100,
          costMax: 100,
          fullCost: 400,
          costTiming: "release",
          staminaRegenDuringCharge: true,
          fullSpec: {
            damageRatio: 0,
            cd: 0,
            range: 650,
            effectsOnly: true,
            modules: [
              {
                type: "obstacle.wall-deploy",
                when: "after-attack",
                longCells: 5,
                shortCells: 1,
                maxInstances: 2,
                maxRange: characterValue("attacks.lmb.charge.fullSpec.range"),
                color: "#b5652b"
              }
            ]
          }
        },
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.15,
            wallPolicy: "block"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.deltroove.rmb",
        damageRatio: 2,
        cost: 400,
        cd: 1200,
        range: 500,
        modules: [
          {type: "delivery.range-projectile", radius: 72, speed: 20},
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "range-projectile",
            style: {
              fillAlpha: 0.2,
              strokeColor: "#b5652b",
              strokeAlpha: 0.92,
              strokeWidth: 3,
              innerColor: "#b5652b",
              innerScale: 0.55,
              innerAlpha: 0.48,
              innerStrokeWidth: 2
            }
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "attack",
            distanceMode: "attack-range-end",
            distance: 500,
            speed: 18,
            oncePerExecution: false,
            wallImpactStatus: {status: "stun", duration: 800}
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.deltroove.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 650,
        range: 720,
        previewGeometry: {shape: "rect", range: characterValue("attacks.counter.range"), halfWidth: 80, wallPolicy: "ignore"},
        presentation: {color: "#b5652b"},
        modules: [
          {type: "pattern.scatter", count: 5, spread: 0},
          {
            type: "delivery.projectile",
            radius: 20,
            hitRadius: characterValue("attacks.counter.modules.1.radius"),
            speed: 22
          },
          {
            type: "delivery.delayed-projectile-volley",
            count: 1,
            interval: 0,
            aimMode: "locked",
            perVolleyPellets: true,
            perpendicularOffset: 60
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {type: "hit.once-per-execution"}
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.deltroove.lmb",
        input: "lmb",
        attackId: "attack.deltroove.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "state.absent", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.start", stateKey: "charge:primary"}]
        },
        releaseTrigger: {
          type: "trigger",
          event: "input.release",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "state.exists", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.release", stateKey: "charge:primary"}]
        }
      },
      rmb: {
        id: "ability.deltroove.rmb",
        input: "rmb",
        attackId: "attack.deltroove.rmb",
        inputPolicy: {repeatWhileHeld: false},
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
        id: "ability.deltroove.counter",
        input: "counter",
        attackId: "attack.deltroove.counter",
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
                direction: "attack",
                distance: 420,
                speed: 14,
                oncePerExecution: true,
                wallImpactStatus: {status: "stun", duration: 1000}
              }
            }
          ]
        }
      }
    }
  }
