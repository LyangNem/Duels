{
    id: "shairaz",
    name: "샤이라즈",
    title: "고요한 사냥꾼",
    color: "#78909c",
    classification: {style: 8, range: 0, role: 5},
    stats: {maxHealth: 1500, speed: 3.75, radius: 20, baseDamage: 70, difficulty: 4},
    desc: "트랩으로 적을 기절시키고 일방적으로 공격하는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        valueMode: "count",
        valueRef: {type: "field-count", stateKey: "shairaz-trap"},
        segments: [{value: 1, color: "#78909c"}, {value: 2, color: "#78909c"}, {value: 3, color: "#78909c"}],
        visibility: "owner",
        height: 4,
        gap: 2
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "소드오프", attack: "lmb", text: "소드오프 {pellets}발 발사 (탄당 {damage})"},
      {
        key: "RMB",
        name: "덫",
        attack: "rmb",
        linkedAttack: "trapTrigger",
        text: "사거리 내 지정 지점에 최대 {maxInstances}개의 덫 설치. 적이 밟을 시 즉시 피해 및 {linkedStunSeconds}초 기절 ({linkedDamage})"
      },
      {
        key: "RMB RECALL",
        name: "회수",
        attack: "rmbRecall",
        referenceAttack: "rmb",
        text: "지정 지점의 덫 제거 후 설치 비용의 {restoreCostPercent}% 스테미나 회복"
      },
      {
        key: "L-Shift",
        name: "추가 덫",
        attack: "counter",
        linkedAttack: "trapTrigger",
        text: "전방으로 덫 투척. 미적중 시 착탄 지점에 덫 설치 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.shairaz.lmb",
        damageRatio: 1,
        cost: 250,
        cd: 500,
        range: 220,
        modules: [{type: "pattern.scatter", count: 7, spread: 0.55}, {type: "delivery.projectile", speed: 18, radius: 8}],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.shairaz.rmb",
        damageRatio: 0,
        cost: 600,
        cd: 400,
        range: 450,
        presentation: {teamColor: true},
        modules: [
          {
            type: "field.area",
            stateKey: "shairaz-trap",
            attackId: "attack.shairaz.trap-trigger",
            triggerResolveRangeFromAttack: true,
            anchorMode: "target-point",
            clampToAttackRange: true,
            shape: "circle",
            range: 39,
            duration: "infinite",
            armDelay: 500,
            triggerResolveRange: 78,
            maxInstances: 3,
            targetRelations: ["enemy"],
            intervalMode: "per-target",
            interval: 0,
            triggerOnEnter: true,
            removeOnTrigger: true,
            wallPolicy: "ignore",
            presentation: {
              type: "areaCircle",
              teamColor: true,
              managedTrap: true,
              visibilityPolicy: "friendly-only",
              ownerLink: true,
              ownerIndexLabel: true,
              revealBrighten: 0.55,
              triggerColor: "#78909c",
              detonationColor: "#78909c",
              detonationDuration: 1500,
              detonationFadeOut: true
            }
          }
        ],
        tags: ["스킬"]
      },
      trapTrigger: {
        id: "attack.shairaz.trap-trigger",
        damageRatio: 2.142857142857143,
        cost: 0,
        cd: 0,
        range: 78,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.trapTrigger.range"),
            wallPolicy: "ignore"
          },
          {type: "status.apply", status: "stun", duration: 1250, oncePerExecution: false}
        ],
        tags: ["스킬", "덫 발동"]
      },
      rmbRecall: {
        id: "attack.shairaz.rmb-recall",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        attackDelayGroup: "shairaz-rmb-recall",
        attackDelay: 400,
        range: 450,
        modules: [
          {
            type: "field.area",
            stateKey: "shairaz-trap",
            anchorMode: "target-point",
            clampToAttackRange: true,
            shape: "circle",
            range: 39,
            removeOwnedAtTarget: true,
            removeOnly: true,
            removeTargetRadius: 39,
            wallPolicy: "ignore"
          },
          {type: "resource.restore", resource: "stamina", recipient: "source", amount: 300}
        ],
        tags: ["스킬"]
      },
      rmbCounterRecall: {
        id: "attack.shairaz.rmb-counter-recall",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        attackDelayGroup: "shairaz-rmb-recall",
        attackDelay: 400,
        range: 450,
        modules: [
          {
            type: "field.area",
            stateKey: "shairaz-counter-trap",
            anchorMode: "target-point",
            clampToAttackRange: true,
            shape: "circle",
            range: 39,
            removeOwnedAtTarget: true,
            removeOnly: true,
            removeTargetRadius: 39,
            wallPolicy: "ignore"
          },
          {type: "resource.restore", resource: "stamina", recipient: "source", amount: 300}
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.shairaz.counter",
        damageRatio: 2.142857142857143,
        damageRatioRefAttackId: "attack.shairaz.trap-trigger",
        cost: 0,
        cd: 300,
        range: 450,
        presentation: {teamColor: true},
        modules: [
          {type: "delivery.projectile", speed: 18, radius: 39, wallCollisionMode: "center"},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            teamColor: true,
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.counter.modules.0.radius"),
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 19.5,
              showLink: false
            }
          },
          {
            type: "projectile.impact",
            field: {
              type: "field.area",
              stateKey: "shairaz-counter-trap",
              attackId: "attack.shairaz.trap-trigger",
              triggerResolveRangeFromAttack: true,
              reasons: ["wall", "boundary", "range"],
              shape: "circle",
              range: 39,
              duration: "infinite",
              armDelay: 500,
              triggerResolveRange: 78,
              targetRelations: ["enemy"],
              intervalMode: "per-target",
              interval: 0,
              triggerOnEnter: true,
              removeOnTrigger: true,
              wallPolicy: "ignore",
              presentation: {
                type: "areaCircle",
                teamColor: true,
                managedTrap: true,
                visibilityPolicy: "friendly-only",
                revealBrighten: 0.55,
                triggerColor: "#78909c",
                detonationColor: "#78909c",
                detonationDuration: 1500,
                detonationFadeOut: true
              }
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.shairaz.lmb",
        input: "lmb",
        attackId: "attack.shairaz.lmb",
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
        id: "ability.shairaz.rmb",
        input: "rmb",
        attackId: "attack.shairaz.rmb",
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
          modules: [
            {
              type: "action.attack",
              alternates: [
                {
                  attackId: "attack.shairaz.rmb-recall",
                  conditions: [{type: "field.at-target", stateKey: "shairaz-trap", radius: 39, excludePending: true}]
                },
                {
                  attackId: "attack.shairaz.rmb-counter-recall",
                  conditions: [{type: "field.at-target", stateKey: "shairaz-counter-trap", radius: 39, excludePending: true}]
                }
              ]
            }
          ]
        }
      },
      counter: {
        id: "ability.shairaz.counter",
        input: "counter",
        attackId: "attack.shairaz.counter",
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
              ccRefAttackId: "attack.shairaz.trap-trigger",
              cc: {type: "status.apply", status: "stun", duration: 1250, oncePerExecution: true}
            }
          ]
        }
      }
    }
  }
