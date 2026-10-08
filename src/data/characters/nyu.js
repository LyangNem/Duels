{
    id: "nyu",
    name: "뉴",
    title: "마검의 주인",
    color: "#c64a73",
    classification: {style: 1, range: 0, role: 2},
    stats: {maxHealth: 600, speed: 4.5, radius: 15, baseDamage: 100, difficulty: 3},
    desc: "마검 때문에 중2병 걸린 작은 요정 캐릭터",
    passiveBuffs: [
      {
        stat: "damage",
        sourceId: "character-passive:nyu:sword-damage",
        valueRef: {value: 0.6},
        conditions: [{type: "state.absent", stateKey: "nyu-dark-sword"}],
        tags: ["버프", "피해량"]
      },
      {
        stat: "defense",
        sourceId: "character-passive:nyu:sword-defense",
        valueRef: {value: 0.6},
        conditions: [{type: "state.absent", stateKey: "nyu-dark-sword"}],
        tags: ["버프", "방어력"]
      },
      {
        stat: "speed",
        sourceId: "character-passive:nyu:sword-speed",
        valueRef: {value: -0.2},
        conditions: [{type: "state.absent", stateKey: "nyu-dark-sword"}],
        tags: ["디버프", "이동속도"]
      }
    ],
    worldEffectModules: [{type:"effect.spawn",renderType:"weaponImage",conditions:[{type:"state.absent",stateKey:"nyu-dark-sword"}],style:"dark",rotationStateKey:"nyu-sword-rotation",rotationMs:300,angle:-0.6,scale:1.75}],
    tooltipSkills: [
      {
        key: "ALWAYS",
        name: "암흑의 기운",
        attack: "lmb",
        showCost: false,
        text: "마검 보유 시 피해량 +{passiveDamagePercent}%, 방어력 +{passiveDefensePercent}%, 이동속도 -{passiveSpeedPenaltyPercent}%"
      },
      {key: "LMB", name: "피를 탐해라! 다크니스 블레이드!", attack: "lmb", text: "마검을 보유 중일 때 휘둘러 전방에 피해 ({damage})"},
      {
        key: "RMB",
        name: "저 녀석을 처리해!",
        attack: "rmb",
        text: "벽을 관통하는 마검을 날려 적중 시 피해. 탄착지점에 남아 주변에 피해를 주며, 뉴가 접근하면 회수 ({damage})"
      },
      {
        key: "RMB/RMB",
        name: "돌아와!",
        attack: "rmb",
        costRef: {ability: "rmb", trigger: "trigger", module: "resource.spend"},
        text: "착탄한 마검이 뉴에게 복귀"
      },
      {key: "L-Shift", name: "힘을 통제할 수... 없어...!", attack: "counter", text: "뉴와 마검의 위치에서 어둠의 기운 발생 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.nyu.lmb",
        damageRatio: 1,
        cost: 150,
        cd: 550,
        range: 210,
        presentation: {color: "#c64a73"},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.7453292519943295,
            endChord: true,
            endChordWidth: 2,
            wallPolicy: "block",
            render: false
          },
          {
            type: "effect.spawn",
            renderType: "arcSweep",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            animateSweep: false,
            color: "198,74,115",
            fillAlpha: 0.2,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {type:"mode.toggle",when:"on-delivery",stateKey:"nyu-sword-rotation",values:["a","b"]}
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.nyu.rmb",
        damageRatio: 5,
        cost: 500,
        cd: 500,
        range: 700,
        presentation: {color: "#b83f6c"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 20,
            radius: 20,
            hitRadius: characterValue("attacks.rmb.modules.0.radius"),
            stateKey: "nyu-dark-sword",
            arrival: {
              linger: {
                atRange: true,
                snapToRangeEnd: true,
                atTarget: true,
                persistent: true,
                sourcePickupRange: 140,
                sourcePickupMode: "return",
                showRange: false,
                triggerOnEnter: false,
                removeOnTrigger: false
              }
            }
          },
          {type: "projectile.pierce", targets: false, walls: true},
          {
            type: "projectile.return",
            stateKey: "nyu-dark-sword",
            returnAttackId: "attack.nyu.sword-return",
            speed: 28,
            damageOnReturn: true,
            sharedHitIds: true,
            resetSharedHitAfterStationaryMs: 500
          },
          {
            type: "projectile.impact",
            reasons: ["range"],
            field: {
              type: "field.area",
              stateKey: "nyu-sword-field",
              anchorMode: "point",
              shape: "circle",
              range: 140,
              wallPolicy: "block",
              duration: "infinite",
              targetRelations: ["enemy"],
              interval: 1000,
              intervalMode: "per-target",
              triggerOnEnter: false,
              attackId: "attack.nyu.sword-field-tick",
              damageOnTrigger: true,
              bindToProjectile: true,
              presentation: {
                type: "areaCircle",
                r: characterValue("attacks.rmb.modules.3.field.range"),
                color: "198,74,115",
                fillAlpha: 0.08,
                strokeAlpha: 0.62,
                lineWidth: 2,
                pulse: true,
                pulseSpeed: 0.006
              }
            }
          },
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.rmb.modules.0.radius"),
              fillAlpha: 0.32,
              pulseMin: 0.78,
              pulseMax: 1,
              pulseSpeed: 0.018,
              strokeColor: "184,63,108",
              innerColor: "245,152,187",
              strokeWidth: 3.5,
              innerStrokeWidth: 2.5,
              crossHalfLength: 10,
              showLink: false,
              returningAlpha: 0.72
            }
          },
          {type:"mode.toggle",when:"on-delivery",stateKey:"nyu-sword-rotation",values:["a","b"]}
        ],
        tags: ["스킬"]
      },
      swordFieldTick: {
        id: "attack.nyu.sword-field-tick",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 140,
        presentation: {color: "#c64a73"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.swordFieldTick.range"),
            wallPolicy: "block",
            targetRelations: ["enemy"],
            render: false
          }
        ],
        tags: ["스킬"]
      },
      swordReturn: {
        id: "attack.nyu.sword-return",
        damageRatio: 5,
        cost: 0,
        cd: 0,
        range: 2000,
        modules: [
          {
            type: "delivery.projectile",
            phase: "returning",
            speed: 28,
            radius: 20,
            hitRadius: characterValue("attacks.swordReturn.modules.0.radius")
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.swordReturn.modules.0.radius"),
              fillAlpha: 0.32,
              pulseMin: 0.78,
              pulseMax: 1,
              pulseSpeed: 0.018,
              strokeColor: "184,63,108",
              innerColor: "245,152,187",
              strokeWidth: 3.5,
              innerStrokeWidth: 2.5,
              crossHalfLength: 10,
              showLink: false,
              returningAlpha: 0.72
            }
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.nyu.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 300,
        range: 180,
        presentation: {color: "#6e294d"},
        modules: [
          {
            type: "effect.spawn",
            renderType: "hitImpactRing",
            position: "source",
            r: 0,
            maxR: characterValue("attacks.counter.range"),
            color: "#6e294d",
            strokeAlpha: 1,
            lineWidth: 5.5,
            duration: 220,
            animation: true,
            damage: {
              attackId: "attack.nyu.counter",
              hitMode: "expanding-ring",
              suppressHitImpactRing: true,
              oncePerExecution: true,
              module: {type: "delivery.area", shape: "circle", range: 180, wallPolicy: "ignore", targetRelations: ["enemy"]}
            }
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-impact",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          },
          {type:"mode.toggle",when:"on-delivery",stateKey:"nyu-sword-rotation",values:["a","b"]}
        ],
        tags: ["반격"]
      },
      counterSword: {
        id: "attack.nyu.counter-sword",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 180,
        presentation: {color: "#6e294d"},
        modules: [
          {
            type: "effect.spawn",
            renderType: "hitImpactRing",
            position: "source",
            r: 0,
            maxR: characterValue("attacks.counterSword.range"),
            color: "#6e294d",
            strokeAlpha: 1,
            lineWidth: 5.5,
            duration: 220,
            animation: true,
            damage: {
              attackId: "attack.nyu.counter-sword",
              hitMode: "expanding-ring",
              suppressHitImpactRing: true,
              oncePerExecution: true,
              module: {type: "delivery.area", shape: "circle", range: 180, wallPolicy: "ignore", targetRelations: ["enemy"]}
            }
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
        id: "ability.nyu.lmb",
        input: "lmb",
        attackId: "attack.nyu.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "state.absent", stateKey: "nyu-dark-sword"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      rmb: {
        id: "ability.nyu.rmb",
        input: "rmb",
        attackId: "attack.nyu.rmb",
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
              type: "resource.spend",
              resource: "stamina",
              amount: 200,
              conditions: [
                {type: "state.phase", stateKey: "nyu-dark-sword", phase: "outbound"},
                {type: "projectile.stationary-arrival", stateKey: "nyu-dark-sword"}
              ]
            },
            {
              type: "projectile.recall",
              stateKey: "nyu-dark-sword",
              phase: "outbound",
              speed: 28,
              requireStationaryArrival: true,
              blockFallbackWhileExists: true,
              tags: ["스킬", "귀환"]
            },
            {type: "action.attack"}
          ]
        }
      },
      counter: {
        id: "ability.nyu.counter",
        input: "counter",
        attackId: "attack.nyu.counter",
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
              preview: {
                type: "preview.create",
                shape: "attack-shape",
                projectiles: [{stateKey: "nyu-dark-sword", attackId: "attack.nyu.counter-sword"}]
              },
              cc: {
                type: "movement.neutralize-knockback",
                target: "hit-target",
                direction: "away-from-impact",
                distance: characterValue("attacks.counter.modules.1.distance"),
                speed: characterValue("attacks.counter.modules.1.speed"),
                oncePerExecution: true
              },
              followUpAttacks: [
                {
                  attackId: "attack.nyu.counter-sword",
                  delay: 140,
                  projectileStateKey: "nyu-dark-sword",
                  fallbackToSource: true
                }
              ]
            }
          ]
        }
      }
    }
  }
