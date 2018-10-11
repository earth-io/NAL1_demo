if(typeof require!='undefined'){
  const $ = require('jquery');
}

var fool=(o)=>{
	var obj={
		a:function(x){ console.log(x  ); },
		b:function(x){ console.log(x+x); },
	};
	obj[o]('x');
};
fool('a');


const Graph=($svg,__,self,$gl,$gc)=>{
  $gl=append($svg,$(SVGnode('g')));
  $gc=append($svg,$(SVGnode('g')));
  self={
  /*
    getMsg:(o)=>{
      {
        addCell:(()=>{ self.renderLink(o); }),
        addLink:(()=>{ self.renderBranch(o); }),
      }[o.op]();
    },
    */
    renderLink:(d,id)=>$gl.append(
      line($gl,d.x1,d.y1,d.x2,d.y2,{placed:'gray',on:'black'}[d.state],{placed:1,on:2}[d.state])
        .attr('class','link_'+id)
    ),
    renderCell:(d,id)=>{ 
      $gc.append(
        $(SVGnode('circle'))
          .attr({
            'class':'cell_'+id, cx:d.cx,cy:d.cy, r:6, 
            fill:{placed:'gray',on:'green'}[d.state]
          })
      );
    },
    renderBranch:(d,id)=>{
      // WWWW
      // zzz find the tile by referencing $gl,  not #tile_'+k
      node=$('#tile_'+k+' .link_'+b)[0];  // only one tile sees changes
      $(node).attr({ stroke:'yellow','stroke-width':7})
      node.parentElement.appendChild(node);
    }
  };
  return self;
};


// must know nRow,nCol ahead of time  KLUDGE zzzzz
const TiledGraphs=($p,nCol,nRow__,gxfs)=>{
  $svg=append($p,$(SVGnode('svg')).attr({width:1000, height:1000}));
  gxfs=range(nRow*nCol).map((d,k,__,i=col(k),j=row(k))=> 
    ({
      k:k,
      graph:Graph(
        append($svg,$(SVGnode('svg')))   // spacing is from layout.js
          .attr({
            'id':'tile_'+k, width:301, height:301, 
            x:i*(spacing+5)*nCol, 
            y:j*(spacing+5)*nRow
          })
      )
    })
  );
  return gxfs;
};

const renderTiles=(tiles,viewModel,json,__,$svg,vm=viewModel.vModel)=>{  
  viewModel.process(json);
  // concatent into a list of ops
  $.map(vm.cells,(c,id)=>{ 
    tiles.map((t,tk)=> t.graph.renderCell(c,id)); // ea tile is an observer
    $('#tile_'+id+' .cell_'+id).attr({ r:9});
  });
  $.map(vm.links,(l,id)=> 
    tiles.map((t)=> t.graph.renderLink(l,id)) // ea tile is an observer
  );
  $.map(vm.trees,(branches,k)=>{   // WWWW
    $.map(branches,(b,__,node)=>{
      node=$('#tile_'+k+' .link_'+b)[0];  // only one tile sees changes
      $(node).attr({ stroke:'yellow','stroke-width':7})
      node.parentElement.appendChild(node);  
    });
  });
};

if(typeof module!='undefined'){ 
  module.exports.renderGraph = Graph;       // not currently being used, all graphs are within tiles
  module.exports.renderTiles = renderTiles; // will call renderGraph 'locally' in this file
} 
