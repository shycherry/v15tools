var async = require('async');
var cp = require('child_process');

function Executor(iConfig){
  this._config = iConfig;
  this.init();
}

Executor.prototype.worker = function(iTask, iCallback){
  cp.exec(iTask.command, function(error, stdout, stderr){
    iCallback(error, stdout + stderr);
  });
};

Executor.prototype.requireExistingFreeChildProcess = function(){
  for(var idx in this._processes){
    var process = this._processes[idx];
    if(process.isFree){
      return process.child_process;
    }
  }
};

Executor.prototype.enqueue = function(iTask){
  var callback = (iTask.callback) ? iTask.callback : function(err, result){
    console.log(err);
    console.log(result);
  };
  this._queue.push(iTask, callback);
};

Executor.prototype.init = function(){
  this._queue = new async.queue(Executor.prototype.worker, this._config.max_processes);
  this._queue.drain = function(){console.log('all done.');};
  this._queue.saturated = function(){console.log('all processes occupied');};
};

exports.Executor = Executor;
