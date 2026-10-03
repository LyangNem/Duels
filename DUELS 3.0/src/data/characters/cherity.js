{
    id: "cherity",
    name: "체리티",
    englishName: "Cherity",
    title: "침착한 명사수",
    color: "#6b0f1a",
    classification: {style: 4, range: 0, role: 2},
    stats: {maxHealth: 1000, speed: 4, radius: 20, baseDamage: 150, difficulty: 5},
    desc: "원거리에서 강한 한방으로 게임을 터뜨리는 캐릭터",
    tooltipSkills: [
      {
        key: "LMB HOLD",
        name: "저격",
        attack: "lmb",
        text: "최대 {chargeSeconds}초 차징. {piercePercent}% 차징 시 벽 관통 및 조준 카메라 활성화 ({minDamage}~{maxDamage})"
      },
      {key: "LMB HOLD/RMB", name: "배율 조절", attack: "lmb", costText: "스테미나 0", text: "차징 중 조준 카메라 활성화 또는 비활성화"},
      {
        key: "RMB",
        name: "연막 스프레이",
        attack: "rmb",
        text: "연막 스프레이를 흩뿌리며 뒤로 이동. 적중 시 넉백 및 탄착 지점에 {fieldSeconds}초 연막 생성 ({damage})"
      },
      {
        key: "L-Shift",
        name: "연막",
        attack: "counter",
        text: "{fieldSeconds}초 연막 생성 및 피해. {selfStealthSeconds}초간 은신 및 이동속도 {selfSpeedPercent}% 증가 ({damage})"
      }
    ],
    attacks: {
      lmb: {
        id: "attack.cherity.lmb",
        damageRatio: 1,
        cost: 0,
        cd: 600,
        range: 1400,
        cameraAimOffset: {maxDistance: 400, minProgress: 1},
        charge: {
          duration: 700,
          maxProgress: 2,
          costMin: 100,
          costMax: 600,
          costTiming: "during-charge",
          staminaRegenDuringCharge: false,
          damageRatio: {from: characterValue("attacks.lmb.damageRatio"), to: 6},
          projectileSpeed: {from: 18, to: 53},
          pierceWallsAt: 1,
          selfStatus: {type: "bind"},
          preview: true,
          gauge: {layers: 2, overflowColor: "#d88999", maxChargeFlash: true, flashAfterFirstLayer: true}
        },
        modules: [
          {type: "delivery.projectile", speed: 18, radius: 10},
          {type: "projectile.pierce", targets: false, walls: false}
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.cherity.rmb",
        damageRatio: 1,
        cost: 400,
        cd: 400,
        range: 340,
        modules: [
          {type: "pattern.scatter", count: 7, spread: 0.7},
          {type: "delivery.projectile", speed: 22, radius: 10},
          {type: "projectile.collision", shape: "diamond", radiusScale: 1.2, wall: "remove"},
          {type: "hit.once-per-execution"},
          {
            type: "movement.knockback",
            target: "hit-target",
            direction: "away-from-source",
            distance: 145,
            speed: 10,
            oncePerExecution: true
          },
          {type: "projectile.pierce", targets: true, walls: false},
          {
            type: "projectile.impact",
            field: {
              type: "field.area",
              stateKey: "cherity-smoke",
              anchorMode: "point",
              shape: "circle",
              range: 71.5,
              wallPolicy: "block",
              duration: 1500,
              damageOnTrigger: false,
              targetRelations: ["self", "ally", "enemy"],
              interval: 50,
              intervalMode: "per-target",
              triggerOnEnter: true,
              removeOnTrigger: false,
              onTrigger: [
                {
                  type: "modifier.set",
                  stat: "stealth",
                  value: 1,
                  duration: Infinity,
                  removeOnExit: true,
                  data: {fadeDuration: 500, revealRadius: 80}
                }
              ],
              reasons: ["range", "wall", "boundary"],
              presentation: {
                type: "smokeZone",
                r: characterValue("attacks.rmb.modules.6.field.range"),
                range: characterValue("attacks.rmb.modules.6.field.range"),
                visibility: "all"
              }
            }
          },
          {
            type: "movement.move",
            direction: "opposite-aim",
            distance: 150,
            duration: 160,
            collision: {passWalls: true, passEnemies: true},
            tags: ["이동기"]
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.cherity.counter",
        damageRatio: 1,
        cost: 0,
        cd: 300,
        range: 143,
        modules: [
          {type: "delivery.area", shape: "circle", range: characterValue("attacks.counter.range"), wallPolicy: "block"},
          {
            type: "movement.neutralize-knockback",
            target: "hit-target",
            targetRelations: ["enemy"],
            direction: "away-from-source",
            distance: 84,
            speed: 10,
            oncePerExecution: true
          },
          {
            type: "field.area",
            stateKey: "cherity-counter-smoke",
            anchorMode: "self",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            wallPolicy: "block",
            duration: 1500,
            damageOnTrigger: false,
            targetRelations: ["self", "ally", "enemy"],
            interval: 50,
            intervalMode: "per-target",
            triggerOnEnter: true,
            removeOnTrigger: false,
            onTrigger: [
              {
                type: "modifier.set",
                stat: "stealth",
                value: 1,
                duration: Infinity,
                removeOnExit: true,
                data: {fadeDuration: 500, revealRadius: 80}
              }
            ],
            presentation: {
              type: "smokeZone",
              r: characterValue("attacks.counter.modules.2.range"),
              range: characterValue("attacks.counter.modules.2.range"),
              visibility: "all"
            }
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.cherity.lmb",
        input: "lmb",
        attackId: "attack.cherity.lmb",
        inputPolicy: {repeatWhileHeld: false},
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "state.absent", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.start", stateKey: "charge:primary"}]
        },
        releaseTrigger: {
          type: "trigger",
          event: "input.release",
          conditions: [
            {type: "input.slot", slot: "lmb"},
            {type: "entity.alive"},
            {type: "state.exists", stateKey: "charge:primary"}
          ],
          modules: [{type: "charge.attack.release", stateKey: "charge:primary"}]
        }
      },
      rmb: {
        id: "ability.cherity.rmb",
        input: "rmb",
        attackId: "attack.cherity.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [{type: "input.slot", slot: "rmb"}, {type: "entity.alive"}],
          modules: [
            {
              type: "charge.camera.suppress",
              stateKey: "charge:primary",
              mode: "toggle",
              conditions: [{type: "state.exists", stateKey: "charge:primary"}]
            },
            {
              type: "action.attack",
              conditions: [
                {type: "state.absent", stateKey: "charge:primary"},
                {type: "ability.pending-ready"},
                {type: "combat.can-act"}
              ]
            }
          ]
        }
      },
      counter: {
        id: "ability.cherity.counter",
        input: "counter",
        attackId: "attack.cherity.counter",
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
              ccRefAttackId: "attack.cherity.counter",
              preview: {type: "preview.create", shape: "attack-shape"},
              selfModifiers: [
                {stat: "speed", value: 0.3, duration: 3000, sourceId: "ability.cherity.counter:speed"},
                {stat: "stealth", value: 1, duration: 3000, sourceId: "ability.cherity.counter:stealth"}
              ]
            }
          ]
        }
      }
    }
  }
