


const COMBAT_BUFF_DEFS=Object.freeze({
  damage:Object.freeze({label:'DAMAGE',min:-.90}),
  defense:Object.freeze({label:'DEFENSE',max:.90}),
  speed:Object.freeze({label:'SPEED',min:-.90}),
  regenDelay:Object.freeze({label:'REGEN WAIT',min:-1.00}),
  regenFlat:Object.freeze({label:'REGEN FLAT',limitMode:'flat'}),
  regenPercent:Object.freeze({label:'REGEN %',min:-1}),
  regeneration:Object.freeze({label:'REGEN',limitMode:'flat',debugHidden:true}),
  invulnerable:Object.freeze({label:'INVULNERABLE',limitMode:'flat',toggleOnly:true,presentation:Object.freeze({opacity:.45,outline:'dashed'})}),
  evasionInvulnerable:Object.freeze({label:'EVASION INVULNERABLE',limitMode:'flat',toggleOnly:true,presentation:Object.freeze({opacity:.45,outline:'dashed'})}),
  stealth:Object.freeze({label:'STEALTH',limitMode:'flat',toggleOnly:true,presentation:Object.freeze({opacity:1})}),
  staminaRegen:Object.freeze({label:'STAMINA REGEN',min:-.90}),
  staminaCost:Object.freeze({label:'STAMINA COST',min:-.40}),
  attackRate:Object.freeze({label:'ATTACK SPEED',max:.90}),
  projectileSpeed:Object.freeze({label:'PROJECTILE SPEED',min:-.90}),
  dodgeDistance:Object.freeze({label:'DODGE DISTANCE',min:-1.00}),
  dodgeSpeed:Object.freeze({label:'DODGE SPEED',min:-.90}),
  ccDuration:Object.freeze({label:'CC DURATION',min:-.90}),
  counterWindow:Object.freeze({
    label:'COUNTER WINDOW',
    limitMode:'flat',
    debugHidden:true,
    presentationHidden:true
  }),
  healing:Object.freeze({label:'HEALING',min:-1.00}),
  maxHealth:Object.freeze({label:'MAX HP',min:-.90}),
  maxStamina:Object.freeze({label:'MAX STAMINA',min:-.90}),
  projectileRadius:Object.freeze({label:'PROJECTILE SIZE',min:-.90}),
  wallPass:Object.freeze({label:'WALL PASS',limitMode:'flat',toggleOnly:true})
});