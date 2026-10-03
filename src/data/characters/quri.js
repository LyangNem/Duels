{
    id: "quri",
    name: "큐리",
    englishName: "Quri",
    title: "큐브 선수",
    color: "#8b6cd9",
    classification: {style: 7, range: 0, role: 5},
    stats: {maxHealth: 1200, speed: 4, radius: 20, baseDamage: 200, difficulty: 4},
    desc: "빠르게 공식을 완성하여 전투하는 캐릭터",
    tagPersistentActionStateKeys: ["quri-cube-stage", "quri-cube-formula"],
    formulaSequence: {
      stateKey: "quri-cube-formula",
      activationRange: 200,
      progressModule: {
        type: "state.progress",
        stateKey: "quri-cube-stage",
        initial: 0,
        max: 4,
        blocksStaminaRegen: false,
        debugLabel: "큐리 단계"
      },
      completeFlashMode: "final-persistent",
      mistakeProgress: {operation: "retain-ratio", ratio: 0, round: "floor"},
      stageLabels: ["CROSS", "F2L", "OLL", "PLL"],
      completeEffect: {
        type: "effect.spawn",
        renderType: "areaCircle",
        position: "source",
        range: 72,
        r: 72,
        color: "character",
        fillAlpha: 0.02,
        strokeAlpha: 0.44,
        lineWidth: 1.5,
        duration: 220,
        renderLayer: "below-entities"
      },
      formulas: [
        [
          ["L", "R", "R", "LR", "LL", "LL", "LR", "RL", "L"],
          ["LL", "LL", "R", "R", "RL", "LR", "RL", "RL"],
          ["RR", "L", "L", "LL", "R", "LL", "RR", "R", "LR"]
        ],
        [
          ["RR", "LR", "RL", "LR", "LL", "R", "RR", "RL", "LR", "R", "RL", "RL", "R", "L"],
          ["LL", "RR", "L", "LR", "RL", "RL", "R", "LR", "R", "RR", "RR", "LL", "R", "LR"],
          ["R", "R", "LR", "L", "R", "LR", "LR", "LL", "LR", "LL", "LL", "L", "L", "RR", "RL"]
        ],
        [["LL", "R", "LL", "L", "RL", "R"], ["L", "R", "RL", "RR", "L", "L", "R"], ["LR", "LL", "LR", "RL", "R"]],
        [
          ["R", "RR", "LR", "RL", "LR", "LR"],
          ["RL", "RR", "LR", "R", "R", "RL", "R"],
          ["LL", "RR", "LR", "RL", "RR", "L"]
        ]
      ]
    },
    worldGaugeModules: [
      {
        type: "range.circle",
        rangeRef: "character.formulaSequence.activationRange",
        visibility: "owner",
        color: "#8b6cd9",
        alpha: 0.42,
        lineWidth: 1.5,
        dash: [5, 5]
      },
      {
        type: "gauge.arc",
        lineWidth: 3,
        lineCap: "butt",
        color: "#8b6cd9",
        maxChargeFlash: true,
        valueRef: {type: "formula-sequence-progress-ratio", stateKey: "quri-cube-formula"}
      },
      {
        type: "gauge.segmented",
        height: 4,
        gap: 2,
        valueMode: "count",
        valueRef: {type: "progress", stateKey: "quri-cube-stage"},
        segments: [
          {value: 1, color: "#8b6cd9"},
          {value: 2, color: "#8b6cd9"},
          {value: 3, color: "#8b6cd9"},
          {value: 4, color: "#8b6cd9"}
        ]
      },
      {
        type: "formula.sequence-text",
        stateKey: "quri-cube-formula",
        visibility: "owner",
        color: "#b8a5ef",
        activeColor: "#ffffff",
        height: 14
      }
    ],
    tooltipSkills: [
      {key: "ALWAYS", name: "솔빙", attack: "lmb", showCost: false, text: "스킬이 자연 회복을 중단시키지 않음"},
      {
        key: "LMB FAR",
        name: "집중력",
        attack: "lmb",
        text: "캐릭터 멀리서 클릭으로 주변 적을 밀쳐내며 공격. 완성도에 따라 범위·피해 증가 ({minDamage}~{maxDamage})"
      },
      {key: "LMB NEAR", name: "큐브", costText: "스테미나 0", text: "캐릭터 주변에서 클릭으로 공식 입력. 오입력 시 현재 단계 입력 진행도 초기화"},
      {key: "RMB NEAR", name: "큐브", costText: "스테미나 0", text: "캐릭터 주변에서 클릭으로 공식 입력. 오입력 시 현재 단계 입력 진행도 초기화"},
      {
        key: "L-Shift",
        name: "집어던지기",
        attack: "counter",
        text: "생각대로 되지 않은 큐브를 던져 탄착 지점에서 폭발 ({detailDamage})",
        detailAttack: "counterExplosion"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.quri.lmb",
        damageRatio: 1,
        cost: 300,
        cd: 900,
        range: 150,
        progressScale: {
          stateKey: "quri-cube-stage",
          valueRange: {from: 0, to: 4},
          range: {from: characterValue("attacks.lmb.range"), to: 300},
          damageRatio: {from: characterValue("attacks.lmb.damageRatio"), to: 2},
          moduleValues: [
            {
              type: "delivery.area",
              property: "range",
              from: characterValue("attacks.lmb.progressScale.range.from"),
              to: characterValue("attacks.lmb.progressScale.range.to")
            },
            {type: "movement.knockback", property: "distance", from: 55, to: 110}
          ]
        },
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.lmb.range"), wallPolicy: "block"},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 55,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      counter: {
        id: "attack.quri.counter",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 650,
        previewProjectilePaths: true,
        modules: [
          {
            type: "delivery.projectile",
            speed: 18,
            radius: 12,
            hitRadius: characterValue("attacks.counter.modules.0.radius"),
            targetPoint: true,
            targetPointClampToAttackRange: true,
            targetPointResolve: "nearest-open",
            targetPointClearance: 2,
            damageOnTravel: false,
            collisionTargets: true
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {
            type: "projectile.impact",
            reasons: ["target", "target-point", "wall", "boundary", "range"],
            attackIds: ["attack.quri.counter-explosion"]
          }
        ],
        tags: ["반격"]
      },
      counterExplosion: {
        id: "attack.quri.counter-explosion",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 120,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counterExplosion.range"),
            wallPolicy: "ignore"
          },
          {
            type: "effect.spawn",
            when: "on-attack",
            effect: "areaCircle",
            layer: "under",
            range: characterValue("attacks.counterExplosion.range"),
            r: characterValue("attacks.counterExplosion.range"),
            color: "character",
            fillAlpha: 0.04,
            strokeAlpha: 0.5,
            lineWidth: 2,
            duration: 220
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.quri.lmb",
        input: "lmb",
        attackId: "attack.quri.lmb",
        inputPolicy: {repeatWhileHeld: false},
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
            {type: "formula.sequence-input", button: "L", blockWhileDodging: true, preserveNaturalRegenActivity: true},
            {type: "action.attack"}
          ]
        }
      },
      rmb: {
        id: "ability.quri.rmb",
        input: "rmb",
        attackId: "attack.quri.lmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [{type: "formula.sequence-input", button: "R", blockWhileDodging: true, preserveNaturalRegenActivity: true}]
        }
      },
      counter: {
        id: "ability.quri.counter",
        input: "counter",
        attackId: "attack.quri.counter",
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
              targetPointMode: "aim-point",
              preview: {type: "preview.create"},
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
