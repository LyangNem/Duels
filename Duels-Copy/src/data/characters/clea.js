{
  "id": "clea",
  "name": "클레아",
  "englishName": "Clea",
  "title": "달의 아이",
  "color": "#213b5a",
  "classification": {
    "style": 1,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1100,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 60,
    "difficulty": 6
  },
  "desc": "상대의 반격기를 저스트 회피하고 반격기로 진입해 빠르게 난사하는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "valueRef": {
        "type": "progress",
        "stateKey": "clea-moon-shadow-gauge",
        "mode": "ratio"
      },
      "color": "#1a314f",
      "showEmpty": true,
      "maxChargeFlash": true,
      "completePulseColor": "#1a314f",
      "completePulseColorVariants": [
        {
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            }
          ],
          "color": "#87c3f5"
        }
      ]
    },
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "clea-moon-shadow",
          "activeOnly": true
        }
      ],
      "valueRef": {
        "type": "progress-timed-remaining",
        "progressStateKey": "clea-moon-shadow-gauge",
        "timedStateKey": "clea-moon-shadow"
      },
      "color": "#87c3f5",
      "shadowColor": "rgba(130,195,255,.75)",
      "shadowBlur": 6
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "정밀 공격",
      "attack": "lmb",
      "showCost": false,
      "text": "평타 홀드로 자동 연사 비활성화"
    },
    {
      "key": "LMB",
      "name": "달 전륜",
      "attack": "lmb",
      "text": "클릭 시 달 전륜을 던져 적중 시 달 그림자와 스테미나가 충전되며 날아갈수록 피해가 감소하며 느려짐 ({maxDamage}~{minDamage})"
    },
    {
      "key": "RMB",
      "name": "달 그림자",
      "attack": "rmb",
      "text": "{v:attacks.rmb.modules.0.duration|seconds}초 동안 달 그림자를 활성화. 지속시간동안 미적중 또는 모든 달 그림자 소모 시 비활성화"
    },
    {
      "key": "RMB/LMB",
      "name": "추가 전륜",
      "attack": "lmbShadow",
      "costAttack": "lmb",
      "text": "평타와 추가 전륜을 날림 ({maxDamage}~{minDamage})"
    },
    {
      "key": "L-Shift",
      "name": "슬라이딩",
      "attack": "counter",
      "text": "빠르게 슬라이딩하며 경로상의 적에게 피해. 달 그림자 {progressPercent}% 충전 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.clea.lmb",
      "damageRatio": 1.5,
      "cost": 20,
      "cd": 50,
      "range": 540.8,
      "presentation": {
        "color": "#213b5a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 31.68,
          "radius": 18,
          "speedStages": [
            {
              "startTravelRatio": 0.82,
              "speed": 12.96
            },
            {
              "startTravelRatio": 0.9,
              "speed": 5.04
            },
            {
              "startTravelRatio": 0.96,
              "speed": 1.152
            }
          ]
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 1,
          "delay": 0,
          "interval": 0,
          "aimMode": "locked",
          "perpendicularOffsets": [
            21.24
          ],
          "phaseKey": "clea-primary"
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "shape": "diamond"
          }
        },
        {
          "type": "hit.once-per-execution"
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.25,
          "multiplier": 0.8333333333333334
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.5,
          "multiplier": 0.8
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.75,
          "multiplier": 0.75
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "stamina",
          "recipient": "source",
          "amount": 60,
          "excludeTargetKinds": [
            "summon"
          ],
          "oncePerExecution": true
        },
        {
          "type": "state.window",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow",
          "duration": {
            "$ref": "attacks.rmb.modules.0.duration"
          },
          "oncePerExecution": true,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            },
            {
              "type": "target.kind-not-in",
              "kinds": [
                "summon",
                "trainingBot"
              ]
            }
          ]
        },
        {
          "type": "state.progress",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow-gauge",
          "operation": "add",
          "amount": 6,
          "max": 300,
          "oncePerExecution": true,
          "blocksStaminaRegen": false
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "clea-moon-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "lmbShadow": {
      "id": "attack.clea.lmb-shadow",
      "damageRatio": 1.5,
      "cost": 20,
      "cd": 50,
      "range": 540.8,
      "presentation": {
        "color": "#213b5a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 31.68,
          "radius": 18,
          "speedStages": [
            {
              "startTravelRatio": 0.82,
              "speed": 12.96
            },
            {
              "startTravelRatio": 0.9,
              "speed": 5.04
            },
            {
              "startTravelRatio": 0.96,
              "speed": 1.152
            }
          ]
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 2,
          "delay": 0,
          "interval": 0,
          "aimMode": "locked",
          "perpendicularOffsets": [
            21.24,
            -21.24
          ],
          "perShotProjectileOverrides": [
            {
              "radius": 18,
              "renderColor": "#213b5a"
            },
            {
              "radius": 14.08,
              "renderColor": "#87c3f5"
            }
          ],
          "phaseKey": "clea-shadow-pair"
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "shape": "diamond"
          }
        },
        {
          "type": "hit.once-per-execution"
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.25,
          "multiplier": 0.8333333333333334
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.5,
          "multiplier": 0.8
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.75,
          "multiplier": 0.75
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "stamina",
          "recipient": "source",
          "amount": 60,
          "excludeTargetKinds": [
            "summon"
          ],
          "oncePerExecution": true
        },
        {
          "type": "state.window",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow",
          "duration": {
            "$ref": "attacks.rmb.modules.0.duration"
          },
          "oncePerExecution": true,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            },
            {
              "type": "target.kind-not-in",
              "kinds": [
                "summon",
                "trainingBot"
              ]
            }
          ]
        },
        {
          "type": "state.progress",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow-gauge",
          "operation": "add",
          "amount": 6,
          "max": {
            "$ref": "attacks.lmb.modules.9.max"
          },
          "oncePerExecution": true,
          "blocksStaminaRegen": false
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "clea-moon-shadow-gauge",
          "operation": "subtract",
          "amount": 4,
          "max": {
            "$ref": "attacks.lmb.modules.9.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "operation": "clear",
          "stateKey": "clea-moon-shadow",
          "conditions": [
            {
              "type": "state.progress-lt",
              "stateKey": "clea-moon-shadow-gauge",
              "value": 4
            }
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "clea-moon-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.clea.rmb",
      "damageRatio": 0,
      "cost": 700,
      "cd": 300,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "clea-moon-shadow",
          "duration": 5000
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "operation": "clear",
          "stateKey": "clea-moon-shadow",
          "conditions": [
            {
              "type": "state.progress-lt",
              "stateKey": "clea-moon-shadow-gauge",
              "value": 4
            }
          ]
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "source",
          "range": 72,
          "r": 72,
          "color": "33,59,90",
          "fillAlpha": 0.02,
          "strokeAlpha": 0.44,
          "lineWidth": 1.5,
          "duration": 220,
          "renderLayer": "below-entities"
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.clea.counter",
      "damageRatio": 3.3333333333333335,
      "cost": 0,
      "cd": 500,
      "range": 300,
      "presentation": {
        "color": "#213b5a"
      },
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.counter.range"
        },
        "halfWidth": 44,
        "wallPolicy": "ignore"
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:clea-slide",
          "direction": "attack",
          "distance": {
            "$ref": "attacks.counter.range"
          },
          "duration": 220,
          "replaceActive": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "33,59,90",
            "width": 7,
            "alpha": 0.45,
            "duration": {
              "$ref": "attacks.counter.modules.0.duration"
            }
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.counter.modules.0.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": {
              "$ref": "attacks.counter.range"
            },
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "pathPresentation": {
              "color": "33,59,90",
              "width": 44,
              "duration": 200
            },
            "attackId": "attack.clea.counter",
            "requireMovementExecution": true,
            "movementStateKey": "movement:clea-slide",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": false
          }
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "state.window",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow",
          "duration": {
            "$ref": "attacks.rmb.modules.0.duration"
          },
          "oncePerExecution": true,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            },
            {
              "type": "target.kind-not-in",
              "kinds": [
                "summon",
                "trainingBot"
              ]
            }
          ]
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "clea-moon-shadow-gauge",
          "operation": "add",
          "amount": 150,
          "max": {
            "$ref": "attacks.lmb.modules.9.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "clea-moon-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counterShadow": {
      "id": "attack.clea.counter-shadow",
      "damageRatio": 3.3333333333333335,
      "cost": 0,
      "cd": 500,
      "range": 300,
      "presentation": {
        "color": "#87c3f5"
      },
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.counterShadow.range"
        },
        "halfWidth": 44,
        "wallPolicy": "ignore"
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:clea-slide",
          "direction": "attack",
          "distance": {
            "$ref": "attacks.counterShadow.range"
          },
          "duration": 220,
          "replaceActive": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "135,195,245",
            "width": 7,
            "alpha": 0.45,
            "duration": {
              "$ref": "attacks.counterShadow.modules.0.duration"
            }
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.counterShadow.modules.0.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": {
              "$ref": "attacks.counterShadow.range"
            },
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "pathPresentation": {
              "color": "135,195,245",
              "width": 44,
              "duration": 200
            },
            "attackId": "attack.clea.counter-shadow",
            "requireMovementExecution": true,
            "movementStateKey": "movement:clea-slide",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": false
          }
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "state.window",
          "when": "on-hit",
          "stateKey": "clea-moon-shadow",
          "duration": {
            "$ref": "attacks.rmb.modules.0.duration"
          },
          "oncePerExecution": true,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            },
            {
              "type": "target.kind-not-in",
              "kinds": [
                "summon",
                "trainingBot"
              ]
            }
          ]
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "clea-moon-shadow-gauge",
          "operation": "add",
          "amount": 150,
          "max": {
            "$ref": "attacks.lmb.modules.9.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "clea-moon-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.clea.lmb",
      "input": "lmb",
      "attackId": "attack.clea.lmb",
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
          }
        ],
        "modules": [
          {
            "type": "action.attack",
            "alternateWhen": {
              "attackId": "attack.clea.lmb-shadow",
              "conditions": [
                {
                  "type": "state.exists",
                  "stateKey": "clea-moon-shadow",
                  "activeOnly": true
                },
                {
                  "type": "state.progress-gte",
                  "stateKey": "clea-moon-shadow-gauge",
                  "value": 4
                }
              ]
            }
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.clea.rmb",
      "input": "rmb",
      "attackId": "attack.clea.rmb",
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
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.clea.counter",
      "input": "counter",
      "attackId": "attack.clea.counter",
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
            "alternateWhen": {
              "attackId": "attack.clea.counter-shadow",
              "conditions": [
                {
                  "type": "state.exists",
                  "stateKey": "clea-moon-shadow",
                  "activeOnly": true
                }
              ]
            },
            "preview": {
              "type": "preview.create",
              "shape": "attack-shape"
            },
            "cc": {
              "type": "movement.neutralize-knockback",
              "target": "hit-target",
              "direction": "attack",
              "distance": {
                "$ref": "attacks.counter.modules.2.distance"
              },
              "speed": {
                "$ref": "attacks.counter.modules.2.speed"
              },
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "moon-crescent",
      "scale": 1.8,
      "angle": -0.3,
      "rotationStateKey": "clea-moon-rotation",
      "rotationMs": 300,
      "rotationRadians": 6.283185307179586,
      "activityColors": [
        {
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "clea-moon-shadow",
              "activeOnly": true
            }
          ],
          "color": "#87c3f5"
        }
      ]
    }
  ]
}
