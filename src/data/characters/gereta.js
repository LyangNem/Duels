{
  "id": "gereta",
  "name": "게레타",
  "englishName": "Gereta",
  "title": "단련된 나무꾼",
  "color": "#bcbcbc",
  "classification": {
    "style": 4,
    "range": 0,
    "role": 1
  },
  "stats": {
    "maxHealth": 1200,
    "speed": 4,
    "radius": 20,
    "baseDamage": 150,
    "difficulty": 5
  },
  "desc": "도끼를 차징해 긴 사거리와 강한 일격으로 적을 베어내는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "나무를 베듯",
      "attack": "lmb",
      "text": "도끼를 휘둘러 피해 ({damage})"
    },
    {
      "key": "RMB HOLD",
      "name": "롱 엑슬래시",
      "attack": "rmb",
      "text": "최대 {chargeSeconds}초 홀드. 홀드할수록 피해·사거리와 빗나갔을 때의 기절 시간 증가 ({minDamage}~{maxDamage})"
    },
    {
      "key": "L-Shift",
      "name": "날려 찍기",
      "attack": "counter",
      "text": "도끼를 던져 적중한 적에게 피해 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.gereta.lmb",
      "damageRatio": 1,
      "cost": 200,
      "cd": 500,
      "range": 225,
      "modules": [
        {
          "type": "delivery.area",
          "shape": "sector",
          "range": 225,
          "halfAngle": 1.05,
          "contactType": "melee",
          "wallPolicy": "block"
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "gereta-axe-motion",
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
      "id": "attack.gereta.rmb",
      "damageRatio": 1.3333333333333333,
      "cost": 200,
      "cd": 800,
      "range": 180,
      "charge": {
        "duration": 1500,
        "costMin": 200,
        "costMax": 650,
        "gauge": true,
        "damageRatio": {
          "from": 1.3333333333333333,
          "to": 5.333333333333333,
          "step": 0.3333333333333333
        },
        "range": {
          "from": 180,
          "to": 325
        },
        "moduleValues": [
          {
            "type": "status.apply",
            "property": "duration",
            "from": 400,
            "to": 1200
          }
        ],
        "preview": true,
        "costTiming": "during-charge",
        "staminaRegenDuringCharge": false
      },
      "modules": [
        {
          "type": "delivery.area",
          "shape": "rect",
          "range": 180,
          "halfWidth": 48,
          "delay": 350,
          "aimMode": "live-source",
          "contactType": "melee",
          "wallPolicy": "block",
          "previewDuringDelay": true
        },
        {
          "type": "status.apply",
          "when": "after-delivery",
          "recipient": "source",
          "status": "stun",
          "duration": 400,
          "conditions": [
            {
              "type": "delivery.hit-count-lte",
              "value": 0
            }
          ]
        },
        {
          "type": "mode.toggle",
          "when": "on-delivery",
          "stateKey": "gereta-axe-motion",
          "values": [
            "a",
            "b"
          ]
        }
      ],
      "tags": [
        "스킬",
        "선딜레이"
      ]
    },
    "counter": {
      "id": "attack.gereta.counter",
      "damageRatio": 2,
      "cost": 0,
      "cd": 300,
      "range": 700,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 28,
          "radius": 36
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": {
              "$ref": "attacks.counter.modules.0.radius"
            },
            "showLink": false
          }
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
          "stateKey": "gereta-axe-motion",
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
      "id": "ability.gereta.lmb",
      "input": "lmb",
      "attackId": "attack.gereta.lmb",
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
      "id": "ability.gereta.rmb",
      "input": "rmb",
      "attackId": "attack.gereta.rmb",
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
            "stateKey": "charge:gereta-skill"
          }
        ],
        "modules": [
          {
            "type": "charge.attack.start",
            "stateKey": "charge:gereta-skill"
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
          },
          {
            "type": "state.exists",
            "stateKey": "charge:gereta-skill"
          }
        ],
        "modules": [
          {
            "type": "charge.attack.release",
            "stateKey": "charge:gereta-skill"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.gereta.counter",
      "input": "counter",
      "attackId": "attack.gereta.counter",
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
            "ccRefAttackId": "attack.gereta.counter"
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
      "style": "woodcutter-axe",
      "angle": -0.55,
      "scale": 1.65,
      "rotationStateKey": "gereta-axe-motion",
      "rotationMs": 400,
      "rotationRadians": 6.283185307179586
    }
  ]
}
