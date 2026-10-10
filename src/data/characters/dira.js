{
  "id": "dira",
  "name": "디라",
  "englishName": "Dira",
  "title": "최고의 요리사",
  "color": "#f3b36f",
  "classification": {
    "style": 3,
    "range": 4,
    "role": 4
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "식재료를 모아 요리로 아군을 지원하며 전투하는 캐릭터",
  "cooking": {
    "ingredientCapacity": 5,
    "stoveCapacity": 10,
    "fryingPanIngredientGain": 1,
    "counterIngredientGain": 2,
    "ingredientHealRatio": 0.1,
    "mealHealthRatioPerIngredient": 0.1,
    "mealStaminaRatioPerIngredient": 0.1,
    "mealReturnSpeed": 24,
    "mealTargetSelectionRadius": 90,
    "mealProjectileBaseRadius": 18,
    "mealProjectileRadiusPerIngredient": 2,
    "ingredientReadyStateKey": "cooking:ingredient-ready",
    "mealReadyStateKey": "cooking:meal-ready",
    "stoveStateKey": "dira-stove",
    "ingredientColor": "#ffd08a",
    "mealColor": "#ffe2ad"
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "frying-pan",
      "scale": 1.9,
      "y": 0,
      "motionStateKey": "dira-kitchen-motion",
      "motionMs": 420,
      "motion": {
        "rotation": -0.6,
        "travelY": -0.35
      },
      "conditions": [
        {
          "type": "state.absent",
          "stateKey": "cooking:ingredient-ready"
        }
      ],
      "angle": -0.55,
      "x": 0
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "loaded-pan",
      "scale": 1.9,
      "y": 0,
      "motionStateKey": "dira-kitchen-motion",
      "motionMs": 420,
      "motion": {
        "rotation": -0.6,
        "travelY": -0.35
      },
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "cooking:ingredient-ready"
        }
      ],
      "angle": -0.55,
      "x": 0
    }
  ],
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "showEmpty": false,
      "lineWidth": 3,
      "color": "#d58b4a",
      "completeColor": "#ffe2ad",
      "completePulseColor": "#ffe2ad",
      "maxChargeFlash": true,
      "valueRef": {
        "type": "cooking-meal-ratio"
      },
      "conditions": [
        {
          "type": "state.exists",
          "stateKey": "cooking:meal-ready"
        }
      ]
    },
    {
      "type": "gauge.segmented",
      "visibility": "owner",
      "height": 4,
      "gap": 2,
      "valueMode": "count",
      "valueRef": {
        "type": "cooking-ingredient-count"
      },
      "segments": [
        {
          "value": 1,
          "color": "#ffd08a"
        },
        {
          "value": 2,
          "color": "#ffd08a"
        },
        {
          "value": 3,
          "color": "#ffd08a"
        },
        {
          "value": 4,
          "color": "#ffd08a"
        },
        {
          "value": 5,
          "color": "#ffd08a"
        }
      ],
      "background": "rgba(10,18,22,.92)",
      "stroke": "rgba(255,255,255,.16)"
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "이거나 먹어!",
      "attack": "fryingPan",
      "text": "프라이팬을 던져 적에게 피해. 적중 시 식재료 {v:cooking.fryingPanIngredientGain}개 획득. 식재료를 보유 중이면 프라이팬에 식재료를 얹어 날리며, 식재료는 아군의 최대 체력 {v:cooking.ingredientHealRatio|percent}% 회복. ({damage})"
    },
    {
      "key": "LMB FOOD",
      "name": "최상급 요리",
      "attack": "meal",
      "text": "음식에 들어간 식재료마다 최대 체력 {v:cooking.mealHealthRatioPerIngredient|percent}%와 최대 스테미나 {v:cooking.mealStaminaRatioPerIngredient|percent}% 회복. 아군을 향해 사용 시 해당 아군을 향해 음식 투척"
    },
    {
      "key": "RMB",
      "name": "휴대용 스토브",
      "attack": "stove",
      "text": "지정한 위치에 휴대용 스토브 설치. 식재료 최대 {v:cooking.stoveCapacity}개 투입 가능"
    },
    {
      "key": "RMB SUMMONER",
      "name": "요리 완료",
      "attack": "stove",
      "showCost": false,
      "text": "설치된 스토브를 회수해 투입된 식재료 수만큼의 음식을 조리해 획득"
    },
    {
      "key": "L-Shift",
      "name": "주방 출입 금지",
      "attack": "counter",
      "text": "프라이팬을 휘둘러 주변 적에게 피해를 주고 식재료 {v:cooking.counterIngredientGain}개 획득 ({damage})"
    }
  ],
  "summonSpecs": [
    {
      "stateKey": "dira-stove",
      "stats": [
        {
          "key": "HEALTH",
          "text": "{maxHealth}"
        },
        {
          "key": "DEATH",
          "text": "사망 시 {respawnSeconds}초간 재사용 불가"
        }
      ]
    }
  ],
  "summons": {
    "dira-stove": {
      "id": "summon.dira.stove",
      "name": "휴대용 스토브",
      "maxHealth": 1000,
      "radius": 22,
      "speed": 0,
      "healthRegen": false,
      "respawnDelay": 7000,
      "respawnHealth": 1000,
      "storedHealthBar": true,
      "tags": [
        "소환수",
        "고정형"
      ],
      "worldGaugeModules": [
        {
          "type": "gauge.segmented",
          "targetKinds": [
            "summon"
          ],
          "height": 4,
          "gap": 2,
          "valueMode": "count",
          "valueRef": {
            "type": "cooking-stove-input-count",
            "target": "owner"
          },
          "segments": [
            {
              "value": 1,
              "color": "#ffd08a"
            },
            {
              "value": 2,
              "color": "#ffd08a"
            },
            {
              "value": 3,
              "color": "#ffd08a"
            },
            {
              "value": 4,
              "color": "#ffd08a"
            },
            {
              "value": 5,
              "color": "#ffd08a"
            },
            {
              "value": 6,
              "color": "#ffd08a"
            },
            {
              "value": 7,
              "color": "#ffd08a"
            },
            {
              "value": 8,
              "color": "#ffd08a"
            },
            {
              "value": 9,
              "color": "#ffd08a"
            },
            {
              "value": 10,
              "color": "#ffd08a"
            }
          ],
          "background": "rgba(10,18,22,.92)",
          "stroke": "rgba(255,255,255,.16)"
        }
      ],
      "presentation": {
        "profile": "classicMinion",
        "color": "#a86c43"
      }
    }
  },
  "attacks": {
    "lmbIdle": {
      "id": "attack.dira.lmb-idle",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [],
      "tags": [
        "평타"
      ]
    },
    "fryingPan": {
      "id": "attack.dira.frying-pan",
      "damageRatio": 1,
      "cost": 150,
      "cd": 300,
      "attackDelayGroup": "dira-lmb",
      "attackDelay": 300,
      "range": 800,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 16,
          "hitRadius": 16
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.presentation",
          "kind": "range-projectile",
          "style": {
            "radius": 18,
            "fillAlpha": 0.24,
            "strokeColor": "#d57835",
            "strokeAlpha": 0.95,
            "strokeWidth": 3,
            "innerColor": "#f3b36f",
            "innerScale": 0.5,
            "innerAlpha": 0.52
          }
        },
        {
          "type": "cooking.acquire",
          "when": "on-hit",
          "amount": {
            "$ref": "cooking.fryingPanIngredientGain"
          },
          "oncePerExecution": true,
          "targetKinds": [
            "player",
            "dummy"
          ]
        },
        {
          "type": "cooking.launch-ingredient",
          "when": "after-attack"
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "dira-kitchen-motion",
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
    "ingredient": {
      "id": "attack.dira.ingredient",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 800,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 12,
          "hitRadius": 12,
          "collisionTargets": true,
          "targetRelations": [
            "ally"
          ],
          "targetKinds": [
            "player",
            "summon"
          ],
          "applyHitEffects": true
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "resource.restore",
          "when": "on-hit",
          "resource": "health",
          "recipient": "target",
          "maxResourceRatio": {
            "$ref": "cooking.ingredientHealRatio"
          },
          "applyHealingModifier": false,
          "targetRelations": [
            "ally"
          ],
          "excludeTargetKinds": [
            "summon"
          ]
        },
        {
          "type": "cooking.stove-input",
          "when": "on-hit",
          "targetRelations": [
            "ally"
          ]
        },
        {"type": "resource.restore", "when": "on-hit", "resource": "stamina", "recipient": "source", "amount": 150,
          "targetRelations": ["ally"], "oncePerExecution": true, "conditions": [{"type": "cooking.own-stove"}]},
        {
          "type": "cooking.consume-ingredient",
          "when": "on-hit",
          "targetRelations": [
            "ally"
          ],
          "oncePerExecution": true
        }
      ],
      "tags": [
        "지원"
      ]
    },
    "meal": {
      "id": "attack.dira.meal",
      "damageRatio": 0,
      "cost": 150,
      "cd": 300,
      "attackDelayGroup": "dira-lmb",
      "attackDelay": 300,
      "range": 800,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 15,
          "hitRadius": 15,
          "collisionTargets": true,
          "expireAtRange": false,
          "targetRelations": [
            "self",
            "ally"
          ],
          "targetKinds": [
            "player"
          ],
          "targetEntityOnly": true,
          "allowSourceTarget": true,
          "applyHitEffects": true,
          "supportHitEffect": {
            "type": "effect.spawn",
            "renderType": "areaCircle",
            "r": 72,
            "color": "character",
            "fillAlpha": 0.02,
            "strokeAlpha": 0.44,
            "lineWidth": 1.5,
            "duration": 220,
            "renderLayer": "below-entities"
          },
          "homing": {
            "startTravelRatio": 0,
            "maxTurnPerFrame": 6.283185307179586,
            "targetRelations": [
              "self",
              "ally"
            ],
            "targetEntityOnly": true
          }
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 15,
            "fillAlpha": 0.28,
            "strokeColor": "#d58b4a",
            "strokeAlpha": 0.95,
            "strokeWidth": 3,
            "innerColor": "#fff0cf",
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 7.5
          }
        },
        {
          "type": "trajectory.arc",
          "height": 90,
          "screenLiftRatio": 0.68,
          "apexScale": 0.9,
          "apexAlpha": 0.72,
          "apexStrokeAlpha": 0.9
        },
        {
          "type": "cooking.meal-heal",
          "when": "on-hit",
          "targetRelations": [
            "self",
            "ally"
          ]
        },
        {
          "type": "cooking.meal-commit",
          "when": "after-attack"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "weaponImageEcho",
          "duration": 650,
          "expansion": 0.45,
          "imageAlpha": 1,
          "imageConfig": {
            "type": "effect.spawn",
            "renderType": "weaponImage",
            "style": "cooked-meal",
            "scale": 1.9,
            "y": 0,
            "angle": 0,
            "x": 0
          }
        }
      ],
      "tags": [
        "평타",
        "지원"
      ]
    },
    "stove": {
      "id": "attack.dira.stove",
      "damageRatio": 0,
      "cost": 300,
      "cd": 500,
      "range": 450,
      "effectsOnly": true,
      "modules": [],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.dira.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 500,
      "range": 190,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 190,
          "halfAngle": 1.0471975511965976,
          "wallPolicy": "block",
          "contactType": "melee",
          "color": "243,179,111",
          "fillAlpha": 0.13,
          "strokeAlpha": 0.92,
          "lineWidth": 3,
          "durationFrames": 20
        },
        {
          "type": "cooking.acquire",
          "when": "after-attack",
          "amount": {
            "$ref": "cooking.counterIngredientGain"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "dira-kitchen-motion",
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
      "id": "ability.dira.lmb",
      "input": "lmb",
      "attackId": "attack.dira.frying-pan",
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
            "type": "cooking.select-meal-target"
          },
          {
            "type": "action.attack",
            "captureTargetPoint": true,
            "alternates": [
              {
                "attackId": "attack.dira.meal",
                "conditions": [
                  {
                    "type": "state.exists",
                    "stateKey": "cooking:meal-ready"
                  },
                  {
                    "type": "context.truthy",
                    "key": "targetEntityId"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.dira.rmb",
      "input": "rmb",
      "attackId": "attack.dira.stove",
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
            "type": "cooking.stove-toggle",
            "stateKey": "dira-stove",
            "placementTarget": "aim-point",
            "maxPlaceDistance": 450,
            "recallCooldown": 0
          }
        ]
      }
    },
    "counter": {
      "id": "ability.dira.counter",
      "input": "counter",
      "attackId": "attack.dira.counter",
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
