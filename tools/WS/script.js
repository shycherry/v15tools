function makeWSList(){
  var models = vt.findModels({type:'WS'}); 
  for(var idx in models){
    var model = models[idx];
    $('#ws-list').append(makeWSGui(model));
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
            $('#ws-list').append(makeWSGui(model));
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
