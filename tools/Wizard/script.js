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
    
    matchs = regexFwModFile.exec(iText);
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

function magicGetModelsFromPath(iPath){
  var workingPath = iPath.replace('/', '\\');
  var tabPath = workingPath.split('\\');
  
  var wsIndex = -1;
  var modIndex = -1;
  var fwIndex = -1;

  var idcardIndex = -1;
  var fwInterfacesIndex = -1;
  var functionTestsIndex = -1;

  //try path with module
  modIndex = findModuleIndex(tabPath);
  if(modIndex != -1){
    wsIndex = modIndex - 2;
    fwIndex = modIndex - 1;
  }else{
    //try path with a (public,private,protected)Interfaces
    fwInterfacesIndex = findFWInterfaces(tabPath);
    if(fwInterfacesIndex != -1){
      wsIndex = fwInterfacesIndex - 2;
      fwIndex = fwInterfacesIndex -1;
    }else{
      //try path with FunctionTests
      functionTestsIndex = findFunctionTestsIndex(tabPath);
      if(functionTestsIndex != -1){
        wsIndex = functionTestsIndex -2;
        fwIndex = functionTestsIndex -1;
      }else{
        //try path with IdentityCard
        idcardIndex = findIdCardIndex(tabPath);
        if(idcardIndex != -1){
          wsIndex = idcardIndex -2;
          fwIndex = idcardIndex -1;
        }
      }
    }
  }

  if(fwIndex != -1){
    var fwPathTab = tabPath.slice(fwIndex, fwIndex+1);
    if(modIndex != -1){
      var modPathTab = tabPath.slice(fwIndex, modIndex+1);
    }
    var filePathTab = tabPath.slice(fwIndex);
  }else{
    //fullpath
  }
  

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
};

exports.reload = function(){
};