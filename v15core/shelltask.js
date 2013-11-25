var globId = 0;

/*
* events: change_status (enqueued, canceled, working, dropped)
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(ShellTask, EventEmitter);

function ShellTask(iInfos){
  EventEmitter.prototype.constructor.call(this);
  this.vid = 'ShellTask_'+globId;
  globId++;
  
  if(iInfos){
    this.completeCallback = iInfos.completeCallback;
    
    this.stdoutCallback = iInfos.stdoutCallback;

    this.stderrCallback = iInfos.stderrCallback;

    this.userCallback = iInfos.userCallback;

    this.releaseAtEnd = (iInfos.releaseAtEnd !== undefined)? iInfos.releaseAtEnd : true;
    this.command = (iInfos.command !== undefined)? iInfos.command : 'echo pas de commande';
    this.requiredShellVID = iInfos.requiredShellVID;
  }
  
}

ShellTask.prototype.setStatus = function(iStatus) {
  var oldStatus = this.status;
  this.status = iStatus;

  if(oldStatus != this.status){
    this.emit('change_status', iStatus);
  }
    
};

ShellTask.prototype.getStatus = function(){
  return this.status;
};

exports.ShellTask = ShellTask;
