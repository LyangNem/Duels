{
    id: "mehugu",
    name: "메후구",
    title: "최고의 모험가",
    color: "#00e676",
    classification: {style: 9, range: 0, role: 5},
    stats: {maxHealth: 1300, speed: 4, radius: 20, baseDamage: 100, difficulty: 3},
    desc: "로프를 이용해 상대의 움직임을 제한하는 캐릭터",
    worldGaugeModules: [
      {
        type: "gauge.segmented",
        valueMode: "count",
        valueRef: {type: "field-count", stateKey: "rope-anchor", countMode: "anchors"},
        segments: [
          {value: 1, color: "#00e676"},
          {value: 2, color: "#00e676"},
          {value: 3, color: "#00e676"},
          {value: 4, color: "#00e676"}
        ],
        visibility: "owner",
        height: 4,
        gap: 2
      }
    ],
    tooltipSkills: [
      {key: "LMB", name: "로프 스윙", attack: "lmb", text: "부채꼴 로프 스윙 ({damage})"},
      {
        key: "LMB HOLD",
        name: "로프 내려치기",
        attack: "lmb",
        text: "최대 {chargeSeconds}초 차징 후 일직선 내려치기 및 {bindSeconds}초 속박 ({fullDamage})"
      },
      {
        key: "RMB",
        name: "로프 투척",
        attack: "rmb",
        text: "지정 지점에 로프를 투척. 적중 시 피해 및 속박 {bindSeconds}초, 벽 적중 시 로프 연결, 미 적중 시 잠시 뒤 소멸 ({damage})"
      },
      {
        key: "RMB/RMB",
        name: "로프 덫",
        attack: "rmb",
        text: "벽을 지정해 로프를 연결 시 벽과 벽을 연결하는 로프 생성, 적중 시 피해 및 속박 {bindSeconds}초 ({damage})"
      },
      {key: "L-Shift", name: "로프 난무", attack: "counter", text: "부채꼴로 로프를 {repeatCount}회 휘둘러 피해 및 속박 (타당 {damage})"}
    ],
    attacks: {
      lmb: {
        id: "attack.mehugu.lmb",
        damageRatio: 2,
        cost: 200,
        cd: 350,
        range: 170,
        charge: {
          duration: 400,
          gauge: true,
          previewAtFull: true,
          costMin: 200,
          costMax: 200,
          fullCost: 200,
          costTiming: "release",
          fullSpec: {
            damageRatio: 2.5,
            cd: 700,
            range: 220,
            modules: [
              {
                type: "delivery.area",
                shape: "rect",
                range: characterValue("attacks.lmb.charge.fullSpec.range"),
                halfWidth: 40,
                contactType: "melee"
              },
              {type: "status.apply", status: "bind", duration: 1000, oncePerExecution: true}
            ]
          }
        },
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.lmb.range"),
            halfAngle: 1.047,
            angleOffset: 0.52,
            endChord: true,
            endChordWidth: 2,
            contactType: "melee"
          }
        ],
        tags: ["평타"]
      },
      rmb: {
        id: "attack.mehugu.rmb",
        damageRatio: 2,
        cost: 400,
        cd: 750,
        range: Infinity,
        modules: [
          {
            type: "delivery.projectile",
            speed: 19.5,
            radius: 10,
            targetPoint: true,
            targetPointResolve: "none",
            damageOnTravel: false,
            stateKey: "rope-anchor-projectile",
            arrival: {
              targetRelations: ["enemy"],
              targetPriority: "before-wall",
              triggerHitEffects: true,
              passWallsInFlight: true,
              wallSnapDistance: 50,
              targetRadiusBase: "visual",
              targetRadiusScale: 3,
              linger: {duration: 1000, fadeOut: true, triggerOnEnter: true, removeOnTrigger: true, showRange: true}
            }
          },
          {type: "projectile.pierce", targets: true, walls: false},
          {
            type: "trajectory.arc",
            height: 120,
            screenLiftRatio: 0.72,
            apexScale: 0.84,
            apexAlpha: 0.4,
            apexStrokeAlpha: 0.62
          },
          {
            type: "projectile.presentation",
            kind: "weapon-projectile",
            style: {
              type: "anchor-cross",
              radius: 16,
              fillAlpha: 0.28,
              pulseMin: 0.7,
              pulseMax: 1,
              pulseSpeed: 0.014,
              strokeWidth: 3,
              innerStrokeWidth: 2.5,
              crossHalfLength: 8,
              returningAlpha: 0.55,
              showLink: false,
              ropeToSource: true,
              ropeColor: "74,222,128",
              ropeWidth: 4,
              ropeAlpha: 0.9,
              ropeLineCap: "round"
            }
          },
          {
            type: "field.area",
            stateKey: "rope-anchor",
            pairWalls: true,
            maxAnchors: 4,
            pairedVisibilityPolicy: "friendly-only",
            pairedHideFadeDuration: 300,
            revealOnTrigger: true,
            duration: "infinite",
            targetRelations: ["enemy"],
            interval: 0,
            intervalMode: "per-target",
            triggerOnEnter: true,
            removeOnTrigger: true,
            width: 28,
            anchorMode: "wall-perimeter",
            ropeColor: "74,222,128",
            ropeAlpha: 0.9,
            ropeLineWidth: 4,
            ropeLineCap: "round",
            wallOutline: true,
            wallLineWidth: 3,
            wallAlpha: 0.82,
            onTrigger: [{type: "status.apply", status: "bind", duration: 1000}]
          },
          {type: "status.apply", status: "bind", duration: 500, oncePerExecution: true}
        ],
        tags: ["스킬"]
      },
      counter: {
        id: "attack.mehugu.counter",
        damageRatio: 1.5,
        cost: 0,
        cd: 300,
        range: 190,
        modules: [
          {
            type: "delivery.area",
            shape: "sector",
            range: characterValue("attacks.counter.range"),
            halfAngle: 2.356,
            endChord: true,
            endChordWidth: 2,
            contactType: "melee",
            repeatCount: 2,
            repeatInterval: 220,
            repeatAngleFrom: -0.47123889803846897,
            repeatAngleTo: 0.47123889803846897
          }
        ],
        tags: ["반격"]
      }
    },
    abilities: {
      lmb: {
        id: "ability.mehugu.lmb",
        input: "lmb",
        attackId: "attack.mehugu.lmb",
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
        id: "ability.mehugu.rmb",
        input: "rmb",
        attackId: "attack.mehugu.rmb",
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
          modules: [{type: "action.attack"}]
        }
      },
      counter: {
        id: "ability.mehugu.counter",
        input: "counter",
        attackId: "attack.mehugu.counter",
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
              cc: {type: "status.apply", status: "bind", duration: 2000, oncePerExecution: true}
            }
          ]
        }
      }
    }
  }
