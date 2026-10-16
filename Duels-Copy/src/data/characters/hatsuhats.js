{
  "id": "hatsuhats",
  "name": "하츠하츠",
  "englishName": "Hatsuhats",
  "title": "부잣집 도련님",
  "color": "#aaff00",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1200,
    "speed": 4,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 3
  },
  "desc": "붓으로 공격 범위를 자유롭게 조절하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB DRAG",
      "name": "드로잉",
      "attack": "lmb",
      "costRef": {
        "ability": "lmb",
        "trigger": "trigger",
        "module": "input.drag-path",
        "format": "range",
        "minProperty": "cost.min",
        "maxProperty": "cost.max"
      },
      "text": "드래그로 사거리와 피해량을 조절. 공격범위 작을수록 피해량 상승. ({minDamage}~{maxDamage})"
    },
    {
      "key": "RMB DRAG",
      "name": "캔버스 위 세상",
      "attack": "rmb",
      "costRef": {
        "ability": "rmb",
        "trigger": "trigger",
        "module": "input.drag-path",
        "format": "per-distance",
        "property": "cost.perDistance"
      },
      "text": "드래그 경로대로 돌진. 돌진 중 받는 피해 {movementDefensePercent}% 감소"
    },
    {
      "key": "L-Shift",
      "name": "마음대로",
      "attack": "counter",
      "text": "붓을 휘둘러 원형 공격 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.hatsuhats.lmb",
      "damageRatio": 1,
      "cost": 0,
      "cd": 400,
      "range": 575,
      "progressScale": {
        "stateKey": "progress:hatsuhats:lmb",
        "range": {
          "from": {
            "$ref": "attacks.lmb.range"
          },
          "to": 112
        },
        "damageRatio": {
          "from": {
            "$ref": "attacks.lmb.damageRatio"
          },
          "to": 3
        },
        "moduleValues": [
          {
            "type": "pattern.scatter",
            "property": "spread",
            "from": 0.24,
            "to": 2.5132741228718345
          },
          {
            "type": "delivery.projectile",
            "property": "radius",
            "from": 15,
            "to": 25
          }
        ]
      },
      "modules": [
        {
          "type": "pattern.scatter",
          "count": 6,
          "spread": 0.24
        },
        {
          "type": "delivery.projectile",
          "speed": 22,
          "radius": 15,
          "hitRadius": 5
        },
        {
          "type": "projectile.collision",
          "shape": "diamond",
          "radiusScale": 1.2,
          "wall": "remove"
        },
        {
          "type": "hit.once-per-execution"
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "hatsuhats-brush-rotation",
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
      "id": "attack.hatsuhats.rmb",
      "damageRatio": 0,
      "cost": 0,
      "cd": 900,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "hatsuhats-brush-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.hatsuhats.counter",
      "damageRatio": 2,
      "cost": 0,
      "cd": 300,
      "range": 798,
      "previewProjectilePaths": true,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "circle",
          "range": 180,
          "wallPolicy": "block",
          "render": false
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 180,
          "inner": 0,
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": 0,
          "sweepFraction": 1,
          "fadePower": 1.15,
          "hitColor": "170,255,0",
          "fillAlpha": 0.18,
          "strokeAlpha": 0.9,
          "lineWidth": 3,
          "edgeLine": false,
          "duration": 300,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "hatsuhats-brush-rotation",
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
      "id": "ability.hatsuhats.lmb",
      "input": "lmb",
      "attackId": "attack.hatsuhats.lmb",
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
            "stateKey": "drag:hatsuhats:rmb"
          },
          {
            "type": "cooldowns.ready",
            "attackIds": [
              "attack.hatsuhats.lmb"
            ]
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "start",
            "stateKey": "drag:hatsuhats:lmb",
            "progressStateKey": "progress:hatsuhats:lmb",
            "distanceMode": "screen",
            "threshold": 20,
            "maxDistance": 350,
            "sampleInterval": 8,
            "cost": {
              "min": 100,
              "max": 400
            },
            "previewPath": true,
            "previewColor": "170,255,0",
            "previewLivePointer": true,
            "previewAlphaBeforeThreshold": 0.3,
            "previewAlphaActive": 0.85,
            "previewLineWidth": 2.5,
            "previewDash": [
              5,
              3
            ],
            "previewStartPoint": {
              "radius": 5,
              "color": "170,255,0",
              "alpha": 0.7
            },
            "previewEndPoint": {
              "radius": 4,
              "color": "170,255,0",
              "alpha": 0.9
            }
          },
          {
            "type": "preview.create",
            "shape": "attack-shape",
            "persistent": true,
            "followSource": true,
            "aimMode": "live-source"
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
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "release",
            "stateKey": "drag:hatsuhats:lmb",
            "progressStateKey": "progress:hatsuhats:lmb",
            "threshold": 20,
            "allowClick": true,
            "clickCost": "min"
          },
          {
            "type": "action.attack"
          },
          {
            "type": "input.drag-path",
            "operation": "clear",
            "stateKey": "drag:hatsuhats:lmb",
            "progressStateKey": "progress:hatsuhats:lmb"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.hatsuhats.rmb",
      "input": "rmb",
      "attackId": "attack.hatsuhats.rmb",
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
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "start",
            "stateKey": "drag:hatsuhats:rmb",
            "distanceMode": "world",
            "conditions": [
              {
                "type": "state.absent",
                "stateKey": "drag:hatsuhats:lmb"
              },
              {
                "type": "resource.gte",
                "resource": "stamina",
                "value": 0.001
              },
              {
                "type": "cooldowns.ready",
                "attackIds": [
                  "attack.hatsuhats.rmb"
                ]
              }
            ],
            "pathOrigin": "source",
            "threshold": 0.5,
            "sampleInterval": 8,
            "lockMovement": true,
            "cost": {
              "perDistance": 0.7
            },
            "previewPath": true,
            "previewColor": "170,255,0",
            "previewLivePointer": true,
            "previewAlphaBeforeThreshold": 0.5,
            "previewAlphaActive": 0.5,
            "previewLineWidth": 2.5,
            "previewDash": [
              8,
              4
            ]
          }
        ]
      },
      "releaseTrigger": {
        "type": "trigger",
        "event": "input.release",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "rmb"
          },
          {
            "type": "entity.alive"
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "release",
            "stateKey": "drag:hatsuhats:rmb",
            "minimumPoints": 2,
            "capturePointer": true,
            "allowClick": true,
            "conditions": [
              {
                "type": "state.exists",
                "stateKey": "drag:hatsuhats:rmb"
              }
            ]
          },
          {
            "type": "action.attack",
            "conditions": [
              {
                "type": "state.exists",
                "stateKey": "drag:hatsuhats:rmb"
              }
            ]
          },
          {
            "type": "movement.move",
            "stateKey": "movement:hatsuhats-canvas",
            "pathSource": "drag-path",
            "presentation": false,
            "speed": 900,
            "conditions": [
              {
                "type": "state.exists",
                "stateKey": "drag:hatsuhats:rmb"
              }
            ],
            "collision": {
              "passWalls": true,
              "passEnemies": true
            },
            "buffs": [
              {
                "type": "defense",
                "value": 0.5,
                "duration": "movement"
              }
            ]
          },
          {
            "type": "input.drag-path",
            "operation": "clear",
            "stateKey": "drag:hatsuhats:rmb",
            "conditions": [
              {
                "type": "state.exists",
                "stateKey": "drag:hatsuhats:rmb"
              }
            ]
          }
        ]
      }
    },
    "counter": {
      "id": "ability.hatsuhats.counter",
      "input": "counter",
      "attackId": "attack.hatsuhats.counter",
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
              "direction": "away-from-source",
              "distance": 84,
              "speed": 10,
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
      "style": "artists-brush",
      "scale": 2,
      "angle": -0.35,
      "rotationStateKey": "hatsuhats-brush-rotation",
      "rotationMs": 360,
      "rotationRadians": 6.283185307179586
    }
  ]
}
