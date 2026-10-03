{
    id: "konyeong",
    name: "코녕",
    englishName: "Konyeong",
    title: "캠프 소년",
    color: "#f5e6c8",
    classification: {style: 5, range: 0, role: 1},
    stats: {maxHealth: 1100, speed: 4.25, radius: 20, baseDamage: 150, difficulty: 1},
    desc: "마시멜로 창으로 사거리 끝의 적에게 강한 피해를 주는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "마시멜로 창", attack: "lmb", text: "창을 찔러 피해 ({damage})"},
      {key: "LMB CRIT", name: "", attack: "lmb", text: "사거리 끝에 적중 시 추가 피해 ({tipDamage})"},
      {
        key: "RMB",
        name: "뜨거운 마시멜로",
        attack: "rmbZone",
        costAttack: "rmb",
        text: "선딜레이 후 사거리 끝에 감속지대를 소환하고 범위 피해 및 넉백 ({damage})"
      },
      {key: "L-Shift", name: "저리가!", attack: "counter", text: "마시멜로 창을 크게 휘둘러 원형 피해. 넉백 및 감속 ({damage})"},
      {key: "L-Shift CRIT", name: "", attack: "counter", text: "사거리 끝에 적중 시 추가 피해 ({tipDamage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.konyeong.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 380,
        range: 275,
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.lmb.range"),
            halfWidth: 28,
            contactType: "melee",
            wallPolicy: "block"
          },
          {
            type: "damage.range-band-multiplier",
            conditionKey: "critical",
            mode: "forward",
            thresholdRatio: 0.7,
            multiplier: 2
          },
          {
            type: "movement.knockback",
            effectKey: "critical-knockback",
            condition: {type: "damage.range-band-match", key: "critical"},
            target: "hit-target",
            direction: "attack",
            distance: 21,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "effect.spawn",
            renderType: "progressRect",
            when: "after-attack",
            position: "attack-center",
            range: characterValue("attacks.lmb.range"),
            halfWidth: characterValue("attacks.lmb.modules.0.halfWidth"),
            growthSpeed: 2.2,
            animation: true,
            color: "245,230,200",
            strokeColor: "245,220,180",
            fillAlpha: 0.35,
            strokeAlpha: 0.9,
            lineWidth: 2.5,
            highlightFraction: characterSum(1, characterValue("attacks.lmb.modules.1.thresholdRatio", -1)),
            highlightColor: "255,200,100",
            highlightAlpha: 0.6,
            duration: 150,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            wallCutStrokeAlpha: 0.82,
            scaleWithAttackRange: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.konyeong.rmb",
        damageRatio: 1,
        cost: 500,
        cd: 900,
        range: 275,
        effectsOnly: true,
        modules: [],
        tags: ["스킬", "선딜레이"]
      },
      rmbImpact: {
        id: "attack.konyeong.rmb-impact",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 275,
        effectsOnly: true,
        modules: [
          {
            type: "delivery.area",
            shape: "rect",
            range: characterValue("attacks.rmbImpact.range"),
            halfWidth: 30,
            contactType: "melee",
            wallPolicy: "block",
            fillAlpha: 0.06,
            strokeAlpha: 0.28
          },
          {
            type: "field.area",
            stateKey: "konyeong-slow-zone-damage",
            anchorMode: "attack-end",
            shape: "circle",
            range: characterValue("attacks.rmbZone.range"),
            wallPolicy: "block",
            duration: 200,
            attackId: "attack.konyeong.rmb-zone",
            damageOnTrigger: true,
            triggerImmediately: true,
            targetRelations: ["enemy"],
            interval: 201,
            intervalMode: "per-target",
            triggerOnEnter: true
          },
          {
            type: "field.area",
            stateKey: "konyeong-slow-zone",
            anchorMode: "attack-end",
            shape: "circle",
            range: characterValue("attacks.rmbZone.range"),
            wallPolicy: "block",
            duration: 3000,
            damageOnTrigger: false,
            preview: true,
            targetRelations: ["enemy"],
            interval: 50,
            intervalMode: "per-target",
            triggerOnEnter: true,
            onTrigger: [
              {
                type: "status.apply",
                status: "slow",
                duration: 120,
                removeOnExit: true,
                data: {factor: characterValue("statusDefaults.slow.factor"), stackMode: "replace-source"}
              }
            ],
            presentation: {type: "slowZoneAppear", r: characterValue("attacks.rmbImpact.modules.2.range")}
          },
          {
            type: "field.area",
            stateKey: "konyeong-slow-zone-damage-fx",
            anchorMode: "attack-end",
            shape: "circle",
            range: characterValue("attacks.rmbZone.range"),
            wallPolicy: "block",
            duration: 200,
            damageOnTrigger: false,
            targetRelations: [],
            presentation: {
              type: "slowZoneAppear",
              r: characterValue("attacks.rmbImpact.modules.3.range"),
              damageOnly: true,
              damageFillAlpha: 0.18,
              damageStrokeAlpha: 0.9,
              showLabel: false
            }
          }
        ],
        tags: ["스킬"]
      },
      rmbZone: {
        id: "attack.konyeong.rmb-zone",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 0,
        range: 112.5,
        modules: [
          {type: "hit.once-per-execution"},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 42,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.konyeong.counter",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 300,
        range: 250,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {
            type: "damage.range-band-multiplier",
            conditionKey: "critical",
            mode: "radial",
            thresholdRatio: 0.7,
            multiplier: 2,
            includeTargetRadius: true
          },
          {
            type: "status.apply",
            status: "slow",
            duration: 2000,
            data: {factor: characterValue("statusDefaults.slow.factor"), stackMode: "replace-source"}
          },
          {
            type: "effect.spawn",
            renderType: "konyeongSwing",
            when: "after-attack",
            range: characterValue("attacks.counter.range"),
            tipRatio: characterValue("attacks.counter.modules.1.thresholdRatio"),
            fillColor: characterValue("effectPresentation.fillColor"),
            strokeColor: characterValue("effectPresentation.strokeColor"),
            tipColor: characterValue("effectPresentation.tipColor"),
            fillAlpha: characterValue("effectPresentation.fillAlpha"),
            strokeAlpha: characterValue("effectPresentation.strokeAlpha"),
            strokeWidth: characterValue("effectPresentation.strokeWidth"),
            swingTipFillAlpha: characterValue("effectPresentation.swingTipFillAlpha"),
            swingTipStrokeAlpha: characterValue("effectPresentation.swingTipStrokeAlpha"),
            swingTipStrokeWidth: characterValue("effectPresentation.swingTipStrokeWidth"),
            growthSpeed: characterValue("effectPresentation.growthSpeed"),
            outlineSegments: characterValue("effectPresentation.outlineSegments"),
            duration: 300,
            animation: true,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true,
            drawsClippedOutline: true,
            wallCutStrokeAlpha: 0.82,
            scaleWithAttackRange: true
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.konyeong.lmb",
        input: "lmb",
        attackId: "attack.konyeong.lmb",
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
        id: "ability.konyeong.rmb",
        input: "rmb",
        attackId: "attack.konyeong.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "cooldowns.ready", attackIds: ["attack.konyeong.rmb"]},
            {type: "combat.can-act"}
          ],
          modules: [
            {type: "action.attack"},
            {
              type: "effect.spawn",
              renderType: "areaCircle",
              position: "source",
              range: 42,
              r: 42,
              duration: 300,
              color: "character",
              fillAlpha: 0.04,
              strokeAlpha: 0.78,
              lineWidth: 2,
              requireExecuted: true
            },
            {
              type: "preview.create",
              shape: "attack-shape",
              attackId: "attack.konyeong.rmb-impact",
              duration: 300,
              followSource: true,
              aimMode: "live-source",
              includeDeliveryAreas: false,
              requireExecuted: true
            },
            {type: "timing.delay", duration: 300, aimMode: "live-source", requireExecuted: true},
            {type: "preview.remove", requireExecuted: true},
            {type: "action.trigger-attack", attackId: "attack.konyeong.rmb-impact", requireExecuted: true}
          ]
        }
      },
      counter: {
        id: "ability.konyeong.counter",
        input: "counter",
        attackId: "attack.konyeong.counter",
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
    },
    effectPresentation: {
      tipRatio: characterValue("attacks.counter.modules.1.thresholdRatio"),
      fillColor: "245,230,200",
      strokeColor: "245,220,180",
      tipColor: "255,230,80",
      fillAlpha: 0.24,
      strokeAlpha: 0.82,
      strokeWidth: 2,
      stabTipFillAlpha: 0.62,
      stabTipStrokeAlpha: 0.96,
      stabTipStrokeWidth: 2.4,
      swingTipFillAlpha: 0.58,
      swingTipStrokeAlpha: 0.95,
      swingTipStrokeWidth: 3,
      growthSpeed: 2.2,
      outlineSegments: 96
    },
    statusDefaults: {slow: {factor: 0.5}}
  }
