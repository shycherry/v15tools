var fs = require('fs');
var ShellManager = require('./shellmanager').ShellManager;
var Tool = require('./tool').Tool;

var _config = {
  max_shells: 2
};

function _init(){
  _shellManager = new ShellManager(_config);
  _shellManager.on('drain', function(){console.log('drained !');});
  _shellManager.on('shell_created', function(shell){console.log('created!'); console.log(shell);});
}

function setConfig(iConfig){
  for(var idx in iConfig){
    _config[idx] = iConfig[idx];
  }
  _init();
}

/*
iTask = {
  shellManager,
  [callback],
  [releaseAtEnd],
  [uuid],
  [ownerUuid]
}
*/
function call(iTask){
  _shellManager.enqueue(iTask);
}

function getShells(){
  return _shellManager.getShells();
}

function getWSPath(iWSName, iCallback){
  var task = {
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile SCMV5 && adl_ds_ws '+iWSName,
    callback : function(err, data){
      if(iCallback){
        iCallback(null, /WINDOWS.+(\\\\.+)/.exec(data)[1]);
      }
    }
  };
  _shellManager.enqueue(task);
}

function loadTools(iCallback){
  fs.readdir('./tools', function(err, files){
    if(err){
      iCallback(err, null);
      return;
    }
    var tools = [];
    for(var idx in files){
      var currentToolName = files[idx];
      if(fs.existsSync('./tools/'+currentToolName+'/layout.html')){
        var newTool = new Tool({
          'pathToDir': './tools/'+currentToolName,
          'name': currentToolName
        });
        tools.push(newTool);
      }
    }
    iCallback(null, tools);
  });
}

function findModelInArray(iModel, iArray){
  for(var idxModel in iArray){
    var model = iArray[idxModel];
    for(var prop in iModel){
      if(model.hasOwnProperty(prop) && model[prop] == iModel[prop]){
        return model;
      }
    }
  }
  
}

_init();

exports.V15Tools = {
  setConfig: setConfig,
  call: call,
  getWSPath : getWSPath,
  getShells: getShells,
  loadTools: loadTools,
  findModelInArray : findModelInArray
};
