var Path = require('path');
var _dropZonesModels=[];

function makeModelsList(iModels){
  //fill drop zones
  for(var idx = 0; idx <= _dropZonesModels.length;  idx++){
    var currentDropZone = _dropZonesModels[idx];
    if(currentDropZone){
      currentDropZone.removeAllModels();
      if(iModels){
        currentDropZone.addModels(iModels);
      }
    }
  }

  //show only dropzones with at least 1 item
  for(var idx = 0; idx < _dropZonesModels.length;  idx++){
    var currentDropZone = _dropZonesModels[idx];
    if(currentDropZone.getModels().length >= 1){
      currentDropZone.appendTo($('#wizz_freewall'));
    }else{
      currentDropZone.detach();
    }
  }
}

function bindGui(){
  $('#wizz_get_models').click(function(){
    var total_input = $('#wizz_input').val();
    var models = vt.magicGetModelsFromText(total_input);
    makeModelsList(models);
  });
   
   _dropZonesModels.push(makeMultiDroppableZone($('#wizz_fws_list'), vt.Types.FW));
   _dropZonesModels.push(makeMultiDroppableZone($('#wizz_mods_list'), vt.Types.MOD));
   _dropZonesModels.push(makeMultiDroppableZone($('#wizz_files_list'), vt.Types.FILE));
   _dropZonesModels.push(makeMultiDroppableZone($('#wizz_fullpathes_list'), vt.Types.FullPath));

   makeModelsList();
}

exports.load = function(){
  bindGui();
};

exports.reload = function(){
};