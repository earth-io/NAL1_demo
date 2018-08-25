var http = require('http');
var fs = require('fs');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./getServerState.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
const socketIo = require("socket.io");
//var io = socketIo.listen(server);

let counter = 0;
let myCounter = 0;

function getFormattedTime(i) {
	var d = new Date();
        return d.toLocaleTimeString();;
    }

let myArr = []
setInterval(function () {
     console.log("Increment counter");
     myCounter++;
     myArr.push( myCounter);
     console.log("Increment counter" + JSON.stringify( myArr));
    }, 2500);


const io = socketIo(server);


let increment = 0;
io.sockets.on('connection', function (socket, username) {
    socket.on('getFullState', function (message) {
        // The username of the person who clicked is retrieved from the session variables
        console.log(message + ' Server: ' + JSON.stringify({"version":1, "graph":myArr}));
//        socket.emit('replyFullState', JSON.stringify( {"version":Date.now(), "graph":myArr}));
        socket.emit('replyFullState', model_send());
    });

	setInterval(function () {
		 console.log("Increment counter");
		 socket.emit('replyChangeState', myCounter);
		}, 2500);

});



///////////////
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

var append=($p,$c)=>{ $p.append($c); return $c; };
var add=(o,k,v)=> o[k]==undefined ? o[k]=[v]  : o[k].push(v);
var range=(n)=> [...Array(n).keys()];
var svgNS="http://www.w3.org/2000/svg", DIV='<div>';
var SVGnode= (tag)=> document.createElementNS(svgNS,tag);
var line= (parent,x1,y1,x2,y2,stroke,width,__,aLine)=> {
  aLine=$(SVGnode('line'))
  parent.append(aLine.attr({ x1:x1, y1:y1, x2:x2, y2:y2, stroke:stroke, "stroke-width":width }));
  return aLine;
};
var Tag=(name,s)=> '<'+name+'>'+s+'</'+name+'>';
//================================================================================ data
var cells=[],cellHash={}, hashCell=(cell)=> cellHash[row(cell.k)+'_'+col(cell.k)]=cell;
var getCell= (row,col)=> cellHash[row+'_'+col];
var links=[],linkHash={}; 
var linkID=(c1,p1,c2,p2)=> (c1.id<c2.id) ? c1.id+'_'+p1+'_'+c2.id+'_'+p2 : c2.id+'_'+p2+'_'+c1.id+'_'+p1;

var spacing=38;
var x=   (k)=> (spacing/2)+spacing*col(k);  // cell position
var y=   (k)=> (spacing/2)+spacing*row(k);  
var nCol, nRow;  // 5 x 4  or  8 x 12
/* 
	 8  1  2
		\ | /
	7 - 0 - 3  there is a spl port (I put in the center, numbered '0')
		/ | \
	 6  5  4   

 p2=(p1)=>  p1<5 ? p1+4 : p1-4;
 range(8).map(p2)  // [4, 5, 6, 7, 8, 1, 2, 3, 4]  note: we never call p2 w/ 0
*/

// configureDataCenter defines col&row
var row; // col(k)=> Math.floor(k/nCol);
var col; // row(k)=> k%nCol;
var model_configure=(nCol_,nRow_,__,configureLinks)=>{  // API
  nCol=nCol_;
  nRow=nRow_;
  col= (k)=> k%nCol;              // GLOBAL, used by view
  row= (k)=> Math.floor(k/nCol);  // GLOBAL
  configureLinks= (cells)=> {
		$.map(cells,(c1,__,c2,mkLinkWhenDoesNotExist)=> { 
			mkLinkWhenDoesNotExist= (c1,p1,c2,__,p2=(p1)=>  p1<5 ? p1+4 : p1-4,lid,link)=>{ 
				lid=linkID(c1,p1,c2,p2(p1));
				if(linkHash[lid]==undefined){ 
					link=Link(c1,p1,c2,p2(p1)); 
					links.push(link); 
					linkHash[lid]=link;
				} 
			};
			// for ea port: find its potential neighbor cell; make a link if it does not already exist
			if(c2=getCell(row(c1.k)+0,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,3,c2); } // right
			if(c2=getCell(row(c1.k)-1,col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,1,c2); } // above
			if(c2=getCell(row(c1.k)+0,col(c1.k)-1)){ mkLinkWhenDoesNotExist(c1,7,c2); } // left
			if(c2=getCell(row(c1.k)+1,col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,5,c2); } // below
			if(c2=getCell(row(c1.k)+1,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,4,c2); } // bot rt   diag
			if(c2=getCell(row(c1.k)-1,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,2,c2); } // top left diag
		});
	};

  range(nCol*nRow).map((d,k)=> cells.push(Cell(k)));
  $.map(cells,(d)=> hashCell(d));
  configureLinks(cells);
  
// start with all machines wired
  $.map(cells,(d)=> d.setState('placed'    )); // there is a bug in my link fsm
  $.map(links,(d)=> d.setState('connected1'));
  $.map(links,(d)=> d.setState('connected2')); 
  console.log('fini configuring'); // links.map((d)=> d.state)  everything is 'placed'
};
//================================================================================ api
var extractTrees=(cells,links,__,trees={})=>{  // ea tree is a list of branches
  // the cell.ports have LOV knowledge of trees,  we must convert to GEV
  cells.map((c)=> 
    c.ports.map((p)=> 
      Object.keys(p.trees).map((tid)=> add(trees,tid,p.link.id))
    )   
  )
  return trees;
};
var model_send=()=>
  JSON.stringify({
    nRow:nRow,
    nCol:nCol,
    cells:cells.map((d)=> [d.k ,d.state] ), // ,d.ports.map(d)=> d.trees]),
    links:links.map((d)=> [d.id,d.state]),
    trees:extractTrees(cells,links),        // treeID:[linkID,.. ]
  })
;
//================================================================================ MODEL - CELL
var maxCnt=0;   // max hop count
var treeAdds=0; // how many branches have been created
// hard wire cell positions

// ========================================================= RENDER (the cells)
var cell_observers={  
  update:(cell)=>{}
};
var link_observers={  
  update:(link,treeID,op,data)=>{}
};
var stream=[];
var recvr=(s,__,json=JSON.parse(s))=> stream.push(s);  // TBD:  put in array and pull out and play

var Cell=function(k,__,self,getOtherCell,getOtherPort){
  getOtherCell=(link)=> (link==null) ? null : ((link.cell1==self) ? link.cell2     : link.cell1    ),
  getOtherPort=(link)=> (link==null) ? null : ((link.cell1==self) ? link.cell2Port : link.cell1Port),
  self={ 
    id:k,  // need a closure for uuid generation - in our case the k index has a spl meaning
    uuid:k,
    k:k, 
    
    x:x(k), // not used on server - but client does
    y:y(k), // not used on server
    
    state:'unplaced',  // unplaced,placed,on 

    ports:[
      { link:null, trees:{} },  // not part of cell interconnections
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} },
      { link:null, trees:{} }
    ],    // r t l b
    notifyPorts:()=> $.map(self.ports,(d)=> (d.link && d.link.update())), // called by .setState
    setPort:(porti,link)=>{ self.ports[porti].link=link; },
    trees:{ /* k:{ id:k, in:null, out:{}, pruned:{} } */},
    setState:(state,__,state0)=>{   // FSM  needed - suggestions please  sends .update msg to links
      state0=self.state;
      if(self.state=='unplaced' && state=='placed'){ self.state='placed'; 
        self.update(); 
        self.notifyPorts(); 
      }
      if(self.state=='placed'   && state=='on'    ){ self.state='on'; 
        self.trees[k]= { id:k, in:null, out:{}, pruned:{} }; 
        self.update(); 
        self.notifyPorts(); 
      }
      if(state!=state0){ 
        var s
        recvr(s= JSON.stringify({
          cell_update:(JSON.stringify({ k:self.k, state:self.state, }) ),
        })  );
        s.match('3_3_4_7') && console.log('sending',s);
      }; // publish
      return self.state; 
    },
    propagateTreeOnPort:(treeID,port_out,cnt,__,link,otherCell,otherPort)=>{ 
      link=self.ports[port_out].link;
      if(link.state!='on'){ return; } // redundant, only called when self.ports[port_out].link.state='on' 
      if(self.ports[port_out].trees[treeID]){ return; }  // already sent  GGGG
      otherCell=getOtherCell(link);
      otherPort=getOtherPort(link);
      maxCnt= cnt>maxCnt ? cnt : maxCnt;
            
      if(otherCell.trees[treeID]==undefined){         
        link_observers.update(link,treeID,'hilitePropagation',
            {cell1:self,port1:port_out,cell2:otherCell,port2:otherPort,tree:treeID,cnt:cnt});
        self     .trees[treeID].out[port_out]=true;
        otherCell.trees[treeID]={ id:treeID, in:otherPort, out:{}, pruned:{} }; // send out
        treeAdds+=1;  //  25x(25-1)  the tree rooted on ea cell must be send to all the other cells
        
        otherCell.update();

        self     .ports[port_out ].trees[treeID]=true; // GGGG
        otherCell.ports[otherPort].trees[treeID]=true; // no need to echo
        
        var s;
        recvr(s= JSON.stringify({
          tree_branch:(JSON.stringify({ treeID:treeID, linkID:link.id, state:link.state }) ),
        })  );
        s.match('3_3_4_7') && console.log('sending',s);
        
        $.map(otherCell.ports,(port,k,__)=>{ // send out
          if(port.link && port.link.state=='on' && port!=otherPort){
          //setTimeout(()=>otherCell.propagateTreeOnPort(treeID,k,cnt+1),300); // zzzz
            otherCell.propagateTreeOnPort(treeID,k,cnt+1); // zzzz
          }
        });
      }
      else {  // when have a pruned branch
        return;  // TBD
      
        self.ports[port_out].pruned[treeID]=true;
        getOtherCell(link).ports[port].pruned[treeID]==true;
      }     
    },
    broadcastTree:(treeID,port_out,cnt,__)=>{  // called by Link.triggerDiscover when a link turns 'on'
      if(self.ports[port_out].link && self.ports[port_out].link.state=='on'){  // always
        self.propagateTreeOnPort(treeID,port_out,cnt); 
      }
    },
    broadcastTrees:(port_out,__)=>{  // called by Link.triggerDiscover when a link turns 'on'
      if(self.ports[port_out].link && self.ports[port_out].link.state=='on'){  // always
        $.map(self.trees,(tree)=> self.propagateTreeOnPort(tree.id,port_out,0) );
      }
    },  
    update:()=>{ cell_observers.update(self); }, // called by .setState
    attr:{  // view
      unplaced:{cx:x(k),cy:y(k),r:8, z:k, fill:'gray'   },
      placed  :{cx:x(k),cy:y(k),r:8, z:k, fill:'black' },
      on      :{cx:x(k),cy:y(k),r:8, z:k, fill:'green'  }
    },
  }
  return self;
};

//================================================================================ MODEL - LINK
var Link=function(cell1,port1,cell2,port2,__,self){
  self={ 
    id:linkID(cell1,port1,cell2,port2), 
    cell1:cell1,
    cell1Port:port1, 
    cell2:cell2, 
    cell2Port:port2,

    state:'unplaced', // *unplaced connected1 connected2 placed on
    setState:(state,__,state0)=>{   // FSM  needed - suggestions please
      state0=self.state;
    /* FSM logic
    
    unplaced  ____> connected1 __(connect2)______> placed __(both cells on **)__> on
               \__> connected2 __(connect1)__/
                 
    ** link needs to listen to cells  // implemented by cell sending .update() to links
    
    */
      if(state=='connected1' && self.cell1.state!="unplaced" && 
         (self.state=="unplaced" || self.state=="connected2")  ){
        self.cell1.setPort(self.cell1Port,self);
      //self.cell1.ports[self.cell1Port].link=self;
        if(self.state=="unplaced"){
          self.state='connected1'; //v self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);  
        }    
        else if(self.state=='connected2'){
          self.setState('placed');
        } 
      }
 
      if(state=='connected2' && self.cell2.state!="unplaced" && 
         (self.state=="unplaced" || self.state=="connected1")  ){
        self.cell2.setPort(self.cell2Port,self);
      //self.cell2.ports[self.cell2Port].link=self;
        if(self.state=="unplaced"){
          self.state='connected2'; //v self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);  
        }    
        else if(self.state=='connected1'){
          self.setState('placed');
        } 
      }     
    
      if(state=='placed'){ 
        self.state='placed'; //v self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);      
        if(self.cell1.state=='on' && self.cell2.state=='on'){ self.setState('on'); } // state change zzzz hidden away
      }
      if(state=='on'){ 
        self.state='on'; //v self.view.attr(self.attr[self.state]); 
        if(self.cell1.state!="on" || self.cell2.state!="on"){ 
          console.log('error - trying to set link to on when an endpt cell is not on'); 
        }
        self.triggerDiscover();
      }
      if(state!=state0){ 
        recvr( JSON.stringify({
          link_update:(JSON.stringify({ id:self.id, state:self.state, }) ),
        })  ); 
      }; // publish
      return self.state; 
    },
    update:()=>{  // when cells change state, we get this method called
      if(self.state=="placed" && cell1.state=="on" && cell2.state=="on"){ self.setState('on'); }
    },
    triggerDiscover:()=>{  // called when state -> 'on' 
    /*
      // view
      $('.fresh').removeClass('fresh');
      $('.freshLink').remove();
      //$('#base1').remove();
      //$('#base2').remove();
      $('#base2').append($(SVGnode('circle')).attr({cx:x(cell1.id),cy:y(cell1.id),r:5,fill:'orange'}));
      $('#base2').append($(SVGnode('circle')).attr({cx:x(cell2.id),cy:y(cell2.id),r:5,fill:'pink'}));
      $('#info').html('discover between '+cell1.id+' - '+cell2.id);
     */ 
      // model
      cell1.broadcastTrees(self.cell1Port);
      cell2.broadcastTrees(self.cell2Port);
    },
    attr:{  // view
      unplaced  :{ stroke:'gray'   },
      connected1:{ stroke:'black'  },
      connected2:{ stroke:'black'  },
      placed    :{ stroke:'black'  },  // yellow
      on        :{ stroke:'green'  }
    },                   
  };
  /*
  self.view=$(SVGnode('line')).attr(linkEndPts(self)).attr({'class':self.id})
             .attr({ "stroke-width":2 }).attr(self.attr[self.state]);
  */
  return self;   // receiver still needs to append self.view
};

//////////////////

model_configure( 5,4);
range(31).map(()=> random(ops)());

portId = 8060
server.listen( portId, function(){
    console.log('listening on *:' + portId);
});
  