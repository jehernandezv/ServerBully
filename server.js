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
var give = 1;
var leader = '';
var isLeader = 0;
var timeAlive = Math.floor(Math.random() * (5000 - 1000) + 1000);
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

        listNodes.forEach(element => {
            if (element.url == host && element.leader == 1) {
                //soy el lider?
                isLeader = 1;
            } else if (element.leader == 1) {
                //quien es el lider?
                leader = element.url;
                console.log('el lider es: ' + leader);
            }

            if(element.url == host){
                valueNode = element.value
            }
        });
    }).catch((error) => {
        console.log(error);
    });
});


app.post('/updateList', function (req, res, next) {
    var data = req.body;
    console.log('update list: ' + data.list);
    listNodes = JSON.parse(data.list);
    //validar si soy el lider o quien es
    listNodes.forEach(element => {
        if (element.url == host && element.leader == 1) {
            //soy el lider?
            isLeader = 1;
        } else if (element.leader == 1) {
            //quien es el lider?
            leader = element.url;
            console.log('el lider es: ' + leader);
        }

        if(element.url == host){
            valueNode = element.value
        }
    });
    res.json({
        message: 'Recibi update'
    });
});

app.get('/alive', function (req, res) {
    res.json({
        give: give
    });
});


function latido() {
    console.log('value: ' + valueNode);
    if(isLeader != 1){
            axios.get(leader + '/alive')
                .then((response) => {
                    console.log('¿QUIERE SEGUIR? ' + response.data.give);
                    timeAlive = Math.floor(Math.random() * (5000 - 1000) + 1000);
                })
                .catch((error) => {
                   console.log(error);
                });
        }
}
setInterval(latido, timeAlive);