var ShellManager = require('./shellmanager').ShellManager;

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
  }
  _shellManager.enqueue(task);
}

_init();

exports.V15Tools = {
  setConfig: setConfig,
  call: call,
  getWSPath : getWSPath,
  getShells: getShells
};
