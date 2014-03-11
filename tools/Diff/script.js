var Path = require('path');
var _lockedShell;
var _createdModelsGuis = [];
var _createdModels = [];

function clearResultsTable(){  
  for(var idx in _createdModelsGuis){
    removeModelGui(_createdModelsGuis[idx]);
  }
  _createdModelsGuis = [];
  $('#diff-results-table').contents().remove();

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
    
    var resultsTable = $('#diff-results-table');
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
      resultsTable.append(firstRow);
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

      resultsTable.append(currentRow);
    }
}

function bindGui(){
  var _wsZone = makeMultiDroppableZone($('#diff-ws-zone'), vt.Types.WS);
  var _filesZone = makeMultiDroppableZone($('#diff-files-zone'), vt.Types.FILE); 
  
  $('#diff-diff-btn').button().click(function(){
    var workspaces = _wsZone.getModels();
    var files = _filesZone.getModels();

    createResultsTable(workspaces, files);
    
  });

  $('#diff-windiff-btn').button().click(function(){
    var selectedFullpathes = $('#diff-results-table').find('.diff-fullpath.selected');
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

    if(!_lockedShell){
      _lockedShell = vt.getShell();
      _lockedShell.lock();
      _lockedShell.enqueue(require('../../shelltasks/tck_init_profile').get());
    }
    
    _lockedShell.enqueue(new vt.ShellTask({
      command: '%ADL_MERGER% '+fullpathModel1.path+' '+fullpathModel2.path
    }));

    //TODO : unlock :)
    

  });
}

exports.load = function(){  
  bindGui();  
}

exports.reload = function(){
  
}
