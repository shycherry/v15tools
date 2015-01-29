var _dropZone;
var _retrieveWSFromNameButtonBatch;
var _modelsInitShellTask;
var _modelsDsWSShellTask;

function makeWSList(){
  if(_dropZone){
    _dropZone.removeAllModels();
    var models = vt.findModels(function(iModel){
      return (iModel instanceof vt.Types.WS);
    });
    if(models){
      _dropZone.addModels(models);
    }
  }
}


function bindGui(){
  _dropZone = makeMultiDroppableZone($('#models-ws-list'));
  _retrieveWSFromNameButtonBatch = document.querySelector('#models-ws-btn-retrieve-from-name');
  _modelsInitShellTask = document.querySelector('#models-init-shelltask');
  _modelsDsWSShellTask = document.querySelector('#models-ds-ws-shelltask');
  _modelsWsInputName = document.querySelector('#models-ws-input-name');

  _modelsWsInputName.addEventListener('keyup', function(){
    var wsName = _modelsWsInputName.value;
    _retrieveWSFromNameButtonBatch.params = wsName.length ? {'ws_name' :  wsName} : {};
  })

  _retrieveWSFromNameButtonBatch.addEventListener('task_finished', function(ev){
    if(!ev.detail.src || !ev.detail.src.id)
      return;

    var source = ev.detail.src;
    var sourceId = ev.detail.src.id;

    if(sourceId == _modelsInitShellTask.id){
      _modelsInitShellTask.activated = false;
    }

    if(sourceId == _modelsDsWSShellTask.id){
      var winImagePathMatch = /WINDOWS.+(\\\\.+)/i.exec(ev.detail.data);
      if(!winImagePathMatch){
        //error
        return;
      }
      winImagePathMatch = winImagePathMatch[1];
      var amorceModel = {
        type: vt.Types.WS.name,
        name : source.params['ws_name'],
        path : winImagePathMatch
      }
      var model = vt.createModel(amorceModel);
      if(model && _dropZone){
        _dropZone.addModel(model);
      }
    }

  });
}

exports.load = function(){
  bindGui();
  exports.reload();
}

exports.reload = function(){
  makeWSList();
}