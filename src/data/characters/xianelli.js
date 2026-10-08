{
  "id": "xianelli",
  "name": "시아넬리",
  "englishName": "Xianelli",
  "title": "암살자 견습생",
  "color": "#8b1223",
  "classification": {
    "style": 2,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "순보를 이용해 위치를 교란하며 전투하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "비도술",
      "attack": "lmb",
      "text": "적을 관통하는 비도를 던져 거리에 따라 피해. 착탄 지점에 {v:attacks.lmb.modules.0.arrival.linger.duration|seconds}초간 비도를 남기며 접근 시 회수해 스테미나 {v:attacks.lmb.modules.0.arrival.linger.sourcePickupRestore.amount} 회복 ({minDamage}~{maxDamage})"
    },
    {
      "key": "RMB",
      "name": "순보",
      "attack": "rmb",
      "linkedAttack": "shunpoHit",
      "text": "현재 위치에 {v:attacks.shunpoDagger.modules.0.arrival.linger.duration|seconds}초간 비도를 남기고 조준 위치의 가까운 비도로 순간이동. 도착 지점에 피해 ({linkedDamage})"
    },
    {
      "key": "L-Shift",
      "name": "비도술 오의",
      "attack": "counter",
      "linkedAttack": "counterDagger",
      "text": "원형 회전 피해 ({damage}) / {v:attacks.counter.modules.1.count}방향 비도 피해 ({linkedMinDamage}~{linkedMaxDamage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.xianelli.lmb",
      "damageRatio": 2,
      "cost": 100,
      "cd": 500,
      "range": 500,
      "modules": [
        {
          "type": "delivery.projectile",
          "radius": 15,
          "hitRadius": {
            "$ref": "attacks.lmb.modules.0.radius"
          },
          "speed": 30,
          "arrival": {
            "linger": {
              "atRange": true,
              "atTarget": true,
              "atWall": true,
              "duration": 4000,
              "persistent": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false,
              "groupKey": "xianelli-dagger",
              "sourcePickupRange": 150,
              "sourcePickupMode": "return",
              "sourcePickupRestore": {
                "resource": "stamina",
                "amount": 100
              },
              "interaction": {
                "groupKey": "xianelli-dagger",
                "networkSync": true,
                "selectionRadius": {
                  "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRange"
                },
                "numbered": false,
                "linkToSource": true,
                "showSelectionRadius": true,
                "durationGauge": true,
                "color": "#8b1223"
              }
            }
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "projectile.return",
          "speed": 30,
          "damageOnReturn": false
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.lmb.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "pulseMin": 0.74,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "#8b1223",
            "innerColor": "#d04a61",
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false
          }
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.3333333333333333,
          "multiplier": 0.75
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.6666666666666666,
          "multiplier": 0.6666666666666666
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.xianelli.rmb",
      "damageRatio": 0,
      "cost": 200,
      "cd": 400,
      "range": 900,
      "effectsOnly": true,
      "modules": [],
      "tags": [
        "스킬"
      ]
    },
    "shunpoDagger": {
      "id": "attack.xianelli.shunpo-dagger",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.projectile",
          "radius": 15,
          "hitRadius": {
            "$ref": "attacks.shunpoDagger.modules.0.radius"
          },
          "speed": 0,
          "damageOnTravel": false,
          "collisionTargets": false,
          "expireAtRange": false,
          "arrival": {
            "linger": {
              "duration": {
                "$ref": "attacks.lmb.modules.0.arrival.linger.duration"
              },
              "persistent": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false,
              "groupKey": "xianelli-shunpo-dagger",
              "sourcePickupRange": {
                "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRange"
              },
              "sourcePickupMode": "return",
              "sourcePickupRestore": {
                "resource": "stamina",
                "amount": {
                  "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRestore.amount"
                }
              },
              "interaction": {
                "groupKey": "xianelli-shunpo-dagger",
                "networkSync": true,
                "selectionRadius": {
                  "$ref": "attacks.shunpoDagger.modules.0.arrival.linger.sourcePickupRange"
                },
                "numbered": false,
                "linkToSource": true,
                "showSelectionRadius": true,
                "durationGauge": true,
                "color": "#8b1223"
              }
            }
          }
        },
        {
          "type": "projectile.return",
          "speed": 30,
          "damageOnReturn": false
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.shunpoDagger.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "pulseMin": 0.74,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "#8b1223",
            "innerColor": "#d04a61",
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "shunpoHit": {
      "id": "attack.xianelli.shunpo-hit",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.shunpoHit.range"
          },
          "wallPolicy": "block"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "target-point",
          "range": {
            "$ref": "attacks.shunpoHit.range"
          },
          "r": {
            "$ref": "attacks.shunpoHit.range"
          },
          "maxR": {
            "$ref": "attacks.shunpoHit.range"
          },
          "color": "#8b1223",
          "fillAlpha": 0.1,
          "strokeAlpha": 0.9,
          "lineWidth": 2.5,
          "durationFrames": 10,
          "animation": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counterDagger": {
      "id": "attack.xianelli.counter-dagger",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": 500,
      "modules": [
        {
          "type": "delivery.projectile",
          "radius": 15,
          "hitRadius": {
            "$ref": "attacks.counterDagger.modules.0.radius"
          },
          "speed": 30,
          "arrival": {
            "linger": {
              "atRange": true,
              "atTarget": true,
              "atWall": true,
              "duration": {
                "$ref": "attacks.lmb.modules.0.arrival.linger.duration"
              },
              "persistent": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false,
              "groupKey": "xianelli-dagger",
              "sourcePickupRange": {
                "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRange"
              },
              "sourcePickupMode": "return",
              "sourcePickupRestore": {
                "resource": "stamina",
                "amount": {
                  "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRestore.amount"
                }
              },
              "interaction": {
                "groupKey": "xianelli-dagger",
                "networkSync": true,
                "selectionRadius": {
                  "$ref": "attacks.counterDagger.modules.0.arrival.linger.sourcePickupRange"
                },
                "numbered": false,
                "linkToSource": true,
                "showSelectionRadius": true,
                "durationGauge": true,
                "color": "#8b1223"
              }
            }
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "projectile.return",
          "speed": 30,
          "damageOnReturn": false
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.counterDagger.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "pulseMin": 0.74,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeColor": "#8b1223",
            "innerColor": "#d04a61",
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false
          }
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.3333333333333333,
          "multiplier": 0.75
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "thresholdRatio": 0.6666666666666666,
          "multiplier": 0.6666666666666666
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "targetRelations": [
            "enemy"
          ],
          "direction": "away-from-impact",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counter": {
      "id": "attack.xianelli.counter",
      "damageRatio": 2,
      "cost": 0,
      "cd": 650,
      "range": 500,
      "previewProjectilePaths": true,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 130,
          "wallPolicy": "block",
          "renderType": "annularDoubleSweep",
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "sweepFraction": 0.72,
          "fadePower": 1.5,
          "lifetimeAlpha": true,
          "hitColor": "#8b1223",
          "color": "#8b1223",
          "fillAlpha": 0.18,
          "strokeAlpha": 0.95,
          "lineWidth": 3,
          "edgeLine": true,
          "edgeColor": "#8b1223",
          "edgeAlpha": 0.95,
          "edgeLineWidth": 2.5,
          "durationFrames": 18
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "attackId": "attack.xianelli.counter-dagger",
          "count": 4,
          "delay": 0,
          "interval": 100,
          "angleOffsets": [
            0,
            1.5707963267948966,
            3.141592653589793,
            4.71238898038469
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
      "id": "ability.xianelli.lmb",
      "input": "lmb",
      "attackId": "attack.xianelli.lmb",
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
      "id": "ability.xianelli.rmb",
      "input": "rmb",
      "attackId": "attack.xianelli.rmb",
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
            "type": "context.stationary-projectile-target",
            "groupKeys": [
              "xianelli-dagger",
              "xianelli-shunpo-dagger"
            ],
            "selectionRadius": {
              "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRange"
            }
          },
          {
            "type": "action.attack"
          },
          {
            "type": "movement.stationary-projectile-swap",
            "requireExecuted": true,
            "moveStateKey": "movement:move",
            "consumeTarget": false,
            "arrivalAttackId": "attack.xianelli.shunpo-hit",
            "leaveProjectile": {
              "attackId": "attack.xianelli.shunpo-dagger",
              "groupKey": "xianelli-shunpo-dagger",
              "duration": {
                "$ref": "attacks.lmb.modules.0.arrival.linger.duration"
              },
              "interaction": {
                "groupKey": "xianelli-shunpo-dagger",
                "networkSync": true,
                "selectionRadius": {
                  "$ref": "attacks.lmb.modules.0.arrival.linger.sourcePickupRange"
                },
                "numbered": false,
                "linkToSource": true,
                "showSelectionRadius": true,
                "durationGauge": true,
                "color": "#8b1223"
              }
            },
            "presentation": {
              "type": "dash-line",
              "color": "#8b1223",
              "width": 6,
              "alpha": 0.45,
              "duration": 120
            }
          }
        ]
      }
    },
    "counter": {
      "id": "ability.xianelli.counter",
      "input": "counter",
      "attackId": "attack.xianelli.counter",
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
  }
}
