var http = require('http');
var fs = require('fs');

// Loading socket.io
const socketIo = require("socket.io");
const _ = require("lodash");

//const gr_mod = require('./gr_mod.js');
var { Model } = require('./Model.js');
console.log( "MODEL " , Model)

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./server/getServerState.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

function getFormattedTime(i) {
	var d = new Date();
        return d.toLocaleTimeString();;
    }


let myCounter = 0;
const io = socketIo(server);

let myArr = []
setInterval(function () {
     console.log("Increment counter");
     myCounter++;
     myArr.push( myCounter);
     console.log("Increment counter" + JSON.stringify( myArr));
    }, 2500);


io.sockets.on('connection', function (socket, username) {
    socket.on('getFullState', function (message) {
        // The username of the person who clicked is retrieved from the session variables
        console.log(message + ' Server: ' + JSON.stringify({"version":1, "graph":myArr}));
//        socket.emit('replyFullState', JSON.stringify( {"version":Date.now(), "graph":myArr}));
        socket.emit('replyFullState', model.send());
    });

	setInterval(function () {
		 console.log("Increment counter");
		 socket.emit('replyChangeState', myCounter);
		}, 2500);

});



//================================================================================ lib
/*
stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/

//var append=($p,$c)=>{ $p.append($c); return $c; };
var range=(n)=> [...Array(n).keys()];


//var pid=setInterval((__,s=stream[sp])=>{
//  s!=undefined && _.map(JSON.parse(s),(s,k)=>{ router[k](s); sp+=1; })
//},100);

//================================================================================ lib
/*
stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/

//================================================================================ data

//================================================================================ MODEL - CELL
var maxCnt=0;   // max hop count
var treeAdds=0; // how many branches have been created
// hard wire cell positions

//================================================================================ MODEL - LINK
//////////////////


var model=  Model();  // *****
console.log( "USAGE ", model);

var spacing=38;
var x=   (k)=> (spacing/2)+spacing*model.col(k);  // cell position
var y=   (k)=> (spacing/2)+spacing*model.row(k); 

model.configure( 5,4);
range(31).map(()=> model.doRandomOp());

portId = 8060
server.listen( portId, function(){
    console.log('listening on *:' + portId);
});
  
