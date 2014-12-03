var _fromWSDropZone;
var _toWSDropZone;
var _filesDropZone;
var _importButtonBatch;
var _importFilesBatch;

var _currentFromWS;
var _currentToWS;

function updateParams(){
  _importButtonBatch.params = {
    "ws_from" : _currentFromWS ? _currentFromWS.name : '',
    "ws_to" : _currentToWS ? _currentToWS.name : ''
  };
}

function updateFilesToImport(iFiles){
  while(_importFilesBatch.firstChild){
    _importFilesBatch.removeChild(_importFilesBatch.firstChild);
  }

  for (var i = 0; i < iFiles.length; i++) {
    var currentFile = iFiles[i];
    var importTask = document.createElement('vt-shelltask');
    importTask.command = "adl_import -op -from [ws_from] "+currentFile.path;
    _importFilesBatch.appendChild(importTask);
  }

}

function bindGui(){
  _fromWSDropZone = makeMultiDroppableZone($('#import-from-ws-list'), vt.Types.WS, 1);
  _toWSDropZone = makeMultiDroppableZone($('#import-to-ws-list'), vt.Types.WS, 1);
  _filesDropZone = makeMultiDroppableZone($('#import-files-list'), vt.Types.FILE);
  _importButtonBatch = $('#import-files-buttonbatch')[0];
  _importFilesBatch = $('#import-files-shellbatch')[0];


  _fromWSDropZone.on("models_changed", function(){
    _currentFromWS = _fromWSDropZone.getModels()[0];
    updateParams();
  });

  _toWSDropZone.on("models_changed", function(){
    _currentToWS = _toWSDropZone.getModels()[0];
    updateParams();
  });

  _filesDropZone.on("models_changed", function(){
    updateFilesToImport(_filesDropZone.getModels());
    updateParams();
  });

}

exports.load = function(){
  bindGui();
}

exports.reload = function(){

}
