{
  "id": "mainmad",
  "name": "메인마드",
  "title": "광산의 엘리트",
  "color": "#795548",
  "classification": {
    "style": 4,
    "range": 0,
    "role": 3
  },
  "stats": {
    "maxHealth": 1500,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 4
  },
  "desc": "드릴 건틀렛을 차징해 한방 딜교환으로 승부수를 띄우는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB HOLD",
      "name": "드릴 건틀렛",
      "attack": "lmb",
      "text": "누르고 있으면 차징 후 떼면 발동 ({minDamage}~{maxDamage})"
    },
    {
      "key": "RMB",
      "name": "굴파기",
      "attack": "rmb",
      "text": "지하로 땅을 파고 이동"
    },
    {
      "key": "L-Shift",
      "name": "내려치기",
      "attack": "counter",
      "text": "원형 범위를 내려치며 적중 시 기절 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.mainmad.lmb",
      "damageRatio": 2,
      "cost": 0,
      "cd": 350,
      "range": 120,
      "charge": {
        "duration": 1000,
        "costMin": 150,
        "costMax": 400,
        "costTiming": "during-charge",
        "staminaRegenDuringCharge": false,
        "damageRatio": {
          "from": {
            "$ref": "attacks.lmb.damageRatio"
          },
          "to": 6
        },
        "range": {
          "from": {
            "$ref": "attacks.lmb.range"
          },
          "to": 200
        },
        "gauge": true,
        "preview": {
          "fillColor": "200,120,50",
          "fillAlpha": 0.14,
          "strokeColor": "255,255,255",
          "strokeAlpha": 0.55,
          "lineWidth": 1.5,
          "dash": [
            7,
            5
          ]
        }
      },
      "presentation": {
        "chargeColors": [
          {
            "min": 0,
            "color": "150,85,35"
          },
          {
            "min": 0.4,
            "color": "180,110,45"
          },
          {
            "min": 0.8,
            "color": "210,140,60"
          }
        ],
        "durationFrames": 10
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfWidth": 40,
          "contactType": "melee"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.mainmad.rmb",
      "damageRatio": 0,
      "cost": 450,
      "cd": 900,
      "range": 640,
      "modules": [
        {
          "type": "movement.move",
          "stateKey": "movement:move",
          "distance": {
            "$ref": "attacks.rmb.range"
          },
          "duration": 800,
          "control": "input",
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
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
              "preset": "under-move",
              "trigger": "start",
              "variant": "idle",
              "position": "start",
              "duration": "movement"
            },
            {
              "type": "effect.spawn",
              "preset": "under-move",
              "trigger": "start",
              "variant": "pulse",
              "position": "start",
              "range": 50,
              "durationFrames": 14
            },
            {
              "type": "effect.spawn",
              "preset": "under-move",
              "trigger": "end",
              "variant": "idle",
              "position": "end",
              "duration": "movement"
            },
            {
              "type": "effect.spawn",
              "preset": "under-move",
              "trigger": "end",
              "variant": "pulse",
              "position": "end",
              "range": 50,
              "durationFrames": 14
            }
          ],
          "presentation": false
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.mainmad.counter",
      "damageRatio": 2.5,
      "cost": 0,
      "cd": 300,
      "range": 170,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counter.range"
          },
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
      "id": "ability.mainmad.lmb",
      "input": "lmb",
      "attackId": "attack.mainmad.lmb",
      "inputPolicy": {
        "repeatWhileHeld": false
      },
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
          },
          {
            "type": "state.absent",
            "stateKey": "movement:phase-jump"
          },
          {
            "type": "state.absent",
            "stateKey": "charge:primary"
          }
        ],
        "modules": [
          {
            "type": "charge.attack.start",
            "stateKey": "charge:primary"
          }
        ]
      },
      "releaseTrigger": {
        "type": "trigger",
        "event": "input.release",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "lmb"
          },
          {
            "type": "entity.alive"
          },
          {
            "type": "state.exists",
            "stateKey": "charge:primary"
          }
        ],
        "modules": [
          {
            "type": "charge.attack.release",
            "stateKey": "charge:primary",
            "deferWhileMovement": true
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.mainmad.rmb",
      "input": "rmb",
      "attackId": "attack.mainmad.rmb",
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
            "type": "combat.can-act"
          }
        ],
        "modules": [
          {
            "type": "movement.finish-active",
            "stateKey": "movement:move"
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.mainmad.counter",
      "input": "counter",
      "attackId": "attack.mainmad.counter",
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
            "type": "state.absent",
            "stateKey": "movement:move"
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
              "type": "status.apply",
              "status": "stun",
              "duration": 1000,
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  }
}
