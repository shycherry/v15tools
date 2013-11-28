function makeWSList(){
  var amorceModel = {};
  amorceModel[vt.Types.ItemPath] = 1;
  var models = vt.findModels(amorceModel);
  for(var idx in models){
    var model = models[idx];
    $('#ws-list').append(makeModelGui(model));
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
            type:'WS',
            name : wsName,
            absolute : data
          }
          var model = vt.createModel(amorceModel);
          if(model){
            $('#ws-list').append(makeModelGui(model));
          }
        }
      });
    }
  });
}

exports.init = function(){
  bindGui();
  makeWSList();
}
