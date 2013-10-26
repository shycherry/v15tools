exports.listWSPs = function(){
  var model = vt.findModelInCache({name:'NMMR208'});  
  $('#wsp-list').append(makeWSPGui(model));
}
