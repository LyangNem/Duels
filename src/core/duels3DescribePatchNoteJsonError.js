
function duels3DescribePatchNoteJsonError(error,text){
  const message=String(error?.message||'JSON 문법 오류');const match=message.match(/position\s+(\d+)/i);
  if(!match)return `패치노트 JSON 문법 오류: ${message}`;
  const position=Math.max(0,Number(match[1])||0),before=String(text||'').slice(0,position),line=before.split(/\r?\n/).length,lastBreak=Math.max(before.lastIndexOf('\n'),before.lastIndexOf('\r')),column=position-lastBreak;
  return `패치노트 JSON 문법 오류: ${line}번째 줄 ${column}번째 칸`;
}