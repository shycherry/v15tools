var cp = require('child_process');

/*
* events: data, released, owned
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(Shell, EventEmitter);

var globId = 0;

function Shell(){  
  var self = this;
  this.vid = 'Shell_'+globId;
  globId++;
  this.fullOutput = '';
  this.child_process = cp.spawn('cmd');
  this.child_process.stdout.on('data', function(data){
    self.fullOutput += data;
    self.emit('data', data);
  })
  this.owner = null;
}

Shell.prototype.setOwner = function(iOwner){
  var old = this.owner;
  this.owner = iOwner;
  if(this.owner){
    this.emit('owned');
  }else if(old && !this.owner){
    this.emit('released');
  }
}

Shell.prototype.getOwner = function(){
  return this.owner;
}


Shell.prototype.write = function(iData){
  this.child_process.stdin.write(iData);
}

exports.Shell = Shell;
