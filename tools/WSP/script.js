exports.listWSPs = function(){
  var models = vt.findModels({type:'WSP'}); 
  for(var idx in models){
    var model = models[idx];
    $('#wsp-list').append(makeWSPGui(model));
  }
  
}
