window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
var fs = require('fs');
var tools = [];

function switchTool(iTool, iCallback){
  $('.v15main').load(iTool.pathToDir+'/layout.html', function(){
    iCallback(null);
  });
}

function loadTools(){
  vt.loadTools(function(err, iTools){
    if(!err){
      tools = iTools;      
      for(var idx in iTools){
        var iTool = iTools[idx];
        $('.v15ToolsContainer').append('<button class="btn btn-default v15tool" id="'+iTool.vid+'">'+iTool.name+'</button>');
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
  loadTools();
});