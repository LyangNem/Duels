
/* 캐릭터 */


/* 증강 데이터 */
const AUGMENTS=Object.freeze([
  Object.freeze({
    id:'big_bullet',
    name:'거대 총알',
    emoji:'🔴',
    rarity:'common',
    desc:'탄환 크기 <b>+60%</b>, 스테미나 회복 속도 <r>-15%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'projectileRadius',value:.60}),
      Object.freeze({type:'modifier.constant',stat:'staminaRegen',value:-.15})
    ])
  }),
  Object.freeze({
    id:'endurance',
    name:'지구력',
    emoji:'⚡',
    rarity:'common',
    desc:'최대 스테미나 <b>+35%</b>, 이동속도 <r>-10%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'maxStamina',value:.35}),
      Object.freeze({type:'modifier.constant',stat:'speed',value:-.10})
    ])
  }),
  Object.freeze({
    id:'protection',
    name:'보호',
    emoji:'🪨',
    rarity:'common',
    desc:'모든 받는 피해 <b>15% 감소</b>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'defense',value:.15})
    ])
  }),
  Object.freeze({
    id:'overpower',
    name:'오버파워',
    emoji:'💪',
    rarity:'common',
    desc:'이동속도와 피해량 <b>+10%</b>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'speed',value:.10}),
      Object.freeze({type:'modifier.constant',stat:'damage',value:.10})
    ])
  }),
  Object.freeze({
    id:'speed_shot',
    name:'스피드 샷',
    emoji:'🚀',
    rarity:'common',
    desc:'탄속 <b>+20%</b>, 투사체 크기 <r>-15%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'projectileSpeed',value:.20}),
      Object.freeze({type:'modifier.constant',stat:'projectileRadius',value:-.15})
    ])
  }),
  Object.freeze({
    id:'healing',
    name:'힐링',
    emoji:'💚',
    rarity:'common',
    desc:'매 초마다 체력 <b>20 회복</b>',
    effects:Object.freeze([
      Object.freeze({
        type:'modifier.constant',
        stat:'regenFlat',
        value:20
      })
    ])
  }),
  Object.freeze({
    id:'light_step',
    name:'가벼운 걸음',
    emoji:'👟',
    rarity:'common',
    desc:'회피 거리 <b>+30%</b>, 이동속도 <r>-10%</r>',
    effects:Object.freeze([
      Object.freeze({
        type:'modifier.constant',
        stat:'dodgeDistance',
        value:.30
      }),
      Object.freeze({
        type:'modifier.constant',
        stat:'speed',
        value:-.10
      })
    ])
  }),
  Object.freeze({
    id:'swift_regen',
    name:'배속',
    emoji:'🔋',
    rarity:'common',
    desc:'스테미나 회복 속도 <b>+20%</b>',
    effects:Object.freeze([
      Object.freeze({
        type:'modifier.constant',
        stat:'staminaRegen',
        value:.20
      })
    ])
  }),
  Object.freeze({
    id:'heal_dodge',
    name:'치유 회피',
    emoji:'🍀',
    rarity:'common',
    desc:'저스트 회피 시 체력 <b>10% 회복</b>, 회피 거리 <r>-15%</r>',
    effects:Object.freeze([
      Object.freeze({
        type:'modifier.constant',
        stat:'dodgeDistance',
        value:-.15
      }),
      Object.freeze({
        id:'restore-on-just-dodge',
        type:'trigger',
        event:'just-dodge',
        modules:Object.freeze([
          Object.freeze({
            type:'resource.restore',
            resource:'health',
            recipient:'source',
            maxResourceRatio:.10,
            perStack:true,
            applyHealingModifier:false
          })
        ])
      })
    ])
  }),
  Object.freeze({
    id:'thorn_armor',name:'가시갑옷',emoji:'🌵',rarity:'common',
    desc:'피해를 받을 시 피해량의 <b>30%를 주변에 반사</b>',
    effects:Object.freeze([Object.freeze({
      id:'reflect-damage',type:'trigger',event:'damage-received',aggregateByExecution:true,
      conditions:Object.freeze([
        Object.freeze({type:'impact.direct'}),
        Object.freeze({type:'attack.tag-absent',tag:'반사 피해'})
      ]),
      modules:Object.freeze([
        Object.freeze({type:'value.read',source:'healthDamage'}),
        Object.freeze({type:'value.multiply',value:.30}),
        Object.freeze({
          type:'attack.trigger',damageFromPipeline:true,
          attack:Object.freeze({
            id:'trigger.augment.thorn-reflect',damageRatio:0,cost:0,cd:0,range:130,
            modules:Object.freeze([
              Object.freeze({type:'delivery.area',shape:'circle',range:130,wallPolicy:'ignore'}),
              Object.freeze({type:'effect.spawn',when:'after-attack',renderType:'areaCircle',position:'source',range:130,r:130,durationFrames:10,color:'character',fillAlpha:.10,strokeAlpha:.85,lineWidth:2})
            ]),
            tags:Object.freeze(['증강','반사 피해'])
          })
        })
      ])
    })])
  }),
  Object.freeze({
    id:'pierce_shot',name:'관통샷',emoji:'🏹',rarity:'common',nonStackable:true,
    desc:'<b>3초</b>마다 다음 평타가 벽을 관통',
    effects:Object.freeze([
      Object.freeze({id:'charge',type:'cooldown',duration:3000,presentation:Object.freeze({type:'charge-bar'})}),
      Object.freeze({
        id:'consume-pierce',type:'trigger',event:'attack-fired',oncePerAbilityUse:true,
        conditions:Object.freeze([
          Object.freeze({type:'attack.tag',tag:'평타'}),
          Object.freeze({type:'cooldown.ready',cooldownId:'charge',shareExecution:true})
        ]),
        modules:Object.freeze([Object.freeze({type:'cooldown.consume',cooldownId:'charge',oncePerExecution:true})])
      })
    ]),
    attackAdjustments:Object.freeze([Object.freeze({
      selector:Object.freeze({tags:Object.freeze(['평타'])}),
      conditions:Object.freeze([Object.freeze({type:'cooldown.ready',cooldownId:'charge'})]),
      wallPierce:true
    })])
  }),
  Object.freeze({
    id:'careful_counter',name:'신중한 반격',emoji:'🎯',rarity:'common',
    desc:'반격기 활성화 시간 <b>+200%</b>',
    effects:Object.freeze([Object.freeze({type:'modifier.constant',stat:'counterWindow',value:GAME_DATA.counter.window*2})])
  }),
  Object.freeze({
    id:'fast_regen',name:'빠른 재생',emoji:'💉',rarity:'common',
    desc:'자연 체력회복까지 걸리는 시간 <b>-20%</b>',
    effects:Object.freeze([Object.freeze({type:'modifier.constant',stat:'regenDelay',value:-.20})])
  }),
  Object.freeze({
    id:'pull_in',name:'중력장',emoji:'🧲',rarity:'common',
    desc:'반격기 선딜레이 중 <b>가까운 적 끌어당김</b>',
    effects:Object.freeze([Object.freeze({
      id:'counter-pull',type:'trigger',event:'counter-windup-started',
      modules:Object.freeze([Object.freeze({
        type:'attack.trigger',
        scaleModuleValues:Object.freeze([Object.freeze({type:'movement.pull',property:'distance'})]),
        attack:Object.freeze({
          id:'trigger.augment.gravity-pull',damageRatio:0,cost:0,cd:0,range:220,effectsOnly:true,
          modules:Object.freeze([
            Object.freeze({type:'delivery.area',shape:'circle',range:220,wallPolicy:'ignore'}),
            Object.freeze({type:'movement.pull',target:'hit-target',distance:110,duration:90,gap:14}),
            Object.freeze({type:'effect.spawn',when:'after-attack',renderType:'areaCircle',position:'source',range:220,r:220,durationFrames:18,color:'character',fillAlpha:.08,strokeAlpha:.85,lineWidth:2})
          ]),
          tags:Object.freeze(['증강'])
        })
      })])
    })])
  }),
  Object.freeze({
    id:'attack_step',name:'공격 스텝',emoji:'💢',rarity:'common',
    desc:'회피 종료 지점에서 <b>충격파 생성</b>',
    effects:Object.freeze([Object.freeze({
      id:'dodge-end-shockwave',type:'trigger',event:'dodge-ended',
      modules:Object.freeze([Object.freeze({
        type:'attack.trigger',fixedDamage:100,
        scaleFixedDamagePerStack:true,
        scaleModuleValues:Object.freeze([
          Object.freeze({type:'movement.knockback',property:'distance'})
        ]),
        attack:Object.freeze({
          id:'trigger.augment.attack-step',damageRatio:0,cost:0,cd:0,range:140,
          modules:Object.freeze([
            Object.freeze({type:'delivery.area',shape:'circle',range:140,wallPolicy:'ignore'}),
            Object.freeze({type:'movement.knockback',target:'hit-target',direction:'away-from-source',distance:42,speed:10,oncePerExecution:true}),
            Object.freeze({type:'effect.spawn',when:'after-attack',renderType:'areaCircle',position:'source',range:140,r:140,durationFrames:12,color:'character',fillAlpha:.10,strokeAlpha:.9,lineWidth:2})
          ]),
          tags:Object.freeze(['증강'])
        })
      })])
    })])
  }),
  Object.freeze({
    id:'diversified_investment',name:'분산 투자',emoji:'📊',rarity:'common',
    desc:'스테미나 소모량 <b>-40%</b>, 피해량 <r>-25%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'staminaCost',value:-.40}),
      Object.freeze({type:'modifier.constant',stat:'damage',value:-.25})
    ])
  }),
  Object.freeze({
    id:'overcharged_attack',name:'과충전 공격',emoji:'🔌',rarity:'common',
    desc:'스테미나가 최대일 때 피해량 및 탄속 <b>+40%</b>',
    effects:Object.freeze([]),
    attackAdjustments:Object.freeze([Object.freeze({
      selector:Object.freeze({}),
      conditions:Object.freeze([
        Object.freeze({type:'resource.full',resource:'stamina'}),
        Object.freeze({type:'attack.not-charge'})
      ]),
      damageBonus:.40,
      projectileSpeedBonus:.40,
      presentationBuffs:Object.freeze(['damage','projectileSpeed'])
    })])
  }),
  Object.freeze({
    id:'tank',
    name:'탱크',
    emoji:'🛡️',
    rarity:'rare',
    desc:'최대 체력 <b>+20%</b>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'maxHealth',value:.20})
    ])
  }),
  Object.freeze({
    id:'last_dance',
    name:'라스트 댄스',
    emoji:'💃',
    rarity:'rare',
    desc:'체력 35% 이하 시 이동속도 <b>+30%</b>, 피해량 <b>+30%</b>',
    effects:Object.freeze([
      Object.freeze({
        id:'last-dance-on-low-health',
        type:'trigger',
        event:'resource.changed',
        conditions:Object.freeze([
          Object.freeze({type:'health.ratio-lte',value:.35})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'modifier.set',stat:'speed',value:.30,key:'last-dance-speed'}),
          Object.freeze({type:'modifier.set',stat:'damage',value:.30,key:'last-dance-damage'})
        ])
      }),
      Object.freeze({
        id:'last-dance-off-high-health',
        type:'trigger',
        event:'resource.changed',
        conditions:Object.freeze([
          Object.freeze({type:'health.ratio-gt',value:.35})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'modifier.remove',stat:'speed',key:'last-dance-speed'}),
          Object.freeze({type:'modifier.remove',stat:'damage',key:'last-dance-damage'})
        ])
      })
    ])
  }),
  Object.freeze({
    id:'movement',
    name:'무브먼트',
    emoji:'💨',
    rarity:'rare',
    desc:'이동속도 <b>+15%</b>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'speed',value:.15})
    ])
  }),
  Object.freeze({
    id:'lifesteal',
    name:'흡혈',
    emoji:'🩸',
    rarity:'rare',
    desc:'피해량의 <b>30%</b>만큼 체력 회복, 연사속도 <r>-15%</r>',
    effects:Object.freeze([
      Object.freeze({
        id:'heal',
        type:'trigger',
        event:'damage-dealt',
        tags:Object.freeze(['회복']),
        conditions:Object.freeze([
          Object.freeze({type:'attack.tag-absent',tag:'반사 피해'})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'value.read',source:'healthDamage'}),
          Object.freeze({type:'value.multiply',value:.30}),
          Object.freeze({type:'resource.restore',resource:'health',recipient:'source'})
        ])
      }),
      Object.freeze({type:'modifier.constant',stat:'attackRate',value:-.15})
    ])
  }),
  Object.freeze({
    id:'counter_def',
    name:'공격방어',
    emoji:'🛡',
    rarity:'rare',
    desc:'피해를 준 이후 <b>2.5초간 받는 피해 20% 감소</b>',
    effects:Object.freeze([
      Object.freeze({
        id:'guard-after-hit',
        type:'trigger',
        event:'damage-dealt',
        conditions:Object.freeze([
          Object.freeze({type:'impact.direct'})
        ]),
        modules:Object.freeze([
          Object.freeze({
            type:'modifier.set',
            stat:'defense',
            value:.20,
            duration:2500,
            key:'guard-after-hit'
          })
        ])
      })
    ])
  }),
  Object.freeze({
    id:'big_weapon',
    name:'범위 증폭',
    emoji:'⚔️',
    rarity:'rare',
    desc:'범위 공격 크기 <b>+20%</b>, 공격력 <r>-10%</r>',
    effects:Object.freeze([
      Object.freeze({
        type:'modifier.constant',
        stat:'damage',
        value:-.10
      })
    ]),
    attackAdjustments:Object.freeze([
      Object.freeze({
        selector:Object.freeze({
          tags:Object.freeze(['범위 공격'])
        }),
        rangeBonus:.20
      })
    ])
  }),
  Object.freeze({
    id:'guard_dodge',name:'가드 회피',emoji:'🔰',rarity:'rare',
    desc:'회피 시 3초간 받는 피해 <b>25% 감소</b>',
    effects:Object.freeze([Object.freeze({
      id:'dodge-guard',type:'trigger',event:'dodge-started',
      modules:Object.freeze([
        Object.freeze({type:'modifier.set',stat:'defense',value:.25,duration:3000,key:'dodge-guard'})
      ])
    })])
  }),
  Object.freeze({
    id:'equiv_trade',name:'등가교환',emoji:'⚖️',rarity:'rare',
    desc:'스킬 스테미나 소모량 <b>-30%</b><br>평타 스테미나 소모량 <r>+30%</r>',
    attackAdjustments:Object.freeze([
      Object.freeze({selector:Object.freeze({tags:Object.freeze(['평타'])}),costMultiplier:1.30}),
      Object.freeze({selector:Object.freeze({any:Object.freeze([
        Object.freeze({tags:Object.freeze(['스킬'])}),
        Object.freeze({tags:Object.freeze(['반격'])})
      ])}),costMultiplier:.70})
    ])
  }),
  Object.freeze({
    id:'glass_cannon',name:'유리대포',emoji:'💥',rarity:'rare',
    desc:'피해량 <b>+50%</b><br>체력 <r>-50%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'damage',value:.50}),
      Object.freeze({type:'modifier.constant',stat:'maxHealth',value:-.50})
    ])
  }),
  Object.freeze({
    id:'double_dodge',name:'연속 회피',emoji:'🌪️',rarity:'rare',
    desc:'회피 <b>+1회 연속 사용</b>, 회피 거리 <r>-15%</r>',
    effects:Object.freeze([
      Object.freeze({type:'dodge.repeat',value:1,gap:40}),
      Object.freeze({type:'modifier.constant',stat:'dodgeDistance',value:-.15,maxStacks:4})
    ])
  }),
  Object.freeze({
    id:'gum_shield',name:'이 대신 잇몸으로',emoji:'🦷',rarity:'rare',nonStackable:true,
    desc:'스테미나 부족 시 <b>체력으로 스테미나 대체</b><br>최대 스테미나 <r>-20%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'maxStamina',value:-.20}),
      Object.freeze({type:'stamina.health-fallback',healthCostRatio:.25})
    ])
  }),
  Object.freeze({
    id:'desperate_heart',name:'절박한 마음',emoji:'❤️‍🔥',rarity:'rare',
    desc:'체력이 낮을수록 회피 속도 <b>최대 +300%</b>',
    effects:Object.freeze([Object.freeze({
      id:'desperate-dodge-speed',type:'trigger',event:'resource.changed',
      modules:Object.freeze([Object.freeze({
        type:'modifier.set',stat:'dodgeSpeed',
        valueRef:Object.freeze({type:'missing-health-ratio',from:0,to:3}),
        key:'desperate-dodge-speed'
      })])
    })])
  }),
  Object.freeze({
    id:'rapid_attack',name:'속공',emoji:'⏩',rarity:'rare',
    desc:'공격 연사속도 <b>+20%</b>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'attackRate',value:.20})
    ])
  }),
  Object.freeze({
    id:'last_stand',
    name:'최후의 발악',
    emoji:'💀',
    rarity:'epic',
    nonStackable:true,
    desc:'사망할 피해를 받을 때 <b>체력 1을 남기고 버티며</b> 주변 적 강한 넉백',
    effects:Object.freeze([
      Object.freeze({
        id:'survive',
        type:'trigger',
        event:'before-defeat',
        priority:100,
        tags:Object.freeze(['생존']),
        conditions:Object.freeze([
          Object.freeze({type:'usage.available',limit:1})
        ]),
        modules:Object.freeze([
          Object.freeze({
            type:'defeat.prevent',
            health:1,
            protectDamageBatch:true,
            protectDuration:80
          }),
          Object.freeze({
            type:'attack.trigger',
            attack:Object.freeze({
              id:'trigger.survival-knockback',
              damageRatio:0,
              cost:0,
              cd:0,
              range:220,
              effectsOnly:true,
              modules:Object.freeze([
                Object.freeze({
                  type:'delivery.area',
                  shape:'circle',
                  range:220,
                  wallPolicy:'ignore'
                }),
                Object.freeze({
                  type:'movement.knockback',
                  target:'hit-target',
                  direction:'away-from-source',
                  distance:180,
                  speed:18,
                  oncePerExecution:true
                })
              ])
            })
          }),
          Object.freeze({type:'usage.consume'})
        ])
      })
    ])
  }),
  Object.freeze({
    id:'poison',
    name:'독',
    emoji:'☠️',
    rarity:'epic',
    desc:'피해 적중 시 2초간 <b>입힌 피해의 15%/초 독</b>, 피해량 <r>-10%</r>',
    effects:Object.freeze([
      Object.freeze({
        id:'poison-on-hit',
        type:'trigger',
        event:'damage-dealt',
        tags:Object.freeze(['지속 피해']),
        conditions:Object.freeze([
          Object.freeze({type:'impact.direct'}),
          Object.freeze({type:'attack.tag-absent',tag:'반사 피해'})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'value.read',source:'executionHealthDamage'}),
          Object.freeze({type:'value.multiply',value:.15}),
          Object.freeze({type:'value.divide-by-target-max-health'}),
          Object.freeze({
            type:'status.apply',
            status:'poison',
            duration:2000,
            data:Object.freeze({mode:'percent',interval:1000,tickAtEnd:true,stackMode:'replace-source'}),
            valueFromPipeline:true
          })
        ])
      }),
      Object.freeze({type:'modifier.constant',stat:'damage',value:-.10})
    ])
  }),
  Object.freeze({
    id:'berserker',
    name:'버서커',
    emoji:'🔥',
    rarity:'epic',
    desc:'피해 1당 <b>스테미나 2 회복</b>',
    effects:Object.freeze([
      Object.freeze({
        id:'stamina-on-damaged',
        type:'trigger',
        event:'damage-received',
        modules:Object.freeze([
          Object.freeze({type:'value.read',source:'healthDamage'}),
          Object.freeze({type:'value.multiply',value:2}),
          Object.freeze({type:'resource.restore',resource:'stamina',recipient:'target'})
        ])
      })
    ])
  }),
  Object.freeze({
    id:'stun_shot',
    name:'스턴샷',
    emoji:'🌀',
    rarity:'epic',
    desc:'<b>4초</b>마다 다음 평타 적중 시 <b>0.3초 기절</b>',
    effects:Object.freeze([
      Object.freeze({
        id:'charge',
        type:'cooldown',
        duration:4000,
        startCharged:false,
        presentation:Object.freeze({type:'charge-bar'})
      }),
      Object.freeze({
        id:'stun-on-hit',
        type:'trigger',
        event:'damage-dealt',
        conditions:Object.freeze([
          Object.freeze({type:'impact.direct'}),
          Object.freeze({type:'attack.tag',tag:'평타'}),
          Object.freeze({type:'cooldown.ready',cooldownId:'charge'})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'status.apply',status:'stun',duration:300,durationPerStack:true}),
          Object.freeze({
            type:'cooldown.consume',
            cooldownId:'charge',
            oncePerExecution:true
          })
        ])
      })
    ])
  }),
  Object.freeze({
    id:'start_boost',name:'스타트 부스터',emoji:'⭐',rarity:'epic',
    desc:'라운드 시작 7초간 이동속도 <b>+40%</b>, 피해량 <b>+30%</b>',
    effects:Object.freeze([Object.freeze({
      id:'round-start-boost',type:'trigger',event:'augment.rebuilt',
      modules:Object.freeze([
        Object.freeze({type:'modifier.set',stat:'speed',value:.40,duration:7000,key:'round-start-speed'}),
        Object.freeze({type:'modifier.set',stat:'damage',value:.30,duration:7000,key:'round-start-damage'})
      ])
    })])
  }),
  Object.freeze({
    id:'revival',name:'부활',emoji:'👻',rarity:'epic',
    desc:'사망 시 <b>1초 후 부활</b><br>체력 <r>-40%</r>',
    effects:Object.freeze([
      Object.freeze({type:'modifier.constant',stat:'maxHealth',value:-.40}),
      Object.freeze({
        id:'delayed-revival',type:'trigger',event:'before-defeat',
        conditions:Object.freeze([
          Object.freeze({type:'usage.available',limit:1,limitPerStack:true}),
          Object.freeze({type:'defeat.replacement-available',negate:true})
        ]),
        modules:Object.freeze([
          Object.freeze({type:'survival.revive-delay',delay:1000}),
          Object.freeze({type:'usage.consume'})
        ])
      })
    ])
  }),
  Object.freeze({
    id:'charged_counter',name:'충전 반격',emoji:'🔄',rarity:'epic',
    desc:'반격기 획득량 <b>+1</b>, 새 반격기 획득 시 보유 반격기 <b>활성 시간 초기화</b><br>최대 스테미나 <r>-20%</r>',
    effects:Object.freeze([
      Object.freeze({
        type:'counter.stock',
        acquireBonusPerStack:1,
        capacityBonusPerStack:1,
        presentation:Object.freeze({type:'stock-segments'})
      }),
      Object.freeze({type:'modifier.constant',stat:'maxStamina',value:-.20})
    ])
  })

]);