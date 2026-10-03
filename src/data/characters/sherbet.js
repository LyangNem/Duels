{
    id: "sherbet",
    name: "샤베트",
    englishName: "Sherbet",
    title: "아이스크림 애호가",
    color: "#f2d98a",
    classification: {style: 5, range: 2, role: 5},
    stats: {maxHealth: 1300, speed: 4, radius: 20, baseDamage: 100, difficulty: 4},
    desc: "적을 빙결시키고 강제로 해제시키며 피해를 주는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.arc",
        visibility: "owner",
        valueRef: {type: "timed-action-progress", stateKey: "sherbet-overcool-window"},
        color: characterValue("color"),
        colorVariants: [
          {
            color: "#7aeeff",
            conditions: [
              {
                type: "state.timed-data-equals",
                stateKey: "sherbet-overcool-window",
                key: "result",
                value: "success"
              }
            ]
          },
          {
            color: "#7aeeff",
            conditions: [
              {
                type: "state.timed-elapsed-between",
                stateKey: "sherbet-overcool-window",
                min: 250,
                max: 300,
                activeOnly: true
              }
            ]
          }
        ],
        lineWidth: 3,
        maxChargeFlash: true,
        showEmpty: true,
        conditions: [
          {type: "state.exists", stateKey: "sherbet-overcool-window"}
        ]
      }
    ],
    tooltipSkills: [
      {
        key: "LMB",
        name: "과냉각",
        attack: "lmb",
        costText: "스테미나 150",
        text: "선딜레이 후 피해. 게이지가 채워지기 직전에 재사용 시 전방의 적을 과냉각시켜 빙결 (100/200)"
      },
      {
        key: "RMB",
        name: "분쇄",
        attack: "rmb",
        text: "날카로운 냉기를 내보내 피해. 빙결 상태의 적에게 적중 시 빙결을 강제로 해제하며 높은 피해 (100/400)"
      },
      {
        key: "L-Shift",
        name: "냉기",
        attack: "counter",
        text: "전방으로 냉기를 날려 적중한 적에게 피해를 주고 빙결 ({damage})"
      }
    ],
    attacks: {
      lmbWindup: {
        id: "attack.sherbet.lmb-windup",
        damageRatio: 0,
        cost: 150,
        cd: 500,
        attackDelayGroup: "sherbet-lmb",
        attackDelay: 500,
        range: 294,
        effectsOnly: true,
        modules: [
          {
            type: "state.window",
            when: "after-attack",
            stateKey: "sherbet-overcool-window",
            duration: 300,
            retainCompleteMs: 500,
            data: {choice: "normal", result: "failed"},
            captureAngle: true,
            resolveDataKey: "choice",
            previewAttackIds: {
              normal: "attack.sherbet.lmb",
              success: "attack.sherbet.lmb-frozen"
            },
            resolveAimMode: "live-source",
            resolveAttackIds: {
              normal: "attack.sherbet.lmb",
              success: "attack.sherbet.lmb-frozen"
            }
          }
        ],
        tags: ["평타", "선딜레이"]
      },
      lmb: {
        id: "attack.sherbet.lmb",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 294,
        halfWidth: 52,
        travelSpeed: 3000,
        previewGeometry: {
          shape: "rect",
          range: characterValue("attacks.lmb.range"),
          halfWidth: characterValue("attacks.lmb.halfWidth"),
          wallPolicy: "block"
        },
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "source",
            range: characterValue("attacks.lmb.range"),
            halfWidth: characterValue("attacks.lmb.halfWidth"),
            growthSpeed: 1,
            travelSpeed: characterValue("attacks.lmb.travelSpeed"),
            animation: true,
            clipToAttackArea: true,
            color: characterValue("color"),
            strokeColor: characterValue("color"),
            fillAlpha: 0.18,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            endCap: true,
            duration: 220,
            damage: {
              attackId: "attack.sherbet.lmb",
              hitMode: "progressive-rect",
              module: {
                type: "delivery.area",
                contactType: "melee",
                shape: "rect",
                range: 294,
                halfWidth: 52,
                wallPolicy: "block"
              }
            }
          }
        ],
        tags: ["평타"]
      },
      lmbFrozen: {
        id: "attack.sherbet.lmb-frozen",
        damageRatio: 2,
        cost: 0,
        cd: 0,
        range: 294,
        halfWidth: 52,
        travelSpeed: 3000,
        previewGeometry: {
          shape: "rect",
          range: characterValue("attacks.lmbFrozen.range"),
          halfWidth: characterValue("attacks.lmbFrozen.halfWidth"),
          wallPolicy: "block"
        },
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "source",
            range: characterValue("attacks.lmbFrozen.range"),
            halfWidth: characterValue("attacks.lmbFrozen.halfWidth"),
            growthSpeed: 1,
            travelSpeed: characterValue("attacks.lmbFrozen.travelSpeed"),
            animation: true,
            clipToAttackArea: true,
            color: "#7aeeff",
            strokeColor: "#7aeeff",
            fillAlpha: 0.2,
            strokeAlpha: 0.98,
            lineWidth: 2.7,
            endCap: true,
            duration: 220,
            damage: {
              attackId: "attack.sherbet.lmb-frozen",
              hitMode: "progressive-rect",
              module: {
                type: "delivery.area",
                contactType: "melee",
                shape: "rect",
                range: 294,
                halfWidth: 52,
                wallPolicy: "block"
              }
            }
          },
          {
            type: "status.apply",
            status: "freeze",
            duration: 500,
            data: {
              stackMode: "replace-source",
              ratio: characterValue("statusDefaults.freeze.ratio"),
              interval: characterValue("statusDefaults.freeze.interval")
            }
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.sherbet.rmb",
        damageRatio: 1,
        frozenDamageMultiplier: 4,
        cost: 300,
        cd: 900,
        range: 500,
        halfWidth: 52,
        travelSpeed: 4500,
        previewGeometry: {
          shape: "rect",
          range: characterValue("attacks.rmb.range"),
          halfWidth: characterValue("attacks.rmb.halfWidth"),
          wallPolicy: "block"
        },
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "progressRect",
            position: "source",
            range: characterValue("attacks.rmb.range"),
            halfWidth: characterValue("attacks.rmb.halfWidth"),
            growthSpeed: 1,
            travelSpeed: characterValue("attacks.rmb.travelSpeed"),
            animation: true,
            clipToAttackArea: true,
            color: characterValue("color"),
            strokeColor: characterValue("color"),
            fillAlpha: 0.18,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            endCap: true,
            duration: 240,
            damage: {
              attackId: "attack.sherbet.rmb",
              hitMode: "progressive-rect",
              module: {
                type: "delivery.area",
                shape: "rect",
                range: characterValue("attacks.rmb.range"),
                halfWidth: characterValue("attacks.rmb.halfWidth"),
                wallPolicy: "block"
              }
            }
          },
          {
            type: "effect.spawn",
            when: "on-hit",
            renderType: "hitImpactRing",
            position: "target",
            r: 10,
            maxR: 48,
            color: "#7aeeff",
            strokeAlpha: 0.95,
            lineWidth: 3,
            duration: 180,
            animation: true,
            oncePerExecution: true,
            conditions: [
              {type: "target.status-active-before-hit", status: "freeze"}
            ]
          },
          {
            type: "damage.target-status-multiplier",
            status: "freeze",
            multiplier: characterValue("attacks.rmb.frozenDamageMultiplier")
          },
          {
            type: "status.clear",
            status: "freeze",
            triggerRelease: true,
            oncePerExecution: true,
            conditions: [
              {type: "target.status-active-before-hit", status: "freeze"}
            ]
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.sherbet.counter",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 720,
        projectileRadius: 18,
        projectileSpeed: 16,
        freezeDuration: 1000,
        previewGeometry: {
          shape: "rect",
          range: characterValue("attacks.counter.range"),
          halfWidth: 140,
          wallPolicy: "ignore"
        },
        modules: [
          {type: "pattern.scatter", count: 13, spread: 0},
          {
            type: "delivery.projectile",
            radius: characterValue("attacks.counter.projectileRadius"),
            hitRadius: characterValue("attacks.counter.projectileRadius"),
            speed: characterValue("attacks.counter.projectileSpeed"),
            applyHitEffects: true
          },
          {
            type: "delivery.delayed-projectile-volley",
            count: 1,
            interval: 0,
            aimMode: "locked",
            perVolleyPellets: true,
            perpendicularOffset: 120
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {
            type: "projectile.presentation",
            kind: "diamond",
            style: {
              radius: characterValue("attacks.counter.projectileRadius"),
              color: "255,248,196",
              innerColor: characterValue("color")
            }
          },
          {type: "hit.once-per-execution"}
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.sherbet.lmb",
        input: "lmb",
        attackId: "attack.sherbet.lmb-windup",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "combat.can-act"}
          ],
          modules: [
            {
              type: "state.window",
              operation: "select",
              stateKey: "sherbet-overcool-window",
              data: {choice: "success", result: "success"},
              stopOnHandled: true,
              conditions: [
                {
                  type: "state.timed-elapsed-between",
                  stateKey: "sherbet-overcool-window",
                  min: 250,
                  max: 300,
                  activeOnly: true
                }
              ]
            },
            {
              type: "state.window",
              operation: "select",
              stateKey: "sherbet-overcool-window",
              stopOnHandled: true,
              conditions: [
                {type: "state.exists", stateKey: "sherbet-overcool-window", activeOnly: true}
              ]
            },
            {type: "action.attack"}
          ]
        }
      },
      rmb: {
        id: "ability.sherbet.rmb",
        input: "rmb",
        attackId: "attack.sherbet.rmb",
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
        id: "ability.sherbet.counter",
        input: "counter",
        attackId: "attack.sherbet.counter",
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
                type: "status.apply",
                status: "freeze",
                duration: characterValue("attacks.counter.freezeDuration"),
                data: {
                  ratio: characterValue("statusDefaults.freeze.ratio"),
                  interval: characterValue("statusDefaults.freeze.interval")
                }
              }
            }
          ]
        }
      }
    },
    statusDefaults: {freeze: {ratio: 0.05, interval: 1000}}
  }
