if(typeof require!='undefined'){
  var { randumb, Math_random, random, append, add, range} = require('./utility.js');
  var _ = require('lodash');
  var {Model} = require('./Model.js');
}

console.log('loading Cell.js');

// debug:
var maxCnt=0;   // max hop count
var treeAdds=0; // how many branches have been created

var Cell=function(k,__,self,getOtherCell,getOtherPort){
  getOtherCell=(link)=> (link==null) ? null : ((link.cell1==self) ? link.cell2     : link.cell1    ),
  getOtherPort=(link)=> (link==null) ? null : ((link.cell1==self) ? link.cell2Port : link.cell1Port),
  self={ 
    id:k,  // need a closure for uuid generation - in our case the k index has a spl meaning
    uuid:k,
    k:k, 
      
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
      //s.match('3_3_4_7') && console.log('sending',s);
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

// drop updates on the floor   zzzzz
	var cell_observers={  
		update:(cell)=>{}
	};

if(typeof module!='undefined'){ 
  // tbd: replace recvr with a sock call when using nodejs
	var stream=[],sp=0;
	var recvr=(s,__,json=JSON.parse(s))=> stream.push(s); // recvr is redefined here, as a kludge
  module.exports.Cell = Cell; 
}