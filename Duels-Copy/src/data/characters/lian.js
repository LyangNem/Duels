{
  "id": "lian",
  "name": "리안",
  "title": "방어의 마스터",
  "color": "#ffa500",
  "classification": {
    "style": 2,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 800,
    "speed": 4.5,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 5
  },
  "desc": "평타 방패로 상대의 공격을 막아내며 돌진으로 피해를 입히는 캐릭터",
  "dodgeMemory": {
    "stateKey": "backup",
    "window": 6000,
    "maxCount": 3
  },
  "dodgeStateWindows": [
    {
      "stateKey": "shield-dash-ready",
      "duration": 500,
      "showIndicator": false,
      "data": {
        "slot": "lmb",
        "alternateAttackId": "attack.lian.shield-dash"
      }
    }
  ],
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "valueRef": {
        "type": "timed-action-remaining",
        "stateKey": "shield-dash-ready"
      },
      "color": "#ffa500",
      "lineWidth": 3.5
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "방패 스윙",
      "attack": "lmb",
      "text": "방패를 휘둘러 공격하고 방패에 적중한 투사체를 방어 ({damage})"
    },
    {
      "key": "RMB",
      "name": "돌진 백업",
      "attack": "rmb",
      "text": "최근 {memoryCount}회의 회피 직전 위치를 {memorySeconds}초간 기억 · 가장 최근 위치로 귀환"
    },
    {
      "key": "L-Shift",
      "name": "방패 올려치기",
      "attack": "counter",
      "text": "직선 범위를 올려쳐 피해 ({damage})"
    },
    {
      "key": "Space/LMB",
      "name": "방패 돌진",
      "attack": "shieldDash",
      "text": "회피 후 {dashWindowSeconds}초 내 LMB 입력 시 전방으로 돌진하며 피해 및 넉백 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.lian.lmb",
      "damageRatio": 2,
      "cost": 150,
      "cd": 320,
      "attackDelayGroup": "lian-primary",
      "attackDelay": 320,
      "range": 140,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.3
        },
        {
          "type": "effect.spawn",
          "stateKey": "lian-lmb-shield",
          "renderType": "shieldSwing",
          "durationFrames": 10,
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": {
            "$ref": "attacks.lmb.modules.0.halfAngle"
          },
          "color": "255,119,0",
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true
        },
        {
          "type": "attack.guard",
          "stateKey": "lian-lmb-shield",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.3,
          "duration": 180,
          "onBlockExtend": 180,
          "visualState": {
            "effectStateKey": "lian-lmb-shield",
            "duration": 180,
            "color": "0,220,255"
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "shieldDash": {
      "id": "attack.lian.shield-dash",
      "damageRatio": 3.5,
      "cost": 200,
      "cd": 800,
      "attackDelayGroup": "lian-primary",
      "attackDelay": 320,
      "range": 320,
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.shieldDash.range"
        },
        "halfWidth": 50,
        "wallPolicy": "ignore"
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:lian-shield-dash",
          "direction": "attack",
          "distance": {
            "$ref": "attacks.shieldDash.range"
          },
          "duration": 200,
          "easing": "ease-out",
          "replaceActive": true,
          "cancelDodgeState": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "255,119,0",
            "width": 7,
            "alpha": 0.45,
            "duration": {
              "$ref": "attacks.shieldDash.modules.0.duration"
            }
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.shieldDash.modules.0.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": {
              "$ref": "attacks.shieldDash.range"
            },
            "easing": "ease-out",
            "clipByMovementCollision": true
          },
          "damage": {
            "pathPresentation": {
              "color": "255,119,0",
              "width": 50,
              "duration": 200
            },
            "attackId": "attack.lian.shield-dash",
            "requireMovementExecution": true,
            "movementStateKey": "movement:lian-shield-dash",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 50,
            "stopAfterFirstContact": false
          }
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 104,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "스킬",
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.lian.rmb",
      "damageRatio": 0,
      "cost": 200,
      "cd": 300,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "movement.move",
          "direction": "target-point",
          "replaceActive": true,
          "duration": 220,
          "easing": "ease-out",
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "presentation": false
        },
        {
          "type": "effect.spawn",
          "renderType": "backup",
          "durationFrames": 12,
          "color": "255,119,0"
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.lian.counter",
      "damageRatio": 3,
      "cost": 0,
      "cd": 300,
      "range": 172.9,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "rect",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "halfWidth": 45,
          "wallPolicy": "ignore"
        },
        {
          "type": "effect.spawn",
          "renderType": "shieldUppercut",
          "durationFrames": 14,
          "range": {
            "$ref": "attacks.counter.range"
          },
          "halfWidth": {
            "$ref": "attacks.counter.modules.0.halfWidth"
          },
          "color": "255,119,0",
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.lian.lmb",
      "input": "lmb",
      "attackId": "attack.lian.lmb",
      "inputPolicy": {
        "blockRepeatWhile": {
          "stateKey": "movement:move"
        }
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
              "stateKey": "shield-dash-ready",
              "attackId": "attack.lian.shield-dash",
              "consume": true
            }
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.lian.rmb",
      "input": "rmb",
      "attackId": "attack.lian.rmb",
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
            "type": "context.position-memory",
            "stateKey": "backup"
          },
          {
            "type": "action.attack"
          },
          {
            "type": "context.position-memory-consume",
            "stateKey": "backup",
            "requireExecuted": true
          }
        ]
      }
    },
    "counter": {
      "id": "ability.lian.counter",
      "input": "counter",
      "attackId": "attack.lian.counter",
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
              "type": "movement.neutralize-knockback",
              "target": "hit-target",
              "direction": "attack",
              "distance": 84,
              "speed": 10,
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  }
}
