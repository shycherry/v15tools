var _dropZone;

function makeWSList(){
  if(_dropZone){
    _dropZone.clearModels();
    var models = vt.findModels(null, vt.Types.ItemPath);
    if(models){
      _dropZone.addModels(models);  
    }  
  }  
}


function bindGui(){
  $('#ws-btn-retrieve-from-name').button().click(function(){
    var wsName = $('#ws-input-name').val();
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

  $('#ws-btn-create-dummy-with-name').button().click(function(){
    var wsName = $('#ws-input-name').val();
    if(wsName.length != 0){
      var model = vt.createModel({type:vt.Types.WS.name ,name:wsName});
      if(model && _dropZone){
        _dropZone.addModel(model);
      }
    }
  });

   _dropZone = makeMultiDroppableZone($('#ws-list'));
}

exports.load = function(){
  bindGui();
  exports.reload();
}

exports.reload = function(){
  makeWSList();
}