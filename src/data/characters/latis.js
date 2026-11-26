{
  "id": "latis",
  "name": "라티스",
  "englishName": "Latis",
  "title": "능숙한 낚시꾼",
  "color": "#358fb8",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1300,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 3
  },
  "desc": "낚싯대를 휘두르고 미끼에 걸린 적을 끌어당겨 제압하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "낚싯대 휘두르기",
      "attack": "lmb",
      "text": "낚싯대를 휘둘러 큰 부채꼴 범위에 피해 ({damage})"
    },
    {
      "key": "RMB",
      "name": "미끼",
      "attack": "rmb",
      "text": "전방으로 벽을 관통하는 낚시찌를 던져 맞은 적에게 피해 ({damage})"
    },
    {
      "key": "RMB/RMB",
      "name": "월척",
      "attack": "rmbRecast",
      "text": "미끼 적중 후 {v:attacks.rmb.modules.2.duration|seconds}초 안에 재사용하면 맞은 적을 약하게 끌어당기며 피해 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "내려치기",
      "attack": "counter",
      "text": "낚싯대를 강하게 내려쳐 피해 및 무력화 넉백 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.latis.lmb",
      "damageRatio": 1.3333333333333333,
      "cost": 150,
      "cd": 450,
      "range": 225,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 225,
          "wallPolicy": "block",
          "contactType": "melee",
          "halfAngle": 1.35
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "latis-rod-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ],
      "presentation": {
        "color": "#358fb8"
      }
    },
    "rmb": {
      "id": "attack.latis.rmb",
      "damageRatio": 0.6666666666666666,
      "cost": 300,
      "cd": 1500,
      "range": 600,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 30,
          "radius": 14
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": true
        },
        {
          "type": "state.window",
          "when": "on-hit",
          "stateKey": "latis-hook",
          "duration": 2000,
          "captureHitTarget": true,
          "oncePerExecution": true,
          "data": {
            "networkSync": true
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "latis-rod-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "showLink": true,
            "linkAlpha": 0.5,
            "linkWidth": 1.5,
            "linkDash": [
              5,
              5
            ]
          }
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#358fb8"
      }
    },
    "rmbRecast": {
      "id": "attack.latis.rmbRecast",
      "damageRatio": 0.6666666666666666,
      "cost": 100,
      "cd": 0,
      "range": 0,
      "modules": [
        {
          "type": "delivery.target",
          "targetRelations": [
            "enemy"
          ]
        },
        {
          "type": "movement.pull",
          "target": "hit-target",
          "distance": 200,
          "speed": 8,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "latis-rod-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#358fb8"
      }
    },
    "counter": {
      "id": "attack.latis.counter",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 300,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": 300,
          "wallPolicy": "block",
          "contactType": "melee",
          "halfWidth": 65
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 100,
          "speed": 12,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "latis-rod-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#358fb8"
      }
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.latis.lmb",
      "input": "lmb",
      "attackId": "attack.latis.lmb",
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
      "id": "ability.latis.rmb",
      "input": "rmb",
      "attackId": "attack.latis.rmb",
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
          }
        ],
        "modules": [
          {
            "type": "action.attack",
            "alternates": [
              {
                "attackId": "attack.latis.rmbRecast",
                "stateKey": "latis-hook",
                "targetStateKey": "latis-hook",
                "consume": true,
                "conditions": [
                  {
                    "type": "state.exists",
                    "stateKey": "latis-hook",
                    "activeOnly": true
                  }
                ]
              }
            ]
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    },
    "counter": {
      "id": "ability.latis.counter",
      "input": "counter",
      "attackId": "attack.latis.counter",
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
            "ccRefAttackId": "attack.latis.counter"
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "fishing-rod",
      "scale": 1.8,
      "alpha": 0.55,
      "angle": -0.65,
      "rotationStateKey": "latis-rod-motion",
      "rotationMs": 400,
      "rotationRadians": 6.283185307179586
    }
  ],
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "latis-hook",
          "activeOnly": true
        }
      ],
      "valueRef": {
        "type": "timed-action-remaining",
        "stateKey": "latis-hook"
      },
      "color": "#358fb8",
      "maxChargeFlash": true,
      "showEmpty": false
    }
  ],
  "conditionalTargetLinks": [
    {
      "visibility": "owner",
      "relation": "enemy",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "latis-hook",
          "activeOnly": true
        },
        {
          "type": "target.matches-state-target",
          "stateKey": "latis-hook"
        }
      ],
      "color": "#358fb8",
      "alpha": 0.5,
      "lineWidth": 1.5,
      "dash": [
        5,
        5
      ]
    }
  ]
}
