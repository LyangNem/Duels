{
    id: "veleu",
    name: "베르",
    title: "초콜릿 악마",
    color: "#ff2244",
    classification: {style: 1, range: 0, role: 1},
    stats: {maxHealth: 1100, speed: 4.5, radius: 20, baseDamage: 100, difficulty: 1},
    desc: "강력한 로켓포로 게임을 끝장내는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.arc",
        valueRef: {
          type: "projectile-progress-ratio",
          stateKey: "veleu-rmb-projectile",
          attackId: "attack.veleu.rmb",
          completeAt: 0.2
        },
        color: "#ff2244",
        lineWidth: 3.5,
        maxChargeFlash: true
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "초콜릿 쌍권총", attack: "lmb", text: "쌍권총 {burstCount}발 순차 발사 (탄당 {damage})"},
      {
        key: "RMB",
        name: "초콜릿 로켓포",
        attack: "rmbImpact",
        costAttack: "rmb",
        text: "초콜릿 로켓 발사. 폭발 시 피해 및 감속 지대 생성 ({damage})"
      },
      {
        key: "RMB/RMB",
        name: "로켓 가속",
        attack: "rmbBoostedImpact",
        costAttack: "rmbBoost",
        baseAttack: "rmbImpact",
        text: "로켓이 일정 거리 이상 비행 시 가속 가능. 폭발 피해 {damageIncreasePercent}% 증가 및 중앙 {stunSeconds}초 기절 ({damage})"
      },
      {key: "L-Shift", name: "초콜릿 폭탄 투척", attack: "counter", text: "전방에 초콜릿 폭탄 {bombCount}개 순차 폭발 (타당 {damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.veleu.lmb",
        damageRatio: 1,
        cost: 150,
        cd: 500,
        range: 850,
        modules: [
          {type: "delivery.projectile", speed: 22, radius: 7},
          {
            type: "delivery.delayed-projectile-volley",
            count: 3,
            delay: 0,
            interval: 80,
            aimMode: "live-source",
            perpendicularOffset: 10,
            alternatePerpendicular: true,
            phaseKey: "dual-pistol"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.veleu.rmb",
        damageRatio: 0,
        cost: 500,
        cd: 500,
        range: 600,
        modules: [
          {
            type: "delivery.projectile",
            speed: 14,
            radius: 18,
            damageOnTravel: false,
            collisionTargets: true,
            stateKey: "veleu-rmb-projectile"
          },
          {
            type: "projectile.impact",
            attackIds: ["attack.veleu.rmb-impact"],
            field: {
              type: "field.area",
              stateKey: "slow-zone",
              anchorMode: "point",
              shape: "circle",
              range: 150,
              rangeRef: {type: "impact-attack-range", attackId: "attack.veleu.rmb-impact"},
              wallPolicy: "block",
              duration: 5000,
              targetRelations: ["enemy"],
              interval: 50,
              intervalMode: "per-target",
              triggerOnEnter: true,
              onTrigger: [
                {
                  type: "status.apply",
                  status: "slow",
                  duration: 120,
                  removeOnExit: true,
                  data: {factor: 0.45, stackMode: "replace-source"}
                }
              ],
              presentation: {type: "slowZoneAppear", r: characterValue("attacks.rmb.modules.1.field.range")}
            }
          },
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "rocket",
              fillColor: "#ff2244",
              strokeColor: "#ff2244",
              strokeWidth: 2.5,
              trailLength: 25,
              trailWidth: 6,
              trailStart: "#ff2244",
              trailEnd: "#ff2244"
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbBoost: {
        id: "attack.veleu.rmb-boost",
        damageRatio: 0,
        cost: 500,
        cd: 0,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "projectile.replace-attack",
            stateKey: "veleu-rmb-projectile",
            attackId: "attack.veleu.rmb-boosted-flight"
          },
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            position: "source",
            range: 72,
            r: 72,
            color: "#ff2244",
            fillAlpha: 0.04,
            strokeAlpha: 0.78,
            lineWidth: 2,
            duration: 150
          }
        ],
        tags: ["스킬"]
      },
      rmbBoostedFlight: {
        id: "attack.veleu.rmb-boosted-flight",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 600,
        modules: [
          {
            type: "delivery.projectile",
            speed: 22,
            radius: 18,
            damageOnTravel: false,
            collisionTargets: true,
            stateKey: "veleu-rmb-projectile"
          },
          {
            type: "projectile.impact",
            attackIds: ["attack.veleu.rmb-boosted-impact"],
            fieldOrder: "before-attacks",
            field: {
              type: "field.area",
              stateKey: "slow-zone",
              anchorMode: "point",
              shape: "circle",
              range: 150,
              rangeRef: {type: "impact-attack-range", attackId: "attack.veleu.rmb-boosted-impact"},
              wallPolicy: "block",
              duration: 5000,
              targetRelations: ["enemy"],
              interval: 50,
              intervalMode: "per-target",
              triggerOnEnter: true,
              triggerImmediately: true,
              onTrigger: [
                {
                  type: "status.apply",
                  status: "slow",
                  duration: 120,
                  removeOnExit: true,
                  data: {factor: 0.45, stackMode: "replace-source"}
                }
              ],
              presentation: {type: "slowZoneAppear", r: characterValue("attacks.rmbBoostedFlight.modules.1.field.range")}
            }
          },
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "rocket",
              fillColor: "255,140,0",
              strokeColor: "255,220,0",
              strokeWidth: 2.5,
              trailLength: 25,
              trailWidth: 6,
              trailStart: "255,180,0",
              trailEnd: "255,80,0"
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbImpact: {
        id: "attack.veleu.rmb-impact",
        damageRatio: 4,
        cost: 0,
        cd: 0,
        range: 150,
        presentation: {color: "#ff2244", duration: 220},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.rmbImpact.range"),
            wallPolicy: "block",
            renderType: "areaCircle"
          }
        ],
        tags: ["스킬"]
      },
      rmbBoostedImpact: {
        id: "attack.veleu.rmb-boosted-impact",
        damageRatio: 6,
        cost: 0,
        cd: 0,
        range: 150,
        presentation: {color: "#ff2244", duration: 220},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.rmbBoostedImpact.range"),
            wallPolicy: "block",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "stun",
            duration: 1250,
            delay: 120,
            maxImpactRange: 54,
            impactWallPolicy: "block",
            oncePerExecution: true,
            tags: ["범위 공격", "히트스캔", "공격형태 원"]
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "attack-center",
            geometryFrom: {moduleType: "status.apply", status: "stun", property: "maxImpactRange"},
            color: "#ffdc00",
            fillAlpha: 0.035,
            strokeAlpha: 0.95,
            lineWidth: 2.5,
            duration: 180
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.veleu.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 300,
        range: 575,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: 100,
            wallPolicy: "block",
            repeatCount: 4,
            repeatPathWallPolicy: "block",
            repeatInterval: 60,
            repeatCenterDistanceStart: 100,
            repeatCenterDistanceStep: 100,
            renderType: "areaCircle"
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-impact",
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
        id: "ability.veleu.lmb",
        input: "lmb",
        attackId: "attack.veleu.lmb",
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
        id: "ability.veleu.rmb",
        input: "rmb",
        attackId: "attack.veleu.rmb",
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
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.veleu.rmb-boost",
                  conditions: [
                    {type: "state.exists", stateKey: "veleu-rmb-projectile"},
                    {type: "projectile.attack-id-is", stateKey: "veleu-rmb-projectile", attackId: "attack.veleu.rmb"},
                    {type: "projectile.progress-ratio-gte", stateKey: "veleu-rmb-projectile", value: 0.2}
                  ]
                }
              ],
              fallbackConditions: [{type: "state.absent", stateKey: "veleu-rmb-projectile"}]
            }
          ]
        }
      },
      counter: {
        id: "ability.veleu.counter",
        input: "counter",
        attackId: "attack.veleu.counter",
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
    },
    statusDefaults: {slow: {factor: 0.5}}
  }
