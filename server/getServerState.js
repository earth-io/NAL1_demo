var http = require('http');
var fs = require('fs');

// Loading socket.io
const socketIo = require("socket.io");
const _ = require("lodash");

//const gr_mod = require('./gr_mod.js');
var { Model } = require('./model.js');
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



// ========================================================= RENDER (the cells)
var cell_observers={  
  update:(cell)=>{}
};
var link_observers={  
  update:(link,treeID,op,data)=>{}
};
//================================================================================ lib
/*
stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/
var randumb=((__,seed=1)=>  // gives the same series of 'random' numbers every time
  (__,x=Math.sin(seed++)*10000)=> x - Math.floor(x)
)();
//var Math_random=Math.random(); // truly random
var Math_random=randumb;  // same random set of nubers every time
var random= (arr)=> arr[Math.floor(arr.length*Math_random())]; // get a random item from an array 

var opCnt=0;

var ops=[
  (__,d=random(cells))=>{ opCnt+=1;; return d.state!=d.setState('placed'    ); },
  (__,d=random(cells))=>{ opCnt+=1;; return d.state!=d.setState('on'        ); }  // may trigger 'on' of links
];

//var append=($p,$c)=>{ $p.append($c); return $c; };
var range=(n)=> [...Array(n).keys()];
var svgNS="http://www.w3.org/2000/svg", DIV='<div>';
var SVGnode= (tag)=> document.createElementNS(svgNS,tag);
var line= (parent,x1,y1,x2,y2,stroke,width,__,aLine)=> {
  aLine=$(SVGnode('line'))
  parent.append(aLine.attr({ x1:x1, y1:y1, x2:x2, y2:y2, stroke:stroke, "stroke-width":width }));
  return aLine;
};
var Tag=(name,s)=> '<'+name+'>'+s+'</'+name+'>';
//-----
var stream=[],sp=0;
var recvr=(s,__,json=JSON.parse(s))=> stream.push(s);  // TBD:  put in array and pull out and play

//var pid=setInterval((__,s=stream[sp])=>{
//  s!=undefined && _.map(JSON.parse(s),(s,k)=>{ router[k](s); sp+=1; })
//},100);

//================================================================================ data

// ========================================================= RENDER (the cells)
var cell_observers={  
  update:(cell)=>{}
};
var link_observers={  
  update:(link,treeID,op,data)=>{}
};
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
  
