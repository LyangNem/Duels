{
  "id": "ruvu",
  "name": "루뷰",
  "title": "공방의 마스코트",
  "color": "#00aaff",
  "classification": {
    "style": 2,
    "range": 0,
    "role": 2
  },
  "stats": {
    "maxHealth": 800,
    "speed": 4,
    "radius": 20,
    "baseDamage": 100,
    "difficulty": 5
  },
  "desc": "망치와 못으로 저격하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "LMB",
      "name": "못",
      "attack": "lmb",
      "text": "못을 망치로 쳐내 날리기 ({damage})"
    },
    {
      "key": "RMB",
      "name": "망치 투척",
      "attack": "rmb",
      "text": "벽과 적을 관통하는 망치 투척 · {autoReturnSeconds}초 후 자동 회수 ({damage})"
    },
    {
      "key": "RMB/LMB",
      "name": "망치 돌진",
      "attack": "lmb",
      "costText": "스테미나 0",
      "text": "날아가는 망치 위치를 지나 추가 거리까지 돌진"
    },
    {
      "key": "RMB/RMB",
      "name": "망치 회수",
      "attack": "rmb",
      "costText": "스테미나 0",
      "text": "망치를 즉시 회수하며 반대 방향으로 돌진"
    },
    {
      "key": "L-Shift",
      "name": "올려치기",
      "attack": "counter",
      "text": "직선 범위 올려치기 ({damage})"
    }
  ],
  "attacks": {
    "lmb": {
      "id": "attack.ruvu.lmb",
      "damageRatio": 2,
      "cost": 150,
      "cd": 220,
      "range": 1200,
      "modules": [
        {
          "type": "pattern.scatter",
          "count": 1,
          "spread": 0
        },
        {
          "type": "delivery.projectile",
          "speed": 32.2,
          "radius": 15
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.ruvu.rmb",
      "damageRatio": 2,
      "cost": 400,
      "cd": 200,
      "range": 630,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 24.15,
          "radius": 26,
          "hitRadius": 16
        },
        {
          "type": "projectile.return",
          "stateKey": "primary-weapon",
          "returnAttackId": "attack.ruvu.rmb-return",
          "stopAtRange": true,
          "autoAfterMs": 1500,
          "speed": 24.15,
          "autoArrivalMovement": {
            "type": "movement.move",
            "direction": "away-from-return-origin",
            "motionMode": "knockback",
            "distance": 120,
            "speed": 750,
            "presentation": false
          }
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.collision",
          "wall": "stop"
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.28,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeWidth": 3,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "linkAlpha": 0.2,
            "linkWidth": 1.5,
            "linkDash": [
              5,
              4
            ],
            "returningAlpha": 0.55,
            "strokeColor": "100,210,255",
            "innerColor": "180,230,255"
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "rmbReturn": {
      "id": "attack.ruvu.rmb-return",
      "damageRatio": 2,
      "cost": 0,
      "cd": 0,
      "range": 630,
      "modules": [
        {
          "type": "delivery.projectile",
          "phase": "returning",
          "speed": 24.15,
          "radius": 26,
          "hitRadius": 16
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": true
        },
        {
          "type": "projectile.presentation",
          "kind": "weapon-projectile",
          "style": {
            "type": "anchor-cross",
            "radius": 16,
            "fillAlpha": 0.28,
            "pulseMin": 0.7,
            "pulseMax": 1,
            "pulseSpeed": 0.014,
            "strokeWidth": 3,
            "innerStrokeWidth": 2.5,
            "crossHalfLength": 8,
            "linkAlpha": 0.2,
            "linkWidth": 1.5,
            "linkDash": [
              5,
              4
            ],
            "returningAlpha": 0.55,
            "strokeColor": "100,210,255",
            "innerColor": "180,230,255"
          }
        }
      ],
      "tags": [
        "스킬"
      ]
    },
    "counter": {
      "id": "attack.ruvu.counter",
      "damageRatio": 4,
      "cost": 0,
      "cd": 300,
      "range": 350,
      "modules": [
        {
          "type": "delivery.area",
          "contactType": "melee",
          "shape": "rect",
          "range": {
            "$ref": "attacks.counter.range"
          },
          "halfWidth": 45
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.ruvu.lmb",
      "input": "lmb",
      "attackId": "attack.ruvu.lmb",
      "inputPolicy": {
        "blockRepeatWhen": {
          "stateKey": "primary-weapon",
          "phase": "outbound"
        }
      },
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
            "type": "movement.move",
            "tags": [
              "스킬",
              "이동기"
            ],
            "target": {
              "type": "projectile",
              "stateKey": "primary-weapon",
              "phase": "outbound",
              "extraDistance": 160
            },
            "extraDistanceMotion": "knockback",
            "extraDistanceTags": [],
            "extraDistanceSpeed": 750,
            "speed": 3840,
            "collision": {
              "passWalls": true,
              "passEnemies": true
            },
            "consumeTarget": true,
            "presentation": {
              "type": "dash-line",
              "color": "100,200,255",
              "width": 6,
              "alpha": 0.4,
              "duration": 167
            }
          },
          {
            "type": "ability.lock",
            "when": "handled",
            "duration": 600
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.ruvu.rmb",
      "input": "rmb",
      "attackId": "attack.ruvu.rmb",
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
            "type": "projectile.recall",
            "tags": [
              "스킬",
              "귀환"
            ],
            "stateKey": "primary-weapon",
            "phase": "outbound",
            "requireAttackReady": true,
            "blockFallbackWhileExists": true,
            "movement": {
              "type": "movement.move",
              "tags": [],
              "direction": "away-from-projectile",
              "motionMode": "knockback",
              "distance": 120,
              "speed": 750,
              "presentation": false
            }
          },
          {
            "type": "ability.lock",
            "when": "handled",
            "duration": 600
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "counter": {
      "id": "ability.ruvu.counter",
      "input": "counter",
      "attackId": "attack.ruvu.counter",
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
  }
}
