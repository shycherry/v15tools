var _dropZone;

function makeWSList(){  
  var models = vt.findModels(null, vt.Types.ItemPath);
  if(models && _dropZone){
    _dropZone.addSharedItems(models);  
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
            _dropZone.addSharedItem(model);
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
        _dropZone.addSharedItem(model);
      }
    }
  });

   _dropZone = makeMultiDroppableZone($('#ws-list'));
}

exports.init = function(){
  bindGui();
  makeWSList();
}
