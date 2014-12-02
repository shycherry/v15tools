var _wsList;
var _filesToPromoteList;
var _filesToPromoteBtn;
var _promoteButtonBatch;
var _promoteShellTask;
var _currentWS;

function updateFilesToPromoteList(iModels){
  _filesToPromoteList.removeAllModels();
  _filesToPromoteList.addModels(iModels);
}

function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _promoteButtonBatch = $('#ws-promote-simul-buttonbatch')[0];
  _promoteShellTask = $("#ws-promote-shelltask")[0];

  _wsList.on("models_changed", function(){
    _currentWS = _wsList.getModels()[0];
    if(_currentWS){
      _promoteButtonBatch.params = {"ws" : _currentWS.name};  
    }
    _filesToPromoteList.removeAllModels();
  });

  _promoteButtonBatch.addEventListener('task_finished', function(ev){
    if(ev.detail.src && ev.detail.src.id == 'ws-promote-shelltask'){
      var models = vt. magicGetModelsFromText(ev.detail.data);
      updateFilesToPromoteList(models);
    }
  });
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
