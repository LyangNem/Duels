{
  "id": "elin",
  "name": "엘린",
  "title": "유령 친구",
  "color": "#c8d8f0",
  "classification": {
    "style": 3,
    "range": 0,
    "role": 4
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 4
  },
  "desc": "유령 친구를 소환해 서포트하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "유령 구체",
      "attack": "lmb",
      "linkedAttack": "lmbExplosion",
      "healAttack": "lmbHeal",
      "text": "유령 구체 발사. 지정 지점 피해 ({linkedDamage}). 범위 내 아군 체력 {healAmount} 회복"
    },
    {
      "key": "RMB",
      "name": "유령 친구",
      "attack": "rmb",
      "text": "수호 모드의 유령 소환"
    },
    {
      "key": "RMB SUMMONER",
      "name": "밀쳐내기",
      "attack": "spiritGuardBurst",
      "costRef": {
        "ability": "rmb",
        "trigger": "trigger",
        "module": "summon.toggle",
        "property": "activeCommand.guardCost"
      },
      "text": "수호 모드 유령이 가장 가까운 적을 공격 및 넉백 ({damage})"
    },
    {
      "key": "RMB SUMMONER",
      "name": "탐사 돌진",
      "attack": "spiritDash",
      "costRef": {
        "ability": "rmb",
        "trigger": "trigger",
        "module": "summon.toggle",
        "property": "activeCommand.exploreDash.cost"
      },
      "text": "탐사 모드 유령이 가장 가까운 적 방향으로 돌진. 경로상의 적에게 피해 ({damage})"
    },
    {
      "key": "RMB HOLD",
      "name": "호기심 많은 수호 유령",
      "attack": "rmb",
      "costRef": {
        "ability": "rmb",
        "trigger": "holdTrigger",
        "module": "resource.spend"
      },
      "text": "유령이 수호와 탐사 사이에서 모드 변경. 수호 모드로 전환 시 유령이 엘린에게 귀환하며 주변 적 피해 및 넉백"
    },
    {
      "key": "L-Shift",
      "name": "도와줘!",
      "attack": "counterExplosion",
      "text": "엘린과 유령 위치에서 피해 및 위치 변환 ({damage})"
    }
  ],
  "summonSpecs": [
    {
      "stateKey": "spirit",
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
          "key": "AUTO ATTACK",
          "text": "적을 추적해 근접 공격 ({autoAttackDamage})"
        },
        {
          "key": "DEATH",
          "text": "사망 시 {respawnSeconds}초간 재사용 불가"
        }
      ]
    }
  ],
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "spirit-shield",
      "scale": 1.9,
      "y": 0,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "spirit-mode",
          "initial": "guard",
          "value": "guard"
        }
      ],
      "alphaVariants": [
        {
          "conditions": [
            {
              "type": "summon.inactive",
              "stateKey": "spirit"
            }
          ],
          "alpha": 0.3333333333333333
        }
      ],
      "x": 0
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "spirit-goggles",
      "scale": 1.65,
      "y": 0,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "spirit-mode",
          "initial": "guard",
          "value": "explore"
        }
      ],
      "alphaVariants": [
        {
          "conditions": [
            {
              "type": "summon.inactive",
              "stateKey": "spirit"
            }
          ],
          "alpha": 0.3333333333333333
        }
      ],
      "x": 0
    }
  ],
  "worldGaugeModules": [],
  "summons": {
    "spirit": {
      "id": "summon.elin.spirit",
      "name": "유령",
      "maxHealth": 1000,
      "respawnDelay": 7000,
      "respawnHealth": {
        "$ref": "summons.spirit.maxHealth"
      },
      "radius": 20,
      "speed": 3.5,
      "baseDamage": 100,
      "tags": [
        "소환수"
      ],
      "modeState": {
        "stateKey": "spirit-mode",
        "initial": "guard",
        "values": [
          "guard",
          "explore"
        ]
      },
      "ai": {
        "type": "chase-melee",
        "enabled": true,
        "ownerGuardRange": 500,
        "restrictedMode": "guard",
        "unrestrictedMode": "explore",
        "idleWander": {
          "minRadius": 60,
          "maxRadius": 135,
          "retargetMinMs": 650,
          "retargetMaxMs": 1350,
          "moveSpeed": 2
        },
        "meleeRange": 132,
        "stopRangeRef": "melee-range",
        "stopRangeRatio": 0.7575757575757576,
        "meleeWindup": 500,
        "meleeInterval": 800,
        "meleeAttackId": "attack.elin.spirit-melee",
        "pathCellSize": 48,
        "pathRecalcMs": 500,
        "emptyPathRecalcMs": 200,
        "maxPathExpansions": 2600
      },
      "spawnEffect": {
        "type": "areaCircle",
        "range": 50,
        "r": 0,
        "maxR": 50,
        "durationFrames": 22,
        "color": "200,216,240"
      },
      "fieldArea": {
        "type": "field.area",
        "stateKey": "spirit-guard-zone",
        "anchorTarget": "owner",
        "whenMode": "guard",
        "shape": "circle",
        "range": 500,
        "wallPolicy": "ignore",
        "targetRelations": [
          "ally"
        ],
        "targetKinds": [
          "summon"
        ],
        "ownerScope": "source",
        "interval": 50,
        "intervalMode": "per-target",
        "triggerOnEnter": true,
        "onTrigger": [
          {
            "type": "modifier.set",
            "stat": "damage",
            "value": 0.2,
            "removeOnExit": true
          },
          {
            "type": "modifier.set",
            "stat": "speed",
            "value": 0.2,
            "removeOnExit": true
          }
        ],
        "presentationEffect": {
          "type": "effect.spawn",
          "renderType": "areaCircle",
          "visibility": "owner",
          "range": 500,
          "color": "200,216,240",
          "fillAlpha": 0,
          "strokeAlpha": 0.28,
          "lineWidth": 2,
          "dash": [
            10,
            8
          ]
        }
      },
      "attackRangePresentation": {
        "visibility": "owner-team",
        "shape": "circle",
        "attackId": "attack.elin.spirit-melee",
        "range": 132,
        "lineWidth": 1.5,
        "dash": [
          6,
          5
        ],
        "alpha": 0.25
      },
      "worldEffectModules": [
        {
          "type": "effect.spawn",
          "renderType": "weaponImage",
          "style": "spirit-shield",
          "scale": 1.9,
          "y": 0,
          "conditions": [
            {
              "type": "state.mode-is",
              "stateKey": "spirit-mode",
              "initial": "guard",
              "value": "guard"
            }
          ],
          "conditionTarget": "owner",
          "x": 0
        },
        {
          "type": "effect.spawn",
          "renderType": "weaponImage",
          "style": "spirit-goggles",
          "scale": 1.65,
          "y": 0,
          "conditions": [
            {
              "type": "state.mode-is",
              "stateKey": "spirit-mode",
              "initial": "guard",
              "value": "explore"
            }
          ],
          "conditionTarget": "owner",
          "x": 0
        }
      ],
      "worldGaugeModules": [],
      "presentation": {
        "profile": "classicMinion",
        "color": "#c8d8f0",
        "attackFeedback": {
          "durationMs": 190,
          "recoil": 5.5,
          "squashX": 0.2,
          "stretchY": 0.15
        }
      },
      "onHealedEffects": [
        {
          "type": "effect.spawn",
          "renderType": "weaponImageEcho",
          "position": "source",
          "target": "source",
          "duration": 650,
          "expansion": 0.45,
          "imageAlpha": 0.9
        }
      ]
    }
  },
  "attacks": {
    "lmb": {
      "id": "attack.elin.lmb",
      "damageRatio": 0,
      "cost": 200,
      "cd": 400,
      "range": 1100,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 18,
          "radius": 15,
          "targetPoint": true,
          "targetPointResolve": "nearest-open",
          "targetPointClearance": 2,
          "damageOnTravel": false,
          "collisionTargets": false
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.elin.lmb-explosion",
            "attack.elin.lmb-heal"
          ]
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "type": "orb",
            "radius": {
              "$ref": "attacks.lmb.modules.0.radius"
            },
            "strokeColor": "200,216,240",
            "fillColor": "220,235,255",
            "fillAlpha": 0.35,
            "strokeWidth": 2
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "lmbExplosion": {
      "id": "attack.elin.lmb-explosion",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 104,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbExplosion.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ]
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "lmbHeal": {
      "id": "attack.elin.lmb-heal",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 104,
      "effectsOnly": true,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbHeal.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "ally"
          ],
          "applyHitEffects": true,
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
          "amount": 200,
          "onRestoredEffects": [
            {
              "type": "effect.spawn",
              "renderType": "weaponImageEcho",
              "position": "source",
              "target": "source",
              "duration": 650,
              "expansion": 0.45,
              "imageAlpha": 0.9
            }
          ]
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.elin.rmb",
      "damageRatio": 0,
      "cost": 750,
      "cd": 500,
      "range": 0,
      "charge": {
        "duration": 200,
        "costMin": 0,
        "costMax": 0,
        "costTiming": "release",
        "gauge": true,
        "staminaRegenDuringCharge": true
      },
      "modules": [],
      "tags": [
        "스킬"
      ]
    },
    "spiritMelee": {
      "id": "attack.elin.spirit-melee",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 132,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": {
            "$ref": "attacks.spiritMelee.range"
          },
          "halfAngle": 1.5707963267948966,
          "wallPolicy": "block"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "annularDoubleSweep",
          "position": "attack-center",
          "r": {
            "$ref": "attacks.spiritMelee.range"
          },
          "span": 1.5707963267948966,
          "converge": true,
          "sweepFraction": 0.62,
          "fadePower": 1.5,
          "hitColor": "200,216,240",
          "fillAlpha": 0.25,
          "strokeAlpha": 0.85,
          "lineWidth": 1.5,
          "edgeLine": false,
          "durationFrames": 16,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true
        }
      ],
      "tags": [
        "평타",
        "소환수"
      ]
    },
    "spiritGuardBurst": {
      "id": "attack.elin.spirit-guard-burst",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 158.4,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.spiritGuardBurst.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ]
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "annularDoubleSweep",
          "position": "attack-center",
          "r": {
            "$ref": "attacks.spiritGuardBurst.range"
          },
          "span": 3.141592653589793,
          "converge": true,
          "sweepFraction": 0.62,
          "fadePower": 1.5,
          "hitColor": "200,216,240",
          "fillAlpha": 0.25,
          "strokeAlpha": 0.85,
          "lineWidth": 1.5,
          "edgeLine": false,
          "durationFrames": 20,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true
        }
      ],
      "tags": [
        "스킬",
        "소환수"
      ]
    },
    "spiritReturn": {
      "id": "attack.elin.spirit-return",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 2000,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 33,
          "radius": 16,
          "targetPoint": "owner",
          "targetPointClampToAttackRange": false,
          "followTarget": "owner",
          "targetPreview": {
            "shape": "circle",
            "range": 240,
            "style": {
              "dash": [
                6,
                5
              ],
              "lineWidth": 1.8,
              "strokeColor": "200,216,240",
              "strokeAlpha": 0.82,
              "fillColor": "200,216,240",
              "fillAlpha": 0.2
            }
          },
          "damageOnTravel": false,
          "collisionTargets": false
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.elin.spirit-return-explosion"
          ],
          "summonRelocate": {
            "stateKey": "spirit",
            "commandMode": "guard"
          }
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "type": "orb",
            "radius": {
              "$ref": "attacks.spiritReturn.modules.0.radius"
            },
            "strokeColor": "200,216,240",
            "fillColor": "220,235,255",
            "fillAlpha": 0.32,
            "strokeWidth": 2.5
          }
        }
      ],
      "tags": [
        "스킬",
        "소환수"
      ]
    },
    "spiritReturnExplosion": {
      "id": "attack.elin.spirit-return-explosion",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 0,
      "range": 240,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.spiritReturnExplosion.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ]
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 176.4,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "스킬",
        "소환수"
      ]
    },
    "spiritDash": {
      "id": "attack.elin.spirit-dash",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 208,
      "effectsOnly": true,
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "stateKey": "movement:move",
          "direction": "target-point",
          "duration": 350,
          "easing": "ease-out",
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "tags": [
            "스킬",
            "이동기"
          ]
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "effectShape",
          "visible": false,
          "duration": {
            "$ref": "attacks.spiritDash.modules.0.duration"
          },
          "animation": {
            "mode": "forward",
            "distance": "target-point",
            "easing": "ease-out",
            "clipByMovementCollision": true
          },
          "damage": {
            "pathPresentation": {
              "color": "200,216,240",
              "width": 44,
              "duration": 200
            },
            "attackId": "attack.elin.spirit-dash",
            "requireMovementExecution": true,
            "movementStateKey": "movement:move",
            "oncePerExecution": true,
            "hitMode": "body-contact",
            "contactRadius": 44,
            "stopAfterFirstContact": false,
            "firstContactKey": "elin-spirit-dash-contact"
          }
        }
      ],
      "tags": [
        "스킬",
        "소환수"
      ]
    },
    "counterExplosion": {
      "id": "attack.elin.counter-explosion",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counterExplosion.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ]
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "summon.swap-pulse",
          "stateKey": "spirit",
          "attackId": "attack.elin.counter-spirit-explosion"
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counterSpiritExplosion": {
      "id": "attack.elin.counter-spirit-explosion",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counterSpiritExplosion.range"
          },
          "wallPolicy": "block",
          "targetRelations": [
            "enemy"
          ]
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
        "반격",
        "소환수"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.elin.lmb",
      "input": "lmb",
      "attackId": "attack.elin.lmb",
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
      "id": "ability.elin.rmb",
      "input": "rmb",
      "attackId": "attack.elin.rmb",
      "inputPolicy": {
        "repeatWhileHeld": false,
        "tapHoldSplit": true,
        "holdThresholdMs": 200,
        "holdGauge": true,
        "holdGaugeStateKey": "charge:elin-rmb-mode"
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
            "type": "summon.toggle",
            "stateKey": "spirit",
            "tags": [
              "스킬",
              "소환"
            ],
            "activeCommand": {
              "type": "mode-tap-command",
              "guardMode": "guard",
              "exploreMode": "explore",
              "cooldown": 500,
              "guardAttackId": "attack.elin.spirit-guard-burst",
              "guardCost": 150,
              "exploreDash": {
                "attackId": "attack.elin.spirit-dash",
                "target": "nearest-enemy",
                "cost": 150,
                "cooldown": 500,
                "maxDistance": 208,
                "fixedDistance": true,
                "blockWhileMoving": true,
                "includeTargetRadius": false
              }
            }
          }
        ]
      },
      "holdTrigger": {
        "type": "trigger",
        "event": "input.hold",
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
            "type": "summon.active",
            "stateKey": "spirit"
          }
        ],
        "modules": [
          {
            "type": "resource.spend",
            "resource": "stamina",
            "amount": 150
          },
          {
            "type": "summon.return-owner",
            "stateKey": "spirit",
            "whenMode": {
              "stateKey": "spirit-mode",
              "value": "explore",
              "initial": "guard"
            },
            "setModeAfter": "guard",
            "cooldown": 500,
            "returnAttackId": "attack.elin.spirit-return",
            "tags": [
              "스킬",
              "소환"
            ]
          },
          {
            "type": "mode.toggle",
            "stateKey": "spirit-mode",
            "initial": "guard",
            "values": [
              "guard",
              "explore"
            ],
            "cooldown": 500,
            "tags": [
              "스킬"
            ]
          }
        ]
      }
    },
    "counter": {
      "id": "ability.elin.counter",
      "input": "counter",
      "attackId": "attack.elin.counter-explosion",
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
            "cc": {
              "type": "movement.neutralize-knockback",
              "target": "hit-target",
              "direction": "away-from-impact",
              "distance": {
                "$ref": "attacks.counterExplosion.modules.1.distance"
              },
              "speed": {
                "$ref": "attacks.counterExplosion.modules.1.speed"
              },
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  }
}
