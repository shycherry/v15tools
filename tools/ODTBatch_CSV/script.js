var _ = require('underscore');

var EXECNAME = "_Execname";

function getAttributeNames(iLine){
  var result = [];
  var currentMatch = null;
  var attributeNamesRegex = / -(\D\w+)/g;
  result.push(EXECNAME);

  do{
    currentMatch = attributeNamesRegex.exec(iLine);
    if(currentMatch && currentMatch[1])
      result.push(currentMatch[1]);
  }while(currentMatch);

  return result;
}

function isAttributeSet(iLine, iAttributeName){
  var attributeRegex = RegExp('-'+iAttributeName);
  attributeRegex.global = true;
  var match = attributeRegex.exec(iLine);
  if(match)
    return true;
}

function formatValue(iRawValue){
  return iRawValue.trim().replace(/^"/, '').replace(/"$/, '');
}

function getAttributeValue(iLine, iAttributeName){
  var endlineAttributeRegex = RegExp('-'+iAttributeName+' (.+)');
  var stddAttributeRegex = RegExp('-'+iAttributeName+' (.+?) ');
  var execnameAttributeRegex = RegExp('(^[^# ]+) ');

  var regex = null;
  var match = null;

  //execname case
  if(iAttributeName === EXECNAME)
  {
    regex = execnameAttributeRegex;
    
    match = regex.exec(iLine);
    if(match && match[1]){
      return formatValue(match[1]);
    }

  }else{
    regex = stddAttributeRegex;

    match = regex.exec(iLine);
    if(match && match[1]){
      return formatValue(match[1]);
    }

    regex = endlineAttributeRegex;

    match = regex.exec(iLine);
    if(match && match[1]){
      return formatValue(match[1]);
    }
  }
  
}

function getAllColumnsNames(iLines){
  var colNamesArray = [];
  for (var i in iLines ) {
    var namesArray = getAttributeNames(iLines[i]);
    colNamesArray = _.union(colNamesArray, namesArray);
  };
  return colNamesArray;
}

exports.load = function(){
  
  $('#obc_filter_btn').button().click(function(){
    var lines=[];
    var total_output='';
    var total_input = $('#obc_input').val();

    lines = total_input.split('\n');

    var colNames=getAllColumnsNames(lines);

    //first row : names
    for (var i = 0; i< colNames.length; i++){
      total_output+=colNames[i];
      if(i < (colNames.length-1))
        total_output+=',';
    };
    total_output+='\n';

    //next rows
    for(var i = 0; i < lines.length; i++){      
      var currentLine = lines[i];
      var lineToAdd = '';

      for(var j = 0;  j < colNames.length; j++){
        var currentAttributeName = colNames[j];
        var value = getAttributeValue(currentLine, currentAttributeName);
        if(value){
         lineToAdd+=value;
        }else{
          if(isAttributeSet(currentLine, currentAttributeName))
            lineToAdd+='--set-no-value--'          
        }
        if(j < (colNames.length-1))
          lineToAdd+=',';

      }  

      total_output+=lineToAdd+'\n';
    }

    $('#obc_output').val(total_output);
  });
}

exports.reload = function(){
  
}