{
    id: "roon",
    name: "로온",
    englishName: "Roon",
    title: "메론 빙수",
    color: "#A5F9A6",
    classification: {style: 9, range: 0, role: 5},
    stats: {maxHealth: 1300, speed: 4.25, radius: 20, baseDamage: 150, difficulty: 4},
    desc: "적을 얼리며 빙수로 움직임을 봉쇄하는 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "얼린 멜론", attack: "lmb", text: "얼린 멜론 {burstCount}개 투척. 적중 시 빙수 게이지 증가 ({damage})"},
      {key: "LMB CRIT", name: "", attack: "lmb", text: "빙수 게이지 최대치 도달 시 {freezeSeconds}초 빙결"},
      {key: "LMB FREEZE", name: "", attack: "lmb", text: "빙결 지대 위의 적에게 적중 시 빙수 게이지가 더 빠르게 증가"},
      {key: "RMB", name: "빙수 지대", attack: "rmb", text: "커다란 빙수 투척. 적중 시 지대 중앙으로 이동. 지대 안에 적 감금. ({damage})"},
      {key: "L-Shift", name: "급속 냉동", attack: "counter", text: "한기를 내보내 즉시 빙결 및 게이지 충전. ({damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.roon.lmb",
        damageRatio: 1.3333333333333333,
        cost: 300,
        cd: 500,
        range: 400,
        presentation: {color: "#A5F9A6"},
        modules: [
          {type: "delivery.projectile", speed: 20.4, radius: 14},
          {type: "delivery.delayed-projectile-volley", count: 2, delay: 0, interval: 150, aimMode: "locked"},
          {
            type: "state.progress",
            when: "on-hit",
            recipient: "target",
            stateKey: "roon-slush",
            operation: "add",
            amount: 1,
            max: 8,
            amountVariants: [{amount: 2, conditions: [{type: "field.contains-target", stateKey: "roon-slush-zone"}]}],
            presentation: {
              type: "segmented-gauge",
              height: 4,
              gap: 2,
              valueMode: "count",
              activeAlpha: 0.95,
              background: "rgba(10,18,22,0.92)",
              stroke: "rgba(165,249,166,0.34)",
              segments: [
                {value: 1, color: "#A5F9A6"},
                {value: 2, color: "#A5F9A6"},
                {value: 3, color: "#A5F9A6"},
                {value: 4, color: "#A5F9A6"},
                {value: 5, color: "#A5F9A6"},
                {value: 6, color: "#A5F9A6"},
                {value: 7, color: "#A5F9A6"},
                {value: 8, color: "#A5F9A6"}
              ]
            },
            onFull: {status: "freeze", duration: 700, reset: true}
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.roon.rmb",
        damageRatio: 1,
        cost: 800,
        cd: 1000,
        range: 550,
        presentation: {color: "#7aeeff"},
        modules: [
          {type: "delivery.projectile", speed: 16.25, radius: 30, stateKey: "roon-blizzard"},
          {type: "projectile.pierce", targets: false, walls: true},
          {
            type: "projectile.impact",
            sourceRelocate: {reasons: ["target"], duration: 1, collision: {passWalls: true, passEnemies: true}, tags: ["이동기"]},
            cooldown: {attackId: "attack.roon.rmb", duration: 1000, reasons: ["range", "boundary", "wall"]},
            field: {
              reasons: ["target"],
              type: "field.area",
              stateKey: "roon-slush-zone",
              shape: "circle",
              range: 160,
              wallPolicy: "ignore",
              duration: 5000,
              activeDuration: 4000,
              damageOnTrigger: false,
              targetRelations: ["enemy"],
              containEnteredTargets: true,
              containDodgeEscape: false,
              presentation: {
                type: "areaCircle",
                color: "122,238,255",
                strokeColor: "165,249,166",
                strokeColorMode: "explicit",
                fillAlpha: 0.22,
                strokeAlpha: 0.8,
                lineWidth: 3,
                fadeOut: false,
                initialVisibleDuration: 4000,
                innerRingScale: 0.6,
                innerRingStrokeColor: "200,255,255",
                innerRingStrokeAlpha: 0.35,
                innerRingLineWidth: 1.5,
                remainingArcGauge: true,
                remainingArcOffset: 8,
                remainingArcLineWidth: 3.5,
                remainingArcColor: "165,249,166",
                remainingArcAlpha: 0.9
              }
            }
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.roon.counter",
        damageRatio: 1.3333333333333333,
        cost: 0,
        cd: 400,
        range: 160,
        presentation: {color: "#A5F9A6"},
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 1.1,
            contactType: "melee",
            wallPolicy: "block"
          },
          {
            type: "state.progress",
            when: "on-hit",
            recipient: "target",
            stateKey: "roon-slush",
            operation: "add",
            amount: 4,
            max: characterValue("attacks.lmb.modules.2.max"),
            presentation: {
              type: "segmented-gauge",
              height: 4,
              gap: 2,
              valueMode: "count",
              activeAlpha: 0.95,
              background: "rgba(10,18,22,0.92)",
              stroke: "rgba(165,249,166,0.34)",
              segments: [
                {value: 1, color: "#A5F9A6"},
                {value: 2, color: "#A5F9A6"},
                {value: 3, color: "#A5F9A6"},
                {value: 4, color: "#A5F9A6"},
                {value: 5, color: "#A5F9A6"},
                {value: 6, color: "#A5F9A6"},
                {value: 7, color: "#A5F9A6"},
                {value: 8, color: "#A5F9A6"}
              ]
            },
            onFull: {status: "freeze", duration: 700, reset: true}
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.roon.lmb",
        input: "lmb",
        attackId: "attack.roon.lmb",
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
        id: "ability.roon.rmb",
        input: "rmb",
        attackId: "attack.roon.rmb",
        trigger: {
          type: "trigger",
          event: "input.press",
          conditions: [
            {type: "input.slot", slot: "rmb"},
            {type: "entity.alive"},
            {type: "ability.pending-ready"},
            {type: "combat.can-act"},
            {type: "field.exists", stateKey: "roon-slush-zone", negate: true}
          ],
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.roon.counter",
        input: "counter",
        attackId: "attack.roon.counter",
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
                type: "status.apply",
                status: "freeze",
                duration: 800,
                data: {
                  ratio: characterValue("statusDefaults.freeze.ratio"),
                  interval: characterValue("statusDefaults.freeze.interval")
                }
              }
            }
          ]
        }
      }
    },
    statusDefaults: {freeze: {ratio: 0.05, interval: 1000}}
  }
