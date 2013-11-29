var _wsZone;
var _filesZone;


function createResultsTable(iWorkspaces, iFiles){
    
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
          name: wsIdx+'',
          path:(currentWS.path+currentFile.path)
        });
        currentCol.append(makeModelGui(newModel));
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
