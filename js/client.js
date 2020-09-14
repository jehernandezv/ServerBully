var hostSocket = io('http://localhost:7000');

document.getElementById('btn_give').addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('give');
    hostSocket.emit('give');
    //aqui codigo para tabla en la vista de que ya no quiere ser lider
});