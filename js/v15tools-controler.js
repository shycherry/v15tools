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

  function bindToolsGui(){
    vt.loadTools(function(err, iTools){
      if(!err){
        _tools = iTools;
        relayout();

        $('.v15tool').click(function(){
          var tool = vt.findModelInArray({vid:$(this).attr('id')}, _tools);
          $self = $(this);
          if (tool.isOpened){
            closeTool(tool, function(err, data){
              $self.removeClass('active');
              tool.isOpened = false;
              console.log(tool.name+' '+data);
            });
          }else{
            openTool(tool, function(err, data){
              $self.addClass('active');
              tool.isOpened = true;
              console.log(tool.name+' '+data);
            });
          }
        });
      }else{
        console.log(err);
      }
      });
  }

  $(document).ready(function() {
    $(window).resize(function(){
      relayout();
    });
    $('#vt-logo').click(function(){
      var Window = gui.Window.get();
      if(!Window.isDevToolsOpen())
        Window.showDevTools();
      else
        Window.closeDevTools();
    });
    bindToolsGui();
    vt.loadSavedModels();

  });

})();
