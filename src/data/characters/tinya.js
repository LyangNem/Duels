{
    id: "tinya",
    name: "티냐",
    englishName: "Tinya",
    title: "마법진 마법사",
    color: "#92cbd6",
    classification: {style: 5, range: 0, role: 5},
    stats: {maxHealth: 1200, speed: 3.75, radius: 20, baseDamage: 50, difficulty: 6},
    desc: "얼음 속성 마법진을 그려 공격하는 캐릭터",
    circleFormation: {
      stateKey: "tinya-magic-circles",
      color: "146,203,214",
      circle: {
        input: "rmb",
        minRadius: 68,
        maxRadius: 240,
        maxRadiusScaleAttackKey: "lmb",
        maxCount: 6,
        moveHoldMs: 150,
        dragIntentDistance: 5,
        dragStartDistance: 12,
        holdMoveDeadzone: 10,
        amplifierRadiusTolerance: 1.5
      },
      activation: {input: "lmb", inputWindowMs: 200, revealMs: 375, holdMoveDeadzone: 10, postEffectCooldownMs: 100},
      relation: {containAreaRatioMax: 0.55, connectDepthRatioMax: 0.35},
      amplifier: {duration: 1000, slowFactor: 0.55, maxStage: 3, containedStageWeight: 2},
      burstDuration: 440,
      damage: {
        containMultiplier: 2,
        crossMultiplier: 2,
        intersectionMultiplier: 2,
        intersectionBase: characterProduct(characterValue("circleFormation.damage.crossMultiplier"), characterValue("circleFormation.damage.intersectionMultiplier")),
        intersectionContainStep: characterValue("circleFormation.damage.containMultiplier")
      }
    },
    tooltipSkills: [
      {key: "LMB", name: "발동", attack: "lmb", text: "현재 구현된 마법진 전체 발동"},
      {key: "LMB/RMB", name: "마법진 제거", attack: "remove", text: "선택한 마법진 중 가장 최근 마법진 제거"},
      {key: "LMB/LMB", name: "마법 주문서", attack: "spellbook", text: "가장 최근에 발동한 마법진을 불러옴"},
      {key: "LMB HOLD", name: "마법진 위치 조정", attack: "lmb", showCost: false, text: "선택한 마법진과 연결된 모든 마법진의 위치 조정"},
      {
        key: "RMB DRAG",
        name: "마법진",
        attack: "lmb",
        costAttack: "rmb",
        text: "드래그로 마법진을 생성. 마법진의 생성 형태에 따라 추가 효과 적용 ({damage})"
      },
      {
        key: "RMB INCLUDE",
        name: "",
        showCost: false,
        text: "큰 마법진이 작은 마법진을 완전히 포함하면 작은 마법진의 효과가 {v:circleFormation.damage.containMultiplier}배로 증폭. 일정 크기 이상은 포함 불가"
      },
      {key: "RMB LINK", name: "", showCost: false, text: "겹치지 않고 서로 이어진 마법진이 효과를 공유"},
      {
        key: "RMB CROSS",
        name: "",
        showCost: false,
        text: "마법진이 교차되면 마법진의 피해가 {v:circleFormation.damage.crossMultiplier}배 증가하며 교차지점은 추가로 {v:circleFormation.damage.intersectionMultiplier}배 증가"
      },
      {
        key: "RMB AMP",
        name: "",
        showCost: false,
        text: "최소 크기 마법진만 증폭 마법진이 될 수 있음. 직ㆍ간접 연결된 마법진에 증폭 단계에 따라 {v:circleFormation.amplifier.duration|seconds}초 감속ㆍ속박ㆍ빙결"
      },
      {key: "RMB HOLD", name: "마법진 수정", attack: "rmb", showCost: false, text: "선택한 마법진의 위치 조정"},
      {key: "L-Shift", name: "무영창 주문서", attack: "counter", text: "마지막으로 발동한 마법진을 조준 위치에서 재발동. 발동 기록이 없으면 최소 크기 마법진 발동"}
    ],
    attacks: {
      lmb: {
        id: "attack.tinya.lmb",
        damageRatio: 1,
        cost: 0,
        cd: 100,
        attackDelayGroup: "tinya-activation",
        attackDelay: 100,
        range: Infinity,
        suppressProjectileFireSound: true,
        modules: [
          {
            type: "formation.manifest",
            formationKey: "circleFormation",
            source: "pending",
            storeLast: true,
            consumePlaced: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["평타", "선딜레이"]
      },
      rmb: {
        id: "attack.tinya.rmb",
        damageRatio: 0,
        cost: 250,
        cd: 180,
        range: 240,
        effectsOnly: true,
        presentation: {suppressAttackFeedback: true},
        modules: [],
        tags: ["스킬"]
      },
      remove: {
        id: "attack.tinya.remove",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        attackDelayGroup: "tinya-activation",
        attackDelay: 100,
        range: Infinity,
        effectsOnly: true,
        presentation: {suppressAttackFeedback: true},
        modules: [],
        tags: ["스킬"]
      },
      spellbook: {
        id: "attack.tinya.spellbook",
        damageRatio: 0,
        cost: 800,
        cd: 0,
        attackDelayGroup: "tinya-activation",
        attackDelay: 100,
        range: Infinity,
        effectsOnly: true,
        presentation: {suppressAttackFeedback: true},
        modules: [],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.tinya.counter",
        damageRatio: 1,
        cost: 0,
        cd: 550,
        range: Infinity,
        suppressProjectileFireSound: true,
        modules: [
          {
            type: "formation.manifest",
            formationKey: "circleFormation",
            source: "last",
            defaultMinimumCircle: true,
            storeLast: false,
            consumePlaced: false
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.tinya.lmb",
        input: "lmb",
        attackId: "attack.tinya.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "lmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [{type: "formation.activate", formationKey: "circleFormation"}]
        }
      },
      rmb: {
        id: "ability.tinya.rmb",
        input: "rmb",
        attackId: "attack.tinya.rmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [{type: "formation.place-minimum", formationKey: "circleFormation"}]
        }
      },
      counter: {
        id: "ability.tinya.counter",
        input: "counter",
        attackId: "attack.tinya.counter",
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
