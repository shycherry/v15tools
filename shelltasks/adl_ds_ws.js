var TCK_INIT_PROFILE_SCMV5_TASK = require('./tck_init_profile_scmv5');


exports.get = function(iWSName){

  var adl_ds_ws_Task = new vt.ShellTask({
    command : 'adl_ds_ws '+iWSName,
  });

  var newBatchTask = new vt.BatchTask({    
    completeCallback : function(err, data){
      if(newBatchTask.userCallback){
        if(err){
          newBatchTask.userCallback(err);
        }else{
          var winImagePathMatch = /WINDOWS.+(\\\\.+)/.exec(data);
          if(!winImagePathMatch){
            newBatchTask.userCallback('no match', null);
            return;
          }
          newBatchTask.userCallback(null, winImagePathMatch[1]);
        }
      }
    }
  });

  newBatchTask.pushTask(TCK_INIT_PROFILE_SCMV5_TASK.get());
  newBatchTask.pushTask(adl_ds_ws_Task);

  return newBatchTask;
};
  
