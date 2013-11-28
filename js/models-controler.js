(function(){
  window.makeModelGui = global.makeModelGui = makeModelGui;
  
  function makeModelGui(iWSModel){
    var newWSGui = $('<div id="'+iWSModel.vid+'">'+iWSModel.name+'</div>');
    newWSGui.addClass("vt-interactif vt-model vt-itempath vt-ws");
    newWSGui.draggable({
      revert: 'invalid',
      helper: function(event){
        var selectedCount = 1;
        var selectedOthers = newWSGui.siblings('.vt-model.selected');
        if(selectedOthers){
          for(var idx = 0; idx < selectedOthers.length; idx++){
            
            var otherSelected = $(selectedOthers[idx]);
            if(!otherSelected) continue;

            var vid = otherSelected.attr('id');
            if(!vid) continue;

            selectedCount++;
          }
        }

        if(selectedCount >1){
          return $('<div>...'+selectedCount+' items...</div>');        
        }else{
          return newWSGui.clone();
        }
        
      },
      containment: 'window',
      distance:10
    });

    newWSGui.click(function(){
      newWSGui.toggleClass('selected');
    });

    return newWSGui;
  }
})();
  