{
    id: "nsonya",
    name: "엔소냐",
    title: "음악 애호가",
    color: "#ee00ff",
    classification: {style: 2, range: 0, role: 4},
    stats: {maxHealth: 1000, speed: 4.5, radius: 20, baseDamage: 100, difficulty: 4},
    desc: "석궁 연사와 스피드 버프로 전장을 누비는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "석궁 연사", attack: "lmb", text: "석궁 화살 연사 및 가까운 적 넉백 ({damage})"},
      {
        key: "RMB",
        name: "볼륨 업!",
        attack: "rmb",
        detailAttack: "rmbPulse",
        text: "속박과 선딜레이 후 주변에 {buffSeconds}초 버프. 엔소냐에게 버프가 지속되는 동안 주변 아군의 버프 지속시간 증가"
      },
      {
        inlineStages: [
          {key: "RMB I", text: "이동 속도 증가"},
          {key: "RMB II", text: "스테미나 회복 속도 증가"},
          {key: "RMB III", attack: "rmbPulse", text: "회피 거리 {dodgeDistancePercent}% 증가"}
        ]
      },
      {key: "L-Shift", name: "볼트 해제!", attack: "counter", text: "전방에 {burstCount}발 부채꼴 연사 (발당 {damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.nsonya.lmb",
        damageRatio: 1,
        cost: 80,
        cd: 120,
        range: 600,
        modules: [
          {type: "delivery.projectile", speed: 44, radius: 12, knockbackActiveColor: "#213b5a"},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "attack",
            distance: 20,
            speed: 10,
            maxProjectileTravelRatio: 0.25,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {id: "attack.nsonya.rmb", damageRatio: 0, cost: 500, cd: 800, range: 0, modules: [], tags: ["스킬", "선딜레이"]},
      rmbPulse: {
        id: "attack.nsonya.rmb-pulse",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 260,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.rmbPulse.range"),
            wallPolicy: "ignore",
            targetRelations: ["self", "ally"],
            applyHitEffects: true,
            visual: false
          },
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            position: "source",
            range: 72,
            r: 72,
            color: "238,0,255",
            fillAlpha: 0.02,
            strokeAlpha: 0.44,
            lineWidth: 1.5,
            duration: 220,
            renderLayer: "below-entities"
          },
          {
            type: "buff.time-add",
            group: "nsonya-volume",
            addDuration: 5000,
            maxDuration: 15000,
            segmentDuration: 5000,
            oncePerExecution: true,
            gauge: {color: "#ee00ff", height: 4, gap: 2, activeAlpha: 0.95, stroke: "rgba(238,0,255,0.38)"},
            aura: {
              range: 260,
              color: "238,0,255",
              fillAlpha: 0.035,
              strokeAlpha: 0.3,
              lineWidth: 2,
              timerRingRadiusRatio: 0.82,
              timerRingLineWidth: 1.5,
              hollowInnerRatio: 0.84,
              cardinalGuides: true,
              cardinalGuideInnerRatio: 0.855,
              cardinalGuideOuterRatio: 0.985,
              cardinalGuideAlpha: 0.48,
              timerFillAlpha: 0.09,
              timerStrokeAlpha: 0.48,
              cardinalGuideWidth: 1,
              strokeColorMode: "source-team",
              nonFriendlyAlphaScale: 0.45,
              renderLayer: "below-entities"
            },
            stages: [
              {stat: "speed", value: 0.35, thresholdMs: 0},
              {stat: "staminaRegen", value: 1, thresholdMs: 5000},
              {stat: "dodgeDistance", value: 0.3, thresholdMs: 10000}
            ]
          }
        ],
        tags: []
      },
      counter: {
        id: "attack.nsonya.counter",
        damageRatio: 1,
        cost: 0,
        cd: 600,
        range: 550,
        modules: [
          {type: "pattern.scatter", count: 8, spread: 0.8639379797371932},
          {type: "delivery.projectile", speed: 44, radius: 12},
          {
            type: "delivery.delayed-projectile-volley",
            count: 8,
            delay: 0,
            interval: 55,
            aimMode: "locked",
            phaseKey: "nsonya-counter"
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.nsonya.lmb",
        input: "lmb",
        attackId: "attack.nsonya.lmb",
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
        id: "ability.nsonya.rmb",
        input: "rmb",
        attackId: "attack.nsonya.rmb",
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
              status: "bind",
              duration: 200,
              requireExecuted: true,
              sourceId: "ability.nsonya.rmb:bind"
            },
            {type: "timing.delay", duration: 200},
            {type: "action.trigger-attack", attackId: "attack.nsonya.rmb-pulse", requireExecuted: true}
          ]
        }
      },
      counter: {
        id: "ability.nsonya.counter",
        input: "counter",
        attackId: "attack.nsonya.counter",
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
              preview: {type: "preview.create", shape: "attack-sector"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "attack-direction",
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
