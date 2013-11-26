function isODTKo(iLine){
	return (/ : KO, rc =.*/.test(iLine)) || (/.*:.*failed code.*/.test(iLine));
}

exports.init = function(){
  $('#rwf_filter_btn').button().click(function(){
  	var lines=[];
  	var total_output='';
  	var total_input = $('#rwf_input').val();

  	lines = total_input.split('\n');

  	for(var i in lines){
  		if(isODTKo(lines[i])){
  			total_output+=lines[i]+'\n';
  		}
  	}

  	$('#rwf_output').val(total_output);
  });
}
