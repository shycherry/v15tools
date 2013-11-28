(function(){
  window.makeModelGui = global.makeModelGui = makeModelGui;
  window.getOthersSelectedBrosModelsOf = global.getOthersSelectedBrosModelsOf = getOthersSelectedBrosModelsOf;


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
    return $('<div id="'+iModel.vid+'">'+iModel.name+'</div>');
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


})();
  