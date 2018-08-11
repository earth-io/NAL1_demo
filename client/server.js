var cells=[],cellHash={}, hashCell=(cell)=> cellHash[row(cell.k)+'_'+col(cell.k)]=cell;
var getCell= (row,col)=> cellHash[row+'_'+col];
var links=[],linkHash={}; 
var linkID=(c1,p1,c2,p2)=> (c1.id<c2.id) ? c1.id+'_'+p1+'_'+c2.id+'_'+p2 : c2.id+'_'+p2+'_'+c1.id+'_'+p1;

// configureDataCenter defined col&row
var row; // col(k)=> Math.floor(k/nCol);
var col; // row(k)=> k%nCol;
/* 
	 8  1  2
		\ | /
	7 - 0 - 3  there is a spl port (I put in the center, numbered '0')
		/ | \
	 6  5  4   

 p2=(p1)=>  p1<5 ? p1+4 : p1-4;
 d3.range(0,9).map(p2)  // [4, 5, 6, 7, 8, 1, 2, 3, 4]  note: we never call p2 w/ 0
*/
var configureLinks= (cells)=> {
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

var configureDataCenter=(nCol,nRow)=>{  // API
  col= (k)=> k%nCol;
  row= (k)=> Math.floor(k/nCol);
  $.map(d3.range(nCol*nRow),(d,k)=> cells.push(Cell(k)) );
  $.map(cells,(d)=> hashCell(d));
  configureLinks(cells);
  
// start with all machines wired
  $.map(cells,(d)=> d.setState('placed'    ));
  $.map(links,(d)=> d.setState('connected1'));
  $.map(links,(d)=> d.setState('connected2'));  
};
var model=()=>
  JSON.stringify({
    cells:cells.map((d)=> [d.k ,d.state]),
    links:links.map((d)=> [d.id,d.state] ),
  })
;
// example for client
/* example for client assume we have
	var svgNS="http://www.w3.org/2000/svg", DIV='<div>';
	var SVGnode= (tag)=> document.createElementNS(svgNS,tag);
	var line= (parent,x1,y1,x2,y2,stroke,width,__,aLine)=> {
		aLine=$(SVGnode('line'))
		parent.append(aLine.attr({ x1:x1, y1:y1, x2:x2, y2:y2, stroke:stroke, "stroke-width":width }));
		return aLine;
	};
*/
var clientViewFromModelExample=(s)=>{
	var spacing=38;
	var x=   (k)=> (spacing/2)+spacing*col(k);  // cell position
	var y=   (k)=> (spacing/2)+spacing*row(k); 
	$('svg').remove();
	$('body').html('');
	var svg=SVGnode('svg');
	$('body').append(svg);
	var json=JSON.parse(s);
	json.links.map(
	  (d,__,args)=>{ 
	    args=d[0].split('_'); 
	    $(svg).append(
	    line($(svg),x(args[0]),y(args[0]),x(args[2]),y(args[2]),{placed:'brown',on:'green'}[d[1]],3)
	    )
	  }
	);
	json.cells.map(
	  (d)=> $(svg).append(
	    $(SVGnode('circle')).attr({cx:x(d[0]),cy:y(d[0]), r:6, fill:{placed:'brown',on:'green'}[d[1]]})
	  )
	);
};

// ========================================================= MODEL - CELL
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
    row:row(k), 
    col:col(k),
    
    x:x(k), // not used on server
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
      return self.state; 
    },
    propagateTreeOnPort:(treeID,port_out,cnt,__,link,otherCell,otherPort)=>{ 
      if(self.ports[port_out].trees[treeID]){ return; }  // already sent  GGGG
      maxCnt= cnt>maxCnt ? cnt : maxCnt;
      // only called when self.ports[port_out].link.state='on'  DDDD
      link=self.ports[port_out].link;
    //if(link==null || link.state!='on'){ alert('oops'); return; } // redundant ck DDDD
      
      otherCell=getOtherCell(link);
      otherPort=getOtherPort(link);
            
      if(otherCell.trees[treeID]==undefined){         
        link_observers.update(link,treeID,'hilitePropagation',
            {cell1:self,port1:port_out,cell2:otherCell,port2:otherPort,tree:treeID,cnt:cnt});
        self     .trees[treeID].out[port_out]=true;
        otherCell.trees[treeID]={ id:treeID, in:otherPort, out:{}, pruned:{} }; // send out
        treeAdds+=1;  //  25x(25-1)  the tree rooted on ea cell must be send to all the other cells
        
        otherCell.update();
      //link_observers.update(link,treeID,'tree_branch',{ x1:self.x, y1:self.y, x2:otherCell.x, y2:otherCell.y });  
        link_observers.update(link,treeID,'tree_branch',branchEndPtsR(self,port_out,otherCell,otherPort));            
      //otherCell.update();  // putting it second partially shades the link, and is an indicator of directionality

        self     .ports[port_out ].trees[treeID]=true; // GGGG
        otherCell.ports[otherPort].trees[treeID]=true; // no need to echo
        
        $.map(otherCell.ports,(port,k,__)=>{ // send out
          if(port.link && port.link.state=='on' && port!=otherPort){
            setTimeout(()=>otherCell.propagateTreeOnPort(treeID,k,cnt+1),300); // zzzz
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

// ========================================================= MODEL - LINK
var Link=function(cell1,port1,cell2,port2,__,self){
  self={ 
    id:linkID(cell1,port1,cell2,port2), 
    cell1:cell1,
    cell1Port:port1, 
    cell2:cell2, 
    cell2Port:port2,

    state:'unplaced', // *unplaced connected1 connected2 placed on
    setState:(state)=>{   // FSM  needed - suggestions please
    
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
          self.state='connected1'; 
          self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);  
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
          self.state='connected2'; 
          self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);  
        }    
        else if(self.state=='connected1'){
          self.setState('placed');
        } 
      }     
    
      if(state=='placed'){ 
        self.state='placed';
        self.view.attr(linkEndPts(self)).attr({ "stroke-width":3 }).attr(self.attr[self.state]);      
        if(self.cell1.state=='on' && self.cell2.state=='on'){ self.setState('on'); } // state change zzzz hidden away
      }
      if(state=='on'){ 
        self.state='on'; self.view.attr(self.attr[self.state]); 
        if(self.cell1.state!="on" || self.cell2.state!="on"){ 
          console.log('error - trying to set link to on when an endpt cell is not on'); 
        }
        self.triggerDiscover();
      }
      return self.state; 
    },
    update:()=>{  // when cells change state, we get this method called
      if(self.state=="placed" && cell1.state=="on" && cell2.state=="on"){ self.setState('on'); }
    },
    triggerDiscover:()=>{  // called when state -> 'on' 
      // view
      $('.fresh').removeClass('fresh');
      $('.freshLink').remove();
      //$('#base1').remove();
      //$('#base2').remove();
      $('#base2').append($(SVGnode('circle')).attr({cx:x(cell1.id),cy:y(cell1.id),r:5,fill:'orange'}));
      $('#base2').append($(SVGnode('circle')).attr({cx:x(cell2.id),cy:y(cell2.id),r:5,fill:'pink'}));
      $('#info').html('discover between '+cell1.id+' - '+cell2.id);
      
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
  self.view=$(SVGnode('line')).attr(linkEndPts(self)).attr({'class':self.id})
             .attr({ "stroke-width":2 }).attr(self.attr[self.state]);
  return self;   // receiver still needs to append self.view
};