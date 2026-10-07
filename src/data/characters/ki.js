{
    id: "ki",
    name: "키",
    englishName: "Ki",
    title: "전설적인 도둑",
    color: "#c3c9de",
    classification: {style: 9, range: 0, role: 1},
    stats: {maxHealth: 1200, speed: 4.25, radius: 20, baseDamage: 50, difficulty: 2},
    desc: "예고장으로 상대의 회피를 이끌어내 이득을 취하는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB",
        name: "손기술",
        attack: "lmb",
        detailAttack: "lmbFinal",
        text: "{attackSequenceCount}연타 근거리 공격 ({damage}/{detailDamage})"
      },
      {
        key: "RMB",
        name: "예고장",
        attack: "rmb",
        text: "예고 지역 생성. 예고 지역 내 상대가 저스트 회피가 아닌 회피 사용 시 키의 체력 및 스테미나 {fieldRewardPercent}% 회복"
      },
      {key: "RMB/LMB", name: "예고 실행", attack: "forecastExecute", text: "예고 지역에 광역 피해 ({damage})"},
      {key: "RMB/RMB", name: "기만", attack: "deceive", text: "순간이동 후 예고 취소"},
      {
        key: "L-Shift",
        name: "특수탈취",
        attack: "counter",
        text: "단거리 공격 후 뒤로 순간이동. 적중 시 키의 체력 및 스테미나 {restoreMaxResourcePercent}% 회복 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.ki.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 750,
        range: 160,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 0.85,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            color: "195,201,222",
            fillAlpha: 0.15,
            strokeAlpha: 0.8,
            lineWidth: 2,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      lmbSecond: {
        id: "attack.ki.lmb-second",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 160,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmbSecond.range"),
            halfAngle: 0.85,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            range: characterValue("attacks.lmbSecond.range"),
            halfAngle: characterValue("attacks.lmbSecond.modules.0.halfAngle"),
            color: "195,201,222",
            fillAlpha: 0.15,
            strokeAlpha: 0.8,
            lineWidth: 2,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      lmbFinal: {
        id: "attack.ki.lmb-final",
        damageRatio: 3,
        cost: 0,
        cd: 0,
        range: 160,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmbFinal.range"),
            halfAngle: 0.85,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            range: characterValue("attacks.lmbFinal.range"),
            halfAngle: characterValue("attacks.lmbFinal.modules.0.halfAngle"),
            color: "255,165,0",
            fillAlpha: 0.18,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.ki.rmb",
        damageRatio: 0,
        cost: 300,
        cd: 500,
        range: 270,
        effectsOnly: true,
        modules: [
          {
            type: "field.area",
            stateKey: "ki-forecast",
            reactiveEquipmentEntry: false,
            anchorMode: "target-point",
            shape: "circle",
            range: 347,
            clampToAttackRange: true,
            duration: 2500,
            armDelay: 500,
            damageOnTrigger: false,
            blocksStaminaRegen: true,
            targetRelations: ["enemy"],
            dodgeReward: {result: "non-just", healthMaxRatio: 0.2, staminaMaxRatio: 0.2, color: "255,165,0"},
            presentation: {
              type: "areaCircle",
              color: "195,201,222",
              strokeColorMode: "source-team",
              fillAlpha: 0.08,
              strokeAlpha: 0.65,
              lineWidth: 2.5,
              lineDash: [],
              dash: [],
              visibility: "all",
              allyAlphaScale: 0.45,
              forecastField: {
                armDelay: 500,
                readyDuration: 2000,
                pulseSpeed: 0.01,
                warningFillPulse: 0.3,
                warningStrokePulse: 0.45,
                overlayColor: "195,201,222",
                overlayFillAlpha: 0.08,
                overlayStroke: false,
                overlayLineWidth: 2.5,
                overlayDash: [],
                linkColor: "195,201,222",
                linkAlpha: 0.35,
                linkWidth: 1.5,
                linkDash: [5, 5],
                markerRadius: 10,
                markerAlpha: 0.4,
                markerWidth: 1.5,
                markerDash: [3, 4],
                armGaugeColor: "220,225,255",
                armGaugeFillAlpha: 0.22,
                armGaugeStrokeAlpha: 0.85,
                armGaugeLineWidth: 3.5,
                readyGaugeColor: "255,255,255",
                readyGaugeAlpha: 0.8,
                readyGaugeLineWidth: 3,
                readyGaugeOffset: 6,
                boundaryStrokeOnTop: true,
                readyLabel: ""
              }
            }
          }
        ],
        tags: ["스킬"]
      },
      forecastExecute: {
        id: "attack.ki.forecast-execute",
        damageRatio: 10,
        cost: 300,
        cd: 0,
        range: 347,
        justDodgeWindowExtension: 30,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.forecastExecute.range"),
            wallPolicy: "ignore",
            delay: 500
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "attack-center",
            range: characterValue("attacks.forecastExecute.range"),
            r: characterValue("attacks.forecastExecute.range"),
            duration: 500,
            forecastStrike: true,
            showTokens: false,
            showCenterFlash: false,
            showContractingCircle: false,
            scaleWithAttackRange: true
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "attack-center",
            range: characterValue("attacks.forecastExecute.range"),
            r: characterValue("attacks.forecastExecute.range"),
            duration: 500,
            startDelay: 500,
            forecastFade: true,
            drainGauge: false,
            scaleWithAttackRange: true
          },
          {
            type: "field.area",
            when: "after-attack",
            operation: "clear",
            stateKey: "ki-forecast",
            retainRewardDuration: 500
          },
          {type: "state.window", when: "after-attack", stateKey: "ki-rmb-followup-lock", duration: 1200}
        ],
        tags: ["스킬"]
      },
      deceive: {
        id: "attack.ki.deceive",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 280,
        effectsOnly: true,
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "attack-center",
            range: 347,
            r: 347,
            duration: 500,
            forecastStrike: true,
            showTokens: false,
            showCenterFlash: false,
            showContractingCircle: false,
            scaleWithAttackRange: true
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "attack-center",
            range: 347,
            r: 347,
            duration: 500,
            startDelay: 500,
            forecastFade: true,
            drainGauge: true,
            scaleWithAttackRange: true
          },
          {
            type: "movement.move",
            when: "after-attack",
            direction: "attack",
            distance: characterValue("attacks.deceive.range"),
            duration: 1,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            tags: ["이동기"],
            presentation: {type: "dash-line", color: "195,201,222", width: 6, alpha: 0.4, duration: 134}
          },
          {
            type: "field.area",
            when: "after-attack",
            operation: "clear",
            stateKey: "ki-forecast",
            retainRewardDuration: 500
          },
          {type: "state.window", when: "after-attack", stateKey: "ki-rmb-followup-lock", duration: 1200}
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.ki.counter",
        damageRatio: 5,
        cost: 0,
        cd: 500,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.counter.range"),
            halfWidth: 70,
            wallPolicy: "block"
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "health",
            recipient: "source",
            maxResourceRatio: 0.2,
            delay: 333,
            oncePerExecution: true
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "source",
            maxResourceRatio: 0.2,
            delay: 333,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            when: "on-hit",
            renderType: "areaCircle",
            position: "hit-target",
            travelToken: true,
            target: "source",
            color: "255,165,0",
            duration: 333,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "effectShape",
            shape: "rect",
            range: characterValue("attacks.counter.range"),
            halfWidth: characterValue("attacks.counter.modules.0.halfWidth"),
            color: "195,201,222",
            fillAlpha: 0.18,
            strokeAlpha: 0.75,
            lineWidth: 2,
            durationFrames: 16,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "movement.move",
            when: "after-attack",
            direction: "opposite-aim",
            distance: 220,
            duration: 1,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            tags: ["이동기"],
            presentation: {type: "dash-line", color: "195,201,222", width: 6, alpha: 0.4, duration: 134}
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.ki.lmb",
        input: "lmb",
        attackId: "attack.ki.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "lmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.ki.forecast-execute",
                  fieldStateKey: "ki-forecast",
                  allowFreeAttack: false,
                  conditions: [{type: "field.armed", stateKey: "ki-forecast"}]
                }
              ],
              freeAttackFallbackConditions: [{type: "field.exists", stateKey: "ki-forecast", negate: true}],
              fallbackConditions: [
                {type: "field.exists", stateKey: "ki-forecast", negate: true},
                {type: "cooldowns.ready", attackIds: ["attack.ki.lmb"]},
                {type: "resource.gte", resource: "stamina", value: 200}
              ]
            },
            {type: "timing.delay", duration: 170, aimMode: "live-source", requireAttackId: "attack.ki.lmb"},
            {
              type: "action.trigger-attack",
              attackId: "attack.ki.lmb-second",
              requireAttackId: "attack.ki.lmb",
              explicitNetworkReplay: true
            },
            {type: "timing.delay", duration: 170, aimMode: "live-source", requireAttackId: "attack.ki.lmb"},
            {
              type: "action.trigger-attack",
              attackId: "attack.ki.lmb-final",
              requireAttackId: "attack.ki.lmb",
              explicitNetworkReplay: true
            }
          ]
        }
      },
      rmb: {
        id: "ability.ki.rmb",
        input: "rmb",
        attackId: "attack.ki.rmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.ki.deceive",
                  fieldStateKey: "ki-forecast",
                  allowFreeAttack: false,
                  conditions: [{type: "field.armed", stateKey: "ki-forecast"}]
                }
              ],
              fallbackConditions: [
                {type: "field.exists", stateKey: "ki-forecast", negate: true},
                {type: "state.absent", stateKey: "ki-rmb-followup-lock"},
                {type: "cooldowns.ready", attackIds: ["attack.ki.rmb"]},
                {type: "resource.gte", resource: "stamina", value: 300}
              ]
            }
          ]
        }
      },
      counter: {
        id: "ability.ki.counter",
        input: "counter",
        attackId: "attack.ki.counter",
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
              presentation: {fireColor: "195,201,222"},
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
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
