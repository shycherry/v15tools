(function(){
  window.makeModelGui = global.makeModelGui = makeModelGui;
  window.removeModelGui = global.removeModelGui = removeModelGui;
  window.makeMultiDroppableZone = global.makeMultiDroppableZone = makeMultiDroppableZone;

  var _globGID = 0;
  var _changeListenersMap = {};

  function templateModelTooltip(iModel){
    return function(){      
      var temp = $('<div class="v15-model-tooltip"></div>');
      for(var idx in iModel){
        if( (typeof iModel[idx]) != 'function'){
          var htmlIdx = encodeHTML(idx);
          var htmlValue = encodeHTML(iModel[idx]);
          temp.append(htmlIdx+' : '+htmlValue+' <br/>');
        }        
      }      
      return temp.html();
    };
  } 

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
    var mainDiv = $('<div></div>');
    var typeDiv = $('<div class="vt-model-typelayer">'+iModel.type+'</div>');
    var nameDiv = $('<div class="vt-model-namelayer">'+iModel.name+'</div>');

    mainDiv.update = function(iModel, iChange){
      if(iChange === 'name'){
        nameDiv.contents().remove();
        nameDiv.append(''+iModel.name);
      }
    }

    mainDiv.append(typeDiv);
    mainDiv.append(nameDiv);

    return mainDiv;
  }

  function templateModelGuiFactory(iModel){
    var newModelGui = null;
    switch(iModel.type){
      case 'FILE':
        newModelGui = templateFILEGui(iModel);
        break;
      case 'WS':
        newModelGui = templateWSGui(iModel);
        break;        
      default:
        newModelGui = templateDefaultGui(iModel);
    }
    if(newModelGui){
      newModelGui.addClass("vt-interactif vt-model");
      newModelGui.attr('vid', iModel.vid);
      newModelGui.attr('gid', _globGID);
      _globGID++;
    }
    return newModelGui;
  }

  function makeModelGui(iModel){
    
    var newModelGui = templateModelGuiFactory(iModel)
    if(!newModelGui) return;
    
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

    newModelGui.tooltip({
      content:templateModelTooltip(iModel),
      items:'.vt-model',
      show:1000,
      hide:100
    });

    newModelGui.click(function(){
      //todo : restreindre ce comportement aux zones de selection
      newModelGui.toggleClass('selected');
    });

    var onChangeListener = function(iChange){      
      newModelGui.update(iModel, iChange);
    }
    iModel.on('change', onChangeListener);
    var newModelGuiGID = newModelGui.attr('gid');
    _changeListenersMap[newModelGuiGID] = {
      model: iModel,      
      registeredListener: onChangeListener
    };    
    return newModelGui;
  }

  function removeModelGui(iModelGui){    
    var modelGuiGID = iModelGui.attr('gid');
    var modelGuiChangeListenerEntry = _changeListenersMap[modelGuiGID];
    if(modelGuiChangeListenerEntry){
      delete _changeListenersMap[modelGuiGID];
      var model = modelGuiChangeListenerEntry.model;
      var listener = modelGuiChangeListenerEntry.registeredListener;
      if(model && listener){
        model.removeListener('change', listener);
      }
    }

    iModelGui.remove();
  }

  function getOthersSelectedBrosModelsOf(iModelGui){
    var result = [];
    var selectedOthers = iModelGui.siblings('.vt-model.selected');
    if(selectedOthers){
      for(var idx = 0; idx < selectedOthers.length; idx++){
        
        var otherSelected = $(selectedOthers[idx]);
        if(!otherSelected) continue;

        var vid = otherSelected.attr('vid');
        if(!vid) continue;
        
        var model = vt.findModel({'vid': vid});
        if(!model) return;

        result.push(model);
      }
    }
    return result;
  }

  function makeMultiDroppableZone(iJQueryObject, iRestrictedToClass){
    var newGui = (iJQueryObject)?iJQueryObject : $('<div></div>');
    newGui.addClass('vt-multidroppablezone');
    var _models = [];

    newGui.addModel = function addModel(model){

      if(iRestrictedToClass && !(model instanceof iRestrictedToClass)){
        return;
      }

      if(_models.indexOf(model) == -1){
        newGui.append(makeModelGui(model));
        _models.push(model);
      }
    }

    newGui.addModels = function addModels(models){
      for(var idx in models){
        var model = models[idx];
        newGui.addModel(model);        
      }
    }

    newGui.removeModel = function removeModel(model){
      if(_models.indexOf(model) != -1){
        _models = _models.filter(function(current){
          return current.vid != model.vid;
        });
        var modelGui = newGui.find('.vt-model[vid="'+model.vid+'"]');
        if(modelGui){
          removeModelGui(modelGui);
        }        
      }
    }

    newGui.removeModels = function removeModels(models){
      for(var idx in models){
        var model = models[idx];
        newGui.removeModel(model);
      }
    }

    newGui.clearModels = function clearModels(){
      newGui.removeModels(_models);
    }

    newGui.getModels = function getModels(){
      return _models.slice(0);
    }

    newGui.contextmenu({
      menu:[
        {
          title:'clear',
          action: function(){
            newGui.clearModels();
          }
        },
        {
          title:'remove selected',
          action: function(){
            var selectedSharedItems = newGui.find('.selected');
            for(var idx = 0; idx < selectedSharedItems.length; idx++){
              var current = $(selectedSharedItems[idx]);
              if(!current) return;
              
              var vid = current.attr('vid');
              if(!vid) return;

              var currentModel = vt.findModel({'vid':vid});
              newGui.removeModel(currentModel);
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
          newGui.addModels(selectedOthers);
        }

        var vid = draggedModelGui.attr('vid');
        if(!vid) return;
        
        var model = vt.findModel({'vid': vid});
        if(!model) return;

        newGui.addModel(model);
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
  