var hostSocket = io('http://localhost:7000');
var isLeader = 0;
document.getElementById('btn_give').addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('give');
    hostSocket.emit('give');
    //aqui codigo para tabla en la vista de que ya no quiere ser lider
});

//notificar a ala vista que entre 
hostSocket.on('newConn',(data) => {
    console.log(data);
    isLeader = data.IsLeader;
    var btn_give = document.getElementById('btn_give');
    (isLeader == 0)? btn_give.disabled = true : btn_give.disabled = false;
    renderTable(data);
});

//aviso a la vista que no quiero ser lider en caso de no ser lider
hostSocket.on('give',(data) => {
    console.log('ya no quiero ser lider'+ data.Host);
    renderTable(data);
});

//actualizar vista cada que se haga un update
hostSocket.on('updateList', (data) =>{
    isLeader = data.IsLeader;
    var btn_give = document.getElementById('btn_give');
    (isLeader == 0)? btn_give.disabled = true : btn_give.disabled = false;
    console.log(data.updateList);
});

//envio a ala vista que entro a participar
hostSocket.on('participate', (data) =>{
    console.log(data);
    renderTable(data);
});

 //envio a ala vista que no entro a participar
 hostSocket.on('Notparticipate', (data) =>{
    console.log(data);
    renderTable(data);
});

//vista para si quiero seguir siendo lider
hostSocket.on('alive', (data) =>{
    console.log(data);
    renderTable(data);
});

 //vista para mostrar que estoy haciendo pulsaciones
 hostSocket.on('pulsation', (data) =>{
    console.log(data);
    renderTable(data);
});

//vista cuando detecto que el lider ya no quiere ser lider
hostSocket.on('Nodetected', (data) =>{
    console.log(data);
    renderTable(data);
});

//vista cuando el lider quiere seguir siendo lider
hostSocket.on('detected', (data) =>{
    console.log(data);
    renderTable(data);
});

//vista de eleccion de un nuevo lider
hostSocket.on('choise', (data) =>{
    console.log(data);
    renderTable(data);
});

//vista cuando se elige al nuevo lider
hostSocket.on('newLeader', (data) =>{
    console.log(data);
    renderTable(data);
});

function renderTable(data) {
    var dataSet = [
        {
            host: data.Host,
            value: data.Value,
            isLeader: (data.IsLeader == 0)? 'No' : 'Si',
            Leader: data.Leader,
            action: data.Message
        }
    ];
    var datatable = $('.registryTable').DataTable({
        retrieve: true,
        lengthMenu: [[-1], ["All"]],
        columns: [
            { title: "Host", data: "host" },
            { title: "Valor del host", data: "value" },
            { title: "¿Eres lider?", data: "isLeader" },
            { title: "Lider", data: "Leader" },
            { title: "Acción", data: "action" }
        ]
    });
    datatable.rows.add(dataSet);
    datatable.draw();
}