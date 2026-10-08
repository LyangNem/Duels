{
  "id": "siro",
  "name": "시로",
  "englishName": "Siro",
  "title": "토끼 궁수",
  "color": "#f05c68",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 2
  },
  "stats": {
    "maxHealth": 1100,
    "speed": 4.5,
    "radius": 20,
    "baseDamage": 200,
    "difficulty": 1
  },
  "desc": "불 화살과 다중 사격으로 먼 거리의 적을 압박하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "파이어 애로우",
      "attack": "lmb",
      "text": "불 화살을 발사하여 {burnSeconds}초 화염 ({damage})",
      "costText": "스테미나 {v:attacks.lmb.cost}"
    },
    {
      "key": "LMB HOLD",
      "name": "다중 사격",
      "attack": "lmb",
      "text": "최대 2단계 차징 후 화살을 2~3발 산탄 발사하여 {burnSeconds}초 화염 (탄당 {damage})",
      "costText": "스테미나 {v:attacks.lmb.charge.costStages.1.cost}/{v:attacks.lmb.charge.costStages.2.cost}"
    },
    {
      "key": "RMB",
      "name": "백드래프트",
      "attack": "rmb",
      "linkedAttack": "rmbExplosion",
      "text": "폭발 화살을 발사하며 뒤로 낮게 점프. 착탄 지점 피해 및 넉백과 {burnSeconds}초 화염 ({linkedDamage})"
    },
    {
      "key": "L-Shift",
      "name": "토끼뜀",
      "attack": "counter",
      "linkedAttack": "rainTick",
      "text": "조준 반대 방향으로 점프하며 최고점에서 시작 지점에 화살 발사. 화살비 생성 시 범위 내 적에게 피해·화염·무력화 넉백. 이후 벽을 관통하는 화살비 타격마다 무력화 넉백 및 {burnSeconds}초 화염 ({linkedDamage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.siro.lmb",
      "damageRatio": 0.5,
      "cost": 150,
      "cd": 600,
      "range": 1200,
      "modules": [
        {
          "type": "pattern.scatter",
          "count": 1,
          "spread": 0
        },
        {
          "type": "delivery.projectile",
          "speed": 42,
          "radius": 12
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": {
            "$ref": "burnDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type",
            "flat": {
              "$ref": "burnTickDamage"
            },
            "interval": {
              "$ref": "burnTickInterval"
            }
          },
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "siro-weapon-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ],
      "charge": {
        "duration": 800,
        "maxProgress": 2,
        "costMin": 150,
        "costMax": 350,
        "costTiming": "release",
        "staminaRegenDuringCharge": true,
        "preview": false,
        "gauge": {
          "layers": 2,
          "overflowColor": "#ffb0b7",
          "maxChargeFlash": true,
          "flashAfterFirstLayer": true
        },
        "costStages": [
          {
            "progress": 0,
            "cost": 150
          },
          {
            "progress": 1,
            "cost": 250
          },
          {
            "progress": 2,
            "cost": 350
          }
        ],
        "previewAtFull": true,
        "stages": [
          {
            "progress": 0,
            "spec": {
              "modules": [
                {
                  "type": "pattern.scatter",
                  "count": 1,
                  "spread": 0
                },
                {
                  "type": "delivery.projectile",
                  "speed": 42,
                  "radius": 12
                },
                {
                  "type": "status.apply",
                  "status": "burn",
                  "duration": {
                    "$ref": "burnDuration"
                  },
                  "data": {
                    "tickAtEnd": true,
                    "stackMode": "refresh-type",
                    "flat": {
                      "$ref": "burnTickDamage"
                    },
                    "interval": {
                      "$ref": "burnTickInterval"
                    }
                  },
                  "oncePerExecution": true
                },
                {
                  "type": "mode.toggle",
                  "when": "on-delivery",
                  "stateKey": "siro-weapon-motion",
                  "values": [
                    "a",
                    "b"
                  ]
                }
              ]
            }
          },
          {
            "progress": 1,
            "spec": {
              "modules": [
                {
                  "type": "pattern.scatter",
                  "count": 2,
                  "spread": 0.08
                },
                {
                  "type": "delivery.projectile",
                  "speed": 42,
                  "radius": 12
                },
                {
                  "type": "status.apply",
                  "status": "burn",
                  "duration": {
                    "$ref": "burnDuration"
                  },
                  "data": {
                    "tickAtEnd": true,
                    "stackMode": "refresh-type",
                    "flat": {
                      "$ref": "burnTickDamage"
                    },
                    "interval": {
                      "$ref": "burnTickInterval"
                    }
                  },
                  "oncePerExecution": true
                },
                {
                  "type": "mode.toggle",
                  "when": "on-delivery",
                  "stateKey": "siro-weapon-motion",
                  "values": [
                    "a",
                    "b"
                  ]
                }
              ]
            }
          },
          {
            "progress": 2,
            "spec": {
              "modules": [
                {
                  "type": "pattern.scatter",
                  "count": 3,
                  "spread": 0.16
                },
                {
                  "type": "delivery.projectile",
                  "speed": 42,
                  "radius": 12
                },
                {
                  "type": "status.apply",
                  "status": "burn",
                  "duration": {
                    "$ref": "burnDuration"
                  },
                  "data": {
                    "tickAtEnd": true,
                    "stackMode": "refresh-type",
                    "flat": {
                      "$ref": "burnTickDamage"
                    },
                    "interval": {
                      "$ref": "burnTickInterval"
                    }
                  },
                  "oncePerExecution": true
                },
                {
                  "type": "mode.toggle",
                  "when": "on-delivery",
                  "stateKey": "siro-weapon-motion",
                  "values": [
                    "a",
                    "b"
                  ]
                }
              ]
            }
          }
        ]
      },
      "previewProjectilePaths": true
    },
    "rmb": {
      "id": "attack.siro.rmb",
      "damageRatio": 0,
      "cost": 600,
      "cd": 900,
      "range": 1200,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 34,
          "radius": 14,
          "damageOnTravel": false,
          "collisionTargets": true
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.siro.rmbExplosion"
          ],
          "previewAttackIds": [
            "attack.siro.rmbExplosion"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "siro-weapon-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "stateKey": "movement:siro-backdraft",
          "direction": "opposite-aim",
          "distance": 240,
          "duration": 300,
          "easing": "ease-out",
          "replaceActive": true,
          "blocksAction": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "presentation": false,
          "trajectory": {
            "type": "trajectory.arc",
            "height": 60,
            "screenLiftRatio": 0.55,
            "apexScale": 1,
            "apexAlpha": 1,
            "apexStrokeAlpha": 1
          },
          "buffs": [
            {
              "type": "evasionInvulnerable",
              "value": 1,
              "duration": "movement"
            }
          ]
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "rmbExplosion": {
      "id": "attack.siro.rmbExplosion",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 140,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.rmbExplosion.range"
          },
          "wallPolicy": "block",
          "renderType": "areaCircle"
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 100,
          "speed": 12,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": {
            "$ref": "burnDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type",
            "flat": {
              "$ref": "burnTickDamage"
            },
            "interval": {
              "$ref": "burnTickInterval"
            }
          },
          "oncePerExecution": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.siro.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 300,
      "range": 350,
      "modules": [
        {
          "type": "trajectory.arc",
          "height": 140,
          "screenLiftRatio": 0.55,
          "apexScale": 1,
          "apexAlpha": 1,
          "apexStrokeAlpha": 1,
          "apexHold": 0.2
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "stateKey": "movement:siro-jump",
          "direction": "opposite-aim",
          "distance": 350,
          "duration": 700,
          "replaceActive": true,
          "blocksAction": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "presentation": false,
          "buffs": [
            {
              "type": "evasionInvulnerable",
              "value": 1,
              "duration": "movement"
            }
          ],
          "progressAttacks": [
            {
              "progress": 0.5,
              "attackId": "attack.siro.counterArrow",
              "targetPoint": "start",
              "captureTrajectoryHeight": true
            }
          ]
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "siro-weapon-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ],
      "effectsOnly": true,
      "previewGeometry": {
        "shape": "circle",
        "range": {
          "$ref": "attacks.rainTick.range"
        },
        "wallPolicy": {
          "$ref": "attacks.counterArrow.modules.2.field.wallPolicy"
        }
      }
    },
    "counterArrow": {
      "id": "attack.siro.counterArrow",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 350,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 28,
          "radius": 12,
          "targetPoint": true,
          "targetPointResolve": "none",
          "targetPointTravelDuration": 250,
          "damageOnTravel": false,
          "collisionTargets": false,
          "arrival": {
            "passWallsInFlight": true,
            "targetRelations": [],
            "triggerHitEffects": false
          }
        },
        {
          "type": "trajectory.arc",
          "height": 0,
          "screenLiftRatio": {
            "$ref": "attacks.counter.modules.0.screenLiftRatio"
          },
          "apexScale": 1,
          "apexAlpha": 1,
          "apexStrokeAlpha": 1
        },
        {
          "type": "projectile.impact",
          "field": {
            "type": "field.area",
            "stateKey": "siro-arrow-rain",
            "anchorMode": "point",
            "shape": "circle",
            "range": {
              "$ref": "attacks.rainTick.range"
            },
            "wallPolicy": "ignore",
            "duration": 3000,
            "attackId": "attack.siro.rainTick",
            "damageOnTrigger": true,
            "targetRelations": [
              "enemy"
            ],
            "interval": 500,
            "intervalMode": "per-target",
            "triggerOnEnter": false,
            "removeOnTrigger": false,
            "reasons": [
              "arrival",
              "range",
              "wall",
              "boundary",
              "target"
            ],
            "presentation": {
              "type": "areaCircle",
              "color": "240,92,104",
              "fillAlpha": 0.18,
              "strokeAlpha": 0.9,
              "lineWidth": 2,
              "remainingArcGauge": {
                "color": "240,92,104",
                "lineWidth": 2
              },
              "visibility": "all"
            }
          },
          "attackIds": [
            "attack.siro.rainArrival"
          ],
          "previewAttackIds": []
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "siro-weapon-motion",
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
    "rainTick": {
      "id": "attack.siro.rainTick",
      "damageRatio": 0.5,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "status.apply",
          "status": "burn",
          "duration": {
            "$ref": "burnDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type",
            "flat": {
              "$ref": "burnTickDamage"
            },
            "interval": {
              "$ref": "burnTickInterval"
            }
          }
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": false
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "rainArrival": {
      "id": "attack.siro.rainArrival",
      "damageRatio": {
        "$ref": "attacks.rainTick.damageRatio"
      },
      "cost": 0,
      "cd": 0,
      "range": {
        "$ref": "attacks.rainTick.range"
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.rainTick.range"
          },
          "wallPolicy": "ignore",
          "targetRelations": [
            "enemy"
          ]
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": {
            "$ref": "burnDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type",
            "flat": {
              "$ref": "burnTickDamage"
            },
            "interval": {
              "$ref": "burnTickInterval"
            }
          }
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.siro.lmb",
      "input": "lmb",
      "attackId": "attack.siro.lmb",
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
            "stateKey": "charge:primary"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.siro.rmb",
      "input": "rmb",
      "attackId": "attack.siro.rmb",
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
            "stateKey": "charge:primary"
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
      "id": "ability.siro.counter",
      "input": "counter",
      "attackId": "attack.siro.counter",
      "inputPolicy": {
        "repeatWhileHeld": false
      },
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
            "type": "state.absent",
            "stateKey": "charge:primary"
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
            "ccRefAttackId": "attack.siro.rainTick"
          }
        ]
      }
    }
  },
  "burnDuration": 4000,
  "burnTickDamage": 15,
  "burnTickInterval": 500,
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "bow",
      "color": "#f05c68",
      "scale": 1.5,
      "angle": -0.6,
      "motionStateKey": "siro-weapon-motion",
      "motionMs": 420,
      "chargeStateKey": "charge:primary",
      "motion": {
        "rotation": -0.48,
        "travelX": -0.65,
        "travelY": 0.2,
        "chargeRotation": -0.22
      }
    }
  ]
}
