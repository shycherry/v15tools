var cp = require('child_process');
var Shell = require('./shell').Shell;
var ShellTask = require('./shelltask').ShellTask;

/*
* events : shell_created, shell_locked, shell_unlocked
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(ShellManager, EventEmitter);

function ShellManager(iConfig){
  EventEmitter.prototype.constructor.call(this);
  this._config = iConfig;
  this._shells = [];
}

ShellManager.prototype.getShells = function(){
  return this._shells;
};

ShellManager.prototype.getShellFor = function(iShellTask){
  var self = this;

  //explicitly named shell
  if(iShellTask && iShellTask.requiredShellVID){
    for(var idx in this._shells){
      var shell = this._shells[idx];
      if(shell.vid == iShellTask.requiredShellVID){
        return shell;
      }
    }
  }

  //shell by lockId
  // if(iShellTask.lockId){
  //   for(var idx in this._shells){
  //     var shell = this._shells[idx];
  //     if(shell.getLockId() == iShellTask.lockId){
  //       return shell;
  //     }
  //   }
  // }

  //existing non-saturated, non-locked shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(!shell.isSaturated() && !shell.isLocked()){
      return shell;
    }
  }

  //new shell
  if(this._shells.length < this._config.max_shells){
    var newShell = new Shell();
    newShell.on('locked', function(){
      self.emit('shell_locked', newShell);
    });
    newShell.on('unlocked', function(){
      self.emit('shell_unlocked', newShell);
    });
    this._shells.push(newShell);
    this.emit('shell_created', newShell);
    return newShell;
  }

  //existing non locked shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(!shell.isLocked()){
      return shell;
    }
  }

};

ShellManager.prototype.enqueue = function(iShellTask){
  if(iShellTask){
    var shell = this.getShellFor(iShellTask);
    if(shell){
      if(typeof iShellTask.command == 'function'){
        iShellTask.command(shell);            
      }else{
        shell.enqueue(iShellTask);  
      }
    }
  }
};

exports.ShellManager = ShellManager;
