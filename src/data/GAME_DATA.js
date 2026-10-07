

const GAME_DATA=freezeCharacterData({
  frameMs: 16.666666666666668,
  canvas: {width: 1200, height: 800, aspect: 1.5},
  world: {width: 2000, height: 1400},
  stamina: {max: 2000, regenDelay: 500, regenTime: 4000},
  healthRegen: {idle: 4500, tick: 1000, ratio: 0.1},
  dodge: {cost: 300, dist: 119, speed: 17.95, dur: 130, justWindow: 80},
  counter: {window: 5000, delay: 300},
  cameraFeedback: {
    strongDamage: 600,
    strongHitZoom: {duration: 82, basePeak: 0.026, maxPeak: 0.045, damagePeakStep: 0.000024, attackRatio: 0.23, releasePower: 2.6},
    ko: {zoom: 1.085, duration: 430, shake: 46, shakeDuration: 430}
  },
  cameraFollow: {
    idleResponseMs: 55,
    wasdResponseMs: 92,
    mobilityResponseMs: 155,
    maxStepMs: 50,
    snapDistance: 520,
    edgeOverscanRatio: 0.4
  },
  ranges: CHARACTER_RULES.ranges,
  characterRoleTags: Object.values(CHARACTER_RULES.roles),
  trainingBots: {
    melee: {
      color: "#ff6644",
      spawn: {x: 1000, y: 500},
      firstDelay: 1500,
      cycle: ["lmb", "rmb", "counter"],
      intervals: {lmb: 1400, rmb: 1800, counter: 2200},
      attacks: {
        lmb: {
          id: "training.bot.melee.lmb",
          cost: 0,
          cd: 0,
          range: 190,
          damageRatio: 1.6,
          modules: [{type: "delivery.area", shape: "rect", range: 190, halfWidth: 35}],
          tags: ["봇 공격"]
        },
        rmb: {
          id: "training.bot.melee.rmb",
          cost: 0,
          cd: 0,
          range: 150,
          damageRatio: 2.2,
          modules: [
            {type: "delivery.area", shape: "sector", range: 150, halfAngle: 1.05},
            {
              type: "movement.knockback",
              target: "hit-target",
              direction: "attack-direction",
              distance: 65,
              speed: 7.738,
              oncePerExecution: true
            }
          ],
          tags: ["봇 공격"]
        },
        counter: {
          id: "training.bot.melee.counter",
          cost: 0,
          cd: 0,
          range: 260,
          damageRatio: 2.8,
          modules: [{type: "delivery.area", shape: "rect", range: 260, halfWidth: 55}],
          tags: ["봇 공격", "반격"]
        }
      }
    },
    ranged: {
      color: "#44aaff",
      spawn: {x: 1000, y: 900},
      firstDelay: 2000,
      cycle: ["lmb"],
      intervals: {lmb: 2000},
      attacks: {
        lmb: {
          id: "training.bot.ranged.lmb",
          cost: 0,
          cd: 0,
          range: 800,
          damageRatio: 1.2,
          modules: [{type: "pattern.scatter", count: 1, spread: 0}, {type: "delivery.projectile", speed: 12, radius: 8}],
          tags: ["봇 공격"]
        }
      }
    }
  },
  characterDifficulties: Object.freeze(Object.fromEntries(Object.entries(CHARACTER_DATA).map(([id,c])=>[id,c.stats.difficulty]))),
  characters: CharacterDataService.compileAll()
});