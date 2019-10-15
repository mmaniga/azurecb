var curl = require('curlrequest');

const lineReader = require('line-reader');
const connectionURLLocalHost = 'http://localhost:8030/publish/';
const connectionURLRemote = 'http://demo-akscb-ingress.eastus.cloudapp.azure.com/publish/';

lineReader.eachLine('./userNames.csv', function(userName) {

    let connectionURL=connectionURLRemote+userName;
    curl.request({ url: connectionURL}, function (err, stdout, meta) {
        console.log('%s %s \n', meta.cmd, connectionURL);
    });
});
