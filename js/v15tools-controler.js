global.$ = window.$;
window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
window.makeWSPGui = global.makeWSPGui = makeWSPGui;

var fs = require('fs');
var _tools = [];
var _sharedItems = [];

function relayout(){
  $('#vt-central').height($(window).height() - 60);
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

function makeShellTooltipContent(iShell){
  return function(){
    var eData = String(iShell.fullOutput).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(\n)/g,'<br/>');  
    return '<div class="v15shell-tooltip">'+eData+'</div>';
  }  
}

function bindShellsGui(){  
  vt.on('shell_created', function(shell){
    var newShellDiv = $('<div class="v15shell" vid="'+shell.vid+'">> _</div>');
    $(newShellDiv).tooltip({
      content:makeShellTooltipContent(shell),
      items:'.v15shell',      
      show:500,
      hide:10000
    });
    $('#vt-status').append(newShellDiv);    
  });

  vt.on('shell_owned', function(shell){
    //$('.v15shell')
    console.log(shell.vid+' owned');
  });

  vt.on('shell_released', function(shell){
    console.log(shell.vid+' shell_released');
  });
}

function makeWSPGui(iWSPModel){
  var newWSPGui = $('<div id="'+iWSPModel.vid+'">'+iWSPModel.name+'</div>');
  newWSPGui.addClass("vt-itempath vt-wsp");
  newWSPGui.draggable({
    revert: 'invalid',
    helper: 'clone',
    containment: 'window',
    distance:10
  });

  newWSPGui.click(function(){    
    newWSPGui.toggleClass('selected');
  });

  return newWSPGui;
}


function addSharedItem(model){
  if(_sharedItems.indexOf(model) == -1){
    $('#vt-share').append(makeWSPGui(model));
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