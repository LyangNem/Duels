{
  "id": "levina",
  "name": "레비나",
  "englishName": "Levina",
  "title": "악마의 거래인",
  "color": "#a63b46",
  "classification": {
    "style": 1,
    "range": 0,
    "role": 2
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 4.5,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 5
  },
  "desc": "악마의 삼지창을 조종해 적을 공격하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "삼지창",
      "attack": "lmb",
      "text": "창의 경로 지정. 창은 벽과 적을 관통 ({damage})"
    },
    {
      "key": "RMB",
      "name": "악마의 거래",
      "attack": "rmb",
      "text": "창의 경로 지정. 창은 해당 경로에서 더 높은 피해로 더 빠르게 이동하며 적중한 적을 넉백시킴 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "영혼의 계약",
      "attack": "counter",
      "text": "창의 위치로 순간이동하며 두 지점에서 피해 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.levina.lmb",
      "damageRatio": 1,
      "cost": 100,
      "cd": 300,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 13.248,
          "radius": 12,
          "hitRadius": {
            "$ref": "attacks.lmb.modules.0.radius"
          },
          "targetPoint": true,
          "targetPointClampToAttackRange": false,
          "stateKey": "levina-spear"
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.return",
          "stateKey": "levina-spear",
          "returnAttackId": "attack.levina.return-lmb",
          "speed": 23,
          "damageOnReturn": true
        },
        {
          "type": "projectile.waypoint-path",
          "stateKey": "levina-spear",
          "segmentKind": "lmb",
          "holdStateKey": "levina-spear-recall-hold",
          "returnLockAttackId": "attack.levina.lmb",
          "returnLockDuration": 300,
          "presentation": {
            "lmbColor": "166,59,70",
            "rmbColor": "230,190,50",
            "waypointLmbColor": "166,59,70",
            "waypointRmbColor": "255,220,80",
            "suppressOwnerAimLine": true
          }
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.levina.rmb",
      "damageRatio": 2.5,
      "cost": 200,
      "cd": 300,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 19.32,
          "radius": 12,
          "hitRadius": 18,
          "targetPoint": true,
          "targetPointClampToAttackRange": false,
          "stateKey": "levina-spear"
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.return",
          "stateKey": "levina-spear",
          "returnAttackId": "attack.levina.return-rmb",
          "speed": 23,
          "damageOnReturn": true
        },
        {
          "type": "projectile.waypoint-path",
          "stateKey": "levina-spear",
          "segmentKind": "rmb",
          "holdStateKey": "levina-spear-recall-hold",
          "returnLockAttackId": "attack.levina.lmb",
          "returnLockDuration": 300,
          "presentation": {
            "lmbColor": "166,59,70",
            "rmbColor": "230,190,50",
            "waypointLmbColor": "166,59,70",
            "waypointRmbColor": "255,220,80",
            "suppressOwnerAimLine": true
          }
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 26,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "lmbPath": {
      "id": "attack.levina.lmb-path",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 13.248,
          "radius": 12,
          "hitRadius": {
            "$ref": "attacks.lmbPath.modules.0.radius"
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmbPath": {
      "id": "attack.levina.rmb-path",
      "damageRatio": 2.5,
      "cost": 0,
      "cd": 0,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 19.32,
          "radius": 12,
          "hitRadius": 18
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 26,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "returnLmb": {
      "id": "attack.levina.return-lmb",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "phase": "returning",
          "speed": 23,
          "radius": 12,
          "hitRadius": {
            "$ref": "attacks.returnLmb.modules.0.radius"
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "returnRmb": {
      "id": "attack.levina.return-rmb",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "phase": "returning",
          "speed": 23,
          "radius": 12,
          "hitRadius": 18
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 26,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.3,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "166,59,70",
            "innerColor": "166,59,70",
            "strokeWidth": 3.5,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "returningAlpha": 0.6,
            "allyAlpha": 0.45
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.levina.counter",
      "damageRatio": 2.5,
      "cost": 0,
      "cd": 600,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "wallPolicy": "block"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "source",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "r": {
            "$ref": "attacks.counter.range"
          },
          "color": "166,59,70",
          "fillAlpha": 0.1,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "durationFrames": 14,
          "animation": true
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "target": {
            "type": "projectile",
            "stateKey": "levina-spear"
          },
          "stateKey": "movement:levina-counter-teleport",
          "duration": 1,
          "replaceActive": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "onEndAttackIds": [
            "attack.levina.counter-arrival"
          ],
          "presentation": false
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counterArrival": {
      "id": "attack.levina.counter-arrival",
      "damageRatio": 2.5,
      "cost": 0,
      "cd": 0,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counterArrival.range"
          },
          "wallPolicy": "block"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "source",
          "range": {
            "$ref": "attacks.counterArrival.range"
          },
          "r": {
            "$ref": "attacks.counterArrival.range"
          },
          "color": "166,59,70",
          "fillAlpha": 0.1,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "durationFrames": 14,
          "animation": true
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.levina.lmb",
      "input": "lmb",
      "attackId": "attack.levina.lmb",
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
            "type": "combat.can-act"
          }
        ],
        "modules": [
          {
            "type": "projectile.waypoint-path",
            "action": "hold-start",
            "stateKey": "levina-spear",
            "holdStateKey": "levina-spear-recall-hold",
            "threshold": 300,
            "blockFallbackWhenExists": true,
            "automaticCommandAttackId": "attack.levina.lmb-path",
            "automaticCommandKind": "lmb",
            "automaticCommandCost": 0,
            "automaticCommandDelay": 300,
            "automaticCommandKey": "lmb"
          },
          {
            "type": "action.attack"
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
            "type": "projectile.waypoint-path",
            "action": "hold-release",
            "stateKey": "levina-spear",
            "holdStateKey": "levina-spear-recall-hold",
            "threshold": 300,
            "commandAttackId": "attack.levina.lmb-path",
            "commandKind": "lmb",
            "commandCost": 100,
            "commandDelay": 300
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.levina.rmb",
      "input": "rmb",
      "attackId": "attack.levina.rmb",
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
            "type": "projectile.waypoint-path",
            "action": "append-or-fallback",
            "stateKey": "levina-spear",
            "commandAttackId": "attack.levina.rmb-path",
            "commandKind": "rmb",
            "commandCost": 200,
            "commandDelay": 300,
            "commandKey": "rmb"
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.levina.counter",
      "input": "counter",
      "attackId": "attack.levina.counter",
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
              "shape": "attack-shape",
              "projectiles": [
                {
                  "stateKey": "levina-spear",
                  "attackId": "attack.levina.counter-arrival"
                }
              ]
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
  }
}
