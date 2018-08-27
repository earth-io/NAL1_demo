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
var append=($p,$c)=>{ $p.append($c); return $c; };
var add=(o,k,v)=> o[k]==undefined ? o[k]=[v]  : o[k].push(v);
var range=(n)=> [...Array(n).keys()];

//================================================================================ data

var Model=(__,self)=>{
  var linkID=(c1,p1,c2,p2)=> (c1.id<c2.id) ? c1.id+'_'+p1+'_'+c2.id+'_'+p2 : c2.id+'_'+p2+'_'+c1.id+'_'+p1;


  var cellHash={};
  var hashCell=(cell)=> cellHash[self.row(cell.k)+'_'+self.col(cell.k)]=cell;
  var getCell= (row,col)=> cellHash[row+'_'+col];
  var linkHash={}; 
  
  /* 
     8  1  2
      \ | /
    7 - 0 - 3  there is a spl port (I put in the center, numbered '0')
      / | \
     6  5  4   

   p2=(p1)=>  p1<5 ? p1+4 : p1-4;
   range(8).map(p2)  // [4, 5, 6, 7, 8, 1, 2, 3, 4]  note: we never call p2 w/ 0
  */
  
  var extractTrees=(cells,links,__,trees={})=>{  // ea tree is a list of branches
    // the cell.ports have LOV knowledge of trees,  we must convert to GEV
    cells.map((c)=> 
      c.ports.map((p)=> 
        Object.keys(p.trees).map((tid)=> add(trees,tid,p.link.id))
      )   
    )
    return trees;
  };
  
  var opCnt=0;
  var ops=[
    (__,d=random(self.cells))=>{ opCnt+=1;; return d.state!=d.setState('placed'    ); },
    (__,d=random(self.cells))=>{ opCnt+=1;; return d.state!=d.setState('on'        ); }  // may trigger 'on' of links
  ];
  //========================================================================= self is the api
  var self={};
//self.nCol  // set w/ .configure
//self.nRow  // set w/ .configure
  self.cells=[];
  self.links=[];
  self.col= (k)=> k%self.nCol; 
  self.row= (k)=> Math.floor(k/self.nCol);
  self.configure=(nCol_,nRow_,__,configureLinks)=>{  // initialization
    self.nCol=nCol_;
    self.nRow=nRow_;

    configureLinks= (cells)=> {
      _.map(cells,(c1,__,c2,mkLinkWhenDoesNotExist)=> { 
        mkLinkWhenDoesNotExist= (c1,p1,c2,__,p2=(p1)=>  p1<5 ? p1+4 : p1-4,lid,link)=>{ 
          lid=linkID(c1,p1,c2,p2(p1));
          if(linkHash[lid]==undefined){ 
            link=Link(c1,p1,c2,p2(p1)); 
            self.links.push(link); 
            linkHash[lid]=link;
          } 
        };
        // for ea port: find its potential neighbor cell; make a link if it does not already exist
        if(c2=getCell(self.row(c1.k)+0,self.col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,3,c2); } // right
        if(c2=getCell(self.row(c1.k)-1,self.col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,1,c2); } // above
        if(c2=getCell(self.row(c1.k)+0,self.col(c1.k)-1)){ mkLinkWhenDoesNotExist(c1,7,c2); } // left
        if(c2=getCell(self.row(c1.k)+1,self.col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,5,c2); } // below
        if(c2=getCell(self.row(c1.k)+1,self.col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,4,c2); } // bot rt   diag
        if(c2=getCell(self.row(c1.k)-1,self.col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,2,c2); } // top left diag
      });
    };

    range(self.nCol*self.nRow).map((d,k)=> self.cells.push(Cell(k)));
    _.map(self.cells,(d)=> hashCell(d));
    configureLinks(self.cells);
  
  // start with all machines wired
    _.map(self.cells,(d)=> d.setState('placed'    ));
    _.map(self.links,(d)=> d.setState('connected1'));
    _.map(self.links,(d)=> d.setState('connected2')); 
    console.log('fini configuring'); // links.map((d)=> d.state)  everything is 'placed'
  };
  self.doRandomOp=()=> random(ops)()
  self.send=()=>
    JSON.stringify({
      nRow:self.nRow,
      nCol:self.nCol,
      cells:self.cells.map((d)=> [d.k ,d.state] ), // ,d.ports.map(d)=> d.trees]),
      links:self.links.map((d)=> [d.id,d.state]),
      trees:extractTrees(self.cells,self.links),        // treeID:[linkID,.. ]
    })
  ;
  return self;
};
//================================================================================ MODEL - CELL
var maxCnt=0;   // max hop count
var treeAdds=0; // how many branches have been created
// hard wire cell positions

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
    notifyPorts:()=> _.map(self.ports,(d)=> (d.link && d.link.update())), // called by .setState
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
        
        recvr(JSON.stringify({
          tree_branch:(JSON.stringify({ treeID:treeID, linkID:link.id, state:link.state }) ),
        })  );

        
        _.map(otherCell.ports,(port,k,__)=>{ // send out
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
        _.map(self.trees,(tree)=> self.propagateTreeOnPort(tree.id,port_out,0) );
      }
    },  
    update:()=>{ cell_observers.update(self); }  // called by .setState
  }
  return self;
};

//================================================================================ MODEL - LINK
var Link=function(cell1,port1,cell2,port2,__,self){
  var linkID=(c1,p1,c2,p2)=> (c1.id<c2.id) ? c1.id+'_'+p1+'_'+c2.id+'_'+p2 : c2.id+'_'+p2+'_'+c1.id+'_'+p1;

  self={ 
    id:linkID(cell1,port1,cell2,port2), 
    cell1:cell1,
    cell1Port:port1, 
    cell2:cell2, 
    cell2Port:port2,
    state:'unplaced', // *unplaced connected1 connected2 placed on
    setState:(state,__,state0)=>{  
      state0=self.state;
      /* FSM logic
    
      unplaced  ____> connected1 __(connect2)______> placed __(both cells on **)__> on
                 \__> connected2 __(connect1)__/
                 
      because setState can be called recursively,  recvr may be called multiple times
      in particular, when command 'connected2' when state=='connected' you return with 'placed'
       because setState('placed') is called as an 'innerFn'
       
      on the client you will get multiple 'placed' notifications,  
       and because 'innerFn' will send a recvr and kick off triggeDiscover be for returning to the original call,
       the view must know that is will get 'on' notifications after is has displayed trees.
                 
      ** link needs to listen to cells  // implemented by cell sending .update() to links
    
      */
      if(state!=self.state){
        try{
          ({
            connected1:({ 
              unplaced:()=>{ 
                if(cell1.state!="unplaced"){ cell1.setPort(port1,self); self.state='connected1'; }
              },
              connected2:()=>{ 
                if(cell1.state!="unplaced"){ cell1.setPort(port1,self); self.setState('placed'); }
              },
            }),
            connected2:({ 
              unplaced:()=>{ 
                if(cell2.state!="unplaced"){ cell2.setPort(port2,self); self.state='connected1'; }
              },
              connected1:()=>{ 
                if(cell2.state!="unplaced"){ cell2.setPort(port2,self); self.setState('placed'); }
              },
            }),          
            placed:({
              connected1:()=>{ self.state='placed'; self.setState('on'); },
              connected2:()=>{ self.state='placed'; self.setState('on'); },          
            }),   
            on:({ 
              placed:()=>{ 
                if(cell1.state=="on" || cell2.state=="on"){ self.state='on'; self.triggerDiscover(); }  
              }
            }), 
          })[state][self.state]();
        } 
        catch (error) {
        //console.log(state,'to',self.state,'not defined');
        }
      }
      if(state!=state0){ 
        recvr( JSON.stringify({
          link_update:(JSON.stringify({ id:self.id, state:self.state, state0:state0, stateReq:state}) ),
        })  ); 
      }; // publish
      return self.state; 
    },
    update:()=>{  // when cells change state, we get this method called
      if(self.state=="placed" && cell1.state=="on" && cell2.state=="on"){ self.setState('on'); }
    },
    triggerDiscover:()=>{  // called when state -> 'on' 
      cell1.broadcastTrees(self.cell1Port);
      cell2.broadcastTrees(self.cell2Port);
    },                
  };
  return self;
};