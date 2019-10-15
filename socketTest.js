const WebSocket = require('ws');

const lineReader = require('line-reader');
const connectionURLLocalHost = 'ws://localhost:8030';
const connectionURLRemote = 'ws://demo-akscb-ingress.eastus.cloudapp.azure.com';

lineReader.eachLine('./userNames.csv', function(userName) {

    let ws = new WebSocket(connectionURLRemote);

    ws.on('open', function open() {
        console.log('socket '+userName+' ... connecting to '+connectionURLRemote);
        ws.send('Connect|'+userName +'|Test');
    });

    ws.on('message', function incoming(data) {
        console.log('Receiving message from Server');
        console.log(data);
    });
});
