const ViewModel=(json,__,vModel={cells:{},links:{},trees:'-'},addCell,addLink)=>{
	addCell=(k,state)=> vModel.cells[k]={ state:state, cx:x(k),cy:y(k) };
	addLink=(id,state,x1,y1,x2,y2)=> vModel.links[id]={state:state, branches:{}, x1:x1,y1:y1,x2:x2,y2:y2};

  json.cells.map((d)=> addCell(d[0],d[1]) )  // k state
  json.links.map((d,__,args)=>{ 
    args=d[0].split('_'); 
    addLink(d[0],d[1],x(args[0]),y(args[0]),x(args[2]),y(args[2]));
  });
  vModel.trees=json.trees;

  return vModel;
}; 