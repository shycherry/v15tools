var Path = require('path');
var _dropZone;

function makeModelsList(iModels){
  if(_dropZone){
    _dropZone.removeAllModels();
    if(iModels){
      _dropZone.addModels(iModels);
    }
  }
}

function magicGetModelsFromText(iText){
  var regexPathWithExt = /.:[\w\/\\.]+\.[\w]+|[\w\/\\.]+\.[\w]+[\w\/\\.]*[\\][\w\/\\.]*|.:[\w\/\\.]*[\\][\w\/\\.]*/gim;
  var models = [];
  
  var matchs;
  do{    
    matchs = regexPathWithExt.exec(iText);
    if(matchs){
      var currentModels = magicGetModelsFromPath(matchs[0]);
      for(var idx in currentModels){
        models.push(currentModels[idx]);
      }
    }
  }while(matchs);

  return models;
}

function findInTab(iTab, iRegex){
  if(iRegex){
    var matchs;
    for(var idx = 0; idx <= iTab.length; idx++){
      matchs = iRegex.exec(iTab[idx]);
      if(matchs){
        return idx;
      }
    }
  }  
  return -1;
}

function findModuleIndex(iTab){
  var modRegex = /.+\.m$/i;
  return findInTab(iTab, modRegex);
}

function findFWInterfacesIndex(iTab){
  var fwRegex = /(public|protected|private)interfaces/i;
  return findInTab(iTab, fwRegex);
}

function findFunctionTestsIndex(iTab){
  var functionTestsRegex = /functiontests/i;
  return findInTab(iTab, functionTestsRegex);
}

function findIdCardIndex(iTab){
  var idCardRegex = /identitycard/i;
  return findInTab(iTab, idCardRegex);
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

  var models = [];

  //try path with module
  modIndex = findModuleIndex(tabPath);
  if(modIndex != -1){
    wsIndex = modIndex - 2;
    fwIndex = modIndex - 1;
  }else{
    //try path with a (public,private,protected)Interfaces
    fwInterfacesIndex = findFWInterfacesIndex(tabPath);
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

  var newModel;
  if(fwIndex != -1){
    var fwPathTab = tabPath.slice(fwIndex, fwIndex+1);
    newModel = vt.createModel({
      type:vt.Types.FW.name,
      path:Path.normalize(fwPathTab.join('\\')),
      name:fwPathTab[0]
    });
    if(newModel){
      models.push(newModel);
    }
    if(modIndex != -1){
      var modPathTab = tabPath.slice(fwIndex, modIndex+1);
      newModel = vt.createModel({
        type:vt.Types.MOD.name,
        path:Path.normalize(modPathTab.join('\\')),
        name:tabPath[modIndex]
      });
      if(newModel){
        models.push(newModel);
      }
    }
    var filePathTab = tabPath.slice(fwIndex);
    var path = Path.normalize(filePathTab.join('\\'));
    newModel = vt.createModel({
      type:vt.Types.FILE.name,
      path:path,
      name:Path.basename(path)
    });
    if(newModel){
      models.push(newModel);
    }    
  }else{
    var path = Path.normalize(workingPath);
    newModel = vt.createModel({
      type:vt.Types.FullPath.name,
      path:path,
      name:Path.basename(path)
    });
    if(newModel){
      models.push(newModel);
    }
  }
  
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
};

exports.reload = function(){
};