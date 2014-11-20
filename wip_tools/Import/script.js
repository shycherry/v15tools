var _fromWSDropZone;
var _toWSDropZone;
var _filesDropZone;

function bindGui(){
  _fromWSDropZone = makeMultiDroppableZone($('#import-from-ws-list'), vt.Types.WS, 1); 
  _toWSDropZone = makeMultiDroppableZone($('#import-to-ws-list'), vt.Types.WS, 1);
  _filesDropZone = makeMultiDroppableZone($('#import-files-list'), vt.Types.FILE);
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
  
}
