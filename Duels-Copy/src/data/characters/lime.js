{
  "id": "lime",
  "name": "라임",
  "englishName": "Lime",
  "title": "슬라임 보호자",
  "color": "#c1fab1",
  "classification": {
    "style": 6,
    "range": 0,
    "role": 3
  },
  "stats": {
    "maxHealth": 1800,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 1
  },
  "desc": "분열로 슬라임을 키우는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.segmented",
      "height": 4,
      "gap": 2,
      "valueMode": "count",
      "activeAlpha": 0.95,
      "valueRef": {
        "type": "summon.cluster-max-stage",
        "summonKey": "slime"
      },
      "segments": [
        {
          "value": 1,
          "color": "#c1fab1"
        },
        {
          "value": 2,
          "color": "#c1fab1"
        },
        {
          "value": 3,
          "color": "#c1fab1"
        },
        {
          "value": 4,
          "color": "#c1fab1"
        }
      ]
    }
  ],
  "deathReplacement": {
    "type": "summon.cluster-strongest",
    "summonKey": "slime",
    "setStateOnReplace": "lime-slime-revived",
    "absorbRemainingAfterMs": 500
  },
  "replacementAttackScaling": {
    "stateKey": "lime-slime-revived",
    "stageProperty": "stage",
    "damagePerStage": 0.5,
    "movementPerStage": 0.25,
    "rules": [
      {
        "attackId": "attack.lime.lmb",
        "damage": true,
        "range": true,
        "deliveryRange": true,
        "movementDistance": true
      },
      {
        "attackId": "attack.lime.jump",
        "range": true,
        "movementDistance": true
      },
      {
        "attackId": "attack.lime.jump-land",
        "damage": true
      },
      {
        "attackId": "attack.lime.sticky-field",
        "damage": true
      },
      {
        "attackId": "attack.lime.sticky-tick",
        "damage": true
      }
    ]
  },
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "생존 본능",
      "attack": "lmb",
      "showCost": false,
      "text": "어린 슬라임이 적을 피함"
    },
    {
      "key": "LMB",
      "name": "몸통박치기",
      "attack": "lmb",
      "text": "빠르게 돌진하여 적중 시 피해 및 {v:attacks.lmb.modules.0.duration|seconds}초 감속 ({damage})"
    },
    {
      "key": "RMB",
      "name": "분열",
      "attack": "split",
      "text": "현재 잃은 체력만큼 최대 체력을 소모하여 어린 슬라임 소환. 사망 시 가장 강한 슬라임으로 부활"
    },
    {
      "key": "RMB SUMMONER",
      "name": "뛰어오르기",
      "attack": "jump",
      "detailAttack": "jumpLand",
      "text": "공중으로 뛰어올라 내려찍으며 주변 피해 ({detailDamage})"
    },
    {
      "key": "L-Shift",
      "name": "끈끈이",
      "attack": "counter",
      "detailAttack": "stickyTick",
      "text": "착탄지점에 지대를 생성. 지대 위 적에게 {v:attacks.stickyField.modules.2.onTrigger.0.duration|seconds}초 감속 및 {v:attacks.stickyField.modules.2.interval|seconds}초마다 피해 (타당 {detailDamage})"
    }
  ],
  "summonSpecs": [
    {
      "stateKey": "slime",
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
          "attack": "slimeAuto",
          "text": "같은 단계끼리 합쳐짐"
        }
      ]
    }
  ],
  "summons": {
    "slime": {
      "id": "summon.lime.slime",
      "name": "어린 슬라임",
      "maxHealth": 900,
      "radius": 20,
      "speed": 4.5,
      "stageSpeedPerStage": -0.25,
      "baseDamage": 100,
      "maxStage": 4,
      "stageHealthGrowth": "linear",
      "stageHealthMultiplier": 2,
      "stageDamageMultiplier": 2,
      "mergeHealthPolicy": "ratio",
      "stageAttackScaling": {
        "rangePerStage": 0.25,
        "movementDistancePerStage": 0.25
      },
      "tags": [
        "소환수",
        "성장형",
        "슬라임"
      ],
      "ai": {
        "type": "chase-melee",
        "enabled": true,
        "detectionOrigin": "self",
        "detectionRange": 250,
        "strictDetectionRange": true,
        "enemyAvoidance": {
          "enabled": true,
          "attackId": "attack.lime.slime-auto",
          "attackInterval": 600,
          "attackAimDistance": 95,
          "pathDistance": 260,
          "pathRecalcMs": 180,
          "fallbackToEnemyWhenTrapped": true,
          "desperateMode": {
            "enabled": true,
            "exitDistance": 330
          }
        },
        "projectileAvoidance": {
          "enabled": true,
          "range": 200,
          "lookAheadFrames": 28,
          "holdMs": 220
        },
        "fieldAvoidance": {
          "enabled": true,
          "detectionPadding": 48,
          "pathDistance": 260,
          "pathRecalcMs": 180,
          "fallbackToThreatWhenTrapped": true,
          "desperateMode": {
            "enabled": true,
            "exitPadding": 72
          }
        },
        "damageEscape": {
          "enabled": true,
          "distance": 180,
          "duration": 650,
          "nearOwnerRadius": 170
        },
        "ownerThreatHold": {
          "enabled": true,
          "ownerThreatRange": 250,
          "wanderMin": 18,
          "wanderMax": 70,
          "retargetMinMs": 650,
          "retargetMaxMs": 1350
        },
        "ownerReturn": {
          "distance": 250,
          "attackId": "attack.lime.slime-auto",
          "attackInterval": 600,
          "pathCellSize": 48,
          "recalcMs": 180,
          "maxPathExpansions": 2600,
          "avoidEnemies": true,
          "enemyDangerRadius": 250,
          "enemyClearance": 0,
          "useBaseSpeed": false
        },
        "attackTraversal": {
          "enabled": true,
          "attackId": "attack.lime.slime-auto",
          "attackInterval": 600,
          "maxBlockedCells": 2,
          "movementDistance": 150
        },
        "idleWander": {
          "minRadius": 60,
          "maxRadius": 135,
          "retargetMinMs": 650,
          "retargetMaxMs": 1350,
          "moveSpeed": 2.5,
          "applyMoveSpeedOnlyNearAnchor": true
        },
        "meleeRange": 95,
        "stopRangeRef": "melee-range",
        "stopRangeRatio": 0.7368421052631579,
        "pathCellSize": 48,
        "pathRecalcMs": 500,
        "emptyPathRecalcMs": 200,
        "maxPathExpansions": 2600
      },
      "presentation": {
        "profile": "classicMinion",
        "color": "#c1fab1",
        "fillColor": "rgba(193,250,177,.60)",
        "strokeColor": "#c1fab1",
        "stageGauge": true,
        "stageColors": [
          "#c1fab1",
          "#93db82",
          "#65b955",
          "#3e9136"
        ]
      },
      "ownerRangePresentation": {
        "shape": "circle",
        "rangeRef": "ai.ownerGuardRange",
        "visibility": "owner-team",
        "color": "#c1fab1",
        "alpha": 0.28,
        "lineWidth": 1.5,
        "dash": [
          7,
          6
        ]
      },
      "spawnEffect": {
        "type": "areaCircle",
        "range": 34,
        "r": 0,
        "maxR": 34,
        "durationFrames": 12,
        "color": "193,250,177"
      }
    }
  },
  "attacks": {
    "lmb": {
      "id": "attack.lime.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 500,
      "range": 126,
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.lmb.range"
        },
        "halfWidth": 38,
        "wallPolicy": "ignore",
        "render": false
      },
      "modules": [
        {
          "type": "status.apply",
          "status": "slow",
          "duration": 1000,
          "data": {
            "factor": {
              "$ref": "statusDefaults.slow.factor"
            }
          }
        },
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "direction": "aim",
          "when": "after-attack",
          "distance": {
            "$ref": "attacks.lmb.range"
          },
          "duration": 140,
          "collision": {
            "passWalls": true,
            "passEnemies": false
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "193,250,177",
            "width": 6,
            "alpha": 0.4,
            "duration": 167,
            "resolveOnFinish": true
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.lmb.modules.1.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": {
              "$ref": "attacks.lmb.range"
            },
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "attackId": "attack.lime.lmb",
            "requireMovementExecution": true,
            "movementStateKey": "movement:move",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": false
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "split": {
      "id": "attack.lime.split",
      "damageRatio": 0,
      "cost": 1500,
      "cd": 700,
      "range": 0,
      "effectsOnly": true,
      "presentation": {
        "suppressAttackFeedback": true
      },
      "modules": [
        {
          "type": "summon.cluster-spawn",
          "summonKey": "slime",
          "maxHealthCost": "missing-health",
          "spawnDistance": 46
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "jump": {
      "id": "attack.lime.jump",
      "damageRatio": 0,
      "cost": 500,
      "cd": 1400,
      "range": 170,
      "effectsOnly": true,
      "modules": [
        {
          "type": "trajectory.arc",
          "height": 105,
          "screenLiftRatio": 0.7,
          "apexScale": 0.9,
          "apexAlpha": 0.78,
          "apexStrokeAlpha": 0.9
        },
        {
          "type": "movement.move",
          "direction": "target-point",
          "when": "after-attack",
          "distance": {
            "$ref": "attacks.jump.range"
          },
          "duration": 360,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "onEndAttackIds": [
            "attack.lime.jump-land"
          ],
          "tags": [
            "이동기"
          ],
          "presentation": false,
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
    "jumpLand": {
      "id": "attack.lime.jump-land",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": 170,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.jumpLand.range"
          },
          "wallPolicy": "block"
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.lime.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 700,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 16,
          "radius": 10,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "damageOnTravel": false,
          "collisionTargets": false,
          "targetPointResolve": "nearest-open",
          "targetPointClearance": 2,
          "arrival": {
            "passWallsInFlight": true
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.impact",
          "reasons": [
            "target-point"
          ],
          "attackIds": [
            "attack.lime.sticky-field"
          ]
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "stickyField": {
      "id": "attack.lime.sticky-field",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "effectsOnly": false,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.stickyField.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ],
          "applyHitEffects": true,
          "render": false
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 55,
          "speed": 8,
          "oncePerExecution": true
        },
        {
          "type": "field.area",
          "stateKey": "lime-sticky-field",
          "anchorMode": "target-point",
          "clampToAttackRange": false,
          "shape": "circle",
          "range": {
            "$ref": "attacks.stickyField.range"
          },
          "wallPolicy": "block",
          "duration": 4000,
          "targetRelations": [
            "enemy"
          ],
          "interval": 1000,
          "intervalMode": "per-target",
          "triggerOnEnter": false,
          "attackId": "attack.lime.sticky-tick",
          "damageOnTrigger": true,
          "onTrigger": [
            {
              "type": "status.apply",
              "status": "slow",
              "duration": 3000,
              "data": {
                "stackMode": "refresh-type",
                "factor": {
                  "$ref": "statusDefaults.slow.factor"
                }
              }
            }
          ],
          "presentation": {
            "type": "slowZoneAppear",
            "r": {
              "$ref": "attacks.stickyField.modules.2.range"
            },
            "color": "193,250,177"
          }
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "stickyTick": {
      "id": "attack.lime.sticky-tick",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 150,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.stickyTick.range"
          },
          "wallPolicy": "block",
          "render": false
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
          "oncePerExecution": false
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "slimeAuto": {
      "id": "attack.lime.slime-auto",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 95,
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.slimeAuto.range"
        },
        "halfWidth": 38,
        "wallPolicy": "ignore",
        "render": false
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "stateKey": "movement:lime-slime-auto",
          "direction": "aim",
          "when": "after-attack",
          "distance": {
            "$ref": "attacks.slimeAuto.range"
          },
          "duration": 140,
          "collision": {
            "passWalls": true,
            "passEnemies": false
          },
          "tags": [
            "이동기"
          ],
          "presentation": {
            "type": "dash-line",
            "color": "193,250,177",
            "width": 6,
            "alpha": 0.4,
            "duration": 167,
            "resolveOnFinish": true
          }
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.slimeAuto.modules.0.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": {
              "$ref": "attacks.slimeAuto.range"
            },
            "easing": "linear",
            "clipByMovementCollision": true
          },
          "damage": {
            "attackId": "attack.lime.slime-auto",
            "requireMovementExecution": true,
            "movementStateKey": "movement:lime-slime-auto",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": false
          }
        }
      ],
      "tags": [
        "소환수 공격",
        "평타"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.lime.lmb",
      "input": "lmb",
      "attackId": "attack.lime.lmb",
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
      "id": "ability.lime.rmb",
      "input": "rmb",
      "attackId": "attack.lime.split",
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
            "type": "action.attack",
            "captureTargetPoint": true,
            "alternates": [
              {
                "attackId": "attack.lime.jump",
                "conditions": [
                  {
                    "type": "state.exists",
                    "stateKey": "lime-slime-revived"
                  }
                ]
              },
              {
                "attackId": "attack.lime.jump",
                "conditions": [
                  {
                    "type": "summon.cluster-stage",
                    "summonKey": "slime",
                    "minStage": 4
                  }
                ]
              }
            ],
            "fallbackConditions": [
              {
                "type": "resource.not-full",
                "resource": "health"
              }
            ]
          }
        ]
      }
    },
    "counter": {
      "id": "ability.lime.counter",
      "input": "counter",
      "attackId": "attack.lime.counter",
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
            "targetPointMode": "aim-point",
            "preview": {
              "type": "preview.create",
              "hideAttackShape": true,
              "targetPointArea": {
                "shape": "circle",
                "range": 150,
                "wallPolicy": "block",
                "color": "193,250,177"
              }
            },
            "cc": {
              "type": "status.apply",
              "status": "slow",
              "duration": 3000,
              "oncePerExecution": true,
              "data": {
                "factor": {
                  "$ref": "statusDefaults.slow.factor"
                }
              }
            }
          }
        ]
      }
    }
  },
  "statusDefaults": {
    "slow": {
      "factor": 0.5
    }
  }
}
