{
    id: "tinya",
    name: "티냐",
    englishName: "Tinya",
    title: "마법진 마법사",
    color: "#92cbd6",
    classification: {style: 5, range: 0, role: 5},
    stats: {maxHealth: 1200, speed: 3.75, radius: 20, baseDamage: 20, difficulty: 5},
    desc: "얼음 속성 마법진을 그려 공격하는 캐릭터",
    circleFormation: {
      stateKey: "tinya-magic-circles",
      placementSpace: "camera",
      editingScale: characterValue("circleFormation.castingScale"),
      castingScale: 0.75,
      constrainCentersToView: true,
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
      activation: {input: "lmb", inputWindowMs: 0, revealMs: 375, postEffectCooldownMs: 100, presentation: {angle: 0, sweepCount: 1, sweepDirection: "clockwise", startAngleOffset: -1.5707963267948966, span: 6.283185307179586, inner: 0, fillAlpha: 0.2, strokeAlpha: 0.88, lineWidth: 2.5, edgeLine: false}},
      relation: {containAreaRatioMax: 0.55, connectDepthRatioMax: 0.35},
      amplifier: {status: "freeze", durationPerSource: 100, maxStage: characterProduct(characterValue("circleFormation.circle.maxCount"), 2), containedStageWeight: 2},
      burstDuration: 440,
      damage: {
        containMultiplier: 2,
        crossMultiplier: 2,
        intersectionMultiplier: 2,
        intersectionBase: characterProduct(characterValue("circleFormation.damage.crossMultiplier"), characterValue("circleFormation.damage.intersectionMultiplier")),
        intersectionContainStep: characterValue("circleFormation.damage.containMultiplier")
      }
    },
    worldEffectModules: [{type:"effect.spawn",renderType:"weaponImage",style:"formation-template",formationKey:"circleFormation",idleAlpha:0.45,scale:2.5}],
    tooltipSkills: [
      {key: "LMB", name: "발동", attack: "lmb", costText: "스테미나 {v:attacks.lmb.formationCost.perCircle} × 마법진 수", text: "마우스 위치에서 그린 마법진 전체 발동"},
      {key: "RMB", name: "마법진 제거", attack: "remove", text: "선택한 마법진 중 가장 최근 마법진 제거"},
      {key: "RMB HOLD", name: "마법진 위치 조정", attack: "lmb", showCost: false, text: "선택한 마법진과 연결된 모든 마법진의 위치 조정"},
      {
        key: "RMB DRAG",
        name: "마법진",
        attack: "lmb",
        costAttack: "rmb",
        text: "드래그로 마법진을 생성. 마법진의 생성 형태에 따라 추가 효과 적용 ({damage})"
      },
      {
        key: "INCLUDE", section: "CIRCLE",
        name: "",
        showCost: false,
        text: "큰 마법진이 작은 마법진을 완전히 포함하면 작은 마법진의 효과가 {v:circleFormation.damage.containMultiplier}배로 증폭. 일정 크기 이상은 포함 불가"
      },
      {key: "LINK", section: "CIRCLE", name: "", showCost: false, text: "겹치지 않고 서로 이어진 마법진이 효과를 공유"},
      {
        key: "CROSS", section: "CIRCLE",
        name: "",
        showCost: false,
        text: "마법진이 교차되면 마법진의 피해가 {v:circleFormation.damage.crossMultiplier}배 증가하며 교차지점은 추가로 {v:circleFormation.damage.intersectionMultiplier}배 증가"
      },
      {
        key: "AMP", section: "CIRCLE",
        name: "",
        showCost: false,
        text: "마법진 최소 크기 및 타 마법진의 윤곽선에 배치해 사용. 직간접적으로 연결된 마법진에 증폭 마법진 하나당 {v:circleFormation.amplifier.durationPerSource|seconds}초 빙결. 포함된 증폭 마법진은 지속시간 {v:circleFormation.amplifier.containedStageWeight}배"
      },
      {key: "L-Shift", name: "무영창 주문서", attack: "counter", text: "마우스 위치에서 그린 마법진 전체 발동"}
    ],
    attacks: {
      lmb: {
        id: "attack.tinya.lmb",
        damageRatio: 1,
        formationCost: {formationKey: "circleFormation", perCircle: 50},
        cost: 0,
        cd: 650,
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
            consumePlaced: false
          }
        ],
        tags: ["평타", "선딜레이"]
      },
      rmb: {
        id: "attack.tinya.rmb",
        damageRatio: 0,
        cost: 0,
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
      counter: {
        id: "attack.tinya.counter",
        damageRatio: 1,
        formationCost: {formationKey: "circleFormation", perCircle: 0},
        cost: 0,
        cd: 550,
        range: Infinity,
        suppressProjectileFireSound: true,
        modules: [
          {
            type: "formation.manifest",
            formationKey: "circleFormation",
            source: "template",
            storeLast: false,
            consumePlaced: false
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
          modules: [{type: "formation.remove", formationKey: "circleFormation"}]
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
            {type: "counter.ready"},
            {type: "formation.nonempty", formationKey: "circleFormation"}
          ],
          modules: [
            {
              type: "counter.execute",
              windup: 300,
              consumeState: "counter-ready",
              preview: {type: "preview.create", shape: "attack-shape"},
              cc: null
            }
          ]
        }
      }
    }
  }
