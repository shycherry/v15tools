var Fs = require('fs')
var util = require('util');

var Types = {
  ItemPath : 'ItemPath',
  WSP:'WSP',
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


util.inherits(WSP, ItemPath);
function WSP(){
  this.vid = 'WSP_'+globId;
  globId++;
  this.name='wsp';
  this.absolute='/path/to/wsp';
  this.type = Types.WSP;
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

exports.Types = Types
exports.WSP = WSP
exports.FW = FW
exports.MOD = MOD
exports.FILE = FILE
