var http = require('http');
var fs = require('fs');

// Loading socket.io
const socketIo = require("socket.io");
const _ = require("lodash");


var { GlobalView } = require('./globalView.js');
let gv = new GlobalView;

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile( './server/getServerStateKafka.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});


var redis = require("redis"),
    client = redis.createClient({host:'172.16.1.102', port:6379, db:0})

client.on("error", function (err) {
    console.log("Error " + err);
});

kafkaServer = '172.16.1.102'
let topic = 'multicell-ui-raw-small1';
//let topic = 'multicell-raw';
//let topic = 'CellAgent';
let brokers = kafkaServer + ':9092';

var Kafka = require('node-rdkafka');
const consumer = new Kafka.KafkaConsumer(
    {
        'group.id': 'my-app-name',
        'metadata.broker.list': brokers,
        'enable.auto.commit': false, // don't commit my offset
    }, {
        'auto.offset.reset': 'earliest' // consume from the start
    }
);

consumer.connect();

consumer
	.on('ready', function() {
		console.log('connected');
		consumer.subscribe([topic]);
		consumer.consume();
	})
	.on('data', function(data) {
		// Output the actual message contents
		var obj = JSON.parse(data.value.toString());
//		console.log(data.value.toString());
		payload = obj.payload
//		console.log( data.value.toString())
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
  
blueprint={}

let myCounter = 0;
const io = socketIo(server);

setInterval(function () {
//     console.log("Increment counter");
//     myCounter++;
//     myArr.push( myCounter);
//     console.log("Increment counter" + JSON.stringify( myArr));
    }, 5000);


io.sockets.on('connection', function (socket, username) {
    socket.on('getFullState', function (message) {
        // The username of the person who clicked is retrieved from the session variables
        console.log(message + ' Server: ' + JSON.stringify({"version":1, "graph":myArr}));
//        socket.emit('replyFullState', JSON.stringify( {"version":Date.now(), "graph":myArr}));
        socket.emit('replyFullState', model.send());
    });


    socket.on('getFullKafkaState', function (message) {
        // The username of the person who clicked is retrieved from the session variables
        console.log(message + ' Server Kafka: ' + JSON.stringify({"version":1, "graph":gv.getMessages()}));
//        socket.emit('replyFullState', JSON.stringify( {"version":Date.now(), "graph":myArr}));
        socket.emit('replyFullState', JSON.stringify(gv.getMessages()));
    });

	setInterval(function () {
//		 console.log("Increment counter");
//		 socket.emit('replyChangeState', myCounter);
		}, 2500);

});


portId = 8060
server.listen( portId, function(){
    console.log('listening on *:' + portId);
});
  
  
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
//    print( "sender_cell_uuid :", sender_cell_uuid)
    blueprint[receiver_cell_port_full_name] = sender_cell_port_full_name
    blueprint[sender_cell_port_full_name] = receiver_cell_port_full_name
    
    gv.addCell(receiver_cell_name)
    gv.addCell(sender_cell_name)
    gv.helloLink(receiver_cell_name, receiver_cell_port_no, sender_cell_name, sender_cell_port_no)
    return blueprint
}
