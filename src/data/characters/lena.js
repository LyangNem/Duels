{
  "id": "lena",
  "name": "레나",
  "englishName": "Lena",
  "title": "샹큼한 레몬",
  "color": "#e4ed36",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 5
  },
  "stats": {
    "maxHealth": 1200,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 1
  },
  "desc": "공격을 빠르게 이어 강한 넉백과 감전으로 적을 제어하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "짜릿할거야!",
      "showCost": false,
      "text": "공격 후 0.5초 안에 다음 공격을 사용하면 강한 넉백 및 5초 감전 추가"
    },
    {
      "key": "LMB",
      "name": "보드 스윙!",
      "attack": "lmb",
      "text": "보드로 전방의 적을 후려쳐 피해 ({damage})"
    },
    {
      "key": "RMB",
      "name": "샹큼하게 전진!",
      "attack": "rmb",
      "linkedAttack": "rmbImpact",
      "text": "적 또는 벽에 적중 시 주변에 피해 ({linkedDamage})"
    },
    {
      "key": "L-Shift",
      "name": "앗, 셔!",
      "attack": "counter",
      "text": "보드를 한 바퀴 휘둘러 주변에 피해 및 무력화 넉백 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.lena.lmb",
      "damageRatio": 0.6666666666666666,
      "cost": 100,
      "cd": 350,
      "range": 240,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 240,
          "wallPolicy": "block",
          "contactType": "melee",
          "halfAngle": 1.1
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        }
      ],
      "tags": [
        "평타"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    },
    "counter": {
      "id": "attack.lena.counter",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 280,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 280,
          "wallPolicy": "block",
          "contactType": "melee"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 100,
          "speed": 16,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 280,
          "inner": 0,
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": 3.141592653589793,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "228,237,54",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "edgeLine": false,
          "duration": 300,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    },
    "rmb": {
      "id": "attack.lena.rmb",
      "damageRatio": 0.0,
      "cost": 300,
      "cd": 1200,
      "range": 360,
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:lena-board",
          "direction": "attack",
          "distance": 360,
          "duration": 180,
          "replaceActive": true,
          "collision": {
            "passWalls": false,
            "passEnemies": false
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "228,237,54",
            "width": 7,
            "alpha": 0.45,
            "duration": 180,
            "trail": true
          },
          "onEndAttackIds": [
            "attack.lena.rmbImpact"
          ],
          "onEndBeforeMaxDistance": true
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": 180,
          "animation": {
            "mode": "forward",
            "distance": 360,
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "attackId": "attack.lena.rmb",
            "requireMovementExecution": true,
            "movementStateKey": "movement:lena-board",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 38,
            "stopAfterFirstContact": true,
            "contactOnly": true,
            "confirmContact": true
          }
        },
        {
          "type": "hit.sequence",
          "oncePerExecution": true,
          "steps": [],
          "sourceModules": [
            {
              "type": "movement.stop",
              "snapToTargetContact": true,
              "allowDeadTarget": true
            }
          ],
          "authority": "source",
          "retainOnTargetDeath": true
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#e4ed36"
      },
      "effectsOnly": true,
      "previewGeometry": {
        "shape": "rect",
        "range": 360,
        "halfWidth": 38,
        "wallPolicy": "block"
      }
    },
    "rmbImpact": {
      "id": "attack.lena.rmbImpact",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 180,
          "wallPolicy": "block",
          "contactType": "melee"
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    },
    "rmbBoost": {
      "id": "attack.lena.rmbBoost",
      "damageRatio": 0.0,
      "cost": 300,
      "cd": 1200,
      "range": 360,
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:lena-board",
          "direction": "attack",
          "distance": 360,
          "duration": 180,
          "replaceActive": true,
          "collision": {
            "passWalls": false,
            "passEnemies": false
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "228,237,54",
            "width": 7,
            "alpha": 0.45,
            "duration": 180,
            "trail": true
          },
          "onEndAttackIds": [
            "attack.lena.rmbImpactBoost"
          ],
          "onEndBeforeMaxDistance": true
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": 180,
          "animation": {
            "mode": "forward",
            "distance": 360,
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "attackId": "attack.lena.rmbBoost",
            "requireMovementExecution": true,
            "movementStateKey": "movement:lena-board",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 38,
            "stopAfterFirstContact": true,
            "contactOnly": true,
            "confirmContact": true
          }
        },
        {
          "type": "hit.sequence",
          "oncePerExecution": true,
          "steps": [],
          "sourceModules": [
            {
              "type": "movement.stop",
              "snapToTargetContact": true,
              "allowDeadTarget": true
            }
          ],
          "authority": "source",
          "retainOnTargetDeath": true
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#e4ed36"
      },
      "effectsOnly": true,
      "previewGeometry": {
        "shape": "rect",
        "range": 360,
        "halfWidth": 38,
        "wallPolicy": "block"
      }
    },
    "rmbImpactBoost": {
      "id": "attack.lena.rmbImpactBoost",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 180,
          "wallPolicy": "block",
          "contactType": "melee"
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 180,
          "speed": 16,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "zap",
          "duration": 5000
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    },
    "lmbBoost": {
      "id": "attack.lena.lmbBoost",
      "damageRatio": 0.6666666666666666,
      "cost": 100,
      "cd": 350,
      "range": 240,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 240,
          "wallPolicy": "block",
          "contactType": "melee",
          "halfAngle": 1.1
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 180,
          "speed": 16,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "zap",
          "duration": 5000
        }
      ],
      "tags": [
        "평타"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    },
    "counterBoost": {
      "id": "attack.lena.counterBoost",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 280,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 280,
          "wallPolicy": "block",
          "contactType": "melee"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 180,
          "speed": 16,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lena-board-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "lena-combo",
          "duration": 500
        },
        {
          "type": "status.apply",
          "status": "zap",
          "duration": 5000
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 280,
          "inner": 0,
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": 3.141592653589793,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "228,237,54",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "edgeLine": false,
          "duration": 300,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#e4ed36"
      }
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.lena.lmb",
      "input": "lmb",
      "attackId": "attack.lena.lmb",
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
          },
          {
            "type": "ability.lock",
            "when": "handled",
            "duration": 350
          }
        ]
      },
      "inputAttackAlternates": [
        {
          "attackId": "attack.lena.lmbBoost",
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "lena-combo",
              "activeOnly": true
            }
          ]
        }
      ]
    },
    "rmb": {
      "id": "ability.lena.rmb",
      "input": "rmb",
      "attackId": "attack.lena.rmb",
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
          },
          {
            "type": "ability.lock",
            "when": "handled",
            "duration": 1200
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      },
      "inputAttackAlternates": [
        {
          "attackId": "attack.lena.rmbBoost",
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "lena-combo",
              "activeOnly": true
            }
          ]
        }
      ]
    },
    "counter": {
      "id": "ability.lena.counter",
      "input": "counter",
      "attackId": "attack.lena.counter",
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
            "ccRefAttackId": "attack.lena.counter"
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      },
      "inputAttackAlternates": [
        {
          "attackId": "attack.lena.counterBoost",
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "lena-combo",
              "activeOnly": true
            }
          ]
        }
      ]
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "lemon-board",
      "scale": 1.9,
      "alpha": 0.55,
      "rotationStateKey": "lena-board-motion",
      "rotationMs": 350,
      "rotationRadians": 6.283185307179586,
      "facing": "movement",
      "angle": 1.5707963267948966,
      "facingMovementStateKey": "movement:lena-board"
    }
  ],
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "lena-combo",
          "activeOnly": true
        }
      ],
      "valueRef": {
        "type": "timed-action-remaining",
        "stateKey": "lena-combo"
      },
      "color": "#e4ed36",
      "showEmpty": false,
      "maxChargeFlash": true
    }
  ]
}
