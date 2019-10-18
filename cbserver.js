var
express = require('express');
uuidv4 = require('uuid/v4')
bodyParser = require('body-parser');
http = require('http');
app = express();

var nodeport = 8040; //process.argv[2];


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log('middleware of CBServer');
    req.testing = 'testing';
    return next();
});

/*
 To test vis CURL do the following

curl --header "Content-Type: application/json"   --request POST   --data  @test.json http://localhost:8040/xmlapi

 data.json is like this

{
  "connectionID": "Mani",
  "messageID": "#82b92c",
  "functionName": "getSession"
}

 */

app.post('/xmlapi',(req,res) => {

    console.log("receiving XmlAPI Request")
    console.log(req.body);
    var request = require('request');
    request.post(
        {
            headers: {'content-type' : 'application/json'},
            url: "http://azure-cloudbroker-oct.eastus.cloudapp.azure.com/callbackCS",
            body: JSON.stringify(req.body)
        },
        function(error, response, body){
            console.log('In Callback of xmlapi');
            res.status(200);
            res.send("xmlapi a Test Error : "+error+ "  " );
            res.end();
        });
    /*
    var options = {
        host: 'socket-server',
        path: '/callbackCS',
        port: '8030',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    callback = function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });
        response.on('error', function () {
            console.log("--- ERROR ----");
            console.log(str);
            res.send(str);
        })
    }

    var requestPost = http.request(options, callback);
    console.table(req.body);
    requestPost.write(JSON.stringify(req.body));
    requestPost.end();
    //res.send("YES");
    res.end();



     */
/*
    var postData = JSON.stringify(req.body)

    var options = {
        hostname: 'socket-server',
        port: 8030,
        path: '/callbackCS',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (e) => {
        console.error(e);
        res.send(e);
        //res.end();
    });

    req.write(postData);
    req.end();
    //res.send(200);
    res.end();
*/


});

app.listen(nodeport,() => {
    console.log('server is listening on PORT '+ nodeport);
})