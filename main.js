var Executor = require('./commandline').Executor;

var _config = {
  max_processes: 2
};

function _init(){
  _executor = new Executor(_config);
}

function setConfig(iConfig){
  for(var idx in iConfig){
    _config[idx] = iConfig[idx];
  }
  _init();
}

function call(iCommand, iCallback){
  _executor.enqueue({
    command: iCommand,
    callback: iCallback
  });
}

_init();

exports.V15Tools = {
  setConfig: setConfig,
  call: call
};
