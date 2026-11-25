{
  "id": "airi",
  "name": "아이리",
  "englishName": "Airi",
  "title": "정의의 집행자",
  "color": "#39758f",
  "classification": {
    "style": 1,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1200,
    "speed": 3.75,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 4
  },
  "desc": "권총 연사와 침묵으로 적을 제압하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "정의의 권총",
      "attack": "lmb",
      "text": "권총을 {burstCount}발 연사해 피해 (탄당 {damage})"
    },
    {
      "key": "RMB",
      "name": "전자식 수갑",
      "attack": "rmb",
      "text": "벽을 관통하는 전자식 수갑을 던져 넉백 및 {v:attacks.rmb.modules.3.duration|seconds}초 침묵"
    },
    {
      "key": "L-Shift",
      "name": "테이저건",
      "attack": "counter",
      "text": "전방으로 테이저건을 발사해 피해 및 {v:attacks.counter.modules.1.duration|seconds}초 침묵 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.airi.lmb",
      "damageRatio": 1.5,
      "cost": 150,
      "cd": 500,
      "range": 850,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 32,
          "radius": 10
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 2,
          "interval": 120,
          "aimMode": "live-source",
          "phaseKey": "airi-pistol-burst"
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "airi-weapon-motion",
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
      "id": "attack.airi.rmb",
      "damageRatio": 0,
      "effectsOnly": true,
      "cost": 500,
      "cd": 700,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 26,
          "radius": 25,
          "applyHitEffects": true
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": true
        },
        {
          "type": "movement.knockback",
          "target": "hit-target",
          "direction": "attack",
          "distance": 100,
          "speed": 14,
          "oncePerExecution": true
        },
        {
          "type": "status.apply",
          "status": "silence",
          "duration": 1000,
          "data": {
            "stackMode": "refresh-type"
          },
          "oncePerExecution": true
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "airi-weapon-motion",
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
      "id": "attack.airi.counter",
      "damageRatio": 2,
      "cost": 0,
      "cd": 300,
      "range": 750,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 36,
          "radius": 14
        },
        {
          "type": "status.apply",
          "status": "silence",
          "duration": 1500,
          "data": {
            "stackMode": "refresh-type"
          },
          "oncePerExecution": true
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
          "stateKey": "airi-weapon-motion",
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
      "id": "ability.airi.lmb",
      "input": "lmb",
      "attackId": "attack.airi.lmb",
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
      "id": "ability.airi.rmb",
      "input": "rmb",
      "attackId": "attack.airi.rmb",
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
      "id": "ability.airi.counter",
      "input": "counter",
      "attackId": "attack.airi.counter",
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
            "ccRefAttackId": "attack.airi.counter"
          }
        ]
      },
      "inputPolicy": {
        "repeatWhileHeld": false
      }
    }
  },
  "worldEffectModules": [
    {
      "type": "effect.spawn",
      "renderType": "weaponImage",
      "style": "pistol",
      "color": "#39758f",
      "scale": 1.4,
      "angle": -0.6,
      "motionStateKey": "airi-weapon-motion",
      "motionMs": 400,
      "motion": {
        "rotation": -0.7,
        "travelX": -0.25
      }
    }
  ]
}
