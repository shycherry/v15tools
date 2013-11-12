var Fs = require('fs')
var util = require('util');

var Types = {
  ItemPath : 'ItemPath',
  WS:'WS',
  FW:'FW',
  MOD:'MOD',
  FILE:'FILE',
}

var globId = 0;

function ItemPath(){
  this.vid = 'ItemPath_'+globId;
  globId++;
  this.name='item';
  this.absolute='/full/path/to/item';
  this.relativeToChain='relative/path/to/item';
  this.type=Types.ItemPath;
}

ItemPath.prototype.getName = function() {
  return this.name;
};

ItemPath.prototype.exists = function() {
  return Fs.existsSync(this.absolute);
};


util.inherits(WS, ItemPath);
function WS(){
  this.vid = 'WS_'+globId;
  globId++;
  this.name='ws';
  this.absolute='/path/to/ws';
  this.type = Types.WS;
}

util.inherits(FW, ItemPath);
function FW(){
  this.vid = 'FW_'+globId;
  globId++;
  this.name='fw';
  this.absolute='/path/to/fw';
  this.type=Types.FW;  
}


util.inherits(MOD, ItemPath);
function MOD(){
  this.vid = 'MOD_'+globId;
  globId++;
  name='mod';
  absolute='/path/to/mod';
  type=Types.MOD;
}

util.inherits(FILE, ItemPath);
function FILE(){
  this.vid = 'FILE_'+globId;
  globId++;
  name='file';
  absolute='/path/to/file';
  type=Types.FILE;
}

function Factory (arg) {
  if(arg && arg.type){
    var newInstance = eval('new '+arg.type);
    delete arg.vid;
    for(i in arg){
      newInstance[i] = arg[i];
    }
    return newInstance;
  }
  return null;
}

exports.Types = Types;
exports.WS = WS;
exports.FW = FW;
exports.MOD = MOD;
exports.FILE = FILE;
exports.Factory = Factory;