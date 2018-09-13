if(typeof require!='undefined'){
  const $ = require('jquery');
}

const renderGraph=($svg,cells,links,__,$gl,$gc)=>{
  $gl=append($svg,$(SVGnode('g')));
  $gc=append($svg,$(SVGnode('g')));
  $.map(links,(d,id,__,args)=> $gl.append(
    line($gl,d.x1,d.y1,d.x2,d.y2,{placed:'gray',on:'black'}[d.state],{placed:1,on:2}[d.state])
      .attr('class','link_'+id)
  ));
  $.map(cells,(d,id)=> $gc.append(
    $(SVGnode('circle'))
      .attr({'class':'cell_'+id, cx:d.cx,cy:d.cy, r:6, fill:{placed:'gray',on:'green'}[d.state]})
  ));
  return $svg;
};

const renderTiles=($p,nRow,nCol,vm,__,$svg,tiles)=>{  
  $svg=$(SVGnode('svg')).attr({width:1000, height:1000});
  $p.append($svg);

  tiles=range(nRow*nCol);
  tiles.map((d,k,__,i=col(k),j=row(k))=>{ // make a tile for ea cell, put whole graph on ea tile
    renderGraph(append($svg,$(SVGnode('svg'))
      .attr({'id':'tile_'+k, width:301, height:301, x:i*(spacing+5)*nCol, y:j*(spacing+5)*nRow})
    ),vm.cells,vm.links);
    $('#tile_'+k+' .cell_'+k).attr({ r:9});
  });
  tiles.map((d,k,__,i=col(k),j=row(k))=>{ // put a tree on ea tile
    vm.trees[k] && vm.trees[k].map((d,__,node)=>{      
			node=$('#tile_'+k+' .link_'+d)[0];
			$(node).attr({ stroke:'yellow','stroke-width':7})
			node.parentElement.appendChild(node);  //  remove and append, so appears on top
    })
  });  
};

if(typeof module!='undefined'){ 
  module.exports.renderGraph = renderGraph; // not currently being used, all graphs are within tiles
  module.exports.renderTiles = renderTiles; // will call renderGraph 'locally' in this file
} 
