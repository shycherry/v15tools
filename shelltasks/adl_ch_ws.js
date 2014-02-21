var TCK_INIT_PROFILE_TASK = require('./tck_init_profile');


exports.get = function(iWSName){

  var adl_ch_ws_task = new vt.ShellTask({
    command : 'adl_ch_ws '+iWSName,
    completeCallback : function(err, data){      
      if(newBatchTask.userCallback){        
        newBatchTask.userCallback(err, data);
      }
    }
  });

  var tck_init_task = TCK_INIT_PROFILE_TASK.get('scm');

  var newBatchTask = new vt.BatchTask();

  newBatchTask.pushTask(tck_init_task);
  newBatchTask.pushTask(adl_ch_ws_task);

  return newBatchTask;
};
  
