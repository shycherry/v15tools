function isODTKo(iLine){
	return (/ : KO, rc =.*/.test(iLine)) || (/.*:.*failed code.*/.test(iLine));
}

function getMKODTCompliantLine(iLine){
  return iLine.replace(/ : KO,.*/g, '').replace(/## /g, '').replace(/   /g, ' TestCases ');
}

exports.load = function(){
  $('#rwf_filter_btn').button().click(function(){
  	var lines=[];
  	var total_output='';
  	var total_input = $('#rwf_input').val();

  	lines = total_input.split('\n');

  	for(var i in lines){
  		if(isODTKo(lines[i])){
        var lineToAdd = getMKODTCompliantLine(lines[i]);
  			total_output+=lineToAdd+'\n';
  		}
  	}

  	$('#rwf_output').val(total_output);
  });
}

exports.reload = function(){
  
}