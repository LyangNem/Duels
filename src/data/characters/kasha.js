{
  "id": "kasha",
  "name": "카샤",
  "englishName": "Kasha",
  "title": "심판의 집행자",
  "color": "#FFFF7D",
  "classification": {
    "style": 6,
    "range": 2,
    "role": 1
  },
  "stats": {
    "maxHealth": 1300,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 4
  },
  "desc": "회피의 대가를 심판의 무게로 쌓아 거대한 집행검으로 응징하는 캐릭터",
  "passives": [
    {
      "type": "state.progress-rate",
      "stateKey": "kasha-judgment",
      "max": 10,
      "initial": 0,
      "ratePerSecond": 0,
      "presentation": {
        "type": "segmented-gauge",
        "height": 4,
        "gap": 2,
        "valueMode": "count",
        "activeAlpha": 0.95,
        "background": "rgba(10,18,22,0.92)",
        "stroke": "#FFFF7D",
        "segments": [
          {
            "value": 1,
            "color": "#FFFF7D"
          },
          {
            "value": 2,
            "color": "#FFFF7D"
          },
          {
            "value": 3,
            "color": "#FFFF7D"
          },
          {
            "value": 4,
            "color": "#FFFF7D"
          },
          {
            "value": 5,
            "color": "#FFFF7D"
          },
          {
            "value": 6,
            "color": "#FFFF7D"
          },
          {
            "value": 7,
            "color": "#FFFF7D"
          },
          {
            "value": 8,
            "color": "#FFFF7D"
          },
          {
            "value": 9,
            "color": "#FFFF7D"
          },
          {
            "value": 10,
            "color": "#FFFF7D"
          }
        ]
      }
    }
  ],
  "triggers": [
    {
      "id": "kasha-enemy-dodge",
      "type": "trigger",
      "event": "enemy-just-dodge",
      "modules": [
        {
          "type": "effect.spawn",
          "attackId": "attack.kasha.judgment-reward",
          "renderType": "areaCircle",
          "position": "hit-target",
          "target": "source",
          "travelToken": true,
          "tokenStyle": "light",
          "followSource": false,
          "color": "#FFFF7D",
          "duration": 333,
          "fadeOut": false
        },
        {
          "type": "state.progress",
          "stateKey": "kasha-judgment",
          "operation": "add",
          "amount": 1,
          "max": 10,
          "presentation": {
            "type": "segmented-gauge",
            "height": 4,
            "gap": 2,
            "valueMode": "count",
            "activeAlpha": 0.95,
            "background": "rgba(10,18,22,0.92)",
            "stroke": "#FFFF7D",
            "segments": [
              {
                "value": 1,
                "color": "#FFFF7D"
              },
              {
                "value": 2,
                "color": "#FFFF7D"
              },
              {
                "value": 3,
                "color": "#FFFF7D"
              },
              {
                "value": 4,
                "color": "#FFFF7D"
              },
              {
                "value": 5,
                "color": "#FFFF7D"
              },
              {
                "value": 6,
                "color": "#FFFF7D"
              },
              {
                "value": 7,
                "color": "#FFFF7D"
              },
              {
                "value": 8,
                "color": "#FFFF7D"
              },
              {
                "value": 9,
                "color": "#FFFF7D"
              },
              {
                "value": 10,
                "color": "#FFFF7D"
              }
            ]
          },
          "delay": 333
        }
      ],
      "conditions": [
        {
          "type": "cause.source-is-self"
        }
      ]
    },
    {
      "id": "kasha-own-dodge",
      "type": "trigger",
      "event": "just-dodge",
      "modules": [
        {
          "type": "effect.spawn",
          "attackId": "attack.kasha.judgment-reward",
          "renderType": "areaCircle",
          "position": "source",
          "target": "source",
          "travelToken": true,
          "tokenStyle": "light",
          "followSource": true,
          "color": "#FFFF7D",
          "duration": 333,
          "fadeOut": false
        },
        {
          "type": "state.progress",
          "stateKey": "kasha-judgment",
          "operation": "add",
          "amount": 1,
          "max": 10,
          "presentation": {
            "type": "segmented-gauge",
            "height": 4,
            "gap": 2,
            "valueMode": "count",
            "activeAlpha": 0.95,
            "background": "rgba(10,18,22,0.92)",
            "stroke": "#FFFF7D",
            "segments": [
              {
                "value": 1,
                "color": "#FFFF7D"
              },
              {
                "value": 2,
                "color": "#FFFF7D"
              },
              {
                "value": 3,
                "color": "#FFFF7D"
              },
              {
                "value": 4,
                "color": "#FFFF7D"
              },
              {
                "value": 5,
                "color": "#FFFF7D"
              },
              {
                "value": 6,
                "color": "#FFFF7D"
              },
              {
                "value": 7,
                "color": "#FFFF7D"
              },
              {
                "value": 8,
                "color": "#FFFF7D"
              },
              {
                "value": 9,
                "color": "#FFFF7D"
              },
              {
                "value": 10,
                "color": "#FFFF7D"
              }
            ]
          },
          "delay": 333
        }
      ]
    }
  ],
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "심판의 저울",
      "showCost": false,
      "text": "상대가 자신의 공격을 저스트 회피하거나 자신이 공격을 저스트 회피하면 빛을 획득하여 심판의 무게 1 추가. 최대 {v:passives.0.max}"
    },
    {
      "key": "LMB",
      "name": "집행검",
      "attack": "lmb",
      "text": "정의의 의지로 만든 검을 휘둘러 피해 ({damage})"
    },
    {
      "key": "RMB",
      "name": "죄의 무게",
      "attack": "rmb",
      "text": "0.7초 준비 후 심판의 무게를 모두 소모하여 전방 220도를 베어 무게당 적 최대 체력의 8% 피해 및 매우 강한 넉백. 준비와 공격 중 속박"
    },
    {
      "key": "L-Shift",
      "name": "삼중 집행",
      "attack": "counter",
      "text": "마지막 이동 방향의 뒤편에 집행검 3자루를 소환하여 지정 지점으로 순차 투척. 착탄 지점에 피해 (타당 {linkedDamage})",
      "linkedAttack": "counterImpact"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.kasha.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 500,
      "range": 275,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.2,
          "wallPolicy": "block",
          "contactType": "melee"
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "arcSweep",
          "position": "source",
          "range": {
            "$ref": "attacks.lmb.range"
          },
          "halfAngle": 1.2,
          "animateSweep": true,
          "sweepDirection": "counterclockwise",
          "sweepSpeed": 1.7,
          "animation": true,
          "color": "#FFFF7D",
          "fillAlpha": 0.18,
          "strokeAlpha": 0.9,
          "duration": 300,
          "clipToAttackArea": true,
          "replaceAutoAreaEffect": true
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "kasha-sword-spin",
          "values": [
            "a",
            "b"
          ],
          "step": 1
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.kasha.rmb",
      "damageRatio": 0,
      "cost": 600,
      "cd": 1800,
      "range": 900,
      "previewGeometry": {
        "type": "delivery.area",
        "shape": "sector",
        "range": 900,
        "halfAngle": 1.9198621771937625,
        "wallPolicy": "ignore",
        "contactType": "melee"
      },
      "progressScale": {
        "stateKey": "kasha-judgment",
        "valueRange": {
          "from": 0,
          "to": 10
        },
        "moduleValues": [
          {
            "type": "damage.target-max-health-ratio",
            "property": "ratio",
            "from": 0,
            "to": 0.8
          }
        ]
      },
      "modules": [
        {
          "type": "damage.target-max-health-ratio",
          "ratio": 0
        },
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "arcSweep",
          "position": "source",
          "range": {
            "$ref": "attacks.rmb.range"
          },
          "halfAngle": 1.9198621771937625,
          "animateSweep": true,
          "sweepDirection": "counterclockwise",
          "sweepSpeed": 1,
          "animation": true,
          "color": "#FF4646",
          "fillAlpha": 0.16,
          "strokeAlpha": 0.9,
          "lineWidth": 3,
          "duration": 400,
          "clipToAttackArea": false,
          "replaceAutoAreaEffect": true,
          "edgeLine": false,
          "damage": {
            "attackId": "attack.kasha.rmb",
            "hitMode": "arc-sweep",
            "module": {
              "type": "delivery.area",
              "shape": "sector",
              "range": 900,
              "halfAngle": 1.9198621771937625,
              "wallPolicy": "ignore",
              "contactType": "melee"
            },
            "oncePerExecution": true,
            "snapshotAttackScalars": true
          }
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "kasha-swing",
          "duration": 400
        },
        {
          "type": "state.progress",
          "when": "after-attack",
          "stateKey": "kasha-judgment",
          "operation": "reset"
        },
        {
          "type": "mode.toggle",
          "when": "after-attack",
          "stateKey": "kasha-sword-spin",
          "values": [
            "a",
            "b"
          ],
          "step": 1
        },
        {
          "type": "movement.knockback",
          "when": "on-hit",
          "target": "hit-target",
          "direction": "attack",
          "distance": 350,
          "speed": 22
        }
      ],
      "tags": [
        "스킬",
        "선딜레이"
      ],
      "previewStyle": {
        "strokeColor": "255,70,70",
        "fillColor": "255,55,55",
        "strokeAlpha": 0.95,
        "fillAlpha": 0.13
      }
    },
    "counter": {
      "id": "attack.kasha.counter",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 850,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 25,
          "radius": 18,
          "targetPoint": true,
          "targetPointClampToAttackRange": true,
          "targetPointResolve": "nearest-open",
          "damageOnTravel": false,
          "collisionTargets": false,
          "arrival": {
            "passWallsInFlight": true
          },
          "collisionMode": "landing-only"
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 18,
            "fillAlpha": 0.28,
            "strokeWidth": 2,
            "showLink": false
          }
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 3,
          "interval": 180,
          "aimMode": "live-target-point",
          "originOffsets": [
            {
              "forward": -95,
              "lateral": -70
            },
            {
              "forward": -130,
              "lateral": 0
            },
            {
              "forward": -95,
              "lateral": 70
            }
          ],
          "originOrientation": "last-movement"
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "kasha-counter-1",
          "duration": 180
        },
        {
          "type": "state.window",
          "when": "after-attack",
          "stateKey": "kasha-counter-2",
          "duration": 360
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.impact",
          "reasons": [
            "arrival",
            "target-point",
            "range",
            "boundary",
            "wall"
          ],
          "attackIds": [
            "attack.kasha.counter-impact"
          ],
          "oncePerProjectile": true
        },
        {
          "type": "mode.toggle",
          "when": "on-projectile-shot",
          "stateKey": "kasha-sword-spin",
          "values": [
            "a",
            "b"
          ],
          "step": 1
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "rmbPreview": {
      "id": "attack.kasha.rmbPreview",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 900,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 900,
          "halfAngle": 1.9198621771937625,
          "wallPolicy": "ignore",
          "contactType": "melee"
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counterImpact": {
      "id": "attack.kasha.counter-impact",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 100,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 100,
          "wallPolicy": "block"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distance": 100,
          "speed": 14
        }
      ],
      "tags": [
        "반격"
      ],
      "presentation": {
        "damageNumberGroup": "execution"
      }
    },
    "judgmentReward": {
      "id": "attack.kasha.judgment-reward",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [],
      "tags": []
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.kasha.lmb",
      "input": "lmb",
      "attackId": "attack.kasha.lmb",
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
      "id": "ability.kasha.rmb",
      "input": "rmb",
      "attackId": "attack.kasha.rmb",
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
              "attack.kasha.rmb"
            ]
          },
          {
            "type": "resource.can-spend-stamina",
            "value": {
              "$ref": "attacks.rmb.cost"
            }
          },
          {
            "type": "state.absent",
            "stateKey": "kasha-swing",
            "activeOnly": true
          },
          {
            "type": "state.progress-gte",
            "stateKey": "kasha-judgment",
            "value": 1
          }
        ],
        "modules": [
          {
            "type": "state.window",
            "stateKey": "kasha-preparing",
            "duration": 700
          },
          {
            "type": "status.apply",
            "status": "bind",
            "target": "source",
            "duration": 1100,
            "sourceId": "ability:kasha:judgment-root"
          },
          {
            "type": "preview.create",
            "shape": "attack-shape",
            "duration": 700,
            "followSource": true
          },
          {
            "type": "effect.spawn",
            "presentationOnly": true,
            "renderType": "arcSweep",
            "position": "source",
            "range": 900,
            "halfAngle": 1.9198621771937625,
            "sweepDirection": "counterclockwise",
            "animateSweep": false,
            "duration": 700,
            "color": "#FF4646",
            "fillAlpha": 0.035,
            "strokeAlpha": 0.65,
            "lineWidth": 2,
            "clipToAttackArea": false,
            "followSource": true,
            "angleMode": "aim"
          },
          {
            "type": "timing.delay",
            "duration": 700
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.kasha.counter",
      "input": "counter",
      "attackId": "attack.kasha.counter",
      "inputPolicy": {
        "repeatWhileHeld": false
      },
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
                "range": 100,
                "wallPolicy": "block"
              }
            },
            "ccRefAttackId": "attack.kasha.counter-impact"
          }
        ]
      }
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "execution-sword",
      "scale": 1.8,
      "angle": 0.7,
      "rotationStateKey": "kasha-sword-spin",
      "rotationMs": 350,
      "rotationRadians": -6.283185307179586
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponProjectile",
      "x": -95,
      "y": -70,
      "conditions": [
        {
          "type": "condition.any",
          "conditions": [
            {
              "type": "source.property.truthy",
              "property": "counterWindup"
            }
          ]
        }
      ],
      "offsetOrientation": "last-movement",
      "attackId": "attack.kasha.counter"
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponProjectile",
      "x": -130,
      "y": 0,
      "conditions": [
        {
          "type": "condition.any",
          "conditions": [
            {
              "type": "source.property.truthy",
              "property": "counterWindup"
            },
            {
              "type": "state.exists",
              "stateKey": "kasha-counter-1",
              "activeOnly": true
            }
          ]
        }
      ],
      "offsetOrientation": "last-movement",
      "attackId": "attack.kasha.counter"
    },
    {
      "type": "effect.spawn",
      "renderType": "weaponProjectile",
      "x": -95,
      "y": 70,
      "conditions": [
        {
          "type": "condition.any",
          "conditions": [
            {
              "type": "source.property.truthy",
              "property": "counterWindup"
            },
            {
              "type": "state.exists",
              "stateKey": "kasha-counter-2",
              "activeOnly": true
            }
          ]
        }
      ],
      "offsetOrientation": "last-movement",
      "attackId": "attack.kasha.counter"
    }
  ],
  "selectable": false
}
