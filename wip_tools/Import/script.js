var _fromWSDropZone;
var _toWSDropZone;
var _filesDropZone;
var _importShell;
var _importFilesBtn;
var _currentFromWS;
var _currentToWS;

function updateShellParams(){
  _importShell.params = {
    "ws_from" : _currentFromWS ? _currentFromWS.name : '',
    "ws_to" : _currentToWS ? _currentToWS.name : ''
  };
}

function bindGui(){
  _fromWSDropZone = makeMultiDroppableZone($('#import-from-ws-list'), vt.Types.WS, 1); 
  _toWSDropZone = makeMultiDroppableZone($('#import-to-ws-list'), vt.Types.WS, 1);
  _filesDropZone = makeMultiDroppableZone($('#import-files-list'), vt.Types.FILE);
  _importShell = $('#import-shell')[0];
  _importFilesBtn = $('#import-btn-go')[0];

  _fromWSDropZone.on("models_changed", function(){
    _currentFromWS = _fromWSDropZone.getModels()[0];
    updateShellParams();
  });

  _toWSDropZone.on("models_changed", function(){
    _currentToWS = _toWSDropZone.getModels()[0];
    updateShellParams();
  });

  _importFilesBtn.onclick = function(){
    _importShell.start();
  }

}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
  
}
