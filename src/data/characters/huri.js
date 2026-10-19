{
  "id": "huri",
  "name": "후리",
  "englishName": "Huri",
  "title": "북극 늑대",
  "color": "#2d6de0",
  "classification": {
    "style": 5,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 3
  },
  "desc": "체력이 낮은 적을 추적하며 빠르게 파고드는 캐릭터",
  "passiveBuffs": [
    {
      "stat": "staminaCostScale",
      "sourceId": "character-passive:huri:predator",
      "valueRef": {
        "value": 0.5
      },
      "duration": 2000,
      "retainOnConditionLost": true,
      "conditions": [
        {
          "type": "target.exists-in-range",
          "range": 500,
          "requireLineOfSight": true,
          "conditions": [
            {
              "type": "target.health-ratio-lt-source"
            }
          ]
        }
      ]
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "포식자",
      "showCost": false,
      "text": "주변의 자신보다 체력 비율이 낮은 적을 피식자로 지정. 벽 없이 연결되면 스테미나 소모량 50% 감소 및 적중 시 최대 체력의 {v:triggers.0.modules.0.maxResourceRatio|percent}% 회복. 효과 종료 후 2초간 유지"
    },
    {
      "key": "LMB",
      "name": "울프 클로",
      "attack": "lmb",
      "text": "짧은 거리를 할퀴어 피해 ({damage})"
    },
    {
      "key": "RMB",
      "name": "아드레날린 포션",
      "attack": "rmb",
      "text": "2초간 모든 적을 상대로 포식자 활성화"
    },
    {
      "key": "L-Shift",
      "name": "단독 사냥",
      "attack": "counter",
      "text": "빠르게 돌진해 기절. 적중 시 무력화 후 정지하며 5회 범위 공격. 마지막에 무력화 및 강한 넉백 (타당 {linkedDamage})",
      "linkedAttack": "huntSector"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.huri.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 250,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.8325957145940461,
          "wallPolicy": "block",
          "contactType": "melee"
        },
        {
          "type": "effect.spawn",
          "when": "on-hit",
          "renderType": "weaponImageEcho",
          "position": "source",
          "target": "source",
          "duration": 650,
          "expansion": 0.5,
          "imageAlpha": 1,
          "conditions": [
            {
              "type": "condition.any",
              "conditions": [
                {
                  "type": "state.exists",
                  "stateKey": "huri-adrenaline",
                  "activeOnly": true
                },
                {
                  "type": "target.health-ratio-lt-source"
                }
              ]
            }
          ]
        }
      ],
      "tags": [
        "평타"
      ],
      "presentation": {
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "rmb": {
      "id": "attack.huri.rmb",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 600,
      "cd": 2500,
      "range": 0,
      "modules": [
        {
          "type": "effect.spawn",
          "renderType": "areaCircle",
          "position": "source",
          "range": 72,
          "r": 72,
          "color": "#b5d9ff",
          "fillAlpha": 0.04,
          "strokeAlpha": 0.78,
          "lineWidth": 2,
          "duration": 150
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "weaponImageEcho",
          "position": "source",
          "target": "source",
          "duration": 650,
          "expansion": 0.45,
          "imageAlpha": 1,
          "imageColor": "#b5d9ff",
          "imageConfig": {
            "type": "effect.spawn",
            "renderType": "weaponImage",
            "style": "adrenaline-potion",
            "scale": 1.8,
            "angle": -0.2,
            "alpha": 1
          }
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "counter": {
      "id": "attack.huri.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 400,
      "presentation": {
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      },
      "previewGeometry": {
        "shape": "rect",
        "range": 400,
        "halfWidth": 44,
        "wallPolicy": "ignore"
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "when": "after-attack",
          "stateKey": "movement:huri-hunt",
          "direction": "attack",
          "distance": 400,
          "duration": 120,
          "replaceActive": true,
          "collision": {
            "passWalls": true,
            "passEnemies": false
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "45,109,224",
            "width": 7,
            "alpha": 0.45,
            "duration": 200,
            "trail": true,
            "colorVariants": [
              {
                "conditions": [
                  {
                    "type": "buff.active",
                    "stat": "staminaCostScale",
                    "sourceIds": [
                      "character-passive:huri:predator"
                    ]
                  }
                ],
                "color": "#b5d9ff"
              }
            ]
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": 120,
          "animation": {
            "mode": "forward",
            "distance": 400,
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "attackId": "attack.huri.counter",
            "requireMovementExecution": true,
            "movementStateKey": "movement:huri-hunt",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": true,
            "contactOnly": true,
            "confirmContact": true
          }
        },
        {
          "type": "status.apply",
          "status": "neutralize",
          "duration": 800
        },
        {
          "type": "hit.sequence",
          "oncePerExecution": true,
          "steps": [
            {
              "delay": 0,
              "modules": [
                {
                  "type": "action.trigger-attack",
                  "attackId": "attack.huri.huntSector",
                  "broadcast": true,
                  "allowDeadTarget": true
                }
              ]
            },
            {
              "delay": 180,
              "modules": [
                {
                  "type": "action.trigger-attack",
                  "attackId": "attack.huri.huntLine",
                  "broadcast": true,
                  "allowDeadTarget": true
                }
              ]
            },
            {
              "delay": 360,
              "modules": [
                {
                  "type": "action.trigger-attack",
                  "attackId": "attack.huri.huntReverse",
                  "broadcast": true,
                  "allowDeadTarget": true
                }
              ]
            },
            {
              "delay": 540,
              "modules": [
                {
                  "type": "action.trigger-attack",
                  "attackId": "attack.huri.huntCircle",
                  "broadcast": true,
                  "allowDeadTarget": true
                }
              ]
            },
            {
              "delay": 760,
              "modules": [
                {
                  "type": "action.trigger-attack",
                  "attackId": "attack.huri.huntFinish",
                  "broadcast": true,
                  "allowDeadTarget": true
                }
              ]
            }
          ],
          "sourceModules": [
            {
              "type": "movement.stop",
              "snapToTargetContact": true,
              "allowDeadTarget": true
            }
          ],
          "authority": "source",
          "retainOnTargetDeath": true
        }
      ],
      "tags": [
        "반격"
      ],
      "effectsOnly": true
    },
    "huntSector": {
      "id": "attack.huri.huntSector",
      "damageRatio": 0.6666666666666666,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": 150,
          "wallPolicy": "block",
          "halfAngle": 1.35,
          "render": false
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 150,
          "inner": 0,
          "span": 2.7,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": -1.35,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "45,109,224",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "edgeLine": false,
          "duration": 180,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "status.apply",
          "status": "neutralize",
          "duration": 200
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "huntLine": {
      "id": "attack.huri.huntLine",
      "damageRatio": 0.6666666666666666,
      "cost": 0,
      "cd": 0,
      "range": 200,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "rect",
          "range": 200,
          "wallPolicy": "block",
          "halfWidth": 48
        },
        {
          "type": "status.apply",
          "status": "neutralize",
          "duration": 200
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "huntReverse": {
      "id": "attack.huri.huntReverse",
      "damageRatio": 0.6666666666666666,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": 150,
          "wallPolicy": "block",
          "halfAngle": 1.35,
          "render": false
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 150,
          "inner": 0,
          "span": 2.7,
          "sweepCount": 1,
          "sweepDirection": "counterclockwise",
          "startAngleOffset": 1.35,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "45,109,224",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "edgeLine": false,
          "duration": 180,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "status.apply",
          "status": "neutralize",
          "duration": 200
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "huntCircle": {
      "id": "attack.huri.huntCircle",
      "damageRatio": 0.6666666666666666,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "circle",
          "range": 180,
          "wallPolicy": "block"
        },
        {
          "type": "status.apply",
          "status": "neutralize",
          "duration": 200
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    },
    "huntFinish": {
      "id": "attack.huri.huntFinish",
      "damageRatio": 0.6666666666666666,
      "cost": 0,
      "cd": 0,
      "range": 300,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "circle",
          "range": 300,
          "wallPolicy": "block",
          "render": false
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 180,
          "speed": 20,
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": 300,
          "inner": 0,
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": 3.141592653589793,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "45,109,224",
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
        "color": "#2d6de0",
        "colorVariants": [
          {
            "conditions": [
              {
                "type": "buff.active",
                "stat": "staminaCostScale",
                "sourceIds": [
                  "character-passive:huri:predator"
                ]
              }
            ],
            "color": "#b5d9ff"
          }
        ]
      }
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.huri.lmb",
      "input": "lmb",
      "attackId": "attack.huri.lmb",
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
      "id": "ability.huri.rmb",
      "input": "rmb",
      "attackId": "attack.huri.rmb",
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
            "type": "state.window",
            "stateKey": "huri-adrenaline",
            "duration": 2000,
            "requireExecuted": true
          },
          {
            "type": "modifier.set",
            "stat": "staminaCostScale",
            "value": 0.5,
            "sourceId": "character-passive:huri:predator",
            "duration": 2000,
            "requireExecuted": true
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    },
    "counter": {
      "id": "ability.huri.counter",
      "input": "counter",
      "attackId": "attack.huri.counter",
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
            "ccRefAttackId": "attack.huri.counter",
            "onFinishModules": [
              {
                "type": "status.apply",
                "status": "stun",
                "duration": 1000,
                "sourceId": "huri-hunt-recovery"
              }
            ]
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    }
  },
  "triggers": [
    {
      "id": "trigger.huri.predator-heal",
      "type": "trigger",
      "event": "damage-dealt",
      "conditions": [
        {
          "type": "entity.alive"
        },
        {
          "type": "impact.direct"
        },
        {
          "type": "context.truthy",
          "key": "healthDamage"
        },
        {
          "type": "buff.active",
          "stat": "staminaCostScale",
          "sourceIds": [
            "character-passive:huri:predator"
          ]
        },
        {
          "type": "target.kind-not-in",
          "kinds": [
            "summon",
            "trainingBot"
          ]
        }
      ],
      "modules": [
        {
          "type": "resource.restore",
          "resource": "health",
          "recipient": "source",
          "maxResourceRatio": 0.05
        }
      ]
    }
  ],
  "conditionalTargetLinks": [
    {
      "visibility": "owner",
      "relation": "enemy",
      "range": 500,
      "conditions": [
        {
          "type": "target.health-ratio-lt-source"
        },
        {
          "type": "state.absent",
          "stateKey": "huri-adrenaline",
          "activeOnly": true
        }
      ],
      "color": "#8bbcff",
      "alpha": 0.5,
      "lineWidth": 1.5,
      "dash": [
        3,
        6
      ],
      "requireLineOfSight": true
    },
    {
      "visibility": "owner",
      "relation": "enemy",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "huri-adrenaline",
          "activeOnly": true
        }
      ],
      "color": "#8bbcff",
      "alpha": 0.5,
      "lineWidth": 1.5,
      "dash": [
        3,
        6
      ],
      "requireLineOfSight": false
    }
  ],
  "conditionalTargetMarkers": [
    {
      "visibility": "owner",
      "relation": "enemy",
      "range": 500,
      "conditions": [
        {
          "type": "target.health-ratio-lt-source"
        },
        {
          "type": "state.absent",
          "stateKey": "huri-adrenaline",
          "activeOnly": true
        }
      ],
      "marker": {
        "shape": "weapon-icon",
        "style": "wolf-claw"
      }
    },
    {
      "visibility": "owner",
      "relation": "enemy",
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "huri-adrenaline",
          "activeOnly": true
        }
      ],
      "marker": {
        "shape": "weapon-icon",
        "style": "wolf-claw"
      }
    }
  ],
  "worldGaugeModules": [
    {
      "type": "range.circle",
      "visibility": "owner",
      "range": 500,
      "alpha": 0.35,
      "dash": [
        5,
        5
      ],
      "colorVariants": [
        {
          "conditions": [
            {
              "type": "buff.active",
              "stat": "staminaCostScale",
              "sourceIds": [
                "character-passive:huri:predator"
              ]
            }
          ],
          "color": "#b5d9ff"
        }
      ]
    },
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "conditions": [
        {
          "type": "buff.active",
          "stat": "staminaCostScale",
          "sourceIds": [
            "character-passive:huri:predator"
          ]
        }
      ],
      "valueRef": {
        "type": "buff-duration-remaining",
        "stat": "staminaCostScale",
        "sourceId": "character-passive:huri:predator",
        "duration": 2000,
        "fullWhen": {
          "$ref": "passiveBuffs.0.conditions"
        }
      },
      "color": "#b5d9ff",
      "showEmpty": false,
      "completeColor": "#b5d9ff",
      "completePulseColor": "#b5d9ff",
      "maxChargeFlash": true,
      "completePulseDash": [
        4,
        3
      ]
    }
  ],
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "wolf-claw",
      "scale": 1.8,
      "alpha": 1,
      "alphaVariants": [
        {
          "conditions": [
            {
              "type": "buff.active",
              "stat": "staminaCostScale",
              "sourceIds": [
                "character-passive:huri:predator"
              ]
            }
          ],
          "alpha": 0.95
        },
        {
          "conditions": [],
          "alpha": 0.35
        }
      ],
      "activityColors": [
        {
          "conditions": [
            {
              "type": "buff.active",
              "stat": "staminaCostScale",
              "sourceIds": [
                "character-passive:huri:predator"
              ]
            }
          ],
          "color": "#b5d9ff"
        }
      ]
    }
  ],
  "healPresentation": {
    "color": "#b5d9ff"
  }
}
