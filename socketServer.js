var ws    = require('ws'),
    redis = require('redis');
express = require('express');
uuidv4 = require('uuid/v4')
bodyParser = require('body-parser');
http = require('http');
app = express();
expressWs = require('express-ws')(app);



var nodeport = 8030; //process.argv[2];
console.log(nodeport);


/*

Start the WebSocket client and send message like this
Use Chrome WebSocket extension to test
Connection URL ws://localhost:8080

To connect using command line
wscat -c ws://localhost:8030

Message Format:

Command|ClientID|Message
Connect|Mani|Hi

The Name is used to associate with the WebSocket
Message is the message delivered

*/


var db = redis.createClient({
    host: "redis-server", //'redis-server',
    port: 6379
})

const publisher = redis.createClient({
    host: "redis-server", //'redis-server',
    port: 6379
})


/*

Publish message in the following manner
redis-cli
127.0.0.1:6379> PUBLISH cloudbroker "Jo>Simple message to Jo"

The channel name is channel name is cloudbroker
The Message Format
Name>Message
Name : The WebSocket connection to send
Message: Message to send

*/

db.on('message', function(channel, message) {
    console.log('From PubSub System : ' + message)
    switch (channel) {
        case 'cloudbroker':
            var a = message.split('>');
            var socket = sockets[a[0]];
            console.log(a[0]);
            var m = a[1];
            if (socket != undefined)
            {
                socket.send(m);
            }
            break;
        default:
            var socket = sockets[channel];
            console.log('Sending Message to '+channel);
            if (socket != undefined)
            {
                socket.send(message);
            }
            else {
                console.log(channel + ": Not Found in this server")
            }
    }
});

db.subscribe('cloudbroker'); // Generic channel, it would be the serverID in real implementation
console.log('listening at ws://localhost:'+nodeport );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});

/*
 To test vis CURL do the following

curl --header "Content-Type: application/json"   --request POST   --dattest.json http://localhost:8030/callbackCS

 data.json is like this

{
  "connectionID": "Mani",
  "messageID": "#82b92c",
  "functionName": "getSession"
}

 */

app.post('/callbackCS',function (request, response) {
    console.log("callbackCS Invoked")
    var clientConnecionID = request.body.connectionID;

    console.log("CloudBroker sending message to Connection Server : " + clientConnecionID);
    console.table(request.body);
    publisher.publish(clientConnecionID,JSON.stringify(request.body))
    response.end("Callback Response socket server");

});

//var wsServer = new ws.Server({port: nodeport});
var sockets = {};

app.ws('/connect',function (wsServer, req) {
    wsServer.on('message', function(message) {
        var a = message.split('|');
        if (a.length >= 2) {
            var command = a[0];
            var clientID = a[1];
            console.log('received message from ' + clientID);
            switch (command) {
                case "Connect":
                    sockets[clientID] = wsServer;
                    db.subscribe(clientID);
                    break;
                case "Disconnect":
                    delete socket[clientID];
                    db.unsubscribe(clientID);
                    break;
                default:
                    break;
            }
        }
    });
});



app.listen(nodeport,() => {
    console.log('server is listening on PORT'+ nodeport);
})