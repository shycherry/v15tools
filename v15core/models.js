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

ItemPath.prototype.getSaveName = function(){
  return this.absolute.replace(/\//g,'_').replace(/\\/g,'_').replace(/:/g,'_');
}

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

function Factory (iConfig) {
  this._config = iConfig;  
}

Factory.prototype.create = function(arg){
  if(arg && arg.type){
    
    var newInstance = null;
    
    try{
      newInstance = eval('new '+arg.type);  
    }catch(err){
      return null;
    }

    if(!newInstance){
      return null;
    }
    
    delete arg.vid;
    
    for(i in arg){
      newInstance[i] = arg[i];
    }
    
    return newInstance;
  }
  return null;
}

Factory.prototype.write = function(iModel, iCallback){
  if(! this._config || !this._config.savedModels_dir || !this._config.max_parallel_fs_writes){
    iCallback('error : invalid config for writting files...');
    return;
  }

  var jsonData = null;
  try{
    jsonData = JSON.stringify(iModel, null, 2);
  }catch(err){
    iCallback('error: stringify failed');
    return;
  }

  if(! (typeof iModel.getSaveName == 'function') ){
    iCallback('model has no getSaveName function');
    return;
  }

  var modelSaveName = iModel.getSaveName();

  if(!modelSaveName){
    iCallback('invalid save name');
    return;
  }

  Fs.writeFile(this._config.savedModels_dir+'/'+modelSaveName, jsonData, function(err){    
    iCallback(err);
  });
}

exports.Types = Types;
exports.WS = WS;
exports.FW = FW;
exports.MOD = MOD;
exports.FILE = FILE;
exports.Factory = Factory;