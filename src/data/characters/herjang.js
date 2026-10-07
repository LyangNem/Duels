{
  "id": "herjang",
  "name": "헤르쟝",
  "englishName": "Herjang",
  "title": "자택 경비원",
  "color": "#00c897",
  "classification": {
    "style": 8,
    "range": 0,
    "role": 2
  },
  "stats": {
    "maxHealth": 1000,
    "speed": 4,
    "radius": 20,
    "baseDamage": 200,
    "difficulty": 3
  },
  "desc": "이동형 대포를 운용해 전장을 지배하는 캐릭터",
  "tooltipSkills": [
    {
      "key": "ALWAYS",
      "name": "대포 운반",
      "attack": "rmb",
      "showCost": false,
      "text": "대포에 가까이 다가갈 시 대포를 들고 이동. 평타/스킬 사용으로 내려놓기"
    },
    {
      "key": "LMB",
      "name": "미니 대포",
      "attack": "lmb",
      "text": "대포를 발사하고 반동으로 빠르게 뒤로 이동 ({damage})"
    },
    {
      "key": "RMB",
      "name": "이동형 대포",
      "attack": "rmb",
      "text": "현재 위치에 대포 설치"
    },
    {
      "key": "RMB SUMMONER",
      "name": "대포 명령",
      "attack": "cannonBurst",
      "costRef": {
        "ability": "rmb",
        "trigger": "trigger",
        "module": "summon.toggle",
        "property": "activeCommand.cost"
      },
      "text": "설치된 대포가 조준 위치를 향해 슬로우 포탄 {burstCount}발 점사 (탄당 {damage})"
    },
    {
      "key": "L-Shift",
      "name": "과반동",
      "attack": "counter",
      "text": "적을 관통하는 강력한 포탄을 발사하고 강하게 뒤로 넉백 ({damage})"
    }
  ],
  "summonSpecs": [
    {
      "stateKey": "cannon",
      "stats": [
        {
          "key": "HEALTH",
          "text": "{maxHealth}"
        },
        {
          "key": "MOVE SPEED",
          "text": "{moveLabel}"
        },
        {
          "key": "ABILITY",
          "text": "주변 적을 자동 공격 ({autoAttackDamage})"
        },
        {
          "key": "DEATH",
          "text": "사망 시 {respawnSeconds}초간 재사용 불가"
        }
      ]
    }
  ],
  "summons": {
    "cannon": {
      "id": "summon.herjang.cannon",
      "name": "이동형 대포",
      "maxHealth": 1000,
      "radius": 22,
      "speed": 0,
      "baseDamage": 200,
      "respawnDelay": 7000,
      "tags": [
        "소환수",
        "고정형",
        "대포"
      ],
      "carry": {
        "pickupRange": 65,
        "speedMultiplier": 1,
        "pickupCooldown": 1000,
        "dropCooldown": 500,
        "visibility": "owner"
      },
      "ai": {
        "enabled": true,
        "stationary": true,
        "meleeAttackId": "attack.herjang.cannon-auto",
        "meleeRange": 520,
        "rangeField": {
          "type": "field.area",
          "shape": "circle",
          "range": 520
        },
        "useAttackRangeForMelee": false,
        "stopRange": 0,
        "meleeInterval": 461.5384615385,
        "meleeWindup": 0,
        "aimJitter": 0.105
      },
      "attackRangePresentation": {
        "shape": "circle",
        "rangeRef": "ai-melee-range",
        "range": 520,
        "visibility": "owner",
        "color": "#00c897",
        "alpha": 0.2,
        "lineWidth": 1.5,
        "dash": [
          6,
          6
        ]
      },
      "presentation": {
        "profile": "classicMinion",
        "color": "#00c897",
        "fillColor": "rgba(38,198,218,.55)",
        "strokeColor": "#00c897"
      },
      "spawnEffect": {
        "type": "areaCircle",
        "r": 40,
        "range": 40,
        "color": "0,200,151",
        "fillAlpha": 0.08,
        "strokeAlpha": 0.8,
        "duration": 267
      }
    }
  },
  "attacks": {
    "lmb": {
      "id": "attack.herjang.lmb",
      "damageRatio": 1,
      "cost": 150,
      "cd": 480,
      "range": 900,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 20,
          "radius": 10
        },
        {
          "type": "movement.move",
          "direction": "opposite-aim",
          "motionMode": "knockback",
          "distance": 100,
          "duration": 120,
          "collision": {
            "passWalls": false,
            "passEnemies": true
          },
          "tags": [],
          "presentation": false
        }
      ],
      "tags": [
        "평타"
      ]
    },
    "rmb": {
      "id": "attack.herjang.rmb",
      "damageRatio": 0,
      "cost": 500,
      "cd": 800,
      "range": 0,
      "effectsOnly": true,
      "modules": [],
      "tags": [
        "스킬"
      ]
    },
    "cannonAuto": {
      "id": "attack.herjang.cannon-auto",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 900,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 19.2,
          "radius": 15
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": true
        }
      ],
      "tags": [
        "소환수 공격"
      ]
    },
    "cannonBurst": {
      "id": "attack.herjang.cannon-burst",
      "damageRatio": 1,
      "cost": 0,
      "cd": 0,
      "range": 1100,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 21.6,
          "radius": 11
        },
        {
          "type": "delivery.delayed-projectile-volley",
          "count": 3,
          "interval": 138.4615384615,
          "aimMode": "locked"
        },
        {
          "type": "projectile.pierce",
          "targets": false,
          "walls": true
        },
        {
          "type": "status.apply",
          "status": "slow",
          "duration": 1500,
          "data": {
            "factor": {
              "$ref": "statusDefaults.slow.factor"
            },
            "stackMode": "replace-source"
          }
        }
      ],
      "tags": [
        "스킬",
        "소환수 공격"
      ]
    },
    "counter": {
      "id": "attack.herjang.counter",
      "damageRatio": 1.5,
      "cost": 0,
      "cd": 300,
      "range": 900,
      "modules": [
        {
          "type": "delivery.projectile",
          "speed": 28,
          "radius": 16
        },
        {
          "type": "hit.once-per-execution"
        },
        {
          "type": "projectile.pierce",
          "targets": true,
          "walls": false
        },
        {
          "type": "movement.move",
          "direction": "opposite-aim",
          "motionMode": "knockback",
          "distance": 255,
          "duration": 150,
          "collision": {
            "passWalls": false,
            "passEnemies": true
          },
          "tags": [],
          "presentation": false
        }
      ],
      "tags": [
        "반격"
      ]
    }
  },
  "abilities": {
    "lmb": {
      "id": "ability.herjang.lmb",
      "input": "lmb",
      "attackId": "attack.herjang.lmb",
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
            "type": "summon.carry-drop",
            "stateKey": "cannon",
            "cooldown": 500,
            "tags": [
              "소환"
            ]
          },
          {
            "type": "action.attack"
          }
        ]
      }
    },
    "rmb": {
      "id": "ability.herjang.rmb",
      "input": "rmb",
      "attackId": "attack.herjang.rmb",
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
            "type": "summon.toggle",
            "stateKey": "cannon",
            "placeDistance": 0,
            "dropWhileCarrying": true,
            "dropCooldown": 500,
            "tags": [
              "스킬",
              "소환"
            ],
            "activeCommand": {
              "target": "aim",
              "attackId": "attack.herjang.cannon-burst",
              "cost": 400,
              "cooldown": 800,
              "maxDistance": 1100,
              "fixedDistance": false,
              "blockWhileMoving": false,
              "aimFrom": "target-point"
            }
          }
        ]
      }
    },
    "counter": {
      "id": "ability.herjang.counter",
      "input": "counter",
      "attackId": "attack.herjang.counter",
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
            }
          }
        ]
      }
    }
  },
  "statusDefaults": {
    "slow": {
      "factor": 0.5
    }
  }
}
