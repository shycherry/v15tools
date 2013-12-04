var Path = require('path');
var _dropZone;

function makeModelsList(iModels){
  if(_dropZone){
    _dropZone.clearModels();    
    if(iModels){
      _dropZone.addModels(iModels);  
    }  
  }  
}

function magicGetModelsFromText(iText){
  var models = [];  
  var regexFwModFile = /([^ (?:\r|\n)]+)(?:\/|\\)([^ \/\\]+\.m)(?:\/|\\)([^ ]+)/gm;
  var matchs;
  do{
    var newModel;
    
    matchs = regexFwModFile.exec(iText)
    if(matchs){
      if(matchs[1]){
        newModel = vt.createModel({
          type:vt.Types.FW.name,
          path:Path.normalize(matchs[1]),
          name:matchs[1]
        });
        if(newModel){
          models.push(newModel);
        }
      }
      if(matchs[2]){
        newModel = vt.createModel({
          type:vt.Types.MOD.name,
          path:Path.normalize(((matchs[1])?matchs[1]+'/':'')+matchs[2]),
          name:matchs[2]
        });
        if(newModel){
          models.push(newModel);
        }
      }
      if(matchs[3]){
        newModel = vt.createModel({
          type:vt.Types.FILE.name,
          path:Path.normalize(((matchs[1])?matchs[1]+'/':'')+((matchs[2])?matchs[2]+'/':'')+matchs[3]),
          name:Path.basename(matchs[3])
        }); 
        if(newModel){
          models.push(newModel);
        }
      }
      
      
    }    
  }while(matchs);
  
  return models;
}


function bindGui(){
  $('#wizz_get_models').button().click(function(){
    var total_input = $('#wizz_input').val();    
    var models = magicGetModelsFromText(total_input);
    makeModelsList(models);
  });
  
   _dropZone = makeMultiDroppableZone($('#wizz_models_list'));
}

exports.load = function(){
  bindGui();  
}

exports.reload = function(){  
}