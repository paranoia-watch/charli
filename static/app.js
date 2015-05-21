var socket = io()

socket.on('info', function (data) {
	console.log(data)
})
