(function(){
  window.makeModelGui = global.makeModelGui = makeModelGui;
  window.makeMultiDroppableZone = global.makeMultiDroppableZone = makeMultiDroppableZone;

  function templateFILEGui(iModel){
    var gui = templateDefaultGui(iModel);
    gui.addClass('vt-itempath vt-file');
    return gui;
  }
  
  function templateWSGui(iModel){
    var gui = templateDefaultGui(iModel);
    gui.addClass('vt-itempath vt-ws');
    return gui;
  }
  
  function templateDefaultGui(iModel){
    return $('<div id="'+iModel.vid+'"><div class="vt-model-namelayer">'+iModel.name+'</div><div class="vt-model-typelayer">'+iModel.type+'</div></div>');
  }

  function templateModelGuiFactory(iModel){
    switch(iModel.type){
      case 'FILE':
        return templateFILEGui(iModel);
      case 'WS':
        return  templateWSGui(iModel);
        break;        
      default:
        return templateDefaultGui(iModel);
    }
    return null;
  }

  function makeModelGui(iModel){
    
    var templateGui = templateModelGuiFactory(iModel)
    if(!templateGui) return;

    var newModelGui = templateGui;
    newModelGui.addClass("vt-interactif vt-model");
    newModelGui.draggable({
      revert: 'invalid',
      helper: function(event){
        var selectedCount = 1 + getOthersSelectedBrosModelsOf(newModelGui).length;

        if(selectedCount >1){
          return $('<div>...'+selectedCount+' items...</div>');        
        }else{
          return newModelGui.clone();
        }
        
      },
      containment: 'window',
      distance:10
    });

    newModelGui.click(function(){
      newModelGui.toggleClass('selected');
    });

    return newModelGui;
  }

  function getOthersSelectedBrosModelsOf(iModelGui){
    var result = [];
    var selectedOthers = iModelGui.siblings('.vt-model.selected');
    if(selectedOthers){
      for(var idx = 0; idx < selectedOthers.length; idx++){
        
        var otherSelected = $(selectedOthers[idx]);
        if(!otherSelected) continue;

        var vid = otherSelected.attr('id');
        if(!vid) continue;
        
        var model = vt.findModel({'vid': vid});
        if(!model) return;

        result.push(model);
      }
    }
    return result;
  }

  function makeMultiDroppableZone(iJQueryObject){
    var newGui = (iJQueryObject)?iJQueryObject : $('<div></div>');
    newGui.addClass('vt-multidroppablezone');
    var _sharedItems = [];

    function addSharedItem(model){
      if(_sharedItems.indexOf(model) == -1){
        newGui.append(makeModelGui(model));
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
        newGui.find('.vt-model[id="'+model.vid+'"]').remove();        
      }
    }

    function removeSharedItems(models){
      for(var idx in models){
        var model = models[idx];
        removeSharedItem(model);
      }
    }

    function clearSharedItems(){
      newGui.contents().remove();
      _sharedItems = [];
    }

    newGui.contextmenu({
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
            var selectedSharedItems = newGui.find('.selected');
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

    newGui.droppable({
      accept: '.vt-model',
      tolerance: 'pointer',
      drop: function(event, ui){

        var draggedModelGui = ui.draggable;

        if(!draggedModelGui){
          return;
        }

        var selectedOthers = getOthersSelectedBrosModelsOf(draggedModelGui);
        if(selectedOthers.length){
          addSharedItems(selectedOthers);
        }

        var vid = draggedModelGui.attr('id');
        if(!vid) return;
        
        var model = vt.findModel({'vid': vid});
        if(!model) return;

        addSharedItem(model);
      }
    });

    newGui.selectable({
      filter:'.vt-model',
      selected: function(event, ui){
        $(ui.selected).toggleClass('selected');
      }
    });

    return newGui;
  }


})();
  