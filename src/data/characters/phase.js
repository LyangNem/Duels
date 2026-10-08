{
  "id": "phase",
  "name": "페이즈",
  "englishName": "Phase",
  "title": "의지의 격투가",
  "color": "#8855ff",
  "classification": {
    "style": 6,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1300,
    "speed": 4,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 4
  },
  "desc": "빠른 속공으로 적을 한번에 처치하는 캐릭터",
  "passiveBuffs": [
    {
      "stat": "attackRate",
      "sourceId": "character-passive:phase:attackRate",
      "valueRef": {
        "type": "health-ratio-cooldown-scale",
        "baseCooldown": 280,
        "minCooldown": 70
      },
      "tags": [
        "버프",
        "공격속도"
      ]
    },
    {
      "stat": "staminaCost",
      "sourceId": "character-passive:phase:staminaCost",
      "valueRef": {
        "type": "missing-health-ratio",
        "from": 0,
        "to": -0.4
      },
      "tags": [
        "버프",
        "스테미나 소모 감소"
      ]
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "불굴의 의지",
      "showCost": false,
      "text": "체력이 낮을수록 공격 속도 증가 및 스테미나 소모 감소"
    },
    {
      "key": "LMB",
      "name": "패스트 펀치",
      "attack": "lmb",
      "text": "근거리 연속 펀치 ({damage})"
    },
    {
      "key": "RMB",
      "name": "점프 업",
      "attack": "rmb",
      "text": "지정 방향으로 점프"
    },
    {
      "key": "L-Shift",
      "name": "그래핑",
      "attack": "counter",
      "text": "적중한 적을 끌어당김 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.phase.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 280,
      "range": 210.6,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfWidth": 50,
          "contactType": "melee"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.phase.rmb",
      "damageRatio": 0,
      "cost": 400,
      "cd": 800,
      "range": 350,
      "modules": [
        {
          "type": "trajectory.arc",
          "height": 55,
          "screenLiftRatio": 0.55,
          "apexScale": 1,
          "apexAlpha": 1,
          "apexStrokeAlpha": 1
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "stateKey": "movement:phase-jump",
          "direction": "target-point",
          "distance": {
            "$ref": "attacks.rmb.range"
          },
          "duration": 280,
          "replaceActive": true,
          "blocksAction": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "tags": [
            "이동기"
          ],
          "presentation": false,
          "buffs": [
            {
              "type": "evasionInvulnerable",
              "value": 1,
              "duration": "movement"
            }
          ],
          "effects": [
            {
              "type": "effect.spawn",
              "renderType": "areaCircle",
              "trigger": "end",
              "position": "end",
              "range": 45,
              "r": 0,
              "maxR": 45,
              "fillAlpha": 0.18,
              "strokeAlpha": 0.9,
              "lineWidth": 2.5,
              "color": "136,85,255",
              "durationFrames": 14
            }
          ]
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.phase.counter",
      "damageRatio": 1.3333333333333333,
      "cost": 0,
      "cd": 300,
      "range": 500,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "halfWidth": 50,
          "contactType": "melee"
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.phase.lmb",
      "input": "lmb",
      "attackId": "attack.phase.lmb",
      "trigger": {
        "type": "trigger",
        "event": "input.press",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "lmb"
          },
          {
            "type": "entity.alive"
          },
          {
            "type": "ability.pending-ready"
          },
          {
            "type": "combat.can-act"
          }
        ],
        "modules": [
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.phase.rmb",
      "input": "rmb",
      "attackId": "attack.phase.rmb",
      "inputPolicy": {
        "repeatWhileHeld": false
      },
      "trigger": {
        "type": "trigger",
        "event": "input.press",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "rmb"
          },
          {
            "type": "entity.alive"
          },
          {
            "type": "ability.pending-ready"
          },
          {
            "type": "combat.can-act"
          },
          {
            "type": "state.absent",
            "stateKey": "movement:move"
          }
        ],
        "modules": [
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.phase.counter",
      "input": "counter",
      "attackId": "attack.phase.counter",
      "trigger": {
        "type": "trigger",
        "event": "input.press",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "counter"
          },
          {
            "type": "entity.alive"
          },
          {
            "type": "ability.pending-ready"
          },
          {
            "type": "combat.can-act"
          },
          {
            "type": "source.property.falsy",
            "property": "counterWindup"
          },
          {
            "type": "counter.ready"
          }
        ],
        "modules": [
          {
            "type": "counter.execute",
            "windup": 300,
            "consumeState": "counter-ready",
            "preview": {
              "type": "preview.create",
              "shape": "attack-shape"
            },
            "cc": {
              "type": "movement.pull",
              "target": "hit-target",
              "distance": 200,
              "duration": 350,
              "gap": 10,
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  }
}
