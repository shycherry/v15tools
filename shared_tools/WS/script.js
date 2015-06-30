var _ = require('underscore');
var _wsList;
var _filesToPromoteList;
var _fileToForgetList;
var _filesToPromoteBtn;
var _promoteSimulButtonBatch;
var _forgetChgButtonBatch;
var _currentWS;

function bindGui(){
  _wsList = makeMultiDroppableZone($('#ws-list'), vt.Types.WS, 1);
  _fileToForgetList = makeMultiDroppableZone($('#ws-file-list'), vt.Types.FILE, 1);
  _filesToPromoteList = makeMultiDroppableZone($('#ws-files-to-promote-list'), vt.Types.FILE);
  _filesToPromoteList[0].hidden = true;

  _chWsButtonBatch = $('#ws-ch-ws-buttonbatch')[0];
  _promoteSimulButtonBatch = $('#ws-promote-simul-buttonbatch')[0];
  _promoteButtonBatch = $('#ws-promote-buttonbatch')[0];
  _forgetChgButtonBatch = $('#ws-forget-changes-buttonbatch')[0];
  _publishButtonBatch = $('#ws-publish-buttonbatch')[0];
  _syncButtonBatch = $('#ws-sync-buttonbatch')[0];
  _solveMergeButtonBatch = $('#ws-solve-merge-buttonbatch')[0];

  _promoteSimulButtonBatch.setWorker(_chWsButtonBatch.getWorker());
  _forgetChgButtonBatch.setWorker(_chWsButtonBatch.getWorker());
  _publishButtonBatch.setWorker(_chWsButtonBatch.getWorker());
  _syncButtonBatch.setWorker(_chWsButtonBatch.getWorker());
  _solveMergeButtonBatch.setWorker(_chWsButtonBatch.getWorker());

  function dispatchWS(iWS){
    _promoteSimulButtonBatch.params = _.extend({}, _.extend(_promoteSimulButtonBatch.params, {"ws" : iWS? iWS.name : null}));
    _promoteButtonBatch.params = _.extend({}, _.extend(_promoteButtonBatch.params, {"ws" : iWS? iWS.name : null}));
    _forgetChgButtonBatch.params = _.extend({}, _.extend(_forgetChgButtonBatch.params, {"ws" : iWS? iWS.name : null}));
    _publishButtonBatch.params = _.extend({}, _.extend(_publishButtonBatch.params, {"ws" : iWS? iWS.name : null}));
    _syncButtonBatch.params = _.extend({}, _.extend(_syncButtonBatch.params, {"ws" : iWS? iWS.name : null}));
    _solveMergeButtonBatch.params = _.extend({}, _.extend(_solveMergeButtonBatch.params, {"ws" : iWS? iWS.name : null}));
  }

  _wsList.on("models_changed", function(){
    _currentWS = _wsList.getModels()[0];
    _chWsButtonBatch.params  = _.extend({}, _.extend(_chWsButtonBatch.params, {"ws" : _currentWS? _currentWS.name : null}));
    dispatchWS(_currentWS);
  });

  _fileToForgetList.on("models_changed", function(){
    var fileToForget = _fileToForgetList.getModels()[0];
    _forgetChgButtonBatch.params = _.extend({}, _.extend(_forgetChgButtonBatch.params, {"file" : fileToForget? fileToForget.name : null}));
    _forgetChgButtonBatch.params = _.extend({}, _.extend(_forgetChgButtonBatch.params, {"file.path" : fileToForget? fileToForget.path : null}));
  });

  _filesToPromoteList.on("models_changed", function(){
    if(_filesToPromoteList.getModels().length){
      _filesToPromoteList[0].hidden = false;
    }else{
      _filesToPromoteList[0].hidden = true;
    }
  });

  _promoteSimulButtonBatch.addEventListener('batch_started', function(ev){
    _filesToPromoteList.removeAllModels();
  });

  _promoteSimulButtonBatch.setTaskFinishedCallback('ws-promote-simul-shelltask', function(ev){
    var models = vt. magicGetModelsFromText(ev.detail.data);
    _filesToPromoteList.addModels(models);
  });

  _chWsButtonBatch.addEventListener('batch_started', function(ev){
    dispatchWS(null);
  });

  _chWsButtonBatch.setTaskFinishedCallback("ws-ch-ws-shelltask", function(ev){
    _chWsButtonBatch.disable();
    dispatchWS(_currentWS);
  });

}

exports.load = function(){
  bindGui();
}

exports.reload = function(){
}
