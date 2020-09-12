const express = require('express');
const io = require('socket.io');
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');
const port = process.argv[2];

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const server = app.listen(port, () => {
    console.log('Escuchando en el puerto node client: ' + port);
});

var valueNode = Math.floor(Math.random() * (100 - 1) + 1);
var listNodes = [];
var give = 0;
var host = 'http://localhost:' + port;
let hostSocket = io(server);

hostSocket.on('connection', node => {
    console.log('Nueva conexión:', node.id);
    axios.post('http://localhost:4000/newConn', {
        value: valueNode,
        url: 'http://localhost:' + port
    }).then((response) => {
        console.log('new node: ' + response.data.list);
        listNodes = JSON.parse(response.data.list);
    }).catch((error) => {
        console.log(error);
    });
});


app.post('/updateList', function (req, res, next) {
    var data = req.body;
    console.log('update list: ' + data.list);
    listNodes = JSON.parse(data.list);
    //validar si soy el lider o quien es

    res.json({
        message: 'Recibi update'
    });
});

app.get('/alive', function (req, res, next) {
    console.log("ENTRO");
    res.json({
        leader: give
    });
});

function latido() {
    listNodes.forEach(element => {
        if (host == element.url && element.leader == 1) {
            console.log("SOY EL LIDER: " + element.url + " que es igual a " + host + " numero " + element.leader);
        } else if (element.leader == 1) {
            console.log("EL LIDER ES: " + element.url);
            axios.get(element.url + '/alive', {})
                .then((response) => {
                    console.log('¿QUIERE SEGUIR? ' + response.leader);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });

}
setInterval(latido, 4000);
/*
//llega la lista de nodos conectados
hostSocket.on('res:list', function (list) {
    console.log(list.list);
    id_socket = hostSocket.id;
    //hacemos la lista que llega igual a la del nodo
    listNodes = JSON.parse(list.list);
    //recorremos la lista verificando que seamos el lider y si no quien es el lider
    listNodes.forEach(element => {
        if (element.id_socket == id_socket && element.leader == 1) {
            //soy el lider?
            isLeader = 1;
        } else if (element.leader == 1) {
            //quien es el lider?
            leader = element.url;
            console.log('el lider es: ' + leader);
        }
    });

});*/