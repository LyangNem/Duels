{
  "id": "geopin",
  "name": "지오핀",
  "englishName": "Geopin",
  "title": "천재 발명가",
  "color": "#e6ca3b",
  "classification": {
    "style": 6,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1100,
    "speed": 4.5,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 4
  },
  "desc": "상대의 공격과 움직임을 분석해 상황에 맞는 발명품으로 대응하는 캐릭터",
  "reactiveEquipment": {
    "stateKey": "geopin-weapon",
    "initial": "rubber",
    "longDistance": 350,
    "closeDistance": 350,
    "approachWindow": 350,
    "approachDelta": 100,
    "approachNear": 350,
    "restrictedStatuses": [
      "stun",
      "neutralize",
      "freeze",
      "bind",
      "sleep"
    ],
    "items": [
      {
        "value": "jump",
        "name": "추진 가속기",
        "stateKey": "geopin-invent-jump",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "field"
            }
          ]
        }
      },
      {
        "value": "wall",
        "name": "충격 전달기",
        "stateKey": "geopin-invent-wall",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "behindWall"
            }
          ]
        }
      },
      {
        "value": "laser",
        "name": "고회전 레이저",
        "stateKey": "geopin-invent-laser",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "blocked"
            }
          ]
        }
      },
      {
        "value": "chain",
        "name": "전이 고무탄 발사기",
        "stateKey": "geopin-invent-chain",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "summon"
            }
          ]
        }
      },
      {
        "value": "punch",
        "name": "주먹 발사기",
        "stateKey": "geopin-invent-punch",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "approach"
            }
          ]
        }
      },
      {
        "value": "recoil",
        "name": "과반동 발사기",
        "stateKey": "geopin-invent-recoil",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "restricted"
            }
          ]
        }
      },
      {
        "value": "sniper",
        "name": "정밀 고무탄 발사기",
        "stateKey": "geopin-invent-sniper",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "far"
            }
          ]
        }
      },
      {
        "value": "bomb",
        "name": "폭발 고무탄 발사기",
        "stateKey": "geopin-invent-bomb",
        "required": 3,
        "trigger": {
          "type": "trigger",
          "event": "equipment.situation",
          "conditions": [
            {
              "type": "situation.flag",
              "flag": "close"
            }
          ]
        }
      }
    ],
    "inputSlot": "lmb",
    "approachTargetKinds": [
      "player",
      "trainingBot",
      "summon"
    ],
    "initialName": "고무탄 발사기",
    "restrictedAttackTags": [
      "stun",
      "neutralize",
      "freeze",
      "bind",
      "sleep"
    ],
    "distanceImpactTypes": [
      "direct",
      "projectile",
      "area",
      "effect-animation"
    ],
    "distanceExcludedAttackTags": [
      "상태 피해",
      "덫 발동",
      "stun",
      "neutralize",
      "freeze",
      "bind",
      "slow",
      "sleep",
      "끌어오기"
    ],
    "approachSpeedRatio": 1.2,
    "farExclusive": true,
    "fieldTrigger": "damage"
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "gearCluster",
      "radius": 50,
      "teeth": 16,
      "color": "#e6ca3b",
      "idleAlpha": 0.2,
      "useHoldMs": 350,
      "useFadeMs": 500,
      "rotationMs": 350,
      "gears": [
        {
          "stateKey": "geopin-weapon",
          "initial": "rubber",
          "values": [
            "rubber",
            "jump",
            "wall",
            "laser",
            "chain",
            "punch",
            "recoil",
            "sniper",
            "bomb"
          ],
          "x": 0,
          "y": 0,
          "turnRadians": 6.283185307179586
        }
      ],
      "enemyAlpha": 1,
      "allyAlpha": 1
    }
  ],
  "worldGaugeModules": [
    {
      "type": "gauge.equipment-bank",
      "visibility": "owner",
      "radius": 11,
      "x": 58,
      "y": -30,
      "gap": 29,
      "color": "#e6ca3b",
      "idleAlpha": 0.35,
      "holdMs": 500,
      "fadeMs": 500,
      "columns": 3,
      "activeColor": "#fff5a3"
    },
    {
      "type": "range.equipment-thresholds",
      "visibility": "owner",
      "color": "#e6ca3b",
      "alpha": 0.4,
      "dash": [
        6,
        6
      ],
      "lineWidth": 1.5
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "발명",
      "text": "상황이 3회 발생하면 해당 발명품을 제작. 완성한 발명품은 같은 상황에서 자동 장착"
    },
    {
      "key": "LMB",
      "name": "발명품",
      "attack": "lmb",
      "text": "장착한 발명품으로 공격 ({damage})"
    },
    {
      "key": "RMB",
      "name": "다른 무기!",
      "attack": "rmb",
      "text": "이전에 장착중이던 발명품으로 전환"
    },
    {
      "key": "RMB HOLD",
      "name": "애정 발명품",
      "attack": "rmb",
      "text": "벽에 튕겨 유도되는 고무탄을 발사하는 고무탄 발사기로 전환"
    },
    {
      "key": "L-Shift",
      "name": "위험 속 깨달음",
      "attack": "counter",
      "text": "마지막 상황에 맞는 발명품을 즉시 제작하고 주변 적에게 피해 ({damage})"
    },
    {
      "key": "WEAPON",
      "name": "추진 도약기",
      "text": "지속 장판 공격에 피해받으면 충전. 짧은 거리 점프",
      "attack": "jump",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "충격 전달기",
      "text": "벽 뒤 적에게 공격받으면 충전. 벽에 고무탄을 맞히면 벽 너머를 공격 ({damage}/{linkedDamage})",
      "attack": "wall",
      "showCost": false,
      "linkedAttack": "wallBurst"
    },
    {
      "key": "WEAPON",
      "name": "고회전 레이저",
      "text": "공격이 방어에 막히면 충전. 레이저로 공격 ({damage})",
      "attack": "laser",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "전이 고무탄 발사기",
      "text": "소환수에게 공격받으면 충전. 적에게도 튕기는 고무탄을 발사 ({damage})",
      "attack": "chain",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "주먹 발사기",
      "text": "적이 순간적으로 접근하면 충전. 스프링 주먹을 발사하여 강하게 넉백 ({damage})",
      "attack": "punch",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "과반동 발사기",
      "text": "이동을 정지당하면 충전. 고무탄을 강하게 발사하며 반동 넉백 ({damage})",
      "attack": "recoil",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "정밀 고무탄 발사기",
      "text": "그 외 일정거리 외의 적에게 공격받으면 충전. 빠르고 사거리가 긴 고무탄 발사 ({damage})",
      "attack": "sniper",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "폭발 고무탄 발사기",
      "text": "그 외 일정거리 내의 적에게 공격받으면 충전. 근거리에서 폭발하는 고무탄 발사 ({damage})",
      "attack": "bomb",
      "showCost": false,
      "linkedAttack": "explosion"
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
          "speed": 32.643,
          "radius": 15
        },
        {
          "type": "projectile.redirect",
          "on": [
            "wall"
          ],
          "searchRadius": 0,
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.65
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "jump": {
      "id": "attack.geopin.jump",
      "damageRatio": 0.0,
      "cost": 150,
      "cd": 350,
      "range": 220,
      "modules": [
        {
          "type": "trajectory.arc",
          "height": 55,
          "screenLiftRatio": 0.55,
          "apexScale": 1,
          "apexAlpha": 1,
          "apexStrokeAlpha": 1
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "direction": "target-point",
          "distance": 220,
          "duration": 200,
          "replaceActive": true,
          "blocksAction": true,
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "resolveOverlapOnEnd": true,
          "presentation": false,
          "tags": [
            "이동기"
          ],
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
        "평타"
      ],
      "effectsOnly": true
    },
    "wall": {
      "id": "attack.geopin.wall",
      "damageRatio": 1.5,
      "cost": 150,
      "cd": 350,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 30.0,
          "radius": 15
        },
        {
          "type": "projectile.wall-relay",
          "attackId": "attack.geopin.wallBurst"
        },
        {
          "type": "projectile.redirect",
          "searchRadius": 0,
          "on": [
            "wall"
          ],
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.65
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "wallBurst": {
      "id": "attack.geopin.wallBurst",
      "damageRatio": 2.5,
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
    "laser": {
      "id": "attack.geopin.laser",
      "damageRatio": 1.5,
      "cost": 200,
      "cd": 350,
      "range": 500,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": 500,
          "halfWidth": 14,
          "wallPolicy": "block",
          "projectileClassification": "instant-laser"
        },
        {
          "type": "effect.spawn",
          "renderType": "beamLine",
          "range": 500,
          "halfWidth": 14,
          "nonHitAuraHalfWidth": 14,
          "color": "230,202,59",
          "coreColor": "255,255,255",
          "fillAlpha": 0.34,
          "strokeAlpha": 0.9,
          "coreAlpha": 0.82,
          "coreWidthRatio": 0.16,
          "lineWidth": 3,
          "glowAlpha": 0.065,
          "glowWidthRatio": 2.8,
          "midGlowAlpha": 0.11,
          "midGlowWidthRatio": 1.65,
          "flareAlpha": 0.36,
          "flareRadiusRatio": 1.15,
          "pulseSpeed": 0.018,
          "friendlyViewerAlphaScale": 0.5,
          "duration": 72,
          "followSource": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true,
          "clipToAttackArea": true
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "chain": {
      "id": "attack.geopin.chain",
      "damageRatio": 1.5,
      "cost": 150,
      "cd": 350,
      "range": 850,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 28.07686607142857,
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
          "wallSpeedMultiplier": 0.65
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "punch": {
      "id": "attack.geopin.punch",
      "damageRatio": 1.5,
      "cost": 150,
      "cd": 350,
      "range": 200,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "progressRect",
          "position": "source",
          "range": 200,
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
              "range": 200,
              "halfWidth": 50,
              "wallPolicy": "block"
            }
          }
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 180,
          "speed": 12,
          "when": "on-hit"
        }
      ],
      "tags": [
        "평타"
      ],
      "previewGeometry": {
        "shape": "rect",
        "range": 200,
        "halfWidth": 50,
        "wallPolicy": "block"
      }
    },
    "recoil": {
      "id": "attack.geopin.recoil",
      "damageRatio": 2.5,
      "cost": 200,
      "cd": 350,
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 57.12525,
          "radius": 15
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "direction": "opposite-aim",
          "distance": 100,
          "duration": 140,
          "motionMode": "knockback",
          "collision": {
            "passWalls": false,
            "passEnemies": false
          },
          "presentation": false
        },
        {
          "type": "projectile.redirect",
          "searchRadius": 0,
          "on": [
            "wall"
          ],
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.65
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "sniper": {
      "id": "attack.geopin.sniper",
      "damageRatio": 1.5,
      "cost": 200,
      "cd": 350,
      "range": 850,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 51.83421428571428,
          "radius": 15
        },
        {
          "type": "projectile.redirect",
          "searchRadius": 0,
          "on": [
            "wall"
          ],
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.65
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "bomb": {
      "id": "attack.geopin.bomb",
      "damageRatio": 1.5,
      "cost": 200,
      "cd": 350,
      "range": 250,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 27.5,
          "radius": 15,
          "collisionTargets": true
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.geopin.explosion"
          ],
          "shareHitTargets": true
        },
        {
          "type": "projectile.redirect",
          "searchRadius": 0,
          "on": [
            "wall"
          ],
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.65
        },
        {
          "type": "hit.once-per-execution"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "explosion": {
      "id": "attack.geopin.explosion",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 0,
      "range": 110,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 110,
          "wallPolicy": "block"
        },
        {
          "type": "hit.once-per-execution"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.geopin.rmb",
      "damageRatio": 0.0,
      "cost": 0,
      "cd": 250,
      "range": 0,
      "modules": [],
      "tags": [
        "스킬"
      ],
      "effectsOnly": true
    },
    "counter": {
      "id": "attack.geopin.counter",
      "damageRatio": 2.5,
      "cost": 0,
      "cd": 350,
      "range": 220,
      "modules": [
        {
          "type": "equipment.discover",
          "when": "after-attack"
        },
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 220,
          "wallPolicy": "block"
        }
      ],
      "tags": [
        "반격"
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
            "type": "action.attack",
            "alternates": [
              {
                "attackId": "attack.geopin.jump",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "jump"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.wall",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "wall"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.laser",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "laser"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.chain",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "chain"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.punch",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "punch"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.recoil",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "recoil"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.sniper",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "sniper"
                  }
                ]
              },
              {
                "attackId": "attack.geopin.bomb",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "geopin-weapon",
                    "initial": "rubber",
                    "value": "bomb"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.geopin.rmb",
      "input": "rmb",
      "attackId": "attack.geopin.rmb",
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
            "type": "equipment.select",
            "operation": "previous",
            "requireExecuted": true
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false,
        "tapHoldSplit": true,
        "holdThresholdMs": 200,
        "holdGauge": true,
        "holdGaugeTimerOnly": true,
        "holdGaugeStateKey": "charge:geopin-rmb-mode",
        "deferTapUntilRelease": true,
        "holdGaugeRetainMs": 500,
        "holdGaugeRequireAvailable": true,
        "cancelUnavailableHold": true
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
            "type": "combat.can-act"
          },
          {
            "type": "state.mode-is",
            "stateKey": "geopin-weapon",
            "value": "rubber",
            "initial": "rubber",
            "invert": true
          }
        ],
        "modules": [
          {
            "type": "equipment.select",
            "value": "rubber"
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
  }
}
