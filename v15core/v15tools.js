var fs = require('fs');
var ShellManager = require('./shellmanager').ShellManager;
var ShellTask = require('./shelltask').ShellTask;
var BatchTask = require('./batchtask').BatchTask;
var Tool = require('./tool').Tool;
var Factory = require('./models').Factory;
var ADL_DS_WS_Task = require('../shelltasks/adl_ds_ws');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(V15Tools, EventEmitter);


/*
* events : shell_created, shell_locked, shell_released
*/
function _init(){
  EventEmitter.prototype.constructor.call(this);
  var self = this;

  this._factory = new Factory(this._config);

  this._shellManager = new ShellManager(this._config);
  this._shellManager.on('shell_created', function(shell){
    self.emit('shell_created', shell);
  });
  this._shellManager.on('shell_released', function(shell){
    self.emit('shell_released', shell);
  });
  this._shellManager.on('shell_locked', function(shell){
    self.emit('shell_locked', shell);
  });
}

function V15Tools(){
  this.setConfig({
    'tools_dir':'./tools',
    'savedModels_dir':'./savedModels',
    'max_shells':2
  });
}

V15Tools.prototype.setConfig = function (iConfig){
  if(!this._config)
    this._config = {};

  for(var idx in iConfig){
    this._config[idx] = iConfig[idx];
  }
  _init.call(this);
};

V15Tools.prototype.ShellTask = ShellTask;
V15Tools.prototype.BatchTask = BatchTask;

V15Tools.prototype.pushShellTask = function (iShellTask){
  this._shellManager.enqueue(iShellTask);
};

V15Tools.prototype.getShells = function (){
  return this._shellManager.getShells();
};

V15Tools.prototype.getWSPath = function(iWSName, iCallback){  
  var shellTask = ADL_DS_WS_Task.get(iWSName);
  shellTask.userCallback = iCallback;
  this.pushShellTask(shellTask);
};

V15Tools.prototype.loadTools = function(iCallback){
  var tools_dir = this._config['tools_dir'];
  fs.readdir(tools_dir, function(err, files){
    if(err){
      if(iCallback)
        iCallback(err, null);
      return;
    }
    var tools = [];
    for(var idx in files){
      var currentToolName = files[idx];
      if(fs.existsSync(tools_dir+'/'+currentToolName+'/layout.html')){
        var newTool = new Tool({
          'pathToDir': tools_dir+'/'+currentToolName,
          'name': currentToolName
        });
        tools.push(newTool);
        _models.push(newTool);
      }
    }
    if(iCallback)
      iCallback(null, tools);
  });
};

V15Tools.prototype.loadSavedModels = function(iCallback) {
  var self = this;
  var models_dir = this._config['savedModels_dir'];
  fs.readdir(models_dir, function(err, files){
    if(err){
      if(iCallback)
        iCallback(err, null);
      return;
    }
    var loadedModels = [];
    for (var idx in files) {
      var currentFile = files[idx];
      var rawItem = JSON.parse(fs.readFileSync(models_dir+'/'+currentFile));
      var newItem = self.createModel(rawItem);
      if(newItem){
        loadedModels.push(newItem);        
      }
    }
    if(iCallback)
      iCallback(null, loadedModels);
  });
};

V15Tools.prototype.findModelInArray = function(iModel, iArray){
  for(var idxModel in iArray){
    var model = iArray[idxModel];
    for(var prop in iModel){
      if(model.hasOwnProperty(prop) && model[prop] == iModel[prop]){
        return model;
      }
    }
  }
};

V15Tools.prototype.findModelsInArray = function(iModel, iArray){
  var results = [];
  for(var idxModel in iArray){
    var model = iArray[idxModel];
    for(var prop in iModel){
      if(model.hasOwnProperty(prop) && model[prop] == iModel[prop]){
        results.push(model);
      }
    }
  }
  return results;
};

V15Tools.prototype.findModel = function(iModel){
  return this.findModelInArray(iModel, _models);
};

V15Tools.prototype.findModels = function(iModel){
  return this.findModelsInArray(iModel, _models);
};

V15Tools.prototype.createModel = function(arg){
  var newModel = this._factory.create(arg);
  if(newModel){
    _models.push(newModel);
  }
  return newModel;
};

var _models = [];
exports.V15Tools = new V15Tools();
