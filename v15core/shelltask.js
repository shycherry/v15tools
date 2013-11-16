var globId = 0;

/*
* events: change_status
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(ShellTask, EventEmitter);

function ShellTask(iInfos){
  this.vid = 'ShellTask_'+globId;
  globId++;  
  
  this.status = 'created';
  this.callback = (iInfos.callback!=undefined)?iInfos.callback: function(err, result){
    console.log(err);
    console.log(result);
  };
  this.releaseAtEnd = (iInfos.releaseAtEnd!=undefined)? iInfos.releaseAtEnd : true;
  this.command = (iInfos.command!=undefined)? iInfos.command : 'echo pas de commande';    
  this.requiredShellVID = iInfos.requiredShellVID;
}

ShellTask.prototype.setStatus = function(iStatus) {
  this.status = iStatus;
  this.emit('change_status', iStatus);
};

ShellTask.prototype.getStatus = function(){
  return this.status;
}

exports.ShellTask = ShellTask;
