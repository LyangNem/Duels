
function characterCount(path,types=null){
  return types?{$count:path,$types:types}:{$count:path};
}