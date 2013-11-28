(function(){
  global.$ = window.$;
  window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
  window.encodeHTML = global.encodeHTML = encodeHTML;

  var fs = require('fs');
  var _tools = [];
  var _sharedItems = [];

  function templateShellTooltip(iShell){
    return function(){
      var eData = encodeHTML(iShell.fullOutput);
      return '<div class="v15shell-tooltip">'+eData+'</div>';
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
          shellTaskGui.addClass('vt-shelltask-working');
        break;

        case 'enqueued':
          shellTaskGui.removeClass('vt-shelltask-working');
          shellTaskGui.removeClass('vt-shelltask-canceled');
          shellTaskGui.addClass('vt-shelltask-enqueued');
        break;

        case 'canceled':
          shellTaskGui.removeClass('vt-shelltask-enqueued');
          shellTaskGui.removeClass('vt-shelltask-working');
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
      if(event.which == 38){ //up arrow key
        newShellInputText.autocomplete('search', '');
      }
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
      show:500,
      hide:10000
    });
    iShellModel.on('working', function(){
      newShellGui.removeClass('vt-idle');
      newShellGui.addClass('vt-working');
    })
    iShellModel.on('idle', function(){
      newShellGui.removeClass('vt-working');
      newShellGui.addClass('vt-idle');    
    })

    return newShellGui;
  }

  function relayout(){
    $('#vt-central').height($(window).height() - ($('#vt-status').height() + $('#vt-tabs').height()));
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

  function switchTool(iTool, iCallback){
    $('#vt-main').load(iTool.pathToDir+'/layout.html', function(){
      iCallback(null);
    });
  }

  function bindToolsGui(){
    vt.loadTools(function(err, iTools){
      if(!err){
        _tools = iTools;
        for(var idx in iTools){
          var iTool = iTools[idx];
          $('#vt-tabs').append('<span class="v15tool" id="'+iTool.vid+'"><p>'+iTool.name+'</p></span>');
        }
        
        $('.v15tool').click(function(){
          $('.v15tool').removeClass('active');
          $(this).addClass('active');
          var tool = vt.findModelInArray({vid:$(this).attr('id')}, _tools);
          switchTool(tool, function(err, data){
            console.log(tool.name+' loaded');
          });
        });
      }
      });
  }

  function bindShareGui () {
    var $vt_share = $('#vt-share');
    
    $vt_share.contextmenu({
      menu:[
        {
          title:'clear',
          action: function(){
            clearSharedItems();
          }
        },
        {
          title:'remove selected',
          action: function(){
            var selectedSharedItems = $vt_share.find('.selected');
            for(var idx = 0; idx < selectedSharedItems.length; idx++){
              var current = $(selectedSharedItems[idx]);
              if(!current) return;
              
              var vid = current.attr('id');
              if(!vid) return;

              var currentModel = vt.findModel({'vid':vid});
              removeSharedItem(currentModel);
            }
          }
        }
      ]
    });

    $vt_share.droppable({
      accept: '.vt-model',
      drop: function(event, ui){

        if(!ui.draggable){
          return;
        }

        var selectedOthers = ui.draggable.siblings('.vt-model.selected');
        if(selectedOthers){
          for(var idx = 0; idx < selectedOthers.length; idx++){
            
            var otherSelected = $(selectedOthers[idx]);
            if(!otherSelected) continue;

            var vid = otherSelected.attr('id');
            if(!vid) continue;

            var model = vt.findModel({'vid': vid});
            if(!model) continue;

            addSharedItem(model);
          }
        }

        var vid = ui.draggable.attr('id');
        if(!vid) return;
        
        var model = vt.findModel({'vid': vid});
        if(!model) return;

        addSharedItem(model);
      }
    });

    $vt_share.selectable({
      filter:'.vt-model',
      selected: function(event, ui){
        $(ui.selected).toggleClass('selected');
      }
    });

  }

  function bindShellsGui(){
    vt.on('shell_created', function(shell){
      var newShellGui = makeShellGui(shell);
      $('#vt-status').append(newShellGui);
    });

    vt.on('shell_locked', function(shell){
      console.log(shell.vid+' locked');
    });

    vt.on('shell_released', function(shell){
      console.log(shell.vid+' released');
    });
    
  }


  function addSharedItem(model){
    if(_sharedItems.indexOf(model) == -1){
      $('#vt-share').append(makeModelGui(model));
      _sharedItems.push(model);
    }
  }

  function addSharedItems(models){
    for(var idx in models){
      var model = models[idx];
      addSharedItem(model);
    }
  }

  function removeSharedItem(model){
    if(_sharedItems.indexOf(model) != -1){
      _sharedItems = _sharedItems.filter(function(current){
        return current.vid != model.vid;
      });
      $('#vt-share .vt-model[id="'+model.vid+'"]').remove();
    }
  }

  function removeSharedItems(models){
    for(var idx in models){
      var model = models[idx];
      removeSharedItem(model);
    }
  }

  function clearSharedItems(){
    $('#vt-share').contents().remove();
    _sharedItems = [];
  }

  $(document).ready(function() {
    relayout();
    
    $(window).resize(function(){
      relayout();
    });

    bindToolsGui();
    bindShareGui();
    bindShellsGui();

    vt.loadSavedModels();
  });

})();
