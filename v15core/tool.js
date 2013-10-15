var globId = 0;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(Tool, EventEmitter);

function Tool(iInfos){
  this.vid = 'Tool_'+globId;
  globId++;
  this.pathToDir = iInfos['pathToDir'];
  this.name = iInfos['name'];
}

exports.Tool = Tool;