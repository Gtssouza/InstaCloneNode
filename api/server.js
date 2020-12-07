var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 8882;

app.listen(port);

var conn = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

console.log('O servidor http esta escutando na porta:' + port);

app.get('/', function(req, res){
    res.send({
        msg:'Ola'
    });
})

app.post('/api', function(req, res){
    var dados = req.body;
    res.send(dados);

    conn.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.insert(dados, function(err, records){
                if(err){
                    res.json(err)
                }else{
                    res.json(records)
                }
                mongoclient.close();
            });
        });
    });
});