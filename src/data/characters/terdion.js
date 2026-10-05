{
  "id": "terdion",
  "name": "테르디온",
  "englishName": "Terdion",
  "title": "노련한 발파원",
  "color": "#238f96",
  "classification": {
    "style": 3,
    "range": 4,
    "role": 5
  },
  "stats": {
    "maxHealth": 1500,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 3
  },
  "desc": "폭약을 지속적으로 투척하고 폭발과 넉백으로 전장을 제어하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "폭발 주의",
      "showCost": false,
      "text": "폭약은 벽 또는 적에게 적중 시 제자리에 착탄. 착탄 {v:attacks.lmbExplosion.modules.0.delay|seconds}초 뒤 폭발하며 중심에 가까울수록 피해와 넉백 증가"
    },
    {
      "key": "LMB",
      "name": "폭약 카트리지",
      "attack": "lmb",
      "linkedAttack": "lmbExplosion",
      "text": "폭약 카트리지 투척 ({damage}/{linkedDamage})"
    },
    {
      "key": "RMB",
      "name": "발파 폭약",
      "attack": "rmb",
      "linkedAttack": "rmbExplosion",
      "text": "지정 지점에 폭약 투척. 폭발은 벽에 막히며 폭발이나 폭약이 닿은 벽 파괴 ({damage}/{linkedDamage})"
    },
    {
      "key": "L-Shift",
      "name": "폭약밭",
      "attack": "counter",
      "linkedAttack": "counterExplosion",
      "text": "마우스 거리에 따라 최대 {v:attacks.counter.range}까지 주변 {v:attacks.counter.modules.3.count}방향으로 시계방향 순차 투척 ({damage}/{linkedDamage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.terdion.lmb",
      "damageRatio": 1.5,
      "cost": 200,
      "cd": 450,
      "range": 850,
      "presentation": {
        "color": "#238f96"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20.8,
          "radius": 14,
          "arrival": {
            "linger": {
              "atRange": true,
              "atTarget": true,
              "atWall": true,
              "duration": {
                "$ref": "attacks.lmbExplosion.modules.0.delay"
              },
              "fadeOut": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false,
              "snapToRangeEnd": true
            }
          }
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.terdion.lmb-landing",
            "attack.terdion.lmb-explosion"
          ],
          "oncePerProjectile": true,
          "cancelDelayedOnRemove": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.lmb.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false,
            "strokeColor": "#238f96",
            "innerColor": "#f5d9ab"
          }
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "lmbExplosion": {
      "id": "attack.terdion.lmb-explosion",
      "damageRatio": 3,
      "cost": 0,
      "cd": 0,
      "range": 120,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.lmbExplosion.range"
          },
          "delay": 500,
          "wallPolicy": "block",
          "color": "35,143,150",
          "renderType": "areaCircle"
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.3333333333333333,
          "multiplier": 0.6666666666666666
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.6666666666666666,
          "multiplier": 0.5
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distanceMode": "impact-proximity",
          "minDistance": 20,
          "maxDistance": 100,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "lmbLanding": {
      "id": "attack.terdion.lmb-landing",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "impact-point",
          "radius": {
            "$ref": "attacks.lmb.modules.0.radius"
          },
          "range": {
            "$ref": "attacks.lmb.modules.0.radius"
          },
          "duration": {
            "$ref": "attacks.lmbExplosion.modules.0.delay"
          },
          "fadeOut": false,
          "fillAlpha": 0,
          "strokeAlpha": 0,
          "lineWidth": 2,
          "color": "35,143,150",
          "visibility": "owner-team",
          "remainingArcGauge": true,
          "remainingArcOffset": 6,
          "remainingArcLineWidth": 3,
          "remainingArcAlpha": 0.95,
          "stateKey": "projectile-fuse"
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.terdion.rmb",
      "damageRatio": 2,
      "cost": 800,
      "cd": 1200,
      "range": 500,
      "presentation": {
        "color": "#238f96"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 18,
          "radius": 18,
          "targetPoint": true,
          "targetPointResolve": "none",
          "arrival": {
            "linger": {
              "atRange": true,
              "atTarget": true,
              "atWall": true,
              "duration": {
                "$ref": "attacks.rmbExplosion.modules.0.delay"
              },
              "fadeOut": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false
            },
            "passWallsInFlight": true,
            "targetRelations": [
              "enemy"
            ],
            "targetPriority": "before-wall",
            "triggerHitEffects": true
          },
          "damageOnTravel": false
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.terdion.rmb-landing",
            "attack.terdion.rmb-explosion"
          ],
          "oncePerProjectile": true,
          "cancelDelayedOnRemove": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.rmb.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false,
            "strokeColor": "#238f96",
            "innerColor": "#f5d9ab"
          }
        },
        {
          "type": "trajectory.arc",
          "height": 120,
          "screenLiftRatio": 0.72,
          "apexScale": 0.84,
          "apexAlpha": 0.4,
          "apexStrokeAlpha": 0.62
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "rmbExplosion": {
      "id": "attack.terdion.rmb-explosion",
      "damageRatio": 6,
      "cost": 0,
      "cd": 0,
      "range": 180,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "circle",
          "range": {
            "$ref": "attacks.rmbExplosion.range"
          },
          "delay": 500,
          "wallPolicy": "block",
          "color": "35,143,150",
          "renderType": "areaCircle"
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.3333333333333333,
          "multiplier": 0.6666666666666666
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.6666666666666666,
          "multiplier": 0.5
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distanceMode": "impact-proximity",
          "minDistance": 20,
          "maxDistance": 140,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "world.destroy-walls",
          "range": {
            "$ref": "attacks.rmbExplosion.modules.0.range"
          },
          "wallPolicy": "block",
          "contactRange": {
            "$ref": "attacks.rmb.modules.0.radius"
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "rmbLanding": {
      "id": "attack.terdion.rmb-landing",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "impact-point",
          "radius": {
            "$ref": "attacks.rmb.modules.0.radius"
          },
          "range": {
            "$ref": "attacks.rmb.modules.0.radius"
          },
          "duration": {
            "$ref": "attacks.rmbExplosion.modules.0.delay"
          },
          "fadeOut": false,
          "fillAlpha": 0,
          "strokeAlpha": 0,
          "lineWidth": 2,
          "color": "35,143,150",
          "visibility": "owner-team",
          "remainingArcGauge": true,
          "remainingArcOffset": 6,
          "remainingArcLineWidth": 3,
          "remainingArcAlpha": 0.95,
          "stateKey": "projectile-fuse"
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.terdion.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 300,
      "range": 350,
      "presentation": {
        "color": "#238f96"
      },
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 14,
          "radius": 14,
          "arrival": {
            "linger": {
              "atRange": true,
              "atTarget": true,
              "atWall": true,
              "duration": {
                "$ref": "attacks.counterExplosion.modules.0.delay"
              },
              "fadeOut": false,
              "triggerOnEnter": false,
              "removeOnTrigger": false,
              "showRange": false,
              "snapToRangeEnd": true
            },
            "triggerOnLanding": true,
            "targetRelations": [
              "enemy"
            ],
            "triggerHitEffects": true
          },
          "damageOnTravel": false
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": false
        },
        {
          "type": "projectile.impact",
          "attackIds": [
            "attack.terdion.counter-landing",
            "attack.terdion.counter-explosion"
          ],
          "oncePerProjectile": true,
          "cancelDelayedOnRemove": true
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 8,
          "interval": 40,
          "aimMode": "locked",
          "angleOffsets": [
            0,
            0.7853981633974483,
            1.5707963267948966,
            2.356194490192345,
            3.141592653589793,
            3.9269908169872414,
            4.71238898038469,
            5.497787143782138
          ],
          "distanceMode": "target-point"
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.counter.modules.0.radius"
            },
            "fillAlpha": 0.28,
            "strokeWidth": 3,
            "innerStrokeWidth": 2,
            "crossHalfLength": 6,
            "showLink": false,
            "strokeColor": "#238f96",
            "innerColor": "#f5d9ab"
          }
        },
        {
          "type": "trajectory.arc",
          "height": 120,
          "screenLiftRatio": 0.72,
          "apexScale": 0.84,
          "apexAlpha": 0.4,
          "apexStrokeAlpha": 0.62
        }
      ],
      "tags": [
        "반격"
      ],
      "previewProjectilePaths": "impact-only"
    },
    "counterExplosion": {
      "id": "attack.terdion.counter-explosion",
      "damageRatio": 3,
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
          "delay": 500,
          "wallPolicy": "block",
          "color": "35,143,150",
          "renderType": "areaCircle"
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.3333333333333333,
          "multiplier": 0.6666666666666666
        },
        {
          "type": "damage.range-band-multiplier",
          "mode": "radial",
          "centerMode": "impact",
          "thresholdRatio": 0.6666666666666666,
          "multiplier": 0.5
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "away-from-impact",
          "distanceMode": "impact-proximity",
          "minDistance": 20,
          "maxDistance": 100,
          "speed": 10,
          "oncePerExecution": true
        }
      ],
      "tags": [
        "반격"
      ]
    },
    "counterLanding": {
      "id": "attack.terdion.counter-landing",
      "damageRatio": 0,
      "cost": 0,
      "cd": 0,
      "range": 0,
      "effectsOnly": true,
      "modules": [
        {
          "type": "effect.spawn",
          "when": "after-attack",
          "renderType": "areaCircle",
          "position": "impact-point",
          "radius": {
            "$ref": "attacks.counter.modules.0.radius"
          },
          "range": {
            "$ref": "attacks.counter.modules.0.radius"
          },
          "duration": {
            "$ref": "attacks.counterExplosion.modules.0.delay"
          },
          "fadeOut": false,
          "fillAlpha": 0,
          "strokeAlpha": 0,
          "lineWidth": 2,
          "color": "35,143,150",
          "visibility": "owner-team",
          "remainingArcGauge": true,
          "remainingArcOffset": 6,
          "remainingArcLineWidth": 3,
          "remainingArcAlpha": 0.95,
          "stateKey": "projectile-fuse"
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.terdion.lmb",
      "input": "lmb",
      "attackId": "attack.terdion.lmb",
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
          },
          {
            "type": "ability.pending-ready"
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
      "id": "ability.terdion.rmb",
      "input": "rmb",
      "attackId": "attack.terdion.rmb",
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
          },
          {
            "type": "ability.pending-ready"
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
      "id": "ability.terdion.counter",
      "input": "counter",
      "attackId": "attack.terdion.counter",
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
            "type": "combat.can-act"
          },
          {
            "type": "ability.pending-ready"
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
            "ccRefAttackId": "attack.terdion.counter-explosion",
            "preview": {
              "type": "preview.create",
              "shape": "attack-shape"
            },
            "targetPointMode": "aim-point"
          }
        ]
      }
    }
  }
}
