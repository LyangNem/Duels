{
    id: "kanon",
    name: "카논",
    englishName: "Kanon",
    title: "실전파 싸움꾼",
    color: "#c94141",
    classification: {style: 5, range: 0, role: 1},
    stats: {maxHealth: 1300, speed: 4.25, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "회피와 이어지는 공격의 조합으로 빠르게 공격권을 주도하는 캐릭터",
    dodgeFollowupState: {
      duration: 2000,
      movingStateKey: "kanon-dodge-moving",
      stoppedStateKey: "kanon-dodge-stopped",
      movingThreshold: 0.01
    },
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        visibility: "owner",
        height: 4,
        gap: 2,
        valueMode: "value",
        valueRef: {
          type: "action-state-choice",
          choices: [{stateKey: "kanon-dodge-moving", value: "moving"}, {stateKey: "kanon-dodge-stopped", value: "stopped"}]
        },
        segments: [{value: "moving", color: "#d94a4a"}, {value: "stopped", color: "#ff8a7a"}],
        background: "rgba(10,18,22,.92)",
        stroke: "rgba(255,255,255,.18)"
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "연타", attack: "lmb", text: "짧은 거리를 이동하며 전방을 타격. 적중 시 스테미나 회복하며 적을 넉백 ({damage})"},
      {
        key: "MOVING SPACE/LMB",
        name: "반동 펀치",
        attack: "lmbMoving",
        text: "이동 회피 이후 사용 시 짧은 거리를 이동하며 전방을 타격. 적중 시 스테미나 회복 ({damage})"
      },
      {
        key: "STOPPED SPACE/LMB",
        name: "끊어치기",
        attack: "lmbStopped",
        linkedAttack: "lmbStoppedSecond",
        text: "제자리 회피 이후 사용 시 짧은 거리를 이동하며 전방을 {hitCount}회 빠르게 타격. 적중 시 스테미나 회복 (타당 {damage})"
      },
      {key: "RMB", name: "발차기", attack: "rmb", text: "전방에 발차기하여 적중 시 {stunSeconds}초 기절 ({damage})"},
      {
        key: "MOVING SPACE/RMB",
        name: "파고들기",
        attack: "rmbMoving",
        text: "이동 회피 이후 사용 시 발차기를 날려 적중 시 {stunSeconds}초 기절 ({damage})"
      },
      {
        key: "STOPPED SPACE/RMB",
        name: "높이차기",
        attack: "rmbStopped",
        text: "제자리 회피 이후 사용 시 전방에 발차기를 날려 적중 시 {stunSeconds}초 기절 ({damage})"
      },
      {key: "L-Shift", name: "올려치기", attack: "counter", text: "전방을 강하게 타격 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.kanon.lmb",
        damageRatio: 1,
        cost: 0,
        cd: 280,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.lmb.range"),
            halfWidth: 60,
            wallPolicy: "block"
          },
          {
            type: "movement.move",
            when: "after-attack",
            direction: "attack",
            distance: 45,
            duration: 90,
            replaceActive: true,
            collision: {passWalls: false, passEnemies: true},
            tags: ["이동기"]
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "source",
            amount: 100,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      lmbMoving: {
        id: "attack.kanon.recoil",
        damageRatio: 1,
        cost: 0,
        cd: 320,
        range: 180,
        effectsOnly: true,
        modules: [
          {type: "movement.cancel-dodge", when: "after-attack"},
          {
            type: "movement.move",
            when: "after-attack",
            direction: "attack",
            distance: 45,
            duration: 90,
            replaceActive: true,
            cancelDodgeState: true,
            collision: {passWalls: false, passEnemies: true},
            tags: ["이동기"]
          }
        ],
        tags: ["평타"]
      },
      lmbMovingHit: {
        id: "attack.kanon.recoil-hit",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.lmbMovingHit.range"),
            halfWidth: 60,
            wallPolicy: "block",
            suppressHitImpactRing: true
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "source",
            amount: 100,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      lmbStopped: {
        id: "attack.kanon.cut",
        damageRatio: 1,
        cost: 0,
        cd: 360,
        range: 186,
        modules: [
          {type: "movement.cancel-dodge", when: "after-attack"},
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.lmbStopped.range"),
            halfWidth: 60,
            wallPolicy: "block"
          },
          {
            type: "movement.move",
            when: "after-attack",
            direction: "attack",
            distance: 35,
            duration: 70,
            replaceActive: true,
            cancelDodgeState: true,
            collision: {passWalls: false, passEnemies: true},
            tags: ["이동기"]
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "source",
            amount: 100,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      lmbStoppedSecond: {
        id: "attack.kanon.cut-second",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 186,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.lmbStoppedSecond.range"),
            halfWidth: 60,
            wallPolicy: "block"
          },
          {
            type: "movement.move",
            when: "after-attack",
            direction: "attack",
            distance: 35,
            duration: 70,
            replaceActive: true,
            collision: {passWalls: false, passEnemies: true},
            tags: ["이동기"]
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "source",
            amount: 100,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.kanon.kick",
        damageRatio: 2,
        cost: 200,
        cd: 1000,
        range: 192,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.rmb.range"),
            halfWidth: 44,
            wallPolicy: "block"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "attack",
            distance: 60,
            speed: 10,
            oncePerExecution: true
          },
          {type: "status.apply", when: "on-hit", target: "hit-target", status: "stun", duration: 250}
        ],
        tags: ["스킬"]
      },
      rmbMoving: {
        id: "attack.kanon.dive-kick",
        damageRatio: 2,
        cost: 200,
        cd: 1000,
        range: 153.6,
        modules: [
          {type: "movement.cancel-dodge", when: "after-attack"},
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.rmbMoving.range"),
            halfWidth: 44,
            wallPolicy: "block"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "attack",
            distance: 80,
            speed: 11,
            oncePerExecution: true
          },
          {type: "status.apply", when: "on-hit", target: "hit-target", status: "stun", duration: 500}
        ],
        tags: ["스킬"]
      },
      rmbStopped: {
        id: "attack.kanon.high-kick",
        damageRatio: 2,
        cost: 200,
        cd: 1000,
        range: 230.4,
        modules: [
          {type: "movement.cancel-dodge", when: "after-attack"},
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.rmbStopped.range"),
            halfWidth: 44,
            wallPolicy: "block"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "attack",
            distance: 50,
            speed: 10,
            oncePerExecution: true
          },
          {type: "status.apply", when: "on-hit", target: "hit-target", status: "stun", duration: 750}
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.kanon.counter",
        damageRatio: 3,
        cost: 0,
        cd: 350,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("attacks.counter.range"),
            halfWidth: 38,
            wallPolicy: "block"
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.kanon.lmb",
        input: "lmb",
        attackId: "attack.kanon.lmb",
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
              alternates: [
                {attackId: "attack.kanon.recoil", stateKey: "kanon-dodge-moving", consume: true},
                {attackId: "attack.kanon.cut", stateKey: "kanon-dodge-stopped", consume: true}
              ]
            },
            {type: "timing.delay", duration: 90, aimMode: "locked", requireAttackId: "attack.kanon.recoil"},
            {
              type: "action.trigger-attack",
              attackId: "attack.kanon.recoil-hit",
              requireAttackId: "attack.kanon.recoil",
              explicitNetworkReplay: true
            },
            {type: "timing.delay", duration: 95, aimMode: "live-source", requireAttackId: "attack.kanon.cut"},
            {
              type: "action.trigger-attack",
              attackId: "attack.kanon.cut-second",
              requireAttackId: "attack.kanon.cut",
              explicitNetworkReplay: true
            }
          ]
        }
      },
      rmb: {
        id: "ability.kanon.rmb",
        input: "rmb",
        attackId: "attack.kanon.kick",
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
                {attackId: "attack.kanon.dive-kick", stateKey: "kanon-dodge-moving", consume: true},
                {attackId: "attack.kanon.high-kick", stateKey: "kanon-dodge-stopped", consume: true}
              ]
            }
          ]
        }
      },
      counter: {
        id: "ability.kanon.counter",
        input: "counter",
        attackId: "attack.kanon.counter",
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
