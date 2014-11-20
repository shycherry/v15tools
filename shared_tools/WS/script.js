var _wsList;
var _filesToPromoteList;
var _promoteShell;
var _currentWS;

function updateFilesToPromoteList(){
  if(_filesToPromoteList)
    _filesToPromoteList.removeAllModels();

  if (_promoteShell){
    if(_currentWS){
      _promoteShell.params = {"test" : _currentWS.name};  
    }
    _promoteShell.start();
  }
}


function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _promoteShell = $('#ws-promote-simul-shell')[0];
  
  _wsList.on("models_changed", function(){
    _currentWS = _wsList.getModels()[0];
    updateFilesToPromoteList();
  });

  $('#ws-files-to-promote-btn').click(updateFilesToPromoteList);
  $("#ws-promote-shelltask")[0].completeCallback = function(err, data){
    console.log("completeCallback: ",data);
  }
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
