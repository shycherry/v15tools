var cp = require('child_process');
var Shell = require('./shell').Shell;
var ShellTask = require('./shelltask').ShellTask;

/*
* events : shell_created, shell_owned, shell_released
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
  var iShellTaskVid = iShellTask.vid;

  //explicitly named shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(shell.vid == iShellTask.requiredShellVID){
      return shell;
    }
  }

  //shell owned by task 
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(shell.getOwner() == iShellTaskVid){
      return shell;
    }
  }

  //existing non owned shell
  for(var idx in this._shells){
    var shell = this._shells[idx];
    if(!shell.getOwner()){
      shell.setOwner(iShellTaskVid);
      return shell;
    }
  }

  //new shell
  if(this._shells.length < this._config.max_shells){
    var newShell = new Shell();
    newShell.on('owned', function(){
      self.emit('shell_owned', newShell);
    });
    newShell.on('released', function(){
      self.emit('shell_released', newShell);
    });
    this._shells.push(newShell);
    this.emit('shell_created', newShell);
    newShell.setOwner(iShellTaskVid);
    return newShell;
  }
};

ShellManager.prototype.enqueue = function(iShellTask){
  if(iShellTask){
    var shell = this.getShellFor(iShellTask);
    if(shell){
      shell.enqueue(iShellTask);
    }
  }   
};

exports.ShellManager = ShellManager;
