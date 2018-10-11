/*
json format
 cells  array
   [ key, state ]
 links  array
   [ c.k1_port1_c.k2_port2, state ]
 trees  key:k is the key of the root cell
   [ linkID, .. ]
*/

// zzzzz need to notify observers, ie graphs

const ViewModel=(json,__,self,o)=>{
  self={
		vModel:{cells:{},links:{},trees:'-',observers:[]},
		addCell:(k,state)=>{ 
		  self.vModel.cells[k]=o={ 
		    op:'addCell', 
		    cx:x(k),cy:y(k),
		    state:state,  
		  },
		  self.observers.map((d)=> d(o));
		},
		addLink:(id,state,x1,y1,x2,y2)=>{
		  self.vModel.links[id]=o={
		    op:'addLink',
		    x1:x1,y1:y1,x2:x2,y2:y2,
		    state:state, 
		    branches:{},
		  },
		  self.observers.map((d)=> d(o));		  
		},
		process:(json)=>{
			json.cells.map((d)=> self.addCell(d[0],d[1]) ) // k state
			json.links.map((d,__,args)=>{ 
				args=d[0].split('_'); 
				self.addLink(d[0],d[1],x(args[0]),y(args[0]),
				                       x(args[2]),y(args[2]) );
			});
			self.vModel.trees=json.trees;		
		}
	};
  return self;
}; 

/*
vm= { 
  cells:{ k:{state: cx: cy: },..},  
  links:{ c.k1_port1_c.k2_port2:{ state: , x1: , y1: , x2: , y2: },.. },
  trees:{ k:[ c.k1_port1_c.k2_port2, c.k1_port1_c.k2_port2, .. ],.. }
}
*/
