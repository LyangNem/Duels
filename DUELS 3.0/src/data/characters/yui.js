{
    id: "yui",
    name: "유이",
    englishName: "Yui",
    title: "무감정 소녀",
    color: "#6e97ff",
    classification: {style: 2, range: 0, role: 6},
    stats: {maxHealth: 900, speed: 4.25, radius: 20, baseDamage: 300, difficulty: 6},
    desc: "무한히 스테미나를 복원하며 텔레포트로 적에게 혼란을 주는 캐릭터",
    temporalMemory: {
      stateKey: "yui-rewind",
      sampleInterval: 30,
      maxDuration: 3500,
      rewindTime: 3000,
      resources: ["stamina"],
      color: "#6e97ff"
    },
    tooltipSkills: [
      {key: "LMB", name: "텔레포트 단검", attack: "lmb", text: "전방 부채꼴 베기. 적중 시 조준 방향으로 순간이동 ({damage})"},
      {key: "RMB", name: "공간 역행", attack: "rmb", text: "{rewindSeconds}초 전의 위치로 되돌아가며 해당 시점으로 스테미나 복원"},
      {key: "L-Shift", name: "순간이동 베기", attack: "counter", text: "전방으로 순간이동하며 경로상 적 피해 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.yui.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 400,
        range: 120,
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.0471975511965976,
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            renderType: "arcSweep",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            animateSweep: true,
            sweepSpeed: 6.6666667,
            sweepDirection: "counterclockwise",
            edgeLine: true,
            edgeColor: "255,255,255",
            edgeAlpha: 0.95,
            edgeLineWidth: 2.5,
            color: "110,151,255",
            fillAlpha: 0.22,
            strokeAlpha: 0.9,
            lineWidth: 2,
            durationFrames: 25,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            scaleWithAttackRange: true
          },
          {
            type: "movement.move",
            when: "on-hit",
            target: "attack-direction",
            distance: 192,
            duration: 1,
            oncePerExecution: true,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            tags: ["이동기"],
            presentation: {type: "dash-line", color: "110,151,255", width: 6, alpha: 0.4, duration: 167}
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.yui.rmb",
        damageRatio: 0,
        cost: 600,
        cd: 500,
        range: 0,
        effectsOnly: true,
        modules: [],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.yui.counter",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 320,
        effectsOnly: false,
        previewGeometry: {shape: "rect", range: characterValue("attacks.counter.range"), halfWidth: 40, wallPolicy: "ignore"},
        modules: [
          {
            type: "movement.move",
            speedMultiplier: 1.35,
            direction: "attack",
            distance: characterValue("attacks.counter.range"),
            duration: 1,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            tags: ["이동기"]
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "effectShape",
            visible: false,
            duration: 16.6667,
            animation: {
              mode: "forward",
              distance: characterValue("attacks.counter.range"),
              easing: "linear",
              clipByMovementCollision: true
            },
            damage: {
              attackId: "attack.yui.counter",
              requireMovementExecution: true,
              movementStateKey: "movement:move",
              oncePerExecution: true,
              hitMode: "body-contact",
              contactRadius: 40,
              pathPresentation: {width: 40, duration: 200},
              stopAfterFirstContact: false
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.yui.lmb",
        input: "lmb",
        attackId: "attack.yui.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "cooldowns.ready", attackIds: ["attack.yui.lmb"]},
            {type: "resource.gte", resource: "stamina", value: characterValue("attacks.lmb.cost")}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      rmb: {
        id: "ability.yui.rmb",
        input: "rmb",
        attackId: "attack.yui.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "cooldowns.ready", attackIds: ["attack.yui.rmb"]},
            {type: "resource.gte", resource: "stamina", value: characterValue("attacks.rmb.cost")}
          ],
          modules: [
            {type: "context.temporal-snapshot", rewindTime: 3000},
            {type: "action.attack"},
            {
              type: "movement.move",
              requireExecuted: true,
              stateKey: "movement:move",
              direction: "target-point",
              replaceActive: true,
              duration: 1,
              collision: {passWalls: true, passEnemies: true},
              resolveOverlapOnEnd: true,
              tags: ["이동기"]
            },
            {type: "resource.restore-snapshot", resource: "stamina", requireExecuted: true},
            {
              type: "effect.spawn",
              requireExecuted: true,
              position: "rewind-path",
              renderType: "temporalRewind",
              durationFrames: 18,
              ringColor: "180,210,255",
              fillColor: "69,122,255",
              strokeColor: "130,170,255"
            }
          ]
        }
      },
      counter: {
        id: "ability.yui.counter",
        input: "counter",
        attackId: "attack.yui.counter",
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
