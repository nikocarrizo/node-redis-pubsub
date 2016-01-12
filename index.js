var app = require('express')();
var redis = require('redis');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var receiver = redis.createClient();
var publisher = redis.createClient();

app.get('/', function (req, res){
	res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
	console.log('someone connected!');
	socket.on('chat message', function(msg){
		console.log('messge: ' + msg);
		socket.emit('chat message', 'Node server response');	
		io.emit('chat message', msg);
	});
	
	socket.on('disconnect', function(){
		console.log('aww...they left');
	});
	
	//handle the pub/sub from redis
	receiver.subscribe('Livefeed');
	receiver.on('message', function(channel, message)
	{
		io.emit('chat message', 'Message on channel ' + channel + " msg: " + message);
		//reply
		if (message.indexOf('node') > -1)
			publisher.publish('Livefeed', "From nodeJS");
	});
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});