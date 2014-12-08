var Fs = require('fs')
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var globId = 0;


util.inherits(Model, EventEmitter);
function Model(){
  EventEmitter.prototype.constructor.call(this);
  this.vid = 'Model_'+globId;
  globId++;
}

Model.prototype.notify = function(iChange){
  this.emit('change', iChange);
}

util.inherits(ItemPath, Model);
function ItemPath(){
  Model.prototype.constructor.call(this);
  this.vid = 'ItemPath_'+globId;
  this.name='item';
  this.path='/full/path/to/item';
  this.type = ItemPath.name;
}

ItemPath.prototype.getName = function() {
  return this.name;
};

ItemPath.prototype.getSaveName = function(){
  return this.path.replace(/\//g,'_').replace(/\\/g,'_').replace(/:/g,'_');
}

ItemPath.prototype.exists = function(iCallback){
  return Fs.exists(this.path, iCallback);
};

ItemPath.prototype.computeChecksum = function(iCallback){
  var self = this;
  this.exists(function(iExists){
    if(iExists){
      var Crypto = require('crypto');
      var shasum = Crypto.createHash('sha512');
      var s = Fs.createReadStream(self.path);
      s.on('data', function(data){
        shasum.update(data);
      });
      s.on('end', function(){
        var sum = shasum.digest('hex');
        if(iCallback){
          iCallback(null, sum);
        }
      });
      s.on('error', function(error){
        if(iCallback){
          iCallback('error while streaming file', null);
        }
      });
    }else{
      if(iCallback){
        iCallback('file not found');
      }
    }
  });
}


util.inherits(WS, ItemPath);
function WS(){
  ItemPath.prototype.constructor.call(this);
  this.vid = 'WS_'+globId;
  this.name='ws';
  this.path='/path/to/ws';
  this.type = WS.name;
}

util.inherits(FW, ItemPath);
function FW(){
  ItemPath.prototype.constructor.call(this);
  this.vid = 'FW_'+globId;
  this.name='fw';
  this.path='/path/to/fw';
  this.type = FW.name;
}


util.inherits(MOD, ItemPath);
function MOD(){
  ItemPath.prototype.constructor.call(this);
  this.vid = 'MOD_'+globId;
  this.name='mod';
  this.path='/path/to/mod';
  this.type = MOD.name;
}

util.inherits(FILE, ItemPath);
function FILE(){
  ItemPath.prototype.constructor.call(this);
  this.vid = 'FILE_'+globId;
  this.name='file';
  this.path='/path/to/file';
  this.type = FILE.name;
}

function Factory (iConfig) {
  this._config = iConfig;
}

util.inherits(FullPath, ItemPath);
function FullPath(){
  ItemPath.prototype.constructor.call(this);
  this.vid = 'FullPath_'+globId;
  this.name='fullPath';
  this.path='e:/path/to/file';
  this.type = FullPath.name;
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
  if(!this._config || !this._config.userSavedModelsPath){
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

  if( ! Fs.existsSync(this._config.userSavedModelsPath)){
    Fs.mkdirSync(this._config.userSavedModelsPath);
  }

  Fs.writeFile(this._config.userSavedModelsPath+'/'+modelSaveName, jsonData, function(err){
    iCallback(err);
  });
}

exports.Types = {
  Model: Model,
  ItemPath: ItemPath,
  FullPath: FullPath,
  WS: WS,
  FW: FW,
  MOD: MOD,
  FILE: FILE
};
exports.Factory = Factory;
