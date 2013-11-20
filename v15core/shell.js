var cp = require('child_process');
var async = require('async');
var _StartTransactionMarker = 'echo V15TStart_';
var _EndTransactionMarker = 'echo V15TEnd_';
var _TransactionMarker = '_Trans_';
/*
* events: data, released, owned, drain, saturated
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(Shell, EventEmitter);

var globId = 0;

function Shell(){
  EventEmitter.prototype.constructor.call(this);
  var self = this;
  this.vid = 'Shell_'+globId;
  globId++;
  this._queue = new async.queue(Shell.prototype.doTask.bind(this), 1);
  this._queue.drain = function(){
    self.emit('drain');
  };
  this._queue.saturated = function(){
    self.emit('saturated');
  };
  this._working = false;
  this.globTransactionId = 0;
  this.fullOutput = '';
  this.child_process = cp.spawn('cmd');
  var dataCallback = function(data){
    self.fullOutput += data;
    self.emit('data', data);
  };
  this.child_process.stdout.on('data', dataCallback);
  this.child_process.stderr.on('data', dataCallback);
  this.owner = null;
}

Shell.prototype.enqueue = function(iShellTask){
  if(iShellTask)
    this._queue.push(iShellTask, iShellTask.callback);
};

Shell.prototype.setOwner = function(iOwner){
  var old = this.owner;
  this.owner = iOwner;
  if(this.owner){
    this.emit('owned');
  }else if(old && !this.owner){
    this.emit('released');
  }
};

Shell.prototype.getOwner = function(){
  return this.owner;
};

Shell.prototype.isWorking = function(){
  return this._working;
};

Shell.prototype.setWorking = function(isWorking){
  this._working = isWorking;
};

Shell.prototype.write = function(iData){
  this.child_process.stdin.write(iData);
};

Shell.prototype.doTask = function(iShellTask, iCallback){
  var self = this;
  var transactionId = _TransactionMarker+this.globTransactionId;
  this.setWorking(true);
  this.write(_StartTransactionMarker+iShellTask.vid+transactionId+'\n');
  this.write(iShellTask.command+'\n');
  this.write(_EndTransactionMarker+iShellTask.vid+transactionId+'\n');
  
  var dataBuffer='';
  var dataCallback = function(data){
    dataBuffer += data.toString();
    if(RegExp(_EndTransactionMarker+iShellTask.vid+transactionId).test(data)){
      this.setWorking(false);
      if(iShellTask.releaseAtEnd){
        self.setOwner(null);
      }
      self.removeListener('data', dataCallback);
      self.globTransactionId++;
      iCallback(null, dataBuffer);
    }
  };
  this.on('data', dataCallback);
};

exports.Shell = Shell;
