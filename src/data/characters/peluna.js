{
  "id": "peluna",
  "name": "펠루나",
  "englishName": "Peluna",
  "title": "품질 광인",
  "color": "#555555",
  "classification": {
    "style": 5,
    "range": 0,
    "role": 3
  },
  "stats": {
    "maxHealth": 1500,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 200,
    "difficulty": 2
  },
  "desc": "모루의 강화지대를 활용해 망치를 강화하는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.segmented",
      "valueMode": "time",
      "segmentDuration": 3000,
      "valueRef": {
        "type": "progress",
        "stateKey": "peluna-forge-time"
      },
      "gap": 2,
      "height": 4,
      "activeAlpha": 0.95,
      "stroke": "rgba(85,85,85,.48)",
      "segments": [
        {
          "value": 1,
          "color": "#555555"
        },
        {
          "value": 2,
          "color": "#555555"
        },
        {
          "value": 3,
          "color": "#555555"
        }
      ]
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "망치질",
      "attack": "lmb",
      "text": "선딜레이 후 바깥 원주 공격 ({damage})"
    },
    {
      "inlineStages": [
        {
          "key": "LMB I",
          "attack": "lmbStage1",
          "text": "선딜레이 제거"
        },
        {
          "key": "LMB II",
          "attack": "lmbStage2",
          "text": "내부 범위 피해"
        },
        {
          "key": "LMB III",
          "attack": "lmbStage3",
          "modifierAttack": "anvilEmpower",
          "text": "피해량 {damageIncreasePercent}% 증가"
        }
      ]
    },
    {
      "key": "RMB",
      "name": "모루 던지기",
      "attack": "rmb",
      "progressAttack": "anvilEmpower",
      "text": "모루를 던져 적중 시 피해 및 넉백. 착탄 시 강화 지대 내에 있으면 {progressStageAmount}단계 강화 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "인력 망치",
      "attack": "counter",
      "progressAttack": "counter",
      "text": "주변 적을 끌어당기며 피해. 적중 시 즉시 {maxProgressStages}단계 강화 ({damage})"
    }
  ],
  "summonSpecs": [
    {
      "stateKey": "anvil",
      "stats": [
        {
          "key": "HEALTH",
          "text": "{maxHealth}"
        },
        {
          "key": "MOVE SPEED",
          "text": "{moveLabel}"
        },
        {
          "key": "ABILITY",
          "text": "강화 지대 내에서 단계 유지"
        },
        {
          "key": "DEATH",
          "text": "사망 시 {respawnSeconds}초간 재사용 불가"
        }
      ]
    }
  ],
  "summons": {
    "anvil": {
      "id": "summon.peluna.anvil",
      "name": "모루",
      "maxHealth": 800,
      "respawnDelay": 7000,
      "radius": 20,
      "speed": 0,
      "tags": [
        "소환수",
        "고정형"
      ],
      "fieldArea": {
        "type": "field.area",
        "stateKey": "peluna-anvil-zone",
        "shape": "circle",
        "range": 192,
        "duration": Infinity,
        "targetRelations": [
          "self"
        ],
        "interval": 50,
        "intervalMode": "per-target",
        "triggerOnEnter": false,
        "onTrigger": []
      },
      "presentation": {
        "profile": "classicMinion",
        "color": "#555555",
        "fillColor": "rgba(85,85,85,.62)",
        "strokeColor": "#a7adb4"
      },
      "spawnEffect": {
        "type": "areaCircle",
        "range": 192,
        "r": 192,
        "scaleWithFieldRange": true,
        "color": "85,85,85",
        "fillAlpha": 0.05,
        "strokeAlpha": 0.72,
        "lineWidth": 3,
        "duration": 260
      }
    }
  },
  "attacks": {
    "lmb": {
      "id": "attack.peluna.lmb",
      "damageRatio": 1,
      "cost": 250,
      "cd": 450,
      "range": 160,
      "presentation": {
        "duration": 220
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "innerRange": 100,
          "delay": 300,
          "aimMode": "live-source",
          "contactType": "melee",
          "wallPolicy": "block",
          "renderType": "annularDoubleSweep",
          "span": 3.141592653589793,
          "sweepCount": 2,
          "sweepDirection": "clockwise",
          "sweepFraction": 0.55,
          "fadePower": 1.5,
          "lifetimeAlpha": true,
          "hitColor": "85,85,85",
          "safeColor": "55,55,60",
          "fillAlpha": 0.28,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "safeFillAlpha": 0.1,
          "safeStrokeAlpha": 0.55,
          "safeDash": [
            5,
            4
          ],
          "edgeLine": true,
          "edgeColor": "255,255,255",
          "edgeAlpha": 0.75,
          "edgeLineWidth": 2.5,
          "durationFrames": 22
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타",
        "선딜레이"
      ]
    },
    "lmbStage1": {
      "id": "attack.peluna.lmb-stage1",
      "damageRatio": 1,
      "cost": 250,
      "cd": 450,
      "range": 160,
      "presentation": {
        "duration": 220
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbStage1.range"
          },
          "aimMode": "live-source",
          "innerRange": 100,
          "contactType": "melee",
          "wallPolicy": "block",
          "renderType": "annularDoubleSweep",
          "span": 3.141592653589793,
          "sweepCount": 2,
          "sweepDirection": "clockwise",
          "sweepFraction": 0.55,
          "fadePower": 1.5,
          "lifetimeAlpha": true,
          "hitColor": "85,85,85",
          "safeColor": "55,55,60",
          "fillAlpha": 0.28,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "safeFillAlpha": 0.1,
          "safeStrokeAlpha": 0.55,
          "safeDash": [
            5,
            4
          ],
          "edgeLine": true,
          "edgeColor": "255,255,255",
          "edgeAlpha": 0.75,
          "edgeLineWidth": 2.5,
          "durationFrames": 22
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
    "lmbStage2": {
      "id": "attack.peluna.lmb-stage2",
      "damageRatio": 1,
      "cost": 250,
      "cd": 450,
      "range": 160,
      "presentation": {
        "duration": 220
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbStage2.range"
          },
          "aimMode": "live-source",
          "contactType": "melee",
          "wallPolicy": "block",
          "renderType": "annularDoubleSweep",
          "span": 3.141592653589793,
          "sweepCount": 2,
          "sweepDirection": "clockwise",
          "sweepFraction": 0.55,
          "fadePower": 1.5,
          "lifetimeAlpha": true,
          "hitColor": "85,85,85",
          "fillAlpha": 0.28,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "edgeLine": true,
          "edgeColor": "255,255,255",
          "edgeAlpha": 0.75,
          "edgeLineWidth": 2.5,
          "durationFrames": 22
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
    "lmbStage3": {
      "id": "attack.peluna.lmb-stage3",
      "damageRatio": 1,
      "cost": 250,
      "cd": 450,
      "range": 160,
      "presentation": {
        "duration": 220
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbStage3.range"
          },
          "aimMode": "live-source",
          "contactType": "melee",
          "wallPolicy": "block",
          "renderType": "annularDoubleSweep",
          "span": 3.141592653589793,
          "sweepCount": 2,
          "sweepDirection": "clockwise",
          "sweepFraction": 0.55,
          "fadePower": 1.5,
          "lifetimeAlpha": true,
          "hitColor": "255,160,40",
          "fillAlpha": 0.28,
          "strokeAlpha": 0.95,
          "lineWidth": 2.5,
          "edgeLine": true,
          "edgeColor": "255,255,255",
          "edgeAlpha": 0.75,
          "edgeLineWidth": 2.5,
          "durationFrames": 22
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
      "id": "attack.peluna.rmb",
      "damageRatio": 1,
      "cost": 600,
      "cd": 500,
      "range": 500,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 14,
          "radius": 16
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.peluna.anvil-impact",
            "attack.peluna.anvil-empower"
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
    "anvilImpact": {
      "id": "attack.peluna.anvil-impact",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 192,
      "effectsOnly": true,
      "modules": [
        {
          "type": "summon.spawn",
          "stateKey": "anvil",
          "replaceActive": true,
          "preserveHealthOnReplace": true,
          "position": "impact-point",
          "sourceRangeCheck": 192,
          "spawnEffectColorInRange": "255,156,53",
          "spawnEffectColorOutOfRange": "85,85,85",
          "spawnEffectSoundInRange": "hit",
          "spawnEffectSoundLocalOnly": true
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "anvilEmpower": {
      "id": "attack.peluna.anvil-empower",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 192,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.anvilEmpower.range"
          },
          "targetRelations": [
            "self"
          ],
          "applyHitEffects": true,
          "visual": false,
          "wallPolicy": "ignore"
        },
        {
          "type": "state.progress",
          "stateKey": "peluna-forge-time",
          "when": "on-hit",
          "operation": "add",
          "amount": 3000,
          "max": 9000,
          "oncePerExecution": true,
          "decay": {
            "rate": 1000,
            "pauseFieldStateKey": "peluna-anvil-zone"
          },
          "thresholdModifiers": [
            {
              "stat": "damage",
              "value": 0.5,
              "threshold": 6000,
              "strict": true
            }
          ]
        }
      ],
      "tags": [
        "스킬",
        "강화"
      ]
    },
    "counter": {
      "id": "attack.peluna.counter",
      "damageRatio": 1,
      "cost": 0,
      "cd": 300,
      "range": 220,
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
          "renderType": "contractingPullRing",
          "position": "source",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "durationFrames": 20,
          "color": "character",
          "outerColor": "character",
          "strokeAlpha": 0.9,
          "outerStrokeAlpha": 0.4,
          "lineWidth": 3,
          "outerLineWidth": 1.5,
          "dash": [
            5,
            5
          ],
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "drawsClippedOutline": true
        },
        {
          "type": "state.progress",
          "stateKey": "peluna-forge-time",
          "when": "on-hit",
          "operation": "set-max",
          "max": {
            "$ref": "attacks.anvilEmpower.modules.1.max"
          },
          "oncePerExecution": true,
          "decay": {
            "rate": 1000,
            "pauseFieldStateKey": "peluna-anvil-zone"
          },
          "thresholdModifiers": [
            {
              "stat": "damage",
              "value": 0.5,
              "threshold": 6000,
              "strict": true
            }
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
    "counterStage3": {
      "id": "attack.peluna.counter-stage3",
      "damageRatio": 1,
      "cost": 0,
      "cd": 300,
      "range": 220,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counterStage3.range"
          },
          "wallPolicy": "block"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "contractingPullRing",
          "position": "source",
          "range": {
            "$ref": "attacks.counterStage3.range"
          },
          "durationFrames": 20,
          "color": "255,160,40",
          "outerColor": "255,160,40",
          "strokeAlpha": 0.9,
          "outerStrokeAlpha": 0.4,
          "lineWidth": 3,
          "outerLineWidth": 1.5,
          "dash": [
            5,
            5
          ],
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "drawsClippedOutline": true
        },
        {
          "type": "state.progress",
          "stateKey": "peluna-forge-time",
          "when": "on-hit",
          "operation": "set-max",
          "max": {
            "$ref": "attacks.anvilEmpower.modules.1.max"
          },
          "oncePerExecution": true,
          "decay": {
            "rate": 1000,
            "pauseFieldStateKey": "peluna-anvil-zone"
          },
          "thresholdModifiers": [
            {
              "stat": "damage",
              "value": 0.5,
              "threshold": 6000,
              "strict": true
            }
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "peluna-hammer-spin",
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
      "id": "ability.peluna.lmb",
      "input": "lmb",
      "attackId": "attack.peluna.lmb",
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
            "alternates": [
              {
                "attackId": "attack.peluna.lmb-stage3",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "peluna-forge-time",
                    "value": 6000,
                    "strict": true
                  }
                ]
              },
              {
                "attackId": "attack.peluna.lmb-stage2",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "peluna-forge-time",
                    "value": 3000,
                    "strict": true
                  }
                ]
              },
              {
                "attackId": "attack.peluna.lmb-stage1",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "peluna-forge-time",
                    "value": 0,
                    "strict": true
                  }
                ]
              }
            ]
          },
          {
            "type": "preview.create",
            "shape": "attack-shape",
            "attackId": "attack.peluna.lmb",
            "duration": 300,
            "followSource": true,
            "aimMode": "live-source",
            "requireAttackId": "attack.peluna.lmb",
            "requireExecuted": true
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.peluna.rmb",
      "input": "rmb",
      "attackId": "attack.peluna.rmb",
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
            "type": "summon.available",
            "stateKey": "anvil"
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
      "id": "ability.peluna.counter",
      "input": "counter",
      "attackId": "attack.peluna.counter",
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
            "alternateWhen": {
              "attackId": "attack.peluna.counter-stage3",
              "conditions": [
                {
                  "type": "state.progress-gte",
                  "stateKey": "peluna-forge-time",
                  "value": 6000,
                  "strict": true
                }
              ]
            },
            "preview": {
              "type": "preview.create",
              "shape": "attack-shape"
            },
            "cc": {
              "type": "movement.pull",
              "target": "hit-target",
              "distanceMode": "source-contact",
              "gap": 10,
              "duration": 180,
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
      "style": "forge-hammer",
      "scale": 1.7,
      "angle": 0.55,
      "rotationStateKey": "peluna-hammer-spin",
      "rotationMs": 400,
      "rotationRadians": 6.283185307179586,
      "activityColors": [
        {
          "conditions": [
            {
              "type": "state.progress-gte",
              "stateKey": "peluna-forge-time",
              "value": 6000,
              "strict": true
            }
          ],
          "color": {
            "$ref": "attacks.lmbStage3.modules.0.hitColor"
          }
        }
      ]
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "forge-hammer-mirrored",
      "scale": 1.7,
      "angle": -0.85,
      "rotationStateKey": "peluna-hammer-spin",
      "rotationMs": 400,
      "rotationRadians": -6.283185307179586,
      "activityColors": [
        {
          "conditions": [
            {
              "type": "state.progress-gte",
              "stateKey": "peluna-forge-time",
              "value": 6000,
              "strict": true
            }
          ],
          "color": {
            "$ref": "attacks.lmbStage3.modules.0.hitColor"
          }
        }
      ]
    }
  ]
}
