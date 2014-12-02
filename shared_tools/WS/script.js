var _wsList;
var _filesToPromoteList;
var _filesToPromoteBtn;
var _promoteButtonBatch;
var _initShellTask;
var _chWsShellTask;
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
  _initShellTask = $("#ws-init-shelltask")[0];
  _chWsShellTask = $("#ws-ch-ws-shelltask")[0];

  _wsList.on("models_changed", function(){
    _currentWS = _wsList.getModels()[0];
    if(_currentWS){
      _promoteButtonBatch.params = {"ws" : _currentWS.name};
      _chWsShellTask.activated = true;
    }
  });

  _promoteButtonBatch.addEventListener('task_finished', function(ev){
    if(!ev.detail.src && ev.detail.src.id)
      return;
    
    var sourceId = ev.detail.src.id;

    if(sourceId == 'ws-promote-shelltask'){
      var models = vt. magicGetModelsFromText(ev.detail.data);
      updateFilesToPromoteList(models);
    }else if(sourceId == 'ws-init-shelltask'){
      _initShellTask.activated = false;
    }else if(sourceId == 'ws-ch-ws-shelltask'){
      _chWsShellTask.activated = false;
    }
  });
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
