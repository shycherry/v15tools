var TCK_INIT_PROFILE_TASK = require('./tck_init_profile');


exports.get = function(iWSName){

  var tck_init_task = TCK_INIT_PROFILE_TASK.get();
  
  var adl_ds_ws_task = new vt.ShellTask({
    command : 'adl_ds_ws '+iWSName,
    completeCallback : function(err, data){
      console.log(data);
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

  var newBatchTask = new vt.BatchTask();

  newBatchTask.pushTask(tck_init_task);
  newBatchTask.pushTask(adl_ds_ws_task);

  return newBatchTask;
};
  
