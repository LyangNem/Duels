{
    id: "kines",
    name: "키네스",
    englishName: "Kines",
    title: "화염 술사",
    color: "#910101",
    classification: {style: 3, range: 0, role: 1},
    stats: {maxHealth: 1100, speed: 4, radius: 20, baseDamage: 100, difficulty: 4},
    desc: "스킬의 사용 방향에 따라 여러가지 마법진을 구사하는 화염 술사 캐릭터",
    directionalArcIndicator: {color: "#910101", inactiveColor: "rgba(145,1,1,.18)", lineWidth: 3, lineCap: "butt", gap: 0.12},
    tooltipSkills: [
      {key: "ALWAYS", name: "타오르는 불꽃", attack: "lmbExplosion", showCost: false, text: "키네스의 화염은 지속 시간 내에 재타격 시 피해량 중첩"},
      {
        key: "LMB",
        name: "화염구",
        attack: "lmbExplosion",
        costAttack: "lmb",
        text: "착탄 지점에서 폭발하는 화염구 발사. 주변 적에게 피해 및 {burnSeconds}초 화염 ({damage})"
      },
      {
        key: "RMB UP",
        name: "조작의 화염",
        attack: "controlExplosion",
        costAttack: "control",
        text: "현재 비행 중인 화염구가 즉시 폭발. 폭발 범위와 피해 증가 ({damage})"
      },
      {
        key: "RMB LEFT",
        name: "기동의 화염",
        attack: "mobility",
        costAttack: "mobility",
        text: "이동 방향으로 순간이동. 출발점과 도착점에 폭발 및 {burnSeconds}초 화염 (타당 {damage})"
      },
      {
        key: "RMB DOWN",
        name: "방출의 화염",
        attack: "release",
        costAttack: "release",
        text: "주변에 화염 방출. 피해 및 {burnSeconds}초 화염 ({damage})"
      },
      {
        key: "RMB RIGHT",
        name: "보호의 화염",
        attack: "protection",
        costAttack: "protection",
        text: "최대 체력의 {restoreMaxResourcePercent}% 보호막 획득. 주변 적에게 {burnSeconds}초 화염 및 강한 넉백"
      },
      {key: "L-Shift", name: "작열의 화염", attack: "counter", text: "벽과 적을 관통하는 넓은 화염을 방출해 {burnSeconds}초 화염 부여"}
    ],
    attacks: {
      lmb: {
        id: "attack.kines.lmb",
        damageRatio: 0,
        cost: 200,
        cd: 450,
        range: 800,
        presentation: {color: "#910101"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 18,
            radius: 14,
            damageOnTravel: false,
            collisionTargets: true,
            stateKey: "kines-fireball"
          },
          {type: "projectile.pierce", targets: false, walls: false},
          {type: "projectile.impact", attackIds: ["attack.kines.lmb-explosion"]}
        ],
        tags: ["평타"]
      },
      lmbExplosion: {
        id: "attack.kines.lmb-explosion",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 100,
        presentation: {color: "#910101"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.lmbExplosion.range"),
            wallPolicy: "block",
            color: "145,1,1",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          }
        ],
        tags: ["평타"]
      },
      rmb: {id: "attack.kines.rmb", damageRatio: 0, cost: 0, cd: 0, range: 0, effectsOnly: true, modules: [], tags: ["스킬"]},
      control: {
        id: "attack.kines.control",
        damageRatio: 0,
        cost: 300,
        cd: 900,
        range: 0,
        effectsOnly: true,
        modules: [],
        tags: ["스킬"]
      },
      controlExplosion: {
        id: "attack.kines.control-explosion",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 150,
        presentation: {color: "#ff2d16"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.controlExplosion.range"),
            wallPolicy: "block",
            color: "255,45,22",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      mobility: {
        id: "attack.kines.mobility",
        damageRatio: 0.5,
        cost: 600,
        cd: 900,
        range: 110,
        presentation: {color: "#b71313"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.mobility.range"),
            wallPolicy: "block",
            color: "183,19,19",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          },
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:kines-mobility",
            control: "input",
            distance: 280,
            duration: 1,
            replaceActive: true,
            collision: {passWalls: true, passEnemies: true},
            resolveOverlapOnEnd: true,
            onEndAttackIds: ["attack.kines.mobility-arrival"],
            tags: ["이동기"],
            presentation: {type: "dash-line", color: "255,60,30", width: 7, alpha: 0.5, duration: 120}
          }
        ],
        tags: ["스킬"]
      },
      mobilityArrival: {
        id: "attack.kines.mobility-arrival",
        damageRatio: 0.5,
        cost: 0,
        cd: 0,
        range: 110,
        presentation: {color: "#b71313"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.mobilityArrival.range"),
            wallPolicy: "block",
            color: "183,19,19",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      release: {
        id: "attack.kines.release",
        damageRatio: 1.5,
        cost: 500,
        cd: 900,
        range: 190,
        presentation: {color: "#cf1717"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.release.range"),
            wallPolicy: "block",
            color: "207,23,23",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      protection: {
        id: "attack.kines.protection",
        damageRatio: 0,
        cost: 1200,
        cd: 900,
        range: 95,
        effectsOnly: true,
        presentation: {color: "#ff3520"},
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.protection.range"),
            wallPolicy: "block",
            targetRelations: ["enemy"],
            applyHitEffects: true,
            color: "255,53,32",
            renderType: "areaCircle"
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 220,
            speed: 16,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.kines.counter",
        damageRatio: 2,
        cost: 0,
        cd: 500,
        range: 450,
        presentation: {color: "#b80d0d"},
        modules: [
          {
            type: "effect.spawn",
            renderType: "hitImpactRing",
            position: "source",
            r: 0,
            maxR: characterValue("attacks.counter.range"),
            color: "#910101",
            strokeAlpha: 1,
            lineWidth: 5.5,
            duration: 600,
            animation: true,
            damage: {
              attackId: "attack.kines.counter",
              hitMode: "expanding-ring",
              suppressHitImpactRing: true,
              oncePerExecution: true,
              module: {type: "delivery.area", shape: "circle", range: 450, wallPolicy: "ignore"}
            }
          },
          {
            type: "status.apply",
            status: "burn",
            duration: 2000,
            data: {
              flat: 25,
              interval: characterValue("statusDefaults.burn.interval"),
              tickAtEnd: true,
              stackMode: "stack-count-source"
            },
            oncePerExecution: true
          },
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            targetRelations: ["enemy"],
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
        id: "ability.kines.lmb",
        input: "lmb",
        attackId: "attack.kines.lmb",
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
        id: "ability.kines.rmb",
        input: "rmb",
        attackId: "attack.kines.protection",
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
                {
                  attackId: "attack.kines.control",
                  conditions: [
                    {type: "aim.cardinal-is", direction: "up"},
                    {type: "projectile.attack-id-is", stateKey: "kines-fireball", attackId: "attack.kines.lmb"}
                  ]
                },
                {
                  attackId: "attack.kines.mobility",
                  conditions: [{type: "aim.cardinal-is", direction: "left"}]
                },
                {
                  attackId: "attack.kines.release",
                  conditions: [{type: "aim.cardinal-is", direction: "down"}]
                }
              ],
              fallbackConditions: [{type: "aim.cardinal-is", direction: "right"}]
            },
            {
              type: "projectile.detonate",
              requireExecuted: true,
              requireAttackId: "attack.kines.control",
              stateKey: "kines-fireball",
              attackId: "attack.kines.control-explosion",
              reason: "manual"
            },
            {
              type: "resource.restore",
              requireExecuted: true,
              requireAttackId: "attack.kines.protection",
              resource: "shield",
              recipient: "source",
              maxResourceRatio: 0.5,
              decayStartDelay: 1000,
              decayInterval: 1000,
              decayMaxHealthRatio: 0.1
            }
          ]
        }
      },
      counter: {
        id: "ability.kines.counter",
        input: "counter",
        attackId: "attack.kines.counter",
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
              ccRefAttackId: "attack.kines.counter"
            }
          ]
        }
      }
    },
    statusDefaults: {burn: {flat: 50, interval: 500}}
  }
