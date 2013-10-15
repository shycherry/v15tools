var async = require('async');
var cp = require('child_process');
var uuid = require('uuid');
var Shell = require('./shell').Shell;
var _StartTransactionMarker = 'V15TStart_';
var _EndTransactionMarker = 'V15TEnd_';

/*
* events : drain, shell_created
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(ShellManager, EventEmitter);

function ShellManager(iConfig){
  this._config = iConfig;
  this._shells = [];
  this.init();
}

ShellManager.prototype.getShells = function(){
  return this._shells;
}

ShellManager.prototype.worker = function(iTask, iCallback){  
  var shell = iTask['shellManager'].getShellFor(iTask['ownerUuid']);  
  shell.write(_StartTransactionMarker+iTask['uuid']+'\n');
  shell.write(iTask.command+'\n');
  shell.write(_EndTransactionMarker+iTask['uuid']+'\n');
  
  var dataBuffer='';
  shell.on('data', function(data){
    dataBuffer += data.toString();
    if(RegExp(_EndTransactionMarker+iTask['uuid']).test(data)){
      if(iTask['releaseAtEnd']){
        shell.setOwner(null);
      }
      
      iCallback(null, dataBuffer);      
    }
  });
};

ShellManager.prototype.getShellFor = function(iOwnerUuid){
  //previously owned shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(shell.getOwner() == iOwnerUuid){
      return shell;
    }    
  }

  //existing non owned shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(!shell.getOwner()){
      return shell;
    }    
  }

  //new shell
  if(this._shells.length < this._config.max_shells){
    var newShell = new Shell();    
    newShell.setOwner(iOwnerUuid);
    this._shells.push(newShell);
    this.emit('shell_created', newShell);
    return newShell;
  }
};

ShellManager.prototype.enqueue = function(iTask){  
  iTask['shellManager'] = this;
  var task = new Task(iTask);
  this._queue.push(task, task.callback);
};

ShellManager.prototype.init = function(){
  var self = this;
  this._queue = new async.queue(ShellManager.prototype.worker, this._config.max_shells);
  this._queue.drain = function(){self.emit('drain');};
  this._queue.saturated = function(){console.log('all processes occupied');};
};


function Task(iTask){
  this.shellManager = iTask['shellManager'];  
  this.callback = (iTask['callback']!=undefined)?iTask['callback']: function(err, result){
    console.log(err);
    console.log(result);
  };
  this.releaseAtEnd = (iTask['releaseAtEnd']!=undefined)? iTask['releaseAtEnd'] : true;
  this.command = (iTask['command']!=undefined)? iTask['command'] : 'echo pas de commande';
  this.uuid = (iTask['uuid']!=undefined)? iTask['uuid'] : uuid.v1();
  this.ownerUuid = (iTask['ownerUuid']!=undefined)? iTask['ownerUuid'] : this.uuid;  
}

exports.ShellManager = ShellManager;
