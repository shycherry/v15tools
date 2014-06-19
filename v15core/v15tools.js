var path = require('path');
var fs = require('fs');
var async = require('async');
var ShellManager = require('./shellmanager').ShellManager;
var ShellTask = require('./shelltask').ShellTask;
var BatchTask = require('./batchtask').BatchTask;
var Tool = require('./tool').Tool;
var Factory = require('./models').Factory;
var Types = require('./models').Types;
var ADL_DS_WS_Task = require('../shelltasks/adl_ds_ws');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(V15Tools, EventEmitter);

var Gui = global.window.nwDispatcher.requireNwGui();


/*
* events : shell_created, shell_locked, shell_unlocked
*/
function _init(){
  EventEmitter.prototype.constructor.call(this);
  var self = this;

  this._factory = new Factory(this._config);

  this._shellManager = new ShellManager(this._config);
  this._shellManager.on('shell_created', function(shell){
    self.emit('shell_created', shell);
  });
  this._shellManager.on('shell_unlocked', function(shell){
    self.emit('shell_unlocked', shell);
  });
  this._shellManager.on('shell_locked', function(shell){
    self.emit('shell_locked', shell);
  });
}

function _regexFilterObjectParams(iObj, iRegex){
  var result = {};
  for(i in iObj){
    if(iRegex.test(i)){
      result[i] = iObj[i];
    }
  }
  return result;
}

function _objToArray(iObj){
  var result = []
  for(i in iObj){
    result.push(iObj[i]);
  }
  return result;
}

function V15Tools(){
  this.loadConfig();
  Gui.Window.get().title = this.getConfig().username+Gui.Window.get().title;
}

V15Tools.prototype.loadConfig = function(){
  //set user path at runtime
  var userV15ToolsPath = path.resolve(process.env.LOCALAPPDATA+'/v15tools');
  var username = process.env.USERNAME;
  this.setConfig({
    'userV15ToolsPath' : userV15ToolsPath,
    'username' : username
  });

  //load global config first
  var globalConfig = require('../config.cfg').config;
  this.setConfig(globalConfig);

  //then load user config (may erase global config entries)
  var userConfigPath = path.resolve(userV15ToolsPath+'/config.cfg');
  var userConfig  = null;
  if(fs.existsSync(userConfigPath)){
    userConfig = require(userConfigPath).config;
  }
  if(userConfig){
    this.setConfig(userConfig);
  }
  
  _init.call(this);
};


V15Tools.prototype.getConfig = function(){
  return this._config;
};

V15Tools.prototype.setConfig = function (iConfig){
  if(!this._config)
    this._config = {};

  for(var idx in iConfig){
    this._config[idx] = iConfig[idx];
  }

};

V15Tools.prototype.Types = Types;
V15Tools.prototype.ShellTask = ShellTask;
V15Tools.prototype.BatchTask = BatchTask;

V15Tools.prototype.pushShellTask = function (iShellTask){
  this._shellManager.enqueue(iShellTask);
};

V15Tools.prototype.getShell = function(iShellTask){
  return this._shellManager.getShellFor(iShellTask);
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
  var config_tools_dirs = _regexFilterObjectParams(this._config, /.*tools_dir$/);
  var array_tools_dir = _objToArray(config_tools_dirs);
  
  async.mapSeries(array_tools_dir, V15Tools.prototype.loadToolDir.bind(this), function(err, toolsLists){
    if(err){
      if(iCallback) iCallback(err);
    }else{
      var tools = [];
      for(var iToolList = 0; iToolList< toolsLists.length ; iToolList++){
        tools = tools.concat(toolsLists[iToolList]);
      }
      if(iCallback) iCallback(null, tools);
    }
  });
};

V15Tools.prototype.loadToolDir = function(iToolDir, iCallback){
  if(!iToolDir){
    if(iCallback) iCallback('bad tool dir');
    return;
  }
  
  fs.readdir(iToolDir, function(err, files){
    if(err){
      if(iCallback)
        iCallback(err, null);
      return;
    }
    var tools = [];
    for(var idx in files){
      var currentToolName = files[idx];
      if(fs.existsSync(iToolDir+'/'+currentToolName+'/layout.html')){
        var newTool = new Tool({
          'pathToDir': iToolDir+'/'+currentToolName,
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

function getObjectFilter(iAmorce){
  return function(iModel){
    var isSame = true;
    for(var prop in iAmorce){
      if( (!iModel.hasOwnProperty(prop)) || (iModel[prop] != iAmorce[prop]) ){
        isSame = false;
      }
    }
    return isSame;
  };
}

V15Tools.prototype.findModelInArray = function(iFilter, iArray){

  var filter = iFilter;
  if(typeof filter !== 'function'){
    filter = getObjectFilter(iFilter);
  }

  for(var idxModel in iArray){
    var model = iArray[idxModel];
    if(filter(model)){
      return model;
    }
  }
};

V15Tools.prototype.findModelsInArray = function(iFilter, iArray){
  var results = [];

  var filter = iFilter;
  if(typeof filter !== 'function'){
    filter = getObjectFilter(iFilter);
  }

  for(var idxModel in iArray){
    var model = iArray[idxModel];
    if(filter(model)){
      results.push(model);
    }
  }

  return results;
};

V15Tools.prototype.findModel = function(iFilter){
  return this.findModelInArray(iFilter, _models);
};

V15Tools.prototype.findModels = function(iFilter){
  return this.findModelsInArray(iFilter, _models);
};

V15Tools.prototype.createModel = function(iAmorce){
  var newModel = this._factory.create(iAmorce);
  if(newModel){
    _models.push(newModel);
  }
  return newModel;
};

V15Tools.prototype.forgetModel = function(iModel){
  _models = _models.filter(function(current){
    return current.vid != iModel.vid;
  });
};

V15Tools.prototype.saveModel = function(iModel, iCallback){
  this._factory.write(iModel, iCallback);
};

V15Tools.prototype.saveModels = function(iModels, iCallback){
  if(!iModels){
    iCallback('invalid models');
    return;
  }

  async.each(iModels, V15Tools.prototype.saveModel.bind(this), function(err){
    iCallback(err);
  });
};

var _models = [];
exports.V15Tools = new V15Tools();
