{
    id: "lete",
    name: "레테",
    englishName: "Lete",
    title: "분실된 편지의 정령",
    color: "#A7B0A4",
    classification: {style: 3, range: 0, role: 4},
    stats: {maxHealth: 1100, speed: 4.25, radius: 20, baseDamage: 50, difficulty: 2},
    desc: "수취인을 정해 우편을 전달하고 우편함으로 전투를 지원하는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB",
        name: "우편",
        attack: "lmb",
        text: "우편 {burstCount}통을 순차 발사. 아군 적중 시 스테미나 {restoreMaxResourcePercent}% 회복 (타당 {damage})"
      },
      {key: "RMB", name: "수취인 확정", attack: "rmb", text: "조준 위치에 가장 가까운 대상을 수취인으로 확정하며 우편함 설치"},
      {
        key: "RMB/RMB",
        name: "수취인 변경",
        attack: "rmbRetarget",
        costText: "스테미나 0",
        text: "설치된 우편함의 수취인을 조준 위치에 가장 가까운 대상으로 변경"
      },
      {
        key: "RMB HOLD",
        name: "자리잡기",
        attack: "rmbHold",
        costText: "스테미나 0",
        text: "{v:attacks.rmbHold.charge.duration|seconds}초 홀드해 설치된 우편함을 현재 위치로 이동"
      },
      {key: "L-Shift", name: "우편함도 무기!", attack: "counter", text: "우편함을 회수해 전방의 적을 강하게 쳐내고 현재 위치에 다시 설치 ({damage})"}
    ],
    summonSpecs: [
      {
        stateKey: "mailbox",
        stats: [
          {key: "HEALTH", text: "{maxHealth}"},
          {key: "MOVE SPEED", text: "{moveLabel}"},
          {key: "ABILITY", text: "수취인에게 우편 발송 · 수령 시 스테미나 {supportStaminaPercent}% 회복"},
          {key: "DEATH", text: "사망 시 {respawnSeconds}초간 재사용 불가"}
        ]
      }
    ],
    summons: {
      mailbox: {
        id: "summon.lete.mailbox",
        name: "우편함",
        maxHealth: 900,
        baseDamage: 50,
        respawnDelay: 7000,
        respawnHealth: 900,
        radius: 23,
        speed: 0,
        tags: ["소환수", "고정형"],
        ai: {
          type: "stationary-support-projectile",
          attackId: "attack.lete.mailbox-mail",
          interval: 1000,
          targetRelations: ["self", "ally", "enemy"],
          recipientStateProperty: "recipientEntityId",
          friendlyRequiresResource: "stamina"
        },
        presentation: {profile: "classicMinion", color: "#A7B0A4", fillColor: "rgba(167,176,164,.52)", strokeColor: "#A7B0A4"},
        recipientPresentation: {stateProperty: "recipientEntityId", marker: {shape: "envelope", teamColorSource: "owner"}},
        spawnEffect: {type: "areaCircle", range: 50, r: 0, maxR: 50, durationFrames: 18, color: "167,176,164"}
      }
    },
    attacks: {
      lmb: {
        id: "attack.lete.lmb",
        damageRatio: 1,
        cost: 300,
        cd: 250,
        attackDelayGroup: "lete-primary",
        attackDelay: 200,
        range: 560,
        modules: [
          {
            type: "delivery.projectile",
            speed: 20,
            radius: 12,
            targetRelations: ["enemy", "ally"],
            applyHitEffects: true,
            friendlyRequiresResource: "stamina",
            homing: {
              startTravelRatio: 0.08,
              maxTurnPerFrame: 0.04,
              searchRange: 300,
              targetRelations: ["enemy", "ally"]
            }
          },
          {type: "projectile.pierce", targets: false, walls: true},
          {
            type: "delivery.delayed-projectile-volley",
            count: 3,
            delay: 0,
            interval: 80,
            aimMode: "live-source",
            perpendicularOffsets: [-20, 0, 20],
            phaseKey: "lete-mail-volley"
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "target",
            targetRelations: ["ally"],
            maxResourceRatio: 0.1,
            oncePerExecution: false
          },
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "orb",
              radius: characterValue("attacks.lmb.modules.0.radius"),
              strokeColor: "167,176,164",
              fillColor: "205,214,202",
              fillAlpha: 0.3,
              strokeWidth: 2
            }
          }
        ],
        tags: ["평타", "지원"]
      },
      rmb: {
        id: "attack.lete.rmb",
        damageRatio: 0,
        cost: 750,
        cd: 450,
        attackDelayGroup: "lete-primary",
        attackDelay: 500,
        range: 0,
        effectsOnly: true,
        charge: {duration: 500, costMin: 0, costMax: 0, costTiming: "release", gauge: true, staminaRegenDuringCharge: true},
        modules: [],
        tags: ["스킬"]
      },
      rmbRetarget: {
        id: "attack.lete.rmb-retarget",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        effectsOnly: true,
        modules: [],
        tags: ["스킬"]
      },
      rmbHold: {
        id: "attack.lete.rmb-hold",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        effectsOnly: true,
        charge: {duration: 300, costMin: 0, costMax: 0, costTiming: "release", gauge: true, staminaRegenDuringCharge: true},
        modules: [],
        tags: ["스킬"]
      },
      mailboxMail: {
        id: "attack.lete.mailbox-mail",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 800,
        modules: [
          {
            type: "delivery.projectile",
            speed: 12,
            radius: 11,
            targetRelations: ["self", "ally", "enemy"],
            targetEntityOnly: true,
            applyHitEffects: true,
            friendlyRequiresResource: "stamina",
            supportHitSound: false,
            supportHitEffect: {
              type: "effect.spawn",
              renderType: "areaCircle",
              r: 30,
              color: "167,176,164",
              fillAlpha: 0.14,
              strokeAlpha: 0.95,
              lineWidth: 2,
              duration: 300
            },
            homing: {
              startTravelRatio: 0,
              maxTurnPerFrame: 0.08,
              targetRelations: ["self", "ally", "enemy"],
              targetEntityOnly: true
            }
          },
          {type: "projectile.pierce", walls: true},
          {
            type: "delivery.delayed-projectile-volley",
            count: 2,
            delay: 0,
            interval: 180,
            aimMode: "locked",
            perpendicularOffsets: [20, -20],
            phaseKey: "lete-mailbox-pair"
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "stamina",
            recipient: "target",
            targetRelations: ["self", "ally"],
            maxResourceRatio: 0.1,
            oncePerExecution: false
          }
        ],
        tags: ["스킬", "소환수", "지원"]
      },
      counter: {
        id: "attack.lete.counter",
        damageRatio: 4,
        cost: 0,
        cd: 420,
        range: 190,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 1.22,
            wallPolicy: "block",
            contactType: "melee"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "arcSweep",
            position: "attack-center",
            range: characterValue("attacks.counter.range"),
            halfAngle: characterValue("attacks.counter.modules.0.halfAngle"),
            color: "167,176,164",
            fillAlpha: 0.25,
            strokeAlpha: 0.95,
            lineWidth: 2,
            durationFrames: 14,
            clipToAttackArea: true,
            replaceAutoAreaEffect: true
          },
          {
            type: "summon.spawn",
            stateKey: "mailbox",
            requireActive: true,
            replaceActive: true,
            preserveHealthOnReplace: true,
            placeDistance: 0
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.lete.lmb",
        input: "lmb",
        attackId: "attack.lete.lmb",
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
        id: "ability.lete.rmb",
        input: "rmb",
        attackId: "attack.lete.rmb",
        holdAttackId: "attack.lete.rmb-hold",
        inputAttackAlternates: [{attackId: "attack.lete.rmb-retarget", conditions: [{type: "summon.active", stateKey: "mailbox"}]}],
        inputPolicy: {
          repeatWhileHeld: false,
          tapHoldSplit: true,
          holdThresholdMs: characterValue("attacks.rmbHold.charge.duration"),
          holdGauge: true,
          holdGaugeStateKey: "charge:lete-rmb-position"
        },
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}, {type: "combat.can-act"}],
          modules: [
            {
              type: "summon.toggle",
              stateKey: "mailbox",
              placeDistance: 0,
              recallCooldown: 450,
              retargetWhileActive: true,
              recipientSelection: {
                targetRelations: ["self", "ally", "enemy"],
                mode: "nearest-to-target-point",
                radius: 40,
                stateProperty: "recipientEntityId",
                excludeOwnSummonStateKey: "mailbox",
                friendlyRequiresResource: "stamina",
                fallback: "self",
                preserveExistingOnMiss: true,
                noOpOnMissWithExisting: true,
                selectionEffect: {
                  type: "areaCircle",
                  r: 40,
                  color: "167,176,164",
                  fillAlpha: 0.25,
                  strokeAlpha: 0.95,
                  lineWidth: 2,
                  duration: 450
                }
              },
              tags: ["스킬", "소환"]
            }
          ]
        },
        holdTrigger: {
          type: "trigger",
          event: "input.hold",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "combat.can-act"},
            {type: "summon.active", stateKey: "mailbox"}
          ],
          modules: [
            {
              type: "summon.spawn",
              stateKey: "mailbox",
              requireActive: true,
              replaceActive: true,
              preserveHealthOnReplace: true,
              placeDistance: 0,
              tags: ["스킬", "소환"]
            }
          ]
        }
      },
      counter: {
        id: "ability.lete.counter",
        input: "counter",
        attackId: "attack.lete.counter",
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
