{
    id: "cyien",
    name: "사이엔",
    englishName: "Cyien",
    title: "격이 다른 실력자",
    color: "#4f79aa",
    accentColor: "#a8d5ff",
    classification: {style: 5, range: 0, role: 6},
    stats: {maxHealth: 1300, speed: 4.25, radius: 20, baseDamage: 100, difficulty: 6},
    desc: "{v:descriptionValues.comboHits}번의 평타를 모두 적중시키며 채운 스킬로 한방에 적을 처형하는 캐릭터",
    tagPersistentActionStateKeys: ["cyien-gyeok"],
    killRewardProgress: {
      excludeTargetKinds: ["summon"],
      stateKey: "cyien-gyeok",
      operation: "set-max",
      max: 8,
      presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
    },
    conditionalTargetLinks: [
      {
        relation: "enemy",
        targetKinds: ["player", "dummy"],
        healthRatioBelow: 0.5,
        color: "168,213,255",
        alpha: 0.68,
        lineWidth: 1.5,
        dash: [5, 5],
        visibility: "owner"
      }
    ],
    tooltipSkills: [
      {key: "ALWAYS", name: "격의 차이", attack: "rmbCharged", showCost: false, text: "적 처치 또는 격 최대치 시 절격 활성화"},
      {
        key: "LMB",
        name: "양손 단검",
        attack: "lmb",
        linkedAttack: "lmbSecond",
        secondaryAttack: "lmbBack",
        text: "전방을 크게 한 번, 작게 한 번 벤 뒤, 뒤로 칼을 집어넣으며 후방 타격. 각각 격 {progressAmount}/{linkedProgressAmount}/{secondaryProgressAmount} 충전. ({damage}/{linkedDamage}/{secondaryDamage})"
      },
      {key: "RMB", name: "패리", attack: "rmb", text: "전방의 공격을 패리하여 격 {guardProgressAmount} 충전"},
      {
        key: "RMB CHARGED",
        name: "절격",
        attack: "rmbCharged",
        text: "전방으로 이동하며 이동 경로의 적 공격. 적중 시 격 {progressAmount} 충전. 체력 {targetHealthThresholdPercent}% 미만인 적에게 피해 +{targetHealthDamageIncreasePercent}% ({damage})"
      },
      {
        key: "L-Shift",
        name: "쌍도낙엽",
        attack: "counter",
        text: "빠르게 대시하며 경로상의 적에게 피해. 적중 시 격 {progressAmount} 충전 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.cyien.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 500,
        attackDelayGroup: "cyien-primary",
        attackDelay: 500,
        range: 180,
        presentation: {color: "#4f79aa", suppressAttackFeedback: true},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.05,
            wallPolicy: "block"
          },
          {
            type: "state.progress",
            stateKey: "cyien-gyeok",
            when: "on-hit",
            operation: "add",
            amount: 1,
            max: 8,
            presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            color: "79,121,170",
            fillAlpha: 0.18,
            strokeAlpha: 0.85,
            lineWidth: 2.2,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      lmbSecond: {
        id: "attack.cyien.lmb-second",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 120,
        presentation: {color: "#4f79aa", suppressAttackFeedback: true},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmbSecond.range"),
            halfAngle: 1.05,
            wallPolicy: "block"
          },
          {
            type: "state.progress",
            stateKey: "cyien-gyeok",
            when: "on-hit",
            operation: "add",
            amount: 1,
            max: characterValue("attacks.lmb.modules.1.max"),
            presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            range: characterValue("attacks.lmbSecond.range"),
            halfAngle: characterValue("attacks.lmbSecond.modules.0.halfAngle"),
            color: "79,121,170",
            fillAlpha: 0.18,
            strokeAlpha: 0.85,
            lineWidth: 2.2,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      lmbBack: {
        id: "attack.cyien.lmb-back",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 180,
        presentation: {color: "#4f79aa", suppressAttackFeedback: true},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.lmbBack.range"),
            halfWidth: 54,
            angleOffset: 3.141592653589793,
            wallPolicy: "block"
          },
          {
            type: "state.progress",
            stateKey: "cyien-gyeok",
            when: "on-hit",
            operation: "add",
            amount: 2,
            max: characterValue("attacks.lmb.modules.1.max"),
            presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "botDrill",
            position: "source",
            angleOffset: 3.141592653589793,
            len: 180,
            width: 54,
            color: "168,213,255",
            duration: 190,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.cyien.rmb",
        damageRatio: 0,
        cost: 300,
        cd: 450,
        range: 120,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.rmb.range"),
            halfAngle: 1.05,
            wallPolicy: "block",
            targetRelations: ["enemy"],
            applyHitEffects: true,
            autoPresentation: false
          },
          {
            type: "effect.spawn",
            stateKey: "cyien-parry",
            renderType: "shieldSwing",
            range: characterValue("attacks.rmb.range"),
            halfAngle: characterValue("attacks.rmb.modules.0.halfAngle"),
            color: "79,121,170",
            duration: 150,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "attack.guard",
            stateKey: "cyien-parry",
            blockCountMode: "projectile",
            shape: "sector",
            range: characterValue("attacks.rmb.range"),
            halfAngle: 1.05,
            wallPolicy: "block",
            duration: 150,
            onBlock: {
              progress: {
                stateKey: "cyien-gyeok",
                operation: "add",
                amount: 1,
                max: 8,
                presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
              }
            },
            visualState: {effectStateKey: "cyien-parry", duration: 150, syncToGuardDuration: true, color: "168,213,255"}
          }
        ],
        tags: ["스킬"]
      },
      rmbCharged: {
        id: "attack.cyien.rmb-charged",
        damageRatio: 5,
        cost: 0,
        cd: 300,
        range: 400,
        presentation: {color: "#a8d5ff", suppressAttackFeedback: true},
        previewGeometry: {shape: "rect", range: characterValue("attacks.rmbCharged.range"), halfWidth: 57.2, wallPolicy: "ignore"},
        modules: [
          {type: "damage.target-health-ratio-multiplier", threshold: 0.5, multiplier: 2, strict: true},
          {
            type: "state.progress",
            stateKey: "cyien-gyeok",
            when: "on-hit",
            operation: "add",
            amount: 4,
            max: characterValue("attacks.lmb.modules.1.max"),
            presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
          },
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:cyien-sever",
            direction: "attack",
            tags: ["이동기"],
            distance: characterValue("attacks.rmbCharged.range"),
            duration: 70,
            control: "fixed",
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            presentation: {type: "dash-line", color: "168,213,255", width: 7, alpha: 0.45, duration: 200}
          },
          {type: "state.progress", when: "before-attack", stateKey: "cyien-gyeok", operation: "reset"},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "effectShape",
            visible: false,
            duration: characterValue("attacks.rmbCharged.modules.2.duration"),
            animation: {
              mode: "forward",
              distance: characterValue("attacks.rmbCharged.range"),
              easing: "linear",
              clipByMovementCollision: true
            },
            damage: {
              attackId: "attack.cyien.rmb-charged",
              requireMovementExecution: true,
              movementStateKey: "movement:cyien-sever",
              oncePerExecution: true,
              hitMode: "body-contact",
              contactRadius: 57.2,
              pathPresentation: {color: "168,213,255", width: 57.2, duration: 200},
              stopAfterFirstContact: false
            }
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.cyien.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 500,
        range: 300,
        presentation: {color: "#4f79aa"},
        previewGeometry: {shape: "rect", range: characterValue("attacks.counter.range"), halfWidth: 44, wallPolicy: "ignore"},
        modules: [
          {
            type: "movement.move",
            speedMultiplier: 1.35,
            when: "after-attack",
            stateKey: "movement:cyien-slide",
            direction: "attack",
            distance: characterValue("attacks.counter.range"),
            duration: 220,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            tags: ["이동기"],
            presentation: {
              type: "dash-line",
              color: "79,121,170",
              width: 7,
              alpha: 0.45,
              duration: characterValue("attacks.counter.modules.0.duration")
            }
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "effectShape",
            visible: false,
            duration: characterValue("attacks.counter.modules.0.duration"),
            animation: {
              mode: "forward",
              distance: characterValue("attacks.counter.range"),
              easing: "linear",
              clipByMovementCollision: true
            },
            damage: {
              pathPresentation: {color: "79,121,170", width: 44, duration: 200},
              attackId: "attack.cyien.counter",
              requireMovementExecution: true,
              movementStateKey: "movement:cyien-slide",
              oncePerExecution: true,
              hitMode: "body-contact",
              contactRadius: 44,
              stopAfterFirstContact: false
            }
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "attack",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "state.progress",
            when: "on-hit",
            stateKey: "cyien-gyeok",
            operation: "add",
            amount: 2,
            max: characterValue("attacks.lmb.modules.1.max"),
            oncePerExecution: true,
            presentation: {type: "arc-gauge", color: "#4f79aa", readyColor: "#4f79aa", lineWidth: 3.5, maxChargeFlash: true}
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.cyien.lmb",
        input: "lmb",
        attackId: "attack.cyien.lmb",
        inputPolicy: {repeatWhileHeld: false},
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
            {type: "action.attack"},
            {type: "timing.delay", duration: 100, aimMode: "live-source", requireAttackId: "attack.cyien.lmb"},
            {
              type: "action.trigger-attack",
              attackId: "attack.cyien.lmb-second",
              requireAttackId: "attack.cyien.lmb",
              explicitNetworkReplay: true
            },
            {type: "timing.delay", duration: 100, aimMode: "live-source", requireAttackId: "attack.cyien.lmb"},
            {
              type: "action.trigger-attack",
              attackId: "attack.cyien.lmb-back",
              requireAttackId: "attack.cyien.lmb",
              explicitNetworkReplay: true
            }
          ]
        }
      },
      rmb: {
        id: "ability.cyien.rmb",
        input: "rmb",
        attackId: "attack.cyien.rmb",
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
                  attackId: "attack.cyien.rmb-charged",
                  conditions: [
                    {
                      type: "state.progress-gte",
                      stateKey: "cyien-gyeok",
                      value: characterValue("attacks.lmb.modules.1.max")
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      counter: {
        id: "ability.cyien.counter",
        input: "counter",
        attackId: "attack.cyien.counter",
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
                distance: characterValue("attacks.counter.modules.2.distance"),
                speed: characterValue("attacks.counter.modules.2.speed"),
                oncePerExecution: true
              }
            }
          ]
        }
      }
    },
    descriptionValues: {comboHits: characterCount("abilities.lmb.trigger.modules", ["action.attack","action.trigger-attack"])}
  }
