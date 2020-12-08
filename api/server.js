var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    multiparty = require('connect-multiparty'),
    objectId = require('mongodb').ObjectID;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());

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

//------------------------POST-------------------------
app.post('/api', function(req, res){

    res.setHeader("Acess-Control-Allow-Origin","*")

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

//------------------------GET-------------------------
app.get('/api', function(req, res){

    conn.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find().toArray(function(err, results){
                if(err){
                    res.json(err)
                }else{
                    res.json(results)
                }

                mongoclient.close();
            });
        });
    });
});

//------------------------GET BY ID-------------------------
app.get('/api/:id', function(req, res){

    conn.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find(objectId(req.params.id)).toArray(function(err, results){
                if(err){
                    res.json(err)
                }else{
                    res.json(results)
                }

                mongoclient.close();
            });
        });
    });
});

//------------------------PUT BY ID-------------------------
app.put('/api/:id', function(req, res){

    conn.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.update(
                {_id : objectId(req.params.id)},
                { $set : {titulo: req.body.titulo}},
                {},
                function(err, records){
                    if(err){
                        res.json(err)
                    }else{
                        res.json(records)
                    }
                    mongoclient.close();
                }
            );     
            });
        });
    });

//------------------------DELETE BY ID-------------------------
app.delete('/api/:id', function(req, res){

    conn.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.remove(
                {_id : objectId(req.params.id)},
                
                function(err, records){
                    if(err){
                        res.json(err)
                    }else{
                        res.json(records)
                    }
                    mongoclient.close();
                }
            );     
            });
        });
    });
