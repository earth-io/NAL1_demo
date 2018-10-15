const uiCellName=(cellName)=> cellName.substring( 2, 10);
const position  =(cellName)=> ({ x:uiCellName(cellName)%5, y:Math.trunc(uiCellName(cellName)/5) });
GlobalView = class  {
  constructor() {
    this.cellPorts     = {};
    this.cellPortLinks = {};
    this.opHistory     = [];
    this.messageId     = 0 ; 
//  this.fromParentPortTree = {};
//  this.toChildPortTree = {};
//  this.linkTrees = {};
  };
  getMessages() { return this.opHistory; }
  /* dupl fn defn,  AND it is wrong,  json_obj is not defined
  generateMessage( json_data) {
    json_obj['messageId'] = this.messageId;
    this.messageId = this.messageId + 1;
    this.opHistory.append( json_obj);
    console.log( json_obj);
  }
  */
  addCell( newCell,__,pos=position(newCell)) {
    this.cellPorts[newCell] = {};  // zzzzz looks like we make duplicates of cells
    this.generateMessage({ op:"cellAdd", payload:{ cellName:uiCellName(newCell), row:pos.x, col:pos.y } });
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
  discover(cellA, portA, cellB, portB, treeId, hops) {
  //if ( this.cellPorts==undefined ){ console.log('undefined this.cellPorts)'); }; stupid test zzz
    var cellPortLabelA = [cellA,portA].join('#');
    var cellPortLabelB = [cellB,portB].join('#');
    if(this.cellPorts==undefined){ console.log( 'undefined this.cellPorts)'); }; // added oct 15 by jgs
    var portsB = this.cellPorts[cellB];
    if(portsB[cellPortLabelB]==undefined){ portsB[cellPortLabelB]={}; }    
    if(portsB[cellPortLabelB][cellPortLabelA]==undefined){ portsB[cellPortLabelB][cellPortLabelA]={}; } 
      
    portsB[cellPortLabelB][cellPortLabelA][treeId]={ "hops":hops};
  };
  discoverD( cellA, portA, cellB, portB, treeId) {
    var cellPortLabelA = [cellA,portA].join('#');
    var cellPortLabelB = [cellB,portB].join('#');
    if(this.cellPorts==undefined){ console.log( 'undefined this.cellPorts)'); };
    var portsB = this.cellPorts[cellB]
    if(portsB[cellPortLabelB]==undefined){ portsB[cellPortLabelB]={}; }    
    if(portsB[cellPortLabelB][cellPortLabelA]==undefined){ portsB[cellPortLabelB][cellPortLabelA]={}; }
    
//  portsB[cellPortLabelB][cellPortLabelA][treeId]["active"] = "Y"
//  cellB = 'C1'; portB = 1; cellA = 'C2'; portA = 3;
    var cellPortB = { CellPort:{ cellName:uiCellName(cellB), portNum:portB}};
    var cellPortA = { CellPort:{ cellName:uiCellName(cellA), portNum:portA}};
    var payload = { cellPortB, tree:{ treeName:uiCellName(treeId) } };
//  this.opHistory.append("['rtAdd', ('{}', {}), {}]".format(uiCellName(cellB),portB,uiCellName(treeId)))
    this.generateMessage({ op:"rtAdd", payload:payload })
  };   
  generateMessage(json_obj) {
//  this.opHistory.append("['op':'cellAdd', ('{}', {}, {})]".format(uiCellName(newCell), x, y))
    json_obj['messageId'] = this.messageId;
    this.messageId = this.messageId + 1;
    this.opHistory.push(json_obj);
    this.printMessages();
  }
  printMessages(){ for(const message of this.opHistory){ console.log( message); } };
}
module.exports.GlobalView = GlobalView;  