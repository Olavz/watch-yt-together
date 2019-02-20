var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = [];

var status = {
    users : 0,
    youTubeId: 'asdf',
    seekTimestamp: 0.0,
    playing: false
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    clients.push(socket);
    updateOnChange();

    if(status.playing) {
        // Connected while something is playing.
        askFirstAboutTime(socket);
    }

    socket.on('play', function(message){
        status.playing = true;
        io.emit('play');
    });
    socket.on('pause', function(message){
        status.playing = false;
        io.emit('pause');
    });
    socket.on('queue', function(message){
        // TODO: Server needs to keep track of in case of retry / new user.
        io.emit('queue', message);
    });
    socket.on('answer_time', function(message){
        // TODO...
    });
    socket.on('seek', function(timestamp){
        // Do some threshold handling. No need to go gunz blazing here :(
        console.log(timestamp);
        status.seekTimestamp = timestamp;
        io.emit('seek', timestamp);
        updateOnChange();
    });
    socket.on('direct', function(youtubeId){
        status.youTubeId = youtubeId;
        io.emit('direct', youtubeId);
    });

    socket.on('disconnect', function(){
        clients.splice(clients.indexOf(socket), 1);
        updateOnChange();
    });
    
});

function askFirstAboutTime(socket) {
    if(clients[0] == socket) {
        console.log("Dont ask your self.!?");
    } else {
        clients[0].emit('ask_time', socket.id);
    }

}

function updateOnChange() {
    status.users = clients.length
    io.emit("work", status);
}


http.listen(3000, function(){
  console.log('listening on *:3000');
});