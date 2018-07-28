var net = require('net')
const webSocketServer = require('./WebSocket');

var HOST = '0.0.0.0'
var PORT = 10086
var nodemcuSocket = null, nodemcuSocket2 = null
net.createServer(function (socket) {
    if(nodemcuSocket == null){
        nodemcuSocket = socket
        console.log('第一个NodeMCU连接!')
        nodemcuSocket.on('data', function (data) {
            //第一个NodeMCU的消息传送给每个打开的网页.
            webSocketServer.broadcast(data)
        });
    }else{
        console.log('第二个NodeMCU连接!')
        nodemcuSocket2 = socket
        nodemcuSocket2.on('data', function (data) {
            
        });
    }
    console.log('CONNECTED: ' +
        socket.remoteAddress + ':' + socket.remotePort)



    socket.on('close', function (data) {
        console.log('CLOSED: ' +
            socket.remoteAddress + ' ' + socket.remotePort)
    });

}).listen(PORT, HOST);

module.exports = {nodemcuSocket, nodemcuSocket2}
