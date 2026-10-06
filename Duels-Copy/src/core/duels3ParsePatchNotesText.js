
function duels3ParsePatchNotesText(text){
  const result={version:'',date:'',features:[],balance:[],bugfixes:[]};
  let section='',currentGroup=null;
  String(text||'').split(/\r?\n/).forEach(raw=>{
    const line=raw.trim(); if(!line)return;
    const heading=line.replace(/^#+\s*/, '').replace(/[:：]$/, '').trim();
    if(/^(추가 기능|추가|신규 기능|features?|additions?)$/i.test(heading)){section='features';currentGroup=null;return;}
    if(/^(밸런스 조정|밸런스|balance(?: changes?)?)$/i.test(heading)){section='balance';currentGroup=null;return;}
    if(/^(버그 수정|버그|bug ?fixes?|fixes)$/i.test(heading)){section='bugfixes';currentGroup=null;return;}
    if(section){
      const m=line.match(/^>\s*(.+)$/);
      if(m&&section!=='features'){currentGroup={character:m[1].trim(),changes:[]};result[section].push(currentGroup);return;}
      const change=line.replace(/^[-*•]\s*/, '').trim();
      if(currentGroup&&section!=='features')currentGroup.changes.push(change); else result[section].push({character:'',changes:[change]});
    }else if(!result.version)result.version=heading;
  });
  return result;
}