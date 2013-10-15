window.vt = global.vt = require('./v15core/v15tools.js').V15Tools;
var fs = require('fs');


$(document).ready(function() {
	fs.readdir('./tools', function(err, files){
		if(err){
			console.error(err);
			return;
		}
		for(var idx in files){
			var currentToolName = files[idx];
			fs.exists('./tools/'+currentToolName+'/layout.html', function(exists){
				if(exists){
					$('.v15ToolsContainer').append('<button class="btn btn-default">'+currentToolName+'</button>');
				}
			});
		}
	});
});