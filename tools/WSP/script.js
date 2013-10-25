var Models = require('../../v15core/Models');
exports.listWSPs = function(){
  var newWSP = new Models.WSP();
  newWSP.name="NMMR208";
  $('#wsp-list').append(makeWSPGui(newWSP));
}
