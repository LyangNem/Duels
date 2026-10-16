{
  "id": "intu",
  "name": "인투",
  "englishName": "Intu",
  "title": "웨폰 마스터",
  "color": "#a18a8a",
  "classification": {
    "style": 6,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1100,
    "speed": 4.25,
    "radius": 20,
    "baseDamage": 200,
    "difficulty": 5
  },
  "desc": "권총·산탄총·저격총을 상황에 맞게 사용하는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.arc",
      "valueRef": {
        "type": "timed-action-progress",
        "stateKey": "intu-reload"
      },
      "color": "#a18a8a",
      "background": "rgba(45,35,10,0.72)",
      "lineWidth": 3,
      "maxChargeFlash": true,
      "visibility": "owner"
    },
    {
      "type": "gauge.segmented",
      "valueMode": "count",
      "valueRef": {
        "type": "progress",
        "stateKey": "intu-ammo",
        "initial": 12
      },
      "height": 4,
      "gap": 2,
      "activeAlpha": 0.95,
      "background": "rgba(10,18,22,0.92)",
      "stroke": "rgba(161,138,138,0.40)",
      "colorVariants": [
        {
          "color": "#ffd97a",
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "intu-reload",
              "activeOnly": true
            }
          ]
        }
      ],
      "segments": [
        {
          "value": 1,
          "color": "#a18a8a"
        },
        {
          "value": 2,
          "color": "#a18a8a"
        },
        {
          "value": 3,
          "color": "#a18a8a"
        },
        {
          "value": 4,
          "color": "#a18a8a"
        },
        {
          "value": 5,
          "color": "#a18a8a"
        },
        {
          "value": 6,
          "color": "#a18a8a"
        },
        {
          "value": 7,
          "color": "#a18a8a"
        },
        {
          "value": 8,
          "color": "#a18a8a"
        },
        {
          "value": 9,
          "color": "#a18a8a"
        },
        {
          "value": 10,
          "color": "#a18a8a"
        },
        {
          "value": 11,
          "color": "#a18a8a"
        },
        {
          "value": 12,
          "color": "#a18a8a"
        }
      ],
      "highlightCountRef": {
        "type": "progress",
        "stateKey": "intu-sniper",
        "initial": 0
      },
      "highlightColor": "#9bdcff",
      "highlightFrom": "right"
    }
  ],
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "pistol",
      "angle": -0.6,
      "color": "#a18a8a",
      "conditions": [
        {
          "type": "state.progress-empty",
          "stateKey": "intu-sniper",
          "initial": 0
        },
        {
          "type": "state.mode-is",
          "stateKey": "intu-weapon",
          "value": "pistol",
          "initial": "pistol"
        }
      ],
      "alphaVariants": [
        {
          "alpha": 0.28,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "intu-reload",
              "activeOnly": true
            }
          ]
        }
      ],
      "y": 0,
      "motionStateKey": "intu-gun-rotation",
      "motionMs": 420,
      "motion": {
        "rotation": -0.48,
        "travelX": -0.65,
        "travelY": 0.2
      },
      "x": 0
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "rotationStateKey": "intu-gun-rotation",
      "rotationMs": 300,
      "style": "shotgun",
      "angle": -0.6,
      "color": "#a18a8a",
      "conditions": [
        {
          "type": "state.progress-empty",
          "stateKey": "intu-sniper",
          "initial": 0
        },
        {
          "type": "state.mode-is",
          "stateKey": "intu-weapon",
          "value": "shotgun",
          "initial": "pistol"
        }
      ],
      "rotationRadians": -6.283185307179586,
      "alphaVariants": [
        {
          "alpha": 0.28,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "intu-reload",
              "activeOnly": true
            }
          ]
        }
      ],
      "y": 0,
      "x": 0
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "rotationStateKey": "intu-gun-rotation",
      "rotationMs": 300,
      "style": "sniper",
      "angle": -0.6,
      "color": "#9bdcff",
      "conditions": [
        {
          "type": "state.progress-gte",
          "stateKey": "intu-sniper",
          "initial": 0,
          "value": 1
        }
      ],
      "rotationRadians": -6.283185307179586,
      "alphaVariants": [
        {
          "alpha": 0.28,
          "conditions": [
            {
              "type": "state.exists",
              "stateKey": "intu-reload",
              "activeOnly": true
            }
          ]
        }
      ],
      "y": 0,
      "x": 0
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB PISTOL",
      "name": "권총 사격",
      "attack": "pistol",
      "text": "권총 발사. ({damage})"
    },
    {
      "key": "LMB SHOTGUN",
      "name": "산탄총 사격",
      "attack": "shotgun",
      "text": "산탄총 {pellets}발 발사. (탄당 {damage})"
    },
    {
      "key": "LMB SNIPER",
      "name": "저격총 사격",
      "attack": "sniper",
      "text": "적과 벽을 관통하는 저격탄 발사 ({damage})"
    },
    {
      "key": "RMB",
      "name": "무기 전환",
      "attack": "shotgunSwap",
      "text": "권총 또는 산탄총으로 전환하며 즉시 발사. 탄창 소진 시 자동 재장전"
    },
    {
      "key": "L-Shift",
      "name": "저격총 전환",
      "attack": "sniperCounter",
      "text": "저격 탄환 4발 추가. 변환 탄환을 모두 사용하면 이전 총으로 복귀 ({damage})"
    }
  ],
  "attacks": {
    "reloadComplete": {
      "id": "attack.intu.reload-complete",
      "passiveCompletion": true,
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "set-max",
          "initial": 12,
          "max": 12,
          "blocksStaminaRegen": false
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "pistol": {
      "id": "attack.intu.pistol",
      "damageRatio": 1,
      "cost": 150,
      "cd": 250,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 250,
      "range": 650,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 10
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 1,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
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
    "shotgun": {
      "id": "attack.intu.shotgun",
      "damageRatio": 0.5,
      "cost": 300,
      "cd": 350,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 350,
      "range": 600,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 40,
          "radius": 8
        },
        {
          "type": "pattern.scatter",
          "count": 4,
          "spread": 0.35
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 4,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
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
    "pistolSwap": {
      "id": "attack.intu.pistol-swap",
      "damageRatio": 1,
      "cost": 150,
      "cd": 300,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 250,
      "range": 650,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 10
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 1,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬",
        "평타"
      ]
    },
    "shotgunSwap": {
      "id": "attack.intu.shotgun-swap",
      "damageRatio": 0.5,
      "cost": 300,
      "cd": 300,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 350,
      "range": 600,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 40,
          "radius": 8
        },
        {
          "type": "pattern.scatter",
          "count": 4,
          "spread": 0.35
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 4,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬",
        "평타"
      ]
    },
    "pistolReturn": {
      "id": "attack.intu.pistol-return",
      "damageRatio": 1,
      "cost": 150,
      "cd": 300,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 250,
      "range": 650,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 10
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 1,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬",
        "평타"
      ]
    },
    "shotgunReturn": {
      "id": "attack.intu.shotgun-return",
      "damageRatio": 0.5,
      "cost": 300,
      "cd": 300,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 350,
      "range": 600,
      "presentation": {
        "color": "#a18a8a"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 40,
          "radius": 8
        },
        {
          "type": "pattern.scatter",
          "count": 4,
          "spread": 0.35
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 4,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬",
        "평타"
      ]
    },
    "sniper": {
      "id": "attack.intu.sniper",
      "damageRatio": 3.25,
      "cost": 0,
      "cd": 600,
      "attackDelayGroup": "intu-primary",
      "attackDelay": 600,
      "range": 1200,
      "presentation": {
        "color": "#9bdcff"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 59.28,
          "radius": 10.5
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 42,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-sniper",
          "operation": "subtract",
          "amount": 1,
          "initial": 0,
          "blocksStaminaRegen": false
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 1,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "sniperCounter": {
      "id": "attack.intu.sniper-counter",
      "damageRatio": 3.25,
      "cost": 0,
      "cd": 400,
      "range": 1200,
      "presentation": {
        "color": "#9bdcff"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 59.28,
          "radius": 10,
          "networkSpawnCompensation": false
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "intu-gun-rotation",
          "values": [
            "a",
            "b"
          ]
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-sniper",
          "operation": "add",
          "amount": 4,
          "initial": 0,
          "blocksStaminaRegen": false,
          "growMax": true
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-sniper",
          "operation": "subtract",
          "amount": 1,
          "initial": 0,
          "blocksStaminaRegen": false
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "intu-ammo",
          "operation": "subtract",
          "amount": 1,
          "initial": {
            "$ref": "attacks.reloadComplete.modules.0.initial"
          },
          "max": {
            "$ref": "attacks.reloadComplete.modules.0.max"
          },
          "blocksStaminaRegen": false
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "intu-reload",
          "duration": 1500,
          "retainCompleteMs": 500,
          "conditions": [
            {
              "type": "state.progress-empty",
              "stateKey": "intu-ammo",
              "initial": 12
            }
          ],
          "data": {
            "choice": "reload"
          },
          "resolveDataKey": "choice",
          "resolveAttackIds": {
            "reload": "attack.intu.reload-complete"
          }
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.intu.lmb",
      "input": "lmb",
      "attackId": "attack.intu.pistol",
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
            "stateKey": "intu-reload",
            "activeOnly": true
          },
          {
            "type": "state.progress-gte",
            "stateKey": "intu-ammo",
            "value": 1,
            "initial": 12
          }
        ],
        "modules": [
          {
            "type": "preview.create",
            "shape": "attack-shape",
            "attackId": "attack.intu.sniper",
            "duration": 300,
            "followSource": true,
            "aimMode": "live-source",
            "conditions": [
              {
                "type": "state.progress-gte",
                "stateKey": "intu-sniper",
                "initial": 0,
                "value": 1
              }
            ]
          },
          {
            "type": "timing.delay",
            "duration": 300,
            "aimMode": "live-source",
            "conditions": [
              {
                "type": "state.progress-gte",
                "stateKey": "intu-sniper",
                "initial": 0,
                "value": 1
              }
            ]
          },
          {
            "type": "preview.remove",
            "conditions": [
              {
                "type": "state.progress-gte",
                "stateKey": "intu-sniper",
                "initial": 0,
                "value": 1
              }
            ]
          },
          {
            "type": "action.attack",
            "alternates": [
              {
                "attackId": "attack.intu.sniper",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "intu-sniper",
                    "initial": 0,
                    "value": 1
                  }
                ]
              },
              {
                "attackId": "attack.intu.shotgun",
                "rangeAvailableInitially": true,
                "conditions": [
                  {
                    "type": "state.mode-is",
                    "stateKey": "intu-weapon",
                    "initial": "pistol",
                    "value": "shotgun"
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.intu.rmb",
      "input": "rmb",
      "attackId": "attack.intu.shotgun-swap",
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
            "type": "state.absent",
            "stateKey": "intu-reload",
            "activeOnly": true
          },
          {
            "type": "state.progress-gte",
            "stateKey": "intu-ammo",
            "value": 1,
            "initial": 12
          }
        ],
        "modules": [
          {
            "type": "action.attack",
            "alternates": [
              {
                "attackId": "attack.intu.pistol-return",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "intu-sniper",
                    "initial": 0,
                    "value": 1
                  },
                  {
                    "type": "state.mode-is",
                    "stateKey": "intu-weapon",
                    "initial": "pistol",
                    "value": "pistol"
                  }
                ]
              },
              {
                "attackId": "attack.intu.shotgun-return",
                "conditions": [
                  {
                    "type": "state.progress-gte",
                    "stateKey": "intu-sniper",
                    "initial": 0,
                    "value": 1
                  },
                  {
                    "type": "state.mode-is",
                    "stateKey": "intu-weapon",
                    "initial": "pistol",
                    "value": "shotgun"
                  }
                ]
              },
              {
                "attackId": "attack.intu.pistol-swap",
                "conditions": [
                  {
                    "type": "state.progress-empty",
                    "stateKey": "intu-sniper",
                    "initial": 0
                  },
                  {
                    "type": "state.mode-is",
                    "stateKey": "intu-weapon",
                    "initial": "pistol",
                    "value": "shotgun"
                  }
                ]
              }
            ]
          },
          {
            "type": "state.progress",
            "operation": "set",
            "stateKey": "intu-sniper",
            "requireExecuted": true,
            "conditions": [
              {
                "type": "state.progress-gte",
                "stateKey": "intu-sniper",
                "initial": 0,
                "value": 1
              }
            ],
            "value": 0,
            "initial": 0,
            "blocksStaminaRegen": false
          },
          {
            "type": "mode.set",
            "stateKey": "intu-weapon",
            "initial": "pistol",
            "value": "shotgun",
            "requireExecuted": true,
            "requireAttackId": "attack.intu.shotgun-swap"
          },
          {
            "type": "mode.set",
            "stateKey": "intu-weapon",
            "initial": "pistol",
            "value": "pistol",
            "requireExecuted": true,
            "requireAttackId": "attack.intu.pistol-swap"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.intu.counter",
      "input": "counter",
      "attackId": "attack.intu.sniper-counter",
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
          },
          {
            "type": "state.absent",
            "stateKey": "intu-reload",
            "activeOnly": true
          },
          {
            "type": "state.progress-gte",
            "stateKey": "intu-ammo",
            "value": 1,
            "initial": 12
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
              "targetRelations": [
                "enemy"
              ],
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
