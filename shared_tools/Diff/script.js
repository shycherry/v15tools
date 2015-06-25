var _ = require('underscore');
var Path = require('path');
var _lockedShell;
var _createdModelsGuis = [];
var _createdModels = [];
var _diffButtonBatch;
var _wsZone;
var _filesZone;
var _diffInitShellTask;
var _diffTable;

function clearResultsTable(){
  for(var idx in _createdModelsGuis){
    removeModelGui(_createdModelsGuis[idx]);
  }
  _createdModelsGuis = [];
  _diffTable.contents().remove();

  for(var idx in _createdModels){
    vt.forgetModel(_createdModels[idx]);
  }
  _createdModels = [];
}

function createResultsTable(iWorkspaces, iFiles){

    var globHashIndice = 1;
    var hashMap = {};

    function getChecksumCallbackFor(iModel, iModelGui){
      return function(err, data){
        iModelGui.removeClass('vt-working');
        if(err){
          iModel.name = err;
        }else{
          if(!hashMap[data]){
            hashMap[data] = '#'+globHashIndice;
            globHashIndice++;
          }
          iModel.name = hashMap[data];
        }
        iModel.notify('name');
      }
    }

    clearResultsTable();

    //first row is for workspaces
    var firstRow = $('<tr></tr>');
    firstRow.append('<td>-</td>');

    for(var wsIdx in iWorkspaces){
      var currentWS = iWorkspaces[wsIdx];
      var currentCol = $('<td></td>');
      var currentWSGui = makeModelGui(currentWS);
      _createdModelsGuis.push(currentWSGui);
      currentCol.append(currentWSGui);
      firstRow.append(currentCol);
      _diffTable.append(firstRow);
    }

    for(var fileIdx in iFiles){
      var currentFile = iFiles[fileIdx];
      var currentRow = $('<tr></tr>');

      //first col is for file
      var firstCol = $('<td></td>');
      var currentFileGui = makeModelGui(currentFile);
      _createdModelsGuis.push(currentFileGui);
      firstCol.append(currentFileGui);
      currentRow.append(firstCol);

      for(var wsIdx in iWorkspaces){
        var currentWS = iWorkspaces[wsIdx];
        var currentCol = $('<td></td>');
        var newModel = vt.createModel({
          type:vt.Types.FullPath.name,
          name: 'hashing...',
          path:(Path.join(currentWS.path,currentFile.path))
        });
        _createdModels.push(newModel);
        var newFullPathGui = makeModelGui(newModel);
        newFullPathGui.addClass('diff-fullpath');
        newFullPathGui.addClass('vt-working');
        _createdModelsGuis.push(newFullPathGui);
        currentCol.append(newFullPathGui);
        currentRow.append(currentCol);

        newModel.computeChecksum(getChecksumCallbackFor(newModel, newFullPathGui));
      }

      _diffTable.append(currentRow);
    }
}

function updateResultsTable(){
  var workspaces = _wsZone.getModels();
  var files = _filesZone.getModels();

  createResultsTable(workspaces, files);
}

function updateSelection(){
  var selectedFullpathes = _diffTable.find('.diff-fullpath.selected');
  if(selectedFullpathes.length < 2){
    console.log('2 fullpathes have to be selected');
    return;
  }
  if(selectedFullpathes.length > 2){
    console.log('too many fullpathes selected');
    return;
  }

  var fullpathGui1 = $(selectedFullpathes[0]);
  if(! fullpathGui1 ) return;

  var fullpathGui2 = $(selectedFullpathes[1]);
  if(! fullpathGui2 ) return;

  var fullpathModel1 = vt.findModel({vid:fullpathGui1.attr('vid')});
  var fullpathModel2 = vt.findModel({vid:fullpathGui2.attr('vid')});

  _diffButtonBatch.params = {
    'filePath1': fullpathModel1.path,
    'filePath2': fullpathModel2.path
  };
}

function bindGui(){
  _wsZone = makeMultiDroppableZone($('#diff-ws-zone'), vt.Types.WS);
  _filesZone = makeMultiDroppableZone($('#diff-files-zone'), vt.Types.FILE);
  _diffButtonBatch = document.querySelector('#diff-buttonbatch');
  _diffInitShellTask = document.querySelector('#diff-init-shelltask');
  _diffTable = $('#diff-results-table');

  $('#diff-refresh-btn').click(updateResultsTable);

  _diffButtonBatch.addEventListener('task_finished', function(ev){
    if(!ev.detail.src || !ev.detail.src.id)
      return;

    var sourceId = ev.detail.src.id;

    if(sourceId == _diffInitShellTask.id){
      _diffInitShellTask.activated = false;
    }
  });

  _diffButtonBatch.addEventListener('batch_started', function(ev){
    if(!ev.detail.src || !ev.detail.src.id)
      return;
    var sourceId = ev.detail.src.id;

    if(sourceId == _diffButtonBatch.id){
      updateSelection();
    }
  });

  _wsZone.on('models_changed', _.debounce(updateResultsTable));
  _filesZone.on('models_changed', _.debounce(updateResultsTable));
}

exports.load = function(){
  bindGui();
}

exports.reload = function(){

}
