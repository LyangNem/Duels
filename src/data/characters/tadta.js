{
    id: "tadta",
    name: "타다타",
    englishName: "Tadta",
    title: "타락한 정령",
    color: "#2f7a40",
    classification: {style: 8, range: 0, role: 5},
    stats: {maxHealth: 1600, speed: 3.5, radius: 20, baseDamage: 50, difficulty: 3},
    desc: "타락한 덩굴의 정령에게 잠식당한 캐릭터",
    tooltipSkills: [
      {key: "LMB", name: "덩굴 씨앗", attack: "lmb", text: "덩굴 씨앗 {burstCount}발 연사 (발당 {damage})"},
      {key: "LMB BIND", name: "", attack: "lmb", showCost: false, text: "덩굴 지대 위의 적에게 적중 시 {bindSeconds}초 속박"},
      {
        key: "RMB",
        name: "덩굴 지대",
        attack: "rmb",
        detailAttack: "vineTick",
        text: "지정한 위치에 덩굴 지대 생성. 적을 감속시키며 지속 피해 (타당 {detailDamage})"
      },
      {key: "L-Shift", name: "덩굴 묶기", attack: "counter", text: "덩굴을 크게 {repeatCount}회 휘둘러 피해 및 슬로우 (타당 {damage})"},
      {key: "L-Shift BIND", name: "", attack: "counter", showCost: false, text: "슬로우된 적에게 적중 시 {bindSeconds}초 속박"}
    ],
    attacks: {
      lmb: {
        id: "attack.tadta.lmb",
        damageRatio: 1,
        cost: 350,
        cd: 800,
        range: 480,
        presentation: {color: "#2f7a40"},
        modules: [
          {type: "delivery.projectile", speed: 22, radius: 7},
          {
            type: "delivery.delayed-projectile-volley",
            count: 9,
            interval: 50,
            aimMode: "locked",
            angleOffsets: [0, -0.17, 0, 0.17, 0, -0.17, 0, 0.17, 0],
            phaseKey: "tadta-seed-burst"
          },
          {
            type: "status.apply",
            status: "bind",
            duration: 500,
            conditions: [{type: "target.status-active", status: "slow"}]
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.tadta.rmb",
        damageRatio: 0,
        cost: 400,
        cd: 1000,
        range: 550,
        presentation: {color: "#2f7a40"},
        modules: [
          {
            type: "delivery.projectile",
            speed: 18,
            radius: 10,
            damageOnTravel: false,
            collisionTargets: false,
            targetPoint: true,
            targetPointResolve: "nearest-open",
            targetPointClearance: 2,
            arrival: {passWallsInFlight: true}
          },
          {type: "projectile.pierce", targets: true, walls: true},
          {
            type: "projectile.impact",
            attackIds: ["attack.tadta.vine-tick", "attack.tadta.vine-slow-field"],
            field: {
              type: "field.area",
              stateKey: "tadta-vine-damage-zone",
              anchorMode: "point",
              shape: "circle",
              range: 180,
              wallPolicy: "block",
              duration: 4500,
              targetRelations: ["enemy"],
              interval: 1000,
              intervalMode: "per-target",
              triggerOnEnter: false,
              attackId: "attack.tadta.vine-tick",
              damageOnTrigger: true
            }
          }
        ],
        tags: ["스킬"]
      },
      vineTick: {
        id: "attack.tadta.vine-tick",
        damageRatio: 2,
        cost: 0,
        cd: 0,
        range: 180,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.vineTick.range"),
            wallPolicy: "block",
            render: false
          }
        ],
        tags: ["스킬"]
      },
      vineSlowField: {
        id: "attack.tadta.vine-slow-field",
        damageRatio: 0,
        cost: 0,
        cd: 0,
        range: 180,
        effectsOnly: true,
        modules: [
          {
            type: "field.area",
            stateKey: "tadta-vine-zone",
            anchorMode: "target-point",
            clampToAttackRange: false,
            shape: "circle",
            range: characterValue("attacks.vineSlowField.range"),
            wallPolicy: "block",
            duration: 4500,
            targetRelations: ["enemy"],
            interval: 100,
            intervalMode: "per-target",
            triggerOnEnter: true,
            damageOnTrigger: false,
            onTrigger: [
              {
                type: "status.apply",
                status: "slow",
                duration: 120,
                removeOnExit: true,
                data: {factor: characterValue("statusDefaults.slow.factor"), stackMode: "replace-source"}
              }
            ],
            presentation: {type: "slowZoneAppear", r: characterValue("attacks.vineSlowField.modules.0.range"), color: "47,122,64"}
          }
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.tadta.counter",
        damageRatio: 4,
        cost: 0,
        cd: 700,
        range: 170,
        modules: [
          {
            type: "delivery.area",
            shape: "circle",
            range: characterValue("attacks.counter.range"),
            wallPolicy: "block",
            repeatCount: 2,
            repeatInterval: 300,
            renderType: "annularDoubleSweep",
            span: 6.283185307179586,
            sweepCount: 1,
            repeatSweepDirections: ["clockwise", "counterclockwise"],
            sweepFraction: 0.55,
            fadePower: 1.5,
            lifetimeAlpha: true,
            hitColor: "47,122,64",
            color: "47,122,64",
            fillAlpha: 0.28,
            strokeAlpha: 0.95,
            lineWidth: 2.5,
            edgeLine: true,
            edgeColor: "255,255,255",
            edgeAlpha: 0.75,
            edgeLineWidth: 2.5,
            durationFrames: 22
          },
          {
            type: "status.apply",
            status: "bind",
            duration: 1000,
            conditions: [{type: "target.status-active", status: "slow"}]
          },
          {
            type: "status.apply",
            status: "slow",
            duration: 1000,
            data: {factor: characterValue("statusDefaults.slow.factor"), stackMode: "replace-source"},
            conditions: [{type: "target.status-absent", status: "slow"}]
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.tadta.lmb",
        input: "lmb",
        attackId: "attack.tadta.lmb",
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
        id: "ability.tadta.rmb",
        input: "rmb",
        attackId: "attack.tadta.rmb",
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
        id: "ability.tadta.counter",
        input: "counter",
        attackId: "attack.tadta.counter",
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
                status: "slow",
                duration: characterValue("attacks.counter.modules.1.duration"),
                conditions: [{type: "target.status-absent", status: "slow"}],
                data: {factor: characterValue("statusDefaults.slow.factor")}
              }
            }
          ]
        }
      }
    },
    statusDefaults: {slow: {factor: 0.5}}
  }
