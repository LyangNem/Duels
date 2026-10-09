{
  "id": "reika",
  "name": "레이카",
  "title": "태양의 기사",
  "color": "#ff7a00",
  "classification": {
    "style": 7,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1300,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "가호를 충전하고 태양의 대검과 화염 검격으로 적을 압박하는 캐릭터",
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "reika-mode",
          "value": "normal",
          "initial": "normal"
        }
      ],
      "style": "sun",
      "rotationStateKey": "reika-sword-rotation",
      "rotationMs": 300,
      "angle": -0.6,
      "scale": 1.85,
      "color": "#ff7a00"
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "conditions": [
        {
          "type": "state.mode-is",
          "stateKey": "reika-mode",
          "value": "blessed",
          "initial": "normal"
        }
      ],
      "style": "sun-blessed",
      "rotationStateKey": "reika-sword-rotation",
      "rotationMs": 300,
      "angle": -0.6,
      "scale": 1.85,
      "color": "#38bdf8",
      "glow": 5
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "가호 충전",
      "showCost": false,
      "text": "시간이 지나거나 적을 타격해 가호 충전"
    },
    {
      "key": "LMB",
      "name": "태양의 대검",
      "attack": "lmb",
      "text": "대검 휘두르기 ({damage})"
    },
    {
      "key": "RMB",
      "name": "태양의 가호",
      "attack": "gahoWeapon",
      "linkedAttack": "gahoSlam",
      "secondaryAttack": "gahoLand",
      "text": "가호 100% 이상 및 비활성 상태에서 사용. 공중으로 떠오르며 가호 활성화. 지정 지점으로 대검 투척 후 해당 지점으로 강하 ({damageSequence})"
    },
    {
      "key": "L-Shift",
      "name": "반동제어불능!",
      "attack": "counter",
      "linkedAttack": "counterSpin",
      "text": "전방으로 돌진하며 적중 시 정지. 정지 지점에서 대검으로 한 바퀴 회전하여 피해 ({linkedDamage})"
    },
    {
      "key": "LMB PROTECTION",
      "name": "태양의 검격",
      "attack": "lmbBlessed",
      "linkedAttack": "lmbWave",
      "text": "대검을 휘두르며 전방으로 화염 검기 소환. 적중 시 화염 ({damage}/{linkedDamage})"
    }
  ],
  "triggers": [
    {
      "id": "reika-gaho-damage-charge",
      "type": "trigger",
      "event": "damage-dealt",
      "conditions": [],
      "modules": [
        {
          "type": "state.progress",
          "stateKey": "reika-gaho",
          "operation": "add",
          "amountFrom": "healthDamage",
          "amountScale": 0.04,
          "max": 200,
          "presentation": {
            "type": "arc-gauge",
            "color": "#ff7a00",
            "overflowColor": "#ffd080",
            "lineWidth": 3.5,
            "layers": 2,
            "readyAtRatio": 0.5,
            "maxChargeFlash": true,
            "flashAfterFirstLayer": true
          }
        }
      ]
    }
  ],
  "passives": [
    {
      "type": "state.progress-rate",
      "stateKey": "reika-gaho",
      "max": 200,
      "ratePerSecond": 2.5,
      "whenMode": {
        "stateKey": "reika-mode",
        "value": "normal",
        "initial": "normal"
      },
      "presentation": {
        "type": "arc-gauge",
        "color": "#ff7a00",
        "overflowColor": "#ffd080",
        "lineWidth": 3.5,
        "layers": 2,
        "readyAtRatio": 0.5,
        "maxChargeFlash": true,
        "flashAfterFirstLayer": true
      }
    },
    {
      "type": "state.progress-rate",
      "stateKey": "reika-gaho",
      "max": 200,
      "ratePerSecond": -25,
      "whenMode": {
        "stateKey": "reika-mode",
        "value": "blessed",
        "initial": "normal"
      },
      "setModeAtEmpty": {
        "stateKey": "reika-mode",
        "value": "normal",
        "initial": "normal"
      },
      "presentation": {
        "type": "arc-gauge",
        "color": "#ff7a00",
        "overflowColor": "#ffd080",
        "lineWidth": 3.5,
        "layers": 2,
        "readyAtRatio": 0.5,
        "maxChargeFlash": true,
        "flashAfterFirstLayer": true
      }
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.reika.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 560,
      "range": 350,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.2,
          "angleOffset": 0.35,
          "endChord": true,
          "endChordWidth": 2,
          "wallPolicy": "block",
          "render": false
        },
        {
          "type": "effect.spawn",
          "renderType": "arcSweep",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": {
            "$ref": "attacks.lmb.modules.0.halfAngle"
          },
          "angleOffset": 0.35,
          "animateSweep": false,
          "color": "255,122,0",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "durationFrames": 12,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "reika-sword-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "평타"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "lmbBlessed": {
      "id": "attack.reika.lmb-blessed",
      "damageRatio": 1,
      "cost": 150,
      "cd": 450,
      "range": {
        "$ref": "attacks.lmb.range"
      },
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmbBlessed.range"
          },
          "halfAngle": 1.2,
          "angleOffset": 0.35,
          "endChord": true,
          "endChordWidth": 2,
          "wallPolicy": "block",
          "render": false
        },
        {
          "type": "effect.spawn",
          "renderType": "arcSweep",
          "range": {
            "$ref": "attacks.lmbBlessed.range"
          },
          "halfAngle": {
            "$ref": "attacks.lmbBlessed.modules.0.halfAngle"
          },
          "angleOffset": 0.35,
          "animateSweep": false,
          "color": "56,189,248",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.92,
          "lineWidth": 3,
          "durationFrames": 12,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "reika-sword-rotation",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": 2000,
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
        "평타"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "lmbWave": {
      "id": "attack.reika.lmb-wave",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 875,
      "modules": [
        {
          "type": "delivery.range-projectile",
          "speed": 50,
          "radius": 104
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "projectile.presentation",
          "kind": "range-projectile",
          "style": {
            "fillAlpha": 0.2,
            "strokeAlpha": 0.92,
            "strokeWidth": 3,
            "innerScale": 0.55,
            "innerAlpha": 0.45,
            "innerStrokeWidth": 2,
            "afterimage": {
              "duration": 240,
              "interval": 40,
              "alpha": 0.18
            }
          }
        },
        {
          "type": "status.apply",
          "status": "burn",
          "duration": 2000,
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
        "평타"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "gahoWeapon": {
      "id": "attack.reika.gaho-weapon",
      "damageRatio": 0,
      "cost": 400,
      "cd": 750,
      "range": 500,
      "modules": [
        {
          "type": "effect.spawn",
          "renderType": "areaCircle",
          "range": 58,
          "r": 58,
          "color": "56,189,248",
          "fillAlpha": 0.025,
          "strokeAlpha": 0.72,
          "lineWidth": 2,
          "duration": 220,
          "followSource": true
        },
        {
          "type": "delivery.projectile",
          "speed": 36,
          "delay": 220,
          "targetPointTravelDuration": 100,
          "radius": 16,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "targetPointResolve": "nearest-open",
          "targetPointClearance": 4,
          "targetPreview": {
            "shape": "circle",
            "range": {
              "$ref": "attacks.gahoSlam.range"
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
            "attack.reika.gaho-slam"
          ],
          "sourceRelocate": {
            "stateKey": "movement:reika-airborne",
            "delay": 50,
            "duration": 140,
            "tags": [
              "이동기",
              "선딜레이"
            ],
            "collision": {
              "passWalls": true,
              "passEnemies": true
            },
            "resolveOverlapOnEnd": true,
            "presentation": {
              "type": "dash-line",
              "color": "56,189,248",
              "width": 8,
              "alpha": 0.48,
              "duration": {
                "$ref": "attacks.gahoWeapon.modules.3.sourceRelocate.duration"
              }
            },
            "onEndAttackIds": [
              "attack.reika.gaho-land"
            ],
            "replaceActive": true,
            "blocksAction": true,
            "trajectory": {
              "type": "trajectory.arc",
              "height": 0,
              "startHeight": 90,
              "screenLiftRatio": 0.7
            },
            "buffs": [
              {
                "type": "evasionInvulnerable",
                "value": 1,
                "duration": "movement"
              }
            ]
          }
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 20,
            "fillAlpha": 0.3,
            "pulseMin": 0.74,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeWidth": 3,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 11,
            "showLink": false
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "reika-sword-rotation",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "movement.move",
          "when": "after-attack",
          "stateKey": "movement:reika-airborne",
          "distance": 0,
          "duration": 510,
          "replaceActive": true,
          "blocksAction": true,
          "presentation": false,
          "trajectory": {
            "type": "trajectory.arc",
            "height": 90,
            "apexHold": 0.8,
            "screenLiftRatio": 0.7
          },
          "collision": {
            "passWalls": true,
            "passEnemies": true
          },
          "buffs": [
            {
              "type": "evasionInvulnerable",
              "value": 1,
              "duration": "movement"
            }
          ]
        },
        {
          "type": "mode.set",
          "when": "after-attack",
          "stateKey": "reika-mode",
          "value": "blessed",
          "initial": "normal"
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "gahoSlam": {
      "id": "attack.reika.gaho-slam",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.gahoSlam.range"
          },
          "wallPolicy": "ignore",
          "color": "56,189,248",
          "renderType": "areaCircle"
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "gahoLand": {
      "id": "attack.reika.gaho-land",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": {
        "$ref": "attacks.gahoSlam.range"
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.gahoLand.range"
          },
          "wallPolicy": "ignore",
          "color": "56,189,248",
          "renderType": "areaCircle"
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 20,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "mode.set",
          "when": "after-delivery",
          "stateKey": "reika-mode",
          "value": "blessed",
          "initial": "normal"
        }
      ],
      "tags": [
        "스킬"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "counter": {
      "id": "attack.reika.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 300,
      "range": 300,
      "previewGeometry": {
        "shape": "rect",
        "range": {
          "$ref": "attacks.counter.range"
        },
        "halfWidth": 44,
        "wallPolicy": "ignore"
      },
      "modules": [
        {
          "type": "movement.move",
          "speedMultiplier": 1.35,
          "tags": [
            "이동기"
          ],
          "distance": {
            "$ref": "attacks.counter.range"
          },
          "duration": 220,
          "control": "fixed",
          "collision": {
            "passWalls": true,
            "passEnemies": false
          },
          "presentation": {
            "type": "dash-line",
            "color": "255,122,0",
            "width": 12,
            "alpha": 0.65,
            "duration": 250,
            "colorVariants": [
              {
                "color": "56,189,248",
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "reika-mode",
                    "value": "blessed",
                    "initial": "normal"
                  }
                ]
              }
            ],
            "trail": true
          },
          "onEndAttackIds": [
            "attack.reika.counter-spin"
          ]
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    },
    "counterSpin": {
      "id": "attack.reika.counter-spin",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": 130,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.counterSpin.range"
          },
          "wallPolicy": "block",
          "render": false
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "effect.spawn",
          "renderType": "annularDoubleSweep",
          "position": "source",
          "r": {
            "$ref": "attacks.counterSpin.range"
          },
          "inner": 0,
          "span": 6.283185307179586,
          "sweepCount": 1,
          "sweepDirection": "clockwise",
          "startAngleOffset": 3.141592653589793,
          "sweepFraction": 0.75,
          "fadePower": 1.35,
          "hitColor": "255,122,0",
          "fillAlpha": 0.2,
          "strokeAlpha": 0.88,
          "lineWidth": 2.5,
          "edgeLine": false,
          "duration": 300,
          "animation": true,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true,
          "scaleWithAttackRange": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "reika-sword-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "colorVariants": [
          {
            "color": "56,189,248",
            "conditions": [
              {
                "type": "state.mode-is",
                "stateKey": "reika-mode",
                "value": "blessed",
                "initial": "normal"
              }
            ]
          }
        ]
      }
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.reika.lmb",
      "input": "lmb",
      "attackId": "attack.reika.lmb",
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
            "alternateWhen": {
              "attackId": "attack.reika.lmb-blessed",
              "conditions": [
                {
                  "type": "state.mode-is",
                  "stateKey": "reika-mode",
                  "value": "blessed",
                  "initial": "normal"
                }
              ]
            }
          },
          {
            "type": "action.trigger-attack",
            "attackId": "attack.reika.lmb-wave",
            "requireExecuted": true,
            "requireAttackId": "attack.reika.lmb-blessed"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.reika.rmb",
      "input": "rmb",
      "attackId": "attack.reika.gaho-weapon",
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
          {"type": "state.progress-gte", "stateKey": "reika-gaho", "value": 100},
          {"type": "state.mode-is", "stateKey": "reika-mode", "value": "normal", "initial": "normal"}
        ],
        "modules": [
          {
            "type": "preview.create",
            "shape": "attack-shape",
            "attackId": "attack.reika.gaho-weapon",
            "duration": 320,
            "requireResource": true
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.reika.counter",
      "input": "counter",
      "attackId": "attack.reika.counter",
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
              "direction": "attack-direction",
              "distance": 84,
              "speed": 10,
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
    }
  }
}
