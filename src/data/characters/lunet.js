{
  "id": "lunet",
  "name": "루네트",
  "englishName": "Lunet",
  "title": "술의 정령",
  "color": "#8f183b",
  "classification": {
    "style": 8,
    "range": 0,
    "role": 4
  },
  "stats": {
    "maxHealth": 1100,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "술이 퍼진 지대로 적을 압박하고 아군을 치유하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "취기",
      "showCost": false,
      "text": "최대 체력인 아군에게 재생 부여 시 재생 지속시간 동안 이동속도 {v:attacks.lmb.modules.2.field.onTrigger.0.value|percent}% 증가"
    },
    {
      "key": "LMB",
      "name": "블루 큐라소",
      "attack": "lmb",
      "text": "술을 투척해 지대 생성. 밟은 적에게 독, 아군에게 재생 {v:attacks.lmb.modules.2.field.onTrigger.2.duration|seconds}초 부여 (초당 피해 {v:attacks.lmb.modules.2.field.onTrigger.2.data.value}/회복 {v:attacks.lmb.modules.2.field.onTrigger.1.value})"
    },
    {
      "key": "RMB",
      "name": "스피릭터스 렉티피코와니",
      "attack": "rmb",
      "text": "독한 술을 투척해 넓은 지대 생성. 밟은 적에게 독, 아군에게 재생 {v:attacks.rmb.modules.2.field.onTrigger.2.duration|seconds}초 부여 (초당 피해 {v:attacks.rmb.modules.2.field.onTrigger.2.data.value}/회복 {v:attacks.rmb.modules.2.field.onTrigger.1.value})"
    },
    {
      "key": "L-Shift",
      "name": "XYZ",
      "attack": "counter",
      "text": "자신과 모든 아군 및 적에게 칵테일 투척. 착탄 범위의 적에게 피해 및 독, 아군에게 착탄 회복 및 재생 {v:attacks.cocktailBurst.modules.2.duration|seconds}초 부여 (착탄 {linkedDamage} / 초당 피해 {v:attacks.cocktailBurst.modules.4.data.value}/회복 {v:attacks.cocktailBurst.modules.2.value})",
      "linkedAttack": "cocktailBurst"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.lunet.lmb",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 250,
      "cd": 500,
      "range": 422.5,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 16,
          "radius": 14,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "damageOnTravel": false,
          "collisionTargets": false
        },
        {
          "type": "trajectory.arc",
          "height": 75
        },
        {
          "type": "projectile.impact",
          "reasons": [
            "target-point",
            "range",
            "wall",
            "boundary"
          ],
          "field": {
            "type": "field.area",
            "stateKey": "lunet-lmb",
            "anchorMode": "point",
            "shape": "circle",
            "range": 120,
            "wallPolicy": "block",
            "duration": 2000,
            "interval": 1000,
            "intervalMode": "per-target",
            "triggerOnEnter": true,
            "targetRelations": [
              "enemy",
              "ally",
              "self"
            ],
            "damageOnTrigger": false,
            "onTrigger": [
              {
                "type": "modifier.set",
                "stat": "speed",
                "value": 0.25,
                "duration": 2000,
                "stackGroup": "lunet-tipsy",
                "targetRelations": [
                  "ally",
                  "self"
                ],
                "conditions": [
                  {
                    "type": "target.health-ratio-gte",
                    "value": 1
                  }
                ]
              },
              {
                "type": "modifier.set",
                "stat": "regeneration",
                "value": 100,
                "duration": 2000,
                "targetRelations": [
                  "ally",
                  "self"
                ],
                "stackGroup": "lunet-healing",
                "data": {
                  "tickInterval": 1000,
                  "presentationSource": "zone",
                  "localOnly": true
                }
              },
              {
                "type": "status.apply",
                "status": "poison",
                "duration": 2000,
                "targetRelations": [
                  "enemy"
                ],
                "data": {
                  "mode": "flat",
                  "value": 50.0,
                  "interval": 1000,
                  "tickAtEnd": true,
                  "stackMode": "refresh-source",
                  "damagePriority": "highest"
                }
              }
            ],
            "presentation": {
              "type": "areaCircle",
              "color": "#8f183b",
              "strokeColor": "#8f183b",
              "strokeColorMode": "explicit",
              "fillAlpha": 0.08,
              "strokeAlpha": 0.72,
              "lineWidth": 2.5,
              "innerRingScale": 0.62,
              "innerRingStrokeColor": "#8f183b",
              "innerRingStrokeAlpha": 0.34,
              "innerRingLineWidth": 1.5,
              "remainingArcGauge": true,
              "remainingArcOffset": 7,
              "remainingArcLineWidth": 3,
              "remainingArcColor": "#8f183b",
              "remainingArcAlpha": 0.85
            }
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lunet-bottle",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "projectile.pierce",
          "walls": true,
          "targets": false
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.lunet.rmb",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 500,
      "cd": 1000,
      "range": 455.0,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 22,
          "radius": 20,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "damageOnTravel": false,
          "collisionTargets": false
        },
        {
          "type": "trajectory.arc",
          "height": 75
        },
        {
          "type": "projectile.impact",
          "reasons": [
            "target-point",
            "range",
            "wall",
            "boundary"
          ],
          "field": {
            "type": "field.area",
            "stateKey": "lunet-rmb",
            "anchorMode": "point",
            "shape": "circle",
            "range": 176,
            "wallPolicy": "block",
            "duration": 3000,
            "interval": 1000,
            "intervalMode": "per-target",
            "triggerOnEnter": true,
            "targetRelations": [
              "enemy",
              "ally",
              "self"
            ],
            "damageOnTrigger": false,
            "onTrigger": [
              {
                "type": "modifier.set",
                "stat": "speed",
                "value": 0.25,
                "duration": 3000,
                "stackGroup": "lunet-tipsy",
                "targetRelations": [
                  "ally",
                  "self"
                ],
                "conditions": [
                  {
                    "type": "target.health-ratio-gte",
                    "value": 1
                  }
                ]
              },
              {
                "type": "modifier.set",
                "stat": "regeneration",
                "value": 100,
                "duration": 3000,
                "targetRelations": [
                  "ally",
                  "self"
                ],
                "stackGroup": "lunet-healing",
                "data": {
                  "tickInterval": 1000,
                  "presentationSource": "zone",
                  "localOnly": true
                }
              },
              {
                "type": "status.apply",
                "status": "poison",
                "duration": 3000,
                "targetRelations": [
                  "enemy"
                ],
                "data": {
                  "mode": "flat",
                  "value": 50.0,
                  "interval": 1000,
                  "tickAtEnd": true,
                  "stackMode": "refresh-source",
                  "damagePriority": "highest"
                }
              }
            ],
            "presentation": {
              "type": "areaCircle",
              "color": "#8f183b",
              "strokeColor": "#8f183b",
              "strokeColorMode": "explicit",
              "fillAlpha": 0.08,
              "strokeAlpha": 0.72,
              "lineWidth": 2.5,
              "innerRingScale": 0.62,
              "innerRingStrokeColor": "#8f183b",
              "innerRingStrokeAlpha": 0.34,
              "innerRingLineWidth": 1.5,
              "remainingArcGauge": true,
              "remainingArcOffset": 7,
              "remainingArcLineWidth": 3,
              "remainingArcColor": "#8f183b",
              "remainingArcAlpha": 0.85
            }
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lunet-bottle",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "projectile.pierce",
          "walls": true,
          "targets": false
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "cocktail": {
      "id": "attack.lunet.cocktail",
      "damageRatio": 0,
      "effectsOnly": false,
      "cost": 0,
      "cd": 1000,
      "range": 5000,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 22,
          "radius": 14,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "damageOnTravel": false,
          "collisionTargets": false,
          "selfArc": {
            "duration": 520,
            "height": 96
          }
        },
        {
          "type": "trajectory.arc",
          "height": 75
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.lunet.cocktailBurst"
          ],
          "reasons": [
            "target-point",
            "range",
            "wall",
            "boundary"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "lunet-bottle",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "projectile.pierce",
          "walls": true,
          "targets": false
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counter": {
      "id": "attack.lunet.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 300,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.target-volley",
          "attackId": "attack.lunet.cocktail",
          "targetRelations": [
            "ally",
            "enemy",
            "self"
          ]
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "cocktailBurst": {
      "id": "attack.lunet.cocktailBurst",
      "damageRatio": 0.5,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 150,
          "wallPolicy": "block",
          "targetRelations": [
            "enemy",
            "ally",
            "self"
          ],
          "applyHitEffects": true
        },
        {
          "type": "modifier.set",
          "stat": "speed",
          "value": 0.25,
          "duration": 3000,
          "stackGroup": "lunet-tipsy",
          "targetRelations": [
            "ally",
            "self"
          ],
          "conditions": [
            {
              "type": "target.health-ratio-gte",
              "value": 1
            }
          ],
          "when": "on-hit",
          "recipient": "target",
          "sourceId": "lunet:cocktail-speed",
          "oncePerExecution": true
        },
        {
          "type": "modifier.set",
          "when": "on-hit",
          "stat": "regeneration",
          "recipient": "target",
          "value": 100,
          "duration": 3000,
          "targetRelations": [
            "ally",
            "self"
          ],
          "sourceId": "lunet:cocktail-regen",
          "oncePerExecution": true,
          "data": {
            "tickInterval": 1000,
            "presentationSource": "zone",
            "localOnly": true
          }
        },
        {
          "type": "movement.neutralize-knockback",
          "when": "on-hit",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 84,
          "speed": 10,
          "targetRelations": [
            "enemy"
          ],
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "poison",
          "duration": 3000,
          "targetRelations": [
            "enemy"
          ],
          "data": {
            "mode": "flat",
            "value": 50.0,
            "interval": 1000,
            "tickAtEnd": true,
            "stackMode": "refresh-source",
            "damagePriority": "highest"
          },
          "when": "on-hit",
          "oncePerExecution": true
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "health",
          "recipient": "target",
          "targetRelations": [
            "ally",
            "self"
          ],
          "amount": 50,
          "oncePerExecution": true,
          "presentation": "ability"
        }
      ],
      "tags": [
        "반격"
      ],
      "effectsOnly": false
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.lunet.lmb",
      "input": "lmb",
      "attackId": "attack.lunet.lmb",
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
            "type": "action.attack"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.lunet.rmb",
      "input": "rmb",
      "attackId": "attack.lunet.rmb",
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
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.lunet.counter",
      "input": "counter",
      "attackId": "attack.lunet.counter",
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
              "direction": "away-from-impact",
              "distance": 84,
              "speed": 10,
              "oncePerExecution": true,
              "targetRelations": [
                "enemy"
              ]
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
      "style": "spirit-bottle",
      "scale": 1.6,
      "alpha": 0.4,
      "angle": -0.4,
      "rotationStateKey": "lunet-bottle",
      "rotationMs": 420,
      "rotationRadians": -6.283185307179586
    }
  ]
}
