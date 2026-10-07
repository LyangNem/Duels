{
  "id": "gae",
  "name": "가에",
  "englishName": "Gae",
  "title": "전투용 안드로이드",
  "color": "#7f8992",
  "classification": {
    "style": 7,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1300,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 4
  },
  "desc": "명령어로 전투 기능을 활성화하며 전투하는 캐릭터",
  "worldGaugeModules": [
    {
      "type": "gauge.segmented",
      "valueRef": {
        "type": "mode-match-count",
        "modes": [
          {
            "stateKey": "command:accelerate",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:laser-dual",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:laser-pierce",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:laser-instant",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:laser-wide",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:laser-range",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:knockback",
            "value": "active",
            "initial": "inactive"
          },
          {
            "stateKey": "command:electric",
            "value": "active",
            "initial": "inactive"
          }
        ]
      },
      "color": "#aeb8c0",
      "valueMode": "count",
      "height": 4,
      "gap": 2,
      "background": "rgba(10,18,22,0.92)",
      "stroke": "rgba(174,184,192,0.4)",
      "segments": [
        {
          "value": 1,
          "color": "#aeb8c0"
        },
        {
          "value": 2,
          "color": "#aeb8c0"
        },
        {
          "value": 3,
          "color": "#aeb8c0"
        },
        {
          "value": 4,
          "color": "#aeb8c0"
        },
        {
          "value": 5,
          "color": "#aeb8c0"
        },
        {
          "value": 6,
          "color": "#aeb8c0"
        },
        {
          "value": 7,
          "color": "#aeb8c0"
        },
        {
          "value": 8,
          "color": "#aeb8c0"
        }
      ]
    }
  ],
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "말살 레이저",
      "attack": "laser",
      "text": "기본 활성화된 레이저 발사 ({damage})"
    },
    {
      "key": "RMB",
      "name": "방전",
      "attack": "rmb",
      "text": "0.5초 선딜 후 주변 적에게 피해 및 강한 넉백, 1초 방전 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "급속 냉각",
      "attack": "counter",
      "showCost": false,
      "text": "주변에 피해를 주고 2초간 무적 및 기절 ({damage})"
    },
    {
      "key": "/",
      "name": "기능 활성화",
      "text": "알맞은 명령어 입력 완료 시 자동 실행하고 입력창 닫기"
    },
    {
      "key": "/",
      "name": "/knockback",
      "text": "평타 적중 시 강한 넉백"
    },
    {
      "key": "/",
      "name": "/accelerate",
      "text": "평타 연사속도 40% 증가"
    },
    {
      "key": "/",
      "name": "/fix",
      "text": "잃은 체력의 {v:commandFeatures.fixMissingHealthRatio|percent}% 회복"
    },
    {
      "key": "/",
      "name": "/electric",
      "text": "평타 적중 시 1초 감전, 레이저가 고정 주황색으로 발사"
    },
    {
      "key": "/",
      "name": "/dual",
      "text": "레이저 {v:commandFeatures.laser.dualCount}갈래 평행 발사"
    },
    {
      "key": "/",
      "name": "/pierce",
      "text": "레이저가 적을 관통"
    },
    {
      "key": "/",
      "name": "/instant",
      "text": "레이저 탄속 제거"
    },
    {
      "key": "/",
      "name": "/wide",
      "text": "레이저 폭 {v:commandFeatures.laser.wideMultiplier}배"
    },
    {
      "key": "/",
      "name": "/range",
      "text": "레이저 사거리 +{v:commandFeatures.laser.rangeBonus}"
    }
  ],
  "attacks": {
    "laser": {
      "id": "attack.gae.laser",
      "damageRatio": 1,
      "cost": 150,
      "cd": 600,
      "range": 400,
      "attackFeatureTransform": {
        "type": "modular-laser",
        "statePrefix": "command:",
        "features": {
          "base": "laser",
          "dual": "laser-dual",
          "pierce": "laser-pierce",
          "instant": "laser-instant",
          "wide": "laser-wide",
          "range": "laser-range",
          "knockback": "knockback",
          "electric": "electric",
          "accelerate": "accelerate"
        },
        "configPath": "commandFeatures.laser",
        "effectPath": "commandFeatures.laserEffect",
        "wideMultiplier": {
          "$ref": "commandFeatures.laser.wideMultiplier"
        },
        "rangeMultiplier": {
          "$ref": "commandFeatures.laser.rangeMultiplier"
        },
        "rangeBonus": {
          "$ref": "commandFeatures.laser.rangeBonus"
        },
        "initialFeatures": [
          "laser"
        ],
        "hitFeatureModules": {
          "knockback": [
            {
              "type": "movement.knockback",
              "target": "hit-target",
              "direction": "away-from-source",
              "distance": 160,
              "speed": 12,
              "oncePerExecution": true
            }
          ],
          "electric": [
            {
              "type": "status.apply",
              "status": "zap",
              "duration": 1000
            }
          ]
        },
        "attackRateIncrease": 0.4,
        "electricColor": "255,145,35"
      },
      "presentation": {
        "color": "#aeb8c0"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": {
            "$ref": "commandFeatures.laser.speed"
          },
          "radius": {
            "$ref": "commandFeatures.laser.radius"
          },
          "hitRadius": {
            "$ref": "commandFeatures.laser.hitRadius"
          }
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.presentation",
          "kind": "projectile-style",
          "style": {
            "type": "laser-bolt",
            "baseRadius": {
              "$ref": "attacks.laser.modules.0.radius"
            },
            "outerColor": "122,134,144",
            "midColor": "190,202,210",
            "coreColor": "225,233,238",
            "centerColor": "255,255,255"
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "counter": {
      "id": "attack.gae.counter",
      "damageRatio": 1,
      "cost": 0,
      "cd": 520,
      "range": 180,
      "presentation": {
        "color": "#aeb8c0"
      },
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
          "renderType": "areaCircle",
          "position": "source",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "r": {
            "$ref": "attacks.counter.range"
          },
          "color": "174,184,192",
          "fillAlpha": 0.09,
          "strokeAlpha": 0.9,
          "lineWidth": 2.5,
          "durationFrames": 14
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "rmb": {
      "id": "attack.gae.rmb",
      "damageRatio": 1,
      "cost": 200,
      "cd": 700,
      "range": 190,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": 190,
          "wallPolicy": "block"
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-source",
          "distance": 160,
          "speed": 12,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "discharge",
          "duration": 1000
        }
      ],
      "tags": [
        "스킬"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.gae.lmb",
      "input": "lmb",
      "attackId": "attack.gae.laser",
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
            "type": "state.mode-is",
            "stateKey": "command:laser",
            "value": "active",
            "initial": "active"
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
      "id": "ability.gae.rmb",
      "input": "rmb",
      "attackId": "attack.gae.rmb",
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
            "type": "preview.create",
            "shape": "attack-shape",
            "duration": 500,
            "followSource": true
          },
          {
            "type": "timing.delay",
            "duration": 500
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.gae.counter",
      "input": "counter",
      "attackId": "attack.gae.counter",
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
              "direction": "away-from-source",
              "distance": 84,
              "speed": 10,
              "oncePerExecution": true
            },
            "onFinishModules": [
              {
                "type": "status.apply",
                "status": "stun",
                "duration": 2000,
                "sourceId": "gae:counter-lock"
              }
            ],
            "selfModifiers": [
              {
                "stat": "invulnerable",
                "value": 1,
                "duration": 2000,
                "sourceId": "gae:counter-protection",
                "presentation": {
                  "opacity": 0.45
                }
              }
            ]
          }
        ]
      }
    }
  },
  "commandFeatures": {
    "fixMissingHealthRatio": 0.25,
    "fixGlowDuration": 1000,
    "laser": {
      "speed": 30,
      "radius": 8,
      "hitRadius": 10,
      "instantHalfWidth": {
        "$ref": "commandFeatures.laser.radius"
      },
      "dualCount": 2,
      "dualOffset": 14,
      "rangeMultiplier": 1.35,
      "rangeBonus": 150,
      "wideMultiplier": 1.75
    },
    "laserEffect": {
      "color": "190,202,210",
      "coreColor": "255,255,255",
      "fillAlpha": 0.34,
      "strokeAlpha": 0.9,
      "coreAlpha": 0.82,
      "coreWidthRatio": 0.16,
      "lineWidth": 3,
      "glowBlur": 9,
      "durationFrames": 6
    },
    "input": {
      "maxLength": 80,
      "resultHoldMs": 2000,
      "resultFadeMs": 450
    }
  }
}
