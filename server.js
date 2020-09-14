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
var leader = '';
var isLeader = 0;
var interval;
var give = 1;
var recivedMax = 0;
var timeAlive = timeRandom();
var host = 'http://localhost:' + port;
let hostSocket = io(server);

hostSocket.on('connection', node => {
    console.log('Nueva conexión:', node.id);

    //botton ya no quiero ser lider
    node.on('give', () => {
        console.log('Ya no quiero ser lider');
        isLeader = 0;
        give = 0;
    });

    axios.post('http://localhost:4000/newConn', {
        value: valueNode,
        url: 'http://localhost:' + port
    }).then((response) => {
        console.log('new node: ' + response.data.list);
        listNodes = JSON.parse(response.data.list);
        leader = '';
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
    leader = '';
    listNodes.forEach(element => {
        if (element.url == host && element.leader == 1) {
            //soy el lider?
            isLeader = 1;
        } else if (element.leader == 1) {
            //quien es el lider?
            leader = element.url;
            isLeader = 0;
            console.log('el lider es: ' + leader);
        }

        if(element.url == host){
            valueNode = element.value
        }
    });
    res.json({
        message: 'Recibi update'
    });
    give = 1;
    interval = setInterval(latido, timeAlive);
});

app.post('/choise',function (req, res, next) {
    console.log(req.body);
    //parando las pulsaciones
    clearInterval(interval);
    //Evaluo si entro en la eleccion
    if(req.body.value < valueNode){
        console.log('entro en la elección');
    res.json({
        url:host,
        value:valueNode
    });
  }else{
    console.log('no responden por valor inferior');
  }
});

app.get('/alive', function (req, res) {
    res.json({
        give: give
    });
});

interval = setInterval(latido, timeAlive);

async function latido() {
    console.log('timeRandom: ' + timeAlive);
    if(isLeader == 0){
            await axios.get(leader + '/alive')
                .then((response) => {
                    console.log('¿QUIERE SEGUIR? ' + response.data.give);
                    if(response.data.give == 1){
                        timeAlive = timeRandom();
                    }else{
                        console.log('nueva eleccion, yo paro mi pulsación');
                        clearInterval(interval);
                        election();
                    }
                })
                .catch((error) => {
                   console.log(error.code);
                   clearInterval(interval);
                });
        }
}

function election(){
    recivedMax = 0;
    listNodes.forEach(element => {
        if(element.url != host && element.url != leader){
            axios.post(element.url+'/choise', {
                value: valueNode,
                url:host
            })
            .then((response) => {
                console.log('llegan los nodos en elección');
                console.log(response.data);
                recivedMax = 1;
                //metodo para elegir max
                if(response.data.value == getMaxNode()){
                    isLeader = 0;
                    console.log('if de max node: ' + response.data.value);
                    axios.post('http://localhost:4000/newLeader',{
                             newLeader: response.data.url
                        }).then((response) => {
                            console.log(response.data.message);
                        }).catch((error) => {
                             console.log(error.code);
                        });
                    }
            })
            .catch((error) => {
                console.log(error.code);
                console.log('no responden por valor inferior');
            })
        }
    });
    if(recivedMax == 0 && valueNode == getMaxNode()){
        console.log('detecto la caida y soy el lider');
        axios.post('http://localhost:4000/newLeader',{
            newLeader: host
        }).then((response) => {
            console.log(response.data.message);
        }).catch((error) => {
            console.log(error.code);
        });

        //aviso que soy el nuevo lider
        /*listNodes.forEach(element => {
            axios.post(element.url)
        });*/
    }
}

function getMaxNode(){
    var max = 0;
    listNodes.forEach(element => {
        if(max < element.value && element.url != leader){
            max = element.value;
        }
    });
    return max;
}

function timeRandom(){
    return Math.floor(Math.random() * (10000 - 1000) + 1000);
}
