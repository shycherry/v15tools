global.$ = window.$;
window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
window.encodeHTML = global.encodeHTML = encodeHTML;
window.makeWSGui = global.makeWSGui = makeWSGui;

var fs = require('fs');
var _tools = [];
var _sharedItems = [];


function templateShellTooltip(iShell){
  return function(){
    var eData = encodeHTML(iShell.fullOutput);
    return '<div class="v15shell-tooltip">'+eData+'</div>';
  }  
}

function makeWSGui(iWSModel){
  var newWSGui = $('<div id="'+iWSModel.vid+'">'+iWSModel.name+'</div>');
  newWSGui.addClass("vt-itempath vt-ws");
  newWSGui.draggable({
    revert: 'invalid',
    helper: 'clone',
    containment: 'window',
    distance:10
  });

  newWSGui.click(function(){
    newWSGui.toggleClass('selected');
  });

  return newWSGui;
}

function makeShellWindow(iShellModel){
  var newShellWindow = $('<div title="'+iShellModel.vid+'" vid="'+iShellModel.vid+'"></div>');
  var newShellViewport = $('<div class="vt-shell-viewport"></div>').appendTo(newShellWindow);
  var newShellInputBar = $('<div class="vt-shell-inputbar"></div>').appendTo(newShellWindow);
  var newShellInputText = $('<input/>').appendTo(newShellInputBar);
  var newShellEnqueueBtn = $('<button>Enqueue</button>').button().appendTo(newShellInputBar);
  
  var relayoutShellWindow = function(){
    newShellViewport.height(newShellWindow.height() - newShellInputBar.height());
  }

  var scrollViewportToBottom = function(){
    newShellViewport[0].scrollTop=newShellViewport[0].scrollHeight;
  }

  newShellWindow.dialog({
    autoOpen: false,
    resize: relayoutShellWindow,
    focus: function(){
      console.log('focus');
      relayoutShellWindow();
      newShellViewport[0].scrollTop = newShellViewport[0].lastScrollValue;  
    }
  });

  newShellViewport.scroll(function(){
    newShellViewport[0].lastScrollValue = newShellViewport[0].scrollTop;
  });
  
  iShellModel.on('data', function(data){
    newShellViewport.append(encodeHTML(data));
    scrollViewportToBottom();
  });

  newShellEnqueueBtn.click(function(){
    var userInput = newShellInputText.val();
    if(userInput && userInput !== ""){
      var userShellTask = new vt.ShellTask({
        requiredShellVID: iShellModel.vid,
        command: userInput,
        callback: function(){}
      });
      vt.pushShellTask(userShellTask);
    }
  });  
  return newShellWindow;
}

function makeShellGui(iShellModel){
  var newShellGui = $('<div vid="'+iShellModel.vid+'">> _</div>');
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
  return newShellGui;
}

function relayout(){
  $('#vt-central').height($(window).height() - ($('#vt-status').height() + $('#vt-tabs').height()));
}

function encodeHTML(iText){
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
    accept: '.vt-itempath',
    drop: function(event, ui){
      if(!ui.draggable){
        return;
      }
      var vid = ui.draggable.attr('id');
      if(!vid) return;
      
      var model = vt.findModel({'vid': vid});
      if(!model) return;

      addSharedItem(model);
    }
  });

  $vt_share.selectable({
    filter:'.vt-itempath',
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

  vt.on('shell_owned', function(shell){    
    console.log(shell.vid+' owned');
  });

  vt.on('shell_released', function(shell){
    console.log(shell.vid+' shell_released');
  });

  vt.on('shellmanager_drained', function(){
    console.log('all shells finished working');
  });

  vt.on('shellmanager_saturated', function(){
    console.log('all shells are working');
  });

}


function addSharedItem(model){
  if(_sharedItems.indexOf(model) == -1){
    $('#vt-share').append(makeWSGui(model));
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
    $('#vt-share .vt-itempath[id="'+model.vid+'"]').remove();
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