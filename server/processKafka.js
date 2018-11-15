//const getFormattedTime=()=> (new Date()).toLocaleTimeString();  // not used

var http       = require('http'); // http.createServer; listens on a port
var fs         = require('fs');
const socketIo = require("socket.io");  

var { GlobalView } = require('./globalView.js');
var gv = new GlobalView;
gv.generateMessage({ op:"version", payload:1})

kafkaServer = '172.16.1.2'
//kafkaServer = '192.168.1.81'

var topic = 'multicell-ui-raw-debug-2';
topic = 'multicell-ui-raw-10-node_2';

topic = 'multicell-ui-10-nodes-mongo-1';
topic = 'CellAgent';
let brokers = kafkaServer + ':9092';

//To improve performance to read from Kafka topic
rv = Math.floor(Math.random() * 10)

var Kafka = require('node-rdkafka');
const consumer = new Kafka.KafkaConsumer(
    {
        'group.id': 'my-app-name_' + rv,
        'metadata.broker.list': brokers,
        'enable.auto.commit': false, // don't commit my offset
    }, {
//        'auto.offset.reset': 'earliest' // consume from the start
        'auto.offset.reset': 'latest' 
    }
);

consumer.connect();

consumer
        .on('ready', function() {
                console.log('connected');
                consumer.subscribe([topic]);
                consumer.consume();
                date = new Date(),
                datevalues = [
                   date.getFullYear(),
                   date.getMonth()+1,
                   date.getDate(),
                   date.getHours(),
                   date.getMinutes(),
                   date.getSeconds(),
                ];
                console.log(datevalues)
        })
        .on('error', function(err) {
                console.log("error", err);
        })
        .on('data', function(data) {
                date = new Date(),
                datevalues = [
                   date.getFullYear(),
                   date.getMonth()+1,
                   date.getDate(),
                   date.getHours(),
                   date.getMinutes(),
                   date.getSeconds(),
                ];
                console.log(datevalues)
                // Output the actual message contents
                var obj = JSON.parse(data.value.toString());
              console.log(data.value.toString());
//                payload = obj.payload
                payload = obj
//                console.log( JSON.stringify(payload) + "")

//              console.log( data.value.toString())
                //console.log( obj.header);
                if ( payload.header.function == 'MAIN' 
                        && payload.body.schema_version == '0.1' ) {
                    gv = new GlobalView;
//                    gv.generateMessage({ op:"version", payload:1})
                    blueprint = process_init_topology(payload, blueprint)
                }    
                else if ( payload.header.function == 'initialize' 
                        && ( payload.header.format == 'border_cell_start' || payload.header.format == 'interior_cell_start')) {
                    cellLocation[payload["body"]["cell_number"]] = payload.body.location
                }    
                else if (payload.header.function == 'process_hello_msg') {
                //   console.log( obj.header);
                    process_hello_msg( payload, cellLocation, blueprint); 
                } else if ( payload.header.function == 'process_discover_msg') {
                                // console.log( record["header"]["function"])
                    process_discover_msg(payload, blueprint)
                } else if ( payload.header.function == 'process_discoverd_msg') {
                                // console.log( record["header"]["function"])
                    process_discoverd_msg(payload, blueprint)
                }
        });


var server=http.createServer((req,res,__,sendFileContent)=>{ // request,response; only use req.url
  sendFileContent=(fileName,contentType)=>{
    console.log( fileName,contentType)
    fs.readFile(fileName,(err,content)=>{
      if(err){ res.writeHead(404);                                res.write("Not Found!!!!"); }
      else   { res.writeHead(200, {'Content-Type': contentType}); res.write(content     ); console.log( "\n!!!", fileName,content) }
      res.end();
    });
  }
  // ============== routing - we arent currently using this, so is for instructional purposes
  console.log("requested URL is: " + req.url);
  if(req.url === "/"){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('This is the default res. request URL is: ' + req.url); // res.end(); NO!
  }
  else if(req.url === "/index"){
    sendFileContent("index.html", "text/html");
  }
  else if(/^\/[a-zA-Z0-9\/\.\-]*.js$/.test(req.url.toString())){
//  else if(/^.*\.js$/.test(req.url.toString())){
    sendFileContent(req.url.toString().substring(1), "text/javascript");
  }
  else if(/^\/[a-zA-Z0-9\/]*.css$/.test(req.url.toString())){
    sendFileContent(req.url.toString().substring(1), "text/css");
  }
  else{
    console.log("requested URL is: " + req.url);
    res.end();
  }
});

const portId = 8060;  // JJJJJ client side must use this same portID
server.listen(portId,()=> console.log('listening on *:' + portId) ); // what is this cb fn?
const io = socketIo(server);   // now can connect sockets to server

//=================================================== communication between client & model
var { model } = require('../common/aModel.js'); 
io.sockets.on('connection',(socket, username)=>{  // socket is an instance of a connection
   // on: reqFullState
   // emit: fullState, changeState
  console.log(' !!!Server Kafka: ');
  console.log(' Server Kafka: ' + JSON.stringify({"version":1, "graph":gv.getMessages()}));
//  socket.on('reqFullState',(msg)=> socket.emit('fullState', model.send()) );
  socket.emit('fullState', JSON.stringify( gv.getMessages())); 
  model.addObserver((s)=> socket.emit('changeState',s));
});

blueprint={}
cellLocation = {}

function process_init_topology(record, blueprint) {
    nCells = record["body"]["ncells"]
    cols = 5
    if ( "cols" in record["body"]) { 
        cols = record["body"]["cols"]
    }
    rows = 5
    if ( "rows" in record["body"]) { 
        rows = record["body"]["rows"]
    }
    gv.initTopology(nCells, rows, cols)
    return blueprint
}

function process_discover_msg(record, blueprint) {
//  console.log(  process_discover_msg, record)
    my_cell_name = record['body']['cell_id']['name']
    my_cell_port_no = record['body']['port_no']
    my_cell_port_full_name = my_cell_name + '#' + my_cell_port_no

//    other_cell_port_full_name = blueprint[my_cell_port_full_name]
    if ( my_cell_port_full_name in blueprint) {
        other_cell_port_full_name = blueprint[my_cell_port_full_name]
    } else {
//        console.log( my_cell_port_full_name)
        other_cell_port_full_name = None
    }

    other_cell_name = other_cell_port_full_name.split('#')[0]
    other_cell_port_no = other_cell_port_full_name.split('#')[1]

    tree_uuid = record['body']['msg']['payload']['tree_id']['uuid']['uuid']
    tree_name = record['body']['msg']['payload']['tree_id']['name']

    hops = record['body']['msg']['payload']['hops']
    //    console.log( "tree_name : ", tree_name, " my_cell_port_full_name : " , my_cell_port_full_name, " other_cell_port_full_name : ", other_cell_port_full_name)

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

function process_hello_msg( record, cellLocation, blueprint) {
//   console.log( record);

    receiver_cell_name = record['body']['cell_id']['name']
    receiver_cell_uuid = record['body']['cell_id']['uuid']['uuid']
    receiver_cell_port_no = record['body']['recv_port_no']
    receiver_cell_port_full_name = receiver_cell_name + '#' + receiver_cell_port_no
    sender_cell_name = record['body']['msg']['payload']['cell_id']['name']
    sender_cell_uuid = record['body']['msg']['payload']['cell_id']['uuid']['uuid']
    sender_cell_port_no = record['body']['msg']['payload']['port_no']
    sender_cell_port_full_name = sender_cell_name + '#' + sender_cell_port_no
//    print( "sender_cell_uuid :", sender_cell_uuid)
    blueprint[receiver_cell_port_full_name] = sender_cell_port_full_name
    blueprint[sender_cell_port_full_name] = receiver_cell_port_full_name

    gv.addCell(receiver_cell_name, cellLocation)
    gv.addCell(sender_cell_name, cellLocation)
    gv.helloLink(receiver_cell_name, receiver_cell_port_no, sender_cell_name, sender_cell_port_no)
    return blueprint
}


