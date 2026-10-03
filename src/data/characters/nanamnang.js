{
    id: "nanamnang",
    name: "나남낭",
    englishName: "Nanamnang",
    title: "졸린 아이",
    color: "#fbc7ff",
    classification: {style: 3, range: 0, role: 3},
    stats: {maxHealth: 1500, speed: 3.75, radius: 20, baseDamage: 200, difficulty: 1},
    desc: "자는것이 좋은 소녀 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "베개 휘두르기", attack: "lmb", text: "베개를 휘둘러 공격. 적중 시 잃은 체력의 {healPercent}% 회복 ({damage})"},
      {
        key: "LMB HOLD",
        name: "베개 투척",
        attack: "lmb",
        costText: "스테미나 {fullCost}",
        text: "최대 차징 시 베개를 던짐. 적중 시 잃은 체력의 {healPercent}% 회복 ({fullDamage})"
      },
      {
        key: "RMB",
        name: "잘 자요",
        attack: "rmb",
        healAttack: "sleepHeal",
        text: "{sleepSeconds}초 수면(타격 시 깨어남) 후 잃은 체력의 {healPercent}% 회복"
      },
      {key: "L-Shift", name: "깊은 잠", attack: "counter", text: "베개를 단거리에 내려쳐 적중한 적을 {sleepSeconds}초간 재움 ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.nanamnang.lmb",
        damageRatio: 1,
        cost: 200,
        cd: 384.6153846153846,
        range: 110,
        presentation: {color: "#fbc7ff"},
        charge: {
          duration: 300,
          gauge: true,
          previewAtFull: true,
          costMin: 200,
          costMax: 200,
          fullCost: 250,
          costTiming: "release",
          fullSpec: {
            damageRatio: 1.25,
            cd: 692.3076923076923,
            range: 600,
            modules: [
              {type: "delivery.projectile", speed: 31, radius: 14},
              {
                type: "projectile.presentation",
                kind: "projectile-style",
                style: {
                  type: "orb",
                  radius: characterValue("attacks.lmb.charge.fullSpec.modules.0.radius"),
                  strokeColor: "251,199,255",
                  fillColor: "255,232,255"
                }
              },
              {
                type: "resource.restore",
                when: "on-hit",
                resource: "health",
                recipient: "source",
                missingResourceRatio: 0.15,
                presentation: "none"
              }
            ]
          }
        },
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.1,
            wallPolicy: "block",
            contactType: "melee"
          },
          {
            type: "resource.restore",
            when: "on-hit",
            resource: "health",
            recipient: "source",
            missingResourceRatio: 0.15,
            presentation: "none"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.nanamnang.rmb",
        damageRatio: 0,
        cost: 500,
        cd: 1000,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "state.window",
            when: "after-attack",
            stateKey: "nanamnang-sleep-heal",
            duration: 800,
            retainCompleteMs: 50,
            cancelOnDamage: true,
            data: {choice: "complete"},
            resolveDataKey: "choice",
            resolveAttackIds: {complete: "attack.nanamnang.sleep-heal"}
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "areaCircle",
            position: "source",
            range: 36,
            r: 36,
            maxR: 36,
            color: "251,199,255",
            fillAlpha: 0.08,
            strokeAlpha: 0.86,
            lineWidth: 2.5,
            durationFrames: 18,
            animation: true
          }
        ],
        tags: ["스킬"]
      },
      sleepHeal: {
        id: "attack.nanamnang.sleep-heal",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 0,
        effectsOnly: true,
        modules: [
          {
            type: "resource.restore",
            resource: "health",
            recipient: "source",
            missingResourceRatio: 0.6,
            presentation: "none"
          },
          {
            type: "effect.spawn",
            when: "after-attack",
            renderType: "healPulse",
            position: "source",
            r: 0,
            maxR: 50,
            color: "251,199,255",
            strokeColor: "251,199,255",
            fillColor: "251,199,255",
            durationFrames: 18,
            animation: true
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.nanamnang.counter",
        damageRatio: 0.75,
        cost: 0,
        cd: 700,
        range: 130,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 0.9,
            wallPolicy: "block",
            contactType: "melee"
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.nanamnang.lmb",
        input: "lmb",
        attackId: "attack.nanamnang.lmb",
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
        id: "ability.nanamnang.rmb",
        input: "rmb",
        attackId: "attack.nanamnang.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"}
          ],
          modules: [{type: "action.attack"}, {type: "status.apply", status: "sleep", duration: 800, requireExecuted: true}]
        }
      },
      counter: {
        id: "ability.nanamnang.counter",
        input: "counter",
        attackId: "attack.nanamnang.counter",
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
              cc: {type: "status.apply", status: "sleep", duration: 1200, oncePerExecution: true}
            }
          ]
        }
      }
    }
  }
