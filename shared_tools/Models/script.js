var _dropZone;

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
  $('#models-ws-btn-retrieve-from-name').click(function(){
    var wsName = $('#models-ws-input-name').val();
    if(wsName.length != 0){
      var wsPath = vt.getWSPath(wsName, function(err, data){
        if(!err){
          var amorceModel = 
          {
            type: vt.Types.WS.name,
            name : wsName,
            path : data
          }
          var model = vt.createModel(amorceModel);
          if(model && _dropZone){
            _dropZone.addModel(model);
          }
        }
      });
    }
  });

  _dropZone = makeMultiDroppableZone($('#models-ws-list'));
}

exports.load = function(){
  bindGui();
  exports.reload();
}

exports.reload = function(){
  makeWSList();
}