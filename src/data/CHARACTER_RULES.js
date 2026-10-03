

const CHARACTER_RULES=freezeCharacterData({
  styles: {"1": "파워형", "2": "기동형", "3": "지속전투형", "4": "차징형", "5": "조건형", "6": "반격형", "7": "성장형", "8": "범위장악형", "9": "행동제약형"},
  moveLabels: {"shubi":"보통", "ruvu":"보통", "miaruky":"느림", "mainmad":"빠름", "mehugu":"보통", "lian":"빠름", "tau":"빠름", "veleu":"매우 빠름", "elin":"느림", "nsonya":"매우 빠름", "maisil":"빠름", "erapabi":"빠름", "reika":"느림", "shairaz":"느림", "phase":"보통", "kan":"매우 빠름", "cherity":"보통", "konyeong":"빠름", "herjang":"보통", "hatsuhats":"보통", "prill":"보통", "dazbin":"빠름", "yui":"빠름", "peluna":"빠름", "sherina":"느림", "sya":"매우 빠름", "runef":"보통", "roon":"빠름", "intu":"빠름", "meramona":"보통", "tadta":"매우 느림", "nanamnang":"느림", "raise":"빠름", "levina":"매우 빠름", "ki":"빠름", "sor":"보통", "jerry":"느림", "ruli":"보통", "lete":"빠름", "clea":"빠름", "shello":"빠름", "tinya":"느림", "lime":"보통", "quri":"보통", "hapupu":"매우 빠름", "atsuteo":"보통", "nare":"빠름", "kines":"보통", "ezrail":"보통", "nyu":"매우 빠름", "gae":"느림", "cyien":"빠름", "kanon":"빠름", "deltroove":"빠름", "xianelli":"빠름", "ban":"빠름", "sherbet":"보통", "dira":"보통"},
  roles: {"1": "딜러", "2": "저격수", "3": "탱커", "4": "서포터", "5": "컨트롤러", "6": "암살자"},
  ranges: [
    {id: 1, maxInclusive: 150, tag: "초근거리"},
    {id: 2, maxInclusive: 350, tag: "근거리"},
    {id: 3, maxInclusive: 750, tag: "중거리"},
    {id: 4, maxInclusive: 1000, tag: "원거리"},
    {id: 5, maxInclusive: Infinity, tag: "초장거리"}
  ],
  difficulty: {
    min: 1,
    max: 6,
    default: 3,
    normalStars: 5,
    specialLevel: 6,
    labels: {"아주 쉬움": 1, "쉬움": 2, "보통": 3, "어려움": 4, "매우 어려움": 5, "최상": 5}
  },
  statusDefaults: {
    freeze: {ratio: 0.05, interval: 1000},
    burn: {flat: 50, interval: 500},
    bleed: {ratio: 0.05, interval: 1000},
    zap: {staminaRegenMultiplier: 0.6},
    slow: {factor: 0.5},
    poison: {interval: 1000, value: 0.01}
  }
});