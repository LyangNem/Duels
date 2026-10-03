{
    id: "ezrail",
    name: "에즈레일",
    englishName: "Ezrail",
    title: "바람의 인도자",
    color: "#6f82a8",
    classification: {style: 3, range: 0, role: 4},
    stats: {maxHealth: 900, speed: 4, radius: 20, baseDamage: 100, difficulty: 2},
    desc: "보호막을 통해 아군의 전투지속력을 보조하는 캐릭터",
    tooltipSkills: [
      {key: "ALWAYS", name: "바람지대", text: "범위 내 아군에게 보호막을 적용"},
      {
        key: "LMB",
        name: "바람포",
        attack: "lmbExplosion",
        costAttack: "lmb",
        text: "바람탄을 날려 탄착 지점에 폭발 피해 및 {fieldSeconds}초간 유지되는 바람지대 생성. 아군 적중 가능 ({damage})"
      },
      {
        key: "RMB",
        name: "반동 도약",
        attack: "rmb",
        text: "땅을 향해 바람탄을 발사해 반동으로 짧은 거리 도약. 주변 적에게 피해와 넉백 및 바람지대 생성 ({damage})"
      },
      {key: "L-Shift", name: "바주카 휘두르기", attack: "counter", text: "바주카를 한 바퀴 휘둘러 주변 적에게 피해 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.ezrail.lmb",
        damageRatio: 0,
        cost: 200,
        cd: 500,
        range: 600,
        presentation: {color: "#6f82a8"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 16,
            radius: 13,
            damageOnTravel: false,
            collisionTargets: true,
            targetRelations: ["enemy", "ally"],
            stateKey: "ezrail-wind-shell"
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {type: "projectile.impact", attackIds: ["attack.ezrail.lmb-explosion"]}
        ],
        tags: ["평타"]
      },
      lmbExplosion: {
        id: "attack.ezrail.lmb-explosion",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 110,
        presentation: {color: "#6f82a8"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.lmbExplosion.range"),
            wallPolicy: "block",
            color: "111,130,168",
            renderType: "areaCircle"
          },
          {
            type: "field.area",
            stateKey: "ezrail-wind-zone",
            anchorMode: "target-point",
            clampToAttackRange: false,
            shape: "circle",
            range: 120,
            wallPolicy: "ignore",
            duration: 4000,
            targetRelations: ["self", "ally"],
            interval: 500,
            intervalMode: "per-target",
            triggerOnEnter: false,
            damageOnTrigger: false,
            onTrigger: [
              {
                type: "resource.restore",
                resource: "shield",
                recipient: "target",
                maxResourceRatio: 0.05,
                decayStartDelay: 1000,
                decayInterval: 1000,
                decayMaxHealthRatio: 0.1,
                presentation: "zone"
              }
            ],
            presentation: {
              type: "areaCircle",
              color: "160,188,220",
              strokeColor: "255,255,255",
              strokeColorMode: "source-team",
              fillAlpha: 0.08,
              strokeAlpha: 0.72,
              lineWidth: 2.5,
              innerRingScale: 0.62,
              innerRingStrokeColor: "255,255,255",
              innerRingStrokeAlpha: 0.34,
              innerRingLineWidth: 1.5,
              remainingArcGauge: true,
              remainingArcOffset: 7,
              remainingArcLineWidth: 3,
              remainingArcColor: "160,188,220",
              remainingArcAlpha: 0.85
            }
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.ezrail.rmb",
        damageRatio: 1.5,
        cost: 600,
        cd: 900,
        range: 240,
        presentation: {color: "#6f82a8"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: 130,
            wallPolicy: "block",
            targetRelations: ["enemy"],
            applyHitEffects: true,
            color: "111,130,168",
            renderType: "areaCircle"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 80,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "field.area",
            when: "after-attack",
            stateKey: "ezrail-wind-zone",
            anchorMode: "self",
            shape: "circle",
            range: 120,
            wallPolicy: "ignore",
            duration: 4000,
            targetRelations: ["self", "ally"],
            interval: 500,
            intervalMode: "per-target",
            triggerOnEnter: false,
            damageOnTrigger: false,
            onTrigger: [
              {
                type: "resource.restore",
                resource: "shield",
                recipient: "target",
                maxResourceRatio: 0.05,
                decayStartDelay: 1000,
                decayInterval: 1000,
                decayMaxHealthRatio: 0.1,
                presentation: "zone"
              }
            ],
            presentation: {
              type: "areaCircle",
              color: "160,188,220",
              strokeColor: "255,255,255",
              strokeColorMode: "source-team",
              fillAlpha: 0.08,
              strokeAlpha: 0.72,
              lineWidth: 2.5,
              innerRingScale: 0.62,
              innerRingStrokeColor: "255,255,255",
              innerRingStrokeAlpha: 0.34,
              innerRingLineWidth: 1.5,
              remainingArcGauge: true,
              remainingArcOffset: 7,
              remainingArcLineWidth: 3,
              remainingArcColor: "160,188,220",
              remainingArcAlpha: 0.85
            }
          },
          {
            type: "trajectory.arc",
            height: 150,
            screenLiftRatio: 0.7,
            apexScale: 0.9,
            apexAlpha: 0.78,
            apexStrokeAlpha: 0.9
          },
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:ezrail-recoil-jump",
            direction: "target-point",
            distance: characterValue("attacks.rmb.range"),
            duration: 360,
            replaceActive: true,
            blocksAction: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            tags: ["이동기"],
            presentation: false,
            buffs: [{type: "evasionInvulnerable", value: 1, duration: "movement"}]
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.ezrail.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 500,
        range: 170,
        presentation: {color: "#6f82a8"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            wallPolicy: "block",
            renderType: "annularDoubleSweep",
            span: 6.283185307179586,
            sweepCount: 1,
            sweepDirection: "clockwise",
            startAngleOffset: 3.141592653589793,
            sweepFraction: 0.75,
            fadePower: 1.35,
            lifetimeAlpha: true,
            hitColor: "111,130,168",
            color: "111,130,168",
            fillAlpha: 0.16,
            strokeAlpha: 0.92,
            lineWidth: 3,
            edgeLine: true,
            edgeColor: "255,255,255",
            edgeAlpha: 0.8,
            edgeLineWidth: 2.5,
            durationFrames: 30
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.ezrail.lmb",
        input: "lmb",
        attackId: "attack.ezrail.lmb",
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
        id: "ability.ezrail.rmb",
        input: "rmb",
        attackId: "attack.ezrail.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [{type: "action.attack", captureTargetPoint: true}]
        }
      },
      counter: {
        id: "ability.ezrail.counter",
        input: "counter",
        attackId: "attack.ezrail.counter",
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
