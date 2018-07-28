var net = require('net')
const webs = require('./WebSocket');

var HOST = '0.0.0.0'
var PORT = 10086
var socket1,socket2
net.createServer(function (socket) {
    if(socket1 == null){
        socket1 = socket
        console.log('第一个NodeMCU连接!')
        //当网页来消息时候发给第一个nodemcu
        webs.addMessageListener(function(message){
            socket.write(message)
        })
        socket.on('data', function (data) {
            //第一个NodeMCU的消息传送给每个打开的网页.
            webs.broadcast(data.toString())
        });

    }else{
        console.log('第二个NodeMCU连接!')
        socket2 = socket
        socket.on('data', function (data) {
                
        });
    }
    console.log('CONNECTED: ' +
        socket.remoteAddress + ':' + socket.remotePort)



    socket.on('close', function (data) {
        console.log('CLOSED: ' +
            socket.remoteAddress + ' ' + socket.remotePort)
    });

}).listen(PORT, HOST);
