var listNodes = [];
var socketslist = [];
var HostSocket = io('http://localhost:4000');
var isLeader = 0;
var id_socket = '';
var leader = '';
var valueNode = Math.floor(Math.random() * (100 - 1) + 1);
var give = 0; //0 : no ceder / 1 : no quiero ser lider
var timerAlive = Math.floor(Math.random() * (5000 - 1000) + 1000);


HostSocket.on('connection',async node => {
    console.log('Nueva conexión:', node.handshake.headers.origin);
    node.join('nodes');
    nodes = socket.sockets.adapter.rooms['nodes'];
});


//llega la lista de nodos conectados
HostSocket.on('res:list', function (list) {
    id_socket = HostSocket.id;
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

        if(element.id_socket != id_socket){
            //llenamos sockets
           //socketslist.push(io(element));
        }

    });
});

//metodo que evalua si se cedio ser el lider


setInterval(() => {
    if (isLeader != 1) {
        HostSocket.emit('alive');
    }
}, timerAlive);
