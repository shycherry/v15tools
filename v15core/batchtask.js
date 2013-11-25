var globId = 0;

/*
* events: [events of ShellTask]
*/
var util = require('util');
var ShellTask = require('./shelltask').ShellTask;
util.inherits(BatchTask, ShellTask);

function BatchTask(iInfos){
  var self = this;
  ShellTask.prototype.constructor.call(this, iInfos);
  this.vid = 'BatchTask_'+globId;
  this.tasks = [];
  this.completedTasks = 0;
  this.dataBuffer = '';  

  this.command = function(iShell){
    if(!iShell){
      return;
    }

    for(var idx in self.tasks){
      iShell.enqueue(self.tasks[idx]);
    }

  };

  this.on('change_status', function(iStatus){
    switch(iStatus){
      case 'canceled':
        for(var idx in self.tasks){
          self.tasks[idx].setStatus('canceled');
        }        
      break;
    }
  });

}

BatchTask.prototype._completeIfp = function(err, data){
  this.completedTasks ++;

  if(err){
    this.setStatus('canceled');
  }

  if(this.completedTasks >= this.tasks.length){
    if(this.completeCallback){
      this.completeCallback(err, this.dataBuffer);
    }
  }

  
}

BatchTask.prototype.pushTask = function(iShellTask){
  var self = this;

  var stdoutCallback_back = iShellTask.stdoutCallback;
  var stderrCallback_back = iShellTask.stderrCallback;
  var completeCallback_back = iShellTask.completeCallback;
  
  iShellTask.stdoutCallback = function(data){    
    self.dataBuffer += data;
    if(stdoutCallback_back){
      stdoutCallback_back(data);
    }
    if(self.stdoutCallback){
      self.stdoutCallback(data);  
    }
  }

  iShellTask.stderrCallback = function(data){
    self.dataBuffer += data;
    if(stderrCallback_back){
      stderrCallback_back(data);
    }
    if(self.stderrCallback){
      self.stderrCallback(data);
    }
  }

  iShellTask.completeCallback = function(err, data){    
    if(completeCallback_back){
      completeCallback_back(err, data);
    }    
    self._completeIfp(err, data);
  }

  this.tasks.push(iShellTask);
}

exports.BatchTask = BatchTask;
