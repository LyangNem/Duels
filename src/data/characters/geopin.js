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
        "value": "recoil",
        "name": "과반동 발사기",
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
        "name": "고회전 발사기",
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
        "name": "전이 발사기",
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
        "name": "이중 충격기",
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
        "value": "jump",
        "name": "충격 도약기",
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
        "name": "정밀 발사기",
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
        "name": "폭발형 발사기",
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
      "text": "각 조건이 3회 발생하면 발명품 제작. 이후 같은 조건 발생 시 자동 장착"
    },
    {
      "key": "LMB",
      "name": "발명품",
      "attack": "lmb",
      "text": "장착한 발명품으로 공격"
    },
    {
      "key": "RMB",
      "name": "다른 무기!",
      "attack": "rmb",
      "text": "이전 발명품으로 전환"
    },
    {
      "key": "RMB HOLD",
      "name": "애정 발명품",
      "attack": "rmb",
      "text": "벽에 튕겨 적을 향하는 기본 고무탄 발사기로 전환"
    },
    {
      "key": "L-Shift",
      "name": "위험 속 깨달음",
      "attack": "counter",
      "text": "마지막 조건의 발명품을 즉시 제작하고 주변에 피해 ({damage})"
    },
    {
      "key": "WEAPON",
      "name": "과반동 발사기",
      "text": "지속 장판 피격 시 충전. 고무탄을 발사하며 뒤로 반동 이동 ({damage})",
      "attack": "recoil",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "충격 전달기",
      "text": "벽 뒤 적에게 피격 시 충전. 벽에 맞힌 고무탄이 벽 너머를 공격 ({damage}/{linkedDamage})",
      "attack": "wall",
      "showCost": false,
      "linkedAttack": "wallBurst"
    },
    {
      "key": "WEAPON",
      "name": "고회전 발사기",
      "text": "공격이 방어에 막히면 충전. 고무탄 2발 연사 ({damage})",
      "attack": "laser",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "전이 발사기",
      "text": "소환수에게 피격 시 충전. 적중 시 튕기는 고무탄 발사 ({damage})",
      "attack": "chain",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "이중 충격기",
      "text": "적이 빠르게 접근하면 충전. 전방에 피해 및 강한 넉백. 빗나가면 끝에서 고무탄 발사 ({damage}/{linkedDamage})",
      "attack": "punch",
      "showCost": false,
      "linkedAttack": "punchRubber"
    },
    {
      "key": "WEAPON",
      "name": "충격 도약기",
      "text": "CC기로 이동을 제한당하면 충전. 주변에 피해를 주며 뒤로 점프 ({damage})",
      "attack": "jump",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "정밀 발사기",
      "text": "다른 조건 없이 일정 거리 밖의 적에게 피격 시 충전. 빠르고 긴 사거리의 고무탄 발사 ({damage})",
      "attack": "sniper",
      "showCost": false
    },
    {
      "key": "WEAPON",
      "name": "폭발형 발사기",
      "text": "다른 조건 없이 일정 거리 이내의 적에게 피격 시 충전. 적중 시 또는 사거리 끝에서 폭발 ({damage})",
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
          "wallSpeedMultiplier": 0.5
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "jump": {
      "id": "attack.geopin.jump",
      "damageRatio": 2.5,
      "cost": 150,
      "cd": 350,
      "range": 110,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 110,
          "wallPolicy": "block"
        },
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
          "direction": "opposite-aim",
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
      "previewGeometry": {
        "shape": "circle",
        "range": 110,
        "wallPolicy": "block"
      }
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
          "wallSpeedMultiplier": 0.5
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
      "range": 650,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 32.643,
          "radius": 15
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 2,
          "delay": 0,
          "interval": 100,
          "aimMode": "locked"
        },
        {
          "type": "projectile.redirect",
          "on": [
            "wall"
          ],
          "searchRadius": 0,
          "maxWallRedirects": 0,
          "wallSpeedMultiplier": 0.5
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
          "wallSpeedMultiplier": 0.5
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "punch": {
      "id": "attack.geopin.punch",
      "damageRatio": 2.5,
      "cost": 150,
      "cd": 350,
      "range": 250,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "progressRect",
          "position": "source",
          "range": 250,
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
              "range": 250,
              "halfWidth": 50,
              "wallPolicy": "block"
            },
            "missAttackId": "attack.geopin.punchRubber"
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
        "range": 250,
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
          "speed": 32.643,
          "radius": 15
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "direction": "opposite-aim",
          "distance": 200,
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
          "wallSpeedMultiplier": 0.5
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
          "wallSpeedMultiplier": 0.5
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
          "wallSpeedMultiplier": 0.5
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
          "wallSpeedMultiplier": 0.5
        }
      ],
      "tags": [
        "평타"
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
