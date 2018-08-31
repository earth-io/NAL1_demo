console.log('loading getServerState.js');

var http       = require('http');
var fs         = require('fs');
const socketIo = require("socket.io");
const _        = require("lodash");
var { randumb, Math_random, random, append, add, range} = require('./utility.js');
var { nCol, nRow, col, row, x, y, foobar }              = require('../common/layout.js');

console.log('from getServerState utility - range is:',range);
console.log('from getServerState layout - nRow,nCol is:',nRow,nCol);

const getFormattedTime=()=> (new Date()).toLocaleTimeString();

var { Model }  = require('./Model.js');  
var model=  Model();    console.log( "model", model);
model.configure(5,4);
range(31).map(()=> model.doRandomOp()); 

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./server/getServerState.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});
const portId = 8060
server.listen( portId,()=> console.log('listening on *:' + portId) );


let myCounter = 0;
const io = socketIo(server);

let myArr = []
setInterval(()=>{
     myCounter++;
     myArr.push( myCounter);
     console.log("Increment counter" + JSON.stringify( myArr));
    }, 9000);

io.sockets.on('connection', function (socket, username) {
  socket.on('getFullState', function (message) {
        // The username of the person who clicked is retrieved from the session variables
        console.log(message + ' Server: ' + JSON.stringify({"version":1, "graph":myArr}));
//        socket.emit('replyFullState', JSON.stringify( {"version":Date.now(), "graph":myArr}));
        socket.emit('replyFullState', model.send());
  });
	setInterval(()=>{ socket.emit('replyChangeState', myCounter); }, 9000);
});
