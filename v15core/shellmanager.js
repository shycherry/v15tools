var async = require('async');
var cp = require('child_process');
var Shell = require('./shell').Shell;
var ShellTask = require('./shelltask').ShellTask;
var _StartTransactionMarker = 'V15TStart_';
var _EndTransactionMarker = 'V15TEnd_';

/*
* events : saturated, drain, shell_created, shell_owned, shell_released
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(ShellManager, EventEmitter);

function ShellManager(iConfig){
  EventEmitter.prototype.constructor.call(this);
  this._config = iConfig;
  this._shells = [];
  this.init();
}

ShellManager.prototype.getShells = function(){
  return this._shells;
};

ShellManager.prototype.worker = function(iShellTask, iCallback){
  var shell = this.getShellFor(iShellTask.vid);
  shell.write(_StartTransactionMarker+iShellTask.vid+'\n');
  shell.write(iShellTask.command+'\n');
  shell.write(_EndTransactionMarker+iShellTask.vid+'\n');
  
  var dataBuffer='';
  var dataCallback = function(data){
    dataBuffer += data.toString();
    if(RegExp(_EndTransactionMarker+iShellTask.vid).test(data)){
      if(iShellTask['releaseAtEnd']){
        shell.setOwner(null);
      }
      shell.removeListener('data', dataCallback);
      iCallback(null, dataBuffer);
    }
  };
  shell.on('data', dataCallback);
};

ShellManager.prototype.getShellFor = function(iShellTaskVid){
  var self = this;

  //previously owned shell
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
  if(iShellTask)
    this._queue.push(iShellTask, iShellTask.callback);
};

ShellManager.prototype.init = function(){
  var self = this;
  this._queue = new async.queue(ShellManager.prototype.worker.bind(this), this._config.max_shells);
  this._queue.drain = function(){
    self.emit('drain');
  };
  this._queue.saturated = function(){
    self.emit('saturated');
  };
};


exports.ShellManager = ShellManager;
