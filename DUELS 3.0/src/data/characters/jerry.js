{
    id: "jerry",
    name: "제리",
    englishName: "Jerry",
    title: "폭발음의 소년",
    color: "#59c980",
    classification: {style: 1, range: 0, role: 1},
    stats: {maxHealth: 900, speed: 3.75, radius: 20, baseDamage: 200, difficulty: 3},
    desc: "폭발물로 단거리 곡사와 근거리를 견제하는 캐릭터",
    tooltipSkills: [
      {key: "ALWAYS", name: "강한 폭발", attack: "grenadeExplosion", showCost: false, text: "폭발 중심에 가까울수록 넉백 거리 증가"},
      {
        key: "LMB",
        name: "유탄발사기",
        attack: "lmb",
        text: "지정 지점으로 유탄을 곡사해 폭발 ({detailDamage})",
        detailAttack: "grenadeExplosion"
      },
      {
        key: "RMB",
        name: "C4",
        attack: "rmb",
        detailAttack: "c4Explosion",
        text: "C4 {pellets}개를 부채꼴로 직사하며, 사거리 끝에서 폭발 ({detailDamage})"
      },
      {key: "L-Shift", name: "폭발 점프", attack: "counter", text: "제자리 폭발로 주변에 피해를 주고 점프 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.jerry.lmb",
        damageRatio: 0,
        cost: 200,
        cd: 470,
        range: 360,
        presentation: {color: "#59c980"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 13,
            radius: 10,
            targetPoint: true,
            targetPointMinRange: 45,
            targetPointResolve: "nearest-open",
            targetPointClearance: 2,
            damageOnTravel: false,
            collisionTargets: false,
            targetPointClampToAttackRange: true
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "trajectory.arc",
            height: 78,
            screenLiftRatio: 0.32,
            apexScale: 1.325,
            apexAlpha: 0.48,
            apexStrokeAlpha: 0.9
          },
          {
            type: "projectile.presentation",
            kind: "projectile-style",
            style: {
              type: "orb",
              radius: characterValue("attacks.lmb.modules.0.radius"),
              strokeColor: "89,201,128",
              fillColor: "89,201,128",
              fillAlpha: 0.28,
              strokeWidth: 2.2
            }
          },
          {
            type: "projectile.impact",
            reasons: ["range", "boundary", "target-point"],
            attackIds: ["attack.jerry.grenade-explosion"]
          }
        ],
        tags: ["평타"]
      },
      grenadeExplosion: {
        id: "attack.jerry.grenade-explosion",
        damageRatio: 1,
        cost: 0,
        cd: 0,
        range: 92,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.grenadeExplosion.range"),
            wallPolicy: "block"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.jerry.rmb",
        damageRatio: 0,
        cost: 650,
        cd: 1150,
        range: 520,
        presentation: {color: "#59c980"},
        modules: [
          {type: "pattern.scatter", count: 3, spread: 0.68},
          {type: "delivery.projectile", speed: 12, radius: 12, damageOnTravel: false, collisionTargets: true},
          {type: "projectile.pierce", targets: false, walls: false},
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: characterValue("attacks.rmb.modules.1.radius"),
              fillAlpha: 0.3,
              pulseMin: 0.75,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeColor: "89,201,128",
              innerColor: "89,201,128",
              strokeWidth: 3,
              innerStrokeWidth: 2,
              crossHalfLength: 6,
              showLink: false
            }
          },
          {type: "projectile.impact", attackIds: ["attack.jerry.c4-explosion"]}
        ],
        tags: ["스킬"]
      },
      c4Explosion: {
        id: "attack.jerry.c4-explosion",
        damageRatio: 1.5,
        cost: 0,
        cd: 0,
        range: 145,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.c4Explosion.range"),
            wallPolicy: "block"
          },
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-impact",
            distanceMode: "impact-proximity",
            proximityRadius: 145,
            minDistance: 36,
            maxDistance: 104,
            speed: 10,
            oncePerExecution: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.jerry.counter",
        damageRatio: 1.25,
        cost: 0,
        cd: 520,
        range: 155,
        presentation: {color: "#59c980"},
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {type: "trajectory.arc", height: 120, screenLiftRatio: 1, apexScale: 1, apexAlpha: 1, apexStrokeAlpha: 1},
          {
            type: "movement.move",
            when: "after-attack",
            stateKey: "movement:jerry-blast-jump",
            direction: "attack",
            distance: 310,
            duration: 520,
            replaceActive: true,
            blocksAction: true,
            collision: {passWalls: true, passEnemies: true},
            tags: ["이동기"],
            presentation: false,
            buffs: [{type: "evasionInvulnerable", value: 1, duration: "movement"}]
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.jerry.lmb",
        input: "lmb",
        attackId: "attack.jerry.lmb",
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
        id: "ability.jerry.rmb",
        input: "rmb",
        attackId: "attack.jerry.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.jerry.counter",
        input: "counter",
        attackId: "attack.jerry.counter",
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
                distanceMode: "impact-proximity",
                proximityRadius: 155,
                minDistance: 44,
                maxDistance: 112,
                speed: 10,
                oncePerExecution: true
              }
            }
          ]
        }
      }
    }
  }
