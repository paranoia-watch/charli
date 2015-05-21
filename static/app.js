var socket = io()

socket.on('info', function (data) {
	console.log(data)
})

socket.on('update', function (data) {
	document.getElementById("section").innerHTML = data;
})
