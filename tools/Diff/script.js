var Path = require('path');
var _wsZone;
var _filesZone;


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
    resultsTable.contents().remove();

    //first row is for workspaces
    var firstRow = $('<tr></tr>');
    firstRow.append('<td>-</td>');
    
    for(var wsIdx in iWorkspaces){
      var currentWS = iWorkspaces[wsIdx];
      var currentCol = $('<td></td>');
      currentCol.append(makeModelGui(currentWS));
      firstRow.append(currentCol);
      resultsTable.append(firstRow);
    }

    for(var fileIdx in iFiles){
      var currentFile = iFiles[fileIdx];
      var currentRow = $('<tr></tr>');

      //first col is for file
      var firstCol = $('<td></td>');
      firstCol.append(makeModelGui(currentFile));
      currentRow.append(firstCol);      

      for(var wsIdx in iWorkspaces){
        var currentWS = iWorkspaces[wsIdx];
        var currentCol = $('<td></td>');
        var newModel = vt.createModel({
          type:vt.Types.FullPath.name,
          name: 'hashing...',
          path:(Path.join(currentWS.path,currentFile.path))
        });
        var newFullPathGui = makeModelGui(newModel);
        newFullPathGui.addClass('vt-working');

        newModel.computeChecksum(getChecksumCallbackFor(newModel, newFullPathGui));
        currentCol.append(newFullPathGui);
        currentRow.append(currentCol);
      }

      resultsTable.append(currentRow);
    }
}

function bindGui(){
  _wsZone = makeMultiDroppableZone($('#diff-ws-zone'), vt.Types.WS);
  _filesZone = makeMultiDroppableZone($('#diff-files-zone'), vt.Types.FILE); 
  
  $('#diff-diff-btn').button().click(function(){
    var workspaces = _wsZone.getModels();
    var files = _filesZone.getModels();

    createResultsTable(workspaces, files);
    
  });
}

exports.init = function(){
  bindGui();  
}
