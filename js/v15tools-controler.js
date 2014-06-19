(function(){
  global.$ = window.$;
  var path = require('path');
  window.vt = global.vt = require(path.resolve('./v15core/v15tools.js')).V15Tools;
  window.encodeHTML = global.encodeHTML = encodeHTML;

  var fs = require('fs');
  var _tools = [];
  var _currentTool;
  var gui = require('nw.gui');

  function templateShellTooltip(iShell){
    return function(){
      var eData = encodeHTML(iShell.name);
      return '<div class="v15shell-tooltip"> ShellName: '+eData+'</div>';
    };
  }  

  function makeShellTaskGui(iShellTaskModel){
    var shellTaskGui = $('<div class="vt-interactif vt-shelltask" id="'+iShellTaskModel.vid+'">'+iShellTaskModel.command+'</div>');
    
    shellTaskGui.click(function(){
      if(iShellTaskModel.getStatus() == 'enqueued'){
        iShellTaskModel.setStatus('canceled');
      }else if(iShellTaskModel.getStatus() == 'canceled'){
        iShellTaskModel.setStatus('enqueued');
      }
    });

    var statusChangeCallback = function(iStatus){
      switch(iStatus){
        case 'working':
          shellTaskGui.removeClass('vt-shelltask-enqueued');
          shellTaskGui.removeClass('vt-shelltask-canceled');          
          shellTaskGui.addClass('vt-working');
        break;

        case 'enqueued':
          shellTaskGui.removeClass('vt-working');
          shellTaskGui.removeClass('vt-shelltask-canceled');
          shellTaskGui.addClass('vt-shelltask-enqueued');
        break;

        case 'canceled':
          shellTaskGui.removeClass('vt-shelltask-enqueued');
          shellTaskGui.removeClass('vt-working');
          shellTaskGui.addClass('vt-shelltask-canceled');
        break;

        case 'dropped':
          iShellTaskModel.removeListener('change_status', statusChangeCallback);
        break;
      }
    };

    iShellTaskModel.on('change_status', statusChangeCallback);

    statusChangeCallback(iShellTaskModel.getStatus());
    return shellTaskGui;
  }

  function makeShellWindow(iShellModel){
    var shellHistory = [];
    var lastKeydown = 0;
    if(vt.getConfig().baseAutoComplete){
      shellHistory = vt.getConfig().baseAutoComplete;
    }
    
    var relayoutShellWindow = function(){
      newShellInputText.width(newShellInputBar.width() - newShellEnqueueBtn.width() - 15);
      newShellViewport.height(newShellWindow.height() - newShellInputBar.height() - newShellTasksContainer.height());
    };

    var scrollViewportToBottomLeft = function(){
      newShellViewport[0].scrollTop=newShellViewport[0].scrollHeight;
      newShellViewport[0].scrollLeft=0;
    };

    var pushCommandCallback = function(){
      var userInput = newShellInputText.val();
      if(userInput && userInput !== ""){
        var userShellTask = new vt.ShellTask({
          requiredShellVID: iShellModel.vid,
          command: userInput,
        });
        vt.pushShellTask(userShellTask);
        if(shellHistory.indexOf(userInput) == -1){
          shellHistory.push(userInput);
        }
        newShellInputText.val('');
        newShellInputText.autocomplete("close");
      }
    };

    var newShellWindow = $('<div title="'+iShellModel.vid+'" id="'+iShellModel.vid+'"></div>');
    var newShellViewport = $('<div class="vt-shell-viewport"></div>').appendTo(newShellWindow);
    var newShellTasksContainer = $('<div class="vt-shelltasks-container"></div>').appendTo(newShellWindow);
    var newShellInputBar = $('<div class="vt-shell-inputbar"></div>').appendTo(newShellWindow);
    var newShellInputText = $('<input/>').appendTo(newShellInputBar);
    var newShellEnqueueBtn = $('<button>Enqueue</button>').appendTo(newShellInputBar);

    newShellWindow.dialog({
      autoOpen: false,
      height: 300,
      width: 600,
      resize: relayoutShellWindow,
      focus: relayoutShellWindow,
      open: scrollViewportToBottomLeft
    });

    newShellInputText.autocomplete({
      source: shellHistory,
      minLength: 0,
      delay: 100,      
      position: {my: 'left bottom', at: 'left top'}
    });

    newShellEnqueueBtn.button();
    
    iShellModel.on('stdout_data', function(data){
      newShellViewport.append(encodeHTML(data));
      scrollViewportToBottomLeft();
    });

    iShellModel.on('stderr_data', function(data){
      newShellViewport.append('<span class="vt-shell-stderr">'+encodeHTML(data)+'</span>');
      scrollViewportToBottomLeft();
    });

    iShellModel.on('shelltask_enqueued', function(iShellTaskModel){
      var newShellTaskGui = makeShellTaskGui(iShellTaskModel);
      newShellTasksContainer.append(newShellTaskGui);
      relayoutShellWindow();
    });

    iShellModel.on('shelltask_consumed', function(iShellTaskModel){
      var shellTaskGui = newShellTasksContainer.find('#'+iShellTaskModel.vid);
      shellTaskGui.remove();
      relayoutShellWindow();
    });

    newShellInputText.keydown(function(event){      
      if(event.which == 13){ //enter key      
        pushCommandCallback();
      }
      if(event.which == 38 && (lastKeydown != 38)){ //up arrow key
        newShellInputText.autocomplete('search', '');
      }
      lastKeydown = event.which;      
    });

    newShellEnqueueBtn.click(pushCommandCallback);

    return newShellWindow;
  }

  function makeShellGui(iShellModel){
    var newShellGui = $('<div class="vt-interactif" id="'+iShellModel.vid+'">> _</div>');
    newShellGui.addClass("v15shell");
    var newShellWindow = makeShellWindow(iShellModel);
    newShellGui.click(function(){
      newShellWindow.dialog('open');
    });
    newShellGui.tooltip({
      content:templateShellTooltip(iShellModel),
      items:'.v15shell',
      show:100,
      hide:1000
    });
    iShellModel.on('working', function(){
      newShellGui.removeClass('vt-shell-idle');
      newShellGui.addClass('vt-working');
    })
    iShellModel.on('idle', function(){
      newShellGui.removeClass('vt-working');
      newShellGui.addClass('vt-shell-idle');    
    })

    return newShellGui;
  }

  function relayout(){
    $('#vt-central').height($(window).height() - ($('#vt-status').height() + $('#vt-tabs').height()));
    $('#vt-central').width($(window).width());
  }

  function encodeHTML(iText){
    if(! iText){
      return '';
    }

    if( !(iText.replace) ){
      iText = iText.toString();
    }

    if(iText.replace){
      return iText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(\n)/g,'<br/>');
    }else{
      return '';
    }
  }

  function openTool(iTool, iCallback){
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
      var newToolDOM = $('<div id='+iTool.vid+'></div>');
      mainZone.append(newToolDOM);
      newToolDOM.load(iTool.pathToDir+'/layout.html', function(){
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

  function closeTool(iTool, iCallback){
    var hiddenZone = $('#vt-hidden');
    var mainZone = $('#vt-main');

    var toolToCloseDOM = mainZone.find('#'+iTool.vid)[0];
    if(toolToCloseDOM){
      toolToCloseDOM = $(toolToCloseDOM).detach();
      hiddenZone.append(toolToCloseDOM);      
    }
    iCallback(null, 'closed');
  }

  function switchTool_old(iOldTool, iNewTool, iCallback){
    
    var oldToolDOM = $('#vt-main').contents();
    if(iOldTool && oldToolDOM){
      iOldTool.cachedDOM = oldToolDOM.detach();
    }

    if(iNewTool.cachedDOM){
      iNewTool.cachedDOM.appendTo($('#vt-main'));
      _currentTool = iNewTool;
      require(iNewTool.pathToDir+'/script.js').reload();
      iCallback(null, 'reattached');
    }else{
      $('#vt-main').load(iNewTool.pathToDir+'/layout.html', function(){
        iNewTool.cachedDOM = $('#vt-main').contents();
        _currentTool = iNewTool;
        require(iNewTool.pathToDir+'/script.js').load();
        iCallback(null, 'loaded');
      });
    }    
  }

  function bindToolsGui(){
    vt.loadTools(function(err, iTools){
      if(!err){
        _tools = iTools;
        for(var idx in iTools){
          var iTool = iTools[idx];
          $('#vt-tabs').append('<span class="v15tool" id="'+iTool.vid+'"><p>'+iTool.name+'</p></span>');
          relayout();
        }
        
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
      }
      });
  }

  function bindShareGui () {
    var $vt_share = $('#vt-share');
    makeMultiDroppableZone($vt_share);
  }

  function bindShellsGui(){
    vt.on('shell_created', function(shell){
      var newShellGui = makeShellGui(shell);
      $('#vt-status').append(newShellGui);
    });

    vt.on('shell_locked', function(shell){
      console.log(shell.vid+' locked');
    });

    vt.on('shell_unlocked', function(shell){
      console.log(shell.vid+' unlocked');
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
    bindShareGui();
    bindShellsGui();
    vt.loadSavedModels();

  });

})();
