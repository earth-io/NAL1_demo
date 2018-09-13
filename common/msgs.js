var msgs=[];
if(typeof require!='undefined'){
  //  socket send
}
else{

}

var send=(s)=> msgs.push(s);

if(typeof module!='undefined'){ 
  module.exports.msgs = msgs; 
  module.exports.send = send;  
} 