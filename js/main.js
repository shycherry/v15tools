window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
var fs = require('fs');
var tools = [];

function doLayout(){
  $('#vt-central').height($(window).height() - 60);
}

function switchTool(iTool, iCallback){
  $('#vt-main').load(iTool.pathToDir+'/layout.html', function(){
    iCallback(null);
  });
}

function loadTools(){  
  vt.loadTools(function(err, iTools){
    if(!err){
      tools = iTools;      
      for(var idx in iTools){
        var iTool = iTools[idx];
        $('#vt-tabs').append('<span class="v15tool" id="'+iTool.vid+'">'+iTool.name+'</span>');
      }
      
      $('.v15tool').click(function(){        
        var tool = vt.findModelInArray({vid:$(this).attr('id')}, tools);
        switchTool(tool, function(err, data){
          console.log(tool.name+' loaded');
        });
      });
    }
    });
}

$(document).ready(function() {
  doLayout();
  
  $(window).resize(function(){
    doLayout();
  });

  loadTools();
});