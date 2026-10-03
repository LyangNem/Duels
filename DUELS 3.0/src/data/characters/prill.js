{
    id: "prill",
    name: "프릴",
    englishName: "Prill",
    title: "완벽한 메이드",
    color: "#ff69b4",
    classification: {style: 8, range: 0, role: 4},
    stats: {maxHealth: 1200, speed: 4, radius: 20, baseDamage: 100, difficulty: 2},
    desc: "빗자루로 청소구역을 청소한 뒤 버프를 받아 전투하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "빗자루질", attack: "lmbSwingLeft", text: "빗자루를 휘둘러 공격. {comboSeconds}초 내 재공격 시 콤보 유지 ({damage})"},
      {
        key: "LMB III",
        name: "",
        attack: "lmbSwingLeft",
        secondaryAttack: "lmbThrust",
        text: "{comboMaxHits}타째에 전방을 찔러 피해 및 넉백 ({secondaryDamage})"
      },
      {
        key: "RMB",
        name: "청소 구역",
        attack: "rmb",
        linkedAttack: "rmbTick",
        text: "자신 이동 제한 후 청소 구역 표시. {channelIntervalSeconds}초마다 총 {channelMaxTicks}회 피해 (타당 {linkedDamage})"
      },
      {
        key: "RMB/RMB",
        name: "청소 완료",
        attack: "rmb",
        costText: "스테미나 0",
        text: "청소를 완료하고 청소 시간에 비례해 청소 구역 내 피해 증가 {modifierPercent}%"
      },
      {
        key: "L-Shift",
        name: "메이드의 관리",
        attack: "counter",
        text: "공격 범위 내 적에게 피해. 적중 시 범위 내 아군 {modifierSeconds}초간 피해 증가 {modifierPercent}%"
      }
    ],
    attacks: {
      lmbSwingLeft: {
        id: "attack.prill.lmb-swing-left",
        attackDelayGroup: "prill-primary",
        attackDelay: 320,
        damageRatio: 1,
        cost: 150,
        cd: 320,
        range: 165,
        modules: [
          {
            type: "delivery.area",
            autoPresentation: false,
            shape: "sector",
            range: characterValue("attacks.lmbSwingLeft.range"),
            halfAngle: 1.6336281798666925,
            angleOffset: -0.28,
            wallPolicy: "block",
            contactType: "melee",
            contactPadding: 6
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmbSwingLeft.range"),
            halfAngle: characterValue("attacks.lmbSwingLeft.modules.0.halfAngle"),
            angleOffset: -0.28,
            animateSweep: true,
            sweepSpeed: 1.6,
            animation: true,
            color: "255,105,180",
            fillAlpha: 0.22,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            edgeLine: true,
            edgeColor: "255,255,255",
            edgeAlpha: 0.75,
            edgeLineWidth: 3,
            durationFrames: 10,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            drawsClippedOutline: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["평타", "콤보"]
      },
      lmbSwingRight: {
        id: "attack.prill.lmb-swing-right",
        attackDelayGroup: "prill-primary",
        attackDelay: 320,
        damageRatio: 1,
        cost: 150,
        cd: 320,
        range: 165,
        modules: [
          {
            type: "delivery.area",
            autoPresentation: false,
            shape: "sector",
            range: characterValue("attacks.lmbSwingRight.range"),
            halfAngle: 1.6336281798666925,
            angleOffset: 0.28,
            wallPolicy: "block",
            contactType: "melee",
            contactPadding: 6
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmbSwingRight.range"),
            halfAngle: characterValue("attacks.lmbSwingRight.modules.0.halfAngle"),
            angleOffset: 0.28,
            animateSweep: true,
            sweepSpeed: 1.6,
            animation: true,
            color: "255,150,205",
            fillAlpha: 0.22,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            edgeLine: true,
            edgeColor: "255,255,255",
            edgeAlpha: 0.75,
            edgeLineWidth: 3,
            sweepDirection: "counterclockwise",
            durationFrames: 10,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            drawsClippedOutline: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["평타", "콤보"]
      },
      lmbThrust: {
        id: "attack.prill.lmb-thrust",
        attackDelayGroup: "prill-primary",
        attackDelay: 320,
        damageRatio: 2,
        cost: 150,
        cd: 320,
        range: 210,
        modules: [
          {
            type: "delivery.area",
            autoPresentation: false,
            shape: "rect",
            range: characterValue("attacks.lmbThrust.range"),
            halfWidth: 26,
            wallPolicy: "block",
            contactType: "melee",
            contactPadding: 6
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "attack-center",
            range: characterValue("attacks.lmbThrust.range"),
            halfWidth: characterValue("attacks.lmbThrust.modules.0.halfWidth"),
            growthSpeed: 2.2,
            animation: true,
            color: "255,105,180",
            strokeColor: "255,182,218",
            fillAlpha: 0.22,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            endCap: true,
            endCapColor: "255,255,255",
            endCapAlpha: 0.7,
            endCapLineWidth: 3,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 68,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["평타", "콤보"]
      },
      rmb: {
        id: "attack.prill.rmb",
        damageRatio: 0,
        cost: 700,
        cd: 1800,
        range: 900,
        effectsOnly: true,
        modules: [],
        tags: ["스킬", "선딜레이"]
      },
      rmbTick: {
        id: "attack.prill.rmb-tick",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 900,
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "attack-center",
            range: characterValue("attacks.rmbTick.range"),
            halfWidth: 220,
            growthSpeed: 2.2,
            animation: true,
            color: "255,105,180",
            strokeColor: "255,182,218",
            fillAlpha: 0.18,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            endCap: true,
            endCapColor: "255,255,255",
            endCapAlpha: 0.9,
            endCapLineWidth: 4.5,
            centerLine: true,
            centerColor: "255,255,255",
            centerAlpha: 0.35,
            centerLineWidth: 1.5,
            durationFrames: 12,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true,
            damage: {
              attackId: "attack.prill.rmb-tick",
              hitMode: "progressive-rect",
              oncePerExecution: true,
              module: {type: "delivery.area", shape: "rect", range: 900, halfWidth: 220, wallPolicy: "ignore"}
            }
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.prill.counter",
        damageRatio: 2,
        cost: 0,
        cd: 300,
        range: 185,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 1.7278759594743864,
            wallPolicy: "block"
          },
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 1.7278759594743864,
            wallPolicy: "block",
            targetRelations: ["ally"],
            applyHitEffects: true,
            visual: false
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.counter.range"),
            halfAngle: characterValue("attacks.counter.modules.0.halfAngle"),
            color: "255,105,180",
            fillAlpha: 0.26,
            strokeAlpha: 0.94,
            lineWidth: 3,
            durationFrames: 14,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "modifier.set",
            when: "on-hit",
            stat: "damage",
            value: 0.5,
            duration: 5000,
            sourceId: "attack.prill.counter:damage-boost",
            recipient: "source",
            targetRelations: ["enemy", "ally"],
            oncePerExecution: true
          },
          {
            type: "modifier.set",
            when: "on-hit",
            stat: "damage",
            value: 0.5,
            duration: 5000,
            sourceId: "attack.prill.counter:ally-damage-boost",
            recipient: "target",
            targetRelations: ["ally"],
            oncePerExecution: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.prill.lmb",
        input: "lmb",
        attackId: "attack.prill.lmb-swing-left",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "channel.action-unlocked", action: "lmb"}
          ],
          modules: [
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.prill.lmb-thrust",
                  conditions: [{type: "state.progress-gte", stateKey: "prill-combo-step", value: 2}]
                },
                {
                  attackId: "attack.prill.lmb-swing-right",
                  conditions: [{type: "state.progress-gte", stateKey: "prill-combo-step", value: 1}]
                }
              ]
            },
            {
              type: "state.progress",
              stateKey: "prill-combo-step",
              operation: "add",
              amount: 1,
              max: 3,
              requireExecuted: true
            },
            {
              type: "state.progress",
              stateKey: "prill-combo-window",
              operation: "set-max",
              max: 1000,
              decay: {delay: 0, rate: 1000},
              onEmpty: {resetStateKeys: ["prill-combo-step"]},
              presentation: {
                type: "arc-gauge",
                color: "#ff69b4",
                readyColor: "#ff69b4",
                lineWidth: 3.5,
                lineCap: "round",
                maxChargeFlash: false
              },
              requireExecuted: true
            },
            {
              type: "state.progress",
              stateKey: "prill-combo-step",
              operation: "reset",
              requireExecuted: true,
              conditions: [
                {
                  type: "state.progress-gte",
                  stateKey: "prill-combo-step",
                  value: characterValue("abilities.lmb.trigger.modules.1.max")
                }
              ]
            },
            {
              type: "state.progress",
              stateKey: "prill-combo-window",
              operation: "reset",
              requireExecuted: true,
              conditions: [{type: "state.progress-empty", stateKey: "prill-combo-step"}]
            }
          ]
        }
      },
      rmb: {
        id: "ability.prill.rmb",
        input: "rmb",
        attackId: "attack.prill.rmb",
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
            {type: "channel.stop", stateKey: "prill-cleaning-zone", allowCharging: true, breakOnStop: true},
            {type: "action.attack"},
            {
              type: "channel.attack",
              stateKey: "prill-cleaning-zone",
              attackId: "attack.prill.rmb-tick",
              chargeDuration: 700,
              interval: 700,
              maxTicks: 5,
              finishDelay: "attack-animation",
              aimMode: "live-source",
              maxAngleDrift: 0.2617993877991494,
              interruptOnForcedMovement: false,
              followSourcePosition: true,
              selfStatus: {status: "bind", applyDuringCharge: true},
              actionLocks: ["lmb", "counter", "dodge"],
              presentation: {
                renderType: "progressRect",
                range: 900,
                halfWidth: 220,
                fullLength: true,
                color: "255,105,180",
                strokeColor: "255,140,200",
                strokeColorMode: "source-team",
                fillAlpha: 0.08,
                strokeAlpha: 0.7,
                lineWidth: 2.5,
                lineDash: [8, 5]
              },
              stopField: {
                stateKey: "prill-cleaned-zone",
                shape: "rect",
                range: 900,
                halfWidth: 220,
                wallPolicy: "ignore",
                durationFromElapsedMultiplier: 3,
                minDuration: 1000,
                targetRelations: ["self", "ally"],
                interval: 100,
                intervalMode: "per-target",
                triggerOnEnter: true,
                damageOnTrigger: false,
                onTrigger: [
                  {
                    type: "modifier.set",
                    stat: "damage",
                    value: 0.5,
                    duration: 220,
                    stackGroup: "prill-cleaned-zone-damage",
                    removeOnExit: true
                  }
                ],
                presentation: {
                  type: "progressRect",
                  range: characterValue("abilities.rmb.trigger.modules.2.stopField.range"),
                  halfWidth: characterValue("abilities.rmb.trigger.modules.2.stopField.halfWidth"),
                  fullLength: true,
                  color: "255,105,180",
                  strokeColor: "255,182,218",
                  fillAlpha: 0.055,
                  strokeAlpha: 0.52,
                  lineWidth: 2
                }
              },
              requireExecuted: true,
              requireAttackId: "attack.prill.rmb"
            }
          ]
        }
      },
      counter: {
        id: "ability.prill.counter",
        input: "counter",
        attackId: "attack.prill.counter",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "counter"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "channel.action-unlocked", action: "counter"},
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
