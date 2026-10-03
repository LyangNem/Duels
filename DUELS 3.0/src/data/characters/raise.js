{
    id: "raise",
    name: "레이즈",
    englishName: "Raise",
    title: "격투 클럽의 이단자",
    color: "#bfa136",
    classification: {style: 4, range: 0, role: 1},
    stats: {maxHealth: 1100, speed: 4.25, radius: 20, baseDamage: 100, difficulty: 4},
    desc: "프로토타입 기계팔을 충전시켜 강력한 한방 공격을 구사하는 캐릭터",
    worldGaugeModules: [
      {
        type: "range.circle",
        range: 200,
        visibility: "owner",
        color: "#bfa136",
        alpha: 0.42,
        lineWidth: 1.5,
        dash: [5, 5]
      }
    ],
    tooltipSkills: [
      {key: "LMB NEAR", name: "수동 차징", attack: "lmb", text: "캐릭터 주변에서 클릭으로 파워 펀치 충전. 최대 {multiClickMax}회"},
      {
        key: "LMB FAR",
        name: "파워 펀치",
        attack: "lmb",
        costText: "스테미나 0",
        text: "캐릭터 멀리서 클릭으로 차징한 충전량에 비례해 피해 ({minDamage}~{maxDamage})"
      },
      {key: "RMB", name: "도약 내려치기", attack: "rmb", text: "조준 방향으로 도약 후 착지 지점 주변 적 기절"},
      {key: "L-Shift", name: "카운터 펀치", attack: "counter", text: "현재 파워 펀치 차징률에 비례해 범위와 피해 증가 ({minDamage}~{maxDamage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.raise.lmb",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 120,
        multiClick: {
          progressStateKey: "raise-punch-charge",
          lifetimeStateKey: "raise-punch-charge-window",
          idleStateKey: "raise-punch-idle-window",
          maxClicks: 15,
          maxWindow: 0,
          unlimitedWindow: true,
          activationRange: 200,
          releaseOnAimExit: false,
          fireOutsideAsMinimum: true,
          blockWhileDodging: true,
          blockWhileMovement: true,
          idleRelease: 0,
          holdAfterWindow: false,
          holdGrace: 0,
          fireOnMax: false,
          fireOnWindowEnd: false,
          cancelOnWindowEnd: false,
          inputSlot: "lmb",
          clickCost: 30,
          staminaCostSuffix: "",
          boostStateKey: "raise-punch-boost",
          preview: true,
          gauge: {
            timeArcMode: "progress-timed-remaining",
            timeColor: "225,235,255",
            chargeColor: "191,161,54",
            fullColor: "255,180,20",
            lineWidth: 3,
            fullLineWidth: 2.5
          }
        },
        progressScale: {
          stateKey: "raise-punch-charge",
          valueRange: {from: 1, to: 15},
          range: {from: characterValue("attacks.lmb.range"), to: 192},
          damageRatio: {from: characterValue("attacks.lmb.damageRatio"), to: 8},
          moduleValues: [
            {
              type: "delivery.area",
              property: "range",
              from: characterValue("attacks.lmb.progressScale.range.from"),
              to: characterValue("attacks.lmb.progressScale.range.to")
            },
            {type: "delivery.area", property: "halfWidth", from: 35, to: 56}
          ]
        },
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.lmb.range"),
            halfWidth: 35,
            wallPolicy: "block",
            contactType: "melee"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.raise.rmb",
        damageRatio: 0,
        cost: 550,
        cd: 900,
        range: 336,
        effectsOnly: true,
        modules: [
          {type: "trajectory.arc", height: 55, screenLiftRatio: 0.55, apexScale: 1, apexAlpha: 1, apexStrokeAlpha: 1},
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:raise-jump",
            direction: "target-point",
            distance: characterValue("attacks.rmb.range"),
            duration: 220,
            replaceActive: true,
            blocksAction: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            deferAttacksUntilEnd: false,
            onEndAttackIds: ["attack.raise.rmb-land"],
            tags: ["이동기"],
            presentation: false,
            buffs: [{type: "invulnerable", value: 1, duration: "movement"}]
          }
        ],
        tags: ["스킬"]
      },
      rmbLand: {
        id: "attack.raise.rmb-land",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 55,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.rmbLand.range"),
            wallPolicy: "ignore",
            targetRelations: ["enemy"],
            applyHitEffects: true
          },
          {type: "status.apply", status: "stun", duration: 1000, targetRelations: ["enemy"]},
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: characterValue("attacks.rmbLand.range"),
            r: 0,
            maxR: characterValue("attacks.rmbLand.range"),
            color: "191,161,54",
            fillAlpha: 0.12,
            strokeAlpha: 0.95,
            lineWidth: 2.5,
            durationFrames: 18,
            animation: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.raise.counter",
        damageRatio: 1,
        cost: 0,
        cd: 600,
        range: 80,
        progressScale: {
          stateKey: "raise-punch-charge",
          valueRange: {from: 0, to: 15},
          range: {from: characterValue("attacks.counter.range"), to: 320},
          damageRatio: {from: characterValue("attacks.counter.damageRatio"), to: 6},
          moduleValues: [
            {
              type: "delivery.area",
              property: "range",
              from: characterValue("attacks.counter.progressScale.range.from"),
              to: characterValue("attacks.counter.progressScale.range.to")
            }
          ]
        },
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {type: "state.progress", when: "after-attack", stateKey: "raise-punch-charge", operation: "reset"}
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.raise.lmb",
        input: "lmb",
        attackId: "attack.raise.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "combat.can-act"},
            {type: "combat.not-dodging"},
            {type: "movement.inactive"}
          ],
          modules: [{type: "multi-click.attack"}]
        }
      },
      rmb: {
        id: "ability.raise.rmb",
        input: "rmb",
        attackId: "attack.raise.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "combat.not-dodging"},
            {type: "movement.inactive"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.raise.counter",
        input: "counter",
        attackId: "attack.raise.counter",
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
