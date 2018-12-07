const uiCellName=(cellName)=> cellName.substring( 2, 10);
const position  =(cellName)=> ({ x:uiCellName(cellName)%5, y:Math.trunc(uiCellName(cellName)/5) });
GlobalView = class  {
  constructor() {
    this.cellPorts     = {};
    this.nCells = 0
    this.cellPortLinks = {};
    this.opHistory     = [];
    this.messageId     = 0 ; 
//  this.fromParentPortTree = {};
//  this.toChildPortTree = {};
//  this.linkTrees = {};
  };
  getMessages() { return this.opHistory; }
  initTopology( nCells, rows, cols) {
        this.nCells = nCells;
        this.generateMessage( { "op" : "version", "payload":2});
        this.generateMessage( { "op" : "initTopology", "payload" : { "num_cells" : nCells, "rows" : rows, "cols":cols}});
  };
  addCell( cell,location) {
    if ( cell in this.cellPorts) return;
    this.cellPorts[cell] = {};  // zzzzz looks like we make duplicates of cells
    var cellId = uiCellName( cell)
    this.generateMessage(
        { op:"cellAdd", payload:{ cellName:cellId, 
                        row:location[cellId][0], 
                        col:location[cellId][1] 
                     } 
        });
  };

  helloLink(cellA, portA, cellB, portB) {
    this.addCell(cellA)
    this.addCell(cellB)
    var ports = this.cellPorts[cellA]
    var cellPortLabelA = [cellA,portA].join('#');
    var cellPortLabelB = [cellB,portB].join('#');
    if ( ports[cellPortLabelA] == undefined ) { ports[cellPortLabelA] = {} }    
    if ( ports[cellPortLabelB] == undefined ) { ports[cellPortLabelB] = {} }
    if ( this.cellPortLinks[cellPortLabelA] == undefined ) {   // zzzz need to test B
      this.cellPortLinks[cellPortLabelA] = cellPortLabelB
      this.cellPortLinks[cellPortLabelB] = cellPortLabelA
      this.generateMessage( { 
        op:"linkAdd", 
        payload:[ 
					{ CellPort: { cellName:uiCellName(cellA), portNum:portA}}, 
					{ CellPort: { cellName:uiCellName(cellB), portNum:portB}}
				]
      })
    }    
    else {
    //json_data = dict(op="linkAdd", payload=payload, is_reversed = "Y")
    //self.generateMessage( json_data)
    }
  };
  discover(cellA, portA, cellB, portB, treeId, treePort, hops) {
  console.log( "discover ", cellA, portA, cellB, portB, treeId, treePort, hops);
  //if ( this.cellPorts==undefined ){ console.log('undefined this.cellPorts)'); }; stupid test zzz
    var cellPortLabelA = [cellA,portA].join('#');
    var cellPortLabelB = [cellB,portB].join('#');
    if(this.cellPorts==undefined){ console.log( 'undefined this.cellPorts)'); }; // added oct 15 by jgs
    var portsB = this.cellPorts[cellB];
    try {
    if(portsB[cellPortLabelB]==undefined){ portsB[cellPortLabelB]={}; }    
    if(portsB[cellPortLabelB][cellPortLabelA]==undefined){ portsB[cellPortLabelB][cellPortLabelA]={}; } 
    }
    catch( err) {
	 throw "Invalid port reference";
    }     
    portsB[cellPortLabelB][cellPortLabelA][treeId]={ "hops":hops, "treePort":treePort};
    console.log( "!!!GR discover treeId: ", treeId)
    console.log( "!!!GR discover cellPortLabelB: ", cellPortLabelB)
    console.log(  portsB[cellPortLabelB][cellPortLabelA])
    this.cellPorts[cellB] = portsB
  };

  discoverD( cellA, portA, cellB, portB, treeId) {
    console.log( "discoverD ", cellA, portA, cellB, portB, treeId);
    var cellPortLabelA = [cellA,portA].join('#');
    var cellPortLabelB = [cellB,portB].join('#');
    if(this.cellPorts==undefined){ console.log( 'undefined this.cellPorts)'); };
    if( this.cellPorts[cellB]) === undefined {  this.cellPorts[cellB] = {}; }
    var portsB = this.cellPorts[cellB]
    if(portsB[cellPortLabelB]===undefined){ portsB[cellPortLabelB]={}; console.log( "!!!GR Race condition on " + cellPortLabelB);} 
    if(portsB[cellPortLabelB][cellPortLabelA]===undefined){ portsB[cellPortLabelB][cellPortLabelA]={}; }
    this.cellPorts[cellB]
 
//  portsB[cellPortLabelB][cellPortLabelA][treeId]["active"] = "Y"
//  cellB = 'C1'; portB = 1; cellA = 'C2'; portA = 3;
    var cellPortB = { CellPort:{ cellName:uiCellName(cellB), portNum:portB}};
    var cellPortA = { CellPort:{ cellName:uiCellName(cellA), portNum:portA}};

   console.log( "GR??? discoverD treeId :", treeId)
   console.log( "GR???", portsB)
   console.log( portsB[cellPortLabelB][cellPortLabelA][treeId])
   console.log( portsB[cellPortLabelB][cellPortLabelA][treeId]["treePort"])

    var payload = { CellPort:{ cellName:uiCellName(cellB), portNum:portB}, tree:{ treeName:uiCellName(treeId), 
        portNum: portsB[cellPortLabelB][cellPortLabelA][treeId]["treePort"]} };
//  this.opHistory.append("['rtAdd', ('{}', {}), {}]".format(uiCellName(cellB),portB,uiCellName(treeId)))
    this.generateMessage({ op:"rtAdd", payload:payload })
  };   
  generateMessage(json_obj) {
//  this.opHistory.append("['op':'cellAdd', ('{}', {}, {})]".format(uiCellName(newCell), x, y))
    json_obj['messageId'] = this.messageId;
    this.messageId = this.messageId + 1;
    this.opHistory.push(json_obj);
//    this.printMessages();
  }
  printMessages(){ 
	// for(const message of this.opHistory){ console.log( message); }
  };
}
module.exports.GlobalView = GlobalView;  
