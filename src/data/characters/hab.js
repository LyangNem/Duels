{
  "id": "hab",
  "name": "헤브",
  "englishName": "Hab",
  "title": "대양의 선장",
  "color": "#9a6848",
  "classification": {
    "style": 5,
    "range": 0,
    "role": 6
  },
  "stats": {
    "maxHealth": 1200,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 200,
    "difficulty": 4
  },
  "desc": "출혈된 적을 연속타격하며 압도적인 스테미나로 전투하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "피의 발자취",
      "showCost": false,
      "text": "출혈된 적을 타격하면 최대 스테미나의 {v:triggers.0.modules.0.maxResourceRatio|percent}% 회복"
    },
    {
      "key": "LMB",
      "name": "작살",
      "attack": "lmb",
      "text": "작살을 투척하여 출혈 ({damage})"
    },
    {
      "key": "RMB",
      "name": "녀석을 노려!",
      "attack": "rmb",
      "text": "추진 작살을 투척. 적과 벽을 관통하여 출혈 ({damage})"
    },
    {
      "key": "L-Shift",
      "name": "출항이다!",
      "attack": "counter",
      "text": "적과 벽을 관통하는 선체. 범위 내 적에게 피해 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.hab.lmb",
      "damageRatio": 0.5,
      "cost": 250,
      "cd": 400,
      "range": 550,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 30.0,
          "radius": 15
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
            "strokeWidth": 2,
            "showLink": false,
            "strokeColor": "#9a6848"
          }
        },
        {
          "type": "status.apply",
          "status": "bleed",
          "duration": {
            "$ref": "bleedDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type"
          },
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "hab-weapon-motion",
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
    "rmb": {
      "id": "attack.hab.rmb",
      "damageRatio": 1,
      "cost": 500,
      "cd": 400,
      "range": 550,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 37.5,
          "radius": 20
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
            "strokeWidth": 2,
            "showLink": false,
            "strokeColor": "#9a6848"
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "status.apply",
          "status": "bleed",
          "duration": {
            "$ref": "bleedDuration"
          },
          "data": {
            "tickAtEnd": true,
            "stackMode": "refresh-type"
          },
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "hab-weapon-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.hab.counter",
      "damageRatio": 0.5,
      "cost": 0,
      "cd": 300,
      "range": 750,
      "modules": [
        {
          "type": "delivery.range-projectile",
          "speed": 12,
          "radius": 300,
          "expireAtRange": false
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.presentation",
          "kind": "range-projectile"
        },
        {
          "type": "movement.neutralize-knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 84,
          "speed": 10,
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "hab-weapon-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.hab.lmb",
      "input": "lmb",
      "attackId": "attack.hab.lmb",
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
      "id": "ability.hab.rmb",
      "input": "rmb",
      "attackId": "attack.hab.rmb",
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
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    },
    "counter": {
      "id": "ability.hab.counter",
      "input": "counter",
      "attackId": "attack.hab.counter",
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
            "ccRefAttackId": "attack.hab.counter"
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    }
  },
  "triggers": [
    {
      "id": "trigger.hab.blood-trail",
      "type": "trigger",
      "event": "damage-dealt",
      "conditions": [
        {
          "type": "entity.alive"
        },
        {
          "type": "impact.direct"
        },
        {
          "type": "context.truthy",
          "key": "amount"
        },
        {
          "type": "target.status-active",
          "status": "bleed"
        },
        {
          "type": "target.kind-not-in",
          "kinds": [
            "summon",
            "trainingBot"
          ]
        }
      ],
      "modules": [
        {
          "type": "resource.restore",
          "resource": "stamina",
          "recipient": "source",
          "maxResourceRatio": 0.5
        },
        {
          "type": "effect.spawn",
          "renderType": "hitImpactRing",
          "position": "hit-target",
          "r": 8,
          "maxR": 38,
          "color": "#ff6680",
          "strokeAlpha": 0.9,
          "lineWidth": 2,
          "duration": 240,
          "animation": true
        },
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
  "bleedDuration": 2000,
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "harpoon",
      "color": "#9a6848",
      "scale": 1.5,
      "angle": -0.6,
      "motionStateKey": "hab-weapon-motion",
      "motionMs": 480,
      "motion": {
        "rotation": 0.65,
        "travelX": 1.35,
        "travelY": -0.3
      }
    }
  ]
}
