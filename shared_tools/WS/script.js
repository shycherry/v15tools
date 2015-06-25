var _wsList;
var _filesToPromoteList;
var _filesToPromoteBtn;
var _promoteButtonBatch;
var _currentWS;

function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _filesToPromoteList[0].hidden = true;
  _chWsButtonBatch = $('#ws-ch-ws-buttonbatch')[0];
  _promoteButtonBatch = $('#ws-promote-simul-buttonbatch')[0];
  _promoteButtonBatch.setWorker(_chWsButtonBatch.getWorker());

  reloadWS();

  function reloadWS(){
    _currentWS = _wsList.getModels()[0];
    _chWsButtonBatch.params  = _currentWS ? {"ws":_currentWS.name} : {};
    _promoteButtonBatch.params = {};
  }

  _wsList.on("models_changed", function(){
    reloadWS();
  });

  _filesToPromoteList.on("models_changed", function(){
    if(_filesToPromoteList.getModels().length){
      _filesToPromoteList[0].hidden = false;
    }else{
      _filesToPromoteList[0].hidden = true;
    }
  });

  _promoteButtonBatch.addEventListener('batch_started', function(ev){
    _filesToPromoteList.removeAllModels();
  });

  _promoteButtonBatch.setTaskFinishedCallback('ws-promote-simul-shelltask', function(ev){
    var models = vt. magicGetModelsFromText(ev.detail.data);
    _filesToPromoteList.addModels(models);
  });

  _chWsButtonBatch.addEventListener('batch_started', function(ev){
    _promoteButtonBatch.params = {};
  });

  _chWsButtonBatch.setTaskFinishedCallback("ws-ch-ws-shelltask", function(ev){
    _chWsButtonBatch.disable();
    _promoteButtonBatch.params = _currentWS ? {"ws" : _currentWS.name} : {};
  });

}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
