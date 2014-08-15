function isODTKo(iLine){
  return (/ : KO, rc =.*/.test(iLine)) || (/.*:.*failed code.*/.test(iLine)) || (/ : Killed in max-time/.test(iLine));
}

function getODTFw(iLine){
  var resultArray = /\w+\.tst/.exec(iLine);
  return resultArray? resultArray[0] : '';
}

function getODTName(iLine){
  var resultArray = /\w+\.tst\s+(\S+)/.exec(iLine);
  return resultArray? resultArray[1] : '';
}

function getODTRCode(iLine){  
  if(/ : KO, rc =.*/.test(iLine)){
    var resultArray;
    resultArray = /KO, rc = (\w+)/.exec(iLine);
    return resultArray? resultArray[1] : '';
  }else if(/ : Killed in max-time/.test(iLine)){
    return 'MAX_TIME';
  }
  
}

function getODTObject(iLine){
  return {
    'name': getODTName(iLine),
    'fw': getODTFw(iLine),
    'rc': getODTRCode(iLine)
  }
}

function cloneODT(iOdt){
  return {
    'name': iOdt['name'],
    'fw': iOdt['fw'],
    'rc': iOdt['rc']
  }
}


function isODTInArray(iODTObj, iArray){
  for(var i in iArray){
    var currentObj = iArray[i];
    if(currentObj && (currentObj['name'] == iODTObj['name']) )
      return true;
  }
  return false;
}

function getKOListFromSelector(iSelector){
  var total_input = $(iSelector).val();  
  var result = [];

  var list = total_input.split('\n');
  for(var i in list){
    if(isODTKo(list[i])){
      var lineToAdd = getODTObject(list[i]);
      result.push(lineToAdd);
    }
  }

  return result;
}

function getSecondListNotInFirstList_ODTList(iPrevList, iNewList){
  var result = [];
  for(var i in iNewList){
    var currentODT = iNewList[i];
    if(!isODTInArray(currentODT, iPrevList)){
      result.push(currentODT);
    }
  }
  return result;
}

function getSecondListInFirstList_ODTList(iPrevList, iNewList){
  var result = [];
  for(var i in iNewList){
    var currentODT = iNewList[i];
    if(isODTInArray(currentODT, iPrevList)){
      result.push(currentODT);
    }
  }
  return result;
}

function getODTFromNameInArray(iName, iArray){
  for(var i in iArray){
    var currentObj = iArray[i];
    if(currentObj && (currentObj['name'] == iName) )
      return currentObj;
  }
  return null;
}

function cloneArrayOfObjects(iArray){
  result = [];
  iArray.forEach(function(iOdt){
    result.push(cloneODT(iOdt));
  });
  return result;
}

function createReportList(iODTList, iODTCurrentPreqsList, iODTPreviousList, iODTPreviousPreqsList, iClass, iStatus){
  var output = '';
  if(iODTList.length >= 1){
    for(var i in iODTList){
      var currentODT = iODTList[i];
      var currentPreqODT = getODTFromNameInArray(currentODT['name'], iODTCurrentPreqsList);
      var previousODT = getODTFromNameInArray(currentODT['name'], iODTPreviousList);
      var previousPreqODT = getODTFromNameInArray(currentODT['name'], iODTPreviousPreqsList);

      output +='<tr>';
      var prefix = '<td><div class="'+iClass+'">';
      var postfix = '</div></td>';

      output+=prefix+currentODT['fw']+postfix;
      output+=prefix+currentODT['name']+postfix;
      output+=prefix+iStatus+postfix;

      output+=prefix+currentODT['rc'];
      if(previousODT && previousODT['rc'] != currentODT['rc']){
        output+=' <b>(last: '+previousODT['rc']+')</b>';
      }
      output+=postfix;
      
      if(currentPreqODT){
        output+=prefix+currentPreqODT['rc'];
        if(previousPreqODT){
          if(previousPreqODT['rc'] != currentPreqODT['rc']){
            output+=' <b>(last: '+previousPreqODT['rc']+')</b>';
          }
        }else{
          output+=' <b>(last: 0)</b>';
        }
        output+=postfix;  
      }else{
        output+=prefix+'0';
        if(previousPreqODT){
          output+=' <b>(last: '+previousPreqODT['rc']+')</b>';
        }
        output+=postfix;  
      }

      output+='</tr>';
    }
  }
  return output;
}

function createReport(){
    var previous_ko_list=getKOListFromSelector('#rwr_old_input');
    var previous_ko_preqs_list=getKOListFromSelector('#rwr_old_preqs_input');
    var current_ko_list=getKOListFromSelector('#rwr_new_input');
    var current_ko_preqs_list=getKOListFromSelector('#rwr_new_preqs_input');
    var total_output='';
    
    var new_ko_list = getSecondListNotInFirstList_ODTList(previous_ko_list, current_ko_list);
    var new_ko_replay_only_list = getSecondListNotInFirstList_ODTList(current_ko_preqs_list, new_ko_list);
    var new_ko_preqs_too_list = getSecondListInFirstList_ODTList(current_ko_preqs_list, new_ko_list);
    var still_ko_list = getSecondListInFirstList_ODTList(previous_ko_list, current_ko_list);
    var nomore_ko_list = getSecondListNotInFirstList_ODTList(current_ko_list, previous_ko_list);
    
    nomore_ko_list = cloneArrayOfObjects(nomore_ko_list);
    nomore_ko_list.forEach(function(iOdt){
      iOdt['rc'] = '0';
    })

    total_output+='<table id="rwr_report_table">';
    total_output+='<tr>';
    total_output+='<th><b>Framework</b></th>';
    total_output+='<th><b>ODT Name</b></th>';
    total_output+='<th><b>Status</b></th>';
    total_output+='<th><b>RC(Replay)</b></th>';
    total_output+='<th><b>RC(PreqOnly)</b></th>';
    total_output+='</tr>';

    total_output += createReportList(new_ko_replay_only_list, current_ko_preqs_list, previous_ko_list, previous_ko_preqs_list, 'rwr_new_ko_replay_only', 'NEW_KO');
    total_output += createReportList(new_ko_preqs_too_list, current_ko_preqs_list, previous_ko_list, previous_ko_preqs_list, 'rwr_new_ko_preqs_too', 'NEW_KO');
    total_output += createReportList(nomore_ko_list, current_ko_preqs_list, previous_ko_list, previous_ko_preqs_list, 'rwr_nomore_ko', 'OK');
    total_output += createReportList(still_ko_list, current_ko_preqs_list, previous_ko_list, previous_ko_preqs_list, 'rwr_still_ko_too', 'STILL_KO');

    total_output+='</table>'

    $('#rwr_output').html(total_output);
  }

exports.load = function(){
  $('#rwr_old_input').on('change', createReport);
  $('#rwr_old_preqs_input').on('change', createReport);
  $('#rwr_new_input').on('change', createReport);
  $('#rwr_new_preqs_input').on('change', createReport);
}

exports.reload = function(){
  
}