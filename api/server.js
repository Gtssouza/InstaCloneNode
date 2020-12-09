var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    multiparty = require('connect-multiparty'),
    objectId = require('mongodb').ObjectID,
    fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());

app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","content-type");
    res.setHeader("Access-Control-Allow-Credentials",true);
    next();
});

var port = 8083;

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

    //res.setHeader("Access-Control-Allow-Origin","*");

    //var dados = req.body;
    //res.send(dados);
    //console.log(req.files);

    var date = new Date();
    time_stamp = date.getTime();

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;

    

    fs.rename(path_origem, path_destino, function(err, result){
        if(err){
            res.status(500).json({error: err});
            return;
        }

        var dados ={
            url_imagem: url_imagem,
            titulo:req.body.titulo
        }

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

    
});

//------------------------GET-------------------------
app.get('/api', function(req, res){

    //res.setHeader("Access-Control-Allow-Origin","*");

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
                { $push : {
                    comentarios:{
                        id_comentario:new objectId(),
                        comentario:req.body.comentario
                    }
                }},
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

//------------------------Rota uploads-------------------------
app.get('/imagens/:imagem', function(req, res){
    var img = req.params.imagem;

    fs.readFile('./uploads/' + img, function(err, content){
        if(err){
            res.status(400).json({ err });
            return;
        }

        res.writeHead(200, { 'content-type' : 'image/jpg' });
        res.end(content);

    });
});