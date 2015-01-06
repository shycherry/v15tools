(function(){
  global.$ = window.$;
  global.document = document;
  var path = require('path');
  window.vt = global.vt = require(path.resolve('./v15core/v15tools.js')).V15Tools;

  var fs = require('fs');
  var _tools = [];
  var _currentTool;
  var gui = require('nw.gui');


  function relayout(){
    $('#vt-central').height($(window).height() -  $('#vt-tabs').height());
    $('#vt-central').width($(window).width());
  }

  window.openTool = global.openTool = function openTool(iTool, iCallback){
    var hiddenZone = $('#vt-hidden');
    var mainZone = $('#vt-main');
    var newToolHiddenDOM = hiddenZone.find('#'+iTool.vid)[0];

    var cssPath = iTool.pathToDir+'/style.css';
    var jsPath = iTool.pathToDir+'/script.js';

    if(newToolHiddenDOM){
      newToolHiddenDOM = $(newToolHiddenDOM).detach();
      mainZone.append(newToolHiddenDOM);
      if(fs.existsSync(path.resolve(jsPath))){
        require(path.resolve(jsPath)).reload();
      }
      iCallback(null, 'reattached');
    }else{
      var newToolDOM = $('<vt-tool id="'+iTool.vid+'"></vt-tool>');
      newToolDOM[0].tool = iTool;
      newToolDOM.load(iTool.pathToDir+'/layout.html', function(){
        mainZone.append(newToolDOM);
        if(fs.existsSync(path.resolve(cssPath))){
          newToolDOM.prepend('<link rel="stylesheet" type="text/css" href="'+cssPath+'">');
        }
        if(fs.existsSync(path.resolve(jsPath))){
          require(path.resolve(jsPath)).load();
        }
        iCallback(null, 'loaded');
      });
    }
  }

  window.closeTool = global.closeTool = function closeTool(iTool, iCallback){
    var hiddenZone = $('#vt-hidden');
    var mainZone = $('#vt-main');

    var toolToCloseDOM = mainZone.find('#'+iTool.vid)[0];
    if(toolToCloseDOM){
      toolToCloseDOM = $(toolToCloseDOM).detach();
      hiddenZone.append(toolToCloseDOM);
    }

    iCallback(null, 'closed');
  }

  $(document).ready(function() {
    $(window).resize(relayout);
    $('#vt-logo').click(function(){
      var Window = gui.Window.get();
      if(!Window.isDevToolsOpen())
        Window.showDevTools();
      else
        Window.closeDevTools();
    });
    vt.loadTools(relayout);
    vt.loadSavedModels();

  });

})();
