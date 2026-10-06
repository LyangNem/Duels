{
    id: "sherina",
    name: "셰리나 비아",
    englishName: "Sherina Via",
    title: "엘프의 희망",
    color: "#6a36c9",
    classification: {style: 8, range: 0, role: 2},
    stats: {maxHealth: 1000, speed: 3.75, radius: 20, baseDamage: 200, difficulty: 1},
    extraTags: ["차징형"],
    desc: "소리의 잔향을 이용해 공간을 장악하는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB HOLD",
        name: "소리의 활",
        attack: "lmb",
        text: "최대 {chargeSeconds}초 차징. 차징률에 비례해 사거리 {chargeRangeMinPercent}%~{chargeRangeMaxPercent}% 증가 ({damage})"
      },
      {
        key: "LMB REVERB",
        name: "잔향",
        attack: "echoTick",
        fieldAttack: "lmb",
        text: "소리가 지나간 경로에 {fieldSeconds}초간 에코 생성. 밟을 시 {fieldIntervalSeconds}초마다 피해 ({damage})"
      },
      {key: "RMB", name: "더블링", attack: "rmb", text: "최근 에코 경로 {recentPathLimit}개의 잔향 범위를 확장"},
      {key: "L-Shift", name: "멀티샷", attack: "counter", text: "화살 {pellets}발을 동시에 발사하며 각 경로에 에코 생성 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.sherina.lmb",
        damageRatio: 1.25,
        cost: 100,
        cd: 350,
        range: 798,
        charge: {
          duration: 700,
          costMin: 100,
          costMax: 200,
          costTiming: "during-charge",
          staminaRegenDuringCharge: false,
          range: {from: 159.6, to: 798},
          gauge: true,
          preview: true
        },
        modules: [
          {type: "delivery.projectile", speed: 28, radius: 10},
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.impact",
            resolveOnGuard: true,
            field: {
              type: "field.area",
              stateKey: "sherina-lmb-echo",
              anchorMode: "projectile-path",
              liveProjectilePath: true,
              shape: "rect",
              halfWidth: 18,
              wallPolicy: "ignore",
              duration: 2500,
              pathTimeline: {revealRatio: 0.1, fadeStart: 0.75},
              retainRecentPath: true,
              recentPathLimit: 3,
              damageStackGroup: "sherina-echo-damage",
              attackId: "attack.sherina.echo-tick",
              damageOnTrigger: true,
              targetRelations: ["enemy"],
              interval: 500,
              intervalMode: "per-target",
              triggerOnEnter: false,
              removeOnTrigger: false,
              reasons: ["wall", "boundary", "range", "guard"],
              presentation: {
                type: "progressRect",
                color: "120,0,200",
                strokeColor: "180,80,255",
                fillAlpha: 0.2,
                strokeAlpha: 0.9,
                lineWidth: 1.5,
                fullLength: true,
                fadeOut: true
              }
            }
          }
        ],
        tags: ["평타"]
      },
      echoTick: {id: "attack.sherina.echo-tick", damageRatio: 0.75, cost: 0, cd: 0, range: 0, modules: [], tags: ["평타"]},
      rmb: {
        id: "attack.sherina.rmb",
        damageRatio: 0,
        cost: 500,
        cd: 700,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: 72,
            r: 72,
            color: "100,0,180",
            fillAlpha: 0.04,
            strokeAlpha: 0.82,
            lineWidth: 2.5,
            durationFrames: 20
          }
        ],
        tags: ["스킬"]
      },
      rmbEchoTick: {id: "attack.sherina.rmb-echo-tick", damageRatio: 1, cost: 0, cd: 0, range: 0, modules: [], tags: ["스킬"]},
      counter: {
        id: "attack.sherina.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 300,
        range: 798,
        previewProjectilePaths: true,
        modules: [
          {type: "delivery.projectile", speed: 28, radius: 10},
          {type: "pattern.scatter", count: 3, spread: 0.9424777960769379},
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.impact",
            resolveOnGuard: true,
            field: {
              type: "field.area",
              stateKey: "sherina-counter-echo",
              anchorMode: "projectile-path",
              liveProjectilePath: true,
              shape: "rect",
              halfWidth: 18,
              wallPolicy: "ignore",
              duration: 2500,
              pathTimeline: {revealRatio: 0.1, fadeStart: 0.75},
              damageStackGroup: "sherina-echo-damage",
              attackId: "attack.sherina.counter-echo-tick",
              damageOnTrigger: true,
              targetRelations: ["enemy"],
              interval: 500,
              intervalMode: "per-target",
              triggerOnEnter: false,
              removeOnTrigger: false,
              reasons: ["wall", "boundary", "range", "guard"],
              presentation: {
                type: "progressRect",
                color: "120,0,200",
                strokeColor: "180,80,255",
                fillAlpha: 0.2,
                strokeAlpha: 0.9,
                lineWidth: 1.5,
                fullLength: true
              }
            }
          }
        ],
        tags: ["반격"]
      },
      counterEchoTick: {
        id: "attack.sherina.counter-echo-tick",
        damageRatio: 0.75,
        cost: 0,
        cd: 0,
        range: 0,
        modules: [],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.sherina.lmb",
        input: "lmb",
        attackId: "attack.sherina.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "state.absent", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.start", stateKey: "charge:primary"}]
        },
        releaseTrigger: {
          type: "trigger",
          event: "input.release",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "state.exists", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.release", stateKey: "charge:primary"}]
        }
      },
      rmb: {
        id: "ability.sherina.rmb",
        input: "rmb",
        attackId: "attack.sherina.rmb",
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
            {type: "action.attack"},
            {
              type: "field.expand-recent",
              sourceStateKey: "sherina-lmb-echo",
              outputStateKey: "sherina-rmb-echo",
              maxCount: 3,
              halfWidthMultiplier: 2.5,
              duration: 3800,
              revealSpeed: 28,
              fadeStart: 0.75,
              interval: 500,
              triggerOnEnter: true,
              damageStackGroup: "sherina-echo-damage",
              attackId: "attack.sherina.rmb-echo-tick",
              presentation: {
                type: "progressRect",
                color: "120,0,200",
                strokeColor: "180,80,255",
                fillAlpha: 0.24,
                strokeAlpha: 0.95,
                lineWidth: 2,
                fullLength: true,
                fadeOut: true
              },
              requireExecuted: true
            }
          ]
        }
      },
      counter: {
        id: "ability.sherina.counter",
        input: "counter",
        attackId: "attack.sherina.counter",
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
              charge: {duration: 300, range: {from: 0, to: 798}},
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
