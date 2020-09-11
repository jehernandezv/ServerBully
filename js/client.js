var buttonConn = document.getElementById('btn_conn').addEventListener('click', async (event) => {
    event.preventDefault();
    await axios.get('http://localhost:3000/conn', {responseType: 'json'}).then((response) => {
        console.log(response.data.message);
    });
});



