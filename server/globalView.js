const uiCellName=(cellName)=> cellName.substring( 2, 10);
const position  =(cellName)=> ({ x:uiCellName(cellName)%5, y:Math.trunc(uiCellName(cellName)/5) });
GlobalView = class  {
    constructor() {
        this.nCells = 0
        this.rows = 0
        this.cols = 0

        this.cellPorts = {}
        this.cellPortLinks = {}
        this.opHistory = []
        this.messageId = 0
        
//        this.fromParentPortTree = {}
//        this.toChildPortTree = {}
//        this.linkTrees = {}
    }
    
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
  }        
  
	getMessages() {
    	return this.opHistory;
    }

    generateMessage( json_data) {
		json_obj['messageId'] = this.messageId
        this.messageId = this.messageId + 1
        this.opHistory.append( json_obj)
        console.log( json_obj)

    }

    initGeometry(nCells, rows, cols){
        this.nCells = nCells
        this.rows = rows
        this.cols = cols
        this.generateMessage( { op : "initTopology", payload : { num_cells : nCells, rows : rows, cols:cols}})
    }
	
    addCell( newCell, location) {
        console.log( "addCell newCell start" + newCell);
        console.log( location)
        this.cellPorts[newCell] = {}
        var pos = position( newCell)
        var cellId = uiCellName( newCell)
        console.log( 'addCell cellId ' + cellId)
        console.log( 'addCell location ' + location)
        var payload = { cellName : cellId,
                        row : location[cellId][0],
                        col : location[cellId][1]
                   }
        var json_data = { op : "cellAdd",
                      payload : payload
                    }
        this.generateMessage( json_data)
        console.log("addCell done")
    }

    helloLink(cellA, portA, cellB, portB) {
//        this.addCell(cellA)
//        this.addCell(cellB)
        var ports = this.cellPorts[cellA]

        var cellPortLabelA = cellA + "#" + portA
        var cellPortLabelB = cellB + "#" + portB
        
        if ( ports[cellPortLabelA] == undefined ) {
            ports[cellPortLabelA] = {}
        }    
        if ( ports[cellPortLabelB] == undefined ) {
            ports[cellPortLabelB] = {}
        }
        
        var payload = [ { CellPort: { cellName:uiCellName(cellA), portNum:portA}}, 
        				{ CellPort: { cellName:uiCellName(cellB), portNum:portB}}]

        if ( this.cellPortLinks[cellPortLabelA] == undefined ) {
            this.cellPortLinks[cellPortLabelA] = cellPortLabelB
            this.cellPortLinks[cellPortLabelB] = cellPortLabelA
        
            this.generateMessage( { op:"linkAdd", payload:payload})
        }    
        else {
        //            json_data = dict(op="linkAdd", payload=payload, is_reversed = "Y")
        //            self.generateMessage( json_data)
        }
    }

    discover(cellA, portA, cellB, portB, treeId, hops) {
        console.log( "discover :  cellA " +  cellA + " portA " + portA + " cellB " + cellB + ' portB ' + portB + ' treeId ' + treeId)
        if ( this.cellPorts == undefined ) { 
        	console.log( 'undefined this.cellPorts)')
        };
        console.log( "cellPorts " + this.cellPorts);
        
        var cellPortLabelA = cellA + "#" + portA;
        var cellPortLabelB = cellB + "#" + portB;
        var portsB = this.cellPorts[cellB];
//        console.log( "portsB " + portsB);
//        if ( portsB == undefined ) { console.log( 'undefined portsB)')};
        if ( portsB[cellPortLabelB] == undefined) {
            portsB[cellPortLabelB] = {}
        }    
        if ( portsB[cellPortLabelB][cellPortLabelA] == undefined) {
            portsB[cellPortLabelB][cellPortLabelA] = {}
        }    
        
        portsB[cellPortLabelB][cellPortLabelA][treeId] = {"hops": hops}
        console.log( "this.cellPorts " + portsB[cellPortLabelB][cellPortLabelA][treeId]['hops'] );
    }

    discoverD( cellA, portA, cellB, portB, treeId) {
        console.log( "discoverd :  cellA " +  cellA + " portA " + portA + " cellB " + cellB + ' portB ' + portB + ' treeId ' + treeId)
        var cellPortLabelA = cellA + "#" + portA
        var cellPortLabelB = cellB + "#" + portB
        console.log( "cellB " + cellB);
        if ( this.cellPorts == undefined ) { console.log( 'undefined this.cellPorts)')};
        var portsB = this.cellPorts[cellB]
        if ( portsB[cellPortLabelB] == undefined ) {
            portsB[cellPortLabelB] = {}
        }    
        if ( portsB[cellPortLabelB][cellPortLabelA] == undefined ) {
            portsB[cellPortLabelB][cellPortLabelA] = {}
        }

//        portsB[cellPortLabelB][cellPortLabelA][treeId]["active"] = "Y"
//        console.log( "Complex " + portsB[cellPortLabelB][cellPortLabelA][treeId]  );
//        cellB = 'C1'
//        portB = 1
//        cellA = 'C2'
//        portA = 3

        var cellPortB = { CellPort:{ cellName:uiCellName(cellB), portNum:portB}}
        var cellPortA = { CellPort:{ cellName:uiCellName(cellA), portNum:portA}}

        var payload = { cellPortB, tree:{  treeName : uiCellName( treeId)}}
        var json_data = { op:"rtAdd", payload:payload}
//        this.opHistory.append("['rtAdd', ('{}', {}), {}]".format(uiCellName( cellB), portB, uiCellName( treeId)))
        this.generateMessage( json_data)
    }    


    generateMessage(json_obj) {
//        this.opHistory.append("['op':'cellAdd', ('{}', {}, {})]".format(uiCellName(newCell), x, y))
        json_obj['messageId'] = this.messageId;
        this.messageId = this.messageId + 1;
        this.opHistory.push( json_obj);
//        console.log( json_obj);
        this.printMessages();
     }
     
     printMessages() {
          for ( const message of this.opHistory) { console.log( message);}
     }
}

module.exports.GlobalView = GlobalView;  
