{
  "id": "runef",
  "name": "루네프",
  "englishName": "Runef",
  "title": "4원소의 마녀",
  "color": "#4c10c4",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 2
  },
  "stats": {
    "maxHealth": 900,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "불·얼음·번개·바람 속성 마법을 구사하는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "visibility": "owner",
      "valueRef": {
        "type": "timed-action-progress",
        "stateKey": "runef-element"
      },
      "color": "#4c10c4",
      "lineWidth": 3,
      "maxChargeFlash": true
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "마법탄",
      "attack": "lmb",
      "text": "마법 에너지 발사. 일정 시간 내 재사용 가능 ({damage})"
    },
    {
      "key": "LMB/LMB",
      "name": "연쇄 마법탄",
      "attack": "lmbChain",
      "text": "더 강한 마법 에너지 발사 ({damage})"
    },
    {
      "key": "RMB",
      "name": "화염 마법",
      "attack": "fireExplosion",
      "costAttack": "rmbSelect",
      "text": "화염구를 발사해 폭발 피해 및 {burnSeconds}초 화염 ({damage})"
    },
    {
      "key": "RMB/LMB",
      "name": "얼음 마법",
      "attack": "ice",
      "text": "부채꼴 범위에 피해 및 {freezeSeconds}초 빙결 ({damage})"
    },
    {
      "key": "RMB/RMB",
      "name": "번개 마법",
      "attack": "lightning",
      "text": "지정 위치에 낙뢰 {repeatCount}회 및 {zapSeconds}초 감전 (타당 {damage})"
    },
    {
      "key": "L-Shift",
      "name": "바람 마법",
      "attack": "counter",
      "text": "벽 관통 토네이도 생성. 적을 사거리 끝까지 밀어냄 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.runef.lmb",
      "damageRatio": 1,
      "cost": 100,
      "cd": 200,
      "range": 480,
      "attackDelayGroup": "runef-lmb",
      "attackDelay": 200,
      "presentation": {
        "color": "#4c10c4"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 17,
          "radius": 10
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "runef-lmb-chain",
          "duration": 350
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
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
    "lmbChain": {
      "id": "attack.runef.lmb-chain",
      "damageRatio": 1.5,
      "cost": 100,
      "cd": 500,
      "range": 480,
      "attackDelayGroup": "runef-lmb",
      "attackDelay": 500,
      "presentation": {
        "color": "#4c10c4"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 17,
          "radius": 10
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
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
    "rmbSelect": {
      "id": "attack.runef.rmb-select",
      "damageRatio": 0,
      "cost": 400,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "runef-element",
          "duration": 300,
          "retainCompleteMs": 500,
          "data": {
            "choice": "fire"
          },
          "captureAngle": true,
          "resolveAimMode": "live-source",
          "resolveAttackIds": {
            "fire": "attack.runef.fire",
            "ice": "attack.runef.ice",
            "lightning": "attack.runef.lightning"
          },
          "previewAttackIds": {
            "fire": "attack.runef.fire",
            "ice": "attack.runef.ice",
            "lightning": "attack.runef.lightning"
          },
          "resolveDataKey": "choice",
          "cooldownAttackId": "attack.runef.rmb-select",
          "cooldown": 500
        }
      ],
      "tags": [
        "스킬",
        "선딜레이"
      ]
    },
    "fire": {
      "id": "attack.runef.fire",
      "damageRatio": 4,
      "cost": 0,
      "cd": 500,
      "range": 700,
      "presentation": {
        "color": "#ff2200"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 18,
          "radius": 14,
          "damageOnTravel": false,
          "collisionTargets": true
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.runef.fire-explosion"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-fire",
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
    "fireExplosion": {
      "id": "attack.runef.fire-explosion",
      "damageRatio": 4,
      "cost": 0,
      "cd": 0,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.fireExplosion.range"
          },
          "wallPolicy": "block",
          "color": "255,34,0",
          "renderType": "areaCircle"
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 42,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": 1000,
          "data": {
            "flat": {
              "$ref": "statusDefaults.burn.flat"
            },
            "interval": {
              "$ref": "statusDefaults.burn.interval"
            },
            "tickAtEnd": true,
            "stackMode": "refresh-type"
          },
          "oncePerExecution": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "ice": {
      "id": "attack.runef.ice",
      "damageRatio": 2,
      "cost": 0,
      "cd": 500,
      "range": 189,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": {
            "$ref": "attacks.ice.range"
          },
          "halfAngle": 0.9,
          "wallPolicy": "block"
        },
        {
          "type": "status.apply",
          "status": "freeze",
          "duration": 1000,
          "oncePerExecution": true,
          "data": {
            "ratio": {
              "$ref": "statusDefaults.freeze.ratio"
            },
            "interval": {
              "$ref": "statusDefaults.freeze.interval"
            }
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "arcSweep",
          "position": "attack-center",
          "range": {
            "$ref": "attacks.ice.range"
          },
          "halfAngle": {
            "$ref": "attacks.ice.modules.0.halfAngle"
          },
          "animateSweep": false,
          "color": "100,200,255",
          "fillAlpha": 0.3,
          "strokeAlpha": 1,
          "lineWidth": 3,
          "durationFrames": 12,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "drawsClippedOutline": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-ice",
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
    "lightning": {
      "id": "attack.runef.lightning",
      "damageRatio": 0.5,
      "cost": 0,
      "cd": 500,
      "range": 400,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 90,
          "centerMode": "live-aim-point",
          "centerMaxRange": 400,
          "centerPointResolve": "nearest-open",
          "centerPointClearance": 2,
          "wallPolicy": "block",
          "repeatCount": 3,
          "previewAtCenter": true,
          "repeatInterval": 350,
          "aimMode": "live-source",
          "color": "255,230,60",
          "renderType": "areaCircle"
        },
        {
          "type": "status.apply",
          "status": "zap",
          "duration": 1000,
          "data": {
            "staminaRegenMultiplier": {
              "$ref": "statusDefaults.zap.staminaRegenMultiplier"
            }
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-lightning",
          "values": [
            "a",
            "b"
          ],
          "everyDelivery": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.runef.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 300,
      "range": 350,
      "presentation": {
        "color": "#00b432"
      },
      "modules": [
        {
          "type": "delivery.range-projectile",
          "speed": 10,
          "radius": 60
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "hit.once-per-execution"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "attack",
          "distanceMode": "attack-range-end",
          "distance": 350,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "projectile.presentation",
          "kind": "range-projectile",
          "style": {
            "fillAlpha": 0.2,
            "strokeColor": "#00d23c",
            "strokeAlpha": 0.9,
            "strokeWidth": 3,
            "innerColor": "#64ff78",
            "innerScale": 0.55,
            "innerAlpha": 0.5,
            "innerStrokeWidth": 2
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-motion",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "runef-book-counter",
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
      "id": "ability.runef.lmb",
      "input": "lmb",
      "attackId": "attack.runef.lmb",
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
            "type": "state.window",
            "operation": "select",
            "stateKey": "runef-element",
            "data": {
              "choice": "ice"
            },
            "captureAngle": true,
            "stopOnHandled": true
          },
          {
            "type": "action.attack",
            "alternateWhen": {
              "stateKey": "runef-lmb-chain",
              "attackId": "attack.runef.lmb-chain",
              "conditions": [
                {
                  "type": "state.exists",
                  "stateKey": "runef-lmb-chain"
                }
              ],
              "consume": true
            }
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.runef.rmb",
      "input": "rmb",
      "attackId": "attack.runef.rmb-select",
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
            "type": "state.window",
            "operation": "select",
            "stateKey": "runef-element",
            "data": {
              "choice": "lightning"
            },
            "captureAngle": true,
            "stopOnHandled": true
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.runef.counter",
      "input": "counter",
      "attackId": "attack.runef.counter",
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
              "distanceMode": "attack-range-end",
              "distance": {
                "$ref": "attacks.counter.modules.3.distance"
              },
              "speed": {
                "$ref": "attacks.counter.modules.3.speed"
              },
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  },
  "statusDefaults": {
    "burn": {
      "flat": 50,
      "interval": 500
    },
    "freeze": {
      "ratio": 0.05,
      "interval": 1000
    },
    "zap": {
      "staminaRegenMultiplier": 0.6
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "spellbook",
      "color": "#4c10c4",
      "scale": 1.95,
      "angle": -0.28,
      "motionStateKey": "runef-book-motion",
      "motionMs": 480,
      "motion": {
        "rotation": -0.3,
        "travelY": -0.35
      },
      "activityColors": [
        {
          "stateKey": "runef-book-fire",
          "color": "#ff2200",
          "duration": 600,
          "fadeMs": 400
        },
        {
          "stateKey": "runef-book-ice",
          "color": "#64c8ff",
          "duration": 600,
          "fadeMs": 400
        },
        {
          "stateKey": "runef-book-lightning",
          "color": "#ffe63c",
          "duration": 600,
          "fadeMs": 400
        },
        {
          "stateKey": "runef-book-counter",
          "color": "#00b432",
          "duration": 600,
          "fadeMs": 400
        }
      ]
    }
  ]
}
