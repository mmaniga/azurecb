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
            url: "http://host.docker.internal:8030/callbackCS",
            body: JSON.stringify(req.body)
        },
        function(error, response, body){
        console.log(body);
        res.send(body);
    });
});

app.listen(nodeport,() => {
    console.log('server is listening on PORT '+ nodeport);
})