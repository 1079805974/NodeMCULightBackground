const {nodemcuSocket, nodemcuSocket2} = require('./LampServer')
var webSocketServer = require('socket.io')(8080);

webSocketServer.on('connection', function (socket) {
    console.log('connect!')
    socket.on('message', function incoming(message) {
        consoel.log(new Date().toString+' 网页传来消息: '+message)
        //把传来的消息发给第一个NodeMCU
        if(nodemcuSocket!=null)
            nodemcuSocket.write(message)
    });
  socket.on('disconnect', function () { });
});

webSocketServer.broadcast = data =>
    webSocketServer.clients.forEach(client =>{
            if (client.readyState === WebSocket.OPEN)
                client.send(data)
        }
)

console.log('服务器启动成功')

module.exports = webSocketServer