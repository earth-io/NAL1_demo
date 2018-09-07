//const getFormattedTime=()=> (new Date()).toLocaleTimeString();  // not used
//=================================================== model.js - ie this could be a module LLLL
var { range} = require('./utility.js'); // { randumb, Math_random, random, append, add, range}
//  { nCol, nRow, col, row, x, y  } = require('../common/layout.js');
var { Model }  = require('./Model.js'); 
// we need a another file that creates an instance of the model  zzzzz
var model      = Model();
model.configure(5,4);
model.observerCBs=[];
model.addObserver=(cb)=> model.observerCBs.push(cb);
range(31).map(()=> model.doRandomOp());
setInterval(()=>{ model.doRandomOp(); model.observerCBs.map((d)=> d(model.send())); },1000);

//=================================================== communication between client & model
var http       = require('http'); // http.createServer; listens on a port
var fs         = require('fs');
const socketIo = require("socket.io");  
//var { addObserver as model_observe, send as model_send } = require('./model.js'); //LLLL
/*
// the file to be displayed on the client when the req.url in index.html or the default
// this is good enough for what we want to do
var server = http.createServer((req,res,__,fileName='./server/getServerState.html')=>{
  fs.readFile(fileName,'utf-8',(err,content)=>{
    res.writeHead(200, {"Content-Type": "text/html"}); res.end(content);
  });
});
*/
var server=http.createServer((req,res,__,sendFileContent)=>{ // request,response; only use req.url
  sendFileContent=(fileName,contentType)=>{
    fs.readFile(fileName,(err,content)=>{
      if(err){ res.writeHead(404);                                res.write("Not Found!"); }
      else   { res.writeHead(200, {'Content-Type': contentType}); res.write(content     ); }
      res.end();
    });
  }
  // ============== routing - we arent currently using this, so is for instructional purposes
  if(req.url === "/"){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('This is the default res. request URL is: ' + req.url); // res.end(); NO!
  }
  else if(req.url === "/index"){
    sendFileContent("server/getServerState.html", "text/html");
  }
  else if(/^\/[a-zA-Z0-9\/]*.js$/.test(req.url.toString())){
    sendFileContent(req.url.toString().substring(1), "text/javascript");
  }
  else if(/^\/[a-zA-Z0-9\/]*.css$/.test(req.url.toString())){
    sendFileContent(req.url.toString().substring(1), "text/css");
  }
  else{
    console.log("requested URL is: " + req.url);
    res.end();
  }
});

const portId = 8060;
server.listen(portId,()=> console.log('listening on *:' + portId) ); // what is this cb fn?
const io = socketIo(server);   // now can connect sockets to server
io.sockets.on('connection',(socket, username)=>{  // socket is an instance of a connection
   // on: reqFullState
   // emit: fullState, changeState
  socket.on('reqFullState',(msg)=> socket.emit('fullState', model.send()) );
  model.addObserver((s)=> socket.emit('changeState',s));
});
