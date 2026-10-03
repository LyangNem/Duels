{
    id: "sya",
    name: "스야",
    englishName: "Sya",
    title: "안개 속 움직임",
    color: "#0000ad",
    classification: {style: 1, range: 0, role: 6},
    stats: {maxHealth: 900, speed: 4.5, radius: 20, baseDamage: 250, difficulty: 4},
    desc: "은신으로 기습해 빠르게 쏟아붓고 빠져나오는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        valueMode: "count",
        valueRef: {
          type: "limited-use-buff-remaining",
          stateKey: "stealth:sya:attack-boost"
        },
        segmentCountRef: {
          type: "limited-use-buff-maximum",
          stateKey: "stealth:sya:attack-boost",
          fallbackPath: "abilities.rmb.trigger.modules.0.attackBoost.uses"
        },
        segmentColor: "#0000ad",
        visibility: "owner",
        height: 4,
        gap: 2,
        activeAlpha: 0.95,
        background: "rgba(10,18,22,0.92)",
        stroke: "rgba(0,0,173,0.40)",
        conditions: [
          {type: "state.exists", stateKey: "stealth:sya:attack-boost"}
        ]
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "대낫베기", attack: "lmb", text: "대낫 횡베기 ({damage})"},
      {
        key: "RMB RANGED",
        name: "서리안개 은신",
        attack: "rmb",
        costText: "스테미나 {skillCost}~{stealthMaxStaminaCost}",
        text: "최대 {stealthDurationSeconds}초 동안 이동속도 {stealthSpeedPercent}% 증가 및 벽 통과. 지속시간동안 스테미나를 소모하며 재사용 시 해제"
      },
      {
        key: "RMB MELEE",
        name: "안개 기습",
        attack: "rmb",
        costText: "스테미나 0",
        text: "은신 중 적이 근접하면 은신을 해제하고 주변 적 {stealthFreezeSeconds}초 빙결. 다음 평타 {stealthBoostCount}회 공격속도 증가"
      },
      {key: "L-Shift", name: "서리폭풍 베기", attack: "counter", text: "주변 원형 베기. 적중 시 {freezeSeconds}초 빙결 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.sya.lmb",
        damageRatio: 1,
        cost: 250,
        cd: 600,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.15,
            contactType: "melee",
            wallPolicy: "block"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.lmb.range"),
            halfAngle: characterValue("attacks.lmb.modules.0.halfAngle"),
            animateSweep: true,
            sweepSpeed: 1.7,
            animation: true,
            color: "40,80,255",
            fillAlpha: 0.2,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            edgeLine: true,
            edgeColor: "110,150,255",
            edgeAlpha: 0.75,
            edgeLineWidth: 3,
            durationFrames: 10,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            drawsClippedOutline: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.sya.rmb",
        damageRatio: 0,
        cost: 400,
        cd: 300,
        range: 0,
        effectsOnly: true,
        modules: [],
        tags: ["스킬"]
      },
      stealthFreeze: {
        id: "attack.sya.stealth-freeze",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 130,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.stealthFreeze.range"),
            wallPolicy: "ignore"
          },
          {
            type: "hit.sequence",
            oncePerExecution: false,
            steps: [
              {
                delay: 0,
                modules: [
                  {
                    type: "status.apply",
                    target: "hit-target",
                    status: "freeze",
                    duration: 500,
                    sourceId: "attack.sya.stealth-freeze:freeze",
                    data: {
                      ratio: characterValue("statusDefaults.freeze.ratio"),
                      interval: characterValue("statusDefaults.freeze.interval")
                    }
                  }
                ]
              }
            ]
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.sya.counter",
        damageRatio: 1.2,
        cost: 0,
        cd: 300,
        range: 260,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {
            type: "status.apply",
            status: "freeze",
            duration: 500,
            data: {
              stackMode: "replace-source",
              ratio: characterValue("statusDefaults.freeze.ratio"),
              interval: characterValue("statusDefaults.freeze.interval")
            }
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.counter.range"),
            halfAngle: 3.141592653589793,
            animateSweep: true,
            sweepSpeed: 1.5,
            animation: true,
            color: "40,80,255",
            fillAlpha: 0.2,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            edgeLine: true,
            edgeColor: "110,150,255",
            edgeAlpha: 0.75,
            edgeLineWidth: 3,
            durationFrames: 16,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            drawsClippedOutline: true,
            scaleWithAttackRange: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.sya.lmb",
        input: "lmb",
        attackId: "attack.sya.lmb",
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
        id: "ability.sya.rmb",
        input: "rmb",
        attackId: "attack.sya.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [
            {
              type: "stealth.toggle",
              stateKey: "stealth:sya",
              maxDuration: 4000,
              drainPerSecond: 150,
              speedModifier: 0.3,
              detectDelay: 400,
              detectRange: 80,
              detectAttackId: "attack.sya.stealth-freeze",
              attackBoost: {uses: 2, attackTag: "평타", stat: "attackRate", value: 0.65},
              cooldownOnStop: 300,
              stealthData: {fadeDuration: 400, revealRadius: 80}
            },
            {type: "action.attack"}
          ]
        }
      },
      counter: {
        id: "ability.sya.counter",
        input: "counter",
        attackId: "attack.sya.counter",
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
                duration: characterValue("attacks.counter.modules.1.duration"),
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
