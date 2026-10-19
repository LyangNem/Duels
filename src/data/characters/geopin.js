{
  "id": "geopin",
  "name": "지오핀",
  "englishName": "Geopin",
  "title": "천재 발명가",
  "color": "#e6ca3b",
  "classification": {
    "style": 6,
    "range": 3,
    "role": 1
  },
  "stats": {
    "maxHealth": 900,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 2
  },
  "desc": "적과 공격에서 아이디어를 얻고 상황에 맞는 모듈을 추가하는 캐릭터",
  "ideaModules": {
    "stateKey": "geopin-idea",
    "range": 350,
    "closeDistance": {
      "$ref": "ideaModules.range"
    },
    "hitGain": 0.1,
    "presencePerSecond": 0.2,
    "attackGain": 0.1,
    "threshold": 1,
    "rotationStateKey": "geopin-modules-gear",
    "items": [
      {
        "value": "wall",
        "name": "충격 전달 모듈",
        "stateKey": "geopin-module-wall",
        "situation": "behindWall"
      },
      {
        "value": "punch",
        "name": "이중 충격 모듈",
        "stateKey": "geopin-module-punch",
        "situation": "close"
      },
      {
        "value": "sniper",
        "name": "정밀 발사 모듈",
        "stateKey": "geopin-module-sniper",
        "situation": "far"
      }
    ],
    "countStateKey": "geopin-module-count",
    "situationRange": 650,
    "presencePerEnemy": true,
    "excludedEntityKinds": [
      "summon"
    ]
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "rubber-launcher",
      "scale": 2.1,
      "angle": -0.45,
      "idleAlpha": 0.4,
      "rotationStateKey": "geopin-shot-image",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "rubber-muzzle",
      "scale": 2.1,
      "angle": -0.45,
      "idleAlpha": 0.4,
      "rotationStateKey": "geopin-shot-image",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "geopin-module-punch",
          "initial": "inactive",
          "value": "inactive"
        }
      ]
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "rubber-module-punch",
      "scale": 2.1,
      "angle": -0.45,
      "idleAlpha": 0.4,
      "rotationStateKey": "geopin-shot-image",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "geopin-module-punch",
          "initial": "inactive",
          "value": "active"
        }
      ]
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "rubber-module-sniper",
      "scale": 2.1,
      "angle": -0.45,
      "idleAlpha": 0.4,
      "rotationStateKey": "geopin-shot-image",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "geopin-module-sniper",
          "initial": "inactive",
          "value": "active"
        }
      ]
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "rubber-module-wall",
      "scale": 2.1,
      "angle": -0.45,
      "idleAlpha": 0.4,
      "rotationStateKey": "geopin-shot-image",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586,
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "geopin-module-wall",
          "initial": "inactive",
          "value": "active"
        }
      ]
    }
  ],
  "worldGaugeModules": [
    {
      "type": "range.circle",
      "visibility": "owner",
      "range": {
        "$ref": "ideaModules.range"
      },
      "alpha": 0.35,
      "dash": [
        5,
        5
      ]
    },
    {
      "type": "gauge.segmented",
      "valueMode": "mask",
      "valueRef": {
        "type": "mode-match-mask",
        "modes": [
          {
            "stateKey": "geopin-module-punch",
            "initial": "inactive",
            "value": "active"
          },
          {
            "stateKey": "geopin-module-sniper",
            "initial": "inactive",
            "value": "active"
          },
          {
            "stateKey": "geopin-module-wall",
            "initial": "inactive",
            "value": "active"
          }
        ]
      },
      "height": 4,
      "gap": 2,
      "segments": [
        {
          "value": "punch",
          "color": {
            "$ref": "color"
          }
        },
        {
          "value": "sniper",
          "color": {
            "$ref": "color"
          }
        },
        {
          "value": "wall",
          "color": {
            "$ref": "color"
          }
        }
      ]
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.geopin.lmb",
      "damageRatio": 1.5,
      "cost": 150,
      "cd": 350,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 22.850099999999998,
          "radius": 15
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "projectile.redirect",
          "on": [
            "wall",
            "hit"
          ],
          "maxRedirects": 0,
          "searchRadius": 0,
          "maxWallRedirects": 0,
          "rangeGrowthRatio": 0.4,
          "rangeGrowthOn": [
            "hit"
          ],
          "wallSpeedMultiplier": 0.5,
          "hitSpeedMultiplier": 0.5,
          "wallSpeedOnce": true
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "geopin-shot-image",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ],
      "projectileFamily": "rubber",
      "attackFeatureTransform": {
        "type": "mode-modules",
        "options": [
          {
            "stateKey": "geopin-module-sniper",
            "initial": "inactive",
            "value": "active",
            "specOverrides": {
              "range": 850
            },
            "moduleOverrides": [
              {
                "type": "delivery.projectile",
                "values": {
                  "speed": 36.28395
                }
              }
            ]
          },
          {
            "stateKey": "geopin-module-wall",
            "initial": "inactive",
            "value": "active",
            "modules": [
              {
                "type": "projectile.wall-relay",
                "attackId": "attack.geopin.wallBurst"
              }
            ]
          },
          {
            "stateKey": "geopin-module-punch",
            "initial": "inactive",
            "value": "active",
            "modules": [
              {
                "type": "effect.spawn",
                "when": "after-attack",
                "renderType": "progressRect",
                "position": "source",
                "range": 220,
                "halfWidth": 50,
                "growthSpeed": 13.464,
                "travelSpeed": 12240,
                "animation": true,
                "clipToAttackArea": true,
                "color": "#e6ca3b",
                "strokeColor": "#e6ca3b",
                "fillAlpha": 0.18,
                "strokeAlpha": 0.9,
                "lineWidth": 2.5,
                "endCap": true,
                "duration": 220,
                "damage": {
                  "attackId": "attack.geopin.punch",
                  "hitMode": "progressive-rect",
                  "module": {
                    "type": "delivery.area",
                    "shape": "rect",
                    "range": 220,
                    "halfWidth": 50,
                    "wallPolicy": "block"
                  },
                  "missAttackId": "attack.geopin.punchRubber",
                  "interactionAttackId": "attack.geopin.punchRubber"
                }
              },
              {
                "$ref": "attacks.punch.modules.1"
              }
            ],
            "removeTypes": [
              "delivery.projectile",
              "projectile.pierce",
              "projectile.redirect",
              "projectile.wall-relay"
            ]
          }
        ]
      }
    },
    "wallBurst": {
      "id": "attack.geopin.wallBurst",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 0,
      "range": 200,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": 200,
          "halfWidth": 45,
          "wallPolicy": "ignore"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "punch": {
      "id": "attack.geopin.punch",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 0,
      "range": 220,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "progressRect",
          "position": "source",
          "range": 220,
          "halfWidth": 50,
          "growthSpeed": 13.464,
          "travelSpeed": 12240,
          "animation": true,
          "clipToAttackArea": true,
          "color": "#e6ca3b",
          "strokeColor": "#e6ca3b",
          "fillAlpha": 0.18,
          "strokeAlpha": 0.9,
          "lineWidth": 2.5,
          "endCap": true,
          "duration": 220,
          "damage": {
            "attackId": "attack.geopin.punch",
            "hitMode": "progressive-rect",
            "module": {
              "type": "delivery.area",
              "shape": "rect",
              "range": 220,
              "halfWidth": 50,
              "wallPolicy": "block"
            },
            "missAttackId": "attack.geopin.punchRubber",
            "interactionAttackId": "attack.geopin.punchRubber"
          }
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 60,
          "speed": 12,
          "when": "on-hit"
        }
      ],
      "tags": [
        "평타"
      ],
      "previewGeometry": {
        "shape": "rect",
        "range": 220,
        "halfWidth": 50,
        "wallPolicy": "block"
      }
    },
    "punchRubber": {
      "id": "attack.geopin.punchRubber",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 0,
      "range": 400,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 22.850099999999998,
          "radius": 15
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "projectile.redirect",
          "on": [
            "wall",
            "hit"
          ],
          "maxRedirects": 0,
          "searchRadius": 0,
          "maxWallRedirects": 0,
          "rangeGrowthRatio": 0.4,
          "rangeGrowthOn": [
            "hit"
          ],
          "wallSpeedMultiplier": 0.5,
          "hitSpeedMultiplier": 0.5,
          "wallSpeedOnce": true
        }
      ],
      "tags": [
        "평타"
      ],
      "projectileFamily": "rubber",
      "attackFeatureTransform": {
        "type": "mode-modules",
        "options": [
          {
            "stateKey": "geopin-module-sniper",
            "initial": "inactive",
            "value": "active",
            "specOverrides": {
              "range": 600
            },
            "moduleOverrides": [
              {
                "type": "delivery.projectile",
                "values": {
                  "speed": 36.28395
                }
              }
            ]
          },
          {
            "stateKey": "geopin-module-wall",
            "initial": "inactive",
            "value": "active",
            "modules": [
              {
                "type": "projectile.wall-relay",
                "attackId": "attack.geopin.wallBurst"
              }
            ]
          }
        ]
      }
    },
    "counter": {
      "id": "attack.geopin.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 350,
      "range": 220,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 220,
          "wallPolicy": "block"
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "geopin-idea",
          "operation": "add",
          "amount": 0.5,
          "max": 1,
          "presentation": {
            "type": "arc-gauge",
            "color": "#e6ca3b",
            "maxChargeFlash": true
          }
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "rmb": {
      "id": "attack.geopin.rmb",
      "damageRatio": 0,
      "cost": 0,
      "cd": 300,
      "range": 0,
      "effectsOnly": true,
      "modules": [],
      "tags": [
        "스킬"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.geopin.lmb",
      "input": "lmb",
      "attackId": "attack.geopin.lmb",
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
      "id": "ability.geopin.rmb",
      "input": "rmb",
      "attackId": "attack.geopin.rmb",
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
            "type": "cooldowns.ready",
            "attackIds": [
              "attack.geopin.rmb"
            ]
          },
          {
            "type": "state.absent",
            "stateKey": "drag:geopin:rmb"
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "start",
            "stateKey": "drag:geopin:rmb",
            "distanceMode": "world",
            "pathOrigin": "pointer",
            "sampleInterval": 8,
            "previewPath": true,
            "previewLivePointer": true,
            "previewColor": "230,202,59",
            "cost": {
              "perDistance": 0.7
            }
          }
        ]
      },
      "releaseTrigger": {
        "type": "trigger",
        "event": "input.release",
        "conditions": [
          {
            "type": "input.slot",
            "slot": "rmb"
          },
          {
            "type": "entity.alive"
          }
        ],
        "modules": [
          {
            "type": "input.drag-path",
            "operation": "release",
            "stateKey": "drag:geopin:rmb",
            "minimumPoints": 2,
            "capturePointer": true
          },
          {
            "type": "action.attack"
          },
          {
            "type": "movement.path-carrier",
            "pathSource": "drag-path",
            "speed": 1200,
            "radius": 25,
            "pickupRange": 45,
            "targetRelations": [
              "self",
              "ally"
            ],
            "color": {
              "$ref": "color"
            },
            "name": "버터",
            "collision": {
              "passWalls": true,
              "passEnemies": true
            },
            "pathOrigin": "pointer",
            "summonStateKey": "butter",
            "riderCollision": {
              "$ref": "abilities.rmb.releaseTrigger.modules.2.collision"
            }
          },
          {
            "type": "input.drag-path",
            "operation": "clear",
            "stateKey": "drag:geopin:rmb"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.geopin.counter",
      "input": "counter",
      "attackId": "attack.geopin.counter",
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
              "distance": 100,
              "speed": 12,
              "oncePerExecution": true
            }
          }
        ]
      }
    }
  },
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "발명",
      "showCost": false,
      "text": "적 타격 또는 주변 공격에서 아이디어 10% 획득. 주변 적 한 명당 초당 20% 획득. 아이디어 100%마다 상황에 맞는 모듈 추가"
    },
    {
      "key": "LMB",
      "name": "고무탄 발사기",
      "attack": "lmb",
      "text": "적과 벽에 튕겨 적을 향하는 고무탄. 튕기면 탄속 감소 ({damage})"
    },
    {
      "key": "RMB DRAG",
      "name": "도우미 로봇",
      "attack": "rmb",
      "text": "버터의 이동경로를 지정",
      "costRef": {
        "ability": "rmb",
        "trigger": "trigger",
        "module": "input.drag-path",
        "format": "per-distance",
        "property": "cost.perDistance"
      }
    },
    {
      "key": "L-Shift",
      "name": "위험 속 깨달음",
      "attack": "counter",
      "text": "주변에 피해를 주며 아이디어 50% 획득 ({damage})"
    },
    {
      "key": "MODULE",
      "section": "WEAPON",
      "name": "이중 충격 모듈",
      "attack": "punch",
      "linkedAttack": "punchRubber",
      "showCost": false,
      "text": "근거리 적이 있으면 제작. 전방 압력으로 피해 및 넉백. 빗나가면 끝에서 고무탄 발사 ({damage}/{linkedDamage})"
    },
    {
      "key": "MODULE",
      "section": "WEAPON",
      "name": "정밀 발사 모듈",
      "showCost": false,
      "text": "원거리 적이 있으면 제작. 고무탄 사거리 및 탄속 증가"
    },
    {
      "key": "MODULE",
      "section": "WEAPON",
      "name": "충격 전달 모듈",
      "attack": "wallBurst",
      "showCost": false,
      "text": "벽 뒤 적이 있으면 제작. 벽에 맞힌 고무탄이 벽 너머를 공격 ({damage})"
    }
  ],
  "summons": {
    "butter": {
      "id": "summon.geopin.butter",
      "name": "버터",
      "maxHealth": 400,
      "radius": 25,
      "speed": 0,
      "baseDamage": 0,
      "respawnDelay": 0,
      "healthRegen": false,
      "pathCarrier": true,
      "tags": [
        "소환수"
      ],
      "ai": {
        "enabled": false
      },
      "protectRidersFromProjectiles": true
    }
  },
  "summonSpecs": [
    {
      "stateKey": "butter",
      "stats": [
        {
          "key": "HEALTH",
          "text": "{maxHealth}"
        },
        {
          "key": "ABILITY",
          "text": "경로를 이동하며 이동경로의 아군을 운반"
        }
      ]
    }
  ]
}
