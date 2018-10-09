var redis = require("redis"),
    client = redis.createClient({host:'localhost', port:6379, db:0})

client.on("error", function (err) {
    console.log("Error " + err);
});

kafkaServer = '192.168.1.81'

var Kafka = require('node-rdkafka');

let brokers = kafkaServer + ':9092';

let topic = 'multicell-ui-raw';

// STUFF FROM SLATER: users, login,  generateMessage  // all just psuedocode

let users={};
function login(user){
  if(users[user.id]==undefined){
    users[user.id]={};
    users[user.id].socket=new Socket(blahblah);
    users[user.id].socket.send(this.opHistory);
    users[user.id].ptr=this.opHistory.length;
  }
  else{
    users[user.id].socket=new Socket(blahblah);
    users[user.id].socket.send(this.opHistory.slice(users[user.id].ptr);
    users[user.id].ptr=this.opHistory.length;
  }
}

GlobalView = class  {
    constructor() {
        this.cellPorts = {}
        this.cellPortLinks = {}
        this.fromParentPortTree = {}
        this.toChildPortTree = {}
        this.linkTrees = {}
        this.opHistory = []
        this.messageId = 0
    }
    
    generateMessage(json_data){ 
      users.map((user)=>{
        user.socket.send([json_data]);
        this.opHistory.push(json_data);
        user.ptr=this.opHistory.length;
      }
    }

    addCell(cellID,__,pos=position(cellID)) {
        this.cellPorts[cellID] = {}
        this.generateMessage({ op :"cellAdd", payload :{ cellName:uiCellName(cellID), row:pos.x, col:pos.y } })
    }

    helloLink(cellA, portA, cellB, portB) {
        var cellPortLabelA = cellA + "#" + portA
        var cellPortLabelB = cellB + "#" + portB
   
        this.addCell(cellA)
        this.addCell(cellB)
           var ports = this.cellPorts[cellA]

        if ( ports[cellPortLabelA] == undefined ) {
            ports[cellPortLabelA] = {}
        }    
        if ( ports[cellPortLabelB] == undefined ) {
            ports[cellPortLabelB] = {}
        }
        
        var cellPortA = { CellPort: { cellName:uiCellName(cellA), portNum:portA}}
        var cellPortB = { CellPort: { cellName:uiCellName(cellB), portNum:portB}}
    
        var payload = [cellPortA, cellPortB]
        if ( this.cellPortLinks[cellPortLabelA] == undefined ) {
            this.cellPortLinks[cellPortLabelA] = cellPortLabelB
            this.cellPortLinks[cellPortLabelB] = cellPortLabelA
        
            var json_data = { op:"linkAdd", payload:payload}
            this.generateMessage( json_data)
        }    
        else {
        //            json_data = dict(op="linkAdd", payload=payload, is_reversed = "Y")
        //            self.generateMessage( json_data)
        }
    }

    discover(cellA, portA, cellB, portB, treeId, hops) {
        console.log( "discover :  cellA " +  cellA + " portA " + portA + " cellB " + cellB + ' portB ' + portB + ' treeId ' + treeId)
        var cellPortLabelA = cellA + "#" + portA;
        var cellPortLabelB = cellB + "#" + portB;
        console.log( "cellB " + cellB);
        if ( this.cellPorts == undefined ) { console.log( 'undefined this.cellPorts)')};
        console.log( "cellPorts " + this.cellPorts);
        
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

const consumer = new Kafka.KafkaConsumer(
    {
        'group.id': 'my-app-name',
        'metadata.broker.list': brokers,
        'enable.auto.commit': false, // don't commit my offset
    }, {
        'auto.offset.reset': 'earliest' // consume from the start
    }
);

gv = new GlobalView();

consumer.connect();

// READING FROM KAFKA - from Alan

consumer
  .on('ready', function() {
    console.log('connected');
    consumer.subscribe([topic]);
    consumer.consume();
  })
  .on('data', function(data) {
    // Output the actual message contents
    var obj = JSON.parse(data.value.toString());
//    console.log(data.value.toString());
    payload = obj.payload
    //console.log( obj.header);
    if (payload.header.function == 'process_hello_msg') {
    //   console.log( obj.header);
       process_hello_msg( payload, blueprint); 
    } else if ( payload.header.function == 'process_discover_msg') {
            // console.log( record["header"]["function"])
      process_discover_msg(payload, blueprint)
    } else if ( payload.header.function == 'process_discoverd_msg') {
            // console.log( record["header"]["function"])
        process_discoverd_msg(payload, blueprint)
    }        
  });

function uiCellName( cellName) {
    return cellName.substring( 2, 10)
}

function position( cellName) {
    x = ( uiCellName( cellName)) % 5;
    y = Math.trunc( uiCellName( cellName) / 5);
    return {x:x, y:y}
}  
  
blueprint={}


  
function process_discover_msg(record, blueprint) {
//    print( process_discover_msg, record)
    my_cell_name = record['body']['cell_id']['name']
    my_cell_port_no = record['body']['port_no']
    my_cell_port_full_name = my_cell_name + '#' + my_cell_port_no

//    other_cell_port_full_name = blueprint[my_cell_port_full_name]
    if ( my_cell_port_full_name in blueprint) {
        other_cell_port_full_name = blueprint[my_cell_port_full_name]
    } else {
//        print( my_cell_port_full_name)
        other_cell_port_full_name = None
    }
    
    other_cell_name = other_cell_port_full_name.split('#')[0]
    other_cell_port_no = other_cell_port_full_name.split('#')[1]

    tree_uuid = record['body']['msg']['payload']['tree_id']['uuid']['uuid']
    tree_name = record['body']['msg']['payload']['tree_id']['name']

    hops = record['body']['msg']['payload']['hops']
    //    print( "tree_name : ", tree_name, " my_cell_port_full_name : " , my_cell_port_full_name, " other_cell_port_full_name : ", other_cell_port_full_name)

    gv.discover( other_cell_name, other_cell_port_no, my_cell_name, my_cell_port_no, tree_name, hops)
}



function process_discoverd_msg(record, blueprint) {
    sender_cell_name = record['body']['cell_id']['name']
    sender_cell_port_no = record['body']['port_no']
    sender_cell_port_full_name = sender_cell_name + '#' + sender_cell_port_no

    receiver_cell_port_full_name = blueprint[sender_cell_port_full_name]
    receiver_cell_name = receiver_cell_port_full_name.split('#')[0]
    receiver_cell_port_no = receiver_cell_port_full_name.split('#')[1]
    tree_uuid = record['body']['msg']['payload']['tree_id']['uuid']['uuid']
    tree_name = record['body']['msg']['payload']['tree_id']['name']
    if ( tree_name == 'C:2') {
        console.log("DISCOVERD", "tree_name : ", tree_name, " receiver_cell_port_full_name : ", receiver_cell_port_full_name,
              " sender_cell_port_full_name : ", sender_cell_port_full_name)
    }    
    gv.discoverD( sender_cell_name, sender_cell_port_no, receiver_cell_name, receiver_cell_port_no, tree_name)
}

function process_hello_msg( record, blueprint) {
//   console.log( record);
    
    receiver_cell_name = record['body']['cell_id']['name']
    receiver_cell_uuid = record['body']['cell_id']['uuid']['uuid']
    receiver_cell_port_no = record['body']['recv_port_no']
    receiver_cell_port_full_name = receiver_cell_name + '#' + receiver_cell_port_no
    sender_cell_name = record['body']['msg']['payload']['cell_id']['name']
    sender_cell_uuid = record['body']['msg']['payload']['cell_id']['uuid']['uuid']
    sender_cell_port_no = record['body']['msg']['payload']['port_no']
    sender_cell_port_full_name = sender_cell_name + '#' + sender_cell_port_no
//    print( "sender_cell_name :", sender_cell_name)
//    #    print( "sender_cell_uuid :", sender_cell_uuid)
    blueprint[receiver_cell_port_full_name] = sender_cell_port_full_name
    blueprint[sender_cell_port_full_name] = receiver_cell_port_full_name
    
    gv.addCell(receiver_cell_name)
    gv.addCell(sender_cell_name)
    gv.helloLink(receiver_cell_name, receiver_cell_port_no, sender_cell_name, sender_cell_port_no)
    return blueprint
}