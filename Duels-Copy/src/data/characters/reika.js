{
    id: "reika",
    name: "레이카",
    title: "태양의 기사",
    color: "#ff7a00",
    classification: {style: 7, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 3.75, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "태양의 가호로 각성해 강화된 공격을 퍼붓는 캐릭터",
    worldEffectModules: [{type:"effect.spawn",renderType:"swordSilhouette",conditions:[{type:"state.mode-is",stateKey:"reika-mode",value:"blessed",initial:"normal"}],style:"sun",rotationStateKey:"reika-sword-rotation",rotationMs:300,angle:-0.6,scale:1.25}],
    tooltipSkills: [
      {key: "ALWAYS", name: "가호 준비", attack: "gahoActivate", showCost: false, text: "시간이 지나거나 적을 타격해 게이지 충전"},
      {key: "LMB", name: "태양의 대검", attack: "lmb", text: "대검 휘두르기 ({damage})"},
      {key: "RMB", name: "저리가!", attack: "rmbPush", text: "선딜레이 후 빠르게 한 바퀴 회전해 주변 적에게 피해 및 넉백 ({damage})"},
      {
        key: "RMB CHARGE",
        name: "태양의 가호",
        attack: "gahoActivate",
        linkedAttack: "gahoActivate",
        costText: "스테미나 0",
        text: "선딜레이 후 주변 폭발 및 화염. 레이카는 가호 상태로 전환 ({damage})"
      },
      {key: "L-Shift", name: "반동제어불능!", attack: "counter", text: "전방으로 돌진하며 경로 상에 피해. 적에게 적중 시 정지  ({damage})"},
      {
        key: "LMB PROTECTION",
        name: "검격의 화염",
        attack: "lmbBlessed",
        linkedAttack: "lmbWave",
        text: "대검 휘두르기 및 태양의 파동을 내보내 화염 부여 ({damage})"
      },
      {
        key: "RMB PROTECTION",
        name: "공중 강하",
        attack: "gahoWeapon",
        linkedAttack: "gahoSlam",
        secondaryAttack: "gahoLand",
        text: "잠시 공중에 떠올라 무적 상태에서 대검을 투척 후 해당 지점으로 강하 ({damageSequence})"
      },
      {
        key: "L-Shift PROTECTION",
        name: "돌진 회전베기!",
        attack: "counterBlessed",
        linkedAttack: "counterBlessedExplosion",
        text: "전방으로 돌진하며 경로 상에 피해 및 화염. 대검을 한 바퀴 돌리며 주변 적 피해 및 화염. 적에게 적중 시 정지 ({damageSequence})"
      },
      {key: "Space PROTECTION", name: "불길", text: "경로에 불길 생성. 밟을 시 화염"}
    ],
    triggers: [
      {
        id: "reika-gaho-damage-charge",
        type: "trigger",
        event: "damage-dealt",
        conditions: [{type: "state.mode-is", stateKey: "reika-mode", value: "normal", initial: "normal"}],
        modules: [
          {
            type: "state.progress",
            stateKey: "reika-gaho",
            operation: "add",
            amountFrom: "healthDamage",
            amountScale: 0.06,
            max: 200,
            presentation: {
              type: "arc-gauge",
              color: "#ff7a00",
              overflowColor: "#ffd080",
              lineWidth: 3.5,
              layers: 2,
              readyAtRatio: 0.5,
              maxChargeFlash: true,
              flashAfterFirstLayer: true
            }
          }
        ]
      }
    ],
    passives: [
      {
        type: "state.progress-rate",
        stateKey: "reika-gaho",
        max: 200,
        ratePerSecond: 2.5,
        whenMode: {stateKey: "reika-mode", value: "normal", initial: "normal"},
        presentation: {
          type: "arc-gauge",
          color: "#ff7a00",
          overflowColor: "#ffd080",
          lineWidth: 3.5,
          layers: 2,
          readyAtRatio: 0.5,
          maxChargeFlash: true,
          flashAfterFirstLayer: true
        }
      },
      {
        type: "state.progress-rate",
        stateKey: "reika-gaho",
        max: 200,
        ratePerSecond: -16,
        whenMode: {stateKey: "reika-mode", value: "blessed", initial: "normal"},
        setModeAtEmpty: {stateKey: "reika-mode", value: "normal", initial: "normal"},
        presentation: {
          type: "arc-gauge",
          color: "#ff7a00",
          overflowColor: "#ffd080",
          lineWidth: 3.5,
          layers: 2,
          readyAtRatio: 0.5,
          maxChargeFlash: true,
          flashAfterFirstLayer: true
        }
      },
      {
        type: "dodge.trail-field",
        stateKey: "reika-fire-trail",
        spacing: 14,
        whenMode: {stateKey: "reika-mode", value: "blessed", initial: "normal"},
        field: {
          type: "field.area",
          stateKey: "reika-fire-trail",
          shape: "circle",
          range: 35,
          duration: 4000,
          targetRelations: ["enemy"],
          intervalMode: "per-target",
          interval: 4000,
          triggerOnEnter: true,
          onTrigger: [
            {
              type: "status.apply",
              status: "burn",
              duration: 3000,
              data: {
                flat: characterValue("statusDefaults.burn.flat"),
                interval: characterValue("statusDefaults.burn.interval"),
                tickAtEnd: true,
                stackMode: "refresh-type"
              }
            }
          ],
          presentation: {type: "areaCircle", color: "56,189,248", fillAlpha: 0.055, strokeAlpha: 0.42, lineWidth: 1.5}
        }
      }
    ],
    attacks: {
      lmb: {
        id: "attack.reika.lmb",
        damageRatio: 1,
        cost: 150,
        cd: 560,
        range: 230,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.2,
            angleOffset: 0.35,
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
            angleOffset: 0.35,
            animateSweep: false,
            color: "255,122,0",
            fillAlpha: 0.2,
            strokeAlpha: 0.88,
            lineWidth: 2.5,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["평타"]
      },
      lmbBlessed: {
        id: "attack.reika.lmb-blessed",
        damageRatio: 2,
        cost: 200,
        cd: 450,
        range: 230,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmbBlessed.range"),
            halfAngle: 1.2,
            angleOffset: 0.35,
            endChord: true,
            endChordWidth: 2,
            wallPolicy: "block",
            render: false
          },
          {
            type: "effect.spawn",
            renderType: "arcSweep",
            range: characterValue("attacks.lmbBlessed.range"),
            halfAngle: characterValue("attacks.lmbBlessed.modules.0.halfAngle"),
            angleOffset: 0.35,
            animateSweep: false,
            color: "56,189,248",
            fillAlpha: 0.2,
            strokeAlpha: 0.92,
            lineWidth: 3,
            durationFrames: 12,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["평타"]
      },
      lmbWave: {
        id: "attack.reika.lmb-wave",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 276,
        modules: [
          {
            type: "effect.spawn",
            renderType: "hitImpactRing",
            position: "source",
            r: 0,
            maxR: characterValue("attacks.lmbWave.range"),
            color: "56,189,248",
            strokeAlpha: 1,
            lineWidth: 5.5,
            duration: 300,
            animation: true,
            damage: {
              attackId: "attack.reika.lmb-wave",
              hitMode: "expanding-ring",
              contactOnly: true,
              oncePerExecution: true,
              module: {type: "delivery.area", shape: "circle", range: 276, wallPolicy: "ignore"}
            }
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: characterValue("statusDefaults.burn.flat"),
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "refresh-type"
            },
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      rmbPush: {
        id: "attack.reika.rmb-push",
        damageRatio: 1,
        cost: 300,
        cd: 980,
        range: 230,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "circle",
            range: characterValue("attacks.rmbPush.range"),
            delay: 300,
            wallPolicy: "block",
            render: false
          },
          {
            type: "effect.spawn",
            renderType: "annularDoubleSweep",
            position: "source",
            r: characterValue("attacks.rmbPush.range"),
            inner: 0,
            span: 6.283185307179586,
            sweepCount: 1,
            sweepDirection: "clockwise",
            startAngleOffset: 3.141592653589793,
            sweepFraction: 0.75,
            fadePower: 1.35,
            hitColor: "255,122,0",
            fillAlpha: 0.2,
            strokeAlpha: 0.88,
            lineWidth: 2.5,
            edgeLine: false,
            delay: 300,
            duration: 300,
            animation: true,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 180,
            speed: 12,
            oncePerExecution: true
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["스킬", "선딜레이"]
      },
      gahoActivate: {
        id: "attack.reika.gaho-activate",
        damageRatio: 5,
        cost: 0,
        cd: 700,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.gahoActivate.range"),
            delay: 500,
            wallPolicy: "ignore",
            color: "56,189,248",
            renderType: "areaCircle"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 3000,
            data: {
              flat: characterValue("statusDefaults.burn.flat"),
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "refresh-type"
            },
            oncePerExecution: true
          },
          {
            type: "mode.set",
            when: "after-delivery",
            stateKey: "reika-mode",
            value: "blessed",
            initial: "normal"
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["스킬", "선딜레이"]
      },
      gahoWeapon: {
        id: "attack.reika.gaho-weapon",
        damageRatio: 0,
        cost: 400,
        cd: 750,
        range: 1200,
        modules: [
          {
            type: "effect.spawn",
            renderType: "areaCircle",
            range: 58,
            r: 58,
            color: "56,189,248",
            fillAlpha: 0.025,
            strokeAlpha: 0.72,
            lineWidth: 2,
            duration: 220,
            followSource: true
          },
          {
            type: "delivery.projectile",
            speed: 36,
            delay: 220,
            targetPointTravelDuration: 100,
            radius: 16,
            targetPoint: true,
            targetPointClampToAttackRange: false,
            targetPointResolve: "nearest-open",
            targetPointClearance: 4,
            targetPreview: {
              shape: "circle",
              range: characterValue("attacks.gahoSlam.range")
            },
            damageOnTravel: false,
            collisionTargets: false
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.impact",
            attackIds: ["attack.reika.gaho-slam"],
            sourceRelocate: {
              stateKey: "reika-gaho-impact-travel",
              delay: 50,
              duration: 140,
              tags: ["이동기", "선딜레이"],
              collision: {passWalls: true, passEnemies: true},
              resolveOverlapOnEnd: true,
              presentation: {
                type: "dash-line",
                color: "56,189,248",
                width: 8,
                alpha: 0.48,
                duration: characterValue("attacks.gahoWeapon.modules.3.sourceRelocate.duration")
              },
              onEndAttackIds: ["attack.reika.gaho-land"]
            }
          },
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: 20,
              fillAlpha: 0.3,
              pulseMin: 0.74,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 11,
              showLink: false
            }
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["스킬"]
      },
      gahoSlam: {
        id: "attack.reika.gaho-slam",
        damageRatio: 2,
        cost: 0,
        cd: 0,
        range: 90,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.gahoSlam.range"),
            wallPolicy: "ignore",
            color: "56,189,248",
            renderType: "areaCircle"
          }
        ],
        tags: ["스킬"]
      },
      gahoLand: {
        id: "attack.reika.gaho-land",
        damageRatio: 2,
        cost: 0,
        cd: 0,
        range: 70,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.gahoLand.range"),
            wallPolicy: "ignore",
            color: "56,189,248",
            renderType: "areaCircle"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 20,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.reika.counter",
        damageRatio: 2,
        cost: 0,
        cd: 300,
        range: 300,
        previewGeometry: {shape: "rect", range: characterValue("attacks.counter.range"), halfWidth: 44, wallPolicy: "ignore"},
        modules: [
          {
            type: "movement.move",
            speedMultiplier: 1.35,
            tags: ["이동기"],
            distance: characterValue("attacks.counter.range"),
            duration: 220,
            control: "fixed",
            collision: {passWalls: true, passEnemies: false},
            presentation: {
              type: "dash-line",
              color: "255,122,0",
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
              attackId: "attack.reika.counter",
              requireMovementExecution: true,
              movementStateKey: "movement:move",
              oncePerExecution: true,
              hitMode: "body-contact",
              contactRadius: 44,
              pathPresentation: {color: "255,122,0", width: 44, duration: 200},
              stopAfterFirstContact: false
            }
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["반격"]
      },
      counterBlessed: {
        id: "attack.reika.counter-blessed",
        damageRatio: 2,
        cost: 0,
        cd: 300,
        range: 300,
        presentation: {color: "56,189,248"},
        previewGeometry: {
          shape: "rect",
          range: characterValue("attacks.counterBlessed.range"),
          halfWidth: 44,
          wallPolicy: "ignore"
        },
        modules: [
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: characterValue("statusDefaults.burn.flat"),
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "refresh-type"
            },
            oncePerExecution: true
          },
          {
            type: "movement.move",
            speedMultiplier: 1.35,
            tags: ["이동기"],
            distance: characterValue("attacks.counterBlessed.range"),
            duration: 220,
            control: "fixed",
            collision: {passWalls: true, passEnemies: false},
            onEndAttackIds: ["attack.reika.counter-blessed-explosion"],
            presentation: {
              type: "dash-line",
              color: "56,189,248",
              width: 8,
              alpha: 0.52,
              duration: characterValue("attacks.counterBlessed.modules.1.duration")
            }
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "effectShape",
            visible: false,
            duration: characterValue("attacks.counterBlessed.modules.1.duration"),
            animation: {
              mode: "forward",
              distance: characterValue("attacks.counterBlessed.range"),
              easing: "linear",
              clipByMovementCollision: true
            },
            damage: {
              attackId: "attack.reika.counter-blessed",
              requireMovementExecution: true,
              movementStateKey: "movement:move",
              oncePerExecution: true,
              hitMode: "body-contact",
              contactRadius: 44,
              pathPresentation: {color: "56,189,248", width: 44, duration: 200},
              stopAfterFirstContact: false
            }
          },
          {type:"mode.toggle",when:"after-attack",stateKey:"reika-sword-rotation",values:["a","b"]}
        ],
        tags: ["반격"]
      },
      counterBlessedExplosion: {
        id: "attack.reika.counter-blessed-explosion",
        damageRatio: 2,
        cost: 0,
        cd: 0,
        range: 130,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counterBlessedExplosion.range"),
            wallPolicy: "block",
            render: false
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: characterValue("statusDefaults.burn.flat"),
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "refresh-type"
            },
            oncePerExecution: true
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            renderType: "annularDoubleSweep",
            position: "source",
            r: characterValue("attacks.counterBlessedExplosion.range"),
            inner: 0,
            span: 6.283185307179586,
            sweepCount: 1,
            sweepDirection: "clockwise",
            startAngleOffset: 3.141592653589793,
            sweepFraction: 0.75,
            fadePower: 1.35,
            hitColor: "56,189,248",
            fillAlpha: 0.2,
            strokeAlpha: 0.88,
            lineWidth: 2.5,
            edgeLine: false,
            duration: 300,
            animation: true,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.reika.lmb",
        input: "lmb",
        attackId: "attack.reika.lmb",
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
            {
              type: "action.attack",
              alternateWhen: {
                attackId: "attack.reika.lmb-blessed",
                conditions: [{type: "state.mode-is", stateKey: "reika-mode", value: "blessed", initial: "normal"}]
              }
            },
            {
              type: "action.trigger-attack",
              attackId: "attack.reika.lmb-wave",
              requireExecuted: true,
              requireAttackId: "attack.reika.lmb-blessed"
            }
          ]
        }
      },
      rmb: {
        id: "ability.reika.rmb",
        input: "rmb",
        attackId: "attack.reika.rmb-push",
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
              type: "preview.create",
              conditions: [
                {type: "state.mode-is", stateKey: "reika-mode", value: "normal", initial: "normal"},
                {type: "state.progress-lt", stateKey: "reika-gaho", value: 100}
              ],
              shape: "attack-shape",
              attackId: "attack.reika.rmb-push",
              duration: 300,
              followSource: true,
              aimMode: "live-source"
            },
            {
              type: "ability.lock",
              conditions: [
                {type: "state.mode-is", stateKey: "reika-mode", value: "normal", initial: "normal"},
                {type: "state.progress-lt", stateKey: "reika-gaho", value: 100}
              ],
              duration: 300
            },
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.reika.gaho-weapon",
                  conditions: [{type: "state.mode-is", stateKey: "reika-mode", value: "blessed", initial: "normal"}]
                },
                {
                  attackId: "attack.reika.gaho-activate",
                  conditions: [
                    {type: "state.mode-is", stateKey: "reika-mode", value: "normal", initial: "normal"},
                    {type: "state.progress-gte", stateKey: "reika-gaho", value: 100}
                  ]
                }
              ]
            },
            {
              type: "preview.create",
              shape: "attack-shape",
              attackId: "attack.reika.gaho-weapon",
              duration: 320,
              requireExecuted: true,
              requireAttackId: "attack.reika.gaho-weapon"
            },
            {
              type: "preview.create",
              shape: "attack-shape",
              attackId: "attack.reika.gaho-activate",
              duration: 500,
              requireAttackId: "attack.reika.gaho-activate"
            },
            {
              type: "effect.spawn",
              renderType: "areaCircle",
              position: "source",
              range: 180,
              color: "56,189,248",
              fillAlpha: 0.175,
              strokeAlpha: 0.665,
              lineWidth: 1.5,
              duration: 500,
              followSource: true,
              progressSweep: true,
              progressSweepDirection: "clockwise",
              scaleWithAttackRange: true,
              requireAttackId: "attack.reika.gaho-activate"
            },
            {
              type: "status.apply",
              status: "bind",
              duration: 500,
              sourceId: "ability.reika.rmb:gaho-bind",
              requireAttackId: "attack.reika.gaho-activate"
            },
            {
              type: "status.apply",
              status: "bind",
              duration: 510,
              sourceId: "ability.reika.rmb:gaho-airborne-bind",
              requireAttackId: "attack.reika.gaho-weapon"
            },
            {
              type: "modifier.set",
              stat: "evasionInvulnerable",
              value: 1,
              duration: 510,
              sourceId: "ability.reika.rmb:gaho-airborne-invulnerable",
              requireAttackId: "attack.reika.gaho-weapon"
            },

          ]
        }
      },
      counter: {
        id: "ability.reika.counter",
        input: "counter",
        attackId: "attack.reika.counter",
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
              alternateWhen: {
                attackId: "attack.reika.counter-blessed",
                conditions: [{type: "state.mode-is", stateKey: "reika-mode", value: "blessed", initial: "normal"}]
              },
              preview: {type: "preview.create", shape: "attack-shape"},
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
    statusDefaults: {burn: {flat: 50, interval: 500}}
  }
