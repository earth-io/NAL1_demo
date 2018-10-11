var stream=[],sp=0;recvr=(s,__,json=JSON.parse(s))=> stream.push(s);  // 


for web page we call recvr with a string
I could do this with model.observeCBs
ie recv is the subscriber




when doing client, overwrite recvr and just use observers which all use nodejs specific code
only the nodejs code has subscribers, which is done in server.sj

THIS ONLY CHANGES THE VIEWMODEL !!!! 
     if(state!=state0){ 
        recvr( JSON.stringify({
          link_update:(JSON.stringify({ id:self.id, state:self.state, state0:state0, stateReq:state}) ),
        })  ); 
      }; // publish
      

both =========

model.js
  model.observerCBs // =[]  must be fired when ...
  
  
  
  
web page =========

demo.js
  


	var stream=[],sp=0;
	var recvr=(s,__,json=JSON.parse(s))=> stream.push(s); // recvr is redefined here, as a kludge

client/demo.html:var recvr=(s,__,json=JSON.parse(s))=> stream.push(s); 
client/demo.html:  range(31).map(()=> model.doRandomOp()); // ea op results call to recvr by Cell,Link

server/Cell.js:
        recvr(s= JSON.stringify({
        recvr(JSON.stringify({
        
server/Link.js:  when link state changes
        recvr( JSON.stringify({
          link_update:(JSON.stringify({ id:self.id, state:self.state, state0:state0, stateReq:state}) ),

nodejs =========  // server2client

model.js
  model.observerCBs // =[]  must be fired when ...

index.html
	<script src="/socket.io/socket.io.js"></script>
	..
	var socket = io.connect('http://localhost:8060');   // JJJJJ server side must use this same portID
	var gs='';  // debug
	socket.on('fullState',  (s)=> modelForcesViewChange($('body').html('www'),JSON.parse(s)) );
	socket.on('changeState',(s)=> {gs=s;modelForcesViewChange($('body').html('xxx'),JSON.parse(s)); });
	$(document).ready((__)=>{ 
		socket.emit('reqFullState','I want model.send()'); // or $('#poke').click(()=> ..	)
	});


server.js
	var http       = require('http'); // http.createServer; listens on a port
	const socketIo = require("socket.io");
	
	//the only ops we publish are 'on' events,  TBD: branches   ******
	range(31).map(()=> model.doRandomOp());
  setInterval(()=>{ model.doRandomOp(); model.observerCBs.map((d)=> d(model.send())); },1000);
 
	..
	var server=http.createServer((req,res,__,sendFileContent)=>{
	..
	const portId = 8060;  // JJJJJ client side must use this same portID
	server.listen(portId,()=> console.log('listening on *:' + portId) );
	const io = socketIo(server);   // now can connect sockets to server
	io.sockets.on('connection',(socket, username)=>{  // socket is an instance of a connection
		 // on: reqFullState
		 // emit: fullState, changeState
		socket.on('reqFullState',(msg)=> socket.emit('fullState', model.send()) );
		model.addObserver((s)=> socket.emit('changeState',s));  // ******* MUST use observer
	});

  
server.js
  setInterval(()=>{ model.doRandomOp(); model.observerCBs.map((d)=> d(model.send())); },1000);
each d is a socket
  

io.sockets.on('connection',(socket, username)=>{  // socket is an instance of a connection
   // on: reqFullState
   // emit: fullState, changeState
  socket.on('reqFullState',(msg)=> socket.emit('fullState', model.send()) );
  model.addObserver((s)=> socket.emit('changeState',s));  ******
});
