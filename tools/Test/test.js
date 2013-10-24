exports.dir = function(){
  vt.call({command:'dir', callback:function(err, data){
    console.log('test');
    eData = String(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(\n)/g,'<br/>');
    $('#console-out').html(eData);
  }});
}