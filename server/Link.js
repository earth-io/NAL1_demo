if(typeof require!='undefined'){
  var { randumb, Math_random, random, append, add, range} = require('./utility.js');
  var _ = require('lodash');
}

console.log('loading Link.js');

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




if(typeof module!='undefined'){ 
  var stream=[],sp=0;  // not used by node module, but want to avoid undefined, so put this kludge in
  // tbd: replace recvr with a sock call when using nodejs
	var recvr=(s,__,json=JSON.parse(s))=> stream.push(s); // recvr is redefined here, as a kludge
  module.exports.Link = Link; 
} 