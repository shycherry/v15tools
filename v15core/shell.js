var cp = require('child_process');
var async = require('async');
var _StartTransactionMarker = 'echo V15TStart_';
var _EndTransactionMarker = 'echo V15TEnd_';
var _TransactionMarker = '_Trans_';
/*
* events: stdout_data, stderr_data, data, released, owned, drain, saturated
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
    console.log('drain');
    self._saturated = false;
    self.emit('drain');    
  };
  
  this._queue.saturated = function(){
    console.log('saturated');
    self._saturated = true;
    self.emit('saturated');
  };
  
  this._working = false;
  this.globTransactionId = 0;
  this.fullOutput = '';
  this.child_process = cp.spawn('cmd');
  
  var stdoutCallback = function(data){
    self.fullOutput += data;
    self.emit('stdout_data', data);
    self.emit('data', data);
  };

  var stderrCallback = function(data){
    self.fullOutput += data;
    self.emit('stderr_data', data);
    self.emit('data', data);
  };

  this.child_process.stdout.on('data', stdoutCallback);
  this.child_process.stderr.on('data', stderrCallback); 
}

Shell.prototype.enqueue = function(iShellTask){
  console.log('enqueue');
  if(iShellTask){
    if(iShellTask.lockId){
      this._lockId = lockId;
      this.emit('locked');
    }
    this._queue.push(iShellTask, iShellTask.completeCallback);
  }    
};

Shell.prototype.getLockId = function(){
  return this._lockId;
};

Shell.prototype.isSaturated = function(){
  return this._saturated;
};

Shell.prototype.isWorking = function(){
  return this._working;
};

Shell.prototype.write = function(iData){
  this.child_process.stdin.write(iData);
};

Shell.prototype.doTask = function(iShellTask, iCallback){
  var self = this;
  var transactionId = _TransactionMarker+this.globTransactionId;  
  this._working = true;
  
  this.write(_StartTransactionMarker+iShellTask.vid+transactionId+'\n');
  this.write(iShellTask.command+'\n');
  this.write(_EndTransactionMarker+iShellTask.vid+transactionId+'\n');
  
  var dataBuffer='';

  var dataCallback = function(data){
    dataBuffer += data.toString();
    if(RegExp(_EndTransactionMarker+iShellTask.vid+transactionId).test(data)){
      self._working = false;
      
      if(iShellTask.releaseAtEnd){
        var oldLockId = self._lockId;
        delete self._lockId;
        if(oldLockId){
          self.emit('released');          
        }        
      }
      
      self.removeListener('stdout_data', stdoutCallback);
      self.removeListener('stderr_data', stderrCallback);
      self.globTransactionId++;
      
      if(iCallback){
        iCallback(null, dataBuffer);  
      }
    }
  };

  var stdoutCallback = function(data){
    dataCallback(data);
    if(iShellTask.stdoutCallback){
      iShellTask.stdoutCallback(data);
    }
  };

  var stderrCallback = function(data){
    dataCallback(data);
    if(iShellTask.stdoutCallback){
      iShellTask.stdoutCallback(data);
    }
  }

  this.on('stdout_data', stdoutCallback);
  this.on('stderr_data', stderrCallback);
};

exports.Shell = Shell;
