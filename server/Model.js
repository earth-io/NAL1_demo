if(typeof require!='undefined'){
  var _ = require('lodash');
  var { randumb, Math_random, random, append, add, range} = require('./utility.js');
  var { nRow, nCol, row, col, x, y , foobar}              = require('../common/layout.js');
  var {Cell}                                              = require('./Cell.js');
  var {Link}                                              = require('./Link.js');
}

console.log('loading Model.js');
console.log(foobar);  // I see this

var Model=(__,self)=>{
  var linkID=(c1,p1,c2,p2)=> (c1.id<c2.id) ? c1.id+'_'+p1+'_'+c2.id+'_'+p2 : c2.id+'_'+p2+'_'+c1.id+'_'+p1;


  var cellHash={};
  var hashCell=(cell)=> cellHash[row(cell.k)+'_'+col(cell.k)]=cell;
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
  self.configure=(nCol_,nRow_,__,configureLinks)=>{  // initialization
    self.nCol=nCol_;
    self.nRow=nRow_;
    nCol=nCol_;   // layout.js
    nRow=nRow_;   // layout.js

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
        if(c2=getCell(row(c1.k)+0,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,3,c2); } // right
        if(c2=getCell(row(c1.k)-1,col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,1,c2); } // above
        if(c2=getCell(row(c1.k)+0,col(c1.k)-1)){ mkLinkWhenDoesNotExist(c1,7,c2); } // left
        if(c2=getCell(row(c1.k)+1,col(c1.k)+0)){ mkLinkWhenDoesNotExist(c1,5,c2); } // below
        if(c2=getCell(row(c1.k)+1,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,4,c2); } // bot rt   diag
        if(c2=getCell(row(c1.k)-1,col(c1.k)+1)){ mkLinkWhenDoesNotExist(c1,2,c2); } // top left diag
      });
    };

    range(nCol*nRow).map((d,k)=> self.cells.push(Cell(k)));
    _.map(self.cells,(d)=> hashCell(d));
    configureLinks(self.cells);
  
  // start with all machines wired
    _.map(self.cells,(d)=> d.setState('placed'    ));
    _.map(self.links,(d)=> d.setState('connected1'));
    _.map(self.links,(d)=> d.setState('connected2')); 
  //console.log('fini configuring'); // links.map((d)=> d.state)  everything is 'placed'
  };
  self.doRandomOp=()=> random(ops)()
  self.send=()=>
    JSON.stringify({
      nRow:nRow,
      nCol:nCol,
      cells:self.cells.map((d)=> [d.k ,d.state] ), // ,d.ports.map(d)=> d.trees]),
      links:self.links.map((d)=> [d.id,d.state]),
      trees:extractTrees(self.cells,self.links),        // treeID:[linkID,.. ]
    })
  ;
  return self;
};

//var model=  Model(); 
//model.configure( 5,4);
//range(31).map(()=> model.doRandomOp());

if(typeof module!='undefined'){ module.exports.Model = Model; } 