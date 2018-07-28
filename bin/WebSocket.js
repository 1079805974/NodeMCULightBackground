const WebSocket = require('ws');
const {nodemcuSocket,nodemcuSocket2} = require('./LampServer')
const server = require('./www')
const webSocketServer = new WebSocket.Server({server:server, path:'/socket'});

webSocketServer.broadcast = data =>
    webSocketServer.clients.forEach(client =>{
            if (client.readyState === WebSocket.OPEN)
                client.send(data)
        }
)

webSocketServer.on('connection', function connection(webSocket) {
    webSocket.on('message', function incoming(message) {
        consoel.log(new Date().toString+' 网页传来消息: '+message)
        //把传来的消息发给第一个NodeMCU
        nodemcuSocket.write(message)
    });
});

module.exports = wss