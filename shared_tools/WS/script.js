var _wsList;
var _filesToPromoteList;

function updateFilesToPromoteList(){

  if(_filesToPromoteList){
    _filesToPromoteList.removeAllModels();
  }  
  var promoteShell = $('#ws-promote-simul-shell')[0];
  if (promoteShell)
  {
    promoteShell.start();
    console.log('wesh')
  }
}


function bindGui(){
  $('#ws-files-to-promote-btn').click(function(){
    updateFilesToPromoteList();
  });
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
