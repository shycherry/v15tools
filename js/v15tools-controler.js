global.$ = window.$;
window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
var fs = require('fs');
var tools = [];

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
      tools = iTools;
      for(var idx in iTools){
        var iTool = iTools[idx];
        $('#vt-tabs').append('<span class="v15tool" id="'+iTool.vid+'"><p>'+iTool.name+'</p></span>');
      }
      
      $('.v15tool').click(function(){
        $('.v15tool').removeClass('active');
        $(this).addClass('active');
        var tool = vt.findModelInArray({vid:$(this).attr('id')}, tools);
        switchTool(tool, function(err, data){
          console.log(tool.name+' loaded');
        });
      });
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
    var newShellDiv = $('<div class="v15shell" vid="'+shell.vid+'">Shell</div>');
    $(newShellDiv).tooltip({
      content:makeShellTooltipContent(shell),
      items:'.v15shell',      
      show:500,
      hide:10000
    });
    $('#vt-status').append(newShellDiv);    
  });
}

$(document).ready(function() {
  relayout();
  
  $(window).resize(function(){
    relayout();
  });

  bindToolsGui();
  bindShellsGui();
});