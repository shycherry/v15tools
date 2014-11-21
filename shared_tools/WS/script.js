var _wsList;
var _filesToPromoteList;
var _filesToPromoteBtn;
var _promoteShell;
var _promoteShellTask;
var _currentWS;

function updateFilesToPromoteList(iModels){
  _filesToPromoteList.removeAllModels();
  _filesToPromoteList.addModels(iModels);
}

function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _promoteShell = $('#ws-promote-simul-shell')[0];
  _promoteShellTask = $("#ws-promote-shelltask")[0];
  _filesToPromoteBtn = $('#ws-files-to-promote-btn')[0];

  _wsList.on("models_changed", function(){
    _currentWS = _wsList.getModels()[0];
    if(_currentWS){
      _promoteShell.params = {"ws" : _currentWS.name};  
    }
    _filesToPromoteList.removeAllModels();
  });

  _filesToPromoteBtn.onclick = function(){
      _promoteShell.start();
      _filesToPromoteBtn.disabled = true;
  }
  
  _promoteShellTask.completeCallback = function(err, data){
    var models = vt. magicGetModelsFromText(data);
    updateFilesToPromoteList(models);
    _filesToPromoteBtn.disabled = false;
  }
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
