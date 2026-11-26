{
  "id": "bell",
  "name": "벨",
  "englishName": "Bell",
  "title": "구조 대원",
  "color": "#e8e6d9",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 4
  },
  "stats": {
    "maxHealth": 900,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 2
  },
  "desc": "설산에서 구조 임무를 맡고 있는 족제비 수인",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "삐이이!",
      "attack": "lmb",
      "text": "호루라기를 불어 전방에 피해 ({damage})",
      "costText": "스테미나 {v:attacks.lmb.cost}"
    },
    {
      "key": "LMB HOLD",
      "name": "정신 차려요!",
      "attack": "lmb",
      "text": "{v:attacks.lmb.charge.duration|seconds}초 홀드 후 아군의 최대 체력 {v:attacks.lmb.charge.stages.1.spec.modules.0.damage.extraModules.0.maxResourceRatio|percent}% 회복 및 {v:attacks.lmb.charge.stages.1.spec.modules.0.damage.extraModules.1.duration|seconds}초 CC 면역",
      "costText": "스테미나 {v:attacks.lmb.charge.costMax}"
    },
    {
      "key": "RMB",
      "name": "긴급 구조",
      "attack": "rmb",
      "text": "지정한 대상에게 벽을 통과하는 유도탄 발사. 아군 적중 시 해당 위치로 이동해 최대 체력 {v:attacks.rescueAid.modules.1.maxResourceRatio|percent}% 회복 및 {v:attacks.rescueAid.modules.2.duration|seconds}초 CC 면역. 도착 시 주변 적 넉백 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "마약성 진통제",
      "attack": "counter",
      "text": "약물을 발사해 적중 시 자신과 적중 아군의 최대 체력 {v:attacks.counter.modules.1.maxResourceRatio|percent}% 회복 및 {v:attacks.counter.modules.3.duration|seconds}초 CC 면역 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.bell.lmb",
      "damageRatio": 1,
      "cost": 100,
      "cd": 400,
      "range": 450,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "progressRect",
          "position": "source",
          "range": 450,
          "halfWidth": 52,
          "growthSpeed": 1,
          "travelSpeed": 3000,
          "animation": true,
          "clipToAttackArea": true,
          "color": "#e8e6d9",
          "strokeColor": "#e8e6d9",
          "fillAlpha": 0.18,
          "strokeAlpha": 0.9,
          "lineWidth": 2.5,
          "endCap": true,
          "duration": 220,
          "damage": {
            "attackId": "attack.bell.lmb",
            "hitMode": "progressive-rect",
            "module": {
              "type": "delivery.area",
              "contactType": "melee",
              "shape": "rect",
              "range": 450,
              "halfWidth": 52,
              "wallPolicy": "block"
            }
          }
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "bell-whistle",
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
        "duration": 1000,
        "maxProgress": 1,
        "costMin": 100,
        "costMax": 150,
        "costTiming": "release",
        "staminaRegenDuringCharge": true,
        "preview": false,
        "gauge": {
          "layers": 1,
          "maxChargeFlash": true
        },
        "costStages": [
          {
            "progress": 0,
            "cost": 100
          },
          {
            "progress": 1,
            "cost": 150
          }
        ],
        "stages": [
          {
            "progress": 0,
            "spec": {
              "modules": [
                {
                  "type": "effect.spawn",
                  "when": "after-attack",
                  "renderType": "progressRect",
                  "position": "source",
                  "range": 450,
                  "halfWidth": 52,
                  "growthSpeed": 1,
                  "travelSpeed": 3000,
                  "animation": true,
                  "clipToAttackArea": true,
                  "color": "#e8e6d9",
                  "strokeColor": "#e8e6d9",
                  "fillAlpha": 0.18,
                  "strokeAlpha": 0.9,
                  "lineWidth": 2.5,
                  "endCap": true,
                  "duration": 220,
                  "damage": {
                    "attackId": "attack.bell.lmb",
                    "hitMode": "progressive-rect",
                    "module": {
                      "type": "delivery.area",
                      "contactType": "melee",
                      "shape": "rect",
                      "range": 450,
                      "halfWidth": 52,
                      "wallPolicy": "block"
                    }
                  }
                },
                {
                  "type": "mode.toggle",
                  "when": "after-attack",
                  "stateKey": "bell-whistle",
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
                  "type": "effect.spawn",
                  "when": "after-attack",
                  "renderType": "progressRect",
                  "position": "source",
                  "range": 450,
                  "halfWidth": 52,
                  "growthSpeed": 1,
                  "travelSpeed": 3000,
                  "animation": true,
                  "clipToAttackArea": true,
                  "color": "#ff6565",
                  "strokeColor": "#ff6565",
                  "fillAlpha": 0.18,
                  "strokeAlpha": 0.9,
                  "lineWidth": 2.5,
                  "endCap": true,
                  "duration": 220,
                  "damage": {
                    "attackId": "attack.bell.lmb",
                    "hitMode": "progressive-rect",
                    "module": {
                      "type": "delivery.area",
                      "contactType": "melee",
                      "shape": "rect",
                      "range": 450,
                      "halfWidth": 52,
                      "wallPolicy": "block",
                      "targetRelations": [
                        "enemy",
                        "ally"
                      ],
                      "applyHitEffects": true
                    },
                    "extraModules": [
                      {
                        "type": "resource.restore",
                        "when": "on-hit",
                        "resource": "health",
                        "recipient": "target",
                        "maxResourceRatio": 0.1,
                        "targetRelations": [
                          "ally"
                        ],
                        "oncePerExecution": true,
                        "presentation": "ability"
                      },
                      {
                        "type": "modifier.set",
                        "when": "on-hit",
                        "stat": "statusImmunity",
                        "recipient": "target",
                        "value": 1,
                        "duration": 500,
                        "sourceId": "bell:whistle-immunity",
                        "targetRelations": [
                          "ally"
                        ],
                        "oncePerExecution": true
                      }
                    ]
                  }
                },
                {
                  "type": "mode.toggle",
                  "when": "after-attack",
                  "stateKey": "bell-whistle",
                  "values": [
                    "a",
                    "b"
                  ]
                }
              ],
              "presentation": {
                "color": "#ff6565"
              }
            }
          }
        ],
        "previewAtFull": true
      },
      "halfWidth": 52,
      "travelSpeed": 3000,
      "previewGeometry": {
        "shape": "rect",
        "range": 450,
        "halfWidth": 52,
        "wallPolicy": "block"
      }
    },
    "rmb": {
      "id": "attack.bell.rmb",
      "damageRatio": 1,
      "effectsOnly": false,
      "cost": 1000,
      "cd": 1500,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 32,
          "radius": 16,
          "targetRelations": [
            "ally",
            "enemy"
          ],
          "targetEntityOnly": true,
          "applyHitEffects": true,
          "homing": {
            "startTravelRatio": 0,
            "maxTurnPerFrame": 6.283185307179586,
            "targetRelations": [
              "ally",
              "enemy"
            ],
            "targetEntityOnly": true
          }
        },
        {
          "type": "projectile.pierce",
          "walls": true,
          "targets": false
        },
        {
          "type": "movement.move",
          "distance": 650,
          "duration": 300,
          "easing": "ease-out",
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "onEndAttackIds": [
            "attack.bell.rescueAid",
            "attack.bell.rescuePush"
          ],
          "presentation": {
            "color": "#e8e6d9"
          },
          "when": "on-hit",
          "target": "hit-target",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "rescueAid": {
      "id": "attack.bell.rescueAid",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 0,
      "cd": 0,
      "range": 650,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 650,
          "wallPolicy": "ignore",
          "targetRelations": [
            "ally"
          ],
          "applyHitEffects": true,
          "onlyExecutionTarget": true,
          "visual": false
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "health",
          "recipient": "target",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true,
          "presentation": "ability",
          "maxResourceRatio": 0.4
        },
        {
          "type": "modifier.set",
          "when": "on-hit",
          "stat": "statusImmunity",
          "recipient": "target",
          "value": 1,
          "duration": 2000,
          "sourceId": "bell:rescue-immunity",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "when": "on-hit",
          "renderType": "areaCircle",
          "position": "hit-target",
          "range": 60,
          "r": 0,
          "maxR": 60,
          "duration": 300,
          "color": "232,230,217",
          "fillAlpha": 0.1,
          "strokeAlpha": 0.8
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.bell.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 300,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 30,
          "radius": 16,
          "targetRelations": [
            "enemy",
            "ally"
          ],
          "applyHitEffects": true
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "health",
          "recipient": "source",
          "targetRelations": [
            "enemy",
            "ally"
          ],
          "oncePerExecution": true,
          "presentation": "ability",
          "maxResourceRatio": 0.2
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "health",
          "recipient": "target",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true,
          "presentation": "ability",
          "maxResourceRatio": 0.2
        },
        {
          "type": "modifier.set",
          "when": "on-hit",
          "stat": "statusImmunity",
          "recipient": "source",
          "value": 1,
          "duration": 2000,
          "sourceId": "bell:rescue-immunity",
          "targetRelations": [
            "enemy",
            "ally"
          ],
          "oncePerExecution": true
        },
        {
          "type": "modifier.set",
          "when": "on-hit",
          "stat": "statusImmunity",
          "recipient": "target",
          "value": 1,
          "duration": 2000,
          "sourceId": "bell:rescue-immunity",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "bell-whistle",
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
    "rescuePush": {
      "id": "attack.bell.rescuePush",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 180,
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ],
          "applyHitEffects": true
        },
        {
          "type": "movement.knockback",
          "when": "on-hit",
          "distance": 100,
          "speed": 12,
          "targetRelations": [
            "enemy"
          ],
          "target": "hit-target",
          "direction": "away-from-source"
        }
      ],
      "tags": [
        "스킬"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.bell.lmb",
      "input": "lmb",
      "attackId": "attack.bell.lmb",
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
      "id": "ability.bell.rmb",
      "input": "rmb",
      "attackId": "attack.bell.rmb",
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
            "type": "target.select",
            "targetRelations": [
              "ally",
              "enemy"
            ],
            "targetKinds": [
              "player",
              "dummy"
            ],
            "pointerRadius": 80,
            "requireClearPath": false,
            "showTargetRange": true,
            "preferRelations": [
              "ally",
              "enemy"
            ]
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.bell.counter",
      "input": "counter",
      "attackId": "attack.bell.counter",
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
      "style": "rescue-whistle",
      "scale": 1.65,
      "alpha": 0.4,
      "angle": -0.45,
      "motionStateKey": "bell-whistle",
      "motionMs": 350,
      "motion": {
        "rotation": -0.15,
        "travelX": -0.2,
        "travelY": 0.05
      }
    }
  ]
}
