(function(){
  window.makeModelGui = global.makeModelGui = makeModelGui;
  window.removeModelGui = global.removeModelGui = removeModelGui;
  window.makeMultiDroppableZone = global.makeMultiDroppableZone = makeMultiDroppableZone;

  // var nwGui = require('nw.gui');

  var _globGID = 0;
  var _changeListenersMap = {};
  var _contextMenuLockAvailable = true;

  function templateFullPathGui(iModel){
    var gui = templateDefaultGui(iModel);
    gui.addClass('vt-itempath vt-fullpath');
    gui.contextmenu({
      beforeOpen: function(event, ui){
        if(_contextMenuLockAvailable){
          _contextMenuLockAvailable = false;
          return true;
        }
        return false;
      },
      close: function(event){
        _contextMenuLockAvailable = true;
      },
      menu:[
        {
          title:'open',
          action: function(){
            // nwGui.Shell.openItem(iModel.path);
          }
        }
      ]
    });
    return gui;
  }

  function templateFILEGui(iModel){
    var gui = templateDefaultGui(iModel);
    gui.addClass('vt-itempath vt-file');
    return gui;
  }

  function templateWSGui(iModel){
    var gui = templateDefaultGui(iModel);
    gui.addClass('vt-itempath vt-ws');
    gui.contextmenu({
      beforeOpen: function(event, ui){
        if(_contextMenuLockAvailable){
          _contextMenuLockAvailable = false;
          return true;
        }
        return false;
      },
      close: function(event){
        _contextMenuLockAvailable = true;
      },
      menu:[
        {
          title:'save',
          action: function(){
            vt.saveModel(iModel, function(err){
              if(err){
                console.log("error save : "+err);
              }else{
                console.log(iModel.name+" saved ! ");
              }
            });
          }
        }
      ]
    });
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
      case 'FullPath':
        newModelGui = templateFullPathGui(iModel);
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
      distance:10,
      appendTo:'#vt-central'
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
    return newModelGui[0];
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

  function makeMultiDroppableZone(iJQueryObject, iRestrictedToClass, iMaxCount){
    var newGui = (iJQueryObject)? $(iJQueryObject) : $('<div></div>');
    var newGuiElem = newGui[0];

    newGui.addClass('vt-multidroppablezone');
    var _models = [];

    newGui.contextmenu({
      beforeOpen: function(event, ui){
        if(_contextMenuLockAvailable){
          _contextMenuLockAvailable = false;
          return true;
        }
        return false;
      },
      close: function(event){
        _contextMenuLockAvailable = true;
      },
      menu:[
        {
          title:'select all',
          action: function(){
            newGuiElem.selectAll();
          }
        },
        {
          title:'unselect all',
          action: function(){
            newGuiElem.unselectAll();
          }
        },
        {
          title:'remove selected',
          action: function(){
            var selectedSharedItems = newGuiElem.find('.selected');
            for(var idx = 0; idx < selectedSharedItems.length; idx++){
              var current = $(selectedSharedItems[idx]);
              if(!current) return;

              var vid = current.attr('vid');
              if(!vid) return;

              var currentModel = vt.findModel({'vid':vid});
              newGuiElem.removeModel(currentModel);
            }
          }
        },
        {
          title:'remove all',
          action: function(){
            newGuiElem.removeAllModels();
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
          newGuiElem.addModels(selectedOthers);
        }

        var vid = draggedModelGui.attr('vid');
        if(!vid) return;

        var model = vt.findModel({'vid': vid});
        if(!model) return;

        newGuiElem.addModel(model);
      }
    });

    newGui.selectable({
      filter:'.vt-model',
      selected: function(event, ui){
        $(ui.selected).toggleClass('selected');
      }
    });

    newGuiElem.addModel = function addModel(model){

      if(iRestrictedToClass && !(model instanceof iRestrictedToClass)){
        return;
      }

      if(iMaxCount && _models.length >= iMaxCount){
        return;
      }

      if(_models.indexOf(model) == -1){
        newGuiElem.append(makeModelGui(model));
        _models.push(model);
        newGuiElem.trigger('models_changed');
      }
    }

    newGuiElem.addModels = function addModels(models){
      for(var idx in models){
        var model = models[idx];
        newGuiElem.addModel(model);
      }
    }

    newGuiElem.removeModel = function removeModel(model){
      if(_models.indexOf(model) != -1){
        _models = _models.filter(function(current){
          return current.vid != model.vid;
        });
        var modelGui = newGuiElem.find('.vt-model[vid="'+model.vid+'"]');
        if(modelGui){
          removeModelGui(modelGui);
          newGuiElem.trigger('models_changed');
        }
      }
    }

    newGuiElem.removeModels = function removeModels(models){
      for(var idx in models){
        var model = models[idx];
        newGuiElem.removeModel(model);
      }
    }

    newGuiElem.removeAllModels = function removeAllModels(){
      newGuiElem.removeModels(_models);
    }

    newGuiElem.unselectAll = function unselectAll(){
      newGuiElem.find('.vt-model.selected').removeClass('selected');
    }

    newGuiElem.selectAll = function selectAll(){
      newGuiElem.find('.vt-model').addClass('selected');
    }

    newGuiElem.getModels = function getModels(){
      return _models.slice(0);
    }

    return newGui;
  }


})();
