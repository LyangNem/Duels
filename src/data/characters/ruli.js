{
    id: "ruli",
    name: "룰리",
    englishName: "Ruli",
    title: "최고의 재단사",
    color: "#e6dd85",
    classification: {style: 5, range: 0, role: 1},
    stats: {maxHealth: 1100, speed: 4, radius: 20, baseDamage: 500, difficulty: 4},
    desc: "정확한 거리를 가늠하며 전투하는 캐릭터",
    tagPersistentActionStateKeys: ["ruli-range-stage"],
    ringPresentation: {
      holdGauge: {
        input: "rmb",
        stateKey: "ruli-range-stage",
        min: 1,
        interval: 200,
        color: "rgba(230,221,133,0.90)",
        completeColor: "rgba(230,221,133,0.90)",
        completePulseColor: "230,221,133"
      }
    },
    tooltipSkills: [
      {key: "LMB", name: "줄자", attack: "lmb", text: "현재 단계의 사거리 끝에서 피해 ({damage})"},
      {key: "RMB", name: "길이 증가", attack: "rangeAdjust", showCost: false, text: "줄자의 길이 증가"},
      {key: "RMB HOLD", name: "길이 감소", attack: "rangeAdjust", showCost: false, text: "줄자의 길이 감소"},
      {
        key: "L-Shift",
        name: "되감기",
        attack: "counter",
        text: "줄자를 {stageMax}단계까지 즉시 늘린 뒤 {stageMin}단계까지 순차적으로 되감으며 피해 (타당 {damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.ruli.lmb",
        damageRatio: 1,
        cost: 400,
        cd: 760,
        range: characterSum(characterValue("rulerPresentation.originDistance"), characterValue("rulerPresentation.depth", 0.5)),
        presentation: {color: "#e6dd85"},
        progressScale: {
          stateKey: "ruli-range-stage",
          initial: characterValue("rulerPresentation.minStage"),
          valueRange: {from: characterValue("rulerPresentation.minStage"), to: characterValue("rulerPresentation.maxStage")},
          range: {
            from: characterSum(characterValue("rulerPresentation.originDistance"), characterValue("rulerPresentation.depth", 0.5)),
            to: characterSum(characterValue("rulerPresentation.originDistance"), characterValue("rulerPresentation.stageDistance", 6), characterValue("rulerPresentation.depth", 0.5))
          },
          moduleValues: [
            {
              type: "delivery.area",
              property: "centerDistance",
              from: characterValue("rulerPresentation.originDistance"),
              to: characterSum(characterValue("rulerPresentation.originDistance"), characterValue("rulerPresentation.stageDistance", 6))
            },
            {
              type: "effect.spawn",
              property: "stage",
              from: characterValue("rulerPresentation.minStage"),
              to: characterValue("rulerPresentation.maxStage")
            }
          ]
        },
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("rulerPresentation.depth"),
            halfWidth: characterValue("rulerPresentation.halfWidth"),
            centerDistance: characterValue("rulerPresentation.originDistance"),
            rectCenterMode: "center",
            wallPolicy: "block",
            visual: false
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "rulerStrike",
            position: "source",
            stage: 1,
            stages: characterValue("rulerPresentation.maxStage"),
            strikeLength: characterValue("rulerPresentation.halfWidth", 2),
            strikeWidth: characterValue("rulerPresentation.depth"),
            color: "230,221,133",
            durationFrames: 18,
            targetFromAreaCenter: true,
            syncAreaRectGeometry: true,
            startAtSourceRadius: true
          }
        ],
        tags: ["평타"]
      },
      rangeAdjust: {
        id: "attack.ruli.range-adjust",
        damageRatio: 0,
        cost: 0,
        cd: 10,
        range: 0,
        presentation: {suppressAttackFeedback: true},
        modules: [],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.ruli.counter",
        damageRatio: 0.5,
        cost: 0,
        cd: 520,
        range: characterSum(characterValue("attacks.counter.modules.0.centerDistance"), characterValue("rulerPresentation.depth", 0.5)),
        presentation: {color: "#e6dd85"},
        previewStyle: {steppedRangeSpan: true},
        modules: [
          {
            type: "delivery.area",
            contactType: "melee",
            shape: "rect",
            range: characterValue("rulerPresentation.depth"),
            halfWidth: characterValue("rulerPresentation.halfWidth"),
            centerDistance: characterSum(characterValue("rulerPresentation.originDistance"), characterValue("rulerPresentation.stageDistance", 6)),
            rectCenterMode: "center",
            wallPolicy: "block",
            aimMode: "live-source",
            visual: false,
            steppedRewind: {
              stateKey: "ruli-range-stage",
              initial: characterValue("rulerPresentation.minStage"),
              stages: characterValue("rulerPresentation.maxStage"),
              minDistance: characterValue("rulerPresentation.originDistance"),
              stepDistance: characterValue("rulerPresentation.stageDistance"),
              interval: 90,
              wallPadding: characterValue("rulerPresentation.wallPadding"),
              effect: {
                renderType: "rulerStrike",
                position: "source",
                stages: characterValue("rulerPresentation.maxStage"),
                strikeLength: characterValue("rulerPresentation.halfWidth", 2),
                strikeWidth: characterValue("rulerPresentation.depth"),
                color: "230,221,133",
                durationFrames: 14
              }
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.ruli.lmb",
        input: "lmb",
        attackId: "attack.ruli.lmb",
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
        id: "ability.ruli.rmb",
        input: "rmb",
        attackId: "attack.ruli.range-adjust",
        inputPolicy: {
          deferTapUntilRelease: true,
          holdRepeatProgress: {
            stateKey: "ruli-range-stage",
            interval: 200,
            amount: 1,
            min: 1,
            max: characterValue("rulerPresentation.maxStage"),
            initial: characterValue("rulerPresentation.minStage"),
            applyCooldownEachStep: true,
            blocksStaminaRegen: false
          }
        },
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
              type: "state.progress",
              stateKey: "ruli-range-stage",
              operation: "add",
              amount: 1,
              initial: characterValue("rulerPresentation.minStage"),
              max: characterValue("rulerPresentation.maxStage"),
              blocksStaminaRegen: false
            },
            {type: "action.attack"}
          ]
        }
      },
      counter: {
        id: "ability.ruli.counter",
        input: "counter",
        attackId: "attack.ruli.counter",
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
                speed: 10
              }
            }
          ]
        }
      }
    },
    rulerPresentation: {
      stateKey: "ruli-range-stage",
      stageAttackId: "attack.ruli.lmb",
      counterAttackId: "attack.ruli.counter",
      minStage: 1,
      maxStage: 7,
      originDistance: 54,
      stageDistance: 72,
      halfWidth: 64,
      depth: 72,
      wallPadding: 2,
      tickSpacing: 18,
      majorEvery: 4,
      majorLength: 12,
      minorLength: 7,
      adjustFrames: 16,
      rgb: "230,221,133",
      outlineWidth: 1.5,
      strongMajorWidth: 2.5,
      strongMinorWidth: 1.7,
      majorWidth: 1.8,
      minorWidth: 1,
      backMajorWidth: 4.4,
      backMinorWidth: 3.2,
      fontSize: 13
    }
  }
