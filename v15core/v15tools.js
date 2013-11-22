var fs = require('fs');
var ShellManager = require('./shellmanager').ShellManager;
var ShellTask = require('./shelltask').ShellTask;
var Tool = require('./tool').Tool;
var Models = require('./models');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(V15Tools, EventEmitter);


/*
* events : shell_created, shell_locked, shell_released
*/
function _init(){
  EventEmitter.prototype.constructor.call(this);
  var self = this;
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
    'max_shells':1
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

V15Tools.prototype.createModel = function(arg){
  var newModel = Models.Factory(arg);
  if(newModel){
    _models.push(newModel);
  }
  return newModel;
};

V15Tools.prototype.pushShellTask = function (iShellTask){
  this._shellManager.enqueue(iShellTask);
};

V15Tools.prototype.getShells = function (){
  return this._shellManager.getShells();
};


V15Tools.prototype.getWSPath = function(iWSName, iCallback){
  var shellTask = new ShellTask({
    command : '\\\\dsone\\rnd\\tools\\tck_init && tck_profile SCMV5 && adl_ds_ws '+iWSName,
    completeCallback : function(err, data){
      if(err){
        if(iCallback){
          iCallback(err, null);
        }
        return;
      }
      if(iCallback){
        var winImagePathMatch = /WINDOWS.+(\\\\.+)/.exec(data);
        if(!winImagePathMatch){
          iCallback('no match', null);
          return;
        }
        iCallback(null, winImagePathMatch[1]);
      }
    }
  });
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
  var models_dir = this._config['savedModels_dir'];
  fs.readdir(models_dir, function(err, files){
    if(err){
      if(iCallback)
        iCallback(err, null);
      return;
    }
    var models = [];
    for (var idx in files) {
      var currentFile = files[idx];
      var rawItem = JSON.parse(fs.readFileSync(models_dir+'/'+currentFile));
      var newItem = Models.Factory(rawItem);
      if(newItem){
        models.push(newItem);
        _models.push(newItem);
      }
    }
    if(iCallback)
      iCallback(null, models);
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

var _models = [];
exports.V15Tools = new V15Tools();