const fastcsv = require('fast-csv');
const fs = require('fs');
const data = [];
for (var i=0;i<100;i++) {
    var msg = {
        message:
            Math.random().toString(36).substring(7)
    }
        data.push(msg);
}
const ws = fs.createWriteStream("userNames.csv");
fastcsv
    .write(data, { headers: false })
    .pipe(ws);
