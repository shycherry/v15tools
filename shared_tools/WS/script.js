var _wsList;
var _filesToPromoteList;
var _filesToPromoteBtn;
var _promoteButtonBatch;
var _initShellTask;
var _chWsShellTask;
var _promoteShellTask;
var _currentWS;


function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _filesToPromoteList[0].hidden = true;
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

  _filesToPromoteList.on("models_changed", function(){
    if(_filesToPromoteList.getModels().length){
      _filesToPromoteList[0].hidden = false;
    }else{
      _filesToPromoteList[0].hidden = true;
    }
  });

  _promoteButtonBatch.addEventListener('task_finished', function(ev){
    if(!ev.detail.src || !ev.detail.src.id)
      return;

    var sourceId = ev.detail.src.id;

    if(sourceId == _promoteShellTask.id){
      var models = vt. magicGetModelsFromText(ev.detail.data);
      _filesToPromoteList.addModels(models);
    }else if(sourceId == _initShellTask.id){
      _initShellTask.activated = false;
    }else if(sourceId == _chWsShellTask.id){
      _chWsShellTask.activated = false;
    }
  });

  _promoteButtonBatch.addEventListener('click', function(ev){
    if(!ev.detail.src || !ev.detail.src.id)
      return;

    var sourceId = ev.detail.src.id;

    if(sourceId == _promoteButtonBatch.id){
      _filesToPromoteList.removeAllModels();
    }
  });
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
